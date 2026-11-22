import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { whiteItem } from '../../engine/src/index.ts';
import type { Prices } from './cost.ts';
import { createActionSpace, type ActionSpaceParams, type McAction } from './markovActions.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { MarkovOptions, MarkovResult } from './markovFromItem.ts';
import {
  FLAG_JUNK_PREFIX, FLAG_NONE, decodeState, encodeState, sideIndexOf, type Dist, type McTarget,
} from './markovState.ts';
import { permutationClasses } from './markovSymmetry.ts';
import { ceilingChoices, createWhittling, levelDistOf, lowestOdds, type LevelDist } from './markovWhittling.ts';

/**
 * The Omen of Whittling in the true expected cost (TODO 12b): "your next Chaos Orb will remove the lowest
 * level modifier", played as an average over the levels the lattice does not hold (markovWhittling.ts).
 */

const at = (...pairs: [number, number][]): LevelDist => levelDistOf(pairs)!;
const sum = (xs: Iterable<number>): number => { let s = 0; for (const x of xs) s += x; return s; };

describe('lowestOdds — which mod is lowest, by order statistics', () => {
  it('takes a unique lowest for certain', () => {
    expect(lowestOdds([{ dist: at([10, 1]), count: 1 }, { dist: at([20, 1]), count: 1 }])).toEqual([1, 0]);
  });

  it('splits a tie evenly — two mods at one level are half each, three a third', () => {
    const [a, b] = lowestOdds([{ dist: at([10, 1]), count: 1 }, { dist: at([10, 1]), count: 1 }]);
    expect(a).toBeCloseTo(0.5, 15);
    expect(b).toBeCloseTo(0.5, 15);
    // A group of three interchangeable mods: each a third, the group the whole.
    const [each] = lowestOdds([{ dist: at([10, 1]), count: 3 }]);
    expect(each).toBeCloseTo(1 / 3, 15);
  });

  /**
   * A at 10 or 20 evenly, B at 20: A is lowest outright half the time; the other half they tie and A
   * takes half of it. So A 0.5 + 0.5·0.5 = 0.75, B 0.25.
   */
  it('mixes outright wins and ties as the levels fall', () => {
    const [a, b] = lowestOdds([{ dist: at([10, 1], [20, 1]), count: 1 }, { dist: at([20, 1]), count: 1 }]);
    expect(a).toBeCloseTo(0.75, 15);
    expect(b).toBeCloseTo(0.25, 15);
  });

  /**
   * Three mods by hand. A ∈ {10, 30} evenly, B = 20, C ∈ {20, 30} evenly.
   *   A = 10 (½): A outright.
   *   A = 30 (½): B = 20 is lowest, tied with C when C = 20 (½) — B ¾ of it, C ¼.
   * So A ½, B ½·¾ = 3/8, C ½·¼ = 1/8.
   */
  it('gets a three-mod case with a tie right by hand', () => {
    const odds = lowestOdds([
      { dist: at([10, 1], [30, 1]), count: 1 }, { dist: at([20, 1]), count: 1 }, { dist: at([20, 1], [30, 1]), count: 1 },
    ]);
    expect(odds[0]).toBeCloseTo(1 / 2, 15);
    expect(odds[1]).toBeCloseTo(3 / 8, 15);
    expect(odds[2]).toBeCloseTo(1 / 8, 15);
  });

  it('sums to one, groups counted by their members', () => {
    const groups = [
      { dist: at([1, 3], [16, 2], [33, 1], [70, 1]), count: 2 },
      { dist: at([16, 1], [46, 1], [70, 2]), count: 1 },
      { dist: at([65, 1]), count: 1 },
      { dist: at([1, 1], [70, 5], [80, 1]), count: 3 },
    ];
    const odds = lowestOdds(groups);
    expect(sum(odds.map((p, k) => p * groups[k]!.count))).toBeCloseTo(1, 14);
  });
});

