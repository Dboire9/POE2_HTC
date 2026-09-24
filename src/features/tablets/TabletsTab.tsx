import React, { useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { cn } from '../../lib/utils';
import { priceBasis } from '../../lib/engine';
import { parsePrice } from '../../lib/startingItem';
import {
  ODDS_CREDIT, PER_SIDE, START_NAMES, listTablets, ruledOutBy, setPriceKey, standInFilters, standInJunk, watchList,
  type StartKind, type TabletBase, type WatchEntry, type WatchMod,
} from '../../lib/tablets';
import { addMine, hide, prefsFor, readWatch, removeMine, unhideAll, type WatchStore } from '../../lib/tabletWatch';
import { readPrices, readShownUnit, writePrice, writeShownUnit, type PriceEntry, type TypedPrice } from '../../lib/tabletPrices';
import { priceUnits, type CostUnit } from '../../lib/currency';
import { FULL_USES, tradeUrl } from '../../lib/tradeLink';
import { toExcludedKeys, useExclusions } from '../../lib/currencyPrefs';
import { limitsFor, useEffort } from '../../lib/searchEffort';
import SolveProgressBar from '../engine/SolveProgress';
import { useEngine } from '../engine/useEngine';
import { useSolveRunner } from '../engine/useSolveRunner';
import { TabletModPicker } from './TabletModPicker';
import { TabletResult, type SolvedTablet } from './TabletResult';
import { PriceInput } from '../profit/PriceInput';

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
  const { engine, loadErr } = useEngine();
  const [tabletId, setTabletId] = useState('Tablets_ritual');
  const [chosen, setChosen] = useState<readonly string[]>([]);
  // The unit every number on the tab is shown in, and the one a new price box starts in: chaos unless
  // the player picked another, remembered in this browser.
  const [shownKey, setShownKey] = useState<CostUnit['key']>(readShownUnit);
  // What the craft starts from — a plain tablet or a Magic one off the market — and what each costs, kept
  // apart so switching back and forth keeps both prices.
  const [startKind, setStartKind] = useState<StartKind>('plain');
  const [startPrices, setStartPrices] = useState<Record<StartKind, { readonly text: string; readonly unit: CostUnit['key'] }>>(
    () => ({ plain: { text: '1', unit: shownKey }, prefix: { text: '1', unit: shownKey }, suffix: { text: '1', unit: shownKey } }));
  const baseCost = startPrices[startKind].text;
  const setBaseCost = (text: string): void => setStartPrices((p) => ({ ...p, [startKind]: { ...p[startKind], text } }));
  const setBaseUnit = (unit: CostUnit['key']): void => setStartPrices((p) => ({ ...p, [startKind]: { ...p[startKind], unit } }));
  const [solved, setSolved] = useState<SolvedTablet | null>(null);
  // Every price the player typed, by set. Read once, at the first render: what they typed before is part
  // of the initial state. Kept here, not in the result, because a watch-list price is sent with the solve.
  const [prices, setPrices] = useState<Record<string, TypedPrice>>(readPrices);
  // The player's own sets to watch for, and the curated ones they hid — per browser, read once.
  const [watchStore, setWatchStore] = useState<WatchStore>(readWatch);
  const runner = useSolveRunner();
  const { computing, progress } = runner;
  const [runErr, setRunErr] = useState<string | null>(null);
  const excludedKeys = toExcludedKeys(useExclusions());
  // The Search effort the rest of the app uses. At the default a tablet's rarest pairs solve exactly in
  // a fraction of a second; without it they stopped at a bound.
  const effort = useEffort();

  const tablets = useMemo(() => (engine ? listTablets(engine.data) : []), [engine]);
  const tablet = tablets.find((t) => t.id === tabletId) ?? tablets[0];
  const ruledOut = useMemo(() => (engine ? ruledOutBy(engine.data, chosen) : new Map<string, string>()), [engine, chosen]);
  const basis = engine ? priceBasis(engine) : undefined;
  const units = priceUnits(basis?.rates);
  const plainUnit = units.find((u) => u.key === startPrices[startKind].unit) ?? units[0]!;
  const shown = units.find((u) => u.key === shownKey) ?? units[0]!;
  const showIn = (key: CostUnit['key']): void => { setShownKey(key); writeShownUnit(key); };
  const plainTyped = parsePrice(baseCost);
  const startCostLabel = `A ${START_NAMES[startKind][0]} costs`;
  const plainCost = plainTyped === undefined ? undefined : plainTyped * plainUnit.perExalt;

  /** A price typed anywhere on the result. One for a watched set recounts the craft that was solved. */
  const onPrice = (key: string, price: PriceEntry | undefined): void => {
    const next = writePrice(key, price);
    setPrices(next);
    if (solved && solved.watch.some((e) => setPriceKey(solved.tablet.id, e.mods) === key)) {
      compute({ tablet: solved.tablet, chosen: solved.chosen, plain: solved.plainCost, start: solved.start }, next);
    }
  };

  /** A change to the watch list: kept, then the solved craft recounted with the list as it now stands. */
  const onWatch = (change: { hide: WatchEntry } | { remove: WatchEntry } | { add: readonly WatchMod[] } | { showHidden: true }): void => {
    if (!solved) return;
    const id = solved.tablet.id;
    const keyOf = (mods: readonly WatchMod[]): string => setPriceKey(id, mods);
    const next = 'hide' in change ? hide(watchStore, keyOf(change.hide.mods))
      : 'remove' in change ? removeMine(watchStore, id, keyOf(change.remove.mods), keyOf)
      : 'add' in change ? addMine(watchStore, id, change.add, keyOf)
      : unhideAll(watchStore, id);
    setWatchStore(next);
    compute({ tablet: solved.tablet, chosen: solved.chosen, plain: solved.plainCost, start: solved.start }, prices, next);
  };

  const toggle = (id: string): void => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  /**
   * Solve a craft: by default the one ticked now; after a watch-list price changes, the one already
   * solved, again — with `priceMap` holding that price, which state has not delivered yet.
   */
  const compute = (
    spec: { tablet: TabletBase | undefined; chosen: readonly string[]; plain: number | undefined; start: StartKind }
      = { tablet, chosen, plain: plainCost, start: startKind },
    priceMap: Readonly<Record<string, TypedPrice>> = prices,
    store: WatchStore = watchStore,
  ): void => {
    const { tablet, chosen, plain: cost, start } = spec;
    if (!engine || !tablet || chosen.length === 0) return;
    // A Magic starting tablet is planned as holding the likeliest modifier on its side that the craft
    // neither wants nor is blocked by; a start over buys another of the same.
    const junk = start === 'plain' ? undefined : standInJunk(tablet, chosen, ruledOutBy(engine.data, chosen), start);
    if (start !== 'plain' && !junk) { setRunErr('No modifier on that side can sit beside the ones you picked.'); return; }
    // Asked for at solve time and kept with the answer, so the odds shown belong to the craft that was
    // solved — not to whatever is ticked now.
    const watch = watchList(tablet, chosen, prefsFor(store, tablet.id));
    // A price typed while a recount runs starts another, superseding the one running: it is for prices
    // now out of date.
    setRunErr(null);
    const picked = (side: readonly { id: string }[]): number => chosen.filter((id) => side.some((m) => m.id === id)).length;
    runner.run({
      kind: 'lab',
      from: junk === undefined ? { baseId: tablet.id, level: 100 } : {
        item: {
          baseId: tablet.id, level: 100, rarity: 'magic',
          prefixes: start === 'prefix' ? [{ modId: junk, tierDisplay: 1 }] : [],
          suffixes: start === 'suffix' ? [{ modId: junk, tierDisplay: 1 }] : [],
        },
      },
      ...(junk === undefined ? {} : { rebuyable: true }),
      targets: chosen.map((modId) => ({ modId, tierDisplay: 1 })),
      ...(cost === undefined ? {} : { baseCost: cost }),
      // A tablet is always run with all four modifiers: whatever lands beside the ones picked is fine,
      // and any slot still empty at the end is filled with an Exalt, which the cost includes.
      spare: { prefixes: PER_SIDE - picked(tablet.prefixes), suffixes: PER_SIDE - picked(tablet.suffixes) },
      fillOnFinish: true,
      // A tablet's lattice is a few hundred states: solved the sure way, its rarest four modifiers
      // included, which no Search effort settled otherwise (asked 2026-09-23: "compute the ones we want").
      smallLattice: true,
      // Always, even empty: the replay behind it also gives the spread of what a craft costs.
      watch: watch.map((e) => e.mods),
      // What each of those sells for, as typed: the replay then sells one whenever that beats carrying on.
      sell: watch.map((e) => priceMap[setPriceKey(tablet.id, e.mods)]?.ex ?? 0),
      effort: limitsFor(effort),
      // Never an Annulment Orb on a tablet (the maintainer's call, 2026-09-23): at ~7 Chaos Orbs apiece
      // it pays only on the rarest pairs with dear plain tablets — crafts that lose hundreds of div
      // anyway — and costs under 1% more on half the crafts that ever reach for it.
      excluded: [...new Set([...excludedKeys, 'annul'])],
    }, {
      onResult: (res) => {
        if (res.kind !== 'lab') return;
        setSolved({ tablet, chosen, watch, markov: res.markov, plainCost: cost ?? 0, start });
      },
      onError: (e, appUpdated) => {
        setSolved(null);
        setRunErr(appUpdated ? 'The site was updated while this ran — reload the page and try again.'
          : e instanceof Error ? e.message : String(e));
      },
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
              onClick={() => { runner.cancel(); setTabletId(t.id); setChosen([]); setSolved(null); }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <TabletModPicker tablet={tablet} chosen={chosen} ruledOut={ruledOut} onToggle={toggle} />

        <div className="flex flex-wrap items-end gap-4">
          {/* What the craft starts from, and buys again on every start over (2026-09-23). */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start from</span>
            <div role="group" aria-label="Start from" className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
              {(['plain', 'prefix', 'suffix'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={startKind === k}
                  onClick={() => setStartKind(k)}
                  className={cn('rounded px-2.5 py-1', FOCUS, startKind === k ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  {k === 'plain' ? 'Plain tablet' : `Magic · one ${k}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" aria-hidden="true">
              {startCostLabel}
            </span>
            <PriceInput
              text={baseCost}
              onText={setBaseCost}
              unit={plainUnit}
              units={units}
              onUnit={(u) => setBaseUnit(u.key)}
              label={startCostLabel}
              invalid={baseCost.trim() !== '' && plainTyped === undefined}
              size="md"
            />
          </div>
          {basis?.league && (
            // What the starting tablet goes for, to type into the box: a plain one is Normal; a Magic one
            // holds only that side's modifier (the empty-slot filter the trade site answers, standInFilters).
            <a
              href={tradeUrl(startKind === 'plain'
                ? { league: basis.league, baseName: tablet.name, rarity: 'normal', require: [FULL_USES], stats: [] }
                : { league: basis.league, baseName: tablet.name, rarity: 'magic', require: [FULL_USES, ...standInFilters({ side: startKind, worth: 0 })], stats: [] })}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('rounded border border-border px-2 py-1 text-xs hover:border-primary/60 hover:text-foreground', FOCUS)}
              title={startKind === 'plain'
                ? `Opens the trade site: Normal ${tablet.name}s with all 10 uses, instant buyout, cheapest first`
                : `Opens the trade site: Magic ${tablet.name}s holding only a ${startKind}, all 10 uses, instant buyout, cheapest first`}
            >
              {startKind === 'plain' ? 'Find a plain one on trade' : 'Find one on trade'}
            </a>
          )}
          <Button onClick={() => compute()} disabled={computing || chosen.length === 0} size="lg">
            {computing ? 'Working…' : 'What does it cost?'}
          </Button>
          {chosen.length === 0 && <span className="text-xs text-muted-foreground">Pick at least one modifier.</span>}
        </div>

        {computing && <SolveProgressBar progress={progress} onCancel={runner.cancel} />}
        {runErr && <p className="text-sm text-amber-400">{runErr}</p>}
      </Card>

      {solved && (
        <TabletResult
          solved={solved}
          league={basis?.league}
          rates={basis?.rates}
          orbPrices={engine?.prices.currency ?? {}}
          prices={prices}
          onPrice={onPrice}
          recounting={computing}
          unit={shown}
          units={units}
          onUnit={showIn}
          onWatch={onWatch}
          hiddenCount={watchStore.hidden.filter((k) => k.startsWith(`${solved.tablet.id}|`)).length}
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
