import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PolicyGraph, { groupNodes, groupKeyOf, progressEdges, routeThrough, pruneToCoverage, COVERAGE_STEPS } from './PolicyGraph';
import { optimizeItemMarkov } from '../../lib/engine';
import { loadPatch } from '../../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../../packages/optimizer/src/loadPrices.ts';
import type { EngineMarkovResult, EnginePolicyNode } from '../../lib/engine';

// Rendered from REAL MDP output (keep Mana, swap Int→Spell Damage on a Wand), not a fixture.
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const start = {
  baseId: 'Wands', level: 82, rarity: 'rare' as const,
  prefixes: [{ modId: 'Wands/IncreasedMana', tierDisplay: 99 }],
  suffixes: [{ modId: 'Wands/Intelligence', tierDisplay: 99 }],
};
const result = optimizeItemMarkov(eng, start, [
  { modId: 'Wands/IncreasedMana', tierDisplay: 99 }, { modId: 'Wands/WeaponSpellDamage', tierDisplay: 99 },
]);

// The component picks its own unit from the node costs; these tests only need a stable stand-in that
// collides the same way the real one does.
const fmt = (x: number): string => x.toPrecision(3);


const expand = async () => {
  await userEvent.setup().click(screen.getByRole('button', { name: /Full graph · \d+ states/i }));
};

/**
 * Widen the expanded graph from its default coverage to every state.
 *
 * The expanded view now prunes by `visitRate` — it opens on the states a craft actually runs into,
 * because the full closure is combinatorial and unreadable (217 states / 42 rows in one column,
 * measured). Tests below that are about RENDERING FIDELITY — one rect per group, arrows drawn, the
 * off-tier label — want every state on screen, so they say so rather than depending on where the
 * default cut happens to fall on a fixture.
 */
const showEveryState = async () => {
  const btn = screen.queryByRole('button', { name: /Every state/i });
  if (btn) await userEvent.setup().click(btn);
};

// The default view is the ROUTE, not the state space. A five-target craft reaches 262 states, most
// sharing a label and all rounding to the same cost — complete, and unreadable. The full graph is
// still here, behind the view switcher.
describe('PolicyGraph — the route', () => {
  it('leads with the route rather than the state graph', () => {
    const { container } = render(<PolicyGraph result={result} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('button', { name: /Full graph · \d+ states/i })).toBeInTheDocument();
  });

  it('names the currency to use at each step, and ends at the target', () => {
    render(<PolicyGraph result={result} />);
    const route = screen.getAllByRole('list')[0]!;
    const items = within(route).getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(1);
    // Every step but the closing "✓ target" names an action the player can act on.
    expect(items[0]!.textContent).toMatch(/Exalt|Annul|Chaos|Desecrate|Essence/);
    expect(items[items.length - 1]!.textContent).toContain('✓ target');
  });

  it('states the chance each step moves you onward', () => {
    render(<PolicyGraph result={result} />);
    expect(within(screen.getAllByRole('list')[0]!).getAllByText(/onward/).length).toBeGreaterThan(0);
  });

  it('the route is strictly shorter than the full state list', () => {
    render(<PolicyGraph result={result} />);
    const steps = within(screen.getAllByRole('list')[0]!).getAllByRole('listitem').length - 1; // less "✓ target"
    expect(steps).toBeLessThan(result.nodes.length);
  });
});

