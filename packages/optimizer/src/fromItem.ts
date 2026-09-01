// From-existing-item planner (Option 2). Transform an item you ALREADY hold into a target. The key
// difference from the from-white optimizer is the COST MODEL: `planExpectedCost` restarts to the
// STARTING item on a miss — you keep the good mods you began with (or reproduce that start), rather than
// binning it back to a blank base — so the plan never "throws away" the part you already have. It reaches
// EXACTLY the target: every current mod not in the target is junk to remove, every target mod not present
// must be added. Removal is a random Annulment (or the remove-half of a Chaos); adds are Exalts (into an
// open slot), the add-half of a Chaos, a Desecration (a desecrated mod, via its boss omen), or a Perfect
// Essence (which removes one random mod as it adds). A MAGIC start is handled by opening with a Regal
// Orb, which converts to Rare while adding one mod — without that, the commonest starting point in the
// game (a magic base you are part-way through) had no planner at all. Everything runs at base orb
// strength (`currencyDepth: 'base-only'`); tier targets are honoured and per-exalt /
// per-perfect-essence side omens are explored.

import type { ItemBase, ItemState, PatchData } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import { evaluatePlanFrom } from '../../engine/src/plan.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { bossOmenAllowed, desecrationOmenForMod, isEssenceMod } from '../../engine/src/probability.ts';
import type { Prices } from './cost.ts';
import { planExpectedCost, pricesForBase } from './cost.ts';
import { combinations, orderedSelections, permutations } from './combinatorics.ts';
import { expandSlots, itemLegalCombinations } from './slots.ts';
import type { OptimizeParetoOptions, ParetoPlan, ParetoResult, TierTarget } from './optimize.ts';
import { PROGRESS_REPORTS, mergeParetoRuns, paretoFrontier } from './optimize.ts';
import type { LeverCandidate } from './leverDp.ts';
import { bestLeverAssignments } from './leverDp.ts';

/**
 * Target validation for the from-item planner: 1–6 mods, ≤3/side. A target mod is one the planner can
 * realise: a rollable (normal-pool) mod, a perfect-essence mod (added by a Perfect Essence, which removes
 * one random mod), or a desecrated mod — either KEPT (already on the item) or CRAFTED by a Desecration
 * with the boss omen matching its tag (so it must carry a boss tag).
 */
function validateFromItemTarget(
  data: PatchData, base: ItemBase, targetIds: readonly string[], present: ReadonlySet<string>,
): void {
  if (targetIds.length === 0) throw new Error('no target mods');
  if (targetIds.length > 6) throw new Error(`target has ${targetIds.length} mods (max 6)`);
  let pre = 0;
  let suf = 0;
  let desecratedCount = 0;
  let essenceCount = 0;
  const norm = base.pools.normal;
  const ess = base.pools.essence;
  const des = base.pools.desecrated;
  for (const id of targetIds) {
    const mod = resolveMod(data, id);
    const rollable = mod.source === 'normal' && (norm.prefixes.includes(id) || norm.suffixes.includes(id));
    const perfect = mod.source === 'perfect_essence' && (ess.prefixes.includes(id) || ess.suffixes.includes(id));
    // A desecrated target is craftable (Desecration + its boss omen, P = 1/N over that boss's slot pool)
    // when it's in the base's desecrated pool and carries a boss tag; it's also legal simply KEPT if
    // already present. A desecrated mod with no boss tag can't be targeted (nothing selects it).
    const inDes = des.prefixes.includes(id) || des.suffixes.includes(id);
    const desecrated = mod.source === 'desecrated' && (present.has(id) || (inDes && desecrationOmenForMod(mod) !== undefined));
    if (!rollable && !perfect && !desecrated) {
      // An essence-only mod is the common trip-up: a regular essence needs a MAGIC item, but the from-item
      // planner starts from a Rare (which is exactly what a fractured base is), so it can never apply one.
      const why = mod.source === 'essence'
        ? 'a regular essence needs a Magic item, so an essence-only mod can’t go on an item you already hold '
          + '(a fractured base is a Rare) — craft it from a white base instead, or drop the fractured mod'
        : mod.source === 'desecrated'
        ? 'this desecrated mod has no boss omen that targets it'
        : 'the from-item planner supports rollable mods, perfect essences, and desecrated mods';
      throw new Error(`mod ${id} can’t be put on ${base.id} (${why})`);
    }
    if (mod.source === 'desecrated') desecratedCount++;
    if (isEssenceMod(mod)) essenceCount++;
    if (mod.type === 'prefix') pre++;
    else suf++;
  }
  if (pre > 3) throw new Error(`target has ${pre} prefixes (max 3)`);
  if (suf > 3) throw new Error(`target has ${suf} suffixes (max 3)`);
  // The Desecration mechanic places a single carved mod — an item can hold at most one desecrated mod.
  if (desecratedCount > 1) throw new Error('an item can hold at most one desecrated mod');
  // …and at most one ESSENCE modifier, counting regular and perfect together (see `isEssenceMod`).
  // This planner used to build one `perfect-essence` step per perfect target, so a two-essence target
  // produced a plan for an item the game cannot hold.
  if (essenceCount > 1) throw new Error('an item can hold at most one essence modifier (regular or perfect) — pick one');
}

