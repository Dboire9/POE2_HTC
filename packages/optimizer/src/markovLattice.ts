// The true-cost solve, phase 2 of 4: the LATTICE. Every state the craft can occupy, which of them finish
// it, every action from each with its outcomes compiled to dense arrays, and which states can reach a goal
// at all. Split out of markovFromItem.ts unchanged (2026-11-12); see that file's header.

import { bossOmenAllowed } from '../../engine/src/probability.ts';
import type { ActionDef } from './markovActions.ts';
import { createActionSpace } from './markovActions.ts';
import type { McRarity, StateKey } from './markovState.ts';
import { FLAG_NONE, bit, decodeState, enumerateStates, isAccepting, popcount } from './markovState.ts';
import type { MarkovOptions } from './markovFromItem.ts';
import type { McProblem, Refuse } from './markovProblem.ts';

/** How often the O(states) loops report. Frequent enough to animate, rare enough to cost nothing. */
const PROGRESS_STRIDE = 64;

/** One action, ready for the solver: its self-loop hoisted out and outcomes as parallel arrays. */
export interface CompiledAction {
  readonly def: ActionDef;
  readonly cost: number;
  /** P(this action leaves the state unchanged) — divided out rather than iterated. */
  readonly selfProb: number;
  /** Destination indices, self-loop EXCLUDED — its probability lives in `selfProb`.
   *  For an OFFER action nothing is hoisted: see `offer`. */
  readonly to: Int32Array;
  readonly prob: Float64Array;
  /** "Bin it and buy another base" — the one action phase A of the solve leaves out. */
  readonly isRestart: boolean;
  /** Draws shown to the player, of which they keep the best; 1 for an ordinary action. See `valueOf`. */
  readonly offer: number;
  /** What throwing the whole offer back once costs — an Omen of Abyssal Echoes, spent only on the
   *  throw. Infinity for an offer with no reroll, and for every ordinary action. */
  readonly rerollCost: number;
  /** An offer's outcomes, KEPT sorted by V between calls, so re-sorting is near-linear. Empty otherwise. */
  readonly order: Int32Array;
}

