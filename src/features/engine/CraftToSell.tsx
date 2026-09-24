import React from 'react';
import { priceBasis, type Engine, type EngineMarkovResult, type TargetInput } from '../../lib/engine';
import { formatIn, pickUnit, priceUnits, type Rates } from '../../lib/currency';
import { planRuns, shareWithin, type CostLine } from '../../lib/profit';
import type { PriceEntry, TypedPrice } from '../../lib/typedPrices';
import { slotsOfTargets } from '../../lib/gearTrade';
import { PriceBox } from '../profit/PriceBox';
import { ProfitVerdict } from '../profit/ProfitVerdict';
import { RunPlanView } from '../profit/RunPlan';
import { ProfitBreakdown } from '../profit/ProfitBreakdown';
import { GearTradeLink } from './GearTradeLink';
import { spreadOf } from './CostSpread';

/**
 * What one played-out craft spends, line by line: the white base it starts from, then every move the
 * plan played — strength and omens named, as the plan priced it — how often a craft plays it and what
 * that comes to. The moves add up to the replay's own average; nothing is estimated to fill a gap.
 */
export function spendLines(markov: EngineMarkovResult): CostLine[] | undefined {
  const replay = markov.replay;
  if (!replay) return undefined;
  const lines: CostLine[] = replay.spendByMove.map((m) => ({ name: m.label, count: m.count, each: m.spent / m.count, total: m.spent }));
  if (markov.restartCost !== undefined) {
    lines.push({ name: 'The white base you start from', count: 1, each: markov.restartCost, total: markov.restartCost });
  }
  return lines.sort((a, b) => b.total - a.total);
}

/**
 * Crafting to sell: whether it pays. The finished item's trade search, the price the player brings back
 * from it, and against it what a craft costs — the verdict at once, and once the plan is played out how
 * often one craft pays, how many to craft, and the arithmetic line by line. The Tablets tab's tools,
 * shared (`features/profit`), with an item where they say a tablet.
 *
 * The first base is part of the spend, as a tablet craft counts its first tablet: the solver prices the
 * start overs (`restartCost`), not the base bought before the first roll.
 */
const CraftToSell: React.FC<{
  engine: Engine;
  markov: EngineMarkovResult;
  /** The craft the result on screen was solved for — its trade search names that item. */
  solvedFor: { readonly baseId: string; readonly targets: readonly TargetInput[] };
  rates: Rates | undefined;
  sale: TypedPrice | undefined;
  /** What the sale is kept under: the box is keyed by it, so text typed for one item never lands on another. */
  saleKey: string;
  onSale: (price: PriceEntry | undefined) => void;
}> = ({ engine, markov, solvedFor, rates, sale, saleKey, onSale }) => {
  const saleEx = sale?.ex;
  // Keyed on the numbers, not on arrays rebuilt every render: a plan is a million draws.
  const plan = React.useMemo(() => {
    const spread = spreadOf(markov);
    if (saleEx === undefined || !markov.replay || !spread) return undefined;
    const meanCost = (markov.restartCost ?? 0) + markov.replay.meanCost;
    return { plan: planRuns(spread, meanCost, saleEx), perCraft: saleEx - meanCost };
  }, [markov, saleEx]);

  const fromWhite = markov.restartCost !== undefined;
  const spend = (markov.restartCost ?? 0) + markov.expectedCost;
  const unit = pickUnit(Math.max(spend, saleEx ?? 0), rates);
  const fmt = (ex: number): string => formatIn(unit, ex);
  const replay = markov.replay;
  const spread = spreadOf(markov);
  const lines = spendLines(markov);

  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Or buy it already made — every modifier at the tier you asked or better:
        <GearTradeLink
          data={engine.data} league={priceBasis(engine).league} baseId={solvedFor.baseId}
          slots={slotsOfTargets(solvedFor.targets)} rarity="nonunique" label="the finished item"
        />
      </p>
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>Crafting it to sell? It sells for</span>
        <PriceBox key={saleKey} unit={pickUnit(spend, rates)} units={priceUnits(rates)} price={sale} onPrice={onSale} label="What the finished item sells for" />
      </p>
      {saleEx !== undefined && markov.bound !== 'exact' && (
        // A bound is not a cost to subtract: against a floor a loss can read as a profit, and against a
        // ceiling a profit as a loss.
        <p className="text-xs text-muted-foreground">
          The cost above is only a bound, so this cannot say yet whether crafting it pays — raise Search
          effort to settle it.
        </p>
      )}
      {saleEx !== undefined && markov.bound === 'exact' && (
        <>
          <ProfitVerdict spend={spend} salePrice={saleEx} salesOnWay={0} fmt={fmt} noun="item" />
          {!fromWhite && (
            <p className="text-[11px] text-muted-foreground">The carved base you start from is not counted: add what it cost you.</p>
          )}
          {replay && spread && lines ? (
            <>
              <p className="text-sm">
                One craft pays for itself{' '}
                <strong className="tabular-nums">{Math.round(shareWithin(spread, saleEx) * 100)}%</strong> of the time —
                how often a craft costs less than the {fmt(saleEx)} it sells for.
              </p>
              {plan && <RunPlanView plan={plan.plan} perCraft={plan.perCraft} fmt={fmt} noun={['item', 'items']} />}
              <ProfitBreakdown
                spend={lines} get={[{ name: 'The item you asked for', count: 1, each: saleEx, total: saleEx }]}
                exactSpend={spend} runs={replay.runs} stdErr={replay.stdErr} fmt={fmt} noun="an item"
                about={fromWhite
                  ? 'starting from a white base and ending on the item you asked for.'
                  : 'starting from the carved base and ending on the item you asked for.'}
              />
            </>
          ) : !markov.replayReason && (
            <p className="text-xs text-muted-foreground">
              Play it out, above, to see how often one craft pays for itself and how many to craft.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CraftToSell;
