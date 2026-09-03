// How a cost is written down. One module, because there were four separate formatters — FrontierView,
// PolicyGraph, ItemActions and two inline `.toFixed(n) + ' ex'` sites — and they had already drifted
// apart on rounding. Duplicated formatting is a milder version of the mistake that let the D8 pricing
// bug hide, and it is the reason the unit ladder below could not simply be added in one place.
//
// Everything the optimizer produces is in EXALT-EQUIVALENTS, and that is the right internal unit: it
// is the small one, so no precision is lost. It is the wrong unit to READ once the numbers get big.
// "8,219,067 ex" is a wall of digits; the same figure as Divine Orbs is a quantity a player can picture.

/** Exchange rates from the price sheet, in exalts per unit. Absent ⇒ no ladder, everything in exalts. */
export interface Rates {
  readonly chaos?: number;
  readonly divine?: number;
}

export interface CostUnit {
  readonly key: 'exalt' | 'chaos' | 'divine';
  /** Short label shown after the number. */
  readonly label: string;
  /** Exalts per one of these. */
  readonly perExalt: number;
}

const EXALT: CostUnit = { key: 'exalt', label: 'ex', perExalt: 1 };

/**
 * Escalate only once the exalt figure stops being readable at a glance.
 *
 * Players think in exalts for ordinary crafts, so switching at 1 Chaos (≈33 ex) would make a 40-exalt
 * craft read as "1.2 chaos" — technically finer, practically worse. Five digits is where scanning a
 * column of numbers breaks down, so that is the line.
 */
const ESCALATE_ABOVE = 10_000;

/**
 * Choose ONE unit for a whole view, from its largest value.
 *
 * Per-value choice would be a mistake here: a cost↔probability frontier is read by comparing rows, and
 * "9,800 ex" sitting next to "300 chaos" makes the reader do the conversion the app exists to avoid.
 * Pass the biggest number the view will show — usually a max over the rows plus the budget.
 */
export function pickUnit(maxExalts: number, rates?: Rates): CostUnit {
  if (!Number.isFinite(maxExalts) || maxExalts <= ESCALATE_ABOVE) return EXALT;
  const ladder: CostUnit[] = [
    ...(rates?.chaos ? [{ key: 'chaos' as const, label: 'chaos', perExalt: rates.chaos }] : []),
    ...(rates?.divine ? [{ key: 'divine' as const, label: 'div', perExalt: rates.divine }] : []),
  ].sort((a, b) => a.perExalt - b.perExalt);
  // The smallest unit that brings the number under the ceiling — the finest granularity that reads.
  return ladder.find((u) => maxExalts / u.perExalt <= ESCALATE_ABOVE) ?? ladder.at(-1) ?? EXALT;
}

/**
 * A magnitude said in words: "6.1 billion", "2,472.8 trillion".
 *
 * The top of the ladder still overflows — 10,000 divine is where `pickUnit` runs out of units, and a
 * long-shot craft's total sits far above it. Past that the choice is how to write a number nobody can
 * hold in their head, and the options are not equal: "6.1B" makes the reader decode a suffix, and
 * `toExponential` ("6.1e+9") makes them count an exponent. The word is the one form that needs
 * neither. Grouping matters at the very top, where Intl stops at "trillion" and lets the mantissa
 * grow: "2472.8 trillion" against "2,472.8 trillion".
 */
const magnitude = (x: number): string => new Intl.NumberFormat('en', {
  notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1, useGrouping: true,
}).format(x);

/**
 * Rounding that keeps small numbers precise and big ones legible — and never adds trailing zeros.
 * A budget the user typed as "30" must read back as "30 ex", not "30.0 ex": digits that carry no
 * information still cost the reader a glance, and here they'd imply a precision nobody asked for.
 *
 * Words start at a million and not below, which is measured rather than chosen: "8.2 thousand ex"
 * loses to "8,219 ex" and "1 thousand chaos" loses to "1,000 chaos", so separators own the middle of
 * the range and words own only the part where separators have stopped helping.
 */
