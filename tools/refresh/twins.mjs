// Base-type twins: the RePoE variants a row takes its base NAMES from, beyond the one it is built from.
//
// RePoE splits an item class into variants by tag signature, and `refresh.mjs` builds each row from
// ONE of them — the plain one, carrying no base-type family tag (`ezomyte_basetype`, `karui_basetype`,
// …) and no `runeforged`. Most of a class's bases sit in the OTHER variants, though: the campaign bases
// (Leather Vest, Crude Bow, Twig Focus) and the Karui endgame set (Sekhema Sandals, Akoyan Spear) each
// carry a family tag, and every Runeforged or Runemastered base carries `runeforged`. None of those
// names were read, so 1,019 released bases — against the 529 the rows did carry — could not be traced
// back to a row, from a paste or from a streamer's profile.
//
// A variant is folded into a row only when BOTH hold:
//   1. its tags, with every marker tag removed, ARE the row's tags, in the same order. So a variant
//      that adds anything else (`cannon` on the Trarthan Cannon, a doubled `gloves` on the Ascendancy
//      Fists of Stone) or has another attribute (the Str/Dex buckler) is never a twin; and
//   2. it rolls the same pool — the same prefix and suffix groups, with the same tier ids — which is
//      the whole reason one row can stand for both. A tag-twin with a DIFFERENT pool comes back in
//      `differ` for the caller to report and is never folded: reading an item as a row it does not roll
//      like would plan the craft against the wrong pool, with nothing on screen to say so.
//
// Measured on the 2026-07-04 dump: 332 tag-twins across the 52 rows, and all 332 roll their row's pool.
// Pure, with no file access, so the rule is tested on a synthetic class (twins.test.mjs) — the real
// dump never exercises the guard.

/** The part of a variant `refresh.mjs` reads: each prefix and suffix group, with its tier ids. */
export function poolKey(variant) {
  return JSON.stringify(['prefix', 'suffix'].map((type) => Object.entries(variant.mods?.[type] ?? {})
    .map(([group, tiers]) => [group, Object.keys(tiers).sort()])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))));
}

/**
 * The twins of variant `sig` among one class's `variants` (RePoE's `mods_by_base[class]`). `markers`
 * are the tags a twin may add on top of the row's own; `refresh.mjs` passes its SPECIALIZER set.
 */
export function twinsOf(variants, sig, markers) {
  const own = poolKey(variants[sig]);
  const twins = [];
  const differ = [];
  for (const [other, variant] of Object.entries(variants)) {
    if (other === sig) continue;
    if (other.split(',').filter((tag) => !markers.has(tag)).join(',') !== sig) continue;
    (poolKey(variant) === own ? twins : differ).push(other);
  }
  return { twins, differ };
}
