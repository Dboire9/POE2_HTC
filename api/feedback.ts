/**
 * POST /api/feedback — "Rate the app" and "What do you want next?", and the only server code this
 * otherwise static site runs.
 *
 * WHY A SERVER AT ALL. A form any stranger can post to is a spam target, and a static page cannot tell
 * a person from a script: whatever the page checks, a script simply skips. So the page never talks to
 * the inbox. It posts here, and this function decides, in this order:
 *
 *   1. BotID — Vercel's invisible check, at its Basic level (free, no puzzle, nothing for a player to
 *      do). The page's `initBotId` attaches a solved challenge to this one route; a request without a
 *      valid one — `curl`, or a script replaying a request — is refused before anything else is read.
 *   2. The inbox is configured (`FEEDBACK_SENTRY_DSN`); otherwise 503, and the page points at Discord.
 *   3. A small, strict body: 1–5 stars and/or at most `MAX_MESSAGE` characters — or, for "what next",
 *      the words alone (`topic: 'next'`). Nothing else is kept.
 *   4. A hidden field no person sees. A form-filling bot fills it in and is answered "ok", told nothing.
 *   5. A per-address limit, per running instance — best effort; the layers above do the real work.
 *
 * THE INBOX IS ITS OWN SENTRY PROJECT, whose DSN lives only in this function's environment. The app's
 * error-reporting DSN is public by design (Vite inlines it into the bundle), so forwarding there would
 * let a bot skip every step above by posting to Sentry directly. This key never reaches a browser.
 *
 * Nothing that identifies the player is forwarded — no address, no browser string: the stars, their
 * words and the app version. Sentry sees this function as the sender.
 */
import { checkBotId } from 'botid/server';

/** The most a comment keeps, in characters. The page's box stops at the same (`RateApp.tsx`, pinned by its test). */
export const MAX_MESSAGE = 1000;
/** A ceiling on the whole request: stars, 1,000 characters at up to 4 bytes each, and a version. */
const MAX_BODY = 8192;
/** Per address, per running instance of this function. */
export const LIMIT = { count: 5, windowMs: 10 * 60_000 } as const;

export interface Feedback {
  /** 1–5, or null when the player only wrote something. */
  readonly rating: number | null;
  readonly message: string;
  readonly version: string;
  /** Present for "What do you want next?" — words only, read apart from ratings. Absent: a rating. */
  readonly topic?: 'next';
}

/** Control characters (a tab and a newline may stay) and the ones that silently reverse text direction. */
const unwanted = (c: number): boolean =>
  (c < 32 && c !== 9 && c !== 10 && c !== 13) || c === 127 || (c >= 0x202a && c <= 0x202e) || (c >= 0x2066 && c <= 0x2069);

/** Unwanted characters out, trimmed, at most `max` characters — counted whole, so an emoji is never cut in half. */
function clean(s: string, max: number): string {
  const kept = [...s].filter((ch) => !unwanted(ch.codePointAt(0) ?? 0)).join('').trim();
  return [...kept].slice(0, max).join('');
}

/**
 * The body as the page sends it, or null when it is neither: a rating needs stars or words; "what next"
 * (`topic: 'next'`) needs words and takes no stars; anything malformed is refused.
 */
export function parseFeedback(raw: unknown): Feedback | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const { rating, message, version, topic } = raw as Record<string, unknown>;
  if (topic !== undefined && topic !== 'next') return null;
  if (topic === 'next') {
    if (rating !== undefined && rating !== null) return null;
    const words = typeof message === 'string' ? clean(message, MAX_MESSAGE) : '';
    return words === '' ? null : { rating: null, message: words, version: typeof version === 'string' ? clean(version, 32) : '', topic };
  }
  const stars = rating === null || rating === undefined ? null
    : typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : undefined;
  if (stars === undefined) return null;
  if (message !== undefined && typeof message !== 'string') return null;
  const words = typeof message === 'string' ? clean(message, MAX_MESSAGE) : '';
  if (stars === null && words === '') return null;
  return { rating: stars, message: words, version: typeof version === 'string' ? clean(version, 32) : '' };
}

/** What the maintainer reads in Sentry's User Feedback list: the stars (or "What next?") first, then the words. */
export function feedbackText(fb: Feedback): string {
  if (fb.topic === 'next') return `What next?\n\n${fb.message}`;
  const head = fb.rating === null ? 'No stars given' : `${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)} ${fb.rating}/5`;
  return fb.message === '' ? head : `${head}\n\n${fb.message}`;
}

