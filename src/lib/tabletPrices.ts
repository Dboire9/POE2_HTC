// What a tablet sells for, as the player typed it — the shared store (`typedPrices.ts`) under the
// tablets' own key — and the unit the Tablets tab shows its numbers in.

import type { CostUnit } from './currency';
import { priceStore } from './typedPrices';

export { daysOld, type PriceEntry, type TypedPrice } from './typedPrices';

const store = priceStore('poe2htc.tabletPrices');
export const readPrices = store.read;
export const writePrice = store.write;

/** One tablet and one set of modifiers — the thing a price is FOR. Order-independent. */
export const priceKey = (baseId: string, mods: readonly string[]): string =>
  `${baseId}|${[...mods].sort().join(',')}`;

const UNIT_KEY = 'poe2htc.tablets.unit';

/**
 * The unit the Tablets tab shows its numbers in — Chaos Orbs unless the player picked another, since
 * tablets trade in chaos (2026-09-23: "chaos is the default currency"). Per browser, guarded.
 */
export function readShownUnit(): CostUnit['key'] {
  try {
    const v = localStorage.getItem(UNIT_KEY);
    return v === 'exalt' || v === 'chaos' || v === 'divine' ? v : 'chaos';
  } catch {
    return 'chaos';
  }
}

export function writeShownUnit(unit: CostUnit['key']): void {
  try { localStorage.setItem(UNIT_KEY, unit); } catch { /* the choice just does not persist */ }
}
