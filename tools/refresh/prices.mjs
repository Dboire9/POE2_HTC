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
 * **Omens ARE fetched, from `type=Ritual`** (2026-09-02). They were hand-transcribed for months on the
 * belief that poe.ninja does not serve them, and that belief was half right: `type=Omens` really does
 * return byte-identical output to `type=NonsenseXYZ`, and the Omens *page* really is client-rendered
 * with no embedded payload. But omens are RITUAL content in PoE2, and the Ritual feed carries 36 of
 * them — every one this sheet needs, plus Whittling, with volume and a sparkline like any other line.
 * Only the name was wrong. Confirmed against poe2db independently: 11.7 divine there against 11.4.
 *
 * That matters more than a chore removed. Omens are an ADDITIVE surcharge 20-27x the orb they modify,
 * so a stale omen:orb ratio changes which plans the optimizer recommends rather than only what it says
 * they cost — and against the 11-day-old transcription the live feed moved Greater Exaltation by
 * **0.20x** and Sinistral Necromancy by 1.77x.
 *
 * `omenQuotes` survives as a FALLBACK for any omen the feed drops, and is still stored in native units
 * (divine or chaos) and re-converted here, for the reason below.
 *
 * They are stored IN THE UNIT THE MARKET QUOTES THEM IN (divine or chaos) rather than pre-converted to
 * exalts, and re-converted here on every run. That matters: omen prices are sticky in divine/chaos
 * terms while the exalt exchange rate is not, so a pre-converted sheet would silently desync from the
 * currency prices the moment anyone re-ran this script — and since omens are an ADDITIVE surcharge on
 * the orb they modify, a drifted omen:orb ratio changes which plans the optimizer recommends. Storing
 * the quote and converting late keeps the whole sheet on one consistent exchange rate.
 */
/** poe.ninja's id for an omen: OmenofSinistralAnnulment -> omen-of-sinistral-annulment. */
const omenId = (key) =>
  key.replace(/^Omenof/, 'Omen-of-').replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase().replace(/-+/g, '-');

/**
 * Live omen prices from the Ritual feed, in exalt-equivalents, falling back to the stored quote.
 *
 * Same depth rule as everything else: a line under `DEPTH.minUnits` traded per day is not a market,
 * and its quote is kept instead of taken. Measured 2026-09-02, that is 2 of 14 — the Blackblooded (23
 * a day) and the Sovereign (7) — while Whittling trades 839.
 */
function priceOmens(feedLines, quotes, exalt, rates) {
  const lines = new Map(feedLines.map((l) => [l.id, l]));
  const omens = {};
  const fallback = [];
  const thin = [];
  for (const key of new Set([...Object.keys(quotes ?? {}), ...OMEN_KEYS])) {
    const line = lines.get(omenId(key));
    const units = line && line.primaryValue ? (line.volumePrimaryValue ?? 0) / line.primaryValue : 0;
    if (line && units >= DEPTH.minUnits) {
      omens[key] = Number((line.primaryValue / exalt).toPrecision(4));
      continue;
    }
    if (line) thin.push(`${key} (${Math.round(units)}/day)`);
    const q = quotes?.[key];
    if (!q) continue; // no live line and no quote: leave the key absent rather than mint a free omen
    const rate = rates[q.unit];
    if (!rate) throw new Error(`omen ${key}: no exalt rate for unit "${q.unit}"`);
    omens[key] = Number(((q.price * rate) / q.quantity).toPrecision(4));
    fallback.push(key);
  }
  return { omens, fallback, thin };
}

