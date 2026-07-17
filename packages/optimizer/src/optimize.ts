// Clean-room analytic optimizer (Phase 2). For the standard "add these mods to a white item" craft,
// the currency at each position is fixed — transmute (1st mod) → augment (2nd) → regal (3rd) →
// exalt (4th+) — so the ONLY free choice is the ORDER in which the desired mods are added. Order
// matters because a step's probability depends on the slot-branch it hits (both-open vs one-side-
// full), so filling one side before adding the other's mods can raise the cumulative probability.
//
// With ≤6 desired mods (≤3 prefixes + ≤3 suffixes) there are ≤6! = 720 orderings — we enumerate ALL
// of them and score each exactly with the engine's evaluatePlan. No heuristic, no beam pruning: the
// returned plan is the true probability-maximising ordering. The search is analytic and exact.

import type { CurrencyTier, ItemBase, ItemState, PatchData, Rarity } from '../../engine/src/types.ts';
import { CURRENCY_FLOOR } from '../../engine/src/types.ts';
import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';
import { evaluatePlan, evaluatePlanFrom } from '../../engine/src/plan.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { ALCHEMY_MOD_COUNT } from '../../engine/src/probability.ts';
import type { CostBreakdown, Prices } from './cost.ts';
import { planExpectedCost } from './cost.ts';

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

/** All permutations of `items` (K! of them). K is small here (≤6), so this is fine. */
function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) out.push([items[i]!, ...p]);
  }
  return out;
}

/** All size-`k` subsets of `items` (order-independent). k is small here (=4), so this is fine. */
function combinations<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > items.length) return [];
  const out: T[][] = [];
  for (let i = 0; i <= items.length - k; i++) {
    for (const rest of combinations(items.slice(i + 1), k - 1)) out.push([items[i]!, ...rest]);
  }
  return out;
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

