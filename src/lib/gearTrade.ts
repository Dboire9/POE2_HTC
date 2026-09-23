// A trade search for an item of GEAR the planner shows: the finished item, or one it suggests buying.
//
// The tablet searches' twin (tablets.ts): same link, same rule that the app never asks the trade site
// anything (tradeLink.ts). The stat ids come from `data/trade/gear-stats.json`, built by
// tools/refresh/gear_trade_stats.mjs from Exiled Exchange 2's MIT data — one filter per line of a
// modifier's text, with the tier's value range it reads. 188 KB, so it loads when a search is first
// wanted (`loadGearTrade`) rather than with the app.

import type { PatchData } from '../../packages/engine/src/types.ts';
import type { TradeSearch, TradeStat } from './tradeLink.ts';

export interface GearTrade {
  readonly rows: readonly { readonly ids: readonly string[]; readonly ambiguous?: boolean }[];
  /** Per modifier, one `[row, firstRange, ranges]` per line of its text; null where the trade site has no stat. */
  readonly mods: Readonly<Record<string, readonly (readonly [number, number, number] | null)[]>>;
}

let loading: Promise<GearTrade> | undefined;
/** The trade ids, fetched once, on first use. */
export const loadGearTrade = (): Promise<GearTrade> =>
  (loading ??= import('../../data/trade/gear-stats.json').then((m) => m.default as unknown as GearTrade));

/**
 * The trade site's category for each kind of base, as Exiled Exchange 2 maps them. A search by category
 * rather than base name: the planner's bases are item CLASSES ("Wands"), and any base of the class rolls
 * the same modifiers. The attribute and element splits (Body_Armours_str, Wands_fire) share their class's.
 */
export const TRADE_CATEGORY: Readonly<Record<string, string>> = {
  Amulets: 'accessory.amulet', Rings: 'accessory.ring', Belts: 'accessory.belt',
  Body_Armours: 'armour.chest', Boots: 'armour.boots', Gloves: 'armour.gloves', Helmets: 'armour.helmet',
  Shields: 'armour.shield', Bucklers: 'armour.buckler', Foci: 'armour.focus', Quivers: 'armour.quiver',
  Bows: 'weapon.bow', Crossbows: 'weapon.crossbow', OneHand_Maces: 'weapon.onemace',
  TwoHand_Maces: 'weapon.twomace', Quarterstaves: 'weapon.warstaff', Sceptres: 'weapon.sceptre',
  Spears: 'weapon.spear', Staves: 'weapon.staff', Wands: 'weapon.wand',
};

/** One modifier wanted at a tier or better: `tierDisplay` 1 is the best, the mod's tier count is any. */
export interface WantedMod {
  readonly modId: string;
  readonly tierDisplay: number;
}

type Range = TradeStat['value'];

/** The filters for one modifier: one per line of its text the trade site knows, each with its minimum. */
function lines(trade: GearTrade, data: PatchData, want: WantedMod): { ids: readonly string[]; ambiguous: boolean; value: Range }[] | undefined {
  const mod = data.mods.get(want.modId);
  const entry = trade.mods[want.modId];
  if (!mod || !entry || entry.some((l) => l === null)) return undefined;
  const n = mod.tiers.length;
  // Display 1 is the best tier, the last in the engine's order; display n and beyond is "any tier".
  const tier = want.tierDisplay < n ? mod.tiers[Math.max(0, n - want.tierDisplay)] : undefined;
  return entry.map((l) => {
    const [row, first, ranges] = l!;
    const lows = tier ? tier.ranges.slice(first, first + ranges).map((r) => r[0]!) : [];
    // "At least this tier's lowest roll" — the average of the two for an "Adds # to #" line, as the
    // trade site filters those. Never below zero: a minimum cannot say "at most this much reduced".
    const min = lows.length > 0 && lows.every((x) => x >= 0) ? Math.floor(lows.reduce((a, b) => a + b, 0) / lows.length) : undefined;
    const r = trade.rows[row]!;
    return { ids: r.ids, ambiguous: r.ambiguous === true, value: min === undefined ? undefined : { min } };
  });
}

/**
 * The search for an item holding one modifier per SLOT — each slot a list of alternatives, any one of
 * which fills it ("Cold or Lightning"). `loose` when a modifier could not be searched for at all, or
 * where a stat's ids cover more than one stat: the listings then need a glance.
 */
export function gearSearch(
  trade: GearTrade, data: PatchData, baseId: string, slots: readonly (readonly WantedMod[])[],
): { search: Omit<TradeSearch, 'league' | 'rarity'>; loose: boolean } {
  const base = data.bases.get(baseId);
  const category = base ? TRADE_CATEGORY[base.category] : undefined;
  const stats: TradeStat[] = [];
  let loose = false;
  for (const slot of slots) {
    const each = slot.map((w) => lines(trade, data, w));
    if (each.some((l) => l === undefined)) { loose = true; if (each.every((l) => l === undefined)) continue; }
    const found = each.filter((l): l is NonNullable<typeof l> => l !== undefined);
    if (found.length === 1) {
      // One modifier: each of its lines is a filter of its own, every one of them required.
      for (const l of found[0]!) {
        if (l.ambiguous) loose = true;
        stats.push({ ids: l.ids, ...(l.value ? { value: l.value } : {}) });
      }
      continue;
    }
    // Alternatives: ONE group any of whose filters satisfies the slot, each at its own tier. A hybrid
    // alternative is read by its first line — the group cannot demand two lines of one candidate.
    loose ||= found.some((l) => l.length > 1 || l[0]!.ambiguous);
    stats.push({
      ids: found.flatMap((l) => l[0]!.ids),
      values: found.flatMap((l) => l[0]!.ids.map(() => l[0]!.value)),
    });
  }
  return { search: { ...(category ? { category } : {}), stats }, loose };
}

/** The planner's targets as slots: targets sharing a `slot` are alternatives, the rest a slot each. */
export function slotsOfTargets(targets: readonly { readonly modId: string; readonly tierDisplay: number; readonly slot?: number }[]): WantedMod[][] {
  const slots = new Map<string, WantedMod[]>();
  targets.forEach((t, i) => {
    const key = t.slot === undefined ? `own:${i}` : `slot:${t.slot}`;
    const list = slots.get(key) ?? [];
    list.push({ modId: t.modId, tierDisplay: t.tierDisplay });
    slots.set(key, list);
  });
  return [...slots.values()];
}

/**
 * An item the planner suggests, as slots: its modifier ids per slot (`EngineHolding.positions`), each
 * at the tier the craft asks of it — a bought item is only worth its price if it holds that tier.
 */
export function slotsOfHolding(
  positions: readonly (readonly string[])[], targets: readonly { readonly modId: string; readonly tierDisplay: number }[],
): WantedMod[][] {
  return positions.map((ids) => ids.map((modId) => ({ modId, tierDisplay: targets.find((t) => t.modId === modId)?.tierDisplay ?? 99 })));
}
