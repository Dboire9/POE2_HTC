// How a base of ours maps onto RePoE's tag model, and what a mod's spawn weight is on it.
//
// Extracted from refresh.mjs so a SECOND script can ask the same questions and get the same answers.
// `apply_runes.mjs` needs every one of these — which RePoE class a category is, which variant of that
// class a base row stands for, and what weight a mod has on it — and a second copy of any of them is
// how two scripts come to disagree about what a base can roll. Same reason `modText.mjs` and
// `twins.mjs` are their own modules.
//
// Everything here is PURE: `pickVariant` takes the RePoE table rather than reading a module-level one,
// so importing this file loads no data and writes nothing.

/** Our base category -> the class key RePoE files it under. Note the SPACES: "One Hand Maces", not
 *  "One_Hand_Maces". Getting that wrong yields no variant at all rather than a wrong one. */
export const CATEGORY_CLASS = {
  Wands: 'Wands', Sceptres: 'Sceptres', Bows: 'Bows', Crossbows: 'Crossbows',
  Quarterstaves: 'Quarterstaves', Staves: 'Staves', Spears: 'Spears',
  OneHand_Maces: 'One Hand Maces', TwoHand_Maces: 'Two Hand Maces',
  Foci: 'Foci', Quivers: 'Quivers', Bucklers: 'Bucklers',
  Amulets: 'Amulets', Rings: 'Rings', Belts: 'Belts',
  Body_Armours: 'Body Armours', Boots: 'Boots', Gloves: 'Gloves', Helmets: 'Helmets',
  Shields: 'Shields',
};

// Tags that mark a NON-canonical (specialised) base variant; the generic base has none of them. A
// variant carrying nothing but these beyond a row's own tags, and rolling its pool, is that row's TWIN
// (twins.mjs): the row is still built from the plain variant, but it answers to the twin's base names.
export const SPECIALIZER = new Set([
  'ezomyte_basetype', 'maraketh_basetype', 'vaal_basetype', 'karui_basetype',
  'runeforged', 'not_for_sale', 'demigods',
]);
export const isSpecializer = (t) => SPECIALIZER.has(t) || /^no_.*_spell_mods$/.test(t);

/** Attribute tag a base requires, from its id suffix (Body_Armours_str_int -> str_int_armour). */
export function attributeTag(baseId, cls) {
  const m = baseId.match(/_(str|dex|int)((?:_(?:str|dex|int))*)$/);
  if (!m) return null;
  const combo = (m[1] + m[2]).split('_').filter(Boolean);
  const order = ['str', 'dex', 'int'];
  const sorted = order.filter((a) => combo.includes(a));
  if (cls === 'Shields') return sorted.join('_') + '_shield'; // str_shield, str_dex_shield, ...
  return sorted.join('_') + '_armour'; // str_armour, str_int_armour, ...
}

/**
 * Pick the canonical variant of a class for a base: zero specializer tags, matching attribute tag,
 * most bases as tie-break. `repoeByBase` is RePoE's `mods_by_base.json`.
 */
export function pickVariant(repoeByBase, cls, attrTag) {
  const variants = repoeByBase[cls];
  if (!variants) throw new Error(`RePoE has no class "${cls}"`);
  // An attribute *discriminator* tag, e.g. str_armour / str_dex_armour / str_shield. Shields carry
  // BOTH a *_armour and a *_shield tag, so we only compare within the same suffix kind.
  const DISC = /^(?:str|dex|int)(?:_(?:str|dex|int))*_(armour|shield)$/;
  const kind = attrTag ? (attrTag.endsWith('_shield') ? 'shield' : 'armour') : null;
  const candidates = Object.entries(variants).filter(([sig]) => {
    const tags = sig.split(',');
    if (tags.some(isSpecializer)) return false;
    if (attrTag && !tags.includes(attrTag)) return false;
    // Reject a variant carrying a DIFFERENT attribute of the same kind (e.g. str_dex when we want str).
    if (attrTag && tags.some((t) => DISC.test(t) && t.endsWith('_' + kind) && t !== attrTag)) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (b[1].bases?.length || 0) - (a[1].bases?.length || 0));
  return {
    sig: candidates[0][0], variant: candidates[0][1],
    ambiguous: candidates.length > 1,
    alt: candidates.slice(1).map(([s]) => s),
  };
}

/**
 * RePoE's display text, as our data spells it: wiki links unwrapped (`[A|B]` -> B, `[A]` -> A) and
 * numeric ranges collapsed to `#`, so "+(20-29) to maximum Life" reads "+# to maximum Life".
 *
 * Shared for the same reason the rest of this file is: two scripts writing mod `text` by two slightly
 * different rules is a difference a player sees, in a field the pickers search on.
 */
export function cleanText(t) {
  if (t == null) return null;
  return t
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, '$2')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\((?:[-+]?\d+(?:\.\d+)?)(?:-[-+]?\d+(?:\.\d+)?)?\)/g, '#');
}

/**
 * A mod's spawn weight on a base = the weight of the FIRST tag in the MOD's `spawn_weights` list that
 * the base carries (PoE's first-match convention). Order matters and the encoding is often negative: a
 * rune-pool mod lists the bases it must NOT roll on at weight 0 ahead of its pool tag at weight 1, so
 * `warstaff` appearing before `destruction` is what keeps that mod off a Quarterstaff.
 *
 * NOTE: in the 0.5 game dump these weights are uniformly 1 (or 0) — placeholders. Real NORMAL weights
 * come from community data via weights_overrides.json; the rune pools have none at all, which is why
 * `apply_runes.mjs` substitutes an assumed one and says so.
 */
export function resolveWeight(rm, baseTags) {
  for (const sw of rm.spawn_weights || []) {
    if (baseTags.includes(sw.tag)) return sw.weight;
  }
  return 0;
}
