import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import { listPerfectEssences } from './engine.ts';
import { modSourceLabel } from './engineMap.ts';
import { whyNotAdd } from './targetSlots.ts';
import type { EngineMod } from './engineTypes.ts';

/**
 * ALLOYS are a Runes of Aldur currency (RePoE `CurrencyVerisiumAlloy1..13`, tagged
 * `verisium_common`…`mythic`). poe2db files their outcomes in the same `perfect_essence` pool the
 * parser reads, because they share a mechanic — `Removes: true` on both, against `false` on the 1,676
 * regular-essence rows — so the app has always planned them correctly.
 *
 * What it got wrong was their IDENTITY and their PRICE. `apply_pools.mjs` prepended "Perfect Essence
 * of" to every row in that pool, so `href="Runic_Alloy"` became "Perfect Essence of Runic Alloy" — a
 * string that exists nowhere in poe2db or the game. And `essenceId` asked poe.ninja for
 * `perfect-essence-of-runic-alloy`, which matches nothing, so all 272 Alloy mods fell through to the
 * level median: ONE fabricated price, 4.331 ex, against a real spread of 3.6 ex to 2,261 ex. On a Wand
 * 8 of 11 perfect-essence targets are Alloys, and the optimizer RANKS by cost.
 */
const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');
const alloys = [...data.mods.values()].filter((m) => m.alloy === true);
const perfects = [...data.mods.values()].filter((m) => m.source === 'perfect_essence' && m.alloy !== true);

describe('Alloys — identity', () => {
  it('separates the two currencies that share the perfect-essence pool', () => {
    expect(alloys.length).toBeGreaterThan(200);
    expect(perfects.length).toBeGreaterThan(100);
  });

  // BOTH directions. A rule that stripped the prefix from everything would pass a one-sided test.
  it('names an Alloy what the game names it, and leaves a Perfect Essence alone', () => {
    for (const m of alloys) {
      expect(m.tiers[0]!.name).not.toMatch(/^Perfect Essence of/);
      expect(m.tiers[0]!.name).toMatch(/Alloy$/);
    }
    for (const m of perfects) expect(m.tiers[0]!.name).toMatch(/^Perfect Essence of /);
  });

  it('finds all thirteen', () => {
    const names = new Set(alloys.map((m) => m.tiers[0]!.name));
    expect(names.size).toBe(13);
    expect(names).toContain('Celestial Alloy');
    expect(names).toContain('The Runebinders Alloy');
  });

  // The engine's source stays `perfect_essence`, so every planner treats the two identically; only the
  // UI's source splits. Getting this backwards would change the mechanic instead of the label.
  it('keeps the engine source, and splits only the UI one', () => {
    for (const m of alloys) expect(m.source).toBe('perfect_essence');
    const listed = listPerfectEssences(data, 'Wands');
    expect(listed.some((m) => m.source === 'alloy')).toBe(true);
    expect(listed.some((m) => m.source === 'perfect')).toBe(true);
    expect(modSourceLabel('alloy')).toBe(' · Alloy');
  });
});

describe('Alloys — price', () => {
  const priceOf = (id: string): number | undefined => prices.currency[`essence:perfect:${id}`];

  it('prices every one of them', () => {
    for (const m of alloys) expect(priceOf(m.id)).toBeGreaterThan(0);
  });

  /**
   * Shape, not numbers. These move daily and CLAUDE.md is explicit that a test asserting an EXACT cost
   * must read `loadFrozenPrices()`; the claim here is that Alloys are priced INDIVIDUALLY, which the
   * one-distinct-value state falsified and any live sheet should satisfy.
   */
  it('gives them their own prices rather than one fabricated fallback', () => {
    const vals = alloys.map((m) => priceOf(m.id)!);
    const distinct = new Set(vals);
    expect(distinct.size).toBeGreaterThanOrEqual(8); // was exactly 1
    expect(Math.max(...vals) / Math.min(...vals)).toBeGreaterThan(20);
    // …and specifically not the generic key they used to collapse onto.
    expect(distinct.has(prices.currency.perfect_essence!)).toBe(false);
  });

  // An Alloy never needs the fallback, so the only question is whether it should SHAPE one. It should
  // not: `perfect_essence` is what an unknown PERFECT ESSENCE costs, and an Alloy is not one.
  it('leaves the generic perfect-essence fallback to perfect essences', () => {
    const flat = prices.currency.perfect_essence!;
    const real = perfects.map((m) => priceOf(m.id)).filter((v): v is number => v !== undefined).sort((a, b) => a - b);
    expect(flat).toBeGreaterThanOrEqual(real[0]!);
    expect(flat).toBeLessThanOrEqual(real.at(-1)!);
  });
});

describe('Alloys — the rule that had to be preserved on purpose', () => {
  const mod = (id: string, source: EngineMod['source']): EngineMod => ({
    id, text: id, type: 'prefix', family: `Fam_${id}`, source,
    tiers: [{ display: 1, name: id, ilvl: 1, label: id, range: '', values: [] }],
  });
  const byId = (...ms: EngineMod[]) => new Map(ms.map((m) => [m.id, m]));

  /**
   * `whyNotAdd` caps an item at one essence modifier. It tested `source === 'essence' || 'perfect'` —
   * a COMPARISON, not a switch, so adding `'alloy'` to the union did not make the compiler ask about
   * it. Leaving it out would have let a player request two, a rule change smuggled in as a rename.
   * Whether the cap really covers Alloys is untraced; today's behaviour is what this pins.
   */
  it('still refuses a second essence modifier when the first is an Alloy', () => {
    const a = mod('a', 'alloy');
    const b = mod('b', 'perfect');
    expect(whyNotAdd(b, [{ modId: 'a', tierDisplay: 1 }], byId(a, b))).toMatch(/one essence modifier/i);
  });

  it('refuses an Alloy on top of a regular essence too', () => {
    const e = mod('e', 'essence');
    const a = mod('a', 'alloy');
    expect(whyNotAdd(a, [{ modId: 'e', tierDisplay: 1 }], byId(e, a))).toMatch(/one essence modifier/i);
  });

  it('allows an Alloy beside an ordinary mod', () => {
    const n = mod('n', 'normal');
    const a = mod('a', 'alloy');
    expect(whyNotAdd(a, [{ modId: 'n', tierDisplay: 1 }], byId(n, a))).toBeNull();
  });
});