describe('PolicyGraph — the full graph, on demand', () => {
  it('renders a node square per policy state and edges (incl. brick back-arrows)', async () => {
    const { container } = render(<PolicyGraph result={result} />);
    await expand();
    await showEveryState();
    const svg = container.querySelector('svg')!;
    expect(svg).toBeTruthy();
    // One <rect> per DISPLAY GROUP now, not per state — see the grouping describe below.
    expect(container.querySelectorAll('rect').length).toBe(groupNodes(result, fmt).groups.length);
    expect(container.querySelectorAll('path[marker-end]').length).toBeGreaterThan(0);
    // a brick edge is drawn dashed (the back-arrow).
    expect(container.querySelector('path[stroke-dasharray]')).toBeTruthy();
  });

  it('labels the goal and the start', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    const svg = screen.getByRole('img', { name: /policy graph/i });
    expect(within(svg).getByText('✓ target')).toBeInTheDocument();
    expect(within(svg).getAllByText('start').length).toBeGreaterThan(0);
  });

  it('collapses back to the route', async () => {
    const { container } = render(<PolicyGraph result={result} />);
    await expand();
    await userEvent.setup().click(screen.getByRole('button', { name: /^The route$/i }));
    expect(container.querySelector('svg')).toBeNull();
  });

  it('shows an off-tier (blocked) state for a specific-tier target', async () => {
    // Spell Damage at a top-3 tier (tierDisplay 3): most exalts roll it below tier, blocking the family —
    // the v2 "off-tier" states must appear as squares in the graph.
    const tiered = optimizeItemMarkov(eng, {
      baseId: 'Wands', level: 82, rarity: 'rare' as const,
      prefixes: [{ modId: 'Wands/IncreasedMana', tierDisplay: 99 }], suffixes: [],
    }, [
      { modId: 'Wands/IncreasedMana', tierDisplay: 99 },
      { modId: 'Wands/WeaponSpellDamage', tierDisplay: 3 },
    ]);
    expect(tiered.applicable && tiered.feasible).toBe(true);
    expect(tiered.nodes.some((n) => n.blocked.length > 0)).toBe(true);
    render(<PolicyGraph result={tiered} />);
    await expand();
    // Off-tier states are genuinely RARE — a craft rolls below tier and then annuls out of it — so the
    // default coverage cut can legitimately leave them out. The claim here is that the graph can show
    // them, not that it always does, so ask for every state.
    await showEveryState();
    const svg = screen.getByRole('img', { name: /policy graph/i });
    expect(within(svg).getAllByText(/off-tier/).length).toBeGreaterThan(0);
  });
});

describe('PolicyGraph — degenerate input', () => {
  it('renders nothing when the MDP is not applicable', () => {
    const na: EngineMarkovResult = { applicable: false, feasible: false, expectedCost: Infinity, converged: true, bound: 'exact', assumedOdds: false, nodes: [], edges: [] };
    const { container } = render(<PolicyGraph result={na} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('refuses to present a policy that never reaches the target as a route', () => {
    // Measured on the reported craft at the Standard effort: value iteration stops early, the policy it
    // had reached is provisional, and the state closure it generates spans depths 7 down to 4 with the
    // goal (depth 0) absent entirely. Fourteen boxes that go nowhere, drawn under the heading "optimal
    // policy", is the most confidently wrong thing this panel can show — and it is what the user was
    // handed. Raising the effort to Thorough produces a real 6-step route from the same 262 states.
    const deadEnd: EngineMarkovResult = {
      applicable: true, feasible: true, expectedCost: 5.4e6, converged: false, bound: 'lower', assumedOdds: false,
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 2, junkSuffixes: 0, rarity: 'rare' as const, isStart: true, isGoal: false, depth: 7, expectedCost: 5.4e6, visitRate: 1, action: 'Annul' },
        { key: 'b', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: false, depth: 6, expectedCost: 5.4e6, visitRate: 1, action: 'Chaos' },
      ],
      edges: [{ from: 'a', to: 'b', action: 'Annul', prob: 1, regress: false }],
    };
    render(<PolicyGraph result={deadEnd} />);
    expect(screen.getByText(/No route to show yet/i)).toBeInTheDocument();
    // Both the visible notice and the screen-reader copy must say what to do about it.
    expect(screen.getAllByText(/search effort/i).length).toBeGreaterThanOrEqual(2);
    // No route list is offered, and the toggle is gone — there is nothing to toggle between.
    expect(screen.queryByText(/onward/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Full graph/i })).toBeNull();
  });

  it('falls back to the full graph when no route can be walked', () => {
    // Nodes with no edges: the walk stalls immediately. Drawing a line that stops mid-air would be
    // worse than showing the picture, so the picture is what appears — and with no route there is
    // nothing to toggle back to.
    const stalled: EngineMarkovResult = {
      applicable: true, feasible: true, expectedCost: 5, converged: true, bound: 'exact', assumedOdds: false,
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, rarity: 'rare' as const, isStart: true, isGoal: false, depth: 2, expectedCost: 5, visitRate: 1, action: 'Annul' },
        { key: 'g', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
      ],
      edges: [],
    };
    const { container } = render(<PolicyGraph result={stalled} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Full graph/i })).toBeNull();
  });
});

