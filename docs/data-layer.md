# Data layer

All game data lives in versioned JSON under `data/patches/<patch>/`, never in source code. The
pure-TypeScript engine (`packages/engine`) reads it directly — there is no database and no backend.

> **History:** this split started as SPEC Phase 0, which moved the engine's mod/item data out of
> hardcoded Java classes into per-patch JSON so the old Java engine and the new TS engine could share
> one source during the migration. The Java engine has since been retired; the JSON data is now the
> single source of truth, and the loader lives in `packages/engine` (`loadPatch.ts` / `indexPatch.ts`).

## Two patch datasets

- **`data/patches/0.5.0/`** — the **dataset the app ships**. Structure (bases, mods, tiers, ilvls,
  ranges, pools) from the RePoE-fork PoE2 dump; **spawn weights from poe2db community data**, joined
  onto the structure by `(base, type, family, ilvl)`. Cross-checked *exact* against Craft of Exile for
  Wands / Amulets / Rings / Body Armour / Quivers (see [validation.md](validation.md), "External
  cross-check, round 2"). Game-file weights are useless (0/1 only); poe2db carries the
  community-verified weights the project relies on. **Normal pools only so far** — essence/desecrated
  weights aren't plain spawn weights and belong to engine mechanics, so those pools are deferred.
- **`data/patches/0.5/`** — the **Java-era snapshot**: a 1:1 extraction of the old hardcoded Java
  (~0.2/0.3-era values). It is **stale vs the live game** and is kept for exactly one reason: it's the
  engine's **differential anchor**. The frozen golden fixtures in
  `packages/engine/src/__fixtures__/*-java.json` were generated from this data by the old Java engine;
  the differential tests replay them (no live Java) to prove the TS port matches. Don't ship it.

The two snapshots use **different mod-id schemes** — `0.5.0` is CamelCase (`IncreasedMana`), `0.5` is
SCREAMING_SNAKE (`MAXIMUM_MANA`). The app and facade tests are id-agnostic (they list ids from the
loaded data); a test that hardcodes ids must match whichever patch it loads.

The loader **rejects mixed-patch data** — every file in a patch dir carries a `patch` stamp and they
must agree.

## Files (per patch dir)

| File | How produced | Notes |
|------|--------------|-------|
| `mods.json` | RePoE structure + poe2db weights (0.5.0); Java extraction (0.5) | every mod: `text`, `family`, `type`, `source`, tiers |
| `base_items.json` | same pipeline | each base's prefix/suffix pools as mod-id lists |
| `essences.json` | derived from essence-sourced mods | essence → strength → forced mod ids |
| `currencies.json` | authored catalog | currency identity + omens; mechanics stay in engine code |
| `prices.json` | hand-authored | exalt-equivalent prices for the cost model |
| `weights_overrides.json` | hand-authored, community-verified | **always wins over `mods.json`** |

Each file is stamped `{"patch","generated","source"}`.

## Rules

- **`weights_overrides.json` beats base weights.** If a probability is wrong, fix the weight data (or
  add an override with a source comment) — never "fix" it by editing engine logic.
- **Data edits are surgical raw-text edits**, not a JSON re-stringify — that preserves integer-vs-decimal
  ranges (e.g. `[15, 20]` staying integers, not `15.0`). Every edit carries a source comment in
  `weights_overrides.json`.
- Patch versioning is what makes a re-refresh safe: when 1.0 lands, drop a new `data/patches/1.0/`
  and re-validate with the `scripts/coe-*` harness rather than mutating an existing snapshot.

## Refresh the shipped data

```bash
npm run update-data           # tools/refresh/ : RePoE structure -> poe2db weights -> diff report
```

The refresh pipeline is `refresh.mjs` (RePoE structure) → `apply_weights.mjs` (poe2db weights) →
`diff.mjs` (writes `docs/refresh-0.5.0-diff.md`). RePoE dumps and poe2db pages are cached under
`tools/refresh/cache/` (gitignored). `currencies.json` / `prices.json` / `weights_overrides.json` are
edited by hand.

> `tools/extractor/` (the original Java-source extractor that produced the `0.5` snapshot) and the old
> Java round-trip gate are historical — they targeted the retired Java engine and are no longer part
> of the live workflow.

## Data-integrity guardrail

`packages/engine/src/dataIntegrity.test.ts` audits every shipped patch on each test run: no orphan
pool refs, no duplicate ids, well-formed mods (group/field/type/≥1 tier), tiers ascending by ilvl with
non-negative (rollable ⇒ positive) weights, mod `type` matching the pool side, and no family holding
both a prefix and a suffix on one base. `0.5.0` runs against an **empty baseline** (fully clean — any
regression fails immediately); `0.5` keeps its known-ambiguous Java-era findings as a ratchet.
