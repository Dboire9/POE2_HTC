import { useSyncExternalStore } from 'react';
import { ANCHOR_PREFIX } from './guide/guideTypes.ts';

/**
 * Which of the two views the app is showing, read off `location.hash`.
 *
 * NOT A ROUTER. The app has exactly two views — the crafting lab and the user guide — and adding
 * react-router for that would mean a dependency, a Vercel rewrite (`vercel.json` has no rewrites at
 * all today) and a change to `e2e/serve-dist.mjs`, which deliberately 404s rather than falling back
 * to index.html. A hash needs none of those and is still shareable and back-button-correct.
 *
 * `#guide-<anchor>` counts as the guide too, which is what lets the guide's own table of contents
 * scroll with native anchors without the reader being thrown back into the app on the first click.
 * That is also why `parseGuide` prefixes every heading id rather than using the bare GitHub slug.
 */
export const GUIDE_HASH = '#guide';

export function isGuideHash(hash: string): boolean {
  return hash === GUIDE_HASH || hash.startsWith(`#${ANCHOR_PREFIX}`);
}

const listeners = new Set<() => void>();
let current = typeof window === 'undefined' ? '' : window.location.hash;

const notify = (): void => {
  current = window.location.hash;
  for (const l of listeners) l();
};

// BOTH events, because neither covers this on its own: `hashchange` misses the `pushState` in
// `closeGuide`, and `popstate` is what fires when the reader presses Back to return to the guide.
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', notify);
  window.addEventListener('popstate', notify);
}

/** Navigate, pushing history so Back leaves the guide the way a reader expects.
 *
 *  `notify()` explicitly rather than waiting for the `hashchange` this assignment queues: that event
 *  is asynchronous, so the view would otherwise switch a tick after the click. The later event calls
 *  `notify` again with the same hash, and `useSyncExternalStore` sees an unchanged snapshot and does
 *  not re-render — so the extra call costs nothing. */
export function openGuide(): void {
  window.location.hash = GUIDE_HASH;
  notify();
}

export function closeGuide(): void {
  // `pushState` rather than setting `hash = ''`, which leaves a bare "#" in the URL bar.
  window.history.pushState(null, '', window.location.pathname + window.location.search);
  notify();
}

/** True while the guide is the visible view. Re-renders on navigation. */
export function useIsGuide(): boolean {
  const hash = useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => listeners.delete(onChange); },
    () => current,
    () => '', // server snapshot — there is no SSR here, and the app is never the guide on first paint
  );
  return isGuideHash(hash);
}
