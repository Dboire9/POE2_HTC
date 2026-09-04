import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GUIDE_HASH, isGuideHash, useIsGuide, openGuide, closeGuide } from './guideRoute.ts';

beforeEach(() => { window.location.hash = ''; });
afterEach(() => { window.location.hash = ''; });

describe('which view the hash names', () => {
  it('is the guide at #guide', () => {
    expect(isGuideHash(GUIDE_HASH)).toBe(true);
  });

  // The reason `parseGuide` prefixes heading ids at all. With bare GitHub slugs, clicking the guide's
  // own table of contents would set `#getting-started`, which is not the guide, and the reader would
  // be thrown back into the crafting app on their first click.
  it('is still the guide at any of the guide\'s own anchors', () => {
    for (const h of ['#guide-getting-started', '#guide-glossary', '#guide-faq']) {
      expect(isGuideHash(h)).toBe(true);
    }
  });

  it('is the app everywhere else', () => {
    for (const h of ['', '#', '#anything', '#getting-started']) {
      expect(isGuideHash(h)).toBe(false);
    }
  });
});

describe('navigating', () => {
  it('starts on the app', () => {
    const { result } = renderHook(() => useIsGuide());
    expect(result.current).toBe(false);
  });

  it('follows the hash in both directions', () => {
    const { result } = renderHook(() => useIsGuide());

    act(() => { openGuide(); });
    expect(result.current).toBe(true);

    act(() => { closeGuide(); });
    expect(result.current).toBe(false);
  });

  // `closeGuide` uses pushState, which fires NEITHER hashchange nor popstate on its own — the store
  // has to notify itself. A version that only listened would leave the guide on screen forever.
  it('leaves no bare "#" behind when closing', () => {
    act(() => { openGuide(); });
    act(() => { closeGuide(); });
    expect(window.location.hash).toBe('');
  });

  it('re-renders subscribers when the hash changes externally, eg. the back button', () => {
    const { result } = renderHook(() => useIsGuide());
    act(() => {
      window.location.hash = GUIDE_HASH;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe(true);
  });
});
