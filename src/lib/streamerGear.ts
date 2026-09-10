import type { PatchData } from '../../packages/engine/src/types.ts';
import { familiesOf } from '../../packages/engine/src/pool.ts';
import { runeRoute } from '../../packages/engine/src/runeConvert.ts';
import type { CraftGoal, ImportedItem, ItemModInput, TargetInput } from './engineTypes.ts';
// The shipped answer, not the source: `tools/streamers/fetch.mjs` did the resolving in Node, because
// it needs `tiers[].stats` and `shipMods.ts` strips that column from the asset a browser downloads.
// Fetched by URL rather than imported as a value, exactly as `loadEngine` fetches the patch — so the
// bytes are a separate request nobody pays for until they open the panel.
import streamersUrl from '../../data/streamers/0.5.0.json?url';

/**
 * A streamer's real gear, offered as a starting point for a craft.
 *
 * This is the READING half — no React — for the same reason `pasteItem.ts` is: what can and cannot be
 * put on an item is a rule about items, and it is worth testing without a DOM.
 *
 * ITS JOB IS TO SAY WHAT IT LEFT OUT. An imported item that quietly differs from the one the streamer
 * holds is worse than no import at all: every probability and every cost the app then prints is
 * answering a question nobody asked, and there is nothing on screen to say so. So each omission is
 * carried back as a sentence, and the panel prints all of them.
 */

export interface StreamerMod {
  readonly modId: string;
  /** 1-based from best, as the picker counts. */
  readonly tierDisplay: number;
  readonly fractured: boolean;
  readonly desecrated: boolean;
  /** Rolled above anything the modifier can reach; the job already read it as the best tier. */
  readonly sanctified: boolean;
}

export interface StreamerItem {
  readonly slot: string;
  readonly name: string;
  readonly baseName: string;
  readonly baseId: string;
  readonly level: number;
  readonly mods: readonly StreamerMod[];
  /** Modifiers the job could not place, already phrased ("desecrated: …"). */
  readonly unresolved: readonly string[];
  /** Mod ids sharing an exclusion family — see `familyConflicts`. */
  readonly familyConflict: readonly string[];
  readonly corrupted: boolean;
}

/** Gear the character wears that the tab does not show, and why. */
export interface StreamerSkip {
  readonly name: string;
  /** Equipment slot, e.g. `Boots`. */
  readonly slot: string;
  /** Only `Rare` and `Unique` are written — the two a player would notice missing. */
  readonly rarity: string;
  readonly reason: string;
}

export interface StreamerCharacter {
  readonly profile: string;
  readonly character: string;
  readonly className: string;
  readonly level: number;
  readonly league: string;
  readonly items: readonly StreamerItem[];
  /**
   * Worn but not shown. Optional because gear files written before 2026-09-10 — the frozen test
   * snapshot among them — predate it; an absent list means "not recorded", not "nothing skipped".
   */
  readonly skipped?: readonly StreamerSkip[];
}

export interface StreamerFile {
  readonly patch: string;
  readonly updated: string;
  readonly source: string;
  readonly characters: readonly StreamerCharacter[];
}

let cache: Promise<StreamerFile> | null = null;

/** Fetch the shipped gear file once; later calls reuse the same promise. */
export function loadStreamers(): Promise<StreamerFile> {
  // `Response.json()` is `any`. Named here, at the boundary it crosses, as `loadEngine` names its own.
  cache ??= fetch(streamersUrl).then((r) => r.json() as Promise<StreamerFile>);
  return cache;
}

