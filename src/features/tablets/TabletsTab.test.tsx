import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';
import type { EngineMarkovResult } from '../../lib/engineTypes';
import TabletsTab from './TabletsTab';

const data = loadShippedPatch('data/patches/0.5.0');
const prices = indexPrices(JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8')));

// The tab loads the engine over the network and solves in a Worker; jsdom has neither. The DATA is real
// — the picker's odds, families and names all come from the shipped files — and only the two edges are
// stubbed.
vi.mock('../../lib/engine', async () => ({
  ...(await vi.importActual<typeof import('../../lib/engine')>('../../lib/engine')),
  loadEngine: vi.fn(),
}));
vi.mock('../../lib/engineClient', async () => ({
  ...(await vi.importActual<typeof import('../../lib/engineClient')>('../../lib/engineClient')),
  prewarm: vi.fn(),
  solve: vi.fn(),
}));
vi.mock('../../lib/tablets', async () => ({
  ...(await vi.importActual<typeof import('../../lib/tablets')>('../../lib/tablets')),
  watchList: vi.fn(),
}));
const { loadEngine } = await import('../../lib/engine');
const { solve } = await import('../../lib/engineClient');
const { watchList } = await import('../../lib/tablets');

const markov = (over: Partial<EngineMarkovResult> = {}): EngineMarkovResult => ({
  applicable: true, feasible: true, expectedCost: 1587.3, converged: true, bound: 'exact',
  assumedOdds: false, nodes: [], edges: [], ...over,
});
const solved = (res: EngineMarkovResult = markov()) => {
  vi.mocked(solve).mockReturnValue({
    promise: Promise.resolve({ kind: 'lab' as const, result: { frontier: [], plansEvaluated: 0, assumedOdds: false }, alts: null, markov: res }),
    cancel: vi.fn(),
  });
};

beforeEach(() => {
  localStorage.clear();
  vi.mocked(loadEngine).mockResolvedValue({ data, prices });
  vi.mocked(watchList).mockReturnValue([]);
  solved();
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

/** Render the tab and wait for the shipped data to arrive. */
async function open() {
  const user = userEvent.setup();
  render(<TabletsTab />);
  await screen.findByRole('button', { name: 'Ritual Tablet' });
  return user;
}

describe('the Tablets tab — picking what you want', () => {
  it('offers the three tablets, and lists what the chosen one rolls, with the odds', async () => {
    await open();
    for (const name of ['Ritual Tablet', 'Overseer Tablet', 'Temple Tablet']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    // Bountiful is weight 1000 of a 7,150 prefix pool — about one roll in seven.
    const gold = screen.getByText(/increased Gold found in Map/);
    expect(gold.parentElement?.textContent).toMatch(/1 in 7 rolls on this side/);
  });

  it('warns that a modifier read from few sightings is a rough estimate', async () => {
    await open();
    // 54 sightings across the three sheets — the one weight the data moved off Morce Faster's ladder.
    const undertaking = screen.getByText(/additional random Modifiers/);
    expect(undertaking.parentElement?.textContent).toMatch(/seen 54 times/);
  });

  it('rules out the same family on the other side, and says why', async () => {
    const user = await open();
    await user.click(screen.getByRole('checkbox', { name: /Map contains an additional Essence/ }));
    const essenceChance = screen.getByRole('checkbox', { name: /increased chance to contain Essences/ });
    expect(essenceChance).toBeDisabled();
    expect(essenceChance.closest('label')?.textContent).toMatch(/one of these at a time/);
  });

  it('stops at two a side', async () => {
    const user = await open();
    const prefixes = ['increased Gold found in Map', 'increased Experience gain in Map'];
    for (const text of prefixes) await user.click(screen.getByRole('checkbox', { name: new RegExp(text) }));
    const third = screen.getByRole('checkbox', { name: /increased Pack Size in Map/ });
    expect(third).toBeDisabled();
    // …and a suffix is still free.
    expect(screen.getByRole('checkbox', { name: /increased Quantity of Waystones/ })).toBeEnabled();
  });
});

describe('the Tablets tab — what it costs and what it sells for', () => {
  const pick = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('checkbox', { name: /increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
  };

  it('solves the chosen tablet from a plain one, at the price you say a plain one costs', async () => {
    const user = await open();
    await pick(user);
    await waitFor(() => expect(solve).toHaveBeenCalled());
    expect(vi.mocked(solve).mock.calls[0]![0]).toMatchObject({
      kind: 'lab',
      from: { baseId: 'Tablets_ritual', level: 100 },
      targets: [{ modId: 'Tablets/MapDroppedGoldIncrease' }],
      baseCost: 1,
    });
    expect(await screen.findByText(/Crafting it costs/)).toBeInTheDocument();
  });

  it('opens the trade site for the tablet it just costed, in the league the prices are from', async () => {
    const user = await open();
    await pick(user);
    const link = await screen.findByRole('link', { name: /Search on trade/ });
    const url = new URL(link.getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://www.pathofexile.com/trade2/search/poe2/Forbidden%20Rites');
    expect(decodeURIComponent(url.search)).toContain('"type":"Ritual Tablet"');
  });

  it('compares the price you type against the craft, and remembers it', async () => {
    const user = await open();
    await pick(user);
    const field = await screen.findByRole('textbox', { name: /Price of a Ritual Tablet/ });
    await user.type(field, '2000');
    await user.tab();
    expect(await screen.findByText(/crafting saves/)).toBeInTheDocument();
    expect(localStorage.getItem('poe2htc.tabletPrices')).toContain('2000');
  });

  it('says a craft it cannot reach, rather than a number', async () => {
    solved(markov({ feasible: false, expectedCost: Infinity, reason: 'no policy reaches the target' }));
    const user = await open();
    await pick(user);
    expect(await screen.findByText(/no policy reaches the target/)).toBeInTheDocument();
  });
});

describe('the Tablets tab — what else you might roll', () => {
  it('lists a valuable modifier, how often it turns up, and its own trade search', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: ['Tablets/MapAdditionalModifier'], note: 'sells on its own' }]);
    solved(markov({ replay: { runs: 4_000, seen: [0.23], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('checkbox', { name: /increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));

    const row = (await screen.findByText(/additional random Modifiers/, { selector: 'li > span' })).closest('li')!;
    expect(row.textContent).toMatch(/turns up in 23% of crafts/);
    // Weight 41 of the Ritual suffix pool's 7,491.
    expect(row.textContent).toMatch(/1 in 183 rolls on that side/);
    expect(within(row).getByRole('link', { name: /Search on trade/ })).toBeInTheDocument();
    expect(screen.getByText(/Played out 4,000 times/)).toBeInTheDocument();
    // It asked the solver for exactly the modifiers it lists.
    expect(vi.mocked(solve).mock.calls[0]![0]).toMatchObject({ watch: [['Tablets/MapAdditionalModifier']] });
  });

  it('says when a price beats the tablet the player asked for', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: ['Tablets/MapAdditionalModifier'] }]);
    solved(markov({ replay: { runs: 100, seen: [0.1], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('checkbox', { name: /increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    const row = (await screen.findByText(/additional random Modifiers/, { selector: 'li > span' })).closest('li')!;
    await user.type(within(row).getByRole('textbox'), '5000');
    await user.tab();
    expect(await screen.findByText(/worth more than the tablet you asked for/)).toBeInTheDocument();
  });

  it('says why there are no odds when the replay declined the route', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: ['Tablets/MapAdditionalModifier'] }]);
    solved(markov({ replayReason: 'the route plays a desecrate move the replay does not model' }));
    const user = await open();
    await user.click(screen.getByRole('checkbox', { name: /increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    expect(await screen.findByText(/the replay does not model/)).toBeInTheDocument();
  });

  it('credits the rolling data the odds come from', async () => {
    await open();
    expect(screen.getByText(/Morce Faster’s rolling data \(19,147 modifiers seen\)/)).toBeInTheDocument();
  });
});
