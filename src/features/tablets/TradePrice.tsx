import React from 'react';
import { cn } from '../../lib/utils';
import type { PriceEntry, TypedPrice } from '../../lib/tabletPrices';
import type { CostUnit } from '../../lib/currency';
import { PriceBox } from '../profit/PriceBox';

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
  /** The unit a new box starts in; one already priced reads back in the unit it was typed in. */
  unit: CostUnit;
  units: readonly CostUnit[];
  price: TypedPrice | undefined;
  onPrice: (price: PriceEntry | undefined) => void;
  /** Distinguishes this row's field for a screen reader: "Price of a Ritual Tablet with …". */
  label: string;
}> = ({ url, loose, unit, units, price, onPrice, label }) => (
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
    <PriceBox unit={unit} units={units} price={price} onPrice={onPrice} label={label} />
  </span>
);
