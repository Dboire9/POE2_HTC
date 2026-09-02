import { describe, it, expect } from 'vitest';
import type { ItemState, PatchData } from '../../engine/src/index.ts';
import { loadPatch, planStates } from '../../engine/src/index.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import type { Prices } from './cost.ts';
import { loadPrices } from './loadPrices.ts';
import { leverOptions } from './levers.ts';

const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');
const wand = data.bases.get('Wands')!;
const P = wand.pools.normal.prefixes;
const S = wand.pools.normal.suffixes;
const held = (ids: string[], suf: string[] = []): ItemState => ({
  base: wand, level: 82, rarity: 'rare',
  prefixes: ids.map((id) => ({ modId: id, tierName: data.mods.get(id)!.tiers[0]!.name })),
  suffixes: suf.map((id) => ({ modId: id, tierName: data.mods.get(id)!.tiers[0]!.name })),
});

/** The item an option leaves behind. Two identical steps, so `planStates[1]` is the state after one. */
const after = (d: PatchData, s: ItemState, step: PlanStep): ItemState => planStates(d, s, [step, step])[1]!;

/**
 * THE INVARIANT THE WHOLE DECOMPOSITION RESTS ON.
 *
 * `leverDp.ts` may price a step's options one at a time, against a state computed once for the whole
 * skeleton, ONLY because none of the levers changes what the step leaves behind. That is a property of
 * today's `applyStep`, which reads `currency` / `remove` / `add` / `adds` / `essenceTier` and nothing
 * else — not a law of the game, and not something a comment can enforce.
 *
 * A lever that broke it would not throw or fail to compile. It would silently produce a frontier
 * computed against the wrong item, which is the worst failure this codebase can have: a confident
 * wrong number. There is a real candidate sitting in the price sheet already — an Omen of Greater
 * Exaltation adds TWO mods, so it can never be a lever here — and `essenceTier` is genuinely read by
 * `applyStep`, which is why an essence LEVEL is chosen per craft by `cheapestEssenceLevel` instead.
 *
 * So the invariant is asserted, over every currency the from-item planner emits, on real data.
 */
describe('leverOptions — a lever changes the odds and the price, never the outcome', () => {
  const cases: { name: string; state: ItemState; step: PlanStep }[] = [
    { name: 'exalt (strength x side omen)', state: held([P[0]!]), step: { currency: 'exalt', add: S[0]!, minTierIndex: 5 } },
    { name: 'chaos (strength)', state: held([P[0]!]), step: { currency: 'chaos', remove: P[0]!, add: P[1]!, minTierIndex: 5 } },
    { name: 'regal from magic', state: { ...held([P[0]!]), rarity: 'magic' }, step: { currency: 'regal', add: S[0]!, minTierIndex: 5 } },
    { name: 'annul (Omen of Light)', state: held([P[0]!, P[1]!]), step: { currency: 'annul', remove: P[0]! } },
    { name: 'exalt, any tier', state: held([P[0]!]), step: { currency: 'exalt', add: S[0]!, minTierIndex: 0 } },
  ];

  for (const c of cases) {
    it(`leaves the same item behind: ${c.name}`, () => {
      const opts = leverOptions(data, prices, c.state, c.step);
      expect(opts.length).toBeGreaterThan(0);
      const want = after(data, c.state, c.step);
      for (const o of opts) expect(after(data, c.state, o.step)).toEqual(want);
    });
  }

  it('never offers an option that cannot happen', () => {
    for (const c of cases) for (const o of leverOptions(data, prices, c.state, c.step)) expect(o.prob).toBeGreaterThan(0);
  });
});

describe('leverOptions — what it refuses to sell', () => {
  const step: PlanStep = { currency: 'exalt', add: S[0]!, minTierIndex: 5 };
  const state = held([P[0]!]);

  /**
   * `stepCost` charges 0 for a key the sheet omits, so an unlisted Perfect orb would be FREE and would
   * dominate every option it met. Skipping it is the only safe reading: falling back to the base price
   * would under-bill it instead, which is the bug this work had to fix in `currencyKey` first.
   */
  it('skips a strength the sheet does not price, rather than charging 0 for it', () => {
    const thin: Prices = { currency: { exalt: 1 }, omens: {} };
    const opts = leverOptions(data, thin, state, step);
    expect(opts.every((o) => ('tier' in o.step ? o.step.tier : undefined) === undefined)).toBe(true);
    expect(opts.every((o) => o.cost === 1)).toBe(true);
  });

  it('honours an exclusion, through the same function the frontier filters with', () => {
    const open = leverOptions(data, prices, state, step);
    const shut = leverOptions(data, prices, state, step, { excluded: new Set(['exalt_greater', 'exalt_perfect']) });
    expect(open.length).toBeGreaterThan(shut.length);
    expect(shut.every((o) => ('tier' in o.step ? o.step.tier : undefined) === undefined)).toBe(true);
  });

  it('drops an Omen of Light on an item no Desecration has touched', () => {
    const opts = leverOptions(data, prices, held([P[0]!, P[1]!]), { currency: 'annul', remove: P[0]! });
    expect(opts.length).toBe(1);
    expect('omen' in opts[0]!.step ? opts[0]!.step.omen : undefined).toBeUndefined();
  });
});

