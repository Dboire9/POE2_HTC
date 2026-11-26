// A rule's tests read fast, for the prefill's shortening (markovMethodPrefill.ts), which asks "does this
// rule hold here?" tens of millions of times on a big craft (2026-11-26).
//
// What a test reads of a state (`holds`, markovMethod.ts) is packed into two integers per state, once:
//   A — the rarity, the Desecration's mark, and each slot's reading (2 bits each);
//   B — the junk prefixes, suffixes and their total, and the open prefixes and suffixes.
// A rule's tests compile to a mask and a value on each (every "=" test), plus the "≥ n" / "≤ n" counts
// checked one by one. Same answers as `holds`; a craft whose readings do not fit (more slots, or counts,
// than the fields hold) reads through `holds` itself.

import type { Condition, MethodFrame, MethodPlayer } from './markovMethod.ts';
import { boneOf, holds, junkOf, slotIs } from './markovMethod.ts';
import { perSideCap, prefUsed, sufUsed } from './markovState.ts';

/** Reads a list of tests at a state of the craft, by index. */
export type RuleReader = (when: readonly Condition[], i: number) => boolean;

const RARITY = { normal: 0, magic: 1, rare: 2 } as const;
const BONE = { none: 0, junk: 1, wanted: 2 } as const;
const SLOT = { present: 1, missing: 2, blocked: 3 } as const;
/** Slots that fit in A beside the rarity and the mark. */
const MAX_SLOTS = 14;
/** B's fields: shift and width. */
const FIELD = { jp: [0, 4], js: [4, 4], total: [8, 5], op: [13, 4], os: [17, 4] } as const;
type Field = keyof typeof FIELD;

interface Compiled {
  readonly never: boolean;
  readonly am: number; readonly av: number;
  readonly bm: number; readonly bv: number;
  /** "≥ n" / "≤ n" counts: field, then n, then +1 for ≥ or −1 for ≤. */
  readonly ranges: readonly (readonly [Field, number, 1 | -1])[];
}

const fieldOf = (c: Extract<Condition, { kind: 'junk' | 'open' }>): Field =>
  (c.kind === 'junk' ? (c.side === 'prefix' ? 'jp' : c.side === 'suffix' ? 'js' : 'total') : c.side === 'prefix' ? 'op' : 'os');
const get = (b: number, f: Field): number => (b >>> FIELD[f][0]) & ((1 << FIELD[f][1]) - 1);

/** A reader over `pl`'s craft. */
export function ruleReader(pl: MethodPlayer): RuleReader {
  const { N } = pl.craft.lattice;
  const f: MethodFrame = pl.frame;
  const plain: RuleReader = (when, i) => { const st = pl.state(i); return when.every((c) => holds(c, st, f)); };
  if (f.slotMasks.length > MAX_SLOTS) return plain;
  const canOpen = f.side !== undefined && f.limits !== undefined;

  const A = new Int32Array(N);
  const B = new Int32Array(N);
  const done = new Uint8Array(N);
  let fits = true;
  const pack = (i: number): void => {
    const st = pl.state(i);
    let a = RARITY[st.rarity] | (BONE[boneOf(st, f.obstacles)] << 2);
    f.slotMasks.forEach((m, s) => { a |= SLOT[slotIs(st, m)] << (4 + 2 * s); });
    const j = junkOf(st, f.obstacles);
    const op = canOpen ? perSideCap(st.rarity, f.limits.prefixes) - prefUsed(st, f.side) : 0;
    const os = canOpen ? perSideCap(st.rarity, f.limits.suffixes) - sufUsed(st, f.side) : 0;
    const vals: Record<Field, number> = { jp: j.prefix, js: j.suffix, total: j.prefix + j.suffix, op, os };
    let b = 0;
    for (const k of Object.keys(FIELD) as Field[]) {
      const v = vals[k];
      if (v < 0 || v >= 1 << FIELD[k][1]) fits = false;
      b |= v << FIELD[k][0];
    }
    A[i] = a; B[i] = b; done[i] = 1;
  };

  const compiled = new WeakMap<readonly Condition[], Compiled>();
  const compile = (when: readonly Condition[]): Compiled => {
    let am = 0, av = 0, bm = 0, bv = 0, never = false;
    const ranges: [Field, number, 1 | -1][] = [];
    const eqA = (shift: number, width: number, v: number): void => {
      const m = ((1 << width) - 1) << shift;
      if ((am & m) !== 0 && (av & m) !== (v << shift)) never = true;
      am |= m; av = (av & ~m) | (v << shift);
    };
    for (const c of when) {
      switch (c.kind) {
        case 'rarity': eqA(0, 2, RARITY[c.is]); break;
        case 'bone': eqA(2, 2, BONE[c.is]); break;
        case 'slot':
          // A slot the craft does not have reads as missing (`holds`: no mask, nothing on the item).
          if (!Number.isInteger(c.slot) || c.slot < 0 || c.slot >= f.slotMasks.length) { if (c.is !== 'missing') never = true; }
          else eqA(4 + 2 * c.slot, 2, SLOT[c.is]);
          break;
        case 'junk': case 'open': {
          if (c.kind === 'open' && !canOpen) throw new Error('an open-slot condition needs the craft’s sides and limits');
          const k = fieldOf(c);
          if (c.op !== '=') { ranges.push([k, c.n, c.op === '>=' ? 1 : -1]); break; }
          const [shift, width] = FIELD[k];
          if (!Number.isInteger(c.n) || c.n < 0 || c.n >= 1 << width) { never = true; break; }
          const m = ((1 << width) - 1) << shift;
          if ((bm & m) !== 0 && (bv & m) !== (c.n << shift)) never = true;
          bm |= m; bv = (bv & ~m) | (c.n << shift);
          break;
        }
      }
    }
    return { never, am, av, bm, bv, ranges };
  };

  return (when, i) => {
    if (done[i] === 0) pack(i);
    if (!fits) return plain(when, i);
    let c = compiled.get(when);
    if (!c) { c = compile(when); compiled.set(when, c); }
    if (c.never || (A[i]! & c.am) !== c.av || (B[i]! & c.bm) !== c.bv) return false;
    for (const [k, n, dir] of c.ranges) {
      const v = get(B[i]!, k);
      if (dir === 1 ? v < n : v > n) return false;
    }
    return true;
  };
}
