import React from 'react';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engine';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import { mainLine } from '../../lib/policyPath';

// The from-item MDP's optimal policy, shown two ways.
//
// By default: the MAIN LINE — the route you actually walk, start to target, taking the outcome the
// policy is playing for at each step, with the brick risk beside it. That is the question a player is
// asking, and it is a short list however big the craft is.
//
// Behind a disclosure: the full state graph, laid out left→right by distance from the target. It used
// to be the only view, and on a five-target craft that is 262 squares — most sharing a label, and all
// rounding to the same cost because they sit within a fraction of a percent of each other. Honest,
// complete, and unreadable; it earns its place as the detail view, not the answer.

const W = 148; // node width
const H = 54; // node height
const COL_GAP = 84; // horizontal gap between depth columns (room for arrows)
const ROW_GAP = 22;
const PAD = 16;

interface Placed { node: EnginePolicyNode; x: number; y: number; }

/** Short state label: target mods present + any off-tier blocks + how much junk remains. */
function stateLabel(nd: EnginePolicyNode): string {
  const junk = nd.junkPrefixes + nd.junkSuffixes;
  const kept = nd.present.length;
  const parts = [`${kept} mod${kept === 1 ? '' : 's'}`];
  if (nd.blocked.length > 0) parts.push(`${nd.blocked.length} off-tier`);
  if (junk > 0) parts.push(`+${junk} junk`);
  // Called out separately from ordinary junk: it also blocks desecrating again until it's removed.
  if (nd.desecratedJunk) parts.push('+1 desecrated');
  return parts.join(' · ');
}

const pct = (p: number): string => (p >= 0.1 ? `${Math.round(p * 100)}%` : `${(p * 100).toPrecision(1)}%`);

