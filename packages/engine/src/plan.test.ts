import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ItemBase, ItemState, Mod, PatchData, PlanStep } from './index.ts';
import { chaosProbability, evaluatePlan, evaluatePlanFrom, exaltProbability, loadPatch } from './index.ts';

// --- hand-computed: composition threads state and multiplies -----------------------------------
// Synthetic base: prefixes NP1(w20,Fp1) NP2(w30,Fp2); suffixes NS1(w50,Fs1). Totals: prefix 50, suffix 50.
describe('evaluatePlan — hand-computed composition', () => {
  const mod = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod =>
    ({ id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: null,
       tiers: [{ name: 't1', ilvl: 1, weight, ranges: [], stats: [] }] });
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'C',
    pools: {
      normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1'] },
      desecrated: { prefixes: [], suffixes: [] },
      essence: { prefixes: [], suffixes: [] },
    },
  };
  // G is an off-pool guaranteed mod for perfect-essence adds (family Fg, absent from the item).
  const data: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', mod('NP1', 'prefix', 'Fp1', 20)], ['NP2', mod('NP2', 'prefix', 'Fp2', 30)],
      ['NS1', mod('NS1', 'suffix', 'Fs1', 50)], ['G', mod('G', 'suffix', 'Fg', 10)],
    ]),
    bases: new Map([['S', base]]),
  };

  it('transmute → augment → regal, with family exclusion (D6) and magic 1+1 slots (D2)', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' }, // white, both open: 20/(50+50) = 0.2
      { currency: 'augment', add: 'NS1' },   // magic 1-prefix → suffix-only (D2); NS1 is the lone suffix → 1
      { currency: 'regal', add: 'NP2' },     // rare; Fp1+Fs1 excluded → only NP2 rollable → 1
    ];
    const r = evaluatePlan(data, base, steps);
    expect(r.steps.map((s) => s.prob)).toEqual([
      expect.closeTo(20 / 100, 12), expect.closeTo(1, 12), expect.closeTo(1, 12),
    ]);
    expect(r.total).toBeCloseTo(20 / 100, 12);
  });

  it('augment cannot add a second prefix to a magic item (D2) → 0 collapses the total', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' }, // magic, 1 prefix
      { currency: 'augment', add: 'NP2' },   // a 2nd prefix on a magic item is illegal → 0
    ];
    const r = evaluatePlan(data, base, steps);
    expect(r.steps[1]!.prob).toBe(0);
    expect(r.total).toBe(0);
  });

  it('a forced essence add is deterministic (P=1) and composes with the roll steps', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' }, // 20/(50+50) = 0.2
      { currency: 'essence', add: 'NS1' },   // forced suffix, slot open + family free → 1
    ];
    const r = evaluatePlan(data, base, steps);
    expect(r.steps[1]!.prob).toBe(1);
    expect(r.total).toBeCloseTo(0.2, 12);
  });

  it('a perfect essence on a Rare item removes one mod (uniform 1/total) and adds its guaranteed mod', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' }, // magic, 1 prefix
      { currency: 'augment', add: 'NS1' },   // magic, 1p + 1s
      { currency: 'regal', add: 'NP2' },     // rare, 2p + 1s
      { currency: 'perfect-essence', remove: 'NP1', add: 'G' }, // pf=2,sf=1 → None 1/3; Fg is free
    ];
    const r = evaluatePlan(data, base, steps);
    expect(r.steps[3]!.prob).toBeCloseTo(1 / 3, 12);
  });

  it('a perfect essence is illegal (0) on a non-Rare item', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' }, // magic
      { currency: 'perfect-essence', remove: 'NP1', add: 'G' }, // item is Magic, not Rare → 0
    ];
    expect(evaluatePlan(data, base, steps).steps[1]!.prob).toBe(0);
  });

  it('a perfect essence on a 0-mod Rare item just adds (P=1, no removal)', () => {
    // reach a 0-mod rare item: transmute+augment+regal to rare, then annul all three away.
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' },
      { currency: 'augment', add: 'NS1' },
      { currency: 'regal', add: 'NP2' },
      { currency: 'annul', remove: 'NP1' },
      { currency: 'annul', remove: 'NP2' },
      { currency: 'annul', remove: 'NS1' },
      { currency: 'perfect-essence', remove: 'NONE', add: 'G' }, // 0 mods → pure add → 1
    ];
    expect(evaluatePlan(data, base, steps).steps[6]!.prob).toBe(1);
  });

  it('a perfect essence is illegal (0) if the guaranteed mod\'s family is already present', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' },
      { currency: 'augment', add: 'NS1' }, // suffix family Fs1
      { currency: 'regal', add: 'NP2' },   // rare, 2p + 1s
      // guaranteed mod shares NS1's family Fs1 (already on the item) → blocked
      { currency: 'perfect-essence', remove: 'NP1', add: 'NS1clone' },
    ];
    const withClone: PatchData = { ...data, mods: new Map([...data.mods, ['NS1clone', mod('NS1clone', 'suffix', 'Fs1', 5)]]) };
    expect(evaluatePlan(withClone, base, steps).steps[3]!.prob).toBe(0);
  });

  it('an illegal step contributes 0 and collapses the total', () => {
    const steps: PlanStep[] = [
      { currency: 'transmute', add: 'NP1' },
      { currency: 'augment', add: 'NP1' }, // same family already present → 0
    ];
    const r = evaluatePlan(data, base, steps);
    expect(r.steps[1]!.prob).toBe(0);
    expect(r.total).toBe(0);
  });

  // --- crafting from an EXISTING item (evaluatePlanFrom) + the chaos step ---------------------------
  const rareStart: ItemState = {
    base, level: 100, rarity: 'rare',
    prefixes: [{ modId: 'NP1', tierName: 't1' }], suffixes: [{ modId: 'NS1', tierName: 't1' }],
  };

  it('evaluatePlanFrom threads an existing rare and exalts a mod onto it (both sides open)', () => {
    // A rare carrying only NP1; the suffix side is open, so the exalt sees both pools.
    const start: ItemState = { base, level: 100, rarity: 'rare', prefixes: [{ modId: 'NP1', tierName: 't1' }], suffixes: [] };
    const r = evaluatePlanFrom(data, start, [{ currency: 'exalt', add: 'NP2' }]);
    // Fp1 (NP1) excluded → prefix pool = NP2 (30), suffix pool = NS1 (50) → 30/80.
    expect(r.total).toBeCloseTo(30 / 80, 12);
    expect(r.total).toBeCloseTo(exaltProbability(data, start, 'NP2'), 12);
  });

  it('a chaos step removes one mod (uniform 1/total) and adds a new one (weighted)', () => {
    const r = evaluatePlanFrom(data, rareStart, [{ currency: 'chaos', remove: 'NS1', add: 'NP2' }]);
    // remove NS1 = 1/2 of the 2 mods; on the freed item [NP1| ] add NP2 = 30/(30+50). → 0.5 × 0.375.
    expect(r.total).toBeCloseTo(0.5 * (30 / 80), 12);
    expect(r.total).toBeCloseTo(chaosProbability(data, rareStart, 'NS1', 'NP2'), 12);
  });

  it('a chaos step is illegal (0) on a non-rare item', () => {
    const magic: ItemState = { base, level: 100, rarity: 'magic', prefixes: [{ modId: 'NP1', tierName: 't1' }], suffixes: [] };
    expect(evaluatePlanFrom(data, magic, [{ currency: 'chaos', remove: 'NP1', add: 'NS1' }]).total).toBe(0);
  });
});

