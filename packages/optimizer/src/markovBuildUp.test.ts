import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadShippedPatch } from '../../engine/src/loadPatch.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem, type MarkovOptions, type MarkovResult } from './markovFromItem.ts';
import type { TierTarget } from './optimize.ts';
import { BUILD_UP_MIN_GROUPS, buildOrder, levelTargets, markovBuiltUp, type SoloSolve } from './markovBuildUp.ts';
import { BONE_KEYS, markovBoneFreeFirst } from './markovBoneFree.ts';
import { slotIndexGroups } from './slots.ts';

// Every solve goes through the real `markovFromItem`, watched: which crafts the build-up solved, with
// which targets and options, and what each gave back. A test that only needs to know the craft was
// solved once swaps in a stand-in answer instead.
vi.mock('./markovFromItem.ts', async (importOriginal) => {
  const real = await importOriginal<typeof import('./markovFromItem.ts')>();
  return { ...real, markovFromItem: vi.fn(real.markovFromItem) };
});
const { markovFromItem: realSolve } = await vi.importActual<typeof import('./markovFromItem.ts')>('./markovFromItem.ts');
const solves = vi.mocked(markovFromItem);
beforeEach(() => {
  solves.mockReset();
  solves.mockImplementation(realSolve);
});

// Real data and the frozen sheet: four Wand targets four tiers below the top (three prefixes, one
// suffix), from a white base, bones left out — a craft whose two-phase solve takes well under a second
// at a 1e-9 tolerance, and whose build-up a tenth of that.
const data = loadShippedPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const base = data.bases.get('Wands')!;
const below = (id: string): TierTarget => ({ modId: id, minTierIndex: data.mods.get(id)!.tiers.length - 4 });
const targets = [...base.pools.normal.prefixes.slice(0, 3), ...base.pools.normal.suffixes.slice(0, 1)].map(below);
const white: ItemState = { base, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const noBones = { excluded: new Set<string>(BONE_KEYS) };
const fromWhite: MarkovOptions = { restartCost: 0, solver: 'policy', tolerance: 1e-9, policy: noBones };

/** A solve with its own `solve` progress: a seeded one settles from the seed, so it only reads "done". */
const withEvents = (run: (opts: MarkovOptions) => MarkovResult, opts: MarkovOptions = fromWhite) => {
  const events: number[] = [];
  const r = run({ ...opts, onProgress: (p) => { if (p.phase === 'solve') events.push(p.done); } });
  return { r, events };
};
const plain = withEvents((o) => markovFromItem(data, prices, white, targets, { ...o, keepRoutes: true }));
const rel = (a: number, b: number): number => Math.abs(a - b) / b;
/** The options of every solve since the last reset, in order. */
const callOpts = (): MarkovOptions[] => solves.mock.calls.map((c) => c[4]!);
const callTargets = (): (readonly TierTarget[])[] => solves.mock.calls.map((c) => c[3]);
const results = (): MarkovResult[] => solves.mock.results.map((r) => r.value as MarkovResult);

describe('a big craft built up from smaller ones', () => {
  it('reaches the same exact answer as the two-phase solve, and the full craft takes the seeded path', () => {
    expect(plain.r).toMatchObject({ feasible: true, bound: 'exact' });
    expect(slotIndexGroups(targets)).toHaveLength(BUILD_UP_MIN_GROUPS);
    // The two-phase solve climbs through phase A first.
    expect(plain.events.length).toBeGreaterThan(1);

    const onLevel = vi.fn();
    const { r, events } = withEvents((o) => markovBuiltUp(data, prices, white, targets, o, { onLevel }));
    expect(r).toMatchObject({ feasible: true, bound: 'exact' });
    expect(rel(r.expectedCost, plain.r.expectedCost)).toBeLessThan(1e-9);
    // Seeded: the plan settles straight from the seed, so the bar only ever reads "done" — and only the
    // full craft reports through the caller's `onProgress`.
    expect(events).toEqual([1000]);
    // Four groups alone, then the levels of two and three groups (level one is the cheapest solo).
    expect(onLevel.mock.calls).toEqual([[1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6]]);
  });

  it('adds the groups cheapest first, each level seeded from the one below, the full craft from the last', () => {
    const replay = { runs: 10 };
    const onProgress = vi.fn();
    const caller: MarkovOptions = { ...fromWhite, replay, onProgress };
    markovBuiltUp(data, prices, white, targets, caller);
    // Four solos, two levels, the full craft.
    expect(solves).toHaveBeenCalledTimes(7);
    const opts = callOpts();
    const got = results();

    // The solos: each target alone, every one settled, and none of them the same price.
    expect(callTargets().slice(0, 4)).toEqual(targets.map((t) => [t]));
    const solo = got.slice(0, 4).map((r) => r.expectedCost);
    expect(got.slice(0, 4).every((r) => r.feasible && r.bound === 'exact')).toBe(true);
    const cheapest = solo.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c).map((x) => x.i);
    // Not the caller's order, or this would prove nothing about the ordering.
    expect(cheapest).not.toEqual([0, 1, 2, 3]);
    const inCallerOrder = (k: number) => targets.filter((_, i) => cheapest.slice(0, k).includes(i));
    expect(callTargets()[4]).toEqual(inCallerOrder(2));
    expect(callTargets()[5]).toEqual(inCallerOrder(3));
    expect(callTargets()[6]).toBe(targets);

    // Level two from the cheapest solo's plan, level three from level two's, the full craft from three's.
    expect(opts.slice(0, 4).every((o) => o.seedFrom === undefined)).toBe(true);
    expect(opts[4]!.seedFrom).toBe(got[cheapest[0]!]!.routes);
    expect(opts[5]!.seedFrom).toBe(got[4]!.routes);
    expect(opts[6]!.seedFrom).toBe(got[5]!.routes);

    // The smaller crafts carry the caller's craft, never its play-out, progress or clock.
    for (const o of opts.slice(0, 6)) {
      expect(o).toMatchObject({ restartCost: 0, solver: 'policy', tolerance: 1e-9, keepRoutes: true });
      expect(o.policy).toBe(noBones);
      expect(o.replay).toBeUndefined();
      expect(o.onProgress).toBeUndefined();
      expect('maxMillis' in o).toBe(false);
    }
    // The full craft runs on the caller's own options.
    expect(opts[6]).toEqual({ ...caller, seedFrom: got[5]!.routes });
    expect(opts[6]!.onProgress).toBe(onProgress);
    expect(opts[6]!.replay).toBe(replay);
  });

  it('skips a level that does not settle, and seeds on from the last one that did', () => {
    // Level three (the sixth solve) comes back a ceiling: the full craft is seeded from level two.
    solves.mockImplementation((...args) => {
      const r = realSolve(...args);
      return solves.mock.calls.length === 6 ? { ...r, bound: 'upper', converged: false } : r;
    });
    const { r, events } = withEvents((o) => markovBuiltUp(data, prices, white, targets, o));
    expect(solves).toHaveBeenCalledTimes(7);
    expect(callOpts()[6]!.seedFrom).toBe(results()[4]!.routes);
    expect(rel(r.expectedCost, plain.r.expectedCost)).toBeLessThan(1e-9);
    expect(events).toEqual([1000]);
  });

  it('gives the smaller crafts a quarter of the caller’s clock, and the full craft all of it', () => {
    const r = markovBuiltUp(data, prices, white, targets, { ...fromWhite, maxMillis: 60_000 });
    expect(rel(r.expectedCost, plain.r.expectedCost)).toBeLessThan(1e-9);
    const opts = callOpts();
    expect(opts).toHaveLength(7);
    for (const o of opts.slice(0, 6)) {
      expect(o.maxMillis).toBeGreaterThan(0);
      expect(o.maxMillis).toBeLessThanOrEqual(15_000);
    }
    expect(opts[6]!.maxMillis).toBe(60_000);
  });

  it('falls back to the two-phase solve when the smaller crafts’ clock is spent at once', () => {
    const onLevel = vi.fn();
    const { r, events } = withEvents((o) => markovBuiltUp(data, prices, white, targets, o, { maxMillis: -1, onLevel }));
    // Nothing smaller was solved: the full craft alone, unseeded, with the caller's options.
    expect(solves).toHaveBeenCalledTimes(1);
    expect(callOpts()[0]!.seedFrom).toBeUndefined();
    expect(r).toMatchObject({ feasible: true, bound: 'exact' });
    expect(r.expectedCost).toBe(plain.r.expectedCost);
    expect(events.length).toBeGreaterThan(1);
    // The bar the smaller crafts drive still ends full.
    expect(onLevel.mock.calls).toEqual([[6, 6]]);
  });
});