// ── A small synthetic craft: every mod one tier, so every level is known and the average is exact ──────

const one = (id: string, type: 'prefix' | 'suffix', ilvl: number, weight: number, source: Mod['source'] = 'normal'): Mod => ({
  id, source, type, family: id, tags: [], text: id, tiers: [{ name: `${id}1`, ilvl, weight, ranges: [] }],
});
/** Target A: a tier at 20 below the one asked (a2 at 50). B at 50. Junk J (prefix) and K (suffix) at 10. */
const A: Mod = {
  id: 'A', source: 'normal', type: 'prefix', family: 'A', tags: [], text: 'A',
  tiers: [{ name: 'a1', ilvl: 20, weight: 100, ranges: [] }, { name: 'a2', ilvl: 50, weight: 100, ranges: [] }],
};
const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands',
  pools: {
    normal: { prefixes: ['A', 'J'], suffixes: ['B', 'K'] },
    desecrated: { prefixes: ['D'], suffixes: [] },
    essence: { prefixes: [], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([A, one('B', 'suffix', 50, 100), one('J', 'prefix', 10, 10), one('K', 'suffix', 10, 10),
    one('D', 'prefix', 65, 100, 'desecrated')].map((m) => [m.id, m])),
  bases: new Map([['S', base]]),
};
const prices: Prices = { currency: { exalt: 5, annul: 100, chaos: 1 }, omens: { OmenofWhittling: 1 } };
const target = (m: Mod, minIndex = 0, fractured = false): McTarget => ({ mods: [{ mod: m, minIndex }], type: m.type, fractured });
const list: McTarget[] = [target(A, 1), target(data.mods.get('B')!)];

// The omen ships OFF (`whittling` defaults to false), so every test of the action turns it on by name.
const space = (extra: Partial<ActionSpaceParams> = {}) => createActionSpace({
  data, prices, level: 82, pools: base.pools, list, side: sideIndexOf(list), desecratable: false,
  bossTargetable: false, junkFamilies: true, whittling: true, ...extra,
});
const isWhittling = (a: McAction): boolean => a.currency === 'chaos' && a.whittling === true;
const chaosOf = (s: string, extra: Partial<ActionSpaceParams> = {}) => {
  const acts = space(extra).actionsOf(decodeState(s as never));
  return { plain: acts.find((x) => x.action.currency === 'chaos' && !isWhittling(x.action)), whittled: acts.filter((x) => isWhittling(x.action)) };
};
const keyOf = (d: Dist): string => [...d].map(([k, p]) => `${k}=${p.toFixed(12)}`).sort().join(';');

describe('the Whittling Chaos as an action', () => {
  // A blocked (20), one junk prefix and one junk suffix (both 10): the junk is lowest, half and half.
  const held = encodeState(0, 1, 1, 1, FLAG_NONE, 'rare');

  it('removes by level: only the two junk mods, half each, never the blocked roll above them — then a Chaos add', () => {
    const { plain, whittled } = chaosOf(held);
    expect(whittled).toHaveLength(1);
    const w = whittled[0]!;
    expect(w.cost).toBe(2); // the Chaos Orb and the omen
    // The plain Chaos takes the blocked roll a third of the time; Whittling never does.
    expect([...plain!.dist.keys()].some((k) => (decodeState(k).blocked & 1) === 0)).toBe(true);
    for (const k of w.dist.keys()) expect(decodeState(k).blocked & 1).toBe(1);
    // Exactly half of each named removal's outcome (the ceiling's actions are those two, add included).
    const named = space({ whittling: 'ceiling' }).actionsOf(decodeState(held))
      .filter((a) => a.action.currency === 'chaos' && a.action.named && 'junk' in a.action.named);
    expect(named).toHaveLength(2);
    const want: Dist = new Map();
    for (const a of named) for (const [k, p] of a.dist) want.set(k, (want.get(k) ?? 0) + p / 2);
    expect(w.dist.size).toBe(want.size);
    for (const [k, p] of want) expect(w.dist.get(k)).toBeCloseTo(p, 14);
    expect(sum(w.dist.values())).toBeCloseTo(1, 14);
  });

  it('is offered only where the omen is priced and the player has it, and never with `whittling: false`', () => {
    expect(chaosOf(held).whittled).toHaveLength(1);
    expect(chaosOf(held, { prices: { ...prices, omens: {} } }).whittled).toHaveLength(0);
    expect(chaosOf(held, { policy: { excluded: new Set(['OmenofWhittling']) } }).whittled).toHaveLength(0);
    expect(chaosOf(held, { whittling: false }).whittled).toHaveLength(0);
    // The plain Chaos stays in every case.
    expect(chaosOf(held, { whittling: false }).plain).toBeDefined();
  });

  /**
   * The level model fails its replay gate (docs/validation.md, 2026-11-22), so it ships OFF: with the omen
   * priced and allowed, an action space that does not ask for it offers no Whittling Chaos at all.
   */
  it('is OFF by default, even where the omen is priced and allowed', () => {
    const acts = createActionSpace({
      data, prices, level: 82, pools: base.pools, list, side: sideIndexOf(list), desecratable: false,
      bossTargetable: false, junkFamilies: true,
    }).actionsOf(decodeState(held));
    expect(acts.some((a) => isWhittling(a.action))).toBe(false);
    expect(acts.some((a) => a.action.currency === 'chaos')).toBe(true);
    // The same space asked for it does offer it — the default is what is off, not the omen.
    expect(chaosOf(held).whittled).toHaveLength(1);
  });

  it('folds into the plain Chaos where there is nothing to choose between', () => {
    // One junk prefix and nothing else removable: the omen changes nothing, so only the cheaper twin stays.
    expect(chaosOf(encodeState(0, 0, 1, 0, FLAG_NONE, 'rare')).whittled).toHaveLength(0);
    // A present target at 50 beside it: now it does.
    expect(chaosOf(encodeState(1, 0, 1, 0, FLAG_NONE, 'rare')).whittled).toHaveLength(1);
  });

  it('is never offered below Rare', () => {
    const acts = space().actionsOf(decodeState(encodeState(0, 0, 1, 0, FLAG_NONE, 'magic')));
    expect(acts.some((a) => isWhittling(a.action))).toBe(false);
  });
});

describe('the level model', () => {
  it('reads a blocked roll below the tier asked, a present one at or above it', () => {
    // A blocked: its tier under the one asked (20). B present (50). A goes for certain — read at A's
    // asked tier (50) instead, the two would tie.
    const { oddsOf } = createWhittling({ data, level: 82, pools: base.pools, list });
    const odds = oddsOf(decodeState(encodeState(0b10, 0b01, 0, 0)))!;
    expect(odds.position.get(0)).toBe(1);
    expect(odds.position.get(1)).toBe(0);
    // A present at its tier (50) beside B (50): a tie, half each.
    const tie = oddsOf(decodeState(encodeState(0b11, 0, 0, 0)))!;
    expect(tie.position.get(0)).toBeCloseTo(0.5, 15);
  });

  it('never whittles a fractured mod, even the lowest one', () => {
    // A fractured present A at its tier (50) and B at 50: only B can go, and there is nothing to choose.
    const fr: McTarget[] = [target(A, 1, true), target(data.mods.get('B')!)];
    const { oddsOf } = createWhittling({ data, level: 82, pools: base.pools, list: fr });
    expect(oddsOf(decodeState(encodeState(0b11, 0, 0, 0)))).toBeUndefined();
    // With a junk prefix (10) too, the fractured mod still has no entry and the rest sum to one.
    const odds = oddsOf(decodeState(encodeState(0b11, 0, 1, 0)))!;
    expect(odds.position.has(0)).toBe(false);
    expect(odds.junk.prefix.plain).toBeCloseTo(1, 15);
    expect(odds.position.get(1)).toBeCloseTo(0, 15);
  });

  /**
   * The bone's flagged junk is read from the carved pool — D at 65 — so under a junk pool that rolls low
   * it is never the lowest. Junk prefix H at 1 or 70 evenly, A present at 50:
   *   H = 1 (½): H is lowest.  H = 70 (½): A (50) is, the flagged 65 above it.
   * So junk ½, A ½, flagged 0.
   */
  it('reads the bone’s flagged junk at its carved level, never lowest under low junk', () => {
    const H: Mod = {
      id: 'H', source: 'normal', type: 'prefix', family: 'H', tags: [], text: 'H',
      tiers: [{ name: 'h1', ilvl: 1, weight: 100, ranges: [] }, { name: 'h2', ilvl: 70, weight: 100, ranges: [] }],
    };
    const pools = { ...base.pools, normal: { prefixes: ['A', 'H'], suffixes: ['B'] } };
    const withH: PatchData = { ...data, mods: new Map([...data.mods, ['H', H]]) };
    const { oddsOf } = createWhittling({ data: withH, level: 82, pools, list });
    const odds = oddsOf(decodeState(encodeState(0b01, 0, 2, 0, FLAG_JUNK_PREFIX)))!;
    expect(odds.junk.prefix.flagged).toBe(0);
    expect(odds.junk.prefix.plain).toBeCloseTo(0.5, 15);
    expect(odds.position.get(0)).toBeCloseTo(0.5, 15);
  });

  /**
   * Two cross-family alternatives whose windowed weights agree at every reachable floor (200 at floor
   * 0, none from 35 up) but whose tiers sit at different levels: Whittling tells them apart, so the
   * symmetry canonicaliser must not swap them.
   */
  it('keeps the canonicaliser from swapping two positions Whittling can tell apart', () => {
    const two = (id: string, l1: number, l2: number): Mod => ({
      id, source: 'normal', type: 'prefix', family: id, tags: [], text: id,
      tiers: [{ name: `${id}1`, ilvl: l1, weight: 100, ranges: [] }, { name: `${id}2`, ilvl: l2, weight: 100, ranges: [] }],
    });
    const none = { prefixes: [], suffixes: [] };
    const pools = { normal: { prefixes: ['X', 'Y', 'Z'], suffixes: [] }, desecrated: none, essence: none };
    const mods = new Map([two('X', 1, 20), two('Y', 10, 30), two('Z', 1, 20)].map((m) => [m.id, m]));
    const d: PatchData = { patch: 't', mods, bases: new Map() };
    const three = [target(mods.get('X')!), target(mods.get('Y')!), target(mods.get('Z')!)];
    const classes = permutationClasses({ data: d, pools, level: 82, whittling: true }, three, [[0, 1, 2]]);
    // X and Z (identical tables) stay one class; Y, at other levels, is not in it.
    expect(classes).toEqual([[0, 2]]);
    // Without the omen nothing reads a level: the three are one class, as a solve without it always had.
    expect(permutationClasses({ data: d, pools, level: 82 }, three, [[0, 1, 2]])).toEqual([[0, 1, 2]]);
    // And a solve asks the question exactly when it plays the omen: one slot of the three alternatives,
    // from a Rare holding a junk suffix.
    const bs: ItemBase = { id: 'T', name: 'T', category: 'Wands', pools: { normal: { prefixes: ['X', 'Y', 'Z'], suffixes: ['K'] }, desecrated: none, essence: none } };
    const dd: PatchData = { patch: 't', mods: new Map([...mods, ['K', one('K', 'suffix', 10, 10)]]), bases: new Map([['T', bs]]) };
    const start: ItemState = { base: bs, level: 82, rarity: 'rare', prefixes: [], suffixes: [{ modId: 'K', tierName: 'K1' }] };
    const classesOf = (whittling: boolean) => markovFromItem(dd, prices, start, ['X', 'Y', 'Z'].map((modId) => ({ modId, slot: 0 })),
      { tolerance: 1e-12, solver: 'policy', keepRoutes: true, whittling }).routes!.locate.classes;
    expect(classesOf(true)).toEqual([[0, 2]]);
    expect(classesOf(false)).toEqual([[0, 1, 2]]);
  });
});

describe('the replay plays the omen on real tiers', () => {
  const held = (prefixes: ItemState['prefixes'], suffixes: ItemState['suffixes']): ItemState =>
    ({ base, level: 82, rarity: 'rare', prefixes, suffixes });
  const solve = (start: ItemState, opts: MarkovOptions = {}): MarkovResult => markovFromItem(
    data, prices, start, [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }],
    { tolerance: 1e-12, solver: 'policy', whittling: true, ...opts },
  );

  /**
   * Every mod has one level here, so the average over levels IS the game, and the replay has to land on
   * V within the dice: a plain removal in its place takes A or B half the time where the omen takes J.
   * From A at its tier (50) and junk J (10), the omen is the first move; from a blocked A (20) with J and
   * K (10), the ties and the blocked roll come into it.
   */
  it('removes the lowest-level mod, so a craft whose levels are known agrees with V', () => {
    const starts = [
      held([{ modId: 'A', tierName: 'a2' }, { modId: 'J', tierName: 'J1' }], []),
      held([{ modId: 'A', tierName: 'a1' }, { modId: 'J', tierName: 'J1' }], [{ modId: 'K', tierName: 'K1' }]),
    ];
    for (const [k, start] of starts.entries()) {
      const r = solve(start, { replay: { runs: 20_000, seed: 5 } });
      expect(r.bound).toBe('exact');
      if (k === 0) expect(r.nodes[0]!.action).toEqual({ currency: 'chaos', whittling: true });
      const rp = r.replay!;
      if (!rp.ok) throw new Error(rp.reason);
      expect(rp.spendByMove.some((m) => isWhittling(m.action) && m.count > 0.5)).toBe(true);
      expect(Math.abs(rp.meanCost - r.expectedCost)).toBeLessThan(3 * rp.stdErr);
      // Without the omen it costs more.
      expect(solve(start, { whittling: false }).expectedCost).toBeGreaterThan(r.expectedCost + 0.5);
    }
  });

  /**
   * The true cost as the app asks for it — no `whittling` option — never plays the omen, to the last
   * digit: the same cost as `whittling: false`, and no Whittling Chaos on the policy's path.
   */
  it('is OFF in the true cost unless asked for, even where the omen pays', () => {
    const start = held([{ modId: 'A', tierName: 'a2' }, { modId: 'J', tierName: 'J1' }], []);
    const asDefault = markovFromItem(
      data, prices, start, [{ modId: 'A', minTierIndex: 1 }, { modId: 'B' }], { tolerance: 1e-12, solver: 'policy' },
    );
    expect(asDefault.bound).toBe('exact');
    expect(asDefault.nodes.some((nd) => nd.action !== undefined && isWhittling(nd.action))).toBe(false);
    expect(asDefault.nodes[0]!.action).toBeDefined();
    expect(asDefault.expectedCost).toBe(solve(start, { whittling: false }).expectedCost);
    expect(solve(start).expectedCost).toBeLessThan(asDefault.expectedCost);
  });

  it('declines the ceiling’s named removal, which no real orb makes', () => {
    const start = held([{ modId: 'A', tierName: 'a1' }, { modId: 'J', tierName: 'J1' }], [{ modId: 'K', tierName: 'K1' }]);
    const r = solve(start, { whittling: 'ceiling', replay: { runs: 100, seed: 5 } });
    expect(r.bound).toBe('exact');
    expect(r.replay?.ok).toBe(false);
  });
});

