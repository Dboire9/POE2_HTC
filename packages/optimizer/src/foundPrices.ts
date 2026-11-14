// The FOUND price sheet: what a starter recipe is planned on. Not a market — a scarcity weight per
// currency a new player picks up off the floor during the campaign and early maps.
//
// Why a second sheet exists at all. The trade sheet answers "what would this cost to BUY", and late in a
// league that answer is useless to a beginner: on the live sheet a level-12 Quarterstaff with two
// modifiers measured 80–108ex, because by then a Lesser Essence trades at 3–135ex and a plain Transmute
// at 2.2ex while the Greater currency nobody farms for is cheap. A new player buys nothing; they use what
// drops. So a starter recipe is planned on what drops, weighted by how often it drops, and the result is
// read as a COUNT of each currency used — never as an Exalted total, which these numbers are not.
//
// The trade sheet (`prices.json`, refreshed daily) is untouched by this file and never merged with it.
//
// What is off the sheet is OFF, not free. A missing price means unavailable (`stepIsPriced` /
// `stepAvailable`, cost.ts), so every currency not in `FOUND_WEIGHTS` — every Greater and Perfect orb,
// Greater and Perfect Essences (and the Alloys, which are priced as Perfect Essences), Annulment,
// Divine, every omen, every bone — simply never enters either planner's search. There is no `bones`
// block, so `pricesForBase` leaves `desecrate` absent on every base and no Desecration is ever offered.
// Use the sheet WHOLE: spread over the trade sheet it would inherit that sheet's omens and bones.
//
// The weights are a judgement, the maintainer's to confirm or change — how common each drop is for a
// new player, not data anyone measured. They live in one table so a change is one line.

import type { Prices } from './cost.ts';

/**
 * How scarce each found currency is to a new player, relative to an Orb of Transmutation (1).
 *
 * A JUDGEMENT, not market data: a higher weight is a rarer drop, so a plan that spends it is a plan
 * the player is less likely to be able to follow. Keys are the trade sheet's own (`currencyKey`), so
 * an essence of either strength is priced by its LEVEL key — any Lesser Essence, any Essence.
 */
export const FOUND_WEIGHTS: Readonly<Record<string, number>> = Object.freeze({
  transmute: 1, // Orb of Transmutation
  augment: 1, // Orb of Augmentation
  regal: 3, // Regal Orb
  exalt: 4, // Exalted Orb
  alchemy: 4, // Orb of Alchemy
  essence_lesser: 3, // any Lesser Essence
  essence: 6, // any Essence (the middle strength)
  chaos: 8, // Chaos Orb
});

/**
 * What another white base of the right type weighs, for the MDP's `restartCost` on this sheet.
 *
 * A JUDGEMENT, like the table above, and NOT wired into anything here: the solve's default
 * (`WHITE_BASE_COST` in src/lib/solve.ts) is 0, at which the policy bins almost every state rather than
 * repair it. A beginner who scraps an item has to find another base of the same weapon or armour class
 * at a usable item level, which is roughly as common as a Transmute — and a free restart would
 * recommend walking away from every Transmute that misses.
 */
export const FOUND_BASE_WEIGHT = 1;

/**
 * The found sheet, in the trade sheet's shape so every planner reads it unchanged.
 *
 * `estimated: true` and a full-sentence `caveat`, because `PriceBasisNote` renders the caveat wherever a
 * cost is shown, and a scarcity weight presented without one would read as an Exalted price.
 */
export const FOUND_PRICES: Prices = Object.freeze({
  currency: FOUND_WEIGHTS,
  omens: Object.freeze({}),
  meta: Object.freeze({
    generated: '2026-11-14',
    unit: 'scarcity weight (an Orb of Transmutation is 1)',
    estimated: true,
    source: 'A judgement on how common each currency drop is for a new player in the campaign and early '
      + 'maps — not market data. Only currency such a player finds is listed; everything else is '
      + 'unavailable on this sheet.',
    caveat: 'These are scarcity weights, not prices: a judgement on how often a new player finds each '
      + 'currency, with an Orb of Transmutation as 1. They rank plans by what drops, and are not Exalted '
      + 'Orbs.',
  }),
});
