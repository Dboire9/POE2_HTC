import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EngineMod, EngineResult } from '../../lib/engine';

// Testing Library resolves `getByRole(role, { name })` through the real accessibility tree, so
// querying a control BY ITS ACCESSIBLE NAME is the accessibility assertion — no axe dependency
// needed to prove the tree is right. (What a screen reader then *says* is a separate question; this
// pins the semantics it reads from.)
//
// The controls under test carry the app's crafting semantics — fracture, pin, remove, add — and every
// one of them used to announce as an emoji, because emoji text content outranks `title` when a name
// is computed.

const tier = (display: number) => ({ display, name: `t${display}`, ilvl: 1, label: `T${display}`, range: '10–20', values: ['10–20'] });
const mod = (
  id: string, text: string, type: 'prefix' | 'suffix', source: EngineMod['source'], family: string, tiers = 3,
): EngineMod => ({ id, text, type, family, source, tiers: Array.from({ length: tiers }, (_, i) => tier(i + 1)) });

const NP = mod('np', 'Normal Prefix', 'prefix', 'normal', 'FamA');
const NP2 = mod('np2', 'Sibling Prefix', 'prefix', 'normal', 'FamA'); // same family as NP
const NS = mod('ns', 'Normal Suffix', 'suffix', 'normal', 'FamS');

const okFrontier: EngineResult = {
  frontier: [{ probability: 0.5, expected: 2, perAttempt: 1, expectedAttempts: 2, steps: [] }],
  plansEvaluated: 1, assumedOdds: false,
};

const mocks = vi.hoisted(() => ({ optimize: vi.fn(), optimizeItem: vi.fn() }));

vi.mock('../../lib/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/engine')>();
  return {
    ...actual,
    loadEngine: () => Promise.resolve({ data: {} as never, prices: { currency: {}, omens: {} } as never }),
    listBases: () => [{ id: 'Wands', name: 'Wands', category: 'weapon' }],
    listMods: () => ({ prefixes: [NP, NP2], suffixes: [NS] }),
    listDesecrated: () => [],
    listPerfectEssences: () => [],
    currencyActions: () => [],
    optimize: mocks.optimize,
    optimizeItem: mocks.optimizeItem,
  };
});

import EngineLab from './EngineLab';

async function lab() {
  render(<EngineLab />);
  await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
}
const addTarget = async (user: ReturnType<typeof userEvent.setup>, text: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`Add ${text}`, 'i') }));

describe('controls are named by what they do, not by their icon', () => {
  it('the target-row buttons have real names', async () => {
    const user = userEvent.setup();
    await lab();
    await addTarget(user, 'Normal Prefix');

    expect(screen.getByRole('button', { name: /Fractured on the base: Normal Prefix/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pin as non-negotiable: Normal Prefix/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove Normal Prefix from the target/i })).toBeInTheDocument();
    // The emoji must not be the name — that is exactly what it used to announce as.
    expect(screen.queryByRole('button', { name: '🔓' })).toBeNull();
    expect(screen.queryByRole('button', { name: '📌' })).toBeNull();
    expect(screen.queryByRole('button', { name: '✕' })).toBeNull();
  });

  it('the tier select is named after its mod, since "T1" alone means nothing', async () => {
    const user = userEvent.setup();
    await lab();
    await addTarget(user, 'Normal Prefix');
    expect(screen.getByRole('combobox', { name: /Target tier for Normal Prefix/i })).toBeInTheDocument();
  });

  it('the search box has a name that survives typing, unlike a placeholder', async () => {
    await lab();
    expect(screen.getByRole('textbox', { name: /Search modifiers to add as targets/i })).toBeInTheDocument();
  });
});

