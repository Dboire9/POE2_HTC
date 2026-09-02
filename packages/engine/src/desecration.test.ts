import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod } from './index.ts';
import {
  desecrationBossAnySideProbability, desecrationBossProbability, desecrationProbability, loadPatch,
} from './index.ts';

const data: PatchData = loadPatch('data/patches/0.5');
const rare = (baseId: string): ItemState =>
  ({ base: data.bases.get(baseId)!, level: 100, rarity: 'rare', prefixes: [], suffixes: [] });

// --- hand-computed on the 0.5 baseline (Amulets has all three boss pools on both slots) ---------
describe('desecration boss omen — hand-computed', () => {
  const amulet = rare('Amulets');

  it('a boss omen picks uniformly among that boss\'s desecrated mods of the slot', () => {
    // Amulets amanamu prefixes = 4 → 1/4; amanamu suffixes = 6 → 1/6 (from the pool tag counts).
    const amanamuPrefix = 'Amulets/DESECRATED_GLOBAL_DEFENCES';       // amanamu-tagged prefix
    const amanamuSuffix = 'Amulets/DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY'; // amanamu suffix
    expect(desecrationBossProbability(data, amulet, amanamuPrefix, { omen: 'liege' })).toBeCloseTo(1 / 4, 12);
    expect(desecrationBossProbability(data, amulet, amanamuSuffix, { omen: 'liege' })).toBeCloseTo(1 / 6, 12);
  });

  it('0 when the mod does not carry the omen\'s boss tag', () => {
    // An amanamu mod queried under the Kurgal (blackblooded) / Ulaman (sovereign) omens → 0.
    const amanamuPrefix = 'Amulets/DESECRATED_GLOBAL_DEFENCES';
    expect(desecrationBossProbability(data, amulet, amanamuPrefix, { omen: 'blackblooded' })).toBe(0);
    expect(desecrationBossProbability(data, amulet, amanamuPrefix, { omen: 'sovereign' })).toBe(0);
  });

  it('0 for an unknown mod id', () => {
    expect(desecrationBossProbability(data, amulet, 'NOPE', { omen: 'liege' })).toBe(0);
  });
});

// --- D8: WITHOUT a Necromancy side omen the boss draw spans BOTH sides ---------------------------
// The per-slot 1/N above is what a Desecration yields once a Sinistral/Dextral Necromancy omen has
// locked it to one side. Unconstrained, every one of that boss's mods is a candidate regardless of
// side, so the denominator is the whole boss pool. Amulets/amanamu = 4 prefixes + 6 suffixes, which
// makes the two models plainly distinguishable (1/4 or 1/6 constrained vs 1/10 unconstrained).
describe('desecration boss omen, unconstrained (D8) — hand-computed', () => {
  const amulet = rare('Amulets');
  const amanamuPrefix = 'Amulets/DESECRATED_GLOBAL_DEFENCES';                              // family AllDefences
  const amanamuSuffix = 'Amulets/DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY';
  const otherAmanamuPrefix = 'Amulets/DESECRATED_REMNANT_EFFECT';                          // family RemnantEffect

  it('draws 1-of-10 across both sides, where the side-locked draw would be 1/4 or 1/6', () => {
    expect(desecrationBossAnySideProbability(data, amulet, amanamuPrefix, { omen: 'liege' })).toBeCloseTo(1 / 10, 12);
    expect(desecrationBossAnySideProbability(data, amulet, amanamuSuffix, { omen: 'liege' })).toBeCloseTo(1 / 10, 12);
    // …and the constrained figures it replaces, for contrast.
    expect(desecrationBossProbability(data, amulet, amanamuPrefix, { omen: 'liege' })).toBeCloseTo(1 / 4, 12);
    expect(desecrationBossProbability(data, amulet, amanamuSuffix, { omen: 'liege' })).toBeCloseTo(1 / 6, 12);
  });

  it('an occupied family shrinks the denominator (that candidate can no longer be drawn)', () => {
    // Put one amanamu prefix on the item: its family is taken, so it drops out of the pool and the
    // remaining 9 candidates each get 1/9 rather than 1/10.
    const withOne: ItemState = {
      ...amulet, prefixes: [{ modId: otherAmanamuPrefix, tierName: data.mods.get(otherAmanamuPrefix)!.tiers[0]!.name }],
    };
    expect(desecrationBossAnySideProbability(data, withOne, amanamuPrefix, { omen: 'liege' })).toBeCloseTo(1 / 9, 12);
    // The mod already on the item can't be drawn again at all.
    expect(desecrationBossAnySideProbability(data, withOne, otherAmanamuPrefix, { omen: 'liege' })).toBe(0);
  });

  it('0 when the mod lacks the boss tag, and 0 once its own side is full', () => {
    expect(desecrationBossAnySideProbability(data, amulet, amanamuPrefix, { omen: 'blackblooded' })).toBe(0);
    const p = (id: string): PlacedMod => ({ modId: id, tierName: data.mods.get(id)!.tiers[0]!.name });
    const fullPrefixes: ItemState = {
      ...amulet,
      prefixes: [p('Amulets/DESECRATED_REMNANT_EFFECT'), p('Amulets/DESECRATED_BODY_ARMOUR_FROM_BODY_ARMOUR'),
                 p('Amulets/DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY')],
    };
    expect(desecrationBossAnySideProbability(data, fullPrefixes, amanamuPrefix, { omen: 'liege' })).toBe(0);
  });
});

