import { describe, it, expect } from 'vitest';
import { loadPatch } from './loadPatch.ts';
import { resolveMods, linesOf } from './resolveMods.ts';
import type { ItemBase, Tier } from './types.ts';

const data = loadPatch('data/patches/0.5.0');
const base = (id: string): ItemBase => {
  const b = data.bases.get(id);
  if (!b) throw new Error(`no such base in the shipped data: ${id}`);
  return b;
};
const one = (id: string, lines: string[], level?: number) =>
  resolveMods(data, base(id), lines, level === undefined ? {} : { level });

describe('reading a printed modifier line', () => {
  // The line that started this: fubgun's helmet, straight off poe.ninja with the markup stripped.
  it('resolves a line to its mod and pins the tier from the roll', () => {
    const r = one('Helmets_str', ['+42% of Armour also applies to Elemental Damage']);
    expect(r.unresolved).toEqual([]);
    expect(r.resolved).toHaveLength(1);
    expect(r.resolved[0]!.modId).toBe('Helmets_str/ArmourAppliesToElementalDamage');
    expect(r.resolved[0]!.values).toEqual([42]);
    expect(r.resolved[0]!.tierName).toBeDefined();
  });

  it('reads several lines as several mods, in printed order', () => {
    const r = one('Helmets_str', [
      '+219 to Armour',
      '16% increased Rarity of Items found',
    ]);
    expect(r.resolved.map((x) => x.values)).toEqual([[219], [16]]);
  });

  it('ignores blank lines rather than counting them as unresolved', () => {
    expect(one('Helmets_str', ['', '  ', '+219 to Armour']).unresolved).toEqual([]);
  });
});

/**
 * The hybrid case, which is the whole reason this reads a WINDOW of lines rather than one at a time.
 *
 * `Boots_str_dex` has no flat `+# to Armour` mod and no flat `+# to Evasion Rating` mod — it has one
 * modifier that prints as both lines. A line-at-a-time reader finds neither and reports two failures
 * on an item that is perfectly ordinary.
 */
describe('a modifier the game prints across two lines', () => {
  it('reads the two lines as the one hybrid mod they are', () => {
    const r = one('Boots_str_dex', ['+80 to Armour', '+70 to Evasion Rating']);
    expect(r.unresolved).toEqual([]);
    expect(r.resolved).toHaveLength(1);
    expect(r.resolved[0]!.modId).toBe('Boots_str_dex/LocalBaseArmourAndEvasionRating');
    expect(r.resolved[0]!.values).toEqual([80, 70]);
    expect(r.resolved[0]!.lines).toEqual(['+80 to Armour', '+70 to Evasion Rating']);
  });

  it('does not resolve either half on its own, because neither half is a mod', () => {
    expect(one('Boots_str_dex', ['+80 to Armour']).resolved).toEqual([]);
  });

  /**
   * The grouping itself can be undecidable, and that is not a corner case — it turned up on the first
   * real player item tested. `Bows` carries the hybrid AND a standalone mod for each half, so two
   * adjacent lines are either one mod or two, and nothing in the text says which.
   */
  it('reports the split reading when the same lines also read as two separate mods', () => {
    const r = one('Bows', ['188% increased Physical Damage', '+113 to Accuracy Rating']);
    expect(r.resolved).toHaveLength(1);
    expect(r.resolved[0]!.modId).toBe('Bows/LocalIncreasedPhysicalDamagePercentAndAccuracyRating');
    expect(r.resolved[0]!.alternative?.map((a) => a.modId))
      .toEqual(['Bows/LocalPhysicalDamagePercent', 'Bows/LocalAccuracyRating']);
  });

  /** Where the halves are not mods of their own the hybrid is the only reading, and saying "this
   *  might be two mods" there would be noise a caller has to learn to ignore. */
  it('offers no alternative where neither half is a mod on its own', () => {
    const r = one('Boots_str_dex', ['+80 to Armour', '+70 to Evasion Rating']);
    expect(r.resolved[0]!.alternative).toBeUndefined();
  });

  it('never offers an alternative for a single line', () => {
    const r = one('Helmets_str', ['+219 to Armour']);
    expect(r.resolved[0]!.alternative).toBeUndefined();
  });

  it('counts the printed lines of a mod', () => {
    expect(linesOf(data.mods.get('Boots_str_dex/LocalBaseArmourAndEvasionRating')!)).toBe(2);
    expect(linesOf(data.mods.get('Helmets_str/ArmourAppliesToElementalDamage')!)).toBe(1);
  });
});

