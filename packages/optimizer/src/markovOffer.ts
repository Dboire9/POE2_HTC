// What an action is worth against the current values `V` — the one place an OFFER (a Desecration shows
// three modifiers and you keep one, and an Omen of Abyssal Echoes may throw the three back) is priced.
// The solve's sweeps, its closed-form evaluation and the published plan all read it, so the three cannot
// disagree about what an offer is worth. Split out of markovFromItem.ts unchanged (2026-11-12).

import type { CompiledAction } from './markovLattice.ts';

export interface OfferValuer {
  /** Fills `w` with the chance of ending on each outcome (indexed like `a.to`); returns Σ w·V. */
  readonly keepWeights: (a: CompiledAction, w: Float64Array, fromStart?: boolean) => number;
  /** The action's value: its cost plus what it leads to, its self-loop divided out. */
  readonly valueOf: (a: CompiledAction) => number;
  /** Sized for the widest offer, reused so the hot loop allocates nothing. */
  readonly scratch: Float64Array;
  /** What the latest `keepWeights` call threw back — read straight after it, never later. */
  readonly last: { throw: number; bar: number };
}

/** The valuer over `V`, read live: every call sees V as it stands. */
export function offerValuer(V: Float64Array, widestOffer: number): OfferValuer {
  // Reused by every offer evaluation; sized once so the hot loop allocates nothing.
  const scratch = new Float64Array(widestOffer);
  /** `throw`: P(the offer was thrown back) in the latest `keepWeights` call — read straight after it, never later.
   *  `bar`: …and the line it threw back below: an offer whose best is dearer to finish from than this. */
  const last = { throw: 0, bar: Infinity };
  /** `x ** m`, but an offer is three, and Math.pow is a real cost in the hottest loop of the solve. */
  const powOffer = (x: number, m: number): number => (m === 3 ? x * x * x : x ** m);
  /**
   * What the player keeps when an action shows several draws and they must take one.
   *
   * A Desecration offers three modifiers and you choose — so its value is not `Σ p·V` over one draw
   * but `E[min over the offer]`, which depends on V and cannot be folded into the distribution ahead
   * of time. Sort the outcomes by V ascending and let `T_k` be the tail sum from k. The player keeps
   * outcome k exactly when every draw landed in `{k…K}` but not all in `{k+1…K}`, so
   *
   *     P(keep k) = T_k^m − T_(k+1)^m       (m = offers shown)
   *
   * With m = 1 this collapses to `T_k − T_(k+1) = p_k`, i.e. the ordinary expectation — the identity
   * is one formula, not a special case bolted on. O(K log K) with K ≈ 10 outcomes, and only a
   * Desecration pays it.
   *
   * With a REROLL — an Omen of Abyssal Echoes, spent only when used (confirmed 2026-09-10) — the player
   * sees the first offer and may pay the omen to throw all of it back for a fresh one, which they must
   * then keep; the fresh three may repeat mods from the first. They throw it back exactly when its best
   * is worse than the omen plus a fresh offer: c + τ, with τ = Σ P(keep k)·V_k the plain value above.
   * So outcome k is kept from the first offer when V_k ≤ c + τ, and from the second whenever the first
   * went back:
   *
   *     P'(keep k) = [V_k ≤ c + τ]·P(keep k) + P(throw)·P(keep k),   P(throw) = Σ over V_j > c + τ of P(keep j)
   *
   * The weights still sum to one; the value adds the omen's expected spend, P(throw)·c, and leaves
   * P(throw) in `last.throw` for the callers that need the spend on its own.
   *
   * Fills `w` with the probability of ending on each outcome, indexed like `a.to`, and returns Σ w·V —
   * the action's value less its cost. `offerValue`, the closed-form evaluation and the published edges
   * all read it, so the three cannot disagree about what an offer is worth.
   *
   * The sort starts from the order the last call left: V moves little from one sweep to the next, so
   * insertion sort is close to linear. The value does not depend on how outcomes tied on V are ordered;
   * their individual weights do, so a caller that PUBLISHES or FREEZES the weights passes `fromStart`,
   * and ties split by index every time rather than by the history of the solve.
   */
  const keepWeights = (a: CompiledAction, w: Float64Array, fromStart = false): number => {
    const K = a.to.length;
    const order = a.order;
    if (fromStart) for (let j = 0; j < K; j++) order[j] = j;
    for (let j = 1; j < K; j++) { // insertion sort by V ascending; K is tiny
      const cur = order[j]!;
      const cv = V[a.to[cur]!]!;
      let q = j - 1;
      while (q >= 0 && V[a.to[order[q]!]!]! > cv) { order[q + 1] = order[q]!; q--; }
      order[q + 1] = cur;
    }
    let tail = 0;
    for (let j = 0; j < K; j++) tail += a.prob[j]!;
    let tailPow = powOffer(tail, a.offer);
    let fresh = 0; // τ: what one fresh offer is worth
    for (let j = 0; j < K; j++) {
      const idx = order[j]!;
      tail -= a.prob[idx]!;
      const nextPow = tail <= 0 ? 0 : powOffer(tail, a.offer);
      w[idx] = tailPow - nextPow;
      fresh += V[a.to[idx]!]! * w[idx];
      tailPow = nextPow;
    }
    last.throw = 0;
    last.bar = Infinity;
    if (a.rerollCost === Infinity) return fresh;
    const bar = fresh + a.rerollCost; // anything no worse than paying for a fresh offer is kept
    last.bar = bar;
    let thrown = 0;
    for (let j = 0; j < K; j++) if (V[a.to[j]!]! > bar) thrown += w[j]!;
    if (thrown === 0) return fresh;
    let kept = 0;
    for (let j = 0; j < K; j++) {
      const v = V[a.to[j]!]!;
      w[j] = (v > bar ? 0 : w[j]!) + thrown * w[j]!;
      kept += w[j]! * v;
    }
    last.throw = thrown;
    return kept + thrown * a.rerollCost;
  };
  const offerValue = (a: CompiledAction): number => a.cost + keepWeights(a, scratch);
  const valueOf = (a: CompiledAction): number => {
    if (a.offer > 1) return offerValue(a);
    if (a.selfProb >= 1 - 1e-12) return Infinity; // an action that only loops back can't make progress
    let s = 0;
    for (let j = 0; j < a.to.length; j++) s += a.prob[j]! * V[a.to[j]!]!;
    return (a.cost + s) / (1 - a.selfProb);
  };
  return { keepWeights, valueOf, scratch, last };
}
