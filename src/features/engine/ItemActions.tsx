import React from 'react';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import QuickCurrencyCheck from './QuickCurrencyCheck';
import YourItemCard from './YourItemCard';
import ItemFullPlan from './ItemFullPlan';
import ItemResults from './ItemResults';
import { FOCUS_RING } from './ui';
import { useItemCraft } from './useItemCraft';

export { ItemWorth } from './ItemWorth';

/** The "I have an item" tab: the item you hold, then either the Quick currency check or a full plan. */
const ItemActions: React.FC = () => {
  const it = useItemCraft();
  const { engine, loadErr, subMode, setSubMode, item, checkAddable, itemMods, rates } = it;

  if (loadErr) {
    return (
      <Card className="p-6">
        <p className="text-destructive font-medium">Failed to load engine data</p>
        <p className="text-sm text-muted-foreground mt-1">{loadErr}</p>
      </Card>
    );
  }
  if (!engine) {
    // Same wrap, same reason as EngineLab's loading state — see the note there.
    return (
      <div className="flex items-center gap-3 p-8 text-muted-foreground">
        <Spinner /><span>Loading patch data…</span>
      </div>
    );
  }

  const subTabCls = (active: boolean) =>
    `px-3 py-1.5 rounded ${active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="space-y-4">
      <YourItemCard it={it} />

      {/* Sub-mode toggle */}
      <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm">
        <button
          className={`${subTabCls(subMode === 'check')} ${FOCUS_RING}`}
          onClick={() => setSubMode('check')}
          aria-pressed={subMode === 'check'}
        >
          Quick currency check
        </button>
        <button
          className={`${subTabCls(subMode === 'plan')} ${FOCUS_RING}`}
          onClick={() => setSubMode('plan')}
          aria-pressed={subMode === 'plan'}
        >
          Full plan to a target
        </button>
      </div>

      {subMode === 'check' ? (
        <QuickCurrencyCheck engine={engine} item={item} addable={checkAddable} itemMods={itemMods} rates={rates} />
      ) : (
        <>
          <ItemFullPlan it={it} />
          <ItemResults it={it} />
        </>
      )}
    </div>
  );
};

export default ItemActions;
