// The from-item MDP's ACTION SPACE — every currency the policy may play, what each costs, and the
// distribution over next states it induces. Split out of markovFromItem.ts so the solver there reads
// as orchestration and this file owns "what can I do from here, and where does it land me".
//
// Actions fan out over the levers the price sheet actually lists: Exalted Orbs at base/Greater/Perfect
// strength (ilvl floor 0/35/50, which shrinks the below-tier band — a Perfect Exalt can skip the
// off-tier trap), side-constrained exalts and annuls (Omen of Sinistral/Dextral), and Chaos. A strength
// or omen with no price is NOT offered, so a missing price can't mint a free super-orb.

import type { PatchData } from '../../engine/src/types.ts';
import { modTierWeight, poolTotalWeight } from '../../engine/src/pool.ts';
import type { Prices } from './cost.ts';
import type { Dist, McTarget, SideIndex } from './markovState.ts';
import {
  MAX_PER_SIDE, addTo, bit, decodeState, encodeState, has, occupiedFamilies, prefUsed, sufUsed,
} from './markovState.ts';

export type ExaltStrength = 'base' | 'greater' | 'perfect';

/** Every currency+omen the MDP can play. Exalts fan out over {side} × {strength}. */
export type McAction =
  | { readonly currency: 'exalt'; readonly strength: ExaltStrength; readonly side?: 'prefix' | 'suffix' }
  | { readonly currency: 'annul'; readonly side?: 'prefix' | 'suffix' }
  | { readonly currency: 'chaos' };

/** An action bound to a state: what it is, what it costs, and where it lands. */
export interface ActionDef {
  readonly action: McAction;
  readonly cost: number;
  readonly dist: Dist;
}

/** Cost of a single McAction from a price sheet. */
export function actionCostOf(prices: Prices, action: McAction): number {
  const c = (k: string): number => prices.currency[k] ?? 0;
  const o = (k: string): number => prices.omens[k] ?? 0;
  if (action.currency === 'exalt') {
    const base = action.strength === 'base' ? c('exalt') : action.strength === 'greater' ? c('exalt_greater') : c('exalt_perfect');
    const side = action.side === 'prefix' ? o('OmenofSinistralExaltation') : action.side === 'suffix' ? o('OmenofDextralExaltation') : 0;
    return base + side;
  }
  if (action.currency === 'annul') {
    const base = c('annul');
    const side = action.side === 'prefix' ? o('OmenofSinistralAnnulment') : action.side === 'suffix' ? o('OmenofDextralAnnulment') : 0;
    return base + side;
  }
  return c('chaos');
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
  /** The base's normal (rollable) pools. */
  readonly pool: { readonly prefixes: readonly string[]; readonly suffixes: readonly string[] };
  readonly list: readonly McTarget[];
  readonly side: SideIndex;
}

/**
 * Build the action space for one solve. Returns `actionsOf`, which yields every action available in a
 * given state together with its cost and outcome distribution — the only thing the solver needs.
 */
