// Crafts to try on an empty Plan tab — so a first visit sees what the app answers before learning the
// picker. Each is chosen to settle EXACTLY at Standard in a second or two (measured 2026-09-24 on the
// live sheet, docs/validation.md; `exampleCrafts.test.ts` holds each to settling on the frozen sheet), so
// the first thing a player sees is a real answer, never a bound or a long wait. Loaded the way a
// streamer's item is (`craftFromScratch`), then solved.

import type { CraftGoal } from './engineTypes';

export interface ExampleCraft {
  /** What it is, the way a player would ask for it. */
  readonly name: string;
  /** Its modifiers, in words. */
  readonly mods: string;
  readonly goal: CraftGoal;
}

const goal = (baseId: string, targets: readonly (readonly [string, number])[]): CraftGoal =>
  ({ baseId, level: 82, targets: targets.map(([modId, tierDisplay]) => ({ modId, tierDisplay })) });

export const EXAMPLE_CRAFTS: readonly ExampleCraft[] = [
  {
    name: 'A caster Wand',
    mods: 'Spell Damage, +Level of all Spell Skills, Cast Speed',
    goal: goal('Wands', [['Wands/WeaponSpellDamage', 3], ['Wands/GlobalIncreaseSpellSkillGemLevelWeapon', 2], ['Wands/IncreasedCastSpeed', 3]]),
  },
  {
    name: 'A life and resistances Ring',
    mods: 'Life, Fire, Cold and Lightning Resistance',
    goal: goal('Rings', [['Rings/IncreasedLife', 3], ['Rings/FireResistance', 3], ['Rings/ColdResistance', 3], ['Rings/LightningResistance', 3]]),
  },
  {
    name: 'An armour Body Armour',
    mods: 'Life, Armour, Fire and Lightning Resistance',
    goal: goal('Body_Armours_str', [
      ['Body_Armours_str/IncreasedLife', 3], ['Body_Armours_str/LocalPhysicalDamageReductionRatingPercent', 3],
      ['Body_Armours_str/FireResistance', 3], ['Body_Armours_str/LightningResistance', 3],
    ]),
  },
  {
    name: 'A Spirit Amulet',
    mods: 'Spirit, Life, all Elemental Resistances',
    goal: goal('Amulets', [['Amulets/BaseSpirit', 2], ['Amulets/IncreasedLife', 3], ['Amulets/AllResistances', 3]]),
  },
];
