import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { installTranslateGuard } from './translateGuard';

/**
 * What Chrome and Edge do to a page they translate: each text node is swapped for a `<font>` element of
 * their own. React still holds the original text node, so its next update that removes it throws.
 *
 * The tests run IN ORDER: the first one reproduces the crash with the guard not yet installed, which is
 * what makes the rest mean something.
 */
const Line = ({ show }: { show: boolean }) => (
  <p>
    {show && 'Every slam here must hit one '}
    <em>named</em>
  </p>
);

function translate(container: HTMLElement): void {
  for (const node of [...container.querySelector('p')!.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const font = document.createElement('font');
    font.textContent = '这里的每一次撞击都必须命中一个';
    node.parentNode!.replaceChild(font, node);
  }
}

describe('a translated page and React', () => {
  it('crashes without the guard: React removes a text node the translator already replaced', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container, rerender } = render(<Line show />);
    translate(container);
    expect(() => { rerender(<Line show={false} />); }).toThrow(/not a child/);
    silence.mockRestore();
  });

  it('survives the same update once the guard is installed', () => {
    installTranslateGuard();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container, rerender } = render(<Line show />);
    translate(container);
    expect(() => { rerender(<Line show={false} />); }).not.toThrow();
    expect(container.querySelector('em')!.textContent).toBe('named');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('survives an insertion before a replaced text node', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Before = ({ show }: { show: boolean }) => (
      <p>{show && <strong>new</strong>}{'Every slam here must hit one '}<em>named</em></p>
    );
    const { container, rerender } = render(<Before show={false} />);
    translate(container);
    expect(() => { rerender(<Before show />); }).not.toThrow();
    warn.mockRestore();
  });

  it('leaves an untranslated page exactly as React wants it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container, rerender } = render(<Line show />);
    rerender(<Line show={false} />);
    expect(container.querySelector('p')!.textContent).toBe('named');
    rerender(<Line show />);
    expect(container.querySelector('p')!.textContent).toBe('Every slam here must hit one named');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('is installed by the app before React renders anything', () => {
    const main = readFileSync(join(import.meta.dirname, '..', 'main.tsx'), 'utf8');
    const install = main.indexOf('installTranslateGuard();');
    expect(install).toBeGreaterThan(-1);
    expect(install).toBeLessThan(main.indexOf('createRoot('));
  });

  it('installs once, however often it is called', () => {
    const own = () => Object.getOwnPropertyDescriptor(Node.prototype, 'removeChild')!.value as unknown;
    const before = own();
    installTranslateGuard();
    expect(own()).toBe(before);
  });
});
