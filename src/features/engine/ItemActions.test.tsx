import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CurrencyAction, EngineMod, EngineResult } from '../../lib/engine';
import { oddsText } from './ItemActions';

// ItemActions ("I have an item") holds the item builder + quick-check + full-plan target rules. Driven
// against a MOCKED facade with a tiny controlled mod set; the facade logic (currencyActions, optimizeItem)
// is tested in engine.test.ts, so here we verify the COMPONENT's wiring and rules.

const tier = (display: number) => ({ display, name: `t${display}`, ilvl: 1, label: `T${display}`, range: '10–20' });
const mod = (
  id: string, text: string, type: 'prefix' | 'suffix', source: EngineMod['source'], family: string, tiers = 3,
): EngineMod => ({ id, text, type, family, source, tiers: Array.from({ length: tiers }, (_, i) => tier(i + 1)) });

const NP = mod('np', 'Normal Prefix', 'prefix', 'normal', 'FamA');
const NS = mod('ns', 'Normal Suffix', 'suffix', 'normal', 'FamS');
// Distinct, non-prefix-colliding names (the "desecrated" badge is part of the button's accessible name).
const DS = mod('ds', 'Carved Cast Speed', 'suffix', 'desecrated', 'FamD', 1);
const DS2 = mod('ds2', 'Carved Armour Break', 'suffix', 'desecrated', 'FamD2', 1);
const PE = mod('pe', 'Abyssal Mark', 'prefix', 'perfect', 'FamP', 1);

const okFrontier: EngineResult = {
  frontier: [{ probability: 0.5, expected: 2, perAttempt: 1, expectedAttempts: 2, steps: [] }],
  plansEvaluated: 1, assumedOdds: false,
};
// Two Annulment actions (plain + Omen of Light) — the component must render BOTH (keyed by label, not
// currency, or React would collide the two 'annul' entries).
const annulActions: CurrencyAction[] = [
  { currency: 'annul', label: 'Orb of Annulment', detail: 'removes one random mod', prob: 0.5, cost: 1.5, feasible: true },
  { currency: 'annul', label: 'Orb of Annulment + Omen of Light', detail: 'removes the desecrated mod for certain', prob: 1, cost: 11.5, feasible: true },
];

// `optimizeItemMarkov` was NOT mocked, so the in-process solve shim ran the real one against the
// `{} as never` data object above, it threw, and every from-item compute in this file ended in the
// error branch with `markov` left null. Nothing asserted on markov, so nothing noticed — and that is
// exactly why the missing true-cost explanation shipped.
const mocks = vi.hoisted(() => ({
  currencyActions: vi.fn(), optimizeItem: vi.fn(), optimizeItemMarkov: vi.fn(),
}));

vi.mock('../../lib/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/engine')>();
  return {
    ...actual,
    loadEngine: () => Promise.resolve({ data: {} as never, prices: { currency: {}, omens: {} } as never }),
    listBases: () => [{ id: 'Wands', name: 'Wands', category: 'weapon' }],
    listMods: () => ({ prefixes: [NP], suffixes: [NS] }),
    listDesecrated: () => [DS, DS2],
    listPerfectEssences: () => [PE],
    currencyActions: mocks.currencyActions,
    optimizeItem: mocks.optimizeItem,
    optimizeItemMarkov: mocks.optimizeItemMarkov,
  };
});

import ItemActions from './ItemActions';

async function loaded() {
  render(<ItemActions />);
  await screen.findByPlaceholderText(/Search modifiers to add to your item/i);
}
const builderButton = (text: string | RegExp) => screen.getByRole('button', { name: text });

const okMarkov = {
  applicable: true, feasible: true, expectedCost: 5, converged: true, bound: 'exact', assumedOdds: false,
  nodes: [], edges: [],
};
/**
 * How the MDP declines a craft it cannot model. Two different shapes reach the UI and only one was
 * handled: the facade sets `applicable: false` BEFORE running the model (a regular-essence target),
 * while the model's own refusals — a Magic item, which it has no rarity axis to represent — come back
 * through `mapMarkov`, which hardcodes `applicable: true` and reports `feasible: false`.
 */
