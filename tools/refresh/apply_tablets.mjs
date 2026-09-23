#!/usr/bin/env node
// Build the three Precursor Tablets the Tablets tab crafts — Ritual, Overseer and Temple — and merge
// them into data/patches/0.5.0/{mods,base_items}.json. Idempotent: every `Tablets…` entry is replaced.
//
// STRUCTURE comes from RePoE, exactly as refresh.mjs reads it for gear: which modifiers a tablet can
// roll (its `mods_by_base` group, found by the tablet's metadata id), each one's side, text, stat ranges
// and exclusion family. Tablet mod ids follow the gear convention, `Tablets/<RePoE mod type>`, and a
// modifier the three tablets share is ONE mod listed in three pools.
//
// WEIGHTS come from Morce Faster's rolling data (data/tablets/morce-faster.json), because nothing else
// has any: RePoE and poe2db both publish 1 for every tablet modifier. That file says where each weight
// came from and how often the modifier was seen.
//
// LIMITS: a Rare tablet holds two prefixes and two suffixes (confirmed by Dorian, 2026-09-21 — four
// modifiers once the Arbiter of Ash is beaten), and no crafted modifier: no Essence touches a tablet.
//
// Usage: node tools/refresh/apply_tablets.mjs [repoeDir=tools/refresh/cache]
// Reads:  data/patches/0.5.0/{mods,base_items}.json, data/tablets/morce-faster.json,
//         <repoeDir>/repoe_{mods,mods_by_base,base_items}.json
// Writes: data/patches/0.5.0/{mods,base_items}.json

import { shownRange } from './displayUnits.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanText } from './variants.mjs';
import { templateFixedRoll } from './modText.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPOE = process.argv[2] || join(ROOT, 'tools/refresh/cache');
const PATCH = join(ROOT, 'data/patches/0.5.0');
const load = (path) => JSON.parse(readFileSync(path, 'utf8'));

const repoeMods = load(join(REPOE, 'repoe_mods.json'));
const repoeByBase = load(join(REPOE, 'repoe_mods_by_base.json'));
const repoeBases = load(join(REPOE, 'repoe_base_items.json'));
const morce = load(join(ROOT, 'data/tablets/morce-faster.json'));

/** Our base id → the tablet's RePoE metadata id. The Tablets tab offers these three and no others. */
export const TABLETS = {
  Tablets_ritual: 'Metadata/Items/TowerAugment/RitualAugment',
  Tablets_overseer: 'Metadata/Items/TowerAugment/MapBossAugment',
  Tablets_temple: 'Metadata/Items/TowerAugment/IncursionAugment',
};
const LIMITS = { prefixes: 2, suffixes: 2, crafted: 0 };

const mods = new Map();
const bases = [];
for (const [baseId, meta] of Object.entries(TABLETS)) {
  const group = Object.values(repoeByBase.Tablet).find((g) => g.bases.includes(meta));
  if (!group) throw new Error(`no RePoE mods_by_base group lists ${meta}`);
  const pools = { prefixes: [], suffixes: [] };
  for (const type of ['prefix', 'suffix']) {
    for (const [modType, tierMap] of Object.entries(group.mods[type] ?? {})) {
      const ids = Object.keys(tierMap);
      if (ids.length !== 1) throw new Error(`${modType} has ${ids.length} tiers; every tablet mod has one`);
      const id = `Tablets/${modType}`;
      (type === 'prefix' ? pools.prefixes : pools.suffixes).push(id);
      if (mods.has(id)) continue;
      const rm = repoeMods[ids[0]];
      const w = morce.weights[id];
      if (!w) throw new Error(`no weight for ${id} in data/tablets/morce-faster.json`);
      // Several tablet mods carry stats that are always 0 — a hidden bonus the modifier does not give.
      // They are not a roll, and left in they would make a fixed "1 additional Azmeri Spirit" look like
      // it varies, which `templateFixedRoll` would then turn into "#".
      const stats = (rm.stats || []).filter((s) => !(s.min === 0 && s.max === 0));
      const tiers = [{
        name: rm.name || ids[0],
        ilvl: rm.required_level ?? 0,
        weight: w.weight,
        ranges: stats.map((s) => shownRange(s.id, [s.min, s.max])),
        stats: stats.map((s) => s.id),
      }];
      mods.set(id, {
        id, group: modType, field: modType, source: 'normal', type,
        categories: stats.map((s) => s.id),
        family: rm.groups?.[0] ?? modType,
        ...(rm.groups && rm.groups.length > 1 ? { families: rm.groups } : {}),
        tags: rm.implicit_tags || [],
        text: templateFixedRoll(cleanText(rm.text), tiers),
        tiers,
      });
    }
  }
  const name = repoeBases[meta].name;
  bases.push({
    id: baseId, name, bases: [name], category: 'Tablets', class: 'TowerAugmentation', limits: LIMITS,
    pools: { normal: pools, desecrated: { prefixes: [], suffixes: [] }, essence: { prefixes: [], suffixes: [] } },
  });
}

const modsFile = load(join(PATCH, 'mods.json'));
modsFile.mods = [...modsFile.mods.filter((m) => !m.id.startsWith('Tablets/')), ...mods.values()];
modsFile.count = modsFile.mods.length;
const basesFile = load(join(PATCH, 'base_items.json'));
basesFile.items = [...basesFile.items.filter((b) => b.category !== 'Tablets'), ...bases];
basesFile.count = basesFile.items.length;
writeFileSync(join(PATCH, 'mods.json'), `${JSON.stringify(modsFile, null, 2)}\n`);
writeFileSync(join(PATCH, 'base_items.json'), `${JSON.stringify(basesFile, null, 2)}\n`);
console.log(`tablets: ${bases.length} bases, ${mods.size} mods (${bases.map((b) => `${b.id} ${b.pools.normal.prefixes.length}p/${b.pools.normal.suffixes.length}s`).join(', ')})`);
