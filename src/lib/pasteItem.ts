// Imported from the modules themselves, NEVER from `packages/engine/src/index.ts`. That barrel
// re-exports `loadPatch`, which imports `node:fs` — so one convenient import of it would drag a Node
// builtin into the browser bundle and fail the build. (It did. See bundleIsolation.test.ts, which
// walks the graph so the next one fails in the suite instead.)
import type { PatchData } from '../../packages/engine/src/types.ts';
import { parseItemText } from '../../packages/engine/src/parseItem.ts';
import type { ModKind, ParsedMod } from '../../packages/engine/src/parseItem.ts';
import { resolveMods } from '../../packages/engine/src/resolveMods.ts';
import type { ResolvedLine } from '../../packages/engine/src/resolveMods.ts';
import { baseNameIndex, findBaseInName } from '../../packages/engine/src/baseLookup.ts';
import { resolveMod } from '../../packages/engine/src/pool.ts';
import { tierDisplay } from '../../packages/engine/src/tierFit.ts';
import type { ItemModInput } from './engineTypes.ts';

/**
 * A pasted item, read into the shape the Item tab holds.
 *
 * The engine half of this — parse the text, find the base, resolve the lines — is three pure
 * functions in `packages/engine`. This is the layer between them and the UI: it runs them in order,
 * turns tier NAMES into the tier DISPLAY numbers the pickers use, and carries the player's answers to
 * the questions the text cannot settle.
 *
 * NO REACT HERE, deliberately, and for the same reason `solve.ts` has none: the interesting behaviour
 * is "what did we read out of this text", and a test of that should not have to mount a component.
 *
 * WHAT IT REFUSES TO GUESS. Three things about a pasted item are genuinely undecidable from the text,
 * and every one of them changes the craft:
 *   - which mod a line is, when a base carries two with the same text and overlapping ranges;
 *   - which tier, when tier ranges overlap;
 *   - whether two adjacent lines are one hybrid modifier or two ordinary ones.
 * Each is surfaced as a choice keyed on the printed lines, and `readPastedItem` is re-run with the
 * answer. Keying on the LINES rather than on a row index is what makes that stable: answering one
 * question re-groups the rows, and an index would then point at a different row than it did.
 */

/** The player's answers, keyed by a row's `key` (its printed lines, joined). */
export interface PasteChoices {
  /** Rows to read as one modifier per line instead of one hybrid. */
  readonly split: ReadonlySet<string>;
  readonly modId: ReadonlyMap<string, string>;
  readonly tier: ReadonlyMap<string, number>;
}

export const NO_CHOICES: PasteChoices = { split: new Set(), modId: new Map(), tier: new Map() };

export interface PasteTier {
  /** 1 = best, matching every tier picker in the app. */
  readonly display: number;
  readonly name: string;
}

export interface PasteRow {
  /** Stable identity: the printed lines, joined. Choices are keyed on this. */
  readonly key: string;
  readonly lines: readonly string[];
  /** Every mod the line could be, in pool order. Longer than one means a real question. */
  readonly modIds: readonly string[];
  readonly modId: string | undefined;
  /** Every tier the roll allows, best-first. Longer than one means a real question. */
  readonly tiers: readonly PasteTier[];
  readonly tierDisplay: number | undefined;
  readonly side: 'prefix' | 'suffix' | undefined;
  readonly fractured: boolean;
  readonly desecrated: boolean;
  /** Set when these lines also read as one modifier per line — the grouping is a question. */
  readonly canSplit: boolean;
  /** The roll is above anything the mod can produce, so it was Sanctified and reads as the best
   *  tier. Worth showing: it is the difference between "your best mod" and "unreadable". */
  readonly sanctified: boolean;
}

export interface PasteReading {
  readonly baseName: string;
  readonly baseId: string | undefined;
  readonly baseIds: readonly string[];
  readonly level: number | undefined;
  readonly rarity: 'magic' | 'rare' | undefined;
  /** A Ctrl+Alt+C paste, which states sides and tiers and so leaves far less to guess. */
  readonly advanced: boolean;
  readonly rows: readonly PasteRow[];
  /** Lines no mod in the base's pools claims. */
  readonly unresolved: readonly string[];
  /** Runes, implicits and enchants. Listed rather than dropped, so the player can see they were read
   *  and understood — they are simply not craftable, so they are not part of the item we plan on. */
  readonly skipped: readonly { readonly kind: ModKind; readonly lines: readonly string[] }[];
  /** Why this paste cannot be used as it stands. Empty means it can. */
  readonly problems: readonly string[];
}

const keyOf = (lines: readonly string[]): string => lines.join('\n');

/** Engine tiers run worst-first; every picker in the app runs best-first from 1. One copy of that
 *  inversion, in `tierFit.ts`, shared with the profile reader. */
const displayOf = (data: PatchData, modId: string, tierName: string): number =>
  tierDisplay(resolveMod(data, modId), tierName);

