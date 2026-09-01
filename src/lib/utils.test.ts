import { describe, it, expect } from 'vitest';
import { clsx } from 'clsx';
import { cn } from './utils.ts';

/**
 * WHY `cn` PULLS IN tailwind-merge, WHICH IS 8.8% OF THE BUNDLE.
 *
 * `cn` is the only thing in the app that uses tailwind-merge, and it has exactly three call sites
 * (`badge.tsx`, `button.tsx`, `PolicyGraph.tsx`). That made it look like an obvious saving: if nothing
 * relied on CONFLICT RESOLUTION — the one thing tailwind-merge does that `clsx` does not — then `clsx`
 * alone would do and ~10 kB gzip would come off the critical path.
 *
 * Audited 2026-09-01, and the hypothesis is false: two of the three call sites depend on it, with real
 * class strings taken from real callers. So this pins the reason rather than leaving the next person to
 * re-run the audit — and it fails if someone swaps `cn` for a bare `clsx`.
 *
 * The mechanism matters for why "just order the classes correctly" is not the fix. Both classes in each
 * pair below are emitted into the stylesheet at the same specificity, so which one wins is decided by
 * their order in TAILWIND'S OUTPUT, not by their order in the `class` attribute. Dropping the loser is
 * the only way to make the caller's intent win reliably.
 */
describe('cn — tailwind-merge earns its place, and here is where', () => {
  /**
   * `<Badge variant="outline" className="border-amber-500/60 …">` — the "stopped early" badge in
   * FrontierView. The outline variant supplies `border-input`; both are border-COLOUR utilities, so
   * without the merge the amber border is a coin flip against the default one.
   */
  it('drops the variant’s border colour when a caller passes its own', () => {
    const merged = cn('border border-input bg-background', 'border-amber-500/60 text-amber-700');
    expect(merged).toContain('border-amber-500/60');
    expect(merged).not.toContain('border-input');
    expect(merged).toContain('border '); // the WIDTH survives — only the colour was in conflict
    // clsx keeps both, which is the bug this prevents.
    expect(clsx('border border-input bg-background', 'border-amber-500/60')).toContain('border-input');
  });

  /** `<Badge className="text-[10px]">` — an arbitrary font size against the base's `text-xs`. */
  it('drops the base font size when a caller sets its own', () => {
    const merged = cn('px-2.5 py-0.5 text-xs font-semibold', 'text-[10px]');
    expect(merged).toContain('text-[10px]');
    expect(merged).not.toContain('text-xs');
  });

  /** And it must not "resolve" things that are not in conflict — a border width and a border colour. */
  it('keeps classes that do not conflict', () => {
    const merged = cn('rounded border px-2 py-0.5', 'border-primary/60 bg-primary/20 text-foreground');
    for (const c of ['rounded', 'border', 'px-2', 'py-0.5', 'border-primary/60', 'bg-primary/20']) {
      expect(merged).toContain(c);
    }
  });

  it('still does the plain clsx job: conditionals and falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });
});
