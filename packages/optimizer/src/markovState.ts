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

import type { ItemState, Mod } from '../../engine/src/types.ts';

/** Max prefixes (and suffixes) a Rare item can hold. */
export const MAX_PER_SIDE = 3;

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

/** Nominal type for state keys: a string encoding (present:blocked:jp:js). */
export type StateKey = string & { readonly __brand: 'StateKey' };

export const encodeState = (present: number, blocked: number, jp: number, js: number): StateKey =>
  `${present}:${blocked}:${jp}:${js}` as StateKey;

export const decodeState = (k: StateKey): { present: number; blocked: number; jp: number; js: number } => {
  const [present, blocked, jp, js] = k.split(':').map(Number) as [number, number, number, number];
  return { present, blocked, jp, js };
};

/** Distribution over next states, keyed by state key. Probabilities sum to 1 (or the map is empty). */
export type Dist = Map<StateKey, number>;

export function addTo(d: Dist, k: StateKey, p: number): void { d.set(k, (d.get(k) ?? 0) + p); }

/** Σ p·V over every outcome EXCEPT the self-loop back to `selfKey` (which the caller divides out). */
export function sumOther(dist: Dist, selfKey: StateKey, V: ReadonlyMap<StateKey, number>): number {
  let s = 0;
  for (const [to, p] of dist) if (to !== selfKey) s += p * (V.get(to) ?? Infinity);
  return s;
}

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

/** Prefix slots in use: targets present or blocked on that side, plus its junk. */
export const prefUsed = (present: number, blocked: number, jp: number, side: SideIndex): number =>
  countSide(present, side.prefix) + countSide(blocked, side.prefix) + jp;

export const sufUsed = (present: number, blocked: number, js: number, side: SideIndex): number =>
  countSide(present, side.suffix) + countSide(blocked, side.suffix) + js;

/** Target families occupied (present OR blocked) — excluded from the add denominator (family exclusion). */
export function occupiedFamilies(present: number, blocked: number, list: readonly McTarget[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < list.length; i++) if (has(present, i) || has(blocked, i)) s.add(list[i]!.family);
  return s;
}

/**
 * Every legal state of the lattice. A target is present XOR blocked (never both), and neither side can
 * hold more than MAX_PER_SIDE mods counting targets and junk together.
 */
export function enumerateStates(n: number, side: SideIndex): StateKey[] {
  const out: StateKey[] = [];
  for (let present = 0; present < bit(n); present++) {
    for (let blocked = 0; blocked < bit(n); blocked++) {
      if ((present & blocked) !== 0) continue;
      const tp = countSide(present, side.prefix) + countSide(blocked, side.prefix);
      const ts = countSide(present, side.suffix) + countSide(blocked, side.suffix);
      if (tp > MAX_PER_SIDE || ts > MAX_PER_SIDE) continue;
      for (let jp = 0; jp + tp <= MAX_PER_SIDE; jp++) {
        for (let js = 0; js + ts <= MAX_PER_SIDE; js++) out.push(encodeState(present, blocked, jp, js));
      }
    }
  }
  return out;
}

/**
 * Classify the START item's mods into (present, blocked, junk): a target at ≥ its wanted tier is
 * present; the same target at too low a tier is blocked (its family is taken, goal unmet); a mod that
 * matches no target is junk on its side.
 */
export function classifyStart(
  item: ItemState, list: readonly McTarget[], idxOf: ReadonlyMap<string, number>,
): { present: number; blocked: number; jp: number; js: number } {
  let present = 0;
  let blocked = 0;
  let jp = 0;
  let js = 0;
  const place = (arr: ItemState['prefixes'], side: 'prefix' | 'suffix'): void => {
    for (const p of arr) {
      const i = idxOf.get(p.modId);
      if (i === undefined) { if (side === 'prefix') jp++; else js++; continue; }
      const t = list[i]!;
      const tierIdx = t.mod.tiers.findIndex((tt) => tt.name === p.tierName);
      // At or above the wanted tier (or an unrecognised tier — assume fine) ⇒ present; below ⇒ blocked.
      if (tierIdx < 0 || tierIdx >= t.minIndex) present |= bit(i);
      else blocked |= bit(i);
    }
  };
  place(item.prefixes, 'prefix');
  place(item.suffixes, 'suffix');
  return { present, blocked, jp, js };
}