/** Omens this app prices. Anything here missing from BOTH the feed and the quotes is reported. */
const OMEN_KEYS = [
  'OmenofSinistralAnnulment', 'OmenofDextralAnnulment', 'OmenofLight',
  'OmenofSinistralExaltation', 'OmenofDextralExaltation', 'OmenofGreaterExaltation',
  'OmenofSinistralCrystallisation', 'OmenofDextralCrystallisation',
  'OmenofSinistralNecromancy', 'OmenofDextralNecromancy',
  'OmenoftheBlackblooded', 'OmenoftheLiege', 'OmenoftheSovereign',
  'OmenofWhittling',
];


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
 * Not every essence is listed, and — since 2026-09-01 — a listing with no VOLUME behind it counts as
 * not listed either. A quote at under `DEPTH.minEssenceUnits` trades a day is one person's asking
 * price, not a market: on the day this was added, `essence-of-command` was quoting a price up
 * **16,567% in a week on literally zero units traded**, and the old code took it at face value. Since
 * the optimizer ranks plans BY cost, that does not merely misreport a total — it changes which route
 * is recommended for every craft naming that essence's mods.
 *
 * Both cases FALL BACK the same way, in order: the same essence's other levels (its identity matters
 * more than its level), then that level's median across essences. Every fallback is reported, so the
 * sheet's `caveat` keeps telling the user which prices are inferred rather than observed — which is
 * why routing untraded quotes here is better than either trusting them or blocking the refresh: the
 * honesty machinery already exists and this simply feeds it the truth.
 */
function priceEssences(essencesFile, lines, exalt) {
  const unitsOf = (l) => (l.primaryValue ? (l.volumePrimaryValue ?? 0) / l.primaryValue : 0);
  const untraded = lines.filter((l) => unitsOf(l) < DEPTH.minEssenceUnits);
  const live = new Map(lines.filter((l) => unitsOf(l) >= DEPTH.minEssenceUnits)
    .map((l) => [l.id, l.primaryValue / exalt]));
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
  return { prices, inferred, untraded: untraded.length };
}

/**
 * Market depth: is a price backed by a market, or by one listing?
 *
 * poe.ninja hands us `volumePrimaryValue` and a 7-day `sparkline` on every line, and until 2026-09-01
 * this script read neither — so a price backed by a single trade was trusted exactly as much as the
 * Exalted Orb's. That matters more here than in a price viewer, because **the optimizer RANKS plans by
 * cost**: a thin quote does not merely make a total wrong, it changes which route the app recommends,
 * and the shape tests pass because the shape is fine.
 *
 * **Depth is UNITS TRADED, which is `volumePrimaryValue / primaryValue` — never the raw volume.**
 * That field is denominated in the exchange's primary currency (divine), so it is systematically
 * wrong at both ends: a Transmute costs ~0.0004 div, so thousands of them trade for a tiny divine
 * figure, while a Mirror is huge per unit. Measured 2026-09-01, raw volume called plain Transmute the
 * fourth-THINNEST currency (0.42) and the Mirror the deepest market on the exchange (48,400); by units
 * it is Transmute 2,548/day and Mirror **7**. Reading the raw field ranks liquidity backwards.
 *
 * What that correction shows, on the same day's data:
 *   • Currency the sheet uses is healthy — transmute 2,548, regal 3,384, greater augment 1,536,
 *     annul 5,526, exalted 856,572 units/day.
 *   • Bones the sheet uses are healthy — preserved jawbone 220, rib 347, collarbone 357.
 *   • **Essences are not a market.** Median 2 units/day; 72 of 78 lines under 50; several at literally
 *     zero units still quoting a price, one of them (`essence-of-command`) up 16,567% in a week.
 *     They are also 1,292 of the sheet's 1,312 price keys.
 *
 * So the gate treats them differently, and the asymmetry is the whole design. An orb or bone price
 * enters EVERY plan, and those lines are deep, so one going thin-and-moving is genuinely abnormal and
 * worth a human. An individual essence is thin every single day — that is its market's normal state,
 * not a signal — and it prices only the crafts that name that one mod, so it is reported and not
 * blocked. A large SHARE of essences moving at once is different in kind: that points at the feed
 * rather than at one listing, and does block.
 */
