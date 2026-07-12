#!/usr/bin/env node
// Overlay poe2db community spawn weights onto the RePoE-structured 0.5.0 mods.json.
//
// RePoE gives correct structure but useless placeholder weights (game files store 0/1 only).
// poe2db carries the community-verified spawn weights (DropChance). This step joins them onto our
// mods by (base, type, family, ilvl[, tier name]) and writes the real weight into each tier.
//
// NORMAL pool only. poe2db's essence/desecrated weights are NOT plain spawn weights (essence forces
// a mod; desecrated mods are mixed into the normal pool by the desecration mechanic), so they are
// intentionally left for the Phase-1 engine mechanics, not imported here.
//
// Usage: node tools/refresh/apply_weights.mjs
// Reads:  data/patches/0.5.0/{mods,base_items}.json + tools/refresh/cache/poe2db/*.html
// Writes: data/patches/0.5.0/mods.json (weights filled) ; prints coverage + misses.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePoe2dbHtml } from './poe2db.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'data/patches/0.5.0');
const PDB = join(ROOT, 'tools/refresh/cache/poe2db');

const CATEGORY_CLASS = {
  Wands: 'Wands', Sceptres: 'Sceptres', Bows: 'Bows', Crossbows: 'Crossbows',
  Quarterstaves: 'Quarterstaves', Staves: 'Staves', Spears: 'Spears',
  OneHand_Maces: 'One_Hand_Maces', TwoHand_Maces: 'Two_Hand_Maces',
  Foci: 'Foci', Quivers: 'Quivers', Bucklers: 'Bucklers', Amulets: 'Amulets', Rings: 'Rings',
};
const ARMOUR_CATS = new Set(['Body_Armours', 'Boots', 'Gloves', 'Helmets', 'Shields']);

// poe2db page name for a base: per-attribute for armour, per-class otherwise.
function pageName(base) {
  if (ARMOUR_CATS.has(base.category)) return base.id;
  return CATEGORY_CLASS[base.category];
}

// Weight index for a poe2db page's normal pool.
function buildWeightIndex(mods) {
  const idx = new Map(); // "type:family:ilvl" -> [{name, weight}]
  for (const m of mods) {
    const k = `${m.type}:${m.family}:${m.ilvl}`;
    if (!idx.has(k)) idx.set(k, []);
    idx.get(k).push({ name: m.name, weight: m.weight });
  }
  return idx;
}

function lookupWeight(idx, type, family, ilvl, name) {
  const entries = idx.get(`${type}:${family}:${ilvl}`);
  if (!entries) return null;
  if (entries.length === 1) return entries[0].weight;
  const byName = entries.find((e) => e.name === name);
  if (byName) return byName.weight;
  const weights = [...new Set(entries.map((e) => e.weight))];
  return weights.length === 1 ? weights[0] : { weight: entries[0].weight, ambiguous: weights };
}

const mods = JSON.parse(readFileSync(join(OUT, 'mods.json'), 'utf8'));
const bases = JSON.parse(readFileSync(join(OUT, 'base_items.json'), 'utf8'));
const modsById = new Map(mods.mods.map((m) => [m.id, m]));

// Parse each poe2db page once.
const pageCache = new Map();
function getIndex(page) {
  if (!pageCache.has(page)) {
    let idx = null;
    try {
      const html = readFileSync(join(PDB, `${page}.html`), 'utf8');
      idx = buildWeightIndex(parsePoe2dbHtml(html).normal || []);
    } catch (e) { /* missing page */ }
    pageCache.set(page, idx);
  }
  return pageCache.get(page);
}

let tiersTotal = 0; let tiersFilled = 0; let ambiguous = 0;
const baseReport = [];
const missSamples = [];

for (const base of bases.items) {
  const idx = getIndex(pageName(base));
  const normalIds = [...base.pools.normal.prefixes, ...base.pools.normal.suffixes];
  let bt = 0; let bf = 0;
  for (const id of normalIds) {
    const mod = modsById.get(id);
    if (!mod) continue;
    for (const tier of mod.tiers) {
      tiersTotal++; bt++;
      if (!idx) continue;
      const w = lookupWeight(idx, mod.type, mod.family, tier.ilvl, tier.name);
      if (w == null) {
        if (missSamples.length < 25) missSamples.push(`${id} [${mod.type}:${mod.family}:${tier.ilvl}]`);
        continue;
      }
      if (typeof w === 'object') { ambiguous++; tier.weight = w.weight; } else { tier.weight = w; }
      tiersFilled++; bf++;
    }
  }
  baseReport.push({ id: base.id, page: pageName(base), have: idx != null, bt, bf });
}

mods.source = 'structure from RePoE-fork PoE2 dump (client 4.5.4.3); NORMAL spawn WEIGHTS from '
  + 'poe2db community data (DropChance), joined by (base,type,family,ilvl). Essence/desecrated pools '
  + 'and their mechanic-specific weights are deferred to the Phase-1 engine. weights_overrides.json '
  + 'still wins over these at load time.';
mods.weightsSource = 'poe2db.tw community DropChance (0.5), imported ' + mods.generated;
writeFileSync(join(OUT, 'mods.json'), JSON.stringify(mods, null, 2) + '\n');

// --- report ----------------------------------------------------------------------------------
console.log(`Applied poe2db weights to ${OUT}/mods.json`);
console.log(`  normal tiers: ${tiersTotal}   filled: ${tiersFilled} (${(100 * tiersFilled / tiersTotal).toFixed(1)}%)`
  + `   ambiguous-at-ilvl: ${ambiguous}`);
const noPage = baseReport.filter((b) => !b.have);
if (noPage.length) console.log(`  bases with NO poe2db page: ${noPage.map((b) => b.id + '->' + b.page).join(', ')}`);
console.log('  low-coverage bases (<90% tiers filled):');
for (const b of baseReport.filter((b) => b.have && b.bf / b.bt < 0.9).sort((a, b) => a.bf / a.bt - b.bf / b.bt)) {
  console.log(`    ${b.id.padEnd(24)} ${b.bf}/${b.bt} (${(100 * b.bf / b.bt).toFixed(0)}%)`);
}
if (missSamples.length) { console.log('  miss samples:'); missSamples.forEach((m) => console.log('    ! ' + m)); }
