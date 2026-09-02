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
import type { AffixType, CurrencyTier, ItemBase, Mod } from '../../engine/src/types.ts';
import type { AnnulOmen, ChaosOmen, DesecrationBossOmen, EssenceOmen } from '../../engine/src/probability.ts';
import { desecrationBoneFor } from '../../engine/src/probability.ts';

/**
 * The only fields of a step that PRICING reads.
 *
 * Naming that subset is what lets the MDP price its own actions through this one table instead of
 * keeping a second copy of it. The two planners describe an action differently (the MDP says
 * `strength`/`side`, a PlanStep says `tier`/`constrainTo`|`omen`), but both collapse to the same
 * price keys, and duplicating that collapse is exactly how the D8 desecration mispricing hid: one
 * planner learned about an omen surcharge and the other did not. `PlanStep` satisfies this
 * structurally.
 *
 * This used to say pricing never reads a mod id. That is no longer true, and pretending otherwise
 * would be worse than the churn: an ESSENCE is priced individually, not by level. Essence of
 * Abrasion runs Lesser 116ex, Normal 107ex, Greater 0.81ex, Perfect 9.18ex — there is no such thing
 * as "what a Greater essence costs", so the mod being forced is genuinely part of the price. Only
 * the essence currencies read `add`; everything else still ignores mod ids entirely.
 */
export interface PricedStep {
  readonly currency: PlanStep['currency'];
  /**
   * Orb strength — transmute/augment/regal/exalt **and chaos**.
   *
   * Chaos was missing from `currencyKey`'s list for as long as this field existed, while the engine
   * honoured it the whole time: `chaosProbability` forwards its `opts` to `exaltProbability`, so the
   * ilvl floor applied and the odds moved. Only the price stayed put. Latent while no planner emitted
   * a tiered chaos; the from-item orb-strength axis emits them constantly, and chaos is that planner's
   * main transform — a Perfect Chaos would have been billed at 33.39ex instead of 2058ex (62x under),
   * and a player's "I don't have Perfect Chaos" would have been ignored, since `allowsStep` reads this
   * same key.
   */
  readonly tier?: CurrencyTier;
  /** Regular-essence level (lesser/normal/greater) — selects `essence_*`. */
  readonly essenceLevel?: string;
  /** Side constraint that costs a Sinistral/Dextral omen on exalt and desecrate. */
  readonly constrainTo?: AffixType;
  /** Side (or Light) omen on annul and perfect-essence; Whittling on chaos. */
  readonly omen?: AnnulOmen | EssenceOmen | ChaosOmen;
  /** Which boss pool a desecration draws from — each is its own omen. */
  readonly boss?: DesecrationBossOmen;
  /** The mod an essence forces. Read ONLY for essence pricing — see the note above. */
  readonly add?: string;
}

/** Where a price sheet came from — carried so the UI can be honest about how firm the numbers are. */
export interface PricesMeta {
  readonly patch?: string;
  /** ISO date the sheet was authored. */
  readonly generated?: string;
  readonly updated?: string;
  /** Free text describing provenance (e.g. "Currency from poe.ninja's PoE2 economy API…"). */
  readonly source?: string;
  readonly unit?: string;
  /** True when the sheet is hand-authored guesswork rather than observed market data. Every cost the
   *  optimizer reports is only as good as this, so the UI must not present those costs as exact. */
  readonly estimated?: boolean;
  /** What specifically is estimated, when a sheet is part-observed and part-guessed. Without this the
   *  UI can only say "all guesses" — an overclaim in the opposite direction once most keys are live. */
  readonly caveat?: string;
}

export interface Prices {
  /** Base currency price in exalt-equivalents, keyed by currency (transmute, exalt, perfect_essence, …). */
  readonly currency: Record<string, number>;
  /** What a Desecration costs, by the bone it consumes — see `pricesForBase`. */
  readonly bones?: Record<string, number>;
  /** Surcharge for using an omen, keyed by omen id (OmenofSinistralExaltation, …). */
  readonly omens: Record<string, number>;
  /** Provenance, when the source file carried any. */
  readonly meta?: PricesMeta;
}

export interface PricesFile {
  patch?: string; prices: Record<string, number>; omens?: Record<string, number>;
  bones?: Record<string, number>;
  generated?: string; updated?: string; source?: string; unit?: string; estimated?: boolean;
  caveat?: string;
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
    ...(file.caveat !== undefined ? { caveat: file.caveat } : {}),
    estimated,
  };
  return {
    currency: file.prices,
    omens: file.omens ?? {},
    ...(file.bones ? { bones: file.bones } : {}),
    meta,
  };
}

