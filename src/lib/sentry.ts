import * as Sentry from '@sentry/react';

// Initialize Sentry for error tracking
// Get DSN from environment variable or leave empty for local development
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log('[Sentry] Skipping initialization (no DSN configured)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production.
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^http:\/\/localhost:8080/],
    
    // Capture Replay for Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      // Don't send events in development mode
      if (import.meta.env.MODE === 'development') {
        console.log('[Sentry] Would send event:', event);
        return null;
      }
      
      return event;
    },
  });
}

// Create an error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Export for manual error reporting
export { Sentry };
