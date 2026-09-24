// A number for a craft the solve with bones could not settle (TODO 20).
//
// With a bone priced, a craft carries the Desecration flag axis — about three times the states and two
// to eight times the solve time — so a craft that settles in five seconds without bones can run past the
// clock with them. From a white base, a solve that runs out before its first phase settles has no number
// at all (`stoppedEarly`). Measured at Standard (docs/validation.md, 2026-09-24): Amulets 5×T2 comes back
// empty, and Wands 5×T2 and Rings 5×T2 settle on one run and come back empty on the next.
//
// A plan without Desecration is a plan the player can follow, so its exact cost is an honest CEILING on
// the craft with bones: they can only make it cheaper. So where bones are optional — only a priced bone
// put them in the model (`MarkovResult.bones`) — and the solve with them ran out, this solves the craft
// again without them, on a clock of its own AFTER the first one, and answers with that ceiling when it
// is the better answer. After, not out of a share of the same clock: a reserve cost Wands 5×T2 the exact
// answer it reaches in 14 of Standard's 15 seconds.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import { markovFromItem, type MarkovOptions, type MarkovProgress, type MarkovResult } from './markovFromItem.ts';

/** The two grades of bone, as price-sheet keys — what "without Desecration" leaves out. */
export const BONE_KEYS = ['desecrate', 'desecrate_ancient'] as const;

export interface BoneFreeOptions {
  /** The clock the solve without bones gets, on top of the first one's. */
  readonly maxMillis?: number;
  /** Its progress, apart from the first solve's: it starts over from nothing. */
  readonly onProgress?: (p: MarkovProgress) => void;
}

/**
 * `markovFromItem`, and when it ran out on a from-white craft whose bones are optional, the exact cost
 * of the best plan without them instead — marked `withoutBones`, `bound: 'upper'` — if that solve
 * settles and beats what the first one reached. Otherwise the first answer, untouched.
 */
export function markovWithBoneFreeCeiling(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
  fallback: BoneFreeOptions = {},
): MarkovResult {
  const res = markovFromItem(data, prices, start, targets, opts);
  // Nothing, or a ceiling: what a solve that can start over leaves when it runs out. A solve from an item
  // held climbs instead and stops on a floor, which a ceiling from elsewhere does not replace.
  const unsettled = res.stoppedEarly === true || (res.feasible && res.bound === 'upper');
  if (res.bones !== 'optional' || !unsettled) return res;

  // A play-out is for a settled plan, and the first solve's progress is not this one's.
  const { replay: _replay, onProgress: _onProgress, maxMillis: _maxMillis, ...same } = opts;
  const free = markovFromItem(data, prices, start, targets, {
    ...same,
    policy: { excluded: new Set([...(opts.policy?.excluded ?? []), ...BONE_KEYS]) },
    ...(fallback.maxMillis === undefined ? {} : { maxMillis: fallback.maxMillis }),
    ...(fallback.onProgress ? { onProgress: fallback.onProgress } : {}),
  });
  return lowerCeiling(res, free);
}

/**
 * Which of the two to give: the plan without bones, as a ceiling, when it settled and the first solve
 * reached nothing lower — a first solve that ran out on a ceiling of its own may already be under it.
 */
export function lowerCeiling(first: MarkovResult, withoutBones: MarkovResult): MarkovResult {
  if (!withoutBones.feasible || withoutBones.bound !== 'exact') return first;
  if (first.feasible && first.expectedCost <= withoutBones.expectedCost) return first;
  return { ...withoutBones, converged: false, bound: 'upper', withoutBones: true };
}
