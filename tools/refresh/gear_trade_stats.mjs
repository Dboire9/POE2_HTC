#!/usr/bin/env node
// Map every gear modifier to the official trade site's stat ids, so the planner can hand a player a
// search for any item it shows — the finished item, and every item it suggests buying instead. Writes
// data/trade/gear-stats.json; idempotent. The tablet twin is tablet_trade_stats.mjs.
//
// WHERE THE IDS COME FROM. The same pinned commit of Exiled Exchange 2's `stats.ndjson` (MIT) the tablet
// file reads: the game's stat ids and wordings against the trade site's ids. Nothing fetches the trade
// site itself (GGG's Terms of Use forbid that); a player clicking the finished link is not us.
//
// ONE FILTER PER LINE of the modifier's text, and each `#` in a line takes the next of the tier's value
// ranges — so "Adds # to # Cold Damage" takes two, and is searched on their average, the way the trade
// site filters it. A line resolves to a trade stat by the game stat id where the modifier carries one
// (normal modifiers do) and by its wording otherwise: Essence, Perfect Essence and Desecrated modifiers
// ship with value ranges but no stat ids, and would have no search at all without the text.
//
// Each stat keeps the trade ids of every way the modifier can sit on an item — explicit, desecrated,
// fractured — since a search for "this modifier" should find it however it got there. Where EE2 folds
// two stats into one row (local and global Attack Speed) the entry is marked `ambiguous`: the search
// asks for either, which the item category keeps honest. A line that is a "reduced" wording, or rolls
// below zero, gets no value — a trade filter's minimum means "at least", which it cannot say there.
//
// Keyed by MODIFIER because the browser never gets the stat ids (shipModsFile drops them), and the
// planner asks per modifier anyway. Rows are shared: `mods[id]` lists `[row, firstRange, ranges]`, one
// per line, `null` for a line with no trade stat.
//
// Usage: node tools/refresh/gear_trade_stats.mjs
// Reads:  data/patches/0.5.0/mods.json (+ the pinned EE2 file over the network)
// Writes: data/trade/gear-stats.json

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EE2_COMMIT = '572c1925e4737d2c5f79143d03280df9660c1d8f';
const EE2_URL = `https://raw.githubusercontent.com/Kvan7/Exiled-Exchange-2/${EE2_COMMIT}/renderer/public/data/en/stats.ndjson`;
const KINDS = ['explicit', 'desecrated', 'fractured'];

/** Squash a wording to what the two sources agree on: no numbers, no signs, no singular/plural. */
const norm = (text) => (text ?? '')
  .replace(/\(-?\d+(?:\.\d+)?--?\d+(?:\.\d+)?\)/g, '#')
  .replace(/[+-]?(?<![\w#])\d+(?:\.\d+)?/g, '#')
  .replace(/\+#/g, '#')
  .replace(/\ban additional\b/gi, '# additional')
  .replace(/s(?=\s|$)/gi, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const res = await fetch(EE2_URL);
if (!res.ok) throw new Error(`EE2 stats.ndjson: HTTP ${res.status}`);
const ee2 = (await res.text()).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
  .filter((row) => (row.trade?.ids?.explicit ?? []).length > 0);
const byStat = new Map();
/** Wording → [row, negated]: a "reduced" matcher is the same stat, searched as a negative number. */
const byText = new Map();
for (const row of ee2) {
  if (row.id && !byStat.has(row.id)) byStat.set(row.id, row);
  for (const m of [{ string: row.ref }, ...(row.matchers ?? [])]) {
    const key = norm(m.string);
    if (key && !byText.has(key)) byText.set(key, [row, m.negate === true]);
  }
}

const modsFile = JSON.parse(readFileSync(join(ROOT, 'data/patches/0.5.0/mods.json'), 'utf8'));
const mods = (Array.isArray(modsFile) ? modsFile : Object.values(modsFile.mods ?? modsFile))
  .filter((m) => !m.id.startsWith('Tablets/'))
  .sort((a, b) => (a.id < b.id ? -1 : 1));

const rows = [];
const rowIndex = new Map();
const rowOf = (row, negated) => {
  const key = `${row.ref}|${row.id ?? ''}`;
  if (!rowIndex.has(key)) {
    rowIndex.set(key, rows.length);
    rows.push({
      ids: [...new Set(KINDS.flatMap((k) => row.trade.ids[k] ?? []))],
      ...(row.trade.ids.explicit.length > 1 ? { ambiguous: true } : {}),
    });
  }
  return { at: rowIndex.get(key), negated: negated || row.better === -1 };
};

const out = {};
const unmatched = [];
let lines = 0;
let found = 0;
for (const m of mods) {
  const tier = m.tiers[m.tiers.length - 1];
  const stats = tier.stats ?? [];
  let next = 0;
  const filters = [];
  for (const printed of (m.text ?? '').split('\n')) {
    const count = (printed.match(/#/g) ?? []).length;
    // An Essence's attribute modifier prints as "Strength, Dexterity or Intelligence"; its id says which.
    const attribute = /(Strength|Dexterity|Intelligence)$/.exec(m.id)?.[1];
    const line = attribute ? printed.replace('Strength, Dexterity or Intelligence', attribute) : printed;
    const first = next;
    next += count;
    lines++;
    // By stat id where the modifier has them and they line up with its ranges; by wording otherwise.
    const byId = stats.length === tier.ranges.length ? byStat.get(stats[first]) : undefined;
    const hit = byId ? [byId, false] : byText.get(norm(line));
    // A fixed line ("30% increased Movement Speed") has no range to filter on: searched by presence.
    if (!hit) { filters.push(null); unmatched.push(`${m.id}: ${line}`); continue; }
    found++;
    const { at, negated } = rowOf(hit[0], hit[1]);
    // [row, firstRange, ranges] — ranges 0 means "no value filter" (a negative or lower-is-better line).
    filters.push([at, first, negated || count > 2 ? 0 : count]);
  }
  out[m.id] = filters;
}

mkdirSync(join(ROOT, 'data/trade'), { recursive: true });
writeFileSync(join(ROOT, 'data/trade/gear-stats.json'), `${JSON.stringify({
  about: 'Gear modifier -> the official trade site\'s stat ids, for searches the player clicks. Built by '
    + 'tools/refresh/gear_trade_stats.mjs from Exiled Exchange 2\'s stats.ndjson (MIT, '
    + 'https://github.com/Kvan7/Exiled-Exchange-2). mods[id]: one [row, firstRange, ranges] per line of the '
    + 'modifier\'s text (null: no trade stat); ranges 0 = no value filter, 2 = the average of two. '
    + 'rows[i].ambiguous: the ids cover more than one stat (local and global), so the search asks for either.',
  ee2Commit: EE2_COMMIT,
  rows,
  mods: out,
})}\n`);
console.log(`gear trade stats: ${found} of ${lines} lines over ${mods.length} modifiers, ${rows.length} trade rows`);
if (unmatched.length) console.log(`unmatched (${unmatched.length}):\n  ${unmatched.slice(0, 40).join('\n  ')}`);
