import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { optimizePareto } from './optimize.ts';
import { optimizeFromItem } from './fromItem.ts';
import { markovFromItem } from './markovFromItem.ts';
import { loadPrices } from './loadPrices.ts';
import type { Prices } from './cost.ts';

// A Perfect Essence is a SWAP on a RARE item: it forces its own mod on (deterministic) while removing
// one existing mod uniformly at random — 1/(pf+sf), or 1/pf / 1/sf under a Crystallisation omen.
//
// Two things are pinned here. (1) An item carries at most ONE essence modifier, and REGULAR AND PERFECT
// COUNT TOGETHER — nothing enforced that, so all three planners would build a craft the game cannot
// hold. (2) The from-white search can now reach a perfect-essence target: since every mod on a
// from-white item is one you wanted, the essence necessarily eats a target, and the plan re-adds it.

const mk = (
  id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source'], weight = 100, ilvl = 1,
): Mod => ({
  id, source, type, family, tags: [], text: id,
  tiers: [{ name: id === 'PE1' ? 'Perfect Essence of Test' : 't1', ilvl, weight, ranges: [] }],
});

/**
 * Synthetic base with a hand-countable pool:
 *   normal prefixes [NP1, NP2]   normal suffixes [NS1]   essence pool [PE1 (perfect, prefix)]
 * Target {NP1, NP2, NS1, PE1} is the smallest craft that can reach a Perfect Essence from white:
 * three rollables to get Rare via transmute → augment → regal, then the essence.
 */
const base: ItemBase = {
  id: 'S', name: 'S', category: 'Wands',
  pools: {
    normal: { prefixes: ['NP1', 'NP2'], suffixes: ['NS1'] },
    desecrated: { prefixes: [], suffixes: [] },
    essence: { prefixes: ['PE1'], suffixes: [] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([
    ['NP1', mk('NP1', 'prefix', 'F1', 'normal')],
    ['NP2', mk('NP2', 'prefix', 'F2', 'normal')],
    ['NS1', mk('NS1', 'suffix', 'F3', 'normal')],
    ['PE1', mk('PE1', 'prefix', 'F4', 'perfect_essence', 0, 1)],
    ['PE2', mk('PE2', 'suffix', 'F5', 'perfect_essence', 0, 1)],
    ['ESS1', mk('ESS1', 'suffix', 'F6', 'essence')],
  ]),
  bases: new Map([['S', base]]),
};
// NOTE the omens are absent from the sheet, and `stepCost` prices a missing key at 0 — so the
// Crystallisation levers are FREE here, not unavailable. `withOmenVariants` enumerates them whatever
// they cost; only an explicit exclusion policy removes one. The tests below therefore say which case
// they are in rather than assuming the plain removal.
const prices: Prices = {
  currency: { transmute: 1, augment: 1, regal: 1, exalt: 1, annul: 1, chaos: 99, perfect_essence: 5 },
  omens: {},
};
const CRYSTALLISATION = ['OmenofSinistralCrystallisation', 'OmenofDextralCrystallisation'];
const noOmens = { excluded: new Set(CRYSTALLISATION) };
const targets = ['NP1', 'NP2', 'NS1', 'PE1'].map((modId) => ({ modId }));

describe('one essence modifier per item — regular and perfect counted together', () => {
  it('rejects two perfect essences from white', () => {
    const withBoth: PatchData = {
      ...data,
      bases: new Map([['S', { ...base, pools: { ...base.pools, essence: { prefixes: ['PE1'], suffixes: ['PE2'] } } }]]),
    };
    expect(() => optimizePareto(withBoth, prices, withBoth.bases.get('S')!, [
      { modId: 'NP1' }, { modId: 'NP2' }, { modId: 'NS1' }, { modId: 'PE1' }, { modId: 'PE2' },
    ])).toThrow(/at most one essence modifier/i);
  });

  it('rejects a regular essence combined with a perfect one', () => {
    expect(() => optimizePareto(data, prices, base, [
      { modId: 'NP1' }, { modId: 'ESS1' }, { modId: 'PE1' },
    ])).toThrow(/at most one essence modifier/i);
  });

  // The from-item planner built one `perfect-essence` op per perfect target, with no cap at all.
  it('rejects two perfect essences from an item', () => {
    const withBoth: PatchData = {
      ...data,
      bases: new Map([['S', { ...base, pools: { ...base.pools, essence: { prefixes: ['PE1'], suffixes: ['PE2'] } } }]]),
    };
    const b = withBoth.bases.get('S')!;
    const start: ItemState = {
      base: b, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'NP1', tierName: 't1' }, { modId: 'NP2', tierName: 't1' }],
      suffixes: [{ modId: 'NS1', tierName: 't1' }],
    };
    expect(() => optimizeFromItem(withBoth, prices, start, [{ modId: 'PE1' }, { modId: 'PE2' }]))
      .toThrow(/at most one essence modifier/i);
  });

  // …and the MDP gave each perfect target its own action, so its policy could stack them.
  it('rejects two perfect essences in the MDP', () => {
    const withBoth: PatchData = {
      ...data,
      bases: new Map([['S', { ...base, pools: { ...base.pools, essence: { prefixes: ['PE1'], suffixes: ['PE2'] } } }]]),
    };
    const b = withBoth.bases.get('S')!;
    const start: ItemState = {
      base: b, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'NP1', tierName: 't1' }], suffixes: [{ modId: 'NS1', tierName: 't1' }],
    };
    const r = markovFromItem(withBoth, prices, start, [{ modId: 'PE1' }, { modId: 'PE2' }]);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/at most one essence modifier/i);
  });
});

