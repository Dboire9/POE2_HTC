#!/usr/bin/env node
// Build the six RUNE POOLS — the modifiers a "Can roll <X> modifiers" rune unlocks — and merge them
// into data/patches/0.5.0/{mods,base_items}.json as `base.pools.rune[<runeId>]`.
//
// WHERE THEY COME FROM. Each pool is a real tag in the game's own data: `destruction`, `chronomancy`,
// `marksman`, `decay`, `berserking` and `soul` are all in RePoE's tags.json, and 128 modifiers carry
// one of them in `spawn_weights` alongside `default: 0` — so they can never roll normally, and do roll
// once the rune puts its tag on the item. That is the whole mechanic, and it means this needs no new
// exclusion logic: `resolveWeight(mod, [...baseTags, poolTag])` answers it with the same first-match
// rule refresh.mjs uses for the normal pool.
//
// THE RESTRICTIONS ARE ENCODED NEGATIVELY, which is the part worth reading twice. A restricted mod
// lists the bases it must NOT roll on at weight 0 BEFORE its pool tag at weight 1. So
// `DestructionInfluenceManaModifierEffect` names sword, axe, mace, spear, claw, dagger, flail,
// crossbow, warstaff and talisman at 0: a Quarterstaff matches `warstaff` first and is blocked, while a
// Bow matches nothing until `destruction` and rolls. Measured: 9 of 9 destruction mods on Bows,
// Sceptres, Staves and Wands, 8 of 9 on Crossbows, Quarterstaves, Spears and both Mace classes.
//
// The Soul pool does the same by armour attribute, and it self-checks: each of its 12 restricted mods
// lands on EXACTLY ONE body-armour variant, and on the one its own name describes —
// `SoulInfluenceManaDefencesHybridArmourEvasion` on str_dex, `...HybridEnergyShield` on int. Read the
// rule backwards and that mod would appear on the five variants it actually excludes.
//
// THE WEIGHT IS ASSUMED, AND THE APP SAYS SO. RePoE publishes 1 for every one of these — a placeholder,
// exactly as poe2db does for the desecrated pool — so a literal reading would make a rune-pool mod
// essentially unrollable beside normal weights in the thousands. `RUNE_POOL_ASSUMED_WEIGHT` puts one on
// roughly the footing of an ordinary modifier. A judgement call (the maintainer's, 2026-09-15), not data:
// `assumedOdds` carries it to `PriceBasisNote`, the same route the desecrated weight takes.
//
// Usage: npx tsx tools/refresh/apply_runes.mjs   (tsx, because the rune table lives in runes.ts and is
//        not worth a second copy here — which rune unlocks which pool is the app's own rule)
// Reads:  data/patches/0.5.0/{mods,base_items}.json + tools/refresh/cache/repoe_{mods,mods_by_base}.json
// Writes: data/patches/0.5.0/{mods,base_items}.json ; prints a coverage summary.

import { shownRange } from './displayUnits.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_CLASS, attributeTag, pickVariant, resolveWeight, cleanText } from './variants.mjs';
import { templateFixedRoll } from './modText.mjs';
import { RUNES } from '../../packages/engine/src/runes.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'data/patches/0.5.0');
const CACHE = join(ROOT, 'tools/refresh/cache');

/**
 * The spawn weight every rune-pool modifier is given.
 *
 * NOT OBSERVED. RePoE reports 1 for all 128 of them, which is the same placeholder the desecrated pool
 * carries and cannot be taken literally: against normal weights of several thousand it would make a
 * rune's own modifiers the rarest thing on the item, which cannot be right for a pool whose entire
 * purpose is to be rolled. 1000 puts one on roughly the footing of an ordinary modifier.
 *
 * Exported so the shipped snapshot can be asserted against it — a silent refresh back to RePoE's 1
 * would quietly make every rune craft look impossible.
 */
export const RUNE_POOL_ASSUMED_WEIGHT = 1000;

const repoeMods = JSON.parse(readFileSync(join(CACHE, 'repoe_mods.json'), 'utf8'));
const repoeByBase = JSON.parse(readFileSync(join(CACHE, 'repoe_mods_by_base.json'), 'utf8'));
const modsFile = JSON.parse(readFileSync(join(OUT, 'mods.json'), 'utf8'));
const basesFile = JSON.parse(readFileSync(join(OUT, 'base_items.json'), 'utf8'));

const warnings = [];
const warn = (m) => { if (!warnings.includes(m)) warnings.push(m); };

// Idempotent, keyed on the marker rather than on the source: a rune-pool mod IS an ordinary rollable
// modifier once its rune is in, so `source` stays 'normal' and `rune` is what identifies it here.
modsFile.mods = modsFile.mods.filter((m) => m.rune === undefined);
for (const base of basesFile.items) delete base.pools.rune;
const modsById = new Map(modsFile.mods.map((m) => [m.id, m]));

/** Every game modifier belonging to one pool tag. `domain: 'item'` keeps out flask/jewel/map mods. */
const poolMods = (tag) => Object.entries(repoeMods).filter(([, m]) =>
  m.domain === 'item' && (m.spawn_weights || []).some((sw) => sw.tag === tag && sw.weight > 0));

const POOL_RUNES = RUNES.filter((r) => r.effect.kind === 'pool');
let added = 0; let tierRows = 0;
const perRune = new Map();
/** Ids a collision cost us. Counted and reported as a FAILURE, not warned about: a dropped modifier
 *  is a pool that quietly offers less than the game does, and the first version of this script lost
 *  six that way behind a warning line. */
const dropped = [];

