import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch, whiteItem } from '../../engine/src/index.ts';
import { ECHOES_OMEN, pricesForBase, type Prices } from './cost.ts';
import { FOUND_BASE_WEIGHT, FOUND_PRICES } from './foundPrices.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { actionPriceParts } from './markovActions.ts';
import { markovFromItem, type MarkovOptions, type MarkovResult } from './markovFromItem.ts';
import type { TierTarget } from './optimize.ts';
import { markovUses, type MarkovUses } from './markovUses.ts';

// What a solved plan uses, counted exactly from its table. Three kinds of check: the IDENTITY (the counts
// priced back up are the solve's own cost — on the found sheet and the trade sheet, omens and the Echoes
// reroll included), hand-checkable counts on small fixtures, and the REPLAY (markovReplay.ts), which plays
// the plan on real items and counts what it spent — an independent measurement the counts must agree with.

const data = loadPatch('data/patches/0.5.0');
const frozen = loadFrozenPrices();
const staves = data.bases.get('Quarterstaves')!;
const wands = data.bases.get('Wands')!;
const PHYS = 'Quarterstaves/LocalPhysicalDamage';
const SPEED = 'Quarterstaves/LocalIncreasedAttackSpeed';
const HASTE = 'Quarterstaves/Essence_IncreasedAttackSpeed';
/** The hand-computed tests' precision (`EXACT` elsewhere): these pin the arithmetic, not the stopping rule. */
const TIGHT: MarkovOptions = { tolerance: 1e-12 };

const white = (base: ItemBase, level: number): ItemState => ({ base, level, rarity: 'normal', prefixes: [], suffixes: [] });

function solveAndCount(
  prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
): { r: MarkovResult; u: MarkovUses } {
  const r = markovFromItem(data, prices, start, targets, { keepRoutes: true, ...opts });
  expect(r.bound).toBe('exact');
  const u = markovUses(r.routes!, pricesForBase(prices, start.base));
  expect(u).toBeDefined();
  return { r, u: u! };
}
const countOf = (u: MarkovUses, key: string): number => u.uses.find((x) => x.key === key)?.count ?? 0;
/** Σ price × count + restartCost × restarts, from the list itself (not from the field that reports it). */
const priced = (u: MarkovUses): number => u.uses.reduce((s, x) => s + x.price * x.count, u.restartCost * u.restarts);

// Distinct families from the real pool, as exclusions.test.ts picks them.
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
const SUF = distinctFamilies(wands.pools.normal.suffixes, 3);
const lowest = (id: string) => ({ modId: id, tierName: data.mods.get(id)!.tiers.at(-1)!.name });
/** A held Rare Wand: no start over, so annulments, chaos and bones do the work. */
const heldWand: ItemState = { base: wands, level: 82, rarity: 'rare', prefixes: [lowest(PRE[2]!)], suffixes: [lowest(SUF[2]!)] };
const heldTargets = [{ modId: PRE[0]!, minTierIndex: 0 }, { modId: SUF[0]!, minTierIndex: 0 }];

