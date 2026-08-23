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
/**
 * `exactOdds` defaults TRUE because it normally is: the probabilities are analytic weight-pool maths,
 * differential-tested and cross-checked against Craft of Exile. Pass `false` only where a shown number
 * leans on the ASSUMED desecrated spawn weight — an unomened Desecration, which draws by weight from
 * the combined normal ∪ desecrated pool. poe2db publishes no weight for those mods (it reports 1 for
 * every row), so 1000 is a judgement call, and a ~900x one: taken literally the 1 makes a bone produce
 * a desecrated mod about 1 time in 121,510 on a Body Armour, against ~1 in 132 at 1000.
 *
 * The flag is computed from the actual plan steps (`assumedOdds` in engineMap.ts), not from "the target
 * mentions a desecrated mod" — a BOSS-omened Desecration is count-uniform and ignores weights, so it
 * stays exact and must not carry this warning. Warning on every craft would be the overclaim in the
 * opposite direction, which is the mistake this component's own history is about.
 */
const PriceBasisNote: React.FC<{
  basis: EnginePriceBasis; className?: string; exactOdds?: boolean;
}> = ({ basis, className, exactOdds = true }) => {
  const oddsLine = exactOdds ? (
    <> The <strong>odds are exact</strong> — use costs to compare plans, not to budget precisely.</>
  ) : (
    <> This plan uses a <strong>Desecration without a boss omen</strong>, whose odds rest on an{' '}
      <strong>assumed</strong> spawn weight for desecrated mods — the data source publishes none. Treat
      those steps as an estimate; every other probability here is exact.</>
  );
  if (!basis.estimated) {
    return (
      <p className={`text-[11px] text-muted-foreground ${className ?? ''}`}>
        Costs in {basis.unit ?? 'exalt-equivalents'}
        {basis.asOf ? `, prices as of ${basis.asOf}` : ''}.{!exactOdds && oddsLine}
      </p>
    );
  }
  // The caveat is a COMPLETE SENTENCE supplied by the price sheet, rendered as one. It used to be
  // spliced into the middle of this one ("…the odds are exact, but {caveat}"), which only read
  // correctly while the caveat happened to be a lowercase fragment — the moment the sheet described
  // itself in a full sentence the line became "…but All prices are live market data, except …." with
  // a capital mid-clause and a date stranded after the full stop.
  const caveat = basis.caveat ?? 'These prices are hand-authored estimates, not live market data.';
  const asOf = [basis.asOf, basis.patch ? `patch ${basis.patch}` : null].filter(Boolean).join(', ');
  return (
    <p
      className={`text-[11px] text-amber-300 ${className ?? ''}`}
      title={
        (exactOdds ? 'The crafting odds are exact. ' : 'Most crafting odds here are exact; the unomened Desecration steps rest on an assumed spawn weight. ')
        + 'Some of the prices they are multiplied by are estimates, so '
        + 'treat costs as ballpark — and note that plans are ranked BY cost, so if your economy '
        + 'differs the recommended plan may differ too.'
      }
    >
      {caveat}{asOf ? ` (${asOf})` : ''}{oddsLine}
    </p>
  );
};

export default PriceBasisNote;
