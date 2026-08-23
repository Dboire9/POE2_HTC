import React from 'react';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engine';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import { mainLine, type StepChanges } from '../../lib/policyPath';

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

/**
 * One box in the full graph: a REPRESENTATIVE state plus how many states it stands for.
 *
 * The graph used to draw one box per state, and on a five-target craft that is 262 of them — with
 * `2 mods · 1 off-tier / Annul / 14.9K div` repeating down a single column. Those really are distinct
 * states (they differ in WHICH mods are present), but the label discards that, so the picture showed
 * the same box over and over. Grouping by exactly what a box displays collapses 262 to 79.
 */
interface Group { node: EnginePolicyNode; count: number; x: number; y: number; }

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

/**
 * What a step does, in words.
 *
 * "MOST LIKELY lands X", never "add X". The policy picks the orb, not the outcome — an Exalt is a
 * slam, and the mod named here is simply the one on the step's highest-probability edge, which is the
 * edge the route follows by construction. An imperative would tell the player to do something the
 * game gives them no way to do, which is the exact failure `CLAUDE.md`'s critical rule is about. The
 * odds render right beside this, which is what keeps the phrasing honest.
 */
function describeStep(c: StepChanges): string {
  const parts: string[] = [];
  if (c.junkDelta < 0) parts.push(`clears ${-c.junkDelta === 1 ? 'a junk mod' : `${-c.junkDelta} junk mods`}`);
  if (c.junkDelta > 0) parts.push(`adds ${c.junkDelta === 1 ? 'a junk mod' : `${c.junkDelta} junk mods`}`);
  if (c.lost.length > 0) parts.push(`loses ${c.lost.join(', ')}`);
  if (c.gained.length > 0) parts.push(`most likely lands ${c.gained.join(', ')}`);
  if (c.blocked.length > 0) parts.push(`blocks ${c.blocked.join(', ')} below tier`);
  return parts.join(' · ');
}

/**
 * The grouping key: everything a box actually shows. Two states sharing it are indistinguishable on
 * screen, so drawing both is pure noise.
 *
 * The START and GOAL are deliberately keyed to themselves. They carry their own outline and wording,
 * and folding "your item" into a ×17 box would misreport where the player is standing.
 */
export function groupKeyOf(nd: EnginePolicyNode, fmtCost: (x: number) => string): string {
  if (nd.isStart) return `start:${nd.key}`;
  if (nd.isGoal) return `goal:${nd.key}`;
  return `${nd.depth}|${stateLabel(nd)}|${nd.action ?? ''}|${fmtCost(nd.expectedCost)}`;
}

export interface NodeGroup { node: EnginePolicyNode; count: number; }

/**
 * Collapse the state list to what is actually distinguishable on screen, ordered furthest-first.
 *
 * Shared by the picture and the screen-reader list on purpose: two copies of this rule would let the
 * two disagree about how many boxes exist. `groupOfKey` maps every original state key to its group so
 * edges can be re-pointed at groups.
 */
export function groupNodes(
  result: EngineMarkovResult, fmtCost: (x: number) => string,
): { groups: NodeGroup[]; groupOfKey: Map<string, string> } {
  const byGroup = new Map<string, NodeGroup>();
  const groupOfKey = new Map<string, string>();
  for (const nd of [...result.nodes].sort((a, b) => b.depth - a.depth || b.expectedCost - a.expectedCost)) {
    const gk = groupKeyOf(nd, fmtCost);
    groupOfKey.set(nd.key, gk);
    const g = byGroup.get(gk);
    if (g) g.count += 1;
    else byGroup.set(gk, { node: nd, count: 1 });
  }
  return { groups: [...byGroup.values()], groupOfKey };
}

/** Progress adjacency between GROUPS: an edge is kept only when it strictly reduces distance-to-goal. */
export function progressEdges(
  result: EngineMarkovResult, groupOfKey: Map<string, string>, depthOf: Map<string, number>,
): { forward: Map<string, Set<string>>; backward: Map<string, Set<string>> } {
  const forward = new Map<string, Set<string>>();
  const backward = new Map<string, Set<string>>();
  const link = (m: Map<string, Set<string>>, a: string, b: string): void => {
    const set = m.get(a);
    if (set) set.add(b);
    else m.set(a, new Set([b]));
  };
  for (const e of result.edges) {
    if (e.prob <= 0.001) continue;
    const a = groupOfKey.get(e.from);
    const b = groupOfKey.get(e.to);
    if (a === undefined || b === undefined || a === b) continue;
    // Progress only. Including bricks would make almost every node reach almost every other — a
    // "highlight" that lights the whole graph is the wall it was meant to cut through. Measured on the
    // reported craft, progress-only leaves a median route of 16 groups out of 80.
    if ((depthOf.get(b) ?? 0) >= (depthOf.get(a) ?? 0)) continue;
    link(forward, a, b);
    link(backward, b, a);
  }
  return { forward, backward };
}

