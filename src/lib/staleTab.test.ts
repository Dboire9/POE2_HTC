import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * A TAB OLDER THAN THE LIVE SITE.
 *
 * Every asset URL is content-hashed, and the daily price refresh replaces `prices.json` — which renames
 * it, and every chunk that names it. A tab opened before a refresh and asked to solve after it requests
 * files the new deployment no longer has. Seen in the wild on 2026-09-18: a tab opened at 00:10 UTC,
 * the refresh deployed at 06:22, the first Compute at 07:26 failed with
 * `Unexpected token 'T', "The page c"... is not valid JSON` — Vercel's text 404, parsed as the price
 * sheet — and was filed in the issue tracker as a solver crash.
 *
 * Three things are pinned here: the loader names the file it could not get, the client recognises a
 * redeploy and does NOT report it, and a genuine failure on a live build still is reported.
 */

// Vercel's real 404 body, as the live site returns it for a hash that is no longer deployed.
const VERCEL_404 = 'The page could not be found\n\nNOT_FOUND\n\nlhr1::krfhq-1789724020670-1c2d3fc8dc77\n';
const notFound = (): Response => new Response(VERCEL_404, { status: 404, statusText: 'Not Found' });

describe('loadEngine — a missing data file', () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('names the file and the status instead of a JSON parse error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(notFound())));
    const { loadEngine } = await import('./engine.ts');
    const err = await loadEngine().then(() => null, (e: unknown) => e as Error);
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toMatch(/couldn't load the (modifier data|base-item data|price sheet) \(HTTP 404 Not Found\)/);
    expect(err!.message).not.toMatch(/Unexpected token|not valid JSON/);
  });

  /** One dropped request used to poison the page: the rejected promise was memoised forever. */
  it('forgets a failed load, so the next call tries again', async () => {
    const fetcher = vi.fn(() => Promise.resolve(notFound()));
    vi.stubGlobal('fetch', fetcher);
    const { loadEngine } = await import('./engine.ts');
    await loadEngine().catch(() => undefined);
    const firstRound = fetcher.mock.calls.length;
    await loadEngine().catch(() => undefined);
    expect(fetcher.mock.calls.length).toBeGreaterThan(firstRound);
  });
});

describe('servesNewerBuild — has the site moved on under this tab?', () => {
  const page = (src: string | null) => ({
    querySelector: () => (src === null ? null : { getAttribute: () => src }),
  }) as unknown as Pick<Document, 'querySelector'>;
  const live = (html: string) => vi.fn(() => Promise.resolve(new Response(html, { status: 200 }))) as unknown as typeof fetch;

  it('says yes when the live page no longer loads this tab’s entry script', async () => {
    const liveHtml = '<script type="module" crossorigin src="./static/js/index-NEWHASH1.js"></script>';
    expect(await import('./engineClient.ts').then((m) =>
      m.servesNewerBuild(page('./static/js/index-OLDHASH1.js'), live(liveHtml)))).toBe(true);
  });

  it('says no when it still does', async () => {
    const liveHtml = '<script type="module" crossorigin src="./static/js/index-SAMEHASH.js"></script>';
    const { servesNewerBuild } = await import('./engineClient.ts');
    expect(await servesNewerBuild(page('./static/js/index-SAMEHASH.js'), live(liveHtml))).toBe(false);
  });

  /** Every doubt answers NO, so a real crash is never hidden behind a guess. */
  it('says no whenever it cannot tell', async () => {
    const { servesNewerBuild } = await import('./engineClient.ts');
    const any = live('<html></html>');
    expect(await servesNewerBuild(page(null), any)).toBe(false);                 // no entry script
    expect(await servesNewerBuild(page('/src/main.tsx'), any)).toBe(false);      // dev server: not hashed
    expect(await servesNewerBuild(page('./static/js/index-OLDHASH1.js'),
      vi.fn(() => Promise.resolve(new Response('', { status: 503 }))) as unknown as typeof fetch)).toBe(false);
    expect(await servesNewerBuild(page('./static/js/index-OLDHASH1.js'),
      vi.fn(() => Promise.reject(new TypeError('offline'))) as unknown as typeof fetch)).toBe(false);
  });
});

