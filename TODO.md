# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-24.

---

## 1. ~~Pin down the desecrated spawn weight~~ — DONE 2026-08-24

**Measured in game.** 40 bones on an empty Rare `Helmets_dex_int`. A bone offers three modifiers, so
120 were shown, **22 of them carved** — 18.3% per draw. `scripts/desecrate-weight.mts` inverts that to
a maximum likelihood of **2,512**, plausible range **1,995–3,981**. `DESECRATED_ASSUMED_WEIGHT` moved
**1000 → 2500**, data rebuilt, docs/validation.md D4 rewritten.

The old 1000 predicted 7.6% per draw against 18.3% observed — not merely imprecise, outside the
interval. What it changed, held Rare with three ordinary targets:

| base | at 1,000 | at 2,500 | bone excluded |
|---|---|---|---|
| Wands | 2,181 ex | **2,494 ex** | 4,074 ex |
| Body_Armours_str | 1,359 ex | **1,396 ex** | 2,968 ex |

A heavier carved pool makes a bone *worse* at fishing for ordinary mods, so those crafts got dearer —
a bone is still clearly worth playing (39% off on Wands, 53% on Body Armour), just less of a bargain
than the app used to claim.

**Count MODIFIERS, not offers.** The sample was first recorded as "22 of 40 offers held a carved mod",
fitted at 3,981 and shipped at 4,000 before the reporter corrected it. The offer reading overstates the
weight by ~50% — "at least one of three" is a far higher bar than "one draw" — and modifiers are the
better statistic anyway, 3N Bernoulli trials against N for the same bones. The script now takes
modifier counts, says so in its usage, and carries the warning.

**What this did NOT settle:** one base is not every base. The measurement fixes a single GLOBAL
constant from `Helmets_dex_int` alone, so a per-category weight would be invisible to it.
`PriceBasisNote` keeps its caveat and `assumedOdds` still flags an unomened Desecration. A second
sample on a weapon would test it — same command, different base.

**The three-draw model, by contrast, IS corroborated.** The observer saw several offers holding two
carved mods and none holding three; at the fitted weight the model predicts 3.3 two-carved offers in 40
and a 78% chance of seeing no three-carved offer at all. That is independent of the headline rate the
fit consumed, so it checks the shape rather than restating the input — and it held under both readings
of the sample, which is why the misread was a wrong number rather than a wrong model.

## 2. Loose ends from putting rarity in the MDP

Done 2026-08-23: the true-cost model handles Normal and Magic starts, so the Lab tab has a policy
route and an honest cost. What that left open:

- **The MDP has no Essence action**, so a craft whose target needs one still has no true cost (the
  panel says so and falls back to the step routes). Essences are a deterministic add on a Magic item —
  the same shape as the add-chain actions now in the space.
- **The step planner still cannot express filler.** Interesting consequence: the MDP *can* — it rolls
  whatever lands and desecrates — so a lone desecrated target from white is now feasible in one model
  and not the other. Worth checking whether `FrontierView`'s desecration empty-hint should now point
  at the policy instead of calling it unsearched. See docs/copy-audit.md row 4.
- **Suite time.** Lab tests now run an MDP; keep an eye on it. (2026-08-23: `searchEffort.test.ts`
  was buying a 6-target from-white MDP to assert the STEP planner's orb depth — 209s and 134s for
  numbers it never read. It now calls `optimize` directly and keeps one `runSolve` case for the
  wiring. Full suite back to 23s.)

## 3. Value iteration is still the whole cost of a from-white solve

Partly addressed 2026-08-24: the stopping rule is scale-aware now (a thousandth of the craft's cheapest
action, not a flat 1e-9), worth a measured **1.77x** — interleaved, three reps, non-overlapping. Error
1.0e-3 relative and one-directional, so the number overstates a craft's cost and never flatters it.
See docs/validation.md for that and for three things tried and rejected on measurement (goal-first
sweep ordering, now re-tested against sweep COUNTS and closed for good; dropping the free restart's
zero-cost self-loop; a seed repair that repaired nothing).

