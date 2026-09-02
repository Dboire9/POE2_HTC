import React from 'react';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engine';
import { formatIn, pickUnit, type Rates } from '../../lib/currency';
import { mainLine, type StepChanges } from '../../lib/policyPath';
import { cn } from '../../lib/utils';

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

// 176, not the 148 this was: measured in Chromium on a 2-target policy (17 boxes), the narrower box
// cut 8 of 17 ACTION names — `Annul (Om…`, `Desecrate…` — where the omen is the instruction. 176 is
// the knee: it shows every action on that craft in full and nearly halves total truncation (20 → 11
// clipped labels); 190 buys one more label and 204 buys nothing. Longer actions exist
// (`Desecrate (Omen of the Sovereign, Dextral)`), so the ellipsis is still the safety net — this only
// moves where it starts.
const W = 176; // node width
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
  // Rarity leads on a from-white craft, where the item climbs Normal → Magic → Rare and the same mod
  // count means completely different things on each rung — a 2-mod Magic item cannot take an Exalt at
  // all. Omitted on a Rare, which is every from-item craft and would otherwise repeat "Rare" on every
  // box for no information.
  const parts = nd.rarity === 'rare' ? [] : [nd.rarity === 'normal' ? 'white base' : 'magic'];
  parts.push(`${kept} mod${kept === 1 ? '' : 's'}`);
  if (nd.blocked.length > 0) parts.push(`${nd.blocked.length} off-tier`);
  if (junk > 0) parts.push(`+${junk} junk`);
  // The mod a Desecration placed, called out wherever it landed: it blocks desecrating again until it
  // is removed, which is what makes this state different from an otherwise identical one. A flagged
  // JUNK mod is already inside the junk count above — the note says it is marked, not that it is extra.
  if (nd.desecratedJunk) parts.push('1 junk desecrated');
  else if (nd.desecratedTarget) parts.push('desecrated');
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

/**
 * Coverage levels the reader can step through, as a share of expected visits. Not a toggle: the
 * question "is this everything?" deserves a scale, and the widest rung really is everything.
 */
export const COVERAGE_STEPS = [0.9, 0.99, 1] as const;
export type Coverage = (typeof COVERAGE_STEPS)[number];

export interface Pruned {
  readonly result: EngineMarkovResult;
  /** States drawn, and states the solver actually produced — the UI must state both. */
  readonly shown: number;
  readonly total: number;
  /** Share of expected visits the drawn states carry, for the caption. */
  readonly covered: number;
}

/**
 * Draw the states a player will actually meet, not every state the solver can reach.
 *
 * The policy closure is COMBINATORIAL — every subset of "which targets have landed" is a state — so
 * it grows as 2^n and the busiest column is the widest binomial. Measured on a 5-target craft before
 * this existed: 217 states, 12 columns, 42 rows in one column, a 2732x3202px canvas. No layout beats
 * that; smaller boxes and zoom just make the same picture illegible in a different way. The only
 * thing that works is drawing less.
 *
 * `visitRate` is what makes "less" principled rather than arbitrary: on that same craft 12 states
 * carry 90% of the visits and the tail sits at 5e-5 — states you enter once in twenty thousand
 * attempts, drawn at the same size and weight as the ones you enter every time.
 *
 * Three things are ALWAYS kept regardless of their rate:
 *  - the start, or the picture has no "you are here";
 *  - the goal, since `PolicyGraph` separately refuses to draw a graph that cannot reach it, and a
 *    pruned view must not manufacture that failure;
 *  - everything the reader has selected, so clicking a rare state does not erase it.
 */
