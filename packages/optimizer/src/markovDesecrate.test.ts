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
  id: 'S', name: 'S', category: 'C',
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
    expect(s0.action).toEqual({ currency: 'desecrate', boss: 'blackblooded' });
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
    expect(s0.action).toEqual({ currency: 'desecrate', boss: 'blackblooded', side: 'prefix' });
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
    expect(r.nodes.find((nd) => nd.isStart)!.action).toEqual({ currency: 'desecrate', boss: 'blackblooded' });
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

  it('rejects a desecrated target with no boss omen to select it', () => {
    const noBoss: PatchData = {
      patch: 't',
      mods: new Map([...data.mods, ['DP1', mk('DP1', 'prefix', 'FdP', 'desecrated')]]), // no boss tag
      bases: new Map([['S', base]]),
    };
    const prices: Prices = { currency: { exalt: 1, annul: 1, desecrate: 1 }, omens: {} };
    const r = markovFromItem(noBoss, prices, start, targets);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/no boss omen/i);
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
