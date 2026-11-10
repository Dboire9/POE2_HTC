import React from 'react';

/**
 * The fold over the step routes, once the true expected cost has answered — on both gear tabs.
 *
 * Closed, it is a full-width button carrying the route count and why the routes are secondary; open, a
 * small "Hide" link above them. Shared so the two tabs cannot drift: the Plan tab showed its routes open
 * under the true cost until 2026-11-10, where a "1 in 54,612 · 295 ex" card sat beneath "151 chaos" with
 * nothing saying they answer different questions.
 */
const RoutesToggle: React.FC<{ open: boolean; count: number; onToggle: (open: boolean) => void }> = ({ open, count, onToggle }) => (
  open ? (
    <button
      type="button"
      onClick={() => onToggle(false)}
      aria-expanded
      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
    >
      Hide step-by-step routes
    </button>
  ) : (
    <button
      type="button"
      onClick={() => onToggle(true)}
      aria-expanded={false}
      className="w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-muted/40"
    >
      <span className="font-medium text-foreground">Step-by-step routes</span>
      {/* NOT the cheapest expected cost. That figure is the free-restart total — billions of divine on a
          long-shot craft — and putting it on the button meant you met the number without ever opening
          the section. The route count is the honest summary. */}
      {count > 0 && <span className="tabular-nums"> ({count})</span>}
      {/* Deliberately NOT a restatement of the two-cost-models paragraph above — that one explains the
          models; this one says why the number behind this button is safe to ignore. Saying it twice
          reads as the panel arguing with itself. */}
      <span className="block mt-0.5">
        Every slam here must hit one <em>named</em> mod, where the policy above takes whatever lands —
        which is why this figure is so much larger. Kept for completeness.
      </span>
    </button>
  )
);

export default RoutesToggle;
