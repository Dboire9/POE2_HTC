import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Spinner } from '../../components/ui/spinner';

/**
 * The loading placeholder must contain no bare text node.
 *
 * Reported from production on 2026-09-04 — an Edge reader in a `zh-CN` locale, on a page that
 * declares `lang="en"`, so the browser translated it. Chrome and Edge translate by REPLACING each
 * text node with a `<font>` element of their own. React keeps a reference to the text node it
 * rendered; when the patch data arrived ~12 ms later and this block was swapped for the app,
 * `removeChild` was handed a node that had stopped being a child, and the error boundary took the
 * whole page down with "Something went wrong".
 *
 * Text INSIDE an element is safe: the translator rewrites the element's contents and the element
 * React removes is still where React left it. So the rule is narrow and mechanical — in a subtree
 * that gets replaced wholesale, no text may sit loose beside an element.
 *
 * This asserts the shape rather than the copy, so it keeps holding when the wording changes.
 */
const loadingBlock = (
  <div className="flex items-center gap-3 p-8 text-muted-foreground">
    <Spinner /><span>Loading patch data…</span>
  </div>
);

describe('the loading placeholder survives a page translator', () => {
  it('has no loose text node beside the spinner', () => {
    const { container } = render(loadingBlock);
    const box = container.firstElementChild!;
    const textNodes = [...box.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
    expect(textNodes).toEqual([]);
  });

  it('still says what it is doing', () => {
    const { container } = render(loadingBlock);
    expect(container.textContent).toContain('Loading patch data');
  });

  // What the browser actually does: swap the text node for an element of its own. React then removes
  // the wrapper it rendered, which is untouched — so the removal finds its child and succeeds.
  it('survives the translator swapping its text node for an element', () => {
    const { container, unmount } = render(loadingBlock);
    const label = container.querySelector('span')!;
    const font = document.createElement('font');
    font.textContent = '正在加载补丁数据…';
    label.replaceChildren(font);
    expect(() => { unmount(); }).not.toThrow();
  });
});

/**
 * The block above is a copy of what the components render, which proves the MECHANISM but would keep
 * passing if EngineLab regressed. So the components are checked directly: no JSX in the app may put a
 * self-closing element and loose text side by side. Two sites had it, both this same placeholder.
 */
describe('no component reintroduces a loose text node beside an element', () => {
  it.each([
    'EngineLab.tsx',
    'ItemActions.tsx',
  ])('%s', (file) => {
    const src = readFileSync(join(__dirname, file), 'utf8');
    const offenders = src.split('\n')
      .map((line, i) => [i + 1, line] as const)
      .filter(([, line]) => /\/> *[A-Za-z]/.test(line) && !line.includes('=>'));
    expect(offenders).toEqual([]);
  });
});
