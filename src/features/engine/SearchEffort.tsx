import React from 'react';
import { EFFORT_PRESETS, isTopEffort, setEffort, useEffort } from '../../lib/searchEffort';
import { WHITTLING_MEMBER, setExclusions, useExclusions } from '../../lib/currencyPrefs';

// "How hard should I look?" — the one control for the solver's three caps.
//
// It lived inline in EngineLab, inside the branch that renders the LAB tab. ItemActions called
// `useEffort()` and passed `limitsFor(effort)` to the solver, so a from-item craft obeyed a setting
// its own tab gave you no way to see or change — whatever you last picked on the other tab, or the
// default. Extracted so both tabs render the same control rather than one tab owning it.
//
// The store (src/lib/searchEffort.ts) is already shared and `useSyncExternalStore`-backed, so two
// mounted copies stay in step with no extra plumbing.
//
// Two exports rather than one with a flag: the control sits INSIDE a flex row of fields while the
// hint is a block beneath it, so a single component returning both would have to be a fragment and
// would drop the paragraph into the row.

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

/** The picker, as a labelled field sized to sit in a row of other fields. */
export const SearchEffort: React.FC = () => {
  const effort = useEffort();
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search effort
      </span>
      {/* The three solver caps were hard-coded guesses about someone else's patience. They stay
          honest either way — the badges say when a cap bit — but now the user can pay for more. */}
      <select
        className={`${selectCls} w-40`}
        value={effort}
        onChange={(e) => setEffort(e.target.value)}
        title={EFFORT_PRESETS.find((p) => p.id === effort)?.hint}
        aria-label="How hard the solver should look before giving up"
      >
        {EFFORT_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </label>
  );
};

/**
 * A pinned on/off for the Omen of Whittling, sitting beside Search effort on both tabs.
 *
 * Every other currency is opted OUT of, buried in the "Currency I don't have" panel, and that is the
 * right shape for "I don't own this". Whittling gets a pinned control for two reasons that do not
 * apply to the others: at ~4,700ex it is among the dearest things the planner can spend, and it is the
 * one omen a player flips per-craft rather than per-stash.
 *
 * It is NOT a second source of truth. It writes the same `omens.only` member the panel's own Whittling
 * row writes, so the two always agree and a link, a reload and the panel all see one state. Turning it
 * on here ticks the row there.
 *
 * Note what this does and does not fix: the optimizer already declines an omen that does not pay,
 * because it ranks plans BY cost, and a Whittling route lands on the frontier as its own row beside
 * the plain one. So this control does not protect anyone from a bad recommendation. It changes which
 * QUESTION is asked by default — "what if I have none" rather than "what if I can buy one" — which is
 * a preference, and belongs to the player rather than to the model.
 */
export const WhittlingToggle: React.FC = () => {
  const exclusions = useExclusions();
  const only = exclusions.omens?.only;
  // The group's semantics: absent = nothing excluded; present with `only` = just those members. So
  // Whittling is allowed exactly when the omens group is unmarked, or marked without it listed.
  const excluded = only !== undefined && only.includes(WHITTLING_MEMBER);

  const toggle = () => {
    const next: Record<string, { only: readonly string[] }> = { ...exclusions };
    const current = next.omens?.only ?? [];
    const wanted = excluded
      ? current.filter((m) => m !== WHITTLING_MEMBER)
      : [...current, WHITTLING_MEMBER];
    // An emptied `only` would mean "the WHOLE omen group is excluded" under this group's rules, which
    // is the opposite of what unticking the last member should do — so drop the group entirely there.
    if (wanted.length === 0) delete next.omens;
    else next.omens = { only: wanted };
    setExclusions(next);
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Whittling
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!excluded}
        title={excluded
          ? 'Off: plans are built as if you own no Omen of Whittling. Click to let the planner spend one.'
          : 'On: the planner may spend an Omen of Whittling (~4,700ex) to make a Chaos Orb remove the lowest-level modifier.'}
        className={`${selectCls} w-40 text-left ${excluded ? 'text-muted-foreground' : 'font-medium text-foreground'}`}
      >
        {excluded ? '✕ Not using' : '✓ May use'}
      </button>
    </label>
  );
};

/** What the current preset costs you, in words. A block, meant to sit under the row. */
export const SearchEffortHint: React.FC = () => {
  const effort = useEffort();
  return (
    <p className="text-[11px] text-muted-foreground">
      <strong>Search effort:</strong> {EFFORT_PRESETS.find((p) => p.id === effort)?.hint}{' '}
      {isTopEffort(effort)
        ? 'This is the highest setting — a result that still stops early has nothing left to raise.'
        : 'Raise it if a result says the search stopped early.'}
    </p>
  );
};

export default SearchEffort;
