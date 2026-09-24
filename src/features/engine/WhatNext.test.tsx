import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ initBotId: vi.fn() }));
vi.mock('botid/client/core', () => ({ initBotId: mocks.initBotId }));

import WhatNext from './WhatNext';
import { FEEDBACK_PATH, MAX_MESSAGE } from './feedbackForm';

const show = () => render(<WhatNext version="9.9.9" open onClose={() => {}} />);
const box = () => screen.getByRole('textbox', { name: /in your own words/ });
const sendButton = () => screen.getByRole('button', { name: /^Send/ });

let server: ReturnType<typeof vi.fn>;
beforeEach(() => {
  server = vi.fn(() => Promise.resolve(new Response('{"ok":true}', { status: 200 })));
  vi.stubGlobal('fetch', server);
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('What do you want next?', () => {
  it('renders nothing until it is opened, and starts the bot check when it is', async () => {
    const { container, rerender } = render(<WhatNext version="9.9.9" open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<WhatNext version="9.9.9" open onClose={() => {}} />);
    await vi.waitFor(() => expect(mocks.initBotId).toHaveBeenCalledWith({ protect: [{ path: FEEDBACK_PATH, method: 'POST' }] }));
  });

  it('waits for words, then sends them as "what next" with the version — no stars, nothing about the player', async () => {
    const user = userEvent.setup();
    show();
    expect(sendButton()).toBeDisabled();
    await user.type(box(), '   ');
    expect(sendButton()).toBeDisabled();
    await user.type(box(), 'Plan jewels too  ');
    await user.click(sendButton());
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you!');
    const [url, init] = server.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(FEEDBACK_PATH);
    expect(JSON.parse(init.body as string)).toEqual({ topic: 'next', message: 'Plan jewels too', version: '9.9.9', website: '' });
  });

  it('says why when the server refuses, with Discord as the way round', async () => {
    server.mockResolvedValue(new Response('{}', { status: 429 }));
    const user = userEvent.setup();
    show();
    await user.type(box(), 'More bases');
    await user.click(sendButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(/Lots of messages from here just now/);
    expect(screen.getByRole('link', { name: 'Open Discord' })).toBeInTheDocument();
  });

  it('stops typing where the server stops keeping', () => {
    show();
    expect(box()).toHaveAttribute('maxLength', String(MAX_MESSAGE));
  });
});
