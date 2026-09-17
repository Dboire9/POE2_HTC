import React from 'react';
import type { Spare } from '../../../packages/optimizer/src/slots.ts';

/**
 * "Any prefix / any suffix" — a position on the finished item whose contents the player doesn't care
 * about.
 *
 * It is offered as a row in the MOD PICKER, beside the mods, because that is where a player goes to
 * say what they want the item to have and this is one of the things they can want. Internally it is
 * nothing like a mod — no id, no tier, no family, just a count per side (`Spare`) — but that is the
 * engine's business, and a control that lived somewhere else would make the player learn the
 * difference in order to use it.
 *
 * Both tabs render these, from one definition, for the reason the shared `whyNotAdd` exists: a free
 * slot that counted toward the side cap on one tab and not the other would be two different rules
 * wearing one name.
 */

const SIDE_WORD: Readonly<Record<'prefix' | 'suffix', string>> = { prefix: 'prefix', suffix: 'suffix' };

/** Read a side out of a `Spare` without either caller spelling the plural mapping again. */
export const spareOn = (spare: Spare, side: 'prefix' | 'suffix'): number =>
  (side === 'prefix' ? spare.prefixes : spare.suffixes);

/** `spare` with one more (or one fewer) free slot on `side`, floored at zero. */
export const withSpare = (spare: Spare, side: 'prefix' | 'suffix', delta: number): Spare =>
  (side === 'prefix'
    ? { ...spare, prefixes: Math.max(0, spare.prefixes + delta) }
    : { ...spare, suffixes: Math.max(0, spare.suffixes + delta) });

/**
 * The picker's "Any …" row, pinned above the mods of its column.
 *
 * Pinned rather than sorted in among them because it matches no search and belongs to no family: it is
 * a different KIND of thing to want, and burying it at wherever "a" sorts would hide the one row that
 * has no name to search for.
 */
export const AnyModRow: React.FC<{
  readonly side: 'prefix' | 'suffix';
  /** Why another can't be added, or null. From `roomOnSide`, so it agrees with the mod rows above it. */
  readonly block: string | null;
  readonly onAdd: () => void;
}> = ({ side, block, onAdd }) => {
  const reasonId = block ? `why-any-${side}` : undefined;
  return (
    <div
      className={`flex items-center gap-1.5 border-b border-border/50 bg-sky-500/5 px-2 py-1 ${block ? 'opacity-40' : ''}`}
      title={block ?? `Finish the craft whatever lands in one ${SIDE_WORD[side]}, or leave it empty.`}
    >
      <span className="flex-1 min-w-0 truncate text-sm">
        <span className="font-medium">Any {SIDE_WORD[side]}</span>
        <span className="text-muted-foreground"> — I don’t care what lands here</span>
      </span>
      {reasonId && <span id={reasonId} className="sr-only">{block}</span>}
      <button
        onClick={onAdd}
        disabled={block !== null}
        className="shrink-0 grid h-7 w-7 place-items-center rounded-md border border-border text-lg leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        aria-label={`Leave one ${SIDE_WORD[side]} free — anything can land in it`}
        {...(reasonId ? { 'aria-describedby': reasonId } : {})}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
};

/**
 * The free slots already on the target, one row each, rendered with the named slots.
 *
 * One row per slot rather than "Any suffix ×2", because each one is a separate position on the item
 * and the list above it is a list of positions. A count would also make removal ambiguous in a way a
 * row with its own ✕ is not.
 */
export const FreeSlotRows: React.FC<{
  readonly spare: Spare;
  readonly onRemove: (side: 'prefix' | 'suffix') => void;
}> = ({ spare, onRemove }) => (
  <>
    {(['prefix', 'suffix'] as const).flatMap((side) =>
      Array.from({ length: spareOn(spare, side) }, (_, i) => (
        <div
          key={`free-${side}-${i}`}
          className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-sky-500/50 bg-sky-500/5 px-2 py-1.5"
        >
          <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
            {side === 'prefix' ? 'P' : 'S'}
          </span>
          <span className="flex-1 min-w-40 text-sm text-muted-foreground">
            <strong className="text-foreground">Any {SIDE_WORD[side]}</strong> — whatever lands here is
            fine, and so is leaving it empty
          </span>
          <button
            onClick={() => onRemove(side)}
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-sm leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Stop leaving a ${SIDE_WORD[side]} free`}
            title="Remove this free slot"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )))}
  </>
);

/**
 * What a free slot does to the answer, said once beneath the target list.
 *
 * Two things a reader would otherwise have to infer, and would infer wrongly. That the slot need not be
 * FILLED — "I don't care" includes not having one at all, so the craft can finish a mod short and the
 * player is told what to do about it. And that the step-by-step routes ignore it: a fixed sequence
 * names a mod at every step, so it cannot spend one on "anything", and only the true expected cost
 * beside it takes the slot into account.
 */
export const FreeSlotNote: React.FC<{ readonly spare: Spare; readonly fromWhite: boolean }> = ({ spare, fromWhite }) => {
  const n = spare.prefixes + spare.suffixes;
  if (n === 0) return null;
  return (
    <p className="text-[11px] text-muted-foreground">
      ✦ A <strong>free slot</strong> is one the craft may finish with anything in — or with nothing:
      you can always <strong>Exalt</strong> (or <strong>Desecrate</strong>) afterwards to fill it, and
      whatever lands counts.
      {fromWhite && (
        <>
          {' '}The <strong>step-by-step plans</strong> below don’t use it — every step in a route has to
          name the mod it’s aiming at, so a route can’t decide after the fact which roll was the spare.
          The <strong>true expected cost</strong> can, and does.
        </>
      )}
    </p>
  );
};
