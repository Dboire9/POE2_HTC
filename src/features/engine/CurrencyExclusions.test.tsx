import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyExclusions from './CurrencyExclusions';
import { STRENGTH_GROUP } from '../../lib/currencyPrefs';

const open = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /Currency I don’t have/i }));

/**
 * The strength shortcut is the one row in this list that is not a currency you can hold. It sits above
 * rows it silently overlaps, and it shipped labelled "Upgraded orbs (any type)" — which told a reader
 * neither what an "upgraded orb" was nor that Essences were, at the time, excluded from "any type".
 * A user asked, in as many words, "what is this?".
 */
describe('the cross-cutting strength row explains itself', () => {
  it('names its scope in the label and its effect in a line underneath', async () => {
    const user = userEvent.setup();
    render(<CurrencyExclusions />);
    await open(user);

    // The label has to say WHICH currencies, because the row spans several listed separately below.
    expect(screen.getByLabelText(STRENGTH_GROUP.label)).toBeInTheDocument();
    expect(STRENGTH_GROUP.label).toMatch(/orbs and essences/i);

    // And the effect is stated without needing to tick it first — an unticked row teaches nothing.
    expect(screen.getByText(/same as ticking Greater under every orb and essence/i)).toBeInTheDocument();
  });

  // Only a row that needs one gets one; a hint on "Chaos Orbs" would be noise in a 12-row list.
  it('leaves the self-evident rows unadorned', async () => {
    const user = userEvent.setup();
    render(<CurrencyExclusions />);
    await open(user);
    expect(screen.getAllByText(/Shortcut:/i)).toHaveLength(1);
  });
});
