// "How many tablets should I craft, and what do I need to start?" — a RUN of crafts, read off the replay.
//
// One craft is a coin with a long tail: the average says +2 chaos, but half the crafts land cheap and one
// in ten costs three times the average. What evens it out is doing it several times, and the question a
// player asks (2026-09-23) is how many — "if you do it 100 times you should profit X, but you do
// not need 100, do what is best" — and how much currency that takes before the sales come back.
//
// Answered by resampling. The replay kept what one craft cost at every percentile (`costPercentiles`,
// the first plain tablet included); a run of N crafts is N draws from that, each craft paid for as it
// goes and its tablet sold when it is done, with whatever sold on the way. Over a few thousand such runs:
//   ahead    — the share that end with more than they started;
//   profit   — N times the average profit a craft makes, from the replay's own mean (the resampled one
//              loses a little of the tail between the 99th percentile and the worst craft played);
//   bankroll — what a run has to have on hand to never run dry: the most it is down, mid-craft, before
//              a sale pays it back — the 90th percentile of that over the runs.
// Sales on the way are counted at their average per craft; they are small beside the sale itself.

import { mulberry32 } from '../../packages/optimizer/src/simulate.ts';

export interface RunRow {
  /** Tablets crafted, one after another. */
  readonly crafts: number;
  /** Share of such runs that finish ahead. */
  readonly ahead: number;
  /** Average profit over the whole run. */
  readonly profit: number;
  /** What to have on hand so 9 runs in 10 never run dry — the deepest a run is down before a sale. */
  readonly bankroll: number;
}

export interface RunPlan {
  readonly rows: readonly RunRow[];
  /** The shortest run that finishes ahead 9 times in 10 — absent when no run up to `MAX_CRAFTS` does. */
  readonly best?: number;
}

const MAX_CRAFTS = 500;
const RUNS = 2000;
const SURE = 0.9;
/** The run lengths always shown beside the best one, for scale. */
const SHOWN = [1, 10, 100];

/** One craft's cost, drawn from the percentile table by interpolating between neighbours. */
const drawFrom = (pct: readonly number[], u: number): number => {
  const at = u * (pct.length - 1);
  const lo = Math.floor(at);
  const hi = Math.min(pct.length - 1, lo + 1);
  return pct[lo]! + (pct[hi]! - pct[lo]!) * (at - lo);
};

/**
 * Plan runs of crafts. `percentiles`: one craft's full cost at every percentile (plain tablet included),
 * `meanCost` its exact average, `income` what one craft brings back — the tablet's price plus the average
 * sold on the way. Deterministic for a given seed, so the page does not flicker between renders.
 */
export function planRuns(percentiles: readonly number[], meanCost: number, income: number, seed = 1): RunPlan {
  if (percentiles.length < 2) return { rows: [] };
  const rng = mulberry32(seed);
  const perCraft = income - meanCost;
  // Per run: money in hand relative to the start, and the deepest it has been.
  const cash = new Float64Array(RUNS);
  const deepest = new Float64Array(RUNS);
  const aheadAt = new Float64Array(MAX_CRAFTS + 1);
  const bankrollAt = new Float64Array(MAX_CRAFTS + 1);
  const want = new Set(SHOWN);
  let best: number | undefined;
  const scratch = new Float64Array(RUNS);
  for (let n = 1; n <= MAX_CRAFTS; n++) {
    let ahead = 0;
    for (let r = 0; r < RUNS; r++) {
      const c = drawFrom(percentiles, rng());
      // Down by the whole craft before its tablet sells: that is the moment the bankroll has to cover.
      deepest[r] = Math.max(deepest[r]!, c - cash[r]!);
      cash[r] = cash[r]! + income - c;
      if (cash[r]! > 0) ahead++;
    }
    aheadAt[n] = ahead / RUNS;
    if (best === undefined && aheadAt[n]! >= SURE) { best = n; want.add(n); }
    if (want.has(n)) {
      scratch.set(deepest);
      scratch.sort();
      bankrollAt[n] = scratch[Math.min(RUNS - 1, Math.ceil(SURE * RUNS) - 1)]!;
    }
  }
  const rows = [...want].sort((a, b) => a - b).map((n) => ({
    crafts: n, ahead: aheadAt[n]!, profit: n * perCraft, bankroll: bankrollAt[n]!,
  }));
  return best === undefined ? { rows } : { rows, best };
}
