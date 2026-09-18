import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData, PlacedMod, PlanStep } from './index.ts';
import { evaluatePlanFrom, heldThrowaway, itemFamilies, planStates, stepProbability, throwawayProbability } from './index.ts';

// A THROWAWAY is a Regal or an Exalt spent on landing anything on one side, so the Perfect Essence
// right after it has something to eat. It lives exactly one step, and that is what keeps a route's
// odds exact: the only step that ever sees it counts mods, and adds a crafted mod no rolled family
// can block. These pin the three halves of that — the odds of landing one, what it leaves on the
// item, and the rule that nothing but its essence may follow it.
//
// Synthetic base, every number below countable by hand:
//   prefixes  P1 (w30)  P2 (w10)
//   suffixes  S1 (w20)  S2 (w40)  S3 (w30, ilvl 60 — the only tier a Greater orb's floor of 35 admits)
//   essence   PE (perfect prefix)

const mk = (id: string, type: 'prefix' | 'suffix', weight: number, ilvl = 1, source: Mod['source'] = 'normal'): Mod =>
  ({ id, source, type, family: `F${id}`, tags: [], text: id, tiers: [{ name: `${id}-t1`, ilvl, weight, ranges: [] }] });

const base: ItemBase = {
  id: 'B', name: 'B', category: 'Wands',
  pools: {
    normal: { prefixes: ['P1', 'P2'], suffixes: ['S1', 'S2', 'S3'] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: ['PE'], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['P1', mk('P1', 'prefix', 30)], ['P2', mk('P2', 'prefix', 10)],
    ['S1', mk('S1', 'suffix', 20)], ['S2', mk('S2', 'suffix', 40)], ['S3', mk('S3', 'suffix', 30, 60)],
    ['PE', mk('PE', 'prefix', 0, 1, 'perfect_essence')],
  ]),
  bases: new Map([['B', base]]),
};
const on = (id: string): PlacedMod => ({ modId: id, tierName: `${id}-t1` });
const item = (rarity: ItemState['rarity'], pre: string[], suf: string[]): ItemState =>
  ({ base, level: 82, rarity, prefixes: pre.map(on), suffixes: suf.map(on) });

const exaltThrowaway = (side: 'prefix' | 'suffix', extra: Partial<PlanStep> = {}): PlanStep =>
  ({ currency: 'throwaway', orb: 'exalt', throwaway: { id: 'throwaway:0', side }, ...extra } as PlanStep);

describe('the odds of landing a throwaway', () => {
  // Rare [P1 |]: P1's family is taken, so the draw is P2 (10) against S1+S2+S3 (90), both sides open.
  it('is the side’s share of the open pool', () => {
    const rare = item('rare', ['P1'], []);
    expect(throwawayProbability(data, rare, 'exalt', 'suffix')).toBeCloseTo(90 / 100, 15);
    expect(throwawayProbability(data, rare, 'exalt', 'prefix')).toBeCloseTo(10 / 100, 15);
  });

  it('is certain with the side’s own Exaltation omen, and impossible with the other', () => {
    const rare = item('rare', ['P1'], []);
    expect(throwawayProbability(data, rare, 'exalt', 'suffix', { constrainTo: 'suffix' })).toBeCloseTo(1, 15);
    expect(throwawayProbability(data, rare, 'exalt', 'suffix', { constrainTo: 'prefix' })).toBe(0);
  });

  it('is zero on a full side, and certain when that is the only side left', () => {
    const suffixesFull = item('rare', ['P1'], ['S1', 'S2', 'S3']);
    expect(throwawayProbability(data, suffixesFull, 'exalt', 'suffix')).toBe(0);
    expect(throwawayProbability(data, suffixesFull, 'exalt', 'prefix')).toBeCloseTo(1, 15);
  });

  // The Regal turns a full Magic [P1 | S1] Rare as it adds, so the Rare caps apply: P2 (10) against S2+S3 (70).
  it('lets a Regal land one on a full Magic item, and refuses an Exalt there', () => {
    const magic = item('magic', ['P1'], ['S1']);
    expect(throwawayProbability(data, magic, 'regal', 'suffix')).toBeCloseTo(70 / 80, 15);
    expect(throwawayProbability(data, magic, 'exalt', 'suffix')).toBe(0);
  });

  // A Greater Exalt's floor of ilvl 35 leaves S3 as the only eligible mod on either side.
  it('honours the orb’s ilvl floor', () => {
    const rare = item('rare', ['P1'], []);
    expect(throwawayProbability(data, rare, 'exalt', 'suffix', { currencyTier: 'greater' })).toBeCloseTo(1, 15);
    expect(throwawayProbability(data, rare, 'exalt', 'prefix', { currencyTier: 'greater' })).toBe(0);
  });
});

