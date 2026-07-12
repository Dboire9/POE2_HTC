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

import type { PlanResult, PlanStep } from '../../engine/src/plan.ts';

export interface Prices {
  /** Base currency price in exalt-equivalents, keyed by currency (transmute, exalt, perfect_essence, …). */
  readonly currency: Record<string, number>;
  /** Surcharge for using an omen, keyed by omen id (OmenofSinistralExaltation, …). */
  readonly omens: Record<string, number>;
}

interface PricesFile { patch: string; prices: Record<string, number>; omens?: Record<string, number>; }

/** Build a Prices sheet from an already-parsed prices.json (no I/O — browser/worker safe). */
export function indexPrices(file: PricesFile): Prices {
  return { currency: file.prices, omens: file.omens ?? {} };
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

/** The omen id a step invokes (for the omen surcharge), or undefined if it uses no omen. */
export function stepOmenId(step: PlanStep): string | undefined {
  switch (step.currency) {
    case 'exalt':
      if (step.constrainTo === 'prefix') return 'OmenofSinistralExaltation';
      if (step.constrainTo === 'suffix') return 'OmenofDextralExaltation';
      return undefined;
    case 'annul':
      if (step.omen === 'sinistral') return 'OmenofSinistralAnnulment';
      if (step.omen === 'dextral') return 'OmenofDextralAnnulment';
      if (step.omen === 'light') return 'OmenofLight';
      return undefined;
    case 'perfect-essence':
      if (step.omen === 'sinistral') return 'OmenofSinistralCrystallisation';
      if (step.omen === 'dextral') return 'OmenofDextralCrystallisation';
      return undefined;
    case 'desecrate':
      if (step.boss === 'blackblooded') return 'OmenoftheBlackblooded';
      if (step.boss === 'liege') return 'OmenoftheLiege';
      if (step.boss === 'sovereign') return 'OmenoftheSovereign';
      if (step.constrainTo === 'prefix') return 'OmenofSinistralNecromancy';
      if (step.constrainTo === 'suffix') return 'OmenofDextralNecromancy';
      return undefined;
    default:
      return undefined;
  }
}

/** Cost of a single step: its currency price plus any omen surcharge. Unknown keys cost 0. */
export function stepCost(prices: Prices, step: PlanStep): number {
  const base = prices.currency[currencyKey(step)] ?? 0;
  const omenId = stepOmenId(step);
  const omen = omenId ? (prices.omens[omenId] ?? 0) : 0;
  return base + omen;
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
