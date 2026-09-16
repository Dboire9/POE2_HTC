import { describe, it, expect } from 'vitest';
import { loadPatch, limitsOf, whiteItem, withRunes } from '../../engine/src/index.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { markovFromItem } from './markovFromItem.ts';
import { optimizePareto } from './optimize.ts';

/**
 * Serle's Triumph — "+1 Suffix Modifier allowed" — lets an item hold FOUR suffixes.
 *
 * It is not a curiosity: fubgun wears two items with it socketed, a Warmonger Bow and Sekhema Sandals,
 * each carrying four (poe.ninja, 2026-09-15). The cap it raises used to be a constant in five modules;
 * it is the item's own limit now, which is what lets one socketed rune reach all of them.
 *
 * Measured here on a Sceptre with four rolled suffixes: the lattice grows from 85 nodes to 263 and the
 * solve from 0.3 s to 2.3 s. That is the cost of the extra rung, and it is paid only by crafts that
 * actually ask for the fourth suffix.
 */
const data = loadPatch('data/patches/0.5.0');
const prices = loadFrozenPrices();
const plain = data.bases.get('Sceptres')!;
const serles = withRunes(plain, ['serles-triumph']);

const FOUR = [
  'Sceptres/AlliesInPresenceAllResistances', 'Sceptres/GlobalIncreaseMinionSpellSkillGemLevelWeapon',
  'Sceptres/Strength', 'Sceptres/Intelligence',
].map((modId) => ({ modId }));
const THREE = FOUR.slice(0, 3);

describe('a fourth suffix needs Serle’s Triumph', () => {
  it('is refused without it, by the shape check and by the model alike', () => {
    expect(limitsOf(plain).suffixes).toBe(3);
    expect(() => optimizePareto(data, prices, plain, FOUR)).toThrow(/4 suffixes \(max 3\)/);
    const r = markovFromItem(data, prices, whiteItem(plain, 82), FOUR);
    expect(r.feasible).toBe(false);
    expect(r.reason).toMatch(/4 suffixes.*holds 3/);
  });

  it('is solved with it socketed', () => {
    expect(limitsOf(serles).suffixes).toBe(4);
    const r = markovFromItem(data, prices, whiteItem(serles, 82), FOUR);
    expect(r.feasible).toBe(true);
    expect(Number.isFinite(r.expectedCost)).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
  });

  /**
   * A craft that never WANTS a fourth suffix still costs a little more with the rune in, and that is
   * the model being right rather than drifting: the extra slot is a slot JUNK can land in too, so an
   * Exalt has one more way to miss. The difference is real but tiny — 22592.434291 against
   * 22592.434257 on this craft, a relative 1.5e-9 — because the craft fills its suffixes long before
   * the fourth slot matters.
   *
   * Pinned as a direction rather than a number: dearer, never cheaper, and recognisably the same craft.
   * Equality would be the wrong claim (it fails), and "close enough" alone would survive a rune that
   * quietly did nothing.
   */
  it('costs slightly MORE even when the fourth suffix is never asked for', () => {
    const without = markovFromItem(data, prices, whiteItem(plain, 82), THREE);
    const with_ = markovFromItem(data, prices, whiteItem(serles, 82), THREE);
    expect(without.feasible).toBe(true);
    expect(with_.expectedCost).toBeGreaterThan(without.expectedCost);
    expect(with_.expectedCost / without.expectedCost - 1).toBeLessThan(1e-6);
  });
});
