# Phase-0 data extractor

One-off tool that converts the hardcoded Java mod/item data (`src/main/java/core/Item_modifiers/**`
and `core/Items/**`) into per-patch JSON, per `SPEC.md`. Output goes to `data/patches/0.5/`.

## Run

```bash
./tools/extractor/run.sh          # writes data/patches/0.5/{mods,base_items,essences}.json
./tools/extractor/run.sh <outDir> <patch> <generated>
```

It compiles only the data-only subtrees (`Modifier_class`, `Item_modifiers`, `Items` — no
external deps) plus `DataExtractor.java`, then runs the extractor. Deterministic: same source →
byte-identical output.

The extractor emits `mods.json`, `base_items.json` and `essences.json` (the last is *derived* from
the essence-sourced mods — see below). The other Phase-0 files are authored, not extracted:
`currencies.json` (catalog of the currency actions + omens that exist in `core/Currency/*.java`;
mechanics are code, ported in Phase 1), and the seed stubs `prices.json` / `weights_overrides.json`.

## Why reflection, not source parsing

The Java data classes construct the exact `Modifier` objects the golden engine uses, and every
base references the same `public static final Modifier` instances **by object identity**. The
extractor loads the compiled classes, reads each `Modifiers_*` class's static fields to build a
catalog, and maps each base's pools back to catalog ids via an `IdentityHashMap`. This is exact —
immune to formatting, comments, int-vs-decimal literals, multi-package imports, and the 4 hybrid
constructor arities that would trip a regex parser.

## Output schema

`mods.json` — flat catalog, sorted by `id`:

```jsonc
{
  "patch": "0.5", "generated": "...", "source": "...", "count": 1351,
  "mods": [{
    "id": "Wands/MAXIMUM_MANA",      // "{group}/{JAVA_FIELD}" — stable, globally unique
    "group": "Wands",                // leaf modifier package minus _Item(s)_modifiers
    "field": "MAXIMUM_MANA",         // provenance back to the Java static
    "source": "normal",              // normal | desecrated | essence | perfect_essence
    "type": "prefix",                // prefix | suffix
    "categories": ["maximum_mana"],  // primary..fourth non-empty (hybrid stat keys)
    "family": "IncreasedMana",       // family-exclusion group
    "tags": ["mana"],
    "text": "+# to maximum Mana",
    "tiers": [
      { "name": "Beryl", "ilvl": 1, "weight": 1000, "ranges": [[10,14]], "stats": [] }
      // hybrid tier: "ranges": [[15,19],[17,20]], "stats": ["increased_spell_damage","maximum_mana"]
    ]
  }]
}
```

`base_items.json` — one entry per `Item_base` subclass, sorted by `id`:

```jsonc
{
  "patch": "0.5", "generated": "...", "source": "...", "count": 41,
  "items": [{
    "id": "Wands", "name": "Wands", "category": "Wands",
    "pools": {
      "normal":     { "prefixes": ["Wands/MAXIMUM_MANA", ...], "suffixes": [...] },
      "desecrated": { "prefixes": [...], "suffixes": [...] },
      "essence":    { "prefixes": [...], "suffixes": [...] }   // includes perfect_essence mods
    }
  }]
}
```

Numbers preserve their Java type: integer ranges emit as `14`, decimal ranges as `5.0` (both are
meaningful in the data). `ilvl` is the per-tier level — the spawn ilvl gate.

## Scope / provenance

`mods.json`/`base_items.json` are a **1:1 dump of what the Java holds today (pre-0.5 refresh)**, so
a later refresh to patch 0.5.0 values can be diffed against it. The extractor does not touch
weights, add community overrides, or invent data. The `source` field in each file records this.

`essences.json` is **derived** from the essence/`perfect_essence` mods: the Java has no essence
data table — `Essence_currency.java` discovers essences at runtime by scanning mod tier names
(e.g. `"Lesser Essence of Sorcery"`, `"Perfect Essence of Sorcery"`). The extractor re-indexes those
same tiers as `essence-name -> strength(LESSER|NORMAL|GREATER|PERFECT) -> forced mod ids`. Perfect
essences legitimately force a *different* mod than the lesser tiers (verbatim from the Java).

**Findings surfaced during Phase 0:**
- Bases carry only mod pools in the Java — no base ilvl / implicit stats exist to extract. The
  ilvl gate lives per-tier (`ilvl`).
- The `core/Currency/*.java` classes are *mechanics* (code), not data tables. `currencies.json` is
  therefore an authored catalog (identity + mod source + verbatim omens), not an extraction.
- **No Chaos Orb or Orb of Alchemy exists in the Java engine yet**, though SPEC Phase 1 lists
  chaos/alch. This is a real gap to resolve during the refresh / Phase 1.
- `prices.json` / `weights_overrides.json` have no Java source at all (the Java maximizes
  probability only, with no price or community-weight data) — they are hand-authored seed stubs.
