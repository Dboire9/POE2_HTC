import type { ItemBase, ItemLimits, ItemState, PlacedMod, Rarity } from './types.ts';

/**
 * What an item holds when nothing says otherwise: three modifiers a side, and ONE crafted modifier
 * (0.5.0: "items can only have 1 crafted modifier at a time" — Essences, Perfect Essences and Alloys
 * count together, see `isEssenceMod`).
 *
 * Read these through `limitsOf` rather than reaching for the constant below: a socketed rune raises
 * one of them, and a limit read from a constant is a limit a rune cannot reach.
 */
export const DEFAULT_LIMITS: ItemLimits = { prefixes: 3, suffixes: 3, crafted: 1 };

/** The default per-side limit, for the few callers that have no base in hand. */
export const MAX_AFFIXES_PER_SIDE = DEFAULT_LIMITS.prefixes;

/** What this base can hold: its own limits, or the game's defaults. */
export function limitsOf(base: ItemBase | undefined): ItemLimits {
  return base?.limits ?? DEFAULT_LIMITS;
}

/** A fresh white (normal, unmodified) item on `base` at `level` (default 100, matching Java). */
export function whiteItem(base: ItemBase, level = 100): ItemState {
  return { base, level, rarity: 'normal', prefixes: [], suffixes: [] };
}

export function prefixCount(item: ItemState): number {
  return item.prefixes.length;
}

export function suffixCount(item: ItemState): number {
  return item.suffixes.length;
}

export function prefixesFull(item: ItemState): boolean {
  return item.prefixes.length >= limitsOf(item.base).prefixes;
}

export function suffixesFull(item: ItemState): boolean {
  return item.suffixes.length >= limitsOf(item.base).suffixes;
}

/** Immutable add — returns a new item with `placed` on the given side. */
export function withAffix(item: ItemState, type: 'prefix' | 'suffix', placed: PlacedMod, rarity?: Rarity): ItemState {
  const next: ItemState = {
    base: item.base,
    level: item.level,
    rarity: rarity ?? item.rarity,
    prefixes: type === 'prefix' ? [...item.prefixes, placed] : item.prefixes,
    suffixes: type === 'suffix' ? [...item.suffixes, placed] : item.suffixes,
  };
  return next;
}
