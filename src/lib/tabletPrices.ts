// What a tablet sells for, as the player typed it.
//
// Not a price feed, because there is none: poe.ninja lists no tablets and the trade site cannot be read
// from a web page. The only number available is the one the player saw on the trade site and typed in,
// so that is what this keeps — in their own browser, with the day they typed it, because a tablet price
// a week old is worth saying so about.
//
// Every access is guarded. `localStorage` throws in a private window and can come back empty after the
// site data is cleared, and a price nobody can read back is a smaller problem than a page that will not
// render — which is the rule the rest of the app's storage follows too.

import type { CostUnit } from './currency';

const KEY = 'poe2htc.tabletPrices';

export interface TypedPrice {
  /** In exalt-equivalents, the unit every cost in the app is in. */
  readonly ex: number;
  /** The day it was typed, ISO (`2026-09-22`). */
  readonly on: string;
  /** The unit it was typed in, so the box reads it back that way. Exalts when absent. */
  readonly unit?: CostUnit['key'];
}

const UNITS: readonly string[] = ['exalt', 'chaos', 'divine'] satisfies CostUnit['key'][];

/** One tablet and one set of modifiers — the thing a price is FOR. Order-independent. */
export const priceKey = (baseId: string, mods: readonly string[]): string =>
  `${baseId}|${[...mods].sort().join(',')}`;

const isPrice = (v: unknown): v is TypedPrice =>
  typeof v === 'object' && v !== null
  && typeof (v as TypedPrice).ex === 'number' && Number.isFinite((v as TypedPrice).ex)
  && typeof (v as TypedPrice).on === 'string'
  && ((v as TypedPrice).unit === undefined || UNITS.includes((v as TypedPrice).unit!));

export function readPrices(): Record<string, TypedPrice> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    // A stranger's storage, or an older shape: keep what reads as a price, drop the rest.
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, v]) => isPrice(v))) as Record<string, TypedPrice>;
  } catch {
    return {};
  }
}

/** A price as typed: its value in exalts, and the unit the player typed it in. */
export interface PriceEntry {
  readonly ex: number;
  readonly unit: CostUnit['key'];
}

/** Save (or, with `undefined`, forget) one price. Returns the prices as they now stand. */
export function writePrice(key: string, price: PriceEntry | undefined, today = new Date()): Record<string, TypedPrice> {
  const next = { ...readPrices() };
  if (price === undefined) delete next[key];
  else next[key] = { ex: price.ex, on: today.toISOString().slice(0, 10), ...(price.unit === 'exalt' ? {} : { unit: price.unit }) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* unreadable storage must not stop the tab working — the price just doesn't persist */ }
  return next;
}

/** How many days ago a price was typed; 0 for today. */
export function daysOld(price: TypedPrice, today = new Date()): number {
  const then = Date.parse(`${price.on}T00:00:00Z`);
  if (Number.isNaN(then)) return 0;
  const now = Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

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

