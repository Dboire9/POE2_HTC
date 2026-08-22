# POE2_HTC — Path of Exile 2 crafting optimizer

React web app: user inputs target item (base + mods + tiers), gets optimal crafting sequences with per-step and overall success %. **Migration complete: the Java backend has been retired — the app now runs a pure client-side TS engine.** Electron was removed too (2026-08-22): the app is web-only, and the packaged desktop build could not coexist with the solver Web Worker (Chromium blocks module Workers from `file://`).

> This file is the canonical project instructions and is version-controlled here, in the repo. A stub at `../CLAUDE.md` points at it so sessions started from the parent directory still load instructions — edit **this** copy, not the stub.

## Current architecture

- `src/` — React 19 + Vite + Tailwind frontend. The only view is the Engine Lab (`src/features/engine/`), driven by the browser facade `src/lib/engine.ts`. Two modes: **Lab** (craft from a white base) and **Item** (craft from an item you already hold).
- `packages/engine` (pure TS, no I/O/DOM) + `packages/optimizer` — the crafting engine + optimizer the app runs on.
- **Every solve runs in a Web Worker.** `src/lib/solve.ts` (pure: request → result, the only part worth testing) → `engine.worker.ts` (thin adapter) → `engineClient.ts` (main-thread client; cancel = `terminate()` + respawn, cheap because rebuilding patch data is ~10ms). The main thread keeps its own copy of the data for the mod lists it filters synchronously while you type — don't "fix" that duplication by making listing async.
- **Two planners, one step vocabulary.** The linear/Pareto planner (`optimize.ts`, `fromItem.ts`, `alternatives.ts`) and the MDP (`markovFromItem.ts`, `markovActions.ts`) both reduce a step to a `PricedStep` (`cost.ts`) for pricing. Keep that single mapping — duplicating step→price is how the D8 desecration mispricing survived, with the linear planner charging for a boss omen the MDP did not.
- **Currency exclusions.** `CurrencyPolicy` + `allowsStep` (`packages/optimizer/src/cost.ts`) let a player exclude currency they don't own; the UI model is `src/lib/currencyPrefs.ts`. Exclusions **prune** the search rather than filter results (63ms → 4ms on a 6-mod craft), so an excluded currency can never reach the frontier.
- **Workspace persistence + sharing.** `src/lib/workspace.ts` — a `useSyncExternalStore` module store with `useField` / `useMode`, plus a base64url URL codec for share links. Use `useOnChange` (never a bare `useEffect` with a dep array) for "reset when X changes": a plain effect fires on mount and wipes restored state.
- `data/patches/<patch>/*.json` — versioned data. **The app ships `0.5.0`** (poe2db, cross-checked exact vs Craft of Exile). `0.5` (Java-extracted) is retained ONLY as the engine differential anchor (see below).
- **Java is gone** (`src/main/java/`, `pom.xml` removed). Its validation legacy survives as frozen golden fixtures: `packages/engine/src/__fixtures__/*-java.json`, read by the differential tests (no live Java). Full history is on the `revival` branch.
- `C` branch: abandoned partial C/WASM engine — reference only, do not continue.

## Commands

- `npm run dev` / `npm test` (vitest) / `npm run build` / `npm run preview` — static site into `dist/` (the whole deliverable)
- **Three type-checks, not one.** `npm run type-check` (root) plus `npm run type-check:engine` and `npm run type-check:optimizer`. The package tsconfigs enable `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`, which the root one does not — the package checks were red for days while root stayed green. CI runs all three; so should you.
- `npm run test:engine` / `npm run test:optimizer` — scoped test runs.
- `npm run update-data` — refresh `data/patches/0.5.0` from poe2db (`tools/refresh/`)
- `npm run update-prices` — refresh `data/patches/0.5.0/prices.json` from poe.ninja (`tools/refresh/prices.mjs`)

## Critical rules

- **Never state a game impossibility you haven't traced to the code or data that enforces it.** If a craft is out of reach because the *planner doesn't search that route* — not because the game forbids it — the copy must say which. This has bitten twice: the desecration explainer told players a legal filler→annul→desecrate route was impossible, and `optimize.ts` still throws "at most one essence-only mod per craft" though `perfectEssenceProbability` has no rarity gate. A plausible-but-wrong explanation is worse than none: it sends the player off fixing something that was never the problem. When you can't settle it, phrase it neutrally.
- **Data lives in JSON, never in source.** The hardcoded Java/C mod data is the disease being cured. All new code reads `data/patches/<patch>/`. `weights_overrides.json` (community-verified) always beats base weights — never "fix" a probability by editing engine logic when weight data is the problem.
- **Differential testing:** the ported mechanics are anchored to frozen golden fixtures (`__fixtures__/*-java.json`, originally from the Java engine) — keep those tests green. Chaos/alchemy/existing-item (no Java counterpart) are validated by Monte-Carlo + Craft of Exile. Divergence = investigate, don't average.
- **PoE2 semantics only:** no scouring/alt-spam. Chaos = remove one mod, add one. Omens constrain currency behavior. Family exclusions and ilvl gates apply everywhere.
- **Analytic first:** exact weight-pool math; Monte Carlo only for validation and intractable interactions.
- **Patch versioning:** loader rejects mixed-patch data. Data edits need a source comment in `weights_overrides.json`.
- Strict TypeScript, no `any` in engine/optimizer. Probabilities as f64 in [0,1] internally; format % at UI edge only. Prices in exalt-equivalents.

