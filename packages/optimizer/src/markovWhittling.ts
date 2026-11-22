// The OMEN OF WHITTLING in the true-cost solve (TODO 12b): "your next Chaos Orb will remove the lowest
// level modifier" — fractured mods never, ties uniform, a target as readily as junk.
//
// The lattice keeps no mod's level (markovState.ts): it knows which targets are on the item and how many
// other mods sit on each side, never at which tier any of them rolled. So the removal is played as an
// AVERAGE over levels. Each mod on the item gets a level distribution from what the state does know about
// it — a present target rolled one of its tiers at or above the one asked, a blocked position one below
// it or one of its siblings, junk one of its side's junk mods — every tier inside [0, item level] in
// proportion to its weight, which is how a Chaos Orb at base strength draws it. The levels are taken as
// independent, and "which is lowest" is then an order statistic: mod m is removed with probability
//
//   Σ_v P(L_m = v) · E[ 1 / (1 + T) ; every other mod ≥ v ],   T = how many others sit exactly at v,
//
// the 1/(1+T) being the uniform tie (validation.md records it as a ruling, not a traced rule). With each
// other mod j contributing (P(L_j > v) + P(L_j = v)·x) to a product polynomial, the expectation is that
// polynomial's integral over x ∈ [0, 1] — one product per level, a handful of mods each.
//
// What the average does not see: the level a mod ACTUALLY rolled (a held item's are known, and an Exalt
// at Greater or Perfect strength rolls higher than floor 0), and that two mods' levels are not
// independent once the policy has kept one because of it. The replay (markovReplay.ts) plays the real
// omen on real tiers, which is what measures how much that costs.

import type { ItemBase, Mod, PatchData } from '../../engine/src/types.ts';
import { familiesOf } from '../../engine/src/pool.ts';
import type { FlagCode, McState, McTarget, StateEncoder, StateKey } from './markovState.ts';
import {
  FLAG_JUNK_PREFIX, FLAG_JUNK_SUFFIX, FLAG_NONE, bit, flagJunkSide, flaggedTarget, has, occupiedFamilies, representative,
} from './markovState.ts';

/** One mod's level as a distribution: distinct levels ascending, and the chance of each (summing to 1). */
export interface LevelDist {
  readonly levels: readonly number[];
  readonly probs: readonly number[];
}

/** A distribution from (level, weight) pairs — duplicates summed, non-positive weights dropped. Empty input ⇒ undefined. */
export function levelDistOf(pairs: Iterable<readonly [number, number]>): LevelDist | undefined {
  const byLevel = new Map<number, number>();
  for (const [v, w] of pairs) if (w > 0) byLevel.set(v, (byLevel.get(v) ?? 0) + w);
  if (byLevel.size === 0) return undefined;
  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  let total = 0;
  for (const w of byLevel.values()) total += w;
  return { levels, probs: levels.map((v) => byLevel.get(v)! / total) };
}

/** A group of `count` mods sharing one level distribution — junk on a side is the common case. */
export interface LevelGroup {
  readonly dist: LevelDist;
  readonly count: number;
}

/**
 * The chance that ONE member of each group is the mod an Omen of Whittling removes — the order statistic
 * in the header, ties split evenly. A group's members are interchangeable, so the group as a whole is
 * removed with `count` times its entry. With at least one mod the entries, so weighted, sum to 1.
 */
