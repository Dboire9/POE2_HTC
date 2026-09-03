import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { markovFromItem, actionCostOf } from './markovFromItem.ts';
import type { McAction } from './markovFromItem.ts';
import type { Prices } from './cost.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { mulberry32 } from './simulate.ts';
import { bit, decodeState, enumerateStates, popcount, sideIndexOf } from './markovState.ts';
import type { McTarget, StateKey } from './markovState.ts';

/**
 * The tolerance these hand-computed cases need.
 *
 * The DEFAULT stopping rule is scale-aware — a thousandth of the craft's cheapest action — because a
 * flat 1e-9 makes a multi-million-exalt solve grind fifteen decades of residual for digits nobody has.
 * These tests are pinning the model's ARITHMETIC to nine decimals, not the stopping rule, so they ask
 * for the precision they assert. A test that the default is scale-aware lives in markovFromItem.test.ts.
 */
const EXACT = { tolerance: 1e-12 } as const;

// Synthetic prefix-only pool so junk suffixes never appear (js stays 0), making states hand-enumerable.
// T1 is the gettable target (weight 100); J1 is a weight-0 prefix — ungettable by an exalt, so it only
// ever exists as junk carried on the START item. Suffix pool empty.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod => ({
  id, source: 'normal', type, family, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight, ranges: [] }],
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
    const r = markovFromItem(data, prices, rare(['T1']), [{ modId: 'T1' }], EXACT);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBe(0);
  });

  /**
   * …and it answers WITHOUT building the lattice, which is a different claim from costing 0.
   *
   * Reachable in two clicks, and it was costing real time. The Item tab's "Copy my current mods" sets
   * every target to `tiers.length` — the WORST tier — so whatever you hold satisfies it by
   * construction. Compute then solved the whole state space to reach zero: measured on a finished
   * 6-mod Wand at **16.3 s on Standard and 71.1 s on Exhaustive**, and Standard ran out of clock on
   * the way, so it returned `bound: 'lower'` on a cost of zero and the panel rendered "≥ 0 ex" under
   * the heading `True expected cost`. Both are 1-2 ms now.
   *
   * `policy` is the assertion that carries this. It holds one entry per non-goal state, so an empty
   * policy means no state space was ever built — where cost alone would pass just as happily after a
   * full solve, and a timing assertion would be flaky. `bound: 'exact'` is the second half: a
   * short-circuit must never come back as a bound, which is exactly what the clock-limited path did.
   */
  it('answers an already-finished item without building a state space at all', () => {
    const r = markovFromItem(data, prices, rare(['T1']), [{ modId: 'T1' }], EXACT);
    expect(r.policy.size).toBe(0);
    expect(r.edges).toEqual([]);
    expect(r.bound).toBe('exact'); // never "≥ 0"
    expect(r.converged).toBe(true);
    // One square, and it is both ends of the graph — so the UI draws "✓ target" and nothing else.
    expect(r.nodes).toHaveLength(1);
    expect(r.nodes[0]!.isStart).toBe(true);
    expect(r.nodes[0]!.isGoal).toBe(true);
    expect(r.nodes[0]!.expectedCost).toBe(0);
    expect(r.nodes[0]!.present).toEqual([['T1']]);
    expect(r.nodes[0]!.blocked).toEqual([]);
  });

  // The guard must not swallow a craft that merely LOOKS finished. Junk on the item is not accepting —
  // the target is "these mods and nothing else" — so this one still has to be solved properly.
  it('does not short-circuit an item carrying junk alongside the target', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
    expect(r.expectedCost).toBeGreaterThan(0);
    expect(r.policy.size).toBeGreaterThan(0);
  });

  it('an empty rare needs exactly one exalt (the target is the only gettable mod)', () => {
    const r = markovFromItem(data, prices, rare([]), [{ modId: 'T1' }], EXACT);
    expect(r.expectedCost).toBeCloseTo(1, 9); // one exalt, always lands T1 (only prefix with weight)
  });

  it('recovers in place after a bad annul (start [T1 + junk], target {T1}) — E = 2', () => {
    // Hand-computed: at [T1|J1] annul (½ removes junk → done; ½ removes T1 → state [J1]).
    //   V(J1)   = annul junk (→ empty) then exalt T1 = 2   (junk removal is certain: 1 removable)
    //   V(T1|J1)= 1 + ½·0 + ½·V(J1) = 1 + ½·2 = 2
    // The MDP RECOVERS from the bad annul (never restarts); the answer happens to match the linear
    // model here (symmetric), but this pins the value-iteration + self-loop math.
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
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
        id: 'M', source: 'normal', type: 'prefix', family: 'FM', tags: [], text: 'M',
        tiers: [{ name: 'lo', ilvl: 1, weight: 1, ranges: [] }, { name: 'hi', ilvl: 1, weight: 1, ranges: [] }],
      }]]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['M'], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const tp: Prices = { currency: { exalt: 1, annul: 1, chaos: 100 }, omens: {} };
    const empty: ItemState = { base: tiered.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(tiered, tp, empty, [{ modId: 'M', minTierIndex: 1 }], EXACT);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeCloseTo(3, 6);
    // The start's optimal move rolls the family; the graph shows a blocked (off-tier) state it recovers from.
    expect(r.nodes.some((nd) => nd.blocked.some((ids) => ids.includes('M')))).toBe(true);
  });

  it('reports infeasible when a target can never roll at this item level', () => {
    // J1 has weight 0 → ungettable. Targeting it from an empty rare is impossible.
    const r = markovFromItem(data, prices, rare([]), [{ modId: 'J1' }]);
    expect(r.feasible).toBe(false);
    expect(r.expectedCost).toBe(Infinity);
    expect(r.reason).toMatch(/roll/i);
  });

  /**
   * This assertion is the INVERSE of the one it replaces, and the flip is the point.
   *
   * It used to read "blames the missing action rather than the rarity", because the model had no
   * Essence action at all — so naming the Magic item would have described a limit that was not the
   * binding one. The action exists as of 2026-08-28, and now the rarity IS the binding constraint: a
   * regular Essence works on a Magic item, so from a Rare there is genuinely no route. Saying so is
   * the actionable answer; "no Essence action" would now be false.
   */
  it('declines a REGULAR-essence target on a held RARE, naming the rarity that blocks it', () => {
    const essBase = { ...base, pools: { ...base.pools, essence: { prefixes: ['E1'], suffixes: [] } } };
    const withEss: PatchData = {
      patch: 't',
      mods: new Map([...data.mods, ['E1', { ...mk('E1', 'prefix', 'FE', 0), source: 'essence' as const }]]),
      bases: new Map([['S', essBase]]),
    };
    // The ITEM must carry the pool-bearing base too — `markovFromItem` reads `start.base.pools`, not
    // the one in `data.bases`, so a fixture that updates only the map tests the pool check instead.
    const held: ItemState = { base: essBase, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const r = markovFromItem(withEss, prices, held, [{ modId: 'E1' }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/needs a Magic item/i);
    expect(r.reason).not.toMatch(/craft it from white/i); // still not advice a from-white crafter needs
  });
});

// A craft on the item already in your stash cannot be restarted, so it is solved push-forward only:
// 0-initialised VI that CLIMBS to the fixed point. Truncating it therefore leaves a floor — the
// opposite direction from the from-white solve above, and the reason `bound` is carried rather than
// inferred from `converged` at the point of display.
describe('markovFromItem — a truncated push-forward solve is a LOWER bound', () => {
  it('quotes under the hand-computed value, and says so', () => {
    const full = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
    const cut = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], { maxIters: 1 });
    expect(full.bound).toBe('exact');
    expect(full.expectedCost).toBeCloseTo(2, 6);
    expect(cut.bound).toBe('lower');
    expect(cut.converged).toBe(false);
    expect(cut.expectedCost).toBeLessThan(full.expectedCost);
  });
});

