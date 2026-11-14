import { describe, it, expect } from 'vitest';
import { loadShippedPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { EXAMPLE_CATEGORIES, EXAMPLE_CRAFTS } from './exampleCrafts';
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

  // The card files them by `category` and credits each to its `build`: a craft under an unknown category
  // never gets a chip, and two crafts of one name would share a React key.
  it('each sit under a known category, carry a unique name, and name the class they come from', () => {
    const ids = EXAMPLE_CATEGORIES.map((c) => c.id);
    for (const e of EXAMPLE_CRAFTS) {
      expect(ids, e.name).toContain(e.category);
      expect(typeof e.build, e.name).toBe('string');
      expect(e.build.trim(), e.name).not.toBe('');
    }
    const names = EXAMPLE_CRAFTS.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  // Each chip opens a short grid: a category with fewer than three is thin beside the others, and one with
  // more than four outgrows the card's two columns.
  const categories = EXAMPLE_CATEGORIES.map((c) => [c.label, c.id] as const);
  it.each(categories)('%s holds three or four crafts', (_label, id) => {
    const n = EXAMPLE_CRAFTS.filter((e) => e.category === id).length;
    expect(n).toBeGreaterThanOrEqual(3);
    expect(n).toBeLessThanOrEqual(4);
  });

  // Chosen so the first answer a player sees is a number, not a bound: each settles within Standard's
  // sweep cap. On the frozen sheet, so a price refresh cannot flake this — and with the clock lifted, so a
  // loaded machine cannot either: under the full suite these ran past 30 s where alone they take ~3 s. The
  // clock half (0.2–1.8 s each on the live sheet, 2026-11-14) is a measurement, in validation.md
  // (`scripts/example-crafts.mts`). One test per category, so a slow or unsettled craft is named by it.
  const eng = { data, prices: loadFrozenPrices() };
  const effort = { ...limitsFor('standard'), maxMillis: 600_000 };
  it.each(categories)('the %s crafts each settle exactly within Standard’s sweeps', (_label, id) => {
    for (const { name, goal } of EXAMPLE_CRAFTS.filter((e) => e.category === id)) {
      const got = runSolve(eng, { kind: 'lab', from: { baseId: goal.baseId, level: goal.level }, targets: goal.targets, effort });
      expect(got.markov, name).toMatchObject({ applicable: true, feasible: true, bound: 'exact' });
    }
  }, 300_000);
});
