import type { AffixType, CurrencyTier, ItemBase, ItemState, Mod, PatchData, PlacedMod } from './types.ts';
import { CURRENCY_FLOOR } from './types.ts';
import { familiesOf, familyAvailable, itemFamilies, modTierWeight, poolTotalWeight, resolveMod } from './pool.ts';
import { prefixCount, prefixesFull, suffixCount, suffixesFull, whiteItem } from './item.ts';

export interface AddAffixOptions {
  /** Currency-strength floor ilvl. Default 0 (base). */
  floor?: number;
  /** Only the desired tier and better (higher ilvl). Index into mod.tiers. Default 0 (any tier). */
  minTierIndex?: number;
  /** Omen constraint: restrict the roll to one side (Sinistral = prefix, Dextral = suffix). */
  constrainTo?: AffixType;
  /**
   * Families already on the item, excluded from the denominator (real-game family exclusion, D6).
   * Omit for the Java-parity denominator (no exclusion). The currency wrappers set this from the item.
   */
  occupiedFamilies?: ReadonlySet<string>;
  /**
   * Max mods per side for the slot-branch: magic = 1, rare = 3 (D2). Default 3 (Java-parity, which
   * treats every rarity as 3+3). The currency wrappers set this from the currency's result rarity.
   */
  slotLimit?: number;
}

/**
 * Analytic probability that adding one random affix yields `desiredModId`.
 * Faithful port of `ExaltAndRegalProbability.NormalCompute` (shared by transmute/aug/regal/exalt):
 *
 *   numerator   = summed weight of the desired mod's eligible tiers
 *   denominator = total eligible weight of the pool(s) the roll draws from, per the slot state
 *
 * The caller is responsible for legality (family available, correct rarity/slots) — this only does
 * the weight-pool math, exactly as the Java routine does.
 */
export function addAffixProbability(data: PatchData, item: ItemState, desiredModId: string, opts: AddAffixOptions = {}): number {
  return addAffixProbabilityFromPools(
    data, item, desiredModId, item.base.pools.normal.prefixes, item.base.pools.normal.suffixes, opts,
  );
}

/**
 * Shared slot-branch weight-pool math, parameterised by the prefix/suffix id-pools it draws from.
 * `addAffixProbability` passes the base's normal pools; desecration passes normal ∪ desecrated.
 */
function addAffixProbabilityFromPools(
  data: PatchData, item: ItemState, desiredModId: string,
  prefixPool: readonly string[], suffixPool: readonly string[], opts: AddAffixOptions = {},
): number {
  const mod = resolveMod(data, desiredModId);
  const floor = opts.floor ?? 0;
  const cap = item.level;
  const constrainTo = opts.constrainTo;

  // A one-sided omen can't produce a mod of the other side.
  if (constrainTo !== undefined && mod.type !== constrainTo) return 0;

  const weight = modTierWeight(mod, floor, cap, opts.minTierIndex ?? 0);
  if (weight === 0) return 0;

  const usePrefixes = constrainTo !== 'suffix';
  const useSuffixes = constrainTo !== 'prefix';
  const exclude = opts.occupiedFamilies;
  const totalPrefix = usePrefixes ? poolTotalWeight(data, prefixPool, floor, cap, exclude) : 0;
  const totalSuffix = useSuffixes ? poolTotalWeight(data, suffixPool, floor, cap, exclude) : 0;

  const limit = opts.slotLimit ?? 3;
  const pf = prefixCount(item);
  const sf = suffixCount(item);
  const hasPrefixes = usePrefixes && totalPrefix > 0;
  const hasSuffixes = useSuffixes && totalSuffix > 0;

  // Both sides open → draw from the combined pool.
  if (pf < limit && sf < limit && hasPrefixes && hasSuffixes) {
    return weight / (totalPrefix + totalSuffix);
  }
  // Only prefixes reachable (suffixes full or unavailable).
  if (mod.type === 'prefix' && pf < limit && hasPrefixes && (sf >= limit || !hasSuffixes)) {
    return weight / totalPrefix;
  }
  // Only suffixes reachable.
  if (mod.type === 'suffix' && sf < limit && hasSuffixes && (pf >= limit || !hasPrefixes)) {
    return weight / totalSuffix;
  }
  return 0;
}

/** Currencies that add one random NORMAL-pool affix — they share the same weight-pool math and
 *  differ only in the item rarity they act on. */
export type NormalAddCurrency = 'transmute' | 'augment' | 'regal' | 'exalt';

