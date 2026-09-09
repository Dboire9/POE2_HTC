import type { Mod, Tier } from './types.ts';

/**
 * Which tier produced a roll — the one place that decides it.
 *
 * Two resolvers need this answer and must never disagree about it: `resolveMods` reads the printed
 * text a player pastes, and `statLookup` reads the structured stat values a profile API serves. They
 * differ entirely in how they find the MOD and not at all in how they pin the TIER, so the tier half
 * lives here rather than being written twice. Two copies of "did this roll come from this tier" is
 * exactly the shape of the D8 pricing bug: one mechanic, two implementations, quietly diverging.
 */

/**
 * Is a printed value inside a tier's range?
 *
 * The magnitude, deliberately. Five shipped texts read `#% reduced Flask Charges used` and store the
 * range as `[-13,-11]`: the wording already carries the sign, so the game prints `12` and the data
 * keeps `-12`. Comparing raw would reject every roll of them.
 */
export function within(range: readonly number[], v: number): boolean {
  const lo = Math.min(...range);
  const hi = Math.max(...range);
  const x = hi <= 0 && lo < 0 ? -v : v;
  return x >= lo && x <= hi;
}

/**
 * Could this tier have produced these values?
 *
 * A tier is ruled OUT only by evidence. Where the counts disagree the roll says nothing about the
 * tier and the tier stays a candidate: `Loads an additional bolt` prints no number at all yet stores
 * a range per tier, so demanding a match would rule out every tier of it and claim the mod could not
 * exist — which is the opposite of what an unnumbered line means.
 */
export const fitsTier = (t: Tier, values: readonly number[]): boolean =>
  t.ranges.length !== values.length || t.ranges.every((r, i) => within(r, values[i]!));

/**
 * Which tiers of `mod` could have produced `values`.
 *
 * A single-tier mod returns that tier whatever the values say — there is nothing to choose between,
 * and 144 shipped mods (flat desecrated and perfect-essence lines) carry no ranges at all to check.
 * The consequence is worth knowing: a single-tier mod can never be reported Sanctified, because it
 * never fails to fit. That costs only the label, since there is one tier either way.
 */
export function tiersFitting(mod: Mod, values: readonly number[], level: number | undefined): readonly Tier[] {
  const rollable = level === undefined ? mod.tiers : mod.tiers.filter((t) => t.ilvl <= level);
  if (rollable.length <= 1) return rollable;
  return rollable.filter((t) => fitsTier(t, values));
}

/**
 * Is this roll above everything the mod can produce? Then it was Sanctified.
 *
 * Sanctification raises a modifier's value past what any tier of it rolls (user ruling, 2026-09-09).
 * It is NOT modelled as a mechanic and nothing here tries to reproduce it — the only claim made is
 * about READING: a roll over the top is at least the best tier, so that is what it reports.
 *
 * Judged against the BEST tier rather than against "no tier fits", because those are different
 * claims: a roll can fit no tier by being too small, by being read as the wrong mod, or by two
 * printed lines having been grouped as one modifier they are not. Only "at or above the top, and
 * below none of it" is evidence of the mechanic — two of the nine over-range lines on a real
 * character were a misread, and labelling those Sanctified would have buried the bug.
 */
export function aboveEveryTier(mod: Mod, values: readonly number[]): boolean {
  const best = mod.tiers.at(-1);
  if (!best || best.ranges.length !== values.length || values.length === 0) return false;
  let higher = false;
  for (const [i, range] of best.ranges.entries()) {
    // MAGNITUDES, which makes one comparison serve both directions. A "reduced" mod stores its range
    // negative and the game prints the magnitude, so "more than the mod can roll" is a bigger number
    // on screen either way; comparing raw would need the sign flip `within` does, and would then have
    // to flip the direction of the comparison as well, since more negative is BETTER there. No
    // shipped range spans zero (checked: 0 of them), so magnitude never loses information.
    const lo = Math.min(...range.map(Math.abs));
    const hi = Math.max(...range.map(Math.abs));
    const v = Math.abs(values[i]!);
    if (v < lo) return false;
    if (v > hi) higher = true;
  }
  return higher;
}

/** What a roll says about the tier: the candidates, and whether it sits above them all. */
export interface TierFit {
  /** Every tier the roll allows, in the data's order. A Sanctified roll yields the best tier alone. */
  readonly names: readonly string[];
  readonly sanctified: boolean;
}

/** The whole tier question in one call, so a caller cannot get half of it right. */
export function tierFit(mod: Mod, values: readonly number[], level?: number): TierFit {
  const fitting = tiersFitting(mod, values, level).map((t) => t.name);
  if (fitting.length > 0) return { names: fitting, sanctified: false };
  if (!aboveEveryTier(mod, values)) return { names: [], sanctified: false };
  return { names: [mod.tiers.at(-1)!.name], sanctified: true };
}