describe('the counts, priced back up, are the solve’s own expected cost', () => {
  it('on the found sheet: a two-modifier starter Quarterstaff, counted to the base', () => {
    const { r, u } = solveAndCount(FOUND_PRICES, white(staves, 25),
      [{ modId: PHYS, minTierIndex: 1 }, { modId: SPEED, minTierIndex: 1 }], { ...TIGHT, restartCost: FOUND_BASE_WEIGHT });
    expect(Math.abs(priced(u) - r.expectedCost) / r.expectedCost).toBeLessThan(1e-9);
    expect(u.expectedCost).toBeCloseTo(priced(u), 9);
    // Static sheet, so pinned: every base takes exactly one Transmute, and the plan bins ~129 of them.
    expect(u.restartCost).toBe(FOUND_BASE_WEIGHT);
    expect(u.restarts).toBeCloseTo(128.7072, 3);
    expect(countOf(u, 'transmute')).toBeCloseTo(u.restarts + 1, 9);
    expect(countOf(u, 'regal')).toBeCloseTo(11.0272, 3);
    expect(countOf(u, 'chaos')).toBeCloseTo(21.9956, 3);
    expect(u.uses.map((x) => x.key).sort()).toEqual(['chaos', 'regal', 'transmute']);
  });

  it('on the found sheet: an Essence target counts its Essence once, by which Essence it is', () => {
    const { r, u } = solveAndCount(FOUND_PRICES, white(staves, 70),
      [{ modId: PHYS, minTierIndex: 1 }, { modId: HASTE, minTierIndex: 0 }], { ...TIGHT, restartCost: FOUND_BASE_WEIGHT });
    expect(Math.abs(priced(u) - r.expectedCost) / r.expectedCost).toBeLessThan(1e-9);
    const essence = u.uses.find((x) => x.key === `essence:lesser:${HASTE}`)!;
    expect(essence.count).toBeCloseTo(1, 9);
    expect(essence.price).toBe(3);
    expect(essence.action).toMatchObject({ currency: 'essence', target: HASTE, level: 'lesser' });
  });

  it('on the trade sheet from white: greater orbs, a bone and its Necromancy omens', () => {
    const { r, u } = solveAndCount(frozen, white(wands, 82),
      [PRE[0]!, PRE[1]!, SUF[0]!].map((modId) => ({ modId, minTierIndex: 0 })),
      { ...TIGHT, restartCost: 0.2, solver: 'policy' });
    expect(Math.abs(priced(u) - r.expectedCost) / r.expectedCost).toBeLessThan(1e-9);
    // The omens are what make this the test of the surcharge, so they must really be in the plan.
    expect(u.uses.some((x) => x.kind === 'omen')).toBe(true);
    expect(countOf(u, 'desecrate')).toBeGreaterThan(0);
    expect(u.restarts).toBeGreaterThan(1);
  });

  it('on the trade sheet from a held Rare: no start over, annulments and chaos', () => {
    const { r, u } = solveAndCount(frozen, heldWand, heldTargets, TIGHT);
    expect(Math.abs(priced(u) - r.expectedCost) / r.expectedCost).toBeLessThan(1e-9);
    expect(u.restarts).toBe(0);
    expect(countOf(u, 'annul')).toBeGreaterThan(0);
    expect(countOf(u, 'chaos')).toBeGreaterThan(0);
  });

  it('a chain too big to eliminate is swept to the same counts', () => {
    const { r } = solveAndCount(frozen, heldWand, heldTargets, TIGHT);
    const sheet = pricesForBase(frozen, wands);
    const dense = markovUses(r.routes!, sheet)!;
    const swept = markovUses(r.routes!, sheet, { denseMax: 1 })!;
    // By key: two counts that tie (here a bone and the Annulment that takes off what it placed) may swap places.
    const byKey = (u: MarkovUses) => [...u.uses].sort((a, b) => a.key.localeCompare(b.key));
    expect(byKey(swept).map((x) => x.key)).toEqual(byKey(dense).map((x) => x.key));
    byKey(swept).forEach((x, i) => { expect(x.count).toBeCloseTo(byKey(dense)[i]!.count, 9); });
  });

  it('gives no counts for a plan that reaches a state with no move', () => {
    const { r } = solveAndCount(frozen, heldWand, heldTargets, TIGHT);
    const t = r.routes!;
    // The start's first successor that is not a goal, stripped of its move.
    const next = t.outTo.slice(t.outStart[t.restartIdx], t.outStart[t.restartIdx + 1]).find((j) => t.goal[j] === 0 && j !== t.restartIdx)!;
    const act = Int32Array.from(t.act);
    act[next] = -1;
    expect(markovUses({ ...t, act }, pricesForBase(frozen, wands))).toBeUndefined();
  });
});

