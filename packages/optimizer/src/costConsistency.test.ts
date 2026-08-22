import { describe, it, expect } from 'vitest';
import type { PlanStep } from '../../engine/src/plan.ts';
import { allowsStep, indexPrices, stepCost } from './cost.ts';
import { actionCostOf, allowsAction, type McAction } from './markovActions.ts';

// The app runs TWO planners over the same game: the linear plan model (PlanStep, restart-on-first-
// failure) and the from-item MDP (McAction, value iteration). They answer different questions and are
// not expected to agree on a craft's total cost — but they must agree on what a single orb COSTS.
//
// That is not a theoretical worry. It is how D8 hid: the linear planner charged for a Desecration's
// boss omen and the MDP did not, so the MDP quietly recommended a route the linear model priced as
// dearer, and both looked internally consistent. `actionCostOf` now translates to a `PricedStep` and
// defers to `stepCost`, so one table serves both; what remains checkable is whether that translation
// picks the right keys, which is what this file pins.
//
// Powers of two, so every total is a unique bitmask: any wrong key — a Dextral omen where a Sinistral
// belongs, a Greater Exalt priced as Perfect — changes the sum to a value no correct mapping produces,
// rather than colliding with another plausible answer.
const prices = indexPrices({
  prices: {
    exalt: 1, exalt_greater: 2, exalt_perfect: 4, annul: 8, chaos: 16, desecrate: 32, perfect_essence: 64,
  },
  omens: {
    OmenofSinistralExaltation: 1 << 8, OmenofDextralExaltation: 1 << 9,
    OmenofSinistralAnnulment: 1 << 10, OmenofDextralAnnulment: 1 << 11, OmenofLight: 1 << 12,
    OmenofSinistralNecromancy: 1 << 13, OmenofDextralNecromancy: 1 << 14,
    OmenoftheBlackblooded: 1 << 15, OmenoftheLiege: 1 << 16, OmenoftheSovereign: 1 << 17,
    OmenofSinistralCrystallisation: 1 << 18, OmenofDextralCrystallisation: 1 << 19,
  },
});

/**
 * Each MDP action paired with the plan step a human would call the same purchase, and the price both
 * must produce. The PlanStep side is written out longhand on purpose: deriving it from the McAction
 * would re-use the very translation under test and the check would pass by construction.
 */
const PAIRS: readonly { readonly name: string; readonly action: McAction; readonly step: PlanStep; readonly cost: number }[] = [
  {
    name: 'plain Exalted Orb',
    action: { currency: 'exalt', strength: 'base' },
    step: { currency: 'exalt', add: 'M' },
    cost: 1,
  },
  {
    name: 'Greater Exalted Orb',
    action: { currency: 'exalt', strength: 'greater' },
    step: { currency: 'exalt', add: 'M', tier: 'greater' },
    cost: 2,
  },
  {
    name: 'Perfect Exalted Orb, prefix-only (Omen of Sinistral Exaltation)',
    action: { currency: 'exalt', strength: 'perfect', side: 'prefix' },
    step: { currency: 'exalt', add: 'M', tier: 'perfect', constrainTo: 'prefix' },
    cost: 4 + (1 << 8),
  },
  {
    name: 'Exalted Orb, suffix-only (Omen of Dextral Exaltation)',
    action: { currency: 'exalt', strength: 'base', side: 'suffix' },
    step: { currency: 'exalt', add: 'M', constrainTo: 'suffix' },
    cost: 1 + (1 << 9),
  },
  {
    name: 'plain Orb of Annulment',
    action: { currency: 'annul' },
    step: { currency: 'annul', remove: 'M' },
    cost: 8,
  },
  {
    name: 'Annulment, prefix-only (Omen of Sinistral Annulment)',
    action: { currency: 'annul', side: 'prefix' },
    step: { currency: 'annul', remove: 'M', omen: 'sinistral' },
    cost: 8 + (1 << 10),
  },
  {
    name: 'Annulment, suffix-only (Omen of Dextral Annulment)',
    action: { currency: 'annul', side: 'suffix' },
    step: { currency: 'annul', remove: 'M', omen: 'dextral' },
    cost: 8 + (1 << 11),
  },
  {
    name: 'Annulment targeting the desecrated mod (Omen of Light)',
    action: { currency: 'annul', light: true },
    step: { currency: 'annul', remove: 'M', omen: 'light' },
    cost: 8 + (1 << 12),
  },
  {
    name: 'Chaos Orb',
    action: { currency: 'chaos' },
    step: { currency: 'chaos', remove: 'M', add: 'N' },
    cost: 16,
  },
  {
    name: 'Desecration, Blackblooded, unconstrained',
    action: { currency: 'desecrate', boss: 'blackblooded' },
    step: { currency: 'desecrate', add: 'M', boss: 'blackblooded' },
    cost: 32 + (1 << 15),
  },
  {
    name: 'Desecration, Liege, prefix-only (Omen of Sinistral Necromancy)',
    action: { currency: 'desecrate', boss: 'liege', side: 'prefix' },
    step: { currency: 'desecrate', add: 'M', boss: 'liege', constrainTo: 'prefix' },
    cost: 32 + (1 << 16) + (1 << 13),
  },
  {
    name: 'Desecration, Sovereign, suffix-only (Omen of Dextral Necromancy)',
    action: { currency: 'desecrate', boss: 'sovereign', side: 'suffix' },
    step: { currency: 'desecrate', add: 'M', boss: 'sovereign', constrainTo: 'suffix' },
    cost: 32 + (1 << 17) + (1 << 14),
  },
  {
    name: 'Perfect Essence, unconstrained',
    action: { currency: 'perfect-essence', target: 'M' },
    step: { currency: 'perfect-essence', add: 'M', remove: 'N' },
    cost: 64,
  },
  {
    name: 'Perfect Essence eating a prefix (Omen of Sinistral Crystallisation)',
    action: { currency: 'perfect-essence', target: 'M', side: 'prefix' },
    step: { currency: 'perfect-essence', add: 'M', remove: 'N', omen: 'sinistral' },
    cost: 64 + (1 << 18),
  },
  {
    name: 'Perfect Essence eating a suffix (Omen of Dextral Crystallisation)',
    action: { currency: 'perfect-essence', target: 'M', side: 'suffix' },
    step: { currency: 'perfect-essence', add: 'M', remove: 'N', omen: 'dextral' },
    cost: 64 + (1 << 19),
  },
];

