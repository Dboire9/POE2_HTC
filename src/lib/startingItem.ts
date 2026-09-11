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

/**
 * One item the Lab offers to start from instead of a white base, measured against crafting from
 * scratch. Read from a from-white solve, so finishing may still bin the item and start over when that
 * is cheaper than repairing it — the price paid for it is spent either way (the player's choice,
 * 2026-09-11).
 */
export interface StartOption {
  /** The solver's state for this item — what `routeFor` draws the route from. */
  readonly key: string;
  readonly present: readonly string[];
  readonly rarity: 'magic' | 'rare';
  /** Expected cost to finish from it. */
  readonly finish: number;
  /**
   * The most this item is worth paying for: crafting from scratch less finishing from it. Never
   * negative, because starting over is always a move — an item that saves nothing is worth nothing.
   */
  readonly worthUpTo: number;
  /** A trade price the player typed, in exalts, when it is a usable number. */
  readonly price?: number;
  /** `price + finish` — what starting from this item really costs, to hold against crafting from scratch. */
  readonly total?: number;
}

/** How many targets a starting item can already carry: at least one, and not all of them. */
export function startSizes(holdings: readonly EngineHolding[] | undefined): number[] {
  if (!holdings || holdings.length === 0) return [];
  const n = Math.max(...holdings.map((h) => h.present.length));
  return [...new Set(holdings.map((h) => h.present.length))].filter((k) => k >= 1 && k < n).sort((a, b) => a - b);
}

/**
 * Every starting item carrying `k` of the targets, cheapest to finish first.
 *
 * `scratch` is what crafting from scratch costs INCLUDING the white base — a solve's `expectedCost`
 * starts from a base you already hold, and only buying ANOTHER one is charged (`restartCost`). Buying a
 * starting item replaces buying that base, so the base is part of what the item is measured against.
 *
 * Ordered by finishing cost ONLY, never by a typed price. Ranking by price plus finishing sent a row to
 * the top on its first digit, so the box the player had been looking at now belonged to another item and
 * the price seemed to vanish (reported 2026-09-11). Which priced row is the best buy is `bestStart`'s
 * answer instead. A price that is not a finite, non-negative number is ignored.
 */
export function startOptions(
  holdings: readonly EngineHolding[], scratch: number, k: number, prices: ReadonlyMap<string, number>,
): StartOption[] {
  const rows = holdings.filter((h) => h.present.length === k).map((h): StartOption => {
    const base = { key: h.key, present: h.present, rarity: h.rarity, finish: h.cost, worthUpTo: Math.max(0, scratch - h.cost) };
    const price = prices.get(h.key);
    return price !== undefined && Number.isFinite(price) && price >= 0 ? { ...base, price, total: price + h.cost } : base;
  });
  return rows.sort((a, b) => a.finish - b.finish
    || (a.rarity === b.rarity ? 0 : a.rarity === 'magic' ? -1 : 1)
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** A row somebody has priced. */
export type PricedStart = StartOption & { readonly price: number; readonly total: number };
const isPriced = (r: StartOption): r is PricedStart => r.total !== undefined;

/**
 * The priced row that costs least all in — trade price plus finishing — or `undefined` when nothing is
 * priced. poe.ninja prices no item with specific modifiers, so a typed price is the only way a row's
 * real cost is known; the cheapest to finish is often the dearest to buy. On a tie the row listed first
 * (cheaper to finish) wins.
 */
export function bestStart(rows: readonly StartOption[]): PricedStart | undefined {
  return rows.filter(isPriced).reduce<PricedStart | undefined>((b, r) => (b === undefined || r.total < b.total ? r : b), undefined);
}

/**
 * A trade price as the player types it, or `undefined` when it is not one.
 *
 * A comma is a decimal point too: a French or German keyboard types "0,5" for half a divine, and the
 * browser's number box silently dropped the comma and read "05", ten times the price (reported
 * 2026-09-11). When the text also has a dot, its commas are thousands separators ("1,250.5"). Spaces go,
 * French thousands included ("1 250"). Anything else is left unread for the panel to mark, never guessed.
 */
export function parsePrice(text: string): number | undefined {
  const s = text.replace(/\s/g, '');
  const plain = s.includes('.') ? s.replace(/,/g, '') : s.replace(',', '.');
  return /^(\d+\.?\d*|\.\d+)$/.test(plain) ? Number(plain) : undefined;
}
