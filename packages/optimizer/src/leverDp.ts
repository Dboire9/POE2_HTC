// Choosing every step's orb strength and omen at once, without enumerating their product.
//
// THE PROBLEM. A plan's cost is `planExpectedCost`'s free-restart figure and its value is its success
// probability, and both move when you change any step's orb. With three strengths and an optional omen
// per step, a five-add plan has hundreds of assignments and a from-item search has thousands of plans;
// their product is the 71.9-million-plan search that made this axis look unaffordable.
//
// THE STRUCTURE THAT DISSOLVES IT. Rewrite `planExpectedCost`:
//
//     E = (Σ_k c_k · S_{k-1}) / S_n   where S_k = Π_{i≤k} p_i
//       = Σ_k c_k / T_k               where T_k = Π_{i≥k} p_i   (the SUFFIX product)
//
// so `T_k = p_k · T_{k+1}` and `E_k = E_{k+1} + c_k / T_k`. Both depend on the suffix alone. And the
// levers do not touch the state trajectory (see `levers.ts`), so step k's options are the same
// whatever was chosen after it. A backward pass over the steps therefore computes every Pareto-optimal
// assignment directly, and the search stops being a product and becomes a sum.
//
// WHY PRUNING IS EXACT, not a heuristic. Take two partial suffixes with `T_a ≥ T_b` and `E_a ≤ E_b` —
// `a` is at least as likely and no dearer. Extend both by the same option `(p, c)`:
//
//     T'_a = p·T_a ≥ p·T_b = T'_b        and        E'_a = E_a + c/(p·T_a) ≤ E_b + c/(p·T_b) = E'_b
//
// because `c ≥ 0` and `T_a ≥ T_b`. Domination survives every extension, so a dominated point can never
// come back — dropping it loses nothing. The output frontier is identical to brute force, and
// `leverDp.test.ts` checks that against an actual brute force rather than taking the algebra's word.
//
// The proof needs `c ≥ 0` and `p > 0`. `leverOptions` guarantees both.
//
// WHY THE FRONTIER STAYS SMALL. Subtracting the two extensions above:
//
//     E'_a − E'_b = (E_a − E_b) − (c/p)·(1/T_b − 1/T_a)
//
// The subtracted term is strictly positive whenever `c > 0`, so every step that costs anything erodes
// the gap between two incomparable points until one of them dies. Incomparability only survives where
// step costs are small next to the spread in E. That is a mechanism, not luck, and it is why
// `MAX_FRONTIER` has never been observed to bind.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import { planStates } from '../../engine/src/plan.ts'; // not the index — it re-exports node:fs users
import type { CurrencyPolicy, Prices } from './cost.ts';
import type { StepLever } from './levers.ts';
import { leverOptions } from './levers.ts';

/**
 * One lever assignment for a skeleton.
 *
 * `probability` and `expected` are the DP's OWN arithmetic and are provisional. They associate the
 * products differently from `evaluatePlanFrom` (`p₀·(p₁·p₂)` against `((p₀·p₁)·p₂)`), so they can differ by
 * an ulp. Rank with them; report `evaluatePlanFrom` + `planExpectedCost` on the survivors.
 */
export interface LeverCandidate {
  readonly steps: PlanStep[];
  readonly probability: number;
  readonly expected: number;
}

export interface LeverSearch {
  /** Pareto-optimal assignments, cheapest-first. Empty when some step has no viable option at all. */
  readonly candidates: LeverCandidate[];
  /**
   * How many assignments this skeleton stands for — the honest "plans searched" count, over the
   * options as OFFERED. The DP evaluates a small fraction of them and proves the rest cannot win.
   */
  readonly combinations: number;
  /** True if `maxFrontier` bound, making `candidates` a SUBSET of the true frontier. */
  readonly capped: boolean;
}

/**
 * Safety cap on the carried frontier — 17x the worst seen across 4,000 adversarial simulations
 * (peak 15, on option products up to 6e7). It exists so a pathological price sheet degrades instead of
 * hanging, and a caller that sees `capped` must say so rather than quote a frontier as complete.
 */
export const MAX_FRONTIER = 256;

/**
 * Drop the options another already beats — at least as likely, and no dearer.
 *
 * The same argument as the frontier prune below, applied one step earlier and therefore far more
 * cheaply: an option that loses on both axes loses for EVERY suffix that could follow it, so it can go
 * before the DP starts rather than being carried through it. On the live sheet this routinely collapses
 * six options to one, wherever a higher ilvl floor both costs more and lands the target less often.
 */