const DEPTH = {
  /** Units traded per day below which a line has no real market behind it. */
  minUnits: 50,
  /** A 7-day move at or beyond this percent is "unstable". */
  spikePct: 50,
  /**
   * Units/day below which an ESSENCE quote is not evidence and is routed through the inference path
   * instead. Lower than `minUnits` because essences trade in tiny numbers even when real: the feed's
   * median is 2/day. Measured 2026-09-01, depth predicts stability sharply — of the 29 lines under
   * 1 unit/day, 72% had moved over 50% in a week; of the 25 above 10 units/day, 28% had. Under 1 is
   * where a "price" is one person's listing.
   */
  minEssenceUnits: 1,
  /**
   * Share of essence lines moving that means a feed-level EVENT rather than the usual churn.
   *
   * Set high on purpose. Half this market swings 50% in a normal week (measured: 51%), so a threshold
   * near that would hold every refresh forever and defeat the point of automating it. The blocker is
   * for a change in KIND — a league rollover, where essentially everything moves at once — not a
   * change in degree, which the untraded-quote filter above already handles at the source.
   */
  essenceShareToBlock: 0.9,
};

/**
 * `id -> { units, chg }` for one feed.
 *
 * A line quoting a price at zero volume yields 0 units, which is the honest answer: nothing traded.
 */
function depthIndex(feedLines) {
  return new Map(feedLines.map((l) => [l.id, {
    units: l.primaryValue ? (l.volumePrimaryValue ?? 0) / l.primaryValue : 0,
    chg: l.sparkline?.totalChange ?? 0,
  }]));
}

