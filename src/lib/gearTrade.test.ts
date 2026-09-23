import { describe, it, expect } from 'vitest';
import { loadShippedPatch } from '../../packages/engine/src/loadPatch.ts';
import { TRADE_CATEGORY, gearSearch, loadGearTrade } from './gearTrade.ts';
import { tradeUrl } from './tradeLink.ts';

// The patch as the BROWSER gets it: no stat ids on the tiers, which is why the trade file is keyed by
// modifier and reads the tier's value ranges instead.
const data = loadShippedPatch('data/patches/0.5.0');
const trade = await loadGearTrade();
const EXPLICIT = 'explicit.stat_2974417149'; // #% increased Spell Damage

describe('a trade search for gear', () => {
  it('asks for the modifier at its tier or better, in the base’s class, however it got on the item', () => {
    const { search, loose } = gearSearch(trade, data, 'Wands', [[{ modId: 'Wands/WeaponSpellDamage', tierDisplay: 1 }]]);
    expect(loose).toBe(false);
    expect(search.category).toBe('weapon.wand');
    // T1 rolls 105–119: at least 105, as an explicit, desecrated or fractured modifier.
    expect(search.stats).toEqual([{ ids: [EXPLICIT, 'desecrated.stat_2974417149', 'fractured.stat_2974417149'], value: { min: 105 } }]);
  });

  it('asks for no value when any tier will do', () => {
    const n = data.mods.get('Wands/WeaponSpellDamage')!.tiers.length;
    const { search } = gearSearch(trade, data, 'Wands', [[{ modId: 'Wands/WeaponSpellDamage', tierDisplay: n }]]);
    expect(search.stats[0]!.value).toBeUndefined();
  });

  it('filters "Adds # to #" on the average of the two, as the trade site does', () => {
    // An Essence modifier: no stat ids in the data at all, matched on its wording. T1 adds 31–38 to 47–59.
    const { search } = gearSearch(trade, data, 'Bows', [[{ modId: 'Bows/Essence_ColdDamage', tierDisplay: 1 }]]);
    expect(search.stats[0]!.value).toEqual({ min: 39 }); // (31 + 47) / 2
  });

  it('lets any of a slot’s alternatives fill it, each at its own tier', () => {
    const { search } = gearSearch(trade, data, 'Wands', [[
      { modId: 'Wands/WeaponSpellDamage', tierDisplay: 1 },
      { modId: 'Wands/IncreasedMana', tierDisplay: 1 },
    ]]);
    expect(search.stats).toHaveLength(1);
    const either = search.stats[0]!;
    expect(either.ids).toHaveLength(6);
    expect(either.values).toEqual([...Array(3).fill({ min: 105 }), ...Array(3).fill({ min: 150 })]);
    // …which the link turns into one "at least one of" group.
    const q = JSON.parse(decodeURIComponent(new URL(tradeUrl({ league: 'L', ...search, rarity: 'rare' })).search.slice(3))) as {
      query: { stats: { type: string; filters: { id: string; value?: unknown }[] }[]; filters: unknown };
    };
    expect(q.query.stats[1]!.type).toBe('count');
    expect(q.query.stats[1]!.filters[3]).toEqual({ id: 'explicit.stat_1050105434', value: { min: 150 }, disabled: false });
    expect(q.query.filters).toEqual({ type_filters: { filters: { category: { option: 'weapon.wand' }, rarity: { option: 'rare' } } } });
  });

  it('says so when a modifier has no trade stat, and searches for the rest', () => {
    const { search, loose } = gearSearch(trade, data, 'Amulets', [
      [{ modId: 'Amulets/PerfectEssence_EssenceAbyss', tierDisplay: 1 }],
      [{ modId: 'Amulets/Intelligence', tierDisplay: 99 }],
    ]);
    expect(loose).toBe(true);
    expect(search.stats).toHaveLength(1);
  });
});

describe('the shipped trade ids', () => {
  it('cover every gear modifier, and every base class the planner offers', () => {
    const gear = [...data.mods.keys()].filter((id) => !id.startsWith('Tablets/'));
    expect(gear.filter((id) => !trade.mods[id])).toEqual([]);
    const classes = new Set([...data.bases.values()].map((b) => b.category).filter((c) => c !== 'Tablets'));
    expect([...classes].filter((c) => !TRADE_CATEGORY[c])).toEqual([]);
    // Nearly every line: what is left is the Abyssal Lord's mark and its kin, which trade has no stat for.
    const lines = Object.values(trade.mods).flat();
    expect(lines.filter((l) => l === null).length / lines.length).toBeLessThan(0.025);
  });

  it('only ever point at explicit, desecrated or fractured stats', () => {
    for (const row of trade.rows) for (const id of row.ids) expect(id).toMatch(/^(explicit|desecrated|fractured)\.stat_\d+$/);
  });
});
