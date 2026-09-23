import React from 'react';
import type { PatchData } from '../../../packages/engine/src/types';
import { gearSearch, loadGearTrade, type GearTrade, type WantedMod } from '../../lib/gearTrade';
import { tradeUrl } from '../../lib/tradeLink';
import { cn } from '../../lib/utils';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** The gear trade ids, loaded on first use and shared by every link on the page. */
function useGearTrade(): GearTrade | undefined {
  const [trade, setTrade] = React.useState<GearTrade>();
  React.useEffect(() => {
    let live = true;
    void loadGearTrade().then((t) => { if (live) setTrade(t); });
    return () => { live = false; };
  }, []);
  return trade;
}

/**
 * "Search on trade" for an item of gear the planner shows — the finished item, or one to buy instead.
 *
 * Opens the official trade site with the search filled in: the base's class, the rarity, every modifier
 * at the tier asked of it or better, instant buyout, cheapest first. The app never asks the site anything
 * itself (tradeLink.ts). Nothing renders until the ids have loaded, or without a league to search in.
 */
export const GearTradeLink: React.FC<{
  data: PatchData;
  league: string | undefined;
  baseId: string;
  slots: readonly (readonly WantedMod[])[];
  rarity: 'magic' | 'rare' | 'nonunique';
  /** Names the item for a screen reader: "Search on trade for a Rare holding …". */
  label: string;
  className?: string;
}> = ({ data, league, baseId, slots, rarity, label, className }) => {
  const trade = useGearTrade();
  if (!trade || !league) return null;
  const { search, loose } = gearSearch(trade, data, baseId, slots);
  return (
    <a
      href={tradeUrl({ league, rarity, ...search })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Search on trade for ${label}`}
      title={loose
        ? 'Opens the trade site. One of these modifiers has no trade stat, or shares its search with a similar one, so the listings may be looser than this item — check them.'
        : 'Opens the trade site: this class of item, every modifier at the tier asked of it or better, instant buyout, cheapest first'}
      className={cn('inline-flex items-center rounded border border-border px-1.5 py-0.5 text-xs whitespace-nowrap hover:border-primary/60 hover:text-foreground', FOCUS, className)}
    >
      Search on trade{loose && <span aria-hidden="true" className="ml-1 text-amber-400">≈</span>}
    </a>
  );
};
