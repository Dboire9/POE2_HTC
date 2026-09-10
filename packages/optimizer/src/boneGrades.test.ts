import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { ANCIENT_BONE_FLOOR, desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';
import { pricesForBase, type Prices } from './cost.ts';
import { createActionSpace, REACHABLE_FLOORS, type ActionDef } from './markovActions.ts';
import { FLAG_NONE, decodeState, encodeState, sideIndexOf, type McTarget } from './markovState.ts';

// Ancient bones and the orb floors in the MDP. The Echoes omen is hand-computed beside the other offer
// cases in markovEssenceDesecrate.test.ts.
const data = loadPatch('data/patches/0.5.0');
// FROZEN, as for every assertion computed from prices. It predates Ancient bones, so each test states
// the Ancient price it needs.
const frozen = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
// Three Wand mods at their TOP tier, where a floor matters most.
const TOP = ['Wands/IncreasedMana', 'Wands/WeaponSpellDamage', 'Wands/Intelligence'];
const top = (id: string): number => data.mods.get(id)!.tiers.length - 1;
const listOf = (ids: readonly string[]): McTarget[] => ids.map((id) => {
  const mod = data.mods.get(id)!;
  return { mods: [{ mod, minIndex: top(id) }], type: mod.type, fractured: false };
});
const withAncient = (price: number): Prices => ({ ...frozen, bones: { ...frozen.bones, jawbone_ancient: price } });
const wandSpace = (prices: Prices) => {
  const list = listOf(TOP);
  return createActionSpace({
    data, prices: pricesForBase(prices, wands), level: 82, pools: wands.pools, list,
    side: sideIndexOf(list), desecratable: true, bossTargetable: true,
  });
};
const emptyRare = decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'rare'));
/** P(one draw lands any target). */
const hit = (a: ActionDef): number => {
  let p = 0;
  for (const [k, q] of a.dist) if (decodeState(k).present !== 0) p += q;
  return p;
};
const isBone = (a: ActionDef, grade: 'preserved' | 'ancient'): boolean =>
  a.action.currency === 'desecrate' && !a.action.boss && !a.action.side && !a.action.echoes
  && (grade === 'ancient') === (a.action.ancient === true);

describe('an Ancient bone: "Minimum Modifier Level: 40"', () => {
  it('draws at modifier level 40, so a top tier turns up more often than from a Preserved bone', () => {
    const acts = wandSpace(withAncient(5)).actionsOf(emptyRare);
    const preserved = acts.find((a) => isBone(a, 'preserved'))!;
    const ancient = acts.find((a) => isBone(a, 'ancient'))!;
    // Measured 1.35% → 2.56% per draw on these three.
    expect(hit(ancient)).toBeGreaterThan(hit(preserved) * 1.5);
  });

  it('is never offered where the sheet does not price it — an absent price is not a free bone', () => {
    const acts = wandSpace(frozen).actionsOf(emptyRare);
    expect(acts.some((a) => a.action.currency === 'desecrate' && a.action.ancient === true)).toBe(false);
  });

  /** Positions that agree at every OTHER floor could otherwise pass as interchangeable and behave apart
   *  under an Ancient bone or a Perfect Transmute. */
  it('is one of the floors the interchangeability check compares at, beside a Transmute’s 55 and 70', () => {
    expect(REACHABLE_FLOORS).toEqual(expect.arrayContaining([0, 35, ANCIENT_BONE_FLOOR, 50, 55, 70]));
  });

  it('is played where it pays: three top tiers on a Wand cost ~16% less with it, even at 20ex', () => {
    const start: ItemState = { base: wands, level: 82, rarity: 'rare', prefixes: [], suffixes: [] };
    const targets = TOP.map((modId) => ({ modId, minTierIndex: top(modId) }));
    const prices = withAncient(20); // a hundred times this sheet's Preserved jawbone
    const withIt = markovFromItem(data, prices, start, targets);
    const without = markovFromItem(data, prices, start, targets, { policy: { excluded: new Set(['desecrate_ancient']) } });
    expect(withIt.converged && without.converged).toBe(true);
    expect([...withIt.policy.values()].some((a) => a.currency === 'desecrate' && a.ancient === true)).toBe(true);
    // Measured 164,365.3ex → 137,725.4ex.
    expect(withIt.expectedCost).toBeLessThan(without.expectedCost * 0.9);
  });
});

describe('the MDP’s Perfect Transmute rolls at modifier level 70 too', () => {
  it('cannot land a mod whose best tier is below 70, where a Greater one (55) can', () => {
    const rings = data.bases.get('Rings')!;
    const res = data.mods.get('Rings/AllResistances')!; // best tier ilvl 68
    const list: McTarget[] = [{ mods: [{ mod: res, minIndex: 0 }], type: res.type, fractured: false }];
    const space = createActionSpace({
      data, prices: pricesForBase(frozen, rings), level: 82, pools: rings.pools, list,
      side: sideIndexOf(list), desecratable: false, bossTargetable: true,
    });
    const acts = space.actionsOf(decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'normal')));
    const transmute = (strength: string) =>
      acts.find((a) => a.action.currency === 'transmute' && a.action.strength === strength);
    expect(hit(transmute('greater')!)).toBeGreaterThan(0);
    const perfect = transmute('perfect');
    expect(perfect).toBeDefined(); // the frozen sheet prices it, so the action exists…
    expect(hit(perfect!)).toBe(0); // …and every draw is junk
  });
});

/**
 * A boss omen only confines the draw to its boss's carved pool, so a boss none of whose mods the craft
 * wants can only add flagged junk. Those draws are not built — a pruning that was measured, not proved
 * (see `bossesWanted`), and on a weapon it is most of the Desecration actions.
 */
describe('boss draws are built only for a boss whose carved mods the craft wants', () => {
  it('builds none on a weapon craft that wants no carved mod — but still the untargeted draw', () => {
    const acts = wandSpace(withAncient(5)).actionsOf(emptyRare);
    expect(acts.some((a) => a.action.currency === 'desecrate' && a.action.boss !== undefined)).toBe(false);
    expect(acts.some((a) => isBone(a, 'preserved'))).toBe(true);
  });

  it('builds exactly the wanted boss’s draws when a carved mod is a target', () => {
    const carved = data.mods.get(wands.pools.desecrated.suffixes[0]!)!;
    const list: McTarget[] = [...listOf(TOP.slice(0, 2)), { mods: [{ mod: carved, minIndex: 0 }], type: carved.type, fractured: false }];
    const space = createActionSpace({
      data, prices: pricesForBase(frozen, wands), level: 82, pools: wands.pools, list,
      side: sideIndexOf(list), desecratable: true, bossTargetable: true,
    });
    const bosses = new Set(space.actionsOf(emptyRare).flatMap((a) =>
      (a.action.currency === 'desecrate' && a.action.boss ? [a.action.boss] : [])));
    expect([...bosses]).toEqual([desecrationOmenForMod(carved)]);
  });
});
