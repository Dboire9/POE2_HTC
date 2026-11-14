// The "Or try one" examples on an empty Plan tab (exampleCrafts.ts), measured the way a first visitor
// meets them: each solved through the app's own path (`runSolve`, the Lab, from white, item level 82)
// at Standard — its 15 s clock and 100k sweeps — on the LIVE price sheet. The test
// (`exampleCrafts.test.ts`) holds each to settling within Standard's sweeps on the frozen sheet with the
// clock lifted; this is the half it cannot hold: what a craft costs today and how long it takes.
//
//   npx tsx scripts/example-crafts.mts                         the shipped list, EXAMPLE_CRAFTS
//   npx tsx scripts/example-crafts.mts candidates [filter]     the pool below; `filter` keeps the crafts
//                                                              whose category or name contains it
//
// Per craft: its category, name, expected cost, `bound`, solve time, whether the route the result shows
// plays a bone (a Desecration) or an Essence (named), and the tracked item it is cut from. In the pool, a
// `*` marks a craft the app ships as it stands. Time it alone: a loaded machine spreads it.
//
// Each card says "From a <class> build", so each craft is real gear: its targets are modifiers ONE item
// in `data/streamers/0.5.0.json` rolled — on the same base, worn by that class, not Desecrated, not
// Fractured (an Essence's or a Perfect Essence's modifier has its own id, so it never matches) — at that
// tier or a lower one. The candidates are such items trimmed to the modifiers that make them what they
// are for the build type, with tiers lowered where the craft would not settle, or would cost more than a
// first example should.
//
// The gate, and the exit code: every craft has an exact number. Whether each is still cut from a tracked
// item of its `build` is printed as its own verdict (SOURCED) and does NOT fail the run: the gear file is
// refreshed weekly, so a streamer swapping an item would turn this red while the app is right — the list
// was cut from the snapshot of 2026-09-16, and the claim is about that snapshot.
import { readFileSync } from 'node:fs';
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { runSolve } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { EXAMPLE_CRAFTS, type ExampleCategory } from '../src/lib/exampleCrafts.ts';
import type { CraftGoal } from '../src/lib/engineTypes.ts';

interface Candidate {
  readonly category: ExampleCategory;
  /** The class whose gear it is cut from. */
  readonly build: string;
  readonly name: string;
  readonly mods: string;
  readonly goal: CraftGoal;
}

/** A goal on `baseId`, each target named by its id within the base ("IncreasedLife", not "Rings/IncreasedLife"). */
const goal = (baseId: string, targets: readonly (readonly [string, number])[]): CraftGoal =>
  ({ baseId, level: 82, targets: targets.map(([mod, tierDisplay]) => ({ modId: `${baseId}/${mod}`, tierDisplay })) });

