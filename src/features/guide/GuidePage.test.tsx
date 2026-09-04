import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuidePage from './GuidePage';

// Rendered against the REAL docs/USER_GUIDE.md — vitest.config.ts registers the same `user-guide`
// plugin the build uses, so these assertions are about the document that actually ships.

beforeEach(() => {
  window.location.hash = '';
  vi.restoreAllMocks();
  // jsdom implements neither; the page calls one of them on mount to handle deep links.
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('the guide page', () => {
  it('renders the guide, headings and all', () => {
    render(<GuidePage />);
    expect(screen.getByRole('heading', { level: 1, name: /User Guide/i })).toBeInTheDocument();
    // A couple of section headings that would only be here if the whole document rendered.
    expect(screen.getByRole('heading', { name: /^Glossary$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Troubleshooting/i })).toBeInTheDocument();
  });

  it('gives every heading an id, so the contents list can reach it', () => {
    const { container } = render(<GuidePage />);
    const headings = [...container.querySelectorAll('h1, h2, h3')];
    expect(headings.length).toBeGreaterThan(20);
    for (const h of headings) expect(h.id).toMatch(/^guide-/);
  });

  it('has no in-page link pointing at a heading it did not render', () => {
    const { container } = render(<GuidePage />);
    const ids = new Set([...container.querySelectorAll('[id]')].map((el) => el.id));
    const dead = [...container.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href')!.slice(1))
      .filter((id) => !ids.has(id));
    expect([...new Set(dead)]).toEqual([]);
  });

  // THE mobile constraint. e2e test 5 asserts zero horizontal overflow at 390px, and this document
  // is mostly tables — several of them wider than a phone. The table scrolls, not the page.
  it('wraps every table in a horizontally scrollable box', () => {
    const { container } = render(<GuidePage />);
    const tables = [...container.querySelectorAll('table')];
    expect(tables.length).toBeGreaterThan(5);
    for (const t of tables) {
      expect(t.parentElement?.className).toContain('overflow-x-auto');
    }
  });

  it('opens external links in a new tab, and keeps anchors in the page', () => {
    const { container } = render(<GuidePage />);
    for (const a of container.querySelectorAll('a')) {
      const href = a.getAttribute('href') ?? '';
      if (href.startsWith('#')) {
        expect(a).not.toHaveAttribute('target');
      } else {
        expect(a).toHaveAttribute('target', '_blank');
        // Every outbound link needs this; `target=_blank` without it hands the opener away.
        expect(a.getAttribute('rel')).toContain('noopener');
      }
    }
  });

  it('rewrote the repo-relative doc links to absolute ones', () => {
    const { container } = render(<GuidePage />);
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    // `ALGORITHM.md` is a relative link in the file and 404s at poe2htc.com if it ships unchanged.
    expect(hrefs.some((h) => h.endsWith('/docs/ALGORITHM.md'))).toBe(true);
    expect(hrefs.some((h) => h === 'ALGORITHM.md')).toBe(false);
  });

  it('renders the guide\'s caveat callouts, rather than dropping them', () => {
    const { container } = render(<GuidePage />);
    // The Alloys caveat — the app enforces a limit the data does not confirm, and saying so is the
    // point of the box.
    expect(container.textContent).toContain('stated as what the app does');
    expect(container.querySelectorAll('.border-sky-500\\/50').length).toBeGreaterThan(0);
  });

  it('offers a way back to the app', async () => {
    const user = userEvent.setup();
    window.location.hash = '#guide';
    render(<GuidePage />);
    await user.click(screen.getByRole('button', { name: /Back to the app/i }));
    expect(window.location.hash).toBe('');
  });

  // The page is lazily loaded, so at navigation time the anchor does not exist yet and the browser's
  // own scroll silently does nothing.
  it('scrolls to a deep-linked heading once the content exists', () => {
    window.location.hash = '#guide-glossary';
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<GuidePage />);
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
