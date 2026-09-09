import { describe, it, expect } from 'vitest';
import { loadPatch } from '../../packages/engine/src/index.ts';
import { readPastedItem, itemModsFrom, isSettled, NO_CHOICES, type PasteChoices } from './pasteItem';

const data = loadPatch('data/patches/0.5.0');
const read = (text: string, choices: PasteChoices = NO_CHOICES) => readPastedItem(data, text, choices);

const item = (body: string, header = 'Item Class: Helmets\nRarity: Rare\nKraken Crest\nMasked Greathelm') =>
  `${header}\n--------\nItem Level: 81\n--------\n${body}`;

describe('reading a pasted item', () => {
  it('reads the base, level and rarity', () => {
    const r = read(item('+219 to Armour'))!;
    expect(r.baseId).toBe('Helmets_str');
    expect(r.level).toBe(81);
    expect(r.rarity).toBe('rare');
    expect(r.problems).toEqual([]);
  });

  it('returns null for text that is not an item', () => {
    expect(read('hello')).toBeNull();
  });

  it('carries the fractured flag from the annotation onto the mod', () => {
    const r = read(item('+42% of Armour also applies to Elemental Damage (fractured)'))!;
    expect(itemModsFrom(r).suffixes).toEqual([
      { modId: 'Helmets_str/ArmourAppliesToElementalDamage', tierDisplay: 1, fractured: true },
    ]);
  });

  /** Tier numbers run best-first in every picker in the app; the engine's own run worst-first. */
  it('turns the tier name into the display number the pickers use', () => {
    const r = read(item('Adds 8 to 14 Physical Damage'), NO_CHOICES);
    const row = read(item('+219 to Armour'))!.rows[0]!;
    expect(row.tierDisplay).toBe(1);
    expect(r).not.toBeNull();
  });
});

describe('what it refuses to decide', () => {
  /** Three mods on this base carry this text. Leaving it off the item is the point: a guess here puts
   *  a mod on the item that the player does not hold. */
  it('leaves an undecidable mod unsettled, and off the item', () => {
    const r = read(item('16% increased Rarity of Items found'))!;
    expect(r.rows[0]!.modIds).toHaveLength(3);
    expect(r.rows[0]!.modId).toBeUndefined();
    expect(isSettled(r.rows[0]!)).toBe(false);
    expect(itemModsFrom(r)).toMatchObject({ prefixes: [], suffixes: [] });
  });

  it('settles it once the player answers, tier and all', () => {
    const text = item('16% increased Rarity of Items found');
    const key = read(text)!.rows[0]!.key;
    const r = read(text, { ...NO_CHOICES, modId: new Map([[key, 'Helmets_str/ItemFoundRarityIncreasePrefix']]) })!;
    expect(r.rows[0]!.tierDisplay).toBe(1);
    expect(itemModsFrom(r).prefixes).toEqual([
      { modId: 'Helmets_str/ItemFoundRarityIncreasePrefix', tierDisplay: 1 },
    ]);
  });

  /**
   * An answer left over from a previous paste must never put a mod on the item this text does not
   * mention. The choices outlive the text they were given for, so this is reachable by editing the
   * box rather than by anything exotic.
   */
  it('ignores an answer that is not one of this line’s candidates', () => {
    const text = item('16% increased Rarity of Items found');
    const key = read(text)!.rows[0]!.key;
    const r = read(text, { ...NO_CHOICES, modId: new Map([[key, 'Rings/ChaosResistance']]) })!;
    expect(r.rows[0]!.modId).toBeUndefined();
  });

  /** Two adjacent lines on a Bow are either one hybrid or two ordinary mods — see resolveMods. */
  it('offers the split reading, and takes it when asked', () => {
    const bow = item('188% increased Physical Damage\n+113 to Accuracy Rating',
      'Item Class: Bows\nRarity: Rare\nX Y\nHeavy Bow');
    const merged = read(bow)!;
    expect(merged.rows).toHaveLength(1);
    expect(merged.rows[0]!.canSplit).toBe(true);
    const split = read(bow, { ...NO_CHOICES, split: new Set([merged.rows[0]!.key]) })!;
    expect(split.rows.map((x) => x.modId)).toEqual([
      'Bows/LocalPhysicalDamagePercent', 'Bows/LocalAccuracyRating',
    ]);
  });
});

