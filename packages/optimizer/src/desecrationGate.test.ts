import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { bossOmenAllowed, desecrationBoneFor } from '../../engine/src/probability.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadPrices } from './loadPrices.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';
import { markovFromItem } from './markovFromItem.ts';

// The boss omens read "your next WEAPON OR JEWELLERY Desecration attempt will guarantee a random
// Ulaman/Amanamu/Kurgal modifier". Nothing gated on that, so the planners offered boss-targeted
// desecration on ARMOUR too — 342 of the 527 desecrated mods in the shipped data sit on armour bases,
// so roughly two thirds of desecrated crafts were being planned around a step the game refuses.
const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');

/**
 * A base of each kind, plus a desecrated mod from its pool and THREE rollable mods of distinct
 * families. Three, because a from-white craft only reaches Rare after transmute → augment → regal, and
 * a Desecration needs a Rare item — with fewer targets the desecrate step scores 0 and the frontier
 * comes back empty, which would make these assertions pass while proving nothing.
 */
const pick = (baseId: string) => {
  const base = data.bases.get(baseId)!;
  const des = base.pools.desecrated.prefixes[0] ?? base.pools.desecrated.suffixes[0]!;
  const desMod = data.mods.get(des)!;
  const used = new Set([desMod.family]);
  const take = (ids: readonly string[], n: number): string[] => {
    const out: string[] = [];
    for (const id of ids) {
      const m = data.mods.get(id);
      if (!m || m.source !== 'normal' || used.has(m.family)) continue;
      used.add(m.family);
      out.push(id);
      if (out.length === n) break;
    }
    return out;
  };
  const preNeed = desMod.type === 'prefix' ? 1 : 2; // keep within 3 per side once the desecrated lands
  const rollable = [...take(base.pools.normal.prefixes, preNeed), ...take(base.pools.normal.suffixes, 3 - preNeed)];
  return { base, des, rollable };
};
const WEAPON = pick('Wands');
const ARMOUR = pick('Body_Armours_dex_int');

describe('bone mapping, straight from the item text', () => {
  it('routes each gear kind to the bone that desecrates it', () => {
    expect(desecrationBoneFor('Wands')).toBe('jawbone');       // "a Rare Weapon or Quiver"
    expect(desecrationBoneFor('Quivers')).toBe('jawbone');
    expect(desecrationBoneFor('Body_Armours')).toBe('rib');    // "a Rare Armour"
    expect(desecrationBoneFor('Foci')).toBe('rib');
    expect(desecrationBoneFor('Amulets')).toBe('collarbone');  // "a Rare Amulet, Ring or Belt"
    expect(desecrationBoneFor('Rings')).toBe('collarbone');
  });

  // An unmapped category must not silently unlock boss targeting: claiming a plan works when the game
  // would refuse it is the worse failure, so the fallback is the armour one.
  it('treats an unknown category as armour rather than assuming the permissive case', () => {
    expect(desecrationBoneFor('SomeFutureCategory')).toBe('rib');
    expect(bossOmenAllowed('SomeFutureCategory')).toBe(false);
  });

  it('allows boss targeting exactly on Weapon or Jewellery', () => {
    expect(bossOmenAllowed('Wands')).toBe(true);
    expect(bossOmenAllowed('Amulets')).toBe(true);
    expect(bossOmenAllowed('Body_Armours')).toBe(false);
    expect(bossOmenAllowed('Helmets')).toBe(false);
  });
});

const bossSteps = (frontier: readonly { steps: readonly unknown[] }[]) =>
  frontier.flatMap((p) => p.steps).filter((s) => (s as { boss?: string }).boss !== undefined);

describe('from-white planner', () => {
  const targets = (p: typeof WEAPON) =>
    [...p.rollable.map((modId) => ({ modId, minTierIndex: 0 })), { modId: p.des, minTierIndex: 0 }];

  // The control: without it, the armour assertion below could pass simply because nothing desecrates.
  it('still boss-targets on a weapon', () => {
    const r = optimizePareto(data, prices, WEAPON.base, targets(WEAPON), { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    expect(bossSteps(r.frontier).length).toBeGreaterThan(0);
  });

  it('never boss-targets on armour, but still plans the untargeted draw', () => {
    const r = optimizePareto(data, prices, ARMOUR.base, targets(ARMOUR), { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0); // desecration still works there…
    expect(r.frontier.flatMap((p) => p.steps).some((s) => s.currency === 'desecrate')).toBe(true);
    expect(bossSteps(r.frontier)).toEqual([]); // …just not boss-targeted
  });
});

describe('from-item planner', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });

  it('still boss-targets on a weapon', () => {
    const r = optimizeFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect(bossSteps(r.frontier).length).toBeGreaterThan(0);
  });

  it('never boss-targets on armour', () => {
    const r = optimizeFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(bossSteps(r.frontier)).toEqual([]);
  });
});

