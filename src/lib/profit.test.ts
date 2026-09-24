import { describe, it, expect } from 'vitest';
import { planRuns } from './profit';

/** A craft whose cost at the p-th percentile is f(p). */
const table = (f: (p: number) => number): number[] => Array.from({ length: 101 }, (_, p) => f(p));

describe('planning a run of tablet crafts', () => {
  it('needs one craft when every craft costs the same and pays', () => {
    const plan = planRuns(table(() => 10), 10, 12);
    expect(plan.best).toBe(1);
    const one = plan.rows.find((r) => r.crafts === 1)!;
    expect(one).toEqual({ crafts: 1, ahead: 1, profit: 2, bankroll: 10 });
    // Each sale comes in before the next craft: ten crafts still only ever need the one craft's cost.
    expect(plan.rows.find((r) => r.crafts === 10)).toEqual({ crafts: 10, ahead: 1, profit: 20, bankroll: 10 });
  });

  it('asks for more crafts when one craft is a gamble that pays on average', () => {
    // Half the crafts cost under 6, one in ten over 36: it averages ~12.7 against 16 back.
    const pct = table((p) => (p <= 50 ? 2 + p / 12.5 : 6 + ((p - 50) / 50) ** 3 * 60));
    const mean = pct.reduce((a, b) => a + b, 0) / pct.length;
    const plan = planRuns(pct, mean, 16);
    expect(plan.best).toBeGreaterThan(1);
    const best = plan.rows.find((r) => r.crafts === plan.best)!;
    expect(best.ahead).toBeGreaterThanOrEqual(0.9);
    expect(best.profit).toBeCloseTo(plan.best! * (16 - mean), 6);
    // Longer runs are ahead more often; one craft is not.
    const one = plan.rows.find((r) => r.crafts === 1)!;
    expect(one.ahead).toBeLessThan(0.9);
    expect(plan.rows.find((r) => r.crafts === 100)!.ahead).toBeGreaterThan(best.ahead - 0.02);
    // A run needs at least what its worst craft costs on hand, and more than a cheap one.
    expect(best.bankroll).toBeGreaterThan(pct[50]!);
  });

  it('finds no run that pays when a craft loses on average', () => {
    const plan = planRuns(table((p) => 10 + p / 10), 15, 12);
    expect(plan.best).toBeUndefined();
    expect(plan.rows.map((r) => r.crafts)).toEqual([1, 10, 100]);
    expect(plan.rows.find((r) => r.crafts === 100)!.ahead).toBeLessThan(0.1);
    expect(plan.rows.find((r) => r.crafts === 100)!.profit).toBeCloseTo(-300, 6);
  });

  it('gives the same plan every time for the same inputs', () => {
    const pct = table((p) => 1 + p);
    expect(planRuns(pct, 51, 60)).toEqual(planRuns(pct, 51, 60));
  });
});
