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
    /** Value-iteration sweeps. Absent ⇒ the solver's own default, which is what tests rely on. */
    readonly maxSweeps?: number;
    /** Phase-B solver. 'policy' ends on a proof of optimality rather than a residual tolerance. */
    readonly solver?: 'value' | 'policy';
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
      /** What another white base costs the player, in exalt-equivalents. Absent ⇒ WHITE_BASE_COST.
       *  Only reaches the model on a from-WHITE craft: a held or carved item cannot be restarted. */
      readonly baseCost?: number;
      /** Targets with pins applied, for the budget search. Defaults to `targets`. */
      readonly want?: readonly AltTargetInput[];
    } & ExcludingRequest)
  | ({
      readonly kind: 'item';
      readonly item: ExistingItem;
      readonly targets: readonly TargetInput[];
    } & ExcludingRequest);

export type SolveResult =
  | {
      readonly kind: 'lab'; readonly result: EngineResult; readonly alts: EngineAlternatives | null;
      /** The true-cost model for a lab craft too. It only ever ran for the Item tab, so the app's
       *  PRIMARY mode — craft this from a white base — had no honest cost and no policy at all. */
      readonly markov: EngineMarkovResult;
    }
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
/** Share of the effort budget the ITEM tab's step planner may spend before the MDP takes the rest.
 *  The lab's step planner takes the whole clock as a CEILING and normally finishes far inside it, so
 *  the model gets the remainder (`clockLeft`) rather than a fixed share. */
const ITEM_PLAN_SHARE = 0.4;

/**
 * What another white base costs when the player has not said — NOT what the app believes one costs.
 *
 * Zero, and deliberately so rather than by omission: the sheet has no key for a base (`stepCost` would
 * silently make an absent key 0 anyway — see CLAUDE.md), and any other default would be a number
 * nobody has measured, which is the failure `DESECRATED_ASSUMED_WEIGHT` already represents.
 *
 * It is not a harmless default. This is the MDP's `restartCost`, and at 0 the policy bins almost
 * anything rather than repair it — measured at 1,015 of 1,041 states choosing to start over, stable at
 * every sweep budget, so the true optimum rather than an artifact. That is correct arithmetic on a
 * premise only the player can supply, which is why `LabRequest.baseCost` exists and this is merely
 * where the answer falls back to.
 */
const WHITE_BASE_COST = 0;

/**
 * A lab compute's split depends on whether a budget was set, which is why these can't be a static
 * per-phase table like the MDP's. With a budget the search dominates by two orders of magnitude (at 6
 * targets: ~64ms planning against ~7.3s searching); without one, planning IS the whole compute — and
 * planning alone can still be slow enough to watch, which is how the bar came to sit at 0%.
 */
// A lab compute now has up to three phases, not two: the step frontier, the true-cost model, and —
// only when a budget is set — the near-miss search. The model is the slow one when there is no budget,
// so it owns most of the bar there; with a budget the search still dominates by two orders of magnitude
// (~64ms planning against ~7.3s searching at 6 targets).
const LAB_PLAN_ALONE: Span = [0, 0.3];
const LAB_MDP_ALONE: Span = [0.3, 1];
const LAB_PLAN_THEN_SEARCH: Span = [0, 0.05];
const LAB_MDP_THEN_SEARCH: Span = [0.05, 0.35];
const LAB_SEARCH: Span = [0.35, 1];

/** Map the MDP's raw counts onto one monotone 0–1 fraction. */
export function toFraction(p: MarkovProgress): number {
  return within(MDP_SPAN[p.phase], p.done, p.total);
}

/**
 * Run the true-cost model without letting its failure take down the rest of the solve.
 *
 * The MDP is an ADDITION to both tabs: the step frontier is what the user asked for and it has already
 * been computed by the time this runs. A model that cannot represent some craft — an essence target, a
 * shape it has no action for — must say so in its own card, not remove the answer sitting next to it.
 * Not a blanket catch: the message is carried through to `reason`, which the panel renders.
 */
