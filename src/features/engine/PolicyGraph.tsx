import React from 'react';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engine';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';

// Visualises the from-item MDP's optimal policy as a graph: each square is an item state, laid out
// left→right by how far it is from the target (start on the left, goal on the right). Forward arrows are
// the progress outcomes; dashed amber back-arrows are the "bricks" — a bad annul/chaos that sends you to
// an earlier state, which the policy then digs out of. Pure inline SVG, theme-aware via Tailwind classes.

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

const PolicyGraph: React.FC<{ result: EngineMarkovResult; rates?: Rates }> = ({ result, rates }) => {
  if (!result.applicable || !result.feasible || result.nodes.length === 0) return null;
  // One unit across the whole graph, from its largest node cost — the graph is read by comparing
  // states, and mixed units would defeat that.
  const unit = pickUnit(
    Math.max(0, ...result.nodes.map((n) => n.expectedCost).filter(Number.isFinite)),
    rates,
  );
  const fmtCost = (x: number): string => formatIn(unit, x);

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
      {/*
        The SVG above is `role="img"` with a single label, which is honest but publishes nothing: the
        policy it draws — the MDP's actual recommendation — would be unreadable without sight. This is
        the same data as a list. It is `sr-only` rather than hidden so it reaches assistive tech; the
        picture stays the visual presentation of it.
      */}
      <div className="sr-only">
        <h4>Optimal policy, as text</h4>
        <p>
          {result.nodes.length} item state{result.nodes.length === 1 ? '' : 's'}, ordered from your item
          to the target.
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
                {(() => {
                  const bricks = result.edges.filter((e) => e.from === nd.key && e.regress);
                  return bricks.length === 0 ? '' : ` Risk: ${bricks
                    .map((e) => `${Math.round(e.prob * 100)}% chance of going backwards`)
                    .join(', ')}.`;
                })()}
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default PolicyGraph;
