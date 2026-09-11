import React from 'react';
import { routeFor, type Engine, type EngineMarkovResult } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit, type CostUnit, type Rates } from '../../lib/currency';
import { startOptions, startSizes, type StartOption } from '../../lib/startingItem';
import { cn } from '../../lib/utils';
import PolicyGraph from './PolicyGraph';

/**
 * "Which item should I buy to start from — and how do I finish it from there?"
 *
 * Beside the from-scratch plan on the Lab, because that is what every row is measured against. A solve
 * from a white base already prices every item the craft passes through, so each row here is a cell of
 * that solve read out — changing how many modifiers the item carries, or typing a price, re-reads it
 * rather than solving again. So does drawing the route from a row: the result carries the solved
 * policy (`routes`), and `routeFor` walks it from the row's state.
 *
 * Read from the from-WHITE solve, which may start over, on purpose: once an item is bought its price is
 * spent either way, so if it goes wrong the cheapest honest plan still bins it when repairing costs more
 * than a fresh craft (the player's choice, 2026-09-11). The Item tab's `WhatToBuy` asks the other
 * question — you keep the item you have — from its own solve, and stays there.
 */

/** Nothing saved: finishing from this item costs what crafting from scratch does, so its move is to start over. */
const worthNothing = (o: StartOption, scratch: number): boolean => o.worthUpTo <= scratch * 1e-12;

const StartFromItem: React.FC<{ markov: EngineMarkovResult; engine: Engine; rates?: Rates }> = ({ markov, engine, rates }) => {
  const sizes = startSizes(markov.holdings);
  const [k, setK] = React.useState(() => (sizes.includes(2) ? 2 : sizes[0] ?? 1));
  // What the player typed, per row, as text — so a half-typed "1." stays in the box.
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

  // Only a from-white Lab solve can answer this: it is the one that prices "instead of a white base".
  if (markov.restartCost === undefined || sizes.length === 0) return null;
  /**
   * A bound is not an answer, and a table of bounds compared against each other is worse than one: the
   * differences between them are bounded by nothing. Same rule as `WhatToBuy`, and said rather than
   * silent, because raising the effort is the fix. (The solver attaches `routes` only to an exact
   * solve, so this is also what guarantees a row can draw its route.)
   */
  if (markov.bound !== 'exact') {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Start from an item you buy instead</strong> — the app works this out
        from a settled cost, and this craft only reached a {markov.bound === 'lower' ? 'floor' : 'ceiling'}.
        Raise <strong>Search effort</strong> and compute again.
      </p>
    );
  }

  const fmt = (x: number): string => formatIn(unit, x);
  const priceUnit = units.find((u) => u.key === priceUnitKey) ?? units[0]!;
  const prices = new Map<string, number>();
  for (const [key, text] of Object.entries(typed)) {
    const v = Number(text);
    if (text.trim() !== '' && Number.isFinite(v)) prices.set(key, v * priceUnit.perExalt);
  }
  const rows = startOptions(markov.holdings!, scratch, k, prices);
  const picked = rows.find((r) => r.key === chosen);
  const nameOf = (r: StartOption): string => `${r.rarity === 'magic' ? 'Magic' : 'Rare'} · ${r.present.join(' + ')}`;
  const base = markov.restartCost;

  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Start from an item you buy instead
      </p>
      <p className="text-[11px] text-muted-foreground">
        Every item already carrying some of these modifiers, and what finishing from it costs on the same
        plan — which still drops the item and starts over from a white base when that is cheaper than
        repairing it, because what you paid is spent either way. <strong>Worth up to</strong> is crafting from
        scratch less finishing: pay less than that for the item and you come out ahead. Crafting from
        scratch costs <span className="tabular-nums" title={exactExalts(scratch)}>{fmt(scratch)}</span>
        {base > 0
          ? <span>, of which <span className="tabular-nums">{fmt(base)}</span> is the white base.</span>
          : <span>, with the white base counted as free — set <strong>Base cost</strong> if it is not.</span>}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
        <div role="group" aria-label="Target modifiers already on the item" className="flex items-center gap-1">
          <span className="text-muted-foreground">Already on it</span>
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
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">Prices in</span>
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
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="font-normal pb-1">Already on it</th>
              <th className="font-normal pb-1 text-right">Finishing costs</th>
              <th className="font-normal pb-1 text-right">Worth up to</th>
              <th className="font-normal pb-1 text-right">Trade price</th>
              <th className="font-normal pb-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={cn('border-t border-border/60', chosen === r.key && 'bg-primary/10')}>
                <td className="py-1 pr-3 align-top">
                  <button
                    type="button"
                    aria-pressed={chosen === r.key}
                    onClick={() => setChosen(chosen === r.key ? null : r.key)}
                    title="Show the route from this item"
                    className="text-left underline-offset-2 hover:underline"
                  >
                    {nameOf(r)}
                  </button>
                </td>
                <td className="py-1 pr-3 text-right tabular-nums align-top" title={exactExalts(r.finish)}>{fmt(r.finish)}</td>
                <td className={cn('py-1 pr-3 text-right tabular-nums align-top', worthNothing(r, scratch) && 'text-amber-600 dark:text-amber-300')}>
                  {worthNothing(r, scratch) ? 'nothing' : fmt(r.worthUpTo)}
                </td>
                <td className="py-1 pr-3 text-right align-top">
                  <input
                    type="number" min={0} step="any" inputMode="decimal" placeholder="—"
                    value={typed[r.key] ?? ''}
                    onChange={(e) => { const v = e.target.value; setTyped((t) => ({ ...t, [r.key]: v })); }}
                    aria-label={`Trade price for ${nameOf(r)}, in ${priceUnit.label}`}
                    className="w-20 rounded border border-border bg-background px-1 py-0.5 text-right tabular-nums"
                  />
                </td>
                <td
                  className={cn('py-1 text-right tabular-nums align-top', r.total !== undefined
                    && (r.total < scratch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300'))}
                  title={r.total === undefined ? undefined : exactExalts(r.total)}
                >
                  {r.total === undefined ? '—' : fmt(r.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        The price sheet has no prices for items with specific modifiers, so <strong>type what you find on
        trade</strong>: the list re-ranks by the total, and a total under crafting from scratch is a better
        start. Each row assumes the <strong>rest of the item is empty</strong> — a listing that also carries
        modifiers you do not want costs more than this to finish, because they have to come off first.
      </p>

      {picked && (
        <div className="space-y-2 border-t border-border pt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11px]">
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
          ) : route === null || drawn !== chosen ? (
            <p className="text-[11px] text-muted-foreground">Drawing the route…</p>
          ) : (
            <PolicyGraph result={route} rates={rates} startLabel="The item you buy" />
          )}
        </div>
      )}
    </div>
  );
};

export default StartFromItem;
