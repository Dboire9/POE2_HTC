import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch, loadShippedPatch } from './loadPatch.ts';
import { runeRoute, runeOpportunity, runeOpportunities, gainAsExtraByElement } from './runeConvert.ts';
import { runePriceKey } from './runes.ts';
import { itemFamilies, resolveMod } from './pool.ts';
import { statsOf } from './statLookup.ts';
import type { ItemBase, ItemState, Mod, PatchData } from './types.ts';

const data = loadPatch('data/patches/0.5.0');
const base = (id: string): ItemBase => {
  const b = data.bases.get(id);
  if (!b) throw new Error(`no such base: ${id}`);
  return b;
};
/** Plain targets, one position each — how a list with no alternatives looks. */
const ids = (list: readonly string[]) => list.map((modId) => ({ modId }));

describe('the gain-as-extra family on a base', () => {
  /** Read off the text (`…as Extra Fire Damage`), never a hardcoded list, so a new element in a future
   *  patch needs no code change. */
  it('finds all three elements on a Staff', () => {
    expect([...gainAsExtraByElement(data, base('Staves'))].sort()).toEqual([
      ['cold', 'Staves/DamageGainedAsCold'],
      ['fire', 'Staves/DamageGainedAsFire'],
      ['lightning', 'Staves/DamageGainedAsLightning'],
    ]);
  });

  it('finds none on a base that cannot roll them', () => {
    expect(gainAsExtraByElement(data, base('Rings')).size).toBe(0);
  });
});

describe('stacking a modifier the family rules allow only once', () => {
  const staff = base('Staves');

  /**
   * The route a real staff was built by: two `Gain as Extra Fire` modifiers, which no item may hold,
   * reached by rolling fire AND cold and socketing the rune that converts every one of them to fire.
   */
  it('turns "two of one mod" into two DIFFERENT elements plus a rune', () => {
    const r = runeRoute(data, staff, 'Staves/DamageGainedAsFire', 2);
    // The second copy is EITHER sibling — the rune converts both, so naming one would throw away every
    // roll that lands the other.
    expect(r?.slots).toEqual([
      ['Staves/DamageGainedAsFire'],
      ['Staves/DamageGainedAsCold', 'Staves/DamageGainedAsLightning'],
    ]);
    expect(r?.rune).toBe('passion-of-aldur');
    expect(r?.element).toBe('fire');
  });

  it('stacks all three, which is as many as the base can roll', () => {
    // Every sibling is needed, so there is nothing to choose between.
    expect(runeRoute(data, staff, 'Staves/DamageGainedAsFire', 3)?.slots).toEqual([
      ['Staves/DamageGainedAsFire'], ['Staves/DamageGainedAsCold'], ['Staves/DamageGainedAsLightning'],
    ]);
  });

  /**
   * THE POINT OF THE WHOLE DESIGN: what the planner is asked to craft is cross-family, so nothing in
   * the engine has to bend. If this ever failed, the route would be asking for an item the game
   * forbids and every probability computed for it would be meaningless.
   */
  it('asks for targets that can genuinely coexist on one item', () => {
    const targets = runeRoute(data, staff, 'Staves/DamageGainedAsFire', 3)!.slots.flat();
    const item: ItemState = {
      base: staff, level: 82, rarity: 'rare',
      prefixes: targets.map((modId) => ({ modId, tierName: data.mods.get(modId)!.tiers.at(-1)!.name })),
      suffixes: [],
    };
    // One family each, none shared: exactly what family exclusion demands.
    expect(itemFamilies(data, item).size).toBe(targets.length);
  });

  it('prices the rune under a key that cannot collide with a currency', () => {
    const key = runePriceKey('passion-of-aldur');
    expect(key).toBe('rune:passion-of-aldur');
    const prices = JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8')) as {
      prices: Record<string, number>;
    };
    // `stepCost` charges 0 for a missing key, so an unpriced rune would be FREE and would dominate
    // every frontier it could reach. The key has to be on the sheet before anything prices a step.
    expect(prices.prices[key]).toBeGreaterThan(0);
  });
});

