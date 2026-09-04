import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// A stand-in for EngineLab that holds state the way the real one does (a computed plan, an in-flight
// solve). The real component loads patch data and runs a Web Worker; what this file is testing is
// App's decision about mounting, not the lab.
// It renders the REAL UserGuide, because that is where the disclosure lives and the route is
// reached by clicking through it.
vi.mock('./features/engine/EngineLab', async () => {
  const { default: UserGuide } = await import('./features/engine/UserGuide');
  return {
    default: () => (
      <div>
        <UserGuide />
        <span>the crafting lab</span>
        <label>
          work in progress
          <input defaultValue="" />
        </label>
      </div>
    ),
  };
});

import App from './App';

beforeEach(() => {
  window.location.hash = '';
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { window.location.hash = ''; });

describe('the guide route', () => {
  it('shows the lab, not the guide, on arrival', () => {
    render(<App />);
    expect(screen.getByText('the crafting lab')).toBeVisible();
    expect(screen.queryByRole('heading', { level: 1, name: /User Guide/i })).not.toBeInTheDocument();
  });

  it('shows the guide at #guide and comes back again', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /New here/i }));
    await user.click(screen.getByRole('button', { name: /Read the full guide/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /User Guide/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Back to the app/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 1, name: /User Guide/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('the crafting lab')).toBeVisible();
  });

  /**
   * THE property this route is shaped around. A solve can run for minutes and its result lives in
   * EngineLab's component state, so unmounting the lab to show the guide would throw away work a
   * player was in the middle of — for the sake of reading a paragraph. App hides it instead.
   */
  it('keeps the lab mounted while the guide is open, so a solve survives being read over', async () => {
    const user = userEvent.setup();
    render(<App />);

    const field = screen.getByLabelText(/work in progress/i);
    await user.type(field, 'half a craft');
    expect(field).toHaveValue('half a craft');

    await user.click(screen.getByRole('button', { name: /New here/i }));
    await user.click(screen.getByRole('button', { name: /Read the full guide/i }));
    await screen.findByRole('heading', { level: 1, name: /User Guide/i });

    // Still in the tree, merely not on screen — this is the assertion that fails if App ever swaps
    // to `showGuide ? <GuidePage/> : <EngineLab/>`.
    expect(screen.getByLabelText(/work in progress/i)).toHaveValue('half a craft');
    expect(screen.getByText('the crafting lab')).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: /Back to the app/i }));
    expect(screen.getByLabelText(/work in progress/i)).toHaveValue('half a craft');
  });
});