describe('from-white perfect essence — sacrifice and re-add', () => {
  const best = () => {
    const r = optimizePareto(data, prices, base, targets, { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    return r.frontier[r.frontier.length - 1]!; // the surest plan
  };

  it('plans exactly one Perfect Essence, and re-adds whatever it ate', () => {
    const plan = best();
    const essences = plan.steps.filter((s) => s.currency === 'perfect-essence');
    expect(essences).toHaveLength(1);
    const ess = essences[0] as { add: string; remove: string };
    expect(ess.add).toBe('PE1');
    // The victim is one of the mods already placed, and it must come back — it is a target.
    const essIdx = plan.steps.indexOf(essences[0]!);
    expect(plan.steps.slice(0, essIdx).some((s) => 'add' in s && s.add === ess.remove)).toBe(true);
    expect(plan.steps.slice(essIdx + 1).some((s) => s.currency === 'exalt' && s.add === ess.remove)).toBe(true);
  });

  it('charges the hand-computed 1/(pf+sf) when no Crystallisation omen is allowed', () => {
    const r = optimizePareto(data, prices, base, targets, { level: 82, policy: noOmens });
    const plan = r.frontier[r.frontier.length - 1]!;
    const essIdx = plan.steps.findIndex((s) => s.currency === 'perfect-essence');
    // The essence lands after transmute → augment → regal, so the item holds exactly 3 mods (2 prefixes
    // + 1 suffix) and an unconstrained removal is a uniform 1-of-3.
    expect(plan.steps.slice(0, essIdx)).toHaveLength(3);
    expect(plan.steps[essIdx]).not.toHaveProperty('omen');
    expect(plan.result.steps[essIdx]!.prob).toBeCloseTo(1 / 3, 12);
  });

  // The omen narrows the removal to one side: 1/sf. With a single suffix on the item that is P=1, and
  // the search takes it — here for free, since an unpriced omen costs 0.
  it('uses a Crystallisation omen to make the removal certain when it may', () => {
    const plan = best();
    const essIdx = plan.steps.findIndex((s) => s.currency === 'perfect-essence');
    const ess = plan.steps[essIdx] as { omen?: string; remove: string };
    expect(ess.omen).toBe('dextral');
    expect(ess.remove).toBe('NS1'); // the only suffix ⇒ 1/sf = 1
    expect(plan.result.steps[essIdx]!.prob).toBe(1);
  });

  it('never emits more than one Perfect Essence in any plan on the frontier', () => {
    const r = optimizePareto(data, prices, base, targets, { level: 82 });
    for (const plan of r.frontier) {
      expect(plan.steps.filter((s) => s.currency === 'perfect-essence').length).toBeLessThanOrEqual(1);
    }
  });

  // Reaching Rare takes three mods, and from white every one of them is a target. With fewer than
  // three rollables there is no ordering that gets the item Rare before the essence, so every plan
  // scores 0 — the same shape as the desecration case, and the UI must not call it impossible.
  it('finds nothing when there are too few rollable targets to reach Rare', () => {
    const r = optimizePareto(data, prices, base, [{ modId: 'NP1' }, { modId: 'PE1' }], { level: 82 });
    expect(r.frontier).toHaveLength(0);
  });
});

describe('the item-level gate that was missing', () => {
  // Every perfect-essence mod in the shipped data is ilvl 72. `essenceForcedProbability` gates regular
  // essences on `tier.ilvl > item.level`; the perfect-essence branch in plan.ts checked rarity, family
  // and slots but never the level, so below 72 it costed a step the game refuses.
  const gated: PatchData = {
    ...data,
    mods: new Map([...data.mods, ['PE1', mk('PE1', 'prefix', 'F4', 'perfect_essence', 0, 72)]]),
  };

  it('scores nothing at item level 71', () => {
    expect(optimizePareto(gated, prices, base, targets, { level: 71 }).frontier).toHaveLength(0);
  });

  it('but plans normally at 72', () => {
    expect(optimizePareto(gated, prices, base, targets, { level: 72 }).frontier.length).toBeGreaterThan(0);
  });
});

describe('on the shipped 0.5.0 data', () => {
  const real = loadPatch('data/patches/0.5.0');
  const realPrices = loadPrices('data/patches/0.5.0');

  it('plans a real Wand craft ending in a Perfect Essence', () => {
    const wand = real.bases.get('Wands')!;
    const PE = 'Wands/PerfectEssence_EssenceAbyss';
    const used = new Set([real.mods.get(PE)!.family]);
    const take = (ids: readonly string[], n: number): string[] => {
      const out: string[] = [];
      for (const id of ids) {
        const m = real.mods.get(id);
        if (!m || m.source !== 'normal' || used.has(m.family)) continue;
        used.add(m.family);
        out.push(id);
        if (out.length === n) break;
      }
      return out;
    };
    const roll = [...take(wand.pools.normal.prefixes, 2), ...take(wand.pools.normal.suffixes, 1)];
    const r = optimizePareto(real, realPrices, wand, [
      ...roll.map((modId) => ({ modId, minTierIndex: 0 })), { modId: PE, minTierIndex: 0 },
    ], { level: 82 });
    expect(r.frontier.length).toBeGreaterThan(0);
    const plan = r.frontier[r.frontier.length - 1]!;
    expect(plan.steps.filter((s) => s.currency === 'perfect-essence')).toHaveLength(1);
    // Priced from the sheet's per-mod key, not a flat level price — so it must be a real number.
    expect(Number.isFinite(plan.cost.expected)).toBe(true);
    expect(plan.cost.expected).toBeGreaterThan(0);
  });
});
