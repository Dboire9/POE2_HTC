import type { ItemBase, ItemState, PlacedMod, Rarity } from './types.ts';

export const MAX_AFFIXES_PER_SIDE = 3;

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
  return item.prefixes.length >= MAX_AFFIXES_PER_SIDE;
}

export function suffixesFull(item: ItemState): boolean {
  return item.suffixes.length >= MAX_AFFIXES_PER_SIDE;
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
