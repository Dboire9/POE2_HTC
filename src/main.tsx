import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { initSentry, SentryErrorBoundary } from "./lib/sentry"
import { inject } from '@vercel/analytics';

// Initialize Sentry error tracking
initSentry();

// Initialize Vercel Analytics (only in production/web)
if (window.location.hostname !== 'localhost') {
  inject();
}

// Force cache clear - version 2.1
const CACHE_VERSION = '2.1';
const currentVersion = localStorage.getItem('app_version');
if (currentVersion !== CACHE_VERSION) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('app_version', CACHE_VERSION);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <App />
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