export function lowestOdds(groups: readonly LevelGroup[]): number[] {
  const live = groups.map((g) => g.count > 0);
  const levels = [...new Set(groups.flatMap((g, k) => (live[k] ? g.dist.levels : [])))].sort((a, b) => a - b);
  // Per group and level: P(L = v) and P(L > v).
  const at = groups.map((g) => {
    const eq = new Float64Array(levels.length);
    const above = new Float64Array(levels.length);
    let j = 0;
    for (let li = 0; li < levels.length; li++) {
      while (j < g.dist.levels.length && g.dist.levels[j]! < levels[li]!) j++;
      if (j < g.dist.levels.length && g.dist.levels[j] === levels[li]) eq[li] = g.dist.probs[j]!;
      let tail = 0;
      for (let t = g.dist.levels[j] === levels[li] ? j + 1 : j; t < g.dist.levels.length; t++) tail += g.dist.probs[t]!;
      above[li] = tail;
    }
    return { eq, above };
  });
  const out = groups.map(() => 0);
  const poly = new Float64Array(groups.reduce((n, g) => n + Math.max(0, g.count), 0) + 1);
  for (let li = 0; li < levels.length; li++) {
    for (let k = 0; k < groups.length; k++) {
      if (!live[k]) continue;
      const pk = at[k]!.eq[li]!;
      if (pk <= 0) continue;
      // Every other mod: the k-th group less the one being asked about.
      poly.fill(0);
      poly[0] = 1;
      let deg = 0;
      let dead = false;
      for (let h = 0; h < groups.length; h++) {
        const times = groups[h]!.count - (h === k ? 1 : 0);
        if (times <= 0) continue;
        const a = at[h]!.eq[li]!;
        const b = at[h]!.above[li]!;
        if (a + b <= 0) { dead = true; break; } // that mod sits below v for certain: v is never lowest
        for (let r = 0; r < times; r++) {
          for (let t = deg + 1; t >= 1; t--) poly[t] = poly[t]! * b + poly[t - 1]! * a;
          poly[0] = poly[0] * b;
          deg++;
        }
      }
      if (dead) continue;
      let integral = 0;
      for (let t = 0; t <= deg; t++) integral += poly[t]! / (t + 1);
      out[k] = out[k]! + pk * integral;
    }
  }
  return out;
}

/**
 * What a Whittling Chaos removes from a state, branch by branch — the same branches `removeOutcomes`
 * builds (markovActions.ts), weighted by level instead of 1/total. `position[i]` is removing position i
 * (present or blocked, never both); a side's junk splits into an unflagged mod and the bone's flagged one.
 */
export interface RemovalOdds {
  readonly position: ReadonlyMap<number, number>;
  readonly junk: {
    readonly prefix: { readonly plain: number; readonly flagged: number };
    readonly suffix: { readonly plain: number; readonly flagged: number };
  };
}

/** What the level model is built from — all of it already in the action space's params. */
export interface WhittlingContext {
  readonly data: PatchData;
  readonly level: number;
  readonly pools: ItemBase['pools'];
  readonly list: readonly McTarget[];
  /** Each position's same-side family siblings (markovSiblings.ts): a roll of one lands it blocked. */
  readonly sameSide?: readonly (readonly Mod[])[];
  /**
   * The tier a forced mod lands at, for a position whose mods carry no roll weight — an Essence's level is
   * the one the action space buys (`cheapestEssenceLevel`). Absent, or undefined for a position: its
   * tiers at or above the one asked, evenly.
   */
  readonly forcedTier?: (i: number) => number | undefined;
}

/** (level, weight) of a mod's tiers from index `from` up to (not including) `to`, inside [0, item level]. */
function* tiersOf(mod: Mod, level: number, from: number, to: number = mod.tiers.length): Generator<readonly [number, number]> {
  for (let k = Math.max(0, from); k < Math.min(to, mod.tiers.length); k++) {
    const t = mod.tiers[k]!;
    if (t.ilvl <= level) yield [t.ilvl, t.weight];
  }
}

/**
 * A present position's level: its members' tiers at or above the one asked, by weight. A mod that carries
 * no roll weight (an Essence's, a Perfect Essence's) is forced rather than rolled, so it sits at the tier it
 * is forced at — or, with none named, evenly at any tier that satisfies it.
 *
 * Exported because the interchangeability test in markovSymmetry.ts must ask the same question: two
 * positions are swappable only if Whittling cannot tell them apart either.
 */
export function presentLevels(t: McTarget, level: number, forced?: number): LevelDist | undefined {
  const weighted = levelDistOf(t.mods.flatMap((m) => [...tiersOf(m.mod, level, m.minIndex)]));
  if (weighted) return weighted;
  if (forced !== undefined) {
    const tier = representative(t).tiers[forced];
    if (tier) return { levels: [tier.ilvl], probs: [1] };
  }
  return levelDistOf(t.mods.flatMap((m) => [...tiersOf(m.mod, level, m.minIndex)].map(([v]) => [v, 1] as const)))
    ?? levelDistOf(t.mods.map((m) => [m.mod.tiers[Math.min(m.minIndex, m.mod.tiers.length - 1)]?.ilvl ?? 0, 1] as const));
}

