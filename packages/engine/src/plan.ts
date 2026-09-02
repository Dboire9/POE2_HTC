// Phase-2 core: the plan evaluator. Given a fully-specified crafting sequence, it threads the item
// state through each step and composes the per-step probabilities (from probability.ts, all already
// differential-validated) into a cumulative success probability — the faithful analytic analogue of
// Java's `Crafting_Candidate.calculateTotalProbability` (Π of each step's best probability).
//
// This is the exact, testable core the optimizer/beam search sits on top of: the search proposes
// sequences, this evaluates them. It does NOT search — it scores a given plan.

import type { AffixType, CurrencyTier, ItemBase, ItemState, PatchData, PlacedMod, Rarity } from './types.ts';
import { familyAvailable, resolveMod } from './pool.ts';
import { MAX_AFFIXES_PER_SIDE, prefixesFull, suffixesFull, whiteItem, withAffix } from './item.ts';
import type { AnnulOmen, ChaosOmen, CurrencyOptions, DesecrationBossOmen, DrawTarget, EssenceOmen } from './probability.ts';
import {
  alchemyProbability, annulProbability, augmentationProbability, chaosProbability, desecrationBossAnySideProbability,
  desecrationBossProbability, desecrationOffered, desecrationProbability, essenceForcedProbability, exaltProbability,
  greaterExaltProbability, perfectEssenceProbability, regalProbability, transmuteProbability,
} from './probability.ts';

/**
 * Common fields for an add step: `tier` = orb strength (base/greater/perfect, raises the ilvl floor)
 * and `minTierIndex` = the desired mod tier (or better). Both default to base / any-tier.
 */
interface AddFields {
  readonly add: string;
  readonly tier?: CurrencyTier;
  readonly minTierIndex?: number;
}

/** One step of a crafting plan. `add`/`remove` name the mod the step targets. */
export type PlanStep =
  | ({ currency: 'transmute' } & AddFields)
  | ({ currency: 'augment' } & AddFields)
  | ({ currency: 'regal' } & AddFields)
  | ({ currency: 'exalt'; constrainTo?: AffixType } & AddFields)
  // An Exalted Orb spent under an Omen of Greater Exaltation: it adds TWO random modifiers instead of
  // one, and `adds` names both (each with its own tier requirement — they are different targets).
  //
  // This cannot be an omen FIELD on the exalt step above, the way Whittling is one on chaos. An omen
  // that changes only a step's odds and price is a LEVER, priced per step by levers.ts without the
  // search enumerating it; this one leaves a different item behind, so it has to be enumerated where
  // the orderings are. `levers.test.ts` asserts that distinction rather than trusting this comment.
  //
  // `tier` is the strength of the orb the omen is spent on — the omen works on a Greater or Perfect
  // Exalted Orb as well as a plain one (user ruling 2026-09-02; the item text does not settle it).
  | { currency: 'greater-exalt'; adds: readonly [DrawTarget, DrawTarget]; tier?: CurrencyTier }
  // An Orb of Alchemy OPENER: turns a white item Rare with 4 random mods at once. `adds` are the (≤4)
  // target mods we need to be among those 4 — the whole point is that the item ends as EXACTLY those
  // mods, so `adds` is normally 4 (a 4-mod target) or the 4 of a 5–6-mod target that alchemy supplies,
  // the rest exalted on top. Rolls any tier (no tier control), so only "any-tier" mods belong here.
  | { currency: 'alchemy'; adds: readonly string[] }
  // A Chaos Orb on a Rare item: remove the existing `remove` mod (uniformly at random) and add the new
  // `add` mod to any open side (weighted). `constrainTo`/`tier`/`minTierIndex` tune the add. The natural
  // home for this is the craft-from-existing-item flow (rerolling an item you already hold).
  // `omen: 'whittling'` is the Omen of Whittling — it makes the REMOVAL deterministic (the
  // lowest-level modifier) instead of uniform. `constrainTo` is a different axis and tunes the ADD.
  | ({ currency: 'chaos'; remove: string; constrainTo?: AffixType; omen?: ChaosOmen } & AddFields)
  | { currency: 'annul'; remove: string; omen?: AnnulOmen }
  | { currency: 'desecrate'; add: string; boss?: DesecrationBossOmen; constrainTo?: AffixType }
  // A non-perfect essence forcing its guaranteed mod onto an open slot (deterministic, P=1).
  // `essenceTier` selects the essence level (index into the mod's level-tiers; default lowest);
  // `essenceLevel` is that level's label (lesser/normal/greater) for pricing.
  | { currency: 'essence'; add: string; essenceTier?: number; essenceLevel?: string }
  // A perfect essence: adds its guaranteed `add` mod while removing the existing `remove` mod.
  | { currency: 'perfect-essence'; add: string; remove: string; omen?: EssenceOmen };

