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
  /**
   * The player's "how hard should I look?" limits (src/lib/searchEffort.ts). Plain numbers so the
   * worker message stays trivially structured-clone-safe, same reasoning as `excluded` above.
   * Absent ⇒ each planner keeps its own built-in default, which is what tests rely on.
   */
  readonly effort?: {
    readonly maxMillis: number;
    readonly maxNodes: number;
    readonly maxPlans: number;
  };
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
 * Wall-clock share of each MDP phase. Measured — and the measurement does not hold still, which is the
 * point of this note:
 *
 *   3-target Wand craft   actions ~89%   VI ~11%   (VI converges in tens of sweeps)
 *   5-target Wand craft   actions  0.2%  VI ~99%   (54ms vs 24.4s — VI never converges, burning its
 *                                                   whole sweep budget)
 *
 * So the split depends on whether value iteration converges, which is not knowable before running it.
 * The old weights came from the first craft alone and gave `actions` 85% of the bar; on the second the
 * bar reached 85% in 54ms and then crawled for 24 seconds, which reads as a hang. These weights are a
 * compromise: neither craft sprints-then-stalls, and neither stalls-then-sprints.
 */
const MDP_SPAN: Record<MarkovProgress['phase'], Span> = {
  actions: [0, 0.4],
  compile: [0.4, 0.45],
  solve: [0.45, 1],
};

/**
 * An item compute runs the step planner and then the MDP. Measured on the reported craft: ~3.2s for
 * the step planner against an MDP that runs to its cap (15s at the Standard effort). The step planner
 * used to report nothing at all, so the bar sat motionless through its share.
 */
const ITEM_PLAN: Span = [0, 0.2];
const ITEM_MDP: Span = [0.2, 1];
/** Share of the effort budget the step planner may spend before the MDP takes the rest. */
const ITEM_PLAN_SHARE = 0.4;

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
  // Built once per solve, then shared by every planner below — they must all run under the same rules,
  // or the frontier and the MDP could recommend plans the other considers unbuildable.
  const policy: CurrencyPolicy | undefined = req.excluded?.length
    ? { excluded: new Set(req.excluded) }
    : undefined;
  const withPolicy = <T extends object>(o: T): T => (policy ? { ...o, policy } : o);
  // Each limit goes to the planner that owns it: relaxed targets to the budget search, enumerated
  // plans to the orb-strength search. The wall clock is NOT one of these — an item compute shares a
  // single budget across its two planners, which is done inline below. Absent ⇒ the planner's own
  // default stands.
  const eff = req.effort;
  const withPlanLimit = <T extends object>(o: T): T => (eff ? { ...o, maxPlans: eff.maxPlans } : o);
  const withNodeLimit = <T extends object>(o: T): T => (eff ? { ...o, maxNodes: eff.maxNodes } : o);

  if (req.kind === 'item') {
    // Establish the bar's origin here rather than relying on the planner's first report: when the item
    // already IS the target the step planner returns immediately and reports nothing, so the first
    // thing the bar would otherwise show is the MDP's share — a jump to 20% before anything ran.
    onProgress?.({ phase: 'plan', fraction: 0 });
    // ONE budget across both halves, not one each — the effort preset promises a wall clock for the
    // compute, and handing `maxMillis` to each planner independently would quietly double it.
    //
    // The MDP gets priority because it is the better model: it adapts and recovers in place, where the
    // step planner prices one fixed sequence against a free-restart assumption a held item cannot
    // satisfy. So the step planner is capped at a minority share and the MDP inherits everything left,
    // including whatever the step planner didn't spend (measured: it wants ~3.2s).
    const started = Date.now();
    const planShare = eff ? Math.max(1_000, Math.round(eff.maxMillis * ITEM_PLAN_SHARE)) : undefined;
    const planOnProgress = onProgress
      ? { onProgress: (done: number, total: number): void => onProgress({ phase: 'plan', fraction: within(ITEM_PLAN, done, total) }) }
      : {};
    const planOpts = withPlanLimit(withPolicy(planOnProgress));
    const plan = optimizeItem(eng, req.item, req.targets, planShare === undefined ? planOpts : { ...planOpts, maxMillis: planShare });
    // The honest expected cost + optimal-policy graph.
    const mdpReport = onProgress
      ? { onProgress: (p: MarkovProgress): void => onProgress({ phase: p.phase, fraction: within(ITEM_MDP, toFraction(p) * 1000, 1000) }) }
      : {};
    const mdpOpts = withPolicy(mdpReport);
    const markov = optimizeItemMarkov(eng, req.item, req.targets, eff
      // A floor rather than the bare remainder: a step search that ate the whole budget would leave the
      // MDP zero sweeps and a value of 0, which renders as "≥ 0" — technically true, useless to read.
      ? { ...mdpOpts, maxMillis: Math.max(2_000, eff.maxMillis - (Date.now() - started)) }
      : mdpOpts);
    return { kind: 'item', plan, markov };
  }

  const from = req.from;
  // A budget also asks the near-miss question: what's the closest thing this much money actually buys?
  const budget = req.budget;
  const hasBudget = budget !== undefined && Number.isFinite(budget) && budget > 0;
  const emit = (phase: SolvePhase, span: Span) =>
    (done: number, total: number): void => onProgress?.({ phase, fraction: within(span, done, total) });

  const planOpts = withPlanLimit(withPolicy(onProgress
    ? { onProgress: emit('plan', hasBudget ? LAB_PLAN_THEN_SEARCH : LAB_PLAN_ALONE) }
    : {}));
  const result = 'item' in from
    // The from-item planner has no progress reporting of its own yet; a carved craft therefore shows
    // no movement until the budget search starts.
    ? optimizeItem(eng, from.item, req.targets, withPlanLimit(withPolicy({})))
    : optimize(eng, from.baseId, from.level, req.targets, planOpts);

  if (!hasBudget) {
    onProgress?.({ phase: 'plan', fraction: 1 });
    return { kind: 'lab', result, alts: null };
  }

  // The slow half of a lab compute when a budget is set — every node it visits is a full Pareto run.
  const want = req.want ?? req.targets;
  const altOpts = withNodeLimit(withPolicy(onProgress ? { onProgress: emit('alternatives', LAB_SEARCH) } : {}));
  const alts = 'item' in from
    ? alternativesForItem(eng, from.item, want, budget, altOpts)
    : alternatives(eng, from.baseId, from.level, want, budget, altOpts);
  // The search can stop just short of its node cap (196 of 200 is typical), which would leave the bar
  // sitting at 98% while the work is finished. Say so explicitly, as the MDP path does.
  onProgress?.({ phase: 'alternatives', fraction: 1 });
  return { kind: 'lab', result, alts };
}
