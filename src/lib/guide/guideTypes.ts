/**
 * The guide's node union and the pure helpers around it — everything about the guide format that
 * does NOT need a markdown parser.
 *
 * SPLIT FROM `parseGuide.ts` ON PURPOSE. `marked` is a devDependency whose output ships and whose
 * code must not: it is a build-time tool. But `guideRoute.ts` needs `ANCHOR_PREFIX` at runtime, and
 * a single value import from a module that also imports `marked` pulls the whole parser into the
 * ENTRY chunk — measured, it did: 50 occurrences of the tokenizer in `index-*.js`. This is the same
 * failure mode as a static Sentry import (+82% on the entry chunk), and the same fix as extracting
 * `modText.mjs` so importing one rule did not run the whole refresh pipeline.
 *
 * So: nothing in this file may import `marked`, and `guideParserIsolation.test.ts` enforces it.
 */

/** Heading ids are prefixed because the app routes on `location.hash`. An in-page link to a bare
 *  `#getting-started` would leave `#guide` and bounce the reader back into the crafting app
 *  mid-read; `#guide-getting-started` scrolls natively AND still reads as "in the guide". */
export const ANCHOR_PREFIX = 'guide-';

const DOCS_BASE = 'https://github.com/Dboire9/POE2_HTC/blob/main/docs/';

export type Inline =
  | { readonly k: 'text'; readonly v: string }
  | { readonly k: 'code'; readonly v: string }
  | { readonly k: 'strong'; readonly v: readonly Inline[] }
  | { readonly k: 'em'; readonly v: readonly Inline[] }
  | { readonly k: 'link'; readonly href: string; readonly v: readonly Inline[] };

export interface ListItem {
  readonly v: readonly Inline[];
  /** One level of nesting is real: the guide's own table of contents is a nested list. */
  readonly sub?: GuideList;
}

export interface GuideList {
  readonly k: 'ul' | 'ol';
  readonly items: readonly ListItem[];
}

export type GuideNode =
  | { readonly k: 'h'; readonly level: 1 | 2 | 3; readonly id: string; readonly v: readonly Inline[] }
  | { readonly k: 'p'; readonly v: readonly Inline[] }
  | { readonly k: 'hr' }
  /** A callout. Blocks, not inlines: a blockquote can hold paragraphs, lists and tables. */
  | { readonly k: 'quote'; readonly v: readonly GuideNode[] }
  | {
    readonly k: 'table';
    readonly head: readonly (readonly Inline[])[];
    readonly rows: readonly (readonly (readonly Inline[])[])[];
  }
  | GuideList;

/** Thrown with the offending source, so a build failure says which line to look at. */
export class GuideParseError extends Error {
  constructor(what: string, raw: string) {
    super(`Unsupported markdown in the user guide: ${what}\n  at: ${raw.slice(0, 120).trim()}`);
    this.name = 'GuideParseError';
  }
}

/** GitHub's heading-slug rules, which is what the guide's own table of contents already links to:
 *  lowercase, drop everything that is not a word character/space/hyphen, then spaces to hyphens.
 *  Note `\s` and not `\s+` — the em dash in "True expected cost — and why it's lower" is dropped and
 *  its two flanking spaces each become a hyphen, which is the doubled hyphen GitHub produces. */
export function slug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s/g, '-');
}

/** `docs/`-relative links have to become absolute, because the guide is rendered at poe2htc.com
 *  where `ALGORITHM.md` resolves to nothing. In-page anchors get the routing prefix. */
export function rewriteHref(href: string): string {
  if (href.startsWith('#')) return `#${ANCHOR_PREFIX}${href.slice(1)}`;
  if (/^https?:\/\//.test(href)) return href;
  if (/\.md(#.*)?$/.test(href)) return DOCS_BASE + href;
  throw new GuideParseError(`a link this parser has no rule for ("${href}")`, href);
}
