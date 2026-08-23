import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FrontierView from './FrontierView';
import type { EnginePriceBasis, EngineResult } from '../../lib/engine';

const empty: EngineResult = {
  frontier: [], plansEvaluated: 1, currencyDepth: 'full', assumedOdds: false,
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
  // textContent has NO separators between elements, so this phrase is flanked by word characters on
  // both sides ("…orb strengthchecked 1 planNo achievable plan…"). Neither a leading nor a trailing
  // \b can match; the plural is ruled out by the negative assertion instead.
  it('counts plans in grammatical English', () => {
    const { container } = render(<FrontierView result={empty} />);
    expect(container.textContent).toMatch(/checked 1 plan/);
    expect(container.textContent).not.toMatch(/checked 1 plans/);
    const many = render(<FrontierView result={{ ...empty, plansEvaluated: 2 }} />);
    expect(many.container.textContent).toMatch(/checked 2 plans/);
  });
});

// The reported craft, in miniature. `expected` is computed under restart-on-first-failure — a miss
// hands you a free replacement of your starting item. From a white base that is roughly true. From the
// Rare in your stash it is fiction, and the ranking it produces inverts: an Annulment costs 158.7ex
// against an Exalt's 1ex, so burying the Annuls behind a 0.1% gate you rarely pass "saves" ~65x and
// the cheapest plan is one no player would run. On the real craft the surest route — annul, annul,
// then exalt, which is what a player reaches for — sat last on the list at 7.7x the success chance.
const cheapButSilly = { probability: 1.77e-7, expected: 1.07e7, perAttempt: 340, expectedAttempts: 5.6e6, steps: [] };
const dearButSensible = { probability: 1.36e-6, expected: 1.78e8, perAttempt: 357, expectedAttempts: 7.3e5, steps: [] };
const twoPlans: EngineResult = {
  frontier: [cheapButSilly, dearButSensible], // search order is always cheapest → surest
  plansEvaluated: 295_680, currencyDepth: 'base-only', assumedOdds: false,
};

const costOf = (card: HTMLElement) => card.textContent ?? '';

describe('FrontierView — whether a restart is really free', () => {
  const cards = () => screen.getAllByText(/chance per attempt/i).map((el) => el.closest('div.rounded-lg') as HTMLElement);

  it('leads with the cheapest when a restart IS free (a white base)', () => {
    render(<FrontierView result={twoPlans} freeRestart />);
    expect(costOf(cards()[0]!)).toContain('cheapest');
    expect(costOf(cards()[0]!)).toContain('expected cost');
  });

  it('leads with the likeliest route when it is not', () => {
    render(<FrontierView result={twoPlans} freeRestart={false} />);
    // Surest first — the annuls-first route a player would actually run.
    expect(costOf(cards()[0]!)).toContain('likeliest');
  });

  // Dividing a real per-run cost by a ~1e-13 chance gives billions of divine. It is arithmetically
  // right and it is not a budget — nobody runs a sequence 1e14 times, they abandon it. Reported as
  // "i do not like the Step-by-step routes, the costs are astronomical".
  it('shows no free-restart total at all on a held item', () => {
    render(<FrontierView result={twoPlans} freeRestart={false} />);
    expect(screen.queryByText(/expected cost/i)).toBeNull();
    expect(screen.queryByText(/cost if restarts were free/i)).toBeNull();
    expect(screen.queryByText(/attempts$/i)).toBeNull();
  });

  it('keeps the two figures you can act on', () => {
    render(<FrontierView result={twoPlans} freeRestart={false} />);
    expect(screen.getAllByText(/chance per attempt/i).length).toBe(2);
    expect(screen.getAllByText(/what one run costs/i).length).toBe(2);
  });

  it('keeps "best value" on the plan the search picked, not on whatever ends up first', () => {
    // The flags are decided on the search order and carried through the reversal. Recomputing them
    // after reversing would silently move the ring to the wrong card. (Only meaningful while the cost
    // is on screen — with it hidden, "best value" would be a claim about a number you cannot see.)
    const { container } = render(<FrontierView result={twoPlans} freeRestart />);
    const ringed = container.querySelectorAll('.ring-2');
    expect(ringed.length).toBe(1);
    expect(ringed[0]!.textContent).toContain('best value');
  });
});

// Real shipped rates, so the ladder actually engages — with no rates `pickUnit` can only choose
// exalts and the assertion below would pass without testing anything.
const basis: EnginePriceBasis = {
  estimated: false, asOf: '2026-08-22', patch: '0.5.0', unit: 'exalt',
  rates: { chaos: 33.39, divine: 364.2 },
};

describe('FrontierView — units are per quantity, not per view', () => {
  it('does not push a 357ex per-attempt figure into divine because another number is astronomical', () => {
    // One unit for the whole card set took the max across BOTH quantities: `expected` (1.78e8 ex)
    // chose divine, and then perAttempt — 357 ex, the number you actually hand over per try — rendered
    // as "0.98 div". Sharing a unit down a column is what makes rows comparable; sharing one ACROSS
    // columns that measure different things does the opposite.
    // Asserted in the free-restart mode, which is the one that still shows both quantities at once.
    const { container } = render(<FrontierView result={twoPlans} freeRestart priceBasis={basis} />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/357 ex per attempt/);
    // …while the astronomical column really does escalate, or the two would not be sharing a view.
    expect(screen.getAllByText(/^expected cost$/i)[0]!.previousSibling?.textContent).toMatch(/div$/);
  });
});
