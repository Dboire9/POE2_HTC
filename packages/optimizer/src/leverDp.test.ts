import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData, Tier } from '../../engine/src/index.ts';
import { evaluatePlanFrom, loadPatch, planStates } from '../../engine/src/index.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import type { ParetoPlan } from './optimize.ts';
import { paretoFrontier } from './optimize.ts';
import type { Prices } from './cost.ts';
import { planExpectedCost } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { bestLeverAssignments } from './leverDp.ts';
import { leverOptions } from './levers.ts';

/**
 * THE EXACTNESS LICENCE.
 *
 * `bestLeverAssignments` replaces an enumeration with an argument — that a dominated partial suffix
 * can never come back, so pruning one loses nothing. The argument is in the module header and it is
 * sound, but a sound argument about the wrong code is still wrong. So this brute-forces the very same
 * option sets, scores every assignment the slow way, and demands the same frontier.
 *
 * Nothing about the axis ships without this green.
 *
 * WHAT IS COMPARED, AND WHAT DELIBERATELY IS NOT. The frontier's LENGTH and its `(expected,
 * probability)` pairs, to a relative tolerance. NOT the steps, arrays-equal. The DP associates the tail
 * product as `p₀·(p₁·p₂)` where `evaluatePlanFrom` builds `((p₀·p₁)·p₂)`; those differ in the last
 * bits, and among exactly-tied plans V8's stable sort hands the win to whichever was pushed first —
 * which the DP changes. A test that pinned step identity would flap on a difference that means
 * nothing.
 */

// A base with mods that actually have a tier ladder, so an orb strength has something to bite on: the
// synthetic fixture the other from-item tests share is single-tier at ilvl 1, where every strength
// floor is out of reach and the whole axis is invisible.
const tiers = (weights: readonly [number, number, number]): Tier[] => [
  { name: 't3', ilvl: 1, weight: weights[0], ranges: [] },
  { name: 't2', ilvl: 40, weight: weights[1], ranges: [] },
  { name: 't1', ilvl: 70, weight: weights[2], ranges: [] },
];
const mk = (id: string, type: 'prefix' | 'suffix', family: string, w: readonly [number, number, number]): Mod =>
  ({ id, source: 'normal', type, family, tags: [], text: id, tiers: tiers(w) });

const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands',
  pools: {
    normal: { prefixes: ['P1', 'P2', 'P3'], suffixes: ['S1', 'S2', 'S3'] },
    desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['P1', mk('P1', 'prefix', 'FP1', [100, 40, 10])], ['P2', mk('P2', 'prefix', 'FP2', [80, 60, 30])],
    ['P3', mk('P3', 'prefix', 'FP3', [50, 50, 50])], ['S1', mk('S1', 'suffix', 'FS1', [90, 20, 5])],
    ['S2', mk('S2', 'suffix', 'FS2', [70, 70, 70])], ['S3', mk('S3', 'suffix', 'FS3', [60, 30, 15])],
  ]),
  bases: new Map([['S', base]]),
};

// Every strength priced, and the omens too, so nothing is skipped for want of a listing. Deliberately
// NOT monotone in the way the real sheet is, so the frontier has real trade-offs to find.
const prices: Prices = {
  currency: {
    exalt: 1, exalt_greater: 5, exalt_perfect: 40,
    chaos: 12, chaos_greater: 30, chaos_perfect: 200,
    regal: 0.5, regal_greater: 3, regal_perfect: 25, annul: 90,
  },
  omens: { OmenofSinistralExaltation: 8, OmenofDextralExaltation: 8 },
};

const placed = (id: string): { modId: string; tierName: string } => ({ modId: id, tierName: 't3' });
const item = (pre: string[], suf: string[], rarity: 'rare' | 'magic' = 'rare'): ItemState =>
  ({ base, level: 82, rarity, prefixes: pre.map(placed), suffixes: suf.map(placed) });

/** Score a fully-specified sequence exactly as the planners do. */
function score(d: PatchData, p: Prices, start: ItemState, steps: PlanStep[]): ParetoPlan {
  const result = evaluatePlanFrom(d, start, steps);
  return { steps, result, cost: planExpectedCost(p, result, steps), probability: result.total };
}

