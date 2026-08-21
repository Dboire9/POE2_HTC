import React from 'react';
import type { EnginePriceBasis } from '../../lib/engine';

/**
 * The honesty label for every cost figure in the app.
 *
 * The probabilities here are exact — analytic weight-pool math, differential-tested and cross-checked
 * against Craft of Exile. The COSTS are those probabilities multiplied by a price sheet, and the
 * shipped sheet is hand-authored order-of-magnitude estimates for a 0.5-era economy. Presenting
 * "expected cost: 33.58ex" with no caveat implies a precision the prices do not have, and because the
 * optimizer ranks plans BY cost, stale *relative* prices skew the recommendation itself, not just the
 * total. So wherever a cost is shown, this says where it came from.
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
        'The crafting odds are exact. The prices they are multiplied by are hand-authored estimates, '
        + 'so treat costs as ballpark — and note that plans are ranked BY cost, so if your economy '
        + 'differs the recommended plan may differ too.'
      }
    >
      Costs are <strong>rough estimates</strong> — the odds are exact, but the currency prices behind
      them are hand-authored{basis.asOf ? ` (${basis.asOf})` : ''}
      {basis.patch ? ` for patch ${basis.patch}` : ''}, not live market data. Use them to compare plans,
      not to budget precisely.
    </p>
  );
};

export default PriceBasisNote;
