import { describe, it, expect } from 'vitest';
import { loadShippedPatch } from '../../engine/src/loadPatch.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { whiteItem } from '../../engine/src/item.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { allowsStep } from './cost.ts';
import { essenceTwinOf, fitTwins, withEssenceTwins } from './essenceTwins.ts';
import { markovFromItem } from './markovFromItem.ts';
import { markovBoneFreeFirst } from './markovBoneFree.ts';
import type { ResolvedCandidate } from './markovSymmetry.ts';
import { decodeState, popcount } from './markovState.ts';
import type { TierTarget } from './optimize.ts';
import { optimizePareto } from './optimize.ts';
import { expandSlots, itemLegalCombinations } from './slots.ts';

// Real data, the frozen sheet. Ring Fire Resistance T3 (31–35) is exactly the Greater Essence of
// Insulation; Body Armour Life T3 (175–189) is far above that base's Greater Essence of the Body
// (100–119) — the two cases the rule has to tell apart.
const data = loadShippedPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const base = (id: string) => data.bases.get(id)!;
/** The tier index `tierDisplay` (1 = best) names, as `toTierTargets` converts it. */
const t = (modId: string, tierDisplay: number, slot?: number): TierTarget => {
  const n = resolveMod(data, modId).tiers.length;
  return { modId, minTierIndex: n - tierDisplay, ...(slot === undefined ? {} : { slot }) };
};
const white = (baseId: string): ItemState => ({ ...whiteItem(base(baseId)), level: 82 });

describe('essenceTwinOf — the essence that gives a rolled target at its tier or better', () => {
  it('finds the Greater Essence of Insulation for Ring Fire Resistance T3, at its Greater level', () => {
    const fire = resolveMod(data, 'Rings/FireResistance');
    const twin = essenceTwinOf(data, base('Rings'), fire, t('Rings/FireResistance', 3).minTierIndex!, 82);
    expect(twin?.modId).toBe('Rings/Essence_FireResistance');
    expect(resolveMod(data, twin!.modId).tiers[twin!.minTierIndex]!.name).toBe('Greater Essence of Insulation');
  });

  it('takes a lower level when the target asks less — Fire Resistance T5 (21–25) is the normal Essence', () => {
    const fire = resolveMod(data, 'Rings/FireResistance');
    const twin = essenceTwinOf(data, base('Rings'), fire, t('Rings/FireResistance', 5).minTierIndex!, 82);
    expect(resolveMod(data, twin!.modId).tiers[twin!.minTierIndex]!.name).toBe('Essence of Insulation');
  });

  it('finds nothing where every essence level is below the tier asked — Body Armour Life T3', () => {
    const life = resolveMod(data, 'Body_Armours_str/IncreasedLife');
    expect(essenceTwinOf(data, base('Body_Armours_str'), life, t('Body_Armours_str/IncreasedLife', 3).minTierIndex!, 82))
      .toBeUndefined();
  });

  it('finds nothing above the item level — Greater Insulation needs item level 60', () => {
    const fire = resolveMod(data, 'Rings/FireResistance');
    expect(essenceTwinOf(data, base('Rings'), fire, t('Rings/FireResistance', 3).minTierIndex!, 59)).toBeUndefined();
  });

  it('finds nothing when no level that gives the tier can be bought', () => {
    const fire = resolveMod(data, 'Rings/FireResistance');
    expect(essenceTwinOf(data, base('Rings'), fire, t('Rings/FireResistance', 3).minTierIndex!, 82, () => false))
      .toBeUndefined();
    // …while one buyable level is enough.
    expect(essenceTwinOf(data, base('Rings'), fire, t('Rings/FireResistance', 3).minTierIndex!, 82,
      (_, name) => name.startsWith('Greater'))?.modId).toBe('Rings/Essence_FireResistance');
  });
});

