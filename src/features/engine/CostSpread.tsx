import React from 'react';
import { Button } from '../../components/ui/button';
import type { EngineMarkovResult } from '../../lib/engine';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import { shareWithin } from '../../lib/profit';
import { RiskChart } from '../profit/RiskChart';

/** "Play it out" — solve the craft on screen again and play its plan out on real items. */
export interface PlayOut {
  readonly run: () => void;
  /** A solve is running: the button waits for it. */
  readonly busy: boolean;
}

/** What one craft costs at every percentile, the first base included, when the plan was played out. */
export const spreadOf = (markov: EngineMarkovResult): readonly number[] | undefined => {
  const first = markov.restartCost ?? 0;
  const pct = markov.replay?.costPercentiles;
  return pct && pct.length > 0 ? pct.map((c) => c + first) : undefined;
};

/**
 * What a craft can cost — not only on average. One craft is a draw with a long tail: half of them land
 * well under the average and one in ten several times it, and the average alone cannot say which the
 * player is about to start. The plan played out on real items (markovReplay.ts) can.
 *
 * On request, because playing out runs a clock of its own — up to four seconds on top of the solve
 * (`PLAYOUT_MILLIS`, solve.ts) — and only a settled plan is played out: a bound's policy is not one
 * anybody should follow, so a bound shows nothing here and its own warning says what to do.
 */
const CostSpread: React.FC<{
  markov: EngineMarkovResult;
  rates: Rates | undefined;
  /** Absent ⇒ no button. */
  playOut: PlayOut | undefined;
  /** The Plan tab's Budget, when one is typed: how often a craft finishes within it. */
  budget?: number | undefined;
  /** What the finished item sells for, when typed: marked on the curve. */
  sale?: number | undefined;
}> = ({ markov, rates, playOut, budget, sale }) => {
  if (markov.bound !== 'exact') return null;
  const replay = markov.replay;
  const spread = spreadOf(markov);
  if (!replay && !markov.replayReason && !playOut) return null;

  // The first base is bought before the first roll, so it is part of what a craft costs; the footnote
  // says so, since the headline above leaves it out.
  const first = markov.restartCost ?? 0;
  const mean = first + markov.expectedCost;
  const unit = pickUnit(Math.max(mean, spread?.[90] ?? 0), rates);
  const fmt = (ex: number): string => formatIn(unit, ex);

  return (
    <section aria-label="What a craft can cost" className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What a craft can cost</h4>
      {replay && spread ? (
        <>
          <p>
            Half the crafts cost less than <strong className="tabular-nums">{fmt(spread[50]!)}</strong>. The luckiest
            1 in 10 costs under <span className="tabular-nums">{fmt(spread[10]!)}</span>; the unluckiest 1 in 10
            more than <strong className="tabular-nums">{fmt(spread[90]!)}</strong>.
          </p>
          {budget !== undefined && budget > 0 && (
            <p>
              Your budget of <span className="tabular-nums">{fmt(budget)}</span> covers{' '}
              <strong className="tabular-nums">{Math.round(shareWithin(spread, budget) * 100)}%</strong> of crafts.
            </p>
          )}
          <RiskChart percentiles={spread} mean={mean} salePrice={sale} fmt={fmt} />
          <p className="text-[11px] text-muted-foreground">
            {replay.runs.toLocaleString('en')} crafts played out, following the plan below
            {replay.runs < 500 ? ' — a long craft, so a rough read' : ''}
            {first > 0 ? `; each counts the ${fmt(first)} base it starts from` : ''}.
          </p>
        </>
      ) : markov.replayReason ? (
        <p className="text-xs text-muted-foreground">
          Not played out: {markov.replayReason}. The average above stands on its own.
        </p>
      ) : playOut && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button size="sm" variant="outline" onClick={playOut.run} disabled={playOut.busy}>Play it out</Button>
          <span className="text-xs text-muted-foreground">
            The average hides how far one craft can run past it. Play this plan out on real items — a few
            seconds more — and see the spread.
          </span>
        </div>
      )}
    </section>
  );
};

export default CostSpread;
