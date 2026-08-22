// What a "compute" actually is, as data rather than as a pile of calls at a click handler.
//
// The heavy planners used to run inline on the main thread, so pressing Compute froze the tab — a
// 3-target from-item craft blocks for ~3.9 seconds, and value iteration is only ~11% of that (the rest
// is building the action lattice), so no tuning was going to fix it. They now run in a Web Worker.
//
// Crossing a worker boundary means a request has to be describable as a plain message, which is what
// this file is for: `SolveRequest` names the two computes the UI can ask for, and `runSolve` performs
// one. It stays free of Worker and DOM so it can be unit-tested directly — the worker adapter around
// it (engine.worker.ts) is then thin enough to hold no logic worth testing, which matters because
// jsdom has no Worker at all.

import type { Engine } from './engine.ts';
import { optimize, optimizeItem, optimizeItemMarkov, alternatives, alternativesForItem } from './engine.ts';
import type {
  AltTargetInput, EngineAlternatives, EngineMarkovResult, EngineResult, ExistingItem, TargetInput,
} from './engineTypes.ts';
import type { MarkovProgress } from '../../packages/optimizer/src/markovFromItem.ts';
import type { CurrencyPolicy } from '../../packages/optimizer/src/cost.ts';

/**
 * The two computes the UI can ask for, each mirroring one existing Compute button:
 *  - `lab`  — the Engine Lab's planner: a cost↔probability frontier, plus the budget near-miss list
 *             when a budget is set. Starts from a white base, or from the carved item when the user
 *             has marked fractured mods.
 *  - `item` — the from-item planner: the same frontier for an item you hold, plus the MDP's true
 *             expected cost and policy graph.
 */
interface ExcludingRequest {
  /**
   * Price-sheet keys for currencies and omens the player doesn't have ('chaos_perfect',
   * 'OmenofLight', …). An array, not a Set, so the worker message is plainly structured-clone-safe;
   * `runSolve` rebuilds the Set once per solve.
   */
  readonly excluded?: readonly string[];
}

export type SolveRequest =
  | ({
      readonly kind: 'lab';
      /** A white base to craft from, or the item the fractured mods carve out. */
      readonly from: { readonly baseId: string; readonly level: number } | { readonly item: ExistingItem };
      readonly targets: readonly TargetInput[];
      /** Set to also answer "what does this much money actually buy?". */
      readonly budget?: number;
      /** Targets with pins applied, for the budget search. Defaults to `targets`. */
      readonly want?: readonly AltTargetInput[];
    } & ExcludingRequest)
  | ({
      readonly kind: 'item';
      readonly item: ExistingItem;
      readonly targets: readonly TargetInput[];
    } & ExcludingRequest);

export type SolveResult =
  | { readonly kind: 'lab'; readonly result: EngineResult; readonly alts: EngineAlternatives | null }
  | { readonly kind: 'item'; readonly plan: EngineResult; readonly markov: EngineMarkovResult };

/**
 * Every phase that can report. `item` runs the MDP's three; `lab` runs planning and, when a budget is
 * set, the budget search.
 */
export type SolvePhase = MarkovProgress['phase'] | 'plan' | 'alternatives';

/**
 * How far along a solve is, as a single 0–1 fraction the UI can render directly.
 *
 * The solvers deliberately report only raw done/total counts, because weighting phases against each
 * other is a presentation call — and they are nowhere near equal in wall-clock terms.
 */
export interface SolveProgress {
  readonly phase: SolvePhase;
  readonly fraction: number;
}

type Span = readonly [number, number];

/** Place `done/total` inside a span. Total 0 means "nothing to do", which is done, not undefined. */
function within(span: Span, done: number, total: number): number {
  const f = total > 0 ? Math.min(1, Math.max(0, done / total)) : 1;
  return span[0] + (span[1] - span[0]) * f;
}

/**
 * Wall-clock share of each MDP phase, from measurement rather than intuition: on a 3-target Wand
 * craft, raising `tolerance` from 1e-9 to 1e-1 (which all but removes value iteration) moved the total
 * only 3877ms → 3458ms. So building the action distributions is ~89% of the work and VI ~11%, and a
 * bar split evenly across the three would stall for three seconds and then sprint.
 */