describe('every charge the solve makes is attributed to a count', () => {
  // The hand-computed Desecration fixture (markovEssenceDesecrate.test.ts, markovReplay.test.ts): keep the
  // best of three offers, and with an Omen of Abyssal Echoes at 0.1 throw a bad offer back once — E = 47/45,
  // the omen spent on one offer in eight.
  const mk = (id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source']): Mod => ({
    id, source, type, family, tags: source === 'desecrated' ? ['kurgal_mod'] : [], text: id,
    tiers: [{ name: 't1', ilvl: 1, weight: source === 'normal' ? 100 : 1, ranges: [] }],
  });
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'Wands',
    pools: { normal: { prefixes: ['NP1'], suffixes: ['NS1'] }, desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] }, essence: { prefixes: [], suffixes: [] } },
  };
  const fixture: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')], ['NS1', mk('NS1', 'suffix', 'Fs1', 'normal')],
      ['DP1', mk('DP1', 'prefix', 'FdP', 'desecrated')], ['DS1', mk('DS1', 'suffix', 'FdS', 'desecrated')],
    ]),
    bases: new Map([['S', base]]),
  };

  it('the Echoes omen, paid only on the reroll: one desecration in eight', () => {
    const prices: Prices = {
      currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 },
      omens: { OmenofSinistralAnnulment: 0, OmenofDextralAnnulment: 0, OmenoftheBlackblooded: 0, [ECHOES_OMEN]: 0.1 },
    };
    const start: ItemState = { base, level: 100, rarity: 'rare', prefixes: [{ modId: 'NP1', tierName: 't1', fractured: true }], suffixes: [] };
    const r = markovFromItem(fixture, prices, start, [{ modId: 'NP1' }, { modId: 'DP1' }], { ...TIGHT, keepRoutes: true });
    expect(r.expectedCost).toBeCloseTo(47 / 45, 9);
    const u = markovUses(r.routes!, prices)!;
    expect(priced(u)).toBeCloseTo(47 / 45, 9);
    expect(countOf(u, ECHOES_OMEN)).toBeCloseTo(countOf(u, 'desecrate') / 8, 9);
  });

  it('a finished item filled with Exalts counts each fill Exalt', () => {
    const tiers = (id: string, type: 'prefix' | 'suffix', w: [string, number][]): Mod => ({
      id, source: 'normal', type, family: `F${id}`, tags: [], text: id,
      tiers: w.map(([name, weight]) => ({ name, ilvl: 1, weight, ranges: [] })),
    });
    const ab: ItemBase = {
      id: 'X', name: 'X', category: 'Wands',
      pools: { normal: { prefixes: ['A', 'J'], suffixes: ['B'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
    };
    const small: PatchData = {
      patch: 't',
      mods: new Map([['A', tiers('A', 'prefix', [['a1', 3], ['a2', 1]])], ['J', tiers('J', 'prefix', [['j1', 2]])], ['B', tiers('B', 'suffix', [['b1', 2]])]]),
      bases: new Map([['X', ab]]),
    };
    const prices: Prices = { currency: { transmute: 1, augment: 1, regal: 2, exalt: 3, annul: 4, chaos: 5 }, omens: {} };
    const craft = [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }];
    const solve = (fillOnFinish: boolean) => {
      const r = markovFromItem(small, prices, whiteItem(ab, 100), craft, { ...TIGHT, keepRoutes: true, restartCost: 0.5, fillOnFinish });
      return { r, u: markovUses(r.routes!, prices)! };
    };
    const plain = solve(false);
    const filled = solve(true);
    expect(priced(plain.u)).toBeCloseTo(plain.r.expectedCost, 9);
    expect(priced(filled.u)).toBeCloseTo(filled.r.expectedCost, 9);
    // A finished item here holds 2–3 mods of 6 slots, so filling it takes at least three Exalts.
    expect(countOf(filled.u, 'exalt') - countOf(plain.u, 'exalt')).toBeGreaterThanOrEqual(3 - 1e-9);
  });
});

/**
 * A Chaos Orb played with the Omen of Whittling is two rows — one Chaos Orb and one Omen of Whittling —
 * never a renamed Chaos row. The omen ships OFF in the true cost (TODO 12b), so the solve asks for it by
 * name. The fixture is markovWhittling.test.ts's: every mod one level, junk J at 10 below target A's 50, so
 * from A and J the plan's first move is the omened Chaos, the first count the Chaos row ever receives.
 */
