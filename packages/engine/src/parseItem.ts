/**
 * The game's own item text, as Ctrl+C puts it on the clipboard.
 *
 * Path of Exile 2 copies a hovered item as a plain-text block: dashed separators between sections, a
 * header naming the class, rarity and base, then properties, then the modifiers. This turns that back
 * into structure. It reads TEXT ONLY and knows nothing about mod pools — `resolveMods` takes the lines
 * from here and finds the mods, and keeping the two apart is what lets the same parser feed a paste
 * box, a fixture, or anything else that produces the same format.
 *
 * TWO FORMATS, and the difference matters enormously. **Ctrl+C** gives bare lines:
 *
 *     Adds 32 to 59 Physical Damage (fractured)
 *     188% increased Physical Damage
 *
 * **Ctrl+Alt+C** ("advanced") prefixes each modifier with its own header:
 *
 *     { Prefix Modifier "Razor-sharp" (Tier: 3) — Damage, Physical, Attack }
 *     Adds 24(23-35) to 51(39-59) Physical Damage
 *
 * That header carries the affix SIDE and the TIER NAME — and the tier name is spelled exactly as this
 * project's data spells it ("Razor-sharp" is a tier of `Bows/LocalPhysicalDamage`). So an advanced
 * paste answers questions the printed line cannot: two mods on one base can share a text and a range
 * and differ only in being a prefix or a suffix, which no amount of reading the line will settle.
 * Prefer the advanced paste wherever it is available, and say so in the UI.
 *
 * TRACED, NOT ASSUMED. The format here is taken from real items pasted into bug reports against
 * Exiled Exchange 2 (Kvan7/Exiled-Exchange-2 issues #686, #797, #856) rather than from PoE1 habit —
 * `Sockets:`, the `(rune)` and `(desecrated)` annotations and the `109(100-119)%` value-with-range
 * are all PoE2-specific and none of them appear in PoE1's format.
 *
 * UNIQUES ARE OUT OF SCOPE, deliberately. They parse, but nothing this app models can modify a
 * unique's modifiers, and a unique's flavour text is prose in an unlabelled section that no rule here
 * distinguishes from a modifier. A caller should refuse `rarity: 'unique'` rather than plan a craft
 * on one.
 */

/** Where a modifier came from. Only `explicit` is craftable — see `resolveMods`. */
export type ModKind = 'explicit' | 'implicit' | 'rune' | 'enchant';

export interface ParsedMod {
  /**
   * The printed lines, ready for `resolveMods`: annotations removed, rolled values kept, and an
   * advanced paste's `(min-max)` hints stripped back to the roll.
   *
   * More than one line only in an advanced paste, where the braces say which lines belong together.
   * A plain paste cannot say, so a hybrid modifier arrives as two entries of one line each — pass the
   * whole list to `resolveMods` and its window matching will rejoin them.
   */
  readonly lines: readonly string[];
  readonly kind: ModKind;
  /** Locked on the item: never removed, and out of every removal pool. */
  readonly fractured: boolean;
  /** Placed by a Desecration. Gates the Well of Souls and the Omen of Light. */
  readonly desecrated: boolean;
  /** Advanced paste only — the side the game says this modifier is on. */
  readonly side?: 'prefix' | 'suffix';
  /** Advanced paste only — the tier's name, as `Tier.name` spells it. */
  readonly tierName?: string;
}

export interface ParsedItem {
  readonly itemClass?: string;
  readonly rarity?: 'normal' | 'magic' | 'rare' | 'unique';
  /**
   * The name lines, verbatim. A Rare or Unique prints two — the rolled name then the base — so the
   * base is the LAST of them. A Normal prints one, which is the base. A Magic item also prints one,
   * but it is the base wrapped in the affixes' words ("Fine Bow of the Wind"), so the base has to be
   * searched for rather than read off; `findBaseInName` does that.
   */
  readonly nameLines: readonly string[];
  readonly itemLevel?: number;
  readonly quality?: number;
  readonly corrupted: boolean;
  readonly mods: readonly ParsedMod[];
  /** True when the paste carried `{ … Modifier … }` headers, so sides and tiers are known. */
  readonly advanced: boolean;
}

/** A line of four or more dashes separates the sections. */
const SEPARATOR = /^-{4,}$/;

/** `Label: value` — every property line has this shape and no modifier does. */
const PROPERTY = /^[^:]+: /;

/** Trailing flags that occupy a section of their own. */
const FLAGS = new Set([
  'Corrupted', 'Fractured Item', 'Mirrored', 'Unmodifiable', 'Split', 'Desecrated',
  'Unidentified', 'Note', 'Can only be equipped by a Mercenary',
]);

/** `{ Prefix Modifier "Razor-sharp" (Tier: 3) — Damage, Physical }` and its plainer variants. */
const GROUP = /^\{\s*(\w+)\s+Modifier(?:\s+"([^"]*)")?(?:\s+\(Tier:\s*(\d+)\))?/;

/** An annotation the game appends to a modifier line. */
const ANNOTATION = /\s*\((implicit|rune|enchant|fractured|desecrated|crafted|scourge)\)\s*$/i;

/** `109(100-119)%` — an advanced paste shows the roll, then the tier's range. Keep the roll. */
const stripRangeHint = (line: string): string =>
  line.replace(/(\d+(?:\.\d+)?)\((?:\d+(?:\.\d+)?)(?:-(?:\d+(?:\.\d+)?))?\)/g, '$1');

