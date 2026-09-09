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

/** Open the panel and wait for the gear to arrive. */
async function open(onApply = vi.fn()) {
  const user = userEvent.setup();
  render(<StreamerGear data={data} onApply={onApply} />);
  await user.click(screen.getByRole('button', { name: /Load a streamer’s item/i }));
  await screen.findByText(new RegExp(file.characters[0]!.character));
  return { user, onApply };
}

describe('the streamer gear panel', () => {
  it('is collapsed on arrival and fetches nothing until it is opened', () => {
    render(<StreamerGear data={data} onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Load a streamer’s item/i }))
      .toHaveAttribute('aria-expanded', 'false');
    // The gear file is a separate request precisely so a player who never opens this does not pay it.
    expect(loadStreamers).not.toHaveBeenCalled();
  });

  it('fetches once the panel is opened, and lists the character’s items', async () => {
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

  it('hands the tab the item it showed, and only on the button', async () => {
    const { user, onApply } = await open();
    const helm = file.characters[0]!.items.find((i) => i.slot === 'Helm')!;
    await user.click(screen.getByRole('button', { name: new RegExp(helm.name) }));
    // Reading is free; overwriting a craft the player has set up is not.
    expect(onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Use this item/i }));
    await waitFor(() => { expect(onApply).toHaveBeenCalledTimes(1); });
    const sent = vi.mocked(onApply).mock.calls[0]![0] as { baseId: string; level: number };
    expect(sent.baseId).toBe(helm.baseId);
    expect(sent.level).toBe(helm.level);
  });

  it('stays usable when the gear file cannot be fetched', async () => {
    vi.mocked(loadStreamers).mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    render(<StreamerGear data={data} onApply={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Load a streamer’s item/i }));
    expect(await screen.findByText(/Couldn’t load the gear file/)).toBeInTheDocument();
  });
});
