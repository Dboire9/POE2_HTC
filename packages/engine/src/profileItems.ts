import type { PatchData } from './types.ts';
import { resolveMod } from './pool.ts';
import { baseNameIndex, findBaseInName } from './baseLookup.ts';
import { statIndex, resolveByStats, familyConflicts } from './statLookup.ts';
import { resolveMods } from './resolveMods.ts';
import { tierDisplay } from './tierFit.ts';

/**
 * A character's gear, as a profile API serves it, turned into crafts this engine understands.
 *
 * PURE, and that is the point: the fetching lives in a periodic job (`tools/streamers/`), this is
 * the part worth testing, and it is tested against a REAL character's gear rather than something
 * invented. Same split as `solve.ts` against the worker.
 *
 * IT MUST RUN IN THE JOB, NOT THE BROWSER. `resolveByStats` reads `tiers[].stats`, which `shipMods.ts`
 * strips from the asset the browser downloads — so the resolution happens where the full file is,
 * and what ships to players is the ANSWER: base ids, mod ids and tier numbers, a few hundred bytes an
 * item instead of a 400 kB payload plus the stats column. It also keeps every player's browser from
 * calling poe.ninja, which is what their stated ask asks for and what the price design already does.
 */

/** The shape a profile API gives one modifier: the game's stat identifiers, and its own id. */
interface SourceMod {
  readonly id?: string;
  readonly stats?: Readonly<Record<string, number>>;
}

/** Only the fields read here — a caller may hand over the whole payload. */
export interface SourceItem {
  readonly name?: string;
  readonly baseType?: string;
  readonly ilvl?: number;
  readonly rarity?: string;
  readonly corrupted?: boolean;
  readonly inventoryId?: string;
  readonly mods?: Readonly<Record<string, readonly SourceMod[]>>;
  /** The desecrated modifiers as PRINTED. Needed because the shipped data carries stat identifiers
   *  for every normal mod and for none of the 693 desecrated ones — see `DESECRATED_BY_TEXT`. */
  readonly desecratedMods?: readonly string[];
}

export interface ProfileMod {
  readonly modId: string;
  /** 1 = best, matching every picker in the app. */
  readonly tierDisplay: number;
  /** Locked on the item: never removed, out of every removal pool. */
  readonly fractured: boolean;
  /** Placed by a Desecration. */
  readonly desecrated: boolean;
  /** Rolled above anything the mod can produce — Sanctified, and read as the best tier. */
  readonly sanctified: boolean;
}

export interface ProfileItem {
  readonly slot: string;
  readonly name: string;
  readonly baseName: string;
  readonly baseId: string;
  readonly level: number;
  readonly mods: readonly ProfileMod[];
  /** Modifiers that could not be placed, named with the category they came from. Never dropped in
   *  silence: a craft missing a modifier is a different craft, and a cheaper-looking one. */
  readonly unresolved: readonly string[];
  /**
   * Mod ids appearing twice, or sharing an exclusion family.
   *
   * A real item this engine cannot represent — the Passion of Aldur route produces one. Reported so
   * a caller can say so instead of planning against an item nobody owns. See `runeConvert.ts` for
   * how such an item is actually crafted.
   */
  readonly familyConflict: readonly string[];
  /** Nothing can modify a Corrupted item further. */
  readonly corrupted: boolean;
}

/** An item the read left out, and why — with what it is, so a caller can decide what to show. */
export interface ProfileSkip {
  readonly name: string;
  readonly reason: string;
  /** As the source gives it. Absent on socketables such as runes, which carry no rarity at all. */
  readonly rarity?: string;
  /** The source's `inventoryId`: an equipment slot like `Helm`, or a non-gear one like `Chakra`. */
  readonly slot?: string;
}

export interface ProfileResult {
  readonly items: readonly ProfileItem[];
  /** Items skipped, and why — a Unique is not a failure, it is simply not craftable. */
  readonly skipped: readonly ProfileSkip[];
}

/**
 * Which categories hold modifiers a craft has to account for.
 *
 * `implicit` and `enchant` are excluded because no currency this app models can produce them.
 * `crafted` is INCLUDED even though the engine cannot produce it either, because it occupies an
 * affix slot: leaving it out would describe an item with more room than it has, and every
 * probability computed from that would be too generous. It lands in `unresolved` when the pools do
 * not hold it, which says so plainly.
 */
const CRAFTABLE = ['explicit', 'fractured', 'crafted'] as const;

