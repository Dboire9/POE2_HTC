import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Is it worth crafting — at a glance. Two bars on one scale, what you SPEND against what you
 * GET (its price, plus what you sell on the way), and the difference as the headline in the
 * colour of its sign. The bars grow in whenever the numbers change, so a price typed visibly moves them.
 */
export const ProfitVerdict: React.FC<{
  /** Everything a craft spends on average: the first base or tablet, rolling it, the fresh ones sales force. */
  spend: number;
  /** What the item or tablet asked for sells for, as typed — absent until the player types it. */
  salePrice: number | undefined;
  /** What selling priced sets on the way brings back per craft (0 when nothing is priced). */
  salesOnWay: number;
  fmt: (ex: number) => string;
  /** What is crafted: "tablet" on the Tablets tab, "item" on the gear tabs. */
  noun?: string;
}> = ({ spend, salePrice, salesOnWay, fmt, noun = 'tablet' }) => {
  const get = (salePrice ?? 0) + salesOnWay;
  const profit = salePrice === undefined ? undefined : get - spend;
  const scale = Math.max(spend, get, 1e-9);
  const pct = (x: number): string => `${Math.max(0, Math.min(100, (100 * x) / scale))}%`;
  // Re-keyed on the numbers, so a new price replays the growth rather than jumping.
  const key = `${Math.round(spend)}-${Math.round(get)}`;

  return (
    <div
      className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-3"
      role="img"
      aria-label={profit === undefined
        ? `You spend about ${fmt(spend)} a craft. Type what it sells for to see if it pays.`
        : `You spend about ${fmt(spend)} and get about ${fmt(get)}: a ${profit >= 0 ? 'profit' : 'loss'} of ${fmt(Math.abs(profit))} per ${noun}.`}
    >
      <p
        key={`verdict-${key}`}
        className={cn(
          'text-base font-semibold tabular-nums motion-safe:animate-fade-up',
          profit === undefined ? 'text-muted-foreground' : profit >= 0 ? 'text-emerald-400' : 'text-amber-400',
        )}
      >
        {profit === undefined
          ? 'Type what it sells for below to see if it pays'
          : profit >= 0
            ? `▲ Profit per ${noun}: about ${fmt(profit)} on average`
            : `▼ Loss per ${noun}: about ${fmt(-profit)} on average — buying one is cheaper`}
        {profit !== undefined && salesOnWay > 0 && (
          <span className="text-sm font-normal text-muted-foreground"> — counting what you sell on the way</span>
        )}
      </p>

      <Bar label="You spend" value={fmt(spend)} tone="spend">
        <Fill key={`s-${key}`} width={pct(spend)} className="bg-gradient-to-r from-amber-600 to-amber-400" />
      </Bar>
      <Bar label="You get" value={profit === undefined && salesOnWay === 0 ? '—' : fmt(get)} tone="get">
        {salePrice !== undefined && (
          <Fill key={`p-${key}`} width={pct(salePrice)} className="bg-gradient-to-r from-emerald-600 to-emerald-400" />
        )}
        {salesOnWay > 0 && (
          <Fill
            key={`w-${key}`}
            width={pct(salesOnWay)}
            className="bg-emerald-300/60 [background-image:repeating-linear-gradient(45deg,transparent_0_4px,rgb(255_255_255/0.18)_4px_8px)]"
            title="What you sell on the way"
          />
        )}
      </Bar>
      {salesOnWay > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-4 rounded-sm bg-emerald-500" /> the {noun} you asked for
          <span className="inline-block h-2 w-4 rounded-sm bg-emerald-300/60" /> what you sell on the way
        </p>
      )}
    </div>
  );
};

const Bar: React.FC<{ label: string; value: string; tone: 'spend' | 'get'; children?: React.ReactNode }> = ({
  label, value, tone, children,
}) => (
  <div className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="flex h-3 overflow-hidden rounded-full bg-muted">{children}</span>
    <span className={cn('tabular-nums', tone === 'spend' ? 'text-amber-300' : 'text-emerald-300')}>{value}</span>
  </div>
);

const Fill: React.FC<{ width: string; className: string; title?: string }> = ({ width, className, title }) => (
  <span
    className={cn('block h-full origin-left motion-safe:animate-grow-x', className)}
    style={{ width }}
    {...(title ? { title } : {})}
  />
);
