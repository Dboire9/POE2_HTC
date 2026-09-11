// The solved policy as plain data, and the walk that turns it into the graph a player reads.
//
// markovFromItem.ts solves the lattice; this file is what happens afterwards. The solve ends with one
// pass that settles, for EVERY state, which action the policy plays, what that costs and where it
// lands (`RouteTable`). The graph is then a walk over that table from a chosen root (`routeFrom`) —
// the craft's own start for the result every tab shows, and any other state when the Lab is asked
// what finishing costs from an item you could buy instead.
//
// Plain data on purpose: the table rides the solve result across the worker boundary, which is a
// structured clone. Typed arrays and strings survive that; a closure over the solver's state would
// not, and keeping the solver alive in the worker instead would tie a route on screen to a worker
// that any later Cancel terminates. See `RouteTable`.

import type { McAction } from './markovActions.ts';
import type { McRarity, McState, StateKey } from './markovState.ts';
import {
  FLAG_JUNK_PREFIX, FLAG_JUNK_SUFFIX, decodeState, flaggedTarget, has, popcount, slotsFilled,
} from './markovState.ts';

export interface PolicyNode {
  readonly key: string;
  /**
   * One entry per FILLED POSITION, holding the interchangeable mod ids that could be filling it.
   *
   * A group of ids rather than one, because a position may be several same-family alternatives merged
   * into one bit — the state records that the position is filled, and cannot say which member did it,
   * because nothing downstream depends on the answer. One id per entry for every craft without
   * alternatives. The UI joins each group with "or" (`mapMarkov`); the LENGTH is still the number of
   * target mods on the item, which is what the graph's box label counts.
   */
  readonly present: readonly (readonly string[])[];
  /** Positions whose family is occupied by a below-tier ("off-tier") roll — must be annulled first. */
  readonly blocked: readonly (readonly string[])[];
  readonly junkPrefixes: number;
  readonly junkSuffixes: number;
  /** Set when the mod a Desecration placed is JUNK, naming the side it sits on. It blocks
   *  re-desecrating until it is removed. */
  readonly desecratedJunk?: 'prefix' | 'suffix';
  /** Set when the mod a Desecration placed is one of the TARGETS — that position's mod ids. Blocks
   *  re-desecrating just the same, which is why keeping it can cost more than it looks. */
  readonly desecratedTarget?: readonly string[];
  /** The root the route was walked from: the craft's own start, or the item a Lab row proposes buying. */
  readonly isStart: boolean;
  readonly isGoal: boolean;
  /**
   * The white base a route from a BOUGHT item falls back to when the policy starts over — drawn as the
   * end of that route, never walked, because what happens after it is the from-scratch plan the Lab
   * already shows. Only ever set on a route whose root is not the craft's own start.
   */
  readonly isRestart?: true;
  /** Minimum expected cost to reach the target from here. */
  readonly expectedCost: number;
  /** The optimal currency to use here (undefined at the goal). */
  readonly action?: McAction;
  /**
   * What playing `action` once costs here, ON AVERAGE: its price, plus — for a Desecration carrying an
   * Omen of Abyssal Echoes — the omen times the chance this policy rerolls, since the omen is spent only
   * then. The action's plain price for everything else; undefined at the goal.
   */
  readonly actionCost?: number;
  /** The item's rarity here. Without it a 2-mod Magic item and a 2-mod Rare item render identically
   *  while behaving completely differently — one of them cannot take an Exalt at all. */
  readonly rarity: McRarity;
  /**
   * How much this state matters to a run that SUCCEEDS — expected visits per successful attempt.
   *
   * This is what decides which states the graph draws, and the obvious metric is the wrong one. Plain
   * visit frequency ranks the FAILURES first: on a craft with a free base ~98% of states choose
   * "start over", so they are entered constantly while every one of them shows the same action and
   * the same cost (they all share V(start)). A real 6-target T2 craft drew ten boxes at 90% coverage
   * and nine read "Start over with a new base · 2,132 div" — statistically faithful and useless. The
   * spine a player needs sat below 99%.
   *
   * So it is weighted by the probability of reaching the goal from here. A state whose best move is
   * to restart has no route onward and drops out; what is left is the path the craft actually takes.
   * Restart edges are still DRAWN from the states that survive — they are the back-arrows, and how
   * often a step throws you back is precisely what the reader needs to see.
   *
   * Expected VISITS, not a probability: one attempt can pass through the same state twice, so this
   * can exceed 1. Ranking, not odds.
   */
  readonly visitRate: number;
  /**
   * Moves still to make, by the same estimate `regress` is judged against.
   *
   * Carried rather than recomputed by the UI: engineMap had its own copy of this expression, and the
   * moment rarity entered the formula the two disagreed — a state the solver called a step forward
   * would have been drawn as a step back.
   */
  readonly depth: number;
}

