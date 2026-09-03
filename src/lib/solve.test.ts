import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import { loadFrozenPrices } from '../../packages/optimizer/src/frozenPrices.ts';
import type { MarkovProgress } from '../../packages/optimizer/src/markovFromItem.ts';
import {
  optimize, optimizeItem, optimizeItemMarkov, alternatives, listMods, type ExistingItem,
} from './engine.ts';
import { runSolve, toFraction, type SolveProgress, type SolveRequest } from './solve.ts';

// `runSolve` exists so a compute can cross a Worker boundary as a plain message. Its entire job is to
// dispatch to the same planner calls the UI used to make inline, so the thing worth testing is that it
// really is the same computation — a regrouping, not a rewrite. Everything else about the worker
// (postMessage plumbing, terminate-to-cancel) lives in files jsdom cannot exercise, which is exactly
// why the logic was pulled out to here.
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const mods = listMods(eng.data, 'Wands');
const p0 = mods.prefixes[0]!.id;
const s0 = mods.suffixes[0]!.id;

// The item must NOT already satisfy `targets`. It used to: the item held p0 and s0 and the targets
// were p0 and s0 at the same tier, so the start state was already the goal — and `markovFromItem` now
// short-circuits that in ~1 ms without building a state space (see its `isAccepting` guard). Every
// test below that needs a real solve — progress messages, sweep limits — was silently measuring the
// solver grinding through a lattice for a craft that was already finished, and passed only because
// that waste existed. Hold ONE of them and ask for both.
const item: ExistingItem = {
  baseId: 'Wands', level: 82, rarity: 'rare',
  prefixes: [{ modId: p0, tierDisplay: 99 }], suffixes: [],
};
const targets = [{ modId: p0, tierDisplay: 99 }, { modId: s0, tierDisplay: 99 }];

describe('runSolve — dispatches to the same planners the UI called inline', () => {
  it('lab from a white base matches optimize()', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets });
    expect(got.kind).toBe('lab');
    if (got.kind !== 'lab') return;
    expect(got.result).toEqual(optimize(eng, 'Wands', 82, targets));
    expect(got.alts).toBeNull(); // no budget ⇒ the near-miss question wasn't asked
  });

  it('lab from a carved item matches optimizeItem()', () => {
    const got = runSolve(eng, { kind: 'lab', from: { item }, targets });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.result).toEqual(optimizeItem(eng, item, targets));
  });

  // Declared timeout: the near-miss search runs a full Pareto solve per relaxed target, ~8s locally.
  // CI is slower than the 30s default allows for a test that is legitimately this expensive.
  it('lab with a budget also answers the near-miss question', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toEqual(alternatives(eng, 'Wands', 82, targets, 600));
  }, 60_000);

  // The UI passes '' when the budget box is empty and NaN can reach here from a half-typed number;
  // neither should be treated as "budget zero", which would claim nothing at all is affordable.
  it.each([undefined, 0, -5, NaN])('skips the budget search for %s', (budget) => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: budget as number });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toBeNull();
  });

  /**
   * The base price is the MDP's `restartCost`, and it is the number that decides whether "bin it and
   * roll another" beats repairing the item in hand. At 0 it beats nearly everything — measured at
   * 1,015 of 1,041 policy states choosing to start over — so a player for whom bases are NOT free was
   * getting advice built on someone else's economy. Two assertions, because the cost alone could move
   * for any number of reasons: the price has to reach the model AND change what it does.
   */
  it('charges the base price the player set, and stops binning items when it bites', () => {
    const solveAt = (baseCost?: number) => {
      const got = runSolve(eng, {
        kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets,
        ...(baseCost === undefined ? {} : { baseCost }),
      });
      if (got.kind !== 'lab') throw new Error('wrong kind');
      if (!got.markov.applicable || !got.markov.feasible) throw new Error('no model');
      return got.markov;
    };
    const free = solveAt(0);
    const dear = solveAt(50);
    expect(dear.expectedCost).toBeGreaterThan(free.expectedCost);
    const binning = (m: typeof free) =>
      m.nodes.filter((n) => n.action?.startsWith('Start over')).length;
    expect(binning(dear)).toBeLessThan(binning(free));
    // Omitted ⇒ WHITE_BASE_COST, which is 0 — so the default must agree with an explicit 0 rather
    // than quietly being some other number.
    expect(solveAt(undefined).expectedCost).toBeCloseTo(free.expectedCost, 6);
  }, 60_000);

  // A held item cannot be thrown away and re-bought, so the price must not reach that model at all.
  it('ignores a base price on a craft that starts from an item you hold', () => {
    const at = (baseCost: number) => {
      const got = runSolve(eng, { kind: 'lab', from: { item }, targets, baseCost });
      if (got.kind !== 'lab') throw new Error('wrong kind');
      return got.markov;
    };
    expect(at(50)).toEqual(at(0));
  });

  it('item returns both the frontier and the MDP, matching the direct calls', () => {
    const got = runSolve(eng, { kind: 'item', item, targets });
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.plan).toEqual(optimizeItem(eng, item, targets));
    expect(got.markov).toEqual(optimizeItemMarkov(eng, item, targets));
  });

  // A progress callback must not perturb the answer — it is observation, not participation.
  it('produces identical results with and without a progress callback', () => {
    const quiet = runSolve(eng, { kind: 'item', item, targets });
    const noisy = runSolve(eng, { kind: 'item', item, targets }, () => {});
    expect(noisy).toEqual(quiet);
  });
});

