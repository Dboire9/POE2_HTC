import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from './index.ts';
import { DEFAULT_LIMITS, addNormalAffixProbability, limitsOf, prefixesFull, suffixesFull } from './index.ts';

// An item's LIMITS — three a side and one crafted modifier — used to be constants in the engine. They
// are the item's own now, because a socketed rune raises one of them: Serle's Triumph allows a fourth
// suffix, Astrid's Creativity a second crafted modifier.
//
// What has to be pinned is not that `limitsOf` returns the number. It is that the number REACHES the
// probability math: a limit nothing reads is a limit that does nothing, which is exactly what the
// exalt case below would catch.
const mk = (id: string, type: 'prefix' | 'suffix'): Mod => ({
  id, source: 'normal', type, family: id, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: 100, ranges: [] }],
});
const SUFFIXES = ['S1', 'S2', 'S3', 'S4'].map((id) => mk(id, 'suffix'));
const P1 = mk('P1', 'prefix');
const pools = {
  normal: { prefixes: ['P1'], suffixes: ['S1', 'S2', 'S3', 'S4'] },
  desecrated: { prefixes: [], suffixes: [] },
  essence: { prefixes: [], suffixes: [] },
};
const plain: ItemBase = { id: 'B', name: 'B', category: 'C', pools };
/** What a base carrying Serle's Triumph looks like to the engine — see `withRunes`. */
const fourSuffixes: ItemBase = { ...plain, id: 'B4', limits: { prefixes: 3, suffixes: 4, crafted: 2 } };
const data: PatchData = {
  patch: 't',
  mods: new Map([...SUFFIXES, P1].map((m) => [m.id, m])),
  bases: new Map([[plain.id, plain], [fourSuffixes.id, fourSuffixes]]),
};
const rare = (base: ItemBase, ...suffixes: string[]): ItemState => ({
  base, level: 100, rarity: 'rare', prefixes: [],
  suffixes: suffixes.map((modId) => ({ modId, tierName: 't1' })),
});

describe('item limits', () => {
  it('are the game’s own when the base says nothing', () => {
    expect(limitsOf(plain)).toEqual({ prefixes: 3, suffixes: 3, crafted: 1 });
    expect(limitsOf(undefined)).toEqual(DEFAULT_LIMITS);
  });

  it('are the base’s when it carries them', () => {
    expect(limitsOf(fourSuffixes)).toEqual({ prefixes: 3, suffixes: 4, crafted: 2 });
  });

  it('decide when a side is full', () => {
    expect(suffixesFull(rare(plain, 'S1', 'S2', 'S3'))).toBe(true);
    expect(suffixesFull(rare(fourSuffixes, 'S1', 'S2', 'S3'))).toBe(false);
    expect(suffixesFull(rare(fourSuffixes, 'S1', 'S2', 'S3', 'S4'))).toBe(true);
    // The other side keeps its own limit: raising one does not raise both.
    expect(prefixesFull(rare(fourSuffixes))).toBe(false);
  });

  it('reach the probability math: an Exalt fills a fourth suffix only where the base allows one', () => {
    expect(addNormalAffixProbability(data, rare(plain, 'S1', 'S2', 'S3'), 'exalt', 'S4')).toBe(0);
    // Both sides open, one mod free on each, equal weights — so the pool is P1 + S4.
    expect(addNormalAffixProbability(data, rare(fourSuffixes, 'S1', 'S2', 'S3'), 'exalt', 'S4')).toBeCloseTo(0.5, 12);
  });

  it('leave the Magic rung at one per side, whatever the base allows', () => {
    const magic: ItemState = {
      base: fourSuffixes, level: 100, rarity: 'magic', prefixes: [], suffixes: [{ modId: 'S1', tierName: 't1' }],
    };
    expect(addNormalAffixProbability(data, magic, 'augment', 'S2')).toBe(0);
  });
});