function usable(options: readonly StepLever[]): StepLever[] {
  return options.filter((a, i) => !options.some((b, j) =>
    j !== i && b.prob >= a.prob && b.cost <= a.cost && (b.prob > a.prob || b.cost < a.cost || j < i)));
}

/** A partial suffix: its tail product, its cost-to-go, and the chain that built it. */
interface Node {
  readonly t: number;
  readonly e: number;
  readonly pick: number;
  readonly next: Node | null;
}

/**
 * Keep the non-dominated nodes, cheapest-first.
 *
 * Tolerance ZERO, where `paretoFrontier` uses `probability > best + 1e-12`. The risk runs one way: a
 * point dropped here that the final filter would have kept is an answer lost for good, while a point
 * kept here that the final filter drops costs one re-score. So this prune has to be the more
 * PERMISSIVE of the two.
 *
 * Adopting the 1e-12 slack here would in fact be harmless — `paretoFrontier` applies it downstream
 * anyway, so anything this dropped for it would have been dropped there too, and a mutation test
 * confirms the swap changes no result. Zero is kept because "as permissive as the final filter, or
 * more" is the property worth being able to state, and a second tolerance to keep in step with the
 * first is a liability rather than a saving.
 */
function prune(nodes: Node[]): Node[] {
  nodes.sort((a, b) => a.e - b.e || b.t - a.t);
  const out: Node[] = [];
  let best = -Infinity;
  for (const n of nodes) {
    if (n.t > best) {
      out.push(n);
      best = n.t;
    }
  }
  return out;
}

/** Thin an over-long frontier, keeping both ends and an even spread between them. */
function thin(nodes: Node[], keep: number): Node[] {
  if (keep <= 1) return nodes.slice(0, 1); // cheapest survives; there is no spread to keep
  const out: Node[] = [];
  for (let i = 0; i < keep; i++) out.push(nodes[Math.round((i * (nodes.length - 1)) / (keep - 1))]!);
  return [...new Set(out)];
}

/**
 * Every Pareto-optimal way to buy `skeleton`, in one backward pass.
 *
 * `skeleton` must carry no lever fields of its own (no `tier`, `constrainTo` or `omen`) — this decides
 * them. It may be a plan that cannot actually be run; a step no option can make happen returns no
 * candidates, which is the same answer the old enumerate-then-score path reached by scoring 0.
 */
export function bestLeverAssignments(
  data: PatchData, prices: Prices, start: ItemState, skeleton: readonly PlanStep[],
  policy?: CurrencyPolicy, opts: { maxFrontier?: number } = {},
): LeverSearch {
  const states = planStates(data, start, skeleton);
  const offered = skeleton.map((step, k) => leverOptions(data, prices, states[k]!, step, policy));
  if (offered.some((o) => o.length === 0)) return { candidates: [], combinations: 0, capped: false };

  // Counted BEFORE domination pruning: a dominated option is a plan this search ruled out, not one it
  // failed to consider, and the "plans checked" figure should say so.
  const combinations = offered.reduce((n, o) => n * o.length, 1);
  const options = offered.map(usable);
  const limit = opts.maxFrontier ?? MAX_FRONTIER;
  let capped = false;

  // Backward: a node at step k stands for the suffix from k onward, so the terminal is "nothing left
  // to do" — costs nothing, and lands with certainty.
  let frontier: Node[] = [{ t: 1, e: 0, pick: -1, next: null }];
  for (let k = skeleton.length - 1; k >= 0; k--) {
    const next: Node[] = [];
    for (const node of frontier) {
      for (let i = 0; i < options[k]!.length; i++) {
        const o = options[k]![i]!;
        const t = o.prob * node.t;
        next.push({ t, e: node.e + o.cost / t, pick: i, next: node });
      }
    }
    frontier = prune(next);
    if (frontier.length > limit) {
      frontier = thin(frontier, limit);
      capped = true;
    }
  }

  // A node at step 0 chains forward through the whole plan, so the walk reads out in step order.
  const candidates = frontier.map((node): LeverCandidate => {
    const steps: PlanStep[] = [];
    let cur: Node | null = node;
    for (let k = 0; k < skeleton.length && cur !== null; k++) {
      steps.push(options[k]![cur.pick]!.step);
      cur = cur.next;
    }
    return { steps, probability: node.t, expected: node.e };
  });
  return { candidates, combinations, capped };
}

