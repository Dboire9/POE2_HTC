import React from 'react';
import { DISCORD_URL } from './ReportProblem';

// What "Rate the app" and "What do you want next?" share: the one server route they post to, the
// invisible bot check that route demands, the hidden field a bot fills in, and what a refusal says.
// One copy, so the two panels cannot drift apart on any of it.

/** The server function (`api/feedback.ts`), and the one route BotID protects. */
export const FEEDBACK_PATH = '/api/feedback';
/** The most the server keeps. `api/feedback.ts` caps at the same, and a test pins the two together. */
export const MAX_MESSAGE = 1000;

let started: Promise<void> | null = null;
/**
 * Start the invisible check, once per page — when a panel opens, so the challenge runs while the player
 * writes. A blocked chunk (an ad blocker, say) is not fatal: the message is still sent, and the server's
 * refusal comes back as a sentence the panel can show.
 */
export function startBotCheck(): Promise<void> {
  started ??= import('botid/client/core')
    .then(({ initBotId }) => { initBotId({ protect: [{ path: FEEDBACK_PATH, method: 'POST' }] }); })
    .catch(() => { started = null; });
  return started;
}

/** The server's refusals, in words a player can act on. */
const REFUSED: Readonly<Record<number, string>> = {
  403: 'Your browser didn’t pass the automatic bot check. Please try again — or tell me on Discord.',
  429: 'Lots of messages from here just now. Please try again in a few minutes.',
  503: 'Messages aren’t switched on right now. Please tell me on Discord instead.',
};
const FAILED = 'Something went wrong on my side. Please try again later — or tell me on Discord.';
// Also what an ad blocker that stops the bot check's script looks like from here: the request never
// leaves the page. So the sentence names both rather than blaming the connection alone.
const OFFLINE = 'Couldn’t send it — a connection problem, or an ad blocker in the way. Please try again, or tell me on Discord.';

export type SendStatus = { readonly kind: 'idle' | 'sending' | 'sent' } | { readonly kind: 'failed'; readonly why: string };

/** Post one message to the inbox, after the bot check, and say how it went. */
export async function sendFeedback(body: Readonly<Record<string, unknown>>): Promise<SendStatus> {
  try {
    await startBotCheck();
    const res = await fetch(FEEDBACK_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok ? { kind: 'sent' } : { kind: 'failed', why: REFUSED[res.status] ?? FAILED };
  } catch {
    return { kind: 'failed', why: OFFLINE };
  }
}

/** Off-screen, out of the tab order and hidden from screen readers: nobody fills this in but a bot. */
export const BotTrap: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
    <label>
      Leave this empty
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

/** A refusal, said, with Discord as the way round it. */
export const SendFailed: React.FC<{ why: string }> = ({ why }) => (
  <p role="alert" className="text-xs text-red-700 dark:text-red-300">
    <span>{why}</span>{' '}
    <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="underline">
      Open Discord
    </a>
  </p>
);
