import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/index.ts';
import { familiesOf, resolveMod } from '../../packages/engine/src/pool.ts';
import {
  CURATED, ODDS_CREDIT, WATCH_TIERS, listTablets, ruledOutBy, searchIsLoose, tradeStatsFor, watchList,
  type TabletBase,
} from './tablets';

const data = loadPatch('data/patches/0.5.0');
const tablets = listTablets(data);
const tablet = (id: string): TabletBase => tablets.find((t) => t.id === id)!;
const ritual = tablet('Tablets_ritual');
const overseer = tablet('Tablets_overseer');
const temple = tablet('Tablets_temple');

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

describe('Dorian’s valuable list', () => {
  const curated = WATCH_TIERS.flatMap((tier) => CURATED.tiers[tier]);
  const shown = (t: TabletBase, targets: readonly string[] = []): string[] =>
    watchList(t, targets).map((e) => e.mods.join(' + '));

  it('names each modifier by id AND by what it reads in game, and the two agree', () => {
    // The ids are the game's internal names and can mislead — RitualMagicMonsters is the one that reads
    // "chance to be Rare" — so whoever edits the list writes both, and this holds them together.
    for (const e of curated) {
      expect(e.reads).toHaveLength(e.mods.length);
      e.mods.forEach((id, j) => expect(resolveMod(data, id).text, id).toBe(e.reads[j]));
    }
  });

  it('lists each set once, and only sets one tablet can hold', () => {
    const sets = curated.map((e) => [...e.mods].sort().join(' + '));
    expect(new Set(sets).size).toBe(sets.length);
    for (const e of curated) {
      const families = e.mods.flatMap((id) => familiesOf(resolveMod(data, id)));
      expect(new Set(families).size, `${e.mods.join(' + ')} repeats a family`).toBe(families.length);
      // Every modifier rolls on the tablet, and no more than two land on one side.
      const holds = (t: TabletBase): boolean => {
        const on = (side: TabletBase['prefixes']): number => e.mods.filter((id) => side.some((m) => m.id === id)).length;
        return on(t.prefixes) + on(t.suffixes) === e.mods.length && on(t.prefixes) <= 2 && on(t.suffixes) <= 2;
      };
      expect(tablets.some(holds), `no tablet can hold ${e.mods.join(' + ')}`).toBe(true);
    }
  });

  it('shows each entry on every tablet that rolls it, jackpots first', () => {
    // The two that sell high on any tablet…
    for (const t of tablets) {
      expect(shown(t)).toEqual(expect.arrayContaining(['Tablets/MapAdditionalModifier', 'Tablets/MapAdditionalUniqueMonsterModifier']));
      const tiers = watchList(t, []).map((e) => WATCH_TIERS.indexOf(e.tier));
      expect(tiers).toEqual([...tiers].sort((a, b) => a - b));
    }
    // …Ritual's own third, which no other tablet can roll…
    expect(watchList(ritual, []).filter((e) => e.tier === 'jackpot')).toHaveLength(3);
    expect(shown(overseer).filter((id) => id.startsWith('Tablets/Ritual'))).toEqual([]);
    // …and a Vaal Beacon Crystal only where there are Vaal Beacons.
    expect(shown(temple)).toContain('Tablets/IncursionTokenChance');
    expect(shown(ritual)).not.toContain('Tablets/IncursionTokenChance');
    expect(tablets.map((t) => watchList(t, []).length)).toEqual([13, 11, 9]);
  });

  it('leaves out an entry the player already asked for, and nothing else', () => {
    const asked = ['Tablets/MapAdditionalModifier', 'Tablets/MapDroppedGoldIncrease'];
    expect(shown(ritual, asked)).toEqual(shown(ritual).filter((id) => id !== 'Tablets/MapAdditionalModifier'));
  });
});

describe('the trade searches', () => {
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