/** The slow way: every assignment of every step's options, scored and Pareto-filtered. */
function bruteForce(d: PatchData, p: Prices, start: ItemState, skeleton: PlanStep[]): ParetoPlan[] {
  const states = planStates(d, start, skeleton);
  const options = skeleton.map((s, k) => leverOptions(d, p, states[k]!, s));
  let seqs: PlanStep[][] = [[]];
  for (const opts of options) {
    const next: PlanStep[][] = [];
    for (const partial of seqs) for (const o of opts) next.push([...partial, o.step]);
    seqs = next;
  }
  return paretoFrontier(seqs.map((steps) => score(d, p, start, steps)));
}

/** The fast way, re-scored through the canonical evaluator exactly as fromItem.ts does. */
function viaDp(d: PatchData, p: Prices, start: ItemState, skeleton: PlanStep[]): ParetoPlan[] {
  const { candidates } = bestLeverAssignments(d, p, start, skeleton);
  return paretoFrontier(candidates.map((c) => score(d, p, start, c.steps)));
}

function expectSameFrontier(a: ParetoPlan[], b: ParetoPlan[]): void {
  expect(b.length).toBe(a.length);
  for (let i = 0; i < a.length; i++) {
    expect(b[i]!.probability).toBeCloseTo(a[i]!.probability, 12);
    // Relative, because these span orders of magnitude between crafts.
    expect(b[i]!.cost.expected / a[i]!.cost.expected).toBeCloseTo(1, 9);
  }
}

const ex = (add: string): PlanStep => ({ currency: 'exalt', add, minTierIndex: 0 });
const exT = (add: string, minTierIndex: number): PlanStep => ({ currency: 'exalt', add, minTierIndex });
const ch = (remove: string, add: string): PlanStep => ({ currency: 'chaos', remove, add, minTierIndex: 0 });
const an = (remove: string): PlanStep => ({ currency: 'annul', remove });

describe('bestLeverAssignments — identical to brute force, on every shape', () => {
  const cases: { name: string; start: ItemState; skeleton: PlanStep[] }[] = [
    { name: 'one exalt, any tier', start: item([], []), skeleton: [ex('P1')] },
    { name: 'two exalts', start: item([], []), skeleton: [ex('P1'), ex('S1')] },
    { name: 'three exalts, tier-targeted', start: item([], []), skeleton: [exT('P1', 2), exT('S1', 2), exT('P2', 1)] },
    { name: 'chaos swap then exalt', start: item(['P3'], []), skeleton: [ch('P3', 'P1'), ex('S1')] },
    { name: 'annul then two exalts', start: item(['P3'], []), skeleton: [an('P3'), ex('P1'), ex('S1')] },
    { name: 'two chaos swaps', start: item(['P3'], ['S3']), skeleton: [ch('P3', 'P1'), ch('S3', 'S1')] },
    {
      name: 'five adds — the shape the product made unaffordable',
      start: item(['P3'], ['S3']),
      skeleton: [ch('P3', 'P1'), ch('S3', 'S1'), exT('P2', 1), exT('S2', 1), ex('P3')],
    },
    { name: 'regal opener from Magic', start: item(['P3'], [], 'magic'), skeleton: [{ currency: 'regal', add: 'P1', minTierIndex: 0 }, ex('S1')] },
  ];

  for (const c of cases) {
    it(`matches brute force: ${c.name}`, () => {
      const slow = bruteForce(data, prices, c.start, c.skeleton);
      expect(slow.length).toBeGreaterThan(0); // a vacuous comparison would pass anything
      expectSameFrontier(slow, viaDp(data, prices, c.start, c.skeleton));
    });
  }

});

