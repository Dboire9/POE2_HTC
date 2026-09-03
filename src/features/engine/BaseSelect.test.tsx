import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BaseSelect from './BaseSelect';
import type { EngineBase } from '../../lib/engine';

// The picker splits on ONE axis per category: attributes (armour) or spell element (wands, staves).
// Which one is decided from the suffixes actually present, not from a list of categories kept in step
// by hand — a category added to that list's blind spot would silently render raw ids at a player.
const base = (id: string, category: string, name = id): EngineBase => ({ id, name, category });

const ARMOUR: EngineBase[] = [
  base('Body_Armours_str', 'Body_Armours'),
  base('Body_Armours_int', 'Body_Armours'),
  base('Body_Armours_str_int', 'Body_Armours'),
];
const WANDS: EngineBase[] = [
  base('Wands', 'Wands', 'Acrid Wand, Attuned Wand, Critical Wand, Dueling Wand'),
  base('Wands_cold', 'Wands', 'Frigid Wand'),
  base('Wands_fire', 'Wands', 'Volatile Wand'),
  base('Wands_chaos', 'Wands', 'Primordial Wand, Withered Wand'),
];

describe('BaseSelect — spell-element variants', () => {
  const variantMenu = () => screen.getByRole('combobox', { name: /Variant/i });

  it('names the element and the real game bases behind each row', () => {
    render(<BaseSelect bases={WANDS} value="Wands_cold" onChange={vi.fn()} />);
    const menu = variantMenu();
    expect(within(menu).getByRole('option', { name: 'Cold only · Frigid Wand' })).toBeInTheDocument();
    expect(within(menu).getByRole('option', { name: 'Fire only · Volatile Wand' })).toBeInTheDocument();
    // Two bases fit; the row names both rather than picking one.
    expect(within(menu).getByRole('option', { name: 'Chaos only · Primordial Wand, Withered Wand' })).toBeInTheDocument();
  });

  // The unrestricted base is what the id `Wands` has always meant, and it leads the list because it is
  // what most bases are. Eight names do not fit a <select>, so two show and the rest are counted.
  it('leads with the unrestricted base and counts the names it cannot fit', () => {
    render(<BaseSelect bases={WANDS} value="Wands" onChange={vi.fn()} />);
    const options = within(variantMenu()).getAllByRole('option');
    expect(options[0]).toHaveTextContent('Any element · Acrid Wand, Attuned Wand +2');
    // …and the full list is still reachable rather than thrown away.
    expect(options[0]).toHaveAttribute('title', 'Acrid Wand, Attuned Wand, Critical Wand, Dueling Wand');
  });

  /**
   * Ordered by ELEMENT, not by name.
   *
   * Falling back to the attribute ranking leaves every element suffix at `indexOf` -1 — all equal — so
   * the list sorts by name and happens to put the unrestricted row first anyway. That made the
   * ordering look right while nothing chose it, and this fixture separates the two: by element the
   * order is Any, Fire, Cold, Chaos; by name it is Any, Cold ("Frigid"), Chaos ("Primordial"), Fire
   * ("Volatile").
   */
  it('orders the rows by element rather than by base name', () => {
    render(<BaseSelect bases={WANDS} value="Wands" onChange={vi.fn()} />);
    expect(within(variantMenu()).getAllByRole('option').map((o) => o.getAttribute('value'))).toEqual([
      'Wands', 'Wands_fire', 'Wands_cold', 'Wands_chaos',
    ]);
  });

  it('selects the variant the player picks', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<BaseSelect bases={WANDS} value="Wands" onChange={onChange} />);
    await user.selectOptions(variantMenu(), 'Wands_fire');
    expect(onChange).toHaveBeenCalledWith('Wands_fire');
  });

  // The other axis must be untouched: armour still reads as attributes plus a defence hint.
  it('leaves the attribute split alone', () => {
    render(<BaseSelect bases={ARMOUR} value="Body_Armours_str" onChange={vi.fn()} />);
    const menu = variantMenu();
    expect(within(menu).getByRole('option', { name: 'Str · Armour' })).toBeInTheDocument();
    expect(within(menu).getByRole('option', { name: 'Str/Int · Armour + ES' })).toBeInTheDocument();
    expect(within(menu).queryByRole('option', { name: /only/ })).toBeNull();
  });

  it('shows no variant menu for a category with one base', () => {
    render(<BaseSelect bases={[base('Amulets', 'Amulets')]} value="Amulets" onChange={vi.fn()} />);
    expect(screen.queryByRole('combobox', { name: /Variant/i })).toBeNull();
  });
});