describe('toggles report their state', () => {
  it('the tab switcher says which tab is current', async () => {
    const user = userEvent.setup();
    await lab();
    const plan = screen.getByRole('button', { name: /Plan from scratch/i });
    const item = screen.getByRole('button', { name: /I have an item/i });
    expect(plan).toHaveAttribute('aria-pressed', 'true');
    expect(item).toHaveAttribute('aria-pressed', 'false');

    await user.click(item);
    expect(screen.getByRole('button', { name: /I have an item/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('the fracture toggle flips aria-pressed, not just its colour', async () => {
    const user = userEvent.setup();
    await lab();
    await addTarget(user, 'Normal Prefix');
    const lock = () => screen.getByRole('button', { name: /Fractured on the base: Normal Prefix/i });
    expect(lock()).toHaveAttribute('aria-pressed', 'false');
    await user.click(lock());
    expect(lock()).toHaveAttribute('aria-pressed', 'true');
  });

  /**
   * The pin used to be rendered only while the budget box held text, on the reasoning that it means
   * nothing to the frontier. That made it unreachable in the order people actually build a craft —
   * pick the mods, decide what is non-negotiable, THEN price it — and worse, it stranded pins already
   * set: clearing the budget kept them in state while removing every way to see or undo them.
   *
   * No budget is typed anywhere in this test. That is the point of it.
   */
  it('the pin is a plain toggle, reachable before any budget exists', async () => {
    const user = userEvent.setup();
    await lab();
    await addTarget(user, 'Normal Prefix');
    const pin = () => screen.getByRole('button', { name: /Pin as non-negotiable: Normal Prefix/i });
    expect(pin()).toHaveAttribute('aria-pressed', 'false');
    await user.click(pin());
    expect(pin()).toHaveAttribute('aria-pressed', 'true');
    // Dormant, not absent — the title has to admit a pin does nothing until a budget is set.
    expect(pin().getAttribute('title')).toMatch(/when you set a budget/i);
    // …and the trade-off is stated in visible text, not only in a tooltip touch users never see.
    expect(screen.getByText(/Pin everything and there’s nothing left for it to search/i))
      .toBeInTheDocument();
    await user.click(pin());
    expect(pin()).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('a disabled control explains itself where it can be reached', () => {
  // A disabled button is not focusable, so a `title` is unreachable by keyboard, screen reader AND
  // touch. The reason has to exist as text the control points at.
  it('says WHY a same-family mod cannot be added', async () => {
    const user = userEvent.setup();
    await lab();
    await addTarget(user, 'Normal Prefix');

    const sibling = screen.getByRole('button', { name: /Add Sibling Prefix/i });
    expect(sibling).toBeDisabled();
    const describedBy = sibling.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent)
      .toMatch(/family .* is already on the item/i);
  });
});

describe('a finished solve is announced', () => {
  it('states the outcome in a live region rather than landing silently', async () => {
    const user = userEvent.setup();
    mocks.optimize.mockReturnValue(okFrontier);
    await lab();
    await addTarget(user, 'Normal Prefix');
    await user.click(screen.getByRole('button', { name: /Find plans/i }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toMatch(/1 plan found/i);
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('announces an empty frontier as a failure, not as silence', async () => {
    const user = userEvent.setup();
    mocks.optimize.mockReturnValue({ ...okFrontier, frontier: [] });
    await lab();
    await addTarget(user, 'Normal Prefix');
    await user.click(screen.getByRole('button', { name: /Find plans/i }));

    expect((await screen.findByRole('status')).textContent).toMatch(/no achievable plan/i);
  });
});

// The header's actions are how a user reaches Discord or reports a bug. Resolving each BY ITS
// ACCESSIBLE NAME is the assertion: if a name ever collapses to the bare emoji (which is what happens
// when the text is hidden and no aria-label is set), these queries stop finding anything.
describe('header actions are reachable by name', () => {
  it('every action has a real name, not an emoji', async () => {
    const App = (await import('../../App')).default;
    render(<App />);
    for (const name of [/Report a problem/i, /Join the Discord community/i, /Support the project/i]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    // Nothing is named by an emoji alone.
    for (const btn of screen.getAllByRole('button')) {
      expect((btn.getAttribute('aria-label') ?? btn.textContent ?? '').replace(/[\p{Emoji}\s]/gu, '')).not.toBe('');
    }
  });

  it('the report trigger is a disclosure, and says which panel it controls', async () => {
    const App = (await import('../../App')).default;
    render(<App />);
    const trigger = screen.getByRole('button', { name: /Report a problem/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');
  });
});
