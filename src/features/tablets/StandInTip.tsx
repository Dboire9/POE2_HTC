import React from 'react';
import { cn } from '../../lib/utils';
import { standInFilters, type StandIn } from '../../lib/tablets';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const WORDS = ['no', 'one', 'two'];
const side = (n: number, one: string): string => `${WORDS[n] ?? n} ${one}${n > 1 ? 'es' : ''}`; // "no suffix", "one suffix", "two suffixes"

/** "Magic · one prefix, no suffix" — what the listing holds, all of it junk to this craft. */
export const standInName = (s: StandIn): string =>
  `${s.rarity === 'magic' ? 'Magic' : 'Rare'} · ${side(s.prefixes, 'prefix')}, ${side(s.suffixes, 'suffix')}`;

/**
 * Buy a tablet someone already rolled instead of a plain one — worth it when its junk sits where the
 * craft does not need the room (Dorian, 2026-09-23). Every shape worth at least 90% of a plain tablet,
 * with the most to pay for it and the search for it; the numbers come from the solve (`standIns`).
 */
export const StandInTip: React.FC<{
  standIns: readonly StandIn[];
  plainCost: number;
  fmt: (ex: number) => string;
  /** The trade search for tablets of this shape, or '' without a league. */
  urlFor: (s: StandIn, filters: ReturnType<typeof standInFilters>['filters']) => string;
}> = ({ standIns, plainCost, fmt, urlFor }) => {
  if (!(plainCost > 0) || standIns.length === 0) return null;
  const worthIt = standIns.filter((s) => s.worth >= 0.9 * plainCost);
  return (
    <div className="space-y-2 rounded-md border border-sky-500/30 bg-sky-500/5 p-3 text-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-300">Tip · buy one already rolled</h4>
      {worthIt.length === 0 ? (
        <p className="text-muted-foreground">
          No tablet someone has already rolled is worth even 90% of a plain one on this craft — the best,{' '}
          {standInName(standIns[0]!)}, is worth {fmt(standIns[0]!.worth)}. Its modifiers take room the plan needs; buy plain.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground">
            A tablet carrying only modifiers you do not want can stand in for a plain one, when they sit where the craft
            has room to spare. Pay no more than this for one — a plain tablet is {fmt(plainCost)}:
          </p>
          <ul className="space-y-1.5">
            {worthIt.map((s) => {
              const { filters, loose } = standInFilters(s);
              const url = urlFor(s, filters);
              return (
                <li key={`${s.rarity}${s.prefixes}${s.suffixes}`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-[14rem]">{standInName(s)}</span>
                  <span className="tabular-nums">
                    worth up to <strong className={cn(s.worth > plainCost ? 'text-emerald-400' : 'text-foreground')}>{fmt(s.worth)}</strong>
                    {s.worth > plainCost * 1.02 && <span className="text-xs text-emerald-300"> — more than a plain one</span>}
                  </span>
                  {url && (
                    <a
                      href={url} target="_blank" rel="noopener noreferrer"
                      aria-label={`Search on trade for ${standInName(s)}`}
                      title={loose
                        ? 'Opens the trade site. The site may count a Rare’s empty slots out of three a side, so this can also list a tablet with one modifier fewer on its full side — check the listing.'
                        : 'Opens the trade site with this search filled in'}
                      className={cn('rounded border border-border px-1.5 py-0.5 text-xs hover:border-primary/60 hover:text-foreground', FOCUS)}
                    >
                      Search on trade{loose && <span aria-hidden="true" className="ml-1 text-amber-400">≈</span>}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
