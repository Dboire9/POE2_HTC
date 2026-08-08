import { describe, it, expect } from 'vitest';
import { loadPatch, alchemyProbability } from '../../engine/src/index.ts';
import type { PatchData } from '../../engine/src/index.ts';
import { optimizePareto } from './optimize.ts';
import type { Prices } from './cost.ts';

const data: PatchData = loadPatch('data/patches/0.5');
const wands = data.bases.get('Wands')!;
const prices: Prices = {
  currency: {
    transmute: 0.002, transmute_greater: 0.05, transmute_perfect: 0.5,
    augment: 0.01, augment_greater: 0.1, augment_perfect: 1,
    regal: 0.15, regal_greater: 1, regal_perfect: 5,
    alchemy: 0.1,
    exalt: 1, exalt_greater: 5, exalt_perfect: 20, essence: 1,
  },
  omens: {},
};
const P1 = 'Wands/MAXIMUM_MANA';        // 11 tiers, T1 = idx 10 (ilvl 70)
const S1 = 'Wands/INTELLIGENCE';
const t1 = (id: string): number => data.mods.get(id)!.tiers.length - 1; // index of the best (T1) tier

describe('optimizePareto — tier targeting drives orb strength', () => {
  it('a T1 target yields a base→greater→perfect frontier (cost and probability both rise)', () => {
    const r = optimizePareto(data, prices, wands, [{ modId: P1, minTierIndex: t1(P1) }]);
    expect(r.currencyDepth).toBe('full');
    expect(r.frontier.length).toBe(3); // one transmute step, three orb strengths, all non-dominated
    expect(r.frontier.map((p) => (p.steps[0] as { tier?: string }).tier)).toEqual(['base', 'greater', 'perfect']);
    for (let k = 1; k < r.frontier.length; k++) {
      expect(r.frontier[k]!.cost.expected).toBeGreaterThan(r.frontier[k - 1]!.cost.expected);
      expect(r.frontier[k]!.probability).toBeGreaterThan(r.frontier[k - 1]!.probability);
    }
  });

  it('an any-tier target uses only a base orb (stronger orbs would reject tiers you accept)', () => {
    const r = optimizePareto(data, prices, wands, [{ modId: P1 }]); // minTierIndex 0 → target ilvl ~1
    expect(r.frontier.length).toBe(1);
    expect((r.frontier[0]!.steps[0] as { tier?: string }).tier).toBe('base');
  });

  it('the frontier is a valid Pareto set: cost ascending, probability strictly ascending', () => {
    const r = optimizePareto(data, prices, wands, [
      { modId: P1, minTierIndex: t1(P1) }, { modId: S1 },
    ]);
    for (let k = 1; k < r.frontier.length; k++) {
      expect(r.frontier[k]!.cost.expected).toBeGreaterThanOrEqual(r.frontier[k - 1]!.cost.expected);
      expect(r.frontier[k]!.probability).toBeGreaterThan(r.frontier[k - 1]!.probability);
    }
    // every frontier plan is achievable (P > 0, finite cost)
    for (const p of r.frontier) {
      expect(p.probability).toBeGreaterThan(0);
      expect(Number.isFinite(p.cost.expected)).toBe(true);
    }
  });

  it('the cheapest and surest endpoints differ in orb strength (the whole point of the frontier)', () => {
    const r = optimizePareto(data, prices, wands, [{ modId: P1, minTierIndex: t1(P1) }, { modId: S1 }]);
    const cheapest = r.frontier[0]!;
    const surest = r.frontier[r.frontier.length - 1]!;
    expect(surest.probability).toBeGreaterThan(cheapest.probability);
    expect(surest.cost.expected).toBeGreaterThan(cheapest.cost.expected);
  });
});

