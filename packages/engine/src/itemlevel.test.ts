import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData, Tier } from './index.ts';
import { addAffixProbability } from './index.ts';

// Verifies the two accuracy items the Java engine got wrong but the TS engine already handles: the
// pool is capped by ITEM LEVEL (D5 — Java only floored by the currency tier), and the numerator and
// denominator use the SAME [floor, cap] tier window (D1 — Java left the non-desired numerator
// unfloored). Both are invisible at item level 100 (max mod ilvl < 100), so they need sub-100 tests.
//
// Synthetic base — tiers span low/mid/high ilvl so the cap actually excludes some:
//   prefix A: a1(ilvl1,w10)  a50(ilvl50,w20)  a80(ilvl80,w30)
//   prefix B: b1(ilvl1,w40)
//   suffix C: c1(ilvl1,w50)  c60(ilvl60,w60)
const tier = (name: string, ilvl: number, weight: number): Tier => ({ name, ilvl, weight, ranges: [], stats: [] });
const mod = (id: string, type: 'prefix' | 'suffix', family: string, tiers: Tier[]): Mod =>
  ({ id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: null, tiers });

const A = mod('A', 'prefix', 'FA', [tier('a1', 1, 10), tier('a50', 50, 20), tier('a80', 80, 30)]);
const B = mod('B', 'prefix', 'FB', [tier('b1', 1, 40)]);
const C = mod('C', 'suffix', 'FC', [tier('c1', 1, 50), tier('c60', 60, 60)]);
const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: { normal: { prefixes: ['A', 'B'], suffixes: ['C'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const data: PatchData = { patch: 't', mods: new Map([['A', A], ['B', B], ['C', C]]), bases: new Map([['S', base]]) };
const item = (level: number): ItemState => ({ base, level, rarity: 'rare', prefixes: [], suffixes: [] });

describe('item-level cap on the pool (D5)', () => {
  it('excludes tiers above the item level from BOTH numerator and denominator', () => {
    // level 55: A→{a1,a50}=30 (a80 excluded), B→40, C→{c1}=50 (c60 excluded). both-open: 30/(70+50).
    expect(addAffixProbability(data, item(55), 'A')).toBeCloseTo(30 / 120, 12);
    // level 100: all tiers count → A=60, prefixes=100, suffix=110 → 60/210.
    expect(addAffixProbability(data, item(100), 'A')).toBeCloseTo(60 / 210, 12);
  });

  it('a mod whose only in-level tiers are gone → its weight drops out of the pool', () => {
    // level 40: A→{a1}=10 (a50 & a80 gone), B→40, C→{c1}=50 (c60 gone). both-open: 40/(50+50).
    expect(addAffixProbability(data, item(40), 'B')).toBeCloseTo(40 / (10 + 40 + 50), 12);
  });

  it('a tier target above the item level is impossible → 0', () => {
    // want A at a80 (index 2) on a level-40 item — that tier can't roll → 0
    expect(addAffixProbability(data, item(40), 'A', { minTierIndex: 2 })).toBe(0);
  });
});

describe('numerator / denominator floor consistency (D1)', () => {
  it('a greater orb floors BOTH sides by 35 — no runaway probability', () => {
    // floor 35, level 55: A→{a50}=20; B has no tier in [35,55]→0; C has none in [35,55]→0.
    // Only A can roll → prefix-only branch → 20/20 = 1.0 (a valid probability).
    // The Java bug (unfloored numerator A=60, floored denom=20) would give 60/20 = 3.0 — impossible.
    expect(addAffixProbability(data, item(55), 'A', { floor: 35 })).toBeCloseTo(1, 12);
  });

  it('greater orb with the desired tier still reachable: consistent [floor, cap] window', () => {
    // floor 35, level 100: A→{a50,a80}=50; B→0 (no tier ≥35); C→{c60}=60. prefix total 50, suffix 60.
    expect(addAffixProbability(data, item(100), 'A', { floor: 35 })).toBeCloseTo(50 / (50 + 60), 12);
  });

  it('the numerator counts desired-or-better tiers while the denominator counts all outcomes', () => {
    // minTierIndex 1 (a50 or better) at level 100: numerator = a50+a80 = 50; denominator = all = 210.
    expect(addAffixProbability(data, item(100), 'A', { minTierIndex: 1 })).toBeCloseTo(50 / 210, 12);
  });
});
