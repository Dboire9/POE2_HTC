import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod } from './index.ts';
import { essenceForcedProbability, loadPatch, perfectEssenceProbability } from './index.ts';

// --- hand-computed: perfect-essence remove-and-add (synthetic; needs only placed mods) ----------
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

describe('perfect essence — hand-computed remove probability', () => {
  it('none: both sides non-empty → 1 / total mods, regardless of essence slot', () => {
    for (const et of ['prefix', 'suffix'] as const)
      for (const id of ['P1', 'P2', 'S1'])
        expect(perfectEssenceProbability(emptyData, item2p1s, et, id)).toBeCloseTo(1 / 3, 12);
  });

  it('none: prefix essence with no suffixes → 1 / prefixes (removal confined to prefixes)', () => {
    const p2: ItemState = { base: dummyBase, level: 100, rarity: 'magic', prefixes: [placed('P1'), placed('P2')], suffixes: [] };
    expect(perfectEssenceProbability(emptyData, p2, 'prefix', 'P1')).toBeCloseTo(1 / 2, 12);
    // suffix essence on the same item: no prefixes-empty special case → 1 / (pf+sf) = 1/2 here anyway
    expect(perfectEssenceProbability(emptyData, p2, 'suffix', 'P1')).toBeCloseTo(1 / 2, 12);
  });

  it('none: suffix essence with no prefixes → 1 / suffixes', () => {
    const s3: ItemState = { base: dummyBase, level: 100, rarity: 'rare', prefixes: [], suffixes: [placed('S1'), placed('S2'), placed('S3')] };
    expect(perfectEssenceProbability(emptyData, s3, 'suffix', 'S1')).toBeCloseTo(1 / 3, 12);
    expect(perfectEssenceProbability(emptyData, s3, 'prefix', 'S1')).toBeCloseTo(1 / 3, 12);
  });

  it('sinistral removes only a prefix (1 / prefixes), 0 for a suffix target', () => {
    expect(perfectEssenceProbability(emptyData, item2p1s, 'prefix', 'P1', { omen: 'sinistral' })).toBeCloseTo(1 / 2, 12);
    expect(perfectEssenceProbability(emptyData, item2p1s, 'suffix', 'S1', { omen: 'sinistral' })).toBe(0);
  });

  it('dextral removes only a suffix (1 / suffixes), 0 for a prefix target', () => {
    expect(perfectEssenceProbability(emptyData, item2p1s, 'suffix', 'S1', { omen: 'dextral' })).toBeCloseTo(1 / 1, 12);
    expect(perfectEssenceProbability(emptyData, item2p1s, 'prefix', 'P1', { omen: 'dextral' })).toBe(0);
  });

  it('a mod not on the item → 0', () => {
    expect(perfectEssenceProbability(emptyData, item2p1s, 'prefix', 'NOPE')).toBe(0);
  });
});

