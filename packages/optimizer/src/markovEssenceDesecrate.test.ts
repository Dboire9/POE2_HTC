import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { Prices } from './cost.ts';

// Synthetic base built so every desecration outcome is hand-countable:
//   normal    prefixes [NP1]        suffixes []          ← empty suffix pool ⇒ no ordinary junk
//   desecrated prefixes [DP1]       suffixes [DS1]       ← both tagged kurgal (Blackblooded)
// With one kurgal mod per side, an UNCONSTRAINED Blackblooded desecration draws 1-of-2 across the two
// sides, while a Sinistral Necromancy omen narrows it to the single prefix ⇒ P=1. That contrast is
// exactly the modelling decision this file pins.
const mk = (
  id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source'], tags: string[] = [],
): Mod => ({
  id, group: id, field: id, source, type, categories: [], family, tags, text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: source === 'normal' ? 100 : 1, ranges: [], stats: [] }],
});

const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
  pools: {
    normal: { prefixes: ['NP1'], suffixes: [] },
    desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] },
    essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')],
    ['DP1', mk('DP1', 'prefix', 'FdP', 'desecrated', ['kurgal_mod'])],
    ['DS1', mk('DS1', 'suffix', 'FdS', 'desecrated', ['kurgal_mod'])],
  ]),
  bases: new Map([['S', base]]),
};

const placed = (modId: string, fractured = false): ItemState['prefixes'][number] =>
  fractured ? { modId, tierName: 't1', fractured: true } : { modId, tierName: 't1' };
const rare = (pre: ItemState['prefixes'], suf: ItemState['suffixes']): ItemState =>
  ({ base, level: 100, rarity: 'rare', prefixes: pre, suffixes: suf });

describe('markovFromItem — Desecration as an MDP action (hand-computed)', () => {
  // Start [NP1 (fractured) | —], target {NP1, DP1}. NP1 is fractured and its family is the whole normal
  // prefix pool, so NO exalt, annul or chaos is ever available from the start — the only lever is a
  // Desecration, which makes the arithmetic exact.
  const start = rare([placed('NP1', true)], []);
  const targets = [{ modId: 'NP1' }, { modId: 'DP1' }];

  it('an unconstrained boss desecration draws across BOTH sides (E = 3)', () => {
    // Blackblooded has one kurgal mod per side and both sides are legal, so the draw is 1-of-2:
    //   ½ → DP1, the target      ⇒ goal
    //   ½ → DS1, desecrated junk ⇒ blocks re-desecrating until it's annulled (P=1: nothing else is
    //                              removable, since NP1 is fractured), costing 1 to get back to start.
    //   E = 1 + ½·0 + ½·(1 + E)  ⇒  E = 3
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 }, omens: {} };
    const r = markovFromItem(data, prices, start, targets);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(3, 9);
    const s0 = r.nodes.find((nd) => nd.isStart)!;
    // In THIS base the untargeted draw and the Blackblooded one are the same distribution: NP1's
    // family is occupied (it's the fractured start mod) so the normal pool contributes nothing, and
    // both desecrated mods are kurgal. Two identical actions at an identical cost — the planner takes
    // the one that needs no omen. The arithmetic above is what this test is really pinning.
    expect(s0.action).toEqual({ currency: 'desecrate' });
    // The half that misses is a real regression edge (the brick), not a silent no-op.
    expect(r.edges.some((e) => e.from === s0.key && e.regress && Math.abs(e.prob - 0.5) < 1e-9)).toBe(true);
  });

  it('a Sinistral Necromancy omen narrows the draw to one side (P=1, E = 1.5) and the policy buys it', () => {
    // Constrained to prefixes, DP1 is the only kurgal candidate ⇒ P=1 for 1 + 0.5. That 1.5 beats the
    // unconstrained route's 3, so VI must prefer paying for the omen.
    const prices: Prices = {
      currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 },
      omens: { OmenofSinistralNecromancy: 0.5 },
    };
    const r = markovFromItem(data, prices, start, targets);
    expect(r.expectedCost).toBeCloseTo(1.5, 9);
    const s0 = r.nodes.find((nd) => nd.isStart)!;
    // Same tie as above on the boss half; what matters is that the SIDE omen is bought.
    expect(s0.action).toEqual({ currency: 'desecrate', side: 'prefix' });
  });

  it('a dear side omen is declined in favour of the cheaper unconstrained draw', () => {
    // Same shapes, but the omen now costs 4: constrained E = 5 vs unconstrained E = 3, so the policy
    // takes the 50/50 and eats the recovery. Pins that the omen is weighed, not always taken.
    const prices: Prices = {
      currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 },
      omens: { OmenofSinistralNecromancy: 4 },
    };
    const r = markovFromItem(data, prices, start, targets);
    expect(r.expectedCost).toBeCloseTo(3, 9);
    // No `side` key: the omen was weighed and declined.
    expect(r.nodes.find((nd) => nd.isStart)!.action).toEqual({ currency: 'desecrate' });
  });

  it('rejects a target holding two desecrated mods (an item carries at most one)', () => {
    const twoDes: PatchData = {
      patch: 't',
      mods: new Map([
        ...data.mods,
        ['DS2', mk('DS2', 'suffix', 'FdS2', 'desecrated', ['amanamu_mod'])],
      ]),
      bases: new Map([['S', {
        ...base,
        pools: { ...base.pools, desecrated: { prefixes: ['DP1'], suffixes: ['DS1', 'DS2'] } },
      }]]),
    };
    const b2 = twoDes.bases.get('S')!;
    const prices: Prices = { currency: { exalt: 1, annul: 1, desecrate: 1 }, omens: {} };
    const r = markovFromItem(twoDes, prices, { ...rare([placed('NP1', true)], []), base: b2 },
      [{ modId: 'DP1' }, { modId: 'DS2' }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/at most one desecrated mod/i);
  });

  // This used to be a rejection ("no boss omen to select it"), from back when every desecrate action
  // carried one. A boss tag decides only whether the draw can be NARROWED — the untargeted draw
  // reaches everything in the pool — so an untagged desecrated mod is reachable, just at longer odds.
  it('reaches a desecrated target with no boss omen, via the untargeted draw', () => {
    const noBoss: PatchData = {
      patch: 't',
      mods: new Map([...data.mods, ['DP1', mk('DP1', 'prefix', 'FdP', 'desecrated')]]), // no boss tag
      bases: new Map([['S', base]]),
    };
    // chaos: 99 like the fixtures above — `stepCost` treats a MISSING price as 0, so leaving it out
    // hands the policy a free Chaos Orb and the hand-computed arithmetic below collapses (E = 2).
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 }, omens: {} };
    const r = markovFromItem(noBoss, prices, start, targets);
    expect(r.feasible).toBe(true);
    // Untagged DP1 is in no boss pool, so a Blackblooded draw could never produce it. Only the
    // untargeted action can, which is what the policy must be playing.
    const desecrations = [...r.policy.values()].filter((a) => a.currency === 'desecrate');
    expect(desecrations.length).toBeGreaterThan(0);
    expect(desecrations.every((a) => a.boss === undefined)).toBe(true);
    // Same 1-of-2 shape as the tagged case (NP1's family is occupied, so only DP1 and DS1 are legal):
    //   E = 1 + ½·0 + ½·(1 + E) ⇒ E = 3.
    expect(r.expectedCost).toBeCloseTo(3, 9);
  });
});

