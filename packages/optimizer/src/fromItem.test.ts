import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { optimizeFromItem } from './fromItem.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';

// Synthetic base: prefixes NP1(w20,Fp1) NP2(w30,Fp2); suffix NS1(w50,Fs1). Prefix total 50, suffix 50.
const mk = (id: string, type: 'prefix' | 'suffix', family: string, weight: number): Mod =>
  ({ id, group: id, field: id, source: 'normal', type, categories: [], family, tags: [], text: id,
     tiers: [{ name: 't1', ilvl: 1, weight, ranges: [], stats: [] }] });
const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
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

  // This used to assert the opposite — that a Magic start was rejected outright. See the Regal-opener
  // describe below for why that restriction was wrong to have.
  it('accepts a Magic starting item', () => {
    const magic: ItemState = { base, level: 100, rarity: 'magic', prefixes: [placed('NP1')], suffixes: [] };
    const r = optimizeFromItem(data, prices, magic, [{ modId: 'NP1' }, { modId: 'NP2' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
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
    id: 'S', name: 'S', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
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
        id: 'S', name: 'S', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
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
    // A bone OFFERS three draws and you keep one, so a per-draw ½ becomes 1 − (½)³ = ⅞:
    //   wide   — desecrate 0.5 + boss 1     = 3.0/attempt at P=⅞ ⇒ E = 3.0/(⅞) = 24/7 ≈ 3.43
    //   locked — the same plus Necromancy 5 = 8.0/attempt at P=1 ⇒ E = 8   (every offer is DP1)
    // so the wide draw is cheaper but not certain, the lock is certain but dearer: both non-dominated.
    // Under a single draw the wide leg read P=½ / E=6; the offer is what moves it.
    const dear: Prices = { ...prices, omens: { OmenoftheBlackblooded: 1, OmenofSinistralNecromancy: 5 } };
    const r = optimizeFromItem(bothSides, dear, start, [{ modId: 'DP1' }]);
    const pick = (side: 'prefix' | undefined) => r.frontier.find((p) =>
      p.steps.some((s) => s.currency === 'desecrate' && s.constrainTo === side));
    const wide = pick(undefined);
    const locked = pick('prefix');
    expect(wide, 'the unconstrained draw is on the frontier').toBeDefined();
    expect(locked, 'the Necromancy-locked draw is on the frontier').toBeDefined();
    expect(wide!.probability).toBeCloseTo(7 / 8, 9);
    expect(wide!.cost.expected).toBeCloseTo(24 / 7, 9);
    expect(locked!.probability).toBeCloseTo(1, 9);
    expect(locked!.cost.expected).toBeCloseTo(8, 9);
    // 8 = 1.5 annul + (0.5 desecrate + 1 boss + 5 Necromancy) — the boss omen is charged ON TOP of
    // the side omen, which the old single-omen pricing could not express.
    expect(locked!.cost.perAttempt).toBeCloseTo(8, 9);
  });

  it('takes the side-lock outright when the omen is cheap enough to dominate', () => {
    // Same shapes, Necromancy at 0.4 instead of 5: locked E = 3.4 beats wide E = 24/7 ≈ 3.43 AND is
    // surer, so the wide draw is strictly dominated and the frontier collapses to the certain plan.
    //
    // The omen was 2 while a bone was a single draw, because the wide leg then cost 6 and 2 sat well
    // inside it. The offer of three cut the wide leg to 3.43 on its own — at 2 the lock no longer
    // dominates anything — so the price comes down to keep this testing what it was written for:
    // that a dominated plan leaves the frontier, not that this particular omen always wins.
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
      omens: { OmenoftheBlackblooded: 1, OmenofSinistralNecromancy: 0.4 },
    };
    const r = optimizeFromItem(bothSides, cheap, start, [{ modId: 'DP1' }]);
    expect(r.frontier).toHaveLength(1);
    expect(r.frontier[0]!.probability).toBeCloseTo(1, 9);
    expect(r.frontier[0]!.cost.expected).toBeCloseTo(3.4, 9);
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
    id: 'S', name: 'S', category: 'Wands', // a real Weapon category: boss omens are "Weapon or Jewellery" only (bossOmenAllowed)
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

// This planner used to read nothing from `opts` but `policy`. The player's Search-effort setting was
// passed in, obeyed by every other planner, and silently discarded here — so the one control offered
// for "how long am I willing to wait" did not bind on the slowest half of a from-item compute.
//
// It also reported `currencyDepth: 'base-only'`, and that was the honest thing to say for as long as
// `baseTransforms` set no `tier` on any add. The lever DP made it false — every step is now offered
// every strength the sheet prices and the player owns — and the field is gone entirely, because with
// nothing left to report it was a badge that could only say one thing. The assertion below is on the
// PLANS, which is what it should always have been pinned to.
describe('optimizeFromItem — limits and what it admits to', () => {
  const start = rareItem(['NP1'], []); // one junk prefix to clear, one target to add
  const targets = [{ modId: 'NP2' }];

  it('tries every orb strength, and no longer has to admit otherwise', () => {
    const r = optimizeFromItem(data, prices, start, targets);
    // On THIS fixture the search still resolves to base-strength plans, and for two honest reasons: its
    // mods have a single tier at ilvl 1, below every strength floor, and its sheet lists no `_greater`
    // key to buy. Both are exactly the cases `leverOptions` is required to skip rather than fake, so
    // this doubles as a check that a thin sheet cannot mint a free Perfect orb.
    for (const p of r.frontier) {
      for (const s of p.steps) expect('tier' in s ? s.tier : undefined).toBeUndefined();
    }
  });

  it('runs to completion, and admits nothing was cut, when given no clock', () => {
    const r = optimizeFromItem(data, prices, start, targets);
    expect(r.truncated).toBeUndefined();
    expect(r.plansEvaluated).toBeGreaterThan(0);
  });

  it('stops on the wall clock and says it stopped', () => {
    // A zero budget is already spent, so this is deterministic rather than a race — see the `>=` note
    // in the deadline check. A real preset never passes anything near zero.
    const r = optimizeFromItem(data, prices, start, targets, { maxMillis: 0 });
    expect(r.truncated).toBe(true);
  });

  it('reports progress, so the bar is not frozen for the planner’s whole run', () => {
    const seen: [number, number][] = [];
    optimizeFromItem(data, prices, start, targets, { onProgress: (d, t) => seen.push([d, t]) });
    expect(seen.length).toBeGreaterThan(0);
    // Ends at 100%: a bar that stops at 97% reads as a hang just like one that never moves.
    expect(seen[seen.length - 1]![0]).toBe(seen[seen.length - 1]![1]);
  });
});

// A MAGIC item was rejected outright: "the from-item planner currently supports Rare items (use the
// currency check for Magic)". But Rarity describes the item you HOLD, not the item you want — a magic
// base part-way through a craft is the commonest starting point in the game, and it had no planner at
// all. The advice was worse than the gap: it invited you to misdescribe your item to get past it.
//
// The engine could always score this (`regalProbability`, and plan.ts transitions magic→rare on a
// regal step); only plan GENERATION was missing.
describe('optimizeFromItem — a Magic item opens with a Regal', () => {
  const magic = (pre: string[], suf: string[]): ItemState =>
    ({ base, level: 100, rarity: 'magic', prefixes: pre.map(placed), suffixes: suf.map(placed) });

  it('plans a Magic item instead of refusing it', () => {
    // One junk prefix, one junk suffix — a Magic item is full at 1 per side, so the only way forward
    // is a Regal, which converts to Rare and adds a mod.
    const r = optimizeFromItem(data, prices, magic(['NP1'], ['NS1']), [{ modId: 'NP2' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
  });

  it('opens with the Regal, because nothing else can reach a Rare', () => {
    const r = optimizeFromItem(data, prices, magic(['NP1'], ['NS1']), [{ modId: 'NP2' }]);
    for (const p of r.frontier) expect(p.steps[0]!.currency).toBe('regal');
  });

  it('does not spend a Regal on a craft that only has to REMOVE something', () => {
    // Junk prefix, target already present as the suffix: an Annulment finishes it, and an Annulment
    // does not care about rarity. The no-opener sequence has to stay on offer or this craft would be
    // charged a Regal it never needs.
    const r = optimizeFromItem(data, prices, magic(['NP1'], ['NS1']), [{ modId: 'NS1' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    expect(r.frontier.some((p) => p.steps.every((s) => s.currency !== 'regal'))).toBe(true);
  });

  /**
   * A GAME RULE, and it used to be recorded here as a planner gap.
   *
   * This case wants NP1 and NP2 — both prefixes — and a Magic item holds at most one per side. So no
   * Augmentation can finish it whatever the planner offers: the item genuinely has to become Rare
   * first, and the Regal is the orb that does it. The assertion is unchanged; what was wrong was the
   * comment above it, which read "there is no augment step … for a 2-mod target an Augment would be
   * cheaper, and the planner cannot express it" and cited TODO 4.
   *
   * Both halves were off. The planner really was missing the step (fixed 2026-09-01) — but not on
   * THIS craft, where the rule forbids it anyway; and on the live sheet an Augmentation is DEARER than
   * a Regal (0.2699 against 0.1977), so "cheaper" was the wrong reason to want it. What it actually
   * buys is a smaller pool to draw from, which the case below pins.
   *
   * CLAUDE.md's standing rule cuts both ways: do not call a game rule a planner limit, and do not call
   * a planner limit a game rule. This was the first kind.
   */
  it('needs a Regal for a second PREFIX, because a Magic item holds only one', () => {
    const r = optimizeFromItem(data, prices, magic(['NP1'], []), [{ modId: 'NP1' }, { modId: 'NP2' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const p of r.frontier) expect(p.steps.some((s) => s.currency === 'regal')).toBe(true);
  });

  /**
   * …and where the rule allows it, the Augmentation is now on offer.
   *
   * One held prefix, target = that prefix plus a SUFFIX. The suffix side is free, so an Augmentation
   * finishes the craft on a Magic item and no Regal is needed at all. It is a genuine
   * cost-probability trade rather than a strictly better move: the Augmentation draws from the suffix
   * pool alone where a Regal draws from both sides, so it is likelier to land NS1 — and it costs more
   * for it.
   */
  it('finishes a prefix+suffix target with an Augmentation, no Regal', () => {
    const r = optimizeFromItem(data, prices, magic(['NP1'], []), [{ modId: 'NP1' }, { modId: 'NS1' }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const augmented = r.frontier.filter((p) => p.steps.some((st) => st.currency === 'augment'));
    expect(augmented.length).toBeGreaterThan(0);
    // The Augmentation route needs nothing else — one step, and the item stays Magic.
    expect(augmented.some((p) => p.steps.length === 1)).toBe(true);
    // And it really is the surer of the two, which is why it belongs on the frontier beside the Regal.
    const regalOnly = r.frontier.filter((p) => p.steps.some((st) => st.currency === 'regal'));
    if (regalOnly.length > 0) {
      expect(Math.max(...augmented.map((p) => p.probability)))
        .toBeGreaterThan(Math.max(...regalOnly.map((p) => p.probability)));
    }
  });

  it('scores every returned plan above zero — none is an illegal Magic-item exalt', () => {
    // The generator offers sequences it does not check for legality and relies on `evaluatePlanFrom`
    // scoring the illegal ones 0 so they drop. If that ever stopped holding, the frontier would fill
    // with plans that exalt a Magic item — which the game refuses.
    const r = optimizeFromItem(data, prices, magic(['NP1'], ['NS1']), [{ modId: 'NP2' }]);
    for (const p of r.frontier) expect(p.probability).toBeGreaterThan(0);
  });

  it('still refuses a white base, which is the Lab’s job', () => {
    const white: ItemState = { base, level: 100, rarity: 'normal', prefixes: [], suffixes: [] };
    expect(() => optimizeFromItem(data, prices, white, [{ modId: 'NP2' }])).toThrow(/white base/i);
  });
});

/**
 * THE AXIS, END TO END, ON THE SHIPPED SHEET.
 *
 * The synthetic fixture above cannot show this: single-tier mods at ilvl 1 put every strength floor out
 * of reach, and its price sheet lists no `_greater` key to buy. So the claim that this planner now
 * varies orb strength has to be made against the data the app actually runs on, or it is a claim about
 * a type-level claim and nothing else.
 *
 * Worth 1,116x on the craft that prompted this (success per attempt 1.53e-10% at base strength against
 * 1.71e-7% at Perfect), measured 2026-08-23 while the axis was still missing.
 */
describe('optimizeFromItem — orb strength on real 0.5.0 data', () => {
  const real = loadPatch('data/patches/0.5.0');
  const rp = loadPrices('data/patches/0.5.0');
  const wand = real.bases.get('Wands')!;
  const tierName = (id: string): string => real.mods.get(id)!.tiers[0]!.name;
  const P = wand.pools.normal.prefixes;
  const S = wand.pools.normal.suffixes;
  const start: ItemState = {
    base: wand, level: 82, rarity: 'rare',
    prefixes: [{ modId: P[0]!, tierName: tierName(P[0]!) }], suffixes: [],
  };
  /** A high tier, so the target is one an orb's ilvl floor can help reach. */
  const hi = (id: string): { modId: string; minTierIndex: number } =>
    ({ modId: id, minTierIndex: real.mods.get(id)!.tiers.length - 2 });

  it('buys a Greater or Perfect orb when it is worth it', () => {
    const r = optimizeFromItem(real, rp, start, [hi(P[1]!), hi(S[0]!)]);
    const strengths = new Set(r.frontier.flatMap((p) => p.steps.map((s) => ('tier' in s ? s.tier : undefined) ?? 'base')));
    expect(strengths.size).toBeGreaterThan(1);
  });

  /**
   * And it is a TRADE, not a free upgrade — which is what makes it belong on a Pareto frontier at all.
   * The surer plans cost more per attempt; if a stronger orb were strictly better the frontier would
   * collapse to one row.
   */
  it('puts the stronger orbs at the surer, dearer end of the frontier', () => {
    const r = optimizeFromItem(real, rp, start, [hi(P[1]!), hi(S[0]!)]);
    expect(r.frontier.length).toBeGreaterThan(1);
    for (let k = 1; k < r.frontier.length; k++) {
      expect(r.frontier[k]!.probability).toBeGreaterThan(r.frontier[k - 1]!.probability);
      expect(r.frontier[k]!.cost.perAttempt).toBeGreaterThan(r.frontier[k - 1]!.cost.perAttempt - 1e-9);
    }
  });

  /**
   * The exclusion promise, on the axis that has just been added. `allowsStep` reads the same
   * `currencyKey` that prices the orb, so this also pins the `chaos_greater` half of that key — the
   * one that was missing until this work began.
   */
  it('never buys a strength the player says they do not have', () => {
    const excluded = new Set(['exalt_greater', 'exalt_perfect', 'chaos_greater', 'chaos_perfect',
      'regal_greater', 'regal_perfect']);
    const r = optimizeFromItem(real, rp, start, [hi(P[1]!), hi(S[0]!)], { policy: { excluded } });
    expect(r.frontier.length).toBeGreaterThan(0);
    for (const p of r.frontier) {
      for (const s of p.steps) expect('tier' in s ? s.tier : undefined).toBeUndefined();
    }
  });
});
