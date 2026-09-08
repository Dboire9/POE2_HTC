import { describe, it, expect } from 'vitest';
import { parseItemText, linesOfKind } from './parseItem.ts';
import { loadPatch } from './loadPatch.ts';
import { baseNameIndex, findBaseInName } from './baseLookup.ts';
import { resolveMods } from './resolveMods.ts';

/**
 * The fixtures are REAL items, pasted by players into bug reports against Exiled Exchange 2
 * (Kvan7/Exiled-Exchange-2 issues #797, #856, #686). They are not written from PoE1 habit: `Sockets:`,
 * the `(rune)` and `(desecrated)` annotations and the `109(100-119)%` value-with-range are all PoE2's
 * own, and a parser written from memory of PoE1 would have got each of them wrong.
 */

/** Ctrl+C, a fractured and desecrated rare bow with a rune and an implicit. (issue #797) */
const PLAIN = `Item Class: Bows
Rarity: Rare
Miracle Siege
Obliterator Bow
--------
Quality: +23% (augmented)
Physical Damage: 375-693 (augmented)
Critical Hit Chance: 9.40% (augmented)
Attacks per Second: 1.15
--------
Requires: Level 78, 163 (unmet) Dex
--------
Sockets: S S 
--------
Item Level: 81
--------
36% increased Physical Damage (rune)
--------
50% reduced Projectile Range (implicit)
--------
Adds 32 to 59 Physical Damage (fractured)
188% increased Physical Damage
+113 to Accuracy Rating
+3 to Level of all Attack Skills
20% chance to gain Onslaught on Killing Hits with this Weapon
+4.4% to Critical Hit Chance (desecrated)
--------
Fractured Item`;

/** Ctrl+Alt+C, the same game, showing the modifier headers and value ranges. (issue #856) */
const ADVANCED = `Item Class: Crossbows
Rarity: Rare
Storm Core
Gemini Crossbow
--------
Quality: +20% (augmented)
Physical Damage: 74-231 (augmented)
--------
Requires: Level 78, 89 Str, 89 Dex
--------
Sockets: S S 
--------
Item Level: 80
--------
45% increased Elemental Damage with Attacks (enchant)
--------
18% increased Physical Damage (rune)
Gain 24 Mana per enemy killed (rune)
--------
{ Implicit Modifier — Attack }
Loads an additional bolt
--------
{ Prefix Modifier "Electrocuting" (Tier: 2) — Damage, Elemental, Lightning, Attack }
Adds 10(1-16) to 273(239-300) Lightning Damage
{ Prefix Modifier "Razor-sharp" (Tier: 3) — Damage, Physical, Attack }
Adds 24(23-35) to 51(39-59) Physical Damage
{ Suffix Modifier "of Acclaim" (Tier: 1) — Attack, Speed }
18(17-19)% increased Attack Speed
--------
Corrupted`;

describe('the header', () => {
  it('reads the class, rarity, name and base off a plain paste', () => {
    const p = parseItemText(PLAIN)!;
    expect(p.itemClass).toBe('Bows');
    expect(p.rarity).toBe('rare');
    expect(p.nameLines).toEqual(['Miracle Siege', 'Obliterator Bow']);
    expect(p.itemLevel).toBe(81);
    expect(p.quality).toBe(23);
  });

  it('notices Corrupted, and does not invent it', () => {
    expect(parseItemText(ADVANCED)!.corrupted).toBe(true);
    expect(parseItemText(PLAIN)!.corrupted).toBe(false);
  });

  /** A paste box gets whatever was on the clipboard. Guessing at arbitrary text is worse than
   *  refusing it, so the one line every item has and nothing else does is what gates this. */
  it('returns null for text that is not an item', () => {
    expect(parseItemText('')).toBeNull();
    expect(parseItemText('just some text\nover two lines')).toBeNull();
    expect(parseItemText('Item Class: Bows\nno rarity line here')).toBeNull();
  });
});

