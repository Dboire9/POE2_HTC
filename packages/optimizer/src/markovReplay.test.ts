import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { ReplayReport, ReplayResult } from './markovFromItem.ts';
import type { Prices } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { encodeState } from './markovState.ts';

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
