import React from 'react';
import type { PatchData } from '../../../packages/engine/src/types.ts';
import { runeHint } from '../../lib/engine';
import { formatCost, type Rates } from '../../lib/currency';

/**
 * "These three become one modifier, three times over."
 *
 * An item may hold one modifier per family, so `Gain #% of Damage as Extra Fire` can only appear
 * once — and yet real staves carry two of it, summed on screen into a single number. The route is an
 * Aldur rune: it converts EVERY `gain as extra <element>` modifier on the item to its own element,
 * so you roll the siblings, which are different families and coexist perfectly, and socket the rune.
 *
 * NOTHING HERE UNLOCKS ANYTHING. Asking for Extra Fire and Extra Cold together has always been
 * allowed — they are different families and the picker never objected. The gap was that a player had
 * no reason to think of it, and that the plan then never mentioned the rune it ends on. So this is a
 * note beside the targets, not a control: it appears once two of them are chosen and says what the
 * rune would make of them, at what price.
 *
 * BOTH COSTS ARE IN WORDS BECAUSE NEITHER IS IN THE PLAN'S ARITHMETIC. The rune is socketed rather
 * than spent, so it also costs a rune socket; and it converts every one of them, so a sibling the
 * player meant to keep as cold does not survive it. Stating a price and omitting those would read as
 * the whole cost.
 */
const RuneHint: React.FC<{
  data: PatchData;
  baseId: string;
  modIds: readonly string[];
  prices: Readonly<Record<string, number>> | undefined;
  rates: Rates | undefined;
}> = ({ data, baseId, modIds, prices, rates }) => {
  const o = runeHint(data, baseId, modIds);
  if (!o) return null;

  // `stepCost` charges 0 for a key the sheet lacks, so an absent price would read as a free rune.
  // Say nothing about the cost rather than quote a zero.
  const price = prices?.[o.priceKey];
  const cost = price !== undefined && price > 0 && rates ? formatCost(price, rates) : undefined;

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-[11px] text-sky-700 dark:text-sky-300">
      <span>
        <strong>{o.modIds.length}× {o.element}</strong> is reachable: these {o.modIds.length} are
        different families, so they can all sit on one item. Socket{' '}
        <strong>{o.rune}</strong>{cost ? ` (${cost})` : ''} afterwards and every one of them becomes{' '}
        {o.element}.
      </span>
      <span className="opacity-80">{o.caveat}</span>
    </p>
  );
};

export default RuneHint;
