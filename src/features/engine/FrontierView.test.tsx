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
  plansEvaluated: 56_687_040, assumedOdds: false,
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

  it('rings the plan the search picked, not whatever ends up first', () => {
    // The flags are decided on the search order and carried through the reversal. Recomputing them
    // after reversing would silently move the ring to the wrong card. (Only meaningful while the cost
    // is on screen — with it hidden, "best value" would be a claim about a number you cannot see.)
    const { container } = render(<FrontierView result={twoPlans} freeRestart />);
    const ringed = container.querySelectorAll('.ring-2');
    expect(ringed.length).toBe(1);
    // Neither of these finishes in a practical number of attempts — 5.6e6 and 7.3e5 — so the ringed
    // card is the FALLBACK, and it makes no claim about value. It used to say "best value" here, on
    // the dearer of the two. The list still has to open somewhere, so the ring stays.
    expect(ringed[0]!.textContent).toContain('surest');
    expect(ringed[0]!.textContent).not.toContain('best value');
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

// ── "best value" has to be earned ────────────────────────────────────────────
// The frontier ascends in BOTH cost and probability, so its last plan is the surest AND the dearest.
// `recommendPlan` falls back to that plan when nothing clears the practicality bar — correct, a list
// has to open somewhere — but the badge restated the fallback as a claim. On a real 6-mod T1 Wand it
// therefore read "best value" on a 6.1-billion-divine plan while a 190-million-divine one sat on the
// same screen, 32x cheaper and differing only in the first step's orb.
describe('FrontierView — the "best value" claim', () => {
  const plan = (expected: number, expectedAttempts: number) => ({
    expected, probability: 1 / expectedAttempts, perAttempt: expected / expectedAttempts,
    expectedAttempts, steps: [],
  });
  const frontier = (...plans: ReturnType<typeof plan>[]): EngineResult =>
    ({ frontier: plans, plansEvaluated: 10, assumedOdds: false });

  it('is made when a plan really does finish in a practical number of attempts', () => {
    render(<FrontierView result={frontier(plan(3, 2500), plan(9.5, 7))} />);
    expect(screen.getByText('best value')).toBeInTheDocument();
  });

  it('is WITHHELD when no plan clears the bar, rather than landing on the dearest', () => {
    render(<FrontierView result={frontier(plan(3, 5000), plan(9, 200))} />);
    expect(screen.queryByText('best value')).toBeNull();
    // The ordering badges still stand — they are claims about the list, not about value.
    expect(screen.getByText('cheapest')).toBeInTheDocument();
    expect(screen.getByText('surest')).toBeInTheDocument();
  });

  // The number stays — someone may want it — but what it ASSUMES stops being implicit. Expected cost
  // divides one run's cost by the chance it lands, i.e. it prices scrapping the item and buying a
  // fresh base on every miss; at 3.9e-10% that division is the whole answer.
  it('says what expected cost assumes, exactly where the assumption stops holding', () => {
    const { container } = render(<FrontierView result={frontier(plan(3, 5000), plan(9, 200))} />);
    expect(screen.getByText(/No route here lands inside 40 attempts/i)).toBeInTheDocument();
    expect(container.textContent).toMatch(/starting from a fresh base after every miss/i);
    // ...and it must not put a SECOND copy of a card's label on screen: three tests find a card by
    // its labels, and a reader scanning for "expected cost" has the same ambiguity.
    expect(screen.queryAllByText(/^expected cost$/i)).toHaveLength(2); // the two cards, and nothing else
  });

  it('says nothing of the sort on an ordinary craft', () => {
    const { container } = render(<FrontierView result={frontier(plan(3, 2500), plan(9.5, 7))} />);
    expect(container.textContent).not.toMatch(/No route here lands inside/i);
  });

  // The from-item panel drops the expected-cost total entirely (freeRestart={false}), so a note about
  // what that total assumes would describe a number the reader cannot see.
  it('stays silent where there is no total to caveat', () => {
    const { container } = render(
      <FrontierView result={frontier(plan(3, 5000), plan(9, 200))} freeRestart={false} />,
    );
    expect(container.textContent).not.toMatch(/No route here lands inside/i);
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
    const { container } = render(<FrontierView result={longShot} freeRestart priceBasis={basis} />);
    expect(container.textContent).not.toMatch(/e[+-]\d/);
  });

  it('says a long-shot chance as odds rather than a run of zeros', () => {
    render(<FrontierView result={longShot} freeRestart priceBasis={basis} />);
    expect(screen.getByText('1 in 256.4 billion')).toBeInTheDocument();
  });

  it('says the total in words rather than a suffix', () => {
    render(<FrontierView result={longShot} freeRestart priceBasis={basis} />);
    // 2.46e12 ex at 364.2 ex/div. Was "6.8B div".
    expect(screen.getByText(/billion div/)).toBeInTheDocument();
  });

  // The deletion. Not "an attempt count is unwelcome" — it is the SAME NUMBER as the chance above it,
  // and a reader given both spends the glance working out whether they differ.
  it('does not restate the chance as an attempt count', () => {
    render(<FrontierView result={longShot} freeRestart priceBasis={basis} />);
    // Scoped to the CARD: the note above it legitimately says "inside 40 attempts", which is a bar,
    // not a restatement of this plan's odds.
    const card = screen.getByText(/chance per attempt/i).closest('div.rounded-lg')!;
    expect(card.textContent).not.toMatch(/attempts/);
    // …while the per-run price, which is genuinely a second fact, stays.
    expect(card.textContent).toMatch(/357 ex per attempt/);
  });
});
