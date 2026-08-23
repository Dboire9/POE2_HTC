import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CurrencyAction, EngineMod, EngineResult } from '../../lib/engine';

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
  plansEvaluated: 1, currencyDepth: 'full', assumedOdds: false,
};
// Two Annulment actions (plain + Omen of Light) — the component must render BOTH (keyed by label, not
// currency, or React would collide the two 'annul' entries).
const annulActions: CurrencyAction[] = [
  { currency: 'annul', label: 'Orb of Annulment', detail: 'removes one random mod', prob: 0.5, cost: 1.5, feasible: true },
  { currency: 'annul', label: 'Orb of Annulment + Omen of Light', detail: 'removes the desecrated mod for certain', prob: 1, cost: 11.5, feasible: true },
];

const mocks = vi.hoisted(() => ({ currencyActions: vi.fn(), optimizeItem: vi.fn() }));

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
  };
});

// eslint-disable-next-line import/first
import ItemActions from './ItemActions';

async function loaded() {
  render(<ItemActions />);
  await screen.findByPlaceholderText(/Search modifiers to add to your item/i);
}
const builderButton = (text: string | RegExp) => screen.getByRole('button', { name: text });

beforeEach(() => {
  mocks.currencyActions.mockReturnValue([]);
  mocks.optimizeItem.mockReturnValue(okFrontier);
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
    // Pick a desecrated target → the other desecrated option is gone (one max).
    await user.selectOptions(dropdown, 'ds');
    expect(within(dropdown).queryByRole('option', { name: /Carved Armour Break/ })).not.toBeInTheDocument();
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
