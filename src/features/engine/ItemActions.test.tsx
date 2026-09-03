import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CurrencyAction, EngineMod, EngineResult } from '../../lib/engine';
import { oddsText } from './QuickCurrencyCheck';

// ItemActions ("I have an item") holds the item builder + quick-check + full-plan target rules. Driven
// against a MOCKED facade with a tiny controlled mod set; the facade logic (currencyActions, optimizeItem)
// is tested in engine.test.ts, so here we verify the COMPONENT's wiring and rules.

const tier = (display: number) => ({ display, name: `t${display}`, ilvl: 1, label: `T${display}`, range: '10–20', values: ['10–20'] });
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

  /**
   * A selection cannot outlive the mod it points at.
   *
   * The parent used to clear the two picks imperatively — from `dropItemMod` and from the base-change
   * reset — but NOT from the rarity trim, which silently drops mods when a Rare becomes Magic. A pick
   * left pointing at a trimmed mod then asked the engine about a mod that was no longer on the item,
   * which does not throw: it returns a blocked "can't apply" row. So the panel rendered a refusal
   * underneath a dropdown reading "— none —", because a `<select>` whose value matches no option
   * displays the first one.
   *
   * The panel now clamps both picks against the lists it is handed, which cannot have that bug.
   */
  it('drops a sacrifice selection when the rarity trim takes that mod off the item', async () => {
    const user = userEvent.setup();
    mocks.currencyActions.mockReturnValue(annulActions);
    await loaded();
    await user.click(builderButton(/Carved Cast Speed/));
    await user.selectOptions(screen.getByLabelText(/Mod to sacrifice/i), 'ds');
    expect(screen.getByText('Orb of Annulment')).toBeInTheDocument();

    // Rare (3+3) → Magic (1+1). One suffix survives, and here it is the one that was selected — so
    // add a second first, and drop to Magic: the trim keeps the FIRST, discarding the selected one.
    await user.click(builderButton(/Carved Armour Break/));
    await user.selectOptions(screen.getByLabelText(/Mod to sacrifice/i), 'ds2');
    await user.selectOptions(screen.getByLabelText(/Rarity/i), 'magic');

    // Asserted on the DOM, not on the mock: the trim is an effect, so there is one intermediate render
    // where the rarity is already Magic and the suffix list has not been cut yet. What matters is what
    // the user is left looking at, and that has to be one thing, not a refusal under an empty select.
    expect(screen.getByLabelText(/Mod to sacrifice/i)).toHaveValue('');
    expect(screen.queryByText('Orb of Annulment')).toBeNull();
    expect(screen.getByText(/Pick a/)).toBeInTheDocument();
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

// ── What the item you hold is actually worth ─────────────────────────────────
// "I have four of the six, I just need two more" reads as two-thirds done. Measured on a 6-target T2
// Wand it is 4.4% (docs/validation.md, 2026-09-03), because cost is back-loaded: the last mod alone is
// 53% of the craft. The panel says it in currency, since counting mods invites the wrong conclusion.
describe('ItemActions — how far along your item really is', () => {
  const startNode = (present: string[], junk = 0) => ({
    key: 's', present, blocked: [], junkPrefixes: junk, junkSuffixes: 0, rarity: 'rare' as const,
    isStart: true, isGoal: false, depth: 2, expectedCost: 0, visitRate: 1,
  });
  /**
   * The panel's HEADING, not the phrase.
   *
   * ItemActions also names "True expected cost" in the paragraph explaining why this tab reads
   * differently, so `getByText(/True expected cost/i)` matches two elements and throws. It passed when
   * this file ran alone and failed in the full suite, which is the sort of order-dependence a loose
   * query buys you: assert on the role you actually mean.
   */
  const panelHeading = () => screen.getByRole('heading', { name: /True expected cost/i });
  const withWorth = (over: Record<string, unknown>) =>
    ({ ...okMarkov, nodes: [startNode(['Normal Prefix'])], ...over });

  async function computeWith(markov: unknown) {
    mocks.optimizeItemMarkov.mockReturnValue(markov);
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
  }

  it('reports progress in currency, and warns that counting mods overstates it', async () => {
    await computeWith(withWorth({ expectedCost: 956, bareCost: 1000 }));
    await waitFor(() => expect(screen.getByText(/has done 4\.4% of this craft/i)).toBeInTheDocument());
    expect(screen.getByText(/Counting mods overstates how far along you are/i)).toBeInTheDocument();
  });

  // A dirty item is worth LESS than a clean one — the junk has to come off, and an Annulment takes a
  // mod at random. Rendering that as a negative percentage would be nonsense.
  it('says plainly when the item is a liability rather than progress', async () => {
    await computeWith(withWorth({ expectedCost: 1200, bareCost: 1000, nodes: [startNode([], 2)] }));
    await waitFor(() => expect(screen.getByText(/behind a clean start/i)).toBeInTheDocument());
    expect(screen.queryByText(/has done .* of this craft/i)).toBeNull();
  });

  // Both figures come from ONE solve. When it ran out of clock they are two floors on values still
  // climbing, so their difference bounds nothing — and a percentage would be pure invention.
  it('claims nothing when the solve did not converge', async () => {
    await computeWith(withWorth({ expectedCost: 956, bareCost: 1000, bound: 'lower', converged: false }));
    await waitFor(() => expect(panelHeading()).toBeInTheDocument());
    expect(screen.queryByText(/of this craft/i)).toBeNull();
  });

  // A bare start IS the baseline. This is also what keeps the row off the Lab tab, where every craft
  // begins with nothing on the item.
  it('says nothing when there is nothing to compare', async () => {
    await computeWith(withWorth({ expectedCost: 1000, bareCost: 1000, nodes: [startNode([])] }));
    await waitFor(() => expect(panelHeading()).toBeInTheDocument());
    expect(screen.queryByText(/of this craft/i)).toBeNull();
    expect(screen.queryByText(/behind a clean start/i)).toBeNull();
  });

  it('says nothing when the baseline is absent', async () => {
    await computeWith(withWorth({ expectedCost: 956 }));
    await waitFor(() => expect(panelHeading()).toBeInTheDocument());
    expect(screen.queryByText(/of this craft/i)).toBeNull();
  });
});

// ── What tier your mods are actually rolled at ───────────────────────────────
// Every held mod was recorded at tierDisplay 1 with no control to change it, so the app assumed your
// item carried the BEST roll of everything on it. `classifyStart` has always graded a held mod against
// the tier asked for — `present` at or above it, `blocked` below, and blocked means the mod must come
// OFF before the slot can be re-rolled — so the entire blocked branch was unreachable from the UI.
// Measured on a Wand wanting T1 `#% increased Chaos Damage`: 439,140 ex holding it at T1 against
// 501,850 ex at T8.
describe('ItemActions — the tier a held mod is rolled at', () => {
  const heldTierSelect = () => screen.getByLabelText(/Tier this mod is rolled at: Normal Prefix/i);

  it('is settable, and is what the solver is told', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    await user.selectOptions(heldTierSelect(), '3');
    // The control must READ from the item, not merely write to it. Pinning its `value` to 1 left this
    // whole test green — `selectOptions` still fires the change, so only the displayed tier was wrong,
    // and the one place a player checks what they told the app is the box itself.
    expect(heldTierSelect()).toHaveValue('3');
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'ns');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
    await waitFor(() => expect(mocks.optimizeItem).toHaveBeenCalled());
    const [, item] = mocks.optimizeItem.mock.calls.at(-1)!;
    expect(item.prefixes).toEqual([{ modId: 'np', tierDisplay: 3 }]);
  });

  it('defaults to the best roll, which is what the app already assumed', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    expect(heldTierSelect()).toHaveValue('1');
  });
});

