// Starter recipes: a first weapon a new player can craft from currency that drops, on a white base they
// found. The player gives the base's item level; the recipe says which modifiers make the weapon done —
// the rest of the item can be anything — and is planned on the FOUND sheet (`FOUND_PRICES`,
// packages/optimizer/src/foundPrices.ts: scarcity weights of what drops, a Transmute as 1), never on trade
// prices.
//
// A recipe names modifiers, not tiers: `targetsAt` asks each at its best tier the item level can roll or
// up to `TIER_SLACK` tiers below it, so one recipe serves every level. An Essence the player finds can
// stand in for a rolled modifier (essenceTwins.ts), and that is what makes these cheap: every shipped
// plan measured is "Transmute; keep it if it shows one of the two modifiers, and put the other on with
// its Essence; otherwise start over on another base".
//
// Chosen by measurement, 2026-11-14, on the found sheet at Standard, with `scripts/starter-recipes.mts`
// (its `candidates` list holds the shapes compared; the numbers go in docs/validation.md). Two modifiers,
// not three: with three named, 70 to over 2,700 weights; with the third an "any one of" slot, 19–35 below
// item level 25 but past 1.5 s and 50 to over 2,000 above it, or no settled answer at all. Slack 2, not 1:
// at slack 1 the asked tier outruns the Lesser Essence's, and a Quarterstaff at 33–55 cost 59–74 against
// 23–44. A slot holding a modifier and its hybrid (Spell Damage, or Spell Damage and Mana) is cheaper on
// casters and Sceptres (a Sceptre at 55: 45 against 86), and settles at slack 2 (at slack 1 such slots
// stopped unsettled from item level 46).
//
// Each attack weapon has two (the maintainer's call, 2026-11-14): an `easy` one — flat Physical and any one
// of five damage modifiers, 1–8 bases — listed before a `better` one — flat Physical and Attack Speed, 5–20.
//
// Measured again the same day once `cheapestEssenceLevel` (cost.ts) stopped taking an unpriced Greater
// Essence as free, through the app's own found-basis solve (`priceBasis: 'found'`), with exact counts of
// what each plan uses (`markov.uses`, `markov.restarts`), at item levels 8–65 and at each recipe's first and
// last. Each recipe is offered up to the last level inside the yardstick — about 45 weights and 20 bases —
// where it still settles with any one found weight halved or doubled (`sensitivity`); the comment on each
// says where and why it stops. Every offered level measured settles exactly, in
// under a second (most under half a second; an easy recipe at 60–64 up to 0.9 s, with a sensitivity run
// alongside).

import type { PatchData } from '../../packages/engine/src/types.ts';
import type { TargetInput } from './engineTypes.ts';

/** One position on the finished weapon: a modifier, or several any one of which will do. */
export interface StarterSlot {
  /** The modifiers that fill it, by id. More than one makes them alternatives — all on one side. */
  readonly modIds: readonly string[];
  /** The same in words: each modifier's in-game text without its numbers (`modWords`), joined with "or". */
  readonly words: string;
}

/**
 * How hard a recipe is to finish, as measured (2026-11-14, bases a craft uses over its offered levels):
 * `easy` uses few — 1–8 for the attack weapons' — and `better` makes the stronger weapon for more of them,
 * 5–20. The card lists a weapon's easy recipe first.
 */
export type StarterGrade = 'easy' | 'better';

export interface StarterRecipe {
  /** What a player calls it, unique across the list, read beside its grade: "A hard-hitting Quarterstaff". */
  readonly name: string;
  /** The weapon it makes, as the card groups them: "Quarterstaff", "One Hand Mace". */
  readonly weapon: string;
  readonly grade: StarterGrade;
  readonly baseId: string;
  /** What the weapon is done with — every slot filled; the rest of the item can be anything. */
  readonly slots: readonly StarterSlot[];
  /** The item levels it is offered at, inclusive. */
  readonly levels: { readonly from: number; readonly to: number };
  /**
   * How many bases the plan uses on average across its offered levels, as whole numbers — the fewest
   * (rounded down) and the most (rounded up) of `1 + restarts`, measured exactly. The card says it
   * ("usually 2–8 bases"); the test holds it to the measurement at every level, both ways.
   */
  readonly bases: { readonly from: number; readonly to: number };
}

/**
 * How many tiers below the best one an item level can roll a modifier is still accepted at: the best
 * tier, or one of the two below it. Measured against 1 (see the header): 1 roughly doubled the cost
 * from item level 33 up.
 */
export const TIER_SLACK = 2;

/** Fewest slots a recipe keeps at a level before it is not offered there at all. */
export const MIN_SLOTS = 2;

/** A recipe at one item level: its Lab targets, and what the level cannot roll. */
export interface StarterTargets {
  readonly targets: readonly TargetInput[];
  /** Modifier ids the level cannot roll at any tier, dropped from the recipe. */
  readonly dropped: readonly string[];
}

