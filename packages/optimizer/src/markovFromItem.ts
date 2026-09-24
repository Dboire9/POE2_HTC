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
// targets always have distinct families). A DIFFERENT mod of a target's family is modelled — it blocks
// the target (markovSiblings.ts) — but a junk mod's own family is NOT removed from the next roll's
// pool, since the lattice never knows which junk landed. That overstates the cost: measured at up to
// 7% on Wand crafts, more on a small pool (docs/validation.md, 2026-09-21). A fractured JUNK mod is
// treated as ordinary removable junk (only target mods can be fractured-locked here). Omen of
// Whittling — a CHAOS omen that changes the item's lowest-TIER mod (per-mod T-number, not ilvl)
// rather than a random one — needs the mod-tier ORDERING the abstraction discards, so it's out of
// scope. Perfect-essence / desecrate / essence targets stay on the linear planner (the caller falls
// back).

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import { modTierWeight, resolveMod } from '../../engine/src/pool.ts';
import { bossOmenAllowed, isEssenceMod } from '../../engine/src/probability.ts';
import { limitsOf } from '../../engine/src/item.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { ECHOES_OMEN, pricesForBase } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import type { Spare } from './slots.ts';
import { NO_SPARE, slotIndexGroups } from './slots.ts';
import { solveDenseInPlace } from './denseSolve.ts';
import type { ResolvedCandidate } from './markovSymmetry.ts';
import {
  canonicalFilterFor, encoderFor, familiesOfTarget, mergeSlots, permutationClasses, slotMasksOf,
} from './markovSymmetry.ts';
import type { ActionDef, McAction } from './markovActions.ts';
import { actionCostOf, createActionSpace } from './markovActions.ts';
import type { McState, McTarget, StateKey, McRarity } from './markovState.ts';
import {
  FLAG_NONE, bit, classifyStart, decodeState, prefUsed, sufUsed,
  enumerateStates, has, isAccepting, popcount, representative, sideIndexOf,
} from './markovState.ts';
import type { PolicyEdge, PolicyNode, RouteTable } from './markovRoute.ts';
import { flagFieldsOf, routeFrom } from './markovRoute.ts';
import type { Holding } from './markovStarts.ts';
import { startCandidates } from './markovStarts.ts';
import type { ReplayOptions, ReplayReport } from './markovReplay.ts';
import { replayPolicy } from './markovReplay.ts';
import { resolveSiblings } from './markovSiblings.ts';
import { projectPlan } from './markovSeed.ts';

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
   * again — see `RouteTable`. Only when asked for (`keepRoutes`) and only on an EXACT solve: a bound's
   * policy is not the optimal one, and a route drawn from it would be a guess dressed as a plan.
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
   * Carry the solved policy (`MarkovResult.routes`) on an exact result.
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

/** How often the O(states) loops report. Frequent enough to animate, rare enough to cost nothing. */
const PROGRESS_STRIDE = 64;

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

/**
 * Most CANDIDATE mods the lattice is enumerated for.
 *
 * Six used to be both the cap and the reason for it — "6 is the item's own slot cap". Slot
 * alternatives separate those two things: an item still holds six mods, but you may name more than six
 * candidates to fill them. The item's own limit is now enforced where it belongs, as at most
 * MAX_PER_SIDE *slots* per side; this number is only ever about what the state space can afford.
 *
 * The lattice runs ~2,916 states at 6 candidates and ~20,952 at 9 (3p/3s and 5p/4s, before the
 * desecration flag axis multiplies it), against measured solve times of 264s at 3,963 states. Past
 * nine it stops being a wait anybody sits through.
 */