describe('what it will not let you craft', () => {
  it('refuses a unique', () => {
    const r = read(item('+219 to Armour', 'Item Class: Helmets\nRarity: Unique\nX\nMasked Greathelm'))!;
    expect(r.problems.join(' ')).toMatch(/Unique/);
  });

  it('refuses a corrupted item, which no currency can touch', () => {
    const r = read(`${item('+219 to Armour')}\n--------\nCorrupted`)!;
    expect(r.problems.join(' ')).toMatch(/Corrupted/);
  });

  /** A real pasted bow named a base 0.5.0 does not have. Saying so beats planning against whichever
   *  row happened to match. */
  it('says so when the base is not in the shipped patch', () => {
    const r = read(item('+219 to Armour', 'Item Class: Bows\nRarity: Rare\nX\nObliterator Bow'))!;
    expect(r.baseId).toBeUndefined();
    expect(r.problems.join(' ')).toMatch(/not a base in the 0\.5\.0 data/);
  });
});

describe('modifiers that are not craftable', () => {
  it('lists runes and implicits rather than putting them on the item', () => {
    const r = read(`${item('+219 to Armour')}\n--------\n+13% to Chaos Resistance (rune)\n--------\n+5 to Strength (implicit)`)!;
    expect(r.rows).toHaveLength(1);
    expect(r.skipped.map((s) => s.kind).sort()).toEqual(['implicit', 'rune']);
  });
});

describe('an advanced Ctrl+Alt+C paste', () => {
  const ADV = `Item Class: Crossbows
Rarity: Rare
Storm Core
Gemini Crossbow
--------
Item Level: 80
--------
{ Prefix Modifier "Razor-sharp" (Tier: 3) — Damage, Physical, Attack }
Adds 24(23-35) to 51(39-59) Physical Damage
{ Suffix Modifier "of Acclaim" (Tier: 1) — Attack, Speed }
18(17-19)% increased Attack Speed`;

  it('uses the stated tier, so nothing is left to answer', () => {
    const r = read(ADV)!;
    expect(r.advanced).toBe(true);
    expect(r.rows.every(isSettled)).toBe(true);
    expect(itemModsFrom(r)).toEqual({
      prefixes: [{ modId: 'Crossbows/LocalPhysicalDamage', tierDisplay: 3 }],
      suffixes: [{ modId: 'Crossbows/LocalIncreasedAttackSpeed', tierDisplay: 1 }],
      dropped: 0,
    });
  });

  /** The game's own "(Tier: 3)" and the display number derived from the tier NAME are two independent
   *  routes to the same answer. They agree, which is the licence for using the name. */
  it('agrees with the tier number the game printed', () => {
    expect(read(ADV)!.rows[0]!.tierDisplay).toBe(3);
  });
});

describe('more mods than a side can hold', () => {
  /**
   * Truncated rather than refused. An over-full side is almost always a grouping the player has yet
   * to answer, and throwing the whole paste away over it would hide the mods they could have kept.
   */
  it('truncates and says how many were left off', () => {
    const two = read(item('+219 to Armour\n97% increased Armour'))!;
    expect(two.rows.filter((r) => r.side === 'prefix' && isSettled(r))).toHaveLength(2);
    const out = itemModsFrom(two, 1);
    expect(out.prefixes).toHaveLength(1);
    expect(out.dropped).toBe(1);
  });

  /** `+30 to Spirit` is not a helmet modifier in 0.5.0, and saying nothing about it would be worse
   *  than leaving it off — the player needs to know we read a line and could not place it. */
  it('reports a line the base has no modifier for', () => {
    const r = read(item('+219 to Armour\n+30 to Spirit'))!;
    expect(r.unresolved).toEqual(['+30 to Spirit']);
  });
});

/**
 * Sanctification raises a modifier above what its tiers can roll (user ruling, 2026-09-09). Before
 * this, seven of the fifty-two modifier lines on a real endgame character read as "no tier fits" —
 * which is how a player's finest item looks to the app like an item it cannot read.
 */
describe('a Sanctified modifier', () => {
  it('is settled at the best tier and marked, rather than left needing an answer', () => {
    const r = read(item('+18% to all Elemental Resistances',
      'Item Class: Rings\nRarity: Rare\nX Y\nGold Ring'))!;
    const row = r.rows[0]!;
    expect(row.sanctified).toBe(true);
    expect(row.modId).toBe('Rings/AllResistances');
    expect(row.tierDisplay).toBe(1);
    expect(isSettled(row)).toBe(true);
    expect(itemModsFrom(r).suffixes).toEqual([{ modId: 'Rings/AllResistances', tierDisplay: 1 }]);
  });

  it('leaves an ordinary roll unmarked', () => {
    const r = read(item('+15% to all Elemental Resistances',
      'Item Class: Rings\nRarity: Rare\nX Y\nGold Ring'))!;
    expect(r.rows[0]!.sanctified).toBe(false);
    expect(r.rows[0]!.tierDisplay).toBe(1);
  });
});
