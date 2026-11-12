// The true expected cost, as a Markov Decision Process. The step planners (optimize.ts, fromItem.ts)
// price a FIXED sequence and restart on the first miss; a real miss leaves a worse item you can keep
// working on — an Annulment removes a uniformly random mod — and buying the item again is never free.
// Here the actual stochastic process is modelled: states of the item, actions with their real pool
// weights, and the minimum expected cost with the policy that achieves it. Starting over is one of the
// actions when the caller prices a base (`restartCost`), so the policy restarts only where that is cheaper.
//
// This file is the ORCHESTRATION and the public face (the result and option types). The solve runs in
// four phases, each its own module, each reading the last one's output:
//   • markovProblem.ts — resolve the targets into positions, and refuse by name what can't be planned
//   • markovLattice.ts — enumerate the states, find the goals, compile the actions, find the dead ends
//   • markovSolve.ts   — phase A / phase B, and the `bound` (markovOffer.ts prices an offer for both)
//   • markovReadout.ts — the plan (`RouteTable`), the route, the starting-item table, the replay
// (split out of this one file 2026-11-12 by MOVING the code; markovSplit.test.ts holds every answer
// byte-identical to before). They stand on —
//   • markovState.ts    — what a state IS (present / blocked / junk per side / desecration flag / rarity)
//   • markovActions.ts  — what you can DO from a state, what it costs, and where it lands you
//   • markovSymmetry.ts — merging and canonicalising interchangeable targets
//   • markovRoute.ts    — reading the policy as a route and a graph
//
// THE SOLVE: phase A is value iteration without restart, from 0; phase B adds restart and starts from
// phase A's values, by value iteration or (the app's default) policy iteration with each policy costed in
// closed form. Dead states are found first (`prob1`) and pinned at Infinity. `bound` says whether the
// number is exact, a floor or a ceiling. docs/ALGORITHM.md has the whole account.
//
// WHAT IT APPROXIMATES OR LEAVES OUT:
//   • The lattice counts junk, never WHICH junk, so a junk mod's family is taken out of the next roll's
//     pool on average (`junkFamilies`, mean-field) rather than exactly: within 2% of the replay on the 18
//     crafts measured (TODO 23, 2026-09-24).
//   • The Omen of Whittling removes the lowest-LEVEL mod, and the state keeps no levels, so the MDP does
//     not play it (TODO 12b, 27); nor the Erasure omens (12c), nor Greater Exaltation (14a, measured).

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { pricesForBase } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import type { Spare } from './slots.ts';
import type { McAction } from './markovActions.ts';
import type { PolicyEdge, PolicyNode, RouteTable } from './markovRoute.ts';
import type { Holding } from './markovStarts.ts';
import type { ReplayOptions, ReplayReport } from './markovReplay.ts';
import type { Answer } from './markovProblem.ts';
import { resolveProblem } from './markovProblem.ts';
import { buildLattice } from './markovLattice.ts';
import { solveLattice } from './markovSolve.ts';
import { readOut } from './markovReadout.ts';

// The action vocabulary is this module's public face too — callers (the facade, the UI, tests) import
// it from here rather than reaching into markovActions.ts. So are the route's shapes, which live beside
// the walk that builds them (markovRoute.ts).
export type { McAction, ExaltStrength } from './markovActions.ts';
export { actionCostOf } from './markovActions.ts';
export type { PolicyEdge, PolicyNode, RouteTable } from './markovRoute.ts';
export type { Holding } from './markovStarts.ts';
export type { ReplayOptions, ReplayReport, ReplayResult, WatchMod } from './markovReplay.ts';


