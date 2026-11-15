// What a plan counted in what drops uses, in words a new player reads: "Orb of Transmutation — about 2".
//
// A found-basis result (`SolveRequest.priceBasis: 'found'`) is read as COUNTS, never as a total: its costs
// are scarcity weights, not an amount of any currency (foundPrices.ts). The counts are exact averages of
// the solved plan (`EngineMarkovResult.uses`, markovUses.ts) and often fractional — a hard-hitting Bow at
// item level 16 uses 1.89 Transmutes, 0.82 Lesser Essences of Abrasion, 0.18 of Flames and 1.89 bases —
// so they are worded, not printed: "about 2", and for a count well under one, how many crafts share one.

import sheet from '../../data/found/prices.json';
import type { EngineUse } from './engineTypes.ts';

/**
 * The found sheet's own names for its orbs ("Orb of Transmutation"), by sheet key. Its Essence entries
 * name a strength ("any Lesser Essence"), not the Essence the plan uses, so those are not read from here.
 */
const NAMES: Readonly<Record<string, string>> = sheet.names;

/** A currency as a player knows it: the sheet's name for an orb, the route's for an Essence ("Lesser Essence of Abrasion"). */
export const currencyName = (u: Pick<EngineUse, 'key' | 'label'>): string =>
  (u.key.startsWith('essence') ? undefined : NAMES[u.key]) ?? u.label;

/**
 * An average count in words. At one or more, or close enough that one craft in two or fewer shares it:
 * "about N", rounded, never below 1. Under that: "about 1 for every K crafts" — the same average, said
 * the way round a player can picture (0.18 is about 1 for every 6 crafts). Never "about 0".
 */
export function countWords(n: number): string {
  const every = Math.round(1 / n);
  if (n >= 1 || every <= 1) return `about ${Math.max(1, Math.round(n))}`;
  return `about 1 for every ${every} crafts`;
}

/** A starter recipe's rule for when the weapon is done, said wherever it matters (starterRecipes.ts). */
export const STOP_LINE = 'The weapon is done when it has these modifiers — the others can be anything.';
