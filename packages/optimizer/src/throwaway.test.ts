import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemState, PlanStep } from '../../engine/src/index.ts';
import {
  addNormalAffixProbability, loadPatch, planStates, resolveMod, stepProbability, whiteItem, withAffix, withRunes,
} from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { allowsStep, currencyKey, stepCost } from './cost.ts';
import { leverOptions } from './levers.ts';
import { GREATER_EXALTATION_OMEN, withGreaterExaltations } from './doubleExalt.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';
import { frontierSnapshot, identityCrafts, withPerfectCrafts } from './__fixtures__/throwawayCrafts.ts';

// A THROWAWAY is a Regal or an Exalt spent on landing anything on one side, so the Perfect Essence or
// Alloy right after it has something of yours it may eat — a mod you don't want. Before it, a
// Perfect Essence could only eat junk already on the item (from an item) or one of your targets,
// re-rolled straight after (from white). The first left a player's Magic Sceptre, holding only mods
// they wanted, with no route at all for its two Alloys; the second re-rolled a T1 mod as the price.
//
// What this pins, in the order the change promised it:
//   1. crafts with no Perfect Essence are UNTOUCHED — identical routes, identical search;
//   2. crafts with one only get BETTER — every old route is still matched or beaten;
//   3. the odds of a route with a throwaway are EXACT, not an estimate;
//   4. the pieces a throwaway flows through — levers, pricing, Greater Exaltation — treat it right.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();

describe('crafts without a Perfect Essence are untouched', () => {
  // Recorded at 62315a9, before throwaways existed, by running these same crafts (the list lives in
  // `__fixtures__/throwawayCrafts.ts` so the recording and this replay cannot disagree). `plansEvaluated`
  // is part of the comparison, so this proves the SEARCH is unchanged, not merely its winners.
  const before = JSON.parse(readFileSync(
    join(import.meta.dirname, '__fixtures__', 'pre-throwaway-frontiers.json'), 'utf8')) as {
    identity: Record<string, unknown>; withPerfect: Record<string, ReturnType<typeof frontierSnapshot>>;
  };

  it.each(identityCrafts(data, prices).map((c) => [c.name, c] as const))('%s', (_name, craft) => {
    // Through JSON, as it was recorded: `undefined` fields and number formatting then compare alike.
    expect(JSON.parse(JSON.stringify(frontierSnapshot(craft.run())))).toEqual(before.identity[craft.name]);
  });

  it.each(withPerfectCrafts(data, prices).map((c) => [c.name, c] as const))('%s is never worse', (_name, craft) => {
    const now = frontierSnapshot(craft.run());
    for (const old of before.withPerfect[craft.name]!.frontier) {
      expect(now.frontier.some((p) => p.probability >= old.probability * (1 - 1e-12)
        && p.expected <= old.expected * (1 + 1e-12))).toBe(true);
    }
  });
});

const sceptre = data.bases.get('Sceptres')!;
const runed = withRunes(sceptre, ['astrids-creativity']);
const ALLOY_CHANCE = 'Sceptres/PerfectEssence_MinionGainPuppetMasterOnCommand';
const ALLOY_STACKS = 'Sceptres/PerfectEssence_MaximumPuppeteerStacks';
const SPIRIT = 'Sceptres/LocalIncreasedSpiritPercent';
const ALLY_RES = 'Sceptres/AlliesInPresenceAllResistances';
const ALLY_DAMAGE = 'Sceptres/AlliesInPresenceAllDamage';
const MINION_LEVEL = 'Sceptres/GlobalIncreaseMinionSpellSkillGemLevelWeapon';
const best = (id: string) => ({ modId: id, tierName: resolveMod(data, id).tiers.at(-1)!.name });
const t1 = (id: string) => ({ modId: id, minTierIndex: resolveMod(data, id).tiers.length - 1 });

/**
 * The craft a player reported: a Magic Sceptre holding T1 ally damage and T1 minion levels, both
 * wanted, asked for T1 Spirit and the two Alloys (Astrid's Creativity socketed), last suffix free.
 * The step planner used to refuse it outright.
 */
const reported = () => optimizeFromItem(data, prices,
  { base: runed, level: 82, rarity: 'magic', prefixes: [best(ALLY_DAMAGE)], suffixes: [best(MINION_LEVEL)] },
  [t1(ALLY_DAMAGE), t1(MINION_LEVEL), { modId: ALLOY_CHANCE }, { modId: ALLOY_STACKS }, t1(SPIRIT)],
  { spare: { prefixes: 0, suffixes: 1 } });

