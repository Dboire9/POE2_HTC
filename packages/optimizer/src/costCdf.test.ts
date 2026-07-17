import { describe, it, expect } from 'vitest';
import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';
import type { Prices } from './cost.ts';
import { planCostCdf, planExpectedCost } from './cost.ts';
import { mulberry32 } from './simulate.ts';

// Synthetic plans: step costs come straight off the price sheet (transmute = 1ex, exalt = 2ex), so
// every atom is hand-computable. No engine, no data — this tests the cost math in isolation.
const prices: Prices = { currency: { transmute: 1, exalt: 2 }, omens: {} };
const steps = (...cur: ('transmute' | 'exalt')[]): PlanStep[] =>
  cur.map((currency) => ({ currency, add: 'X' }) as PlanStep);
const result = (...probs: number[]): PlanResult => ({
  steps: probs.map((prob) => ({ currency: 'exalt' as const, target: 'X', prob })),
  total: probs.reduce((a, b) => a * b, 1),
});

/** Commensurable prices ⇒ the quantum divides every atom ⇒ a single exact value, no bracket. */
const exactly = (b: { lower: number; upper: number; exact: boolean }, want: number): void => {
  expect(b.exact).toBe(true);
  expect(b.lower).toBe(b.upper);
  expect(b.lower).toBeCloseTo(want, 9);
};