describe('markovFromItem — Omen of Light clears desecrated junk (hand-computed)', () => {
  // Start [NP1 | DS1], target {NP1}: DS1 is desecrated junk squatting the suffix. Three ways to shift it:
  //   plain annul   — 1, but only ½ hits DS1 (NP1 is removable too) and the miss loses the target
  //   Dextral annul — priced dear at 5 here, P=1
  //   Omen of Light — 1 + 0.3, P=1 outright
  // ⇒ Light is the cheapest certainty at 1.3, so VI must pick it over both.
  const start = rare([placed('NP1')], [placed('DS1')]);
  const prices: Prices = {
    currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 },
    omens: { OmenofLight: 0.3, OmenofDextralAnnulment: 5 },
  };

  it('removes the desecrated mod outright (E = 1.3) and is chosen over a random or side annul', () => {
    const r = markovFromItem(data, prices, start, [{ modId: 'NP1' }]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(1.3, 9);
    const s0 = r.nodes.find((nd) => nd.isStart)!;
    expect(s0.action).toEqual({ currency: 'annul', light: true });
    // Deterministic: exactly one outgoing edge, at P=1, straight to the goal.
    const outs = r.edges.filter((e) => e.from === s0.key);
    expect(outs).toHaveLength(1);
    expect(outs[0]!.prob).toBeCloseTo(1, 12);
    expect(r.nodes.find((nd) => nd.key === outs[0]!.to)!.isGoal).toBe(true);
  });

  it('without the omen priced, the same craft falls back to the random annul', () => {
    // Drop OmenofLight from the sheet: the lever disappears (a missing price can't mint a free omen),
    // so the best remaining certainty is the dear Dextral annul at 5 — strictly worse than 1.3.
    const noLight: Prices = { ...prices, omens: { OmenofDextralAnnulment: 5 } };
    const r = markovFromItem(data, noLight, start, [{ modId: 'NP1' }]);
    const s0 = r.nodes.find((nd) => nd.isStart)!;
    expect(s0.action).not.toEqual({ currency: 'annul', light: true });
    expect(r.expectedCost).toBeGreaterThan(1.3);
  });
});

