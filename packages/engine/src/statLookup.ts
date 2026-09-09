import type { ItemBase, Mod, PatchData, Tier } from './types.ts';
import { resolveMod } from './pool.ts';
import { tierFit } from './tierFit.ts';

/**
 * "Which mod is this?" — answered from STAT KEYS rather than from printed text.
 *
 * A profile API serves an item's modifiers structurally: each one carries the game's own stat
 * identifiers and their rolled values (`{ "additional_intelligence": 35 }`). That is a far better key
 * than the rendered English `resolveMods` has to work from, and it sidesteps every hard case that one
 * has:
 *
 *   - no markup to strip, and nothing language-dependent;
 *   - a modifier printing across two lines is already one entry, so there is no window to guess;
 *   - and, decisively, TWO MODIFIERS THAT PRINT AS ONE LINE arrive as two entries. The game sums
 *     same-stat modifiers on screen — a staff carrying 71% and 62% "Gain as Extra Fire" displays a
 *     single `133%` — and no reader of the text can undo that. Here they never merged.
 *
 * Measured across the shipped data: a mod's stat SET identifies it uniquely within a base except in
 * 8 cases over 52 bases, all of them the `increased Rarity of Items found` prefix/suffix pair that is
 * equally ambiguous from text. So this is not merely tidier, it is more determined.
 *
 * IT NEEDS THE FULL MODS FILE, which is the one real constraint. `tiers[].stats` is deliberately
 * stripped from the asset the browser downloads (`shipMods.ts` projects onto exactly what `Mod`
 * declares), so a `PatchData` built in the browser carries no stats and `statIndex` will find
 * nothing. That is fine for the job this exists for — reading profiles in a periodic task, the way
 * prices are refreshed — and it is why this must not be wired into a browser path without shipping
 * `stats` first, which was measured and deliberately declined.
 */

/** A tier as the FILE carries it. `stats` is absent from the shipped `Tier` — see the note above. */
type TierWithStats = Tier & { readonly stats?: readonly string[] };

/** One modifier as a profile API reports it: stat identifiers to rolled values. */
export interface StatMod {
  readonly stats: Readonly<Record<string, number>>;
  /**
   * The source's own identifier for the modifier, if it has one.
   *
   * A TIE-BREAKER, never a key. The two schemes do not agree — measured on a real character, 19 of
   * 43 identifiers matched ours and 24 did not (`FireResist7` against our `FireResistance`) — so
   * joining on it would be worse than joining on stats. But where the STATS cannot separate two
   * candidates it is decisive, because the disagreements are in spelling rather than in meaning:
   * `ItemFoundRarityIncreasePrefix3` names the prefix outright, and that is precisely the pair no
   * amount of reading the roll can tell apart. It settled 5 of 5 such cases and can settle nothing
   * else, since it is consulted only when the stats have already left a choice.
   */
  readonly id?: string;
}

export interface StatMatch {
  /** Every mod in the base's pools carrying exactly these stats, in pool order. */
  readonly modIds: readonly string[];
  /** The single mod, when one claims the stat set. */
  readonly modId: string | undefined;
  /** The rolled values, ordered as the tier's `stats` are — which is the order `ranges` uses. */
  readonly values: readonly number[];
  readonly tierNames: readonly string[];
  readonly tierName: string | undefined;
  /** The roll is above everything the mod can produce. See `tierFit`. */
  readonly sanctified: boolean;
}

/** The stat identifiers a mod rolls, in the order its ranges use them. Empty when the file's
 *  `stats` are absent — which is what happens against a browser-built snapshot. */
export function statsOf(mod: Mod): readonly string[] {
  for (const t of mod.tiers as readonly TierWithStats[]) {
    if (t.stats && t.stats.length > 0) return t.stats;
  }
  return [];
}

const key = (stats: readonly string[]): string => [...stats].sort().join('+');

/**
 * Index one base's pools by stat set.
 *
 * Per BASE, for the same reason the text index is: `additional_intelligence` is 23 different mods
 * across the data and exactly one on any given base.
 */
