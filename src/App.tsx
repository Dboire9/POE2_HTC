import React, { Suspense, lazy, useState } from 'react';
import { Toaster } from './components/ui/toaster';
import EngineLab from './features/engine/EngineLab';
import ReportProblem, { DISCORD_URL, PANEL_ID } from './features/engine/ReportProblem';
// Read from the manifest rather than restated here, because the two HAVE drifted: for three commits
// around `d866713` the header told users 0.5.9 while the package — which is what the release workflow
// tags and names its artifact from — said 0.9.0. A hardcoded string makes the version a player sees
// the one thing in a release that nothing checks. Vite emits JSON named exports as individual
// bindings, so this inlines the string; the manifest itself is not in the bundle (verified).
import { version } from '../package.json';
import { useIsGuide } from './lib/guideRoute';

// The guide is ~30 kB of prose that most visits never open, and the entry chunk is the thing
// `preloadPatchData` exists to keep small — so it loads on demand, like the Sentry SDK.
const GuidePage = lazy(() => import('./features/guide/GuidePage'));

/** Shared chip styling for the header actions — one place, so they can't drift apart. */
const CHIP = 'flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md border transition-all cursor-pointer '
  + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

// Open a link in a new tab. This used to route through an Electron bridge when one was present; the
// app ships as a web page only now, so there is just the one path.
const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function App() {
  const [reporting, setReporting] = useState(false);
  const showGuide = useIsGuide();
  return (
    <div className="min-h-screen text-foreground bg-background">
      <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
        <div className="container flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                POE2HTC
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Path of Exile 2 How to Craft</p>
            </div>
          </div>

          {/* WRAPS, never disappears. This block used to be `hidden md:flex`, so on a phone there
              was no Discord link and no way to report a bug — the exact loop the app depends on
              while it is gathering feedback. The chips stay at every width; their words come back at
              `sm`/`lg`.

              Every control carries an explicit aria-label because of that: these buttons took their
              accessible name from text like "💬 Join Discord", and hiding the words would collapse
              the name to "💬". The emoji is aria-hidden and the name is stated. */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 text-xs text-muted-foreground">
            <button
              onClick={() => openExternalLink('https://github.com/Dboire9')}
              className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
              aria-label="Created by Dboire — open the author's GitHub profile"
            >
              <span className="text-xs uppercase tracking-wider opacity-70 hidden lg:inline">Created by</span>
              <span className="font-medium text-sm">Dboire</span>
            </button>
            <button
              onClick={() => setReporting((r) => !r)}
              className={`${CHIP} bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50`}
              aria-label="Report a problem"
              aria-expanded={reporting}
              aria-controls={PANEL_ID}
            >
              <span aria-hidden="true">🐛</span>
              <span className="hidden sm:inline">Report a problem</span>
            </button>
            <button
              onClick={() => openExternalLink(DISCORD_URL)}
              className={`${CHIP} bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 hover:border-indigo-500/50`}
              aria-label="Join the Discord community"
            >
              <span aria-hidden="true">💬</span>
              <span className="hidden sm:inline">Discord</span>
            </button>
            <button
              onClick={() => openExternalLink('https://buymeacoffee.com/dboire')}
              className={`${CHIP} bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 hover:border-yellow-500/50`}
              aria-label="Support the project"
            >
              <span aria-hidden="true">☕</span>
              <span className="hidden lg:inline">Support</span>
            </button>
            <button
              onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC')}
              className={`${CHIP} bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary/50`}
              aria-label={`Version ${version} — open the project on GitHub`}
            >
              <span className="font-mono font-semibold leading-none">v{version}</span>
              <span className="opacity-30 leading-none hidden lg:inline">|</span>
              <span className="hidden lg:inline">⭐ Star &amp; Contribute</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-3 sm:py-4 px-3 sm:px-4 space-y-3">
        {showGuide && (
          <Suspense fallback={<p className="text-xs text-muted-foreground">Loading the guide…</p>}>
            <GuidePage />
          </Suspense>
        )}
        {/* HIDDEN, never unmounted. A computed plan and an in-flight Web Worker solve live in
            EngineLab's state, so unmounting it to show the guide would throw away a solve that may
            have been running for minutes — for the sake of reading a paragraph.

            Attribute AND class, saying the same thing twice on purpose: the attribute is what the
            browser's UA stylesheet and jsdom both honour (so `toBeVisible()` means something in the
            tests), and Tailwind's utility is the guard in case a stylesheet ever overrides
            `[hidden]`. Nothing else on this element sets `display`, so they cannot disagree. */}
        <div hidden={showGuide} className={showGuide ? 'hidden' : undefined}>
          <div className="space-y-3">
            <ReportProblem version={version} open={reporting} onClose={() => setReporting(false)} />
            <EngineLab />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
