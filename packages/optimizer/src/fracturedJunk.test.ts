import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { ReplayReport, ReplayResult } from './markovFromItem.ts';
import type { Prices } from './cost.ts';

// A FRACTURED MOD NOBODY ASKED FOR IS PART OF THE BASE, NOT JUNK (TODO 28).
//
// The game never removes a fractured mod. The true-cost model counted one as ordinary junk, so its
// Annulments and Chaos Orbs could take it off: wrong odds whenever one was on the item, and a price for
// crafts the game cannot finish. It is now folded into the craft — one slot fewer on its side, a free
// slot used, its family out of every pool — so a held fractured junk prefix must cost EXACTLY what the
// same craft costs on a base with one prefix fewer and that mod's family gone.

const mod = (id: string, type: 'prefix' | 'suffix', family = id): Mod => ({
  id, source: 'normal', type, family, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: 100, ranges: [] }],
});
const MODS = [mod('NP1', 'prefix'), mod('NP2', 'prefix'), mod('NP3', 'prefix'), mod('NS1', 'suffix'), mod('NS2', 'suffix')];
const baseOf = (prefixes: string[], limits?: ItemBase['limits']): ItemBase => ({
  id: 'B', name: 'B', category: 'C', ...(limits ? { limits } : {}),
  pools: { normal: { prefixes, suffixes: ['NS1', 'NS2'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
});
const dataOf = (base: ItemBase): PatchData =>
  ({ patch: 't', mods: new Map(MODS.map((m) => [m.id, m])), bases: new Map([[base.id, base]]) });
const prices: Prices = { currency: { exalt: 1, annul: 3, chaos: 2 }, omens: {} };
const rare = (base: ItemBase, prefixes: ItemState['prefixes'] = []): ItemState =>
  ({ base, level: 82, rarity: 'rare', prefixes, suffixes: [] });
const locked = { modId: 'NP1', tierName: 't1', fractured: true };
const targets = [{ modId: 'NP2' }, { modId: 'NS1' }];

function played(r: ReplayReport | undefined): ReplayResult {
  if (!r?.ok) throw new Error(`no replay: ${r ? r.reason : 'absent'}`);
  return r;
}

describe('a fractured mod that is not a target', () => {
  const base = baseOf(['NP1', 'NP2', 'NP3']);

  it('needs a free slot on its side, and says so by name', () => {
    const r = markovFromItem(dataOf(base), prices, rare(base, [locked]), targets);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/NP1 is fractured.*leave a prefix free/i);
  });

  it('costs exactly what the same craft costs with that slot and that family gone from the base', () => {
    const withIt = markovFromItem(dataOf(base), prices, rare(base, [locked]), targets,
      { spare: { prefixes: 1, suffixes: 0 }, tolerance: 1e-12 });
    const twin = baseOf(['NP2', 'NP3'], { prefixes: 2, suffixes: 3, crafted: 1 });
    const without = markovFromItem(dataOf(twin), prices, rare(twin), targets, { tolerance: 1e-12 });
    expect(withIt.feasible && without.feasible).toBe(true);
    expect(withIt.bound).toBe('exact');
    expect(withIt.expectedCost).toBeCloseTo(without.expectedCost, 9);
  });

  it('is never removed when the plan is played on real items: the replay lands on the solver', () => {
    const r = markovFromItem(dataOf(base), prices, rare(base, [locked]), targets,
      { spare: { prefixes: 1, suffixes: 0 }, tolerance: 1e-12, replay: { runs: 20_000, seed: 5 } });
    const rp = played(r.replay);
    expect(Math.abs(rp.meanCost - r.expectedCost)).toBeLessThan(4 * rp.stdErr);
  });

  it('blocks a target of its own family for good', () => {
    const sib = mod('NP1b', 'prefix', 'NP1');
    const d: PatchData = { ...dataOf(baseOf(['NP1', 'NP1b', 'NP2'])), mods: new Map([...MODS, sib].map((m) => [m.id, m])) };
    const b = d.bases.get('B')!;
    const r = markovFromItem(d, prices, rare(b, [locked]), [{ modId: 'NP1b' }], { spare: { prefixes: 1, suffixes: 0 } });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/NP1 is fractured.*shares a family with NP1b/i);
  });
});

describe('a fractured target below the tier asked for', () => {
  it('can never be fixed, and says so', () => {
    const tiered: Mod = { ...mod('NP2', 'prefix'), tiers: [
      { name: 'low', ilvl: 1, weight: 100, ranges: [] }, { name: 'high', ilvl: 1, weight: 100, ranges: [] },
    ] };
    const base = baseOf(['NP1', 'NP2', 'NP3']);
    const d: PatchData = { ...dataOf(base), mods: new Map([...MODS.filter((m) => m.id !== 'NP2'), tiered].map((m) => [m.id, m])) };
    const r = markovFromItem(d, prices, rare(base, [{ modId: 'NP2', tierName: 'low', fractured: true }]),
      [{ modId: 'NP2', minTierIndex: 1 }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/fractured below the tier/i);
  });
});
