// SLOTS — the one place that knows which targets are alternatives for each other.
//
// A target carries an optional `slot`. Candidates sharing a slot fill it interchangeably ("Extra Cold
// or Extra Lightning, I don't care which"), so a target list may name more candidates than the six mods
// an item holds. A target with no `slot` is a slot of its own, which is what every target meant before
// slots existed — so a caller that has never heard of them gets one slot per target and every helper
// here reduces to the identity it replaced.
//
// TWO CONSUMERS, AND THEY NEED OPPOSITE THINGS:
//
//   - The MDP (`markovFromItem`) needs `slotIndexGroups`, because it solves the disjunction DIRECTLY.
//     Its goal accepts any one member per slot, so a bad roll on the way to Cold that lands Lightning
//     is simply a finish. That is the whole value of a slot, and it is why the MDP must not be handed
//     an expansion.
//
//   - The linear planners (`optimizePareto`, `optimizeFromItem`, `alternatives`) need `expandSlots`,
//     because what they produce is a FIXED SEQUENCE. A route has to commit to a mod to name it in a
//     step, so a slot becomes one concrete route per member and the frontier carries them all. That is
//     honest for a route, and it also sidesteps the factorial: those planners permute their target
//     list, so nine candidates in one list would be 9! = 362,880 orderings against 6! = 720 for each
//     of three expansions.
//
// Expanding for the MDP would be WRONG, not merely slower: min(cost(Cold), cost(Lightning)) over
// separate solves throws away exactly the option value a slot buys.
//
// What the MDP then does with a slot's members — merge the same-family ones into a single bit, and
// stop distinguishing interchangeable cross-family ones — lives in markovSymmetry.ts. That is a
// SOLVER optimisation and deliberately not here: it changes how a craft is represented, never which
// candidates are alternatives, and the linear planners must not see any of it.

import type { TierTarget } from './optimize.ts';

/**
 * Indices of `targets`, grouped into slots, in order of first appearance.
 *
 * Keyed on `slot === undefined ? unique : slot` so an unslotted target can never collide with a
 * slotted one — including with a caller that numbers its slots 0, 1, 2 while leaving others bare.
 */
export function slotIndexGroups(targets: readonly TierTarget[]): number[][] {
  const groups: number[][] = [];
  const at = new Map<number, number>();
  for (let i = 0; i < targets.length; i++) {
    const slot = targets[i]!.slot;
    if (slot === undefined) { groups.push([i]); continue; }
    const found = at.get(slot);
    if (found === undefined) { at.set(slot, groups.length); groups.push([i]); } else groups[found]!.push(i);
  }
  return groups;
}

/** Does any slot hold more than one candidate? False for every target list that predates slots. */
export function hasAlternatives(targets: readonly TierTarget[]): boolean {
  return slotIndexGroups(targets).some((g) => g.length > 1);
}

/** How many concrete target lists `expandSlots` would produce — the product of the slot sizes. */
export function expansionCount(targets: readonly TierTarget[]): number {
  return slotIndexGroups(targets).reduce((n, g) => n * g.length, 1);
}

/**
 * Every concrete target list: one candidate from each slot, `slot` stripped since nothing downstream
 * of the expansion has a disjunction left to resolve.
 *
 * A list with no alternatives expands to itself, so the callers' single-combination path stays exactly
 * the one they had — same objects, same order, same answer.
 */
export function expandSlots<T extends TierTarget>(targets: readonly T[]): T[][] {
  const groups = slotIndexGroups(targets);
  const strip = (t: T): T => (t.slot === undefined ? t : ({ ...t, slot: undefined }));
  let out: T[][] = [[]];
  for (const group of groups) {
    const next: T[][] = [];
    for (const partial of out) for (const i of group) next.push([...partial, strip(targets[i]!)]);
    out = next;
  }
  return out;
}

/**
 * Drop the expansions that could never be an item, keeping the ones that can.
 *
 * A per-item rule is not a per-target rule once slots exist. "Carved Cast Speed, or failing that a
 * normal one" in two slots is a fine ask — only one carved mod ever lands — but the ONE combination
 * that takes the carved member of both is not an item, and the linear planners rightly throw on it.
 * Throwing there would kill the whole merged search, so the illegal combinations are dropped before
 * they are run and the legal ones still produce routes.
 *
 * Returns every combination unchanged when there is nothing to drop, which is every craft without
 * alternatives — those planners keep exactly the validation, and the exact error messages, they had.
 */
export function itemLegalCombinations<T extends TierTarget>(
  combos: readonly T[][], isDesecrated: (modId: string) => boolean,
): T[][] {
  const legal = combos.filter((c) => c.filter((t) => isDesecrated(t.modId)).length <= 1);
  // Never return nothing: with no combination left, the caller must run one anyway so the planner's
  // own validator produces the real message rather than the caller inventing an empty frontier.
  return legal.length > 0 ? legal : [...combos];
}
