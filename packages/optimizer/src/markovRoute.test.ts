import { describe, it, expect } from 'vitest';
import { serialize } from 'node:v8';
import type { ItemState, ItemBase, Mod, PatchData } from '../../engine/src/index.ts';
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

/**
 * A route from an item you could BUY instead of a white base — the Lab's question — on a craft small
 * enough to solve by hand.
 *
 * Base: prefixes T (wanted) and J (junk), suffix U (wanted), every weight 1, one tier each. Transmute 1,
 * Augment 1, Regal 2, Exalt 1; Annulment and Chaos 1,000, so no route repairs anything; another white
 * base 3. No omen or other strength is priced, so none is offered.
 *
 * Every item carrying J is worth binning: the only fix is an Annulment. So with λ = 3 + V(white):
 *   Rare{T}:  Exalt → T+U (½, done) or T+J (½, start over)          = 1 + λ/2
 *   Magic{T}: Regal → the same two, for 2                            = 2 + λ/2   (Augment only adds U,
 *             and Magic{T,U} can only Regal the junk in, so it is worth λ)
 *   white:    Transmute → Magic{T}, {U} or {J}, a third each         = 1 + ⅓(2(2 + λ/2) + λ)
 * which gives V(white) = 13, λ = 16, Rare{T} = 9 and Magic{T} = 10 — so an item holding T is worth up to
 * 7 as a Rare and 6 as a Magic. U mirrors T.
 */
