import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * `reportError`'s context plumbing.
 *
 * Worth its own test because the obvious way to write it is silently wrong: hanging a `tags` property
 * off the Error and passing that to `captureException` type-checks, runs, reports the error — and
 * drops the tags on the floor, because Sentry reads them from the second argument and nothing else.
 * That version was written here and only caught by reading the SDK's contract, which is exactly the
 * class of mistake a test should hold down rather than a reviewer.
 *
 * The SDK is a DYNAMIC import, so these tests mock the module and re-import `sentry.ts` per case —
 * `DSN` is read once at module scope, so `vi.stubEnv` has to happen before the import, not after.
 */

const captureException = vi.fn();
const init = vi.fn();

vi.mock('@sentry/react', () => ({
  init,
  captureException,
  browserTracingIntegration: () => ({ name: 'tracing' }),
  replayIntegration: () => ({ name: 'replay' }),
}));

/** Import a fresh copy of the module with the DSN env var set (or not) as given. */
async function freshSentry(dsn?: string) {
  vi.resetModules();
  if (dsn === undefined) vi.stubEnv('VITE_SENTRY_DSN', '');
  else vi.stubEnv('VITE_SENTRY_DSN', dsn);
  return import('./sentry.ts');
}

beforeEach(() => {
  captureException.mockClear();
  init.mockClear();
});
afterEach(() => { vi.unstubAllEnvs(); });

const DSN = 'https://key@o1.ingest.de.sentry.io/2';

describe('reportError — tags have to reach captureException, not the Error', () => {
  it('passes the context through as the second argument', async () => {
    const s = await freshSentry(DSN);
    s.initSentry();
    await vi.waitFor(() => expect(init).toHaveBeenCalled()); // the dynamic import has to land first

    const err = new Error('solver blew up');
    s.reportError(err, { tags: { origin: 'worker-solve' } });

    expect(captureException).toHaveBeenCalledWith(err, { tags: { origin: 'worker-solve' } });
  });

  /**
   * The queue carries the context too.
   *
   * An error thrown before the SDK chunk lands is the startup case the queue exists for — and it is
   * the one most worth seeing. Replaying it untagged would file it in the wrong place, which defeats
   * the point of tagging at all.
   */
  it('keeps the context on an error queued before the SDK loaded', async () => {
    const s = await freshSentry(DSN);
    const early = new Error('thrown during startup');
    s.reportError(early, { tags: { origin: 'worker-fatal' } });
    expect(captureException).not.toHaveBeenCalled(); // nothing to send to yet

    s.initSentry();
    await vi.waitFor(() => expect(captureException).toHaveBeenCalled());
    expect(captureException).toHaveBeenCalledWith(early, { tags: { origin: 'worker-fatal' } });
  });

  it('reports nothing at all when no DSN was set at build time', async () => {
    const s = await freshSentry();
    s.initSentry();
    s.reportError(new Error('nobody is listening'), { tags: { origin: 'worker-solve' } });
    await new Promise((r) => { setTimeout(r, 10); });
    expect(init).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  /** Bounded on purpose: a render loop throwing every frame must not grow the queue without limit. */
  it('caps the queue rather than eating memory before the SDK arrives', async () => {
    const s = await freshSentry(DSN);
    for (let i = 0; i < 50; i++) s.reportError(new Error(`e${i}`));
    s.initSentry();
    await vi.waitFor(() => expect(captureException).toHaveBeenCalled());
    expect(captureException.mock.calls.length).toBeLessThanOrEqual(20);
  });
});
