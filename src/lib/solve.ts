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

/**
 * The two computes the UI can ask for, each mirroring one existing Compute button:
 *  - `lab`  — the Engine Lab's planner: a cost↔probability frontier, plus the budget near-miss list
 *             when a budget is set. Starts from a white base, or from the carved item when the user
 *             has marked fractured mods.
 *  - `item` — the from-item planner: the same frontier for an item you hold, plus the MDP's true
 *             expected cost and policy graph.
 */
export type SolveRequest =
  | {
      readonly kind: 'lab';
      /** A white base to craft from, or the item the fractured mods carve out. */
      readonly from: { readonly baseId: string; readonly level: number } | { readonly item: ExistingItem };
      readonly targets: readonly TargetInput[];
      /** Set to also answer "what does this much money actually buy?". */
      readonly budget?: number;
      /** Targets with pins applied, for the budget search. Defaults to `targets`. */
      readonly want?: readonly AltTargetInput[];
    }
  | {
      readonly kind: 'item';
      readonly item: ExistingItem;
      readonly targets: readonly TargetInput[];
    };

export type SolveResult =
  | { readonly kind: 'lab'; readonly result: EngineResult; readonly alts: EngineAlternatives | null }
  | { readonly kind: 'item'; readonly plan: EngineResult; readonly markov: EngineMarkovResult };

/**
 * How far along a solve is, as a single 0–1 fraction the UI can render directly.
 *
 * The solver deliberately reports only raw phase/done/total, because weighting the phases against each
 * other is a presentation call — and they are nowhere near equal in wall-clock terms.
 */
/**
 * Every phase that can report. Each belongs to exactly one request kind — `item` runs the MDP's three,
 * `lab` runs the budget search — so their spans below can partition the bar without colliding.
 */
export type SolvePhase = MarkovProgress['phase'] | 'alternatives';

export interface SolveProgress {
  readonly phase: SolvePhase;
  readonly fraction: number;
}

/**
 * Wall-clock share of each phase, from measurement rather than intuition: on a 3-target Wand craft,
 * raising `tolerance` from 1e-9 to 1e-1 (which all but removes value iteration) moved the total only
 * 3877ms → 3458ms. So building the action distributions is ~89% of the work and VI ~11%, and a bar
 * split evenly across the three phases would stall for three seconds and then sprint.
 */
const PHASE_SPAN: Record<SolvePhase, readonly [number, number]> = {
  actions: [0, 0.85],
  compile: [0.85, 0.92],
  solve: [0.92, 1],
  // The `lab` request's only reporting phase, so it owns the whole bar. The Pareto run that precedes
  // it is silent, but it is also the smaller half by a wide margin (at 6 targets: 64ms of planning
  // against 7.3s of budget search), so starting at zero for a moment beats faking a position.
  alternatives: [0, 1],
};

/** Map a solver's raw counts onto one monotone 0–1 fraction. */
export function toFraction(p: { phase: SolvePhase; done: number; total: number }): number {
  const [lo, hi] = PHASE_SPAN[p.phase];
  const within = p.total > 0 ? Math.min(1, Math.max(0, p.done / p.total)) : 1;
  return lo + (hi - lo) * within;
}

/** Perform one solve. Pure compute — no Worker, no DOM — so tests can call it directly. */
export function runSolve(eng: Engine, req: SolveRequest, onProgress?: (p: SolveProgress) => void): SolveResult {
  const report = onProgress
    ? (p: MarkovProgress): void => onProgress({ phase: p.phase, fraction: toFraction(p) })
    : undefined;

  if (req.kind === 'item') {
    const plan = optimizeItem(eng, req.item, req.targets);
    // The honest expected cost + optimal-policy graph. Reports its own progress because it is the only
    // call here that takes long enough to need one (seconds, against milliseconds for the others).
    const markov = optimizeItemMarkov(eng, req.item, req.targets, report ? { onProgress: report } : {});
    return { kind: 'item', plan, markov };
  }

  const from = req.from;
  const result = 'item' in from
    ? optimizeItem(eng, from.item, req.targets)
    : optimize(eng, from.baseId, from.level, req.targets);

  // A budget also asks the near-miss question: what's the closest thing this much money actually buys?
  const budget = req.budget;
  if (budget === undefined || !Number.isFinite(budget) || budget <= 0) {
    return { kind: 'lab', result, alts: null };
  }
  // This is the slow half of a lab compute — every node it visits is a full Pareto run — so it, not
  // the frontier above, is what the progress bar follows.
  const want = req.want ?? req.targets;
  const altOpts = onProgress
    ? { onProgress: (done: number, total: number) => onProgress({ phase: 'alternatives' as const, fraction: toFraction({ phase: 'alternatives', done, total }) }) }
    : {};
  const alts = 'item' in from
    ? alternativesForItem(eng, from.item, want, budget, altOpts)
    : alternatives(eng, from.baseId, from.level, want, budget, altOpts);
  // The search can stop just short of its node cap (196 of 200 is typical), which would leave the bar
  // sitting at 98% while the work is finished. Say so explicitly, as the MDP path does.
  onProgress?.({ phase: 'alternatives', fraction: 1 });
  return { kind: 'lab', result, alts };
}
