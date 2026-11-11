// Where a real item sits in a solved plan — so Craft along can re-sync from a pasted item.
//
// The solve placed its own start with `classifyStart` and `encoderFor`; the replay places every item it
// plays the same way. This places one more, on the main thread, from the route table alone: the table
// carries the inputs those two need (`LocateInfo`), so the key found here is the key the solve wrote for
// that item, by construction rather than by a second reading of the rules.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { RouteTable } from './markovRoute.ts';
import type { McTarget, StateKey } from './markovState.ts';
import { bit, classifyStart } from './markovState.ts';
import { encoderFor } from './markovSymmetry.ts';

export type Located =
  | { readonly ok: true; readonly key: StateKey; readonly index: number; readonly level?: number }
  | { readonly ok: false; readonly reason: string };

/**
 * The state of `table` that `item` is in, or why it is in none.
 *
 * Refused by name, never guessed: another base; fractured mods other than the ones this plan was solved
 * with (a different craft — its slots and pools differ); and an item no state of the plan describes
 * (a rarity the plan never holds, or more mods than it has room for). A different item level is not a
 * refusal — the mods decide the state — but `level` comes back so the caller can say so.
 */
export function keyOfItem(table: RouteTable, data: PatchData, item: ItemState): Located {
  const at = table.locate;
  // Not named: a base's `name` is every base type it covers ("Acrid Wand, Attuned Wand, …"), not a label.
  if (item.base.id !== at.baseId) return { ok: false, reason: 'That item is a different kind of base from the one this plan is for.' };

  // The mods each position can be filled by, exactly as the solve indexed them.
  const list: McTarget[] = table.positions.map((ids, i) => {
    const mods = ids.map((id, j) => {
      const mod = data.mods.get(id);
      if (!mod) throw new Error(`unknown mod in the plan: ${id}`);
      return { mod, minIndex: at.floors[i]![j] ?? 0 };
    });
    const obstacle = ((table.obstacles.prefix | table.obstacles.suffix) & bit(i)) !== 0;
    return { mods, type: mods[0]!.mod.type, fractured: at.fractured[i] === true, ...(obstacle ? { obstacle: true as const } : {}) };
  });
  const idxOf = new Map<string, number>();
  list.forEach((t, i) => { for (const m of t.mods) idxOf.set(m.mod.id, i); });

  // A fractured mod no position names is part of the BASE for this craft (TODO 28): the plan was solved
  // with one prefix or suffix fewer and that family gone. An item locked differently is another craft.
  const lockedHere = [...item.prefixes, ...item.suffixes]
    .filter((p) => p.fractured === true && !idxOf.has(p.modId)).map((p) => p.modId).sort();
  if (lockedHere.join('|') !== at.locked.join('|')) {
    return {
      ok: false,
      reason: lockedHere.length > at.locked.length || at.locked.length === 0
        ? 'That item has a fractured modifier this plan was not solved with, so its slots and odds differ — plan it on the Item tab instead.'
        : 'That item does not have the fractured modifier this plan was solved with.',
    };
  }

  const s = classifyStart(data, item, list, idxOf, new Map(at.blocks));
  const key = encoderFor(at.classes.map((c) => [...c]))(s.present, s.blocked, s.jp, s.js, s.flagged, s.rarity);
  const index = table.keys.indexOf(key);
  if (index < 0) {
    const rarityCode = key.slice(key.lastIndexOf(':') + 1);
    const holdsRarity = table.keys.some((k) => k.endsWith(`:${rarityCode}`));
    return {
      ok: false,
      reason: holdsRarity
        ? 'This plan never reaches an item like that one — it holds more modifiers than the plan has room for.'
        : `This plan never holds a ${item.rarity === 'magic' ? 'Magic' : item.rarity === 'rare' ? 'Rare' : 'Normal'} item, so it cannot pick up from that one.`,
    };
  }
  return { ok: true, key, index, ...(item.level !== at.level ? { level: item.level } : {}) };
}
