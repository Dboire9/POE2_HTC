import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { whiteItem } from '../../engine/src/item.ts';
import type { ItemState } from '../../engine/src/types.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';
import { finishesFrom, type RouteTable } from './markovRoute.ts';
import type { TierTarget } from './optimize.ts';

// A solve that stopped early still answers, as a CEILING ("≤ x"), and its plan can be followed in Craft
// along — but only once the plan is checked to finish, and every figure read from it is a ceiling too.
// A FLOOR's plan ("≥ x", a held item whose first phase did not settle) is never attached.

const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
const top = (id: string): number => data.mods.get(id)!.tiers.length - 1;
const CASTER: TierTarget[] = [
  { modId: 'Wands/WeaponSpellDamage', minTierIndex: top('Wands/WeaponSpellDamage') - 2 },
  { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon', minTierIndex: top('Wands/GlobalIncreaseSpellSkillGemLevelWeapon') - 1 },
  { modId: 'Wands/IncreasedCastSpeed', minTierIndex: top('Wands/IncreasedCastSpeed') - 2 },
];

/** What following the table's plan really costs from `root`: its chain solved outright, to 1e-12. */
function planCost(t: RouteTable, root: number): number {
  const n = t.keys.length;
  const J = new Float64Array(n);
  for (let sweep = 0; sweep < 1_000_000; sweep++) {
    let delta = 0;
    for (let i = 0; i < n; i++) {
      if (t.goal[i] === 1 || t.act[i]! < 0) continue;
      let self = 0;
      let v = t.actCost[i]!;
      for (let o = t.outStart[i]!; o < t.outStart[i + 1]!; o++) {
        if (t.outTo[o] === i) self += t.outProb[o]!;
        else v += t.outProb[o]! * J[t.outTo[o]!]!;
      }
      const next = v / (1 - self);
      delta = Math.max(delta, Math.abs(next - J[i]!));
      J[i] = next;
    }
    if (delta < 1e-12) break;
  }
  return J[root]!;
}

describe('a ceiling carries its plan, checked', () => {
  // One round of policy improvement and no more: it stops without its certificate, so the answer is a
  // ceiling, and the plan is the improvement of the last plan it costed.
  const r = markovFromItem(data, prices, whiteItem(wands, 82), CASTER,
    { restartCost: 0, solver: 'policy', keepRoutes: true, maxRounds: 1 });

  it('answers as a ceiling, with the plan to follow', () => {
    expect(r.feasible).toBe(true);
    expect(r.bound).toBe('upper');
    expect(r.routes).toBeDefined();
  });

  it('is a plan that finishes, and costs no more than the ceiling', () => {
    const t = r.routes!;
    expect(finishesFrom(t, t.restartIdx)).toBe(true);
    const cost = planCost(t, t.restartIdx);
    expect(Number.isFinite(cost)).toBe(true);
    expect(cost).toBeLessThanOrEqual(r.expectedCost * (1 + 1e-9));
    // …and the exact answer is no higher still: a ceiling, not a guess.
    const exact = markovFromItem(data, prices, whiteItem(wands, 82), CASTER, { restartCost: 0, solver: 'policy' });
    expect(exact.bound).toBe('exact');
    expect(exact.expectedCost).toBeLessThanOrEqual(cost * (1 + 1e-9));
  });
});

describe('a floor carries no plan', () => {
  it('a held item whose first phase did not settle has no plan known to finish', () => {
    const held: ItemState = {
      base: wands, level: 82, rarity: 'rare',
      prefixes: [{ modId: 'Wands/IncreasedMana', tierName: data.mods.get('Wands/IncreasedMana')!.tiers[0]!.name }], suffixes: [],
    };
    const r = markovFromItem(data, prices, held, CASTER, { keepRoutes: true, maxIters: 2 });
    expect(r.bound).toBe('lower');
    expect(r.routes).toBeUndefined();
  });
});

describe('finishesFrom', () => {
  it('rejects a plan with a state it can reach but never leave for a goal', () => {
    const t = markovFromItem(data, prices, whiteItem(wands, 82), CASTER, { restartCost: 0, solver: 'policy', keepRoutes: true }).routes!;
    expect(finishesFrom(t, t.restartIdx)).toBe(true);
    // Cut every goal off: the same plan now leads nowhere.
    const noGoal: RouteTable = { ...t, goal: new Uint8Array(t.goal.length) };
    expect(finishesFrom(noGoal, t.restartIdx)).toBe(false);
  });
});
