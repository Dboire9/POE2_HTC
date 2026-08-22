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

  // The whole point of weighting the phases: `actions` is ~89% of wall-clock time, so it must own the
  // bulk of the bar. Split evenly, the bar would freeze for seconds and then sprint — which is the
  // dishonesty the progress indicator exists to remove.
  it('gives the action-building phase most of the bar, because it is most of the time', () => {
    expect(toFraction({ phase: 'actions', done: 0, total: 100 })).toBe(0);
    expect(toFraction({ phase: 'actions', done: 100, total: 100 })).toBeCloseTo(0.85, 9);
    expect(toFraction({ phase: 'compile', done: 100, total: 100 })).toBeCloseTo(0.92, 9);
    expect(toFraction({ phase: 'solve', done: 1, total: 1 })).toBe(1);
  });

  it('never divides by zero when a phase has nothing to do', () => {
    for (const phase of ['actions', 'compile', 'solve'] as const) {
      const f = toFraction({ phase, done: 0, total: 0 } satisfies MarkovProgress);
      expect(Number.isFinite(f)).toBe(true);
    }
  });
});
