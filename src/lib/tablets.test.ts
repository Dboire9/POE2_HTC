import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/index.ts';
import { ODDS_CREDIT, listTablets, ruledOutBy, searchIsLoose, tradeStatsFor, watchList } from './tablets';

const data = loadPatch('data/patches/0.5.0');
const tablets = listTablets(data);
const ritual = tablets.find((t) => t.id === 'Tablets_ritual')!;

describe('the tablets the tab offers', () => {
  it('is Ritual, Overseer and Temple, each with the modifiers it can roll', () => {
    expect(tablets.map((t) => t.name)).toEqual(['Ritual Tablet', 'Overseer Tablet', 'Temple Tablet']);
    expect(ritual.prefixes).toHaveLength(13);
    expect(ritual.suffixes).toHaveLength(20);
  });

  it('gives each modifier its share of the rolls on its side, commonest first', () => {
    for (const side of [ritual.prefixes, ritual.suffixes]) {
      expect(side.reduce((s, m) => s + m.share, 0)).toBeCloseTo(1, 12);
      expect([...side].sort((a, b) => b.share - a.share)).toEqual(side);
    }
    // Bountiful is one of the four commonest prefixes (weight 1000 of 7150).
    expect(ritual.prefixes[0]!.share).toBeCloseTo(1000 / 7150, 12);
  });

  it('carries how often each modifier was actually seen, for the ones read from few sightings', () => {
    const undertaking = ritual.suffixes.find((m) => m.id === 'Tablets/MapAdditionalModifier')!;
    expect(undertaking.seen).toBe(54);
    expect(ritual.prefixes[0]!.seen).toBeGreaterThan(1000);
  });

  it('credits the rolling data it rests on', () => {
    expect(ODDS_CREDIT.who).toBe('Morce Faster');
    expect(ODDS_CREDIT.rolls).toBe(19_147);
  });
});

describe('what one pick rules out', () => {
  it('rules out the same family on the OTHER side — the three tablet pairs', () => {
    const out = ruledOutBy(data, ['Tablets/MapAdditionalEssence']);
    expect(out.has('Tablets/MapAdditionalEssenceChance')).toBe(true);
    expect(out.get('Tablets/MapAdditionalEssenceChance')).toMatch(/one of these at a time/);
    expect(out.has('Tablets/MapDroppedGoldIncrease')).toBe(false);
  });

  it('rules out the same family on the same side, and never the pick itself', () => {
    const out = ruledOutBy(data, ['Tablets/MapAdditionalShrineChance']);
    expect(out.has('Tablets/MapAdditionalShrine')).toBe(true);
    expect(out.has('Tablets/MapAdditionalShrineChance')).toBe(false);
  });
});

describe('the watch list and its searches', () => {
  it('leaves out an entry the player already asked for', () => {
    // Nothing is curated yet, so this holds by construction; it is the rule a list must obey once one is.
    const all = watchList('Tablets_ritual', []);
    const some = watchList('Tablets_ritual', all[0]?.mods ?? []);
    expect(some).toEqual(all.filter((e) => e !== all[0]));
  });

  it('gives a search the ids for every modifier it knows, and skips what it does not', () => {
    const stats = tradeStatsFor(['Tablets/MapDroppedGoldIncrease', 'not-a-mod']);
    expect(stats).toHaveLength(1);
    expect(stats[0]!.ids.every((id) => id.startsWith('explicit.stat_'))).toBe(true);
  });

  it('says when a search would also list a near-identical modifier', () => {
    expect(searchIsLoose(['Tablets/MapDroppedGoldIncrease'])).toBe(true); // two spellings share the id set
    expect(searchIsLoose(['Tablets/RitualOmenChance'])).toBe(false);
  });
});
