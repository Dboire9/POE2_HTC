// Another solve's plan, read in this solve's states — the seed a solve with bones takes from the same
// craft solved without them (TODO 20, `MarkovOptions.seedFrom`).
//
// The two lattices differ in two ways. The flag axis: a state whose flag marks a Desecration's mod has
// no counterpart, since nothing without bones can put one there. And the positions: siblings from the
// carved pool exist only where bones do, and the order may differ — so positions are matched on the mod
// ids they hold, and a state with one of the extra positions filled has no counterpart either. Every
// other state reads the other plan's move at the same present / blocked / junk / rarity.

import type { McAction } from './markovActions.ts';
import type { RouteTable } from './markovRoute.ts';
import type { StateKey } from './markovState.ts';
import { FLAG_NONE, bit, decodeState, encodeState, has } from './markovState.ts';

/** For each of this solve's states (by index into `keys`), the move `seed` plays there — or undefined. */
export function projectPlan(
  seed: RouteTable, positions: readonly (readonly string[])[], keys: readonly StateKey[],
): (i: number) => McAction | undefined {
  const at = new Map<StateKey, number>(seed.keys.map((k, j) => [k, j]));
  const name = (ids: readonly string[]): string => [...ids].sort().join(',');
  const theirs = new Map(seed.positions.map((ids, j) => [name(ids), j]));
  const to = positions.map((ids) => theirs.get(name(ids)) ?? -1);
  const remap = (mask: number): number | undefined => {
    let m = 0;
    for (let p = 0; p < to.length; p++) {
      if (!has(mask, p)) continue;
      if (to[p]! < 0) return undefined;
      m |= bit(to[p]!);
    }
    return m;
  };
  return (i) => {
    const s = decodeState(keys[i]!);
    if (s.flagged !== FLAG_NONE) return undefined;
    const present = remap(s.present);
    const blocked = remap(s.blocked);
    if (present === undefined || blocked === undefined) return undefined;
    const j = at.get(encodeState(present, blocked, s.jp, s.js, FLAG_NONE, s.rarity));
    const a = j === undefined ? -1 : seed.act[j]!;
    return a < 0 ? undefined : seed.actions[a];
  };
}
