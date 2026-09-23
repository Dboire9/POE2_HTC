import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/index.ts';
import { familiesOf, resolveMod } from '../../packages/engine/src/pool.ts';
import { CURATED, ODDS_CREDIT, WATCH_TIERS, listTablets, ruledOutBy, searchIsLoose, shareWithin, summarizePlan, tradeStatsFor, watchKey, watchList, watchText, type TabletBase, spendBreakdown, plainBreakEven, standInFilters } from './tablets';

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

describe('the valuable list', () => {
  const curated = WATCH_TIERS.flatMap((tier) => CURATED.tiers[tier]);
  const ids = (e: { mods: readonly { id: string }[] }): string => e.mods.map((m) => m.id).join(' + ');
  const shown = (t: TabletBase, targets: readonly string[] = []): string[] => watchList(t, targets).map(ids);

  it('names each modifier by id AND by what it reads in game, and the two agree', () => {
    // The ids are the game's internal names and can mislead — RitualMagicMonsters is the one that reads
    // "chance to be Rare" — so whoever edits the list writes both, and this holds them together.
    for (const e of curated) for (const m of e.mods) expect(resolveMod(data, m.id).text, m.id).toBe(m.reads);
  });

  it('prices only values a modifier can roll', () => {
    for (const e of curated) {
      for (const m of e.mods) {
        if (m.min === undefined && m.max === undefined) continue;
        const [lo, hi] = resolveMod(data, m.id).tiers[0]!.ranges[0]! as [number, number];
        expect(m.min ?? lo, m.id).toBeGreaterThanOrEqual(lo);
        expect(m.max ?? hi, m.id).toBeLessThanOrEqual(hi);
        expect(m.min ?? lo, m.id).toBeLessThanOrEqual(m.max ?? hi);
      }
    }
  });

  it('lists each set once per tablet, and only sets that tablet can hold', () => {
    for (const t of tablets) {
      const keys = curated.filter((e) => e.tablets.includes(t.id)).map((e) => watchKey(e.mods).sort().join(' + '));
      expect(new Set(keys).size, t.name).toBe(keys.length);
    }
    for (const e of curated) {
      expect(e.tablets.length, ids(e)).toBeGreaterThan(0);
      const families = e.mods.flatMap((m) => familiesOf(resolveMod(data, m.id)));
      expect(new Set(families).size, `${ids(e)} repeats a family`).toBe(families.length);
      for (const id of e.tablets) {
        const t = tablet(id);
        const on = (side: TabletBase['prefixes']): number => e.mods.filter((m) => side.some((x) => x.id === m.id)).length;
        expect(on(t.prefixes) + on(t.suffixes), `${t.name} cannot roll ${ids(e)}`).toBe(e.mods.length);
        expect(Math.max(on(t.prefixes), on(t.suffixes)), `${ids(e)} overfills a side`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('shows each tablet the sets priced for it, best tier first', () => {
    // The same set sells differently per tablet: Unique Monsters alone is ~5 div on a Temple tablet and
    // ~5 chaos on the other two.
    const tierOf = (t: TabletBase, key: string) => watchList(t, []).find((e) => ids(e) === key)?.tier;
    expect(tierOf(temple, 'Tablets/MapAdditionalUniqueMonsterModifier')).toBe('jackpot');
    expect(tierOf(ritual, 'Tablets/MapAdditionalUniqueMonsterModifier')).toBe('good');
    // The reroll is a Ritual modifier; nothing about it reaches the other two.
    expect(shown(overseer).some((k) => k.includes('RitualAdditionalReroll'))).toBe(false);
    expect(watchList(ritual, []).filter((e) => e.tier === 'superJackpot')).toHaveLength(3);
    for (const t of tablets) {
      const order = watchList(t, []).map((e) => WATCH_TIERS.indexOf(e.tier));
      expect(order).toEqual([...order].sort((a, b) => a - b));
    }
    expect(tablets.map((t) => watchList(t, []).length)).toEqual([7, 18, 26]);
  });

  it('keeps the value a set was priced at', () => {
    const three = watchList(ritual, []).find((e) => e.tier === 'superJackpot' && e.mods.length === 1)!;
    expect(three.mods).toEqual([{ id: 'Tablets/RitualAdditionalReroll', min: 3, max: 3 }]);
    expect(watchText(resolveMod(data, 'Tablets/RitualAdditionalReroll').text!, three.mods[0]!))
      .toBe('Ritual Altars in Map allow rerolling Favours 3 additional times');
    expect(watchText('Map has # additional random Modifiers', { id: 'x', min: 1, max: 2 })).toBe('Map has 1–2 additional random Modifiers');
  });

  it('leaves out a set made only of what the player asked for, and nothing else', () => {
    const asked = ['Tablets/MapAdditionalUniqueMonsterModifier'];
    expect(shown(ritual, asked)).toEqual(shown(ritual).filter((k) => k !== 'Tablets/MapAdditionalUniqueMonsterModifier'));
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

describe('reading a craft as an investment', () => {
  const pct = Array.from({ length: 101 }, (_, p) => p * 10); // p-th percentile = 10p

  it('says how often a craft finishes within a budget', () => {
    expect(shareWithin(pct, 500)).toBe(0.5);
    expect(shareWithin(pct, 505)).toBe(0.5);
    expect(shareWithin(pct, -1)).toBe(0);
    expect(shareWithin(pct, 1e9)).toBe(1);
  });

});

describe('saying how a plan works', () => {
  it('names the strategy from what the plan plays, counting the tablet you start from', () => {
    const fresh = summarizePlan({ restart: 71, transmute: 72, augment: 3.2, regal: 1, exalt: 2 });
    expect(fresh.strategy).toBe('fresh');
    expect(fresh.uses[0]).toEqual({ name: 'plain tablets', perCraft: 72 });
    expect(fresh.uses.find((u) => u.name.startsWith('Regal'))).toEqual({ name: 'Regal Orb', perCraft: 1 });
    expect(summarizePlan({ transmute: 1, regal: 1, chaos: 14 }).strategy).toBe('chaos');
    expect(summarizePlan({ restart: 5, chaos: 9, transmute: 6 }).strategy).toBe('mixed');
    expect(summarizePlan({ transmute: 1, augment: 1, regal: 1, exalt: 1 }).strategy).toBe('direct');
  });
});

describe('where a craft’s spend goes', () => {
  const priceOf = (k: string): number | undefined => ({ transmute: 1.25, regal: 2.3, exalt: 1, chaos: 63 } as Record<string, number>)[k];

  it('adds up to exactly what the verdict spends, the Exalts that fill the finished tablet included', () => {
    // 57 fresh starts and one sale on the way: 59 plain tablets. The orbs come to 57×1.25 + 57×2.3 + 90×1
    // + 27×63, and the replay charged 2 Exalts more at the finish.
    const moves = { transmute: 57, regal: 57, exalt: 90, chaos: 27, restart: 57, sell: 1 };
    const orbs = 57 * 1.25 + 57 * 2.3 + 90 + 27 * 63;
    const plain = 130;
    const meanCost = 58 * plain + orbs + 2;
    const lines = spendBreakdown(moves, plain, meanCost, priceOf);
    expect(lines.reduce((a, l) => a + l.total, 0)).toBeCloseTo(plain + meanCost, 9);
    expect(lines.find((l) => l.name === 'plain tablets')).toMatchObject({ count: 59, each: 130 });
    expect(lines.find((l) => l.name === 'Exalted Orbs filling the finished tablet')!.count).toBeCloseTo(2, 9);
    expect(lines.find((l) => l.name === 'Chaos Orbs')).toMatchObject({ count: 27, each: 63 });
    // Dearest first.
    expect(lines.map((l) => l.total)).toEqual([...lines.map((l) => l.total)].sort((a, b) => b - a));
  });

  it('names one of something in the singular, and leaves out what was never used', () => {
    const lines = spendBreakdown({ regal: 1 }, 10, 2.3, priceOf);
    expect(lines.map((l) => l.name)).toEqual(['plain tablet', 'Regal Orb']);
  });
});

describe('the dearest plain tablet a craft still pays at', () => {
  const lines = [
    { name: 'plain tablets', count: 50, each: 2, total: 100, plain: true as const },
    { name: 'Chaos Orbs', count: 20, each: 1, total: 20 },
  ];

  it('is where the spend, held to this plan, meets what the craft brings back', () => {
    // 50 plain tablets and 20 of orbs, against 170 back: (170 − 20) / 50 = 3 a tablet.
    expect(plainBreakEven(lines, 170)).toBe(3);
  });

  it('is none when the orbs alone cost more than the craft brings back', () => {
    expect(plainBreakEven(lines, 15)).toBeUndefined();
  });
});

describe('searching for a tablet already rolled', () => {
  it('pins a Magic one exactly: one modifier a side, so "no suffix" means one prefix', () => {
    expect(standInFilters({ rarity: 'magic', prefixes: 1, suffixes: 0, worth: 1 })).toEqual({
      filters: [
        { id: 'pseudo.pseudo_number_of_empty_prefix_mods', value: { max: 0 }, disabled: false },
        { id: 'pseudo.pseudo_number_of_empty_suffix_mods', value: { min: 1 }, disabled: false },
      ],
      loose: false,
    });
  });

  it('pins a Rare one with filters true however the site counts its empty slots, and says it is loose', () => {
    // Two prefixes, no suffix: at most 1 empty prefix (of 3; 0 of 2), at least 2 empty suffixes.
    expect(standInFilters({ rarity: 'rare', prefixes: 2, suffixes: 0, worth: 1 })).toEqual({
      filters: [
        { id: 'pseudo.pseudo_number_of_empty_prefix_mods', value: { max: 1 }, disabled: false },
        { id: 'pseudo.pseudo_number_of_empty_suffix_mods', value: { min: 2 }, disabled: false },
      ],
      loose: true,
    });
  });
});

