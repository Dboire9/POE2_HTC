import type { ItemBase, PatchData, Tier } from './types.ts';
import { resolveMod } from './pool.ts';
import { baseNameIndex, findBaseInName } from './baseLookup.ts';
import { statIndex, resolveByStats, familyConflicts } from './statLookup.ts';
import { resolveMods } from './resolveMods.ts';
import { tierDisplay } from './tierFit.ts';
import { runeIdByName } from './runes.ts';

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
  /** What is socketed in it — runes, soul cores, idols, skill gems. Only the few that change a
   *  CRAFT's rules are kept (`runeIdByName`); the rest are not this app's business. */
  readonly socketedItems?: readonly SourceSocketed[];
}

/** A socketed item. poe.ninja leaves `name` empty on these and puts the rune in `baseType`. */
interface SourceSocketed {
  readonly name?: string;
  readonly baseType?: string;
  readonly typeLine?: string;
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
  /**
   * Runes socketed in it that change what it may HOLD, by their id in `runes.ts`.
   *
   * Read because the item cannot be explained without them: an item carrying two crafted modifiers or
   * four suffixes is illegal until you know an Astrid's Creativity or a Serle's Triumph is in it, and a
   * planner told only about the modifiers would refuse a craft somebody has actually done.
   */
  readonly runes: readonly string[];
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
/**
 * poe.ninja renders PoE's markup: `[Token|Display]`, where the second half is what a player reads.
 *
 * No class may cross a `[`. The markup never nests, and a class that could run past an opening bracket
 * made every `[` rescan the rest of the line — quadratic on a line of unclosed brackets (CodeQL:
 * polynomial regex on uncontrolled data, and these lines come from poe.ninja). With `[` excluded each
 * scan stops at the next one, so no two scans overlap and the line is read once.
 */
export const strip = (line: string): string =>
  line.replace(/\[[^[\]|]+\|([^[\]]+)\]/g, '$1').replace(/\[([^[\]]+)\]/g, '$1');

/** A tier as the FILE carries it. `codes` is absent from the shipped `Tier` — see `apply_codes.mjs`,
 *  which writes it, and `shipMods.ts`, which projects it away for exactly the reason `stats` is. */
type TierWithCodes = Tier & { readonly codes?: readonly string[] };

/** Where a game modifier id lands: the mod that stands for it here, and which of its tiers it is. */
interface CodeHit {
  readonly modId: string;
  readonly tierName: string;
}

/**
 * Index one base's CRAFTED pool by the game's own modifier ids.
 *
 * The counterpart to `statIndex`, and it exists because that one structurally cannot answer here:
 * **no essence, perfect-essence or alloy mod carries `tiers[].stats`**, so the stat index holds none
 * of them and `resolveByStats` returns nothing for every crafted line. The game id the profile API
 * sends is the key that does work, and it names the exact TIER as well as the mod — so nothing has to
 * be fitted from the roll, and a hybrid's two stats need no ordering.
 *
 * Per BASE, like `statIndex`, and for the same reason: one game id names a different mod on a Ring
 * than on a Body Armour.
 */
export function codeIndex(data: PatchData, base: ItemBase): ReadonlyMap<string, CodeHit> {
  const idx = new Map<string, CodeHit>();
  const seen = new Set<string>();
  for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
    const mod = resolveMod(data, id);
    for (const tier of mod.tiers as readonly TierWithCodes[]) {
      for (const code of tier.codes ?? []) {
        // Two tiers claiming one id is the ambiguity `apply_codes.mjs` already drops. Belt and braces:
        // should a shipped file ever carry one, resolve NEITHER rather than let pool order decide.
        if (seen.has(code)) { idx.delete(code); continue; }
        seen.add(code);
        idx.set(code, { modId: id, tierName: tier.name });
      }
    }
  }
  return idx;
}

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
    const codes = codeIndex(data, base);
    const level = item.ilvl ?? 100;

    const mods: ProfileMod[] = [];
    const unresolved: string[] = [];
    for (const category of CRAFTABLE) {
      for (const entry of item.mods?.[category] ?? []) {
        // A CRAFTED line is resolved from the game's own id FIRST, because the stats route cannot do
        // it at all: an Essence or Alloy mod carries no stats here. Nine such lines went unresolved on
        // five real characters. It also RE-POINTS lines the stats did resolve, and that is the point —
        // an Essence of Opulence forces the ordinary rarity modifier, so `ItemFoundRarityIncrease3`
        // arrives filed under `crafted`, and only the essence-pool mod occupies the crafted slot and
        // sits in the crafted family namespace (`familiesOf`, pool.ts).
        const hit = category === 'crafted' && entry.id !== undefined ? codes.get(entry.id) : undefined;
        if (hit) {
          mods.push({
            modId: hit.modId,
            tierDisplay: tierDisplay(resolveMod(data, hit.modId), hit.tierName),
            fractured: false,
            desecrated: false,
            // The id names the tier outright, so there is no roll sitting above one to report.
            sanctified: false,
          });
          continue;
        }
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

    // Socketed runes, each counted ONCE. Two of one rune is ordinary on a real item — two Perfect Iron
    // Runes, measured — and whether a second Astrid's Creativity would allow a THIRD crafted modifier
    // is untraced, so this reads what is there without claiming a stack nobody has verified.
    const runes = [...new Set(
      (item.socketedItems ?? [])
        .map((s) => runeIdByName(s.baseType ?? s.typeLine ?? s.name ?? ''))
        .filter((id): id is string => id !== undefined),
    )];

    items.push({
      slot: item.inventoryId ?? '',
      name: item.name ?? '',
      baseName: item.baseType ?? '',
      baseId: match.id,
      level,
      mods,
      unresolved,
      familyConflict: familyConflicts(data, mods.map((m) => m.modId)),
      runes,
      corrupted: item.corrupted === true,
    });
  }
  return { items, skipped };
}
