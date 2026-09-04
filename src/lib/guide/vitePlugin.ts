import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { parseGuide } from './parseGuide.ts';

/**
 * BUILD-TIME ONLY. Serves `docs/USER_GUIDE.md`, parsed, as the module `virtual:user-guide`.
 *
 * This file imports the markdown parser and therefore `marked`. It must never be imported by
 * application code — only by `vite.config.ts` and `vitest.config.ts`. `guideParserIsolation.test.ts`
 * walks the import graph from `src/App.tsx` and fails if it ever is.
 *
 * Shared by both configs rather than written twice, so the guide the unit tests render is the guide
 * the build ships. Registering it in vitest is what lets `GuidePage.test.tsx` assert against the real
 * document instead of a fixture that could drift from it.
 *
 * A VIRTUAL MODULE, not an emitted asset: Rollup fixes an asset's content hash before
 * `generateBundle` (the trap `assetFileNames` in vite.config.ts exists to work around), whereas a
 * virtual module is part of a JS chunk and hashed normally. It also lands in the lazily-imported
 * guide chunk rather than the entry chunk.
 *
 * `parseGuide` THROWS on any construct it cannot represent, so a guide written with an image or a
 * code fence fails the build here rather than quietly rendering a page with a section missing.
 */

export const GUIDE_MODULE_ID = 'virtual:user-guide';
const RESOLVED = `\0${GUIDE_MODULE_ID}`;

export function userGuidePlugin(root: string): Plugin {
  const file = resolve(root, 'docs/USER_GUIDE.md');
  return {
    name: 'user-guide',
    resolveId: (id) => (id === GUIDE_MODULE_ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      // So `npm run dev` reloads the page when the guide is edited.
      this.addWatchFile(file);
      return `export default ${JSON.stringify(parseGuide(readFileSync(file, 'utf8')))}`;
    },
  };
}
