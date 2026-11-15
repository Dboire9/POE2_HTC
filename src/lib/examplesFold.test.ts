import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFolded, writeFolded } from './examplesFold';

describe('the fold of the ready-crafts card', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('is open until folded, and remembers both ways', () => {
    expect(readFolded()).toBe(false);
    writeFolded(true);
    expect(readFolded()).toBe(true);
    writeFolded(false);
    expect(readFolded()).toBe(false);
  });

  // A private window, or storage the browser refuses: the card opens rather than the tab failing.
  it('opens, and never throws, when the browser refuses storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => { writeFolded(true); }).not.toThrow();
    expect(readFolded()).toBe(false);
  });
});