const RARITIES: Record<string, ParsedItem['rarity']> = {
  normal: 'normal', magic: 'magic', rare: 'rare', unique: 'unique',
};

interface Annotated { readonly text: string; readonly kind?: ModKind; readonly flag?: 'fractured' | 'desecrated' }

/** Split a modifier line from the annotation the game appended to it. */
function annotation(line: string): Annotated {
  const m = ANNOTATION.exec(line);
  if (!m) return { text: line };
  const text = line.slice(0, m.index).trimEnd();
  switch (m[1]!.toLowerCase()) {
    case 'implicit': return { text, kind: 'implicit' };
    case 'rune': return { text, kind: 'rune' };
    case 'enchant': return { text, kind: 'enchant' };
    case 'fractured': return { text, flag: 'fractured' };
    case 'desecrated': return { text, flag: 'desecrated' };
    default: return { text };   // `crafted`, `scourge` — an explicit mod either way
  }
}

/**
 * Read one section of modifier lines.
 *
 * In an advanced paste a `{ … }` header opens a group and the lines under it are one modifier; in a
 * plain paste there are no headers and each line stands alone, which is the honest reading since
 * nothing in the text says otherwise.
 */
function readMods(section: readonly string[]): ParsedMod[] {
  const mods: ParsedMod[] = [];
  let open: { side?: 'prefix' | 'suffix'; tierName?: string; kind?: ModKind; lines: string[] } | undefined;

  const close = () => {
    if (!open || open.lines.length === 0) return;
    const flags = open.lines.map(annotation);
    mods.push({
      lines: flags.map((f) => stripRangeHint(f.text)),
      kind: open.kind ?? flags.find((f) => f.kind)?.kind ?? 'explicit',
      fractured: flags.some((f) => f.flag === 'fractured'),
      desecrated: flags.some((f) => f.flag === 'desecrated'),
      ...(open.side ? { side: open.side } : {}),
      ...(open.tierName ? { tierName: open.tierName } : {}),
    });
    open = undefined;
  };

  for (const line of section) {
    const g = GROUP.exec(line);
    if (g) {
      close();
      const word = g[1]!.toLowerCase();
      open = {
        lines: [],
        ...(word === 'prefix' || word === 'suffix' ? { side: word } : {}),
        ...(g[2] ? { tierName: g[2] } : {}),
        ...(word === 'implicit' ? { kind: 'implicit' as const } : {}),
      };
      continue;
    }
    if (open) { open.lines.push(line); continue; }
    // No header: one line, one modifier.
    open = { lines: [line] };
    close();
  }
  close();
  return mods;
}

/**
 * Parse a Ctrl+C (or Ctrl+Alt+C) item block.
 *
 * Returns `null` for text that is not an item — a paste box gets whatever was on the clipboard, and
 * a wrong guess about arbitrary text is worse than saying nothing.
 */
export function parseItemText(text: string): ParsedItem | null {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd());
  const sections: string[][] = [[]];
  for (const line of lines) {
    if (SEPARATOR.test(line.trim())) sections.push([]);
    else if (line.trim().length > 0) sections[sections.length - 1]!.push(line);
  }
  const head = sections[0];
  if (!head || head.length === 0) return null;

  let itemClass: string | undefined;
  let rarity: ParsedItem['rarity'];
  const nameLines: string[] = [];
  for (const line of head) {
    const cls = /^Item Class:\s*(.+)$/.exec(line);
    const rar = /^Rarity:\s*(.+)$/.exec(line);
    if (cls) itemClass = cls[1]!.trim();
    else if (rar) rarity = RARITIES[rar[1]!.trim().toLowerCase()];
    else nameLines.push(line.trim());
  }
  // `Rarity:` is the one line every item has and nothing else does. Without it this is not an item.
  if (rarity === undefined) return null;

  let itemLevel: number | undefined;
  let quality: number | undefined;
  let corrupted = false;
  const mods: ParsedMod[] = [];
  let advanced = false;

  for (const section of sections.slice(1)) {
    if (section.every((l) => FLAGS.has(l.trim()) || /^Note:/.test(l))) {
      if (section.some((l) => l.trim() === 'Corrupted')) corrupted = true;
      continue;
    }
    if (section.every((l) => PROPERTY.test(l))) {
      for (const l of section) {
        const il = /^Item Level:\s*(\d+)/.exec(l);
        const q = /^Quality:\s*\+?(\d+)/.exec(l);
        if (il) itemLevel = Number(il[1]);
        if (q) quality = Number(q[1]);
      }
      continue;
    }
    if (section.some((l) => GROUP.test(l))) advanced = true;
    mods.push(...readMods(section));
  }

  return {
    ...(itemClass === undefined ? {} : { itemClass }),
    rarity,
    nameLines,
    ...(itemLevel === undefined ? {} : { itemLevel }),
    ...(quality === undefined ? {} : { quality }),
    corrupted,
    mods,
    advanced,
  };
}

/** The lines of every modifier of one kind, flattened — what `resolveMods` takes. */
export function linesOfKind(item: ParsedItem, kind: ModKind): string[] {
  return item.mods.filter((m) => m.kind === kind).flatMap((m) => [...m.lines]);
}
