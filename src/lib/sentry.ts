import React from 'react';
import type * as SentryNS from '@sentry/react';

/**
 * Error reporting: lazily loaded, and only when it is actually configured.
 *
 * Two things this file has to get right. The version before it got both wrong.
 *
 * 1. **It is off unless `VITE_SENTRY_DSN` is set AT BUILD TIME.** Vite inlines `import.meta.env.*`
 *    as a literal, so with no DSN the guard below is provably true and Rollup deletes the entire
 *    `init` call — silently. A production deploy without that variable reported *nothing*, which is
 *    the one failure error tracking exists to prevent. `warnIfUnmonitored` in vite.config.ts now
 *    says so in the build log instead of leaving it to be discovered.
 *
 * 2. **It must not sit in the entry bundle.** Measured: importing the SDK statically takes the entry
 *    chunk from 116 kB gzip to 202 kB — **+74% on the critical path**, in an app that carries a
 *    bespoke Vite plugin purely to start its data download a few hundred milliseconds earlier.
 *    So the SDK is a DYNAMIC import. The entry bundle stays 116 kB and Sentry arrives in its own
 *    chunk once the app is already interactive.
 *
 * The cost of (2) is a race: an error can be thrown before the chunk lands. `queued` holds those and
 * `flush` replays them, so the window costs nothing. Without it, the errors most worth seeing — the
 * ones that fire during startup — would be exactly the ones dropped.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN;

let sdk: typeof SentryNS | null = null;
const queued: Error[] = [];

export function initSentry(): void {
  if (!DSN) return;

  void import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: DSN,
      environment: import.meta.env.MODE,

      // A static site with one route: there is no server span to join and no navigation to trace, so
      // tracing buys little here. Kept at a low rate for page-load vitals rather than turned off.
      tracesSampleRate: 0.1,

      // Record ONLY sessions that hit an error. The previous config also recorded 10% of ordinary
      // sessions, which is surveillance of people who are not having a problem — and it is the
      // expensive half of the SDK. Text stays unmasked because the craft the player configured IS
      // the bug report; there are no accounts, no logins and no personal data in this app to leak.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ],
    });

    sdk = Sentry;
    for (const e of queued.splice(0)) Sentry.captureException(e);
  }).catch(() => {
    // An ad blocker or a failed chunk fetch must never take the app down with it. Reporting is a
    // nice-to-have; the craft the player came for is not.
  });
}

/** Send an error if reporting is on and has loaded; queue it if it is still in flight. */
export function reportError(error: Error): void {
  if (!DSN) return;
  if (sdk) sdk.captureException(error);
  else if (queued.length < 20) queued.push(error); // bounded: a render loop must not eat memory
}

/**
 * Our own boundary rather than `Sentry.ErrorBoundary`, which is what forced the SDK into the entry
 * bundle in the first place — the component had to exist at module scope, so the whole package came
 * with it whether or not a DSN was ever set. This is the same twenty lines without that dependency.
 */
export class ErrorBoundary extends React.Component<
  { readonly fallback: React.ReactNode; readonly children: React.ReactNode },
  { readonly failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error) {
    reportError(error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