describe('markovFromItem — policy graph', () => {
  it('exposes the start, the goal, and a brick (regress) back-edge on the bad annul', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
    const start = r.nodes.find((nd) => nd.isStart)!;
    expect(start.present).toEqual([['T1']]); // one entry per filled POSITION, holding its member ids
    expect(start.junkPrefixes).toBe(1);
    expect(start.action).toEqual({ currency: 'annul' }); // optimal first move: annul the junk (risking T1)
    expect(r.nodes.some((nd) => nd.isGoal)).toBe(true);
    // The bad-annul outcome (T1 removed) is a regress edge — the graph's back-arrow.
    const backEdge = r.edges.find((e) => e.from === start.key && e.regress);
    expect(backEdge, 'a brick/back edge exists from the start').toBeDefined();
    // …and a forward edge from the start reaches the goal.
    const goalKey = r.nodes.find((nd) => nd.isGoal)!.key;
    expect(r.edges.some((e) => e.from === start.key && e.to === goalKey)).toBe(true);
  });

  it('every node carries its expected cost, decreasing toward the goal', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
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
        id: 'M', source: 'normal', type: 'prefix', family: 'FM', tags: [], text: 'M',
        tiers: [{ name: 'lo', ilvl: 1, weight: 1, ranges: [] }, { name: 'hi', ilvl: 60, weight: 1, ranges: [] }],
      }]]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['M'], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const empty: ItemState = { base: tiered.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const cheapPerfect: Prices = { currency: { exalt: 1, exalt_perfect: 2.5, annul: 1, chaos: 100 }, omens: {} };
    const r = markovFromItem(tiered, cheapPerfect, empty, [{ modId: 'M', minTierIndex: 1 }], EXACT);
    expect(r.expectedCost).toBeCloseTo(2.5, 6);
    expect(r.nodes.find((nd) => nd.isStart)!.action).toEqual({ currency: 'exalt', strength: 'perfect' });

    // Sanity: at the real Perfect price (20 ≫ 3) the base-exalt-and-recover route wins instead (E = 3).
    const realPerfect: Prices = { currency: { exalt: 1, exalt_perfect: 20, annul: 1, chaos: 100 }, omens: {} };
    const r2 = markovFromItem(tiered, realPerfect, empty, [{ modId: 'M', minTierIndex: 1 }], EXACT);
    expect(r2.expectedCost).toBeCloseTo(3, 6);
    expect(r2.nodes.find((nd) => nd.isStart)!.action).toEqual({ currency: 'exalt', strength: 'base' });
  });

  it('uses a Sinistral Exaltation to add a prefix when the suffix pool is all junk', () => {
    // Prefix P (weight 1) is the target; suffix J (weight 100) is junk. A plain exalt rolls the junk
    // suffix 100/101 of the time (then you must annul it). Omen of Sinistral Exaltation adds a PREFIX
    // only → lands P in one move. Priced at 3 over the 1ex exalt, that certainty (E = 4) beats rolling.
    const sideData: PatchData = {
      patch: 't',
      mods: new Map<string, Mod>([
        ['P', { id: 'P', source: 'normal', type: 'prefix', family: 'FP', tags: [], text: 'P', tiers: [{ name: 't', ilvl: 1, weight: 1, ranges: [] }] }],
        ['J', { id: 'J', source: 'normal', type: 'suffix', family: 'FJ', tags: [], text: 'J', tiers: [{ name: 't', ilvl: 1, weight: 100, ranges: [] }] }],
      ]),
      bases: new Map([['S', { ...base, pools: { normal: { prefixes: ['P'], suffixes: ['J'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } } }]]),
    };
    const empty: ItemState = { base: sideData.bases.get('S')!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] };
    const sidePrices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 100 }, omens: { OmenofSinistralExaltation: 3, OmenofDextralExaltation: 3 } };
    const r = markovFromItem(sideData, sidePrices, empty, [{ modId: 'P' }]);
    expect(r.expectedCost).toBeCloseTo(4, 6);
    expect(r.nodes.find((nd) => nd.isStart)!.action).toEqual({ currency: 'exalt', strength: 'base', side: 'prefix' });
  });
});

// ── Monte-Carlo cross-check ──────────────────────────────────────────────────
// Value iteration claims V(start) is the optimal policy's expected cost. Verify by PLAYING the policy:
// walk its Markov chain (sampling the solver's own transition edges under the chosen action) and average
// the total spend. mean → V by the law of large numbers. This is the scale check on the VI + self-loop
// + policy-extraction math; the hand-computed cases above pin the transition-building itself.

function simulatePolicyMean(r: ReturnType<typeof markovFromItem>, costFn: (action: McAction) => number, runs: number, seed = 3): number {
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
      spent += costFn(nd.action!);
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
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }], EXACT);
    const mc = simulatePolicyMean(r, (a) => actionCostOf(prices, a), 100_000);
    expect(mc).toBeCloseTo(r.expectedCost, 1); // ~2, tight
  });

  it('real Wands (keep Mana, swap Int→Spell Damage): policy mean matches V', () => {
    const real = loadPatch('data/patches/0.5.0');
    const rp = loadFrozenPrices();
    const w = real.bases.get('Wands')!;
    const MANA = 'Wands/IncreasedMana'; const INT = 'Wands/Intelligence'; const SPELL = 'Wands/WeaponSpellDamage';
    const start: ItemState = {
      base: w, level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierName: real.mods.get(MANA)!.tiers[0]!.name }],
      suffixes: [{ modId: INT, tierName: real.mods.get(INT)!.tiers[0]!.name }],
    };
    const r = markovFromItem(real, rp, start, [{ modId: MANA }, { modId: SPELL }]);
    expect(r.feasible).toBe(true);
    const mc = simulatePolicyMean(r, (a) => actionCostOf(rp, a), 100_000);
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
    const rp = loadFrozenPrices();
    const w = real.bases.get('Wands')!;
    const MANA = 'Wands/IncreasedMana'; const SPELL = 'Wands/WeaponSpellDamage';
    const start: ItemState = {
      base: w, level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierName: real.mods.get(MANA)!.tiers[0]!.name }], suffixes: [],
    };
    const r = markovFromItem(real, rp, start, [{ modId: MANA }, { modId: SPELL, minTierIndex: 5 }]);
    expect(r.feasible).toBe(true);
    expect(r.nodes.some((nd) => nd.blocked.length > 0)).toBe(true); // the off-tier trap is on the graph
    const mc = simulatePolicyMean(r, (a) => actionCostOf(rp, a), 100_000);
    expect(mc).toBeGreaterThan(r.expectedCost * 0.97);
    expect(mc).toBeLessThan(r.expectedCost * 1.03);
    // This one is the suite's heaviest (~3.2s alone, ~4.2s under parallel load): value iteration over
    // the tiered lattice plus 100k MC runs. It's covered by the global testTimeout in
    // vitest.config.ts — the RNG is seeded, so any failure here is a real number, not a flake.
  });
});

// The craft that produced this test, reported from the live app: a Rare wand carrying Chaos Damage +
// Cast Speed as junk, targeting five top-tier mods. It does not converge, so value iteration runs its
// whole `maxIters` budget — and the solve phase used to `report(...)` on EVERY sweep. At the 100k
// default that is ~100,001 messages describing at most 1001 distinct values, so ~99% of them repainted
// the progress bar with the number it already had.
//
// In node that is invisible (the callback is a function call). In the browser every report crosses the
// worker boundary as a postMessage and wakes a React re-render, which is what turned a ~24-second
// solve into a ten-minute wait. The two earlier phases were already strided; this one was missed.
//
// Asserting on message COUNT alone would need a magic number; asserting no two CONSECUTIVE reports
// carry the same value is exactly the invariant the throttle establishes, and per-sweep reporting
// violates it immediately.
describe('markovFromItem — progress reporting', () => {
  it('never sends the same progress number twice in a row', () => {
    const real = loadPatch('data/patches/0.5.0');
    const rp = loadFrozenPrices();
    const w = real.bases.get('Wands')!;
    const start: ItemState = {
      base: w, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'Wands/ChaosDamageWeaponPrefix', tierName: real.mods.get('Wands/ChaosDamageWeaponPrefix')!.tiers[0]!.name }],
      suffixes: [{ modId: 'Wands/IncreasedCastSpeed', tierName: real.mods.get('Wands/IncreasedCastSpeed')!.tiers[0]!.name }],
    };
    const targets = [
      'Wands/SpellCriticalStrikeMultiplier', 'Wands/SpellCriticalStrikeChance', 'Wands/ManaRegeneration',
      'Wands/WeaponSpellDamage', 'Wands/ColdDamageWeaponPrefix',
    ].map((modId) => ({ modId, minTierIndex: 0 })); // top tier — the long shot that stalls VI

    const solve: number[] = [];
    // `maxIters` well above 1000 so the budget measure alone changes on ~1 sweep in 3: per-sweep
    // reporting would emit ~3000 values with heavy repetition, the throttle emits at most 1001.
    //
    // The tight `tolerance` is what makes the premise below hold. It used to hold by itself — this
    // craft could not settle at the old flat 1e-9 — but the default is scale-aware now and the craft
    // converges under it, which would leave the throttle untested rather than failing loudly. Asking
    // for the old criterion keeps the test measuring what it was written for.
    const r = markovFromItem(real, rp, start, targets, {
      maxIters: 3_000,
      tolerance: 1e-9,
      // Desecration excluded, which has nothing to do with the throttle and everything to do with the
      // clock: a Wand bone is 0.20ex against a 1.00ex Exalt, so the price gate opens the flag axis and
      // multiplies this lattice ~5x. That took the test from ~3s to 14s locally and past CI's 30s
      // ceiling. What it needs is a solve that reports a lot without settling, and the smaller lattice
      // still gives exactly that.
      policy: { excluded: new Set(['desecrate']) },
      onProgress: (p) => { if (p.phase === 'solve') solve.push(p.done); },
    });

    expect(r.converged).toBe(false); // the premise: this craft really does burn the whole budget
    expect(solve.length).toBeGreaterThan(1); // …and really does report, so the assertion has teeth
    const repeats = solve.filter((v, i) => i > 0 && v === solve[i - 1]);
    expect(repeats).toEqual([]);
    // At most one message per distinct permille the UI could render.
    expect(solve.length).toBeLessThanOrEqual(1001);
  });
});

