import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The Starter chip on an empty Plan tab, end to end on the REAL data and the real solve: a recipe loads
// at the typed item level and solves on the found sheet, and the result is counts, never a cost. Only
// the engine's load is stubbed (no fetch in jsdom) and `runSolve` is watched, so every request the Lab
// sends can be read back. Written against `STARTER_RECIPES`, so it holds as recipes change.

const shipped = vi.hoisted((): { eng: unknown } => ({ eng: null }));

vi.mock('../../lib/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/engine')>();
  const { loadShippedPatch } = await import('../../../packages/engine/src/loadPatch.ts');
  const { loadFrozenPrices } = await import('../../../packages/optimizer/src/frozenPrices.ts');
  shipped.eng = { data: loadShippedPatch('data/patches/0.5.0'), prices: loadFrozenPrices() };
  return { ...actual, loadEngine: () => Promise.resolve(shipped.eng) };
});
vi.mock('../../lib/solve', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/solve')>();
  return { ...actual, runSolve: vi.fn(actual.runSolve) };
});

import EngineLab from './EngineLab';
import { runSolve } from '../../lib/solve';
import { stepFor, type Engine } from '../../lib/engine';
import { STARTER_RECIPES, targetsAt, type StarterRecipe } from '../../lib/starterRecipes';
import { EXAMPLE_CRAFTS } from '../../lib/exampleCrafts';
import { STOP_LINE } from '../../lib/foundUses';
import { holdsEverySlot } from '../../lib/craftAlong';

const solveSpy = vi.mocked(runSolve);
/** The Lab requests sent so far, oldest first. */
const labRequests = () => solveSpy.mock.calls.map((c) => c[1]).filter((r) => r.kind === 'lab');
const engine = (): Engine => shipped.eng as Engine;

beforeEach(() => { solveSpy.mockClear(); });

async function loaded() {
  render(<EngineLab />);
  await screen.findByPlaceholderText(/Search modifiers to add as targets/i);
}
const chips = () => within(screen.getByRole('group', { name: 'Crafts to try' }));
const levelBox = () => screen.getByRole('spinbutton', { name: 'Item level of your base' });
/** A recipe's button, by its name (the name is the button's first words). */
const recipeButton = (r: StarterRecipe) => screen.getByRole('button', { name: new RegExp(`^${r.name}\\b`) });
async function typeLevel(user: ReturnType<typeof userEvent.setup>, level: number) {
  await user.clear(levelBox());
  await user.type(levelBox(), String(level));
}
const easyBow = STARTER_RECIPES.find((r) => r.weapon === 'Bow' && r.grade === 'easy')!;
const fastBow = STARTER_RECIPES.find((r) => r.weapon === 'Bow' && r.grade === 'better')!;

/** Everything a found-basis result must not draw: a cost in a currency, or a part that only means something on a market. */
function expectNoMarket() {
  const text = document.body.textContent ?? '';
  // formatIn's three renderings ("12.3 ex", "4 chaos", "1.2 div"), and the exact-figure title's words.
  expect(text).not.toMatch(/\d\s?(ex|chaos|div)\b/);
  expect(document.body.innerHTML).not.toMatch(/exalt-equivalents/);
  for (const gone of [
    'True expected cost', 'Play it out', 'What a craft can cost', 'Or buy it already made',
    'Start from an item you buy instead', 'Step-by-step routes', 'Your options — likeliest first',
    'Optimal policy, as text', 'Search on trade',
  ]) expect(screen.queryByText(new RegExp(gone, 'i')), gone).toBeNull();
  expect(screen.queryByRole('img', { name: 'Optimal crafting policy graph' })).toBeNull();
}