/** Lines in `ids` with no real market AND a big recent move. `label` names them in the report. */
function suspectsIn(index, ids, label) {
  const out = [];
  for (const [name, id] of ids) {
    const d = index.get(id);
    if (!d) continue;
    if (d.units < DEPTH.minUnits && Math.abs(d.chg) >= DEPTH.spikePct) {
      out.push({ label, name, units: d.units, chg: d.chg });
    }
  }
  return out;
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
  const curDepth = depthIndex(cur.lines);

  // Everything is quoted against the exchange's "primary" currency (divine); we store
  // exalt-equivalents, so divide through by the Exalted Orb's own primary value.
  const exalt = lines.get('exalted')?.primaryValue;
  if (!exalt) throw new Error('no Exalted Orb in the feed — cannot compute exalt-equivalents');

  const file = join(ROOT, `data/patches/${PATCH}/prices.json`);
  const prev = JSON.parse(readFileSync(file, 'utf8'));
  const prices = { ...prev.prices };

  const missing = [];
  let changed = 0;   // CURRENCY-map moves only; `totalMoved` below counts the whole sheet.
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
  const boneDepth = depthIndex(abyss.lines);
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
  const { prices: essencePrices, inferred, untraded } = priceEssences(essencesFile, essFeed.lines, exalt);
  // NEVER DELETE A PRICE YOU CANNOT REPLACE. The essence keys are rebuilt wholesale each run, which
  // is right while the feed lists essences and catastrophic the week it does not: `stepCost` reads
  // `prices.currency[key] ?? 0`, so a deleted key is a FREE essence, and a free anything dominates
  // every frontier it can reach. On a fresh league nothing is traded for the first days, and this is
  // the one part of the sheet that could go to zero rather than merely stale — the currency loop
  // already keeps the previous value by starting from `{...prev.prices}` and skipping a missing line.
  // Verified reachable before fixing: an essence sheet stripped of its keys prices a Greater Essence
  // and a Perfect Essence at 0.
  const essenceBefore = Object.fromEntries(
    Object.entries(prices).filter(([k]) => k.startsWith('essence')),
  );
  for (const key of Object.keys(prices)) if (key.startsWith('essence')) delete prices[key];
  Object.assign(prices, essencePrices);
  const restored = [];
  for (const [k, v] of Object.entries(essenceBefore)) {
    if (prices[k] === undefined) { prices[k] = v; restored.push(k); }
  }
  // `desecrationBoneFor` treats an unmapped category as armour, so the flat fallback key mirrors the
  // rib price rather than keeping the old 0.5 guess.
  if (bones.rib !== undefined) prices.desecrate = bones.rib;
  console.log(`\nessences: ${Object.keys(essencePrices).length} (level, mod) prices from ${essFeed.lines.length} live lines`);
  if (untraded) {
    console.log(`  ${untraded} of ${essFeed.lines.length} listed lines moved under ${DEPTH.minEssenceUnits} unit(s)/day and were IGNORED as quotes rather than markets.`);
  }
  if (inferred.length) {
    console.log(`  ${inferred.length} not traded, inferred from the same essence's other levels: ${inferred.slice(0, 6).join(', ')}${inferred.length > 6 ? ', …' : ''}`);
  }
  if (restored.length) {
    console.warn(`  WARNING ${restored.length} essence key(s) had no live price and KEPT their previous value rather than being dropped to 0: ${restored.slice(0, 5).join(', ')}${restored.length > 5 ? ', …' : ''}`);
  }

  // Omens come from the RITUAL feed — that is where poe.ninja files them. See priceOmens.
  const rates = { exalt: 1, chaos: lines.get('chaos').primaryValue / exalt, divine: lines.get('divine').primaryValue / exalt };
  const ritualFeed = await getJson(`${API}/exchange/current/overview?league=${encodeURIComponent(league)}&type=Ritual`);
  const { omens, fallback, thin } = priceOmens(ritualFeed.lines, prev.omenQuotes, exalt, rates);
  console.log(`\nomens (1 chaos = ${rates.chaos.toFixed(2)}ex, 1 divine = ${rates.divine.toFixed(2)}ex):`);
  console.log(`  ${Object.keys(omens).length - fallback.length} of ${Object.keys(omens).length} priced live from type=Ritual (${ritualFeed.lines.length} lines).`);
  if (thin.length) console.log(`  too thin to trust, kept the stored quote: ${thin.join(', ')}`);
  const absent = OMEN_KEYS.filter((k) => omens[k] === undefined);
  if (absent.length) console.warn(`  WARNING no price at all (neither feed nor quote): ${absent.join(', ')}`);
  for (const [id, value] of Object.entries(omens)) {
    const before = prev.omens?.[id];
    if (before !== value) console.log(`  ${id.padEnd(32)} ${String(before).padStart(9)} -> ${String(value).padEnd(9)} (x${(value / before).toFixed(1)})`);
  }
  // The quotes now only matter for omens the FEED could not price (too thin, or absent), so the
  // staleness warning is scoped to those rather than fired unconditionally. Fired unconditionally it
  // would nag about a transcription nothing reads.
  // ── Market depth: which of these prices has a market behind it? ──────────────────────────────
  const essDepth = depthIndex(essFeed.lines);
  const hard = [
    ...suspectsIn(curDepth, Object.entries(CURRENCY), 'currency'),
    ...suspectsIn(boneDepth, Object.entries(BONES), 'bone'),
  ];
  const essSus = suspectsIn(essDepth, essFeed.lines.map((l) => [l.id, l.id]), 'essence');
  // The essence BLOCK counts every line that moved, thin or not: a feed-level event moves deep lines
  // too, and it is the share that distinguishes "one listing" from "something happened".
  const essMoved = essFeed.lines.filter((l) => Math.abs(l.sparkline?.totalChange ?? 0) >= DEPTH.spikePct);
  const essShare = essFeed.lines.length ? essMoved.length / essFeed.lines.length : 0;
  const show = (x) => `  ${x.label.padEnd(8)} ${x.name.padEnd(34)} ${String(Math.round(x.units)).padStart(7)} units/day  7d ${String(x.chg).padStart(9)}%`;

  console.log(`\nmarket depth (units traded per day = volume / unit price; "thin" is under ${DEPTH.minUnits}):`);
  if (hard.length === 0) {
    console.log('  every currency and bone the sheet uses is backed by a real market.');
  } else {
    for (const x of hard.sort((a, b) => Math.abs(b.chg) - Math.abs(a.chg))) console.log(show(x));
  }
  console.log(`  essences: ${essSus.length} of ${essFeed.lines.length} lines thin AND moving; ${essMoved.length} moving at all (${(essShare * 100).toFixed(0)}%).`);
  for (const x of essSus.sort((a, b) => Math.abs(b.chg) - Math.abs(a.chg)).slice(0, 8)) console.log(show(x));
  if (essSus.length > 8) console.log(`  … and ${essSus.length - 8} more.`);

  // The gate the CI workflow reads. See DEPTH for why essences are reported rather than blocked.
  const blockers = [];
  // A LEAGUE CHANGE is the one case worth naming outright rather than inferring from price movement.
  // On the first days of a league almost nothing has traded, so every price is thin, volatile, or
  // simply absent — and the ones that DO exist are not yet the prices anyone will pay a week later.
  // The depth checks would probably catch it, but "probably" is the wrong standard for the single
  // most predictable way this sheet can go wrong, and the signal is exact and free.
  if (prev.league && prev.league !== league) {
    blockers.push(`LEAGUE CHANGED: ${prev.league} -> ${league}. Early-league prices are thin and move fast; read the whole diff before merging`);
  }
  if (restored.length > 0) {
    blockers.push(`${restored.length} essence key(s) had no live price and kept their previous value`);
  }
  if (hard.length > 0) blockers.push(`${hard.length} currency/bone price(s) thin and moving`);
  if (essShare >= DEPTH.essenceShareToBlock) {
    blockers.push(`${(essShare * 100).toFixed(0)}% of essence lines moved over ${DEPTH.spikePct}%`);
  }
  // The headline count, over the WHOLE sheet rather than the CURRENCY map. `changed` counts only the
  // orb loop, and the essence keys are deleted and rebuilt wholesale — so a run that rewrote 1,311
  // keys, 561 of them by more than 2x, was reporting "18 price(s) changed". That number is the first
  // line of a pull request this job now merges by itself, so it has to describe the whole diff.
  const movedKeys = Object.keys({ ...prev.prices, ...prices })
    .filter((k) => prev.prices[k] !== prices[k]);
  const bigMoves = movedKeys.filter((k) => {
    const a = prev.prices[k]; const b = prices[k];
    return a && b && (b / a > 2 || b / a < 0.5);
  });
  const summary = `${movedKeys.length} price key(s) changed, ${bigMoves.length} by more than 2x`
    + ` (${changed} of them in the currency table)`;

  console.log(blockers.length === 0
    ? '\nDEPTH-VERDICT: clean'
    : `\nDEPTH-VERDICT: review — ${blockers.join('; ')}`);

  const ageDays = Math.round((Date.now() - Date.parse(prev.omenQuotesAsOf)) / 86_400_000);
  const staleness = fallback.length === 0
    ? `  every omen priced live; the ${ageDays}-day-old omenQuotes were not consulted.`
    : ageDays > 30
      ? `  WARNING omenQuotes are ${ageDays} days old and ${fallback.length} omen(s) still fall back to them (${fallback.join(', ')}) — re-transcribe from ${prev.omenQuotesSource?.split(' ')[0]}`
      : `  ${fallback.length} omen(s) fell back to the ${ageDays}-day-old quotes: ${fallback.join(', ')}.`;
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
    console.log(`\n--dry-run: ${summary}; not writing.`);
    return;
  }
  writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`\nwrote ${file} — ${summary}.`);
}

main().catch((e) => { console.error(String(e)); process.exit(1); });