describe('progress reporting', () => {
  it('advances monotonically and finishes at 1', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'item', item, targets }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(1);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
    expect(seen[0]!.fraction).toBe(0);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  });

  // The phases are weighted because they are nowhere near equal — but WHICH one dominates depends on
  // the craft, and the old weights were fitted to one of them. A 3-target craft spends ~89% building
  // actions (VI converges in tens of sweeps); a 5-target craft spends 0.2% there and ~99% in VI, which
  // never converges. Under the old 0.85 weight that second craft filled 85% of the bar in 54ms and
  // then crawled for 24 seconds. The assertion is on the ORDERING and the endpoints, plus the one
  // property that matters — no single phase owns most of the bar — rather than on fitted constants.
  it('weights the phases without letting any one of them own the bar', () => {
    const actions = toFraction({ phase: 'actions', done: 100, total: 100 });
    const compile = toFraction({ phase: 'compile', done: 100, total: 100 });
    expect(toFraction({ phase: 'actions', done: 0, total: 100 })).toBe(0);
    expect(actions).toBeGreaterThan(0);
    expect(compile).toBeGreaterThan(actions);
    expect(toFraction({ phase: 'solve', done: 1, total: 1 })).toBe(1);
    // Neither end of the bar may be a cliff: whichever phase turns out to dominate, there is room left.
    expect(actions).toBeLessThanOrEqual(0.5);
    expect(compile).toBeLessThanOrEqual(0.6);
  });

  it('never divides by zero when a phase has nothing to do', () => {
    for (const phase of ['actions', 'compile', 'solve'] as const) {
      const f = toFraction({ phase, done: 0, total: 0 } satisfies MarkovProgress);
      expect(Number.isFinite(f)).toBe(true);
    }
  });

  // A lab compute WITH a budget is slow — the budget search visits up to 200 nodes, each a full Pareto
  // run (~7.3s at 6 targets) — but it used to report nothing at all, so the bar sat at 0% for the whole
  // wait while only the elapsed counter moved. It now follows the node count.
  it('reports progress through the budget search, which is the slow half of a lab compute', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(1);
    expect(seen.some((p) => p.phase === 'alternatives')).toBe(true);
    // Monotone ACROSS phases too — planning must hand over to the search without the bar going back.
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
    expect(seen[0]!.fraction).toBeLessThan(0.2);
    // …and it must finish AT the top. The node cap is a ceiling, not a forecast, so a search that
    // stops early (196 of 200 is typical) would otherwise strand the bar just short of done.
    expect(seen[seen.length - 1]!.fraction).toBe(1);
  });

  // REGRESSION. A from-scratch compute with no budget reported nothing at all — the bar sat at 0%
  // while the elapsed counter ticked. Both of its phases report now: the step planner, then the
  // true-cost model, which is the slow one when there is no budget search to follow.
  it('reports through both phases of a lab compute with no budget', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets }, (p) => seen.push(p));
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.some((p) => p.phase === 'plan')).toBe(true);
    // The model's own phases — a bar that went quiet through them is what this test exists to stop.
    expect(seen.some((p) => p.phase === 'actions' || p.phase === 'solve')).toBe(true);
    expect(seen[seen.length - 1]!.fraction).toBe(1);
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!.fraction).toBeGreaterThanOrEqual(seen[i - 1]!.fraction);
    }
  });

  // With a budget, planning is ~1% of the wall clock (64ms against 7.3s at 6 targets), so it must not
  // eat the bar — otherwise the search that follows would have almost none of it left.
  it('keeps planning to a thin slice when a budget search follows it', () => {
    const seen: SolveProgress[] = [];
    runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 }, (p) => seen.push(p));
    const planned = seen.filter((p) => p.phase === 'plan');
    expect(planned.length).toBeGreaterThan(0);
    for (const p of planned) expect(p.fraction).toBeLessThanOrEqual(0.1);
  });

  it('leaves the budget search results unchanged when a progress callback is attached', () => {
    const req = { kind: 'lab' as const, from: { baseId: 'Wands', level: 82 }, targets, budget: 600 };
    expect(runSolve(eng, req, () => {})).toEqual(runSolve(eng, req));
  });
});

