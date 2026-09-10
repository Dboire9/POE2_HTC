import { describe, it, expect } from 'vitest';
import { within } from './tierFit.ts';

/**
 * One tier check serves two readers that meet a "reduced" mod with opposite signs. Its range is stored
 * negative; pasted text prints the magnitude and a profile API sends the signed value. Until 2026-09-10
 * only the text half read, so every "reduced" line from a streamer's profile came back unplaced —
 * profileItems.test.ts holds the real line that exposed it.
 */
describe('within — a "reduced" range, read from either side', () => {
  it('accepts the printed magnitude and the signed stat value alike', () => {
    expect(within([-35, -35], 35)).toBe(true);
    expect(within([-35, -35], -35)).toBe(true);
    expect(within([-13, -11], 12)).toBe(true);
    expect(within([-13, -11], -12)).toBe(true);
  });

  it('still rejects a roll the tier cannot produce, in either sign', () => {
    expect(within([-35, -35], 30)).toBe(false);
    expect(within([-35, -35], -30)).toBe(false);
    expect(within([-13, -11], 14)).toBe(false);
  });

  /** Magnitude is for negative ranges only: a positive range taking any sign would let a misread fit. */
  it('compares a positive range raw, so a negative value never fits it', () => {
    expect(within([10, 20], 15)).toBe(true);
    expect(within([10, 20], -15)).toBe(false);
  });
});
