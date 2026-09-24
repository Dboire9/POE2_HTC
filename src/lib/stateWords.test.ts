import { describe, it, expect } from 'vitest';
import type { EnginePolicyEdge, EnginePolicyNode, PolicyMod } from './engineTypes';
import { describeItem, outcomeWords } from './stateWords';

const mod = (text: string, type: 'prefix' | 'suffix' = 'prefix'): PolicyMod => ({ text, type });
const node = (over: Partial<EnginePolicyNode> = {}): EnginePolicyNode => ({
  key: 'k', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare',
  isStart: false, isGoal: false, depth: 1, visitRate: 0, expectedCost: 10, ...over,
});
const edge = (to: string): EnginePolicyEdge => ({ from: 'k', to, action: 'Exalted Orb', prob: 0.5, regress: false });

describe('what the item is, in words', () => {
  it('names a bare start, and otherwise its rarity, the mods wanted and the ones not', () => {
    expect(describeItem(node({ isStart: true, rarity: 'normal' }), 'A white base')).toBe('A white base');
    expect(describeItem(node({ present: [mod('Spell Damage')], junkSuffixes: 1 }), 'x'))
      .toBe('Rare · Spell Damage, and one suffix you did not ask for');
    expect(describeItem(node({ rarity: 'magic', junkPrefixes: 1 }), 'x')).toBe('Magic · one prefix, none of them wanted');
  });

  it('says what has to come off first — unless asked not to, as the Tablets tab does', () => {
    const stuck = node({ blocked: [mod('Cast Speed', 'suffix')], desecratedJunk: 'prefix', junkPrefixes: 1 });
    expect(describeItem(stuck, 'x')).toBe(
      'Rare · one prefix, none of them wanted; Cast Speed is below the tier you asked; the unwanted prefix came from a Desecration');
    expect(describeItem(stuck, 'x', false)).toBe('Rare · one prefix, none of them wanted');
  });
});

describe('what an outcome did, in words', () => {
  const here = node({ present: [mod('Spell Damage')] });
  it('says what landed, what was removed and what landed too low', () => {
    expect(outcomeWords(here, node({ key: 'n', present: [mod('Spell Damage'), mod('Cast Speed', 'suffix')] }), edge('n')))
      .toBe('Cast Speed lands');
    expect(outcomeWords(here, node({ key: 'n', present: [mod('Spell Damage')], junkSuffixes: 1 }), edge('n')))
      .toBe('A suffix you did not ask for lands');
    expect(outcomeWords(here, node({ key: 'n', present: [] }), edge('n'))).toBe('Spell Damage is removed');
    expect(outcomeWords(here, node({ key: 'n', present: [mod('Spell Damage')], blocked: [mod('Cast Speed', 'suffix')] }), edge('n')))
      .toBe('Cast Speed lands below the tier you asked');
    const junky = node({ present: [mod('Spell Damage')], junkPrefixes: 1 });
    expect(outcomeWords(junky, node({ key: 'n', present: [mod('Spell Damage')], junkSuffixes: 1 }), edge('n')))
      .toBe('A prefix you did not want is removed · a suffix you did not ask for lands');
  });

  it('calls the goal finished, and an outcome that changes nothing the plan counts what it is', () => {
    expect(outcomeWords(here, node({ key: 'g', isGoal: true, present: [mod('Spell Damage'), mod('Cast Speed')] }), edge('g')))
      .toBe('Cast Speed lands — finished');
    expect(outcomeWords(here, here, edge('k'))).toBe('Nothing that helps — the item counts the same as before');
  });
});
