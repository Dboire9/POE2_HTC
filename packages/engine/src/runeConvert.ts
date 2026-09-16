import type { ItemBase, PatchData } from './types.ts';
import { resolveMod } from './pool.ts';
import { ALDUR_RUNE_BY_ELEMENT, aldurEats, runePriceKey } from './runes.ts';

/**
 * Stacking a modifier the family rules forbid, by rolling its siblings and converting them.
 *
 * An item may carry at most one modifier per exclusion family, so "two of `Gain #% of Damage as Extra
 * Fire`" is not craftable — and yet a real staff carries two, at 71% and 62%, which the game sums on
 * screen into `133%`. The route is an **Aldur rune**: it converts EVERY `gain as extra <element>`
 * modifier on the item to its own element, so you roll the SIBLINGS — fire, cold, lightning are three
 * different families and coexist perfectly happily — and then socket the rune.
 *
 * THE ENGINE NEVER SEES TWO MODS OF ONE FAMILY, which is the whole point of doing it this way. During
 * the craft the targets are genuinely cross-family, so this needs no state axis, no exception to
 * family exclusion, and no change to any probability: it is an ordinary multi-prefix craft plus one
 * deterministic step at the end. Modelling the conversion as a mechanic instead would have meant
 * making family exclusion conditional, which every pool denominator in the engine depends on.
 *
 * Mechanic confirmed by the user 2026-09-09: the rune is SOCKETED (so it costs a rune socket as well
 * as its price), each rune fixes the element rather than the player choosing, it converts ALL of them
 * rather than one, and nothing gates it.
 */

/**
 * `Gain #% of Damage as Extra Fire Damage` -> `fire`. The element is in the data, not a list — read off
 * the mod's TEXT rather than its stat id (`…_to_gain_as_fire`), because text is what the browser has:
 * `tiers[].stats` is stripped from the asset it downloads (shipMods.ts). Reading the stat id, this found
 * nothing in the app while every test — each loading the full file — passed: the streamer tab sent the
 * Aldur staff to the Lab as five modifiers, and the Lab never mentioned the rune.
 */
const GAIN_AS = /^Gain #% of Damage as Extra ([A-Za-z]+) Damage$/;

/**
 * Which rune makes which element — and what it eats getting there — lives in `runes.ts`.
 *
 * All four are named by the game data now (`RuneConvertFire`: "Transforms all Cold and Lightning
 * modifiers on the item into equivalent Fire modifiers", and its Lightning, Cold and Chaos siblings).
 * Before that scan only fire was traced, from a real staff carrying "Forged by the Passion of Aldur"
 * beside two gain-as-extra-FIRE modifiers, and this declined every other element rather than guess.
 */

/**
 * The two costs that are NOT in the plan's arithmetic, in words: the socket the rune spends, and the
 * modifiers it takes with it. Naming the elements it eats is the honest form — a cold sibling the
 * player meant to keep does not survive Passion of Aldur, and the sentence should say which ones.
 */
const caveatFor = (rune: string, element: string): string => {
  const eats = aldurEats(rune);
  const list = eats.length > 1 ? `${eats.slice(0, -1).join(', ')} and ${eats[eats.length - 1]}` : eats[0] ?? 'other';
  return `Socketing ${rune} spends a rune socket and converts EVERY ${list} "gain as extra" modifier `
    + `on the item to ${element} — including any you meant to keep.`;
};

/**
 * Every `gain as extra <element>` modifier a base can ROLL, by element — from its normal pool, since a
 * route's siblings are rolled with ordinary currency. Twelve bases carry all three (the Staves and Wands
 * families); everything else carries none.
 *
 * Carved and essence ones exist too — Staves' desecrated Extra Chaos, Wands' Extra Physical, the martial
 * weapons' Perfect Essences — and are deliberately not siblings: whether a route may use them is
 * untraced, and an item holds at most one essence and one carved modifier besides. The stat-id version
 * never saw them either, since neither pool carries stats; runeConvert.test.ts pins that the two agree
 * on every base.
 */
export function gainAsExtraByElement(data: PatchData, base: ItemBase): ReadonlyMap<string, string> {
  const out = new Map<string, string>();
  for (const id of [...base.pools.normal.prefixes, ...base.pools.normal.suffixes]) {
    const text = resolveMod(data, id).text;
    const element = (text === null ? null : GAIN_AS.exec(text))?.[1]?.toLowerCase();
    if (element !== undefined && !out.has(element)) out.set(element, id);
  }
  return out;
}

export interface RuneRoute {
  /**
   * What to craft, one SLOT per copy asked for. The first is the asked-for modifier itself, since it
   * needs no conversion to be worth having. Each other slot lists the siblings that can stand for a
   * copy, any one of which does: the rune converts them all alike, so a Lightning landing where Cold was
   * planned is simply a finish. Every candidate is a different element, so a different exclusion family.
   */
  readonly slots: readonly (readonly string[])[];
  /** The rune to socket once the craft is done. */
  readonly rune: string;
  /** The price key for it, which must exist on the sheet — `stepCost` charges 0 for a missing one. */
  readonly priceKey: string;
  /** The element every gain-as-extra modifier becomes. */
  readonly element: string;
  /**
   * What this costs beyond the craft, in words, because neither part is in the plan's arithmetic: a
   * rune SOCKET is spent, and the conversion takes every gain-as-extra modifier on the item — so a
   * sibling the player wanted to keep as cold does not survive it.
   */
  readonly caveat: string;
}

