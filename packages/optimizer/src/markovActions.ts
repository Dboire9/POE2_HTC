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
import { DESECRATION_OFFER_COUNT, desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { CurrencyPolicy, Prices, PricedStep } from './cost.ts';
import { allowsStep, stepCost } from './cost.ts';
import type { Dist, McRarity, McState, McTarget, SideIndex } from './markovState.ts';
import {
  MAX_PER_SIDE, addTo, bit, decodeState, encodeState, has, hasDesecrated, occupiedFamilies,
  perSideCap, prefUsed, sufUsed,
} from './markovState.ts';

export type ExaltStrength = 'base' | 'greater' | 'perfect';

/** Every currency+omen the MDP can play. Exalts fan out over {side} × {strength}. */
export type McAction =
  | { readonly currency: 'exalt'; readonly strength: ExaltStrength; readonly side?: 'prefix' | 'suffix' }
  // `light` = Omen of Light: removes the item's desecrated mod outright (P=1) instead of rolling the
  // uniform 1/N. Mutually exclusive with a side omen — Light already names its target exactly.
  | { readonly currency: 'annul'; readonly side?: 'prefix' | 'suffix'; readonly light?: true }
  | { readonly currency: 'chaos' }
  // A Desecration. WITH a boss omen it draws from that boss's desecrated pool (count-uniform);
  // unconstrained it draws across both sides, and a Sinistral/Dextral Necromancy omen (`side`)
  // restricts it to one, shrinking the pool. WITHOUT a boss omen (`boss` absent) it draws by weight
  // from the base's combined normal ∪ desecrated pool — longer odds, but no omen to buy, and the only
  // desecration armour can perform at all (the boss omens are "Weapon or Jewellery" only).
  | { readonly currency: 'desecrate'; readonly boss?: DesecrationBossOmen; readonly side?: 'prefix' | 'suffix' }
  // A Perfect Essence forces one specific mod on while removing one at random. `side` is a
  // Sinistral/Dextral Crystallisation omen constraining WHICH mod the essence eats.
  | { readonly currency: 'perfect-essence'; readonly target: string; readonly side?: 'prefix' | 'suffix' }
  // The add-chain, for a craft that starts below Rare. Transmute takes a white base to Magic, Augment
  // fills the Magic item's second slot, Regal converts to Rare — each adding one random mod as it goes,
  // and each with the same Greater/Perfect strengths an Exalt has (all six variants are priced).
  | { readonly currency: 'transmute' | 'augment' | 'regal'; readonly strength: ExaltStrength }
  // Scrap what you have and buy another base. NOT a currency — it carries its own cost because the
  // price is a property of the craft (which base), not of the currency sheet. Offered only when the
  // caller says starting over is actually possible; a specific Rare in your stash cannot be rebought.
  | { readonly currency: 'restart'; readonly cost: number };

/** An action bound to a state: what it is, what it costs, and where it lands. */
export interface ActionDef {
  readonly action: McAction;
  readonly cost: number;
  /**
   * Outcome distribution of ONE draw.
   *
   * For an ordinary action that is the outcome distribution, full stop. When `offer` is set it is
   * still the per-draw distribution — the action shows `offer` draws and the player keeps the best,
   * so the solver combines these entries rather than sampling one. See `offer`.
   */
  readonly dist: Dist;
  /**
   * How many independent draws from `dist` the player is shown, of which they keep ONE (they cannot
   * decline). Absent means the ordinary single-outcome action.
   *
   * Only a Desecration has this, and it cannot be folded into `dist` ahead of time: which draw a
   * player keeps is whichever leads to the cheapest state from here, so the value of the action is
   * `E[min over the offer]`, which depends on V and has to be evaluated inside value iteration. See
   * the tail-sum identity in markovFromItem's `valueOf`.
   */
  readonly offer?: number;
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
      // No boss omen → no boss surcharge; `stepOmenIds` already prices `boss` being absent as zero
      // omens, so the step costs the bone alone (which `pricesForBase` has already resolved).
      return {
        currency: 'desecrate',
        ...(action.boss ? { boss: action.boss } : {}),
        ...(action.side ? { constrainTo: action.side } : {}),
      };
    case 'perfect-essence': {
      const omen = asOmen(action.side);
      // `target` is the mod the essence forces, which is what prices it — see PricedStep.
      return { currency: 'perfect-essence', add: action.target, ...(omen ? { omen } : {}) };
    }
    case 'transmute':
    case 'augment':
    case 'regal':
      // `tier` is what `currencyKey` turns into `regal_greater` and friends — the same mapping the
      // linear planner's add steps use, so the two cannot drift.
      return { currency: action.currency, tier: action.strength };
    default:
      return { currency: 'chaos' };
  }
}

