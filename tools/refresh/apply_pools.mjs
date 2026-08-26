#!/usr/bin/env node
// Build the ESSENCE and DESECRATED pools for patch 0.5.0 from the cached poe2db pages and merge them
// into data/patches/0.5.0/{mods,base_items}.json (+ emit essences.json).
//
// Why a separate step from refresh.mjs/apply_weights.mjs: RePoE's mods_by_base carries only the normal
// craft pools, so refresh.mjs (RePoE structure) can't see essence/desecrated. poe2db, however, embeds
// those pools per item-class page and the parser (poe2db.mjs) already extracts them. This script is the
// poe2db-only path for the two non-normal pools, kept consistent with the normal pipeline:
//   - families come from poe2db ModFamilyList (same namespace the normal weight-join keys on), so
//     family EXCLUSION lines up with the normal mods;
//   - ids are namespaced (Essence_/Desecrated_) so they never collide with a normal `${base}/${group}`.
//
// Pool semantics (see packages/engine/src/probability.ts):
//   DESECRATED — each poe2db row is its OWN single-tier mod (ilvl 65). Rows that share a
//     family are DISTINCT mods (different boss/text) that merely share an exclusion group, so we do
//     NOT group them. Boss tags (amanamu_mod/kurgal_mod/ulaman_mod) are preserved for the boss-omen
//     path; the plain path draws weight-based from the combined normal∪desecrated pool.
//   ESSENCE — rows are grouped by (type, family, essence) into a mod whose TIERS are the essence
//     LEVELS (Lesser/Normal/Greater). Essences force deterministically, so weight is 0 (the engine
//     ignores it; the data-integrity guardrail allows 0 only for the essence source). poe2db carries
//     no Perfect essences, so perfect_essence stays deferred (engine anchored on the 0.5 snapshot).
//
// Usage: node tools/refresh/apply_pools.mjs
// Reads:  data/patches/0.5.0/{mods,base_items}.json + tools/refresh/cache/poe2db/*.html
// Writes: data/patches/0.5.0/{mods,base_items,essences}.json ; prints a coverage summary.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePoe2dbHtml } from './poe2db.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'data/patches/0.5.0');
const PDB = join(ROOT, 'tools/refresh/cache/poe2db');
const GENERATED = '2026-07-13';

/**
 * The spawn weight every DESECRATED mod is given. poe2db publishes none (it reports a literal 1 for
 * every row), so this cannot be read off the data — but as of 2026-08-24 it is MEASURED IN GAME rather
 * than assumed. Named and exported so the shipped snapshot can be asserted against it: a silent
 * refresh back to poe2db's 1 would quietly restore 1-in-121,510 odds.
 *
 * The observation: 40 bones on EMPTY Rare `Helmets_dex_int`. A bone offers three modifiers, so that is
 * **120 modifiers shown, of which 22 were "carved by the Abyss"** — 18.3% per draw.
 * `scripts/desecrate-weight.mts` inverts it through the same pool maths the engine uses: maximum
 * likelihood **2,512**, plausible range **1,995-3,981**. The old 1,000 predicted 7.6% per draw and
 * sits outside that interval.
 *
 * Rounded to 2,500 — a 120-draw sample does not support four significant figures, and every value in
 * the interval reads the same evidence.
 *
 * COUNT MODIFIERS, NOT OFFERS. This sample was first recorded as "22 of 40 offers held a carved mod"
 * and fitted at 3,981, 50% too high, before the reporter corrected it. Modifiers are also the better
 * statistic — 3N Bernoulli draws instead of N for the same bones spent, which is why the interval here
 * is tighter than the offer-based one was despite fitting a lower number.
 *
 * The three-draw model itself is corroborated independently: the observer saw several offers holding
 * two carved mods and none holding three, and at this weight the model predicts 3.3 two-carved offers
 * in 40 and a 78% chance of seeing no three-carved offer at all. See docs/validation.md D4.
 */
export const DESECRATED_ASSUMED_WEIGHT = 2500;

