// The route through the policy graph, as opposed to the whole graph.
//
// `markovFromItem` returns every state reachable under the optimal policy — a BFS closure with no cap.
// On a five-target craft that is 262 squares, most of them sharing a label ("1 mod · 1 blocked · +1
// junk" occurs a dozen times over) and, because their expected costs sit within a fraction of a
// percent of each other, all rounding to the same displayed figure. The picture is honest and
// unreadable: it answers "what states exist?" when the question is "what do I do?".
//
// This walks the one line most SUCCESSFUL crafts follow: from the start, keep taking the outcome that
// carries the most of the crafts that go on to finish. Everything else — the bricks, the recoveries —
// is summarised per step as the risk of NOT getting it, which is the part worth knowing at that moment.
//
// Pure and free of React so it can be unit-tested without jsdom (same reasoning as currency.ts).

import type { EngineMarkovResult, EnginePolicyEdge, EnginePolicyNode, PolicyMod } from './engineTypes.ts';

export interface MainLineStep {
  /** The state you are in when you take this action. */
  readonly node: EnginePolicyNode;
  /** Human label of the currency the policy plays here, e.g. "Exalt (Dextral, Perfect)". */
  readonly action: string;
  /** The outcome this step is played FOR, and its probability. */
  readonly next: EnginePolicyNode;
  readonly advance: number;
  /**
   * Total probability of an OTHER outcome that moves you further from the goal — the brick risk. The
   * line's own outcome is never counted, though on a craft that fishes it can add junk too. Note
   * `advance + lands + repeats + brick` need not reach 1: the remainder is a different state no
   * further away (a slam landing a target you wanted, just not the one this line follows).
   */
  readonly brick: number;
  /** What this step moves, as the difference between `node` and `next`. See `StepChanges`. */
  readonly changes: StepChanges;
  /** The chance this step finishes the item outright, when the line itself goes on elsewhere. */
  readonly lands: number;
  /** The chance this step changes nothing — the policy then plays it again. */
  readonly repeats: number;
}

/**
 * What a step actually does to the item, recovered by diffing the two states it joins.
 *
 * IMPORTANT for anything that renders this: these are the mods on the step's **likeliest outcome**,
 * not mods the player selects. An Exalt is a slam — the policy chooses the orb, never the result. The
 * mod named here is simply whatever sits on the highest-probability edge, which is the edge the main
 * line follows by construction. Copy must therefore read "most likely lands X", never "add X"; the
 * step's own `advance` percentage is what makes that phrasing honest.
 */
export interface StepChanges {
  /** Target mods present after this step that weren't before. */
  readonly gained: readonly string[];
  /** Target mods lost — a Chaos or a Perfect Essence can take one back off. */
  readonly lost: readonly string[];
  /** Targets whose family this step fills with a below-tier roll, blocking them until annulled. */
  readonly blocked: readonly string[];
  /**
   * Change in the junk count on each side: negative clears junk, positive adds it. Per side, because a
   * Chaos that swaps a junk suffix for a junk prefix leaves the TOTAL alone — summed, that read as "no
   * change" beside the roll that really changed nothing. Zero into the goal: see `changesBetween`.
   */
  readonly junk: JunkChange;
  /**
   * A step into the goal whose finished items differ in where the junk sits — a Regal finishing a
   * tablet puts its new modifier on either side: each, as a change from here, with its share of the
   * step. Absent when there is one way to finish; `junk` then says it.
   */
  readonly finishes?: readonly { readonly junk: JunkChange; readonly share: number }[];
}

export interface JunkChange { readonly prefixes: number; readonly suffixes: number }

/**
 * `a` minus `b`, by TEXT.
 *
 * Positions carry a side and a tier now, and comparing whole objects would make two spellings of the
 * same position — one mapped with a tier, one without — read as a mod gained and a mod lost. The text
 * is what identifies a position to a reader and it is what these lists hold, so it is what the
 * difference is taken on. De-duplicated by construction on both sides.
 */
const without = (a: readonly PolicyMod[], b: readonly PolicyMod[]): string[] => {
  const seen = new Set(b.map((p) => p.text));
  return a.filter((p) => !seen.has(p.text)).map((p) => p.text);
};

/**
 * What one step changes, between two states of the same policy.
 *
 * Exported because the GRAPH asks the same question when it describes an edge, and used to ask it with
 * its own copy of this expression. Two copies of a diff are two chances to disagree about what a step
 * did — and they nearly did, the moment a position stopped being a bare string.
 */
