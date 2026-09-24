// A craft with bones solved from the plan without them (TODO 20).
//
// With a bone priced, a craft carries the Desecration flag axis — about three times the states — and the
// two-phase solve spends 92–98% of its time in phase A, computing a value to seed phase B from. The same
// craft without bones is several times faster, and its plan is a far better seed: any plan without
// Desecration is proper in the lattice with it (the flag gates only bones), so its closed-form value is a
// valid phase-B seed, and policy iteration only has to find where a bone pays. Measured (validation.md,
// 2026-09-24): identical exact costs, 2.5–9x faster, and Amulets, Rings and Wands 5×T2 settle at
// Standard, where two of them gave no number at all.
//
// So where bones are optional — only a priced bone put them in the model (`boneRole`) — and the craft can
// start over, this solves it without bones first and seeds the solve with them from that plan. If the
// solve with bones still runs out, the plan without them answers as a CEILING: a plan the player can
// follow, whose exact cost bones can only lower.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import {
  BONE_KEYS, boneRole, markovFromItem, type MarkovOptions, type MarkovProgress, type MarkovResult,
} from './markovFromItem.ts';

export { BONE_KEYS };

export interface BoneFreeOptions {
  /** The clock the solve without bones gets, apart from the one with them (`MarkovOptions.maxMillis`). */
  readonly maxMillis?: number;
  /** Its progress, apart from the solve with bones: they are two solves, each from nothing. */
  readonly onProgress?: (p: MarkovProgress) => void;
}

/**
 * `markovFromItem` — for a from-white craft whose bones are optional, solved without bones first and
 * seeded from that plan; answered by that plan, marked `withoutBones` with `bound: 'upper'`, when the
 * solve with bones still runs out and reaches nothing lower. Any other craft is solved as it was.
 */
export function markovBoneFreeFirst(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
  first: BoneFreeOptions = {},
): MarkovResult {
  if (boneRole(data, prices, start, targets, opts.policy) !== 'optional' || opts.restartCost === undefined) {
    return markovFromItem(data, prices, start, targets, opts);
  }
  // A play-out is for the answer, and the solve with bones has its own clock and progress.
  const { replay: _replay, onProgress: _onProgress, maxMillis: _maxMillis, ...same } = opts;
  const free = markovFromItem(data, prices, start, targets, {
    ...same,
    keepRoutes: true,
    policy: { excluded: new Set([...(opts.policy?.excluded ?? []), ...BONE_KEYS]) },
    ...(first.maxMillis === undefined ? {} : { maxMillis: first.maxMillis }),
    ...(first.onProgress ? { onProgress: first.onProgress } : {}),
  });
  const seed = free.feasible && free.bound === 'exact' ? free.routes : undefined;
  const res = markovFromItem(data, prices, start, targets, seed ? { ...opts, seedFrom: seed } : opts);
  // Nothing, or a ceiling: what a solve that can start over leaves when it runs out.
  const unsettled = res.stoppedEarly === true || (res.feasible && res.bound === 'upper');
  return unsettled ? lowerCeiling(res, free) : res;
}

/**
 * Which of the two to give: the plan without bones, as a ceiling, when it settled and the solve with
 * bones reached nothing lower — one that ran out on a ceiling of its own may already be under it.
 */
export function lowerCeiling(withBones: MarkovResult, withoutBones: MarkovResult): MarkovResult {
  if (!withoutBones.feasible || withoutBones.bound !== 'exact') return withBones;
  if (withBones.feasible && withBones.expectedCost <= withoutBones.expectedCost) return withBones;
  return { ...withoutBones, converged: false, bound: 'upper', withoutBones: true };
}
