import React from 'react';
import { buyAdvice, type BuyRow } from '../../lib/startingItem';
import { formatCost, exactExalts, type Rates } from '../../lib/currency';
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
 * AND IT NAMES THE TRAPS. A modifier already on the item takes a slot the next one could have landed
 * in, so a cheap one can leave you worse off than an empty base — priced as a head start, bought as a
 * handicap. That is the single most useful thing here and the least guessable.
 */

const Row: React.FC<{ row: BuyRow; rates?: Rates }> = ({ row, rates }) => (
  <tr className="border-t border-border/60">
    <td className="py-1 pr-3 align-top">{row.present.join(' + ')}</td>
    <td className="py-1 pr-3 text-right tabular-nums align-top" title={exactExalts(row.cost)}>
      {formatCost(row.cost, rates)}
    </td>
    <td className={`py-1 text-right tabular-nums align-top ${row.saving > 0 ? '' : 'text-amber-300'}`}>
      {row.saving > 0 ? `−${(row.share * 100).toFixed(0)}%` : `+${(-row.share * 100).toFixed(0)}%`}
    </td>
  </tr>
);

const WhatToBuy: React.FC<{ markov: EngineMarkovResult; rates?: Rates }> = ({ markov, rates }) => {
  // A bound is not an answer, and a table of bounds compared against each other is worse than one
  // number: the differences between them are not bounded by anything. Same rule as `ItemWorth`.
  if (markov.bound !== 'exact') return null;
  const advice = buyAdvice(markov.holdings);
  if (!advice) return null;

  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        What to look for when you buy one
      </p>
      <p className="text-[11px] text-muted-foreground">
        The best modifiers to already have, and what finishing costs from there. Measured against{' '}
        <span title={exactExalts(advice.bare)}>{formatCost(advice.bare, rates)}</span> for the same
        base carrying none of them.
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
          {advice.best.map((r) => <Row key={r.present.join('|')} row={r} rates={rates} />)}
        </tbody>
      </table>

      {advice.worseThanNothing.length > 0 && (
        <p className="text-[11px] text-amber-300">
          <strong>Worth less than an empty base on its own:</strong>{' '}
          {advice.worseThanNothing.map((r) => r.present.join(' + ')).join(', ')}. It fills a slot the
          rest of the craft needs, and it is cheap enough to roll that having it saves nothing — so
          paying extra for it makes the craft dearer, not cheaper.
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
