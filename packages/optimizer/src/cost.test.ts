import { describe, it, expect } from 'vitest';
import type { PatchData, PlanResult, PlanStep } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { planExpectedCost, stepCost } from './cost.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { optimizeCost } from './optimize.ts';

// --- restart-on-first-failure formula: E = (Σ c_k · S_{k-1}) / S_n --------------------------------
describe('planExpectedCost — hand-computed restart model', () => {
  const prices: Prices = { currency: { transmute: 1, exalt: 4 }, omens: {} };
  const steps: PlanStep[] = [{ currency: 'transmute', add: 'x' }, { currency: 'exalt', add: 'y' }];
  const plan: PlanResult = {
    steps: [{ currency: 'transmute', target: 'x', prob: 0.5 }, { currency: 'exalt', target: 'y', prob: 0.25 }],
    total: 0.125,
  };

  it('matches the closed form: (c1 + p1·c2)/(p1·p2)', () => {
    // (1 + 0.5·4)/(0.5·0.25) = 3/0.125 = 24; cheap early step paid every attempt, dear step only on reach
    const c = planExpectedCost(prices, plan, steps);
    expect(c.expected).toBeCloseTo(24, 12);
    expect(c.perAttempt).toBeCloseTo(5, 12);      // 1 + 4
    expect(c.expectedAttempts).toBeCloseTo(8, 12); // 1 / 0.125
  });

  it('an unachievable plan (some step prob 0) costs Infinity', () => {
    const dead: PlanResult = { steps: [{ currency: 'transmute', target: 'x', prob: 0 }], total: 0 };
    const c = planExpectedCost(prices, dead, [{ currency: 'transmute', add: 'x' }]);
    expect(c.expected).toBe(Infinity);
    expect(c.expectedAttempts).toBe(Infinity);
  });
});

describe('stepCost — currency price plus omen surcharge', () => {
  const prices: Prices = { currency: { exalt: 1, annul: 1.5 }, omens: { OmenofSinistralExaltation: 3 } };
  it('adds the omen surcharge when a step uses an omen', () => {
    expect(stepCost(prices, { currency: 'exalt' })).toBe(1);
    expect(stepCost(prices, { currency: 'exalt', constrainTo: 'prefix' })).toBe(1 + 3);
    expect(stepCost(prices, { currency: 'annul' })).toBe(1.5);
  });
  it('unknown currencies/omens cost 0 (never NaN)', () => {
    expect(stepCost({ currency: {}, omens: {} }, { currency: 'exalt' })).toBe(0);
  });
});

describe('prices.json loads', () => {
  it('has the base currencies priced', () => {
    const p = loadPrices('data/patches/0.5');
    expect(p.currency.exalt).toBe(1);
    expect(p.currency.perfect_essence).toBeGreaterThan(0);
  });
});

// --- the decision the cost model unlocks: essence vs roll flips with price -----------------------
describe('optimizeCost — essence-vs-roll crossover', () => {
  const data: PatchData = loadPatch('data/patches/0.5');
  const wands = data.bases.get('Wands')!;
  const P1 = 'Wands/MAXIMUM_MANA';
  const P2 = 'Wands/INCREASED_SPELL_DAMAGE';
  const S1 = 'Wands/INTELLIGENCE';
  const base = { transmute: 0.002, augment: 0.01, regal: 0.15, exalt: 1 };
  const candidates = [P1, P2, S1]; // let the optimizer choose WHICH mod to guarantee (and where)
  const hasEssence = (steps: readonly PlanStep[]): boolean => steps.some((s) => s.currency === 'essence');

  it('a CHEAP essence is worth it — the cheapest plan guarantees a mod (placed last, no forced exalt)', () => {
    const prices: Prices = { currency: { ...base, essence: 0.5 }, omens: {} };
    const best = optimizeCost(data, prices, wands, [P1, P2, S1], { essenceCandidates: candidates })[0]!;
    expect(hasEssence(best.steps)).toBe(true);
    // the essence guarantees the final mod (transmute → augment → essence), avoiding an exalt (D2)
    expect(best.steps[best.steps.length - 1]!.currency).toBe('essence');
  });

  it('an EXPENSIVE essence is not — the cheapest plan rolls everything', () => {
    const prices: Prices = { currency: { ...base, essence: 1000 }, omens: {} };
    const best = optimizeCost(data, prices, wands, [P1, P2, S1], { essenceCandidates: candidates })[0]!;
    expect(hasEssence(best.steps)).toBe(false);
  });

  it('plans are returned cheapest-first with finite expected cost', () => {
    const prices: Prices = { currency: { ...base, essence: 0.5 }, omens: {} };
    const plans = optimizeCost(data, prices, wands, [P1, P2, S1], { essenceCandidates: candidates });
    for (let k = 1; k < plans.length; k++) {
      expect(plans[k - 1]!.cost.expected).toBeLessThanOrEqual(plans[k]!.cost.expected);
    }
    expect(Number.isFinite(plans[0]!.cost.expected)).toBe(true);
  });
});
