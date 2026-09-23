import React from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import type { EngineMarkovResult } from '../../lib/engineTypes';
import { formatIn, type CostUnit, type Rates } from '../../lib/currency';
import {
  WATCH_TIERS, plainBreakEven, searchIsLoose, standIns as listStandIns, setPriceKey, shareWithin, spendBreakdown, summarizePlan, tradeStatsFor, watchText,
  type TabletBase, type WatchEntry, type WatchMod, type WatchTier,
} from '../../lib/tablets';
import type { PriceEntry, TypedPrice } from '../../lib/tabletPrices';
import { FULL_USES, tradeUrl } from '../../lib/tradeLink';
import PolicyGraph from '../engine/PolicyGraph';
import { oneIn } from './TabletModPicker';
import { ProfitVerdict } from './ProfitVerdict';
import { RunPlanView } from './RunPlan';
import { StandInTip } from './StandInTip';
import { ProfitBreakdown } from './ProfitBreakdown';
import { planRuns } from '../../lib/tabletRun';
import { RiskChart } from './RiskChart';
import { TradePrice } from './TradePrice';

/** One solve and everything it was asked: the tablet, the modifiers wanted, the watch list replayed. */
export interface SolvedTablet {
  readonly tablet: TabletBase;
  readonly chosen: readonly string[];
  /** The list the solver replayed — `markov.replay.seen[i]` is the odds of `watch[i]`. */
  readonly watch: readonly WatchEntry[];
  readonly markov: EngineMarkovResult;
  /** The plain tablet the craft starts from. The model prices the restarts; this first one is added here. */
  readonly plainCost: number;
}

const TIER_TITLE: Record<WatchTier, string> = {
  superJackpot: 'Super jackpot',
  jackpot: 'Jackpot',
  veryGood: 'Very good',
  good: 'Good',
};

/** Each tier's colour — its heading, its dot, and the bar of how often a row turns up. */
const TIER_TONE: Record<WatchTier, { text: string; fill: string; dot: string }> = {
  superJackpot: { text: 'text-amber-300', fill: 'bg-gradient-to-r from-amber-400 to-yellow-200', dot: 'bg-amber-300 motion-safe:animate-soft-glow' },
  jackpot: { text: 'text-orange-300', fill: 'bg-orange-400', dot: 'bg-orange-400' },
  veryGood: { text: 'text-violet-300', fill: 'bg-violet-400', dot: 'bg-violet-400' },
  good: { text: 'text-sky-300', fill: 'bg-sky-400', dot: 'bg-sky-400' },
};

