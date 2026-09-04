import React, { useState } from 'react';
import { DISCORD_URL } from './ReportProblem.tsx';
import { openGuide } from '../../lib/guideRoute.ts';
import { useMode } from '../../lib/workspace';

/**
 * The short orientation panel above the tabs — collapsed by default, and the app's only signpost to
 * the full guide.
 *
 * WHY IT EXISTS. `docs/USER_GUIDE.md` has been thorough for months and nothing in the app linked to
 * it, so it was reachable only by finding the GitHub repo. This is the link, plus the shortest
 * walkthrough that gets someone from an empty page to a plan.
 *
 * IT FOLLOWS THE TAB. The two tabs are different jobs with different controls, and showing both sets
 * of steps at once was a wall a beginner had to filter before starting. `useMode` is the same store
 * the tab bar writes to, so the steps are always the ones for the screen underneath. The other tab is
 * named at the end of the steps rather than hidden, or the panel would teach that it does not exist.
 *
 * IT COVERS THE 🔒/💀/📌 FLAGS, and it is the only thing that does before you use them. The in-place
 * explainers for those are rendered CONDITIONALLY — `fractured.size > 0` on the lab tab,
 * `fracturedIds.size > 0` and `desecratedIds.size > 0` on the item tab — so each one appears only
 * after you have already found the control it describes. That is fine as a reminder and useless as
 * discovery: a player who does not know they can say "this mod is fractured" is exactly the player
 * the condition hides the sentence from.
 *
 * DELIBERATELY SHORT. The app explains itself heavily inline elsewhere; this orients and gets out of
 * the way. Anything needing a paragraph belongs in the guide.
 *
 * IT QUOTES THE UI, so a rename can falsify it. `QUOTED_UI` is the list of strings it lifts verbatim
 * and `UserGuide.test.tsx` checks each against the component that renders it.
 */

/** Every user-visible string this panel quotes from elsewhere in the app. Pinned by a test. */
export const QUOTED_UI = [
  'Plan from scratch',
  'I have an item',
  'Variant',
  'Item level',
  'Rarity',
  'Find plans',
  'Compute plan',
  'Quick currency check',
  'Full plan to a target',
  'chance per attempt',
  'what one run costs',
  'True expected cost',
] as const;

const P = 'text-[11px] leading-relaxed text-muted-foreground';
const LABEL = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const LINK = 'underline underline-offset-2 hover:text-foreground';
const OL = `${P} ml-4 list-decimal space-y-1 marker:text-muted-foreground`;

/** A control named in the copy. Bold, so the words a reader hunts for on screen stand out. */
const UI: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-foreground">{children}</strong>
);

const PlanSteps: React.FC = () => (
  <ol className={OL}>
    <li>
      Pick your <UI>Base</UI> and the <UI>Item level</UI> of the one you will buy — the level is a hard
      gate on which tiers can roll at all. If a <UI>Variant</UI> menu appears, it matters: a cold wand
      cannot roll fire mods.
    </li>
    <li>
      Click mods in the <UI>Prefixes</UI> and <UI>Suffixes</UI> lists to make them targets. Each gets a
      tier selector, and it means <em>that tier or better</em>. Three of each side is the most a Rare
      can hold.
    </li>
    <li>
      Say what is special about a row. <UI>🔒</UI> marks a mod already <em>fractured</em> onto your
      base — it can never be removed or re-rolled, so the plan plays around it instead of starting from
      white. <UI>⊕ or…</UI> lets any one of several mods fill the slot, which is usually the single
      biggest saving available. <UI>📌</UI> protects a mod from being traded away when you set a budget.
    </li>
    <li>
      Press <UI>Find plans</UI> and read what comes back.
    </li>
  </ol>
);

const ItemSteps: React.FC = () => (
  <ol className={OL}>
    <li>
      Set the <UI>Base</UI>, the <UI>Item level</UI> and the <UI>Rarity</UI> of the item in your stash.
    </li>
    <li>
      Add the mods it already has — and give each one <em>the tier it is actually rolled at</em>. The
      selectors default to T1, so an item entered without checking them is described as better than it
      is, and the plan you get back will be too cheap.
    </li>
    <li>
      Flag the mods that are not ordinary. <UI>🔒</UI> for a <em>fractured</em> mod, which nothing can
      remove or re-roll. <UI>💀</UI> for one a <em>Desecration</em> placed — an item carries one such
      mod at a time, and while it does, another bone will not touch the item. Both change what your
      orbs can hit, so both change the route.
    </li>
    <li>
      Then <UI>Quick currency check</UI> for “what would one orb do?”, or <UI>Full plan to a target</UI>{' '}
      — say what the item should end up as and press <UI>Compute plan</UI>.
    </li>
  </ol>
);

const UserGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode] = useMode();
  const onItem = mode === 'item';

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
            <div className={LABEL}>
              {onItem ? 'I have an item — start to finish' : 'Plan from scratch — start to finish'}
            </div>
            {onItem ? <ItemSteps /> : <PlanSteps />}
            <p className={`${P} pt-1`}>
              {onItem
                ? <>Starting from a white base instead? Switch to <UI>Plan from scratch</UI> and these
                  steps change with it.</>
                : <>Already holding a part-crafted item? Switch to <UI>I have an item</UI> and these
                  steps change with it.</>}
            </p>
          </div>

          <div className="space-y-1">
            <div className={LABEL}>Reading what comes back</div>
            <p className={P}>
              The plan cards are a <em>script</em> — a fixed sequence you can follow without checking
              back. Each shows <UI>chance per attempt</UI> and <UI>what one run costs</UI> for one run
              of it. <UI>True expected cost</UI> answers a different question: what the craft costs when
              you re-decide after every orb instead of following a script. It is usually far lower, and
              both numbers are right.
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