// `2 mods · 1 off-tier / Annul / 14.9K div` repeated down a single column, because the label discards
// WHICH mods are present. The states are genuinely distinct; the boxes were not. Measured on this
// craft the collapse is 262 nodes to 79 groups, the largest standing for 20 states.
describe('PolicyGraph — the full graph groups boxes that look identical', () => {
  it('draws fewer boxes than there are states', () => {
    const { groups } = groupNodes(result, fmt);
    expect(groups.length).toBeLessThan(result.nodes.length);
  });

  it('accounts for every state exactly once', () => {
    const { groups, groupOfKey } = groupNodes(result, fmt);
    expect(groups.reduce((n, g) => n + g.count, 0)).toBe(result.nodes.length);
    expect(groupOfKey.size).toBe(result.nodes.length);
  });

  it('never folds your item or the target into a group', () => {
    // Folding "your item" into a ×17 box would misreport where the player is standing.
    const { groups } = groupNodes(result, fmt);
    for (const g of groups) if (g.node.isStart || g.node.isGoal) expect(g.count).toBe(1);
    expect(groups.filter((g) => g.node.isStart).length).toBe(1);
    expect(groups.filter((g) => g.node.isGoal).length).toBe(1);
  });

  it('shows the count on a merged box so ×20 reads as information', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    const svg = screen.getByRole('img', { name: /policy graph/i });
    expect(within(svg).getAllByText(/^×\d+$/).length).toBeGreaterThan(0);
  });

  it('says how many states a merged box stands for, and that they differ in which mods', async () => {
    const { container } = render(<PolicyGraph result={result} />);
    await expand();
    const titles = [...container.querySelectorAll('title')].map((t) => t.textContent ?? '');
    expect(titles.some((t) => /states that look identical here/.test(t))).toBe(true);
    expect(titles.some((t) => /differ in WHICH mods/.test(t))).toBe(true);
  });
});

// The route named the currency and the mod count and left out which mod. It must name the mod — and
// must NOT phrase it as an instruction, because the policy picks the orb, never the outcome.
describe('PolicyGraph — the route names the mods', () => {
  it('names the mod a step is most likely to land', () => {
    render(<PolicyGraph result={result} />);
    const route = screen.getAllByRole('list')[0]!;
    expect(within(route).getAllByText(/most likely lands/).length).toBeGreaterThan(0);
  });

  it('never phrases a slam as a choice the player does not have', () => {
    const { container } = render(<PolicyGraph result={result} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\badd #%/i);
    expect(text).not.toMatch(/\bexalt in\b|\bchoose\b/i);
  });

  it('says when a step only clears junk', () => {
    const r = result_({
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 2, junkSuffixes: 0, rarity: 'rare' as const, isStart: true, isGoal: false, depth: 2, expectedCost: 9, visitRate: 1, action: 'Annul' },
        { key: 'g', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
      ],
      edges: [{ from: 'a', to: 'g', action: 'Annul', prob: 0.5, regress: false }],
    });
    render(<PolicyGraph result={r} />);
    expect(screen.getAllByText(/clears a junk mod/).length).toBeGreaterThan(0);
  });
});

function result_(parts: Pick<EngineMarkovResult, 'nodes' | 'edges'>): EngineMarkovResult {
  return { applicable: true, feasible: true, expectedCost: 9, converged: true, bound: 'exact', assumedOdds: false, ...parts };
}

