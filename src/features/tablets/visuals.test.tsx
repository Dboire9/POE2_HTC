import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ProfitVerdict } from './ProfitVerdict';
import { RiskChart } from './RiskChart';

afterEach(cleanup);
const fmt = (ex: number): string => `${Math.round(ex)} ex`;

describe('the profit verdict', () => {
  it('sets what you spend against what you get, on one scale, and says the difference', () => {
    render(<ProfitVerdict spend={100} salePrice={150} salesOnWay={20} fmt={fmt} />);
    const verdict = screen.getByRole('img');
    expect(verdict).toHaveAttribute('aria-label', 'You spend about 100 ex and get about 170 ex: a profit of 70 ex a tablet.');
    expect(verdict.textContent).toMatch(/Profit per tablet: about 70 ex.*counting what you sell on the way/);
    // The larger of the two fills the track; the other is drawn to the same scale.
    const fills = [...verdict.querySelectorAll<HTMLElement>('[style]')].map((e) => e.style.width);
    expect(fills).toEqual([`${(100 * 100) / 170}%`, `${(100 * 150) / 170}%`, `${(100 * 20) / 170}%`]);
  });

  it('says a loss as a loss, and asks for a price before it has one', () => {
    render(<ProfitVerdict spend={1000} salePrice={200} salesOnWay={0} fmt={fmt} />);
    expect(screen.getByText(/Loss per tablet: about 800 ex/)).toHaveTextContent('buying one is cheaper');
    cleanup();
    render(<ProfitVerdict spend={1000} salePrice={undefined} salesOnWay={0} fmt={fmt} />);
    expect(screen.getByText(/Type what it sells for/)).toBeInTheDocument();
  });
});

describe('the risk chart', () => {
  const pct = Array.from({ length: 101 }, (_, p) => 10 * p); // the p-th percentile craft costs 10p

  it('marks how often a craft finishes within what it sells for', () => {
    render(<RiskChart percentiles={pct} mean={400} salePrice={505} fmt={fmt} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '50% of crafts finish within the 505 ex it sells for.');
    expect(screen.getByText('50% finish within 505 ex')).toBeInTheDocument();
    expect(screen.getByText('average 400 ex')).toBeInTheDocument();
  });

  it('reads the spread before a price is typed, and draws nothing without one', () => {
    render(<RiskChart percentiles={pct} mean={400} salePrice={undefined} fmt={fmt} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Half the crafts finish within 500 ex, nine in ten within 900 ex.');
    cleanup();
    const { container } = render(<RiskChart percentiles={[]} mean={400} salePrice={undefined} fmt={fmt} />);
    expect(container.innerHTML).toBe('');
  });
});
