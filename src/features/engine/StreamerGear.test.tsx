import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StreamerGear from './StreamerGear';
import { loadPatch } from '../../../packages/engine/src/index.ts';
import type { StreamerFile } from '../../lib/streamerGear';

const data = loadPatch('data/patches/0.5.0');
// The FROZEN 2026-09-09 snapshot, not the shipped file: these tests click Kraken Crest and the Aldur
// staff by name, and the shipped file is rewritten whenever the gear job runs.
const file = JSON.parse(readFileSync('src/lib/__fixtures__/streamers-2026-09-09.json', 'utf8')) as StreamerFile;

// The panel fetches on first open; the reading itself stays REAL, because what this suite is about is
// whether the panel prints what the reader worked out.
vi.mock('../../lib/streamerGear', async () => ({
  ...(await vi.importActual<typeof import('../../lib/streamerGear')>('../../lib/streamerGear')),
  loadStreamers: vi.fn(),
}));
const { loadStreamers } = await import('../../lib/streamerGear');

beforeEach(() => { vi.mocked(loadStreamers).mockResolvedValue(file); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

/** Render the tab with the three routes stubbed, and wait for the gear to arrive. */
async function open() {
  const user = userEvent.setup();
  const routes = { own: vi.fn(), scratch: vi.fn(), aim: vi.fn() };
  render(<StreamerGear data={data} routes={routes} />);
  await screen.findByText(new RegExp(file.characters[0]!.character));
  return { user, routes };
}

describe('the streamer gear tab', () => {
  /** The gear file is its own request, made by this tab — the rest of the app never downloads it. */
  it('fetches the gear file when the tab is shown, and lists the character’s items', async () => {
    await open();
    expect(loadStreamers).toHaveBeenCalled();
    for (const it of file.characters[0]!.items) {
      expect(screen.getByRole('button', { name: new RegExp(it.name) })).toBeInTheDocument();
    }
  });

  /** It is a snapshot from a job, not a live read, and it may never imply otherwise. */
  it('says when the gear was read', async () => {
    await open();
    expect(screen.getByText(new RegExp(file.updated))).toBeInTheDocument();
  });

  it('shows the modifiers of the item you pick', async () => {
    const { user } = await open();
    const helm = file.characters[0]!.items.find((i) => i.slot === 'Helm')!;
    await user.click(screen.getByRole('button', { name: new RegExp(helm.name) }));
    const text = data.mods.get(helm.mods[0]!.modId)!.text!;
    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  /**
   * The panel's one real promise. The staff carries two modifiers of one family; the second cannot go
   * on the item, and a player who is not TOLD would plan a six-mod craft against a five-mod item.
   */
  it('prints the reason a modifier was left off, and the count it actually loaded', async () => {
    const { user } = await open();
    const staff = file.characters[0]!.items.find((i) => i.familyConflict.length > 0)!;
    await user.click(screen.getByRole('button', { name: new RegExp(staff.name) }));

    expect(await screen.findByText(/two modifiers of the/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${staff.mods.length - 1} of ${staff.mods.length} modifiers`)))
      .toBeInTheDocument();
  });

  it('claims a complete import only when nothing was left off', async () => {
    const { user } = await open();
    const helm = file.characters[0]!.items.find((i) => i.slot === 'Helm')!;
    await user.click(screen.getByRole('button', { name: new RegExp(helm.name) }));
    expect(await screen.findByText(new RegExp(`All ${helm.mods.length} modifiers`))).toBeInTheDocument();
  });

  /**
   * Three routes, three questions — and each has to reach its own one. Wiring two buttons to the same
   * handler is the mistake that looks right on screen and silently answers the wrong question.
   */
  it.each([
    ['Craft this from scratch', 'scratch'],
    ['I have some of these', 'aim'],
    ['I own this one', 'own'],
  ] as const)('sends the item to the %s route, and only on that button', async (label, key) => {
    const { user, routes } = await open();
    const helm = file.characters[0]!.items.find((i) => i.slot === 'Helm')!;
    await user.click(screen.getByRole('button', { name: new RegExp(helm.name) }));

    // Reading is free; overwriting a craft the player has set up is not.
    expect(routes.own).not.toHaveBeenCalled();
    expect(routes.scratch).not.toHaveBeenCalled();
    expect(routes.aim).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: new RegExp(label) }));
    await waitFor(() => { expect(routes[key]).toHaveBeenCalledTimes(1); });

    for (const other of ['own', 'scratch', 'aim'] as const) {
      if (other !== key) expect(routes[other], other).not.toHaveBeenCalled();
    }
    const sent = vi.mocked(routes[key]).mock.calls[0]![0] as { baseId: string; level: number };
    expect(sent.baseId).toBe(helm.baseId);
    expect(sent.level).toBe(helm.level);
  });

  /** Each button says where it lands, because three arrows and no destinations loses someone's craft. */
  it('says which tab each route goes to', async () => {
    const { user } = await open();
    const helm = file.characters[0]!.items.find((i) => i.slot === 'Helm')!;
    await user.click(screen.getByRole('button', { name: new RegExp(helm.name) }));
    expect(await screen.findByText(/plans it on a white/)).toBeInTheDocument();
    expect(screen.getByText(/replacing what is there/)).toBeInTheDocument();
    // Spelled out in full, because JSX drops the space between an element and text across a line
    // break and this shipped reading "I have an itemand leaves your own item alone".
    expect(screen.getByText(/makes it the target on/).textContent)
      .toMatch(/I have an item and leaves your own item alone/);
  });

  it('says so, rather than hanging, when the gear file cannot be fetched', async () => {
    vi.mocked(loadStreamers).mockRejectedValue(new Error('offline'));
    render(<StreamerGear data={data} routes={{ own: vi.fn(), scratch: vi.fn(), aim: vi.fn() }} />);
    expect(await screen.findByText(/Couldn’t load the gear file/)).toBeInTheDocument();
  });
});


/**
 * The staff the rune made. `I own this one` gets what the planner can HOLD; the two goal routes get
 * what you would CRAFT, which is one modifier larger and 2.9x dearer. Sending the held version to a
 * planner quotes a cheaper craft for an item nobody owns.
 */
describe('an item a rune made', () => {
  const staffOf = () => file.characters[0]!.items.find((i) => i.familyConflict.length > 0)!;

  it('sends the GOAL to the two craft routes and the HELD item to “I own this one”', async () => {
    const { user, routes } = await open();
    const staff = staffOf();
    await user.click(screen.getByRole('button', { name: new RegExp(staff.name) }));

    await user.click(screen.getByRole('button', { name: /Craft this from scratch/ }));
    await user.click(screen.getByRole('button', { name: /I have some of these/ }));
    await user.click(screen.getByRole('button', { name: /I own this one/ }));

    const count = (m: ReturnType<typeof vi.fn>) => {
      const it = vi.mocked(m).mock.calls[0]![0] as { prefixes: unknown[]; suffixes: unknown[] };
      return it.prefixes.length + it.suffixes.length;
    };
    expect(count(routes.scratch), 'scratch aims at the whole item').toBe(staff.mods.length);
    expect(count(routes.aim), 'aim targets the whole item').toBe(staff.mods.length);
    expect(count(routes.own), 'own loads only what can be held').toBe(staff.mods.length - 1);
  });

  it('says a rune finishes the craft, and which one', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: new RegExp(staffOf().name) }));
    const note = (await screen.findByText(/This one was made with a rune/)).closest('p')!;
    // Named twice on purpose — once as the step that finishes the craft, once in the caveat about
    // what it converts — so this asserts the paragraph, not a unique node.
    expect(note.textContent).toMatch(/passion-of-aldur/);
    expect(note.textContent).toMatch(/cross-family modifiers/);
  });
});

/**
 * Whole items are held to the tab's rule too: nothing a character wears is left off without saying so.
 *
 * Found by adding four streamers: Steelmage showed 4 items and was wearing 6 more that silently did
 * not appear — 3 Uniques, and 3 Rares on bases the shipped rows did not name (Sekhema Sandals, Ancestral
 * Tiara, a Skullcrusher Quarterstaff — all read since the pipeline learnt base-type twins). The panel
 * promised every omission was named, and whole items were the one kind it never named.
 */
describe('items the character wears that the tab does not show', () => {
  const withSkips = (skipped: { name: string; slot: string; rarity: string; reason: string }[]) => ({
    ...file,
    characters: [{ ...file.characters[0]!, skipped }],
  });

  it('counts the Uniques and names each unreadable Rare with its reason', async () => {
    vi.mocked(loadStreamers).mockResolvedValue(withSkips([
      { name: 'Mageblood', slot: 'Belt', rarity: 'Unique', reason: 'Unique — only a Rare is craftable here' },
      { name: 'Forgotten Warden', slot: 'Offhand', rarity: 'Unique', reason: 'Unique — only a Rare is craftable here' },
      { name: 'Doom Shell', slot: 'BodyArmour', rarity: 'Rare', reason: '“Grand Regalia” is not a base in the 0.5.0 data' },
    ]));
    await open();
    const note = screen.getByText(/Not shown:/).closest('div')!;
    expect(note.textContent).toMatch(/2 Uniques — a Unique can’t be crafted/);
    expect(note.textContent).toMatch(/1 Rare this app can’t read yet/);
    expect(note.textContent).toMatch(/Doom Shell \(BodyArmour\) — “Grand Regalia” is not a base in the 0\.5\.0 data/);
  });

  it('says nothing when nothing was left out', async () => {
    vi.mocked(loadStreamers).mockResolvedValue(withSkips([]));
    await open();
    expect(screen.queryByText(/Not shown:/)).toBeNull();
  });

  /** A gear file written before the list existed has none — that means "not recorded", not "nothing". */
  it('reads an older gear file with no skipped list without breaking', async () => {
    await open();
    expect(screen.queryByText(/Not shown:/)).toBeNull();
  });
});
