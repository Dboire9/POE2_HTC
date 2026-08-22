import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// jsdom has no layout engine — `getBoundingClientRect` is all zeros and media queries never match — so
// there is no way to *render* a phone and measure it here. What can be pinned is the class contract
// that produces the layout, which is where the bug actually was: a bare `flex` on the prefix/suffix mod
// columns kept them side by side at every width, so on a narrow screen each got half of it and the mod
// text was crushed to a few characters. Tailwind's default `sm` breakpoint is 640px.
//
// This is a source assertion, not a DOM one. It is deliberately narrow: it checks only that the two
// column containers stack by default and go side-by-side from `sm` up. Real layout still wants a human
// with a narrow window.
const read = (f: string): string => readFileSync(`src/features/engine/${f}`, 'utf8');

describe('the mod columns stack on a phone', () => {
  for (const file of ['EngineLab.tsx', 'ItemActions.tsx']) {
    it(`${file} lays its two mod columns out column-first`, () => {
      const src = read(file);
      expect(src).toContain('flex flex-col sm:flex-row gap-4');
      // …and no bare horizontal-only container is left behind.
      expect(src).not.toContain('<div className="flex gap-4">');
    });
  }

  it('each column can actually shrink — flex-1 alone still overflows on long mod text', () => {
    // `min-w-0` is what lets a flex child narrower than its content; without it the column keeps its
    // intrinsic width and pushes the row wider than the screen instead of truncating.
    expect(read('EngineLab.tsx')).toContain('flex-1 min-w-0');
    expect(read('ItemActions.tsx')).toContain('flex-1 min-w-0');
  });
});
