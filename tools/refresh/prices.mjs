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

// Nothing is hand-authored any more except the omen quotes below: desecration is priced by the bone a
// base actually consumes, and essences individually rather than by level. (The old "Orb of Sacrifice"
// lead was wrong — desecration consumes BONES, from the Abyss feed.)

/**
 * A Desecration consumes a BONE, and the item text says which: Gnawed/Preserved/Ancient Jawbone
 * "Desecrates a Rare Weapon or Quiver", Rib "a Rare Armour", Collarbone "a Rare Amulet, Ring or Belt",
 * Cranium "a Rare Jewel". Only PRESERVED matters here: Gnawed says "Maximum Item Level: 64" while
 * every desecrated mod in the data is ilvl 65, and Ancient's "Minimum Modifier Level: 40" is a
 * quality upgrade nothing models yet. The engine maps a base to its bone (`desecrationBoneFor`).
 */
const BONES = {
  jawbone: 'preserved-jawbone',
  rib: 'preserved-rib',
  collarbone: 'preserved-collarbone',
};

/** Essence level → the prefix poe.ninja puts on the id. NORMAL has none. */
const ESSENCE_PREFIX = { LESSER: 'lesser-', NORMAL: '', GREATER: 'greater-', PERFECT: 'perfect-' };

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

