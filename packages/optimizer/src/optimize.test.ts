import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/index.ts';
import type { PatchData } from '../../engine/src/index.ts';
import { optimizeAddChain, optimizePlan, currencyAtPosition } from './optimize.ts';
import { simulatePerStepRates } from './simulate.ts';

const data: PatchData = loadPatch('data/patches/0.5');
const wands = data.bases.get('Wands')!;

// Wands normal mods used below (types from data/patches/0.5): prefixes MAXIMUM_MANA,
// INCREASED_SPELL_DAMAGE, DAMAGE_AS_EXTRA_FIRE_DAMAGE; suffixes INTELLIGENCE, MANA_REGENERATION_RATE.
const P1 = 'Wands/MAXIMUM_MANA';
const P2 = 'Wands/INCREASED_SPELL_DAMAGE';
const P3 = 'Wands/DAMAGE_AS_EXTRA_FIRE_DAMAGE';
const S1 = 'Wands/INTELLIGENCE';

describe('optimizeAddChain — exactness', () => {
  it('assigns currencies by position (transmute→augment→regal→exalt)', () => {
    expect([0, 1, 2, 3, 4].map(currencyAtPosition)).toEqual(['transmute', 'augment', 'regal', 'exalt', 'exalt']);
  });

  it('returns every ordering, sorted best-first, and plans[0] is the true maximum', () => {
    const plans = optimizeAddChain(data, wands, [P1, P2, S1]);
    expect(plans.length).toBe(6); // 3! orderings
    for (let k = 1; k < plans.length; k++) {
      expect(plans[k - 1]!.result.total).toBeGreaterThanOrEqual(plans[k]!.result.total);
    }
    const maxTotal = Math.max(...plans.map((p) => p.result.total));
    expect(plans[0]!.result.total).toBe(maxTotal);
  });

  it('order matters even for a both-open target because family exclusion shrinks the pool (D6)', () => {
    // 2 prefixes + 1 suffix never fills a side, but each placed mod removes its family from the
    // denominator of later steps — like drawing without replacement — so the per-ordering totals
    // differ and the optimizer has a real choice (unlike the no-exclusion model, where they'd tie).
    const totals = optimizeAddChain(data, wands, [P1, P2, S1]).map((p) => p.result.total);
    const spread = Math.max(...totals) - Math.min(...totals);
    expect(spread).toBeGreaterThan(0); // ordering is not a wash under family exclusion
  });

  it('magic 1+1 forces the lone suffix early: it must be among the first two mods (D2)', () => {
    // 3 prefixes + 1 suffix: the transmute + augment (both on a Magic item) must be 1 prefix + 1
    // suffix, so the suffix has to be placed in position 0 or 1 — any plan that delays it is illegal
    // (augment can't add a 2nd prefix). The best plan is a legal one, so its suffix is early.
    const best = optimizeAddChain(data, wands, [P1, P2, P3, S1])[0]!;
    expect(best.result.total).toBeGreaterThan(0); // a legal ordering exists and wins
    const suffixPos = best.steps.findIndex((s) => 'add' in s && s.add === S1);
    expect(suffixPos).toBeLessThanOrEqual(1); // suffix is in the first two steps
  });

  it('topN limits the result set', () => {
    expect(optimizeAddChain(data, wands, [P1, P2, P3, S1], { topN: 3 }).length).toBe(3);
  });
});

describe('optimizeAddChain — target validation', () => {
  it('rejects >3 prefixes', () => {
    // 4 wand prefixes → impossible target
    const P4 = 'Wands/INCREASED_PHYSICAL_SPELL_DAMAGE';
    expect(() => optimizeAddChain(data, wands, [P1, P2, P3, P4])).toThrow(/prefixes|not in/);
  });
  it('rejects a mod not in the base pool', () => {
    expect(() => optimizeAddChain(data, wands, ['Wands/NOPE'])).toThrow();
  });
  it('rejects an empty target', () => {
    expect(() => optimizeAddChain(data, wands, [])).toThrow(/no desired/);
  });
});

describe('optimizePlan — essence-guaranteed mods', () => {
  it('with no essences, optimizePlan equals optimizeAddChain', () => {
    const a = optimizePlan(data, wands, [P1, P2, S1]).map((p) => p.result.total);
    const b = optimizeAddChain(data, wands, [P1, P2, S1]).map((p) => p.result.total);
    expect(a).toEqual(b);
  });

  it('a guaranteed mod becomes a P=1 essence step; the rest are rolled', () => {
    const best = optimizePlan(data, wands, [P1, P2, S1], { essences: [S1] })[0]!;
    const essenceStep = best.steps.find((s) => s.currency === 'essence');
    expect(essenceStep).toMatchObject({ add: S1 });
    const essenceResult = best.result.steps.find((s) => s.currency === 'essence')!;
    expect(essenceResult.prob).toBe(1);
    // essence contributes ×1, so the total is just the product of the two rolled-prefix probabilities
    const rolls = best.result.steps.filter((s) => s.currency !== 'essence').map((s) => s.prob);
    expect(best.result.total).toBeCloseTo(rolls[0]! * rolls[1]!, 15);
  });

  it('guaranteeing a mod raises the achievable cumulative probability vs rolling it', () => {
    const rolled = optimizePlan(data, wands, [P1, P2, S1])[0]!.result.total;
    const guaranteed = optimizePlan(data, wands, [P1, P2, S1], { essences: [S1] })[0]!.result.total;
    expect(guaranteed).toBeGreaterThan(rolled);
  });

  it('rejects more than one essence (only one Magic→Rare transition to spend)', () => {
    expect(() => optimizePlan(data, wands, [P1, P2, S1], { essences: [P1, S1] })).toThrow(/at most one/);
  });

  it('rejects an all-essence target (needs a rolled mod to reach Magic first)', () => {
    expect(() => optimizePlan(data, wands, [P1], { essences: [P1] })).toThrow(/at least one rolled/);
  });
});

describe('optimizer self-check — analytic per-step probs match Monte-Carlo', () => {
  it('best plan: each analytic per-step prob matches a 200k-run simulation', () => {
    const best = optimizeAddChain(data, wands, [P1, P2, P3, S1])[0]!;
    const analytic = best.result.steps.map((s) => s.prob);
    const empirical = simulatePerStepRates(data, wands, best.steps, 200_000, 12345);
    expect(empirical.length).toBe(analytic.length);
    analytic.forEach((p, k) => { expect(empirical[k]!).toBeCloseTo(p, 2); }); // ~0.005 tolerance at 200k
  });

  it('holds at a sub-100 item level too, where the item-level cap excludes high-ilvl tiers (D5)', () => {
    // At level 55 many T1 tiers (ilvl 65–82) drop out; the analytic and the real-mechanic MC must both
    // exclude them and still agree — the end-to-end proof that the cap threads correctly on real data.
    const best = optimizeAddChain(data, wands, [P1, P2, P3, S1], { level: 55 })[0]!;
    const analytic = best.result.steps.map((s) => s.prob);
    const empirical = simulatePerStepRates(data, wands, best.steps, 200_000, 999, 55);
    analytic.forEach((p, k) => { expect(empirical[k]!).toBeCloseTo(p, 2); });
  });
});
