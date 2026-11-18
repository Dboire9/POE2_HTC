// When the daily price PR merges by itself (priceDepth.mjs). The ruling of 2026-11-18: poe.ninja is
// the reference and a normal day merges unattended; only a new league or a feed-wide event holds it.

import { describe, it, expect } from 'vitest';
import { DEPTH, depthBlockers, depthIndex, keepPreviousIfThin, suspectsIn } from './priceDepth.mjs';

/** An ordinary day well into a league: nothing thin, essences churning as usual. */
const normalDay = {
  prevLeague: 'Forbidden Rites',
  league: 'Forbidden Rites',
  leagueSince: '2026-09-05',
  leagueAgeDays: 74,
  thinCount: 0,
  thinTotal: 25,
  essShare: 0.5,
};

describe('depthBlockers', () => {
  it('merges a normal day', () => {
    expect(depthBlockers(normalDay)).toEqual([]);
  });

  // Every day from 2026-11-11 to 2026-11-18 was held for this alone. The keys kept their previous
  // value, which is correct (a deleted key prices the essence at 0) — and is not a reason to hold the
  // other ~1,500 prices. `depthBlockers` is not even told about them.
  it('merges a day when essence keys had no live quote and kept their previous price', () => {
    const withRestored = { ...normalDay, restoredEssenceKeys: 26 };
    expect(depthBlockers(withRestored)).toEqual([]);
  });

  it('merges a day with one thin-and-moving currency', () => {
    expect(depthBlockers({ ...normalDay, thinCount: 1 })).toEqual([]);
  });

  it('merges at exactly a quarter thin, and holds just past it — the feed breaking, not a market', () => {
    expect(DEPTH.thinShareToBlock).toBe(0.25);
    expect(depthBlockers({ ...normalDay, thinCount: 1, thinTotal: 4 })).toEqual([]);
    const held = depthBlockers({ ...normalDay, thinCount: 7 });
    expect(held).toHaveLength(1);
    expect(held[0]).toMatch(/^7 of 25 currency\/bone lines thin and moving at once/);
  });

  it('holds a league change', () => {
    const held = depthBlockers({ ...normalDay, prevLeague: 'Runes of Aldur', leagueSince: '2026-11-18', leagueAgeDays: 0 });
    expect(held).toHaveLength(1);
    expect(held[0]).toMatch(/^LEAGUE CHANGED: Runes of Aldur -> Forbidden Rites/);
  });

  it('holds the first days of a league, and lets the day after the hold through', () => {
    const day3 = depthBlockers({ ...normalDay, leagueSince: '2026-11-16', leagueAgeDays: 2 });
    expect(day3).toHaveLength(1);
    expect(day3[0]).toMatch(/^day 3 of Forbidden Rites/);
    expect(depthBlockers({ ...normalDay, leagueAgeDays: DEPTH.leagueHoldDays - 1 })).toHaveLength(1);
    expect(depthBlockers({ ...normalDay, leagueAgeDays: DEPTH.leagueHoldDays })).toEqual([]);
  });

  it('holds when essentially every essence line moves at once', () => {
    const held = depthBlockers({ ...normalDay, essShare: DEPTH.essenceShareToBlock });
    expect(held).toHaveLength(1);
    expect(held[0]).toMatch(/^90% of essence lines moved over 50%/);
  });
});

describe('keepPreviousIfThin', () => {
  it('keeps the previous price for a thin key and takes every other quote', () => {
    const r = keepPreviousIfThin(
      { chaos: 42.26, regal_greater: 99.87, divine: 445.8 },
      { chaos: 66.07, regal_greater: 14.99, divine: 660.1 },
      new Set(['regal_greater']),
    );
    expect(r.prices).toEqual({ chaos: 42.26, regal_greater: 14.99, divine: 445.8 });
    expect(r.kept).toEqual(['regal_greater']);
    expect(r.unbacked).toEqual([]);
  });

  // Never 0, never deleted: `stepCost` reads either as a free orb.
  it('takes the thin quote, and names it, when there is no previous price to keep', () => {
    const r = keepPreviousIfThin(
      { chaos: 42.26, rib_ancient: 2448 },
      { chaos: 66.07, rib_ancient: 0 },
      new Set(['chaos', 'rib_ancient']),
    );
    expect(r.prices).toEqual({ chaos: 66.07, rib_ancient: 2448 });
    expect(r.unbacked).toEqual(['rib_ancient']);
    expect(keepPreviousIfThin({ jawbone: 6.045 }, undefined, new Set(['jawbone'])).prices).toEqual({ jawbone: 6.045 });
  });
});

describe('suspectsIn', () => {
  it('flags a line only when it is thin AND moving, reading depth as units traded', () => {
    const index = depthIndex([
      // 0.02 divine of volume at 0.001 divine each is 20 units: thin, and it moved.
      { id: 'greater-regal-orb', primaryValue: 0.001, volumePrimaryValue: 0.02, sparkline: { totalChange: 566 } },
      // Thin but flat: a quiet market, not a suspect.
      { id: 'perfect-regal-orb', primaryValue: 0.05, volumePrimaryValue: 1, sparkline: { totalChange: 10 } },
      // Moving but deep.
      { id: 'chaos', primaryValue: 0.1, volumePrimaryValue: 900, sparkline: { totalChange: -60 } },
    ]);
    const ids = [['regal_greater', 'greater-regal-orb'], ['regal_perfect', 'perfect-regal-orb'], ['chaos', 'chaos'], ['vaal', 'vaal']];
    expect(suspectsIn(index, ids, 'currency').map((x) => x.name)).toEqual(['regal_greater']);
  });
});
