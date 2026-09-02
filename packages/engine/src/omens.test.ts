import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod } from './index.ts';
import {
  annulProbability, chaosProbability, chaosRemovalProbability, desecrationBossProbability,
  desecrationProbability, exaltProbability, lowestLevelMods, perfectEssenceProbability,
} from './index.ts';

// SPEC Phase-1 omen sub-step, step 2: "Port each omen as a pool/outcome transformation with its own
// unit test on a synthetic pool ... One test per omen, no exceptions." One synthetic base drives
// every case; each expectation is hand-computed from the pool weights/counts below.
//
// Synthetic base S — weights chosen so totals are round:
//   normal prefixes : NP1(Fp1,20) NP2(Fp2,30)                         → normal prefix total 50
//   normal suffixes : NS1(Fs1,10) NS2(Fs2,40)                         → normal suffix total 50
//   desecr prefixes : DPk1(kurgal,10) DPk2(kurgal,10) DPa1(amanamu,30)→ des prefix total 50 (kurgal×2, amanamu×1)
//   desecr suffixes : DSu1(ulaman,10) DSu2(ulaman,10) DSu3(ulaman,30) → des suffix total 50 (ulaman×3)
//   combined prefix total = 100, combined suffix total = 100
const mod = (
  id: string, type: 'prefix' | 'suffix', source: 'normal' | 'desecrated', family: string, weight: number, tags: string[] = [],
): Mod => ({
  id, source, type, family, tags, text: null,
  tiers: [{ name: 't1', ilvl: 1, weight, ranges: [] }],
});