for (const rune of POOL_RUNES) {
  const tag = rune.effect.tag;
  const candidates = poolMods(tag);
  if (candidates.length === 0) { warn(`no modifiers carry the "${tag}" tag — is the RePoE cache stale?`); continue; }
  let mods = 0; let bases = 0;

  for (const base of basesFile.items) {
    // `categories: []` means every equipment base; a pool rune always names its own.
    if (rune.categories.length > 0 && !rune.categories.includes(base.category)) continue;
    const cls = CATEGORY_CLASS[base.category];
    if (!cls) { warn(`no class mapping for category ${base.category} (base ${base.id})`); continue; }
    const picked = pickVariant(repoeByBase, cls, attributeTag(base.id, cls));
    if (!picked) { warn(`no canonical variant for ${base.id} (class ${cls})`); continue; }
    // The rune's tag joins the base's own — that IS the mechanic, and it is why the negative
    // exclusions above resolve without a line of special-case code.
    const baseTags = [...picked.sig.split(','), tag];

    // Group the tier rows into our mods: one per (side, exclusion group), tiers ascending by ilvl —
    // the same shape `buildMod` produces for the normal pool.
    const groups = new Map();
    for (const [gameId, rm] of candidates) {
      if (!(resolveWeight(rm, baseTags) > 0)) continue;
      const type = rm.generation_type;
      if (type !== 'prefix' && type !== 'suffix') { warn(`${gameId}: bad generation_type ${type}`); continue; }
      const family = (rm.groups && rm.groups[0]) || gameId;
      const key = `${type}:${family}`;
      if (!groups.has(key)) groups.set(key, { type, family, rows: [] });
      groups.get(key).rows.push([gameId, rm]);
    }
    if (groups.size === 0) continue;
    bases++;
    base.pools.rune ??= {};
    const pool = (base.pools.rune[rune.id] ??= { prefixes: [], suffixes: [] });

    for (const g of groups.values()) {
      g.rows.sort((a, b) => (a[1].required_level ?? 0) - (b[1].required_level ?? 0));
      const tiers = g.rows.map(([gameId, rm]) => ({
        name: rm.name || gameId,
        ilvl: rm.required_level ?? 0,
        weight: RUNE_POOL_ASSUMED_WEIGHT,
        ranges: (rm.stats || []).map((s) => shownRange(s.id, [s.min, s.max])),
        stats: (rm.stats || []).map((s) => s.id),
      }));
      const rep = g.rows[0][1];
      // Namespaced by POOL, the way apply_pools.mjs namespaces `Essence_` and `Desecrated_`. Gloves
      // take two pool runes, and `Rune_<family>` alone collided on them: Kolr's Hunt's Mark-effect
      // PREFIX and Katla's Gloom's curse-magnitude SUFFIX are different modifiers that share RePoE's
      // `CurseEffectiveness` group — correctly, since a Mark is a curse. The first spelling dropped
      // six real modifiers with only a warning to show for it.
      const id = `${base.id}/Rune_${tag}_${g.family}`;
      if (modsById.has(id)) { dropped.push(id); continue; }
      const mod = {
        id, group: `Rune_${g.family}`, field: `Rune_${g.family}`,
        // An ordinary ROLLABLE modifier, once the rune is socketed — an Exalt adds it like any other,
        // so every planner must treat it as normal. What marks it is `rune`, the way `alloy` marks a
        // Perfect Essence mod whose engine source is likewise unchanged.
        source: 'normal', rune: rune.id,
        type: g.type, categories: (rep.stats || []).map((s) => s.id), family: g.family,
        ...(rep.groups && rep.groups.length > 1 ? { families: rep.groups } : {}),
        tags: rep.implicit_tags || [],
        text: templateFixedRoll(cleanText(rep.text), tiers),
        tiers,
      };
      modsById.set(id, mod); modsFile.mods.push(mod);
      pool[g.type === 'prefix' ? 'prefixes' : 'suffixes'].push(id);
      mods++; added++; tierRows += tiers.length;
    }
  }
  perRune.set(rune.id, { name: rune.name, tag, bases, mods });
}

modsFile.mods.sort((a, b) => a.id.localeCompare(b.id));
modsFile.count = modsFile.mods.length;
const NOTE = ' RUNE POOLS (the "Can roll <X> modifiers" runes) are built from RePoE tags by '
  + `apply_runes.mjs and live in base.pools.rune[<runeId>]. THEIR WEIGHTS ARE AN ASSUMPTION: RePoE `
  + `publishes 1 for every one of them, so all are set to ${RUNE_POOL_ASSUMED_WEIGHT} — see `
  + 'docs/validation.md. They are NOT observed data.';
modsFile.source = modsFile.source.includes('RUNE POOLS') ? modsFile.source : modsFile.source + NOTE;
basesFile.items.sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(join(OUT, 'mods.json'), JSON.stringify(modsFile, null, 2) + '\n');
writeFileSync(join(OUT, 'base_items.json'), JSON.stringify(basesFile, null, 2) + '\n');

console.log('apply_runes.mjs — rune pools merged into 0.5.0');
for (const [id, r] of perRune) {
  console.log(`  ${id.padEnd(20)} ${r.tag.padEnd(12)} ${String(r.bases).padStart(2)} bases  ${String(r.mods).padStart(3)} mods`);
}
console.log(`  ${added} mods over ${tierRows} tier rows, each tier at the assumed weight ${RUNE_POOL_ASSUMED_WEIGHT}`);
console.log(`  total mods now: ${modsFile.count}`);
if (dropped.length > 0) {
  console.error(`\n  FAILED: ${dropped.length} modifier(s) dropped on an id collision — the pools are incomplete:`);
  for (const id of dropped.slice(0, 10)) console.error(`    ${id}`);
  process.exit(1);
}
if (warnings.length) {
  console.log(`\n  WARNINGS (${warnings.length}):`);
  for (const w of warnings.slice(0, 20)) console.log('    - ' + w);
}