describe('the Starter chip', () => {
  it('is where the card opens, before the build types', async () => {
    await loaded();
    expect(chips().getAllByRole('button')[0]).toHaveTextContent('Starter');
    expect(chips().getByRole('button', { name: 'Starter' })).toHaveAttribute('aria-pressed', 'true');
    for (const r of STARTER_RECIPES) expect(recipeButton(r)).toBeInTheDocument();
    // No build-type craft is drawn under it (no recipe shares an example's name: starterRecipes.test.ts).
    for (const e of EXAMPLE_CRAFTS) expect(screen.queryByText(e.name), e.name).toBeNull();
    // The rule for when the weapon is done, said once for the panel.
    expect(screen.getAllByText(STOP_LINE)).toHaveLength(1);
  });

  it('opens on a level every recipe takes, without moving the Lab’s own (82 by default)', async () => {
    await loaded();
    const first = Math.max(...STARTER_RECIPES.map((r) => r.levels.from));
    expect(levelBox()).toHaveValue(first);
    for (const r of STARTER_RECIPES) expect(recipeButton(r)).toBeEnabled();
    expect(screen.getByRole('spinbutton', { name: /^Item level$/i })).toHaveValue(82);
  });

  it('offers a recipe only inside its levels, and says why not otherwise', async () => {
    const user = userEvent.setup();
    await loaded();
    const last = Math.max(...STARTER_RECIPES.map((r) => r.levels.to));
    // Below some, inside all the attack recipes, above some, and above every one.
    for (const level of [5, 10, 58, 60, last + 1]) {
      await typeLevel(user, level);
      for (const r of STARTER_RECIPES) {
        const b = recipeButton(r);
        if (level < r.levels.from) {
          expect(b, `${r.name} at ${level}`).toBeDisabled();
          expect(b).toHaveTextContent(`From item level ${r.levels.from}`);
        } else if (level > r.levels.to) {
          expect(b, `${r.name} at ${level}`).toBeDisabled();
          expect(b).toHaveTextContent(`Up to item level ${r.levels.to}`);
        } else {
          expect(targetsAt(engine().data, r, level)).not.toBeNull(); // the premise
          expect(b, `${r.name} at ${level}`).toBeEnabled();
          expect(b).not.toHaveTextContent(/item level \d/);
        }
      }
      const above = screen.queryByText(/No starter recipe goes above item level/);
      if (level > last) expect(above).toHaveTextContent(`No starter recipe goes above item level ${last}. For a base this high, pick a build type above.`);
      else expect(above).toBeNull();
    }
    // The Lab's own level follows what was typed: it is the same field.
    expect(screen.getByRole('spinbutton', { name: /^Item level$/i })).toHaveValue(last + 1);
  });

  it('lists each weapon’s easy recipe first, tagged only where the weapon has both', async () => {
    await loaded();
    const order = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    const at = (r: StarterRecipe) => order.findIndex((t) => t.startsWith(r.name));
    for (const r of STARTER_RECIPES) {
      const siblings = STARTER_RECIPES.filter((x) => x.weapon === r.weapon);
      const tag = within(recipeButton(r)).queryByText(/^(Easy|Better)$/);
      if (siblings.length > 1) {
        expect(tag, r.name).toHaveTextContent(r.grade === 'easy' ? 'Easy' : 'Better');
        const easy = siblings.find((x) => x.grade === 'easy')!;
        const better = siblings.find((x) => x.grade === 'better')!;
        expect(at(easy), r.weapon).toBeLessThan(at(better));
      } else {
        expect(tag, r.name).toBeNull();
      }
    }
  });

  it('says how many bases each uses, from the recipe’s measured range, and every modifier in words', async () => {
    await loaded();
    for (const r of STARTER_RECIPES) {
      const b = recipeButton(r);
      expect(b).toHaveTextContent(`Uses ${r.bases.from}–${r.bases.to} bases on average`);
      for (const s of r.slots) {
        if (s.modIds.length === 1) expect(b).toHaveTextContent(s.words);
        else expect(b).toHaveTextContent(new RegExp(`[Aa]ny one of: ${s.words.split(' or ').map((w) => w.replace(/[+]/g, '\\+')).join(' · ')}`));
      }
    }
  });
});

