// From-item cost as a Markov Decision Process (the honest model). The linear from-item planner
// (fromItem.ts) assumes "restart to your item, free" on any miss — a fiction: a real annul removes a
// UNIFORMLY-RANDOM mod, so a miss leaves you in a WORSE state you recover from in place, and reproducing
// an expensive item is never free. Here we model the actual stochastic process: a policy over item
// states, transitions from the real pool weights, solved by value iteration for the minimum expected
// cost + the optimal policy. "Push forward" — never restart; the policy digs out of a bricked state.
//
// This file is the ORCHESTRATION: resolve the targets, enumerate the lattice, run value iteration, and
// walk the optimal policy into a graph. The two halves it stands on live next door —
//   • markovState.ts   — what a state IS (the present/blocked/junk abstraction) and how to key it
//   • markovActions.ts — what you can DO from a state, what it costs, and where it lands you
//
// v2 SCOPE (was v1: rollable normal targets, base orbs, exalt/annul/side-annul/chaos):
//   • v2a — family-aware tiered states: a below-tier roll BLOCKS the family; an item that already
//     carries a target at too low a tier starts BLOCKED, not satisfied. (Untiered targets have no
//     below-tier band, so this reduces exactly to the v1 present/absent model.)
//   • v2b — richer action set: Exalted Orb at base/Greater/Perfect strength and side-constrained
//     exalts. See markovActions.ts for the price-gating rule.
//
// DOCUMENTED APPROXIMATIONS: two target mods sharing a family are validated out upstream (so free
// targets always have distinct families); a fractured JUNK mod is treated as ordinary removable junk
// (only target mods can be fractured-locked here). Omen of Whittling — a CHAOS omen that changes the
// item's lowest-TIER mod (per-mod T-number, not ilvl) rather than a random one — needs the mod-tier
// ORDERING the abstraction discards, so it's out of scope. Perfect-essence / desecrate / essence
// targets stay on the linear planner (the caller falls back).

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import { modTierWeight, resolveMod } from '../../engine/src/pool.ts';
import { bossOmenAllowed, desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { pricesForBase } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import type { ActionDef, McAction } from './markovActions.ts';
import { createActionSpace } from './markovActions.ts';
import type { McTarget, StateKey } from './markovState.ts';
import {
  classifyStart, decodeState, encodeState, enumerateStates, has, popcount, sideIndexOf,
} from './markovState.ts';

// The action vocabulary is this module's public face too — callers (the facade, the UI, tests) import
// it from here rather than reaching into markovActions.ts.
export type { McAction, ExaltStrength } from './markovActions.ts';
export { actionCostOf } from './markovActions.ts';

export interface PolicyNode {
  readonly key: string;
  /** Target mod ids present (at ≥ their wanted tier) in this state. */
  readonly present: readonly string[];
  /** Target mod ids whose family is occupied by a below-tier ("off-tier") roll — must be annulled first. */
  readonly blocked: readonly string[];
  readonly junkPrefixes: number;
  readonly junkSuffixes: number;
  /** Which side carries an unwanted DESECRATED mod, if any — it blocks re-desecrating until removed. */
  readonly desecratedJunk?: 'prefix' | 'suffix';
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /** Minimum expected cost to reach the target from here. */
  readonly expectedCost: number;
  /** The optimal currency to use here (undefined at the goal). */
  readonly action?: McAction;
}

export interface PolicyEdge {
  readonly from: string;
  readonly to: string;
  readonly action: McAction;
  readonly prob: number;
  /** True when this outcome moves AWAY from the target (a "brick" — the back-arrow in the graph). */
  readonly regress: boolean;
}

export interface MarkovResult {
  /** Minimum expected cost (exalt-equivalents) to reach the target under the optimal policy. */
  readonly expectedCost: number;
  /** False when a target mod can't be rolled at all (ungettable at this item level) — cost is ∞. */
  readonly feasible: boolean;
  readonly reason?: string;
  /** Reachable states under the optimal policy (the graph's squares), start first. */
  readonly nodes: readonly PolicyNode[];
  /** Policy transitions (the graph's arrows). */
  readonly edges: readonly PolicyEdge[];
  /** Optimal action for EVERY non-goal state (key → action), for simulation/validation. */
  readonly policy: ReadonlyMap<string, McAction>;
}

/**
 * Where a solve currently is. `done`/`total` are raw counts, NOT a percentage: how to weight the
 * phases against each other is a presentation decision (they are wildly unequal — see below) and
 * belongs to the caller, not here.
 */
export interface MarkovProgress {
  readonly phase: 'actions' | 'compile' | 'solve';
  readonly done: number;
  readonly total: number;
}

export interface MarkovOptions {
  /** Value-iteration convergence tolerance (max ΔV). Default 1e-9. */
  readonly tolerance?: number;
  /** Safety cap on iterations. Default 100000. */
  readonly maxIters?: number;
  /**
   * Called as the solve advances, so a UI can show progress and stay honest about a multi-second wait.
   * A plain callback — not I/O, not DOM — so this file stays pure.
   *
   * Report it from the `actions` phase, not from value iteration: measured on a 3-target Wand craft,
   * loosening `tolerance` from 1e-9 to 1e-1 moved the total only 3877ms → 3458ms, so VI is ~11% of the
   * work and building the action distributions is the rest. A bar driven by VI sweeps would sit at
   * zero for three seconds and then jump to done.
   */
  readonly onProgress?: (p: MarkovProgress) => void;
  /** Currencies the player doesn't have; the policy never plays one. */
  readonly policy?: CurrencyPolicy;
}

/** How often the O(states) loops report. Frequent enough to animate, rare enough to cost nothing. */
const PROGRESS_STRIDE = 64;

/** Most target mods the lattice is enumerated for (3^n grows fast; 6 is the item's own slot cap). */
const MAX_TARGETS = 6;

export function markovFromItem(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions = {},
): MarkovResult {
  const fail = (reason: string): MarkovResult =>
    ({ expectedCost: Infinity, feasible: false, reason, nodes: [], edges: [], policy: new Map() });
  if (start.rarity !== 'rare') return fail('the MDP planner models Rare items');
  const prices = pricesForBase(rawPrices, start.base);

  const level = start.level;
  const pools = start.base.pools;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  // Resolve targets into the ordered list the bitmasks index: rollable normal mods, desecrated mods
  // (added by a Desecration with the boss omen that selects them), and perfect-essence mods (forced on
  // by a Perfect Essence, which eats one existing mod as it adds). A REGULAR essence needs a Magic item
  // and this planner only models Rares, so essence-only mods stay on the from-white linear planner.
  const list: McTarget[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    if (mod.source === 'essence') {
      return fail(`${t.modId} needs a regular essence, which only applies to a Magic item — craft it from white`);
    }
    if (mod.source !== 'normal' && mod.source !== 'desecrated' && mod.source !== 'perfect_essence') {
      return fail(`${t.modId} is not a rollable, desecrated or perfect-essence mod (the MDP handles those)`);
    }
    if (mod.source === 'desecrated') {
      const inPool = pools.desecrated.prefixes.includes(mod.id) || pools.desecrated.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s desecrated pool`);
      if (desecrationOmenForMod(mod) === undefined) return fail(`${t.modId} has no boss omen that targets it`);
      // Every desecrate action this planner models is boss-targeted, and those omens are "Weapon or
      // Jewellery" only — so on armour it cannot represent adding a desecrated mod at all. Say so
      // rather than quietly planning a step the game refuses; the linear from-item planner still
      // costs this craft, using the whole-pool draw that armour actually gets.
      if (!bossOmenAllowed(start.base.category)) {
        return fail(
          `boss omens only apply to Weapon or Jewellery desecrations, so ${start.base.id} can't target `
          + `${t.modId} — see the step routes below for the untargeted draw`,
        );
      }
    }
    if (mod.source === 'perfect_essence') {
      const inPool = pools.essence.prefixes.includes(mod.id) || pools.essence.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s essence pool`);
    }
    list.push({
      modId: mod.id, type: mod.type, family: mod.family, mod,
      minIndex: t.minTierIndex ?? 0, fractured: fracturedIds.has(mod.id),
    });
  }
  const n = list.length;
  if (n === 0) return fail('no target mods');
  if (n > MAX_TARGETS) return fail(`target has more than ${MAX_TARGETS} mods`);
  // The Desecration mechanic places a single carved mod — an item can hold at most one desecrated mod.
  if (list.filter((t) => t.mod.source === 'desecrated').length > 1) {
    return fail('an item can hold at most one desecrated mod');
  }
  const idxOf = new Map(list.map((t, i) => [t.modId, i]));

  // A rollable target that can never roll (weight 0 even at base strength, the most permissive) is
  // impossible. Desecrated targets don't roll from the normal pool, so the pool check above covers them.
  const ungettable = list.find((t) => t.mod.source === 'normal' && modTierWeight(t.mod, 0, level, t.minIndex) === 0);
  if (ungettable) return fail(`${ungettable.modId} can't roll at item level ${level}`);

  const side = sideIndexOf(list);
  const s0 = classifyStart(data, start, list, idxOf);
  // Desecration is only modelled when it's actually in play — a desecrated target to craft, or a
  // desecrated mod already on the item to clear. Otherwise a Desecration could only ever add junk, so
  // leaving it out costs nothing and keeps the state space exactly as it was before v3.
  const desecratable = list.some((t) => t.mod.source === 'desecrated') || s0.desJunk !== 'none';
  const { actionsOf } = createActionSpace({
    data, prices, level, pools, list, side, desecratable,
    bossTargetable: bossOmenAllowed(start.base.category),
    ...(opts.policy ? { policy: opts.policy } : {}),
  });

  const GOAL = (1 << n) - 1; // all target mods present, none blocked, no junk
  const goalKey = encodeState(GOAL, 0, 0, 0);

  const allStates = enumerateStates(n, side, desecratable);
  // The dominant cost of the whole solve: one full action set, with its outcome distribution, per
  // state. `allStates.length` is known before the loop, so progress here is genuinely linear.
  const report = opts.onProgress;
  const actionCache = new Map<StateKey, ActionDef[]>();
  for (let i = 0; i < allStates.length; i++) {
    const key = allStates[i]!;
    actionCache.set(key, key === goalKey ? [] : actionsOf(decodeState(key)));
    if (report && i % PROGRESS_STRIDE === 0) report({ phase: 'actions', done: i, total: allStates.length });
  }
  report?.({ phase: 'actions', done: allStates.length, total: allStates.length });

  // ── Compile the lattice to dense numeric arrays ─────────────────────────────
  // Value iteration is arithmetic, but the natural representation (string StateKeys in Maps) makes it
  // arithmetic *through a hash table*: at 6 targets the inner loop did ~3.5 BILLION string-keyed Map
  // lookups and took ~51s. Compiling once to integer indices + typed arrays makes the loop pure
  // indexed maths. Entry order is preserved exactly as the Maps iterated (insertion order), so the
  // floating-point sums are bit-identical to the Map version — the speedup is free of behaviour.
  const idxOfState = new Map<StateKey, number>();
  for (let i = 0; i < allStates.length; i++) idxOfState.set(allStates[i]!, i);
  const N = allStates.length;

  /** One action, ready for the solver: its self-loop hoisted out and outcomes as parallel arrays. */
  interface CompiledAction {
    readonly def: ActionDef;
    readonly cost: number;
    /** P(this action leaves the state unchanged) — divided out rather than iterated. */
    readonly selfProb: number;
    /** Destination indices, self-loop EXCLUDED — its probability lives in `selfProb`. */
    readonly to: Int32Array;
    readonly prob: Float64Array;
  }
  const compiled: CompiledAction[][] = new Array(N);
  for (let i = 0; i < N; i++) {
    const key = allStates[i]!;
    const defs = actionCache.get(key)!;
    const out: CompiledAction[] = [];
    for (const def of defs) {
      const to: number[] = [];
      const prob: number[] = [];
      let selfProb = 0;
      for (const [toKey, p] of def.dist) {
        if (toKey === key) { selfProb += p; continue; }
        to.push(idxOfState.get(toKey)!);
        prob.push(p);
      }
      out.push({ def, cost: def.cost, selfProb, to: Int32Array.from(to), prob: Float64Array.from(prob) });
    }
    compiled[i] = out;
    if (report && i % PROGRESS_STRIDE === 0) report({ phase: 'compile', done: i, total: N });
  }
  report?.({ phase: 'compile', done: N, total: N });

  // ── Value iteration ─────────────────────────────────────────────────────────
  // Standard stochastic-shortest-path VI: 0-initialise (a finite lower bound) and let values climb to
  // the fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery
  // cycles here — e.g. {both targets + junk} ↔ {one target + junk} each need the other finite first —
  // so neither bootstraps. Every target is gettable by now, so the goal is reachable from every state
  // and VI converges to a finite V.) Each action solves its own self-loop via ÷(1 − pStay).
  const tol = opts.tolerance ?? 1e-9;
  const maxIters = opts.maxIters ?? 100_000;
  const V = new Float64Array(N); // 0-initialised, as above
  const goalIdx = idxOfState.get(goalKey)!;
  const valueOf = (a: CompiledAction): number => {
    if (a.selfProb >= 1 - 1e-12) return Infinity; // an action that only loops back can't make progress
    let s = 0;
    for (let j = 0; j < a.to.length; j++) s += a.prob[j]! * V[a.to[j]!]!;
    return (a.cost + s) / (1 - a.selfProb);
  };
  let decades = 0; // log-distance the first sweep had left to travel; see the progress note below
  for (let iter = 0; iter < maxIters; iter++) {
    let delta = 0;
    for (let i = 0; i < N; i++) {
      if (i === goalIdx) continue;
      const acts = compiled[i]!;
      let best = Infinity;
      for (let k = 0; k < acts.length; k++) {
        const v = valueOf(acts[k]!);
        if (v < best) best = v;
      }
      if (!Number.isFinite(best)) continue;
      const prev = V[i]!;
      V[i] = best;
      const d = Math.abs(best - prev);
      if (d > delta) delta = d;
    }
    if (delta <= tol) break;
    // VI converges geometrically, so "sweeps remaining" is not knowable and counting them against
    // `maxIters` (100k, but this converges in tens) would peg the bar at zero. What IS monotone is how
    // far the residual has travelled toward `tol` on a log scale — so a unit here is one decade
    // closed, and the total is the distance the first sweep found still to cover.
    if (report) {
      const remaining = Math.log10(Math.max(delta, tol) / tol);
      if (iter === 0) decades = remaining;
      if (decades > 0) report({ phase: 'solve', done: Math.round(decades - remaining), total: Math.round(decades) });
    }
  }
  report?.({ phase: 'solve', done: 1, total: 1 });

  // ── Can the goal actually be reached? ───────────────────────────────────────
  // Value iteration 0-initialises and climbs, which is a valid lower bound only while the goal is
  // reachable from EVERY state — true before currency exclusions existed (see the note above VI), and
  // no longer. Exclude enough currency and some states, possibly the start, have no route to the goal
  // at all: their V never receives a finite backup and simply stays at 0, which reads as "expected
  // cost 0", i.e. a free craft that is already finished. So establish reachability explicitly rather
  // than inferring it from a value that has no way to say "never".
  const canReach = new Uint8Array(N);
  canReach[goalIdx] = 1;
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < N; i++) {
      if (canReach[i] === 1) continue;
      for (const a of compiled[i]!) {
        let reaches = false;
        for (let j = 0; j < a.to.length; j++) if (canReach[a.to[j]!] === 1) { reaches = true; break; }
        if (reaches) { canReach[i] = 1; changed = true; break; }
      }
    }
  }

  // ── Extract policy + reachable graph from the start ─────────────────────────
  const startKey = encodeState(s0.present, s0.blocked, s0.jp, s0.js, s0.desJunk);
  const startIdx = idxOfState.get(startKey)!;
  if (canReach[startIdx] !== 1) {
    return fail(opts.policy
      ? 'no route reaches this target with the currencies you have — allow more and try again'
      : 'no policy reaches the target');
  }
  const startCost = V[startIdx] ?? Infinity;
  if (!Number.isFinite(startCost)) return fail('no policy reaches the target');

  const bestAction = (k: StateKey): ActionDef | undefined => {
    let best: ActionDef | undefined;
    let bestVal = Infinity;
    for (const a of compiled[idxOfState.get(k)!]!) {
      const val = valueOf(a);
      if (val < bestVal) { bestVal = val; best = a.def; }
    }
    return best;
  };

  // Full policy over every non-goal state (the reachable graph below is a subset) — for the MC validator.
  const policy = new Map<StateKey, McAction>();
  for (const key of allStates) {
    if (key === goalKey) continue;
    const a = bestAction(key);
    if (a) policy.set(key, a.action);
  }

  // Distance-to-goal for layout/regress: missing targets + blocked (each needs a remove then an add) +
  // junk, counting an unwanted desecrated mod as junk too (it likewise costs a removal to clear).
  const distanceToGoal = (k: StateKey): number => {
    const st = decodeState(k);
    return (n - popcount(st.present)) + popcount(st.blocked) + st.jp + st.js + (st.desJunk === 'none' ? 0 : 1);
  };
  const nodes: PolicyNode[] = [];
  const edges: PolicyEdge[] = [];
  const seen = new Set<StateKey>();
  const queue: StateKey[] = [startKey];
  while (queue.length > 0) {
    const k = queue.shift()!;
    if (seen.has(k)) continue;
    seen.add(k);
    const st = decodeState(k);
    const isGoal = k === goalKey;
    const act = isGoal ? undefined : bestAction(k);
    nodes.push({
      key: k,
      present: list.filter((_, i) => has(st.present, i)).map((t) => t.modId),
      blocked: list.filter((_, i) => has(st.blocked, i)).map((t) => t.modId),
      junkPrefixes: st.jp, junkSuffixes: st.js,
      ...(st.desJunk === 'none' ? {} : { desecratedJunk: st.desJunk }),
      isStart: k === startKey, isGoal, expectedCost: V[idxOfState.get(k)!] ?? Infinity,
      ...(act ? { action: act.action } : {}),
    });
    if (act) {
      for (const [to, p] of act.dist) {
        if (p <= 0) continue;
        edges.push({ from: k, to, action: act.action, prob: p, regress: distanceToGoal(to) > distanceToGoal(k) });
        if (!seen.has(to)) queue.push(to);
      }
    }
  }

  return { expectedCost: startCost, feasible: true, nodes, edges, policy };
}
