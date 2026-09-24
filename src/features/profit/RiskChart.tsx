import React, { useLayoutEffect, useRef, useState } from 'react';
import { shareWithin } from '../../lib/profit';

const H = 200;
const PAD = { l: 40, r: 14, t: 16, b: 30 };

/**
 * How risky the craft is, drawn: the share of crafts that finish within a given spend. It climbs from
 * 0% to 100% as the budget grows; the part under what the tablet sells for is shaded green, and the
 * average and the sale price are marked. The line draws itself in; a new price moves the marker.
 *
 * One scale places every mark and label — x is the spend (clipped at the 95th percentile or a little
 * past the sale price, whichever is further, so a long tail does not flatten the rest), y the share.
 */
export const RiskChart: React.FC<{
  /** What one craft cost, 0th–100th percentile, the first plain tablet included. */
  percentiles: readonly number[];
  mean: number;
  salePrice: number | undefined;
  fmt: (ex: number) => string;
}> = ({ percentiles: pct, mean, salePrice, fmt }) => {
  // Drawn at the width it is shown at, so its text stays the size of the page's on any screen — a
  // fixed viewBox scaled to fill a wide card made every label twice the size of the text around it.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = (): void => setW(Math.max(280, Math.round(el.clientWidth) || 600));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (pct.length < 101) return null;
  const xmax = Math.max(pct[95]!, salePrice ? salePrice * 1.15 : 0, mean * 1.15, 1e-9);
  const x = (v: number): number => PAD.l + (Math.min(v, xmax) / xmax) * (W - PAD.l - PAD.r);
  const y = (share: number): number => PAD.t + (1 - share) * (H - PAD.t - PAD.b);

  // The curve: (cost of the p-th percentile craft, p%), up to the edge of the chart.
  const pts: [number, number][] = [[x(0), y(0)], [x(pct[0]!), y(0)]];
  for (let p = 0; p <= 100; p++) {
    if (pct[p]! > xmax) { pts.push([x(xmax), y(shareWithin(pct, xmax))]); break; }
    pts.push([x(pct[p]!), y(p / 100)]);
  }
  const line = pts.map(([a, b], i) => `${i === 0 ? 'M' : 'L'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1]!;
  const area = `${line} L${last[0].toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`;
  const share = salePrice === undefined ? undefined : shareWithin(pct, salePrice);
  const ticks = [0, xmax / 2, xmax];

  return (
    <figure className="space-y-1">
      <figcaption className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        How often a craft finishes within a budget
      </figcaption>
      <div ref={box} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block max-w-full"
        role="img"
        aria-label={share === undefined
          ? `Half the crafts finish within ${fmt(pct[50]!)}, nine in ten within ${fmt(pct[90]!)}.`
          : `${Math.round(share * 100)}% of crafts finish within the ${fmt(salePrice!)} it sells for.`}
      >
        <defs>
          <linearGradient id="risk-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
          {salePrice !== undefined && (
            <clipPath id="risk-within"><rect x={PAD.l} y={0} width={Math.max(0, x(salePrice) - PAD.l)} height={H} /></clipPath>
          )}
        </defs>

        {/* grid: 0%, 50%, 100% */}
        {[0, 0.5, 1].map((s) => (
          <g key={s}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(s)} y2={y(s)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(s) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{s * 100}%</text>
          </g>
        ))}
        {ticks.map((t, i) => (
          <text key={i} x={x(t)} y={H - 8} textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}
            className="fill-muted-foreground text-[11px]">{fmt(t)}</text>
        ))}

        <path d={area} fill="url(#risk-fill)" />
        {salePrice !== undefined && <path d={area} clipPath="url(#risk-within)" className="fill-emerald-500/30" />}
        <path d={line} pathLength={1} strokeDasharray="1" fill="none" strokeWidth={2.5} strokeLinejoin="round"
          className="stroke-primary motion-safe:animate-draw" />

        {/* the average */}
        <line x1={x(mean)} x2={x(mean)} y1={PAD.t} y2={y(0)} strokeDasharray="4 4" className="stroke-amber-400/80" strokeWidth={1.5} />
        <text x={x(mean) + 4} y={PAD.t + 10} className="fill-amber-300 text-[11px]">average {fmt(mean)}</text>

        {/* what it sells for, and how often a craft comes in under it */}
        {salePrice !== undefined && share !== undefined && (
          <g key={Math.round(salePrice)} className="motion-safe:animate-fade-up">
            <line x1={x(salePrice)} x2={x(salePrice)} y1={PAD.t} y2={y(0)} className="stroke-emerald-400" strokeWidth={2} />
            <circle cx={x(salePrice)} cy={y(share)} r={5} className="fill-emerald-400 stroke-background" strokeWidth={2} />
            {/* Below the dot when it sits high, above it otherwise — never on the line itself. */}
            <text x={x(salePrice) > W * 0.5 ? x(salePrice) - 10 : x(salePrice) + 10} y={share > 0.6 ? y(share) + 20 : y(share) - 10}
              textAnchor={x(salePrice) > W * 0.5 ? 'end' : 'start'} className="fill-emerald-300 text-[12px] font-semibold">
              {Math.round(share * 100)}% finish within {fmt(salePrice)}
            </text>
          </g>
        )}
      </svg>
      </div>
    </figure>
  );
};
