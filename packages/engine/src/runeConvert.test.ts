import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch, loadShippedPatch } from './loadPatch.ts';
import { runeRoute, runeOpportunity, gainAsExtraByElement, runePriceKey } from './runeConvert.ts';
import { itemFamilies, resolveMod } from './pool.ts';
import { statsOf } from './statLookup.ts';
import type { ItemBase, ItemState } from './types.ts';

const data = loadPatch('data/patches/0.5.0');
const base = (id: string): ItemBase => {
  const b = data.bases.get(id);
  if (!b) throw new Error(`no such base: ${id}`);
  return b;
};

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
    expect(r?.targets).toEqual(['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold']);
    expect(r?.rune).toBe('passion-of-aldur');
    expect(r?.element).toBe('fire');
  });

  it('stacks all three, which is as many as the base can roll', () => {
    expect(runeRoute(data, staff, 'Staves/DamageGainedAsFire', 3)?.targets).toHaveLength(3);
  });

  /**
   * THE POINT OF THE WHOLE DESIGN: what the planner is asked to craft is cross-family, so nothing in
   * the engine has to bend. If this ever failed, the route would be asking for an item the game
   * forbids and every probability computed for it would be meaningless.
   */
  it('asks for targets that can genuinely coexist on one item', () => {
    const targets = runeRoute(data, staff, 'Staves/DamageGainedAsFire', 3)!.targets;
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
   * Only the fire rune is traced — a real staff carried "Forged by the Passion of Aldur" beside two
   * gain-as-extra-FIRE modifiers. The feed prices four more Aldur runes whose elements would be a
   * guess, and a guessed one would print a route that does not work.
   */
  it('declines an element whose rune nobody has confirmed', () => {
    expect(runeRoute(data, base('Staves'), 'Staves/DamageGainedAsCold', 2)).toBeUndefined();
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
    const o = runeOpportunity(data, staff, ['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold']);
    expect(o?.rune).toBe('passion-of-aldur');
    expect(o?.element).toBe('fire');
    expect([...(o?.elements ?? [])].sort()).toEqual(["cold", "fire"]);
  });

  /** The rune converts every one of them, so it fuses elements the player never asked for either —
   *  which is worth offering, and is exactly what the caveat is about. */
  it('offers it even when the wanted element is not among them', () => {
    const o = runeOpportunity(data, staff, ['Staves/DamageGainedAsCold', 'Staves/DamageGainedAsLightning']);
    expect(o?.element).toBe('fire');
    expect(o?.caveat).toMatch(/including any you meant to keep/);
  });

  it('says nothing for a single one, since there is nothing to fuse', () => {
    expect(runeOpportunity(data, staff, ['Staves/DamageGainedAsFire'])).toBeUndefined();
  });

  it('says nothing for targets that are not gain-as-extra mods', () => {
    expect(runeOpportunity(data, staff, ['Staves/Intelligence', 'Staves/WeaponSpellDamage'])).toBeUndefined();
  });

  /** A duplicate id is one modifier, not two — the list must not be fooled into offering a fusion of
   *  something with itself. */
  it('does not count the same target twice', () => {
    expect(runeOpportunity(data, staff, ['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsFire']))
      .toBeUndefined();
  });

  it('says nothing on a base that cannot roll them', () => {
    expect(runeOpportunity(data, base('Rings'), ['Rings/AllResistances', 'Rings/ChaosResistance']))
      .toBeUndefined();
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
    expect(runeRoute(shipped, staves, 'Staves/DamageGainedAsFire', 2)?.targets)
      .toEqual(['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold']);
  });

  it('still offers the rune for a target list holding two of them', () => {
    expect(runeOpportunity(shipped, staves, ['Staves/DamageGainedAsFire', 'Staves/DamageGainedAsCold'])?.rune)
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
