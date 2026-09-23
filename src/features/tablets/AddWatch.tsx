import React from 'react';
import { cn } from '../../lib/utils';
import type { TabletBase, WatchMod } from '../../lib/tablets';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * "Add your own" to the watch list: one modifier, or two that have to land together — any this tablet
 * rolls, bar the ones you are crafting for. It joins the list as yours, with its own search and price box.
 */
export const AddWatch: React.FC<{
  tablet: TabletBase;
  chosen: readonly string[];
  onAdd: (mods: readonly WatchMod[]) => void;
}> = ({ tablet, chosen, onAdd }) => {
  const [first, setFirst] = React.useState('');
  const [second, setSecond] = React.useState('');
  const options = [...tablet.prefixes, ...tablet.suffixes].filter((m) => !chosen.includes(m.id));
  const select = (value: string, set: (v: string) => void, label: string, none: string) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => set(e.target.value)}
      className={cn('max-w-[18rem] rounded border border-border bg-background px-1.5 py-1 text-xs', FOCUS)}
    >
      <option value="">{none}</option>
      {(['prefix', 'suffix'] as const).map((side) => (
        <optgroup key={side} label={side === 'prefix' ? 'Prefixes' : 'Suffixes'}>
          {options.filter((m) => m.side === side).map((m) => <option key={m.id} value={m.id}>{m.text}</option>)}
        </optgroup>
      ))}
    </select>
  );
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">Add your own:</span>
      {select(first, setFirst, 'A modifier to watch for', '— a modifier —')}
      {first && select(second, setSecond, 'And a second one, on the tablet with it', '— and, with it (optional) —')}
      <button
        type="button"
        disabled={!first}
        onClick={() => {
          onAdd([{ id: first }, ...(second && second !== first ? [{ id: second }] : [])]);
          setFirst('');
          setSecond('');
        }}
        className={cn('rounded border border-border px-2 py-1 hover:border-primary/60 hover:text-foreground disabled:opacity-40', FOCUS)}
      >
        Add to the list
      </button>
    </div>
  );
};
