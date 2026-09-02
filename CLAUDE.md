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
- **Java is gone** (`src/main/java/`, `pom.xml` removed). Its validation legacy survives as frozen golden fixtures: `packages/engine/src/__fixtures__/*-java.json`, read by the differential tests (no live Java). Its full history is in `main`'s own history, reachable by walking back past the 1.0 release — the `revival` branch that used to be named as its home was deleted at 1.0, having become byte-identical to `main`.
- `C` branch: abandoned partial C/WASM engine — reference only, do not continue.

## Commands

- `npm run dev` / `npm test` (vitest) / `npm run build` / `npm run preview` — static site into `dist/` (the whole deliverable)
- **Three type-checks, not one.** `npm run type-check` (root) plus `npm run type-check:engine` and `npm run type-check:optimizer`. The package tsconfigs enable `exactOptionalPropertyTypes`, which the root one does not — the package checks were red for days while root stayed green. CI runs all three; so should you. (`noUncheckedIndexedAccess` used to be the second difference. The root config gained it on 2026-09-01, at a cost of ZERO errors: `src` had always written `arr[0]!` as though the flag were on. ESLint is what surfaced that, by reporting 157 "unnecessary" assertions.)
- **`npm run lint`** (ESLint, flat config, added 2026-09-01) — in CI, and in the ship skill's chain. `packages/**` run `strictTypeChecked`, `src/**` `recommendedTypeChecked` plus the React Hooks rules; tests relax the `unsafe-*` family and `no-unnecessary-condition`, because a test asserting a fact the type already guarantees is the test doing its job (`dataIntegrity.test.ts` checks that `mods.json` on disk matches what `Mod` claims). **Never clear a finding with a blanket `--fix`.** On the first run it deleted the parameter defaults from `encoderFor`'s returned `StateEncoder` (`markovSymmetry.ts`) — `keepClass` calls that with four arguments, so keys would have become `…:undefined:undefined` and quietly stopped matching `encodeState`, disabling symmetry reduction instead of failing — and stripped `mod!` from an engine test the engine's own tsconfig needs. Prefer a targeted `eslint-disable-next-line` carrying its reason over relaxing a rule for a whole tree.
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
- **Belts ship as ONE base, and that is the data's answer, not a shortcut** (2026-09-02). All 20 of RePoE's belt bases carry a **byte-identical** craftable pool — 166 mods, the same `mod → tier → ilvl` map across all three tag groups (`belt,default`, `runeforged,belt,default`, `not_for_sale,demigods,belt,default`). They differ only in `drop_level` and in their IMPLICIT, and an implicit is fixed on the base rather than rolled, so no currency this app models can touch it. Twenty picker rows would be twenty identical crafts, four of them literally named "Runemastered Heavy Belt". This is exactly how Amulets and Rings already worked; only the armour slots carry several bases, because there the Str/Dex/Int split genuinely changes the pool.
  **THREE maps had to learn the category, not two.** `refresh.mjs`'s `CATEGORY_CLASS` (→ the `repoeByBase` key), `apply_pools.mjs`'s (→ a poe2db page name), **and `apply_weights.mjs`'s** (→ the same page name, a separate copy). Missing the third is silent in the worst way: the pipeline completes, the base appears, and only the line `bases with NO poe2db page: Belts->undefined` in the middle of the log says every belt weight defaulted. Note the `item_class` in `repoe_base_items.json` is the SINGULAR `Belt`; neither map uses that field, and `repoeByBase` is keyed `Belts`.
  Adding a base does NOT mean editing `data/patches/0.5/base_items.json`. That file is the frozen Java differential anchor, and `refresh.mjs` reads only `id`/`name`/`category` off it — the pools are rebuilt from RePoE every run — so it is a ROSTER. `EXTRA_BASES` in `refresh.mjs` extends the roster with bases Java never had, leaving the anchor untouched. `pickVariant` then chose `[belt,default]` unaided, because `runeforged`, `not_for_sale` and `demigods` were already in `SPECIALIZER`.
  **Charms and Jewels stay out.** Charms exist in the dump (13 bases, one shared pool, 4 prefix + 5 suffix families) and look trivially addable, but they are tagged `utility_flask,flask,default` — flasks — and this model assumes the 3-prefix/3-suffix rare (`perSideCap` is by RARITY, with no category axis). Whether that cap holds for a charm is untraced, so adding them would be asserting a mechanic. Jewels have their own affix model besides.
