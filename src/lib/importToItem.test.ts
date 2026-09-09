import { describe, it, expect, beforeEach, vi } from 'vitest';
import { importToItem } from './importToItem';
import { getWorkspace, setWorkspace, defaultWorkspace, STORAGE_KEY } from './workspace';
import type { ImportedItem } from './engineTypes';

const ITEM: ImportedItem = {
  baseId: 'Staves', level: 77, rarity: 'rare',
  prefixes: [{ modId: 'Staves/A', tierDisplay: 1 }],
  suffixes: [{ modId: 'Staves/B', tierDisplay: 2 }],
};

beforeEach(() => { setWorkspace(defaultWorkspace()); });

describe('importToItem', () => {
  it('puts the item on the Item tab and goes there', () => {
    setWorkspace({ ...defaultWorkspace(), mode: 'gear' });
    importToItem(ITEM);
    const ws = getWorkspace();
    expect(ws.mode).toBe('item');
    expect(ws.item.baseId).toBe('Staves');
    expect(ws.item.level).toBe(77);
    expect(ws.item.rarity).toBe('rare');
    expect(ws.item.prefixes).toEqual(ITEM.prefixes);
    expect(ws.item.suffixes).toEqual(ITEM.suffixes);
  });

  /** The target described the PREVIOUS item; left standing it reads as a plan for this one. */
  it('clears a target left over from the item before it', () => {
    const d = defaultWorkspace();
    setWorkspace({ ...d, item: { ...d.item, target: [{ modId: 'Wands/Old', tierDisplay: 1 }] } });
    importToItem(ITEM);
    expect(getWorkspace().item.target).toEqual([]);
  });

  /**
   * ONE write to the store, so ONE persist.
   *
   * Counted through `localStorage`, because that is where the difference is actually observable:
   * React batches sequential `setWorkspace` calls into a single render, so a subscriber sees the same
   * thing either way and a render-counting test passes against the five-setter version it claims to
   * rule out. It did, until this was mutated.
   *
   * And to be clear about what this is NOT: single-writing did not fix the import bug. The Item tab's
   * old base-watching effect fired on the new value however few writes produced it — `changeBase` in
   * ItemActions is the fix, pinned by its own regression test.
   */
  it('writes the store once, not once per field', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    importToItem(ITEM);
    expect(spy.mock.calls.filter(([k]) => k === STORAGE_KEY)).toHaveLength(1);
    spy.mockRestore();
  });
});
