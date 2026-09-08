import type { ItemBase, Mod, PatchData, Tier } from './types.ts';
import { resolveMod } from './pool.ts';

/**
 * "Which mod is this line?" — the printed text on an item -> a mod id and tier in the pools.
 *
 * An item read from anywhere outside this app — a Ctrl+C paste, a poe.ninja profile — arrives as
 * rendered English: `+42% of Armour also applies to Elemental Damage`. The engine needs
 * `Helmets_str/ArmourAppliesToElementalDamage` at tier `of Furring`, because a mod id is what the
 * pools, the weights and every probability are keyed by. This is the bridge, and it is the only
 * place that knows how a mod's stored template relates to what the game prints.
 *
 * SCOPED TO ONE BASE, which is what makes it tractable. `+#% to Cold Resistance` is 64 different
 * mods across the shipped data — one per base, plus the essence twin — and a global text index would
 * be ambiguous on nearly every line. Inside a single base's pools it is at most a handful, and the
 * rolled values usually settle the rest.
 *
 * AMBIGUITY IS REPORTED, NOT GUESSED, exactly as `baseLookup` reports it: `modIds` names every
 * candidate and `modId` is set only when one survives. A caller that silently took the first would
 * plan against the wrong tier weights, and the numbers it printed would be wrong in a way nothing
 * on screen could reveal.
 *
 * IT RESOLVES ONLY WHAT THE POOLS CONTAIN. Runes, enchants and corruption implicits are not craftable
 * and are not in any pool, so they land in `unresolved` — which is the correct answer for them, not a
 * failure. A caller must not feed them to the planner as targets: no orb can produce them.
 */

/** One modifier, read off the item and located in the base's pools. */
export interface ResolvedLine {
  /** The printed lines this one modifier occupied — two for a hybrid roll (see `linesOf`). */
  readonly lines: readonly string[];
  /**
   * Every candidate the ROLL leaves standing, in pool order — the mods whose text matches and whose
   * ranges could have produced these values. More than one here is real ambiguity in the data, not a
   * shortcut: three shipped mods read `#% increased Strength, Dexterity or Intelligence` with the
   * same range, and nothing printed on the item tells them apart.
   */
  readonly modIds: readonly string[];
  /**
   * The mod to plan against. Set even when `modIds` has several, if a documented preference settles
   * it (see `narrow`) — so `modIds.length > 1 && modId !== undefined` reads as "we chose, and here is
   * what we chose between". Undefined when nothing settles it.
   */
  readonly modId: string | undefined;
  /** The numbers read off the lines, in printed order. */
  readonly values: readonly number[];
  /**
   * Every tier each candidate in `modIds` allows, keyed by mod id.
   *
   * Per CANDIDATE rather than only for the pick, because a caller that asks the player "which of
   * these mods is it?" needs the tiers of whichever they answer — and where the mod is undecided
   * there is no pick to have computed them from. This is worked out for every candidate anyway;
   * reporting only the winner's used to throw the rest away and left an answered question with no
   * tier at all.
   */
  readonly tiersOf: ReadonlyMap<string, readonly string[]>;
  /** The tiers of `modId` — `tiersOf.get(modId)`, which is the common case. Empty when `modId` is. */
  readonly tierNames: readonly string[];
  /** The tier, when the values pin exactly one. Undefined when they do not — offer `tierNames`. */
  readonly tierName: string | undefined;
  /**
   * The same lines read as ONE MOD PER LINE, when that reading also resolves.
   *
   * Present only on a multi-line group, and it means the grouping itself is undecidable. `Bows`
   * carries a hybrid `#% increased Physical Damage` / `+# to Accuracy Rating` AND standalone mods for
   * each half, so a bow printing those two lines together is either one hybrid or two ordinary mods
   * and nothing in the text says which. Silently taking the hybrid is a guess wearing a fact's hat —
   * it changes which pool the craft plans against and how many affix slots the item is using.
   *
   * A Ctrl+Alt+C paste settles it: its braces say which lines belong together, so resolve those lines
   * as their own call and this never arises.
   */
  readonly alternative?: readonly ResolvedLine[];
}

/** A line no mod in the base's pools claims. Not necessarily an error — see the note above. */
export interface UnresolvedLine {
  readonly line: string;
}

export interface ResolveResult {
  readonly resolved: readonly ResolvedLine[];
  readonly unresolved: readonly UnresolvedLine[];
}

export interface ResolveOptions {
  /**
   * The item's level. A tier above it cannot have rolled, so this narrows candidates — and where two
   * tiers of one mod share a value it is the only thing that can. Omit and every tier is allowed.
   */
  readonly level?: number;
}

