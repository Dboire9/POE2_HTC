import { describe, it, expect } from 'vitest';
import type { ItemBase, ItemState, Mod, PatchData } from './index.ts';
import {
  addNormalAffixProbability, essenceForcedProbability, familiesOf, familyAvailable, itemFamilies,
} from './index.ts';

// A CRAFTED modifier — Essence, Perfect Essence or Alloy — shares an item with a ROLLED modifier of
// the same family. Three uncorrupted items on poe.ninja (2026-09-15) carry exactly that: Steelmage's
// Sleek Jacket has +28% Lightning Resistance rolled beside +34% crafted, his Sekhema Sandals two Fire
// Resistances, and xthefarmerx's Topaz Ring another pair.
//
// `familiesOf` answers it by NAMESPACING a crafted mod's groups (`crafted:FireResistance`), so every
// exclusion in the engine follows at once — it is the one place collision is decided. What must not
// follow is the rest: two crafted mods of one family still collide, and desecrated mods are not
// crafted (0.5.0 separated them), so they keep colliding with rolled mods as before.
const mk = (id: string, source: Mod['source'], family = 'FireResistance'): Mod => ({
  id, source, type: 'suffix', family, tags: [], text: id,
  tiers: [{ name: 't1', ilvl: 1, weight: 100, ranges: [] }],
});
const ROLLED = mk('ROLLED', 'normal');
const TWIN = mk('TWIN', 'normal'); // ROLLED's own family, for the rule that did NOT change
const FILLER = mk('FILLER', 'normal', 'ColdResistance'); // another family, so it never blocks ROLLED
const ESSENCE = mk('ESSENCE', 'essence');
const PERFECT = mk('PERFECT', 'perfect_essence'); // an Alloy is this source too — see `alloy`
const CARVED = mk('CARVED', 'desecrated');
const base: ItemBase = {
  id: 'B', name: 'B', category: 'C',
  pools: {
    normal: { prefixes: [], suffixes: ['ROLLED', 'TWIN', 'FILLER'] },
    desecrated: { prefixes: [], suffixes: ['CARVED'] },
    essence: { prefixes: [], suffixes: ['ESSENCE', 'PERFECT'] },
  },
};
const data: PatchData = {
  patch: 't',
  mods: new Map([ROLLED, TWIN, FILLER, ESSENCE, PERFECT, CARVED].map((m) => [m.id, m])),
  bases: new Map([['B', base]]),
};
const holding = (rarity: ItemState['rarity'], ...ids: string[]): ItemState => ({
  base, level: 100, rarity, prefixes: [], suffixes: ids.map((modId) => ({ modId, tierName: 't1' })),
});

describe('familiesOf — crafted modifiers have their own groups', () => {
  it('namespaces an Essence, a Perfect Essence and an Alloy', () => {
    expect(familiesOf(ESSENCE)).toEqual(['crafted:FireResistance']);
    expect(familiesOf(PERFECT)).toEqual(['crafted:FireResistance']);
  });

  it('leaves rolled and desecrated modifiers in the plain group', () => {
    expect(familiesOf(ROLLED)).toEqual(['FireResistance']);
    expect(familiesOf(CARVED)).toEqual(['FireResistance']);
  });

  it('puts both groups on an item holding one of each', () => {
    expect([...itemFamilies(data, holding('rare', 'ROLLED', 'ESSENCE'))].sort())
      .toEqual(['FireResistance', 'crafted:FireResistance']);
  });
});

describe('a crafted modifier sits beside a rolled one of the same family', () => {
  it('is available when the rolled one is already there, and the other way round', () => {
    expect(familyAvailable(data, holding('rare', 'ROLLED'), ESSENCE)).toBe(true);
    expect(familyAvailable(data, holding('rare', 'PERFECT'), ROLLED)).toBe(true);
  });

  it('still collides with another crafted modifier of that family', () => {
    expect(familyAvailable(data, holding('rare', 'ESSENCE'), PERFECT)).toBe(false);
  });

  it('leaves the desecrated rule alone: carved and rolled still collide', () => {
    expect(familyAvailable(data, holding('rare', 'CARVED'), ROLLED)).toBe(false);
    expect(familyAvailable(data, holding('rare', 'ROLLED'), CARVED)).toBe(false);
  });
});

// The half that matters: a rule the probability math does not read is a rule the app does not have.
describe('the rule reaches the numbers', () => {
  it('lets an Exalt roll a family a crafted modifier already holds', () => {
    // PERFECT occupies `crafted:FireResistance`, which excludes nothing in the normal pool — so all
    // three suffixes stay rollable and ROLLED takes its equal share of the weight.
    expect(addNormalAffixProbability(data, holding('rare', 'PERFECT'), 'exalt', 'ROLLED')).toBeCloseTo(1 / 3, 12);
    // …and the rule that did not change: a rolled modifier still blocks its own family.
    expect(addNormalAffixProbability(data, holding('rare', 'ROLLED'), 'exalt', 'TWIN')).toBe(0);
  });

  it('lets an Essence force its mod onto an item already holding that family rolled', () => {
    expect(essenceForcedProbability(data, holding('magic', 'ROLLED'), 'ESSENCE')).toBe(1);
  });
});