describe('picking between candidates', () => {
  /**
   * A normal roll and its essence twin print identically at a value both allow. Nothing on the item
   * records which currency placed it, so this is a stated preference and not a deduction — but the
   * essence twin stays in `modIds`, so a caller can see what the choice was between.
   */
  it('prefers the normal mod over an essence twin, and still lists the twin', () => {
    const r = one('Amulets', ['+30% to Chaos Resistance']);
    expect(r.resolved[0]!.modId).toBe('Amulets/ChaosResistance');
    expect(r.resolved[0]!.modIds).toContain('Amulets/Essence_ChaosResistance');
  });

  /**
   * Three shipped mods carry this text with the SAME range. The line cannot tell them apart, and
   * neither can this — so it says so rather than picking the first, which would silently plan against
   * a mod the item does not have.
   */
  it('resolves to none, and names all three, when the data itself is ambiguous', () => {
    const r = one('Amulets', ['9% increased Strength, Dexterity or Intelligence']);
    expect(r.resolved[0]!.modId).toBeUndefined();
    expect(r.resolved[0]!.modIds).toEqual([
      'Amulets/PerfectEssence_PercentageStrength',
      'Amulets/PerfectEssence_PercentageDexterity',
      'Amulets/PerfectEssence_PercentageIntelligence',
    ]);
  });

  /** Two NORMAL mods, one prefix and one suffix, same text. No preference can settle this one. */
  it('leaves a prefix/suffix pair of the same text undecided', () => {
    const r = one('Amulets', ['9% increased Rarity of Items found']);
    expect(r.resolved[0]!.modId).toBeUndefined();
    expect(r.resolved[0]!.modIds).toEqual(expect.arrayContaining([
      'Amulets/ItemFoundRarityIncreasePrefix', 'Amulets/ItemFoundRarityIncrease',
    ]));
  });

  /** The roll is evidence. The prefix tops out at [16,19] and the suffix at [15,18], so a 19 can
   *  only have come from the prefix — and that settles a line no preference could. */
  it('uses the roll to rule out a candidate whose ranges cannot produce it', () => {
    const r = one('Amulets', ['19% increased Rarity of Items found']);
    expect(r.resolved[0]!.modIds).not.toContain('Amulets/ItemFoundRarityIncrease');
    expect(r.resolved[0]!.modId).toBe('Amulets/ItemFoundRarityIncreasePrefix');
  });
});

describe('pinning the tier', () => {
  it('names every tier the roll allows when the ranges overlap', () => {
    // Bows/LocalPhysicalDamage: Polished [[6,9],[11,16]] and Honed [[8,12],[14,21]] both hold 8/14.
    const r = one('Bows', ['Adds 8 to 14 Physical Damage']);
    expect(r.resolved[0]!.modId).toBe('Bows/LocalPhysicalDamage');
    expect(r.resolved[0]!.tierNames).toEqual(['Polished', 'Honed']);
    expect(r.resolved[0]!.tierName).toBeUndefined();
  });

  it('reads a fractional roll, which is what separates two crit tiers', () => {
    // Lesser Essence of Seeking [1.51,2.1] vs Essence of Seeking [2.11,2.7]. The game prints one
    // decimal, and dropping it collapses the two.
    expect(one('Bows', ['+2.5% to Critical Hit Chance']).resolved[0]!.tierName)
      .toBe('Essence of Seeking');
    expect(one('Bows', ['+2.0% to Critical Hit Chance']).resolved[0]!.tierName)
      .toBe('Lesser Essence of Seeking');
  });

  it('drops tiers the item level could not have rolled', () => {
    const low = one('Bows', ['Adds 8 to 14 Physical Damage'], 20);
    expect(low.resolved[0]!.tierNames).toEqual(['Polished']);   // Honed is ilvl 33
    expect(low.resolved[0]!.tierName).toBe('Polished');
  });

  /**
   * `#% reduced Flask Charges used` stores its range as `[-13,-11]` while the game prints `12` — the
   * wording carries the sign. Comparing the raw value would reject every roll of it.
   */
  it('matches a "reduced" mod whose stored range is negative', () => {
    const r = one('Belts', ['12% reduced Flask Charges used']);
    expect(r.unresolved).toEqual([]);
    expect(r.resolved[0]!.modId).toBe('Belts/BeltReducedFlaskChargesUsed');
    expect(r.resolved[0]!.tierName).toBeDefined();
  });

  /**
   * `Loads an additional bolt` prints no number at all, yet stores a range for each of its two tiers.
   * An unnumbered line is no evidence about the tier — it must not be read as evidence against every
   * tier, which would claim the mod could not exist.
   */
  it('keeps every tier of a mod whose printed line carries no number', () => {
    const r = one('Crossbows', ['Loads an additional bolt']);
    expect(r.resolved[0]!.modId).toBe('Crossbows/AdditionalAmmo');
    expect(r.resolved[0]!.tierNames).toEqual(['of Shelling', 'of Bursting']);
  });
});

/**
 * Ten shipped texts bake a roll in as a literal — `Adds 1 to # Lightning Damage` carries ranges
 * `[[1,3],[55,60]]`, so that `1` is a real roll the template renders as fixed. A matcher that
 * insisted on a literal `1` would refuse every bow that rolled anything else.
 */
