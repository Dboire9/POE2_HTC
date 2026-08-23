// The route through the policy graph, as opposed to the whole graph.
//
// `markovFromItem` returns every state reachable under the optimal policy — a BFS closure with no cap.
// On a five-target craft that is 262 squares, most of them sharing a label ("1 mod · 1 off-tier · +1
// junk" occurs a dozen times over) and, because their expected costs sit within a fraction of a
// percent of each other, all rounding to the same displayed figure. The picture is honest and
// unreadable: it answers "what states exist?" when the question is "what do I do?".
//
// This walks the one line a player actually follows: from the start, keep taking the outcome the
// policy is playing for. Everything else — the bricks, the recoveries — is summarised per step as the
// risk of NOT getting it, which is the part worth knowing at that moment.
//
// Pure and free of React so it can be unit-tested without jsdom (same reasoning as currency.ts).

import type { EngineMarkovResult, EnginePolicyEdge, EnginePolicyNode } from './engineTypes.ts';

export interface MainLineStep {
  /** The state you are in when you take this action. */
  readonly node: EnginePolicyNode;
  /** Human label of the currency the policy plays here, e.g. "Exalt (Dextral, Perfect)". */
  readonly action: string;
  /** The outcome this step is played FOR, and its probability. */
  readonly next: EnginePolicyNode;
  readonly advance: number;
  /**
   * Total probability of an outcome that moves you further from the goal — the brick risk. Note
   * `advance + brick` need not reach 1: the remainder is progress to a DIFFERENT state that is also
   * closer (a slam landing a target you wanted, just not the one this line follows), which is neither
   * a setback nor the step's intended outcome.
   */
  readonly brick: number;
}

export interface MainLine {
  readonly steps: readonly MainLineStep[];
  /** The goal state, present only when the walk actually arrived. */
  readonly goal?: EnginePolicyNode;
}

/**
 * The principal route from the start state to the goal.
 *
 * At each state, take the highest-probability edge to a state of strictly smaller `depth`. Strict
 * decrease is what makes this terminate with no cycle guard and no length cap: `depth` is a
 * non-negative integer (missing targets + off-tier blocks + junk, see `mapMarkov`), so the walk can
 * take at most `depth(start)` steps.
 *
 * Returns no steps when the graph has no start, or when the walk stalls in a state with no forward
 * edge — the caller then shows the full graph rather than a line that stops mid-air. A stall is
 * possible in principle (the policy may play an action whose only listed outcomes hold or lose
 * ground, with the true progress edge pruned by the `prob > 0` filter upstream), so it is handled
 * rather than asserted away.
 */
export function mainLine(result: EngineMarkovResult): MainLine {
  const byKey = new Map(result.nodes.map((n) => [n.key, n]));
  const start = result.nodes.find((n) => n.isStart);
  if (!start) return { steps: [] };

  // Group edges by source once: the walk is short but the edge list is not (thousands on a big craft).
  const out = new Map<string, EnginePolicyEdge[]>();
  for (const e of result.edges) {
    const list = out.get(e.from);
    if (list) list.push(e);
    else out.set(e.from, [e]);
  }

  const steps: MainLineStep[] = [];
  let node = start;
  while (!node.isGoal) {
    const edges = out.get(node.key) ?? [];
    let best: { edge: EnginePolicyEdge; to: EnginePolicyNode } | undefined;
    let brick = 0;
    for (const e of edges) {
      const to = byKey.get(e.to);
      if (!to) continue;
      if (to.depth > node.depth) brick += e.prob;
      if (to.depth >= node.depth) continue; // only a strictly closer state can advance the line
      if (!best || e.prob > best.edge.prob) best = { edge: e, to };
    }
    if (!best) return { steps: [] }; // stalled — let the caller fall back to the full graph
    steps.push({ node, action: node.action ?? best.edge.action, next: best.to, advance: best.edge.prob, brick });
    node = best.to;
  }
  return { steps, goal: node };
}
