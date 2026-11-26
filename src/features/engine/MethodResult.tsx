import React from 'react';
import type { EngineMethodResult } from '../../lib/engineTypes';
import { exactExalts, formatBoundedCost, formatCount, formatIn, pickUnit, type Rates } from '../../lib/currency';
import { SpreadLines } from './CostSpread';

/** Below this share of the best plan's cost a gap is the solver's tolerance, not a difference. */
const SAME = 1e-6;

/** "12%", "0.4%" — a share worth one decimal only while it is small. */
const percent = (x: number): string => {
  const p = x * 100;
  return `${p < 10 ? Number(p.toFixed(1)).toString() : Math.round(p).toString()}%`;
};

/** How often a craft passes a state: "2.4", "0.31", "0.0042" — never a rounded "0.0". */
const timesWords = (v: number): string => (v >= 1 ? formatCount(v) : Number(v.toPrecision(2)).toString());

/**
 * What "Check my method" found: the method's cost beside the best plan's and the gap, its spread, and
 * where it costs the player — or, when it could not be costed, the one sentence that says where and why.
 * `first` is the base a craft from white starts from, counted into the spread as Play it out counts it.
 */
const MethodResult: React.FC<{
  result: EngineMethodResult;
  first: number;
  rates: Rates | undefined;
  budget?: number | undefined;
  sale?: number | undefined;
  /** The method was edited after this check: the result describes the rules as they were. */
  stale: boolean;
}> = ({ result, first, rates, budget, sale, stale }) => {
  const staleLine = stale && (
    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
      You have changed your method since this check — check it again to cost the rules as they stand.
    </p>
  );
  if (!result.ok) {
    return (
      <div className="space-y-1.5">
        {staleLine}
        <div className="rounded-md border border-destructive/60 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Your method could not be costed</p>
          <p className="mt-1">{result.stop.message}</p>
        </div>
      </div>
    );
  }
  const r = result;
  const pct = r.replay?.costPercentiles;
  const spread = pct && pct.length > 0 ? pct.map((c) => c + first) : undefined;
  const unit = pickUnit(Math.max(r.cost, r.best.cost, spread?.[90] ?? 0), rates);
  const fmt = (ex: number): string => formatIn(unit, ex);
  const gap = r.gap;
  const same = gap !== undefined && gap <= SAME * Math.max(1, r.best.cost);
  return (
    <div className={stale ? 'space-y-3 opacity-70' : 'space-y-3'}>
      {staleLine}
      {gap !== undefined ? (
        <p className="text-sm">
          Your method: <strong className="tabular-nums" title={exactExalts(r.cost)}>{fmt(r.cost)}</strong>
          {' · '}Best plan: <span className="tabular-nums" title={exactExalts(r.best.cost)}>{fmt(r.best.cost)}</span>
          {' · '}
          {same ? <strong>It costs you nothing more than the best plan.</strong> : (
            <>It costs you <strong className="tabular-nums">{fmt(gap)}</strong>
              {r.best.cost > 0 ? ` (${percent(gap / r.best.cost)})` : ''} more per finished item.</>
          )}
        </p>
      ) : (
        <>
          <p className="text-sm">
            Your method: <strong className="tabular-nums" title={exactExalts(r.cost)}>{fmt(r.cost)}</strong> per finished item.
          </p>
          <p className="text-xs text-muted-foreground">
            The best plan here is only a bound ({formatBoundedCost(r.best.bound, r.best.cost, rates)}), so the gap
            between the two cannot be measured. Raising <strong>Search effort</strong> and computing again may
            settle the best plan.
          </p>
        </>
      )}

      <section aria-label="What a craft can cost with your method" className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What a craft can cost with your method</h5>
        {r.replay && spread ? (
          <SpreadLines
            spread={spread} mean={first + r.cost} runs={r.replay.runs} first={first} fmt={fmt}
            budget={budget} sale={sale} following="your method"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Not played out{r.replayReason ? `: ${r.replayReason}` : ''}. The average above stands on its own.
          </p>
        )}
      </section>

      {gap !== undefined && !same && r.where.length > 0 && (
        <section aria-label="Where it costs you" className="space-y-2 text-sm">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Where it costs you</h5>
          <ol className="space-y-2">
            {r.where.map((w, i) => (
              <li key={i} className="rounded-md border border-border/60 p-2">
                <p className="font-medium">{w.where}</p>
                <p>
                  {w.rule}: your move <strong>{w.yourMove}</strong> · the best move <strong>{w.bestMove}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Costs you <strong className="tabular-nums text-foreground">{fmt(w.costsYou)}</strong> per finished
                  item — your method is here {timesWords(w.visits)} times a craft, on average.
                </p>
              </li>
            ))}
          </ol>
          {r.elsewhere && (
            <p className="text-xs">
              Elsewhere: {r.elsewhere.states} more item state{r.elsewhere.states === 1 ? '' : 's'} cost you{' '}
              <span className="tabular-nums">{fmt(r.elsewhere.costsYou)}</span> together.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Each row is how often your method reaches that item, times what your move there costs over the best
            move, both played on from there the best way. Together they make up the whole gap.
          </p>
        </section>
      )}
      {r.notes.length > 0 && (
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          {r.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
    </div>
  );
};

export default MethodResult;
