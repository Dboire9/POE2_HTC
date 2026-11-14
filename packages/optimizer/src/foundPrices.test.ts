import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { FOUND_BASE_WEIGHT, FOUND_PRICES, FOUND_WEIGHTS } from './foundPrices.ts';
import { pricesForBase, stepAvailable, stepCost, type Prices, type PricedStep } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { createActionSpace, type McAction } from './markovActions.ts';
import { markovFromItem } from './markovFromItem.ts';
import { optimizePareto } from './optimize.ts';
import { FLAG_NONE, decodeState, encodeState, sideIndexOf, type McTarget } from './markovState.ts';

// The FOUND sheet: starter recipes are planned on what a new player finds, not on what trade charges.
// These pin that it prices the found currency and nothing else, and that "nothing else" means
// UNAVAILABLE through the real gates — not free, and not merely absent from a table nobody reads.

const data = loadPatch('data/patches/0.5.0');
// The SHIPPED trade sheet, read only for its key names and as the control that proves each withheld
// step is real and reachable. No number from it is asserted.
const trade = loadPrices('data/patches/0.5.0');
const staves = data.bases.get('Quarterstaves')!;
const found = pricesForBase(FOUND_PRICES, staves);

const PHYS = 'Quarterstaves/LocalPhysicalDamage';
const SPEED = 'Quarterstaves/LocalIncreasedAttackSpeed';
const HASTE = 'Quarterstaves/Essence_IncreasedAttackSpeed'; // Lesser 22, Essence 37, Greater 60
const ABRASION = 'Quarterstaves/PerfectEssence_MartialWeaponGainedDamage'; // Perfect Essence of Abrasion
const ALLOY = 'Quarterstaves/PerfectEssence_SoulCore'; // Sovereign Alloy — priced as a Perfect Essence
const CARVED = 'Quarterstaves/Desecrated_LifeCost';

/** The found currency, by the trade sheet's own keys. Changing what the sheet lists means changing this. */
const LISTED = ['alchemy', 'augment', 'chaos', 'essence', 'essence_lesser', 'exalt', 'regal', 'transmute'];

describe('the found sheet prices exactly the currency a new player finds', () => {
  it('lists those eight keys and nothing else — no omen, no bone', () => {
    expect(Object.keys(FOUND_PRICES.currency).sort()).toEqual(LISTED);
    expect(FOUND_PRICES.omens).toEqual({});
    expect(FOUND_PRICES.bones).toBeUndefined();
  });

  it('spells every key the way the trade sheet does, so a typo cannot hide a currency', () => {
    expect(Object.keys(FOUND_PRICES.currency).filter((k) => trade.currency[k] !== undefined).sort()).toEqual(LISTED);
  });

  it('weighs each one above zero — a 0 would be "free on purpose", which nothing found is', () => {
    for (const w of Object.values(FOUND_WEIGHTS)) expect(w > 0 && Number.isFinite(w)).toBe(true);
    expect(FOUND_BASE_WEIGHT > 0 && Number.isFinite(FOUND_BASE_WEIGHT)).toBe(true);
  });

  // Data lives in JSON (CLAUDE.md): the weights are the file's, read here straight off the disk, and the
  // file sits outside `data/patches/`, which the daily price bot rewrites and stages.
  it('is built from data/found/prices.json, number for number', () => {
    const file = JSON.parse(readFileSync('data/found/prices.json', 'utf8')) as {
      prices: Record<string, number>; baseWeight: number; caveat: string; basis: string;
    };
    expect(FOUND_WEIGHTS).toEqual(file.prices);
    expect(FOUND_PRICES.currency).toEqual(file.prices);
    expect(FOUND_BASE_WEIGHT).toBe(file.baseWeight);
    expect(FOUND_PRICES.meta?.caveat).toBe(file.caveat);
    expect(file.basis).toBe('found');
    expect(FOUND_PRICES.meta?.basis).toBe('found');
  });

  it('says it is a judgement in scarcity weights, never an Exalted price', () => {
    expect(FOUND_PRICES.meta?.estimated).toBe(true);
    expect(FOUND_PRICES.meta?.unit).toMatch(/scarcity weight/);
    expect(FOUND_PRICES.meta?.caveat).toMatch(/judgement/);
  });
});