// --- real-data structural regression on the plan specs -----------------------------------------
// The per-step MATH is anchored to Java by the add-affix differential; the corrected (D6) model is
// validated against a real-mechanic Monte-Carlo in the optimizer's self-check. Here we just guard
// that evaluatePlan threads real-data plans without regressing: probs stay in [0,1], legal add steps
// are > 0, and the cumulative equals the product. (The old Java differential was retired because Java
// does NOT exclude on-item families, so it no longer matches the game-correct model — see D6.)
interface PlanSpec { name: string; base: string; level: number; steps: PlanStep[]; }
const specs = (JSON.parse(readFileSync('packages/engine/src/__fixtures__/plans.json', 'utf8')) as { plans: PlanSpec[] }).plans;
const data = loadPatch('data/patches/0.5');

describe('evaluatePlan — real-data plans thread cleanly', () => {
  for (const spec of specs) {
    it(`${spec.name} — probs in [0,1], total = Π`, () => {
      const base = data.bases.get(spec.base)!;
      const r = evaluatePlan(data, base, spec.steps, spec.level);
      expect(r.steps.length).toBe(spec.steps.length);
      let product = 1;
      for (const s of r.steps) {
        expect(s.prob).toBeGreaterThanOrEqual(0);
        expect(s.prob).toBeLessThanOrEqual(1);
        product *= s.prob;
      }
      expect(r.total).toBeCloseTo(product, 15);
      expect(r.total).toBeGreaterThan(0); // every spec is a legal, achievable plan
    });
  }
});