// The pool: the shipped crafts under their shipped names, and the alternatives measured beside them, each
// under the item it is cut from. A qualifier in a name ("lower tiers", "as worn") says how a variant differs
// from the craft before it.
const CANDIDATES: readonly Candidate[] = [
  // ---- Caster ----
  // Invoker, Wand: +Level of all Cold Spell Skills T1, Mana T2, Spell Damage and Mana T3, Intelligence T2.
  {
    category: 'caster', build: 'Invoker', name: 'A caster Wand',
    mods: 'Spell Damage and Mana, +Level of all Cold Spell Skills, Intelligence',
    goal: goal('Wands', [['WeaponSpellDamageAndMana', 3], ['GlobalIncreaseColdSpellSkillGemLevelWeapon', 1], ['Intelligence', 2]]),
  },
  {
    category: 'caster', build: 'Invoker', name: 'A caster Wand, lower tiers',
    mods: 'Spell Damage and Mana, +Level of all Cold Spell Skills, Intelligence',
    goal: goal('Wands', [['WeaponSpellDamageAndMana', 3], ['GlobalIncreaseColdSpellSkillGemLevelWeapon', 2], ['Intelligence', 3]]),
  },
  {
    category: 'caster', build: 'Invoker', name: 'A caster Wand, with Mana',
    mods: 'Spell Damage and Mana, +Level of all Cold Spell Skills, Mana',
    goal: goal('Wands', [['WeaponSpellDamageAndMana', 3], ['GlobalIncreaseColdSpellSkillGemLevelWeapon', 1], ['IncreasedMana', 2]]),
  },
  {
    category: 'caster', build: 'Invoker', name: 'A cold caster Wand, all four',
    mods: 'Spell Damage and Mana, +Level of all Cold Spell Skills, Mana, Intelligence',
    goal: goal('Wands', [
      ['WeaponSpellDamageAndMana', 3], ['GlobalIncreaseColdSpellSkillGemLevelWeapon', 1], ['IncreasedMana', 2], ['Intelligence', 2],
    ]),
  },
  // Gemling Legionnaire, Staff: Spell Damage T1, Damage as Extra Fire T1 (its Fire Spell level is
  // Fractured, its Fire Damage Desecrated, its Cast Speed a Perfect Essence's).
  {
    category: 'caster', build: 'Gemling Legionnaire', name: 'A fire caster Staff',
    mods: 'Spell Damage, Damage as Extra Fire',
    goal: goal('Staves', [['WeaponSpellDamage', 1], ['DamageGainedAsFire', 1]]),
  },
  {
    category: 'caster', build: 'Gemling Legionnaire', name: 'A fire caster Staff, T2',
    mods: 'Spell Damage, Damage as Extra Fire',
    goal: goal('Staves', [['WeaponSpellDamage', 2], ['DamageGainedAsFire', 2]]),
  },
  // Invoker, Amulet: +Level of all Spell Skills T1, Mana T3, Intelligence T4, Strength T2.
  {
    category: 'caster', build: 'Invoker', name: 'A caster Amulet',
    mods: '+Level of all Spell Skills, Mana, Intelligence, Strength',
    goal: goal('Amulets', [['GlobalIncreaseSpellSkillGemLevel', 1], ['IncreasedMana', 3], ['Intelligence', 4], ['Strength', 2]]),
  },
  {
    category: 'caster', build: 'Invoker', name: 'A caster Amulet, three mods',
    mods: '+Level of all Spell Skills, Mana, Intelligence',
    goal: goal('Amulets', [['GlobalIncreaseSpellSkillGemLevel', 1], ['IncreasedMana', 3], ['Intelligence', 4]]),
  },
  // Invoker, Helmet (int): Energy Shield % T3, Energy Shield T2, Mana T4, Critical Hit Chance T2,
  // Lightning Resistance T5.
  {
    category: 'caster', build: 'Invoker', name: 'An Energy Shield caster Helmet',
    mods: 'Energy Shield, Mana, Critical Hit Chance, Lightning Resistance',
    goal: goal('Helmets_int', [['LocalEnergyShieldPercent', 3], ['IncreasedMana', 4], ['CriticalStrikeChance', 2], ['LightningResistance', 5]]),
  },
  // Invoker, Ring: Mana Regeneration T1, Evasion T3, Cold and Lightning Resistance T3.
  {
    category: 'caster', build: 'Invoker', name: 'A mana regeneration Ring',
    mods: 'Mana Regeneration Rate, Cold and Lightning Resistance',
    goal: goal('Rings', [['ManaRegeneration', 1], ['ColdResistance', 3], ['LightningResistance', 3]]),
  },

  // ---- Attack ----
  // Gemling Legionnaire, Spear: Lightning Damage T2, Elemental Damage with Attacks T1, +Level of all
  // Projectile Skills T3, Critical Hit Chance T3.
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'A lightning Spear',
    mods: 'Lightning Damage, Elemental Damage with Attacks, +Level of all Projectile Skills, Critical Hit Chance',
    goal: goal('Spears', [
      ['LocalLightningDamage', 2], ['IncreasedWeaponElementalDamagePercent', 1],
      ['GlobalIncreaseProjectileSkillGemLevelWeapon', 3], ['LocalBaseCriticalStrikeChance', 3],
    ]),
  },
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'A lightning Spear, T2 elemental',
    mods: 'Lightning Damage, Elemental Damage with Attacks, +Level of all Projectile Skills, Critical Hit Chance',
    goal: goal('Spears', [
      ['LocalLightningDamage', 2], ['IncreasedWeaponElementalDamagePercent', 2],
      ['GlobalIncreaseProjectileSkillGemLevelWeapon', 3], ['LocalBaseCriticalStrikeChance', 3],
    ]),
  },
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'A lightning Spear, three mods',
    mods: 'Lightning Damage, Elemental Damage with Attacks, +Level of all Projectile Skills',
    goal: goal('Spears', [['LocalLightningDamage', 2], ['IncreasedWeaponElementalDamagePercent', 1], ['GlobalIncreaseProjectileSkillGemLevelWeapon', 3]]),
  },
  // Martial Artist, Quarterstaff: Attack Speed T1, Mana Leech T1, Lightning Damage T2, Physical Damage T3.
  {
    category: 'attack', build: 'Martial Artist', name: 'A Quarterstaff, lower tiers',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    goal: goal('Quarterstaves', [
      ['LocalIncreasedAttackSpeed', 2], ['ManaLeechLocalPermyriad', 2], ['LocalLightningDamage', 3], ['LocalPhysicalDamagePercent', 3],
    ]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A Quarterstaff, as worn',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    goal: goal('Quarterstaves', [
      ['LocalIncreasedAttackSpeed', 1], ['ManaLeechLocalPermyriad', 1], ['LocalLightningDamage', 2], ['LocalPhysicalDamagePercent', 3],
    ]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A Quarterstaff, T1 speed and leech',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    goal: goal('Quarterstaves', [
      ['LocalIncreasedAttackSpeed', 1], ['ManaLeechLocalPermyriad', 1], ['LocalLightningDamage', 3], ['LocalPhysicalDamagePercent', 3],
    ]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A Quarterstaff, T1 speed',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    goal: goal('Quarterstaves', [
      ['LocalIncreasedAttackSpeed', 1], ['ManaLeechLocalPermyriad', 2], ['LocalLightningDamage', 3], ['LocalPhysicalDamagePercent', 3],
    ]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A Quarterstaff',
    mods: 'Attack Speed, Mana Leech, Lightning Damage, Physical Damage',
    goal: goal('Quarterstaves', [
      ['LocalIncreasedAttackSpeed', 2], ['ManaLeechLocalPermyriad', 2], ['LocalLightningDamage', 2], ['LocalPhysicalDamagePercent', 3],
    ]),
  },
  // Gemling Legionnaire, Crossbow: Cold Damage T9, +Level of all Projectile Skills T3, Attack Speed T1,
  // Dexterity T4, Physical Damage and Accuracy T7.
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'A projectile Crossbow',
    mods: '+Level of all Projectile Skills, Attack Speed, Physical Damage and Accuracy, Cold Damage',
    goal: goal('Crossbows', [
      ['GlobalIncreaseProjectileSkillGemLevelWeapon', 3], ['LocalIncreasedAttackSpeed', 1],
      ['LocalIncreasedPhysicalDamagePercentAndAccuracyRating', 7], ['LocalColdDamage', 9],
    ]),
  },
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'A projectile Crossbow, three mods',
    mods: '+Level of all Projectile Skills, Attack Speed, Dexterity',
    goal: goal('Crossbows', [['GlobalIncreaseProjectileSkillGemLevelWeapon', 3], ['LocalIncreasedAttackSpeed', 1], ['Dexterity', 4]]),
  },
  // Gemling Legionnaire, Gloves (dex/int): Dexterity T1, Fire damage to Attacks T2, Lightning damage to
  // Attacks T1, Fire Resistance T4.
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'Elemental attack Gloves',
    mods: 'Fire and Lightning damage to Attacks, Dexterity, Fire Resistance',
    goal: goal('Gloves_dex_int', [['FireDamage', 2], ['LightningDamage', 1], ['Dexterity', 1], ['FireResistance', 4]]),
  },
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'Elemental attack Gloves, lower tiers',
    mods: 'Fire and Lightning damage to Attacks, Dexterity, Fire Resistance',
    goal: goal('Gloves_dex_int', [['FireDamage', 3], ['LightningDamage', 2], ['Dexterity', 2], ['FireResistance', 4]]),
  },
  // Martial Artist, Amulet: +Level of all Melee Skills T1, Cold Resistance T5, Mana T7, all Attributes T3.
  {
    category: 'attack', build: 'Martial Artist', name: 'A melee Amulet',
    mods: '+Level of all Melee Skills, all Attributes, Cold Resistance',
    goal: goal('Amulets', [['GlobalIncreaseMeleeSkillGemLevel', 1], ['AllAttributes', 3], ['ColdResistance', 5]]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A melee Amulet, T2 level',
    mods: '+Level of all Melee Skills, all Attributes, Cold Resistance',
    goal: goal('Amulets', [['GlobalIncreaseMeleeSkillGemLevel', 2], ['AllAttributes', 3], ['ColdResistance', 5]]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A melee Amulet, lower tiers',
    mods: '+Level of all Melee Skills, all Attributes, Cold Resistance',
    goal: goal('Amulets', [['GlobalIncreaseMeleeSkillGemLevel', 2], ['AllAttributes', 4], ['ColdResistance', 5]]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A melee Amulet, with Mana',
    mods: '+Level of all Melee Skills, all Attributes, Mana',
    goal: goal('Amulets', [['GlobalIncreaseMeleeSkillGemLevel', 1], ['AllAttributes', 3], ['IncreasedMana', 7]]),
  },
  {
    category: 'attack', build: 'Martial Artist', name: 'A melee Amulet, two mods',
    mods: '+Level of all Melee Skills, all Attributes',
    goal: goal('Amulets', [['GlobalIncreaseMeleeSkillGemLevel', 1], ['AllAttributes', 3]]),
  },
  // Gemling Legionnaire, Ring: Fire Resistance T3, Cold damage to Attacks T1, Physical damage to Attacks T3.
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'An attack Ring',
    mods: 'Cold and Physical damage to Attacks, Fire Resistance',
    goal: goal('Rings', [['ColdDamage', 1], ['PhysicalDamage', 3], ['FireResistance', 3]]),
  },
  {
    category: 'attack', build: 'Gemling Legionnaire', name: 'An attack Ring, lower tiers',
    mods: 'Cold and Physical damage to Attacks, Fire Resistance',
    goal: goal('Rings', [['ColdDamage', 2], ['PhysicalDamage', 3], ['FireResistance', 3]]),
  },

  // ---- Minion ----
  // Spirit Walker, Amulet: +Level of all Minion Skills T1, maximum Energy Shield % T1 (its flat Energy
  // Shield is Fractured).
  {
    category: 'minion', build: 'Spirit Walker', name: 'A minion Amulet',
    mods: '+Level of all Minion Skills, maximum Energy Shield',
    goal: goal('Amulets', [['GlobalIncreaseMinionSpellSkillGemLevel', 1], ['GlobalEnergyShieldPercent', 1]]),
  },
  {
    category: 'minion', build: 'Spirit Walker', name: 'A minion Amulet, T2',
    mods: '+Level of all Minion Skills, maximum Energy Shield',
    goal: goal('Amulets', [['GlobalIncreaseMinionSpellSkillGemLevel', 2], ['GlobalEnergyShieldPercent', 2]]),
  },
  // Spirit Walker, Helmet (int): +Level of all Minion Skills T1, Intelligence T3, Life T2 (its Energy
  // Shield % is Fractured, its flat Energy Shield Desecrated).
  {
    category: 'minion', build: 'Spirit Walker', name: 'A minion Helmet',
    mods: '+Level of all Minion Skills, Intelligence, Life',
    goal: goal('Helmets_int', [['GlobalIncreaseMinionSpellSkillGemLevel', 1], ['Intelligence', 3], ['IncreasedLife', 2]]),
  },
  {
    category: 'minion', build: 'Spirit Walker', name: 'A minion Helmet, lower tiers',
    mods: '+Level of all Minion Skills, Intelligence, Life',
    goal: goal('Helmets_int', [['GlobalIncreaseMinionSpellSkillGemLevel', 2], ['Intelligence', 4], ['IncreasedLife', 3]]),
  },
  // Invoker, Sceptre: Allies' Attack Speed T3, Spirit T4, Spirit and Mana T2, Intelligence T6, Mana T11.
  {
    category: 'minion', build: 'Invoker', name: 'A Spirit Sceptre',
    mods: 'Spirit, Spirit and Mana, Attack Speed for Allies in your Presence, Intelligence',
    goal: goal('Sceptres', [
      ['LocalIncreasedSpiritPercent', 4], ['LocalIncreasedSpiritAndMana', 2], ['AlliesInPresenceIncreasedAttackSpeed', 3], ['Intelligence', 6],
    ]),
  },
  {
    category: 'minion', build: 'Invoker', name: 'A Spirit Sceptre, three mods',
    mods: 'Spirit, Spirit and Mana, Attack Speed for Allies in your Presence',
    goal: goal('Sceptres', [['LocalIncreasedSpiritPercent', 4], ['LocalIncreasedSpiritAndMana', 2], ['AlliesInPresenceIncreasedAttackSpeed', 3]]),
  },
  // Gemling Legionnaire, Amulet: Spirit T1, Life T1, Rarity T1 (its Spell level is Fractured).
  {
    category: 'minion', build: 'Gemling Legionnaire', name: 'A Spirit and Life Amulet',
    mods: 'Spirit, Life',
    goal: goal('Amulets', [['BaseSpirit', 2], ['IncreasedLife', 3]]),
  },

  // ---- Defence ----
  // Gemling Legionnaire, Ring: Rarity T2, all Elemental Resistances T1, Chaos Resistance T3, Life T2,
  // Fire Damage T1.
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'A life and resistances Ring',
    mods: 'Life, all Elemental Resistances, Chaos Resistance',
    goal: goal('Rings', [['IncreasedLife', 3], ['AllResistances', 3], ['ChaosResistance', 3]]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'A life and resistances Ring, as worn',
    mods: 'Life, all Elemental Resistances, Chaos Resistance',
    goal: goal('Rings', [['IncreasedLife', 2], ['AllResistances', 1], ['ChaosResistance', 3]]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'A life and resistances Ring, T2 resistances',
    mods: 'Life, all Elemental Resistances, Chaos Resistance',
    goal: goal('Rings', [['IncreasedLife', 3], ['AllResistances', 2], ['ChaosResistance', 3]]),
  },
  // Gemling Legionnaire, Body Armour (str): Armour also applies to Elemental Damage T1, Armour T1,
  // Lightning Resistance T2, Cold Resistance T1, increased Armour T1.
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'An armour Body Armour, three mods',
    mods: 'Armour, Cold and Lightning Resistance',
    goal: goal('Body_Armours_str', [['LocalPhysicalDamageReductionRatingPercent', 3], ['ColdResistance', 3], ['LightningResistance', 3]]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'An armour Body Armour, four mods',
    mods: 'increased Armour, +Armour, Cold and Lightning Resistance',
    goal: goal('Body_Armours_str', [
      ['LocalPhysicalDamageReductionRatingPercent', 3], ['LocalPhysicalDamageReductionRating', 3], ['ColdResistance', 3], ['LightningResistance', 3],
    ]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'An armour Body Armour',
    mods: 'Armour, Armour also applies to Elemental Damage, Cold and Lightning Resistance',
    goal: goal('Body_Armours_str', [
      ['LocalPhysicalDamageReductionRatingPercent', 3], ['ArmourAppliesToElementalDamage', 3], ['ColdResistance', 3], ['LightningResistance', 3],
    ]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'An armour Body Armour, as worn',
    mods: 'Armour, Armour also applies to Elemental Damage, Cold and Lightning Resistance',
    goal: goal('Body_Armours_str', [
      ['LocalPhysicalDamageReductionRatingPercent', 1], ['ArmourAppliesToElementalDamage', 1], ['ColdResistance', 1], ['LightningResistance', 2],
    ]),
  },
  // Gemling Legionnaire, Boots (str): increased Armour T1, Movement Speed T1, Armour T1 (its Chaos
  // Resistance is Fractured).
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'Armour Boots',
    mods: 'Movement Speed, increased Armour, +Armour',
    goal: goal('Boots_str', [['MovementVelocity', 1], ['LocalPhysicalDamageReductionRatingPercent', 1], ['LocalPhysicalDamageReductionRating', 1]]),
  },
  // Gemling Legionnaire, Gloves (str): Life T1, increased Armour T2, Armour T1, Chaos Resistance T1.
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'Armour Gloves',
    mods: 'Life, increased Armour, +Armour, Chaos Resistance',
    goal: goal('Gloves_str', [
      ['IncreasedLife', 1], ['LocalPhysicalDamageReductionRatingPercent', 2], ['LocalPhysicalDamageReductionRating', 1], ['ChaosResistance', 1],
    ]),
  },
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'Armour Gloves, lower tiers',
    mods: 'Life, increased Armour, +Armour, Chaos Resistance',
    goal: goal('Gloves_str', [
      ['IncreasedLife', 2], ['LocalPhysicalDamageReductionRatingPercent', 3], ['LocalPhysicalDamageReductionRating', 2], ['ChaosResistance', 2],
    ]),
  },
  // Gemling Legionnaire, Body Armour (dex/int): Deflection T5, Evasion and Energy Shield T1, Life
  // Regeneration T4, Poison Duration T3.
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'A deflection Body Armour',
    mods: 'Evasion and Energy Shield, Deflection from Evasion, Life Regeneration',
    goal: goal('Body_Armours_dex_int', [['LocalBaseEvasionRatingAndEnergyShield', 1], ['EvasionAppliesToDeflection', 5], ['LifeRegeneration', 4]]),
  },
  // Martial Artist, Body Armour (dex/int): hybrid T2, Lightning Resistance T4, Evasion and Energy Shield
  // T1, increased Evasion and Energy Shield T2.
  {
    category: 'defence', build: 'Martial Artist', name: 'An evasion and Energy Shield Body Armour',
    mods: 'Evasion and Energy Shield, three ways, Lightning Resistance',
    goal: goal('Body_Armours_dex_int', [
      ['LocalIncreasedEvasionAndEnergyShieldAndBase', 2], ['LocalBaseEvasionRatingAndEnergyShield', 1],
      ['LocalEvasionAndEnergyShield', 2], ['LightningResistance', 4],
    ]),
  },
  // Invoker, Body Armour (int): Cold Resistance T4, hybrid Energy Shield T2, Energy Shield % T1,
  // Lightning Resistance T3.
  {
    category: 'defence', build: 'Invoker', name: 'An Energy Shield Body Armour',
    mods: 'Energy Shield, Cold and Lightning Resistance',
    goal: goal('Body_Armours_int', [
      ['LocalIncreasedEnergyShieldAndBase', 2], ['LocalEnergyShieldPercent', 1], ['ColdResistance', 4], ['LightningResistance', 3],
    ]),
  },
  // Invoker, Belt: Lightning Resistance T5, Mana T1, Charm Charges T3, Life T1, Flask Mana Recovery T1.
  {
    category: 'defence', build: 'Invoker', name: 'A life and mana Belt',
    mods: 'Life, Mana, Lightning Resistance',
    goal: goal('Belts', [['IncreasedLife', 1], ['IncreasedMana', 1], ['LightningResistance', 5]]),
  },
  // Gemling Legionnaire, Belt: Cold Resistance T2, Life T2, Armour T4, Mana T1.
  {
    category: 'defence', build: 'Gemling Legionnaire', name: 'An armour Belt',
    mods: 'Life, Armour, Mana, Cold Resistance',
    goal: goal('Belts', [['IncreasedLife', 2], ['PhysicalDamageReductionRating', 4], ['IncreasedMana', 1], ['ColdResistance', 2]]),
  },
  // Spirit Walker, Boots (dex/int): increased Evasion and Energy Shield T2, Intelligence T1, Cold
  // Resistance T3, Fire Resistance T2, Evasion and Energy Shield T1 (its Movement Speed is Desecrated).
  {
    category: 'defence', build: 'Spirit Walker', name: 'Evasion and Energy Shield Boots',
    mods: 'increased Evasion and Energy Shield, Cold and Fire Resistance',
    goal: goal('Boots_dex_int', [['LocalEvasionAndEnergyShield', 2], ['ColdResistance', 3], ['FireResistance', 2]]),
  },
  {
    category: 'defence', build: 'Spirit Walker', name: 'Evasion and Energy Shield Boots, four mods',
    mods: 'increased and added Evasion and Energy Shield, Cold and Fire Resistance',
    goal: goal('Boots_dex_int', [
      ['LocalEvasionAndEnergyShield', 2], ['LocalBaseEvasionRatingAndEnergyShield', 1], ['ColdResistance', 3], ['FireResistance', 2],
    ]),
  },
];

