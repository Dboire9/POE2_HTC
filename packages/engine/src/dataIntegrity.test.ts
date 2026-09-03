// Data-integrity guardrail for data/patches/<patch>. The migration's whole premise is "data lives in
// versioned JSON", so every patch import is a chance to introduce a silent data bug — exactly the kind
// Monte-Carlo can't catch (it caught D7 only via Craft of Exile). These are the invariants that must
// hold on any snapshot, plus a "no NEW violations" ratchet for known-ambiguous findings pending a call.
//
// We audit BOTH shipped snapshots: `0.5.0` (the poe2db data the app now serves — cross-checked against
// Craft of Exile, see docs/validation.md) and `0.5` (the Java-extracted golden reference the engine
// differential still anchors to). Each carries its own baseline: 0.5.0 is fully clean (empty baseline,
// so any regression fails immediately); 0.5 keeps the known-ambiguous findings from the Java data.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadPatch } from './loadPatch.ts';
import type { ItemBase, PatchData } from './types.ts';

/**
 * The RAW rows, as `mods.json` holds them — deliberately not `Mod`.
 *
 * `group` and `field` are the RePoE provenance keys. No engine code has ever read them, so as of
 * 2026-09-02 `Mod` no longer declares them and `shipMods.ts` strips them out of the browser asset.
 * They stay in the file, and checking them stays worth doing: they are what an import that silently
 * lost its join would go empty in. That makes this a check on the FILE rather than on the model, so
 * it reads the file rather than a `PatchData`, and the local type says which of the two it is.
 */
interface RawMod { readonly id: string; readonly group?: string; readonly field?: string }
const rawMods = (patch: string): readonly RawMod[] =>
  (JSON.parse(readFileSync(`data/patches/${patch}/mods.json`, 'utf8')) as { mods: RawMod[] }).mods;

const POOLS = ['normal', 'desecrated', 'essence'] as const;
const SIDES = ['prefixes', 'suffixes'] as const;

interface Baseline {
  /** `pool|modId` entries whose mod `type` disagrees with the pool side — pending a domain/CoE ruling. */
  readonly misslots: ReadonlySet<string>;
  /** `family on Base` groups that legitimately (or ambiguously) hold both a prefix and a suffix. */
  readonly mixedFamilies: ReadonlySet<string>;
}

function auditPatch(patch: string, baseline: Baseline): void {
  const data: PatchData = loadPatch(`data/patches/${patch}`);
  const bases: ItemBase[] = [...data.bases.values()];

  /** Walk every (base, pool, side, modId) entry. */
  const eachEntry = (fn: (base: ItemBase, pool: typeof POOLS[number], side: typeof SIDES[number], id: string) => void) => {
    for (const b of bases) for (const pool of POOLS) for (const side of SIDES) for (const id of b.pools[pool][side]) fn(b, pool, side, id);
  };

  describe(`data integrity [${patch}] — hard invariants (must always hold)`, () => {
    it('every pool entry resolves to a real mod (no orphan refs)', () => {
      const orphans: string[] = [];
      eachEntry((_b, _p, _s, id) => { if (!data.mods.get(id)) orphans.push(id); });
      expect(orphans).toEqual([]);
    });

    it('a families array, when present, is multi-entry and starts with the primary family', () => {
      // `family` keys the poe2db weight join ("type:family:ilvl" in apply_weights.mjs) and is the UI
      // label, so it must stay families[0]. A 1-entry array is redundant shape the emitters shouldn't
      // produce — it would mean a single-family mod is carrying two ways to say the same thing.
      const bad: string[] = [];
      for (const m of data.mods.values()) {
        if (!m.families) continue;
        if (m.families.length < 2) bad.push(`${m.id}: 1-entry families array`);
        else if (m.families[0] !== m.family) bad.push(`${m.id}: families[0]=${m.families[0]} != family=${m.family}`);
      }
      expect(bad).toEqual([]);
    });

    it('no mod id appears twice in the same pool', () => {
      const dupes: string[] = [];
      for (const b of bases) for (const pool of POOLS) for (const side of SIDES) {
        const seen = new Set<string>();
        for (const id of b.pools[pool][side]) { if (seen.has(id)) dupes.push(`${b.id} ${pool}.${side} ${id}`); seen.add(id); }
      }
      expect(dupes).toEqual([]);
    });

    it('every mod is well-formed (valid type, ≥1 tier)', () => {
      // family MAY be empty — that means "no exclusion group" and the engine treats it as such (see pool.ts).
      const bad: string[] = [];
      for (const m of data.mods.values()) {
        if (m.type !== 'prefix' && m.type !== 'suffix') bad.push(`${m.id}: bad type ${String(m.type)}`);
        if (m.tiers.length === 0) bad.push(`${m.id}: no tiers`);
      }
      expect(bad).toEqual([]);
    });

    it('the file on disk still carries its RePoE provenance (group/field set)', () => {
      const bad = rawMods(patch).filter((m) => !m.group || !m.field).map((m) => `${m.id}: empty group/field`);
      expect(bad).toEqual([]);
    });

    it('tiers ascend by ilvl and carry non-negative weights (rollable pools weight > 0)', () => {
      const bad: string[] = [];
      for (const m of data.mods.values()) {
        let prev = -1;
        for (const t of m.tiers) {
          if (t.ilvl < prev) bad.push(`${m.id}: ilvl ${t.ilvl} < previous ${prev}`);
          prev = t.ilvl;
          if (t.weight < 0) bad.push(`${m.id}: negative weight ${t.weight}`);
          // zero weight is only legitimate for essence-added mods (deterministic, not weight-rolled).
          if (t.weight === 0 && (m.source === 'normal' || m.source === 'desecrated')) bad.push(`${m.id}: zero weight on a ${m.source} tier`);
        }
      }
      expect(bad).toEqual([]);
    });
  });

  describe(`data integrity [${patch}] — ratchets (no NEW violations beyond the baseline)`, () => {
    it('a mod’s type matches the pool side it is listed in', () => {
      const current: string[] = [];
      eachEntry((_b, pool, side, id) => {
        const m = data.mods.get(id);
        const want = side === 'prefixes' ? 'prefix' : 'suffix';
        if (m && m.type !== want) current.push(`${pool}|${id}`);
      });
      const novel = [...new Set(current)].filter((k) => !baseline.misslots.has(k));
      expect(novel).toEqual([]); // any NEW type/pool mismatch fails; known ones are baselined for domain review
    });

    it('no family holds both a prefix and a suffix on the same base', () => {
      const perFamBase = new Map<string, Set<string>>();
      for (const m of data.mods.values()) {
        const key = `${m.family} on ${m.id.split('/')[0]}`;
        (perFamBase.get(key) ?? perFamBase.set(key, new Set()).get(key)!).add(m.type);
      }
      const novel = [...perFamBase].filter(([, types]) => types.size > 1).map(([k]) => k).filter((k) => !baseline.mixedFamilies.has(k));
      expect(novel).toEqual([]);
    });
  });
}