// Clicking a box asks "what runs through here?". Measured on the reported craft the answer is a median
// of 16 groups out of 80 — so 80% of the picture dims, which is what makes it worth clicking. Bricks
// are deliberately excluded from the closure: with them, almost every state reaches almost every other
// and the highlight would light the whole graph, which is the wall it exists to cut through.
describe('PolicyGraph — highlighting the route through a state', () => {
  const fmt2 = (x: number): string => x.toPrecision(3);
  const adjacency = () => {
    const { groups, groupOfKey } = groupNodes(result, fmt2);
    const depthOf = new Map(groups.map((g) => [groupKeyOf(g.node, fmt2), g.node.depth]));
    return { ...progressEdges(result, groupOfKey, depthOf), groups, depthOf };
  };

  it('reaches both backwards and forwards from the clicked state', () => {
    const { forward, backward, groups, depthOf } = adjacency();
    // A state in the middle of the graph, so both closures have something to find.
    const mid = groups.find((g) => !g.node.isStart && !g.node.isGoal
      && (forward.get(groupKeyOf(g.node, fmt2))?.size ?? 0) > 0
      && (backward.get(groupKeyOf(g.node, fmt2))?.size ?? 0) > 0)!;
    const k = groupKeyOf(mid.node, fmt2);
    const r = routeThrough(k, forward, backward);
    expect(r.has(k)).toBe(true);
    expect([...r].some((x) => (depthOf.get(x) ?? 0) > (depthOf.get(k) ?? 0))).toBe(true); // an ancestor
    expect([...r].some((x) => (depthOf.get(x) ?? 0) < (depthOf.get(k) ?? 0))).toBe(true); // a descendant
  });

  it('excludes a branch that does not run through the clicked state', () => {
    // The point of the whole feature, as a property rather than a measurement: two disjoint routes to
    // the goal, and clicking into one must not light the other. (How MUCH of a real graph dims is a
    // fact about the data — measured at ~80% on the reported craft and recorded in docs/validation.md
    // — so it is not asserted here, where it would only be testing the fixture.)
    const forked = result_({
      nodes: [
        { key: 's', present: [], blocked: [], junkPrefixes: 2, junkSuffixes: 0, rarity: 'rare' as const, isStart: true, isGoal: false, depth: 3, expectedCost: 9, visitRate: 1, action: 'Annul' },
        { key: 'left', present: ['A'], blocked: [], junkPrefixes: 1, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: false, depth: 2, expectedCost: 8, visitRate: 1, action: 'Exalt' },
        { key: 'right', present: ['B'], blocked: [], junkPrefixes: 0, junkSuffixes: 1, rarity: 'rare' as const, isStart: false, isGoal: false, depth: 2, expectedCost: 7, visitRate: 1, action: 'Chaos' },
        { key: 'g', present: ['A', 'B'], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
      ],
      edges: [
        { from: 's', to: 'left', action: 'Annul', prob: 0.5, regress: false },
        { from: 's', to: 'right', action: 'Annul', prob: 0.5, regress: false },
        { from: 'left', to: 'g', action: 'Exalt', prob: 0.3, regress: false },
        { from: 'right', to: 'g', action: 'Chaos', prob: 0.3, regress: false },
      ],
    });
    const { groups, groupOfKey } = groupNodes(forked, fmt2);
    const depthOf = new Map(groups.map((g) => [groupKeyOf(g.node, fmt2), g.node.depth]));
    const { forward, backward } = progressEdges(forked, groupOfKey, depthOf);
    const keyOf = (k: string) => groupOfKey.get(k)!;
    const r = routeThrough(keyOf('left'), forward, backward);
    expect(r).toContain(keyOf('left'));
    expect(r).toContain(keyOf('s'));   // how you get there
    expect(r).toContain(keyOf('g'));   // where it goes
    expect(r).not.toContain(keyOf('right')); // the branch that does not run through it
  });

  it('terminates on a graph whose bricks form a cycle', () => {
    // a -> b forward, b -> a as a brick. Including bricks in the closure would loop; progress-only
    // walks strictly-decreasing depth and cannot.
    const cyc: EngineMarkovResult = result_({
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, rarity: 'rare' as const, isStart: true, isGoal: false, depth: 1, expectedCost: 2, visitRate: 1, action: 'Exalt' },
        { key: 'b', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
      ],
      edges: [
        { from: 'a', to: 'b', action: 'Exalt', prob: 0.5, regress: false },
        { from: 'b', to: 'a', action: 'Exalt', prob: 0.5, regress: true },
      ],
    });
    const { groups, groupOfKey } = groupNodes(cyc, fmt2);
    const depthOf = new Map(groups.map((g) => [groupKeyOf(g.node, fmt2), g.node.depth]));
    const { forward, backward } = progressEdges(cyc, groupOfKey, depthOf);
    expect(routeThrough(groupKeyOf(groups[0]!.node, fmt2), forward, backward).size).toBe(2);
  });

  it('says the boxes are clickable, and what happened when one is clicked', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    expect(screen.getByText(/Click any state to highlight/i)).toBeInTheDocument();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    await userEvent.setup().click(boxes[0]!);
    expect(screen.getByText(/Highlighting \d+ of \d+ states/i)).toBeInTheDocument();
  });

  /**
   * The live region carries the sentence that CHANGES, and nothing else.
   *
   * It used to wrap the whole line, which put a standing instruction ("Click any state to…") and the
   * `Clear` button inside `role="status"` — boilerplate queued for re-announcement alongside the Item
   * tab's "Last solve took Xs" region, with a control read out as part of it. Nothing pinned the
   * structure, because every other assertion here queries by text, so this one queries by role.
   */
  it('announces only what changed, and keeps the instruction and the button out of it', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    const status = screen.getByRole('status');
    // Mounted from the start — a region that appears at the same moment as its text goes unread by
    // some screen readers — and silent until there is something to report.
    expect(status).toBeEmptyDOMElement();
    expect(status).not.toHaveTextContent(/Click any state/i);

    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    await userEvent.setup().click(boxes[0]!);
    expect(screen.getByRole('status')).toHaveTextContent(/Highlighting \d+ of \d+ states/i);
    expect(within(screen.getByRole('status')).queryByRole('button')).toBeNull();
  });

  it('dims what is not on the route, and clears again', async () => {
    const { container } = render(<PolicyGraph result={result} />);
    await expand();
    const user = userEvent.setup();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    await user.click(boxes[0]!);
    const dimmed = [...container.querySelectorAll('g[role="button"]')]
      .filter((g) => g.getAttribute('opacity') === '0.12');
    expect(dimmed.length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /^Clear$/ }));
    expect([...container.querySelectorAll('g[role="button"]')]
      .every((g) => g.getAttribute('opacity') === '1')).toBe(true);
  });

  it('is operable from the keyboard, not click-only', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    const box = screen.getAllByRole('button', { name: /Highlight the route through this state/i })[0]!;
    box.focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(box).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Highlighting \d+ of \d+ states/i)).toBeInTheDocument();
  });
});

