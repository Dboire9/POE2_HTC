import React, { useEffect, useId, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BotTrap, MAX_MESSAGE, SendFailed, sendFeedback, startBotCheck, type SendStatus } from './feedbackForm';

export const WHAT_NEXT_PANEL_ID = 'what-next-panel';

/**
 * "What do you want next?" — a player's own words about what the app should do next, straight to the
 * maintainer's inbox, apart from ratings (`topic: 'next'`, api/feedback.ts). Free text only, on
 * purpose: a list of ideas to tick would only hear back what is already on it.
 *
 * The same route, bot check and privacy as "Rate the app" (`feedbackForm.tsx`), and the same shape: a
 * disclosure under the header, not a modal.
 */
const WhatNext: React.FC<{ version: string; open: boolean; onClose: () => void }> = ({ version, open, onClose }) => {
  const [message, setMessage] = useState('');
  // The hidden field. A person never sees it, so it stays empty; a form-filling bot fills it in.
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<SendStatus>({ kind: 'idle' });
  const field = useId();

  useEffect(() => { if (open) void startBotCheck(); }, [open]);
  if (!open) return null;

  const canSend = message.trim() !== '' && status.kind !== 'sending';
  const send = async (): Promise<void> => {
    setStatus({ kind: 'sending' });
    setStatus(await sendFeedback({ topic: 'next', message: message.trim(), version, website: trap }));
  };

  return (
    <Card id={WHAT_NEXT_PANEL_ID} className="p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">What do you want next?</h2>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Close
        </button>
      </div>

      {status.kind === 'sent' ? (
        <p role="status" className="text-sm">
          <strong>Thank you!</strong> It helps decide what comes next.
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (canSend) void send(); }} className="space-y-3">
          <label htmlFor={field} className="block text-xs text-muted-foreground">
            A feature, a tab, an item class it should plan, something that would save you time — in your own
            words.
          </label>
          <textarea
            id={field}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE}
            rows={4}
            placeholder="I’d like the app to…"
            className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <BotTrap value={trap} onChange={setTrap} />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button type="submit" size="sm" disabled={!canSend}>
              {status.kind === 'sending' ? 'Sending…' : 'Send'}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              No email, no name, no account — only your words and the app version are sent.
            </span>
          </div>
          {status.kind === 'failed' && <SendFailed why={status.why} />}
        </form>
      )}
    </Card>
  );
};

export default WhatNext;
