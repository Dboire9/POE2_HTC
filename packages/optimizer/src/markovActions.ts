// The from-item MDP's ACTION SPACE — every currency the policy may play, what each costs, and the
// distribution over next states it induces. Split out of markovFromItem.ts so the solver there reads
// as orchestration and this file owns "what can I do from here, and where does it land me".
//
// Actions fan out over the levers the price sheet actually lists: Exalted Orbs at base/Greater/Perfect
// strength (ilvl floor 0/35/50, which shrinks the below-tier band — a Perfect Exalt can skip the
// off-tier trap), side-constrained exalts and annuls (Omen of Sinistral/Dextral), and Chaos. A strength
// or omen with no price is NOT offered, so a missing price can't mint a free super-orb.

import type { ItemBase, PatchData } from '../../engine/src/types.ts';
import { excluded, modTierWeight, poolTotalWeight } from '../../engine/src/pool.ts';
import type { DesecrationBossOmen } from '../../engine/src/probability.ts';
import { desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { CurrencyPolicy, Prices, PricedStep } from './cost.ts';
import { allowsStep, stepCost } from './cost.ts';
import type { Dist, McState, McTarget, SideIndex } from './markovState.ts';
import {
  MAX_PER_SIDE, addTo, bit, decodeState, encodeState, has, hasDesecrated, occupiedFamilies,
  prefUsed, sufUsed,
} from './markovState.ts';

export type ExaltStrength = 'base' | 'greater' | 'perfect';

/** Every currency+omen the MDP can play. Exalts fan out over {side} × {strength}. */
export type McAction =
  | { readonly currency: 'exalt'; readonly strength: ExaltStrength; readonly side?: 'prefix' | 'suffix' }
  // `light` = Omen of Light: removes the item's desecrated mod outright (P=1) instead of rolling the
  // uniform 1/N. Mutually exclusive with a side omen — Light already names its target exactly.
  | { readonly currency: 'annul'; readonly side?: 'prefix' | 'suffix'; readonly light?: true }
  | { readonly currency: 'chaos' }
  // A Desecration draws from one boss's desecrated pool. Unconstrained it draws across both sides;
  // a Sinistral/Dextral Necromancy omen (`side`) restricts it to one, shrinking the pool.
  | { readonly currency: 'desecrate'; readonly boss: DesecrationBossOmen; readonly side?: 'prefix' | 'suffix' }
  // A Perfect Essence forces one specific mod on while removing one at random. `side` is a
  // Sinistral/Dextral Crystallisation omen constraining WHICH mod the essence eats.
  | { readonly currency: 'perfect-essence'; readonly target: string; readonly side?: 'prefix' | 'suffix' };

/** An action bound to a state: what it is, what it costs, and where it lands. */
export interface ActionDef {
  readonly action: McAction;
  readonly cost: number;
  readonly dist: Dist;
}

/**
 * The pricing view of an McAction — a rename, not a second price table.
 *
 * The MDP and the linear planner describe the same orb in different words (`strength` vs `tier`,
 * `side` vs `constrainTo`/`omen`), and an McAction names no mods, so it can never BE a PlanStep. But
 * both cost exactly the same thing, so translating here and deferring to `stepCost` leaves one table
 * to keep correct. Keeping two is how the D8 desecration mispricing survived: the linear planner
 * charged for a boss omen the MDP did not.
 */
function pricedStepOf(action: McAction): PricedStep {
  // On exalt and desecrate a side constraint is a Sinistral/Dextral omen on `constrainTo`; on annul
  // and perfect-essence the same idea is spelled `omen`. That split is PlanStep's, and it is load-
  // bearing for probability, so it is mirrored rather than "tidied" here.
  const asOmen = (side?: 'prefix' | 'suffix'): 'sinistral' | 'dextral' | undefined =>
    side === 'prefix' ? 'sinistral' : side === 'suffix' ? 'dextral' : undefined;
  switch (action.currency) {
    case 'exalt':
      return { currency: 'exalt', tier: action.strength, ...(action.side ? { constrainTo: action.side } : {}) };
    case 'annul': {
      // Light names its target outright, so it is never combined with a side omen (see McAction).
      const omen = action.light ? 'light' : asOmen(action.side);
      return { currency: 'annul', ...(omen ? { omen } : {}) };
    }
    case 'desecrate':
      return { currency: 'desecrate', boss: action.boss, ...(action.side ? { constrainTo: action.side } : {}) };
    case 'perfect-essence': {
      const omen = asOmen(action.side);
      return { currency: 'perfect-essence', ...(omen ? { omen } : {}) };
    }
    default:
      return { currency: 'chaos' };
  }
}

/** Cost of a single McAction from a price sheet — the same table the linear planner's steps use. */
export function actionCostOf(prices: Prices, action: McAction): number {
  return stepCost(prices, pricedStepOf(action));
}

/** Whether the player can play this action — the same permission the linear planner's steps get. */
export function allowsAction(policy: CurrencyPolicy | undefined, action: McAction): boolean {
  return allowsStep(policy, pricedStepOf(action));
}

/** ilvl floor each Exalted-Orb strength imposes (mirrors pool.ts: base 0 / greater 35 / perfect 50). */
const STRENGTH_FLOOR: Record<ExaltStrength, number> = { base: 0, greater: 35, perfect: 50 };
/** Map each exalt strength to its price key in the Prices record. */
const strengthPriceKey = (s: ExaltStrength): string => s === 'base' ? 'exalt' : s === 'greater' ? 'exalt_greater' : 'exalt_perfect';

/** Everything the distribution builders close over — resolved once per solve. */
export interface ActionSpaceParams {
  readonly data: PatchData;
  readonly prices: Prices;
  /** Item level — caps which tiers can roll. */
  readonly level: number;
  /** The base's pools: `normal` feeds exalts/chaos, `desecrated` feeds Desecrations. */
  readonly pools: ItemBase['pools'];
  readonly list: readonly McTarget[];
  readonly side: SideIndex;
  /** Whether desecration is in play at all (see markovFromItem: only when a desecrated mod is involved). */
  readonly desecratable: boolean;
  /** Currencies the player doesn't have; actions needing one are never offered. */
  readonly policy?: CurrencyPolicy;
}

/**
 * Build the action space for one solve. Returns `actionsOf`, which yields every action available in a
 * given state together with its cost and outcome distribution — the only thing the solver needs.
 */
export function createActionSpace(params: ActionSpaceParams): {
  actionsOf: (s: McState) => ActionDef[];
} {
  const { data, prices, level, pools, list, side, desecratable, policy } = params;
  const n = list.length;

  // Per-floor weights for a target: success = ≥ its wanted tier; any = the whole family.
  const succWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, t.minIndex);
  const anyWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, 0);
  // Only mods in the NORMAL pool can be exalted/chaosed on. A desecrated target carries its own tier
  // weight, but it is absent from poolTotalWeight's denominator — counting it in the numerator would
  // let an Exalt conjure a desecrated mod and break the distribution's sum.
  const rollable = (t: McTarget): boolean => t.mod.source === 'normal';

  // Strengths/omens available on the price sheet (base always; the rest only if listed) AND not
  // excluded by the player. Pruning here rather than only in `push` keeps the solver from building
  // outcome distributions for actions that can never be offered — with omens excluded that is most of
  // the branching factor.
  const notExcluded = (key: string): boolean => !policy?.excluded.has(key);
  const strengths: ExaltStrength[] = (['base', 'greater', 'perfect'] as const)
    .filter((s) => s === 'base' || prices.currency[strengthPriceKey(s)] !== undefined)
    .filter((s) => notExcluded(strengthPriceKey(s)));
  const omenOk = (id: string): boolean => prices.omens[id] !== undefined && notExcluded(id);
  const sinistralExaltOk = omenOk('OmenofSinistralExaltation');
  const dextralExaltOk = omenOk('OmenofDextralExaltation');
  const lightOk = omenOk('OmenofLight');
  const necromancyOk = (sd: 'prefix' | 'suffix'): boolean =>
    omenOk(sd === 'prefix' ? 'OmenofSinistralNecromancy' : 'OmenofDextralNecromancy');

  const prefixOpenIn = (s: McState): boolean => prefUsed(s, side) < MAX_PER_SIDE;
  const suffixOpenIn = (s: McState): boolean => sufUsed(s, side) < MAX_PER_SIDE;

  /** The add-distribution from a state at ilvl `floor`, optionally constrained to one side (side omen).
   *  A weighted add lands a target at tier (→ present), the target below tier (→ blocked), or foreign
   *  junk (→ jp/js). Empty if no slot is open or nothing is addable; probabilities sum to 1. */
  const addOutcomes = (s: McState, floor: number, constrainTo?: 'prefix' | 'suffix'): Dist => {
    const prefixOpen = constrainTo !== 'suffix' && prefixOpenIn(s);
    const suffixOpen = constrainTo !== 'prefix' && suffixOpenIn(s);
    const occ = occupiedFamilies(s.present, s.blocked, list);
    const prefTotal = prefixOpen ? poolTotalWeight(data, pools.normal.prefixes, floor, level, occ) : 0;
    const sufTotal = suffixOpen ? poolTotalWeight(data, pools.normal.suffixes, floor, level, occ) : 0;
    const grand = prefTotal + sufTotal;
    const out: Dist = new Map();
    if (grand <= 0) return out;
    let anyPref = 0; // Σ whole-family weight of the free targets on the prefix side (the non-junk share)
    let anySuf = 0;
    for (let i = 0; i < n; i++) {
      if (has(s.present, i) || has(s.blocked, i)) continue; // family already occupied
      const t = list[i]!;
      if (!rollable(t)) continue; // an Exalt can't produce a desecrated / essence-only mod
      if (excluded(t.mod, occ)) continue; // defensive (validated distinct upstream)
      const open = t.type === 'prefix' ? prefixOpen : suffixOpen;
      if (!open) continue;
      const succ = succWeight(t, floor);
      const any = anyWeight(t, floor);
      if (succ > 0) addTo(out, encodeState(s.present | bit(i), s.blocked, s.jp, s.js, s.desJunk), succ / grand);
      const below = any - succ;
      if (below > 0) addTo(out, encodeState(s.present, s.blocked | bit(i), s.jp, s.js, s.desJunk), below / grand);
      if (t.type === 'prefix') anyPref += any; else anySuf += any;
    }
    // Everything else the add can produce is foreign junk on its side (a non-target family).
    const junkPref = Math.max(0, prefTotal - anyPref);
    const junkSuf = Math.max(0, sufTotal - anySuf);
    if (junkPref > 0) addTo(out, encodeState(s.present, s.blocked, s.jp + 1, s.js, s.desJunk), junkPref / grand);
    if (junkSuf > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js + 1, s.desJunk), junkSuf / grand);
    return out;
  };

  /** The removal distribution, optionally constrained to one side (omen annul). Removes a uniformly-
   *  random removable mod: a non-fractured present target (→ absent), a blocked off-tier roll (→ frees
   *  the family, target addable again), junk, or the desecrated mod if the item carries one. */
  const removeOutcomes = (s: McState, constrainTo?: 'prefix' | 'suffix'): Dist => {
    const presentRem: number[] = [];
    const blockedRem: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = list[i]!;
      if (constrainTo && t.type !== constrainTo) continue;
      if (has(s.present, i) && !t.fractured) presentRem.push(i);
      if (has(s.blocked, i)) blockedRem.push(i); // an off-tier occupier is a random roll — never locked
    }
    const jpRem = constrainTo === 'suffix' ? 0 : s.jp;
    const jsRem = constrainTo === 'prefix' ? 0 : s.js;
    const desRem = s.desJunk !== 'none' && constrainTo !== undefined && s.desJunk !== constrainTo ? 0
      : s.desJunk !== 'none' ? 1 : 0;
    const total = presentRem.length + blockedRem.length + jpRem + jsRem + desRem;
    const out: Dist = new Map();
    if (total <= 0) return out;
    for (const i of presentRem) addTo(out, encodeState(s.present & ~bit(i), s.blocked, s.jp, s.js, s.desJunk), 1 / total);
    for (const i of blockedRem) addTo(out, encodeState(s.present, s.blocked & ~bit(i), s.jp, s.js, s.desJunk), 1 / total);
    if (jpRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp - 1, s.js, s.desJunk), jpRem / total);
    if (jsRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js - 1, s.desJunk), jsRem / total);
    if (desRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'none'), desRem / total);
    return out;
  };

  /** Omen of Light: removes the item's ONE desecrated mod outright (P=1). That mod is either unwanted
   *  junk (the desJunk axis) or a desecrated TARGET sitting in the masks — worth removing only when
   *  it's blocked off-tier, which the solver decides. Empty when there's nothing desecrated to remove. */
  const lightOutcomes = (s: McState): Dist => {
    const out: Dist = new Map();
    if (s.desJunk !== 'none') {
      addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'none'), 1);
      return out;
    }
    for (let i = 0; i < n; i++) {
      const t = list[i]!;
      if (t.mod.source !== 'desecrated') continue;
      if (has(s.present, i) && !t.fractured) { addTo(out, encodeState(s.present & ~bit(i), s.blocked, s.jp, s.js, 'none'), 1); return out; }
      if (has(s.blocked, i)) { addTo(out, encodeState(s.present, s.blocked & ~bit(i), s.jp, s.js, 'none'), 1); return out; }
    }
    return out;
  };

  /** Chaos = remove one uniformly-random mod, then add one weighted mod (base strength) on the freed item. */
  const chaosOutcomes = (s: McState): Dist => {
    const removals = removeOutcomes(s);
    const out: Dist = new Map();
    for (const [midKey, pRem] of removals) {
      const mid = decodeState(midKey);
      const adds = addOutcomes(mid, 0);
      if (adds.size === 0) { addTo(out, midKey, pRem); continue; } // no add possible → just the removal
      for (const [toKey, pAdd] of adds) addTo(out, toKey, pRem * pAdd);
    }
    return out;
  };

  // ── Desecration ────────────────────────────────────────────────────────────────────────────────
  // A boss omen draws COUNT-uniformly from that boss's desecrated pool (weights are ignored — see
  // validation.md D3). Unconstrained the draw spans both sides; a Necromancy side omen narrows it to
  // one, which is what recovers the engine's per-slot 1/N. Candidates whose family is already on the
  // item, or whose side is full, are excluded from the draw rather than wasting it — the same way
  // poolTotalWeight excludes occupied families from a normal add.
  const bossPool: Record<DesecrationBossOmen, { readonly prefix: string[]; readonly suffix: string[] }> = {
    blackblooded: { prefix: [], suffix: [] }, liege: { prefix: [], suffix: [] }, sovereign: { prefix: [], suffix: [] },
  };
  if (desecratable) {
    for (const sd of ['prefix', 'suffix'] as const) {
      for (const id of sd === 'prefix' ? pools.desecrated.prefixes : pools.desecrated.suffixes) {
        const mod = data.mods.get(id);
        if (!mod) continue;
        const boss = desecrationOmenForMod(mod);
        if (boss) bossPool[boss][sd].push(id);
      }
    }
  }

  const desecrateOutcomes = (s: McState, boss: DesecrationBossOmen, constrainTo?: 'prefix' | 'suffix'): Dist => {
    const out: Dist = new Map();
    if (!desecratable || hasDesecrated(s, list)) return out; // an item holds at most one desecrated mod
    const occ = occupiedFamilies(s.present, s.blocked, list);
    const sides = (constrainTo ? [constrainTo] : ['prefix', 'suffix'] as const).filter(
      (sd) => (sd === 'prefix' ? prefixOpenIn(s) : suffixOpenIn(s)));
    const candidates: { id: string; sd: 'prefix' | 'suffix' }[] = [];
    for (const sd of sides) {
      for (const id of bossPool[boss][sd]) {
        const mod = data.mods.get(id)!;
        if (excluded(mod, occ)) continue; // family exclusion shrinks the pool (all of a mod's families)
        candidates.push({ id, sd });
      }
    }
    if (candidates.length === 0) return out;
    const p = 1 / candidates.length;
    for (const { id, sd } of candidates) {
      const i = list.findIndex((t) => t.modId === id);
      if (i >= 0) addTo(out, encodeState(s.present | bit(i), s.blocked, s.jp, s.js, s.desJunk), p);
      else addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, sd), p);
    }
    return out;
  };

  // ── Perfect Essence ────────────────────────────────────────────────────────────────────────────
  // Forces its own mod on while eating one existing mod at random — so the removal half is exactly the
  // uniform draw removeOutcomes already computes (perfectEssenceProbability's 1/(pf+sf), 1/pf and 1/sf
  // branches are the same formulas), and the add half is deterministic. On an empty item there is
  // nothing to eat, so it simply adds (P=1), matching plan.ts's empty-item branch.
  //
  // The add is only legal if the target's side has room. When that side isn't full the removal can only
  // help, so every branch is legal; when it IS full the add depends on the removal landing on that same
  // side, which is guaranteed only under a matching Crystallisation omen. Rather than invent what the
  // game does in the ambiguous case, the action simply isn't offered there.
  const perfectEssenceOutcomes = (s: McState, i: number, constrainTo?: 'prefix' | 'suffix'): Dist => {
    const out: Dist = new Map();
    const t = list[i]!;
    if (has(s.present, i) || has(s.blocked, i)) return out; // its family is already occupied
    const sideOpen = t.type === 'prefix' ? prefixOpenIn(s) : suffixOpenIn(s);
    if (!sideOpen && constrainTo !== t.type) return out; // the add might not fit — don't guess
    const removals = removeOutcomes(s, constrainTo);
    if (removals.size === 0) {
      // Nothing removable: only legal when the item is genuinely empty, which is the deterministic add.
      const empty = s.present === 0 && s.blocked === 0 && s.jp === 0 && s.js === 0 && s.desJunk === 'none';
      if (empty) addTo(out, encodeState(bit(i), 0, 0, 0, 'none'), 1);
      return out;
    }
    for (const [midKey, p] of removals) {
      const mid = decodeState(midKey);
      addTo(out, encodeState(mid.present | bit(i), mid.blocked, mid.jp, mid.js, mid.desJunk), p);
    }
    return out;
  };
  const perfectTargets = list.map((t, i) => (t.mod.source === 'perfect_essence' ? i : -1)).filter((i) => i >= 0);
  const crystallisationOk = (sd: 'prefix' | 'suffix'): boolean =>
    omenOk(sd === 'prefix' ? 'OmenofSinistralCrystallisation' : 'OmenofDextralCrystallisation');

  // The one place an action enters the space, so the one place exclusion has to hold. The `*Ok` gates
  // below also consult the policy, but only to avoid building distributions that would be thrown away
  // here — this is what makes the guarantee, not them.
  const push = (acts: ActionDef[], action: McAction, dist: Dist): void => {
    if (dist.size === 0) return;
    if (!allowsAction(policy, action)) return;
    acts.push({ action, cost: actionCostOf(prices, action), dist });
  };

  const actionsOf = (s: McState): ActionDef[] => {
    const acts: ActionDef[] = [];
    const exaltSides: (undefined | 'prefix' | 'suffix')[] = [undefined];
    if (sinistralExaltOk) exaltSides.push('prefix');
    if (dextralExaltOk) exaltSides.push('suffix');
    for (const constrainTo of exaltSides) {
      for (const strength of strengths) {
        push(acts, { currency: 'exalt', strength, ...(constrainTo ? { side: constrainTo } : {}) },
          addOutcomes(s, STRENGTH_FLOOR[strength], constrainTo));
      }
    }
    for (const constrainTo of [undefined, 'prefix', 'suffix'] as const) {
      push(acts, { currency: 'annul', ...(constrainTo ? { side: constrainTo } : {}) }, removeOutcomes(s, constrainTo));
    }
    if (lightOk) push(acts, { currency: 'annul', light: true }, lightOutcomes(s));
    push(acts, { currency: 'chaos' }, chaosOutcomes(s));
    if (desecratable) {
      for (const boss of ['blackblooded', 'liege', 'sovereign'] as const) {
        push(acts, { currency: 'desecrate', boss }, desecrateOutcomes(s, boss));
        for (const sd of ['prefix', 'suffix'] as const) {
          if (necromancyOk(sd)) push(acts, { currency: 'desecrate', boss, side: sd }, desecrateOutcomes(s, boss, sd));
        }
      }
    }
    for (const i of perfectTargets) {
      const target = list[i]!.modId;
      push(acts, { currency: 'perfect-essence', target }, perfectEssenceOutcomes(s, i));
      for (const sd of ['prefix', 'suffix'] as const) {
        if (crystallisationOk(sd)) {
          push(acts, { currency: 'perfect-essence', target, side: sd }, perfectEssenceOutcomes(s, i, sd));
        }
      }
    }
    return acts;
  };

  return { actionsOf };
}
