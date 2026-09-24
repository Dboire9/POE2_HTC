import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { existsSync } from 'node:fs';

const mocks = vi.hoisted(() => ({ initBotId: vi.fn() }));
vi.mock('botid/client/core', () => ({ initBotId: mocks.initBotId }));

import RateApp from './RateApp';
import { FEEDBACK_PATH, MAX_MESSAGE } from './feedbackForm';
import { MAX_MESSAGE as SERVER_KEEPS } from '../../../api/feedback';

const show = () => render(<RateApp version="9.9.9" open onClose={() => {}} />);
const star = (n: number) => screen.getByRole('radio', { name: new RegExp(`^${n} stars? —`) });
const sendButton = () => screen.getByRole('button', { name: /^Send/ });

let server: ReturnType<typeof vi.fn>;
const answer = (status: number) => server.mockResolvedValue(new Response('{}', { status }));
beforeEach(() => {
  server = vi.fn(() => Promise.resolve(new Response('{"ok":true}', { status: 200 })));
  vi.stubGlobal('fetch', server);
});
afterEach(() => { vi.unstubAllGlobals(); });

/** What the panel posted, as the server would read it. */
const posted = () => JSON.parse((server.mock.calls[0] as [string, RequestInit])[1].body as string) as Record<string, unknown>;

describe('Rate the app', () => {
  it('renders nothing until it is opened', () => {
    const { container } = render(<RateApp version="9.9.9" open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  // The server refuses any request without a solved challenge, so the panel must start the check —
  // for exactly the route it posts to, since `checkBotId` fails on a route the page did not protect.
  it('starts the invisible bot check for the one route it posts to', async () => {
    show();
    await vi.waitFor(() => expect(mocks.initBotId).toHaveBeenCalledWith({ protect: [{ path: FEEDBACK_PATH, method: 'POST' }] }));
  });

  it('asks for nothing but stars or words — Send waits for one of them', async () => {
    const user = userEvent.setup();
    show();
    expect(sendButton()).toBeDisabled();
    await user.click(star(4));
    expect(sendButton()).toBeEnabled();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('sends the stars, the words and the version — nothing that identifies the player', async () => {
    const user = userEvent.setup();
    show();
    await user.click(star(5));
    await user.type(screen.getByRole('textbox', { name: /What’s good/ }), '  The true cost is great  ');
    await user.click(sendButton());
    expect(server).toHaveBeenCalledWith(FEEDBACK_PATH, expect.objectContaining({ method: 'POST' }));
    expect(posted()).toEqual({ rating: 5, message: 'The true cost is great', version: '9.9.9', website: '' });
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you!');
  });

  it('can send words without stars', async () => {
    const user = userEvent.setup();
    show();
    await user.type(screen.getByRole('textbox', { name: /What’s good/ }), 'Needs a dark mode');
    await user.click(sendButton());
    expect(posted()).toMatchObject({ rating: null, message: 'Needs a dark mode' });
  });

  it.each([
    [503, /switched on/],
    [403, /bot check/],
    [429, /few minutes/],
    [500, /went wrong on my side/],
  ])('says what to do when the server answers %i', async (status, words) => {
    answer(status);
    const user = userEvent.setup();
    show();
    await user.click(star(3));
    await user.click(sendButton());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(words);
    expect(screen.getByRole('link', { name: 'Open Discord' })).toBeInTheDocument();
    expect(sendButton()).toBeEnabled(); // and they can try again
  });

  it('says so when the server cannot be reached', async () => {
    server.mockRejectedValue(new TypeError('Failed to fetch'));
    const user = userEvent.setup();
    show();
    await user.click(star(3));
    await user.click(sendButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn’t send it .* ad blocker/);
  });

  // The trap works only while a PERSON cannot reach it: off-screen, out of the tab order, silent to a
  // screen reader. Stars and the text box are what a player reaches.
  it('keeps its bot trap away from people', () => {
    show();
    const trap = screen.getByLabelText('Leave this empty');
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('textbox', { name: 'Leave this empty' })).toBeNull();
  });

  it('stops typing where the server stops keeping', () => {
    show();
    expect(MAX_MESSAGE).toBe(SERVER_KEEPS);
    expect(screen.getByRole('textbox', { name: /What’s good/ })).toHaveAttribute('maxlength', String(MAX_MESSAGE));
  });

  // The route is a file: Vercel serves `api/feedback.ts` at `/api/feedback`.
  it('posts to the function that exists', () => {
    expect(existsSync(`.${FEEDBACK_PATH}.ts`)).toBe(true);
  });
});
