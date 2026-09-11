import { describe, it, expect } from 'vitest';
import type { ItemState, ItemBase } from '../../engine/src/index.ts';
import { loadPatch } from '../../engine/src/index.ts';
import { markovFromItem } from './markovFromItem.ts';
import type { MarkovOptions } from './markovFromItem.ts';
import type { TierTarget } from './optimize.ts';
import { loadFrozenPrices } from './frozenPrices.ts';
import { loadPrices } from './loadPrices.ts';
import type { Prices } from './cost.ts';
import { routeFrom } from './markovRoute.ts';

const real = loadPatch('data/patches/0.5.0');
const wand = real.bases.get('Wands')!;
const frozen = loadFrozenPrices();
// The LIVE sheet, because it is the one that prices the bones and the Echoes omen. Safe here: every
// assertion below compares two readings of ONE solve, so whatever the sheet says, both sides see it.
const live = loadPrices('data/patches/0.5.0');

const XCOLD = 'Wands/DamageGainedAsCold';
const XLIGHT = 'Wands/DamageGainedAsLightning';
const CAST = 'Wands/IncreasedCastSpeed';
const CARVED = 'Wands/Desecrated_WeaponDamageTypePrefix';

const item = (base: ItemBase, rarity: ItemState['rarity'], suffixes: string[] = []): ItemState => ({
  base, level: 82, rarity, prefixes: [],
  suffixes: suffixes.map((modId) => ({ modId, tierName: real.mods.get(modId)!.tiers.at(-1)!.name })),
});

interface Craft {
  readonly name: string;
  readonly prices: Prices;
  readonly start: ItemState;
  readonly targets: readonly TierTarget[];
  readonly opts?: MarkovOptions;
}

const CRAFTS: readonly Craft[] = [
  { name: 'a held Rare, no restart', prices: frozen, start: item(wand, 'rare'),
    targets: [{ modId: XCOLD }, { modId: CAST }] },
  { name: 'from white, with restart', prices: frozen, start: item(wand, 'normal'),
    targets: [{ modId: XCOLD }, { modId: CAST }], opts: { restartCost: 0, solver: 'policy' } },
  { name: 'a desecrated target, bones and Echoes priced', prices: live, start: item(wand, 'rare'),
    targets: [{ modId: CARVED }, { modId: CAST }] },
  { name: 'a slot of alternatives, several goal keys', prices: live, start: item(wand, 'normal'),
    targets: [{ modId: XCOLD, slot: 0 }, { modId: XLIGHT, slot: 0 }, { modId: CAST }],
    opts: { restartCost: 0, solver: 'policy' } },
  { name: 'a Magic start', prices: frozen, start: item(wand, 'magic', [CAST]),
    targets: [{ modId: XCOLD }, { modId: CAST }] },
];

/**
 * The route table is the policy the solver settled, and `routeFrom` is the walk over it.
 *
 * The claim that licenses drawing a route from ANY state is that walking the table from the craft's own
 * start reproduces the graph the solver has always drawn — nodes, edges, odds, visit rates, the lot.
 * That was proven against the old walk while both existed (dac91de: equal on all five crafts below, and
 * red when edges were walked in reverse, self-loops dropped or goal states left unfolded). Since the old
 * walk is gone, this pins what replaced it: the result's graph IS the walk from the start, and the table
 * plays exactly the policy the result publishes.
 *
 * Each craft picks out a different part of the walk: restart edges and their cut, an offer's realized
 * odds and the flag axis, several goal states folding into one, and the Magic rung.
 */
describe('routeFrom — the graph from any state, walked over the solved policy', () => {
  const solve = ({ prices, start, targets, opts }: Craft) => {
    const r = markovFromItem(real, prices, start, targets, { ...opts, keepRoutes: true });
    expect(r.feasible, r.reason).toBe(true);
    expect(r.bound).toBe('exact');
    return { r, t: r.routes! };
  };

  it.each(CRAFTS)('draws the result’s graph as the walk from its start: $name', (craft) => {
    const { r, t } = solve(craft);
    expect(t.keys[t.restartIdx]).toBe(r.nodes[0]!.key);
    expect(routeFrom(t, t.restartIdx)).toEqual({ nodes: r.nodes, edges: r.edges });
  });

  it.each(CRAFTS)('plays the published policy in every state: $name', (craft) => {
    const { r, t } = solve(craft);
    let played = 0;
    t.keys.forEach((key, i) => {
      const a = t.act[i]!;
      expect(a >= 0 ? t.actions[a] : undefined, key).toEqual(r.policy.get(key));
      if (a >= 0) played++;
    });
    expect(played).toBe(r.policy.size);
  });
});
