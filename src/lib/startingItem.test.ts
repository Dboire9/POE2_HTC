import { describe, it, expect } from 'vitest';
import { buyAdvice } from './startingItem';
import type { EngineHolding } from './engineTypes';

const h = (present: string[], cost: number, rarity: EngineHolding['rarity'] = 'rare'): EngineHolding =>
  ({ present, cost, rarity, key: `${present.join('+')}/${rarity}` });

/** A bare cost of 100, three targets, and one deliberate trap. */
const HOLDINGS: EngineHolding[] = [
  h([], 100),
  h(['A'], 105),          // worse than nothing — takes a slot and is cheap to roll anyway
  h(['B'], 90),
  h(['C'], 80),
  h(['A', 'B'], 40),      // the best PAIR does not contain the best single
  h(['A', 'C'], 70),
  h(['B', 'C'], 60),
  h(['A', 'B', 'C'], 0),
];

describe('buyAdvice', () => {
  it('measures every row against the bare item', () => {
    const a = buyAdvice(HOLDINGS)!;
    expect(a.bare).toBe(100);
    expect(a.best[0]!.saving).toBe(100 - a.best[0]!.cost);
    expect(a.best[0]!.share).toBeCloseTo(a.best[0]!.saving / 100);
  });

  /**
   * The reason this picks per size rather than greedily. `C` is the best single at 80, but the best
   * PAIR is `A + B` at 40 — they compete for the same slots, so stacking the best singles is a
   * different and worse recommendation.
   */
  it('picks the cheapest set at each size, not the best singles stacked up', () => {
    const a = buyAdvice(HOLDINGS)!;
    expect(a.best.map((r) => r.present)).toEqual([['C'], ['A', 'B']]);
  });

  it('leaves out the empty set and the finished item', () => {
    const a = buyAdvice(HOLDINGS)!;
    for (const r of a.best) {
      expect(r.present.length).toBeGreaterThan(0);
      expect(r.present.length).toBeLessThan(3);
    }
  });

  /**
   * The least guessable thing here, and the most useful. A modifier can leave you strictly worse off
   * than an empty base — measured on a real 4-target Wand craft, `Increased Mana` does.
   */
  it('names a single modifier that leaves you worse off than an empty base', () => {
    const a = buyAdvice(HOLDINGS)!;
    expect(a.worseThanNothing.map((r) => r.present)).toEqual([['A']]);
    expect(a.worseThanNothing[0]!.saving).toBeLessThan(0);
  });

  it('says nothing when no single modifier is a trap', () => {
    const clean = HOLDINGS.filter((x) => x.present.join() !== 'A').concat([h(['A'], 95)]);
    expect(buyAdvice(clean)!.worseThanNothing).toEqual([]);
  });

  /**
   * The table weighs Rares against a bare Rare. A solve from a Magic item prices Magic starts too, and
   * a Magic row is a different item — it can still Regal — so it may not win a size, or be the base.
   */
  it('reads only the Rare rows', () => {
    const withMagic = [...HOLDINGS, h(['C'], 1, 'magic'), h(['A', 'B'], 2, 'magic')];
    expect(buyAdvice(withMagic)).toEqual(buyAdvice(HOLDINGS));
  });

  it('declines when there is nothing to advise', () => {
    expect(buyAdvice(undefined)).toBeNull();
    expect(buyAdvice([])).toBeNull();
    // No baseline to compare against.
    expect(buyAdvice([h(['A'], 5)])).toBeNull();
    // One target: "already have it" just means the craft is done.
    expect(buyAdvice([h([], 100), h(['A'], 0)])).toBeNull();
  });
});
