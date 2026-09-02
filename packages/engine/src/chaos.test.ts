import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod } from './index.ts';
import { chaosProbability } from './index.ts';

// Synthetic base: 3 prefixes + 3 suffixes, each its own family, weight 100, one tier at ilvl 1. Chaos
// has no Java counterpart (absent from the engine), so we verify against hand-computed values here and
// MC-validate on real data during optimizer integration.
const mod = (id: string, type: 'prefix' | 'suffix'): Mod => ({
  id, source: 'normal', type, family: 'fam_' + id, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: 100, ranges: [] }],
});
const P = ['P1', 'P2', 'P3'].map((id) => mod(id, 'prefix'));
const S = ['S1', 'S2', 'S3'].map((id) => mod(id, 'suffix'));
const base: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: { normal: { prefixes: ['P1', 'P2', 'P3'], suffixes: ['S1', 'S2', 'S3'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const data: PatchData = { patch: 't', mods: new Map([...P, ...S].map((m) => [m.id, m])), bases: new Map([['B', base]]) };
const placed = (id: string): PlacedMod => ({ modId: id, tierName: 't1' });
const rare = (pre: string[], suf: string[]): ItemState => ({ base, level: 100, rarity: 'rare', prefixes: pre.map(placed), suffixes: suf.map(placed) });

describe('chaosProbability — remove one (uniform) × add one (weighted)', () => {
  it('remove a suffix, add a prefix: (1/total) × weight/openPool', () => {
    // item [P1,P2 | S1] (3 mods). Remove S1 (1/3). After: [P1,P2 | ]. Add P3 (prefix): prefix pool = P3
    // only (P1,P2 families occupied) = 100; suffix pool = S1+S2+S3 = 300 (nothing occupied there).
    // add P3 = 100/(100+300) = 0.25 ⇒ chaos = 1/3 × 0.25 = 1/12.
    expect(chaosProbability(data, rare(['P1', 'P2'], ['S1']), 'S1', 'P3')).toBeCloseTo(1 / 12, 12);
  });

  it('the add is not tied to the removed side (remove a prefix, add a suffix)', () => {
    // item [P1,P2 | S1]. Remove P1 (1/3). After: [P2 | S1]. Add S2 (suffix): suffix pool = S2+S3 = 200
    // (S1 family occupied); prefix pool = P1+P3 = 200 (P2 occupied). add S2 = 100/400 = 0.25 ⇒ 1/12.
    expect(chaosProbability(data, rare(['P1', 'P2'], ['S1']), 'P1', 'S2')).toBeCloseTo(1 / 12, 12);
  });

  it('removal is uniform over ALL mods (denominator = total mod count)', () => {
    // item [P1 | S1,S2] (3 mods). Remove S2 = 1/3. After: [P1 | S1]. Add P2: prefix pool = P2+P3 = 200
    // (P1 occupied); suffix pool = S2+S3 = 200 (S1 occupied). add P2 = 100/400 = 0.25 ⇒ 1/12.
    expect(chaosProbability(data, rare(['P1'], ['S1', 'S2']), 'S2', 'P2')).toBeCloseTo(1 / 12, 12);
    // a bigger item lowers the removal chance: [P1,P2,P3 | S1] (4 mods) remove S1 = 1/4.
    // After: [P1,P2,P3 | ]. Add S2 (suffix): prefix side full (3), suffix pool = S1+S2+S3 = 300.
    // add S2 = 100/300 = 1/3 ⇒ chaos = 1/4 × 1/3 = 1/12.
    expect(chaosProbability(data, rare(['P1', 'P2', 'P3'], ['S1']), 'S1', 'S2')).toBeCloseTo(1 / 12, 12);
  });

  it('can re-roll the removed mod’s own family (its slot is freed first)', () => {
    // item [P1,P2 | S1]. Remove S1 (1/3). After: [P1,P2 | ]. Add S1 again: suffix pool = S1+S2+S3 = 300,
    // prefix pool = P3 = 100. add S1 = 100/400 = 0.25 ⇒ 1/12.
    expect(chaosProbability(data, rare(['P1', 'P2'], ['S1']), 'S1', 'S1')).toBeCloseTo(1 / 12, 12);
  });

  it('0 when the item is not Rare, or the removed mod is absent', () => {
    const magic: ItemState = { base, level: 100, rarity: 'magic', prefixes: [placed('P1')], suffixes: [placed('S1')] };
    expect(chaosProbability(data, magic, 'P1', 'P2')).toBe(0);          // not rare
    expect(chaosProbability(data, rare(['P1'], ['S1']), 'P3', 'P2')).toBe(0); // P3 not on the item
  });
});
