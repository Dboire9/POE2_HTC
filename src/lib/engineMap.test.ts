import { describe, it, expect } from 'vitest';
import { mapMarkov, mapRoute } from './engineMap';
import type { EngineMarkovResult } from './engineTypes';

/**
 * Two DIFFERENT modifiers can print the same text, and a holding puts several on one line.
 *
 * Real on shipped data: 8 base/text collisions in 0.5.0, every one the `ItemFoundRarity` prefix and
 * suffix, which an item can carry at the same time. Rendered plainly it reads "Rarity + Rarity" and
 * looks like a bug rather than like the two modifiers it is.
 */
describe('mapMarkov — naming two positions that read alike', () => {
  const P = 'Amulets/ItemFoundRarityIncrease';
  const S = 'Amulets/ItemFoundRarityIncrease_';
  const data = {
    mods: new Map([
      [P, { id: P, text: '#% increased Rarity of Items found', type: 'prefix' }],
      [S, { id: S, text: '#% increased Rarity of Items found', type: 'suffix' }],
      ['x', { id: 'x', text: '+# to maximum Life', type: 'prefix' }],
    ]),
  } as unknown as Parameters<typeof mapMarkov>[0];

  const res = {
    expectedCost: 1, feasible: true, converged: true, bound: 'exact',
    nodes: [], edges: [], policy: new Map(),
    holdings: [
      { present: [[P], [S]], cost: 10, rarity: 'rare', key: '3:0:0:0:0:2' },
      { present: [[P], ['x']], cost: 20, rarity: 'magic', key: '5:0:0:0:0:1' },
    ],
  } as unknown as Parameters<typeof mapMarkov>[1];

  it('appends the side when two positions in one holding print the same text', () => {
    const out = mapMarkov(data, res);
    expect(out.holdings![0]!.present).toEqual([
      '#% increased Rarity of Items found (prefix)',
      '#% increased Rarity of Items found (suffix)',
    ]);
  });

  it('leaves a row alone when nothing collides', () => {
    const out = mapMarkov(data, res);
    expect(out.holdings![1]!.present).toEqual([
      '#% increased Rarity of Items found',
      '+# to maximum Life',
    ]);
  });

  // The Lab draws the route from a row's state, and a Magic and a Rare row read differently.
  it('carries each row’s rarity and state through', () => {
    const out = mapMarkov(data, res);
    expect(out.holdings!.map((h) => [h.rarity, h.key])).toEqual([['rare', '3:0:0:0:0:2'], ['magic', '5:0:0:0:0:1']]);
  });
});

/** A Desecration can spend a bone grade and three omens at once; the label must name each one it pays for. */
describe('mapMarkov — naming a Desecration', () => {
  it('names the bone’s grade and every omen it spends', () => {
    const res = {
      expectedCost: 1, feasible: true, converged: true, bound: 'exact', edges: [], policy: new Map(),
      nodes: [{
        key: 's', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, isStart: true, isGoal: false,
        expectedCost: 1, rarity: 'rare', visitRate: 1, depth: 1,
        action: { currency: 'desecrate', ancient: true, side: 'suffix', echoes: true },
      }],
    } as unknown as Parameters<typeof mapMarkov>[1];
    const out = mapMarkov({ mods: new Map() } as unknown as Parameters<typeof mapMarkov>[0], res);
    expect(out.nodes[0]!.action).toBe('Desecrate (Ancient, Dextral, Omen of Abyssal Echoes)');
  });
});

/**
 * Each position of a policy state carries the three facts the graph lays out: the modifier, the SIDE it
 * sits on, and the TIER the target asked for. The last is the ask, not a roll — a present position
 * means "at that tier or better" and the state does not record which — so it is only ever as specific
 * as the ask was.
 */