describe('through the real gates: what a beginner has is offered at its weight, the rest is not offered', () => {
  // `PricedStep`s — the fields pricing reads, the shape both planners hand the gate (a PlanStep
  // satisfies it, and the MDP's `pricedStepOf` builds exactly these). Base: a Quarterstaff, resolved
  // through `pricesForBase` as every solve does, so the bone question is asked of a real weapon.
  const offered: [string, PricedStep, number][] = [
    ['Transmute', { currency: 'transmute', add: PHYS }, 1],
    ['Augment', { currency: 'augment', add: SPEED }, 1],
    ['Regal', { currency: 'regal', add: SPEED }, 3],
    ['Exalt', { currency: 'exalt', add: SPEED }, 4],
    ['Alchemy', { currency: 'alchemy' }, 4],
    ['Chaos', { currency: 'chaos' }, 8],
    ['Lesser Essence', { currency: 'essence', add: HASTE, essenceLevel: 'lesser' }, 3],
    ['Essence', { currency: 'essence', add: HASTE, essenceLevel: 'normal' }, 6],
    ['throwaway Regal', { currency: 'throwaway', orb: 'regal' }, 3],
    ['throwaway Exalt', { currency: 'throwaway', orb: 'exalt' }, 4],
  ];
  it.each(offered)('%s', (_name, step, weight) => {
    expect(stepAvailable(found, undefined, step)).toBe(true);
    expect(stepCost(found, step)).toBe(weight);
  });

  const strengths = (['greater', 'perfect'] as const).flatMap((tier): [string, PricedStep][] => [
    [`${tier} Transmute`, { currency: 'transmute', add: PHYS, tier }],
    [`${tier} Augment`, { currency: 'augment', add: SPEED, tier }],
    [`${tier} Regal`, { currency: 'regal', add: SPEED, tier }],
    [`${tier} Exalt`, { currency: 'exalt', add: SPEED, tier }],
    [`${tier} Chaos`, { currency: 'chaos', tier }],
  ]);
  const withheld: [string, PricedStep][] = [
    ...strengths,
    ['Greater Essence', { currency: 'essence', add: HASTE, essenceLevel: 'greater' }],
    ['Perfect Essence', { currency: 'perfect-essence', add: ABRASION }],
    ['an Alloy', { currency: 'perfect-essence', add: ALLOY }],
    ['Annulment', { currency: 'annul' }],
    ['Annulment with Omen of Light', { currency: 'annul', omen: 'light' }],
    ['Sinistral Annulment', { currency: 'annul', omen: 'sinistral' }],
    ['Exalt with Sinistral Exaltation', { currency: 'exalt', add: PHYS, constrainTo: 'prefix' }],
    ['throwaway Exalt with Dextral Exaltation', { currency: 'throwaway', orb: 'exalt', constrainTo: 'suffix' }],
    ['Chaos with Whittling', { currency: 'chaos', omen: 'whittling' }],
    ['Greater Exaltation', { currency: 'greater-exalt' }],
    ['Desecration', { currency: 'desecrate', add: CARVED }],
    ['Desecration, Ancient bone', { currency: 'desecrate', add: CARVED, ancient: true }],
    ['Desecration with a boss omen', { currency: 'desecrate', add: CARVED, boss: 'liege' }],
    ['Desecration with Dextral Necromancy', { currency: 'desecrate', add: CARVED, constrainTo: 'suffix' }],
  ];
  it.each(withheld)('%s', (_name, step) => {
    expect(stepAvailable(found, undefined, step)).toBe(false);
    // The control: the trade sheet, resolved for the same base, does offer it — so the step is real and
    // it is the found sheet, not the step, that keeps it out.
    expect(stepAvailable(pricesForBase(trade, staves), undefined, step)).toBe(true);
  });
});

/** An MDP action the found sheet prices: a basic orb, a Lesser or middle Essence, a Chaos — or a restart. */
const playable = (a: McAction): boolean => {
  switch (a.currency) {
    case 'transmute': case 'augment': case 'regal': return a.strength === 'base';
    case 'exalt': return a.strength === 'base' && a.side === undefined;
    case 'essence': return a.level === 'lesser' || a.level === 'normal';
    case 'chaos': case 'restart': return true;
    default: return false;
  }
};

