// The from-item MDP's STATE ABSTRACTION — what a crafting state is, how it's keyed, and how a real
// item maps onto one. Split out of markovFromItem.ts so the solver there reads as orchestration.
//
// We track, per target mod, one of {absent, present, blocked}, plus how much foreign junk sits on each
// side: (which targets are PRESENT at ≥ their tier, which are BLOCKED, #junk prefixes, #junk suffixes).
// A target is BLOCKED when its family is occupied by a roll that ISN'T the target at its wanted tier —
// the mod rolled below its required tier, so the family is taken but the goal isn't met and you must
// annul the off-tier roll before re-adding. Junk (jp/js) is only ever weight in NON-target families, so
// it can never block a target — the blocked bits carry all the family collisions that matter. That
// collapses the space to 3^|target| × slots: a few thousand states, small enough to enumerate whole.

import type { ItemState, Mod, PatchData } from '../../engine/src/types.ts';
import { familiesOf } from '../../engine/src/pool.ts';

/** Max prefixes (and suffixes) a Rare item can hold. */
export const MAX_PER_SIDE = 3;

/**
 * The item's rarity, which the state has to carry once a craft can START below Rare.
 *
 * It was absent while the MDP only ever modelled an item you already hold (always Rare). A from-white
 * craft begins Normal and climbs — transmute to Magic, augment within Magic, regal to Rare — and those
 * transitions are one-way, so without this axis a 2-mod Magic item and a 2-mod Rare item are the same
 * state despite one of them being unable to take an Exalt at all.
 */
export type McRarity = 'normal' | 'magic' | 'rare';

const RARITY_CODE: Record<McRarity, number> = { normal: 0, magic: 1, rare: 2 };
const RARITY_BY_CODE: readonly McRarity[] = ['normal', 'magic', 'rare'];

/** How many mods a side can hold at each rarity: Normal none, Magic one, Rare three. */
export const perSideCap = (r: McRarity): number => (r === 'rare' ? MAX_PER_SIDE : r === 'magic' ? 1 : 0);

/** A target mod resolved for the MDP: its side, family, the mod (for per-floor weights), and lock state. */
export interface McTarget {
  readonly modId: string;
  readonly type: 'prefix' | 'suffix';
  readonly family: string;
  readonly mod: Mod;
  /** Worst acceptable tier index (engine indexing: higher index = better/higher-ilvl). */
  readonly minIndex: number;
  readonly fractured: boolean;
}

// ── Bit helpers (the present/blocked masks index into the resolved target list) ─────────────────

export const bit = (i: number): number => 1 << i;
export const has = (mask: number, i: number): boolean => (mask & bit(i)) !== 0;
export const popcount = (m: number): number => { let c = 0; for (let x = m; x; x >>= 1) c += x & 1; return c; };

// ── State keys ──────────────────────────────────────────────────────────────────────────────────

/**
 * WHICH mod on the item a Desecration placed, if any.
 *
 * The flag belongs to the MOD, not to the pool it came from: a bone marks whatever it applied, and an
 * ordinary mod it placed is flagged exactly as a desecrated-pool one is. That single fact is the whole
 * mechanic — an item may carry one flagged mod, a bone needs an item with none, and removing or
 * rerolling the flagged mod frees the item to be desecrated again.
 *
 * This axis replaced a narrower `desJunk: 'none' | 'prefix' | 'suffix'`, which could only describe an
 * unwanted DESECRATED-POOL mod and read a flagged target out of the present/blocked masks by checking
 * `mod.source`. That could not represent the common case at all — a bone that placed an ordinary mod —
 * and the source check was wrong besides, since the pool a mod came from stops mattering the moment it
 * is on the item.
 *
 * Junk needs only its side, because junk mods are interchangeable; a target needs its index, because
 * removing target *i* leads somewhere different from removing target *j*. Codes 0/1/2 are unchanged
 * from the old axis so the key format keeps its shape.
 */
export type FlagCode = number;

