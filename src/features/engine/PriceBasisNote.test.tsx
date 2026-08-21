import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceBasisNote from './PriceBasisNote';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';
import { loadPrices } from '../../../packages/optimizer/src/loadPrices.ts';
import { priceBasis } from '../../lib/engine';

// Costs in this app are exact probabilities multiplied by a price sheet, and the shipped sheet says of
// itself that it is hand-authored order-of-magnitude estimates. These pin that the UI admits it — a
// silently-dropped caveat would put false precision back in front of users.
describe('PriceBasisNote', () => {
  it('calls estimated prices estimates, and names the date so staleness is visible', () => {
    render(<PriceBasisNote basis={{ estimated: true, asOf: '2026-07-05', patch: '0.5.0' }} />);
    expect(screen.getByText(/rough estimates/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-05/)).toBeInTheDocument();
    // …and is explicit that the ODDS are not the estimated part, so the caveat isn't over-read.
    expect(screen.getByText(/odds are exact/i)).toBeInTheDocument();
  });

  it('does not cry wolf when a sheet is real market data', () => {
    render(<PriceBasisNote basis={{ estimated: false, asOf: '2026-07-05', unit: 'exalt-equivalent' }} />);
    expect(screen.queryByText(/rough estimates/i)).toBeNull();
    expect(screen.getByText(/prices as of 2026-07-05/i)).toBeInTheDocument();
  });
});

describe('priceBasis — reads the shipped sheet honestly', () => {
  it('flags the shipped 0.5.0 prices as estimated, from their own stated provenance', () => {
    const basis = priceBasis({ prices: loadPrices('data/patches/0.5.0') });
    // prices.json's own `source` says "SEED ESTIMATES — hand-authored … order-of-magnitude".
    expect(basis.estimated).toBe(true);
    expect(basis.patch).toBe('0.5.0');
    expect(basis.asOf).toBeTruthy();
  });

  it('assumes estimated when a sheet carries no provenance at all — never overclaims', () => {
    const bare = indexPrices({ prices: { exalt: 1 } });
    expect(priceBasis({ prices: bare }).estimated).toBe(true);
  });

  it('believes a sheet that explicitly declares itself observed', () => {
    const live = indexPrices({ prices: { exalt: 1 }, source: 'poe2scout live snapshot', estimated: false });
    expect(priceBasis({ prices: live }).estimated).toBe(false);
  });
});
