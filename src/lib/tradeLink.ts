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
  /** Only listings whose roll sits in this range — "rerolling Favours 3 additional times", not 1. */
  readonly value?: { readonly min?: number; readonly max?: number };
  /**
   * A range per id, in the order of `ids`, where they differ — a slot either of two modifiers fills,
   * each at its own tier ("T1 Extra Cold or T3 Extra Lightning"). Wins over `value` where present.
   */
  readonly values?: readonly (TradeStat['value'] | undefined)[];
}

export interface TradeSearch {
  /** The league the prices describe — a search in another league answers a different question. */
  readonly league: string;
  /** One base, as the trade site names it: "Ritual Tablet". */
  readonly baseName?: string;
  /** Or a whole item class, as the trade site's category filter names it: "weapon.wand". */
  readonly category?: string;
  /** Only this rarity: a plain tablet is Normal, a bought item Magic or Rare, a finished one any but Unique. */
  readonly rarity?: 'normal' | 'magic' | 'rare' | 'nonunique';
  /** Filters every listing must ALSO pass that are not modifiers — a tablet's ten uses (`FULL_USES`). */
  readonly require?: readonly { readonly id: string; readonly value?: TradeStat['value']; readonly disabled: false }[];
  /** The modifiers to ask for, all of them at once. */
  readonly stats: readonly TradeStat[];
}

const HOST = 'https://www.pathofexile.com';

/**
 * A tablet is spent a use at a time, and a fresh one has 10. A used tablet is a different item at a
 * lower price, so every tablet search asks for a full one (`require`) — the trade site's own "# uses
 * remaining (Tablets)" pseudo stat, as Exiled Exchange 2 lists it.
 */
export const FULL_USES = { id: 'pseudo.pseudo_number_of_uses_remaining', value: { min: 10 }, disabled: false } as const;

/**
 * The URL for "this item, with these modifiers, instant buyout, cheapest first".
 *
 * A single-id modifier joins one `and` group, since every one of them has to be on the item. A modifier
 * with several ids becomes its own `count ≥ 1` group: the trade site has no "this stat under any of its
 * spellings" filter, and a count group is how the site's own UI expresses that.
 */
export function tradeUrl({ league, baseName, category, rarity, require = [], stats }: TradeSearch): string {
  const filter = (s: TradeStat, i: number) => {
    const value = s.values?.[i] ?? s.value;
    return { id: s.ids[i]!, ...(value ? { value } : {}), disabled: false };
  };
  const single = stats.filter((s) => s.ids.length === 1).map((s) => filter(s, 0));
  const either = stats.filter((s) => s.ids.length > 1).map((s) => ({
    type: 'count', value: { min: 1 }, disabled: false,
    filters: s.ids.map((_, i) => filter(s, i)),
  }));
  const groups = [{ type: 'and', filters: [...require, ...single], disabled: false }, ...either];
  const typeFilters = {
    ...(category ? { category: { option: category } } : {}),
    ...(rarity ? { rarity: { option: rarity } } : {}),
  };
  const query = {
    query: {
      // Instant buyout: a listing you can buy without the seller online, at the price it shows — the
      // only price a player can act on without a whisper, so the one worth typing back in.
      status: { option: 'securable' },
      ...(baseName ? { type: baseName } : {}),
      stats: groups,
      ...(Object.keys(typeFilters).length > 0 ? { filters: { type_filters: { filters: typeFilters } } } : {}),
    },
    sort: { price: 'asc' },
  };
  return `${HOST}/trade2/search/poe2/${encodeURIComponent(league)}?q=${encodeURIComponent(JSON.stringify(query))}`;
}
