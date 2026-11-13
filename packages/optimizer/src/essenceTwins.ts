// ESSENCE TWINS — a rolled target can also be met by the Essence that gives the same modifier.
//
// The data keeps an essence's modifier apart from the rolled one: `Rings/Essence_FireResistance`
// beside `Rings/FireResistance`, the same stat with tiers that ARE rolled tiers (Greater Essence of
// Insulation is exactly the rolled T3, 31–35). A target names the rolled mod, so until this existed no
// planner would ever force it with an Essence — "Fire Resistance T3" could only be rolled, even where
// a Greater Essence guarantees it for a fraction of the rolls (measured 2026-11-13: the four example
// crafts 72–94% cheaper with the essence allowed; docs/validation.md).
//
// A twin is offered as an ALTERNATIVE in the target's own slot: "this rolled mod, or its essence". That
// is the slot machinery every planner already has (slots.ts), so nothing new solves it. Two things keep
// it from being an ordinary alternative, and both live here so the planners cannot disagree on them:
//
//   - A twin is a CRAFTED modifier, which sits in a family namespace of its own (`crafted:<family>`,
//     pool.ts): an item can carry a rolled and a crafted Fire Resistance together. So it is a separate
//     position, never merged with the rolled mod, and the item's one crafted modifier is spent on it.
//   - Nobody asked for it. A twin that does not fit the model is dropped (`fitTwins`), never a reason to
//     refuse the craft — and at most one ever lands, since a regular Essence needs a Magic item and
//     leaves it Rare.

import type { ItemBase, Mod, PatchData } from '../../engine/src/types.ts';
import { resolveMod } from '../../engine/src/pool.ts';
import { isEssenceMod } from '../../engine/src/probability.ts';
import type { TierTarget } from './optimize.ts';
import { resolveSiblings } from './markovSiblings.ts';
import type { ResolvedCandidate } from './markovSymmetry.ts';
import { mergeSlots } from './markovSymmetry.ts';
import { slotIndexGroups } from './slots.ts';

/** The most positions the MDP models — the same limit `resolveProblem` refuses past. */
export const MAX_POSITIONS = 9;

const sameRanges = (a: Mod['tiers'][number], b: Mod['tiers'][number]): boolean =>
  JSON.stringify(a.ranges) === JSON.stringify(b.ranges);

/**
 * The regular-essence mod, and the lowest essence level, that give `mod` at tier `minIndex` or better —
 * or undefined when no essence does.
 *
 * A level counts only when its ranges ARE a rolled tier's ranges at or above the one asked: the data
 * builds essence tiers out of rolled ones (Insulation's three levels are the rolled 11–15, 21–25 and
 * 31–35), so equality is exact where it holds and a near miss is not guessed at. Body Armour's Greater
 * Essence of the Body (100–119) is a rolled tier, but below a T3 of 175–189, so it is no twin there.
 * Which level to BUY at or above the one returned is `cheapestEssenceLevel`'s choice (cost.ts), as for
 * any essence target.
 */
export function essenceTwinOf(
  data: PatchData, base: ItemBase, mod: Mod, minIndex: number, itemLevel: number,
  /** Can this essence, at this level, be bought — priced and not excluded? Absent ⇒ every level can. */
  available: (modId: string, tierName: string) => boolean = () => true,
): { modId: string; minTierIndex: number } | undefined {
  if (mod.source !== 'normal' || !mod.family) return undefined;
  const pool = mod.type === 'prefix' ? base.pools.essence.prefixes : base.pools.essence.suffixes;
  for (const id of pool) {
    const e = resolveMod(data, id);
    if (e.source !== 'essence' || e.family !== mod.family || e.type !== mod.type) continue;
    for (let k = 0; k < e.tiers.length; k++) {
      const tier = e.tiers[k]!;
      const j = mod.tiers.findIndex((r) => sameRanges(r, tier));
      if (j < minIndex) continue;
      // Any level from here up gives the tier asked; offer the twin only if one of them can be bought —
      // at or under the item's level, priced, and not excluded.
      const buyable = e.tiers.slice(k).some((t) => t.ilvl <= itemLevel && available(e.id, t.name));
      return buyable ? { modId: e.id, minTierIndex: k } : undefined;
    }
  }
  return undefined;
}

