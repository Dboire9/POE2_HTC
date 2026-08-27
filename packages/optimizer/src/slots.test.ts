import { describe, it, expect } from 'vitest';
import { expandSlots, expansionCount, hasAlternatives, slotIndexGroups } from './slots.ts';
import type { TierTarget } from './optimize.ts';

const t = (modId: string, slot?: number): TierTarget => (slot === undefined ? { modId } : { modId, slot });

describe('slotIndexGroups', () => {
  // The compatibility property the whole feature rests on: a caller that has never heard of slots gets
  // one slot per target, so every consumer's slot-aware code reduces to the code it replaced.
  it('gives an unslotted target a slot of its own', () => {
    expect(slotIndexGroups([t('a'), t('b'), t('c')])).toEqual([[0], [1], [2]]);
  });

  it('groups by slot id, in order of first appearance', () => {
    expect(slotIndexGroups([t('a', 7), t('b', 2), t('c', 7)])).toEqual([[0, 2], [1]]);
  });

  /**
   * An unslotted target must never land in a numbered slot. Mixing the two is not hypothetical — the
   * UI numbers the slots it groups and leaves ordinary targets bare, so a list like [bare, slot 0,
   * slot 0] is the normal shape. Keying `undefined` to 0 would silently make the bare one an
   * alternative of a mod the user never said it could be swapped for.
   */
  it('keeps a bare target out of a numbered slot, including slot 0', () => {
    expect(slotIndexGroups([t('a'), t('b', 0), t('c', 0)])).toEqual([[0], [1, 2]]);
    expect(slotIndexGroups([t('a', 0), t('b'), t('c', 0)])).toEqual([[0, 2], [1]]);
  });

  it('never merges two bare targets with each other', () => {
    expect(slotIndexGroups([t('a'), t('b')])).toEqual([[0], [1]]);
  });
});

describe('expandSlots', () => {
  it('expands a list with no alternatives to itself, untouched', () => {
    const targets = [t('a'), t('b')];
    const out = expandSlots(targets);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual(targets);
  });

  it('produces one craft per combination, in slot order', () => {
    const out = expandSlots([t('a', 0), t('b', 0), t('c')]);
    expect(out.map((c) => c.map((x) => x.modId))).toEqual([['a', 'c'], ['b', 'c']]);
  });

  it('takes the product across several slots', () => {
    const targets = [t('a', 0), t('b', 0), t('c', 1), t('d', 1), t('e', 1)];
    expect(expansionCount(targets)).toBe(6);
    expect(expandSlots(targets)).toHaveLength(6);
    // Every combination is one member per slot — never two of one, never none.
    for (const combo of expandSlots(targets)) {
      expect(combo).toHaveLength(2);
      expect(['a', 'b']).toContain(combo[0]!.modId);
      expect(['c', 'd', 'e']).toContain(combo[1]!.modId);
    }
  });

  /**
   * `slot` is stripped on the way out. Nothing downstream of the expansion has a disjunction left to
   * resolve, and a leftover id would make a planner think a one-member group was still a choice —
   * or, worse, re-expand it.
   */
  it('strips the slot id, since the choice is already made', () => {
    for (const combo of expandSlots([t('a', 0), t('b', 0)])) {
      for (const x of combo) expect(x.slot).toBeUndefined();
    }
  });

  it('carries every other field through untouched', () => {
    const [combo] = expandSlots([{ modId: 'a', minTierIndex: 4, slot: 0 }]);
    expect(combo![0]).toMatchObject({ modId: 'a', minTierIndex: 4 });
  });
});

describe('hasAlternatives', () => {
  it('is false for every target list that predates slots', () => {
    expect(hasAlternatives([t('a'), t('b'), t('c')])).toBe(false);
  });
  it('is false when each slot holds one candidate', () => {
    expect(hasAlternatives([t('a', 0), t('b', 1)])).toBe(false);
  });
  it('is true as soon as one slot holds two', () => {
    expect(hasAlternatives([t('a', 0), t('b', 0)])).toBe(true);
  });
});
