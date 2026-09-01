// Clean-room analytic optimizer (Phase 2). For the standard "add these mods to a white item" craft,
// the currency at each position is fixed — transmute (1st mod) → augment (2nd) → regal (3rd) →
// exalt (4th+) — so the ONLY free choice is the ORDER in which the desired mods are added. Order
// matters because a step's probability depends on the slot-branch it hits (both-open vs one-side-
// full), so filling one side before adding the other's mods can raise the cumulative probability.
//
// With ≤6 desired mods (≤3 prefixes + ≤3 suffixes) there are ≤6! = 720 orderings — we enumerate ALL
// of them and score each exactly with the engine's evaluatePlan. No heuristic, no beam pruning: the
// returned plan is the true probability-maximising ordering. The search is analytic and exact.

import type { ItemBase, ItemState, PatchData, Rarity } from '../../engine/src/types.ts';
import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';
import { evaluatePlan, evaluatePlanFrom } from '../../engine/src/plan.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { whiteItem } from '../../engine/src/item.ts';
import { ALCHEMY_MOD_COUNT, bossOmenAllowed, desecrationOmenForMod, isEssenceMod } from '../../engine/src/probability.ts';
import type { CostBreakdown, CurrencyPolicy, Prices } from './cost.ts';
import { allowsStep, cheapestEssenceLevel, essenceLevelOf, planExpectedCost, pricesForBase } from './cost.ts';
import { combinations, permutations } from './combinatorics.ts';
import { expandSlots, itemLegalCombinations } from './slots.ts';
import type { LeverCandidate } from './leverDp.ts';
import { searchSkeletons } from './leverDp.ts';

// The from-item planner (optimizeFromItem) lives in ./fromItem.ts and imports withOmenVariants +
// paretoFrontier from here — so those two are exported below. This file owns the from-white optimizers.

export type AddCurrency = 'transmute' | 'augment' | 'regal' | 'exalt';

/** The add-chain currency used for the mod at 0-based position `pos`. */
export function currencyAtPosition(pos: number): AddCurrency {
  return pos === 0 ? 'transmute' : pos === 1 ? 'augment' : pos === 2 ? 'regal' : 'exalt';
}

/**
 * The currency for a random add given the item's current (rarity, mod count) — state-driven so it
 * stays correct when essence steps (which jump the item to rare) are interleaved:
 *   normal → transmute; magic w/1 mod → augment; magic w/2+ → regal; rare → exalt.
 */
function nextAddCurrency(rarity: Rarity, modCount: number): AddCurrency {
  if (rarity === 'normal') return 'transmute';
  if (rarity === 'magic') return modCount <= 1 ? 'augment' : 'regal';
  return 'exalt';
}

export interface OptimizedPlan {
  readonly steps: readonly PlanStep[];
  readonly result: PlanResult;
}

export interface OptimizeOptions {
  /** Item level (tier ilvl cap). Default 100. */
  level?: number;
  /** Return only the best N plans (sorted by cumulative probability, descending). Default: all. */
  topN?: number;
  /**
   * Desired mods to obtain via a guaranteed essence (P=1 forced add) instead of a random roll. Each
   * still occupies its slot, so it shifts the probabilities of the remaining random rolls. Without a
   * cost model, essences are strictly better on probability — so which mods to guarantee is the
   * caller's (cost-driven) choice, and the optimizer just finds the best ordering around them.
   */
  essences?: readonly string[];
}

/**
 * Find the crafting sequence(s) maximising the cumulative probability of ending with exactly
 * `desiredModIds` on `base`. Mods listed in `opts.essences` are guaranteed via essence (P=1); the
 * rest are rolled with the state-appropriate currency (transmute→augment→regal→exalt). Every ordering
 * is enumerated and scored with evaluatePlan; the returned list is sorted best-first. Throws if the
 * target is impossible (>3 prefixes, >3 suffixes, or a rolled mod not in the base's normal pool).
 */
export function optimizePlan(
  data: PatchData, base: ItemBase, desiredModIds: readonly string[], opts: OptimizeOptions = {},
): OptimizedPlan[] {
  const essences = new Set(opts.essences ?? []);
  validateTarget(data, base, desiredModIds, essences);
  const level = opts.level ?? 100;

  const plans: OptimizedPlan[] = permutations(desiredModIds).map((perm) => {
    const steps = buildSteps(data, perm, essences);
    return { steps, result: evaluatePlan(data, base, steps, level) };
  });
  plans.sort((a, b) => b.result.total - a.result.total);
  return opts.topN !== undefined ? plans.slice(0, opts.topN) : plans;
}