export const FLAG_NONE: FlagCode = 0;
export const FLAG_JUNK_PREFIX: FlagCode = 1;
export const FLAG_JUNK_SUFFIX: FlagCode = 2;
/** A flagged TARGET is `FLAG_TARGET + its index`, so the axis is 3 + n wide at its very widest. */
export const FLAG_TARGET: FlagCode = 3;

export const flagTarget = (i: number): FlagCode => FLAG_TARGET + i;
/** The flagged target's index, or -1 when the flag is absent or sits on junk. */
export const flaggedTarget = (f: FlagCode): number => (f >= FLAG_TARGET ? f - FLAG_TARGET : -1);
export const flagJunkSide = (side: 'prefix' | 'suffix'): FlagCode =>
  (side === 'prefix' ? FLAG_JUNK_PREFIX : FLAG_JUNK_SUFFIX);

/** Nominal type for state keys: a string encoding (present:blocked:jp:js:flagged:rarity). */
export type StateKey = string & { readonly __brand: 'StateKey' };

export interface McState {
  readonly present: number;
  readonly blocked: number;
  /** Junk prefixes, INCLUDING a flagged one — the flag marks a junk mod, it does not add a slot. */
  readonly jp: number;
  readonly js: number;
  readonly flagged: FlagCode;
  readonly rarity: McRarity;
}

// Rarity is the LAST field and defaults to 'rare', so every existing call site keeps its meaning —
// the from-item craft this model was built for is Rare throughout.
export const encodeState = (
  present: number, blocked: number, jp: number, js: number, flagged: FlagCode = FLAG_NONE,
  rarity: McRarity = 'rare',
): StateKey =>
  `${present}:${blocked}:${jp}:${js}:${flagged}:${RARITY_CODE[rarity]}` as StateKey;

export const decodeState = (k: StateKey): McState => {
  const [present, blocked, jp, js, flagged, rar] = k.split(':').map(Number) as number[];
  return {
    present: present!, blocked: blocked!, jp: jp!, js: js!,
    flagged: flagged!, rarity: RARITY_BY_CODE[rar!]!,
  };
};

/** Distribution over next states, keyed by state key. Probabilities sum to 1 (or the map is empty). */
export type Dist = Map<StateKey, number>;

export function addTo(d: Dist, k: StateKey, p: number): void { d.set(k, (d.get(k) ?? 0) + p); }

// ── Slot accounting ─────────────────────────────────────────────────────────────────────────────

/** How many of `sideIdx`'s targets are set in `mask`. */
export const countSide = (mask: number, sideIdx: readonly number[]): number =>
  sideIdx.filter((i) => has(mask, i)).length;

/** Which side each target sits on, as index lists into the target array (built once per solve). */
export interface SideIndex {
  readonly prefix: readonly number[];
  readonly suffix: readonly number[];
}

export function sideIndexOf(list: readonly McTarget[]): SideIndex {
  return {
    prefix: list.map((t, i) => (t.type === 'prefix' ? i : -1)).filter((i) => i >= 0),
    suffix: list.map((t, i) => (t.type === 'suffix' ? i : -1)).filter((i) => i >= 0),
  };
}

/**
 * Prefix slots in use: targets present or blocked on that side, plus its junk.
 *
 * No separate term for the flagged mod any more. It used to need one, because `desJunk` described a
 * desecrated-pool mod held OUTSIDE the jp/js counters; now the flag simply marks one of the mods
 * already counted here, so counting it again would have the item hold a phantom extra affix.
 */
export const prefUsed = (s: McState, side: SideIndex): number =>
  countSide(s.present, side.prefix) + countSide(s.blocked, side.prefix) + s.jp;

export const sufUsed = (s: McState, side: SideIndex): number =>
  countSide(s.present, side.suffix) + countSide(s.blocked, side.suffix) + s.js;

