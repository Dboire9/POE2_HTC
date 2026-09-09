import type { ImportedItem, TargetInput } from './engineTypes.ts';
import { getWorkspace, setWorkspace } from './workspace';

/**
 * ONE rule, applied by all three routes below: a modifier list belongs to the BASE it was chosen on.
 *
 * Held modifiers and targets both name ids of the form `<base>/<mod>`, so they mean nothing on
 * another base and the picker cannot even show them. While the base holds they are kept; when it
 * changes they go. That is why none of these functions carries an ad-hoc "clear this too" — the
 * question is always the same question.
 */
const sameBase = (a: string, b: string): boolean => a === b;

/**
 * Put an imported item on the Item tab as the item you HOLD, and go there.
 *
 * ONE write, not five setters — the store is written once, so it persists once and never holds a
 * base that disagrees with the modifiers beside it. Note that this is tidiness, NOT the fix for the
 * bug it was written alongside: the Item tab used to clear itself from an effect watching `baseId`,
 * and that effect fires on the new value however few writes produced it. What fixed that was making
 * the clear a HANDLER on the base picker (`changeBase` in ItemActions), so an import and a base pick
 * are told apart by which one the user did, rather than guessed from a value that both change.
 *
 * A TARGET set on the same base survives. It used to be cleared unconditionally, which quietly undid
 * "aim at this item, then paste mine" — the exact order that flow is used in.
 */
export function importToItem(it: ImportedItem): void {
  const ws = getWorkspace();
  setWorkspace({
    ...ws,
    mode: 'item',
    item: {
      ...ws.item,
      baseId: it.baseId,
      level: it.level,
      rarity: it.rarity,
      prefixes: it.prefixes,
      suffixes: it.suffixes,
      target: sameBase(ws.item.baseId, it.baseId) ? ws.item.target : [],
    },
  });
}

/**
 * Every modifier of an imported item, as targets — the item read as a GOAL rather than as a start.
 *
 * A `readGear` reading has already applied both rules a target list has to obey (three a side, one
 * per exclusion family), so this is a projection and not a second place those can be got wrong.
 *
 * The FRACTURED flag is deliberately dropped. On a target list it would mean "the base I buy already
 * has this", which is a claim about a base the player has not got; planning to roll it is the
 * conservative reading and the one that matches "from scratch".
 */
const targetsOf = (it: ImportedItem): TargetInput[] =>
  [...it.prefixes, ...it.suffixes].map((m) => ({ modId: m.modId, tierDisplay: m.tierDisplay }));

/**
 * Craft this item from a white base: its modifiers become the Lab tab's targets, and go there.
 *
 * The item level comes across too, because it decides which tiers can roll at all — carrying the
 * modifiers without it would plan a craft the base cannot produce.
 */
export function craftFromScratch(it: ImportedItem): void {
  const ws = getWorkspace();
  setWorkspace({
    ...ws,
    mode: 'plan',
    lab: {
      ...ws.lab,
      baseId: it.baseId,
      level: it.level,
      targets: targetsOf(it),
      // Chosen afresh for a new craft; carrying them over would apply the last craft's decisions to
      // modifiers that were never part of it.
      fractured: new Set(),
      pinned: new Set(),
    },
  });
}

/**
 * Aim at this item from whatever you are already holding: it becomes the Item tab's TARGET.
 *
 * This is the "I have some of these already — what now?" route, and the Item tab's planner is built
 * for exactly that: it keeps every held modifier the target names and plans only the gap.
 *
 * On the SAME base your item is left untouched, which is the whole point. On a different base it
 * cannot be — the modifiers on it name that other base's mod ids — so the item is cleared along with
 * it, and the button says which of the two is about to happen.
 */
export function useAsTarget(it: ImportedItem): void {
  const ws = getWorkspace();
  const keep = sameBase(ws.item.baseId, it.baseId);
  setWorkspace({
    ...ws,
    mode: 'item',
    item: {
      ...ws.item,
      baseId: it.baseId,
      level: keep ? ws.item.level : it.level,
      prefixes: keep ? ws.item.prefixes : [],
      suffixes: keep ? ws.item.suffixes : [],
      // The plan sub-tab, because a target is what it reads and the quick check ignores one entirely.
      subMode: 'plan',
      target: targetsOf(it),
    },
  });
}