describe('MDP', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });

  it('models a boss-targeted desecration on a weapon', () => {
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(true);
  });

  // REGRESSION. Gating the boss omen correctly is only half the fix: for a while the MDP's ONLY
  // desecrate action carried one, so armour lost the ability to desecrate at all and the planner
  // reported `feasible: false` for a craft the game performs happily. That is 342 of 527 desecrated
  // mods — the majority — told they were impossible.
  // SLOW ON PURPOSE, ~6-8s. Untargeted armour desecration has a minuscule per-attempt chance of
  // landing one specific mod, and value iteration's convergence rate is governed by exactly that — the
  // answer here is ~8.2 MILLION exalts. Loosening `tolerance` does not help (measured: same value, same
  // time at 1e-9, 1e-4 and 1e-2), so this needs the timeout, not a cheaper fixture. See TODO.md.
  it('plans armour with the untargeted draw instead of declining it', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
    expect(Number.isFinite(r.expectedCost)).toBe(true);
  }, 60_000);

  // …and it must be the UNTARGETED draw, not a boss omen smuggled in by the new action.
  it('never puts a boss omen in an armour policy', () => {  // same ~6-8s solve as above
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    const desecrations = [...r.policy.values()].filter((a) => a.currency === 'desecrate');
    expect(desecrations.length).toBeGreaterThan(0);
    expect(desecrations.every((a) => a.boss === undefined)).toBe(true);
  }, 60_000);

  // The control. A weapon must still be able to buy the narrower boss draw, or the assertion above
  // would pass simply because nothing anywhere targets a boss.
  it('still offers a boss-targeted desecration somewhere in a weapon policy', () => {
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect([...r.policy.values()].some((a) => a.currency === 'desecrate' && a.boss !== undefined)).toBe(true);
  });

  // A player who owns no omens at all still has a bone. Before the untargeted action existed, excluding
  // omens removed the last desecrate action on EVERY base, weapons included.
  it('keeps a desecrated target reachable when every omen is excluded', () => {
    const noOmens = { excluded: new Set(Object.keys(prices.omens)) };
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ], { policy: noOmens });
    expect(r.feasible).toBe(true);
  });
});

// Value iteration 0-initialises and climbs, so an UNCONVERGED result is a strict lower bound on the
// true expected cost, not an estimate. On an untargeted armour desecration the per-attempt chance of
// landing one specific mod is about 1 in 121,510, and VI's convergence rate is governed by exactly
// that — so it exhausts all 100k sweeps and returns a floor. `markovFromItem` used to report that
// number with no indication, and the UI printed it as a plain figure: the most precise-looking wrong
// number in the app. It now says so, and ItemActions renders "≥ x".
describe('MDP — convergence is reported, not assumed', () => {
  const start = (p: typeof WEAPON): ItemState => ({
    base: p.base, level: 82, rarity: 'rare',
    prefixes: [{ modId: p.rollable[0]!, tierName: data.mods.get(p.rollable[0]!)!.tiers.at(-1)!.name }],
    suffixes: [],
  });

  it('flags the armour solve as not converged', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(true);
    expect(r.converged).toBe(false);
  }, 60_000);

  // The control: an ordinary craft must still converge, or the flag would be useless noise.
  it('converges on a weapon, where the boss omen keeps the odds sane', () => {
    const r = markovFromItem(data, prices, start(WEAPON), [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 }, { modId: WEAPON.des, minTierIndex: 0 },
    ]);
    expect(r.converged).toBe(true);
  });

  // A rejected target never ran VI at all; reporting `converged: false` there would imply the number
  // was a floor when it is simply absent.
  it('reports a rejection as converged rather than as a floor', () => {
    const r = markovFromItem(data, prices, { ...start(WEAPON), rarity: 'magic' }, [
      { modId: WEAPON.rollable[0]!, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(false);
    expect(r.converged).toBe(true);
  });
});
