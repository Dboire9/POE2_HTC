import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { daysOld, priceKey, readPrices, writePrice } from './tabletPrices';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('prices the player typed', () => {
  it('keeps one per tablet and modifier set, whatever order they were picked in', () => {
    const key = priceKey('Tablets_ritual', ['b', 'a']);
    expect(key).toBe(priceKey('Tablets_ritual', ['a', 'b']));
    expect(key).not.toBe(priceKey('Tablets_temple', ['a', 'b']));
    writePrice(key, { ex: 2000, unit: 'exalt' }, new Date('2026-09-22T10:00:00Z'));
    expect(readPrices()[key]).toEqual({ ex: 2000, on: '2026-09-22' });
    // Typed in Divine Orbs: kept in exalts, and the unit kept so the box reads it back as typed.
    writePrice(key, { ex: 2000, unit: 'divine' }, new Date('2026-09-22T10:00:00Z'));
    expect(readPrices()[key]).toEqual({ ex: 2000, on: '2026-09-22', unit: 'divine' });
  });

  it('forgets one when the field is cleared', () => {
    const key = priceKey('Tablets_ritual', ['a']);
    writePrice(key, { ex: 10, unit: 'exalt' });
    expect(writePrice(key, undefined)[key]).toBeUndefined();
    expect(readPrices()[key]).toBeUndefined();
  });

  it('says how old a price is, so a stale one can say so', () => {
    const on = { ex: 1, on: '2026-09-15' };
    expect(daysOld(on, new Date('2026-09-22T23:00:00Z'))).toBe(7);
    expect(daysOld(on, new Date('2026-09-15T01:00:00Z'))).toBe(0);
    expect(daysOld({ ex: 1, on: 'not a date' })).toBe(0);
  });

  /** Storage is a place other things write too, and it throws outright in a private window. */
  it('ignores what it cannot read, and still renders when storage throws', () => {
    localStorage.setItem('poe2htc.tabletPrices', '{"good":{"ex":5,"on":"2026-09-22"},"bad":{"ex":"lots"},"worse":7,"odd":{"ex":5,"on":"2026-09-22","unit":"mirror"}}');
    expect(readPrices()).toEqual({ good: { ex: 5, on: '2026-09-22' } });

    localStorage.setItem('poe2htc.tabletPrices', 'not json');
    expect(readPrices()).toEqual({});

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => writePrice('k', { ex: 1, unit: 'exalt' })).not.toThrow();
  });
});