/**
 * Cost of a single McAction from a price sheet — the same table the linear planner's steps use.
 *
 * `restart` is the one action that is not a currency purchase: it is the price of another base, which
 * belongs to the craft rather than to the sheet, so it travels on the action itself.
 */
export function actionCostOf(prices: Prices, action: McAction): number {
  if (action.currency === 'restart') return action.cost;
  return stepCost(prices, pricedStepOf(action));
}

/** Whether the player can play this action — the same permission the linear planner's steps get. */
export function allowsAction(policy: CurrencyPolicy | undefined, action: McAction): boolean {
  // Nobody can "not own" the ability to start over, so there is nothing for a policy to exclude.
  if (action.currency === 'restart') return true;
  return allowsStep(policy, pricedStepOf(action));
}

/** ilvl floor each Exalted-Orb strength imposes (mirrors pool.ts: base 0 / greater 35 / perfect 50). */
const STRENGTH_FLOOR: Record<ExaltStrength, number> = { base: 0, greater: 35, perfect: 50 };
/** Map each exalt strength to its price key in the Prices record. */
const strengthPriceKey = (s: ExaltStrength): string => s === 'base' ? 'exalt' : s === 'greater' ? 'exalt_greater' : 'exalt_perfect';
/** The price key for any add currency at a strength — `regal_greater`, `transmute_perfect`, … */
const addPriceKey = (c: 'transmute' | 'augment' | 'regal' | 'exalt', s: ExaltStrength): string =>
  s === 'base' ? c : `${c}_${s}`;

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
  /** False on armour: boss omens are "Weapon or Jewellery" only, and every desecrate action here
   *  carries one. See `bossOmenAllowed`. */
  readonly bossTargetable: boolean;
  /**
   * Whether the craft can be abandoned and begun again, and at what price.
   *
   * Absent for a held item: a specific Rare in your stash cannot be rebought, which is the whole
   * premise of the push-forward model. Present for a from-white craft, where it is not a refinement
   * but a requirement — a white base costs almost nothing, so without this action the policy is forced
   * to dig a bad Transmute out with a 158.7ex Annulment instead of throwing away 0.18ex and rerolling,
   * and every from-white number would come out far too high.
   */
  readonly restart?: { readonly cost: number; readonly dist: Dist };
}

/**
 * Build the action space for one solve. Returns `actionsOf`, which yields every action available in a
 * given state together with its cost and outcome distribution — the only thing the solver needs.
 */
