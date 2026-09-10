// Thin I/O boundary — the ONLY file in the engine that touches the filesystem. It reads a patch
// directory and returns an indexed PatchData snapshot; everything else in the engine is pure. The
// pure indexing step lives in indexPatch.ts so the browser can reuse it without pulling node:fs.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { indexPatch, type BasesFile, type ModsFile } from './indexPatch.ts';
import { shipModsFile } from './shipMods.ts';
import type { PatchData } from './types.ts';

/** Load a patch from `data/patches/<patch>/` on disk (Node only). */
export function loadPatch(patchDir: string): PatchData {
  const modsFile = JSON.parse(readFileSync(join(patchDir, 'mods.json'), 'utf8')) as ModsFile;
  const basesFile = JSON.parse(readFileSync(join(patchDir, 'base_items.json'), 'utf8')) as BasesFile;
  return indexPatch(modsFile, basesFile);
}

/**
 * The patch exactly as the BROWSER gets it: the mods file projected by `shipModsFile`, which drops
 * `tiers[].stats` and every other field `Mod` does not declare (Node only, like `loadPatch`).
 *
 * For tests of anything that runs in the app. Code tested only against `loadPatch` can lean on a field
 * the app never ships and pass every test while doing nothing for a player — which is how the Aldur rune
 * route worked in the suite and nowhere in the app.
 */
export function loadShippedPatch(patchDir: string): PatchData {
  const modsFile = JSON.parse(readFileSync(join(patchDir, 'mods.json'), 'utf8')) as ModsFile;
  const basesFile = JSON.parse(readFileSync(join(patchDir, 'base_items.json'), 'utf8')) as BasesFile;
  return indexPatch(shipModsFile(modsFile), basesFile);
}