export interface MarkovResult {
  /** Minimum expected cost (exalt-equivalents) to reach the target under the optimal policy. */
  readonly expectedCost: number;
  /** False when a target mod can't be rolled at all (ungettable at this item level) — cost is ∞. */
  readonly feasible: boolean;
  readonly reason?: string;
  /**
   * Set when there is no number because the solve ran out of clock or sweeps before it had one — the
   * one failure a higher Search effort can fix, since both limits rise with it. Every other `reason` is
   * about the target itself, and trying harder changes nothing.
   */
  readonly stoppedEarly?: true;
  /**
   * Whether a Desecration was in the model, and why. `required`: the craft needs a bone — a desecrated
   * target, or a carved mod already on the item. `optional`: only a priced bone put it there, so the same
   * craft can also be planned without one (`markovBoneFree.ts`). Absent: no Desecration in play.
   */
  readonly bones?: 'optional' | 'required';
  /**
   * The answer is the exact cost of the best plan WITHOUT Desecration, given because the solve with it
   * ran out — a ceiling on the craft with bones, which can only make it cheaper (`markovBoneFree.ts`).
   * `bound` is then `upper`.
   */
  readonly withoutBones?: true;
  /**
   * Whether value iteration actually reached `tolerance`, or gave up at `maxIters`.
   *
   * This is NOT a detail: an unconverged `expectedCost` is a bound, not an estimate. Which bound is
   * `bound`'s job — read that, don't assume. It happens for real: an untargeted armour desecration
   * lands one specific mod about 1 in 121,510 times, and VI's convergence rate is governed by exactly
   * that probability, so it exhausts all 100k sweeps.
   */
  readonly converged: boolean;
  /**
   * Which side of the truth `expectedCost` falls on — the caller renders "x", "≥ x" or "≤ x" from it.
   *
   * Not derivable from `converged`, because the two solve modes truncate in OPPOSITE directions and
   * getting that backwards prints the most precise-looking wrong figure in the app:
   *   • `exact`  — VI reached `tolerance`.
   *   • `lower`  — a push-forward solve (no `restartCost`) that ran out. VI 0-initialises and CLIMBS,
   *                so the true cost is at least this and may be far more.
   *   • `upper`  — a restart-enabled solve that ran out. It seeds from a proper policy's value and
   *                DESCENDS, so the true cost is at most this. See the two-phase note at the solver.
   * Meaningful only when `feasible`.
   */
  readonly bound: 'exact' | 'lower' | 'upper';
  /** Reachable states under the optimal policy (the graph's squares), start first. */
  readonly nodes: readonly PolicyNode[];
  /** Policy transitions (the graph's arrows). */
  readonly edges: readonly PolicyEdge[];
  /** Optimal action for EVERY non-goal state (key → action), for simulation/validation. */
  readonly policy: ReadonlyMap<string, McAction>;
  /**
   * What this same craft would cost starting from a BARE item of the start's rarity — none of the
   * targets, no junk. The zero point `expectedCost` is progress against.
   *
   * **Free.** The solve already computes V for every state in the lattice, and the bare state is one
   * of them; this reads it out rather than solving anything twice. A second solve would double a
   * three-minute craft.
   *
   * It exists because "how many of my targets are already on the item" is a bad proxy for how far
   * along you are, and measurably so: on a 6-target T2 Wand, holding FOUR of the six is 4.4% of the
   * cost, not 67% (docs/validation.md, 2026-09-03). Cost is back-loaded — each mod added shrinks the
   * slots an Exalt can land in, while a miss then needs an Annulment that picks uniformly and can take
   * what was banked.
   *
   * `expectedCost` can be LARGER than this, and that is measured rather than assumed: a Wand carrying
   * three junk mods and none of the six targets costs **1.509914e6 against the bare 1.509425e6 — 489 ex
   * WORSE than an empty base**, because the junk has to come off and an Annulment takes a mod at
   * random. Callers must handle that sign rather than assuming progress is positive. (A first attempt
   * to demonstrate this failed: the item held four targets alongside the junk, and their value swamped
   * it at +14,196. A branch for a state nobody has produced is dead code dressed as care.)
   *
   * Absent when there is nothing to compare — the guard for an item that already matches its target
   * returns before a lattice exists — or when the bare state is unreachable (V pinned at Infinity).
   */
  readonly bareCost?: number;
  /**
   * Every clean item the craft could START from, priced — see `Holding` and markovStarts.ts.
   *
   * Read straight out of the solved lattice, so it costs nothing and is exactly as trustworthy as
   * `expectedCost`: same `bound`, same solve. Absent when the craft did not reach value iteration.
   * The empty Rare is a row, and equals `bareCost` only when the craft starts Rare.
   */
  readonly holdings?: readonly Holding[];
  /**
   * The solved policy over the whole lattice, so a route can be drawn from any state without solving
   * again — see `RouteTable`. Only when asked for (`keepRoutes`), and only on an EXACT solve or a CEILING
   * whose plan is checked to finish (`finishesFrom`): that plan is not proven cheapest, but it is a plan,
   * and every figure from it is a ceiling like the result's. Never on a floor, whose policy may not finish.
   */
  readonly routes?: RouteTable;
  /** The `restartCost` this solve ran with, echoed — present exactly when starting over was a move. */
  readonly restartCost?: number;
  /** The solved policy played on real items — present exactly when `replay` was asked for and the solve
   *  was EXACT. See markovReplay.ts. */
  readonly replay?: ReplayReport;
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
  /**
   * Value-iteration convergence tolerance (max ΔV), in exalt-equivalents.
   *
   * Defaults to a THOUSANDTH of the cheapest action in the craft rather than a fixed 1e-9, because
   * these values span ten orders of magnitude between crafts — a flat 1e-9 makes a 2e6 ex solve grind
   * fifteen decades of residual to settle digits neither the price sheet nor the player has. Measured
   * on a 5-target from-white Wand, the full two-phase solve: **102.5 s → 50.1 s**, for a relative error
   * of **1.0e-3**.
   *
   * Two things make that error acceptable rather than merely small. It is far below what the inputs
   * support — the price sheet moves daily and the desecrated spawn weight is unverified by ~900x — and
   * it is one-directional: the sequence stops ABOVE the fixed point, so the number overstates the cost
   * and never understates it. (The residual is not the error. A descending sequence stopping at Δ < tol
   * still sits tol/(1−r) above the limit, and r is near 1 here — which is why the error is ~1e-3 and
   * not ~1e-6. Dividing by 10,000 instead buys 10x the accuracy for almost none of the speed: 92.2 s.)
   *
   * Pass a value to override, which is what the hand-computed tests do: they assert the model's
   * arithmetic to nine decimals, so they ask for a tolerance that supports it.
   */
  readonly tolerance?: number;
  /** Safety cap on iterations. Default 100000. */
  readonly maxIters?: number;
  /** Cap on policy-improvement rounds when `solver: 'policy'`. A runaway guard, not a budget. */
  readonly maxRounds?: number;
  /** Which solver runs phase B. 'value' is the shipped Gauss-Seidel VI; 'policy' is policy iteration,
   *  which ends on a proof that the policy is optimal rather than on a residual tolerance. */
  readonly solver?: 'value' | 'policy';
  /**
   * Cost each policy by ITERATING its value rather than solving it in closed form.
   *
   * Only for measurement and differential testing — the closed form is exact and vastly faster (see
   * `evaluateClosedForm`). Kept because "the two agree" is the evidence that licenses the fast path,
   * and that comparison has to stay runnable.
   */
  readonly iterativeEval?: boolean;
  /**
   * Guess a starting policy instead of computing phase A's optimal push-forward value.
   *
   * OFF by default, because measurement says it is a bad trade on exactly the crafts that hurt.
   * Interleaved medians against the two-phase path:
   *
   *   3 tgt T1  (250 states)     2.0s -> 0.6s    3.22x FASTER
   *   4 tgt T2  (312 states)     4.5s -> 4.1s    1.09x
   *   5 tgt T2  (1,166 states)  34.4s -> 28.0s   1.23x
   *   6 tgt T2  (3,963 states)   264s -> 445s    1.7x SLOWER, both reps
   *
   * Skipping phase A means policy iteration starts from a worse policy and needs more rounds — small
   * crafts converge in ≤20, and the big one needs enough that the expensive seed loses. Phase A is
   * dear but it buys a very good starting point. Saving 1.4s on a two-second craft is not worth
   * costing three minutes on a four-minute one, so the default stays two-phase.
   *
   * Kept, with its tests, because the machinery is sound and the crossover is real — what it lacks is
   * a principled way to know which side of it a craft falls on. See TODO 3.
   */
  readonly heuristicSeed?: boolean;
  /**
   * Seed policy iteration from ANOTHER solve's plan for the same craft — the one without bones
   * (markovBoneFree.ts) — read in this solve's states (`projectPlan`), the guessed policy filling the
   * states it has no counterpart for. Skips phase A like `heuristicSeed`; falls back the same way when
   * the seed turns out improper or does not settle inside its cap. Policy solver only.
   */
  readonly seedFrom?: RouteTable;
  /**
   * Take each junk mod's family out of the next roll's pool, on average (`ActionSpaceParams.junkFamilies`,
   * TODO 23). ON unless `false`: measured against the replay on 18 crafts, it takes the solver from 2–12%
   * high to within 2% (docs/validation.md). `false` is the old model, kept for that comparison.
   */
  readonly junkFamilies?: boolean;
  /**
   * Cost each policy by solving its chain outright (dense elimination) rather than by sweeping it, when
   * the chain has at most `DIRECT_MAX_STATES` states. Exact where sweeping only looks settled — see
   * `evaluateClosedForm`. The Tablets tab sets it: a tablet's lattice is a few hundred states, and its
   * rarest four-modifier crafts never settled otherwise. Off elsewhere, so gear keeps its numbers.
   */
  readonly exactEvaluation?: boolean;
  /**
   * Wall-clock ceiling in milliseconds, from the player's "how hard should I look?" setting.
   *
   * ABSENT means no limit, and that is deliberate: it keeps the test suite deterministic (a clock
   * makes results machine-dependent), so only the app passes one. Hitting it stops the sweeps and
   * yields `converged: false`, which callers must render as a lower bound — see that field.
   */
  readonly maxMillis?: number;
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
  /**
   * What another base costs, when the craft can be abandoned and begun again.
   *
   * ABSENT means it cannot be — the from-item default, and the premise of the push-forward model: the
   * specific Rare in your stash is not for sale. Pass it for a from-white craft, where it is not a
   * refinement but a correctness requirement. Without the action the policy has to dig a bad Transmute
   * out with a 158.7ex Annulment rather than bin 0.18ex and reroll, and the answer comes out far too
   * high. Zero is a legitimate value: a white base is, to a rounding error, free.
   */
  readonly restartCost?: number;
  /** Currencies the player doesn't have; the policy never plays one. */
  readonly policy?: CurrencyPolicy;
  /**
   * Positions on the finished item the player doesn't care about — see `Spare` in markovState.ts.
   *
   * It widens the accepting set and nothing else: no extra states, no extra candidates, no change to
   * what an action can do. Absent ⇒ `NO_SPARE`, which is the goal set this solver has always had.
   */
  readonly spare?: Spare;
  /**
   * A finished item still has its empty slots filled, one Exalted Orb each. A Precursor Tablet is
   * always run with all four modifiers, so a craft that stops at two still has two Exalts to pay —
   * and an Exalt on a Rare with room always lands something, so that is exactly what filling costs.
   * Charged as the cost of FINISHING in that state, so the policy weighs it like any other cost and
   * may prefer to finish fuller; the replay pays it too. Absent ⇒ finishing is free, as it always was.
   * It only has room to act where `spare` leaves slots open: a strict target finishes full or not at all.
   */
  readonly fillOnFinish?: boolean;
  /**
   * Carry the solved policy (`MarkovResult.routes`) on an exact result, or a ceiling whose plan finishes.
   *
   * Opt-in because it is the whole lattice: the Lab asks for it, to draw the route from any item the
   * player might buy instead, and no other caller pays to ship it.
   */
  readonly keepRoutes?: boolean;
  /**
   * Play the solved policy on real items afterwards (markovReplay.ts): what following it really costs,
   * and how often each watched mod or combination shows up on the way.
   *
   * Only on an EXACT solve, for the reason `keepRoutes` gives — a bound's policy is not the optimal one,
   * and numbers drawn from it would describe a plan nobody should follow.
   */
  readonly replay?: ReplayOptions;
}