describe('engineClient — a solve that fails on a stale tab', () => {
  const reportError = vi.fn();
  beforeEach(() => {
    vi.resetModules();
    reportError.mockReset();
    vi.doMock('./sentry.ts', () => ({ reportError }));
    // The worker's data load fails the way the live site makes it fail.
    vi.doMock('./engine.ts', async (orig) => ({
      ...(await orig<typeof import('./engine.ts')>()),
      loadEngine: () => Promise.reject(new Error("couldn't load the price sheet (HTTP 404 Not Found)")),
    }));
    document.head.innerHTML = '<script type="module" crossorigin src="./static/js/index-OLDHASH1.js"></script>';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('./sentry.ts');
    vi.doUnmock('./engine.ts');
    document.head.innerHTML = '';
  });
  const req = { kind: 'item' as const, item: { baseId: 'Wands', level: 82, rarity: 'rare' as const, prefixes: [], suffixes: [] }, targets: [] };

  it('rejects with AppUpdated and reports nothing, when the site has been redeployed', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(
      new Response('<script type="module" src="./static/js/index-NEWHASH1.js"></script>', { status: 200 }))));
    const { solve, isAppUpdated } = await import('./engineClient.ts');
    await expect(solve(req).promise).rejects.toSatisfy(isAppUpdated);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('still reports a SolverError when the build is live — a real failure stays visible', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(
      new Response('<script type="module" src="./static/js/index-OLDHASH1.js"></script>', { status: 200 }))));
    const { solve, isAppUpdated } = await import('./engineClient.ts');
    const err = await solve(req).promise.then(() => null, (e: unknown) => e as Error);
    expect(isAppUpdated(err)).toBe(false);
    expect(err!.name).toBe('SolverError');
    expect(err!.message).toMatch(/price sheet \(HTTP 404/);
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});

/**
 * A worker whose script never loads — what a Cancel respawn meets on a stale tab, where the hashed
 * worker file is gone. The load fails while nothing is in flight, so there was no job to reject; the
 * dead worker was kept, and every later solve was posted into it and never answered. Measured end to
 * end before the fix: redeploy under an open tab, Cancel, Compute — it spun indefinitely.
 */
describe('engineClient — a worker that fails before anyone asks it anything', () => {
  const spawned: { onerror: ((e: ErrorEvent) => void) | null }[] = [];
  class DeadOnArrival {
    onmessage: ((e: MessageEvent) => void) | null = null;
    onerror: ((e: ErrorEvent) => void) | null = null;
    constructor() {
      spawned.push(this);
      // Like a 404'd module script: an ErrorEvent with nothing in it, a moment after construction.
      setTimeout(() => this.onerror?.({ message: '', filename: '', lineno: 0 } as ErrorEvent), 0);
    }
    postMessage(): void { /* a worker that never loaded answers nothing */ }
    terminate(): void {}
  }

  beforeEach(() => {
    vi.resetModules();
    spawned.length = 0;
    vi.doMock('./sentry.ts', () => ({ reportError: vi.fn() }));
    vi.stubGlobal('Worker', DeadOnArrival);
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock('./sentry.ts'); });

  it('is dropped, so the next solve starts a fresh one and fails loudly instead of hanging', async () => {
    const { prewarm, solve } = await import('./engineClient.ts');
    prewarm();
    await new Promise((r) => setTimeout(r, 5)); // the prewarmed worker dies while idle
    const req = { kind: 'item' as const, item: { baseId: 'Wands', level: 82, rarity: 'rare' as const, prefixes: [], suffixes: [] }, targets: [] };
    const settled = await Promise.race([
      solve(req).promise.then(() => 'resolved', () => 'rejected'),
      new Promise((r) => setTimeout(() => r('still waiting'), 500)),
    ]);
    expect(settled).toBe('rejected');
    expect(spawned).toHaveLength(2); // the dead one, then a fresh one for the solve
  });
});
