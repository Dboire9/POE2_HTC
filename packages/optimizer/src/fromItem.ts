// From-existing-item planner (Option 2). Transform an item you ALREADY hold into a target. The key
// difference from the from-white optimizer is the COST MODEL: `planExpectedCost` restarts to the
// STARTING item on a miss — you keep the good mods you began with (or reproduce that start), rather than
// binning it back to a blank base — so the plan never "throws away" the part you already have. It reaches
// EXACTLY the target: every current mod not in the target is junk to remove, every target mod not present
// must be added. Removal is a random Annulment (or the remove-half of a Chaos); adds are Exalts (into an
// open slot), the add-half of a Chaos, a Desecration (a desecrated mod, via its boss omen), or a Perfect
// Essence (which removes one random mod as it adds). v1 handles RARE items at base orb strength; tier
// targets are honoured and per-exalt / per-perfect-essence side omens are explored.

import type { ItemBase, ItemState, PatchData } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import { evaluatePlanFrom } from '../../engine/src/plan.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { Prices } from './cost.ts';
import { planExpectedCost } from './cost.ts';
import { combinations, orderedSelections, permutations } from './combinatorics.ts';
import type { OptimizeParetoOptions, ParetoPlan, ParetoResult, TierTarget } from './optimize.ts';
import { paretoFrontier, withOmenVariants } from './optimize.ts';

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
    if (mod.type === 'prefix') pre++;
    else suf++;
  }
  if (pre > 3) throw new Error(`target has ${pre} prefixes (max 3)`);
  if (suf > 3) throw new Error(`target has ${suf} suffixes (max 3)`);
  // The Desecration mechanic places a single carved mod — an item can hold at most one desecrated mod.
  if (desecratedCount > 1) throw new Error('an item can hold at most one desecrated mod');
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
): PlanStep[][] {
  const out: PlanStep[][] = [];
  // Each desecrated target is a Desecration constrained to its boss (the omen that makes it targetable).
  const desecrateOps: PlanStep[] = missingDesecrated.map((add): PlanStep => {
    const omen = desecrationOmenForMod(resolveMod(data, add));
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
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], _opts: OptimizeParetoOptions = {},
): ParetoResult {
  if (start.rarity !== 'rare') {
    throw new Error('the from-item planner currently supports Rare items (use the currency check for Magic)');
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

  const plans: ParetoPlan[] = [];
  for (const seq of transformSequences(data, junk, missingRollable, missingPerfect, missingDesecrated, tierOf)) {
    for (const steps of withOmenVariants(data, seq, start)) {
      const result = evaluatePlanFrom(data, start, steps);
      plans.push({ steps, result, cost: planExpectedCost(prices, result, steps), probability: result.total });
    }
  }
  return { frontier: paretoFrontier(plans), plansEvaluated: plans.length, currencyDepth: 'full' };
}
