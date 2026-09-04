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
            <div className={LABEL}>Which tab</div>
            <p className={P}>
              <strong className="text-foreground">Plan from scratch</strong> — you have, or can buy, a
              white base.<br />
              <strong className="text-foreground">I have an item</strong> — you are mid-craft and want
              the best move from <em>here</em>.
            </p>
          </div>

          <div className="space-y-1">
            <div className={LABEL}>The two numbers, and why they disagree</div>
            <p className={P}>
              A plan card shows <strong className="text-foreground">chance per attempt</strong> and{' '}
              <strong className="text-foreground">what one run costs</strong> — one fixed script, run
              start to finish. <strong className="text-foreground">True expected cost</strong> answers
              a different question: what the craft costs when you re-decide after every orb, recovering
              in place rather than starting over. It is usually far lower. Both are right.
            </p>
          </div>

          <div className="space-y-1">
            <div className={LABEL}>Tiers run the other way round</div>
            <p className={P}>
              T1 is the <em>best</em> roll, not the worst. And the tier you pick means{' '}
              <strong className="text-foreground">that tier or better</strong> — never exactly that
              tier.
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
