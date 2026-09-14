import React, { useEffect, useId, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { DISCORD_URL } from './ReportProblem';

/**
 * "Rate the app" — stars and a few words, straight to the maintainer, with nothing asked of the player.
 *
 * No email, no name, no account, no puzzle. What stops a bot lives on the server (`api/feedback.ts`):
 * Vercel's invisible BotID check, which this panel starts when it opens, so the challenge runs while
 * the player picks their stars, and `initBotId` attaches it to the one protected request. Started on
 * open rather than at startup, like the Sentry SDK and the guide: most visits never rate, and they
 * should pay nothing for it.
 *
 * NOT A MODAL, for the reason `ReportProblem` gives: a disclosure under the header with `aria-expanded`
 * on the trigger, and no focus trap to hand-roll.
 */

export const RATE_PANEL_ID = 'rate-app-panel';
/** The server function (`api/feedback.ts`), and the one route BotID protects. */
export const FEEDBACK_PATH = '/api/feedback';
/** The most the server keeps. `api/feedback.ts` caps at the same, and a test pins the two together. */
export const MAX_MESSAGE = 1000;

let started: Promise<void> | null = null;
/**
 * Start the invisible check, once per page. A blocked chunk (an ad blocker, say) is not fatal: the
 * rating is still sent, and the server's refusal comes back as a sentence the panel can show.
 */
function startBotCheck(): Promise<void> {
  started ??= import('botid/client/core')
    .then(({ initBotId }) => { initBotId({ protect: [{ path: FEEDBACK_PATH, method: 'POST' }] }); })
    .catch(() => { started = null; });
  return started;
}

const STAR_WORDS = ['Bad', 'Not great', 'OK', 'Good', 'Great'] as const;

/** The server's refusals, in words a player can act on. */
const REFUSED: Readonly<Record<number, string>> = {
  403: 'Your browser didn’t pass the automatic bot check. Please try again — or tell me on Discord.',
  429: 'Lots of ratings from here just now. Please try again in a few minutes.',
  503: 'Ratings aren’t switched on right now. Please tell me on Discord instead.',
};
const FAILED = 'Something went wrong on my side. Please try again later — or tell me on Discord.';
// Also what an ad blocker that stops the bot check's script looks like from here: the request never
// leaves the page. So the sentence names both rather than blaming the connection alone.
const OFFLINE = 'Couldn’t send it — a connection problem, or an ad blocker in the way. Please try again, or tell me on Discord.';

type Status = { readonly kind: 'idle' | 'sending' | 'sent' } | { readonly kind: 'failed'; readonly why: string };

const RateApp: React.FC<{ version: string; open: boolean; onClose: () => void }> = ({ version, open, onClose }) => {
  const [stars, setStars] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  // The hidden field. A person never sees it, so it stays empty; a form-filling bot fills it in.
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const group = useId();

  useEffect(() => { if (open) void startBotCheck(); }, [open]);
  if (!open) return null;

  const canSend = (stars !== null || message.trim() !== '') && status.kind !== 'sending';
  const send = async (): Promise<void> => {
    setStatus({ kind: 'sending' });
    try {
      await startBotCheck();
      const res = await fetch(FEEDBACK_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars, message: message.trim(), version, website: trap }),
      });
      setStatus(res.ok ? { kind: 'sent' } : { kind: 'failed', why: REFUSED[res.status] ?? FAILED });
    } catch {
      setStatus({ kind: 'failed', why: OFFLINE });
    }
  };

  return (
    <Card id={RATE_PANEL_ID} className="p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">Rate POE2HTC</h2>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Close
        </button>
      </div>

      {status.kind === 'sent' ? (
        <p role="status" className="text-sm">
          <strong>Thank you!</strong> It really helps.
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (canSend) void send(); }} className="space-y-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Your rating helps me a lot</strong> — even just the stars. It tells
            me what works and what to fix next.
          </p>

          <fieldset>
            <legend className="text-xs font-medium">How do you like the app?</legend>
            <div className="mt-1 flex items-center gap-1">
              {STAR_WORDS.map((word, i) => {
                const n = i + 1;
                return (
                  <label key={n} className="cursor-pointer" title={word}>
                    <input
                      type="radio" name={group} value={n} checked={stars === n}
                      onChange={() => setStars(n)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'block rounded px-0.5 text-2xl leading-none transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                        stars !== null && n <= stars ? 'text-yellow-400' : 'text-muted-foreground/40 hover:text-yellow-300',
                      )}
                    >
                      ★
                    </span>
                    <span className="sr-only">{`${n} star${n === 1 ? '' : 's'} — ${word}`}</span>
                  </label>
                );
              })}
              <span className="ml-2 text-xs text-muted-foreground">{stars === null ? '' : STAR_WORDS[stars - 1]}</span>
            </div>
          </fieldset>

          <label className="block space-y-1">
            <span className="text-xs font-medium">
              What’s good, and what isn’t? <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE}
              rows={4}
              placeholder="What you liked, what confused you, what’s missing…"
              className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {/* Off-screen, out of the tab order and hidden from screen readers: nobody fills this in but a bot. */}
          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label>
              Leave this empty
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button type="submit" size="sm" disabled={!canSend}>
              {status.kind === 'sending' ? 'Sending…' : 'Send'}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              No email, no name, no account — only the stars, your words and the app version are sent.
            </span>
          </div>

          {status.kind === 'failed' && (
            <p role="alert" className="text-xs text-red-700 dark:text-red-300">
              <span>{status.why}</span>{' '}
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="underline">
                Open Discord
              </a>
            </p>
          )}
        </form>
      )}
    </Card>
  );
};

export default RateApp;