/** Back-compat: optimise a pure add-chain target (no essences). */
export function optimizeAddChain(
  data: PatchData, base: ItemBase, desiredModIds: readonly string[], opts: OptimizeOptions = {},
): OptimizedPlan[] {
  return optimizePlan(data, base, desiredModIds, opts);
}

export interface CostedPlan extends OptimizedPlan {
  readonly cost: CostBreakdown;
}

export interface OptimizeCostOptions {
  level?: number;
  topN?: number;
  /**
   * Mods that MAY be guaranteed via a regular essence. The optimizer tries the no-essence plan plus
   * one plan per candidate (each guaranteeing that single mod), and ranks everything by expected
   * cost — so it decides *whether* an essence is worth its price rather than always taking it.
   */
  essenceCandidates?: readonly string[];
}

/**
 * Rank crafting plans by **expected cost** (cheapest first) using `prices`. Explores every mod
 * ordering and every essence configuration (no essence, or any single `essenceCandidate` guaranteed),
 * scoring each with evaluatePlan + the restart-on-first-failure cost model. This is where "essence
 * vs roll" is actually decided: a guaranteed mod removes a random factor (fewer restarts) but costs
 * more per attempt, so the winner depends on the price sheet.
 */
export function optimizeCost(
  data: PatchData, prices: Prices, base: ItemBase, desiredModIds: readonly string[], opts: OptimizeCostOptions = {},
): CostedPlan[] {
  const level = opts.level ?? 100;
  const candidates = (opts.essenceCandidates ?? []).filter((id) => desiredModIds.includes(id));
  const configs: string[][] = [[], ...candidates.map((id) => [id])];

  const plans: CostedPlan[] = [];
  for (const essences of configs) {
    for (const plan of optimizePlan(data, base, desiredModIds, { level, essences })) {
      plans.push({ ...plan, cost: planExpectedCost(prices, plan.result, plan.steps) });
    }
  }
  plans.sort((a, b) => a.cost.expected - b.cost.expected);
  return opts.topN !== undefined ? plans.slice(0, opts.topN) : plans;
}

/** Turn one ordering into concrete plan steps, choosing each roll's currency from the running state. */
function buildSteps(data: PatchData, order: readonly string[], essences: ReadonlySet<string>): PlanStep[] {
  const steps: PlanStep[] = [];
  let rarity: Rarity = 'normal';
  let modCount = 0;
  for (const id of order) {
    if (essences.has(id)) {
      steps.push({ currency: 'essence', add: id });
      rarity = 'rare';
    } else {
      const currency = nextAddCurrency(rarity, modCount);
      steps.push({ currency, add: id });
      if (currency === 'transmute') rarity = 'magic';
      else if (currency === 'regal') rarity = 'rare';
    }
    modCount++;
  }
  return steps;
}

// ── Tier-targeted Pareto optimizer ────────────────────────────────────────────────────────────
// Widens the search to per-mod TARGET TIERS and per-step CURRENCY TIER (orb strength), then returns
// the (expected cost ↔ success probability) Pareto frontier: the cheapest path, the surest path, and
// the non-dominated trade-offs between. A stronger orb raises the ilvl floor → shrinks the pool →
// higher probability at higher cost, which is exactly the trade-off the frontier surfaces.

/** A desired mod plus how good a tier you want it at (0 = any tier; higher index = that tier or better). */
export interface TierTarget {
  readonly modId: string;
  readonly minTierIndex?: number;
  /**
   * Which SLOT of the finished item this mod satisfies. Targets sharing a slot are alternatives — any
   * one of them fills it ("I'll take Extra Cold or Extra Lightning, I don't care which"), so the
   * candidate list can be longer than the six mods an item holds.
   *
   * Absent means "a slot of its own", which is what every caller meant before slots existed: with no
   * `slot` anywhere, each target is its own slot and every planner behaves exactly as it always has.
   * That is why this is one optional field on the existing type rather than a new nested shape — there
   * is no second code path to keep in step, and no signature to change.
   *
   * Members of a slot must sit on the same side; a slot spanning prefix and suffix would make the
   * 3-per-side accounting ambiguous. Two members MAY share a family (that is the mutually-exclusive
   * case, and the common one), but two different slots may not.
   */
  readonly slot?: number;
}

