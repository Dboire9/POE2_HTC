// Diff our Amulet/Bow/Body-armour normal-pool weights against the CoE numbers (hand-entered below),
// for BOTH data/patches/0.5 (Java-extracted) and 0.5.0 (poe2db refresh). Run: npx tsx scripts/coe-diff.mts
import { loadPatch } from '../packages/engine/src/loadPatch.ts';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();

// CoE (patch 0.5) Amulet normal pool — name → weight.
const COE_AMULET_PRE: Record<string, number> = {
  'increased Armour': 7000, 'increased Evasion Rating': 7000, 'increased maximum Energy Shield': 7000,
  'increased maximum Life': 900, 'increased maximum Mana': 900, 'increased Rarity of Items found': 3000,
  'increased Spell Damage': 6000, 'to Accuracy Rating': 6000, 'to maximum Energy Shield': 10000,
  'to maximum Life': 9000, 'to maximum Mana': 13000, 'to Spirit': 2400,
};
const COE_AMULET_SUF: Record<string, number> = {
  'Life Regeneration per second': 10000, 'increased Cast Speed': 4800, 'increased Critical Damage Bonus': 3875,
  'increased Critical Hit Chance': 3875, 'increased Mana Regeneration Rate': 6000, 'increased Rarity of Items found': 3000,
  'of Damage taken Recouped as Life': 2500, 'of Damage taken Recouped as Mana': 2500, 'to all Attributes': 7200,
  'to Dexterity': 8000, 'to Intelligence': 8000, 'to Level of all Melee Skills': 850, 'to Level of all Minion Skills': 850,
  'to Level of all Projectile Skills': 850, 'to Level of all Spell Skills': 850, 'to Strength': 8000,
  'to all Elemental Resistances': 4800, 'to Chaos Resistance': 1500, 'to Cold Resistance': 8000,
  'to Fire Resistance': 8000, 'to Lightning Resistance': 8000,
};

function ourPool(patch: string, baseId: string) {
  const d = loadPatch(`data/patches/${patch}`);
  const b = d.bases.get(baseId);
  if (!b) return null;
  const rows = (ids: readonly string[]) => ids.map((id) => {
    const m = d.mods.get(id)!;
    return { key: norm(m.text ?? id), text: m.text ?? id, weight: m.tiers.reduce((s, t) => s + t.weight, 0), family: m.family };
  }).filter((r) => r.weight > 0);
  return { pre: rows(b.pools.normal.prefixes), suf: rows(b.pools.normal.suffixes) };
}

function diff(label: string, ours: { key: string; text: string; weight: number }[], coe: Record<string, number>) {
  console.log(`\n  ${label}: ours ${ours.length} mods (Σ ${ours.reduce((s, r) => s + r.weight, 0)}) vs CoE ${Object.keys(coe).length} (Σ ${Object.values(coe).reduce((a, b) => a + b, 0)})`);
  const coeKeys = new Map(Object.entries(coe).map(([k, v]) => [norm(k), { name: k, w: v }]));
  const ourKeys = new Set<string>();
  for (const r of ours) {
    ourKeys.add(r.key);
    const c = coeKeys.get(r.key);
    if (!c) { console.log(`    OURS-ONLY  ${r.text}  w=${r.weight}`); continue; }
    if (c.w !== r.weight) console.log(`    WEIGHT ≠   ${r.text}  ours=${r.weight}  coe=${c.w}`);
  }
  for (const [k, c] of coeKeys) if (!ourKeys.has(k)) console.log(`    COE-ONLY   ${c.name}  w=${c.w}  (missing from ours)`);
}

for (const patch of ['0.5', '0.5.0']) {
  console.log(`\n========== data/patches/${patch} — Amulets ==========`);
  const p = ourPool(patch, 'Amulets');
  if (!p) { console.log('  (no Amulets base)'); continue; }
  diff('PREFIXES', p.pre, COE_AMULET_PRE);
  diff('SUFFIXES', p.suf, COE_AMULET_SUF);
}

// Body armour ailment-duration family check + bow suffix weights (0.5 only — the live data).
console.log('\n========== 0.5 — Body_Armours_str: ailment-duration mods & families ==========');
const ba = ourPool('0.5', 'Body_Armours_str')!;
for (const r of [...ba.pre, ...ba.suf]) if (/duration/i.test(r.text)) console.log(`  ${r.text}  →  family="${r.family}"  w=${r.weight}`);

console.log('\n========== 0.5 — Bows suffixes (find the +50) ==========');
const bw = ourPool('0.5', 'Bows')!;
for (const r of bw.suf.sort((a, b) => b.weight - a.weight)) console.log(`  ${String(r.weight).padStart(5)}  ${r.text}`);
