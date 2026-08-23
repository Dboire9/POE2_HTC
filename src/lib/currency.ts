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
 * Rounding that keeps small numbers precise and big ones legible — and never adds trailing zeros.
 * A budget the user typed as "30" must read back as "30 ex", not "30.0 ex": digits that carry no
 * information still cost the reader a glance, and here they'd imply a precision nobody asked for.
 */
function round(x: number): string {
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