/** The plan's strategy as a coloured badge. */
const STRATEGY: Record<'fresh' | 'chaos' | 'mixed' | 'direct', { label: string; tone: string }> = {
  fresh: { label: 'Fresh tablets', tone: 'border-sky-400/50 bg-sky-400/15 text-sky-200' },
  chaos: { label: 'Chaos rerolls', tone: 'border-violet-400/50 bg-violet-400/15 text-violet-200' },
  mixed: { label: 'Fresh tablets + Chaos', tone: 'border-amber-400/50 bg-amber-400/15 text-amber-200' },
  direct: { label: 'Straight up', tone: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200' },
};

/**
 * The answer for one solved tablet: what crafting it costs, what it sells for, and what else can land on
 * the way. Everything here reads from `solved` — never from what is ticked in the picker since — so the
 * odds, the searches and the prices on it always describe the same tablet.
 */
/** How many of something a craft uses, readably: 72, 3.2, 0.4. */
const howMany = (n: number): string => (n >= 10 ? Math.round(n).toLocaleString() : `${+n.toFixed(1)}`);

export const TabletResult: React.FC<{
  solved: SolvedTablet;
  league: string | undefined;
  rates: Rates | undefined;
  /** Chaos and Annul prices, for saying why the plan uses one and not the other. */
  /** Orb prices off the sheet, by key: the Why box quotes Chaos and Annul, the breakdown every orb it used. */
  orbPrices: Readonly<Record<string, number | undefined>>;
  /** The prices the player typed, by set — the tab keeps them, since a watch-list price recounts the craft. */
  prices: Readonly<Record<string, TypedPrice>>;
  onPrice: (key: string, price: PriceEntry | undefined) => void;
  /** The craft is being solved again with prices just typed. */
  recounting: boolean;
  /** The unit every number here is shown in, and the one a new price box starts in. */
  unit: CostUnit;
  /** The units there is a rate for, to switch between. */
  units: readonly CostUnit[];
  onUnit: (key: CostUnit['key']) => void;
}> = ({ solved: { tablet, chosen, watch, markov, plainCost }, league, rates, orbPrices, prices, onPrice, recounting, unit, units, onUnit }) => {
  // What the whole craft costs: the plain tablet you start from, then rolling it — restarts, and the
  // Exalts that fill it to four modifiers, included.
  const cost = markov.feasible ? plainCost + markov.expectedCost : undefined;
  const modOf = (id: string) => [...tablet.prefixes, ...tablet.suffixes].find((m) => m.id === id);
  const modText = (id: string): string => modOf(id)?.text ?? id;
  const asMods = (ids: readonly string[]): WatchMod[] => ids.map((id) => ({ id }));
  const label = (mods: readonly WatchMod[]): string[] => mods.map((m) => watchText(modText(m.id), m));
  const keyOf = (mods: readonly WatchMod[]): string => setPriceKey(tablet.id, mods);

  /**
   * The trade search and price box for a tablet holding `mods`. Keyed by that set, so a box never keeps
   * the text typed for another tablet — it would otherwise be saved under this one on the next blur.
   */
  const tradePrice = (mods: readonly WatchMod[]): React.ReactElement => (
    <TradePrice
      key={keyOf(mods)}
      url={league ? tradeUrl({ league, baseName: tablet.name, require: [FULL_USES], stats: tradeStatsFor(mods) }) : ''}
      loose={searchIsLoose(mods)}
      unit={unit}
      units={units}
      price={prices[keyOf(mods)]}
      onPrice={(p) => onPrice(keyOf(mods), p)}
      label={`Price of a ${tablet.name} with ${label(mods).join(', ')}`}
    />
  );

  const sales = markov.replay?.sales;
  const watchRow = (entry: WatchEntry, seen: number | undefined, sold: number | undefined): React.ReactElement => {
    const price = prices[keyOf(entry.mods)];
    // A modifier's odds per roll say nothing about which value it rolls, so they are shown only for a
    // single modifier priced at any value.
    const only = entry.mods.length === 1 ? entry.mods[0]! : undefined;
    const single = only && only.min === undefined && only.max === undefined ? modOf(only.id) : undefined;
    return (
      <li key={keyOf(entry.mods)} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{label(entry.mods).join(' + ')}</span>
        {seen !== undefined && (
          <span className="inline-block h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <span
              key={Math.round(seen * 1000)}
              className={cn('block h-full origin-left rounded-full motion-safe:animate-grow-x', TIER_TONE[entry.tier].fill)}
              style={{ width: `${Math.max(2, Math.round(seen * 100))}%` }}
            />
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {seen !== undefined
            ? `turns up in ${Math.round(seen * 100)}% of crafts`
            // Only a settled plan is played out: a bound's policy is not one anybody should follow. When the
            // replay declined, the reason is said once, under the cost.
            : markov.bound === 'exact' ? 'odds not played out' : 'no odds while the cost is only a bound'}
          {single && <> · <span className="tabular-nums">{oneIn(single.share)}</span> rolls on that side</>}
        </span>
        {/* Once priced, what the plan does with it: sells it whenever that beats carrying on. */}
        {price && sold !== undefined && (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300 motion-safe:animate-fade-up">
            {sold >= 1 ? `you'd sell about ${howMany(sold)} a craft` : `you'd sell one in ${Math.round(sold * 100)}% of crafts`}
          </span>
        )}
        {tradePrice(entry.mods)}
        {price && cost !== undefined && price.ex > cost && (
          <span className="text-emerald-400">worth more than the tablet you asked for</span>
        )}
        {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
      </li>
    );
  };

  const targetPrice = prices[keyOf(asMods(chosen))];
  // The replay's spread is for rolling alone; the first plain tablet is added to every craft of it.
  const spread = markov.replay?.costPercentiles.length ? markov.replay.costPercentiles.map((c) => c + plainCost) : undefined;
  // Selling what lands on the way, at the prices typed below: what it brings back, and — played out,
  // with the fresh tablets those sales force — what the craft then costs net.
  const revenue = sales?.revenue ?? 0;
  const net = sales && markov.replay && revenue > 0 ? plainCost + markov.replay.meanCost - revenue : undefined;
  const anyWatchPriced = watch.some((e) => prices[keyOf(e.mods)]);
  const price = (ex: number | undefined): string => (ex === undefined ? '?' : formatIn(unit, ex));
  const plan = markov.replay ? summarizePlan(markov.replay.movesPerCraft) : undefined;
  // A run of crafts, once the tablet has a price: how many to make, what they should bring, what to have.
  const sale = targetPrice?.ex;
  // The verdict taken apart: every orb and plain tablet a craft uses, against the tablet and the sales.
  const breakdown = markov.replay && sale !== undefined ? {
    spend: spendBreakdown(markov.replay.movesPerCraft, plainCost, markov.replay.meanCost, (k) => orbPrices[k]),
    get: [
      { name: 'The tablet you asked for', count: 1, each: sale, total: sale },
      ...watch.flatMap((e, i) => {
        const each = prices[keyOf(e.mods)]?.ex;
        const n = sales?.perEntry[i] ?? 0;
        return each !== undefined && n > 0 ? [{ name: `Sold on the way: ${label(e.mods).join(' + ')}`, count: n, each, total: n * each }] : [];
      }),
    ],
  } : undefined;
  // Tablets someone already rolled, priced off this very solve: what each is worth against a plain one.
  const standIns = React.useMemo(() => {
    const table = markov.routes;
    if (!table || !markov.feasible || markov.bound !== 'exact') return [];
    const at = new Map<string, number>(table.keys.map((k, i) => [k, i]));
    return listStandIns((key) => { const i = at.get(key); return i === undefined ? undefined : table.value[i]; }, markov.expectedCost, plainCost);
  }, [markov, plainCost]);
  // Keyed on the numbers, not the arrays rebuilt every render: a plan is a million draws.
  const runPlan = React.useMemo(() => {
    const replay = markov.replay;
    if (sale === undefined || !replay || replay.costPercentiles.length === 0) return undefined;
    const meanCost = plainCost + replay.meanCost;
    const income = sale + revenue;
    return { plan: planRuns(replay.costPercentiles.map((c) => c + plainCost), meanCost, income), perCraft: income - meanCost };
  }, [sale, markov.replay, plainCost, revenue]);
  // Why the plan goes the way it does, in the terms a player weighs: the prices of the alternatives.
  const why: Record<NonNullable<typeof plan>['strategy'], string> = {
    fresh: `It starts a fresh tablet whenever a roll misses. At these prices that is cheaper than repairing a wrong roll with Chaos `
      + `Orbs: each costs ${price(orbPrices.chaos)} and swaps a random modifier — maybe one you wanted — so a wrong roll usually takes `
      + `several to fix, while a new plain tablet costs ${price(plainCost)}.`,
    chaos: `It keeps one tablet and rerolls it with Chaos Orbs. At these prices a Chaos Orb (${price(orbPrices.chaos)}) costs less than `
      + `starting over on a new plain tablet (${price(plainCost)}) and rolling it back up.`,
    mixed: 'It mixes the two, taking whichever costs less from where the tablet stands: starting over on a new plain tablet '
      + `(${price(plainCost)}), or rerolling it with a Chaos Orb (${price(orbPrices.chaos)}).`,
    direct: 'What you asked for is common enough that most crafts land it on the way up — Transmute, Augment, Regal, Exalt — '
      + 'without starting over or rerolling.',
  };
  return (
    <>
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-semibold">{chosen.map(modText).join(' · ')}</h3>
          <div role="group" aria-label="Show prices in" className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
            {units.map((u) => (
              <button
                key={u.key}
                type="button"
                aria-pressed={u.key === unit.key}
                onClick={() => onUnit(u.key)}
                className={cn('rounded px-2 py-0.5', u.key === unit.key ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        {cost === undefined ? (
          <p className="text-sm text-amber-400">{markov.reason ?? 'No route reaches this tablet.'}</p>
        ) : (
          <>
            <p className="text-sm">
              Crafting it costs{' '}
              <strong className="tabular-nums">
                {markov.bound === 'lower' ? '≥ ' : markov.bound === 'upper' ? '≤ ' : ''}{formatIn(unit, cost)}
              </strong>{' '}
              on average, following the plan below — the plain tablet you start from and the Exalts that
              fill it to four modifiers included.
            </p>
            {!markov.replay && markov.replayReason && (
              <p className="text-sm text-muted-foreground">
                Not played out: {markov.replayReason}. So there is no spread, no odds of what else lands and
                nothing sold on the way — the cost above stands on its own.
              </p>
            )}
            {spread && (
              <p className="text-sm text-muted-foreground">
                Half the crafts cost less than <span className="tabular-nums text-foreground">{formatIn(unit, spread[50]!)}</span>;
                {' '}1 in 10 costs more than <span className="tabular-nums text-foreground">{formatIn(unit, spread[90]!)}</span>
                {' '}({markov.replay!.runs.toLocaleString()} crafts played out{markov.replay!.runs < 500 ? ' — a long craft, so a rough read' : ''}).
              </p>
            )}
            {plan && (
              <div className="space-y-1 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why this plan</h4>
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', STRATEGY[plan.strategy].tone)}>
                    {STRATEGY[plan.strategy].label}
                  </span>
                </div>
                <p>{why[plan.strategy]}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>An average craft uses</span>
                  {plan.uses.map((u) => (
                    <span key={u.name} className="rounded-md border border-border bg-background/60 px-1.5 py-0.5">
                      <strong className="tabular-nums text-foreground">{howMany(u.perCraft)}</strong> {u.name}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  No Annulment Orbs ({price(orbPrices.annul)} each): on a tablet they rarely pay for themselves.
                </p>
              </div>
            )}
            <StandInTip
              standIns={standIns} plainCost={plainCost} fmt={(ex) => formatIn(unit, ex)}
              urlFor={(st, filters) => (league
                ? tradeUrl({ league, baseName: tablet.name, rarity: st.rarity, require: [FULL_USES, ...filters], stats: [] })
                : '')}
            />
            {net !== undefined && (
              <div className="space-y-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selling what lands on the way</h4>
                <p>
                  About <strong className="tabular-nums">{formatIn(unit, revenue)}</strong> a craft. Whenever the tablet holds one
                  of the sets you priced below and selling it beats carrying on, fill it to four modifiers first — a third or
                  fourth good one can only raise its price — then sell it and start a fresh tablet.
                </p>
                <p className="text-muted-foreground">
                  Played out that way, the craft costs about <span className="tabular-nums text-foreground">{formatIn(unit, net)}</span> net
                  — {formatIn(unit, plainCost + markov.replay!.meanCost)} spent (the filling included), less what you sell.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">What it sells for:</span>
              {tradePrice(asMods(chosen))}
            </div>
            <ProfitVerdict
              spend={net !== undefined ? plainCost + markov.replay!.meanCost : cost}
              salePrice={targetPrice?.ex}
              salesOnWay={revenue}
              fmt={(ex) => formatIn(unit, ex)}
            />
            {breakdown && sale !== undefined && (() => {
              // Where it stops paying, both ways: the dearest plain tablet it still pays at, and the
              // cheapest the tablet can sell for. The first is a floor — the plan adapts to the price.
              const spendNow = net !== undefined ? plainCost + markov.replay!.meanCost : cost;
              const most = plainBreakEven(breakdown.spend, sale + revenue);
              const least = spendNow - revenue;
              return (
                <div className="space-y-1 rounded-lg border border-border/70 bg-background/40 p-3 text-sm">
                  <p>
                    {most === undefined
                      ? <>No plain-tablet price makes it pay: the orbs alone cost more than it brings back.</>
                      : <>
                          Pays while a plain tablet costs{' '}
                          <strong className="tabular-nums text-emerald-400">{formatIn(unit, most)} or less</strong>
                          {' '}— you typed{' '}
                          <span className={cn('tabular-nums', plainCost <= most ? 'text-emerald-300' : 'text-amber-300')}>{formatIn(unit, plainCost)}</span>.
                          {' '}<span className="text-xs text-muted-foreground">At a dearer or cheaper tablet the plan adapts, so the real line may sit a little higher.</span>
                        </>}
                  </p>
                  <p>
                    Or while it sells for{' '}
                    <strong className="tabular-nums text-emerald-400">{formatIn(unit, least)} or more</strong>
                    {' '}— you typed{' '}
                    <span className={cn('tabular-nums', sale >= least ? 'text-emerald-300' : 'text-amber-300')}>{formatIn(unit, sale)}</span>.
                  </p>
                </div>
              );
            })()}
            {breakdown && (
              <ProfitBreakdown
                spend={breakdown.spend} get={breakdown.get} runs={markov.replay!.runs} stdErr={markov.replay!.stdErr}
                {...(net === undefined ? { exactSpend: cost } : {})}
                fmt={(ex) => formatIn(unit, ex)}
              />
            )}
            {runPlan && (
              <RunPlanView plan={runPlan.plan} perCraft={runPlan.perCraft} fmt={(ex) => formatIn(unit, ex)} />
            )}
            {targetPrice && spread && (
              <p className="text-sm text-muted-foreground">
                Spend up to what it sells for, and you finish{' '}
                <span className="tabular-nums text-foreground">{Math.round(shareWithin(spread, targetPrice.ex) * 100)}%</span>
                {' '}of the time.
              </p>
            )}
            {spread && (
              <RiskChart percentiles={spread} mean={cost} salePrice={targetPrice?.ex} fmt={(ex) => formatIn(unit, ex)} />
            )}
          </>
        )}

        {watch.length > 0 && (
          <div className="space-y-2 border-t border-border/60 pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              While you roll for that, these can land
            </h4>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {recounting
                ? 'Recounting with your prices…'
                : anyWatchPriced
                  ? 'Your prices are counted: the plan fills a tablet holding one of these to four modifiers and sells it, whenever that beats carrying on.'
                  : 'Type what one of these sells for, and the craft is recounted with you selling it whenever that pays.'}
            </p>
            {WATCH_TIERS.map((tier) => {
              // Shown by tier, but `seen` follows the list the solver was given, so each row keeps its
              // index in that list rather than its place in the tier.
              const rows = watch.flatMap((entry, i) => (entry.tier === tier
                ? [watchRow(entry, markov.replay?.seen[i], sales?.perEntry[i])] : []));
              return rows.length === 0 ? null : (
                <section key={tier} className="space-y-1">
                  <h5 className={cn('flex items-center gap-2 text-xs font-semibold', TIER_TONE[tier].text)}>
                    <span className={cn('inline-block h-2 w-2 rounded-full', TIER_TONE[tier].dot)} aria-hidden="true" />
                    {TIER_TITLE[tier]}
                  </h5>
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

      {markov.feasible && <PolicyGraph result={markov} rates={rates} unit={unit} />}
    </>
  );
};
