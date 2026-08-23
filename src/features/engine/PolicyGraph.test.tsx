import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PolicyGraph, { groupNodes } from './PolicyGraph';
import { optimizeItemMarkov } from '../../lib/engine';
import { loadPatch } from '../../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../../packages/optimizer/src/loadPrices.ts';
import type { EngineMarkovResult } from '../../lib/engine';

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
  await userEvent.setup().click(screen.getByRole('button', { name: /Show all \d+ states/i }));
};

// The default view is the ROUTE, not the state space. A five-target craft reaches 262 states, most
// sharing a label and all rounding to the same cost — complete, and unreadable. The full graph is
// still here, one click away.
describe('PolicyGraph — the route', () => {
  it('leads with the route rather than the state graph', () => {
    const { container } = render(<PolicyGraph result={result} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('button', { name: /Show all \d+ states/i })).toBeInTheDocument();
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
    await userEvent.setup().click(screen.getByRole('button', { name: /Show just the route/i }));
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
    const svg = screen.getByRole('img', { name: /policy graph/i });
    expect(within(svg).getAllByText(/off-tier/).length).toBeGreaterThan(0);
  });
});

describe('PolicyGraph — degenerate input', () => {
  it('renders nothing when the MDP is not applicable', () => {
    const na: EngineMarkovResult = { applicable: false, feasible: false, expectedCost: Infinity, converged: true, assumedOdds: false, nodes: [], edges: [] };
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
      applicable: true, feasible: true, expectedCost: 5.4e6, converged: false, assumedOdds: false,
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 2, junkSuffixes: 0, isStart: true, isGoal: false, depth: 7, expectedCost: 5.4e6, action: 'Annul' },
        { key: 'b', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, isStart: false, isGoal: false, depth: 6, expectedCost: 5.4e6, action: 'Chaos' },
      ],
      edges: [{ from: 'a', to: 'b', action: 'Annul', prob: 1, regress: false }],
    };
    render(<PolicyGraph result={deadEnd} />);
    expect(screen.getByText(/No route to show yet/i)).toBeInTheDocument();
    // Both the visible notice and the screen-reader copy must say what to do about it.
    expect(screen.getAllByText(/search effort/i).length).toBeGreaterThanOrEqual(2);
    // No route list is offered, and the toggle is gone — there is nothing to toggle between.
    expect(screen.queryByText(/onward/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Show all/i })).toBeNull();
  });

  it('falls back to the full graph when no route can be walked', () => {
    // Nodes with no edges: the walk stalls immediately. Drawing a line that stops mid-air would be
    // worse than showing the picture, so the picture is what appears — and with no route there is
    // nothing to toggle back to.
    const stalled: EngineMarkovResult = {
      applicable: true, feasible: true, expectedCost: 5, converged: true, assumedOdds: false,
      nodes: [
        { key: 'a', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, isStart: true, isGoal: false, depth: 2, expectedCost: 5, action: 'Annul' },
        { key: 'g', present: [], blocked: [], junkPrefixes: 0, junkSuffixes: 0, isStart: false, isGoal: true, depth: 0, expectedCost: 0 },
      ],
      edges: [],
    };
    const { container } = render(<PolicyGraph result={stalled} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Show all/i })).toBeNull();
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
        { key: 'a', present: [], blocked: [], junkPrefixes: 2, junkSuffixes: 0, isStart: true, isGoal: false, depth: 2, expectedCost: 9, action: 'Annul' },
        { key: 'g', present: [], blocked: [], junkPrefixes: 1, junkSuffixes: 0, isStart: false, isGoal: true, depth: 0, expectedCost: 0 },
      ],
      edges: [{ from: 'a', to: 'g', action: 'Annul', prob: 0.5, regress: false }],
    });
    render(<PolicyGraph result={r} />);
    expect(screen.getAllByText(/clears a junk mod/).length).toBeGreaterThan(0);
  });
});

function result_(parts: Pick<EngineMarkovResult, 'nodes' | 'edges'>): EngineMarkovResult {
  return { applicable: true, feasible: true, expectedCost: 9, converged: true, assumedOdds: false, ...parts };
}
