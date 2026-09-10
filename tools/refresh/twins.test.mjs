// The rule deciding which of RePoE's variants lend a row their base names (twins.mjs). The real dump
// cannot exercise its guard — all 332 tag-twins in it roll their row's exact pool — so a synthetic
// class stands in, holding one of each case the rule has to tell apart.

import { describe, it, expect } from 'vitest';
import { poolKey, twinsOf } from './twins.mjs';

const MARKERS = new Set(['karui_basetype', 'runeforged']);
const ROW = 'int_armour,boots,armour,default';
const POOL = { prefix: { IncreasedLife: { Life1: 1, Life2: 11 } }, suffix: { ColdResistance: { Cold1: 1 } } };
const variants = {
  [ROW]: { bases: ['plain'], mods: POOL },
  'int_armour,karui_basetype,boots,armour,default': { bases: ['karui'], mods: POOL },
  'int_armour,karui_basetype,runeforged,boots,armour,default': { bases: ['karui runeforged'], mods: POOL },
  // Only a marker added, but one tier short — the case the guard exists for.
  'int_armour,runeforged,boots,armour,default': {
    bases: ['short'], mods: { ...POOL, prefix: { IncreasedLife: { Life1: 1 } } },
  },
  // The same pool under a tag that is not a marker: the Trarthan Cannon's shape.
  'int_armour,cannon,boots,armour,default': { bases: ['cannon'], mods: POOL },
  // The same pool, a marker, and another attribute.
  'dex_int_armour,karui_basetype,boots,armour,default': { bases: ['other attribute'], mods: POOL },
};

describe('twinsOf — which variants read as the same row', () => {
  it('folds a variant that adds only marker tags and rolls the same pool', () => {
    expect(twinsOf(variants, ROW, MARKERS).twins).toEqual([
      'int_armour,karui_basetype,boots,armour,default',
      'int_armour,karui_basetype,runeforged,boots,armour,default',
    ]);
  });

  /** Folding it would read a Runeforged item as a row whose pool it does not share, silently. */
  it('reports a marker-only variant with a different pool instead of folding it', () => {
    const { twins, differ } = twinsOf(variants, ROW, MARKERS);
    expect(differ).toEqual(['int_armour,runeforged,boots,armour,default']);
    expect(twins).not.toContain('int_armour,runeforged,boots,armour,default');
  });

  /** Neither is a twin, so neither is reported either: its tags alone say it is another kind of base. */
  it('ignores a variant that adds any other tag or has another attribute, whatever its pool', () => {
    const { twins, differ } = twinsOf(variants, ROW, MARKERS);
    for (const sig of ['int_armour,cannon,boots,armour,default', 'dex_int_armour,karui_basetype,boots,armour,default']) {
      expect(twins).not.toContain(sig);
      expect(differ).not.toContain(sig);
    }
  });
});

describe('poolKey — what "the same pool" means', () => {
  it('ignores the order groups and tiers are listed in', () => {
    const a = { mods: { prefix: { A: { a1: 1, a2: 2 }, B: { b1: 1 } }, suffix: {} } };
    const b = { mods: { prefix: { B: { b1: 1 }, A: { a2: 2, a1: 1 } }, suffix: {} } };
    expect(poolKey(a)).toBe(poolKey(b));
  });

  it('tells apart a missing tier, a group on the other side, and a missing group', () => {
    const base = { mods: { prefix: { A: { a1: 1, a2: 2 } }, suffix: { B: { b1: 1 } } } };
    const keys = [
      base,
      { mods: { prefix: { A: { a1: 1 } }, suffix: { B: { b1: 1 } } } },
      { mods: { prefix: { A: { a1: 1, a2: 2 }, B: { b1: 1 } }, suffix: {} } },
      { mods: { prefix: { A: { a1: 1, a2: 2 } }, suffix: {} } },
    ].map(poolKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
