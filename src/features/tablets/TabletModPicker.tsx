import React, { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { PER_SIDE, THIN_EVIDENCE, type TabletBase, type TabletMod } from '../../lib/tablets';

/** "1 in 7" — the rolls it takes, on average, for one roll on that side to be this modifier. */
export const oneIn = (share: number): string => `1 in ${share > 0 ? Math.round(1 / share).toLocaleString() : '—'}`;

// The same controls the Plan tab's modifier picker uses, so the two pickers read as one.
const inputCls =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

/**
 * One modifier: a single button that adds it, or — once picked — stays in place, highlighted with a
 * tick, and removes it on the next click. Nothing moves when you pick, so the list never jumps under the
 * pointer. A modifier that can't be added greys out with the reason written on the row itself.
 */
const Row: React.FC<{ mod: TabletMod; picked: boolean; reason: string | undefined; onToggle: () => void }> = ({
  mod, picked, reason, onToggle,
}) => {
  // A disabled button can't be focused, so a `title` alone would hide the reason from keyboard and
  // screen-reader users: it is real text, and the button points at it.
  const reasonId = reason === undefined ? undefined : `why-${mod.id}`;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={reason !== undefined}
      title={reason ?? (picked ? 'Click to remove' : 'Click to add')}
      aria-pressed={picked}
      aria-label={picked ? `Remove ${mod.text} from the tablet` : `Add ${mod.text}`}
      {...(reasonId ? { 'aria-describedby': reasonId } : {})}
      className={cn(
        'flex w-full items-start gap-2 border-l-2 px-2 py-1.5 text-left text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        picked ? 'border-l-primary bg-primary/15 hover:bg-primary/25' : 'border-l-transparent hover:bg-accent',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] leading-none',
          picked ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
        )}
      >
        {picked ? '✓' : ''}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block', picked && 'font-medium')}>{mod.text}</span>
        <span className="block text-xs text-muted-foreground">
          <span className="tabular-nums">{oneIn(mod.share)}</span> rolls on this side
          {mod.seen < THIN_EVIDENCE && (
            <span title="Read from few sightings, so the odds are rough"> · seen {mod.seen} times</span>
          )}
          {reasonId && <span id={reasonId}> · {reason}</span>}
        </span>
      </span>
    </button>
  );
};

/** One side's list, search-filtered, with how many of its two slots are picked. */
const Column: React.FC<{
  title: string;
  mods: readonly TabletMod[];
  picked: ReadonlySet<string>;
  count: number;
  blockFor: (m: TabletMod) => string | undefined;
  onToggle: (id: string) => void;
}> = ({ title, mods, picked, count, blockFor, onToggle }) => (
  <div className="min-w-0 flex-1">
    <div className="mb-1 flex items-center justify-between">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className={cn('text-xs tabular-nums', count >= PER_SIDE ? 'text-primary' : 'text-muted-foreground')}>
        {count} of {PER_SIDE} picked{count >= PER_SIDE ? ' — full' : ''}
      </span>
    </div>
    <div className="max-h-80 divide-y divide-border/50 overflow-y-auto rounded-md border border-border">
      {mods.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {mods.map((m) => (
        <Row key={m.id} mod={m} picked={picked.has(m.id)} reason={blockFor(m)} onToggle={() => onToggle(m.id)} />
      ))}
    </div>
  </div>
);

/**
 * Pick what you want on the tablet: search, click a modifier to add it, click it again to remove it. At
 * most two a side, and never two of one family — which on a tablet can span both sides ("Map contains
 * an additional Essence" and "increased chance to contain Essences" are one family). A ruled-out
 * modifier stays in the list and says why, rather than vanishing.
 */
export const TabletModPicker: React.FC<{
  tablet: TabletBase;
  chosen: readonly string[];
  ruledOut: ReadonlyMap<string, string>;
  onToggle: (id: string) => void;
}> = ({ tablet, chosen, ruledOut, onToggle }) => {
  const [search, setSearch] = useState('');
  const picked = new Set(chosen);
  const needle = search.trim().toLowerCase();
  const shown = (mods: readonly TabletMod[]): TabletMod[] =>
    mods.filter((m) => needle === '' || m.text.toLowerCase().includes(needle));
  const count = (mods: readonly TabletMod[]): number => mods.filter((m) => picked.has(m.id)).length;
  // A picked modifier is never blocked — it has to stay clickable to come off again.
  const blockFor = (mods: readonly TabletMod[]) => (m: TabletMod): string | undefined =>
    picked.has(m.id) ? undefined
      : ruledOut.get(m.id) ?? (count(mods) >= PER_SIDE ? 'this side is full — click a picked one to remove it first' : undefined);
  const all = [...tablet.prefixes, ...tablet.suffixes];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your tablet</span>
        {chosen.length === 0 ? (
          <span className="text-muted-foreground">Click a modifier below to add it — click it again to remove it.</span>
        ) : (
          chosen.map((id) => {
            const m = all.find((x) => x.id === id);
            if (!m) return null;
            return (
              <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/10 py-0.5 pl-1.5 pr-1">
                <Badge variant={m.side === 'prefix' ? 'default' : 'secondary'} className="px-1 text-[10px]">
                  {m.side === 'prefix' ? 'P' : 'S'}
                </Badge>
                <span className="truncate">{m.text}</span>
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className={cn('px-1 text-muted-foreground hover:text-destructive', FOCUS_RING)}
                  aria-label={`Remove ${m.text}`}
                  title="Remove"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </span>
            );
          })
        )}
      </div>

      <div>
        <label htmlFor="tablet-mod-search" className="sr-only">Search tablet modifiers</label>
        <input
          id="tablet-mod-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modifiers…"
          className={cn(inputCls, 'mb-2')}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <Column title="Prefixes" mods={shown(tablet.prefixes)} picked={picked} count={count(tablet.prefixes)} blockFor={blockFor(tablet.prefixes)} onToggle={onToggle} />
          <Column title="Suffixes" mods={shown(tablet.suffixes)} picked={picked} count={count(tablet.suffixes)} blockFor={blockFor(tablet.suffixes)} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
};
