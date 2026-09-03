// TARGET SLOTS — the app-side rules for a target whose slots may hold alternatives.
//
// A slot is one position on the finished item. It usually holds one mod; it may hold several, any one
// of which fills it ("Extra Cold or Extra Lightning, I don't care which"). So a target can name more
// candidates than the six mods an item holds, and the LIMIT MOVED: three prefixes and three suffixes
// are limits on SLOTS, not on candidates.
//
// Both planner tabs need these rules and used to hold their own copy — with different wording and, on
// the item tab, a target picker that enforced no cap at all. One module, so they cannot drift again.

import type { EngineMod, TargetInput } from './engineTypes.ts';
import { modFamilies } from './engineTypes.ts';

/** Most slots one side of an item can hold. The item's own limit, unchanged by alternatives. */
export const MAX_PER_SIDE = 3;

/** One position on the finished item, and the candidates any one of which fills it. */
export interface Slot {
  /** The shared `slot` id, or undefined for a lone target that has never been grouped. */
  readonly id: number | undefined;
  readonly type: 'prefix' | 'suffix';
  /** Indices into the target array, in the order they were added. Never empty. */
  readonly members: readonly number[];
}

/**
 * Group a target list into slots, in order of first appearance.
 *
 * An unslotted target is a slot of its own and can never join a numbered one — including slot 0, which
 * `slot ?? 0` would silently merge it into. Mirrors `slotIndexGroups` in the optimizer deliberately:
 * the two must agree about which candidates are alternatives or the app will show one craft and solve
 * another.
 */
export function slotsOf(targets: readonly TargetInput[], modById: ReadonlyMap<string, EngineMod>): Slot[] {
  const slots: Slot[] = [];
  const mutable: { id: number | undefined; type: 'prefix' | 'suffix'; members: number[] }[] = [];
  const at = new Map<number, number>();
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]!;
    const type = modById.get(t.modId)?.type ?? 'prefix';
    if (t.slot === undefined) { mutable.push({ id: undefined, type, members: [i] }); continue; }
    const found = at.get(t.slot);
    if (found === undefined) { at.set(t.slot, mutable.length); mutable.push({ id: t.slot, type, members: [i] }); }
    else mutable[found]!.members.push(i);
  }
  for (const s of mutable) slots.push(s);
  return slots;
}

/** Slots in use per side — what the 3-per-side limit actually counts. */
export function slotCounts(
  targets: readonly TargetInput[], modById: ReadonlyMap<string, EngineMod>,
): { prefix: number; suffix: number } {
  const slots = slotsOf(targets, modById);
  return {
    prefix: slots.filter((s) => s.type === 'prefix').length,
    suffix: slots.filter((s) => s.type === 'suffix').length,
  };
}

/** A slot id no existing slot uses, for the next group. Ids are opaque — only equality matters. */
export function nextSlotId(targets: readonly TargetInput[]): number {
  let max = -1;
  for (const t of targets) if (t.slot !== undefined && t.slot > max) max = t.slot;
  return max + 1;
}

/**
 * Do two of this slot's alternatives sit in different families AND ask different tiers?
 *
 * A PLANNER fact, not a game rule: nothing here stops the craft, and the answer the app gives is the
 * same either way. It is about how long the answer takes.
 *
 * The solver has two ways to make a slot's alternatives cheap. Same-family alternatives merge outright
 * — only one can ever be on the item, so they share a single bit, and their tiers are irrelevant to
 * that. Different-family alternatives cannot merge (both can land, and each takes a different mod out
 * of the pool), so the most the solver can do is stop tracking WHICH of them is in which state — and
 * that needs them to be indistinguishable, which asking different tiers of them destroys.
 *
 * So this is exactly the case the player can do something about, and the only one worth a line: the
 * data conditions (matching weights, no shared family) are not theirs to change.
 *
 * Matching the tiers is NECESSARY, not sufficient — the copy must not promise a speed-up it cannot
 * guarantee, only name what is standing in the way.
 */
/**
 * The one line the app says about it, kept here so both tabs say it identically — the reason this
 * module exists at all. Names the mechanism and the fix, promises no number: matching the tiers is
 * necessary for the solver to fold these together, not sufficient.
 */
export const MIXED_TIER_NOTE =
  'These alternatives ask different tiers, so the solver tracks them separately — slower to compute, '
  + 'same answer. Asking the same tier of each lets it treat them as one.';

export function mixedTierAlternatives(
  slot: Slot, targets: readonly TargetInput[], modById: ReadonlyMap<string, EngineMod>,
): boolean {
  // Worst acceptable tier index, exactly as `minTierIndexOf` computes it for the engine: display is
  // 1-based from the best, the engine counts up from the worst.
  const floorOf = (t: TargetInput): number => {
    const n = modById.get(t.modId)?.tiers.length ?? 0;
    return Math.max(0, Math.min(n - 1, n - t.tierDisplay));
  };
  for (let a = 0; a < slot.members.length; a++) {
    for (let b = a + 1; b < slot.members.length; b++) {
      const ta = targets[slot.members[a]!]!;
      const tb = targets[slot.members[b]!]!;
      if (floorOf(ta) === floorOf(tb)) continue;
      const fa = modFamilies(modById.get(ta.modId));
      const fb = modFamilies(modById.get(tb.modId));
      if (!fa.some((f) => fb.includes(f))) return true;
    }
  }
  return false;
}