const FullGraph: React.FC<{ result: EngineMarkovResult; fmtCost: (x: number) => string }> = ({ result, fmtCost }) => {
  // Column = distance from the goal (higher depth ⇒ further ⇒ further left). Goal (depth 0) is rightmost.
  const depths = [...new Set(result.nodes.map((n) => n.depth))].sort((a, b) => b - a);
  const colOf = new Map(depths.map((d, i) => [d, i]));
  const placed: Placed[] = [];
  const rowInCol = new Map<number, number>();
  for (const node of [...result.nodes].sort((a, b) => b.depth - a.depth || b.expectedCost - a.expectedCost)) {
    const col = colOf.get(node.depth)!;
    const row = rowInCol.get(col) ?? 0;
    rowInCol.set(col, row + 1);
    placed.push({ node, x: PAD + col * (W + COL_GAP), y: PAD + row * (H + ROW_GAP) });
  }
  const posOf = new Map(placed.map((p) => [p.node.key, p]));
  const width = PAD * 2 + depths.length * W + (depths.length - 1) * COL_GAP;
  const height = PAD * 2 + Math.max(...rowInCol.values()) * (H + ROW_GAP) - ROW_GAP;

  // Anchor points: forward edges leave the right edge and enter the left edge; back-arrows (regress)
  // leave the top and re-enter the top so they arc above the row rather than cross the boxes.
  const edges = result.edges
    .filter((e) => posOf.has(e.from) && posOf.has(e.to) && e.from !== e.to && e.prob > 0.001)
    .map((e) => {
      const a = posOf.get(e.from)!;
      const b = posOf.get(e.to)!;
      const opacity = Math.max(0.18, Math.min(1, e.prob));
      if (e.regress) {
        const x1 = a.x + W / 2; const y1 = a.y; const x2 = b.x + W / 2; const y2 = b.y;
        const lift = 26 + Math.abs(x2 - x1) * 0.12;
        return { key: `${e.from}->${e.to}`, regress: true, opacity,
          d: `M ${x1} ${y1} C ${x1} ${y1 - lift}, ${x2} ${y2 - lift}, ${x2} ${y2}` };
      }
      const x1 = a.x + W; const y1 = a.y + H / 2; const x2 = b.x; const y2 = b.y + H / 2;
      const mx = (x1 + x2) / 2;
      return { key: `${e.from}->${e.to}`, regress: false, opacity,
        d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}` };
    });

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/20 p-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-muted-foreground" role="img" aria-label="Optimal crafting policy graph">
        <defs>
          <marker id="pg-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" />
          </marker>
          <marker id="pg-arrow-brick" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-amber-500" />
          </marker>
        </defs>

        {edges.map((e) => (
          <path
            key={e.key} d={e.d} fill="none"
            className={e.regress ? 'stroke-amber-500' : 'stroke-muted-foreground'}
            strokeWidth={e.regress ? 1.25 : 1.5} strokeOpacity={e.opacity}
            strokeDasharray={e.regress ? '4 3' : undefined}
            markerEnd={`url(#${e.regress ? 'pg-arrow-brick' : 'pg-arrow'})`}
          />
        ))}

        {placed.map(({ node, x, y }) => {
          const tip = `${node.present.length > 0 ? node.present.join(', ') : 'no target mods yet'}`
            + `${node.blocked.length > 0 ? ` · off-tier: ${node.blocked.join(', ')}` : ''}`
            + `${node.junkPrefixes + node.junkSuffixes > 0 ? ` · ${node.junkPrefixes + node.junkSuffixes} junk` : ''}`
            + `${node.desecratedJunk ? ` · unwanted desecrated ${node.desecratedJunk}` : ''}`
            + ` · E ${fmtCost(node.expectedCost)}${node.action ? ` · ${node.action}` : ''}`;
          const boxClass = node.isGoal ? 'fill-emerald-500/15 stroke-emerald-500'
            : node.isStart ? 'fill-background stroke-primary' : 'fill-background stroke-border';
          return (
            <g key={node.key}>
              <title>{tip}</title>
              <rect x={x} y={y} width={W} height={H} rx={7} className={boxClass} strokeWidth={node.isStart || node.isGoal ? 2 : 1} />
              {node.isGoal ? (
                <text x={x + W / 2} y={y + H / 2 + 4} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[12px] font-semibold">✓ target</text>
              ) : (
                <>
                  <text x={x + 9} y={y + 18} className="fill-foreground text-[11px] font-medium">{stateLabel(node)}</text>
                  <text x={x + 9} y={y + 34} className="fill-primary text-[11px] font-semibold">{node.action}</text>
                  <text x={x + W - 9} y={y + 34} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{fmtCost(node.expectedCost)}</text>
                  {node.isStart && <text x={x + 9} y={y + 48} className="fill-primary text-[9px] uppercase tracking-wider">start</text>}
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const PolicyGraph: React.FC<{ result: EngineMarkovResult; rates?: Rates }> = ({ result, rates }) => {
  const [showAll, setShowAll] = React.useState(false);
  if (!result.applicable || !result.feasible || result.nodes.length === 0) return null;
  // One unit across BOTH views, from the largest node cost — these are all the same quantity
  // (cost-to-finish from a state), so mixing units would defeat comparing them.
  const unit = pickUnit(
    Math.max(0, ...result.nodes.map((n) => n.expectedCost).filter(Number.isFinite)),
    rates,
  );
  const fmtCost = (x: number): string => formatIn(unit, x);
  const { steps, goal } = mainLine(result);
  // A stall (no forward edge from some state) leaves nothing to draw as a line — show the full graph
  // rather than a route that stops mid-air.
  const haveLine = steps.length > 0 && goal !== undefined;
  // Sharper than "no line could be walked": the target is not in the graph AT ALL.
  //
  // The graph is the closure of states reachable under the policy value iteration had arrived at when
  // it stopped. Stop it early and that policy is provisional — on a long-shot craft it can close over
  // a handful of states that never advance, so the picture is a dead end rather than a route. Measured
  // on the reported craft at the Standard effort: 14 states spanning depths 7 down to 4, and the goal
  // (depth 0) absent. Drawing that as "the optimal policy" is the most confidently wrong thing this
  // panel can do, so it gets a notice rather than a picture.
  const reachesTarget = result.nodes.some((n) => n.isGoal);

  return (
    <div className="space-y-2">
      {!reachesTarget && (
        <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
          <strong>No route to show yet.</strong> The solver stopped before its policy settled, and what
          it had worked out does not reach your target — every state it explored still needs more mods
          than it found a way to add. The states below are real, but they are a dead end, not a plan.
          Raise <strong>Search effort</strong> and run it again.
        </p>
      )}

      {reachesTarget && haveLine && !showAll && (
        <ol className="rounded-md border border-border bg-muted/20 divide-y divide-border/60">
          {steps.map((s, i) => (
            <li key={s.node.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2 text-sm">
              <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">{i + 1}.</span>
              <span className="font-semibold text-primary min-w-44">{s.action}</span>
              <span className="flex-1 min-w-40 text-muted-foreground text-xs">
                {s.node.isStart ? 'your item' : stateLabel(s.node)} → {stateLabel(s.next)}
              </span>
              <span className="tabular-nums text-xs">
                <span className="text-emerald-600 dark:text-emerald-400">{pct(s.advance)} onward</span>
                {s.brick > 0 && (
                  <span className="text-amber-600 dark:text-amber-400"> · {pct(s.brick)} back</span>
                )}
              </span>
              <span className="tabular-nums text-xs text-muted-foreground w-20 text-right">{fmtCost(s.node.expectedCost)}</span>
            </li>
          ))}
          <li className="px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">✓ target</li>
        </ol>
      )}

      {(showAll || !haveLine || !reachesTarget) && <FullGraph result={result} fmtCost={fmtCost} />}

      {reachesTarget && haveLine && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          aria-expanded={showAll}
        >
          {showAll
            ? 'Show just the route'
            : `Show all ${result.nodes.length} states the policy can reach`}
        </button>
      )}

      {/*
        The visual above publishes nothing to assistive tech on its own — the SVG is a single labelled
        image, and the route list is fine but the full graph is not. This is the same data as text. It
        is `sr-only` rather than hidden so it reaches assistive tech; the picture stays the visual
        presentation of it. The ROUTE comes first, because that is the answer.
      */}
      <div className="sr-only">
        <h4>Optimal policy, as text</h4>
        {!reachesTarget && (
          <p>
            No route to show: the solver stopped before its policy settled, and none of the states it
            explored reaches the target. Raise the search effort and run it again.
          </p>
        )}
        {reachesTarget && haveLine && (
          <>
            <p>The route from your item to the target, {steps.length} step{steps.length === 1 ? '' : 's'}.</p>
            <ol>
              {steps.map((s) => (
                <li key={s.node.key}>
                  {`${s.action}. ${pct(s.advance)} chance this moves you onward`}
                  {s.brick > 0 ? `, ${pct(s.brick)} chance of going backwards` : ''}
                  {`. Expected cost from here ${fmtCost(s.node.expectedCost)}.`}
                </li>
              ))}
            </ol>
          </>
        )}
        <p>
          All {result.nodes.length} item state{result.nodes.length === 1 ? '' : 's'} the policy can
          reach, ordered from your item to the target.
        </p>
        <ol>
          {[...result.nodes]
            .sort((a, b) => b.depth - a.depth || b.expectedCost - a.expectedCost)
            .map((nd) => (
              <li key={nd.key}>
                {nd.isStart ? 'Your item: ' : nd.isGoal ? 'Target reached: ' : ''}
                {stateLabel(nd)}
                {`. Expected cost from here ${fmtCost(nd.expectedCost)}.`}
                {nd.action ? ` Best action: ${nd.action}.` : ''}
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default PolicyGraph;