/**
 * `recipe` at item level `level`, as Lab targets: each modifier at its best tier this level can roll, or
 * up to `slack` tiers below it. A modifier the level cannot roll at all is dropped and named; a slot
 * left with no modifier is gone; with fewer than `MIN_SLOTS` slots left the recipe is not offered (null).
 *
 * The data keeps a modifier's tiers WORST first, by the item level they need; a target's `tierDisplay`
 * counts from the best (1), and means "this tier or better".
 */
export function targetsAt(
  data: PatchData, recipe: StarterRecipe, level: number, slack: number = TIER_SLACK,
): StarterTargets | null {
  const targets: TargetInput[] = [];
  const dropped: string[] = [];
  let slots = 0;
  for (const s of recipe.slots) {
    const members: TargetInput[] = [];
    for (const modId of s.modIds) {
      const tiers = data.mods.get(modId)?.tiers ?? [];
      // The best tier this level rolls: the last one whose item level it meets.
      let best = -1;
      tiers.forEach((t, j) => { if (t.ilvl <= level) best = j; });
      if (best < 0) { dropped.push(modId); continue; }
      members.push({ modId, tierDisplay: tiers.length - Math.max(0, best - slack) });
    }
    if (members.length === 0) continue;
    // A lone modifier is a slot of its own; alternatives share one id.
    targets.push(...(s.modIds.length === 1 ? members : members.map((t) => ({ ...t, slot: slots }))));
    slots++;
  }
  return slots < MIN_SLOTS ? null : { targets, dropped };
}

