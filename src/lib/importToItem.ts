import type { ImportedItem } from './engineTypes.ts';
import { getWorkspace, setWorkspace } from './workspace';

/**
 * Put an imported item on the Item tab, and go there.
 *
 * ONE write, not five setters — the store is written once, so it persists once and never holds a
 * base that disagrees with the modifiers beside it. Note that this is tidiness, NOT the fix for the
 * bug it was written alongside: the Item tab used to clear itself from an effect watching `baseId`,
 * and that effect fires on the new value however few writes produced it. What fixed that was making
 * the clear a HANDLER on the base picker (`changeBase` in ItemActions), so an import and a base pick
 * are told apart by which one the user did, rather than guessed from a value that both change.
 *
 * The TARGET is cleared, because it described the previous item and would otherwise be read as a
 * plan for this one.
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
      target: [],
    },
  });
}