describe('a template with a roll baked in as a literal', () => {
  it('matches a line whose first number is not the literal in the template', () => {
    // Named explicitly: `Bows/LocalLightningDamage` is the mod whose text bakes the `1` in. An
    // essence mod on the same base prints the same shape with two `#`, so asserting only that the
    // line resolved would pass even with the literal left literal.
    const r = one('Bows', ['Adds 3 to 58 Lightning Damage']);
    expect(r.unresolved).toEqual([]);
    expect(data.mods.get('Bows/LocalLightningDamage')?.text).toBe('Adds 1 to # Lightning Damage');
    expect(r.resolved[0]!.modIds).toContain('Bows/LocalLightningDamage');
    expect(r.resolved[0]!.values).toEqual([3, 58]);
  });

  /**
   * The opposite risk, and the reason the two cannot be told apart by inspection: `further than 6m`
   * is prose, not a roll, and the same rule has to leave it alone. It does, because the line prints
   * the number straight back — so treating it as a placeholder matches it against itself.
   */
  it('still matches a number that is part of the wording', () => {
    const r = one('Bows', ['Projectiles have 30% increased Critical Hit Chance against Enemies further than 6m']);
    expect(r.unresolved).toEqual([]);
    expect(r.resolved[0]!.modId).toBe('Bows/Desecrated_CriticalStrikeChanceIncrease');
    expect(r.resolved[0]!.values).toEqual([30, 6]);
  });
});

describe('lines that are not craftable mods', () => {
  /**
   * Runes, enchants and corruption implicits are in no pool. Landing in `unresolved` is the CORRECT
   * answer for them: a caller must not hand them to the planner as targets, because no orb can
   * produce them and it would be asked for a craft that cannot exist.
   */
  it('leaves a rune modifier unresolved rather than inventing a mod for it', () => {
    const r = one('Helmets_str', ['+13% to Chaos Resistance', 'Nonsense Modifier Of Nothing']);
    expect(r.unresolved).toEqual([{ line: 'Nonsense Modifier Of Nothing' }]);
    expect(r.resolved).toHaveLength(1);
  });

  it('does not let one unreadable line swallow the ones after it', () => {
    const r = one('Helmets_str', ['Nonsense', '+219 to Armour', 'More Nonsense']);
    expect(r.resolved).toHaveLength(1);
    expect(r.unresolved.map((u) => u.line)).toEqual(['Nonsense', 'More Nonsense']);
  });

  it('resolves nothing against a base whose pools do not hold the mod', () => {
    expect(one('Rings', ['+42% of Armour also applies to Elemental Damage']).resolved).toEqual([]);
  });
});

/**
 * The whole shipped data, round-tripped: render every mod at every tier the way the game prints it,
 * on every base that carries it, and read it back.
 *
 * This is the test that makes the module trustworthy rather than plausible. It is 9,700-odd lines and
 * it asserts the ONE thing that admits no fudge — that the mod which produced a line is always among
 * the candidates for it. It cannot assert a unique answer, because the data is genuinely ambiguous in
 * places (see the cases above), and an assertion that pretended otherwise would have to be weakened
 * the first time it met real data.
 */
describe('every shipped mod, rendered and read back', () => {
  /** Render a tier the way the game would: mid of each range, magnitude only — the wording carries
   *  the sign. Every token draws a range when the counts line up (`Adds 1 to #` stores two); else
   *  only the `#`s do, and a baked-in number is prose. */
  const render = (text: string, ranges: Tier['ranges']): string => {
    const toks = [...text.matchAll(/[+-]?(?:#|\d+(?:\.\d+)?)/g)];
    const positional = toks.length === ranges.length;
    let out = '';
    let last = 0;
    let next = 0;
    toks.forEach((t, i) => {
      const range = ranges[positional ? i : (t[0].includes('#') ? next++ : -1)];
      const mid = range === undefined ? undefined : Math.abs((Math.min(...range) + Math.max(...range)) / 2);
      out += text.slice(last, t.index) + (mid === undefined ? t[0] : `${t[0].startsWith('+') ? '+' : ''}${mid}`);
      last = t.index + t[0].length;
    });
    return out + text.slice(last);
  };

  it('always lists the mod that produced the line among the candidates', () => {
    let checked = 0;
    const failures: string[] = [];
    for (const b of data.bases.values()) {
      const ids = new Set([
        ...b.pools.normal.prefixes, ...b.pools.normal.suffixes,
        ...b.pools.desecrated.prefixes, ...b.pools.desecrated.suffixes,
        ...b.pools.essence.prefixes, ...b.pools.essence.suffixes,
      ]);
      for (const id of ids) {
        const mod = data.mods.get(id)!;
        if (mod.text === null) continue;
        for (const tier of mod.tiers.length > 0 ? mod.tiers : [{ ranges: [] } as unknown as Tier]) {
          const line = render(mod.text, tier.ranges);
          const r = resolveMods(data, b, line.split('\n'));
          checked++;
          const row = r.resolved[0];
          if (r.unresolved.length > 0 || !row?.modIds.includes(id)) {
            if (failures.length < 5) failures.push(`${b.id} ${id} :: ${JSON.stringify(line)} -> ${row?.modIds.join('|') ?? 'UNRESOLVED'}`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
    expect(checked).toBeGreaterThan(9000);
  });
});