/** Build steps for one ordering, essence set, target-tier map and orb-tier assignment. */
function buildParetoSteps(
  data: PatchData, order: readonly string[], essences: ReadonlySet<string>,
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

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/**
 * All ways to side-constrain (Sinistral/Dextral Exaltation) a subset of the plan's EXALT steps.
 * Constraining an exalt to the added mod's side shrinks the pool it can roll from → higher probability,
 * at the omen surcharge — a real cost↔probability lever. A from-white chain has ≤ K−2 exalts, so the
 * 2^n subset enumeration stays tiny.
 */
function withOmenVariants(data: PatchData, steps: PlanStep[]): PlanStep[][] {
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

/** Keep only non-dominated plans (min cost, max probability), cheapest-first. */
function paretoFrontier(plans: ParetoPlan[]): ParetoPlan[] {
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
  // Essence-only mods can only arrive via an essence; everything else is rolled with currency.
  const essences = modIds.filter((id) => resolveMod(data, id).source === 'essence');
  const essSet = new Set(essences);
  const rolled = modIds.filter((id) => !essSet.has(id));
  validateTargetShape(data, base, modIds, essSet);
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
  // (1) Add-chain / essence openers: every mod ordering × orb-strength assignment.
  for (const order of permutations(modIds)) {
    for (const orbOf of assignments) {
      baseSequences.push(buildParetoSteps(data, order, essSet, tierOf, orbOf));
    }
  }
  // (2) Orb of Alchemy opener — a cheap, low-probability frontier point the add-chain can't produce
  // (4 mods slammed at once, the rest exalted). Not combinable with an essence (which needs Magic→Rare).
  if (essences.length === 0) {
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
): void {
  if (desiredModIds.length === 0) throw new Error('no desired mods');
  if (desiredModIds.length > 6) throw new Error(`target has ${desiredModIds.length} mods (max 6)`);
  let prefixes = 0;
  let suffixes = 0;
  const pool = base.pools.normal;
  for (const id of desiredModIds) {
    const mod = resolveMod(data, id); // throws if unknown
    if (!essenceCandidates.has(id) && (mod.source !== 'normal' || (!pool.prefixes.includes(id) && !pool.suffixes.includes(id)))) {
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

// ── From-existing-item planner (Option 2) ───────────────────────────────────────────────────────
// Transform an item you ALREADY hold into a target. The key difference from the from-white optimizer
// is the COST MODEL: `planExpectedCost` restarts to the STARTING item on a miss — you keep the good
// mods you began with (or reproduce that start), rather than binning it back to a blank base — so the
// plan never "throws away" the part you already have. It reaches EXACTLY the target: every current mod
// not in the target is junk to remove, every target mod not present must be added. Removal is a random
// Annulment (or the remove-half of a Chaos); adds are Exalts (into an open slot) or the add-half of a
// Chaos. Chaos pairs one junk-removal with one add in a single orb — best when the item is full and a
// slot must be freed first. v1 handles RARE items at base orb strength (no greater/perfect orb lever
// yet); tier targets are honoured and per-exalt side omens are explored.

/**
 * Target validation for the from-item planner: 1–6 mods, ≤3/side. A target is either a rollable
 * (normal-pool) mod or a perfect-essence mod (added by a Perfect Essence, which removes one random mod).
 */
function validateFromItemTarget(data: PatchData, base: ItemBase, targetIds: readonly string[]): void {
  if (targetIds.length === 0) throw new Error('no target mods');
  if (targetIds.length > 6) throw new Error(`target has ${targetIds.length} mods (max 6)`);
  let pre = 0;
  let suf = 0;
  const norm = base.pools.normal;
  const ess = base.pools.essence;
  for (const id of targetIds) {
    const mod = resolveMod(data, id);
    const rollable = mod.source === 'normal' && (norm.prefixes.includes(id) || norm.suffixes.includes(id));
    const perfect = mod.source === 'perfect_essence' && (ess.prefixes.includes(id) || ess.suffixes.includes(id));
    if (!rollable && !perfect) {
      throw new Error(`mod ${id} can’t be put on ${base.id} (the from-item planner supports rollable mods and perfect essences)`);
    }
    if (mod.type === 'prefix') pre++;
    else suf++;
  }
  if (pre > 3) throw new Error(`target has ${pre} prefixes (max 3)`);
  if (suf > 3) throw new Error(`target has ${suf} suffixes (max 3)`);
}

/** Every ordered selection of `k` distinct items from `arr` (⇒ [] if k > |arr|; [[]] if k === 0). */
function orderedSelections<T>(arr: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const out: T[][] = [];
  for (const combo of combinations(arr, k)) for (const perm of permutations(combo)) out.push(perm);
  return out;
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
 * Build the transform op-sequences from junk + missing (split into rollable and perfect-essence mods),
 * enumerating every ORDER. A PERFECT-ESSENCE target can only be added by a Perfect Essence, which
 * removes one uniformly-random mod as it adds — so each perfect target is paired with a distinct junk to
 * sacrifice (its step scores the odds that random removal actually hits that junk). The remaining junk +
 * rollable-missing go through the ordinary Chaos/Annul/Exalt transforms. Illegal orders score 0 and drop.
 */
function transformSequences(
  junk: readonly string[], missingRollable: readonly string[], missingPerfect: readonly string[],
  tierOf: Map<string, number>,
): PlanStep[][] {
  const out: PlanStep[][] = [];
  // Each perfect target consumes one junk (removed by its essence); enumerate which junk, in order.
  for (const junkForPerfect of orderedSelections(junk, missingPerfect.length)) {
    const perfectOps: PlanStep[] = missingPerfect.map((add, i) => ({
      currency: 'perfect-essence', add, remove: junkForPerfect[i]!,
    }));
    const restJunk = junk.filter((j) => !junkForPerfect.includes(j));
    for (const baseOps of baseTransforms(restJunk, missingRollable, tierOf)) {
      for (const order of permutations([...perfectOps, ...baseOps])) out.push(order);
    }
  }
  return out;
}

/**
 * Compute the (expected cost ↔ success probability) Pareto frontier for transforming `start` (an item
 * you already hold) into `targets`. See the section header for the model. Throws if `start` isn't Rare
 * or the target shape is illegal. When the item already IS the target, returns a single empty plan.
 */
export function optimizeFromItem(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], _opts: OptimizeParetoOptions = {},
): ParetoResult {
  if (start.rarity !== 'rare') {
    throw new Error('the from-item planner currently supports Rare items (use the currency check for Magic)');
  }
  const targetIds = targets.map((t) => t.modId);
  validateFromItemTarget(data, start.base, targetIds);
  const tierOf = new Map(targets.map((t) => [t.modId, t.minTierIndex ?? 0]));
  const targetSet = new Set(targetIds);
  const current = [...start.prefixes, ...start.suffixes].map((p) => p.modId);
  const currentSet = new Set(current);
  // Fractured ("carved") mods are locked — never removed, so never junk. They stay on the item (kept
  // whether or not they're in the target) and keep occupying their slot + family for the engine's math.
  const fractured = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));
  const junk = current.filter((id) => !targetSet.has(id) && !fractured.has(id)); // unwanted & removable → remove
  const missing = targetIds.filter((id) => !currentSet.has(id)); // wanted but not yet present → add
  // A perfect essence adds its guaranteed mod while removing one random mod, so a perfect target can
  // only be placed by sacrificing a junk mod. Needs at least as many junk mods as perfect targets.
  const missingPerfect = missing.filter((id) => resolveMod(data, id).source === 'perfect_essence');
  const missingRollable = missing.filter((id) => resolveMod(data, id).source !== 'perfect_essence');
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

  const plans: ParetoPlan[] = [];
  for (const seq of transformSequences(junk, missingRollable, missingPerfect, tierOf)) {
    for (const steps of withOmenVariants(data, seq)) {
      const result = evaluatePlanFrom(data, start, steps);
      plans.push({ steps, result, cost: planExpectedCost(prices, result, steps), probability: result.total });
    }
  }
  return { frontier: paretoFrontier(plans), plansEvaluated: plans.length, currencyDepth: 'full' };
}