**What remains, re-measured 2026-08-24 on the path the LAB ACTUALLY RUNS.** Every earlier figure in
this section was taken with `markovFromItem(..., { restartCost: 0 })` or, worse, with
`optimizeItemMarkov` and no `restartCost` at all — which silently solves a *different and far easier*
problem, because without a restart action there is no phase B, and phase B is ~20x phase A. Anything
timed that way is the seed, not the solve. **Always pass `restartCost` when timing a from-white craft.**

From white `Body_Armours_str`, six targets, `restartCost: 0`:

| craft | phase A | phase B | wall | result |
|---|---|---|---|---|
| 6 targets, no tier floor | — | — | **61 s** | converged, exact |
| 6 targets, all T1 | 16,415 | **exhausted at maxIters=100,000** | **1,035 s** | `bound: 'upper'`, E=206,016 ex |

**The binding constraint on the hard craft is the sweep cap, not the clock.** That kills the obvious
fix: a higher effort preset was drafted and dropped, because more wall clock buys that craft nothing —
it stops at 100,000 sweeps whatever the clock says.

**And raising `maxIters` is not the fix either — measured, not assumed.** Tracing phase B's residual
every 2,000 sweeps on that craft gives the decay rate directly, so the remaining distance is arithmetic
rather than guesswork:

| sweeps | residual | per-sweep decay |
|---|---|---|
| 0 | 7.94e+2 | — |
| 40,000 | 8.84e-1 | 9.60e-6 |
| 70,000 | 6.69e-1 | 8.94e-6 |
| 98,000 | 5.31e-1 | 8.14e-6 |
| target | 7.39e-5 (`tol`) | |

Extrapolating that rate to `tol` needs **~1.0-1.1 MILLION more sweeps** — about **2.6-2.8 hours** at the
measured 9.14 ms/sweep, on a machine faster than a browser. And it is a FLOOR, not an estimate: the
decay rate is itself still degrading (9.60e-6 → 8.14e-6 between 40k and 98k), so the true figure is
worse. An eleven-fold cap raise for a multi-hour wait is not a setting anyone would choose.

**A free lower bound from the same residuals was then tried, and it does not work.** RETRACTED: an
earlier version of this note claimed the geometric tail put the true cost in [140,769, 206,016] ex,
"at most 32% high". That figure came from the method below and should not be relied on.

The idea was that value iteration's residual shrinks geometrically, so two samples give a decay rate
and the descent still to come sums to a closed form — turning "≤ x" into a range for nothing, without
the third VI phase dropped earlier. Two attempts, both rejected on measurement:

1. **Extrapolating `delta`, the max residual.** Wrong quantity: it is the max over the WHOLE lattice,
   so V(start) can be settled while a far corner still moves. On a 3-target Wand cut at 3,000 sweeps
   the ceiling was 2% high and the projection was 17% LOW — worse than the number it was improving.
2. **Extrapolating V(start)'s own fall**, sampled 2,000 sweeps apart. Better, and dramatic where the
   ceiling is bad (4-target Wand at 6,000 sweeps: ceiling 893 against a true 425, projection 395). But
   it is not sound: at 5,000 sweeps the range came out **[695.87, 1193.70] against a truth of 425.43**
   — it missed, and in the direction that tells a player a craft costs at least 696 when it costs 425.

The reason is structural and shows in the trace above: the decay rate is **not constant**, it creeps
toward 1 as the solve grinds (9.60e-6 → 8.14e-6 between 40k and 98k sweeps). Any geometric fit
therefore UNDERSTATES the remaining descent, and fitting it early — while the decay is still fast —
understates it worst. No amount of guarding fixes a fit whose error is one-directional against the
claim being made.

So a genuine lower bound still requires computing one: 0-init VI with restart, climbing from below,
which is the third phase that was costed and dropped. The ceiling stays a ceiling.

What the effort presets DO still cover is everything short of that: a 6-target craft with no tier floor
lands at 61 s, inside Thorough. The unconverged case is the tier-maxed end of the range, where the
honest ceiling may simply be the right answer — E=206,016 ex says "astronomically expensive" perfectly
well, and no player needs its third digit. Worth deciding deliberately rather than by default.