const declinedMarkov = {
  applicable: true, feasible: false, expectedCost: Infinity, converged: true, bound: 'exact', assumedOdds: false,
  nodes: [], edges: [],
  reason: 'the true-cost model only handles Rare items so far — a Magic item needs a Regal first.',
};

beforeEach(() => {
  mocks.currencyActions.mockReturnValue([]);
  mocks.optimizeItem.mockReturnValue(okFrontier);
  mocks.optimizeItemMarkov.mockReturnValue(okMarkov);
});

describe('ItemActions — item builder', () => {
  it('lists rollable AND desecrated mods, badging the desecrated ones', async () => {
    await loaded();
    expect(builderButton(/Normal Prefix/)).toBeInTheDocument();
    const desBtn = builderButton(/Carved Cast Speed/);
    expect(within(desBtn).getByText('desecrated')).toBeInTheDocument();
  });

  it('adds a desecrated mod to the item and explains the Omen of Light lever', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Carved Cast Speed/));
    // The Light hint appears (phrase unique to that note).
    expect(screen.getByText(/occupy a slot and a\s+family/i)).toBeInTheDocument();
  });
});

describe('ItemActions — quick check renders every currency action', () => {
  it('renders both Annulment cards (plain + Omen of Light) without a key collision', async () => {
    const user = userEvent.setup();
    mocks.currencyActions.mockReturnValue(annulActions);
    await loaded();
    // Put the desecrated mod on the item, then pick it as the sacrifice → currencyActions fires.
    await user.click(builderButton(/Carved Cast Speed/));
    await user.selectOptions(screen.getByLabelText(/Mod to sacrifice/i), 'ds');
    expect(screen.getByText('Orb of Annulment')).toBeInTheDocument();
    expect(screen.getByText('Orb of Annulment + Omen of Light')).toBeInTheDocument();
    expect(screen.getByText('guaranteed')).toBeInTheDocument(); // P=1 phrasing
  });
});

describe('ItemActions — full plan target', () => {
  async function toPlanMode(user: ReturnType<typeof userEvent.setup>) {
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
  }

  it('offers perfect-essence and desecrated targets, and enforces one desecrated mod', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    const dropdown = screen.getByRole('combobox', { name: /Add a target mod/i });
    // The dropdown labels the special sources.
    expect(within(dropdown).getByRole('option', { name: /Carved Cast Speed · Desecrated/ })).toBeInTheDocument();
    expect(within(dropdown).getByRole('option', { name: /Abyssal Mark · Perfect Essence/ })).toBeInTheDocument();
    /*
     * Pick a desecrated target and the other is refused — but it stays LISTED, disabled, with the
     * reason in its own text.
     *
     * It used to be filtered out of the dropdown entirely, which told the user nothing: a mod they had
     * just seen simply vanished. And filtering was only ever applied to the one-desecrated and
     * one-essence rules, so the rules it did not cover — a full side, an occupied family — left the
     * option selectable and did nothing at all when picked. A `<select>` has nowhere to hang an
     * `aria-describedby`, so the option's text is the one place a keyboard, a screen reader and a
     * touch user all reach the reason.
     */
    await user.selectOptions(dropdown, 'ds');
    const other = within(dropdown).getByRole('option', { name: /Carved Armour Break/ });
    expect(other).toBeDisabled();
    // The limit is on the finished ITEM, so the reason names what is actually unsatisfiable: two slots
    // that can ONLY be filled by a carved mod. Offering either one as an alternative to something
    // normal is fine, and the message says so rather than just refusing.
    expect(other.textContent).toMatch(/an item holds one/i);
    expect(other.textContent).toMatch(/non-desecrated alternative/i);
  });

  it('computes through optimizeItem for a Rare item', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
    // Asynchronous now — the solve runs in a Worker. See the note in EngineLab.test.tsx.
    await waitFor(() => expect(mocks.optimizeItem).toHaveBeenCalledTimes(1));
  });
});

