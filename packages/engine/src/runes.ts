import type { ItemBase, ItemLimits } from './types.ts';
import { DEFAULT_LIMITS } from './item.ts';

/**
 * The socketables that change what a CRAFT can produce.
 *
 * Runes of Aldur (0.5) added Ancient Runes and the element-converting Aldur runes. A scan of all 313
 * socketables in the game data (RePoE `augments.json`, 2026-09-15) found these twelve to be the ones
 * whose effect is about an item's MODIFIERS. Everything else there acts on the character, or on
 * something this app does not model, and is deliberately absent:
 *
 *   - Atziri's Soul Cores of Devotion / Vitality / Alacrity / Inoculation — "Corrupting will always
 *     result in change", and corruption is not modelled;
 *   - Cadigan's Epiphany — destroys the augment sockets to make a jewel socket;
 *   - Legacy of Runeseeker's Call — socketed runes are 75% stronger, which changes rune values rather
 *     than craft rules.
 *
 * Each rune is SOCKETED rather than spent, so it also costs a socket; Dorian confirmed (2026-09-15)
 * that an item keeps what the rune allowed after the rune is swapped out, which is why a plan may end
 * by replacing it.
 */
export type RuneEffect =
  /** Astrid's Creativity: "Can have 1 additional Crafted Modifier" — raises `ItemLimits.crafted`. */
  | { readonly kind: 'crafted'; readonly plus: number }
  /** Serle's Triumph: "+1 Suffix Modifier allowed" — raises `ItemLimits.suffixes`. */
  | { readonly kind: 'suffix'; readonly plus: number }
  /** "Can roll <X> modifiers" — adds that pool to what the base can roll while the rune is in. */
  | { readonly kind: 'pool'; readonly tag: string }
  /**
   * An Aldur rune: every modifier of `eats` on the item becomes the equivalent `element` one. Both
   * halves come from the rune's own stat text in the game data, e.g. `RuneConvertLightning`:
   * "Transforms all Fire and Cold modifiers on the item into equivalent Lightning modifiers".
   */
  | { readonly kind: 'convert'; readonly element: string; readonly eats: readonly string[] };

export interface Rune {
  /** poe.ninja's id for it, which is also the tail of its price key (`rune:<id>`). */
  readonly id: string;
  /** As the game prints it. */
  readonly name: string;
  /** Base categories it fits. Empty means every equipment base ("All Equipment" in the data). */
  readonly categories: readonly string[];
  readonly effect: RuneEffect;
}

/**
 * "Martial Or Caster Weapon" as this data spells it. Foci, Quivers, Bucklers and Shields are
 * off-hands rather than weapons and are not in it.
 */
const WEAPONS = [
  'Wands', 'Sceptres', 'Staves', 'Bows', 'Crossbows', 'Quarterstaves', 'Spears',
  'OneHand_Maces', 'TwoHand_Maces',
] as const;

export const RUNES: readonly Rune[] = [
  { id: 'astrids-creativity', name: 'Astrid’s Creativity', categories: [], effect: { kind: 'crafted', plus: 1 } },
  { id: 'serles-triumph', name: 'Serle’s Triumph', categories: [], effect: { kind: 'suffix', plus: 1 } },
  { id: 'thruds-might', name: 'Thrud’s Might', categories: WEAPONS, effect: { kind: 'pool', tag: 'destruction' } },
  { id: 'uhtreds-sidereus', name: 'Uhtred’s Sidereus', categories: ['Boots'], effect: { kind: 'pool', tag: 'chronomancy' } },
  { id: 'kolrs-hunt', name: 'Kolr’s Hunt', categories: ['Gloves'], effect: { kind: 'pool', tag: 'marksman' } },
  { id: 'katlas-gloom', name: 'Katla’s Gloom', categories: ['Gloves'], effect: { kind: 'pool', tag: 'decay' } },
  { id: 'voranas-carnage', name: 'Vorana’s Carnage', categories: ['Helmets'], effect: { kind: 'pool', tag: 'berserking' } },
  { id: 'medveds-tending', name: 'Medved’s Tending', categories: ['Body_Armours'], effect: { kind: 'pool', tag: 'soul' } },
  {
    id: 'passion-of-aldur', name: 'Passion of Aldur', categories: WEAPONS,
    effect: { kind: 'convert', element: 'fire', eats: ['cold', 'lightning'] },
  },
  {
    id: 'ire-of-aldur', name: 'Ire of Aldur', categories: WEAPONS,
    effect: { kind: 'convert', element: 'lightning', eats: ['fire', 'cold'] },
  },
  {
    id: 'breath-of-aldur', name: 'Breath of Aldur', categories: WEAPONS,
    effect: { kind: 'convert', element: 'cold', eats: ['fire', 'lightning'] },
  },
  {
    id: 'betrayal-of-aldur', name: 'Betrayal of Aldur', categories: WEAPONS,
    effect: { kind: 'convert', element: 'chaos', eats: ['fire', 'cold', 'lightning'] },
  },
];

