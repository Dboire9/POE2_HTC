// Where an Omen of Greater Exaltation enters the search: two adjacent Exalts become one orb.
//
// The omen makes an Exalted Orb add TWO modifiers ("your next Exalted Orb will add two random
// modifiers" — poe2db, `OmenOnExaltAddTwoMods`). That is not a lever: `levers.ts` may only offer
// choices that leave the same item behind, and this leaves a different one. So it has to be chosen
// where the ORDERINGS are chosen, which is what this module does — it takes the skeletons a planner
// already built and adds, for each adjacent pair of Exalts, the skeleton that buys them as one.
//
// WHY IT CAN WIN, since it is dearer per orb. A plan is a fixed sequence, so two Exalts commit to an
// order: A must land first, then B. One omened orb gets BOTH orders, because the two draws are
// unordered — so it is worth up to 2x the probability for 1.67x the price (1 + 2.331 ex against
// 1 + 1 ex on the 2026-09-02 sheet). Whether that trade pays depends on the craft and on the day's
// prices, which is the frontier's business, not this module's: it offers the route and lets the
// search rank it.
//
// ADJACENT PAIRS ARE ENOUGH, and the canonical filter is what stops them being counted twice. Both
// planners enumerate every ordering of the targets, so an unordered pair {A,B} is adjacent in some
// ordering with any given remainder — and it is adjacent in TWO (…A,B… and …B,A…) whose fusions are
// the identical skeleton, since the omened step does not care which mod it names first. Emitting only
// the `A < B` spelling drops exactly the duplicate and nothing else.

import type { PlanStep } from '../../engine/src/plan.ts';
import type { Prices } from './cost.ts';

/** The omen this route spends. Unpriced ⇒ the route is not offered — see `withGreaterExaltations`. */
export const GREATER_EXALTATION_OMEN = 'OmenofGreaterExaltation';

/** The two-mod step that replaces `a` and `b`, or undefined if that pair is not fusible. */
function fuse(a: PlanStep, b: PlanStep): PlanStep | undefined {
  if (a.currency !== 'exalt' || b.currency !== 'exalt') return undefined;
  // `constrainTo` is a Sinistral/Dextral Exaltation — a second omen on the same orb, which no traced
  // rule allows. Skeletons carry none (side omens are levers, applied later), so this is a guard on
  // the type rather than a case that arises; it costs nothing and says what the rule is.
  if (a.constrainTo !== undefined || b.constrainTo !== undefined) return undefined;
  if (!(a.add < b.add)) return undefined; // canonical spelling only — see the header
  return {
    currency: 'greater-exalt',
    adds: [
      { modId: a.add, ...(a.minTierIndex === undefined ? {} : { minTierIndex: a.minTierIndex }) },
      { modId: b.add, ...(b.minTierIndex === undefined ? {} : { minTierIndex: b.minTierIndex }) },
    ],
  };
}

/**
 * `skeletons`, plus one variant per adjacent Exalt pair that buys the pair as a single omened orb.
 *
 * Gated on the omen having a PRICE, exactly as `levers.ts` gates the Whittling omen and the orb
 * strengths: `stepCost` charges 0 for a missing key, so an unpriced Omen of Greater Exaltation would
 * make this route come back cheaper than the two Exalts it replaces AND likelier — dominating every
 * frontier it touched, on a currency the sheet could not quote. Unpriced, the search is byte-for-byte
 * what it was before this module existed.
 *
 * ONE fusion per skeleton, not every disjoint set of them. A craft reaches four Exalts only from a
 * held item missing four rollable mods, and covering that costs a second combinatorial axis over a
 * search that already enumerates orderings. Measured worth first, breadth second; recorded in TODO.
 */
export function withGreaterExaltations(
  prices: Prices, skeletons: readonly (readonly PlanStep[])[],
): PlanStep[][] {
  const out: PlanStep[][] = skeletons.map((s) => [...s]);
  if (prices.omens[GREATER_EXALTATION_OMEN] === undefined) return out;
  for (const steps of skeletons) {
    for (let i = 0; i + 1 < steps.length; i++) {
      const fused = fuse(steps[i]!, steps[i + 1]!);
      if (fused === undefined) continue;
      out.push([...steps.slice(0, i), fused, ...steps.slice(i + 2)]);
    }
  }
  return out;
}