export function changesBetween(node: EnginePolicyNode, next: EnginePolicyNode, edge?: EnginePolicyEdge): StepChanges {
  const from = (jp: number, js: number): JunkChange => ({ prefixes: jp - node.junkPrefixes, suffixes: js - node.junkSuffixes });
  // Every finished state is drawn as ONE goal, the clean one (`routeFrom`'s fold), so its junk counts
  // say nothing about the item a step finishes on — which keeps whatever junk the spare slots allow.
  // Compared against them, a Chaos that swaps one junk suffix for the target read "clears 2 junk
  // mods" (Dorian, 2026-09-23: "It only rerolls one mod"). The edge says what it really finishes on.
  const fin = next.isGoal ? edge?.finishes : undefined;
  const total = fin?.reduce((a, f) => a + f.prob, 0) ?? 0;
  return {
    gained: without(next.present, node.present),
    lost: without(node.present, next.present),
    blocked: without(next.blocked, node.blocked),
    // No `finishes` on a goal edge means every item it finishes on is clean — which the goal box is.
    junk: fin?.[0] ? from(fin[0].junkPrefixes, fin[0].junkSuffixes) : from(next.junkPrefixes, next.junkSuffixes),
    ...(fin && fin.length > 1
      ? { finishes: fin.map((f) => ({ junk: from(f.junkPrefixes, f.junkSuffixes), share: f.prob / total })) }
      : {}),
  };
}

export interface MainLine {
  readonly steps: readonly MainLineStep[];
  /** The goal state, present only when the walk actually arrived. */
  readonly goal?: EnginePolicyNode;
}

/**
 * The route from the start state to the goal: the way most crafts that finish go.
 *
 * On a craft that can START OVER, each state's outcomes are tried by how much of the finishing crafts
 * they carry: probability times the chance of finishing from where they land without starting over
 * (`toGoal`). It used to take only the likeliest outcome that moved strictly CLOSER, and on a craft
 * that fishes — a fresh tablet per try, a Chaos while the item is stuck — the one such outcome from the
 * start is the rare roll that lands the target at once, so the line read "Transmute (0.3%) → Regal →
 * ✓" beside a plan that plays Chaos 28 times a craft (Dorian, 2026-09-23: "we say fresh tablets +
 * chaos, but there we only have trans and regal"). Weighted by success, it reads Transmute → Regal →
 * Chaos, which is where the crafts that finish come from.
 *
 * On an item you HOLD nothing can fail — every state finishes eventually — so that weighting is just
 * probability and the line wandered through 13 likeliest-but-sideways rolls. There it keeps to the
 * likeliest outcome that moves strictly closer and can still finish by doing so, as it always did.
 *
 * Either way a state is entered once and a dead end gives way to the next best outcome, so the walk
 * ends: at the goal, or — with no way through — with no steps, and the caller shows the full graph
 * instead of a line that stops mid-air.
 */
export function mainLine(result: EngineMarkovResult): MainLine {
  const byKey = new Map(result.nodes.map((n) => [n.key, n]));
  const start = result.nodes.find((n) => n.isStart);
  const goalNode = result.nodes.find((n) => n.isGoal);
  if (!start || !goalNode) return { steps: [] };

  // Group edges by source once: the walk is short but the edge list is not (thousands on a big craft).
  const out = new Map<string, EnginePolicyEdge[]>();
  for (const e of result.edges) {
    const list = out.get(e.from);
    if (list) list.push(e);
    else out.set(e.from, [e]);
  }
  const canStartOver = start.rarity === 'normal' || result.nodes.some((n) => n.isRestart === true);
  const worth = canStartOver ? successWeight(result, byKey, out, start) : closerWeight(result, byKey, goalNode);

  // Depth-first from the start, each state's outcomes tried best first, a state entered at most once
  // — so a branch that only leads back where the line has been gives way to the next best rather than
  // stalling the line, and the search stays linear in the graph.
  const choices = (n: EnginePolicyNode): { edge: EnginePolicyEdge; to: EnginePolicyNode; w: number }[] =>
    (out.get(n.key) ?? [])
      .map((edge) => ({ edge, to: byKey.get(edge.to)!, w: 0 }))
      .filter((c) => c.to && c.to.key !== n.key && !isRestart(c.to, start))
      .map((c) => ({ ...c, w: worth(n, c.edge, c.to) }))
      .filter((c) => c.w > 0)
      .sort((a, b) => b.w - a.w);
  const entered = new Set<string>([start.key]);
  const path: { node: EnginePolicyNode; options: { edge: EnginePolicyEdge; to: EnginePolicyNode }[]; tried: number }[] =
    [{ node: start, options: choices(start), tried: 0 }];
  while (path.length > 0 && !path[path.length - 1]!.node.isGoal) {
    const top = path[path.length - 1]!;
    const next = top.options[top.tried++];
    if (!next) { path.pop(); continue; } // nothing left from here: back up
    if (next.to.isGoal) { path.push({ node: next.to, options: [], tried: 0 }); continue; }
    if (entered.has(next.to.key)) continue;
    entered.add(next.to.key);
    path.push({ node: next.to, options: choices(next.to), tried: 0 });
  }
  if (path.length === 0) return { steps: [] }; // no way through — let the caller fall back to the full graph

  const steps: MainLineStep[] = [];
  for (let k = 0; k + 1 < path.length; k++) {
    const node = path[k]!.node;
    const chosen = path[k]!.options[path[k]!.tried - 1]!;
    let lands = 0;
    let repeats = 0;
    let brick = 0;
    for (const e of out.get(node.key) ?? []) {
      const to = byKey.get(e.to);
      if (!to) continue;
      if (to.isGoal) lands += e.prob;
      else if (to.key === node.key) repeats += e.prob;
      else if (e !== chosen.edge && to.depth > node.depth) brick += e.prob;
    }
    steps.push({
      node, action: node.action ?? chosen.edge.action, next: chosen.to, advance: chosen.edge.prob, brick,
      changes: changesBetween(node, chosen.to, chosen.edge),
      lands: chosen.to.isGoal ? 0 : lands, repeats,
    });
  }
  return { steps, goal: path[path.length - 1]!.node };
}