/**
 * The `prices.currency` key a step maps to, including its orb strength — e.g. an exalt step with
 * `tier: 'greater'` costs `exalt_greater`. Base tier (or no tier) uses the plain currency key.
 *
 * A missing key is charged 0 by `stepCost`, so a caller enumerating strengths must skip one the sheet
 * does not list rather than let it come back free — see `leverOptions`. **Exported for exactly that**:
 * `leverOptions` used to rebuild the key inline as `` `${step.currency}_${tier}` ``, which agreed with
 * this function only by coincidence and stopped agreeing the moment a step's currency name differed
 * from the orb it buys — a `greater-exalt` would have been gated on a nonexistent
 * `greater-exalt_perfect` key, so every strength above base would have been silently skipped. One
 * function, one key: the same rule the D8 mispricing was fixed by.
 */
export function currencyKey(step: PricedStep): string {
  // Essences are priced per ESSENCE, not per level — `essence:<level>:<modId>` — because the market
  // prices each one separately and their levels don't form a ladder. The old per-level keys remain
  // the fallback for a sheet that predates this (or an essence with no listing).
  if (step.currency === 'perfect-essence' || step.currency === 'essence') {
    const level = step.currency === 'perfect-essence' ? 'perfect' : (step.essenceLevel ?? 'normal');
    return step.add ? `essence:${level}:${step.add}` : legacyEssenceKey(step);
  }
  // An Omen of Greater Exaltation is spent ON an Exalted Orb, so the orb is what the sheet charges
  // for and `exalt`/`exalt_greater`/`exalt_perfect` is the right key — the omen itself is a separate
  // surcharge in `stepOmenIds`. Keying it as its own currency would have made it FREE (no such key on
  // the sheet) and made "I don't own Exalted Orbs" stop excluding it, since `allowsStep` reads this.
  const orb = step.currency === 'greater-exalt' ? 'exalt' : step.currency;
  // Which currencies the sheet sells at a strength. NOT "is this an add" — a chaos both removes and
  // adds, and it belongs here because `chaos_greater` / `chaos_perfect` are real listings.
  const hasStrengths = orb === 'transmute' || orb === 'augment'
    || orb === 'regal' || orb === 'exalt' || orb === 'chaos';
  if (hasStrengths && step.tier && step.tier !== 'base') return `${orb}_${step.tier}`;
  return orb;
}

/**
 * Every omen id a step invokes (for the omen surcharge); empty when it uses none. A step can invoke
 * MORE than one: a Desecration may carry both a boss omen (which pool it draws from) and a
 * Sinistral/Dextral Necromancy omen (which side it draws on) — two separate omens, two surcharges.
 */