function toRow(
  data: PatchData, line: ResolvedLine, from: readonly ParsedMod[], choices: PasteChoices,
): PasteRow {
  const key = keyOf(line.lines);
  // A chosen mod only counts if it was actually a candidate — a stale choice from an earlier paste
  // must not put a mod on the item that this text never mentioned.
  const chosen = choices.modId.get(key);
  const modId = chosen !== undefined && line.modIds.includes(chosen) ? chosen : line.modId;
  // An advanced paste states the tier outright; otherwise the roll narrows it and the player settles
  // whatever is left.
  const stated = from.map((m) => m.tierName).find((t) => t !== undefined);
  // The tiers of whatever mod is in play — the player's answer, not the default pick, which is why
  // `tiersOf` carries every candidate's.
  const allowed = modId === undefined ? [] : line.tiersOf.get(modId) ?? [];
  const names = stated !== undefined && allowed.includes(stated) ? [stated] : allowed;
  const tiers = modId === undefined ? []
    : names.map((name) => ({ display: displayOf(data, modId, name), name }))
      .sort((a, b) => a.display - b.display);
  const pickedTier = choices.tier.get(key);
  const tierDisplay = tiers.some((t) => t.display === pickedTier) ? pickedTier
    : tiers.length === 1 ? tiers[0]!.display : undefined;
  return {
    key,
    lines: line.lines,
    modIds: line.modIds,
    modId,
    tiers,
    tierDisplay,
    side: modId === undefined ? undefined : resolveMod(data, modId).type,
    fractured: from.some((m) => m.fractured),
    desecrated: from.some((m) => m.desecrated),
    canSplit: line.alternative !== undefined,
    sanctified: line.sanctified,
  };
}

/**
 * Read a Ctrl+C (or Ctrl+Alt+C) paste against the shipped data.
 *
 * Returns `null` when the text is not an item at all — a paste box gets whatever was on the
 * clipboard, and a wrong guess about arbitrary text is worse than saying nothing.
 */
export function readPastedItem(
  data: PatchData, text: string, choices: PasteChoices = NO_CHOICES,
): PasteReading | null {
  const parsed = parseItemText(text);
  if (!parsed) return null;

  const problems: string[] = [];
  const baseName = parsed.nameLines.at(-1) ?? '';
  const match = findBaseInName(baseNameIndex(data), baseName);
  const base = match.id === undefined ? undefined : data.bases.get(match.id);

  const rarity = parsed.rarity === 'rare' || parsed.rarity === 'magic' ? parsed.rarity : undefined;
  if (parsed.rarity === 'unique') problems.push('Unique items cannot be crafted — no currency this app models can change a unique’s modifiers.');
  else if (parsed.rarity === 'normal') problems.push('This is a white item with no modifiers. Use “Plan from scratch” instead.');
  if (!base) {
    problems.push(match.ids.length > 1
      ? `“${baseName}” could be ${match.ids.join(' or ')} — pick the base by hand.`
      : `“${baseName}” is not a base in the ${data.patch} data. It may be from a newer patch.`);
  }
  if (parsed.corrupted) problems.push('This item is Corrupted, so no currency can modify it further.');

  const explicit = parsed.mods.filter((m) => m.kind === 'explicit');
  const skipped = (['implicit', 'rune', 'enchant'] as const)
    .map((kind) => ({ kind, lines: parsed.mods.filter((m) => m.kind === kind).flatMap((m) => m.lines) }))
    .filter((s) => s.lines.length > 0);

  const rows: PasteRow[] = [];
  const unresolved: string[] = [];
  if (base) {
    const opts = parsed.itemLevel === undefined ? {} : { level: parsed.itemLevel };
    if (parsed.advanced) {
      // The braces already say which lines belong together, so each modifier is its own question and
      // the grouping never is.
      for (const mod of explicit) {
        const r = resolveMods(data, base, mod.lines, opts);
        for (const line of r.resolved) rows.push(toRow(data, line, [mod], choices));
        for (const u of r.unresolved) unresolved.push(u.line);
      }
    } else {
      const r = resolveMods(data, base, explicit.flatMap((m) => m.lines), opts);
      // A plain paste is one line per parsed modifier, so a resolved row consumes exactly as many of
      // them as it has lines — which is how a hybrid's flags reach the row that swallowed both.
      let at = 0;
      for (const line of r.resolved) {
        const take = explicit.slice(at, at + line.lines.length);
        at += line.lines.length;
        const split = choices.split.has(keyOf(line.lines)) ? line.alternative : undefined;
        if (split) split.forEach((alt, i) => rows.push(toRow(data, alt, take.slice(i, i + 1), choices)));
        else rows.push(toRow(data, line, take, choices));
      }
      for (const u of r.unresolved) unresolved.push(u.line);
    }
  }

  return {
    baseName,
    baseId: match.id,
    baseIds: match.ids,
    level: parsed.itemLevel,
    rarity,
    advanced: parsed.advanced,
    rows,
    unresolved,
    skipped,
    problems,
  };
}

/** Only a row that knows its mod AND its tier can go on the item. */
export const isSettled = (r: PasteRow): boolean => r.modId !== undefined && r.tierDisplay !== undefined;

/**
 * The settled rows, as the Item tab's two lists.
 *
 * Over-full sides are TRUNCATED rather than rejected, and the caller is told how many were dropped:
 * an item that reads as four prefixes is a misread — almost always a hybrid grouping the player has
 * yet to answer — and refusing the whole paste over it would hide the four they could have fixed.
 */
export function itemModsFrom(
  reading: PasteReading, cap = 3,
): { prefixes: ItemModInput[]; suffixes: ItemModInput[]; dropped: number } {
  const prefixes: ItemModInput[] = [];
  const suffixes: ItemModInput[] = [];
  let dropped = 0;
  for (const r of reading.rows) {
    if (!isSettled(r)) continue;
    const into = r.side === 'prefix' ? prefixes : suffixes;
    if (into.length >= cap) { dropped++; continue; }
    into.push({
      modId: r.modId!,
      tierDisplay: r.tierDisplay!,
      ...(r.fractured ? { fractured: true } : {}),
      ...(r.desecrated ? { desecrated: true } : {}),
    });
  }
  return { prefixes, suffixes, dropped };
}