describe('cross-model cost consistency — the MDP and the linear planner price an orb identically', () => {
  for (const { name, action, step, cost } of PAIRS) {
    it(`${name}: both models charge ${cost}`, () => {
      expect(actionCostOf(prices, action)).toBe(cost);
      expect(stepCost(prices, step)).toBe(cost);
    });
  }

  // Every McAction variant above must appear, or the suite silently stops covering a lever the policy
  // can still play — which is the state D8 was found in.
  it('covers every currency the MDP can play', () => {
    const covered = new Set(PAIRS.map((p) => p.action.currency));
    expect([...covered].sort()).toEqual(['annul', 'chaos', 'desecrate', 'exalt', 'perfect-essence']);
  });

  // markovActions' header promises "a strength or omen with no price is NOT offered, so a missing
  // price can't mint a free super-orb". The guarantee only holds if a priced sheet charges for all of
  // them — a zero here would be an action the solver treats as free and therefore always worth taking.
  it('charges something for every action when the sheet prices everything', () => {
    for (const { name, action } of PAIRS) {
      expect(actionCostOf(prices, action), name).toBeGreaterThan(0);
    }
  });

  // An unpriced omen must fall back to the bare orb, never to NaN or a phantom charge: the MDP would
  // otherwise propagate NaN through value iteration and return an unusable policy.
  it('degrades to the bare orb when an omen has no price, rather than to NaN', () => {
    const bare = indexPrices({ prices: { annul: 8 } }); // no omens block at all
    expect(actionCostOf(bare, { currency: 'annul', side: 'prefix' })).toBe(8);
    expect(actionCostOf(bare, { currency: 'annul', light: true })).toBe(8);
  });
});

// Exclusion asks the SAME question of the same descriptor that pricing does ("which keys is this step
// made of"), so it inherits the same failure mode: if the two planners disagreed about what an action
// is made of, one would honour an exclusion and the other would quietly ignore it — and the player
// would get a plan using a currency they said they don't have. Reusing PAIRS is the point.
describe('exclusions agree across the two models, for the same reason costs do', () => {
  const only = (...keys: string[]) => ({ excluded: new Set(keys) });

  for (const { name, action, step } of PAIRS) {
    it(`${name}: both models agree on what excluding its orb does`, () => {
      // Excluding nothing allows everything.
      expect(allowsStep(undefined, step)).toBe(true);
      expect(allowsStep(only(), step)).toBe(true);
      // Whatever the verdict under a given policy, it must be the SAME for the MDP's view of the action.
      for (const key of ['chaos', 'annul', 'exalt', 'exalt_perfect', 'desecrate', 'perfect_essence',
        'OmenofLight', 'OmenoftheLiege', 'OmenofSinistralExaltation', 'OmenofDextralNecromancy']) {
        const policy = only(key);
        expect(allowsAction(policy, action), `${name} / ${key}`)
          .toBe(allowsStep(policy, step));
      }
    });
  }

  it('blocks a step when ANY omen it needs is excluded, not just its orb', () => {
    // A Desecration with a side omen invokes TWO omens; lacking either one blocks the step.
    const desecrate = PAIRS.find((p) => p.name.includes('Sinistral Necromancy'))!;
    expect(allowsStep(only('OmenoftheLiege'), desecrate.step)).toBe(false);
    expect(allowsStep(only('OmenofSinistralNecromancy'), desecrate.step)).toBe(false);
    expect(allowsStep(only('desecrate'), desecrate.step)).toBe(false);
    expect(allowsStep(only('OmenofLight'), desecrate.step)).toBe(true); // an omen it doesn't use
  });

  it('excluding an orb strength leaves the other strengths alone', () => {
    const base = PAIRS.find((p) => p.name === 'plain Exalted Orb')!.step;
    const perfect = PAIRS.find((p) => p.name.startsWith('Perfect Exalted Orb'))!.step;
    expect(allowsStep(only('exalt_perfect'), perfect)).toBe(false);
    expect(allowsStep(only('exalt_perfect'), base)).toBe(true);
  });
});

describe('cross-model consistency on the shipped sheet', () => {
  it('agrees on every pair using the real 0.5.0 prices, not just synthetic ones', async () => {
    // Loaded lazily so this file stays pure/browser-safe apart from this one case.
    const { loadPrices } = await import('./loadPrices.ts');
    const real = loadPrices('data/patches/0.5.0');
    for (const { name, action, step } of PAIRS) {
      expect(actionCostOf(real, action), name).toBeCloseTo(stepCost(real, step), 12);
    }
  });
});