describe('what a throwaway leaves on the item', () => {
  const eat: PlanStep = { currency: 'perfect-essence', add: 'PE', remove: 'throwaway:0', omen: 'dextral' };

  it('places a placeholder under its id, on its side, and a Regal makes the item Rare', () => {
    const [, after] = planStates(data, item('magic', ['P1'], []),
      [{ currency: 'throwaway', orb: 'regal', throwaway: { id: 'throwaway:0', side: 'suffix' } }, eat]);
    expect(after!.rarity).toBe('rare');
    expect(after!.suffixes).toEqual([{ modId: 'throwaway:0', tierName: '', throwaway: true }]);
    expect(heldThrowaway(after!)).toBe('throwaway:0');
  });

  // It names no mod, so it has no family. Resolving its id would throw — the reason for the skip.
  it('contributes no family', () => {
    const [, after] = planStates(data, item('rare', ['P1'], []), [exaltThrowaway('suffix'), eat]);
    expect([...itemFamilies(data, after!)]).toEqual(['FP1']);
  });

  it('is reported under its id', () => {
    const r = evaluatePlanFrom(data, item('rare', ['P1'], []), [exaltThrowaway('suffix'), eat]);
    expect(r.steps[0]!.target).toBe('throwaway:0');
  });

  // The whole route: 0.9 to land it on the suffix side, then a Dextral Crystallisation on a side
  // holding only the throwaway takes it for certain. The essence's prefix lands beside P1.
  it('is eaten by the essence after it, and the item is left exactly as if it never was', () => {
    const start = item('rare', ['P1'], []);
    const r = evaluatePlanFrom(data, start, [exaltThrowaway('suffix'), eat]);
    expect(r.steps.map((s) => s.prob)).toEqual([expect.closeTo(0.9, 15), 1]);
    const [, , end] = planStates(data, start, [exaltThrowaway('suffix'), eat, eat]);
    expect(end!.prefixes.map((p) => p.modId)).toEqual(['P1', 'PE']);
    expect(end!.suffixes).toEqual([]);
    expect(heldThrowaway(end!)).toBeUndefined();
  });
});

describe('a throwaway lives exactly one step', () => {
  // The rule that makes the odds exact rather than approximate. Every step below would be priced
  // against a mod nobody knows, so every one scores 0 — enforced in stepProbability, not left to the
  // planners that build routes.
  const [, holding] = planStates(data, item('rare', ['P1'], []),
    [exaltThrowaway('suffix'), { currency: 'annul', remove: 'P1' }]);

  it.each<[string, PlanStep]>([
    ['an Exalt', { currency: 'exalt', add: 'P2' }],
    ['an Annulment of another mod', { currency: 'annul', remove: 'P1' }],
    ['an Annulment of the throwaway itself', { currency: 'annul', remove: 'throwaway:0' }],
    ['a Chaos Orb', { currency: 'chaos', remove: 'P1', add: 'P2' }],
    ['a second throwaway', exaltThrowaway('prefix')],
    ['a Perfect Essence that eats something else', { currency: 'perfect-essence', add: 'PE', remove: 'P1' }],
  ])('refuses %s while one is on the item', (_name, step) => {
    expect(stepProbability(data, holding!, step)).toBe(0);
  });

  it('allows the Perfect Essence that eats it — at the ordinary count-based odds', () => {
    // No omen: 1 of the 2 mods on the item. Dextral: 1 of the 1 suffix.
    expect(stepProbability(data, holding!, { currency: 'perfect-essence', add: 'PE', remove: 'throwaway:0' })).toBe(1 / 2);
    expect(stepProbability(data, holding!, { currency: 'perfect-essence', add: 'PE', remove: 'throwaway:0', omen: 'dextral' })).toBe(1);
  });
});