/** Either grade of bone — Preserved (`desecrate`) or Ancient (`desecrate_ancient`), as price-sheet keys. */
export const BONE_KEYS = ['desecrate', 'desecrate_ancient'] as const;

/**
 * Whether a Desecration is in this craft's model, and why (`MarkovResult.bones`): `required` for a
 * desecrated target or a carved mod already on the item, `optional` when only a priced bone puts it
 * there, absent when neither does or the player excluded bones. Known before solving, so a caller can
 * plan around it (markovBoneFree.ts).
 *
 * A desecrated target to craft, a flagged mod on the item to clear — or simply a bone on the price
 * sheet. A bone OFFERS three modifiers and you keep one, so it can be the cheapest way to add an
 * ORDINARY mod, and whether it is depends on what a miss would cost, which only the solve knows.
 *
 * A price test used to stand here — bones only when one cost less than `DESECRATION_OFFER_COUNT`
 * Exalts — sold as a necessary condition: the offer at most triples the chance of a hit, so a dearer
 * bone "cannot win". That weighs one bone against three Exalts, but three Exalts put three mods on
 * the item and a bone puts one, and every miss is a mod to take off again (an Annulment, which may
 * take a target instead) or the item itself. What the offer buys is not a hit; it is not having to
 * take a miss. Measured 2026-09-10 on a held Rare Wand: a jawbone priced at 30 Exalts still takes the
 * craft from 4,073.8ex to 2,608.8ex. By then the market had closed the test on every base (jawbone
 * 4.2ex, rib 21ex, collarbone 110ex, Exalt 1ex), so no craft desecrated for an ordinary mod.
 *
 * What the test protected is real, and now paid for: the flag axis, ~3x the states and 2-8x the solve
 * time on a craft that would not otherwise have used it. TODO 20.
 *
 * An ABSENT price reads as "no bone", not as a free one: `stepCost` turns a missing key into 0, and
 * a 0 here would switch desecration on for every base in a sheet that simply doesn't price bones.
 */
