import React from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { routeFor, type Engine, type EngineMarkovResult } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit, type CostUnit, type Rates } from '../../lib/currency';
import { PREFS_PREFIX } from '../../lib/currencyPrefs';
import { EFFORT_PRESETS, nextEffort, setEffort } from '../../lib/searchEffort';
import { bestStart, parsePrice, startOptions, startSizes, type StartOption } from '../../lib/startingItem';
import { cn } from '../../lib/utils';
import PolicyGraph from './PolicyGraph';

/**
 * "Which item should I buy to start from — and how do I finish it from there?"
 *
 * Its own section under the from-scratch plan on the Lab, on every craft, open by default and hideable
 * (the player's choice, 2026-09-11). A solve from a white base already prices every item the craft
 * passes through, so each row here is a cell of that solve read out — changing how many modifiers the
 * item carries, or typing a price, re-reads it rather than solving again. So does drawing the route from
 * a row: the result carries the solved policy (`routes`), and `routeFor` walks it from the row's state.
 *
 * Read from the from-WHITE solve, which may start over, on purpose: once an item is bought its price is
 * spent either way, so if it goes wrong the cheapest honest plan still bins it when repairing costs more
 * than a fresh craft (the player's choice, 2026-09-11). The Item tab's `WhatToBuy` asks the other
 * question — you keep the item you have — from its own solve, and stays there. Measured on a 4-target
 * Wand, restart semantics save 18% where a held Rare saves 37%: both right, for their own question.
 */

/** Nothing saved: finishing from this item costs what crafting from scratch does, so its move is to start over. */
const worthNothing = (o: StartOption, scratch: number): boolean => o.worthUpTo <= scratch * 1e-12;

/**
 * A modifier as one line. A hybrid is ONE modifier printed over two lines ("#% increased Spell Damage",
 * "+# to maximum Mana"), so its lines are joined with " / " — never with the " + " that separates two
 * modifiers, which made a one-modifier row read as two.
 */
const modText = (m: string): string => m.split('\n').join(' / ');
const nameOf = (r: StartOption): string => `${r.rarity === 'magic' ? 'Magic' : 'Rare'} · ${r.present.map(modText).join(' + ')}`;

/** The game's colours for the two rarities, so a row's kind of item reads before its modifiers do. */
const RARITY_CLS: Record<StartOption['rarity'], string> = {
  magic: 'border-sky-500/50 text-sky-700 dark:text-sky-300',
  rare: 'border-yellow-500/60 text-yellow-700 dark:text-yellow-300',
};

const TOP_EFFORT = EFFORT_PRESETS[EFFORT_PRESETS.length - 1]!;

/**
 * Hidden stays hidden, craft after craft, until the player shows it again. Stored under the prefs
 * prefix, which survives the version bump that clears everything else in storage.
 */
const HIDDEN_KEY = `${PREFS_PREFIX}startFromItem.hidden.v1`;
function useHidden(): readonly [boolean, (next: boolean) => void] {
  const [hidden, setHidden] = React.useState(() => {
    try { return localStorage.getItem(HIDDEN_KEY) === '1'; } catch { return false; }
  });
  const set = (next: boolean): void => {
    setHidden(next);
    try {
      if (next) localStorage.setItem(HIDDEN_KEY, '1');
      else localStorage.removeItem(HIDDEN_KEY);
    } catch {
      // Storage blocked (private mode): it still hides for this session.
    }
  };
  return [hidden, set] as const;
}

interface Props {
  readonly markov: EngineMarkovResult;
  readonly engine: Engine;
  readonly rates?: Rates;
  /** The craft starts from fractured mods: a real item, so there is no white base for a bought one to replace. */
  readonly carved: boolean;
  /** The Search effort `markov` was solved at — "compute again" offers the rung above it. */
  readonly ranAt: string;
  /** A solve is running; the one-click recompute waits for it. */
  readonly computing: boolean;
  /** Solve the same craft again at this Search effort. */
  readonly recompute: (effortId: string) => void;
}

