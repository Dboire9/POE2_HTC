import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EngineMod, EngineResult } from '../../lib/engine';

// EngineLab holds all the target-picker RULES (family / one-essence / one-desecrated locks, the
// fracture toggle, the essence↔fracture conflict, reset, compute routing). Those live only in the
// component, so we drive the real component against a MOCKED facade with a tiny controlled mod set —
// the facade itself is tested separately in engine.test.ts. This isolates the interaction logic.

const tier = (display: number) => ({ display, name: `t${display}`, ilvl: 1, label: `T${display}`, range: '10–20' });
const mod = (
  id: string, text: string, type: 'prefix' | 'suffix', source: EngineMod['source'], family: string, tiers = 3,
): EngineMod => ({ id, text, type, family, source, tiers: Array.from({ length: tiers }, (_, i) => tier(i + 1)) });

// Two normal prefixes SHARING a family (siblings), two essence prefixes, a normal suffix, two desecrated
// suffixes — enough to exercise every "at most one / family exclusion" rule.
const NP = mod('np', 'Normal Prefix', 'prefix', 'normal', 'FamA');
const NP2 = mod('np2', 'Sibling Prefix', 'prefix', 'normal', 'FamA'); // same family as NP
const EP = mod('ep', 'Essence Prefix', 'prefix', 'essence', 'FamE');
const EP2 = mod('ep2', 'Essence Prefix Two', 'prefix', 'essence', 'FamE2');
const NS = mod('ns', 'Normal Suffix', 'suffix', 'normal', 'FamS');
const DS = mod('ds', 'Desecrated Suffix', 'suffix', 'desecrated', 'FamD', 1);
const DS2 = mod('ds2', 'Desecrated Suffix Two', 'suffix', 'desecrated', 'FamD2', 1);

const okFrontier: EngineResult = {
  frontier: [{ probability: 0.5, expected: 2, perAttempt: 1, expectedAttempts: 2, steps: [] }],
  plansEvaluated: 1, currencyDepth: 'full',
};

const mocks = vi.hoisted(() => ({
  optimize: vi.fn(),
  optimizeItem: vi.fn(),
  alternatives: vi.fn(),
  alternativesForItem: vi.fn(),
}));

vi.mock('../../lib/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/engine')>();
  return {
    ...actual,
    loadEngine: () => Promise.resolve({ data: {} as never, prices: {} as never }),
    listBases: () => [{ id: 'Wands', name: 'Wands', category: 'weapon' }],
    listMods: () => ({ prefixes: [NP, NP2, EP, EP2], suffixes: [NS] }),
    listDesecrated: () => [DS, DS2],
    // Needed once ItemActions renders here (see the tab-switch regression below): it calls these on
    // mount, and the stub `data` above has no real pools for the actual implementations to read.
    listPerfectEssences: () => [],
    currencyActions: () => [],
    optimize: mocks.optimize,
    optimizeItem: mocks.optimizeItem,
    alternatives: mocks.alternatives,
    alternativesForItem: mocks.alternativesForItem,
  };
});

// eslint-disable-next-line import/first
import EngineLab from './EngineLab';

/** The picker row for a mod's text (the row div holding its "+"), from within the mod-picker card. */
const pickerRow = (text: string): HTMLElement => screen.getByText(text).closest('div') as HTMLElement;
const addButton = (text: string): HTMLElement => within(pickerRow(text)).getByRole('button');

async function loaded() {
  render(<EngineLab />);
  // Wait for loadEngine().then to resolve and the picker to appear.
  await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
}

beforeEach(() => {
  mocks.optimize.mockReturnValue(okFrontier);
  mocks.optimizeItem.mockReturnValue(okFrontier);
  mocks.alternatives.mockReset();
  mocks.alternativesForItem.mockReset();
});

describe('EngineLab — loads and lists', () => {
  it('renders the base and its mods once the engine resolves', async () => {
    await loaded();
    expect(screen.getByText('Normal Prefix')).toBeInTheDocument();
    expect(screen.getByText('Desecrated Suffix')).toBeInTheDocument();
  });
});

