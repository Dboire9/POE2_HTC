import React from 'react';
import type { EngineMod } from '../../lib/engine';
import { AnyModRow } from './FreeSlots';
import { selectCls } from './ui';

// Tier label for the picker dropdown: "T1 · 165–179" — a compact tier name plus the roll range. Normal
// mods use "T1"…"Tn" ("Tn · any" for the any-tier worst); essence mods use the level (Lesser/Normal/
// Greater). The full name/ilvl label is shown in the target list once added.
function tierHead(mod: EngineMod, ti: EngineMod['tiers'][number]): string {
  if (mod.source === 'desecrated') return 'desecrated';
  if (mod.source === 'essence') {
    const m = ti.name.match(/^(Lesser|Greater) Essence of/);
    return m ? m[1]! : 'Normal';
  }
  return ti.display === mod.tiers.length ? `T${ti.display} · any` : `T${ti.display}`;
}
function tierOption(mod: EngineMod, ti: EngineMod['tiers'][number]): string {
  const head = tierHead(mod, ti);
  return ti.range ? `${head} · ${ti.range}` : head;
}

interface ModColumnProps {
  readonly title: string;
  readonly side: 'prefix' | 'suffix';
  readonly list: readonly EngineMod[];
  /** SLOTS used on this side, not mods — a slot with three alternatives still fills one, and a FREE
   *  slot fills one while naming nothing. */
  readonly count: number;
  /** Slots this side can hold. Read rather than printed as `3`, which a socketed Serle's Triumph
   *  (a fourth suffix) has made wrong since runes shipped. */
  readonly cap: number;
  /** The "Any …" row, or absent to leave it out — which is what a search does, since it matches no
   *  query and would sit there as the one result that ignored what you typed. */
  readonly spare?: { readonly block: string | null; readonly onAdd: () => void };
  /**
   * Why this mod can't be added, or null. The column used to work the rules out itself from four
   * separate flags; it now asks, because the answer depends on something it has no business knowing —
   * whether the next pick starts a new slot or joins an existing one, where the side cap and the
   * family rule both change. See `whyNotAdd`.
   */
  readonly blockFor: (mod: EngineMod) => string | null;
  readonly pickTier: Record<string, number>;
  readonly onPickTier: (modId: string, tier: number) => void;
  readonly onAdd: (mod: EngineMod, tier: number) => void;
}

// Module-level (NOT defined inside a component): a component created inside render gets a fresh identity
// each render, so React would remount this whole subtree on every keystroke — dropping the search box's
// focus and detaching the "+" buttons mid-interaction. Hoisting it fixes both.
const ModColumn: React.FC<ModColumnProps> = ({
  title, side, list, count, cap, spare, blockFor, pickTier, onPickTier, onAdd,
}) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">{count}/{cap}</span>
    </div>
    <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border/50">
      {spare && <AnyModRow side={side} block={spare.block} onAdd={spare.onAdd} />}
      {list.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No matches</p>}
      {list.map((m) => {
        const isEssence = m.source === 'essence';
        const isPerfect = m.source === 'perfect';
        const isAlloy = m.source === 'alloy';
        const reason = blockFor(m) ?? '';
        const disabled = reason !== '';
        const tier = pickTier[m.id] ?? 1;
        // A disabled button is not focusable, so a `title` explaining WHY is unreachable by keyboard,
        // screen reader and touch alike. Render the reason as real text and point the controls at it.
        const reasonId = disabled ? `why-${m.id}` : undefined;
        return (
          <div
            key={m.id}
            className={`flex items-center gap-1.5 px-2 py-1 ${disabled ? 'opacity-40' : ''}`}
            title={disabled ? reason : m.id}
          >
            <span className="flex-1 min-w-0 truncate text-sm">{m.text}</span>
            {isEssence && <span className="shrink-0 rounded bg-purple-500/15 px-1 text-[10px] text-purple-600 dark:text-purple-300">ess</span>}
            {isPerfect && <span className="shrink-0 rounded bg-fuchsia-500/15 px-1 text-[10px] text-fuchsia-600 dark:text-fuchsia-300">perf</span>}
            {isAlloy && <span className="shrink-0 rounded bg-amber-500/15 px-1 text-[10px] text-amber-600 dark:text-amber-300">alloy</span>}
            {m.source === 'desecrated' && <span className="shrink-0 rounded bg-rose-500/15 px-1 text-[10px] text-rose-600 dark:text-rose-300">desec</span>}
            {reasonId && <span id={reasonId} className="sr-only">{reason}</span>}
            <select
              className={`${selectCls} h-7 py-0 pr-1 text-xs shrink-0`}
              value={tier}
              disabled={disabled}
              onChange={(e) => onPickTier(m.id, Number(e.target.value))}
              // "T1 · 165–179" means nothing without knowing which mod it belongs to.
              aria-label={`${isEssence ? 'Essence level' : 'Target tier'} for ${m.text}`}
              {...(reasonId ? { 'aria-describedby': reasonId } : {})}
            >
              {m.tiers.map((ti) => <option key={ti.display} value={ti.display}>{tierOption(m, ti)}</option>)}
            </select>
            <button
              onClick={() => onAdd(m, tier)}
              disabled={disabled}
              className="shrink-0 grid h-7 w-7 place-items-center rounded-md border border-border text-lg leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
              aria-label={`Add ${m.text} at ${tierOption(m, m.tiers.find((x) => x.display === tier) ?? m.tiers[0]!)}`}
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

export default ModColumn;