/**
 * The stopping rule scales with the craft, and the seed stays on the safe side of the fixed point.
 *
 * A flat 1e-9 made a multi-million-exalt solve grind fifteen decades of residual to settle digits
 * neither the price sheet nor the player has: measured on a 5-target from-white Wand, 10.2 s against
 * 5.0 s at 1e-3, for answers differing by 0.0005%. The default is now a thousandth of the craft's
 * cheapest action.
 *
 * That has a cost the tests have to hold down. Phase B is an upper bound ONLY because phase A reached
 * a fixed point, and stopping phase A early breaks that by up to `tolerance` — so the seed is scaled by
 * `cheapest / (cheapest − tol)` first, which keeps it excessive exactly rather than approximately.
 */
describe('markovFromItem — the stopping rule scales with the craft', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const wand = real.bases.get('Wands')!;
  const white: ItemState = { base: wand, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  const targets = [{ modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/ManaRegeneration' }];

  it('agrees with an exhaustive tolerance, and errs on the dear side when it differs', () => {
    const scaleAware = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    const exhaustive = markovFromItem(real, rp, white, targets, { restartCost: 0, ...EXACT });
    expect(scaleAware.converged && exhaustive.converged).toBe(true);
    // BRACKETED, not just bounded. Measured at 1.0e-3 to 1.4e-3 on 4- and 5-target from-white crafts:
    // small enough that `formatCost` cannot render it and the price sheet cannot support it, but large
    // enough to prove the default really is a scale-aware loosening. Put the flat 1e-9 back and the gap
    // collapses through the floor — which an upper bound alone would not have caught, since 1e-9 also
    // stops (imperceptibly) above the limit and so passes any one-sided check.
    const rel = Math.abs(scaleAware.expectedCost / exhaustive.expectedCost - 1);
    expect(rel).toBeLessThan(5e-3);
    expect(rel).toBeGreaterThan(1e-5);
    // …and DIRECTIONAL, which is the half that matters. Phase B descends, so stopping early leaves the
    // value above its limit: the number overstates a craft's cost and never flatters it. A symmetric
    // closeness check would pass just as happily on an answer that was too cheap.
    //
    // STRICTLY greater, which also pins that the default is looser than exhaustive — revert it to a
    // flat 1e-9 and the two solves become the same solve, so the inequality collapses and this fails.
    expect(scaleAware.expectedCost).toBeGreaterThan(exhaustive.expectedCost);
  });

  /**
   * The guarantee the repair exists for: a truncated phase B must report a cost the truth is UNDER.
   *
   * Without the seed repair the sequence can start a hair below the fixed point and the "≤ x" the UI
   * prints becomes false — by a rounding error, but false. Checked at several sweep budgets, each of
   * which truncates phase B at a different point.
   */
  it('never quotes an upper bound below the converged cost', () => {
    const exact = markovFromItem(real, rp, white, targets, { restartCost: 0, ...EXACT });
    expect(exact.converged).toBe(true);
    let sawATruncatedRun = false;
    for (const maxIters of [400, 700, 1_000, 2_000]) {
      const cut = markovFromItem(real, rp, white, targets, { restartCost: 0, maxIters });
      if (!cut.feasible) continue; // too few sweeps even to seed — a different assertion's business
      if (!cut.converged) {
        sawATruncatedRun = true;
        expect(cut.bound).toBe('upper');
      }
      expect(cut.expectedCost).toBeGreaterThanOrEqual(exact.expectedCost);
    }
    expect(sawATruncatedRun).toBe(true); // or the loop proved nothing
  });
});

// A craft from a WHITE BASE, which this model refused outright until the state gained a rarity axis.
// The Lab tab — the app's primary mode — therefore had no true-cost model and no policy graph at all.
describe('markovFromItem — from a white base', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const wand = real.bases.get('Wands')!;
  const white: ItemState = { base: wand, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  const targets = [{ modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/ManaRegeneration' }];

  it('climbs Normal → Magic → Rare instead of refusing the craft', () => {
    const r = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    expect(r.feasible).toBe(true);
    // The only move available on a white base is a Transmute; an Exalt, a Chaos, a Desecration and a
    // Perfect Essence all need a Rare item and must not be offered here.
    expect(r.nodes.find((nd) => nd.isStart)!.action!.currency).toBe('transmute');
    const played = new Set([...r.policy.values()].map((a) => a.currency));
    expect(played.has('transmute')).toBe(true);
    expect(played.has('regal')).toBe(true);
  });

  /**
   * The restart action is a CORRECTNESS requirement here, not a refinement.
   *
   * Without it the policy cannot bin a bad Transmute — the item is already Magic and there is no way
   * back to Normal — so it has to dig out with a 158.7ex Annulment instead of throwing away 0.18ex and
   * rerolling. Measured on this craft: 3607ex against 43ex, an 83x overestimate. Any from-white number
   * produced without it would be wrong in the same direction the app has already been caught being
   * wrong once, so this pins the gap rather than the figure.
   */
  it('is wildly cheaper when the craft may simply be started again', () => {
    const stuck = markovFromItem(real, rp, white, targets);
    const canRestart = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    expect(stuck.feasible).toBe(true);
    expect(canRestart.expectedCost).toBeLessThan(stuck.expectedCost / 10);
  });

  it('charges for the new base when starting over is not free', () => {
    const free = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    const dear = markovFromItem(real, rp, white, targets, { restartCost: 5 });
    expect(dear.expectedCost).toBeGreaterThan(free.expectedCost);
  });

  /**
   * The bug this whole two-phase solve exists to fix.
   *
   * 0-initialised VI ties every state with `restartCost + V(start)` while V is still near zero, so a
   * truncated solve used to return "start over" as the optimal move EVERYWHERE — including from states
   * already holding a target mod — and the graph it produced did not contain the goal at all. A 6-mod
   * craft rendered four boxes, all of them saying "Start over with a new base". Seeding from the
   * push-forward optimum makes the greedy policy sensible on the very first sweep, so the route reaches
   * the target no matter where the sweeps stop.
   *
   * `maxIters` rather than `maxMillis` deliberately: a clock makes this machine-dependent, and the
   * point is a guarantee, not a timing.
   */
  it('still routes to the target when the sweeps run out', () => {
    const cut = markovFromItem(real, rp, white, targets, { restartCost: 0, maxIters: 1000 });
    expect(cut.feasible).toBe(true);
    expect(cut.converged).toBe(false);
    expect(cut.nodes.some((nd) => nd.isGoal)).toBe(true);
  });

  /**
   * …and the number it quotes leans the other way from a from-item solve, which is why `bound` exists
   * as a field instead of being read off `converged`.
   *
   * Phase A's value is a PROPER policy's — one that always finishes — so phase B starts above the
   * optimum and descends. Measured on this craft: 92.5 → 45.1 → 43.2ex as the sweep budget grows, and
   * 43.2 is the converged answer. Every truncation is above it, never under, so the honest rendering
   * is "≤ x".
   */
  it('quotes an UPPER bound when it stops early, tightening downward toward the true cost', () => {
    const exact = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    const loose = markovFromItem(real, rp, white, targets, { restartCost: 0, maxIters: 1000 });
    const tight = markovFromItem(real, rp, white, targets, { restartCost: 0, maxIters: 2000 });
    expect(exact.bound).toBe('exact');
    expect(loose.bound).toBe('upper');
    expect(tight.bound).toBe('upper');
    expect(loose.expectedCost).toBeGreaterThan(tight.expectedCost);
    expect(tight.expectedCost).toBeGreaterThan(exact.expectedCost);
  });

  /**
   * The guard on the seed itself. Without a CONVERGED phase A there is no proper-policy value to start
   * from, and an unconverged 0-init V bounds the restart problem in neither direction — it is climbing
   * toward the push-forward optimum, which is the far larger number. Quoting it would be a figure with
   * no meaning attached, so the solve says what happened instead.
   */
  it('refuses to quote a cost when even the push-forward seed did not settle', () => {
    // Well inside the band, not at its edge: the sweep count phase A needs moves whenever the action
    // space does — letting a bone compete for ordinary mods cut it below the 300 this used to pass.
    const r = markovFromItem(real, rp, white, targets, { restartCost: 0, maxIters: 50 });
    expect(r.feasible).toBe(false);
    // No clock was set, so "raise Search effort" would be noise — the sweep cap is not the user's to
    // raise. The message names the limit that actually bit.
    expect(r.reason).toMatch(/sweeps/i);
    expect(r.reason).not.toMatch(/search effort/i);
  });

  it('points at the effort setting when it was a CLOCK that ran out', () => {
    // maxMillis: 1 guarantees the very first deadline check trips, whatever the machine.
    const r = markovFromItem(real, rp, white, targets, { restartCost: 0, maxMillis: 1 });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/search effort/i);
  });

  // The scale check, same as the from-item cases above: play the policy through the real random
  // process and confirm the average spend matches what value iteration claimed.
  it('matches a Monte-Carlo run of its own policy', () => {
    const r = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    expect(r.converged).toBe(true);
    const mc = simulatePolicyMean(r, (a) => actionCostOf(rp, a), 100_000);
    expect(mc).toBeGreaterThan(r.expectedCost * 0.97);
    expect(mc).toBeLessThan(r.expectedCost * 1.03);
  });
});

/**
 * POLICY ITERATION — the phase-B solver, and the evidence it is allowed to be one.
 *
 * Value iteration grinds a sweep at a time and stops on a residual TOLERANCE; on a long-odds craft it
 * simply runs out, and the app has to print a ceiling. Measured before this existed: a six-target T1
 * craft exhausted 100,000 sweeps at 1,035s, and closing the gap needed ~1.1 MILLION more (~2.8 hours),
 * a figure that is a floor because the decay rate itself degrades.
 *
 * Policy iteration keeps the argmin VI throws away each sweep, and ends on a CERTIFICATE — the policy
 * stopped changing, so no action anywhere improves on it, so it is optimal. Measured on crafts VI
 * could not finish in 240s: 2p+1s T1 came back exact at 10,661 against VI's ceiling of 14,588 (37%
 * high), and 3p+1s T1 exact at 93,204 against 117,120 (26% high).
 *
 * Two claims are load-bearing and both are tested here. That PI agrees with VI wherever VI actually
 * converges — otherwise it is merely a confident wrong answer. And that its POLICY survives the same
 * Monte-Carlo cross-check every other solver result gets: the certificate proves the policy optimal
 * for the model, not that the graph published for it describes the same craft.
 */
describe('markovFromItem — policy iteration', () => {
  const bothWays = (t: ReturnType<typeof rare>, targets: Parameters<typeof markovFromItem>[3]) => ({
    vi: markovFromItem(data, prices, t, targets, { ...EXACT, restartCost: 0 }),
    pi: markovFromItem(data, prices, t, targets, { ...EXACT, restartCost: 0, solver: 'policy' }),
  });

  it('agrees with value iteration wherever value iteration converges', () => {
    const { vi, pi } = bothWays(rare(['T1', 'J1']), [{ modId: 'T1' }]);
    expect(vi.converged).toBe(true);
    expect(pi.converged).toBe(true);
    expect(pi.expectedCost).toBeCloseTo(vi.expectedCost, 6);
  });

  it('reports an EXACT bound, because it ends on a proof rather than a tolerance', () => {
    const { pi } = bothWays(rare(['T1', 'J1']), [{ modId: 'T1' }]);
    expect(pi.bound).toBe('exact');
  });

  it('produces a policy whose Monte-Carlo mean matches the cost it claims', () => {
    const r = markovFromItem(data, prices, rare(['T1', 'J1']), [{ modId: 'T1' }],
      { ...EXACT, solver: 'policy' });
    const mc = simulatePolicyMean(r, (a) => actionCostOf(prices, a), 100_000);
    expect(mc).toBeCloseTo(r.expectedCost, 1);
  });

  /**
   * The tests above use the synthetic two-mod craft, which PI settles in a SINGLE round — so they
   * cannot see the certificate logic at all. Both a premature `return true` and an improvement step
   * that never reports a change survived them. This craft is a from-WHITE solve on real data, where
   * phase B does the work that motivated policy iteration in the first place (measured at ~20x phase
   * A), and it takes several rounds. Stopping early leaves V under-evaluated and the cost wrong.
   */
  it('needs SEVERAL rounds, and still lands on value iteration\'s answer', () => {
    const real = loadPatch('data/patches/0.5.0');
    const rp = loadFrozenPrices();
    const w = real.bases.get('Wands')!;
    const white: ItemState = { base: w, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
    const targets = [
      { modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/Intelligence' },
    ];
    const vi = markovFromItem(real, rp, white, targets, { restartCost: 0 });
    const pi = markovFromItem(real, rp, white, targets, { restartCost: 0, solver: 'policy' });
    expect(vi.converged).toBe(true); // else there is no truth to compare against
    expect(pi.converged).toBe(true);
    // Tight: these are the same fixed point reached two ways, not two estimates of it.
    expect(pi.expectedCost).toBeGreaterThan(vi.expectedCost * 0.999);
    expect(pi.expectedCost).toBeLessThan(vi.expectedCost * 1.001);
  });

  it('still reaches the goal, so the graph it hands back is drawable', () => {
    const { pi } = bothWays(rare(['T1', 'J1']), [{ modId: 'T1' }]);
    expect(pi.nodes.some((n) => n.isGoal)).toBe(true);
    expect(pi.nodes.some((n) => n.isStart)).toBe(true);
  });
});

/**
 * `visitRate` decides which states the graph draws, and the obvious metric is the wrong one.
 *
 * Plain visit frequency ranks the FAILURES first. With a free base ~98% of states choose "start
 * over", so they are entered constantly — and every one of them shows the same action and the same
 * cost, because they all share V(start). Reported from the live app on a 6-target T2 craft: ten boxes
 * at 90% coverage, nine reading "Start over with a new base · 2,132 div". Statistically faithful,
 * and useless. Weighting by P(reach the goal from here) drops them, because a state whose best move
 * is to restart has no route onward at all.
 */
describe('markovFromItem — visitRate ranks the craft, not the failures', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const white = (): ItemState =>
    ({ base: real.bases.get('Wands')!, level: 82, rarity: 'normal', prefixes: [], suffixes: [] });
  const solved = () => markovFromItem(real, rp, white(), [
    { modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/Intelligence' },
  ], { restartCost: 0 });

  const top = (r: ReturnType<typeof markovFromItem>, frac: number) => {
    const sorted = [...r.nodes].sort((a, b) => b.visitRate - a.visitRate);
    const mass = sorted.reduce((s, n) => s + n.visitRate, 0);
    const out: typeof sorted = [];
    let acc = 0;
    for (const n of sorted) { if (acc >= frac * mass) break; out.push(n); acc += n.visitRate; }
    return out;
  };

  it('gives a state whose only move is to start over no weight at all', () => {
    const r = solved();
    const restarts = r.nodes.filter((n) => n.action?.currency === 'restart');
    expect(restarts.length).toBeGreaterThan(0);            // else this craft proves nothing
    for (const n of restarts) expect(n.visitRate).toBe(0); // no route onward ⇒ no weight
  });

  // The failure this was reported for: a default view made entirely of identical restart boxes.
  it('fills the default view with the craft, not with "start over"', () => {
    const shown = top(solved(), 0.9);
    expect(shown.length).toBeGreaterThan(3);
    expect(shown.every((n) => n.action?.currency !== 'restart')).toBe(true);
  });

  // Being a spine and not a puddle: the default view has to span the craft end to end, or it is
  // showing a fragment of the middle and calling it the route.
  it('spans the craft, start to goal', () => {
    const shown = top(solved(), 0.9);
    expect(shown.some((n) => n.isStart)).toBe(true);
    expect(shown.some((n) => n.isGoal)).toBe(true);
  });

  it('stays far smaller than the closure it is drawn from', () => {
    const r = solved();
    expect(top(r, 0.9).length).toBeLessThan(r.nodes.length / 3);
  });
});

/**
 * `bound: 'exact'` is a PROMISE, and policy iteration was breaking it.
 *
 * PI ends on a certificate: the policy stopped changing, so no action improves on it, so it is
 * optimal. That reasoning is only valid if the values the improvement step compared were themselves
 * settled — and the inner evaluation loop is capped by `maxIters`, which it was exhausting silently.
 * Improvement then compared under-evaluated values, saw no change, and called an unfinished solve
 * optimal. Measured on a 3-target T1 from-white craft (true cost 10,658.21): at `maxIters: 20_000`
 * it returned `bound: 'exact'` with 10,836.88 — 1.68% high, rendered by the UI as a plain figure
 * with no caveat, which is the one thing `bound` exists to prevent.
 *
 * Truncating evaluation is fine in itself — that is modified policy iteration and it still converges,
 * over more rounds. So the fix gates the PROOF on a settled evaluation, not the loop.
 *
 * The craft that exhibited the 1.68% error takes ~60s and has no place in a suite that runs in 30.
 * The one below is fast, and pins the CONTRACT instead — anything claiming `exact` agrees with a
 * fully-converged solve — across budgets varying 300x. That turns out to be enough: reverting the
 * fix fails this table, and separately reproduces the original 10,836.88-labelled-exact on the slow
 * craft. Mutation-checked both ways.
 */
describe('markovFromItem — an exact bound is never claimed for an unsettled solve', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const white = (): ItemState =>
    ({ base: real.bases.get('Wands')!, level: 82, rarity: 'normal', prefixes: [], suffixes: [] });
  const targets = [
    { modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/Intelligence' },
  ];
  const solve = (maxIters: number) =>
    markovFromItem(real, rp, white(), targets, { restartCost: 0, maxIters, solver: 'policy' });

  const reference = markovFromItem(real, rp, white(), targets,
    { restartCost: 0, maxIters: 2_000_000, solver: 'policy' });

  it('has a converged reference to judge against', () => {
    expect(reference.bound).toBe('exact');
    expect(reference.feasible).toBe(true);
  });

  it.each([400, 1_500, 6_000, 20_000, 120_000])(
    'at maxIters %i, either matches the reference or does not claim exact', (maxIters) => {
      const r = solve(maxIters);
      if (!r.feasible) return;            // phase A refused, which is its own honest answer
      if (r.bound !== 'exact') {
        expect(r.bound).toBe('upper');    // PI descends from a proper policy, so a ceiling
        return;
      }
      // Claiming exact means claiming the fixed point. The allowance is the documented tolerance
      // error (~1e-3 relative, one-directional), NOT the 1.68% the truncation bug produced.
      expect(Math.abs(r.expectedCost - reference.expectedCost) / reference.expectedCost).toBeLessThan(1e-3);
    });

  // Both solvers stop within `tolerance` of the same fixed point, from different directions and by
  // different paths, so they agree to the tolerance and NOT to the last digit — measured here at
  // 3.9e-6 relative, against a tolerance of 7.4e-5 absolute on a ~23 ex craft. Asserting more than
  // that would be pinning noise: an earlier version of this test demanded 5e-7 and failed on two
  // answers that were both correct.
  it('agrees with value iteration, to the tolerance both of them stop at', () => {
    const vi = markovFromItem(real, rp, white(), targets, { restartCost: 0, maxIters: 2_000_000 });
    expect(vi.bound).toBe('exact');
    const rel = Math.abs(reference.expectedCost - vi.expectedCost) / vi.expectedCost;
    expect(rel).toBeLessThan(1e-3);
  });
});

/**
 * CLOSED-FORM policy evaluation — and the evidence that licenses it.
 *
 * Iterating a fixed policy's value is where policy iteration spent essentially all its time, for a
 * structural reason: with a free base ~98% of states restart, so `V(s) = restartCost + V(start)`
 * almost everywhere and the chain contracts at r ≈ 1. Varying only the tolerance moved one craft
 * 74.4s → 0.8s and its answer 4,753 → 35,417 — a 93x speed span with accuracy tracking it exactly, so
 * there was no cheap win to take.
 *
 * Solving the renewal instead removes the loop rather than tolerating it:
 *   V(start) = c(start)/(1 − q(start)),  V(s) = c(s) + q(s)·V(start)
 * over the restart-ABSORBING chain. Measured end to end: 3-target T1 60.1s → 2.3s, 4-target T2
 * 74.4s → 4.8s, and a 6-target T2 craft that previously ran ~1,000s to a CEILING now returns
 * `bound: 'exact'` at 292s.
 *
 * Speed is worthless without agreement, so that is what these tests are. `iterativeEval` keeps the
 * old path runnable precisely so the comparison stays honest and repeatable.
 */
describe('markovFromItem — closed-form evaluation agrees with iterating it', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const white = (): ItemState =>
    ({ base: real.bases.get('Wands')!, level: 82, rarity: 'normal', prefixes: [], suffixes: [] });
  const targets = [
    { modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/Intelligence' },
  ];
  const opts = { restartCost: 0, maxIters: 2_000_000, solver: 'policy' as const };

  const closed = markovFromItem(real, rp, white(), targets, opts);
  const iterated = markovFromItem(real, rp, white(), targets, { ...opts, iterativeEval: true });
  const vi = markovFromItem(real, rp, white(), targets, { restartCost: 0, maxIters: 2_000_000 });

  it('all three solvers converge on this craft', () => {
    for (const r of [closed, iterated, vi]) expect(r.bound).toBe('exact');
  });

  // The licence. Both are policy iteration; they differ only in how a fixed policy is costed, so a
  // disagreement beyond `tolerance` means the closed form is solving a different problem.
  it('matches iterated evaluation to the tolerance', () => {
    const rel = Math.abs(closed.expectedCost - iterated.expectedCost) / iterated.expectedCost;
    expect(rel).toBeLessThan(1e-3);
  });

  it('matches value iteration too, which shares no code with either', () => {
    const rel = Math.abs(closed.expectedCost - vi.expectedCost) / vi.expectedCost;
    expect(rel).toBeLessThan(1e-3);
  });

  // Independent of all the arithmetic above: play the policy 100k times and see what it costs.
  it('produces a policy whose Monte-Carlo mean matches the cost it claims', () => {
    const mc = simulatePolicyMean(closed, (a) => actionCostOf(rp, a), 100_000);
    expect(mc).toBeGreaterThan(closed.expectedCost * 0.9);
    expect(mc).toBeLessThan(closed.expectedCost * 1.1);
  });

  it('still hands back a drawable graph', () => {
    expect(closed.nodes.some((n) => n.isStart)).toBe(true);
    expect(closed.nodes.some((n) => n.isGoal)).toBe(true);
  });

  // A Desecration shows three draws and the player keeps one, so its realized distribution depends on
  // V — which would make c and q non-linear. The ordering is frozen for one evaluation and re-sorted
  // by the next improvement round. If that freeze were wrong, the desecration crafts would drift.
  it('handles offer actions, whose distribution depends on the values being solved', () => {
    const withDesecrate = markovFromItem(real, rp, white(),
      [{ modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }], opts);
    const iter = markovFromItem(real, rp, white(),
      [{ modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }], { ...opts, iterativeEval: true });
    expect(withDesecrate.bound).toBe('exact');
    const rel = Math.abs(withDesecrate.expectedCost - iter.expectedCost) / iter.expectedCost;
    expect(rel).toBeLessThan(1e-3);
  });
});

/**
 * SKIPPING PHASE A — measured, opt-in, and NOT the default. Phase A is 92-98% of a solve once
 * evaluation went closed form, so replacing it looked obvious. It is not, on the crafts that matter.
 *
 * Phase A computes the OPTIMAL push-forward value function, but all it owes phase B is a `V0` with
 * `T(V0) <= V0` so the descent starts above the answer. That property is far weaker than optimality:
 * for ANY proper policy pi, `T(V^pi) <= T_pi(V^pi) = V^pi`. So any proper policy's exact value will
 * do — and `evaluateClosedForm` already produces exactly that, at 2% of a solve.
 *
 * `heuristicPolicy` guesses one without solving anything: level states by a backward BFS from the
 * goal, take the action most likely to move down a level, and RESTART from anywhere further out than
 * the base you would restart to. That last rule is load-bearing and was wrong first time — playing
 * forward wherever any progress existed produced a policy that almost never restarts, and the closed
 * form is only fast because restart states ABSORB. That version burned 5,000,000 sweeps and the whole
 * deadline on a 3-target T1 craft.
 *
 * Interleaved medians, 3 reps, against the two-phase path:
 *   3 tgt T1 (250 states)    2.0s -> 0.6s   3.22x     5 tgt T2 (1,166)  34.4s -> 28.0s  1.23x
 *   4 tgt T2 (312 states)    4.5s -> 4.1s   1.09x     6 tgt T2 (3,963)   264s -> 445s   1.7x SLOWER
 *
 * So it is OPT-IN, not the default. Skipping phase A makes policy iteration start from a worse policy
 * and need more rounds; small crafts converge in <=20 and win, the big one does not and loses badly.
 * Saving 1.4s on a two-second craft does not pay for three minutes on a four-minute one. A first,
 * single-run comparison suggested the big craft was fine — it was not, and only interleaved reps on a
 * machine with a ~40% spread showed it. What is missing is a principled way to tell which side of the
 * crossover a craft is on; until there is one the default stays two-phase. See TODO 3.
 *
 * The seed does not have to be good — improvement fixes that — only PROPER, and it is not trusted to
 * be even that: `evaluateClosedForm` returns false when `q(start) = 1`, and the two-phase path then
 * runs untouched. These tests pin the agreement and the fallback, not the timings.
 */
describe('markovFromItem — the heuristic seed, opt-in, gives the same answer as phase A', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const white = (): ItemState =>
    ({ base: real.bases.get('Wands')!, level: 82, rarity: 'normal', prefixes: [], suffixes: [] });
  const base = { restartCost: 0, maxIters: 2_000_000, solver: 'policy' as const };

  const crafts: [string, { modId: string; minTierIndex?: number }[]][] = [
    ['3 targets, any tier', [
      { modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }, { modId: 'Wands/Intelligence' }]],
    ['2 targets', [{ modId: 'Wands/IncreasedMana' }, { modId: 'Wands/WeaponSpellDamage' }]],
  ];

  it.each(crafts)('%s: seeded and two-phase reach the same cost', (_label, targets) => {
    const seeded = markovFromItem(real, rp, white(), targets, { ...base, heuristicSeed: true });
    const twoPhase = markovFromItem(real, rp, white(), targets, base);
    expect(seeded.bound).toBe('exact');
    expect(twoPhase.bound).toBe('exact');
    const rel = Math.abs(seeded.expectedCost - twoPhase.expectedCost) / twoPhase.expectedCost;
    expect(rel).toBeLessThan(1e-3);
  });

  it('also matches value iteration, which shares no code with either path', () => {
    const seeded = markovFromItem(real, rp, white(), crafts[0]![1], { ...base, heuristicSeed: true });
    const vi = markovFromItem(real, rp, white(), crafts[0]![1], { restartCost: 0, maxIters: 2_000_000 });
    expect(vi.bound).toBe('exact');
    expect(Math.abs(seeded.expectedCost - vi.expectedCost) / vi.expectedCost).toBeLessThan(1e-3);
  });

  it('produces a policy whose Monte-Carlo mean matches the cost it claims', () => {
    const seeded = markovFromItem(real, rp, white(), crafts[0]![1], { ...base, heuristicSeed: true });
    const mc = simulatePolicyMean(seeded, (a) => actionCostOf(rp, a), 100_000);
    expect(mc).toBeGreaterThan(seeded.expectedCost * 0.9);
    expect(mc).toBeLessThan(seeded.expectedCost * 1.1);
  });

  it('still hands back a drawable graph', () => {
    const seeded = markovFromItem(real, rp, white(), crafts[0]![1], { ...base, heuristicSeed: true });
    expect(seeded.nodes.some((n) => n.isStart)).toBe(true);
    expect(seeded.nodes.some((n) => n.isGoal)).toBe(true);
  });

  /**
   * The test that actually protects the feature, and it took two tries to get one that does.
   *
   * The agreement tests above pass whether or not the seed works — policy iteration converges to the
   * right answer either way, so a broken seed shows up as SLOW, not wrong, and three deliberate
   * breakages sailed straight through them.
   *
   * This one is a budget, in SWEEPS rather than seconds — deterministic, so it cannot drift with the
   * ~40% wall-clock spread this machine has. A 3-target T1 craft from white needs ~8,000 sweeps before
   * phase A converges at all; seeded, it is exact at 500.
   *
   * WHAT IT DOES NOT COVER, stated because the gap is easy to mistake for coverage. It catches a seed
   * that is never evaluated before the first improvement (which discards the seed entirely). It does
   * NOT catch a worse restart rule, because the evaluation CAP makes a bad seed fail cheaply and fall
   * back — the rule is now a performance choice, not a correctness one. Measured separately, medians
   * of 3: dropping it costs 0.7s -> 1.4s on this craft and 50.1s -> 58.4s on a 5-target T2. Worth
   * keeping, and not something a correctness suite can defend.
   */
  it('solves on a sweep budget the two-phase path cannot meet', () => {
    const tiered = (modId: string) =>
      ({ modId, minTierIndex: real.mods.get(modId)!.tiers.length - 1 });
    const targets = [tiered('Wands/IncreasedMana'), tiered('Wands/WeaponSpellDamage'), tiered('Wands/Intelligence')];
    const tight = { restartCost: 0, maxIters: 500, solver: 'policy' as const };

    const seeded = markovFromItem(real, rp, white(), targets, { ...tight, heuristicSeed: true });
    const twoPhase = markovFromItem(real, rp, white(), targets, tight);

    expect(seeded.feasible).toBe(true);
    expect(seeded.bound).toBe('exact');
    expect(twoPhase.feasible).toBe(false);   // phase A needs ~8,000 sweeps before it converges at all

    // And the cheap answer is the same answer: 40x the budget changes nothing.
    const generous = markovFromItem(real, rp, white(), targets, { ...tight, heuristicSeed: true, maxIters: 20_000 });
    expect(Math.abs(seeded.expectedCost - generous.expectedCost) / generous.expectedCost).toBeLessThan(1e-3);
  });

  // A held item cannot be rebought, so there is no restart action and no phase B — the seed must not
  // engage at all there, or a from-item craft would be solved by machinery built for a different one.
  it('leaves a from-item craft, which has no restart, entirely alone', () => {
    const held: ItemState = {
      base: real.bases.get('Wands')!, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'Wands/IncreasedMana', tierName: real.mods.get('Wands/IncreasedMana')!.tiers[0]!.name }],
      suffixes: [],
    };
    const r = markovFromItem(real, rp, held, [{ modId: 'Wands/IncreasedMana' }], { maxIters: 2_000_000 });
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
  });
});

/**
 * SLOT ALTERNATIVES — "this slot can be Extra Cold or Extra Lightning, I don't care which".
 *
 * Candidates sharing a `slot` are alternatives: any one of them fills it, so a target may name more
 * candidates than the six mods an item holds. The old goal was a conjunction — `present === (1<<n)-1`,
 * built as literal keys — which cannot express that: the state holding all three alternatives has four
 * prefixes, so `enumerateStates` never emits it, and the solve called the target unreachable.
 */
describe('markovFromItem — slot alternatives', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const wand = real.bases.get('Wands')!;
  const white: ItemState = { base: wand, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  // `solver: 'policy'` is the Exhaustive preset's setting, and the only one that ends on a certificate
  // rather than a residual — so `bound: 'exact'` below means the answer is settled, not just close.
  // It is also what keeps these crafts to seconds: the two-phase VI default spends minutes on the same
  // targets and would put this describe block on its own in the suite's budget.
  const solve = (targets: readonly { modId: string; slot?: number; minTierIndex?: number }[]) =>
    markovFromItem(real, rp, white, targets, { restartCost: 0, solver: 'policy' });

  const SPELL = 'Wands/WeaponSpellDamage';
  const CAST = 'Wands/IncreasedCastSpeed';
  const CRIT = 'Wands/SpellCriticalStrikeChance';
  // Cross-family alternatives: ColdDamage / FireDamage / LightningDamage are three DIFFERENT families,
  // so `siblingsOf` relates none of them and they can sit on an item together. This is the shape the
  // feature exists for, and the one a same-family mechanism could never have covered.
  const XCOLD = 'Wands/DamageGainedAsCold';
  const XFIRE = 'Wands/DamageGainedAsFire';
  const XLIGHT = 'Wands/DamageGainedAsLightning';
  // Same-family alternatives: all WeaponDamageTypePrefix, hence mutually exclusive on the item — the
  // group is really a union of weights on one roll.
  const IFIRE = 'Wands/FireDamageWeaponPrefix';
  const ICOLD = 'Wands/ColdDamageWeaponPrefix';

  /**
   * The backbone. Every craft that existed before slots must be untouched by them, and the way to
   * prove it is to say the same thing both ways: no `slot` at all (what every caller passes today)
   * against one slot per target (what the grouping code turns that into). Same number, same bound.
   */
  it('one slot per target is exactly what no slots at all already meant', () => {
    const bare = solve([{ modId: SPELL }, { modId: CAST }, { modId: CRIT }]);
    const spelt = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 }, { modId: CRIT, slot: 2 }]);
    expect(bare.feasible).toBe(true);
    expect(spelt.expectedCost).toBe(bare.expectedCost);
    expect(spelt.bound).toBe(bare.bound);
    expect(spelt.nodes.length).toBe(bare.nodes.length);
  });

  /**
   * The property the whole feature is for, and the one a wrong implementation still passes the rest of
   * the suite without: an alternative must be worth something. Solving each member separately and
   * taking the cheapest throws away exactly what a group buys — the ability to keep whichever one
   * actually lands — so the grouped answer has to come in strictly under it, not merely equal it.
   *
   * Measured on 0.5.0: 100.76 ex for any single member, 40.23 ex for the three as one slot.
   */
  it('costs strictly less than the best of its members solved alone', () => {
    const fixed = [{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 }];
    const alone = [XCOLD, XFIRE, XLIGHT].map((id) => solve([...fixed, { modId: id, slot: 2 }]));
    for (const r of alone) expect(r.feasible).toBe(true);
    const best = Math.min(...alone.map((r) => r.expectedCost));

    const grouped = solve([...fixed, { modId: XCOLD, slot: 2 }, { modId: XFIRE, slot: 2 }, { modId: XLIGHT, slot: 2 }]);
    expect(grouped.feasible).toBe(true);
    expect(grouped.bound).toBe('exact');
    expect(grouped.expectedCost).toBeLessThan(best);
    // Not a rounding win: three ways to fill one slot is worth roughly a third of the tries.
    expect(grouped.expectedCost).toBeLessThan(best * 0.6);
  });

  // More candidates on a side than the side can hold is the entire point — four prefix CANDIDATES in
  // two prefix SLOTS is a legal target, because at most three mods are ever on the item at once and
  // `enumerateStates` already refuses to build a state where more are.
  it('accepts more candidates on a side than the item can hold', () => {
    const r = solve([
      { modId: SPELL, slot: 0 },
      { modId: XCOLD, slot: 1 }, { modId: XFIRE, slot: 1 }, { modId: XLIGHT, slot: 1 },
      { modId: CAST, slot: 2 },
    ]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeLessThan(Infinity);
  });

  // Same-family members are the mutually-exclusive case: only one can ever be on the item, so the
  // group is a weight union rather than two independent chances. It must still be legal and still win.
  it('allows a slot whose alternatives share a family', () => {
    const one = solve([{ modId: IFIRE, slot: 0 }, { modId: CAST, slot: 1 }]);
    const both = solve([{ modId: IFIRE, slot: 0 }, { modId: ICOLD, slot: 0 }, { modId: CAST, slot: 1 }]);
    expect(both.feasible).toBe(true);
    expect(both.expectedCost).toBeLessThan(one.expectedCost);
  });

  // …but two DIFFERENT slots wanting one family can never both be filled. That used to surface as
  // "no policy reaches the target", which names neither mod and reads like a solver failure.
  it('refuses two different slots that want the same family, and says which', () => {
    const r = solve([{ modId: IFIRE, slot: 0 }, { modId: ICOLD, slot: 1 }, { modId: CAST, slot: 2 }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/WeaponDamageTypePrefix/);
    expect(r.reason).toMatch(/one mod per family/i);
  });

  /**
   * `distanceToGoal` drives the graph's layout depth and the route walk, which may only step to a
   * STRICTLY smaller distance. It counted missing CANDIDATES — fine when every candidate is its own
   * slot, wrong the moment one slot has three, because a finished item deliberately never holds the two
   * alternatives it did not need. Left uncounted, the goal itself scores 2 rather than 0: the craft is
   * over and the graph still says there is work to do.
   *
   * Caught nothing until this test existed — every other assertion here reads costs, and the heuristic
   * does not move them.
   */
  it('scores a finished item as nought moves from done, however many alternatives went unused', () => {
    const r = solve([
      { modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2 }, { modId: XFIRE, slot: 2 }, { modId: XLIGHT, slot: 2 },
    ]);
    const goal = r.nodes.find((nd) => nd.isGoal)!;
    expect(goal).toBeDefined();
    expect(goal.depth).toBe(0);
    // …and the finished item really is holding only one of the three, so this is not vacuous.
    expect(goal.present.filter((ids) => ids.some((id) => [XCOLD, XFIRE, XLIGHT].includes(id)))).toHaveLength(1);
  });

  // A slot that is a prefix on one route and a suffix on another makes the 3-per-side count meaningless.
  it('refuses a slot whose alternatives sit on different sides', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 0 }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/all prefixes or all suffixes/i);
  });

  /**
   * …and it must still fire when the two sides share a FAMILY, which is the case merging could hide.
   *
   * Ten families span both sides on one base in 0.5.0. `Bows/Desecrated_CompanionDamage` is a prefix
   * and `…_2` a suffix of `CompanionDamage`. Merging any such pair would leave a position reporting a
   * single type, so this check — which runs on the MERGED positions — would find nothing to complain
   * about and the craft would be planned with a suffix counted against the prefix cap.
   *
   * (These two are kept apart by their family SETS rather than by their sides: the suffix one carries
   * `IncreasedAttackSpeed` as well. The side term is pinned separately, in markovSymmetry.test.ts,
   * where a built mod isolates it — no real pair in this patch can.)
   */
  it('refuses them even when both sides are one family — the case merging could hide', () => {
    const bows = real.bases.get('Bows')!;
    const bare: ItemState = { base: bows, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
    const r = markovFromItem(real, rp, bare, [
      { modId: 'Bows/Desecrated_CompanionDamage', slot: 0 },
      { modId: 'Bows/Desecrated_CompanionDamage_2', slot: 0 },
    ], { restartCost: 0, solver: 'policy' });
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/all prefixes or all suffixes/i);
  });

  // The item's own limit is on SLOTS. Four prefix slots is impossible however few candidates each holds.
  it('still refuses more slots on a side than the item has', () => {
    const r = solve([
      { modId: SPELL, slot: 0 }, { modId: XCOLD, slot: 1 }, { modId: XFIRE, slot: 2 },
      { modId: 'Wands/IncreasedMana', slot: 3 },
    ]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/4 prefixes/);
  });
});