export function stepOmenIds(step: PricedStep): string[] {
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
    // The Omen of Whittling: "your next Chaos Orb will remove the lowest level modifier". A CHAOS
    // omen — traced to poe2db 2026-09-02, internal id OmenOnChaosLowestLevelMod.
    //
    // `constrainTo` on a chaos step is deliberately NOT priced here, and must not be "fixed" by
    // treating it as an Erasure omen. The two traced chaos side-omens — Sinistral and Dextral Erasure
    // — constrain what a Chaos Orb REMOVES ("will remove only prefix modifiers"), whereas this field
    // tunes what the step ADDS (`addOpts` feeds it to the exalt half). They are different mechanics
    // that happen to share a word. Nothing emits a chaos `constrainTo` today, so the field is inert;
    // pricing it as Erasure would charge for an omen that does something else.
    case 'chaos':
      return step.omen === 'whittling' ? ['OmenofWhittling'] : [];
    // The Omen of Greater Exaltation is not optional on this step — it IS the step. A `greater-exalt`
    // without it is just an Exalt, which the plan vocabulary already has, so there is no unomened
    // variant to branch on the way `constrainTo` branches above.
    case 'greater-exalt':
      return ['OmenofGreaterExaltation'];
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

/**
 * The price sheet as it applies to ONE base.
 *
 * A Desecration consumes a bone, and which bone depends on the gear: "Desecrates a Rare Weapon or
 * Quiver" (jawbone, 0.20ex) vs "a Rare Armour" (rib, 0.31ex) vs "a Rare Amulet, Ring or Belt"
 * (collarbone, 7.69ex) — a 38x spread the old single `desecrate` key could not express.
 *
 * Resolved once per solve rather than per step, because the base is a property of the CRAFT while
 * `PricedStep` describes one action. Threading a base through every step to answer a question that
 * cannot vary within a plan would be noise; every planner entry point already holds the base.
 *
 * A sheet with no `bones` block is left untouched, so older data keeps working off the flat key.
 */
export function pricesForBase(prices: Prices, base: ItemBase): Prices {
  const price = prices.bones?.[desecrationBoneFor(base.category)];
  return price === undefined ? prices : { ...prices, currency: { ...prices.currency, desecrate: price } };
}

/**
 * Currencies and omens the player says they do not have, as price-sheet keys ('chaos_perfect',
 * 'OmenofLight', …). A planner must never hand back a plan that uses one: it would be optimal advice
 * the player cannot act on.
 */
export interface CurrencyPolicy {
  readonly excluded: ReadonlySet<string>;
}

/**
 * Whether a step is available under `policy`. No policy means everything is.
 *
 * Deliberately derived from the same `currencyKey` / `stepOmenIds` that price the step: "what does
 * this cost" and "am I allowed this" are two questions about one descriptor, and answering them from
 * two different mappings is exactly how the D8 desecration bug hid — one planner learned about a
 * lever and the other did not. A step is out if its orb is excluded, or ANY omen it invokes is (a
 * Desecration can invoke two, and being unable to afford either one blocks the step).
 */
export function allowsStep(policy: CurrencyPolicy | undefined, step: PricedStep): boolean {
  if (!policy || policy.excluded.size === 0) return true;
  if (policy.excluded.has(currencyKey(step))) return false;
  return !stepOmenIds(step).some((id) => policy.excluded.has(id));
}

/** An essence mod's level (its tiers ARE Lesser/Normal/Greater), read from the tier name for pricing. */
export function essenceLevelOf(tierName: string | undefined): string {
  const n = (tierName ?? '').toLowerCase();
  if (n.startsWith('lesser')) return 'lesser';
  if (n.startsWith('greater')) return 'greater';
  return 'normal';
}

/**
 * Which ESSENCE LEVEL to buy for a target that will accept tier `minIndex` or better.
 *
 * Both planners used to take `minIndex` itself, on the reasonable-sounding assumption that a weaker
 * essence is a cheaper one. The sheet says otherwise, and not marginally: **Essence of Abrasion runs
 * Lesser 116ex, Normal 107ex, Greater 0.81ex.** An essence mod's tiers ascend, so every level at or
 * above `minIndex` satisfies the target AND rolls better stats — buying the named one was quoting
 * ~140x the price of a strictly better item. Since the optimizer ranks plans BY cost, that is a wrong
 * recommendation, not merely a wrong total.
 *
 * ONE function, called by both planners, and that is the point rather than tidiness: the linear
 * planner and the MDP pricing the same step differently is exactly how the D8 desecration mispricing
 * survived. They cannot drift while they share this.
 *
 * Priced through `stepCost` rather than the raw key so the `essence_<lvl>` fallback is respected — a
 * level whose per-mod entry is missing must be compared at what it will actually be charged, or the
 * choice and the bill disagree. Ties keep the lowest index, so a sheet with one flat price reproduces
 * the old behaviour exactly. Levels the item outranks are skipped (`tier.ilvl > itemLevel`), which is
 * the same gate `essenceForcedProbability` applies.
 */
export function cheapestEssenceLevel(
  prices: Prices, mod: Mod, minIndex: number, itemLevel: number,
): number {
  const lo = Math.max(0, Math.min(mod.tiers.length - 1, minIndex));
  let best = lo;
  let bestCost = Infinity;
  for (let j = lo; j < mod.tiers.length; j++) {
    const tier = mod.tiers[j];
    if (tier === undefined || tier.ilvl > itemLevel) continue;
    const c = stepCost(prices, {
      currency: 'essence', add: mod.id, essenceLevel: essenceLevelOf(tier.name),
    });
    if (c < bestCost) { best = j; bestCost = c; }
  }
  // Every level outranked by the item: nothing is buyable, so hand back the one the target named and
  // let the caller's own ilvl gate refuse it. Choosing here would hide the refusal.
  return bestCost === Infinity ? lo : best;
}

/** The pre-per-essence key: one price per LEVEL. Still used when a sheet has no per-essence entry. */
function legacyEssenceKey(step: PricedStep): string {
  if (step.currency === 'perfect-essence') return 'perfect_essence';
  const lvl = step.essenceLevel;
  return lvl === 'lesser' || lvl === 'greater' ? `essence_${lvl}` : 'essence';
}

/** Cost of a single step: its currency price plus any omen surcharge. Unknown keys cost 0. */
export function stepCost(prices: Prices, step: PricedStep): number {
  const key = currencyKey(step);
  // Fall back to the per-level price when this specific essence isn't in the sheet, rather than
  // charging 0 — a free essence would look like a bargain and dominate every frontier.
  const base = prices.currency[key]
    ?? (key.startsWith('essence:') ? prices.currency[legacyEssenceKey(step)] ?? 0 : 0);
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
  const h = exact ? quantum : budget / maxCells;
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
