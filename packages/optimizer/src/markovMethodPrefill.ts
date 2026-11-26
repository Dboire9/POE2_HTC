// "Start from the best plan": the best plan written as rules a player can read — each rule keeping only
// the tests it needs — that still cost EXACTLY what the best plan costs on this craft.
//
// It starts from one exact rule per state the best plan reaches (`exactly`: every slot, the junk on each
// side, the rarity, the bone), the Otherwise row a start over where the craft can start over. That method
// is the best plan, and reads as a wall of tests. It is then shortened greedily, every step judged against
// the states the method actually REACHES (walked with the check's own semantics, `walkMethod`):
//   • a test is dropped, a junk pair becomes one total, an "= n" becomes "≥ n", a rule is removed — each
//     kept only if, at every state the shortened method reaches, its move is as good as the best plan's
//     (Q*(s, move) ≤ Q*(s, the best move), up to rounding), and the method still finishes from everywhere
//     it goes. A move as good everywhere it goes costs exactly the best plan: by the performance-difference
//     identity the gap is Σ visits × (Q* − V*), each term zero;
//   • a rule no state it reaches picks any more is removed for free.
// Rules stay in the order the best plan first meets their states (white → Magic → Rare), and each rule's
// tests read rarity first, then slots, then counts.
//
// Where two states the best plan treats differently read alike to every rule (`methodFromPlan` says
// when), the exact method already loses there; the shortening may keep that move where the exact method
// plays it, never add a new loss, and the result says it is not faithful.
//
// SPEED (2026-11-26). A five-target T1 Wand's best plan reaches thousands of states, so the exact method
// starts with as many rules, and the shortening tries tens of thousands of steps. Walking each from
// scratch — every reached state reading every rule — took minutes there. A step changes ONE rule (or
// removes one), so the judge (`judge` below) keeps which rule each state picks and works out a step's
// effect from that: a state before the rule keeps its pick, a state after it moves only where the new
// tests hold. A step that changes no reached state's move is kept without a walk; one that loses at a
// changed state it surely still reaches is turned down without one; any other is walked once, reading
// each state's pick in constant time and stopping at the first state it loses. The decisions are the ones
// the full walk made — the same rules come out (`walkingJudge`, the reference, in the tests). >6 min →
// ~1.5 s on that Wand. It is also on a clock: a step kept
// is exact on its own, so where the clock runs out the rules so far are kept and the result says the
// shortening stopped early (`complete`).

import type { McAction } from './markovActions.ts';
import type {
  Condition, Method, MethodPlayer, MethodRule, MoveSpec, Resolved, Unresolved,
} from './markovMethod.ts';
import { actionId, bestMove, exactly, specOf, stuckIn, walkMethod } from './markovMethod.ts';
import { ruleReader, type RuleReader } from './markovMethodReading.ts';
import { tableFrame } from './markovReadout.ts';
import type { McRarity } from './markovState.ts';

export interface MethodSize { readonly rules: number; readonly tests: number }

export interface PrefilledMethod {
  readonly method: Method;
  /**
   * At every state it reaches it plays a move as good as the best plan's, so it costs exactly the best
   * plan. False when two states the plan treats differently read alike to a rule.
   */
  readonly faithful: boolean;
  /** One exact rule per state the best plan reaches, before shortening — and after. */
  readonly before: MethodSize;
  readonly after: MethodSize;
  /**
   * The shortening ran to its end. False when its clock ran out first: the rules are still exact (every
   * step kept was judged), only longer than they could be.
   */
  readonly complete: boolean;
}

export interface PrefillOptions {
  /** The shortening's clock (default `SHORTEN_MILLIS`). */
  readonly maxMillis?: number;
  /** How far the shortening is, 0–1. Called only when the shown percent changes. */
  readonly onProgress?: (fraction: number) => void;
  /**
   * Judge every step by walking its method in full (`walkingJudge`) — the reference the fast judge is
   * tested against, and minutes on a big craft. Never the app's.
   */
  readonly byWalking?: true;
}

