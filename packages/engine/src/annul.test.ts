import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod } from './index.ts';
import { annulProbability, loadPatch } from './index.ts';

// --- hand-computed on a synthetic item (annul needs no pool data, only the placed mods) ---------
const dummyBase: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: { normal: { prefixes: [], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const emptyData: PatchData = { patch: 't', mods: new Map(), bases: new Map() };
const placed = (id: string): PlacedMod => ({ modId: id, tierName: 't' });
const item2p1s: ItemState = {
  base: dummyBase, level: 100, rarity: 'rare',
  prefixes: [placed('P1'), placed('P2')], suffixes: [placed('S1')],
};

describe('annul — hand-computed', () => {
  it('none removes a uniformly random mod (1 / total)', () => {
    for (const id of ['P1', 'P2', 'S1']) expect(annulProbability(emptyData, item2p1s, id)).toBeCloseTo(1 / 3, 12);
  });
  it('sinistral removes a random prefix (1 / prefixes), 0 for a suffix', () => {
    expect(annulProbability(emptyData, item2p1s, 'P1', { omen: 'sinistral' })).toBeCloseTo(1 / 2, 12);
    expect(annulProbability(emptyData, item2p1s, 'S1', { omen: 'sinistral' })).toBe(0);
  });
  it('dextral removes a random suffix (1 / suffixes), 0 for a prefix', () => {
    expect(annulProbability(emptyData, item2p1s, 'S1', { omen: 'dextral' })).toBeCloseTo(1 / 1, 12);
    expect(annulProbability(emptyData, item2p1s, 'P1', { omen: 'dextral' })).toBe(0);
  });
  it('a mod not on the item → 0', () => {
    expect(annulProbability(emptyData, item2p1s, 'NOPE')).toBe(0);
  });
});

describe('annul — Omen of Light (desecrated only)', () => {
  const des: Mod = {
    id: 'D', group: 'D', field: 'D', source: 'desecrated', type: 'prefix',
    categories: [], family: 'Fd', tags: [], text: null, tiers: [{ name: 't', ilvl: 1, weight: 1, ranges: [], stats: [] }],
  };
  const data: PatchData = { patch: 't', mods: new Map([['D', des]]), bases: new Map() };
  const withDes = (desecrated: boolean): ItemState =>
    ({ base: dummyBase, level: 100, rarity: 'rare', prefixes: [placed('D'), placed('P1')], suffixes: [], desecrated });

  it('light removes a desecrated mod with certainty when the item is desecrated', () => {
    expect(annulProbability(data, withDes(true), 'D', { omen: 'light' })).toBe(1);
  });
  it('light is 0 on a non-desecrated item or a non-desecrated mod', () => {
    expect(annulProbability(data, withDes(false), 'D', { omen: 'light' })).toBe(0);
    expect(annulProbability(data, withDes(true), 'P1', { omen: 'light' })).toBe(0);
  });
});

// --- differential vs Java (AnnulProbe) -------------------------------------------------------
interface Scenario { name: string; base: string; placed: string[]; }
interface Fixture { patch: string; scenarios: Record<string, Record<string, { none: number; sinistral: number; dextral: number }>>; }
const DIR = 'packages/engine/src/__fixtures__';
const scenarios = (JSON.parse(readFileSync(`${DIR}/scenarios.json`, 'utf8')) as { scenarios: Scenario[] }).scenarios;
const fixture = JSON.parse(readFileSync(`${DIR}/annul-java.json`, 'utf8')) as Fixture;
const data = loadPatch('data/patches/0.5');

function buildItem(sc: Scenario): ItemState {
  const base = data.bases.get(sc.base)!;
  const prefixes: PlacedMod[] = [];
  const suffixes: PlacedMod[] = [];
  for (const id of sc.placed) {
    const m = data.mods.get(id)!;
    (m.type === 'prefix' ? prefixes : suffixes).push({ modId: id, tierName: m.tiers[0]!.name });
  }
  return { base, level: 100, rarity: 'rare', prefixes, suffixes };
}

describe('annul — TS vs Java differential', () => {
  for (const sc of scenarios) {
    const probs = fixture.scenarios[sc.name];
    if (!probs) continue; // scenarios with no placed mods aren't annullable
    describe(sc.name, () => {
      const item = buildItem(sc);
      for (const [targetId, v] of Object.entries(probs)) {
        it(`remove ${targetId} (none/sinistral/dextral)`, () => {
          expect(annulProbability(data, item, targetId, { omen: 'none' })).toBeCloseTo(v.none, 12);
          expect(annulProbability(data, item, targetId, { omen: 'sinistral' })).toBeCloseTo(v.sinistral, 12);
          expect(annulProbability(data, item, targetId, { omen: 'dextral' })).toBeCloseTo(v.dextral, 12);
        });
      }
    });
  }
});