/** A modifier's in-game text without its numbers: "Adds # to # Physical Damage" → "Adds Physical Damage". */
export const modWords = (text: string): string => text.split('\n')
  .map((l) => l.replace(/\+#%? to /g, '+').replace(/(#|\d+) to # /g, '').replace(/#%? /g, '').trim())
  .join(' and ');

/** An inclusive range of whole numbers. */
type Range = { readonly from: number; readonly to: number };

/** A slot of one modifier or several, by id within the base ("LocalPhysicalDamage"), with its words. */
const slot = (baseId: string, ...mods: readonly (readonly [string, string])[]): StarterSlot =>
  ({ modIds: mods.map(([id]) => `${baseId}/${id}`), words: mods.map(([, w]) => w).join(' or ') });

const PHYS = ['LocalPhysicalDamage', 'Adds Physical Damage'] as const;
const SPEED = ['LocalIncreasedAttackSpeed', 'increased Attack Speed'] as const;
const SPELL = ['WeaponSpellDamage', 'increased Spell Damage'] as const;
const SPELL_MANA = ['WeaponSpellDamageAndMana', 'increased Spell Damage and +maximum Mana'] as const;
const CAST = ['IncreasedCastSpeed', 'increased Cast Speed'] as const;
const DAMAGE = [
  ['LocalPhysicalDamagePercent', 'increased Physical Damage'],
  ['LocalIncreasedPhysicalDamagePercentAndAccuracyRating', 'increased Physical Damage and +Accuracy Rating'],
  ['LocalFireDamage', 'Adds Fire Damage'],
  ['LocalColdDamage', 'Adds Cold Damage'],
  ['LocalLightningDamage', 'Adds Lightning Damage'],
] as const;

/**
 * An attack weapon's easy recipe: flat Physical Damage and a second modifier that adds weapon damage on its
 * own — increased Physical (or its hybrid with Accuracy, as a caster's Spell Damage takes its hybrid with
 * Mana), or flat Fire, Cold or Lightning, whichever lands. A Transmute then lands one of six modifiers
 * instead of one of two: 1–8 bases where the better recipe uses 5–20. From item level 8, where the Lesser
 * Essence of Abrasion (flat Physical) and the hybrid can roll; to 64, because at 65 the Physical tier asked
 * is past what the Essence of Abrasion gives, the Greater one is not found, and the cost jumped from 19–21
 * weights to 630–820.
 *
 * Measured with and without the hybrid (`candidates`, shapes c3 and c4): it made every weapon cheaper at
 * every level (a Quarterstaff at 55: 16.8 against 19.3). "Increased Elemental Damage with Attacks" (c5) is
 * left out: it adds nothing to a weapon without elemental damage, and saved at most one more weight.
 */
const hardHitting = (weapon: string, baseId: string, bases: Range): StarterRecipe => ({
  name: `A hard-hitting ${weapon}`, weapon, grade: 'easy', baseId,
  slots: [slot(baseId, PHYS), slot(baseId, ...DAMAGE)], levels: { from: 8, to: 64 }, bases,
});

/**
 * An attack weapon's better recipe: flat Physical Damage and Attack Speed. From item level 8, where the
 * Lesser Essence of Abrasion (flat Physical) can roll; Attack Speed's Lesser Essence of Haste follows at 11
 * on Bows and Crossbows and 22 on the rest, and below it Attack Speed has to be rolled: 24–39 weights
 * there. Up to `to`, the last level inside the yardstick (about 45 weights and 20 bases): 59 on Bows and
 * Crossbows (60: 49.7 weights, 22.3 bases), 57 on the rest (58: 45.6 and 20.3; 60: 66.0 and 30.5).
 */
const fastAttacking = (weapon: string, baseId: string, to: number, bases: Range): StarterRecipe => ({
  name: `A fast-attacking ${weapon}`, weapon, grade: 'better', baseId,
  slots: [slot(baseId, PHYS), slot(baseId, SPEED)], levels: { from: 8, to }, bases,
});

/** Both recipes for an attack weapon, the easy one first; the better one offered up to `betterTo`. */
const attack = (weapon: string, baseId: string, betterTo: number, easy: Range, better: Range): StarterRecipe[] =>
  [hardHitting(weapon, baseId, easy), fastAttacking(weapon, baseId, betterTo, better)];

/**
 * A spell weapon: Spell Damage (or its hybrid with Mana) and Cast Speed. From item level 15, where the
 * Lesser Essence of Alacrity (Cast Speed) can roll: below it Cast Speed has to be rolled, and the plan was
 * Transmute on 19–22 bases for 41–49 weights. To 59: from 60 (65 on a Staff) the craft settled on the found
 * weights as they stand (42.4–42.7 weights, 19 bases) but stopped unsettled at Standard — on its sweep cap,
 * not its clock — when the Transmute or Augment weight was halved or the Chaos one doubled
 * (`sensitivity`), so a judgement on the weights would take the recipe away.
 *
 * On the base that rolls every element. Neither modifier is element-locked, so the recipe's modifiers
 * are on every element-locked variant (`Wands_cold`, a Frigid Wand) too, where the same craft measured
 * cheaper at every level (a Wand at 33: 13 against 18) — those bases roll fewer modifiers.
 */
const caster = (weapon: string, baseId: string, bases: Range): StarterRecipe => ({
  name: `A caster ${weapon}`, weapon, grade: CASTER_GRADE, baseId,
  slots: [slot(baseId, SPELL, SPELL_MANA), slot(baseId, CAST)], levels: { from: 15, to: 59 }, bases,
});

/**
 * The grade of the one recipe a Wand, a Staff and a Sceptre each have, by what it measured against the
 * attack grades: a Wand or Staff used 5–14 bases and a Sceptre 6–21, inside the better grade's range and
 * past the easy grade's 1–8. Their plans are the better grade's too — Transmute until the rarer of two
 * modifiers shows, then the other's Essence.
 */
const CASTER_GRADE: StarterGrade = 'better';

/**
 * By weapon, each weapon's easy recipe before its better one. The `bases` ranges are measured
 * (`scripts/starter-recipes.mts`, 2026-11-14) and held by the test: change a weight, a level or a modifier
 * and they are re-measured, never widened by hand.
 */
export const STARTER_RECIPES: readonly StarterRecipe[] = [
  ...attack('Bow', 'Bows', 59, { from: 1, to: 7 }, { from: 5, to: 19 }),
  ...attack('Crossbow', 'Crossbows', 59, { from: 1, to: 7 }, { from: 5, to: 19 }),
  ...attack('Quarterstaff', 'Quarterstaves', 57, { from: 2, to: 8 }, { from: 7, to: 20 }),
  ...attack('Spear', 'Spears', 57, { from: 2, to: 8 }, { from: 7, to: 20 }),
  ...attack('One Hand Mace', 'OneHand_Maces', 57, { from: 2, to: 8 }, { from: 7, to: 20 }),
  ...attack('Two Hand Mace', 'TwoHand_Maces', 57, { from: 2, to: 8 }, { from: 7, to: 20 }),
  caster('Wand', 'Wands', { from: 5, to: 14 }),
  caster('Staff', 'Staves', { from: 5, to: 14 }),
  // Spirit (or its hybrid with Mana) for more minions and auras, and damage for the allies it keeps. From
  // item level 8, where the Lesser Essence of Command (allies' damage) can roll; to 55, the last level inside
  // the yardstick (45.4 weights, 20.2 bases; 56: 46.1 and 20.6; 58: 57.1 and 26.1; 60 and 65 do not settle
  // at Standard).
  {
    name: 'A Spirit Sceptre',
    weapon: 'Sceptre',
    grade: CASTER_GRADE,
    baseId: 'Sceptres',
    slots: [
      slot('Sceptres', ['LocalIncreasedSpiritPercent', 'increased Spirit'], ['LocalIncreasedSpiritAndMana', 'increased Spirit and +maximum Mana']),
      slot('Sceptres', ['AlliesInPresenceAllDamage', 'Allies in your Presence deal increased Damage']),
    ],
    levels: { from: 8, to: 55 },
    bases: { from: 6, to: 21 },
  },
];