/**
 * A blocked position's level: one of its members below the tier asked, or one of its same-side siblings,
 * weighed as `addOutcomes` weighs a blocking roll (any − succ + the normal-pool siblings). A position only
 * a bone can block falls back on its carved siblings, then on its own tiers below the one asked, evenly.
 */
export function blockedLevels(t: McTarget, level: number, siblings: readonly Mod[] = []): LevelDist | undefined {
  const own = t.mods.flatMap((m) => [...tiersOf(m.mod, level, 0, m.minIndex)]);
  const sib = (src: (m: Mod) => boolean) => siblings.filter(src).flatMap((m) => [...tiersOf(m, level, 0)]);
  return levelDistOf([...own, ...sib((m) => m.source === 'normal')])
    ?? levelDistOf(sib((m) => m.source !== 'normal'))
    ?? levelDistOf(own.map(([v]) => [v, 1] as const))
    ?? levelDistOf(t.mods.map((m) => [m.mod.tiers[0]?.ilvl ?? 0, 1] as const));
}

/**
 * The level model for one solve: every class's distribution, built once, and `oddsOf(s)` for a state,
 * cached by state.
 *
 * `undefined` from `oddsOf` means there is nothing to choose between — no removable mod, or every
 * removable mod drawn from one distribution, where the omen is exactly a plain Chaos — and the caller
 * plays the plain removal, whose distribution is then bit-identical and folds into the plain Chaos.
 */
export function createWhittling(ctx: WhittlingContext): { oddsOf: (s: McState) => RemovalOdds | undefined } {
  const { data, level, pools, list } = ctx;
  const n = list.length;
  const present = list.map((t, i) => presentLevels(t, level, ctx.forcedTier?.(i)));
  const blocked = list.map((t, i) => blockedLevels(t, level, ctx.sameSide?.[i] ?? []));
  // Junk is a mod in no position's family: the same set `junkFamilyWeight` groups in markovActions.ts.
  const positionFamilies = occupiedFamilies((1 << n) - 1, 0, list);
  const junkOf = (ids: readonly string[]): LevelDist | undefined => levelDistOf(ids.flatMap((id) => {
    const mod = data.mods.get(id);
    if (!mod || familiesOf(mod).some((f) => positionFamilies.has(f))) return [];
    return [...tiersOf(mod, level, 0)];
  }));
  const junk = { prefix: junkOf(pools.normal.prefixes), suffix: junkOf(pools.normal.suffixes) };
  // The bone's flagged junk is read as a CARVED mod: the desecrated pool's junk, every one of which the
  // data puts at level 65 — so it is almost never the lowest. An untargeted bone can also place an ordinary
  // mod as its junk, which this does not see; reading it high is the reading that never flatters a plan
  // that wants the omen to take it.
  const carvedJunk = {
    prefix: junkOf(pools.desecrated.prefixes) ?? junk.prefix,
    suffix: junkOf(pools.desecrated.suffixes) ?? junk.suffix,
  };

  const cache = new Map<string, RemovalOdds | undefined>();
  const oddsOf = (s: McState): RemovalOdds | undefined => {
    const key = `${s.present}:${s.blocked}:${s.jp}:${s.js}:${s.flagged}`;
    if (cache.has(key)) return cache.get(key);
    const groups: LevelGroup[] = [];
    const slots: ({ kind: 'position'; i: number } | { kind: 'junk'; side: 'prefix' | 'suffix'; flagged: boolean })[] = [];
    // An object, so the closure's write is visible to the check below.
    const missing = { any: false };
    const add = (dist: LevelDist | undefined, count: number, slot: (typeof slots)[number]): void => {
      if (count <= 0) return;
      if (!dist) { missing.any = true; return; }
      groups.push({ dist, count });
      slots.push(slot);
    };
    for (let i = 0; i < n; i++) {
      if (has(s.present, i) && !list[i]!.fractured) add(present[i], 1, { kind: 'position', i });
      if (has(s.blocked, i)) add(blocked[i], 1, { kind: 'position', i });
    }
    for (const side of ['prefix', 'suffix'] as const) {
      const count = side === 'prefix' ? s.jp : s.js;
      const flagged = s.flagged === (side === 'prefix' ? FLAG_JUNK_PREFIX : FLAG_JUNK_SUFFIX) && count > 0;
      add(junk[side], count - (flagged ? 1 : 0), { kind: 'junk', side, flagged: false });
      if (flagged) add(carvedJunk[side], 1, { kind: 'junk', side, flagged: true });
    }
    // One distribution for everything removable (or nothing to remove, or a mod no level can be given):
    // the plain removal is the answer.
    const result = missing.any || groups.length === 0 || groups.every((g) => g.dist === groups[0]!.dist)
      ? undefined
      : (() => {
        const each = lowestOdds(groups);
        const position = new Map<number, number>();
        const junkOdds = { prefix: { plain: 0, flagged: 0 }, suffix: { plain: 0, flagged: 0 } };
        slots.forEach((slot, k) => {
          const p = each[k]! * groups[k]!.count;
          if (slot.kind === 'position') position.set(slot.i, p);
          else junkOdds[slot.side][slot.flagged ? 'flagged' : 'plain'] = p;
        });
        return { position, junk: junkOdds };
      })();
    cache.set(key, result);
    return result;
  };
  return { oddsOf };
}