/**
 * How long the shortening may take. A guard, not a budget it spends: measured 2026-11-26, the five-target
 * T1 Wand that once took minutes shortens in about a second (engineering-notes, "Check my method").
 */
export const SHORTEN_MILLIS = 8_000;

export const sizeOf = (m: Method): MethodSize => ({ rules: m.rules.length, tests: m.rules.reduce((s, r) => s + r.when.length, 0) });

/** The order tests read in a rule: rarity, then the slots in order, then the counts, then the bone. */
function readingOrder(c: Condition): number {
  switch (c.kind) {
    case 'rarity': return 0;
    case 'slot': return 1 + c.slot / 1000;
    case 'junk': return c.side === 'prefix' ? 2 : c.side === 'suffix' ? 2.1 : 2.2;
    case 'open': return c.side === 'prefix' ? 3 : 3.1;
    case 'bone': return 4;
  }
}

/**
 * The orders the shortening tries tests in, each a rank (lowest dropped first); the shortest result is
 * kept. A greedy pass keeps the first drop that works, so the order decides which tests survive: dropping
 * the counts first keeps slot tests ("Magic, slot 1 there → Regal" three times over), dropping the slots
 * first keeps the counts ("Magic, no junk → Regal" once). Rarity goes last in both: it reads best.
 */
const DROP_ORDERS: readonly ((c: Condition) => number)[] = [
  (c) => -readingOrder(c),
  (c) => (c.kind === 'slot' ? -10 - c.slot / 1000 : -readingOrder(c)),
];

/** At most this many rounds over the rules; a round that changes nothing ends it sooner. */
const ROUNDS = 4;