/**
 * The request Sentry's own SDK would send for `captureFeedback` — an envelope holding one `feedback`
 * item (see `createEventEnvelope` and `captureFeedback` in @sentry/core) — built here so the function
 * carries no SDK. Null when the DSN is not one.
 */
export function sentryEnvelope(dsn: string, fb: Feedback, now: Date, eventId: string): { url: string; body: string } | null {
  let u: URL;
  try { u = new URL(dsn); } catch { return null; }
  const path = u.pathname.split('/').filter(Boolean);
  const project = path.pop();
  if (u.username === '' || project === undefined || !/^\d+$/.test(project)) return null;
  const prefix = path.length > 0 ? `/${path.join('/')}` : '';
  const url = `${u.protocol}//${u.host}${prefix}/api/${project}/envelope/?sentry_key=${encodeURIComponent(u.username)}&sentry_version=7`;
  const event = {
    event_id: eventId,
    timestamp: now.getTime() / 1000,
    platform: 'javascript',
    level: 'info',
    type: 'feedback',
    environment: 'production',
    ...(fb.version === '' ? {} : { release: `poe2htc@${fb.version}` }),
    tags: { topic: fb.topic ?? 'rating', rating: fb.rating === null ? 'none' : String(fb.rating) },
    contexts: { feedback: { message: feedbackText(fb), source: fb.topic === 'next' ? 'what-next' : 'rate-the-app' } },
  };
  const body = [
    JSON.stringify({ event_id: eventId, sent_at: now.toISOString() }),
    JSON.stringify({ type: 'feedback' }),
    JSON.stringify(event),
  ].join('\n');
  return { url, body };
}

const recent = new Map<string, number[]>();

/** Whether `address` may send one more now. Remembered per running instance only, and never kept beyond the window. */
export function allow(address: string, now: number, store: Map<string, number[]> = recent): boolean {
  const times = (store.get(address) ?? []).filter((t) => now - t < LIMIT.windowMs);
  if (times.length >= LIMIT.count) {
    store.set(address, times);
    return false;
  }
  if (store.size > 10_000) store.clear(); // it can never grow without bound
  store.set(address, [...times, now]);
  return true;
}

const reply = (status: number, error?: string): Response =>
  new Response(JSON.stringify(error === undefined ? { ok: true } : { error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function POST(request: Request): Promise<Response> {
  // 1. The invisible check. It throws, rather than answering, when the project cannot ask Vercel —
  //    the OIDC option switched off — and that is the site's fault, not the player's.
  let bot: boolean;
  try {
    bot = (await checkBotId()).isBot;
  } catch (err) {
    console.error('BotID could not check this request', err);
    return reply(503, 'check-unavailable');
  }
  if (bot) return reply(403, 'bot');

  // 2. Somewhere to send it.
  const dsn = process.env.FEEDBACK_SENTRY_DSN;
  if (dsn === undefined || dsn === '') return reply(503, 'not-configured');

  // 3. A small body, and a well-formed one.
  if (Number(request.headers.get('content-length') ?? '0') > MAX_BODY) return reply(413, 'too-large');
  const text = await request.text();
  if (text.length > MAX_BODY) return reply(413, 'too-large');
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return reply(400, 'invalid'); }

  // 4. The hidden field: filled in means a bot, and a bot is told it worked.
  const fields = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
  if (typeof fields.website === 'string' && fields.website !== '') return reply(200);

  const fb = parseFeedback(raw);
  if (fb === null) return reply(400, 'invalid');

  // 5. A few per address. Vercel sets `x-real-ip`; the address is never stored beyond the window.
  const address = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allow(address, Date.now())) return reply(429, 'too-many');

  const envelope = sentryEnvelope(dsn, fb, new Date(), crypto.randomUUID().replace(/-/g, ''));
  if (envelope === null) {
    console.error('FEEDBACK_SENTRY_DSN is set but is not a Sentry DSN');
    return reply(503, 'not-configured');
  }
  try {
    const res = await fetch(envelope.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope.body,
    });
    if (!res.ok) {
      console.error(`Sentry refused the feedback: HTTP ${res.status}`);
      return reply(502, 'upstream');
    }
  } catch (err) {
    console.error('Sentry could not be reached', err);
    return reply(502, 'upstream');
  }
  return reply(200);
}
