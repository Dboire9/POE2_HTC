import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhittlingToggle } from './SearchEffort';
import {
  DEFAULT_EXCLUSIONS, STORAGE_KEY, getExclusions, setExclusions, toExcludedKeys,
} from '../../lib/currencyPrefs';

// The toggle is a VIEW of the exclusion store, never a second copy of it. These pin that, and pin the
// one trap in the group's semantics: an emptied `only` list means "the WHOLE omen group is excluded",
// which is the opposite of what unticking the last member should do.
describe('WhittlingToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    setExclusions(DEFAULT_EXCLUSIONS);
  });

  it('starts OFF, matching the default, and says so', () => {
    render(<WhittlingToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveTextContent('Not using');
    expect(toExcludedKeys(getExclusions())).toContain('OmenofWhittling');
  });

  it('turning it on clears the exclusion — and does not leave an empty group behind', async () => {
    render(<WhittlingToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    // An empty `only` would re-exclude EVERY omen. The group must be gone, not emptied.
    expect(getExclusions().omens).toBeUndefined();
    expect(toExcludedKeys(getExclusions())).toEqual([]);
  });

  it('round-trips back to excluded, and only Whittling', async () => {
    render(<WhittlingToggle />);
    await userEvent.click(screen.getByRole('button'));   // on
    await userEvent.click(screen.getByRole('button'));   // off again
    expect(toExcludedKeys(getExclusions())).toEqual(['OmenofWhittling']);
  });

  it('keeps other omen exclusions untouched when it flips', async () => {
    setExclusions({ omens: { only: ['whittling', 'light'] } });
    render(<WhittlingToggle />);
    await userEvent.click(screen.getByRole('button'));   // allow Whittling
    expect(toExcludedKeys(getExclusions())).toEqual(['OmenofLight']);
  });

  it('a stored empty object stays empty — a cleared setting is not re-defaulted', () => {
    // `read()` applies the default only when storage holds NOTHING. Someone who cleared their
    // exclusions must stay cleared, or every reload would silently re-exclude Whittling on them.
    localStorage.setItem(STORAGE_KEY, '{}');
    setExclusions({});
    expect(toExcludedKeys(getExclusions())).toEqual([]);
  });
});