/**
 * MUTUALLY-EXCLUSIVE ALTERNATIVES — the lattice does not carry items the game cannot hold.
 *
 * When a slot's alternatives are siblings (`#% increased Fire / Cold / Lightning Damage` are all one
 * family) only one of them can ever be on the item. Before slots existed this could not arise: two
 * targets sharing a family were rejected outright. Now it is the ordinary case, and without pruning
 * the lattice carries a state for every arrangement the item could never reach — 3^3 = 27 for a
 * three-way sibling slot where only 7 are real.
 *
 * They would be pruned later, by `prob1`, as unreachable. But not before `actionsOf` — described in
 * markovFromItem.ts as the dominant cost of the whole solve — had been paid on every one of them.
 */
describe('enumerateStates — a family cannot be held twice', () => {
  const data = loadPatch('data/patches/0.5.0');
  const mk = (type: 'prefix' | 'suffix'): McTarget =>
    ({ mods: [{ mod: data.mods.get('Wands/IncreasedMana')!, minIndex: 0 }], type, fractured: false });
  // Three prefixes, of which the last two are siblings, plus one suffix.
  const side = sideIndexOf([mk('prefix'), mk('prefix'), mk('prefix'), mk('suffix')]);
  const siblings = bit(1) | bit(2);
  const all = enumerateStates(4, side, false, ['rare'], []);
  const pruned = enumerateStates(4, side, false, ['rare'], [siblings]);

  it('drops exactly the states holding two of one family, and nothing else', () => {
    const impossible = (k: StateKey): boolean => {
      const st = decodeState(k);
      return popcount((st.present | st.blocked) & siblings) > 1;
    };
    // The unpruned lattice really does carry them — otherwise this test proves nothing.
    expect(all.some(impossible)).toBe(true);
    expect(pruned.some(impossible)).toBe(false);
    // …and every state that was possible survives, so this is a filter and not a different lattice.
    expect(pruned).toEqual(all.filter((k) => !impossible(k)));
  });

  // BLOCKED counts too: a roll below its tier occupies the family exactly as firmly as one at it,
  // which is the whole reason `blocked` exists as an axis distinct from absent.
  it('counts a below-tier roll as occupying the family', () => {
    const bothBlocked = pruned.filter((k) => popcount(decodeState(k).blocked & siblings) > 1);
    expect(bothBlocked).toEqual([]);
    const oneEach = pruned.filter((k) => {
      const st = decodeState(k);
      return (st.present & siblings) !== 0 && (st.blocked & siblings) !== 0;
    });
    expect(oneEach).toEqual([]);
  });

  it('leaves a lattice with no conflicts exactly as it was', () => {
    expect(enumerateStates(4, side, false, ['rare'], [])).toEqual(all);
    expect(enumerateStates(4, side, false, ['rare'], [bit(0)])).toEqual(all); // a lone target conflicts with nothing
  });
});