const MAX_CANDIDATES = 9;

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
  const prices = pricesForBase(rawPrices, start.base);

  const level = start.level;
  const pools = start.base.pools;
  // What this item can hold. A socketed rune may have raised one of these, so every cap below reads
  // them rather than a constant.
  const limits = limitsOf(start.base);
  // Positions the player said they don't care about. A free slot the side has no room for is inert
  // rather than an error: `enumerateStates` never emits a state past the cap, so the widened accepting
  // set simply has nothing extra to accept. That is why nothing validates `spare` against `limits`.
  const spare = opts.spare ?? NO_SPARE;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  // Resolve targets into the ordered list the bitmasks index: rollable normal mods, desecrated mods
  // (added by a Desecration with the boss omen that selects them), perfect-essence mods (forced on by a
  // Perfect Essence, which eats one existing mod as it adds), and regular-essence mods (forced on by an
  // Essence, which converts Magic → Rare and removes nothing). The last of those needs a MAGIC item,
  // which the state has been able to represent since it gained a rarity axis.
  const cands: ResolvedCandidate[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    // `ModSource` currently has exactly these four members, so TypeScript proves this branch dead
    // and the rule says so. It stays because the check is on DATA, not on the type: `mods.json` is
    // regenerated from poe2db by `tools/refresh/`, and a fifth source appearing there would arrive as
    // a string the loader happily carries. Better a named refusal than a mod silently resolving into
    // a bitmask position it does not belong in.
    if (mod.source !== 'normal' && mod.source !== 'desecrated'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      && mod.source !== 'perfect_essence' && mod.source !== 'essence') {
      return fail(`${t.modId} is not a rollable, desecrated or essence mod (the MDP handles those)`);
    }
    if (mod.source === 'desecrated') {
      const inPool = pools.desecrated.prefixes.includes(mod.id) || pools.desecrated.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s desecrated pool`);
      // Being in the pool is the whole requirement. A boss tag only decides whether the draw can be
      // NARROWED (and those omens are Weapon-or-Jewellery only) — the untargeted draw reaches every
      // mod in the pool regardless, so neither a missing tag nor an armour base makes the target
      // unreachable. Rejecting on either used to report `feasible: false` for 342 of the 527
      // desecrated mods, all of them craftable.
    }
    // Both essence grades draw from `pools.essence`, and they are disjoint id sets inside it (317
    // `essence` against 363 `perfect_essence`, zero overlap) — so one membership check serves both.
    if (mod.source === 'perfect_essence' || mod.source === 'essence') {
      const inPool = pools.essence.prefixes.includes(mod.id) || pools.essence.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s essence pool`);
    }
    cands.push({ mod, minIndex: t.minTierIndex ?? 0, fractured: fracturedIds.has(mod.id) });
  }
  if (cands.length === 0) return fail('no target mods');
  if (cands.length > MAX_CANDIDATES) {
    return fail(`target names more than ${MAX_CANDIDATES} candidate mods`);
  }

  /*
   * Group the candidates into SLOTS — the number of slots, not the number of candidates, is what the
   * item has to hold. `slotIndexGroups` is shared with the linear planners so the two can never
   * disagree about which candidates are alternatives; see slots.ts for why they then do opposite
   * things with the answer.
   *
   * Then MERGE, within each slot, the alternatives that share a family. Only one of them can ever be
   * on the item and they behave identically once one is, so they become a single POSITION holding a
   * single bit — which is what stops a three-way sibling slot costing three times the lattice of a
   * plain mod. `list` is the merged positions from here on, and `n` counts positions, not candidates;
   * the cap above deliberately still counts candidates, since that is the limit the player set.
   */
  const merged = mergeSlots(cands, slotIndexGroups(targets));
  const slots = merged.slots;
  // Is Desecration in play at all — see `boneRole`.
  const desecratable = bones !== undefined;
  /*
   * Then every OTHER mod the base can roll into a target's family (markovSiblings.ts). A same-side one
   * lands its target as blocked, as an off-tier roll does; anything else becomes an OBSTACLE position,
   * appended after the targets so that every target keeps its index — and every state its key.
   */
  const siblings = resolveSiblings(data, pools, merged.targets, desecratable);
  const list = siblings.list;
  const n = list.length;
  if (n > MAX_CANDIDATES) {
    return fail(`these targets share a family with ${n - merged.targets.length} other mods this base can roll, `
      + `which puts the model past the ${MAX_CANDIDATES} it can afford — drop a target and try again`);
  }
  const slotMasks = slotMasksOf(slots);
  const idsOf = (t: McTarget): string[] => t.mods.map((m) => m.mod.id);
  const desecratedBit = (i: number): boolean => representative(list[i]!).source === 'desecrated';
  const slotSides: ('prefix' | 'suffix')[] = [];
  for (const mask of slotMasks) {
    const members = list.filter((_, i) => has(mask, i));
    const type = members[0]!.type;
    // A slot spanning both sides would make the 3-per-side accounting meaningless — the same slot
    // would consume a prefix on one route and a suffix on another. Merged positions can still differ:
    // side is part of the merge condition, so a prefix and a suffix never merge into one.
    if (members.some((m) => m.type !== type)) {
      return fail(`alternatives for one slot must be all prefixes or all suffixes (${members.flatMap(idsOf).join(', ')})`);
    }
    slotSides.push(type);
  }
  for (const sideName of ['prefix', 'suffix'] as const) {
    const used = slotSides.filter((t) => t === sideName).length;
    const cap = sideName === 'prefix' ? limits.prefixes : limits.suffixes;
    if (used > cap) return fail(`target needs ${used} ${sideName}es, and an item holds ${cap}`);
  }
  /*
   * Two SLOTS may not want the same family, because only one of them could ever be filled — the goal
   * would be unreachable and the solve would say so in a way that names neither mod. Two members of
   * ONE slot sharing a family is the ordinary case and must stay legal: that is exactly the
   * mutually-exclusive group (`#% increased Fire / Cold / Lightning Damage` are one family), where the
   * alternatives are really a union of weights on a single roll.
   *
   * This check is new. The header's "validated out upstream" was true of the app but not of the
   * package, so a direct caller got `no policy reaches the target` and no clue which pair caused it.
   */
  const famSlot = new Map<string, number>();
  const famBits = new Map<string, number>();
  for (let k = 0; k < slotMasks.length; k++) {
    for (let i = 0; i < n; i++) {
      if (!has(slotMasks[k]!, i)) continue;
      for (const fam of familiesOfTarget(list[i]!)) {
        const owner = famSlot.get(fam);
        if (owner !== undefined && owner !== k) {
          return fail(`two different slots both want family "${fam}" — an item holds one mod per family`);
        }
        famSlot.set(fam, k);
        famBits.set(fam, (famBits.get(fam) ?? 0) | bit(i));
      }
    }
  }
  /*
   * Which targets are mutually exclusive, for the lattice to skip.
   *
   * After the check above, any family held by two targets is held by two members of ONE slot — the
   * sibling case, where the alternatives are a union of weights on a single roll rather than two
   * independent chances. Only one of them can ever be on the item, so the states where several are
   * do not exist and enumerating them buys nothing but `actionsOf` calls.
   *
   * Every family with a single target filters out here, which is why this is empty for every craft
   * that predates slots and their state space is untouched.
   */
  // An obstacle is in no slot, so the loop above never met it — but it shares a family with whatever it
  // blocks, and the lattice must never hold both.
  for (let i = 0; i < n; i++) {
    if (!list[i]!.obstacle) continue;
    for (const fam of familiesOfTarget(list[i]!)) famBits.set(fam, (famBits.get(fam) ?? 0) | bit(i));
  }
  const conflicts = [...famBits.values()].filter((m) => popcount(m) > 1);
  /*
   * The one-carved-mod rule is deliberately NOT added to `conflicts`.
   *
   * It looks like the same shape and it is not. `conflicts` excludes states by `present | blocked`,
   * which is right for a family: `blocked` means that family is occupied by SOMETHING, so a sibling
   * cannot also be on the item. But a blocked carved target means its family is held by a different
   * mod — the carved one is not on the item at all — so pruning on `blocked` removes states a
   * Desecration can genuinely reach. It did, and the lattice-closure assertion in the compile step
   * caught it: `desecrate from 0:1:0:0:0:2 leads to 2:1:0:0:4:2, which is not in the lattice`.
   *
   * Nothing is needed in its place. The ACTION space already enforces the rule at its source: a bone
   * requires an item carrying no bone-placed mod (`hasDesecrated`), and a desecrated-pool mod can only
   * arrive by bone — so no reachable state holds two, and `never finishes on an item holding two
   * carved mods` in markovEssenceDesecrate.test.ts is what checks that rather than assuming it.
   */
  /*
   * At most one desecrated mod on the FINISHED ITEM — which is not the same as at most one in the
   * candidate list, once slots exist.
   *
   * "Carved Cast Speed, or failing that a normal one" in two different slots is a perfectly ordinary
   * ask: whichever way it resolves, only one carved mod ends up on the item. Rejecting the list
   * outright refused a craft the game allows. What is genuinely impossible is a target where the rule
   * cannot be satisfied at all — two slots offering NOTHING BUT carved mods, so every way of filling
   * them lands two.
   *
   * Enforcement of the rest is the action space's, not the lattice's: a bone needs an item with no
   * bone-placed mod (`hasDesecrated`), and a desecrated-pool mod only arrives by bone, so no ROUTE
   * reaches a state holding two. The lattice still carries such states — see the note above on why
   * they are not in `conflicts` — which is why anything reading cells directly has to skip them itself
   * (`startCandidates`).
   */
  const forcedCarved = slotMasks.filter((m) => {
    let any = false;
    for (let i = 0; i < n; i++) if (has(m, i)) { if (!desecratedBit(i)) return false; any = true; }
    return any;
  }).length;
  if (forcedCarved > 1) {
    return fail('an item holds at most one desecrated mod, and this target needs two');
  }
  // …and at most ONE CRAFTED modifier — Essence, Perfect Essence and Alloy together (see
  // `isEssenceMod`) — unless a socketed Astrid's Creativity raised `limits.crafted`. Without a cap here
  // `actionsOf` builds a perfect-essence action per crafted target and the policy stacks them happily,
  // producing a route to an item the game cannot hold.
  const craftedTargets = list.filter((t) => isEssenceMod(representative(t))).length;
  if (craftedTargets > limits.crafted) {
    return fail(limits.crafted === 1
      ? 'an item can hold at most one crafted modifier (Essence, Perfect Essence or Alloy) — pick one, '
        + 'or socket Astrid’s Creativity for a second'
      : `an item can hold at most ${limits.crafted} crafted modifiers (Essence, Perfect Essence or Alloy)`);
  }
  // Every member of a merged position answers to that position, so a placed mod finds its bit by id
  // whichever alternative it happens to be.
  const idxOf = new Map<string, number>();
  list.forEach((t, i) => { for (const m of t.mods) idxOf.set(m.mod.id, i); });

  /*
   * …and the item you already HOLD counts toward that same cap.
   *
   * The check above counts TARGETS. A held essence modifier that is not itself a target lands in
   * `jp`/`js`, and junk is a bare count with no marker — so the model cannot tell it from any other
   * junk and will offer a Perfect Essence on an item that already carries one. Measured on a real
   * craft (a held `PerfectEssence_EssenceAbyss`, a `PerfectEssence_FireDamage` target): four states
   * played a Perfect Essence with junk still on the item. The finished item is safe either way — the
   * refusal below counts held crafted mods against the same cap, so no route can END past it, whether
   * or not a free slot lets the stray ride along — but the ROUTE can be one the game refuses, and it is
   * the cheap one, because the essence's own swap does some of the annulling for free. So the quoted
   * cost comes in low.
   *
   * Only refused when an essence target is asked. With none, no perfect-essence action is ever built
   * (`perfectTargets` is empty), the held mod is ordinary junk, and the model is already right — a
   * blanket refusal would decline a craft it handles correctly.
   *
   * REFUSING rather than modelling, deliberately. Fixing it properly needs a state axis of its own
   * (the desecration flag cannot be reused: it means "a bone placed this"), and this is unreachable
   * from the UI — the item builder offers only rollable and desecrated mods, so a crafted share link
   * is the only way in. The linear planner has no such gap: it plans a fixed sequence over concrete
   * mods, so it annuls the held essence before applying the new one, and `ItemActions` renders this
   * reason beside those routes exactly as it already does for a Magic start.
   */
  if (craftedTargets > 0) {
    const strays = [...start.prefixes, ...start.suffixes]
      .map((p) => data.mods.get(p.modId))
      .filter((m) => m !== undefined && isEssenceMod(m) && !idxOf.has(m.id));
    // Held crafted modifiers count toward the same cap as the targets. Under the cap there is nothing
    // to refuse: every route the model can build still ends within `limits.crafted`.
    const stray = craftedTargets + strays.length > limits.crafted ? strays[0] : undefined;
    if (stray) {
      return fail(`${stray.id} is already on the item, and an item holds ${limits.crafted} crafted `
        + 'modifier(s) — Essence, Perfect Essence or Alloy — so remove it, or make it the target');
    }
  }

  // A rollable target that can never roll (weight 0 even at base strength, the most permissive) is
  // impossible. Desecrated targets don't roll from the normal pool, so the pool check above covers them.
  const ungettable = cands.find((c) => c.mod.source === 'normal' && modTierWeight(c.mod, 0, level, c.minIndex) === 0);
  if (ungettable) return fail(`${ungettable.mod.id} can't roll at item level ${level}`);

  const side = sideIndexOf(list);
  /** What finishing in `s` still costs: nothing, or with `fillOnFinish` one Exalt per empty slot. */
  const exaltPrice = prices.currency['exalt'];
  if (opts.fillOnFinish && !(exaltPrice !== undefined && Number.isFinite(exaltPrice) && exaltPrice >= 0)) {
    return fail('filling the finished item needs an Exalted Orb price, and the sheet has none');
  }
  const fillCostOf = (s: McState): number => (opts.fillOnFinish
    ? ((limits.prefixes - prefUsed(s, side)) + (limits.suffixes - sufUsed(s, side))) * exaltPrice!
    : 0);

  /*
   * …and the OTHER half of the same idea: positions that cannot merge, because their families differ,
   * but that nothing downstream can tell apart anyway.
   *
   * `Gain % as Extra Cold` and `… Lightning` each occupy their own family, so they can sit on the item
   * together and the pool loses a different mod depending on which lands — they must keep separate
   * bits. But if the data says those two mods are the same size in every pool at every floor (and on
   * 0.5.0 Wands it does: sole members of their families, identical tier tables), then "Cold present,
   * Lightning blocked" and "Cold blocked, Lightning present" are one situation spelt two ways. The
   * encoder below picks one spelling and the lattice carries only that, which is worth ~2.7x on a
   * three-way group.
   *
   * `encode` is `encodeState` itself when nothing qualifies, so every craft that predates this pays
   * nothing — not even a branch.
   */
  const classes = permutationClasses({ data, pools, level, sameSide: siblings.sameSide }, list, slots);
  const encode = encoderFor(classes);
  const onlyCanonical = canonicalFilterFor(classes);

  const s0 = classifyStart(data, start, list, idxOf, siblings.blocks);

  /**
   * A regular Essence needs a MAGIC item, so a held Rare can never apply one.
   *
   * `enumerateStates` gives a Rare start the single `['rare']` rung, so no Magic state exists and the
   * essence action is never built — the craft is genuinely unreachable rather than merely dear. Without
   * this the solve dies as the generic "no policy reaches the target", which tells the reader nothing
   * they can act on. Named here instead, with the rule that causes it.
   *
   * Only when the target is NOT already satisfied: an essence mod sitting on the Rare at or above its
   * wanted tier is simply `present` in `s0`, and that craft needs no Essence at all.
   */
  if (start.rarity === 'rare') {
    const stuck = list.findIndex((t, i) => representative(t).source === 'essence' && !has(s0.present, i));
    if (stuck >= 0) {
      const mod = representative(list[stuck]!);
      return fail(`${mod.id} can only be added by a regular Essence, which needs a Magic item — `
        + 'this one is already Rare, so no route reaches it (a Perfect Essence works on a Rare, '
        + 'a regular one does not)');
    }
  }
  // Where "start over" lands: the item you began with, which for a from-white craft is the bare base.
  // Built here rather than later because the action space closes over it.
  const restartKey = encode(s0.present, s0.blocked, s0.jp, s0.js, s0.flagged, s0.rarity);

  /**
   * The item already IS the target. Answer here, before a lattice exists.
   *
   * Not a micro-optimisation — it is reachable in two clicks and it was costing real time. The Item
   * tab's **Copy my current mods** sets every target to `tiers.length`, the WORST tier, so whatever
   * you hold satisfies it by construction; Compute then solved the whole state space to reach zero.
   * Measured on a finished 6-mod Wand: **16.3 s on Standard and 71.1 s on Exhaustive**, and Standard
   * ran out of clock on the way, so it came back `bound: 'lower'` on a cost of zero and the panel
   * rendered "≥ 0 ex" under the heading `True expected cost`. The step planner beside it has always
   * short-circuited this (`fromItem.ts`, the `steps: []` frontier) — only the MDP did the work.
   *
   * `isAccepting` is the same predicate `goalKeys` is built from below — same `spare` and all — so this
   * cannot disagree with the solver about what "finished" means: zero blocked, Rare, and no more junk
   * than the free slots allow.
   *
   * The node is built exactly as the graph BFS builds one, from `s0` rather than from constants. That
   * mattered before as a way to keep one construction instead of two that could drift apart, and it
   * matters more now: with a free slot the finished item may genuinely carry junk, so `junkPrefixes`
   * and `junkSuffixes` are read off `s0` rather than assumed empty. Start and goal are the same square, so there
   * is nothing to walk: no edges, and an empty policy (which is also what a test can assert on to
   * prove the lattice was never built, without timing anything).
   */
  if (isAccepting(s0, slotMasks, spare, siblings.obstacles)) {
    return {
      expectedCost: fillCostOf(s0),
      feasible: true,
      converged: true,
      bound: 'exact',
      nodes: [{
        key: restartKey,
        present: list.filter((t, i) => !t.obstacle && has(s0.present, i)).map(idsOf),
        blocked: list.filter((_, i) => has(s0.blocked, i)).map(idsOf),
        ...(list.some((t, i) => t.obstacle && has(s0.present, i))
          ? { obstacles: list.filter((t, i) => t.obstacle && has(s0.present, i)).map(idsOf) } : {}),
        junkPrefixes: s0.jp,
        junkSuffixes: s0.js,
        rarity: s0.rarity,
        ...flagFieldsOf(s0, list.map(idsOf), siblings.obstacles),
        isStart: true,
        isGoal: true,
        depth: 0,
        expectedCost: fillCostOf(s0),
        visitRate: 1,
      }],
      edges: [],
      policy: new Map(),
    };
  }
  const { actionsOf } = createActionSpace({
    data, prices, level, pools, list, side, desecratable, encode, limits, siblings,
    junkFamilies: opts.junkFamilies !== false,
    bossTargetable: bossOmenAllowed(start.base.category),
    ...(opts.policy ? { policy: opts.policy } : {}),
    ...(opts.restartCost === undefined
      ? {}
      : { restart: { cost: opts.restartCost, dist: new Map([[restartKey, 1]]) } }),
  });

  // Only enumerate the rarities the craft can actually occupy. A from-item craft is Rare throughout,
  // so it keeps exactly the state space (and solve time) it had before rarity existed; a craft that
  // starts lower has to carry the rungs it climbs through.
  const rarities: McRarity[] = start.rarity === 'rare' ? ['rare']
    : start.rarity === 'magic' ? ['magic', 'rare']
    : ['normal', 'magic', 'rare'];
  const allStates = enumerateStates(n, side, desecratable, rarities, conflicts, onlyCanonical, limits);

  /*
   * The goal states — found by TESTING the lattice, not by naming keys.
   *
   * This used to construct `present === (1<<n)-1` directly and add one key per value of the flag axis
   * (a finished item is finished whether or not a Desecration placed one of its mods; keying only
   * FLAG_NONE once left bone-ending crafts with no terminal to work back from, and VI ground through
   * its whole budget on a problem with no fixed point).
   *
   * Naming keys cannot express slot alternatives. With `slot 3 = {Cold, Lightning, Chaos}` the state
   * holding all three has four prefixes, so `enumerateStates` never emits it — the old goal named a
   * state that does not exist while missing every state that actually finishes the craft, and the
   * solve reported the target unreachable. Filtering the lattice instead has both properties for free:
   * it can only ever name states that exist, and it accepts any one member per slot.
   *
   * `isAccepting` still demands zero blocked and Rare, and no more junk than `spare` allows, so this is
   * the same standard of "finished" as before — with every slot a singleton and no free slots it
   * reproduces the old set exactly, which the test suite asserts against a from-white craft.
   */
  const goalKeys = new Set<StateKey>();
  for (const k of allStates) if (isAccepting(decodeState(k), slotMasks, spare, siblings.obstacles)) goalKeys.add(k);
  if (goalKeys.size === 0) return fail('no legal item satisfies every slot of this target');
  // The canonical goal for DISPLAY: the *barest* finished item — the one that fills each slot once and
  // carries nothing more. `allStates` is enumerated present-ascending with FLAG_NONE first, which used
  // to make the first FLAG_NONE hit that item by itself. Free slots break that: they admit goal states
  // holding junk, and those sort no later than the clean one, so the empty junk fields are now asked for
  // rather than relied upon. A junk-carrying goal is a perfectly good place to STOP — it just isn't the
  // one to draw as "the item you're aiming at".
  const bareGoal = (k: StateKey): boolean => {
    const s = decodeState(k);
    return s.flagged === FLAG_NONE && s.jp === 0 && s.js === 0;
  };
  const keys = [...goalKeys];
  const goalKey = keys.find(bareGoal) ?? keys.find((k) => decodeState(k).flagged === FLAG_NONE) ?? keys[0]!;
  // The dominant cost of the whole solve: one full action set, with its outcome distribution, per
  // state. `allStates.length` is known before the loop, so progress here is genuinely linear.
  const report = opts.onProgress;
  const actionCache = new Map<StateKey, ActionDef[]>();
  for (let i = 0; i < allStates.length; i++) {
    const key = allStates[i]!;
    actionCache.set(key, goalKeys.has(key) ? [] : actionsOf(decodeState(key)));
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
    /** Destination indices, self-loop EXCLUDED — its probability lives in `selfProb`.
     *  For an OFFER action nothing is hoisted: see `offer`. */
    readonly to: Int32Array;
    readonly prob: Float64Array;
    /** "Bin it and buy another base" — the one action phase A of the solve leaves out. */
    readonly isRestart: boolean;
    /** Draws shown to the player, of which they keep the best; 1 for an ordinary action. See `valueOf`. */
    readonly offer: number;
    /** What throwing the whole offer back once costs — an Omen of Abyssal Echoes, spent only on the
     *  throw. Infinity for an offer with no reroll, and for every ordinary action. */
    readonly rerollCost: number;
    /** An offer's outcomes, KEPT sorted by V between calls, so re-sorting is near-linear. Empty otherwise. */
    readonly order: Int32Array;
  }
  const compiled: CompiledAction[][] = new Array<CompiledAction[]>(N);
  const NO_ORDER = new Int32Array(0);
  let cheapestAction = Infinity;
  let widestOffer = 0; // biggest outcome count among offer actions, to size the sort scratch once
  for (let i = 0; i < N; i++) {
    const key = allStates[i]!;
    const defs = actionCache.get(key)!;
    const out: CompiledAction[] = [];
    for (const def of defs) {
      const offer = def.offer ?? 1;
      const isRestartAction = def.action.currency === 'restart';
      const to: number[] = [];
      const prob: number[] = [];
      let selfProb = 0;
      for (const [toKey, p] of def.dist) {
        // The self-loop is hoisted out and divided away — but only for a single-draw action, where
        // "the state did not change" is a fixed probability. Under an offer it is whichever share of
        // the offers the player would keep, which moves with V, so there is nothing constant to hoist.
        if (toKey === key && offer === 1) { selfProb += p; continue; }
        const toIdx = idxOfState.get(toKey);
        // The lattice must be CLOSED under the action space. It always was, but the assertion was a
        // `!` — and `Int32Array.from([undefined])` is 0, so an action escaping the lattice would have
        // silently rewired itself to state 0 and quietly changed the answer. That became worth
        // guarding once `enumerateStates` started PRUNING states (mutually-exclusive families): the
        // pruning is only sound because no action can reach what it removes, and this is what makes
        // that claim fail loudly instead of invisibly.
        //
        // It now guards a second, sharper claim. CANONICALISATION keeps one spelling of each
        // interchangeable arrangement and drops the rest, so `canonicalFilterFor` (which decides what
        // the lattice holds) and `encoderFor` (which decides where an outcome points) must agree
        // exactly. They are built from the same function for that reason — and if they ever stop
        // agreeing, the very next outcome lands here rather than on a state that merely looks fine.
        if (toIdx === undefined) {
          return fail(`internal: ${def.action.currency} from ${key} leads to ${toKey}, which is not in the lattice`);
        }
        to.push(toIdx);
        prob.push(p);
      }
      if (to.length > widestOffer && offer > 1) widestOffer = to.length;
      out.push({
        def, cost: def.cost, selfProb, offer, rerollCost: def.reroll?.cost ?? Infinity, isRestart: def.action.currency === 'restart',
        to: Int32Array.from(to), prob: Float64Array.from(prob),
        order: offer > 1 ? Int32Array.from(to, (_, j) => j) : NO_ORDER,
      });
      // The cheapest thing the craft can do, restart excluded — it sets both the default tolerance and
      // the factor that repairs the seed. Restart is left out because it is not in phase A, and because
      // a white base is free: a zero would make both meaningless.
      if (!isRestartAction && def.cost > 0 && def.cost < cheapestAction) cheapestAction = def.cost;
    }
    compiled[i] = out;
    if (report && i % PROGRESS_STRIDE === 0) report({ phase: 'compile', done: i, total: N });
  }
  report?.({ phase: 'compile', done: N, total: N });

  // ── Can the goal actually be reached? ───────────────────────────────────────
  // Computed BEFORE value iteration, because VI cannot discover it and is actively harmed by it. A
  // state with no route to the goal has no finite value, but nothing stops VI backing one up: each
  // sweep adds another action's cost, so its V climbs without bound. That never settles, `delta` never
  // falls under `tolerance`, and the solve reports `converged: false` however long it runs — measured
  // on a 2-target armour craft as E growing 11.4M → 113.6M ex when the sweep cap rose 10x. The start's
  // own value had stabilised the whole time; the flag was being poisoned by states the answer does not
  // depend on. Dead states are pinned at Infinity instead, which is both true and useful: an action
  // with any chance of landing in one is then correctly worth Infinity.
  //
  // "Reaches" means ALMOST SURELY, not "with some chance". The weaker reading is only adequate while
  // every action can be retried — a one-in-a-million shot you may take again forever still has a
  // finite expected cost. This is the standard Prob1 fixpoint: shrink the candidate set S until every
  // state in it can reach the goal without any action escaping S.
  //
  // Computed TWICE, because the two solve phases have different action sets and so different dead
  // ends. Phase A runs push-forward only; a state only a restart can rescue is Infinity to phase A,
  // and it must know that or it grinds its budget converging on a value with no finite limit.
  const isGoalIdx = new Uint8Array(N); // a flag rather than a Set: this is read in the innermost loop
  /** A goal's value is what finishing there costs — 0 unless `fillOnFinish`. Every solve below seeds it. */
  const finishCost = new Float64Array(N);
  for (const k of goalKeys) {
    const gi = idxOfState.get(k);
    if (gi !== undefined) { isGoalIdx[gi] = 1; finishCost[gi] = fillCostOf(decodeState(k)); }
  }
  const prob1 = (withRestart: boolean): Uint8Array => {
    const inS = new Uint8Array(N).fill(1);
    const reachable = new Uint8Array(N);
    for (let round = 0; round < N; round++) {
      reachable.fill(0);
      for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1 && inS[i] === 1) reachable[i] = 1;
      for (let changed = true; changed;) {
        changed = false;
        for (let i = 0; i < N; i++) {
          if (reachable[i] === 1 || inS[i] !== 1) continue;
          for (const act of compiled[i]!) {
            if (act.isRestart && !withRestart) continue;
            let escapes = false;
            let touches = false;
            for (let j = 0; j < act.to.length; j++) {
              const to = act.to[j]!;
              if (inS[to] !== 1) { escapes = true; break; }
              if (reachable[to] === 1) touches = true;
            }
            // Every outcome stays inside S, and at least one of them already reaches the goal.
            if (!escapes && touches) { reachable[i] = 1; changed = true; break; }
          }
        }
      }
      let shrank = false;
      for (let i = 0; i < N; i++) {
        if (inS[i] === 1 && reachable[i] !== 1) { inS[i] = 0; shrank = true; }
      }
      if (!shrank) break;
    }
    return inS;
  };
  const canRestart = opts.restartCost !== undefined;
  const canReachPushForward = prob1(false);
  const canReach = canRestart ? prob1(true) : canReachPushForward;

  // ── Value iteration ─────────────────────────────────────────────────────────
  // Standard stochastic-shortest-path VI: 0-initialise (a finite lower bound) and let values climb to
  // the fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery
  // cycles here — e.g. {both targets + junk} ↔ {one target + junk} each need the other finite first —
  // so neither bootstraps. Every target is gettable by now, so the goal is reachable from every state
  // and VI converges to a finite V.) Each action solves its own self-loop via ÷(1 − pStay).
  //
  // …except when starting over is allowed, which breaks 0-init VI outright. `restart` costs about
  // nothing and lands on the start, so every state is worth `restartCost + V(start)` — and while V is
  // still near 0 that TIES with every other action, so early sweeps pick restart everywhere. VI
  // unpicks the tie only as the true values separate, which on a long-shot target outlasts any
  // budget. A truncated solve therefore returns a policy that bins the item in every state, including
  // states already holding a target mod: not a slow answer but a wrong one, and exactly what a 6-mod
  // from-white craft rendered — every box in the graph reading "Start over with a new base".
  //
  // So solve it in two phases. Phase A runs push-forward only (restart excluded), which 0-init VI
  // handles fine, and converges to V0. Phase B puts restart back and starts from V0 instead of 0.
  //
  // V0 is the value of a PROPER policy — one that always reaches the goal — so V0 ≥ V*, and
  //     T(V0) = min(T_pushForward(V0), restartCost + V0[start]) ≤ T_pushForward(V0) = V0,
  // i.e. V0 is excessive. Phase B's sweeps therefore DESCEND toward V* instead of climbing, and two
  // things follow. Every iterate stays above V*, so a truncated phase B reports "at most x" (see
  // `bound`) rather than the "at least x" a 0-init solve gives. And — the reason this is the fix and
  // not an optimisation — the greedy policy is sensible from the very first sweep: restart wins at a
  // state only where `restartCost + V[start]` genuinely beats digging out, so a state holding a target
  // keeps it, and the extracted route reaches the goal even when the solve stops early.
  /**
   * How close is close enough — a thousandth of the cheapest thing the craft can do.
   *
   * A craft with a free action (a missing price mints one — see CLAUDE.md) has no positive `cheapest`
   * to scale from, so it keeps the old flat default. Slow, but never wrong.
   *
   * There WAS a second half here: phase B is an upper bound because phase A reached a fixed point, and
   * stopping phase A at residual `tol` weakens that, so the seed was scaled by
   * `cheapest / (cheapest − tol)` to put it back on the excessive side. The derivation is sound
   * (`T(cV) <= c·T(V)` for `c >= 1` with positive costs) and the code was one line — and it did
   * nothing measurable. Removing it moved the answer in the FIFTH decimal at every tolerance from 1e-4
   * to 1.5e-1, in both directions, and never turned a violated bound into a satisfied one.
   *
   * The reason is that phase B's own truncation dwarfs the seed's shortfall: a descending sequence
   * stopping at Δ < tol still sits tol/(1−r) above its limit with r near 1, which is orders larger than
   * the seed could be low by. What actually holds the bound up is that margin, and it is measured, not
   * assumed — see "never quotes an upper bound below the converged cost". Keeping an unfalsifiable line
   * whose comment claimed to guarantee something it did not is worse than saying plainly what does.
   */
  const scaleAware = Number.isFinite(cheapestAction) && cheapestAction > 0;
  const tol = opts.tolerance ?? (scaleAware ? cheapestAction / 1000 : 1e-9);
  const maxIters = opts.maxIters ?? 100_000;
  /** Policy-improvement rounds. PI converges in a handful; this is a runaway guard, not a budget. */
  const maxRounds = opts.maxRounds ?? 200;
  const V = new Float64Array(N); // 0-initialised, as above
  // …except a goal, which is worth what finishing there costs. The sweeps never write a goal, so this
  // is where its value comes from, here and after every reset below.
  const seedGoals = (): void => { for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1) V[i] = finishCost[i]!; };
  seedGoals();
  // Phase A's dead ends, a superset of phase B's. A state only a restart can rescue starts at Infinity,
  // which is still a valid seed for phase B — the seed only has to be an UPPER bound.
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;
  // Reused by every offer evaluation; sized once so the hot loop allocates nothing.
  const keptScratch = new Float64Array(widestOffer);
  /** P(the offer was thrown back) in the latest `keepWeights` call — read straight after it, never later. */
  let lastThrow = 0;
  /** …and the line it threw back below: an offer whose best is dearer to finish from than this. */
  let lastBar = Infinity;
  /** `x ** m`, but an offer is three, and Math.pow is a real cost in the hottest loop of the solve. */
  const powOffer = (x: number, m: number): number => (m === 3 ? x * x * x : x ** m);
  /**
   * What the player keeps when an action shows several draws and they must take one.
   *
   * A Desecration offers three modifiers and you choose — so its value is not `Σ p·V` over one draw
   * but `E[min over the offer]`, which depends on V and cannot be folded into the distribution ahead
   * of time. Sort the outcomes by V ascending and let `T_k` be the tail sum from k. The player keeps
   * outcome k exactly when every draw landed in `{k…K}` but not all in `{k+1…K}`, so
   *
   *     P(keep k) = T_k^m − T_(k+1)^m       (m = offers shown)
   *
   * With m = 1 this collapses to `T_k − T_(k+1) = p_k`, i.e. the ordinary expectation — the identity
   * is one formula, not a special case bolted on. O(K log K) with K ≈ 10 outcomes, and only a
   * Desecration pays it.
   *
   * With a REROLL — an Omen of Abyssal Echoes, spent only when used (confirmed 2026-09-10) — the player
   * sees the first offer and may pay the omen to throw all of it back for a fresh one, which they must
   * then keep; the fresh three may repeat mods from the first. They throw it back exactly when its best
   * is worse than the omen plus a fresh offer: c + τ, with τ = Σ P(keep k)·V_k the plain value above.
   * So outcome k is kept from the first offer when V_k ≤ c + τ, and from the second whenever the first
   * went back:
   *
   *     P'(keep k) = [V_k ≤ c + τ]·P(keep k) + P(throw)·P(keep k),   P(throw) = Σ over V_j > c + τ of P(keep j)
   *
   * The weights still sum to one; the value adds the omen's expected spend, P(throw)·c, and leaves
   * P(throw) in `lastThrow` for the callers that need the spend on its own.
   *
   * Fills `w` with the probability of ending on each outcome, indexed like `a.to`, and returns Σ w·V —
   * the action's value less its cost. `offerValue`, the closed-form evaluation and the published edges
   * all read it, so the three cannot disagree about what an offer is worth.
   *
   * The sort starts from the order the last call left: V moves little from one sweep to the next, so
   * insertion sort is close to linear. The value does not depend on how outcomes tied on V are ordered;
   * their individual weights do, so a caller that PUBLISHES or FREEZES the weights passes `fromStart`,
   * and ties split by index every time rather than by the history of the solve.
   */
  const keepWeights = (a: CompiledAction, w: Float64Array, fromStart = false): number => {
    const K = a.to.length;
    const order = a.order;
    if (fromStart) for (let j = 0; j < K; j++) order[j] = j;
    for (let j = 1; j < K; j++) { // insertion sort by V ascending; K is tiny
      const cur = order[j]!;
      const cv = V[a.to[cur]!]!;
      let q = j - 1;
      while (q >= 0 && V[a.to[order[q]!]!]! > cv) { order[q + 1] = order[q]!; q--; }
      order[q + 1] = cur;
    }
    let tail = 0;
    for (let j = 0; j < K; j++) tail += a.prob[j]!;
    let tailPow = powOffer(tail, a.offer);
    let fresh = 0; // τ: what one fresh offer is worth
    for (let j = 0; j < K; j++) {
      const idx = order[j]!;
      tail -= a.prob[idx]!;
      const nextPow = tail <= 0 ? 0 : powOffer(tail, a.offer);
      w[idx] = tailPow - nextPow;
      fresh += V[a.to[idx]!]! * w[idx];
      tailPow = nextPow;
    }
    lastThrow = 0;
    lastBar = Infinity;
    if (a.rerollCost === Infinity) return fresh;
    const bar = fresh + a.rerollCost; // anything no worse than paying for a fresh offer is kept
    lastBar = bar;
    let thrown = 0;
    for (let j = 0; j < K; j++) if (V[a.to[j]!]! > bar) thrown += w[j]!;
    if (thrown === 0) return fresh;
    let kept = 0;
    for (let j = 0; j < K; j++) {
      const v = V[a.to[j]!]!;
      w[j] = (v > bar ? 0 : w[j]!) + thrown * w[j]!;
      kept += w[j]! * v;
    }
    lastThrow = thrown;
    return kept + thrown * a.rerollCost;
  };
  const offerValue = (a: CompiledAction): number => a.cost + keepWeights(a, keptScratch);
  const valueOf = (a: CompiledAction): number => {
    if (a.offer > 1) return offerValue(a);
    if (a.selfProb >= 1 - 1e-12) return Infinity; // an action that only loops back can't make progress
    let s = 0;
    for (let j = 0; j < a.to.length; j++) s += a.prob[j]! * V[a.to[j]!]!;
    return (a.cost + s) / (1 - a.selfProb);
  };
  // Checked every CHECK sweeps rather than every sweep: Date.now() in the hot loop is measurable, and
  // a sweep is short enough that the overshoot is irrelevant next to a multi-second budget.
  const deadline = opts.maxMillis === undefined ? Infinity : Date.now() + opts.maxMillis;
  const DEADLINE_CHECK = 32;
  /** The largest chain `exactEvaluation` solves outright: ~0.3 s an evaluation at the limit. */
  const DIRECT_MAX_STATES = 1_000;

  /**
   * Emit only when the number the UI would DISPLAY changes — and across the WHOLE solve, not per
   * phase, so the handover at 500‰ and the closing 1000‰ don't each repeat a value already sent.
   *
   * The loop below runs up to `maxIters` (100k) sweeps, and every report crosses the worker boundary
   * as a postMessage that wakes a React re-render. Reporting per sweep sent ~100,001 messages to
   * describe at most 1001 distinct values, so ~99% of them repainted the bar with the number it
   * already had. That flood is what turned a 24-second solve into a ten-minute wait in the browser;
   * the maths was never slow. The other two phases above were already strided — this one was missed,
   * which is why only long solves showed it.
   */
  let lastPermille = -1;
  const emitSolve = (permille: number): void => {
    if (!report || permille === lastPermille) return;
    lastPermille = permille;
    report({ phase: 'solve', done: permille, total: 1000 });
  };

  /**
   * Sweep `V` in place to its fixed point; true if it reached `tol` rather than running out of
   * sweeps or clock. `withRestart` false is phase A. `pLo`–`pHi` is this phase's slice of the
   * 0–1000 progress bar, so two phases fill one bar instead of resetting it halfway.
   */
  const iterate = (withRestart: boolean, pLo: number, pHi: number): boolean => {
    let decades = 0; // log-distance the first sweep had left to travel; see the progress note below
    for (let iter = 0; iter < maxIters; iter++) {
      if (deadline !== Infinity && iter % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
      let delta = 0;
      for (let i = 0; i < N; i++) {
        if (isGoalIdx[i] === 1) continue;
        // Skip what this phase can never finish from: pinned at Infinity, which is its true value here.
        if ((withRestart ? canReach[i] : canReachPushForward[i]) !== 1) continue;
        const acts = compiled[i]!;
        let best = Infinity;
        for (let k = 0; k < acts.length; k++) {
          const a = acts[k]!;
          if (a.isRestart && !withRestart) continue;
          const v = valueOf(a);
          if (v < best) best = v;
        }
        if (!Number.isFinite(best)) continue;
        const prev = V[i]!;
        V[i] = best;
        const d = Math.abs(best - prev);
        if (d > delta) delta = d;
      }
      if (delta <= tol) return true;
      // VI converges geometrically, so "sweeps remaining" is not knowable and counting them against
      // `maxIters` (100k — usually reached in tens, but a long-odds action can exhaust the lot) would peg
      // the bar at zero. What IS monotone is how
      // far the residual has travelled toward `tol` on a log scale — so a unit here is one decade
      // closed, and the total is the distance the first sweep found still to cover.
      if (report) {
        const remaining = Math.log10(Math.max(delta, tol) / tol);
        if (iter === 0) decades = remaining;
        // TWO monotone measures, and we report whichever is further along, in permille.
        //
        // The residual measure is the better signal when VI behaves — it tracks actual progress toward
        // an answer. But its resolution collapses when convergence is slow: a stalled solve once
        // reported 0/11 then 1/11 across 100,000 sweeps, so the bar sat at 92% for five seconds and
        // read as a hang. Sweeps burned is crude (VI usually finishes in tens of a 100k budget, so it
        // reads ~0 on a healthy solve) but it always advances. Taking the max means the bar moves on
        // the residual when there IS residual progress, and falls back to "how much budget is gone"
        // when there isn't — which is exactly the case where the user needs to see something move.
        const byResidual = decades > 0 ? (decades - remaining) / decades : 0;
        const byBudget = (iter + 1) / maxIters;
        emitSolve(Math.round(pLo + Math.max(byResidual, byBudget) * (pHi - pLo)));
      }
    }
    return false;
  };

  /**
   * The closed form's chain solved outright: for every state `s` not terminal under `pol`,
   *
   *     (1 − self(s))·c(s) − Σ p(s→t)·c(t) = cost(s) + Σ p(s→u)·c(u)      t non-terminal, u terminal
   *
   * and the same with `q`, whose right side has no cost — one matrix, both solved at once
   * (`solveDenseInPlace`), which is why it is kept to `DIRECT_MAX_STATES`. Writes `cOf`/`qOf` for those
   * states; false when the system is singular (a loop with no way out) or the answer is not finite.
   */
  const solveChainDirect = (
    pol: Int32Array, isTerm: Uint8Array, wTo: Int32Array[], wPr: Float64Array[],
    selfW: Float64Array, spendOf: Float64Array, cOf: Float64Array, qOf: Float64Array,
  ): boolean => {
    const row = new Int32Array(N).fill(-1);
    const states: number[] = [];
    for (let i = 0; i < N; i++) {
      if (isTerm[i] === 1) continue;
      // Only loops back: no progress, as the sweeps read it too.
      if (1 - selfW[i]! <= 1e-12) { cOf[i] = Infinity; qOf[i] = 1; continue; }
      row[i] = states.length;
      states.push(i);
    }
    const M = states.length;
    const A = new Float64Array(M * M);
    const bc = new Float64Array(M);
    const bq = new Float64Array(M);
    for (let r = 0; r < M; r++) {
      const i = states[r]!;
      const to = wTo[i]!; const pr = wPr[i]!;
      A[r * M + r] = 1 - selfW[i]!;
      bc[r] = compiled[i]![pol[i]!]!.cost + spendOf[i]!;
      for (let j = 0; j < to.length; j++) {
        const t = to[j]!;
        if (t === i) continue; // an offer's self-weight, already in `selfW`
        const at = row[t]!;
        if (at >= 0) A[r * M + at] = A[r * M + at]! - pr[j]!;
        else { bc[r] = bc[r]! + pr[j]! * cOf[t]!; bq[r] = bq[r]! + pr[j]! * qOf[t]!; }
      }
    }
    if (!solveDenseInPlace(A, M, [bc, bq])) return false;
    for (let r = 0; r < M; r++) { cOf[states[r]!] = bc[r]!; qOf[states[r]!] = bq[r]!; }
    return true;
  };

  /**
   * Cost a FIXED policy exactly, in closed form, instead of iterating a chain that barely contracts.
   *
   * Iterative evaluation is where policy iteration spends essentially all its time, and it is slow for
   * a structural reason: with a free base ~98% of states choose restart, so `V(s) = restartCost +
   * V(start)` almost everywhere and the chain's contraction rate sits at r ≈ 1. A residual under `tol`
   * still leaves an error of `tol/(1−r)`, and `1/(1−r)` is the expected number of attempts — thousands.
   * Measured: varying only the evaluation tolerance moved one craft 74.4s → 0.8s and its answer
   * 4,753 → 35,417, a 93x speed span with accuracy tracking it exactly. So there is no cheap win to be
   * had by loosening a number.
   *
   * The way out is to stop iterating the loop at all. Under a fixed policy an attempt either reaches
   * the goal or hits a state where the policy restarts — and restarting begins an identical attempt.
   * That is a renewal process, so on the restart-ABSORBING chain (restart is a terminal payment, not
   * an edge back to the start) define
   *
   *     c(s) = expected cost from s until goal-or-restart      c(goal)=0, c(restart)=restartCost
   *     q(s) = P(restart before goal, from s)                  q(goal)=0, q(restart)=1
   *
   * and then, exactly:
   *
   *     V(start) = c(start) / (1 − q(start))        ← renewal-reward, one division
   *     V(s)     = c(s) + q(s)·V(start)             ← one pass
   *
   * The near-1 contraction is gone because the cycle causing it is gone. Better still, restart states
   * are TERMINAL here — and they are 98% of the lattice — so the chain c and q actually propagate
   * through is the thin spine of states the craft passes through, not the whole space.
   *
   * OFFER ACTIONS are the wrinkle. `offerValue` sorts a Desecration's three draws by current V, so its
   * realized distribution moves as V moves, which would make c and q non-linear. The ordering is
   * therefore FROZEN for the duration of one evaluation — treated as part of the policy, exactly as
   * the improvement step already treats the choice of action. Improvement re-orders next round.
   * An Echoes reroll's keep-or-throw-back decision is frozen with it: it reads the same V.
   *
   * Returns false when the policy never reaches the goal (`q(start) = 1`), which is a real state of
   * affairs — an improper policy has infinite value — and the caller must not read V after it.
   */
  const evaluateClosedForm = (pol: Int32Array, evalCap?: number): boolean => {
    // Frozen realized weights per state, against V as it stands right now.
    const wTo: Int32Array[] = new Array<Int32Array>(N);
    const wPr: Float64Array[] = new Array<Float64Array>(N);
    const selfW = new Float64Array(N);
    const spendOf = new Float64Array(N); // an Echoes omen's expected spend, frozen with the weights
    const isTerm = new Uint8Array(N);   // goal or "policy restarts here" — the chain stops
    const cOf = new Float64Array(N);
    const qOf = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      // A goal ends the chain having cost what finishing there costs; a dead end ends it at nothing.
      if (isGoalIdx[i] === 1) { isTerm[i] = 1; cOf[i] = finishCost[i]!; continue; }
      if (canReach[i] !== 1) { isTerm[i] = 1; continue; }
      const k = pol[i]!;
      // A state the policy has no move for is NOT a free exit: nothing finishes from it, so it costs
      // Infinity. Read as 0 it let an improper policy quote a craft at nothing, as an "upper bound"
      // (TODO 24: a tablet with Chaos and Annul both excluded came back at 0 ex). Since the stuck start
      // is seeded (below), no known craft reaches this line — mutation-testing does not catch its
      // removal; it stays so that an improper policy can never again read as a free craft.
      if (k < 0) { isTerm[i] = 1; cOf[i] = Infinity; continue; }
      const a = compiled[i]![k]!;
      if (a.isRestart) { isTerm[i] = 1; cOf[i] = a.cost; qOf[i] = 1; continue; }
      if (a.offer <= 1) {
        wTo[i] = a.to; wPr[i] = a.prob; selfW[i] = a.selfProb;
      } else {
        // `keepWeights`, frozen at V as it stands. Nothing is hoisted for an offer, so a self-outcome
        // shows up in the weights and is split out below.
        const w = new Float64Array(a.to.length);
        keepWeights(a, w, true);
        if (lastThrow > 0) spendOf[i] = lastThrow * a.rerollCost;
        let self = 0;
        for (let j = 0; j < a.to.length; j++) if (a.to[j] === i) self += w[j]!;
        wTo[i] = a.to; wPr[i] = w; selfW[i] = self;
      }
    }

    // Gauss-Seidel on the absorbing chain. Well-conditioned by construction — no path returns to the
    // start — so this settles in a handful of sweeps where the looping version needed thousands.
    // A seeded attempt must be able to FAIL CHEAPLY: if its chain does not settle quickly the policy
    // was a bad guess, and the two-phase fallback still needs budget left to run. Measured the hard
    // way — an unbounded first attempt burned 5,000,000 sweeps and the entire deadline, so the
    // fallback had nothing left and the craft came back infeasible.
    // NEVER above `maxIters`: that is the caller's budget for the whole solve, and a seed attempt
    // that quietly spent 100x it would be answering a question nobody asked.
    const cap = Math.min(evalCap ?? maxIters, maxIters);
    // …except where a loop OTHER than restart barely contracts: a Chaos reroll among Rare states that
    // lands the target 1 roll in a million. There the sweeps "settle" — each moves less than `tol` —
    // while still far from the answer, and policy iteration, comparing plans on those numbers, flips
    // between two of them forever (a tablet's four rarest modifiers: 598M ↔ 324M ex). `exactEvaluation`
    // solves such a chain outright instead, when it is small enough (`solveChainDirect`).
    let spine = 0;
    if (opts.exactEvaluation) for (let i = 0; i < N; i++) if (isTerm[i] === 0) spine++;
    if (opts.exactEvaluation && spine <= DIRECT_MAX_STATES) {
      if (!solveChainDirect(pol, isTerm, wTo, wPr, selfW, spendOf, cOf, qOf)) return false;
    } else for (let sweep = 0; sweep < cap; sweep++) {
      if (deadline !== Infinity && sweep % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
      let delta = 0;
      for (let i = 0; i < N; i++) {
        if (isTerm[i] === 1) continue;
        const k = pol[i]!;
        const a = compiled[i]![k]!;
        const to = wTo[i]!; const pr = wPr[i]!;
        const denom = 1 - selfW[i]!;
        if (denom <= 1e-12) { cOf[i] = Infinity; qOf[i] = 1; continue; } // only loops back: no progress
        let cAcc = a.cost + spendOf[i]!; let qAcc = 0;
        for (let j = 0; j < to.length; j++) {
          const t = to[j]!;
          // Self-weight is divided out below, never summed here. For an ordinary action `to` already
          // EXCLUDES the self-loop (it lives in `selfProb`), so this only bites for an OFFER, whose
          // weights hoist nothing. No offer on the shipped data produces a self-outcome — a
          // Desecration always places a mod, so the state always moves — which means this line is
          // required by the formula but not exercised by any craft. Mutation-testing does not catch
          // its removal; that is a statement about the data, not a reason to drop it.
          if (t === i) continue;
          cAcc += pr[j]! * cOf[t]!;
          qAcc += pr[j]! * qOf[t]!;
        }
        const cNew = cAcc / denom;
        const qNew = qAcc / denom;
        const d = Math.max(Math.abs(cNew - cOf[i]!), Math.abs(qNew - qOf[i]!));
        cOf[i] = cNew; qOf[i] = qNew;
        if (d > delta) delta = d;
      }
      if (delta <= tol) break;
    }

    const si = idxOfState.get(restartKey)!;
    const qs = qOf[si]!;
    if (!(qs < 1)) return false;             // never reaches the goal ⇒ infinite value
    const lambda = cOf[si]! / (1 - qs);
    if (!Number.isFinite(lambda)) return false;
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1) { V[i] = finishCost[i]!; continue; }
      if (canReach[i] !== 1) continue;       // stays pinned at Infinity
      V[i] = cOf[i]! + qOf[i]! * lambda;
    }
    return true;
  };

  /**
   * POLICY ITERATION for phase B — the phase that costs 20x phase A and the one that fails to converge.
   *
   * Value iteration computes the argmin over actions on every sweep and then THROWS IT AWAY, keeping
   * only the value. Policy iteration keeps it, and alternates two cheaper things:
   *
   *   improve   — recompute the greedy action per state. If nothing changed, the policy is OPTIMAL,
   *               and that is a certificate rather than a tolerance: the loop ends knowing, not hoping.
   *   evaluate  — sweep V with the policy FIXED. No inner max, so a sweep is a fraction of a VI sweep,
   *               and it converges far faster because the policy is not churning underneath it.
   *
   * Phase B ONLY, and deliberately. PI on a stochastic shortest path is only safe from a PROPER policy
   * (one that reaches the goal almost surely) — an improper one has infinite value and evaluation
   * diverges. Phase B is seeded from phase A's converged value, which IS a proper policy's value, so
   * V0 >= V*, the greedy policy stays proper, and every iterate descends. Phase A itself 0-initialises
   * and climbs, so it has no such guarantee and keeps plain VI, which it converges on anyway.
   */
  /**
   * A seed policy from a HEURISTIC, so phase A can be skipped entirely.
   *
   * Phase A exists only to hand phase B a `V0` with `T(V0) <= V0`, so phase B descends and every
   * iterate stays an upper bound. It satisfies that by computing the OPTIMAL push-forward value —
   * which is far more than the property needs, and measured at 92-98% of a whole solve now that
   * evaluation is closed form (6-target T2: 379.6s of 389s).
   *
   * The property is much weaker than optimality. For ANY proper policy pi,
   *
   *     T(V^pi) <= T_pi(V^pi) = V^pi
   *
   * so any proper policy's exact value is a valid seed — and `evaluateClosedForm` produces exactly
   * that, at 2% of a solve. All that is missing is a proper policy to hand it, and with restart in
   * play properness is a very weak condition: a policy is proper as soon as its per-attempt success
   * probability is above zero.
   *
   * So: level every state by a backward BFS from the goal, then take the action most likely to move
   * DOWN a level, cost breaking ties. Restart wherever nothing makes progress. The result does not
   * need to be good — policy improvement fixes it — only proper, and the caller checks even that.
   */
  const heuristicPolicy = (): Int32Array => {
    // Distance to the goal in ACTION steps, backwards. Not `distanceToGoal` (defined below, over mod
    // counts) — this one has to be an index-space quantity available before the solve runs.
    const level = new Int32Array(N).fill(-1);
    const queue: number[] = [];
    for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1) { level[i] = 0; queue.push(i); }
    // Predecessors over the action graph, restart excluded: a restart reaches the start from
    // everywhere, which would flatten every level to 1 and make the heuristic say nothing.
    const preds: number[][] = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) {
      for (const a of compiled[i] ?? []) {
        if (a.isRestart) continue;
        for (let j = 0; j < a.to.length; j++) preds[a.to[j]!]!.push(i);
      }
    }
    for (let head = 0; head < queue.length; head++) {
      const t = queue[head]!;
      for (const from of preds[t]!) if (level[from] === -1) { level[from] = level[t]! + 1; queue.push(from); }
    }

    const startLevel = level[idxOfState.get(restartKey)!] ?? -1;
    const pol = new Int32Array(N).fill(-1);
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
      const acts = compiled[i]!;
      let bestK = -1, bestP = -1, bestCost = Infinity, restartK = -1;
      for (let k = 0; k < acts.length; k++) {
        const a = acts[k]!;
        if (a.isRestart) { restartK = k; continue; }
        const mine = level[i]!;
        let progress = 0;
        for (let j = 0; j < a.to.length; j++) {
          const lt = level[a.to[j]!]!;
          if (lt !== -1 && (mine === -1 || lt < mine)) progress += a.prob[j]!;
        }
        if (progress > bestP || (progress === bestP && a.cost < bestCost)) {
          bestP = progress; bestCost = a.cost; bestK = k;
        }
      }
      /**
       * Continue only from states no FURTHER from the goal than the base you would restart to;
       * otherwise bin it.
       *
       * This rule is what makes the seed cheap to evaluate, and the first version got it backwards.
       * Playing forward wherever any progress was possible produced a policy that almost never
       * restarts — and `evaluateClosedForm` is only fast because restart states are ABSORBING. A
       * policy that plays forward everywhere has the full forward dynamics as its chain, which is
       * precisely the near-1 contraction phase A struggles with: it burned 5,000,000 sweeps and the
       * whole deadline on a 3-target T1 craft.
       *
       * Bounding continuation by the start's own level caps the chain depth, so evaluation stays
       * shallow. It also happens to be what the optimal policy does — restart in ~98% of states —
       * which is why it is a good starting guess as well as a cheap one.
       */
      const worthContinuing = bestP > 0 && level[i] !== -1 && startLevel !== -1 && level[i]! <= startLevel;
      pol[i] = worthContinuing ? bestK : (restartK >= 0 ? restartK : bestK);
    }
    return pol;
  };

  const iteratePolicy = (pLo: number, pHi: number, seedPol?: Int32Array, evalCap?: number): boolean => {
    const pol = seedPol ?? new Int32Array(N).fill(-1);
    let evaluated = 0;
    /**
     * Did the LAST evaluation reach `tol`, or run out of sweeps?
     *
     * Truncating evaluation is legitimate — that is modified policy iteration, and it still converges,
     * just over more rounds. What is NOT legitimate is ending on the certificate after a truncated
     * one: improvement would be comparing under-evaluated values, so "no action changed" says nothing
     * about optimality. Measured on a 3-target T1 craft whose true cost is 10,661.00 — at maxIters
     * 20,000 this returned `bound: 'exact'` and 10,836.88, 1.6% high and rendered as a plain figure.
     * So the flag gates the PROOF, not the loop.
     */
    let settled = false;

    // A seeded run starts from a policy nobody has costed yet, so V still holds whatever the caller
    // left there. Evaluate FIRST: improvement compares action values against V, and comparing against
    // a stale V would pick a policy for a problem that is not this one.
    if (seedPol) {
      settled = evaluateClosedForm(pol, evalCap);
      if (!settled) return false;
    }

    for (let round = 0; round < maxRounds; round++) {
      // ── improve ──────────────────────────────────────────────────────────────
      let changed = 0;
      for (let i = 0; i < N; i++) {
        if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
        const acts = compiled[i]!;
        let best = Infinity, bestK = -1;
        for (let k = 0; k < acts.length; k++) {
          const v = valueOf(acts[k]!);
          if (v < best) { best = v; bestK = k; }
        }
        if (bestK !== pol[i]) { pol[i] = bestK; changed++; }
      }
      // The certificate. Not "the numbers stopped moving" — the POLICY stopped moving, which for a
      // finite MDP means no action anywhere improves on it, i.e. this is the optimal policy exactly.
      if (round > 0 && changed === 0 && settled) return true;

      // ── evaluate ─────────────────────────────────────────────────────────────
      // Closed form by default; the iterative path stays reachable so the two can be diffed. See
      // `evaluateClosedForm` for why iterating this particular chain is the whole cost of the solve.
      if (!opts.iterativeEval) {
        settled = evaluateClosedForm(pol, evalCap);
        if (!settled) return false;
        continue;
      }
      settled = false;
      for (let k = 0; k < maxIters; k++) {
        if (deadline !== Infinity && evaluated % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
        evaluated++;
        let delta = 0;
        for (let i = 0; i < N; i++) {
          if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
          const kk = pol[i]!;
          if (kk < 0) continue;
          const next = valueOf(compiled[i]![kk]!);
          if (!Number.isFinite(next)) continue;
          const d = Math.abs(next - V[i]!);
          V[i] = next;
          if (d > delta) delta = d;
        }
        if (delta <= tol) { settled = true; break; }
      }
      if (report) emitSolve(Math.round(pLo + Math.min(0.98, round / 12) * (pHi - pLo)));
    }
    return false;
  };

  /**
   * The fast path: skip phase A entirely.
   *
   * Phase A is 92-98% of a solve now that evaluation is closed form, and all it owes phase B is a
   * proper policy's value. `heuristicPolicy` produces a candidate without solving anything, and
   * `evaluateClosedForm` both costs it and rejects it if it turns out improper — in which case this
   * returns false and the ordinary two-phase path below runs untouched.
   *
   * Only for the policy solver. Value iteration has no use for a policy.
   */
  /** The guessed policy, with another solve's plan wherever it has a move this lattice can play. */
  const seededPolicy = (seed: RouteTable): Int32Array => {
    const pol = heuristicPolicy();
    const moveAt = projectPlan(seed, list.map(idsOf), allStates);
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
      const m = moveAt(i);
      if (!m) continue;
      const want = JSON.stringify(m);
      const k = compiled[i]!.findIndex((a) => JSON.stringify(a.def.action) === want);
      if (k >= 0) pol[i] = k;
    }
    return pol;
  };
  const seedPol = canRestart && opts.solver === 'policy' && !opts.iterativeEval
    ? (opts.seedFrom ? seededPolicy(opts.seedFrom) : opts.heuristicSeed === true ? heuristicPolicy() : undefined)
    : undefined;
  // The cap is a budget for the GUESS, not for the answer: cheap enough that a bad seed costs a
  // fraction of a second, generous enough that a good one settles inside it.
  const fastSeeded = seedPol ? iteratePolicy(0, 1000, seedPol, 20_000) : false;

  let converged: boolean;
  let bound: MarkovResult['bound'];
  if (fastSeeded) {
    converged = true;
    bound = 'exact';
    emitSolve(1000);
  } else {
  // Phase A CLIMBS from zero, so it is only a lower bound while it runs and only becomes a valid seed
  // on convergence. The fast path above has already written its own values into V, so reset before
  // falling back — otherwise phase A starts from an upper bound, climbs past it, and the phase-B
  // descent it is supposed to enable begins from the wrong side.
  V.fill(0);
  seedGoals();
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;

  const seedConverged = iterate(false, 0, canRestart ? 500 : 1000);
  converged = seedConverged;
  bound = seedConverged ? 'exact' : 'lower';
  if (canRestart) {
    // No converged V0 means no proper-policy value to seed from, and an unconverged 0-init V bounds
    // the restart problem in NEITHER direction: it is climbing toward the push-forward optimum, which
    // is the far larger number (~40x, measured). Rather than print a figure with no meaning, say what
    // happened and what to do about it. Reached by a tablet's rarest four-modifier sets at Standard.
    if (!seedConverged) {
      // Which limit ran out decides whether "try harder" is advice or noise: a clock the caller set can
      // be raised, the sweep cap cannot.
      return fail(deadline === Infinity
        ? 'this craft needs more value-iteration sweeps than the solver allows — the step routes still cover it'
        // Its clock OR its sweep cap: the app's Search effort raises both. A four-modifier tablet whose
        // rarest pieces are 1 roll in 150 spends Standard's 100,000 sweeps in ~1.5 s and settles at
        // Exhaustive in ~25 s — so this does not say "out of time" (it read so until 2026-09-23).
        : 'the solver stopped before it could put a number on this craft — raise Search effort and try again '
          + '(the rarest crafts need the longest setting)', { stoppedEarly: true });
    }
    // Phase A leaves the START at Infinity when nothing finishes the craft without starting over — a
    // tablet with no Chaos and no Annul, full of the wrong modifiers, can only be binned. Phase B then
    // has nothing to descend from: every action reads Infinity, the restart included. Seed it from the
    // restart-bounded heuristic policy instead, which is proper by construction and which the closed
    // form costs exactly: an upper bound for value iteration to descend from, and a starting policy
    // for policy iteration to improve.
    const startsStuck = !Number.isFinite(V[idxOfState.get(restartKey)!]!);
    const seed = startsStuck ? heuristicPolicy() : undefined;
    if (seed && opts.solver !== 'policy' && !evaluateClosedForm(seed)) {
      return fail(opts.policy
        ? 'no route reaches this target with the currencies you have — allow more and try again'
        : 'no policy reaches the target');
    }
    converged = opts.solver === 'policy' ? iteratePolicy(500, 1000, seed) : iterate(true, 500, 1000);
    bound = converged ? 'exact' : 'upper';
  }
  emitSolve(1000);
  }

  // ── Extract policy + reachable graph from the start ─────────────────────────
  const startKey = restartKey;
  const startIdx = idxOfState.get(startKey)!;
  if (canReach[startIdx] !== 1) {
    return fail(opts.policy
      ? 'no route reaches this target with the currencies you have — allow more and try again'
      : 'no policy reaches the target');
  }
  const startCost = V[startIdx] ?? Infinity;
  if (!Number.isFinite(startCost)) return fail('no policy reaches the target');

  const bestAction = (k: StateKey): CompiledAction | undefined => {
    let best: CompiledAction | undefined;
    let bestVal = Infinity;
    for (const a of compiled[idxOfState.get(k)!]!) {
      const val = valueOf(a);
      if (val < bestVal) { bestVal = val; best = a; }
    }
    return best;
  };

  /**
   * What actually happens when this action is played — the odds the graph draws and the validator
   * samples.
   *
   * For an ordinary action that is just its distribution. For an OFFER it is emphatically not: the
   * per-draw distribution says a Desecration bricks half the time, while the player seeing three
   * offers only bricks when all three are bad. Publishing the per-draw number would put a 50% on an
   * arrow that is really 12.5%, and `simulatePolicyMean` — which samples these very edges — would then
   * "confirm" a cost the solver never computed. Same tail-sum weights as `offerValue`, against the
   * settled V.
   */
  const realizedDist = (a: CompiledAction): ReadonlyMap<StateKey, number> => {
    if (a.offer <= 1) return a.def.dist;
    const w = new Float64Array(a.to.length);
    keepWeights(a, w, true);
    // Published cheapest-first, the order these edges have always come out in.
    const byV = Array.from({ length: a.to.length }, (_, j) => j).sort((x, y) => V[a.to[x]!]! - V[a.to[y]!]!);
    const out = new Map<StateKey, number>();
    for (const j of byV) {
      const key = allStates[a.to[j]!]!;
      out.set(key, (out.get(key) ?? 0) + w[j]!);
    }
    return out;
  };

  // Full policy over every non-goal state (the reachable graph below is a subset) — for the MC validator.
  /**
   * An action as the result reports it: what to play, and what playing it once costs on average.
   *
   * An Echoes-omened Desecration is offered INSTEAD of the plain one (it can only be better), so where
   * its reroll is never worth taking it is published as the plain draw — the player needs no omen for
   * it, and it is worth exactly the same. Elsewhere it keeps the omen, and its cost the expected spend.
   */
  const published = (a: CompiledAction): { action: McAction; cost: number } => {
    const d = a.def.action;
    if (a.offer <= 1 || a.rerollCost === Infinity || d.currency !== 'desecrate') return { action: d, cost: a.cost };
    keepWeights(a, keptScratch, true);
    if (lastThrow > 0) return { action: d, cost: a.cost + lastThrow * a.rerollCost };
    const plain: McAction = {
      currency: 'desecrate',
      ...(d.boss ? { boss: d.boss } : {}), ...(d.side ? { side: d.side } : {}), ...(d.ancient ? { ancient: true } : {}),
    };
    return { action: plain, cost: a.cost };
  };

  /*
   * One pass settles what the policy does EVERYWHERE — the move each state plays, what it costs on
   * average, and where it lands — as the plain data of a `RouteTable`. Every graph is a walk over it:
   * the craft's own route below, and on the Lab the route from any item a player might buy instead,
   * which is why it is the whole lattice rather than only the states the start can reach.
   */
  const policy = new Map<StateKey, McAction>();
  const actions: McAction[] = [];
  const actionIdx = new Map<string, number>();
  const act = new Int32Array(N).fill(-1);
  const actCost = new Float64Array(N);
  const outStart = new Int32Array(N + 1);
  const outTo: number[] = [];
  const outProb: number[] = [];
  const rerollAbove = new Float64Array(N).fill(NaN);
  for (let i = 0; i < N; i++) {
    outStart[i] = outTo.length;
    const key = allStates[i]!;
    if (goalKeys.has(key)) continue;
    const a = bestAction(key);
    if (!a) continue;
    const shown = published(a);
    // `published` keeps the omen only where the plan rerolls, having just run the keep rule — so the
    // line it rerolls below is fresh in `lastBar`, and a player following the plan needs it.
    if (shown.action.currency === 'desecrate' && shown.action.echoes) rerollAbove[i] = lastBar;
    policy.set(key, shown.action);
    // Deduplicated only to keep the table small; two spellings of one move would merely cost a slot.
    const id = JSON.stringify(shown.action);
    let ai = actionIdx.get(id);
    if (ai === undefined) { ai = actions.length; actions.push(shown.action); actionIdx.set(id, ai); }
    act[i] = ai;
    actCost[i] = shown.cost;
    for (const [to, p] of realizedDist(a)) {
      if (p <= 0) continue;
      outTo.push(idxOfState.get(to)!);
      outProb.push(p);
    }
  }
  outStart[N] = outTo.length;
  const table: RouteTable = {
    keys: allStates, value: V, act, actions, actCost,
    outStart, outTo: Int32Array.from(outTo), outProb: Float64Array.from(outProb),
    goal: isGoalIdx, goalIdx: idxOfState.get(goalKey)!,
    restartIdx: startIdx, canRestart, rerollAbove,
    positions: list.map(idsOf), slotMasks, obstacles: siblings.obstacles,
  };

  // The craft's own route: the walk any other root gets too, from the start (markovRoute.ts).
  const { nodes, edges } = routeFrom(table, startIdx);

  /*
   * What finishing costs from every CLEAN item the craft could start from — a table lookup, since
   * value iteration solved every cell of the lattice (markovStarts.ts has the rules for which cell a
   * set of mods is read from). Both rungs a buyer meets: Magic and Rare.
   *
   * `bareCost` keeps its own read at `s0.rarity`, because it answers a different question (what the
   * craft in front of you would cost with none of it done) and `ItemWorth` is built on that meaning.
   * It equals the empty Rare row only when the craft starts Rare.
   */
  const holdings = startCandidates({
    list, slotMasks, rarities, encode, obstacles: siblings.obstacles.prefix | siblings.obstacles.suffix,
    valueAt: (key) => { const i = idxOfState.get(key); return i === undefined ? undefined : V[i]; },
  });
  // Played on real items when asked — the replay classifies every item the way `s0` was classified and
  // asks this very policy what to do, so it can only ever describe the plan the result reports.
  const replay = opts.replay && bound === 'exact'
    ? replayPolicy({
      data, start, list, idxOf, encode, policy, blocks: siblings.blocks,
      isGoal: (s) => isAccepting(s, slotMasks, spare, siblings.obstacles),
      valueOf: (key) => { const i = idxOfState.get(key); return i === undefined ? undefined : V[i]; },
      ...(opts.restartCost === undefined ? {} : { restartCost: opts.restartCost }),
      ...(opts.fillOnFinish ? { finishCost: (item: ItemState) =>
        ((limits.prefixes - item.prefixes.length) + (limits.suffixes - item.suffixes.length)) * exaltPrice! } : {}),
      costOf: (a) => actionCostOf(prices, a),
      // An omened Desecration rerolls where the plan does, at the line the table records.
      ...(prices.omens[ECHOES_OMEN] !== undefined ? { reroll: {
        cost: prices.omens[ECHOES_OMEN],
        above: (key: StateKey) => {
          const i = idxOfState.get(key);
          const v = i === undefined ? NaN : rerollAbove[i]!;
          return Number.isFinite(v) ? v : undefined;
        },
      } } : {}),
    }, opts.replay)
    : undefined;
  // Its own read, at the STARTING rarity — see the note above on why that differs from `holdings`.
  const bareIdx = idxOfState.get(encode(0, 0, 0, 0, FLAG_NONE, s0.rarity));
  const bareV = bareIdx === undefined ? undefined : V[bareIdx];
  const bare = bareV !== undefined && Number.isFinite(bareV) ? bareV : undefined;
  return {
    expectedCost: startCost, feasible: true, converged, bound, nodes, edges, policy,
    ...(bones ? { bones } : {}),
    ...(bare !== undefined ? { bareCost: bare } : {}),
    ...(holdings.length > 0 ? { holdings } : {}),
    ...(opts.keepRoutes && bound === 'exact' ? { routes: table } : {}),
    ...(opts.restartCost !== undefined ? { restartCost: opts.restartCost } : {}),
    ...(replay ? { replay } : {}),
  };
}