## Game rules worth pinning (each has an enforcing function)

- **Boss omens are "Weapon or Jewellery" only.** Omen of the Sovereign / Liege / Blackblooded read *"your next Weapon or Jewellery Desecration attempt…"*, so on armour a Desecration cannot be boss-targeted at all — it draws untargeted across the pool. `bossOmenAllowed` / `desecrationBoneFor` (`packages/engine/src/probability.ts`). 342 of 527 desecrated mods sit on armour bases, so this is the common case, not the edge case.
- **A Desecration needs a Rare item**, and the bone depends on the base: jawbone = weapons + quivers, rib = armour, collarbone = amulets/rings/belts. Only the **Preserved** grade applies while every desecrated mod is ilvl 65 (`prices.mjs` warns if that stops being true).
- **Annulment does not downgrade rarity.** A Rare stays Rare as you annul mods off it — which is why "roll filler, annul it, then Desecrate" is a legal route even though no planner here searches it.
- **A regular essence needs a Magic item and turns it Rare; a Perfect essence works on a Rare** (`perfectEssenceProbability` has no rarity gate).
- **Fractured mods are locked**: never annulled, never chaosed, out of every removal pool.

## Prices

- `data/patches/0.5.0/prices.json` is **live poe.ninja data**, not hand-authored: currency, Abyss bones (`bones`), and 1288 per-essence `essence:<level>:<modId>` keys. The `caveat` field names exactly what is still inferred (currently 29 untraded essence variants) — `PriceBasisNote` renders it, so keep it a complete sentence.
- **Omens have no poe.ninja endpoint** — `type=Omens` returns byte-identical output to an invalid type. They're hand-transcribed into `omenQuotes` in *native units* and re-converted on every refresh so they can't silently desync.
- `pricesForBase(prices, base)` resolves the sheet once per solve for the base's bone. Don't thread a base through every step.
- **The optimizer ranks plans BY cost**, so a wrong *relative* price changes the recommendation, not just the total. Omens are 20–27× the orb they modify — an earlier sheet had this inverted and made chaos-heavy routes look cheap.

## Testing

- Unit tests per currency rule on tiny synthetic pools (3–5 fake mods) with hand-computed expected probabilities.
- Optimizer self-check: 100k MC runs of recommended plan match analytic success % / cost within tolerance.
- Cross-validate vs craftofexile.com/?game=poe2; log divergences in `docs/validation.md`.
- **Mutation-check a regression test**: revert the fix and confirm the test actually fails. A tab-switch test once passed against the wrong component because `EngineLab` never unmounts — only `ItemActions` does.
- React tests that assert on a mock in the same tick as a click are flaky by construction (green on a laptop, red in CI). Use `waitFor`, and keep the deliberate small delay in the test shims that makes the race deterministic.

## Gotchas

- **Two desecrations, not one.** With a boss omen the draw is count-uniform over that boss's pool (`desecrationBossProbability` / `desecrationBossAnySideProbability`); *without* one it is weighted over the base's combined **normal ∪ desecrated** pool (`desecrationProbability`, and `desecrateAnyOutcomes` in the MDP). Armour only ever gets the second. Both planners must offer both, or a base loses the ability to desecrate entirely — that bug reported `feasible: false` for 342 of 527 desecrated mods for a day (fixed 2026-08-22).
- **A missing price is 0, not "unavailable".** `stepCost` does `prices.currency[key] ?? 0`, so an omitted key mints a free orb. Exalt strengths and the Necromancy/Light/side omens are separately gated on *having* a price in `markovActions.ts`; the boss omens are not. In synthetic test fixtures, price every currency the policy might reach or the hand-computed arithmetic silently changes.
- **`docs/DOWNLOAD.md` is stale** — it still tells users to download an AppImage from GitHub Releases. Electron was removed 2026-08-22 and no such artifact exists.
- The shipped `0.5.0` data is cross-checked exact vs Craft of Exile (Wands/Amulets/Rings/Body Armour/Quivers); re-validate with the `scripts/coe-*` harness when 1.0 lands. `data/patches/<patch>/` versioning is what makes a re-refresh safe.
- `0.5` (Java-extracted) and `0.5.0` (poe2db) use DIFFERENT mod-id schemes (`MAXIMUM_MANA` vs `IncreasedMana`); the app + facade tests are id-agnostic (they list from the loaded data), but hardcoded ids in a test must match whichever patch that test loads.
- Java-retirement doc debt was audited 2026-08-21 — `docs/{API_EXAMPLES,DEVELOPMENT,CONTRIBUTING,ABOUT,data-layer}.md` all lead with the "backend retired, pure client-side TS" note, and the remaining Java mentions (the frozen `__fixtures__` anchor, the `0.5` snapshot, past-tense history in ABOUT) are deliberate and accurate. Don't "fix" those. Note the audit predates the Electron removal, so it says nothing about `DOWNLOAD.md`.
- Sentry + analytics are wired in frontend; keep functional.
- Direct pushes to `main` are sanctioned despite branch protection; `remote: Bypassed rule violations` is expected output, not an error. `main` and `revival` are kept in sync.