export function statIndex(data: PatchData, base: ItemBase): ReadonlyMap<string, readonly string[]> {
  const idx = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const pool of [base.pools.normal, base.pools.desecrated, base.pools.essence]) {
    for (const id of [...pool.prefixes, ...pool.suffixes]) {
      if (seen.has(id)) continue;
      seen.add(id);
      const k = key(statsOf(resolveMod(data, id)));
      if (k === '') continue;
      const list = idx.get(k);
      if (list) list.push(id);
      else idx.set(k, [id]);
    }
  }
  return idx;
}

/**
 * Resolve one modifier from its stats.
 *
 * DUPLICATES ARE THE CALLER'S PROBLEM ON PURPOSE. Resolve a list and two entries can legitimately
 * come back as the same mod id — a Passion of Aldur converts one modifier's element into another's,
 * so an item really can carry two of what this data calls one mod, in one family. That is a true
 * reading of a real item and this will not hide it. It is also not something `ItemState` can hold,
 * since family exclusion is an invariant the whole engine rests on, so a caller building one must
 * check (see `familyConflicts`) rather than let the second silently win.
 */
export function resolveByStats(
  data: PatchData, index: ReadonlyMap<string, readonly string[]>, mod: StatMod, level?: number,
): StatMatch {
  const names = Object.keys(mod.stats);
  const modIds = index.get(key(names)) ?? [];
  const modId = modIds.length === 1 ? modIds[0] : breakTie(modIds, mod.id);
  if (modId === undefined) {
    return { modIds, modId, values: [], tierNames: [], tierName: undefined, sanctified: false };
  }
  const resolved = resolveMod(data, modId);
  // Ordered by the mod's OWN stat order, not by the object's key order, because that is the order
  // `tiers[].ranges` is written in and a swapped pair would compare against the wrong range.
  const values = statsOf(resolved).map((s) => mod.stats[s] ?? 0);
  const fit = tierFit(resolved, values, level);
  return {
    modIds,
    modId,
    values,
    tierNames: fit.names,
    tierName: fit.names.length === 1 ? fit.names[0]! : undefined,
    sanctified: fit.sanctified,
  };
}

/**
 * Mod ids that appear more than once, or that share an exclusion family with another.
 *
 * An item the game allows but this engine cannot represent: two modifiers of one family. It is not
 * hypothetical — a Passion of Aldur produces it, and the first real character read this way carried
 * exactly one such item. Naming them lets a caller say so instead of quietly dropping one and
 * planning against an item the player does not have.
 */
export function familyConflicts(data: PatchData, modIds: readonly string[]): readonly string[] {
  const byFamily = new Map<string, string[]>();
  for (const id of modIds) {
    for (const f of familiesOfId(data, id)) {
      const list = byFamily.get(f);
      if (list) list.push(id);
      else byFamily.set(f, [id]);
    }
  }
  const out = new Set<string>();
  for (const ids of byFamily.values()) if (ids.length > 1) for (const id of ids) out.add(id);
  return [...out];
}

/**
 * The source's id, consulted ONLY among candidates the stats left tied — the call site reaches this
 * just when there is more than one, so the tie is a precondition rather than something re-checked
 * here. Trailing digits are the tier number in both schemes and are dropped.
 *
 * The uniqueness check on `hits` is UNREACHABLE with today's data, since no two mods on one base
 * share an id, and it is kept because taking the first of several would be a guess dressed as an
 * answer. No test asserts it; a test would only be asserting that the data has not changed.
 */
function breakTie(modIds: readonly string[], sourceId: string | undefined): string | undefined {
  if (sourceId === undefined) return undefined;
  const bare = sourceId.replace(/\d+$/, '');
  const hits = modIds.filter((id) => id.split('/').at(-1) === bare);
  return hits.length === 1 ? hits[0] : undefined;
}

const familiesOfId = (data: PatchData, id: string): readonly string[] => {
  const m = resolveMod(data, id);
  return m.families && m.families.length > 0 ? m.families : m.family ? [m.family] : [];
};
