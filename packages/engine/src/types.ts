// Data model — what the app READS out of data/patches/<patch>/{mods,base_items}.json.
// Probabilities are f64 in [0,1] internally; format % only at the UI edge.
//
// It used to say "mirrors ... exactly", and that was the problem: `mods.json` carries four fields no
// code has ever read (`group`, `field`, `categories`, `tiers[].stats`), and while the type declared
// them nothing could tell that from the outside. They stay in the FILE — it is the versioned record,
// `group`/`field` are the RePoE provenance `dataIntegrity.test.ts` checks the import against, and
// `stats` is the named route to cross-family similarity (see alternatives.ts). They are gone from
// this type, which is now the app's contract: `shipMods.ts` projects the file onto exactly these
// fields for the browser, so anything this type does not declare is not in the asset the app loads.
// Add a field here and you must add it there, or the build will ship data the type promises.

export type AffixType = 'prefix' | 'suffix';
export type ModSource = 'normal' | 'desecrated' | 'essence' | 'perfect_essence';
export type Rarity = 'normal' | 'magic' | 'rare';

/** One tier of a modifier. `ilvl` is the item-level gate; `ranges` are [min,max] stat ranges. */
export interface Tier {
  readonly name: string;
  readonly ilvl: number;
  readonly weight: number;
  /** Read by `valueRatio` (alternatives.ts) to rank how much of the asked-for stat a relaxed tier
   * still guarantees — solver data, not decoration, despite also feeding the picker's labels. */
  readonly ranges: readonly (readonly number[])[];
}

export interface Mod {
  readonly id: string;
  readonly source: ModSource;
  readonly type: AffixType;
  /** Primary family-exclusion group: an item may hold at most one mod per family. Also the key the
   * poe2db weight join uses and the label the UI shows — keep it stable. */
  readonly family: string;
  /** Present only when a mod spans MORE than one exclusion group (e.g. a desecrated "+Str +Int" sits
   * in both Strength and Intelligence). `families[0]` === `family`. Read it via `familiesOf(mod)` in
   * pool.ts rather than directly — that helper is what makes single- and multi-family mods uniform. */
  readonly families?: readonly string[];
  /** Desecration boss pools are selected by tag (`DES_BOSS_TAG`, probability.ts) — solver data. */
  readonly tags: readonly string[];
  /**
   * This mod comes from an ALLOY, a Runes of Aldur currency, rather than from a Perfect Essence.
   *
   * Present only on `source: 'perfect_essence'` mods, and it changes nothing the solver does — the two
   * share a mechanic (poe2db marks both `Removes: true`), which is why they share a source. It exists
   * so the UI can name the currency correctly: an Alloy is "Sovereign Alloy", not "Perfect Essence of
   * Sovereign Alloy", and it is priced from an entirely different poe.ninja feed.
   */
  readonly alloy?: boolean;
  readonly text: string | null;
  /** Ascending by ilvl: tiers[0] = lowest ilvl (worst), tiers[last] = highest ilvl (best). */
  readonly tiers: readonly Tier[];
}

export interface Pool {
  readonly prefixes: readonly string[];
  readonly suffixes: readonly string[];
}

export interface ItemBase {
  readonly id: string;
  /** The picker's caption for this row. Not a lookup key — see `bases`. */
  readonly name: string;
  /**
   * The concrete base names this row covers, as printed on an item: "Knightly Mitts", "Gold Ring".
   *
   * Needed to read an item somebody pasted or that was fetched for them, where all you are given is
   * the base's own name and you have to work back to which row of the picker it belongs to. `name`
   * cannot do that job: for 40 of the 52 shipped bases it is just the id repeated ("Gloves_str"),
   * and where it is a real list it is comma-joined for display rather than structured.
   *
   * OPTIONAL because a synthetic base in a test legitimately has no real-world name. The shipped data
   * must carry it for every base, which `dataIntegrity.test.ts` asserts — the type says "may be
   * absent", the test says "never absent in what we publish".
   */
  readonly bases?: readonly string[];
  readonly category: string;
  readonly pools: {
    readonly normal: Pool;
    readonly desecrated: Pool;
    readonly essence: Pool;
  };
}

/** A parsed, indexed data snapshot for one patch. The engine takes this — it never does I/O. */
export interface PatchData {
  readonly patch: string;
  readonly mods: ReadonlyMap<string, Mod>;
  readonly bases: ReadonlyMap<string, ItemBase>;
}

/** A modifier currently on an item, at a specific tier. */
export interface PlacedMod {
  readonly modId: string;
  readonly tierName: string;
  /** A fractured mod is locked on the item: it can never be removed and is excluded from the random-
   * removal pool of annul / chaos / essence (so those removal odds improve). Default false. */
  readonly fractured?: boolean;
  /**
   * This mod was placed by a Desecration.
   *
   * An item may carry one such mod, and while it does the Well of Souls will not touch the item again
   * — so removing or rerolling it is what frees the item to be desecrated. The flag belongs to the MOD,
   * not to the pool it came from: a bone that placed an ORDINARY mod marks it exactly the same way,
   * and that mod is then indistinguishable from an exalted one by inspection, which is why this has to
   * be told to the app rather than inferred. A desecrated-pool mod is treated as flagged regardless,
   * since a Desecration is the only way one reaches an item. Default false.
   */
  readonly desecrated?: boolean;
}

/** Mutable item being crafted. Max 3 prefixes + 3 suffixes. */
export interface ItemState {
  readonly base: ItemBase;
  /** Item level — gates which tiers can roll. Defaults to 100 (matches the Java engine default). */
  readonly level: number;
  readonly rarity: Rarity;
  readonly prefixes: readonly PlacedMod[];
  readonly suffixes: readonly PlacedMod[];
  /** Whether the item currently carries a desecrated mod (gates the Omen of Light). Default false. */
  readonly desecrated?: boolean;
}

/** Currency strength — restricts rolls to higher-ilvl tiers (Greater/Perfect orbs). */
export type CurrencyTier = 'base' | 'greater' | 'perfect';

/** The orbs sold at Greater and Perfect strength, where the strength sets a minimum modifier level. */
export type StrengthCurrency = 'transmute' | 'augment' | 'regal' | 'exalt';

/**
 * Minimum modifier level each orb strength imposes — PER CURRENCY, because the ladders differ.
 *
 *   • Regal and Exalted: Greater 35, Perfect 50 (ExaltAndRegalProbability.java).
 *   • Transmutation and Augmentation: Greater **55**, Perfect **70** — "guaranteeing 1 modifier with
 *     minimum modifier level of 70. Augmentation is the same" and "for greater both are minimum modifier
 *     level of 55" (the user, 2026-09-10). One shared table used to give them the Exalt's ladder, which
 *     let them land tiers they cannot.
 */
export const CURRENCY_FLOOR: Record<StrengthCurrency, Record<CurrencyTier, number>> = {
  transmute: { base: 0, greater: 55, perfect: 70 },
  augment: { base: 0, greater: 55, perfect: 70 },
  regal: { base: 0, greater: 35, perfect: 50 },
  exalt: { base: 0, greater: 35, perfect: 50 },
};
