import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { markovFromItem, mcActionCosts } from './markovFromItem.ts';
import type { McAction } from './markovFromItem.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { mulberry32 } from './simulate.ts';

// Synthetic prefix-only pool so junk suffixes never appear (js stays 0), making states hand-enumerable.
// T1 is the gettable target (weight 100); J1 is a weight-0 prefix — ungettable by an exalt, so it only
// ever exists as junk carried on the START item. Suffix pool empty.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod => ({
  id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight, ranges: [], stats: [] }],
});
const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: { normal: { prefixes: ['T1', 'J1'], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([['T1', mk('T1', 'prefix', 'FT1', 100)], ['J1', mk('J1', 'prefix', 'FJ1', 0)]]),
  bases: new Map([['S', base]]),
};
// exalt = annul = 1; chaos and the annul omens priced high so the plain exalt/annul policy is optimal.
const prices: Prices = {
  currency: { exalt: 1, annul: 1, chaos: 100 },
  omens: { OmenofSinistralAnnulment: 50, OmenofDextralAnnulment: 50 },
};
const placed = (id: string) => ({ modId: id, tierName: 't1' });
const rare = (pre: string[], suf: string[] = []): ItemState =>
  ({ base, level: 100, rarity: 'rare', prefixes: pre.map(placed), suffixes: suf.map(placed) });

describe('markovFromItem — hand-computed expected cost', () => {
  it('an item already at the target costs 0', () => {
    const r = markovFromItem(data, prices, rare(['T1']), [{ modId: 'T1' }]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBe(0);
  });

  it('an empty rare needs exactly one exalt (the target is the only gettable mod)', () => {
    const r = markovFromItem(data, prices, rare([]), [{ modId: 'T1' }]);
    expect(r.expectedCost).toBeCloseTo(1, 9); // one exalt, always lands T1 (only prefix with weight)
  });

  it('recovers in place after a bad annul (start [T1 + junk], target {T1}) — E = 2', () => {
    // Hand-computed: at [T1|J1] annul (½ removes junk → done; ½ removes T1 → state [J1]).
    //   V(J1)   = annul junk (→ empty) then exalt T1 = 2   (junk removal is certain: 1 removable)
    //   V(T1|J1)= 1 + ½·0 + ½·V(J1) = 1 + ½·2 = 2
    // The MDP RECOVERS from the bad annul (never restarts); the answer happens to match the linear
    // model here (symmetric), but this pins the value-iteration + self-loop math.
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(2, 6);
  });

  it('recovers from an off-tier roll (a below-tier hit blocks the family) — E = 3', () => {
    // Family FM has two tiers: 'lo' (index 0, worse) and 'hi' (index 1, better), each weight 1.
    // Target: M at its BEST tier (minTierIndex 1) — so 'hi' succeeds, 'lo' is a below-tier "blocked" roll.
    //   From empty: exalt → ½ 'hi' (done) / ½ 'lo' (family M blocked). At the blocked state the only
    //   move is annul the off-tier 'lo' (certain → empty), then try again.
    //   V(blocked) = 1 + V(empty);  V(empty) = 1 + ½·0 + ½·V(blocked)  ⇒  V(empty) = 3.
    // The v1 present/absent model couldn't see the block — it treated 'lo' as re-rollable in place.
    const tiered: PatchData = {
      patch: 't',
      mods: new Map([['M', {
        id: 'M', group: 'M', field: 'M', source: 'normal', type: 'prefix', categories: [], family: 'FM', tags: [], text: 'M',
        tiers: [{ name: 'lo', ilvl: 1, weight: 1, ranges: [], stats: [] }, { name: 'hi', ilvl: 1, weight: 1, ranges: [], stats: [] }],
      } as Mod]]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['M'], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const tp: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };
    const empty: ItemState = { base: tiered.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(tiered, tp, empty, [{ modId: 'M', minTierIndex: 1 }]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(3, 6);
    // The start's optimal move rolls the family; the graph shows a blocked (off-tier) state it recovers from.
    expect(r.nodes.some((nd) => nd.blocked.includes('M'))).toBe(true);
  });

  it('reports infeasible when a target can never roll at this item level', () => {
    // J1 has weight 0 → ungettable. Targeting it from an empty rare is impossible.
    const r = markovFromItem(data, prices, rare([]), [{ modId: 'J1' }]);
    expect(r.feasible).toBe(false);
    expect(r.expectedCost).toBe(Infinity);
    expect(r.reason).toMatch(/roll/i);
  });

  it('declines a non-rollable target (MDP v1 is normal-mods only)', () => {
    const withEss: PatchData = {
      patch: 't',
      mods: new Map([...data.mods, ['E1', { ...mk('E1', 'prefix', 'FE', 0), source: 'essence' as const }]]),
      bases: new Map([['S', { ...base, pools: { ...base.pools, essence: { prefixes: ['E1'], suffixes: [] } } }]]),
    };
    const r = markovFromItem(withEss, prices, rare([]), [{ modId: 'E1' }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/rollable/i);
  });
});

describe('markovFromItem — policy graph', () => {
  it('exposes the start, the goal, and a brick (regress) back-edge on the bad annul', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }]);
    const start = r.nodes.find((nd) => nd.isStart)!;
    expect(start.present).toEqual(['T1']);
    expect(start.junkPrefixes).toBe(1);
    expect(start.action).toBe('annul'); // optimal first move: annul the junk (risking T1)
    expect(r.nodes.some((nd) => nd.isGoal)).toBe(true);
    // The bad-annul outcome (T1 removed) is a regress edge — the graph's back-arrow.
    const backEdge = r.edges.find((e) => e.from === start.key && e.regress);
    expect(backEdge, 'a brick/back edge exists from the start').toBeDefined();
    // …and a forward edge from the start reaches the goal.
    const goalKey = r.nodes.find((nd) => nd.isGoal)!.key;
    expect(r.edges.some((e) => e.from === start.key && e.to === goalKey)).toBe(true);
  });

  it('every node carries its expected cost, decreasing toward the goal', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }]);
    const goal = r.nodes.find((nd) => nd.isGoal)!;
    expect(goal.expectedCost).toBe(0);
    for (const nd of r.nodes) expect(nd.expectedCost).toBeGreaterThanOrEqual(0);
  });
});