const MDP_SPAN: Record<MarkovProgress['phase'], Span> = {
  actions: [0, 0.85],
  compile: [0.85, 0.92],
  solve: [0.92, 1],
};

/**
 * A lab compute's split depends on whether a budget was set, which is why these can't be a static
 * per-phase table like the MDP's. With a budget the search dominates by two orders of magnitude (at 6
 * targets: ~64ms planning against ~7.3s searching); without one, planning IS the whole compute — and
 * planning alone can still be slow enough to watch, which is how the bar came to sit at 0%.
 */
const LAB_PLAN_ALONE: Span = [0, 1];
const LAB_PLAN_THEN_SEARCH: Span = [0, 0.1];
const LAB_SEARCH: Span = [0.1, 1];

/** Map the MDP's raw counts onto one monotone 0–1 fraction. */
export function toFraction(p: MarkovProgress): number {
  return within(MDP_SPAN[p.phase], p.done, p.total);
}

/** Perform one solve. Pure compute — no Worker, no DOM — so tests can call it directly. */
export function runSolve(eng: Engine, req: SolveRequest, onProgress?: (p: SolveProgress) => void): SolveResult {
  const report = onProgress
    ? (p: MarkovProgress): void => onProgress({ phase: p.phase, fraction: toFraction(p) })
    : undefined;
  // Built once per solve, then shared by every planner below — they must all run under the same rules,
  // or the frontier and the MDP could recommend plans the other considers unbuildable.
  const policy: CurrencyPolicy | undefined = req.excluded?.length
    ? { excluded: new Set(req.excluded) }
    : undefined;
  const withPolicy = <T extends object>(o: T): T => (policy ? { ...o, policy } : o);

  if (req.kind === 'item') {
    const plan = optimizeItem(eng, req.item, req.targets, withPolicy({}));
    // The honest expected cost + optimal-policy graph. Reports its own progress because it is the only
    // call here that takes long enough to need one (seconds, against milliseconds for the others).
    const markov = optimizeItemMarkov(eng, req.item, req.targets, withPolicy(report ? { onProgress: report } : {}));
    return { kind: 'item', plan, markov };
  }

  const from = req.from;
  // A budget also asks the near-miss question: what's the closest thing this much money actually buys?
  const budget = req.budget;
  const hasBudget = budget !== undefined && Number.isFinite(budget) && budget > 0;
  const emit = (phase: SolvePhase, span: Span) =>
    (done: number, total: number): void => onProgress?.({ phase, fraction: within(span, done, total) });

  const planOpts = withPolicy(onProgress
    ? { onProgress: emit('plan', hasBudget ? LAB_PLAN_THEN_SEARCH : LAB_PLAN_ALONE) }
    : {});
  const result = 'item' in from
    // The from-item planner has no progress reporting of its own yet; a carved craft therefore shows
    // no movement until the budget search starts.
    ? optimizeItem(eng, from.item, req.targets, withPolicy({}))
    : optimize(eng, from.baseId, from.level, req.targets, planOpts);

  if (!hasBudget) {
    onProgress?.({ phase: 'plan', fraction: 1 });
    return { kind: 'lab', result, alts: null };
  }

  // The slow half of a lab compute when a budget is set — every node it visits is a full Pareto run.
  const want = req.want ?? req.targets;
  const altOpts = withPolicy(onProgress ? { onProgress: emit('alternatives', LAB_SEARCH) } : {});
  const alts = 'item' in from
    ? alternativesForItem(eng, from.item, want, budget, altOpts)
    : alternatives(eng, from.baseId, from.level, want, budget, altOpts);
  // The search can stop just short of its node cap (196 of 200 is typical), which would leave the bar
  // sitting at 98% while the work is finished. Say so explicitly, as the MDP path does.
  onProgress?.({ phase: 'alternatives', fraction: 1 });
  return { kind: 'lab', result, alts };
}
