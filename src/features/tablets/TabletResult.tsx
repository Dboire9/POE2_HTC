import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import type { EngineMarkovResult } from '../../lib/engineTypes';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import {
  PRICED_ON, WATCH_TIERS, searchIsLoose, tradeStatsFor, watchKey, watchText,
  type TabletBase, type WatchEntry, type WatchMod, type WatchTier,
} from '../../lib/tablets';
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
  superJackpot: 'Super jackpot',
  jackpot: 'Jackpot',
  veryGood: 'Very good',
  good: 'Good',
};

/** "23 Sep" — when the list's prices were read, so a reader can tell how stale they are. */
const pricedOn = new Date(`${PRICED_ON}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

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
  const asMods = (ids: readonly string[]): WatchMod[] => ids.map((id) => ({ id }));
  const label = (mods: readonly WatchMod[]): string[] => mods.map((m) => watchText(modText(m.id), m));
  const keyOf = (mods: readonly WatchMod[]): string => priceKey(tablet.id, watchKey(mods));

  /**
   * The trade search and price box for a tablet holding `mods`. Keyed by that set, so a box never keeps
   * the text typed for another tablet — it would otherwise be saved under this one on the next blur.
   */
  const tradePrice = (mods: readonly WatchMod[]): React.ReactElement => (
    <TradePrice
      key={keyOf(mods)}
      url={league ? tradeUrl({ league, baseName: tablet.name, stats: tradeStatsFor(mods) }) : ''}
      loose={searchIsLoose(mods)}
      unit={unit}
      price={prices[keyOf(mods)]}
      onPrice={(ex) => setPrices(writePrice(keyOf(mods), ex))}
      label={`Price of a ${tablet.name} with ${label(mods).join(', ')}`}
    />
  );

  const watchRow = (entry: WatchEntry, seen: number | undefined): React.ReactElement => {
    const price = prices[keyOf(entry.mods)];
    // A modifier's odds per roll say nothing about which value it rolls, so they are shown only for a
    // single modifier priced at any value.
    const only = entry.mods.length === 1 ? entry.mods[0]! : undefined;
    const single = only && only.min === undefined && only.max === undefined ? modOf(only.id) : undefined;
    return (
      <li key={keyOf(entry.mods)} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{label(entry.mods).join(' + ')}</span>
        <span className="text-xs text-muted-foreground">
          {seen !== undefined
            ? `turns up in ${Math.round(seen * 100)}% of crafts`
            : markov.replayReason
              // Only a settled plan is played out: a bound's policy is not one anybody should follow.
              ?? (markov.bound === 'exact' ? 'odds not played out' : 'no odds while the cost is only a bound')}
          {single && <> · <span className="tabular-nums">{oneIn(single.share)}</span> rolls on that side</>}
        </span>
        {tradePrice(entry.mods)}
        {price && cost !== undefined && price.ex > cost && (
          <span className="text-emerald-400">worth more than the tablet you asked for</span>
        )}
        {entry.price && (
          <span className="text-xs text-muted-foreground">{entry.price} when Dorian checked, {pricedOn}</span>
        )}
        {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
      </li>
    );
  };

  const targetPrice = prices[keyOf(asMods(chosen))];
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
              {tradePrice(asMods(chosen))}
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
