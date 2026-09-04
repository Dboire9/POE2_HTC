import { marked, type Token, type Tokens } from 'marked';
import {
  ANCHOR_PREFIX, GuideParseError, rewriteHref, slug,
  type GuideList, type GuideNode, type Inline, type ListItem,
} from './guideTypes.ts';

/**
 * `docs/USER_GUIDE.md` -> the typed tree the guide page renders with React elements.
 *
 * BUILD TIME ONLY. This module imports `marked`, a devDependency, and must never reach the client
 * bundle — `vite.config.ts`'s `user-guide` plugin is its only non-test caller. Anything the app
 * needs at runtime lives in `guideTypes.ts` instead; see the note there.
 *
 * WHY A TREE AND NOT AN HTML STRING. There is no `dangerouslySetInnerHTML`, no `innerHTML` and no
 * `eval` anywhere in this repo, and that is not incidental — it is the stated reason the CSP can
 * keep `'unsafe-inline'` in `script-src` (see CLAUDE.md on vercel.json). Rendering the guide from an
 * HTML string would spend that property on a page of static prose. So the markdown is projected onto
 * the node union and rendered as elements, exactly as `shipMods.ts` projects `mods.json` onto the
 * fields `Mod` declares: the TYPE is what makes it safe, not the plugin that calls it.
 *
 * WHY IT THROWS. An unsupported construct must fail the build, never be dropped. Silently skipping
 * an unknown token is how a whole section leaves the guide with nothing going red — the author edits
 * the `.md`, the build succeeds, and the page is quietly missing a paragraph. The guide's markdown is
 * a small closed set today (headings, paragraphs, tables, lists, rules, blockquote callouts, and
 * inline bold/italic/code/links — no images, code fences or raw HTML), so widening it is a deliberate
 * act: add the node, add the renderer, and the throw goes away. That has already happened once, and
 * it happened the right way round: a caveat written as a blockquote failed the build, naming the
 * construct, rather than rendering a guide with the caveat missing.
 *
 * Pure and side-effect free, so it is tested directly by vitest without running a build.
 */

/** marked leaves HTML entities encoded in text tokens; React escapes on render, so decoding here is
 *  what stops "Star &amp; Contribute" reaching the page with the ampersand spelled out. */
function decode(text: string): string {
  return text
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function inlines(tokens: readonly Token[] | undefined): readonly Inline[] {
  return (tokens ?? []).flatMap((t): Inline[] => {
    switch (t.type) {
      case 'text':
      case 'escape': {
        const nested = (t as Tokens.Text).tokens;
        // A `text` token carries its own inline tokens when it wraps them (list items do this).
        return nested ? [...inlines(nested)] : [{ k: 'text', v: decode(t.raw) }];
      }
      case 'strong': return [{ k: 'strong', v: inlines((t as Tokens.Strong).tokens) }];
      case 'em': return [{ k: 'em', v: inlines((t as Tokens.Em).tokens) }];
      case 'codespan': return [{ k: 'code', v: decode((t as Tokens.Codespan).text) }];
      case 'link': {
        const l = t as Tokens.Link;
        return [{ k: 'link', href: rewriteHref(l.href), v: inlines(l.tokens) }];
      }
      case 'br': return [{ k: 'text', v: ' ' }];
      default: throw new GuideParseError(`inline "${t.type}"`, t.raw);
    }
  });
}

function listOf(token: Tokens.List): GuideList {
  const items = token.items.map((item): ListItem => {
    const sub = item.tokens.find((t): t is Tokens.List => t.type === 'list');
    const body = item.tokens.filter((t) => t.type !== 'list');
    for (const t of body) {
      if (t.type !== 'text' && t.type !== 'paragraph') {
        throw new GuideParseError(`"${t.type}" inside a list item`, t.raw);
      }
    }
    const v = body.flatMap((t) => [...inlines((t as Tokens.Text).tokens)]);
    return sub ? { v, sub: listOf(sub) } : { v };
  });
  return { k: token.ordered ? 'ol' : 'ul', items };
}

function blocks(tokens: readonly Token[]): GuideNode[] {
  return tokens.flatMap((token): GuideNode[] => {
    switch (token.type) {
      case 'space': return [];
      case 'hr': return [{ k: 'hr' }];
      // Blocks, recursively: the guide uses a quote to flag a caveat, and a caveat runs to paragraphs.
      case 'blockquote': return [{ k: 'quote', v: blocks((token as Tokens.Blockquote).tokens) }];
      case 'heading': {
        const h = token as Tokens.Heading;
        if (h.depth > 3) {
          throw new GuideParseError(`a level-${String(h.depth)} heading (only 1-3 are styled)`, h.raw);
        }
        return [{ k: 'h', level: h.depth as 1 | 2 | 3, id: ANCHOR_PREFIX + slug(h.text), v: inlines(h.tokens) }];
      }
      case 'paragraph': return [{ k: 'p', v: inlines((token as Tokens.Paragraph).tokens) }];
      case 'list': return [listOf(token as Tokens.List)];
      case 'table': {
        const t = token as Tokens.Table;
        return [{
          k: 'table',
          head: t.header.map((c) => inlines(c.tokens)),
          rows: t.rows.map((row) => row.map((c) => inlines(c.tokens))),
        }];
      }
      default: throw new GuideParseError(`block "${token.type}"`, token.raw);
    }
  });
}

export function parseGuide(markdown: string): readonly GuideNode[] {
  return blocks(marked.lexer(markdown));
}
