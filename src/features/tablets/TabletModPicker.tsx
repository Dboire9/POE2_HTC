import React from 'react';
import { cn } from '../../lib/utils';
import { THIN_EVIDENCE, type TabletBase, type TabletMod } from '../../lib/tablets';

/** "1 in 7" — the rolls it takes, on average, for one roll on that side to be this modifier. */
export const oneIn = (share: number): string => `1 in ${share > 0 ? Math.round(1 / share).toLocaleString() : '—'}`;

const Row: React.FC<{
  mod: TabletMod;
  checked: boolean;
  ruledOut: string | undefined;
  full: boolean;
  onToggle: () => void;
}> = ({ mod, checked, ruledOut, full, onToggle }) => {
  const blocked = ruledOut ?? (full && !checked ? 'a tablet holds two of these — untick one first' : undefined);
  return (
    <li>
      <label
        className={cn('flex cursor-pointer items-start gap-2 rounded px-1 py-1 hover:bg-muted/40',
          blocked && 'cursor-not-allowed opacity-45 hover:bg-transparent')}
        title={blocked}
      >
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          disabled={blocked !== undefined}
          onChange={onToggle}
        />
        <span className="min-w-0">
          <span className="block">{mod.text}</span>
          <span className="block text-xs text-muted-foreground">
            <span className="tabular-nums">{oneIn(mod.share)}</span> rolls on this side
            {mod.seen < THIN_EVIDENCE && (
              <span title="Read from few sightings, so the odds are rough"> · seen {mod.seen} times</span>
            )}
            {blocked !== undefined && <span> · {blocked}</span>}
          </span>
        </span>
      </label>
    </li>
  );
};

/**
 * Pick what you want on the tablet: at most two a side, and never two of one family — which on a tablet
 * can span both sides ("Map contains an additional Essence" and "increased chance to contain Essences"
 * are one family). A ruled-out modifier stays visible and says why, rather than vanishing.
 */
export const TabletModPicker: React.FC<{
  tablet: TabletBase;
  chosen: ReadonlySet<string>;
  ruledOut: ReadonlyMap<string, string>;
  onToggle: (id: string) => void;
}> = ({ tablet, chosen, ruledOut, onToggle }) => {
  const side = (mods: readonly TabletMod[], title: string): React.ReactElement => {
    const picked = mods.filter((m) => chosen.has(m.id)).length;
    return (
      <div className="min-w-0 flex-1">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title} <span className="font-normal normal-case">— {picked} of 2 picked</span>
        </h4>
        <ul className="space-y-0.5 text-sm">
          {mods.map((m) => (
            <Row
              key={m.id}
              mod={m}
              checked={chosen.has(m.id)}
              ruledOut={ruledOut.get(m.id)}
              full={picked >= 2}
              onToggle={() => onToggle(m.id)}
            />
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {side(tablet.prefixes, 'Prefixes')}
      {side(tablet.suffixes, 'Suffixes')}
    </div>
  );
};
