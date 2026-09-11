import { describe, it, expect } from 'vitest';
import { bestStart, buyAdvice, parsePrice, startOptions, startSizes } from './startingItem';
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

/**
 * The Lab's "start from an item you buy instead": every item carrying k of the targets, against crafting
 * from scratch — a fresh base plus the craft, here 100.
 */
describe('startOptions', () => {
  const SCRATCH = 100;
  const rows = [
    h(['A'], 70), h(['B'], 40), h(['C'], 100), h(['A'], 55, 'magic'),
    h(['A', 'B'], 20), h(['A', 'C'], 30),
  ];
  const none = new Map<string, number>();
  const keyOf = (present: string[], rarity: 'magic' | 'rare' = 'rare') => `${present.join('+')}/${rarity}`;

  it('offers the sizes between one target and all of them', () => {
    expect(startSizes([h([], 100), ...rows, h(['A', 'B', 'C'], 0)])).toEqual([1, 2]);
    expect(startSizes(undefined)).toEqual([]);
  });

  it('prices each item as finishing from it, and what that saves against crafting from scratch', () => {
    const got = startOptions(rows, SCRATCH, 1, none);
    expect(got.map((r) => [r.present.join('+'), r.rarity, r.finish, r.worthUpTo])).toEqual([
      ['B', 'rare', 40, 60], ['A', 'magic', 55, 45], ['A', 'rare', 70, 30], ['C', 'rare', 100, 0],
    ]);
  });

  // Starting over is always a move, so an item can save nothing — but it cannot cost you more than
  // crafting from scratch, and "worth up to" must never go negative on a rounding hair.
  it('never says an item is worth less than nothing', () => {
    expect(startOptions([h(['A'], 100.0000001)], SCRATCH, 1, none)[0]!.worthUpTo).toBe(0);
  });

  /**
   * A typed price never moves a row. Ranking by the total sent a row to the top on its first digit, and
   * the box the player was looking at then belonged to another item.
   */
  it('keeps the rows in finishing order when prices are typed', () => {
    const prices = new Map([[keyOf(['B']), 50], [keyOf(['A']), 5], [keyOf(['C']), 1]]);
    const got = startOptions(rows, SCRATCH, 1, prices);
    expect(got.map((r) => [r.present.join('+'), r.rarity, r.total])).toEqual([
      ['B', 'rare', 90], ['A', 'magic', undefined], ['A', 'rare', 75], ['C', 'rare', 101],
    ]);
  });

  /**
   * The reason prices can be typed at all: the item that is cheapest to FINISH is often the dearest
   * to buy, and only the total says which start is cheaper.
   */
  it('names the priced item that costs least all in', () => {
    const got = startOptions(rows, SCRATCH, 1, new Map([[keyOf(['B']), 50], [keyOf(['A']), 5]]));
    expect(bestStart(got)).toMatchObject({ present: ['A'], rarity: 'rare', price: 5, total: 75 });
    expect(bestStart(startOptions(rows, SCRATCH, 1, none))).toBeUndefined();
  });

  it('ignores a price that is not a usable number', () => {
    const prices = new Map([[keyOf(['B']), NaN], [keyOf(['A']), -3]]);
    for (const r of startOptions(rows, SCRATCH, 1, prices)) expect(r.total).toBeUndefined();
  });

  it('keeps each size to itself', () => {
    expect(startOptions(rows, SCRATCH, 2, none).map((r) => r.present.join('+'))).toEqual(['A+B', 'A+C']);
  });
});

/** What a player types into a trade-price box, on any keyboard. */
describe('parsePrice', () => {
  it('reads a plain number, whole or not', () => {
    expect(parsePrice('12')).toBe(12);
    expect(parsePrice('0.5')).toBe(0.5);
    expect(parsePrice('.5')).toBe(0.5);
    expect(parsePrice('1.')).toBe(1); // half-typed
  });

  // The reported fault: the number box dropped the comma and read "0,5" as 5.
  it('takes a comma as the decimal point', () => {
    expect(parsePrice('0,5')).toBe(0.5);
    expect(parsePrice('12,25')).toBe(12.25);
  });

  it('drops thousands separators it can tell apart', () => {
    expect(parsePrice(' 1 250 ')).toBe(1250);
    expect(parsePrice('1 250')).toBe(1250);
    expect(parsePrice('1,250.5')).toBe(1250.5);
  });

  it('reads nothing it would have to guess at', () => {
    for (const t of ['', '  ', 'abc', '-3', '1,2,3', '1.2.3', '5 div', '1e3']) expect(parsePrice(t)).toBeUndefined();
  });
});