export interface ParetoPlan extends CostedPlan {
  /** Success probability of this exact plan (= result.total). */
  readonly probability: number;
}

export interface ParetoResult {
  /** Non-dominated plans, cheapest-first (probability rises along the frontier). */
  readonly frontier: readonly ParetoPlan[];
  /**
   * How many plans the search stands for. NOT how many it scored: the lever DP proves most assignments
   * cannot win rather than evaluating them, and a count that left those out would understate the
   * search rather than describe it.
   */
  readonly plansEvaluated: number;
  /** True when a cap (plans or wall clock) stopped the search before it had seen everything. */
  readonly truncated?: boolean;
}

export interface OptimizeParetoOptions {
  level?: number;
  /**
   * Wall-clock ceiling. Absent by default and absent in tests, so results stay deterministic and
   * machine-independent — only the app sets it, exactly as the MDP's `maxMillis` works. Hitting it
   * sets `truncated`.
   *
   * This is now the ONLY throttle on either step planner. `maxPlans` used to sit beside it and chose a
   * coarser orb-strength DEPTH when the estimated plan count got large; the lever DP removed the
   * product it was rationing, so there is no depth left to trade and the option was deleted rather
   * than left on the effort ladder doing nothing. It had also never been read on this path at all —
   * `maxMillis` was declared here and used by no code until the same change.
   */
  maxMillis?: number;
  /**
   * Called as plan sequences are evaluated, so a UI can show progress. Unlike the budget search's node
   * cap, `total` here is the real count — every ordering × orb assignment is known before evaluation
   * starts — so the fraction is exact rather than an upper bound.
   *
   * A plain callback, so this file stays pure.
   */
  onProgress?: (done: number, total: number) => void;
  /** Currencies the player doesn't have; no returned plan may use one. */
  policy?: CurrencyPolicy;
}

/**
 * Build the step SKELETONS for one ordering and the essence/desecrated/perfect sets — which mods, in
 * which order, by which currency, and nothing about orb strength or omens (those are levers, decided
 * per step by `leverOptions`). Returns a LIST because a perfect-essence target branches: a Perfect Essence adds its mod
 * while eating one already on the item, and which mod it eats is a real choice the search must make.
 * Every other case yields exactly one sequence.
 */