/** Rarity a currency legally acts on (transmute white, aug/regal magic, exalt rare). */
const VALID_RARITY: Record<NormalAddCurrency, ReadonlySet<ItemState['rarity']>> = {
  transmute: new Set(['normal']),
  augment: new Set(['magic']),
  regal: new Set(['magic']),
  exalt: new Set(['rare']),
};

/**
 * Max mods per side for the slot-branch, by the RESULT rarity of the currency (D2, magic = 1+1):
 * transmute/augment leave the item Magic (1/side); regal/exalt leave it Rare (3/side). So augment on
 * a 1-prefix Magic item can only add a suffix, while regal (which converts to Rare) may add either.
 */
const RESULT_SLOT_LIMIT: Record<NormalAddCurrency, number> = {
  transmute: 1, augment: 1, regal: 3, exalt: 3,
};

export interface CurrencyOptions {
  /** Orb strength (raises the tier floor). Default 'base'. */
  currencyTier?: CurrencyTier;
  /** Desired tier or better. Default 0 (any tier of the mod). */
  minTierIndex?: number;
  /** Omen: 'prefix' (Sinistral) or 'suffix' (Dextral). */
  constrainTo?: AffixType;
}

/**
 * Probability that `currency` adds `desiredModId` to `item`, 0 if the move is illegal: wrong rarity,
 * mod not a normal-pool mod of the base, its family already present, or its side is full. Legal
 * cases defer to the shared `addAffixProbability` (the Java NormalCompute math).
 */
export function addNormalAffixProbability(
  data: PatchData, item: ItemState, currency: NormalAddCurrency, desiredModId: string, opts: CurrencyOptions = {},
): number {
  if (!VALID_RARITY[currency].has(item.rarity)) return 0;
  const mod = data.mods.get(desiredModId);
  if (!mod || mod.source !== 'normal') return 0;
  const pool = item.base.pools.normal;
  if (!pool.prefixes.includes(desiredModId) && !pool.suffixes.includes(desiredModId)) return 0;
  if (!familyAvailable(data, item, mod)) return 0;
  const limit = RESULT_SLOT_LIMIT[currency]; // magic result = 1/side, rare result = 3/side (D2)
  if (mod.type === 'prefix' && item.prefixes.length >= limit) return 0;
  if (mod.type === 'suffix' && item.suffixes.length >= limit) return 0;

  const addOpts: AddAffixOptions = {
    floor: CURRENCY_FLOOR[opts.currencyTier ?? 'base'],
    occupiedFamilies: itemFamilies(data, item), // real-game family exclusion (D6)
    slotLimit: limit, // magic 1+1 slot enforcement (D2)
  };
  if (opts.minTierIndex !== undefined) addOpts.minTierIndex = opts.minTierIndex;
  if (opts.constrainTo !== undefined) addOpts.constrainTo = opts.constrainTo;
  return addAffixProbability(data, item, desiredModId, addOpts);
}

export interface TransmuteOptions extends CurrencyOptions {
  /** Item level (tier ilvl cap). Default 100. */
  level?: number;
}

/** Transmutation orb on a white `base` → one random normal affix (both slots open). */
export function transmuteProbability(data: PatchData, base: ItemBase, desiredModId: string, opts: TransmuteOptions = {}): number {
  return addNormalAffixProbability(data, whiteItem(base, opts.level ?? 100), 'transmute', desiredModId, opts);
}

/** Augmentation orb on a magic `item` → fills its open affix slot from the normal pool. */
export function augmentationProbability(data: PatchData, item: ItemState, desiredModId: string, opts: CurrencyOptions = {}): number {
  return addNormalAffixProbability(data, item, 'augment', desiredModId, opts);
}

/** Regal orb on a magic `item` (→ rare) → adds one normal affix. */
export function regalProbability(data: PatchData, item: ItemState, desiredModId: string, opts: CurrencyOptions = {}): number {
  return addNormalAffixProbability(data, item, 'regal', desiredModId, opts);
}

/** Exalted orb on a rare `item` → adds one normal affix to an open slot. */
export function exaltProbability(data: PatchData, item: ItemState, desiredModId: string, opts: CurrencyOptions = {}): number {
  return addNormalAffixProbability(data, item, 'exalt', desiredModId, opts);
}

/** Annulment omen: none (any mod), sinistral (prefix only), dextral (suffix only), light (desecrated). */
export type AnnulOmen = 'none' | 'sinistral' | 'dextral' | 'light';

