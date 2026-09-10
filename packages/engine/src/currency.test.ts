import { describe, it, expect } from 'vitest';
import type { ItemState, PlacedMod, Rarity } from './index.ts';
import {
  loadPatch, addAffixProbability, addNormalAffixProbability, itemFamilies,
  augmentationProbability, regalProbability, exaltProbability,
} from './index.ts';

// Legality gating for the add-affix currencies. The probability MATH is covered exhaustively by the
// add-affix differential vs Java; here we check that each currency is only legal on the right rarity,
// respects family exclusion and slot fullness, and otherwise returns the shared math.
//
// NOTE: the Java engine (and therefore this port, for differential parity) treats every rarity as
// 3 prefix + 3 suffix slots — it does not enforce the magic 1+1 limit. That mechanic gap is left for
// the Phase-3 external-validation pass.

const data = loadPatch('data/patches/0.5');
const wands = data.bases.get('Wands')!;
const placed = (id: string): PlacedMod => ({ modId: id, tierName: data.mods.get(id)!.tiers[0]!.name });
const item = (rarity: Rarity, prefixes: PlacedMod[], suffixes: PlacedMod[]): ItemState =>
  ({ base: wands, level: 100, rarity, prefixes, suffixes });

const MANA = 'Wands/MAXIMUM_MANA';          // prefix, family IncreasedMana
const INT = 'Wands/INTELLIGENCE';           // suffix, family Intelligence
const SPELL = 'Wands/INCREASED_SPELL_DAMAGE'; // prefix
const COLD = 'Wands/INCREASED_COLD_SPELL_DAMAGE'; // prefix, shares WeaponCasterDamagePrefix with SPELL

describe('augmentation (magic only)', () => {
  const magic1p = item('magic', [placed(MANA)], []);

  it('legal add returns the shared add-affix math (family exclusion D6 + magic 1-slot D2)', () => {
    // magic item with 1 prefix → augment can only add a suffix (D2), from the family-excluded pool (D6)
    const p = augmentationProbability(data, magic1p, INT);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeCloseTo(addAffixProbability(data, magic1p, INT, { occupiedFamilies: itemFamilies(data, magic1p), slotLimit: 1 }), 12);
  });

  it('augment cannot add a second prefix to a magic item (D2)', () => {
    expect(augmentationProbability(data, magic1p, SPELL)).toBe(0); // SPELL is a prefix; magic prefix slot is full
  });

  it("family already present → 0 (can't re-add IncreasedMana)", () => {
    expect(augmentationProbability(data, magic1p, MANA)).toBe(0);
  });

  it('a different mod of a present family → 0', () => {
    const magicCaster = item('magic', [placed(SPELL)], []);
    expect(augmentationProbability(data, magicCaster, COLD)).toBe(0); // shares WeaponCasterDamagePrefix
  });

  it('wrong rarity (normal / rare) → 0', () => {
    expect(augmentationProbability(data, item('normal', [], []), INT)).toBe(0);
    expect(augmentationProbability(data, item('rare', [], []), INT)).toBe(0);
  });
});

describe('regal (magic only)', () => {
  it('works on magic, 0 on rare', () => {
    expect(regalProbability(data, item('magic', [placed(MANA)], []), INT)).toBeGreaterThan(0);
    expect(regalProbability(data, item('rare', [], []), INT)).toBe(0);
  });
});

describe('exalt (rare only) + slot fullness', () => {
  it('0 on magic', () => {
    expect(exaltProbability(data, item('magic', [], []), INT)).toBe(0);
  });

  it('prefixes full → prefix candidate 0, suffix candidate > 0 (suffix-only branch)', () => {
    const rare3p = item('rare', [placed(MANA), placed(SPELL), placed('Wands/DAMAGE_AS_EXTRA_FIRE_DAMAGE')], []);
    expect(exaltProbability(data, rare3p, COLD)).toBe(0);   // prefix, no slot
    expect(exaltProbability(data, rare3p, INT)).toBeGreaterThan(0); // suffix, open
  });
});

/**
 * A Perfect Orb of Transmutation "upgrades a normal item to magic, guaranteeing 1 modifier with minimum
 * modifier level of 70. Augmentation is the same" (confirmed 2026-09-10). One table used to give every
 * orb the Exalt's ladder — Perfect 50 — so a Perfect Transmute could land a mod whose best tier is 54.
 */
describe('Perfect Transmutation and Augmentation roll at modifier level 70', () => {
  const shipped = loadPatch('data/patches/0.5.0');
  const rings = shipped.bases.get('Rings')!;
  const LIFE = 'Rings/IncreasedLife'; // its best tier is ilvl 54: between the Exalt's 50 and 70
  const at = (rarity: Rarity): ItemState => ({ base: rings, level: 82, rarity, prefixes: [], suffixes: [] });

  it('cannot land a mod whose best tier is below 70', () => {
    expect(Math.max(...shipped.mods.get(LIFE)!.tiers.map((t) => t.ilvl))).toBeLessThan(70);
    expect(addNormalAffixProbability(shipped, at('normal'), 'transmute', LIFE, { currencyTier: 'perfect' })).toBe(0);
    expect(addNormalAffixProbability(shipped, at('magic'), 'augment', LIFE, { currencyTier: 'perfect' })).toBe(0);
  });

  /** The ladders differ by currency; the other rungs did not move. */
  it('leaves a Perfect Regal at 50 and a Greater Transmute at 35, so both still can', () => {
    expect(addNormalAffixProbability(shipped, at('magic'), 'regal', LIFE, { currencyTier: 'perfect' })).toBeGreaterThan(0);
    expect(addNormalAffixProbability(shipped, at('normal'), 'transmute', LIFE, { currencyTier: 'greater' })).toBeGreaterThan(0);
  });
});