describe('planCostCdf — one step, against the closed-form geometric', () => {
  // One transmute (cost 1) at p = ½. Each attempt costs exactly 1 and lands with prob ½, so the number
  // of attempts N ~ Geometric(½) and the total cost IS N. Hence P(cost ≤ k) = P(N ≤ k) = 1 − 2^−k.
  const [s, r] = [steps('transmute'), result(1 / 2)];

  it('matches 1 − 2^−k exactly at every integer budget', () => {
    for (const k of [1, 2, 3, 4, 5, 8, 17]) {
      exactly(planCostCdf(prices, r, s, k), 1 - Math.pow(2, -k));
    }
  });

  it('is 0 below the price of a single attempt', () => {
    expect(planCostCdf(prices, r, s, 0.999).upper).toBe(0);
  });

  it('is monotone in the budget and → 1 as the budget grows', () => {
    let prev = -1;
    for (const b of [1, 2, 5, 10, 20, 50]) {
      const p = planCostCdf(prices, r, s, b).lower;
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
    expect(planCostCdf(prices, r, s, 200).lower).toBeGreaterThan(0.999);
  });

  it('a budget between two jumps reads the lower step (the CDF is a staircase)', () => {
    // Costs are integers, so the CDF only moves at 1, 2, 3… P(≤4.7) must equal P(≤4), not interpolate.
    exactly(planCostCdf(prices, r, s, 4.7), 1 - Math.pow(2, -4));
  });
});

describe('planCostCdf — incommensurable prices fall back to a bracket, honestly', () => {
  // An irrational price has no exact quantum at ≤6dp, so the DP must round — and must SAY it rounded
  // rather than quietly reporting a point estimate.
  const odd: Prices = { currency: { transmute: Math.PI }, omens: {} };
  const [s, r] = [steps('transmute'), result(1 / 2)];

  it('flags exact:false and still brackets the true value', () => {
    const b = planCostCdf(odd, r, s, 4 * Math.PI); // exactly 4 attempts fit ⇒ true P = 1 − 2⁻⁴
    expect(b.exact).toBe(false);
    const want = 1 - Math.pow(2, -4);
    expect(b.lower).toBeLessThanOrEqual(want + 1e-9);
    expect(b.upper).toBeGreaterThanOrEqual(want - 1e-9);
  });

  it('brackets tighter as the cell cap rises', () => {
    const coarse = planCostCdf(odd, r, s, 50, { maxCells: 64 });
    const fine = planCostCdf(odd, r, s, 50, { maxCells: 500_000 });
    expect(fine.upper - fine.lower).toBeLessThan(coarse.upper - coarse.lower);
  });
});

describe('planCostCdf — two steps, hand-computed recursion', () => {
  // transmute (c=1, p=½) then exalt (c=2, p=½). S_1=½, S_2=¼, C=3.
  // Branches: succeed ¼ @3 · miss@1 ½ @1 · miss@2 ¼ @3.
  //   g(x) = ¼·1[3≤x] + ½·g(x−1) + ¼·g(x−3)
  //   g(0)=g(1)=g(2)=0;  g(3)=¼;  g(4)=¼+½·¼=⅜;  g(5)=¼+½·⅜=7/16
  const [s, r] = [steps('transmute', 'exalt'), result(1 / 2, 1 / 2)];

  it('reproduces the hand-computed g(3), g(4), g(5)', () => {
    exactly(planCostCdf(prices, r, s, 3), 1 / 4);
    exactly(planCostCdf(prices, r, s, 4), 3 / 8);
    exactly(planCostCdf(prices, r, s, 5), 7 / 16);
  });

  it('cannot finish below the cost of one clean run', () => {
    expect(planCostCdf(prices, r, s, 2.99).upper).toBe(0);
  });

  it('converges to 1, and the expected cost (8ex) is roughly the coin-flip point', () => {
    // E = (c₁·S₀ + c₂·S₁)/S₂ = (1 + 1)/¼ = 8 — and P(finish within E) is nowhere near certain, which
    // is the entire reason this function exists rather than just reporting `expected`.
    expect(planExpectedCost(prices, r, s).expected).toBeCloseTo(8, 9);
    expect(planCostCdf(prices, r, s, 8).lower).toBeLessThan(0.75);
    expect(planCostCdf(prices, r, s, 1000).lower).toBeGreaterThan(0.999);
  });
});

/**
 * Ground truth by simulation: actually play the restart-on-first-failure game with a wallet. Mirrors
 * the recursion's semantics exactly — pay for each step as you attempt it, and on a miss restart only
 * if you can still afford to; a run counts only if the item COMPLETES with total spend ≤ budget.
 * (simulate.ts's own harness checks per-step probabilities, not cost accumulation across restarts, so
 * it can't reach this — but its deterministic PRNG keeps the check reproducible.)
 */
function simulateInBudget(
  probs: readonly number[], costs: readonly number[], budget: number, runs: number, seed = 7,
): number {
  const rng = mulberry32(seed);
  let ok = 0;
  for (let r = 0; r < runs; r++) {
    let spent = 0;
    for (let guard = 0; guard < 100_000; guard++) {
      let failed = false;
      for (let k = 0; k < probs.length; k++) {
        spent += costs[k]!;
        if (rng() >= probs[k]!) {
          failed = true;
          break;
        }
      }
      if (spent > budget) break; // bust: couldn't have paid for that
      if (!failed) {
        ok++;
        break;
      }
    }
  }
  return ok / runs;
}

describe('planCostCdf — Monte-Carlo cross-check (analytic first, MC to verify)', () => {
  it('matches 100k simulated runs of the same wallet at every budget', () => {
    // transmute(1ex, p=.5) → exalt(2ex, p=.4) → exalt(2ex, p=.6). C = 5, S₃ = .12, E = 2.4/.12 = 20ex.
    const s = steps('transmute', 'exalt', 'exalt');
    const r = result(0.5, 0.4, 0.6);
    const probs = [0.5, 0.4, 0.6];
    const costs = [1, 2, 2];
    for (const budget of [5, 12, 20, 40, 90]) {
      const analytic = planCostCdf(prices, r, s, budget);
      const mc = simulateInBudget(probs, costs, budget, 100_000);
      expect(analytic.exact).toBe(true);
      expect(analytic.lower).toBeCloseTo(mc, 2); // 100k runs ⇒ SE ≈ 0.0016
    }
  });

  it('agrees with MC on a lopsided plan (a dear last step paid rarely)', () => {
    // The case the restart model exists for: the 15ex step is only reached 5% of the time.
    const lop: Prices = { currency: { transmute: 0.5, exalt: 15 }, omens: {} };
    const s = steps('transmute', 'exalt');
    const r = result(0.05, 0.8);
    const mc = simulateInBudget([0.05, 0.8], [0.5, 15], 60, 100_000);
    expect(planCostCdf(lop, r, s, 60).lower).toBeCloseTo(mc, 2);
  });
});

describe('planCostCdf — degenerate inputs', () => {
  it('an impossible plan (p=0) never finishes, at any budget', () => {
    const b = planCostCdf(prices, result(0), steps('transmute'), 1e6);
    expect(b).toEqual({ lower: 0, upper: 0, exact: true });
  });

  it('a certain plan finishes iff the budget covers one run', () => {
    const [s, r] = [steps('transmute', 'exalt'), result(1, 1)]; // C = 3, never misses
    expect(planCostCdf(prices, r, s, 3).lower).toBeCloseTo(1, 9);
    expect(planCostCdf(prices, r, s, 2.99).upper).toBe(0);
  });

  it('a free plan finishes within any budget (no self-loop hang)', () => {
    // Every step costs 0 and misses half the time: the zero-cost failure branch is a g(x) self-loop.
    // Solved algebraically, not by recursion — if this hangs or NaNs, the q0 guard is broken.
    const free: Prices = { currency: { transmute: 0 }, omens: {} };
    const b = planCostCdf(free, result(1 / 2), steps('transmute'), 10);
    expect(b).toEqual({ lower: 1, upper: 1, exact: true });
  });

  it('a negative budget is never satisfiable', () => {
    expect(planCostCdf(prices, result(1 / 2), steps('transmute'), -5)).toEqual({ lower: 0, upper: 0, exact: true });
  });

  it('an empty plan is already done, for free', () => {
    expect(planCostCdf(prices, result(), [], 0)).toEqual({ lower: 1, upper: 1, exact: true });
  });

  it('a realistic price sheet stays exact and cheap (0.1 quantum ⇒ ~2000 cells for 200ex)', () => {
    // The case the whole quantum design exists for: 0.2ex chaos orbs against a 200ex budget would
    // drift ~49ex on a fixed 4096-cell grid. Dividing the prices instead, it is exact.
    const real: Prices = { currency: { chaos: 0.2, exalt: 1, annul: 1.5 }, omens: {} };
    const rs: PlanStep[] = [
      { currency: 'chaos', remove: 'A', add: 'B' }, { currency: 'exalt', add: 'C' }, { currency: 'annul', remove: 'D' },
    ];
    const b = planCostCdf(real, result(0.3, 0.25, 0.5), rs, 200);
    expect(b.exact).toBe(true);
    expect(b.lower).toBe(b.upper);
    expect(b.lower).toBeGreaterThan(0);
    expect(b.lower).toBeLessThan(1);
  });
});
