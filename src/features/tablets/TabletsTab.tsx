import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { cn } from '../../lib/utils';
import { loadEngine, priceBasis, type Engine } from '../../lib/engine';
import { isAppUpdated, isCancelled, prewarm, solve } from '../../lib/engineClient';
import type { EngineMarkovResult } from '../../lib/engineTypes';
import type { SolveProgress } from '../../lib/solve';
import { formatIn, pickUnit, type CostUnit } from '../../lib/currency';
import { parsePrice } from '../../lib/startingItem';
import { ODDS_CREDIT, listTablets, ruledOutBy, searchIsLoose, tradeStatsFor, watchList } from '../../lib/tablets';
import { priceKey, readPrices, writePrice, type TypedPrice } from '../../lib/tabletPrices';
import { tradeUrl } from '../../lib/tradeLink';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import SolveProgressBar from '../engine/SolveProgress';
import PolicyGraph from '../engine/PolicyGraph';
import { TabletModPicker, oneIn } from './TabletModPicker';
import { TradePrice } from './TradePrice';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const tabCls = (on: boolean): string => cn(
  'rounded px-3 py-1.5 text-sm transition-colors',
  on ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:text-foreground',
);

/**
 * Precursor Tablets: what a tablet costs to craft, what it sells for, and what ELSE you might roll on
 * the way that is worth more than what you asked for.
 *
 * Its own tab because almost nothing the gear tabs offer applies — a tablet has no item level, no runes,
 * no essences, no desecration, and two modifiers a side — and because the market half works the other
 * way round: nothing lists tablets, so the player brings the prices and the app does the arithmetic.
 */
