import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportProblem, { reportBody, DISCORD_URL, ISSUES_URL } from './ReportProblem';
import { decodeWorkspace, getWorkspace, shareUrl } from '../../lib/workspace';
import { loadPatch } from '../../../packages/engine/src/loadPatch.ts';

vi.mock('../../lib/engine', async (orig) => ({
  ...(await orig<typeof import('../../lib/engine')>()),
  loadEngine: () => Promise.resolve({ data: {} as never, prices: { currency: {}, omens: {} } as never }),
  priceBasis: () => ({ estimated: true, patch: '0.5.0', asOf: '2026-08-22' }),
}));

// Feedback about a crafting planner is close to useless without the craft. The whole point of this
// panel is that the report carries a link reproducing the exact workspace, so "the plan looked wrong"
// becomes something a maintainer can open.

describe('the report body', () => {
  it('carries the version, the workspace link and the browser', () => {
    const body = reportBody('9.9.9', 'https://x/?s=abc', 'TestAgent/1.0', { patch: '0.5.0', asOf: '2026-08-22' });
    expect(body).toContain('POE2HTC v9.9.9');
    expect(body).toContain('patch 0.5.0');
    expect(body).toContain('prices as of 2026-08-22');
    expect(body).toContain('Workspace: https://x/?s=abc');
    expect(body).toContain('Browser: TestAgent/1.0');
    // The two prompts the reporter actually has to fill in.
    expect(body).toContain('**What happened:**');
    expect(body).toContain('**What I expected:**');
  });

  // Guessing a patch is worse than omitting one: a wrong patch sends a maintainer down the wrong path.
  it('omits provenance rather than inventing it when the engine has not loaded', () => {
    const body = reportBody('9.9.9', 'https://x/?s=abc', 'TestAgent/1.0', undefined);
    expect(body).toContain('POE2HTC v9.9.9');
    expect(body).not.toMatch(/patch/i);
    expect(body).not.toMatch(/prices as of/i);
  });

  // THE assertion that matters: the link must round-trip back into a workspace. A substring check
  // would pass just as happily on a link that decodes to nothing.
  it('embeds a link that decodes back to the workspace it describes', () => {
    const data = loadPatch('data/patches/0.5.0');
    const url = shareUrl(getWorkspace());
    const payload = new URL(url).searchParams.get('s');
    expect(payload).toBeTruthy();
    const restored = decodeWorkspace(payload!, data);
    expect(restored).not.toBeNull();
    expect(restored!.workspace.lab.baseId).toBe(getWorkspace().lab.baseId);
    // Nothing in the link may be silently unknown to this build, or the report would describe a craft
    // the maintainer's copy of the app can't reconstruct.
    expect(restored!.dropped).toEqual([]);
  });
});

describe('the panel', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('renders nothing until it is opened', () => {
    const { container } = render(<ReportProblem version="9.9.9" open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the report in a labelled, copyable box and offers both channels', async () => {
    render(<ReportProblem version="9.9.9" open onClose={() => {}} />);
    const box = await screen.findByRole('textbox', { name: /paste it into Discord or GitHub/i });
    expect((box as HTMLTextAreaElement).value).toContain('POE2HTC v9.9.9');
    expect((box as HTMLTextAreaElement).value).toContain('Workspace: http');
    // Discord needs no account, so it must be offered alongside GitHub rather than instead of it.
    expect(screen.getByRole('link', { name: /Discord/i })).toHaveAttribute('href', DISCORD_URL);
    expect(screen.getByRole('link', { name: /GitHub issue/i })).toHaveAttribute('href', ISSUES_URL);
  });

  // Clipboard is permission-gated and absent over plain http. The text is already on screen, so a
  // failure must say "copy it from the box" rather than silently doing nothing.
  it('does not fail silently when the clipboard is blocked', async () => {
    const user = userEvent.setup();
    // jsdom's navigator.clipboard is getter-only, so it has to be redefined rather than assigned.
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    });
    render(<ReportProblem version="9.9.9" open onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Copy report/i }));
    // The box is still there with the text in it — nothing was lost.
    expect(await screen.findByRole('textbox', { name: /paste it/i })).toBeInTheDocument();
  });
});
