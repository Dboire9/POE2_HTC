# Data layer (migration)

Phase 0 moved the engine's mod/item data out of hardcoded Java classes into per-patch JSON under
`data/patches/<patch>/`, and gave the Java engine a JSON-backed load path so both the old and new
engines can share one data source during the migration (SPEC Phase 0).

## Files (`data/patches/0.5/`)

| File | How produced | Notes |
|------|--------------|-------|
| `mods.json` | extracted 1:1 from `core/Item_modifiers/**` | 1351 mods, 5493 tiers |
| `base_items.json` | extracted 1:1 from `core/Items/**` | 41 bases; pools are mod-id lists |
| `essences.json` | derived from essence-sourced mods | essence → strength → forced mod ids |
| `currencies.json` | authored catalog of `core/Currency/*.java` | identity + omens verbatim; mechanics stay in code |
| `prices.json` | hand-authored seed stub | exalt-equivalent prices for Phase-2 cost mode |
| `weights_overrides.json` | hand-authored seed stub | community weight corrections; win over `mods.json` |

All stamped `{"patch","generated","source"}`. Current data is a **pre-0.5-refresh 1:1 snapshot of the
Java** — values are not yet verified against real patch 0.5.0. The loader rejects mixed patches.

## Two patch datasets

- **`data/patches/0.5/`** — the **Java baseline**: a 1:1 extraction of the hardcoded Java
  (~0.2/0.3-era values). Used as the differential/round-trip reference; the golden path.
- **`data/patches/0.5.0/`** — the **refreshed authoritative dataset** for patch 0.5.0:
  - *structure* (41 bases, 933 normal mods, 6167 tiers — tiers/ilvls/ranges/pools) from the
    RePoE-fork PoE2 dump (client 4.5.4.3);
  - *spawn weights* from **poe2db community data** (`DropChance`), joined onto the structure by
    (base, type, family, ilvl) — 100% of normal tiers filled. Game-file weights are useless
    (0/1 only); poe2db carries the community-verified weights CLAUDE.md calls for.
  - **NORMAL pools only.** essence/desecrated pools are deferred: poe2db's essence/desecrated
    weights are *not* plain spawn weights (essence forces a mod; desecrated mods are mixed into
    the normal pool by the desecration mechanic), so they belong to the Phase-1 engine mechanics.
  - Loads through the Java engine via `USE_JSON_DATA=1 PATCH_DIR=data/patches/0.5.0`.

## Regenerate

```bash
./tools/extractor/run.sh          # 0.5 baseline: mods.json, base_items.json, essences.json
./tools/refresh/run.sh            # 0.5.0: RePoE structure -> poe2db weights -> diff report
```
The refresh pipeline is `refresh.mjs` (RePoE structure) → `apply_weights.mjs` (poe2db weights) →
`diff.mjs` (`docs/refresh-0.5.0-diff.md`). RePoE dumps and poe2db pages are cached under
`tools/refresh/cache/` (gitignored). `currencies.json` / `prices.json` / `weights_overrides.json`
are edited by hand.

## Java load path (`core/data/`)

- `PatchData` — parses the JSON (Gson tree API; preserves integer-vs-decimal ranges).
- `ModifierFactory` — builds `Modifier` objects identical to the hardcoded statics.
- `JsonItemBase` / `JsonItemRepository` — `Item_base` instances whose pools come from JSON, keyed by
  base id (the hardcoded simple class name, e.g. `Wands`, `Body_Armours_str`).
- `ItemBaseProvider` — the seam `ServerMain` calls to resolve a base. **Off by default.**

### Using the JSON data source

```bash
USE_JSON_DATA=1 PATCH_DIR=data/patches/0.5 mvn -q compile exec:java   # or run the built jar
```
Without `USE_JSON_DATA`, the server uses the hardcoded classes exactly as before (golden reference
untouched — CLAUDE.md forbids deleting the Java until Phase 3 validation passes).

## Round-trip gate

```bash
./tools/roundtrip/run.sh
```
`core.data.DataRoundTripCheck` compares, field-by-field, every hardcoded mod and every base pool
against the JSON-built objects. It currently reports **IDENTICAL** (1351 mods, 41 bases), which is
what makes flipping the engine to JSON safe. An HTTP smoke test confirms `/api/modifiers` returns
byte-identical payloads in both modes.