/**
 * ANCHORS — the numbers that must not move when the lattice gets smaller.
 *
 * Merging same-family candidates and quotienting interchangeable cross-family ones are pure
 * representation changes: they delete states the solver could not tell apart, so every cost, bound and
 * feasibility here is expected to survive them EXACTLY. Captured before either landed, on 0.5.0.
 *
 * A tolerance would defeat the point. These are `toBe`, and a change of any size is the alarm.
 */
describe('markovFromItem — costs are invariant under lattice reduction', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const wand = real.bases.get('Wands')!;
  const white: ItemState = { base: wand, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
  const solve = (targets: readonly { modId: string; slot?: number; minTierIndex?: number }[]) =>
    markovFromItem(real, rp, white, targets, { restartCost: 0, solver: 'policy' });

  const SPELL = 'Wands/WeaponSpellDamage';
  const CAST = 'Wands/IncreasedCastSpeed';
  const XCOLD = 'Wands/DamageGainedAsCold';
  const XFIRE = 'Wands/DamageGainedAsFire';
  const XLIGHT = 'Wands/DamageGainedAsLightning';
  // One family, five normal members — the mutually-exclusive case, where a group is a weight union.
  const WFIRE = 'Wands/FireDamageWeaponPrefix';
  const WCOLD = 'Wands/ColdDamageWeaponPrefix';
  const WLIGHT = 'Wands/LightningDamageWeaponPrefix';
  // Same family as those three, but `desecrated` rather than `normal`: it rolls from a different pool
  // and cannot be exalted onto the item, so it is NOT interchangeable with them.
  const WCARVED = 'Wands/Desecrated_WeaponDamageTypePrefix';

  it('cross-family, two interchangeable alternatives', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2 }, { modId: XLIGHT, slot: 2 }]);
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    // Cold and Lightning are interchangeable on this base, so their two spellings collapse onto one
    // state and the outcomes that led to each are summed together. Reordering a floating-point sum
    // moves the last bit: 55.10323732898523 against 55.103237328985244, one ulp. (The three-way craft
    // below quotients too and lands byte-identical — whether the reordering bites is luck, which is
    // exactly why this is pinned to fifteen figures rather than to whatever came out.)
    expect(r.expectedCost).toBeCloseTo(55.103237328985244, 12);
  });

  it('cross-family, three alternatives', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2 }, { modId: XFIRE, slot: 2 }, { modId: XLIGHT, slot: 2 }]);
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    expect(r.expectedCost).toBe(40.2303738299529);
  });

  it('same-family, three alternatives', () => {
    const r = solve([{ modId: CAST, slot: 0 },
      { modId: WFIRE, slot: 1 }, { modId: WCOLD, slot: 1 }, { modId: WLIGHT, slot: 1 }]);
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    // The one anchor that is NOT `toBe`, and the reason is the mechanism rather than a fudge: merging
    // sums the members' weights and divides once, where three separate targets each divided first.
    // `(a+b+c)/g` and `a/g + b/g + c/g` differ in the last bits of the mantissa — 23.539201819271984
    // against 23.539201819271987, three ulp. Pinned to fifteen significant figures, which is far
    // tighter than any real change to the model could hide in.
    expect(r.expectedCost).toBeCloseTo(23.539201819271987, 12);
  });

  /**
   * …and the merge really happened. The cost anchors above would all still pass if same-family
   * alternatives were merely left alone, so this is the assertion that the lattice actually shrank:
   * three siblings occupy ONE bit, exactly as one mod does, so the two crafts must have the same
   * number of states — while the group is strictly cheaper, because three ways to fill the position is
   * three times the weight on the roll.
   */
  it('costs a same-family group exactly the lattice of a single mod', () => {
    const one = solve([{ modId: CAST, slot: 0 }, { modId: WFIRE, slot: 1 }]);
    const three = solve([{ modId: CAST, slot: 0 },
      { modId: WFIRE, slot: 1 }, { modId: WCOLD, slot: 1 }, { modId: WLIGHT, slot: 1 }]);
    expect(three.nodes.length).toBe(one.nodes.length);
    expect(three.expectedCost).toBeLessThan(one.expectedCost);
  });

  it('same-family, one member from a different pool', () => {
    const r = solve([{ modId: CAST, slot: 0 },
      { modId: WFIRE, slot: 1 }, { modId: WCARVED, slot: 1 }]);
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    expect(r.expectedCost).toBe(68.08074919253308);
  });

  /**
   * A held mod is graded against ITS OWN tier floor, not the position's first member's.
   *
   * Tiers stay per candidate — `T1 Fire or T4 Cold` is a legal slot — and merging puts both mods on one
   * position. Reading the floor off the position rather than off the mod actually on the item grades a
   * Cold roll against Fire's demand, so an item that already satisfies the slot is reported `blocked`
   * and the plan opens by annulling a mod the player wanted.
   *
   * Only a from-ITEM craft can catch this: `classifyStart` never sees a placed target on a from-white
   * base, which is what every other test here starts from.
   */
  it('grades a held alternative against its own tier floor, not its neighbour’s', () => {
    const startOf = (tierName: string, coldFloor: number) => {
      const held: ItemState = {
        base: wand, level: 82, rarity: 'rare',
        prefixes: [{ modId: WCOLD, tierName }],
        suffixes: [],
      };
      const r = markovFromItem(real, rp, held, [
        // Fire first, so it is the position's first member and the one a naive read would use.
        { modId: WFIRE, slot: 0, minTierIndex: 7 },
        { modId: WCOLD, slot: 0, minTierIndex: coldFloor },
        { modId: CAST, slot: 1 },
      ], { solver: 'policy' });
      expect(r.feasible).toBe(true);
      return r.nodes.find((nd) => nd.isStart)!;
    };

    // At or above its own floor ⇒ the slot is FILLED, and the plan does not open by annulling it.
    const good = startOf('Hailing', 3); // Cold's index 4 of 8, against a floor of 3
    expect(good.present.some((ids) => ids.includes(WCOLD))).toBe(true);
    expect(good.blocked).toEqual([]);

    /*
     * …and BELOW its own floor ⇒ blocked, which is the direction that actually bites.
     *
     * Reading the floor off the position's first member does not merely use the wrong number: it looks
     * up a Cold tier name in Fire's tier list, finds nothing, and takes the "unrecognised tier — assume
     * fine" branch. So every held alternative would be called satisfied whatever tier it rolled, and
     * the assertion above would pass while the model quietly stopped grading tiers at all.
     */
    const bad = startOf('Bitter', 3); // Cold's index 0 of 8, against the same floor of 3
    expect(bad.blocked.some((ids) => ids.includes(WCOLD))).toBe(true);
    expect(bad.present).toEqual([]);
  });

  /**
   * The cross-check that a REPRESENTATION change most needs, because it does not read V at all.
   *
   * Both reductions rewrite which state an outcome points at — merging folds three successors into
   * one, canonicalising redirects a successor onto its twin — and a mistake there shows up as a
   * distribution that no longer sums to 1, or edges that skip a state. Value iteration would happily
   * converge on the wrong chain and report `exact`. Playing the policy on the published graph and
   * averaging the spend is the independent check: it samples the very edges the UI draws.
   */
  it('a merged group: 40k policy runs match the cost it reports', () => {
    const r = solve([{ modId: CAST, slot: 0 },
      { modId: WFIRE, slot: 1 }, { modId: WCOLD, slot: 1 }, { modId: WLIGHT, slot: 1 }]);
    const mc = simulatePolicyMean(r, (a) => actionCostOf(rp, a), 40_000);
    expect(Math.abs(mc - r.expectedCost) / r.expectedCost).toBeLessThan(0.05);
  });

  it('a canonicalised group: 40k policy runs match the cost it reports', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2 }, { modId: XLIGHT, slot: 2 }]);
    const mc = simulatePolicyMean(r, (a) => actionCostOf(rp, a), 40_000);
    expect(Math.abs(mc - r.expectedCost) / r.expectedCost).toBeLessThan(0.05);
  });

  // Every published distribution must still be a distribution. Collapsing two successors onto one is
  // exactly the operation that could drop or double a branch, and `addTo` summing them is what makes
  // it safe — so assert the sum rather than trusting it.
  it('leaves every state’s outgoing probabilities summing to one', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2 }, { modId: XFIRE, slot: 2 }, { modId: XLIGHT, slot: 2 }]);
    const byFrom = new Map<string, number>();
    for (const e of r.edges) byFrom.set(e.from, (byFrom.get(e.from) ?? 0) + e.prob);
    expect(byFrom.size).toBeGreaterThan(1);
    for (const [from, total] of byFrom) expect(total, from).toBeCloseTo(1, 9);
  });

  it('mixed tiers across a cross-family group', () => {
    const r = solve([{ modId: SPELL, slot: 0 }, { modId: CAST, slot: 1 },
      { modId: XCOLD, slot: 2, minTierIndex: 5 }, { modId: XLIGHT, slot: 2, minTierIndex: 3 }]);
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    expect(r.expectedCost).toBe(111.62502259425796);
  });
});