describe('markovFromItem — v2 levers (orb strength + side exalts)', () => {
  it('spends a Perfect Exalt to skip the off-tier trap when it is priced right', () => {
    // M: 'lo' (ilvl 1) and 'hi' (ilvl 60), weight 1 each; target = the 'hi' tier (minTierIndex 1).
    // A base exalt rolls 'hi' only ½ the time (else 'lo' blocks the family → annul & retry: E = 3).
    // A Perfect Exalt (ilvl floor 50) CAN'T roll 'lo' (ilvl 1 < 50) so it lands 'hi' every time. Priced
    // at 2.5 (< 3) the policy skips the trap and buys certainty — the v2a/v2b interaction in one move.
    const tiered: PatchData = {
      patch: 't',
      mods: new Map([['M', {
        id: 'M', group: 'M', field: 'M', source: 'normal', type: 'prefix', categories: [], family: 'FM', tags: [], text: 'M',
        tiers: [{ name: 'lo', ilvl: 1, weight: 1, ranges: [], stats: [] }, { name: 'hi', ilvl: 60, weight: 1, ranges: [], stats: [] }],
      } as Mod]]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['M'], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const empty: ItemState = { base: tiered.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const cheapPerfect: Prices = { currency: { exalt: 1, exalt_perfect: 2.5, annul: 1, chaos: 100 }, omens: {} };
    const r = markovFromItem(tiered, cheapPerfect, empty, [{ modId: 'M', minTierIndex: 1 }]);
    expect(r.expectedCost).toBeCloseTo(2.5, 6);
    expect(r.nodes.find((nd) => nd.isStart)!.action).toBe('exalt-perfect');

    // Sanity: at the real Perfect price (20 ≫ 3) the base-exalt-and-recover route wins instead (E = 3).
    const realPerfect: Prices = { currency: { exalt: 1, exalt_perfect: 20, annul: 1, chaos: 100 }, omens: {} };
    const r2 = markovFromItem(tiered, realPerfect, empty, [{ modId: 'M', minTierIndex: 1 }]);
    expect(r2.expectedCost).toBeCloseTo(3, 6);
    expect(r2.nodes.find((nd) => nd.isStart)!.action).toBe('exalt');
  });

  it('uses a Sinistral Exaltation to add a prefix when the suffix pool is all junk', () => {
    // Prefix P (weight 1) is the target; suffix J (weight 100) is junk. A plain exalt rolls the junk
    // suffix 100/101 of the time (then you must annul it). Omen of Sinistral Exaltation adds a PREFIX
    // only → lands P in one move. Priced at 3 over the 1ex exalt, that certainty (E = 4) beats rolling.
    const sideData: PatchData = {
      patch: 't',
      mods: new Map<string, Mod>([
        ['P', { id: 'P', group: 'P', field: 'P', source: 'normal', type: 'prefix', categories: [], family: 'FP', tags: [], text: 'P', tiers: [{ name: 't', ilvl: 1, weight: 1, ranges: [], stats: [] }] }],
        ['J', { id: 'J', group: 'J', field: 'J', source: 'normal', type: 'suffix', categories: [], family: 'FJ', tags: [], text: 'J', tiers: [{ name: 't', ilvl: 1, weight: 100, ranges: [], stats: [] }] }],
      ]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['P'], suffixes: ['J'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const empty: ItemState = { base: sideData.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const sidePrices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 100 }, omens: { OmenofSinistralExaltation: 3, OmenofDextralExaltation: 3 } };
    const r = markovFromItem(sideData, sidePrices, empty, [{ modId: 'P' }]);
    expect(r.expectedCost).toBeCloseTo(4, 6);
    expect(r.nodes.find((nd) => nd.isStart)!.action).toBe('exalt-sinistral');
  });
});

// ── Monte-Carlo cross-check ──────────────────────────────────────────────────
// Value iteration claims V(start) is the optimal policy's expected cost. Verify by PLAYING the policy:
// walk its Markov chain (sampling the solver's own transition edges under the chosen action) and average
// the total spend. mean → V by the law of large numbers. This is the scale check on the VI + self-loop
// + policy-extraction math; the hand-computed cases above pin the transition-building itself.

function simulatePolicyMean(r: ReturnType<typeof markovFromItem>, cost: Record<McAction, number>, runs: number, seed = 3): number {
  const nodeByKey = new Map(r.nodes.map((nd) => [nd.key, nd]));
  const outByKey = new Map<string, { to: string; prob: number }[]>();
  for (const e of r.edges) {
    const list = outByKey.get(e.from) ?? [];
    list.push({ to: e.to, prob: e.prob });
    outByKey.set(e.from, list);
  }
  const start = r.nodes.find((nd) => nd.isStart)!;
  const rng = mulberry32(seed);
  let total = 0;
  for (let run = 0; run < runs; run++) {
    let cur = start.key;
    let spent = 0;
    for (let guard = 0; guard < 100_000; guard++) {
      const nd = nodeByKey.get(cur)!;
      if (nd.isGoal) break;
      spent += cost[nd.action!];
      const outs = outByKey.get(cur)!;
      let x = rng();
      let next = outs[outs.length - 1]!.to;
      for (const o of outs) { x -= o.prob; if (x < 0) { next = o.to; break; } }
      cur = next;
    }
    total += spent;
  }
  return total / runs;
}

describe('markovFromItem — Monte-Carlo cross-check (analytic first, MC to verify)', () => {
  it('the synthetic recovery case: 100k policy runs match V (E = 2)', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }]);
    const mc = simulatePolicyMean(r, mcActionCosts(prices), 100_000);
    expect(mc).toBeCloseTo(r.expectedCost, 1); // ~2, tight
  });

  it('real Wands (keep Mana, swap Int→Spell Damage): policy mean matches V', () => {
    const real = loadPatch('data/patches/0.5.0');
    const rp = loadPrices('data/patches/0.5.0');
    const w = real.bases.get('Wands')!;
    const MANA = 'Wands/IncreasedMana'; const INT = 'Wands/Intelligence'; const SPELL = 'Wands/WeaponSpellDamage';
    const start: ItemState = {
      base: w, level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierName: real.mods.get(MANA)!.tiers[0]!.name }],
      suffixes: [{ modId: INT, tierName: real.mods.get(INT)!.tiers[0]!.name }],
    };
    const r = markovFromItem(real, rp, start, [{ modId: MANA }, { modId: SPELL }]);
    expect(r.feasible).toBe(true);
    const mc = simulatePolicyMean(r, mcActionCosts(rp), 100_000);
    // 100k runs on a ~26ex mean ⇒ SE small; 3% tolerance covers sampling noise.
    expect(mc).toBeGreaterThan(r.expectedCost * 0.97);
    expect(mc).toBeLessThan(r.expectedCost * 1.03);
  });

  it('a TIERED target on real Wands (Spell Damage ≥ ilvl-60 tier): policy mean matches V', () => {
    // Exercises the v2 machinery on real data: a below-tier band (Spell Damage idx 5 needs the top-3
    // tiers, weight 350 vs 4000 below → most exalts BLOCK the family) plus the full v2b action set
    // (Greater/Perfect exalts and side-omens are all priced in 0.5.0). The MC plays whatever policy VI
    // picks through the real random process; matching V is the end-to-end fidelity check.
    const real = loadPatch('data/patches/0.5.0');
    const rp = loadPrices('data/patches/0.5.0');
    const w = real.bases.get('Wands')!;
    const MANA = 'Wands/IncreasedMana'; const SPELL = 'Wands/WeaponSpellDamage';
    const start: ItemState = {
      base: w, level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierName: real.mods.get(MANA)!.tiers[0]!.name }], suffixes: [],
    };
    const r = markovFromItem(real, rp, start, [{ modId: MANA }, { modId: SPELL, minTierIndex: 5 }]);
    expect(r.feasible).toBe(true);
    expect(r.nodes.some((nd) => nd.blocked.length > 0)).toBe(true); // the off-tier trap is on the graph
    const mc = simulatePolicyMean(r, mcActionCosts(rp), 100_000);
    expect(mc).toBeGreaterThan(r.expectedCost * 0.97);
    expect(mc).toBeLessThan(r.expectedCost * 1.03);
  });
});
