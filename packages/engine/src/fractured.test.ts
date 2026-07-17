import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, PatchData, PlacedMod } from './index.ts';
import { annulProbability, perfectEssenceProbability } from './index.ts';

// Fractured ("carved") mods are locked: they can never be removed, and they're excluded from the
// random-removal pool of annul / chaos / essence — so removing any OTHER mod becomes likelier. These
// are hand-computed on a synthetic rare (no pool data needed — removal math is over placed mods only).

const dummyBase: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: { normal: { prefixes: [], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const emptyData: PatchData = { patch: 't', mods: new Map(), bases: new Map() };
const p = (id: string, fractured = false): PlacedMod => ({ modId: id, tierName: 't', ...(fractured ? { fractured: true } : {}) });

// Item: P1 (fractured prefix), P2 (prefix), S1 (suffix) → 3 mods, 1 fractured, 2 removable.
const item: ItemState = {
  base: dummyBase, level: 100, rarity: 'rare',
  prefixes: [p('P1', true), p('P2')], suffixes: [p('S1')],
};

describe('fractured mods — annul', () => {
  it('never removes a fractured mod (P=0)', () => {
    expect(annulProbability(emptyData, item, 'P1')).toBe(0);
  });
  it('removal is uniform over the 2 NON-fractured mods (1/2, not 1/3)', () => {
    expect(annulProbability(emptyData, item, 'P2')).toBeCloseTo(1 / 2, 12);
    expect(annulProbability(emptyData, item, 'S1')).toBeCloseTo(1 / 2, 12);
  });
  it('sinistral annul: the fractured prefix is excluded, so the one removable prefix goes for sure', () => {
    expect(annulProbability(emptyData, item, 'P2', { omen: 'sinistral' })).toBeCloseTo(1, 12);
    expect(annulProbability(emptyData, item, 'P1', { omen: 'sinistral' })).toBe(0);
  });
});

describe('fractured mods — perfect essence removal', () => {
  it('excludes the fractured mod from the removal pool (removable pf=1, sf=1 → 1/2)', () => {
    expect(perfectEssenceProbability(emptyData, item, 'prefix', 'P2')).toBeCloseTo(1 / 2, 12);
    expect(perfectEssenceProbability(emptyData, item, 'suffix', 'S1')).toBeCloseTo(1 / 2, 12);
  });
  it('never targets the fractured mod (P=0)', () => {
    expect(perfectEssenceProbability(emptyData, item, 'prefix', 'P1')).toBe(0);
  });
  it('with the only removable mod on one side, that side goes for certain (sinistral)', () => {
    // Item [P1 fractured | S1]: the only removable prefix side is... none; removable = {S1}. A dextral
    // (suffix) removal hits S1 for sure; a prefix-side removal has nothing removable.
    const it2: ItemState = { base: dummyBase, level: 100, rarity: 'rare', prefixes: [p('P1', true)], suffixes: [p('S1')] };
    expect(perfectEssenceProbability(emptyData, it2, 'suffix', 'S1', { omen: 'dextral' })).toBeCloseTo(1, 12);
    expect(perfectEssenceProbability(emptyData, it2, 'prefix', 'P1')).toBe(0);
  });
});
