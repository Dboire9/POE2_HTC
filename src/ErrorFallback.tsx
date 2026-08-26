import React from 'react';
import { DISCORD_URL } from './features/engine/ReportProblem';

/**
 * The last line of defence, so it depends on nothing: no Tailwind classes, no app modules, no
 * component library. If React has torn the tree down, the least this can do is not need anything
 * else to still be working. The colours are the theme's own, hardcoded — index.css defines them as
 * CSS variables on `:root`, and reading them here would reintroduce the dependency.
 *
 * The old version was unstyled white-on-default inside a dark app, and offered "Refresh Page" as its
 * only way out. That is a TRAP for the case this screen most often exists to handle: when the crash
 * comes from a shared `?s=` link, reloading replays the same URL and lands right back here, forever.
 * "Start fresh" drops the query and is the primary action whenever there is one to drop.
 */
export function ErrorFallback() {
  // Read once, up front: this component must not throw, and `location` is the one thing it touches.
  const fromLink = typeof window !== 'undefined' && window.location.search !== '';
  const clean = () => { window.location.href = window.location.origin + window.location.pathname; };

  const button = (fill: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.1rem', borderRadius: '0.5rem', cursor: 'pointer', font: 'inherit',
    fontSize: '0.95rem', border: '1px solid #40454f',
    background: fill ? '#98849a' : 'transparent', color: fill ? '#17181b' : '#e9e9ed',
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#292c32', color: '#e9e9ed',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '32rem', background: '#2e3138', border: '1px solid #40454f',
        borderRadius: '0.75rem', padding: '2rem', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
          Something went wrong
        </h1>
        <p style={{ margin: '0 0 1.5rem', lineHeight: 1.6, color: '#b9bcc4' }}>
          {fromLink
            ? 'This can happen with a shared link that has been altered or truncated. Reloading would just try the same link again — start fresh instead.'
            : 'The app hit an error it could not recover from. Reloading usually clears it.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {fromLink && <button onClick={clean} style={button(true)}>Start fresh</button>}
          <button onClick={() => window.location.reload()} style={button(!fromLink)}>Reload</button>
        </div>
        <p style={{ margin: '1.5rem 0 0', fontSize: '0.85rem', color: '#8f939c' }}>
          Keeps happening?{' '}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#98849a' }}>
            Tell us on Discord
          </a>
        </p>
      </div>
    </div>
  );
}
