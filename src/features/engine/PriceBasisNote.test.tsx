import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceBasisNote from './PriceBasisNote';
import { indexPrices } from '../../../packages/optimizer/src/cost.ts';
import { loadPrices } from '../../../packages/optimizer/src/loadPrices.ts';
import { priceBasis } from '../../lib/engine';

// Costs in this app are exact probabilities multiplied by a price sheet. The shipped sheet is now part
// observed (currency and omens from poe.ninja) and part hand-authored (desecration, essence levels),
// so these pin that the UI says which is which — a dropped caveat would put false precision back in
// front of users, and a blanket one would understate numbers that are in fact live.
describe('PriceBasisNote', () => {
  it('calls estimated prices estimates, and names the date so staleness is visible', () => {
    render(<PriceBasisNote basis={{ estimated: true, asOf: '2026-07-05', patch: '0.5.0' }} />);
    expect(screen.getByText(/partly estimated/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-05/)).toBeInTheDocument();
    // …and is explicit that the ODDS are not the estimated part, so the caveat isn't over-read.
    expect(screen.getByText(/odds are exact/i)).toBeInTheDocument();
  });

  it('does not cry wolf when a sheet is real market data', () => {
    render(<PriceBasisNote basis={{ estimated: false, asOf: '2026-07-05', unit: 'exalt-equivalent' }} />);
    expect(screen.queryByText(/partly estimated/i)).toBeNull();
    expect(screen.getByText(/prices as of 2026-07-05/i)).toBeInTheDocument();
  });

  // A part-observed sheet must not be described as wholly hand-authored: that understates the numbers
  // just as badly as the old no-caveat version overstated them, and it would train users to ignore the
  // warning on the keys that genuinely ARE guesses.
  it('names what is actually estimated rather than condemning the whole sheet', () => {
    render(<PriceBasisNote basis={{ estimated: true, caveat: 'Currency and omen prices are live; essence prices are guesses.' }} />);
    expect(screen.getByText(/essence prices are guesses/i)).toBeInTheDocument();
    expect(screen.queryByText(/hand-authored, not live market data/i)).toBeNull();
  });

  it('falls back to the blanket wording when a sheet says nothing more specific', () => {
    render(<PriceBasisNote basis={{ estimated: true }} />);
    expect(screen.getByText(/hand-authored, not live market data/i)).toBeInTheDocument();
  });
});

describe('priceBasis — reads the shipped sheet honestly', () => {
  it('flags the shipped 0.5.0 prices as estimated, from their own stated provenance', () => {
    const basis = priceBasis({ prices: loadPrices('data/patches/0.5.0') });
    // Currency and omens are live poe.ninja data now, but desecration and essence levels are still
    // hand-authored, so the sheet keeps `estimated: true` and explains itself via `caveat`.
    expect(basis.estimated).toBe(true);
    expect(basis.caveat).toMatch(/desecration and essence/i);
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