describe('the ceiling: the removal the player names', () => {
  it('offers one action per junk side, flagged and not, and per blocked position — never a present target', () => {
    // B present, A blocked, a junk prefix the bone flagged and a junk suffix. Removing B is no choice —
    // and here it would only put B straight back, a self-loop the fold would hide, so the choices are
    // read off directly too.
    const s = encodeState(0b10, 0b01, 1, 1, FLAG_JUNK_PREFIX, 'rare');
    expect(ceilingChoices(decodeState(s), list, encodeState).map((c) => c.choice))
      .toEqual([{ junk: 'prefix', flagged: true }, { junk: 'suffix' }, { position: 0 }]);
    const acts = space({ whittling: 'ceiling', desecratable: true }).actionsOf(decodeState(s));
    const named = acts.filter((a) => a.action.currency === 'chaos' && a.action.named);
    const choices = named.map((a) => (a.action.currency === 'chaos' ? a.action.named : undefined));
    expect(choices).toEqual([{ junk: 'prefix', flagged: true }, { junk: 'suffix' }, { position: 0 }]);
    // No real Whittling action beside them, and every one keeps the present target.
    expect(acts.some((a) => a.action.currency === 'chaos' && a.action.whittling && !a.action.named)).toBe(false);
    for (const a of named) for (const k of a.dist.keys()) expect(decodeState(k).present & 0b10).toBe(0b10);
    // Removing the flagged junk clears the flag; every action costs the Chaos and the omen.
    for (const k of named[0]!.dist.keys()) expect(decodeState(k).flagged).toBe(FLAG_NONE);
    for (const k of named[1]!.dist.keys()) expect(decodeState(k).flagged).toBe(FLAG_JUNK_PREFIX);
    expect(named.every((a) => a.cost === 2)).toBe(true);
    expect(keyOf(named[0]!.dist)).not.toBe(keyOf(named[1]!.dist));
  });
});