export function pruneToCoverage(
  result: EngineMarkovResult, coverage: Coverage, keepKeys: ReadonlySet<string> = new Set(),
): Pruned {
  const total = result.nodes.length;
  const mass = result.nodes.reduce((acc, n) => acc + n.visitRate, 0);
  if (coverage >= 1 || mass <= 0) return { result, shown: total, total, covered: 1 };

  const keep = new Set<string>(keepKeys);
  for (const n of result.nodes) if (n.isStart || n.isGoal) keep.add(n.key);

  let acc = 0;
  for (const n of [...result.nodes].sort((a, b) => b.visitRate - a.visitRate)) {
    if (acc >= coverage * mass) break;
    keep.add(n.key);
    acc += n.visitRate;
  }
  // Covered is recomputed over what is KEPT, not accumulated above: the always-keep states contribute
  // their own mass too, so the loop's running total understates what the reader is actually seeing.
  const nodes = result.nodes.filter((n) => keep.has(n.key));
  const covered = nodes.reduce((a, n) => a + n.visitRate, 0) / mass;
  return {
    // An edge to a state that is no longer drawn must go too, or the arrow points at nothing.
    result: { ...result, nodes, edges: result.edges.filter((e) => keep.has(e.from) && keep.has(e.to)) },
    shown: nodes.length, total, covered,
  };
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
          {node.desecratedJunk && <span className="text-muted-foreground"> · one of them was placed by a Desecration, which blocks desecrating again until it goes</span>}
        </dd>
        {node.desecratedTarget !== undefined && (
          <>
            <dt className="text-muted-foreground">Placed by a Desecration</dt>
            <dd>
              {node.desecratedTarget}
              <span className="text-muted-foreground"> · a mod you wanted, but while it is here the item
                can’t be desecrated again</span>
            </dd>
          </>
        )}
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
                  {/* Landing back on the START is "you threw the item away", not a mod diff. Read as
                      changes it comes out as "clears a junk mod · loses <every target you held>",
                      which leads on the least important thing that happened. Described by identity
                      instead — the same treatment the goal already gets on the next line. */}
                  {to.isStart ? 'back to the base you started from, nothing on it'
                    : describeStep({
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

const FullGraph: React.FC<{ result: EngineMarkovResult; fmtCost: (x: number) => string }> = ({ result: full, fmtCost }) => {
  // Which box the player clicked, if any — the graph then dims everything not on a route through it.
  const [selected, setSelected] = React.useState<string | null>(null);
  // How much of the graph to draw, as a share of expected visits. Prune FIRST: grouping and layout are
  // both sized from what survives, so widening re-lays-out rather than re-scaling a fixed canvas.
  const [coverage, setCoverage] = React.useState<Coverage>(COVERAGE_STEPS[0]);
  // Pin the selected group's states in even if their own rate falls below the cut — narrowing the view
  // must not delete the thing the reader just clicked out from under them. Grouped against the FULL
  // result, because the group being selected is defined over every state, not the surviving ones.
  const pinned = React.useMemo(() => {
    const out = new Set<string>();
    if (selected === null) return out;
    for (const [key, gk] of groupNodes(full, fmtCost).groupOfKey) if (gk === selected) out.add(key);
    return out;
  }, [full, fmtCost, selected]);
  const pruned = pruneToCoverage(full, coverage, pinned);
  const result = pruned.result;
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
  // A state whose best move is "start over" has NO progress edge — binning the item is by definition
  // not progress — so the closure above leaves it drawn as a dead end, connected to nothing, while the
  // panel right beside it describes exactly that move. Reported from the live app, where on a craft
  // with a free base "start over" is the advice on most of the graph.
  //
  // So the selected state's own outcomes join the route, and ONLY those: their closures deliberately
  // stay out, because the base you start over from reaches the whole graph, and a highlight that lights
  // everything is the wall this view exists to cut through. Same edges and same threshold the panel
  // lists, read off the same representative state, so the arrows and the panel cannot disagree.
  if (route !== null && selectedGroup !== null) {
    for (const e of result.edges) {
      if (e.from !== selectedGroup.node.key || e.prob <= 0.0005) continue;
      const g = groupOfKey.get(e.to);
      if (g !== undefined) route.add(g);
    }
  }
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
          Saying so costs one line and is the difference between a feature and a secret.

          Three separate elements, and the split is the point. The live region is only the sentence
          that CHANGES when you pick a state: it is mounted from the start (a region added at the same
          moment as its text is missed by some readers) and empty until there is something to say. The
          standing instruction is not in it — a live region holding boilerplate re-announces the same
          line and competes with the "Last solve took Xs" status on the Item tab for the same queue.
          And `Clear` is a control, so it sits outside the region rather than being read out as part
          of it. */}
      <div className="flex flex-wrap items-baseline gap-x-2 px-1 text-[11px] text-muted-foreground">
        <p role="status">
          {route === null
            ? ''
            : `Highlighting ${route.size} of ${placed.length} states — everything that reaches this one and everything it reaches.`}
        </p>
        {route === null && <p>Click any state to highlight the route through it and dim the rest.</p>}
        {/* Hiding must be SAID, not done quietly — the app's standing rule is that it announces where
            it stopped. The count names both numbers and the share of visits kept, so "12 of 86" reads
            as a deliberate cut rather than a graph that lost most of itself. */}
        {pruned.shown < pruned.total && (
          <p>
            Showing <strong className="font-medium text-foreground">{pruned.shown}</strong> of {pruned.total} states
            {' '}— {(pruned.covered * 100).toFixed(pruned.covered > 0.999 ? 2 : 1)}% of what a craft actually runs into.
          </p>
        )}
        {route !== null && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {pruned.total > pruned.shown || coverage !== COVERAGE_STEPS[0] ? (
        <div className="flex flex-wrap items-center gap-2 px-1 text-[11px]">
          <span className="text-muted-foreground">Detail</span>
          {COVERAGE_STEPS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={coverage === c}
              onClick={() => setCoverage(c)}
              className={cn(
                'rounded border px-2 py-0.5 transition-colors',
                coverage === c
                  ? 'border-primary/60 bg-primary/20 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {c >= 1 ? `Every state (${pruned.total})` : `${c * 100}% of outcomes`}
            </button>
          ))}
        </div>
      ) : null}

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
              + `${node.desecratedJunk ? ` · a junk ${node.desecratedJunk} was placed by a Desecration` : ''}`
              + `${node.desecratedTarget ? ` · ${node.desecratedTarget} was placed by a Desecration` : ''}`
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
                // HTML in a <foreignObject>, not SVG <text>. SVG text neither wraps nor truncates, so
                // each row's left string ran straight under the number pinned to the box's right edge
                // and the two drew on top of each other — `5 mods · 1 off-tier · desecrated` over `×3`,
                // `Desecrate (Omen of the Sovereign)` over `2,934 chaos`. Widening the box only moves
                // the threshold: both strings are open-ended (a state label carries up to five clauses,
                // an action names an orb plus two omens). A flex row is the arrangement that fits any
                // input — the number keeps its width, the label gives up its own and ends in a real
                // ellipsis, measured by the browser in the actual font instead of guessed from a
                // character count. Nothing is lost to the truncation: the <title> above carries the
                // full state, and clicking the box opens the detail panel.
                <foreignObject x={x + 1} y={y + 1} width={W - 2} height={H - 2}>
                  <div className="flex h-full flex-col justify-center gap-1 px-2 leading-tight">
                    <div className="flex items-baseline gap-1.5">
                      <span className="min-w-0 truncate text-[11px] font-medium text-foreground">{stateLabel(node)}</span>
                      {count > 1 && (
                        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">×{count}</span>
                      )}
                      {/* The cost sits with the STATE, not with the action, and that is a reading fix as
                          much as a layout one: it is what finishing from here costs, never the price of
                          the orb named below — which is exactly how a number pinned beside `Annul` gets
                          read. Moving it also hands the action row the box's full width, and the action
                          is the half a player acts on: `Annul (Om…` and `Desecrate…` were the two
                          strings being cut, out of a vocabulary where the omen IS the instruction. */}
                      <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">{fmtCost(node.expectedCost)}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="min-w-0 truncate text-[11px] font-semibold text-primary">{node.action}</span>
                    </div>
                    {node.isStart && <span className="text-[9px] uppercase tracking-wider text-primary">start</span>}
                  </div>
                </foreignObject>
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
