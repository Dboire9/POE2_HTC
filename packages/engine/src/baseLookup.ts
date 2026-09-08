import type { PatchData } from './types.ts';

/**
 * "Which row of the picker is this item?" — base name -> base id.
 *
 * Reading an item a player pasted, or one fetched from a profile, gives you the base's printed name
 * and nothing else: "Knightly Mitts", "Gold Ring", "Chiming Staff". The engine is organised by POOL
 * instead — `Gloves_str`, `Rings`, `Staves_fire` — because that is what decides which mods can roll.
 * This maps one to the other, from `ItemBase.bases` in the shipped data.
 *
 * AMBIGUITY IS REAL AND IS REPORTED, not hidden. A wand or staff base name appears under both its
 * unrestricted row and its spell-element row when the element split cannot tell them apart, and a
 * caller that silently took the first would quietly plan against the wrong mod pool — the pool being
 * the entire reason these rows are separate. So the result names every candidate and lets the caller
 * ask the player, which is the only honest answer when the item itself does not say.
 */

export interface BaseMatch {
  /** Every base id whose `bases` list contains this name, in the data's order. */
  readonly ids: readonly string[];
  /** The single id, when exactly one row claims the name. */
  readonly id: string | undefined;
}

/** Names differ only in case and spacing across sources; compare on a squashed form. */
const key = (name: string): string => name.toLowerCase().replace(/\s+/g, ' ').trim();

/** Build the index once per patch — a caller resolving a whole character does 10+ lookups. */
export function baseNameIndex(data: PatchData): ReadonlyMap<string, readonly string[]> {
  const idx = new Map<string, string[]>();
  for (const base of data.bases.values()) {
    for (const name of base.bases ?? []) {
      const k = key(name);
      const list = idx.get(k);
      if (list) list.push(base.id);
      else idx.set(k, [base.id]);
    }
  }
  return idx;
}

/**
 * Find the base INSIDE a printed name line, which is what a Magic item forces.
 *
 * A Rare or Unique prints its base on a line of its own, but a Magic item wraps it in the words its
 * affixes contribute — "Fine Bow of the Wind" — so there is nothing to look up until the base has
 * been picked out of the sentence. The longest name that appears as whole words wins, which is what
 * keeps "Expert Bow" from being read as "Bow" on a base that is both.
 *
 * One function covers every rarity, and that is deliberate rather than lucky: on a Rare the last name
 * line IS the base name, so searching it finds the whole line and the answer is the same as a direct
 * lookup. Callers do not have to branch on rarity to find a base.
 */
export function findBaseInName(
  index: ReadonlyMap<string, readonly string[]>, name: string,
): BaseMatch {
  const hay = ` ${key(name)} `;
  let best: string | undefined;
  for (const candidate of index.keys()) {
    if (!hay.includes(` ${candidate} `)) continue;
    if (best === undefined || candidate.length > best.length) best = candidate;
  }
  return best === undefined ? { ids: [], id: undefined } : findBase(index, best);
}

/** Resolve one printed base name. `id` is set only when the answer is unambiguous. */
export function findBase(
  index: ReadonlyMap<string, readonly string[]>, name: string,
): BaseMatch {
  const ids = index.get(key(name)) ?? [];
  return { ids, id: ids.length === 1 ? ids[0] : undefined };
}