function round(x: number): string {
  if (x >= 1e6) return magnitude(x);
  if (x >= 10_000) return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(x);
  if (x >= 100) return Math.round(x).toLocaleString('en');
  const dp = x >= 10 ? 1 : 2;
  return Number(x.toFixed(dp)).toLocaleString('en', { maximumFractionDigits: dp });
}

/** Format one cost in the view's chosen unit. */
export function formatIn(unit: CostUnit, exalts: number): string {
  if (!Number.isFinite(exalts)) return '∞';
  return `${round(exalts / unit.perExalt)} ${unit.label}`;
}

/**
 * The exact exalt figure, for a `title`. Converting to a bigger unit rounds, and rounding hides — so
 * the precise number stays one hover away rather than being thrown out.
 */
export function exactExalts(exalts: number): string {
  if (!Number.isFinite(exalts)) return 'unbounded';
  return `${exalts.toLocaleString('en', { maximumFractionDigits: 2 })} exalt-equivalents`;
}

/** Convenience for a single number with no sibling values to stay comparable with. */
export function formatCost(exalts: number, rates?: Rates): string {
  return formatIn(pickUnit(exalts, rates), exalts);
}

/**
 * A cost the solver could only bracket, rendered with the inequality that says which way.
 *
 * The sign is not decoration, and it is not derivable from "did it converge": a push-forward solve
 * 0-initialises and CLIMBS, so truncating it leaves a floor, while a from-white solve seeds from a
 * proper policy's value and DESCENDS, so truncating it leaves a ceiling. Print the wrong one and a
 * conservative bracket becomes a confident understatement of what a craft costs — so the direction
 * comes from the solver (`EngineMarkovResult.bound`) and is never inferred here.
 */
export function formatBoundedCost(bound: 'exact' | 'lower' | 'upper', exalts: number, rates?: Rates): string {
  const n = formatCost(exalts, rates);
  return bound === 'exact' ? n : bound === 'lower' ? `≥ ${n}` : `≤ ${n}`;
}

// ── Counts and chances ───────────────────────────────────────────────────────
// Not currency, but the same problem and therefore the same module: a true number written in a form
// nobody can read. These lived as four near-copies across FrontierView, ItemActions, AlternativesView
// and PolicyGraph, which had already drifted on rounding — the exact history recorded at the top of
// this file for the cost formatters, replayed one concern over.

/**
 * A count at any scale — "1.6", "2,500", "5.1 billion".
 *
 * A decimal below a thousand, where one still carries information; separators through the middle;
 * words above a million, where they stop helping. The form this replaces was `toExponential`, which
 * printed a long-shot craft's attempt count as **"5.1e+9"**: correct, compact, and addressed to a
 * spreadsheet rather than a player.
 */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  if (n < 1000) return n.toFixed(1);
  if (n < 1e6) return Math.round(n).toLocaleString('en');
  return magnitude(n);
}

/**
 * A chance as the odds a player would quote it at: "1 in 5.3 million".
 *
 * Below a hundredth of a percent the percentage form stops being read and starts being counted —
 * "0.000019%" is decoded by counting zeros, and `toPrecision` gives up entirely under 1e-7 and emits
 * "3.9e-10%". Reciprocating loses nothing (the two forms carry identical information) and lands on
 * the idiom the game's own drop rates are already discussed in.
 */
export function formatOdds(p: number): string {
  return `1 in ${formatCount(1 / p)}`;
}

/** Where a percentage stops being legible and `formatChance` hands over to `formatOdds`. */
const ODDS_BELOW_PCT = 0.01;

/**
 * A success chance, at whatever scale it happens to be.
 *
 * Shared so that the Lab's screen-reader announcement cannot drift from the panel it describes: it
 * had its own `toFixed(1)` and read "Best value: 0.0% per attempt" for the 0.0000063% the frontier
 * was showing three lines below — a plan the app had just called achievable, announced as impossible.
 */
export function formatChance(p: number): string {
  const pct = p * 100;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= ODDS_BELOW_PCT) return `${pct.toFixed(3)}%`;
  if (p <= 0) return '0%';
  return formatOdds(p);
}