/** Report roughly this many times across a run: frequent enough to animate, rare enough to be free. */
export const PROGRESS_REPORTS = 100;

/** Prune past this many held candidates. Amortises the sort without letting memory run away. */
const NARROW_AT = 4_096;

export interface SkeletonSearch {
  /**
   * The Pareto-optimal assignments across every skeleton, on the DP's own PROVISIONAL arithmetic.
   * Score them with `evaluatePlanFrom` + `planExpectedCost` before reporting anything — see
   * `LeverCandidate`. A margin is kept around the frontier so the re-score, not the DP, decides ties.
   */
  readonly candidates: LeverCandidate[];
  /** Assignments this search stands for. Most are ruled out by proof rather than by evaluation. */
  readonly searched: number;
  /** The clock ran out, or a skeleton's frontier hit its cap — either way the answer is partial. */
  readonly truncated: boolean;
}

export interface SkeletonSearchOptions {
  readonly policy?: CurrencyPolicy;
  /** Wall-clock ceiling. Absent in tests, so results stay deterministic and machine-independent. */
  readonly maxMillis?: number;
  readonly onProgress?: (done: number, total: number) => void;
}

/**
 * Drop the candidates that can no longer reach the frontier, keeping a hair's margin for ties.
 *
 * The margin is the point. Ranking happens on the DP's arithmetic and reporting happens on
 * `evaluatePlanFrom`'s, and the two associate their products differently — so a candidate the DP puts
 * a few ulps behind another may come out ahead once re-scored. Cutting exactly at the DP's numbers
 * would decide those ties with the wrong ruler; `paretoFrontier` decides them afterwards with the
 * right one.
 *
 * In place, because this runs inside the search loop on a list that is mostly kept.
 */
function narrowInPlace(rows: LeverCandidate[]): void {
  rows.sort((a, b) => a.expected - b.expected || b.probability - a.probability);
  let best = 0; // every probability is > 0, so this admits the first row without a special case
  let n = 0;
  for (const r of rows) {
    if (r.probability > best * (1 - 1e-9)) {
      rows[n++] = r;
      if (r.probability > best) best = r.probability;
    }
  }
  rows.length = n;
}

/**
 * Run the lever DP over a list of skeletons and keep what could still reach the frontier.
 *
 * The shape both planners share: enumerate sequence SKELETONS (which mods, in which order, by which
 * currency), then let this decide every step's orb strength and omen. Splitting it that way is what
 * turned a `K! x Π|strengths| x 2^omens` product into a sum — the skeletons are still enumerated, but
 * the levers on them are not.
 *
 * Narrowed as it goes rather than at the end: a big craft has tens of thousands of skeletons, and
 * holding every one's candidates would cost far more memory than the answer is worth. Re-scoring per
 * skeleton would be worse still — roughly half the win — and buys nothing, since a candidate the
 * global filter already beats cannot come back.
 */
export function searchSkeletons(
  data: PatchData, prices: Prices, start: ItemState,
  skeletons: readonly (readonly PlanStep[])[], opts: SkeletonSearchOptions = {},
): SkeletonSearch {
  const report = opts.onProgress;
  const stride = Math.max(1, Math.floor(skeletons.length / PROGRESS_REPORTS));
  const deadline = opts.maxMillis === undefined ? Infinity : Date.now() + opts.maxMillis;
  const DEADLINE_CHECK = 64; // Date.now() per skeleton would be measurable; per 64 is not
  let truncated = false;
  let searched = 0;
  const candidates: LeverCandidate[] = [];

  for (let i = 0; i < skeletons.length; i++) {
    // `>=` rather than `>`: it makes a zero budget mean "do nothing" deterministically, which is what
    // makes this testable without a wall-clock race. The 1ms difference is otherwise immaterial, and
    // the app floors the budget well above zero.
    if (deadline !== Infinity && i % DEADLINE_CHECK === 0 && Date.now() >= deadline) {
      truncated = true;
      break;
    }
    const dp = bestLeverAssignments(data, prices, start, skeletons[i]!, opts.policy);
    searched += dp.combinations;
    if (dp.capped) truncated = true; // a capped frontier is a SUBSET, and the caller must say so
    for (const c of dp.candidates) candidates.push(c);
    if (candidates.length > NARROW_AT) narrowInPlace(candidates);
    if (report && i % stride === 0) report(i, skeletons.length);
  }
  report?.(skeletons.length, skeletons.length);
  narrowInPlace(candidates);
  return { candidates, searched, truncated };
}