export const RUNE_BY_ID: ReadonlyMap<string, Rune> = new Map(RUNES.map((r) => [r.id, r]));

/** Price keys are `rune:<id>`, matching the sheet `prices.mjs` writes from poe.ninja's Runes feed. */
export const runePriceKey = (rune: string): string => `rune:${rune}`;

/**
 * The base a craft actually runs on, once the player says which runes are socketed.
 *
 * ONE place changes anything. Every planner reads its limits through `limitsOf(base)` and its pools off
 * the base it is handed, so a rune that raises a limit reaches all of them at once and nothing
 * downstream ever learns the word "rune". A rune that does not fit the base is ignored, as is an
 * unknown id — a share link carries these, and a link from a future patch must not throw.
 */
export function withRunes(base: ItemBase, runeIds: readonly string[]): ItemBase {
  const limits = limitsWithRunes(base.category, runeIds, base.limits);
  return limits === (base.limits ?? DEFAULT_LIMITS) ? base : { ...base, limits };
}

/**
 * The same rule by CATEGORY, for callers holding no engine base — the pickers, which decide what a
 * player may add next and must agree with the planners about how much the item can hold.
 *
 * Returns the given limits unchanged (by identity) when no rune applies, which is what lets
 * `withRunes` hand back the very base it was given.
 */
export function limitsWithRunes(
  category: string, runeIds: readonly string[], from?: ItemLimits,
): ItemLimits {
  const base = from ?? DEFAULT_LIMITS;
  const fitted = runeIds
    .map((id) => RUNE_BY_ID.get(id))
    .filter((r): r is Rune => r !== undefined && (r.categories.length === 0 || r.categories.includes(category)));
  if (fitted.length === 0) return base;
  const limits = { ...base };
  for (const r of fitted) {
    if (r.effect.kind === 'crafted') limits.crafted += r.effect.plus;
    else if (r.effect.kind === 'suffix') limits.suffixes += r.effect.plus;
    // 'pool' and 'convert' runes raise no limit: a pool rune adds modifiers to what the base can roll
    // (merged here once those pools are in the data), and an Aldur rune rewrites finished ones.
  }
  return limits;
}

/** The runes that fit a base. A rune with no categories fits every one of them. */
export function runesFor(base: ItemBase): readonly Rune[] {
  return RUNES.filter((r) => r.categories.length === 0 || r.categories.includes(base.category));
}

/**
 * Which Aldur rune produces which element.
 *
 * Every one of the four is named by the game data rather than guessed: `RuneConvertFire` says
 * "Transforms all Cold and Lightning modifiers on the item into equivalent Fire modifiers", and its
 * three siblings say the same for Lightning, Cold and Chaos. Before that scan only fire was traced —
 * from a real staff carrying "Forged by the Passion of Aldur" beside two gain-as-extra-FIRE
 * modifiers — and `runeRoute` declined every other element rather than guess one.
 */
export const ALDUR_RUNE_BY_ELEMENT: ReadonlyMap<string, string> = new Map(
  RUNES.flatMap((r) => (r.effect.kind === 'convert' ? [[r.effect.element, r.id] as const] : [])),
);

/** What an Aldur rune consumes, for the caveat: socketing it converts these too. */
export const aldurEats = (runeId: string): readonly string[] => {
  const e = RUNE_BY_ID.get(runeId)?.effect;
  return e?.kind === 'convert' ? e.eats : [];
};
