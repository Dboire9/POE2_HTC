// What a player changed about the Tablets tab's watch list — "while you roll for that, these can land" —
// kept in their browser (Dorian, 2026-09-23: "the user can put its own, and he can hide the ones I've
// done for him").
//
// Two things: sets of their OWN to watch for, per tablet, and curated sets they HID, each by the key its
// price is kept under (`setPriceKey`, which names the tablet too). Guarded like every storage read in the
// app: a private window or a stranger's storage must not stop the tab rendering.

import type { WatchMod, WatchPrefs } from './tablets.ts';

const KEY = 'poe2htc.tablets.watch';

interface Stored {
  readonly mine: Readonly<Record<string, readonly (readonly WatchMod[])[]>>;
  readonly hidden: readonly string[];
}

const EMPTY: Stored = { mine: {}, hidden: [] };

const isMods = (v: unknown): v is WatchMod[] =>
  Array.isArray(v) && v.length > 0 && v.every((m) => typeof m === 'object' && m !== null && typeof (m as WatchMod).id === 'string');

export function readWatch(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Stored>;
    const mine = Object.fromEntries(Object.entries(p.mine ?? {})
      .map(([tablet, sets]) => [tablet, Array.isArray(sets) ? sets.filter(isMods) : []]));
    const hidden = Array.isArray(p.hidden) ? p.hidden.filter((k): k is string => typeof k === 'string') : [];
    return { mine, hidden };
  } catch {
    return EMPTY;
  }
}

function write(next: Stored): Stored {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* it just does not persist */ }
  return next;
}

/** The list's changes for one tablet, as `watchList` takes them. */
export const prefsFor = (s: Stored, tabletId: string): WatchPrefs =>
  ({ mine: s.mine[tabletId] ?? [], hidden: new Set(s.hidden) });

/** Add a set of the player's own to watch for on a tablet — once. */
export function addMine(s: Stored, tabletId: string, mods: readonly WatchMod[], keyOf: (mods: readonly WatchMod[]) => string): Stored {
  const now = s.mine[tabletId] ?? [];
  if (now.some((m) => keyOf(m) === keyOf(mods))) return s;
  return write({ ...s, mine: { ...s.mine, [tabletId]: [...now, mods] } });
}

export function removeMine(s: Stored, tabletId: string, key: string, keyOf: (mods: readonly WatchMod[]) => string): Stored {
  return write({ ...s, mine: { ...s.mine, [tabletId]: (s.mine[tabletId] ?? []).filter((m) => keyOf(m) !== key) } });
}

/** Hide a curated set, by its price key. */
export const hide = (s: Stored, key: string): Stored => (s.hidden.includes(key) ? s : write({ ...s, hidden: [...s.hidden, key] }));

/** Show again every curated set hidden on this tablet (keys start with the tablet id). */
export const unhideAll = (s: Stored, tabletId: string): Stored =>
  write({ ...s, hidden: s.hidden.filter((k) => !k.startsWith(`${tabletId}|`)) });

export type WatchStore = Stored;
