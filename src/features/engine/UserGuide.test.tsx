import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import UserGuide, { QUOTED_UI } from './UserGuide';

const SRC = resolve(__dirname, '../..');

describe('the guide disclosure', () => {
  it('is collapsed on arrival, so it costs a first-time visitor one line', () => {
    render(<UserGuide />);
    const toggle = screen.getByRole('button', { name: /New here/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // None of the body copy is on the page until asked for.
    expect(screen.queryByText(/Start from a white base/i)).not.toBeInTheDocument();
  });

  it('opens on click and closes again', async () => {
    const user = userEvent.setup();
    render(<UserGuide />);
    const toggle = screen.getByRole('button', { name: /New here/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Start from a white base/i)).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Start from a white base/i)).not.toBeInTheDocument();
  });

  it('offers a way through to the full guide', async () => {
    const user = userEvent.setup();
    render(<UserGuide />);
    await user.click(screen.getByRole('button', { name: /New here/i }));
    expect(screen.getByRole('button', { name: /Read the full guide/i })).toBeInTheDocument();
  });
});

/**
 * The panel QUOTES the app: it names tabs and figures by their on-screen labels so a reader can match
 * what it says to what they see. That makes it the one piece of copy here that a rename can falsify —
 * change a tab's label and this panel starts describing a screen that no longer exists, silently.
 *
 * `docs/copy-audit.md` exists because a plausible-but-wrong explanation is worse than none. This is
 * that idea enforced by a test rather than by an inventory someone has to remember to re-read.
 */
describe('every string the panel quotes is still on screen somewhere', () => {
  // Where each quoted label is actually rendered. A rename moves the string out of this file and the
  // assertion fails, naming the label that drifted.
  const RENDERED_IN: Record<(typeof QUOTED_UI)[number], string> = {
    'Plan from scratch': 'features/engine/EngineLab.tsx',
    'I have an item': 'features/engine/EngineLab.tsx',
    'Variant': 'features/engine/BaseSelect.tsx',
    'Item level': 'features/engine/EngineLab.tsx',
    'Find plans': 'features/engine/EngineLab.tsx',
    'Quick currency check': 'features/engine/ItemActions.tsx',
    'Full plan to a target': 'features/engine/ItemActions.tsx',
    'chance per attempt': 'features/engine/FrontierView.tsx',
    'what one run costs': 'features/engine/FrontierView.tsx',
    'True expected cost': 'features/engine/ItemActions.tsx',
  };

  it.each(QUOTED_UI)('"%s" still appears in the component that renders it', (label) => {
    const source = readFileSync(join(SRC, RENDERED_IN[label]), 'utf8');
    expect(source).toContain(label);
  });

  it('quotes each of those labels in its own copy', async () => {
    const user = userEvent.setup();
    const { container } = render(<UserGuide />);
    await user.click(screen.getByRole('button', { name: /New here/i }));
    // Read the panel's text as one string: the copy splits labels across <strong> elements, so a
    // per-element query would miss them.
    const text = container.textContent ?? '';
    for (const label of QUOTED_UI) expect(text).toContain(label);
  });
});
