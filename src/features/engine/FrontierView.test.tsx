import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FrontierView from './FrontierView';
import type { EnginePriceBasis, EngineResult } from '../../lib/engine';

const empty: EngineResult = {
  frontier: [], plansEvaluated: 1, assumedOdds: false,
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

  /**
   * A planner that DECLINED must not be badged with which orbs it tried.
   *
   * `frontierOrReason` (solve.ts) turns a step-planner refusal into an empty result carrying the
   * planner's own sentence. Saying "every orb strength" beside that would describe a search that never
   * ran — the planner declined before looking at a single orb.
   *
   * The claim is therefore gated on the plan count, which is the one field that can say a search
   * happened. It used to be a `currencyDepth` badge with four possible values and the same gate; the
   * field is gone (every craft searches every strength, so it had one), and the gate outlived it.
   */
  it('makes no claim about orb strengths when no search ran', () => {
    const declined = render(<FrontierView result={{ ...empty, plansEvaluated: 0 }} />);
    expect(declined.container.textContent).not.toMatch(/orb strength/i);
    expect(declined.container.textContent).toMatch(/checked 0 plans/);
    // …and it still says so when one did.
    const ran = render(<FrontierView result={{ ...empty, plansEvaluated: 1 }} />);
    expect(ran.container.textContent).toMatch(/every orb strength/i);
  });
});

// The reported craft, in miniature. `expected` used to lead these cards, computed under
// restart-on-first-failure: a miss hands you a free replacement of your starting item. That is fiction
// from a held Rare, and it was never much better from white — nobody bins an item six steps in holding
// five of six targets, they annul the bad mod. The ranking it produced inverts: an Annulment costs
// 158.7ex against an Exalt's 1ex, so burying the Annuls behind a 0.1% gate you rarely pass "saves"
// ~65x and the cheapest plan is one no player would run. The total is gone from both tabs; the two
// figures these cards keep survive the assumption intact.
const cheapButSilly = { probability: 1.77e-7, expected: 1.07e7, perAttempt: 340, expectedAttempts: 5.6e6, steps: [] };
const dearButSensible = { probability: 1.36e-6, expected: 1.78e8, perAttempt: 357, expectedAttempts: 7.3e5, steps: [] };
const twoPlans: EngineResult = {
  frontier: [cheapButSilly, dearButSensible], // search order is always cheapest → surest
  plansEvaluated: 56_687_040, assumedOdds: false,
};

const costOf = (card: HTMLElement) => card.textContent ?? '';

describe('FrontierView — what a card is allowed to claim', () => {
  const cards = () => screen.getAllByText(/chance per attempt/i).map((el) => el.closest('div.rounded-lg') as HTMLElement);

  it('leads with the likeliest route — the one a player reaches for', () => {
    render(<FrontierView result={twoPlans} />);
    expect(costOf(cards()[0]!)).toContain('likeliest');
  });

  // Dividing a real per-run cost by a ~1e-13 chance gives billions of divine. It is arithmetically
  // right and it is not a budget — nobody runs a sequence 1e14 times, they abandon it. Reported first
  // as "i do not like the Step-by-step routes, the costs are astronomical", then on the Lab tab as
  // "the prices are so high, I'd rather just keep the true expected cost".
  it('shows no free-restart total at all', () => {
    render(<FrontierView result={twoPlans} />);
    expect(screen.queryByText(/expected cost/i)).toBeNull();
    expect(screen.queryByText(/cost if restarts were free/i)).toBeNull();
    expect(screen.queryByText(/attempts$/i)).toBeNull();
  });

  it('keeps the two figures you can act on', () => {
    render(<FrontierView result={twoPlans} />);
    expect(screen.getAllByText(/chance per attempt/i).length).toBe(2);
    expect(screen.getAllByText(/what one run costs/i).length).toBe(2);
  });

  // "cheapest" and "best value" both ranked on the total. With it gone they would be claims about a
  // number the reader cannot see — which is how "best value" came to sit on a 6.1-billion-divine plan
  // with a 190-million-divine one on the same screen.
  it('makes no claim that rests on the hidden total', () => {
    const { container } = render(<FrontierView result={twoPlans} />);
    expect(screen.queryByText('best value')).toBeNull();
    expect(screen.queryByText('cheapest')).toBeNull();
    expect(container.querySelectorAll('.ring-2').length).toBe(0);
    expect(container.textContent).not.toMatch(/No route here lands inside/i);
  });
});

// Real shipped rates, so the ladder actually engages — with no rates `pickUnit` can only choose
// exalts and the assertion below would pass without testing anything.
const basis: EnginePriceBasis = {
  estimated: false, asOf: '2026-08-22', patch: '0.5.0', unit: 'exalt',
  rates: { chaos: 33.39, divine: 364.2 },
};

describe('FrontierView — the per-run figure keeps its own unit', () => {
  it('does not push a 357ex per-attempt figure into divine because another number is astronomical', () => {
    // One unit for the whole card set took the max across BOTH quantities: `expected` (1.78e8 ex)
    // chose divine, and then perAttempt — 357 ex, the number you actually hand over per try — rendered
    // as "0.98 div". Sharing a unit down a column is what makes rows comparable; sharing one ACROSS
    // columns that measure different things does the opposite. `expected` no longer renders at all,
    // which retires that bug rather than fixing it — this pins that it stays retired.
    const { container } = render(<FrontierView result={twoPlans} priceBasis={basis} />);
    expect(container.textContent ?? '').toMatch(/357 ex/);
    expect(container.textContent ?? '').not.toMatch(/div/);
  });
});

// ── One fact, printed once ───────────────────────────────────────────────────
// `expectedAttempts` is `1 / total` (cost.ts) and `probability` IS that same `total` (optimize.ts,
// "= result.total"), so the card was showing one number twice. It hid because the two rendered as
// "3.9e-10%" and "2.6e+11" — two unreadable strings do not look alike.
describe('FrontierView — numbers a player can read', () => {
  const longShot: EngineResult = {
    frontier: [{ probability: 3.9e-12, expected: 2.46e12, perAttempt: 357, expectedAttempts: 2.56e11, steps: [] }],
    plansEvaluated: 10, assumedOdds: false,
  };

  it('never puts an exponent on screen', () => {
    const { container } = render(<FrontierView result={longShot} priceBasis={basis} />);
    expect(container.textContent).not.toMatch(/e[+-]\d/);
  });

  it('says a long-shot chance as odds rather than a run of zeros', () => {
    render(<FrontierView result={longShot} priceBasis={basis} />);
    expect(screen.getByText('1 in 256.4 billion')).toBeInTheDocument();
  });

  // The deletion. Not "an attempt count is unwelcome" — it is the SAME NUMBER as the chance above it
  // (1/p), and a reader given both spends the glance working out whether they differ.
  it('does not restate the chance as an attempt count', () => {
    render(<FrontierView result={longShot} priceBasis={basis} />);
    const card = screen.getByText(/chance per attempt/i).closest('div.rounded-lg')!;
    expect(card.textContent).not.toMatch(/attempts/);
    // …while the per-run price, which is genuinely a second fact, stays.
    expect(card.textContent).toMatch(/357 ex/);
  });
});