const which = process.argv[2] ?? 'shipped';
if (which !== 'shipped' && which !== 'candidates') {
  console.error(`unknown list "${which}": run with no argument (the shipped list) or "candidates"`);
  process.exit(2);
}
const filter = (process.argv[3] ?? '').toLowerCase();
const crafts: readonly { category: string; build?: string; name: string; goal: CraftGoal }[] =
  (which === 'candidates' ? CANDIDATES : EXAMPLE_CRAFTS).filter((c) => !filter || c.category.toLowerCase().includes(filter) || c.name.toLowerCase().includes(filter));

const patch = 'data/patches/0.5.0';
const data = loadShippedPatch(patch);
const eng = { data, prices: loadPrices(patch) };
const sheetDate = (JSON.parse(readFileSync(`${patch}/prices.json`, 'utf8')) as { updated?: string }).updated ?? '?';

interface TrackedItem {
  readonly slot: string;
  readonly baseId: string;
  readonly mods: readonly { readonly modId: string; readonly tierDisplay: number; readonly fractured?: boolean; readonly desecrated?: boolean }[];
}
const gearFile = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as {
  updated?: string;
  characters: readonly { className: string; items: readonly TrackedItem[] }[];
};
const gear = gearFile.characters;
/** The tracked item the craft is cut from, as "Class Slot": one item on its base, of its build's class (any
 *  class when it names none), that ROLLED every target at the tier asked or better. Null when none did. */