describe('a starter recipe, loaded', () => {
  it('loads its targets at the typed level, alternatives in one slot, and solves on the found sheet', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await waitFor(() => expect(labRequests()).toHaveLength(1));
    const req = labRequests()[0]!;
    if (req.kind !== 'lab') throw new Error('not a lab request');
    expect(req.priceBasis).toBe('found');
    expect(req.from).toEqual({ baseId: easyBow.baseId, level: 16 });
    const at = targetsAt(engine().data, easyBow, 16)!;
    const want = at.targets;
    expect(req.targets).toEqual(want);
    expect(want.filter((t) => t.slot !== undefined).length).toBe(easyBow.slots[1]!.modIds.length); // the premise
    // The rest of the item is left free, and the solve is told so: "the others can be anything".
    expect(req.spare).toEqual(at.spare);
    expect(at.spare.prefixes + at.spare.suffixes).toBeGreaterThan(0); // the premise
    // The targets card holds the recipe — one slot of its own, one of alternatives — and the free slots.
    const free = at.spare.prefixes + at.spare.suffixes;
    expect(await screen.findByText(new RegExp(`Target item \\(${2 + free} slots, ${want.length} mods named\\)`))).toBeInTheDocument();
    expect(screen.getByText(/Any one of/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: 'Stop leaving a prefix free' })).toHaveLength(at.spare.prefixes);
    expect(screen.queryAllByRole('button', { name: 'Stop leaving a suffix free' })).toHaveLength(at.spare.suffixes);
    expect(screen.getByRole('spinbutton', { name: /^Item level$/i })).toHaveValue(16);
    // The craft is loaded, so the card of crafts to try has given way.
    expect(screen.queryByText('Or try one')).toBeNull();
  });

  it('reads as what you will use — counts, bases, the note and when it is done — with no cost anywhere', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    const list = await screen.findByRole('list', { name: 'What you’ll use' });
    expect(screen.getByRole('heading', { name: 'What you’ll use' })).toBeInTheDocument();
    expect(list).toHaveTextContent(/Orb of Transmutation\s*about \d+/);
    expect(list).toHaveTextContent(/Lesser Essence of Abrasion/);
    expect(list).toHaveTextContent(/Bases, counting the one you start with\s*about \d+/);
    expect(screen.getByText(/These are averages over many crafts/)).toBeInTheDocument();
    expect(screen.getByText(/picked by how often a new player finds each orb and Essence/)).toBeInTheDocument();
    expect(screen.getByText(STOP_LINE)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'How this craft is planned' })).toBeInTheDocument();
    expectNoMarket();
  });

  it('flips to the trade market and back, solving the same craft each time', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    const sw = () => within(screen.getByRole('group', { name: 'How this craft is planned' }));
    expect(sw().getByRole('button', { name: 'Counted in what drops' })).toHaveAttribute('aria-pressed', 'true');

    // Budget and Base cost are in exalts, which a craft counted in what drops does not read: not shown.
    const exaltFields = () => [/^Budget/, /^Base cost/].map((name) => screen.queryByRole('spinbutton', { name }));
    expect(exaltFields()).toEqual([null, null]);

    await user.click(sw().getByRole('button', { name: 'Priced on the trade market' }));
    expect(await screen.findByText('True expected cost')).toBeInTheDocument();
    for (const f of exaltFields()) expect(f).toBeInTheDocument();
    const [found, trade] = labRequests();
    if (found?.kind !== 'lab' || trade?.kind !== 'lab') throw new Error('not lab requests');
    expect(trade.priceBasis).toBeUndefined();
    expect(trade.targets).toEqual(found.targets);
    expect(trade.from).toEqual(found.from);
    expect(trade.spare).toEqual(found.spare);
    expect(sw().getByRole('button', { name: 'Priced on the trade market' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(sw().getByRole('button', { name: 'Counted in what drops' }));
    await screen.findByRole('list', { name: 'What you’ll use' });
    const back = labRequests()[2]!;
    expect(back.kind === 'lab' && back.priceBasis).toBe('found');
    expectNoMarket();
  });

  it('keeps the sheet when the same craft is solved again, and drops it for a build-type craft', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    await waitFor(() => expect(labRequests()).toHaveLength(2));
    expect(labRequests()[1]!.kind === 'lab' && labRequests()[1]!.priceBasis).toBe('found');
    const [first, again] = labRequests();
    expect(again!.kind === 'lab' && again!.spare).toEqual(first!.kind === 'lab' && first!.spare);

    await user.click(screen.getByRole('button', { name: /^Reset$/ }));
    await user.click(await chips().findByRole('button', { name: 'Caster' }));
    const wand = EXAMPLE_CRAFTS.find((e) => e.category === 'caster')!;
    await user.click(screen.getByRole('button', { name: new RegExp(wand.name) }));
    await waitFor(() => expect(labRequests()).toHaveLength(3));
    const example = labRequests()[2]!;
    expect(example.kind === 'lab' && example.priceBasis).toBeUndefined();
    expect(example.kind === 'lab' && example.spare).toBeUndefined();
    expect(screen.queryByRole('group', { name: 'How this craft is planned' })).toBeNull();
  }, 60_000);

  it('drops it for a craft built by hand after Reset', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    await user.click(screen.getByRole('button', { name: /^Reset$/ }));
    await user.click(screen.getAllByRole('button', { name: /^Add / })[0]!);
    await user.click(screen.getByRole('button', { name: /Find plans/i }));
    await waitFor(() => expect(labRequests()).toHaveLength(2));
    const byHand = labRequests()[1]!;
    expect(byHand.kind === 'lab' && byHand.priceBasis).toBeUndefined();
    // Reset clears the recipe's free slots with the rest of the target.
    expect(byHand.kind === 'lab' && byHand.spare).toBeUndefined();
  }, 60_000);

  it('follows along with no cost, and calls the weapon done at the finish', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    await user.click(screen.getByRole('button', { name: /^Craft along/ }));
    const panel = () => screen.getByRole('region', { name: 'Craft along' });
    expect(panel()).toHaveTextContent('0 moves so far.');
    expect(panel()).not.toHaveTextContent(/Spent so far|still to spend/);
    // The lucky Transmute, then the Essence for the other slot: the item has both, and is done.
    await user.click(within(panel()).getByRole('button', { name: /^Adds # to # Physical Damage lands/ }));
    expect(panel()).toHaveTextContent('1 move so far.');
    const finish = within(panel()).getAllByRole('button').find((b) => /finished/i.test(b.textContent ?? ''))!;
    await user.click(finish);
    expect(panel()).toHaveTextContent('Your weapon is done. It has the modifiers you asked for; the others can be anything.');
    // The finish is drawn as one goal named after one member of each slot, so it is not named at all.
    expect(panel()).not.toHaveTextContent(/Your item:/);
    expectNoMarket();
  });

  it('calls a pasted weapon done when it has the modifiers, whatever else rolled on it', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    await user.click(screen.getByRole('button', { name: /^Craft along/ }));
    await user.click(screen.getByRole('button', { name: /Paste your item/i }));
    await user.click(screen.getByLabelText(/Paste your item’s text/i));
    // Physical and Cold Damage at tiers item level 16 rolls, and an Attack Speed suffix nobody asked for.
    await user.paste(`Item Class: Bows
Rarity: Rare
Grim Song
Crude Bow
--------
Item Level: 16
--------
Adds 2 to 4 Physical Damage
Adds 2 to 3 Cold Damage
6% increased Attack Speed`);
    await user.click(screen.getByRole('button', { name: 'This is my item now' }));
    const panel = screen.getByRole('region', { name: 'Craft along' });
    // With the rest of the item free this is the plan's own finish (drawn as one goal, so not named).
    expect(panel).toHaveTextContent('Your weapon is done.');
    expect(panel).not.toHaveTextContent(/Start over with a new base|bin this item|Your item:/);
  });

  /** Paste `text` into an open Craft along and apply it. */
  async function paste(user: ReturnType<typeof userEvent.setup>, text: string) {
    await user.click(screen.getByRole('button', { name: /^Craft along/ }));
    await user.click(screen.getByRole('button', { name: /Paste your item/i }));
    await user.click(screen.getByLabelText(/Paste your item’s text/i));
    await user.paste(text);
    await user.click(screen.getByRole('button', { name: 'This is my item now' }));
    return screen.getByRole('region', { name: 'Craft along' });
  }

  it('names a pasted Cold Damage as the class it stands for, not as Fire', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 16);
    await user.click(recipeButton(easyBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    const panel = await paste(user, `Item Class: Bows
Rarity: Magic
Crude Bow of Frost
--------
Item Level: 16
--------
Adds 2 to 3 Cold Damage`);
    expect(panel).toHaveTextContent('Your item: Magic · Adds # to # Fire Damage or Adds # to # Cold Damage');
    expect(panel).not.toHaveTextContent('Your weapon is done.');
  });

  // A Magic weapon holding both modifiers of a better recipe is done by the card's sentence, though the
  // solve's goal is a Rare and its plan would go on (`holdsEverySlot`).
  it('calls a pasted Magic weapon done when it holds both modifiers', async () => {
    const user = userEvent.setup();
    await loaded();
    await typeLevel(user, 30);
    await user.click(recipeButton(fastBow));
    await screen.findByRole('list', { name: 'What you’ll use' });
    const panel = await paste(user, `Item Class: Bows
Rarity: Magic
Crude Bow of Skill
--------
Item Level: 30
--------
Adds 5 to 9 Physical Damage
12% increased Attack Speed`);
    expect(panel).toHaveTextContent('Your item: Magic · Adds # to # Physical Damage + #% increased Attack Speed');
    expect(panel).toHaveTextContent('Your weapon is done. It has the modifiers you asked for; the others can be anything.');
  });
});

