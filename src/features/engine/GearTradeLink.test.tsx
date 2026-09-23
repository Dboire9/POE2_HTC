import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';
import type { EngineHolding, EngineMarkovResult } from '../../lib/engineTypes';
import { DEFAULT_EFFORT } from '../../lib/searchEffort';
import { slotsOfTargets } from '../../lib/gearTrade';
import { GearTradeLink } from './GearTradeLink';
import StartFromItem from './StartFromItem';
import WhatToBuy from './WhatToBuy';

afterEach(cleanup);

// The real data, as the browser gets it, and the real price sheet — its league is the one searched.
const data = loadShippedPatch('data/patches/0.5.0');
const engine = { data, prices: indexPrices(JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8'))) };
const LEAGUE = engine.prices.meta!.league!;
const SPELL = 'Wands/WeaponSpellDamage';
const MANA = 'Wands/IncreasedMana';
const targets = [{ modId: SPELL, tierDisplay: 1 }, { modId: MANA, tierDisplay: 3 }];

/** The search a link opens, read back out of its URL. */
const searchOf = (link: HTMLElement) => {
  const url = new URL(link.getAttribute('href')!);
  expect(url.pathname).toBe(`/trade2/search/poe2/${encodeURIComponent(LEAGUE)}`);
  return (JSON.parse(url.searchParams.get('q')!) as {
    query: { status: unknown; filters: { type_filters: { filters: Record<string, { option: string }> } }; stats: { filters: { id: string; value?: { min: number } }[] }[] };
  }).query;
};

describe('a trade search for an item of gear', () => {
  it('searches the finished item: its class, not unique, each modifier at its tier or better, instant buyout', async () => {
    render(<GearTradeLink data={data} league={LEAGUE} baseId="Wands" slots={slotsOfTargets(targets)} rarity="nonunique" label="the finished item" />);
    const q = searchOf(await screen.findByRole('link', { name: 'Search on trade for the finished item' }));
    expect(q.status).toEqual({ option: 'securable' });
    expect(q.filters.type_filters.filters).toEqual({ category: { option: 'weapon.wand' }, rarity: { option: 'nonunique' } });
    // T1 Spell Damage rolls 105–119; T3 maximum Mana is the third tier from the top.
    const mins = q.stats.slice(1).map((g) => g.filters[0]!.value?.min);
    const manaT3 = data.mods.get(MANA)!.tiers.at(-3)!.ranges[0]![0];
    expect(mins).toEqual([105, manaT3]);
  });

  it('draws nothing without a league to search in', () => {
    const { container } = render(<GearTradeLink data={data} league={undefined} baseId="Wands" slots={slotsOfTargets(targets)} rarity="rare" label="x" />);
    expect(container.innerHTML).toBe('');
  });
});

describe('the items to buy instead', () => {
  const h = (positions: string[][], present: string[], cost: number, rarity: 'magic' | 'rare' = 'rare'): EngineHolding =>
    ({ present, positions, cost, rarity, key: `${positions.join('+')}/${rarity}` });
  const markov: EngineMarkovResult = {
    applicable: true, feasible: true, converged: true, bound: 'exact', assumedOdds: false,
    expectedCost: 90, restartCost: 10, nodes: [], edges: [], routes: {} as NonNullable<EngineMarkovResult['routes']>,
    holdings: [
      h([], [], 95), h([[SPELL]], ['#% increased Spell Damage'], 60), h([[SPELL]], ['#% increased Spell Damage'], 50, 'magic'),
      h([[MANA]], ['+# to maximum Mana'], 70),
      h([[SPELL], [MANA]], ['#% increased Spell Damage', '+# to maximum Mana'], 0), // the finished item
    ],
  };

  it('gives every row its own search, for its rarity and the modifiers it holds, at the tiers the craft asks', async () => {
    render(
      <StartFromItem
        markov={markov} engine={engine} carved={false} ranAt={DEFAULT_EFFORT} computing={false}
        recompute={() => {}} solvedFor={{ baseId: 'Wands', targets }}
      />,
    );
    const magic = searchOf(await screen.findByRole('link', { name: /Search on trade for Magic · #% increased Spell Damage/ }));
    expect(magic.filters.type_filters.filters['rarity']).toEqual({ option: 'magic' });
    expect(magic.stats[1]!.filters[0]).toEqual({ id: 'explicit.stat_2974417149', value: { min: 105 }, disabled: false });
    const rare = searchOf(screen.getByRole('link', { name: /Search on trade for Rare · \+# to maximum Mana/ }));
    expect(rare.filters.type_filters.filters['rarity']).toEqual({ option: 'rare' });
    expect(screen.getAllByRole('link', { name: /Search on trade for/ })).toHaveLength(3);
  });
});

describe('what to look for when you buy one (the Item tab)', () => {
  it('gives every row a search for a Rare holding those modifiers', async () => {
    const h = (positions: string[][], present: string[], cost: number): EngineHolding =>
      ({ present, positions, cost, rarity: 'rare', key: positions.join('+') });
    const markov: EngineMarkovResult = {
      applicable: true, feasible: true, converged: true, bound: 'exact', assumedOdds: false,
      expectedCost: 90, nodes: [], edges: [],
      holdings: [h([], [], 100), h([[SPELL]], ['#% increased Spell Damage'], 60), h([[SPELL], [MANA]], ['#% increased Spell Damage', '+# to maximum Mana'], 0)],
    };
    render(<WhatToBuy markov={markov} trade={{ data, league: LEAGUE, baseId: 'Wands', targets }} />);
    const q = searchOf(await screen.findByRole('link', { name: 'Search on trade for a Rare with #% increased Spell Damage' }));
    expect(q.filters.type_filters.filters['rarity']).toEqual({ option: 'rare' });
    expect(q.stats[1]!.filters[0]!.value).toEqual({ min: 105 });
  });
});

