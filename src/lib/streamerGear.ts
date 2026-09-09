import type { PatchData } from '../../packages/engine/src/types.ts';
import { familiesOf } from '../../packages/engine/src/pool.ts';
import type { ImportedItem, ItemModInput } from './engineTypes.ts';
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

export interface StreamerCharacter {
  readonly profile: string;
  readonly character: string;
  readonly className: string;
  readonly level: number;
  readonly league: string;
  readonly items: readonly StreamerItem[];
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
  /** What "Use this item" would hand the tab. */
  readonly item: ImportedItem;
  /**
   * Why each modifier the character holds is NOT on that item — one finished sentence each.
   *
   * Empty is the claim that the import is exact. Nothing else in the panel is allowed to say so.
   */
  readonly omitted: readonly string[];
  /** Set when the item cannot be crafted further at all, so there is nothing to import. */
  readonly blocked?: string;
}

/** Same cap the game applies, and the reason over-full sides are reported rather than silently cut. */
const SIDE_CAP = 3;

/**
 * Turn one gear entry into the Item tab's shape, and account for everything that did not fit.
 *
 * Four things can drop a modifier, and each gets its own sentence because the fix differs:
 *   - the patch data has no such mod id (the gear file and the app disagree — a refresh is due);
 *   - a second modifier of one exclusion family, which the engine cannot represent at all;
 *   - more than three of a side;
 *   - the job could not read it in the first place (`unresolved`).
 */
export function readGear(data: PatchData, it: StreamerItem): GearReading {
  const prefixes: ItemModInput[] = [];
  const suffixes: ItemModInput[] = [];
  const omitted: string[] = [];
  const seen = new Set<string>();

  for (const m of it.mods) {
    const mod = data.mods.get(m.modId);
    if (!mod) {
      omitted.push(`${m.modId} — this app’s ${data.patch} data has no such modifier, so the gear file is out of date.`);
      continue;
    }
    const label = mod.text ?? m.modId;

    // Family exclusion is the invariant every probability rests on: an ItemState cannot hold two of
    // one family. The game CAN — a Passion of Aldur converts a second "gain as extra" into a sibling
    // of the first — so this is a limit of the planner, not of the game, and it says which.
    const families = familiesOf(mod);
    const clash = families.find((f) => seen.has(f));
    if (clash !== undefined) {
      omitted.push(
        `${label} — the item holds two modifiers of the ${clash} family. The game allows it (a Passion of Aldur converts one into a sibling of the other); this planner cannot represent it, so the second is left off.`,
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

  for (const u of it.unresolved) {
    omitted.push(`${u} — the gear reader could not match this line to a craftable modifier.`);
  }

  return {
    item: { baseId: it.baseId, level: it.level, rarity: 'rare', prefixes, suffixes },
    omitted,
    // A Corrupted item takes no further currency, so importing it would offer a craft that cannot be
    // performed. Reported rather than hidden: the gear is still worth looking at.
    ...(it.corrupted ? { blocked: 'Corrupted — no currency can modify it further.' } : {}),
  };
}

/** How many modifiers a reading actually placed. */
export const placedCount = (r: GearReading): number => r.item.prefixes.length + r.item.suffixes.length;
