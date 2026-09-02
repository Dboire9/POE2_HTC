import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { loadPrices } from './loadPrices.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { indexPrices, pricesForBase, stepCost } from './cost.ts';

// Two prices used to be single numbers standing in for whole families of items, and both were wrong
// by more than the amount that changes a recommendation:
//   • a Desecration consumes a BONE, and which bone depends on the gear (0.20ex to 7.69ex);
//   • an ESSENCE is priced individually, not by level — Greater essences run 0.25ex to 4.39ex.
// Since the optimizer ranks plans BY cost, charging one average for either changes which plan wins,
// not just the total printed on it.
//
// THIS FILE READS THE SHIPPED SHEET ON PURPOSE — it is one of the two guards the daily price-refresh
// workflow runs before merging, so freezing it would be freezing the guard. That makes it the one
// place where a magnitude pinned from a market snapshot is actively harmful: it fails on a day the
// market moved, blocks an otherwise-good refresh, and says nothing about the code. It happened on the
// automation's FIRST scheduled run (2026-09-02): `amulet / wand > 10` came back 6.82 and held the
// refresh, while every assertion about RESOLUTION passed.
//
// So the split below is deliberate and must be kept. **Live** assertions state what the CODE does —
// this base resolves to that bone, this essence to its own price. **Frozen** assertions state why it
// was worth doing, in numbers that stay true because the sheet behind them never moves.
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

// The magnitudes, against a sheet that cannot move under them. These are the EVIDENCE for the two
// changes this file guards — they are why a flat price was wrong, not a claim about today's economy —
// so they belong on the frozen 2026-08-22 snapshot. Asserting them live is what broke the automation.
describe('why per-bone and per-essence pricing was worth it (frozen sheet)', () => {
  const frozen = loadFrozenPrices();
  const on = (baseId: string) =>
    stepCost(pricesForBase(frozen, data.bases.get(baseId)!), { currency: 'desecrate' });

  it('the bones span an order of magnitude, so one flat number could not express them', () => {
    expect(on('Amulets') / on('Wands')).toBeGreaterThan(10);
  });

  it('Greater essences alone span more than 2x, so one price per LEVEL could not express them', () => {
    const priced = ['Abrasion', 'Flames', 'Opulence', 'Ice']
      .map((name) => essences.find((e) => e.name === name)?.tiers?.GREATER?.[0])
      .filter((m): m is string => m !== undefined)
      .map((add) => stepCost(frozen, { currency: 'essence', essenceLevel: 'greater', add }));
    expect(Math.max(...priced) / Math.min(...priced)).toBeGreaterThan(2);
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

// --- nothing the planners can spend is FREE ------------------------------------------------------
// `stepCost` reads `prices.currency[key] ?? 0`, so an absent key is not "unavailable" — it is a free
// orb, and a free anything dominates every frontier it can reach. This is the shape a league rollover
// produces: for the first days of a new league almost nothing has traded, and the refresh REBUILDS the
// essence keys wholesale rather than keeping the previous value the way the currency loop does. Before
// 2026-09-02 a sheet with no essence trades priced a Greater Essence and a Perfect Essence at 0.
//
// Lives here, against the SHIPPED sheet, because it is a claim about what ships — and this file is one
// of the two guards the daily refresh runs before merging, so a sheet that lost a key cannot reach the
// site without a human seeing it.
describe('no shipped price is zero', () => {
  const mustBePositive = [
    'transmute', 'augment', 'regal', 'exalt', 'chaos', 'annul', 'alchemy', 'desecrate',
    'transmute_greater', 'augment_greater', 'regal_greater', 'exalt_greater', 'chaos_greater',
    'transmute_perfect', 'augment_perfect', 'regal_perfect', 'exalt_perfect', 'chaos_perfect',
    // The per-LEVEL essence fallbacks, which `essenceKey` reaches whenever a specific essence has no
    // entry of its own. These are the keys the rebuild deletes and may fail to restore.
    'essence_lesser', 'essence', 'essence_greater', 'perfect_essence',
  ];

  it.each(mustBePositive)('%s has a positive price', (key) => {
    expect(prices.currency[key], `${key} is missing or zero — stepCost would charge nothing for it`)
      .toBeGreaterThan(0);
  });

  it('every omen the app can spend is priced', () => {
    for (const id of Object.keys(prices.omens)) {
      expect(prices.omens[id], `${id} priced at 0`).toBeGreaterThan(0);
    }
    expect(Object.keys(prices.omens).length).toBeGreaterThanOrEqual(13);
  });

  it('every per-essence entry that EXISTS is positive, and most essences have one', () => {
    const perEssence = Object.entries(prices.currency).filter(([k]) => k.startsWith('essence:'));
    expect(perEssence.length).toBeGreaterThan(500);
    for (const [k, v] of perEssence) expect(v, `${k} priced at 0`).toBeGreaterThan(0);
  });

  it('every bone the desecration model resolves is priced', () => {
    for (const bone of ['jawbone', 'rib', 'collarbone'] as const) {
      expect(prices.bones?.[bone], `bone ${bone} missing`).toBeGreaterThan(0);
    }
  });
});