describe('a Chaos with the Omen of Whittling counts one Chaos Orb and one omen', () => {
  const one = (id: string, type: 'prefix' | 'suffix', ilvl: number, weight: number): Mod => ({
    id, source: 'normal', type, family: id, tags: [], text: id, tiers: [{ name: `${id}1`, ilvl, weight, ranges: [] }],
  });
  const A: Mod = {
    id: 'A', source: 'normal', type: 'prefix', family: 'A', tags: [], text: 'A',
    tiers: [{ name: 'a1', ilvl: 20, weight: 100, ranges: [] }, { name: 'a2', ilvl: 50, weight: 100, ranges: [] }],
  };
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'Wands',
    pools: { normal: { prefixes: ['A', 'J'], suffixes: ['B', 'K'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
  };
  const fixture: PatchData = {
    patch: 't',
    mods: new Map([A, one('B', 'suffix', 50, 100), one('J', 'prefix', 10, 10), one('K', 'suffix', 10, 10)].map((m) => [m.id, m])),
    bases: new Map([['S', base]]),
  };
  const prices: Prices = { currency: { exalt: 5, annul: 100, chaos: 1 }, omens: { OmenofWhittling: 1 } };

  it('keeps the Chaos row a plain Chaos Orb, the omen on a row of its own', () => {
    const start: ItemState = {
      base, level: 82, rarity: 'rare', prefixes: [{ modId: 'A', tierName: 'a2' }, { modId: 'J', tierName: 'J1' }], suffixes: [],
    };
    const r = markovFromItem(fixture, prices, start, [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }],
      { ...TIGHT, keepRoutes: true, whittling: true });
    expect(r.nodes[0]!.action).toEqual({ currency: 'chaos', whittling: true });
    const u = markovUses(r.routes!, prices)!;
    const chaos = u.uses.find((x) => x.key === 'chaos')!;
    const omen = u.uses.find((x) => x.key === 'OmenofWhittling')!;
    expect(chaos.kind).toBe('orb');
    expect(chaos.action).toEqual({ currency: 'chaos' });
    expect(omen.kind).toBe('omen');
    // Each omen rides on a Chaos Orb, and the counts priced back up are the solve's cost.
    expect(omen.count).toBeGreaterThan(0.5);
    expect(chaos.count).toBeGreaterThanOrEqual(omen.count - 1e-12);
    expect(u.uses.filter((x) => x.key === 'chaos')).toHaveLength(1);
    expect(priced(u)).toBeCloseTo(r.expectedCost, 9);
  });
});

/**
 * The replay plays the solved plan on REAL items and counts what it spent (`spendByMove`) — a measurement
 * that shares nothing with the linear algebra above. Twenty seeded batches give each mean count a standard
 * error; every exact count must sit within three of it. (The model and the replay differ only by the
 * junk-family average, which these crafts barely touch.)
 */
describe('the counts agree with the plan played on real items', () => {
  const BATCHES = 20;
  const RUNS = 500;
  const crafts: [string, Prices, ItemState, TierTarget[], MarkovOptions][] = [
    ['a found two-modifier Quarterstaff', FOUND_PRICES, white(staves, 25),
      [{ modId: PHYS, minTierIndex: 1 }, { modId: SPEED, minTierIndex: 1 }], { restartCost: FOUND_BASE_WEIGHT }],
    ['a found Quarterstaff with an Essence', FOUND_PRICES, white(staves, 70),
      [{ modId: PHYS, minTierIndex: 1 }, { modId: HASTE, minTierIndex: 0 }], { restartCost: FOUND_BASE_WEIGHT }],
    ['a held Rare Wand on the trade sheet', frozen, heldWand, heldTargets, {}],
  ];
  it.each(crafts)('%s', (_name, prices, start, targets, opts) => {
    const sheet = pricesForBase(prices, start.base);
    const { u } = solveAndCount(prices, start, targets, opts);
    const exact = new Map([...u.uses.map((x) => [x.key, x.count] as const), ['restart', u.restarts]]);
    const batches: Map<string, number>[] = [];
    for (let b = 0; b < BATCHES; b++) {
      const rp = markovFromItem(data, prices, start, targets, { ...opts, replay: { runs: RUNS, seed: 100 + b, watch: [] } }).replay;
      if (!rp?.ok) throw new Error('the replay declined');
      const m = new Map<string, number>();
      for (const s of rp.spendByMove) {
        const keys = s.action.currency === 'restart' ? ['restart'] : actionPriceParts(sheet, s.action).map((p) => p.key);
        for (const k of keys) m.set(k, (m.get(k) ?? 0) + s.count);
      }
      batches.push(m);
    }
    const keys = new Set([...exact.keys(), ...batches.flatMap((m) => [...m.keys()])]);
    for (const k of keys) {
      const xs = batches.map((m) => m.get(k) ?? 0);
      const mean = xs.reduce((s, x) => s + x, 0) / BATCHES;
      const se = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (BATCHES - 1) / BATCHES);
      const want = exact.get(k) ?? 0;
      if (se === 0) expect(mean, k).toBeCloseTo(want, 9);
      else expect(Math.abs(mean - want) / se, k).toBeLessThan(3);
    }
  }, 120_000);
});