- **A Desecration needs a Rare item**, and the bone depends on the base: jawbone = weapons + quivers, rib = armour, collarbone = amulets/rings/belts. **`BONE_BY_CATEGORY` said "Amulet, Ring or Belt" in its comment for weeks while having no `Belts` entry**, and the fallthrough is `?? 'rib'` — so the day belts landed a belt would have been charged the armour bone (0.41ex against the collarbone's 4.69ex, ~11x under) and, because `bossOmenAllowed` is defined as "not rib", silently refused the boss omens the game does allow on it. A comment is not a mapping; grep the map, not the prose. Only the **Preserved** grade applies while every desecrated mod is ilvl 65 (`prices.mjs` warns if that stops being true).
- **Annulment does not downgrade rarity.** A Rare stays Rare as you annul mods off it — which is why "roll filler, annul it, then Desecrate" is a legal route even though no planner here searches it.
- **An item carries at most ONE essence modifier — regular and perfect counted TOGETHER.** `isEssenceMod` (`probability.ts`) is the single predicate; every planner and picker counts with it. A regular essence needs a Magic item and turns it Rare; a **Perfect Essence works on a Rare and is a SWAP** — it forces its mod on while removing one existing mod uniformly at random (`1/(pf+sf)`, or `1/pf`,`1/sf` under a Sinistral/Dextral Crystallisation omen), and is gated at ilvl 72. The two grant from **disjoint pools**: 317 `source: 'essence'` mods vs 363 `perfect_essence`, zero id overlap, both inside `base.pools.essence`. So a Perfect Essence can never supply a second regular-essence mod, and can never be added on top of one either.
  **The MDP models BOTH grades as of 2026-08-28.** A regular Essence is an action on the Magic rung
  beside the Regal: it forces its mod and converts Magic → Rare, removing nothing, at P=1 — the mirror
  of `essenceForcedProbability`, condition for condition. Its side-room check is against the RARE cap,
  because the essence converts as it adds and the slot it needs is a slot on the item it makes; the
  Magic cap would refuse a legal essence on a 1-suffix Magic item. An essence mod's TIERS ARE ITS
  LEVELS (Lesser ilvl 15 → Essence 30 → Greater 60, ascending like any other mod's), so
  `mod.tiers[minTierIndex]` is at once the tier the player gets, the essence they buy, and the
  `essence:<level>:<modId>` key that prices it. **Which level to buy is `cheapestEssenceLevel`
  (cost.ts), called by BOTH planners** — one function on purpose, because pricing one step two ways is
  how the D8 desecration bug survived. It was `clamp(minTierIndex)` in both until 2026-08-29, which
  agreed on the wrong number: every level at or above the wanted one satisfies the target AND rolls
  better, and **the sheet is not monotone in level for 250 of 302 fully-priced essences (83%)**. Across
  all 317 essence targets in 0.5.0 the quoted price falls **8,595.8ex → 646.6ex (13.3x)**, with
  `Bows/Essence_FireDamage` alone going 364.2ex → 0.3ex. Priced through `stepCost`, not the raw key, so
  a level whose per-mod entry is missing is compared at its `essence_<lvl>` fallback and the choice can
  never disagree with the bill.
  From a held RARE the action is unreachable and `markovFromItem` says so by name, because a regular
  Essence needs a Magic item — that refusal replaced a blanket `applicable: false` in the facade which
  was also refusing the from-white case the model handles.
  **The cap counts the item you already HOLD, and the two one-per-item rules reach that fact by opposite routes.** A held CARVED mod is in the state: `classifyStart` flags it (from `PlacedMod.desecrated`, or simply from its pool), `hasDesecrated` empties both bone builders, and `push` drops an action with an empty distribution — so a bone is *structurally* absent from every state holding one, not merely priced out. A held ESSENCE mod is NOT in the state: it lands in `jp`/`js`, a bare count with no marker, so nothing can tell it from ordinary junk. Measured, four states played a Perfect Essence with junk still on the item. `markovFromItem` therefore REFUSES (naming the held mod) when an essence target is asked and the item carries an essence modifier that isn't that target — and only then, since with no essence target `perfectTargets` is empty and the held mod is ordinary junk the model handles correctly. Fixing it properly needs a state axis of its own (the desecration flag means "a bone placed this" and cannot be reused), and it is unreachable from the UI — the item builder offers only rollable and desecrated mods, and since 2026-08-28 the share-link decoder drops an essence-source mod claimed as HELD to match (a target keeps working; only the held slot is refused). The linear planner has no such gap: it plans a fixed sequence over concrete mods, so it annuls the held mod first — `annul → annul → perfect-essence`.
- **A Desecration OFFERS three modifiers and you keep one** (`DESECRATION_OFFER_COUNT`,
  `packages/engine/src/probability.ts`), and you cannot decline — all three bad means you still take
  one. Confirmed by the user 2026-08-24. This is applied where a bone is SPENT (`plan.ts`'s desecrate
  step; `offer` on the MDP's desecrate actions), never inside the three probability primitives:
  `desecrationBossProbability` / `desecrationBossAnySideProbability` are faithful ports of Java's
  `DesProbability` pinned by a differential fixture, and that fixture is the oracle for the per-draw
  number. Worth ~3x — a specific carved mod on a Body Armour goes 0.74% → 2.21% — and it drops the
  chance of being *forced* to burn the carved slot from 6.7% to 0.03%, because that now needs all
  three offers to be unwanted carved mods.
- **An offer cannot be folded into a probability distribution ahead of time.** Which of the three a
  player keeps is whichever leads to the cheapest state, so a Desecration's value is
  `E[min over the offer]`, which depends on V. `markovFromItem`'s `valueOf` evaluates it inside value
  iteration with the tail-sum identity `P(keep k) = T_k^m − T_(k+1)^m` over outcomes sorted by V
  ascending (`T_k` = tail sum, `m` = offers). At `m = 1` that collapses to `p_k`, so it is one formula,
  not a special case. `realizedDist` applies the same weights to the GRAPH's edges: publishing the
  per-draw odds there would put a 50% on an arrow that is really 12.5%, and the Monte-Carlo validator
  — which samples those edges — would then "confirm" a cost the solver never computed.
- **A Desecration FLAGS the mod it placed, and the flag follows the MOD, not the pool.** A bone marks
  whatever it applied — an ordinary mod exactly as much as a desecrated-pool one. An item carries at
  most one flagged mod; while it does, the Well of Souls will not touch the item; removing or rerolling
  that mod frees it. `McState.flagged` (`markovState.ts`) is the single axis: `none`, junk-on-a-side, or
  target-*i*. It replaced `desJunk`, which could only describe a desecrated-POOL mod and also charged it
  a slot OUTSIDE `jp`/`js` — a phantom extra affix. Once a mod is on the item its pool decides nothing,
  so the state no longer records it.
- **A bone is one resource, not a repeatable orb, and the model plays it that way.** Asked for three
  ordinary mods on a held Wand the policy opens with an **Exalt** and holds the bone back, which is how
  the mechanic is actually played. Measured worth on a held Rare: Wands 4,073.8ex → 2,493.7ex (−39%),
  Body Armour 2,967.6ex → 1,396.4ex (−53%), amulets/rings unchanged (the collarbone is 7.69ex and the
  price gate closes). `desecratable` in `markovFromItem.ts` opens on
  `bonePrice < DESECRATION_OFFER_COUNT * exaltPrice` — a NECESSARY condition — and also checks the
  currency policy, since with Desecration excluded the flag axis is pure cost (worth 6x on one craft).
  The axis costs ~5x the solve time when desecration IS in play; see TODO 3.
- **Reachability means ALMOST SURELY, not "with some chance"** (`prob1` in `markovFromItem.ts`), and is
  computed BEFORE value iteration, per phase, with dead states pinned at Infinity. The weak reading let
  states with no route to the goal be backed up forever — E grew 11.4M → 113.6M ex as the sweep cap rose
  10x, and `converged` was being poisoned by states the answer never depended on.
- **The goal is indifferent to axes it does not care about.** `goalKeys` is a SET: a finished item is
  finished whether or not a Desecration placed one of its mods. Keying it to one flag value made every
  craft that ended on a bone unable to reach the goal, leaving value iteration no terminal to work back
  from. They are folded to one node for display (`canonical`), or the graph draws several identical
  "✓ target" boxes.
- **The desecrated spawn weight is MEASURED, not published.** poe2db reports a literal 1 for every row, so it cannot be read off the data. As of 2026-08-24 all 527 are set to `DESECRATED_ASSUMED_WEIGHT = 2500` in `tools/refresh/apply_pools.mjs`, from an in-game sample: 40 bones on an empty Rare `Helmets_dex_int` showing 120 modifiers, **22 of them carved**, inverted by `scripts/desecrate-weight.mts` (ML 2,512; range 1,995–3,981). Count MODIFIERS, not offers — reading that 22 as "offers holding one" overstates the weight by ~50% and did, once. It matters enormously — at poe2db's literal 1 a bone produced a desecrated mod about 1 in 121,510 on a Body Armour. Only the UNOMENED draw uses weights, so only it depends on this — the boss-omen path is count-uniform and stays exact. The UI must still say which, since one base is not every base: `assumedOdds` (engineMap) → `PriceBasisNote`'s `exactOdds`. See docs/validation.md D4.
- **The Omen of Whittling is a CHAOS omen, and it removes the lowest LEVEL modifier** — traced to poe2db 2026-09-02: *"your next Chaos Orb will remove the lowest level modifier"*, internal id `OmenOnChaosLowestLevelMod`. TODO 12 specified it as an Orb of Annulment omen removing the lowest TIER, and both halves were wrong; building it that way would have modelled a mechanic the game does not have. **Level, not tier**, matters because tier numbers are per-mod and not comparable across mods (a T5 of a five-tier mod is its worst roll, a T5 of a ten-tier mod is mid-range) — item level is the one scale the whole item shares, and every tier already carries its `ilvl`. `lowestLevelMods` / `chaosRemovalProbability` (`probability.ts`) model it; a FRACTURED mod is excluded from the removal pool, so it is never whittled AND its exclusion can move which mod counts as lowest. The TIE rule is untraced and modelled by RULING: uniform among the tied (50/50 on two, 1/k on k), chosen by the user 2026-09-02 and matching every other pick-among-equals here. That is a decision to model it so, not an observation — it stays flagged in docs/validation.md.
  **It is LIVE as of 2026-09-02**, priced at ~4,700ex from the Ritual feed. `withOmen` (`levers.ts`) still gates the lever on the omen having a price — `stepCost` charges 0 for a missing key, so ungated it would come back FREE and dominate every chaos step — and `levers.test.ts` pins both sides of that gate by deleting the key from a copy of the sheet.
  **NOTHING is excluded by default, and a pinned Whittling toggle was built and REMOVED** the same day — do not rebuild either. The optimizer already declines an omen that does not pay, since it ranks BY cost, and a Whittling route lands on the frontier as its own ROW beside the plain one, so the comparison a button would give you is already on screen. And once the button went the default could not stay: a currency silently excluded with no visible control is hidden state — the app would refuse a route and nothing on screen would say why, which is `docs/copy-audit.md`'s failure in a new place. Default-off and a visible control are a pair; either both or neither. A player who owns none still ticks the row in "Currency I don't have", like any other currency they lack.
  **A chaos step's `constrainTo` is NOT the Erasure omen.** Sinistral/Dextral Erasure constrain what a Chaos Orb REMOVES; that field tunes what it ADDS. Nothing emits it, so it is inert — do not "fix" it by pricing it as Erasure.
- **`addMod` places a mid-plan add at the step's `minTierIndex`, not tier 0** (2026-09-02). It was tier 0 — the LOWEST ilvl a mod has — regardless of what the step asked for, which was invisible while nothing read a walked item's tiers: `tierName` fed the UI and the MDP's `classifyStart`, which reads the item a player HOLDS. Whittling ended that, since a placed tier is now an input to a probability, and with every add pinned at tier 0 everything a plan added would have tied for "lowest level". `minTierIndex` means "this tier or better", so placing at exactly it is the worst tier that satisfies the target — the conservative reading, since a lower level makes a mod MORE likely to be whittled. A Desecration keeps tier 0: a bone offers what it offers and the step carries no tier target.
- **The Omen of Greater Exaltation makes an Exalted Orb add TWO modifiers**, and that is why it is a
  STEP and not a lever (traced to poe2db 2026-09-02, `OmenOnExaltAddTwoMods`). `levers.ts` may only
  offer choices that leave the same item behind; this leaves a different one, so it is chosen where
  the ORDERINGS are (`doubleExalt.ts` fuses adjacent Exalt pairs in a skeleton) rather than per step.
  `levers.test.ts` is what enforces that boundary — it would go red if someone made it a field.
  **Its price key is `exalt`, not its own currency name.** It is spent ON an Exalted Orb, so
  `currencyKey` maps it to `exalt`/`exalt_greater`/`exalt_perfect` and `stepOmenIds` adds the omen as
  a surcharge. Keying it as `greater-exalt` would have made it FREE (no such key on any sheet) and
  made "I don't own Exalted Orbs" stop excluding it, since `allowsStep` reads the same key.
  **`currencyKey` is exported for exactly this reason**: `leverOptions` used to rebuild the strength
  key inline as `` `${step.currency}_${tier}` ``, which agreed with `currencyKey` only by coincidence
  and would have gated this step on a nonexistent `greater-exalt_perfect`, silently dropping every
  strength above base. One step, one key — the D8 rule again.
  **A Greater or Perfect Exalted Orb CAN carry it** — user ruling 2026-09-02, not the item text,
  which says "your next Exalted Orb" while a Greater Exalted Orb is its own BaseType
  (`CurrencyAddModToRare2`). That ruling is what gives the step a strength axis. The **one-open-slot**
  case is deliberately unmodelled and scores 0; an explicit guard for it was written and DELETED
  because no mutation could distinguish it from the recursion's own answer.
  **From WHITE the route needs five targets to exist at all** (the add chain is
  transmute→augment→regal→exalt…, so no adjacent Exalt pair below five). Measured worth: a 6-target
  T1 Wand craft 4.04e9 → 2.35e9 ex (−42%); from a held item it does not lower the cheapest cost but
  makes a SURER route exist (1.997% → 2.266% per attempt). Costs ~2x the step planner's time, on a
  planner whose worst measured craft is 105 ms.
  **The MDP was given this action and it was REVERTED** (2026-09-02, the §5d pattern): offered 1,519
  times per solve, 1.08–1.42x slower, and every expected cost identical to eight figures across six
  crafts with the policy never playing it. The reason is structural, so do not rebuild it without a
  price change. Its distribution IS "exalt, then exalt" in that model, so
  `Q(GE@T) − Q(exalt@T) = c_omen − c_orb(T) + E[Q(mid, exalt@T) − V(mid)]`, and that last term — the
  regret of being FORCED to exalt at strength T again — is ≥ 0. The discount is genuine (a flat
  surcharge means one omened Greater Exalt is 11.118 ex against 17.574 for two, and Perfect 1,025 vs
  2,046), but after one Greater Exalt the policy usually wants a cheap base Exalt or a Chaos instead.
  **The MDP re-decides after every draw; this omen is a promise not to.** The step planners want it for
  exactly the mirror reason: a fixed sequence has no flexibility to give up, so the regret term is zero
  there by construction. One mechanic, worth 42% to one model and nothing to the other, and each
  model's shape explains its own answer.
- **`alchemyProbability` and `greaterExaltProbability` share one recursion** (`multiDrawProbability`),
  parameterised by draw count, starting item and ilvl floor. The rule it adds over the alchemy version:
  **a target landing at too LOW a tier is a failure, not a retry** — its family is spent, so the craft
  can never reach the tier asked for. A needed mod advances only on its at-or-above-tier weight while
  occupying its family on its FULL weight. Collapsing those two is a mutation the tests catch.
- **Fractured mods are locked**: never annulled, never chaosed, out of every removal pool.

## Prices

- **The sheet refreshes ITSELF, daily.** `.github/workflows/refresh-prices.yml` runs the script at 06:00 UTC, and **merges its own PR** when the data passes a market-depth check; a failed check leaves the PR open, titled `REVIEW NEEDED`. Depth is **units traded per day = `volumePrimaryValue / primaryValue`**, never the raw volume field — that is denominated in divine, so it ranks liquidity backwards (measured 2026-09-01: raw volume calls plain Transmute the 4th-thinnest currency at 0.42 and the Mirror the deepest market at 48,400; by units it is Transmute 2,548/day and Mirror **7**). Currency and bones are deep and hold the PR if one goes thin-and-moving; essences are not a market at all (median **2** units/day, 72 of 78 lines under 50) and are handled at the SOURCE instead — `priceEssences` ignores any quote under 1 unit/day and infers that price from the same essence's other levels, which is why `caveat` now names ~51 inferred variants rather than ~21. Without that filter the sheet took `essence-of-command` at **+16,567% in a week on zero units traded**.
- **A test that asserts an EXACT cost must read `loadFrozenPrices()`**, not the shipped sheet — `packages/optimizer/src/frozenPrices.ts`, a snapshot of the 2026-08-22 sheet that is never refreshed. Those tests pin the MODEL (lattice reduction is cost-invariant to 15 figures; the unit ladder's output string; how tight the budget bracket is), and a daily refresh made 8 of them fail across 3 files with nothing wrong. The fixture is deliberately the sheet those numbers were DERIVED from: re-freezing a newer one and updating the expectations to match would re-baseline them to whatever came out. Everything else keeps reading what ships — especially `priceResolution.test.ts` and `costConsistency.test.ts`, which ARE the refresh workflow's guard and would be pointless frozen.
- `data/patches/0.5.0/prices.json` is **live poe.ninja data**, not hand-authored: currency, Abyss bones (`bones`), and 1288 per-essence `essence:<level>:<modId>` keys. The `caveat` field names exactly what is still inferred (currently 29 untraded essence variants) — `PriceBasisNote` renders it, so keep it a complete sentence.
- **Omens ARE served by poe.ninja, under `type=Ritual`** (found 2026-09-02). The long-standing note here said they had no endpoint, and it was half right: `type=Omens` really does return byte-identical output to an invalid type, and the Omens *page* really is client-rendered with no embedded payload. But omens are RITUAL content in PoE2, and that feed carries 36 of them — every key this sheet uses, plus Whittling — with volume and a sparkline like any other line. Only the name was wrong; the conclusion "hand-transcribe them" stood for months on one untried guess. Independently confirmed against poe2db (11.7 divine vs 11.4 for Whittling). This mattered more than a chore: omens are an ADDITIVE surcharge 20-27x the orb they modify, so a stale omen:orb ratio changes which plans are recommended — measured against the 11-day-old transcription the live feed moved Greater Exaltation **0.20x** and Sinistral Necromancy 1.77x.
  `omenQuotes` survives as a FALLBACK, still in native units and re-converted, for any omen the feed cannot price. The same units/day depth gate applies: 2 of 14 fall back today (the Blackblooded at 23/day, the Sovereign at 7), and the staleness warning is scoped to those rather than fired unconditionally.
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

- **A slot's alternatives are made cheap TWO different ways, and they are not interchangeable.**
  `markovSymmetry.ts` decides which. **Same-family** alternatives (`increased Fire / Cold / Lightning`
  are one family) can never be on the item together and behave identically once any of them lands, so
  they MERGE into one `McTarget` holding several `mods` — one bit, weights summed on arrival. Exact
  regardless of their weights or tier floors, because individual weights stop mattering the moment the
  family is occupied. **Cross-family** ones (`Gain % as Extra Cold` / `… Lightning`) must keep separate
  bits — both can land, and each takes a different mod out of the pool — so only the LABELLING goes: a
  canonicalising `StateEncoder` picks one spelling of `(Cold present, Lightning blocked)` and the
  lattice carries only that. Measured on a 4-slot Wands craft from white, interleaved, 4 reps each:
  same-family 3-way **5.19s → 2.04s** (`256.959615 exact` in all 8 runs), cross-family 3-way
  **13.91s → 4.33s** (`217.990477 exact` in all 8). The merge is unconditional; the quotient is
  MEASURED against the data every solve (weights at every `REACHABLE_FLOORS` floor, pool exclusion,
  boss-pool counts, no family shared with another position) and silently does not apply when the data
  says so. **Asking different tiers of two cross-family alternatives switches it off** — that is the
  one cause a player controls, and `MIXED_TIER_NOTE` says so on the group row.
- **The solver never sees two spellings of one move, and that fold is where 23-31% of its work went.**
  `pusher` in `markovActions.ts` keeps only the cheapest action per outcome distribution, because with
  the distribution fixed a value `(cost + Σ p·V)/(1 − pStay)` is monotone in cost. Four causes, all
  measured on real 0.5.0 data: a side omen where the other side is already full (`addOutcomes` uses
  `constrainTo` ONLY to close the other side, so the two are the same computation at 20-27x the price);
  a Greater/Perfect strength whose floor excludes nothing; a boss whose pool is the whole legal pool; an
  Omen of Light where the flagged mod is the only thing an Annulment could take. Interleaved over six
  crafts and 60 runs: **1.18-1.51x**, with every craft returning exactly ONE `(cost, bound)` fold on and
  off. It reproduces the same POLICY, not merely the same cost — a cheaper duplicate already won the
  argmin, and equal costs keep the first, which is the order `bestAction`'s strict `<` resolved in.
  **`isRestart` must stay in the signature**: an Annulment emptying a one-mod item lands on the start
  state with P=1 just as a restart does, and phase A skips restarts — folding them leaves phase A with
  no action there at all. `offer` must stay too, though no craft can exercise it: only a Desecration has
  `offer > 1` and only a Desecration flags what it placed, so the collision cannot arise. The test is on
  that invariant, not on the unreachable guard.
- **Merging DEFEATS three checks if its key is wrong, and the checks run afterwards.** "All prefixes or
  all suffixes", "one mod per family across slots" and "at most one essence modifier" all count
  POSITIONS, so anything the merge swallowed reports as one and sails through. That is why `mergeKey`
  carries side, source and lock state, and refuses family-less and perfect-essence mods — and why each
  of those is reachable in the shipped data rather than theoretical: ten families span both sides on
  one base (`Bows/Desecrated_CompanionDamage` is a prefix, `…_2` a suffix), and six bases carry two or
  more perfect-essence mods of one family. Mutation testing found four of these guards untested.
- **Two desecrations, not one.** With a boss omen the draw is count-uniform over that boss's pool (`desecrationBossProbability` / `desecrationBossAnySideProbability`); *without* one it is weighted over the base's combined **normal ∪ desecrated** pool (`desecrationProbability`, and `desecrateAnyOutcomes` in the MDP). Armour only ever gets the second. Both planners must offer both, or a base loses the ability to desecrate entirely — that bug reported `feasible: false` for 342 of 527 desecrated mods for a day (fixed 2026-08-22).
- **The VI stopping rule is scale-aware, so a test that asserts many decimals must ask for precision.**
  `tolerance` defaults to a thousandth of the craft's cheapest action, not a flat 1e-9 — these values
  span ten orders of magnitude between crafts. Worth a measured 1.77x, at a relative error of ~1e-3 that
  is ONE-DIRECTIONAL: the sequence stops above its limit, so a number overstates a craft's cost and
  never flatters it. The hand-computed tests pass `EXACT = { tolerance: 1e-12 }`; they pin the model's
  arithmetic, not the stopping rule. Note the residual is NOT the error — a descending sequence stopping
  at Δ < tol still sits `tol/(1−r)` above its limit, and r is near 1 here.
- **Measure these solves interleaved, and take medians.** Single runs have a **~40% spread**: unchanged
  code has been timed at 103.8s and 145.6s for identical work. Two opposite conclusions about sweep
  ordering were drawn from single runs before the method was fixed — see docs/validation.md, which also
  records the ordering itself as a measured NEGATIVE result (most transitions are bricks, so information
  does not flow purely backward from the goal, and goal-first ordering buys nothing).
- **Value iteration can fail to converge, and the result says so.** `MarkovResult.converged` is false when VI hit `maxIters` (100k sweeps). Because VI 0-initialises and climbs, an unconverged `expectedCost` is a strict **lower bound** — render it as "≥ x", never as a point value. This is not hypothetical: an unomened armour desecration lands one specific mod about 1 in 121,510 times, and VI's convergence rate is governed by exactly that probability, so it exhausts the cap and takes ~6s.
- **An MDP invariant test can pass by ACCIDENT of the policy's route.** `never finishes on an item holding two carved mods` (markovEssenceDesecrate.test.ts) iterates `r.nodes` — the states the POLICY visits — not the lattice. On 2026-09-02 a change that merely removed some free actions re-routed the policy and a two-carved goal state (`3:0:0:0:0:2`) appeared, having been in the lattice all along. So that test guards a path, not a state space. Before trusting it, or any `r.nodes` sweep, ask whether the property is enforced by `goalKeys` / the action space or merely unvisited. See TODO 12d.
- **A missing price is 0, not "unavailable".** `stepCost` does `prices.currency[key] ?? 0`, so an omitted key mints a free orb. Exalt strengths and the Necromancy/Light/side omens are separately gated on *having* a price in `markovActions.ts`; the boss omens are not. In synthetic test fixtures, price every currency the policy might reach or the hand-computed arithmetic silently changes.
- The shipped `0.5.0` data is cross-checked exact vs Craft of Exile (Wands/Amulets/Rings/Body Armour/Quivers); re-validate with the `scripts/coe-*` harness when 1.0 lands. `data/patches/<patch>/` versioning is what makes a re-refresh safe.
- `0.5` (Java-extracted) and `0.5.0` (poe2db) use DIFFERENT mod-id schemes (`MAXIMUM_MANA` vs `IncreasedMana`); the app + facade tests are id-agnostic (they list from the loaded data), but hardcoded ids in a test must match whichever patch that test loads.
- Java-retirement doc debt was audited 2026-08-21 — `docs/{API_EXAMPLES,DEVELOPMENT,CONTRIBUTING,ABOUT,data-layer}.md` all lead with the "backend retired, pure client-side TS" note, and the remaining Java mentions (the frozen `__fixtures__` anchor, the `0.5` snapshot, past-tense history in ABOUT) are deliberate and accurate. Don't "fix" those. The audit predated the Electron removal; `DOWNLOAD.md` was rewritten separately on 2026-08-23 and now says there is nothing to download.
- **The repo's copy of the patch data and the browser's copy are two different jobs** (2026-09-02).
  On disk `data/patches/<patch>/*.json` is the RECORD: pretty-printed so a refresh diffs readably,
  and complete down to `group`/`field`/`categories`/`tiers[].stats`, which **no code reads**. Over
  the wire it is a download, where all of that is cost. `shipMods.ts` projects a parsed `mods.json`
  onto exactly the fields `Mod`/`Tier` declare and minifies it; `shipPatchData` (vite.config.ts)
  applies that to the emitted asset and minifies the other two. Measured at the live site's own
  compression (**brotli q3 / lgwin 19**, which reproduces poe2htc.com's byte counts exactly — not the
  q11 default, which flatters every option ~3x): mods 137,701 → 65,013 wire bytes, `JSON.parse`
  6.15 ms → 3.32 ms, patch data total −46.3%, first load −26.6%.
  **The type is what makes it safe, not the plugin.** `Mod` used to say it "mirrors the JSON exactly"
  while declaring four fields nothing read; now it declares only what the app reads, so a stripped
  field is a compile error in dev as well as in a build. `shipModsFile` is typed `ModsFile ->
  ModsFile` **with `: Mod` / `: Tier` annotations on its two `.map` callbacks** — contextual typing
  through `.map` alone does NOT run excess-property checking, so without them only a MISSING field
  was caught and an added one shipped silently. Both directions are mutation-verified.
  **TODO 13 asked for a solver/display SPLIT and it was the wrong shape twice over.** `tiers[].ranges`
  is read by `valueRatio` (alternatives.ts) and `text` by `engineMap`, which runs INSIDE the worker —
  so the "fields the Worker never reads" were read by it. And two files cost 74,015 wire bytes against
  one file's 65,013, because splitting duplicates the id column and gives brotli two smaller corpora.
  Don't re-propose it. `tiers[].stats` stays in the FILE as the named route to cross-family similarity.
- **Rollup fixes an asset's content hash BEFORE `generateBundle`, so rewriting content there ships new
  bytes at the old URL.** The first working strip emitted 988 kB as `mods-BfEpI_vg.json` — byte-for-byte
  the name the live site serves the 3.1 MB file under. Harmless that day; a silent correctness bug the
  day someone adds a field to `Mod` and the projection without the DATA changing, because
  `immutable, max-age=31536000` then pins every returning browser to an asset missing it. `assetFileNames`
  is therefore a FUNCTION that hashes the bytes the build will write, sharing one `shippedJson` helper
  with the rewrite so a name can never describe bytes nobody emitted. Both output configs (main build
  and worker build) must pass the same function, or the two stop resolving to one file and the data
  ships twice. Mutation-checked: dropping `tags` from the projection moves `mods-z68ZDNnb` → `mods-FDp1al5J`.
- **`vercel.json` holds the cache headers, and JSON has no comments.** `/static/*` is content-hashed by Vite so it is cached `immutable` for a year; `/` is not hashed (it is how a new deploy is discovered) so it is `max-age=0, must-revalidate`. Getting those backwards either re-downloads the whole patch payload every visit or pins users to a stale build. Vercel's schema **rejects unknown properties** — a `"//"` key added to explain each rule failed the build outright ("headers[0] should NOT have additional property //"), so the headers never shipped. Explanations go here; `src/lib/deployConfig.test.ts` enforces the schema locally so the next mistake fails in the suite rather than in a deploy.
- **A share link is untrusted input, and `parsed as Wire` is a cast, not a check.** `?s=` is the app's
  only attack surface — a public URL any stranger can craft. Two failure modes, and they need
  different defences. A bad SHAPE throws inside the decoder, so `decodeWorkspace`'s try/catch converts
  it to the documented `null` (before that guard existed, one malformed link white-screened the app).
  A wrong TYPE does not throw there at all: it decodes cleanly and escapes into app state, where
  `budget.trim()` throws on Compute. `clampLevel` fixed `lv` and missed `bg`/`bc` two lines below it,
  which is why the decoder now reads `WireIn` — the same shape with the escaping leaves typed
  `unknown`, so the compiler refuses to pass one through unvalidated. `Wire` stays strict; it is the
  encoder's contract. Add a field to the wire and it needs a `clamp*`, or it will not build.
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
  to get past it. A Magic item is opened with a **Regal** (converts to Rare while adding one mod) or an
  **Augmentation** (fills the second slot and leaves it Magic), and the openers cover
  augment-then-regal too. The Augmentation is a real cost↔probability trade, not a cheaper Regal: on a
  Magic item holding one prefix it must land a SUFFIX, so it draws from one side's pool where a Regal
  draws from both — likelier, and DEARER for it (0.2699 against 0.1977). TODO 4 claimed the opposite
  ("an Augment would be cheaper") and its pinning test used a two-PREFIX target, which a Magic item
  cannot hold at all — so on that craft the Regal is a GAME RULE and no Augmentation could have helped.
  The gap was real; the example demonstrated something else. Both halves of the copy rule, in one bug. (This bullet used to end "the MDP still models Rare only and
  says so in `reason`" — that was FALSE and stayed for weeks. `markovFromItem` gives a Magic start the
  rungs `['magic','rare']` and no such reason string exists anywhere. `ItemActions` renders whatever
  reason does come back rather than dropping the panel in silence.)
- **The policy route says "most likely lands X", never "add X".** The MDP chooses the ORB, never the
  outcome — an Exalt is a slam. `StepChanges` (`src/lib/policyPath.ts`) names the mod on the step's
  highest-probability edge, which is the edge the route follows by construction; phrasing it as an
  instruction would tell the player to do something the game gives them no way to do. The odds render
  beside it, which is what makes the wording self-consistent.
- **BOTH step planners search orb strength by DECOMPOSING it, not by enumerating it** (2026-09-01).
  It used to set no `tier` on any add and report `currencyDepth: 'base-only'`, which was honest and was
  a real gap: the axis is worth up to **322x** the success chance per attempt on a 5-target craft.
  Enumerating it is a `3^m` product on a search already at 295,680 plans, and the from-white
  estimate-then-reduce throttle would have made it *worse than slow*: at the default `maxPlans` it picks
  `strongest-only` on every craft big enough to need it, and `reduceOrbTiers` at that rung **drops base
  entirely** — deleting the cheap end of the frontier rather than widening the search.
  **The move that dissolves it**: `applyStep` reads only `currency`/`remove`/`add`/`adds`/`essenceTier`,
  so orb strength and omens change a step's price and odds and *nothing else* — the item trajectory is
  fixed by the sequence SKELETON. That makes the cost separable: `planExpectedCost`'s
  `Σ c_k·S_{k−1}/S_n` rewrites as `Σ_k c_k / T_k` over the SUFFIX product `T_k = Π_{i≥k} p_i`, so
  `T_k = p_k·T_{k+1}` and `E_k = E_{k+1} + c_k/T_k` — a backward DP (`leverDp.ts`) that also subsumes
  `withOmenVariants`'s `2^k` power set. Pruning it is EXACT: for `T_a ≥ T_b`, `E_a ≤ E_b`, extending
  both by `(p, c)` preserves both inequalities, so a dominated point can never come back. Needs
  `c ≥ 0` and `p > 0`; `leverOptions` guarantees both. Measured: **3.3–3.5x FASTER** on the big crafts
  while searching 192x more assignments (295,680 → 56,687,040), 0.86–0.93x on small ones where there
  was no power set to delete. `currencyDepth` is now `'full'` and earned.
  **Do NOT reuse `legalOrbTiers` for this.** It reads `tiers[minTierIndex].ilvl` — about 1 for an
  any-tier target — finds every strength floor above it and concludes `['base']`. A Greater orb IS legal
  there (a better tier still satisfies "any tier or better"), and it moves the odds 0.36x–1.79x across
  real targets. Reusing it would have shipped the axis as a no-op for the commonest from-item target.
  `leverOptions` filters on `p > 0`, which is exact because it computes the probability before deciding.
  `legalOrbTiers` is DELETED as of the from-white adoption below, which is what closed that hole.
  **`CurrencyDepth` is gone too** (2026-09-01): with every craft searching every strength there was one
  reachable value left, so a four-way field and its badge could only ever say one thing. The claim
  survives as static text on the "checked N plans" line, still gated on a search having run — a planner
  that DECLINED reports 0 plans and makes no claim about orbs it never looked at.
  The invariant is a property of today's `applyStep`, not a law, so `levers.test.ts` asserts it
  directly: every option must leave the same item behind. An Omen of Greater Exaltation adds TWO mods
  and could never be a lever here; `essenceTier` IS read by `applyStep`, which is why an essence level
  is chosen per craft by `cheapestEssenceLevel` instead.
  **The FROM-WHITE planner adopted it the same day**, and both planners now share `searchSkeletons`.
  Measured 19-66x faster on tiered crafts — and the answers moved, because the old `maxPlans` throttle
  did not merely slow the search down, it DELETED ROWS: `strongest-only` drops base strength, so a
  6-target T1 craft's cheapest plan was 42.7 billion ex where the real answer is 2.47 billion (−94%),
  and a 5-target T1 craft's was 54.2M against 18.3M (−66%). Deleted with it: `orbAssignments`,
  `reduceOrbTiers`, `legalOrbTiers`, `strengthUsable`, `ORB_TIERS`, `ADD_CURRENCIES`,
  `withOmenVariants`, the `estimate`/depth ternary — 113 lines — and **`maxPlans` off the effort
  ladder**, because a dial that moves nothing does not belong on a control that promises it will.
  Two things fell out: `OptimizeParetoOptions.maxMillis` had been declared and read by NO CODE on the
  from-white path, so the lab step planner has a clock for the first time (a ceiling, not a
  reservation — the model still takes the remainder via `clockLeft()`); and `CurrencyDepth` now has one
  reachable value, kept only because `DEPTH_RANK` still merges runs.
  **A GREATER ORB CAN BE CHEAPER THAN A PLAIN ONE, AND WHETHER IT IS CHANGES WEEK TO WEEK.** On the
  2026-08-22 sheet it was: Transmute 0.1333 against 0.1775, Augmentation 0.07389 against 0.2699, so
  the stronger orb was strictly better on a tiered craft and base was genuinely dominated. **The
  2026-09-01 refresh INVERTED it** — Transmute 0.06552 against a Greater 0.3995 (6.1x DEARER),
  Augmentation 0.06029 against 0.1575 (2.6x) — because plain Transmute and Augmentation both fell
  about 4x while their Greater versions rose. Nothing in the engine changed; this is the market.
  So do not read either direction as a fact about the game, and do not "fix" a frontier that stops
  naming Greater orbs. A frontier with no base-strength step is the DATA talking, not a throttle, and
  the converse is equally true; `pareto.test.ts` pins that base survives on a craft where it earns its
  place, which is the assertion that tells a throttle from a price. Anything downstream that quotes
  these numbers is quoting a snapshot — the shipped sheet now refreshes DAILY (see Prices).
  **A test had pinned the bug with a false reason attached**: `it('an any-tier target uses only a base
  orb (stronger orbs would reject tiers you accept)')`. The parenthetical is the error — a stronger orb
  raises the ilvl FLOOR, and a higher tier still satisfies "any tier or better". Written from the
  implementation's reasoning rather than the game's, it passed for as long as the bug existed.
- **The budget search screens before it settles, and the asymmetry IS the correctness argument.**
  `searchAlternatives` picks each node's best plan by `P(finish in budget)` over its whole frontier —
  necessary, because the cheapest plan is not automatically the likeliest to land inside a budget. But
  `planCostCdf` costs ~7ms per plan and that ran on **1,447 plans across 200 nodes**: 86% of a
  from-item alternatives run, almost all of it proving that plans LOSE. `bestByBudget` brackets each
  plan on a grid a tenth as fine and settles only the plans that could still win — **3.4-3.7x**, rows
  byte-identical. The skip is exact with no assumption about the grids lining up, because
  `planCostCdf` returns a bracket AROUND the truth at any cell count: `settle(x).lower <= truth(x) <=
  screen(x).upper`. **Prune on the screen's `upper`, never its `lower`** — two bounds that do not
  bracket each other can cut the true winner. That mutation survived every end-to-end test, because on
  real data the screening bracket is a few parts in ten thousand and the wrong comparison picks the
  same plans anyway; the rule was extracted into `bestByBudget` so a test can inject a deliberately
  useless screen. A guarantee that cannot be made to fail on real data has to be tested where it can.
- **The MDP models Chaos at BASE STRENGTH ONLY, and that is measured rather than missed.** The linear
  planner searches `chaos_greater` / `chaos_perfect` (real listings; the engine has always honoured the
  floor). Giving the MDP a matching `strength` axis was built and reverted on 2026-09-01: interleaved
  over six crafts it cost **1.2–1.5x the solve time and changed NO answer** — identical `expectedCost`
  and `bound` on every one. The MDP is the slowest component and its headline number, so slower means
  more crafts return a ceiling; that is a real loss against a measured-zero benefit. The prices say why:
  a Greater Chaos is 2.95x the price for at most ~2.6x the odds, a Perfect 61.6x for at most ~4.5x.
  **It is the PRICES that decide this, not the mechanics** — re-measure if they move. `pusher` cannot
  absorb these: it folds only IDENTICAL distributions, and these differ in distribution while losing on
  price. Note also that a strength axis is an EXCLUSION surface — "exclude chaos" stopped meaning
  "exclude every chaos" the moment one existed, which the exclusions regression test caught.
  Two dead ends recorded so they are not re-walked: `exactQuantum` does NOT fail on the live sheet (it
  returns 0.001 at d=3 — `exact` is false because `budget/quantum` is then 5,000,000 cells, 25x over
  the cap), and lowering `DEFAULT_COST_CELLS` does not work either, because the bracket has to stay
  narrow enough for `fmtPct(lower)` and `fmtPct(upper)` to render the same string or the panel prints
  a range where it printed a number.
- **A Chaos Orb has strengths, and they were free.** `currencyKey` gated its `_greater`/`_perfect`
  suffix on transmute/augment/regal/exalt and chaos was not on the list, while `chaosProbability` had
  forwarded the ilvl floor to `exaltProbability` since it was written. So a tiered chaos landed at
  better odds and billed at the base price — 33.39ex instead of 2,058ex, a **62x underquote** — and
  `allowsStep` reads the same key, so excluding Perfect Chaos Orbs (a row the UI offers) did nothing.
  Latent until the from-item axis started emitting them, which is why it shipped first and alone.
- **The MDP now models rarity, so a craft can start from a white base or a Magic item.** State is
  `(present, blocked, jp, js, flagged, rarity)` — the rarity really is in the KEY (`0:0:0:0:0:1` for
  Magic against `:2` for Rare), so the two never collapse onto one another; a Magic start solves
  exactly over both rungs and costs more, which is the direction that makes sense since the item has to
  be opened first. TODO 4 claimed the opposite for weeks — "the state key has no rarity" and
  "`stateLabel` would render both identically", the latter naming a function that does not exist —
  because the note was copied through a rewrite rather than checked. Pinned by tests now. `enumerateStates` takes the rungs a craft occupies and
  DEFAULTS to Rare alone, which is what keeps every from-item solve exactly as fast as before. Transmute
  / Augment / Regal are actions with the same Greater/Perfect strengths an Exalt has; Exalt, Chaos,
  Desecrate and Perfect Essence are absent below Rare because the game says so.
- **A from-white MDP MUST have the restart action or its numbers are nonsense.** A white base is free,
  so the real strategy includes binning a bad roll — and without the action the policy is trapped (once
  Transmuted there is no way back to Normal) and digs out with a 158.7ex Annulment instead of discarding
  0.18ex. Measured: 3607ex against 43ex, an **83x overestimate**. `restartCost` is offered only where
  starting over is real — a white base yes, a held Rare no, a carved item no — and `WHITE_BASE_COST`
  in `solve.ts` names the 0 explicitly rather than letting an absent price key silently become one.
- **A from-white solve is TWO value-iteration passes, and the order is load-bearing.** VI 0-initialises
  and climbs, so with a near-free `restart` every state ties with `restartCost + V(start)` on the early
  sweeps and a truncated solve returns "start over" as the optimal move EVERYWHERE — a graph that does
  not contain the goal. Phase A therefore solves push-forward only (no restart) and must CONVERGE; phase
  B seeds from that value and adds restart back. The seed is a proper policy's value, so `V0 >= V*` and
  `T(V0) <= V0` — phase B descends, every iterate stays an upper bound, and the greedy policy is sensible
  from the first sweep. If phase A does not converge there is no valid seed and the solve returns
  `feasible: false` with a reason; it must never quote a number it cannot bound.
- **`visitRate` ranks a state by SUCCESS, not by frequency — plain visit counts rank the failures.**
  With a free base ~98% of states choose "start over", so they are entered constantly while all
  showing the same action and the same cost (they share V(start)). Ranked by raw frequency, a real
  6-target T2 craft filled its default view with ten boxes, nine reading "Start over with a new base ·
  2,132 div" — faithful and useless; the spine sat below 99% behind 89 boxes. So `markovFromItem`
  multiplies expected visits by P(reach the goal from here): a restart-only state has no route onward,
  scores 0, and leaves. Restart edges are still DRAWN from surviving states — they are the back-arrows,
  and how often a step throws you back is the thing a player most needs. Don't "simplify" this back to
  one pass.
- **The top effort preset runs POLICY iteration, and it ends on a proof rather than a tolerance.**
  Value iteration stops when the residual falls under `tolerance`; on a long-odds craft it never does,
  so the app prints a ceiling. Policy iteration keeps the argmin VI computes and discards every sweep,
  then alternates evaluate (sweep V with the policy FIXED — no inner max) and improve (recompute the
  argmin). **When the policy stops changing it is optimal**, exactly, and `bound` becomes `'exact'`.
  Measured against VI at a 240s budget: `2p+1s T1` exact at 10,661 where VI could only bound ≤14,588
  (37% high); `3p+1s T1` exact at 93,204 against ≤117,120 (26% high); on the craft neither settles,
  PI's ceiling is 16% tighter. Where both converge they agree to **1e-6**, which is the licence for
  the swap. **EVERY effort preset runs it as of 2026-08-28**, and there are THREE of them as of 2026-08-29 —
  Quick / Standard / Exhaustive. Thorough and Patient were retired because they overlapped, not because
  effort stopped mattering: the gradient is real (Quick resolved 10 of 18 measured crafts exactly,
  Standard 14, Thorough 16, Patient 18), but Patient and Exhaustive returned BYTE-IDENTICAL costs on
  every hard craft and Thorough sat between neighbours that bracketed it. `RETIRED_EFFORT` maps a stored
  `thorough`/`patient` UPWARD to `exhaustive`, in both `read()` and `limitsFor` — the plain unknown-id
  fallback would have moved someone who deliberately chose Patient to a SHORTER search and a worse
  answer without telling them. The comparison that decided it: a campaign over 18
  realistic crafts and 108 solves found PI did not lose a single cell, and produced a ceiling ZERO
  times — it either answers exactly or says it could not start.

  |                | exact | ceiling | no number |
  |---|---|---|---|
  | Quick / VI     | 6 | 4 | 8 |
  | Quick / **PI** | **10** | **0** | 8 |
  | Standard / VI  | 9 | 5 | 4 |
  | Standard / **PI** | **14** | **0** | 4 |
  | Thorough / VI  | 10 | 6 | 2 |
  | Thorough / **PI** | **16** | **0** | 2 |

  **Waiting does not rescue VI**, which was the question that prompted the campaign. Given Patient's
  full 300s it still returned a ceiling on 7 of 8 hard crafts — up to 2.45x high — where PI was exact
  on 8 of 8, mostly under 22s. Switching solver beats raising effort outright: a 4-target T2 Wand is
  `≤110,585` under VI at Thorough (60s) and the exact `50,934` under PI at STANDARD (6.7s).
  **It cannot regress a number into a refusal**, and that is what makes it safe rather than merely
  better on average: "no number" comes from PHASE A failing, and phase A is plain VI on both paths —
  `markovFromItem` returns `fail(...)` before it reads the solver choice. A phase B that runs out
  under PI still yields `bound: 'upper'`. The measured no-number counts are identical at every rung.
  The old reason for holding it back — `standard` reproducing pre-setting behaviour — now holds only
  for the ORB SEARCH (which is all `searchEffort.test.ts` ever pinned); the MDP half deliberately
  changed, and every move is toward the exact answer.
  **Phase B only**: PI on a stochastic shortest path is safe only from a PROPER policy, and phase B is
  seeded from phase A's converged value, which is one. Phase A 0-initialises and keeps plain VI.
- **Phase A is 92-98% of a solve, and replacing it with a guessed policy DOES NOT PAY on big crafts.**
  Once evaluation went closed form the bottleneck inverted — phase B fell to 1-2% and the seed became
  the cost (6-target T2: 379.6s of 389s). Phase A computes the OPTIMAL push-forward value where phase
  B only needs `T(V0) <= V0`, which any proper policy's value satisfies — so `heuristicPolicy` guesses
  one and `evaluateClosedForm` costs it. It exists, it is correct, and it is **opt-in via
  `heuristicSeed`**, because interleaved medians say the trade is bad where it matters:
  3 tgt T1 2.0s → 0.6s (3.22x), 5 tgt T2 34.4s → 28.0s, but **6 tgt T2 264s → 445s, 1.7x SLOWER on
  both reps**. Skipping phase A starts policy iteration from a worse policy and costs more rounds than
  it saves once the lattice is large. **A single before/after said the big craft was fine; it was not**
  — only interleaved reps caught it, on a machine with a ~40% spread. Don't flip the default without
  a principled test for which side of that crossover a craft is on.
- **A fixed policy is costed in CLOSED FORM, not iterated to.** Iterating it was the whole cost of a
  solve, structurally: with a free base ~98% of states restart, so `V(s) = restartCost + V(start)`
  almost everywhere and the chain contracts at r ≈ 1, where a residual under `tol` still leaves an
  error of `tol/(1−r)` and `1/(1−r)` is the expected attempt count. Loosening `tolerance` is NOT the
  escape — measured, it moved one craft 74.4s → 0.8s and its answer 4,753 → 35,417. Instead
  `evaluateClosedForm` solves the renewal on the restart-ABSORBING chain: `c(s)` = cost until
  goal-or-restart, `q(s)` = P(restart first), then `V(start) = c/(1−q)` and `V(s) = c(s) + q(s)·V(start)`.
  Restart states are TERMINAL there, and they are 98% of the lattice, so the chain that actually
  propagates is the thin spine. Measured: 3-target T1 60.1s → **2.3s**, 4-target T2 74.4s → **4.8s**,
  and a 6-target T2 craft that ran ~1,000s to a ceiling now returns `bound: 'exact'` in **292s**.
  Offer actions (a Desecration's three draws) reorder by V, so their ordering is FROZEN per evaluation
  and re-sorted by the next improvement round — otherwise c and q are not linear. `iterativeEval: true`
  keeps the old path runnable, and the differential test against it is what licenses the fast one.
- **`maxIters` is on the effort ladder as `maxSweeps`, and must reach BOTH solve paths.** It was a
  hardcoded 100,000 the ladder could not touch, which made the top preset a lie — on a craft that
  exhausts its sweeps the clock never binds, so "several minutes" bought nothing (measured: a 6-target
  T1 craft ran 1,035s and stopped on sweeps). `withSweepLimit` in `solve.ts` is a helper, not a spread
  at each call site, because the first version wired only the lab path and every test stayed green;
  only the behavioural test in `solve.test.ts` (one sweep must NOT converge) catches that.
- **Read `bound`, never infer the inequality from `converged`.** A from-item solve truncates UPWARD
  (render "≥ x"); a from-white solve truncates DOWNWARD (render "≤ x"). `formatBoundedCost` in
  `src/lib/currency.ts` is the only place that turns the field into a sign. Guessing the direction
  prints the most precise-looking wrong figure in the app.
- **`distanceToGoal` lives on the node now, not in engineMap.** There were two copies of that
  expression and they disagreed the moment rarity entered it, which would have drawn the solver's
  forward steps as steps backwards. And the route walk only steps to states the craft can be FINISHED
  from: a from-white policy scraps and restarts for most outcomes, so plenty of states have no forward
  move at all, and following the likeliest edge walked into one and stalled.
- **Neither planner's failure may delete the other's answer, and the guard runs BOTH ways.**
  `markovOrReason` in `solve.ts` turns an MDP throw into a `reason` the panel renders; it exists because
  an unmocked `optimizeItemMarkov` in a test took the whole lab result down. `frontierOrReason` is its
  mirror, added 2026-08-29: the STEP planner throws on shapes it cannot express, and a craft naming only
  an essence mod ("an essence-only mod needs a Magic item first") was taking down a compute the MDP
  answers perfectly well — reachable from the day the model learned to buy an Essence. Neither is a
  blanket catch; both carry the message through. `EngineResult.reason` outranks `FrontierView`'s generic
  "nothing this search tried worked", because a planner that DECLINED and a search that RAN and found
  nothing are different answers — telling the second reader to lower a tier is advice, telling the first
  is a wrong diagnosis.
- **A held item's step-route card shows no expected-cost total.** `planExpectedCost` divides a real
  per-run cost by the plan's success chance, and at ~7e-13 that is billions of divine — right, and not
  a budget. `FrontierView`'s `freeRestart={false}` drops `expected` and `expectedAttempts` and shows
  chance-per-attempt plus what one run costs, which still expresses the cost↔probability trade (more
  orb strength = dearer run, likelier landing). Don't reinstate the total "for completeness": it was
  the single most-complained-about number in the app. The from-white path keeps it — a white base
  really is replaceable for free.
- **Once the MDP has answered, the step routes collapse.** Measured on a five-target craft they read
  ~5,000,000x above the true cost, and orb strength (worth 1,116x) would still leave ~68,000x — the
  remainder is the model, not a gap. Orb strength has since been ADDED (2026-09-01, worth up to 322x
  measured on the frontier's best row), so the multiple is smaller; the conclusion is not, because a
  step plan is one fixed sequence naming every mod and can never adapt to what the game hands you.
  `trueCostAnswered` in `ItemActions` is the single predicate for
  both that collapse and the "No true expected cost" card; keep it single, or the panel can end up
  hiding the routes AND explaining their absence at the same time.
- **Sentry is OFF unless `VITE_SENTRY_DSN` is set at BUILD time, and it loads lazily when it is.**
  Vite inlines `import.meta.env.*` as a literal, so with the variable unset the init in
  `src/lib/sentry.ts` is provably dead and Rollup deletes it — the build succeeds, the site works, and
  no error reaches anybody. That shipped undetected; `warnIfUnmonitored` in `vite.config.ts` now says
  so in the build log. The SDK is a DYNAMIC import because a static one takes the entry chunk from
  111 kB gzip to 202 kB (+82%), which would undo the startup work `preloadPatchData` exists to do —
  errors thrown before the chunk lands are queued and flushed. `ErrorBoundary` is ours, not
  `Sentry.ErrorBoundary`, precisely because that component forced the SDK into the entry bundle.
  Vercel Analytics is unconditional and same-origin (`/_vercel/insights`), so it needs no CSP entry.
  **Source maps ship publicly** (`build.sourcemap: true`) — ~2.2 MB of deploy, zero page weight (a
  browser fetches a `.map` only with devtools open), and fine because the repo is public and AGPL; a
  private repo would want `'hidden'` plus `@sentry/vite-plugin` and a `SENTRY_AUTH_TOKEN`, which
  unlike a DSN IS a real secret. **Worker errors report from the MAIN thread.** The solver's worker
  carries no SDK — 158 kB gzip on a thread built to stay light and respawned on every cancel — so it
  sends `message` + `stack` across the error channel it already had, and `engineClient` calls
  `reportError` tagged `origin: worker-solve` / `worker-fatal`. Without that the hardest code in the
  app reported nothing and a crash was just a progress bar that stopped. **Tags must be
  `captureException`'s SECOND ARGUMENT** — hanging them off the Error type-checks, runs, reports, and
  silently drops them; `sentry.test.ts` mutation-pins that, the queue's copy of it, and the queue cap.
- **The CSP is a real response header in `vercel.json`, never a `<meta>` tag.** A meta CSP silently
  ignores `frame-ancestors`, and being part of the document it applies in dev too — which is why the
  old one had to allow `ws://localhost:*` for Vite HMR and shipped those allowances to production.
  `src/lib/deployConfig.test.ts` pins the header and fails if a meta tag reappears to shadow it.
  `'unsafe-inline'` stays in `script-src` deliberately: `preloadPatchData` injects an inline script
  whose content changes with every data refresh, so a hash would need regenerating each time. The app
  has no XSS sink for it to matter — no `innerHTML`, no `eval`, no `dangerouslySetInnerHTML`.
  **`worker-src 'self'` is explicit, not load-bearing** — measured 2026-09-02: deleting it breaks
  nothing, because `worker-src` falls back through `child-src` to `script-src 'self'`. Keep it (an
  explicit directive is the right documentation of intent), but a mutation test that deletes it proves
  nothing. Use `worker-src 'none'` — that genuinely forbids the solver and takes four of the five
  browser smoke tests down with it.
- **Five browser tests exist, and they are the only ones that run in a browser.** `e2e/smoke.spec.ts`
  under Playwright/Chromium, in CI after Build. Cold load with zero console errors, a Lab compute, an
  Item compute, a share-link round trip in a fresh context, and a 390x844 mobile pass asserting no
  horizontal overflow. **They never assert a cost VALUE** — those move with the daily price sheet and
  with every solver change, and a smoke test that pinned one would fail for reasons that are not
  defects. They assert a number APPEARS. Correctness of the number is the unit suite's job.
  They run against `dist/` served by `e2e/serve-dist.mjs`, **never `vite preview`**, which does not
  read `vercel.json` and therefore serves no CSP at all — a suite behind it would pass on exactly the
  deploy that breaks. The server READS the headers from `vercel.json` so the two cannot drift, 404s a
  missing file rather than SPA-falling-back to `index.html` (the fallback served HTML for a missing
  `.js` and Chromium's MIME refusal then broke the no-console-errors test), and stubs
  `/_vercel/insights/*`, which the Vercel platform serves and a local `dist/` has not — filtering that
  error out in the test instead would have started an exception list, which is where a real error
  eventually hides.
- **Work lands on `beta`, production is `main`, and the gap between them is the point** (2026-09-02,
  replacing `revival`). Vercel builds every branch, so `beta` has its own preview URL — which is the
  first deploy anything gets. Before 1.0 there was no such gap: `revival` and `main` were pushed in the
  same breath, so poe2htc.com WAS the first deploy of every change, and "the build is fine but the
  deployed page is not" had nowhere to show up but in front of users.
  The loop: commit to `beta` → push → CI plus the preview build → look at the preview → fast-forward
  `main`. Direct pushes to `main` are still sanctioned despite branch protection, and
  `remote: Bypassed rule violations` is expected output rather than an error — the gate is the preview,
  not a PR.
  **The daily price refresh is a deliberate exception and merges straight to `main`.** It is data, not
  code; it is guarded by `priceResolution` and `costConsistency` running in its own job before it
  merges; and routing it through `beta` would mean prices never reach players without a human, which is
  exactly what "automatic without me doing nothing" ruled out. The consequence to remember: after the
  bot merges, `main` is AHEAD of `beta`, and the next `beta`→`main` push is rejected as a
  non-fast-forward. Merge `main` into `beta` then — never force, which is blocked separately anyway.
  `revival` and a stale `test` branch were deleted at 1.0; both were byte-identical to `main` with zero
  unique commits. `C` (abandoned C/WASM engine, 29 unique commits) and `static` (37 unique commits from
  April 2026) still hold history that is on no other branch — do not delete either without asking.
