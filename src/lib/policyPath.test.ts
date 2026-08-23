import { describe, it, expect } from 'vitest';
import { mainLine } from './policyPath.ts';
import type { EngineMarkovResult, EnginePolicyEdge, EnginePolicyNode } from './engineTypes.ts';

// `mainLine` is the answer to "what do I actually do", pulled out of a graph that answers "what states
// exist". The invariant that matters is termination: it may only step to a STRICTLY closer state, so
// a policy that loops (annul → exalt → annul → …) cannot hang the render.

const node = (key: string, depth: number, extra: Partial<EnginePolicyNode> = {}): EnginePolicyNode => ({
  key, present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0,
  isStart: false, isGoal: false, depth, expectedCost: depth, action: 'Exalt', ...extra,
});
const edge = (from: string, to: string, prob: number, regress = false): EnginePolicyEdge =>
  ({ from, to, action: 'Exalt', prob, regress });

const result = (nodes: EnginePolicyNode[], edges: EnginePolicyEdge[]): EngineMarkovResult => ({
  applicable: true, feasible: true, expectedCost: 1, converged: true, assumedOdds: false, nodes, edges,
});

describe('mainLine', () => {
  it('walks start → goal, taking the likeliest forward outcome at each state', () => {
    const r = result(
      [
        node('a', 2, { isStart: true, action: 'Annul' }),
        node('b', 1, { action: 'Exalt (Dextral)' }),
        node('b2', 1),
        node('g', 0, { isGoal: true, action: undefined }),
      ],
      [edge('a', 'b', 0.7), edge('a', 'b2', 0.2), edge('b', 'g', 0.5)],
    );
    const { steps, goal } = mainLine(r);
    expect(steps.map((s) => s.node.key)).toEqual(['a', 'b']);
    expect(steps[0]!.next.key).toBe('b'); // 0.7 beats 0.2
    expect(steps[0]!.advance).toBeCloseTo(0.7);
    expect(goal?.key).toBe('g');
  });

  it('prefers the node label’s action over the edge’s', () => {
    // The node knows the currency the policy plays; an edge merely carries a copy. Reading the node
    // keeps the line consistent with what the full graph draws in the same box.
    const r = result(
      [node('a', 1, { isStart: true, action: 'Annul (Sinistral)' }), node('g', 0, { isGoal: true })],
      [edge('a', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.action).toBe('Annul (Sinistral)');
  });

  it('reports the brick risk without counting sideways progress as a setback', () => {
    // 0.5 forward, 0.3 backward, 0.2 to a DIFFERENT closer state. Only the 0.3 is a brick, and
    // advance + brick deliberately falls short of 1.
    const r = result(
      [
        node('a', 2, { isStart: true }), node('b', 1), node('b2', 1), node('bad', 3),
        node('g', 0, { isGoal: true }),
      ],
      [edge('a', 'b', 0.5), edge('a', 'b2', 0.2), edge('a', 'bad', 0.3, true), edge('b', 'g', 1)],
    );
    const first = mainLine(r).steps[0]!;
    expect(first.advance).toBeCloseTo(0.5);
    expect(first.brick).toBeCloseTo(0.3);
  });

  it('terminates on a policy that can cycle, because equal depth is not progress', () => {
    // a ⇄ b at the SAME depth. Following "not a regress" would loop forever; requiring a strictly
    // smaller depth refuses the sideways edge and reports a stall instead of hanging.
    const r = result(
      [node('a', 1, { isStart: true }), node('b', 1), node('g', 0, { isGoal: true })],
      [edge('a', 'b', 0.9), edge('b', 'a', 0.9)],
    );
    expect(mainLine(r).steps).toEqual([]);
  });

  it('gives up rather than drawing a line that stops mid-air', () => {
    const r = result(
      [node('a', 2, { isStart: true }), node('g', 0, { isGoal: true })],
      [], // no edges at all
    );
    expect(mainLine(r)).toEqual({ steps: [] });
  });

  it('has nothing to walk when the graph has no start', () => {
    expect(mainLine(result([node('x', 1)], [])).steps).toEqual([]);
  });

  it('is already done when the start IS the goal', () => {
    const r = result([node('g', 0, { isStart: true, isGoal: true, action: undefined })], []);
    const { steps, goal } = mainLine(r);
    expect(steps).toEqual([]);
    expect(goal?.key).toBe('g');
  });
});

// The route named the currency and the mod COUNT — "Exalt (Dextral, Greater): 1 mod → 2 mods" — and
// left out the one thing a player needs, which mod. Both states are already in hand, so the step's
// effect is a diff nobody was taking.
describe('mainLine — what each step moves', () => {
  const withMods = (
    key: string, depth: number, present: string[], blocked: string[], junk: number,
    extra: Partial<EnginePolicyNode> = {},
  ): EnginePolicyNode => ({
    key, present, blocked, junkPrefixes: junk, junkSuffixes: 0,
    isStart: false, isGoal: false, depth, expectedCost: depth, action: 'Exalt', ...extra,
  });

  it('names the target a step lands', () => {
    const r = result(
      [
        withMods('a', 1, [], [], 0, { isStart: true }),
        withMods('g', 0, ['Spell Damage'], [], 0, { isGoal: true }),
      ],
      [edge('a', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.changes.gained).toEqual(['Spell Damage']);
  });

  it('reports junk cleared with no target gained — an Annul that does its job', () => {
    const r = result(
      [withMods('a', 2, [], [], 2, { isStart: true, action: 'Annul' }), withMods('g', 0, [], [], 1, { isGoal: true })],
      [edge('a', 'g', 1)],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.gained).toEqual([]);
    expect(c.junkDelta).toBe(-1);
  });

  it('reports both halves of a Chaos — junk off, target on', () => {
    const r = result(
      [
        withMods('a', 2, [], [], 1, { isStart: true, action: 'Chaos' }),
        withMods('g', 0, ['Mana Regeneration Rate'], [], 0, { isGoal: true }),
      ],
      [edge('a', 'g', 1)],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.gained).toEqual(['Mana Regeneration Rate']);
    expect(c.junkDelta).toBe(-1);
  });

  it('reports a target lost, and one newly blocked below tier', () => {
    // A step can progress overall while still costing something — depth counts blocks and junk too.
    const r = result(
      [
        withMods('a', 4, ['Cold Damage'], [], 3, { isStart: true }),
        withMods('g', 0, [], ['Spell Damage'], 0, { isGoal: true }),
      ],
      [edge('a', 'g', 1)],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.lost).toEqual(['Cold Damage']);
    expect(c.blocked).toEqual(['Spell Damage']);
    expect(c.junkDelta).toBe(-3);
  });

  it('reports nothing moved when nothing moved', () => {
    const r = result(
      [withMods('a', 1, ['X'], [], 0, { isStart: true }), withMods('g', 0, ['X'], [], 0, { isGoal: true })],
      [edge('a', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.changes).toEqual({ gained: [], lost: [], blocked: [], junkDelta: 0 });
  });
});
