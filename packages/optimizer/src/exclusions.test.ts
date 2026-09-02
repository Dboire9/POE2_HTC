import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import type { ItemState } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import { loadPrices } from './loadPrices.ts';
import type { CurrencyPolicy } from './cost.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';
import { markovFromItem } from './markovFromItem.ts';
import { allowsAction } from './markovActions.ts';

// The promise this feature makes is absolute: a currency you said you don't have must never appear in
// anything the app recommends. Unit-testing `allowsStep` proves the predicate; these prove the
// PLANNERS honour it, on real 0.5.0 data, by walking every step of every plan they return. Each of the
// three has its own enforcement point, so each needs its own proof.
const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');
const wands = data.bases.get('Wands')!;

// Distinct families, picked from the real pool: two same-family targets can never both roll, so every
// plan would score 0 and the frontier would come back empty — which would make these tests pass while
// proving nothing. (The `open` control cases below exist to catch exactly that.)
function distinctFamilies(ids: readonly string[], n: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const m = data.mods.get(id);
    if (!m || m.source !== 'normal' || seen.has(m.family)) continue;
    seen.add(m.family);
    out.push(id);
    if (out.length === n) break;
  }
  return out;
}
const PRE = distinctFamilies(wands.pools.normal.prefixes, 3);
const SUF = distinctFamilies(wands.pools.normal.suffixes, 2);
/** FIVE targets, not four: an Orb of Alchemy slams 4 mods at once, so a 4-mod craft needs no Exalt at
 *  all — the 5th is what makes the add-chain load-bearing. */
const targets = [...PRE, ...SUF].map((modId) => ({ modId, minTierIndex: 0 }));

const OMENS = [
  'OmenofSinistralAnnulment', 'OmenofDextralAnnulment', 'OmenofLight',
  'OmenofSinistralCrystallisation', 'OmenofDextralCrystallisation',
  'OmenofSinistralNecromancy', 'OmenofDextralNecromancy',
  'OmenoftheBlackblooded', 'OmenoftheLiege', 'OmenoftheSovereign',
  'OmenofSinistralExaltation', 'OmenofDextralExaltation', 'OmenofGreaterExaltation',
];
const policy = (...keys: string[]): CurrencyPolicy => ({ excluded: new Set(keys) });

/** Every price-key-ish trait a step carries, as strings, so a test can assert none is excluded. */
function traitsOf(step: PlanStep): string[] {
  const out: string[] = [step.currency];
  if ('tier' in step && step.tier) out.push(`${step.currency}_${step.tier}`);
  if ('constrainTo' in step && step.constrainTo) out.push(`omen:${step.constrainTo}`);
  if ('omen' in step && step.omen) out.push(`omen:${step.omen}`);
  if ('boss' in step && step.boss) out.push(`omen:${step.boss}`);
  // A `greater-exalt` carries its omen in its CURRENCY, not in a field — the Omen of Greater
  // Exaltation is what the step is, so there is no `omen: 'greaterExaltation'` to read. Without this
  // line the "no omen survives" assertions below would pass on a frontier full of omened orbs.
  if (step.currency === 'greater-exalt') out.push('omen:greaterExaltation');
  return out;
}

const allSteps = (frontier: readonly { steps: readonly PlanStep[] }[]): PlanStep[] =>
  frontier.flatMap((p) => [...p.steps]);

// SIX targets, so the add chain ends in two adjacent Exalts that an Omen of Greater Exaltation can
// buy as one. At five it is offered and simply loses on price, which would make the assertions below
// pass without the exclusion doing any work.
const sixTargets = [...distinctFamilies(wands.pools.normal.prefixes, 3), ...distinctFamilies(wands.pools.normal.suffixes, 3)]
  .map((modId) => ({ modId, minTierIndex: 0 }));

describe('the Omen of Greater Exaltation is excludable like any other', () => {
  const usesOmen = (r: { frontier: readonly { steps: readonly PlanStep[] }[] }) =>
    allSteps(r.frontier).some((st) => st.currency === 'greater-exalt');

  it('reaches the frontier unexcluded — otherwise the next assertion proves nothing', () => {
    expect(usesOmen(optimizePareto(data, prices, wands, sixTargets, { level: 82 }))).toBe(true);
  });

  it('disappears when the omen is excluded, and the craft still solves', () => {
    const r = optimizePareto(data, prices, wands, sixTargets, { level: 82, policy: policy('OmenofGreaterExaltation') });
    expect(r.frontier.length).toBeGreaterThan(0);
    expect(usesOmen(r)).toBe(false);
  });

  it('disappears when EXALTED ORBS are excluded, because it spends one', () => {
    // The route's price key is `exalt`, not its own currency name. A player with no Exalted Orbs must
    // not be handed a plan that buys one with an omen on it.
    const r = optimizePareto(data, prices, wands, sixTargets, {
      level: 82, policy: policy('exalt', 'exalt_greater', 'exalt_perfect'),
    });
    expect(usesOmen(r)).toBe(false);
  });
});