/**
 * Base transform ops (Chaos/Annul/Exalt) for rollable junk↔missing, NOT yet order-permuted: for each
 * count `c` of Chaos swaps (0…min), pick which junk/missing pair up (and their bijection), Annul the
 * leftover junk, Exalt the leftover missing.
 */
function baseTransforms(
  junk: readonly string[], missing: readonly string[], tierOf: Map<string, number>,
): PlanStep[][] {
  const out: PlanStep[][] = [];
  const maxC = Math.min(junk.length, missing.length);
  for (let c = 0; c <= maxC; c++) {
    for (const jc of combinations(junk, c)) {
      const restJunk = junk.filter((x) => !jc.includes(x));
      for (const mc of combinations(missing, c)) {
        const restMissing = missing.filter((x) => !mc.includes(x));
        for (const mPerm of permutations(mc)) { // bijection: jc[i] ↔ mPerm[i]
          const ops: PlanStep[] = [];
          for (let i = 0; i < c; i++) {
            ops.push({ currency: 'chaos', remove: jc[i]!, add: mPerm[i]!, minTierIndex: tierOf.get(mPerm[i]!) ?? 0 });
          }
          for (const j of restJunk) ops.push({ currency: 'annul', remove: j });
          for (const y of restMissing) ops.push({ currency: 'exalt', add: y, minTierIndex: tierOf.get(y) ?? 0 });
          out.push(ops);
        }
      }
    }
  }
  return out;
}

/**
 * Build the transform op-sequences from junk + missing (split into rollable, perfect-essence, and
 * desecrated mods), enumerating every ORDER. A PERFECT-ESSENCE target can only be added by a Perfect
 * Essence, which removes one uniformly-random mod as it adds — so each perfect target is paired with a
 * distinct junk to sacrifice (its step scores the odds the random removal hits that junk). A DESECRATED
 * target is added by a Desecration with the boss omen matching its tag (P = 1/N over that boss's slot
 * pool); it needs an open slot but removes nothing, so it's a standalone add like an exalt. The remaining
 * junk + rollable-missing go through the ordinary Chaos/Annul/Exalt transforms. Illegal orders (e.g. an
 * add onto a full side) score 0 and drop.
 */
function transformSequences(
  data: PatchData, junk: readonly string[], missingRollable: readonly string[], missingPerfect: readonly string[],
  missingDesecrated: readonly string[], tierOf: Map<string, number>,
  /** False on armour, where a Desecration can't be boss-targeted at all — see `bossOmenAllowed`. */
  bossOk: boolean,
): PlanStep[][] {
  const out: PlanStep[][] = [];
  // Each desecrated target is a Desecration constrained to its boss — except on armour, where the
  // boss omens don't apply and the draw spans the base's whole desecrated pool instead.
  const desecrateOps: PlanStep[] = missingDesecrated.map((add): PlanStep => {
    const omen = bossOk ? desecrationOmenForMod(resolveMod(data, add)) : undefined;
    return omen ? { currency: 'desecrate', add, boss: omen } : { currency: 'desecrate', add };
  });
  // Each perfect target consumes one junk (removed by its essence); enumerate which junk, in order.
  for (const junkForPerfect of orderedSelections(junk, missingPerfect.length)) {
    const perfectOps: PlanStep[] = missingPerfect.map((add, i) => ({
      currency: 'perfect-essence', add, remove: junkForPerfect[i]!,
    }));
    const restJunk = junk.filter((j) => !junkForPerfect.includes(j));
    for (const baseOps of baseTransforms(restJunk, missingRollable, tierOf)) {
      for (const order of permutations([...perfectOps, ...desecrateOps, ...baseOps])) out.push(order);
    }
  }
  return out;
}

/**
 * Compute the (expected cost ↔ success probability) Pareto frontier for transforming `start` (an item
 * you already hold) into `targets`. See the file header for the model. Throws if `start` isn't Rare
 * or the target shape is illegal. When the item already IS the target, returns a single empty plan.
 */