describe('bestLeverAssignments — the edges', () => {
  it('returns nothing when a step cannot happen at all', () => {
    // P1's family is already on the item, so no orb can add it: every option scores 0.
    const r = bestLeverAssignments(data, prices, item(['P1'], []), [ex('P1')]);
    expect(r.candidates).toEqual([]);
    expect(r.combinations).toBe(0);
  });

  /**
   * Domination pruning is the DP's cheapest step and its least obviously safe one, so it gets its own
   * differential: an option beaten on BOTH axes cannot appear in any winning plan, so removing it must
   * not move the frontier at all. Brute force above already enumerates the UNPRUNED options, which is
   * what makes these two claims independent rather than the same claim twice.
   */
  it('drops options nothing could have used, and the frontier does not move', () => {
    const skeleton = [ch('P3', 'P1'), exT('S1', 1), exT('P2', 1)];
    const start = item(['P3'], []);
    const states = planStates(data, start, skeleton);
    const offered = skeleton.map((s, k) => leverOptions(data, prices, states[k]!, s));
    // Something must actually be dominated here, or this proves nothing.
    const dominated = offered.some((opts) => opts.some((a, i) => opts.some((b, j) =>
      j !== i && b.prob >= a.prob && b.cost <= a.cost && (b.prob > a.prob || b.cost < a.cost))));
    expect(dominated).toBe(true);
    expectSameFrontier(bruteForce(data, prices, start, skeleton), viaDp(data, prices, start, skeleton));
  });

  it('counts the plans it stands for, not the handful it scored', () => {
    const skeleton = [ch('P3', 'P1'), ch('S3', 'S1'), exT('P2', 1), exT('S2', 1), ex('P3')];
    const r = bestLeverAssignments(data, prices, item(['P3'], ['S3']), skeleton);
    expect(r.combinations).toBeGreaterThan(1000);
    expect(r.candidates.length).toBeLessThan(r.combinations / 50);
    expect(r.capped).toBe(false);
  });

  /**
   * The cap makes the answer a SUBSET, never a wrong one — so it must be visible. With a cap of 2 the
   * DP keeps the ends and drops the middle, and `capped` says so; `fromItem` turns that into the
   * `truncated` badge the app already renders.
   */
  it('flags a capped frontier instead of quietly returning a partial one', () => {
    const skeleton = [ch('P3', 'P1'), ch('S3', 'S1'), exT('P2', 1), exT('S2', 1)];
    const start = item(['P3'], ['S3']);
    const full = bestLeverAssignments(data, prices, start, skeleton);
    const cut = bestLeverAssignments(data, prices, start, skeleton, undefined, { maxFrontier: 2 });
    expect(full.capped).toBe(false);
    expect(cut.capped).toBe(true);
    expect(cut.candidates.length).toBeLessThanOrEqual(2);
    // A subset: every capped answer is one the full search also found.
    const fullProbs = full.candidates.map((c) => c.probability);
    for (const c of cut.candidates) expect(fullProbs.some((p) => Math.abs(p - c.probability) < 1e-12)).toBe(true);
  });
});

/**
 * The same comparison against the shipped 0.5.0 data, which is where a fixture-shaped assumption would
 * show. Kept small on purpose — brute force is the point, so it has to terminate.
 */
describe('bestLeverAssignments — brute force agrees on real data too', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadPrices('data/patches/0.5.0');
  const wand = real.bases.get('Wands')!;
  const ids = wand.pools.normal.prefixes.slice(0, 2).concat(wand.pools.normal.suffixes.slice(0, 2));
  const held: ItemState = {
    base: wand, level: 82, rarity: 'rare',
    prefixes: [{ modId: ids[0]!, tierName: real.mods.get(ids[0]!)!.tiers[0]!.name }], suffixes: [],
  };

  it('agrees on a chaos + exalt route over the live sheet', () => {
    const skeleton: PlanStep[] = [
      { currency: 'chaos', remove: ids[0]!, add: ids[1]!, minTierIndex: 4 },
      { currency: 'exalt', add: ids[2]!, minTierIndex: 4 },
    ];
    const slow = bruteForce(real, rp, held, skeleton);
    expect(slow.length).toBeGreaterThan(0);
    expectSameFrontier(slow, viaDp(real, rp, held, skeleton));
  });

  it('reaches for a stronger orb on the live sheet, which is the whole point', () => {
    const skeleton: PlanStep[] = [{ currency: 'exalt', add: ids[2]!, minTierIndex: 6 }];
    const r = bestLeverAssignments(real, rp, held, skeleton);
    const strengths = new Set(r.candidates.map((c) => ('tier' in c.steps[0]! ? c.steps[0].tier : undefined) ?? 'base'));
    expect(strengths.size).toBeGreaterThan(1); // base alone would mean the axis does nothing
  });
});