// ── A target row says which of three things it is, and says it loudly ────────
// The row showed "already have" keyed on the mod id ALONE. A mod held below the tier you want is worse
// than one you do not have — the slot and family are occupied and the bad roll has to be stripped —
// and it rendered green. Reported again once the three states existed but sat in a 10px badge on the
// right edge: "do something that we see more, maybe a separation or make it more visible".
describe('ItemActions — have it, have it too low, or need it', () => {
  const toTarget = async (user: ReturnType<typeof userEvent.setup>, heldTier?: string) => {
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    if (heldTier) await user.selectOptions(screen.getByLabelText(/Tier this mod is rolled at/i), heldTier);
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
  };
  /** The row's own state, read off the stripe — the signal a player actually sees first. */
  const stripe = (container: HTMLElement): string => {
    const row = container.querySelector('[class*="border-l-4"]')!;
    return /emerald/.test(row.className) ? 'have' : /amber/.test(row.className) ? 'reroll' : 'add';
  };

  it('says "on your item" only when the roll is good enough', async () => {
    const user = userEvent.setup();
    await toTarget(user, '1'); // held T1, target defaults to T1
    expect(screen.getByText(/on your item \(T1\)/)).toBeInTheDocument();
    expect(screen.queryByText(/must re-roll/)).toBeNull();
  });

  it('says the roll must be re-rolled when it is below the tier you asked for', async () => {
    const user = userEvent.setup();
    await toTarget(user, '3'); // held T3, target still T1
    expect(screen.getByText(/yours is T3 — must re-roll/)).toBeInTheDocument();
    expect(screen.queryByText(/on your item \(/)).toBeNull();
  });

  // A better roll than you asked for still satisfies "this tier or better".
  it('accepts a roll better than the target', async () => {
    const user = userEvent.setup();
    await toTarget(user, '1');
    await user.selectOptions(screen.getByLabelText(/Target tier for Normal Prefix/i), '3');
    expect(screen.getByText(/on your item \(T1\)/)).toBeInTheDocument();
  });

  // The half the report was actually about: telling a mod you will be ADDING from one already there.
  it('marks a target that is not on the item at all as one to add', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    expect(screen.getByText(/^\+ to add$/)).toBeInTheDocument();
    expect(screen.queryByText(/on your item \(/)).toBeNull();
  });

  // The badge is small and sits at the right edge. The stripe is the signal that survives a glance,
  // so it has to agree with the badge rather than merely exist.
  it('stripes the row to match, so the state survives a glance', async () => {
    const user = userEvent.setup();
    const { container } = render(<ItemActions />);
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);
    await user.click(builderButton(/Normal Prefix/));
    await user.selectOptions(screen.getByLabelText(/Tier this mod is rolled at/i), '3');
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    expect(stripe(container)).toBe('reroll');
    // Ask for the tier you actually hold and the same row turns green.
    await user.selectOptions(screen.getByLabelText(/Target tier for Normal Prefix/i), '3');
    expect(stripe(container)).toBe('have');
  });

  // Counted by SLOT, not by target: alternatives are one position on the item, filled by whichever
  // lands, so three candidates for one slot must not read as three mods you need.
  it('tallies the slots above the list so the shape is readable before the rows are', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(builderButton(/Normal Prefix/));
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'ns');
    const tally = screen.getByText(/2 slots:/).parentElement!;
    expect(tally.textContent).toMatch(/1.*already on your item/);
    expect(tally.textContent).toMatch(/1.*to add/);
  });
});