export function optimizeFromItem(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], opts: OptimizeParetoOptions = {},
): ParetoResult {
  // One concrete craft per slot combination, frontiers merged — see optimizePareto for why a route
  // must commit to a member. From an item this also does something the from-white case cannot: a
  // combination naming the alternative you ALREADY hold is scored against that item and is usually
  // close to free, so the merged frontier surfaces "keep what you have" without being told to.
  const combos = itemLegalCombinations(expandSlots(targets),
    (id) => resolveMod(data, id).source === 'desecrated');
  const one = (t: readonly TierTarget[], onProgress?: (d: number, n: number) => void): ParetoResult =>
    fromItemForOneCraft(data, rawPrices, start, t, { ...opts, ...(onProgress ? { onProgress } : {}) });
  if (combos.length > 1) return mergeParetoRuns(combos, one, opts.onProgress);
  return one(combos[0] ?? targets);
}

function fromItemForOneCraft(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], opts: OptimizeParetoOptions,
): ParetoResult {
  const policy = opts.policy;
  const prices = pricesForBase(rawPrices, start.base);
  if (start.rarity === 'normal') {
    throw new Error('a white base has no mods to transform — plan it from the Lab instead');
  }
  const targetIds = targets.map((t) => t.modId);
  const current = [...start.prefixes, ...start.suffixes].map((p) => p.modId);
  const currentSet = new Set(current);
  validateFromItemTarget(data, start.base, targetIds, currentSet);
  const tierOf = new Map(targets.map((t) => [t.modId, t.minTierIndex ?? 0]));
  const targetSet = new Set(targetIds);
  // Fractured ("carved") mods are locked — never removed, so never junk. They stay on the item (kept
  // whether or not they're in the target) and keep occupying their slot + family for the engine's math.
  const fractured = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));
  const junk = current.filter((id) => !targetSet.has(id) && !fractured.has(id)); // unwanted & removable → remove
  const missing = targetIds.filter((id) => !currentSet.has(id)); // wanted but not yet present → add
  // A perfect essence adds its guaranteed mod while removing one random mod, so a perfect target can
  // only be placed by sacrificing a junk mod. A desecrated target is added by a Desecration (boss omen)
  // into an open slot — it removes nothing. Everything else is a rolled (normal) add.
  const missingPerfect = missing.filter((id) => resolveMod(data, id).source === 'perfect_essence');
  const missingDesecrated = missing.filter((id) => resolveMod(data, id).source === 'desecrated');
  const missingRollable = missing.filter((id) => {
    const s = resolveMod(data, id).source;
    return s !== 'perfect_essence' && s !== 'desecrated';
  });
  if (missingPerfect.length > junk.length) {
    throw new Error(
      `need ${missingPerfect.length} Perfect Essence(s) but only ${junk.length} spare mod(s) to sacrifice — `
      + 'a Perfect Essence removes one of your existing mods as it adds, so keep a removable (junk) mod per perfect target',
    );
  }

  if (junk.length === 0 && missing.length === 0) {
    const result = evaluatePlanFrom(data, start, []); // already the target — nothing to do
    return {
      frontier: [{ steps: [], result, cost: planExpectedCost(prices, result, []), probability: 1 }],
      plansEvaluated: 1, currencyDepth: 'full',
    };
  }

  // A MAGIC item has to become Rare before it can be exalted, desecrated or perfect-essenced, and a
  // Regal Orb is that transition — it converts to Rare *and* adds one mod, so it is an opener rather
  // than a step in the middle. This planner names the mod every step adds, so a Regal names one too:
  // one opener per rollable target it could land.
  //
  // The empty opener is offered as well, because a target that fits a Magic item (≤1 prefix and ≤1
  // suffix) needs no Regal at all. Nothing here checks which of those applies: an exalt on a Magic
  // item scores 0 in `evaluatePlanFrom` and the plan drops, which is the same "offer it and let
  // evaluation prune" rule the desecrate branch relies on rather than duplicating plan.ts's legality.
  const openers: { steps: PlanStep[]; adds?: string }[] = start.rarity === 'rare'
    ? [{ steps: [] }]
    : [
        { steps: [] },
        ...missingRollable.map((add) => ({
          steps: [{ currency: 'regal' as const, add, minTierIndex: tierOf.get(add) ?? 0 }],
          adds: add,
        })),
      ];

  const bossOk = bossOmenAllowed(start.base.category);
  const sequences: PlanStep[][] = [];
  for (const opener of openers) {
    const rest = opener.adds === undefined ? missingRollable : missingRollable.filter((id) => id !== opener.adds);
    for (const seq of transformSequences(data, junk, rest, missingPerfect, missingDesecrated, tierOf, bossOk)) {
      sequences.push(opener.steps.length > 0 ? [...opener.steps, ...seq] : seq);
    }
  }

  // This loop used to be unbounded and silent: it read nothing from `opts` but `policy`, so the
  // player's Search-effort setting reached it and did nothing, and the progress bar showed no movement
  // for its whole run. The lever is the WALL CLOCK — `maxPlans` selects an orb-strength *depth* in the
  // from-white planner, and there is no depth to select here: `bestLeverAssignments` searches every
  // strength on every step and proves the losers cannot win, rather than trading breadth for time. So
  // `maxMillis` stays absent unless the caller passes it, exactly as the MDP's does, and tests stay
  // deterministic.
  //
  // WHAT CHANGED, AND WHY THE COUNTS MOVED. Each sequence used to be expanded into its omen power set
  // (2^k plans) and every one of them scored. It is now handed to the lever DP, which decides orb
  // strength AND omen for every step in one backward pass. That adds an axis this planner never had —
  // `baseTransforms` sets no `tier`, so every add was a base-strength orb and the badge said so — while
  // evaluating a small fraction of the assignments it now stands for.
  const report = opts.onProgress;
  const stride = Math.max(1, Math.floor(sequences.length / PROGRESS_REPORTS));
  const deadline = opts.maxMillis === undefined ? Infinity : Date.now() + opts.maxMillis;
  const DEADLINE_CHECK = 64; // Date.now() per sequence would be measurable; per 64 is not
  let truncated = false;
  let searched = 0;

  // Candidates carry the DP's OWN cost and probability, which are provisional — it associates the tail
  // products differently from `evaluatePlanFrom`, so they can differ in the last bits. They are good
  // enough to rank with and are never reported: the survivors are re-scored below through the same
  // functions every other planner uses.
  const candidates: LeverCandidate[] = [];
  for (let i = 0; i < sequences.length; i++) {
    // `>=` rather than `>`: it makes a zero budget mean "do nothing" deterministically, which is what
    // makes this testable without a wall-clock race. The 1ms difference is otherwise immaterial, and
    // the app floors the budget well above zero.
    if (deadline !== Infinity && i % DEADLINE_CHECK === 0 && Date.now() >= deadline) {
      truncated = true;
      break;
    }
    const dp = bestLeverAssignments(data, prices, start, sequences[i]!, policy);
    searched += dp.combinations;
    if (dp.capped) truncated = true; // a capped frontier is a SUBSET, and the app must say so
    for (const c of dp.candidates) candidates.push(c);
    // Narrow as we go rather than at the end: a big craft has tens of thousands of sequences, and
    // holding every one's candidates would cost far more memory than the answer is worth.
    if (candidates.length > NARROW_AT) narrowInPlace(candidates);
    if (report && i % stride === 0) report(i, sequences.length);
  }
  report?.(sequences.length, sequences.length);

  // Re-score only what could still reach the frontier. Doing it per sequence instead would spend
  // roughly half the win the DP buys, and buys nothing: a candidate the global filter already beats
  // cannot come back.
  narrowInPlace(candidates);
  const plans = candidates.map((c): ParetoPlan => {
    const result = evaluatePlanFrom(data, start, c.steps);
    return { steps: c.steps, result, cost: planExpectedCost(prices, result, c.steps), probability: result.total };
  });

  return {
    frontier: paretoFrontier(plans),
    // The assignments this search stands for, not the handful it scored — the DP rules the rest out by
    // proof rather than by evaluation, and a count that omitted them would understate the search.
    plansEvaluated: searched,
    // `full`, and earned: every step is offered every strength the sheet prices and the player owns,
    // and an option is dropped only when something at least as likely and no dearer beats it. This
    // read `base-only` for as long as `baseTransforms` set no `tier` — an honest admission then, and
    // the gap it admitted to is the one this closes.
    currencyDepth: 'full',
    ...(truncated ? { truncated: true } : {}),
  };
}

/** Prune past this many held candidates. Amortises the sort without letting memory run away. */
const NARROW_AT = 4_096;

/**
 * Drop the candidates that can no longer reach the frontier, keeping a hair's margin for ties.
 *
 * The margin is the point. Ranking happens on the DP's arithmetic and reporting happens on
 * `evaluatePlanFrom`'s, and the two associate their products differently — so a candidate the DP puts
 * a few ulps behind another may come out ahead once re-scored. Cutting exactly at the DP's numbers
 * would decide those ties with the wrong ruler; `paretoFrontier` decides them afterwards with the
 * right one.
 *
 * In place, because this runs inside the search loop on a list that is mostly kept.
 */
function narrowInPlace(rows: LeverCandidate[]): void {
  rows.sort((a, b) => a.expected - b.expected || b.probability - a.probability);
  let best = 0; // every probability is > 0, so this admits the first row without a special case
  let n = 0;
  for (const r of rows) {
    if (r.probability > best * (1 - 1e-9)) {
      rows[n++] = r;
      if (r.probability > best) best = r.probability;
    }
  }
  rows.length = n;
}