export interface PolicyEdge {
  readonly from: string;
  readonly to: string;
  readonly action: McAction;
  readonly prob: number;
  /** True when this outcome moves AWAY from the target (a "brick" — the back-arrow in the graph). */
  readonly regress: boolean;
}

/**
 * The optimal policy over the WHOLE lattice, as plain data.
 *
 * Built by the solver in one pass once V has settled, and the only thing the graph is ever drawn from —
 * the craft's own route included — so a route from any state and the route every tab shows cannot
 * disagree about what the policy does.
 *
 * Everything here survives a structured clone, which is the point: a from-white Lab result carries it
 * to the main thread (see `MarkovOptions.keepRoutes`), and a route from a different root is then one
 * `routeFrom` call rather than another solve. The outcomes are a compressed row list — state `i`'s run
 * from `outStart[i]` to `outStart[i + 1]` — in the order the solver published them.
 */
export interface RouteTable {
  /** Every state's key, in lattice order — an index anywhere below is an index into this. */
  readonly keys: readonly StateKey[];
  /** V: the minimum expected cost to finish from each state. */
  readonly value: Float64Array;
  /** Index into `actions` of the move the policy plays; -1 at a goal or a state with no route. */
  readonly act: Int32Array;
  /** The distinct moves the policy plays, as published (see the solver's `published`). */
  readonly actions: readonly McAction[];
  /** What playing the state's move once costs on average, Echoes spend included. */
  readonly actCost: Float64Array;
  readonly outStart: Int32Array;
  readonly outTo: Int32Array;
  /** Realized odds — for an offer, the chance of KEEPING each outcome, not of drawing it. */
  readonly outProb: Float64Array;
  readonly goal: Uint8Array;
  /** The one goal every goal state is drawn as — see the fold in `routeFrom`. */
  readonly goalIdx: number;
  /** Where "start over" lands: the craft's own start. */
  readonly restartIdx: number;
  /** Whether "start over" is a move at all — a from-white craft only. */
  readonly canRestart: boolean;
  /** The mod ids that can fill each position, for naming a state's mods. */
  readonly positions: readonly (readonly string[])[];
  readonly slotMasks: readonly number[];
}

/**
 * Distance-to-goal for layout/regress: missing targets + blocked (each needs a remove then an add) +
 * junk, counting an unwanted desecrated mod as junk too (it likewise costs a removal to clear).
 */
export function distanceToGoal(st: McState, slotMasks: readonly number[]): number {
  // A state below Rare is at least two moves out however good its mods are: the Regal that converts
  // it, plus the Annulment that clears the mod that Regal is forced to add. Without this a Magic item
  // already holding every target scores 0 — the goal's own distance — while not being the goal, so
  // the route walk (which may only step to a STRICTLY smaller distance) has nowhere to go and stalls.
  // This is a layout and ordering heuristic, like the rest of the expression, not an exact metric.
  const toRare = st.rarity === 'rare' ? 0 : 2;
  // No term for the flag: a flagged JUNK mod is already counted in jp/js (marking it does not add an
  // affix), and a flagged TARGET is a mod you wanted and have. The old axis needed one because it
  // described a mod held outside those counters.
  // Unfilled SLOTS, not missing candidates: with `slot 3 = {Cold, Lightning}` an item holding Cold
  // is one step from done, and counting the Lightning it will never need as "missing" would put the
  // goal permanently out of reach of a walk that may only step to a strictly smaller distance.
  // Every slot a singleton makes this `n - popcount(present)` again, exactly as before.
  return (slotMasks.length - slotsFilled(st.present, slotMasks))
    + popcount(st.blocked) + st.jp + st.js + toRare;
}

