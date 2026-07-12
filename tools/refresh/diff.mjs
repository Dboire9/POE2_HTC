#!/usr/bin/env node
// Diff the staged 0.5.0 refresh (RePoE structure) against the 0.5 Java baseline, focused on
// STRUCTURE (pools, tiers, ilvl, stat ranges). Weights are excluded — the baseline has hand-curated
// 0.2/0.3-era weights while the refresh has game-file placeholders (uniformly 1), so a weight diff
// is noise. Matches mods per base by `family` (both datasets use RePoE-style group names).
//
// Usage: node tools/refresh/diff.mjs > docs/refresh-0.5.0-diff.md

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const load = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const oldMods = load('data/patches/0.5/mods.json');
const oldBases = load('data/patches/0.5/base_items.json');
const newMods = load('data/patches/0.5.0/mods.json');
const newBases = load('data/patches/0.5.0/base_items.json');

const oldById = Object.fromEntries(oldMods.mods.map((m) => [m.id, m]));
const newById = Object.fromEntries(newMods.mods.map((m) => [m.id, m]));
const oldBase = Object.fromEntries(oldBases.items.map((b) => [b.id, b]));
const newBase = Object.fromEntries(newBases.items.map((b) => [b.id, b]));

// Per base, map family -> mod for the NORMAL pool (prefixes+suffixes).
function normalByFamily(base, byId) {
  const out = new Map();
  if (!base) return out;
  for (const key of ['prefixes', 'suffixes']) {
    for (const id of base.pools.normal[key]) {
      const m = byId[id];
      if (m) out.set(`${m.type}:${m.family}`, m);
    }
  }
  return out;
}

const rangesEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

let totMatched = 0; let totIlvlChg = 0; let totRangeChg = 0; let totTierCntChg = 0;
const perBase = [];

for (const id of Object.keys(oldBase).sort()) {
  const oldFam = normalByFamily(oldBase[id], oldById);
  const newFam = normalByFamily(newBase[id], newById);
  const added = [...newFam.keys()].filter((k) => !oldFam.has(k));
  const removed = [...oldFam.keys()].filter((k) => !newFam.has(k));
  const matched = [...oldFam.keys()].filter((k) => newFam.has(k));

  let ilvlChg = 0; let rangeChg = 0; let tierCntChg = 0;
  for (const k of matched) {
    const o = oldFam.get(k); const n = newFam.get(k);
    if (o.tiers.length !== n.tiers.length) tierCntChg++;
    const t = Math.min(o.tiers.length, n.tiers.length);
    for (let i = 0; i < t; i++) {
      if (o.tiers[i].ilvl !== n.tiers[i].ilvl) ilvlChg++;
      if (!rangesEq(o.tiers[i].ranges, n.tiers[i].ranges)) rangeChg++;
    }
  }
  totMatched += matched.length; totIlvlChg += ilvlChg; totRangeChg += rangeChg; totTierCntChg += tierCntChg;
  perBase.push({
    id,
    oldP: oldBase[id]?.pools.normal.prefixes.length ?? 0,
    oldS: oldBase[id]?.pools.normal.suffixes.length ?? 0,
    newP: newBase[id]?.pools.normal.prefixes.length ?? 0,
    newS: newBase[id]?.pools.normal.suffixes.length ?? 0,
    matched: matched.length, added, removed, ilvlChg, rangeChg, tierCntChg,
  });
}

// --- report (markdown) ------------------------------------------------------------------------
const L = [];
L.push('# 0.5.0 refresh — structural diff vs the 0.5 Java baseline');
L.push('');
L.push('Staged data: `data/patches/0.5.0/` (RePoE-fork, client 4.5.4.3). Baseline: `data/patches/0.5/`');
L.push('(1:1 extraction of the ~0.2/0.3-era Java). **NORMAL pools only** in the refresh so far.');
L.push('');
L.push('> **Weights are excluded from this diff.** Baseline weights are hand-curated (0.2/0.3 era);');
L.push('> refresh weights are poe2db community spawn weights (DropChance), applied by');
L.push('> `apply_weights.mjs`. A value-level weight comparison is out of scope here.');
L.push('');
L.push('## Totals');
L.push('');
L.push(`- Baseline: ${oldMods.count} mods (all sources), ${oldBases.count} bases.`);
L.push(`- Refresh (normal-only): ${newMods.count} mods, ${newBases.count} bases, `
  + `${newMods.mods.reduce((n, m) => n + m.tiers.length, 0)} tiers.`);
L.push(`- Matched mod families (normal pool, by base): ${totMatched}.`);
L.push(`  - with a tier-**count** change: ${totTierCntChg}`);
L.push(`  - with an **ilvl** change on a matched tier: ${totIlvlChg}`);
L.push(`  - with a stat-**range** change on a matched tier: ${totRangeChg}`);
L.push('');
L.push('## Per base (normal pool)');
L.push('');
L.push('| Base | old p/s | new p/s | matched | added | removed | ilvl Δ | range Δ | tierN Δ |');
L.push('|------|--------:|--------:|--------:|------:|--------:|-------:|--------:|--------:|');
for (const b of perBase) {
  L.push(`| ${b.id} | ${b.oldP}/${b.oldS} | ${b.newP}/${b.newS} | ${b.matched} `
    + `| ${b.added.length} | ${b.removed.length} | ${b.ilvlChg} | ${b.rangeChg} | ${b.tierCntChg} |`);
}
L.push('');
L.push('## Families added / removed per base (0.5 vs baseline)');
L.push('');
for (const b of perBase) {
  if (!b.added.length && !b.removed.length) continue;
  L.push(`- **${b.id}**`);
  if (b.added.length) L.push(`  - added: ${b.added.map((s) => '`' + s + '`').join(', ')}`);
  if (b.removed.length) L.push(`  - removed: ${b.removed.map((s) => '`' + s + '`').join(', ')}`);
}
L.push('');
L.push('## Worked example — Wands `+# to maximum Mana` (IncreasedMana prefix)');
L.push('');
const oW = oldById['Wands/MAXIMUM_MANA']; const nW = newById['Wands/IncreasedMana'];
if (oW && nW) {
  L.push('| tier | baseline ilvl/range | refresh ilvl/range |');
  L.push('|-----:|---------------------|--------------------|');
  const t = Math.max(oW.tiers.length, nW.tiers.length);
  for (let i = 0; i < t; i++) {
    const o = oW.tiers[i]; const n = nW.tiers[i];
    L.push(`| ${i} | ${o ? `${o.ilvl} / ${JSON.stringify(o.ranges)}` : '—'} `
      + `| ${n ? `${n.ilvl} / ${JSON.stringify(n.ranges)}` : '—'} |`);
  }
}
console.log(L.join('\n'));