describe('a route from a starting item, derived by hand', () => {
  const mk = (id: string, type: 'prefix' | 'suffix'): Mod =>
    ({ id, source: 'normal', type, family: `F${id}`, tags: [], text: id, tiers: [{ name: 't1', ilvl: 1, weight: 1, ranges: [] }] });
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'C',
    pools: { normal: { prefixes: ['T', 'J'], suffixes: ['U'] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
  };
  const data: PatchData = { patch: 't', mods: new Map(['T', 'J'].map((id) => [id, mk(id, 'prefix')] as const).concat([['U', mk('U', 'suffix')]])), bases: new Map([['S', base]]) };
  const sheet = (exalt: number): Prices => ({
    currency: { transmute: 1, augment: 1, regal: 2, exalt, annul: 1000, chaos: 1000 }, omens: {},
  });
  const solve = (exalt = 1) => markovFromItem(data, sheet(exalt), { base, level: 100, rarity: 'normal', prefixes: [], suffixes: [] },
    [{ modId: 'T' }, { modId: 'U' }], { restartCost: 3, solver: 'policy', tolerance: 1e-12, keepRoutes: true });
  const row = (r: ReturnType<typeof solve>, rarity: 'magic' | 'rare', ids: string[]) =>
    r.holdings!.find((h) => h.rarity === rarity && h.present.flat().sort().join() === ids.sort().join())!;

  it('prices the white base and each starting item as derived', () => {
    const r = solve();
    expect(r.expectedCost).toBeCloseTo(13, 9);
    expect(row(r, 'rare', ['T']).cost).toBeCloseTo(9, 9);
    expect(row(r, 'rare', ['U']).cost).toBeCloseTo(9, 9);
    expect(row(r, 'magic', ['T']).cost).toBeCloseTo(10, 9);
    expect(row(r, 'magic', ['T', 'U']).cost).toBeCloseTo(16, 9);
  });

  it('draws the route from a Rare holding T: one Exalt, and half the time a fresh base', () => {
    const r = solve();
    const t = r.routes!;
    const { nodes, edges } = routeFrom(t, t.keys.indexOf(row(r, 'rare', ['T']).key));
    expect(nodes[0]!.isStart).toBe(true);
    expect(nodes[0]!.expectedCost).toBeCloseTo(9, 9);
    const white = nodes.filter((n) => n.isRestart);
    expect(white).toHaveLength(1);
    expect(white[0]!.expectedCost).toBeCloseTo(13, 9);
    expect(white[0]!.action).toBeUndefined();
    expect(edges.filter((e) => e.from === white[0]!.key)).toEqual([]);
    expect(edges.map((e) => [e.action.currency, e.prob])).toEqual([['exalt', 0.5], ['exalt', 0.5], ['restart', 1]]);
    // Where the route actually goes, ranked: the item, then the finish. The fresh base is drawn — it is
    // where the back-arrow lands — but no successful run passes through it.
    expect(white[0]!.visitRate).toBe(0);
    expect(nodes.find((n) => n.isGoal)!.visitRate).toBeCloseTo(0.5, 9);
  });

  /** At 20 a Exalt, finishing costs more than a fresh craft, so the item is worth nothing to a buyer. */
  it('says an item is worth nothing when its cheapest move is to start over', () => {
    const r = solve(20);
    const t = r.routes!;
    expect(row(r, 'rare', ['T']).cost).toBeCloseTo(16, 9);
    const { nodes, edges } = routeFrom(t, t.keys.indexOf(row(r, 'rare', ['T']).key));
    expect(nodes[0]!.action?.currency).toBe('restart');
    expect(edges).toEqual([expect.objectContaining({ from: nodes[0]!.key, to: nodes[1]!.key, prob: 1 })]);
    expect(nodes[1]!.isRestart).toBe(true);
  });
});

/** The same claims on a real craft, where nobody can derive the numbers by hand. */
describe('routes from starting items on a real craft', () => {
  const targets = [...wand.pools.normal.prefixes.slice(0, 2), ...wand.pools.normal.suffixes.slice(0, 1)].map((modId) => ({ modId }));
  const r = markovFromItem(real, frozen, item(wand, 'normal'), targets, { restartCost: 50, solver: 'policy', keepRoutes: true });
  const t = r.routes!;
  const starts = r.holdings!.filter((h) => h.present.length > 0 && h.present.length < 3);

  /** Starting over is a move in every state, so no item can cost more to finish than a fresh craft. */
  it('never prices a starting item above a fresh base plus the craft from white', () => {
    expect(starts.length).toBeGreaterThan(0);
    for (const h of starts) expect(h.cost, h.present.join('+')).toBeLessThanOrEqual((r.restartCost! + r.expectedCost) * (1 + 1e-9));
  });

  /**
   * Walk each route as the Markov chain it draws — goal worth 0, the fresh base worth what the craft
   * from white costs — and the item's own cost must come back. That is the route being the policy the
   * cost was computed for, rather than a picture of something else.
   */
  it.each(starts.map((h) => [`${h.rarity} ${h.present.map((g) => g.join('|')).join(' + ')}`, h] as const))(
    'draws a route that costs what its row says: %s', (_, h) => {
      const { nodes, edges } = routeFrom(t, t.keys.indexOf(h.key));
      expect(nodes[0]!.expectedCost).toBe(h.cost);
      expect(nodes.filter((n) => n.isRestart).length).toBeLessThanOrEqual(1);
      const cost = new Map(nodes.map((n) => [n.key, n.isGoal ? 0 : n.isRestart ? n.expectedCost : 0]));
      const out = new Map<string, typeof edges>();
      for (const e of edges) out.set(e.from, [...(out.get(e.from) ?? []), e]);
      for (let sweep = 0; sweep < 100_000; sweep++) {
        let delta = 0;
        for (const n of nodes) {
          if (n.isGoal || n.isRestart) continue;
          const v = n.actionCost! + (out.get(n.key) ?? []).reduce((s, e) => s + e.prob * cost.get(e.to)!, 0);
          delta = Math.max(delta, Math.abs(v - cost.get(n.key)!));
          cost.set(n.key, v);
        }
        if (delta < 1e-9) break;
      }
      expect(cost.get(nodes[0]!.key)! / h.cost).toBeCloseTo(1, 6);
    });

  /**
   * A route from a bought item can come back to it — an Annulment taking the junk off again — and each
   * return is another visit. The craft's own graph never met this: its root is the white base, which
   * only a restart reaches, and restarts are cut. With starting over priced out every run finishes, so
   * the root's rate is exactly its expected visits, and a route that returns must count above one.
   */
  it('counts each return to the item you bought as another visit', () => {
    const noRestart = markovFromItem(real, frozen, item(wand, 'normal'), targets, { restartCost: 1e6, solver: 'policy', keepRoutes: true });
    const routes = noRestart.holdings!.filter((h) => h.rarity === 'rare' && h.present.length === 1)
      .map((h) => routeFrom(noRestart.routes!, noRestart.routes!.keys.indexOf(h.key)))
      .filter(({ nodes, edges }) => edges.some((e) => e.to === nodes[0]!.key && e.from !== nodes[0]!.key));
    expect(routes.length).toBeGreaterThan(0);
    for (const { nodes, edges } of routes) {
      expect(edges.some((e) => e.action.currency === 'restart')).toBe(false);
      expect(nodes[0]!.visitRate).toBeGreaterThan(1);
    }
  });

  /**
   * The table crosses the worker boundary as a structured clone — the algorithm `postMessage` uses.
   *
   * Compared field by field, typed arrays by type and contents: under jsdom the clone's typed arrays
   * belong to a different global than the solver's, so a deep-equality check that also compares
   * prototypes fails on identical data. A worker's `postMessage` has no such split.
   */
  it('survives a structured clone', () => {
    const back = structuredClone(t);
    for (const k of Object.keys(t) as (keyof typeof t)[]) {
      const [a, b] = [t[k], back[k]];
      if (ArrayBuffer.isView(a)) {
        expect(b.constructor.name, k).toBe(a.constructor.name);
        expect(Array.from(b as Float64Array), k).toEqual(Array.from(a as Float64Array));
      } else expect(b, k).toEqual(a);
    }
    // …and a closure would not survive at all: v8's serializer, which a worker uses underneath, refuses one.
    expect(() => serialize({ ...t, walk: () => 0 })).toThrow();
    expect(() => serialize(t)).not.toThrow();
  });
});
