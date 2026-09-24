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
   * A craft that never WANTS a fourth suffix costs about the same with the rune in — the craft fills its
   * suffixes long before a fourth slot matters. Played out 20,000 times each (2026-09-24): 22,326 ± 134
   * without the rune and 22,362 ± 132 with it, the same within the dice.
   *
   * Pinned as "recognisably the same craft, and not ignored": within 1% of each other, never identical.
   * It used to pin a DIRECTION (dearer with the rune, by 1.5e-9), but that was the model's arithmetic,
   * not the game's: with the junk-family correction (TODO 23) the two lattices land 0.65% apart the
   * other way, and the replays above say neither direction is real.
   */
  it('costs about the same when the fourth suffix is never asked for — and the rune is not ignored', () => {
    const without = markovFromItem(data, prices, whiteItem(plain, 82), THREE);
    const with_ = markovFromItem(data, prices, whiteItem(serles, 82), THREE);
    expect(without.feasible).toBe(true);
    expect(with_.expectedCost).not.toBe(without.expectedCost);
    expect(Math.abs(with_.expectedCost / without.expectedCost - 1)).toBeLessThan(0.01);
  });
});