/**
 * How many printed lines a mod occupies. 142 of the shipped mods print as two (a few as three): a
 * hybrid defence roll is stored as one modifier and rendered as `+# to Armour` / `+# to Evasion
 * Rating` on separate lines, so a line-at-a-time reader sees two mods that do not exist and misses
 * the one that does.
 */
export function linesOf(mod: Mod): number {
  return mod.text === null ? 0 : mod.text.split('\n').length;
}

/**
 * A number as the game prints it, with the sign the template carries folded in.
 *
 * The sign belongs to the capture rather than staying a literal because a template's `+#` prints as
 * `-4` when the roll is negative, and a `\+` in the pattern would simply fail to match that line.
 */
const NUM = String.raw`([+-]?\d+(?:\.\d+)?)`;

/** `#`, or a number already baked into the template, with an optional sign; or a run of whitespace. */
const TOKEN = /[+-]?(?:#|\d+(?:\.\d+)?)|\s+/g;

const escapeRe = (s: string): string => s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

/**
 * Compile a mod's stored text into a matcher for the printed line.
 *
 * EVERY number in the template becomes a capture, not only the `#`s. Ten shipped texts have a roll
 * baked in as a literal — `Adds 1 to # Lightning Damage` carries ranges `[[1,3],[55,60]]`, so the
 * `1` is a real roll the text renders as fixed — and a pattern that insisted on a literal `1` would
 * refuse every item that rolled anything else. Templates whose numbers really are prose (`further
 * than 6m`) are unharmed: the line prints the same number back.
 *
 * Whitespace is matched as a run, so a two-line template matches lines joined by anything.
 */
function compile(text: string): RegExp {
  let out = '';
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(text); m !== null; m = TOKEN.exec(text)) {
    out += escapeRe(text.slice(last, m.index));
    out += /\s/.test(m[0]) ? String.raw`\s+` : NUM;
    last = m.index + m[0].length;
  }
  out += escapeRe(text.slice(last));
  return new RegExp(`^${out}$`, 'i');
}

/**
 * Is a printed value inside a tier's range?
 *
 * The magnitude, deliberately. Five shipped texts read `#% reduced Flask Charges used` and store the
 * range as `[-13,-11]`: the wording already carries the sign, so the game prints `12` and the data
 * keeps `-12`. Comparing raw would reject every roll of them.
 */
function within(range: readonly number[], v: number): boolean {
  const lo = Math.min(...range);
  const hi = Math.max(...range);
  const x = hi <= 0 && lo < 0 ? -v : v;
  return x >= lo && x <= hi;
}

/**
 * Could this tier have produced these values?
 *
 * A tier is ruled OUT only by evidence. Where the counts disagree the roll says nothing about the
 * tier and the tier stays a candidate: `Loads an additional bolt` prints no number at all yet stores
 * a range per tier, so demanding a match would rule out every tier of it and claim the mod could not
 * exist — which is the opposite of what an unnumbered line means.
 */
const fitsTier = (t: Tier, values: readonly number[]): boolean =>
  t.ranges.length !== values.length || t.ranges.every((r, i) => within(r, values[i]!));

/**
 * Which tiers of `mod` could have produced `values`.
 *
 * A single-tier mod returns that tier whatever the values say — there is nothing to choose between,
 * and 144 shipped mods (flat desecrated and perfect-essence lines) carry no ranges at all to check.
 */
function tiersFitting(mod: Mod, values: readonly number[], level: number | undefined): readonly Tier[] {
  const rollable = level === undefined ? mod.tiers : mod.tiers.filter((t) => t.ilvl <= level);
  if (rollable.length <= 1) return rollable;
  return rollable.filter((t) => fitsTier(t, values));
}

/** Every mod id in a base's pools, in pool order, without repeats. */
function poolMods(base: ItemBase): readonly string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const pool of [base.pools.normal, base.pools.desecrated, base.pools.essence]) {
    for (const id of [...pool.prefixes, ...pool.suffixes]) {
      if (!seen.has(id)) { seen.add(id); ids.push(id); }
    }
  }
  return ids;
}

interface Candidate {
  readonly mod: Mod;
  readonly re: RegExp;
  readonly lines: number;
}

/** One attempt at a window of lines: the mods that matched it, and what they say the tier is. */
interface Attempt {
  readonly modIds: string[];
  readonly values: readonly number[];
  readonly tiers: (readonly Tier[])[];
}