const mods = new Map<string, Mod>([
  ['NP1', mod('NP1', 'prefix', 'normal', 'Fp1', 20)],
  ['NP2', mod('NP2', 'prefix', 'normal', 'Fp2', 30)],
  ['NS1', mod('NS1', 'suffix', 'normal', 'Fs1', 10)],
  ['NS2', mod('NS2', 'suffix', 'normal', 'Fs2', 40)],
  ['DPk1', mod('DPk1', 'prefix', 'desecrated', 'Fdpk1', 10, ['kurgal_mod'])],
  ['DPk2', mod('DPk2', 'prefix', 'desecrated', 'Fdpk2', 10, ['kurgal_mod'])],
  ['DPa1', mod('DPa1', 'prefix', 'desecrated', 'Fdpa1', 30, ['amanamu_mod'])],
  ['DSu1', mod('DSu1', 'suffix', 'desecrated', 'Fdsu1', 10, ['ulaman_mod'])],
  ['DSu2', mod('DSu2', 'suffix', 'desecrated', 'Fdsu2', 10, ['ulaman_mod'])],
  ['DSu3', mod('DSu3', 'suffix', 'desecrated', 'Fdsu3', 30, ['ulaman_mod'])],
]);
const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: {
    normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1', 'NS2'] },
    desecrated: { prefixes: ['DPk1', 'DPk2', 'DPa1'], suffixes: ['DSu1', 'DSu2', 'DSu3'] },
    essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = { patch: 't', mods, bases: new Map([['S', base]]) };
const placed = (id: string): PlacedMod => ({ modId: id, tierName: 't1' });
const empty = (rarity: ItemState['rarity'] = 'rare'): ItemState => ({ base, level: 100, rarity, prefixes: [], suffixes: [] });

describe('omens — one hand-computed unit test per omen (SPEC Phase-1 sub-step)', () => {
  // 1 — Sinistral Exaltation: exalt confined to prefixes → weight / normal-prefix-total
  it('OmenofSinistralExaltation → NP1 = 20/50', () => {
    expect(exaltProbability(data, empty(), 'NP1', { constrainTo: 'prefix' })).toBeCloseTo(20 / 50, 12);
    expect(exaltProbability(data, empty(), 'NS1', { constrainTo: 'prefix' })).toBe(0); // a suffix can't appear
  });

  // 2 — Dextral Exaltation: exalt confined to suffixes
  it('OmenofDextralExaltation → NS2 = 40/50', () => {
    expect(exaltProbability(data, empty(), 'NS2', { constrainTo: 'suffix' })).toBeCloseTo(40 / 50, 12);
    expect(exaltProbability(data, empty(), 'NP1', { constrainTo: 'suffix' })).toBe(0);
  });

  // 3 — Greater Exaltation: multi-affix (+1 extra mod). No single-step probability in the engine yet;
  // it's a compound of two draws handled at the beam-search layer (Phase 2). Tracked, not skipped.
  it.todo('OmenofGreaterExaltation → deferred to Phase-2 beam search (multi-affix compound)');

  // 4 — Sinistral Annulment: remove a uniformly-random prefix (1/prefixes)
  it('OmenofSinistralAnnulment → 1/2 on a 2-prefix item', () => {
    const item: ItemState = { base, level: 100, rarity: 'rare', prefixes: [placed('NP1'), placed('NP2')], suffixes: [placed('NS1')] };
    expect(annulProbability(data, item, 'NP1', { omen: 'sinistral' })).toBeCloseTo(1 / 2, 12);
    expect(annulProbability(data, item, 'NS1', { omen: 'sinistral' })).toBe(0); // suffix untouched
  });

  // 5 — Dextral Annulment: remove a uniformly-random suffix (1/suffixes)
  it('OmenofDextralAnnulment → 1/1 on a 1-suffix item', () => {
    const item: ItemState = { base, level: 100, rarity: 'rare', prefixes: [placed('NP1'), placed('NP2')], suffixes: [placed('NS1')] };
    expect(annulProbability(data, item, 'NS1', { omen: 'dextral' })).toBeCloseTo(1 / 1, 12);
    expect(annulProbability(data, item, 'NP1', { omen: 'dextral' })).toBe(0);
  });

  // 6 — Omen of Light: remove a desecrated mod with certainty on a desecrated item
  it('OmenofLight → 1 on a desecrated mod of a desecrated item, else 0', () => {
    const desItem: ItemState = { base, level: 100, rarity: 'rare', prefixes: [placed('DPk1'), placed('NP1')], suffixes: [], desecrated: true };
    expect(annulProbability(data, desItem, 'DPk1', { omen: 'light' })).toBe(1);
    expect(annulProbability(data, desItem, 'NP1', { omen: 'light' })).toBe(0); // not a desecrated mod
  });

  // 7 — Sinistral Crystallisation: perfect essence removes only a prefix (1/prefixes)
  it('OmenofSinistralCrystallisation → 1/2 removing a prefix', () => {
    const item: ItemState = { base, level: 100, rarity: 'rare', prefixes: [placed('NP1'), placed('NP2')], suffixes: [placed('NS1')] };
    expect(perfectEssenceProbability(data, item, 'prefix', 'NP1', { omen: 'sinistral' })).toBeCloseTo(1 / 2, 12);
    expect(perfectEssenceProbability(data, item, 'prefix', 'NS1', { omen: 'sinistral' })).toBe(0);
  });

  // 8 — Dextral Crystallisation: perfect essence removes only a suffix (1/suffixes)
  it('OmenofDextralCrystallisation → 1/1 removing a suffix', () => {
    const item: ItemState = { base, level: 100, rarity: 'rare', prefixes: [placed('NP1'), placed('NP2')], suffixes: [placed('NS1')] };
    expect(perfectEssenceProbability(data, item, 'suffix', 'NS1', { omen: 'dextral' })).toBeCloseTo(1 / 1, 12);
    expect(perfectEssenceProbability(data, item, 'suffix', 'NP1', { omen: 'dextral' })).toBe(0);
  });

  // 9 — Dextral Necromancy: default desecration confined to suffixes → weight / combined-suffix-total
  it('OmenofDextralNecromancy → DSu1 = 10/100', () => {
    expect(desecrationProbability(data, empty(), 'DSu1', { constrainTo: 'suffix' })).toBeCloseTo(10 / 100, 12);
    expect(desecrationProbability(data, empty(), 'DPk1', { constrainTo: 'suffix' })).toBe(0);
  });

  // 10 — Sinistral Necromancy: default desecration confined to prefixes → weight / combined-prefix-total
  it('OmenofSinistralNecromancy → DPk1 = 10/100', () => {
    expect(desecrationProbability(data, empty(), 'DPk1', { constrainTo: 'prefix' })).toBeCloseTo(10 / 100, 12);
    expect(desecrationProbability(data, empty(), 'DSu1', { constrainTo: 'prefix' })).toBe(0);
  });

  // 11 — Blackblooded (Kurgal): 1 / (kurgal desecrated mods of the slot) = 1/2 (DPk1,DPk2)
  it('OmenoftheBlackblooded → DPk1 = 1/2', () => {
    expect(desecrationBossProbability(data, empty(), 'DPk1', { omen: 'blackblooded' })).toBeCloseTo(1 / 2, 12);
    expect(desecrationBossProbability(data, empty(), 'DPa1', { omen: 'blackblooded' })).toBe(0); // amanamu, not kurgal
  });

  // 12 — Liege (Amanamu): 1 / (amanamu desecrated mods of the slot) = 1/1 (DPa1)
  it('OmenoftheLiege → DPa1 = 1/1', () => {
    expect(desecrationBossProbability(data, empty(), 'DPa1', { omen: 'liege' })).toBeCloseTo(1 / 1, 12);
    expect(desecrationBossProbability(data, empty(), 'DPk1', { omen: 'liege' })).toBe(0);
  });

  // 13 — Sovereign (Ulaman): 1 / (ulaman desecrated mods of the slot) = 1/3 (DSu1,DSu2,DSu3)
  it('OmenoftheSovereign → DSu1 = 1/3', () => {
    expect(desecrationBossProbability(data, empty(), 'DSu1', { omen: 'sovereign' })).toBeCloseTo(1 / 3, 12);
    expect(desecrationBossProbability(data, empty(), 'DPk1', { omen: 'sovereign' })).toBe(0);
  });
});

// --- catalog consistency: omens.json is the source of truth; keep it honest --------------------
interface OmenEntry { id: string; impl: { fn: string; option?: unknown } | null; verified: boolean; deferred?: string; }
interface OmensFile { count: number; omens: OmenEntry[]; }
const catalog = JSON.parse(readFileSync('data/patches/0.5/omens.json', 'utf8')) as OmensFile;
const ENGINE_FNS = new Set([
  'exaltProbability', 'annulProbability', 'perfectEssenceProbability',
  'desecrationProbability', 'desecrationBossProbability',
]);

describe('omens.json catalog', () => {
  it('count matches the omen list', () => {
    expect(catalog.omens.length).toBe(catalog.count);
    expect(catalog.count).toBe(13);
  });
  it('every verified omen maps to a real engine function; unverified ones are explicitly deferred', () => {
    for (const o of catalog.omens) {
      if (o.verified) {
        expect(o.impl, o.id).not.toBeNull();
        expect(ENGINE_FNS.has(o.impl!.fn), `${o.id} → ${o.impl!.fn}`).toBe(true);
      } else {
        expect(o.deferred, o.id).toBeTruthy();
      }
    }
  });
  it('exactly one omen (Greater Exaltation) is deferred', () => {
    const deferred = catalog.omens.filter((o) => !o.verified);
    expect(deferred.map((o) => o.id)).toEqual(['OmenofGreaterExaltation']);
  });
});

// --- Omen of Whittling: a CHAOS omen that removes the lowest-LEVEL modifier ---------------------
// Traced to poe2db 2026-09-02: "your next Chaos Orb will remove the lowest level modifier", internal
// id OmenOnChaosLowestLevelMod. TODO 12 specified it as an ANNULMENT omen removing the lowest TIER;
// both halves of that were wrong, and modelling it that way would have priced a mechanic the game
// does not have. Tier numbers are also not comparable across mods — a T5 of a five-tier mod is its
// worst roll, a T5 of a ten-tier mod is mid-range — so only item level gives one scale for the item.
describe('Omen of Whittling — a Chaos Orb removes the lowest-level modifier', () => {
  const tier = (name: string, ilvl: number) => ({ name, ilvl, weight: 100, ranges: [] });
  // Three mods, each with tiers at distinct ilvls so a placed tier names a distinct level.
  const mod = (id: string, type: 'prefix' | 'suffix', family: string): Mod =>
    ({ id, source: 'normal', type, family, tags: [], text: null,
       tiers: [tier('low', 10), tier('mid', 40), tier('high', 70)] });
  const base: ItemBase = {
    id: 'B', name: 'B', category: 'C',
    pools: {
      normal: { prefixes: ['P1', 'P2'], suffixes: ['S1'] },
      desecrated: { prefixes: [], suffixes: [] },
      essence: { prefixes: [], suffixes: [] },
    },
  };
  const data: PatchData = {
    patch: 't',
    mods: new Map([
      ['P1', mod('P1', 'prefix', 'Fa')], ['P2', mod('P2', 'prefix', 'Fb')], ['S1', mod('S1', 'suffix', 'Fs')],
    ]),
    bases: new Map([['B', base]]),
  };
  // P1 at ilvl 70, P2 at 40, S1 at 10 — S1 is the unique lowest level.
  const item: ItemState = {
    base, level: 100, rarity: 'rare',
    prefixes: [{ modId: 'P1', tierName: 'high' }, { modId: 'P2', tierName: 'mid' }],
    suffixes: [{ modId: 'S1', tierName: 'low' }],
  };

  it('names the unique lowest-level mod', () => {
    expect(lowestLevelMods(data, item)).toEqual(['S1']);
  });

  it('removes that mod with P=1, and any other with P=0', () => {
    expect(chaosRemovalProbability(data, item, 'S1', 'whittling')).toBe(1);
    expect(chaosRemovalProbability(data, item, 'P2', 'whittling')).toBe(0);
    expect(chaosRemovalProbability(data, item, 'P1', 'whittling')).toBe(0);
  });

  it('without the omen the removal is uniform over all three', () => {
    for (const id of ['P1', 'P2', 'S1']) {
      expect(chaosRemovalProbability(data, item, id, 'none')).toBeCloseTo(1 / 3, 12);
    }
  });

  it('splits a tie uniformly — the one piece of this that is assumed, not traced', () => {
    const tied: ItemState = { ...item, prefixes: [{ modId: 'P1', tierName: 'low' }, { modId: 'P2', tierName: 'mid' }] };
    expect(lowestLevelMods(data, tied).sort()).toEqual(['P1', 'S1']);
    expect(chaosRemovalProbability(data, tied, 'P1', 'whittling')).toBeCloseTo(1 / 2, 12);
    expect(chaosRemovalProbability(data, tied, 'S1', 'whittling')).toBeCloseTo(1 / 2, 12);
    expect(chaosRemovalProbability(data, tied, 'P2', 'whittling')).toBe(0);
  });

  it('a fractured mod is never whittled, even when it is the lowest level', () => {
    const frac: ItemState = { ...item, suffixes: [{ modId: 'S1', tierName: 'low', fractured: true }] };
    // S1 is excluded from the removal pool entirely, so the lowest REMOVABLE level is P2's.
    expect(lowestLevelMods(data, frac)).toEqual(['P2']);
    expect(chaosRemovalProbability(data, frac, 'S1', 'whittling')).toBe(0);
    expect(chaosRemovalProbability(data, frac, 'P2', 'whittling')).toBe(1);
  });

  it('flows through chaosProbability: the omen changes the removal factor only', () => {
    // Removing S1 frees the suffix side; the add is whatever the pool allows, unchanged by the omen.
    const plain = chaosProbability(data, item, 'S1', 'S1');
    const whittled = chaosProbability(data, item, 'S1', 'S1', { omen: 'whittling' });
    expect(plain).toBeGreaterThan(0);
    expect(whittled).toBeCloseTo(plain * 3, 12); // 1 instead of 1/3 on the removal
  });
});
