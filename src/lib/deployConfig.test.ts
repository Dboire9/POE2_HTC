import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// Two things that broke a deploy and a CI run respectively, neither of which any existing test could
// have caught: both are about files that ship without being executed by the suite.

describe('vercel.json', () => {
  const raw = readFileSync('vercel.json', 'utf8');
  const config = JSON.parse(raw) as {
    headers?: { source?: string; headers?: { key?: string; value?: string }[] }[];
  };

  // JSON HAS NO COMMENTS. A `"//"` key was added to explain each rule, and Vercel's schema rejects
  // unknown properties outright: "headers[0] should NOT have additional property //" — the build
  // failed, so the cache headers never shipped at all. The rationale lives in CLAUDE.md instead.
  it('carries no invented comment keys', () => {
    expect(raw).not.toMatch(/"\/\/"\s*:/);
  });

  // Minimal restatement of the schema Vercel actually enforces. It only needs to cover what this file
  // uses; the point is that an unknown property fails HERE rather than in a production deploy.
  it('uses only the properties the schema allows', () => {
    for (const rule of config.headers ?? []) {
      expect(Object.keys(rule).sort()).toEqual(['headers', 'source']);
      expect(typeof rule.source).toBe('string');
      for (const h of rule.headers ?? []) {
        expect(Object.keys(h).sort()).toEqual(['key', 'value']);
      }
    }
  });

  // The whole reason this file exists: hashed assets cached forever, the unhashed entry point never.
  // Getting these backwards would either re-download the whole patch payload every visit or pin users
  // to a stale build.
  it('caches hashed assets immutably and revalidates index.html', () => {
    const bySource = new Map((config.headers ?? []).map((r) => [r.source, r.headers ?? []]));
    const valueOf = (source: string) =>
      bySource.get(source)?.find((h) => h.key === 'Cache-Control')?.value ?? '';
    expect(valueOf('/static/(.*)')).toMatch(/immutable/);
    expect(valueOf('/static/(.*)')).toMatch(/max-age=31536000/);
    expect(valueOf('/')).toMatch(/max-age=0/);
    expect(valueOf('/')).toMatch(/must-revalidate/);
  });

  /**
   * The CSP has to be a REAL RESPONSE HEADER, and these tests exist because it used to be a
   * `<meta http-equiv>` in index.html, where three things were wrong with it at once:
   *
   *   1. `frame-ancestors` is IGNORED in a meta CSP. The site was iframeable the whole time.
   *   2. A meta tag is part of the document, so it applied in dev too — which is why it had to allow
   *      `http://localhost:*` and `ws://localhost:*` for Vite's HMR, and those shipped to production.
   *   3. It still allowed `https://api.poe2htc.com`, a backend retired in the Java migration.
   *
   * Nothing would have failed if any of that regressed, which is what makes it worth pinning.
   */
  describe('security headers', () => {
    const all = (config.headers ?? []).find((r) => r.source === '/(.*)')?.headers ?? [];
    const header = (key: string) => all.find((h) => h.key === key)?.value ?? '';
    const csp = header('Content-Security-Policy');

    it('serves a CSP on every route', () => {
      expect(csp).toMatch(/default-src 'self'/);
    });

    // The one directive a meta tag could never deliver, and the reason the move was worth making.
    it('refuses to be framed', () => {
      expect(csp).toMatch(/frame-ancestors 'none'/);
    });

    // The solve worker is same-origin (`new Worker(new URL('engine.worker-….js', import.meta.url))`),
    // never a blob. If this tightened to nothing, every craft in the app would stop computing.
    it('still allows the solve worker', () => {
      expect(csp).toMatch(/worker-src 'self'/);
    });

    // Sentry is off until VITE_SENTRY_DSN is set at BUILD time (see src/lib/sentry.ts). When it is
    // turned on, the browser posts events to <org>.ingest.sentry.io — a CSP that forgot this would
    // silently swallow every error report, which is the exact failure error tracking exists to
    // prevent. `connect-src` stays otherwise closed: nothing else in the app calls out.
    it('leaves room for Sentry to report, and nothing else', () => {
      expect(csp).toMatch(/connect-src 'self' https:\/\/\*\.sentry\.io/);
    });

    it('carries no dev-only or retired-backend allowances', () => {
      expect(csp).not.toMatch(/localhost/);
      expect(csp).not.toMatch(/api\.poe2htc\.com/);   // that backend was retired with the Java engine
    });

    it('sets the two cheap headers that have no downside here', () => {
      expect(header('X-Content-Type-Options')).toBe('nosniff');
      expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    // A meta CSP would take precedence over the header for the directives it does support, quietly
    // reinstating the weaker policy. There must be exactly one CSP and it must be the header.
    it('is not shadowed by a meta tag in index.html', () => {
      expect(readFileSync('index.html', 'utf8')).not.toMatch(/http-equiv=["']Content-Security-Policy/i);
    });
  });
});

/**
 * A crawler that fetches this page without running the script must still find out what it is.
 *
 * The body was an empty `<div id="root">`, so the served document had zero visible text, and Google
 * Search Console reported a SOFT 404 on 2026-09-06 — a URL answering 200 while looking empty. The
 * fallback markup inside `#root` is the fix, and it is the kind of thing a later refactor deletes
 * without noticing, because nothing a human looks at changes when it goes.
 */
describe('index.html says what the page is without JavaScript', () => {
  const html = readFileSync('index.html', 'utf8');
  /** Visible text only: scripts, styles, comments and tags stripped, the way a crawler reads it. */
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  it('serves real text in the body, not an empty root div', () => {
    expect(visibleText.length).toBeGreaterThan(300);
  });

  it('names the product and what it does', () => {
    expect(visibleText).toMatch(/POE2HTC/);
    expect(visibleText).toMatch(/Path of Exile 2/);
    expect(visibleText).toMatch(/craft/i);
  });

  // The fallback has to live inside the container React renders into, because that is what makes it
  // disappear for real users — `createRoot().render()` replaces the container's contents.
  it('puts the fallback inside #root, so React replaces it on mount', () => {
    const root = /<div id="root">([\s\S]*?)<\/div>\s*<script/.exec(html);
    expect(root, 'could not find #root followed by the module script').not.toBeNull();
    expect(root![1]).toMatch(/<h1/);
  });

  // Everything here is also claimed in the meta description, and the two drifting apart is how a page
  // ends up describing itself two different ways to the same crawler.
  it('tells visitors the app needs JavaScript', () => {
    expect(html).toMatch(/<noscript>/);
  });
});

describe('no throwaway probes in the suite', () => {
  // A measurement harness written to time the solver got committed by accident. It wrote to an
  // absolute /tmp path from this machine, so it passed locally and failed CI with ENOENT. Probes are
  // fine — leaving them in the suite is not, and they are recognisable by their `__` prefix.
  const dirs = ['packages/optimizer/src', 'packages/engine/src', 'src/lib', 'src/features/engine'];

  it('has no __-prefixed test files', () => {
    const strays = dirs.flatMap((d) =>
      readdirSync(d).filter((f) => f.startsWith('__') && f.includes('.test.')).map((f) => `${d}/${f}`));
    expect(strays).toEqual([]);
  });
});

/**
 * The price bot merges to `main` on its own, daily, at 06:00 UTC with nobody watching — so its
 * safeguards are the ones least likely to be noticed when they stop working, and nothing else in the
 * suite executes that file. Same reasoning as `vercel.json` above, and the same limitation: these are
 * assertions about TEXT, not about what GitHub will do with it. They pin decisions, not behaviour.
 *
 * Three ways it went quiet before 2026-09-08, each fixed and each pinned here.
 */
describe('the price refresh bot cannot merge quietly', () => {
  const wf = readFileSync('.github/workflows/refresh-prices.yml', 'utf8');

  /**
   * It ran `priceResolution` and `costConsistency` only. Those are the sheet's own contract and they
   * pass on data that is wrong in ways they were never asked about — the league rollover that
   * collapsed 272 Alloy prices to one median went through them green, while `src/lib/alloys.test.ts`
   * (which reads the live sheet on purpose) would have caught it and was not in the list.
   */
  it('guards a refresh with the whole test suite, not a curated list', () => {
    expect(wf).toMatch(/if npm test 2>&1 \| tee/);
    expect(wf).not.toMatch(/npx vitest run packages\/optimizer\/src\/priceResolution/);
  });

  /**
   * The guard is `continue-on-error` so that a failure still OPENS the PR — the artifact you need to
   * see what the bad data was. That makes the job green by default, so the failure has to be re-raised
   * afterwards or a red suite would report success.
   */
  it('re-raises a failing suite, since continue-on-error swallows it', () => {
    expect(wf).toMatch(/continue-on-error: true/);
    expect(wf).toMatch(/steps\.guard\.outputs\.passed != 'true'/);
  });

  /**
   * A refused merge used to log `::warning::` and exit 0. The PR it leaves behind carries the ORDINARY
   * title, so it looks exactly like the ones that merged themselves — an automation quietly not
   * working, which is the case that most needs the email.
   */
  it('fails the job when a clean merge is refused', () => {
    const refused = wf.slice(wf.indexOf('if gh pr merge'));
    expect(refused).toMatch(/::error::/);
    expect(refused).toMatch(/exit 1/);
    expect(refused).not.toMatch(/::warning::Depth check was clean/);
  });

  /** Both questions gate the merge: is the data backed by a market, and does the app work on it? */
  it('merges only when the depth verdict AND the tests are clean', () => {
    expect(wf).toMatch(/\[ "\$DEPTH" = clean \] && \[ "\$TESTS" = true \]/);
  });
});

/**
 * The league-age hold, which is in the refresh SCRIPT rather than the workflow.
 *
 * The check used to be `prev.league !== league` — an EVENT, which fires on the changeover day and
 * then never again, because merging that day's PR makes `prev.league` the new league. Days 2-7 of a
 * league auto-merged unread, and that is the week the whole economy spends repricing.
 */
describe('early-league prices are held for a read', () => {
  const script = readFileSync('tools/refresh/prices.mjs', 'utf8');

  it('holds on the league AGE, not only on the changeover day', () => {
    expect(script).toMatch(/leagueHoldDays/);
    expect(script).toMatch(/leagueAgeDays < DEPTH\.leagueHoldDays/);
  });

  /** poe.ninja's /leagues serves `id` and `name` and no start date, so the sheet has to record when
   *  it first saw the league. Without the field there is no age and the hold cannot work. */
  it('records when the league was first seen, and the sheet carries it', () => {
    expect(script).toMatch(/leagueSince/);
    const sheet = JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8')) as {
      league?: string; leagueSince?: string;
    };
    expect(sheet.leagueSince).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sheet.league).toBeTruthy();
  });
});
