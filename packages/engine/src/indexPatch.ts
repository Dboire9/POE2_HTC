// Pure, I/O-free indexing of already-parsed patch JSON into a PatchData snapshot. Kept separate from
// loadPatch.ts (which touches node:fs) so the browser/worker can build a snapshot without pulling any
// Node builtins into the bundle.

import type { ItemBase, Mod, PatchData } from './types.ts';

export interface ModsFile { readonly patch: string; readonly mods: Mod[]; }
export interface BasesFile { readonly patch: string; readonly items: ItemBase[]; }

/** Build a PatchData snapshot from already-parsed JSON (no I/O — usable in browser/worker too). */
export function indexPatch(modsFile: ModsFile, basesFile: BasesFile): PatchData {
  if (modsFile.patch !== basesFile.patch) {
    throw new Error(`mixed-patch data: mods=${modsFile.patch} bases=${basesFile.patch}`);
  }
  const mods = new Map<string, Mod>();
  for (const m of modsFile.mods) mods.set(m.id, m);
  const bases = new Map<string, ItemBase>();
  for (const b of basesFile.items) bases.set(b.id, b);
  return { patch: modsFile.patch, mods, bases };
}
