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
import { familiesOf, modTierWeight, resolveMod } from '../../engine/src/pool.ts';
import { DESECRATION_OFFER_COUNT, bossOmenAllowed, isEssenceMod } from '../../engine/src/probability.ts';
import type { CurrencyPolicy, Prices } from './cost.ts';
import { pricesForBase } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import { slotIndexGroups } from './slots.ts';
import type { ActionDef, McAction } from './markovActions.ts';
import { createActionSpace } from './markovActions.ts';
import type { McState, McTarget, StateKey, McRarity } from './markovState.ts';
import {
  FLAG_JUNK_PREFIX, FLAG_JUNK_SUFFIX, FLAG_NONE, MAX_PER_SIDE, bit, classifyStart, decodeState,
  encodeState, enumerateStates, flaggedTarget, has, isAccepting, popcount, sideIndexOf, slotsFilled,
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
  /** Set when the mod a Desecration placed is JUNK, naming the side it sits on. It blocks
   *  re-desecrating until it is removed. */
  readonly desecratedJunk?: 'prefix' | 'suffix';
  /** Set when the mod a Desecration placed is one of the TARGETS — the mod id. Blocks re-desecrating
   *  just the same, which is why keeping it can cost more than it looks. */
  readonly desecratedTarget?: string;
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /** Minimum expected cost to reach the target from here. */
  readonly expectedCost: number;
  /** The optimal currency to use here (undefined at the goal). */
  readonly action?: McAction;
  /** The item's rarity here. Without it a 2-mod Magic item and a 2-mod Rare item render identically
   *  while behaving completely differently — one of them cannot take an Exalt at all. */
  readonly rarity: McRarity;
  /**
   * How much this state matters to a run that SUCCEEDS — expected visits per successful attempt.
   *
   * This is what decides which states the graph draws, and the obvious metric is the wrong one. Plain
   * visit frequency ranks the FAILURES first: on a craft with a free base ~98% of states choose
   * "start over", so they are entered constantly while every one of them shows the same action and
   * the same cost (they all share V(start)). A real 6-target T2 craft drew ten boxes at 90% coverage
   * and nine read "Start over with a new base · 2,132 div" — statistically faithful and useless. The
   * spine a player needs sat below 99%.
   *
   * So it is weighted by the probability of reaching the goal from here. A state whose best move is
   * to restart has no route onward and drops out; what is left is the path the craft actually takes.
   * Restart edges are still DRAWN from the states that survive — they are the back-arrows, and how
   * often a step throws you back is precisely what the reader needs to see.
   *
   * Expected VISITS, not a probability: one attempt can pass through the same state twice, so this
   * can exceed 1. Ranking, not odds.
   */
  readonly visitRate: number;
  /**
   * Moves still to make, by the same estimate `regress` is judged against.
   *
   * Carried rather than recomputed by the UI: engineMap had its own copy of this expression, and the
   * moment rarity entered the formula the two disagreed — a state the solver called a step forward
   * would have been drawn as a step back.
   */
  readonly depth: number;
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
}