/**
 * The Search-effort setting has to REACH the solver, and this is the only test that can tell.
 *
 * `maxIters` was a hardcoded 100,000 the ladder could not touch, so on a craft that exhausts its
 * sweeps the clock never bound and "Patient — several minutes" bought exactly nothing. Asserting the
 * preset table alone cannot catch that: a preset can carry a perfectly good number that no one passes
 * on. Deleting the one line in `runSolve` that threads it left every other test green.
 *
 * So this test is behavioural. One sweep cannot converge anything; a full budget converges this
 * craft. If the wiring goes, the two runs stop differing and the test fails.
 */
describe('Search effort reaches value iteration, not just the preset table', () => {
  const generous = { maxMillis: 60_000, maxNodes: 200 };
  const run = (maxSweeps: number) =>
    runSolve(eng, { kind: 'item', item, targets, effort: { ...generous, maxSweeps } });

  it('a one-sweep budget cannot converge', () => {
    const got = run(1);
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.markov?.converged).toBe(false);
  });

  it('a full budget does', () => {
    const got = run(100_000);
    if (got.kind !== 'item') throw new Error('wrong kind');
    expect(got.markov?.converged).toBe(true);
  });
});

/**
 * The whole point of putting policy iteration on every rung, asserted end to end through `runSolve`.
 *
 * Value iteration stops on a residual TOLERANCE, so when it runs out the app can only say "at most x".
 * Policy iteration stops on a CERTIFICATE — the policy stopped changing, so no action anywhere improves
 * on it — and returns the exact cost. Measured across 18 crafts, PI produced a ceiling zero times.
 *
 * Bounded by SWEEPS rather than by the clock, deliberately: a wall-clock cap would make this flaky by
 * construction, green on a slow machine and red on a fast one. Sweep counts are deterministic.
 */
/**
 * A planner that DECLINES a craft must not take the other planner's answer with it.
 *
 * `markovOrReason` has always protected the frontier from a model failure. Nothing protected the
 * reverse until it became reachable: the step planner throws on a lone essence-only target ("needs a
 * Magic item first — include at least one rollable mod"), and the MDP learned to buy an Essence on
 * 2026-08-28 — so from that day the app was throwing away an answer it had.
 */