/** Target families occupied (present OR blocked) — excluded from the add denominator (family exclusion). */
export function occupiedFamilies(present: number, blocked: number, list: readonly McTarget[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    if (has(present, i) || has(blocked, i)) for (const f of familiesOf(list[i]!.mod)) s.add(f);
  }
  return s;
}

/**
 * Every legal state of the lattice. A target is present XOR blocked (never both), and neither side can
 * hold more than MAX_PER_SIDE mods counting targets and junk together.
 *
 * `desecratable` gates the flag axis: when no desecration is in play it collapses to FLAG_NONE alone,
 * so a craft that never touches desecration keeps exactly the state space (and the solve time) it had
 * before desecration was modelled at all.
 *
 * The flag is only ever emitted where it could actually sit — junk sides that hold junk, targets that
 * are on the item. That pruning is what keeps the axis near 3x rather than the 3 + n its width
 * suggests: most states have only a handful of mods for a bone to have marked.
 */
export function enumerateStates(
  n: number, side: SideIndex, desecratable = false,
  /**
   * Which rarities the craft can occupy. Defaults to Rare alone, which is every from-item craft and
   * keeps that state space (and its solve time) exactly as it was. A from-white craft passes all
   * three: it starts Normal with nothing on it and climbs.
   */
  rarities: readonly McRarity[] = ['rare'],
  /**
   * Sets of targets that share a family, as bitmasks — at most one of each set can ever be on the item.
   *
   * Empty for every craft that predates slot alternatives, because two targets sharing a family were
   * rejected outright. A slot whose alternatives are siblings (`#% increased Fire / Cold / Lightning
   * Damage` are one family, `WeaponDamageTypePrefix`) makes them the ordinary case, and without this
   * the lattice carries a state for every combination the item could never hold: 3^3 = 27 arrangements
   * of a three-way sibling slot where only 7 are real. Those states are unreachable and would be
   * pruned later by `prob1` — but not before `actionsOf`, the dominant cost of the whole solve, had
   * been paid on every one of them.
   *
   * Sound only because family exclusion is enforced in the ACTION space too (`excluded` in pool.ts),
   * so nothing can transition into what is removed here. `markovFromItem` asserts that closure when it
   * compiles outcomes to indices.
   */
  conflicts: readonly number[] = [],
): StateKey[] {
  const out: StateKey[] = [];
  for (const rarity of rarities) {
    const cap = perSideCap(rarity);
    for (let present = 0; present < bit(n); present++) {
      for (let blocked = 0; blocked < bit(n); blocked++) {
        if ((present & blocked) !== 0) continue;
        // Two mods of one family cannot sit on an item together, whether either is at its tier
        // (`present`) or below it (`blocked`) — a below-tier roll occupies the family just as firmly.
        if (conflicts.length > 0) {
          const held = present | blocked;
          let clash = false;
          for (const m of conflicts) if (popcount(held & m) > 1) { clash = true; break; }
          if (clash) continue;
        }
        const tp = countSide(present, side.prefix) + countSide(blocked, side.prefix);
        const ts = countSide(present, side.suffix) + countSide(blocked, side.suffix);
        if (tp > cap || ts > cap) continue;
        // Every target on the item is somewhere a bone could have left its mark.
        const onItem = present | blocked;
        for (let jp = 0; jp + tp <= cap; jp++) {
          for (let js = 0; js + ts <= cap; js++) {
            const flags: FlagCode[] = [FLAG_NONE];
            if (desecratable) {
              if (jp > 0) flags.push(FLAG_JUNK_PREFIX);
              if (js > 0) flags.push(FLAG_JUNK_SUFFIX);
              for (let i = 0; i < n; i++) if (has(onItem, i)) flags.push(flagTarget(i));
            }
            for (const flagged of flags) out.push(encodeState(present, blocked, jp, js, flagged, rarity));
          }
        }
      }
    }
  }
  return out;
}

