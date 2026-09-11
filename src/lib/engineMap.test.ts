import { describe, it, expect } from 'vitest';
import { mapMarkov } from './engineMap';

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