/** The best plan as short rules, over the craft `pl` plays on (its V* the best plan's values). */
export function methodFromBest(pl: MethodPlayer, opts: PrefillOptions = {}): PrefilledMethod {
  const { craft, V, start } = pl;
  const { problem: p, lattice: l } = craft;
  const frame = tableFrame(p, l);
  const slack = 1e-13 * Math.max(1, Math.abs(V[start]!));
  let bones = false;
  for (let i = 0; i < l.N && !bones; i++) bones = pl.state(i).flagged !== 0;

  // One spec object per move, so the player's cache is shared by every rule and every trial.
  const specs = new Map<string, MoveSpec>();
  const shared = (m: MoveSpec): MoveSpec => {
    const id = JSON.stringify(m);
    const got = specs.get(id);
    if (got) return got;
    specs.set(id, m);
    return m;
  };

  // The best plan's move at a state and the bar a move there must clear: Q* of the best move (V* up to rounding).
  const best = new Map<number, { spec: MoveSpec; res: Resolved; bar: number } | null>();
  const bestAt = (i: number): { spec: MoveSpec; res: Resolved; bar: number } | null => {
    let b = best.get(i);
    if (b !== undefined) return b;
    const a: McAction = bestMove(l.compiled[i]!, pl.valuer);
    const spec = specOf(frame, a);
    const res = spec ? pl.play(i, shared(spec)) : undefined;
    b = spec && res && 'q' in res ? { spec: shared(spec), res, bar: Math.max(V[i]!, res.q) + slack } : null;
    best.set(i, b);
    return b;
  };

  // The best plan's own walk: the states it reaches, in the order it first meets them.
  const reached: number[] = [start];
  const seen = new Uint8Array(l.N);
  seen[start] = 1;
  for (let k = 0; k < reached.length; k++) {
    const i = reached[k]!;
    if (l.isGoalIdx[i] === 1) continue;
    for (const j of bestAt(i)?.res.to ?? []) if (seen[j] === 0) { seen[j] = 1; reached.push(j); }
  }

  let otherwise: MoveSpec;
  if (l.canRestart) otherwise = shared({ currency: 'restart' });
  else {
    const counts = new Map<MoveSpec, number>();
    for (const i of reached) { const b = l.isGoalIdx[i] === 1 ? null : bestAt(i); if (b) counts.set(b.spec, (counts.get(b.spec) ?? 0) + 1); }
    otherwise = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? shared({ currency: 'chaos' });
  }
  const goodHere = (i: number, mv: Resolved | Unresolved | undefined): boolean => {
    const b = bestAt(i);
    return b !== null && mv !== undefined && 'q' in mv && mv.q <= b.bar;
  };

  // The exact method: a rule for each state the best plan reaches where it plays anything but Otherwise.
  // Not "where Otherwise does as well": with a free base, starting over at the white base ties the best
  // move on Q* and goes nowhere — the shortening below rejects such loops, but its start must finish.
  const exact: MethodRule[] = [];
  const named = new Set<string>();
  for (const i of reached) {
    if (l.isGoalIdx[i] === 1) continue;
    const b = bestAt(i);
    if (!b || b.spec === otherwise) continue;
    const when = exactly(pl.state(i), pl.frame, bones);
    const id = JSON.stringify(when);
    if (named.has(id)) continue; // reads like an earlier state: that rule plays here (not faithful)
    named.add(id);
    exact.push({ when, move: b.spec });
  }
  const before: Method = { rules: exact, otherwise };

  const w0 = walkMethod(pl, before);
  if (w0.stop || stuckIn(pl, w0)) {
    return { method: before, faithful: false, before: sizeOf(before), after: sizeOf(before), complete: true };
  }
  // Where the exact method itself loses (states that read alike), its move there is kept as allowed.
  const kept = new Map<number, string>();
  for (const i of w0.order) {
    const mv = w0.moves[i];
    if (mv && !goodHere(i, mv)) kept.set(i, actionId(mv.action));
  }
  /** A move the shortened method may play at `i`: as good as the best plan's, or the exact method's own there. */
  const verdicts = new WeakMap<Resolved, boolean>();
  const allowed = (i: number, mv: Resolved): boolean => {
    let v = verdicts.get(mv);
    if (v === undefined) {
      v = goodHere(i, mv) || kept.get(i) === actionId(mv.action);
      verdicts.set(mv, v);
    }
    return v;
  };

  const read = ruleReader(pl);
  const clock = Date.now() + (opts.maxMillis ?? SHORTEN_MILLIS);
  let complete = true;
  const outOfTime = (): boolean => {
    if (complete && Date.now() > clock) complete = false;
    return !complete;
  };
  let shown = -1;
  const progress = (f: number): void => {
    const pct = Math.round(Math.min(1, Math.max(0, f)) * 100);
    if (pct > shown && opts.onProgress) { shown = pct; opts.onProgress(pct / 100); }
  };

  const makeJudge = (from: readonly MethodRule[]): Judge => (opts.byWalking
    ? walkingJudge(pl, otherwise, allowed, from)
    : judge(pl, read, otherwise, allowed, from));
  const start0 = used(exact, w0.order.map((i) => w0.rules[i]));
  // The exact rules until an order has run: a clock that runs out first leaves them, still the best plan.
  let rules: MethodRule[] = start0;
  let size = Infinity;
  DROP_ORDERS.forEach((order, o) => {
    if (outOfTime()) return;
    const j = makeJudge(start0);
    const got = shorten(j, order, outOfTime, (f) => { progress((o + f) / (DROP_ORDERS.length + 0.25)); });
    const n = got.reduce((s, r) => s + r.when.length, 0) * 1000 + got.length;
    if (n < size) { size = n; rules = got; }
  });
  // The rarity a rule's move works on, said on the rule — "Magic, no junk → Regal", not "no junk → Regal",
  // which is right only because an earlier rule catches every Rare. It changes no state the method reaches:
  // the move could not be played at a state of another rarity, so none such picks the rule (still judged).
  if (!outOfTime()) {
    const j = makeJudge(rules);
    for (let r = 0; r < j.rules.length && !outOfTime(); r++) {
      const rule = j.rules[r]!;
      const needs = rarityFor(rule.move);
      if (!needs || rule.when.some((c) => c.kind === 'rarity')) continue;
      j.attempt({ kind: 'replace', r, when: [{ kind: 'rarity', is: needs }, ...rule.when], wider: false }, j.rules.length);
    }
    rules = [...j.rules];
  }
  progress(1);

  const method: Method = {
    rules: rules.map((r) => ({ when: [...r.when].sort((a, b) => readingOrder(a) - readingOrder(b)), move: r.move })),
    otherwise,
  };
  const w = walkMethod(pl, method);
  const faithful = !w.stop && w.order.every((i) => l.isGoalIdx[i] === 1 || goodHere(i, w.moves[i]));
  return { method, faithful, before: sizeOf(before), after: sizeOf(method), complete };
}

