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

/** One row of the watch list: modifiers that would be on the tablet together, and why they are listed. */
export interface WatchEntry {
  readonly mods: readonly string[];
  readonly note?: string;
}

interface ValuableFile {
  readonly tablets: Record<string, readonly WatchEntry[]>;
}

/**
 * The curated modifiers worth watching for on this tablet, minus any the player already asked for — a
 * target is not a surprise, and pricing it twice on one screen reads as a bug.
 */
export function watchList(baseId: string, targets: readonly string[]): WatchEntry[] {
  const wanted = new Set(targets);
  return ((valuable as ValuableFile).tablets[baseId] ?? [])
    .filter((e) => !e.mods.every((m) => wanted.has(m)));
}

/** The trade ids for a set of modifiers, in the order given. Unknown ids are skipped, never invented. */
export function tradeStatsFor(mods: readonly string[]): TradeStat[] {
  const table = (tradeStats as { stats: Record<string, TradeStat> }).stats;
  return mods.flatMap((id) => (table[id] ? [table[id]] : []));
}

/** True when a search for these modifiers can also list a near-identical one (see `trade-stats.json`). */
export const searchIsLoose = (mods: readonly string[]): boolean =>
  tradeStatsFor(mods).some((s) => s.ambiguous === true);