describe('a plain Ctrl+C paste', () => {
  const p = parseItemText(PLAIN)!;

  it('is not mistaken for an advanced one', () => {
    expect(p.advanced).toBe(false);
  });

  /** Runes, enchants and implicits are not craftable. Sorting them out here is what stops a caller
   *  handing the planner a target no orb can produce. */
  it('separates the rune and implicit from the explicit modifiers', () => {
    expect(linesOfKind(p, 'rune')).toEqual(['36% increased Physical Damage']);
    expect(linesOfKind(p, 'implicit')).toEqual(['50% reduced Projectile Range']);
    expect(linesOfKind(p, 'explicit')).toHaveLength(6);
  });

  it('strips the annotation from the line but keeps what it meant', () => {
    const frac = p.mods.find((m) => m.fractured);
    expect(frac?.lines).toEqual(['Adds 32 to 59 Physical Damage']);
    expect(frac?.kind).toBe('explicit');
    const des = p.mods.find((m) => m.desecrated);
    expect(des?.lines).toEqual(['+4.4% to Critical Hit Chance']);
    expect(des?.kind).toBe('explicit');
  });

  it('flags exactly one modifier each way, not the whole section', () => {
    expect(p.mods.filter((m) => m.fractured)).toHaveLength(1);
    expect(p.mods.filter((m) => m.desecrated)).toHaveLength(1);
  });

  /** `Sockets:`, `Requires:` and the damage lines are properties, not modifiers — and `Attacks per
   *  Second: 1.15` would read as a plausible modifier line if the property rule were missing. */
  it('does not read a property line as a modifier', () => {
    const all = p.mods.flatMap((m) => m.lines).join('\n');
    expect(all).not.toMatch(/Sockets|Requires|Attacks per Second|Quality/);
  });
});

describe('an advanced Ctrl+Alt+C paste', () => {
  const p = parseItemText(ADVANCED)!;

  it('knows it is advanced', () => {
    expect(p.advanced).toBe(true);
  });

  /**
   * The whole point of asking for this format. The side and the tier name settle what the printed
   * line cannot — and the tier name is spelled exactly as `Tier.name` spells it.
   */
  it('reads the affix side and the tier name off the modifier header', () => {
    const explicit = p.mods.filter((m) => m.kind === 'explicit');
    expect(explicit.map((m) => [m.side, m.tierName])).toEqual([
      ['prefix', 'Electrocuting'],
      ['prefix', 'Razor-sharp'],
      ['suffix', 'of Acclaim'],
    ]);
  });

  /** `Adds 10(1-16) to 273(239-300)` — the roll, then the tier's range. Only the roll is the item. */
  it('strips the range hint back to the value that actually rolled', () => {
    expect(linesOfKind(p, 'explicit')).toEqual([
      'Adds 10 to 273 Lightning Damage',
      'Adds 24 to 51 Physical Damage',
      '18% increased Attack Speed',
    ]);
  });

  it('takes the implicit from its header, not from an annotation', () => {
    expect(linesOfKind(p, 'implicit')).toEqual(['Loads an additional bolt']);
  });

  /** Issue #856 exists because these lines carry no braces even in advanced mode. */
  it('still reads annotated lines that the advanced format leaves unbraced', () => {
    expect(linesOfKind(p, 'enchant')).toEqual(['45% increased Elemental Damage with Attacks']);
    expect(linesOfKind(p, 'rune')).toHaveLength(2);
  });
});

