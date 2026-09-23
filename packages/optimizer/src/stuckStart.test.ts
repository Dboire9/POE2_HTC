import { describe, it, expect } from 'vitest';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import { loadFrozenPrices } from './frozenPrices.ts';

/**
 * TODO 24 — a craft that finishes ONLY by starting over.
 *
 * With Chaos and Annul both ruled out, a tablet full of the wrong modifiers has no way forward but the
 * bin, so no plan finishes without a restart. The solver's first phase (no restarts) then prices the
 * start at Infinity, and the second had nothing to descend from — every action, the restart included,
 * read Infinity. Value iteration stayed at Infinity; policy iteration read the states it had no move for
 * as FREE exits and quoted the craft at 0, as an "upper bound". Both now seed the second phase from the
 * restart-bounded heuristic policy, and a state with no move costs Infinity, never nothing.
 */
describe('a craft that only finishes by starting over', () => {
  const data = loadPatch('data/patches/0.5.0');
  const temple = data.bases.get('Tablets_temple')!;
  const excluded = new Set(['chaos', 'chaos_greater', 'chaos_perfect', 'annul']);
  const solve = (solver: 'policy' | 'value') => markovFromItem(data, loadFrozenPrices(), whiteItem(temple, 100),
    [{ modId: 'Tablets/MapAdditionalUniqueMonsterModifier' }], {
      restartCost: 1, spare: { prefixes: 2, suffixes: 1 }, fillOnFinish: true, solver, maxIters: 2_000_000,
      policy: { excluded }, replay: { runs: 3_000, seed: 1 },
    });

  it('gets a real, exact number from both solvers, and the replay backs it', () => {
    const [pi, vi] = [solve('policy'), solve('value')];
    for (const r of [pi, vi]) {
      expect(r.feasible).toBe(true);
      expect(r.bound).toBe('exact');
      expect(r.expectedCost).toBeGreaterThan(100);
      expect(Number.isFinite(r.expectedCost)).toBe(true);
    }
    expect(Math.abs(pi.expectedCost - vi.expectedCost) / pi.expectedCost).toBeLessThan(0.01);
    const rp = pi.replay;
    expect(rp?.ok).toBe(true);
    // The model overstates slightly where junk stays on the item (TODO 23); never by more than this.
    if (rp?.ok) expect(Math.abs(rp.meanCost - pi.expectedCost) / pi.expectedCost).toBeLessThan(0.08);
  }, 60_000);
});
