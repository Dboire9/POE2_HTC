// The true-cost solve, phase 3 of 4: the SOLVE. Phase A is value iteration without restart; phase B adds
// restart, by value iteration or (the app's default) policy iteration with each policy costed in closed
// form; `bound` says what the number is. Split out of markovFromItem.ts unchanged (2026-11-12); see that
// file's header and docs/ALGORITHM.md.

import { solveDenseInPlace } from './denseSolve.ts';
import type { RouteTable } from './markovRoute.ts';
import { projectPlan } from './markovSeed.ts';
import { offerValuer } from './markovOffer.ts';
import type { MarkovOptions, MarkovResult } from './markovFromItem.ts';
import type { McProblem, Refuse } from './markovProblem.ts';
import type { McLattice } from './markovLattice.ts';

export function solveLattice(p: McProblem, l: McLattice, opts: MarkovOptions, fail: Refuse) {
  const { list, idsOf, restartKey } = p;
  const {
    N, allStates, canReach, canReachPushForward, canRestart, cheapestAction, compiled, finishCost, idxOfState, isGoalIdx,
    widestOffer,
  } = l;
  const report = opts.onProgress;
  // ── Value iteration ─────────────────────────────────────────────────────────
  // Standard stochastic-shortest-path VI: 0-initialise (a finite lower bound) and let values climb to
  // the fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery
  // cycles here — e.g. {both targets + junk} ↔ {one target + junk} each need the other finite first —
  // so neither bootstraps. Every target is gettable by now, so the goal is reachable from every state
  // and VI converges to a finite V.) Each action solves its own self-loop via ÷(1 − pStay).
  //
  // …except when starting over is allowed, which breaks 0-init VI outright. `restart` costs about
  // nothing and lands on the start, so every state is worth `restartCost + V(start)` — and while V is
  // still near 0 that TIES with every other action, so early sweeps pick restart everywhere. VI
  // unpicks the tie only as the true values separate, which on a long-shot target outlasts any
  // budget. A truncated solve therefore returns a policy that bins the item in every state, including
  // states already holding a target mod: not a slow answer but a wrong one, and exactly what a 6-mod
  // from-white craft rendered — every box in the graph reading "Start over with a new base".
  //
  // So solve it in two phases. Phase A runs push-forward only (restart excluded), which 0-init VI
  // handles fine, and converges to V0. Phase B puts restart back and starts from V0 instead of 0.
  //
  // V0 is the value of a PROPER policy — one that always reaches the goal — so V0 ≥ V*, and
  //     T(V0) = min(T_pushForward(V0), restartCost + V0[start]) ≤ T_pushForward(V0) = V0,
  // i.e. V0 is excessive. Phase B's sweeps therefore DESCEND toward V* instead of climbing, and two
  // things follow. Every iterate stays above V*, so a truncated phase B reports "at most x" (see
  // `bound`) rather than the "at least x" a 0-init solve gives. And — the reason this is the fix and
  // not an optimisation — the greedy policy is sensible from the very first sweep: restart wins at a
  // state only where `restartCost + V[start]` genuinely beats digging out, so a state holding a target
  // keeps it, and the extracted route reaches the goal even when the solve stops early.
  /**
   * How close is close enough — a thousandth of the cheapest thing the craft can do.
   *
   * A craft with a free action (a missing price mints one — see CLAUDE.md) has no positive `cheapest`
   * to scale from, so it keeps the old flat default. Slow, but never wrong.
   *
   * There WAS a second half here: phase B is an upper bound because phase A reached a fixed point, and
   * stopping phase A at residual `tol` weakens that, so the seed was scaled by
   * `cheapest / (cheapest − tol)` to put it back on the excessive side. The derivation is sound
   * (`T(cV) <= c·T(V)` for `c >= 1` with positive costs) and the code was one line — and it did
   * nothing measurable. Removing it moved the answer in the FIFTH decimal at every tolerance from 1e-4
   * to 1.5e-1, in both directions, and never turned a violated bound into a satisfied one.
   *
   * The reason is that phase B's own truncation dwarfs the seed's shortfall: a descending sequence
   * stopping at Δ < tol still sits tol/(1−r) above its limit with r near 1, which is orders larger than
   * the seed could be low by. What actually holds the bound up is that margin, and it is measured, not
   * assumed — see "never quotes an upper bound below the converged cost". Keeping an unfalsifiable line
   * whose comment claimed to guarantee something it did not is worse than saying plainly what does.
   */
  const scaleAware = Number.isFinite(cheapestAction) && cheapestAction > 0;
  const tol = opts.tolerance ?? (scaleAware ? cheapestAction / 1000 : 1e-9);
  const maxIters = opts.maxIters ?? 100_000;
  /** Policy-improvement rounds. PI converges in a handful; this is a runaway guard, not a budget. */
  const maxRounds = opts.maxRounds ?? 200;
  const V = new Float64Array(N); // 0-initialised, as above
  // …except a goal, which is worth what finishing there costs. The sweeps never write a goal, so this
  // is where its value comes from, here and after every reset below.
  const seedGoals = (): void => { for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1) V[i] = finishCost[i]!; };
  seedGoals();
  // Phase A's dead ends, a superset of phase B's. A state only a restart can rescue starts at Infinity,
  // which is still a valid seed for phase B — the seed only has to be an UPPER bound.
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;
  // What each action is worth against V as it stands, an offer's keep rule included (markovOffer.ts).
  const offers = offerValuer(V, widestOffer);
  const { keepWeights, valueOf, last } = offers;
  // Checked every CHECK sweeps rather than every sweep: Date.now() in the hot loop is measurable, and
  // a sweep is short enough that the overshoot is irrelevant next to a multi-second budget.
  const deadline = opts.maxMillis === undefined ? Infinity : Date.now() + opts.maxMillis;
  const DEADLINE_CHECK = 32;
  /** The largest chain `exactEvaluation` solves outright: ~0.3 s an evaluation at the limit. */
  const DIRECT_MAX_STATES = 1_000;

  /**
   * Emit only when the number the UI would DISPLAY changes — and across the WHOLE solve, not per
   * phase, so the handover at 500‰ and the closing 1000‰ don't each repeat a value already sent.
   *
   * The loop below runs up to `maxIters` (100k) sweeps, and every report crosses the worker boundary
   * as a postMessage that wakes a React re-render. Reporting per sweep sent ~100,001 messages to
   * describe at most 1001 distinct values, so ~99% of them repainted the bar with the number it
   * already had. That flood is what turned a 24-second solve into a ten-minute wait in the browser;
   * the maths was never slow. The other two phases above were already strided — this one was missed,
   * which is why only long solves showed it.
   */
  let lastPermille = -1;
  const emitSolve = (permille: number): void => {
    if (!report || permille === lastPermille) return;
    lastPermille = permille;
    report({ phase: 'solve', done: permille, total: 1000 });
  };

  /**
   * Sweep `V` in place to its fixed point; true if it reached `tol` rather than running out of
   * sweeps or clock. `withRestart` false is phase A. `pLo`–`pHi` is this phase's slice of the
   * 0–1000 progress bar, so two phases fill one bar instead of resetting it halfway.
   */
  const iterate = (withRestart: boolean, pLo: number, pHi: number): boolean => {
    let decades = 0; // log-distance the first sweep had left to travel; see the progress note below
    for (let iter = 0; iter < maxIters; iter++) {
      if (deadline !== Infinity && iter % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
      let delta = 0;
      for (let i = 0; i < N; i++) {
        if (isGoalIdx[i] === 1) continue;
        // Skip what this phase can never finish from: pinned at Infinity, which is its true value here.
        if ((withRestart ? canReach[i] : canReachPushForward[i]) !== 1) continue;
        const acts = compiled[i]!;
        let best = Infinity;
        for (let k = 0; k < acts.length; k++) {
          const a = acts[k]!;
          if (a.isRestart && !withRestart) continue;
          const v = valueOf(a);
          if (v < best) best = v;
        }
        if (!Number.isFinite(best)) continue;
        const prev = V[i]!;
        V[i] = best;
        const d = Math.abs(best - prev);
        if (d > delta) delta = d;
      }
      if (delta <= tol) return true;
      // VI converges geometrically, so "sweeps remaining" is not knowable and counting them against
      // `maxIters` (100k — usually reached in tens, but a long-odds action can exhaust the lot) would peg
      // the bar at zero. What IS monotone is how
      // far the residual has travelled toward `tol` on a log scale — so a unit here is one decade
      // closed, and the total is the distance the first sweep found still to cover.
      if (report) {
        const remaining = Math.log10(Math.max(delta, tol) / tol);
        if (iter === 0) decades = remaining;
        // TWO monotone measures, and we report whichever is further along, in permille.
        //
        // The residual measure is the better signal when VI behaves — it tracks actual progress toward
        // an answer. But its resolution collapses when convergence is slow: a stalled solve once
        // reported 0/11 then 1/11 across 100,000 sweeps, so the bar sat at 92% for five seconds and
        // read as a hang. Sweeps burned is crude (VI usually finishes in tens of a 100k budget, so it
        // reads ~0 on a healthy solve) but it always advances. Taking the max means the bar moves on
        // the residual when there IS residual progress, and falls back to "how much budget is gone"
        // when there isn't — which is exactly the case where the user needs to see something move.
        const byResidual = decades > 0 ? (decades - remaining) / decades : 0;
        const byBudget = (iter + 1) / maxIters;
        emitSolve(Math.round(pLo + Math.max(byResidual, byBudget) * (pHi - pLo)));
      }
    }
    return false;
  };

  /**
   * The closed form's chain solved outright: for every state `s` not terminal under `pol`,
   *
   *     (1 − self(s))·c(s) − Σ p(s→t)·c(t) = cost(s) + Σ p(s→u)·c(u)      t non-terminal, u terminal
   *
   * and the same with `q`, whose right side has no cost — one matrix, both solved at once
   * (`solveDenseInPlace`), which is why it is kept to `DIRECT_MAX_STATES`. Writes `cOf`/`qOf` for those
   * states; false when the system is singular (a loop with no way out) or the answer is not finite.
   */
  const solveChainDirect = (
    pol: Int32Array, isTerm: Uint8Array, wTo: Int32Array[], wPr: Float64Array[],
    selfW: Float64Array, spendOf: Float64Array, cOf: Float64Array, qOf: Float64Array,
  ): boolean => {
    const row = new Int32Array(N).fill(-1);
    const states: number[] = [];
    for (let i = 0; i < N; i++) {
      if (isTerm[i] === 1) continue;
      // Only loops back: no progress, as the sweeps read it too.
      if (1 - selfW[i]! <= 1e-12) { cOf[i] = Infinity; qOf[i] = 1; continue; }
      row[i] = states.length;
      states.push(i);
    }
    const M = states.length;
    const A = new Float64Array(M * M);
    const bc = new Float64Array(M);
    const bq = new Float64Array(M);
    for (let r = 0; r < M; r++) {
      const i = states[r]!;
      const to = wTo[i]!; const pr = wPr[i]!;
      A[r * M + r] = 1 - selfW[i]!;
      bc[r] = compiled[i]![pol[i]!]!.cost + spendOf[i]!;
      for (let j = 0; j < to.length; j++) {
        const t = to[j]!;
        if (t === i) continue; // an offer's self-weight, already in `selfW`
        const at = row[t]!;
        if (at >= 0) A[r * M + at] = A[r * M + at]! - pr[j]!;
        else { bc[r] = bc[r]! + pr[j]! * cOf[t]!; bq[r] = bq[r]! + pr[j]! * qOf[t]!; }
      }
    }
    if (!solveDenseInPlace(A, M, [bc, bq])) return false;
    for (let r = 0; r < M; r++) { cOf[states[r]!] = bc[r]!; qOf[states[r]!] = bq[r]!; }
    return true;
  };

  /**
   * Cost a FIXED policy exactly, in closed form, instead of iterating a chain that barely contracts.
   *
   * Iterative evaluation is where policy iteration spends essentially all its time, and it is slow for
   * a structural reason: with a free base ~98% of states choose restart, so `V(s) = restartCost +
   * V(start)` almost everywhere and the chain's contraction rate sits at r ≈ 1. A residual under `tol`
   * still leaves an error of `tol/(1−r)`, and `1/(1−r)` is the expected number of attempts — thousands.
   * Measured: varying only the evaluation tolerance moved one craft 74.4s → 0.8s and its answer
   * 4,753 → 35,417, a 93x speed span with accuracy tracking it exactly. So there is no cheap win to be
   * had by loosening a number.
   *
   * The way out is to stop iterating the loop at all. Under a fixed policy an attempt either reaches
   * the goal or hits a state where the policy restarts — and restarting begins an identical attempt.
   * That is a renewal process, so on the restart-ABSORBING chain (restart is a terminal payment, not
   * an edge back to the start) define
   *
   *     c(s) = expected cost from s until goal-or-restart      c(goal)=0, c(restart)=restartCost
   *     q(s) = P(restart before goal, from s)                  q(goal)=0, q(restart)=1
   *
   * and then, exactly:
   *
   *     V(start) = c(start) / (1 − q(start))        ← renewal-reward, one division
   *     V(s)     = c(s) + q(s)·V(start)             ← one pass
   *
   * The near-1 contraction is gone because the cycle causing it is gone. Better still, restart states
   * are TERMINAL here — and they are 98% of the lattice — so the chain c and q actually propagate
   * through is the thin spine of states the craft passes through, not the whole space.
   *
   * OFFER ACTIONS are the wrinkle. `offerValue` sorts a Desecration's three draws by current V, so its
   * realized distribution moves as V moves, which would make c and q non-linear. The ordering is
   * therefore FROZEN for the duration of one evaluation — treated as part of the policy, exactly as
   * the improvement step already treats the choice of action. Improvement re-orders next round.
   * An Echoes reroll's keep-or-throw-back decision is frozen with it: it reads the same V.
   *
   * Returns false when the policy never reaches the goal (`q(start) = 1`), which is a real state of
   * affairs — an improper policy has infinite value — and the caller must not read V after it.
   */
  const evaluateClosedForm = (pol: Int32Array, evalCap?: number): boolean => {
    // Frozen realized weights per state, against V as it stands right now.
    const wTo: Int32Array[] = new Array<Int32Array>(N);
    const wPr: Float64Array[] = new Array<Float64Array>(N);
    const selfW = new Float64Array(N);
    const spendOf = new Float64Array(N); // an Echoes omen's expected spend, frozen with the weights
    const isTerm = new Uint8Array(N);   // goal or "policy restarts here" — the chain stops
    const cOf = new Float64Array(N);
    const qOf = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      // A goal ends the chain having cost what finishing there costs; a dead end ends it at nothing.
      if (isGoalIdx[i] === 1) { isTerm[i] = 1; cOf[i] = finishCost[i]!; continue; }
      if (canReach[i] !== 1) { isTerm[i] = 1; continue; }
      const k = pol[i]!;
      // A state the policy has no move for is NOT a free exit: nothing finishes from it, so it costs
      // Infinity. Read as 0 it let an improper policy quote a craft at nothing, as an "upper bound"
      // (TODO 24: a tablet with Chaos and Annul both excluded came back at 0 ex). Since the stuck start
      // is seeded (below), no known craft reaches this line — mutation-testing does not catch its
      // removal; it stays so that an improper policy can never again read as a free craft.
      if (k < 0) { isTerm[i] = 1; cOf[i] = Infinity; continue; }
      const a = compiled[i]![k]!;
      if (a.isRestart) { isTerm[i] = 1; cOf[i] = a.cost; qOf[i] = 1; continue; }
      if (a.offer <= 1) {
        wTo[i] = a.to; wPr[i] = a.prob; selfW[i] = a.selfProb;
      } else {
        // `keepWeights`, frozen at V as it stands. Nothing is hoisted for an offer, so a self-outcome
        // shows up in the weights and is split out below.
        const w = new Float64Array(a.to.length);
        keepWeights(a, w, true);
        if (last.throw > 0) spendOf[i] = last.throw * a.rerollCost;
        let self = 0;
        for (let j = 0; j < a.to.length; j++) if (a.to[j] === i) self += w[j]!;
        wTo[i] = a.to; wPr[i] = w; selfW[i] = self;
      }
    }

    // Gauss-Seidel on the absorbing chain. Well-conditioned by construction — no path returns to the
    // start — so this settles in a handful of sweeps where the looping version needed thousands.
    // A seeded attempt must be able to FAIL CHEAPLY: if its chain does not settle quickly the policy
    // was a bad guess, and the two-phase fallback still needs budget left to run. Measured the hard
    // way — an unbounded first attempt burned 5,000,000 sweeps and the entire deadline, so the
    // fallback had nothing left and the craft came back infeasible.
    // NEVER above `maxIters`: that is the caller's budget for the whole solve, and a seed attempt
    // that quietly spent 100x it would be answering a question nobody asked.
    const cap = Math.min(evalCap ?? maxIters, maxIters);
    // …except where a loop OTHER than restart barely contracts: a Chaos reroll among Rare states that
    // lands the target 1 roll in a million. There the sweeps "settle" — each moves less than `tol` —
    // while still far from the answer, and policy iteration, comparing plans on those numbers, flips
    // between two of them forever (a tablet's four rarest modifiers: 598M ↔ 324M ex). `exactEvaluation`
    // solves such a chain outright instead, when it is small enough (`solveChainDirect`).
    let spine = 0;
    if (opts.exactEvaluation) for (let i = 0; i < N; i++) if (isTerm[i] === 0) spine++;
    if (opts.exactEvaluation && spine <= DIRECT_MAX_STATES) {
      if (!solveChainDirect(pol, isTerm, wTo, wPr, selfW, spendOf, cOf, qOf)) return false;
    } else for (let sweep = 0; sweep < cap; sweep++) {
      if (deadline !== Infinity && sweep % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
      let delta = 0;
      for (let i = 0; i < N; i++) {
        if (isTerm[i] === 1) continue;
        const k = pol[i]!;
        const a = compiled[i]![k]!;
        const to = wTo[i]!; const pr = wPr[i]!;
        const denom = 1 - selfW[i]!;
        if (denom <= 1e-12) { cOf[i] = Infinity; qOf[i] = 1; continue; } // only loops back: no progress
        let cAcc = a.cost + spendOf[i]!; let qAcc = 0;
        for (let j = 0; j < to.length; j++) {
          const t = to[j]!;
          // Self-weight is divided out below, never summed here. For an ordinary action `to` already
          // EXCLUDES the self-loop (it lives in `selfProb`), so this only bites for an OFFER, whose
          // weights hoist nothing. No offer on the shipped data produces a self-outcome — a
          // Desecration always places a mod, so the state always moves — which means this line is
          // required by the formula but not exercised by any craft. Mutation-testing does not catch
          // its removal; that is a statement about the data, not a reason to drop it.
          if (t === i) continue;
          cAcc += pr[j]! * cOf[t]!;
          qAcc += pr[j]! * qOf[t]!;
        }
        const cNew = cAcc / denom;
        const qNew = qAcc / denom;
        const d = Math.max(Math.abs(cNew - cOf[i]!), Math.abs(qNew - qOf[i]!));
        cOf[i] = cNew; qOf[i] = qNew;
        if (d > delta) delta = d;
      }
      if (delta <= tol) break;
    }

    const si = idxOfState.get(restartKey)!;
    const qs = qOf[si]!;
    if (!(qs < 1)) return false;             // never reaches the goal ⇒ infinite value
    const lambda = cOf[si]! / (1 - qs);
    if (!Number.isFinite(lambda)) return false;
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1) { V[i] = finishCost[i]!; continue; }
      if (canReach[i] !== 1) continue;       // stays pinned at Infinity
      V[i] = cOf[i]! + qOf[i]! * lambda;
    }
    return true;
  };

  /**
   * POLICY ITERATION for phase B — the phase that costs 20x phase A and the one that fails to converge.
   *
   * Value iteration computes the argmin over actions on every sweep and then THROWS IT AWAY, keeping
   * only the value. Policy iteration keeps it, and alternates two cheaper things:
   *
   *   improve   — recompute the greedy action per state. If nothing changed, the policy is OPTIMAL,
   *               and that is a certificate rather than a tolerance: the loop ends knowing, not hoping.
   *   evaluate  — sweep V with the policy FIXED. No inner max, so a sweep is a fraction of a VI sweep,
   *               and it converges far faster because the policy is not churning underneath it.
   *
   * Phase B ONLY, and deliberately. PI on a stochastic shortest path is only safe from a PROPER policy
   * (one that reaches the goal almost surely) — an improper one has infinite value and evaluation
   * diverges. Phase B is seeded from phase A's converged value, which IS a proper policy's value, so
   * V0 >= V*, the greedy policy stays proper, and every iterate descends. Phase A itself 0-initialises
   * and climbs, so it has no such guarantee and keeps plain VI, which it converges on anyway.
   */
  /**
   * A seed policy from a HEURISTIC, so phase A can be skipped entirely.
   *
   * Phase A exists only to hand phase B a `V0` with `T(V0) <= V0`, so phase B descends and every
   * iterate stays an upper bound. It satisfies that by computing the OPTIMAL push-forward value —
   * which is far more than the property needs, and measured at 92-98% of a whole solve now that
   * evaluation is closed form (6-target T2: 379.6s of 389s).
   *
   * The property is much weaker than optimality. For ANY proper policy pi,
   *
   *     T(V^pi) <= T_pi(V^pi) = V^pi
   *
   * so any proper policy's exact value is a valid seed — and `evaluateClosedForm` produces exactly
   * that, at 2% of a solve. All that is missing is a proper policy to hand it, and with restart in
   * play properness is a very weak condition: a policy is proper as soon as its per-attempt success
   * probability is above zero.
   *
   * So: level every state by a backward BFS from the goal, then take the action most likely to move
   * DOWN a level, cost breaking ties. Restart wherever nothing makes progress. The result does not
   * need to be good — policy improvement fixes it — only proper, and the caller checks even that.
   */
  const heuristicPolicy = (): Int32Array => {
    // Distance to the goal in ACTION steps, backwards. Not `distanceToGoal` (defined below, over mod
    // counts) — this one has to be an index-space quantity available before the solve runs.
    const level = new Int32Array(N).fill(-1);
    const queue: number[] = [];
    for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1) { level[i] = 0; queue.push(i); }
    // Predecessors over the action graph, restart excluded: a restart reaches the start from
    // everywhere, which would flatten every level to 1 and make the heuristic say nothing.
    const preds: number[][] = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) {
      for (const a of compiled[i] ?? []) {
        if (a.isRestart) continue;
        for (let j = 0; j < a.to.length; j++) preds[a.to[j]!]!.push(i);
      }
    }
    for (let head = 0; head < queue.length; head++) {
      const t = queue[head]!;
      for (const from of preds[t]!) if (level[from] === -1) { level[from] = level[t]! + 1; queue.push(from); }
    }

    const startLevel = level[idxOfState.get(restartKey)!] ?? -1;
    const pol = new Int32Array(N).fill(-1);
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
      const acts = compiled[i]!;
      let bestK = -1, bestP = -1, bestCost = Infinity, restartK = -1;
      for (let k = 0; k < acts.length; k++) {
        const a = acts[k]!;
        if (a.isRestart) { restartK = k; continue; }
        const mine = level[i]!;
        let progress = 0;
        for (let j = 0; j < a.to.length; j++) {
          const lt = level[a.to[j]!]!;
          if (lt !== -1 && (mine === -1 || lt < mine)) progress += a.prob[j]!;
        }
        if (progress > bestP || (progress === bestP && a.cost < bestCost)) {
          bestP = progress; bestCost = a.cost; bestK = k;
        }
      }
      /**
       * Continue only from states no FURTHER from the goal than the base you would restart to;
       * otherwise bin it.
       *
       * This rule is what makes the seed cheap to evaluate, and the first version got it backwards.
       * Playing forward wherever any progress was possible produced a policy that almost never
       * restarts — and `evaluateClosedForm` is only fast because restart states are ABSORBING. A
       * policy that plays forward everywhere has the full forward dynamics as its chain, which is
       * precisely the near-1 contraction phase A struggles with: it burned 5,000,000 sweeps and the
       * whole deadline on a 3-target T1 craft.
       *
       * Bounding continuation by the start's own level caps the chain depth, so evaluation stays
       * shallow. It also happens to be what the optimal policy does — restart in ~98% of states —
       * which is why it is a good starting guess as well as a cheap one.
       */
      const worthContinuing = bestP > 0 && level[i] !== -1 && startLevel !== -1 && level[i]! <= startLevel;
      pol[i] = worthContinuing ? bestK : (restartK >= 0 ? restartK : bestK);
    }
    return pol;
  };

  const iteratePolicy = (pLo: number, pHi: number, seedPol?: Int32Array, evalCap?: number): boolean => {
    const pol = seedPol ?? new Int32Array(N).fill(-1);
    let evaluated = 0;
    /**
     * Did the LAST evaluation reach `tol`, or run out of sweeps?
     *
     * Truncating evaluation is legitimate — that is modified policy iteration, and it still converges,
     * just over more rounds. What is NOT legitimate is ending on the certificate after a truncated
     * one: improvement would be comparing under-evaluated values, so "no action changed" says nothing
     * about optimality. Measured on a 3-target T1 craft whose true cost is 10,661.00 — at maxIters
     * 20,000 this returned `bound: 'exact'` and 10,836.88, 1.6% high and rendered as a plain figure.
     * So the flag gates the PROOF, not the loop.
     */
    let settled = false;

    // A seeded run starts from a policy nobody has costed yet, so V still holds whatever the caller
    // left there. Evaluate FIRST: improvement compares action values against V, and comparing against
    // a stale V would pick a policy for a problem that is not this one.
    if (seedPol) {
      settled = evaluateClosedForm(pol, evalCap);
      if (!settled) return false;
    }

    for (let round = 0; round < maxRounds; round++) {
      // ── improve ──────────────────────────────────────────────────────────────
      let changed = 0;
      for (let i = 0; i < N; i++) {
        if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
        const acts = compiled[i]!;
        let best = Infinity, bestK = -1;
        for (let k = 0; k < acts.length; k++) {
          const v = valueOf(acts[k]!);
          if (v < best) { best = v; bestK = k; }
        }
        if (bestK !== pol[i]) { pol[i] = bestK; changed++; }
      }
      // The certificate. Not "the numbers stopped moving" — the POLICY stopped moving, which for a
      // finite MDP means no action anywhere improves on it, i.e. this is the optimal policy exactly.
      if (round > 0 && changed === 0 && settled) return true;

      // ── evaluate ─────────────────────────────────────────────────────────────
      // Closed form by default; the iterative path stays reachable so the two can be diffed. See
      // `evaluateClosedForm` for why iterating this particular chain is the whole cost of the solve.
      if (!opts.iterativeEval) {
        settled = evaluateClosedForm(pol, evalCap);
        if (!settled) return false;
        continue;
      }
      settled = false;
      for (let k = 0; k < maxIters; k++) {
        if (deadline !== Infinity && evaluated % DEADLINE_CHECK === 0 && Date.now() > deadline) return false;
        evaluated++;
        let delta = 0;
        for (let i = 0; i < N; i++) {
          if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
          const kk = pol[i]!;
          if (kk < 0) continue;
          const next = valueOf(compiled[i]![kk]!);
          if (!Number.isFinite(next)) continue;
          const d = Math.abs(next - V[i]!);
          V[i] = next;
          if (d > delta) delta = d;
        }
        if (delta <= tol) { settled = true; break; }
      }
      if (report) emitSolve(Math.round(pLo + Math.min(0.98, round / 12) * (pHi - pLo)));
    }
    return false;
  };

  /**
   * The fast path: skip phase A entirely.
   *
   * Phase A is 92-98% of a solve now that evaluation is closed form, and all it owes phase B is a
   * proper policy's value. `heuristicPolicy` produces a candidate without solving anything, and
   * `evaluateClosedForm` both costs it and rejects it if it turns out improper — in which case this
   * returns false and the ordinary two-phase path below runs untouched.
   *
   * Only for the policy solver. Value iteration has no use for a policy.
   */
  /** The guessed policy, with another solve's plan wherever it has a move this lattice can play. */
  const seededPolicy = (seed: RouteTable): Int32Array => {
    const pol = heuristicPolicy();
    const moveAt = projectPlan(seed, list.map(idsOf), allStates);
    for (let i = 0; i < N; i++) {
      if (isGoalIdx[i] === 1 || canReach[i] !== 1) continue;
      const m = moveAt(i);
      if (!m) continue;
      const want = JSON.stringify(m);
      const k = compiled[i]!.findIndex((a) => JSON.stringify(a.def.action) === want);
      if (k >= 0) pol[i] = k;
    }
    return pol;
  };
  const seedPol = canRestart && opts.solver === 'policy' && !opts.iterativeEval
    ? (opts.seedFrom ? seededPolicy(opts.seedFrom) : opts.heuristicSeed === true ? heuristicPolicy() : undefined)
    : undefined;
  // The cap is a budget for the GUESS, not for the answer: cheap enough that a bad seed costs a
  // fraction of a second, generous enough that a good one settles inside it.
  const fastSeeded = seedPol ? iteratePolicy(0, 1000, seedPol, 20_000) : false;

  let converged: boolean;
  let bound: MarkovResult['bound'];
  if (fastSeeded) {
    converged = true;
    bound = 'exact';
    emitSolve(1000);
  } else {
  // Phase A CLIMBS from zero, so it is only a lower bound while it runs and only becomes a valid seed
  // on convergence. The fast path above has already written its own values into V, so reset before
  // falling back — otherwise phase A starts from an upper bound, climbs past it, and the phase-B
  // descent it is supposed to enable begins from the wrong side.
  V.fill(0);
  seedGoals();
  for (let i = 0; i < N; i++) if (canReachPushForward[i] !== 1) V[i] = Infinity;

  const seedConverged = iterate(false, 0, canRestart ? 500 : 1000);
  converged = seedConverged;
  bound = seedConverged ? 'exact' : 'lower';
  if (canRestart) {
    // No converged V0 means no proper-policy value to seed from, and an unconverged 0-init V bounds
    // the restart problem in NEITHER direction: it is climbing toward the push-forward optimum, which
    // is the far larger number (~40x, measured). Rather than print a figure with no meaning, say what
    // happened and what to do about it. Reached by a tablet's rarest four-modifier sets at Standard.
    if (!seedConverged) {
      // Which limit ran out decides whether "try harder" is advice or noise: a clock the caller set can
      // be raised, the sweep cap cannot.
      return fail(deadline === Infinity
        ? 'this craft needs more value-iteration sweeps than the solver allows — the step routes still cover it'
        // Its clock OR its sweep cap: the app's Search effort raises both. A four-modifier tablet whose
        // rarest pieces are 1 roll in 150 spends Standard's 100,000 sweeps in ~1.5 s and settles at
        // Exhaustive in ~25 s — so this does not say "out of time" (it read so until 2026-09-23).
        : 'the solver stopped before it could put a number on this craft — raise Search effort and try again '
          + '(the rarest crafts need the longest setting)', { stoppedEarly: true });
    }
    // Phase A leaves the START at Infinity when nothing finishes the craft without starting over — a
    // tablet with no Chaos and no Annul, full of the wrong modifiers, can only be binned. Phase B then
    // has nothing to descend from: every action reads Infinity, the restart included. Seed it from the
    // restart-bounded heuristic policy instead, which is proper by construction and which the closed
    // form costs exactly: an upper bound for value iteration to descend from, and a starting policy
    // for policy iteration to improve.
    const startsStuck = !Number.isFinite(V[idxOfState.get(restartKey)!]!);
    const seed = startsStuck ? heuristicPolicy() : undefined;
    if (seed && opts.solver !== 'policy' && !evaluateClosedForm(seed)) {
      return fail(opts.policy
        ? 'no route reaches this target with the currencies you have — allow more and try again'
        : 'no policy reaches the target');
    }
    converged = opts.solver === 'policy' ? iteratePolicy(500, 1000, seed) : iterate(true, 500, 1000);
    bound = converged ? 'exact' : 'upper';
  }
  emitSolve(1000);
  }

  return { V, converged, bound, offers };
}

export type McSolved = Exclude<ReturnType<typeof solveLattice>, { answer: unknown }>;
