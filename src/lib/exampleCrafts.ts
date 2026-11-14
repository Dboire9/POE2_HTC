// Crafts to try on an empty Plan tab — so a first visit sees what the app answers before learning the
// picker. Each is chosen to settle EXACTLY at Standard in about two seconds or less (measured 2026-11-14
// on the live sheet of 2026-11-10 with `scripts/example-crafts.mts`, docs/validation.md;
// `exampleCrafts.test.ts` holds each to settling within Standard's sweeps on the frozen sheet), so the
// first thing a player sees is a real answer, never a bound or a long wait. Loaded the way a streamer's
// item is (`craftFromScratch`), then solved.
//
// They are filed by build type — Caster, Attack, Minion, Defence (`EXAMPLE_CATEGORIES`) — so a player
// finds a craft for the kind of character they play, and each is cut from ONE item a tracked build
// wears in the gear snapshot `data/streamers/0.5.0.json` of 2026-09-16: a subset of the modifiers that
// item rolled (its Desecrated, Fractured, Essence and Perfect Essence modifiers do not count), at the
// tier it wears or a lower one. `build` is that item's class, which the card names. The list is static:
// the weekly gear refresh does not change it, so the claim holds for the snapshot it was cut from.
// Only a category that holds a craft gets a chip.

import type { CraftGoal } from './engineTypes';

/** The build types the card files its crafts under. */
export type ExampleCategory = 'caster' | 'attack' | 'minion' | 'defence';

/** The categories, in the order their chips are shown; the first is the one the card opens on. */
export const EXAMPLE_CATEGORIES: readonly { readonly id: ExampleCategory; readonly label: string }[] = [
  { id: 'caster', label: 'Caster' },
  { id: 'attack', label: 'Attack' },
  { id: 'minion', label: 'Minion' },
  { id: 'defence', label: 'Defence' },
];

export interface ExampleCraft {
  /** What it is, the way a player would ask for it. */
  readonly name: string;
  /** Its modifiers, in words. */
  readonly mods: string;
  /** The build type it is filed under on the card. */
  readonly category: ExampleCategory;
  /** The class whose tracked gear it is drawn from — a class, never a player's or a character's name. */
  readonly build: string;
  readonly goal: CraftGoal;
}

const goal = (baseId: string, targets: readonly (readonly [string, number])[]): CraftGoal =>
  ({ baseId, level: 82, targets: targets.map(([modId, tierDisplay]) => ({ modId, tierDisplay })) });


