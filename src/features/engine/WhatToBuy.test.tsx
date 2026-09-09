import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import WhatToBuy from './WhatToBuy';
import type { EngineMarkovResult } from '../../lib/engine';

afterEach(cleanup);

const base = {
  applicable: true, feasible: true, expectedCost: 100, converged: true,
  bound: 'exact', assumedOdds: false, nodes: [], edges: [],
} as unknown as EngineMarkovResult;

const withHoldings = (holdings: { present: string[]; cost: number }[], over: Partial<EngineMarkovResult> = {}) =>
  ({ ...base, bareCost: 100, holdings, ...over }) as EngineMarkovResult;

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
    expect(screen.getByText(/Adds Fire \(\+5\.00%\)/)).toBeInTheDocument();
  });

  it('says every row assumes the rest of the item is empty', () => {
    render(<WhatToBuy markov={withHoldings(HOLDINGS)} />);
    expect(screen.getByText(/rest of the item is empty/)).toBeInTheDocument();
  });

  /**
   * A table of bounds compared against each other is worse than one bound: the differences between
   * them are not bounded by anything. Same rule `ItemWorth` follows.
   */
  it.each(['lower', 'upper'] as const)('draws nothing when the solve only reached a %s bound', (bound) => {
    const { container } = render(<WhatToBuy markov={withHoldings(HOLDINGS, { bound })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('draws nothing when the solver returned no lattice', () => {
    const { container } = render(<WhatToBuy markov={base} />);
    expect(container).toBeEmptyDOMElement();
  });
});
