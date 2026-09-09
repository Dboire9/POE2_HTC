import React from 'react';
import { buyAdvice, type BuyRow } from '../../lib/startingItem';
import { formatIn, pickUnit, exactExalts, type CostUnit, type Rates } from '../../lib/currency';
import type { EngineMarkovResult } from '../../lib/engine';

/**
 * "What should I already have when I buy one?"
 *
 * The question a player asks before spending on a base, and until now the app had no answer: it
 * priced the item you have and the item you want, and nothing in between. The numbers were there the
 * whole time — value iteration solves every state, including "a clean item holding these two" — so
 * this reads them out rather than solving anything.
 *
 * IT SHOWS THE BEST SET AT EACH SIZE, not a ranking of single modifiers. Which two to look for is
 * often not the best one plus the next best, because they compete for the same three slots, and a
 * list of individually-good mods would recommend a pair that is worse than a different pair.
 *
 * AND IT PRINTS THE SIZE OF THINGS RATHER THAN ADJECTIVES. A modifier already on the item takes a
 * slot the next one could have landed in, so a cheap one can leave you worse off than an empty base.
 * That happens on most crafts — but measured across seven, it is worth between +0.03% and +0.20%, so
 * it is "this is worth nothing, do not pay extra" and NOT "this is a trap". The first draft of this
 * panel said trap. The measurement said otherwise.
 *
 * The effect that IS large is the back-loading, and the table is mostly here to show it: one modifier
 * of four saved 0.1-11.6% across that campaign, three of four saved 45-50%. Paying pro-rata for
 * "4 of 6 done" overpays by a wide margin.
 */

/**
 * A percentage that never rounds a real difference away to "0%".
 *
 * The traps are worth +0.03% to +0.20%, so two decimals read "+0.00%" on the smallest of them —
 * a number that looks like a bug and undercuts the very claim beside it.
 */
const pct = (share: number): string => {
  const v = Math.abs(share) * 100;
  if (v > 0 && v < 0.01) return '<0.01%';
  return `${v < 1 ? v.toFixed(2) : v.toFixed(0)}%`;
};

const Row: React.FC<{ row: BuyRow; unit: CostUnit }> = ({ row, unit }) => (
  <tr className="border-t border-border/60">
    <td className="py-1 pr-3 align-top">{row.present.join(' + ')}</td>
    <td className="py-1 pr-3 text-right tabular-nums align-top" title={exactExalts(row.cost)}>
      {formatIn(unit, row.cost)}
    </td>
    <td className={`py-1 text-right tabular-nums align-top ${row.saving > 0 ? '' : 'text-amber-300'}`}>
      {row.saving > 0 ? '−' : '+'}{pct(row.share)}
    </td>
  </tr>
);

const WhatToBuy: React.FC<{ markov: EngineMarkovResult; rates?: Rates }> = ({ markov, rates }) => {
  const advice = buyAdvice(markov.holdings);
  if (!advice) return null;

  /**
   * A bound is not an answer, and a table of bounds compared against each other is worse than one
   * bound: the differences between them are not bounded by anything. Same rule as `ItemWorth`.
   *
   * SAID, NOT SILENT. Returning null here hid the panel with nothing to show it had ever existed, and
   * that is common rather than rare — a craft asking three T1 prefixes on a Wand comes back a floor at
   * the default effort. Raising it IS the answer there: measured, that craft needs ~2.3M value-
   * iteration sweeps and settles in ~262 s, which is inside Exhaustive's cap and nowhere near
   * Standard's. And the floor is not a near-miss worth reading as an estimate — 5.08e6 against a true
   * 2.33e7, out by 4.6x — which is exactly why no table is drawn from it.
   */
  if (markov.bound !== 'exact') {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">What to look for when you buy one</strong> — the app works
        this out from a settled cost, and this craft only reached a {markov.bound === 'lower' ? 'floor' : 'ceiling'}.
        Raise <strong>Search effort</strong> and compute again; asking for a lower tier on one modifier
        gets there faster.
      </p>
    );
  }

  /**
   * ONE unit for the whole table, chosen from its largest value.
   *
   * `formatCost` picks per value and is documented for "a single number with no sibling values to
   * stay comparable with" — which is the opposite of this. Using it here printed a real table as
   * "123K div / 120.6K div / 4,781 chaos", making the reader do the conversion the ladder exists to
   * remove. Exactly the mistake `pickUnit`'s own comment warns about.
   */
  const unit = pickUnit(Math.max(advice.bare, ...advice.best.map((r) => r.cost)), rates);

  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        What to look for when you buy one
      </p>
      <p className="text-[11px] text-muted-foreground">
        The best modifiers to already have, and what finishing costs from there — measured against{' '}
        <span title={exactExalts(advice.bare)}>{formatIn(unit, advice.bare)}</span> for the same
        base carrying none of them. <strong>Cost is back-loaded</strong>, so read the percentages
        rather than counting modifiers: the last one is usually worth more than the first few together.
      </p>

      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-muted-foreground text-left">
            <th className="font-normal pb-1">Already on it</th>
            <th className="font-normal pb-1 text-right">Finishing costs</th>
            <th className="font-normal pb-1 text-right">vs bare</th>
          </tr>
        </thead>
        <tbody>
          {advice.best.map((r) => <Row key={r.present.join('|')} row={r} unit={unit} />)}
        </tbody>
      </table>

      {advice.worseThanNothing.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          <strong>Worth nothing on its own:</strong>{' '}
          {advice.worseThanNothing
            .map((r) => `${r.present.join(' + ')} (+${pct(r.share)})`)
            .join(', ')}
          . Each fills a slot the rest of the craft needs and is cheap enough to roll anyway, so
          finishing from one costs fractionally more than from an empty base. The amount is small —
          this is “don’t pay extra for it”, not “avoid it”.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        Each row assumes the <strong>rest of the item is empty</strong>. A listing that also carries
        modifiers you do not want costs more than this to finish, because they have to come off first.
      </p>
    </div>
  );
};

export default WhatToBuy;
