import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { cn } from '../../lib/utils';
import { loadEngine, priceBasis, type Engine } from '../../lib/engine';
import { isAppUpdated, isCancelled, prewarm, solve } from '../../lib/engineClient';
import type { SolveProgress } from '../../lib/solve';
import { parsePrice } from '../../lib/startingItem';
import { ODDS_CREDIT, PER_SIDE, listTablets, ruledOutBy, setPriceKey, watchList, type TabletBase } from '../../lib/tablets';
import { readPrices, writePrice, type TypedPrice } from '../../lib/tabletPrices';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import SolveProgressBar from '../engine/SolveProgress';
import { TabletModPicker } from './TabletModPicker';
import { TabletResult, type SolvedTablet } from './TabletResult';

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
  const [solved, setSolved] = useState<SolvedTablet | null>(null);
  // Every price the player typed, by set. Read once, at the first render: what they typed before is part
  // of the initial state. Kept here, not in the result, because a watch-list price is sent with the solve.
  const [prices, setPrices] = useState<Record<string, TypedPrice>>(readPrices);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState<SolveProgress | null>(null);
  const [runErr, setRunErr] = useState<string | null>(null);
  const cancelRef = React.useRef<(() => void) | null>(null);
  const runIdRef = React.useRef(0);
  const excludedKeys = toExcludedKeys(useExclusions());
  // The Search effort the rest of the app uses. At the default a tablet's rarest pairs solve exactly in
  // a fraction of a second; without it they stopped at a bound.
  const effort = useEffort();

  useEffect(() => {
    prewarm();
    loadEngine().then(setEngine).catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const tablets = useMemo(() => (engine ? listTablets(engine.data) : []), [engine]);
  const tablet = tablets.find((t) => t.id === tabletId) ?? tablets[0];
  const ruledOut = useMemo(() => (engine ? ruledOutBy(engine.data, chosen) : new Map<string, string>()), [engine, chosen]);
  const basis = engine ? priceBasis(engine) : undefined;

  /** A price typed anywhere on the result. One for a watched set recounts the craft that was solved. */
  const onPrice = (key: string, ex: number | undefined): void => {
    const next = writePrice(key, ex);
    setPrices(next);
    if (solved && solved.watch.some((e) => setPriceKey(solved.tablet.id, e.mods) === key)) {
      compute({ tablet: solved.tablet, chosen: solved.chosen, plain: solved.plainCost }, next);
    }
  };

  const toggle = (id: string): void => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  /**
   * Solve a craft: by default the one ticked now; after a watch-list price changes, the one already
   * solved, again — with `priceMap` holding that price, which state has not delivered yet.
   */
  const compute = (
    spec: { tablet: TabletBase | undefined; chosen: readonly string[]; plain: number | undefined }
      = { tablet, chosen, plain: parsePrice(baseCost) },
    priceMap: Readonly<Record<string, TypedPrice>> = prices,
  ): void => {
    const { tablet, chosen, plain: cost } = spec;
    if (!engine || !tablet || chosen.length === 0) return;
    // Asked for at solve time and kept with the answer, so the odds shown belong to the craft that was
    // solved — not to whatever is ticked now.
    const watch = watchList(tablet, chosen);
    const runId = ++runIdRef.current;
    const current = (): boolean => runIdRef.current === runId;
    setComputing(true);
    setRunErr(null);
    setProgress(null);
    const picked = (side: readonly { id: string }[]): number => chosen.filter((id) => side.some((m) => m.id === id)).length;
    const handle = solve({
      kind: 'lab',
      from: { baseId: tablet.id, level: 100 },
      targets: chosen.map((modId) => ({ modId, tierDisplay: 1 })),
      ...(cost === undefined ? {} : { baseCost: cost }),
      // A tablet is always run with all four modifiers: whatever lands beside the ones picked is fine,
      // and any slot still empty at the end is filled with an Exalt, which the cost includes.
      spare: { prefixes: PER_SIDE - picked(tablet.prefixes), suffixes: PER_SIDE - picked(tablet.suffixes) },
      fillOnFinish: true,
      // Always, even empty: the replay behind it also gives the spread of what a craft costs.
      watch: watch.map((e) => e.mods),
      // What each of those sells for, as typed: the replay then sells one whenever that beats carrying on.
      sell: watch.map((e) => priceMap[setPriceKey(tablet.id, e.mods)]?.ex ?? 0),
      effort: limitsFor(effort),
      // Never an Annulment Orb on a tablet (Dorian, 2026-09-23): at ~7 Chaos Orbs apiece it pays only
      // on the rarest pairs with dear plain tablets — crafts that lose hundreds of div anyway — and costs
      // under 1% more on half the crafts that ever reach for it.
      excluded: [...new Set([...excludedKeys, 'annul'])],
    }, (p) => { if (current()) setProgress(p); });
    cancelRef.current = handle.cancel;
    handle.promise
      .then((res) => {
        if (!current() || res.kind !== 'lab') return;
        setSolved({ tablet, chosen, watch, markov: res.markov, plainCost: cost ?? 0 });
      })
      .catch((e: unknown) => {
        if (!current() || isCancelled(e)) return;
        setSolved(null);
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
              // A solve still running is for the tablet being left: stop it, as its Cancel button would.
              onClick={() => { cancelRef.current?.(); setTabletId(t.id); setChosen([]); setSolved(null); }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <TabletModPicker tablet={tablet} chosen={chosen} ruledOut={ruledOut} onToggle={toggle} />

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
          <Button onClick={() => compute()} disabled={computing || chosen.length === 0} size="lg">
            {computing ? 'Working…' : 'What does it cost?'}
          </Button>
          {chosen.length === 0 && <span className="text-xs text-muted-foreground">Pick at least one modifier.</span>}
        </div>

        {computing && <SolveProgressBar progress={progress} onCancel={() => cancelRef.current?.()} />}
        {runErr && <p className="text-sm text-amber-400">{runErr}</p>}
      </Card>

      {solved && (
        <TabletResult
          solved={solved}
          league={basis?.league}
          rates={basis?.rates}
          orbPrices={{ chaos: engine?.prices.currency['chaos'], annul: engine?.prices.currency['annul'] }}
          prices={prices}
          onPrice={onPrice}
          recounting={computing}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Modifier odds: {ODDS_CREDIT.who}’s rolling data ({ODDS_CREDIT.rolls.toLocaleString()} modifiers seen) ·
        trade searches use ids from Exiled Exchange 2 · prices are the ones you type, kept in this browser ·
        plans never use an Annulment Orb.
      </p>
    </div>
  );
};

export default TabletsTab;
