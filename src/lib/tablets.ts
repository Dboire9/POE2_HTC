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
import { priceKey } from './tabletPrices.ts';
import { FLAG_NONE, encodeState } from '../../packages/optimizer/src/markovState.ts';
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
/** The tiers Dorian priced the curated list into (`valuable.json`). */
export const CURATED_TIERS = ['superJackpot', 'jackpot', 'veryGood', 'good'] as const;
export type CuratedTier = (typeof CURATED_TIERS)[number];
/** Every tier a watch-list row can sit in: the player's own entries first, then the curated ones. */
export const WATCH_TIERS = ['yours', ...CURATED_TIERS] as const;
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
  readonly tiers: Readonly<Record<CuratedTier, readonly CuratedEntry[]>>;
} = valuable;

/** Where the price typed for a tablet holding `mods` is kept (`tabletPrices.ts`). */
export const setPriceKey = (tabletId: string, mods: readonly WatchMod[]): string => priceKey(tabletId, watchKey(mods));

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
 * What a player changed about the watch list on this tablet (tabletWatch.ts): sets of their own to watch
 * for, and curated sets they hid — each named by its `setPriceKey`.
 */
export interface WatchPrefs {
  readonly mine: readonly (readonly WatchMod[])[];
  readonly hidden: ReadonlySet<string>;
}

/**
 * The sets worth watching for on this tablet: the player's own first (tier `yours`), then the curated
 * entries priced for it, best tier first, less any the player hid — minus any made only of modifiers the
 * player already asked for: a target is not a surprise, and pricing it twice on one screen reads as a bug.
 * A curated set the player also added is listed once, as theirs.
 */
export function watchList(tablet: TabletBase, targets: readonly string[], prefs?: WatchPrefs): WatchEntry[] {
  const rolls = new Set([...tablet.prefixes, ...tablet.suffixes].map((m) => m.id));
  const wanted = new Set(targets);
  const fits = (mods: readonly WatchMod[]): boolean => mods.every((m) => rolls.has(m.id)) && !mods.every((m) => wanted.has(m.id));
  const key = (mods: readonly WatchMod[]): string => setPriceKey(tablet.id, mods);
  const mine = (prefs?.mine ?? []).filter(fits).map((mods): WatchEntry => ({ mods, tier: 'yours' }));
  const taken = new Set(mine.map((e) => key(e.mods)));
  return [...mine, ...CURATED_TIERS.flatMap((tier) => CURATED.tiers[tier]
    .filter((e) => e.tablets.includes(tablet.id) && fits(e.mods))
    .map(({ mods, note }): WatchEntry => ({
      mods: mods.map(({ id, min, max }) => ({ id, ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }) })),
      tier,
      ...(note === undefined ? {} : { note }),
    }))
    .filter((e) => !taken.has(key(e.mods)) && !prefs?.hidden.has(key(e.mods))))];
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

/** How a solved plan gets there, read off what following it spends — the "why this way" of the tab. */
export interface PlanSummary {
  /** What an average craft uses, most first — plain tablets counted with the one you start from. */
  readonly uses: readonly { readonly name: string; readonly perCraft: number }[];
  /**
   * `fresh`: starts over on a new plain tablet when a roll misses. `chaos`: keeps one tablet and
   * rerolls it with Chaos Orbs. `mixed`: both, whichever is cheaper at the step. `direct`: an average
   * craft does neither — what is asked for is common enough to land on the way up.
   */
  readonly strategy: 'fresh' | 'chaos' | 'mixed' | 'direct';
}

/**
 * What a craft starts from, and buys again on every start over: a plain tablet, or a Magic one someone
 * already rolled holding one modifier the craft does not want (Dorian, 2026-09-23: "so you could plan with
 * these tablets and not only the plain one").
 */
export type StartKind = 'plain' | 'prefix' | 'suffix';

