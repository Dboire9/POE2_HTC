import { describe, it, expect, vi } from 'vitest';
import { loadShippedPatch } from '../../engine/src/loadPatch.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';
import { BONE_KEYS, lowerCeiling, markovWithBoneFreeCeiling } from './markovBoneFree.ts';

// Real data and the frozen sheet, which prices a Wand's bone (0.2 ex): three Wand targets one tier below
// the top, from a white base — a craft that settles in under a second, so a 1 ms clock is what runs it out.
const data = loadShippedPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const base = data.bases.get('Wands')!;
const tierBelowTop = (id: string) => ({ modId: id, minTierIndex: data.mods.get(id)!.tiers.length - 2 });
const targets = [...base.pools.normal.prefixes.slice(0, 2), ...base.pools.normal.suffixes.slice(0, 1)].map(tierBelowTop);
const white: ItemState = { base, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const fromWhite = { restartCost: 0, solver: 'policy' as const, keepRoutes: true };

const withBones = markovFromItem(data, prices, white, targets, fromWhite);
const withoutAny = markovFromItem(data, prices, white, targets, { ...fromWhite, policy: { excluded: new Set(BONE_KEYS) } });

describe('a ceiling without bones, for a craft the solve with them could not settle', () => {
  it('knows the bones are optional here, and that they only make the craft cheaper', () => {
    expect(withBones).toMatchObject({ feasible: true, bound: 'exact', bones: 'optional' });
    expect(withoutAny).toMatchObject({ feasible: true, bound: 'exact' });
    expect(withoutAny.bones).toBeUndefined();
    expect(withoutAny.expectedCost).toBeGreaterThan(withBones.expectedCost);
  });

  it('answers a run-out craft with the plan without bones, as a ceiling, on a clock of its own', () => {
    const ranOut = markovFromItem(data, prices, white, targets, { ...fromWhite, maxMillis: 1 });
    expect(ranOut).toMatchObject({ feasible: false, stoppedEarly: true, bones: 'optional' });

    const second = vi.fn();
    const got = markovWithBoneFreeCeiling(data, prices, white, targets, { ...fromWhite, maxMillis: 1 }, { onProgress: second });
    expect(got).toMatchObject({ feasible: true, bound: 'upper', converged: false, withoutBones: true });
    expect(second).toHaveBeenCalled();
    expect(got.expectedCost).toBeCloseTo(withoutAny.expectedCost, 9);
    // Never below the craft's real cost: a plan without bones is one the craft with them can play.
    expect(got.expectedCost).toBeGreaterThanOrEqual(withBones.expectedCost);
    // …and it is that plan, to follow: no Desecration in it, and its route kept.
    expect([...got.policy.values()].some((a) => a.currency === 'desecrate')).toBe(false);
    expect(got.routes).toBeDefined();
    expect(got.stoppedEarly).toBeUndefined();
  });

  it('keeps the first solve’s own ceiling when it is already the lower one', () => {
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

  it('leaves a settled answer alone, and never answers without bones where the craft needs one or holds an item', () => {
    const settled = markovWithBoneFreeCeiling(data, prices, white, targets, fromWhite, {});
    expect(settled.withoutBones).toBeUndefined();
    expect(settled.expectedCost).toBe(withBones.expectedCost);

    // A desecrated target: only a bone can land it, so a solve without bones is not even tried.
    const carvedTarget = { modId: base.pools.desecrated.suffixes[0]!, minTierIndex: 0 };
    const second = vi.fn();
    const needs = markovWithBoneFreeCeiling(
      data, prices, white, [...targets.slice(0, 2), carvedTarget], { ...fromWhite, maxMillis: 1 }, { onProgress: second });
    expect(needs).toMatchObject({ feasible: false, stoppedEarly: true, bones: 'required' });
    expect(needs.withoutBones).toBeUndefined();
    expect(second).not.toHaveBeenCalled();

    // From an item held, the solve climbs and stops on a floor; a ceiling from elsewhere is not its answer.
    const held: ItemState = { ...white, rarity: 'rare' };
    const floor = markovWithBoneFreeCeiling(data, prices, held, targets, { solver: 'policy', maxMillis: 1 }, {});
    expect(floor.withoutBones).toBeUndefined();
    expect(floor.bound).toBe('lower');
  });
});