describe('optimizePareto — essence-only mods (Model B)', () => {
  const ESS = 'Wands/ESSENCE_INCREASED_CAST_SPEED'; // essence-only suffix; its tiers are essence levels
  const bestLevel = (id: string): number => data.mods.get(id)!.tiers.length - 1;

  it('guarantees an essence-only mod via a P=1 essence step at the chosen level, priced by level', () => {
    const r = optimizePareto(data, prices, wands, [
      { modId: P1, minTierIndex: 0 },                 // a rollable mod for the essence to land on
      { modId: ESS, minTierIndex: bestLevel(ESS) },   // Greater essence level
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const steps = r.frontier[0]!.steps;
    const ess = steps.find((s) => s.currency === 'essence') as { currency: 'essence'; essenceLevel?: string } | undefined;
    expect(ess).toBeDefined();
    expect(ess!.essenceLevel).toBe('greater');
    // The essence step's per-step probability is 1 (deterministic).
    const idx = steps.indexOf(ess as never);
    expect(r.frontier[0]!.result.steps[idx]!.prob).toBe(1);
  });

  it('rejects two essence-only mods (one Magic→Rare transition per craft)', () => {
    expect(() => optimizePareto(data, prices, wands, [
      { modId: ESS }, { modId: 'Wands/ESSENCE_SPELL_CRIT_CHANCE' },
    ])).toThrow(/one essence-only/i);
  });

  it('rejects an essence-only-only target (no rollable Magic base for the essence)', () => {
    expect(() => optimizePareto(data, prices, wands, [{ modId: ESS }])).toThrow(/rollable mod/i);
  });
});

describe('optimizePareto — exaltation omens', () => {
  it('side-constrains exalts (Sinistral/Dextral Exaltation) as a frontier lever', () => {
    // 2 prefixes + 2 suffixes ⇒ the 4th mod is exalt-added with both sides open, where a side-omen helps.
    const r = optimizePareto(data, prices, wands, [
      { modId: 'Wands/MAXIMUM_MANA' }, { modId: 'Wands/INCREASED_SPELL_DAMAGE' },
      { modId: 'Wands/INTELLIGENCE' }, { modId: 'Wands/INCREASED_CAST_SPEED' },
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    // The test price sheet has free omens, so a side-constrained exalt weakly dominates → on the frontier.
    const constrained = r.frontier.some((p) =>
      p.steps.some((s) => s.currency === 'exalt' && (s as { constrainTo?: string }).constrainTo !== undefined));
    expect(constrained).toBe(true);
  });

  it('with priced omens the frontier stays a valid Pareto set (cost ↑, probability ↑)', () => {
    // Charge for the Exaltation omens so the plain-vs-omen trade is real, not free.
    const paid: Prices = { currency: prices.currency, omens: { OmenofSinistralExaltation: 3, OmenofDextralExaltation: 3 } };
    const r = optimizePareto(data, paid, wands, [
      { modId: 'Wands/MAXIMUM_MANA' }, { modId: 'Wands/INTELLIGENCE' }, { modId: 'Wands/INCREASED_CAST_SPEED' },
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    for (let k = 1; k < r.frontier.length; k++) {
      expect(r.frontier[k]!.cost.expected).toBeGreaterThanOrEqual(r.frontier[k - 1]!.cost.expected);
      expect(r.frontier[k]!.probability).toBeGreaterThan(r.frontier[k - 1]!.probability);
    }
  });
});

describe('optimizePareto — Orb of Alchemy opener', () => {
  // A 4-mod any-tier target (2 prefix + 2 suffix): alchemy can slam all four at once.
  const four = ['Wands/MAXIMUM_MANA', 'Wands/INCREASED_SPELL_DAMAGE', 'Wands/INTELLIGENCE', 'Wands/INCREASED_CAST_SPEED']
    .map((modId) => ({ modId }));

  it('offers a single-step alchemy plan whose probability equals the engine alchemyProbability', () => {
    const r = optimizePareto(data, prices, wands, four);
    const alch = r.frontier.find((p) => p.steps.length === 1 && p.steps[0]!.currency === 'alchemy');
    expect(alch).toBeDefined();
    // The optimizer's alchemy plan must reproduce the (independently MC-validated) engine function.
    const expected = alchemyProbability(data, wands, four.map((t) => t.modId));
    expect(alch!.probability).toBeCloseTo(expected, 12);
    // It's a genuine frontier point: the surest way to get all four (one 4-mod slam), and the dearest.
    expect(alch!.probability).toBe(Math.max(...r.frontier.map((p) => p.probability)));
  });

  it('does NOT use alchemy when a target needs a specific tier (alchemy rolls any tier)', () => {
    // Same four mods, but one is pinned to T1 ⇒ only 3 remain "any tier" ⇒ alchemy can't fill 4 targets.
    const pinned = [{ modId: 'Wands/MAXIMUM_MANA', minTierIndex: t1('Wands/MAXIMUM_MANA') }, ...four.slice(1)];
    const r = optimizePareto(data, prices, wands, pinned);
    expect(r.frontier.every((p) => p.steps.every((s) => s.currency !== 'alchemy'))).toBe(true);
  });

  it('opens with alchemy then exalts the tail for a 5-mod target', () => {
    const five = [...four, { modId: 'Wands/MANA_REGENERATION_RATE' }];
    const r = optimizePareto(data, prices, wands, five);
    const opener = r.frontier.find((p) => p.steps[0]?.currency === 'alchemy');
    expect(opener).toBeDefined();
    // 4 mods slammed by alchemy, the 5th exalted on top.
    expect((opener!.steps[0] as { adds: string[] }).adds).toHaveLength(4);
    expect(opener!.steps.slice(1).every((s) => s.currency === 'exalt')).toBe(true);
  });
});

describe('optimizePareto — search stays bounded', () => {
  it('throttles the orb-tier search on a big target and reports the depth (never silent)', () => {
    // 6 mods (3 prefix + 3 suffix) all at T1 → full search would be ~500k plans → must throttle
    const targets = [
      'Wands/MAXIMUM_MANA', 'Wands/INCREASED_SPELL_DAMAGE', 'Wands/DAMAGE_AS_EXTRA_FIRE_DAMAGE',
      'Wands/INTELLIGENCE', 'Wands/MANA_REGENERATION_RATE', 'Wands/INCREASED_CAST_SPEED',
    ].map((modId) => ({ modId, minTierIndex: t1(modId) }));
    const r = optimizePareto(data, prices, wands, targets);
    expect(r.currencyDepth).not.toBe('full'); // reduced to keep the plan count bounded
    expect(r.frontier.length).toBeGreaterThan(0);
    expect(r.plansEvaluated).toBeLessThanOrEqual(120_000);
  });
});

describe('optimizePareto — desecrated targets (from white)', () => {
  // Synthetic base: normal prefixes NP1/NP2, normal suffix NS1, and a KURGAL desecrated suffix DS1
  // (boss omen = Blackblooded, the only kurgal suffix → 1/1). Reaching Rare needs the 3 normal mods
  // (transmute → augment → regal), then the item can be Desecrated.
  const mk = (id: string, type: 'prefix' | 'suffix', family: string, source: 'normal' | 'desecrated', tags: string[] = []) =>
    ({ id, group: id, field: id, source, type, categories: [], family, tags, text: id,
       tiers: [{ name: 't1', ilvl: 1, weight: source === 'desecrated' ? 1 : 20, ranges: [[1, 1]], stats: [] }] });
  const sbase = {
    id: 'S', name: 'S', category: 'C',
    pools: { normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1'] }, desecrated: { prefixes: [], suffixes: ['DS1'] }, essence: { prefixes: [], suffixes: [] } },
  };
  const sdata: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')], ['NP2', mk('NP2', 'prefix', 'Fp2', 'normal')],
      ['NS1', mk('NS1', 'suffix', 'Fs1', 'normal')], ['DS1', mk('DS1', 'suffix', 'Fds', 'desecrated', ['kurgal_mod'])],
    ]),
    bases: new Map([['S', sbase]]),
  } as unknown as PatchData;
  const sprices: Prices = { currency: { transmute: 0.002, augment: 0.01, regal: 0.15, exalt: 1, desecrate: 0.5 }, omens: {} };

  it('builds the Rare with the normal add-chain, then Desecrates the desecrated mod (boss omen)', () => {
    const r = optimizePareto(sdata, sprices, sbase as never, [
      { modId: 'NP1' }, { modId: 'NP2' }, { modId: 'NS1' }, { modId: 'DS1' },
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const plan = r.frontier[r.frontier.length - 1]!; // surest
    const des = plan.steps.find((s) => s.currency === 'desecrate');
    expect(des).toMatchObject({ currency: 'desecrate', add: 'DS1', boss: 'blackblooded' });
    // The desecration must come after the item is Rare — i.e. after the regal (the 3rd, rare-making add).
    const regalAt = plan.steps.findIndex((s) => s.currency === 'regal');
    const desAt = plan.steps.findIndex((s) => s.currency === 'desecrate');
    expect(regalAt).toBeGreaterThanOrEqual(0);
    expect(desAt).toBeGreaterThan(regalAt);
  });

  it('rejects two desecrated targets (an item holds at most one)', () => {
    const twoDes = {
      id: 'S', name: 'S', category: 'C',
      pools: { normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1'] }, desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] }, essence: { prefixes: [], suffixes: [] } },
    };
    const d2: PatchData = {
      patch: 't',
      mods: new Map([
        ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')], ['NP2', mk('NP2', 'prefix', 'Fp2', 'normal')],
        ['NS1', mk('NS1', 'suffix', 'Fs1', 'normal')],
        ['DP1', mk('DP1', 'prefix', 'Fdp', 'desecrated', ['kurgal_mod'])],
        ['DS1', mk('DS1', 'suffix', 'Fds', 'desecrated', ['amanamu_mod'])],
      ]),
      bases: new Map([['S', twoDes]]),
    } as unknown as PatchData;
    expect(() => optimizePareto(d2, sprices, twoDes as never, [
      { modId: 'NP1' }, { modId: 'DP1' }, { modId: 'DS1' },
    ])).toThrow(/at most one desecrated mod/i);
  });

  it('returns no plan when the normal mods can’t reach Rare on their own (only 1 normal + desecrated)', () => {
    // One normal prefix + the desecrated suffix: the add-chain never reaches Rare (no regal), so the
    // desecration can never fire — an honest empty frontier rather than a bogus plan.
    const r = optimizePareto(sdata, sprices, sbase as never, [{ modId: 'NP1' }, { modId: 'DS1' }]);
    expect(r.frontier.length).toBe(0);
  });
});
