// Market depth and the refresh verdict: which quotes are trusted, and when the daily price PR is held.
//
// Kept apart from prices.mjs, which fetches on import, so the rules that decide whether the bot merges
// by itself can be tested (priceDepth.test.mjs) rather than only read.

/**
 * Market depth: is a price backed by a market, or by one listing?
 *
 * poe.ninja hands us `volumePrimaryValue` and a 7-day `sparkline` on every line, and until 2026-09-01
 * the refresh read neither — so a price backed by a single trade was trusted exactly as much as the
 * Exalted Orb's. That matters more here than in a price viewer, because **the optimizer RANKS plans by
 * cost**: a thin quote does not merely make a total wrong, it changes which route the app recommends,
 * and the shape tests pass because the shape is fine.
 *
 * **Depth is UNITS TRADED, which is `volumePrimaryValue / primaryValue` — never the raw volume.**
 * That field is denominated in the exchange's primary currency (divine), so it is systematically
 * wrong at both ends: a Transmute costs ~0.0004 div, so thousands of them trade for a tiny divine
 * figure, while a Mirror is huge per unit. Measured 2026-09-01, raw volume called plain Transmute the
 * fourth-THINNEST currency (0.42) and the Mirror the deepest market on the exchange (48,400); by units
 * it is Transmute 2,548/day and Mirror **7**. Reading the raw field ranks liquidity backwards.
 *
 * What that correction shows, on the same day's data:
 *   • Currency the sheet uses is healthy — transmute 2,548, regal 3,384, greater augment 1,536,
 *     annul 5,526, exalted 856,572 units/day.
 *   • Bones the sheet uses are healthy — preserved jawbone 220, rib 347, collarbone 357.
 *   • **Essences are not a market.** Median 2 units/day; 72 of 78 lines under 50; several at literally
 *     zero units still quoting a price, one of them (`essence-of-command`) up 16,567% in a week.
 *     They are also 1,292 of the sheet's 1,312 price keys.
 *
 * So no single quote holds the refresh; only a feed-wide event does. An orb or bone line is deep, so
 * one going thin-and-moving is abnormal — but it is one price, and it KEEPS ITS PREVIOUS VALUE
 * (`keepPreviousIfThin`), the same call the omen path makes with its stored quote. Until 2026-11-18 it
 * held the PR instead, and one thin currency kept ~1,500 good prices off the live site for a week. An
 * individual essence is thin every single day — its market's normal state, not a signal — and is
 * handled at the source by `minEssenceUnits`. A large SHARE of either moving at once is different in
 * kind: that points at the feed rather than at one listing, and does block.
 */
export const DEPTH = {
  /** Units traded per day below which a line has no real market behind it. */
  minUnits: 50,
  /** A 7-day move at or beyond this percent is "unstable". */
  spikePct: 50,
  /**
   * Units/day below which an ESSENCE quote is not evidence and is routed through the inference path
   * instead. Lower than `minUnits` because essences trade in tiny numbers even when real: the feed's
   * median is 2/day. Measured 2026-09-01, depth predicts stability sharply — of the 29 lines under
   * 1 unit/day, 72% had moved over 50% in a week; of the 25 above 10 units/day, 28% had. Under 1 is
   * where a "price" is one person's listing.
   */
  minEssenceUnits: 1,
  /**
   * Days after a league starts during which every refresh is held for a human to read.
   *
   * The changeover DAY was already named as a blocker, and that was not enough: the moment its PR
   * merges, `prev.league` is the new league and day 2 sails through auto-merged. The week after a
   * league starts is exactly when the sheet is least trustworthy — the whole economy is repricing —
   * and it is when the alloy collapse shipped. A league start is handled by hand.
   *
   * A hold is one click, not a wall. The PR is open, titled REVIEW NEEDED, and mergeable the moment
   * it has been looked at, which is what keeps "players need the site on day one" true: it is the
   * unattended merge that stops, not the data.
   */
  leagueHoldDays: 7,
  /**
   * Share of essence lines moving that means a feed-level EVENT rather than the usual churn.
   *
   * Set high on purpose. Half this market swings 50% in a normal week (measured: 51%), so a threshold
   * near that would hold every refresh forever and defeat the point of automating it. The blocker is
   * for a change in KIND — a league rollover, where essentially everything moves at once — not a
   * change in degree, which the untraded-quote filter already handles at the source.
   */
  essenceShareToBlock: 0.9,
  /**
   * Share of the sheet's currency and bone lines thin-and-moving IN ONE RUN that means the feed broke.
   *
   * These lines are deep — hundreds to hundreds of thousands of units a day — so one going thin is a
   * market having a bad week, and keeps its previous price. A quarter of them at once (7 of the 25
   * keys) is not a market: it is poe.ninja serving partial or reset volumes, and every kept price would
   * be a guess about which ones to trust. That needs a human. Strictly MORE than this share blocks.
   */
  thinShareToBlock: 0.25,
};

