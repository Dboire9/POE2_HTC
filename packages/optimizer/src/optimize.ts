// Clean-room analytic optimizer (Phase 2). For the standard "add these mods to a white item" craft,
// the currency at each position is fixed — transmute (1st mod) → augment (2nd) → regal (3rd) →
// exalt (4th+) — so the ONLY free choice is the ORDER in which the desired mods are added. Order
// matters because a step's probability depends on the slot-branch it hits (both-open vs one-side-
// full), so filling one side before adding the other's mods can raise the cumulative probability.
//
// With ≤6 desired mods (≤3 prefixes + ≤3 suffixes) there are ≤6! = 720 orderings — we enumerate ALL
// of them and score each exactly with the engine's evaluatePlan. No heuristic, no beam pruning: the
// returned plan is the true probability-maximising ordering. The search is analytic and exact.

import type { CurrencyTier, ItemBase, PatchData, Rarity } from '../../engine/src/types.ts';
import { CURRENCY_FLOOR } from '../../engine/src/types.ts';
import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';
import { evaluatePlan } from '../../engine/src/plan.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { ALCHEMY_MOD_COUNT, desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { CostBreakdown, Prices } from './cost.ts';
import { planExpectedCost } from './cost.ts';
import { combinations, factorial, permutations } from './combinatorics.ts';

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
}

export interface ParetoPlan extends CostedPlan {
  /** Success probability of this exact plan (= result.total). */
  readonly probability: number;
}

/** How deep the currency-tier (orb strength) search went — reported, never silently truncated. */
export type CurrencyDepth = 'full' | 'base+strongest' | 'strongest-only';

export interface ParetoResult {
  /** Non-dominated plans, cheapest-first (probability rises along the frontier). */
  readonly frontier: readonly ParetoPlan[];
  readonly plansEvaluated: number;
  /** The orb-strength search depth actually used (throttled down for very large targets). */
  readonly currencyDepth: CurrencyDepth;
}

export interface OptimizeParetoOptions {
  level?: number;
  /** Throttle the currency-tier search once the estimated plan count exceeds this. Default 100000. */
  maxPlans?: number;
}

const ORB_TIERS: readonly CurrencyTier[] = ['base', 'greater', 'perfect'];

/** Orb strengths that can still hit `modId` at tier `minTierIndex` on a `level` item (floor ≤ target ilvl). */
function legalOrbTiers(data: PatchData, modId: string, minTierIndex: number, level: number): CurrencyTier[] {
  const mod = resolveMod(data, modId);
  const t = mod.tiers[minTierIndex] ?? mod.tiers[0];
  const targetIlvl = Math.min(t ? t.ilvl : 0, level);
  const legal = ORB_TIERS.filter((ct) => CURRENCY_FLOOR[ct] <= targetIlvl);
  return legal.length > 0 ? legal : ['base'];
}

function reduceOrbTiers(legal: CurrencyTier[], depth: CurrencyDepth): CurrencyTier[] {
  if (depth === 'full' || legal.length <= 1) return legal;
  const strongest = legal[legal.length - 1]!;
  return depth === 'strongest-only' ? [strongest] : ['base', strongest];
}

/** Cartesian product of each rolled mod's allowed orb tiers → a list of {modId → orb tier} assignments. */
function orbAssignments(rolled: readonly string[], legal: Map<string, CurrencyTier[]>): Map<string, CurrencyTier>[] {
  let acc: Map<string, CurrencyTier>[] = [new Map()];
  for (const id of rolled) {
    const tiers = legal.get(id)!;
    const next: Map<string, CurrencyTier>[] = [];
    for (const partial of acc) for (const t of tiers) next.push(new Map(partial).set(id, t));
    acc = next;
  }
  return acc;
}

/** An essence mod's level (its tiers ARE Lesser/Normal/Greater), read from the tier name for pricing. */
function essenceLevelOf(tierName: string | undefined): string {
  const n = (tierName ?? '').toLowerCase();
  if (n.startsWith('lesser')) return 'lesser';
  if (n.startsWith('greater')) return 'greater';
  return 'normal';
}