export interface PlanStepResult {
  readonly currency: PlanStep['currency'];
  /** The mod this step added or removed. */
  readonly target: string;
  /** Probability this step produced the intended outcome, given the state before it. */
  readonly prob: number;
}

export interface PlanResult {
  readonly steps: readonly PlanStepResult[];
  /** Cumulative success probability = Π of the per-step probabilities. */
  readonly total: number;
}

/** Item rarity after a currency that adds a mod (adds that transition rarity; others keep it). */
function rarityAfterAdd(currency: PlanStep['currency'], prev: Rarity): Rarity {
  if (currency === 'transmute') return 'magic';
  if (currency === 'regal') return 'rare';
  if (currency === 'essence') return 'rare'; // essences upgrade the item to rare
  if (currency === 'alchemy') return 'rare'; // alchemy turns a white item straight to rare (4 mods)
  return prev; // augment keeps magic, exalt/desecrate/perfect-essence keep rare
}

/** Build CurrencyOptions from an add step's optional tier / target-tier fields (strict-optional safe). */
function addOpts(step: AddFields & { constrainTo?: AffixType }): CurrencyOptions {
  const o: CurrencyOptions = {};
  if (step.tier !== undefined) o.currencyTier = step.tier;
  if (step.minTierIndex !== undefined) o.minTierIndex = step.minTierIndex;
  if (step.constrainTo !== undefined) o.constrainTo = step.constrainTo;
  return o;
}

/** Probability of `step` given the state immediately before it. Dispatches to the per-step fns. */
export function stepProbability(data: PatchData, state: ItemState, step: PlanStep): number {
  switch (step.currency) {
    case 'transmute': return transmuteProbability(data, state.base, step.add, { ...addOpts(step), level: state.level });
    case 'augment': return augmentationProbability(data, state, step.add, addOpts(step));
    case 'regal': return regalProbability(data, state, step.add, addOpts(step));
    case 'exalt': return exaltProbability(data, state, step.add, addOpts(step));
    case 'greater-exalt':
      return greaterExaltProbability(data, state, step.adds, step.tier === undefined ? {} : { currencyTier: step.tier });
    case 'alchemy':
      // Alchemy is a from-white opener: only legal on a fresh normal item (0 mods). P = all `adds`
      // land among the 4 rolled mods (computed from the base's normal pool).
      if (state.rarity !== 'normal' || state.prefixes.length + state.suffixes.length > 0) return 0;
      return alchemyProbability(data, state.base, step.adds, { level: state.level });
    case 'chaos':
      return chaosProbability(data, state, step.remove, step.add,
        step.omen ? { ...addOpts(step), omen: step.omen } : addOpts(step));
    case 'annul': return annulProbability(data, state, step.remove, step.omen ? { omen: step.omen } : {});
    case 'desecrate': {
      // A desecration acts on a RARE item and adds a mod to an OPEN slot of its side (family free). The
      // boss-omen primitive is count-uniform and doesn't gate rarity/slot/family (it mirrors Java's
      // narrow model), so the plan layer enforces legality here — mirroring the perfect-essence case.
      if (state.rarity !== 'rare') return 0;
      const mod = resolveMod(data, step.add);
      const sideFull = mod.type === 'prefix' ? prefixesFull(state) : suffixesFull(state);
      if (sideFull || !familyAvailable(data, state, mod)) return 0;
      // Every branch below is a PER-DRAW probability; a bone offers DESECRATION_OFFER_COUNT of them
      // and you take one, so the chance this step delivers `step.add` is the chance it appears at all.
      // Applied here rather than inside the primitives so the Java-ported boss numbers stay as ported.
      if (!step.boss) {
        return desecrationOffered(
          desecrationProbability(data, state, step.add, step.constrainTo ? { constrainTo: step.constrainTo } : {}),
        );
      }
      // D8: a boss draw spans BOTH sides unless a Sinistral/Dextral Necromancy omen locks it to one.
      // With the omen the draw is the per-slot 1/N (and it must be the added mod's own side, or the
      // omen is pointing away from what we want); without it, the wider both-sides denominator.
      if (step.constrainTo) {
        return step.constrainTo === mod.type
          ? desecrationOffered(desecrationBossProbability(data, state, step.add, { omen: step.boss }))
          : 0;
      }
      return desecrationOffered(desecrationBossAnySideProbability(data, state, step.add, { omen: step.boss }));
    }
    case 'essence': return essenceForcedProbability(data, state, step.add, step.essenceTier);
    case 'perfect-essence': {
      // A perfect essence acts on a RARE item, can't re-add a mod whose family is already present,
      // and on a 0-mod item simply adds its guaranteed mod (no removal, deterministic). Otherwise it
      // removes one uniformly-random mod (side-constrained by omen) — the differential-matched math.
      if (state.rarity !== 'rare') return 0;
      const added = resolveMod(data, step.add);
      if (!familyAvailable(data, state, added)) return 0;
      // Item-level gate, mirroring essenceForcedProbability's `tier.ilvl > item.level`. It was missing
      // here: every perfect-essence mod is ilvl 72, so below that the planner costed a step the game
      // refuses. A perfect essence has exactly one tier (its "perfect" level), so index 0 is it.
      const perfTier = added.tiers[0];
      if (perfTier === undefined || perfTier.ilvl > state.level) return 0;
      if (state.prefixes.length + state.suffixes.length === 0) return 1;
      // The essence removes BEFORE it adds, so the add needs a free slot on its own side once
      // `step.remove` is gone — the removal only helps if it came off that same side. (Mirrors the
      // `sideFull` guard on 'desecrate' above; without it a 3-prefix item could take a 4th prefix by
      // sacrificing a suffix.)
      const addSide = added.type === 'prefix' ? state.prefixes : state.suffixes;
      const freesAddSide = addSide.some((p) => p.modId === step.remove);
      if (addSide.length - (freesAddSide ? 1 : 0) >= MAX_AFFIXES_PER_SIDE) return 0;
      return perfectEssenceProbability(data, state, added.type, step.remove, step.omen ? { omen: step.omen } : {});
    }
  }
}