const ARMOUR_CATS = new Set(['Body_Armours', 'Boots', 'Gloves', 'Helmets', 'Shields']);
const CATEGORY_CLASS = {
  Wands: 'Wands', Sceptres: 'Sceptres', Bows: 'Bows', Crossbows: 'Crossbows',
  Quarterstaves: 'Quarterstaves', Staves: 'Staves', Spears: 'Spears',
  OneHand_Maces: 'One_Hand_Maces', TwoHand_Maces: 'Two_Hand_Maces',
  Foci: 'Foci', Quivers: 'Quivers', Bucklers: 'Bucklers', Amulets: 'Amulets', Rings: 'Rings',
};
const pageName = (base) => (ARMOUR_CATS.has(base.category) ? base.id : CATEGORY_CLASS[base.category]);
const BOSS_TAGS = new Set(['amanamu_mod', 'kurgal_mod', 'ulaman_mod']);

// An armour/shield page embeds the essence & desecrated tables once PER attribute variant, each row
// carrying its variant's discriminator tag (str_armour, dex_int_armour, str_shield, …). To build the
// pool for ONE base we keep only rows for that base's attribute (mirroring refresh.mjs/pickVariant):
// a row is kept if it has NO attribute-discriminator tag (attribute-agnostic) or carries THIS base's.
const DISC = /^(?:str|dex|int)(?:_(?:str|dex|int))*_(?:armour|shield)$/;
function attributeTag(base) {
  const m = base.id.match(/_(str|dex|int)((?:_(?:str|dex|int))*)$/);
  if (!m) return null; // weapons / jewellery / bucklers / foci / quivers — no attribute variants
  const combo = (m[1] + m[2]).split('_').filter(Boolean);
  const sorted = ['str', 'dex', 'int'].filter((a) => combo.includes(a));
  const kind = base.category === 'Shields' ? 'shield' : 'armour';
  return `${sorted.join('_')}_${kind}`;
}
function keepForBase(row, attrTag) {
  const disc = (row.tags || []).filter((t) => DISC.test(t));
  if (disc.length === 0) return true;      // attribute-agnostic row → applies to every variant
  return attrTag != null && disc.includes(attrTag);
}

const warnings = [];
const warn = (m) => warnings.push(m);

