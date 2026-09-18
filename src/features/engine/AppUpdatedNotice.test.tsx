import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EngineMod } from '../../lib/engine';

/**
 * The on-screen half of a stale tab: when a solve fails because the site was redeployed under it, both
 * tabs show a reload notice INSTEAD of "The planner can't build this target", which would blame the
 * craft for something the deployment did.
 */

const mocks = vi.hoisted(() => ({ solve: vi.fn() }));

vi.mock('../../lib/engineClient', async (orig) => ({
  ...(await orig<typeof import('../../lib/engineClient')>()),
  solve: mocks.solve,
  prewarm: () => undefined,
}));

const tier = { display: 1, name: 't1', ilvl: 1, label: 'T1', range: '1–2', values: ['1–2'] };
const NP: EngineMod = { id: 'np', text: 'Normal Prefix', type: 'prefix', family: 'A', source: 'normal', tiers: [tier] };
vi.mock('../../lib/engine', async (orig) => ({
  ...(await orig<typeof import('../../lib/engine')>()),
  loadEngine: () => Promise.resolve({ data: {} as never, prices: { currency: {}, omens: {} } as never }),
  listBases: () => [{ id: 'Wands', name: 'Wands', category: 'weapon' }],
  listMods: () => ({ prefixes: [NP], suffixes: [] }),
  listDesecrated: () => [],
  listPerfectEssences: () => [],
  currencyActions: () => [],
}));

import AppUpdatedNotice from './AppUpdatedNotice';
import EngineLab from './EngineLab';
import ItemActions from './ItemActions';
import { AppUpdated } from '../../lib/engineClient';

afterEach(() => { vi.unstubAllGlobals(); mocks.solve.mockReset(); });

describe('AppUpdatedNotice', () => {
  it('says what happened, that nothing is lost, and reloads on request', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });
    render(<AppUpdatedNotice />);
    expect(screen.getByRole('alert')).toHaveTextContent(/updated since you opened this tab/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/targets are saved/i);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reload' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('EngineLab — a solve that fails because the site moved on', () => {
  it('shows the reload notice, not a planner error', async () => {
    // Lazily: a rejected promise built up front sits unhandled until the click, and is reported as such.
    mocks.solve.mockImplementation(() => ({ promise: Promise.reject(new AppUpdated()), cancel: () => undefined }));
    const user = userEvent.setup();
    render(<EngineLab />);
    await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
    await user.click(screen.getByRole('button', { name: /Add Normal Prefix/i }));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/updated since you opened this tab/i)).toBeInTheDocument();
    expect(screen.queryByText(/can’t build this target/i)).toBeNull();
  });

  /** …and an ordinary failure still says what it always said. */
  it('keeps the planner error for a failure that is not a redeploy', async () => {
    mocks.solve.mockImplementation(() => ({ promise: Promise.reject(new Error('boom')), cancel: () => undefined }));
    const user = userEvent.setup();
    render(<EngineLab />);
    await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
    await user.click(screen.getByRole('button', { name: /Add Normal Prefix/i }));
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    expect(await screen.findByText(/can’t build this target/i)).toBeInTheDocument();
    expect(screen.queryByText(/updated since you opened this tab/i)).toBeNull();
  });
});

/** The Item tab has the same two-line wiring, and it is tested rather than assumed to match. */
describe('ItemActions — a solve that fails because the site moved on', () => {
  it('shows the reload notice, not a planner error', async () => {
    mocks.solve.mockImplementation(() => ({ promise: Promise.reject(new AppUpdated()), cancel: () => undefined }));
    const user = userEvent.setup();
    render(<ItemActions />);
    await screen.findByPlaceholderText(/Search modifiers to add to your item/i);
    await user.click(screen.getByRole('button', { name: /Full plan to a target/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Add a target mod/i }), 'np');
    await user.click(screen.getByRole('button', { name: /Compute plan/i }));
    expect(await screen.findByText(/updated since you opened this tab/i)).toBeInTheDocument();
  });
});
