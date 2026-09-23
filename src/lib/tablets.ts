// What the Tablets tab knows about a Precursor Tablet, in one place: which tablets there are, what each
// can roll and how often, which pairs can never share one, the modifiers worth watching for while you
// roll, and the trade search for any set of them.
//
// The odds here are the pool's, not a craft's: the share of the rolls that land on a side. What a craft
// costs and how often a watched modifier turns up on the way are the solver's answers (`solve.ts`), and
// this file never guesses at them.

import type { PatchData } from '../../packages/engine/src/types.ts';
import { TABLET_CATEGORY } from '../../packages/engine/src/types.ts';
import { familiesOf, resolveMod } from '../../packages/engine/src/pool.ts';
import type { TradeStat } from './tradeLink.ts';
import morce from '../../data/tablets/morce-faster.json';
import tradeStats from '../../data/tablets/trade-stats.json';
import valuable from '../../data/tablets/valuable.json';

/** Whose rolling data every number on this tab rests on. Shown wherever the odds are. */
export const ODDS_CREDIT = {
  who: morce.credit,
  /** Modifiers he saw, across the three tablets — the sample the weights were read from. */
  rolls: Object.values(morce.tablets).reduce((n, t) => n + t.prefixesSeen + t.suffixesSeen, 0),
} as const;

/** Modifiers a tablet holds on each side — and a finished one always holds all of them. */
export const PER_SIDE = 2;

/** Under this many sightings, a modifier's weight is a rough estimate and the tab says so. */
export const THIN_EVIDENCE = 100;

export interface TabletMod {
  readonly id: string;
  readonly text: string;
  readonly side: 'prefix' | 'suffix';
  /** Share of the rolls that land on this side — `weight / the side's total`. */
  readonly share: number;
  /** How many times Morce Faster saw it, across the tablets that roll it. */
  readonly seen: number;
}

export interface TabletBase {
  readonly id: string;
  readonly name: string;
  readonly prefixes: readonly TabletMod[];
  readonly suffixes: readonly TabletMod[];
}

const seenOf = (id: string): number => (morce.weights as Record<string, { seen: number }>)[id]?.seen ?? 0;

/** The three tablets, each with what it can roll, commonest first on each side. */
export function listTablets(data: PatchData): TabletBase[] {
  return [...data.bases.values()]
    .filter((b) => b.category === TABLET_CATEGORY)
    .map((b) => {
      const side = (ids: readonly string[], type: 'prefix' | 'suffix'): TabletMod[] => {
        const total = ids.reduce((w, id) => w + resolveMod(data, id).tiers[0]!.weight, 0);
        return ids
          .map((id): TabletMod => {
            const mod = resolveMod(data, id);
            return { id, text: mod.text ?? id, side: type, share: mod.tiers[0]!.weight / total, seen: seenOf(id) };
          })
          .sort((x, y) => y.share - x.share);
      };
      return {
        id: b.id, name: b.name,
        prefixes: side(b.pools.normal.prefixes, 'prefix'),
        suffixes: side(b.pools.normal.suffixes, 'suffix'),
      };
    });
}

/**
 * Which modifiers `chosen` rules out, and why — an item holds one modifier per family, and on a tablet
 * three of those families span both sides ("Map contains an additional Essence" is the same family as
 * "increased chance to contain Essences"). The picker greys those out with the reason rather than
 * letting a player ask for a tablet the game cannot make.
 */
export function ruledOutBy(data: PatchData, chosen: readonly string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const id of chosen) {
    const fams = new Set(familiesOf(resolveMod(data, id)));
    for (const other of data.mods.keys()) {
      if (other === id || !other.startsWith('Tablets/') || out.has(other)) continue;
      if (familiesOf(resolveMod(data, other)).some((f) => fams.has(f))) {
        out.set(other, `a tablet holds one of these at a time — you picked “${resolveMod(data, id).text ?? id}”`);
      }
    }
  }
  return out;
}

/**
 * The valuable list's tiers, best first. The tier is the whole claim the tab makes about a set's value:
 * a price goes stale within days, so the tab shows the tier and leaves today's price to the player.
 */
export const WATCH_TIERS = ['superJackpot', 'jackpot', 'veryGood', 'good'] as const;
export type WatchTier = (typeof WATCH_TIERS)[number];

/** One modifier of a watched set, optionally with the value that was priced ("rerolling Favours 3 times"). */
export interface WatchMod {
  readonly id: string;
  readonly min?: number;
  readonly max?: number;
}