describe('when there is no route, it says so rather than improvising', () => {
  it('declines a single copy, which is an ordinary craft', () => {
    expect(runeRoute(data, base('Staves'), 'Staves/DamageGainedAsFire', 1)).toBeUndefined();
  });

  it('declines more copies than the base has elements', () => {
    expect(runeRoute(data, base('Staves'), 'Staves/DamageGainedAsFire', 4)).toBeUndefined();
  });

  it('declines a mod that is not a gain-as-extra one', () => {
    expect(runeRoute(data, base('Staves'), 'Staves/Intelligence', 2)).toBeUndefined();
  });

  /**
   * Cold and lightning have routes of their own now. Every Aldur rune's element is named by the game
   * data (`RuneConvertCold`: "transforms all Fire and Lightning modifiers to equivalent Cold
   * modifiers"), where before only fire was traced and this declined the other two rather than guess.
   */
  it('routes cold and lightning through their own runes', () => {
    expect(runeRoute(data, base('Staves'), 'Staves/DamageGainedAsCold', 2)?.rune).toBe('breath-of-aldur');
    expect(runeRoute(data, base('Staves'), 'Staves/DamageGainedAsLightning', 2)?.rune).toBe('ire-of-aldur');
  });

  /** …and an element no rune makes still declines rather than improvising one. */
  it('declines an element no rune produces', () => {
    const phys: Mod = {
      id: 'P/Phys', source: 'normal', type: 'prefix', family: 'PhysExtra', tags: [],
      text: 'Gain #% of Damage as Extra Physical Damage',
      tiers: [{ name: 't1', ilvl: 1, weight: 100, ranges: [] }],
    };
    const fire: Mod = { ...phys, id: 'P/Fire', family: 'FireExtra', text: 'Gain #% of Damage as Extra Fire Damage' };
    const synthetic: ItemBase = {
      id: 'P', name: 'P', category: 'C',
      pools: {
        normal: { prefixes: ['P/Phys', 'P/Fire'], suffixes: [] },
        desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] },
      },
    };
    const d: PatchData = {
      patch: 't', mods: new Map([[phys.id, phys], [fire.id, fire]]), bases: new Map([[synthetic.id, synthetic]]),
    };
    expect(runeRoute(d, synthetic, 'P/Phys', 2)).toBeUndefined();
  });
});

describe('what the plan must tell the player', () => {
  /** Neither cost is in the plan's arithmetic, so the words are the only place they exist. */
  it('names the socket it spends and the conversion it forces', () => {
    const r = runeRoute(data, base('Staves'), 'Staves/DamageGainedAsFire', 2)!;
    expect(r.caveat).toMatch(/rune socket/);
    expect(r.caveat).toMatch(/EVERY/);
  });
});

/**
 * The half a player actually meets. Nothing forbids asking for Extra Fire AND Extra Cold — they are
 * different families and the picker has always allowed it — so the gap was never permission. It was
 * that nobody would think to, and that the plan then never mentions the rune it needs at the end.
 */