/**
 * The reason this module does not call `legalOrbTiers`.
 *
 * That function decides which strengths are legal from the target's MINIMUM tier: it reads
 * `tiers[minTierIndex].ilvl`, and for an any-tier target that is about 1, below every strength floor,
 * so it concludes `['base']`. But a Greater orb is perfectly legal on an any-tier target — a better
 * tier still satisfies "any tier or better". Reusing it here would have shipped the orb-strength axis
 * as a no-op for the commonest from-item target there is.
 *
 * It is a real two-way trade, not a free upgrade: a higher floor deletes a mod's own low tiers from
 * the pool as well as everyone else's, so it lands some targets more often and some less. That is
 * exactly the kind of question to answer by computing the probability rather than by arithmetic on a
 * tier index, which is what this module does.
 */
describe('leverOptions — an any-tier target still has an orb-strength choice', () => {
  it('offers more than base strength where the search used to offer only base', () => {
    const anyTier: PlanStep = { currency: 'exalt', add: S[0]!, minTierIndex: 0 };
    const opts = leverOptions(data, prices, held([P[0]!]), anyTier);
    const strengths = new Set(opts.map((o) => ('tier' in o.step ? o.step.tier : undefined) ?? 'base'));
    expect(strengths.size).toBeGreaterThan(1);
    // And the odds really do move, in both directions across targets — so it is a trade, not a freebie.
    expect(new Set(opts.map((o) => o.prob)).size).toBeGreaterThan(1);
  });
});

// --- Omen of Whittling: offered only when it is PRICED ------------------------------------------
// The omen is not in the shipped `omenQuotes` — poe.ninja serves no omen endpoint, so those are
// hand-transcribed and this one has never been. `stepCost` charges 0 for a missing key, so an ungated
// Whittling would come back FREE and dominate every chaos step it touched. The gate is what keeps the
// mechanic dormant until a real quote exists, and this pins both halves of it.
describe('Omen of Whittling — priced or not offered', () => {
  const withWhittling = (p: Prices, price: number): Prices =>
    ({ ...p, omens: { ...p.omens, OmenofWhittling: price } });

  // Two prefixes, deliberately placed at DIFFERENT tiers so one is unambiguously the lowest level.
  const twoTiered = (): ItemState => {
    const [a, b] = [P[0]!, P[1]!];
    const modA = data.mods.get(a)!;
    const modB = data.mods.get(b)!;
    return {
      base: wand, level: 82, rarity: 'rare',
      prefixes: [
        { modId: a, tierName: modA.tiers[0]!.name },                              // lowest ilvl
        { modId: b, tierName: modB.tiers[modB.tiers.length - 1]!.name },          // highest ilvl
      ],
      suffixes: [{ modId: S[0]!, tierName: data.mods.get(S[0]!)!.tiers[Math.min(2, data.mods.get(S[0]!)!.tiers.length - 1)]!.name }],
    };
  };

  it('is absent from the shipped sheet, so no chaos step gets an omen variant today', () => {
    expect(prices.omens['OmenofWhittling']).toBeUndefined();
    const state = twoTiered();
    const step: PlanStep = { currency: 'chaos', remove: P[0]!, add: S[1]! };
    const opts = leverOptions(data, prices, state, step);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts.some((o) => 'omen' in o.step && o.step.omen === 'whittling')).toBe(false);
  });

  it('appears once priced, charging the omen on top of the orb', () => {
    const state = twoTiered();
    const step: PlanStep = { currency: 'chaos', remove: P[0]!, add: S[1]! };
    const priced = withWhittling(prices, 500);
    const opts = leverOptions(data, priced, state, step);
    const plain = opts.find((o) => !('omen' in o.step && o.step.omen === 'whittling'))!;
    const whittled = opts.find((o) => 'omen' in o.step && o.step.omen === 'whittling');
    expect(whittled, 'a whittling variant is offered').toBeDefined();
    expect(whittled!.cost).toBeCloseTo(plain.cost + 500, 9);
  });

  it('buys a strictly better chance when the removal target IS the lowest-level mod', () => {
    const state = twoTiered();
    // P[0] sits at the mod's lowest tier, so it is the item's lowest-level modifier.
    const step: PlanStep = { currency: 'chaos', remove: P[0]!, add: S[1]! };
    const opts = leverOptions(data, withWhittling(prices, 500), state, step);
    const plain = opts.find((o) => o.step.currency === 'chaos' && !('omen' in o.step && o.step.omen === 'whittling'))!;
    const whittled = opts.find((o) => 'omen' in o.step && o.step.omen === 'whittling')!;
    // Three mods on the item, so an unomened chaos removes this one 1 time in 3; Whittling takes it
    // every time. The ADD half is identical, so the ratio is exactly 3.
    expect(whittled.prob / plain.prob).toBeCloseTo(3, 9);
  });

  it('is pruned when the removal target is NOT the lowest — P=0, so it never reaches the DP', () => {
    const state = twoTiered();
    // P[1] is at its highest tier, so it is not the lowest-level mod: Whittling cannot take it.
    const step: PlanStep = { currency: 'chaos', remove: P[1]!, add: S[1]! };
    const opts = leverOptions(data, withWhittling(prices, 500), state, step);
    expect(opts.some((o) => 'omen' in o.step && o.step.omen === 'whittling')).toBe(false);
  });
});