/**
 * What the Whittling CEILING's Chaos removes, named by the player (`whittling: 'ceiling'`): one junk mod
 * of a side (the bone's flagged one, or another), or one position — blocked, or a present obstacle. Never
 * a present target. A measurement stand-in, so the replay declines it.
 */
export type WhittlingChoice =
  | { readonly junk: 'prefix' | 'suffix'; readonly flagged?: true }
  | { readonly position: number };

/**
 * The CEILING's choices from a state (TODO 12b, docs/validation.md 2026-11-13), each with the mid-state
 * its removal leaves — the flag cleared exactly where `removeOutcomes` clears it: removing the flagged
 * junk or a flagged position frees the item, removing another junk mod does not. The action space then
 * composes exactly a Chaos's add. The real omen removes by level with no choice and can take a target,
 * so no plan with it beats the best plan with these: what they save bounds what the omen could.
 */
export function ceilingChoices(
  s: McState, list: readonly McTarget[], encode: StateEncoder,
): { choice: WhittlingChoice; mid: StateKey }[] {
  const out: { choice: WhittlingChoice; mid: StateKey }[] = [];
  const flaggedIdx = flaggedTarget(s.flagged);
  const after = (i: number): FlagCode => (flaggedIdx === i ? FLAG_NONE : s.flagged);
  for (const side of ['prefix', 'suffix'] as const) {
    const count = side === 'prefix' ? s.jp : s.js;
    if (count <= 0) continue;
    const jp = side === 'prefix' ? s.jp - 1 : s.jp;
    const js = side === 'suffix' ? s.js - 1 : s.js;
    const flagged = s.flagged === flagJunkSide(side);
    if (flagged) out.push({ choice: { junk: side, flagged: true }, mid: encode(s.present, s.blocked, jp, js, FLAG_NONE, s.rarity) });
    if (!flagged || count > 1) out.push({ choice: { junk: side }, mid: encode(s.present, s.blocked, jp, js, s.flagged, s.rarity) });
  }
  for (let i = 0; i < list.length; i++) {
    if (has(s.blocked, i)) {
      out.push({ choice: { position: i }, mid: encode(s.present, s.blocked & ~bit(i), s.jp, s.js, after(i), s.rarity) });
    } else if (has(s.present, i) && list[i]!.obstacle && !list[i]!.fractured) {
      out.push({ choice: { position: i }, mid: encode(s.present & ~bit(i), s.blocked, s.jp, s.js, after(i), s.rarity) });
    }
  }
  return out;
}
