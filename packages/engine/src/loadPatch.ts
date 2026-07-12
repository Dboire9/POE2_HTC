// Thin I/O boundary — the ONLY file in the engine that touches the filesystem. It reads a patch
// directory and returns an indexed PatchData snapshot; everything else in the engine is pure. The
// pure indexing step lives in indexPatch.ts so the browser can reuse it without pulling node:fs.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { indexPatch, type BasesFile, type ModsFile } from './indexPatch.ts';
import type { PatchData } from './types.ts';

/** Load a patch from `data/patches/<patch>/` on disk (Node only). */
export function loadPatch(patchDir: string): PatchData {
  const modsFile = JSON.parse(readFileSync(join(patchDir, 'mods.json'), 'utf8')) as ModsFile;
  const basesFile = JSON.parse(readFileSync(join(patchDir, 'base_items.json'), 'utf8')) as BasesFile;
  return indexPatch(modsFile, basesFile);
}