export function boneRole(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], policy?: CurrencyPolicy,
): MarkovResult['bones'] {
  const prices = pricesForBase(rawPrices, start.base);
  // None of it matters if the player has excluded the currency: with no Desecration in the action space
  // nothing can ever set the flag, so enumerating the axis is pure cost. Checked here rather than left
  // to `allowsAction`, which prunes ACTIONS and cannot shrink the lattice.
  const allowed = BONE_KEYS.some((k) => !policy?.excluded.has(k));
  const priced = BONE_KEYS.some((k) => prices.currency[k] !== undefined && !policy?.excluded.has(k));
  // A mod a bone placed is on the held item exactly when `classifyStart` will flag one — read off the
  // item itself. A merged slot shares one source, so the targets as named answer for the merged list.
  const needs = targets.some((t) => data.mods.get(t.modId)?.source === 'desecrated')
    || [...start.prefixes, ...start.suffixes].some((p) => p.desecrated === true || data.mods.get(p.modId)?.source === 'desecrated');
  if (!allowed || !(needs || priced)) return undefined;
  return needs ? 'required' : 'optional';
}

export function markovFromItem(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions = {},
): MarkovResult {
  // Said on every answer, a failure's too, so a caller can tell a craft that could be planned without
  // bones from one that needs them.
  const bones = boneRole(data, rawPrices, start, targets, opts.policy);
  const fail = (reason: string, why: { stoppedEarly?: true } = {}): MarkovResult => ({
    expectedCost: Infinity, feasible: false, converged: true, bound: 'exact',
    reason, nodes: [], edges: [], policy: new Map(), ...why, ...(bones ? { bones } : {}),
  });
  const refuse = (reason: string, why: { stoppedEarly?: true } = {}): Answer => ({ answer: fail(reason, why) });

  // Four phases, each reading the last one's output (the header has the map). Any of them may answer
  // outright — a refusal by name, or an item that is already finished.
  const problem = resolveProblem(data, rawPrices, start, targets, opts, bones, refuse);
  if ('answer' in problem) return problem.answer;
  const lattice = buildLattice(problem, opts, refuse);
  if ('answer' in lattice) return lattice.answer;
  const solved = solveLattice(problem, lattice, opts, refuse);
  if ('answer' in solved) return solved.answer;
  const result = readOut(problem, lattice, solved, opts, bones, refuse);
  return 'answer' in result ? result.answer : result;
}
