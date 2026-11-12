// A craft with bones solved from a plan without them (TODO 20).
//
// With a bone in play, a craft carries the Desecration flag axis — about three times the states — and the
// two-phase solve spends 92–98% of its time in phase A, computing a value to seed phase B from. Policy
// iteration only needs that seed to be some PROPER plan's value (one that finishes), and a plan without
// Desecration is one: the flag gates only bones, so such a plan plays in the lattice with them, and its
// closed-form value is a valid phase-B start. Policy iteration then only has to find where a bone pays.
//
// Two kinds of craft take this path:
//
//   • OPTIONAL bones — only a priced bone put them in the model (`boneRole`). The same targets are solved
//     without bones first (2026-09-24). Measured: identical exact costs, 2.5–9x faster.
//   • REQUIRED bones — a desecrated ("carved") target. There is no plan without bones for THAT craft, so
//     the first solve drops the carved targets (2026-11-12). Its plan has no move once the rest is done;
//     there the solver's own guessed policy (`heuristicPolicy`, under every seed) plays the Desecration,
//     and the closed form checks the whole plan finishes before it is used. Measured: identical exact
//     costs on eight crafts, 3–20x faster, and a six-mod Ring that gave no number in 2,400 s settles in 8 s.
//
// If the solve with bones still runs out, the plan without them answers as a CEILING — but only where it
// finishes THIS craft: always for optional bones, and for required ones only when every slot keeps a
// member that is not carved (a carved mod named as an alternative), since otherwise that plan never
// places the carved mod.

import type { ItemState, PatchData } from '../../engine/src/types.ts';
import type { Prices } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import { slotIndexGroups } from './slots.ts';
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
 * The targets the first solve (without bones) is for, and whether its plan also finishes the full craft —
 * or undefined when this craft is solved once, as it always was: no bones, a craft that cannot start
 * over, an item that already carries a carved mod, or nothing left once the carved targets are dropped.
 */
export function boneFreeCraft(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
): { readonly targets: readonly TierTarget[]; readonly finishes: boolean } | undefined {
  if (opts.restartCost === undefined) return undefined;
  const role = boneRole(data, prices, start, targets, opts.policy);
  if (role === 'optional') return { targets, finishes: true };
  if (role !== 'required') return undefined;
  const carved = (modId: string): boolean => data.mods.get(modId)?.source === 'desecrated';
  // Required by what the item already holds, not by a target: the craft without bones is not a craft.
  if ([...start.prefixes, ...start.suffixes].some((p) => p.desecrated === true || carved(p.modId))) return undefined;
  const rest = targets.filter((t) => !carved(t.modId));
  // A shortcut, not a rule: a first solve with no targets is refused at once, leaving nothing to seed.
  if (rest.length === 0) return undefined;
  // Grouped as the solver groups them (slots.ts): a slot with a member left is a slot the plan fills.
  const finishes = slotIndexGroups(targets).every((g) => g.some((i) => !carved(targets[i]!.modId)));
  return { targets: rest, finishes };
}

/**
 * `markovFromItem` — for a craft with bones that can start over, solved without bones first (the carved
 * targets dropped, where there are any) and seeded from that plan; answered by that plan, marked
 * `withoutBones` with `bound: 'upper'`, when the solve with bones still runs out, reaches nothing lower,
 * and that plan finishes this craft. Any other craft is solved as it was.
 */
export function markovBoneFreeFirst(
  data: PatchData, prices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
  first: BoneFreeOptions = {},
): MarkovResult {
  const craft = boneFreeCraft(data, prices, start, targets, opts);
  if (!craft) return markovFromItem(data, prices, start, targets, opts);
  // A play-out is for the answer, and the solve with bones has its own clock and progress.
  const { replay: _replay, onProgress: _onProgress, maxMillis: _maxMillis, ...same } = opts;
  const free = markovFromItem(data, prices, start, craft.targets, {
    ...same,
    keepRoutes: true,
    policy: { excluded: new Set([...(opts.policy?.excluded ?? []), ...BONE_KEYS]) },
    ...(first.maxMillis === undefined ? {} : { maxMillis: first.maxMillis }),
    ...(first.onProgress ? { onProgress: first.onProgress } : {}),
  });
  const seed = free.feasible && free.bound === 'exact' ? free.routes : undefined;
  const res = markovFromItem(data, prices, start, targets, seed ? { ...opts, seedFrom: seed } : opts);
  if (!craft.finishes) return res;
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
