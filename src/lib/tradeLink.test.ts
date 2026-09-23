import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from '../../packages/engine/src/index.ts';
import { TABLET_CATEGORY } from '../../packages/engine/src/types.ts';
import { FULL_USES, tradeUrl } from './tradeLink';

const query = (url: string): unknown =>
  JSON.parse(decodeURIComponent(new URL(url).search.replace(/^\?q=/, '')));

describe('tradeUrl — a search the player clicks', () => {
  it('names the league and base, asks for an unused tablet with every modifier at once, instant buyout, cheapest first', () => {
    const url = tradeUrl({
      league: 'Forbidden Rites',
      baseName: 'Ritual Tablet',
      stats: [{ ids: ['explicit.stat_1'] }, { ids: ['explicit.stat_2'] }],
    });
    expect(url.startsWith('https://www.pathofexile.com/trade2/search/poe2/Forbidden%20Rites?q=')).toBe(true);
    expect(query(url)).toEqual({
      query: {
        status: { option: 'securable' }, // the trade site's "Instant Buyout"
        type: 'Ritual Tablet',
        stats: [{
          type: 'and', disabled: false,
          filters: [
            { id: 'pseudo.pseudo_number_of_uses_remaining', value: { min: 10 }, disabled: false }, // all 10 uses left
            { id: 'explicit.stat_1', disabled: false }, { id: 'explicit.stat_2', disabled: false },
          ],
        }],
      },
      sort: { price: 'asc' },
    });
  });

  it('asks for ANY of a modifier’s ids when the data has more than one', () => {
    const url = tradeUrl({
      league: 'L', baseName: 'Overseer Tablet',
      stats: [{ ids: ['a'] }, { ids: ['b', 'c'], ambiguous: true }],
    });
    const q = query(url) as { query: { stats: { type: string; filters: unknown[]; value?: unknown }[] } };
    expect(q.query.stats).toHaveLength(2);
    expect(q.query.stats[0]!.type).toBe('and');
    expect(q.query.stats[1]).toEqual({
      type: 'count', value: { min: 1 }, disabled: false,
      filters: [{ id: 'b', disabled: false }, { id: 'c', disabled: false }],
    });
  });

  it('asks for an unused tablet of that base when no modifier is named', () => {
    const q = query(tradeUrl({ league: 'L', baseName: 'Temple Tablet', stats: [] })) as { query: Record<string, unknown> };
    expect(q.query['stats']).toEqual([{ type: 'and', filters: [FULL_USES], disabled: false }]);
    expect(q.query['type']).toBe('Temple Tablet');
  });

  it('asks for a plain tablet only when told to — Normal, unused, instant buyout', () => {
    const plain = query(tradeUrl({ league: 'L', baseName: 'Ritual Tablet', stats: [], normalOnly: true })) as { query: Record<string, unknown> };
    expect(plain.query['filters']).toEqual({ type_filters: { filters: { rarity: { option: 'normal' } } } });
    expect(plain.query['stats']).toEqual([{ type: 'and', filters: [FULL_USES], disabled: false }]);
    expect(plain.query['status']).toEqual({ option: 'securable' });
    const any = query(tradeUrl({ league: 'L', baseName: 'Ritual Tablet', stats: [] })) as { query: Record<string, unknown> };
    expect(any.query).not.toHaveProperty('filters');
  });
});

describe('the shipped trade ids', () => {
  const file = JSON.parse(readFileSync('data/tablets/trade-stats.json', 'utf8')) as {
    readonly stats: Record<string, { readonly ids: string[]; readonly ambiguous?: boolean }>;
  };
  const data = loadPatch('data/patches/0.5.0');

  it('covers every tablet modifier, and nothing else', () => {
    const mods = [...data.bases.values()]
      .filter((b) => b.category === TABLET_CATEGORY)
      .flatMap((b) => [...b.pools.normal.prefixes, ...b.pools.normal.suffixes]);
    expect(Object.keys(file.stats).sort()).toEqual([...new Set(mods)].sort());
  });

  it('gives each one at least one id, and marks the ones that cover several wordings', () => {
    for (const [id, stat] of Object.entries(file.stats)) {
      expect(stat.ids.length, id).toBeGreaterThan(0);
      for (const trade of stat.ids) expect(trade, id).toMatch(/^explicit\.stat_\d+$/);
      expect(stat.ambiguous ?? false, id).toBe(stat.ids.length > 1);
    }
  });
});
