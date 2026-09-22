// A search on the official trade site, already filled in.
//
// The app never ASKS the trade site anything. It builds a URL, the player clicks it, and their browser
// does the asking — which is the whole difference between a link and the automated data extraction GGG's
// Terms of Use forbid (§7(c), §7(f)). Prices come back the same way: the player reads the listings and
// types what they saw. There is no other route — PoE2 has no public stash API, poe.ninja lists no
// tablets, and the trade API sends no CORS headers, so a web page could not read it even if it should.
//
// The stat ids come from `data/tablets/trade-stats.json` (built by tools/refresh/tablet_trade_stats.mjs
// from Exiled Exchange 2's MIT data). Where one modifier resolves to several ids, the search asks for ANY
// of them — see `ambiguous` there — which can list a near-identical modifier the player did not ask for.

/** One modifier's trade ids, as `trade-stats.json` records them. */
export interface TradeStat {
  readonly ids: readonly string[];
  /** The ids cover more than one wording of the stat, so the search is a superset. */
  readonly ambiguous?: boolean;
}

export interface TradeSearch {
  /** The league the prices describe — a search in another league answers a different question. */
  readonly league: string;
  /** The base as the trade site names it: "Ritual Tablet". */
  readonly baseName: string;
  /** The modifiers to ask for, all of them at once. */
  readonly stats: readonly TradeStat[];
}

const HOST = 'https://www.pathofexile.com';

/**
 * The URL for "this tablet, with these modifiers, cheapest first".
 *
 * A single-id modifier joins one `and` group, since every one of them has to be on the item. A modifier
 * with several ids becomes its own `count ≥ 1` group: the trade site has no "this stat under any of its
 * spellings" filter, and a count group is how the site's own UI expresses that.
 */
export function tradeUrl({ league, baseName, stats }: TradeSearch): string {
  const single = stats.filter((s) => s.ids.length === 1).map((s) => ({ id: s.ids[0]!, disabled: false }));
  const either = stats.filter((s) => s.ids.length > 1).map((s) => ({
    type: 'count', value: { min: 1 }, disabled: false,
    filters: s.ids.map((id) => ({ id, disabled: false })),
  }));
  const groups = [
    ...(single.length > 0 ? [{ type: 'and', filters: single, disabled: false }] : []),
    ...either,
  ];
  const query = {
    query: {
      status: { option: 'online' },
      type: baseName,
      ...(groups.length > 0 ? { stats: groups } : {}),
    },
    sort: { price: 'asc' },
  };
  return `${HOST}/trade2/search/poe2/${encodeURIComponent(league)}?q=${encodeURIComponent(JSON.stringify(query))}`;
}
