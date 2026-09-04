import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * The markdown parser must never reach the browser.
 *
 * `marked` is a devDependency used once, at build time, by vite.config.ts's `user-guide` plugin.
 * IT SHIPPED ANYWAY on the first cut of this feature: `guideRoute.ts` imported `ANCHOR_PREFIX` — one
 * string — from `parseGuide.ts`, and that single value import pulled the whole tokenizer into the
 * ENTRY chunk, the one every visitor downloads before anything renders. Measured at 438.44 kB
 * (135.89 gzip); splitting the constant into `guideTypes.ts` took it to 395.07 kB (121.50 gzip).
 *
 * Nothing failed. The build succeeded, the types were fine, the tests were green, and the only
 * evidence was `grep tokenizer dist/static/js/index-*.js`. So the rule is checked here instead, by
 * walking the real import graph from the app's entry point the way the bundler does.
 */

const SRC = resolve(__dirname, '../../..', 'src');

/** Value imports only — `import type` is erased and cannot pull code into a bundle. */
function valueImports(source: string): string[] {
  const out: string[] = [];
  const re = /import\s+(?!type\s)([\s\S]*?)\s*from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const clause = m[1];
    const spec = m[2] ?? m[3];
    if (spec === undefined) continue;
    // `import { type A, type B } from` is type-only in effect; it binds no runtime value.
    if (clause !== undefined && clause.trim().startsWith('{')) {
      const names = clause.trim().replace(/^\{|\}$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      if (names.length > 0 && names.every((n) => n.startsWith('type '))) continue;
    }
    out.push(spec);
  }
  return out;
}

const resolveRelative = (from: string, spec: string): string | null => {
  const base = join(dirname(from), spec);
  for (const cand of [base, base.replace(/\.ts$/, '.tsx'), `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    if (existsSync(cand) && !cand.endsWith('/')) return cand;
  }
  return null;
};

/** Every bare package specifier reachable from `entry` through relative value imports. */
function packagesReachableFrom(entry: string): Set<string> {
  const seen = new Set<string>();
  const packages = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const spec of valueImports(readFileSync(file, 'utf8'))) {
      if (spec.startsWith('.')) {
        const next = resolveRelative(file, spec);
        if (next) walk(next);
      } else {
        packages.add(spec.split('/')[0]!.replace(/^(@[^/]+)$/, '$1'));
      }
    }
  };
  walk(entry);
  return packages;
}

describe('the markdown parser stays out of the browser bundle', () => {
  const reachable = packagesReachableFrom(join(SRC, 'App.tsx'));

  it('walks a real graph — the sanity check that this test can see anything at all', () => {
    // If the walker silently resolved nothing, every assertion below would pass vacuously.
    expect(reachable).toContain('react');
    expect(reachable.size).toBeGreaterThan(3);
  });

  it('never reaches `marked` from the app entry point', () => {
    expect([...reachable]).not.toContain('marked');
  });

  it('keeps `guideTypes.ts` free of the parser, since the app imports it at runtime', () => {
    const types = readFileSync(join(SRC, 'lib/guide/guideTypes.ts'), 'utf8');
    expect(valueImports(types)).toEqual([]);
  });

  it('confines `marked` to the build-time parser', () => {
    const parser = readFileSync(join(SRC, 'lib/guide/parseGuide.ts'), 'utf8');
    expect(valueImports(parser)).toContain('marked');
  });
});
