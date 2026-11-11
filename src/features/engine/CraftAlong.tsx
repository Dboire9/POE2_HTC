import React, { useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { locateItem, stepFor, type Engine, type EngineMarkovResult } from '../../lib/engine';
import type { ImportedItem } from '../../lib/engineTypes';
import type { EnginePolicyEdge, EnginePolicyNode } from '../../lib/engineTypes';
import { formatBoundedCost, formatChance, formatIn, pickUnit, type Rates } from '../../lib/currency';
import { advance, jump, readSession, startSession, undo, writeSession, type CraftSession, type CraftTab } from '../../lib/craftAlong';
import { START_OVER, describeItem, outcomeWords } from '../../lib/stateWords';
import { FOCUS_RING } from './ui';
import PasteItem from './PasteItem';

/** One outcome as a button: what it did, and how often it happens. */
const Outcome: React.FC<{
  node: EnginePolicyNode;
  next: EnginePolicyNode | undefined;
  edge: EnginePolicyEdge;
  odds: string;
  onPick: () => void;
}> = ({ node, next, edge, odds, onPick }) => (
  <button
    type="button"
    onClick={onPick}
    className={cn(
      'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent',
      // A brick — an outcome that leaves the item further from done — reads apart at a glance.
      edge.regress ? 'border-amber-500/50' : next?.isGoal ? 'border-emerald-500/60' : 'border-border',
      FOCUS_RING,
    )}
  >
    <span>{outcomeWords(node, next, edge)}</span>
    <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{odds}</span>
  </button>
);

/**
 * Craft along: follow the plan with the game open, one move at a time.
 *
 * The solve already holds the next move for every state the item can be in (`markov.routes`), so this
 * solves nothing. It shows the move for where the item is; the player plays it in game and picks what
 * happened; the next move is a lookup. What was spent is added up at the plan's average price for each
 * move. Kept per browser (`craftAlong.ts`): close the tab mid-craft, solve the same craft again, and it
 * picks up where it was.
 *
 * A Desecration is the one move where the player chooses — it offers three modifiers and one is kept —
 * so there it lists what to keep, best first, and where the plan rerolls with an Omen of Abyssal
 * Echoes, the line to reroll below. The odds shown already assume both rules are followed.
 */
const CraftAlong: React.FC<{
  engine: Engine;
  markov: EngineMarkovResult;
  tab: CraftTab;
  /** Which craft this is (`craftSig`): a session saved for another craft is not resumed. */
  sig: string;
  rates: Rates | undefined;
  /** What the start is called when it is a bare base: "A white base". */
  plain: string;
}> = ({ engine, markov, tab, sig, rates, plain }) => {
  const t = markov.routes;
  const [session, setSession] = useState<CraftSession | null>(null);
  const [resumed, setResumed] = useState(false);
  // What the last paste did: moved the session, or why it could not. Cleared by the next move.
  const [pasted, setPasted] = useState<{ readonly ok: boolean; readonly text: string } | null>(null);
  const step = useMemo(() => (session ? stepFor(engine, markov, session.key) : null), [engine, markov, session]);
  if (!t) return null;
  // The craft's start — read only once the panel is open, which is when the table is first needed.
  const startOf = (): string => t.keys[t.restartIdx]!;

  const unit = pickUnit(markov.expectedCost, rates);
  const fmt = (ex: number): string => formatIn(unit, ex);
  // What finishing costs, read from the plan's values. On a solve that stopped early those values are a
  // CEILING's (markovFromItem attaches such a plan only once it is checked to finish), so they say "≤".
  const bounded = markov.bound !== 'exact';
  const toFinish = (ex: number): string => (bounded ? formatBoundedCost(markov.bound, ex, rates) : fmt(ex));
  const save = (s: CraftSession): void => { setSession(s); writeSession(tab, s); };
  const open = (): void => {
    const saved = readSession(tab, sig);
    // A saved place in a craft whose states have since changed (new game data) cannot be found again.
    const usable = saved && t.keys.includes(saved.key as (typeof t.keys)[number]) ? saved : undefined;
    setResumed(usable !== undefined && usable.history.length > 0);
    save(usable ?? startSession(sig, startOf()));
  };

  if (!session || !step) {
    return (
      <button
        type="button"
        onClick={open}
        className={cn('w-full rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-left hover:bg-primary/10', FOCUS_RING)}
      >
        <span className="text-sm font-medium text-primary">Craft along</span>
        <span className="block text-[11px] text-muted-foreground">
          Follow this plan move by move with the game open: it shows the next orb, you pick what happened,
          and it keeps count of what you have spent.
        </span>
      </button>
    );
  }

  const node = step.nodes[0]!;
  const byKey = new Map(step.nodes.map((n) => [n.key, n]));
  const nextOf = (e: EnginePolicyEdge): EnginePolicyNode | undefined => byKey.get(e.to);
  const cost = node.actionCost ?? 0;
  const pick = (e: EnginePolicyEdge) => (): void => { setResumed(false); setPasted(null); save(advance(session, e.to, cost)); };
  /** Pick up from the item the player pasted, wherever it is in the plan. */
  const fromPaste = (item: ImportedItem): void => {
    const at = locateItem(engine, markov, item);
    if (!at.ok) { setPasted({ ok: false, text: at.reason }); return; }
    setResumed(false);
    save(jump(session, at.key));
    setPasted({
      ok: true,
      text: 'Moved to the item you pasted. What happened since your last click is not in what you have spent.'
        + (at.level !== undefined ? ` It is item level ${at.level}; this plan was worked out for another, so its odds may differ.` : ''),
    });
  };
  const moves = session.history.length;
  const startOver = node.action === START_OVER;

  let body: React.ReactNode;
  if (node.isGoal) {
    body = (
      <p className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
        ✓ <strong>Finished.</strong> You spent about {fmt(session.spent)}; the plan put this craft at{' '}
        {toFinish(markov.expectedCost)} on average.
      </p>
    );
  } else if (startOver) {
    body = (
      <>
        <p>
          Next: <strong>bin this item and start again on a new base</strong>
          <span className="text-muted-foreground"> (about {fmt(cost)})</span> — finishing this one would cost
          more than starting over.
        </p>
        {step.edges[0] && (
          <Button size="sm" onClick={pick(step.edges[0])}>Done — I have a new base</Button>
        )}
      </>
    );
  } else if (node.keepsOne) {
    // Best first: the plan keeps whichever of the three is cheapest to finish from.
    const ranked = [...step.edges].sort((a, b) => (nextOf(a)?.expectedCost ?? node.expectedCost) - (nextOf(b)?.expectedCost ?? node.expectedCost));
    const line = node.rerollAbove;
    const firstBelow = line === undefined ? -1 : ranked.findIndex((e) => (nextOf(e)?.expectedCost ?? node.expectedCost) > line);
    body = (
      <>
        <p>
          Next: <strong>{node.action}</strong><span className="text-muted-foreground"> (about {fmt(cost)})</span>
        </p>
        <p className="text-xs text-muted-foreground">
          It offers three modifiers and you keep one. Keep the <strong>first of these that is on offer</strong>,
          then pick it here:
        </p>
        <div className="flex flex-col gap-1.5">
          {ranked.map((e, i) => (
            <React.Fragment key={e.to}>
              {i === firstBelow && (
                <p className="rounded-md border border-dashed border-sky-500/60 px-3 py-1.5 text-[11px] text-sky-700 dark:text-sky-300">
                  ↻ All three below this line? Throw them back with the <strong>Omen of Abyssal Echoes</strong>, then
                  keep the best of the new three.
                </p>
              )}
              <Outcome node={node} next={nextOf(e)} edge={e} odds={`kept ${formatChance(e.prob)}`} onPick={pick(e)} />
            </React.Fragment>
          ))}
        </div>
      </>
    );
  } else {
    const likeliest = [...step.edges].sort((a, b) => b.prob - a.prob);
    body = (
      <>
        <p>
          Next: <strong>{node.action}</strong><span className="text-muted-foreground"> (about {fmt(cost)})</span>
        </p>
        <p className="text-xs text-muted-foreground">Use it in game, then pick what happened:</p>
        <div className="flex flex-col gap-1.5">
          {likeliest.map((e) => (
            <Outcome key={e.to} node={node} next={nextOf(e)} edge={e} odds={formatChance(e.prob)} onPick={pick(e)} />
          ))}
        </div>
      </>
    );
  }

  return (
    <section aria-label="Craft along" className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Craft along</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => { setResumed(false); setPasted(null); save(undo(session)); }} disabled={moves === 0}>
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setResumed(false); setPasted(null); save(startSession(sig, startOf())); }} disabled={moves === 0}>
            Start again
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSession(null)}>Hide</Button>
        </div>
      </div>
      {bounded && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          {markov.withoutBones
            ? <>This is the plan <strong>without Desecration</strong>: the solver ran out of time before the craft settled
              with bones, which could only make it cheaper. Every cost to finish here is a ceiling.</>
            : <>The solver stopped before proving this plan the cheapest. It is a plan that finishes, and every cost to
              finish here is a ceiling.</>}
        </p>
      )}
      <p className="text-xs text-muted-foreground" role="status">
        {resumed && <>Picked up where you left off. </>}
        Spent so far <strong className="tabular-nums text-foreground">{fmt(session.spent)}</strong> over {moves}{' '}
        move{moves === 1 ? '' : 's'}
        {!node.isGoal && <> · still to spend <strong className="tabular-nums text-foreground">{toFinish(node.expectedCost)}</strong> on average</>}
        {' '}— each move counted at the plan’s average price for it.
      </p>
      <p>Your item: <strong>{describeItem(node, plain)}</strong></p>
      {pasted && (
        <p className={cn('text-xs', pasted.ok ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-300')} role="status">
          {pasted.text}
        </p>
      )}
      {body}
      {/* Lost your place — a mis-click, a break, a few orbs used without clicking: paste the item. */}
      <PasteItem
        data={engine.data} onApply={fromPaste} inputId="paste-craft-along" applyLabel="This is my item now"
        applyNote="Craft along picks up from this item." requireSettled
      />
      <p className="text-[11px] text-muted-foreground">
        Lost your place? Paste the item from the game and Craft along picks up from it. To go back to where
        the plan began, use <strong>Start again</strong>.
      </p>
    </section>
  );
};

export default CraftAlong;