/**
 * Omens that change what a CHAOS ORB removes.
 *
 * `whittling` is the Omen of Whittling, and it is a CHAOS omen — not an Annulment one. Traced to
 * poe2db 2026-09-02: *"your next Chaos Orb will remove the lowest level modifier"*, internal id
 * `OmenOnChaosLowestLevelMod`. Worth stating because it is easy to assume otherwise from how players
 * describe the slam-and-clean loop, and TODO 12 specified it as an Annulment omen throughout.
 *
 * **"Lowest LEVEL", not "lowest tier".** The distinction is not pedantry: tier numbers are per-mod and
 * not comparable across mods (a T5 of a five-tier mod is its worst roll; a T5 of a ten-tier mod is
 * mid-range), so "lowest tier" would have no well-defined meaning on an item carrying both. Item
 * level is one scale for every mod on the item, and every tier already carries its `ilvl`.
 *
 * The Sinistral/Dextral Erasure omens ("remove only prefix/suffix modifiers") are the other two chaos
 * omens and are deliberately NOT modelled here yet — see `stepOmenIds` in the optimizer for why the
 * `constrainTo` field on a chaos step is a different thing from them.
 */
export type ChaosOmen = 'none' | 'whittling';

/**
 * The modifiers an Omen of Whittling would consider "lowest level" on this item.
 *
 * Returns every removable mod tied at the minimum tier ilvl, so a caller can price the tie. A
 * FRACTURED mod is excluded, as it is from every other removal pool — it cannot be taken.
 *
 * A placed mod's level is the ilvl of the TIER IT WAS ROLLED AT, which is why `addMod` had to start
 * honouring a step's `minTierIndex` before this could mean anything: while every mid-plan add landed
 * at tier 0 — the lowest ilvl a mod has — everything a plan added tied for lowest.
 */
export function lowestLevelMods(data: PatchData, item: ItemState): string[] {
  const placed = [...item.prefixes, ...item.suffixes].filter((p) => !p.fractured);
  const levelOf = (p: PlacedMod): number => {
    const mod = data.mods.get(p.modId);
    const tier = mod?.tiers.find((t) => t.name === p.tierName);
    // An unresolvable tier falls back to the mod's lowest, which is the conservative reading: it can
    // only make the mod look MORE likely to be whittled, never less.
    return tier?.ilvl ?? mod?.tiers[0]?.ilvl ?? 0;
  };
  if (placed.length === 0) return [];
  const min = Math.min(...placed.map(levelOf));
  return placed.filter((p) => levelOf(p) === min).map((p) => p.modId);
}

/**
 * Probability that an Orb of Annulment removes the mod `targetModId` currently on `item`.
 * Faithful port of `AnnulProbability.ComputePercentageAnnul` — annul removes a uniformly random mod:
 *   none      → 1 / (total mods)
 *   sinistral → 1 / (prefixes)   for a prefix,  else 0
 *   dextral   → 1 / (suffixes)   for a suffix,  else 0
 *   light     → 1 if the target is a desecrated mod on a desecrated item, else 0
 * Returns 0 if the target isn't on the item.
 */
export function annulProbability(data: PatchData, item: ItemState, targetModId: string, opts: { omen?: AnnulOmen } = {}): number {
  const onPrefix = item.prefixes.some((p) => p.modId === targetModId);
  const onSuffix = item.suffixes.some((p) => p.modId === targetModId);
  if (!onPrefix && !onSuffix) return 0;
  // A fractured mod is locked — it can't be the one annulled, and it's excluded from the removal pool
  // (so removing any OTHER mod is likelier). Only non-fractured mods are removal candidates.
  const placed = [...item.prefixes, ...item.suffixes].find((p) => p.modId === targetModId);
  if (placed?.fractured) return 0;

  const pf = item.prefixes.filter((p) => !p.fractured).length;
  const sf = item.suffixes.filter((p) => !p.fractured).length;
  switch (opts.omen ?? 'none') {
    case 'none': return pf + sf > 0 ? 1 / (pf + sf) : 0;
    case 'sinistral': return onPrefix && pf > 0 ? 1 / pf : 0;
    case 'dextral': return onSuffix && sf > 0 ? 1 / sf : 0;
    case 'light': {
      const mod = data.mods.get(targetModId);
      return item.desecrated === true && mod?.source === 'desecrated' ? 1 : 0;
    }
  }
}