/** Build steps for one ordering, essence set, desecrated set, target-tier map and orb-tier assignment. */
function buildParetoSteps(
  data: PatchData, order: readonly string[], essences: ReadonlySet<string>, desecrated: ReadonlySet<string>,
  tierOf: Map<string, number>, orbOf: Map<string, CurrencyTier>,
): PlanStep[] {
  const steps: PlanStep[] = [];
  let rarity: Rarity = 'normal';
  let modCount = 0;
  for (const id of order) {
    const minTierIndex = tierOf.get(id) ?? 0;
    if (essences.has(id)) {
      // Essence-only mod: guaranteed (P=1) by an essence at the chosen level (its tier index).
      const mod = resolveMod(data, id);
      const essenceTier = Math.max(0, Math.min(mod.tiers.length - 1, minTierIndex));
      steps.push({ currency: 'essence', add: id, essenceTier, essenceLevel: essenceLevelOf(mod.tiers[essenceTier]?.name) });
      rarity = 'rare';
    } else if (desecrated.has(id)) {
      // Desecrated mod: a Desecration constrained to the mod's boss (the omen that targets it). It needs
      // a RARE item, so any ordering that reaches it before the item is rare scores 0 at evaluation and
      // drops — the surviving plans put the desecration after the add-chain's regal. Rarity is unchanged.
      const omen = desecrationOmenForMod(resolveMod(data, id));
      steps.push(omen ? { currency: 'desecrate', add: id, boss: omen } : { currency: 'desecrate', add: id });
    } else {
      const currency = nextAddCurrency(rarity, modCount);
      steps.push({ currency, add: id, minTierIndex, tier: orbOf.get(id) ?? 'base' });
      if (currency === 'transmute') rarity = 'magic';
      else if (currency === 'regal') rarity = 'rare';
    }
    modCount++;
  }
  return steps;
}

/**
 * Alchemy-opener base sequences: an Orb of Alchemy turns a white item Rare with 4 mods at once, then
 * the remaining targets are exalted on top. Alchemy has no tier control (any tier), so only targets
 * with no tier requirement can be alchemy-supplied — this fires only when ≥4 targets are "any tier".
 * For each choice of which 4 go to alchemy (a legal ≤3-per-side split) we permute the exalt tail and
 * assign its orb strengths; per-exalt side omens are layered on downstream by withOmenVariants. Yields
 * nothing when alchemy can't legally open (fewer than 4 any-tier mods) — the caller also skips it when
 * the plan uses an essence (an essence needs the Magic→Rare path; alchemy goes straight to Rare).
 */
function alchemyOpenerSequences(
  data: PatchData, modIds: readonly string[], tierOf: Map<string, number>, legal: Map<string, CurrencyTier[]>,
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
    const restOrbs = orbAssignments(rest, legal);
    for (const order of permutations(rest)) {
      for (const orbOf of restOrbs) {
        const steps: PlanStep[] = [{ currency: 'alchemy', adds: four }];
        for (const id of order) {
          steps.push({ currency: 'exalt', add: id, minTierIndex: tierOf.get(id) ?? 0, tier: orbOf.get(id) ?? 'base' });
        }
        out.push(steps);
      }
    }
  }
  return out;
}

/**
 * All ways to side-constrain (Sinistral/Dextral Exaltation) a subset of the plan's EXALT steps.
 * Constraining an exalt to the added mod's side shrinks the pool it can roll from → higher probability,
 * at the omen surcharge — a real cost↔probability lever. A from-white chain has ≤ K−2 exalts, so the
 * 2^n subset enumeration stays tiny. Exported for the from-item planner (fromItem.ts).
 */
