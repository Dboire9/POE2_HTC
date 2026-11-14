import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import { FOUND_BASE_WEIGHT, FOUND_PRICES } from '../../packages/optimizer/src/foundPrices.ts';
import { pricesForBase } from '../../packages/optimizer/src/cost.ts';
import { actionPriceParts } from '../../packages/optimizer/src/markovActions.ts';
import { listMods, priceBasis } from './engine.ts';
import type { EngineMarkovResult } from './engineTypes.ts';
import { runSolve, type SolveRequest, type SolveResult } from './solve.ts';

// A Lab solve on the FOUND sheet (`priceBasis: 'found'`): a starter recipe, planned on what a new player
// picks up and read as counts. These pin that the whole solve sees that sheet and nothing else, that it
// says so on the result, that nothing market-only runs, and that a request WITHOUT the field is the trade
// solve it always was.

const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const staves = eng.data.bases.get('Quarterstaves')!;
const PHYS = 'Quarterstaves/LocalPhysicalDamage';
const SPEED = 'Quarterstaves/LocalIncreasedAttackSpeed';
const HASTE = 'Quarterstaves/Essence_IncreasedAttackSpeed';
const mods = listMods(eng.data, 'Quarterstaves');
/** The picker's tier (1 = best) for the engine's worst-first index. */
const display = (id: string, minIndex: number): number =>
  [...mods.prefixes, ...mods.suffixes].find((m) => m.id === id)!.tiers.length - minIndex;
/** A first weapon: Physical Damage at its second tier or better, and the Haste Essence's modifier. */
const starter = [{ modId: PHYS, tierDisplay: display(PHYS, 1) }, { modId: HASTE, tierDisplay: 3 }];
const twoRolled = [{ modId: PHYS, tierDisplay: display(PHYS, 1) }, { modId: SPEED, tierDisplay: display(SPEED, 1) }];

const lab = (req: Partial<Extract<SolveRequest, { kind: 'lab' }>>): Extract<SolveResult, { kind: 'lab' }> => {
  const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Quarterstaves', level: 70 }, targets: starter, ...req });
  if (got.kind !== 'lab') throw new Error('not a lab result');
  return got;
};
const usesSum = (m: EngineMarkovResult): number =>
  (m.uses ?? []).reduce((s, u) => s + u.price * u.count, (m.restartCost ?? 0) * (m.restarts ?? 0));

describe('a found-basis Lab solve', () => {
  const got = lab({ priceBasis: 'found', effort: { maxMillis: 60_000, maxNodes: 200, solver: 'policy' } });
  const m = got.markov;

  it('is exact, and every move in its plan is one the found sheet prices', () => {
    expect(m.feasible).toBe(true);
    expect(m.bound).toBe('exact');
    // Every weight on the sheet is above zero, so a part priced at 0 is one the sheet does not list.
    const found = pricesForBase(FOUND_PRICES, staves);
    for (const a of m.routes!.actions) {
      for (const part of actionPriceParts(found, a)) expect(part.price, part.key).toBeGreaterThan(0);
    }
    for (const plan of got.result.frontier) {
      for (const step of plan.steps) expect(step.label).not.toMatch(/Greater|Perfect|Omen|Annul|Desecrat/);
    }
    expect(got.result.frontier.length).toBeGreaterThan(0);
  });

  it('starts over at the base weight', () => {
    expect(m.restartCost).toBe(FOUND_BASE_WEIGHT);
    expect(lab({ priceBasis: 'found', baseCost: 3 }).markov.restartCost).toBe(3);
  });

  it('says it is on the found basis, with its caveat and no exchange rate', () => {
    expect(got.basis).toBeDefined();
    expect(got.basis!.found).toBe(true);
    expect(got.basis!.rates).toBeUndefined();
    expect(got.basis!.caveat).toBe(FOUND_PRICES.meta!.caveat);
  });

  it('counts what the plan uses — the Essence by name — and the counts price back to its cost', () => {
    const labels = (m.uses ?? []).map((u) => u.label);
    expect(labels).toContain('Transmute');
    expect(labels).toContain('Lesser Essence of Haste');
    expect(m.restarts).toBeGreaterThan(0);
    expect(Math.abs(usesSum(m) - m.expectedCost) / m.expectedCost).toBeLessThan(1e-3);
  });

  it('runs nothing that only means something on a market', () => {
    const asked = lab({ priceBasis: 'found', budget: 50, playOut: true, watch: [[PHYS]], sell: [10] });
    expect(asked.alts).toBeNull();
    expect(asked.markov.replay).toBeUndefined();
    expect(asked.markov.holdings).toBeUndefined();
  });

  it('still honours the currencies the player ticked off', () => {
    // Two rolled modifiers, each of which an Essence can also give (essenceTwins.ts) — and on this sheet
    // the Lesser Essences are what the plan reaches for.
    const isEssence = (key: string): boolean => key.startsWith('essence');
    const r = runSolve(eng, { kind: 'lab', priceBasis: 'found', from: { baseId: 'Quarterstaves', level: 25 }, targets: twoRolled });
    if (r.kind !== 'lab') throw new Error('not a lab result');
    expect(r.markov.uses?.some((u) => isEssence(u.key))).toBe(true); // the premise
    const without = runSolve(eng, {
      kind: 'lab', priceBasis: 'found', from: { baseId: 'Quarterstaves', level: 25 }, targets: twoRolled,
      excluded: ['essence_lesser', 'essence', 'essence_greater'],
    });
    if (without.kind !== 'lab') throw new Error('not a lab result');
    expect(without.markov.feasible).toBe(true);
    expect(without.markov.uses?.some((u) => isEssence(u.key))).toBe(false);
    expect(without.markov.routes!.actions.some((a) => a.currency === 'essence')).toBe(false);
  });
});

