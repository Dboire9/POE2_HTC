#!/usr/bin/env node
// Parse a saved poe2db item-class page (e.g. https://poe2db.tw/us/Wands) and extract its embedded
// modifier data. poe2db embeds, per item class, a JS object with pool arrays ("normal",
// "desecrated", ...) whose mod objects carry the COMMUNITY spawn weight in `DropChance` (the value
// game files lack). Fields per mod object: Name, Level (tier), DropChance (weight), reqlvl,
// ModFamilyList, ModGenerationTypeID (1=prefix,2=suffix), str (stat text w/ ranges), spawn_no.
//
// This module only reads a local HTML file (no network). Export: parsePoe2dbHtml(html) -> pools.

export function parsePoe2dbHtml(html) {
  const out = {};
  for (const pool of ['normal', 'desecrated', 'essence']) {
    const arr = extractJsonArray(html, `"${pool}":[`);
    if (arr) out[pool] = arr.map(normalizeMod).filter(Boolean);
  }
  return out;
}

// Find `<key>[ ... ]` and return the parsed array, honoring strings/escapes and nesting.
function extractJsonArray(html, keyOpen) {
  const at = html.indexOf(keyOpen);
  if (at < 0) return null;
  const start = at + keyOpen.length - 1; // points at the '['
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) { return JSON.parse(html.slice(start, i + 1)); }
    }
  }
  return null;
}

function normalizeMod(m) {
  const weight = Number(m.DropChance);
  if (!Number.isFinite(weight)) return null;
  return {
    name: m.Name,
    family: Array.isArray(m.ModFamilyList) ? m.ModFamilyList[0] : m.ModFamilyList,
    families: m.ModFamilyList || [],
    type: String(m.ModGenerationTypeID) === '1' ? 'prefix'
      : String(m.ModGenerationTypeID) === '2' ? 'suffix' : String(m.ModGenerationTypeID),
    // poe2db `Level` is the mod's item level (matches RePoE required_level and our ilvl exactly).
    ilvl: m.Level != null ? Number(m.Level) : null,
    weight,
    tags: m.spawn_no || [],
    text: stripHtml(m.str),
  };
}

function stripHtml(s) {
  if (s == null) return null;
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Group a pool's flat tier list into mods: (type, family) -> tiers sorted by ilvl.
export function groupByFamily(mods) {
  const groups = new Map();
  for (const m of mods) {
    const key = `${m.type}:${m.family}`;
    if (!groups.has(key)) groups.set(key, { type: m.type, family: m.family, tiers: [] });
    groups.get(key).tiers.push({ name: m.name, ilvl: m.ilvl, weight: m.weight, text: m.text });
  }
  for (const g of groups.values()) g.tiers.sort((a, b) => a.ilvl - b.ilvl);
  return groups;
}

// --- CLI: validate against a saved html file --------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(process.argv[2], 'utf8');
  const pools = parsePoe2dbHtml(html);
  for (const [pool, mods] of Object.entries(pools)) {
    console.log(`\n=== pool "${pool}": ${mods.length} tier-rows ===`);
    const groups = groupByFamily(mods);
    console.log(`  ${groups.size} mod groups`);
    if (pool === 'normal') {
      for (const g of groups.values()) {
        const w = [...new Set(g.tiers.map((t) => t.weight))];
        console.log(`  ${g.type.padEnd(7)} ${(g.family || '?').padEnd(28)} tiers=${g.tiers.length} `
          + `weights=[${w.join(',')}]`);
      }
    }
  }
}
