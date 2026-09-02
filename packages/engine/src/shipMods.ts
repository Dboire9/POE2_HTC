// The `mods.json` the BROWSER downloads, derived at build time from the one in `data/patches/`.
//
// Those are two different jobs and the repo had been doing both with one file. On disk it is the
// versioned RECORD: pretty-printed so a data refresh produces a readable `git diff`, and complete so
// `dataIntegrity.test.ts` can check the import's provenance and a future feature can reach for a
// field nothing reads yet. Over the wire it is a DOWNLOAD, where indentation and unread fields are
// pure cost — measured against poe2htc.com's own compression (brotli q3, lgwin 19), 137,701 bytes
// and 6.15 ms of JSON.parse, of which this projection removes 72,688 bytes and 2.83 ms.
//
// TODO 13 proposed splitting the file into "solver" and "display" halves so the Worker could start
// before the labels arrived. Two measurements killed that (see docs/validation.md, "Shipping the
// patch data"): the split is not available — `alternatives.ts` reads `tiers[].ranges` and every
// result label goes through `engineMap` INSIDE the worker, so the worker needs `text` and `ranges`
// too — and even granting it, two files cost 74,015 wire bytes against this one file's 65,013,
// because splitting duplicates the id column and hands brotli two smaller corpora. The simpler
// change is strictly the bigger win, so there is no half-loaded state and no second fetch.
//
// The projection is typed `ModsFile -> ModsFile` on purpose, and that is the whole safety argument:
// forget a field the engine reads and the return type stops matching, so `type-check:engine` fails
// rather than production quietly losing data. Excess-property checking closes the other direction —
// a field this builds that `Mod` does not declare is also an error. So the type in types.ts and the
// bytes in the asset cannot drift apart. The `: Mod` / `: Tier` annotations on the two callbacks are
// what buy the second half — contextual typing through `.map` alone does NOT run excess-property
// checking, so without them a field `Mod` does not declare would ship silently (verified both ways).

import type { ModsFile } from './indexPatch.ts';
import type { Mod, Tier } from './types.ts';

/** Project a parsed `mods.json` onto exactly the fields `Mod`/`Tier` declare. Idempotent. */
export function shipModsFile(file: ModsFile): ModsFile {
  return {
    patch: file.patch,
    mods: file.mods.map((m): Mod => ({
      id: m.id,
      source: m.source,
      type: m.type,
      family: m.family,
      // Spread rather than `families: m.families` — `exactOptionalPropertyTypes` (on in the package
      // tsconfigs) refuses to assign `undefined` to an optional field, and a bare `undefined` would
      // serialize the key away anyway while making the object shape differ from the input's.
      ...(m.families ? { families: m.families } : {}),
      tags: m.tags,
      text: m.text,
      tiers: m.tiers.map((t): Tier => ({ name: t.name, ilvl: t.ilvl, weight: t.weight, ranges: t.ranges })),
    })),
  };
}

/** The exact bytes to serve: projected, and minified (the record on disk stays pretty). */
export function shipModsJson(file: ModsFile): string {
  return JSON.stringify(shipModsFile(file));
}
