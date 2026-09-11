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

/** The table's rows, top to bottom, named as each row's Route button names its item. */
const order = (): string[] => screen.getAllByRole('row').slice(1)
  .map((r) => within(r).getByRole('button').getAttribute('aria-label')!.replace(/^Route from /, ''));
const row = (name: string): HTMLElement =>
  screen.getAllByRole('row').find((r) => within(r).queryByRole('button', { name: `Route from ${name}` }))!;
const priceBox = (name: string): HTMLElement => screen.getByRole('textbox', { name: new RegExp(`^Trade price for ${name.replace(/[+]/g, '\\+')},`) });

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

  /** Pay at most = a fresh base plus the craft from scratch, less finishing: 100 − 20 here. */
  it('says what each is worth paying for, against crafting from scratch', () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    const first = screen.getAllByRole('row')[1]!;
    expect(within(first).getByText('20 ex')).toBeInTheDocument();
    expect(within(first).getByText('80 ex')).toBeInTheDocument();
    expect(screen.getByText('100 ex')).toBeInTheDocument();
    expect(screen.getByText(/plus the craft/)).toHaveTextContent('a white base (10 ex) plus the craft');
  });

  /** Every size is already in the result, so switching it re-reads the rows and asks for nothing. */
  it('switches how many targets the item carries without computing anything', async () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '1' }));
    expect(order()).toEqual(['Rare · Int', 'Magic · Fire', 'Rare · Fire', 'Rare · Cast']);
    expect(mocks.routeFor).not.toHaveBeenCalled();
  });

  /** A hybrid modifier is one modifier printed over two lines; joining them with " + " read as two. */
  it('keeps a two-line modifier in one piece', () => {
    render(<StartFromItem markov={lab({ holdings: [h([], 95), h(['Spell\nMana'], 40), h(['Spell\nMana', 'Fire'], 0)] })} engine={engine} rates={rates} />);
    expect(order()).toEqual(['Rare · Spell / Mana']);
    expect(screen.getByText('Spell / Mana')).toBeInTheDocument();
  });

  it('marks an item that saves nothing', async () => {
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '1' }));
    expect(within(row('Rare · Cast')).getByText('not worth buying')).toBeInTheDocument();
  });

  /**
   * The cheapest to finish is often the dearest to buy. Priced at 5 div (250 ex) the Rare pair totals
   * 270, while the Magic pair at 0,4 div (20 ex, typed with a comma) totals 50 — under crafting from
   * scratch, so it is the best buy. The rows stay where they were: a row that jumped on the first digit
   * took the player's price out from under them (reported 2026-09-11).
   */
  it('prices each typed item all in, and names the best buy without moving a row', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.selectOptions(screen.getByRole('combobox'), 'div');
    await user.type(priceBox('Rare · Fire + Int'), '5');
    await user.type(priceBox('Magic · Fire + Int'), '0,4');
    expect(order()).toEqual(['Rare · Fire + Int', 'Magic · Fire + Int', 'Rare · Fire + Cast']);
    expect(within(row('Magic · Fire + Int')).getByText('50 ex')).toBeInTheDocument();
    expect(within(row('Magic · Fire + Int')).getByText('saves 50 ex')).toBeInTheDocument();
    expect(within(row('Magic · Fire + Int')).getByText('best buy')).toBeInTheDocument();
    expect(within(row('Rare · Fire + Int')).getByText('270 ex')).toBeInTheDocument();
    expect(within(row('Rare · Fire + Int')).getByText('170 ex more')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Best of the items you priced: Magic · Fire + Int — 50 ex in total, 50 ex less than crafting from scratch.');
  });

  it('says so when no priced item beats crafting from scratch', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.type(priceBox('Rare · Fire + Cast'), '60');
    expect(screen.getByRole('status')).toHaveTextContent(/None of the items you priced beats crafting from scratch.*110 ex, 10 ex more/);
    expect(screen.queryByText('best buy')).not.toBeInTheDocument();
  });

  it('marks a price it cannot read, and leaves it out', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    const box = priceBox('Rare · Fire + Int');
    await user.type(box, '5 div');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveValue('5 div');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('draws the route from the item you pick, from the result it already has', async () => {
    const user = userEvent.setup();
    const markov = lab();
    render(<StartFromItem markov={markov} engine={engine} rates={rates} />);
    await user.click(screen.getByRole('button', { name: 'Route from Rare · Fire + Int' }));
    expect(mocks.routeFor).toHaveBeenCalledWith(engine, markov, 'Fire+Int/rare');
    expect(await screen.findByText(/The route from the item you buy to the target/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hide this route/ }));
    expect(screen.queryByText(/The route from the item you buy/)).not.toBeInTheDocument();
  });

  /** Typing a price re-renders the panel; the route on screen is the same one and is not walked again. */
  it('keeps the drawn route while prices are typed', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.click(screen.getByRole('button', { name: 'Route from Rare · Fire + Int' }));
    await screen.findByText(/The route from the item you buy to the target/);
    await user.type(priceBox('Rare · Fire + Cast'), '12');
    expect(mocks.routeFor).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/The route from the item you buy to the target/)).toBeInTheDocument();
  });

  /** Its route is "start over": no graph can show a plan that is the from-scratch plan above it. */
  it('says so, instead of drawing a graph, when an item’s cheapest move is to start over', async () => {
    const user = userEvent.setup();
    render(<StartFromItem markov={lab()} engine={engine} rates={rates} />);
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'Route from Rare · Cast' }));
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
