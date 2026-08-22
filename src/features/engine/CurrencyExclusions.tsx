import React, { useState } from 'react';
import {
  ALL_GROUPS, describeGroup, setExclusions, toExcludedKeys, useExclusions,
  type CurrencyGroup, type Exclusions,
} from '../../lib/currencyPrefs';

/**
 * "Which currencies don't you have?" — so the planners stop recommending routes you can't run.
 *
 * Each row is a group you mark as missing. Marking it excludes the whole group; ticking members inside
 * narrows the exclusion to just those. That rule is non-monotone (unticking your last member widens
 * the exclusion back to everything), so **every ticked row states its effect in words** — the jump is
 * never silent, which is the whole reason the plain-language line exists.
 *
 * The setting is shared and persisted (see currencyPrefs), so both planners always run under the same
 * rules and it survives a reload.
 */
const CurrencyExclusions: React.FC = () => {
  const exclusions = useExclusions();
  const [open, setOpen] = useState(false);
  const excludedCount = toExcludedKeys(exclusions).length;

  const toggleGroup = (g: CurrencyGroup) => {
    const next: Record<string, { only: readonly string[] }> = { ...exclusions };
    if (next[g.id]) delete next[g.id];
    else next[g.id] = { only: [] }; // marking a group starts at "all of it"
    setExclusions(next as Exclusions);
  };

  const toggleMember = (g: CurrencyGroup, memberId: string) => {
    const only = exclusions[g.id]?.only ?? [];
    const nextOnly = only.includes(memberId) ? only.filter((m) => m !== memberId) : [...only, memberId];
    setExclusions({ ...exclusions, [g.id]: { only: nextOnly } } as Exclusions);
  };

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Currency I don’t have
        </span>
        <span className="text-xs text-muted-foreground">
          {excludedCount === 0 ? 'nothing excluded' : `${excludedCount} excluded`}{' '}
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground">
            Plans will never use anything you tick here. If that makes a craft impossible, you’ll be told
            rather than shown a plan you can’t run.
          </p>
          {ALL_GROUPS.map((g) => {
            const entry = exclusions[g.id];
            const on = entry !== undefined;
            return (
              <div key={g.id} className="text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={on} onChange={() => toggleGroup(g)} />
                  <span>{g.label}</span>
                  {on && (
                    <span className="text-[11px] text-amber-300">— {describeGroup(g, entry.only)}</span>
                  )}
                </label>
                {/* Narrowing only appears once the group is marked, and only where there is something
                    to narrow: Alchemy, Annulment and Desecration have exactly one version each. */}
                {on && g.members.length > 0 && (
                  <div className="ml-6 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {g.members.map((m) => (
                      <label key={m.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.only.includes(m.id)}
                          onChange={() => toggleMember(g, m.id)}
                        />
                        <span>{m.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {excludedCount > 0 && (
            <button
              type="button"
              onClick={() => setExclusions({})}
              className="text-xs underline text-muted-foreground hover:text-foreground"
            >
              Clear all — I have everything
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyExclusions;
