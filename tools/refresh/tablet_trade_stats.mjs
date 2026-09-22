#!/usr/bin/env node
// Map every Precursor Tablet modifier to the official trade site's stat ids, so the Tablets tab can hand
// a player a search already filled in. Writes data/tablets/trade-stats.json; idempotent.
//
// WHERE THE IDS COME FROM. Exiled Exchange 2 publishes `stats.ndjson` (MIT) — the game's stat ids and
// wordings against the trade site's `explicit.stat_…` ids — and this reads a PINNED commit of it, so a
// rebuild is reproducible and nothing fetches the trade site itself (GGG's Terms of Use forbid that, and
// a player clicking the finished link is not us).
//
// TWO MATCHES, in this order. A tablet mod carries exactly one stat, so its stat id is the join: 41 of 48
// resolve that way. The other 7 carry a stat id the trade site spells differently (a map-boss variant, a
// "_scaled" suffix), and match on TEXT instead, normalised for the numbers and for "an additional X" vs
// "# additional Xs".
//
// AMBIGUITY IS RECORDED, NOT HIDDEN. Where a mod resolves to more than one trade id, the search asks for
// ANY of them (`count` ≥ 1), and the entry is marked `ambiguous`: EE2 folds the singular and plural
// wordings of one stat into a single row, so on an Overseer tablet "Map contains an additional Shrine"
// and "Map contains (1-2) additional Shrines" — two different modifiers — cannot be told apart from its
// data alone. A search for either then lists both, which is loose, not wrong: the player reads the
// listings. Tightening it needs the trade site's own stat list, read by hand.
//
// Usage: node tools/refresh/tablet_trade_stats.mjs
// Reads:  data/patches/0.5.0/mods.json (+ the pinned EE2 file over the network)
// Writes: data/tablets/trade-stats.json

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EE2_COMMIT = '572c1925e4737d2c5f79143d03280df9660c1d8f';
const EE2_URL = `https://raw.githubusercontent.com/Kvan7/Exiled-Exchange-2/${EE2_COMMIT}/renderer/public/data/en/stats.ndjson`;

/** Squash a modifier's wording to what the two sources agree on: no numbers, no singular/plural. */
const norm = (text) => (text ?? '')
  .replace(/\(-?\d+(?:\.\d+)?--?\d+(?:\.\d+)?\)/g, '#')
  .replace(/(?<![\w#])-?\d+(?:\.\d+)?/g, '#')
  .replace(/\ban additional\b/gi, '# additional')
  .replace(/\bs\b/gi, '')
  .replace(/s(?=\s|$)/gi, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const res = await fetch(EE2_URL);
if (!res.ok) throw new Error(`EE2 stats.ndjson: HTTP ${res.status}`);
const rows = (await res.text()).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const explicitOf = (row) => row.trade?.ids?.explicit ?? [];
const byStat = new Map();
const byText = new Map();
for (const row of rows) {
  const ids = explicitOf(row);
  if (ids.length === 0) continue;
  if (row.id && !byStat.has(row.id)) byStat.set(row.id, ids);
  for (const text of [row.ref, ...(row.matchers ?? []).map((m) => m.string)]) {
    const key = norm(text);
    if (key && !byText.has(key)) byText.set(key, ids);
  }
}

const mods = JSON.parse(readFileSync(join(ROOT, 'data/patches/0.5.0/mods.json'), 'utf8')).mods
  .filter((m) => m.id.startsWith('Tablets/'));
const stats = {};
const missing = [];
let ambiguous = 0;
for (const mod of mods) {
  const stat = mod.tiers[0]?.stats?.[0];
  const ids = byStat.get(stat) ?? byText.get(norm(mod.text));
  if (!ids) { missing.push(`${mod.id} (${stat}) — ${mod.text}`); continue; }
  if (ids.length > 1) ambiguous++;
  stats[mod.id] = { ids, ...(ids.length > 1 ? { ambiguous: true } : {}) };
}
if (missing.length > 0) throw new Error(`no trade id for ${missing.length} modifier(s):\n  ${missing.join('\n  ')}`);

const out = {
  source: 'Exiled Exchange 2 (MIT), renderer/public/data/en/stats.ndjson',
  commit: EE2_COMMIT,
  read: new Date().toISOString().slice(0, 10),
  about: 'Trade-site stat ids per tablet modifier. `ambiguous` means the ids cover more than one wording '
    + 'of the stat, so a search asks for any of them and can list a modifier the player did not ask for.',
  stats: Object.fromEntries(Object.entries(stats).sort(([a], [b]) => (a < b ? -1 : 1))),
};
writeFileSync(join(ROOT, 'data/tablets/trade-stats.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`trade stats: ${Object.keys(stats).length} modifiers (${ambiguous} ambiguous), EE2 @ ${EE2_COMMIT.slice(0, 7)}`);
