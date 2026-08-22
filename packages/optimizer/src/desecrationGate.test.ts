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

  // Every desecrate action the MDP models carries a boss omen, so on armour it cannot represent the
  // craft at all. Saying so beats inventing a policy the game would refuse — the linear planner above
  // still costs it with the untargeted draw.
  it('declines armour rather than planning an omen the game refuses, and says why', () => {
    const r = markovFromItem(data, prices, start(ARMOUR), [
      { modId: ARMOUR.rollable[0]!, minTierIndex: 0 }, { modId: ARMOUR.des, minTierIndex: 0 },
    ]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/Weapon or Jewellery/i);
  });
});
