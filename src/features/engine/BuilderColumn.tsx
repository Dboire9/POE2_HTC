import React from 'react';
import { modFamilies, type EngineMod } from '../../lib/engine';
import { FOCUS_RING } from './ui';

interface BuilderColumnProps {
  readonly title: string;
  readonly list: readonly EngineMod[];
  readonly count: number;
  readonly cap: number;
  readonly occupiedFamilies: ReadonlySet<string>;
  readonly onAdd: (mod: EngineMod) => void;
}

// Module-level, not defined inside a component: a component created in render gets a new identity each
// render and would remount this subtree every keystroke (dropping the search box's focus).
const BuilderColumn: React.FC<BuilderColumnProps> = ({ title, list, count, cap, occupiedFamilies, onAdd }) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{count}/{cap}</span>
    </div>
    <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
      {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {list.map((m) => {
        const famTaken = modFamilies(m).some((f) => occupiedFamilies.has(f));
        const disabled = count >= cap || famTaken;
        const reason = famTaken ? `“${m.family}” family already on the item` : count >= cap ? 'This side is full' : '';
        // Disabled buttons aren't focusable, so a title-only reason is unreachable. `family in use`
        // was already shown visually for one case; this makes the rest reachable the same way.
        const reasonId = disabled ? `item-why-${m.id}` : undefined;
        return (
          <button
            key={m.id}
            onClick={() => onAdd(m)}
            disabled={disabled}
            className={`flex w-full items-center gap-2 text-left px-2 py-1.5 text-sm hover:bg-accent ${FOCUS_RING} disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
            aria-label={`Add ${m.text} to your item`}
            {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            title={reason || (m.source === 'desecrated' ? 'Add this desecrated mod to your item (occupies a slot; Omen of Light can target it)' : 'Add to your item')}
          >
            <span className="flex-1 min-w-0 truncate">{m.text}</span>
            {m.source === 'desecrated' && <span className="shrink-0 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desecrated</span>}
            {famTaken && <span className="shrink-0 text-[10px] text-muted-foreground">family in use</span>}
            {reasonId && <span id={reasonId} className="sr-only">{reason}</span>}
          </button>
        );
      })}
    </div>
  </div>
);

export default BuilderColumn;