/**
 * A MAGIC START IS ITS OWN NODE, AND HAS BEEN SINCE RARITY ENTERED THE STATE.
 *
 * TODO 4 carried a paragraph saying this was still to do, with two blockers: "the state key has no
 * rarity, so a Magic start encodes identically to the Rare state with the same mods", and "`stateLabel`
 * would render both identically". Both described a design that had already been superseded — the key
 * ends in a rarity code, and no `stateLabel` exists anywhere in the repo. The note survived a rewrite
 * of the section around it because it was copied rather than checked, which is the failure mode a
 * behavioural test closes and a comment does not.
 *
 * So: pinned rather than described. A Magic start must solve, must encode as Magic, and must produce a
 * policy spanning BOTH rungs — the Regal or Augmentation that leaves Magic, and the Rare item after.
 */
describe('markovFromItem — a Magic start is modelled, not approximated', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadFrozenPrices();
  const wand = real.bases.get('Wands')!;
  const P = wand.pools.normal.prefixes;
  const S = wand.pools.normal.suffixes;
  const placed = (id: string) => ({ modId: id, tierName: real.mods.get(id)!.tiers[0]!.name });
  const targets = [P[1]!, S[0]!].map((modId) => ({ modId, minTierIndex: 0 }));
  // `policy` is keyed by plain `string` while `decodeState` takes the branded `StateKey` — the same
  // key, narrowed at a boundary this test happens to sit outside of.
  const rungsOf = (keys: Iterable<string>): Set<string> =>
    new Set([...keys].map((k) => decodeState(k as StateKey).rarity));
  const held = { base: wand, level: 82, prefixes: [placed(P[0]!)], suffixes: [] };
  const magic: ItemState = { ...held, rarity: 'magic' };
  const rare: ItemState = { ...held, rarity: 'rare' };

  it('solves a Magic start exactly, over both rarity rungs', () => {
    const r = markovFromItem(real, rp, magic, targets, { solver: 'policy' });
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    expect(r.expectedCost).toBeGreaterThan(0);
    const rungs = rungsOf(r.policy.keys());
    expect(rungs.has('magic')).toBe(true);
    expect(rungs.has('rare')).toBe(true);
  });

  /**
   * The two starts must not collapse onto one another. Same mods, different rarity, different state —
   * and a different answer, because a Magic item has to be opened before it can be exalted at all.
   */
  it('does not encode a Magic item as the Rare one with the same mods', () => {
    const m = markovFromItem(real, rp, magic, targets, { solver: 'policy' });
    const r = markovFromItem(real, rp, rare, targets, { solver: 'policy' });
    const rungs = rungsOf(r.policy.keys());
    expect(rungs.has('magic')).toBe(false); // a Rare craft never visits the Magic rung
    expect(m.expectedCost).not.toBe(r.expectedCost);
    // Dearer, and that is the direction that makes sense: the Magic item must be opened first.
    expect(m.expectedCost).toBeGreaterThan(r.expectedCost);
  });
});
