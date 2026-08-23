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
    loadEngine: () => Promise.resolve({ data: {} as never, prices: {} as never }),
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
