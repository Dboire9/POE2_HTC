// The refresh pipeline's first test, written because CodeQL flagged `stripHtml` as an incomplete
// sanitization and the answer turned out to be "this one is a false positive, and here is why".
//
// The claim being pinned: `/<[^>]+>/g` applied once is ALREADY a fixed point. `[^>]+` never crosses
// a `>`, so every match runs from a `<` to the first `>` after it — meaning any `<` that survives had
// no `>` after it in the input, and deleting characters cannot put one there. A loop was written here
// and deleted once that was measured.

import { describe, it, expect } from 'vitest';
import { stripHtml } from './poe2db.mjs';

describe('stripHtml — turning poe2db’s HTML fragment into mod text', () => {
  it('drops tags and keeps the text', () => {
    expect(stripHtml('<b>Adds #</b> to Damage')).toBe('Adds # to Damage');
  });

  it('turns a <br> into a newline rather than joining the lines', () => {
    // A compound mod's stat lines are separated by <br>; concatenating them would produce a label no
    // player could read, and would not match what the RePoE path produces for the same mod.
    expect(stripHtml('Adds # Fire Damage<br>Adds # Cold Damage')).toBe('Adds # Fire Damage\nAdds # Cold Damage');
    expect(stripHtml('a<BR/>b')).toBe('a\nb');
  });

  it('collapses runs of spaces without eating newlines', () => {
    expect(stripHtml('a   b<br>  c  ')).toBe('a b\nc');
  });

  it('passes an apostrophe through untouched', () => {
    // Nine shipped mods carry one ("if you've Hit Recently", "Nature's Archon"). Escaping belongs at
    // the point of USE — see `esc` in scripts/coe-artifact.mts — not here, where the output is JSON.
    expect(stripHtml("if you've Hit Recently")).toBe("if you've Hit Recently");
  });

  it('returns null for null', () => {
    expect(stripHtml(null)).toBeNull();
    expect(stripHtml(undefined)).toBeNull();
  });
});

describe('stripHtml — one pass is already a fixed point (the CodeQL false positive)', () => {
  it('is idempotent, and leaves no tag, over random angle-bracket soup', () => {
    // Argued above; measured here. Deterministic seed so a failure is reproducible rather than a
    // story about a run nobody can repeat.
    let seed = 0x2f6e2b1;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const alpha = ['<', '>', 'b', 'r', '/', 's', 'c', 'i', 'p', 't', ' ', '\n', 'a'];
    const notIdempotent = [];
    const leftATag = [];
    for (let i = 0; i < 20_000; i++) {
      const n = 1 + Math.floor(rnd() * 20);
      let s = '';
      for (let k = 0; k < n; k++) s += alpha[Math.floor(rnd() * alpha.length)];
      const out = stripHtml(s);
      if (stripHtml(out) !== out) notIdempotent.push(s);
      if (/<[^>]+>/.test(out)) leftATag.push(s);
    }
    expect(notIdempotent).toEqual([]);
    expect(leftATag).toEqual([]);
  });

  it('the nesting shape the rule is really about cannot survive it', () => {
    // `<scr<script>ipt>` is the canonical bypass for removing a FIXED string. Against `<[^>]+>` the
    // match runs from the first `<` to the first `>`, so there is nothing left to re-form a tag.
    for (const s of ['<scr<script>ipt>', '<<script>script>', '<a<b>c>', '<<b>b>bold']) {
      expect(stripHtml(s), s).not.toMatch(/<[^>]+>/);
    }
  });
});
