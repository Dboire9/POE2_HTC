import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from './loadPatch.ts';
import { resolveProfileItems, strip, type SourceItem } from './profileItems.ts';

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

  /**
   * One line short of the whole item, and it is a desecrated one. The crafted Essence line that used to
   * sit beside it here is read now — from the game's own modifier id, since no essence mod carries the
   * stats the other route needs. See `codeIndex` and `tools/refresh/apply_codes.mjs`.
   */
  it('places all but one of the modifiers, and names it', () => {
    const placed = result.items.reduce((n, i) => n + i.mods.length, 0);
    const open = result.items.flatMap((i) => i.unresolved);
    expect(placed).toBe(53);
    expect(open).toEqual(['desecrated: Grenade Skills have +1 Cooldown Use']);
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

/**
 * Crafted lines resolve from the GAME'S OWN modifier id, and they have to: **0 of 353 essence and 0 of
 * 481 perfect-essence mods carry `tiers[].stats`**, so the stat index holds none of them and
 * `resolveByStats` answers nothing for any of them. `apply_codes.mjs` writes those ids onto the tiers.
 */
describe('crafted modifiers resolve from the game’s own id', () => {
  it('places the Perfect Essence line no stat lookup could reach', () => {
    const placed = result.items.flatMap((i) => i.mods.map((m) => m.modId));
    expect(placed).toContain('Amulets/PerfectEssence_AllDefences');
  });

  /**
   * And it RE-POINTS a line the stats did resolve, which is the half worth stating outright. An Essence
   * of Opulence forces the ordinary rarity modifier, so poe.ninja sends `ItemFoundRarityIncrease3` —
   * a normal mod's id — filed under `crafted`. Only the essence-pool mod occupies the crafted slot and
   * sits in the crafted family namespace, so reading it as the rolled one understates the item.
   */
  it('reads an essence-forced ordinary modifier as the essence, not as a rolled mod', () => {
    const r = resolveProfileItems(data, [{
      name: 'Test', baseType: 'Gold Ring', rarity: 'Rare', ilvl: 81, inventoryId: 'Ring',
      mods: { crafted: [{ id: 'ItemFoundRarityIncrease3', stats: { 'base_item_found_rarity_+%': 18 } }] },
    }]);
    expect(r.items[0]?.mods).toEqual([
      { modId: 'Rings/Essence_ItemFoundRarityIncrease', tierDisplay: 1, fractured: false, desecrated: false, sanctified: false },
    ]);
  });

  /** An id nothing claims stays unresolved. A Genesis Tree ring craft is a real one — a mechanic this
   *  app does not model — and inventing a mod for it would price a craft nobody can perform. */
  it('leaves an id it cannot place unresolved rather than guessing', () => {
    const r = resolveProfileItems(data, [{
      name: 'Test', baseType: 'Gold Ring', rarity: 'Rare', ilvl: 81, inventoryId: 'Ring',
      mods: { crafted: [{ id: 'GenesisTreeRingMinionCooldownRecoveryCrafted', stats: { 'minion_cooldown_recovery_+%': 25 } }] },
    }]);
    expect(r.items[0]?.mods).toEqual([]);
    expect(r.items[0]?.unresolved).toEqual(['crafted: GenesisTreeRingMinionCooldownRecoveryCrafted']);
  });
});

/**
 * Socketed runes are read because the item cannot be explained without them: two crafted modifiers or
 * four suffixes are illegal until you know an Astrid's Creativity or a Serle's Triumph is in there.
 *
 * Shaped from the real payload (poe.ninja, 2026-09-16, fubgun's Chiming Staff): a socketed item leaves
 * `name` EMPTY and puts the rune in `baseType`, spelled with an ASCII apostrophe where the game data
 * uses a typographic one.
 */
describe('socketed runes are read off the item', () => {
  const staff = (...sockets: string[]): SourceItem => ({
    name: 'Spirit Star', baseType: 'Chiming Staff', rarity: 'Rare', ilvl: 81, inventoryId: 'Weapon',
    socketedItems: sockets.map((baseType) => ({ name: '', baseType, typeLine: baseType })),
  });

  it('reads a rune that changes what the item may hold', () => {
    expect(resolveProfileItems(data, [staff('Thrud\'s Might')]).items[0]?.runes).toEqual(['thruds-might']);
  });

  /** The apostrophe is the whole hazard: eight of the twelve runes have one, and the two sources spell
   *  it differently. Both spellings must find the rune, or most of them are silently never read. */
  it('matches whichever apostrophe the source used', () => {
    expect(resolveProfileItems(data, [staff('Astrid’s Creativity')]).items[0]?.runes).toEqual(['astrids-creativity']);
    expect(resolveProfileItems(data, [staff('Astrid\'s Creativity')]).items[0]?.runes).toEqual(['astrids-creativity']);
  });

  it('ignores socketables that change no craft rule', () => {
    const r = resolveProfileItems(data, [staff('Perfect Iron Rune', 'Jiquani\'s Soul Core of Rippling', 'Sigil of Power')]);
    expect(r.items[0]?.runes).toEqual([]);
  });

  /** Two of one rune is ordinary on a real item. Whether a second Astrid's Creativity would allow a
   *  THIRD crafted modifier is untraced, so it is read once rather than claimed to stack. */
  it('counts a rune socketed twice once', () => {
    const r = resolveProfileItems(data, [staff('Astrid\'s Creativity', 'Astrid\'s Creativity')]);
    expect(r.items[0]?.runes).toEqual(['astrids-creativity']);
  });

  it('records an empty list when nothing rule-changing is socketed', () => {
    expect(resolveProfileItems(data, [staff()]).items[0]?.runes).toEqual([]);
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

/**
 * A "reduced" modifier as a profile API sends it: the SIGNED stat value. The tier check used to flip a
 * negative range's sign for printed text's sake, so this real line — XTheFarmerX's Dusk Edge, fetched
 * 2026-09-10 — found its mod and then no tier. None of the 52 shipped "reduced" mods could be placed
 * from a profile, while pasting the same item read them fine.
 */
describe('a "reduced" modifier from its signed stat value', () => {
  it('places the real Dusk Edge line at its tier', () => {
    const r = resolveProfileItems(data, [{
      name: 'Dusk Edge', baseType: 'Akoyan Spear', rarity: 'Rare', ilvl: 81, inventoryId: 'Weapon2',
      mods: { explicit: [{ id: 'ReducedLocalAttributeRequirements5', stats: { 'local_attribute_requirements_+%': -35 } }] },
    }]);
    expect(r.items[0]?.unresolved).toEqual([]);
    expect(r.items[0]?.mods).toEqual([
      { modId: 'Spears/LocalAttributeRequirements', tierDisplay: 1, fractured: false, desecrated: false, sanctified: false },
    ]);
  });
});

/**
 * The markup reader, and why it changed: its old patterns let every `[` rescan the rest of the line, so
 * a line of unclosed brackets cost quadratic time (CodeQL). These lines come from poe.ninja.
 */
describe('poe.ninja markup', () => {
  it('keeps what a player reads', () => {
    expect(strip('Adds [Fire|Fire Damage] and [Cold] to [Attacks|attacks]')).toBe('Adds Fire Damage and Cold to attacks');
    expect(strip('no markup here')).toBe('no markup here');
  });

  // Sized so the old patterns take several seconds here (measured) while one pass takes milliseconds — at
  // 30,000 characters V8 still ran the quadratic version in under a second, and the test caught nothing.
  it('reads a line of unclosed brackets in one pass', () => {
    const t = performance.now();
    expect(strip('['.repeat(150_000))).toHaveLength(150_000);
    expect(strip('[a|'.repeat(50_000))).toHaveLength(150_000);
    expect(performance.now() - t).toBeLessThan(1000);
  });
});