/** The one rarity a move works on, where it has one (the action space's gates; an Essence works on two). */
function rarityFor(m: MoveSpec): McRarity | undefined {
  switch (m.currency) {
    case 'transmute': return 'normal';
    case 'augment': case 'regal': return 'magic';
    case 'exalt': case 'chaos': case 'desecrate': case 'perfect-essence': return 'rare';
    default: return undefined;
  }
}

/**
 * Rules no state the walk reaches picks (`picks`: the rule each reached state picks), from rule `from` on —
 * removed for free. Rules before `from` stay where they are, so a caller working on rule `from − 1` keeps
 * its index.
 */
function used(rules: readonly MethodRule[], picks: Iterable<number | 'otherwise' | undefined>, from = 0): MethodRule[] {
  const picked = new Set<number>();
  for (const r of picks) if (typeof r === 'number') picked.add(r);
  return rules.filter((_, r) => r < from || picked.has(r));
}

/**
 * One step the shortening tries: rule `r` with other tests, or without rule `r`. `wider`: the new tests
 * hold wherever the old ones did (a test dropped, a junk pair as one total, "= n" as "≥ n").
 */
export type Step =
  | { readonly kind: 'replace'; readonly r: number; readonly when: readonly Condition[]; readonly wider: boolean }
  | { readonly kind: 'remove'; readonly r: number };

/** The current rules, and a step tried on them: kept when the method it gives is as good everywhere it goes. */
export interface Judge {
  readonly rules: readonly MethodRule[];
  /** Keep `step` when it is as good everywhere it goes (then drop rules from `keepBefore` on that nothing picks). */
  attempt(step: Step, keepBefore: number): boolean;
  /** Drop every rule nothing picks. */
  prune(): void;
}

/** Which rule a state picks: an index into the rules, or the Otherwise row. */
const OTHER = 0x7fffffff;
const UNKNOWN = -1;

/** One spelling per test, so a test's states are worked out once. */
const testKey = (c: Condition): string => {
  switch (c.kind) {
    case 'slot': return `s${c.slot}${c.is}`;
    case 'junk': case 'open': return `${c.kind}${c.side}${c.op}${c.n}`;
    case 'rarity': return `r${c.is}`;
    case 'bone': return `b${c.is}`;
  }
};

/**
 * The shortening's judge over `from`, whose walk passes: `allowed` says whether a move is good enough at a
 * state. Its decisions are those of walking each step's method in full (`walkMethod`, then every reached
 * move allowed and `stuckIn` clear), found faster:
 *   • which rule each state picks is kept, and a step's effect read off it (`pickAfter`): a state before
 *     the rule keeps its pick, a state after it moves only where the new tests hold;
 *   • the states a step changes are found first — for a wider rule, among the reached states every one
 *     of its tests holds at (one bit set per test over the walk) — and a step that changes none leaves the
 *     walk as it was, already judged;
 *   • a changed state none of whose ancestors on the walk (the breadth-first tree) changed is still reached
 *     after the step, so a move there it may not play rejects the step without a walk;
 *   • anything else is walked, each state's pick read in constant time, stopping at the first move it may
 *     not play.
 */