// (35—44)% increased ... -> [[35,44]] ; +(9—12) to ... -> [[9,12]] ; flat text -> [].
function parseRanges(text) {
  const out = [];
  const re = /\(([-+]?\d+(?:\.\d+)?)\s*[–—-]\s*([-+]?\d+(?:\.\d+)?)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push([num(m[1]), num(m[2])]);
  return out;
}
const num = (s) => { const n = Number(s); return Number.isInteger(n) ? n : n; };

// Collapse (a—b) numeric ranges to '#', mirroring refresh.mjs cleanText, so display text matches the
// normal pool convention ("+# to all Attributes").
function cleanText(text) {
  if (text == null) return null;
  return text
    .replace(/\(([-+]?\d+(?:\.\d+)?)\s*[–—-]\s*([-+]?\d+(?:\.\d+)?)\)/g, '#')
    .replace(/[^\S\n]+/g, ' ') // collapse spaces/tabs but preserve the \n that separates stat lines
    .replace(/ *\n */g, '\n')
    .trim();
}

// Slug -> { level: 'LESSER'|'NORMAL'|'GREATER', essence: 'the Infinite' }. null if not an essence slug.
function parseEssenceSlug(slug) {
  const m = slug.match(/^(Lesser_|Greater_|Perfect_)?Essence_of_(.+)$/);
  if (!m) return null;
  const level = m[1] === 'Lesser_' ? 'LESSER' : m[1] === 'Greater_' ? 'GREATER'
    : m[1] === 'Perfect_' ? 'PERFECT' : 'NORMAL';
  return { level, essence: m[2].replace(/_/g, ' ') };
}
const LEVEL_WORD = { LESSER: 'Lesser Essence of', NORMAL: 'Essence of', GREATER: 'Greater Essence of', PERFECT: 'Perfect Essence of' };
const hrefOf = (name) => (String(name).match(/href="([^"]+)"/) || [])[1] || null;
// Essence base name from a slug, level prefix stripped: Perfect_Essence_of_the_Infinite -> "the Infinite".
const essenceNameOf = (slug) =>
  (slug || '').replace(/^(Lesser|Greater|Perfect)_/, '').replace(/^Essence_of_/, '').replace(/_/g, ' ') || null;

// ---- load current 0.5.0 (normal-only) snapshot ------------------------------------------------
const modsFile = JSON.parse(readFileSync(join(OUT, 'mods.json'), 'utf8'));
const basesFile = JSON.parse(readFileSync(join(OUT, 'base_items.json'), 'utf8'));

// Idempotent: drop any previously-added essence/desecrated mods and clear those pools, keeping normal.
modsFile.mods = modsFile.mods.filter((m) => m.source === 'normal');
for (const base of basesFile.items) {
  base.pools.desecrated = { prefixes: [], suffixes: [] };
  base.pools.essence = { prefixes: [], suffixes: [] };
}
const modsById = new Map(modsFile.mods.map((m) => [m.id, m]));

// essence name -> { LESSER:Set, NORMAL:Set, GREATER:Set, PERFECT:Set } of forced mod ids (for essences.json)
const essenceMap = new Map();
const addEssenceForce = (essence, level, modId) => {
  if (!essenceMap.has(essence)) essenceMap.set(essence, { LESSER: new Set(), NORMAL: new Set(), GREATER: new Set(), PERFECT: new Set() });
  essenceMap.get(essence)[level]?.add(modId);
};

const pageCache = new Map();
function getPools(page) {
  if (!pageCache.has(page)) {
    let pools = null;
    try { pools = parsePoe2dbHtml(readFileSync(join(PDB, `${page}.html`), 'utf8')); }
    catch { /* missing page */ }
    pageCache.set(page, pools);
  }
  return pageCache.get(page);
}

let desecratedAdded = 0; let essenceAdded = 0; let perfectAdded = 0;

for (const base of basesFile.items) {
  const pools = getPools(pageName(base));
  if (!pools) { warn(`no poe2db page for ${base.id} (${pageName(base)})`); continue; }
  const attrTag = attributeTag(base);
  const used = new Set([...base.pools.normal.prefixes, ...base.pools.normal.suffixes]);
  const uniqueId = (stem) => {
    let id = `${base.id}/${stem}`;
    for (let n = 2; used.has(id) || modsById.has(id); n++) id = `${base.id}/${stem}_${n}`;
    used.add(id);
    return id;
  };

  // -- DESECRATED: one mod per row ---------------------------------------------------------------
  // Weight is ASSUMED, not observed. poe2db publishes no spawn weight for these rows — it reports 1
  // for every one of them — and an unomened Desecration draws BY WEIGHT from the combined
  // normal ∪ desecrated pool. Taking that 1 literally against normal weights of several thousand
  // makes a bone produce a desecrated mod roughly 1 time in 121,510 on a Body Armour, which cannot be
  // right for an item whose entire purpose is to add one. 1000 puts a desecrated mod on roughly the
  // footing of an ordinary normal mod (1 in ~132 there). It is a judgement call, so the app tells
  // users so — see PriceBasisNote's `exactOdds` and docs/validation.md D4. The boss-omen path is
  // count-uniform and ignores weights entirely, so none of this touches it.
  for (const row of pools.desecrated || []) {
    if (!keepForBase(row, attrTag)) continue;
    if (row.type !== 'prefix' && row.type !== 'suffix') { warn(`desecrated bad type on ${base.id}: ${row.type}`); continue; }
    const family = row.family || slug(row.text);
    if (!family) { warn(`desecrated no family on ${base.id}: ${row.text}`); continue; }
    if (!(row.weight > 0)) { warn(`desecrated non-positive weight on ${base.id}/${family}`); continue; }
    const bossTags = (row.tags || []).filter((t) => BOSS_TAGS.has(t));
    const id = uniqueId(`Desecrated_${family}`);
    // A poe2db row can list SEVERAL exclusion groups (a "+Str +Int" desecrated mod is in both
    // Strength and Intelligence). `family` stays the primary — it keys the weight join and the UI
    // label — and `families` carries the full set so the engine excludes on all of them. Emitted
    // only when there IS more than one, so single-family mods keep their existing shape.
    const families = (row.families || []).filter(Boolean);
    const mod = {
      id, group: `Desecrated_${family}`, field: `Desecrated_${family}`, source: 'desecrated', type: row.type,
      categories: [], family, ...(families.length > 1 ? { families } : {}), tags: bossTags,
      text: cleanText(row.text),
      tiers: [{ name: row.name || family, ilvl: row.ilvl ?? 0, weight: DESECRATED_ASSUMED_WEIGHT, ranges: parseRanges(row.text), stats: [] }],
    };
    modsById.set(id, mod); modsFile.mods.push(mod);
    base.pools.desecrated[row.type === 'prefix' ? 'prefixes' : 'suffixes'].push(id);
    desecratedAdded++;
  }

  // -- ESSENCE: group rows into a level-tiered mod. The key includes the stat TEXT because a single
  // essence can force several DISTINCT mods that share one family (e.g. "Essence of Enhancement" ->
  // six DefencesPercent outcomes); those are separate mods, one per stat, each with its Lesser/Normal/
  // Greater tiers. Text is range-normalized so the same stat across levels collapses to one group.
  const groups = new Map(); // key -> { type, family, essence, rows: [] }
  for (const row of pools.essence || []) {
    if (!keepForBase(row, attrTag)) continue;
    if (row.type !== 'prefix' && row.type !== 'suffix') { warn(`essence bad type on ${base.id}: ${row.type}`); continue; }
    const parsed = parseEssenceSlug(hrefOf(row.name) || '');
    if (!parsed) { warn(`essence unparseable slug on ${base.id}: ${hrefOf(row.name)}`); continue; }
    if (parsed.level === 'PERFECT') continue; // perfect essences deferred (not modelled from poe2db yet)
    const family = row.family || slug(row.text);
    if (!family) { warn(`essence no family on ${base.id}: ${row.text}`); continue; }
    const key = `${row.type}:${family}:${parsed.essence}:${cleanText(row.text)}`;
    if (!groups.has(key)) groups.set(key, { type: row.type, family, essence: parsed.essence, rows: [] });
    groups.get(key).rows.push({ ...row, level: parsed.level, essence: parsed.essence });
  }
  for (const g of groups.values()) {
    // One tier per essence level. poe2db lists an outcome once per applicable tag-group, so the same
    // level can recur with IDENTICAL text/ilvl (benign — keep one); warn only on a real conflict.
    const byLevel = new Map();
    for (const r of g.rows) {
      const prev = byLevel.get(r.level);
      if (!prev) byLevel.set(r.level, r);
      else if (prev.ilvl !== r.ilvl || cleanText(prev.text) !== cleanText(r.text)) {
        warn(`essence conflicting ${r.level} on ${base.id}/${g.family}/${g.essence}: "${cleanText(prev.text)}"@${prev.ilvl} vs "${cleanText(r.text)}"@${r.ilvl}`);
      }
    }
    g.rows = [...byLevel.values()].sort((a, b) => (a.ilvl ?? 0) - (b.ilvl ?? 0));
    const id = uniqueId(`Essence_${g.family}`);
    const tiers = g.rows.map((r) => ({
      name: `${LEVEL_WORD[r.level]} ${r.essence}`, ilvl: r.ilvl ?? 0, weight: 0,
      ranges: parseRanges(r.text), stats: [],
    }));
    // Same multi-group rule as the desecrated path above; rows in one essence group share a family
    // by construction, so take the widest list any of them carries.
    const families = g.rows.reduce((best, r) => {
      const f = (r.families || []).filter(Boolean);
      return f.length > best.length ? f : best;
    }, []);
    const mod = {
      id, group: `Essence_${g.family}`, field: `Essence_${g.family}`, source: 'essence', type: g.type,
      categories: [], family: g.family, ...(families.length > 1 ? { families } : {}),
      tags: [], text: cleanText(g.rows[0].text), tiers,
    };
    modsById.set(id, mod); modsFile.mods.push(mod);
    base.pools.essence[g.type === 'prefix' ? 'prefixes' : 'suffixes'].push(id);
    for (const r of g.rows) addEssenceForce(r.essence, r.level, id);
    essenceAdded++;
  }

  // -- PERFECT ESSENCE: 1-tier deterministic mods (the "Perfect Essence of X" corrupt/unique essences).
  // They apply to a RARE (remove-one-random + add this guaranteed mod) — a different flow from regular
  // essences — so they live in the essence pool tagged source 'perfect_essence' (the from-white picker
  // filters them out; the from-item planner offers them). One mod per distinct (type, family, stat).
  const perfectSeen = new Set();
  for (const row of pools.perfect_essence || []) {
    if (!keepForBase(row, attrTag)) continue;
    if (row.type !== 'prefix' && row.type !== 'suffix') { warn(`perfect-essence bad type on ${base.id}: ${row.type}`); continue; }
    const family = row.family || slug(row.text);
    if (!family) { warn(`perfect-essence no family on ${base.id}: ${row.text}`); continue; }
    // Dedup key is family+stat WITHOUT type: some perfect outcomes (e.g. "Mark of the Abyssal Lord",
    // family EssenceAbyss) are listed by poe2db as BOTH a prefix and a suffix — the same single mod, so
    // keep one (first-seen type wins) rather than a spurious prefix+suffix pair on every base.
    const dedup = `${family}:${cleanText(row.text)}`;
    if (perfectSeen.has(dedup)) continue; // same perfect outcome duplicated (attribute variants / both slots)
    perfectSeen.add(dedup);
    const essence = essenceNameOf(hrefOf(row.name)) || family;
    const id = uniqueId(`PerfectEssence_${family}`);
    const mod = {
      id, group: `PerfectEssence_${family}`, field: `PerfectEssence_${family}`, source: 'perfect_essence', type: row.type,
      categories: [], family, tags: [],
      text: cleanText(row.text),
      tiers: [{ name: `Perfect Essence of ${essence}`, ilvl: row.ilvl ?? 0, weight: 0, ranges: parseRanges(row.text), stats: [] }],
    };
    modsById.set(id, mod); modsFile.mods.push(mod);
    base.pools.essence[row.type === 'prefix' ? 'prefixes' : 'suffixes'].push(id);
    addEssenceForce(essence, 'PERFECT', id);
    perfectAdded++;
  }
}

function slug(text) {
  if (!text) return null;
  return 'X' + String(text).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
}

// ---- emit -------------------------------------------------------------------------------------
modsFile.mods.sort((a, b) => a.id.localeCompare(b.id));
modsFile.count = modsFile.mods.length;
modsFile.source = 'NORMAL structure from RePoE-fork PoE2 dump (client 4.5.4.3) + NORMAL weights from '
  + 'poe2db (DropChance). ESSENCE + DESECRATED + PERFECT_ESSENCE pools built from poe2db per-class pages '
  + 'by apply_pools.mjs (essence tiers = Lesser/Normal/Greater levels; perfect_essence = 1-tier, both '
  + 'deterministic weight 0; desecrated = one mod per row, boss tags preserved). DESECRATED WEIGHTS ARE '
  + 'AN ASSUMPTION: poe2db publishes none (it reports 1 for every row), so all of them are set to '
  + `${DESECRATED_ASSUMED_WEIGHT} — see docs/validation.md D4. They are NOT observed data.`;
basesFile.items.sort((a, b) => a.id.localeCompare(b.id));

const essences = [...essenceMap.entries()]
  .map(([name, lv]) => ({
    name,
    tiers: {
      LESSER: [...lv.LESSER].sort(), NORMAL: [...lv.NORMAL].sort(),
      GREATER: [...lv.GREATER].sort(), PERFECT: [...lv.PERFECT].sort(),
    },
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(join(OUT, 'mods.json'), JSON.stringify(modsFile, null, 2) + '\n');
writeFileSync(join(OUT, 'base_items.json'), JSON.stringify(basesFile, null, 2) + '\n');
writeFileSync(join(OUT, 'essences.json'), JSON.stringify({
  patch: '0.5.0', generated: GENERATED,
  source: 'poe2db per-class essence rows, grouped by essence -> level -> forced mod ids (apply_pools.mjs)',
  count: essences.length, essences,
}, null, 2) + '\n');

const bySrc = {};
for (const m of modsFile.mods) bySrc[m.source] = (bySrc[m.source] || 0) + 1;
console.log('apply_pools.mjs — merged essence + desecrated + perfect_essence into 0.5.0');
console.log(`  desecrated: ${desecratedAdded}   essence: ${essenceAdded}   perfect_essence: ${perfectAdded}`);
console.log(`  mods by source now:`, bySrc);
console.log(`  essences (distinct): ${essences.length}   total mods: ${modsFile.count}`);
if (warnings.length) {
  console.log(`\n  WARNINGS (${warnings.length}):`);
  for (const w of warnings.slice(0, 30)) console.log('    - ' + w);
}
