import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import UserGuide, { QUOTED_UI } from './UserGuide';
import { getWorkspace, setWorkspace } from '../../lib/workspace';

const onTab = (mode: 'plan' | 'item') => { setWorkspace({ ...getWorkspace(), mode }); };

/** Open the panel and hand back everything it says, as one string. */
async function openPanel(): Promise<string> {
  const user = userEvent.setup();
  const { container } = render(<UserGuide />);
  await user.click(screen.getByRole('button', { name: /New here/i }));
  return container.textContent ?? '';
}

const SRC = resolve(__dirname, '../..');

describe('the guide disclosure', () => {
  it('is collapsed on arrival, so it costs a first-time visitor one line', () => {
    render(<UserGuide />);
    const toggle = screen.getByRole('button', { name: /New here/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // None of the body copy is on the page until asked for.
    expect(screen.queryByText(/start to finish/i)).not.toBeInTheDocument();
  });

  it('opens on click and closes again', async () => {
    const user = userEvent.setup();
    render(<UserGuide />);
    const toggle = screen.getByRole('button', { name: /New here/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/start to finish/i)).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/start to finish/i)).not.toBeInTheDocument();
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
    'Rarity': 'features/engine/ItemActions.tsx',
    'Find plans': 'features/engine/EngineLab.tsx',
    'Compute plan': 'features/engine/ItemActions.tsx',
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

  // ACROSS BOTH TABS, because the walkthrough follows the tab: `Find plans` is only ever on the lab
  // side and `Compute plan` only on the item side. Asserting against one tab would quietly stop
  // covering half the list.
  it('quotes each of those labels somewhere in its own copy', async () => {
    onTab('plan');
    const fromScratch = await openPanel();
    cleanup();
    onTab('item');
    const fromItem = await openPanel();
    onTab('plan');

    // Read the text as one string: the copy splits labels across <strong> elements, so a
    // per-element query would miss them.
    const both = fromScratch + fromItem;
    for (const label of QUOTED_UI) expect(both).toContain(label);
  });
});

/**
 * The two tabs are different jobs with different controls. Showing both walkthroughs at once made a
 * beginner filter the half that did not apply before they could start, so the steps follow the tab —
 * from the same store the tab bar writes to.
 */
describe('the steps follow the tab underneath', () => {
  beforeEach(() => { onTab('plan'); });
  afterEach(() => { cleanup(); onTab('plan'); });

  it('walks through a white base on the Plan from scratch tab', async () => {
    const text = await openPanel();
    expect(text).toContain('Plan from scratch — start to finish');
    expect(text).toContain('Find plans');
    // The other tab's controls are not on screen competing for attention.
    expect(text).not.toContain('Compute plan');
    expect(text).not.toContain('Quick currency check');
  });

  it('walks through a held item on the I have an item tab', async () => {
    onTab('item');
    const text = await openPanel();
    expect(text).toContain('I have an item — start to finish');
    expect(text).toContain('Quick currency check');
    expect(text).toContain('Compute plan');
    expect(text).not.toContain('Find plans');
  });

  it('names the other tab either way, so the panel cannot teach that it does not exist', async () => {
    expect(await openPanel()).toContain('I have an item');
    cleanup();
    onTab('item');
    expect(await openPanel()).toContain('Plan from scratch');
  });
});

/**
 * The in-place explainers for these are rendered only once the flag is already set — `fractured.size
 * > 0`, `desecratedIds.size > 0`. So the app describes each control exclusively to people who have
 * already found it, and this panel is where someone who has not can read about it.
 */
describe('the mod flags are explained before you have used them', () => {
  beforeEach(() => { onTab('plan'); });
  afterEach(() => { cleanup(); onTab('plan'); });

  it('covers fractured, alternatives and pinning on the lab tab', async () => {
    const text = await openPanel();
    expect(text).toContain('🔒');
    expect(text).toContain('fractured');
    expect(text).toContain('⊕ or…');
    expect(text).toContain('📌');
  });

  it('covers fractured and desecrated on the item tab', async () => {
    onTab('item');
    const text = await openPanel();
    expect(text).toContain('🔒');
    expect(text).toContain('💀');
    expect(text).toContain('Desecration');
  });
});