describe('withEssenceTwins — offered in the target’s own slot', () => {
  it('adds each twin to its target’s slot, flagged, after the targets', () => {
    const targets = [t('Rings/IncreasedMana', 3), t('Rings/FireResistance', 3)];
    const out = withEssenceTwins(data, base('Rings'), targets, 82, 1);
    expect(out.slice(0, 2).map((x) => [x.modId, x.slot])).toEqual([['Rings/IncreasedMana', 0], ['Rings/FireResistance', 1]]);
    expect(out.slice(2)).toEqual([{ modId: 'Rings/Essence_FireResistance', minTierIndex: 2, slot: 1, essenceTwin: true }]);
  });

  it('adds nothing when a slot already needs every crafted modifier the base can hold', () => {
    const perfect = base('Rings').pools.essence.suffixes.find((id) => resolveMod(data, id).source === 'perfect_essence')!;
    const targets = [t('Rings/FireResistance', 3), { modId: perfect, minTierIndex: 0 }];
    expect(withEssenceTwins(data, base('Rings'), targets, 82, 1)).toEqual(targets);
    // With room for a second crafted modifier (Astrid's Creativity), the twin is offered again.
    expect(withEssenceTwins(data, base('Rings'), targets, 82, 2).some((x) => x.essenceTwin)).toBe(true);
  });
});

describe('fitTwins — twins are dropped to fit the model, never a reason to refuse', () => {
  const cand = (x: TierTarget): ResolvedCandidate => ({
    mod: resolveMod(data, x.modId), minIndex: x.minTierIndex ?? 0, fractured: false, ...(x.essenceTwin ? { twin: true as const } : {}),
  });

  it('keeps every twin while they fit', () => {
    const targets = withEssenceTwins(data, base('Rings'), [t('Rings/FireResistance', 3), t('Rings/ColdResistance', 3)], 82, 1);
    const fitted = fitTwins(data, base('Rings').pools, 82, targets, targets.map(cand), false);
    expect(fitted.targets).toEqual(targets);
  });

  it('a six-target Ring with no room left keeps its targets and drops the twin', () => {
    // With bones in play the base's carved Life and resistances add three obstacle positions, and six
    // targets plus three is the model's nine: no room for an offer.
    const b = base('Rings');
    const ids = [...b.pools.normal.prefixes.slice(0, 3), ...b.pools.normal.suffixes.slice(0, 3)];
    const named = ids.map((id) => t(id, 3));
    const targets = withEssenceTwins(data, b, named, 82, 1);
    expect(targets.some((x) => x.essenceTwin)).toBe(true);
    const fitted = fitTwins(data, b.pools, 82, targets, targets.map(cand), true);
    expect(fitted.targets.map((x) => x.modId)).toEqual(named.map((x) => x.modId));
    // …and the solver, which refused this offer before twins could be dropped, answers it exactly as it
    // answers the craft as asked.
    // Built up from its smaller crafts, as the app solves it — six targets unseeded do not settle.
    const opts = { restartCost: 0, solver: 'policy' as const, maxIters: 100_000 };
    const asked = markovBoneFreeFirst(data, prices, white('Rings'), named, opts);
    const offered = markovBoneFreeFirst(data, prices, white('Rings'), targets, opts);
    expect(asked.bound).toBe('exact');
    expect(offered.bound).toBe('exact');
    expect(offered.expectedCost).toBe(asked.expectedCost);
  }, 120_000);

  it('with room for some, keeps the twin on the RAREST roll — the target asked at the highest tier', () => {
    // A Belt asking its first three prefixes and suffixes offers four twins and has room for three. Every
    // tier weighs the same in this data, so a roll is rarer for accepting fewer tiers: Life at T3 lands
    // on three tiers' weight, the rest at T5 on five. Life's twin is the one the model must keep.
    const b = base('Belts');
    const ids = [...b.pools.normal.prefixes.slice(0, 3), ...b.pools.normal.suffixes.slice(0, 3)];
    expect(ids).toContain('Belts/IncreasedLife');
    const named = ids.map((id) => t(id, id === 'Belts/IncreasedLife' ? 3 : 5));
    const offer = withEssenceTwins(data, b, named, 82, 1);
    const twins = offer.filter((x) => x.essenceTwin).map((x) => x.modId);
    const kept = fitTwins(data, b.pools, 82, offer, offer.map(cand), false).targets
      .filter((x) => x.essenceTwin).map((x) => x.modId);
    expect(twins).toHaveLength(4);
    expect(kept).toHaveLength(3);
    expect(kept).toContain('Belts/Essence_IncreasedLife');
  });
});

