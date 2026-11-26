import { describe, it, expect } from 'vitest';
import type { ItemState } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem, type MarkovOptions } from './markovFromItem.ts';
import {
  actionId, bestValues, checkWith, exactly, methodCraft, methodPlayer, walkMethod,
  type Method, type MethodPlayer,
} from './markovMethod.ts';
import { methodFromBest } from './markovMethodPrefill.ts';
import type { TierTarget } from './optimize.ts';

// "Start from the best plan" on small frozen-sheet Wand crafts solved at a tight tolerance: the best plan
// written as SHORT rules still costs exactly the best plan, every test it keeps is needed, every rule is
// played somewhere, and where two states read alike to every rule it says it is not faithful.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
const white: ItemState = { base: wands, level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const TIGHT: MarkovOptions = { tolerance: 1e-9, solver: 'policy', keepRoutes: true, restartCost: 1 };
const NO_BONES: MarkovOptions = { ...TIGHT, policy: { excluded: new Set(['desecrate', 'desecrate_ancient']) } };
const any = (modId: string, slot?: number): TierTarget => ({ modId, minTierIndex: 0, ...(slot === undefined ? {} : { slot }) });
/** Two prefixes and a suffix; bones in play unless excluded. */
const THREE = [any('Wands/IncreasedMana'), any('Wands/WeaponSpellDamage'), any('Wands/Intelligence')];

function player(targets: readonly TierTarget[], opts: MarkovOptions): MethodPlayer {
  const r = markovFromItem(data, prices, white, targets, opts);
  expect(r.bound).toBe('exact');
  const craft = methodCraft(data, prices, white, targets, opts);
  if ('refused' in craft) throw new Error(craft.refused);
  const best = bestValues(craft, { routes: r.routes!, bound: r.bound });
  if ('refused' in best) throw new Error(best.refused);
  return methodPlayer(craft, best.V);
}
const withBones = player(THREE, TIGHT);
const boneless = player(THREE, NO_BONES);

/** Costs exactly the best plan: no state where its move is worse than the best, and no gap beyond rounding. */
function exact(pl: MethodPlayer, m: Method): boolean {
  const c = checkWith(pl, 'exact', m);
  return c.ok && c.losses.length === 0 && Math.abs(c.gap!) <= 1e-9 * c.bestCost;
}
const without = (m: Method, r: number, t: number): Method =>
  ({ ...m, rules: m.rules.map((x, k) => (k === r ? { ...x, when: x.when.filter((_, q) => q !== t) } : x)) });
/** The rarity a move works on, where it has just one — the test the prefill writes back for reading's sake. */
const needs = (m: Method['otherwise']): string | undefined =>
  ({ transmute: 'normal', augment: 'magic', regal: 'magic', exalt: 'rare', chaos: 'rare', desecrate: 'rare', 'perfect-essence': 'rare' } as Record<string, string>)[m.currency];
const READS = ['rarity', 'slot', 'junk', 'open', 'bone'];

describe.each([['with bones', withBones], ['without bones', boneless]])('the best plan as short rules, %s', (_, pl) => {
  const pre = methodFromBest(pl);

  it('costs exactly what the best plan costs, with a fraction of the tests', () => {
    expect(pre.faithful).toBe(true);
    expect(exact(pl, pre.method)).toBe(true);
    expect(pre.method.otherwise).toEqual({ currency: 'restart' });
    // One exact rule per state names every slot, both junk counts and the rarity (and the bone).
    expect(pre.before.tests).toBeGreaterThanOrEqual(6 * pre.before.rules);
    expect(pre.after.rules).toBeLessThanOrEqual(pre.before.rules);
    expect(pre.after.tests * 2).toBeLessThan(pre.before.tests);
  });

  it('keeps only the tests it needs: without any one of them it is no longer the best plan', () => {
    pre.method.rules.forEach((rule, r) => {
      rule.when.forEach((c, t) => {
        if (c.kind === 'rarity' && c.is === needs(rule.move)) return; // said for reading, never needed
        expect(exact(pl, without(pre.method, r, t)), `rule ${r + 1}, test ${t + 1}: ${JSON.stringify(c)}`).toBe(false);
      });
    });
  });

  it('plays every rule somewhere, and reads rarity first, then slots, then counts', () => {
    const w = walkMethod(pl, pre.method);
    const picked = new Set(w.order.map((i) => w.rules[i]));
    pre.method.rules.forEach((_, r) => { expect(picked.has(r)).toBe(true); });
    for (const rule of pre.method.rules) {
      const kinds = rule.when.map((c) => READS.indexOf(c.kind));
      expect(kinds).toEqual([...kinds].sort((a, b) => a - b));
    }
  });
});

describe('a craft whose white base costs nothing', () => {
  it('still says what to do on the white base: starting over there ties on cost but goes nowhere', () => {
    // Found by the browser test (one target, a free base): Start over at the white base costs 0 + V*(start),
    // exactly the best move's Q*, so a prefill that left "as good" states to Otherwise never left the base.
    const pl = player([any('Wands/IncreasedMana')], { ...TIGHT, restartCost: 0 });
    const pre = methodFromBest(pl);
    expect(pre.faithful).toBe(true);
    expect(exact(pl, pre.method)).toBe(true);
    expect(pre.method.rules[0]).toMatchObject({ when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute' } });
    expect(pre.after.tests).toBeLessThan(pre.before.tests);
  });
});

describe('where two states read alike to every rule', () => {
  it('says it is not faithful, and loses only where a state reads like one the plan plays differently', () => {
    // Spell Damage, or its Essence, fills the second slot: a Rare can hold the Essence's mod while a
    // rolled Spell Damage below the asked tier blocks the same slot, and reads just like the Rare that
    // holds it at tier — the plan starts one over and Exalts the other.
    const pl = player([
      any('Wands/IncreasedMana', 0), any('Wands/WeaponSpellDamage', 1), any('Wands/Intelligence', 2),
      { ...any('Wands/Essence_WeaponCasterDamagePrefix', 1), essenceTwin: true },
    ], TIGHT);
    const pre = methodFromBest(pl);
    expect(pre.faithful).toBe(false);
    const c = checkWith(pl, 'exact', pre.method);
    if (!c.ok) throw new Error(JSON.stringify(c.stop));
    expect(c.losses.length).toBeGreaterThan(0);
    const reached = walkMethod(pl, pre.method).order;
    const reading = (i: number): string => JSON.stringify(exactly(pl.state(i), pl.frame, true));
    const losing = new Set(c.losses.map((l) => l.state));
    for (const loss of c.losses) {
      // Another state it reaches reads the same, and there the very same move is the best plan's.
      const alike = reached.filter((j) => j !== loss.state && !losing.has(j) && reading(j) === reading(loss.state));
      expect(alike.some((j) => c.table.act[j]! >= 0 && actionId(c.table.actions[c.table.act[j]!]!) === actionId(loss.move))).toBe(true);
    }
  });
});
