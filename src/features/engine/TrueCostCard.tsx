import React from 'react';
import { Card } from '../../components/ui/card';
import type { EngineMarkovResult } from '../../lib/engine';
import { exactExalts, formatBoundedCost, type Rates } from '../../lib/currency';
import type { Spare } from '../../../packages/optimizer/src/slots.ts';
import PolicyGraph from './PolicyGraph';

/**
 * The true expected cost of a craft and its policy route — the card both gear tabs draw.
 *
 * Each tab puts its own lines between the figure and the graph (`children`): what it says about a
 * bound, the trade search for the finished item, and, on the Item tab, what the held item is worth.
 * One card rather than two copies, so what every true-cost answer shows is added once.
 */
const TrueCostCard: React.FC<{
  markov: EngineMarkovResult;
  rates: Rates | undefined;
  /** The free slots the solve RAN with — the graph's "junk to clear" is a claim about that solve. */
  spare: Spare;
  children?: React.ReactNode;
}> = ({ markov, rates, spare, children }) => (
  <Card className="p-4 space-y-3">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-bold">True expected cost</h3>
      {/* An unconverged solve is a BOUND, not an estimate, and `bound` says which way it leans — a
          floor from an item you hold, which never restarts, so value iteration starts at 0 and climbs;
          a ceiling from white. Rendering it as a bare number would be the most precise-looking wrong
          figure in the app. */}
      <span className="text-2xl font-bold tabular-nums text-primary" title={exactExalts(markov.expectedCost)}>
        {formatBoundedCost(markov.bound, markov.expectedCost, rates)}
      </span>
    </div>
    {children}
    {/* The graph's legend lives IN PolicyGraph, which is the only place that knows whether the
        picture or the route list is on screen. */}
    <PolicyGraph result={markov} rates={rates} spare={spare} />
  </Card>
);

export default TrueCostCard;