export function withOmenVariants(data: PatchData, steps: PlanStep[]): PlanStep[][] {
  // Steps that can take an optional side-omen as a cost↔probability lever: an EXALT constrains the
  // ADD to its mod's side (Sinistral/Dextral Exaltation → smaller pool, higher P); a PERFECT-ESSENCE
  // constrains the random REMOVAL to the sacrificed mod's side (Sinistral/Dextral Crystallisation →
  // likelier to hit the intended junk). Enumerate every subset of these to constrain.
  const idx = steps.map((s, i) => (s.currency === 'exalt' || s.currency === 'perfect-essence' ? i : -1)).filter((i) => i >= 0);
  const variants: PlanStep[][] = [];
  for (let mask = 0; mask < (1 << idx.length); mask++) {
    variants.push(steps.map((s, i) => {
      const bit = idx.indexOf(i);
      if (bit < 0 || !(mask & (1 << bit))) return s;
      if (s.currency === 'exalt') return { ...s, constrainTo: resolveMod(data, s.add).type };
      if (s.currency === 'perfect-essence') return { ...s, omen: resolveMod(data, s.remove).type === 'prefix' ? 'sinistral' : 'dextral' };
      return s;
    }));
  }
  return variants;
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
  data: PatchData, prices: Prices, base: ItemBase, targets: readonly TierTarget[], opts: OptimizeParetoOptions = {},
): ParetoResult {
  const level = opts.level ?? 100;
  const modIds = targets.map((t) => t.modId);
  // Essence-only mods arrive via an essence; desecrated mods via a Desecration (boss omen); everything
  // else is rolled with the add-chain currency. Essence and desecrated mods carry no orb-strength axis.
  const essences = modIds.filter((id) => resolveMod(data, id).source === 'essence');
  const essSet = new Set(essences);
  const desecrated = modIds.filter((id) => resolveMod(data, id).source === 'desecrated');
  const desSet = new Set(desecrated);
  const rolled = modIds.filter((id) => !essSet.has(id) && !desSet.has(id));
  validateTargetShape(data, base, modIds, essSet, true);
  // The Desecration mechanic places a single carved mod — an item can hold at most one desecrated mod.
  if (desecrated.length > 1) {
    throw new Error('an item can hold at most one desecrated mod');
  }
  if (essences.length > 1) {
    throw new Error('at most one essence-only mod per craft (a regular essence needs a Magic item and turns it Rare)');
  }
  if (essences.length >= 1 && rolled.length < 1) {
    throw new Error('an essence-only mod needs a Magic item first — include at least one rollable mod in the target');
  }
  const tierOf = new Map(targets.map((t) => [t.modId, t.minTierIndex ?? 0]));

  // Pick the deepest orb-tier search that stays within maxPlans (report which one we used). Only the
  // rolled mods carry an orb-strength choice; essence-only mods have a fixed level (no orb axis). Each
  // exalt step also gets an on/off side-omen (≤ K−2 exalts → a small 2^n factor per plan).
  const maxPlans = opts.maxPlans ?? 100_000;
  const preRare = essences.length > 0 ? 2 : 3; // mods placed before the item turns Rare (no exalt yet)
  const omenFactor = Math.pow(2, Math.max(0, modIds.length - preRare));
  const fullLegal = new Map(rolled.map((id) => [id, legalOrbTiers(data, id, tierOf.get(id) ?? 0, level)]));
  const kfact = factorial(modIds.length);
  const estimate = (depth: CurrencyDepth): number =>
    kfact * omenFactor * rolled.reduce((p, id) => p * reduceOrbTiers(fullLegal.get(id)!, depth).length, 1);
  const currencyDepth: CurrencyDepth =
    estimate('full') <= maxPlans ? 'full' : estimate('base+strongest') <= maxPlans ? 'base+strongest' : 'strongest-only';
  const legal = new Map(rolled.map((id) => [id, reduceOrbTiers(fullLegal.get(id)!, currencyDepth)]));

  const assignments = orbAssignments(rolled, legal);
  const baseSequences: PlanStep[][] = [];
  // (1) Add-chain / essence / desecration openers: every mod ordering × orb-strength assignment.
  for (const order of permutations(modIds)) {
    for (const orbOf of assignments) {
      baseSequences.push(buildParetoSteps(data, order, essSet, desSet, tierOf, orbOf));
    }
  }
  // (2) Orb of Alchemy opener — a cheap, low-probability frontier point the add-chain can't produce
  // (4 mods slammed at once, the rest exalted). Not combinable with an essence (Magic→Rare) or a
  // desecration (alchemy lands 4 normal mods; the desecrated ones would need a separate Desecration).
  if (essences.length === 0 && desecrated.length === 0) {
    for (const seq of alchemyOpenerSequences(data, modIds, tierOf, legal)) baseSequences.push(seq);
  }

  const plans: ParetoPlan[] = [];
  for (const baseSteps of baseSequences) {
    for (const steps of withOmenVariants(data, baseSteps)) {
      const result = evaluatePlan(data, base, steps, level);
      plans.push({ steps, result, cost: planExpectedCost(prices, result, steps), probability: result.total });
    }
  }
  return { frontier: paretoFrontier(plans), plansEvaluated: plans.length, currencyDepth };
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
  for (const id of desiredModIds) {
    const mod = resolveMod(data, id); // throws if unknown
    const inNormal = mod.source === 'normal' && (pool.prefixes.includes(id) || pool.suffixes.includes(id));
    // A desecrated target is craftable from white too (make the rare, then Desecrate) — legal when it's
    // in the base's desecrated pool and carries a boss omen. Gated behind `allowDesecrated` so the older
    // add-chain-only planners (optimizePlan/optimizeCost, whose buildSteps can't desecrate) still reject it.
    const inDesecrated = allowDesecrated && mod.source === 'desecrated'
      && (des.prefixes.includes(id) || des.suffixes.includes(id)) && desecrationOmenForMod(mod) !== undefined;
    if (!essenceCandidates.has(id) && !inNormal && !inDesecrated) {
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
