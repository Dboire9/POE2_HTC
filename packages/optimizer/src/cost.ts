// Cost model for the optimizer. Turns per-step success probabilities + a price sheet into the
// EXPECTED cost of completing a plan, which is what makes "guarantee with an essence (dear, P=1) vs
// roll it (cheap, retry)" a real decision rather than a trivial win for essences.
//
// Retry model: **restart-on-first-failure** — you run the sequence, and the moment a step gives the
// wrong outcome you scrap the item and start over from a white base. For per-step success probs
// p_1..p_n and per-step costs c_1..c_n this has the exact closed form
//
//     E = ( Σ_k c_k · S_{k-1} ) / S_n ,   S_k = Π_{j≤k} p_j ,  S_0 = 1
//
// i.e. cheap early steps are paid on every attempt, dear late steps only once the earlier ones land.
// (Derivation: E = c_1 + (1-p_1)E + p_1[c_2 + (1-p_2)E + ...]; solve for E.) A smarter annul-and-
// reroll strategy would cost less; that's a documented future refinement (see docs/validation.md).
//
// `planCostCdf` gives the same model's full DISTRIBUTION rather than its mean — P(finish within a
// budget) — which is what a budget actually asks: E is roughly a coin flip, so "expected 200ex" busts
// about half the time. Same recursion, solved over a cost grid instead of collapsed to a scalar.

import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';

/** Where a price sheet came from — carried so the UI can be honest about how firm the numbers are. */
export interface PricesMeta {
  readonly patch?: string;
  /** ISO date the sheet was authored. */
  readonly generated?: string;
  readonly updated?: string;
  /** Free text describing provenance (e.g. "SEED ESTIMATES — hand-authored"). */
  readonly source?: string;
  readonly unit?: string;
  /** True when the sheet is hand-authored guesswork rather than observed market data. Every cost the
   *  optimizer reports is only as good as this, so the UI must not present those costs as exact. */
  readonly estimated?: boolean;
}

export interface Prices {
  /** Base currency price in exalt-equivalents, keyed by currency (transmute, exalt, perfect_essence, …). */
  readonly currency: Record<string, number>;
  /** Surcharge for using an omen, keyed by omen id (OmenofSinistralExaltation, …). */
  readonly omens: Record<string, number>;
  /** Provenance, when the source file carried any. */
  readonly meta?: PricesMeta;
}

interface PricesFile {
  patch?: string; prices: Record<string, number>; omens?: Record<string, number>;
  generated?: string; updated?: string; source?: string; unit?: string; estimated?: boolean;
}

/** Build a Prices sheet from an already-parsed prices.json (no I/O — browser/worker safe). */
export function indexPrices(file: PricesFile): Prices {
  // Default to ESTIMATED. Absence of provenance is not evidence of accuracy, so a sheet must declare
  // `estimated: false` to be treated as observed market data — silence never earns that claim.
  // (An earlier version sniffed `source` for words like "seed"; that read a source-less sheet as firm,
  // which is precisely the overclaim this guards against.)
  const estimated = file.estimated ?? true;
  const meta: PricesMeta = {
    ...(file.patch !== undefined ? { patch: file.patch } : {}),
    ...(file.generated !== undefined ? { generated: file.generated } : {}),
    ...(file.updated !== undefined ? { updated: file.updated } : {}),
    ...(file.source !== undefined ? { source: file.source } : {}),
    ...(file.unit !== undefined ? { unit: file.unit } : {}),
    estimated,
  };
  return { currency: file.prices, omens: file.omens ?? {}, meta };
}

/**
 * The `prices.currency` key a step maps to, including its orb strength — e.g. an exalt step with
 * `tier: 'greater'` costs `exalt_greater`. Base tier (or no tier) uses the plain currency key.
 */