describe('the MDP offers nothing the found sheet does not price', () => {
  // Every kind of target, at an item level where every strength and bone grade can roll, from states
  // where every kind of action applies.
  const targets = [PHYS, SPEED, 'Quarterstaves/Essence_CriticalStrikeChanceIncrease', ABRASION, CARVED];
  const list: McTarget[] = targets.map((id) => {
    const mod = data.mods.get(id)!;
    return { mods: [{ mod, minIndex: 0 }], type: mod.type, fractured: false };
  });
  const states = [
    encodeState(0, 0, 0, 0, FLAG_NONE, 'normal'),
    encodeState(0, 0, 1, 0, FLAG_NONE, 'magic'),
    encodeState(1, 0, 0, 0, FLAG_NONE, 'magic'),
    encodeState(0, 0, 1, 1, FLAG_NONE, 'rare'),
    encodeState(1 | 2, 0, 1, 0, FLAG_NONE, 'rare'),
  ].map(decodeState);
  const actionsOn = (prices: Prices): McAction[] => {
    const space = createActionSpace({
      data, prices: pricesForBase(prices, staves), level: 82, pools: staves.pools, list,
      side: sideIndexOf(list), desecratable: true, bossTargetable: true,
    });
    return states.flatMap((s) => space.actionsOf(s).map((d) => d.action));
  };

  it('on the trade sheet these states reach every action a beginner lacks (the control)', () => {
    const acts = actionsOn(trade);
    for (const kind of ['annul', 'desecrate', 'perfect-essence'] as const) {
      expect(acts.some((a) => a.currency === kind)).toBe(true);
    }
    expect(acts.some((a) => 'strength' in a && a.strength !== 'base')).toBe(true);
    expect(acts.some((a) => a.currency === 'exalt' && a.side !== undefined)).toBe(true);
  });

  it('on the found sheet every action offered is one it prices', () => {
    const acts = actionsOn(FOUND_PRICES);
    expect(acts.length).toBeGreaterThan(0);
    expect(acts.filter((a) => !playable(a))).toEqual([]);
  });
});

describe('a real starter craft solves on the found sheet', () => {
  // A white Quarterstaff at item level 25: flat Physical Damage and Attack Speed, each at its second
  // tier or better (Burnished, of Ease) — the kind of first weapon a new player makes.
  const white: ItemState = { base: staves, level: 25, rarity: 'normal', prefixes: [], suffixes: [] };
  const targets = [{ modId: PHYS, minTierIndex: 1 }, { modId: SPEED, minTierIndex: 1 }];

  it('is feasible and exact, and its policy plays only what the sheet prices', () => {
    const r = markovFromItem(data, FOUND_PRICES, white, targets, { restartCost: FOUND_BASE_WEIGHT });
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('exact');
    expect(Number.isFinite(r.expectedCost)).toBe(true);
    const played = [...r.policy.values()];
    expect(played.some((a) => a.currency === 'transmute')).toBe(true);
    expect(played.filter((a) => !playable(a))).toEqual([]);
  });

  it('plays a Lesser Essence where the target names an essence modifier', () => {
    const r = markovFromItem(data, FOUND_PRICES, white, [{ modId: PHYS, minTierIndex: 1 }, { modId: HASTE, minTierIndex: 0 }],
      { restartCost: FOUND_BASE_WEIGHT });
    expect(r.feasible && r.bound === 'exact').toBe(true);
    const played = [...r.policy.values()];
    expect(played.some((a) => a.currency === 'essence' && a.level === 'lesser')).toBe(true);
    expect(played.filter((a) => !playable(a))).toEqual([]);
  });

  // REGRESSION (2026-11-14). Where the item level allows a GREATER Essence — which this sheet does not
  // price — the level choice used to pick it as "free" (`stepCost` reads an absent key as 0), the gate
  // then dropped it, and Lesser and middle were never offered: no plan at all from either planner.
  it('still plays a found Essence where the item level would allow an unpriced Greater one', () => {
    const high: ItemState = { ...white, level: 70 };
    const craft = [{ modId: PHYS, minTierIndex: 1 }, { modId: HASTE, minTierIndex: 0 }];
    const r = markovFromItem(data, FOUND_PRICES, high, craft, { restartCost: FOUND_BASE_WEIGHT });
    expect(r.feasible && r.bound === 'exact').toBe(true);
    const played = [...r.policy.values()];
    expect(played.some((a) => a.currency === 'essence')).toBe(true);
    expect(played.filter((a) => !playable(a))).toEqual([]);
    const { frontier } = optimizePareto(data, FOUND_PRICES, staves, craft, { level: 70 });
    expect(frontier.length).toBeGreaterThan(0);
    for (const plan of frontier) for (const step of plan.steps) expect(stepAvailable(found, undefined, step)).toBe(true);
  });

  it('the step routes for the same craft spend only what the sheet prices', () => {
    const { frontier } = optimizePareto(data, FOUND_PRICES, staves, targets, { level: 25 });
    expect(frontier.length).toBeGreaterThan(0);
    for (const plan of frontier) for (const step of plan.steps) expect(stepAvailable(found, undefined, step)).toBe(true);
  });
});
