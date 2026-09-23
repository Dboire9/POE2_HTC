import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';

// A workspace already holding a target — saved before the workspace module reads it at import.
vi.hoisted(() => {
  const target = [{ modId: 'Wands/WeaponSpellDamage', tierDisplay: 1 }];
  localStorage.setItem('poe2htc.workspace.v1', JSON.stringify({
    lab: { baseId: 'Wands', level: 82, targets: target, fractured: [], pinned: [] },
    item: { baseId: 'Wands', level: 82, target, subMode: 'plan' },
  }));
});

// The real data and price sheet — the price sheet's league is the one searched. Only the network and
// the Worker are stubbed.
vi.mock('../../lib/engine', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/engine')>()),
  loadEngine: () => Promise.resolve({
    data: loadShippedPatch('data/patches/0.5.0'),
    prices: indexPrices(JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8'))),
  }),
}));
vi.mock('../../lib/engineClient', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/engineClient')>()),
  prewarm: vi.fn(),
  solve: vi.fn(),
}));

const { default: EngineLab } = await import('./EngineLab');

afterEach(cleanup);

/** The query a link opens. */
const queryOf = (link: HTMLElement) =>
  (JSON.parse(new URL(link.getAttribute('href')!).searchParams.get('q')!) as {
    query: { filters: unknown; stats: { filters: { id: string; value?: { min: number } }[] }[] };
  }).query;

// The Item tab's twin is ItemTargetTradeLink.test.tsx: a file each, so neither inherits the other's
// module state.
describe('the target item has a trade search before anything is computed', () => {
  it('on the Plan tab, beside the target list', async () => {
    render(<EngineLab />);
    const q = queryOf(await screen.findByRole('link', { name: 'Search on trade for the target item' }, { timeout: 5000 }));
    expect(q.filters).toEqual({ type_filters: { filters: { category: { option: 'weapon.wand' }, rarity: { option: 'nonunique' } } } });
    expect(q.stats[1]!.filters[0]).toEqual({ id: 'explicit.stat_2974417149', value: { min: 105 }, disabled: false });
  });

});
