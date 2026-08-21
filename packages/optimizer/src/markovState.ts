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
 * Where the item's one desecrated JUNK mod sits, if it has one. An item may carry at most one
 * desecrated mod at a time; when that mod is a target it's already recorded in the present/blocked
 * masks, so this axis only has to remember the case where the desecration landed something unwanted.
 */
export type DesJunk = 'none' | 'prefix' | 'suffix';

const DES_JUNK_CODE: Record<DesJunk, number> = { none: 0, prefix: 1, suffix: 2 };
const DES_JUNK_BY_CODE: readonly DesJunk[] = ['none', 'prefix', 'suffix'];

/** Nominal type for state keys: a string encoding (present:blocked:jp:js:desJunk). */
export type StateKey = string & { readonly __brand: 'StateKey' };

export interface McState {
  readonly present: number;
  readonly blocked: number;
  readonly jp: number;
  readonly js: number;
  readonly desJunk: DesJunk;
}

export const encodeState = (
  present: number, blocked: number, jp: number, js: number, desJunk: DesJunk = 'none',
): StateKey => `${present}:${blocked}:${jp}:${js}:${DES_JUNK_CODE[desJunk]}` as StateKey;

export const decodeState = (k: StateKey): McState => {
  const [present, blocked, jp, js, des] = k.split(':').map(Number) as [number, number, number, number, number];
  return { present, blocked, jp, js, desJunk: DES_JUNK_BY_CODE[des]! };
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

/** Prefix slots in use: targets present or blocked on that side, its junk, and any desecrated junk. */
export const prefUsed = (s: McState, side: SideIndex): number =>
  countSide(s.present, side.prefix) + countSide(s.blocked, side.prefix) + s.jp + (s.desJunk === 'prefix' ? 1 : 0);

export const sufUsed = (s: McState, side: SideIndex): number =>
  countSide(s.present, side.suffix) + countSide(s.blocked, side.suffix) + s.js + (s.desJunk === 'suffix' ? 1 : 0);

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
 * hold more than MAX_PER_SIDE mods counting targets, junk, and any desecrated junk together.
 *
 * `desecratable` gates the desJunk axis: when no desecration is in play the axis collapses to the
 * single 'none' value, so a craft that never touches desecration keeps exactly the state space (and
 * the solve time) it had before desecration was modelled at all.
 */
export function enumerateStates(n: number, side: SideIndex, desecratable = false): StateKey[] {
  const desJunkValues: DesJunk[] = desecratable ? ['none', 'prefix', 'suffix'] : ['none'];
  const out: StateKey[] = [];
  for (let present = 0; present < bit(n); present++) {
    for (let blocked = 0; blocked < bit(n); blocked++) {
      if ((present & blocked) !== 0) continue;
      const tp = countSide(present, side.prefix) + countSide(blocked, side.prefix);
      const ts = countSide(present, side.suffix) + countSide(blocked, side.suffix);
      if (tp > MAX_PER_SIDE || ts > MAX_PER_SIDE) continue;
      for (const desJunk of desJunkValues) {
        const dp = desJunk === 'prefix' ? 1 : 0;
        const ds = desJunk === 'suffix' ? 1 : 0;
        if (tp + dp > MAX_PER_SIDE || ts + ds > MAX_PER_SIDE) continue;
        for (let jp = 0; jp + tp + dp <= MAX_PER_SIDE; jp++) {
          for (let js = 0; js + ts + ds <= MAX_PER_SIDE; js++) {
            out.push(encodeState(present, blocked, jp, js, desJunk));
          }
        }
      }
    }
  }
  return out;
}

/**
 * Does this state already carry a desecrated mod? An item holds at most one, so this is the gate on
 * desecrating again. It's true either because the desecration landed junk, or because a DESECRATED
 * TARGET is on the item (present or blocked) — those are tracked in the masks, not the desJunk axis.
 */
export function hasDesecrated(s: McState, list: readonly McTarget[]): boolean {
  if (s.desJunk !== 'none') return true;
  for (let i = 0; i < list.length; i++) {
    if (list[i]!.mod.source === 'desecrated' && (has(s.present, i) || has(s.blocked, i))) return true;
  }
  return false;
}

/**
 * Classify the START item's mods into (present, blocked, junk): a target at ≥ its wanted tier is
 * present; the same target at too low a tier is blocked (its family is taken, goal unmet); a mod that
 * matches no target is junk on its side — and an unwanted DESECRATED mod is junk that also occupies
 * the item's single desecrated slot, so it lands on the desJunk axis instead of the jp/js counters.
 */
export function classifyStart(
  data: PatchData, item: ItemState, list: readonly McTarget[], idxOf: ReadonlyMap<string, number>,
): McState {
  let present = 0;
  let blocked = 0;
  let jp = 0;
  let js = 0;
  let desJunk: DesJunk = 'none';
  const place = (arr: ItemState['prefixes'], side: 'prefix' | 'suffix'): void => {
    for (const p of arr) {
      const i = idxOf.get(p.modId);
      if (i === undefined) {
        // Not a target. A desecrated one claims the desecrated slot; anything else is ordinary junk.
        const isDes = data.mods.get(p.modId)?.source === 'desecrated';
        if (isDes && desJunk === 'none') desJunk = side;
        else if (side === 'prefix') jp++;
        else js++;
        continue;
      }
      const t = list[i]!;
      const tierIdx = t.mod.tiers.findIndex((tt) => tt.name === p.tierName);
      // At or above the wanted tier (or an unrecognised tier — assume fine) ⇒ present; below ⇒ blocked.
      if (tierIdx < 0 || tierIdx >= t.minIndex) present |= bit(i);
      else blocked |= bit(i);
    }
  };
  place(item.prefixes, 'prefix');
  place(item.suffixes, 'suffix');
  return { present, blocked, jp, js, desJunk };
}