export function judge(
  pl: MethodPlayer, read: RuleReader, otherwise: MoveSpec, allowed: (i: number, mv: Resolved) => boolean,
  from: readonly MethodRule[],
): Judge {
  const { N, isGoalIdx } = pl.craft.lattice;
  let rules: MethodRule[] = [...from];
  /** The rule each state picks under `rules`, worked out when first asked. */
  const pick = new Int32Array(N).fill(UNKNOWN);
  const firstFrom = (i: number, r0: number): number => {
    for (let r = r0; r < rules.length; r++) if (read(rules[r]!.when, i)) return r;
    return OTHER;
  };
  const pickOf = (i: number): number => {
    let r = pick[i]!;
    if (r === UNKNOWN) { r = firstFrom(i, 0); pick[i] = r; }
    return r;
  };
  /** What state `i` picks once `step` is taken: an index into the rules after it. */
  const pickAfter = (i: number, step: Step): number => {
    const a = pickOf(i);
    if (a < step.r) return a;
    if (step.kind === 'replace') {
      if (read(step.when, i)) return step.r;
      return a === step.r ? firstFrom(i, step.r + 1) : a;
    }
    // Without rule r, every later rule moves up one.
    const b = a === step.r ? firstFrom(i, step.r + 1) : a;
    return b === OTHER ? OTHER : b - 1;
  };
  const rulesAfter = (step: Step): MethodRule[] => (step.kind === 'replace'
    ? rules.map((x, k) => (k === step.r ? { when: step.when, move: x.move } : x))
    : rules.filter((_, k) => k !== step.r));
  const moveOf = (rs: readonly MethodRule[], r: number): MoveSpec => (r === OTHER ? otherwise : rs[r]!.move);

  // The current method's walk: the states it reaches in breadth-first order, where each sits in it
  // (`at`, −1 off it), the state it was first reached from, and the move each plays — one object per
  // state and move (`play` caches them), so "another move" is an identity test.
  let reached: number[] = [];
  const at = new Int32Array(N).fill(-1);
  const parent = new Int32Array(N).fill(-1);
  const moveAt = new Array<Resolved | undefined>(N);
  const walkAgain = (): void => {
    for (const i of reached) at[i] = -1;
    reached = [pl.start];
    at[pl.start] = 0;
    for (let k = 0; k < reached.length; k++) {
      const i = reached[k]!;
      if (isGoalIdx[i] === 1) continue;
      const mv = moveAt[i]!;
      for (const j of mv.to) if (at[j]! < 0) { at[j] = reached.length; parent[j] = i; reached.push(j); }
    }
  };
  {
    // The start's walk, its moves worked out (it passes: the caller's).
    const queue = [pl.start];
    const seen = new Uint8Array(N);
    seen[pl.start] = 1;
    for (let k = 0; k < queue.length; k++) {
      const i = queue[k]!;
      if (isGoalIdx[i] === 1) continue;
      const mv = pl.play(i, moveOf(rules, pickOf(i)));
      if (!('q' in mv)) throw new Error('the shortening starts from a method it cannot play');
      moveAt[i] = mv;
      for (const j of mv.to) if (seen[j] === 0) { seen[j] = 1; queue.push(j); }
    }
    walkAgain();
  }

  // The reached states each test holds at, one bit per place in the walk — until the walk changes.
  let bits = new Map<string, Uint32Array>();
  const one = new Map<string, readonly Condition[]>();
  const holdsAt = (c: Condition): Uint32Array => {
    const key = testKey(c);
    let b = bits.get(key);
    if (b) return b;
    let single = one.get(key);
    if (!single) { single = [c]; one.set(key, single); }
    b = new Uint32Array((reached.length + 31) >>> 5);
    for (let k = 0; k < reached.length; k++) if (read(single, reached[k]!)) b[k >>> 5]! |= 1 << (k & 31);
    bits.set(key, b);
    return b;
  };

  /** The reached states `step` gives another move, in walk order (an Unresolved move counts as another). */
  const changedBy = (step: Step, next: readonly MethodRule[]): number[] => {
    const out: number[] = [];
    const differs = (i: number, r: number): void => {
      const spec = moveOf(next, r);
      if (spec !== moveOf(rules, pickOf(i)) && pl.play(i, spec) !== moveAt[i]) out.push(i);
    };
    if (step.kind === 'replace' && step.wider) {
      // Only a state after rule r where every new test holds can move — to rule r.
      if (step.when.length === 0) {
        for (const i of reached) if (isGoalIdx[i] !== 1 && pickOf(i) > step.r) differs(i, step.r);
        return out;
      }
      const sets = step.when.map(holdsAt);
      for (let w = 0; w < sets[0]!.length; w++) {
        let word = sets[0]![w]!;
        for (let t = 1; t < sets.length && word !== 0; t++) word &= sets[t]![w]!;
        while (word !== 0) {
          const low = word & -word;
          const k = (w << 5) + 31 - Math.clz32(low);
          word ^= low;
          const i = reached[k]!;
          if (isGoalIdx[i] !== 1 && pickOf(i) > step.r) differs(i, step.r);
        }
      }
      return out;
    }
    for (const i of reached) {
      if (isGoalIdx[i] === 1 || pickOf(i) < step.r) continue;
      differs(i, pickAfter(i, step));
    }
    return out;
  };

  // Scratch for a step's walk.
  const stamp = new Int32Array(N);
  let epoch = 0;
  const tOrder = new Int32Array(N);
  const tMove = new Array<Resolved | undefined>(N);
  const isChanged = new Uint8Array(N);

  /** Take `step`: every state's pick moves to the rules after it, then rules from `keepBefore` on that no reached state picks go. */
  const commit = (step: Step, keepBefore: number): void => {
    const next = rulesAfter(step);
    // A state before rule r keeps its pick; `pickAfter` reads only the state's own pick and the old rules.
    for (let i = 0; i < N; i++) if (pick[i] !== UNKNOWN && pick[i]! >= step.r) pick[i] = pickAfter(i, step);
    rules = next;
    prune(keepBefore);
  };
  /** Drop the rules from `keepBefore` on that no reached state picks. */
  const prune = (keepBefore: number): void => {
    const picked = new Uint8Array(rules.length);
    for (const i of reached) if (isGoalIdx[i] !== 1) { const r = pickOf(i); if (r !== OTHER) picked[r] = 1; }
    const to = new Int32Array(rules.length);
    const kept: MethodRule[] = [];
    rules.forEach((x, r) => {
      if (r < keepBefore || picked[r] === 1) { to[r] = kept.length; kept.push(x); } else to[r] = UNKNOWN;
    });
    if (kept.length === rules.length) return;
    // A rule nothing reached picks goes; a state that picked it is worked out again when next asked.
    for (let i = 0; i < N; i++) if (pick[i] !== UNKNOWN && pick[i] !== OTHER) pick[i] = to[pick[i]!]!;
    rules = kept;
  };

  const attempt = (step: Step, keepBefore: number): boolean => {
    const next = rulesAfter(step);
    const changed = changedBy(step, next);
    // No reached state plays another move: the walk is the one already judged.
    if (changed.length === 0) { commit(step, keepBefore); return true; }
    // A changed state whose ancestors on the walk all kept their moves is still reached.
    for (const d of changed) isChanged[d] = 1;
    let lost = false;
    for (const d of changed) {
      let sure = true;
      for (let u = d; u !== pl.start && sure; u = parent[u]!) if (u !== d && isChanged[u] === 1) sure = false;
      if (pl.start !== d && isChanged[pl.start] === 1) sure = false;
      if (!sure) continue;
      const mv = pl.play(d, moveOf(next, pickAfter(d, step)));
      if (!('q' in mv) || !allowed(d, mv)) { lost = true; break; }
    }
    for (const d of changed) isChanged[d] = 0;
    if (lost) return false;
    // Walk it, each state's pick read off the one before, stopping at the first move it may not play.
    epoch++;
    let len = 0;
    tOrder[len++] = pl.start;
    stamp[pl.start] = epoch;
    for (let k = 0; k < len; k++) {
      const i = tOrder[k]!;
      if (isGoalIdx[i] === 1) continue;
      const mv = pl.play(i, moveOf(next, pickAfter(i, step)));
      if (!('q' in mv) || !allowed(i, mv)) return false;
      tMove[i] = mv;
      for (const j of mv.to) if (stamp[j] !== epoch) { stamp[j] = epoch; tOrder[len++] = j; }
    }
    const walked = Array.from(tOrder.subarray(0, len));
    // The finish test reads only the moves along the walk.
    if (stuckIn(pl, { moves: tMove, rules: [], order: walked })) return false;
    for (const i of walked) moveAt[i] = isGoalIdx[i] === 1 ? undefined : tMove[i];
    walkAgain();
    bits = new Map();
    commit(step, keepBefore);
    return true;
  };

  return {
    get rules() { return rules; },
    attempt,
    prune: () => { prune(0); },
  };
}

