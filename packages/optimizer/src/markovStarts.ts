// Every clean item a craft could START from, priced out of the lattice the solve already settled.
//
// A state "holding exactly these targets, nothing else on it" is one cell of the lattice, so "what
// does finishing cost if I buy one of these" is a table lookup rather than a solve per candidate. What
// it means depends on the solve it is read from, and each tab reads its own:
//   • the Item tab solves with no restart — you keep the item you have — and its "What to look for
//     when you buy one" table (startingItem.ts `buyAdvice`) reads the Rare rows;
//   • the Lab solves from white WITH restart, so a row there is what finishing costs from an item you
//     buy instead of a white base, when the policy may still bin it and start over (the player's
//     choice, 2026-09-11 — the price paid is spent either way).
//
// EVERY ROW ASSUMES THE REST OF THE ITEM IS EMPTY (no junk, nothing below tier). A real listing
// usually carries other mods, which have to come off first, so it costs more than this to finish.
// The UI has to say so.

import type { McRarity, McTarget, StateEncoder, StateKey } from './markovState.ts';
import { FLAG_NONE, flagTarget, has, popcount, representative } from './markovState.ts';

/**
 * One candidate STARTING item: some of the targets already on it, and what finishing then costs.
 *
 * `present` holds one entry per filled SLOT, naming the mod ids that could be filling it — one id for
 * an ordinary slot, several when the slot's alternatives are interchangeable ("Cold or Lightning").
 * Its length is the number of target modifiers on the item.
 */
export interface Holding {
  readonly present: readonly (readonly string[])[];
  /** Expected cost to finish from a clean item holding exactly these. Carries the result's `bound`. */
  readonly cost: number;
  /** A Magic and a Rare holding the same mods finish differently — only one of them can Regal. */
  readonly rarity: 'magic' | 'rare';
  /** The lattice state this row reads, so a route can be drawn from it (`routeFrom`). */
  readonly key: StateKey;
}

export interface StartArgs {
  readonly list: readonly McTarget[];
  readonly slotMasks: readonly number[];
  /** The rungs the solve enumerated. A row is only read where its cell exists. */
  readonly rarities: readonly McRarity[];
  readonly encode: StateEncoder;
  /** V at a state, or undefined where the lattice has no such state. */
  readonly valueAt: (key: StateKey) => number | undefined;
}

/**
 * The clean starting items this solve can price, one row per distinct situation.
 *
 * Which cell a set of mods is read from is the whole of this function, and each rule is a way the
 * obvious read was wrong:
 *
 *  - **At most one mod per slot, and size counts SLOTS.** A slot of alternatives is one modifier on the
 *    finished item. A set holding two members of one slot is not a step toward the target that its
 *    size suggests — the second member fills nothing — so it is not a candidate.
 *  - **Interchangeable spellings are one row.** The encoder maps "Fire + Cold" and "Fire + Lightning"
 *    onto one state when the data cannot tell them apart; they cost the same by construction, and are
 *    listed once, as "Cold or Lightning".
 *  - **Magic rows hold only modifiers an orb can roll.** Below Rare the only moves that add a modifier
 *    are Transmutation, Augmentation and Regal, and none of them can place a desecrated or essence
 *    modifier (an Essence converts the item to Rare as it adds). A Magic item carrying one is not an
 *    item the model can describe.
 *  - **A desecrated-pool target is read with its flag.** The only move that places one is a
 *    Desecration, which marks what it placed, so an item carrying it is carrying the mark — and the
 *    mark is what stops that item being desecrated again. The unmarked cell exists in the lattice but
 *    no route reaches it, and its value would let the policy desecrate a second time. Two such targets
 *    on one item is an item the game does not allow, so it is skipped.
 *
 * Unreachable cells (V = Infinity, e.g. under currency exclusions) are skipped too: no table of costs
 * may carry an infinity. Ordered by size, then cost, then key, so the output is the same every run.
 * The empty Rare and the finished item are both rows — the baseline and the end of the scale.
 */
export function startCandidates({ list, slotMasks, rarities, encode, valueAt }: StartArgs): Holding[] {
  const n = list.length;
  const idsOf = (i: number): readonly string[] => list[i]!.mods.map((m) => m.mod.id);
  const source = (i: number): string => representative(list[i]!).source;

  interface Group { readonly rarity: 'magic' | 'rare'; readonly cost: number; masks: number }
  const groups = new Map<StateKey, Group>();
  for (const rarity of rarities) {
    if (rarity === 'normal') continue; // a Normal item holds nothing
    // From the EMPTY set at the Rare rung — the bare item every other row is measured against — but
    // not at the Magic rung, where "a Magic item with no modifier" is nothing anyone buys.
    for (let mask = rarity === 'rare' ? 0 : 1; mask < (1 << n); mask++) {
      if (slotMasks.some((m) => popcount(mask & m) > 1)) continue;
      let flag = FLAG_NONE;
      let carved = 0;
      let rollableOnly = true;
      for (let i = 0; i < n; i++) {
        if (!has(mask, i)) continue;
        if (source(i) !== 'normal') rollableOnly = false;
        if (source(i) === 'desecrated') { carved++; flag = flagTarget(i); }
      }
      if (carved > 1 || (rarity === 'magic' && !rollableOnly)) continue;
      const key = encode(mask, 0, 0, 0, flag, rarity);
      const cost = valueAt(key);
      if (cost === undefined || !Number.isFinite(cost)) continue;
      const g = groups.get(key);
      if (g) g.masks |= mask;
      else groups.set(key, { rarity, cost, masks: mask });
    }
  }
  // The union of every spelling's positions, one entry per slot — "Cold or Lightning" — in the order
  // the positions come, which for a craft without alternatives is exactly the target order.
  const rows: Holding[] = [];
  for (const [key, g] of groups) {
    const present: (readonly string[])[] = [];
    const done = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (!has(g.masks, i)) continue;
      const slot = slotMasks.findIndex((m) => has(m, i));
      if (done.has(slot)) continue;
      done.add(slot);
      const ids: string[] = [];
      for (let j = 0; j < n; j++) if (has(slotMasks[slot]!, j) && has(g.masks, j)) ids.push(...idsOf(j));
      present.push(ids);
    }
    rows.push({ present, cost: g.cost, rarity: g.rarity, key });
  }
  return rows.sort((a, b) => a.present.length - b.present.length || a.cost - b.cost
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