describe('mapMarkov — a position names its side and the tier it was asked at', () => {
  const data = {
    mods: new Map([
      ['p', { id: 'p', text: 'Spell Damage', type: 'prefix' }],
      ['s', { id: 's', text: 'Cast Speed', type: 'suffix' }],
      ['c', { id: 'c', text: 'Cold', type: 'prefix' }],
      ['l', { id: 'l', text: 'Lightning', type: 'prefix' }],
    ]),
  } as unknown as Parameters<typeof mapMarkov>[0];
  const withPositions = (present: string[][]) => ({
    feasible: true, expectedCost: 1, converged: true, bound: 'exact', policy: new Map(), edges: [],
    nodes: [{
      key: 's', present, blocked: [], junkPrefixes: 0, junkSuffixes: 0, isStart: true, isGoal: false,
      expectedCost: 1, rarity: 'rare', visitRate: 1, depth: 1,
    }],
  } as unknown as Parameters<typeof mapMarkov>[1]);

  /** The side is READ FROM THE DATA, which is the only source that has it — a suffix target must not
   *  be drawn on the prefix side because the first position happened to be one. */
  it('takes each side from the modifier, not from its neighbours', () => {
    const out = mapMarkov(data, withPositions([['p'], ['s']]), false,
      [{ modId: 'p', tierDisplay: 2 }, { modId: 's', tierDisplay: 1 }]);
    expect(out.nodes[0]!.present).toEqual([
      { text: 'Spell Damage', type: 'prefix', tier: 2 },
      { text: 'Cast Speed', type: 'suffix', tier: 1 },
    ]);
  });

  /**
   * A MERGED position holds several interchangeable modifiers, and they can have been asked at
   * different tiers — the case `mixedTierAlternatives` puts a note under. One number would then speak
   * for two asks, so none is shown.
   */
  it('shows no tier for a merged position whose members were asked at different tiers', () => {
    const agree = mapMarkov(data, withPositions([['c', 'l']]), false,
      [{ modId: 'c', tierDisplay: 3 }, { modId: 'l', tierDisplay: 3 }]);
    expect(agree.nodes[0]!.present[0]).toEqual({ text: 'Cold or Lightning', type: 'prefix', tier: 3 });

    const differ = mapMarkov(data, withPositions([['c', 'l']]), false,
      [{ modId: 'c', tierDisplay: 3 }, { modId: 'l', tierDisplay: 1 }]);
    expect(differ.nodes[0]!.present[0]).toEqual({ text: 'Cold or Lightning', type: 'prefix' });
  });

  /** No targets, no tiers — the side still comes through, and nothing is invented. */
  it('leaves the tier off when the caller gave no targets', () => {
    const out = mapMarkov(data, withPositions([['p']]), false);
    expect(out.nodes[0]!.present[0]).toEqual({ text: 'Spell Damage', type: 'prefix' });
  });
});

/**
 * A route from a starting item, in the shape `PolicyGraph` already draws. It costs what its root costs,
 * names its boxes exactly as the craft's own graph would, marks the fresh base it ends at, and leaves
 * the craft's table and rows behind.
 */
describe('mapRoute — a route from a starting item, for the graph', () => {
  const data = { mods: new Map([['c', { id: 'c', text: 'Cold', type: 'prefix' }], ['l', { id: 'l', text: 'Lightning', type: 'prefix' }]]) } as unknown as Parameters<typeof mapRoute>[0];
  const node = (key: string, over: object) => ({
    key, present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare', isStart: false, isGoal: false,
    expectedCost: 0, visitRate: 0, depth: 0, ...over,
  });
  const route = {
    nodes: [
      node('s', { present: [['c', 'l']], isStart: true, expectedCost: 9, action: { currency: 'desecrate' }, actionCost: 1 }),
      node('w', { rarity: 'normal', isRestart: true, expectedCost: 13 }),
    ],
    edges: [{ from: 's', to: 'w', action: { currency: 'desecrate' }, prob: 1, regress: true }],
  } as unknown as Parameters<typeof mapRoute>[1];
  const from = {
    applicable: true, feasible: true, converged: true, bound: 'exact', assumedOdds: false, expectedCost: 13,
    restartCost: 3, bareCost: 20, holdings: [], routes: {}, nodes: [], edges: [],
  } as unknown as EngineMarkovResult;

  it('draws it the way the craft’s own graph draws a state', () => {
    const out = mapRoute(data, route, from);
    expect(out.expectedCost).toBe(9);
    // A position, not a bare string: the side comes off the data even here, where `mapRoute` was given
    // no target list and so has no tier to add.
    expect(out.nodes[0]).toMatchObject({
      present: [{ text: 'Cold or Lightning', type: 'prefix' }], isStart: true, action: 'Desecrate',
    });
    expect(out.nodes[0]!.present[0]!.tier).toBeUndefined();
    expect(out.nodes[1]).toMatchObject({ isRestart: true, expectedCost: 13 });
    expect(out.nodes[0]!.isRestart).toBeUndefined();
    // An unomened Desecration on THIS route leans on the assumed spawn weight, whatever the craft's did.
    expect(out.assumedOdds).toBe(true);
    expect(out.restartCost).toBe(3);
    expect([out.routes, out.holdings, out.bareCost]).toEqual([undefined, undefined, undefined]);
  });
});
