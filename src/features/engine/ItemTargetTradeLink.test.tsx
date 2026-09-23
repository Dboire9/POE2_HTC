import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';

// A workspace already holding a target — saved before the workspace module reads it at import.
vi.hoisted(() => {
  const target = [{ modId: 'Wands/WeaponSpellDamage', tierDisplay: 1 }];
  localStorage.setItem('poe2htc.workspace.v1', JSON.stringify({
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

const { default: ItemActions } = await import('./ItemActions');

afterEach(cleanup);

/** The query a link opens. */
const queryOf = (link: HTMLElement) =>
  (JSON.parse(new URL(link.getAttribute('href')!).searchParams.get('q')!) as {
    query: { stats: { filters: { id: string; value?: { min: number } }[] }[] };
  }).query;

describe('the Item tab’s target item has a trade search before anything is computed', () => {
  it('on the Item tab too', async () => {
    render(<ItemActions />);
    // By label, not role: the Item tab's modifier lists are thousands of options, and a role query
    // computes every one's accessible name on each poll.
    const q = queryOf(await screen.findByLabelText('Search on trade for the target item', {}, { timeout: 5000 }));
    expect(q.stats[1]!.filters[0]!.value).toEqual({ min: 105 });
  });
});
