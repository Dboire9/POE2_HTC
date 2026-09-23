import React from 'react';
import { cn } from '../../lib/utils';
import { standInFilters, type StandIn } from '../../lib/tablets';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** "Magic · one prefix, no suffix" — what the listing holds, all of it junk to this craft. */
export const standInName = (s: StandIn): string =>
  `Magic · one ${s.side}, no ${s.side === 'prefix' ? 'suffix' : 'prefix'}`;

/**
 * Buy a Magic tablet someone already rolled instead of a plain one (Dorian, 2026-09-23): one with a single
 * prefix, one with a single suffix, each with the most it is worth and the search for it. Both are always
 * shown — "worth less than a plain one" is as useful as "worth more": it is the price to buy it under.
 */
export const StandInTip: React.FC<{
  standIns: readonly StandIn[];
  plainCost: number;
  fmt: (ex: number) => string;
  /** The trade search for Magic tablets of this shape, or '' without a league. */
  urlFor: (filters: ReturnType<typeof standInFilters>) => string;
}> = ({ standIns, plainCost, fmt, urlFor }) => {
  if (!(plainCost > 0) || standIns.length === 0) return null;
  return (
    <div className="space-y-2 rounded-md border border-sky-500/30 bg-sky-500/5 p-3 text-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-300">Tip · buy a Magic one instead</h4>
      <p className="text-muted-foreground">
        A Magic tablet with one modifier you do not want can stand in for a plain one — worth more when the
        modifier sits on the side the craft does not need. Pay no more than this for one; a plain tablet is {fmt(plainCost)}:
      </p>
      <ul className="space-y-1.5">
        {standIns.map((s) => {
          const url = urlFor(standInFilters(s));
          const ratio = s.worth / plainCost;
          return (
            <li key={s.side} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="min-w-[14rem]">{standInName(s)}</span>
              <span className="tabular-nums">
                worth up to <strong className={cn(ratio > 1.02 ? 'text-emerald-400' : ratio < 0.9 ? 'text-amber-300' : 'text-foreground')}>{fmt(s.worth)}</strong>
                <span className="text-xs text-muted-foreground">
                  {ratio > 1.02 ? ' — more than a plain one' : ratio < 0.9 ? ' — less than a plain one: only under this price' : ' — about a plain one'}
                </span>
              </span>
              {url && (
                <a
                  href={url} target="_blank" rel="noopener noreferrer"
                  aria-label={`Search on trade for ${standInName(s)}`}
                  title="Opens the trade site: Magic, 10 uses, this one modifier and nothing on the other side, instant buyout, cheapest first"
                  className={cn('rounded border border-border px-1.5 py-0.5 text-xs hover:border-primary/60 hover:text-foreground', FOCUS)}
                >
                  Search on trade
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
