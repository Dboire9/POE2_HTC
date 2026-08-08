import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
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
    const cost: Record<McAction, number> = { exalt: 1, annul: 1, 'annul-sinistral': 51, 'annul-dextral': 51, chaos: 100 };
    const mc = simulatePolicyMean(r, cost, 100_000);
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
    const c = (k: string) => rp.currency[k] ?? 0;
    const o = (k: string) => rp.omens[k] ?? 0;
    const cost: Record<McAction, number> = {
      exalt: c('exalt'), annul: c('annul'), chaos: c('chaos'),
      'annul-sinistral': c('annul') + o('OmenofSinistralAnnulment'), 'annul-dextral': c('annul') + o('OmenofDextralAnnulment'),
    };
    const mc = simulatePolicyMean(r, cost, 100_000);
    // 100k runs on a ~26ex mean ⇒ SE small; 3% tolerance covers sampling noise.
    expect(mc).toBeGreaterThan(r.expectedCost * 0.97);
    expect(mc).toBeLessThan(r.expectedCost * 1.03);
  });
});
