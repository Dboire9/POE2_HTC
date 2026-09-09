#!/usr/bin/env node
// Fetch configured poe.ninja profiles, resolve their gear against the shipped patch data, and write
// the ANSWER — base ids, mod ids, tier numbers — for the app to load.
//
// Usage: node tools/streamers/fetch.mjs [--patch 0.5.0] [--dry-run]
//
// WHY A JOB AND NOT THE BROWSER, twice over. The resolution needs `tiers[].stats`, which `shipMods.ts`
// strips from the asset the browser downloads — so it has to happen where the full mods file is. And
// poe.ninja ask that clients not call their endpoints from end-user machines; the committed-snapshot
// design already honours that for prices, and a thousand players reading a streamer's gear should
// generate zero requests, exactly as a thousand players pricing a craft do.
//
// The output is small on purpose: one item is a few hundred bytes of ids against the 400 kB payload
// it came from, and none of it needs the stats column.
//
// ENDPOINTS (undocumented, public, and read by a browser on every profile page):
//   /poe2/api/profile/characters/<slug>/<anything>                    -> the character list
//   /poe2/api/profile/characters/<slug>/<leagueUrl>/<char>/model/600   -> one character, with items
// That second path segment is REQUIRED AND IGNORED: the slug alone 404s, while `0`, the profile's
// real account id and `999999` all return the same 36,953 bytes (measured). So `0` is passed rather
// than a lookup nobody needs — and if that ever stops being true the run fails loudly on a 404
// instead of quietly reading the wrong account.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { resolveProfileItems } from '../../packages/engine/src/profileItems.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const API = 'https://poe.ninja/poe2/api/profile/characters';
const UA = 'poe2htc streamer gear (github.com/Dboire9/POE2_HTC)';
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const PATCH = arg('patch', '0.5.0');
const DRY = process.argv.includes('--dry-run');

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

/** The character the profile is currently playing, or nothing. Historical characters are not what a
 *  player means by "how is this streamer's gear crafted". */
function currentCharacter(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.find((c) => c.isCurrent) ?? undefined;
}

async function main() {
  const data = loadPatch(join(ROOT, `data/patches/${PATCH}`));
  const { profiles } = JSON.parse(readFileSync(join(ROOT, 'tools/streamers/profiles.json'), 'utf8'));
  const out = [];

  for (const slug of profiles) {
    try {
      const list = await getJson(`${API}/${encodeURIComponent(slug)}/0`);
      const char = currentCharacter(list);
      if (!char) { console.log(`  ${slug}: no current character — skipped`); continue; }

      const model = await getJson(
        `${API}/${encodeURIComponent(slug)}/${encodeURIComponent(char.leagueUrl)}/${encodeURIComponent(char.name)}/model/600`,
      );
      const items = (model.charModel?.items ?? []).map((i) => i.itemData).filter(Boolean);
      const { items: resolved, skipped } = resolveProfileItems(data, items);
      const placed = resolved.reduce((n, i) => n + i.mods.length, 0);
      const open = resolved.reduce((n, i) => n + i.unresolved.length, 0);
      console.log(`  ${slug}: ${char.name} (${char.league}, level ${char.level}) — `
        + `${resolved.length} items, ${placed} modifiers placed, ${open} unresolved, ${skipped.length} skipped`);
      out.push({
        profile: slug,
        character: char.name,
        className: char.className ?? '',
        level: char.level ?? 0,
        league: char.league ?? '',
        items: resolved,
      });
    } catch (e) {
      // One profile failing must not lose the others: a character can be deleted or set private
      // between runs, and the sheet should still refresh for everyone else.
      console.log(`  ${slug}: FAILED — ${String(e)}`);
    }
  }

  const file = join(ROOT, `data/streamers/${PATCH}.json`);
  const payload = { patch: PATCH, updated: new Date().toISOString().slice(0, 10), source: 'poe.ninja profiles', characters: out };
  if (DRY) { console.log(`\n--dry-run: ${out.length} character(s); not writing.`); return; }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nwrote ${file} — ${out.length} character(s).`);
}

main().catch((e) => { console.error(String(e)); process.exit(1); });
