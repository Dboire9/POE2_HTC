import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { EngineAlternative, EngineAlternatives, EngineSlot } from '../../lib/engine';
import { exactExalts, formatIn, pickUnit, type CostUnit, type Rates } from '../../lib/currency';

/** Odds of FINISHING inside the budget. Small values still matter here (row 0 is often ~0.1%). */
function fmtPct(p: number): string {
  const pct = p * 100;
  if (pct >= 10) return `${pct.toFixed(0)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.01) return `${pct.toFixed(2)}%`;
  if (pct <= 0) return '0%';
  return `${pct.toPrecision(2)}%`;
}

/** One slot of the alternative item: kept as asked, swapped for a sibling, or dropped. */
const Slot: React.FC<{ slot: EngineSlot }> = ({ slot }) => {
  if (slot.kind === 'dropped') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-xs"
        title={`Dropped: you give up “${slot.text}” entirely`}
      >
        <span className="text-destructive">✗</span>
        <span className="line-through text-muted-foreground">{slot.text}</span>
      </span>
    );
  }
  if (slot.kind === 'swapped') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-xs"
        title={`Swapped: “${slot.fromText}” → “${slot.text}” (same family — a far commoner roll)`}
      >
        <span className="text-amber-600 dark:text-amber-400">⇄</span>
        <span>{slot.text}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{slot.tierLabel}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-xs">
      <span>{slot.text}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{slot.tierLabel}</span>
    </span>
  );
};

const Row: React.FC<{ alt: EngineAlternative; budget: number; best: boolean; unit: CostUnit }> = ({ alt, budget, best, unit }) => {
  const [open, setOpen] = useState(false);
  const changed = alt.dropped + alt.swapped;
  return (
    <Card className={`p-3 space-y-2 ${alt.isTarget ? 'ring-2 ring-primary/40' : best ? 'ring-2 ring-emerald-500/50' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="w-24 shrink-0">
          <div className="text-xl font-bold tabular-nums text-primary">
            {/* Incommensurable prices leave a bracket rather than a point — say so instead of picking one. */}
            {alt.exact ? fmtPct(alt.inBudget) : `${fmtPct(alt.inBudget)}–${fmtPct(alt.inBudgetMax)}`}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">in budget</div>
        </div>
        {/* Bar is the odds, so the eye can scan for where the craft becomes realistic. */}
        <div className="hidden sm:block w-24 shrink-0">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(1, alt.inBudget * 100)}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">
            {(alt.valueRetained * 100).toFixed(0)}% of the value
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0">
          {alt.slots.map((s, i) => <Slot key={i} slot={s} />)}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {alt.isTarget && <Badge variant="outline">your target</Badge>}
          {best && !alt.isTarget && <Badge>best fit</Badge>}
          {!alt.isTarget && changed === 0 && <Badge variant="secondary">lower tiers</Badge>}
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={open}
            title="Show the cheapest way to reach this item"
          >
            {open ? 'hide plan' : 'plan'}
          </button>
        </div>
      </div>

      {open && (
        <ol className="space-y-1 border-t border-border/50 pt-2">
          {alt.plan.steps.map((s) => (
            <li key={s.n} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-right font-mono text-muted-foreground">{s.n}.</span>
              <span className="min-w-40 font-medium">{s.label}</span>
              <span className="flex-1 text-muted-foreground">{s.target}</span>
              <span className="tabular-nums text-xs text-muted-foreground">{Math.min(s.prob * 100, 100).toFixed(1)}%</span>
            </li>
          ))}
          <li className="pt-1 text-[11px] text-muted-foreground">
            {alt.plan.probability > 0 && (
              <>≈ {alt.plan.expectedAttempts.toFixed(1)} attempts ·{' '}
                <span title={exactExalts(alt.plan.expected)}>{formatIn(unit, alt.plan.expected)} expected</span>
                · that’s a {fmtPct(alt.inBudget)} chance of getting there for ≤ {formatIn(unit, budget)}.</>
            )}
          </li>
        </ol>
      )}
    </Card>
  );
};

/**
 * The (closeness ↔ P-in-budget) frontier: near-miss items ranked closest-first, each with the odds you
 * actually FINISH it inside the budget. Row 0 is exactly what you asked for — usually hopeless, which is
 * the whole point of the panel.
 */
const AlternativesView: React.FC<{ alts: EngineAlternatives; budget: number; rates?: Rates }> = ({ alts, budget, rates }) => {
  // The budget joins the max: a row and the budget it is measured against must never disagree on units.
  const unit = pickUnit(
    Math.max(budget, ...alts.rows.map((a) => a.plan.expected).filter(Number.isFinite)),
    rates,
  );
  // An empty frontier is NOT "nothing fits the budget". Row 0 is the exact target and enters with
  // `bestP = -Infinity`, so it survives however hopeless its odds — at a budget of 0.0001 ex you still
  // get a row, reading 0%. Rows can only run out when every variant the search tried failed to produce
  // a plan at all (`evaluate` returns no `alt`: the relaxation was illegal, or its Pareto frontier was
  // empty). That points at the base and item level, not at what you can afford — so the panel must not
  // blame the budget, and it must not vanish either, which read as a crash.
  if (alts.rows.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">No craftable alternative found.</p>
        <p>
          This isn’t about the {formatIn(unit, budget)} — the closest item is always listed, however long the odds.
          Nothing in this target’s neighbourhood could be planned at all, which usually means a target
          tier gated above the item level, or a mod that can’t roll on this base. If neither applies, the
          craft may still be reachable by a route the planner doesn’t explore.
        </p>
      </Card>
    );
  }
  // The frontier's odds strictly rise, so the last row is the surest thing you can afford.
  const bestIdx = alts.rows.length - 1;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Closest crafts for {formatIn(unit, budget)}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {alts.truncated && (
            <Badge variant="outline" title="The node cap stopped the search early — farther alternatives may exist. The ends of this list are solid; the middle is sampled.">
              stopped early
            </Badge>
          )}
          <span>checked {alts.nodesEvaluated.toLocaleString()} items</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Each row is a real item and your chance of <strong>finishing it</strong> for ≤ {formatIn(unit, budget)} — not an
        average cost, which busts about half the time. Ranked closest to what you asked for first, so the
        odds rise as you read down.
      </p>
      <div className="space-y-2">
        {alts.rows.map((a, i) => <Row key={i} alt={a} budget={budget} best={i === bestIdx} unit={unit} />)}
      </div>
    </div>
  );
};

export default AlternativesView;