/** Remove the first placed mod matching `modId` from `state` (searches prefixes then suffixes). */
function removeMod(state: ItemState, modId: string): ItemState {
  const drop = (arr: readonly PlacedMod[]): { hit: boolean; out: PlacedMod[] } => {
    const idx = arr.findIndex((p) => p.modId === modId);
    if (idx < 0) return { hit: false, out: [...arr] };
    return { hit: true, out: [...arr.slice(0, idx), ...arr.slice(idx + 1)] };
  };
  const pre = drop(state.prefixes);
  const suf = pre.hit ? { hit: false, out: [...state.suffixes] } : drop(state.suffixes);
  const next: ItemState = { base: state.base, level: state.level, rarity: state.rarity, prefixes: pre.out, suffixes: suf.out };
  return state.desecrated === undefined ? next : { ...next, desecrated: state.desecrated };
}

/** Add `modId` to `state` on its own side at `tierIndex`, transitioning rarity per `currency`. */
function addMod(
  data: PatchData, state: ItemState, currency: PlanStep['currency'], modId: string, tierIndex = 0,
): ItemState {
  const mod = resolveMod(data, modId);
  const placed: PlacedMod = { modId, tierName: (mod.tiers[tierIndex] ?? mod.tiers[0])?.name ?? '' };
  const next = withAffix(state, mod.type, placed, rarityAfterAdd(currency, state.rarity));
  return currency === 'desecrate' ? { ...next, desecrated: true } : next;
}