const sourceOf = (build: string | undefined, g: CraftGoal): string | null => {
  for (const ch of gear) {
    if (build !== undefined && ch.className !== build) continue;
    for (const it of ch.items) {
      if (it.baseId !== g.baseId) continue;
      const rolled = g.targets.every((t) => it.mods.some((m) =>
        m.modId === t.modId && !m.fractured && !m.desecrated && t.tierDisplay >= m.tierDisplay));
      if (rolled) return `${ch.className} ${it.slot}`;
    }
  }
  return null;
};
/** A pool craft the app ships exactly as it stands: same name, same goal. */
const shipped = (c: { name: string; goal: CraftGoal }): boolean =>
  EXAMPLE_CRAFTS.some((e) => e.name === c.name && JSON.stringify(e.goal) === JSON.stringify(c.goal));

console.log(`${which === 'candidates' ? 'candidates' : 'EXAMPLE_CRAFTS'}${filter ? ` matching "${filter}"` : ''}: `
  + `${crafts.length} crafts, Standard, live sheet of ${sheetDate}, from white at item level 82`);
console.log(`${'category'.padEnd(8)}  ${'name'.padEnd(46)} ${'cost (ex)'.padStart(10)}  ${'bound'.padEnd(5)} `
  + `${'s'.padStart(5)}  ${'bone'.padEnd(4)}  ${'cut from'.padEnd(30)}  essence`);
