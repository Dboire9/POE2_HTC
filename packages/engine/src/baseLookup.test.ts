import { describe, it, expect } from 'vitest';
import { loadPatch } from './loadPatch.ts';
import { baseNameIndex, findBase } from './baseLookup.ts';

const data = loadPatch('data/patches/0.5.0');
const index = baseNameIndex(data);

describe('resolving a printed base name to a base id', () => {
  // The names a real item actually carries. Gloves_str was the case that started this: fubgun's
  // "Knightly Mitts" could not be resolved at all, because `name` for that row is the string
  // "Gloves_str" and nothing in the shipped data knew what a Knightly Mitt was.
  it.each([
    ['Knightly Mitts', 'Gloves_str'],
    ['Chiming Staff', 'Staves'],
    ['Ashen Staff', 'Staves_fire'],
  ])('%s -> %s', (name, id) => {
    expect(findBase(index, name).id).toBe(id);
  });

  it('resolves a Gold Ring and a Gold Amulet to their own rows', () => {
    expect(findBase(index, 'Gold Ring').id).toBe('Rings');
    expect(findBase(index, 'Gold Amulet').id).toBe('Amulets');
  });

  it('ignores case and stray whitespace, since sources disagree about both', () => {
    expect(findBase(index, '  knightly   mitts ').id).toBe('Gloves_str');
  });

  it('returns nothing for a name no base carries', () => {
    const m = findBase(index, 'Sword of Not A Real Item');
    expect(m.id).toBeUndefined();
    expect(m.ids).toEqual([]);
  });

  /**
   * Reported, never guessed. If a name sits on two rows those rows have DIFFERENT MOD POOLS — that is
   * the only reason they are separate rows — so picking one silently would plan the craft against the
   * wrong pool and nothing on screen would say so.
   */
  it('reports every candidate when a name is ambiguous, and resolves to none', () => {
    const ambiguous = [...index.entries()].filter(([, ids]) => ids.length > 1);
    for (const [name, ids] of ambiguous) {
      const m = findBase(index, name);
      expect(m.id, `${name} should not resolve to a single id`).toBeUndefined();
      expect(m.ids).toEqual(ids);
    }
    // Not asserting there ARE any: whether the shipped data has collisions is a fact about the data,
    // and this test is about what happens when it does.
  });
});

describe('the shipped data can answer for every base', () => {
  it('gives every base at least one concrete name', () => {
    const missing = [...data.bases.values()].filter((b) => (b.bases ?? []).length === 0);
    expect(missing.map((b) => b.id)).toEqual([]);
  });

  it('resolves every name it ships back to a base', () => {
    for (const base of data.bases.values()) {
      for (const name of base.bases ?? []) {
        expect(findBase(index, name).ids, name).toContain(base.id);
      }
    }
  });
});

/**
 * Base-type twins (tools/refresh/twins.mjs). Each row is built from RePoE's plain variant, and until
 * 2026-09-10 only that variant's names shipped — so the Ezomyte, Maraketh, Vaal and Karui bases and
 * every Runeforged or Runemastered one, 1,019 released names in all, read as "not a base in the 0.5.0
 * data" while sitting in it. Eleven Rares that four streamers wear were among them.
 */
describe('a base-type twin reads as the row whose pool it rolls', () => {
  it.each([
    ['Sekhema Sandals', 'Boots_int'], // Karui
    ['Runeforged Secured Wraps', 'Gloves_dex_int'], // Karui and Runeforged
    ['Akoyan Spear', 'Spears'],
    ['Skullcrusher Quarterstaff', 'Quarterstaves'],
    ['Leather Vest', 'Body_Armours_dex'], // Ezomyte, level 1
    ['Runemastered Runic Fork', 'Wands'], // the any-element row, not an element-locked one
  ])('%s -> %s', (name, id) => {
    expect(findBase(index, name).id).toBe(id);
  });

  /** The Trarthan Cannon is a crossbow with a `cannon` tag and a pool of its own — grenade suffixes and
   *  no Additional Ammo — so reading it as Crossbows would offer mods it cannot roll. */
  it('never reads a base as a row whose pool it does not share', () => {
    expect(findBase(index, 'Trarthan Cannon').ids).not.toContain('Crossbows');
  });

  /** Golden Hoop is an unreleased Demigod twin of the ring pool — a name no player can be holding. */
  it('names only bases a player can own', () => {
    expect(findBase(index, 'Golden Hoop').ids).toEqual([]);
  });
});
