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
  // Getting these backwards would either re-download 3.1 MB every visit or pin users to a stale build.
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
