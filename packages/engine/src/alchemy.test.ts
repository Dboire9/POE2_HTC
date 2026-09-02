import { describe, it, expect } from 'vitest';
import type { ItemBase, Mod, PatchData } from './index.ts';
import { alchemyProbability } from './index.ts';

// Synthetic base with VARIED weights so the Monte-Carlo cross-check is meaningful (not just uniform).
const W: Record<string, number> = { P1: 300, P2: 200, P3: 100, S1: 300, S2: 200, S3: 100 };
const mod = (id: string, type: 'prefix' | 'suffix'): Mod => ({
  id, source: 'normal', type, family: 'fam_' + id, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: W[id]!, ranges: [] }],
});
const ALL = [mod('P1', 'prefix'), mod('P2', 'prefix'), mod('P3', 'prefix'), mod('S1', 'suffix'), mod('S2', 'suffix'), mod('S3', 'suffix')];
const base: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: { normal: { prefixes: ['P1', 'P2', 'P3'], suffixes: ['S1', 'S2', 'S3'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const data: PatchData = { patch: 't', mods: new Map(ALL.map((m) => [m.id, m])), bases: new Map([['B', base]]) };

// The real alchemy mechanic, sampled: 4 weighted draws, family-excluded, ≤3 per side, random side.
type Entry = { id: string; family: string; side: 'prefix' | 'suffix'; w: number };
const pre: Entry[] = ['P1', 'P2', 'P3'].map((id) => ({ id, family: 'fam_' + id, side: 'prefix', w: W[id]! }));
const suf: Entry[] = ['S1', 'S2', 'S3'].map((id) => ({ id, family: 'fam_' + id, side: 'suffix', w: W[id]! }));
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function simAlchemy(rng: () => number): Set<string> {
  const occ = new Set<string>(); let pf = 0, sf = 0; const out = new Set<string>();
  for (let d = 0; d < 4; d++) {
    const pool = [...(pf < 3 ? pre : []), ...(sf < 3 ? suf : [])].filter((x) => !occ.has(x.family));
    let tot = 0; for (const x of pool) tot += x.w;
    let r = rng() * tot; let pick = pool[pool.length - 1]!;
    for (const x of pool) { r -= x.w; if (r < 0) { pick = x; break; } }
    occ.add(pick.family); out.add(pick.id); if (pick.side === 'prefix') pf++; else sf++;
  }
  return out;
}
function mcAlchemy(targets: string[], runs: number, seed = 4): number {
  const rng = mulberry32(seed); let ok = 0;
  for (let i = 0; i < runs; i++) { const res = simAlchemy(rng); if (targets.every((t) => res.has(t))) ok++; }
  return ok / runs;
}

const RUNS = 300_000;
const tol = (p: number) => 4 * Math.sqrt(Math.max(p * (1 - p), 1e-6) / RUNS) + 2e-3;

describe('alchemyProbability — 4-mod draw matches Monte-Carlo', () => {
  it('single mod among the 4', () => {
    const a = alchemyProbability(data, base, ['P1']);
    expect(Math.abs(a - mcAlchemy(['P1'], RUNS))).toBeLessThan(tol(a));
  });
  it('two mods (one per side)', () => {
    const a = alchemyProbability(data, base, ['P1', 'S1']);
    expect(Math.abs(a - mcAlchemy(['P1', 'S1'], RUNS))).toBeLessThan(tol(a));
  });
  it('two prefixes (both from the capped side)', () => {
    const a = alchemyProbability(data, base, ['P1', 'P2']);
    expect(Math.abs(a - mcAlchemy(['P1', 'P2'], RUNS))).toBeLessThan(tol(a));
  });
  it('a full 4-mod target (2 prefix + 2 suffix)', () => {
    const a = alchemyProbability(data, base, ['P1', 'P2', 'S1', 'S2']);
    expect(a).toBeGreaterThan(0);
    expect(Math.abs(a - mcAlchemy(['P1', 'P2', 'S1', 'S2'], RUNS))).toBeLessThan(tol(a));
  });
});

describe('alchemyProbability — exact impossibilities', () => {
  it('0 for an off-pool mod, empty target, or more than 4 targets', () => {
    expect(alchemyProbability(data, base, ['NOPE'])).toBe(0);
    expect(alchemyProbability(data, base, [])).toBe(0);
    expect(alchemyProbability(data, base, ['P1', 'P2', 'P3', 'S1', 'S2'])).toBe(0); // 5 > 4
  });
  it('0 when the target needs 4 of one side (only 3 slots)', () => {
    // 3 prefixes exist; a 4th prefix can't be added — but even 3 prefixes + needing a 4th prefix is moot.
    // Target all 3 prefixes + 1 suffix is fine (achievable); make an impossible one via a shared family.
    const clash: Mod = { ...mod('P1b', 'prefix'), family: 'fam_P1' }; // same family as P1
    const d2: PatchData = { patch: 't', mods: new Map([...data.mods, ['P1b', clash]]), bases: new Map([['B', { ...base, pools: { ...base.pools, normal: { prefixes: ['P1', 'P2', 'P3', 'P1b'], suffixes: ['S1', 'S2', 'S3'] } } }]]) };
    expect(alchemyProbability(d2, d2.bases.get('B')!, ['P1', 'P1b'])).toBe(0); // share fam_P1 → can't co-exist
  });
});
