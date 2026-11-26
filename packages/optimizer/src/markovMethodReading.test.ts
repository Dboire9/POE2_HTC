import { describe, it, expect } from 'vitest';
import type { ItemState } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem, type MarkovOptions } from './markovFromItem.ts';
import { bestValues, holds, methodCraft, methodPlayer, type Condition } from './markovMethod.ts';
import { ruleReader } from './markovMethodReading.ts';
import type { TierTarget } from './optimize.ts';

// The prefill's packed reading of a rule's tests (markovMethodReading.ts) answers exactly as `holds` does,
// at every state of a craft with bones, an Essence twin sharing a slot, and free places on both sides.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const white: ItemState = { base: data.bases.get('Wands')!, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const opts: MarkovOptions = { tolerance: 1e-9, solver: 'policy', keepRoutes: true, restartCost: 1 };
const any = (modId: string, slot: number): TierTarget => ({ modId, minTierIndex: 0, slot });
const targets: TierTarget[] = [
  any('Wands/IncreasedMana', 0), any('Wands/WeaponSpellDamage', 1), any('Wands/Intelligence', 2),
  { ...any('Wands/Essence_WeaponCasterDamagePrefix', 1), essenceTwin: true },
];
const r = markovFromItem(data, prices, white, targets, opts);
const craft = methodCraft(data, prices, white, targets, opts);
if ('refused' in craft) throw new Error(craft.refused);
const best = bestValues(craft, { routes: r.routes!, bound: r.bound });
if ('refused' in best) throw new Error(best.refused);
const pl = methodPlayer(craft, best.V);

/** Every test a rule can hold, on this craft's three slots, with counts from 0 to 4. */
const TESTS: Condition[] = [
  ...(['normal', 'magic', 'rare'] as const).map((is): Condition => ({ kind: 'rarity', is })),
  ...(['none', 'junk', 'wanted'] as const).map((is): Condition => ({ kind: 'bone', is })),
  ...[0, 1, 2].flatMap((slot) => (['present', 'missing', 'blocked'] as const).map((is): Condition => ({ kind: 'slot', slot, is }))),
  ...(['prefix', 'suffix', 'total'] as const).flatMap((side) => (['=', '>=', '<='] as const).flatMap((op) =>
    [0, 1, 2, 3, 4].map((n): Condition => ({ kind: 'junk', side, op, n })))),
  ...(['prefix', 'suffix'] as const).flatMap((side) => (['=', '>=', '<='] as const).flatMap((op) =>
    [0, 1, 2, 3].map((n): Condition => ({ kind: 'open', side, op, n })))),
];

describe('a rule’s tests, packed', () => {
  const read = ruleReader(pl);
  const N = craft.lattice.N;

  it('reads each test as `holds` does, at every state', () => {
    let held = 0;
    for (const c of TESTS) {
      const when = [c];
      for (let i = 0; i < N; i++) {
        const want = holds(c, pl.state(i), pl.frame);
        if (want) held++;
        if (read(when, i) !== want) throw new Error(`${JSON.stringify(c)} at state ${i}: ${!want}`);
      }
    }
    // Not a vacuous agreement: the tests hold at some states and not at others.
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThan(TESTS.length * N);
  });

  it('reads several tests together — a count both "≥" and "≤", two readings of one slot (never) — as every one of them', () => {
    const lists: Condition[][] = [];
    for (let k = 0; k < 400; k++) {
      // A fixed spread over the pairs and triples, so the run is the same every time.
      lists.push([TESTS[(k * 7) % TESTS.length]!, TESTS[(k * 13 + 5) % TESTS.length]!, ...(k % 3 === 0 ? [TESTS[(k * 29 + 11) % TESTS.length]!] : [])]);
    }
    lists.push([{ kind: 'slot', slot: 0, is: 'present' }, { kind: 'slot', slot: 0, is: 'missing' }]);
    lists.push([{ kind: 'junk', side: 'prefix', op: '>=', n: 1 }, { kind: 'junk', side: 'prefix', op: '<=', n: 1 }]);
    lists.push([{ kind: 'slot', slot: 7, is: 'present' }], [{ kind: 'slot', slot: 7, is: 'missing' }]);
    lists.push([]);
    for (const when of lists) {
      for (let i = 0; i < N; i++) {
        const want = when.every((c) => holds(c, pl.state(i), pl.frame));
        if (read(when, i) !== want) throw new Error(`${JSON.stringify(when)} at state ${i}: ${!want}`);
      }
    }
  });
});