/** The starting tablet, one and many, as every line of the result names it. */
export const START_NAMES: Record<StartKind, readonly [string, string]> = {
  plain: ['plain tablet', 'plain tablets'],
  prefix: ['Magic tablet with one prefix', 'Magic tablets with one prefix'],
  suffix: ['Magic tablet with one suffix', 'Magic tablets with one suffix'],
};

/**
 * The modifier a Magic starting tablet is planned as holding: the likeliest one on its side that the
 * craft neither asks for nor is blocked by — which one a listing actually carries matters only through
 * its family, and a family clash is exactly what this leaves out. Undefined when the side has none.
 */
export function standInJunk(
  tablet: TabletBase, chosen: readonly string[], ruledOut: ReadonlyMap<string, string>, side: 'prefix' | 'suffix',
): string | undefined {
  return [...(side === 'prefix' ? tablet.prefixes : tablet.suffixes)]
    .filter((m) => !chosen.includes(m.id) && !ruledOut.has(m.id))
    .sort((a, b) => b.share - a.share)[0]?.id;
}

const MOVE_NAMES: Record<string, [string, string]> = {
  restart: ['plain tablet', 'plain tablets'],
  transmute: ['Transmutation', 'Transmutations'],
  augment: ['Augmentation', 'Augmentations'],
  regal: ['Regal Orb', 'Regal Orbs'],
  exalt: ['Exalted Orb', 'Exalted Orbs'],
  chaos: ['Chaos Orb', 'Chaos Orbs'],
  annul: ['Annulment Orb', 'Annulment Orbs'],
};

/** Name the plan's strategy from the moves it plays per craft (`ReplayResult.movesPerCraft`). */
export function summarizePlan(moves: Readonly<Record<string, number>>, start: StartKind = 'plain'): PlanSummary {
  // Every craft starts from one tablet — plain, or the Magic one it is planned from; each restart is another.
  const counts = { ...moves, restart: (moves['restart'] ?? 0) + 1 };
  const uses = Object.entries(counts)
    .filter(([, n]) => n >= 0.05)
    .map(([k, n]) => ({ name: ((k === 'restart' ? START_NAMES[start] : MOVE_NAMES[k]) ?? [k, k])[Math.abs(n - 1) < 0.05 ? 0 : 1], perCraft: n }))
    .sort((a, b) => b.perCraft - a.perCraft);
  const fresh = (moves['restart'] ?? 0) >= 1;
  const chaos = (moves['chaos'] ?? 0) >= 1;
  return { uses, strategy: fresh && chaos ? 'mixed' : fresh ? 'fresh' : chaos ? 'chaos' : 'direct' };
}

/** One line of what a craft costs on average: so many of something, at a price each. */
export interface CostLine {
  readonly name: string;
  readonly count: number;
  readonly each: number;
  readonly total: number;
  /** The plain tablets a craft buys — the line whose price the player sets. */
  readonly plain?: true;
}

/**
 * Where one craft's average spend goes, line by line — every orb and every plain tablet the played-out
 * plan used, at its price — for the "how is this worked out" panel.
 *
 * The lines add up to exactly `plainCost + meanCost`, the spend the verdict shows: the replay counts
 * each orb it plays (`movesPerCraft`) but not the Exalts that fill a finished tablet, which it charges
 * at the end, so those are the remainder — named as Exalts, counted from their price. A plain tablet is
 * bought for the first try, for each start over, and after each sale on the way.
 */
