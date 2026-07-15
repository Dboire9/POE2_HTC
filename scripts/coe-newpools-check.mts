// Automated cross-check of the ESSENCE / DESECRATED / PERFECT-ESSENCE pools that apply_pools.mjs built
// into 0.5.0 (from poe2db). The CoE JS calculator can't be scraped, so the fully-independent signal we
// CAN compute is 0.5.0 (poe2db, current) vs 0.5 (Java, hardcoded ~0.2-era) — two extractions of the same
// game mechanic. They use the same family namespace + stat text, so essence→(family,text) mappings are
// directly comparable; divergences are either legitimate patch drift or a build bug to investigate.
// Plus internal-consistency invariants a cross-source diff can't see. Run: npx tsx scripts/coe-newpools-check.mts
import { loadPatch } from '../packages/engine/src/loadPatch.ts';
import type { Mod, PatchData } from '../packages/engine/src/types.ts';
import { readFileSync } from 'node:fs';

const j = loadPatch('data/patches/0.5');
const p = loadPatch('data/patches/0.5.0');
const readEss = (dir: string) => JSON.parse(readFileSync(`${dir}/essences.json`, 'utf8')) as
  { essences: { name: string; tiers: Record<string, string[]> }[] };
const je = readEss('data/patches/0.5');
const pe = readEss('data/patches/0.5.0');

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const sig = (m: Mod) => `${m.family} :: ${norm(m.text ?? m.id)}`;
let problems = 0;
const flag = (msg: string) => { problems++; console.log('  ✗ ' + msg); };

// ── 1. Essence NAME set: every Java essence must survive into 0.5.0 (extras are the new perfect-only ones).
console.log('## 1. Essence name coverage (0.5 ⊆ 0.5.0)');
const jNames = new Set(je.essences.map((e) => e.name));
const pNames = new Set(pe.essences.map((e) => e.name));
const dropped = [...jNames].filter((n) => !pNames.has(n));
console.log(`   0.5: ${jNames.size} essences   0.5.0: ${pNames.size} essences   extra in 0.5.0: ${pNames.size - jNames.size}`);
if (dropped.length) flag(`essences present in 0.5 but MISSING from 0.5.0: ${dropped.join(', ')}`);
else console.log('   ✓ all 0.5 essences present in 0.5.0');

// ── 2. Per-essence forced-mod (family,text) set: 0.5 vs 0.5.0 for the shared essences.
console.log('\n## 2. Forced-mod (family, text) agreement per shared essence');
const modSet = (ess: typeof je, data: PatchData, name: string, levels: string[]): Set<string> => {
  const e = ess.essences.find((x) => x.name === name);
  const out = new Set<string>();
  if (!e) return out;
  for (const lvl of levels) for (const id of e.tiers[lvl] ?? []) { const m = data.mods.get(id); if (m) out.add(sig(m)); }
  return out;
};
let essMismatch = 0;
for (const name of [...jNames].sort()) {
  const a = modSet(je, j, name, ['LESSER', 'NORMAL', 'GREATER']);
  const b = modSet(pe, p, name, ['LESSER', 'NORMAL', 'GREATER']);
  const onlyJ = [...a].filter((x) => !b.has(x));
  const onlyP = [...b].filter((x) => !a.has(x));
  if (onlyJ.length || onlyP.length) {
    essMismatch++;
    console.log(`  · ${name}: ${a.size} (0.5) vs ${b.size} (0.5.0)`);
    for (const x of onlyJ) console.log(`      only 0.5  : ${x}`);
    for (const x of onlyP) console.log(`      only 0.5.0: ${x}`);
  }
}
if (essMismatch === 0) console.log('   ✓ every shared essence forces the same (family, text) set in both patches');
else console.log(`   (${essMismatch}/${jNames.size} essences differ — inspect: patch drift vs build bug)`);

// ── 3. Internal consistency of the 0.5.0 essence pool (values ascend by level; ilvls ascend).
console.log('\n## 3. 0.5.0 essence internal consistency');
let essBad = 0;
for (const m of p.mods.values()) {
  if (m.source !== 'essence') continue;
  let prevIlvl = -1; let prevMin = -Infinity; let monotoneVal = true;
  for (const t of m.tiers) {
    if (t.ilvl < prevIlvl) { flag(`${m.id}: essence tier ilvl ${t.ilvl} < previous ${prevIlvl}`); essBad++; }
    prevIlvl = t.ilvl;
    const min = t.ranges[0]?.[0];
    if (typeof min === 'number') { if (min < prevMin - 1e-9) monotoneVal = false; prevMin = min; }
  }
  // Higher essence level should not roll a WORSE min value (allow equal / missing ranges).
  if (m.tiers.length > 1 && !monotoneVal) { flag(`${m.id}: essence value min not non-decreasing across levels (${m.tiers.map((t) => t.ranges[0]?.[0]).join('→')})`); essBad++; }
}
if (essBad === 0) console.log('   ✓ all essence mods: tier ilvls ascend and per-level min values are non-decreasing');