describe('the reported Sceptre gets routes', () => {
  it('finds routes where each Alloy eats a throwaway rolled right before it', () => {
    const r = reported();
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const plan of r.frontier) {
      expect(plan.probability).toBeGreaterThan(0);
      plan.steps.forEach((step, i) => {
        if (step.currency !== 'throwaway') return;
        // The next step is the essence that eats it — the one-step life, which is what keeps these exact.
        expect(plan.steps[i + 1]).toMatchObject({ currency: 'perfect-essence', remove: step.throwaway.id });
      });
      expect(plan.steps.filter((s) => s.currency === 'perfect-essence')).toHaveLength(2);
    }
  });

  // A Magic item holding only what you want, and nothing left to roll but the Alloy: the one way to
  // the Rare an essence needs is a Regal that lands a throwaway, eaten at once. That opener is the
  // whole route here — without it every plan would Exalt a Magic item and score 0.
  it('opens a Magic item on a Regal’d throwaway when nothing else is left to roll', () => {
    const r = optimizeFromItem(data, prices,
      { base: sceptre, level: 82, rarity: 'magic', prefixes: [best(ALLY_DAMAGE)], suffixes: [best(MINION_LEVEL)] },
      [ALLY_DAMAGE, MINION_LEVEL, ALLOY_STACKS].map((modId) => ({ modId })));
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const plan of r.frontier) {
      expect(plan.steps[0]).toMatchObject({ currency: 'throwaway', orb: 'regal' });
      expect(plan.steps[1]).toMatchObject({ currency: 'perfect-essence', add: ALLOY_STACKS, remove: 'throwaway:opener' });
    }
  });

  // A free prefix lets junk STAY — and the essence can still eat. Before throwaways a keep-set that left
  // an essence nothing to eat was dropped unrun. Here eating the junk is a 1-in-3 Sinistral removal among
  // three prefixes, while a suffix throwaway forced by its omen and eaten under a Dextral one is certain.
  it('lets a free slot keep junk while a throwaway feeds the essence', () => {
    const family = (id: string) => resolveMod(data, id).family;
    const junk = sceptre.pools.normal.prefixes.find((id) => ![ALLY_DAMAGE, SPIRIT].map(family).includes(family(id)))!;
    const r = optimizeFromItem(data, prices,
      { base: sceptre, level: 82, rarity: 'rare', prefixes: [best(ALLY_DAMAGE), best(SPIRIT), best(junk)], suffixes: [] },
      [ALLY_DAMAGE, SPIRIT, ALLOY_STACKS].map((modId) => ({ modId })), { spare: { prefixes: 1, suffixes: 0 } });
    const keeps = r.frontier.filter((p) => !p.steps.some((s) => 'remove' in s && s.remove === junk));
    expect(keeps.length).toBeGreaterThan(0);
    expect(keeps.every((p) => p.steps.some((s) => s.currency === 'throwaway'))).toBe(true);
  });

  // From white the old route made the essence eat a TARGET and re-rolled it; a throwaway is one roll of
  // anything instead. On this craft every route that survives uses one, and the best is ~6x likelier.
  it('beats eat-a-target-and-re-roll-it from white', () => {
    const r = optimizePareto(data, prices, sceptre, [SPIRIT, ALLY_RES, MINION_LEVEL, ALLOY_STACKS].map((modId) => ({ modId })), { level: 82 });
    const likeliest = r.frontier.at(-1)!;
    expect(likeliest.steps.some((s) => s.currency === 'throwaway')).toBe(true);
    expect(likeliest.probability).toBeGreaterThan(5 * 2.125e-5); // the old likeliest, recorded at 62315a9
  });
});

/**
 * A route's success, recomputed by branching at every throwaway over each mod it could REALLY be — its
 * own probability, its own family on the item, named by its real id in the step that eats it — rather
 * than trusting the placeholder. If the one-step life does what it claims, which mod landed cannot
 * change a single later factor, and this equals the model to rounding.
 */
function exactSuccess(state: ItemState, steps: readonly PlanStep[]): number {
  const [step, ...rest] = steps;
  if (step === undefined) return 1;
  if (step.currency !== 'throwaway') {
    const p = stepProbability(data, state, step);
    return p === 0 ? 0 : p * exactSuccess(planStates(data, state, [step, step])[1]!, rest);
  }
  const { side, id: placeholder } = step.throwaway;
  let total = 0;
  for (const id of side === 'prefix' ? state.base.pools.normal.prefixes : state.base.pools.normal.suffixes) {
    const p = addNormalAffixProbability(data, state, step.orb, id, {
      ...(step.tier === undefined ? {} : { currencyTier: step.tier }),
      ...(step.orb === 'exalt' && step.constrainTo !== undefined ? { constrainTo: step.constrainTo } : {}),
    });
    if (p === 0) continue;
    const mod = resolveMod(data, id);
    const landed = withAffix(state, mod.type, { modId: id, tierName: mod.tiers[0]!.name },
      step.orb === 'regal' ? 'rare' : state.rarity);
    const named = rest.map((s): PlanStep =>
      (s.currency === 'perfect-essence' && s.remove === placeholder ? { ...s, remove: id } : s));
    total += p * exactSuccess(landed, named);
  }
  return total;
}

