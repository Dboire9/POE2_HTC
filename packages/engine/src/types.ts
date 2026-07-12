// Data model — mirrors data/patches/<patch>/{mods,base_items}.json exactly.
// Probabilities are f64 in [0,1] internally; format % only at the UI edge.

export type AffixType = 'prefix' | 'suffix';
export type ModSource = 'normal' | 'desecrated' | 'essence' | 'perfect_essence';
export type Rarity = 'normal' | 'magic' | 'rare';

/** One tier of a modifier. `ilvl` is the item-level gate; `ranges` are [min,max] stat ranges. */
export interface Tier {
  readonly name: string;
  readonly ilvl: number;
  readonly weight: number;
  readonly ranges: readonly (readonly number[])[];
  readonly stats: readonly string[];
}

export interface Mod {
  readonly id: string;
  readonly group: string;
  readonly field: string;
  readonly source: ModSource;
  readonly type: AffixType;
  readonly categories: readonly string[];
  /** Family-exclusion group: an item may hold at most one mod per family. */
  readonly family: string;
  readonly tags: readonly string[];
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
  readonly name: string;
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

/** Minimum tier ilvl each currency strength can roll (from ExaltAndRegalProbability.java). */
export const CURRENCY_FLOOR: Record<CurrencyTier, number> = {
  base: 0,
  greater: 35,
  perfect: 50,
};
