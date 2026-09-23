import React, { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { THIN_EVIDENCE, type TabletBase, type TabletMod } from '../../lib/tablets';

/** "1 in 7" — the rolls it takes, on average, for one roll on that side to be this modifier. */
export const oneIn = (share: number): string => `1 in ${share > 0 ? Math.round(1 / share).toLocaleString() : '—'}`;

// The same controls the Plan tab's modifier picker uses, so the two pickers read as one.
const inputCls =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';
const CAP = 2;

/** One side's list: search-filtered, each row with its odds and a "+" — or, greyed, the reason it can't. */
const Column: React.FC<{
  title: string;
  mods: readonly TabletMod[];
  picked: number;
  blockFor: (m: TabletMod) => string | undefined;
  onAdd: (id: string) => void;
}> = ({ title, mods, picked, blockFor, onAdd }) => (
  <div className="min-w-0 flex-1">
    <div className="mb-1 flex items-center justify-between">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{picked}/{CAP}</span>
    </div>
    <div className="max-h-72 divide-y divide-border/50 overflow-y-auto rounded-md border border-border">
      {mods.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {mods.map((m) => {
        const reason = blockFor(m);
        // A disabled button can't be focused, so a `title` alone would hide the reason from keyboard
        // and screen-reader users: it is real text, and the button points at it.
        const reasonId = reason === undefined ? undefined : `why-${m.id}`;
        return (
          <div key={m.id} className={cn('flex items-center gap-1.5 px-2 py-1', reason !== undefined && 'opacity-45')} title={reason}>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block">{m.text}</span>
              <span className="block text-xs text-muted-foreground">
                <span className="tabular-nums">{oneIn(m.share)}</span> rolls on this side
                {m.seen < THIN_EVIDENCE && (
                  <span title="Read from few sightings, so the odds are rough"> · seen {m.seen} times</span>
                )}
                {reasonId && <span id={reasonId}> · {reason}</span>}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onAdd(m.id)}
              disabled={reason !== undefined}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-lg leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
              aria-label={`Add ${m.text}`}
              {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Pick what you want on the tablet, the way the Plan tab picks gear modifiers: search, add from the
 * prefix and suffix lists, and the picks listed below with a way to take each one off. At most two a
 * side, and never two of one family — which on a tablet can span both sides ("Map contains an
 * additional Essence" and "increased chance to contain Essences" are one family). A ruled-out modifier
 * stays in the list and says why, rather than vanishing.
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
    mods.filter((m) => !picked.has(m.id) && (needle === '' || m.text.toLowerCase().includes(needle)));
  const count = (mods: readonly TabletMod[]): number => mods.filter((m) => picked.has(m.id)).length;
  const full = (mods: readonly TabletMod[]) => (m: TabletMod): string | undefined =>
    ruledOut.get(m.id) ?? (count(mods) >= CAP ? 'a tablet holds two of these — remove one first' : undefined);
  const all = [...tablet.prefixes, ...tablet.suffixes];

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="tablet-mod-search" className="sr-only">Search tablet modifiers</label>
        <input
          id="tablet-mod-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modifiers to add…"
          className={cn(inputCls, 'mb-2')}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <Column title="Prefixes" mods={shown(tablet.prefixes)} picked={count(tablet.prefixes)} blockFor={full(tablet.prefixes)} onAdd={onToggle} />
          <Column title="Suffixes" mods={shown(tablet.suffixes)} picked={count(tablet.suffixes)} blockFor={full(tablet.suffixes)} onAdd={onToggle} />
        </div>
      </div>

      {chosen.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your tablet</h4>
          {chosen.map((id) => {
            const m = all.find((x) => x.id === id);
            if (!m) return null;
            return (
              <div key={id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                <Badge variant={m.side === 'prefix' ? 'default' : 'secondary'} className="text-[10px]">
                  {m.side === 'prefix' ? 'P' : 'S'}
                </Badge>
                <span className="min-w-0 flex-1 text-sm">{m.text}</span>
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className={cn('px-1 text-muted-foreground hover:text-destructive', FOCUS_RING)}
                  aria-label={`Remove ${m.text} from the tablet`}
                  title="Remove"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