/**
 * Desecrated modifiers are resolved from their printed TEXT, not their stats, and the reason is in
 * the data: **0 of 693 desecrated mods carry `tiers[].stats`, against 951 of 951 normal ones.** The
 * stat vocabulary comes from RePoE and the desecrated pool does not, so the stat index structurally
 * cannot hold them and `resolveByStats` returns nothing for every one.
 *
 * Pairing the structured entries to the printed lines by POSITION was tried and does not work — 5 of
 * 30 category arrays disagree in length on one real character, because the game sums same-stat
 * modifiers into one line and splits hybrids across two. So each category uses the route that can
 * actually answer it, and nothing is matched up by index.
 */
/** poe.ninja renders PoE's markup: `[Token|Display]`, where the second half is what a player reads. */
const strip = (line: string): string =>
  line.replace(/\[[^\]|]+\|([^\]]+)\]/g, '$1').replace(/\[([^\]]+)\]/g, '$1');

export function resolveProfileItems(data: PatchData, source: readonly SourceItem[]): ProfileResult {
  const bases = baseNameIndex(data);
  const items: ProfileItem[] = [];
  const skipped: ProfileSkip[] = [];
  // What the item IS travels with the reason: a Unique, a Rare on a base this data lacks, and a rune in
  // a socket are all "skipped", and only the first two are anything a player would notice missing.
  const what = (item: SourceItem) => ({
    ...(item.rarity ? { rarity: item.rarity } : {}),
    ...(item.inventoryId ? { slot: item.inventoryId } : {}),
  });

  for (const item of source) {
    const label = item.name ?? item.baseType ?? '(unnamed)';
    if (item.rarity !== 'Rare') {
      skipped.push({ name: label, reason: `${item.rarity ?? 'unknown rarity'} — only a Rare is craftable here`, ...what(item) });
      continue;
    }
    const match = findBaseInName(bases, item.baseType ?? '');
    if (match.id === undefined) {
      skipped.push({
        name: label,
        reason: match.ids.length > 1
          ? `“${item.baseType}” is on several rows (${match.ids.join(', ')})`
          : `“${item.baseType}” is not a base in the ${data.patch} data`,
        ...what(item),
      });
      continue;
    }
    const base = data.bases.get(match.id)!;
    const index = statIndex(data, base);
    const level = item.ilvl ?? 100;

    const mods: ProfileMod[] = [];
    const unresolved: string[] = [];
    for (const category of CRAFTABLE) {
      for (const entry of item.mods?.[category] ?? []) {
        if (!entry.stats || Object.keys(entry.stats).length === 0) {
          unresolved.push(`${category}: ${entry.id ?? '(no stats)'}`);
          continue;
        }
        const r = resolveByStats(data, index, { stats: entry.stats, ...(entry.id ? { id: entry.id } : {}) }, level);
        if (r.modId === undefined || r.tierName === undefined) {
          unresolved.push(`${category}: ${entry.id ?? Object.keys(entry.stats).join('+')}`);
          continue;
        }
        mods.push({
          modId: r.modId,
          tierDisplay: tierDisplay(resolveMod(data, r.modId), r.tierName),
          fractured: category === 'fractured',
          // Desecrated modifiers never come through this loop — they are resolved from text below.
          desecrated: false,
          sanctified: r.sanctified,
        });
      }
    }

    // Desecrated: text, for the reason in DESECRATED_BY_TEXT. `resolveMods` reads a window of lines,
    // so a desecrated hybrid printing across two of them is one modifier here as it should be.
    const desecratedLines = (item.desecratedMods ?? []).map(strip);
    if (desecratedLines.length > 0) {
      const r = resolveMods(data, base, desecratedLines, { level });
      for (const row of r.resolved) {
        if (row.modId === undefined || row.tierName === undefined) {
          unresolved.push(`desecrated: ${row.lines.join(' / ')}`);
          continue;
        }
        mods.push({
          modId: row.modId,
          tierDisplay: tierDisplay(resolveMod(data, row.modId), row.tierName),
          fractured: false,
          desecrated: true,
          sanctified: row.sanctified,
        });
      }
      for (const u of r.unresolved) unresolved.push(`desecrated: ${u.line}`);
    }

    items.push({
      slot: item.inventoryId ?? '',
      name: item.name ?? '',
      baseName: item.baseType ?? '',
      baseId: match.id,
      level,
      mods,
      unresolved,
      familyConflict: familyConflicts(data, mods.map((m) => m.modId)),
      corrupted: item.corrupted === true,
    });
  }
  return { items, skipped };
}
