import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasteItem from './PasteItem';
import { loadPatch } from '../../../packages/engine/src/index.ts';

const data = loadPatch('data/patches/0.5.0');

/** The pasted text is itself in the DOM, inside the textarea, so every text query has to look past
 *  it — otherwise "Corrupted" matches the paste as well as the warning about it. */
const shown = (re: RegExp) => screen.getByText(re, { ignore: 'textarea' });

const HELMET = `Item Class: Helmets
Rarity: Rare
Kraken Crest
Masked Greathelm
--------
Item Level: 81
--------
+219 to Armour
16% increased Rarity of Items found`;

afterEach(cleanup);

/** Open the panel and type an item into it. `paste` rather than `type` — this is a paste box, and
 *  typing 200 characters through userEvent is slow enough to matter in a suite. */
async function paste(text: string, onApply = vi.fn()) {
  const user = userEvent.setup();
  render(<PasteItem data={data} onApply={onApply} />);
  await user.click(screen.getByRole('button', { name: /Paste your item/i }));
  const box = screen.getByLabelText(/Paste your item’s text/i);
  await user.click(box);
  await user.paste(text);
  return { user, onApply };
}

describe('the paste panel', () => {
  it('is collapsed on arrival, so it costs the tab one line', () => {
    render(<PasteItem data={data} onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Paste your item/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText(/Paste your item’s text/i)).toBeNull();
  });

  it('shows what it read: the base, the level, and each modifier', async () => {
    await paste(HELMET);
    expect(shown(/Masked Greathelm/)).toBeInTheDocument();
    expect(shown(/Helmets_str/)).toBeInTheDocument();
    expect(shown(/ilvl 81/)).toBeInTheDocument();
    expect(shown(/^\+219 to Armour$/)).toBeInTheDocument();
  });

  it('says so, kindly, when the text is not an item', async () => {
    await paste('some notes I had on the clipboard');
    expect(shown(/doesn’t look like an item/i)).toBeInTheDocument();
  });

  /** Nothing reaches the tab until the button is pressed — reading is free, overwriting a craft the
   *  player already set up is not. */
  it('applies nothing until "Use this item" is pressed', async () => {
    const { user, onApply } = await paste(HELMET);
    expect(onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Use this item/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0]![0]).toMatchObject({
      baseId: 'Helmets_str', level: 81, rarity: 'rare',
    });
  });

  /**
   * The mod with three candidates is left OFF rather than guessed, and the panel says how many still
   * need an answer. A guess would put a mod on the item the player does not hold.
   */
  it('leaves an undecidable modifier off, and says one still needs an answer', async () => {
    const { user, onApply } = await paste(HELMET);
    expect(shown(/1 still need an answer/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Use this item/i }));
    expect(onApply.mock.calls[0]![0].prefixes).toEqual([
      { modId: 'Helmets_str/LocalPhysicalDamageReductionRating', tierDisplay: 1 },
    ]);
    expect(onApply.mock.calls[0]![0].suffixes).toEqual([]);
  });

  it('takes the answer and puts the mod on the item', async () => {
    const { user, onApply } = await paste(HELMET);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Which mod/i }),
      'Helmets_str/ItemFoundRarityIncreasePrefix',
    );
    await user.click(screen.getByRole('button', { name: /Use this item/i }));
    expect(onApply.mock.calls[0]![0].prefixes).toEqual([
      { modId: 'Helmets_str/LocalPhysicalDamageReductionRating', tierDisplay: 1 },
      { modId: 'Helmets_str/ItemFoundRarityIncreasePrefix', tierDisplay: 1 },
    ]);
  });

  it('refuses to apply a corrupted item, and says why', async () => {
    const { onApply } = await paste(`${HELMET}\n--------\nCorrupted`);
    expect(shown(/Corrupted, so no currency/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use this item/i })).toBeDisabled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('offers the split reading where the grouping is a real question', async () => {
    await paste(`Item Class: Bows
Rarity: Rare
X Y
Heavy Bow
--------
Item Level: 81
--------
188% increased Physical Damage
+113 to Accuracy Rating`);
    expect(screen.getByRole('button', { name: /two separate mods/i })).toBeInTheDocument();
  });
});
