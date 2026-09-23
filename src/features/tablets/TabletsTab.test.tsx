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
    await user.click(screen.getByRole('button', { name: /Add .*Map contains an additional Essence/ }));
    const essenceChance = screen.getByRole('button', { name: /Add .*increased chance to contain Essences/ });
    expect(essenceChance).toBeDisabled();
    expect(essenceChance.parentElement?.textContent).toMatch(/one of these at a time/);
  });

  it('stops at two a side', async () => {
    const user = await open();
    const prefixes = ['increased Gold found in Map', 'increased Experience gain in Map'];
    for (const text of prefixes) await user.click(screen.getByRole('button', { name: new RegExp(`Add .*${text}`) }));
    const third = screen.getByRole('button', { name: /Add .*increased Pack Size in Map/ });
    expect(third).toBeDisabled();
    // …and a suffix is still free.
    expect(screen.getByRole('button', { name: /Add .*increased Quantity of Waystones/ })).toBeEnabled();
  });

  it('lists what you picked below, the way the Plan tab does, and takes one off again', async () => {
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    // Picked: out of the list above, into "Your tablet" below.
    expect(screen.queryByRole('button', { name: /Add .*increased Gold found in Map/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Remove .*increased Gold found in Map from the tablet/ }));
    expect(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /What does it cost/ })).toBeDisabled();
  });

  it('narrows both lists to what you type', async () => {
    const user = await open();
    await user.type(screen.getByRole('textbox', { name: /Search tablet modifiers/ }), 'waystones');
    const adds = screen.getAllByRole('button', { name: /^Add / }).map((b) => b.getAttribute('aria-label'));
    expect(adds).toEqual([expect.stringMatching(/Quantity of Waystones found in Map/)]);
    expect(screen.getByText('No matches')).toBeInTheDocument(); // the prefix side has none
  });
});