describe('holdsEverySlot', () => {
  const solve = (r: StarterRecipe, level: number) => {
    const at = targetsAt(engine().data, r, level)!;
    const res = runSolve(engine(), { kind: 'lab', priceBasis: 'found', from: { baseId: r.baseId, level }, targets: at.targets, spare: at.spare });
    if (res.kind !== 'lab') throw new Error('not lab');
    return res.markov;
  };

  it('is every goal of the plan, and not the white base', () => {
    const t = solve(easyBow, 16).routes!;
    t.keys.forEach((k, i) => { if (t.goal[i] === 1) expect(holdsEverySlot(t, k), k).toBe(true); });
    expect(holdsEverySlot(t, t.keys[t.restartIdx]!)).toBe(false);
  });

  it('adds to the goal only a Magic weapon holding both modifiers, which the plan would go on from', () => {
    const m = solve(fastBow, 30);
    const t = m.routes!;
    const extra = t.keys.filter((k, i) => t.goal[i] !== 1 && holdsEverySlot(t, k));
    expect(extra.length).toBeGreaterThan(0);
    for (const k of extra) {
      expect(k.split(':')[5], k).toBe('1'); // rarity code 1: Magic
      expect(stepFor(engine(), m, k)!.nodes[0]!.action, k).toBeDefined();
    }
  });
});
