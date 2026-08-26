import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorFallback } from './ErrorFallback';
import { ErrorBoundary } from './lib/sentry';

/**
 * This pair is the app's last line of defence, so the bar is different from other components: it has
 * to work when everything around it has already failed. That is also why it was worth extracting
 * from main.tsx, which calls `createRoot` at import time and so cannot be loaded by a test at all.
 */

const setUrl = (href: string) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: new URL(href) as unknown as Location,
  });
};
const origin = window.location.href;
afterEach(() => setUrl(origin));

describe('ErrorBoundary', () => {
  const Boom = (): never => { throw new Error('kaboom'); };

  // React logs the caught error to console.error; that is expected here and only noise.
  let quiet: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { quiet = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => quiet.mockRestore());

  it('renders its children when nothing is wrong', () => {
    render(<ErrorBoundary fallback={<p>fallback</p>}><p>the app</p></ErrorBoundary>);
    expect(screen.getByText('the app')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('swaps in the fallback when a child throws', () => {
    render(<ErrorBoundary fallback={<p>fallback</p>}><Boom /></ErrorBoundary>);
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  // Reporting is a nice-to-have; the screen the user is looking at is not. With no DSN configured
  // `reportError` returns immediately, and the boundary must still render rather than throw from
  // inside componentDidCatch — a throw there takes down the tree the boundary exists to protect.
  it('still renders the fallback when reporting is switched off', () => {
    expect(() => render(<ErrorBoundary fallback={<p>fallback</p>}><Boom /></ErrorBoundary>)).not.toThrow();
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });
});

describe('ErrorFallback', () => {
  /**
   * The bug this screen used to have. Its only action was "Refresh Page", which for the case it most
   * often handles — a shared `?s=` link that is altered or truncated — replays the same URL and
   * lands straight back on this screen. A dead end with a button that promises otherwise.
   */
  it('offers a way OUT of a bad link, not just a reload', async () => {
    setUrl('https://poe2htc.com/?s=corrupt-payload');
    render(<ErrorFallback />);

    const escape = screen.getByRole('button', { name: /start fresh/i });
    await userEvent.click(escape);

    expect(window.location.href).toBe('https://poe2htc.com/');   // the query is gone
    expect(window.location.href).not.toContain('s=');
  });

  it('explains that the link is the likely cause when there is one', () => {
    setUrl('https://poe2htc.com/?s=corrupt-payload');
    render(<ErrorFallback />);
    expect(screen.getByText(/shared link/i)).toBeInTheDocument();
  });

  // No query means the link is not the suspect, so offering to strip it would be noise — and
  // "Reload" really is the useful action for a transient failure.
  it('offers only a reload when the URL is clean', () => {
    setUrl('https://poe2htc.com/');
    render(<ErrorFallback />);
    expect(screen.queryByRole('button', { name: /start fresh/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('always offers somewhere to report it', () => {
    setUrl('https://poe2htc.com/');
    render(<ErrorFallback />);
    const link = screen.getByRole('link', { name: /discord/i });
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