export const EXAMPLE_CRAFTS: readonly ExampleCraft[] = [
  // ---- Caster ----
  {
    name: 'A caster Wand',
    mods: 'Spell Damage and Mana, +Level of all Cold Spell Skills, Intelligence',
    category: 'caster',
    build: 'Invoker',
    goal: goal('Wands', [['Wands/WeaponSpellDamageAndMana', 3], ['Wands/GlobalIncreaseColdSpellSkillGemLevelWeapon', 1], ['Wands/Intelligence', 2]]),
  },
  {
    name: 'A caster Amulet',
    mods: '+Level of all Spell Skills, Mana, Intelligence, Strength',
    category: 'caster',
    build: 'Invoker',
    goal: goal('Amulets', [
      ['Amulets/GlobalIncreaseSpellSkillGemLevel', 1], ['Amulets/IncreasedMana', 3], ['Amulets/Intelligence', 4], ['Amulets/Strength', 2],
    ]),
  },
  {
    name: 'An Energy Shield caster Helmet',
    mods: 'Energy Shield, Mana, Critical Hit Chance, Lightning Resistance',
    category: 'caster',
    build: 'Invoker',
    goal: goal('Helmets_int', [
      ['Helmets_int/LocalEnergyShieldPercent', 3], ['Helmets_int/IncreasedMana', 4],
      ['Helmets_int/CriticalStrikeChance', 2], ['Helmets_int/LightningResistance', 5],
    ]),
  },
  {
    name: 'A mana regeneration Ring',
    mods: 'Mana Regeneration Rate, Cold and Lightning Resistance',
    category: 'caster',
    build: 'Invoker',
    goal: goal('Rings', [['Rings/ManaRegeneration', 1], ['Rings/ColdResistance', 3], ['Rings/LightningResistance', 3]]),
  },
  // ---- Attack ----
  {
    name: 'A Quarterstaff',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    category: 'attack',
    build: 'Martial Artist',
    goal: goal('Quarterstaves', [
      ['Quarterstaves/LocalIncreasedAttackSpeed', 2], ['Quarterstaves/ManaLeechLocalPermyriad', 2],
      ['Quarterstaves/LocalLightningDamage', 2], ['Quarterstaves/LocalPhysicalDamagePercent', 3],
    ]),
  },
  {
    name: 'A projectile Crossbow',
    mods: '+Level of all Projectile Skills, Attack Speed, Physical Damage and Accuracy, Cold Damage',
    category: 'attack',
    build: 'Gemling Legionnaire',
    goal: goal('Crossbows', [
      ['Crossbows/GlobalIncreaseProjectileSkillGemLevelWeapon', 3], ['Crossbows/LocalIncreasedAttackSpeed', 1],
      ['Crossbows/LocalIncreasedPhysicalDamagePercentAndAccuracyRating', 7], ['Crossbows/LocalColdDamage', 9],
    ]),
  },
  {
    name: 'Elemental attack Gloves',
    mods: 'Fire and Lightning damage to Attacks, Dexterity, Fire Resistance',
    category: 'attack',
    build: 'Gemling Legionnaire',
    goal: goal('Gloves_dex_int', [
      ['Gloves_dex_int/FireDamage', 2], ['Gloves_dex_int/LightningDamage', 1], ['Gloves_dex_int/Dexterity', 1], ['Gloves_dex_int/FireResistance', 4],
    ]),
  },
  {
    name: 'An attack Ring',
    mods: 'Cold and Physical damage to Attacks, Fire Resistance',
    category: 'attack',
    build: 'Gemling Legionnaire',
    goal: goal('Rings', [['Rings/ColdDamage', 1], ['Rings/PhysicalDamage', 3], ['Rings/FireResistance', 3]]),
  },
  // ---- Minion ----
  {
    name: 'A minion Amulet',
    mods: '+Level of all Minion Skills, maximum Energy Shield',
    category: 'minion',
    build: 'Spirit Walker',
    goal: goal('Amulets', [['Amulets/GlobalIncreaseMinionSpellSkillGemLevel', 1], ['Amulets/GlobalEnergyShieldPercent', 1]]),
  },
  {
    name: 'A minion Helmet',
    mods: '+Level of all Minion Skills, Intelligence, Life',
    category: 'minion',
    build: 'Spirit Walker',
    goal: goal('Helmets_int', [['Helmets_int/GlobalIncreaseMinionSpellSkillGemLevel', 1], ['Helmets_int/Intelligence', 3], ['Helmets_int/IncreasedLife', 2]]),
  },
  {
    name: 'A Spirit Sceptre',
    mods: 'Spirit, Spirit and Mana, Attack Speed for Allies in your Presence, Intelligence',
    category: 'minion',
    build: 'Invoker',
    goal: goal('Sceptres', [
      ['Sceptres/LocalIncreasedSpiritPercent', 4], ['Sceptres/LocalIncreasedSpiritAndMana', 2],
      ['Sceptres/AlliesInPresenceIncreasedAttackSpeed', 3], ['Sceptres/Intelligence', 6],
    ]),
  },
  // ---- Defence ----
  {
    name: 'A life and resistances Ring',
    mods: 'Life, all Elemental Resistances, Chaos Resistance',
    category: 'defence',
    build: 'Gemling Legionnaire',
    goal: goal('Rings', [['Rings/IncreasedLife', 3], ['Rings/AllResistances', 3], ['Rings/ChaosResistance', 3]]),
  },
  {
    name: 'An armour Body Armour',
    mods: 'Armour, Armour also applies to Elemental Damage, Cold and Lightning Resistance',
    category: 'defence',
    build: 'Gemling Legionnaire',
    goal: goal('Body_Armours_str', [
      ['Body_Armours_str/LocalPhysicalDamageReductionRatingPercent', 3], ['Body_Armours_str/ArmourAppliesToElementalDamage', 3],
      ['Body_Armours_str/ColdResistance', 3], ['Body_Armours_str/LightningResistance', 3],
    ]),
  },
  {
    name: 'Armour Boots',
    mods: 'Movement Speed, increased Armour, +Armour',
    category: 'defence',
    build: 'Gemling Legionnaire',
    goal: goal('Boots_str', [
      ['Boots_str/MovementVelocity', 1], ['Boots_str/LocalPhysicalDamageReductionRatingPercent', 1],
      ['Boots_str/LocalPhysicalDamageReductionRating', 1],
    ]),
  },
  {
    name: 'A life and mana Belt',
    mods: 'Life, Mana, Lightning Resistance',
    category: 'defence',
    build: 'Invoker',
    goal: goal('Belts', [['Belts/IncreasedLife', 1], ['Belts/IncreasedMana', 1], ['Belts/LightningResistance', 5]]),
  },
];
