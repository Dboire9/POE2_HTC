import { describe, it, expect } from 'vitest';
import type { ItemBase, Mod, PatchData } from '../../engine/src/index.ts';
import type { Prices } from './cost.ts';
import { createActionSpace } from './markovActions.ts';
import { FLAG_NONE, decodeState, encodeState, sideIndexOf } from './markovState.ts';
import type { McTarget } from './markovState.ts';

/**
 * TODO 23: a junk mod's family, taken out of the next roll's pool on average (`junkFamilies`).
 *
 * One target prefix T (weight 100) and two junk families, A (300) and B (100). A junk mod that landed
 * took A three times in four, so the family it holds weighs (300² + 100²) / 400 = 250 on average. With
 * one junk prefix on the item an Exalt's pool is then 500 − 250 = 250, and T lands 100 / 250 = 0.4 of
 * the time — against 0.2 with the family left in, and 0.75·(100/200) + 0.25·(100/400) = 0.4375 in the
 * game. With two, both families are out and T is certain, which the correction gets exactly.
 */
const mk = (id: string, family: string, weight: number): Mod => ({
  id, source: 'normal', type: 'prefix', family, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight, ranges: [] }],
});
const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands',
  pools: {
    normal: { prefixes: ['T', 'A', 'B'], suffixes: [] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([['T', mk('T', 'FT', 100)], ['A', mk('A', 'FA', 300)], ['B', mk('B', 'FB', 100)]]),
  bases: new Map([['S', base]]),
};
const prices: Prices = { currency: { exalt: 1 }, omens: {} };
const list: McTarget[] = [{ mods: [{ mod: data.mods.get('T')!, minIndex: 0 }], type: 'prefix', fractured: false }];

/** An Exalt's outcomes from a Rare holding `jp` junk prefixes, by state key. */
const exalt = (jp: number, junkFamilies: boolean): Map<string, number> => {
  const { actionsOf } = createActionSpace({
    data, prices, level: 82, pools: base.pools, list, side: sideIndexOf(list), desecratable: false,
    bossTargetable: false, ...(junkFamilies ? { junkFamilies: true } : {}),
  });
  const s = decodeState(encodeState(0, 0, jp, 0, FLAG_NONE, 'rare'));
  const a = actionsOf(s).find((x) => x.action.currency === 'exalt' && x.action.strength === 'base' && !x.action.side)!;
  return a.dist;
};
const landsT = (d: Map<string, number>, jp: number) => d.get(encodeState(1, 0, jp, 0, FLAG_NONE, 'rare')) ?? 0;
const sum = (d: Map<string, number>) => [...d.values()].reduce((x, p) => x + p, 0);

describe('a junk mod’s family, out of the next roll', () => {
  it('leaves the family in when off — every roll with junk priced worse than the game', () => {
    expect(landsT(exalt(1, false), 1)).toBeCloseTo(0.2, 12);
  });

  it('takes out the family a junk mod holds on average, size-biased', () => {
    const d = exalt(1, true);
    expect(landsT(d, 1)).toBeCloseTo(0.4, 12);
    expect(d.get(encodeState(0, 0, 2, 0, FLAG_NONE, 'rare'))).toBeCloseTo(0.6, 12);
    expect(sum(d)).toBeCloseTo(1, 12);
  });

  it('changes nothing with no junk on the item, and gets two junk mods exactly', () => {
    expect(landsT(exalt(0, true), 0)).toBeCloseTo(0.2, 12);
    expect(landsT(exalt(2, true), 2)).toBeCloseTo(1, 12);
  });
});

/**
 * The yardstick, on a real craft (docs/validation.md, 2026-09-24): a white Wand, two prefixes and a
 * suffix at their second tier, 30 ex a base — frozen sheet. The replay plays the solved plan on real
 * items, where a junk mod's family IS out of the next roll. Without the correction the solver sat 7.8%
 * above it (z −13.9 at 20,000 crafts); with it, within the dice.
 */
describe('a real craft agrees with its own replay only with junk families out', () => {
  it('lands the solver on the replayed cost, which the old model overstates', async () => {
    const { loadShippedPatch } = await import('../../engine/src/loadPatch.ts');
    const { loadFrozenPrices } = await import('./frozenPrices.ts');
    const { markovFromItem } = await import('./markovFromItem.ts');
    const real = loadShippedPatch('data/patches/0.5.0');
    const wands = real.bases.get('Wands')!;
    const targets = [wands.pools.normal.prefixes[0]!, wands.pools.normal.prefixes[1]!, wands.pools.normal.suffixes[0]!]
      .map((modId) => ({ modId, minTierIndex: real.mods.get(modId)!.tiers.length - 2 }));
    const white = { base: wands, level: 82, rarity: 'normal' as const, prefixes: [], suffixes: [] };
    const gapInSe = (junkFamilies: boolean): number => {
      const r = markovFromItem(real, loadFrozenPrices(), white, targets, {
        restartCost: 30, solver: 'policy', junkFamilies, replay: { runs: 4_000, seed: 1, watch: [], maxMillis: 300_000 },
      });
      if (!r.replay?.ok) throw new Error('no replay');
      return (r.replay.meanCost - r.expectedCost) / r.replay.stdErr;
    };
    expect(Math.abs(gapInSe(true))).toBeLessThan(3);
    expect(gapInSe(false)).toBeLessThan(-3);
  }, 300_000);
});