/** Remove the first placed mod matching `modId` (prefixes then suffixes), keeping rarity/level. */
function removeFromItem(item: ItemState, modId: string): ItemState {
  const drop = (arr: readonly PlacedMod[]): PlacedMod[] => {
    const i = arr.findIndex((p) => p.modId === modId);
    return i < 0 ? [...arr] : [...arr.slice(0, i), ...arr.slice(i + 1)];
  };
  const inPrefix = item.prefixes.some((p) => p.modId === modId);
  return { ...item, prefixes: inPrefix ? drop(item.prefixes) : [...item.prefixes], suffixes: inPrefix ? [...item.suffixes] : drop(item.suffixes) };
}

/**
 * Chaos Orb (PoE2): on a **Rare** item, remove one **uniformly-random** existing mod and add one new
 * **weighted** mod. The probability of the specific swap "remove `removeModId`, add `addModId`" factors
 * cleanly into P(remove it) × P(add it):
 *   • removal = a no-omen Annulment → 1 / (total mods on the item), 0 if the mod isn't there;
 *   • add     = an Exalt on the freed item → weighted, any open side (the add is NOT tied to the removed
 *     mod's side — a removed suffix can be replaced by a prefix), family-excluding the mods that remain.
 * `opts` tune the add (orb tier, tier target).
 *
 * With an **Omen of Whittling** the removal stops being uniform and becomes the lowest-LEVEL modifier
 * — see `ChaosOmen`. The add is untouched by the omen, so the factorisation still holds and only the
 * first factor changes.
 */
export function chaosProbability(
  data: PatchData, item: ItemState, removeModId: string, addModId: string,
  opts: CurrencyOptions & { omen?: ChaosOmen } = {},
): number {
  if (item.rarity !== 'rare') return 0; // Chaos Orbs act on Rare items
  const removeP = chaosRemovalProbability(data, item, removeModId, opts.omen ?? 'none');
  if (removeP === 0) return 0;
  return removeP * exaltProbability(data, removeFromItem(item, removeModId), addModId, opts);
}

/**
 * P(a Chaos Orb removes `removeModId`), which is the only factor an omen touches.
 *
 * Without an omen this is a no-omen Annulment: uniform over the removable mods. With Whittling the
 * game takes the lowest-level modifier, so the target is taken iff it IS that modifier.
 *
 * **The tie is the one untraced piece, and is modelled by RULING rather than by evidence.** Where
 * several mods share the lowest level, poe2db's text ("will remove the lowest level modifier") does
 * not say which the game picks. Uniform among the tied is modelled — 50/50 on two, 1/k on k — which
 * the user chose on 2026-09-02 and which matches every other pick-among-equals in this engine (an
 * unomened Annulment, a boss-omened Desecration). Note what that is and is not: a decision to model
 * it this way, NOT an observation of the game. It stays on docs/validation.md's deferred list until
 * someone sees a tie resolve in play. It is also the conservative direction for the common
 * case: a plan that whittles junk off gets a LOWER probability than a deterministic tiebreak in its
 * favour would give it, so the model cannot flatter such a plan.
 */
export function chaosRemovalProbability(
  data: PatchData, item: ItemState, removeModId: string, omen: ChaosOmen = 'none',
): number {
  if (omen !== 'whittling') return annulProbability(data, item, removeModId);
  const placed = [...item.prefixes, ...item.suffixes].find((p) => p.modId === removeModId);
  if (!placed || placed.fractured === true) return 0;
  const lowest = lowestLevelMods(data, item);
  return lowest.includes(removeModId) ? 1 / lowest.length : 0;
}

/** Number of modifiers an Orb of Alchemy rolls onto a white item (PoE2: fixed at 4). */
export const ALCHEMY_MOD_COUNT = 4;

/**
 * Orb of Alchemy (PoE2): a white item becomes Rare with 4 modifiers rolled at once — equivalent to 4
 * sequential weighted draws from the normal pool without replacement (family-excluded, max 3 per side,
 * random side). Returns P(all of `targetModIds` land among the 4). Exact via recursion over the draws
 * (each level's pool shrinks as families fill and a side caps out); "any tier" targets for now. 0 if a
 * target is off-pool, if there are >4 targets, or if the targets can't co-exist (shared family / side).
 */
