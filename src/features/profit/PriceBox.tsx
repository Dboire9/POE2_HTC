import React from 'react';
import { parsePrice } from '../../lib/startingItem';
import { daysOld, type PriceEntry, type TypedPrice } from '../../lib/typedPrices';
import type { CostUnit } from '../../lib/currency';
import { PriceInput } from './PriceInput';

/**
 * "What does this one go for?" — the answer the player brings back from the trade site, typed beside
 * the search that found it. The same box for a tablet and for a finished item of gear.
 *
 * Key it by what the price is FOR: a box keeps the text typed into it, and without a new key the text
 * typed for one item would be saved under the next one on the next blur.
 */
export const PriceBox: React.FC<{
  /** The unit a new box starts in; one already priced reads back in the unit it was typed in. */
  unit: CostUnit;
  units: readonly CostUnit[];
  price: TypedPrice | undefined;
  onPrice: (price: PriceEntry | undefined) => void;
  /** Names the field for a screen reader: "Price of a Ritual Tablet with …". */
  label: string;
}> = ({ unit: fallback, units, price, onPrice, label }) => {
  const [unit, setUnit] = React.useState(units.find((u) => u.key === price?.unit) ?? fallback);
  const [text, setText] = React.useState(price === undefined ? '' : String(+(price.ex / unit.perExalt).toFixed(4)));
  const typed = parsePrice(text);
  const unreadable = text.trim() !== '' && typed === undefined;
  // Committed on blur rather than per keystroke: a half-typed "1" is not a claim that it sells for 1.
  // A new unit re-reads the number already typed, so it commits at once.
  const commit = (u: CostUnit = unit): void =>
    onPrice(typed === undefined ? undefined : { ex: typed * u.perExalt, unit: u.key });

  return (
    <>
      <PriceInput
        text={text}
        onText={setText}
        unit={unit}
        units={units}
        onUnit={(u) => { setUnit(u); if (text.trim() !== '') commit(u); }}
        onBlur={() => commit()}
        label={label}
        invalid={unreadable}
        placeholder="price"
      />
      {unreadable && <span className="text-xs text-amber-400">not a number</span>}
      {!unreadable && price !== undefined && daysOld(price) > 0 && (
        <span className="text-xs text-muted-foreground">
          typed {daysOld(price)} day{daysOld(price) === 1 ? '' : 's'} ago
        </span>
      )}
    </>
  );
};
