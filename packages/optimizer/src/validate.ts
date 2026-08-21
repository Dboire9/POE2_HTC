// Full-mechanic Monte-Carlo validator for the analytic engine. Unlike simulate.ts (plain add-chains
// only), this samples the REAL game mechanic at (mod, tier) granularity with every correction the
// analytic makes — orb floor (D5), item-level cap, family exclusion (D6), magic 1+1 slots (D2), tier
// targeting, and omen side-constraints. So MC → analytic by the law of large numbers is a genuine
// ground-truth check of exactly the behaviours where we diverged from the Java engine, plus an
// end-to-end check of the restart-on-first-failure COST formula.

import type { ItemBase, ItemState, PatchData, PlanStep, Rarity } from '../../engine/src/index.ts';
import { CURRENCY_FLOOR, excluded, itemFamilies, resolveMod, whiteItem, withAffix } from '../../engine/src/index.ts';
import { stepCost, type Prices } from './cost.ts';
import { mulberry32 } from './simulate.ts';

/** Max mods per side for the add's RESULT rarity (magic 1+1 / rare 3, D2) — matches the engine. */
const RESULT_SLOT_LIMIT: Record<'transmute' | 'augment' | 'regal' | 'exalt', number> = {
  transmute: 1, augment: 1, regal: 3, exalt: 3,
};

interface Pair { readonly modId: string; readonly tierIndex: number; readonly weight: number; }

/**
 * Every (mod, tier) the next add could produce on `state`, weighted exactly as the analytic's pool
 * math: open sides only (count < `limit`, D2), on-item families removed (D6), tier ilvl within
 * [`floor`, `cap`] (orb floor D5 + item-level cap), and — with `side` — only that affix type (omen).
 */
export function reachablePairs(
  data: PatchData, state: ItemState,
  opts: { limit: number; floor: number; cap: number; side?: 'prefix' | 'suffix' },
): Pair[] {
  const occupied = itemFamilies(data, state);
  const sides: ('prefix' | 'suffix')[] = opts.side ? [opts.side] : ['prefix', 'suffix'];
  const pairs: Pair[] = [];
  for (const side of sides) {
    const count = side === 'prefix' ? state.prefixes.length : state.suffixes.length;
    if (count >= opts.limit) continue; // side full → contributes nothing
    const ids = side === 'prefix' ? state.base.pools.normal.prefixes : state.base.pools.normal.suffixes;
    for (const id of ids) {
      const mod = resolveMod(data, id);
      if (excluded(mod, occupied)) continue; // can't roll a family already on the item (any of them)
      mod.tiers.forEach((t, i) => {
        if (t.ilvl >= opts.floor && t.ilvl <= opts.cap && t.weight > 0) pairs.push({ modId: id, tierIndex: i, weight: t.weight });
      });
    }
  }
  return pairs;
}

function samplePair(pairs: readonly Pair[], rng: () => number): Pair {
  const total = pairs.reduce((s, p) => s + p.weight, 0);
  let r = rng() * total;
  for (const p of pairs) {
    r -= p.weight;
    if (r < 0) return p;
  }
  return pairs[pairs.length - 1]!;
}

function rarityAfterAdd(currency: PlanStep['currency'], prev: Rarity): Rarity {
  if (currency === 'transmute') return 'magic';
  if (currency === 'regal' || currency === 'essence') return 'rare';
  return prev;
}

/** The reachable-pool options an add step implies (orb floor, item-level cap, slot limit, omen side). */
function optsForStep(step: PlanStep, level: number): { limit: number; floor: number; cap: number; side?: 'prefix' | 'suffix' } {
  if (step.currency !== 'transmute' && step.currency !== 'augment' && step.currency !== 'regal' && step.currency !== 'exalt') {
    throw new Error(`optsForStep: not an add step (${step.currency})`);
  }
  const floor = CURRENCY_FLOOR[step.tier ?? 'base'];
  const side = step.currency === 'exalt' ? step.constrainTo : undefined;
  const base = { limit: RESULT_SLOT_LIMIT[step.currency], floor, cap: level };
  return side ? { ...base, side } : base;
}

/**
 * Empirical per-step success rate for an add/essence chain, threading state as if each intended mod
 * landed. Handles orb tier, item-level cap, tier target (`minTierIndex`), and omen side (`constrainTo`)
 * — so it validates the corrected analytic, not just the plain add-chain simulate.ts covers.
 */