// --- essenceForcedProbability: the guaranteed add is deterministic (P = 1 when legal) -----------
describe('essence forced add — deterministic', () => {
  const mod = (id: string, type: 'prefix' | 'suffix', family: string, ilvl: number): Mod =>
    ({ id, source: 'essence', type, family, tags: [], text: null,
       tiers: [{ name: 't1', ilvl, weight: 1, ranges: [] }] });
  const pf = mod('FP', 'prefix', 'Fp', 1);
  const sf = mod('FS', 'suffix', 'Fs', 1);
  const highIlvl = mod('FH', 'prefix', 'Fh', 84);
  const data: PatchData = { patch: 't', mods: new Map([['FP', pf], ['FS', sf], ['FH', highIlvl]]), bases: new Map() };

  // Regular essences apply only to MAGIC items (adding the mod, converting to Rare).
  const item = (prefixes: PlacedMod[], suffixes: PlacedMod[], level = 100): ItemState =>
    ({ base: dummyBase, level, rarity: 'magic', prefixes, suffixes });

  it('forces the mod with certainty when its side is open and family is free', () => {
    expect(essenceForcedProbability(data, item([], []), 'FP')).toBe(1);
    expect(essenceForcedProbability(data, item([], []), 'FS')).toBe(1);
  });
  it('0 unless the item is Magic (never white or already-Rare)', () => {
    const at = (rarity: ItemState['rarity']): ItemState => ({ base: dummyBase, level: 100, rarity, prefixes: [], suffixes: [] });
    expect(essenceForcedProbability(data, at('normal'), 'FP')).toBe(0);
    expect(essenceForcedProbability(data, at('rare'), 'FP')).toBe(0);
    expect(essenceForcedProbability(data, at('magic'), 'FP')).toBe(1);
  });
  it('0 when the mod side is full', () => {
    const full = item([placed('a'), placed('b'), placed('c')], []);
    expect(essenceForcedProbability(data, full, 'FP')).toBe(0);
  });
  it('0 when the family is already present', () => {
    // place a mod of family 'Fp' by reusing FP's family through a stand-in in data
    const clash = mod('FPx', 'prefix', 'Fp', 1);
    const d2: PatchData = { patch: 't', mods: new Map([...data.mods, ['FPx', clash]]), bases: new Map() };
    expect(essenceForcedProbability(d2, item([placed('FPx')], []), 'FP')).toBe(0);
  });
  it('0 when the lowest tier is above the item level', () => {
    expect(essenceForcedProbability(data, item([], [], 80), 'FH')).toBe(0);
    expect(essenceForcedProbability(data, item([], [], 84), 'FH')).toBe(1);
  });
  it('the essence level (tier index) selects which level’s ilvl gate applies', () => {
    // An essence mod's tiers ARE its levels: Lesser ilvl 8, Normal ilvl 33, Greater ilvl 60.
    const leveled: Mod = { id: 'FL', source: 'essence', type: 'prefix',       family: 'Fl', tags: [], text: null, tiers: [
        { name: 'Lesser Essence', ilvl: 8, weight: 1, ranges: [] },
        { name: 'Essence', ilvl: 33, weight: 1, ranges: [] },
        { name: 'Greater Essence', ilvl: 60, weight: 1, ranges: [] },
      ] };
    const d3: PatchData = { patch: 't', mods: new Map([['FL', leveled]]), bases: new Map() };
    // Greater (index 2, ilvl 60) is out of reach at level 50 but fine at 60; Lesser (default) is fine at 50.
    expect(essenceForcedProbability(d3, item([], [], 50), 'FL')).toBe(1);      // default → Lesser
    expect(essenceForcedProbability(d3, item([], [], 50), 'FL', 2)).toBe(0);   // Greater gated out
    expect(essenceForcedProbability(d3, item([], [], 60), 'FL', 2)).toBe(1);   // Greater now legal
    expect(essenceForcedProbability(d3, item([], [], 32), 'FL', 1)).toBe(0);   // Normal needs ilvl 33
  });
  it('0 for an unknown mod id', () => {
    expect(essenceForcedProbability(data, item([], []), 'NOPE')).toBe(0);
  });
});

// --- differential vs Java (EssenceProbe) --------------------------------------------------------
interface Scenario { name: string; base: string; placed: string[]; }
type OmenVals = { none: number; sinistral: number; dextral: number };
interface Fixture { patch: string; scenarios: Record<string, Record<'prefix' | 'suffix', Record<string, OmenVals>>>; }
const DIR = 'packages/engine/src/__fixtures__';
const scenarios = (JSON.parse(readFileSync(`${DIR}/scenarios.json`, 'utf8')) as { scenarios: Scenario[] }).scenarios;
const fixture = JSON.parse(readFileSync(`${DIR}/essence-java.json`, 'utf8')) as Fixture;
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

describe('perfect essence — TS vs Java differential', () => {
  for (const sc of scenarios) {
    const byType = fixture.scenarios[sc.name];
    if (!byType) continue; // scenarios with no placed mods aren't relevant
    describe(sc.name, () => {
      const item = buildItem(sc);
      for (const essenceType of ['prefix', 'suffix'] as const) {
        for (const [targetId, v] of Object.entries(byType[essenceType])) {
          it(`${essenceType} essence, remove ${targetId} (none/sinistral/dextral)`, () => {
            expect(perfectEssenceProbability(data, item, essenceType, targetId, { omen: 'none' })).toBeCloseTo(v.none, 12);
            expect(perfectEssenceProbability(data, item, essenceType, targetId, { omen: 'sinistral' })).toBeCloseTo(v.sinistral, 12);
            expect(perfectEssenceProbability(data, item, essenceType, targetId, { omen: 'dextral' })).toBeCloseTo(v.dextral, 12);
          });
        }
      }
    });
  }
});
