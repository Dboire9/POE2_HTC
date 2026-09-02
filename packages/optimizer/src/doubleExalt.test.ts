// The search rule for the Omen of Greater Exaltation, and its price.
//
// Two things can go wrong here that no engine test would catch: the route could be offered where it
// is not paid for (an unpriced omen is charged 0 — `stepCost`'s standing trap), and it could be
// priced as its own currency rather than as the Exalted Orb it is spent on, which would make it free
// AND make "I don't own Exalted Orbs" stop excluding it.

import { describe, it, expect } from 'vitest';
import type { PlanStep } from '../../engine/src/plan.ts';
import { allowsStep, indexPrices, stepCost } from './cost.ts';
import { GREATER_EXALTATION_OMEN, withGreaterExaltations } from './doubleExalt.ts';

const prices = indexPrices({
  prices: { exalt: 1, exalt_greater: 2, exalt_perfect: 4 },
  omens: { [GREATER_EXALTATION_OMEN]: 64 },
});
const unpriced = indexPrices({ prices: { exalt: 1, exalt_greater: 2, exalt_perfect: 4 }, omens: {} });

const ex = (add: string, minTierIndex?: number): PlanStep =>
  (minTierIndex === undefined ? { currency: 'exalt', add } : { currency: 'exalt', add, minTierIndex });
const ge = (steps: readonly PlanStep[]) => steps.filter((s) => s.currency === 'greater-exalt');
const names = (skeletons: readonly (readonly PlanStep[])[]) =>
  skeletons.map((s) => s.map((x) => x.currency === 'greater-exalt' ? `GE(${x.adds.map((a) => a.modId).join(',')})` : `${x.currency}(${'add' in x ? x.add : ''})`).join(' '));

describe('withGreaterExaltations — which skeletons gain the route', () => {
  it('fuses an adjacent Exalt pair and keeps the original', () => {
    const out = withGreaterExaltations(prices, [[ex('A'), ex('B')]]);
    expect(names(out)).toEqual(['exalt(A) exalt(B)', 'GE(A,B)']);
  });

  it('emits ONE skeleton for a pair, not one per spelling', () => {
    // Both orderings are in the input because both planners permute their targets; their fusions are
    // the same skeleton, since the omened step does not care which mod it names first. Without the
    // canonical filter this returns two identical routes and doubles the search for nothing.
    const out = withGreaterExaltations(prices, [[ex('A'), ex('B')], [ex('B'), ex('A')]]);
    expect(ge(out.flat())).toHaveLength(1);
    expect(names(out)).toEqual(['exalt(A) exalt(B)', 'exalt(B) exalt(A)', 'GE(A,B)']);
  });

  it('fuses each adjacent pair of a longer run, one at a time', () => {
    const out = withGreaterExaltations(prices, [[ex('A'), ex('B'), ex('C')]]);
    expect(names(out)).toEqual(['exalt(A) exalt(B) exalt(C)', 'GE(A,B) exalt(C)', 'exalt(A) GE(B,C)']);
  });

  it('carries each mod’s own tier requirement across', () => {
    const out = withGreaterExaltations(prices, [[ex('A', 2), ex('B')]]);
    const fused = ge(out.flat())[0]!;
    expect(fused.currency === 'greater-exalt' && fused.adds).toEqual([{ modId: 'A', minTierIndex: 2 }, { modId: 'B' }]);
  });

  it('does not fuse across a non-Exalt step', () => {
    const out = withGreaterExaltations(prices, [[ex('A'), { currency: 'annul', remove: 'J' }, ex('B')]]);
    expect(ge(out.flat())).toHaveLength(0);
  });

  it('offers NOTHING when the omen has no price', () => {
    // `stepCost` charges 0 for a missing key, so an unpriced omen would make this route both cheaper
    // and likelier than the two Exalts it replaces — dominating every frontier it touched. Unpriced,
    // the search must be exactly what it was before this module existed.
    const input = [[ex('A'), ex('B'), ex('C')]];
    expect(withGreaterExaltations(unpriced, input)).toEqual(input);
  });

  it('never mutates the skeletons it was handed', () => {
    const input: PlanStep[][] = [[ex('A'), ex('B')]];
    const before = JSON.stringify(input);
    withGreaterExaltations(prices, input);
    expect(JSON.stringify(input)).toBe(before);
  });
});

describe('greater-exalt pricing — an omen on top of the orb it is spent on', () => {
  const step = (tier?: 'greater' | 'perfect'): PlanStep => ({
    currency: 'greater-exalt', adds: [{ modId: 'A' }, { modId: 'B' }], ...(tier ? { tier } : {}),
  });

  it('charges the Exalted Orb plus the omen, at every strength', () => {
    expect(stepCost(prices, step())).toBe(1 + 64);
    expect(stepCost(prices, step('greater'))).toBe(2 + 64);
    expect(stepCost(prices, step('perfect'))).toBe(4 + 64);
  });

  it('is dearer than the two plain Exalts it replaces — it has to win on odds', () => {
    expect(stepCost(prices, step())).toBeGreaterThan(2 * stepCost(prices, ex('A')));
  });

  it('excluding Exalted Orbs excludes it, because it buys one', () => {
    // The step's currency is `greater-exalt`, but the KEY is `exalt` — so a player who owns no
    // Exalted Orbs is not offered a route that spends one. Keying it as its own currency would have
    // let this through AND priced it at 0, since no such key is on any sheet.
    expect(allowsStep({ excluded: new Set(['exalt']) }, step())).toBe(false);
    expect(allowsStep({ excluded: new Set(['exalt_perfect']) }, step('perfect'))).toBe(false);
    expect(allowsStep({ excluded: new Set(['exalt_perfect']) }, step())).toBe(true);
  });

  it('excluding the omen excludes it at every strength', () => {
    for (const t of [undefined, 'greater', 'perfect'] as const) {
      expect(allowsStep({ excluded: new Set([GREATER_EXALTATION_OMEN]) }, step(t))).toBe(false);
    }
  });
});