function buildParetoSteps(
  data: PatchData, order: readonly string[], essences: ReadonlySet<string>, desecrated: ReadonlySet<string>,
  perfects: ReadonlySet<string>,
  tierOf: Map<string, number>,
  /** Essence level per essence-only target — see `cheapestEssenceLevel`. */
  essenceTierOf: ReadonlyMap<string, number>,
  /** False on armour, where a Desecration can't be boss-targeted at all — see `bossOmenAllowed`. */
  bossOk: boolean,
): PlanStep[][] {
  const steps: PlanStep[] = [];
  /** Targets placed so far — the candidate victims for a Perfect Essence. */
  const placed: string[] = [];
  let rarity: Rarity = 'normal';
  let modCount = 0;
  // No `tier`: this builds a SKELETON, and the orb strength on it is `leverOptions`' to decide.
  const addStep = (id: string): PlanStep =>
    ({ currency: nextAddCurrency(rarity, modCount), add: id, minTierIndex: tierOf.get(id) ?? 0 });

  for (let k = 0; k < order.length; k++) {
    const id = order[k]!;
    const minTierIndex = tierOf.get(id) ?? 0;
    if (perfects.has(id)) {
      // A Perfect Essence works on a RARE item and is a SWAP: it forces its own mod on (deterministic)
      // while removing one existing mod uniformly at random. From white every mod on the item is one we
      // wanted, so the essence necessarily eats a target — and the plan re-adds it with an Exalt right
      // after. Which mod to sacrifice is the branch: prefer the one that is cheapest to roll again, a
      // judgement the frontier makes by scoring all of them.
      //
      // An ordering that reaches this before the item is Rare, or where the slots don't work out,
      // scores 0 in evaluatePlan and drops out — the same "offer it and let evaluation prune" rule the
      // desecrate branch relies on, rather than duplicating plan.ts's legality logic here.
      if (placed.length === 0) return []; // nothing to eat: no legal sequence from this ordering
      const rest = order.slice(k + 1);
      return placed.map((victim) => {
        const tail: PlanStep[] = [
          { currency: 'perfect-essence', add: id, remove: victim },
          // Re-add the sacrificed target. The item is Rare by now, so this is always an Exalt.
          { currency: 'exalt', add: victim, minTierIndex: tierOf.get(victim) ?? 0 },
        ];
        // After swap + re-add the item holds exactly what it would have with a plain add of `id`, so
        // the remainder of the ordering continues on unchanged state.
        const after = buildParetoSteps(data, rest, essences, desecrated, perfects, tierOf, essenceTierOf, bossOk);
        // `rest` can contain no further perfect target (one essence modifier per item), so `after` has
        // exactly one element — but map over it rather than assuming, so a future second branch can't
        // silently drop sequences.
        return after.map((tailSteps) => [...steps, ...tail, ...tailSteps]);
      }).flat();
    }
    if (essences.has(id)) {
      // Essence-only mod: guaranteed (P=1) by an essence at the chosen level (its tier index).
      const mod = resolveMod(data, id);
      // Not `clamp(minTierIndex)`: any level at or above it satisfies the target and rolls better, and
      // the sheet is not monotone in level (Abrasion: Lesser 116ex, Greater 0.81ex). See cost.ts.
      const essenceTier = essenceTierOf.get(id) ?? Math.max(0, Math.min(mod.tiers.length - 1, minTierIndex));
      steps.push({ currency: 'essence', add: id, essenceTier, essenceLevel: essenceLevelOf(mod.tiers[essenceTier]?.name) });
      rarity = 'rare';
    } else if (desecrated.has(id)) {
      // Desecrated mod: a Desecration constrained to the mod's boss (the omen that targets it). It needs
      // a RARE item, so any ordering that reaches it before the item is rare scores 0 at evaluation and
      // drops — the surviving plans put the desecration after the add-chain's regal. Rarity is unchanged.
      // Boss targeting is a "Weapon or Jewellery" omen — unavailable on armour, where the desecration
      // instead draws from the whole pool. Offering it there would plan a step the game refuses.
      const omen = bossOk ? desecrationOmenForMod(resolveMod(data, id)) : undefined;
      steps.push(omen ? { currency: 'desecrate', add: id, boss: omen } : { currency: 'desecrate', add: id });
    } else {
      const step = addStep(id);
      steps.push(step);
      if (step.currency === 'transmute') rarity = 'magic';
      else if (step.currency === 'regal') rarity = 'rare';
    }
    placed.push(id);
    modCount++;
  }
  return [steps];
}

/**
 * Alchemy-opener base sequences: an Orb of Alchemy turns a white item Rare with 4 mods at once, then
 * the remaining targets are exalted on top. Alchemy has no tier control (any tier), so only targets
 * with no tier requirement can be alchemy-supplied — this fires only when ≥4 targets are "any tier".
 * For each choice of which 4 go to alchemy (a legal ≤3-per-side split) we permute the exalt tail; the
 * tail's orb strengths and side omens are levers, decided per step by `leverOptions`. Yields
 * nothing when alchemy can't legally open (fewer than 4 any-tier mods) — the caller also skips it when
 * the plan uses an essence (an essence needs the Magic→Rare path; alchemy goes straight to Rare).
 */
function alchemyOpenerSequences(
  data: PatchData, modIds: readonly string[], tierOf: Map<string, number>,
): PlanStep[][] {
  if (modIds.length < ALCHEMY_MOD_COUNT) return [];
  const anyTier = modIds.filter((id) => (tierOf.get(id) ?? 0) === 0);
  if (anyTier.length < ALCHEMY_MOD_COUNT) return [];
  const out: PlanStep[][] = [];
  for (const four of combinations(anyTier, ALCHEMY_MOD_COUNT)) {
    let pre = 0;
    let suf = 0;
    for (const id of four) (resolveMod(data, id).type === 'prefix' ? pre++ : suf++);
    if (pre > 3 || suf > 3) continue; // alchemy places at most 3 per side
    const fourSet = new Set(four);
    const rest = modIds.filter((id) => !fourSet.has(id));
    for (const order of permutations(rest)) {
      const steps: PlanStep[] = [{ currency: 'alchemy', adds: four }];
      for (const id of order) steps.push({ currency: 'exalt', add: id, minTierIndex: tierOf.get(id) ?? 0 });
      out.push(steps);
    }
  }
  return out;
}

