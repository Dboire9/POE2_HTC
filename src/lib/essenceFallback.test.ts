import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MarkovResult } from '../../packages/optimizer/src/markovFromItem.ts';

// An offer must never cost the player an answer they had (engine.ts, `optimizeItemMarkov`): when the solve
// with essence twins does not settle, the craft is solved again as asked. Whether a real solve runs out is
// a matter of the wall clock — the caster Wand example did at Quick — so the twin solve's outcome is set
// here, around the real solver, rather than raced against a clock.
type Outcome = 'real' | 'ranOut' | 'cheaperCeiling' | 'dearerCeiling';
let outcome: Outcome = 'real';
vi.mock('../../packages/optimizer/src/markovBoneFree.ts', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../packages/optimizer/src/markovBoneFree.ts')>();
  return {
    ...real,
    markovBoneFreeFirst: vi.fn((...args: Parameters<typeof real.markovBoneFreeFirst>): MarkovResult => {
      const res = real.markovBoneFreeFirst(...args);
      const twins = args[3].some((t) => t.essenceTwin);
      if (!twins || outcome === 'real') return res;
      if (outcome === 'ranOut') {
        return { ...res, feasible: false, stoppedEarly: true, reason: 'the solver stopped before it could put a number on this' };
      }
      // A ceiling at a stated cost: far below the craft as asked, or far above it.
      return { ...res, bound: 'upper', expectedCost: outcome === 'cheaperCeiling' ? 1 : 1e9 };
    }),
  };
});

const { loadPatch } = await import('../../packages/engine/src/loadPatch.ts');
const { loadFrozenPrices } = await import('../../packages/optimizer/src/frozenPrices.ts');
const { markovBoneFreeFirst } = await import('../../packages/optimizer/src/markovBoneFree.ts');
const { runSolve } = await import('./solve.ts');

const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadFrozenPrices() };
const ring = [{ modId: 'Rings/IncreasedMana', tierDisplay: 3 }, { modId: 'Rings/FireResistance', tierDisplay: 3 }];
const NO_ESSENCES = ['essence_lesser', 'essence', 'essence_greater'];
const solve = (excluded: string[] = []) => {
  const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Rings', level: 82 }, targets: ring, excluded });
  if (got.kind !== 'lab' || !got.markov.applicable) throw new Error('no model');
  return got.markov;
};

describe('a craft whose essence twins do not settle keeps the answer it had', () => {
  beforeEach(() => { outcome = 'real'; vi.mocked(markovBoneFreeFirst).mockClear(); });

  it('settled with its twins: solved once, and cheaper than as asked', () => {
    const asked = solve(NO_ESSENCES);
    vi.mocked(markovBoneFreeFirst).mockClear();
    const offered = solve();
    expect(vi.mocked(markovBoneFreeFirst)).toHaveBeenCalledTimes(1);
    expect(offered.bound).toBe('exact');
    expect(offered.expectedCost).toBeLessThan(asked.expectedCost);
  }, 60_000);

  it('ran out with its twins: solved again as asked, and that exact answer stands', () => {
    const asked = solve(NO_ESSENCES);
    outcome = 'ranOut';
    vi.mocked(markovBoneFreeFirst).mockClear();
    const offered = solve();
    expect(vi.mocked(markovBoneFreeFirst)).toHaveBeenCalledTimes(2);
    expect(offered.feasible).toBe(true);
    expect(offered.bound).toBe('exact');
    expect(offered.expectedCost).toBe(asked.expectedCost);
  }, 60_000);

  it('a ceiling dearer than the craft as asked gives way to the exact answer', () => {
    const asked = solve(NO_ESSENCES);
    outcome = 'dearerCeiling';
    const offered = solve();
    expect(offered.bound).toBe('exact');
    expect(offered.expectedCost).toBe(asked.expectedCost);
  }, 60_000);

  it('a ceiling cheaper than the craft as asked is kept — it is a plan that finishes for less', () => {
    outcome = 'cheaperCeiling';
    const offered = solve();
    expect(offered.bound).toBe('upper');
    expect(offered.expectedCost).toBe(1);
  }, 60_000);
});
