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

- **Never state a game impossibility you haven't traced to the code or data that enforces it.** If a craft is out of reach because the *planner doesn't search that route* — not because the game forbids it — the copy must say which. A plausible-but-wrong explanation is worse than none: it sends the player off fixing something that was never the problem. When you can't settle it, phrase it neutrally. `docs/copy-audit.md` is the standing inventory of every such claim and what enforces it.
  This cuts both ways, and the second half is the one that is easy to forget: **do not call something a planner limit either without tracing it.** Two worked examples. (1) The desecration explainer told players a legal filler→annul→desecrate route was impossible — a real game rule invented out of a search-space gap. (2) That same audit then claimed "at most one essence-only mod per craft" was a planner limit, reasoning that `perfectEssenceProbability` has no rarity gate so a Perfect essence could supply a second one. The rarity fact is true; the conclusion was wrong, because regular-essence and perfect-essence mods are **disjoint pools** (317 vs 363 ids, zero overlap) and a Perfect Essence cannot grant a regular-essence mod at all. One rule stated as a limit, one limit stated as a rule.
- **Data lives in JSON, never in source.** The hardcoded Java/C mod data is the disease being cured. All new code reads `data/patches/<patch>/`. Never "fix" a probability by editing engine logic when the weight data is the problem — change the data and the generator that produces it. (`weights_overrides.json` exists only under `data/patches/0.5/`, is an empty stub, and **nothing reads it** — `loadPatch` opens `mods.json` and `base_items.json` and nothing else. Earlier versions of this file claimed it "always wins at load time"; that mechanism was never built. Don't plan around it.)
- **Differential testing:** the ported mechanics are anchored to frozen golden fixtures (`__fixtures__/*-java.json`, originally from the Java engine) — keep those tests green. Chaos/alchemy/existing-item (no Java counterpart) are validated by Monte-Carlo + Craft of Exile. Divergence = investigate, don't average.
- **PoE2 semantics only:** no scouring/alt-spam. Chaos = remove one mod, add one. Omens constrain currency behavior. Family exclusions and ilvl gates apply everywhere.
- **Analytic first:** exact weight-pool math; Monte Carlo only for validation and intractable interactions.
- **Patch versioning:** loader rejects mixed-patch data. Data edits need a source comment in `weights_overrides.json`.
- Strict TypeScript, no `any` in engine/optimizer. Probabilities as f64 in [0,1] internally; format % at UI edge only. Prices in exalt-equivalents.

## Game rules worth pinning (each has an enforcing function)

- **Boss omens are "Weapon or Jewellery" only.** Omen of the Sovereign / Liege / Blackblooded read *"your next Weapon or Jewellery Desecration attempt…"*, so on armour a Desecration cannot be boss-targeted at all — it draws untargeted across the pool. `bossOmenAllowed` / `desecrationBoneFor` (`packages/engine/src/probability.ts`). 342 of 527 desecrated mods sit on armour bases, so this is the common case, not the edge case.
- **A Desecration needs a Rare item**, and the bone depends on the base: jawbone = weapons + quivers, rib = armour, collarbone = amulets/rings/belts. Only the **Preserved** grade applies while every desecrated mod is ilvl 65 (`prices.mjs` warns if that stops being true).
- **Annulment does not downgrade rarity.** A Rare stays Rare as you annul mods off it — which is why "roll filler, annul it, then Desecrate" is a legal route even though no planner here searches it.
- **An item carries at most ONE essence modifier — regular and perfect counted TOGETHER.** `isEssenceMod` (`probability.ts`) is the single predicate; every planner and picker counts with it. A regular essence needs a Magic item and turns it Rare; a **Perfect Essence works on a Rare and is a SWAP** — it forces its mod on while removing one existing mod uniformly at random (`1/(pf+sf)`, or `1/pf`,`1/sf` under a Sinistral/Dextral Crystallisation omen), and is gated at ilvl 72. The two grant from **disjoint pools**: 317 `source: 'essence'` mods vs 363 `perfect_essence`, zero id overlap, both inside `base.pools.essence`. So a Perfect Essence can never supply a second regular-essence mod, and can never be added on top of one either.
- **The desecrated spawn weight is an ASSUMPTION, not data.** poe2db publishes none (it reports 1 for every row); all 527 are set to `DESECRATED_ASSUMED_WEIGHT = 1000` in `tools/refresh/apply_pools.mjs`. It matters ~900x: at the literal 1 a bone produced a desecrated mod about 1 in 121,510 on a Body Armour, against ~1 in 132 at 1000. Only the UNOMENED draw uses weights, so only it inherits the assumption — the boss-omen path is count-uniform and stays exact. The UI must say which: `assumedOdds` (engineMap) → `PriceBasisNote`'s `exactOdds`. See docs/validation.md D4.
- **Fractured mods are locked**: never annulled, never chaosed, out of every removal pool.

## Prices

- `data/patches/0.5.0/prices.json` is **live poe.ninja data**, not hand-authored: currency, Abyss bones (`bones`), and 1288 per-essence `essence:<level>:<modId>` keys. The `caveat` field names exactly what is still inferred (currently 29 untraded essence variants) — `PriceBasisNote` renders it, so keep it a complete sentence.
- **Omens have no poe.ninja endpoint** — `type=Omens` returns byte-identical output to an invalid type. They're hand-transcribed into `omenQuotes` in *native units* and re-converted on every refresh so they can't silently desync.
- `pricesForBase(prices, base)` resolves the sheet once per solve for the base's bone. Don't thread a base through every step.
- **Costs are computed in exalt-equivalents and DISPLAYED on a unit ladder.** `src/lib/currency.ts` is the only place that formats one — there were four formatters and they had already drifted on rounding. `pickUnit` chooses one unit for a whole view from its largest value (a frontier is read by comparing rows, so mixing "9,800 ex" with "300 chaos" defeats it), escalating exalt → chaos → divine only above 10,000, since players think in exalts below that. Rates come from the sheet (`priceBasis().rates`), never hardcoded. The exact exalt figure always stays in a `title`.
- **The optimizer ranks plans BY cost**, so a wrong *relative* price changes the recommendation, not just the total. Omens are 20–27× the orb they modify — an earlier sheet had this inverted and made chaos-heavy routes look cheap.

## Testing

- Unit tests per currency rule on tiny synthetic pools (3–5 fake mods) with hand-computed expected probabilities.
- Optimizer self-check: 100k MC runs of recommended plan match analytic success % / cost within tolerance.
- Cross-validate vs craftofexile.com/?game=poe2; log divergences in `docs/validation.md`.
- **Mutation-check a regression test**: revert the fix and confirm the test actually fails. A tab-switch test once passed against the wrong component because `EngineLab` never unmounts — only `ItemActions` does.
- React tests that assert on a mock in the same tick as a click are flaky by construction (green on a laptop, red in CI). Use `waitFor`, and keep the deliberate small delay in the test shims that makes the race deterministic.

## Gotchas

- **Two desecrations, not one.** With a boss omen the draw is count-uniform over that boss's pool (`desecrationBossProbability` / `desecrationBossAnySideProbability`); *without* one it is weighted over the base's combined **normal ∪ desecrated** pool (`desecrationProbability`, and `desecrateAnyOutcomes` in the MDP). Armour only ever gets the second. Both planners must offer both, or a base loses the ability to desecrate entirely — that bug reported `feasible: false` for 342 of 527 desecrated mods for a day (fixed 2026-08-22).
- **Value iteration can fail to converge, and the result says so.** `MarkovResult.converged` is false when VI hit `maxIters` (100k sweeps). Because VI 0-initialises and climbs, an unconverged `expectedCost` is a strict **lower bound** — render it as "≥ x", never as a point value. This is not hypothetical: an unomened armour desecration lands one specific mod about 1 in 121,510 times, and VI's convergence rate is governed by exactly that probability, so it exhausts the cap and takes ~6s.
- **A missing price is 0, not "unavailable".** `stepCost` does `prices.currency[key] ?? 0`, so an omitted key mints a free orb. Exalt strengths and the Necromancy/Light/side omens are separately gated on *having* a price in `markovActions.ts`; the boss omens are not. In synthetic test fixtures, price every currency the policy might reach or the hand-computed arithmetic silently changes.
- The shipped `0.5.0` data is cross-checked exact vs Craft of Exile (Wands/Amulets/Rings/Body Armour/Quivers); re-validate with the `scripts/coe-*` harness when 1.0 lands. `data/patches/<patch>/` versioning is what makes a re-refresh safe.
- `0.5` (Java-extracted) and `0.5.0` (poe2db) use DIFFERENT mod-id schemes (`MAXIMUM_MANA` vs `IncreasedMana`); the app + facade tests are id-agnostic (they list from the loaded data), but hardcoded ids in a test must match whichever patch that test loads.
- Java-retirement doc debt was audited 2026-08-21 — `docs/{API_EXAMPLES,DEVELOPMENT,CONTRIBUTING,ABOUT,data-layer}.md` all lead with the "backend retired, pure client-side TS" note, and the remaining Java mentions (the frozen `__fixtures__` anchor, the `0.5` snapshot, past-tense history in ABOUT) are deliberate and accurate. Don't "fix" those. The audit predated the Electron removal; `DOWNLOAD.md` was rewritten separately on 2026-08-23 and now says there is nothing to download.
- **`vercel.json` holds the cache headers, and JSON has no comments.** `/static/*` is content-hashed by Vite so it is cached `immutable` for a year; `/` is not hashed (it is how a new deploy is discovered) so it is `max-age=0, must-revalidate`. Getting those backwards either re-downloads 3.1 MB every visit or pins users to a stale build. Vercel's schema **rejects unknown properties** — a `"//"` key added to explain each rule failed the build outright ("headers[0] should NOT have additional property //"), so the headers never shipped. Explanations go here; `src/lib/deployConfig.test.ts` enforces the schema locally so the next mistake fails in the suite rather than in a deploy.
- **The Search-effort control must be rendered on every tab that obeys it.** `ItemActions` passed
  `limitsFor(effort)` to the solver while the picker lived inside EngineLab's lab-mode branch, so a
  from-item craft ran under a setting its own tab could not show. It is `SearchEffort.tsx` now, with
  two call sites.
- **A progress report is not free — it is a `postMessage` plus a React re-render.** Value iteration
  reported once per sweep, so a non-converging craft fired ~100,001 messages to describe at most 1001
  distinct permille values; in the browser that turned a 24-second solve into a ten-minute wait while
  node measured 24 seconds. Solvers must emit only when the number the UI would *display* changes
  (`markovFromItem`'s `lastPermille`), or stride like `optimizePareto`'s `PROGRESS_REPORTS`. The
  worker adapter deliberately adds no buffering, so this stays the solver's property.
- **An unconverged MDP's policy GRAPH is not just imprecise — it may not reach the target at all.**
  The graph is the state closure under whatever policy VI had when it stopped. At the Standard effort
  a 5-target craft yielded 14 states spanning depths 7→4 with the goal (depth 0) absent. `converged`
  covers the *number*; `PolicyGraph` separately checks `nodes.some(isGoal)` and refuses to draw a dead
  end as "the optimal policy". Thorough reaches the goal on the same craft. See docs/validation.md.
- **The restart cost model is fiction for a held item.** `planExpectedCost` restarts to the STARTING
  item free on every miss — fair for a white base, false for the Rare in your stash. Since an Annul is
  158.7 ex against an Exalt's 1 ex, it ranks "bury the Annuls behind a 0.1% gate" ~65x cheapest and
  hands back a plan no player would run. `FrontierView`'s `freeRestart={false}` makes a from-item
  panel lead with the likeliest route instead. Do NOT "fix" this in `planExpectedCost` — the
  from-white planner depends on the assumption being true there.
- **Rarity on the Item tab describes the item you HOLD, not the item you want.** The from-item planner
  used to throw "supports Rare items (use the currency check for Magic)" on a Magic start — turning the
  commonest starting point in the game into an error, and inviting the player to misdescribe their item
  to get past it. A Magic item is now opened with a **Regal**, which converts to Rare while adding one
  mod; it is the only add available there, since Exalt and Chaos both score 0 on a Magic item and
  `baseTransforms` emits no `augment`. The MDP still models Rare only and says so in `reason`, which
  `ItemActions` now renders rather than dropping the panel in silence.
- **The policy route says "most likely lands X", never "add X".** The MDP chooses the ORB, never the
  outcome — an Exalt is a slam. `StepChanges` (`src/lib/policyPath.ts`) names the mod on the step's
  highest-probability edge, which is the edge the route follows by construction; phrasing it as an
  instruction would tell the player to do something the game gives them no way to do. The odds render
  beside it, which is what makes the wording self-consistent.
- **The from-item planner never varies orb strength** (`baseTransforms` sets no `tier`), so it reports
  `currencyDepth: 'base-only'`. It used to report `full`, rendered as "tried every orb strength" — a
  false claim that also hid why its costs sit so far above the MDP's, which does use Greater/Perfect
  Exalts.
- **Once the MDP has answered, the step routes collapse.** Measured on a five-target craft they read
  ~5,000,000x above the true cost, and orb strength (worth 1,116x) would still leave ~68,000x — the
  remainder is the model, not a gap. `trueCostAnswered` in `ItemActions` is the single predicate for
  both that collapse and the "No true expected cost" card; keep it single, or the panel can end up
  hiding the routes AND explaining their absence at the same time.
- Sentry + analytics are wired in frontend; keep functional.
- Direct pushes to `main` are sanctioned despite branch protection; `remote: Bypassed rule violations` is expected output, not an error. `main` and `revival` are kept in sync.