/**
 * `id -> { units, chg }` for one feed.
 *
 * A line quoting a price at zero volume yields 0 units, which is the honest answer: nothing traded.
 */
export function depthIndex(feedLines) {
  return new Map(feedLines.map((l) => [l.id, {
    units: l.primaryValue ? (l.volumePrimaryValue ?? 0) / l.primaryValue : 0,
    chg: l.sparkline?.totalChange ?? 0,
  }]));
}

/** Lines in `ids` with no real market AND a big recent move. `label` names them in the report. */
export function suspectsIn(index, ids, label) {
  const out = [];
  for (const [name, id] of ids) {
    const d = index.get(id);
    if (!d) continue;
    if (d.units < DEPTH.minUnits && Math.abs(d.chg) >= DEPTH.spikePct) {
      out.push({ label, name, units: d.units, chg: d.chg });
    }
  }
  return out;
}

/**
 * Today's quotes, except that a key in `thin` keeps its PREVIOUS price.
 *
 * This runs BEFORE anything is written, so a thin quote never reaches the sheet; it does not merely
 * get reported afterwards. A key with no usable previous price (absent, or 0) keeps today's quote
 * instead and is named in `unbacked`: a thin price is still a price, while 0 or a deleted key would
 * read as a FREE orb (`stepCost` reads an absent key as 0), and a free anything wins every plan.
 *
 * @param {Record<string, number>} fresh   key -> today's quote
 * @param {Record<string, number> | undefined} prev   key -> the sheet's previous price
 * @param {Set<string>} thin   keys whose line is thin and moving today
 */
export function keepPreviousIfThin(fresh, prev, thin) {
  const prices = {};
  const kept = [];
  const unbacked = [];
  for (const [key, value] of Object.entries(fresh)) {
    const before = prev?.[key];
    if (!thin.has(key)) {
      prices[key] = value;
    } else if (typeof before === 'number' && before > 0) {
      prices[key] = before;
      kept.push(key);
    } else {
      prices[key] = value;
      unbacked.push(key);
    }
  }
  return { prices, kept, unbacked };
}

/**
 * Why this refresh must be read by a human before it merges — empty means the bot merges it.
 *
 * Only what a bot cannot judge holds it: a new league, and a feed-wide event. A single thin price
 * does not (it kept its previous value — `keepPreviousIfThin`), and neither do essence keys the feed
 * did not list (they keep theirs in prices.mjs; essences are thin every day by nature).
 *
 * @param {object} a
 * @param {string | undefined} a.prevLeague   the league the previous sheet was built from
 * @param {string} a.league                   the league this run priced
 * @param {string} a.leagueSince              when the sheet first saw `league`
 * @param {number} a.leagueAgeDays            whole days since `leagueSince`
 * @param {number} a.thinCount                currency + bone lines thin and moving today
 * @param {number} a.thinTotal                currency + bone keys the sheet uses
 * @param {number} a.essShare                 share of essence lines that moved over `spikePct`
 */
export function depthBlockers({ prevLeague, league, leagueSince, leagueAgeDays, thinCount, thinTotal, essShare }) {
  const blockers = [];
  // A LEAGUE CHANGE is the one case worth naming outright rather than inferring from price movement.
  // On the first days of a league almost nothing has traded, so every price is thin, volatile, or
  // simply absent — and the ones that DO exist are not yet the prices anyone will pay a week later.
  //
  // It is an AGE, not an event, and that is the fix for what the event version missed: `prev.league`
  // becomes the new league the instant the changeover PR merges, so a one-shot check guards day 1 and
  // waves through days 2-7 — the rest of the week the economy spends repricing.
  //
  // poe.ninja's /leagues serves no start date (checked: `id` and `name`, nothing else), so the sheet
  // records when this refresh FIRST SAW the league. That is a lower bound on the league's age, which
  // is the safe direction: a sheet that missed the first days holds for slightly longer than needed
  // rather than shorter.
  if (prevLeague && prevLeague !== league) {
    blockers.push(`LEAGUE CHANGED: ${prevLeague} -> ${league}. Early-league prices are thin and move fast; read the whole diff before merging`);
  } else if (leagueAgeDays < DEPTH.leagueHoldDays) {
    blockers.push(`day ${leagueAgeDays + 1} of ${league} (first seen ${leagueSince}); prices are held for a read for the first ${DEPTH.leagueHoldDays} days of a league`);
  }
  if (thinTotal > 0 && thinCount / thinTotal > DEPTH.thinShareToBlock) {
    blockers.push(`${thinCount} of ${thinTotal} currency/bone lines thin and moving at once (over ${DEPTH.thinShareToBlock * 100}%): the feed looks broken, not the market`);
  }
  if (essShare >= DEPTH.essenceShareToBlock) {
    blockers.push(`${(essShare * 100).toFixed(0)}% of essence lines moved over ${DEPTH.spikePct}%`);
  }
  return blockers;
}