/** One row of the watch list: modifiers that would be on the tablet together, and what they sold for. */
export interface WatchEntry {
  readonly mods: readonly WatchMod[];
  readonly tier: WatchTier;
  readonly note?: string;
}

/** An entry as `valuable.json` holds it — each modifier with what it reads in game, for whoever edits it. */
export interface CuratedEntry {
  readonly tablets: readonly string[];
  readonly mods: readonly (WatchMod & { readonly reads: string })[];
  readonly price?: string;
  readonly note?: string;
}

export const CURATED: {
  readonly tiers: Readonly<Record<WatchTier, readonly CuratedEntry[]>>;
} = valuable;

/** A stable key for a watched set: ids, with the priced value when there is one. */
export const watchKey = (mods: readonly WatchMod[]): string[] =>
  mods.map((m) => (m.min === undefined && m.max === undefined ? m.id : `${m.id}=${m.min ?? ''}-${m.max ?? ''}`));

/** What a watched modifier reads with its priced value filled in: "…rerolling Favours 3 additional times". */
export function watchText(text: string, m: WatchMod): string {
  if (m.min === undefined && m.max === undefined) return text;
  const value = m.min === m.max ? `${m.min}` : m.max === undefined ? `${m.min}+` : m.min === undefined ? `up to ${m.max}` : `${m.min}–${m.max}`;
  return text.replace('#', value);
}

/**
 * The curated sets worth watching for on this tablet — the entries priced for it, best tier first —
 * minus any made only of modifiers the player already asked for: a target is not a surprise, and
 * pricing it twice on one screen reads as a bug.
 */
export function watchList(tablet: TabletBase, targets: readonly string[]): WatchEntry[] {
  const rolls = new Set([...tablet.prefixes, ...tablet.suffixes].map((m) => m.id));
  const wanted = new Set(targets);
  return WATCH_TIERS.flatMap((tier) => CURATED.tiers[tier]
    .filter((e) => e.tablets.includes(tablet.id) && e.mods.every((m) => rolls.has(m.id)) && !e.mods.every((m) => wanted.has(m.id)))
    .map(({ mods, note }): WatchEntry => ({
      mods: mods.map(({ id, min, max }) => ({ id, ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }) })),
      tier,
      ...(note === undefined ? {} : { note }),
    })));
}

const asMod = (m: string | WatchMod): WatchMod => (typeof m === 'string' ? { id: m } : m);

/**
 * The trade filters for a set of modifiers, in the order given, each carrying the priced value when it
 * has one. Unknown ids are skipped, never invented.
 */
export function tradeStatsFor(mods: readonly (string | WatchMod)[]): TradeStat[] {
  const table = (tradeStats as { stats: Record<string, TradeStat> }).stats;
  return mods.map(asMod).flatMap((m) => {
    const stat = table[m.id];
    if (!stat) return [];
    const value = { ...(m.min === undefined ? {} : { min: m.min }), ...(m.max === undefined ? {} : { max: m.max }) };
    return [Object.keys(value).length > 0 ? { ...stat, value } : stat];
  });
}

/** True when a search for these modifiers can also list a near-identical one (see `trade-stats.json`). */
export const searchIsLoose = (mods: readonly (string | WatchMod)[]): boolean =>
  tradeStatsFor(mods).some((s) => s.ambiguous === true);

/**
 * The share of crafts that came in at or under `budget`, read off the replay's 0th–100th percentiles —
 * "put this much in, and how often do you finish?". Nearest-rank, so it moves in whole percents.
 */
export function shareWithin(percentiles: readonly number[], budget: number): number {
  let within = -1;
  for (let p = 0; p < percentiles.length; p++) if (percentiles[p]! <= budget) within = p;
  return within < 0 ? 0 : within / (percentiles.length - 1);
}

/**
 * What selling the good tablets a craft would otherwise bin brings back, per craft: each binned set
 * sells once, at the best price typed among the entries it held. An entry with no price counts as
 * nothing — the tab never guesses a price.
 */
export function binnedCredit(
  binned: readonly { readonly entries: readonly number[]; readonly perCraft: number }[],
  priceOf: (entry: number) => number | undefined,
): number {
  return binned.reduce((sum, b) => sum + b.perCraft * Math.max(0, ...b.entries.map((k) => priceOf(k) ?? 0)), 0);
}
