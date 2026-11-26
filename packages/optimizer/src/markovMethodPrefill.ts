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

import type { McAction } from './markovActions.ts';
import type {
  Condition, Method, MethodPlayer, MethodRule, MethodWalk, MoveSpec, Resolved, Unresolved,
} from './markovMethod.ts';
import { actionId, bestMove, exactly, specOf, stuckIn, walkMethod } from './markovMethod.ts';
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
}

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
export function methodFromBest(pl: MethodPlayer): PrefilledMethod {
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
  if (w0.stop || stuckIn(pl, w0)) return { method: before, faithful: false, before: sizeOf(before), after: sizeOf(before) };
  // Where the exact method itself loses (states that read alike), its move there is kept as allowed.
  const kept = new Map<number, string>();
  for (const i of w0.order) {
    const mv = w0.moves[i];
    if (mv && !goodHere(i, mv)) kept.set(i, actionId(mv.action));
  }

  /** The walk of `rules` when every state it reaches plays a move as good as the exact method's, and it finishes. */
  const tryRules = (rules: readonly MethodRule[]): MethodWalk | undefined => {
    const w = walkMethod(pl, { rules, otherwise });
    if (w.stop) return undefined;
    for (const i of w.order) {
      const mv = w.moves[i];
      if (!mv || goodHere(i, mv)) continue;
      if (kept.get(i) !== actionId(mv.action)) return undefined;
    }
    return stuckIn(pl, w) ? undefined : w;
  };
  let rules: MethodRule[] = [];
  let size = Infinity;
  for (const order of DROP_ORDERS) {
    const got = shorten(used(exact, w0), tryRules, order);
    const n = got.reduce((s, r) => s + r.when.length, 0) * 1000 + got.length;
    if (n < size) { size = n; rules = got; }
  }
  // The rarity a rule's move works on, said on the rule — "Magic, no junk → Regal", not "no junk → Regal",
  // which is right only because an earlier rule catches every Rare. It changes no state the method reaches:
  // the move could not be played at a state of another rarity, so none such picks the rule (still judged).
  for (let r = 0; r < rules.length; r++) {
    const needs = rarityFor(rules[r]!.move);
    if (!needs || rules[r]!.when.some((c) => c.kind === 'rarity')) continue;
    const next = rules.map((x, k) => (k === r ? { when: [{ kind: 'rarity', is: needs } as const, ...x.when], move: x.move } : x));
    if (tryRules(next)) rules = next;
  }

  const method: Method = {
    rules: rules.map((r) => ({ when: [...r.when].sort((a, b) => readingOrder(a) - readingOrder(b)), move: r.move })),
    otherwise,
  };
  const w = walkMethod(pl, method);
  const faithful = !w.stop && w.order.every((i) => l.isGoalIdx[i] === 1 || goodHere(i, w.moves[i]));
  return { method, faithful, before: sizeOf(before), after: sizeOf(method) };
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
 * Rules no state the walk reaches picks, from rule `from` on — removed for free. Rules before `from` stay
 * where they are, so a caller working on rule `from − 1` keeps its index.
 */
function used(rules: readonly MethodRule[], w: MethodWalk, from = 0): MethodRule[] {
  const picked = new Set<number>();
  for (const i of w.order) { const r = w.rules[i]; if (typeof r === 'number') picked.add(r); }
  return rules.filter((_, r) => r < from || picked.has(r));
}

/** The greedy shortening (see the top of this file): `tryRules` judges each step; tests tried in `dropOrder`. */
function shorten(
  from: readonly MethodRule[], tryRules: (rules: readonly MethodRule[]) => MethodWalk | undefined,
  dropOrder: (c: Condition) => number,
): MethodRule[] {
  let rules = [...from];
  /** Keep `next` when it is as good everywhere it goes; returns whether it was kept. */
  const attempt = (next: MethodRule[], keepBefore: number): boolean => {
    const w = tryRules(next);
    if (!w) return false;
    rules = used(next, w, keepBefore);
    return true;
  };
  const withRule = (r: number, when: readonly Condition[]): MethodRule[] =>
    rules.map((x, k) => (k === r ? { when, move: x.move } : x));

  for (let round = 0, changed = true; round < ROUNDS && changed; round++) {
    changed = false;
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r]!;
      // The junk on each side, as one total.
      const pre = rule.when.find((c) => c.kind === 'junk' && c.side === 'prefix' && c.op === '=');
      const suf = rule.when.find((c) => c.kind === 'junk' && c.side === 'suffix' && c.op === '=');
      if (pre?.kind === 'junk' && suf?.kind === 'junk') {
        const total: Condition = { kind: 'junk', side: 'total', op: '=', n: pre.n + suf.n };
        if (attempt(withRule(r, [...rule.when.filter((c) => c !== pre && c !== suf), total]), r + 1)) changed = true;
      }
      // Each test it can do without.
      for (const c of [...rules[r]!.when].sort((a, b) => dropOrder(a) - dropOrder(b))) {
        if (attempt(withRule(r, rules[r]!.when.filter((x) => x !== c)), r + 1)) changed = true;
      }
      // A count "= n" that can be "≥ n" — wider, so later rules may fall away.
      for (const c of rules[r]!.when) {
        if ((c.kind !== 'junk' && c.kind !== 'open') || c.op !== '=' || c.n < 1) continue;
        if (attempt(withRule(r, rules[r]!.when.map((x) => (x === c ? { ...c, op: '>=' as const } : x))), r + 1)) changed = true;
      }
    }
    // Whole rules the others cover, the last first.
    for (let r = rules.length - 1; r >= 0; r--) {
      if (attempt(rules.filter((_, k) => k !== r), r)) changed = true;
    }
    const w = tryRules(rules);
    if (w) rules = used(rules, w);
  }
  return rules;
}
