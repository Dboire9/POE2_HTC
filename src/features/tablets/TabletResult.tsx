import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import type { EngineMarkovResult } from '../../lib/engineTypes';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import { WATCH_TIERS, searchIsLoose, tradeStatsFor, type TabletBase, type WatchEntry, type WatchTier } from '../../lib/tablets';
import { priceKey, readPrices, writePrice, type TypedPrice } from '../../lib/tabletPrices';
import { tradeUrl } from '../../lib/tradeLink';
import PolicyGraph from '../engine/PolicyGraph';
import { oneIn } from './TabletModPicker';
import { TradePrice } from './TradePrice';

/** One solve and everything it was asked: the tablet, the modifiers wanted, the watch list replayed. */
export interface SolvedTablet {
  readonly tablet: TabletBase;
  readonly chosen: readonly string[];
  /** The list the solver replayed — `markov.replay.seen[i]` is the odds of `watch[i]`. */
  readonly watch: readonly WatchEntry[];
  readonly markov: EngineMarkovResult;
}

const TIER_TITLE: Record<WatchTier, string> = {
  jackpot: 'Sells high, whatever else is on the tablet',
  good: 'Adds to what the tablet sells for',
};

/**
 * The answer for one solved tablet: what crafting it costs, what it sells for, and what else can land on
 * the way. Everything here reads from `solved` — never from what is ticked in the picker since — so the
 * odds, the searches and the prices on it always describe the same tablet.
 */
export const TabletResult: React.FC<{
  solved: SolvedTablet;
  league: string | undefined;
  rates: Rates | undefined;
}> = ({ solved: { tablet, chosen, watch, markov }, league, rates }) => {
  // Read once, at the first render: what the player typed before is part of the initial state, not
  // something that arrives a render later.
  const [prices, setPrices] = useState<Record<string, TypedPrice>>(readPrices);
  const unit = pickUnit(markov.expectedCost, rates);
  const cost = markov.feasible ? markov.expectedCost : undefined;
  const modOf = (id: string) => [...tablet.prefixes, ...tablet.suffixes].find((m) => m.id === id);
  const modText = (id: string): string => modOf(id)?.text ?? id;
  const keyOf = (mods: readonly string[]): string => priceKey(tablet.id, mods);

  /**
   * The trade search and price box for a tablet holding `mods`. Keyed by that set, so a box never keeps
   * the text typed for another tablet — it would otherwise be saved under this one on the next blur.
   */
  const tradePrice = (mods: readonly string[]): React.ReactElement => (
    <TradePrice
      key={keyOf(mods)}
      url={league ? tradeUrl({ league, baseName: tablet.name, stats: tradeStatsFor(mods) }) : ''}
      loose={searchIsLoose(mods)}
      unit={unit}
      price={prices[keyOf(mods)]}
      onPrice={(ex) => setPrices(writePrice(keyOf(mods), ex))}
      label={`Price of a ${tablet.name} with ${mods.map(modText).join(', ')}`}
    />
  );

  const watchRow = (entry: WatchEntry, seen: number | undefined): React.ReactElement => {
    const price = prices[keyOf(entry.mods)];
    const single = entry.mods.length === 1 ? modOf(entry.mods[0]!) : undefined;
    return (
      <li key={keyOf(entry.mods)} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{entry.mods.map(modText).join(' + ')}</span>
        <span className="text-xs text-muted-foreground">
          {seen !== undefined
            ? `turns up in ${Math.round(seen * 100)}% of crafts`
            : markov.replayReason
              // Only a settled plan is played out: a bound's policy is not one anybody should follow.
              ?? (markov.bound === 'exact' ? 'odds not played out' : 'no odds while the cost is only a bound')}
          {single && <> · <span className="tabular-nums">{oneIn(single.share)}</span> rolls on that side</>}
        </span>
        {/* Only a jackpot has a price of its own: it sells high whatever else is on the tablet. Any
            other modifier is worth what the whole tablet is worth, which one search cannot say. */}
        {entry.tier === 'jackpot' && tradePrice(entry.mods)}
        {entry.tier === 'jackpot' && price && cost !== undefined && price.ex > cost && (
          <span className="text-emerald-400">worth more than the tablet you asked for</span>
        )}
        {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
      </li>
    );
  };

  const targetPrice = prices[keyOf(chosen)];
  return (
    <>
      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-semibold">{chosen.map(modText).join(' · ')}</h3>
        {cost === undefined ? (
          <p className="text-sm text-amber-400">{markov.reason ?? 'No route reaches this tablet.'}</p>
        ) : (
          <>
            <p className="text-sm">
              Crafting it costs{' '}
              <strong className="tabular-nums">
                {markov.bound === 'lower' ? '≥ ' : markov.bound === 'upper' ? '≤ ' : ''}{formatIn(unit, cost)}
              </strong>{' '}
              on average, following the plan below.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">What it sells for:</span>
              {tradePrice(chosen)}
              {targetPrice && (
                <span className={cn('tabular-nums', targetPrice.ex >= cost ? 'text-emerald-400' : 'text-amber-400')}>
                  {targetPrice.ex >= cost
                    ? `crafting saves ${formatIn(unit, targetPrice.ex - cost)}`
                    : `buying saves ${formatIn(unit, cost - targetPrice.ex)}`}
                </span>
              )}
            </div>
          </>
        )}

        {watch.length > 0 && (
          <div className="space-y-2 border-t border-border/60 pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              While you roll for that, these can land
            </h4>
            {WATCH_TIERS.map((tier) => {
              // Shown by tier, but `seen` follows the list the solver was given, so each row keeps its
              // index in that list rather than its place in the tier.
              const rows = watch.flatMap((entry, i) => (entry.tier === tier ? [watchRow(entry, markov.replay?.seen[i])] : []));
              return rows.length === 0 ? null : (
                <section key={tier} className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground">{TIER_TITLE[tier]}</h5>
                  <ul className="space-y-1.5 text-sm">{rows}</ul>
                </section>
              );
            })}
            {markov.replay && (
              <p className="text-xs text-muted-foreground">
                Played out {markov.replay.runs.toLocaleString()} times, following the plan below.
              </p>
            )}
          </div>
        )}
      </Card>

      {markov.feasible && <PolicyGraph result={markov} rates={rates} />}
    </>
  );
};