/** poe.ninja's id for an essence: "Essence of the Body" at Greater → greater-essence-of-the-body. */
const essenceId = (name, level) =>
  `${ESSENCE_PREFIX[level]}essence-of-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? undefined : s[Math.floor(s.length / 2)];
};

/**
 * One price per ESSENCE, keyed `essence:<level>:<modId>` — not one per level.
 *
 * The level ladder simply isn't one: Essence of Abrasion runs Lesser 116ex, Normal 107ex, Greater
 * 0.81ex, Perfect 9.18ex. Averaging that into "what a Greater essence costs" would be a number no
 * essence actually trades at. `essences.json` already maps essence → level → the mods it grants, and
 * inverting it is unambiguous (1288 pairs, no collisions), so each craft can be charged for the
 * essence it would really buy.
 *
 * Not every essence is listed — ~29 of 93 (level, essence) combinations have no trades at all, the
 * four "Alloy" essences among them. Those FALL BACK, in order: the same essence's other levels (its
 * identity matters more than its level), then that level's median across essences. Every fallback is
 * reported so the sheet can say which prices are inferred rather than observed.
 */
function priceEssences(essencesFile, lines, exalt) {
  const live = new Map(lines.map((l) => [l.id, l.primaryValue / exalt]));
  const byEssence = new Map();   // name -> [price…] across its listed levels
  const byLevel = new Map();     // level -> [price…] across essences
  for (const e of essencesFile.essences) {
    for (const level of Object.keys(ESSENCE_PREFIX)) {
      const v = live.get(essenceId(e.name, level));
      if (v === undefined) continue;
      if (!byEssence.has(e.name)) byEssence.set(e.name, []);
      byEssence.get(e.name).push(v);
      if (!byLevel.has(level)) byLevel.set(level, []);
      byLevel.get(level).push(v);
    }
  }

  const prices = {};
  const inferred = [];
  for (const e of essencesFile.essences) {
    for (const [level, mods] of Object.entries(e.tiers ?? {})) {
      // A level with no mods grants nothing, so it yields no price key — counting it as "inferred"
      // would inflate the caveat with entries that don't exist.
      if (!mods || mods.length === 0) continue;
      const exact = live.get(essenceId(e.name, level));
      const value = exact
        ?? median(byEssence.get(e.name) ?? [])
        ?? median(byLevel.get(level) ?? []);
      if (value === undefined) continue; // nothing to go on at all; leave the key absent
      if (exact === undefined) inferred.push(`${level} ${e.name}`);
      for (const modId of mods) prices[`essence:${level.toLowerCase()}:${modId}`] = Number(value.toPrecision(4));
    }
  }
  // Per-LEVEL medians as well: `stepCost` falls back to these when a specific essence has no entry.
  // Leaving the old hand-authored values would reintroduce an unsourced number, and dropping them
  // would make an unknown essence cost 0 — which reads as free and would dominate every frontier.
  const LEGACY_KEY = { LESSER: 'essence_lesser', NORMAL: 'essence', GREATER: 'essence_greater', PERFECT: 'perfect_essence' };
  for (const [level, key] of Object.entries(LEGACY_KEY)) {
    const m = median(byLevel.get(level) ?? []);
    if (m !== undefined) prices[key] = Number(m.toPrecision(4));
  }
  return { prices, inferred };
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

  // ── Desecration: priced by the BONE the base consumes, not one flat number ──
  const abyss = await getJson(`${API}/exchange/current/overview?league=${encodeURIComponent(league)}&type=Abyss`);
  const abyssLines = new Map(abyss.lines.map((l) => [l.id, l.primaryValue / exalt]));
  const bones = {};
  console.log('\ndesecration bones (Preserved — Gnawed caps at item level 64, and every desecrated mod is ilvl 65):');
  for (const [bone, id] of Object.entries(BONES)) {
    const v = abyssLines.get(id);
    if (v === undefined) { console.warn(`  WARNING no ${id} in the Abyss feed`); continue; }
    bones[bone] = Number(v.toPrecision(4));
    console.log(`  ${bone.padEnd(12)} ${String(bones[bone]).padStart(9)}   (${id})`);
  }
  // The grade choice only holds while every desecrated mod is ilvl 65; say so if that changes.
  const modsFile = JSON.parse(readFileSync(join(ROOT, `data/patches/${PATCH}/mods.json`), 'utf8'));
  const modList = Array.isArray(modsFile) ? modsFile : (modsFile.mods ?? Object.values(modsFile).find(Array.isArray));
  const desIlvls = new Set(modList.filter((m) => m.source === 'desecrated').flatMap((m) => m.tiers.map((x) => x.ilvl)));
  if (desIlvls.size !== 1) {
    console.warn(`  WARNING desecrated mods span ilvls ${[...desIlvls].join(', ')} — the single Preserved grade may no longer cover them all.`);
  }

  // ── Essences: one price per ESSENCE, not per level ──
  const essFeed = await getJson(`${API}/exchange/current/overview?league=${encodeURIComponent(league)}&type=Essences`);
  const essencesFile = JSON.parse(readFileSync(join(ROOT, `data/patches/${PATCH}/essences.json`), 'utf8'));
  const { prices: essencePrices, inferred } = priceEssences(essencesFile, essFeed.lines, exalt);
  for (const key of Object.keys(prices)) if (key.startsWith('essence')) delete prices[key];
  Object.assign(prices, essencePrices);
  // `desecrationBoneFor` treats an unmapped category as armour, so the flat fallback key mirrors the
  // rib price rather than keeping the old 0.5 guess.
  if (bones.rib !== undefined) prices.desecrate = bones.rib;
  console.log(`\nessences: ${Object.keys(essencePrices).length} (level, mod) prices from ${essFeed.lines.length} live lines`);
  if (inferred.length) {
    console.log(`  ${inferred.length} not traded, inferred from the same essence's other levels: ${inferred.slice(0, 6).join(', ')}${inferred.length > 6 ? ', …' : ''}`);
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
    bones,
    omens,
    // Provenance drives the UI's honesty label (see PriceBasisNote): `estimated` stays TRUE because
    // the desecration and essence entries are still hand-authored guesses, even though currency and
    // omens are now observed. `caveat` says which is which, so the label can't overclaim in EITHER
    // direction — neither "all guesses" nor "all live".
    generated: prev.generated,
    updated: new Date().toISOString().slice(0, 10),
    league,
    source: `Live poe.ninja PoE2 economy (${league}), in exalt-equivalents: currency and desecration `
      + `bones from the API, essences priced individually, omens hand-transcribed from the Omens page `
      + `(no API serves them) — see tools/refresh/prices.mjs.`,
    estimated: inferred.length > 0,
    ...(inferred.length > 0
      ? { caveat: `All prices are live market data, except ${inferred.length} essence variant${inferred.length === 1 ? '' : 's'} nobody is currently trading — those are inferred from the same essence's other levels.` }
      : {}),
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