// --- default (no-boss-omen) desecration: combined normal ∪ desecrated pool, by weight -----------
// Synthetic base: prefix pool = N1(w10, normal) + D1(w30, desecrated); suffix pool = N2(w60, normal).
describe('desecration default (combined pool) — hand-computed', () => {
  const mod = (id: string, type: 'prefix' | 'suffix', source: 'normal' | 'desecrated', family: string, weight: number): Mod =>
    ({ id, source, type, family, tags: [], text: null,
       tiers: [{ name: 't1', ilvl: 1, weight, ranges: [] }] });
  const N1 = mod('N1', 'prefix', 'normal', 'Fn1', 10);
  const D1 = mod('D1', 'prefix', 'desecrated', 'Fd1', 30);
  const N2 = mod('N2', 'suffix', 'normal', 'Fn2', 60);
  const base: ItemBase = {
    id: 'B', name: 'B', category: 'C',
    pools: {
      normal: { prefixes: ['N1'], suffixes: ['N2'] },
      desecrated: { prefixes: ['D1'], suffixes: [] },
      essence: { prefixes: [], suffixes: [] },
    },
  };
  const data: PatchData = { patch: 't', mods: new Map([['N1', N1], ['D1', D1], ['N2', N2]]), bases: new Map([['B', base]]) };
  const placed = (id: string, tier = 't1'): PlacedMod => ({ modId: id, tierName: tier });
  const item = (prefixes: PlacedMod[] = [], suffixes: PlacedMod[] = []): ItemState =>
    ({ base, level: 100, rarity: 'rare', prefixes, suffixes });

  it('both slots open → weight / (combined prefix total + combined suffix total)', () => {
    // prefix total = 10+30 = 40, suffix total = 60 → denom 100
    expect(desecrationProbability(data, item(), 'D1')).toBeCloseTo(30 / 100, 12); // desecrated mod
    expect(desecrationProbability(data, item(), 'N1')).toBeCloseTo(10 / 100, 12); // normal mod also reachable
    expect(desecrationProbability(data, item(), 'N2')).toBeCloseTo(60 / 100, 12);
  });

  it('Sinistral/Dextral Necromancy (constrainTo) restricts the denominator to one side', () => {
    expect(desecrationProbability(data, item(), 'D1', { constrainTo: 'prefix' })).toBeCloseTo(30 / 40, 12);
    expect(desecrationProbability(data, item(), 'D1', { constrainTo: 'suffix' })).toBe(0); // D1 is a prefix
    expect(desecrationProbability(data, item(), 'N2', { constrainTo: 'suffix' })).toBeCloseTo(60 / 60, 12);
  });

  it('0 for illegal adds: family already present, side full, or mod not in the base pool', () => {
    expect(desecrationProbability(data, item([placed('N1')]), 'N1')).toBe(0); // family present
    const threePrefix = item([placed('N1'), placed('D1'), placed('N1')]); // 3 prefixes → side full
    expect(desecrationProbability(data, threePrefix, 'N1')).toBe(0);
    expect(desecrationProbability(data, item(), 'NOPE')).toBe(0); // unknown
  });
});

// --- differential vs Java (DesecrationProbe) — the only desecration path Java models --------------
type BossVals = { blackblooded: number; liege: number; sovereign: number };
interface Fixture { patch: string; bases: Record<string, Record<string, BossVals>>; }
const fixture = JSON.parse(
  readFileSync('packages/engine/src/__fixtures__/desecration-java.json', 'utf8'),
) as Fixture;

describe('desecration boss omen — TS vs Java differential', () => {
  for (const [baseId, mods] of Object.entries(fixture.bases)) {
    describe(baseId, () => {
      const item = rare(baseId);
      for (const [modId, v] of Object.entries(mods)) {
        it(`add ${modId} (blackblooded/liege/sovereign)`, () => {
          expect(desecrationBossProbability(data, item, modId, { omen: 'blackblooded' })).toBeCloseTo(v.blackblooded, 12);
          expect(desecrationBossProbability(data, item, modId, { omen: 'liege' })).toBeCloseTo(v.liege, 12);
          expect(desecrationBossProbability(data, item, modId, { omen: 'sovereign' })).toBeCloseTo(v.sovereign, 12);
        });
      }
    });
  }
});