describe('spotting the rune for a target list already chosen', () => {
  const staff = base('Staves');

  it('offers it once two of them are on the list', () => {
    const o = runeOpportunity(data, staff, ids(['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold']));
    expect(o?.rune).toBe('passion-of-aldur');
    expect(o?.element).toBe('fire');
    expect([...(o?.elements ?? [])].sort()).toEqual(["cold", "fire"]);
  });

  /**
   * With every Aldur rune named, the one to show is the one that costs the player least: an element
   * they already asked for. Fusing Cold and Lightning into lightning keeps the lightning they chose;
   * into fire it would keep neither.
   */
  it('prefers a rune whose element is already among the targets', () => {
    const o = runeOpportunity(data, staff, ids(['Staves/DamageGainedAsCold', 'Staves/DamageGainedAsLightning']));
    expect(o?.rune).toBe('ire-of-aldur');
    expect(o?.elements).toContain(o?.element);
    expect(o?.caveat).toMatch(/including any you meant to keep/);
  });

  /** …and the others stay on offer, because which element to end on is the player's call. */
  it('lists every rune the base can use', () => {
    const all = runeOpportunities(data, staff, ids(['Staves/DamageGainedAsCold', 'Staves/DamageGainedAsLightning']));
    expect(all.map((o) => o.rune)).toEqual(['passion-of-aldur', 'ire-of-aldur', 'breath-of-aldur']);
    // Betrayal of Aldur makes chaos, which no base ROLLS as a gain-as-extra sibling — offering it
    // would describe an item nobody can build.
    expect(all.map((o) => o.element)).not.toContain('chaos');
  });

  it('says nothing for a single one, since there is nothing to fuse', () => {
    expect(runeOpportunity(data, staff, ids(['Staves/DamageGainedAsFire']))).toBeUndefined();
  });

  it('says nothing for targets that are not gain-as-extra mods', () => {
    expect(runeOpportunity(data, staff, ids(['Staves/Intelligence', 'Staves/WeaponSpellDamage']))).toBeUndefined();
  });

  /** A duplicate id is one modifier, not two — the list must not be fooled into offering a fusion of
   *  something with itself. */
  it('does not count the same target twice', () => {
    expect(runeOpportunity(data, staff, ids(['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsFire'])))
      .toBeUndefined();
  });

  it('says nothing on a base that cannot roll them', () => {
    expect(runeOpportunity(data, base('Rings'), ids(['Rings/AllResistances', 'Rings/ChaosResistance'])))
      .toBeUndefined();
  });

  /** Alternatives fill ONE place on the item, so they fuse as one modifier — Fire beside "Cold or
   *  Lightning" is two, and saying three would describe an item that cannot exist. */
  it('counts a slot of alternatives once', () => {
    const o = runeOpportunity(data, staff, [
      { modId: 'Staves/DamageGainedAsFire' },
      { modId: 'Staves/DamageGainedAsCold', slot: 0 },
      { modId: 'Staves/DamageGainedAsLightning', slot: 0 },
    ]);
    expect(o?.count).toBe(2);
  });

  it('says nothing for one slot of alternatives alone, since only one of them lands', () => {
    expect(runeOpportunity(data, staff, [
      { modId: 'Staves/DamageGainedAsCold', slot: 0 },
      { modId: 'Staves/DamageGainedAsLightning', slot: 0 },
    ])).toBeUndefined();
  });
});

/**
 * The browser's copy of the data, not the file on disk. `tiers[].stats` is stripped from what the app
 * downloads, and this module used to read the stat ids — so the route was found in every test and
 * nowhere in the app: fubgun's Aldur staff went to the Lab as five modifiers, and no rune was mentioned.
 */
describe('on the data the browser downloads', () => {
  const shipped = loadShippedPatch('data/patches/0.5.0');
  const staves = shipped.bases.get('Staves')!;

  it('finds the same siblings as the full file, and the same route', () => {
    expect([...gainAsExtraByElement(shipped, staves)]).toEqual([...gainAsExtraByElement(data, base('Staves'))]);
    expect(runeRoute(shipped, staves, 'Staves/DamageGainedAsFire', 2)?.slots)
      .toEqual([['Staves/DamageGainedAsFire'], ['Staves/DamageGainedAsCold', 'Staves/DamageGainedAsLightning']]);
  });

  it('still offers the rune for a target list holding two of them', () => {
    expect(runeOpportunity(shipped, staves, ids(['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold']))?.rune)
      .toBe('passion-of-aldur');
  });
});

/**
 * Text in place of the stat id must name exactly the same modifiers, or the fix changed what a route may
 * use. Checked on every base against the stat ids the full file still carries — a carved or essence
 * "gain as extra" line would show up here, since those have text and no stats.
 */
describe('text in place of the stat id', () => {
  it('names exactly the modifiers the stat ids name, on every base', () => {
    const STAT = /_to_gain_as_([a-z]+)$/;
    for (const b of data.bases.values()) {
      const byStat = new Map<string, string>();
      for (const pool of [b.pools.normal, b.pools.desecrated, b.pools.essence]) {
        for (const id of [...pool.prefixes, ...pool.suffixes]) {
          for (const stat of statsOf(resolveMod(data, id))) {
            const m = STAT.exec(stat);
            if (m && !byStat.has(m[1]!)) byStat.set(m[1]!, id);
          }
        }
      }
      expect([...gainAsExtraByElement(data, b)], b.id).toEqual([...byStat]);
    }
  });
});
