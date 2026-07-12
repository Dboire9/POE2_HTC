// Verify 0.5.0 fully matches the CoE numbers (hand-entered) for Rings / Body_Armours_int / Quivers,
// so we can be sure the ONLY discrepancies are the 6 known glitched weights. Run: npx tsx scripts/coe-verify.mts
import { loadPatch } from '../packages/engine/src/loadPatch.ts';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();
const d = loadPatch('data/patches/0.5.0');

const CoE: Record<string, { pre: Record<string, number>; suf: Record<string, number> }> = {
  Rings: {
    pre: { 'increased Chaos Damage': 3000, 'increased Cold Damage': 3000, 'increased Fire Damage': 3000,
      'increased Lightning Damage': 3000, 'increased Rarity of Items found': 3000, 'to Accuracy Rating': 6000,
      'to Evasion Rating': 9000, 'to maximum Life': 8000, 'to maximum Mana': 12000,
      'Adds to Cold damage to Attacks': 3900, 'Adds to Fire damage to Attacks': 3900,
      'Adds to Lightning damage to Attacks': 3900, 'Adds to Physical Damage to Attacks': 7800 },
    suf: { 'Life Regeneration per second': 7000, 'increased Cast Speed': 5000,
      'increased Light Radius increased Mana Regeneration Rate': 3000, 'increased Mana Regeneration Rate': 6000,
      'increased Rarity of Items found': 3000, 'to all Attributes': 1600, 'to Dexterity': 8000, 'to Intelligence': 8000,
      'to Strength': 8000, 'to all Elemental Resistances': 4000, 'to Chaos Resistance': 1500, 'to Cold Resistance': 8000,
      'to Fire Resistance': 8000, 'to Lightning Resistance': 8000, 'Gain Life per enemy killed': 4500,
      'Gain Mana per enemy killed': 4500, 'Leech of Physical Attack Damage as Life': 2000,
      'Leech of Physical Attack Damage as Mana': 2000 },
  },
  Body_Armours_int: {
    pre: { 'to Physical Thorns damage': 7000, 'increased Energy Shield': 8000,
      'increased Energy Shield to maximum Energy Shield': 6000, 'increased Energy Shield to maximum Life': 6000,
      'to maximum Energy Shield': 11000, 'to maximum Life': 13000, 'to Spirit': 3000 },
    suf: { 'Life Regeneration per second': 11000, 'increased Energy Shield Recharge Rate': 3000,
      'reduced Attribute Requirements': 4500, 'reduced Duration of Bleeding on You': 2500,
      'reduced Ignite Duration on you': 2500, 'reduced Poison Duration on you': 2500, 'to Intelligence': 8000,
      'to Stun Threshold': 8000, 'to Chaos Resistance': 1500, 'to Cold Resistance': 8000, 'to Fire Resistance': 8000,
      'to Lightning Resistance': 8000 },
  },
  Quivers: {
    pre: { 'increased Damage with Bow Skills': 3000, 'increased Projectile Speed': 5000, 'to Accuracy Rating': 6200,
      'Adds to Cold damage to Attacks': 3900, 'Adds to Fire damage to Attacks': 3900,
      'Adds to Lightning damage to Attacks': 3900, 'Adds to Physical Damage to Attacks': 7800 },
    suf: { 'chance to Pierce an Enemy': 2500, 'increased Attack Speed': 2000,
      'increased Critical Damage Bonus for Attack Damage': 3875, 'increased Critical Hit Chance for Attacks': 3875,
      'to Dexterity': 8000, 'to Level of all Projectile Skills': 500, 'Surpassing chance to fire an additional Arrow': 750,
      'Gain Life per enemy killed': 4500, 'Gain Mana per enemy killed': 4500 },
  },
};

function rows(ids: readonly string[]) {
  return ids.map((id) => { const m = d.mods.get(id)!; return { key: norm(m.text ?? id), text: m.text ?? id, weight: m.tiers.reduce((s, t) => s + t.weight, 0) }; }).filter((r) => r.weight > 0);
}
function diff(label: string, ours: { key: string; text: string; weight: number }[], coe: Record<string, number>) {
  const coeKeys = new Map(Object.entries(coe).map(([k, v]) => [norm(k), { name: k, w: v }]));
  const ourKeys = new Set<string>();
  const issues: string[] = [];
  for (const r of ours) {
    ourKeys.add(r.key);
    const c = coeKeys.get(r.key);
    if (!c) issues.push(`OURS-ONLY  ${r.text} (w=${r.weight})`);
    else if (c.w !== r.weight) issues.push(`WEIGHT≠  ${r.text}  ours=${r.weight} coe=${c.w}`);
  }
  for (const [k, c] of coeKeys) if (!ourKeys.has(k)) issues.push(`COE-ONLY  ${c.name} (w=${c.w})`);
  console.log(`  ${label}: ${issues.length === 0 ? 'MATCH ✓' : issues.length + ' diff(s)'}`);
  issues.forEach((i) => console.log(`     ${i}`));
}

for (const [baseId, coe] of Object.entries(CoE)) {
  const b = d.bases.get(baseId)!;
  console.log(`\n${baseId}:`);
  diff('prefixes', rows(b.pools.normal.prefixes), coe.pre);
  diff('suffixes', rows(b.pools.normal.suffixes), coe.suf);
}
