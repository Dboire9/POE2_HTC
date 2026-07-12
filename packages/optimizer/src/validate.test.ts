import { describe, it, expect } from 'vitest';
import type { PatchData, PlanStep } from '../../engine/src/index.ts';
import { evaluatePlan, loadPatch } from '../../engine/src/index.ts';
import { loadPrices } from './loadPrices.ts';
import { planExpectedCost } from './cost.ts';
import { mcPerStepRates, mcPlanCost } from './validate.ts';

const data: PatchData = loadPatch('data/patches/0.5');
const prices = loadPrices('data/patches/0.5');

// Real Wands mods used across the sweep.
const MANA = 'Wands/MAXIMUM_MANA';
const SPELL = 'Wands/INCREASED_SPELL_DAMAGE';
const INT = 'Wands/INTELLIGENCE';
const CAST = 'Wands/INCREASED_CAST_SPEED';
const wand = data.bases.get('Wands')!;
const t1 = (id: string) => data.mods.get(id)!.tiers.length - 1;

/** MC tolerance: ~4 standard errors of a `runs`-sample proportion, plus a small floor. */
const tol = (p: number, runs: number) => 4 * Math.sqrt(Math.max(p * (1 - p), 1e-6) / runs) + 5e-4;

/** Assert every analytic per-step probability matches the full-mechanic MC within sampling noise. */
function expectPerStepMatch(steps: PlanStep[], level: number, runs = 120_000, seed = 3) {
  const analytic = evaluatePlan(data, wand, steps, level).steps.map((s) => s.prob);
  const mc = mcPerStepRates(data, wand, steps, runs, seed, level);
  for (let i = 0; i < steps.length; i++) {
    expect(Math.abs(mc[i]! - analytic[i]!)).toBeLessThan(tol(analytic[i]!, runs));
  }
  return analytic;
}

describe('MC validation — per-step add-affix probability (the corrected mechanics)', () => {
  it('transmute, base orb, any tier', () => {
    expectPerStepMatch([{ currency: 'transmute', add: MANA }], 82);
  });

  it('transmute, greater & perfect orb floors (D5) shrink the pool correctly', () => {
    expectPerStepMatch([{ currency: 'transmute', add: MANA, tier: 'greater' }], 82);
    expectPerStepMatch([{ currency: 'transmute', add: MANA, tier: 'perfect' }], 82);
  });

  it('tier targeting: transmute a T1 mod (minTierIndex) matches MC', () => {
    expectPerStepMatch([{ currency: 'transmute', add: MANA, tier: 'perfect', minTierIndex: t1(MANA) }], 82);
  });

  it('item-level cap: same target at a low level gates high tiers out (num & denom)', () => {
    expectPerStepMatch([{ currency: 'transmute', add: MANA }], 45);
  });

  it('full add-chain with magic 1+1 slots (D2) + family exclusion (D6) threading', () => {
    // transmute prefix → augment suffix (magic 1+1) → regal 2nd prefix (rare) → exalt 2nd suffix.
    expectPerStepMatch([
      { currency: 'transmute', add: MANA },
      { currency: 'augment', add: INT },
      { currency: 'regal', add: SPELL },
      { currency: 'exalt', add: CAST },
    ], 82);
  });

  it('exalt side-constrained by an Exaltation omen matches MC (higher, single-side pool)', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: MANA },
      { currency: 'augment', add: INT },
      { currency: 'regal', add: SPELL },
      { currency: 'exalt', add: CAST, constrainTo: 'suffix' },
    ];
    const analytic = expectPerStepMatch(steps, 82);
    // sanity: constraining to the suffix side must not lower the exalt's probability vs unconstrained
    const plain = evaluatePlan(data, wand, [...steps.slice(0, 3), { currency: 'exalt', add: CAST }], 82).steps[3]!.prob;
    expect(analytic[3]!).toBeGreaterThanOrEqual(plain - 1e-9);
  });
});

describe('MC validation — restart cost formula end-to-end', () => {
  // Cost MC is heavy-tailed, so use feasible (not-tiny-P) plans and a loose but meaningful tolerance.
  it('1-step plan: empirical E[cost] matches (Σ c_k·S_{k-1})/S_n within 6%', () => {
    const steps: PlanStep[] = [{ currency: 'transmute', add: MANA }];
    const res = evaluatePlan(data, wand, steps, 82);
    const analytic = planExpectedCost(prices, res, steps);
    const mc = mcPlanCost(data, prices, wand, steps, 20_000, 7, 82);
    expect(Math.abs(mc.empiricalP - res.total)).toBeLessThan(tol(res.total, 20_000));
    expect(Math.abs(mc.meanCost - analytic.expected) / analytic.expected).toBeLessThan(0.06);
  });

  it('2-step plan: restart cost (cheap step paid every attempt, dear step only on reach) matches within 8%', () => {
    const steps: PlanStep[] = [{ currency: 'transmute', add: MANA }, { currency: 'augment', add: INT }];
    const res = evaluatePlan(data, wand, steps, 82);
    const analytic = planExpectedCost(prices, res, steps);
    const mc = mcPlanCost(data, prices, wand, steps, 40_000, 11, 82);
    expect(Math.abs(mc.meanCost - analytic.expected) / analytic.expected).toBeLessThan(0.08);
  });
});