export function alchemyProbability(
  data: PatchData, base: ItemBase, targetModIds: readonly string[], opts: { level?: number } = {},
): number {
  const level = opts.level ?? 100;
  const targets = new Set(targetModIds);
  if (targets.size === 0 || targets.size > ALCHEMY_MOD_COUNT) return 0;
  const build = (ids: readonly string[], side: AffixType) =>
    ids.map((id) => { const m = resolveMod(data, id); return { id, families: familiesOf(m), side, w: modTierWeight(m, 0, level, 0) }; })
      .filter((x) => x.w > 0);
  const pre = build(base.pools.normal.prefixes, 'prefix');
  const suf = build(base.pools.normal.suffixes, 'suffix');
  const reachable = new Set([...pre, ...suf].map((x) => x.id));
  for (const t of targets) if (!reachable.has(t)) return 0;

  const limit = 3; // max mods per side on a Rare
  const need = new Set(targets);
  const occupied = new Set<string>();
  const f = (draws: number, pf: number, sf: number): number => {
    if (need.size === 0) return 1;      // every target already landed
    if (draws < need.size) return 0;    // too few draws left to catch them all
    const pool = [...(pf < limit ? pre : []), ...(sf < limit ? suf : [])]
      .filter((x) => !x.families.some((f) => occupied.has(f)));
    let total = 0;
    for (const x of pool) total += x.w;
    if (total === 0) return 0;
    let p = 0;
    for (const x of pool) {
      // A mod occupies ALL of its families for the rest of this branch, not just the primary one.
      const added = x.families.filter((fam) => !occupied.has(fam));
      for (const fam of added) occupied.add(fam);
      const wasNeeded = need.delete(x.id); // true iff x was a still-needed target
      p += (x.w / total) * f(draws - 1, x.side === 'prefix' ? pf + 1 : pf, x.side === 'suffix' ? sf + 1 : sf);
      if (wasNeeded) need.add(x.id);
      for (const fam of added) occupied.delete(fam);
    }
    return p;
  };
  return f(ALCHEMY_MOD_COUNT, 0, 0);
}

/** Essence omen: none (any mod removed), sinistral (prefix-only removal), dextral (suffix-only removal). */
export type EssenceOmen = 'none' | 'sinistral' | 'dextral';

/**
 * Probability that a **perfect essence** removes the specific mod `removedModId`.
 * A perfect essence adds its guaranteed mod (of slot `essenceType`, deterministic — see
 * `essenceForcedProbability`) while removing one random existing mod; this is that random-remove
 * component. Faithful port of `EssenceProbability.ComputePercentageEssence` (pf/sf = prefix/suffix
 * counts *before* the essence):
 *
 *   none      → 1/pf if the essence adds a prefix and the item has no suffixes (sf===0, pf!==0);
 *               1/sf symmetrically for a suffix essence with no prefixes; otherwise 1/(pf+sf)
 *   sinistral → 1/pf, but 0 unless the removed mod is a prefix
 *   dextral   → 1/sf, but 0 unless the removed mod is a suffix
 *
 * Returns 0 if `removedModId` isn't on the item.
 */
export function perfectEssenceProbability(
  data: PatchData,
  item: ItemState,
  essenceType: AffixType,
  removedModId: string,
  opts: { omen?: EssenceOmen } = {},
): number {
  const onPrefix = item.prefixes.some((p) => p.modId === removedModId);
  const onSuffix = item.suffixes.some((p) => p.modId === removedModId);
  if (!onPrefix && !onSuffix) return 0;
  // Fractured mods are locked: never the one removed, and out of the removal pool (see annulProbability).
  const placed = [...item.prefixes, ...item.suffixes].find((p) => p.modId === removedModId);
  if (placed?.fractured) return 0;

  const pf = item.prefixes.filter((p) => !p.fractured).length;
  const sf = item.suffixes.filter((p) => !p.fractured).length;
  switch (opts.omen ?? 'none') {
    case 'none': {
      if (essenceType === 'prefix' && sf === 0 && pf !== 0) return 1 / pf;
      if (essenceType === 'suffix' && pf === 0 && sf !== 0) return 1 / sf;
      return pf + sf > 0 ? 1 / (pf + sf) : 0;
    }
    case 'sinistral': return onPrefix && pf > 0 ? 1 / pf : 0;
    case 'dextral': return onSuffix && sf > 0 ? 1 / sf : 0;
  }
}

/**
 * A non-perfect essence (Lesser/Normal/Greater) forces its guaranteed mod, deterministically — so
 * the probability of obtaining it is 1 (no weights; user: "the essence is deterministic"). Per the
 * PoE2 rule these apply ONLY to a **Magic** item (adding the mod and converting it to Rare), never a
 * white or an already-Rare item. Returns 1 only if the forced add is legal: item is Magic, the mod
 * exists, its side has an open slot, its family isn't already present, and the chosen essence level's
 * tier is within the item's level; otherwise 0. `essenceTier` selects which level (Lesser/Normal/
 * Greater) — an essence mod's tiers ARE its levels; it defaults to the lowest (Lesser).
 */
