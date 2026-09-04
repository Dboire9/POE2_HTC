import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGuide } from './parseGuide.ts';
import {
  slug, rewriteHref, GuideParseError, ANCHOR_PREFIX,
  type GuideNode, type Inline,
} from './guideTypes.ts';

const guide = readFileSync('docs/USER_GUIDE.md', 'utf8');

/** Every link reachable from a node, following nesting. */
function hrefsOf(nodes: readonly GuideNode[]): string[] {
  const out: string[] = [];
  const inline = (xs: readonly Inline[]): void => {
    for (const x of xs) {
      if (x.k === 'link') { out.push(x.href); inline(x.v); }
      else if (x.k === 'strong' || x.k === 'em') inline(x.v);
    }
  };
  const walk = (n: GuideNode): void => {
    if (n.k === 'p' || n.k === 'h') inline(n.v);
    else if (n.k === 'ul' || n.k === 'ol') for (const i of n.items) { inline(i.v); if (i.sub) walk(i.sub); }
    else if (n.k === 'table') { n.head.forEach(inline); n.rows.forEach((r) => r.forEach(inline)); }
  };
  nodes.forEach(walk);
  return out;
}

const plain = (xs: readonly Inline[]): string => xs.map((x) => (
  x.k === 'text' || x.k === 'code' ? x.v : plain(x.v)
)).join('');

describe('unsupported markdown fails the build rather than vanishing', () => {
  // THE point of this parser. Skipping an unknown token would let an author delete a section from
  // the rendered guide by writing something the projection doesn't cover — build green, page wrong.
  it.each([
    ['an image', '![a screenshot](shot.png)'],
    ['a code fence', '```js\nconst x = 1;\n```'],
    ['raw HTML', '<div>hello</div>'],
    ['a level-4 heading', '#### too deep'],
  ])('throws on %s', (_what, md) => {
    expect(() => parseGuide(md)).toThrow(GuideParseError);
  });

  it('names the construct, so a build failure says what to look for', () => {
    expect(() => parseGuide('<div>hello</div>')).toThrow(/html/);
  });

  // Widening the union is meant to be deliberate, and this is the shape of having done it once: a
  // caveat written as a blockquote failed the build by name, and the fix was a node and a renderer
  // rather than a quietly dropped token.
  it('supports the blockquote callout that was added for the Alloys caveat', () => {
    const [node] = parseGuide('> **Careful.** A caveat.');
    expect(node?.k).toBe('quote');
    expect(node?.k === 'quote' && node.v[0]?.k).toBe('p');
  });

  // A link shape with no rewrite rule is the subtle one: it would render and 404 at poe2htc.com.
  it('throws on a relative link that is not a doc', () => {
    expect(() => parseGuide('[go](../src/App.tsx)')).toThrow(GuideParseError);
  });
});

describe('anchors match what the guide already links to', () => {
  // GitHub's rules, and the guide's own table of contents is written against them. The doubled
  // hyphen is the case that matters: an em dash is dropped and its two flanking spaces survive.
  it.each([
    ['Getting started', 'getting-started'],
    ['Your options — the plan cards', 'your-options--the-plan-cards'],
    ["True expected cost — and why it's lower", 'true-expected-cost--and-why-its-lower'],
    ['1. Pick a base and item level', '1-pick-a-base-and-item-level'],
  ])('slugs %s', (text, expected) => {
    expect(slug(text)).toBe(expected);
  });

  it('prefixes in-page anchors so reading the guide does not exit it', () => {
    // A bare `#getting-started` would leave `#guide`, and guideRoute would swap the reader back to
    // the crafting app halfway down the page.
    expect(rewriteHref('#getting-started')).toBe('#guide-getting-started');
  });

  it('absolutises doc links and leaves external ones alone', () => {
    expect(rewriteHref('ALGORITHM.md')).toBe('https://github.com/Dboire9/POE2_HTC/blob/main/docs/ALGORITHM.md');
    expect(rewriteHref('https://poe.ninja')).toBe('https://poe.ninja');
  });
});

describe('the real docs/USER_GUIDE.md', () => {
  const nodes = parseGuide(guide);

  it('parses without throwing, and yields the whole document', () => {
    expect(nodes.length).toBeGreaterThan(100);
    const kinds = new Set(nodes.map((n) => n.k));
    // Every block kind the guide actually uses must survive the projection.
    for (const k of ['h', 'p', 'table', 'ul', 'hr']) expect(kinds).toContain(k);
  });

  it('keeps one heading per `##`/`###` in the file', () => {
    const inFile = (guide.match(/^#{1,3} /gm) ?? []).length;
    expect(nodes.filter((n) => n.k === 'h')).toHaveLength(inFile);
  });

  // The guide's contents list is a nested list; flattening it would silently lose the sub-entries.
  it('keeps the table of contents nested', () => {
    const nested = nodes.filter((n) => n.k === 'ul' && n.items.some((i) => i.sub !== undefined));
    expect(nested.length).toBeGreaterThan(0);
  });

  it('renders tables as tables — the guide is mostly tables', () => {
    const tables = nodes.filter((n) => n.k === 'table');
    expect(tables.length).toBeGreaterThan(5);
    for (const t of tables) expect(t.k === 'table' && t.head.length).toBeGreaterThan(0);
  });

  // Nested inline is real here: `**[poe2htc.com](https://poe2htc.com)**` is bold wrapping a link.
  it('keeps a link nested inside bold', () => {
    const intro = nodes.find((n) => n.k === 'p');
    expect(intro && plain(intro.k === 'p' ? intro.v : [])).toContain('poe2htc.com');
    const hrefs = hrefsOf(nodes);
    expect(hrefs).toContain('https://poe2htc.com');
  });

  // A guard against TOC drift, and it has already caught one: the heading "Why this tab reads
  // differently" was renamed and two links kept pointing at the old slug.
  it('has no in-page link pointing at a heading that does not exist', () => {
    const ids = new Set(nodes.flatMap((n) => (n.k === 'h' ? [n.id] : [])));
    const dead = [...new Set(hrefsOf(nodes).filter((h) => h.startsWith('#')))]
      .filter((h) => !ids.has(h.slice(1)));
    expect(dead).toEqual([]);
  });

  it('prefixes every heading id, so the page stays on the guide route', () => {
    for (const n of nodes) if (n.k === 'h') expect(n.id.startsWith(ANCHOR_PREFIX)).toBe(true);
  });
});
