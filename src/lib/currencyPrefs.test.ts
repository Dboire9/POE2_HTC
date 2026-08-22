import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  ALL_GROUPS, CURRENCY_GROUPS, OMEN_GROUP, STORAGE_KEY, STRENGTH_GROUP,
  describeGroup, getExclusions, setExclusions, toExcludedKeys, useExclusions,
} from './currencyPrefs';

// The UI speaks in groups ("I don't have Chaos Orbs"); the planners speak in price-sheet keys. This is
// the translation, and a mistake in it is silent: the app would look like it excluded something while
// the planners happily kept using it.
describe('toExcludedKeys — group settings become price-sheet keys', () => {
  it('a marked group with no narrowing excludes all of it', () => {
    expect(toExcludedKeys({ chaos: { only: [] } }).sort())
      .toEqual(['chaos', 'chaos_greater', 'chaos_perfect']);
  });

  it('a narrowing excludes only the members named', () => {
    expect(toExcludedKeys({ chaos: { only: ['perfect'] } })).toEqual(['chaos_perfect']);
    expect(toExcludedKeys({ chaos: { only: ['greater', 'perfect'] } }).sort())
      .toEqual(['chaos_greater', 'chaos_perfect']);
  });

  // The agreed rule, and the reason the UI must state its effect in words: removing your last tick
  // does not narrow to nothing, it widens back to the whole group.
  it('narrowing down to nothing means the whole group again, not an empty exclusion', () => {
    expect(toExcludedKeys({ chaos: { only: [] } }).length).toBe(3);
  });

  it('a currency with no variants excludes its single key', () => {
    expect(toExcludedKeys({ annul: { only: [] } })).toEqual(['annul']);
    expect(toExcludedKeys({ desecrate: { only: [] } })).toEqual(['desecrate']);
  });

  it('the global strength row spans every tiered family at once', () => {
    const keys = toExcludedKeys({ strengths: { only: ['perfect'] } }).sort();
    expect(keys).toEqual([
      'augment_perfect', 'chaos_perfect', 'exalt_perfect', 'regal_perfect', 'transmute_perfect',
    ]);
  });

  it('unions overlapping rows without duplicating', () => {
    const keys = toExcludedKeys({ strengths: { only: ['perfect'] }, chaos: { only: ['perfect'] } });
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('chaos_perfect');
  });

  it('excludes all 13 omens when the omen row is marked', () => {
    expect(toExcludedKeys({ omens: { only: [] } })).toHaveLength(13);
  });

  it('nothing marked excludes nothing', () => {
    expect(toExcludedKeys({})).toEqual([]);
  });

  // Saved settings outlive the build that wrote them; a removed group must not throw at a returning user.
  it('ignores a group id it no longer knows', () => {
    expect(toExcludedKeys({ someRemovedGroup: { only: [] } })).toEqual([]);
  });

  // Every key produced must be one the price sheet — and therefore the planners — actually use.
  it('only ever emits keys that exist in the shipped price sheet', async () => {
    const sheet = (await import('../../data/patches/0.5.0/prices.json')).default;
    const known = new Set([...Object.keys(sheet.prices), ...Object.keys(sheet.omens)]);
    const everything = Object.fromEntries(ALL_GROUPS.map((g) => [g.id, { only: [] }]));
    for (const key of toExcludedKeys(everything)) {
      expect(known.has(key), `${key} is not in prices.json`).toBe(true);
    }
  });
});

describe('describeGroup — the UI must state the effect, since the rule is non-monotone', () => {
  it('says "all" when the group is marked without narrowing', () => {
    expect(describeGroup(OMEN_GROUP, [])).toMatch(/excluding all omens/i);
  });

  it('names the members when narrowed', () => {
    expect(describeGroup(STRENGTH_GROUP, ['perfect'])).toBe('excluding only Perfect');
  });

  it('says "all" for a group that has no members to narrow', () => {
    const annul = CURRENCY_GROUPS.find((g) => g.id === 'annul')!;
    expect(describeGroup(annul, [])).toMatch(/excluding all/i);
  });
});

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    setExclusions({});
  });

  it('round-trips through localStorage', () => {
    setExclusions({ omens: { only: [] } });
    expect(getExclusions()).toEqual({ omens: { only: [] } });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ omens: { only: [] } });
  });

  // Both planners must run under identical rules, and the two tabs are separate component trees that
  // mount and unmount — so a component reading the store has to be told when another one changes it.
  // A stale copy in one tab is the sort of silent divergence that let the D8 pricing bug hide.
  it('re-renders every subscriber when the setting changes anywhere', () => {
    const { result } = renderHook(() => useExclusions());
    expect(result.current).toEqual({});

    act(() => setExclusions({ chaos: { only: ['perfect'] } }));
    expect(result.current).toEqual({ chaos: { only: ['perfect'] } });

    act(() => setExclusions({}));
    expect(result.current).toEqual({});
  });

  // main.tsx wipes localStorage on a CACHE_VERSION bump to drop stale caches. A saved preference is
  // not a cache, and silently losing it would change the user's plans with no explanation — so the
  // key lives under a prefix that wipe preserves.
  it('is stored under the preserved prefs prefix', () => {
    expect(STORAGE_KEY.startsWith('poe2htc.')).toBe(true);
  });
});