export interface GearReading {
  /**
   * What the character actually HOLDS, as far as this planner can represent it.
   *
   * Not always the whole item: an `ItemState` cannot carry two modifiers of one exclusion family, and
   * a real item can. What that costs is reported in `omitted`, never hidden.
   */
  readonly item: ImportedItem;
  /**
   * What to AIM AT to end up with that item — which is NOT always the same list.
   *
   * The Aldur case is why. A staff carrying two `Gain as Extra Fire` was not crafted by rolling the
   * same modifier twice, which no item allows; it was crafted by rolling fire AND cold — different
   * families, perfectly legal together — and then socketing a Passion of Aldur, which converts the
   * cold one to fire. So the GOAL is a six-modifier cross-family item plus a rune, and quoting the
   * five-modifier craft instead would answer a question nobody asked, about an item nobody owns.
   *
   * A TARGET LIST rather than an item, because a slot may name alternatives: the staff's second fire
   * copy is "Extra Cold or Extra Lightning", whichever lands, since the rune converts either. Naming Cold
   * alone threw away every roll that finished the craft with Lightning.
   *
   * `goalOf(item)` whenever no rune route applies, which is every other item measured.
   */
  readonly goal: CraftGoal;
  /** The rune the goal ends on, when `goal` differs from `item`. */
  readonly rune?: {
    readonly rune: string;
    readonly element: string;
    readonly caveat: string;
    readonly priceKey: string;
    /** What the goal rolls instead, one entry per copy in the goal's own words, alternatives as
     *  "either … or …" — for the sentence the panel prints. */
    readonly converts: readonly string[];
  };
  /**
   * Why each modifier the character holds is NOT on `item` — one finished sentence each.
   *
   * Empty is the claim that the import is exact. Nothing else in the panel is allowed to say so.
   */
  readonly omitted: readonly string[];
  /** Set when the item cannot be crafted further at all, so there is nothing to import. */
  readonly blocked?: string;
}

/** Same cap the game applies, and the reason over-full sides are reported rather than silently cut. */
const SIDE_CAP = 3;

interface Placed {
  readonly prefixes: ItemModInput[];
  readonly suffixes: ItemModInput[];
  readonly omitted: string[];
}

/**
 * Lay modifiers onto an item, applying the two rules an item obeys, and say what would not fit.
 *
 * One walk, used twice — once for what the character holds and once for the goal — so the held item
 * and the craft that produces it can never disagree about what is legal.
 */
function place(data: PatchData, mods: readonly { modId: string; tierDisplay: number; fractured?: boolean; desecrated?: boolean }[]): Placed {
  const prefixes: ItemModInput[] = [];
  const suffixes: ItemModInput[] = [];
  const omitted: string[] = [];
  const seen = new Set<string>();

  for (const m of mods) {
    const mod = data.mods.get(m.modId);
    if (!mod) {
      omitted.push(`${m.modId} — this app’s ${data.patch} data has no such modifier, so the gear file is out of date.`);
      continue;
    }
    const label = mod.text ?? m.modId;

    // Family exclusion is the invariant every probability rests on: an ItemState cannot hold two of
    // one family. The game CAN, via a rune conversion — which is why the GOAL substitutes a sibling
    // rather than relying on this branch. Reaching here means no route was available.
    const families = familiesOf(mod);
    const clash = families.find((f) => seen.has(f));
    if (clash !== undefined) {
      omitted.push(
        `${label} — the item holds two modifiers of the ${clash} family. The game allows it; this planner cannot represent an item that does, so the second is left off here.`,
      );
      continue;
    }

    const into = mod.type === 'prefix' ? prefixes : suffixes;
    if (into.length >= SIDE_CAP) {
      omitted.push(`${label} — that is a ${SIDE_CAP + 1}th ${mod.type}, and an item holds ${SIDE_CAP}.`);
      continue;
    }
    for (const f of families) seen.add(f);
    into.push({
      modId: m.modId,
      tierDisplay: m.tierDisplay,
      ...(m.fractured ? { fractured: true } : {}),
      ...(m.desecrated ? { desecrated: true } : {}),
    });
  }
  return { prefixes, suffixes, omitted };
}

/**
 * An item read as a GOAL rather than as a start: every modifier becomes a target.
 *
 * The item has already obeyed both rules a target list must (three a side, one per exclusion family),
 * so this is a projection and not a second place those can be got wrong. The FRACTURED flag is
 * deliberately dropped: on a target list it would claim the base you buy already has it — a claim about
 * a base the player has not got. Planning to roll it is the conservative reading, and what "from
 * scratch" means.
 */
export const goalOf = (it: ImportedItem): CraftGoal => ({
  baseId: it.baseId,
  level: it.level,
  targets: [...it.prefixes, ...it.suffixes].map((m) => ({ modId: m.modId, tierDisplay: m.tierDisplay })),
});