const solve = (g: CraftGoal) => runSolve(eng, {
  kind: 'lab', from: { baseId: g.baseId, level: 82 }, targets: g.targets, effort: limitsFor('standard'),
});
// One small solve first, untimed: the first solve in a process also pays for compiling the solver, which
// measured 2–5 s on top of whichever craft came first.
solve(goal('Rings', [['IncreasedLife', 3], ['FireResistance', 3]]));
let notExact = 0;
let sourced = 0;
for (const c of crafts) {
  const source = sourceOf(c.build, c.goal);
  if (source !== null) sourced++;
  const t0 = performance.now();
  const m = solve(c.goal).markov;
  const s = (performance.now() - t0) / 1000;
  if (!(m.applicable && m.feasible && m.bound === 'exact')) notExact++;
  const cost = !m.feasible ? `none (${(m.reason ?? '').slice(0, 30)})`
    : `${m.bound === 'upper' ? '≤ ' : m.bound === 'lower' ? '≥ ' : ''}${Math.round(m.expectedCost).toLocaleString('en-US')}`;
  // What the route the result shows plays: a bone wherever a move is a Desecration, and an Essence by name
  // (a Perfect one as "Perfect Essence").
  const bone = m.nodes.some((n) => n.keepsOne === true);
  const essences = [...new Set(m.nodes.map((n) => n.action ?? '').filter((a) => a.includes('Essence')))];
  const mark = which === 'candidates' && shipped(c) ? '*' : ' ';
  console.log(`${c.category.padEnd(8)} ${mark}${c.name.padEnd(46)} ${cost.padStart(10)}  ${(m.feasible ? m.bound : '-').padEnd(5)} `
    + `${s.toFixed(2).padStart(5)}  ${(bone ? 'yes' : 'no').padEnd(4)}  ${(source ?? 'NO TRACKED ITEM').padEnd(30)}  `
    + `${essences.join(', ') || 'no'}`);
}
console.log(`SOURCED: ${sourced} of ${crafts.length} cut from a tracked item of their build `
  + `(gear snapshot ${gearFile.updated ?? '?'})`);
console.log(notExact === 0 ? 'GATE PASSED: every craft exact' : `GATE FAILED: ${notExact} of ${crafts.length} not exact`);
process.exit(notExact === 0 ? 0 : 1);
