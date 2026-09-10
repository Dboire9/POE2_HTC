import { describe, it, expect, beforeEach, vi } from 'vitest';
import { craftFromScratch, importToItem, useAsTarget } from './importItem';
import { getWorkspace, setWorkspace, defaultWorkspace, STORAGE_KEY } from './workspace';
import { goalOf } from './streamerGear';
import type { CraftGoal, ImportedItem } from './engineTypes';

const ITEM: ImportedItem = {
  baseId: 'Staves', level: 77, rarity: 'rare',
  prefixes: [{ modId: 'Staves/A', tierDisplay: 1 }],
  suffixes: [{ modId: 'Staves/B', tierDisplay: 2 }],
};
/** The same modifiers read as a goal — what the two goal routes take. */
const GOAL: CraftGoal = goalOf(ITEM);

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

describe('craftFromScratch', () => {
  it('makes the item’s modifiers the Lab’s targets, on its own base and item level', () => {
    craftFromScratch(GOAL);
    const ws = getWorkspace();
    expect(ws.mode).toBe('plan');
    expect(ws.lab.baseId).toBe('Staves');
    expect(ws.lab.level).toBe(77);
    expect(ws.lab.targets).toEqual([
      { modId: 'Staves/A', tierDisplay: 1 },
      { modId: 'Staves/B', tierDisplay: 2 },
    ]);
  });

  /**
   * On a target list, "fractured" would claim the base you buy already carries it — a claim about a
   * base the player has not got. Planning to roll it is the conservative reading, and the one "from
   * scratch" means.
   */
  it('does not carry a fractured modifier across as a pre-owned one', () => {
    craftFromScratch(goalOf({ ...ITEM, prefixes: [{ modId: 'Staves/A', tierDisplay: 1, fractured: true }] }));
    expect(getWorkspace().lab.fractured.size).toBe(0);
    expect(getWorkspace().lab.targets.map((t) => t.modId)).toContain('Staves/A');
  });

  it('does not carry the previous craft’s pins onto modifiers that were never in it', () => {
    const d = defaultWorkspace();
    setWorkspace({ ...d, lab: { ...d.lab, pinned: new Set(['Wands/Old']) } });
    craftFromScratch(GOAL);
    expect(getWorkspace().lab.pinned.size).toBe(0);
  });

  /** A slot of alternatives survives the trip: the Lab solves "Cold or Lightning" as one position. */
  it('carries a slot of alternatives across as one slot', () => {
    const slotted: CraftGoal = { ...GOAL, targets: [
      { modId: 'Staves/A', tierDisplay: 1 },
      { modId: 'Staves/Cold', tierDisplay: 1, slot: 0 },
      { modId: 'Staves/Lightning', tierDisplay: 1, slot: 0 },
    ] };
    craftFromScratch(slotted);
    expect(getWorkspace().lab.targets).toEqual(slotted.targets);
  });
});

describe('useAsTarget', () => {
  const held = { modId: 'Staves/Held', tierDisplay: 3 };

  /** The whole point of this route: your item stays, and the plan covers only the gap. */
  it('leaves the item you hold alone when it is the same base', () => {
    const d = defaultWorkspace();
    setWorkspace({ ...d, item: { ...d.item, baseId: 'Staves', level: 80, prefixes: [held] } });
    useAsTarget(GOAL);
    const ws = getWorkspace();
    expect(ws.mode).toBe('item');
    expect(ws.item.subMode).toBe('plan');
    expect(ws.item.prefixes).toEqual([held]);
    expect(ws.item.level, 'your item’s level, not the streamer’s').toBe(80);
    expect(ws.item.target).toHaveLength(2);
  });

  /**
   * On a different base it cannot be kept: those modifiers name another base's ids, so the picker
   * cannot show them and no planner can place them.
   */
  it('clears an item from another base, along with its level', () => {
    const d = defaultWorkspace();
    setWorkspace({ ...d, item: { ...d.item, baseId: 'Wands', level: 80, prefixes: [{ modId: 'Wands/X', tierDisplay: 1 }] } });
    useAsTarget(GOAL);
    const ws = getWorkspace();
    expect(ws.item.baseId).toBe('Staves');
    expect(ws.item.prefixes).toEqual([]);
    expect(ws.item.level).toBe(77);
  });
});

/**
 * The order this flow is actually used in: aim at a streamer's item, then paste your own.
 *
 * `importToItem` used to clear the target unconditionally, so the second step silently undid the
 * first and the tab planned nothing in particular.
 */
describe('aiming and then pasting', () => {
  it('keeps the target when the pasted item is the same base', () => {
    useAsTarget(GOAL);
    importToItem({ ...ITEM, prefixes: [{ modId: 'Staves/Held', tierDisplay: 3 }], suffixes: [] });
    expect(getWorkspace().item.target).toHaveLength(2);
  });

  it('drops the target when the pasted item is a different base', () => {
    useAsTarget(GOAL);
    importToItem({ baseId: 'Wands', level: 80, rarity: 'rare', prefixes: [], suffixes: [] });
    expect(getWorkspace().item.target).toEqual([]);
  });
});