export function createActionSpace(params: ActionSpaceParams): {
  actionsOf: (s: McState) => ActionDef[];
} {
  const { data, prices, level, pools, list, side, desecratable, policy, bossTargetable, restart } = params;
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

  // Slot room depends on the RARITY, not on the Rare cap: a Magic item holds one per side. The `into`
  // override is for a Regal, which converts to Rare as it adds and so places against the Rare cap.
  const prefixOpenIn = (s: McState, into: McRarity = s.rarity): boolean => prefUsed(s, side) < perSideCap(into);
  const suffixOpenIn = (s: McState, into: McRarity = s.rarity): boolean => sufUsed(s, side) < perSideCap(into);

  /** The add-distribution from a state at ilvl `floor`, optionally constrained to one side (side omen).
   *  A weighted add lands a target at tier (→ present), the target below tier (→ blocked), or foreign
   *  junk (→ jp/js). Empty if no slot is open or nothing is addable; probabilities sum to 1. */
  const addOutcomes = (
    s: McState, floor: number, constrainTo?: 'prefix' | 'suffix',
    /** Rarity the item ends at. Same as it started for an Exalt/Augment; 'magic' for a Transmute,
     *  'rare' for a Regal — those two convert as they add, which is also what opens the extra slots. */
    into: McRarity = s.rarity,
  ): Dist => {
    const prefixOpen = constrainTo !== 'suffix' && prefixOpenIn(s, into);
    const suffixOpen = constrainTo !== 'prefix' && suffixOpenIn(s, into);
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
      if (succ > 0) addTo(out, encodeState(s.present | bit(i), s.blocked, s.jp, s.js, s.desJunk, into), succ / grand);
      const below = any - succ;
      if (below > 0) addTo(out, encodeState(s.present, s.blocked | bit(i), s.jp, s.js, s.desJunk, into), below / grand);
      if (t.type === 'prefix') anyPref += any; else anySuf += any;
    }
    // Everything else the add can produce is foreign junk on its side (a non-target family).
    const junkPref = Math.max(0, prefTotal - anyPref);
    const junkSuf = Math.max(0, sufTotal - anySuf);
    if (junkPref > 0) addTo(out, encodeState(s.present, s.blocked, s.jp + 1, s.js, s.desJunk, into), junkPref / grand);
    if (junkSuf > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js + 1, s.desJunk, into), junkSuf / grand);
    return out;
  };

  /**
   * The removal distribution, optionally constrained to one side (omen annul). Removes a uniformly-
   * random removable mod: a non-fractured present target (→ absent), a blocked off-tier roll (→ frees
   * the family, target addable again), junk, or the desecrated mod if the item carries one.
   *
   * NOTHING is spared here, and that includes the desecrated mod. A Chaos Orb takes it at the same
   * uniform odds as any other affix, and so does an Annulment — which is what leaves the Omen of Light
   * something to be for: it makes that removal CERTAIN, not possible.
   *
   * There was a `sparesCarvedWhenAble` flag here for a few hours on 2026-08-24, built on a ruling that
   * a Chaos cannot touch a desecrated mod. That ruling was RETRACTED by the user in the same
   * conversation and the retraction was missed, so it shipped. See docs/validation.md.
   */
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
    const desRem = s.desJunk !== 'none' && (constrainTo === undefined || s.desJunk === constrainTo) ? 1 : 0;
    const total = presentRem.length + blockedRem.length + jpRem + jsRem + desRem;
    const out: Dist = new Map();
    if (total <= 0) return out;
    for (const i of presentRem) addTo(out, encodeState(s.present & ~bit(i), s.blocked, s.jp, s.js, s.desJunk, s.rarity), 1 / total);
    for (const i of blockedRem) addTo(out, encodeState(s.present, s.blocked & ~bit(i), s.jp, s.js, s.desJunk, s.rarity), 1 / total);
    if (jpRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp - 1, s.js, s.desJunk, s.rarity), jpRem / total);
    if (jsRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js - 1, s.desJunk, s.rarity), jsRem / total);
    if (desRem > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'none', s.rarity), desRem / total);
    return out;
  };

  /** Omen of Light: removes the item's ONE desecrated mod outright (P=1). That mod is either unwanted
   *  junk (the desJunk axis) or a desecrated TARGET sitting in the masks — worth removing only when
   *  it's blocked off-tier, which the solver decides. Empty when there's nothing desecrated to remove. */
  const lightOutcomes = (s: McState): Dist => {
    const out: Dist = new Map();
    if (s.desJunk !== 'none') {
      addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'none', s.rarity), 1);
      return out;
    }
    for (let i = 0; i < n; i++) {
      const t = list[i]!;
      if (t.mod.source !== 'desecrated') continue;
      if (has(s.present, i) && !t.fractured) { addTo(out, encodeState(s.present & ~bit(i), s.blocked, s.jp, s.js, 'none', s.rarity), 1); return out; }
      if (has(s.blocked, i)) { addTo(out, encodeState(s.present, s.blocked & ~bit(i), s.jp, s.js, 'none', s.rarity), 1); return out; }
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
      if (i >= 0) addTo(out, encodeState(s.present | bit(i), s.blocked, s.jp, s.js, s.desJunk, s.rarity), p);
      else addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, sd, s.rarity), p);
    }
    return out;
  };

  /**
   * The UNTARGETED desecration — no boss omen. The draw spans the base's combined normal ∪ desecrated
   * pool BY WEIGHT, which is exactly the model `desecrationProbability` gives the linear planner
   * (plan.ts's no-`boss` branch); keeping the two identical is the D8 lesson.
   *
   * This is the ONLY desecration an armour base can perform, since the boss omens are "Weapon or
   * Jewellery" only. On a weapon it sits alongside them as the cheap, long-odds alternative — and it
   * is what keeps a desecrated target reachable for a player who has excluded every omen. A
   * Sinistral/Dextral Necromancy omen still narrows it to one side: that omen constrains the SLOT,
   * not the boss, so no base gates it.
   *
   * Unlike a boss draw this can land a NORMAL mod, so the leftover weight splits two ways — foreign
   * normal weight becomes jp/js junk, foreign desecrated weight becomes the desJunk axis. Target
   * outcomes never touch desJunk: `hasDesecrated` already reads a desecrated target out of
   * present/blocked, and setting it here too would record one desecrated mod as two.
   */
  const desecrateAnyOutcomes = (s: McState, constrainTo?: 'prefix' | 'suffix'): Dist => {
    const out: Dist = new Map();
    if (!desecratable || hasDesecrated(s, list)) return out; // an item holds at most one desecrated mod
    const prefixOpen = constrainTo !== 'suffix' && prefixOpenIn(s);
    const suffixOpen = constrainTo !== 'prefix' && suffixOpenIn(s);
    const occ = occupiedFamilies(s.present, s.blocked, list);
    // Preserved bones are unrestricted ("Minimum Modifier Level" is an Ancient-grade line), and every
    // desecrated mod in the data is ilvl 65, so the strength floor is 0. See desecrationBoneFor.
    const weigh = (ids: readonly string[], open: boolean): number =>
      (open ? poolTotalWeight(data, ids, 0, level, occ) : 0);
    const prefNormal = weigh(pools.normal.prefixes, prefixOpen);
    const prefDes = weigh(pools.desecrated.prefixes, prefixOpen);
    const sufNormal = weigh(pools.normal.suffixes, suffixOpen);
    const sufDes = weigh(pools.desecrated.suffixes, suffixOpen);
    const grand = prefNormal + prefDes + sufNormal + sufDes;
    if (grand <= 0) return out;
    // Whole-family weight claimed by TARGETS, split by side and by which pool it came out of, so the
    // residue lands on the right junk axis.
    const claimed = {
      prefix: { normal: 0, desecrated: 0 },
      suffix: { normal: 0, desecrated: 0 },
    };
    for (let i = 0; i < n; i++) {
      if (has(s.present, i) || has(s.blocked, i)) continue; // family already occupied
      const t = list[i]!;
      const src = t.mod.source;
      if (src !== 'normal' && src !== 'desecrated') continue; // essence-only mods are in neither pool
      if (excluded(t.mod, occ)) continue;
      if (!(t.type === 'prefix' ? prefixOpen : suffixOpen)) continue;
      const succ = succWeight(t, 0);
      const any = anyWeight(t, 0);
      if (succ > 0) addTo(out, encodeState(s.present | bit(i), s.blocked, s.jp, s.js, s.desJunk, s.rarity), succ / grand);
      const below = any - succ;
      if (below > 0) addTo(out, encodeState(s.present, s.blocked | bit(i), s.jp, s.js, s.desJunk, s.rarity), below / grand);
      claimed[t.type][src] += any;
    }
    const residue = (total: number, taken: number): number => Math.max(0, total - taken);
    const junkPref = residue(prefNormal, claimed.prefix.normal);
    const junkSuf = residue(sufNormal, claimed.suffix.normal);
    const desPref = residue(prefDes, claimed.prefix.desecrated);
    const desSuf = residue(sufDes, claimed.suffix.desecrated);
    if (junkPref > 0) addTo(out, encodeState(s.present, s.blocked, s.jp + 1, s.js, s.desJunk, s.rarity), junkPref / grand);
    if (junkSuf > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js + 1, s.desJunk, s.rarity), junkSuf / grand);
    if (desPref > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'prefix', s.rarity), desPref / grand);
    if (desSuf > 0) addTo(out, encodeState(s.present, s.blocked, s.jp, s.js, 'suffix', s.rarity), desSuf / grand);
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
      if (empty) addTo(out, encodeState(bit(i), 0, 0, 0, 'none', s.rarity), 1);
      return out;
    }
    for (const [midKey, p] of removals) {
      const mid = decodeState(midKey);
      addTo(out, encodeState(mid.present | bit(i), mid.blocked, mid.jp, mid.js, mid.desJunk, s.rarity), p);
    }
    return out;
  };
  const perfectTargets = list.map((t, i) => (t.mod.source === 'perfect_essence' ? i : -1)).filter((i) => i >= 0);
  const crystallisationOk = (sd: 'prefix' | 'suffix'): boolean =>
    omenOk(sd === 'prefix' ? 'OmenofSinistralCrystallisation' : 'OmenofDextralCrystallisation');

  // The one place an action enters the space, so the one place exclusion has to hold. The `*Ok` gates
  // below also consult the policy, but only to avoid building distributions that would be thrown away
  // here — this is what makes the guarantee, not them.
  const push = (acts: ActionDef[], action: McAction, dist: Dist, offer?: number): void => {
    if (dist.size === 0) return;
    if (!allowsAction(policy, action)) return;
    acts.push({ action, cost: actionCostOf(prices, action), dist, ...(offer === undefined ? {} : { offer }) });
  };

  /** Strengths this add currency can be bought at: base always, the rest only if priced and allowed. */
  const strengthsFor = (c: 'transmute' | 'augment' | 'regal'): ExaltStrength[] =>
    (['base', 'greater', 'perfect'] as const)
      .filter((st) => st === 'base' || prices.currency[addPriceKey(c, st)] !== undefined)
      .filter((st) => notExcluded(addPriceKey(c, st)));

  const actionsOf = (s: McState): ActionDef[] => {
    const acts: ActionDef[] = [];

    // ── Below Rare: the add-chain, and nothing else that needs a Rare item ────────────────────────
    // Transmute converts Normal→Magic, Regal converts Magic→Rare, and both add a mod as they do it —
    // which is why `addOutcomes` takes the rarity it lands in, not the one it started from. An Exalt,
    // a Chaos, a Desecration and a Perfect Essence all require a Rare item and are simply absent here;
    // that is the game's rule, enforced in plan.ts for the other planner and here for this one.
    if (s.rarity !== 'rare') {
      const chain: ('transmute' | 'augment' | 'regal')[] = s.rarity === 'normal' ? ['transmute'] : ['augment', 'regal'];
      for (const currency of chain) {
        const into: McRarity = currency === 'regal' ? 'rare' : 'magic';
        for (const strength of strengthsFor(currency)) {
          push(acts, { currency, strength }, addOutcomes(s, STRENGTH_FLOOR[strength], undefined, into));
        }
      }
      // An Annulment works on a Magic item too. It is nearly always the wrong move there — 158.7ex to
      // undo a 0.18ex Transmute — but the policy should reach that conclusion from the prices rather
      // than from the action being hidden.
      for (const constrainTo of [undefined, 'prefix', 'suffix'] as const) {
        push(acts, { currency: 'annul', ...(constrainTo ? { side: constrainTo } : {}) }, removeOutcomes(s, constrainTo));
      }
      if (restart) push(acts, { currency: 'restart', cost: restart.cost }, restart.dist);
      return acts;
    }

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
      // The untargeted draw is always available: it needs no omen, so nothing about the base or the
      // player's omen stock can gate it. On armour it is the ONLY desecration (see
      // desecrateAnyOutcomes); everywhere else it is the cheap alternative to a boss omen.
      //
      // It is pushed FIRST deliberately. `bestAction` breaks ties with a strict `<`, so the earliest
      // action wins when two score identically — and two CAN, whenever the boss's pool happens to be
      // the whole legal pool. Preferring the omen-free action there is the better answer: same odds,
      // same cost, one fewer thing the player must own.
      push(acts, { currency: 'desecrate' }, desecrateAnyOutcomes(s), DESECRATION_OFFER_COUNT);
      for (const sd of ['prefix', 'suffix'] as const) {
        if (necromancyOk(sd)) push(acts, { currency: 'desecrate', side: sd }, desecrateAnyOutcomes(s, sd), DESECRATION_OFFER_COUNT);
      }
      // Boss targeting is "Weapon or Jewellery" only — offering it on armour would plan a step the
      // game refuses.
      if (bossTargetable) {
        for (const boss of ['blackblooded', 'liege', 'sovereign'] as const) {
          push(acts, { currency: 'desecrate', boss }, desecrateOutcomes(s, boss), DESECRATION_OFFER_COUNT);
          for (const sd of ['prefix', 'suffix'] as const) {
            if (necromancyOk(sd)) push(acts, { currency: 'desecrate', boss, side: sd }, desecrateOutcomes(s, boss, sd), DESECRATION_OFFER_COUNT);
          }
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
    if (restart) push(acts, { currency: 'restart', cost: restart.cost }, restart.dist);
    return acts;
  };

  return { actionsOf };
}
