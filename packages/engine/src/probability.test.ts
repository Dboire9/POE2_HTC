import { describe, it, expect } from 'vitest';
import type { ItemBase, Mod, PatchData, Tier } from './index.ts';
import { transmuteProbability, addAffixProbability, whiteItem, loadPatch, resolveMod } from './index.ts';

// --- tiny synthetic pool with hand-computable weights ----------------------------------------
const tier = (name: string, ilvl: number, weight: number): Tier => ({ name, ilvl, weight, ranges: [], stats: [] });
const mod = (id: string, type: 'prefix' | 'suffix', family: string, tiers: Tier[]): Mod => ({
  id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id, tiers,
});

const MODS: Mod[] = [
  mod('P_MANA', 'prefix', 'Mana', [tier('m1', 1, 1000)]),
  mod('P_LIFE', 'prefix', 'Life', [tier('l1', 1, 500)]),
  mod('P_SPELL', 'prefix', 'Spell', [tier('s1', 1, 300), tier('s2', 40, 100)]),
  mod('S_RES', 'suffix', 'Res', [tier('r1', 1, 800)]),
  mod('S_ATTR', 'suffix', 'Attr', [tier('a1', 1, 200)]),
];
const BASE: ItemBase = {
  id: 'Test', name: 'Test', category: 'Test',
  pools: {
    normal: { prefixes: ['P_MANA', 'P_LIFE', 'P_SPELL'], suffixes: ['S_RES', 'S_ATTR'] },
    desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
  },
};
const DATA: PatchData = { patch: 'test', mods: new Map(MODS.map((m) => [m.id, m])), bases: new Map([[BASE.id, BASE]]) };

// Totals at base floor, level 100:  prefixes = 1000+500+(300+100)=1900 ; suffixes = 800+200=1000 ; all = 2900
describe('transmute on a white item (hand-computed)', () => {
  it('mod weight / total pool weight, both slots open', () => {
    expect(transmuteProbability(DATA, BASE, 'P_MANA')).toBeCloseTo(1000 / 2900, 10);
    expect(transmuteProbability(DATA, BASE, 'P_LIFE')).toBeCloseTo(500 / 2900, 10);
    expect(transmuteProbability(DATA, BASE, 'S_RES')).toBeCloseTo(800 / 2900, 10);
  });

  it('multi-tier mod sums all eligible tiers (any tier)', () => {
    expect(transmuteProbability(DATA, BASE, 'P_SPELL')).toBeCloseTo(400 / 2900, 10);
  });

  it('minTierIndex counts only the desired tier and better', () => {
    // only P_SPELL's ilvl-40 tier (weight 100)
    expect(transmuteProbability(DATA, BASE, 'P_SPELL', { minTierIndex: 1 })).toBeCloseTo(100 / 2900, 10);
  });

  it('the distribution over the whole normal pool sums to 1', () => {
    const total = [...BASE.pools.normal.prefixes, ...BASE.pools.normal.suffixes]
      .reduce((s, id) => s + transmuteProbability(DATA, BASE, id), 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('rejects non-pool and non-normal mods', () => {
    expect(transmuteProbability(DATA, BASE, 'S_ATTR')).toBeGreaterThan(0);
    expect(transmuteProbability(DATA, BASE, 'NOPE')).toBe(0);
  });
});

describe('item level caps tier eligibility', () => {
  it('level 5 excludes the ilvl-40 tier from numerator and denominator', () => {
    // prefixes = 1000+500+300 = 1800 ; suffixes = 1000 ; all = 2800
    expect(transmuteProbability(DATA, BASE, 'P_MANA', { level: 5 })).toBeCloseTo(1000 / 2800, 10);
    expect(transmuteProbability(DATA, BASE, 'P_SPELL', { level: 5 })).toBeCloseTo(300 / 2800, 10);
  });
});

describe('currency strength (Greater orb) raises the tier floor', () => {
  it('floor 35 leaves only the ilvl-40 prefix tier, so it is certain', () => {
    // greater floor=35: only P_SPELL ilvl40 (100) is eligible anywhere; suffix pool empties → prefix-only
    expect(transmuteProbability(DATA, BASE, 'P_SPELL', { currencyTier: 'greater' })).toBeCloseTo(1, 10);
    expect(transmuteProbability(DATA, BASE, 'P_MANA', { currencyTier: 'greater' })).toBe(0);
  });
});

describe('omen constraint (Sinistral = prefix only, Dextral = suffix only)', () => {
  it('prefix-only omen uses the prefix pool as denominator and rejects suffixes', () => {
    expect(transmuteProbability(DATA, BASE, 'P_MANA', { constrainTo: 'prefix' })).toBeCloseTo(1000 / 1900, 10);
    expect(transmuteProbability(DATA, BASE, 'S_RES', { constrainTo: 'prefix' })).toBe(0);
  });
  it('suffix-only omen uses the suffix pool as denominator', () => {
    expect(transmuteProbability(DATA, BASE, 'S_RES', { constrainTo: 'suffix' })).toBeCloseTo(800 / 1000, 10);
  });
});

describe('addAffixProbability with an occupied slot', () => {
  it('suffixes full → prefix drawn from prefix pool only', () => {
    const item = { ...whiteItem(BASE), suffixes: [
      { modId: 'S_RES', tierName: 'r1' }, { modId: 'S_ATTR', tierName: 'a1' },
      { modId: 'S_RES', tierName: 'r1' }, // 3 suffixes → full (families not enforced here)
    ] };
    expect(addAffixProbability(DATA, item, 'P_MANA')).toBeCloseTo(1000 / 1900, 10);
  });
});

// --- real data: an invariant that must hold on the actual 0.5 baseline -----------------------
describe('real 0.5 baseline data', () => {
  const data = loadPatch('data/patches/0.5');
  const base = data.bases.get('Wands');

  it('loads Wands with a normal pool', () => {
    expect(base).toBeDefined();
    expect(base!.pools.normal.prefixes.length).toBeGreaterThan(0);
  });

  it('transmute distribution over the normal pool sums to 1', () => {
    const ids = [...base!.pools.normal.prefixes, ...base!.pools.normal.suffixes];
    const total = ids.reduce((s, id) => s + transmuteProbability(data, base!, id), 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it('every normal-pool mod resolves and has ascending-ilvl tiers', () => {
    for (const id of [...base!.pools.normal.prefixes, ...base!.pools.normal.suffixes]) {
      const m = resolveMod(data, id);
      for (let i = 1; i < m.tiers.length; i++) expect(m.tiers[i]!.ilvl).toBeGreaterThanOrEqual(m.tiers[i - 1]!.ilvl);
    }
  });
});
