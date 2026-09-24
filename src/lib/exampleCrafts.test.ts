import { describe, it, expect } from 'vitest';
import { loadShippedPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { EXAMPLE_CRAFTS } from './exampleCrafts';
import { runSolve } from './solve';
import { limitsFor } from './searchEffort';

// The data the browser gets: an example naming a base or modifier a refresh renamed would load a craft
// the picker cannot show.
const data = loadShippedPatch('data/patches/0.5.0');

describe('the example crafts on an empty Plan tab', () => {
  it('name real bases, and modifiers each base rolls, at tiers they have', () => {
    for (const { goal } of EXAMPLE_CRAFTS) {
      const base = data.bases.get(goal.baseId);
      expect(base, goal.baseId).toBeDefined();
      const pool = [...base!.pools.normal.prefixes, ...base!.pools.normal.suffixes];
      for (const t of goal.targets) {
        expect(pool, t.modId).toContain(t.modId);
        expect(t.tierDisplay).toBeGreaterThanOrEqual(1);
        expect(t.tierDisplay).toBeLessThanOrEqual(data.mods.get(t.modId)!.tiers.length);
      }
    }
  });

  // Chosen so the first answer a player sees is a number, not a bound: each settles under Standard's
  // own limits. On the frozen sheet, so a price refresh cannot flake this.
  it('each settle exactly under Standard’s limits', () => {
    const eng = { data, prices: loadFrozenPrices() };
    for (const { name, goal } of EXAMPLE_CRAFTS) {
      const got = runSolve(eng, { kind: 'lab', from: { baseId: goal.baseId, level: goal.level }, targets: goal.targets, effort: limitsFor('standard') });
      expect(got.markov, name).toMatchObject({ applicable: true, feasible: true, bound: 'exact' });
    }
  });
});
