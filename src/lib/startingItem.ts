import type { EngineHolding } from './engineTypes.ts';

/**
 * "Which of these modifiers should I already have when I buy the item?"
 *
 * The solver hands back every subset of the targets priced as a starting point (`holdings`). That is
 * 2^n numbers — 64 on a six-mod craft — and a table of 64 rows answers nothing. This picks the few
 * rows that carry the answer.
 *
 * THE TWO THINGS WORTH SAYING, and they are not the same thing:
 *
 *  1. **The best set of each size.** A buyer is choosing how much to pay for how much progress, so
 *     "the best one to have", "the best two", and so on is the shape of the decision. Which two is
 *     often NOT the best one plus the next best — the mods compete for the same slots — so this is
 *     picked per size rather than built up greedily.
 *  2. **Which ones are worth nothing at all.** A modifier already on the item occupies a slot the
 *     next one could have landed in, and if it is cheap to roll anyway it can leave you strictly
 *     WORSE off than an empty base. It happens on most crafts — 6 of 7 measured — but the SIZE of it
 *     is what stops this being a warning: every case measured lands between **+0.03% and +0.20%** of
 *     the bare cost. So the honest claim is "this one is worth nothing, do not pay extra for it", not
 *     "this one is a trap". The panel prints the number rather than an adjective.
 *
 * WHAT THE TABLE IS REALLY FOR is the back-loading, which is enormous and which nobody guesses:
 * across the same campaign, ONE modifier of four already on the item saved 0.1%-11.6%, while THREE of
 * four saved 45-50%, and five of six on a Rings craft saved 35.7%. Counting modifiers is not counting
 * progress, and a buyer paying pro-rata for "4 of 6 done" is overpaying by a wide margin.
 */

export interface BuyRow {
  /** Target-mod texts the item would already carry. */
  readonly present: readonly string[];
  /** Expected cost to finish from there. */
  readonly cost: number;
  /** How much it saves against a bare base — NEGATIVE when it costs more. */
  readonly saving: number;
  /** `saving` as a fraction of the bare cost. */
  readonly share: number;
}

export interface BuyAdvice {
  /** The same craft from a bare item of the same base — the baseline every row is measured against. */
  readonly bare: number;
  /** Best value for money at each number of modifiers already held, ascending by count. */
  readonly best: readonly BuyRow[];
  /** Single modifiers that leave you worse off than an empty base. */
  readonly worseThanNothing: readonly BuyRow[];
}

const rowOf = (h: EngineHolding, bare: number): BuyRow => ({
  present: h.present,
  cost: h.cost,
  saving: bare - h.cost,
  share: bare === 0 ? 0 : (bare - h.cost) / bare,
});

/**
 * `null` when there is nothing to advise: no lattice, no baseline, or a craft with one target, where
 * "already have it" means the craft is already done and the only row is the trivial one.
 *
 * RARE ROWS ONLY. The table weighs Rares against a bare Rare, and a solve from a Magic item also
 * prices Magic starts — a cheaper Magic row would otherwise win a size it is not comparable at.
 */
export function buyAdvice(all: readonly EngineHolding[] | undefined): BuyAdvice | null {
  const holdings = all?.filter((h) => h.rarity === 'rare');
  if (!holdings || holdings.length === 0) return null;
  const bare = holdings.find((h) => h.present.length === 0)?.cost;
  if (bare === undefined || !(bare > 0)) return null;

  const n = Math.max(...holdings.map((h) => h.present.length));
  if (n < 2) return null;

  const best: BuyRow[] = [];
  for (let k = 1; k < n; k++) {
    // Cheapest to FINISH, which is the buyer's question — not the most modifiers, and not the ones
    // that look most valuable in isolation.
    const ofSize = holdings.filter((h) => h.present.length === k);
    const top = ofSize.reduce<EngineHolding | undefined>(
      (a, b) => (a === undefined || b.cost < a.cost ? b : a), undefined,
    );
    if (top) best.push(rowOf(top, bare));
  }

  const worseThanNothing = holdings
    .filter((h) => h.present.length === 1 && h.cost > bare)
    .map((h) => rowOf(h, bare))
    .sort((a, b) => a.saving - b.saving);

  return { bare, best, worseThanNothing };
}