export function essenceForcedProbability(
  data: PatchData, item: ItemState, forcedModId: string, essenceTier?: number,
): number {
  if (item.rarity !== 'magic') return 0; // regular essences apply only to magic items
  const mod = data.mods.get(forcedModId);
  if (!mod) return 0;
  const slotOpen = mod.type === 'prefix' ? !prefixesFull(item) : !suffixesFull(item);
  if (!slotOpen) return 0;
  if (!familyAvailable(data, item, mod)) return 0;
  const tier = mod.tiers[essenceTier ?? 0];
  if (tier === undefined || tier.ilvl > item.level) return 0;
  return 1;
}

/** Desecration boss omen: Blackblooded=Kurgal, Liege=Amanamu, Sovereign=Ulaman. */
export type DesecrationBossOmen = 'blackblooded' | 'liege' | 'sovereign';
const DES_BOSS_TAG: Record<DesecrationBossOmen, string> = {
  blackblooded: 'kurgal_mod', liege: 'amanamu_mod', sovereign: 'ulaman_mod',
};

/**
 * The boss omen that targets a desecrated mod, from the mod's own boss tag — the inverse of
 * `DES_BOSS_TAG`. Every desecrated mod carries exactly one boss tag (kurgal/amanamu/ulaman), so its
 * omen is unambiguous. Returns undefined for a mod with no boss tag (not a desecrated mod). This is
 * how the optimizer picks the omen that makes a specific desecrated mod craftable (P = 1/N over that
 * boss's slot pool).
 */
/**
 * Which bone a Desecration consumes, by base category. Straight from the item text:
 *   Jawbone    — "Desecrates a Rare Weapon or Quiver"
 *   Rib        — "Desecrates a Rare Armour"
 *   Collarbone — "Desecrates a Rare Amulet, Ring or Belt"
 *   Cranium    — "Desecrates a Rare Jewel"        (no Jewel bases exist in this app)
 *
 * A game MECHANIC rather than extracted data, so it lives here beside DES_BOSS_TAG and CURRENCY_FLOOR
 * rather than in data/patches — those hold what the poe2db extraction produces, and this is neither
 * extracted nor regenerated.
 *
 * An unknown category falls back to `rib`, which is the conservative answer for both things this
 * drives: a mid-priced bone, and NO boss targeting (see below). Claiming a plan works when it can't is
 * the worse failure.
 */
export type DesecrationBone = 'jawbone' | 'rib' | 'collarbone';

const BONE_BY_CATEGORY: Record<string, DesecrationBone> = {
  // "Weapon or Quiver"
  Bows: 'jawbone', Crossbows: 'jawbone', OneHand_Maces: 'jawbone', Quarterstaves: 'jawbone',
  Sceptres: 'jawbone', Spears: 'jawbone', Staves: 'jawbone', TwoHand_Maces: 'jawbone',
  Wands: 'jawbone', Quivers: 'jawbone',
  // "Armour" — shields, bucklers and foci included: all carry armour/evasion/energy-shield.
  Body_Armours: 'rib', Boots: 'rib', Gloves: 'rib', Helmets: 'rib',
  Shields: 'rib', Bucklers: 'rib', Foci: 'rib',
  // "Amulet, Ring or Belt"
  // Belts were listed in this comment for weeks before the category existed, and the fallthrough was
  // NOT harmless: `?? 'rib'` would have charged a belt the armour bone (0.41ex against the
  // collarbone's 4.69ex on the 2026-09-02 sheet, ~11x under) and, because `bossOmenAllowed` is
  // defined as "not rib", silently refused the boss omens the game does allow on a belt.
  Amulets: 'collarbone', Rings: 'collarbone', Belts: 'collarbone',
};

export function desecrationBoneFor(category: string): DesecrationBone {
  return BONE_BY_CATEGORY[category] ?? 'rib';
}

/**
 * Whether a Desecration on this base can be boss-targeted.
 *
 * The omens say "your next **Weapon or Jewellery** Desecration attempt will guarantee a random
 * Ulaman/Amanamu/Kurgal modifier" — so on ARMOUR there is no way to force a boss's pool at all. That
 * covers 342 of the app's 527 desecrated mods, every one of which the planner used to happily target
 * with an omen the game would refuse. Desecration still works there; it just draws from the whole pool
 * (`desecrationProbability`) instead of the boss's 1/N.
 *
 * Weapon-or-Jewellery is exactly "not armour", i.e. the jawbone and collarbone groups.
 */