/**
 * The judge as the shortening was first written: each step's method walked in full from the start
 * (`walkMethod`), then every move it plays allowed and `stuckIn` clear. The fast `judge` must agree.
 */
export function walkingJudge(
  pl: MethodPlayer, otherwise: MoveSpec, allowed: (i: number, mv: Resolved) => boolean, from: readonly MethodRule[],
): Judge {
  let rules: MethodRule[] = [...from];
  const tryRules = (rs: readonly MethodRule[]): ReturnType<typeof walkMethod> | undefined => {
    const w = walkMethod(pl, { rules: rs, otherwise });
    if (w.stop) return undefined;
    for (const i of w.order) { const mv = w.moves[i]; if (mv && !allowed(i, mv)) return undefined; }
    return stuckIn(pl, w) ? undefined : w;
  };
  const picks = (w: ReturnType<typeof walkMethod>) => w.order.map((i) => w.rules[i]);
  return {
    get rules() { return rules; },
    attempt: (step, keepBefore) => {
      const next = step.kind === 'replace'
        ? rules.map((x, k) => (k === step.r ? { when: step.when, move: x.move } : x))
        : rules.filter((_, k) => k !== step.r);
      const w = tryRules(next);
      if (!w) return false;
      rules = used(next, picks(w), keepBefore);
      return true;
    },
    prune: () => { const w = tryRules(rules); if (w) rules = used(rules, picks(w)); },
  };
}

