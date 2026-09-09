import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StreamerGear from './StreamerGear';
import { loadPatch } from '../../../packages/engine/src/index.ts';
import type { StreamerFile } from '../../lib/streamerGear';

const data = loadPatch('data/patches/0.5.0');
const file = JSON.parse(readFileSync('data/streamers/0.5.0.json', 'utf8')) as StreamerFile;

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
    expect(screen.getByText(/leaves your own item alone/)).toBeInTheDocument();
    expect(screen.getByText(/replacing what is there/)).toBeInTheDocument();
  });

  it('says so, rather than hanging, when the gear file cannot be fetched', async () => {
    vi.mocked(loadStreamers).mockRejectedValue(new Error('offline'));
    render(<StreamerGear data={data} routes={{ own: vi.fn(), scratch: vi.fn(), aim: vi.fn() }} />);
    expect(await screen.findByText(/Couldn’t load the gear file/)).toBeInTheDocument();
  });
});