/** Why a mod cannot be added, in the user's words — or `null` when it can. */
export type AddBlock = string | null;

/**
 * Can `mod` be added — as a new slot, or as an alternative to the slot at `intoSlot`?
 *
 * The two differ in exactly two rules, and both differences are the point of the feature:
 *
 *  - **The side cap does not apply** when joining a slot. No new slot is created, so a fourth prefix
 *    CANDIDATE on a target that has three prefix slots is legal — only one of them ends up on the item.
 *  - **Family collision is allowed inside the slot.** Siblings are the ordinary alternative
 *    (`#% increased Fire / Cold / Lightning Damage` are one family), and they collide by definition.
 *    Across slots it stays forbidden: two slots wanting one family could never both be filled.
 *
 * The one-desecrated and one-essence caps are counted over CANDIDATES, not over slots, which is
 * stricter than the game needs — two slots could each offer a desecrated alternative and no single
 * finished item would hold two. The solver rejects that list outright, so the UI refuses it here where
 * the reason can be said plainly rather than surfacing later as an unreachable target.
 */
export function whyNotAdd(
  mod: EngineMod,
  targets: readonly TargetInput[],
  modById: ReadonlyMap<string, EngineMod>,
  opts: { readonly intoSlot?: number; readonly hasFractured?: boolean } = {},
): AddBlock {
  const slots = slotsOf(targets, modById);
  const joining = opts.intoSlot === undefined ? undefined : slots.find((s) => s.id === opts.intoSlot);
  if (targets.some((t) => t.modId === mod.id)) return 'Already in the target';

  if (joining) {
    if (mod.type !== joining.type) {
      return `This slot holds ${joining.type}es — an alternative has to sit on the same side`;
    }
  } else {
    const counts = slotCounts(targets, modById);
    const used = mod.type === 'prefix' ? counts.prefix : counts.suffix;
    if (used >= MAX_PER_SIDE) return `This side is full (max ${MAX_PER_SIDE})`;
  }

  // Families held by every OTHER slot. The slot being joined is exempt: its members are alternatives,
  // so they are meant to be mutually exclusive.
  const taken = new Set<string>();
  for (const s of slots) {
    if (joining && s === joining) continue;
    for (const i of s.members) for (const f of modFamilies(modById.get(targets[i]!.modId))) taken.add(f);
  }
  const clash = modFamilies(mod).find((f) => taken.has(f));
  if (clash !== undefined) return `Family “${clash}” is already on the item — one mod per family`;

  // `'alloy'` is here deliberately, and it is the one place adding that source could have changed a
  // RULE rather than a label. An Alloy is a Perfect Essence by mechanic — the engine's source for both
  // is `perfect_essence`, and `isEssenceMod` counts them together — so leaving it out would have let a
  // player ask for two essence modifiers on one item, a rule change smuggled in as a rename.
  // Whether the cap really covers Alloys is UNTRACED; keeping today's behaviour is the conservative
  // reading, and `whyNotAdd` is where that choice is written down rather than left to drift.
  const isEssence = (m: EngineMod | undefined): boolean =>
    m?.source === 'essence' || m?.source === 'perfect' || m?.source === 'alloy';
  if (isEssence(mod) && targets.some((t) => isEssence(modById.get(t.modId)))) {
    return 'An item can hold one essence modifier — regular or perfect, not both';
  }
  if (mod.source === 'essence' && opts.hasFractured) {
    return 'Can’t use a regular essence with a fractured mod — it needs a Magic start, a fracture forces a Rare';
  }
  /*
   * At most one desecrated mod on the FINISHED ITEM — which stopped meaning "at most one in the target"
   * the moment slots existed.
   *
   * "Carved Cast Speed, or failing that a normal one" is an ordinary ask, and a second slot may say the
   * same thing: however they resolve, only one carved mod ends up on the item. What cannot be satisfied
   * is a target where two slots offer NOTHING BUT carved mods — then every way of filling them lands
   * two. So the test is on the slots that are FORCED, not on how many carved candidates exist.
   */
  if (mod.source === 'desecrated') {
    const carvedOnly = (s: Slot, extra: boolean): boolean => {
      const members = s.members.map((i) => modById.get(targets[i]!.modId));
      return (members.length > 0 || extra) && members.every((m) => m?.source === 'desecrated');
    };
    const forced = slots.filter((s) => carvedOnly(s, false)).length
      // The mod being added: joining a slot can only keep it forced, never make it so; a NEW slot is
      // forced by definition, since this mod would be its only member.
      + (joining ? 0 : 1);
    if (forced > 1) {
      return 'Another slot can only be filled by a desecrated mod, and an item holds one — give one of them a non-desecrated alternative';
    }
  }
  return null;
}