describe('a trade-basis Lab solve is what it always was', () => {
  const frozen = { ...eng, prices: loadFrozenPrices() };
  const solve = (extra: Partial<Extract<SolveRequest, { kind: 'lab' }>>) => {
    const r = runSolve(frozen, { kind: 'lab', from: { baseId: 'Quarterstaves', level: 70 }, targets: starter, ...extra });
    if (r.kind !== 'lab') throw new Error('not a lab result');
    return r;
  };

  it('carries no basis and no counts, restarts free, and plays the trade sheet’s Greater Essence', () => {
    const r = solve({});
    expect(r.basis).toBeUndefined();
    expect(r.markov.uses).toBeUndefined();
    expect(r.markov.restarts).toBeUndefined();
    expect(r.markov.restartCost).toBe(0);
    expect(r.markov.routes!.actions.some((a) => a.currency === 'essence' && a.level === 'greater')).toBe(true);
  });

  it('asked for counts, gains them and nothing else moves', () => {
    const plain = solve({});
    const counted = solve({ uses: true });
    const { uses, restarts, ...rest } = counted.markov;
    expect(rest).toEqual(plain.markov);
    expect(counted.result).toEqual(plain.result);
    expect(uses!.length).toBeGreaterThan(0);
    expect(restarts).toBeGreaterThanOrEqual(0);
    // To the solve's own stopping rule (a thousandth of its cheapest move, at its default tolerance): the
    // counts are exact for the plan, the solve's figure is not quite (markovUses.test.ts pins 1e-9 at 1e-12).
    expect(Math.abs(usesSum(counted.markov) - counted.markov.expectedCost) / counted.markov.expectedCost).toBeLessThan(1e-3);
  });
});

describe('the price basis a UI reads', () => {
  it('the found sheet reports no exchange rate — its Chaos weight is not one', () => {
    const b = priceBasis({ prices: FOUND_PRICES });
    expect(b.found).toBe(true);
    expect(b.rates).toBeUndefined();
    expect(FOUND_PRICES.currency['chaos']).toBeDefined(); // the trap: a weight that would read as "1 chaos = 8"
  });

  it('the trade sheet is unchanged: rates, and no found flag', () => {
    const b = priceBasis(eng);
    expect(b.found).toBeUndefined();
    expect(b.rates?.chaos).toBe(eng.prices.currency['chaos']);
  });
});

describe('what crosses the worker boundary survives a structured clone', () => {
  it('the request field and the result fields', () => {
    const req: SolveRequest = { kind: 'lab', priceBasis: 'found', uses: true, from: { baseId: 'Quarterstaves', level: 25 }, targets: twoRolled };
    expect(structuredClone(req)).toEqual(req);
    const res = runSolve(eng, req);
    if (res.kind !== 'lab') throw new Error('not a lab result');
    const back = structuredClone(res);
    expect(back.basis).toEqual(res.basis);
    expect(back.markov.uses).toEqual(res.markov.uses);
    expect(back.markov.restarts).toBe(res.markov.restarts);
  });
});