/** Keep only non-dominated plans (min cost, max probability), cheapest-first. Exported for fromItem.ts. */
export function paretoFrontier(plans: ParetoPlan[]): ParetoPlan[] {
  const valid = plans.filter((p) => Number.isFinite(p.cost.expected) && p.probability > 0);
  valid.sort((a, b) => a.cost.expected - b.cost.expected || b.probability - a.probability);
  const front: ParetoPlan[] = [];
  let bestProb = -Infinity;
  for (const p of valid) {
    if (p.probability > bestProb + 1e-12) { // strictly surer than anything cheaper → on the frontier
      front.push(p);
      bestProb = p.probability;
    }
  }
  return front;
}

/**
 * Compute the (expected cost ↔ success probability) Pareto frontier for a tier-targeted craft.
 * Explores every mod ordering × per-step orb strength × per-exalt side-omen, scoring each with
 * evaluatePlan + the restart cost model. The orb-strength search is throttled (and the depth reported)
 * for very large targets so it never blows up silently.
 *
 * OMENS: each exalt step may be side-constrained (Sinistral/Dextral Exaltation) — higher probability
 * for the omen surcharge — so the frontier surfaces "slam raw vs pay for a guaranteed side".
 *
 * ESSENCES: a target whose mod is essence-only (`source: 'essence'`) is guaranteed by an essence at
 * the chosen level (its target tier picks Lesser/Normal/Greater → real value, ilvl gate, and price).
 * A regular essence needs a Magic item and turns it Rare, so at most ONE essence-only mod is allowed
 * and the target must also include a rollable mod (the Magic base the essence lands on).
 */
export function optimizePareto(
  data: PatchData, rawPrices: Prices, base: ItemBase, targets: readonly TierTarget[], opts: OptimizeParetoOptions = {},
): ParetoResult {
  /*
   * A slot with alternatives becomes one concrete craft per member, and the frontiers merge.
   *
   * A plan here is a FIXED SEQUENCE — every step names the mod it is aimed at — so it has to commit to
   * one member, and a route that pretended otherwise would be unrunnable. Expanding also keeps the
   * factorial in check: this search permutes its target list, so nine candidates in one list is
   * 9! = 362,880 orderings where three expansions of six are 3 x 720.
   *
   * The MDP does NOT do this, and must not: see slots.ts. There, "either will do" is the answer.
   */
  const combos = itemLegalCombinations(expandSlots(targets),
    (id) => resolveMod(data, id).source === 'desecrated');
  const one = (t: readonly TierTarget[], onProgress?: (d: number, n: number) => void): ParetoResult =>
    paretoForOneCraft(data, rawPrices, base, t, { ...opts, ...(onProgress ? { onProgress } : {}) });
  if (combos.length > 1) return mergeParetoRuns(combos, one, opts.onProgress);
  return one(combos[0] ?? targets);
}

/** Progress subdivisions given to each expansion, so one bar spans the whole merged search. */
const COMBO_TICKS = 100;

/**
 * Run one expansion per slot combination and merge the frontiers into one.
 *
 * Shared by the from-white and from-item planners, which differ only in `run` — the merge itself is
 * the same question either way: of every route that satisfies the slots, which are worth listing?
 */
export function mergeParetoRuns(
  combos: readonly (readonly TierTarget[])[],
  run: (targets: readonly TierTarget[], onProgress?: (done: number, total: number) => void) => ParetoResult,
  report?: (done: number, total: number) => void,
): ParetoResult {
  const all: ParetoPlan[] = [];
  let plansEvaluated = 0;
  let truncated = false;
  const ticks = combos.length * COMBO_TICKS;
  for (let c = 0; c < combos.length; c++) {
    const sub = report
      ? (done: number, total: number) =>
        report(c * COMBO_TICKS + Math.round((COMBO_TICKS * done) / Math.max(1, total)), ticks)
      : undefined;
    const r = run(combos[c]!, sub);
    all.push(...r.frontier);
    plansEvaluated += r.plansEvaluated;
    // The merged result must report the SHALLOWEST orb search any expansion settled for — claiming
    // 'full' because one cheap expansion managed it would overstate every other route on the frontier.
    if (r.truncated) truncated = true;
  }
  report?.(ticks, ticks);
  // Re-run the dominance filter across the union: a route chasing one member routinely dominates a
  // whole expansion's frontier, and leaving those in would list plans nobody should ever run.
  return {
    frontier: paretoFrontier(all), plansEvaluated, ...(truncated ? { truncated: true } : {}),
  };
}

