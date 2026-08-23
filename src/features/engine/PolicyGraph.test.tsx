import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PolicyGraph from './PolicyGraph';
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

describe('PolicyGraph', () => {
  it('renders a node square per policy state and edges (incl. brick back-arrows)', () => {
    const { container } = render(<PolicyGraph result={result} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toBeTruthy();
    // one <rect> per state (plus none extra) and at least one <path> edge.
    expect(container.querySelectorAll('rect').length).toBe(result.nodes.length);
    expect(container.querySelectorAll('path[marker-end]').length).toBeGreaterThan(0);
    // a brick edge is drawn dashed (the back-arrow).
    expect(container.querySelector('path[stroke-dasharray]')).toBeTruthy();
  });

  it('labels the goal and the start', () => {
    const { getByText, getAllByText } = render(<PolicyGraph result={result} />);
    expect(getByText('✓ target')).toBeInTheDocument();
    expect(getAllByText('start').length).toBeGreaterThan(0);
  });

  it('shows an off-tier (blocked) state for a specific-tier target', () => {
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
    const { getAllByText } = render(<PolicyGraph result={tiered} />);
    expect(getAllByText(/off-tier/).length).toBeGreaterThan(0);
  });

  it('renders nothing when the MDP is not applicable', () => {
    const na: EngineMarkovResult = { applicable: false, feasible: false, expectedCost: Infinity, converged: true, assumedOdds: false, nodes: [], edges: [] };
    const { container } = render(<PolicyGraph result={na} />);
    expect(container).toBeEmptyDOMElement();
  });
});
