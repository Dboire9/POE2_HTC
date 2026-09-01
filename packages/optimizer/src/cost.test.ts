import { describe, it, expect } from 'vitest';
import type { Mod, PatchData, PlanResult, PlanStep } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { allowsStep, cheapestEssenceLevel, essenceLevelOf, planExpectedCost, stepCost } from './cost.ts';
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

/**
 * A CHAOS ORB HAS STRENGTHS, AND THEY WERE FREE.
 *
 * `currencyKey` gated its `_greater`/`_perfect` suffix on a four-currency list — transmute, augment,
 * regal, exalt — and chaos was not on it. Meanwhile the engine had honoured the strength all along:
 * `chaosProbability` forwards its `opts` to `exaltProbability`, so the ilvl floor applied and the odds
 * moved. Only the bill stayed at the base price.
 *
 * Latent for as long as no planner emitted a tiered chaos. The from-item orb-strength axis emits them
 * constantly and chaos is that planner's main transform, so this had to be fixed BEFORE the axis, not
 * after: a Perfect Chaos at 33.39ex for 4.5x the odds dominates every frontier it can reach.
 *
 * Two failures, one key. `stepCost` under-bills it 62x; `allowsStep` reads the SAME `currencyKey`, so a
 * player who ticked "I don't have Perfect Chaos Orbs" — the UI offers exactly that
 * (`CURRENCY_GROUPS`), and `cost.ts` cites `'chaos_perfect'` as its own example exclusion key — would
 * have been handed a plan built on them.
 */
describe('stepCost — a Chaos Orb has strengths, and they are not free', () => {
  const prices: Prices = {
    currency: { chaos: 33.39, chaos_greater: 98.47, chaos_perfect: 2058, exalt: 1, exalt_greater: 4.796 },
    omens: {},
  };
  const chaos = (tier?: 'base' | 'greater' | 'perfect'): PlanStep =>
    ({ currency: 'chaos', remove: 'A', add: 'B', ...(tier ? { tier } : {}) });

  it('bills a Greater/Perfect Chaos at its own key, not the base one', () => {
    expect(stepCost(prices, chaos())).toBe(33.39);
    expect(stepCost(prices, chaos('base'))).toBe(33.39);
    expect(stepCost(prices, chaos('greater'))).toBe(98.47);
    expect(stepCost(prices, chaos('perfect'))).toBe(2058);
  });

  it('still refuses a strength the player says they do not have', () => {
    const policy = { excluded: new Set(['chaos_perfect']) };
    expect(allowsStep(policy, chaos('perfect'))).toBe(false);
    expect(allowsStep(policy, chaos('greater'))).toBe(true);
    expect(allowsStep(policy, chaos())).toBe(true);
  });

  /**
   * The other half of the same guard, and the reason a caller may not simply enumerate all three:
   * `stepCost` charges 0 for a key the sheet omits, so an unlisted strength comes back FREE and wins
   * every comparison it enters. Whoever enumerates strengths has to skip the ones the sheet does not
   * price — pinned here so the rule has a home next to the thing that makes it necessary.
   */
  it('charges 0 for a strength the sheet does not list — which is why callers must skip those', () => {
    const thin: Prices = { currency: { chaos: 33.39 }, omens: {} };
    expect(stepCost(thin, chaos('perfect'))).toBe(0);
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

/**
 * Which essence LEVEL to buy — the choice both planners now share.
 *
 * An essence mod's tiers ascend, so every level at or above the wanted one satisfies the target AND
 * rolls better stats. Both planners used to take the wanted level itself, on the reasonable assumption
 * that weaker means cheaper. The sheet says otherwise for **250 of 302 fully-priced essences (83%)**,
 * and the aggregate is not marginal: over all 317 essence targets in 0.5.0 the quoted price falls
 * 8,595.8ex → 646.6ex, a 13.3x drop, with `Bows/Essence_FireDamage` alone going 364.2ex → 0.3ex.
 */
describe('cheapestEssenceLevel — a better essence is often the cheaper one', () => {
  const ess = (id: string, ilvls: number[]): Mod => ({
    id, group: id, field: id, source: 'essence', type: 'suffix', categories: [], family: `F${id}`,
    tags: [], text: id,
    tiers: [
      { name: `Lesser Essence of ${id}`, ilvl: ilvls[0]!, weight: 0, ranges: [], stats: [] },
      { name: `Essence of ${id}`, ilvl: ilvls[1]!, weight: 0, ranges: [], stats: [] },
      { name: `Greater Essence of ${id}`, ilvl: ilvls[2]!, weight: 0, ranges: [], stats: [] },
    ],
  });
  const priced = (lesser: number, normal: number, greater: number): Prices => ({
    currency: { 'essence:lesser:E': lesser, 'essence:normal:E': normal, 'essence:greater:E': greater },
    omens: {},
  });
  const E = ess('E', [15, 30, 60]);

  it('takes a strictly better level when it costs less', () => {
    // The shape of Amulets/Essence_FireResistance: lesser 15, normal 100, greater 1.886.
    expect(cheapestEssenceLevel(priced(15, 100, 1.886), E, 0, 82)).toBe(2);
  });

  it('takes the named level when the sheet IS monotone', () => {
    expect(cheapestEssenceLevel(priced(1, 10, 100), E, 0, 82)).toBe(0);
  });

  it('never goes BELOW the wanted tier, however cheap', () => {
    // Lesser is nearly free and still illegal: the target asked for the Greater roll.
    expect(cheapestEssenceLevel(priced(0.01, 0.02, 500), E, 2, 82)).toBe(2);
  });

  it('skips a cheaper better level the item outranks', () => {
    // Greater is ilvl 60 and the item is 50, so the bargain is unbuyable and Lesser stands.
    expect(cheapestEssenceLevel(priced(15, 100, 1.886), E, 0, 50)).toBe(0);
  });

  it('ties keep the lower level, so a flat sheet reproduces the old behaviour', () => {
    expect(cheapestEssenceLevel(priced(7, 7, 7), E, 0, 82)).toBe(0);
  });

  /**
   * Priced through `stepCost`, not the raw key — so a level whose per-mod entry is MISSING is compared
   * at what it will actually be charged (`essence_<lvl>`), and the choice can never disagree with the
   * bill. Here the greater has no per-mod price and its fallback is dear, so it must lose.
   */
  it('compares levels at the price that will actually be charged', () => {
    const sheet: Prices = {
      currency: { 'essence:lesser:E': 15, 'essence:normal:E': 100, essence_greater: 900 },
      omens: {},
    };
    expect(cheapestEssenceLevel(sheet, E, 0, 82)).toBe(0);
    expect(stepCost(sheet, { currency: 'essence', add: 'E', essenceLevel: essenceLevelOf(E.tiers[2]!.name) }))
      .toBe(900);
  });
});
