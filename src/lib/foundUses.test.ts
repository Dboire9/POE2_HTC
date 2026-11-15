import { describe, it, expect } from 'vitest';
import { countWords, currencyName } from './foundUses';

// A found-basis result is read as counts (foundUses.ts): averages, worded so a new player can picture them.
describe('countWords', () => {
  it('rounds a count of one or more to the nearest whole one', () => {
    expect(countWords(1.83)).toBe('about 2');
    expect(countWords(1)).toBe('about 1');
    expect(countWords(23.4)).toBe('about 23');
  });

  it('says "about 1" for a count close enough to one, never "about 0"', () => {
    expect(countWords(0.81)).toBe('about 1');
    expect(countWords(0.7)).toBe('about 1');
  });

  it('says how many crafts share one, for a count well below one', () => {
    expect(countWords(0.19)).toBe('about 1 for every 5 crafts');
    expect(countWords(0.5)).toBe('about 1 for every 2 crafts');
    expect(countWords(0.01)).toBe('about 1 for every 100 crafts');
  });
});

describe('currencyName', () => {
  it('names an orb as the found sheet does, and an Essence as the route does', () => {
    expect(currencyName({ key: 'transmute', label: 'Transmute' })).toBe('Orb of Transmutation');
    expect(currencyName({ key: 'augment', label: 'Augment' })).toBe('Orb of Augmentation');
    expect(currencyName({ key: 'essence:lesser:Bows/Essence_PhysicalDamage', label: 'Lesser Essence of Abrasion' }))
      .toBe('Lesser Essence of Abrasion');
    expect(currencyName({ key: 'OmenofLight', label: 'Omen of Light' })).toBe('Omen of Light');
  });
});
