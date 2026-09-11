import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EngineHolding, EngineMarkovResult } from '../../lib/engineTypes';

const mocks = vi.hoisted(() => ({ routeFor: vi.fn() }));
vi.mock('../../lib/engine', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/engine')>()),
  routeFor: mocks.routeFor,
}));

import StartFromItem from './StartFromItem';

const h = (present: string[], cost: number, rarity: 'magic' | 'rare' = 'rare'): EngineHolding =>
  ({ present, cost, rarity, key: `${present.join('+')}/${rarity}` });

/**
 * A from-white Lab result: crafting from scratch costs a 10 ex base plus 90 to craft, so 100, and every
 * row is measured against that. Three targets, so an item can already carry one or two of them.
 */
const lab = (over: Partial<EngineMarkovResult> = {}): EngineMarkovResult => ({
  applicable: true, feasible: true, converged: true, bound: 'exact', assumedOdds: false,
  expectedCost: 90, restartCost: 10, nodes: [], edges: [],
  routes: {} as NonNullable<EngineMarkovResult['routes']>,
  holdings: [
    h([], 95), h(['Fire'], 70), h(['Fire'], 60, 'magic'), h(['Cast'], 100), h(['Int'], 45),
    h(['Fire', 'Int'], 20), h(['Fire', 'Int'], 30, 'magic'), h(['Fire', 'Cast'], 50),
    h(['Fire', 'Int', 'Cast'], 0),
  ],
  ...over,
});
const engine = { data: {} as never, prices: { currency: {}, omens: {} } as never };
const rates = { chaos: 5, divine: 50 };

/** The table's rows, top to bottom, as their first cell reads. */
const order = (): string[] => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]!.textContent);

/** A drawable route from the bought item: one Exalt to the target. */
const route: EngineMarkovResult = {
  applicable: true, feasible: true, converged: true, bound: 'exact', assumedOdds: false, expectedCost: 20,
  nodes: [
    { key: 's', present: ['Fire', 'Int'], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare', isStart: true,
      isGoal: false, depth: 1, expectedCost: 20, visitRate: 1, action: 'Exalt' },
    { key: 'g', present: ['Fire', 'Int', 'Cast'], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare',
      isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
  ],
  edges: [{ from: 's', to: 'g', action: 'Exalt', prob: 0.2, regress: false }],
};

beforeEach(() => { mocks.routeFor.mockReset().mockReturnValue(route); });

describe('StartFromItem — the items you could buy instead of a white base', () => {
  it('opens on items carrying two of the targets, cheapest to finish first', () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    expect(order()).toEqual(['Rare · Fire + Int', 'Magic · Fire + Int', 'Rare · Fire + Cast']);
  });

  /** Worth up to = a fresh base plus the craft from scratch, less finishing: 100 − 20 here. */
  it('says what each is worth paying for, against crafting from scratch', () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    const first = screen.getAllByRole('row')[1]!;
    expect(within(first).getByText('20 ex')).toBeInTheDocument();
    expect(within(first).getByText('80 ex')).toBeInTheDocument();
    expect(screen.getByText(/of which/)).toHaveTextContent('10 ex is the white base');
  });

  /** Every size is already in the result, so switching it re-reads the rows and asks for nothing. */
  it('switches how many targets the item carries without computing anything', async () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '1' }));
    expect(order()).toEqual(['Rare · Int', 'Magic · Fire', 'Rare · Fire', 'Rare · Cast']);
    expect(mocks.routeFor).not.toHaveBeenCalled();
  });

  it('marks an item that saves nothing', async () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '1' }));
    expect(within(screen.getAllByRole('row').at(-1)!).getByText('nothing')).toBeInTheDocument();
  });

  /**
   * The cheapest to finish is often the dearest to buy. Priced at 5 div (250 ex) the Rare pair totals
   * 270, while the Magic pair at 20 ex totals 50 — under crafting from scratch, so it leads.
   */
  it('re-ranks by the price typed plus finishing, in the unit chosen', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.selectOptions(screen.getByRole('combobox'), 'div');
    await user.type(screen.getByRole('spinbutton', { name: /Rare · Fire \+ Int/ }), '5');
    await user.type(screen.getByRole('spinbutton', { name: /Magic · Fire \+ Int/ }), '0.4');
    expect(order()).toEqual(['Magic · Fire + Int', 'Rare · Fire + Int', 'Rare · Fire + Cast']);
    expect(within(screen.getAllByRole('row')[1]!).getByText('50 ex')).toBeInTheDocument();
    expect(within(screen.getAllByRole('row')[2]!).getByText('270 ex')).toBeInTheDocument();
  });

  it('draws the route from the item you pick, from the result it already has', async () => {
    const user = userEvent.setup();
    const markov = lab();
    render(<StartFromItem markov={markov} engine={engine} rates={rates} />);
    await user.click(screen.getByRole('button', { name: 'Rare · Fire + Int' }));
    expect(mocks.routeFor).toHaveBeenCalledWith(engine, markov, 'Fire+Int/rare');
    expect(await screen.findByText(/The route from the item you buy to the target/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hide this route/ }));
    expect(screen.queryByText(/The route from the item you buy/)).not.toBeInTheDocument();
  });

  /** Its route is "start over": no graph can show a plan that is the from-scratch plan above it. */
  it('says so, instead of drawing a graph, when an item’s cheapest move is to start over', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'Rare · Cast' }));
    expect(screen.getByText(/cheapest move is to start over from a white base/)).toBeInTheDocument();
    expect(screen.queryByText(/The route from the item you buy/)).not.toBeInTheDocument();
  });

  /** A bound is not an answer, and a table of them compared with each other is worse than one. */
  it('draws no table from a solve that did not settle, and says what to do', () => {
    render(<StartFromItem markov={lab({ bound: 'upper', routes: undefined })} engine={engine} rates={rates} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/only reached a ceiling/)).toBeInTheDocument();
  });

  // A held or fractured item has no restart, so there is no "instead of a white base" to price.
  it('is absent from a solve that cannot start over', () => {
    const { container } = render(<StartFromItem markov={lab({ restartCost: undefined })} engine={engine} rates={rates} />);
    expect(container).toBeEmptyDOMElement();
  });
});
