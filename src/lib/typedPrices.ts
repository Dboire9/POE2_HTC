// What something sells for, as the player typed it — a tablet on the Tablets tab, the finished item on
// the Plan tab's "Craft to sell".
//
// Not a price feed, because there is none: poe.ninja lists no tablets and no rolled gear, and the trade
// site cannot be read from a web page. The only number available is the one the player saw on the trade
// site and typed in, so that is what this keeps — in their own browser, with the day they typed it,
// because a price a week old is worth saying so about.
//
// Every access is guarded. `localStorage` throws in a private window and can come back empty after the
// site data is cleared, and a price nobody can read back is a smaller problem than a page that will not
// render — which is the rule the rest of the app's storage follows too.

import type { CostUnit } from './currency';
import { PREFS_PREFIX } from './currencyPrefs';

export interface TypedPrice {
  /** In exalt-equivalents, the unit every cost in the app is in. */
  readonly ex: number;
  /** The day it was typed, ISO (`2026-09-22`). */
  readonly on: string;
  /** The unit it was typed in, so the box reads it back that way. Exalts when absent. */
  readonly unit?: CostUnit['key'];
}

/** A price as typed: its value in exalts, and the unit the player typed it in. */
export interface PriceEntry {
  readonly ex: number;
  readonly unit: CostUnit['key'];
}

/** One kind of thing's typed prices, each under the key of what it is a price FOR. */
export interface PriceStore {
  readonly read: () => Record<string, TypedPrice>;
  /** Save (or, with `undefined`, forget) one price. Returns the prices as they now stand. */
  readonly write: (key: string, price: PriceEntry | undefined, today?: Date) => Record<string, TypedPrice>;
}

const UNITS: readonly string[] = ['exalt', 'chaos', 'divine'] satisfies CostUnit['key'][];

const isPrice = (v: unknown): v is TypedPrice =>
  typeof v === 'object' && v !== null
  && typeof (v as TypedPrice).ex === 'number' && Number.isFinite((v as TypedPrice).ex)
  && typeof (v as TypedPrice).on === 'string'
  && ((v as TypedPrice).unit === undefined || UNITS.includes((v as TypedPrice).unit!));

/** Typed prices kept in the browser under `storageKey`. */
export function priceStore(storageKey: string): PriceStore {
  const read = (): Record<string, TypedPrice> => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return {};
      // A stranger's storage, or an older shape: keep what reads as a price, drop the rest.
      return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, v]) => isPrice(v))) as Record<string, TypedPrice>;
    } catch {
      return {};
    }
  };
  const write = (key: string, price: PriceEntry | undefined, today = new Date()): Record<string, TypedPrice> => {
    const next = { ...read() };
    if (price === undefined) delete next[key];
    else next[key] = { ex: price.ex, on: today.toISOString().slice(0, 10), ...(price.unit === 'exalt' ? {} : { unit: price.unit }) };
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch { /* unreadable storage must not stop the tab working — the price just doesn't persist */ }
    return next;
  };
  return { read, write };
}

/** How many days ago a price was typed; 0 for today. */
export function daysOld(price: TypedPrice, today = new Date()): number {
  const then = Date.parse(`${price.on}T00:00:00Z`);
  if (Number.isNaN(then)) return 0;
  const now = Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

/** What a finished item of gear sells for — the Plan tab's "Craft to sell" — keyed by `gearPriceKey`. */
export const gearPrices = priceStore(`${PREFS_PREFIX}gearPrices`);

/**
 * The finished item a price is FOR: its base, and each slot's modifiers at the tier asked — exactly what
 * its trade search looks for (`gearSearch`). Order-independent, within a slot and between slots, so the
 * same craft picked in another order finds the price typed for it.
 */
export function gearPriceKey(baseId: string, slots: readonly (readonly { readonly modId: string; readonly tierDisplay: number }[])[]): string {
  const slot = (mods: readonly { readonly modId: string; readonly tierDisplay: number }[]): string =>
    mods.map((m) => `${m.modId}@${m.tierDisplay}`).sort().join('/');
  return `${baseId}|${slots.map(slot).sort().join(',')}`;
}