function currencyKey(step: PlanStep): string {
  if (step.currency === 'perfect-essence') return 'perfect_essence';
  // A regular essence is priced by its level (Lesser/Normal/Greater); Normal uses the plain `essence`.
  if (step.currency === 'essence') {
    const lvl = step.essenceLevel;
    return lvl === 'lesser' || lvl === 'greater' ? `essence_${lvl}` : 'essence';
  }
  const isAdd = step.currency === 'transmute' || step.currency === 'augment' || step.currency === 'regal' || step.currency === 'exalt';
  if (isAdd && 'tier' in step && step.tier && step.tier !== 'base') return `${step.currency}_${step.tier}`;
  return step.currency;
}

/**
 * Every omen id a step invokes (for the omen surcharge); empty when it uses none. A step can invoke
 * MORE than one: a Desecration may carry both a boss omen (which pool it draws from) and a
 * Sinistral/Dextral Necromancy omen (which side it draws on) — two separate omens, two surcharges.
 */
export function stepOmenIds(step: PlanStep): string[] {
  switch (step.currency) {
    case 'exalt':
      if (step.constrainTo === 'prefix') return ['OmenofSinistralExaltation'];
      if (step.constrainTo === 'suffix') return ['OmenofDextralExaltation'];
      return [];
    case 'annul':
      if (step.omen === 'sinistral') return ['OmenofSinistralAnnulment'];
      if (step.omen === 'dextral') return ['OmenofDextralAnnulment'];
      if (step.omen === 'light') return ['OmenofLight'];
      return [];
    case 'perfect-essence':
      if (step.omen === 'sinistral') return ['OmenofSinistralCrystallisation'];
      if (step.omen === 'dextral') return ['OmenofDextralCrystallisation'];
      return [];
    case 'desecrate': {
      const ids: string[] = [];
      if (step.boss === 'blackblooded') ids.push('OmenoftheBlackblooded');
      else if (step.boss === 'liege') ids.push('OmenoftheLiege');
      else if (step.boss === 'sovereign') ids.push('OmenoftheSovereign');
      if (step.constrainTo === 'prefix') ids.push('OmenofSinistralNecromancy');
      else if (step.constrainTo === 'suffix') ids.push('OmenofDextralNecromancy');
      return ids;
    }
    default:
      return [];
  }
}

/** Cost of a single step: its currency price plus any omen surcharge. Unknown keys cost 0. */
export function stepCost(prices: Prices, step: PlanStep): number {
  const base = prices.currency[currencyKey(step)] ?? 0;
  const omens = stepOmenIds(step).reduce((sum, id) => sum + (prices.omens[id] ?? 0), 0);
  return base + omens;
}

/** One way an attempt can end: `cost` spent, with probability `prob`. The branches sum to 1. */
interface AttemptBranch {
  readonly cost: number;
  readonly prob: number;
}

/** The attempt's outcome branches: fail at step k (spent Σ_{j≤k} c_j), or succeed (spent Σ c_j). */
function attemptBranches(
  prices: Prices, plan: PlanResult, steps: readonly PlanStep[],
): { fails: AttemptBranch[]; success: number; total: number } {
  const fails: AttemptBranch[] = [];
  let survive = 1; // S_{k-1}
  let spent = 0; // A_k = Σ_{j≤k} c_j
  for (let k = 0; k < steps.length; k++) {
    spent += stepCost(prices, steps[k]!);
    const p = plan.steps[k]!.prob;
    const q = survive * (1 - p); // P(reach step k, then it misses)
    if (q > 0) fails.push({ cost: spent, prob: q });
    survive *= p; // S_k
  }
  return { fails, success: survive, total: spent };
}

export interface CostCdfOptions {
  /**
   * Cap on DP cells. The quantum is normally chosen to divide the plan's costs EXACTLY (see
   * `exactQuantum`), which needs ~budget/quantum cells — 2000 for a 200ex budget on a 0.1-quantum
   * price sheet. Only if that exceeds this cap (or the prices are incommensurable) does it fall back
   * to a uniform grid, and then `exact: false` flags that the answer is a bracket. Default 200000.
   */
  readonly maxCells?: number;
}