export function bossOmenAllowed(category: string): boolean {
  return desecrationBoneFor(category) !== 'rib';
}

/**
 * Whether this mod is an ESSENCE modifier — regular or perfect.
 *
 * PoE2 rule: **an item carries at most one essence modifier at a time.** A Perfect Essence cannot be
 * applied to an item that already holds a regular-essence mod, and vice versa, so the cap is on the
 * COMBINED count, not one per kind. The two kinds are otherwise unrelated: they draw from disjoint
 * pools (317 `essence` mods vs 363 `perfect_essence`, zero id overlap) and apply at opposite
 * rarities — a regular essence needs a Magic item and turns it Rare, a Perfect Essence works on a
 * Rare. It is only this one-per-item cap that they share.
 *
 * Exported as one predicate because three planners and two pickers all need the same rule, and
 * re-deriving `source === ...` at each site is how the D8 desecration mispricing survived. Every
 * caller counts with THIS, and phrases its own rejection message.
 */
export function isEssenceMod(mod: Mod): boolean {
  return mod.source === 'essence' || mod.source === 'perfect_essence';
}

export function desecrationOmenForMod(mod: Mod): DesecrationBossOmen | undefined {
  for (const omen of ['blackblooded', 'liege', 'sovereign'] as const) {
    if (mod.tags.includes(DES_BOSS_TAG[omen])) return omen;
  }
  return undefined;
}

/**
 * How many modifiers one Desecration puts in front of the player to choose between.
 *
 * A bone does not apply a random mod — it OFFERS this many and you take one (you cannot decline; if
 * every offer is bad you still take one). Confirmed by the user, 2026-08-24.
 *
 * This lives OUTSIDE the three probability primitives on purpose. Those answer "what does one draw
 * produce" — `desecrationBossProbability` and `desecrationBossAnySideProbability` are faithful ports
 * of Java's `DesProbability` and are pinned by a differential fixture, which is the oracle for the
 * per-draw number and must stay untouched. The offer is a property of SPENDING a bone, so it is
 * applied by the callers that spend one (`plan.ts`'s desecrate step, and the MDP's desecrate actions).
 */
export const DESECRATION_OFFER_COUNT = 3;

/**
 * P(the mod you want is somewhere in the offer), from the probability that ONE draw produces it.
 *
 * Treats the offered mods as independent draws. They are drawn from a pool of hundreds whose weights
 * total ~130,000, and no single mod carries a meaningful share of that, so whether the game draws with
 * or without replacement moves this by far less than the assumed desecrated spawn weight already does
 * (see D4). Worth ~3x on a real base: a specific desecrated mod on a Body Armour goes 0.74% -> 2.21%.
 */
export function desecrationOffered(pSingleDraw: number): number {
  if (pSingleDraw <= 0) return 0;
  if (pSingleDraw >= 1) return 1;
  return 1 - (1 - pSingleDraw) ** DESECRATION_OFFER_COUNT;
}

/**
 * Boss-omen desecration probability, restricted to the added mod's own slot — a faithful port of
 * `DesProbability.ComputePercentageDesecrated_currency`. A boss omen forces the desecration to add a
 * uniformly-random mod from that boss's desecrated pool for that slot:
 *   P = 1 / (count of that boss's desecrated mods of the slot), 0 unless `desiredModId` carries the
 *   boss tag.
 * Java is COUNT-uniform here — it ignores mod weights (the 0.5 boss pools mix weights 1/3/1000, all
 * counted as one) — so this mirrors that exactly. When real weight-based desecration is adopted at
 * the poe2db refresh this becomes weight/Σweight; tracked for Phase 3.
 *
 * PER D8 (see docs/validation.md) this per-slot number is the **side-constrained** case: it is what a
 * Desecration yields once a Sinistral/Dextral Necromancy omen has locked the draw to one side. The
 * UNCONSTRAINED draw spans both sides — see `desecrationBossAnySideProbability`. Java models only this
 * narrow path, so this function (and its differential fixture) stays exactly as ported.
 */
export function desecrationBossProbability(
  data: PatchData, item: ItemState, desiredModId: string, opts: { omen: DesecrationBossOmen },
): number {
  const mod = data.mods.get(desiredModId);
  if (!mod) return 0;
  const tag = DES_BOSS_TAG[opts.omen];
  if (!mod.tags.includes(tag)) return 0;
  const pool = mod.type === 'prefix' ? item.base.pools.desecrated.prefixes : item.base.pools.desecrated.suffixes;
  let count = 0;
  for (const id of pool) {
    const pm = data.mods.get(id);
    if (pm && pm.tags.includes(tag)) count++;
  }
  return count > 0 ? 1 / count : 0;
}