export function spendBreakdown(
  moves: Readonly<Record<string, number>>, plainCost: number, meanCost: number,
  priceOf: (currency: string) => number | undefined, start: StartKind = 'plain',
): CostLine[] {
  const line = (key: string, count: number, each: number): CostLine => {
    const [one, many] = (key === 'restart' ? START_NAMES[start] : MOVE_NAMES[key]) ?? [key, key];
    return { name: Math.abs(count - 1) < 0.05 ? one : many, count, each, total: count * each };
  };
  const lines: CostLine[] = [{ ...line('restart', 1 + (moves['restart'] ?? 0) + (moves['sell'] ?? 0), plainCost), plain: true }];
  for (const key of ['transmute', 'augment', 'regal', 'exalt', 'chaos', 'annul']) {
    const n = moves[key] ?? 0;
    const each = priceOf(key);
    if (n > 0 && each !== undefined) lines.push(line(key, n, each));
  }
  const counted = lines.reduce((a, l) => a + l.total, 0);
  const fill = plainCost + meanCost - counted;
  const exalt = priceOf('exalt');
  if (exalt && fill > exalt * 0.01) {
    lines.push({ name: 'Exalted Orbs filling the finished tablet', count: fill / exalt, each: exalt, total: fill });
  }
  return lines.filter((l) => l.count >= 0.005).sort((a, b) => b.total - a.total);
}

/**
 * The most a plain tablet can cost for the craft to still pay. Its plan buys `count` plain tablets a
 * craft and spends the rest on orbs, so with the plan held fixed the spend is `price × count + orbs` —
 * a straight line — and it breaks even where that meets what the craft brings back:
 *
 *     price ≤ (income − orbs) / count
 *
 * A floor, not an estimate: at any other price the plan re-optimises, and the plan the solver picks is
 * never dearer than the one held fixed — so at this price or less the craft pays for certain, and the
 * true line may sit a little higher. Undefined when no price makes it pay (the orbs alone cost more).
 */
export function plainBreakEven(lines: readonly CostLine[], income: number): number | undefined {
  const plain = lines.find((l) => l.plain);
  if (!plain || !(plain.count > 0)) return undefined;
  const orbs = lines.filter((l) => !l.plain).reduce((a, l) => a + l.total, 0);
  const most = (income - orbs) / plain.count;
  return most > 0 ? most : undefined;
}

/** A Magic tablet someone already rolled, carrying ONE modifier the craft does not want, on one side. */
export interface StandIn {
  readonly side: 'prefix' | 'suffix';
  /** The most it is worth paying for, against a plain tablet at the price typed. */
  readonly worth: number;
}

/**
 * Magic tablets worth buying INSTEAD of a plain one: one holding a single unwanted prefix, and one holding
 * a single unwanted suffix — the two a market actually lists in number (Dorian, 2026-09-23: "I want magic
 * with 1 suffix only and 1 prefix only"; a Rare with nothing on one side is too rare to shop for). Priced
 * by the solve itself: finishing from one costs its state's value, finishing from a plain one costs a
 * plain tablet plus the craft, so it is worth up to the difference —
 *
 *     worth = plain + V(plain tablet) − V(this one)
 *
 * exact, from the same solve. Which side pays depends on the craft: fishing for a suffix, the prefix one is
 * worth about a plain tablet (a Transmute lands a prefix half the time anyway) and the suffix one about
 * half. `value` reads a state's cost by key, undefined where the solve has none.
 */
export function standIns(value: (key: string) => number | undefined, fromPlain: number, plainCost: number): StandIn[] {
  return (['prefix', 'suffix'] as const).flatMap((side) => {
    const v = value(encodeState(0, 0, side === 'prefix' ? 1 : 0, side === 'suffix' ? 1 : 0, FLAG_NONE, 'magic'));
    return v === undefined || !Number.isFinite(v) ? [] : [{ side, worth: Math.max(0, plainCost + fromPlain - v) }];
  });
}

/**
 * The trade filter for a stand-in, as the trade site actually answers it on a Magic tablet (checked by
 * Dorian on the site, 2026-09-23): "# Empty Prefix Modifiers" at most 1 lists the ones holding only a
 * suffix, "# Empty Suffix Modifiers" at most 1 the ones holding only a prefix. One filter, on the OTHER side.
 */
export function standInFilters(s: StandIn): { id: string; value: { max: number }; disabled: false }[] {
  const other = s.side === 'prefix' ? 'suffix' : 'prefix';
  return [{ id: `pseudo.pseudo_number_of_empty_${other}_mods`, value: { max: 1 }, disabled: false }];
}

