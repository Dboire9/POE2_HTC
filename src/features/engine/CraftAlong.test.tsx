import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import type { ItemBase, Mod, PatchData } from '../../../packages/engine/src/index.ts';
import { loadFrozenPrices } from '../../../packages/optimizer/src/frozenPrices.ts';
import { markovFromItem } from '../../../packages/optimizer/src/markovFromItem.ts';
import type { Prices } from '../../../packages/optimizer/src/cost.ts';
import { runSolve } from '../../lib/solve';
import { stepFor, type EngineMarkovResult } from '../../lib/engine';
import { mapMarkov } from '../../lib/engineMap';
import { readSession } from '../../lib/craftAlong';
import { START_OVER, outcomeWords } from '../../lib/stateWords';
import CraftAlong from './CraftAlong';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

/** The button whose own words are exactly `label` (the odds sit beside them in the same button). */
const button = (label: string): HTMLElement => {
  const hit = screen.getAllByRole('button').find((b) => (b.querySelector('span')?.textContent ?? b.textContent) === label);
  if (!hit) throw new Error(`no button reads "${label}"`);
  return hit;
};

// The real data as the browser gets it, and the frozen sheet: every number below is compared with the
// same solve's own, so only the plan's shape matters.
const data = loadShippedPatch('data/patches/0.5.0');
const engine = { data, prices: loadFrozenPrices() };
const anyTier = (modId: string) => ({ modId, tierDisplay: data.mods.get(modId)!.tiers.length });
const solved = runSolve(engine, {
  kind: 'lab', from: { baseId: 'Wands', level: 82 },
  targets: [anyTier('Wands/WeaponSpellDamage'), anyTier('Wands/IncreasedCastSpeed')],
});
const markov = (solved as { markov: EngineMarkovResult }).markov;

describe('Craft along on a real craft', () => {
  it('has the plan for every state to follow', () => {
    expect(markov.bound).toBe('exact');
    expect(markov.routes).toBeDefined();
  });

  it('walks the plan to the finish one picked outcome at a time, counting each move at its price', () => {
    render(<CraftAlong engine={engine} markov={markov} tab="lab" sig="craft" rates={undefined} plain="A white base" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.getByText('A white base')).toBeInTheDocument();
    const t = markov.routes!;
    let key: string = t.keys[t.restartIdx]!;
    let spent = 0;
    for (let move = 0; move < 60; move++) {
      const step = stepFor(engine, markov, key)!;
      const here = step.nodes[0]!;
      if (here.isGoal) break;
      // The outcome closest to done — a lucky player, so the walk ends.
      const byKey = new Map(step.nodes.map((n) => [n.key, n]));
      const worth = (to: string): number => byKey.get(to)?.expectedCost ?? here.expectedCost;
      const best = [...step.edges].sort((a, b) => worth(a.to) - worth(b.to))[0]!;
      fireEvent.click(button(here.action === START_OVER ? 'Done — I have a new base' : outcomeWords(here, byKey.get(best.to), best)));
      spent += here.actionCost ?? 0;
      key = best.to;
    }
    expect(screen.getByText(/Finished\./)).toBeInTheDocument();
    const saved = readSession('lab', 'craft')!;
    expect(saved.key).toBe(key);
    expect(saved.spent).toBeCloseTo(spent, 9);
    expect(saved.history.length).toBeGreaterThan(0);
  });

  it('takes a move back on Undo, and picks up where it was after the panel is closed', () => {
    const view = () => render(<CraftAlong engine={engine} markov={markov} tab="lab" sig="craft" rates={undefined} plain="A white base" />);
    view();
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    const t = markov.routes!;
    const first = stepFor(engine, markov, t.keys[t.restartIdx]!)!;
    const here = first.nodes[0]!;
    const e = first.edges[0]!;
    fireEvent.click(button(outcomeWords(here, first.nodes.find((n) => n.key === e.to), e)));
    expect(readSession('lab', 'craft')?.history).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(readSession('lab', 'craft')).toMatchObject({ key: t.keys[t.restartIdx], spent: 0, history: [] });

    fireEvent.click(button(outcomeWords(here, first.nodes.find((n) => n.key === e.to), e)));
    cleanup();
    view();
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.getByText(/Picked up where you left off/)).toBeInTheDocument();
    // Another craft does not resume this one's place.
    cleanup();
    render(<CraftAlong engine={engine} markov={markov} tab="lab" sig="another craft" rates={undefined} plain="A white base" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.queryByText(/Picked up where you left off/)).toBeNull();
    expect(screen.getByText('A white base')).toBeInTheDocument();
  });
});

