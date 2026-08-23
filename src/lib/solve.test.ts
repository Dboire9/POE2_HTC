import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import type { MarkovProgress } from '../../packages/optimizer/src/markovFromItem.ts';
import {
  optimize, optimizeItem, optimizeItemMarkov, alternatives, listMods, type ExistingItem,
} from './engine.ts';
import { runSolve, toFraction, type SolveProgress } from './solve.ts';

// `runSolve` exists so a compute can cross a Worker boundary as a plain message. Its entire job is to
// dispatch to the same planner calls the UI used to make inline, so the thing worth testing is that it
// really is the same computation — a regrouping, not a rewrite. Everything else about the worker
// (postMessage plumbing, terminate-to-cancel) lives in files jsdom cannot exercise, which is exactly
// why the logic was pulled out to here.
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const mods = listMods(eng.data, 'Wands');
const [p0, p1] = [mods.prefixes[0]!.id, mods.prefixes[1]!.id];
const s0 = mods.suffixes[0]!.id;

const item: ExistingItem = {
  baseId: 'Wands', level: 82, rarity: 'rare',
  prefixes: [{ modId: p0, tierDisplay: 99 }], suffixes: [{ modId: s0, tierDisplay: 99 }],
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

  it('lab with a budget also answers the near-miss question', () => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: 600 });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toEqual(alternatives(eng, 'Wands', 82, targets, 600));
  });

  // The UI passes '' when the budget box is empty and NaN can reach here from a half-typed number;
  // neither should be treated as "budget zero", which would claim nothing at all is affordable.
  it.each([undefined, 0, -5, NaN])('skips the budget search for %s', (budget) => {
    const got = runSolve(eng, { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, budget: budget as number });
    if (got.kind !== 'lab') throw new Error('wrong kind');
    expect(got.alts).toBeNull();
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
