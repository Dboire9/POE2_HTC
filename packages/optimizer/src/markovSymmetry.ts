// SYMMETRY — when two of a slot's alternatives are indistinguishable to the solver, and what to do
// about it.
//
// A slot's candidates are interchangeable by definition of the feature: the player said "either will
// do". The solver does not know that, so it spends a bit on each and carries a state for every
// arrangement of them. Most of those states are the same situation wearing different labels, and the
// lattice is the dominant cost of a solve.
//
// There are TWO cases and they need opposite treatments, because they differ in whether the members
// can be on the item AT THE SAME TIME:
//
//   - SAME FAMILY (`#% increased Fire / Cold / Lightning Damage` are one family,
//     `WeaponDamageTypePrefix`). Only one can ever land. Once any of them does, the whole family is
//     excluded, so every later draw sees the identical pool and a removal returns the slot to empty
//     either way. Nothing downstream can tell them apart — so they MERGE into one target holding one
//     bit, and their weights sum on arrival. Exact, and unconditional: individual weights and tier
//     floors stop mattering the moment the family is occupied, and on arrival they simply add up.
//
//   - CROSS FAMILY (`Gain % as Extra Cold / Lightning` are `ColdDamage` / `LightningDamage`). Both can
//     sit on the item at once, and the family each occupies is different, so they cannot merge: the
//     pool denominator would be wrong and the "you got both" state — which is a finished item — would
//     have nowhere to go. What CAN go is the labelling. If the two are interchangeable in the stricter
//     sense below, `(Cold present, Lightning blocked)` and `(Cold blocked, Lightning present)` are one
//     situation, and the state key is canonicalised so only one of them is ever built.
//
// The stricter sense is real and checkable rather than assumed, because cross-family members are only
// interchangeable when the DATA says so — same weights at every reachable floor, and families whose
// exclusion removes the same weight from every pool. `Wands/DamageGainedAsCold`, `…AsFire` and
// `…AsLightning` all satisfy it today — sole members of their families, identical tier tables. Ask
// different TIERS of them and they stop, which is much the commonest way this does not apply.

