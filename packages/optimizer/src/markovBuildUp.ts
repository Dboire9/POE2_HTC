// A big craft solved from smaller ones: built up one target at a time, each level seeding the next.
//
// A craft that can start over spends nearly all of its two-phase solve in phase A, computing a value
// to seed policy iteration from — and all phase B needs is SOME proper plan's value (one that
// finishes). A plan for the same craft with one target fewer is close to one: `projectPlan` reads it in
// the bigger lattice, and where it has no move (the extra target not yet placed) the solver's own
// guessed policy plays. The closed form checks the whole plan finishes before it is used, and an
// improper or slow seed falls back to the two-phase solve, so the full craft's answer is always the
// solver's own: the seed decides only how fast it gets there.
//
// WHY CHEAPEST FIRST: each target is solved ALONE first (~0.0 s each, measured), and the levels add
// them in order of that cost, so each level only has to learn where one dearer target fits into a
// plan that already settles the cheaper ones. Measured by hand with
// `seedFrom` on live prices: 5–20x faster on big crafts at the same cost, and six-target crafts that
// never settled settle in 1–11 s. Dropping the WRONG target instead — solving a big sub-craft without a
// seed — took 102 s where the right one took 0.3 s. So the build-up starts from one target and never
// solves a big craft unseeded.
//
// WHY THE SMALLER CRAFTS HAVE THEIR OWN CLOCK: they are a bet on speed, never on the answer. They
// share one clock (a quarter of the caller's by default) and stop when it is spent; the full craft
// then runs on the caller's WHOLE clock, seeded from whatever level last settled, or unseeded as it
// always was. So no craft that settles today can be lost to the build-up.
//
// Targets that share a `slot` are alternatives for one position (slots.ts) and always travel together:
// a level holds a whole slot or none of it.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import { slotIndexGroups } from './slots.ts';
import { markovFromItem, type MarkovOptions, type MarkovResult, type RouteTable } from './markovFromItem.ts';

/**
 * The fewest slot groups that are built up. Where the measured gain starts: crafts of two or three
 * targets already solve in well under a second, and the solo solves would only add to that.
 */
export const BUILD_UP_MIN_GROUPS = 4;

export interface BuildUpOptions {
  /**
   * The clock the smaller crafts share, apart from the full craft's. Default: a quarter of
   * `MarkovOptions.maxMillis` when that is set; none when it is not (the tests, deterministic).
   */
  readonly maxMillis?: number;
  /** How far the smaller crafts are: `done` of `of` solved (or skipped once their clock is spent). */
  readonly onLevel?: (done: number, of: number) => void;
}

/** What `buildOrder` reads of a solo solve. */
export type SoloSolve = Pick<MarkovResult, 'feasible' | 'bound' | 'expectedCost'>;

/**
 * The order the slot groups are added in: cheapest solo solve first. A solo solve that did not settle
 * on an exact number has no cost to rank, so it goes last; ties keep the groups' own order.
 */
export function buildOrder(solos: readonly SoloSolve[]): number[] {
  const cost = (s: SoloSolve): number => (s.feasible && s.bound === 'exact' ? s.expectedCost : Infinity);
  return solos.map((_, g) => g).sort((a, b) => cost(solos[a]!) - cost(solos[b]!) || a - b);
}

/**
 * The targets of the level that holds the first `k` groups of `order` — every member of each, in the
 * caller's own order, so a level is the same craft as the caller's with some slots left out.
 */
export function levelTargets(
  targets: readonly TierTarget[], groups: readonly (readonly number[])[], order: readonly number[], k: number,
): TierTarget[] {
  const keep = new Set(order.slice(0, k).flatMap((g) => groups[g]!));
  return targets.filter((_, i) => keep.has(i));
}

/** Whether this craft is built up: one that can start over, solved by policy iteration from nothing. */
function buildsUp(start: ItemState, groups: number, opts: MarkovOptions): boolean {
  return opts.restartCost !== undefined
    && opts.solver === 'policy' && opts.iterativeEval !== true
    // A seed already given is the caller's: the Tablets tab passes its own guess.
    && opts.seedFrom === undefined && opts.heuristicSeed !== true
    && start.prefixes.length + start.suffixes.length === 0
    && groups >= BUILD_UP_MIN_GROUPS;
}

/**
 * `markovFromItem`, with the full craft seeded from smaller crafts built up one slot group at a time,
 * cheapest first. Any craft that does not qualify (see `BUILD_UP_MIN_GROUPS` and `buildsUp`) is solved
 * once, exactly as `markovFromItem` would. The full craft runs on the caller's options untouched.
 */
export function markovBuiltUp(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
  smaller: BuildUpOptions = {},
): MarkovResult {
  const groups = slotIndexGroups(targets);
  if (!buildsUp(start, groups.length, opts)) return markovFromItem(data, prices, start, targets, opts);

  // A play-out and progress are for the answer, and the smaller crafts have a clock of their own.
  const { replay: _replay, onProgress: _onProgress, maxMillis: _maxMillis, seedFrom: _seedFrom, ...same } = opts;
  const budget = smaller.maxMillis ?? (opts.maxMillis === undefined ? undefined : opts.maxMillis / 4);
  const deadline = budget === undefined ? undefined : Date.now() + budget;
  // Every group alone, then the levels of two groups up to all but one (level one is the cheapest solo).
  const of = groups.length + groups.length - 2;
  let done = 0;
  /** One smaller craft on what is left of the shared clock — or undefined once it is spent. */
  const solve = (t: readonly TierTarget[], seed: RouteTable | undefined): MarkovResult | undefined => {
    const left = deadline === undefined ? undefined : deadline - Date.now();
    if (left !== undefined && left <= 0) return undefined;
    const r = markovFromItem(data, prices, start, t, {
      ...same,
      keepRoutes: true,
      ...(left === undefined ? {} : { maxMillis: left }),
      ...(seed ? { seedFrom: seed } : {}),
    });
    smaller.onLevel?.(++done, of);
    return r;
  };
  const settled = (r: MarkovResult | undefined): RouteTable | undefined =>
    r && r.feasible && r.bound === 'exact' ? r.routes : undefined;

  let seed: RouteTable | undefined;
  const solos: MarkovResult[] = [];
  for (const g of groups) {
    const r = solve(g.map((i) => targets[i]!), undefined);
    if (!r) break;
    solos.push(r);
  }
  if (solos.length === groups.length) {
    const order = buildOrder(solos);
    seed = settled(solos[order[0]!]);
    for (let k = 2; k < groups.length; k++) {
      const r = solve(levelTargets(targets, groups, order, k), seed);
      if (!r) break;
      // A level that did not settle is skipped: the last plan that did carries on up.
      seed = settled(r) ?? seed;
    }
  }
  // Whatever the clock left unsolved is skipped, so a bar reading these ends full.
  if (done < of) smaller.onLevel?.(of, of);
  return markovFromItem(data, prices, start, targets, seed ? { ...opts, seedFrom: seed } : opts);
}