function attempt(cands: readonly Candidate[], window: string, level: number | undefined): Attempt | undefined {
  const modIds: string[] = [];
  const tiers: (readonly Tier[])[] = [];
  let values: readonly number[] = [];
  for (const c of cands) {
    const m = c.re.exec(window);
    if (!m) continue;
    const vs = m.slice(1).map(Number);
    const fits = tiersFitting(c.mod, vs, level);
    modIds.push(c.mod.id);
    tiers.push(fits);
    values = vs;
  }
  if (modIds.length === 0) return undefined;
  return { modIds, values, tiers };
}

/**
 * Pick one of several candidates, or leave it open.
 *
 * The only preference applied is `normal` over anything else, and only among candidates the roll
 * already permits. Which currency placed a mod is not recorded on the item, so a normal roll and its
 * essence twin can print identically at a value both allow — and when they do, the normal one is what
 * an exalt would have added and what a recraft has to beat. Everything else stays undecided: two
 * normal mods with the same text (`increased Rarity of Items found`, prefix and suffix) are a
 * question only the player can answer, and answering it here would be a guess wearing a fact's hat.
 */
function pick(modIds: readonly string[], byId: (id: string) => Mod): string | undefined {
  if (modIds.length === 1) return modIds[0];
  const normal = modIds.filter((id) => byId(id).source === 'normal');
  return normal.length === 1 ? normal[0] : undefined;
}

/** Resolve exactly this window, or nothing. Shared by the main scan and by the split-reading check
 *  that decides whether a multi-line grouping was a real choice. */
function one(
  cands: readonly Candidate[], window: readonly string[], level: number | undefined,
  byId: (id: string) => Mod,
): ResolvedLine | undefined {
  const a = attempt(cands.filter((c) => c.lines === window.length), window.join('\n'), level);
  if (!a) return undefined;
  // The roll is EVIDENCE, not a preference: a candidate whose ranges cannot produce these values did
  // not produce them. Only drop them when something is left, so an off-range roll — a legacy item, or
  // data drifting from the game — still resolves rather than vanishing.
  const fitting = a.modIds.filter((_, i) => a.tiers[i]!.length > 0);
  const modIds = fitting.length > 0 ? fitting : a.modIds;
  const modId = pick(modIds, byId);
  const tiersOf = new Map(modIds.map((id) => [id, a.tiers[a.modIds.indexOf(id)]!.map((t) => t.name)]));
  // Derived, never computed a second way, so the two can never disagree about one mod's tiers.
  const tierNames = (modId === undefined ? undefined : tiersOf.get(modId)) ?? [];
  return {
    lines: [...window], modIds, modId, values: a.values, tiersOf, tierNames,
    tierName: tierNames.length === 1 ? tierNames[0]! : undefined,
  };
}

/** The longest template in the shipped data is three lines; try the longest window first, so a
 *  hybrid roll is read as the one mod it is rather than as its first line plus a stray. */
const MAX_WINDOW = 3;

/**
 * Read an item's printed modifier lines against one base's pools.
 *
 * `lines` are the rendered lines in printed order, one per line — a hybrid modifier arrives as the
 * two lines the game prints and is rejoined here. Blank lines are ignored.
 */
export function resolveMods(
  data: PatchData, base: ItemBase, lines: readonly string[], opts: ResolveOptions = {},
): ResolveResult {
  const byId = (id: string) => resolveMod(data, id);
  const cands: Candidate[] = poolMods(base).map((id) => {
    const mod = byId(id);
    return { mod, re: compile(mod.text ?? ''), lines: linesOf(mod) };
  });
  const rows = lines.map((l) => l.trim()).filter((l) => l.length > 0);

  const resolved: ResolvedLine[] = [];
  const unresolved: UnresolvedLine[] = [];
  for (let i = 0; i < rows.length;) {
    let taken = 0;
    // Longest window first, so a hybrid roll is read as the one mod it is rather than as its first
    // line plus a stray.
    for (let n = Math.min(MAX_WINDOW, rows.length - i); n >= 1 && taken === 0; n--) {
      const row = one(cands, rows.slice(i, i + n), opts.level, byId);
      if (!row) continue;
      // Does the split reading work too? Only then is the grouping a real question, and the caller
      // has to be told rather than handed the longer match as though it were the only one.
      const split = n > 1 ? row.lines.map((l) => one(cands, [l], opts.level, byId)) : [];
      const alternative = split.length > 1 && split.every((x) => x !== undefined) ? split : undefined;
      resolved.push(alternative ? { ...row, alternative } : row);
      taken = n;
    }
    if (taken === 0) { unresolved.push({ line: rows[i]! }); taken = 1; }
    i += taken;
  }
  return { resolved, unresolved };
}
