import { describe, it, expect } from 'vitest';
import type { Mod } from '../../engine/src/types.ts';
import { startCandidates } from './markovStarts.ts';
import type { McRarity, McTarget, StateEncoder, StateKey } from './markovState.ts';
import { bit, decodeState, encodeState, flagTarget } from './markovState.ts';

// Hand-built positions: the readout only looks at each one's side, source and ids, so nothing here
// needs a pool or a price.
const pos = (id: string, type: 'prefix' | 'suffix', source: Mod['source'] = 'normal'): McTarget => ({
  mods: [{ mod: { id, source, type, family: `F_${id}`, tags: [], text: id, tiers: [] }, minIndex: 0 }],
  type, fractured: false,
});
const read = (
  list: readonly McTarget[], slotMasks: readonly number[],
  opts: { rarities?: readonly McRarity[]; encode?: StateEncoder; valueAt?: (k: StateKey) => number | undefined } = {},
) => startCandidates({
  list, slotMasks, rarities: opts.rarities ?? ['rare'], encode: opts.encode ?? encodeState,
  valueAt: opts.valueAt ?? ((k) => decodeState(k).present), // a distinct finite cost per mask
});
const names = (rows: ReturnType<typeof read>) => rows.map((r) => r.present.map((ids) => ids.join('|')).join('+'));

describe('startCandidates — which cell a set of starting mods is read from', () => {
  it('prices the empty Rare and every set of one mod per slot', () => {
    const rows = read([pos('A', 'prefix'), pos('B', 'suffix')], [bit(0), bit(1)]);
    expect(names(rows)).toEqual(['', 'A', 'B', 'A+B']);
    expect(rows.every((r) => r.rarity === 'rare')).toBe(true);
  });

  /**
   * A slot of alternatives is ONE modifier on the finished item, so a set holding two of its members
   * fills that slot once. It is not the two-mod step toward the target its size suggests.
   */
  it('never lists two members of one slot, and counts slots rather than mods', () => {
    const rows = read([pos('A', 'prefix'), pos('B', 'prefix'), pos('C', 'suffix')], [bit(0) | bit(1), bit(2)]);
    expect(names(rows)).toEqual(['', 'A', 'B', 'C', 'A+C', 'B+C']);
    expect(Math.max(...rows.map((r) => r.present.length))).toBe(2);
  });

  /**
   * "Fire + Cold" and "Fire + Lightning" are one situation when the encoder says so — they cost the
   * same by construction — so they are one row, naming both.
   */
  it('lists interchangeable spellings once, as one slot naming both', () => {
    // An encoder that files B as A, the way `encoderFor` files Lightning as Cold.
    const encode: StateEncoder = (p, b, jp, js, f, r) =>
      encodeState((p & bit(1)) !== 0 ? (p & ~bit(1)) | bit(0) : p, b, jp, js, f, r);
    const rows = read([pos('A', 'prefix'), pos('B', 'prefix'), pos('C', 'suffix')], [bit(0) | bit(1), bit(2)], { encode });
    expect(names(rows)).toEqual(['', 'A|B', 'C', 'A|B+C']);
  });

  /**
   * Below Rare only Transmutation, Augmentation and Regal add a modifier, and none of them places a
   * desecrated or essence one. So a Magic row may only hold what an orb can roll — the Rare rung is
   * where the others appear.
   */
  it('keeps Magic rows to modifiers an orb can roll', () => {
    const list = [pos('N', 'prefix'), pos('E', 'suffix', 'essence'), pos('D', 'suffix', 'desecrated')];
    const rows = read(list, [bit(0), bit(1), bit(2)], { rarities: ['magic', 'rare'] });
    expect(names(rows.filter((r) => r.rarity === 'magic'))).toEqual(['N']);
    expect(names(rows.filter((r) => r.rarity === 'rare'))).toContain('E');
    expect(names(rows.filter((r) => r.rarity === 'rare'))).toContain('D');
  });

  it('never offers an empty Magic item', () => {
    const rows = read([pos('A', 'prefix')], [bit(0)], { rarities: ['magic', 'rare'] });
    expect(rows.filter((r) => r.rarity === 'magic').map((r) => r.present.length)).toEqual([1]);
  });

  /**
   * A desecrated-pool mod only ever arrives by Desecration, which marks what it placed — so an item
   * carrying one carries the mark, and cannot be desecrated again until it comes off. The unmarked cell
   * is in the lattice, unreachable, and its value would let the policy use a bone it could not use.
   */
  it('reads a desecrated-pool target at its own flag cell', () => {
    const seen: StateKey[] = [];
    read([pos('D', 'prefix', 'desecrated'), pos('N', 'suffix')], [bit(0), bit(1)], {
      valueAt: (k) => { seen.push(k); return 1; },
    });
    const withD = seen.filter((k) => (decodeState(k).present & bit(0)) !== 0);
    expect(withD.length).toBeGreaterThan(0);
    for (const k of withD) expect(decodeState(k).flagged, k).toBe(flagTarget(0));
    // …and a set without it is read unmarked.
    expect(seen.filter((k) => decodeState(k).present === bit(1)).map((k) => decodeState(k).flagged)).toEqual([0]);
  });

  it('skips an item carrying two desecrated-pool targets, which the game does not allow', () => {
    const rows = read([pos('D1', 'prefix', 'desecrated'), pos('D2', 'suffix', 'desecrated')], [bit(0), bit(1)]);
    expect(names(rows)).toEqual(['', 'D1', 'D2']);
  });

  it('skips a cell the lattice does not have, and one no route reaches', () => {
    const rows = read([pos('A', 'prefix'), pos('B', 'suffix')], [bit(0), bit(1)], {
      valueAt: (k) => {
        const p = decodeState(k).present;
        return p === bit(0) ? undefined : p === bit(1) ? Infinity : 1;
      },
    });
    expect(names(rows)).toEqual(['', 'A+B']);
  });

  it('orders by size, then by cost', () => {
    const cost: Record<number, number> = { 0: 9, 1: 5, 2: 3, 3: 1 };
    const rows = read([pos('A', 'prefix'), pos('B', 'suffix')], [bit(0), bit(1)], {
      valueAt: (k) => cost[decodeState(k).present],
    });
    expect(names(rows)).toEqual(['', 'B', 'A', 'A+B']);
  });
});