describe('finding the base inside a name', () => {
  const data = loadPatch('data/patches/0.5.0');
  const index = baseNameIndex(data);

  /** A Rare prints its base on a line of its own, so the search finds the whole line — one function
   *  serves every rarity and a caller never has to branch on it. */
  it('reads the base off the last name line of a rare', () => {
    const p = parseItemText(ADVANCED)!;
    expect(p.nameLines.at(-1)).toBe('Gemini Crossbow');
    expect(findBaseInName(index, p.nameLines.at(-1)!).id).toBe('Crossbows');
  });

  /** A Magic item has no base line — the base is wrapped in the words its affixes contribute. */
  it('digs the base out of a magic item name', () => {
    expect(findBaseInName(index, 'Fine Heavy Bow of the Wind').id).toBe('Bows');
    expect(findBaseInName(index, 'Glinting Gemini Crossbow of the Prism').id).toBe('Crossbows');
  });

  /**
   * The pasted bow is REAL and its base does not exist in the 0.5.0 data this app ships — the item
   * comes from a later patch. Finding nothing is the right answer, and a UI has to say so rather than
   * plan a craft against whichever row happened to match.
   */
  it('finds nothing for a base the shipped patch does not have', () => {
    expect(findBaseInName(index, 'Obliterator Bow').id).toBeUndefined();
    expect(findBaseInName(index, 'Obliterator Bow').ids).toEqual([]);
  });

  /**
   * Longest match, and it is load-bearing across item CATEGORIES rather than a nicety. `Ring` is a
   * jewellery base and `Ring Mail` is a body armour, so a shortest-first search reads a magic Ring
   * Mail as a ring — and then plans the craft against the wrong pool entirely, with nothing on screen
   * to say so. 26 of the 529 shipped names sit inside another name this way.
   */
  it('prefers the longest name, so Ring Mail is not read as a Ring', () => {
    expect(findBaseInName(index, 'Ring Mail').id).toBe('Body_Armours_str_dex');
    expect(findBaseInName(index, 'Fine Ring Mail of the Bear').id).toBe('Body_Armours_str_dex');
    expect(findBaseInName(index, 'Fine Ring of the Bear').id).toBe('Rings');
  });

  it('finds nothing in a name that holds no base', () => {
    expect(findBaseInName(index, 'Some Words With No Base In Them').id).toBeUndefined();
  });
});

/**
 * The whole path, end to end: clipboard text in, mod ids and tiers out. This is the assertion that
 * the three modules compose — each is tested on its own, and none of those tests would catch a
 * mismatch at the seams between them.
 */
describe('clipboard text through to mod ids', () => {
  const data = loadPatch('data/patches/0.5.0');
  const index = baseNameIndex(data);

  /** The bow's own base is not in 0.5.0 (see above), so this pins the MODIFIERS against the row that
   *  does exist — which is the half this test is about. */
  it('resolves every explicit modifier of a real pasted bow', () => {
    const p = parseItemText(PLAIN)!;
    const r = resolveMods(data, data.bases.get('Bows')!, linesOfKind(p, 'explicit'), { level: p.itemLevel! });
    expect(r.unresolved).toEqual([]);
    expect(r.resolved.every((x) => x.modId !== undefined)).toBe(true);
    // Six printed lines, five modifiers: the window read the phys%/accuracy pair as one hybrid — and
    // flagged that it also reads as two, which is the honest answer on this base.
    expect(r.resolved).toHaveLength(5);
    expect(r.resolved.filter((x) => x.alternative).map((x) => x.lines)).toEqual([
      ['188% increased Physical Damage', '+113 to Accuracy Rating'],
    ]);
  });

  /** The advanced paste's own answer must agree with the one the roll implies. Two independent
   *  routes to the same tier — if they disagreed, one of them would be wrong. */
  it('agrees with the tier the advanced paste states', () => {
    const p = parseItemText(ADVANCED)!;
    const base = data.bases.get(findBaseInName(index, p.nameLines.at(-1)!).id!)!;
    const explicit = p.mods.filter((m) => m.kind === 'explicit');
    const r = resolveMods(data, base, linesOfKind(p, 'explicit'), { level: p.itemLevel! });
    expect(r.unresolved).toEqual([]);
    for (const [i, row] of r.resolved.entries()) {
      const stated = explicit[i]!.tierName!;
      expect(row.tierNames).toContain(stated);
      const mod = data.mods.get(row.modId!)!;
      expect(mod.type).toBe(explicit[i]!.side);
    }
  });
});
