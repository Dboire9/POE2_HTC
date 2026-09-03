#!/usr/bin/env node
// Phase-0 data refresh: regenerate our-schema mod/base data for patch 0.5.0 from the authoritative
// RePoE-fork PoE2 dump (game client 4.5.4.3). NORMAL-craft pools only in this pass (essence /
// desecrated / perfect_essence are deferred — they are not in RePoE's mods_by_base normal pools).
//
// Source of truth:
//   - mods_by_base.json  -> per-base, per-tier RESOLVED spawn weights (tag model already collapsed)
//   - mods.json          -> per-tier name / required_level / stat ranges / tags / text / group
// Weights here are game-file weights (outdated for many mods per CLAUDE.md); community-verified
// corrections belong in weights_overrides.json and win at load time. This pass does NOT invent them.
//
// Output: data/patches/0.5.0/{mods,base_items}.json  (staged; does not touch the 0.5 Java baseline).
//
// Usage: node tools/refresh/refresh.mjs [repoeDir=tools/refresh/cache] [outDir=data/patches/0.5.0] [baselineDir=data/patches/0.5]

import { templateFixedRoll } from './modText.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPOE_DIR = process.argv[2] || join(ROOT, 'tools/refresh/cache');
const OUT_DIR = process.argv[3] || join(ROOT, 'data/patches/0.5.0');
const BASELINE_DIR = process.argv[4] || join(ROOT, 'data/patches/0.5');
const PATCH = '0.5.0';
const GENERATED = '2026-07-04';
const SOURCE = 'regenerated from RePoE-fork PoE2 dump (client 4.5.4.3); NORMAL pools only '
  + '(essence/desecrated deferred). Structure (tiers/ilvl/ranges/pools) is authoritative; WEIGHTS are '
  + 'game-file placeholders (uniformly 1/0 in the 0.5 dump) and MUST be replaced by community-verified '
  + 'weights via weights_overrides.json before probabilities are meaningful.';