export function mcPerStepRates(
  data: PatchData, base: ItemBase, steps: readonly PlanStep[], runs: number, seed = 1, level = 100,
): number[] {
  const rng = mulberry32(seed);
  const rates: number[] = [];
  let state = whiteItem(base, level);
  for (const step of steps) {
    if (!('add' in step)) throw new Error(`MC supports add/essence chains only, got ${step.currency}`);
    if (step.currency === 'essence') {
      rates.push(1); // deterministic add (P=1 when legal); state advances below
    } else {
      const target = step.add;
      const minTierIndex = 'minTierIndex' in step ? step.minTierIndex ?? 0 : 0;
      const pairs = reachablePairs(data, state, optsForStep(step, level));
      let ok = 0;
      for (let r = 0; r < runs; r++) {
        const p = samplePair(pairs, rng);
        if (p.modId === target && p.tierIndex >= minTierIndex) ok++;
      }
      rates.push(pairs.length ? ok / runs : 0);
    }
    const mod = resolveMod(data, step.add);
    const tierIdx = step.currency === 'essence' ? (step.essenceTier ?? 0) : 0;
    state = withAffix(state, mod.type, { modId: step.add, tierName: mod.tiers[tierIdx]?.name ?? '' }, rarityAfterAdd(step.currency, state.rarity));
  }
  return rates;
}

export interface CostMC {
  /** Empirical expected cost over `runs` completed crafts (restart-on-first-failure). */
  readonly meanCost: number;
  /** Empirical success-per-attempt = runs / total attempts (→ analytic plan probability). */
  readonly empiricalP: number;
  readonly meanAttempts: number;
}

/**
 * Monte-Carlo the restart-on-first-failure process end-to-end: attempt the plan from white, sampling
 * each add's real outcome, restart on the first wrong result, and sum ALL currency spent until a full
 * success — averaged over `runs` completions. Validates the E = (Σ c_k·S_{k-1})/S_n formula directly.
 * Best on plans with a not-tiny per-attempt probability (else attempts explode).
 */
export function mcPlanCost(
  data: PatchData, prices: Prices, base: ItemBase, steps: readonly PlanStep[], runs: number, seed = 7, level = 100,
): CostMC {
  const rng = mulberry32(seed);
  // Reaching step k always means steps 1..k-1 landed their intended mods (any miss restarts), so the
  // pre-step state — and thus each step's reachable pool — is fixed. Precompute it once, not per run.
  const info: { cost: number; pairs: Pair[] | null; target: string; minTierIndex: number }[] = [];
  let state = whiteItem(base, level);
  for (const step of steps) {
    if (!('add' in step)) throw new Error(`MC supports add/essence chains only, got ${step.currency}`);
    const cost = stepCost(prices, step);
    if (step.currency === 'essence') {
      info.push({ cost, pairs: null, target: step.add, minTierIndex: 0 }); // deterministic
    } else {
      const minTierIndex = 'minTierIndex' in step ? step.minTierIndex ?? 0 : 0;
      info.push({ cost, pairs: reachablePairs(data, state, optsForStep(step, level)), target: step.add, minTierIndex });
    }
    const mod = resolveMod(data, step.add);
    const tierIdx = step.currency === 'essence' ? (step.essenceTier ?? 0) : 0;
    state = withAffix(state, mod.type, { modId: step.add, tierName: mod.tiers[tierIdx]?.name ?? '' }, rarityAfterAdd(step.currency, state.rarity));
  }

  let totalCost = 0;
  let totalAttempts = 0;
  for (let run = 0; run < runs; run++) {
    for (;;) {
      totalAttempts++;
      let failed = false;
      for (const step of info) {
        totalCost += step.cost;
        if (step.pairs) { // an add step (essence is deterministic → always lands)
          if (step.pairs.length === 0) { failed = true; break; }
          const p = samplePair(step.pairs, rng);
          if (p.modId !== step.target || p.tierIndex < step.minTierIndex) { failed = true; break; }
        }
      }
      if (!failed) break; // this run completed
    }
  }
  return { meanCost: totalCost / runs, empiricalP: runs / totalAttempts, meanAttempts: totalAttempts / runs };
}