/** The greedy shortening (see the top of this file): `j` judges each step; tests tried in `dropOrder`. */
function shorten(
  j: Judge, dropOrder: (c: Condition) => number, outOfTime: () => boolean, progress: (fraction: number) => void,
): MethodRule[] {
  for (let round = 0, changed = true; round < ROUNDS && changed && !outOfTime(); round++) {
    changed = false;
    for (let r = 0; r < j.rules.length && !outOfTime(); r++) {
      progress((round + r / j.rules.length / 2) / ROUNDS);
      const rule = j.rules[r]!;
      // The junk on each side, as one total.
      const pre = rule.when.find((c) => c.kind === 'junk' && c.side === 'prefix' && c.op === '=');
      const suf = rule.when.find((c) => c.kind === 'junk' && c.side === 'suffix' && c.op === '=');
      if (pre?.kind === 'junk' && suf?.kind === 'junk') {
        const total: Condition = { kind: 'junk', side: 'total', op: '=', n: pre.n + suf.n };
        const when = [...rule.when.filter((c) => c !== pre && c !== suf), total];
        if (j.attempt({ kind: 'replace', r, when, wider: true }, r + 1)) changed = true;
      }
      // Each test it can do without.
      for (const c of [...j.rules[r]!.when].sort((a, b) => dropOrder(a) - dropOrder(b))) {
        if (outOfTime()) break;
        if (j.attempt({ kind: 'replace', r, when: j.rules[r]!.when.filter((x) => x !== c), wider: true }, r + 1)) changed = true;
      }
      // A count "= n" that can be "≥ n" — wider, so later rules may fall away.
      for (const c of j.rules[r]!.when) {
        if ((c.kind !== 'junk' && c.kind !== 'open') || c.op !== '=' || c.n < 1 || outOfTime()) continue;
        const when = j.rules[r]!.when.map((x) => (x === c ? { ...c, op: '>=' as const } : x));
        if (j.attempt({ kind: 'replace', r, when, wider: true }, r + 1)) changed = true;
      }
    }
    // Whole rules the others cover, the last first.
    const n = j.rules.length;
    for (let r = j.rules.length - 1; r >= 0 && !outOfTime(); r--) {
      progress((round + 0.5 + (n - r) / n / 2) / ROUNDS);
      if (j.attempt({ kind: 'remove', r }, r)) changed = true;
    }
    j.prune();
  }
  return [...j.rules];
}