function markovOrReason(run: () => EngineMarkovResult): EngineMarkovResult {
  try {
    return run();
  } catch (err) {
    return {
      applicable: false, feasible: false, expectedCost: Infinity, converged: true, bound: 'exact', assumedOdds: false,
      nodes: [], edges: [],
      reason: `the true-cost model couldn’t handle this craft: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * …and the same protection in the other direction, which the rule above always implied.
 *
 * The step planner throws on shapes it cannot express, and `runSolve` called it unguarded — so a craft
 * naming ONLY an essence mod ("an essence-only mod needs a Magic item first") took down the whole
 * compute, model included, even though the MDP answers it perfectly well: transmute, roll whatever
 * lands, then essence. That is the exact inverse of the failure `markovOrReason` exists to prevent, and
 * it became reachable the moment the model learned to buy an Essence (2026-08-28).
 *
 * An empty frontier is already a state both tabs render. Carrying the planner's own sentence into
 * `reason` is what stops it rendering as the generic "nothing this search tried worked", which would be
 * a confident wrong diagnosis — the search did not try and fail, it declined to start.
 */
function frontierOrReason(run: () => EngineResult): EngineResult {
  try {
    return run();
  } catch (err) {
    return {
      frontier: [], plansEvaluated: 0, assumedOdds: false,
      reason: `the step planner can’t lay out this craft: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/** Perform one solve. Pure compute — no Worker, no DOM — so tests can call it directly. */
export function runSolve(eng: Engine, req: SolveRequest, onProgress?: (p: SolveProgress) => void): SolveResult {
  // Built once per solve, then shared by every planner below — they must all run under the same rules,
  // or the frontier and the MDP could recommend plans the other considers unbuildable.
  const policy: CurrencyPolicy | undefined = req.excluded?.length
    ? { excluded: new Set(req.excluded) }
    : undefined;
  const withPolicy = <T extends object>(o: T): T => (policy ? { ...o, policy } : o);
  // Each limit goes to the planner that owns it: relaxed targets to the budget search, the clock to
  // the step planner. Absent ⇒ the planner's own default stands.
  //
  // `withPlanLimit` used to sit here handing the step planner `maxPlans`, which chose a coarser
  // orb-strength depth. The lever DP removed that dial (see searchEffort.ts), so the step planner's
  // only throttle is time — which it had never actually been given on the lab path, where
  // `OptimizeParetoOptions.maxMillis` was declared and read by nothing. It is a CEILING, not a
  // reservation: the model still takes whatever is left over via `clockLeft()`, and the item tab
  // overrides it with its own minority share below.
  const eff = req.effort;
  const withClock = <T extends object>(o: T): T => (eff ? { ...o, maxMillis: eff.maxMillis } : o);
  const withNodeLimit = <T extends object>(o: T): T => (eff ? { ...o, maxNodes: eff.maxNodes } : o);
  /**
   * The MDP's sweep cap — and it must reach BOTH the lab and item paths, which is why it is a helper
   * rather than a spread at each call site.
   *
   * On a craft that exhausts its sweeps the wall clock never binds, so without this the whole effort
   * ladder is inert for exactly the crafts the reader raised it for: measured, a six-target T1 craft
   * ran 1,035s and stopped on the sweep cap, not the clock. Wiring only one of the two paths is a
   * live failure mode — the first version of this did that, and only a behavioural test caught it.
   */
  const withSweepLimit = <T extends object>(o: T): T => ({
    ...o,
    ...(eff?.maxSweeps === undefined ? {} : { maxIters: eff.maxSweeps }),
    ...(eff?.solver === undefined ? {} : { solver: eff.solver }),
  });
  const started = Date.now();
  /**
   * What is LEFT of the wall clock, with a floor.
   *
   * The preset promises the user a total wait, so the model gets the remainder after the step search
   * rather than a fixed share of the whole. A fixed share is worse in both directions: the step
   * planner takes the clock as a ceiling it rarely approaches, so on a craft where it finishes in
   * three seconds a 40% reservation is budget nobody spends — measured at Thorough that was 24 of 60
   * seconds simply dropped, on exactly the craft that needed them.
   *
   * The floor matters too: a search that ate the whole budget would otherwise leave the model zero
   * sweeps and a value of 0, which renders as "≥ 0" — technically true, useless to read.
   */
  const clockLeft = (): number | undefined =>
    (eff ? Math.max(2_000, eff.maxMillis - (Date.now() - started)) : undefined);

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
    const planShare = eff ? Math.max(1_000, Math.round(eff.maxMillis * ITEM_PLAN_SHARE)) : undefined;
    const planOnProgress = onProgress
      ? { onProgress: (done: number, total: number): void => onProgress({ phase: 'plan', fraction: within(ITEM_PLAN, done, total) }) }
      : {};
    const planOpts = withClock(withPolicy(planOnProgress));
    const plan = frontierOrReason(() => optimizeItem(eng, req.item, req.targets,
      planShare === undefined ? planOpts : { ...planOpts, maxMillis: planShare }));
    // The honest expected cost + optimal-policy graph.
    const mdpReport = onProgress
      ? { onProgress: (p: MarkovProgress): void => onProgress({ phase: p.phase, fraction: within(ITEM_MDP, toFraction(p) * 1000, 1000) }) }
      : {};
    const mdpOpts = withSweepLimit(withPolicy(mdpReport));
    const remaining = clockLeft();
    const markov = markovOrReason(() => optimizeItemMarkov(eng, req.item, req.targets,
      remaining === undefined ? mdpOpts : { ...mdpOpts, maxMillis: remaining }));
    return { kind: 'item', plan, markov };
  }

  const from = req.from;
  // A budget also asks the near-miss question: what's the closest thing this much money actually buys?
  const budget = req.budget;
  const hasBudget = budget !== undefined && Number.isFinite(budget) && budget > 0;
  const emit = (phase: SolvePhase, span: Span) =>
    (done: number, total: number): void => onProgress?.({ phase, fraction: within(span, done, total) });

  const planOpts = withClock(withPolicy(onProgress
    ? { onProgress: emit('plan', hasBudget ? LAB_PLAN_THEN_SEARCH : LAB_PLAN_ALONE) }
    : {}));
  const result = frontierOrReason(() => ('item' in from
    // The from-item planner has no progress reporting of its own yet; a carved craft therefore shows
    // no movement until the budget search starts.
    ? optimizeItem(eng, from.item, req.targets, withClock(withPolicy({})))
    : optimize(eng, from.baseId, from.level, req.targets, planOpts)));

  // The same push-forward model the Item tab uses. A white base is not an item you hold, so it gets the
  // one thing a held item cannot have: permission to scrap and start again, priced at what another base
  // costs. Without that the policy would be forced to dig a bad Transmute out with a 158.7ex Annulment
  // rather than bin 0.18ex and reroll — measured at an 83x overestimate. A CARVED item (fractured mods)
  // is a real item and gets no such permission.
  const fromWhite = !('item' in from);
  const mdpItem: ExistingItem = 'item' in from
    ? from.item
    : { baseId: from.baseId, level: from.level, rarity: 'normal', prefixes: [], suffixes: [] };
  // Reported, not silent: this can run for seconds, and a bar that stops moving through a phase is the
  // thing that made a 24-second solve feel like ten minutes in the first place.
  const mdpSpan = hasBudget ? LAB_MDP_THEN_SEARCH : LAB_MDP_ALONE;
  const mdpClock = clockLeft();
  const markov = markovOrReason(() => optimizeItemMarkov(eng, mdpItem, req.targets, withSweepLimit(withPolicy({
    ...(fromWhite ? { restartCost: req.baseCost ?? WHITE_BASE_COST } : {}),
    ...(mdpClock === undefined ? {} : { maxMillis: mdpClock }),
    ...(onProgress
      ? { onProgress: (pr: MarkovProgress): void => onProgress({ phase: pr.phase, fraction: within(mdpSpan, toFraction(pr) * 1000, 1000) }) }
      : {}),
  }))));

  if (!hasBudget) {
    // The MODEL finishes the bar now, not planning — planning is the first ~30% of it. Reporting
    // `plan: 1` here would jump the label backwards after the model had already reported done.
    onProgress?.({ phase: 'solve', fraction: 1 });
    return { kind: 'lab', result, alts: null, markov };
  }

  // The slow half of a lab compute when a budget is set — every node it visits is a full Pareto run.
  const want = req.want ?? req.targets;
  const altOpts = withNodeLimit(withPolicy(onProgress ? { onProgress: emit('alternatives', LAB_SEARCH) } : {}));
  // The near-miss search runs the SAME planner per relaxed target, so it throws on the same shapes.
  // There is nowhere to carry a message here — `alts: null` already means "that question went
  // unanswered" — and it needs none: whatever the planner objected to, `result.reason` above is
  // already saying it in the panel directly beside this one.
  const alts = ((): EngineAlternatives | null => {
    try {
      return 'item' in from
        ? alternativesForItem(eng, from.item, want, budget, altOpts)
        : alternatives(eng, from.baseId, from.level, want, budget, altOpts);
    } catch { return null; }
  })();
  // The search can stop just short of its node cap (196 of 200 is typical), which would leave the bar
  // sitting at 98% while the work is finished. Say so explicitly, as the MDP path does.
  onProgress?.({ phase: 'alternatives', fraction: 1 });
  return { kind: 'lab', result, alts, markov };
}
