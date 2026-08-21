import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { optimizeFromItem } from './fromItem.ts';
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

describe('optimizeFromItem — fractured mods are locked (never removed)', () => {
  it('keeps a fractured mod and never annuls/chaoses it away', () => {
    // Rare [NP1 (fractured) | NS1]; target {NS1, NP2}. NP1 isn't in the target but is fractured, so it
    // can't be junk — it stays, and the craft just adds the missing NP2.
    const start: ItemState = {
      base, level: 100, rarity: 'rare',
      prefixes: [{ modId: 'NP1', tierName: 't1', fractured: true }],
      suffixes: [{ modId: 'NS1', tierName: 't1' }],
    };
    const r = optimizeFromItem(data, prices, start, [{ modId: 'NS1' }, { modId: 'NP2' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const removesNP1 = r.frontier.some((p) => p.steps.some((s) =>
      (s.currency === 'annul' || s.currency === 'chaos') && 'remove' in s && s.remove === 'NP1'));
    expect(removesNP1).toBe(false);
    // NP1's family is on the item, so NP2 is the only addable prefix ⇒ a single exalt, P=1.
    const best = r.frontier[r.frontier.length - 1]!;
    expect(best.steps.some((s) => s.currency === 'exalt' && 'add' in s && s.add === 'NP2')).toBe(true);
    expect(best.probability).toBeCloseTo(1, 6);
  });
});

describe('optimizeFromItem — desecrated mods (kept and crafted, hand-computed)', () => {
  // Base with a normal prefix NP1, normal suffix NS1, and a desecrated suffix DS1 in the KURGAL pool
  // (boss omen = Blackblooded) — the only kurgal desecrated suffix, so targeting it is 1/1.
  const dmk = (id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source'], tags: string[] = []): Mod =>
    ({ id, group: id, field: id, source, type, categories: [], family, tags,
       text: id, tiers: [{ name: 't1', ilvl: 1, weight: source === 'desecrated' ? 1 : 20, ranges: [], stats: [] }] });
  const dbase: ItemBase = {
    id: 'S', name: 'S', category: 'C',
    pools: { normal: { prefixes: ['NP1'], suffixes: ['NS1'] }, desecrated: { prefixes: [], suffixes: ['DS1'] }, essence: { prefixes: [], suffixes: [] } },
  };
  const ddata: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', dmk('NP1', 'prefix', 'Fp1', 'normal')], ['NS1', dmk('NS1', 'suffix', 'Fs1', 'normal')],
      ['DS1', dmk('DS1', 'suffix', 'Fds', 'desecrated', ['kurgal_mod'])],
    ]),
    bases: new Map([['S', dbase]]),
  };
  const dprices: Prices = { currency: { exalt: 1, annul: 1.5, chaos: 0.2, desecrate: 0.5 }, omens: {} };

  it('keeps a desecrated mod that is already on the item (no step touches it)', () => {
    // Item [NP1 | DS1]; target {NP1, DS1}: already exactly the target → a single empty plan.
    const start: ItemState = {
      base: dbase, level: 100, rarity: 'rare', desecrated: true,
      prefixes: [{ modId: 'NP1', tierName: 't1' }], suffixes: [{ modId: 'DS1', tierName: 't1' }],
    };
    const r = optimizeFromItem(ddata, dprices, start, [{ modId: 'NP1' }, { modId: 'DS1' }]);
    expect(r.frontier).toHaveLength(1);
    expect(r.frontier[0]!.steps).toHaveLength(0);
    expect(r.frontier[0]!.probability).toBe(1);
  });

  it('crafts an absent desecrated mod via Desecration + its boss omen (P = ½ · 1)', () => {
    // Item [NP1 | NS1]; target {NP1, DS1}: NS1 (suffix) is junk, DS1 (desecrated suffix) is missing.
    // Surest route: annul NS1 first (½ on the 2-mod item), then Desecration + Blackblooded → DS1 is the
    // only kurgal suffix, so 1/1 = 1. Total ½. (Desecrate-first would leave a 1/3 annul that can hit DS1.)
    const start: ItemState = { base: dbase, level: 100, rarity: 'rare', prefixes: [placed('NP1')], suffixes: [placed('NS1')] };
    const r = optimizeFromItem(ddata, dprices, start, [{ modId: 'NP1' }, { modId: 'DS1' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const surest = r.frontier[r.frontier.length - 1]!;
    expect(surest.probability).toBeCloseTo(1 / 2, 6);
    const des = surest.steps.find((s) => s.currency === 'desecrate');
    expect(des, 'the plan uses a Desecration step').toBeDefined();
    expect(des).toMatchObject({ currency: 'desecrate', add: 'DS1', boss: 'blackblooded' });
  });

  it('rejects a target with two desecrated mods (an item holds at most one)', () => {
    // Base with two desecrated suffixes; asking for both is illegal.
    const twoDes: PatchData = {
      patch: 't',
      mods: new Map([
        ['NP1', dmk('NP1', 'prefix', 'Fp1', 'normal')],
        ['DS1', dmk('DS1', 'suffix', 'Fd1', 'desecrated', ['kurgal_mod'])],
        ['DS2', dmk('DS2', 'suffix', 'Fd2', 'desecrated', ['amanamu_mod'])],
      ]),
      bases: new Map([['S', {
        id: 'S', name: 'S', category: 'C',
        pools: { normal: { prefixes: ['NP1'], suffixes: [] }, desecrated: { prefixes: [], suffixes: ['DS1', 'DS2'] }, essence: { prefixes: [], suffixes: [] } },
      }]]),
    };
    const base2 = twoDes.bases.get('S')!;
    const start: ItemState = { base: base2, level: 100, rarity: 'rare', prefixes: [placed('NP1')], suffixes: [] };
    expect(() => optimizeFromItem(twoDes, dprices, start, [{ modId: 'DS1' }, { modId: 'DS2' }]))
      .toThrow(/at most one desecrated mod/i);
  });

  it('rejects a desecrated target with no boss omen to select it', () => {
    // A desecrated mod with no boss tag can't be targeted (nothing picks it out of the pool).
    const noBoss: PatchData = {
      patch: 't',
      mods: new Map([
        ['NP1', dmk('NP1', 'prefix', 'Fp1', 'normal')], ['NS1', dmk('NS1', 'suffix', 'Fs1', 'normal')],
        ['DS1', dmk('DS1', 'suffix', 'Fds', 'desecrated')], // no boss tag
      ]),
      bases: new Map([['S', dbase]]),
    };
    const start: ItemState = { base: dbase, level: 100, rarity: 'rare', prefixes: [placed('NP1')], suffixes: [placed('NS1')] };
    expect(() => optimizeFromItem(noBoss, dprices, start, [{ modId: 'NP1' }, { modId: 'DS1' }]))
      .toThrow(/no boss omen/i);
  });

  it('offers both the wide boss draw and the Necromancy-locked one, dearer but surer (D8)', () => {
    // Base with the kurgal desecrated mod on BOTH sides (DS1 suffix + DP1 prefix), so the two models
    // differ: unconstrained the Blackblooded draw is 1-of-2 across the sides, while a Sinistral
    // Necromancy omen locks it to the prefix where DP1 is the only candidate ⇒ P=1.
    const bothSides: PatchData = {
      patch: 't',
      mods: new Map([...ddata.mods, ['DP1', dmk('DP1', 'prefix', 'Fdp', 'desecrated', ['kurgal_mod'])]]),
      bases: new Map([['S', {
        ...dbase, pools: { ...dbase.pools, desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] } },
      }]]),
    };
    const b = bothSides.bases.get('S')!;
    // Start [— | NS1] targeting {DP1}: NS1 is junk, DP1 the desecrated prefix to craft.
    const start: ItemState = { base: b, level: 100, rarity: 'rare', prefixes: [], suffixes: [placed('NS1')] };
    const prices: Prices = {
      currency: { exalt: 1, annul: 1.5, chaos: 0.2, desecrate: 0.5 },
      omens: { OmenoftheBlackblooded: 1, OmenofSinistralNecromancy: 2 },
    };
    // The plan is: annul NS1 (the item's only mod ⇒ P=1, cost 1.5), then Desecrate for DP1.
    //   wide   — desecrate 0.5 + boss 1          = 3.0/attempt at P=½ ⇒ E = 3.0/0.5 = 6
    //   locked — the same plus Necromancy 5      = 8.0/attempt at P=1 ⇒ E = 8
    // so the wide draw is cheaper but a coin flip, the lock is certain but dearer: both non-dominated.
    const dear: Prices = { ...prices, omens: { OmenoftheBlackblooded: 1, OmenofSinistralNecromancy: 5 } };
    const r = optimizeFromItem(bothSides, dear, start, [{ modId: 'DP1' }]);
    const pick = (side: 'prefix' | undefined) => r.frontier.find((p) =>
      p.steps.some((s) => s.currency === 'desecrate' && s.constrainTo === side));
    const wide = pick(undefined);
    const locked = pick('prefix');
    expect(wide, 'the unconstrained draw is on the frontier').toBeDefined();
    expect(locked, 'the Necromancy-locked draw is on the frontier').toBeDefined();
    expect(wide!.probability).toBeCloseTo(1 / 2, 9);
    expect(wide!.cost.expected).toBeCloseTo(6, 9);
    expect(locked!.probability).toBeCloseTo(1, 9);
    expect(locked!.cost.expected).toBeCloseTo(8, 9);
    // 8 = 1.5 annul + (0.5 desecrate + 1 boss + 5 Necromancy) — the boss omen is charged ON TOP of
    // the side omen, which the old single-omen pricing could not express.
    expect(locked!.cost.perAttempt).toBeCloseTo(8, 9);
  });

  it('takes the side-lock outright when the omen is cheap enough to dominate', () => {
    // Same shapes, Necromancy at 2 instead of 5: locked E = 5 beats wide E = 6 AND is surer, so the
    // wide draw is strictly dominated and the frontier collapses to the certain plan.
    const bothSides: PatchData = {
      patch: 't',
      mods: new Map([...ddata.mods, ['DP1', dmk('DP1', 'prefix', 'Fdp', 'desecrated', ['kurgal_mod'])]]),
      bases: new Map([['S', {
        ...dbase, pools: { ...dbase.pools, desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] } },
      }]]),
    };
    const b = bothSides.bases.get('S')!;
    const start: ItemState = { base: b, level: 100, rarity: 'rare', prefixes: [], suffixes: [placed('NS1')] };
    const cheap: Prices = {
      currency: { exalt: 1, annul: 1.5, chaos: 0.2, desecrate: 0.5 },
      omens: { OmenoftheBlackblooded: 1, OmenofSinistralNecromancy: 2 },
    };
    const r = optimizeFromItem(bothSides, cheap, start, [{ modId: 'DP1' }]);
    expect(r.frontier).toHaveLength(1);
    expect(r.frontier[0]!.probability).toBeCloseTo(1, 9);
    expect(r.frontier[0]!.cost.expected).toBeCloseTo(5, 9);
    expect(r.frontier[0]!.steps.some((s) => s.currency === 'desecrate' && s.constrainTo === 'prefix')).toBe(true);
  });

  it('removes a desecrated junk mod with certainty via Omen of Light (P=1 vs ½ random)', () => {
    // Item [NP1 | DS1] (desecrated); target {NP1, NS1}: DS1 (desecrated suffix) is the only junk,
    // NS1 the only missing mod. NP1's family is on the item, so it adds 0 weight to any add — the
    // only addable mod is NS1 (P=1 once a suffix slot is free). That leaves four routes:
    //   annul-first, random  → ½ (annul hits DS1 1-of-2) · 1 (exalt NS1)          = ½
    //   annul-first, LIGHT   → 1  (Light removes the desecrated mod) · 1          = 1
    //   exalt-first, random  → 1  (exalt NS1) · ⅓ (annul hits DS1 1-of-3)         = ⅓
    //   chaos                → ½ (removal hits DS1 1-of-2) · 1 (add NS1)          = ½
    // So Omen of Light is the ONLY route to certainty, and ½ is the best without it.
    const start: ItemState = {
      base: dbase, level: 100, rarity: 'rare', desecrated: true,
      prefixes: [placed('NP1')], suffixes: [placed('DS1')],
    };
    const pricesWithLight: Prices = { ...dprices, omens: { OmenofLight: 0.3 } };
    const r = optimizeFromItem(ddata, pricesWithLight, start, [{ modId: 'NP1' }, { modId: 'NS1' }]);

    const usesLight = (p: (typeof r.frontier)[number]): boolean => p.steps.some((s) =>
      s.currency === 'annul' && s.remove === 'DS1' && s.omen === 'light');

    // The surest plan is the Omen of Light one, at P=1 exactly.
    const surest = r.frontier[r.frontier.length - 1]!;
    expect(surest.probability).toBeCloseTo(1, 6);
    expect(usesLight(surest)).toBe(true);
    expect(surest.steps.find((s) => s.currency === 'annul'))
      .toMatchObject({ currency: 'annul', remove: 'DS1', omen: 'light' });

    // Without the omen the ceiling is ½ — so the certainty is bought by Light, not by some other route.
    const bestWithout = Math.max(...r.frontier.filter((p) => !usesLight(p)).map((p) => p.probability));
    expect(bestWithout).toBeCloseTo(1 / 2, 6);

    // Both sit on the frontier: Light costs the 0.3 surcharge, so it's strictly dearer than the
    // ½-probability plan it beats on certainty (that trade-off is the whole point of the lever).
    const cheaperRival = r.frontier.filter((p) => !usesLight(p)).at(-1)!;
    expect(surest.cost.expected).toBeGreaterThan(cheaperRival.cost.expected);
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