export function buildLattice(p: McProblem, opts: MarkovOptions, fail: Refuse) {
  const {
    data, start, prices, level, limits, spare, pools, list, n, slotMasks, siblings, desecratedBit, conflicts, side,
    fillCostOf, encode, onlyCanonical, restartKey, desecratable,
  } = p;
  const { actionsOf } = createActionSpace({
    data, prices, level, pools, list, side, desecratable, encode, limits, siblings,
    junkFamilies: opts.junkFamilies !== false,
    bossTargetable: bossOmenAllowed(start.base.category),
    ...(opts.policy ? { policy: opts.policy } : {}),
    ...(opts.restartCost === undefined
      ? {}
      : { restart: { cost: opts.restartCost, dist: new Map([[restartKey, 1]]) } }),
  });

  // Only enumerate the rarities the craft can actually occupy. A from-item craft is Rare throughout,
  // so it keeps exactly the state space (and solve time) it had before rarity existed; a craft that
  // starts lower has to carry the rungs it climbs through.
  const rarities: McRarity[] = start.rarity === 'rare' ? ['rare']
    : start.rarity === 'magic' ? ['magic', 'rare']
    : ['normal', 'magic', 'rare'];
  const allStates = enumerateStates(n, side, desecratable, rarities, conflicts, onlyCanonical, limits);

  /*
   * The goal states — found by TESTING the lattice, not by naming keys.
   *
   * This used to construct `present === (1<<n)-1` directly and add one key per value of the flag axis
   * (a finished item is finished whether or not a Desecration placed one of its mods; keying only
   * FLAG_NONE once left bone-ending crafts with no terminal to work back from, and VI ground through
   * its whole budget on a problem with no fixed point).
   *
   * Naming keys cannot express slot alternatives. With `slot 3 = {Cold, Lightning, Chaos}` the state
   * holding all three has four prefixes, so `enumerateStates` never emits it — the old goal named a
   * state that does not exist while missing every state that actually finishes the craft, and the
   * solve reported the target unreachable. Filtering the lattice instead has both properties for free:
   * it can only ever name states that exist, and it accepts any one member per slot.
   *
   * `isAccepting` still demands zero blocked and Rare, and no more junk than `spare` allows, so this is
   * the same standard of "finished" as before — with every slot a singleton and no free slots it
   * reproduces the old set exactly, which the test suite asserts against a from-white craft.
   */
  // A state holding TWO carved targets is never a goal, though it is in the lattice. No action reaches it
  // (a bone needs an item with no bone-placed mod, and a carved mod only arrives by bone — see above),
  // but the goal box is DRAWN from the first finished state below, and on a two-slot carved craft that
  // was this impossible item: `never finishes on an item holding two carved mods` caught it once the
  // free orbs it had been routing through stopped being free (TODO 12d). Excluding it from the goal set
  // moves no reachable value, and makes the game rule hold in the state space rather than on one path.
  const carvedMask = list.reduce((m, _, i) => (desecratedBit(i) ? m | bit(i) : m), 0);
  const goalKeys = new Set<StateKey>();
  for (const k of allStates) {
    const st = decodeState(k);
    if (popcount(st.present & carvedMask) > 1) continue;
    if (isAccepting(st, slotMasks, spare, siblings.obstacles)) goalKeys.add(k);
  }
  if (goalKeys.size === 0) return fail('no legal item satisfies every slot of this target');
  // The canonical goal for DISPLAY: the *barest* finished item — the one that fills each slot once and
  // carries nothing more. `allStates` is enumerated present-ascending with FLAG_NONE first, which used
  // to make the first FLAG_NONE hit that item by itself. Free slots break that: they admit goal states
  // holding junk, and those sort no later than the clean one, so the empty junk fields are now asked for
  // rather than relied upon. A junk-carrying goal is a perfectly good place to STOP — it just isn't the
  // one to draw as "the item you're aiming at".
  const bareGoal = (k: StateKey): boolean => {
    const s = decodeState(k);
    return s.flagged === FLAG_NONE && s.jp === 0 && s.js === 0;
  };
  const keys = [...goalKeys];
  const goalKey = keys.find(bareGoal) ?? keys.find((k) => decodeState(k).flagged === FLAG_NONE) ?? keys[0]!;
  // The dominant cost of the whole solve: one full action set, with its outcome distribution, per
  // state. `allStates.length` is known before the loop, so progress here is genuinely linear.
  const report = opts.onProgress;
  const actionCache = new Map<StateKey, ActionDef[]>();
  for (let i = 0; i < allStates.length; i++) {
    const key = allStates[i]!;
    actionCache.set(key, goalKeys.has(key) ? [] : actionsOf(decodeState(key)));
    if (report && i % PROGRESS_STRIDE === 0) report({ phase: 'actions', done: i, total: allStates.length });
  }
  report?.({ phase: 'actions', done: allStates.length, total: allStates.length });

  // ── Compile the lattice to dense numeric arrays ─────────────────────────────
  // Value iteration is arithmetic, but the natural representation (string StateKeys in Maps) makes it
  // arithmetic *through a hash table*: at 6 targets the inner loop did ~3.5 BILLION string-keyed Map
  // lookups and took ~51s. Compiling once to integer indices + typed arrays makes the loop pure
  // indexed maths. Entry order is preserved exactly as the Maps iterated (insertion order), so the
  // floating-point sums are bit-identical to the Map version — the speedup is free of behaviour.
  const idxOfState = new Map<StateKey, number>();
  for (let i = 0; i < allStates.length; i++) idxOfState.set(allStates[i]!, i);
  const N = allStates.length;

  const compiled: CompiledAction[][] = new Array<CompiledAction[]>(N);
  const NO_ORDER = new Int32Array(0);
  let cheapestAction = Infinity;
  let widestOffer = 0; // biggest outcome count among offer actions, to size the sort scratch once
  for (let i = 0; i < N; i++) {
    const key = allStates[i]!;
    const defs = actionCache.get(key)!;
    const out: CompiledAction[] = [];
    for (const def of defs) {
      const offer = def.offer ?? 1;
      const isRestartAction = def.action.currency === 'restart';
      const to: number[] = [];
      const prob: number[] = [];
      let selfProb = 0;
      for (const [toKey, p] of def.dist) {
        // The self-loop is hoisted out and divided away — but only for a single-draw action, where
        // "the state did not change" is a fixed probability. Under an offer it is whichever share of
        // the offers the player would keep, which moves with V, so there is nothing constant to hoist.
        if (toKey === key && offer === 1) { selfProb += p; continue; }
        const toIdx = idxOfState.get(toKey);
        // The lattice must be CLOSED under the action space. It always was, but the assertion was a
        // `!` — and `Int32Array.from([undefined])` is 0, so an action escaping the lattice would have
        // silently rewired itself to state 0 and quietly changed the answer. That became worth
        // guarding once `enumerateStates` started PRUNING states (mutually-exclusive families): the
        // pruning is only sound because no action can reach what it removes, and this is what makes
        // that claim fail loudly instead of invisibly.
        //
        // It now guards a second, sharper claim. CANONICALISATION keeps one spelling of each
        // interchangeable arrangement and drops the rest, so `canonicalFilterFor` (which decides what
        // the lattice holds) and `encoderFor` (which decides where an outcome points) must agree
        // exactly. They are built from the same function for that reason — and if they ever stop
        // agreeing, the very next outcome lands here rather than on a state that merely looks fine.
        if (toIdx === undefined) {
          return fail(`internal: ${def.action.currency} from ${key} leads to ${toKey}, which is not in the lattice`);
        }
        to.push(toIdx);
        prob.push(p);
      }
      if (to.length > widestOffer && offer > 1) widestOffer = to.length;
      out.push({
        def, cost: def.cost, selfProb, offer, rerollCost: def.reroll?.cost ?? Infinity, isRestart: def.action.currency === 'restart',
        to: Int32Array.from(to), prob: Float64Array.from(prob),
        order: offer > 1 ? Int32Array.from(to, (_, j) => j) : NO_ORDER,
      });
      // The cheapest thing the craft can do, restart excluded — it sets both the default tolerance and
      // the factor that repairs the seed. Restart is left out because it is not in phase A, and because
      // a white base is free: a zero would make both meaningless.
      if (!isRestartAction && def.cost > 0 && def.cost < cheapestAction) cheapestAction = def.cost;
    }
    compiled[i] = out;
    if (report && i % PROGRESS_STRIDE === 0) report({ phase: 'compile', done: i, total: N });
  }
  report?.({ phase: 'compile', done: N, total: N });

  // ── Can the goal actually be reached? ───────────────────────────────────────
  // Computed BEFORE value iteration, because VI cannot discover it and is actively harmed by it. A
  // state with no route to the goal has no finite value, but nothing stops VI backing one up: each
  // sweep adds another action's cost, so its V climbs without bound. That never settles, `delta` never
  // falls under `tolerance`, and the solve reports `converged: false` however long it runs — measured
  // on a 2-target armour craft as E growing 11.4M → 113.6M ex when the sweep cap rose 10x. The start's
  // own value had stabilised the whole time; the flag was being poisoned by states the answer does not
  // depend on. Dead states are pinned at Infinity instead, which is both true and useful: an action
  // with any chance of landing in one is then correctly worth Infinity.
  //
  // "Reaches" means ALMOST SURELY, not "with some chance". The weaker reading is only adequate while
  // every action can be retried — a one-in-a-million shot you may take again forever still has a
  // finite expected cost. This is the standard Prob1 fixpoint: shrink the candidate set S until every
  // state in it can reach the goal without any action escaping S.
  //
  // Computed TWICE, because the two solve phases have different action sets and so different dead
  // ends. Phase A runs push-forward only; a state only a restart can rescue is Infinity to phase A,
  // and it must know that or it grinds its budget converging on a value with no finite limit.
  const isGoalIdx = new Uint8Array(N); // a flag rather than a Set: this is read in the innermost loop
  /** A goal's value is what finishing there costs — 0 unless `fillOnFinish`. Every solve below seeds it. */
  const finishCost = new Float64Array(N);
  for (const k of goalKeys) {
    const gi = idxOfState.get(k);
    if (gi !== undefined) { isGoalIdx[gi] = 1; finishCost[gi] = fillCostOf(decodeState(k)); }
  }
  const prob1 = (withRestart: boolean): Uint8Array => {
    const inS = new Uint8Array(N).fill(1);
    const reachable = new Uint8Array(N);
    for (let round = 0; round < N; round++) {
      reachable.fill(0);
      for (let i = 0; i < N; i++) if (isGoalIdx[i] === 1 && inS[i] === 1) reachable[i] = 1;
      for (let changed = true; changed;) {
        changed = false;
        for (let i = 0; i < N; i++) {
          if (reachable[i] === 1 || inS[i] !== 1) continue;
          for (const act of compiled[i]!) {
            if (act.isRestart && !withRestart) continue;
            let escapes = false;
            let touches = false;
            for (let j = 0; j < act.to.length; j++) {
              const to = act.to[j]!;
              if (inS[to] !== 1) { escapes = true; break; }
              if (reachable[to] === 1) touches = true;
            }
            // Every outcome stays inside S, and at least one of them already reaches the goal.
            if (!escapes && touches) { reachable[i] = 1; changed = true; break; }
          }
        }
      }
      let shrank = false;
      for (let i = 0; i < N; i++) {
        if (inS[i] === 1 && reachable[i] !== 1) { inS[i] = 0; shrank = true; }
      }
      if (!shrank) break;
    }
    return inS;
  };
  const canRestart = opts.restartCost !== undefined;
  const canReachPushForward = prob1(false);
  const canReach = canRestart ? prob1(true) : canReachPushForward;

  return {
    rarities, allStates, goalKeys, goalKey, idxOfState, N, compiled, cheapestAction, widestOffer,
    isGoalIdx, finishCost, canRestart, canReachPushForward, canReach,
  };
}

export type McLattice = Exclude<ReturnType<typeof buildLattice>, { answer: unknown }>;
