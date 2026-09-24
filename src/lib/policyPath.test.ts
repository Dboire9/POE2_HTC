import { describe, it, expect } from 'vitest';
import { mainLine } from './policyPath.ts';
import type { EngineMarkovResult, EnginePolicyEdge, EnginePolicyNode } from './engineTypes.ts';

// `mainLine` is the answer to "what do I actually do", pulled out of a graph that answers "what states
// exist". The invariant that matters is termination: it enters a state at most once, so a policy that
// loops (annul → exalt → annul → …) cannot hang the render.

const node = (key: string, depth: number, extra: Partial<EnginePolicyNode> = {}): EnginePolicyNode => ({
  key, present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare',
  isStart: false, isGoal: false, depth, expectedCost: depth, visitRate: 1, action: 'Exalt', ...extra,
});
const edge = (from: string, to: string, prob: number, regress = false): EnginePolicyEdge =>
  ({ from, to, action: 'Exalt', prob, regress });

const result = (nodes: EnginePolicyNode[], edges: EnginePolicyEdge[]): EngineMarkovResult => ({
  applicable: true, feasible: true, expectedCost: 1, converged: true, bound: 'exact', assumedOdds: false, nodes, edges,
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

  /**
   * A craft that can start over (from a white base): the line follows the outcomes the FINISHING crafts
   * come through. The Ritual reroll in miniature — the Transmute lands it outright 0.3% of the time, but
   * most crafts that finish get there by a Chaos on the Rare the Regal makes; strictly-closer walking
   * drew only the 0.3% (reported 2026-09-23).
   */
  it('on a craft that can start over, follows the outcomes the finishing crafts come through', () => {
    const r = result(
      [
        node('w', 1, { isStart: true, action: 'Transmute', rarity: 'normal' }),
        node('m', 2, { action: 'Regal', rarity: 'magic' }),
        node('hit', 1, { action: 'Regal', rarity: 'magic' }),
        node('r', 2, { action: 'Chaos' }),
        node('g', 0, { isGoal: true, action: undefined }),
      ],
      [
        edge('w', 'hit', 0.003), edge('w', 'm', 0.997, true), edge('hit', 'g', 1),
        edge('m', 'g', 0.003), edge('m', 'r', 0.997),
        edge('r', 'g', 0.003), edge('r', 'r', 0.5), edge('r', 'w', 0.497, true), // no change, or start over
      ],
    );
    const { steps } = mainLine(r);
    expect(steps.map((s) => s.action)).toEqual(['Transmute', 'Regal', 'Chaos']);
    expect(steps[1]!.lands).toBeCloseTo(0.003); // the Regal can land it too, and says so
    expect(steps[2]!.repeats).toBeCloseTo(0.5); // the Chaos is played again when nothing changes
  });

  it('backs out of a branch that only loops back, to the next best outcome', () => {
    // From x, the likeliest way on is y — but y only leads back to x. The line backs out of y and takes
    // x's own finishing roll, rather than stalling and leaving no route at all.
    const r = result(
      [
        node('w', 3, { isStart: true, action: 'Transmute', rarity: 'normal' }),
        node('x', 2, { action: 'Chaos' }), node('y', 2, { action: 'Chaos' }),
        node('g', 0, { isGoal: true, action: undefined }),
      ],
      [edge('w', 'x', 1), edge('x', 'y', 0.9), edge('x', 'g', 0.05), edge('x', 'w', 0.05, true), edge('y', 'x', 1)],
    );
    expect(mainLine(r).steps.map((s) => s.next.key)).toEqual(['x', 'g']);
  });

  it('on an item you hold, backs out of an outcome that only leads back, to the next best', () => {
    // A Desecrate on a held Rare: 70% lands junk that an Annul takes straight back to the start, 17%
    // finishes. The likeliest outcome leads nowhere new; the line takes the one that finishes.
    const r = result(
      [
        node('a', 1, { isStart: true, action: 'Desecrate' }), node('j', 2, { action: 'Annul' }),
        node('g', 0, { isGoal: true, action: undefined }),
      ],
      [edge('a', 'j', 0.7, true), edge('a', 'g', 0.17), edge('j', 'a', 1)],
    );
    const { steps, goal } = mainLine(r);
    expect(steps.map((s) => s.next.key)).toEqual(['g']);
    expect(steps[0]!.brick).toBeCloseTo(0.7);
    expect(goal?.key).toBe('g');
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
  /** Positions in the mapped shape; these cases are about the DIFF, so the side is a stand-in. */
  const mods = (texts: readonly string[]) => texts.map((text) => ({ text, type: 'prefix' as const }));
  const withMods = (
    key: string, depth: number, present: string[], blocked: string[], junk: number,
    extra: Partial<EnginePolicyNode> = {},
  ): EnginePolicyNode => ({
    key, present: mods(present), blocked: mods(blocked), junkPrefixes: junk, junkSuffixes: 0, rarity: 'rare',
    isStart: false, isGoal: false, depth, expectedCost: depth, visitRate: 1, action: 'Exalt', ...extra,
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
      [
        withMods('a', 2, [], [], 2, { isStart: true, action: 'Annul' }),
        withMods('b', 1, [], [], 1, { action: 'Exalt' }),
        withMods('g', 0, ['X'], [], 0, { isGoal: true }),
      ],
      [edge('a', 'b', 1), edge('b', 'g', 1)],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.gained).toEqual([]);
    expect(c.junk).toEqual({ prefixes: -1, suffixes: 0 });
  });

  it('reports a junk mod that changed sides, which leaves the total alone', () => {
    // A Chaos on a Rare with two junk suffixes and room on both sides: half the time the new junk
    // lands as a prefix. Summed, that was "no change", beside the roll that really changed nothing.
    const r = result(
      [
        withMods('a', 2, [], [], 0, { isStart: true, action: 'Chaos', junkSuffixes: 2 }),
        withMods('b', 1, [], [], 1, { junkSuffixes: 1 }),
        withMods('g', 0, ['X'], [], 0, { isGoal: true }),
      ],
      [edge('a', 'b', 1), edge('b', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.changes.junk).toEqual({ prefixes: 1, suffixes: -1 });
  });

  /**
   * Every finished state is drawn as one goal, the clean one, so its junk counts say nothing about the
   * item a step finishes on. A Chaos that swaps one of two junk suffixes for the target, finishing
   * with the other on a spare slot, read "clears 2 junk mods" (reported 2026-09-23). The edge carries
   * the item it really finishes on.
   */
  it('reads the junk a step into the goal leaves from the item it really finishes on', () => {
    const r = result(
      [
        withMods('a', 2, [], [], 0, { isStart: true, action: 'Chaos', junkSuffixes: 2 }),
        withMods('g', 0, ['Mana Regeneration Rate'], [], 0, { isGoal: true }),
      ],
      [{ ...edge('a', 'g', 1), finishes: [{ junkPrefixes: 0, junkSuffixes: 1, prob: 1 }] }],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.gained).toEqual(['Mana Regeneration Rate']);
    expect(c.junk).toEqual({ prefixes: 0, suffixes: -1 }); // ONE junk suffix off, the target on
    expect(c.finishes).toBeUndefined();
  });

  it('keeps each way a step can finish, when they differ in where the junk sits', () => {
    // A Regal on a Magic tablet holding the target: its new modifier is junk on either side, and both
    // finish it — one edge, all of the step, "adds a junk suffix (51%) or a junk prefix (49%)".
    const r = result(
      [
        withMods('a', 1, ['T'], [], 0, { isStart: true, action: 'Regal', rarity: 'magic' }),
        withMods('g', 0, ['T'], [], 0, { isGoal: true }),
      ],
      [{ ...edge('a', 'g', 1), finishes: [{ junkPrefixes: 0, junkSuffixes: 1, prob: 0.51 }, { junkPrefixes: 1, junkSuffixes: 0, prob: 0.49 }] }],
    );
    const step = mainLine(r).steps[0]!;
    expect(step.advance).toBe(1);
    expect(step.changes.junk).toEqual({ prefixes: 0, suffixes: 1 });
    expect(step.changes.finishes).toEqual([
      { junk: { prefixes: 0, suffixes: 1 }, share: 0.51 },
      { junk: { prefixes: 1, suffixes: 0 }, share: 0.49 },
    ]);
  });

  it('reports a target lost, and one newly blocked', () => {
    // A step can progress overall while still costing something — depth counts blocks and junk too.
    const r = result(
      [
        withMods('a', 4, ['Cold Damage'], [], 3, { isStart: true }),
        withMods('b', 3, [], ['Spell Damage'], 0),
        withMods('g', 0, ['X'], [], 0, { isGoal: true }),
      ],
      [edge('a', 'b', 1), edge('b', 'g', 1)],
    );
    const c = mainLine(r).steps[0]!.changes;
    expect(c.lost).toEqual(['Cold Damage']);
    expect(c.blocked).toEqual(['Spell Damage']);
    expect(c.junk).toEqual({ prefixes: -3, suffixes: 0 });
  });

  it('reports nothing moved when nothing moved', () => {
    const r = result(
      [withMods('a', 1, ['X'], [], 0, { isStart: true }), withMods('g', 0, ['X'], [], 0, { isGoal: true })],
      [edge('a', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.changes).toEqual({ gained: [], lost: [], blocked: [], junk: { prefixes: 0, suffixes: 0 } });
  });
});

// A from-white policy scraps the item and starts again for most outcomes, so a state like "rare, one
// target, one junk" legitimately has NO forward move — its best action goes backwards to the bare base.
// Following the likeliest forward edge walked straight into such a state and stalled, and the route
// silently vanished on every from-scratch craft. The walk has to prefer an edge the craft can actually
// be finished from, not merely the likeliest one.
describe('mainLine — routes that can actually finish', () => {
  const nd = (key: string, depth: number, extra: Partial<EnginePolicyNode> = {}): EnginePolicyNode => ({
    key, present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare',
    isStart: false, isGoal: false, depth, expectedCost: depth, visitRate: 1, action: 'Exalt', ...extra,
  });

  it('takes the less likely branch when the likely one dead-ends', () => {
    // From `s`: 0.9 to `trap` (closer, but its only move is backwards) and 0.1 to `g` (the goal).
    const r = result(
      [nd('s', 3, { isStart: true }), nd('trap', 2), nd('g', 0, { isGoal: true }), nd('back', 4)],
      [
        edge('s', 'trap', 0.9), edge('s', 'g', 0.1),
        edge('trap', 'back', 1, true), // "start over" — the only thing to do from here
      ],
    );
    const { steps, goal } = mainLine(r);
    expect(steps).toHaveLength(1);
    expect(steps[0]!.next.key).toBe('g');
    expect(goal?.key).toBe('g');
  });

  it('still prefers the likelier branch when both can finish', () => {
    const r = result(
      [nd('s', 3, { isStart: true }), nd('a', 2), nd('b', 2), nd('g', 0, { isGoal: true })],
      [edge('s', 'a', 0.3), edge('s', 'b', 0.7), edge('a', 'g', 1), edge('b', 'g', 1)],
    );
    expect(mainLine(r).steps[0]!.next.key).toBe('b');
  });

  it('gives up when nothing can finish, rather than drawing a route into a dead end', () => {
    const r = result(
      [nd('s', 2, { isStart: true }), nd('trap', 1), nd('g', 0, { isGoal: true })],
      [edge('s', 'trap', 1)], // trap never reaches the goal
    );
    expect(mainLine(r).steps).toEqual([]);
  });
});
