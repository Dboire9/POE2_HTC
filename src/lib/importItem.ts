import type { CraftGoal, ImportedItem } from './engineTypes.ts';
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
      // Runes belong to the item, not to the tab: a paste on another base describes a different item,
      // and claiming it carries the last one's runes would quietly change what it may hold. An import
      // that KNOWS them — the streamer tab reads them off the real item — says so and wins; a paste
      // carries no rune information at all, so there the base rule still decides.
      runes: it.runes ? [...it.runes] : sameBase(ws.item.baseId, it.baseId) ? ws.item.runes : [],
    },
  });
}

/**
 * Craft this goal from a white base: its targets become the Lab tab's — a slot of alternatives stays
 * one slot — and go there. `goalOf` (streamerGear.ts) is how an item becomes a goal.
 *
 * The item level comes across too, because it decides which tiers can roll at all — carrying the
 * targets without it would plan a craft the base cannot produce.
 */
export function craftFromScratch(goal: CraftGoal): void {
  const ws = getWorkspace();
  setWorkspace({
    ...ws,
    mode: 'plan',
    lab: {
      ...ws.lab,
      baseId: goal.baseId,
      level: goal.level,
      targets: [...goal.targets],
      // Chosen afresh for a new craft; carrying them over would apply the last craft's decisions to
      // modifiers that were never part of it. Runes are the exception when the GOAL names them: they
      // are not a leftover preference there but part of the item being copied, and without them the
      // craft that produced it can be literally impossible to plan.
      fractured: new Set(),
      pinned: new Set(),
      runes: [...(goal.runes ?? [])],
    },
  });
}

/**
 * Aim at this goal from whatever you are already holding: its targets become the Item tab's TARGET.
 *
 * This is the "I have some of these already — what now?" route, and the Item tab's planner is built
 * for exactly that: it keeps every held modifier the target names and plans only the gap.
 *
 * On the SAME base your item is left untouched, which is the whole point. On a different base it
 * cannot be — the modifiers on it name that other base's mod ids — so the item is cleared along with
 * it, and the button says which of the two is about to happen.
 */
export function useAsTarget(goal: CraftGoal): void {
  const ws = getWorkspace();
  const keep = sameBase(ws.item.baseId, goal.baseId);
  setWorkspace({
    ...ws,
    mode: 'item',
    item: {
      ...ws.item,
      baseId: goal.baseId,
      level: keep ? ws.item.level : goal.level,
      prefixes: keep ? ws.item.prefixes : [],
      suffixes: keep ? ws.item.suffixes : [],
      // The plan sub-tab, because a target is what it reads and the quick check ignores one entirely.
      subMode: 'plan',
      target: [...goal.targets],
      // A goal that names runes needs them to be reachable at all, so they are adopted here as well —
      // this route keeps YOUR item, and an item that cannot hold the target is not a plan, it is a
      // refusal. Where the goal names none, the base rule decides as before.
      runes: goal.runes ? [...goal.runes] : keep ? ws.item.runes : [],
    },
  });
}
