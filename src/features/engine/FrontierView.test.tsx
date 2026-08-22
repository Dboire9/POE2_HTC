import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FrontierView from './FrontierView';
import type { EngineResult } from '../../lib/engine';

const empty: EngineResult = {
  frontier: [], plansEvaluated: 1, currencyDepth: 'full',
};

// An empty frontier means THIS SEARCH found nothing. It does not mean the craft is impossible: a legal
// route the planner doesn't explore lands here too — the desecration filler route (roll junk, annul it
// off, Desecrate) is one, and it cost a user real time when this panel blamed the item level instead.
// See docs/copy-audit.md row 4.
describe('FrontierView — the empty state does not overclaim', () => {
  it('never tells the player the target is impossible', () => {
    const { container } = render(<FrontierView result={empty} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/is impossible/i);
    expect(text).not.toMatch(/cannot be crafted|can’t be crafted/i);
  });

  it('still names the likely cause, so it is not merely vague', () => {
    render(<FrontierView result={empty} />);
    expect(screen.getByText(/tier gated above the item\s+level/i)).toBeInTheDocument();
  });

  it('admits the search may simply not cover the route', () => {
    render(<FrontierView result={empty} />);
    expect(screen.getByText(/route the planner doesn’t\s+explore/i)).toBeInTheDocument();
  });

  // The caller's own reason must still win — it is always more specific than the fallback, and showing
  // both would hand the player two competing explanations.
  it('defers to a caller-supplied hint entirely', () => {
    render(<FrontierView result={empty} emptyHint={<p>Because of the thing.</p>} />);
    expect(screen.getByText('Because of the thing.')).toBeInTheDocument();
    expect(screen.queryByText(/tier gated above the item/i)).toBeNull();
  });

  // Regression from the same sweep: "1 plans evaluated".
  // No leading \b — the badge text runs straight into the count ("…strength1 plan evaluated"), so a
  // word boundary before the digit never matches. Anchor on the singular noun instead.
  it('counts plans in grammatical English', () => {
    const { container } = render(<FrontierView result={empty} />);
    expect(container.textContent).toMatch(/1 plan evaluated/);
    expect(container.textContent).not.toMatch(/1 plans evaluated/);
    const many = render(<FrontierView result={{ ...empty, plansEvaluated: 2 }} />);
    expect(many.container.textContent).toMatch(/2 plans evaluated/);
  });
});
