// "How hard should I look?" — the player's own limit on solver work, remembered between visits.
//
// Three throttles already existed and were all hard-coded constants: value iteration's sweep cap, the
// budget search's node cap, and the orb-strength search's plan cap. Each one is a guess about how long
// someone is willing to wait, and that is not a guess the app is in a position to make — a player on a
// fast machine chasing one specific item may happily wait two minutes, while someone browsing wants an
// answer now. So it becomes a setting.
//
// It is honest by construction because the caps already announce themselves: the frontier badge says
// when the orb search was reduced, the alternatives badge says when it stopped early, and a truncated
// cost renders with the inequality `bound` names — "≤ x" from a white base, "≥ x" from a held item;
// never guess the direction. Raising the effort makes those disappear. That is the loop —
// the app says where it gave up, and the user decides whether to pay for more.

import { useSyncExternalStore } from 'react';
import { PREFS_PREFIX } from './currencyPrefs.ts';

/** The limits one preset applies. Plain numbers: this crosses to the worker by structured clone. */
export interface EffortLimits {
  /**
   * Wall-clock ceiling for the MDP. Absent in tests, so they stay deterministic — only the app sets
   * it. Hitting it yields `converged: false`, which the UI renders as the inequality `bound` names
   * rather than as an answer. It does NOT bound a budgeted craft's total: the budget search is capped
   * by `maxNodes`, and `clockLeft()` hands the model only what is left over.
   */
  readonly maxMillis: number;
  /** Relaxed targets the budget search may evaluate. Each costs a full Pareto run, so this is the
   *  dominant cost of a budgeted craft. */
  readonly maxNodes: number;
  /**
   * Value-iteration sweeps the MDP may run.
   *
   * This was a hardcoded 100,000 and NOT on the ladder, which made the top preset a lie: on a craft
   * that exhausts its sweeps the clock never binds, so "Patient — several minutes" offered time the
   * solver had no way to spend, and the panel then told the reader they were already at maximum. The
   * effect was measured: a six-target T1 craft ran 1,035s and stopped on the sweep cap, not the clock.
   *
   * Raising it is not free and not a cure — the same craft needs ~1.1 MILLION more sweeps (~2.8
   * hours) to actually converge, and that is a floor because the decay rate itself degrades. So the
   * ladder buys real headroom for the crafts near the edge. (This used to name a `sweepBound` helper
   * "below" as the thing that stops the UI over-promising. No such function exists, or ever did —
   * `isTopEffort` is what the copy actually consults.)
   */
  readonly maxSweeps: number;
  /**
   * Which solver runs the MDP's second phase.
   *
   * `'value'` is Gauss-Seidel value iteration — the shipped path, and it stops on a residual
   * TOLERANCE, so on a long-odds craft it runs out and the app prints a ceiling. `'policy'` is policy
   * iteration, which ends on a CERTIFICATE instead: when the policy stops changing, no action
   * anywhere improves on it, so it is optimal and the cost is exact.
   *
   * EVERY rung names `'policy'`, and the field stays optional only because callers outside the ladder
   * need to ask for `'value'` — the differential tests that license the fast path are exactly that.
   *
   * It used to be the top rung alone, on the reasoning that `standard` should reproduce what the app
   * did before this setting existed. A campaign over 18 realistic crafts and 108 solves retired that:
   * PI did not lose a single cell, and VI's ceilings are not a rounding matter.
   *
   *                exact   ceiling   no number        (of 18 crafts)
   *   Quick / VI       6         4           8
   *   Quick / PI      10         0           8
   *   Standard / VI    9         5           4
   *   Standard / PI   14         0           4
   *   Thorough / VI   10         6           2
   *   Thorough / PI   16         0           2
   *
   * PI produced a ceiling ZERO times: it either solves exactly or says it could not start. Waiting
   * does not rescue VI — given Patient's full 300s it still returned a ceiling on 7 of 8 hard crafts,
   * up to 2.45x high, where PI was exact on 8 of 8 and mostly under 22s. Switching solver beats
   * raising effort outright: wand-4-T2 is `<=110,585` under VI at Thorough (60s) and the exact 50,934
   * under PI at STANDARD (6.7s).
   *
   * **It cannot regress a number into a refusal**, which is the property that makes this safe rather
   * than merely better on average. "No number" comes from PHASE A failing, and phase A is plain VI on
   * both paths — `markovFromItem` returns `fail(...)` before the solver choice is read. A phase B that
   * runs out under PI yields `bound: 'upper'`, the same kind of ceiling VI gives. The measured
   * no-number counts are identical at every rung (8/8, 4/4, 2/2), as that predicts.
   *
   * Where both converge they agree to 1e-6, which is what licenses the swap at all.
   */
  readonly solver?: 'value' | 'policy';
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
 * RE-MEASURED 2026-08-28, same shape (6 T2 targets on Wands, budget 600), interleaved, 3 reps:
 * Standard **24.9s**, Thorough **84.8s** — end to end, which is what a reader actually waits. The
 * hints previously said 15s and "roughly a minute", quoting the budget search ALONE and leaving the
 * MDP out of a number the user experiences as one wait. Note `maxMillis` does not bound this: the
 * budget search is capped by nodes, and `clockLeft()` governs only the model, so a preset's clock is
 * the MDP's ceiling rather than the craft's. Solver-independent — VI and PI came out within noise of
 * each other at both rungs (24.86 vs 24.45; 84.78 vs 85.38), which is what the node-bound reading
 * predicts.
 *
 * WHAT SEPARATES THE RUNGS IS TIME, NOT RIGOUR. Every one of them runs policy iteration, which ends on
 * a proof that the policy is optimal; they differ only in how long they may take to reach one. So the
 * hints quote a budget, and none of them may claim the proof as its own — that was Exhaustive's line
 * when it was the only rung switching solver, and it is now true everywhere.
 *
 * `standard` reproduces what the app did before this setting existed **in the orb search**, which is
 * what `searchEffort.test.ts` pins (`plansEvaluated`, `currencyDepth`). It deliberately no longer does
 * in the MDP: where both solvers converge the cost moves in its last digits (46.35832651235128 →
 * 46.33367129388143 on a 2-target Wand, PI being the exact one), and where VI ran out its ceiling
 * becomes a real number. Both are the answer improving, not drifting — see the table on `solver`.
 */
export const EFFORT_PRESETS: readonly EffortPreset[] = [
  {
    id: 'quick',
    label: 'Quick',
    hint: 'A couple of seconds. Likeliest to come back asking for longer instead of an answer.',
    limits: { maxMillis: 2_000, maxNodes: 100, maxSweeps: 25_000, solver: 'policy' },
  },
  {
    id: 'standard',
    label: 'Standard',
    hint: 'The default — around 25s on a big budgeted craft.',
    limits: { maxMillis: 15_000, maxNodes: 200, maxSweeps: 100_000, solver: 'policy' },
  },
  {
    id: 'exhaustive',
    label: 'Exhaustive',
    hint: 'Minutes. For the crafts nothing shorter can finish — every one measured settled inside five.',
    limits: {
      maxMillis: 900_000, maxNodes: 4_000, maxSweeps: 20_000_000, solver: 'policy',
    },
  },
];

/**
 * Rungs that used to exist, mapped to the one that replaced them.
 *
 * `Thorough` and `Patient` were dropped on 2026-08-29 because they overlapped rather than because
 * effort stopped mattering — the gradient is real (Quick resolved 10 of 18 measured crafts exactly,
 * Standard 14, Thorough 16, Patient 18). Patient and Exhaustive returned BYTE-IDENTICAL costs on every
 * hard craft, so that pair was genuinely one rung wearing two names; Thorough sat between neighbours
 * that already bracketed it.
 *
 * They map UP, not to the default. `read()` falls back to `standard` for an id it does not recognise,
 * which is right for a corrupt value and wrong for this: someone who deliberately chose Patient would
 * be quietly moved to a SHORTER search and get a worse answer without being told. Removing a rung must
 * not silently spend less of a user's patience than they asked for.
 */
const RETIRED_EFFORT: Record<string, string> = { thorough: 'exhaustive', patient: 'exhaustive' };

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
  // Retired ids resolve here too, not only in `read()` — anything holding a stored id (a worker
  // message, a test, a URL) must get the successor rather than be silently dropped to the default.
  const want = RETIRED_EFFORT[id] ?? id;
  return (EFFORT_PRESETS.find((p) => p.id === want) ?? EFFORT_PRESETS.find((p) => p.id === DEFAULT_EFFORT)!).limits;
}

export const EFFORT_STORAGE_KEY = `${PREFS_PREFIX}effort.v1`;

function read(): string {
  try {
    const raw = localStorage.getItem(EFFORT_STORAGE_KEY);
    if (raw && EFFORT_PRESETS.some((p) => p.id === raw)) return raw;
    // A rung this build retired resolves to its successor — see RETIRED_EFFORT for why that is upward.
    if (raw && RETIRED_EFFORT[raw]) return RETIRED_EFFORT[raw];
    // Anything else (a corrupt value, a preset renamed in a later version) must fall back rather than
    // wedge the app on limits that no longer exist.
    return DEFAULT_EFFORT;
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