// The Item tab called `useEffort()` and passed `limitsFor(effort)` into the solver, but rendered no
// control — the picker lived inside EngineLab's *else* branch, i.e. the Lab tab. So a from-item craft
// silently ran under whatever was last chosen on the other tab. A setting that binds here must be
// reachable here.
// A disabled "Compute plan" must say what it is waiting for, and say it NEXT TO the button. Two
// conditions disable it; one of them (no targets picked) said nothing at all, and the other had its
// explanation pushed below the search-effort paragraph, where it reads as part of that paragraph
// rather than as the reason the button is dead.
describe('ItemActions — why Compute plan is unavailable', () => {
  const computeButton = () => screen.getByRole('button', { name: /Compute plan/i });

  async function toPlanMode(user: ReturnType<typeof userEvent.setup>) {
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
  }

  it('names the missing precondition when no target is picked', async () => {
    await toPlanMode(userEvent.setup());
    expect(computeButton()).toBeDisabled();
    expect(screen.getByText(/Pick at least one target mod/i)).toBeInTheDocument();
  });

  it('keeps the reason inside the button’s own block, not adrift below it', async () => {
    await toPlanMode(userEvent.setup());
    // The message must be reachable from the button without crossing unrelated copy — same parent.
    const reason = screen.getByText(/Pick at least one target mod/i);
    expect(computeButton().parentElement).toBe(reason.parentElement);
  });

  it('enables the button once a target is chosen', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    expect(computeButton()).toBeEnabled();
    expect(screen.queryByText(/Pick at least one target mod/i)).toBeNull();
  });
});

describe('ItemActions — search effort', () => {
  async function toPlanMode(user: ReturnType<typeof userEvent.setup>) {
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
  }

  it('renders the effort picker on this tab', async () => {
    await toPlanMode(userEvent.setup());
    const select = screen.getByLabelText(/How hard the solver should look/i);
    expect(select).toBeInTheDocument();
    // Every preset is offered, not just the current one.
    expect(within(select).getAllByRole('option').length).toBeGreaterThan(1);
  });

  // "I think it was like +15 minutes (didn't see because the timer goes away when finished)" — the
  // live timer lives on the progress bar, which unmounts the instant the solve lands, so the number was
  // unobservable at exactly the moment it mattered.
  it('reports how long the last solve took, after it has finished', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
    await waitFor(() => expect(screen.getByText(/Last solve took/i)).toBeInTheDocument());
  });

  it('says what the current preset costs you', async () => {
    await toPlanMode(userEvent.setup());
    expect(screen.getByText(/Search effort:/i)).toBeInTheDocument();
  });
});

// The true-cost card is simply not rendered when the model declines, so half the panel vanished with
// no explanation — while the `reason` saying exactly why was computed, carried across the worker
// boundary, and shown to nobody. Reported as "I don't have graph anymore".
/**
 * Marking which mod a Desecration placed.
 *
 * The app cannot infer it: a bone flags whatever it applied, an ordinary mod as much as a carved one,
 * and a flagged ordinary mod looks exactly like an exalted one. It is also what stops the item being
 * desecrated again, so getting it wrong offers a move the game refuses.
 */
describe('ItemActions — the Desecration marker', () => {
  it('marks a mod, and only ever one at a time', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    await user.click(builderButton(/Normal Suffix/));
    const marks = screen.getAllByRole('button', { name: /Placed by a Desecration/i });
    expect(marks).toHaveLength(2);
    await user.click(marks[0]!);
    await waitFor(() => expect(
      screen.getAllByRole('button', { name: /Placed by a Desecration/i })
        .filter((b) => b.getAttribute('aria-pressed') === 'true'),
    ).toHaveLength(1));
    // An item carries at most one, so marking the second must release the first rather than add to it.
    await user.click(screen.getAllByRole('button', { name: /Placed by a Desecration/i })[1]!);
    await waitFor(() => expect(
      screen.getAllByRole('button', { name: /Placed by a Desecration/i })
        .filter((b) => b.getAttribute('aria-pressed') === 'true'),
    ).toHaveLength(1));
    expect(screen.getAllByRole('button', { name: /Placed by a Desecration/i })[1]!)
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('explains what the flag costs you once something is marked', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    await user.click(screen.getAllByRole('button', { name: /Placed by a Desecration/i })[0]!);
    expect(await screen.findByText(/won.t touch it\s+again/i)).toBeInTheDocument();
  });
});