function paretoForOneCraft(
  data: PatchData, rawPrices: Prices, base: ItemBase, targets: readonly TierTarget[], opts: OptimizeParetoOptions,
): ParetoResult {
  const level = opts.level ?? 100;
  // A Desecration's bone depends on the gear, so resolve the sheet for this base up front.
  const prices = pricesForBase(rawPrices, base);
  const modIds = targets.map((t) => t.modId);
  // Essence-only mods arrive via an essence; desecrated mods via a Desecration (boss omen); everything
  // else is rolled with the add-chain currency. Essence and desecrated mods carry no orb-strength axis.
  const essences = modIds.filter((id) => resolveMod(data, id).source === 'essence');
  const essSet = new Set(essences);
  const desecrated = modIds.filter((id) => resolveMod(data, id).source === 'desecrated');
  const desSet = new Set(desecrated);
  // A Perfect Essence forces its mod onto a Rare while eating one already there — its own axis, with
  // no orb-strength choice (a perfect essence has exactly one level).
  const perfect = modIds.filter((id) => resolveMod(data, id).source === 'perfect_essence');
  const perfSet = new Set(perfect);
  const rolled = modIds.filter((id) => !essSet.has(id) && !desSet.has(id) && !perfSet.has(id));
  // An item carries at most ONE essence modifier, regular or perfect — see `isEssenceMod`. Counting
  // only `source: 'essence'` here enforced the rule on half the mods it covers.
  if (modIds.filter((id) => isEssenceMod(resolveMod(data, id))).length > 1) {
    throw new Error('an item can hold at most one essence modifier (regular or perfect) — pick one');
  }
  // Checked BEFORE the shape validation: "you picked two essences" is the useful message, and the
  // shape check would otherwise reject a perfect-essence mod first for not being in the normal pool.
  validateTargetShape(data, base, modIds, essSet, true);
  // The Desecration mechanic places a single carved mod — an item can hold at most one desecrated mod.
  if (desecrated.length > 1) {
    throw new Error('an item can hold at most one desecrated mod');
  }
  if (essences.length >= 1 && rolled.length < 1) {
    throw new Error('an essence-only mod needs a Magic item first — include at least one rollable mod in the target');
  }
  const tierOf = new Map(targets.map((t) => [t.modId, t.minTierIndex ?? 0]));
  /**
   * Which essence LEVEL each essence-only target is bought at — resolved once per craft, not per
   * ordering. `buildParetoSteps` runs for every permutation the search tries (thousands), and this
   * choice depends on nothing the ordering changes.
   */
  const essenceTierOf = new Map([...essSet].map((id) => {
    const mod = resolveMod(data, id);
    return [id, cheapestEssenceLevel(prices, mod, tierOf.get(id) ?? 0, level)] as const;
  }));

  // (1) Add-chain / essence / desecration / perfect-essence openers: every mod ordering. A
  // perfect-essence target yields several skeletons per ordering (one per sacrificed mod), so this
  // spreads rather than pushes.
  //
  // This used to be `permutations x orbAssignments`, then each result expanded into its omen power
  // set — a `K! x Π|strengths| x 2^omens` product, throttled by picking a coarser orb-strength DEPTH
  // when the estimate exceeded `maxPlans`. The lever DP replaced all of it: orb strength and omens are
  // decided per step, against a state the skeleton already fixes, so what is enumerated here is the
  // orderings alone. There is no depth to report any more, which is why `CurrencyDepth` is gone: the
  // throttle's own `full` was a claim about the ladder rung rather than about what was searched, and
  // `legalOrbTiers` was quietly suppressing the whole axis for any-tier targets while it said so.
  const skeletons: PlanStep[][] = [];
  for (const order of permutations(modIds)) {
    skeletons.push(
      ...buildParetoSteps(data, order, essSet, desSet, perfSet, tierOf, essenceTierOf, bossOmenAllowed(base.category)),
    );
  }
  // (2) Orb of Alchemy opener — a cheap, low-probability frontier point the add-chain can't produce
  // (4 mods slammed at once, the rest exalted). Not combinable with an essence (Magic→Rare) or a
  // desecration (alchemy lands 4 normal mods; the desecrated ones would need a separate Desecration).
  if (essences.length === 0 && desecrated.length === 0) {
    for (const seq of alchemyOpenerSequences(data, modIds, tierOf)) skeletons.push(seq);
  }

  const white = whiteItem(base, level);
  const found = searchSkeletons(data, prices, white, skeletons, {
    ...(opts.policy ? { policy: opts.policy } : {}),
    ...(opts.maxMillis === undefined ? {} : { maxMillis: opts.maxMillis }),
    ...(opts.onProgress ? { onProgress: opts.onProgress } : {}),
  });

  // Re-scored through the canonical evaluator: the DP only RANKS, and its own arithmetic associates
  // the products differently, so nothing it computes is ever reported.
  const plans = found.candidates.map((c: LeverCandidate): ParetoPlan => {
    const result = evaluatePlanFrom(data, white, c.steps);
    return { steps: c.steps, result, cost: planExpectedCost(prices, result, c.steps), probability: result.total };
  });
  return {
    frontier: paretoFrontier(plans),
    plansEvaluated: found.searched,
    ...(found.truncated ? { truncated: true } : {}),
  };
}

