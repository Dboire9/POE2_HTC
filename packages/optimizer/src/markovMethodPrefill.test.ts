import { describe, it, expect } from 'vitest';
import type { ItemState } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovBuiltUp } from './markovBuildUp.ts';
import { markovFromItem, type MarkovOptions } from './markovFromItem.ts';
import {
  actionId, bestValues, checkWith, exactly, methodCraft, methodPlayer, walkMethod,
  type Method, type MethodPlayer,
} from './markovMethod.ts';
import { judge, methodFromBest, walkingJudge, type Step } from './markovMethodPrefill.ts';
import { ruleReader } from './markovMethodReading.ts';
import type { Condition, MethodRule } from './markovMethod.ts';
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

function player(targets: readonly TierTarget[], opts: MarkovOptions, built = false): MethodPlayer {
  // A big craft is solved as the app solves it, built up from smaller ones (markovBuildUp.ts): seconds, not minutes.
  const r = built ? markovBuiltUp(data, prices, white, targets, opts) : markovFromItem(data, prices, white, targets, opts);
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

describe('the shortening on a clock, and its judge', () => {
  // The judge reads each step's effect off the picks before it (markovMethodPrefill.ts, 2026-11-26): it
  // must keep exactly the steps that walking each step's method in full keeps.
  const twin = player([
    any('Wands/IncreasedMana', 0), any('Wands/WeaponSpellDamage', 1), any('Wands/Intelligence', 2),
    { ...any('Wands/Essence_WeaponCasterDamagePrefix', 1), essenceTwin: true },
  ], TIGHT);
  const four = player([
    { modId: 'Wands/WeaponSpellDamage', minTierIndex: 5 }, { modId: 'Wands/IncreasedCastSpeed', minTierIndex: 4 },
    { modId: 'Wands/SpellCriticalStrikeChance', minTierIndex: 3 }, { modId: 'Wands/ChaosDamageWeaponPrefix', minTierIndex: 5 },
  ], NO_BONES);

  it.each([['with bones', withBones], ['without bones', boneless], ['with an Essence twin', twin], ['four mods', four]])(
    'keeps exactly the steps a full walk keeps: %s', (_, pl) => {
      expect(methodFromBest(pl)).toEqual(methodFromBest(pl, { byWalking: true }));
    },
  );

  it.each([['with bones', withBones], ['without bones', boneless], ['four mods', four]])(
    'decides every step as a full walk does, whatever the step — wider, narrower, a rule removed: %s', (_, pl) => {
      // Random steps on the best plan's exact rules, with a verdict that also turns down arbitrary moves
      // (one in four, by a hash), so steps lose at states the shortening's own never would: behind another
      // changed state, at a state only the step reaches, in a loop that never finishes.
      const start = methodFromBest(pl, { maxMillis: -1 }).method;
      const otherwise = start.otherwise;
      const tie = 1e-9 * Math.max(1, Math.abs(pl.V[pl.start]!));
      const allowed = (i: number, mv: { q: number; action: object }): boolean => {
        if (mv.q <= pl.V[i]! + tie) return true;
        let h = i * 2654435761;
        for (const ch of JSON.stringify(mv.action)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
        return (h >>> 0) % 4 !== 0;
      };
      const fast = judge(pl, ruleReader(pl), otherwise, allowed, start.rules);
      const slow = walkingJudge(pl, otherwise, allowed, start.rules);
      let seed = 12345;
      const rand = (n: number): number => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return (seed >>> 8) % n; };
      const extra: Condition[] = [
        { kind: 'rarity', is: 'magic' }, { kind: 'rarity', is: 'rare' }, { kind: 'slot', slot: 0, is: 'present' },
        { kind: 'slot', slot: 1, is: 'missing' }, { kind: 'junk', side: 'total', op: '<=', n: 1 }, { kind: 'junk', side: 'prefix', op: '>=', n: 1 },
      ];
      let kept = 0;
      for (let k = 0; k < 400 && fast.rules.length > 0; k++) {
        const rules: readonly MethodRule[] = fast.rules;
        const r = rand(rules.length);
        const when = rules[r]!.when;
        const op = rand(10);
        let step: Step;
        if (op < 4 && when.length > 0) step = { kind: 'replace', r, when: when.filter((_, t) => t !== rand(when.length)), wider: true };
        else if (op < 5 && when.some((c) => c.kind === 'junk' && c.op === '=')) {
          const c = when.find((x) => x.kind === 'junk' && x.op === '=')!;
          step = { kind: 'replace', r, when: when.map((x) => (x === c ? { ...c, op: '>=' as const } : x)), wider: true };
        } else if (op < 7) step = { kind: 'remove', r };
        else if (op < 9) step = { kind: 'replace', r, when: [...when, extra[rand(extra.length)]!], wider: false };
        else step = { kind: 'replace', r, when: [extra[rand(extra.length)]!], wider: false };
        const keepBefore = [r, r + 1, rules.length][rand(3)]!;
        const a = fast.attempt(step, keepBefore);
        const b = slow.attempt(step, keepBefore);
        expect(a, `step ${k}: ${JSON.stringify(step)}`).toBe(b);
        if (a) kept++;
        if (k % 25 === 24) { fast.prune(); slow.prune(); }
        expect(fast.rules).toEqual(slow.rules);
      }
      // Both kinds of verdict came up.
      expect(kept).toBeGreaterThan(10);
      expect(kept).toBeLessThan(390);
    },
  );

  it('a clock that has run out leaves the exact rules — still the best plan — and says it stopped early', () => {
    const pre = methodFromBest(withBones, { maxMillis: -1 });
    expect(pre.complete).toBe(false);
    expect(pre.faithful).toBe(true);
    expect(exact(withBones, pre.method)).toBe(true);
    expect(pre.after.rules).toBe(pre.before.rules);
    expect(methodFromBest(withBones).complete).toBe(true);
  });

  it('reports how far it is, forward only, ending at 1', () => {
    const seen: number[] = [];
    methodFromBest(four, { onProgress: (f) => seen.push(f) });
    expect(seen.length).toBeGreaterThan(3);
    expect(seen.at(-1)).toBe(1);
    for (let k = 1; k < seen.length; k++) expect(seen[k]!).toBeGreaterThan(seen[k - 1]!);
  });
});

describe('a five-mod craft', () => {
  it('shortens in seconds, not minutes, and still costs exactly the best plan', () => {
    // The maintainer's craft (2026-11-26) at its top two tiers, without bones: a white Wand, Chaos Damage, the
    // Spell Damage + Mana hybrid, Spell Damage, Cast Speed and Critical Hit Chance for Spells. Walking every
    // step's method from scratch shortened its 408 exact rules in 34 s; the judge does it in ~0.2 s. The
    // bound is loose for a loaded machine, and still well under the walk.
    const top2 = (modId: string): TierTarget => ({ modId, minTierIndex: Math.max(0, data.mods.get(modId)!.tiers.length - 2) });
    const pl = player([
      'Wands/ChaosDamageWeaponPrefix', 'Wands/WeaponSpellDamageAndMana', 'Wands/WeaponSpellDamage',
      'Wands/IncreasedCastSpeed', 'Wands/SpellCriticalStrikeChance',
    ].map(top2), NO_BONES, true);
    const t0 = performance.now();
    const pre = methodFromBest(pl);
    const took = performance.now() - t0;
    expect(took).toBeLessThan(8_000);
    expect(pre.complete).toBe(true);
    expect(pre.before.rules).toBeGreaterThan(300);
    expect(pre.after.rules * 2).toBeLessThan(pre.before.rules);
    expect(pre.faithful).toBe(true);
    expect(exact(pl, pre.method)).toBe(true);
  });
});
