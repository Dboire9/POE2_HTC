import { describe, it, expect } from 'vitest';
import { exactExalts, formatCost, formatIn, pickUnit } from './currency.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';

// Real rates from the shipped sheet, so the thresholds are exercised against the actual economy
// rather than round numbers that flatter the code.
const sheet = loadPrices('data/patches/0.5.0');
const rates = { chaos: sheet.currency.chaos!, divine: sheet.currency.divine! };

describe('the unit ladder', () => {
  it('reads the real rates: a Divine is worth hundreds of Exalts', () => {
    expect(rates.chaos).toBeGreaterThan(1);
    expect(rates.divine).toBeGreaterThan(rates.chaos); // exalt < chaos < divine
  });

  // Players think in exalts for ordinary crafts. Switching at 1 Chaos (~33 ex) would render a 40-exalt
  // craft as "1.2 chaos" — finer, and worse.
  it('leaves ordinary costs in exalts', () => {
    for (const x of [0.5, 12, 300, 5_000, 10_000]) {
      expect(formatCost(x, rates)).toMatch(/ ex$/);
    }
  });

  it('escalates once the exalt figure stops being readable', () => {
    expect(formatCost(50_000, rates)).toMatch(/chaos$/);
    expect(formatCost(5_000_000, rates)).toMatch(/div$/);
  });

  // The case this was built for: a hopeless craft used to read as a wall of digits.
  it('turns a wall of digits into a quantity a player can picture', () => {
    expect(formatCost(8_219_067, rates)).toBe('22.6K div');
    // …and the exact figure is never thrown away, only moved into the title.
    expect(exactExalts(8_219_067)).toContain('8,219,067');
  });

  it('picks the SMALLEST unit that reads, not simply the biggest', () => {
    // 50,000 ex is 1,497 chaos — under the ceiling, so chaos wins over divine's coarser 137.
    expect(pickUnit(50_000, rates).key).toBe('chaos');
    expect(pickUnit(5_000_000, rates).key).toBe('divine');
  });

  it('falls back to exalts when the sheet carries no rates', () => {
    expect(formatCost(8_219_067, undefined)).toMatch(/ ex$/);
    expect(formatCost(8_219_067, {})).toMatch(/ ex$/);
  });

  it('says ∞ rather than printing a non-number', () => {
    expect(formatCost(Infinity, rates)).toBe('∞');
    expect(exactExalts(Infinity)).toBe('unbounded');
  });
});

describe('rounding', () => {
  const ex = pickUnit(1, rates);

  // A budget typed as "30" must read back as "30 ex". Trailing zeros imply a precision nobody asked
  // for and cost the reader a glance.
  it('never invents trailing zeros', () => {
    expect(formatIn(ex, 30)).toBe('30 ex');
    expect(formatIn(ex, 5)).toBe('5 ex');
    expect(formatIn(ex, 1000)).toBe('1,000 ex');
  });

  it('keeps precision where the number is small enough to need it', () => {
    expect(formatIn(ex, 0.25)).toBe('0.25 ex');
    expect(formatIn(ex, 12.34)).toBe('12.3 ex');
  });

  // A whole view shares one unit so rows stay comparable — mixing "9,800 ex" with "300 chaos" in a
  // list whose purpose is comparison defeats the point.
  it('formats every value of a view in the unit chosen for it', () => {
    const unit = pickUnit(5_000_000, rates);
    expect(formatIn(unit, 5_000_000)).toMatch(/div$/);
    expect(formatIn(unit, 12)).toMatch(/div$/); // small sibling stays in the shared unit
  });
});
