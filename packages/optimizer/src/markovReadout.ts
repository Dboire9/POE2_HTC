// The true-cost solve, phase 4 of 4: the READ-OUT. The settled values become the answer: the move each
// state plays (`RouteTable`), the craft's own route, what finishing costs from every clean starting item,
// and — when asked — the plan played on real items. Split out of markovFromItem.ts unchanged
// (2026-11-12); see that file's header.

import type { ItemState } from '../../engine/src/types.ts';
import { ECHOES_OMEN } from './cost.ts';
import type { McAction } from './markovActions.ts';
import { actionCostOf } from './markovActions.ts';
import type { StateKey } from './markovState.ts';
import { FLAG_NONE, isAccepting } from './markovState.ts';
import type { RouteTable } from './markovRoute.ts';
import { finishesFrom, routeFrom } from './markovRoute.ts';
import { startCandidates } from './markovStarts.ts';
import { replayPolicy } from './markovReplay.ts';
import type { MarkovOptions, MarkovResult } from './markovFromItem.ts';
import type { Answer, McProblem, Refuse } from './markovProblem.ts';
import type { CompiledAction, McLattice } from './markovLattice.ts';
import type { McSolved } from './markovSolve.ts';

export function readOut(
  p: McProblem, l: McLattice, s: McSolved, opts: MarkovOptions, bones: MarkovResult['bones'], fail: Refuse,
): MarkovResult | Answer {
  const {
    data, start, prices, level, baseLimits, spare, locked, list, slotMasks, siblings, idsOf, idxOf, exaltPrice, classes,
    encode, s0, restartKey,
  } = p;
  const { N, allStates, rarities, goalKeys, goalKey, idxOfState, compiled, isGoalIdx, canRestart, canReach } = l;
  const { V, converged, bound, offers: { keepWeights, valueOf, scratch, last } } = s;
  // ── Extract policy + reachable graph from the start ─────────────────────────
  const startKey = restartKey;
  const startIdx = idxOfState.get(startKey)!;
  if (canReach[startIdx] !== 1) {
    return fail(opts.policy
      ? 'no route reaches this target with the currencies you have — allow more and try again'
      : 'no policy reaches the target');
  }
  const startCost = V[startIdx] ?? Infinity;
  if (!Number.isFinite(startCost)) return fail('no policy reaches the target');

  const bestAction = (k: StateKey): CompiledAction | undefined => {
    let best: CompiledAction | undefined;
    let bestVal = Infinity;
    for (const a of compiled[idxOfState.get(k)!]!) {
      const val = valueOf(a);
      if (val < bestVal) { bestVal = val; best = a; }
    }
    return best;
  };

  /**
   * What actually happens when this action is played — the odds the graph draws and the validator
   * samples.
   *
   * For an ordinary action that is just its distribution. For an OFFER it is emphatically not: the
   * per-draw distribution says a Desecration bricks half the time, while the player seeing three
   * offers only bricks when all three are bad. Publishing the per-draw number would put a 50% on an
   * arrow that is really 12.5%, and `simulatePolicyMean` — which samples these very edges — would then
   * "confirm" a cost the solver never computed. Same tail-sum weights as `offerValue`, against the
   * settled V.
   */
  const realizedDist = (a: CompiledAction): ReadonlyMap<StateKey, number> => {
    if (a.offer <= 1) return a.def.dist;
    const w = new Float64Array(a.to.length);
    keepWeights(a, w, true);
    // Published cheapest-first, the order these edges have always come out in.
    const byV = Array.from({ length: a.to.length }, (_, j) => j).sort((x, y) => V[a.to[x]!]! - V[a.to[y]!]!);
    const out = new Map<StateKey, number>();
    for (const j of byV) {
      const key = allStates[a.to[j]!]!;
      out.set(key, (out.get(key) ?? 0) + w[j]!);
    }
    return out;
  };

  // Full policy over every non-goal state (the reachable graph below is a subset) — for the MC validator.
  /**
   * An action as the result reports it: what to play, and what playing it once costs on average.
   *
   * An Echoes-omened Desecration is offered INSTEAD of the plain one (it can only be better), so where
   * its reroll is never worth taking it is published as the plain draw — the player needs no omen for
   * it, and it is worth exactly the same. Elsewhere it keeps the omen, and its cost the expected spend.
   */
  const published = (a: CompiledAction): { action: McAction; cost: number } => {
    const d = a.def.action;
    if (a.offer <= 1 || a.rerollCost === Infinity || d.currency !== 'desecrate') return { action: d, cost: a.cost };
    keepWeights(a, scratch, true);
    if (last.throw > 0) return { action: d, cost: a.cost + last.throw * a.rerollCost };
    const plain: McAction = {
      currency: 'desecrate',
      ...(d.boss ? { boss: d.boss } : {}), ...(d.side ? { side: d.side } : {}), ...(d.ancient ? { ancient: true } : {}),
    };
    return { action: plain, cost: a.cost };
  };

  /*
   * One pass settles what the policy does EVERYWHERE — the move each state plays, what it costs on
   * average, and where it lands — as the plain data of a `RouteTable`. Every graph is a walk over it:
   * the craft's own route below, and on the Lab the route from any item a player might buy instead,
   * which is why it is the whole lattice rather than only the states the start can reach.
   */
  const policy = new Map<StateKey, McAction>();
  const actions: McAction[] = [];
  const actionIdx = new Map<string, number>();
  const act = new Int32Array(N).fill(-1);
  const actCost = new Float64Array(N);
  const outStart = new Int32Array(N + 1);
  const outTo: number[] = [];
  const outProb: number[] = [];
  const rerollAbove = new Float64Array(N).fill(NaN);
  for (let i = 0; i < N; i++) {
    outStart[i] = outTo.length;
    const key = allStates[i]!;
    if (goalKeys.has(key)) continue;
    const a = bestAction(key);
    if (!a) continue;
    const shown = published(a);
    // `published` keeps the omen only where the plan rerolls, having just run the keep rule — so the
    // line it rerolls below is fresh in `last.bar`, and a player following the plan needs it.
    if (shown.action.currency === 'desecrate' && shown.action.echoes) rerollAbove[i] = last.bar;
    policy.set(key, shown.action);
    // Deduplicated only to keep the table small; two spellings of one move would merely cost a slot.
    const id = JSON.stringify(shown.action);
    let ai = actionIdx.get(id);
    if (ai === undefined) { ai = actions.length; actions.push(shown.action); actionIdx.set(id, ai); }
    act[i] = ai;
    actCost[i] = shown.cost;
    for (const [to, p] of realizedDist(a)) {
      if (p <= 0) continue;
      outTo.push(idxOfState.get(to)!);
      outProb.push(p);
    }
  }
  outStart[N] = outTo.length;
  const table: RouteTable = {
    keys: allStates, value: V, act, actions, actCost,
    outStart, outTo: Int32Array.from(outTo), outProb: Float64Array.from(outProb),
    goal: isGoalIdx, goalIdx: idxOfState.get(goalKey)!,
    restartIdx: startIdx, canRestart, rerollAbove,
    positions: list.map(idsOf), slotMasks, obstacles: siblings.obstacles,
    locate: {
      baseId: start.base.id, level,
      floors: list.map((t) => t.mods.map((m) => m.minIndex)),
      fractured: list.map((t) => t.fractured),
      blocks: [...siblings.blocks],
      classes,
      locked: locked.map((l) => l.mod.id).sort(),
    },
  };

  // The craft's own route: the walk any other root gets too, from the start (markovRoute.ts).
  const { nodes, edges } = routeFrom(table, startIdx);

  /*
   * What finishing costs from every CLEAN item the craft could start from — a table lookup, since
   * value iteration solved every cell of the lattice (markovStarts.ts has the rules for which cell a
   * set of mods is read from). Both rungs a buyer meets: Magic and Rare.
   *
   * `bareCost` keeps its own read at `s0.rarity`, because it answers a different question (what the
   * craft in front of you would cost with none of it done) and `ItemWorth` is built on that meaning.
   * It equals the empty Rare row only when the craft starts Rare.
   */
  const holdings = startCandidates({
    list, slotMasks, rarities, encode, obstacles: siblings.obstacles.prefix | siblings.obstacles.suffix,
    valueAt: (key) => { const i = idxOfState.get(key); return i === undefined ? undefined : V[i]; },
  });
  // Played on real items when asked — the replay classifies every item the way `s0` was classified and
  // asks this very policy what to do, so it can only ever describe the plan the result reports.
  const replay = opts.replay && bound === 'exact'
    ? replayPolicy({
      data, start, list, idxOf, encode, policy, blocks: siblings.blocks,
      isGoal: (s) => isAccepting(s, slotMasks, spare, siblings.obstacles),
      valueOf: (key) => { const i = idxOfState.get(key); return i === undefined ? undefined : V[i]; },
      ...(opts.restartCost === undefined ? {} : { restartCost: opts.restartCost }),
      ...(opts.fillOnFinish ? { finishCost: (item: ItemState) =>
        ((baseLimits.prefixes - item.prefixes.length) + (baseLimits.suffixes - item.suffixes.length)) * exaltPrice! } : {}),
      costOf: (a) => actionCostOf(prices, a),
      // An omened Desecration rerolls where the plan does, at the line the table records.
      ...(prices.omens[ECHOES_OMEN] !== undefined ? { reroll: {
        cost: prices.omens[ECHOES_OMEN],
        above: (key: StateKey) => {
          const i = idxOfState.get(key);
          const v = i === undefined ? NaN : rerollAbove[i]!;
          return Number.isFinite(v) ? v : undefined;
        },
      } } : {}),
    }, opts.replay)
    : undefined;
  // Its own read, at the STARTING rarity — see the note above on why that differs from `holdings`.
  const bareIdx = idxOfState.get(encode(0, 0, 0, 0, FLAG_NONE, s0.rarity));
  const bareV = bareIdx === undefined ? undefined : V[bareIdx];
  const bare = bareV !== undefined && Number.isFinite(bareV) ? bareV : undefined;
  return {
    expectedCost: startCost, feasible: true, converged, bound, nodes, edges, policy,
    ...(bones ? { bones } : {}),
    ...(bare !== undefined ? { bareCost: bare } : {}),
    ...(holdings.length > 0 ? { holdings } : {}),
    // A CEILING's plan too (`bound: 'upper'`, a from-white craft that stopped early): phase B descends from
    // a proper policy's value, so its greedy plan is one that finishes and costs no more than V — but that
    // is checked on the table itself (`finishesFrom`) before anyone is told to follow it. Never a FLOOR's:
    // a held item whose first phase did not settle has no plan known to finish.
    ...(opts.keepRoutes && (bound === 'exact' || (bound === 'upper' && finishesFrom(table, startIdx))) ? { routes: table } : {}),
    ...(opts.restartCost !== undefined ? { restartCost: opts.restartCost } : {}),
    ...(replay ? { replay } : {}),
  };
}
