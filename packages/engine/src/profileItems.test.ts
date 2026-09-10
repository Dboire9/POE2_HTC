import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from './loadPatch.ts';
import { resolveProfileItems, type SourceItem } from './profileItems.ts';

const data = loadPatch('data/patches/0.5.0');

/**
 * A REAL character's gear, fetched from poe.ninja and trimmed to the fields this reads. Not invented:
 * every hard case here — the summed fire modifiers, the Sanctified rolls, the desecrated mods with no
 * stat identifiers, the Unique that is not craftable — is something a player actually had, and none
 * of them is what I would have thought to write by hand.
 */
const fixture = JSON.parse(
  readFileSync('packages/engine/src/__fixtures__/profile-fubgun.json', 'utf8'),
) as { items: { itemData: SourceItem }[] };
const source = fixture.items.map((i) => i.itemData);
const result = resolveProfileItems(data, source);
const bySlot = (slot: string) => result.items.find((i) => i.slot === slot)!;

describe('a real character, read end to end', () => {
  it('places every rare item on a base', () => {
    expect(result.items).toHaveLength(9);
    expect(result.items.every((i) => i.baseId !== '')).toBe(true);
  });

  it('places all but two of the modifiers, and names those two', () => {
    const placed = result.items.reduce((n, i) => n + i.mods.length, 0);
    const open = result.items.flatMap((i) => i.unresolved);
    expect(placed).toBe(52);
    expect(open).toEqual([
      'desecrated: Grenade Skills have +1 Cooldown Use',
      'crafted: EssenceGlobalDefences1',
    ]);
  });

  /** A Unique is not a failure — nothing this app models can change its modifiers. Saying which and
   *  why beats an empty list. */
  it('skips the Unique with a reason rather than dropping it', () => {
    // What the item IS travels with the reason: the job keeps the skips a player would miss (Rares
    // and Uniques) and drops socketed runes and Incursion limbs, and it can only do that by rarity.
    expect(result.skipped).toEqual([
      { name: 'Mageblood', reason: 'Unique — only a Rare is craftable here', rarity: 'Unique', slot: 'Belt' },
    ]);
  });
});

describe('the cases the text reader could not have handled', () => {
  /**
   * The staff carries TWO `Gain as Extra Fire` at 71% and 62%, which the game sums on screen into a
   * single `133%`. From stats they are two modifiers, and both are above the mod's 60 ceiling, so
   * both read as Sanctified at the best tier.
   */
  it('reads the two summed fire modifiers as two, each Sanctified', () => {
    const staff = bySlot('Weapon');
    const fire = staff.mods.filter((m) => m.modId === 'Staves/DamageGainedAsFire');
    expect(fire).toHaveLength(2);
    expect(fire.every((m) => m.sanctified && m.tierDisplay === 1)).toBe(true);
  });

  /**
   * And it says the item cannot be represented, rather than dropping one and planning a cheaper
   * craft. Family exclusion is an invariant every probability rests on; see `runeConvert.ts` for how
   * such an item is really made.
   */
  it('names the two modifiers that share a family', () => {
    expect(bySlot('Weapon').familyConflict).toEqual(['Staves/DamageGainedAsFire']);
  });

  it('leaves an ordinary item with no family conflict', () => {
    expect(bySlot('Gloves').familyConflict).toEqual([]);
  });
});

describe('desecrated modifiers come from the text, not the stats', () => {
  /**
   * 0 of 693 desecrated mods carry `tiers[].stats` against 951 of 951 normal ones — the stat
   * vocabulary is RePoE's and the desecrated pool is not — so the stat index cannot hold them at all.
   * Before the text route they were the bulk of what went unresolved.
   */
  it('places one on almost every item', () => {
    const withDesecrated = result.items.filter((i) => i.mods.some((m) => m.desecrated));
    expect(withDesecrated.length).toBeGreaterThanOrEqual(7);
  });

  it('flags them as desecrated, which gates the Well of Souls', () => {
    const helm = bySlot('Helm').mods.find((m) => m.desecrated);
    expect(helm?.modId).toMatch(/Desecrated_/);
  });

  /** An item carries at most one, so more than one on a slot would mean the reading is wrong. */
  it('never places more than one on an item', () => {
    for (const item of result.items) {
      expect(item.mods.filter((m) => m.desecrated).length).toBeLessThanOrEqual(1);
    }
  });
});

describe('tiers come back as the pickers show them', () => {
  it('numbers them from 1 = best', () => {
    for (const item of result.items) {
      for (const m of item.mods) {
        expect(m.tierDisplay).toBeGreaterThanOrEqual(1);
        expect(m.tierDisplay).toBeLessThanOrEqual(data.mods.get(m.modId)!.tiers.length);
      }
    }
  });
});

describe('items it declines', () => {
  it('skips a base the shipped patch does not have, and says so', () => {
    const r = resolveProfileItems(data, [
      { name: 'Miracle Siege', baseType: 'Not A Real Bow', rarity: 'Rare', ilvl: 81, mods: {} },
    ]);
    expect(r.items).toEqual([]);
    expect(r.skipped[0]?.reason).toMatch(/not a base in the 0\.5\.0 data/);
  });

  it('reports a corrupted item as corrupted rather than hiding it', () => {
    const r = resolveProfileItems(data, [
      { name: 'X', baseType: 'Gold Ring', rarity: 'Rare', ilvl: 81, corrupted: true, mods: {} },
    ]);
    expect(r.items[0]?.corrupted).toBe(true);
  });
});

/**
 * A Rare on a base this data lacks is the skip a player would actually miss, so it has to say it is a
 * Rare, and where it was worn. The job keeps skips BY RARITY — drop the field here and such a Rare
 * would vanish from the tab unannounced. Eleven did, on four streamers, before `skipped` was persisted;
 * they turned out to be base-type twins the pipeline had never named (Sekhema Sandals among them) and
 * are read now, so the base here is invented. Any base still unknown takes this path.
 */
describe('a skipped item says what it is', () => {
  it('carries rarity and slot for a Rare on a base the data lacks', () => {
    const r = resolveProfileItems(data, [
      { name: 'Rage Sole', baseType: 'Not A Real Sandal', rarity: 'Rare', inventoryId: 'Boots' },
    ]);
    expect(r.skipped).toEqual([{
      name: 'Rage Sole', reason: '“Not A Real Sandal” is not a base in the 0.5.0 data', rarity: 'Rare', slot: 'Boots',
    }]);
  });
});