/**
 * `targets` with each rolled target's essence twin added to its slot.
 *
 * Nothing is added to a craft that can spend no crafted modifier on a twin: one whose slots already
 * need as many crafted mods as the base holds (an Essence or Perfect Essence the player named), and one
 * holding a crafted mod already. A slot that already names a crafted candidate gets no twin either —
 * the player has said which essence they mean. Targets keep their order; twins follow, and an unslotted
 * target is given a slot id so its twin can share it.
 */
export function withEssenceTwins(
  data: PatchData, base: ItemBase, targets: readonly TierTarget[], itemLevel: number, craftedCap: number,
  available?: (modId: string, tierName: string) => boolean,
): TierTarget[] {
  const groups = slotIndexGroups(targets);
  const crafted = (i: number): boolean => isEssenceMod(resolveMod(data, targets[i]!.modId));
  const craftedOnly = groups.filter((g) => g.every(crafted)).length;
  if (craftedOnly >= craftedCap) return [...targets];
  let next = Math.max(-1, ...targets.map((t) => t.slot ?? -1)) + 1;
  const out: TierTarget[] = targets.map((t) => (t.slot === undefined ? { ...t, slot: next++ } : t));
  const twins: TierTarget[] = [];
  for (const g of groups) {
    if (g.some(crafted)) continue;
    const slot = out[g[0]!]!.slot!;
    const seen = new Set<string>();
    for (const i of g) {
      const t = targets[i]!;
      const twin = essenceTwinOf(data, base, resolveMod(data, t.modId), t.minTierIndex ?? 0, itemLevel, available);
      if (!twin || seen.has(twin.modId)) continue;
      seen.add(twin.modId);
      twins.push({ ...twin, slot, essenceTwin: true });
    }
  }
  return [...out, ...twins];
}

/** A slot's roll weight at its asked tiers — how often a roll lands it; the smaller, the more a twin saves. */
function rollWeight(cands: readonly ResolvedCandidate[], members: readonly number[], level: number): number {
  let w = 0;
  for (const i of members) {
    const c = cands[i]!;
    if (c.twin || c.mod.source !== 'normal') continue;
    c.mod.tiers.forEach((t, j) => { if (j >= c.minIndex && t.ilvl <= level) w += t.weight; });
  }
  return w;
}

/**
 * Keep the twins that fit the model — rarest roll first — and drop the rest.
 *
 * The named targets and their siblings take the positions they need regardless (`resolveSiblings`; a
 * twin's crafted family adds no sibling, so this count does not depend on which twins stay). What is
 * left of `MAX_POSITIONS`, and of the candidate cap, goes to twins in order of how rare the roll they
 * replace is. A list with no twins comes back as given.
 */
export function fitTwins(
  data: PatchData, pools: ItemBase['pools'], level: number,
  targets: readonly TierTarget[], cands: readonly ResolvedCandidate[], desecratable: boolean,
): { targets: TierTarget[]; cands: ResolvedCandidate[] } {
  const isTwin = targets.map((t) => t.essenceTwin === true);
  if (!isTwin.some(Boolean)) return { targets: [...targets], cands: [...cands] };
  const named = targets.map((_, i) => i).filter((i) => !isTwin[i]);
  const namedTargets = named.map((i) => targets[i]!);
  const namedCands = named.map((i) => cands[i]!);
  const positions = resolveSiblings(
    data, pools, mergeSlots(namedCands, slotIndexGroups(namedTargets)).targets, desecratable,
  ).list.length;
  const room = Math.max(0, Math.min(MAX_POSITIONS - positions, MAX_POSITIONS - namedCands.length));
  const groups = slotIndexGroups(targets);
  const groupOf = new Map<number, readonly number[]>();
  for (const g of groups) for (const i of g) groupOf.set(i, g);
  const ranked = targets.map((_, i) => i).filter((i) => isTwin[i])
    .map((i) => ({ i, w: rollWeight(cands, groupOf.get(i)!, level) }))
    .sort((a, b) => a.w - b.w || a.i - b.i)
    .slice(0, room)
    .map((x) => x.i);
  const keep = new Set(ranked);
  const idx = targets.map((_, i) => i).filter((i) => !isTwin[i] || keep.has(i));
  return { targets: idx.map((i) => targets[i]!), cands: idx.map((i) => cands[i]!) };
}