export function createActionSpace(params: ActionSpaceParams): {
  actionsOf: (present: number, blocked: number, jp: number, js: number) => ActionDef[];
} {
  const { data, prices, level, pool, list, side } = params;
  const n = list.length;

  // Per-floor weights for a target: success = ≥ its wanted tier; any = the whole family.
  const succWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, t.minIndex);
  const anyWeight = (t: McTarget, floor: number): number => modTierWeight(t.mod, floor, level, 0);

  // Strengths/omens available on the price sheet (base always; the rest only if listed).
  const strengths: ExaltStrength[] = (['base', 'greater', 'perfect'] as const)
    .filter((s) => s === 'base' || prices.currency[strengthPriceKey(s)] !== undefined);
  const sinistralExaltOk = prices.omens['OmenofSinistralExaltation'] !== undefined;
  const dextralExaltOk = prices.omens['OmenofDextralExaltation'] !== undefined;

  /** The add-distribution from a state at ilvl `floor`, optionally constrained to one side (side omen).
   *  A weighted add lands a target at tier (→ present), the target below tier (→ blocked), or foreign
   *  junk (→ jp/js). Empty if no slot is open or nothing is addable; probabilities sum to 1. */
  const addOutcomes = (
    present: number, blocked: number, jp: number, js: number, floor: number, constrainTo?: 'prefix' | 'suffix',
  ): Dist => {
    const prefixOpen = constrainTo !== 'suffix' && prefUsed(present, blocked, jp, side) < MAX_PER_SIDE;
    const suffixOpen = constrainTo !== 'prefix' && sufUsed(present, blocked, js, side) < MAX_PER_SIDE;
    const occ = occupiedFamilies(present, blocked, list);
    const prefTotal = prefixOpen ? poolTotalWeight(data, pool.prefixes, floor, level, occ) : 0;
    const sufTotal = suffixOpen ? poolTotalWeight(data, pool.suffixes, floor, level, occ) : 0;
    const grand = prefTotal + sufTotal;
    const out: Dist = new Map();
    if (grand <= 0) return out;
    let anyPref = 0; // Σ whole-family weight of the free targets on the prefix side (the non-junk share)
    let anySuf = 0;
    for (let i = 0; i < n; i++) {
      if (has(present, i) || has(blocked, i)) continue; // family already occupied
      const t = list[i]!;
      if (occ.has(t.family)) continue; // defensive (validated distinct upstream)
      const open = t.type === 'prefix' ? prefixOpen : suffixOpen;
      if (!open) continue;
      const succ = succWeight(t, floor);
      const any = anyWeight(t, floor);
      if (succ > 0) addTo(out, encodeState(present | bit(i), blocked, jp, js), succ / grand);
      const below = any - succ;
      if (below > 0) addTo(out, encodeState(present, blocked | bit(i), jp, js), below / grand); // below tier → family blocked
      if (t.type === 'prefix') anyPref += any; else anySuf += any;
    }
    // Everything else the add can produce is foreign junk on its side (a non-target family).
    const junkPref = Math.max(0, prefTotal - anyPref);
    const junkSuf = Math.max(0, sufTotal - anySuf);
    if (junkPref > 0) addTo(out, encodeState(present, blocked, jp + 1, js), junkPref / grand);
    if (junkSuf > 0) addTo(out, encodeState(present, blocked, jp, js + 1), junkSuf / grand);
    return out;
  };

  /** The removal distribution, optionally constrained to one side (omen annul). Removes a uniformly-
   *  random removable mod: a non-fractured present target (→ absent), a blocked off-tier roll (→ frees
   *  the family, target addable again), or a junk mod. */
  const removeOutcomes = (
    present: number, blocked: number, jp: number, js: number, constrainTo?: 'prefix' | 'suffix',
  ): Dist => {
    const presentRem: number[] = [];
    const blockedRem: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = list[i]!;
      if (constrainTo && t.type !== constrainTo) continue;
      if (has(present, i) && !t.fractured) presentRem.push(i);
      if (has(blocked, i)) blockedRem.push(i); // an off-tier occupier is a random roll — never locked
    }
    const jpRem = constrainTo === 'suffix' ? 0 : jp;
    const jsRem = constrainTo === 'prefix' ? 0 : js;
    const total = presentRem.length + blockedRem.length + jpRem + jsRem;
    const out: Dist = new Map();
    if (total <= 0) return out;
    for (const i of presentRem) addTo(out, encodeState(present & ~bit(i), blocked, jp, js), 1 / total);
    for (const i of blockedRem) addTo(out, encodeState(present, blocked & ~bit(i), jp, js), 1 / total);
    if (jpRem > 0) addTo(out, encodeState(present, blocked, jp - 1, js), jpRem / total);
    if (jsRem > 0) addTo(out, encodeState(present, blocked, jp, js - 1), jsRem / total);
    return out;
  };

  /** Chaos = remove one uniformly-random mod, then add one weighted mod (base strength) on the freed item. */
  const chaosOutcomes = (present: number, blocked: number, jp: number, js: number): Dist => {
    const removals = removeOutcomes(present, blocked, jp, js);
    const out: Dist = new Map();
    for (const [midKey, pRem] of removals) {
      const m = decodeState(midKey);
      const adds = addOutcomes(m.present, m.blocked, m.jp, m.js, 0);
      if (adds.size === 0) { addTo(out, midKey, pRem); continue; } // no add possible → just the removal
      for (const [toKey, pAdd] of adds) addTo(out, toKey, pRem * pAdd);
    }
    return out;
  };

  const push = (acts: ActionDef[], action: McAction, dist: Dist): void => {
    if (dist.size === 0) return;
    acts.push({ action, cost: actionCostOf(prices, action), dist });
  };

  const actionsOf = (present: number, blocked: number, jp: number, js: number): ActionDef[] => {
    const acts: ActionDef[] = [];
    const sides: (undefined | 'prefix' | 'suffix')[] = [undefined];
    if (sinistralExaltOk) sides.push('prefix');
    if (dextralExaltOk) sides.push('suffix');
    for (const constrainTo of sides) {
      for (const strength of strengths) {
        push(acts, { currency: 'exalt', strength, side: constrainTo },
          addOutcomes(present, blocked, jp, js, STRENGTH_FLOOR[strength], constrainTo));
      }
    }
    for (const constrainTo of [undefined, 'prefix', 'suffix'] as const) {
      push(acts, { currency: 'annul', side: constrainTo },
        removeOutcomes(present, blocked, jp, js, constrainTo));
    }
    push(acts, { currency: 'chaos' }, chaosOutcomes(present, blocked, jp, js));
    return acts;
  };

  return { actionsOf };
}
