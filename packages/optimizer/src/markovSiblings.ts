// FAMILY SIBLINGS — the other mods a target shares a family with, and what rolling one does to it.
//
// A family is an exclusion group: an item holds at most one mod of it. For most targets the family IS
// the target — one mod at several tiers — and the lattice's `blocked` bit ("the family is taken by an
// off-tier roll") covers every collision there is. But a family can hold DIFFERENT mods. A Wand's Fire,
// Cold, Lightning, Chaos and Physical spell-damage prefixes are one family, and so are its six "+level
// to … spell skills" suffixes; a Precursor Tablet's "additional Essence" prefix shares a family with its
// "chance to contain Essences" suffix. Rolling any of them blocks the target exactly as an off-tier roll
// does, until it is removed. The lattice used to count them as junk that blocks nothing, which made the
// true expected cost too LOW — measured at 2.8 standard errors on a Wand wanting +Fire spell levels.
//
// Two treatments, by what the sibling can be told apart from:
//
//   - SAME SIDE, blocking ONE target: it is `blocked`, full stop. It sits in the target's family on the
//     target's side, one pick of a removal takes it, and after that the family is free — every property
//     an off-tier roll has. Its weight joins the target's below-tier weight and no state changes shape.
//     A carved hybrid ("+Str +Dex" against a Strength target) qualifies too: its other family touches no
//     target, and the lattice never tracks a family no target is in — the same approximation it makes
//     for every junk mod.
//   - The OTHER side, or TWO targets blocked at once: `blocked` counts a slot on the target's side and
//     marks one target, so it cannot say this. The sibling becomes a position of its own, an OBSTACLE:
//     in no slot, never wanted, tracked like a target and conflicting with whatever it blocks.
//     `isAccepting` treats one on the item as junk.
//
// Crafts whose targets share a family with nothing the base can roll get no siblings and no obstacles,
// and every number they produce is unchanged — `siblings.test.ts` holds that to the byte.

import type { ItemBase, Mod, PatchData } from '../../engine/src/types.ts';
import { familiesOf, resolveMod } from '../../engine/src/pool.ts';
import type { McTarget, ObstacleMasks } from './markovState.ts';
import { bit, representative } from './markovState.ts';

export interface Siblings {
  /** The targets, then any obstacle positions — the list the lattice indexes. */
  readonly list: readonly McTarget[];
  readonly obstacles: ObstacleMasks;
  /** Per position: the same-side siblings whose roll lands it as `blocked`. Empty for an obstacle. */
  readonly sameSide: readonly (readonly Mod[])[];
  /** Mod id → the position a same-side sibling blocks, for reading a real item and a boss's draw. */
  readonly blocks: ReadonlyMap<string, number>;
}

/**
 * Find every mod the base can roll — normal pool, and the desecrated one when a Desecration is in play —
 * that shares a family with a target without being one, and sort it into a same-side block or an
 * obstacle position. With no Desecration a carved mod can never land, so it is not looked at: an
 * obstacle nothing can place would only double the lattice.
 */
export function resolveSiblings(
  data: PatchData, pools: ItemBase['pools'], targets: readonly McTarget[], desecratable: boolean,
): Siblings {
  const members = new Set(targets.flatMap((t) => t.mods.map((m) => m.mod.id)));
  const famsOf = targets.map((t) => familiesOf(representative(t)));
  const sameSide: Mod[][] = targets.map(() => []);
  const blocks = new Map<string, number>();
  // Obstacles are grouped by side, source and their FULL family set: members then exclude each other
  // (they share a family), are removed and re-added by the same actions, and occupy the same families
  // once on the item — the conditions `mergeSlots` asks of a merged position.
  const groups = new Map<string, Mod[]>();

  const rollable = [...new Set([
    ...pools.normal.prefixes, ...pools.normal.suffixes,
    ...(desecratable ? [...pools.desecrated.prefixes, ...pools.desecrated.suffixes] : []),
  ])];
  for (const id of rollable) {
    if (members.has(id)) continue;
    const mod = resolveMod(data, id);
    const fams = familiesOf(mod);
    const hit = famsOf.flatMap((f, i) => (f.some((x) => fams.includes(x)) ? [i] : []));
    if (hit.length === 0) continue;
    const only = hit.length === 1 ? hit[0]! : -1;
    if (only >= 0 && mod.type === targets[only]!.type) {
      sameSide[only]!.push(mod);
      blocks.set(id, only);
      continue;
    }
    const key = `${mod.type}|${mod.source}|${[...fams].sort().join('+')}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(mod);
  }

  const list: McTarget[] = [...targets];
  let prefix = 0;
  let suffix = 0;
  for (const mods of groups.values()) {
    const type = mods[0]!.type;
    if (type === 'prefix') prefix |= bit(list.length); else suffix |= bit(list.length);
    // Any tier of an obstacle blocks, so every tier "fills" it: it is present or absent, never blocked.
    list.push({ mods: mods.map((mod) => ({ mod, minIndex: 0 })), type, fractured: false, obstacle: true });
    sameSide.push([]);
  }
  return { list, obstacles: { prefix, suffix }, sameSide, blocks };
}