describe('the Tablets tab — what it costs and what it sells for', () => {
  const pick = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
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
    // The number once, with its unit once — it once read "1,587 ex ex".
    expect((await screen.findByText(/Crafting it costs/)).textContent).toMatch(/costs 1,587 ex on average/);
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
    expect(await screen.findByText('crafting saves 413 ex')).toBeInTheDocument();
    expect(localStorage.getItem('poe2htc.tabletPrices')).toContain('2000');
  });

  it('never carries a price typed for one tablet into the next one’s box', async () => {
    const user = await open();
    await pick(user);
    await user.type(await screen.findByRole('textbox', { name: /Price of a Ritual Tablet/ }), '2000');
    await user.tab();

    await user.click(screen.getByRole('button', { name: /Add .*increased Experience gain in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    const next = await screen.findByRole('textbox', { name: /Gold found in Map, .*Experience gain in Map/ });
    // Left holding "2000", leaving the box would have saved it as this tablet's price too.
    expect(next).toHaveValue('');
    await user.click(next);
    await user.tab();
    expect(Object.keys(JSON.parse(localStorage.getItem('poe2htc.tabletPrices')!))).toHaveLength(1);
  });

  it('stops a solve still running when you switch tablet', async () => {
    const cancel = vi.fn();
    vi.mocked(solve).mockReturnValue({ promise: new Promise<never>(() => {}), cancel });
    const user = await open();
    await pick(user);
    await user.click(screen.getByRole('button', { name: 'Overseer Tablet' }));
    expect(cancel).toHaveBeenCalledTimes(1);
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
    vi.mocked(watchList).mockReturnValue([{ mods: [{ id: 'Tablets/MapAdditionalModifier' }], tier: 'jackpot', note: 'sells on its own' }]);
    solved(markov({ replay: { runs: 4_000, seen: [0.23], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));

    const row = (await screen.findByText(/additional random Modifiers/, { selector: 'li > span' })).closest('li')!;
    expect(row.textContent).toMatch(/turns up in 23% of crafts/);
    // Weight 41 of the Ritual suffix pool's 7,491.
    expect(row.textContent).toMatch(/1 in 183 rolls on that side/);
    expect(within(row).getByRole('link', { name: /Search on trade/ })).toBeInTheDocument();
    expect(screen.getByText(/Played out 4,000 times/)).toBeInTheDocument();
    // The tier is the claim; a remembered price would be stale within days, so none is shown.
    expect(row.textContent).not.toMatch(/div|chaos|checked/);
    // It asked the solver for exactly the modifiers it lists.
    expect(vi.mocked(solve).mock.calls[0]![0]).toMatchObject({ watch: [[{ id: 'Tablets/MapAdditionalModifier' }]] });
  });

  it('names the value a row was priced at, searches for exactly that roll, and gives no per-roll odds', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: [{ id: 'Tablets/RitualAdditionalReroll', min: 3, max: 3 }], tier: 'superJackpot' }]);
    solved(markov({ replay: { runs: 100, seen: [0.02], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    const row = (await screen.findByText(/rerolling Favours 3 additional times/, { selector: 'li > span' })).closest('li')!;
    // "1 in 150 rolls" is the odds of the modifier, not of rolling a 3 on it.
    expect(row.textContent).not.toMatch(/rolls on that side/);
    const q = decodeURIComponent(new URL(within(row).getByRole('link').getAttribute('href')!).search);
    expect(q).toContain('"value":{"min":3,"max":3}');
    expect(vi.mocked(solve).mock.calls[0]![0]).toMatchObject({ watch: [[{ id: 'Tablets/RitualAdditionalReroll', min: 3, max: 3 }]] });
  });

  it('shows each tier apart, each row with its own odds and its own search', async () => {
    // Interleaved on purpose: the replay's odds follow the list the solver was given, not the tiers.
    vi.mocked(watchList).mockReturnValue([
      { mods: [{ id: 'Tablets/MapAdditionalModifier' }], tier: 'jackpot' },
      { mods: [{ id: 'Tablets/MapDroppedItemRarityIncrease' }], tier: 'good' },
      { mods: [{ id: 'Tablets/MapAdditionalUniqueMonsterModifier' }], tier: 'jackpot' },
    ]);
    solved(markov({ replay: { runs: 1_000, seen: [0.04, 0.61, 0.07], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));

    const tier = (title: string): string[] =>
      within(screen.getByText(title).closest('section')!).getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(await screen.findByText('Jackpot')).toBeInTheDocument();
    expect(tier('Jackpot')).toEqual([
      expect.stringMatching(/additional random Modifiers.*turns up in 4% of crafts/),
      expect.stringMatching(/Unique Monsters.*turns up in 7% of crafts/),
    ]);
    expect(tier('Good')).toEqual([
      expect.stringMatching(/Rarity of Items found in Map.*turns up in 61% of crafts/),
    ]);
    // Every entry is a specific set, so every row gets a search and a box for today's price.
    const good = within(screen.getByText('Good').closest('section')!).getByRole('listitem');
    expect(within(good).getByRole('link', { name: /Search on trade/ })).toBeInTheDocument();
    expect(within(good).getByRole('textbox')).toBeInTheDocument();
    // Tiers with nothing in them show no heading.
    expect(screen.queryByText('Super jackpot')).toBeNull();
  });

  it('says when a price beats the tablet the player asked for', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: [{ id: 'Tablets/MapAdditionalModifier' }], tier: 'jackpot' }]);
    solved(markov({ replay: { runs: 100, seen: [0.1], meanCost: 1600, stdErr: 20 } }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    const row = (await screen.findByText(/additional random Modifiers/, { selector: 'li > span' })).closest('li')!;
    await user.type(within(row).getByRole('textbox'), '5000');
    await user.tab();
    expect(await screen.findByText(/worth more than the tablet you asked for/)).toBeInTheDocument();
  });

  it('says why there are no odds when the replay declined the route', async () => {
    vi.mocked(watchList).mockReturnValue([{ mods: [{ id: 'Tablets/MapAdditionalModifier' }], tier: 'jackpot' }]);
    solved(markov({ replayReason: 'the route plays a desecrate move the replay does not model' }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    expect(await screen.findByText(/the replay does not model/)).toBeInTheDocument();
  });

  it('says why there are no odds when the cost is only a bound', async () => {
    // Asking for two jackpots at once is the craft that stops short: "≤ 49,282 ex", and no settled plan.
    vi.mocked(watchList).mockReturnValue([{ mods: [{ id: 'Tablets/MapAdditionalModifier' }], tier: 'jackpot' }]);
    solved(markov({ bound: 'upper', converged: false }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: /Add .*increased Gold found in Map/ }));
    await user.click(screen.getByRole('button', { name: /What does it cost/ }));
    expect(await screen.findByText(/no odds while the cost is only a bound/)).toBeInTheDocument();
    expect(screen.getByText(/Crafting it costs/).textContent).toMatch(/costs ≤ 1,587 ex/);
  });

  it('credits the rolling data the odds come from', async () => {
    await open();
    expect(screen.getByText(/Morce Faster’s rolling data \(19,147 modifiers seen\)/)).toBeInTheDocument();
  });
});