/**
 * Boss-omen desecration with NO side omen: the draw spans BOTH sides of that boss's desecrated pool
 * (D8), so the denominator is every candidate the desecration could actually land —
 *   P = 1 / (count of that boss's desecrated mods, both sides, that are LEGAL on this item)
 * where legal means the mod's family isn't already present and its side isn't full. Filtering rather
 * than counting the whole pool is what keeps this a real distribution: an illegal candidate can't be
 * the result, so including it would understate every legal one. This mirrors the MDP's own
 * `desecrateOutcomes` exactly, so the two planners agree.
 *
 * Returns 0 if the desired mod doesn't carry the boss tag or isn't itself legal here. Count-uniform
 * for the same reason as `desecrationBossProbability` — Java ignores weights on this path.
 * Not differential-tested: Java has no unconstrained desecration to compare against.
 */
export function desecrationBossAnySideProbability(
  data: PatchData, item: ItemState, desiredModId: string, opts: { omen: DesecrationBossOmen },
): number {
  const mod = data.mods.get(desiredModId);
  if (!mod) return 0;
  const tag = DES_BOSS_TAG[opts.omen];
  if (!mod.tags.includes(tag)) return 0;
  const sideOpen = { prefix: !prefixesFull(item), suffix: !suffixesFull(item) };
  const legal = (m: Mod): boolean => m.tags.includes(tag) && sideOpen[m.type] && familyAvailable(data, item, m);
  if (!legal(mod)) return 0;
  const des = item.base.pools.desecrated;
  let count = 0;
  for (const id of [...des.prefixes, ...des.suffixes]) {
    const pm = data.mods.get(id);
    if (pm && legal(pm)) count++;
  }
  return count > 0 ? 1 / count : 0;
}

export interface DesecrationOptions {
  /** Bone-strength floor ilvl (raises the tier floor). Default 0. */
  floor?: number;
  /** Desired tier or better. Default 0 (any tier). */
  minTierIndex?: number;
  /** Necromancy omen: 'prefix' (Sinistral) or 'suffix' (Dextral) restricts the roll to one side. */
  constrainTo?: AffixType;
}

/**
 * Default (no boss omen) desecration probability. The Java engine does NOT model this (its omen enum
 * has no None); per the user's rule the desecrated mods are "meddled with the classic ones", so a
 * plain desecration draws from the COMBINED normal ∪ desecrated pool for the mod's slot, by weight:
 *
 *   P(desiredMod) = weight(desiredMod eligible tiers) / Σ weights of (normal ∪ desecrated) of the slot
 *
 * On a uniform pool this reduces to 1/(normal+desecrated count) — the user's "1 / normal+desecrated"
 * shorthand — but it honours real weights where they differ. Reuses the shared slot-branch math, so
 * both-open / prefix-only / suffix-only and the Sinistral/Dextral (`constrainTo`) constraint all
 * behave as for a normal add. Returns 0 for an illegal add (wrong source, family present, side full,
 * or the mod isn't in the base's combined pool). Not differential-tested — no Java counterpart.
 */
export function desecrationProbability(
  data: PatchData, item: ItemState, desiredModId: string, opts: DesecrationOptions = {},
): number {
  const mod = data.mods.get(desiredModId);
  if (!mod) return 0;
  if (mod.source !== 'normal' && mod.source !== 'desecrated') return 0;
  if (!familyAvailable(data, item, mod)) return 0;
  if (mod.type === 'prefix' && prefixesFull(item)) return 0;
  if (mod.type === 'suffix' && suffixesFull(item)) return 0;

  const prefixPool = [...item.base.pools.normal.prefixes, ...item.base.pools.desecrated.prefixes];
  const suffixPool = [...item.base.pools.normal.suffixes, ...item.base.pools.desecrated.suffixes];
  if (!prefixPool.includes(desiredModId) && !suffixPool.includes(desiredModId)) return 0;

  const addOpts: AddAffixOptions = { floor: opts.floor ?? 0, occupiedFamilies: itemFamilies(data, item) };
  if (opts.minTierIndex !== undefined) addOpts.minTierIndex = opts.minTierIndex;
  if (opts.constrainTo !== undefined) addOpts.constrainTo = opts.constrainTo;
  return addAffixProbabilityFromPools(data, item, desiredModId, prefixPool, suffixPool, addOpts);
}