describe('ItemActions — when there is no true expected cost', () => {
  async function computeWith(markov: unknown) {
    mocks.optimizeItemMarkov.mockReturnValue(markov);
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
  }

  it('explains itself when the model declines the craft (feasible: false)', async () => {
    await computeWith(declinedMarkov);
    await waitFor(() => expect(screen.getByText(/No true expected cost for this craft/i)).toBeInTheDocument());
    expect(screen.getByText(/only handles Rare items/i)).toBeInTheDocument();
  });

  it('explains itself when the facade declines it first (applicable: false)', async () => {
    // The other shape. Keying the card on `!applicable` alone caught this one and missed the case it
    // was actually written for.
    await computeWith({ ...declinedMarkov, applicable: false, reason: 'a regular essence needs a Magic item' });
    await waitFor(() => expect(screen.getByText(/No true expected cost for this craft/i)).toBeInTheDocument());
  });

  it('says nothing extra when the model DID answer', async () => {
    await computeWith(okMarkov);
    await waitFor(() => expect(screen.getByText(/Last solve took/i)).toBeInTheDocument());
    expect(screen.queryByText(/No true expected cost/i)).toBeNull();
  });

  /**
   * A craft on the item in your stash never restarts, so it is solved push-forward only: value
   * iteration starts at 0 and CLIMBS, and stopping early leaves a floor. The Lab's from-white solve
   * leans the other way, so this side reads `bound` too rather than assuming its own direction.
   */
  it('renders an unfinished solve as a floor', async () => {
    await computeWith({ ...okMarkov, converged: false, bound: 'lower' });
    expect(await screen.findByText(/^≥\s/)).toBeInTheDocument();
    expect(screen.getByText(/floor/i)).toBeInTheDocument();
  });
});

// Reported as: "I have always the most costly here that are in billions div, and the one true expected
// cost is one i could very much do." Measured on that craft the step routes read ~5,000,000x above the
// true cost, and handing them Perfect orbs (worth 1,116x) still leaves ~68,000x — the remainder is the
// model, not a gap. So once the policy has answered, they stop competing with it for attention.
describe('ItemActions — step routes defer to the true cost', () => {
  async function computeWith(markov: unknown) {
    mocks.optimizeItemMarkov.mockReturnValue(markov);
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
    return user;
  }

  it('collapses them when the policy answered', async () => {
    await computeWith(okMarkov);
    await waitFor(() => expect(screen.getByRole('button', { name: /Step-by-step routes/i })).toBeInTheDocument());
    // The frontier's own heading is not rendered while collapsed.
    expect(screen.queryByText(/chance per attempt/i)).toBeNull();
  });

  it('opens them on demand, and closes again', async () => {
    const user = await computeWith(okMarkov);
    await waitFor(() => expect(screen.getByRole('button', { name: /Step-by-step routes/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Step-by-step routes/i }));
    expect(screen.getByText(/chance per attempt/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hide step-by-step routes/i }));
    expect(screen.queryByText(/chance per attempt/i)).toBeNull();
  });

  it('says why they read so much higher, rather than just hiding them', async () => {
    await computeWith(okMarkov);
    await waitFor(() => expect(screen.getByRole('button', { name: /Step-by-step routes/i })).toBeInTheDocument());
    const summary = screen.getByRole('button', { name: /Step-by-step routes/i }).textContent ?? '';
    expect(summary).toMatch(/named/);
    expect(summary).toMatch(/takes whatever lands/);
    // …and it must not simply restate the paragraph above it.
    expect(summary).not.toMatch(/free replacement item/);
  });

  it('leaves them open when the policy did NOT answer — they are the only view then', async () => {
    // A Magic item or an essence target. Collapsing here would leave the panel with nothing in it.
    await computeWith(declinedMarkov);
    await waitFor(() => expect(screen.getByText(/chance per attempt/i)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Step-by-step routes/i })).toBeNull();
  });
});

