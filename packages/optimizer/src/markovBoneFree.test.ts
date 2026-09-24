import { describe, it, expect, vi } from 'vitest';
import { loadShippedPatch } from '../../engine/src/loadPatch.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { boneRole, markovFromItem } from './markovFromItem.ts';
import { BONE_KEYS, lowerCeiling, markovBoneFreeFirst } from './markovBoneFree.ts';
import { projectPlan } from './markovSeed.ts';
import { FLAG_NONE, decodeState } from './markovState.ts';

// Real data and the frozen sheet, which prices a Wand's bone (0.2 ex): three Wand targets one tier below
// the top, from a white base — a craft that settles in under a second, so a 1 ms clock is what runs it out.
const data = loadShippedPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const base = data.bases.get('Wands')!;
const tierBelowTop = (id: string) => ({ modId: id, minTierIndex: data.mods.get(id)!.tiers.length - 2 });
const targets = [...base.pools.normal.prefixes.slice(0, 2), ...base.pools.normal.suffixes.slice(0, 1)].map(tierBelowTop);
const white: ItemState = { base, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const fromWhite = { restartCost: 0, solver: 'policy' as const, keepRoutes: true };
const carvedTarget = { modId: base.pools.desecrated.suffixes[0]!, minTierIndex: 0 };

const withBones = markovFromItem(data, prices, white, targets, fromWhite);
const withoutAny = markovFromItem(data, prices, white, targets, { ...fromWhite, policy: { excluded: new Set(BONE_KEYS) } });

describe('whether bones are in a craft, before it is solved', () => {
  it('says optional for a priced bone, required for a desecrated target, and nothing once excluded', () => {
    expect(boneRole(data, prices, white, targets)).toBe('optional');
    expect(boneRole(data, prices, white, [...targets.slice(0, 2), carvedTarget])).toBe('required');
    expect(boneRole(data, prices, white, targets, { excluded: new Set(BONE_KEYS) })).toBeUndefined();
    // …and the solve says the same on its answer.
    expect(withBones).toMatchObject({ feasible: true, bound: 'exact', bones: 'optional' });
    expect(withoutAny.bones).toBeUndefined();
  });
});

describe('a craft with bones, solved from the plan without them', () => {
  it('reads the plan without bones at every state of the lattice with them that has a counterpart', () => {
    const free = withoutAny.routes!;
    const bones = withBones.routes!;
    const moveAt = projectPlan(free, bones.positions, bones.keys);
    const read = new Set<string>();
    bones.keys.forEach((k, i) => {
      const m = moveAt(i);
      const flagged = decodeState(k).flagged !== FLAG_NONE;
      // A state a bone marked has no counterpart; every other one reads the move of its twin.
      if (flagged) expect(m).toBeUndefined();
      if (m) read.add(JSON.stringify(m));
    });
    // Every move the plan without bones plays is read somewhere, and nothing it does not play.
    const plays = new Set([...free.act].filter((a) => a >= 0).map((a) => JSON.stringify(free.actions[a])));
    expect(read).toEqual(plays);
    // The positions line up by the mods they hold, whatever their order: each twin state has a move.
    const withMoves = [...free.act].filter((a) => a >= 0).length;
    expect(bones.keys.filter((_, i) => moveAt(i) !== undefined).length).toBeGreaterThanOrEqual(withMoves);
  });

  it('seeded from the plan without bones, reaches the same exact answer as the two-phase solve', () => {
    expect(withoutAny).toMatchObject({ feasible: true, bound: 'exact' });
    expect(withoutAny.expectedCost).toBeGreaterThan(withBones.expectedCost);
    const seeded = markovFromItem(data, prices, white, targets, { ...fromWhite, seedFrom: withoutAny.routes! });
    expect(seeded.bound).toBe('exact');
    expect(seeded.expectedCost).toBeCloseTo(withBones.expectedCost, 6);

    const first = vi.fn();
    const got = markovBoneFreeFirst(data, prices, white, targets, fromWhite, { onProgress: first });
    expect(first).toHaveBeenCalled();
    expect(got.withoutBones).toBeUndefined();
    expect(got.expectedCost).toBeCloseTo(withBones.expectedCost, 6);
  });

  it('answers with the plan without bones, as a ceiling, when the solve with them still runs out', () => {
    // The plan without bones on a clock of its own; the solve with them on 1 ms.
    const got = markovBoneFreeFirst(data, prices, white, targets, { ...fromWhite, maxMillis: 1 }, {});
    expect(got).toMatchObject({ feasible: true, bound: 'upper', converged: false, withoutBones: true });
    expect(got.expectedCost).toBeCloseTo(withoutAny.expectedCost, 9);
    // Never below the craft's real cost: a plan without bones is one the craft with them can play.
    expect(got.expectedCost).toBeGreaterThanOrEqual(withBones.expectedCost);
    // …and it is that plan, to follow: no Desecration in it, and its route kept.
    expect([...got.policy.values()].some((a) => a.currency === 'desecrate')).toBe(false);
    expect(got.routes).toBeDefined();
    expect(got.stoppedEarly).toBeUndefined();
  });

  it('keeps the solve’s own ceiling when it is already the lower one', () => {
    const answer = (bound: 'exact' | 'upper', expectedCost: number, feasible = true) =>
      ({ ...withBones, feasible, bound, expectedCost, converged: bound === 'exact' });
    const settledFree = answer('exact', 928.5);
    // Ran out at 887, under the plan without bones: its own ceiling is the better answer.
    expect(lowerCeiling(answer('upper', 887), settledFree).expectedCost).toBe(887);
    expect(lowerCeiling(answer('upper', 887), settledFree).withoutBones).toBeUndefined();
    // Ran out at 1,399: the plan without bones is.
    expect(lowerCeiling(answer('upper', 1_399), settledFree)).toMatchObject({ expectedCost: 928.5, bound: 'upper', withoutBones: true });
    // Nothing at all: the plan without bones, however dear.
    expect(lowerCeiling(answer('exact', Infinity, false), settledFree)).toMatchObject({ expectedCost: 928.5, withoutBones: true });
    // A plan without bones that did not settle is no ceiling: the first answer stands.
    expect(lowerCeiling(answer('upper', 1_399), answer('upper', 950)).expectedCost).toBe(1_399);
  });

  it('solves once, as before, a craft that needs a bone or starts from an item held', () => {
    const first = vi.fn();
    const needs = markovBoneFreeFirst(
      data, prices, white, [...targets.slice(0, 2), carvedTarget], { ...fromWhite, maxMillis: 1 }, { onProgress: first });
    expect(needs).toMatchObject({ feasible: false, stoppedEarly: true, bones: 'required' });
    expect(needs.withoutBones).toBeUndefined();

    // From an item held the solve climbs and stops on a floor; nothing to seed, and no ceiling.
    const held: ItemState = { ...white, rarity: 'rare' };
    const floor = markovBoneFreeFirst(data, prices, held, targets, { solver: 'policy', maxMillis: 1 }, { onProgress: first });
    expect(floor.withoutBones).toBeUndefined();
    expect(floor.bound).toBe('lower');
    expect(first).not.toHaveBeenCalled();
  });
});