import type { ItemBase, Mod, PatchData } from '../../engine/src/types.ts';
import { excluded, familiesOf, poolTotalWeight } from '../../engine/src/pool.ts';
import { desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { McCandidate, McTarget } from './markovState.ts';
import {
  FLAG_NONE, anyWeightOf, bit, encodeState, flagTarget, flaggedTarget, has, representative,
  succWeightOf,
} from './markovState.ts';
import type { StateEncoder } from './markovState.ts';
import { REACHABLE_FLOORS } from './markovActions.ts';

/** A candidate as the caller named it: one mod, the tier floor asked of it, and whether it is locked. */
export interface ResolvedCandidate {
  readonly mod: Mod;
  readonly minIndex: number;
  readonly fractured: boolean;
}

/**
 * What two candidates must share to MERGE into one target — or a key unique to this candidate when it
 * must never merge with anything.
 *
 * The shared half is what makes the merge exact: same side and same family set means one of them on the
 * item excludes all of them, and same source and lock state means they are removed and re-added by the
 * same actions. Weights and tier floors are deliberately absent — they decide the odds of ARRIVING,
 * which simply add, and stop mattering once the family is taken.
 *
 * The two unique cases are the ones that look mergeable and are not:
 *
 *   - NO FAMILY. A mod with no exclusion group does not block anything, so two of them can sit on the
 *     item together. Merging them would claim the second one cannot land.
 *   - A PERFECT ESSENCE forces its mod rather than drawing it, so two of them are a priced CHOICE the
 *     player makes, not a union of weights on one roll. Merging would silently keep one and hide the
 *     other's price — and essence prices are per-mod (`essence:<level>:<modId>`).
 */
export function mergeKey(c: ResolvedCandidate, index: number): string {
  const fams = familiesOf(c.mod);
  if (fams.length === 0 || c.mod.source === 'perfect_essence') return `alone:${index}`;
  return [c.mod.type, c.mod.source, c.fractured, [...fams].sort().join('+')].join('|');
}

/**
 * Merge each slot's same-family candidates, keeping every other candidate exactly where it was.
 *
 * Merging is scoped to a slot: two SLOTS wanting one family is an impossible target, and
 * `markovFromItem` rejects it by name. Merging across slots first would silently turn that error into
 * one target and lose the message.
 *
 * Targets come back in the order their FIRST member appeared, so a craft with nothing to merge gets
 * back the list it passed in, index for index — which is what makes every state key, and therefore
 * every published number, identical to what it was before this existed.
 */
export function mergeSlots(
  cands: readonly ResolvedCandidate[], slotGroups: readonly (readonly number[])[],
): { readonly targets: McTarget[]; readonly slots: number[][] } {
  const slotOf = new Map<number, number>();
  slotGroups.forEach((g, s) => { for (const i of g) slotOf.set(i, s); });

  const at = new Map<string, number>();
  // Parallel to `targets`, and each entry IS that target's `mods` array — the same object, held
  // mutably here so a later member can be pushed onto it without casting away `readonly`.
  const mods: McCandidate[][] = [];
  const targets: McTarget[] = [];
  const slots: number[][] = slotGroups.map(() => []);
  for (let i = 0; i < cands.length; i++) {
    const c = cands[i]!;
    const s = slotOf.get(i)!;
    const key = `${s}#${mergeKey(c, i)}`;
    const found = at.get(key);
    if (found !== undefined) { mods[found]!.push({ mod: c.mod, minIndex: c.minIndex }); continue; }
    at.set(key, targets.length);
    slots[s]!.push(targets.length);
    const members: McCandidate[] = [{ mod: c.mod, minIndex: c.minIndex }];
    mods.push(members);
    targets.push({ mods: members, type: c.mod.type, fractured: c.fractured });
  }
  return { targets, slots };
}

/** Slot masks over the MERGED target indices — the form the goal and the distance heuristic want. */
export const slotMasksOf = (slots: readonly (readonly number[])[]): number[] =>
  slots.map((g) => g.reduce((m, i) => m | bit(i), 0));

/** Every family this target's members occupy. They all share one set, so member 0 speaks for all. */
export const familiesOfTarget = (t: McTarget): readonly string[] => familiesOf(representative(t));

// ── Cross-family: same bits, one spelling ───────────────────────────────────────────────────────

/**
 * Build a drop-in replacement for `encodeState` that writes the CANONICAL spelling of each state.
 *
 * Cross-family alternatives cannot merge — each occupies a different family, so the pool denominator
 * genuinely differs and the "you got both" state is a real, finished item. What can go is the
 * labelling. When two positions are interchangeable, `(Cold present, Lightning blocked)` and
 * `(Cold blocked, Lightning present)` are one situation, so the encoder repacks a class's present
 * members onto its lowest indices and its blocked members onto the next — and every outcome that
 * would have led to either spelling lands on the survivor instead. `addTo` sums duplicates, so the
 * permuted successors collapse with no call site knowing anything happened.
 *
 * With nothing interchangeable this IS `encodeState` — the same function object, so there is provably
 * not even a branch to pay for on a craft that predates this.
 */
export function encoderFor(classes: readonly (readonly number[])[]): StateEncoder {
  const real = classes.filter((c) => c.length > 1);
  if (real.length === 0) return encodeState;
  return (present, blocked, jp, js, flagged = FLAG_NONE, rarity = 'rare') => {
    let p = present;
    let b = blocked;
    let f = flagged;
    const marked = flaggedTarget(flagged);
    for (const cls of real) {
      const pres: number[] = [];
      const blk: number[] = [];
      for (const i of cls) {
        if (has(present, i)) pres.push(i);
        else if (has(blocked, i)) blk.push(i);
      }
      if (pres.length + blk.length === 0) continue;
      for (const i of cls) { p &= ~bit(i); b &= ~bit(i); }
      let slot = 0;
      // The desecration flag names an INDEX, so it has to travel with the member it marks — otherwise
      // repacking would move the mod and leave the mark on whatever landed in its place.
      for (const i of pres) { const to = cls[slot++]!; p |= bit(to); if (i === marked) f = flagTarget(to); }
      for (const i of blk) { const to = cls[slot++]!; b |= bit(to); if (i === marked) f = flagTarget(to); }
    }
    return encodeState(p, b, jp, js, f, rarity);
  };
}

/**
 * Which `(present, blocked)` arrangements `enumerateStates` should keep — the ones the encoder above
 * would leave alone. Built from the same function so the lattice and the transitions can never
 * disagree about which spelling survived; `undefined` when there is nothing to canonicalise, which
 * leaves the enumeration untouched.
 */
export function canonicalFilterFor(
  classes: readonly (readonly number[])[],
): ((present: number, blocked: number) => boolean) | undefined {
  const encode = encoderFor(classes);
  if (encode === encodeState) return undefined;
  return (present, blocked) => encode(present, blocked, 0, 0) === encodeState(present, blocked, 0, 0);
}

/** What a solve needs to know about the pools before it can judge two positions interchangeable. */
export interface SymmetryContext {
  readonly data: PatchData;
  readonly pools: ItemBase['pools'];
  readonly level: number;
}

/**
 * Positions whose labels are interchangeable, grouped, within each slot.
 *
 * Two positions are interchangeable when NOTHING downstream can tell "this one landed" from "that one
 * landed". That is a claim about the DATA, not about the player's intent, so it is measured rather
 * than assumed — and it holds far less often than it looks:
 *
 *   - Same side, source and lock state, or they are removed and re-added by different actions.
 *   - Identical filling AND occupying weight at every floor a craft can draw at. This is what mixed
 *     tiers break: `Extra Cold` at T1 and `Extra Lightning` at T3 fill on different halves of their
 *     weight, so "Cold landed below tier" is not "Lightning landed below tier".
 *   - Occupying either family must remove the same weight from every pool the craft draws from, since
 *     that weight is the denominator of every later roll. The essence pool is checked too, though it
 *     is not a denominator TODAY — a Perfect Essence forces its mod rather than drawing one — because
 *     it becomes one the moment the regular-Essence action exists (TODO 1), and a condition added
 *     afterwards is a condition added after the numbers were already wrong.
 *   - …and the same COUNT from each boss's desecration pool, because that draw is uniform over the
 *     candidates rather than weighted (see `desecrationBossProbability`). Weight is the wrong question
 *     there and would pass a pair the bone can tell apart.
 *   - Neither family may be shared with any OTHER position, or occupying one would block a target that
 *     occupying its twin does not.
 *
 * Grouped by a signature rather than compared pairwise: every condition is an equality, so
 * interchangeability is transitive and equal signatures are a class.
 */
export function permutationClasses(
  ctx: SymmetryContext, list: readonly McTarget[], slots: readonly (readonly number[])[],
): number[][] {
  const { data, pools, level } = ctx;
  const famsOf = list.map(familiesOfTarget);
  // A family shared with another position makes this one's exclusions visible in a way its twin's are
  // not, so it can never be swapped for anything.
  const shared = famsOf.map((f, i) => f.some((x) => famsOf.some((g, j) => j !== i && g.includes(x))));

  const poolLists: string[][] = [
    [...pools.normal.prefixes], [...pools.normal.suffixes],
    [...pools.desecrated.prefixes], [...pools.desecrated.suffixes],
    [...pools.essence.prefixes], [...pools.essence.suffixes],
  ];
  // The boss pools, split exactly as the action space splits them: uniform draws, counted not weighed.
  const bossLists: string[][] = [];
  for (const sd of ['prefixes', 'suffixes'] as const) {
    for (const boss of ['blackblooded', 'liege', 'sovereign'] as const) {
      bossLists.push(pools.desecrated[sd].filter((id) => {
        const m = data.mods.get(id);
        return m !== undefined && desecrationOmenForMod(m) === boss;
      }));
    }
  }

  const signature = (i: number): string => {
    const t = list[i]!;
    const occ = new Set(famsOf[i]);
    const parts: (string | number)[] = [t.type, representative(t).source, String(t.fractured)];
    for (const floor of REACHABLE_FLOORS) {
      parts.push(succWeightOf(t, floor, level), anyWeightOf(t, floor, level));
      for (const ids of poolLists) parts.push(poolTotalWeight(data, ids, floor, level, occ));
    }
    for (const ids of bossLists) {
      parts.push(ids.filter((id) => excluded(data.mods.get(id)!, occ)).length);
    }
    return parts.join('|');
  };

  const out: number[][] = [];
  for (const slot of slots) {
    const bySig = new Map<string, number[]>();
    for (const i of slot) {
      if (famsOf[i]!.length > 0 && shared[i]) continue;
      const sig = signature(i);
      const found = bySig.get(sig);
      if (found) found.push(i); else bySig.set(sig, [i]);
    }
    for (const cls of bySig.values()) if (cls.length > 1) out.push(cls);
  }
  return out;
}