describe('optimizePareto (from white) honours exclusions', () => {
  it('returns plans at all without a policy — otherwise the assertions below prove nothing', () => {
    const r = optimizePareto(data, prices, wands, targets, { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    // …and normally DOES reach for omens, so removing them is a real change rather than a no-op.
    expect(allSteps(r.frontier).some((s) => traitsOf(s).some((t) => t.startsWith('omen:')))).toBe(true);
  });

  it('uses no omen when every omen is excluded', () => {
    const r = optimizePareto(data, prices, wands, targets, { level: 82, policy: policy(...OMENS) });
    expect(r.frontier.length).toBeGreaterThan(0); // still solvable without them
    for (const s of allSteps(r.frontier)) {
      expect(traitsOf(s).filter((t) => t.startsWith('omen:')), JSON.stringify(s)).toEqual([]);
    }
  });

  it('uses no Perfect orb when Perfect strengths are excluded', () => {
    const perfect = ['transmute_perfect', 'augment_perfect', 'regal_perfect', 'chaos_perfect', 'exalt_perfect'];
    const r = optimizePareto(data, prices, wands, targets, { level: 82, policy: policy(...perfect) });
    for (const s of allSteps(r.frontier)) {
      expect(traitsOf(s).some((t) => perfect.includes(t)), JSON.stringify(s)).toBe(false);
    }
  });

  // The honest failure. Note this needs FIVE targets: at four, excluding the Exalted Orb simply routes
  // the planner through an Orb of Alchemy instead — which is the feature working, not a hole.
  it('returns nothing rather than cheating when a required currency is excluded', () => {
    const r = optimizePareto(data, prices, wands, targets, {
      level: 82, policy: policy('exalt', 'exalt_greater', 'exalt_perfect'),
    });
    expect(r.frontier).toEqual([]);
  });

  // Exclusion should PRUNE the search, not merely filter its output — the point of doing it inside
  // `withOmenVariants` (2^k) rather than at the end.
  it('evaluates strictly fewer plans when omens are excluded', () => {
    const open = optimizePareto(data, prices, wands, targets, { level: 82 });
    const closed = optimizePareto(data, prices, wands, targets, { level: 82, policy: policy(...OMENS) });
    expect(closed.plansEvaluated).toBeLessThan(open.plansEvaluated);
  });
});

const placed = (id: string) => ({ modId: id, tierName: data.mods.get(id)!.tiers.at(-1)!.name });
const heldItem: ItemState = {
  base: wands, level: 82, rarity: 'rare',
  prefixes: [placed(PRE[0]!)], suffixes: [placed(SUF[0]!)],
};

describe('optimizeFromItem honours exclusions', () => {
  const start = heldItem;
  const itemTargets = [
    { modId: PRE[0]!, minTierIndex: 0 },
    { modId: PRE[1]!, minTierIndex: 0 },
    { modId: SUF[0]!, minTierIndex: 0 },
  ];

  it('uses no omen when every omen is excluded', () => {
    const open = optimizeFromItem(data, prices, start, itemTargets);
    expect(open.frontier.length).toBeGreaterThan(0);
    const closed = optimizeFromItem(data, prices, start, itemTargets, { policy: policy(...OMENS) });
    for (const s of allSteps(closed.frontier)) {
      expect(traitsOf(s).filter((t) => t.startsWith('omen:')), JSON.stringify(s)).toEqual([]);
    }
  });
});

describe('markovFromItem honours exclusions', () => {
  const start = heldItem;
  const itemTargets = [
    { modId: PRE[0]!, minTierIndex: 0 },
    { modId: PRE[1]!, minTierIndex: 0 },
  ];

  it('never plays an excluded action anywhere in the optimal policy', () => {
    const p = policy(...OMENS, 'exalt_perfect');
    const r = markovFromItem(data, prices, start, itemTargets, { policy: p });
    expect(r.feasible).toBe(true);
    expect(r.policy.size).toBeGreaterThan(0);
    for (const action of r.policy.values()) {
      expect(allowsAction(p, action), JSON.stringify(action)).toBe(true);
    }
  });

  // REGRESSION. With every currency excluded there are no actions at all, so value iteration leaves V
  // at its 0-initialisation — and the planner used to report expectedCost 0, feasible: true, i.e. a
  // free craft that is already finished. VI's 0-init is only a valid lower bound while the goal is
  // reachable from every state, which exclusions broke; reachability is now established explicitly.
  it('reports infeasible rather than reporting a free craft when nothing can be played', () => {
    const r = markovFromItem(data, prices, start, itemTargets, {
      policy: policy('chaos', 'annul', 'exalt', 'exalt_greater', 'exalt_perfect', 'desecrate', 'perfect_essence'),
    });
    expect(r.feasible).toBe(false);
    expect(r.expectedCost).toBe(Infinity);
    expect(r.reason).toMatch(/currencies you have/i);
  });
});