**Where the time actually goes, measured 2026-08-24 in sweeps rather than seconds** (deterministic, so
it survives the ~40% wall-clock spread that has already produced two opposite conclusions from noise):
phase B costs **20x phase A**. From-white Wand at 4 targets, 1,225 sweeps to seed against 24,838 to
solve; at 3 targets, 783 against 4,417. Phase A is the same problem minus one action, so the restart
action is where the whole cost sits — and it is not the zero-cost self-loop at the start state, which
was tested and changes the sweep count by exactly nothing (see docs/validation.md).

The likely reason, and the shape of the fix: with a free base, **98% of states choose restart** and so
share one value, V(start) — measured on a converged 3-target solve (1,015 of 1,041 policy states), and
stable at every sweep budget, so it is the true optimum and not a truncation artifact. Value iteration
is grinding a lattice whose answer is very nearly a single scalar, circulating it one edge per sweep.
**Policy iteration** solves each policy's linear system outright and should need a handful of rounds
where this needs 24,838 sweeps — and it is now the ONLY lever left for the tier-maxed craft, since that
one is sweep-capped and no setting the user can reach will change it. That is the next lever — bigger than prioritised sweeping (a worklist
skipping states whose successors have not moved), which is the fallback if policy iteration is too
much surgery. Measure either one in sweeps first, seconds second.

Cheaper things to try first, both unmeasured:

- The `1000` divisor is a knee found on two crafts, not a law. Worth re-checking on a from-ITEM craft,
  where there is no phase B and the error lands differently.
- `maxIters` is 100,000 and irrelevant on crafts that converge in tens — but a craft that hits it burns
  the whole budget before the deadline check can stop it. A cheaper cap, or checking the clock more
  often than every 32 sweeps, may matter more than it looks.

## 4. A Magic item can only be opened with a Regal — there is no Augment step

`baseTransforms` (`packages/optimizer/src/fromItem.ts`) emits chaos / annul / exalt and no `augment`,
and both Chaos and Exalt score 0 on a Magic item. So the only way this planner adds a mod to a Magic
item is the Regal opener that converts it to Rare (added 2026-08-23). For a target needing 3+ mods
that is the right move anyway; for a 2-mod target an Augmentation (0.27ex) would be cheaper than a
Regal, and the planner cannot express it. Pinned by a test that asserts the gap rather than hiding it.

Related and larger: **the MDP does not model Magic at all**, so a Magic item gets step routes but no
true expected cost and no policy graph. The UI now says so instead of silently dropping the panel.

Restoring it is smaller than it first looks. `enumerateStates` builds the FULL rare lattice, not the
reachable subset, so value iteration already computes V for every post-Regal state. A Magic start is
then one Bellman backup on top of an existing solve:

    V(magic) = cost(regal) + Σ P(outcome) · V(rare_outcome)

with the outcome distribution being P(regal lands each target) / blocks a family / lands junk. No new
state axis, no change to VI.

Two things stop it being a drop-in, and both are design rather than arithmetic:

1. **The state key has no rarity**, so a Magic start encodes identically to the Rare state with the
   same mods (`0:0:1:1:0`). It needs a synthetic start node, or a rarity bit in the key.
2. **`stateLabel` would render both identically** — "0 mods · +2 junk" for the Magic item you hold and
   for the Rare item you get after annulling. A graph whose first two boxes read the same but mean
   different things is worse than no graph, so the label needs to carry rarity too.

Worth doing, and it wants its own MC cross-check like the rest of the MDP work.

## 5. The from-item step planner never varies orb strength

`baseTransforms` (`packages/optimizer/src/fromItem.ts`) builds every add at base strength — no `tier`
field — so the planner cannot buy the probability a Greater or Perfect Exalt offers. The MDP *does*
weigh them, which is part of why the two models' costs diverge so hard on a long-shot craft. As of
2026-08-23 the badge tells the truth about this (`currencyDepth: 'base-only'`) instead of claiming
"tried every orb strength".

**Measured 2026-08-23: worth 1,116x** on the reported craft (success per attempt 1.53e-10% at base
against 1.71e-7% at Perfect). But it does NOT make the step routes useful — even at Perfect they sit
~68,000x above the MDP's figure, because a step plan is one fixed sequence naming every mod. So this
is a correctness/honesty item, not a fix for "the step routes are unusable"; that was addressed by
collapsing them once the MDP answers.

