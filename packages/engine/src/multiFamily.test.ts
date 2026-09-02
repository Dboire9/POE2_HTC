import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from './index.ts';
import { excluded, familiesOf, familyAvailable, itemFamilies, loadPatch, poolTotalWeight } from './index.ts';

// Most mods sit in exactly one exclusion group, but some span several: a desecrated "+Str +Int" rolls
// in BOTH the Strength and Intelligence groups, so it must block — and be blocked by — either. poe2db
// carries that as a multi-entry ModFamilyList; `family` keeps the primary (it keys the weight join and
// the UI label) and `families` carries the whole set.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number, families?: string[]): Mod => ({
  id, source: 'normal', type, family,
  ...(families ? { families } : {}), tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight, ranges: [] }],
});

// STR(w10) and INT(w20) are ordinary single-family suffixes; HYBRID(w30) spans both their groups.
const STR = mk('STR', 'suffix', 'Strength', 10);
const INT = mk('INT', 'suffix', 'Intelligence', 20);
const HYBRID = mk('HYBRID', 'suffix', 'Strength', 30, ['Strength', 'Intelligence']);
const OTHER = mk('OTHER', 'prefix', 'Other', 40);
const base: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: {
    normal: { prefixes: ['OTHER'], suffixes: ['STR', 'INT', 'HYBRID'] },
    desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([['STR', STR], ['INT', INT], ['HYBRID', HYBRID], ['OTHER', OTHER]]),
  bases: new Map([['B', base]]),
};
const item = (...ids: string[]): ItemState => ({
  base, level: 100, rarity: 'rare', prefixes: [], suffixes: ids.map((id) => ({ modId: id, tierName: 't1' })),
});

describe('familiesOf — the single accessor', () => {
  it('yields the one family for an ordinary mod, and all of them for a spanning mod', () => {
    expect(familiesOf(STR)).toEqual(['Strength']);
    expect(familiesOf(HYBRID)).toEqual(['Strength', 'Intelligence']);
  });

  it('yields nothing for a blank family, so unrelated blank-family mods never collide', () => {
    expect(familiesOf(mk('BLANK', 'prefix', '', 5))).toEqual([]);
    expect(excluded(mk('BLANK', 'prefix', '', 5), new Set(['Strength', '']))).toBe(false);
  });

  it('families[0] is the primary — the weight join and the UI label depend on that', () => {
    expect(familiesOf(HYBRID)[0]).toBe(HYBRID.family);
  });
});

describe('a multi-family mod blocks, and is blocked by, EITHER group', () => {
  it('occupies every one of its groups once on the item', () => {
    expect([...itemFamilies(data, item('HYBRID'))].sort()).toEqual(['Intelligence', 'Strength']);
  });

  it('is unavailable when EITHER group is already taken', () => {
    expect(familyAvailable(data, item('STR'), HYBRID)).toBe(false); // primary group taken
    expect(familyAvailable(data, item('INT'), HYBRID)).toBe(false); // the SECOND group taken — the bug
    expect(familyAvailable(data, item('OTHER'), HYBRID)).toBe(true);
  });

  it('blocks both single-family mods once it is on the item', () => {
    expect(familyAvailable(data, item('HYBRID'), STR)).toBe(false);
    expect(familyAvailable(data, item('HYBRID'), INT)).toBe(false); // would have been wrongly allowed
  });
});

describe('the add denominator shrinks by every occupied group', () => {
  const pool = ['STR', 'INT', 'HYBRID'];
  it('a hybrid on the item excludes itself AND the group it used to leak', () => {
    // Weights: STR 10, INT 20, HYBRID 30. With HYBRID on the item, all three are unrollable —
    // STR and HYBRID via Strength, INT via Intelligence — so the suffix denominator is 0.
    expect(poolTotalWeight(data, pool, 0, 100, itemFamilies(data, item('HYBRID')))).toBe(0);
    // Before the fix only Strength was occupied, leaving INT's 20 wrongly in the denominator.
    expect(poolTotalWeight(data, pool, 0, 100, new Set(['Strength']))).toBe(20);
  });

  it('an ordinary mod still excludes only its own group', () => {
    // STR on the item ⇒ Strength taken ⇒ STR(10) and HYBRID(30) drop, INT(20) remains.
    expect(poolTotalWeight(data, pool, 0, 100, itemFamilies(data, item('STR')))).toBe(20);
  });
});

describe('shipped 0.5.0 data carries the multi-family groups', () => {
  const real = loadPatch('data/patches/0.5.0');

  it('every mod with a families array keeps family as families[0]', () => {
    const multi = [...real.mods.values()].filter((m) => m.families && m.families.length > 0);
    expect(multi.length).toBeGreaterThan(0);
    for (const m of multi) {
      expect(m.families!.length, `${m.id} should not carry a 1-entry families array`).toBeGreaterThan(1);
      expect(m.families![0], `${m.id}: families[0] must stay the weight-join/display key`).toBe(m.family);
    }
  });

  it('a real desecrated "+Str +Int" mod blocks a pure mod of its second group', () => {
    const hybrid = [...real.mods.values()].find(
      (m) => m.source === 'desecrated' && m.families?.length === 2 && m.families.includes('Intelligence'),
    );
    expect(hybrid, 'shipped data has a two-attribute desecrated mod').toBeDefined();
    expect(familiesOf(hybrid!)).toContain('Intelligence');
    // Its SECOND family is a real exclusion group, not decoration.
    expect(excluded(hybrid!, new Set(['Intelligence']))).toBe(true);
    expect(excluded(hybrid!, new Set([hybrid!.family]))).toBe(true);
  });

  it('the Java-era 0.5 anchor has no families arrays (legacy shape still loads)', () => {
    const legacy = loadPatch('data/patches/0.5');
    const multi = [...legacy.mods.values()].filter((m) => m.families);
    expect(multi).toHaveLength(0);
    // …and single-family mods there still resolve to exactly one group.
    const any = [...legacy.mods.values()].find((m) => m.family !== '');
    expect(familiesOf(any!)).toHaveLength(1);
  });
});
