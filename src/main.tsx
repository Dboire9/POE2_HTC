import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { initSentry, SentryErrorBoundary } from "./lib/sentry"
import { PREFS_PREFIX } from "./lib/currencyPrefs"
import { Analytics } from '@vercel/analytics/react';

// Initialize Sentry error tracking
initSentry();

// Force cache clear - version 2.1
const CACHE_VERSION = '2.1';
const currentVersion = localStorage.getItem('app_version');
if (currentVersion !== CACHE_VERSION) {
  // Saved SETTINGS are not cache. This wipe exists to drop stale cached data on upgrade, but it would
  // also silently erase the player's "currencies I don't have" list every time the version is bumped —
  // and they would have no idea why their plans changed. Carry those keys across the clear.
  const keep = Object.keys(localStorage).filter((k) => k.startsWith(PREFS_PREFIX));
  const saved = keep.map((k) => [k, localStorage.getItem(k)] as const);
  localStorage.clear();
  sessionStorage.clear();
  for (const [k, v] of saved) if (v !== null) localStorage.setItem(k, v);
  localStorage.setItem('app_version', CACHE_VERSION);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <App />
      <Analytics />
    </SentryErrorBoundary>
  </React.StrictMode>,
)

// Fallback UI for error boundary
function ErrorFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>The application encountered an error. Please try refreshing the page.</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ 
          marginTop: '1rem', 
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}