describe('the lattice carries no state a twin cannot reach', () => {
  it('never two twins on the item, never a twin blocked, never a twin on a Magic item', () => {
    const targets = withEssenceTwins(data, base('Rings'), [t('Rings/FireResistance', 3), t('Rings/ColdResistance', 3)], 82, 1);
    const r = markovFromItem(data, prices, white('Rings'), targets, { restartCost: 0, maxIters: 100_000, keepRoutes: true });
    const table = r.routes!;
    const twinBits = table.positions.reduce((m, ids, i) => (ids.every((id) => id.includes('/Essence_')) ? m | (1 << i) : m), 0);
    expect(twinBits).not.toBe(0);
    let held = 0;
    for (const key of table.keys) {
      const s = decodeState(key);
      expect(s.blocked & twinBits).toBe(0);
      const on = popcount(s.present & twinBits);
      expect(on).toBeLessThanOrEqual(s.rarity === 'rare' ? 1 : 0);
      held += on;
    }
    expect(held).toBeGreaterThan(0); // the twins are in the lattice at all
  });
});

describe('the item’s crafted cap, counted by slot', () => {
  it('a craft offering an Essence in two slots answers — only a slot with no rolled member forces one', () => {
    const targets = withEssenceTwins(data, base('Rings'), [t('Rings/FireResistance', 3), t('Rings/ColdResistance', 3)], 82, 1);
    expect(targets.filter((x) => x.essenceTwin)).toHaveLength(2);
    const r = markovFromItem(data, prices, white('Rings'), targets, { restartCost: 0, maxIters: 100_000 });
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
  });

  it('two slots that each need a crafted mod are still refused on a base that holds one', () => {
    const ess = base('Rings').pools.essence.suffixes.filter((id) => resolveMod(data, id).source === 'essence');
    const r = markovFromItem(data, prices, white('Rings'), [{ modId: ess[0]!, minTierIndex: 0 }, { modId: ess[1]!, minTierIndex: 0 }],
      { restartCost: 0, maxIters: 100_000 });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/at most one crafted modifier/);
  });

  it('two Perfect Essences the player names for ONE slot are still refused — both could be stacked', () => {
    const perfect = base('Rings').pools.essence.suffixes.filter((id) => resolveMod(data, id).source === 'perfect_essence');
    const fams = new Set<string>();
    const two = perfect.filter((id) => { const f = resolveMod(data, id).family; if (fams.has(f)) return false; fams.add(f); return true; }).slice(0, 2);
    expect(two).toHaveLength(2);
    const r = markovFromItem(data, prices, white('Rings'),
      [{ modId: 'Rings/IncreasedMana', minTierIndex: 0 }, ...two.map((modId) => ({ modId, minTierIndex: 0, slot: 7 }))],
      { restartCost: 0, maxIters: 100_000 });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/at most one crafted modifier/);
  });

  it('the step planner drops the combinations that take two twins, and keeps the rest', () => {
    const targets = withEssenceTwins(data, base('Rings'), [t('Rings/FireResistance', 3), t('Rings/ColdResistance', 3)], 82, 1);
    const crafted = { is: (id: string) => resolveMod(data, id).source === 'essence', cap: 1 };
    const combos = itemLegalCombinations(expandSlots(targets), () => false, crafted);
    expect(combos).toHaveLength(3); // rolled + rolled, essence + rolled, rolled + essence
    expect(() => optimizePareto(data, prices, base('Rings'), targets, { level: 82 })).not.toThrow();
  });
});

describe('a forced modifier beats rolling for it', () => {
  it('Ring Fire Resistance T3 with its Essence offered: cheaper, and the plan plays the Essence', () => {
    const named = [t('Rings/IncreasedMana', 3), t('Rings/FireResistance', 3)];
    const opts = { restartCost: 0, maxIters: 100_000, tolerance: 1e-9 };
    const asked = markovFromItem(data, prices, white('Rings'), named, opts);
    const offered = markovFromItem(data, prices, white('Rings'), withEssenceTwins(data, base('Rings'), named, 82, 1), opts);
    expect(asked.bound).toBe('exact');
    expect(offered.bound).toBe('exact');
    expect(offered.expectedCost).toBeLessThan(asked.expectedCost);
    expect([...offered.policy.values()].some((a) => a.currency === 'essence')).toBe(true);
  });
});

describe('excluding an essence LEVEL excludes the essence', () => {
  it('"essence_greater" keeps a Greater essence step out, as its own key does', () => {
    const step = { currency: 'essence' as const, add: 'Rings/Essence_FireResistance', essenceLevel: 'greater' };
    expect(allowsStep({ excluded: new Set(['essence_greater']) }, step)).toBe(false);
    expect(allowsStep({ excluded: new Set(['essence:greater:Rings/Essence_FireResistance']) }, step)).toBe(false);
    expect(allowsStep({ excluded: new Set(['essence_lesser']) }, step)).toBe(true);
  });
});