const TabletsTab: React.FC = () => {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [tabletId, setTabletId] = useState('Tablets_ritual');
  const [chosen, setChosen] = useState<readonly string[]>([]);
  const [baseCost, setBaseCost] = useState('1');
  // Read once, at the first render: what the player typed before is part of the initial state, not
  // something that arrives a render later.
  const [prices, setPrices] = useState<Record<string, TypedPrice>>(readPrices);
  const [markov, setMarkov] = useState<EngineMarkovResult | null>(null);
  const [solvedFor, setSolvedFor] = useState<{ tabletId: string; chosen: readonly string[] } | null>(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<SolveProgress | null>(null);
  const [runErr, setRunErr] = useState<string | null>(null);
  const cancelRef = React.useRef<(() => void) | null>(null);
  const runIdRef = React.useRef(0);
  const excludedKeys = toExcludedKeys(useExclusions());

  useEffect(() => {
    prewarm();
    loadEngine().then(setEngine).catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const tablets = useMemo(() => (engine ? listTablets(engine.data) : []), [engine]);
  const tablet = tablets.find((t) => t.id === tabletId) ?? tablets[0];
  const ruledOut = useMemo(() => (engine ? ruledOutBy(engine.data, chosen) : new Map<string, string>()), [engine, chosen]);
  const basis = engine ? priceBasis(engine) : undefined;
  const league = basis?.league;
  const rates = basis?.rates;
  const unit: CostUnit = pickUnit(markov?.expectedCost ?? 0, rates);
  const fmt = (ex: number): string => `${formatIn(unit, ex)} ${unit.label}`;

  const toggle = (id: string): void => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const searchFor = (mods: readonly string[]): string | undefined =>
    (league && tablet ? tradeUrl({ league, baseName: tablet.name, stats: tradeStatsFor(mods) }) : undefined);
  const setPrice = (key: string, ex: number | undefined): void => setPrices(writePrice(key, ex));

  // The watch list is asked for at solve time, so the odds below belong to the craft that was solved —
  // not to whatever is ticked now. Both halves read this one list.
  const watch = useMemo(() => (solvedFor ? watchList(solvedFor.tabletId, solvedFor.chosen) : []), [solvedFor]);
  const pending = useMemo(() => (tablet ? watchList(tablet.id, chosen) : []), [tablet, chosen]);

  const compute = (): void => {
    if (!engine || !tablet || chosen.length === 0) return;
    const runId = ++runIdRef.current;
    const current = (): boolean => runIdRef.current === runId;
    setComputing(true);
    setRunErr(null);
    setProgress(null);
    const cost = parsePrice(baseCost);
    const handle = solve({
      kind: 'lab',
      from: { baseId: tablet.id, level: 100 },
      targets: chosen.map((modId) => ({ modId, tierDisplay: 1 })),
      ...(cost === undefined ? {} : { baseCost: cost }),
      ...(pending.length > 0 ? { watch: pending.map((e) => e.mods) } : {}),
      ...(excludedKeys.length > 0 ? { excluded: excludedKeys } : {}),
    }, (p) => { if (current()) setProgress(p); });
    cancelRef.current = handle.cancel;
    handle.promise
      .then((res) => {
        if (!current() || res.kind !== 'lab') return;
        setMarkov(res.markov);
        setSolvedFor({ tabletId: tablet.id, chosen });
      })
      .catch((e: unknown) => {
        if (!current() || isCancelled(e)) return;
        setMarkov(null);
        setSolvedFor(null);
        setRunErr(isAppUpdated(e) ? 'The site was updated while this ran — reload the page and try again.'
          : e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!current()) return;
        cancelRef.current = null;
        setComputing(false);
        setProgress(null);
      });
  };

  if (loadErr) return <p className="text-sm text-amber-400">The tablet data could not be loaded: {loadErr}</p>;
  if (!tablet) return <Spinner />;

  const targetKey = solvedFor ? priceKey(solvedFor.tabletId, solvedFor.chosen) : '';
  const targetPrice = prices[targetKey];
  const cost = markov?.feasible ? markov.expectedCost : undefined;
  const modText = (id: string): string =>
    [...tablet.prefixes, ...tablet.suffixes].find((m) => m.id === id)?.text ?? id;

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
          {tablets.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn(tabCls(t.id === tablet.id), FOCUS)}
              aria-pressed={t.id === tablet.id}
              onClick={() => { setTabletId(t.id); setChosen([]); setMarkov(null); setSolvedFor(null); }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <TabletModPicker tablet={tablet} chosen={new Set(chosen)} ruledOut={ruledOut} onToggle={toggle} />

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              A plain tablet costs <span className="font-normal normal-case opacity-70">(exalts)</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              className={cn('w-24 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums', FOCUS)}
            />
          </label>
          <Button onClick={compute} disabled={computing || chosen.length === 0} size="lg">
            {computing ? 'Working…' : 'What does it cost?'}
          </Button>
          {chosen.length === 0 && <span className="text-xs text-muted-foreground">Tick the modifiers you want.</span>}
        </div>

        {computing && <SolveProgressBar progress={progress} onCancel={() => cancelRef.current?.()} />}
        {runErr && <p className="text-sm text-amber-400">{runErr}</p>}
      </Card>

      {markov && solvedFor && (
        <Card className="space-y-3 p-4">
          <h3 className="text-sm font-semibold">
            {solvedFor.chosen.map(modText).join(' · ')}
          </h3>
          {cost === undefined ? (
            <p className="text-sm text-amber-400">{markov.reason ?? 'No route reaches this tablet.'}</p>
          ) : (
            <>
              <p className="text-sm">
                Crafting it costs{' '}
                <strong className="tabular-nums">
                  {markov.bound === 'lower' ? '≥ ' : markov.bound === 'upper' ? '≤ ' : ''}{fmt(cost)}
                </strong>{' '}
                on average, following the plan below.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">What it sells for:</span>
                <TradePrice
                  url={searchFor(solvedFor.chosen) ?? ''}
                  loose={searchIsLoose(solvedFor.chosen)}
                  unit={unit}
                  price={targetPrice}
                  onPrice={(ex) => setPrice(targetKey, ex)}
                  label={`Price of a ${tablet.name} with ${solvedFor.chosen.map(modText).join(', ')}`}
                />
                {targetPrice && (
                  <span className={cn('tabular-nums', targetPrice.ex >= cost ? 'text-emerald-400' : 'text-amber-400')}>
                    {targetPrice.ex >= cost
                      ? `crafting saves ${fmt(targetPrice.ex - cost)}`
                      : `buying saves ${fmt(cost - targetPrice.ex)}`}
                  </span>
                )}
              </div>
            </>
          )}

          {watch.length > 0 && (
            <div className="space-y-1 border-t border-border/60 pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                While you roll for that, these can land
              </h4>
              <ul className="space-y-1.5 text-sm">
                {watch.map((entry, i) => {
                  const key = priceKey(solvedFor.tabletId, entry.mods);
                  const seen = markov.replay?.seen[i];
                  const single = entry.mods.length === 1
                    ? [...tablet.prefixes, ...tablet.suffixes].find((m) => m.id === entry.mods[0])
                    : undefined;
                  const price = prices[key];
                  return (
                    <li key={key} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{entry.mods.map(modText).join(' + ')}</span>
                      <span className="text-xs text-muted-foreground">
                        {seen === undefined
                          ? markov.replayReason ?? 'odds not played out'
                          : `turns up in ${Math.round(seen * 100)}% of crafts`}
                        {single && <> · <span className="tabular-nums">{oneIn(single.share)}</span> rolls on that side</>}
                      </span>
                      <TradePrice
                        url={searchFor(entry.mods) ?? ''}
                        loose={searchIsLoose(entry.mods)}
                        unit={unit}
                        price={price}
                        onPrice={(ex) => setPrice(key, ex)}
                        label={`Price of a ${tablet.name} with ${entry.mods.map(modText).join(', ')}`}
                      />
                      {price && cost !== undefined && price.ex > cost && (
                        <span className="text-emerald-400">worth more than the tablet you asked for</span>
                      )}
                      {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
                    </li>
                  );
                })}
              </ul>
              {markov.replay && (
                <p className="text-xs text-muted-foreground">
                  Played out {markov.replay.runs.toLocaleString()} times, following the plan below.
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {markov?.feasible && <PolicyGraph result={markov} rates={rates} />}

      <p className="text-xs text-muted-foreground">
        Modifier odds: {ODDS_CREDIT.who}’s rolling data ({ODDS_CREDIT.rolls.toLocaleString()} modifiers seen) ·
        trade searches use ids from Exiled Exchange 2 · prices are the ones you type, kept in this browser.
      </p>
    </div>
  );
};

export default TabletsTab;