/**
 * How the UI should describe the mod a Desecration placed here, if any.
 *
 * Two fields rather than one, because the two cases read differently to a player: junk only needs
 * its side (junk mods are interchangeable), while a flagged TARGET needs naming — it is a mod they
 * asked for, and the fact that it also locks the item out of desecrating again is the whole reason
 * the state is distinct.
 */
export function flagFieldsOf(
  st: McState, positions: readonly (readonly string[])[],
): { desecratedJunk?: 'prefix' | 'suffix'; desecratedTarget?: readonly string[] } {
  if (st.flagged === FLAG_JUNK_PREFIX) return { desecratedJunk: 'prefix' };
  if (st.flagged === FLAG_JUNK_SUFFIX) return { desecratedJunk: 'suffix' };
  const i = flaggedTarget(st.flagged);
  return i >= 0 ? { desecratedTarget: positions[i]! } : {};
}

/**
 * The graph the optimal policy draws from `root`: every state it can reach, and the arrows between.
 *
 * From the craft's own start this is the graph the result has always carried. From any other state it
 * is the route a player would follow after buying that item — with one difference: when the root is
 * not the start, "start over" is where the route ENDS. The white base is drawn once, as a terminal
 * carrying what crafting from scratch costs, and not walked, because what follows it is the
 * from-scratch plan the Lab already shows beside this one.
 */
