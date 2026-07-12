// One-off: dump our engine's pool weights + family structure for a few bases, so they can be
// cross-checked by hand against craftofexile.com/?game=poe2. Run: npx tsx scripts/coe-worksheet.mts
import { writeFileSync } from 'node:fs';
import { loadPatch } from '../packages/engine/src/loadPatch.ts';

const data = loadPatch('data/patches/0.5');
const BASES = ['Body_Armours_str', 'Amulets', 'Bows'];

interface Row { text: string; id: string; weight: number; family: string; tiers: number }

function rowsFor(ids: readonly string[]): Row[] {
  return ids.map((id) => {
    const m = data.mods.get(id)!;
    return { text: m.text ?? id, id, weight: m.tiers.reduce((s, t) => s + t.weight, 0), family: m.family, tiers: m.tiers.length };
  }).filter((r) => r.weight > 0).sort((a, b) => b.weight - a.weight);
}

const out: Record<string, unknown> = {};
for (const baseId of BASES) {
  const base = data.bases.get(baseId)!;
  const pre = rowsFor(base.pools.normal.prefixes);
  const suf = rowsFor(base.pools.normal.suffixes);
  const preTotal = pre.reduce((s, r) => s + r.weight, 0);
  const sufTotal = suf.reduce((s, r) => s + r.weight, 0);
  // Families with >1 mod on this base (the mutual-exclusion groups CoE should agree on).
  const fam = new Map<string, { text: string; side: string }[]>();
  for (const r of pre) (fam.get(r.family) ?? fam.set(r.family, []).get(r.family)!).push({ text: r.text, side: 'P' });
  for (const r of suf) (fam.get(r.family) ?? fam.set(r.family, []).get(r.family)!).push({ text: r.text, side: 'S' });
  const groups = [...fam.entries()].filter(([f, list]) => f !== '' && list.length > 1)
    .map(([f, list]) => ({ family: f, sides: [...new Set(list.map((x) => x.side))].join('+'), mods: list.map((x) => `${x.side}·${x.text}`) }));
  out[baseId] = {
    prefixCount: pre.length, suffixCount: suf.length, preTotal, sufTotal, poolTotal: preTotal + sufTotal,
    prefixes: pre, suffixes: suf, familyGroups: groups,
  };
}
writeFileSync('/tmp/coe.json', JSON.stringify(out, null, 2));

// Console summary
for (const baseId of BASES) {
  const b = out[baseId] as { prefixCount: number; suffixCount: number; preTotal: number; sufTotal: number; poolTotal: number; familyGroups: unknown[]; prefixes: Row[]; suffixes: Row[] };
  console.log(`\n### ${baseId}: ${b.prefixCount} prefixes (Σw ${b.preTotal}) + ${b.suffixCount} suffixes (Σw ${b.sufTotal}) = pool ${b.poolTotal}`);
  console.log(`   family exclusion groups (>1 mod): ${b.familyGroups.length}`);
  const mixed = (b.familyGroups as { sides: string }[]).filter((g) => g.sides.includes('+'));
  if (mixed.length) console.log(`   ⚠ mixed prefix+suffix families: ${mixed.length}`, JSON.stringify(mixed));
  console.log('   top 5 prefixes:', b.prefixes.slice(0, 5).map((r) => `${r.text}=${r.weight}`).join(' | '));
  console.log('   top 5 suffixes:', b.suffixes.slice(0, 5).map((r) => `${r.text}=${r.weight}`).join(' | '));
}