// ── 0.5.0 — the data the app SHIPS (poe2db, CoE-cross-checked). Normal + essence + desecrated +
// perfect_essence pools are populated (all built from poe2db by tools/refresh/apply_pools.mjs). The
// mixedFamilies baseline holds the legitimate cross-type/cross-source family spans: `CompanionDamage`
// (a desecrated prefix + a desecrated suffix, as in 0.5), plus families where a DESECRATED mod and a
// PERFECT_ESSENCE mod share one stat family but sit on different sides (different mods, different
// mechanics — family exclusion still holds, so this is faithful, not a bug). Everything else stays
// clean; any new occurrence fails. (The "Mark of the Abyssal Lord" EssenceAbyss mod, which poe2db lists
// as both a prefix and a suffix, is deduped to one mod in apply_pools.mjs rather than baselined.)
auditPatch('0.5.0', {
  misslots: new Set(),
  mixedFamilies: new Set([
    'CompanionDamage on Bows', 'CompanionDamage on Spears',
    'AdditionalBallistaTotem on Crossbows', 'ElementalInfusion on Staves',
    'ManaCostEfficiency on Helmets_dex', 'ManaCostEfficiency on Helmets_dex_int',
    'ManaCostEfficiency on Helmets_int', 'ManaCostEfficiency on Helmets_str',
    'ManaCostEfficiency on Helmets_str_dex', 'ManaCostEfficiency on Helmets_str_int',
    // Belts, added 2026-09-02. Both are instances of the two patterns already listed above rather
    // than anything new, which is the only reason they are baselined rather than investigated:
    //   Thorns   — `Desecrated_Thorns` (prefix) and `Desecrated_Thorns_2` (suffix), the same
    //              one-family-two-sides desecrated pair as `CompanionDamage on Bows`.
    //   FlaskChargeGeneration — three desecrated prefixes and a PERFECT_ESSENCE suffix; different
    //              mods by different mechanics, so family exclusion still holds.
    'Thorns on Belts', 'FlaskChargeGeneration on Belts',
    // Spell-element wand/staff variants, added 2026-09-03. Not a new finding: a variant inherits its
    // parent's carved and essence pools verbatim (they read the same poe2db class page), so this is
    // `ElementalInfusion on Staves` above, restated once per base id — the same way all six
    // `ManaCostEfficiency on Helmets_*` rows restate one fact about helmets. The NORMAL pools are the
    // only thing a variant narrows, and they introduce no span at all.
    'ElementalInfusion on Staves_fire', 'ElementalInfusion on Staves_cold',
    'ElementalInfusion on Staves_lightning', 'ElementalInfusion on Staves_chaos',
    'ElementalInfusion on Staves_physical',
  ]),
});

// ── 0.5 — the Java-extracted golden reference (engine differential anchor). Known-ambiguous findings
// from the Java data, allowed but ratcheted: any NEW occurrence fails. Remove one when it's resolved.
auditPatch('0.5', {
  // type ≠ the pool side it's listed in — is `type` wrong, or the pool placement? (Shield-block resolved:
  // block is a prefix, so those mods' `type` was corrected suffix→prefix. The rest are desecrated/essence.)
  misslots: new Set([
    'desecrated|Amulets/DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY',
    'desecrated|Gloves_Hybrid/DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT',
    'desecrated|Gloves_Normal/DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT',
    'desecrated|Rings/DESECRATED_INCREASED_FREEZE_BUILDUP_IF_POWER',
    'desecrated|Rings/DESECRATED_INCREASED_IGNITE_MAGNITUDE_IF_ENDURANCE',
    'desecrated|Rings/DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY',
    'desecrated|Rings/DESECRATED_INCREASED_SHOCK_MAGNITUDE_IF_FRENZY',
    'essence|Body_Armours_Hybrid/ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF',
    'essence|Helmets_Hybrid/ESSENCE_LEVEL_MINION_SKILL',
    'essence|Helmets_Normal/ESSENCE_LEVEL_MINION_SKILL',
  ]),
  // A family holding BOTH a prefix and a suffix on one base (usually a mod group is one affix type).
  mixedFamilies: new Set([
    'CompanionDamage on Bows',
    'CompanionDamage on Spears',
    'IncreaseSocketedGemLevel on Helmets_Hybrid',
    'IncreaseSocketedGemLevel on Helmets_Normal',
  ]),
});