/** How much an outcome is worth following: from `node` along `edge` to `to`; 0 to never follow it. */
type Worth = (node: EnginePolicyNode, edge: EnginePolicyEdge, to: EnginePolicyNode) => number;

/** A craft that can start over: the finishing crafts an outcome carries (`toGoal`). */
function successWeight(
  result: EngineMarkovResult, byKey: ReadonlyMap<string, EnginePolicyNode>,
  out: ReadonlyMap<string, readonly EnginePolicyEdge[]>, start: EnginePolicyNode,
): Worth {
  const g = toGoal(result, byKey, out, start);
  return (_node, edge, to) => edge.prob * (g.get(to.key) ?? 0);
}

/**
 * An item you hold: the likeliest outcome that moves strictly closer AND from which the goal can still
 * be reached by moving closer. Without the second half the walk followed the likeliest closer outcome
 * into a state whose own best move is to go BACKWARDS and stalled, and the route disappeared.
 */
function closerWeight(result: EngineMarkovResult, byKey: ReadonlyMap<string, EnginePolicyNode>, goal: EnginePolicyNode): Worth {
  const canFinish = new Set<string>([goal.key]);
  for (let grew = true; grew;) {
    grew = false;
    for (const e of result.edges) {
      if (canFinish.has(e.from) || !canFinish.has(e.to)) continue;
      const from = byKey.get(e.from);
      const to = byKey.get(e.to);
      if (!from || !to || to.depth >= from.depth) continue;
      canFinish.add(e.from);
      grew = true;
    }
  }
  return (node, edge, to) => (to.depth < node.depth && canFinish.has(to.key) ? edge.prob : 0);
}

/** A fresh base: the restart node, or — on a craft from a white base — a step back onto that base. */
const isRestart = (n: EnginePolicyNode, start: EnginePolicyNode): boolean =>
  n.isRestart === true || (n.key === start.key && start.rarity === 'normal');

/**
 * The chance of finishing from each state without starting over: `g(goal) = 1`, `g(s) = Σ P(s→t)·g(t)`
 * over the outcomes that do not start over, a self-loop divided out. Gauss-Seidel, to 1e-12 or 1,000
 * sweeps — it only chooses between outcomes, and a route's chain is short.
 */
function toGoal(
  result: EngineMarkovResult, byKey: ReadonlyMap<string, EnginePolicyNode>,
  out: ReadonlyMap<string, readonly EnginePolicyEdge[]>, start: EnginePolicyNode,
): Map<string, number> {
  const g = new Map<string, number>(result.nodes.map((n) => [n.key, n.isGoal ? 1 : 0]));
  for (let sweep = 0; sweep < 1000; sweep++) {
    let delta = 0;
    for (const n of result.nodes) {
      if (n.isGoal) continue;
      let self = 0;
      let acc = 0;
      for (const e of out.get(n.key) ?? []) {
        const to = byKey.get(e.to);
        if (!to || isRestart(to, start)) continue;
        if (to.key === n.key) self += e.prob;
        else acc += e.prob * g.get(to.key)!;
      }
      const next = self < 1 ? acc / (1 - self) : 0;
      delta = Math.max(delta, Math.abs(next - g.get(n.key)!));
      g.set(n.key, next);
    }
    if (delta < 1e-12) break;
  }
  return g;
}