/**
 * Validate the target SHAPE: 1–6 mods, ≤3 prefixes, ≤3 suffixes, and every rolled (non-essence-
 * candidate) mod is in the base's normal pool. `essenceCandidates` are the mods that MAY be forced by
 * an essence — they're allowed to be off-pool. Per-plan essence rules (≤1 used, ≥1 rolled) are the
 * caller's business (they hold by construction in the Pareto search's essence configs).
 */
function validateTargetShape(
  data: PatchData, base: ItemBase, desiredModIds: readonly string[], essenceCandidates: ReadonlySet<string>,
  allowDesecrated = false,
): void {
  if (desiredModIds.length === 0) throw new Error('no desired mods');
  if (desiredModIds.length > 6) throw new Error(`target has ${desiredModIds.length} mods (max 6)`);
  let prefixes = 0;
  let suffixes = 0;
  const pool = base.pools.normal;
  const des = base.pools.desecrated;
  const ess = base.pools.essence;
  for (const id of desiredModIds) {
    const mod = resolveMod(data, id); // throws if unknown
    const inNormal = mod.source === 'normal' && (pool.prefixes.includes(id) || pool.suffixes.includes(id));
    // A desecrated target is craftable from white too (make the rare, then Desecrate) — legal when it's
    // in the base's desecrated pool and carries a boss omen. Gated behind `allowDesecrated` so the older
    // add-chain-only planners (optimizePlan/optimizeCost, whose buildSteps can't desecrate) still reject it.
    const inDesecrated = allowDesecrated && mod.source === 'desecrated'
      && (des.prefixes.includes(id) || des.suffixes.includes(id)) && desecrationOmenForMod(mod) !== undefined;
    // A perfect-essence target is craftable from white by the same shape: build the Rare, then apply
    // the Perfect Essence, which adds this mod while eating one already on the item. Shares the
    // `allowDesecrated` gate because both are "reachable only once the item is Rare", which is exactly
    // what the older add-chain-only planners cannot express.
    const inPerfect = allowDesecrated && mod.source === 'perfect_essence'
      && (ess.prefixes.includes(id) || ess.suffixes.includes(id));
    if (!essenceCandidates.has(id) && !inNormal && !inDesecrated && !inPerfect) {
      throw new Error(`mod ${id} is not in ${base.id}'s normal pool (mark it as an essence to force it)`);
    }
    if (mod.type === 'prefix') prefixes++;
    else suffixes++;
  }
  if (prefixes > 3) throw new Error(`target has ${prefixes} prefixes (max 3)`);
  if (suffixes > 3) throw new Error(`target has ${suffixes} suffixes (max 3)`);
}

/** Full validation for a SINGLE plan config: shape plus the per-plan essence rules. */
function validateTarget(
  data: PatchData, base: ItemBase, desiredModIds: readonly string[], essences: ReadonlySet<string>,
): void {
  validateTargetShape(data, base, desiredModIds, essences); // empty / too many / slots / pool first
  // A regular essence needs a Magic item and turns it Rare, so there is exactly one Magic→Rare
  // transition to spend: at most one essence-guaranteed mod, and at least one rolled mod must precede it.
  if (essences.size > 1) throw new Error('at most one regular essence per craft (each needs a Magic item and turns it Rare)');
  if (essences.size >= desiredModIds.length) throw new Error('a regular essence needs a Magic item, so at least one rolled (non-essence) mod must precede it');
}