const StartFromItem: React.FC<Props> = ({ markov, engine, rates, carved, ranAt, computing, recompute }) => {
  const [hidden, setHidden] = useHidden();
  const bodyId = React.useId();
  const sizes = startSizes(markov.holdings);
  const [k, setK] = React.useState(() => (sizes.includes(2) ? 2 : sizes[0] ?? 1));
  // What the player typed, per row, as text — so a half-typed "1." or "0," stays in the box.
  const [typed, setTyped] = React.useState<Readonly<Record<string, string>>>({});
  const scratch = (markov.restartCost ?? 0) + markov.expectedCost;
  // ONE unit for the table, from its largest value — crafting from scratch, which bounds every row.
  const unit = pickUnit(scratch, rates);
  const units: CostUnit[] = [
    { key: 'exalt', label: 'ex', perExalt: 1 },
    ...(rates?.chaos ? [{ key: 'chaos' as const, label: 'chaos', perExalt: rates.chaos }] : []),
    ...(rates?.divine ? [{ key: 'divine' as const, label: 'div', perExalt: rates.divine }] : []),
  ];
  const [priceUnitKey, setPriceUnitKey] = React.useState<CostUnit['key']>(unit.key);
  const [chosen, setChosen] = React.useState<string | null>(null);
  // Walking a route is quick but not free on a big craft, so the click lands first and the graph after.
  const drawn = React.useDeferredValue(chosen);
  const route = React.useMemo(() => (drawn === null ? null : routeFor(engine, markov, drawn)), [engine, markov, drawn]);
  // Every key typed in a price box re-renders this panel, and the route under it stays the same. On a
  // big craft that graph is thousands of states, so it is built once per route, not once per key.
  const graph = React.useMemo(
    () => (route === null ? null : <PolicyGraph result={route} rates={rates} startLabel="The item you buy" />),
    [route, rates],
  );

  const section = (body: React.ReactNode): React.ReactElement => (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Start from an item you buy instead</h3>
        <button
          type="button"
          aria-expanded={!hidden}
          aria-controls={bodyId}
          onClick={() => setHidden(!hidden)}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {hidden ? 'Show' : 'Hide'}
        </button>
      </div>
      {!hidden && <div id={bodyId} className="space-y-3">{body}</div>}
    </Card>
  );

  if (carved) {
    return section(
      <p className="text-xs text-muted-foreground">
        Not available for a craft that starts from fractured modifiers: that item is already the start, so
        there is no white base for a bought one to replace.
      </p>,
    );
  }
  /**
   * The solve stopped before it settled — a bound, or no number at all. A bound is not an answer, and a
   * table of bounds compared with each other is worse than one, so there are no rows; but the panel
   * stays, and offers the one thing that fixes it in one click. Both the clock and the sweep cap rise
   * with Search effort, so the next rung up is the move until there is none.
   */
  if (markov.applicable && (markov.stoppedEarly === true || (markov.feasible && markov.bound !== 'exact'))) {
    const next = nextEffort(ranAt);
    return section(
      <>
        <p className="text-xs text-muted-foreground">
          Every row here is a cost from the solve above, and that solve stopped before its costs settled —
          so there is no list to trust yet.
        </p>
        {next ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button size="sm" disabled={computing} onClick={() => { setEffort(next.id); recompute(next.id); }}>
              {computing ? 'Computing…' : `Compute again at ${next.label}`}
            </Button>
            <span className="text-[11px] text-muted-foreground">{next.hint}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            This is <strong>{TOP_EFFORT.label}</strong> already — the craft is beyond what the solver can settle.
          </p>
        )}
      </>,
    );
  }
  // No true cost for a reason trying harder cannot fix; the card above says which. Only a from-white
  // solve prices "instead of a white base", and it always echoes `restartCost`.
  if (!markov.applicable || !markov.feasible || markov.restartCost === undefined) return null;
  if (sizes.length === 0) {
    return section(
      <p className="text-xs text-muted-foreground">
        With a single target there is nothing to start from: an item already holding it is the finished item.
      </p>,
    );
  }

  const fmt = (x: number): string => formatIn(unit, x);
  const priceUnit = units.find((u) => u.key === priceUnitKey) ?? units[0]!;
  const prices = new Map<string, number>();
  for (const [key, text] of Object.entries(typed)) {
    const v = parsePrice(text);
    if (v !== undefined) prices.set(key, v * priceUnit.perExalt);
  }
  const rows = startOptions(markov.holdings!, scratch, k, prices);
  const best = bestStart(rows);
  const wins = best !== undefined && best.total < scratch;
  const picked = rows.find((r) => r.key === chosen);
  const base = markov.restartCost;
  const th = 'whitespace-nowrap pb-1 pr-3 font-normal';

  return section(
    <>
      <p className="text-xs text-muted-foreground">
        Buy an item that already has some of the target modifiers, then finish the craft from it. Type what
        the item costs on trade to see whether that beats crafting from scratch.
      </p>

      <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
        <span className="text-muted-foreground">Crafting from scratch costs</span>
        <strong className="text-sm tabular-nums" title={exactExalts(scratch)}>{fmt(scratch)}</strong>
        {base > 0
          ? <span className="text-muted-foreground">— a white base ({fmt(base)}) plus the craft</span>
          : <span className="text-muted-foreground">— the white base counted as free; set <strong>Base cost</strong> if it is not</span>}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <div role="group" aria-label="Target modifiers already on the item" className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Modifiers already on the item</span>
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={k === s}
              onClick={() => { setK(s); setChosen(null); }}
              className={cn(
                'rounded border px-2 py-0.5 tabular-nums transition-colors',
                k === s ? 'border-primary/60 bg-primary/20 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Trade prices in</span>
          <select
            value={priceUnit.key}
            onChange={(e) => setPriceUnitKey(e.target.value as CostUnit['key'])}
            className="rounded border border-border bg-background px-1 py-0.5"
          >
            {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] text-muted-foreground">
              <th className={th}>Item to buy</th>
              <th className={cn(th, 'text-right')} title="The true expected cost of finishing the craft from this item">Cost to finish</th>
              <th className={cn(th, 'text-right')} title="Crafting from scratch minus the cost to finish: pay less than this and you come out ahead">Pay at most</th>
              <th className={cn(th, 'text-right')}>Trade price</th>
              <th className={cn(th, 'text-right')} title="Trade price plus the cost to finish">Total</th>
              <th className="pb-1"><span className="sr-only">Route</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const text = typed[r.key] ?? '';
              const unreadable = text.trim() !== '' && parsePrice(text) === undefined;
              const isBest = wins && best.key === r.key;
              return (
                <tr key={r.key} className={cn('border-t border-border/60', chosen === r.key ? 'bg-primary/10' : isBest && 'bg-emerald-500/10')}>
                  <td className="min-w-[14rem] py-1.5 pr-3">
                    <div className="flex items-start gap-1.5">
                      <span className={cn('mt-px shrink-0 rounded border px-1 text-[10px] font-semibold uppercase', RARITY_CLS[r.rarity])}>
                        {r.rarity === 'magic' ? 'Magic' : 'Rare'}
                      </span>
                      <div>
                        {r.present.map((m) => <span key={m} className="block">{modText(m)}</span>)}
                        {isBest && (
                          <span className="mt-0.5 inline-block rounded bg-emerald-500/20 px-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                            best buy
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 text-right tabular-nums" title={exactExalts(r.finish)}>{fmt(r.finish)}</td>
                  <td className={cn('whitespace-nowrap py-1.5 pr-3 text-right tabular-nums', worthNothing(r, scratch) && 'text-amber-600 dark:text-amber-300')}>
                    {worthNothing(r, scratch) ? 'not worth buying' : fmt(r.worthUpTo)}
                  </td>
                  <td className="py-1.5 pr-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="text" inputMode="decimal" autoComplete="off" placeholder="—"
                        value={text}
                        onChange={(e) => { const v = e.target.value; setTyped((t) => ({ ...t, [r.key]: v })); }}
                        aria-label={`Trade price for ${nameOf(r)}, in ${priceUnit.label}`}
                        aria-invalid={unreadable || undefined}
                        title={unreadable ? 'Not a price — type a number, like 12 or 0.5' : undefined}
                        className={cn(
                          'w-16 rounded border bg-background px-1.5 py-0.5 text-right tabular-nums',
                          unreadable ? 'border-red-500' : 'border-border',
                        )}
                      />
                      <span className="w-8 text-left text-muted-foreground">{priceUnit.label}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 text-right tabular-nums" title={r.total === undefined ? undefined : exactExalts(r.total)}>
                    {r.total === undefined ? <span className="text-muted-foreground">—</span> : (
                      <>
                        <span className="block">{fmt(r.total)}</span>
                        <span className={cn('block text-[10px]', r.total < scratch
                          ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300')}>
                          {r.total < scratch ? `saves ${fmt(scratch - r.total)}` : `${fmt(r.total - scratch)} more`}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-1.5 text-right">
                    <button
                      type="button"
                      aria-pressed={chosen === r.key}
                      aria-label={`Route from ${nameOf(r)}`}
                      onClick={() => setChosen(chosen === r.key ? null : r.key)}
                      className="whitespace-nowrap rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {chosen === r.key ? 'Hide route' : 'Route ▸'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {best && (
        <p
          role="status"
          className={cn('rounded-md border px-3 py-2 text-xs', wins
            ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/10')}
        >
          {wins ? (
            <span>
              Best of the items you priced: <strong>{nameOf(best)}</strong> — {fmt(best.total)} in total,{' '}
              <strong>{fmt(scratch - best.total)} less</strong> than crafting from scratch.
            </span>
          ) : (
            <span>
              None of the items you priced beats crafting from scratch: the cheapest,{' '}
              <strong>{nameOf(best)}</strong>, comes to {fmt(best.total)}, {fmt(best.total - scratch)} more.
            </span>
          )}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        The price sheet has no prices for items with specific modifiers, so type what you find on trade — a
        dot or a comma both work (0.5 or 0,5). Each row assumes the <strong>rest of the item is empty</strong>:
        a listing that also carries modifiers you do not want costs more to finish, because they have to come
        off first. If a bought item goes badly, the plan may drop it and start over from a white base when
        that is cheaper than fixing it — what you paid is spent either way.
      </p>

      {picked && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <p>
              <span className="text-muted-foreground">Route from </span>
              <strong>{nameOf(picked)}</strong>
              <span className="text-muted-foreground"> — finishing costs </span>
              <span className="tabular-nums" title={exactExalts(picked.finish)}>{fmt(picked.finish)}</span>
            </p>
            <button type="button" onClick={() => setChosen(null)} className="text-muted-foreground underline underline-offset-2 hover:text-foreground">
              Hide this route
            </button>
          </div>
          {worthNothing(picked, scratch) ? (
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              From this item the cheapest move is to start over from a white base — it saves nothing over
              crafting from scratch.
            </p>
          ) : graph === null || drawn !== chosen ? (
            <p className="text-[11px] text-muted-foreground">Drawing the route…</p>
          ) : graph}
        </div>
      )}
    </>,
  );
};

export default StartFromItem;
