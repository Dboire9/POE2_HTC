// "I don't have that currency" — the player's owned-stock declaration, shared by both planners and
// remembered between visits.
//
// Every plan the app produces assumes you own the whole game's currency, which is often false and, at
// current prices, expensive to assume: an Omen of Sinistral Annulment is ~4321ex against a ~158ex Orb
// of Annulment. A "best" plan you cannot execute is not advice.
//
// SHAPE OF THE SETTING. Each row is a group you mark as "I don't have this". Marking the group excludes
// all of it; ticking members inside narrows the exclusion to just those. That rule is non-monotone —
// unticking your last member widens the exclusion back to the whole group — so the UI must always state
// the current effect in words (see CurrencyExclusions.tsx). It is stored, not derived, because the UI
// needs to remember *which* narrowing you chose even while the group is toggled off.

import { useSyncExternalStore } from 'react';

/** One thing inside a group. `keys` are price-sheet keys — the vocabulary the planners exclude by. */
export interface GroupMember {
  readonly id: string;
  readonly label: string;
  readonly keys: readonly string[];
}

export interface CurrencyGroup {
  readonly id: string;
  readonly label: string;
  /** Empty when the currency has no variants (Alchemy, Annulment, Desecration) — render no sub-list. */
  readonly members: readonly GroupMember[];
  /** Price keys for a group with no members. Stated rather than inferred from `id`: they happen to
   *  match today, and a silent rename would then stop excluding anything. */
  readonly keys?: readonly string[];
  /** One line under the label, for a row whose effect the label cannot carry on its own. */
  readonly hint?: string;
}

const strengths = (base: string): GroupMember[] => [
  { id: 'base', label: 'Basic', keys: [base] },
  { id: 'greater', label: 'Greater', keys: [`${base}_greater`] },
  { id: 'perfect', label: 'Perfect', keys: [`${base}_perfect`] },
];

/**
 * Every excludable group, in the order the UI shows them. A group gets a sub-list when the currency has
 * versions to tell apart — the five tiered orb families and Essences do; Alchemy, Annulment and
 * Desecration have exactly one version each, so an expandable drawer there would open onto nothing.
 *
 * Member ids are the shortcut's vocabulary: any member called `greater` or `perfect` is picked up by
 * STRENGTH_GROUP below, so name them to match when adding a family.
 */
export const CURRENCY_GROUPS: readonly CurrencyGroup[] = [
  { id: 'chaos', label: 'Chaos Orbs', members: strengths('chaos') },
  { id: 'exalt', label: 'Exalted Orbs', members: strengths('exalt') },
  { id: 'annul', label: 'Orbs of Annulment', members: [], keys: ['annul'] },
  { id: 'alchemy', label: 'Orbs of Alchemy', members: [], keys: ['alchemy'] },
  { id: 'regal', label: 'Regal Orbs', members: strengths('regal') },
  { id: 'transmute', label: 'Orbs of Transmutation', members: strengths('transmute') },
  { id: 'augment', label: 'Orbs of Augmentation', members: strengths('augment') },
  {
    id: 'essence',
    label: 'Essences',
    members: [
      { id: 'lesser', label: 'Lesser', keys: ['essence_lesser'] },
      { id: 'normal', label: 'Normal', keys: ['essence'] },
      { id: 'greater', label: 'Greater', keys: ['essence_greater'] },
      { id: 'perfect', label: 'Perfect', keys: ['perfect_essence'] },
    ],
  },
  { id: 'desecrate', label: 'Desecration (bones)', members: [], keys: ['desecrate'] },
];

/**
 * Cross-cutting shortcut: "I own no Perfect orbs" otherwise means ticking Perfect under every family
 * that has one.
 *
 * Its keys are DERIVED from the groups above rather than listed a second time. Listing them was how
 * Essences escaped the shortcut for months — they carry `greater`/`perfect` members like the orbs do,
 * but the hardcoded family list never mentioned them, so a row labelled "any type" quietly meant "five
 * of the six". Deriving makes that class of drift impossible: a family gains the shortcut by existing.
 *
 * Note it deliberately does NOT reach Omens, which have no strengths — "Omen of Greater Exaltation" is
 * a distinct currency, not a Greater version of one, and the label says orbs and essences for that reason.
 */
const everyKeyFor = (memberId: string): string[] =>
  CURRENCY_GROUPS.flatMap((g) => g.members.filter((m) => m.id === memberId)).flatMap((m) => m.keys);

export const STRENGTH_GROUP: CurrencyGroup = {
  id: 'strengths',
  label: 'Greater and Perfect orbs and essences',
  hint: 'Shortcut: ticking Greater here is the same as ticking Greater under every orb and essence below. Omens are separate.',
  members: [
    { id: 'greater', label: 'Greater', keys: everyKeyFor('greater') },
    { id: 'perfect', label: 'Perfect', keys: everyKeyFor('perfect') },
  ],
};

