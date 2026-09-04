import React, { useEffect } from 'react';
import nodes from 'virtual:user-guide';
import type { GuideNode, GuideList, Inline } from '../../lib/guide/guideTypes.ts';
import { closeGuide } from '../../lib/guideRoute.ts';

/**
 * The user guide, rendered at poe2htc.com from `docs/USER_GUIDE.md`.
 *
 * The content is not written here — it is the repo's guide, parsed at build time into a typed tree
 * (see `src/lib/guide/parseGuide.ts`). One source of truth, so the page and the file cannot drift.
 * This module is only the styling.
 *
 * Rendered as ELEMENTS, never as an HTML string: `dangerouslySetInnerHTML` appears nowhere in this
 * repo and that property is what lets the CSP keep `'unsafe-inline'` in `script-src`.
 *
 * Lazily imported by App, so ~30 kB of prose stays out of the entry chunk.
 */

const A_CLS = 'underline underline-offset-2 text-primary hover:text-foreground';

function renderInline(xs: readonly Inline[]): React.ReactNode {
  return xs.map((x, i) => {
    switch (x.k) {
      case 'text': return <React.Fragment key={i}>{x.v}</React.Fragment>;
      case 'code': return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">{x.v}</code>
      );
      case 'strong': return <strong key={i} className="font-semibold text-foreground">{renderInline(x.v)}</strong>;
      case 'em': return <em key={i}>{renderInline(x.v)}</em>;
      case 'link': {
        // In-page anchors must not open a tab; everything else leaves the site.
        const external = !x.href.startsWith('#');
        return (
          <a
            key={i}
            href={x.href}
            className={A_CLS}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {renderInline(x.v)}
          </a>
        );
      }
    }
  });
}

function renderList(list: GuideList): React.ReactNode {
  const Tag = list.k;
  return (
    <Tag className={`ml-5 space-y-1 ${list.k === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-muted-foreground`}>
      {list.items.map((item, i) => (
        <li key={i} className="text-sm leading-relaxed text-muted-foreground">
          {renderInline(item.v)}
          {item.sub && <div className="mt-1">{renderList(item.sub)}</div>}
        </li>
      ))}
    </Tag>
  );
}

function renderNode(node: GuideNode, i: number): React.ReactNode {
  switch (node.k) {
    case 'h': {
      // `scroll-mt-4` so an anchored heading isn't flush against the top of the viewport.
      const common = { key: i, id: node.id };
      if (node.level === 1) {
        return <h1 {...common} className="scroll-mt-4 text-2xl font-bold tracking-tight">{renderInline(node.v)}</h1>;
      }
      if (node.level === 2) {
        return <h2 {...common} className="scroll-mt-4 border-b border-border pb-1 pt-6 text-lg font-bold">{renderInline(node.v)}</h2>;
      }
      return <h3 {...common} className="scroll-mt-4 pt-4 text-sm font-bold">{renderInline(node.v)}</h3>;
    }
    case 'p': return <p key={i} className="text-sm leading-relaxed text-muted-foreground">{renderInline(node.v)}</p>;
    case 'hr': return <hr key={i} className="border-border" />;
    // A callout, styled like the app's own info boxes rather than as an indented quote — the guide
    // uses these to flag a caveat, and a caveat should read as one.
    case 'quote': return (
      <div key={i} className="space-y-2 rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-2">
        {node.v.map(renderNode)}
      </div>
    );
    case 'ul':
    case 'ol': return <React.Fragment key={i}>{renderList(node)}</React.Fragment>;
    case 'table': return (
      // The guide is mostly tables and some are wide. Scrolling the TABLE rather than the page is
      // what keeps the mobile smoke test's "no horizontal overflow" assertion true at 390px.
      <div key={i} className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40">
            <tr>{node.head.map((cell, c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">{renderInline(cell)}</th>
            ))}</tr>
          </thead>
          <tbody>
            {node.rows.map((row, r) => (
              <tr key={r} className="border-t border-border align-top">
                {row.map((cell, c) => (
                  <td key={c} className="px-3 py-2 text-muted-foreground">{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

const GuidePage: React.FC = () => {
  // The browser resolves `#guide-glossary` against a document that does not contain the guide yet —
  // this component is lazily loaded, so the anchor never exists at navigation time. Re-run the scroll
  // once the content is on the page. A plain `#guide` starts at the top, which a fresh view should.
  useEffect(() => {
    const target = window.location.hash.slice(1);
    const el = target ? document.getElementById(target) : null;
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-12">
      <button
        onClick={closeGuide}
        className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        ← Back to the app
      </button>
      {nodes.map(renderNode)}
    </div>
  );
};

export default GuidePage;