/** Apply `step`'s outcome to `state`, returning the next state. */
function applyStep(data: PatchData, state: ItemState, step: PlanStep): ItemState {
  switch (step.currency) {
    case 'annul': return removeMod(state, step.remove);
    // Alchemy lands all `adds` at once (each on its own side, tier 0), turning the item Rare.
    case 'alchemy': return step.adds.reduce((s, id) => addMod(data, s, 'alchemy', id), state);
    // Both modifiers land on the one orb, each at the tier its target asked for — same reasoning as
    // the `minTierIndex` note below, applied to two mods instead of one. Rarity is unchanged (Rare).
    case 'greater-exalt':
      return step.adds.reduce((s, t) => addMod(data, s, 'greater-exalt', t.modId, t.minTierIndex ?? 0), state);
    // Chaos removes the target mod then adds the new one (item stays Rare).
    case 'chaos': return addMod(data, removeMod(state, step.remove), 'chaos', step.add);
    case 'perfect-essence': return addMod(data, removeMod(state, step.remove), step.currency, step.add);
    case 'essence': return addMod(data, state, step.currency, step.add, step.essenceTier ?? 0);
    // `minTierIndex` — "this tier or better" — is what the step ASKED for, and until 2026-09-02 every
    // add landed at tier 0 regardless, so a walked item's tiers were fiction after the first add.
    // That was harmless only while nothing read them; the Omen of Whittling removes the LOWEST LEVEL
    // modifier, which makes the placed tier an input to a probability. Placing at exactly
    // `minTierIndex` is the worst tier that still satisfies the target, so the walk never flatters a
    // plan: a lower placed level makes the mod MORE likely to be the one Whittling takes.
    // A Desecration carries no tier target — the bone offers what it offers — so it keeps tier 0.
    case 'desecrate': return addMod(data, state, step.currency, step.add);
    default: return addMod(data, state, step.currency, step.add, step.minTierIndex ?? 0);
  }
}

/**
 * Evaluate a full crafting plan on `base`: per-step probabilities (each given the state before it)
 * and their cumulative product. `level` is the item level (tier ilvl cap), default 100 to match the
 * differential fixtures. The plan is assumed legal (a real sequence); an illegal step contributes 0
 * and collapses the total, which is the correct signal that the plan can't be executed as written.
 */
export function evaluatePlan(data: PatchData, base: ItemBase, steps: readonly PlanStep[], level = 100): PlanResult {
  return evaluatePlanFrom(data, whiteItem(base, level), steps);
}

/**
 * Evaluate a plan starting from an ARBITRARY item state rather than a fresh white base — the entry
 * point for crafting from an item you already hold (Chaos rerolls, perfect essences, finishing a
 * partly-rolled rare). Same composition as evaluatePlan: each step's probability is taken given the
 * state immediately before it, and the total is their product. `start` carries its own item level.
 */
export function evaluatePlanFrom(data: PatchData, start: ItemState, steps: readonly PlanStep[]): PlanResult {
  let state = start;
  const results: PlanStepResult[] = [];
  let total = 1;
  for (const step of steps) {
    const prob = stepProbability(data, state, step);
    total *= prob;
    const target = step.currency === 'annul' ? step.remove
      : step.currency === 'alchemy' ? step.adds.join('+')
      : step.currency === 'greater-exalt' ? step.adds.map((t) => t.modId).join('+')
      : step.add;
    results.push({ currency: step.currency, target, prob });
    state = applyStep(data, state, step);
  }
  return { steps: results, total };
}

/**
 * The item state as it stands BEFORE each step of `steps` — `out[k]` is what step `k` acts on.
 *
 * Exists so a caller can score one step against its own state without re-deriving the walk.
 * `evaluatePlanFrom` above threads exactly this sequence and is the only other place that knows it;
 * a second copy is the shape of failure this project already paid for once (one planner learned
 * about an omen surcharge, the other did not), so both read the same `applyStep`.
 *
 * The walk is well-defined for a plan that cannot actually be run: `applyStep` describes the intended
 * outcome, and an impossible step scores 0 in `evaluatePlanFrom` rather than throwing. So a caller
 * gets a state to score against either way, and the 0 is what prunes it.
 *
 * WHY A CALLER WOULD WANT THIS. `applyStep` reads only `currency` / `remove` / `add` / `adds` /
 * `essenceTier` — never `tier`, `constrainTo` or `omen`. So the states this returns are the same for
 * every choice of orb strength or omen over the same skeleton, which is what lets a search price those
 * choices one step at a time instead of enumerating their product. That property is load-bearing for
 * `packages/optimizer/src/levers.ts`; a new field read by `applyStep` would silently break it, which
 * is why `levers.test.ts` asserts it rather than trusting this comment.
 */
export function planStates(data: PatchData, start: ItemState, steps: readonly PlanStep[]): ItemState[] {
  const out: ItemState[] = [];
  let state = start;
  for (const step of steps) {
    out.push(state);
    state = applyStep(data, state, step);
  }
  return out;
}
