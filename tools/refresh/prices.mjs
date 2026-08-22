// Refresh data/patches/<patch>/prices.json from poe.ninja's PoE2 economy API.
//
// WHY THIS EXISTS: every "expected cost" the app reports is exact probability math multiplied by this
// sheet, and the optimizer RANKS plans by cost — so wrong *relative* prices change which plan is
// recommended, not merely the total on it. The previous sheet was hand-authored order-of-magnitude
// seed values and had drifted badly: it priced a Chaos Orb at 0.2ex when the market says 33ex, i.e.
// it thought an Exalt was worth 5 Chaos when a Chaos is worth 33 Exalts. Chaos/annul-heavy plans were
// therefore being recommended as cheap while being the dearest route available.
//
// WHY A COMMITTED SNAPSHOT rather than fetching at runtime: poe.ninja sends no CORS header, so a
// browser cannot call it directly, and their docs ask explicitly that "desktop apps and other clients
// should proxy these requests through their own backend rather than calling the endpoints directly
// from end-user machines". Writing a versioned JSON file matches how all other game data in this repo
// works (data lives in data/patches/<patch>/, never in source), needs no backend, cannot fail at
// runtime, and behaves identically in the web and Electron builds.
//
// Usage: node tools/refresh/prices.mjs [--league "Runes of Aldur"] [--patch 0.5.0] [--dry-run]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const API = 'https://poe.ninja/poe2/api/economy';
// poe.ninja asks for a descriptive User-Agent identifying the app and a contact.
const UA = 'POE2HTC/0.9.7 (crafting optimizer; +https://github.com/Dboire9/POE2_HTC)';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const DRY = process.argv.includes('--dry-run');
const PATCH = arg('patch', '0.5.0');

/**
 * Our price key → poe.ninja currency id. Only unambiguous 1:1 mappings live here; anything needing a
 * judgement call is deliberately absent and keeps its existing hand-authored value (see KEEP below).
 */
const CURRENCY = {
  transmute: 'transmute',
  transmute_greater: 'greater-orb-of-transmutation',
  transmute_perfect: 'perfect-orb-of-transmutation',
  augment: 'aug',
  augment_greater: 'greater-orb-of-augmentation',
  augment_perfect: 'perfect-orb-of-augmentation',
  regal: 'regal',
  regal_greater: 'greater-regal-orb',
  regal_perfect: 'perfect-regal-orb',
  alchemy: 'alch',
  chaos: 'chaos',
  chaos_greater: 'greater-chaos-orb',
  chaos_perfect: 'perfect-chaos-orb',
  exalt: 'exalted',
  exalt_greater: 'greater-exalted-orb',
  exalt_perfect: 'perfect-exalted-orb',
  annul: 'annul',
  vaal: 'vaal',
  divine: 'divine',
};

/**
 * Keys with NO clean live source, which therefore keep their hand-authored values and stay flagged as
 * estimates. Recorded here so the gap is explicit rather than silent:
 *   - the 13 omens: poe.ninja has an Omens page (/poe2/economy/<league>/omens) but no API `type` value
 *     found for it — Currency/Essences/Fragments/Runes all work, every omen spelling returns empty.
 *   - desecrate: the feed carries four distinct "Orb of Sacrifice" variants (Yugul's 1.5ex, Kamasa's
 *     27ex, Yaomac's 34ex, Kopec's 148ex) and picking which one the engine's single `desecrate` step
 *     means is a game-knowledge call, not a mapping one.
 *   - essence/essence_lesser/essence_greater/perfect_essence: `type=Essences` returns 79 live lines,
 *     but prices span 0.07–340ex ACROSS essences while our model has one price per LEVEL. Collapsing
 *     that to a median would invent precision; wiring per-essence prices is a modelling change.
 */
const KEEP = ['desecrate', 'essence', 'essence_lesser', 'essence_greater', 'perfect_essence'];

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  const leagues = await getJson(`${API}/leagues`);
  // The first entry is the current temporary challenge league, which is the economy people actually
  // craft in; Standard prices are a different (and much thinner) market.
  const league = arg('league', leagues[0]?.id);
  if (!league) throw new Error('could not determine a league');
  console.log(`league: ${league}   (available: ${leagues.map((l) => l.id).join(', ')})`);

  const cur = await getJson(`${API}/exchange/current/overview?league=${encodeURIComponent(league)}&type=Currency`);
  const lines = new Map(cur.lines.map((l) => [l.id, l]));

  // Everything is quoted against the exchange's "primary" currency (divine); we store
  // exalt-equivalents, so divide through by the Exalted Orb's own primary value.
  const exalt = lines.get('exalted')?.primaryValue;
  if (!exalt) throw new Error('no Exalted Orb in the feed — cannot compute exalt-equivalents');

  const file = join(ROOT, `data/patches/${PATCH}/prices.json`);
  const prev = JSON.parse(readFileSync(file, 'utf8'));
  const prices = { ...prev.prices };

  const missing = [];
  let changed = 0;
  for (const [key, id] of Object.entries(CURRENCY)) {
    const line = lines.get(id);
    if (!line) { missing.push(`${key} (${id})`); continue; }
    const value = Number((line.primaryValue / exalt).toPrecision(4));
    if (prices[key] !== value) {
      const before = prices[key];
      const factor = before ? (value / before) : Infinity;
      console.log(`  ${key.padEnd(20)} ${String(before).padStart(9)} -> ${String(value).padEnd(9)} (x${factor.toFixed(1)})`);
      changed++;
    }
    prices[key] = value;
  }
  if (missing.length) console.warn(`  WARNING not found in feed: ${missing.join(', ')}`);
  console.log(`  kept hand-authored (no clean live source): ${KEEP.join(', ')}`);

  const out = {
    ...prev,
    prices,
    // Provenance drives the UI's honesty label (see PriceBasisNote): `estimated` stays TRUE because
    // the omen, desecration and essence entries are still hand-authored guesses.
    generated: prev.generated,
    updated: new Date().toISOString().slice(0, 10),
    league,
    source: `Currency prices from poe.ninja PoE2 economy (${league}), exalt-equivalent. `
      + `Omens, desecration and essence levels remain hand-authored estimates — see tools/refresh/prices.mjs.`,
    estimated: true,
    unit: 'exalt-equivalent',
  };

  if (DRY) {
    console.log(`\n--dry-run: ${changed} price(s) would change; not writing.`);
    return;
  }
  writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`\nwrote ${file} — ${changed} price(s) changed.`);
}

main().catch((e) => { console.error(String(e)); process.exit(1); });
