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
- **A missing price is 0, not "unavailable".** `stepCost` does `prices.currency[key] ?? 0`, so an omitted key mints a free orb. Exalt strengths and the Necromancy/Light/side omens are separately gated on *having* a price in `markovActions.ts`; the boss omens are not. In synthetic test fixtures, price every currency the policy might reach or the hand-computed arithmetic silently changes.
- The shipped `0.5.0` data is cross-checked exact vs Craft of Exile (Wands/Amulets/Rings/Body Armour/Quivers); re-validate with the `scripts/coe-*` harness when 1.0 lands. `data/patches/<patch>/` versioning is what makes a re-refresh safe.
- `0.5` (Java-extracted) and `0.5.0` (poe2db) use DIFFERENT mod-id schemes (`MAXIMUM_MANA` vs `IncreasedMana`); the app + facade tests are id-agnostic (they list from the loaded data), but hardcoded ids in a test must match whichever patch that test loads.
- Java-retirement doc debt was audited 2026-08-21 — `docs/{API_EXAMPLES,DEVELOPMENT,CONTRIBUTING,ABOUT,data-layer}.md` all lead with the "backend retired, pure client-side TS" note, and the remaining Java mentions (the frozen `__fixtures__` anchor, the `0.5` snapshot, past-tense history in ABOUT) are deliberate and accurate. Don't "fix" those. The audit predated the Electron removal; `DOWNLOAD.md` was rewritten separately on 2026-08-23 and now says there is nothing to download.
- **`vercel.json` holds the cache headers, and JSON has no comments.** `/static/*` is content-hashed by Vite so it is cached `immutable` for a year; `/` is not hashed (it is how a new deploy is discovered) so it is `max-age=0, must-revalidate`. Getting those backwards either re-downloads 3.1 MB every visit or pins users to a stale build. Vercel's schema **rejects unknown properties** — a `"//"` key added to explain each rule failed the build outright ("headers[0] should NOT have additional property //"), so the headers never shipped. Explanations go here; `src/lib/deployConfig.test.ts` enforces the schema locally so the next mistake fails in the suite rather than in a deploy.
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
- **The MDP now models rarity, so a craft can start from a white base or a Magic item.** State is
  `(present, blocked, jp, js, desJunk, rarity)`; `enumerateStates` takes the rungs a craft occupies and
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
  the swap — and PI is 2-3.5x faster there too, so it is arguably the better default everywhere. It is
  NOT the default only because `standard` is documented to reproduce the pre-setting behaviour exactly.
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
- **An MDP failure must never delete the frontier.** Both tabs compute the step frontier first and the
  model second; `markovOrReason` in `solve.ts` turns a throw into a `reason` the panel renders. This is
  not a blanket catch — the message is carried through. It exists because an unmocked `optimizeItemMarkov`
  in a test took the whole lab result down, and the same shape could happen in production.
- **A held item's step-route card shows no expected-cost total.** `planExpectedCost` divides a real
  per-run cost by the plan's success chance, and at ~7e-13 that is billions of divine — right, and not
  a budget. `FrontierView`'s `freeRestart={false}` drops `expected` and `expectedAttempts` and shows
  chance-per-attempt plus what one run costs, which still expresses the cost↔probability trade (more
  orb strength = dearer run, likelier landing). Don't reinstate the total "for completeness": it was
  the single most-complained-about number in the app. The from-white path keeps it — a white base
  really is replaceable for free.
- **Once the MDP has answered, the step routes collapse.** Measured on a five-target craft they read
  ~5,000,000x above the true cost, and orb strength (worth 1,116x) would still leave ~68,000x — the
  remainder is the model, not a gap. `trueCostAnswered` in `ItemActions` is the single predicate for
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
- **The CSP is a real response header in `vercel.json`, never a `<meta>` tag.** A meta CSP silently
  ignores `frame-ancestors`, and being part of the document it applies in dev too — which is why the
  old one had to allow `ws://localhost:*` for Vite HMR and shipped those allowances to production.
  `src/lib/deployConfig.test.ts` pins the header and fails if a meta tag reappears to shadow it.
  `'unsafe-inline'` stays in `script-src` deliberately: `preloadPatchData` injects an inline script
  whose content changes with every data refresh, so a hash would need regenerating each time. The app
  has no XSS sink for it to matter — no `innerHTML`, no `eval`, no `dangerouslySetInnerHTML`.
- Direct pushes to `main` are sanctioned despite branch protection; `remote: Bypassed rule violations` is expected output, not an error. `main` and `revival` are kept in sync.