/** How often the O(states) loops report. Frequent enough to animate, rare enough to cost nothing. */
const PROGRESS_STRIDE = 64;

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
  const fail = (reason: string): MarkovResult => ({
    expectedCost: Infinity, feasible: false, converged: true, bound: 'exact',
    reason, nodes: [], edges: [], policy: new Map(),
  });
  const prices = pricesForBase(rawPrices, start.base);

  const level = start.level;
  const pools = start.base.pools;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  // Resolve targets into the ordered list the bitmasks index: rollable normal mods, desecrated mods
  // (added by a Desecration with the boss omen that selects them), and perfect-essence mods (forced on
  // by a Perfect Essence, which eats one existing mod as it adds). A REGULAR essence has no action in
  // this model's vocabulary at all (TODO 1) — the Magic item it needs IS representable since the state
  // gained a rarity axis, so what's missing is the action, not the shape — and those targets stay on
  // the linear planner.
  const list: McTarget[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    if (mod.source === 'essence') {
      return fail(`${t.modId} can only be added by a regular Essence, and this model has no Essence action yet`);
    }
    if (mod.source !== 'normal' && mod.source !== 'desecrated' && mod.source !== 'perfect_essence') {
      return fail(`${t.modId} is not a rollable, desecrated or perfect-essence mod (the MDP handles those)`);
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
  if (n > MAX_CANDIDATES) return fail(`target names more than ${MAX_CANDIDATES} candidate mods`);

  /*
   * Group the candidates into SLOTS — the number of slots, not the number of candidates, is what the
   * item has to hold. `slotIndexGroups` is shared with the linear planners so the two can never
   * disagree about which candidates are alternatives; see slots.ts for why they then do opposite
   * things with the answer.
   */
  const slotMasks = slotIndexGroups(targets).map((g) => g.reduce((m, i) => m | bit(i), 0));
  const desecratedBit = (i: number): boolean => list[i]!.mod.source === 'desecrated';
  const slotSides: ('prefix' | 'suffix')[] = [];
  for (const mask of slotMasks) {
    const members = list.filter((_, i) => has(mask, i));
    const type = members[0]!.type;
    // A slot spanning both sides would make the 3-per-side accounting meaningless — the same slot
    // would consume a prefix on one route and a suffix on another.
    if (members.some((m) => m.type !== type)) {
      return fail(`alternatives for one slot must be all prefixes or all suffixes (${members.map((m) => m.modId).join(', ')})`);
    }
    slotSides.push(type);
  }
  for (const sideName of ['prefix', 'suffix'] as const) {
    const used = slotSides.filter((t) => t === sideName).length;
    if (used > MAX_PER_SIDE) return fail(`target needs ${used} ${sideName}es, and an item holds ${MAX_PER_SIDE}`);
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
      for (const fam of familiesOf(list[i]!.mod)) {
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
   * Enforcement of the rest is structural rather than another check: the desecrated candidates go into
   * `conflicts` below, so the lattice never carries a state holding two. The action space already
   * agreed — a bone needs an item with no bone-placed mod (`hasDesecrated`) — so nothing can transition
   * into what is pruned, and the closure assertion in the compile step is what proves it.
   */
  const forcedCarved = slotMasks.filter((m) => {
    let any = false;
    for (let i = 0; i < n; i++) if (has(m, i)) { if (!desecratedBit(i)) return false; any = true; }
    return any;
  }).length;
  if (forcedCarved > 1) {
    return fail('an item holds at most one desecrated mod, and this target needs two');
  }
  // …and at most one ESSENCE modifier, regular or perfect together (see `isEssenceMod`). Without this
  // `actionsOf` built a perfect-essence action per perfect target and the policy would happily stack
  // two, producing a route to an item the game cannot hold.
  if (list.filter((t) => isEssenceMod(t.mod)).length > 1) {
    return fail('an item can hold at most one essence modifier (regular or perfect) — pick one');
  }
  const idxOf = new Map(list.map((t, i) => [t.modId, i]));

  // A rollable target that can never roll (weight 0 even at base strength, the most permissive) is
  // impossible. Desecrated targets don't roll from the normal pool, so the pool check above covers them.
  const ungettable = list.find((t) => t.mod.source === 'normal' && modTierWeight(t.mod, 0, level, t.minIndex) === 0);
  if (ungettable) return fail(`${ungettable.modId} can't roll at item level ${level}`);

  const side = sideIndexOf(list);
  const s0 = classifyStart(data, start, list, idxOf);
  /*
   * Is Desecration in play at all?
   *
   * A desecrated target to craft, or a flagged mod on the item to clear — and, since a bone OFFERS three
   * modifiers and you keep one, the case that used to be dismissed: a bone can simply be the cheapest
   * way to add an ORDINARY mod. That is not marginal. A Preserved rib is 0.31ex against an Exalt's
   * 1.00ex, so on a Body Armour a bone lands a named normal mod for ~1.2ex where an Exalt needs
   * ~9.6ex. (On amulets and rings the collarbone is 7.69ex and the Exalt wins.)
   *
   * The price test is a NECESSARY condition, not a heuristic. The offer raises the chance of a hit by
   * at most a factor of `DESECRATION_OFFER_COUNT`, since 1−(1−p)^m ≤ m·p; and a bone's per-draw p is
   * strictly below an Exalt's, because its denominator carries the desecrated pool as well. So a bone
   * priced at m Exalts or more cannot win, and leaving it out costs nothing — which keeps the desJunk
   * axis, and the 3x states it brings, off every craft that could never have used it.
   *
   * An ABSENT price reads as "no bone", not as a free one: `stepCost` turns a missing key into 0, and
   * a 0 here would switch desecration on for every base in a sheet that simply doesn't price bones.
   */
  const bonePrice = prices.currency.desecrate;
  const exaltPrice = prices.currency.exalt;
  const boneCanOutbidAnExalt = bonePrice !== undefined && exaltPrice !== undefined
    && bonePrice < DESECRATION_OFFER_COUNT * exaltPrice;
  // …and none of it matters if the player has excluded the currency: with no Desecration in the action
  // space nothing can ever set the flag, so enumerating the axis is pure cost. Worth checking here
  // rather than leaving to `allowsAction`, which prunes ACTIONS and cannot shrink the lattice.
  const bonesAllowed = opts.policy === undefined || !opts.policy.excluded.has('desecrate');
  const desecratable = bonesAllowed
    && (list.some((t) => t.mod.source === 'desecrated')
      || s0.flagged !== FLAG_NONE
      || boneCanOutbidAnExalt);
  // Where "start over" lands: the item you began with, which for a from-white craft is the bare base.
  // Built here rather than later because the action space closes over it.
  const restartKey = encodeState(s0.present, s0.blocked, s0.jp, s0.js, s0.flagged, s0.rarity);
  const { actionsOf } = createActionSpace({
    data, prices, level, pools, list, side, desecratable,
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
  const allStates = enumerateStates(n, side, desecratable, rarities, conflicts);

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
   * `isAccepting` still demands zero junk, zero blocked and Rare, so this is the same standard of
   * "finished" as before — with every slot a singleton it reproduces the old set exactly, which the
   * test suite asserts against a from-white craft.
   */
  const goalKeys = new Set<StateKey>();
  for (const k of allStates) if (isAccepting(decodeState(k), slotMasks)) goalKeys.add(k);
  if (goalKeys.size === 0) return fail('no legal item satisfies every slot of this target');
  // The canonical goal for display: `allStates` is enumerated present-ascending with FLAG_NONE first,
  // so this is the *barest* finished item — the one that fills each slot once and carries nothing more.
  const goalKey = [...goalKeys].find((k) => decodeState(k).flagged === FLAG_NONE) ?? [...goalKeys][0]!;
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
  }
  const compiled: CompiledAction[][] = new Array(N);
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
        if (toIdx === undefined) {
          return fail(`internal: ${def.action.currency} from ${key} leads to ${toKey}, which is not in the lattice`);
        }
        to.push(toIdx);
        prob.push(p);
      }
      if (to.length > widestOffer && offer > 1) widestOffer = to.length;
      out.push({
        def, cost: def.cost, selfProb, offer, isRestart: def.action.currency === 'restart',
        to: Int32Array.from(to), prob: Float64Array.from(prob),
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
  for (const k of goalKeys) {
    const gi = idxOfState.get(k);
    if (gi !== undefined) isGoalIdx[gi] = 1;
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
  // Phase A's dead ends, a superset of phase B's. A state only a restart can rescue starts at Infinity,
  // which is still a valid seed for phase B — the seed only has to be an UPPER bound.
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;
  // Reused by every offer evaluation; sized once so the hot loop allocates nothing.
  const order = new Int32Array(widestOffer);
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
   */
  const offerValue = (a: CompiledAction): number => {
    const K = a.to.length;
    for (let j = 0; j < K; j++) order[j] = j;
    for (let j = 1; j < K; j++) { // insertion sort by V ascending; K is tiny
      const cur = order[j]!;
      const cv = V[a.to[cur]!]!;
      let q = j - 1;
      while (q >= 0 && V[a.to[order[q]!]!]! > cv) { order[q + 1] = order[q]!; q--; }
      order[q + 1] = cur;
    }
    let tail = 0;
    for (let j = 0; j < K; j++) tail += a.prob[j]!;
    let tailPow = tail ** a.offer;
    let acc = 0;
    for (let j = 0; j < K; j++) {
      const idx = order[j]!;
      tail -= a.prob[idx]!;
      const nextPow = tail <= 0 ? 0 : tail ** a.offer;
      acc += V[a.to[idx]!]! * (tailPow - nextPow);
      tailPow = nextPow;
    }
    return a.cost + acc;
  };
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
   *
   * Returns false when the policy never reaches the goal (`q(start) = 1`), which is a real state of
   * affairs — an improper policy has infinite value — and the caller must not read V after it.
   */
  const evaluateClosedForm = (pol: Int32Array, evalCap?: number): boolean => {
    // Frozen realized weights per state, against V as it stands right now.
    const wTo: Int32Array[] = new Array(N);
    const wPr: Float64Array[] = new Array(N);
    const selfW = new Float64Array(N);
    const isTerm = new Uint8Array(N);   // goal or "policy restarts here" — the chain stops
    const cOf = new Float64Array(N);
    const qOf = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1 || canReach[i] !== 1) { isTerm[i] = 1; continue; }
      const k = pol[i]!;
      if (k < 0) { isTerm[i] = 1; continue; }
      const a = compiled[i]![k]!;
      if (a.isRestart) { isTerm[i] = 1; cOf[i] = a.cost; qOf[i] = 1; continue; }
      if (a.offer <= 1) {
        wTo[i] = a.to; wPr[i] = a.prob; selfW[i] = a.selfProb;
      } else {
        // Same tail-sum identity as `offerValue`: P(keep k) = T_k^m − T_(k+1)^m over outcomes sorted
        // by V ascending. Nothing is hoisted for an offer, so a self-outcome shows up in the weights
        // and is split out below.
        const K = a.to.length;
        const order2 = Array.from({ length: K }, (_, j) => j).sort((x, y) => V[a.to[x]!]! - V[a.to[y]!]!);
        const w = new Float64Array(K);
        let tail = 0;
        for (let j = 0; j < K; j++) tail += a.prob[j]!;
        let tailPow = tail ** a.offer;
        let self = 0;
        for (const j of order2) {
          tail -= a.prob[j]!;
          const nextPow = tail <= 0 ? 0 : tail ** a.offer;
          w[j] = tailPow - nextPow;
          if (a.to[j] === i) self += w[j]!;
          tailPow = nextPow;
        }
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
    for (let sweep = 0; sweep < cap; sweep++) {
      if (deadline !== Infinity && sweep % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
      let delta = 0;
      for (let i = 0; i < N; i++) {
        if (isTerm[i] === 1) continue;
        const k = pol[i]!;
        const a = compiled[i]![k]!;
        const to = wTo[i]!; const pr = wPr[i]!;
        const denom = 1 - selfW[i]!;
        if (denom <= 1e-12) { cOf[i] = Infinity; qOf[i] = 1; continue; } // only loops back: no progress
        let cAcc = a.cost; let qAcc = 0;
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
      if (isGoalIdx[i] === 1) { V[i] = 0; continue; }
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
  const fastSeeded = canRestart && opts.solver === 'policy' && !opts.iterativeEval && opts.heuristicSeed === true
    // The cap is a budget for the GUESS, not for the answer: cheap enough that a bad seed costs a
    // fraction of a second, generous enough that a good one settles inside it.
    ? iteratePolicy(0, 1000, heuristicPolicy(), 20_000)
    : false;

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
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;

  const seedConverged = iterate(false, 0, canRestart ? 500 : 1000);
  converged = seedConverged;
  bound = seedConverged ? 'exact' : 'lower';
  if (canRestart) {
    // No converged V0 means no proper-policy value to seed from, and an unconverged 0-init V bounds
    // the restart problem in NEITHER direction: it is climbing toward the push-forward optimum, which
    // is the far larger number (~40x, measured). Rather than print a figure with no meaning, say what
    // happened and what to do about it. Not seen on real data — the push-forward solve settles in
    // ~12s at the 6-target cap, this model's maximum — so this is the guard, not a path.
    if (!seedConverged) {
      // Which limit ran out decides whether "try harder" is advice or noise: a clock the caller set can
      // be raised, the sweep cap cannot.
      return fail(deadline === Infinity
        ? 'this craft needs more value-iteration sweeps than the solver allows — the step routes still cover it'
        : 'the solver ran out of time before it could put a number on this craft — raise Search effort and '
          + 'try again (a six-mod target at T1 needs the longest setting)');
    }
    converged = opts.solver === 'policy' ? iteratePolicy(500, 1000) : iterate(true, 500, 1000);
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
    const K = a.to.length;
    const idx = Array.from({ length: K }, (_, j) => j)
      .sort((x, y) => V[a.to[x]!]! - V[a.to[y]!]!);
    let tail = 0;
    for (let j = 0; j < K; j++) tail += a.prob[j]!;
    let tailPow = tail ** a.offer;
    const out = new Map<StateKey, number>();
    for (const j of idx) {
      tail -= a.prob[j]!;
      const nextPow = tail <= 0 ? 0 : tail ** a.offer;
      const key = allStates[a.to[j]!]!;
      out.set(key, (out.get(key) ?? 0) + (tailPow - nextPow));
      tailPow = nextPow;
    }
    return out;
  };

  // Full policy over every non-goal state (the reachable graph below is a subset) — for the MC validator.
  const policy = new Map<StateKey, McAction>();
  for (const key of allStates) {
    if (goalKeys.has(key)) continue;
    const a = bestAction(key);
    if (a) policy.set(key, a.def.action);
  }

  // Distance-to-goal for layout/regress: missing targets + blocked (each needs a remove then an add) +
  // junk, counting an unwanted desecrated mod as junk too (it likewise costs a removal to clear).
  const distanceToGoal = (k: StateKey): number => {
    const st = decodeState(k);
    // A state below Rare is at least two moves out however good its mods are: the Regal that converts
    // it, plus the Annulment that clears the mod that Regal is forced to add. Without this a Magic item
    // already holding every target scores 0 — the goal's own distance — while not being the goal, so
    // the route walk (which may only step to a STRICTLY smaller distance) has nowhere to go and stalls.
    // This is a layout and ordering heuristic, like the rest of the expression, not an exact metric.
    const toRare = st.rarity === 'rare' ? 0 : 2;
    // No term for the flag: a flagged JUNK mod is already counted in jp/js (marking it does not add an
    // affix), and a flagged TARGET is a mod you wanted and have. The old axis needed one because it
    // described a mod held outside those counters.
    // Unfilled SLOTS, not missing candidates: with `slot 3 = {Cold, Lightning}` an item holding Cold
    // is one step from done, and counting the Lightning it will never need as "missing" would put the
    // goal permanently out of reach of a walk that may only step to a strictly smaller distance.
    // Every slot a singleton makes this `n - popcount(present)` again, exactly as before.
    return (slotMasks.length - slotsFilled(st.present, slotMasks))
      + popcount(st.blocked) + st.jp + st.js + toRare;
  };
  /**
   * How the UI should describe the mod a Desecration placed here, if any.
   *
   * Two fields rather than one, because the two cases read differently to a player: junk only needs
   * its side (junk mods are interchangeable), while a flagged TARGET needs naming — it is a mod they
   * asked for, and the fact that it also locks the item out of desecrating again is the whole reason
   * the state is distinct.
   */
  const flagFields = (st: McState): { desecratedJunk?: 'prefix' | 'suffix'; desecratedTarget?: string } => {
    if (st.flagged === FLAG_JUNK_PREFIX) return { desecratedJunk: 'prefix' };
    if (st.flagged === FLAG_JUNK_SUFFIX) return { desecratedJunk: 'suffix' };
    const i = flaggedTarget(st.flagged);
    return i >= 0 ? { desecratedTarget: list[i]!.modId } : {};
  };
  /**
   * Fold every goal state onto one key for display.
   *
   * The lattice has a goal per value of the flag axis — a finished item is finished whether or not a
   * Desecration placed one of its mods — and they all have V = 0, so they are the same answer. Drawn
   * as they come they would put several identical "✓ target" boxes in the graph and imply the player
   * has a choice of endings.
   */
  const canonical = (k: StateKey): StateKey => (goalKeys.has(k) ? goalKey : k);

  // Two phases on purpose: the BFS below discovers the states and their edges, and `visitRate` is a
  // property of the finished GRAPH — it cannot be known for a node until every path into it exists.
  // Typing the accumulator without the field is what makes that ordering explicit rather than a
  // half-built object the compiler waves through.
  const nodes: Omit<PolicyNode, 'visitRate'>[] = [];
  const edges: PolicyEdge[] = [];
  const seen = new Set<StateKey>();
  const queue: StateKey[] = [startKey];
  while (queue.length > 0) {
    const k = queue.shift()!;
    if (seen.has(k)) continue;
    seen.add(k);
    const st = decodeState(k);
    const isGoal = goalKeys.has(k);
    const act = isGoal ? undefined : bestAction(k);
    nodes.push({
      key: k,
      present: list.filter((_, i) => has(st.present, i)).map((t) => t.modId),
      blocked: list.filter((_, i) => has(st.blocked, i)).map((t) => t.modId),
      junkPrefixes: st.jp, junkSuffixes: st.js, rarity: st.rarity,
      ...flagFields(st),
      isStart: k === startKey, isGoal, depth: distanceToGoal(k), expectedCost: V[idxOfState.get(k)!] ?? Infinity,
      ...(act ? { action: act.def.action } : {}),
    });
    if (act) {
      for (const [rawTo, p] of realizedDist(act)) {
        if (p <= 0) continue;
        const to = canonical(rawTo);
        edges.push({ from: k, to, action: act.def.action, prob: p, regress: distanceToGoal(to) > distanceToGoal(k) });
        if (!seen.has(to)) queue.push(to);
      }
    }
  }

  /**
   * Rank every state by how much it matters to a run that SUCCEEDS.
   *
   * Two passes, and the second is the whole point.
   *
   *   forward(s) — expected visits per attempt: `f(s) = [s is start] + Σ_t f(t)·P(t→s)`.
   *   toGoal(s)  — P(reach the goal from s without restarting): `g(s) = Σ_t P(s→t)·g(t)`, `g(goal)=1`.
   *
   * The product is expected visits to `s` on a successful attempt, and `forward` ALONE was measured
   * to be actively misleading. On a craft with a free base ~98% of states choose "start over", so
   * they are entered constantly and rank at the top — while every one of them shows the same action
   * and the same cost, because they all share V(start). A real 6-target T2 craft drew ten boxes at
   * 90% coverage and nine of them said "Start over with a new base · 2,132 div". The part a player
   * needs — Chaos, Annul, Perfect Exalt, Desecrate, where the cost finally falls 2,131 → 751 — sat
   * below 99%, past 89 boxes of noise.
   *
   * `toGoal` fixes it by construction: a state whose best move is to restart has no non-restart edge
   * out, so its `g` is 0 and it leaves the ranking entirely. What survives is the spine of the craft.
   * The restart edges are still DRAWN from the states that are kept — they are the back-arrows, and
   * how often a step throws you back is exactly what the reader has to see.
   *
   * Power iteration for both: the graph is small, both chains are transient so the series converge
   * geometrically, and the alternative is a dense N×N inverse for a number that only decides what
   * gets drawn. The 1000 cap is a runaway guard; both settle in tens.
   */
  const incoming = new Map<string, { from: string; p: number }[]>();
  const outgoing = new Map<string, { to: string; p: number }[]>();
  for (const e of edges) {
    // A restart ENDS the attempt. Followed, it feeds probability back into the start and both passes
    // diverge — the loop is the reason for the cut, not a special case.
    if (e.action.currency === 'restart' || e.to === startKey) continue;
    const inList = incoming.get(e.to);
    if (inList) inList.push({ from: e.from, p: e.prob });
    else incoming.set(e.to, [{ from: e.from, p: e.prob }]);
    const outList = outgoing.get(e.from);
    if (outList) outList.push({ to: e.to, p: e.prob });
    else outgoing.set(e.from, [{ to: e.to, p: e.prob }]);
  }

  const settle = (step: (prev: Map<string, number>) => Map<string, number>, init: Map<string, number>) => {
    let cur = init;
    for (let round = 0; round < 1000; round++) {
      const next = step(cur);
      let delta = 0;
      for (const [k, v] of next) {
        const d = Math.abs(v - (cur.get(k) ?? 0));
        if (d > delta) delta = d;
      }
      cur = next;
      if (delta <= 1e-12) break;
    }
    return cur;
  };

  const forward = settle((prev) => {
    const next = new Map<string, number>();
    for (const nd of nodes) {
      let acc = nd.key === startKey ? 1 : 0;
      for (const { from, p } of incoming.get(nd.key) ?? []) acc += (prev.get(from) ?? 0) * p;
      next.set(nd.key, acc);
    }
    return next;
  }, new Map(nodes.map((nd) => [nd.key, nd.key === startKey ? 1 : 0])));

  const toGoal = settle((prev) => {
    const next = new Map<string, number>();
    for (const nd of nodes) {
      if (nd.isGoal) { next.set(nd.key, 1); continue; }
      let acc = 0;
      for (const { to, p } of outgoing.get(nd.key) ?? []) acc += p * (prev.get(to) ?? 0);
      next.set(nd.key, acc);
    }
    return next;
  }, new Map(nodes.map((nd) => [nd.key, nd.isGoal ? 1 : 0])));

  const withVisits = nodes.map((nd) => (
    { ...nd, visitRate: (forward.get(nd.key) ?? 0) * (toGoal.get(nd.key) ?? 0) }));

  return { expectedCost: startCost, feasible: true, converged, bound, nodes: withVisits, edges, policy };
}
