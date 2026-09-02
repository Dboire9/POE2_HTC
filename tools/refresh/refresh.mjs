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
    text: cleanText(rep.text),
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
