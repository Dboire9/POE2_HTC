import React, { Suspense, lazy, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { decodeWorkspace, getWorkspace, setWorkspace, useMode } from '../../lib/workspace';
import { toast } from 'sonner';
import StreamerGear from './StreamerGear';
import ItemActions from './ItemActions';
// Lazy, like the guide: the Tablets tab brings its own data (weights, trade ids, the curated list) and
// a player who never opens it should not download them.
const TabletsTab = lazy(() => import('../tablets/TabletsTab'));
import UserGuide from './UserGuide';
import LabSetup from './LabSetup';
import LabTargets from './LabTargets';
import ExampleCrafts from './ExampleCrafts';
import LabResults from './LabResults';
import { FOCUS_RING } from './ui';
import { useDefaultBase, useEngine } from './useEngine';
import { useLabCraft } from './useLabCraft';

/**
 * The app's one view: the tab bar, and whichever tab is open.
 *
 * It also owns the Plan tab's state (`useLabCraft`), because this component never unmounts — see there.
 */
const EngineLab: React.FC = () => {
  const { engine, loadErr } = useEngine(useDefaultBase('lab'));
  const data = engine?.data ?? null;
  const lab = useLabCraft(engine);
  const [mode, setMode] = useMode();

  // A shared link wins over whatever was saved locally — you clicked it expecting to see that item —
  // but never silently: the previous workspace is snapshotted so the toast can put it back.
  useEffect(() => {
    if (!data) return; // ids can only be validated once the patch data is loaded
    const payload = new URLSearchParams(window.location.search).get('s');
    if (!payload) return;
    // Drop `?s=` immediately, so a later reload doesn't re-apply a stale link over newer work.
    window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    const decoded = decodeWorkspace(payload, data);
    if (!decoded) {
      toast.error('That link could not be read', { description: 'It looks truncated or is from a newer version.' });
      return;
    }
    const previous = getWorkspace();
    setWorkspace(decoded.workspace);
    const missing = decoded.dropped.length;
    toast.success('Loaded from link', {
      description: missing > 0
        // "mods" was wrong: `dropped` can also hold a base id this build doesn't have. Counting a base
        // as a mod sends the reader looking for a missing modifier that was never the problem.
        ? `${missing} entr${missing === 1 ? 'y' : 'ies'} in the link aren’t part of this build and were left out.`
        : undefined,
      action: { label: 'Undo', onClick: () => setWorkspace(previous) },
    });
  }, [data]);

  if (loadErr) {
    return (
      <Card className="p-6">
        <p className="text-destructive font-medium">Failed to load engine data</p>
        <p className="text-sm text-muted-foreground mt-1">{loadErr}</p>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center gap-3 p-8 text-muted-foreground">
        {/* The label is WRAPPED, and there is no bare text node beside the spinner — `gap-3`
              supplies the space that a literal one used to. Chrome and Edge translate a page by
              REPLACING each text node with a <font> element of their own. React still holds a
              reference to the text node it rendered, so when the data lands and this whole block is
              swapped for the app, `removeChild` is handed a node that is no longer a child and the
              boundary takes the page down. Reported from production 2026-09-04 by an Edge/zh-CN
              reader; the text inside an element gets rewritten in place instead, and the element
              React removes is still there. */}
        <Spinner /><span>Loading patch data…</span>
      </div>
    );
  }

  const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded ${active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="space-y-4">
      <UserGuide />

      <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        <button
          className={`${tabCls(mode === 'plan')} ${FOCUS_RING}`}
          onClick={() => setMode('plan')}
          aria-pressed={mode === 'plan'}
        >
          Plan from scratch
        </button>
        <button
          className={`${tabCls(mode === 'item')} ${FOCUS_RING}`}
          onClick={() => setMode('item')}
          aria-pressed={mode === 'item'}
        >
          I have an item
        </button>
        {/* A tablet is crafted with the same orbs and nothing else on this screen applies to it — no
            item level, no runes, no essences — so it gets its own tab rather than a fourth shape for
            these controls to take. */}
        <button
          className={`${tabCls(mode === 'tablets')} ${FOCUS_RING}`}
          onClick={() => setMode('tablets')}
          aria-pressed={mode === 'tablets'}
        >
          Tablets{' '}
          {/* Shipped 2026-09-23: new enough that a returning player should notice it is there. */}
          <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            New
          </span>
        </button>
        {/* Browsing gear is not crafting, so it gets its own tab rather than a third panel stacked
            above the Item tab's pickers. Picking an item there lands on `I have an item`. */}
        <button
          className={`${tabCls(mode === 'gear')} ${FOCUS_RING}`}
          onClick={() => setMode('gear')}
          aria-pressed={mode === 'gear'}
        >
          Streamer gear
          {/* Marked BETA because it ships unfinished, on purpose: a few streamers, a snapshot we
              refresh by hand, and reads that are approximate in named places (Sanctified rolls). The
              word is visible text, so it is also in the button's accessible name — a screen reader
              hears the same caveat a sighted player sees. */}
          <span className="ml-1.5 rounded border border-amber-500/50 bg-amber-500/10 px-1 py-px align-middle text-[9px] font-semibold uppercase tracking-wider text-amber-300">
            Beta
          </span>
        </button>
      </div>

      {mode === 'item' ? <ItemActions />
        : mode === 'tablets' ? <Suspense fallback={<Spinner />}><TabletsTab /></Suspense>
        : mode === 'gear' ? <StreamerGear data={data} />
        : (<>
          <LabSetup lab={lab} />
          <LabTargets lab={lab} />
          <ExampleCrafts lab={lab} />
          <LabResults lab={lab} />
        </>)}
    </div>
  );
};

export default EngineLab;