describe('the odds of a route with a throwaway are exact', () => {
  const cases: [string, ItemState, () => { frontier: readonly { steps: readonly PlanStep[]; probability: number }[] }][] = [
    ['the reported Sceptre (two throwaways, from an item)',
      { base: runed, level: 82, rarity: 'magic', prefixes: [best(ALLY_DAMAGE)], suffixes: [best(MINION_LEVEL)] }, reported],
    ['two Alloys from white', whiteItem(runed, 82),
      () => optimizePareto(data, prices, runed, [SPIRIT, ALLY_RES, ALLY_DAMAGE, ALLOY_CHANCE, ALLOY_STACKS].map((modId) => ({ modId })), { level: 82 })],
  ];

  it.each(cases)('%s', (_name, start, run) => {
    const withThrowaways = run().frontier.filter((p) => p.steps.some((s) => s.currency === 'throwaway'));
    expect(withThrowaways.length).toBeGreaterThan(0);
    for (const plan of withThrowaways) {
      expect(exactSuccess(start, plan.steps) / plan.probability).toBeCloseTo(1, 12);
    }
  });
});

describe('the pieces a throwaway flows through', () => {
  const rare: ItemState = { base: sceptre, level: 82, rarity: 'rare', prefixes: [best(ALLY_DAMAGE)], suffixes: [] };
  const exaltOne: PlanStep = { currency: 'throwaway', orb: 'exalt', throwaway: { id: 'throwaway:0', side: 'suffix' } };

  // Its currency is its own name, which is no listing — priced by it, the step would be FREE.
  it('is priced, and excluded, as the orb it spends', () => {
    const regalOne: PlanStep = { currency: 'throwaway', orb: 'regal', throwaway: { id: 'throwaway:0', side: 'suffix' } };
    expect(stepCost(prices, exaltOne)).toBe(stepCost(prices, { currency: 'exalt', add: MINION_LEVEL }));
    expect(stepCost(prices, { ...exaltOne, tier: 'greater' })).toBe(prices.currency['exalt_greater']);
    expect(stepCost(prices, regalOne)).toBe(prices.currency['regal']);
    expect(stepCost(prices, { ...exaltOne, constrainTo: 'suffix' }))
      .toBe(prices.currency['exalt']! + prices.omens['OmenofDextralExaltation']!);
    expect(allowsStep({ excluded: new Set(['exalt']) }, exaltOne)).toBe(false);
    expect(() => currencyKey({ currency: 'throwaway' })).toThrow(/orb/);
  });

  it('can be forced onto its side with the Exaltation omen — certain there', () => {
    const forced = leverOptions(data, prices, rare, exaltOne).find((o) => 'constrainTo' in o.step && o.step.constrainTo === 'suffix');
    expect(forced?.prob).toBeCloseTo(1, 15);
  });

  it('leaves the same item whichever orb strength or omen buys it', () => {
    const eat: PlanStep = { currency: 'perfect-essence', add: ALLOY_STACKS, remove: 'throwaway:0' };
    const after = leverOptions(data, prices, rare, exaltOne).map((o) => planStates(data, rare, [o.step, eat])[1]);
    expect(after.length).toBeGreaterThan(1);
    for (const a of after) expect(a).toEqual(after[0]);
  });

  // The Crystallisation omen goes on the side the eaten mod SITS, read off the item. It used to be read
  // by resolving the removed mod's id, which throws on a throwaway's placeholder.
  it('gets the right Crystallisation omen on the essence that eats it', () => {
    const holding = planStates(data, rare, [exaltOne, exaltOne])[1]!;
    const eat: PlanStep = { currency: 'perfect-essence', add: ALLOY_STACKS, remove: 'throwaway:0' };
    const omened = leverOptions(data, prices, holding, eat).find((o) => 'omen' in o.step && o.step.omen !== undefined);
    expect(omened?.step).toMatchObject({ omen: 'dextral' });
    expect(omened?.prob).toBe(1); // the throwaway is the only suffix
  });

  it('is never fused into a Greater Exaltation', () => {
    expect(prices.omens[GREATER_EXALTATION_OMEN]).toBeDefined(); // …or this would pass for the wrong reason
    const named: PlanStep = { currency: 'exalt', add: ALLY_RES };
    expect(withGreaterExaltations(prices, [[exaltOne, named]])).toHaveLength(1);
    expect(withGreaterExaltations(prices, [[{ currency: 'exalt', add: ALLY_DAMAGE }, named]])).toHaveLength(2);
  });
});
