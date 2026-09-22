import React from 'react';
import { cn } from '../../lib/utils';
import { parsePrice } from '../../lib/startingItem';
import { daysOld, type TypedPrice } from '../../lib/tabletPrices';
import type { CostUnit } from '../../lib/currency';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * "What does this one go for?" — the search, and the answer the player brings back.
 *
 * The button opens the official trade site with the search already filled in; the app never asks the
 * site anything itself (see `tradeLink.ts`). The price comes back by hand, which is why the field sits
 * right beside the button rather than on another screen.
 */
export const TradePrice: React.FC<{
  url: string;
  /** The search also lists a near-identical modifier — said plainly rather than left to surprise. */
  loose?: boolean;
  unit: CostUnit;
  price: TypedPrice | undefined;
  onPrice: (ex: number | undefined) => void;
  /** Distinguishes this row's field for a screen reader: "Price of a Ritual Tablet with …". */
  label: string;
}> = ({ url, loose, unit, price, onPrice, label }) => {
  const [text, setText] = React.useState(price === undefined ? '' : String(+(price.ex / unit.perExalt).toFixed(4)));
  const typed = parsePrice(text);
  const unreadable = text.trim() !== '' && typed === undefined;
  // Committed on blur rather than per keystroke: a half-typed "1" is not a claim that it sells for 1.
  const commit = (): void => onPrice(text.trim() === '' ? undefined : typed === undefined ? undefined : typed * unit.perExalt);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('rounded border border-border px-1.5 py-0.5 text-xs hover:border-primary/60 hover:text-foreground', FOCUS)}
        title={loose ? 'Opens the trade site. This modifier shares its wording with a similar one, so the search may list both.' : 'Opens the trade site with this search filled in'}
      >
        Search on trade{loose && <span aria-hidden="true" className="ml-1 text-amber-400">≈</span>}
      </a>
      <label className="inline-flex items-center gap-1">
        <span className="sr-only">{label}</span>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          placeholder="price"
          aria-invalid={unreadable}
          className={cn(
            'w-20 rounded border bg-background px-1.5 py-0.5 text-xs tabular-nums',
            unreadable ? 'border-amber-500' : 'border-border', FOCUS,
          )}
        />
        <span className="text-xs text-muted-foreground">{unit.label}</span>
      </label>
      {unreadable && <span className="text-xs text-amber-400">not a number</span>}
      {!unreadable && price !== undefined && daysOld(price) > 0 && (
        <span className="text-xs text-muted-foreground">
          typed {daysOld(price)} day{daysOld(price) === 1 ? '' : 's'} ago
        </span>
      )}
    </span>
  );
};