describe('the order the groups are added in', () => {
  const exact = (expectedCost: number): SoloSolve => ({ feasible: true, bound: 'exact', expectedCost });
  it('is cheapest first, ties in the groups’ own order, and a solo that did not settle last', () => {
    const solos: SoloSolve[] = [
      exact(5),
      exact(2),
      // A refusal is ranked by what it says, not by its number.
      { feasible: false, bound: 'exact', expectedCost: 0 },
      // A ceiling is not a cost to rank on, however low.
      { feasible: true, bound: 'upper', expectedCost: 1 },
      exact(2),
    ];
    expect(buildOrder(solos)).toEqual([1, 4, 0, 2, 3]);
    expect(buildOrder([exact(3), exact(3), exact(1)])).toEqual([2, 0, 1]);
  });

  it('keeps a slot’s alternatives together, in the caller’s order', () => {
    // Five targets in four slots: the second and fifth (two suffixes) are alternatives for one position.
    const slotted = [targets[0]!, { ...targets[3]!, slot: 7 }, targets[1]!, targets[2]!, { ...below(base.pools.normal.suffixes[1]!), slot: 7 }];
    const groups = slotIndexGroups(slotted);
    expect(groups).toEqual([[0], [1, 4], [2], [3]]);
    expect(levelTargets(slotted, groups, [1, 3, 0, 2], 2)).toEqual([slotted[1], slotted[3], slotted[4]]);
    expect(levelTargets(slotted, groups, [3, 0, 1, 2], 2)).toEqual([slotted[0], slotted[3]]);

    // Built up over four groups, never one alternative without the other.
    const onLevel = vi.fn();
    const r = markovBuiltUp(data, prices, white, slotted, fromWhite, { onLevel });
    expect(r).toMatchObject({ feasible: true, bound: 'exact' });
    expect(onLevel).toHaveBeenLastCalledWith(6, 6);
    const pair = [slotted[1], slotted[4]];
    for (const t of callTargets()) expect(pair.filter((p) => t.includes(p!)).length % 2).toBe(0);
    expect(callTargets().slice(0, 4).map((t) => t.length)).toEqual([1, 2, 1, 1]);
  });
});