/**
 * Turn one gear entry into the Item tab's shape, and account for everything that did not fit.
 *
 * Four things can drop a modifier from the HELD item, and each gets its own sentence because the fix
 * differs: the patch data has no such id (the two files are out of step); a second modifier of one
 * exclusion family; more than three of a side; or the job could not read the line at all.
 *
 * The GOAL is built separately, and a family duplicate that a rune explains is substituted there
 * rather than dropped — see `GearReading.goal`.
 */
export function readGear(data: PatchData, it: StreamerItem): GearReading {
  const held = place(data, it.mods);
  const omitted = [...held.omitted];
  for (const u of it.unresolved) {
    omitted.push(`${u} — the gear reader could not match this line to a craftable modifier.`);
  }

  const item: ImportedItem = { baseId: it.baseId, level: it.level, rarity: 'rare', ...held };
  const blocked = it.corrupted
    // A Corrupted item takes no further currency, so importing it would offer a craft that cannot be
    // performed. Reported rather than hidden: the gear is still worth looking at.
    ? { blocked: 'Corrupted — no currency can modify it further.' }
    : {};

  // ── The goal: the same item, reached the way it was really made ─────────────
  const base = data.bases.get(it.baseId);
  const copies = new Map<string, number>();
  for (const m of it.mods) copies.set(m.modId, (copies.get(m.modId) ?? 0) + 1);

  const substitute = new Map<string, readonly (readonly string[])[]>();
  const textOf = (id: string): string => data.mods.get(id)?.text ?? id;
  let rune: GearReading['rune'];
  if (base) {
    for (const [modId, n] of copies) {
      if (n < 2) continue;
      const route = runeRoute(data, base, modId, n);
      if (!route) continue;
      substitute.set(modId, route.slots);
      rune = {
        rune: route.rune,
        element: route.element,
        caveat: route.caveat,
        priceKey: route.priceKey,
        converts: route.slots.map((s) => (s.length > 1 ? `either ${s.map(textOf).join(' or ')}` : textOf(s[0]!))),
      };
    }
  }

  if (substitute.size === 0) return { item, goal: goalOf(item), omitted, ...blocked };

  // Each copy takes the next SLOT of its route: the wanted element keeps its own tier, and each sibling
  // slot takes the tier of the copy it stands in for. A slot's first candidate stands for it while the
  // goal is laid out, so the one walk that decides legality decides it here too.
  const used = new Map<string, number>();
  const candidatesOf = new Map<string, readonly string[]>();
  const goalMods = it.mods.map((m) => {
    const slots = substitute.get(m.modId);
    if (!slots) return m;
    const k = used.get(m.modId) ?? 0;
    used.set(m.modId, k + 1);
    const slot = slots[k] ?? [m.modId];
    candidatesOf.set(slot[0]!, slot);
    return { ...m, modId: slot[0]! };
  });
  const goalPlaced = place(data, goalMods);
  // Another candidate joins the slot only if the item still holds together with it standing there.
  const fits = (from: string, to: string): boolean =>
    place(data, goalMods.map((m) => (m.modId === from ? { ...m, modId: to } : m))).omitted.length
      <= goalPlaced.omitted.length;
  const targets: TargetInput[] = [];
  let nextSlot = 0;
  for (const m of [...goalPlaced.prefixes, ...goalPlaced.suffixes]) {
    const candidates = (candidatesOf.get(m.modId) ?? [m.modId]).filter((id) => id === m.modId || fits(m.modId, id));
    if (candidates.length === 1) { targets.push({ modId: m.modId, tierDisplay: m.tierDisplay }); continue; }
    const slot = nextSlot++;
    for (const id of candidates) targets.push({ modId: id, tierDisplay: m.tierDisplay, slot });
  }
  const goal: CraftGoal = { baseId: it.baseId, level: it.level, targets };
  return { item, goal, omitted, ...(rune ? { rune } : {}), ...blocked };
}

/** How many modifiers a reading places on the item the character holds. */
export const placedCount = (r: GearReading): number => r.item.prefixes.length + r.item.suffixes.length;

/** How many the GOAL aims at — one per SLOT, since alternatives fill one place on the item. Larger than
 *  `placedCount` exactly when a rune route applies. */
export const goalCount = (r: GearReading): number =>
  new Set(r.goal.targets.map((t, i) => (t.slot === undefined ? `solo:${i}` : `slot:${t.slot}`))).size;