Fixing it means an orb-strength axis over the adds, multiplying the search by roughly `3^k` on a
search that already evaluates 295,680 plans (~3.2s) for a 5-target craft. It needs the same
estimate-then-reduce throttle `optimizePareto` uses, not a naive product. Note `reduceOrbTiers` does
not currently handle the `base-only` depth — it would fall through to `['base', strongest]`. Worth
doing; not small.

Related, smaller: above the Thorough preset the MDP's `maxIters` (100k sweeps, ~50s) binds before
`maxMillis`, so Patient buys nothing on crafts like the one in docs/validation.md. Either expose the
sweep cap on the effort ladder or stop implying more time helps.

## 6. Startup: what measurement left on the table

Done: `mods.json` warm-start, immutable cache headers, dead UI kit removed. What the bundle
visualiser (`ANALYZE=1 npm run build`) showed, as a share of the 108.7 kB gzip bundle:

| share | package |
|---|---|
| 51% | react-dom |
| 21% | app source |
| 8.8% | tailwind-merge |
| 6.9% | sonner |
| 6.9% | @sentry/* (all three packages combined) |

(Per-module gzip sums overcount, since each is compressed alone — read these as shares, not bytes.)

Two things worth a look, neither obviously worth it:

- **tailwind-merge at 8.8%** is a lot for merging class strings. It is used only by the `cn()` helper.
  If nothing actually relies on conflict resolution, `clsx` alone would do — but swapping it risks
  quiet style breakage, so it needs a real audit of `cn()` call sites first.
- **react-dom is half the bundle** and irreducible without changing framework. Not worth it.

**CORRECTED 2026-08-26 — the Sentry row above was measured on a build with Sentry compiled OUT.**
The original note read: "Sentry was the hypothesis going in and the measurement killed it: ~6.9%
across all three packages, Session Replay not in the bundle at all. Lazy-loading it would buy almost
nothing." Every part of that was an artifact. With no `VITE_SENTRY_DSN` at build time, Vite inlines
`undefined`, the guard in `sentry.ts` is provably true and Rollup deletes the entire `init` — so the
visualiser was measuring the leftovers of `Sentry.ErrorBoundary`, not Sentry.

Re-measured with a DSN set, the real figures are the opposite of that conclusion:

| build | entry chunk (gzip) |
|---|---|
| no DSN (what was measured) | 116 kB |
| DSN set, static import | **202 kB** — +74% |
| DSN set, dynamic import (now) | **111 kB**, Sentry in its own 158 kB chunk |

So lazy-loading bought ~90 kB gzip off the critical path, and Session Replay *was* in the bundle once
the DSN existed. Done 2026-08-26. **The lesson generalises: measure a bundle in the configuration it
actually ships in.** A feature gated on a build-time env var is invisible to the visualiser unless
that var is set.

---

## Recently closed

- **Feedback is reachable, and the desktop promise is gone** (2026-08-23). The header's action block
  was `hidden md:flex`, so on a phone there was no Discord link and no way to report a bug — the exact
  loop the launch depends on. It now wraps and compacts instead of disappearing, with an explicit
  `aria-label` on every action (hiding the text would otherwise leave the emoji as the accessible
  name). A new **Report a problem** panel builds a paste-anywhere report carrying the share link that
  reproduces the user's exact craft; it offers Discord alongside GitHub, since most players have no
  GitHub account. The "⬇️ Desktop App" button promised an Electron build removed on 2026-08-22 and is
  gone; `docs/DOWNLOAD.md` now says there is nothing to download.
  Found on the way: `decodeWorkspace` counted an EMPTY base id as a lost id, so a link shared from a
  fresh workspace announced "2 mods in the link no longer exist" — no mods, nothing missing. The
  message also called a dropped base a "mod".

- **The evidence trail is current again** (2026-08-23). `docs/validation.md`'s last section was dated
  2026-08-21, so five mechanic changes existed only in commit messages — the boss-omen gate, armour's
  untargeted draw, the one-essence cap, perfect essences from white plus the missing ilvl-72 gate, and
  VI convergence reporting. Each is now recorded WITH ITS EVIDENCE QUALITY, which varies: two rest on
  user rulings, one (the desecrated weight) is an outright assumption and is flagged as the largest
  unverified number in the app. `docs/copy-audit.md` had also drifted into contradicting itself in
  three places — every row is now closed and marked.

- **Search effort is the user's setting now** (2026-08-23). Three solver caps were hard-coded guesses
  about someone else's patience: VI's sweep cap, the budget search's node cap, the orb search's plan
  cap. One `Search effort` preset drives all three, and the caps already announce themselves, so the
  loop closes: the app says where it gave up, the user decides whether to pay for more. Measured on a
  6×T3 Wand craft — the old default only searched `strongest-only` (5,760 plans); Patient reaches the
  full search (622,080), 108x more. `standard` reproduces the old behaviour exactly.
  Also: the solve progress bar now reports the max of two monotone measures (residual closed, budget
  burned), so it keeps moving when convergence stalls instead of freezing at 92%.

- **The desecrated weight is an assumption, and the app says so** (2026-08-23). poe2db publishes none
  (reports 1 for every row); all 527 now carry 1000. Body Armour goes 1-in-121,510 → 1-in-132. Only the
  UNOMENED draw inherits the assumption — the boss-omen path is count-uniform — so `assumedOdds` keys
  off the actual plan steps and `PriceBasisNote` drops its "odds are exact" claim only there. Armour
  MDP solves went 6s/unconverged → 159ms/converged as a side effect.

- **The MDP silently returned unconverged numbers** (2026-08-23). Value iteration bails at
  `maxIters` (100k) on long-odds crafts, and because VI 0-initialises and climbs, the value it returns
  is a strict LOWER BOUND. Nothing said so — `expectedCost` came back looking like an estimate and the
  UI printed it as a plain figure. `MarkovResult.converged` now carries it end to end, and the panel
  renders "≥ x" with a note that the real cost may be far higher.

- **The silent alternatives panel, and mobile mod columns** (2026-08-22). `AlternativesView` returned
  `null` on an empty frontier, so it just wasn't there — and an existing test asserted
  `toBeEmptyDOMElement()`, pinning the bug as intended behaviour. It now explains itself. Note the
  entry in this list previously claimed a low budget caused it; that was **wrong**. Row 0 is the exact
  target and enters with `bestP = -Infinity`, so it survives at any odds — verified at a budget of
  0.0001 ex. Rows only run out when every variant tried was unplannable, which is about the base and
  item level. The message says so rather than blaming the budget.
  Also: the prefix/suffix mod columns in both the Lab and the item builder were a bare `flex gap-4`
  that never stacked, crushing the mod text on a phone. Now `flex flex-col sm:flex-row`.

- **One essence modifier per item, and Lab support for perfect essences** (2026-08-22). Nothing capped
  the essence count: `fromItem.ts` built one `perfect-essence` op per perfect target, the MDP gave each
  its own action, and `optimize.ts` counted only `source: 'essence'` — so all three would plan an item
  carrying two essence modifiers, which the game forbids. `isEssenceMod` is now the single predicate
  they all count with. The Lab also lists perfect essences and plans them from white by sacrificing a
  placed mod and re-adding it with an Exalt. Fixed alongside: the perfect-essence path had **no
  item-level gate** at all (every such mod is ilvl 72).

- **Copy-audit rows 3, 4, 5, 6** (2026-08-22). The empty-frontier fallback no longer tells players the
  target is impossible; the two error headers name the planner; the from-item panel says which of its
  two cost models is the optimistic one. `FrontierView.test.tsx` pins the empty state.

- **Armour desecration in Item mode** (2026-08-22). The MDP gated every desecrate action behind a boss
  omen, so armour — 342 of 527 desecrated mods — reported `feasible: false` for a craft the game
  performs happily. `markovActions.ts` now offers the untargeted draw (weighted over the combined
  normal ∪ desecrated pool, mirroring `desecrationProbability`) on every base, with the boss variants
  layered on top only where the omen is legal. It also restores desecration for a player who has
  excluded every omen, which was broken on weapons too.

- Desecration empty state told players a legal filler → annul → Desecrate route was impossible (2026-08-22).
- Price line rendered as broken English when the sheet's caveat became a full sentence (2026-08-22).
- Boss omens gated to Weapon/Jewellery bases — they were being planned on armour, where the game
  refuses them (2026-08-22). The follow-on is the item above.