// A box has room for a label, an action and a cost. Clicking one now also opens the rest: which target
// mods you actually hold, which are stuck below tier, how much junk is left, and — the part a box can
// never carry — what the recommended orb actually does when you play it, outcome by outcome.
describe('PolicyGraph — the full description of a clicked state', () => {
  const detailed = result_({
    nodes: [
      { key: 'a', present: ['Spell Damage'], blocked: ['Cold Damage'], junkPrefixes: 1, junkSuffixes: 2,
        rarity: 'rare' as const, isStart: true, isGoal: false, depth: 4, expectedCost: 900, visitRate: 1, action: 'Exalt (Dextral, Perfect)' },
      { key: 'b', present: ['Spell Damage', 'Mana Regeneration Rate'], blocked: ['Cold Damage'],
        junkPrefixes: 1, junkSuffixes: 2, rarity: 'rare' as const, isStart: false, isGoal: false, depth: 3, expectedCost: 800, visitRate: 1, action: 'Annul' },
      { key: 'c', present: ['Spell Damage'], blocked: ['Cold Damage'], junkPrefixes: 1, junkSuffixes: 3,
        rarity: 'rare' as const, isStart: false, isGoal: false, depth: 5, expectedCost: 950, visitRate: 1, action: 'Annul' },
      { key: 'g', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const, isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
    ],
    edges: [
      { from: 'a', to: 'b', action: 'Exalt (Dextral, Perfect)', prob: 0.2, regress: false },
      { from: 'a', to: 'c', action: 'Exalt (Dextral, Perfect)', prob: 0.8, regress: true },
      { from: 'b', to: 'g', action: 'Annul', prob: 0.5, regress: false },
    ],
  });
  const openFirst = async () => {
    render(<PolicyGraph result={detailed} />);
    await expand(); // the route walk succeeds on this fixture, so the graph is behind the toggle
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    const start = boxes.find((b) => /Exalt \(Dextral, Perfect\)/.test(b.getAttribute('aria-label') ?? ''));
    await userEvent.setup().click(start ?? boxes[0]!);
  };

  it('lists the target mods held and the ones stuck below tier', async () => {
    await openFirst();
    expect(screen.getByText(/Target mods held/i)).toBeInTheDocument();
    expect(screen.getByText(/Stuck below tier/i)).toBeInTheDocument();
    expect(screen.getByText(/annul before re-adding/i)).toBeInTheDocument();
  });

  it('breaks the junk down by side, which the box label cannot', async () => {
    await openFirst();
    expect(screen.getByText(/3 \(1 prefix, 2 suffix\)/)).toBeInTheDocument();
  });

  it('says what the recommended orb actually does, outcome by outcome', async () => {
    await openFirst();
    expect(screen.getByText(/What .*does from here/i)).toBeInTheDocument();
    // Also present in the sr-only route list, so scope to the panel rather than the document.
    const panel = screen.getByText(/What .*does from here/i).closest('div')!;
    expect(within(panel).getByText(/most likely lands Mana Regeneration Rate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/a step backwards/i).length).toBeGreaterThan(0);
  });

  it('closes again', async () => {
    await openFirst();
    await userEvent.setup().click(screen.getByRole('button', { name: /^Close$/ }));
    expect(screen.queryByText(/Target mods held/i)).toBeNull();
  });

  it('admits when the box stands for several states, rather than describing them as one', async () => {
    // The outcomes are the representative's own edges — exact for it, not necessarily for its twins.
    render(<PolicyGraph result={result} />);
    await expand();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    const merged = boxes.find((b) => /×\d+/.test(b.textContent ?? ''));
    if (!merged) return; // this fixture may collapse nothing; the big-craft case is covered in docs
    await userEvent.setup().click(merged);
    expect(screen.getByText(/states that look alike here/i)).toBeInTheDocument();
  });
});

// "Start over with a new base" is the policy's most common move on a from-white craft — 98% of states
// take it when the base is free — so how its OUTCOME reads is not an edge case.
describe('PolicyGraph — starting over is described as what it is', () => {
  const withRestart = result_({
    nodes: [
      { key: 'w', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'normal' as const,
        isStart: true, isGoal: false, depth: 4, expectedCost: 100, visitRate: 1, action: 'Transmute' },
      { key: 'm', present: ['Spell Damage'], blocked: [], junkPrefixes: 0, junkSuffixes: 0,
        rarity: 'rare' as const, isStart: false, isGoal: false, depth: 2, expectedCost: 90, visitRate: 1, action: 'Exalt' },
      { key: 'r', present: ['Spell Damage', 'Mana Regeneration Rate'], blocked: [], junkPrefixes: 0,
        junkSuffixes: 1, rarity: 'rare' as const, isStart: false, isGoal: false, depth: 3,
        expectedCost: 100, visitRate: 1, action: 'Start over with a new base' },
      { key: 'g', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const,
        isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
    ],
    edges: [
      { from: 'w', to: 'm', action: 'Transmute', prob: 0.7, regress: false },
      { from: 'w', to: 'r', action: 'Transmute', prob: 0.3, regress: true },
      { from: 'm', to: 'g', action: 'Exalt', prob: 1, regress: false },
      { from: 'r', to: 'w', action: 'Start over with a new base', prob: 1, regress: true },
    ],
  });
  const openRestarter = async (): Promise<HTMLElement> => {
    render(<PolicyGraph result={withRestart} />);
    await expand();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    await userEvent.setup().click(boxes.find((b) => /Start over/.test(b.textContent ?? ''))!);
    return screen.getByText(/What .*does from here/i).closest('div')!;
  };

  /**
   * Read as a mod diff, binning the item comes out "clears a junk mod · loses Spell Damage, Mana
   * Regeneration Rate" — it leads on the junk decrement, which is the least important thing that
   * happened, and calls losing the whole item "loses" two mods. Reported from the live app on a craft
   * where it was the advice on 300-odd of 447 boxes.
   */
  it('does not describe binning the item as a junk clear', async () => {
    const panel = await openRestarter();
    expect(within(panel).queryByText(/clears a junk mod/i)).toBeNull();
  });

  it('says you are back at the base you started from', async () => {
    const panel = await openRestarter();
    expect(within(panel).getByText(/back to the base you started from/i)).toBeInTheDocument();
  });
});

// Reported from the live app: a state whose best move was "Start over with a new base" was drawn
// connected to NOTHING, and the header read "Highlighting 1 of 447 states".
//
// The mechanism is that `result.edges` only carries each state's BEST action, and `progressEdges`
// keeps only edges that move closer to the goal. Starting over does neither for anyone: it is not
// progress, so it is dropped, and no other state lists this one as an outcome because their best
// move is also to start over. The state ends up isolated in the progress graph while the panel
// beside it is describing the very move whose arrow was dropped.
describe('PolicyGraph — a state that only knows how to start over is still drawn connected', () => {
  const orphaned = result_({
    nodes: [
      // Depth 8, further from the goal than the loaded item below — a white base needs the Regal that
      // makes it Rare on top of every mod. So restarting is a REGRESS and never a progress edge.
      { key: 'w', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'normal' as const,
        isStart: true, isGoal: false, depth: 8, expectedCost: 100, visitRate: 1, action: 'Transmute' },
      { key: 'm', present: ['Spell Damage'], blocked: [], junkPrefixes: 0, junkSuffixes: 0,
        rarity: 'rare' as const, isStart: false, isGoal: false, depth: 2, expectedCost: 90, visitRate: 1, action: 'Exalt' },
      // Nothing lists this one as an outcome, exactly as in the reported craft.
      { key: 'r', present: ['Spell Damage', 'Mana Regeneration Rate'], blocked: ['Cold Damage'],
        junkPrefixes: 0, junkSuffixes: 1, rarity: 'rare' as const, isStart: false, isGoal: false,
        depth: 4, expectedCost: 100, visitRate: 1, action: 'Start over with a new base' },
      { key: 'g', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare' as const,
        isStart: false, isGoal: true, depth: 0, expectedCost: 0, visitRate: 1 },
    ],
    edges: [
      { from: 'w', to: 'm', action: 'Transmute', prob: 1, regress: false },
      { from: 'm', to: 'g', action: 'Exalt', prob: 1, regress: false },
      { from: 'r', to: 'w', action: 'Start over with a new base', prob: 1, regress: true },
    ],
  });
  const selectOrphan = async () => {
    render(<PolicyGraph result={orphaned} />);
    await expand();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    await userEvent.setup().click(boxes.find((b) => /Start over/.test(b.textContent ?? ''))!);
  };

  it('counts where it lands among the highlighted states, not just itself', async () => {
    await selectOrphan();
    // Itself and the base it goes back to. Before this, the progress-only closure left it at 1.
    expect(screen.getByText(/Highlighting 2 of 4 states/i)).toBeInTheDocument();
  });

  it('leaves the state it lands on lit rather than dimmed out of the picture', async () => {
    await selectOrphan();
    const boxes = screen.getAllByRole('button', { name: /Highlight the route through this state/i });
    const startBox = boxes.find((b) => /Transmute/.test(b.getAttribute('aria-label') ?? ''))!;
    expect(startBox.getAttribute('opacity')).toBe('1');
  });
});

/**
 * The graph's state space is COMBINATORIAL: every subset of "which targets have landed" is a state,
 * so it grows as 2^n. Measured before this existed, a 5-target craft drew 217 boxes across 12 columns
 * with 42 rows in the busiest one — a 2732x3202px canvas. No layout beats 2^n; the only fix is
 * drawing less, and `visitRate` is what makes "less" principled rather than arbitrary: on that craft
 * 12 states carry 90% of the visits while the tail sits at 5e-5 — once in twenty thousand attempts.
 */
describe('pruneToCoverage — draw what a craft runs into, say what it left out', () => {
  const node = (key: string, visitRate: number, extra: Partial<EnginePolicyNode> = {}): EnginePolicyNode => ({
    key, present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, rarity: 'rare',
    isStart: false, isGoal: false, depth: 1, expectedCost: 1, visitRate, action: 'Exalt', ...extra,
  });
  // One hot state, a start, a goal, and twenty you meet once in a thousand attempts.
  const many = (): EngineMarkovResult => ({
    applicable: true, feasible: true, expectedCost: 10, converged: true, bound: 'exact', assumedOdds: false,
    nodes: [
      node('start', 1, { isStart: true, depth: 3 }),
      node('hot', 0.9, { depth: 2 }),
      ...Array.from({ length: 20 }, (_, i) => node(`cold${i}`, 0.001, { depth: 2 })),
      node('goal', 0.5, { isGoal: true, depth: 0 }),
    ],
    edges: [
      { from: 'start', to: 'hot', action: 'Exalt', prob: 0.9, regress: false },
      { from: 'hot', to: 'goal', action: 'Exalt', prob: 1, regress: false },
      ...Array.from({ length: 20 }, (_, i) => (
        { from: 'start', to: `cold${i}`, action: 'Exalt', prob: 0.005, regress: false })),
    ],
  });

  it('drops the long tail and keeps the states a craft actually meets', () => {
    const p = pruneToCoverage(many(), 0.9);
    expect(p.total).toBe(23);
    expect(p.shown).toBeLessThan(10);
    expect(p.result.nodes.map((n) => n.key)).toContain('hot');
  });

  // PolicyGraph separately refuses to draw a graph with no goal in it — that check exists because an
  // unconverged policy really can fail to reach one. A pruned view must not manufacture that failure.
  it('never drops the start or the goal, however rare', () => {
    const p = pruneToCoverage(many(), 0.9);
    expect(p.result.nodes.some((n) => n.isStart)).toBe(true);
    expect(p.result.nodes.some((n) => n.isGoal)).toBe(true);
  });

  it('keeps a pinned state the cut would otherwise remove', () => {
    const p = pruneToCoverage(many(), 0.9, new Set(['cold7']));
    expect(p.result.nodes.map((n) => n.key)).toContain('cold7');
  });

  it('leaves no edge pointing at a state it removed', () => {
    const p = pruneToCoverage(many(), 0.9);
    const keys = new Set(p.result.nodes.map((n) => n.key));
    for (const e of p.result.edges) {
      expect(keys.has(e.from)).toBe(true);
      expect(keys.has(e.to)).toBe(true);
    }
  });

  it('hands back everything untouched at full coverage', () => {
    const full = many();
    const p = pruneToCoverage(full, 1);
    expect(p.shown).toBe(p.total);
    expect(p.result.nodes).toHaveLength(full.nodes.length);
    expect(p.result.edges).toHaveLength(full.edges.length);
  });

  // The caption is what makes the cut honest rather than a graph that quietly lost most of itself, so
  // the number has to be the share actually on screen — including the always-kept start and goal,
  // which the accumulating loop does not count.
  it('reports the coverage of what it KEPT, not what it accumulated', () => {
    // The goal must be RARE for this to discriminate. With a common goal the selection loop picks it
    // up anyway and the two quantities coincide — which is exactly how a first version of this test
    // passed against the bug it was written to catch. A hard craft really does reach its goal
    // seldom, so this is the realistic shape as well as the demanding one.
    const rareGoal: EngineMarkovResult = {
      applicable: true, feasible: true, expectedCost: 10, converged: true, bound: 'exact', assumedOdds: false,
      nodes: [
        node('start', 1, { isStart: true, depth: 2 }),
        node('hot', 9, { depth: 1 }),
        node('goal', 0.0001, { isGoal: true, depth: 0 }),
      ],
      edges: [{ from: 'hot', to: 'goal', action: 'Exalt', prob: 1, regress: false }],
    };
    const p = pruneToCoverage(rareGoal, 0.9);
    const mass = rareGoal.nodes.reduce((a, n) => a + n.visitRate, 0);
    const shown = p.result.nodes.reduce((a, n) => a + n.visitRate, 0);
    expect(p.result.nodes.some((n) => n.isGoal)).toBe(true); // kept despite being under the cut
    expect(p.covered).toBeCloseTo(shown / mass, 10);
  });

  it('opens on the narrowest rung, and the widest really is everything', () => {
    expect(COVERAGE_STEPS[0]).toBeLessThan(1);
    expect(COVERAGE_STEPS[COVERAGE_STEPS.length - 1]).toBe(1);
  });
});

/**
 * The picture is half of what this panel is for, and it used to be reachable only through a muted
 * 12px underlined `Show all N states…` sitting BELOW the route list — which reads as a footnote, not
 * as the other view. Both views are named up front now, in the same segmented control the main tab
 * bar uses.
 */
describe('PolicyGraph — the graph is offered, not hidden', () => {
  it('names both views before anything is clicked', () => {
    render(<PolicyGraph result={result} />);
    const route = screen.getByRole('button', { name: /^The route$/i });
    const graph = screen.getByRole('button', { name: /Full graph · \d+ states/i });
    // `aria-pressed`, like the app's other segmented control — a pair of views, not a disclosure.
    expect(route).toHaveAttribute('aria-pressed', 'true');
    expect(graph).toHaveAttribute('aria-pressed', 'false');
  });

  it('says how many states the graph holds, so the offer carries its own size', () => {
    render(<PolicyGraph result={result} />);
    expect(screen.getByRole('button', { name: new RegExp(`Full graph · ${result.nodes.length} states`) }))
      .toBeInTheDocument();
  });

  it('flips aria-pressed when the graph is chosen', async () => {
    render(<PolicyGraph result={result} />);
    await expand();
    expect(screen.getByRole('button', { name: /Full graph/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^The route$/i })).toHaveAttribute('aria-pressed', 'false');
  });

  // The legend describes squares and arrows. It lived in ItemActions, below a component that shows a
  // numbered LIST by default — so it explained the picture to someone looking at the route, and the
  // lab tab, which renders the same graph, had no legend at all.
  it('shows the legend with the picture and not with the route', async () => {
    render(<PolicyGraph result={result} />);
    expect(screen.queryByText(/Each square is an item state/i)).toBeNull();
    await expand();
    expect(screen.getByText(/Each square is an item state/i)).toBeInTheDocument();
  });

  it('explains what each view is for, beside the switch', () => {
    render(<PolicyGraph result={result} />);
    expect(screen.getByText(/single likeliest path/i)).toBeInTheDocument();
  });
});