/**
 * A solve that stopped early answers as a ceiling, and its plan — checked to finish (markovFromItem) —
 * can be followed too, as long as the panel says it is not proven cheapest and its figures carry "≤".
 */
describe('Craft along on a ceiling', () => {
  const wands = data.bases.get('Wands')!;
  const targets = [
    { modId: 'Wands/WeaponSpellDamage', minTierIndex: 0 }, { modId: 'Wands/IncreasedCastSpeed', minTierIndex: 0 },
  ];
  const ceiling = markovFromItem(data, engine.prices, { base: wands, level: 82, rarity: 'normal', prefixes: [], suffixes: [] },
    targets, { restartCost: 0, solver: 'policy', keepRoutes: true, maxRounds: 1 });

  it('follows the plan, saying it is not proven cheapest and that its costs are ceilings', () => {
    expect(ceiling.bound).toBe('upper');
    render(<CraftAlong engine={engine} markov={mapMarkov(data, ceiling)} tab="lab" sig="ceiling" rates={undefined} plain="A white base" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.getByText(/stopped before proving this plan the cheapest/)).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toMatch(/still to spend ≤ /);
  });

  it('names the plan without Desecration when that is what answered', () => {
    render(<CraftAlong engine={engine} markov={{ ...mapMarkov(data, ceiling), withoutBones: true }} tab="lab" sig="ceiling" rates={undefined} plain="A white base" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.getByText(/without Desecration/)).toBeInTheDocument();
  });

  it('says nothing of the kind on an exact plan', () => {
    render(<CraftAlong engine={engine} markov={markov} tab="lab" sig="craft" rates={undefined} plain="A white base" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    expect(screen.queryByText(/proving this plan|without Desecration/)).toBeNull();
    expect(screen.getByRole('status').textContent).not.toMatch(/≤/);
  });
});

/**
 * Lost your place: paste the item from the game and Craft along picks up from it (markovLocate.ts).
 * The move it shows is the plan's move for that item, exactly as a click would have reached it.
 */
describe('Craft along picks up from a pasted item', () => {
  const MAGIC_WAND = `Item Class: Wands
Rarity: Magic
Runic Acrid Wand
--------
Item Level: 82
--------
110% increased Spell Damage`;

  async function pasteInto(text: string) {
    const user = userEvent.setup();
    render(<CraftAlong engine={engine} markov={markov} tab="lab" sig="craft" rates={undefined} plain="A white base" />);
    await user.click(screen.getByRole('button', { name: /Craft along/ }));
    await user.click(screen.getByRole('button', { name: /Paste your item/i }));
    await user.click(screen.getByLabelText(/Paste your item’s text/i));
    await user.paste(text);
    return user;
  }

  it('moves to the pasted item and shows the plan\'s move for it, spend untouched', async () => {
    const user = await pasteInto(MAGIC_WAND);
    await user.click(screen.getByRole('button', { name: 'This is my item now' }));
    const saved = readSession('lab', 'craft')!;
    const t = markov.routes!;
    expect(saved.key).not.toBe(t.keys[t.restartIdx]);
    expect(saved).toMatchObject({ spent: 0 });
    const here = stepFor(engine, markov, saved.key)!.nodes[0]!;
    // Spell Damage is position 0 and present; the item is Magic (rarity code 1); nothing else on it.
    const [present, blocked, jp, js, , rarity] = saved.key.split(':').map(Number);
    expect([present! & 1, blocked, jp, js, rarity]).toEqual([1, 0, 0, 0, 1]);
    expect(screen.getByText(/Moved to the item you pasted/)).toBeInTheDocument();
    // A paste is not a move: the count stays at what was clicked.
    expect(screen.getAllByRole('status').map((n) => n.textContent).join(' ')).toMatch(/over 0 moves/);
    if (here.action) expect(screen.getAllByText(here.action).length).toBeGreaterThan(0);
    // Undo goes back to where it was.
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(readSession('lab', 'craft')!.key).toBe(t.keys[t.restartIdx]);
  });

  it('says why it cannot place another kind of item, and stays where it was', async () => {
    const user = await pasteInto(`Item Class: Rings
Rarity: Magic
Healthy Ruby Ring
--------
Item Level: 82
--------
+110 to maximum Life`);
    await user.click(screen.getByRole('button', { name: 'This is my item now' }));
    expect(screen.getByText(/different kind of base/)).toBeInTheDocument();
    const t = markov.routes!;
    expect(readSession('lab', 'craft')!.key).toBe(t.keys[t.restartIdx]);
  });
});

/**
 * A Desecration, where the player chooses: the hand-computed craft of markovEssenceDesecrate.test.ts —
 * a Rare with NP1 fractured, wanting the desecrated DP1, an Omen of Abyssal Echoes at 0.1. Kept: the
 * target whenever it is offered, and when all three are the junk DS1, the plan throws them back once.
 */
describe('Craft along on a Desecration', () => {
  const mk = (id: string, type: 'prefix' | 'suffix', family: string, source: Mod['source']): Mod => ({
    id, source, type, family, tags: source === 'desecrated' ? ['kurgal_mod'] : [], text: id,
    tiers: [{ name: 't1', ilvl: 1, weight: source === 'normal' ? 100 : 1, ranges: [] }],
  });
  const base: ItemBase = {
    id: 'S', name: 'S', category: 'Wands',
    pools: {
      normal: { prefixes: ['NP1'], suffixes: [] },
      desecrated: { prefixes: ['DP1'], suffixes: ['DS1'] },
      essence: { prefixes: [], suffixes: [] },
    },
  };
  const synthetic: PatchData = {
    patch: 't',
    mods: new Map([
      ['NP1', mk('NP1', 'prefix', 'Fp1', 'normal')],
      ['DP1', mk('DP1', 'prefix', 'FdP', 'desecrated')],
      ['DS1', mk('DS1', 'suffix', 'FdS', 'desecrated')],
    ]),
    bases: new Map([['S', base]]),
  };
  const prices: Prices = { currency: { exalt: 1, annul: 1, chaos: 99, desecrate: 1 }, omens: { OmenofAbyssalEchoes: 0.1 } };
  const res = markovFromItem(synthetic, prices,
    { base, level: 100, rarity: 'rare', prefixes: [{ modId: 'NP1', tierName: 't1', fractured: true }], suffixes: [] },
    [{ modId: 'NP1' }, { modId: 'DP1' }], { tolerance: 1e-12, keepRoutes: true });

  it('lists what to keep best first, with the line to reroll below', () => {
    render(<CraftAlong engine={{ data: synthetic, prices }} markov={mapMarkov(synthetic, res)} tab="item" sig="bone" rates={undefined} plain="x" />);
    fireEvent.click(screen.getByRole('button', { name: /Craft along/ }));
    const panel = screen.getByRole('region', { name: 'Craft along' }).textContent;
    expect(panel).toContain('It offers three modifiers and you keep one');
    const keep = panel.indexOf('DP1 lands — finished');
    const line = panel.indexOf('All three below this line?');
    const junk = panel.indexOf('A suffix you did not ask for lands');
    expect(keep).toBeGreaterThan(-1);
    expect(line).toBeGreaterThan(keep);
    expect(junk).toBeGreaterThan(line);
  });
});