/**
 * The route for `count` copies of one gain-as-extra modifier, or nothing if there isn't one.
 *
 * Declines rather than improvises: a count of one is an ordinary craft and needs no rune; a count
 * above the number of sibling elements the base rolls cannot be reached at all; and an element with
 * no confirmed rune gets no route rather than a guessed one.
 */
export function runeRoute(
  data: PatchData, base: ItemBase, modId: string, count: number,
): RuneRoute | undefined {
  if (count < 2) return undefined;
  const byElement = gainAsExtraByElement(data, base);
  const element = [...byElement].find(([, id]) => id === modId)?.[0];
  if (element === undefined) return undefined;
  const rune = ALDUR_RUNE_BY_ELEMENT.get(element);
  if (rune === undefined) return undefined;
  if (count > byElement.size) return undefined;
  // The wanted element first, then its siblings in the data's order, so the list is stable. ONE copy to
  // fill from several siblings is a slot of all of them — naming one would throw away every roll that
  // lands another. Several copies name their siblings outright, which on a three-element base (every
  // shipped one) only happens when all of them are needed anyway.
  const others = [...byElement].filter(([e]) => e !== element).map(([, id]) => id);
  const need = count - 1;
  return {
    slots: [[modId], ...(need === 1 ? [others] : others.slice(0, need).map((id) => [id]))],
    rune,
    priceKey: runePriceKey(rune),
    element,
    caveat: caveatFor(rune, element),
  };
}

/** What a rune would do to the targets a player has already chosen. */
export interface RuneOpportunity {
  /** The chosen targets that are gain-as-extra modifiers, each once. */
  readonly modIds: readonly string[];
  /**
   * How many of them END ON the item: one per position. Alternatives in one slot fill one place, so
   * "Extra Cold or Extra Lightning" beside Extra Fire is two, not three.
   */
  readonly count: number;
  /** The elements those cover today, before the rune. */
  readonly elements: readonly string[];
  readonly rune: string;
  readonly priceKey: string;
  /** The one element they all become. */
  readonly element: string;
  readonly caveat: string;
}

/**
 * The rune worth mentioning for a target list that already exists, or nothing.
 *
 * The mirror of `runeRoute`, and the half a player actually meets: nothing in the app forbids asking
 * for `Extra Fire` AND `Extra Cold` — they are different families and the picker allows it — so the
 * gap was never permission, it was that nobody would think to, and that the plan then never mentions
 * the rune it needs at the end. This is what a panel can say once two of them are chosen.
 *
 * Offered whenever two or more of them will end on the item, whatever elements they are: the rune
 * converts every one of them regardless, so a player holding cold and lightning can still fuse them into
 * fire. That it may not be the element they wanted is exactly what `caveat` is for.
 *
 * Counted by POSITION, since a target list can hold alternatives: a slot of "Cold or Lightning" puts one
 * modifier on the item, not two, so on its own it has nothing to fuse with.
 */
export function runeOpportunities(
  data: PatchData, base: ItemBase, targets: readonly { readonly modId: string; readonly slot?: number }[],
): readonly RuneOpportunity[] {
  const byElement = gainAsExtraByElement(data, base);
  const byId = new Map([...byElement].map(([e, id]) => [id, e]));
  const chosen = targets.filter((t) => byId.has(t.modId));
  // One position per slot, and one per distinct unslotted mod — a duplicate id is one modifier, not two.
  const count = new Set(chosen.map((t) => (t.slot === undefined ? `mod:${t.modId}` : `slot:${t.slot}`))).size;
  if (count < 2) return [];
  const modIds = [...new Set(chosen.map((t) => t.modId))];
  const elements = modIds.map((id) => byId.get(id)!);
  // One option per rune whose element this base can ROLL. Converting to an element the base carries no
  // modifier for would describe an item nobody can build: the normal pools roll fire, cold and
  // lightning only, while chaos and physical exist as carved and essence lines, which are not siblings.
  return [...ALDUR_RUNE_BY_ELEMENT]
    .filter(([element]) => byElement.has(element))
    .map(([element, rune]) => ({
      modIds, count, elements, rune, priceKey: runePriceKey(rune), element, caveat: caveatFor(rune, element),
    }));
}

/**
 * The one to put in front of a player, of the several that now exist.
 *
 * It prefers an element they ALREADY asked for, because that is the option which loses them the least:
 * fusing Fire and Cold into fire keeps the fire they chose, while fusing both into lightning keeps
 * neither. With none of their elements available it falls back to the first rune the base can use, and
 * `runeOpportunities` has the rest for a caller that wants to offer the choice.
 */
export function runeOpportunity(
  data: PatchData, base: ItemBase, targets: readonly { readonly modId: string; readonly slot?: number }[],
): RuneOpportunity | undefined {
  const all = runeOpportunities(data, base, targets);
  return all.find((o) => o.elements.includes(o.element)) ?? all[0];
}
