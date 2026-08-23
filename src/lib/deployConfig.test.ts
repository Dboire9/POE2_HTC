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