/**
 * Every group on a route through `key`: the ones that can reach it, the ones it can reach, and itself.
 *
 * Terminates without a visited-guard subtlety because both closures walk strictly-decreasing depth, so
 * neither can revisit — the `seen` set here is for work-saving, not for cycle safety.
 */
export function routeThrough(
  key: string, forward: Map<string, Set<string>>, backward: Map<string, Set<string>>,
): Set<string> {
  const route = new Set<string>([key]);
  for (const adj of [forward, backward]) {
    const stack = [key];
    while (stack.length > 0) {
      for (const next of adj.get(stack.pop()!) ?? []) {
        if (route.has(next)) continue;
        route.add(next);
        stack.push(next);
      }
    }
  }
  return route;
}

/**
 * Everything known about one state, for the panel under the graph.
 *
 * A box has room for a label, an action and a cost; this is the rest — which target mods you actually
 * hold, which are stuck below tier, how much junk is left, and what the recommended orb does when you
 * play it. The outcomes come from the REPRESENTATIVE state's own edges, so they are exact for that
 * state; when the box stands for several, the panel says so rather than implying they all behave
 * identically.
 */
const StateDetail: React.FC<{
  group: NodeGroup; result: EngineMarkovResult; fmtCost: (x: number) => string; onClose: () => void;
}> = ({ group, result, fmtCost, onClose }) => {
  const { node, count } = group;
  const byKey = new Map(result.nodes.map((n) => [n.key, n]));
  const outcomes = result.edges
    .filter((e) => e.from === node.key && e.prob > 0.0005 && byKey.has(e.to))
    .map((e) => ({ edge: e, to: byKey.get(e.to)! }))
    .sort((a, b) => b.edge.prob - a.edge.prob);
  const junk = node.junkPrefixes + node.junkSuffixes;

  return (
    <div className="rounded-md border border-primary/40 bg-background p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-semibold">
          {node.isStart ? 'Your item' : node.isGoal ? 'Target reached' : stateLabel(node)}
          {count > 1 && <span className="ml-2 text-xs font-normal text-muted-foreground">one of {count} states that look alike here</span>}
        </h4>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
          Close
        </button>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Target mods held</dt>
        <dd>{node.present.length > 0 ? node.present.join(', ') : <span className="text-muted-foreground">none yet</span>}</dd>
        {node.blocked.length > 0 && (
          <>
            <dt className="text-muted-foreground">Stuck below tier</dt>
            {/* Worth spelling out: the family is occupied by a roll that is too low, so the mod cannot
                be re-rolled onto the item until that roll is annulled off. */}
            <dd>{node.blocked.join(', ')} <span className="text-muted-foreground">— annul before re-adding</span></dd>
          </>
        )}
        <dt className="text-muted-foreground">Junk to clear</dt>
        <dd>
          {junk === 0 ? <span className="text-muted-foreground">none</span>
            : `${junk} (${node.junkPrefixes} prefix, ${node.junkSuffixes} suffix)`}
          {node.desecratedJunk && <span className="text-muted-foreground"> · plus an unwanted desecrated {node.desecratedJunk}, which blocks desecrating again</span>}
        </dd>
        <dt className="text-muted-foreground">Cost to finish</dt>
        <dd className="tabular-nums">{fmtCost(node.expectedCost)}</dd>
        {node.action && (
          <>
            <dt className="text-muted-foreground">Best move</dt>
            <dd className="font-medium text-primary">{node.action}</dd>
          </>
        )}
      </dl>

      {outcomes.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            What <span className="font-medium text-foreground">{node.action}</span> does from here
            {count > 1 && ' (for this one of the states above)'}:
          </p>
          <ul className="space-y-0.5">
            {outcomes.map(({ edge, to }) => (
              <li key={`${edge.from}->${edge.to}`} className="flex items-baseline gap-2 text-xs">
                <span className={`tabular-nums w-12 shrink-0 text-right ${edge.regress ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {pct(edge.prob)}
                </span>
                <span className="flex-1">
                  {describeStep({
                    gained: to.present.filter((x) => !node.present.includes(x)),
                    lost: node.present.filter((x) => !to.present.includes(x)),
                    blocked: to.blocked.filter((x) => !node.blocked.includes(x)),
                    junkDelta: (to.junkPrefixes + to.junkSuffixes) - junk,
                  }) || (to.isGoal ? 'reaches the target' : 'no change')}
                  {edge.regress && <span className="text-amber-600 dark:text-amber-400"> — a step backwards</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FullGraph: React.FC<{ result: EngineMarkovResult; fmtCost: (x: number) => string }> = ({ result, fmtCost }) => {
  // Which box the player clicked, if any — the graph then dims everything not on a route through it.
  const [selected, setSelected] = React.useState<string | null>(null);
  // Collapse first, lay out second — the columns are sized from what gets drawn, not from the state count.
  const { groups, groupOfKey } = groupNodes(result, fmtCost);

  // Column = distance from the goal (higher depth ⇒ further ⇒ further left). Goal (depth 0) is rightmost.
  const depths = [...new Set(groups.map((g) => g.node.depth))].sort((a, b) => b - a);
  const colOf = new Map(depths.map((d, i) => [d, i]));
  const placed: Group[] = [];
  const rowInCol = new Map<number, number>();
  for (const g of groups) {
    const col = colOf.get(g.node.depth)!;
    const row = rowInCol.get(col) ?? 0;
    rowInCol.set(col, row + 1);
    placed.push({ ...g, x: PAD + col * (W + COL_GAP), y: PAD + row * (H + ROW_GAP) });
  }
  const posOf = new Map(placed.map((p) => [groupKeyOf(p.node, fmtCost), p]));
  const width = PAD * 2 + depths.length * W + (depths.length - 1) * COL_GAP;
  const height = PAD * 2 + Math.max(...rowInCol.values()) * (H + ROW_GAP) - ROW_GAP;

  // Clicking a box asks "what runs through here?" — the answer is everything that can reach it plus
  // everything it can reach, along progress edges. Null selection means everything is at full strength,
  // which is the graph as it was.
  const depthOf = new Map(placed.map((p) => [groupKeyOf(p.node, fmtCost), p.node.depth]));
  const { forward, backward } = progressEdges(result, groupOfKey, depthOf);
  const route = selected === null ? null : routeThrough(selected, forward, backward);
  const selectedGroup = selected === null ? null
    : placed.find((g) => groupKeyOf(g.node, fmtCost) === selected) ?? null;
  const onRoute = (k: string): boolean => route === null || route.has(k);
  const DIM = 0.12;

  // Edges aggregate to EXISTENCE, not to a probability: an arrow between two groups means some state
  // in one can reach some state in the other under this action. Their member probabilities differ, so
  // no summed or averaged number may be shown — and none is. Probability drives stroke opacity only,
  // where the max is a display choice rather than a claim.
  const merged = new Map<string, { from: string; to: string; prob: number }>();
  for (const e of result.edges) {
    if (e.prob <= 0.001) continue;
    const from = groupOfKey.get(e.from);
    const to = groupOfKey.get(e.to);
    if (from === undefined || to === undefined || from === to) continue;
    const k = `${from}->${to}`;
    const prev = merged.get(k);
    if (!prev || e.prob > prev.prob) merged.set(k, { from, to, prob: e.prob });
  }

  // Anchor points: forward edges leave the right edge and enter the left edge; back-arrows (regress)
  // leave the top and re-enter the top so they arc above the row rather than cross the boxes.
  const edges = [...merged.values()]
    .filter((e) => posOf.has(e.from) && posOf.has(e.to))
    .map((e) => {
      const a = posOf.get(e.from)!;
      const b = posOf.get(e.to)!;
      const regress = b.node.depth > a.node.depth;
      // An edge stays lit only when BOTH ends are on the route; one end alone would draw a line into
      // the dimmed field and read as a connection that isn't part of what was asked for.
      const lit = onRoute(e.from) && onRoute(e.to);
      const opacity = lit ? Math.max(0.18, Math.min(1, e.prob)) : DIM * 0.6;
      if (regress) {
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
    <div className="rounded-md border border-border bg-muted/20 p-2 space-y-2">
      {/* The click target is a box drawn in SVG, which announces nothing about being interactive.
          Saying so costs one line and is the difference between a feature and a secret. */}
      <p className="px-1 text-[11px] text-muted-foreground" role="status">
        {route === null
          ? 'Click any state to highlight the route through it and dim the rest.'
          : `Highlighting ${route.size} of ${placed.length} states — everything that reaches this one and everything it reaches.`}
        {route !== null && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="ml-2 underline underline-offset-2 hover:text-foreground"
          >
            Clear
          </button>
        )}
      </p>

      {selectedGroup && (
        <StateDetail
          group={selectedGroup}
          result={result}
          fmtCost={fmtCost}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="overflow-x-auto">
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

        {placed.map(({ node, count, x, y }) => {
          // A grouped box stands for several states, so its tooltip names the count and what they
          // share rather than pretending to describe one item. `present`/`blocked` belong to the
          // representative and differ across the group, so they are only listed when it IS one state.
          const tip = count > 1
            ? `${count} states that look identical here — same remaining work, same best action `
              + `(${node.action ?? '—'}), same cost to finish (${fmtCost(node.expectedCost)}). They differ `
              + 'in WHICH mods are present.'
            : `${node.present.length > 0 ? node.present.join(', ') : 'no target mods yet'}`
              + `${node.blocked.length > 0 ? ` · off-tier: ${node.blocked.join(', ')}` : ''}`
              + `${node.junkPrefixes + node.junkSuffixes > 0 ? ` · ${node.junkPrefixes + node.junkSuffixes} junk` : ''}`
              + `${node.desecratedJunk ? ` · unwanted desecrated ${node.desecratedJunk}` : ''}`
              + ` · E ${fmtCost(node.expectedCost)}${node.action ? ` · ${node.action}` : ''}`;
          const gk = groupKeyOf(node, fmtCost);
          const isSelected = gk === selected;
          const boxClass = node.isGoal ? 'fill-emerald-500/15 stroke-emerald-500'
            : node.isStart ? 'fill-background stroke-primary' : 'fill-background stroke-border';
          return (
            <g
              key={node.key}
              // Focusable and operable, because a click-only affordance drawn in SVG is invisible to
              // the keyboard: an <svg> child gets no tab stop and no Enter/Space handling for free.
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${stateLabel(node)}${count > 1 ? `, ${count} states` : ''}, ${node.action ?? 'target'}`
                + `. Highlight the route through this state.`}
              className="cursor-pointer focus:outline-none"
              opacity={onRoute(gk) ? 1 : DIM}
              onClick={() => setSelected(isSelected ? null : gk)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(isSelected ? null : gk); }
                if (e.key === 'Escape') setSelected(null);
              }}
            >
              <title>{tip}</title>
              <rect
                x={x} y={y} width={W} height={H} rx={7}
                className={isSelected ? 'fill-primary/10 stroke-primary' : boxClass}
                strokeWidth={isSelected ? 3 : node.isStart || node.isGoal ? 2 : 1}
              />
              {node.isGoal ? (
                <text x={x + W / 2} y={y + H / 2 + 4} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[12px] font-semibold">✓ target</text>
              ) : (
                <>
                  <text x={x + 9} y={y + 18} className="fill-foreground text-[11px] font-medium">{stateLabel(node)}</text>
                  {count > 1 && (
                    <text x={x + W - 9} y={y + 18} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">×{count}</text>
                  )}
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
  // One grouping, used by BOTH the picture and the screen-reader list below — two copies of this rule
  // would let the visual and the text disagree about how many boxes there are.
  const grouped = groupNodes(result, fmtCost).groups;
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
                {describeStep(s.changes) || `${s.node.isStart ? 'your item' : stateLabel(s.node)} → ${stateLabel(s.next)}`}
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
                  {`${s.action}. `}
                  {describeStep(s.changes) ? `${describeStep(s.changes)}. ` : ''}
                  {`${pct(s.advance)} chance this moves you onward`}
                  {s.brick > 0 ? `, ${pct(s.brick)} chance of going backwards` : ''}
                  {`. Expected cost from here ${fmtCost(s.node.expectedCost)}.`}
                </li>
              ))}
            </ol>
          </>
        )}
        <p>
          All {result.nodes.length} item state{result.nodes.length === 1 ? '' : 's'} the policy can
          reach, ordered from your item to the target, grouped into {grouped.length} that differ on
          screen.
        </p>
        {/* Grouped exactly as the picture is, so this stops being a 262-item read-aloud of the same
            sentence — and so the two presentations cannot drift apart. */}
        <ol>
          {grouped.map(({ node: nd, count }) => (
            <li key={nd.key}>
              {nd.isStart ? 'Your item: ' : nd.isGoal ? 'Target reached: ' : ''}
              {stateLabel(nd)}
              {count > 1 ? ` (${count} states like this)` : ''}
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
