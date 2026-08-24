// "How hard should I look?" — the player's own limit on solver work, remembered between visits.
//
// Three throttles already existed and were all hard-coded constants: value iteration's sweep cap, the
// budget search's node cap, and the orb-strength search's plan cap. Each one is a guess about how long
// someone is willing to wait, and that is not a guess the app is in a position to make — a player on a
// fast machine chasing one specific item may happily wait two minutes, while someone browsing wants an
// answer now. So it becomes a setting.
//
// It is honest by construction because the caps already announce themselves: the frontier badge says
// when the orb search was reduced, the alternatives badge says when it stopped early, and an
// unconverged cost renders as "≥ x". Raising the effort makes those disappear. That is the loop —
// the app says where it gave up, and the user decides whether to pay for more.

import { useSyncExternalStore } from 'react';
import { PREFS_PREFIX } from './currencyPrefs.ts';

/** The limits one preset applies. Plain numbers: this crosses to the worker by structured clone. */
export interface EffortLimits {
  /**
   * Wall-clock ceiling for the MDP's value iteration. Absent in tests, so they stay deterministic —
   * only the app sets it. Hitting it yields `converged: false`, which the UI already renders as a
   * lower bound ("≥ x") rather than an answer.
   */
  readonly maxMillis: number;
  /** Relaxed targets the budget search may evaluate. Each costs a full Pareto run, so this is the
   *  dominant cost of a budgeted craft. */
  readonly maxNodes: number;
  /**
   * Plans the orb-strength search may enumerate before it drops to a shallower currency depth.
   * NOTE this one saturates: a 6-target craft needs ~34,560 plans for the full search, so anything
   * past the Standard value buys nothing there. It only bites on targets big enough to be throttled,
   * which is exactly when the frontier badge says so.
   */
  readonly maxPlans: number;
}

export interface EffortPreset {
  readonly id: string;
  readonly label: string;
  /** Shown next to the control — says what the user is actually trading. */
  readonly hint: string;
  readonly limits: EffortLimits;
}

/**
 * Presets, with the numbers MEASURED rather than invented. Probe: 6 tiered targets on Wands with a
 * budget, `data/patches/0.5.0`.
 *
 *   orb search   25k plans → 0.32s (reduced depth) · 100k → 0.42s (FULL) · 400k → 0.42s
 *   budget search  100 nodes → 7.0s · 200 nodes → 14.1s     ⇒ ~70ms per node, linear
 *
 * Two things follow. The orb search **saturates** — a 6-target craft needs ~34.5k plans for the full
 * search, so raising `maxPlans` past Standard buys nothing there and only matters on targets big
 * enough to be throttled (which the frontier badge says out loud). And the node cap IS the wall clock
 * for a budgeted craft, so the hints below quote the time it actually implies rather than an adverb.
 *
 * `standard` is the default and reproduces exactly what the app did before this setting existed, so
 * upgrading changes nobody's results.
 */
export const EFFORT_PRESETS: readonly EffortPreset[] = [
  {
    id: 'quick',
    label: 'Quick',
    hint: 'A few seconds. More likely to report that it stopped early.',
    limits: { maxMillis: 2_000, maxNodes: 100, maxPlans: 25_000 },
  },
  {
    id: 'standard',
    label: 'Standard',
    hint: 'The default — around 15s on a big budgeted craft.',
    limits: { maxMillis: 15_000, maxNodes: 200, maxPlans: 100_000 },
  },
  {
    id: 'thorough',
    label: 'Thorough',
    hint: 'Roughly a minute on a big budgeted craft. Finds more alternatives.',
    limits: { maxMillis: 60_000, maxNodes: 600, maxPlans: 400_000 },
  },
  {
    id: 'patient',
    label: 'Patient',
    hint: 'Several minutes. Worth it when a badge says the search stopped early.',
    limits: { maxMillis: 300_000, maxNodes: 2_000, maxPlans: 2_000_000 },
  },
];

export const DEFAULT_EFFORT = 'standard';

/**
 * Is this already the hardest the solver will look?
 *
 * The app's standing answer to a result that stopped early is "raise Search effort" — true at every
 * preset but the last, where it sends the reader to a control with nothing above it. Derived from the
 * list rather than named, so adding a tier above cannot leave this pointing at the old top.
 */
export function isTopEffort(id: string): boolean {
  return id === EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!.id;
}

export function limitsFor(id: string): EffortLimits {
  return (EFFORT_PRESETS.find((p) => p.id === id) ?? EFFORT_PRESETS.find((p) => p.id === DEFAULT_EFFORT)!).limits;
}

export const EFFORT_STORAGE_KEY = `${PREFS_PREFIX}effort.v1`;

function read(): string {
  try {
    const raw = localStorage.getItem(EFFORT_STORAGE_KEY);
    // An unknown id (a preset renamed in a later version) must fall back, not wedge the app on limits
    // that no longer exist.
    return raw && EFFORT_PRESETS.some((p) => p.id === raw) ? raw : DEFAULT_EFFORT;
  } catch {
    return DEFAULT_EFFORT; // unreadable or unavailable storage must not stop the app from planning
  }
}

let current = read();
const listeners = new Set<() => void>();

export function getEffort(): string {
  return current;
}

export function setEffort(next: string): void {
  current = next;
  try {
    localStorage.setItem(EFFORT_STORAGE_KEY, next);
  } catch {
    // Storage full or blocked (private mode). The setting still applies for this session.
  }
  for (const l of listeners) l();
}

/** Read the shared effort setting, re-rendering when any component changes it. */
export function useEffort(): string {
  return useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => listeners.delete(onChange); },
    getEffort,
    getEffort, // server snapshot — same value; there is no SSR here
  );
}
