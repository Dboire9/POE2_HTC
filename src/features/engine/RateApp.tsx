import React, { useEffect, useId, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { BotTrap, MAX_MESSAGE, SendFailed, sendFeedback, startBotCheck, type SendStatus } from './feedbackForm';

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

const STAR_WORDS = ['Bad', 'Not great', 'OK', 'Good', 'Great'] as const;

const RateApp: React.FC<{ version: string; open: boolean; onClose: () => void }> = ({ version, open, onClose }) => {
  const [stars, setStars] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  // The hidden field. A person never sees it, so it stays empty; a form-filling bot fills it in.
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<SendStatus>({ kind: 'idle' });
  const group = useId();

  useEffect(() => { if (open) void startBotCheck(); }, [open]);
  if (!open) return null;

  const canSend = (stars !== null || message.trim() !== '') && status.kind !== 'sending';
  const send = async (): Promise<void> => {
    setStatus({ kind: 'sending' });
    setStatus(await sendFeedback({ rating: stars, message: message.trim(), version, website: trap }));
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

          <BotTrap value={trap} onChange={setTrap} />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button type="submit" size="sm" disabled={!canSend}>
              {status.kind === 'sending' ? 'Sending…' : 'Send'}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              No email, no name, no account — only the stars, your words and the app version are sent.
            </span>
          </div>

          {status.kind === 'failed' && <SendFailed why={status.why} />}
        </form>
      )}
    </Card>
  );
};

export default RateApp;