const load = (dir, f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const repoeMods = load(REPOE_DIR, 'repoe_mods.json');
const repoeByBase = load(REPOE_DIR, 'repoe_mods_by_base.json');
const baseline = load(BASELINE_DIR, 'base_items.json');
// Only for DISPLAY names on the spell-element variants below — a player matches their stash by the
// base's real name ("Frigid Wand"), never by a tag set.
const repoeBaseItems = load(REPOE_DIR, 'repoe_base_items.json');

// --- our base id -> (RePoE item class, required attribute tag) --------------------------------
// Class comes from the base's category; the attribute tag (for armour/shields) from the id suffix.
const CATEGORY_CLASS = {
  Wands: 'Wands', Sceptres: 'Sceptres', Bows: 'Bows', Crossbows: 'Crossbows',
  Quarterstaves: 'Quarterstaves', Staves: 'Staves', Spears: 'Spears',
  OneHand_Maces: 'One Hand Maces', TwoHand_Maces: 'Two Hand Maces',
  Foci: 'Foci', Quivers: 'Quivers', Bucklers: 'Bucklers',
  Amulets: 'Amulets', Rings: 'Rings', Belts: 'Belts',
  Body_Armours: 'Body Armours', Boots: 'Boots', Gloves: 'Gloves', Helmets: 'Helmets',
  Shields: 'Shields',
};

// Bases the 0.5 Java baseline never had, because the Java engine never modelled them.
//
// The loop below reads only `id`, `name` and `category` off each baseline entry — the pools are
// rebuilt from RePoE every run — so the baseline serves as a ROSTER, and extending the roster here is
// what adds an item class. The alternative was editing `data/patches/0.5/base_items.json`, and that
// file is the frozen differential anchor for the Java-era fixtures; growing it to add a slot Java
// never had would put new data inside the thing whose job is to not change.
//
// ONE belt base, matching how Amulets and Rings are already handled. All 20 of RePoE's belt bases
// share a byte-identical craftable pool (166 mods, same mod -> tier -> ilvl map across all three tag
// groups, verified 2026-09-02); they differ only in `drop_level` and in their IMPLICIT, and an
// implicit is fixed on the base rather than rolled, so no currency in this model can touch it.
// Twenty entries would be twenty identical rows in the picker — four of them literally sharing the
// name "Runemastered Heavy Belt".
const EXTRA_BASES = [
  { id: 'Belts', name: 'Belts', category: 'Belts' },
];
// Tags that mark a NON-canonical (specialised) base variant; the generic base has none of them.
const SPECIALIZER = new Set([
  'ezomyte_basetype', 'maraketh_basetype', 'vaal_basetype', 'karui_basetype',
  'runeforged', 'not_for_sale', 'demigods',
]);
const isSpecializer = (t) => SPECIALIZER.has(t) || /^no_.*_spell_mods$/.test(t);

// Attribute tag a base requires, derived from its id suffix (e.g. Body_Armours_str_int -> str_int_armour).
function attributeTag(baseId, cls) {
  const m = baseId.match(/_(str|dex|int)((?:_(?:str|dex|int))*)$/);
  if (!m) return null;
  const combo = (m[1] + m[2]).split('_').filter(Boolean); // e.g. ["str","int"]
  const order = ['str', 'dex', 'int'];
  const sorted = order.filter((a) => combo.includes(a));
  if (cls === 'Shields') return sorted.join('_') + '_shield'; // str_shield, str_dex_shield, ...
  return sorted.join('_') + '_armour'; // str_armour, str_int_armour, ...
}

// Pick the canonical variant of a class for a base: zero specializer tags, matching attribute tag,
// most bases as tie-break.
function pickVariant(cls, attrTag) {
  const variants = repoeByBase[cls];
  if (!variants) throw new Error(`RePoE has no class "${cls}"`);
  // An attribute *discriminator* tag, e.g. str_armour / str_dex_armour / str_shield. Shields carry
  // BOTH a *_armour and a *_shield tag, so we only compare within the same suffix kind.
  const DISC = /^(?:str|dex|int)(?:_(?:str|dex|int))*_(armour|shield)$/;
  const kind = attrTag ? (attrTag.endsWith('_shield') ? 'shield' : 'armour') : null;
  let candidates = Object.entries(variants).filter(([sig]) => {
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

// --- text cleanup: strip wiki links [A|B]->B / [A]->A, collapse numeric ranges to # ------------
function cleanText(t) {
  if (t == null) return null;
  return t
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, '$2')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\((?:[-+]?\d+(?:\.\d+)?)(?:-[-+]?\d+(?:\.\d+)?)?\)/g, '#');
}

// Resolve a mod's spawn weight for a base = weight of the first base tag that appears in the mod's
// spawn_weights list (PoE first-match convention). NOTE: in the 0.5 game dump these are uniformly 1
// (or 0) — placeholders. Real weights come from community data via weights_overrides.json.
function resolveWeight(rm, baseTags) {
  for (const sw of rm.spawn_weights || []) {
    if (baseTags.includes(sw.tag)) return sw.weight;
  }
  return 0;
}

// --- build one of our mods from a RePoE group ------------------------------------------------
// modIds: the tier mod ids for this group (keys of the mods_by_base group object; its VALUES are
// required_level, not weight — we take level + real weight from mods.json instead).
function buildMod(baseId, type, group, modIds, baseTags) {
  const tierIds = modIds.filter((id) => {
    if (!repoeMods[id]) { warn(`missing RePoE mod entry: ${id} (base ${baseId})`); return false; }
    return true;
  });
  tierIds.sort((a, b) => (repoeMods[a].required_level - repoeMods[b].required_level));

  const tiers = tierIds.map((id) => {
    const rm = repoeMods[id];
    return {
      name: rm.name || id,
      ilvl: rm.required_level ?? 0,
      weight: resolveWeight(rm, baseTags),
      ranges: (rm.stats || []).map((s) => [s.min, s.max]),
      stats: (rm.stats || []).map((s) => s.id),
    };
  });

  const rep = repoeMods[tierIds[0]] || {};
  return {
    id: `${baseId}/${group}`,
    group,
    field: group,
    source: 'normal',
    type,
    categories: (rep.stats || []).map((s) => s.id),
    family: (rep.groups && rep.groups[0]) || group,
    // A RePoE mod can list several groups; `family` is the primary and `families` the full exclusion
    // set (see packages/engine/src/pool.ts familiesOf). No shipped NORMAL mod is multi-group today
    // (RePoE's 58 are Unique/Map/Crafted), so this is hardening, not a live fix — but the truncation
    // was the same bug the poe2db path had, and silently dropping groups is how it stayed hidden.
    ...(rep.groups && rep.groups.length > 1 ? { families: rep.groups } : {}),
    tags: rep.implicit_tags || [],
    text: templateFixedRoll(cleanText(rep.text), tiers),
    tiers,
  };
}

const warnings = [];
const warn = (m) => warnings.push(m);

// --- main: iterate the baseline roster, plus any base Java never had ---------------------------
const mods = new Map(); // id -> mod
const items = [];
const mapping = []; // for the log

for (const base of [...baseline.items, ...EXTRA_BASES]) {
  const cls = CATEGORY_CLASS[base.category];
  if (!cls) { warn(`no class mapping for category ${base.category} (base ${base.id})`); continue; }
  const attrTag = attributeTag(base.id, cls);
  const picked = pickVariant(cls, attrTag);
  if (!picked) { warn(`no canonical variant for ${base.id} (class ${cls}, attr ${attrTag})`); continue; }
  mapping.push(`${base.id.padEnd(24)} -> ${cls} :: [${picked.sig}]`
    + (picked.ambiguous ? `  (tie-broken; alt: ${picked.alt.map((s) => '[' + s + ']').join(' ')})` : ''));

  const baseTags = picked.sig.split(',');
  const pools = { normal: { prefixes: [], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } };
  const m = picked.variant.mods || {};
  for (const [type, key] of [['prefix', 'prefixes'], ['suffix', 'suffixes']]) {
    const groups = m[type] || {};
    for (const [group, modWeights] of Object.entries(groups)) {
      const mod = buildMod(base.id, type, group, Object.keys(modWeights), baseTags);
      if (mods.has(mod.id)) { warn(`duplicate mod id ${mod.id}`); continue; }
      mods.set(mod.id, mod);
      pools.normal[key].push(mod.id);
    }
  }
  items.push({ id: base.id, name: base.name, category: base.category, class: cls, pools });
}

// --- spell-element base variants (Wands, Staves) ------------------------------------------------
//
// A wand or staff base can be locked to ONE spell element, and the dump says so outright: the base
// carries negative tags (`no_fire_spell_mods`, …) and every mod they gate lists that tag at weight 0.
// A Frigid Wand rolls cold spell mods and no others; an Attuned Wand rolls all five.
//
// `pickVariant` deliberately skips these — `isSpecializer` matches `/^no_.*_spell_mods$/` — so every
// class collapsed to its unrestricted variant, and the app shipped the Attuned Wand as "Wands". That
// is right for 9 of 18 wand bases and wrong for the other 7, in two ways: it OFFERS mods the base can
// never roll, and, because the gated mods stay in the denominator, it understates the odds of every
// mod that IS legal — 1.33x on the prefix side of a single-element wand at ilvl 82, compounding over
// a multi-step craft.
//
// This is the same rule the belt note above applies, with the opposite answer. Belts ship as ONE base
// because all 20 pools are byte-identical; the armour slots carry several because the Str/Dex/Int
// split genuinely changes the pool. Here it genuinely changes the pool, so here they split.
//
// Three things make this cheap, and all three were measured rather than assumed:
//
//  1. **No new mods.** A variant's pool is a SUBSET of its parent's groups, and every group they share
//     resolves to the same weight (checked across all 10 variants: 118-123 shared mods each, zero
//     differing, zero gated-to-0 — the variant's own `mods` list is already the restricted pool). So a
//     variant reuses the parent's `Wands/<group>` ids and `mods.json` does not grow by one entry.
//  2. **The downstream stages need no map entry.** `apply_weights` and `apply_pools` resolve a poe2db
//     page from `base.category`, not `base.id`, for everything outside `ARMOUR_CATS` — so a variant
//     keeping `category: 'Wands'` reads the same page as its parent. This is the three-map trap the
//     belt note warns about, sidestepped by varying only the id.
//  3. **Share links keep working.** The parent keeps the id `Wands`, so a link encoding it still
//     resolves, and still means what it meant: the unrestricted base.
//
// What is NOT modelled, and is not asserted either way: whether the desecrated and essence pools are
// element-gated too. Those come from poe2db's class page, and nothing in the RePoE dump gates a
// non-normal mod with these tags — so a variant inherits its parent's carved pool. See docs/validation.md.
const SPELL_ELEMENTS = ['fire', 'cold', 'lightning', 'physical', 'chaos'];
const blockedElements = (sig) => sig.split(',')
  .map((t) => /^no_(.+)_spell_mods$/.exec(t)?.[1])
  .filter((e) => e !== undefined);

/**
 * Display names of the real game bases behind a RePoE variant, e.g. ["Frigid Wand"].
 *
 * `[DNT…]` marks a name the game itself says Do Not Translate — a developer placeholder, not something
 * a player can own. Two of them sit in the unrestricted staff variant and would have been offered as
 * the answer to "which staff is this row?".
 */
const baseNamesOf = (variant) => [...new Set((variant.bases || [])
  .map((path) => repoeBaseItems[path]?.name)
  .filter((n) => n && !/^\[DNT/i.test(n)))].sort();

for (const parent of [...items]) {
  const variants = repoeByBase[parent.class];
  if (!variants) continue;
  const restricted = Object.entries(variants).filter(([sig]) =>
    blockedElements(sig).length > 0 && !sig.split(',').some((t) => SPECIALIZER.has(t)));
  if (restricted.length === 0) continue;

  // The parent is the unrestricted base, and it has real names too — a player holding a Siphoning Wand
  // needs to be told that is the "any element" row, or the split has only moved the guesswork.
  const parentNames = baseNamesOf(variants[
    Object.keys(variants).find((sig) => blockedElements(sig).length === 0 && !sig.split(',').some((t) => SPECIALIZER.has(t)))
  ] || {});
  if (parentNames.length > 0) parent.name = parentNames.join(', ');

  for (const [sig, v] of restricted) {
    const allowed = SPELL_ELEMENTS.filter((e) => !blockedElements(sig).includes(e));
    // Every shipped variant blocks four of the five. More than one left would mean a pool shape this
    // id scheme cannot name, so say so rather than inventing a name for it.
    if (allowed.length !== 1) { warn(`${parent.id}: variant [${sig}] allows ${allowed.length} elements, skipped`); continue; }
    const element = allowed[0];
    const id = `${parent.id}_${element}`;
    if (items.some((b) => b.id === id)) { warn(`duplicate spell variant ${id}`); continue; }
    const names = baseNamesOf(v);
    const pools = { normal: { prefixes: [], suffixes: [] }, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } };
    for (const [type, key] of [['prefix', 'prefixes'], ['suffix', 'suffixes']]) {
      const groups = new Set(Object.keys(v.mods?.[type] || {}));
      // The parent's ids are `${parent.id}/${group}`, so the group is what follows the first slash.
      pools.normal[key] = parent.pools.normal[key].filter((mid) => groups.has(mid.slice(parent.id.length + 1)));
    }
    items.push({ id, name: names.join(', ') || id, category: parent.category, class: parent.class, pools });
    mapping.push(`${id.padEnd(24)} -> ${parent.class} :: [${sig}]  (${element} only: ${names.join(', ')})`);
  }
}

// --- emit --------------------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
const sortedMods = [...mods.values()].sort((a, b) => a.id.localeCompare(b.id));
const tierCount = sortedMods.reduce((n, mm) => n + mm.tiers.length, 0);

writeJson(join(OUT_DIR, 'mods.json'), {
  patch: PATCH, generated: GENERATED, source: SOURCE, count: sortedMods.length, mods: sortedMods,
});
writeJson(join(OUT_DIR, 'base_items.json'), {
  patch: PATCH, generated: GENERATED, source: SOURCE, count: items.length,
  items: items.sort((a, b) => a.id.localeCompare(b.id)),
});

console.log(`Refreshed patch ${PATCH} from RePoE (${REPOE_DIR})`);
console.log(`  bases: ${items.length}   mods: ${sortedMods.length}   tiers: ${tierCount}`);
console.log('\n  base -> RePoE variant:');
for (const line of mapping) console.log('    ' + line);
if (warnings.length) {
  console.log(`\n  WARNINGS (${warnings.length}):`);
  for (const w of warnings.slice(0, 30)) console.log('    - ' + w);
}
console.log(`\n  wrote ${join(OUT_DIR, 'mods.json')}`);
console.log(`  wrote ${join(OUT_DIR, 'base_items.json')}`);

function writeJson(path, obj) { writeFileSync(path, JSON.stringify(obj, null, 2) + '\n'); }