// ── 4. Desecrated + perfect-essence structural invariants on 0.5.0.
console.log('\n## 4. 0.5.0 desecrated + perfect-essence structure');
const boss: Record<string, number> = {};
let desBad = 0; let perfBad = 0;
for (const m of p.mods.values()) {
  if (m.source === 'desecrated') {
    for (const t of m.tiers) if (!(t.weight > 0)) { flag(`${m.id}: desecrated weight ${t.weight} (must be > 0)`); desBad++; }
    const tags = m.tags.filter((t) => t.endsWith('_mod'));
    for (const t of tags) boss[t] = (boss[t] ?? 0) + 1;
  }
  if (m.source === 'perfect_essence') {
    if (m.tiers.length !== 1) { flag(`${m.id}: perfect essence has ${m.tiers.length} tiers (expected 1)`); perfBad++; }
    if (m.tiers[0] && m.tiers[0].weight !== 0) { flag(`${m.id}: perfect essence weight ${m.tiers[0].weight} (expected 0, deterministic)`); perfBad++; }
  }
}
console.log(`   desecrated boss-tag counts: ${JSON.stringify(boss)}`);
if (desBad === 0) console.log('   ✓ all desecrated mods carry a positive weight');
if (perfBad === 0) console.log('   ✓ all perfect-essence mods are single-tier, deterministic (weight 0)');

// ── 5. Human worksheet: dump the actual essence/desecrated/perfect VALUES per base to compare against
// CoE by hand (the JS calc can't be scraped). The automated diff above covers structure; this is for
// spot-checking the numbers. Written to /tmp/coe-newpools-worksheet.md.
const WORKSHEET_BASES = ['Wands', 'Amulets', 'Body_Armours_str'];
const rng = (m: Mod, tierIdx: number) => { const r = m.tiers[tierIdx]?.ranges[0]; return r && r.length >= 2 ? `${r[0]}–${r[1]}` : '—'; };
const lines: string[] = ['# CoE spot-check worksheet — 0.5.0 essence / desecrated / perfect pools\n',
  'Open craftofexile.com/?game=poe2, pick the base, and compare these values.\n'];
for (const baseId of WORKSHEET_BASES) {
  const base = p.bases.get(baseId)!;
  lines.push(`\n## ${baseId}\n`);
  lines.push('### Regular essences (Lesser / Normal / Greater value)');
  for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
    const m = p.mods.get(id); if (!m || m.source !== 'essence') continue;
    lines.push(`- ${m.type === 'prefix' ? 'P' : 'S'} · ${m.text} · ${m.tiers.map((_, i) => rng(m, i)).join(' / ')}`);
  }
  lines.push('\n### Perfect essences (value)');
  for (const id of [...base.pools.essence.prefixes, ...base.pools.essence.suffixes]) {
    const m = p.mods.get(id); if (!m || m.source !== 'perfect_essence') continue;
    lines.push(`- ${m.type === 'prefix' ? 'P' : 'S'} · ${m.tiers[0]?.name} · ${m.text} · ${rng(m, 0)}`);
  }
  lines.push('\n### Desecrated (boss · value)');
  for (const id of [...base.pools.desecrated.prefixes, ...base.pools.desecrated.suffixes]) {
    const m = p.mods.get(id); if (!m) continue;
    lines.push(`- ${m.type === 'prefix' ? 'P' : 'S'} · [${m.tags.join(',')}] · ${m.text} · ${rng(m, 0)}`);
  }
}
const { writeFileSync } = await import('node:fs');
writeFileSync('/tmp/coe-newpools-worksheet.md', lines.join('\n'));
console.log('\n   wrote /tmp/coe-newpools-worksheet.md (per-base essence/desecrated/perfect values for a CoE hand-check)');

console.log(`\n${problems === 0 ? '✓ ALL CHECKS PASSED' : `✗ ${problems} problem(s) found`}`);
process.exit(problems === 0 ? 0 : 1);