describe('a craft that is solved once, as before', () => {
  const stand: MarkovResult = { expectedCost: 1, feasible: true, converged: true, bound: 'exact', nodes: [], edges: [], policy: new Map() };
  /** One plain solve, on exactly the caller's craft and options, its answer given as is. */
  const once = (start: ItemState, t: readonly TierTarget[], opts: MarkovOptions) => {
    solves.mockClear();
    solves.mockImplementation(() => stand);
    const onLevel = vi.fn();
    const r = markovBuiltUp(data, prices, start, t, opts, { onLevel });
    expect(r).toBe(stand);
    expect(solves).toHaveBeenCalledTimes(1);
    const [, , s, tt, o] = solves.mock.calls[0]!;
    expect(s).toBe(start);
    expect(tt).toBe(t);
    expect(o).toBe(opts);
    expect(onLevel).not.toHaveBeenCalled();
  };

  it('fewer than four slot groups, alternatives counted as one', () => {
    once(white, targets.slice(0, 3), fromWhite);
    once(white, [...targets.slice(0, 2), { ...targets[2]!, slot: 1 }, { ...targets[3]!, slot: 1 }], fromWhite);
  });
  it('a craft that cannot start over', () => {
    const { restartCost: _restartCost, ...noRestart } = fromWhite;
    once(white, targets, noRestart);
  });
  it('an item that already holds a modifier', () => {
    const mod = data.mods.get(base.pools.normal.suffixes[2]!)!;
    once({ ...white, rarity: 'rare', suffixes: [{ modId: mod.id, tierName: mod.tiers[0]!.name }] }, targets, fromWhite);
  });
  it('value iteration, or a policy costed by iterating', () => {
    once(white, targets, { ...fromWhite, solver: 'value' });
    once(white, targets, { ...fromWhite, iterativeEval: true });
  });
  it('a seed the caller already gives', () => {
    once(white, targets, { ...fromWhite, heuristicSeed: true });
    once(white, targets, { ...fromWhite, seedFrom: plain.r.routes! });
  });

  it('gives exactly the plain solve’s answer, for real', () => {
    const three = targets.slice(0, 3);
    const onLevel = vi.fn();
    const got = markovBuiltUp(data, prices, white, three, fromWhite, { onLevel });
    expect(solves).toHaveBeenCalledTimes(1);
    expect(onLevel).not.toHaveBeenCalled();
    expect(got).toEqual(markovFromItem(data, prices, white, three, fromWhite));
  });
});

describe('the bone-free-first solve, built up', () => {
  it('builds up a craft that takes no bone path', () => {
    const onLevel = vi.fn();
    const r = markovBoneFreeFirst(data, prices, white, targets, fromWhite, { smaller: { onLevel } });
    expect(onLevel).toHaveBeenLastCalledWith(6, 6);
    expect(r.bones).toBeUndefined();
    expect(rel(r.expectedCost, plain.r.expectedCost)).toBeLessThan(1e-9);
  });

  it('builds up the solve without bones, and seeds the one with them from it as before', () => {
    // The same craft with the Wand's bone in play (the frozen sheet prices it).
    const withBones: MarkovOptions = { restartCost: 0, solver: 'policy', tolerance: 1e-9 };
    const free = markovFromItem(data, prices, white, targets, { ...withBones, policy: noBones, keepRoutes: true });
    const before = markovFromItem(data, prices, white, targets, { ...withBones, seedFrom: free.routes! });
    expect(before).toMatchObject({ feasible: true, bound: 'exact', bones: 'optional' });

    const onLevel = vi.fn();
    const first = vi.fn();
    const r = markovBoneFreeFirst(data, prices, white, targets, withBones, { onProgress: first, smaller: { onLevel } });
    expect(onLevel).toHaveBeenLastCalledWith(6, 6);
    expect(first).toHaveBeenCalled();
    expect(r).toMatchObject({ feasible: true, bound: 'exact', bones: 'optional' });
    expect(r.withoutBones).toBeUndefined();
    expect(rel(r.expectedCost, before.expectedCost)).toBeLessThan(1e-9);
  });
});
