import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import WhatToBuy from './WhatToBuy';
import type { EngineMarkovResult } from '../../lib/engine';

afterEach(cleanup);

const base = {
  applicable: true, feasible: true, expectedCost: 100, converged: true,
  bound: 'exact', assumedOdds: false, nodes: [], edges: [],
} as unknown as EngineMarkovResult;

// Every fixture row is a Rare — the only rows the table reads (see `buyAdvice`).
const withHoldings = (holdings: { present: string[]; cost: number }[], over: Partial<EngineMarkovResult> = {}) =>
  ({ ...base, bareCost: 100, holdings: holdings.map((h) => ({ ...h, rarity: 'rare', key: h.present.join('+') })), ...over }) as EngineMarkovResult;

const HOLDINGS = [
  { present: [], cost: 100 },
  { present: ['Adds Fire'], cost: 105 },
  { present: ['Adds Cold'], cost: 90 },
  { present: ['Adds Fire', 'Adds Cold'], cost: 40 },
  { present: ['Adds Fire', 'Adds Cold', 'Adds Lightning'], cost: 0 },
  { present: ['Adds Lightning'], cost: 80 },
];

describe('what to look for when buying a base', () => {
  it('shows the best set at each size, against the bare baseline', () => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS)} />);
    expect(screen.getByText(/What to look for/i)).toBeInTheDocument();
    expect(screen.getByText('Adds Lightning')).toBeInTheDocument();
    expect(screen.getByText('Adds Fire + Adds Cold')).toBeInTheDocument();
  });

  /**
   * The claim and its evidence must arrive together. An earlier draft called these a trap; measured
   * across seven real crafts the effect is +0.03% to +0.20%, so the panel prints the number and lets
   * the reader judge rather than supplying the adjective.
   */
  it('prints how much a worth-nothing modifier actually costs you', () => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS)} />);
    expect(screen.getByText(/Worth nothing on its own/)).toBeInTheDocument();
    expect(screen.getByText(/Worth nothing on its own/).closest('p')!.textContent)
      .toMatch(/Adds Fire \(\+5%\)/);
  });

  /**
   * ONE unit across the table. A real solve rendered as "123K div / 120.6K div / 4,781 chaos" —
   * `formatCost` picks per value, and a table is read by comparing rows.
   */
  it('renders every row in the same unit', () => {
    // Spread across three orders of magnitude, with rates that make chaos and divine both reachable.
    const spread = [
      { present: [], cost: 4_000_000 },
      { present: ['A'], cost: 3_500_000 },
      { present: ['B'], cost: 900_000 },
      { present: ['A', 'B'], cost: 40 },
      { present: ['A', 'B', 'C'], cost: 0 },
      { present: ['C'], cost: 3_900_000 },
    ];
    render(<WhatToBuy
      markov={withHoldings(spread, { bareCost: 4_000_000 })}
      rates={{ chaos: 0.4, divine: 200 }}
    />);
    const cells = screen.getAllByRole('cell').filter((_, i) => i % 3 === 1);
    const units = new Set(cells.map((c) => c.textContent.replace(/[\d.,\s]/g, '')));
    expect(units.size, `mixed units: ${[...units].join(', ')}`).toBe(1);
  });

  /** +0.00% reads as a bug and undercuts the claim beside it; the traps go down to +0.03%. */
  it('never rounds a real difference away to zero', () => {
    const tiny = [
      { present: [], cost: 100_000 },
      { present: ['A'], cost: 100_003 },
      { present: ['B'], cost: 90_000 },
      { present: ['A', 'B'], cost: 40_000 },
      { present: ['A', 'B', 'C'], cost: 0 },
      { present: ['C'], cost: 95_000 },
    ];
    render(<WhatToBuy markov={withHoldings(tiny, { bareCost: 100_000 })} />);
    expect(screen.getByText(/Worth nothing on its own/).closest('p')!.textContent)
      .toMatch(/\+<0\.01%/);
  });

  it('says every row assumes the rest of the item is empty', () => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS)} />);
    expect(screen.getByText(/rest of the item is empty/)).toBeInTheDocument();
  });

  /**
   * A table of bounds compared against each other is worse than one bound: the differences between
   * them are not bounded by anything. Same rule `ItemWorth` follows.
   */
  it.each(['lower', 'upper'] as const)('draws no TABLE when the solve only reached a %s bound', (bound) => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS, { bound })} />);
    expect(screen.queryByRole('table')).toBeNull();
  });

  /**
   * Hidden, but not invisible. A craft asking three T1 prefixes on a Wand returns a floor at the
   * default effort, so silently returning null would leave a common case with no sign the question
   * has an answer at all. Raising effort IS the fix there — measured at ~2.3M sweeps and ~262 s,
   * inside Exhaustive's cap — so the note must point at that control rather than away from it.
   */
  it('says why the table is missing, and points at Search effort', () => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS, { bound: 'lower' })} />);
    expect(screen.getByText(/What to look for when you buy one/)).toBeInTheDocument();
    expect(screen.getByText(/only reached a floor/)).toBeInTheDocument();
    expect(screen.getByText(/Raise/)).toBeInTheDocument();
  });

  it('draws nothing when the solver returned no lattice', () => {
    const { container } = render(<WhatToBuy markov={base} />);
    expect(container).toBeEmptyDOMElement();
  });
});