export const OMEN_GROUP: CurrencyGroup = {
  id: 'omens',
  label: 'Omens',
  members: [
    { id: 'sinAnnul', label: 'Sinistral Annulment', keys: ['OmenofSinistralAnnulment'] },
    { id: 'dexAnnul', label: 'Dextral Annulment', keys: ['OmenofDextralAnnulment'] },
    { id: 'light', label: 'Light', keys: ['OmenofLight'] },
    { id: 'sinExalt', label: 'Sinistral Exaltation', keys: ['OmenofSinistralExaltation'] },
    { id: 'dexExalt', label: 'Dextral Exaltation', keys: ['OmenofDextralExaltation'] },
    { id: 'greaterExalt', label: 'Greater Exaltation', keys: ['OmenofGreaterExaltation'] },
    { id: 'sinCryst', label: 'Sinistral Crystallisation', keys: ['OmenofSinistralCrystallisation'] },
    { id: 'dexCryst', label: 'Dextral Crystallisation', keys: ['OmenofDextralCrystallisation'] },
    // NO Whittling row yet, deliberately. `currencyPrefs.test.ts` pins that every key here exists in
    // the shipped sheet, and `OmenofWhittling` does not — poe.ninja serves no omen endpoint, so the
    // quotes are hand-transcribed and this one has never been. The row would also lie: excluding an
    // omen the planner never offers changes nothing. Add it in the same commit as the quote.
    { id: 'sinNecro', label: 'Sinistral Necromancy', keys: ['OmenofSinistralNecromancy'] },
    { id: 'dexNecro', label: 'Dextral Necromancy', keys: ['OmenofDextralNecromancy'] },
    { id: 'blackblooded', label: 'the Blackblooded', keys: ['OmenoftheBlackblooded'] },
    { id: 'liege', label: 'the Liege', keys: ['OmenoftheLiege'] },
    { id: 'sovereign', label: 'the Sovereign', keys: ['OmenoftheSovereign'] },
  ],
};

export const ALL_GROUPS: readonly CurrencyGroup[] = [STRENGTH_GROUP, ...CURRENCY_GROUPS, OMEN_GROUP];

/**
 * Which groups are marked "I don't have this", and how each is narrowed.
 * `only` empty ⇒ the whole group. A group absent from the record is fully available.
 */
export type Exclusions = Readonly<Record<string, { readonly only: readonly string[] }>>;

const groupById = new Map(ALL_GROUPS.map((g) => [g.id, g]));

/** The price-sheet keys an exclusion set forbids — the only form the planners understand. */
export function toExcludedKeys(ex: Exclusions): string[] {
  const keys = new Set<string>();
  for (const [id, { only }] of Object.entries(ex)) {
    const group = groupById.get(id);
    if (!group) continue; // a stale id from an older build; ignore rather than throw at the user
    // A member-less group (Alchemy, Annulment, Desecration) carries its keys directly. Otherwise:
    // no narrowing means the whole group; a narrowing means exactly the members named.
    for (const k of group.keys ?? []) keys.add(k);
    const members = only.length > 0 ? group.members.filter((m) => only.includes(m.id)) : group.members;
    for (const m of members) for (const k of m.keys) keys.add(k);
  }
  return [...keys];
}

/** Plain-language description of what a group's current setting actually excludes. */
export function describeGroup(group: CurrencyGroup, only: readonly string[]): string {
  if (group.members.length === 0 || only.length === 0) return `excluding all ${group.label.toLowerCase()}`;
  const names = group.members.filter((m) => only.includes(m.id)).map((m) => m.label);
  return `excluding only ${names.join(', ')}`;
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Module-level rather than React context: it is one setting for the whole app, and `ItemActions` is
// unmounted when you switch tabs, so both planners must read one source or they could run under
// different rules — the kind of silent divergence that let the D8 pricing bug hide.

/** Everything under this prefix is a saved user PREFERENCE and survives the cache wipe in main.tsx. */
export const PREFS_PREFIX = 'poe2htc.';
export const STORAGE_KEY = `${PREFS_PREFIX}exclusions.v1`;

function read(): Exclusions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Exclusions) : {};
  } catch {
    return {}; // unreadable or unavailable storage must not stop the app from planning
  }
}

let current: Exclusions = read();
const listeners = new Set<() => void>();

export function getExclusions(): Exclusions {
  return current;
}

export function setExclusions(next: Exclusions): void {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode). The setting still applies for this session.
  }
  for (const l of listeners) l();
}

/** Read the shared exclusions, re-rendering when any component changes them. */
export function useExclusions(): Exclusions {
  return useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => listeners.delete(onChange); },
    getExclusions,
    getExclusions, // server snapshot — same value; there is no SSR here
  );
}
