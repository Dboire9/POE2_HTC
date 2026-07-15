import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { optimizeFromItem } from './optimize.ts';
import type { Prices } from './cost.ts';

// Synthetic base: prefixes NP1(w20,Fp1) NP2(w30,Fp2); suffix NS1(w50,Fs1). Prefix total 50, suffix 50.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod =>
  ({ id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id,
     tiers: [{ name: 't1', ilvl: 1, weight, ranges: [], stats: [] }] });
const base: ItemBase = {
  id: 'S', name: 'S', category: 'C',
  pools: { normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['NP1', mk('NP1', 'prefix', 'Fp1', 20)], ['NP2', mk('NP2', 'prefix', 'Fp2', 30)], ['NS1', mk('NS1', 'suffix', 'Fs1', 50)],
  ]),
  bases: new Map([['S', base]]),
};
const prices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 0.2 }, omens: {} };
const placed = (id: string): { modId: string; tierName: string } => ({ modId: id, tierName: 't1' });
const rareItem = (pre: string[], suf: string[]): ItemState =>
  ({ base, level: 100, rarity: 'rare', prefixes: pre.map(placed), suffixes: suf.map(placed) });

describe('optimizeFromItem — transform an existing rare (hand-computed)', () => {
  it('keeps a wanted mod, removes junk, adds the missing one — and finds the surest route', () => {
    // Start [NP1 | NS1]; target {NP1, NP2}. Keep NP1, NS1 is junk, NP2 is missing.
    const r = optimizeFromItem(data, prices, rareItem(['NP1'], ['NS1']), [{ modId: 'NP1' }, { modId: 'NP2' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    // Surest route (omens free in this sheet): annul NS1 FIRST off the 2-mod item (½), then a prefix-
    // constrained (Sinistral) exalt makes NP2 the only rollable prefix (P=1). Total = ½. This beats
    // exalt-first-then-annul (NP2 guaranteed, but the later annul is 1/3) = ⅓.
    const surest = Math.max(...r.frontier.map((p) => p.probability));
    expect(surest).toBeCloseTo(1 / 2, 6);
    // The frontier explores both a Chaos swap and the annul+exalt route.
    const hasChaos = r.frontier.some((p) => p.steps.some((s) => s.currency === 'chaos'));
    const hasExaltAnnul = r.frontier.some((p) =>
      p.steps.some((s) => s.currency === 'exalt') && p.steps.some((s) => s.currency === 'annul'));
    expect(hasChaos || hasExaltAnnul).toBe(true);
    // Valid Pareto set: probability rises as cost rises.
    for (let k = 1; k < r.frontier.length; k++) {
      expect(r.frontier[k]!.cost.expected).toBeGreaterThanOrEqual(r.frontier[k - 1]!.cost.expected - 1e-9);
      expect(r.frontier[k]!.probability).toBeGreaterThan(r.frontier[k - 1]!.probability);
    }
  });

  it('an item that already IS the target needs no steps (P=1, cost 0)', () => {
    const r = optimizeFromItem(data, prices, rareItem(['NP1'], ['NS1']), [{ modId: 'NP1' }, { modId: 'NS1' }]);
    expect(r.frontier.length).toBe(1);
    expect(r.frontier[0]!.steps.length).toBe(0);
    expect(r.frontier[0]!.probability).toBe(1);
    expect(r.frontier[0]!.cost.expected).toBe(0);
  });

  it('rejects a Magic starting item (v1 is Rare-only)', () => {
    const magic: ItemState = { base, level: 100, rarity: 'magic', prefixes: [placed('NP1')], suffixes: [] };
    expect(() => optimizeFromItem(data, prices, magic, [{ modId: 'NP1' }, { modId: 'NP2' }])).toThrow(/Rare/i);
  });
});

describe('optimizeFromItem — perfect essences (hand-computed)', () => {
  // Base S: normal prefix NP1 + suffix NS1, and a PERFECT-ESSENCE prefix PE1 (in the essence pool).
  const pmk = (id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source']): Mod =>
    ({ id, group: id, field: id, source, type, categories: [], family, tags: [], text: id,
       tiers: [{ name: 't1', ilvl: 1, weight: source === 'perfect_essence' ? 0 : 20, ranges: [], stats: [] }] });
  const pbase: ItemBase = {
    id: 'S', name: 'S', category: 'C',
    pools: { normal: { prefixes: ['NP1'], suffixes: ['NS1'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: ['PE1'], suffixes: [] } },
  };
  const pdata: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', pmk('NP1', 'prefix', 'Fp1', 'normal')], ['NS1', pmk('NS1', 'suffix', 'Fs1', 'normal')],
      ['PE1', pmk('PE1', 'prefix', 'Fpe', 'perfect_essence')],
    ]),
    bases: new Map([['S', pbase]]),
  };
  const pprices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 0.2, perfect_essence: 15 }, omens: {} };
  const rare = (pre: string[], suf: string[]): ItemState =>
    ({ base: pbase, level: 100, rarity: 'rare', prefixes: pre.map(placed), suffixes: suf.map(placed) });

  it('adds a perfect-essence mod by sacrificing junk, using a Crystallisation omen to make the removal certain', () => {
    // Start [NP1 | NS1]; target {NS1, PE1}: NP1 is junk (the only prefix), PE1 (perfect prefix) is missing.
    const r = optimizeFromItem(pdata, pprices, rare(['NP1'], ['NS1']), [{ modId: 'NS1' }, { modId: 'PE1' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const best = r.frontier[r.frontier.length - 1]!; // surest
    // A raw Perfect Essence removes one of the 2 mods uniformly (½ it hits NP1). A Sinistral (prefix)
    // Crystallisation constrains the removal to the prefix side — NP1 is the only prefix → removed for
    // certain (P=1). With free omens here, that variant dominates and is the surest plan.
    expect(best.probability).toBeCloseTo(1, 6);
    const step = best.steps.find((s) => s.currency === 'perfect-essence')!;
    expect(step).toMatchObject({ currency: 'perfect-essence', add: 'PE1', remove: 'NP1', omen: 'sinistral' });
  });

  it('rejects a perfect target with no junk mod to sacrifice', () => {
    // [NP1 | NS1] already holds both wanted rolled mods, so there is no spare mod to feed the essence.
    expect(() => optimizeFromItem(pdata, pprices, rare(['NP1'], ['NS1']),
      [{ modId: 'NP1' }, { modId: 'NS1' }, { modId: 'PE1' }])).toThrow(/Perfect Essence/i);
  });
});

describe('optimizeFromItem — real data (Wands)', () => {
  const real = loadPatch('data/patches/0.5');
  const wands = real.bases.get('Wands')!;
  const rprices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 0.2 }, omens: {} };

  it('finishes a partly-rolled rare by exalting the missing mod into an open slot', () => {
    // Rare wand with Mana (prefix) + Intelligence (suffix); add Increased Spell Damage (prefix) — a slot is open.
    const start: ItemState = {
      base: wands, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'Wands/MAXIMUM_MANA', tierName: real.mods.get('Wands/MAXIMUM_MANA')!.tiers[0]!.name }],
      suffixes: [{ modId: 'Wands/INTELLIGENCE', tierName: real.mods.get('Wands/INTELLIGENCE')!.tiers[0]!.name }],
    };
    const r = optimizeFromItem(real, rprices, start, [
      { modId: 'Wands/MAXIMUM_MANA' }, { modId: 'Wands/INTELLIGENCE' }, { modId: 'Wands/INCREASED_SPELL_DAMAGE' },
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const best = r.frontier[r.frontier.length - 1]!;
    expect(best.probability).toBeGreaterThan(0);
    // No junk to remove ⇒ the plan is a single exalt of the missing mod.
    expect(best.steps.some((s) => s.currency === 'exalt')).toBe(true);
    expect(best.steps.every((s) => s.currency !== 'annul' && s.currency !== 'chaos')).toBe(true);
  });
});
