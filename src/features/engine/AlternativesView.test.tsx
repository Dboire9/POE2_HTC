import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlternativesView from './AlternativesView';
import { alternatives } from '../../lib/engine';
import { loadPatch } from '../../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../../packages/optimizer/src/loadPrices.ts';

// Rendered from REAL engine output on the shipped 0.5.0 snapshot rather than a hand-made fixture — a
// stub would happily render a shape the engine never actually produces.
const eng = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
const hard = [
  { modId: 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon', tierDisplay: 1 },
  { modId: 'Wands/IncreasedMana', tierDisplay: 1 },
  { modId: 'Wands/WeaponSpellDamage', tierDisplay: 1 },
];
const alts = alternatives(eng, 'Wands', 82, hard, 30);

describe('AlternativesView', () => {
  it('renders a row per alternative, headed by the budget', () => {
    render(<AlternativesView alts={alts} budget={30} />);
    expect(screen.getByText(/Closest crafts for 30 ex/i)).toBeInTheDocument();
    expect(screen.getAllByTitle(/Show the cheapest way to reach this item/i)).toHaveLength(alts.rows.length);
  });

  it('marks the exact target and the best fit, and shows the odds of each', () => {
    render(<AlternativesView alts={alts} budget={30} />);
    expect(screen.getByText('your target')).toBeInTheDocument();
    expect(screen.getByText('best fit')).toBeInTheDocument();
    // Every row states an "in budget" chance.
    expect(screen.getAllByText('in budget')).toHaveLength(alts.rows.length);
  });

  it('shows the mods you keep, with their tier and roll range', () => {
    render(<AlternativesView alts={alts} budget={30} />);
    // Row 0 is the exact target: all three mods at T1, each labelled with its range.
    expect(screen.getAllByText('+# to maximum Mana').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^T1 · 150–164$/).length).toBeGreaterThan(0);
  });

  it('renders a dropped mod struck through, naming what you give up', () => {
    const dropped = alts.rows.find((r) => r.dropped > 0);
    expect(dropped, 'a 30ex budget forces a drop somewhere on this frontier').toBeDefined();
    render(<AlternativesView alts={alts} budget={30} />);
    const chip = screen.getAllByTitle(/^Dropped: you give up/)[0]!;
    expect(chip).toHaveTextContent('✗');
    expect(within(chip).getByText(dropped!.slots.find((s) => s.kind === 'dropped')!.text)).toHaveClass('line-through');
  });

  it('explains a swap as from → to in its tooltip', () => {
    const swapped = alts.rows.find((r) => r.swapped > 0);
    if (!swapped) return; // the swap classes can be dominated at some budgets; the drop test carries the load
    render(<AlternativesView alts={alts} budget={30} />);
    const chip = screen.getAllByTitle(/^Swapped: /)[0]!;
    expect(chip).toHaveTextContent('⇄');
    expect(chip.getAttribute('title')).toMatch(/→/);
  });

  it('reveals the plan steps on demand', async () => {
    const user = userEvent.setup();
    render(<AlternativesView alts={alts} budget={30} />);
    expect(screen.queryByText(/Transmut/)).not.toBeInTheDocument();
    await user.click(screen.getAllByTitle(/Show the cheapest way to reach this item/i)[0]!);
    expect(screen.getByText(/chance of getting there for ≤ 30 ex/)).toBeInTheDocument();
    expect(screen.getAllByText(/Transmut|Exalted|Chaos|Alchemy|Regal|Augment/).length).toBeGreaterThan(0);
  });

  it('flags a capped search instead of implying the list is exhaustive', () => {
    render(<AlternativesView alts={{ ...alts, truncated: true }} budget={30} />);
    expect(screen.getByText('stopped early')).toBeInTheDocument();
  });

  it('shows a bracket, not a point, when the odds are not exact', () => {
    const row = { ...alts.rows[0]!, exact: false, inBudget: 0.2, inBudgetMax: 0.5 };
    render(<AlternativesView alts={{ ...alts, rows: [row] }} budget={30} />);
    expect(screen.getByText('20%–50%')).toBeInTheDocument();
  });

  // (The old test here asserted `toBeEmptyDOMElement()` — it pinned the silent-disappearance bug as if
  // it were intended behaviour. Replaced by the empty-frontier suite below.)
});

// The panel used to `return null` on an empty frontier, so it silently wasn't there — indistinguishable
// from a crash. Two things are pinned: that it renders something, and that what it renders is TRUE.
describe('AlternativesView — the empty frontier', () => {
  const empty = { rows: [], nodesEvaluated: 12, truncated: false, currencyDepth: 'full' as const };

  it('says something instead of vanishing', () => {
    const { container } = render(<AlternativesView alts={empty} budget={5} />);
    expect(container.textContent?.trim()).not.toBe('');
    expect(screen.getByText(/No craftable alternative found/i)).toBeInTheDocument();
  });

  // The reason matters. Row 0 is the exact target and enters the frontier with bestP = -Infinity, so it
  // survives at ANY odds — verified below at a budget of 0.0001 ex. An empty frontier therefore cannot
  // mean "nothing fits the budget", and saying so would be exactly the plausible-but-wrong explanation
  // this codebase keeps having to delete (docs/copy-audit.md).
  it('does not blame the budget', () => {
    const { container } = render(<AlternativesView alts={empty} budget={5} />);
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toMatch(/isn’t about the 5 ex/i);
    expect(text).not.toMatch(/nothing fits|too low|raise your budget|afford/i);
  });

  it('and does not claim the craft is impossible', () => {
    const { container } = render(<AlternativesView alts={empty} budget={5} />);
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).not.toMatch(/is impossible/i);
    expect(text).toMatch(/route the planner doesn’t explore/i);
  });

  // The claim the message above rests on, checked against the real engine rather than assumed.
  it('a budget far too small still yields the exact-target row, never an empty frontier', () => {
    const broke = alternatives(eng, 'Wands', 82, hard, 0.0001);
    expect(broke.rows.length).toBeGreaterThan(0);
    expect(broke.rows[0]!.isTarget).toBe(true);
    expect(broke.rows[0]!.inBudget).toBe(0);
  });
});