/** P(total cost ≤ budget). `exact` ⇒ lower === upper; otherwise the true value lies in [lower, upper]. */
export interface CostCdfBounds {
  readonly lower: number;
  readonly upper: number;
  /** True when the cost quantum divided every price exactly, so no discretisation error remains. */
  readonly exact: boolean;
}

/** Safety cap on DP cells. Typical price sheets need ~2000, so this only bites on odd prices. */
export const DEFAULT_COST_CELLS = 200_000;

/** gcd of two non-negative integers. */
function gcdInt(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/**
 * The LARGEST cost quantum dividing every one of `costs` exactly, or undefined if they aren't
 * commensurable at ≤6 decimal places.
 *
 * This is what makes the CDF below exact rather than approximate, and it matters more than it looks:
 * with a quantum picked off the budget instead (h = B/G), each atom rounds by up to h and the error
 * COMPOUNDS once per restart — a plan that can restart B/c_min times drifts by (B/c_min)·h, which on
 * a 200ex budget with 0.2ex chaos orbs and G=4096 is a ~49ex drift. Dividing the prices instead puts
 * every atom exactly on a cell boundary, so there is nothing to round and no drift to compound. Real
 * sheets (0.2, 1, 1.5, 15, …) give a 0.1 quantum ⇒ ~2000 cells for a 200ex budget.
 */
function exactQuantum(costs: readonly number[]): number | undefined {
  const positive = costs.filter((c) => c > 0);
  if (positive.length === 0) return undefined;
  for (let d = 0; d <= 6; d++) {
    const scale = Math.pow(10, d);
    let g = 0;
    let ok = true;
    for (const c of positive) {
      const v = c * scale;
      const r = Math.round(v);
      // ABSOLUTE tolerance, deliberately: a relative one (1e-6·|v|) grows with the scale and by d=6
      // would "accept" π as 3141593/10⁶ — making `exact` a claim we hadn't earned. 1e-6 absolute still
      // absorbs float noise (0.1+0.2 → 0.30000000000000004) but rejects a truly incommensurable price.
      if (Math.abs(v - r) > 1e-6) {
        ok = false;
        break;
      }
      g = gcdInt(g, r);
    }
    if (ok && g > 0) return g / scale;
  }
  return undefined;
}

/**
 * P(you actually finish this plan spending ≤ `budget`) under the same restart-on-first-failure model
 * as `planExpectedCost` — the honest companion to `expected`, which is only a mean and busts about
 * half the time.
 *
 * Analytic, not Monte Carlo. Condition on the FIRST attempt and recurse on the remaining budget:
 *
 *     g(x) = S_n·1[C ≤ x]  +  Σ_k S_{k-1}(1−p_k)·g(x − A_k)
 *
 * with S_k = Π_{j≤k} p_j, A_k = Σ_{j≤k} c_j, C = A_n. Every restart count is folded in implicitly by
 * the recursion — we never iterate the geometric tail (at S_n ≈ 1e-4 that would need ~276k
 * convolutions to reach the same answer).
 *
 * `x` is discretised in units of a cost quantum, so each g(x) reads only strictly-smaller cells
 * (A_k > 0) and one forward sweep suffices: O(cells × branches). The quantum is chosen to DIVIDE the
 * plan's costs (see `exactQuantum`), which leaves nothing to round — hence `exact: true` and
 * lower === upper. Only incommensurable prices (or a budget/quantum ratio past `maxCells`) fall back
 * to a uniform grid; there, rounding every cost DOWN makes the plan look cheaper and yields an UPPER
 * bound while rounding UP yields a LOWER bound, so the pair still brackets the truth rather than
 * hiding the error.
 *
 * Evaluating at cell floor(budget/h) is not a truncation: every reachable total cost is a sum of
 * atoms, hence a multiple of h, so no attainable cost hides in (floor(budget/h)·h, budget].
 */
export function planCostCdf(
  prices: Prices, plan: PlanResult, steps: readonly PlanStep[], budget: number, opts: CostCdfOptions = {},
): CostCdfBounds {
  const { fails, success, total } = attemptBranches(prices, plan, steps);
  // A plan that can never complete never completes within any budget.
  if (success <= 0 || budget < 0) return { lower: 0, upper: 0, exact: true };
  // Degenerate: with a zero budget (or a wholly free plan) the answer needs no sweep.
  if (budget === 0 || total === 0) {
    const p = total <= budget ? 1 : 0;
    return { lower: p, upper: p, exact: true };
  }

  const maxCells = Math.max(1, Math.floor(opts.maxCells ?? DEFAULT_COST_CELLS));
  const quantum = exactQuantum([...fails.map((f) => f.cost), total]);
  const exact = quantum !== undefined && budget / quantum <= maxCells;
  const h = exact && quantum !== undefined ? quantum : budget / maxCells;
  // floor, NOT max(1, floor): cell i represents a cost of i·h, so when the budget can't even cover one
  // quantum the honest cell count is 0 (only a free plan fits) — clamping up to 1 would invent a cell
  // ABOVE the budget and report plans as affordable that aren't.
  const cells = Math.max(0, Math.min(maxCells, Math.floor(budget / h + 1e-6)));

  const sweep = (round: (x: number) => number): number => {
    const successIdx = round(total / h);
    if (successIdx > cells) return 0; // one clean run already busts the budget
    // A failing branch that rounds to zero cost is a self-loop — g(x) sits on both sides. Solve it
    // algebraically (divide by 1 − q0) instead of recursing forever. Branches costing more than the
    // whole budget contribute g(negative) = 0, so they simply drop out (no renormalisation!).
    let q0 = 0;
    const atoms: AttemptBranch[] = [];
    for (const f of fails) {
      const i = round(f.cost / h);
      if (i === 0) q0 += f.prob;
      else if (i <= cells) atoms.push({ cost: i, prob: f.prob });
    }
    if (q0 >= 1) return 0; // every miss is free and success impossible — unreachable (success > 0), defensive
    const g = new Float64Array(cells + 1);
    for (let i = 0; i <= cells; i++) {
      let acc = i >= successIdx ? success : 0;
      for (const a of atoms) {
        const j = i - a.cost;
        if (j >= 0) acc += a.prob * g[j]!;
      }
      g[i] = acc / (1 - q0);
    }
    return Math.min(1, Math.max(0, g[cells]!));
  };

  // With an exact quantum both roundings land on the same cell — one sweep IS the answer.
  const upper = sweep(Math.floor);
  return exact ? { lower: upper, upper, exact: true } : { lower: sweep(Math.ceil), upper, exact: false };
}

export interface CostBreakdown {
  /** Expected total cost to complete, under the restart-on-first-failure model (∞ if unachievable). */
  readonly expected: number;
  /** Cost of one full successful run (Σ step costs) — the numerator's "everything lands" case. */
  readonly perAttempt: number;
  /** Expected number of full restarts = 1 / P(total) (∞ if P=0). */
  readonly expectedAttempts: number;
}

/**
 * Expected cost of `plan` (its per-step probabilities) given `steps` (their currencies/omens) under
 * the restart-on-first-failure model. `steps` and `plan.steps` must line up 1:1.
 */
export function planExpectedCost(prices: Prices, plan: PlanResult, steps: readonly PlanStep[]): CostBreakdown {
  let survive = 1; // S_{k-1}
  let numerator = 0;
  let perAttempt = 0;
  for (let k = 0; k < steps.length; k++) {
    const c = stepCost(prices, steps[k]!);
    perAttempt += c;
    numerator += c * survive;
    survive *= plan.steps[k]!.prob; // S_k
  }
  const total = survive; // S_n = P(total)
  return {
    expected: total > 0 ? numerator / total : Infinity,
    perAttempt,
    expectedAttempts: total > 0 ? 1 / total : Infinity,
  };
}
