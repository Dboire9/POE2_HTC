import React from 'react';
import type { EnginePriceBasis } from '../../lib/engine';

/**
 * The honesty label for every cost figure in the app.
 *
 * The probabilities here are exact — analytic weight-pool math, differential-tested and cross-checked
 * against Craft of Exile. The COSTS are those probabilities multiplied by a price sheet. Presenting
 * "expected cost: 33.58ex" with no caveat implies a precision the prices may not have, and because the
 * optimizer ranks plans BY cost, stale *relative* prices skew the recommendation itself, not just the
 * total. So wherever a cost is shown, this says where it came from.
 *
 * A sheet can be PART observed and part guessed — the shipped one takes currency and omens from
 * poe.ninja but still hand-authors desecration and essence prices. So when the sheet supplies a
 * `caveat` naming what is estimated, show that instead of the blanket "all hand-authored" wording,
 * which would be its own overclaim in the opposite direction.
 */
const PriceBasisNote: React.FC<{ basis: EnginePriceBasis; className?: string }> = ({ basis, className }) => {
  if (!basis.estimated) {
    return (
      <p className={`text-[11px] text-muted-foreground ${className ?? ''}`}>
        Costs in {basis.unit ?? 'exalt-equivalents'}
        {basis.asOf ? `, prices as of ${basis.asOf}` : ''}.
      </p>
    );
  }
  return (
    <p
      className={`text-[11px] text-amber-300 ${className ?? ''}`}
      title={
        'The crafting odds are exact. Some of the prices they are multiplied by are estimates, so '
        + 'treat costs as ballpark — and note that plans are ranked BY cost, so if your economy '
        + 'differs the recommended plan may differ too.'
      }
    >
      Costs are <strong>partly estimated</strong> — the odds are exact, but{' '}
      {basis.caveat ?? 'the currency prices behind them are hand-authored, not live market data'}
      {basis.asOf ? ` (${basis.asOf})` : ''}
      {basis.patch ? `, patch ${basis.patch}` : ''}. Use them to compare plans, not to budget precisely.
    </p>
  );
};

export default PriceBasisNote;
