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
      { present: [[P], [S]], cost: 10 },
      { present: [[P], ['x']], cost: 20 },
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
});
