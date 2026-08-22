import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { loadPrices } from './loadPrices.ts';
import { indexPrices, pricesForBase, stepCost } from './cost.ts';

// Two prices used to be single numbers standing in for whole families of items, and both were wrong
// by more than the amount that changes a recommendation:
//   • a Desecration consumes a BONE, and which bone depends on the gear (0.20ex to 7.69ex);
//   • an ESSENCE is priced individually, not by level — Greater essences run 0.25ex to 4.39ex.
// Since the optimizer ranks plans BY cost, charging one average for either changes which plan wins,
// not just the total printed on it.
const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');
const essences = JSON.parse(readFileSync('data/patches/0.5.0/essences.json', 'utf8')).essences as
  { name: string; tiers: Record<string, string[]> }[];

const desecrateOn = (baseId: string) =>
  stepCost(pricesForBase(prices, data.bases.get(baseId)!), { currency: 'desecrate' });

describe('a Desecration is priced by the bone the base consumes', () => {
  it('charges the jawbone on a weapon, the rib on armour, the collarbone on jewellery', () => {
    const wand = desecrateOn('Wands');
    const armour = desecrateOn('Body_Armours_dex_int');
    const amulet = desecrateOn('Amulets');
    expect(wand).toBeCloseTo(prices.bones!.jawbone!, 12);
    expect(armour).toBeCloseTo(prices.bones!.rib!, 12);
    expect(amulet).toBeCloseTo(prices.bones!.collarbone!, 12);
    // The spread is the whole point — one flat number could not have expressed it.
    expect(amulet / wand).toBeGreaterThan(10);
  });

  it('quivers pay the weapon bone, and off-hands the armour one', () => {
    expect(desecrateOn('Quivers')).toBeCloseTo(prices.bones!.jawbone!, 12);
    expect(desecrateOn('Foci')).toBeCloseTo(prices.bones!.rib!, 12);
  });

  // Older sheets have no `bones` block; they must keep working off the flat key rather than break.
  it('leaves a sheet without bones untouched', () => {
    const legacy = indexPrices({ prices: { desecrate: 42 } });
    const resolved = pricesForBase(legacy, data.bases.get('Wands')!);
    expect(stepCost(resolved, { currency: 'desecrate' })).toBe(42);
  });
});

describe('an essence is priced individually, not by level', () => {
  const greaterMod = (name: string) => essences.find((e) => e.name === name)?.tiers?.GREATER?.[0];

  it('charges different prices for different Greater essences', () => {
    const priced = ['Abrasion', 'Flames', 'Opulence', 'Ice']
      .map(greaterMod)
      .filter((m): m is string => m !== undefined)
      .map((add) => stepCost(prices, { currency: 'essence', essenceLevel: 'greater', add }));
    expect(priced.length).toBeGreaterThan(2);
    expect(new Set(priced).size).toBeGreaterThan(1); // not one flat level price
    expect(Math.max(...priced) / Math.min(...priced)).toBeGreaterThan(2);
  });

  it('prices a Greater and a Perfect essence as separate purchases', () => {
    const pair = essences.flatMap((x) => {
      const g = x.tiers?.GREATER?.[0];
      const p = x.tiers?.PERFECT?.[0];
      return g && p ? [{ g, p }] : [];
    })[0];
    expect(pair).toBeDefined();
    expect(stepCost(prices, { currency: 'essence', essenceLevel: 'greater', add: pair!.g })).toBeGreaterThan(0);
    expect(stepCost(prices, { currency: 'perfect-essence', add: pair!.p })).toBeGreaterThan(0);
  });

  // A missing key must not read as FREE: the optimizer minimises cost, so a zero-priced essence would
  // dominate every frontier and be recommended for everything.
  it('falls back to the level price for an essence the sheet does not list, never to zero', () => {
    const cost = stepCost(prices, { currency: 'essence', essenceLevel: 'greater', add: 'Wands/NoSuchEssenceMod' });
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeCloseTo(prices.currency.essence_greater!, 12);
  });

  it('still charges something when a step names no mod at all', () => {
    expect(stepCost(prices, { currency: 'essence', essenceLevel: 'lesser' })).toBeGreaterThan(0);
    expect(stepCost(prices, { currency: 'perfect-essence' })).toBeGreaterThan(0);
  });
});
