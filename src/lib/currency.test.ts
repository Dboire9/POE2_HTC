import { describe, it, expect } from 'vitest';
import { exactExalts, formatChance, formatCost, formatCount, formatIn, formatOdds, pickUnit } from './currency.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';

// Real rates from a real sheet, so the thresholds are exercised against the actual economy rather
// than round numbers that flatter the code — but a FROZEN one, because this file asserts the exact
// string the ladder produces ("22.6K div") and the shipped sheet now refreshes daily. The economy
// this reads is real; it is simply always 2026-09-01's. See frozenPrices.ts.
const sheet = loadFrozenPrices();
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
  });

  // The top of the ladder: past 10,000 divine no unit brings the figure back under the ceiling, and
  // that is where True expected cost lives on a long-shot craft. It read "6.8B div" — a suffix the
  // reader has to decode — before words started at a million.
  it('says a figure past the end of the ladder in words', () => {
    expect(formatCost(2.46e12, rates)).toMatch(/^[\d.,]+ billion div$/);
    expect(formatCost(2.46e12, rates)).not.toMatch(/[BMKT] div/);
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

// ── Counts and chances ───────────────────────────────────────────────────────
// Same defect as the costs above, one quantity over: a true number in a form nobody can read. These
// asserted `fmtAttempts` in FrontierView.test before the formatter moved here.

describe('formatCount — readable at every scale', () => {
  it('keeps a decimal where one carries information', () => {
    expect(formatCount(1.6)).toBe('1.6');
    expect(formatCount(7.3)).toBe('7.3');
    expect(formatCount(999.4)).toBe('999.4');
  });

  it('groups the middle of the range instead of running the digits together', () => {
    expect(formatCount(2500)).toBe('2,500');
    expect(formatCount(730_000)).toBe('730,000');
  });

  // Was "1050000000000.0 attempts" on the reported 6-mod T1 Wand, then "1.1e+12" once separators
  // stopped helping. An exponent is not a form a player reads; the word is.
  it('says the magnitude in words rather than an exponent', () => {
    expect(formatCount(1.05e12)).toBe('1.1 trillion');
    expect(formatCount(2.6e11)).toBe('260 billion');
    expect(formatCount(5.1e9)).toBe('5.1 billion');
    expect(formatCount(2.5e6)).toBe('2.5 million');
  });

  // Intl stops at "trillion" and lets the mantissa run, so grouping has to stay on above it.
  it('groups the mantissa where Intl runs out of words', () => {
    expect(formatCount(2.4728e15)).toBe('2,472.8 trillion');
  });

  it('says infinity rather than NaN', () => {
    expect(formatCount(Infinity)).toBe('∞');
  });
});

describe('formatChance — a percentage until a percentage stops reading', () => {
  it('stays a percentage while one can be read at a glance', () => {
    expect(formatChance(0.7037)).toBe('70.37%');
    expect(formatChance(0.004)).toBe('0.400%');
    expect(formatChance(0.0001)).toBe('0.010%');
  });

  // THE string this was built for. `toPrecision(2)` gives up below 1e-7 and emits "3.9e-10%" — the
  // form a 6-mod T1 Wand's chance per attempt actually rendered in.
  it('never emits an exponent', () => {
    expect(formatChance(3.9e-12)).toBe('1 in 256.4 billion');
    expect(formatChance(1.9e-7)).toBe('1 in 5.3 million');
    for (const p of [1e-3, 1e-5, 1e-8, 1e-11, 1e-14, 3.9e-12, 1.77e-7]) {
      expect(formatChance(p)).not.toMatch(/e[+-]/);
    }
  });

  it('reciprocates without losing the value', () => {
    for (const p of [1e-5, 4.2e-7, 3.9e-12]) {
      const shown = Number(/1 in ([\d.,]+)/.exec(formatOdds(p))![1]!.replace(/,/g, ''));
      const scale = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
      const word = Object.keys(scale).find((w) => formatOdds(p).includes(w));
      const n = shown * (word ? scale[word as keyof typeof scale] : 1);
      expect(Math.abs(n - 1 / p) / (1 / p)).toBeLessThan(0.01);
    }
  });

  it('does not divide by zero', () => {
    expect(formatChance(0)).toBe('0%');
    expect(formatChance(-1)).toBe('0%');
  });
});