/**
 * A real craft, frozen sheet, the omen priced at 1 ex (the frozen sheet has no quote, so it is otherwise
 * never offered): a white Wand, two prefixes and a suffix at their second tier, 30 ex a base. The real
 * omen can take a target and the ceiling never does, so the three costs are ordered — and the omen pays.
 */
describe('a real craft, ordered: without ≥ with the omen ≥ the ceiling', () => {
  it('prices the omen in, and plays it', async () => {
    const { loadShippedPatch } = await import('../../engine/src/loadPatch.ts');
    const { loadFrozenPrices } = await import('./frozenPrices.ts');
    const real = loadShippedPatch('data/patches/0.5.0');
    const frozen = loadFrozenPrices();
    expect(frozen.omens.OmenofWhittling).toBeUndefined();
    const sheet: Prices = { ...frozen, omens: { ...frozen.omens, OmenofWhittling: 1 } };
    const wands = real.bases.get('Wands')!;
    const ids = [...wands.pools.normal.prefixes.slice(0, 2), wands.pools.normal.suffixes[0]!];
    const targets = ids.map((id) => ({ modId: id, minTierIndex: real.mods.get(id)!.tiers.length - 2 }));
    const run = (whittling: boolean | 'ceiling', p: Prices = sheet) => markovFromItem(real, p, whiteItem(wands, 82), targets, {
      restartCost: 30, whittling, tolerance: 1e-9, solver: 'policy', maxIters: 20_000_000,
    });
    const off = run(false);
    const on = run(true);
    const ceiling = run('ceiling');
    for (const r of [off, on, ceiling]) expect(r.bound).toBe('exact');
    expect(on.expectedCost).toBeLessThan(off.expectedCost);
    expect(ceiling.expectedCost).toBeLessThanOrEqual(on.expectedCost);
    // On the frozen sheet as it is, nothing moves: no quote, no omen.
    expect(run(true, frozen).expectedCost).toBe(off.expectedCost);
  }, 300_000);
});
