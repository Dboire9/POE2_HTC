import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Engine, EngineMarkovResult } from '../../lib/engine';
import CostSpread from './CostSpread';
import CraftToSell, { spendLines } from './CraftToSell';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

/** A settled craft of 499 ex on average; played out, the p-th percentile of rolling it costs 10p ex. */
const settled = {
  applicable: true, feasible: true, expectedCost: 499, converged: true, bound: 'exact', assumedOdds: false,
  nodes: [], edges: [],
} as unknown as EngineMarkovResult;
const replay = {
  runs: 300, seen: [], meanCost: 500, stdErr: 5, movesPerCraft: {},
  costPercentiles: Array.from({ length: 101 }, (_, p) => p * 10),
  spendByMove: [
    { label: 'Exalt', count: 40, spent: 400 },
    { label: 'Start over with a new base', count: 20, spent: 20 },
    { label: 'Exalt (Perfect)', count: 0.004, spent: 80 },
  ],
};
const engine: Engine = { data: {} as never, prices: { currency: {}, omens: {} } };

describe('what a craft can cost', () => {
  it('offers to play the plan out, and waits while a solve runs', async () => {
    const run = vi.fn();
    const { rerender } = render(<CostSpread markov={settled} rates={undefined} playOut={{ run, busy: false }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Play it out' }));
    expect(run).toHaveBeenCalledTimes(1);
    rerender(<CostSpread markov={settled} rates={undefined} playOut={{ run, busy: true }} />);
    expect(screen.getByRole('button', { name: 'Play it out' })).toBeDisabled();
  });

  it('says why a plan was not played out, rather than offering it again', () => {
    const declined = { ...settled, replayReason: 'too long a craft to play out — about 270,000 orbs and restarts a craft' };
    render(<CostSpread markov={declined} rates={undefined} playOut={{ run: vi.fn(), busy: false }} />);
    expect(screen.getByText(/Not played out/)).toHaveTextContent(
      'Not played out: too long a craft to play out — about 270,000 orbs and restarts a craft. The average above stands on its own.');
    expect(screen.queryByRole('button', { name: 'Play it out' })).toBeNull();
  });

  it('shows nothing for a cost that is only a bound — its plan is not one to follow', () => {
    const { container } = render(
      <CostSpread markov={{ ...settled, converged: false, bound: 'upper' }} rates={undefined} playOut={{ run: vi.fn(), busy: false }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls a spread from a few hundred crafts a rough read, and names the base each one counts', () => {
    render(<CostSpread markov={{ ...settled, restartCost: 1, replay }} rates={undefined} playOut={undefined} />);
    expect(screen.getByText(/crafts played out/)).toHaveTextContent(
      '300 crafts played out, following the plan below — a long craft, so a rough read; each counts the 1 ex base it starts from.');
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });
});

describe('crafting to sell', () => {
  const sell = (markov: EngineMarkovResult) => render(
    <CraftToSell
      engine={engine} markov={markov} solvedFor={{ baseId: 'Wands', targets: [{ modId: 'np', tierDisplay: 1 }] }}
      rates={undefined} sale={{ ex: 800, on: '2026-09-24' }} saleKey="Wands|np@1" onSale={vi.fn()}
    />,
  );

  it('asks for the plan played out before it says how often a craft pays', () => {
    sell({ ...settled, restartCost: 1 });
    expect(screen.getByText(/Profit per item/)).toHaveTextContent('Profit per item: about 300 ex on average');
    expect(screen.getByText(/Play it out, above/)).toBeInTheDocument();
    expect(screen.queryByText(/^One craft pays for itself/)).toBeNull();
  });

  it('counts no white base on a carved craft, and says the carved one is left out', () => {
    sell({ ...settled, replay });
    // 800 − 499: the rolling alone.
    expect(screen.getByText(/Profit per item/)).toHaveTextContent('Profit per item: about 301 ex on average');
    expect(screen.getByText(/The carved base you start from is not counted/)).toBeInTheDocument();
    expect(spendLines({ ...settled, replay })!.map((l) => l.name)).not.toContain('The white base you start from');
  });

  it('gives no verdict against a cost that is only a bound', () => {
    sell({ ...settled, restartCost: 1, converged: false, bound: 'upper' });
    expect(screen.getByText(/only a bound/)).toHaveTextContent(
      'The cost above is only a bound, so this cannot say yet whether crafting it pays — raise Search effort to settle it.');
    expect(screen.queryByText(/Profit per item|Loss per item/)).toBeNull();
  });

  it('bills every move a craft played, a rare one too, adding up to what the crafts spent', () => {
    const lines = spendLines({ ...settled, restartCost: 1, replay })!;
    expect(lines.map((l) => [l.name, l.count, l.each])).toEqual([
      ['Exalt', 40, 10],
      ['Exalt (Perfect)', 0.004, 20_000],
      ['Start over with a new base', 20, 1],
      ['The white base you start from', 1, 1],
    ]);
    expect(lines.reduce((a, l) => a + l.total, 0)).toBe(1 + replay.meanCost);
    sell({ ...settled, restartCost: 1, replay });
    const bill = screen.getByText('How is this worked out?').closest('details')!.textContent;
    // Played less than once in 200 crafts, and still a real share of the bill.
    expect(bill).toMatch(/Exalt \(Perfect\)< 0\.0120K ex80 ex/);
  });
});
