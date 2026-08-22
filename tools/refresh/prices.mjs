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
 *   - desecrate: the feed carries four distinct "Orb of Sacrifice" variants (Yugul's 1.5ex, Kamasa's
 *     27ex, Yaomac's 34ex, Kopec's 148ex) and picking which one the engine's single `desecrate` step
 *     means is a game-knowledge call, not a mapping one.
 *   - essence/essence_lesser/essence_greater/perfect_essence: `type=Essences` returns 79 live lines,
 *     but prices span 0.07–340ex ACROSS essences while our model has one price per LEVEL. Collapsing
 *     that to a median would invent precision; wiring per-essence prices is a modelling change.
 */
const KEEP = ['desecrate', 'essence', 'essence_lesser', 'essence_greater', 'perfect_essence'];

/**
 * A KEEP key has no 1:1 live line, but it does have a live PLAUSIBLE RANGE — the spread of the real
 * items it stands for. We check the hand-authored value against that range on every run.
 *
 * This guards the specific hazard of a PARTIAL refresh: if the fetched keys move to live prices while
 * these stay on an old scale, the untouched keys silently become orders of magnitude too cheap, and
 * since the optimizer ranks plans BY cost it would start recommending whatever it thinks is nearly
 * free. Checking beats assuming — the range moves with the economy, so this stays honest by itself.
 */
const SANITY = {
  // Desecration consumes a bone at the Well of Souls. (The Abyss feed's "…-gaze" lines are the boss
  // items — Amanamu, Ulaman, Kurgal — not bones, so they are excluded.)
  desecrate: { type: 'Abyss', match: (id) => /jawbone|rib|collarbone|cranium/.test(id) },
  // Essence LEVEL is encoded in the id prefix; unprefixed ids are the base level.
  essence_lesser: { type: 'Essences', match: (id) => id.startsWith('lesser-') },
  essence_greater: { type: 'Essences', match: (id) => id.startsWith('greater-') },
  perfect_essence: { type: 'Essences', match: (id) => id.startsWith('perfect-') },
  essence: { type: 'Essences', match: (id) => !/^(lesser|greater|perfect)-/.test(id) },
};

/**
 * Omens are quoted, not fetched. poe.ninja's economy API has no `type` value that serves them —
 * Currency/Essences/Fragments/Runes all work, but `type=Omens` returns byte-identical output to
 * `type=NonsenseXYZ` (empty core, no rates), i.e. it is an *invalid* type rather than an empty valid
 * one — and their Omens page is client-rendered, so it cannot be scraped with a plain fetch either.
 * So `prices.json` carries hand-transcribed `omenQuotes` from that page.
 *
 * They are stored IN THE UNIT THE MARKET QUOTES THEM IN (divine or chaos) rather than pre-converted to
 * exalts, and re-converted here on every run. That matters: omen prices are sticky in divine/chaos
 * terms while the exalt exchange rate is not, so a pre-converted sheet would silently desync from the
 * currency prices the moment anyone re-ran this script — and since omens are an ADDITIVE surcharge on
 * the orb they modify, a drifted omen:orb ratio changes which plans the optimizer recommends. Storing
 * the quote and converting late keeps the whole sheet on one consistent exchange rate.
 */
function convertOmens(quotes, rates) {
  const omens = {};
  for (const [id, q] of Object.entries(quotes ?? {})) {
    const rate = rates[q.unit];
    if (!rate) throw new Error(`omen ${id}: no exalt rate for unit "${q.unit}"`);
    // The page quotes either "12 Divine → 1.0 Omen" or "1.0 Chaos → 66 Omens"; both are (price, qty).
    omens[id] = Number(((q.price * rate) / q.quantity).toPrecision(4));
  }
  return omens;
}

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

  console.log('\nhand-authored keys, checked against the live spread of what they stand for:');
  const feeds = new Map();
  for (const [key, { type, match }] of Object.entries(SANITY)) {
    if (!feeds.has(type)) {
      feeds.set(type, await getJson(`${API}/exchange/current/overview?league=${encodeURIComponent(league)}&type=${type}`));
    }
    const vals = feeds.get(type).lines.filter((l) => match(l.id)).map((l) => l.primaryValue / exalt).sort((a, b) => a - b);
    const [lo, hi] = [vals[0], vals.at(-1)];
    const held = prices[key];
    const ok = held >= lo && held <= hi;
    console.log(`  ${ok ? 'ok  ' : 'WARN'} ${key.padEnd(16)} ${String(held).padStart(7)}   live ${type} range ${lo.toPrecision(3)} – ${hi.toPrecision(4)} (n=${vals.length})`);
    if (!ok) console.warn(`       ^ outside the live range — re-check this value before trusting any cost the app reports.`);
  }

  // Omens re-derive from their stored market quotes at the same exchange rate as everything above.
  const rates = { exalt: 1, chaos: lines.get('chaos').primaryValue / exalt, divine: lines.get('divine').primaryValue / exalt };
  const omens = convertOmens(prev.omenQuotes, rates);
  console.log(`\nomens (1 chaos = ${rates.chaos.toFixed(2)}ex, 1 divine = ${rates.divine.toFixed(2)}ex):`);
  for (const [id, value] of Object.entries(omens)) {
    const before = prev.omens?.[id];
    if (before !== value) console.log(`  ${id.padEnd(32)} ${String(before).padStart(9)} -> ${String(value).padEnd(9)} (x${(value / before).toFixed(1)})`);
  }
  // The quotes are a dated hand transcription, so say how stale they are rather than let them rot
  // silently — a fresh currency sheet paired with months-old omen quotes is the desync described above.
  const ageDays = Math.round((Date.now() - Date.parse(prev.omenQuotesAsOf)) / 86_400_000);
  const staleness = ageDays > 30 ? `  WARNING omenQuotes are ${ageDays} days old — re-transcribe from ${prev.omenQuotesSource?.split(' ')[0]}` : `  omenQuotes are ${ageDays} day(s) old.`;
  console.log(staleness);

  const out = {
    ...prev,
    prices,
    omens,
    // Provenance drives the UI's honesty label (see PriceBasisNote): `estimated` stays TRUE because
    // the desecration and essence entries are still hand-authored guesses, even though currency and
    // omens are now observed. `caveat` says which is which, so the label can't overclaim in EITHER
    // direction — neither "all guesses" nor "all live".
    generated: prev.generated,
    updated: new Date().toISOString().slice(0, 10),
    league,
    source: `Currency from poe.ninja's PoE2 economy API and omens from its Omens page (${league}), `
      + `in exalt-equivalents. Desecration and essence levels remain hand-authored — see tools/refresh/prices.mjs.`,
    estimated: true,
    caveat: 'Currency and omen prices are live market data; desecration and essence prices are still hand-authored estimates.',
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