export function routeFrom(t: RouteTable, root: number): { nodes: PolicyNode[]; edges: PolicyEdge[] } {
  const rootKey = t.keys[root]!;
  const restartKey = t.keys[t.restartIdx]!;
  const endsAtRestart = t.canRestart && root !== t.restartIdx;
  /**
   * Fold every goal state onto one key for display.
   *
   * The lattice has a goal per value of the flag axis — a finished item is finished whether or not a
   * Desecration placed one of its mods — and they all have V = 0, so they are the same answer. Drawn
   * as they come they would put several identical "✓ target" boxes in the graph and imply the player
   * has a choice of endings.
   */
  const canonical = (i: number): number => (t.goal[i] === 1 ? t.goalIdx : i);
  const depthOf = (i: number): number => distanceToGoal(decodeState(t.keys[i]!), t.slotMasks);
  const named = (mask: number): (readonly string[])[] => t.positions.filter((_, i) => has(mask, i));

  // Two phases on purpose: the BFS below discovers the states and their edges, and `visitRate` is a
  // property of the finished GRAPH — it cannot be known for a node until every path into it exists.
  // Typing the accumulator without the field is what makes that ordering explicit rather than a
  // half-built object the compiler waves through.
  const nodes: Omit<PolicyNode, 'visitRate'>[] = [];
  const edges: PolicyEdge[] = [];
  const seen = new Uint8Array(t.keys.length);
  const queue: number[] = [root];
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]!;
    if (seen[i] === 1) continue;
    seen[i] = 1;
    const key = t.keys[i]!;
    const st = decodeState(key);
    const isGoal = t.goal[i] === 1;
    const isRestart = endsAtRestart && i === t.restartIdx;
    const a = isGoal || isRestart ? -1 : t.act[i]!;
    const action = a >= 0 ? t.actions[a]! : undefined;
    nodes.push({
      key,
      present: named(st.present),
      blocked: named(st.blocked),
      junkPrefixes: st.jp, junkSuffixes: st.js, rarity: st.rarity,
      ...flagFieldsOf(st, t.positions),
      isStart: i === root, isGoal, ...(isRestart ? { isRestart: true as const } : {}),
      depth: depthOf(i), expectedCost: t.value[i] ?? Infinity,
      ...(action ? { action, actionCost: t.actCost[i]! } : {}),
    });
    if (!action) continue;
    const depth = depthOf(i);
    for (let j = t.outStart[i]!; j < t.outStart[i + 1]!; j++) {
      const to = canonical(t.outTo[j]!);
      edges.push({ from: key, to: t.keys[to]!, action, prob: t.outProb[j]!, regress: depthOf(to) > depth });
      if (seen[to] !== 1) queue.push(to);
    }
  }

  /**
   * Rank every state by how much it matters to a run that SUCCEEDS.
   *
   * Two passes, and the second is the whole point.
   *
   *   forward(s) — expected visits per attempt: `f(s) = [s is root] + Σ_t f(t)·P(t→s)`.
   *   toGoal(s)  — P(reach the goal from s without restarting): `g(s) = Σ_t P(s→t)·g(t)`, `g(goal)=1`.
   *
   * The product is expected visits to `s` on a successful attempt, and `forward` ALONE was measured
   * to be actively misleading. On a craft with a free base ~98% of states choose "start over", so
   * they are entered constantly and rank at the top — while every one of them shows the same action
   * and the same cost, because they all share V(start). A real 6-target T2 craft drew ten boxes at
   * 90% coverage and nine of them said "Start over with a new base · 2,132 div". The part a player
   * needs — Chaos, Annul, Perfect Exalt, Desecrate, where the cost finally falls 2,131 → 751 — sat
   * below 99%, past 89 boxes of noise.
   *
   * `toGoal` fixes it by construction: a state whose best move is to restart has no non-restart edge
   * out, so its `g` is 0 and it leaves the ranking entirely. What survives is the spine of the craft.
   * The restart edges are still DRAWN from the states that are kept — they are the back-arrows, and
   * how often a step throws you back is exactly what the reader has to see.
   *
   * Power iteration for both: the graph is small, both chains are transient so the series converge
   * geometrically, and the alternative is a dense N×N inverse for a number that only decides what
   * gets drawn. The 1000 cap is a runaway guard; both settle in tens.
   */
  const incoming = new Map<string, { from: string; p: number }[]>();
  const outgoing = new Map<string, { to: string; p: number }[]>();
  for (const e of edges) {
    // A restart ENDS the attempt. Followed, it feeds probability back into the start and both passes
    // diverge — the loop is the reason for the cut, not a special case. Cut by where it LANDS as well
    // as by its name, which from the craft's own start is the rule this always was. From a bought item
    // an edge back into the ROOT is not a restart — annulling junk back to the item you bought is part
    // of the route — so it stays; the chain is still transient, because every restart edge is cut.
    if (e.action.currency === 'restart' || e.to === restartKey) continue;
    const inList = incoming.get(e.to);
    if (inList) inList.push({ from: e.from, p: e.prob });
    else incoming.set(e.to, [{ from: e.from, p: e.prob }]);
    const outList = outgoing.get(e.from);
    if (outList) outList.push({ to: e.to, p: e.prob });
    else outgoing.set(e.from, [{ to: e.to, p: e.prob }]);
  }

  const settle = (step: (prev: Map<string, number>) => Map<string, number>, init: Map<string, number>) => {
    let cur = init;
    for (let round = 0; round < 1000; round++) {
      const next = step(cur);
      let delta = 0;
      for (const [k, v] of next) {
        const d = Math.abs(v - (cur.get(k) ?? 0));
        if (d > delta) delta = d;
      }
      cur = next;
      if (delta <= 1e-12) break;
    }
    return cur;
  };

  const forward = settle((prev) => {
    const next = new Map<string, number>();
    for (const nd of nodes) {
      let acc = nd.key === rootKey ? 1 : 0;
      for (const { from, p } of incoming.get(nd.key) ?? []) acc += (prev.get(from) ?? 0) * p;
      next.set(nd.key, acc);
    }
    return next;
  }, new Map(nodes.map((nd) => [nd.key, nd.key === rootKey ? 1 : 0])));

  const toGoal = settle((prev) => {
    const next = new Map<string, number>();
    for (const nd of nodes) {
      if (nd.isGoal) { next.set(nd.key, 1); continue; }
      let acc = 0;
      for (const { to, p } of outgoing.get(nd.key) ?? []) acc += p * (prev.get(to) ?? 0);
      next.set(nd.key, acc);
    }
    return next;
  }, new Map(nodes.map((nd) => [nd.key, nd.isGoal ? 1 : 0])));

  return {
    nodes: nodes.map((nd) => ({ ...nd, visitRate: (forward.get(nd.key) ?? 0) * (toGoal.get(nd.key) ?? 0) })),
    edges,
  };
}