describe('EngineLab — target picker rules', () => {
  it('adds a mod to the target and updates the count', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.getByText(/Target item \(1 mod\)/)).toBeInTheDocument();
  });

  it('family exclusion: adding a mod disables its same-family sibling in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    expect(addButton('Sibling Prefix')).not.toBeDisabled();
    await user.click(addButton('Normal Prefix'));
    expect(addButton('Sibling Prefix')).toBeDisabled(); // FamA already claimed
  });

  it('at most one essence-only mod: a second essence disables in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Essence Prefix'));
    expect(addButton('Essence Prefix Two')).toBeDisabled();
  });

  it('at most one desecrated mod: a second desecrated disables in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Desecrated Suffix'));
    expect(addButton('Desecrated Suffix Two')).toBeDisabled();
  });
});

describe('EngineLab — fracture toggle', () => {
  it('marks a normal target fractured and shows the badge', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    // The target row now has a 🔓 toggle; click it to fracture.
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    expect(screen.getByText('fractured')).toBeInTheDocument();
  });
});

describe('EngineLab — essence ↔ fracture are mutually exclusive', () => {
  it('a fractured mod present blocks adding an essence in the picker', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    // Now fractured ⇒ essence mods can't be added.
    expect(addButton('Essence Prefix')).toBeDisabled();
  });

  it('an essence present disables the fracture lock on a normal target', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    await user.click(addButton('Essence Prefix'));
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    // The lock is disabled (can't fracture while an essence is in the craft).
    expect(within(targetRow).getByTitle(/Can’t fracture with an essence/i)).toBeDisabled();
  });
});

// REGRESSION. `EngineLab` renders the item tab as `mode === 'item' ? <ItemActions/> : (…)`, so
// switching tabs UNMOUNTS a component — and while each tab kept its work in local `useState`, that
// work was destroyed. For a 6-mod item that is roughly 15 searches and clicks, gone by accident. The
// state now lives in the shared workspace store, so unmounting costs nothing.
describe('EngineLab — work survives a tab switch', () => {
  // It is ITEMACTIONS that gets unmounted — EngineLab stays mounted the whole time, rendering the
  // tabs — so the item you built is what used to die, not the Lab's target list. (Verified by
  // mutation: putting the Lab's `targets` back on local useState does NOT fail this suite, because
  // that state was never at risk.)
  it('keeps the item you built when you leave the item tab and come back', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);

    // Put a mod on the item, and confirm it landed.
    await user.click(screen.getByRole('button', { name: /Normal Prefix/ }));
    expect(await screen.findByTitle(/Remove from item/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Plan from scratch/i }));
    expect(screen.queryByPlaceholderText(/Search modifiers to add to your item/i)).toBeNull(); // unmounted

    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    expect(await screen.findByTitle(/Remove from item/i)).toBeInTheDocument();
  });

  it('remembers which tab you were on across a remount', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: /I have an item/i }));
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);

    // A fresh mount reads the store, which is exactly what a page reload does.
    cleanup();
    render(<EngineLab />);
    expect(await screen.findByPlaceholderText(/Search modifiers to add to your item/i)).toBeInTheDocument();
  });
});

describe('EngineLab — reset and compute routing', () => {
  it('reset clears the target list', async () => {
    const user = userEvent.setup();
    await loaded();
    await user.click(addButton('Normal Prefix'));
    expect(screen.getByText(/Target item/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.queryByText(/Target item/)).not.toBeInTheDocument();
  });

  it('routes a plain craft through optimize, and a fractured craft through optimizeItem', async () => {
    const user = userEvent.setup();
    await loaded();

    // Plain: add a normal mod and compute → optimize (from white).
    await user.click(addButton('Normal Prefix'));
    await user.click(screen.getByRole('button', { name: /Compute frontier/i }));
    // `waitFor`, because computing crosses a Worker boundary and is genuinely asynchronous. It used to
    // be a `setTimeout(…, 0)` that `user.click` happened to flush, so a bare assertion passed by luck —
    // then failed on CI once the extra hops didn't fit in the same tick.
    await waitFor(() => expect(mocks.optimize).toHaveBeenCalledTimes(1));
    expect(mocks.optimizeItem).not.toHaveBeenCalled();

    // Fracture it and recompute → optimizeItem (from the carved Rare).
    const targetRow = screen.getByText('Normal Prefix').closest('div') as HTMLElement;
    await user.click(within(targetRow).getByTitle(/Mark as already fractured/i));
    await user.click(screen.getByRole('button', { name: /Compute frontier/i }));
    await waitFor(() => expect(mocks.optimizeItem).toHaveBeenCalledTimes(1));
  });
});