/**
 * The MDP's ACCEPTING CONDITION: every slot filled, and nothing else on the item.
 *
 * This replaced a precomputed set of literal goal keys built from `present === (1<<n)-1`. That form
 * could only express a CONJUNCTION — every named mod, all at once — which is exactly the assumption
 * slot alternatives break: with `slot 3 = {Cold, Lightning, Chaos}` the finished item never holds all
 * three, and under the old goal it held none of them either, because the state demanding all three at
 * once has four prefixes and `enumerateStates` (rightly) never emits it. The solve then reported the
 * goal unreachable.
 *
 * `blocked`, `jp` and `js` must all be zero, unchanged from before: the finished item is exactly what
 * was asked for, with no off-tier roll to annul and no junk riding along. Two members of one slot both
 * being present is fine and accepted — you wanted either, you got both — though on a target that fills
 * all six slots the side cap makes it unreachable anyway.
 *
 * With every slot a singleton this is precisely the old goal set, which `markovFromItem` asserts.
 */
export function isAccepting(s: McState, slotMasks: readonly number[]): boolean {
  if (s.blocked !== 0 || s.jp !== 0 || s.js !== 0 || s.rarity !== 'rare') return false;
  for (const m of slotMasks) if ((s.present & m) === 0) return false;
  return true;
}

/** How many slots this state has filled — the goal-progress count `distanceToGoal` works down from. */
export function slotsFilled(present: number, slotMasks: readonly number[]): number {
  let c = 0;
  for (const m of slotMasks) if ((present & m) !== 0) c++;
  return c;
}

/**
 * Does this state already carry a desecration-placed mod? An item holds at most one, so this is the
 * gate on desecrating again.
 *
 * One field read now. It used to also scan the masks for a target whose POOL was desecrated, which was
 * wrong twice over: it missed a bone that placed an ordinary mod (the common case, and the one that
 * actually blocks you), and it flagged a desecrated-pool target that a bone had not placed.
 */
export function hasDesecrated(s: McState): boolean {
  return s.flagged !== FLAG_NONE;
}

/**
 * Classify the START item's mods into (present, blocked, junk) plus which of them a Desecration
 * placed: a target at ≥ its wanted tier is present; the same target at too low a tier is blocked (its
 * family is taken, goal unmet); a mod that matches no target is junk on its side.
 *
 * The flag comes from `PlacedMod.desecrated`, which the caller sets — a bone-placed ORDINARY mod is
 * indistinguishable from an exalted one by inspection, so the app has to be told. A desecrated-POOL
 * mod is taken as flagged whether or not it was marked, since a Desecration is the only way one gets
 * onto an item. An item may carry at most one; a second is treated as ordinary rather than rejected,
 * because refusing to plan is a worse answer than planning the achievable part.
 */
export function classifyStart(
  data: PatchData, item: ItemState, list: readonly McTarget[], idxOf: ReadonlyMap<string, number>,
): McState {
  let present = 0;
  let blocked = 0;
  let jp = 0;
  let js = 0;
  let flagged: FlagCode = FLAG_NONE;
  const place = (arr: ItemState['prefixes'], side: 'prefix' | 'suffix'): void => {
    for (const p of arr) {
      const fromDesecration = p.desecrated === true || data.mods.get(p.modId)?.source === 'desecrated';
      const i = idxOf.get(p.modId);
      if (i === undefined) {
        if (side === 'prefix') jp++;
        else js++;
        if (fromDesecration && flagged === FLAG_NONE) flagged = flagJunkSide(side);
        continue;
      }
      const t = list[i]!;
      const tierIdx = t.mod.tiers.findIndex((tt) => tt.name === p.tierName);
      // At or above the wanted tier (or an unrecognised tier — assume fine) ⇒ present; below ⇒ blocked.
      if (tierIdx < 0 || tierIdx >= t.minIndex) present |= bit(i);
      else blocked |= bit(i);
      if (fromDesecration && flagged === FLAG_NONE) flagged = flagTarget(i);
    }
  };
  place(item.prefixes, 'prefix');
  place(item.suffixes, 'suffix');
  return { present, blocked, jp, js, flagged, rarity: item.rarity };
}