describe('a planner that declines does not delete the other one', () => {
  const essenceOnly = (): SolveRequest => {
    const wands = listMods(eng.data, 'Wands');
    const ess = [...wands.prefixes, ...wands.suffixes].find((m) => m.source === 'essence')!;
    return {
      kind: 'lab', from: { baseId: 'Wands', level: 82 },
      targets: [{ modId: ess.id, tierDisplay: 99 }],
    };
  };

  it('a lone essence target still returns the model’s answer', () => {
    const got = runSolve(eng, essenceOnly());
    if (got.kind !== 'lab') throw new Error('wrong kind');
    // The step planner refused the shape…
    expect(got.result.frontier).toEqual([]);
    expect(got.result.reason).toMatch(/step planner can.t lay out this craft/i);
    expect(got.result.reason).toMatch(/rollable mod/i); // …carrying its OWN sentence, not a generic one
    // …and the model answered anyway, which is the whole point.
    expect(got.markov?.feasible).toBe(true);
    expect(got.markov.expectedCost).toBeGreaterThan(0);
    expect(Number.isFinite(got.markov.expectedCost)).toBe(true);
  }, 120_000);

  it('leaves a craft both planners CAN do completely untouched', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.result.frontier.length).toBeGreaterThan(0);
    expect(got.result.reason).toBeUndefined(); // no reason means nothing was caught
  });

  /**
   * The budgeted path survives too.
   *
   * The near-miss search runs the SAME planner per relaxed target, so it can throw the same way — but
   * it does not on THIS input, and the test says so rather than pretending otherwise: relaxing a
   * one-target craft produces sub-crafts that never hit the lone-essence guard. Its catch in
   * `runSolve` is therefore defensive, reachable only when every relaxation still leaves an
   * essence-only target standing alone. What this pins is the property that matters either way — a
   * budget must not turn a working compute into a thrown one.
   */
  it('survives the budgeted path too', () => {
    const got = runSolve(eng, { ...essenceOnly(), budget: 600 } as SolveRequest);
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.markov?.feasible).toBe(true);
    expect(got.result.reason).toMatch(/step planner can.t lay out this craft/i);
  }, 120_000);
});

describe('policy iteration answers where value iteration can only bound', () => {
  // FROZEN prices for this block alone. The claim is about the SOLVERS — that policy iteration is
  // exact where value iteration can only bound, at the same sweep budget — but whether a given craft
  // is hard enough to separate them depends on what the orbs cost, and the sheet now refreshes daily.
  // On 2026-09-02 the omens went live from poe.ninja's Ritual feed and this craft became easy enough
  // that VI settled it too, so the test failed while asserting something still true of the solvers.
  // Everything else in this file keeps reading the shipped sheet.
  const frozen = { data: eng.data, prices: loadFrozenPrices() };
  const ring = {
    kind: 'lab', from: { baseId: 'Rings', level: 82 },
    targets: [
      { modId: 'Rings/IncreasedLife', tierDisplay: 99 }, { modId: 'Rings/IncreasedMana', tierDisplay: 99 },
      { modId: 'Rings/ColdResistance', tierDisplay: 99 }, { modId: 'Rings/ChaosResistance', tierDisplay: 99 },
    ],
  } as const;
  const solve = (maxSweeps: number, solver: 'value' | 'policy') => {
    const got = runSolve(frozen, {
      ...ring, effort: { maxMillis: 120_000, maxNodes: 200, maxSweeps, solver },
    });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    return got.markov;
  };

  it('turns a ceiling into an exact answer at the same budget', () => {
    const vi = solve(5_000, 'value');
    const pi = solve(5_000, 'policy');
    expect(vi.bound).toBe('upper');   // ≤ 8,906 — an honest ceiling, and 11x the truth
    expect(pi.bound).toBe('exact');   // 781.82
    // A from-white solve truncates DOWNWARD, so VI's ceiling must sit above the exact cost. If this
    // ever inverts, the bound is being read the wrong way round somewhere.
    expect(vi.expectedCost).toBeGreaterThan(pi.expectedCost);
  }, 60_000);

  /**
   * …and it cannot turn a number into a refusal, which is what makes the swap safe rather than merely
   * better on average.
   *
   * "No number" comes from PHASE A failing, and phase A is plain value iteration on both paths —
   * `markovFromItem` returns `fail(...)` before it reads the solver choice. So a budget too small for
   * phase A must refuse identically under both, and this craft at 2,000 sweeps is exactly that budget.
   */
  it('refuses identically when the budget is too small for either', () => {
    expect(solve(2_000, 'value').feasible).toBe(false);
    expect(solve(2_000, 'policy').feasible).toBe(false);
  }, 60_000);
});
