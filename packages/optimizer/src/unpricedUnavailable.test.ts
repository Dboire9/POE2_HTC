import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { desecrationOmenForMod } from '../../engine/src/probability.ts';
import type { ItemState } from '../../engine/src/types.ts';
import type { PlanStep } from '../../engine/src/plan.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { pricesForBase, stepCost, stepIsPriced, type Prices } from './cost.ts';
import { leverOptions } from './levers.ts';
import { createActionSpace } from './markovActions.ts';
import { FLAG_NONE, decodeState, encodeState, sideIndexOf, type McTarget } from './markovState.ts';

// A MISSING PRICE MEANS UNAVAILABLE, NOT FREE (TODO 12d).
//
// `stepCost` reads an absent key as 0, so before this an unpriced orb or omen was FREE and won every plan
// it could reach, on a currency the sheet could not even quote. The gates against it were scattered —
// orb strengths, Whittling, the Greater Exaltation route — and the boss omens had none at all. Both
// planners now ask `stepIsPriced` where a step or action enters their search; these pin that each of
// them drops an unpriced omen, and keeps it the moment it has a price.

const data = loadPatch('data/patches/0.5.0');
const frozen = loadFrozenPrices();
const wands = data.bases.get('Wands')!;
const without = (p: Prices, omen: string): Prices =>
  ({ ...p, omens: Object.fromEntries(Object.entries(p.omens).filter(([id]) => id !== omen)) });

describe('stepIsPriced', () => {
  it('needs the orb AND every omen the step spends', () => {
    const sided: PlanStep = { currency: 'exalt', add: 'Wands/IncreasedMana', constrainTo: 'prefix' };
    expect(stepIsPriced(frozen, sided)).toBe(true);
    expect(stepIsPriced(without(frozen, 'OmenofSinistralExaltation'), sided)).toBe(false);
    // …and what it would have cost instead: the orb alone, as if the omen were free.
    expect(stepCost(without(frozen, 'OmenofSinistralExaltation'), sided)).toBe(frozen.currency['exalt']);
  });

  it('counts an essence as priced when only its level is on the sheet, as stepCost does', () => {
    const step: PlanStep = { currency: 'essence', add: 'Wands/SomeEssence', essenceLevel: 'greater' };
    expect(stepIsPriced({ currency: { essence_greater: 2 }, omens: {} }, step)).toBe(true);
    expect(stepIsPriced({ currency: {}, omens: {} }, step)).toBe(false);
  });

  it('reads a price of 0 as priced: free on purpose is a market state the sheet can state', () => {
    expect(stepIsPriced({ currency: { chaos: 0 }, omens: { OmenofWhittling: 0 } }, { currency: 'chaos', omen: 'whittling' }))
      .toBe(true);
  });
});

describe('the step planners drop an unpriced omen', () => {
  const rare: ItemState = { base: wands, level: 82, rarity: 'rare', prefixes: [], suffixes: [] };
  const step: PlanStep = { currency: 'exalt', add: 'Wands/IncreasedMana' };
  const sided = (p: Prices) => leverOptions(data, p, rare, step).filter((o) => o.step.currency === 'exalt' && o.step.constrainTo);

  it('offers the Sinistral Exaltation lever only while the sheet prices the omen', () => {
    expect(sided(frozen).length).toBeGreaterThan(0);
    expect(sided(without(frozen, 'OmenofSinistralExaltation'))).toEqual([]);
  });
});

describe('the MDP drops an unpriced boss omen — the one omen with no gate of its own before', () => {
  // A carved target, so the action space builds the boss draw for the boss that offers it.
  const carved = wands.pools.desecrated.prefixes.map((id) => data.mods.get(id)!).find((m) => desecrationOmenForMod(m) !== undefined)!;
  const boss = desecrationOmenForMod(carved)!;
  const omen = `Omenofthe${boss[0]!.toUpperCase()}${boss.slice(1)}`;
  const list: McTarget[] = [{ mods: [{ mod: carved, minIndex: 0 }], type: carved.type, fractured: false }];
  const bossDraws = (p: Prices) => createActionSpace({
    data, prices: pricesForBase(p, wands), level: 82, pools: wands.pools, list,
    side: sideIndexOf(list), desecratable: true, bossTargetable: true,
  }).actionsOf(decodeState(encodeState(0, 0, 0, 0, FLAG_NONE, 'rare')))
    .filter((a) => a.action.currency === 'desecrate' && a.action.boss === boss);

  it(`builds the ${boss} draw while its omen is priced, and none without`, () => {
    expect(frozen.omens[omen]).toBeDefined();
    expect(bossDraws(frozen).length).toBeGreaterThan(0);
    expect(bossDraws(without(frozen, omen))).toEqual([]);
  });
});
