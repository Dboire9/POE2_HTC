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
