import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { ReplayReport, ReplayResult } from './markovFromItem.ts';
import type { Prices } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { encodeState } from './markovState.ts';
import { percentiles } from './markovReplay.ts';

const mod = (id: string, type: 'prefix' | 'suffix', tiers: [string, number][]): Mod => ({
  id, source: 'normal', type, family: id, tags: [], text: id,
  tiers: tiers.map(([name, weight]) => ({ name, ilvl: 1, weight, ranges: [] })),
});
const baseOf = (prefixes: string[], suffixes: string[]): ItemBase => ({
  id: 'B', name: 'B', category: 'C',
  pools: { normal: { prefixes, suffixes }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
});
const dataOf = (base: ItemBase, mods: Mod[]): PatchData =>
  ({ patch: 't', mods: new Map(mods.map((m) => [m.id, m])), bases: new Map([[base.id, base]]) });

function played(r: ReplayReport | undefined): ReplayResult {
  if (!r?.ok) throw new Error(`no replay: ${r ? r.reason : 'absent'}`);
  return r;
}

describe('replayPolicy — the solved policy played on real items', () => {
  /**
   * Where the abstraction loses nothing, the replay has to land on V: every mod the pool holds is a
   * target, so there is no junk whose family the lattice could fail to see, and an off-tier roll is the
   * target's own family — exactly what `blocked` models. What is left is dice, so the mean sits within
   * a few standard errors of the solver's number. The craft climbs the whole ladder from white —
   * Transmute, Augment, Regal, then Exalt/Annul/Chaos on the Rare — with a paid restart in play.
   */
  it('agrees with V where the abstraction is exact (no junk can exist)', () => {
    const base = baseOf(['A'], ['B']);
    const data = dataOf(base, [mod('A', 'prefix', [['a1', 3], ['a2', 1]]), mod('B', 'suffix', [['b1', 2]])]);
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const r = markovFromItem(data, prices, whiteItem(base, 100), [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], {
      restartCost: 0.5, tolerance: 1e-12, replay: { runs: 20_000, seed: 11 },
    });
    expect(r.bound).toBe('exact');
    const rp = played(r.replay);
    expect(rp.runs).toBe(20_000);
    expect(Math.abs(rp.meanCost - r.expectedCost)).toBeLessThan(3 * rp.stdErr);
  });

  /**
   * A watched mod's share, against a number worked out by hand. The pool is two prefixes, T (weight 1)
   * and W (weight 3), and the craft wants T on an empty Rare. The first Exalt lands W three times in
   * four — and that is the whole answer, whatever the policy does next: W has been seen, while the one
   * way to finish without ever seeing it is T arriving first.
   *
   * The COMBINATION "W and T together" is the policy's to decide, and the test asks it rather than
   * assuming. With W on the item it can Exalt again — and T then lands for certain, because W's family
   * has left the pool (the lattice cannot see that; it prices 1 in 4) — or Annul W first and never hold
   * the two at once.
   */
  it('counts a watched mod, and a combination, the way the policy actually plays them', () => {
    const base = baseOf(['T', 'W'], []);
    const data = dataOf(base, [mod('T', 'prefix', [['t', 1]]), mod('W', 'prefix', [['w', 3]])]);
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };
    const empty: ItemState = { base, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(data, prices, empty, [{ modId: 'T' }], {
      tolerance: 1e-12, replay: { runs: 20_000, seed: 5, watch: [['W'], ['W', 'T']] },
    });
    const rp = played(r.replay);
    expect(rp.seen[0]).toBeGreaterThan(0.735);
    expect(rp.seen[0]).toBeLessThan(0.765);
    const withW = r.policy.get(encodeState(0, 0, 1, 0));
    expect(withW?.currency === 'exalt' || withW?.currency === 'annul').toBe(true);
    if (withW?.currency === 'exalt') {
      expect(rp.seen[1]).toBeCloseTo(rp.seen[0]!, 10); // every craft that saw W went on to hold both
    } else {
      expect(rp.seen[1]).toBe(0);
    }
  });

  /**
   * The same craft with W rolling a value 1–3, watched at any value, at 3, and at 1–2 — worked by hand.
   * W is seen in 3/4 of crafts whatever the policy does. How often one of those sightings is a 3 is the
   * policy's to decide: if it Exalts over W, T lands for certain and W is seen once, so 3/4 × 1/3 = 1/4.
   * If it Annuls W and tries again, a craft sees W k times before T with chance (3/4)^k × 1/4, and none
   * of them is a 3 with chance (2/3)^k — so a 3 turns up in 1 − (1/4)/(1 − 1/2) = 1/2 of crafts.
   */
  it('tells a watched value apart, and rolls no extra dice when nothing asks for one', () => {
    const base = baseOf(['T', 'W'], []);
    const w = { ...mod('W', 'prefix', [['w', 3]]), tiers: [{ name: 'w', ilvl: 1, weight: 3, ranges: [[1, 3]] as [number, number][] }] };
    const data = dataOf(base, [mod('T', 'prefix', [['t', 1]]), w]);
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };
    const empty: ItemState = { base, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const solve = (watch: NonNullable<Parameters<typeof markovFromItem>[4]>['replay']) =>
      played(markovFromItem(data, prices, empty, [{ modId: 'T' }], { tolerance: 1e-12, ...(watch ? { replay: watch } : {}) }).replay);

    const rp = solve({ runs: 20_000, seed: 5, watch: [['W'], [{ id: 'W', min: 3 }], [{ id: 'W', min: 1, max: 2 }]] });
    const [any, three, low] = rp.seen as [number, number, number];
    expect(any).toBeCloseTo(0.75, 1);
    const move = markovFromItem(data, prices, empty, [{ modId: 'T' }], { tolerance: 1e-12 }).policy.get(encodeState(0, 0, 1, 0));
    expect(Math.abs(three - (move?.currency === 'annul' ? 0.5 : 0.25))).toBeLessThan(0.015);
    // Every sighting has SOME value, so the two bounded entries cover the unbounded one between them.
    expect(three + low).toBeGreaterThanOrEqual(any);
    expect(Math.max(three, low)).toBeLessThanOrEqual(any);

    // No bounds anywhere: the dice are the ones a replay has always rolled.
    const plain = solve({ runs: 2_000, seed: 5, watch: [['W']] });
    const none = solve({ runs: 2_000, seed: 5 });
    expect(plain.meanCost).toBe(none.meanCost);
  });

  /**
   * `fillOnFinish`: a finished item still has its empty slots filled, one Exalt each. On an item that
   * already qualifies there is nothing else to do, so the cost is exactly that — worked by hand. On a
   * real tablet the replay fills its own real items, so what filling adds has to match the solver's.
   */
  it('charges one Exalt per empty slot at finish, and the replay pays the same', () => {
    const base = baseOf(['A'], ['B']);
    const data = dataOf(base, [mod('A', 'prefix', [['a1', 1]]), mod('B', 'suffix', [['b1', 1]])]);
    const prices: Prices = { currency: { exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const held: ItemState = { base, level: 100, rarity: 'rare', prefixes: [{ modId: 'A', tierName: 'a1' }], suffixes: [] };
    const spare = { prefixes: 2, suffixes: 3 };
    // A Rare holding A, room for 3 + 3: five empty slots.
    expect(markovFromItem(data, prices, held, [{ modId: 'A' }], { spare, fillOnFinish: true }).expectedCost).toBe(15);
    expect(markovFromItem(data, prices, held, [{ modId: 'A' }], { spare }).expectedCost).toBe(0);

    const real = loadPatch('data/patches/0.5.0');
    const tablet = real.bases.get('Tablets_ritual')!;
    const sheet = loadFrozenPrices();
    const solve = (fillOnFinish: boolean) => markovFromItem(real, sheet, whiteItem(tablet, 100),
      [{ modId: 'Tablets/MapDroppedGoldIncrease' }], {
        restartCost: 1, spare: { prefixes: 1, suffixes: 2 }, ...(fillOnFinish ? { fillOnFinish } : {}),
        replay: { runs: 5_000, seed: 7 },
      });
    const [bare, filled] = [solve(false), solve(true)];
    const exalt = sheet.currency['exalt']!;
    expect(filled.expectedCost).toBeGreaterThan(bare.expectedCost);
    expect(filled.expectedCost).toBeLessThanOrEqual(bare.expectedCost + 3 * exalt);
    // What the fill adds agrees between the two (1.06 against 1.08 Exalts, measured). The totals do not
    // quite: free slots keep junk on the tablet, and the model does not take a junk family out of the
    // next roll (TODO 23), so it OVERSTATES — by ~5% here, fill or no fill.
    const [rb, rf] = [played(bare.replay), played(filled.replay)];
    expect(Math.abs((rf.meanCost - rb.meanCost) - (filled.expectedCost - bare.expectedCost))).toBeLessThan(4 * Math.hypot(rf.stdErr, rb.stdErr));
    expect(rf.meanCost).toBeLessThan(filled.expectedCost);
    expect(rf.meanCost / filled.expectedCost).toBeGreaterThan(0.93);

    // Policy iteration prices it by its own route — the closed form, where a goal ends the chain at
    // its fill cost — and must land on the same number.
    const pi = markovFromItem(real, sheet, whiteItem(tablet, 100), [{ modId: 'Tablets/MapDroppedGoldIncrease' }],
      { restartCost: 1, spare: { prefixes: 1, suffixes: 2 }, fillOnFinish: true, solver: 'policy' });
    expect(pi.bound).toBe('exact');
    expect(pi.expectedCost).toBeCloseTo(filled.expectedCost, 2);
  });

  it('reads percentiles by nearest rank, 0th to 100th', () => {
    const xs = Array.from({ length: 200 }, (_, i) => 200 - i); // 1..200, shuffled order
    const p = percentiles(xs);
    expect(p).toHaveLength(101);
    expect([p[0], p[50], p[90], p[100]]).toEqual([1, 100, 180, 200]);
    expect(percentiles([])).toEqual([]);
  });

  /**
   * Fishing a Ritual tablet for the reroll with plain tablets at 100 ex: the plan bins ~71 tablets a
   * craft. The replay reports the spread of what a craft costs, and what it plays to get there.
   */
  describe('fishing a Ritual tablet for the reroll', () => {
    const real = loadPatch('data/patches/0.5.0');
    const tablet = real.bases.get('Tablets_ritual')!;
    const two = { id: 'Tablets/MapAdditionalModifier', min: 2, max: 2 };
    const watch = [[two], ['Tablets/MapAdditionalUniqueMonsterModifier']];
    const solve = (sell?: number[]) => markovFromItem(real, loadFrozenPrices(), whiteItem(tablet, 100),
      [{ modId: 'Tablets/RitualAdditionalReroll' }], {
        restartCost: 100, spare: { prefixes: 2, suffixes: 1 }, fillOnFinish: true,
        replay: { runs: 3_000, seed: 2, watch, ...(sell ? { sell } : {}) },
      });

    it('reports what a craft costs as a spread, and the moves it plays', () => {
      const rp = played(solve().replay);
      const p = rp.costPercentiles;
      expect(p).toHaveLength(101);
      for (let i = 1; i < p.length; i++) expect(p[i]!).toBeGreaterThanOrEqual(p[i - 1]!);
      // A craft of many restarts: skewed, so half cost less than the mean and the worst tenth far more.
      expect(p[50]!).toBeLessThan(rp.meanCost);
      expect(p[90]!).toBeGreaterThan(1.5 * rp.meanCost);
      // It bins dozens of tablets a craft, and every fresh one is Transmuted: the moves say how it works.
      expect(rp.movesPerCraft['restart']!).toBeGreaterThan(20);
      expect(rp.movesPerCraft['transmute']!).toBeGreaterThanOrEqual(rp.movesPerCraft['restart']!);
      expect(rp.movesPerCraft['annul'] ?? 0).toBeLessThan(1);
      expect(rp.sales).toBeUndefined(); // nothing priced, nothing sold
    });

    /**
     * Price the two sets and the replay sells them when that beats carrying on — here, mostly tablets
     * the plan was about to bin anyway. Revenue is exactly what was sold at those prices, and selling
     * can only help: spend minus revenue is no more than the craft cost without it.
     */
    it('sells a priced set when that beats carrying on, and never plays worse for it', () => {
      const prices = [1_150, 300];
      const bare = played(solve().replay);
      const rp = played(solve(prices).replay);
      const sales = rp.sales!;
      expect(sales.perEntry).toHaveLength(2);
      expect(sales.revenue).toBeCloseTo(sales.perEntry[0]! * prices[0]! + sales.perEntry[1]! * prices[1]!, 6);
      expect(sales.revenue).toBeGreaterThan(0);
      expect(rp.movesPerCraft['sell']).toBeGreaterThan(0);
      expect(rp.meanCost - sales.revenue).toBeLessThan(bare.meanCost + 3 * Math.hypot(rp.stdErr, bare.stdErr));
    });


  });

  /**
   * A price below what carrying on is worth must NOT be taken. W (weight 3) lands before the target T
   * three crafts in four, and from there one cheap Exalt finishes — while a fresh base costs 50. Selling
   * W for 1 would throw that away every time; the rule never does.
   */
  it('does not sell for less than carrying on is worth', () => {
    const base = baseOf(['T', 'W'], []);
    const data = dataOf(base, [mod('T', 'prefix', [['t', 1]]), mod('W', 'prefix', [['w', 3]])]);
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 1, exalt: 1, chaos: 100 }, omens: {} };
    const r = markovFromItem(data, prices, whiteItem(base, 100), [{ modId: 'T' }], {
      restartCost: 50, spare: { prefixes: 1, suffixes: 0 }, tolerance: 1e-9,
      replay: { runs: 2_000, seed: 4, watch: [['W']], sell: [1] },
    });
    const rp = played(r.replay);
    expect(rp.seen[0]).toBeGreaterThan(0.5); // W is held often…
    expect(rp.sales!.perEntry[0]).toBe(0); // …and never sold for less than it costs to replace it
  });

  it('declines a route that plays a move it does not model, rather than guessing', () => {
    // On the frozen 2026-08-22 sheet a bone is cheap enough that this craft's route desecrates.
    const real = loadPatch('data/patches/0.5.0');
    const r = markovFromItem(real, loadFrozenPrices(), whiteItem(real.bases.get('Wands')!, 82),
      [{ modId: 'Wands/WeaponSpellDamage' }], { restartCost: 0, replay: { runs: 200, seed: 1 } });
    expect(r.replay?.ok).toBe(false);
    expect(r.replay && !r.replay.ok ? r.replay.reason : '').toMatch(/desecrate/);
  });

  it('is reproducible per seed, and the seed matters', () => {
    const base = baseOf(['A'], ['B']);
    const data = dataOf(base, [mod('A', 'prefix', [['a1', 3], ['a2', 1]]), mod('B', 'suffix', [['b1', 2]])]);
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const run = (seed: number) => markovFromItem(data, prices, whiteItem(base, 100),
      [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], { restartCost: 0.5, replay: { runs: 2_000, seed } }).replay;
    expect(run(3)).toEqual(run(3));
    expect(played(run(3)).meanCost).not.toBe(played(run(4)).meanCost);
  });

  it('only replays an EXACT solve — a bound’s policy is not one anybody should follow', () => {
    const base = baseOf(['T', 'W'], []);
    const data = dataOf(base, [mod('T', 'prefix', [['t', 1]]), mod('W', 'prefix', [['w', 3]])]);
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };
    const empty: ItemState = { base, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(data, prices, empty, [{ modId: 'T' }], { maxIters: 1, replay: { runs: 100 } });
    expect(r.bound).not.toBe('exact');
    expect(r.replay).toBeUndefined();
  });

  it('stops starting crafts when its clock runs out, and says how many it played', () => {
    const base = baseOf(['A'], ['B']);
    const data = dataOf(base, [mod('A', 'prefix', [['a1', 3], ['a2', 1]]), mod('B', 'suffix', [['b1', 2]])]);
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const r = markovFromItem(data, prices, whiteItem(base, 100), [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], {
      restartCost: 0.5, replay: { runs: 1e9, seed: 2, maxMillis: 50 },
    });
    const rp = played(r.replay);
    expect(rp.runs).toBeGreaterThanOrEqual(64);
    expect(rp.runs).toBeLessThan(1e9);
    // …and never reads a share off a handful, however short the clock — even one already run out.
    const none = markovFromItem(data, prices, whiteItem(base, 100), [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], {
      restartCost: 0.5, replay: { runs: 1e9, seed: 2, maxMillis: -1 },
    });
    expect(played(none.replay).runs).toBe(64);
  });

  it('says how far along it is, a hundredth at a time, without touching the dice', () => {
    const base = baseOf(['A'], ['B']);
    const data = dataOf(base, [mod('A', 'prefix', [['a1', 3], ['a2', 1]]), mod('B', 'suffix', [['b1', 2]])]);
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const solve = (onProgress?: (f: number) => void) =>
      markovFromItem(data, prices, whiteItem(base, 100), [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], {
        restartCost: 0.5, replay: { runs: 2_000, seed: 3, ...(onProgress ? { onProgress } : {}) },
      });
    const told: number[] = [];
    expect(played(solve((f) => told.push(f)).replay)).toEqual(played(solve().replay));
    // No clock, so crafts played over crafts asked: one report per 20 of the 2,000.
    expect(told.length).toBeGreaterThan(90);
    expect(told.length).toBeLessThanOrEqual(100);
    told.forEach((f, i) => {
      expect(f).toBeLessThanOrEqual(1);
      if (i > 0) expect(f).toBeGreaterThan(told[i - 1]!);
    });
  });
});