describe('markovFromItem — Perfect Essence as an MDP action (hand-computed)', () => {
  // Base P: normal prefix NP1 + normal suffix NS1, and a PERFECT-ESSENCE prefix PE1 in the essence pool.
  // PE1 has weight 0 — a perfect-essence mod never rolls from the normal pool, it is only ever forced on.
  const pbase: ItemBase = {
    id: 'P', name: 'P', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
    pools: {
      normal: { prefixes: ['NP1'], suffixes: ['NS1'] },
      desecrated: { prefixes: [], suffixes: [] },
      essence: { prefixes: ['PE1'], suffixes: [] },
    },
  };
  const pdata: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')],
      ['NS1', mk('NS1', 'suffix', 'Fs1', 'normal')],
      ['PE1', { ...mk('PE1', 'prefix', 'Fpe', 'perfect_essence'), tiers: [{ name: 't1', ilvl: 1, weight: 0, ranges: [], stats: [] }] }],
    ]),
    bases: new Map([['P', pbase]]),
  };
  const prare = (pre: ItemState['prefixes'], suf: ItemState['suffixes']): ItemState =>
    ({ base: pbase, level: 100, rarity: 'rare', prefixes: pre, suffixes: suf });

  it('a Crystallisation omen makes the removal certain, so the essence alone costs E = 15', () => {
    // Start [NP1 | NS1], target {NS1, PE1}. NP1 is the junk to feed the essence; NS1 must survive.
    // Raw essence: the removal is uniform over the 2 mods.
    //   ½ → eats NP1 ⇒ goal
    //   ½ → eats NS1 ⇒ PE1 lands but the wanted suffix is gone, and NS1 must be re-added
    // A Sinistral Crystallisation omen constrains the removal to prefixes, where NP1 is the only
    // candidate ⇒ P=1. Priced free here, so it strictly dominates: E = the essence price alone.
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, perfect_essence: 15 }, omens: { OmenofSinistralCrystallisation: 0 } };
    const r = markovFromItem(pdata, prices, prare([placed('NP1')], [placed('NS1')]), [{ modId: 'NS1' }, { modId: 'PE1' }]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(15, 9);
    expect(r.nodes.find((nd) => nd.isStart)!.action)
      .toEqual({ currency: 'perfect-essence', target: 'PE1', side: 'prefix' });
  });

  it('without the Crystallisation omen priced, the raw ½ essence is the only route', () => {
    // Same craft, omen unpriced ⇒ not offered (no free omens). The raw essence eats NS1 half the time,
    // and recovering costs an exalt to put NS1 back: E = 15 + ½·(cost of re-adding NS1).
    const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, perfect_essence: 15 }, omens: {} };
    const r = markovFromItem(pdata, prices, prare([placed('NP1')], [placed('NS1')]), [{ modId: 'NS1' }, { modId: 'PE1' }]);
    expect(r.feasible).toBe(true);
    const s0 = r.nodes.find((nd) => nd.isStart)!;
    expect(s0.action).toEqual({ currency: 'perfect-essence', target: 'PE1' });
    // The uniform removal over the item's 2 mods, pinned exactly: two outcomes at ½ each, and only the
    // one that ate the junk NP1 reaches the goal — the other keeps PE1 but has swallowed NS1.
    const outs = r.edges.filter((e) => e.from === s0.key);
    expect(outs).toHaveLength(2);
    for (const e of outs) expect(e.prob).toBeCloseTo(0.5, 12);
    expect(outs.filter((e) => r.nodes.find((nd) => nd.key === e.to)?.isGoal)).toHaveLength(1);
    expect(r.expectedCost).toBeGreaterThan(15); // strictly dearer than the guaranteed-removal route
  });

  it('is declined when its side is full and the removal could land elsewhere', () => {
    // Prefixes full (NP1 + two junk) and the essence wants a prefix. Unconstrained, the removal might
    // eat the suffix and leave no room, so the action isn't offered; a Sinistral omen makes it legal.
    const three: ItemState = prare(
      [placed('NP1'), placed('J1'), placed('J2')], [placed('NS1')]);
    const withJunk: PatchData = {
      ...pdata,
      mods: new Map([...pdata.mods,
        ['J1', mk('J1', 'prefix', 'Fj1', 'normal')], ['J2', mk('J2', 'prefix', 'Fj2', 'normal')]]),
    };
    const noOmen: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, perfect_essence: 15 }, omens: {} };
    const rNo = markovFromItem(withJunk, noOmen, three, [{ modId: 'NS1' }, { modId: 'PE1' }]);
    const startNo = rNo.nodes.find((nd) => nd.isStart)!;
    expect(startNo.action).not.toMatchObject({ currency: 'perfect-essence' });

    const withOmen: Prices = { ...noOmen, omens: { OmenofSinistralCrystallisation: 0 } };
    const rYes = markovFromItem(withJunk, withOmen, three, [{ modId: 'NS1' }, { modId: 'PE1' }]);
    const hasEssence = rYes.nodes.some((nd) => nd.action?.currency === 'perfect-essence');
    expect(hasEssence).toBe(true);
  });

  it('rejects a perfect-essence target that is not in the base essence pool', () => {
    const offPool: PatchData = {
      ...pdata,
      bases: new Map([['P', { ...pbase, pools: { ...pbase.pools, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const b = offPool.bases.get('P')!;
    const prices: Prices = { currency: { exalt: 1, annul: 1, perfect_essence: 15 }, omens: {} };
    const r = markovFromItem(offPool, prices, { ...prare([placed('NP1')], [placed('NS1')]), base: b },
      [{ modId: 'NS1' }, { modId: 'PE1' }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/essence pool/i);
  });
});
