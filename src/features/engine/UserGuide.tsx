import React, { useState } from 'react';
import { DISCORD_URL } from './ReportProblem.tsx';
import { openGuide } from '../../lib/guideRoute.ts';

/**
 * The short orientation panel above the tabs — collapsed by default, and the app's only signpost to
 * the full guide.
 *
 * WHY IT EXISTS. `docs/USER_GUIDE.md` has been thorough for months and nothing in the app linked to
 * it, so it was reachable only by finding the GitHub repo. This is the link, plus the four things a
 * first-time reader most needs before the rest of the page makes sense.
 *
 * DELIBERATELY SHORT. The app already explains itself heavily inline — an explainer paragraph under
 * most panels, `title=` on most controls, empty states that teach. This is not another one of those;
 * it orients and then gets out of the way. Anything that needs a paragraph belongs in the guide.
 *
 * IT QUOTES THE UI, so it can go stale in a way prose about mechanics cannot: rename a tab and this
 * panel starts describing a screen that no longer exists. `QUOTED_UI` is the list of strings it
 * lifts verbatim, and `UserGuide.test.tsx` checks each one is still on screen somewhere.
 */

/** Every user-visible string this panel quotes from elsewhere in the app. Pinned by a test. */
export const QUOTED_UI = [
  'Plan from scratch',
  'I have an item',
  'Variant',
  'Item level',
  'Find plans',
  'Quick currency check',
  'Full plan to a target',
  'chance per attempt',
  'what one run costs',
  'True expected cost',
] as const;

const P = 'text-[11px] leading-relaxed text-muted-foreground';
const LABEL = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const LINK = 'underline underline-offset-2 hover:text-foreground';

const UserGuide: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-expanded={open}
      >
        <span className={LABEL}>
          <span aria-hidden="true">📖</span> New here? How to use this
        </span>
        <span className="text-xs text-muted-foreground">
          {open ? 'hide' : 'read the guide'}{' '}
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-2">
          <p className={P}>
            Tell it what item you want. It works out how to craft it and what that will cost — exact
            probability maths over the real 0.5.0 modifier pools, priced from a live poe.ninja sheet.
          </p>

          <div className="space-y-1">
            <div className={LABEL}>Start from a white base</div>
            <ol className={`${P} ml-4 list-decimal space-y-1 marker:text-muted-foreground`}>
              <li>
                Stay on <strong className="text-foreground">Plan from scratch</strong>. Pick your{' '}
                <strong className="text-foreground">Base</strong> and the{' '}
                <strong className="text-foreground">Item level</strong> of the one you will buy — the
                level is a hard gate on which tiers can roll at all. If a{' '}
                <strong className="text-foreground">Variant</strong> menu appears, it matters: a cold
                wand cannot roll fire mods.
              </li>
              <li>
                Click mods in the <strong className="text-foreground">Prefixes</strong> and{' '}
                <strong className="text-foreground">Suffixes</strong> lists to make them targets. Each
                one gets a tier selector, and it means <em>that tier or better</em>. Three of each side
                is the most a Rare can hold.
              </li>
              <li>
                Press <strong className="text-foreground">Find plans</strong> and read what comes back.
              </li>
            </ol>
          </div>

          <div className="space-y-1">
            <div className={LABEL}>Or start from an item you are holding</div>
            <p className={P}>
              On <strong className="text-foreground">I have an item</strong>, enter the mods it already
              has <em>at the tiers they are actually rolled at</em> — the selectors default to T1, so an
              item entered without checking them is described as better than it is. Then{' '}
              <strong className="text-foreground">Quick currency check</strong> answers “what does one
              orb do?”, and <strong className="text-foreground">Full plan to a target</strong> answers
              “get me from here to that”.
            </p>
          </div>

          <div className="space-y-1">
            <div className={LABEL}>Reading what comes back</div>
            <p className={P}>
              The plan cards are a <em>script</em> — a fixed sequence you can follow without checking
              back. Each shows <strong className="text-foreground">chance per attempt</strong> and{' '}
              <strong className="text-foreground">what one run costs</strong> for one run of it.{' '}
              <strong className="text-foreground">True expected cost</strong> answers a different
              question: what the craft costs when you re-decide after every orb instead of following a
              script. It is usually far lower, and both numbers are right.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={openGuide}
              className="text-xs font-medium text-primary underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Read the full guide →
            </button>
            <a
              href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
              className={`text-xs text-muted-foreground ${LINK}`}
            >
              Ask on Discord
            </a>
            <span className="text-[11px] text-muted-foreground">
              — something wrong? Use <span aria-hidden="true">🐛</span> Report a problem, up top.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGuide;