/**
 * SLOT ALTERNATIVES on the "I have an item" tab.
 *
 * This tab had its own copy of the target rules, worded differently and — in the dropdown — enforcing
 * only two of them. Both tabs now share `whyNotAdd`, so a mod refused here is refused there, for the
 * same stated reason.
 */
describe('ItemActions — a slot with alternatives', () => {
  async function toPlanMode(user: ReturnType<typeof userEvent.setup>) {
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
  }
  const dropdown = () => screen.getByRole('combobox', { name: /Add a target mod/i });

  it('offers "or" on a target, so the tab has the feature at all', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    expect(screen.queryByRole('button', { name: /or…/i })).toBeNull();
    await user.selectOptions(dropdown(), 'np');
    expect(screen.getByRole('button', { name: /or…/i })).toBeInTheDocument();
  });

  it('groups the next pick into the slot, and says so while it waits', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    await user.selectOptions(dropdown(), 'np');
    await user.click(screen.getByRole('button', { name: /or…/i }));
    expect(screen.getByText(/Choose a mod above to add as an/i)).toBeInTheDocument();

    // A suffix cannot be an alternative to a prefix — the slot would be a prefix on one route and a
    // suffix on another, which makes the 3-per-side count meaningless.
    expect(within(dropdown()).getByRole('option', { name: /Normal Suffix/ })).toBeDisabled();

    await user.selectOptions(dropdown(), 'pe'); // a prefix, different family
    expect(screen.getByText(/Any one of/i)).toBeInTheDocument();
    expect(screen.queryByText(/Choose a mod above to add as an/i)).toBeNull();
  });

  it('ungroups when a slot drops back to one candidate', async () => {
    const user = userEvent.setup();
    await toPlanMode(user);
    await user.selectOptions(dropdown(), 'np');
    await user.click(screen.getByRole('button', { name: /or…/i }));
    await user.selectOptions(dropdown(), 'pe');
    expect(screen.getByText(/Any one of/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remove Abyssal Mark from the target/i }));
    expect(screen.queryByText(/Any one of/i)).toBeNull();
  });
});

// The panel's plain-language odds. Regression-guarded because the failure is silent and specific: an
// integer "1 in N" turns any probability above two-thirds into "1 in 1", which reads as a certainty
// right beneath the percentage that says otherwise. Nothing here cleared 50% until the boss-omened
// Desecration row arrived at 70.4%.
describe('ItemActions — oddsText', () => {
  it('never rounds a real chance into a certainty', () => {
    expect(oddsText(0.7037)).toBe('≈ 1 in 1.4 each orb');
    // Above 95% the decimal cannot save it either — 1/0.99 shows as "1.0" — so the idiom is dropped.
    expect(oddsText(0.99)).toBe('almost every orb');
    expect(oddsText(0.96)).toBe('almost every orb');
    expect(oddsText(1)).toBe('guaranteed'); // the ONLY string that may claim certainty
  });

  it('keeps whole numbers whole and groups large ones', () => {
    expect(oddsText(0.5)).toBe('≈ 1 in 2 each orb');
    expect(oddsText(1 / 3)).toBe('≈ 1 in 3 each orb');
    expect(oddsText(0.0003)).toBe('≈ 1 in 3,333 each orb');
    expect(oddsText(0)).toBe('—');
  });

  it('holds the relative error under 5% across the range', () => {
    for (const p of [0.9, 0.7037, 0.42, 0.2684, 0.1262, 0.05, 0.011, 0.0004]) {
      // Read back only the N — the digits in the leading "1 in" are part of the idiom, not the value.
      const shown = Number(/1 in ([\d.,]+)/.exec(oddsText(p))![1]!.replace(/,/g, ''));
      expect(Math.abs(shown - 1 / p) / (1 / p)).toBeLessThan(0.05);
    }
  });
});
