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
    expect(screen.getByText(/estimates/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-05/)).toBeInTheDocument();
    // …and is explicit that the ODDS are not the estimated part, so the caveat isn't over-read.
    expect(screen.getByText(/odds are exact/i)).toBeInTheDocument();
  });

  it('does not cry wolf when a sheet is real market data', () => {
    render(<PriceBasisNote basis={{ estimated: false, asOf: '2026-07-05', unit: 'exalt-equivalent' }} />);
    expect(screen.queryByText(/estimates/i)).toBeNull();
    expect(screen.getByText(/prices as of 2026-07-05/i)).toBeInTheDocument();
  });

  // A part-observed sheet must not be described as wholly hand-authored: that understates the numbers
  // just as badly as the old no-caveat version overstated them, and it would train users to ignore the
  // warning on the keys that genuinely ARE guesses.
  it('names what is actually estimated rather than condemning the whole sheet', () => {
    render(<PriceBasisNote basis={{ estimated: true, caveat: 'Currency and omen prices are live; essence prices are guesses.' }} />);
    expect(screen.getByText(/essence prices are guesses/i)).toBeInTheDocument();
    expect(screen.queryByText(/hand-authored estimates/i)).toBeNull();
  });

  it('falls back to the blanket wording when a sheet says nothing more specific', () => {
    render(<PriceBasisNote basis={{ estimated: true }} />);
    expect(screen.getByText(/hand-authored estimates, not live market data/i)).toBeInTheDocument();
  });
});

describe('the rendered sentence reads as English', () => {
  // REGRESSION. The caveat used to be spliced mid-sentence after "but", which only worked while it
  // was a lowercase fragment; a sheet describing itself in a full sentence produced
  // "…but All prices are live market data, except ….  (2026-08-22), patch 0.5.0."
  it('never runs a capitalised caveat into the middle of a clause', () => {
    const { container } = render(
      <PriceBasisNote basis={{ estimated: true, caveat: 'All prices are live market data, except essences.', asOf: '2026-08-22', patch: '0.5.0' }} />,
    );
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbut [A-Z]/);        // no capital letter mid-clause
    expect(text).not.toMatch(/\)[,;]\s*patch/i);     // the patch belongs INSIDE the parenthetical
    expect(text).toMatch(/except essences\. \(2026-08-22, patch 0\.5\.0\) The odds are exact/);
  });
});

describe('priceBasis — reads the shipped sheet honestly', () => {
  it('flags the shipped 0.5.0 prices as estimated, from their own stated provenance', () => {
    const basis = priceBasis({ prices: loadPrices('data/patches/0.5.0') });
    // Everything is live poe.ninja data now — currency, desecration bones, per-essence prices and the
    // hand-transcribed omen quotes. What remains inferred is the handful of essence variants nobody is
    // currently trading, so the sheet stays `estimated` but names exactly that.
    expect(basis.estimated).toBe(true);
    expect(basis.caveat).toMatch(/live market data/i);
    expect(basis.caveat).toMatch(/essence/i);
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

// The desecrated spawn weight is ASSUMED (poe2db publishes none; we set 1000). An unomened Desecration
// draws by weight from the combined normal ∪ desecrated pool, so those odds inherit the assumption —
// a ~900x judgement call. The user's requirement is that the app say so rather than keep claiming the
// odds are exact. A BOSS-omened Desecration is count-uniform and ignores weights, so it must NOT be
// caught by this: warning on everything is the overclaim in the opposite direction.
describe('PriceBasisNote — the assumed desecration weight', () => {
  const basis = { estimated: true, caveat: 'Prices are live.', asOf: '2026-08-23' };

  it('claims exact odds by default, because they normally are', () => {
    render(<PriceBasisNote basis={basis} />);
    expect(screen.getByText(/odds are exact/i)).toBeInTheDocument();
    expect(screen.queryByText(/assumed/i)).toBeNull();
  });

  it('drops that claim and names the assumption when a plan desecrates without an omen', () => {
    const { container } = render(<PriceBasisNote basis={basis} exactOdds={false} />);
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toMatch(/Desecration without a boss omen/i);
    expect(text).toMatch(/assumed/i);
    // It must not simultaneously insist the odds are exact.
    expect(text).not.toMatch(/odds are exact/i);
    // …and it must not overcorrect into "everything here is a guess".
    expect(text).toMatch(/every other probability here is exact/i);
  });

  it('says so even on a sheet with no price caveat, where the note is otherwise absent', () => {
    const { container } = render(
      <PriceBasisNote basis={{ estimated: false, unit: 'exalt-equivalent' }} exactOdds={false} />,
    );
    expect((container.textContent ?? '')).toMatch(/assumed/i);
  });
});
