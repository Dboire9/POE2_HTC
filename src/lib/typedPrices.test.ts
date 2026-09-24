import { describe, it, expect, beforeEach } from 'vitest';
import { gearPriceKey, gearPrices, priceStore } from './typedPrices';
import { readPrices, writePrice } from './tabletPrices';

beforeEach(() => localStorage.clear());

describe('prices kept per kind of thing', () => {
  it('keeps each store under its own key: a tablet price never reads as an item one', () => {
    writePrice('Tablets_ritual|a', { ex: 5, unit: 'exalt' }, new Date('2026-09-24T10:00:00Z'));
    gearPrices.write('Wands|np@1', { ex: 800, unit: 'chaos' }, new Date('2026-09-24T10:00:00Z'));
    expect(readPrices()).toEqual({ 'Tablets_ritual|a': { ex: 5, on: '2026-09-24' } });
    expect(gearPrices.read()).toEqual({ 'Wands|np@1': { ex: 800, on: '2026-09-24', unit: 'chaos' } });
    expect(Object.keys(localStorage)).toEqual(expect.arrayContaining(['poe2htc.tabletPrices', 'poe2htc.gearPrices']));
    expect(priceStore('poe2htc.somethingElse').read()).toEqual({});
  });
});

describe('the finished item a price is for', () => {
  const m = (modId: string, tierDisplay = 1) => ({ modId, tierDisplay });

  it('is the same item whatever order its slots, and a slot’s alternatives, were picked in', () => {
    const key = gearPriceKey('Wands', [[m('a')], [m('c', 2), m('b')]]);
    expect(gearPriceKey('Wands', [[m('b'), m('c', 2)], [m('a')]])).toBe(key);
  });

  it('is another item at another tier, on another base, or with two slots where one had alternatives', () => {
    const key = gearPriceKey('Wands', [[m('a')], [m('b')]]);
    expect(gearPriceKey('Wands', [[m('a', 2)], [m('b')]])).not.toBe(key);
    expect(gearPriceKey('Staves', [[m('a')], [m('b')]])).not.toBe(key);
    expect(gearPriceKey('Wands', [[m('a'), m('b')]])).not.toBe(key);
  });
});
