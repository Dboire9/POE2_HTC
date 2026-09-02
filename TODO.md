# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-09-01 — sections 7–17 are that review; see the note above them.

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

- ~~**The MDP has no Essence action**~~ — **DONE 2026-08-28.** A regular Essence is now an action on
  the Magic rung beside the Regal: forces its mod, converts Magic → Rare, removes nothing, P=1. Both
  planners buy the same level by construction (`clamp(minTierIndex)`), which a test pins. See
  docs/validation.md, and note the shared level-pricing limitation recorded there.
- **The step planner still cannot express filler.** Interesting consequence: the MDP *can* — it rolls
  whatever lands and desecrates — so a lone desecrated target from white is feasible in one model and
  not the other. **Traced 2026-08-28 and the copy is FINE**: `FrontierView`'s empty-state says "Nothing
  this search tried worked … the craft may still be possible by a route the planner doesn't explore",
  which claims no impossibility and names no wrong cause. It could be *more* helpful — it could point
  at the policy graph, which does explore that route — but that is an improvement, not a correction,
  and it is not a copy-audit defect. Left alone deliberately.
- ~~**A lone essence target still throws in the LINEAR planner**~~ — **DONE 2026-08-29.**
  `frontierOrReason` in `solve.ts` mirrors `markovOrReason`, so the step planner declining a shape no
  longer removes the model's answer beside it. The planner's own sentence reaches the reader through
  `EngineResult.reason`. Teaching the linear planner to roll filler is still not done, and is still a
  step-vocabulary change rather than a bug.
- **Suite time.** Lab tests now run an MDP; keep an eye on it. (2026-08-23: `searchEffort.test.ts`
  was buying a 6-target from-white MDP to assert the STEP planner's orb depth — 209s and 134s for
  numbers it never read. It now calls `optimize` directly and keeps one `runSolve` case for the
  wiring. Full suite back to 23s.)

## 3. ~~Value iteration is still the whole cost of a from-white solve~~ — LARGELY CLOSED 2026-08-26

Partly addressed 2026-08-24: the stopping rule is scale-aware now (a thousandth of the craft's cheapest
action, not a flat 1e-9), worth a measured **1.77x** — interleaved, three reps, non-overlapping. Error
1.0e-3 relative and one-directional, so the number overstates a craft's cost and never flatters it.
See docs/validation.md for that and for three things tried and rejected on measurement (goal-first
sweep ordering, now re-tested against sweep COUNTS and closed for good; dropping the free restart's
zero-cost self-loop; a seed repair that repaired nothing).

**AND AGAIN, later on 2026-08-27 — with evaluation fixed, the SEED became the whole cost.** Phase B
fell to 1-2%; phase A (plain VI, computing the optimal push-forward value) is 92-98%.

`heuristicPolicy` + `evaluateClosedForm` replace it with a guessed proper policy — built, tested, and
left **opt-in (`heuristicSeed`) rather than default**, because it loses on the crafts that hurt:

| craft | states | two-phase | seeded | |
|---|---|---|---|---|
| 3 tgt T1 | 250 | 2.0s | **0.6s** | 3.22x faster |
| 4 tgt T2 | 312 | 4.5s | 4.1s | 1.09x |
| 5 tgt T2 | 1,166 | 34.4s | 28.0s | 1.23x |
| 6 tgt T2 | 3,963 | **264s** | 445s | **1.7x SLOWER**, both reps |

Skipping phase A starts policy iteration from a worse policy: small crafts converge in ≤20 rounds and
win, the big one needs enough extra rounds to lose badly. **A single before/after run said the big
craft was unaffected — it was not.** Only interleaved reps on a machine with a documented ~40% spread
showed it, which is the third time that spread has produced a wrong conclusion in this file.

**To make it shippable, the open problem is a principled switch**, not more tuning: something that
predicts which side of the crossover a craft falls on. State count is the obvious candidate (1,166
wins, 3,963 loses) but two points either side of a threshold is not a rule.

**The next lever, measured and NOT built: SCC decomposition of policy evaluation.** Under a fixed
policy the chain is 239 components over 312 states, 236 of them singletons, largest 69 — so
per-component direct solves would make evaluation exact in one ordered pass instead of Gauss-Seidel.
Largest SCC runs ~30% of states (92/250, 69/312, 363/1,166), a 0.3-48M-op dense solve. Left unbuilt
because evaluation is no longer the bottleneck; this is the right tool if it becomes one again.

**CLOSED FURTHER 2026-08-27 — the remaining cost was policy EVALUATION, and it is now closed form.**
Measured first: on hard crafts 99.6-99.8% of the time is the `solve` phase (the standing "VI is ~11%
of the work" note holds only for easy ones), and it is not the state count — 312 states took 83s, a
quarter-second per state. Varying only `tolerance` spanned 74.4s → 0.8s with the answer moving
4,753 → 35,417, so evaluation precision WAS the cost and could not simply be relaxed.

`evaluateClosedForm` solves the renewal instead of iterating it — `V(start) = c/(1−q)` over the
restart-absorbing chain, where restart states are terminal and are 98% of the lattice:

| craft | before | after |
|---|---|---|
| 3 targets T1 | 60.1s | **2.3s** |
| 4 targets T2 | 74.4s | **4.8s** |
| 6 targets T2 (5,300 states) | ~1,000s → ceiling | **292s, `bound: 'exact'`** |

Agreement with both iterated PI and VI within tolerance, plus the 100k-run MC cross-check.

**CLOSED 2026-08-26 by policy iteration, which this section correctly named as the only lever left.**
PI keeps the argmin VI throws away each sweep and alternates evaluate/improve, ending on a CERTIFICATE
— the policy stopped changing, so it is optimal — rather than a residual tolerance. Shipped as the
`Exhaustive` preset. Measured against VI at a 240s budget:

| craft | VI | PI |
|---|---|---|
| 2p+1s T1 | ceiling ≤14,588.62 | **exact 10,661.00** — VI was 37% high |
| 3p+1s T1 | ceiling ≤117,120.20 | **exact 93,204.10** — VI was 26% high |
| 3p+2s T1 | ceiling ≤466,194.87 | ceiling ≤391,689.89 — 16% tighter |

Where both converge they agree to **1e-6** (the licence for the swap) and PI runs **2-3.5x faster**.
End to end through `runSolve` on a 3-target T1 from white: Patient 138s, Exhaustive 73s, both 10,658.21.

Two things this did NOT close. The very hardest crafts still do not settle inside a preset's clock, so
the ceiling copy stays. And PI being faster everywhere makes it arguably the right DEFAULT — it is not,
only because `standard` is documented to reproduce the pre-setting behaviour exactly, and that promise
was judged worth more than the speedup. Revisit if that promise ever stops mattering.

**RESOLVED 2026-08-28 — it stopped mattering, and the measurement is what settled it.** Every preset
runs policy iteration now. Over 18 realistic crafts and 108 solves PI did not lose a single cell and
produced a ceiling ZERO times; at Patient's full 300s VI still returned a ceiling on 7 of 8 hard crafts
(up to 2.45x high) where PI was exact on 8 of 8. The promise survives where it was actually tested —
the orb search — and the MDP half changed deliberately, every move toward the exact answer. The ceiling
copy stays anyway: a truncated PI still yields `bound: 'upper'`, and `wand-6-T2` at Standard still
returns no number at all. See docs/validation.md.

Also closed here, from TODO 5: **`maxIters` is on the ladder** as `EffortLimits.maxSweeps`. It was a
hardcoded 100,000 the setting could not reach, so raising effort on a sweep-bound craft did nothing at
all — which is what a user reported, in exactly those words.

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

**CLOSED FOR GOOD 2026-08-28 — both remaining levers named above are dead, on measurement.**

*Policy iteration for phase A* cannot work: `evaluateClosedForm` is fast only because restart states are
absorbing and are 98% of the lattice, and phase A has no restart — so every phase-A policy plays forward
everywhere, which is the chain `heuristicPolicy`'s own comment records burning 5,000,000 sweeps and the
whole deadline. Evaluation there degenerates into the problem being solved.

*Prioritised sweeping* needs the residual to be LOCALISED, and it is not. Instrumenting phase A to count
states moving by more than `tol` per sweep: 99.8% of N at sweep 1 and still 99.2% at the halfway point on
a 4-target Wand (1,238 sweeps); 99.6% throughout on a 3-target Body Armour; 99.6% → 99.4% on a held Wand.
The count collapses only in the final two or three sweeps. A worklist would re-enqueue nearly everything
every round and pay predecessor bookkeeping for it. The same run found ZERO actions touching an
Infinity-pinned state, closing a third candidate too.

**What DID pay was the other axis — per-state work, which nothing had ever attacked.** 23-31% of the
actions the solver evaluates are exact duplicates of a cheaper sibling (a vacuous side omen, a strength
whose floor excludes nothing, a boss whose pool is the whole legal pool, a redundant Omen of Light).
`pusher` in `markovActions.ts` folds them at the push choke point: **1.18-1.51x** interleaved over six
crafts and 60 runs, with every craft returning exactly one `(cost, bound)` fold on and off. See
docs/validation.md.

Cheaper things to try first, both unmeasured:

- The `1000` divisor is a knee found on two crafts, not a law. Worth re-checking on a from-ITEM craft,
  where there is no phase B and the error lands differently.
- `maxIters` is 100,000 and irrelevant on crafts that converge in tens — but a craft that hits it burns
  the whole budget before the deadline check can stop it. A cheaper cap, or checking the clock more
  often than every 32 sweeps, may matter more than it looks.

## 4. ~~A Magic item can only be opened with a Regal — there is no Augment step~~ — DONE 2026-09-01

`fromItem.ts`'s openers now cover the whole add chain from a Magic start: Regal, Augmentation, and
Augmentation-then-Regal. An Augmentation fills a Magic item's second slot and leaves it Magic, drawing
from one side's pool where a Regal draws from both — likelier, and dearer for it (0.2699 against
0.1977).

**This section's stated reason was wrong on both halves.** It said "for a 2-mod target an Augmentation
(0.27ex) would be cheaper than a Regal": it is not, on this sheet. And the test pinning the gap used a
two-PREFIX target, which a Magic item cannot hold — so on that craft the Regal is required by a game
rule and no Augmentation could have helped. The gap was real; the example demonstrated something else.

**The rest of this section was STALE, and is now closed too.** It said "the MDP does not model a Magic
START as a distinct node", blocked on "the state key has no rarity" and "`stateLabel` would render
both identically". Both describe a design superseded when rarity entered the state: the key ends in a
rarity code (`0:0:0:0:0:1` for Magic against `:2` for Rare), and no `stateLabel` exists anywhere in the
repo. Verified 2026-09-01 — a Magic start solves exactly, over 397 states spanning the `magic` and
`rare` rungs, at 1,552.19 ex against the Rare item's 1,426.68.

The note survived a rewrite of this section because it was copied rather than checked. It is pinned by
tests now (`markovFromItem.test.ts`, "a Magic start is modelled, not approximated") rather than
described, which is the difference that would have caught it.

## 5. ~~The from-item step planner never varies orb strength~~ — DONE 2026-09-01

Closed by decomposing the axis rather than throttling it. `applyStep` reads only
`currency`/`remove`/`add`/`adds`/`essenceTier`, so orb strength and omens move a step's price and odds
and nothing else — the item trajectory is fixed by the SKELETON. That makes
`planExpectedCost` separable over the suffix product, and a backward DP (`leverDp.ts`) finds every
Pareto-optimal assignment exactly, subsuming `withOmenVariants`'s `2^k` power set on the way.
**3.3–3.5x faster on the big crafts while searching 192x more assignments**; up to **322x** better
success per attempt. Full measurement in `docs/validation.md`.

The throttle this section proposed would have been worse than slow: at the default `maxPlans` it picks
`strongest-only` on every craft big enough to need it, and that rung **drops base strength entirely**,
deleting the cheap end of the frontier rather than widening the search.

Three things came out of it that are NOT done:

### 5a. ~~`legalOrbTiers` suppresses the orb axis for any-tier targets~~ — DONE 2026-09-01

Fixed by 5b, which deleted `legalOrbTiers` outright. The from-white planner reported
`currencyDepth: 'full'` — rendered as "tried every orb strength" — on any-tier crafts where it had
tried exactly one, because `legalOrbTiers` read `tiers[minTierIndex].ilvl` (about 1 for an any-tier
target), found every strength floor above it, and returned `['base']`. A Greater orb is legal there: a
better tier still satisfies "any tier or better".

Measured consequence on live crafts: the cheapest plan for a 2-target any-tier craft fell **10.57 →
4.29 ex** and the surest rose **2.4x**. The reason it gets CHEAPER is worth remembering — on the live
sheet a Greater Transmute costs *less* than a plain one (0.1333 against 0.1775), so the stronger orb
was often strictly better and the search would not look at it.

### 5b. ~~Adopt the lever DP in the from-white planner~~ — DONE 2026-09-01

`paretoForOneCraft` now enumerates skeletons and hands them to `searchSkeletons`. **19-66x faster** on
tiered crafts, with cheaper plans where the old throttle had bitten (a 6-target T1 craft's cheapest
fell from 42.7 billion ex to 2.47 billion). Deleted: `orbAssignments`, `reduceOrbTiers`,
`legalOrbTiers`, `strengthUsable`, `ORB_TIERS`, `ADD_CURRENCIES`, `withOmenVariants`, the
`estimate`/depth ternary, and `maxPlans` from the effort ladder — 113 lines out of `optimize.ts`.

Both blockers named here turned out to be non-issues in practice: `essenceTier` stays resolved once per
craft by `cheapestEssenceLevel` and is part of the skeleton, and the alchemy openers simply became
extra skeletons.

What is still open, and is now the only orb-strength gap left:

- **`CurrencyDepth` has one reachable value.** Every planner reports `full`, so the badge always says
  "tried every orb strength" and `DEPTH_RANK`'s merge is a fold over a constant. The type is kept for
  now because deleting it touches `engineTypes`, `engineMap`, `FrontierView` and the alternatives
  merge; it is dead weight rather than a lie, so it is not urgent.

### 5c. ~~`planCostCdf` is 86% of a from-item alternatives run~~ — DONE 2026-09-01

Fixed by screening before settling: bracket every frontier plan cheaply, and skip the full sweep for
any whose ceiling sits below a rival's settled floor. **3.4-3.7x** on 3-target crafts, 1.8x on
4-target, with byte-identical rows. `bestByBudget` (`alternatives.ts`) owns the rule.

**The diagnosis in the first draft of this entry was wrong and is worth recording as such.** It said
`exactQuantum` fails on the live sheet because the prices are not commensurable at ≤6 dp. Measured:
it succeeds, returning **0.001 at d=3**. What actually happens is that `budget / quantum` is then
**5,000,000 cells** at a 5,000 ex budget — 25x over `DEFAULT_COST_CELLS` — so `exact` is false because
of the CAP, not because of the prices. Two different bugs with the same symptom, and only one of them
was real.

The obvious follow-on — just lower `DEFAULT_COST_CELLS` — was also measured, and it does not work.
The bracket has to be narrow enough that `fmtPct(lower)` and `fmtPct(upper)` render the SAME string,
or the panel shows a range like "1.2%-1.3%" instead of a number. On live plans:

| cells | bracket width | renders as |
|---|---|---|
| 200,000 | 3e-6 to 4e-5 | one number |
| 50,000 | 2e-5 to 1.6e-4 | a range on some rows |
| 20,000 | 5e-5 to 3.9e-4 | a range on some rows |
| 2,000 | 5e-4 to 2.3e-2 | a wide range |

So 200,000 is well chosen for the number the app prints; the waste was never the cell count, it was
running the full sweep on plans that could not win. Left open: whether a coarser-but-still-exact
quantum exists for this sheet, which would make the settle cheap as well as rare.

### 5d. ~~The MDP models Chaos at base strength only~~ — BUILT, MEASURED, REVERTED 2026-09-01

`markovActions.ts` has `{ currency: 'chaos' }` with no `strength`, where exalt/transmute/augment/regal
all carry one. The axis was added — `McAction`, `pricedStepOf`, `chaosOutcomes` taking a floor,
`strengthsFor('chaos')`, plus the `costConsistency` pairs and the exclusion keys — and then reverted on
the measurement.

Interleaved, medians of 3, six crafts (2 and 3 targets, any/T3/T1, two held junk mods):

| craft | axis off | axis on | | answer |
|---|---|---|---|---|
| 3 tgt T1 | 1,778 ms | 2,690 ms | **0.66x** | identical, 164,682.69 exact |
| 3 tgt T3 | 689 ms | 961 ms | 0.72x | identical, 28,377.16 exact |
| 3 tgt any | 131 ms | 182 ms | 0.72x | identical, 2,684.76 exact |
| 2 tgt T1 | 213 ms | 289 ms | 0.74x | identical, 19,362.79 exact |
| 2 tgt any | 39 ms | 47 ms | 0.83x | identical, 904.15 exact |

**1.2-1.5x the solve time, zero change to any answer.** The MDP is the app's slowest component and its
headline number, so slower means more crafts return a ceiling instead of an exact cost at a given
effort — a real loss, traded for a benefit that measured exactly zero.

The prices say why: a Greater Chaos is 2.95x the price of a plain one for at most ~2.6x the odds, and a
Perfect is 61.6x for at most ~4.5x. The model was paying to prove what the sheet already implies.

**Revisit if the prices move**, since it is the prices and not the mechanics that decide it — the axis
is mechanically correct and the engine has always honoured it. Two things make that cheap: the pricing
half already shipped (`currencyKey` handles `chaos_greater`/`chaos_perfect`), and `costConsistency.test.ts`
carries the reasoning beside the pair that would need adding back.

Two useful findings survive the revert. The exclusion test had to grow `chaos_greater`/`chaos_perfect`
to keep passing — a reminder that a strength axis is also an exclusion surface, and that "exclude
chaos" stops meaning "exclude every chaos" the moment one exists. And `pusher` folds only IDENTICAL
distributions, so it could not absorb strengths that differ in distribution but lose on price; a
dominance rule over distributions would be the principled fix, and there is no cheap one.

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

- ~~**tailwind-merge at 8.8%**~~ — **AUDITED 2026-09-01, KEEP IT.** `cn()` has exactly three call
  sites (`badge.tsx`, `button.tsx`, `PolicyGraph.tsx`), and **two of them depend on conflict
  resolution**, so `clsx` alone would not do:
  - `<Badge variant="outline" className="border-amber-500/60 …">` — the "stopped early" badge. The
    outline variant supplies `border-input`; both are border-COLOUR utilities.
  - `<Badge className="text-[10px]">` — against the base's `text-xs`. Both are font sizes.

  "Order the classes correctly" is not a fix: both members of each pair land in the stylesheet at the
  same specificity, so the winner is decided by TAILWIND'S output order, not by the `class` attribute.
  Dropping the loser is the only reliable way to make the caller's intent win. `src/lib/utils.test.ts`
  pins this with the real class strings, so the audit does not need re-running and a swap fails the
  suite.
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

---

# Review of 2026-09-01 — where the project stands, and what to do next

> Written by Claude Fable 5.1 after a full pass over the repo, the docs, the data pipeline, CI, and the
> deployed site, for Claude Opus 5 (or anyone) to execute from in later sessions. Each section is meant
> to be self-contained: what to do, WHY it matters more than the alternatives, how to verify it, and what
> NOT to do while there. Where a claim rests on a measurement it is stated with the number; where it
> rests on judgement it says so.
>
> **The one-line verdict: the engine has outrun the product around it.** The solver is exact, fast, and
> unusually honest about what it does not know. The README describes a Windows installer removed in
> August, the user guide explains a Java beam search that no longer exists, and no automated test has
> loaded the app in a real browser. The last 120 commits went almost entirely into the engine. The next
> week should go almost entirely into everything else — not because the engine work was wrong, but
> because it is done, and the surface a player touches first has been drifting for a month.
>
> Sections 7–9 are a day of work in total and should come before anything else. 10–12 are real product
> gaps of a few days each. 13–16 are larger and worth planning rather than starting. 17 records what was
> considered and deliberately rejected, so it is not re-proposed.
>
> **Update 2026-09-01, same day: 7, 8 and 9 are DONE.** Their sections are kept in full rather than
> deleted, because each records why the work was scoped the way it was and what NOT to do next time —
> see the closing note under each. **§10 (Playwright smoke tests) is now the first open item**, and it
> is where the verdict above still bites: nothing that ships has been seen in a browser by anything
> but a person.

---

## 7. ~~The public docs describe a retired app~~ — DONE 2026-09-01

**What is wrong.** `README.md` and `docs/USER_GUIDE.md` describe the application as it was in July: an
Electron desktop app with a Windows installer, an auto-updater, and a Java beam-search backend. All of
that is gone. A player who finds the project on GitHub — which is how most players will find it — reads
about a different app than the one at poe2htc.com, and the first thing they are told to do (download an
`.exe`) is impossible.

The specific lines, so the fix is a checklist rather than a hunt:

**`README.md`**
- Line 9 — the Platform badge says `Windows | Linux`. The app is a web page. Drop the badge or make it
  say "Web".
- Lines 69–82 — the entire **Desktop Application** section: "Download the installer", the `.exe`
  filename, the code-signing warning, "The installer includes everything you need!". Delete it. The
  Linux/macOS subsection that follows is really "run from source" and should be titled that.
- Line 199 — `[x] Auto-update system`. Removed with Electron on 2026-08-22. Delete.
- Line 200 — `[x] Multi-platform support (Windows, Linux)`. Same. Delete.
- Line 205 — `[ ] Add crafting cost estimation` is on the roadmap as NOT DONE. It is the headline
  feature: the MDP's true expected cost, the Pareto frontier's expected cost, live poe.ninja prices.
  Move it to Completed, and say what it actually is.
- The Features list (lines 56–61) does not mention the MDP at all — the one thing no other PoE2 tool
  does. "True expected cost from an optimal policy that recovers in place after a bad roll" belongs
  at the top of that list, not absent from it.
- The Known Issues line ("Some rare edge cases with essence combinations may not be fully optimized")
  is vague to the point of meaninglessness. Either name the real known limits — the step planner
  cannot express "roll filler and remove it"; the desecrated spawn weight is measured from 40 bones —
  or link to `docs/copy-audit.md`, which is the honest inventory.

**`docs/USER_GUIDE.md`** — this one is worse, because it describes the retired ALGORITHM, and a reader
who trusts it will misunderstand every number the app shows them:
- Lines 19–20 — the installer again.
- Line 34 — `http://localhost:5173` as "first launch". That is the dev server.
- Line 233 — "Click the **Start Simulation** button". There is no simulation; the engine is analytic.
  The button says Compute.
- Lines 241–245 — "Explores millions of possible crafting sequences … Returns the top 10-20 most
  efficient paths". This describes the Java beam search. The current engine evaluates plans exactly
  and returns a Pareto frontier — the whole point of `docs/ALGORITHM.md`, which the guide contradicts.
- Line 251 and 425 — "lower the threshold in settings". There is no threshold setting. There is a
  Search-effort preset, and it does the opposite of what "threshold" implies.
- Line 274 — "Expected Transmutes: ~4.2 million". Costs are in exalt-equivalents on a unit ladder,
  from a live price sheet. The guide never mentions prices at all.
- Lines 353–360 — "Dextral Omen: Removes 1 suffix when used with essence". That is not what a Dextral
  omen does in this app or in the game as modelled here (Dextral Exaltation constrains an Exalt to the
  suffix side; Dextral Annulment constrains an Annulment; Dextral Crystallisation constrains a Perfect
  Essence's removal). A player following this tip would buy the wrong omen.
- Lines 456, 462 — "Server error", "Restart the application". There is no server and no application
  to restart.
- The guide never mentions: the Item tab, the true expected cost, the policy graph, "≥ x" / "≤ x"
  bounds, Search effort, currency exclusions, share links, or the price basis note. That is most of the
  product.

**Why this outranks every engine item.** The engine's rigour is invisible if the front door says
something false. And this project's standing rule — never state something about the game or the
planner that has not been traced — is being broken by its own README, which is the most-read text it
has.

**How to do it.** Rewrite rather than patch. The USER_GUIDE in particular should be rebuilt from the
current UI: Lab tab (from white), Item tab (from what you hold), what each panel means, what the bound
markers mean, what Search effort trades. Screenshots are Dorian's to take (they need a browser); the
text can be written from the components. Keep `docs/ALGORITHM.md` as the technical companion — it IS
current, and is the model for how the others should read. Delete `docs/DOWNLOAD.md` or leave it as the
one-line "nothing to download" it already is.

**Verify.** `grep -nE "Electron|installer|\.exe|auto-update|Start Simulation|threshold|beam|Java"
README.md docs/USER_GUIDE.md` returns nothing. Every feature the app has is named in the README's
Features list. The roadmap contains nothing that already ships.

**Do not** touch `docs/ABOUT.md`'s past-tense history of the Java era — that is deliberate and accurate
(see CLAUDE.md, "Java-retirement doc debt"). The problem is present-tense claims, not history.

**DONE 2026-09-01** (`b47e38a`). Both files rewritten rather than patched. The `grep` in *Verify*
returns only past-tense Java mentions, which are deliberate. Three claims written from the components
turned out to be wrong about the components and were corrected before landing: the exclusions control
is labelled **"Currency I don't have"** and ticking members NARROWS the exclusion rather than widening
it; **Copy link carries neither Search effort nor currency exclusions** (both are localStorage, and the
guide now explains why that split is right — they describe your machine and your stash, not the craft);
and **Report a problem builds a copyable block**, it does not file an issue. Screenshots are still
absent and still Dorian's to take. `docs/DOWNLOAD.md` was already accurate and was left alone.
---

## 8. ~~Prices should refresh themselves~~ — DONE 2026-09-01

**What is wrong.** `data/patches/0.5.0/prices.json` was last updated 2026-08-22 — ten days before this
review. poe.ninja confirms "Runes of Aldur" is still the live league, so the data is not WRONG, but a
PoE economy moves: early in a league the chaos-to-exalt ratio can shift 2x in a week, and this optimizer
ranks plans by cost, so a stale relative price changes WHICH route it recommends, not just the total on
it (CLAUDE.md, "Prices"). The refresh (`npm run update-prices`) exists, works, and depends on someone
remembering.

**How to do it.** A GitHub Actions workflow on a weekly `schedule` (plus `workflow_dispatch`) that runs
`node tools/refresh/prices.mjs`, and if `prices.json` changed, opens a pull request with the script's
own console output as the body — it already prints every price that moved and by what factor, which is
exactly the review a human wants to see. Use a bot-created PR rather than a direct push so a bad feed
(poe.ninja down, a renamed currency id) cannot silently ship; CI runs on the PR and `priceResolution.test.ts`
plus `costConsistency.test.ts` guard the shape.

Concretely:
- `.github/workflows/refresh-prices.yml`, `permissions: contents: write, pull-requests: write`, on
  `schedule: cron '0 6 * * 1'` (Monday 06:00 UTC) and `workflow_dispatch`.
- Steps: checkout, setup-node 20, `npm ci`, `node tools/refresh/prices.mjs`, then
  `peter-evans/create-pull-request` (or `gh pr create` with a diff check) with the captured stdout as
  body and a fixed branch name so re-runs update one PR rather than piling up.
- The script already defaults `--league` to the first entry of poe.ninja's `/leagues` endpoint
  (`prices.mjs:181`), so a league change needs no code change — but it means the bot will silently
  switch leagues the week a new one starts, and the first PR after a league launch will show every
  price moving 5–50x. That is correct behaviour and the PR body will make it obvious; just do not
  auto-merge.

**Two things to preserve.** `omenQuotes` are hand-transcribed (poe.ninja has no omen endpoint —
`type=Omens` returns byte-identical output to an invalid type; see CLAUDE.md "Prices") and the script
already warns when they are over 30 days old. The PR body should carry that warning prominently, since
it is the one part of the refresh a bot cannot do. And `caveat` must stay a complete sentence
(`PriceBasisNote` renders it) — the script already ensures this; the test `priceResolution.test.ts`
should be checked to pin it if it does not.

**Verify.** Run the workflow by hand via `workflow_dispatch`; a PR appears with a diff confined to
`prices.json` and a body listing the moved prices. Merge it; the live site's `PriceBasisNote` shows the
new `updated` date.

**Do not** fetch prices at runtime from the browser. poe.ninja sends no CORS header and their docs ask
clients not to call the API directly; the committed-snapshot design is right (the header comment in
`prices.mjs` explains it). Automate the snapshot, do not replace it.

**DONE 2026-09-01** (`3d8bc5e`). `.github/workflows/refresh-prices.yml`, **daily at 06:00 UTC** plus
`workflow_dispatch`. (The plan above said weekly; daily was chosen on 2026-09-01 after costing it. One
run is FOUR poe.ninja requests — `/leagues` plus three overviews — from one runner, so daily moves 4
requests where the committed-snapshot design already saves thousands: a player never calls poe.ninja at
all, which is the thing they actually ask for. It is self-throttling on the review side too: no price
movement means no PR, and the fixed branch means daily refreshes ONE PR rather than stacking seven,
with the diff always against the default branch so a reviewer reads "since the last merge".) A dry run while writing it found **18 prices already moved** since the 2026-08-22
sheet, so the premise was live rather than theoretical. Three departures from the plan above, each for
a reason worth keeping: (1) the shape tests run in the REFRESH JOB, not on the PR — a PR opened with
the built-in `GITHUB_TOKEN` does not trigger workflows, so "CI will catch it on the PR" would have
opened a PR nothing had checked, and doing it this way needs no PAT; (2) `gh pr create` rather than
`peter-evans/create-pull-request` — `gh` is already on the runner, and this repo runs CodeQL, so adding
a third-party action to touch the file the whole cost model rests on is a poor trade for twenty lines;
(3) the dispatch input reaches bash through `env`, never `${{ }}` inline, which would be a script
injection.

**First scheduled run, 2026-09-02: it FAILED, at its own guard, and the cause is worth keeping.**
`priceResolution.test.ts` asserted `amulet / wand > 10` — the spread between the jewellery bone and
the weapon bone. Every assertion about RESOLUTION passed (each base charges its own bone); the ratio
came back 6.82 because the market moved, and held an otherwise-good refresh. A magnitude pinned from a
market snapshot is harmless in an ordinary test and actively wrong inside the gate the automation
depends on, because freezing that file is not an option — it IS the guard. The file now splits: live
assertions state what the CODE does (this base resolves to that bone), frozen ones state why it was
worth doing (the bones span 10x). Mutation-checked — a flat-bone regression still turns three tests
red. The same treatment was applied to the Greater-essence spread assertion, which was the next one
due to fail.

**Two things to know before the first run.** `gh pr create` under the built-in token needs
**Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"**, which is
OFF by default — without it every step runs and the last one fails. And the re-run lookup must ask for
OPEN pull requests only (`gh pr list --head … --state open`): `gh pr view "$branch"` prefers an open PR
but FALLS BACK to a merged one, so the week after the first refresh was merged it would have taken the
edit path, retitled the merged PR, and never opened another — the automation stopping after exactly one
use, silently. Caught on re-reading, before the workflow had ever run. The omenQuotes staleness warning is lifted into a GitHub warning callout at the top of the
PR body, and the body says not to auto-merge and why.
---

## 9. ~~A linter, and manifest hygiene~~ — DONE 2026-09-01

**What is wrong.** There is no ESLint (or Biome, or anything) — only `.editorconfig`. `tsc` catches type
errors and nothing else: not unused imports, not accidental `any` in tests, not `console.log` left in
source, not inconsistent import ordering. With 114 of the last 120 commits AI-assisted, the drift that
lint catches is exactly the drift this codebase will accumulate — today's work removed unused imports
by hand after each edit because nothing else would have.

Also: `@testing-library/dom` is in `dependencies` rather than `devDependencies` (`package.json:30`).
Harmless — Vite tree-shakes it — but it is a sign the manifest has not been read in a while, and it
makes `npm audit --omit=dev` lie about the production surface.

**How to do it.**
- `npm i -D eslint typescript-eslint @eslint/js eslint-plugin-react-hooks` and a flat
  `eslint.config.js` using `tseslint.configs.strictTypeChecked` for `packages/**` and
  `recommendedTypeChecked` for `src/**` (the packages already run under stricter tsconfigs; lint
  should match). Enable `react-hooks/rules-of-hooks` and `exhaustive-deps` for `src/`.
- Add `"lint": "eslint ."` to scripts and a **Lint** step to `.github/workflows/ci.yml` after the
  type-checks. Also to `.claude/skills/ship` so the local verify chain matches CI.
- Move `@testing-library/dom` to `devDependencies`. Check nothing else is misplaced while there:
  `class-variance-authority`, `clsx` and `tailwind-merge` are in devDependencies but are runtime
  imports (one source file each) — that only works because Vite bundles them; it is wrong by
  convention and will confuse the next person who reads the manifest. Either move them or add a
  one-line comment saying why. And `lucide-react` is in devDependencies and **imported by nothing**
  (verified 2026-09-01: zero non-test files) — remove it, and let the lint's unused-import rule be
  what catches the next one.
- Expect a first run to flag real things. Fix them in a separate commit from the config, so the config
  commit is reviewable on its own.

**Verify.** `npm run lint` is green locally and in CI. `npm audit --omit=dev` reports the actual
production dependency set.

**Do not** add Prettier in the same pass. The codebase has a consistent hand style (the long doc
comments, the wrapped conditionals); reformatting 20,000 lines in one commit destroys `git blame` for
every file at once. If formatting is wanted later, do it file-by-file as files are touched.

**DONE 2026-09-01** (`c3b3cde` config + manifest, then the fixes). `npm run lint` is green, in CI
after the type-checks, and in the ship skill.

**The first run paid for the install immediately, in a way worth recording.** It reported 157
"unnecessary" non-null assertions in `src/` — unnecessary only because the ROOT tsconfig lacked
`noUncheckedIndexedAccess`. The code had always written `arr[0]!` as though the flag were on, matching
the packages. So the root project was a notch looser than the code assumed: paying the stricter
setting's cost without its protection. Turning it on cost **zero** errors and dropped the finding count
274 → 85. `exactOptionalPropertyTypes` is the remaining gap (8 errors, all React prop spreading) and is
NOT done — a good small follow-up.

**Do not clear findings with a blanket `--fix`.** It produced two wrong changes here. It deleted the
parameter defaults from the `StateEncoder` returned by `encoderFor` (`markovSymmetry.ts`) — `keepClass`
calls that with four arguments, so keys would have become `…:undefined:undefined`, stopped matching
`encodeState`, and disabled symmetry reduction **silently** rather than failing. And it stripped `mod!`
from `shipped-pools.test.ts`, which the engine's stricter tsconfig requires (`expect(x).toBeDefined()`
is not a type predicate). Both are now pinned with a disable comment carrying the reason.

Beyond the config, the fixes were real: 13 dead imports and variables removed; 7 `eslint-disable`
comments for `import/first`, a rule this repo never had a plugin for, deleted; `Response.json()`'s
`any` named at the boundary (`ModsFile` / `BasesFile` / `PricesFile`) so a data refresh that changed a
shape would now fail the type-check; `new Array(N)` given its element type in the MDP's three hot
allocations; two async click handlers made explicitly fire-and-forget; and `useField`'s setter wrapped
in `useCallback` — it was a fresh closure every render, which made it a **lying dependency**: any
caller that listed it, as `exhaustive-deps` asks, would re-run its effect on every render, and the
effects holding it are the ones that load the engine. Memoising is unconditionally safe there because
the closure captures nothing render-scoped; it reads `getWorkspace()` live by design.

Manifest: `lucide-react` removed (imported by nothing), `@testing-library/dom` moved to
devDependencies, `class-variance-authority`/`clsx`/`tailwind-merge` moved to dependencies where their
runtime imports say they belong, and a pre-existing high-severity `browserslist` advisory fixed.
`npm audit --omit=dev` now reports zero. Prettier was **not** added, per the note above.
---

## 10. ~~Browser smoke tests~~ — DONE 2026-09-02

**What is wrong.** 1,262 tests, all under jsdom. Zero run in a real browser. `docs/validation.md`'s
"Still deferred" says it in its own words: *"Nothing shipped since 2026-08-21 has been seen in a
browser."* jsdom has no layout engine, no Web Worker, no real `fetch`, no CSP enforcement, and cannot
tell you whether the 3.1 MB `mods.json` preload actually fires. The whole class of bug that ships as
"the page loads but nothing happens" is invisible to this suite, and on 2026-09-01 the numbers the Lab
tab shows changed by orders of magnitude (a 6-target T1 craft went 42.7bn → 2.47bn ex) with nothing
but jsdom confirming the panel still renders them.

**How to do it.** Playwright, not Cypress (it drives Chromium/Firefox/WebKit from one runner and has
first-class Worker support). Five tests, no more to start:

1. **Cold load.** Navigate to `/`, wait for the base picker to be enabled. Assert no console errors and
   no CSP violations (`page.on('console')`, `page.on('pageerror')`). This alone catches a broken
   preload, a bad CSP header, or a Worker that fails to construct.
2. **Lab compute.** Pick Wands, add one prefix and one suffix at any tier, click Compute, wait for the
   frontier to show a row with a cost. Assert the "checked N plans" line renders a number > 0 and the
   true-expected-cost panel shows a value. This is the whole product working end to end in the Worker.
3. **Item compute.** Item tab, build a Rare with one mod, target one more, Compute, assert a policy
   graph or route renders.
4. **Share link round-trip.** Build a workspace, click Share, navigate to the copied URL in a fresh
   context, assert the same targets are restored.
5. **Mobile viewport.** Test 2 again at 390×844. Assert the mod columns stacked (the
   `flex-col sm:flex-row` fix from 2026-08-22 has never been verified by anything) and nothing overflows
   horizontally (`document.documentElement.scrollWidth <= window.innerWidth`).

Run against `vite preview` of a production build, not the dev server — the dev server has no CSP
header and different chunking, so it would pass where production fails. In CI, add it as a job after
Build that installs Playwright's Chromium only (`npx playwright install chromium --with-deps`) to keep
it under two minutes.

**Verify.** All five green in CI. Then break something deliberately — remove `worker-src 'self'` from
`vercel.json`'s CSP — and confirm test 1 or 2 goes red. If neither does, the tests are not testing what
they claim. (The CSP lives in `vercel.json`, which `vite preview` does not read; the smoke suite should
serve `dist/` behind a tiny static server that sets the same headers — or read them from `vercel.json`
so they cannot drift.)

**Do not** try to assert on specific cost values. They change with the price sheet and with every
solver improvement; the smoke suite asserts that a number APPEARS, not what it is. Correctness of the
number is the unit suite's job, and it does that well.

**DONE 2026-09-02.** All five as specified, green, in CI after Build (Chromium only). `npm run test:e2e`.

**The verification step's own mutation does not work, and that is worth knowing before someone repeats
it.** This section says to remove `worker-src 'self'` and confirm a test goes red. Removing it breaks
NOTHING — `worker-src` falls back through `child-src` to `script-src 'self'`, which is present — so the
app kept solving and only the literal header assertion failed, which is a tautology, not coverage. The
mutation that actually proves the suite works is `worker-src 'none'`: that forbids the solver outright
and takes **four of the five** tests down, three of them behaviourally (the compute never renders and
times out at 60s). Done, and the suite passes again with the CSP restored.

**The harness needed two fixes the plan could not have predicted, both found by running it.** The
parenthetical about serving `dist/` behind a header-faithful server was right and is done —
`e2e/serve-dist.mjs` READS the headers out of `vercel.json` so they cannot drift. But (1) a naive SPA
fallback served `index.html` for any missing path, so a request for a missing `.js` came back as HTML
and Chromium's MIME refusal appeared as a console error in the very test that asserts there are none;
it now 404s anything with an extension, like a real static host. And (2) Vercel Analytics fetches
`/_vercel/insights/script.js`, which the PLATFORM serves and a local `dist/` does not have — so the
server stubs it. Filtering that error out in the test was the alternative and is worse: an exception
list is where a real error eventually hides.

**Selectors, for whoever extends this.** The Lab adds a target with an `Add …` button; the Item tab
adds one from a `<select>` labelled "Add a target mod", and its `Add …` buttons build the item you
HOLD. An unscoped `.first()` hits the wrong one and leaves `Compute plan` disabled on "Pick at least
one target mod above" — a failure that looks like a broken button and is really a mis-aimed click.

Deliberately NOT done, per the section's own instruction: no assertion anywhere on a cost VALUE. With
the price sheet now refreshing daily that would have been a guaranteed false red — which is exactly
what broke the refresh automation on its first run (see 8).

---

## 11. ~~Belts~~ — DONE 2026-09-02

**What is wrong.** The shipped data has 41 bases across 19 categories and **no belts**, a core rare
slot every player crafts. The README roadmap has had "Belt item type support" open for months. Also
absent: Charms and Jewels (Jewels are arguably out of scope — different crafting model — but Charms are
ordinary rares).

**Why it is cheaper than it looks.** The upstream data is already on disk. `tools/refresh/cache/
repoe_base_items.json` contains **20 belt bases** (and 9 jewels). They are missing from the app
because `CATEGORY_CLASS` in `tools/refresh/refresh.mjs` (line 38) and `apply_pools.mjs` (line 64) —
the maps from our category names to RePoE item classes — simply do not have a `Belts: 'Belts'` entry.
Nothing filters belts out; they were never mapped in.

**How to do it.**
- Add `Belts: 'Belts'` to both `CATEGORY_CLASS` maps. Check whether belts count as "Jewellery" for the
  boss-omen rule (`bossOmenAllowed` in `packages/engine/src/probability.ts` — the omens read "Weapon or
  Jewellery"; CLAUDE.md lists amulets/rings/belts as the collarbone group, so belts ARE jewellery for
  desecration and the collarbone applies).
- Belts need a poe2db class page cached under `tools/refresh/cache/poe2db/` for spawn weights
  (`run.sh` says pages are "fetched once; re-fetch by deleting them"). Fetch `https://poe2db.tw/us/Belts`
  the same way the others were.
- Run `./tools/refresh/run.sh`, inspect `docs/refresh-0.5.0-diff.md`, and check `shipped-pools.test.ts`
  and `dataIntegrity.test.ts` still pass — they pin pool shapes and will say if a belt base came out
  malformed.
- Cross-check ONE belt's weights against craftofexile.com the way Wands/Rings/Amulets were
  (`scripts/coe-verify.mts`), and record the result in `docs/validation.md`. Belts have a small pool;
  it is a quick check.
- Then do Charms the same way if the RePoE dump has them (`grep -i charm` the cache).

**Verify.** Belts appear in `BaseSelect`; a two-mod belt craft computes on both tabs; the CoE
cross-check matches; the 41 → 61 base count is reflected wherever it is asserted (`grep -rn "41"
packages/engine/src/*.test.ts` to find any pinned count).

**Do not** add Jewels in the same pass. Jewels have no prefix/suffix cap of 3+3, cannot be Regal'd
the same way, and have their own mod pool structure. They would need their own validation, and
possibly their own `perSideCap`. Separate item, if ever.

**DONE 2026-09-02.** 41 bases → 42. Belts plan on both models: the step planner returns a 3-row
frontier (transmute → augment) and the MDP returns `bound: 'exact'` at 7.99ex on a 2-mod craft.

**ONE belt base, not 20, and that is what the data says.** All 20 share a byte-identical craftable
pool — 166 mods, the same `mod → tier → ilvl` map across all three tag groups. They differ only in
`drop_level` and in their IMPLICIT, which is fixed on the base rather than rolled, so nothing this app
models can touch it. Twenty rows would be twenty identical crafts, four of them sharing the name
"Runemastered Heavy Belt". This matches how Amulets and Rings already ship; only the armour slots
carry several bases, because there Str/Dex/Int genuinely changes the pool.

**Three corrections to the plan above, each of which would have cost time.**

1. **THREE category maps, not two.** `apply_weights.mjs` has its own copy, and missing it fails
   silently in the worst way: the pipeline completes, belts appear, and one line mid-log —
   `bases with NO poe2db page: Belts->undefined` — is the only sign that every belt weight defaulted.
   Coverage went 97.9% → 100.0% once it was added.
2. **Adding the map entry alone does nothing**, because `refresh.mjs:159` iterates
   `baseline.items` — the 0.5 Java baseline, which has no belts. But the loop reads only
   `id`/`name`/`category` (pools are rebuilt from RePoE), so the baseline is a ROSTER: `EXTRA_BASES`
   extends it without editing the frozen differential anchor.
3. **`BONE_BY_CATEGORY` had no `Belts` entry** despite its comment reading "Amulet, Ring or Belt".
   The fallthrough is `?? 'rib'`, so a belt would have been charged the armour bone (0.41ex against
   the collarbone's 4.69ex, ~11x under) and — since `bossOmenAllowed` is "not rib" — silently refused
   boss omens the game allows. Fixed. A comment is not a mapping.

`pickVariant` needed no change: `runeforged`, `not_for_sale` and `demigods` were already in
`SPECIALIZER`, and those are exactly the three tags separating the belt groups, so it picked
`[belt,default]` unaided.

`dataIntegrity`'s family/side ratchet caught two new violations, both instances of patterns already
baselined rather than anything new — `Desecrated_Thorns` / `_2` spanning sides (the
`CompanionDamage on Bows` shape) and a desecrated/perfect-essence pair on opposite sides. Baselined
with that reasoning recorded.

**STILL OUTSTANDING: the CoE cross-check.** Craft of Exile is client-rendered and the harness
(`scripts/coe-verify.mts`) takes hand-entered numbers, so this one needs a browser and is Dorian's,
like the screenshots. The weight table is in `docs/validation.md` ready to compare. Internal
consistency is a good sign meanwhile: Chaos Resistance sits at 250 against 1000 for each elemental
resist, the same ~1:4 ratio Rings shows (1500 against 8000).

**Charms and Jewels are NOT done, and charms are less trivial than this section assumed.** Charms are
in the dump (13 bases, one shared pool, 4 prefix + 5 suffix families) but are tagged
`utility_flask,flask,default` — flasks — and this model assumes the 3-prefix/3-suffix rare
(`perSideCap` is keyed by RARITY, with no category axis). Whether that cap holds for a charm is
untraced, so adding them would be asserting a mechanic rather than reading one.

---

## 12. ~~Omen of Whittling~~ — MECHANIC SHIPPED, DORMANT UNTIL PRICED (2026-09-02)

**What is wrong.** The Omen of Whittling makes an Orb of Annulment remove the **lowest-tier** modifier
on the item instead of a random one. It is arguably the most-used crafting omen in PoE2 for the
exalt-slam loop (slam, whittle the junk off, slam again), and the app does not model it at all — it is
not even in `prices.json`'s `omenQuotes`, so it would need hand-transcribing from
`https://poe.ninja/poe2/economy/runesofaldur/omens` like the other thirteen.

**The easy half — the step planner.** For a fixed sequence the item's mods and their tiers are known at
every step, so "remove the lowest-tier mod" is a DETERMINISTIC removal: P = 1 if the mod the plan names
is the unique lowest, 0 otherwise (ties would need the game's tiebreak rule — find it before modelling
it; if it is random among ties, P = 1/k). That is a new `AnnulOmen` value (`'whittling'`) in
`packages/engine/src/probability.ts`, a branch in `annulProbability`, a price key in `stepOmenIds`
(`cost.ts`), and a lever in `withOmen` (`levers.ts`) — the DP handles the rest for free, since a
Whittling annul changes odds and price but not what happens next (it removes the mod the skeleton
names, as every annul does), so the invariant `levers.test.ts` pins holds.

**One prerequisite, and it is a real one.** `PlacedMod.tierName` is honest for the item a player
HOLDS — `buildItemState` (engineMap) writes the tier the player picked, and the MDP's `classifyStart`
(`markovState.ts:373`) reads it. But for every mod a plan ADDS mid-sequence, `addMod` (`plan.ts:166`)
places it at `tierIndex 0` regardless of the step's `minTierIndex`, so after the first add the walked
item's tiers are fiction. Whittling is the first mechanic whose probability depends on those tiers, so
`applyStep` has to start placing an added mod at the tier the step asks for (`minTierIndex`), and the
2026-09-01 design review's note that the tier "is cosmetic for probability purposes" stops being true
the moment this ships. Pin that with a test BEFORE adding the omen: walk a two-add plan, assert the
placed tiers match the steps' `minTierIndex`.

**The hard half — the MDP.** `McState` is `(present, blocked, jp, js, flagged, rarity)`. It knows WHICH
targets are present and HOW MANY junk mods sit on each side. **It does not know any mod's tier.** So
"remove the lowest-tier mod" has no meaning in the state space — the model cannot tell whether the
lowest-tier mod is a target or junk, which is the entire question Whittling answers. Making it work
needs either a tier axis on the state (blows up the lattice; every junk mod would need a tier bucket)
or an approximation ("Whittling removes junk with probability p_junk, estimated from the pool"), which
is exactly the kind of guess this project has refused to make elsewhere.

**Recommendation.** Ship the step-planner half, and say in the UI that the true-cost model does not
play Whittling. That is honest, it gives the player the recipe-level answer they most often want
("slam, whittle, slam — what are the odds?"), and it leaves the MDP's numbers as a documented
lower-bound-ish comparison rather than silently wrong. Record the MDP gap in this file as its own item,
with the state-axis cost measured before anyone builds it (a tier bucket per junk mod is the same shape
as the `flagged` axis, which cost ~5x solve time — see §3).

**Verify.** Hand-computed test on the synthetic fixture: a 3-mod Rare with tiers T1/T3/T5, target the
T1 and T3, plan `annul(T5) with whittling` — P must be 1, and P for `annul(T3) with whittling` must be
0. Then on live data: a craft where Whittling beats a plain Annulment appears on the frontier at the
omen's price.

**Do not** model it as "Whittling removes the lowest tier among JUNK". The game does not know what the
player considers junk; if the player's target T5 mod is the lowest tier on the item, Whittling removes
it. That is the trap, and the honest model has to fall into it.

**THIS SECTION HAD THE MECHANIC WRONG, in both halves.** Traced to poe2db on 2026-09-02
(`https://poe2db.tw/us/Omen_of_Whittling`, and the full list at `/us/Omens`):

> Omen of Whittling — *"While this item is active in your inventory your next **Chaos Orb** will
> remove the **lowest level** modifier"*, internal id **`OmenOnChaosLowestLevelMod`**.

So it is a **CHAOS** omen, not an Orb of Annulment one, and it removes the lowest **LEVEL** modifier,
not the lowest **tier**. Building it as specified above would have modelled a mechanic the game does
not have. The level/tier distinction is not pedantry either: tier numbers are per-mod and not
comparable across mods — a T5 of a five-tier mod is its worst roll, a T5 of a ten-tier mod is
mid-range — so "lowest tier" has no well-defined meaning on an item carrying both. Item level is one
scale for the whole item, and every tier already carries its `ilvl`, so the ambiguity this section
worried about simply does not arise.

**The prerequisite was real and is DONE.** `addMod` placed every mid-plan add at `tierIndex 0` — the
LOWEST ilvl a mod has — whatever the step's `minTierIndex` said, so every mod a plan added would have
tied for "lowest level" and Whittling would have modelled removing whatever was added last. It now
places at `minTierIndex`, which is the worst tier that still satisfies the target and therefore the
conservative reading: a lower placed level makes a mod MORE likely to be whittled, so the walk can
never flatter a plan. Pinned by a test written to fail first, exactly as this section asked. A
Desecration keeps tier 0 — a bone offers what it offers and the step carries no tier target.

**What shipped**: `ChaosOmen` + `lowestLevelMods` + `chaosRemovalProbability` in the engine, the omen
on `PlanStep`'s chaos variant, `OmenofWhittling` in `stepOmenIds`, a price-gated lever in `levers.ts`,
and the label in `engineMap`. Hand-computed tests cover unique-lowest (P=1), not-lowest (P=0), the
no-omen uniform case, ties, a fractured mod (never whittled, and its exclusion moves the "lowest"),
and the flow through `chaosProbability` (exactly 3x on a 3-mod item, since only the removal factor
moves).

**IT IS DORMANT, and that is deliberate.** `OmenofWhittling` is not in `omenQuotes`, and `stepCost`
charges 0 for a missing key — an ungated Whittling would come back FREE and dominate every chaos step
it touched. `withOmen` therefore gates on the omen having a price, mirroring how the strengths are
gated. Today no chaos step gets an omen variant, which is exactly current behaviour; it lights up on
its own the day the quote lands.

**TO FINISH IT, someone with the game and a browser needs to do three things:**
1. Hand-transcribe the Omen of Whittling quote into `omenQuotes` (poe.ninja serves no omen endpoint —
   see CLAUDE.md "Prices"). Everything else is already wired.
2. Add `{ id: 'whittling', label: 'Whittling', keys: ['OmenofWhittling'] }` to `OMEN_GROUP` in
   `currencyPrefs.ts`. It was written and REVERTED: `currencyPrefs.test.ts` pins that every key there
   exists in the shipped sheet, and the row would also lie, since excluding an omen the planner never
   offers changes nothing. It belongs in the same commit as the quote.
3. Settle the TIE rule. Where several mods share the lowest level the game's choice is untraced;
   uniform among the tied is modelled, matching every other pick-among-equals here, and recorded in
   `docs/validation.md` as an assumption. It is the conservative direction for the common case.

**The MDP half is untouched and needs its own item** — see 12b below.

### 12b. The MDP cannot play Whittling — NEW, TIER 3

`McState` is `(present, blocked, jp, js, flagged, rarity)`: it knows WHICH targets are present and HOW
MANY junk mods sit per side, and **no mod's level**. "Remove the lowest-level modifier" therefore has
no meaning in that state space — the model cannot tell whether the lowest-level mod is a target or
junk, which is the entire question the omen answers. A level axis would need a bucket per junk mod,
the same shape as the `flagged` axis, which cost ~5x solve time (see 3). Measure that before building
it. Meanwhile the step planner offers the omen and the true-cost model does not, so once the quote
lands the two models will diverge further on exactly the crafts players use Whittling for — and the
UI should say so on a plan that uses it. That copy is NOT written, because writing it now would
describe a dormant feature.

### 12c. A chaos step's `constrainTo` is inert, and now traceably so — NEW, TIER 3

`PlanStep`'s chaos variant carries `constrainTo`, `addOpts` feeds it to the exalt half, and
`stepOmenIds` charges nothing for it — a free omen if anything ever emitted one. Nothing does, so it
stays latent, and the 2026-09-01 design review left it alone for lack of evidence that a chaos side
omen exists at all.

It does, and it is **not this field**. The two traced chaos side-omens are **Sinistral Erasure** and
**Dextral Erasure** — *"your next Chaos Orb will remove only prefix/suffix modifiers"* — and they
constrain what the orb **REMOVES**, whereas `constrainTo` here tunes what it **ADDS**. Different
mechanics sharing a word. So do NOT close this hole by pricing `constrainTo` as Erasure; either delete
the field, or model the Erasure omens properly as a removal constraint (the chaos analogue of
Sinistral/Dextral Annulment, which `annulProbability` already does). `stepOmenIds` now carries that
warning at the call site.

---

## 13. Split `mods.json` into solver data and display data — TIER 3

**What is wrong.** `mods.json` is 3.1 MB (238 kB gzip) and is the dominant first-load cost — the JS
bundle is 114 kB gzip. Measured 2026-09-01: **37% of it is display-only** (`tiers[].ranges` and
`tiers[].stats`), fields the Worker never reads. `indexPatch` and every probability function consume
`tiers[].{name, ilvl, weight}`, `family`, `type`, `source`, and the pools. The UI reads `text`,
`ranges`, and `stats` for labels and the tier dropdown.

**Why it matters more than 37% suggests.** The Worker cannot start solving until `mods.json` has fully
downloaded and parsed on the main thread and been posted to it. On a phone on a poor connection that is
the entire time-to-first-result. A solver-only file would let the Worker begin the moment the numbers
arrive, with the display text streaming in behind for the picker — and the picker is not on the
critical path to a result if the user arrived via a share link.

**How to do it.**
- The pipeline (`tools/refresh/refresh.mjs`) writes two files: `mods.solver.json` (id, type, family,
  source, categories, tiers as `{name, ilvl, weight}`) and `mods.display.json` (id → `{text, tiers:
  [{ranges, stats}]}`), joined by id and tier index.
- `indexPatch` takes the solver file. `engineMap`'s label functions take the display file. The two
  must be produced from one source in one run so they cannot desync — pin that with a test that
  round-trips them (`dataIntegrity.test.ts` is the home).
- The preload in `vite.config.ts` (`preloadPatchData`) warms the SOLVER file first, display second.
- `loadEngine` resolves as soon as solver + bases + prices are in; a separate `loadDisplay()` feeds the
  picker. Components that need text before it arrives show the mod id (they already fall back to it:
  `data.mods.get(id)?.text ?? id` appears three times in `engineMap.ts`).

**Verify.** Lighthouse mobile before/after on the deployed site: time to first compute result on a
share link, throttled to "Slow 4G". Bundle: `mods.solver.json` gzip ≤ 160 kB. All existing tests pass
against the split files (the fixtures in `packages/engine/src/__fixtures__` may need the same split, or
a loader that merges them for tests).

**Do not** try to shrink the JSON further by shortening keys or dropping tier names. Gzip already
handles repeated keys; the 37% is real content. And tier names are read by the essence code
(`essenceLevelOf` parses "Lesser"/"Greater" out of the tier name) — they are solver data.

---

## 14. Omen of Greater Exaltation — TIER 3

**What is wrong.** An Omen of Greater Exaltation makes an Exalted Orb add **two** modifiers. It is
priced (`prices.json` has it at 9.539 ex as of 2026-08-22), it is on the README roadmap, and neither
planner models it.

**Why it is a different shape of work from the 2026-09-01 orb-strength axis.** That axis was a
LEVER: it changed a step's odds and price and nothing else, which is what let `leverDp.ts` decide it
per step without enumerating. A Greater Exaltation changes WHAT HAPPENS — two mods land, the item state
afterwards is different — so it can never be a lever. `levers.test.ts` asserts exactly that invariant
and would go red if someone tried. It is a skeleton-level action: a distinct step type, enumerated
where the orderings are.

**How to do it.**
- **Engine** (`packages/engine/src/probability.ts`, `plan.ts`): a `greater-exalt` step with `adds:
  [a, b]` — P(both named mods land, in either order, from a pool that shrinks between the two draws)
  and an `applyStep` that places both. The two-draw probability is the same recursion
  `alchemyProbability` already does for four draws; factor that recursion out and reuse it. The
  rarity/slot legality: Rare only, needs two open slots (any sides — or one per side? find the rule).
- **Step planner**: `buildParetoSteps` (from white) and `baseTransforms` (from item) offer it wherever
  two missing rollable mods remain and two slots are open, as an alternative to two consecutive
  Exalts. It roughly halves the ordering count for the pair it covers, so it will not blow up the
  skeleton enumeration.
- **MDP** (`markovActions.ts`): a new `McAction` `{ currency: 'exalt', strength, double: true }` (or
  its own currency) whose outcome distribution is the two-draw distribution over the state lattice.
  Price it via `stepOmenIds` so `costConsistency.test.ts` gets a PAIR row — the D8 lesson.
- Measure the MDP's solve-time cost the way 5d was measured (interleaved, on/off, six crafts). If it
  costs 1.5x and changes no answer, revert the MDP half and keep the step planner's, exactly as 5d did.
  A 9.5 ex omen for a second slam has a much better chance of paying off than a 98 ex Greater Chaos
  did, so the prior is different — but measure.

**Verify.** Hand-computed two-draw probability on the synthetic fixture matches the engine. MC
(`simulate.ts`) confirms it on live data. `costConsistency` has the pair. A live craft where two
Exalts cost more than one Greater Exaltation shows the omen on the frontier.

---

## 15. Crowdsource the desecrated spawn weight — TIER 3, NOT A CODE ITEM

**What is wrong.** `DESECRATED_ASSUMED_WEIGHT = 2500` (`tools/refresh/apply_pools.mjs:61`) is called,
in this file and in `docs/validation.md`, "the single largest unverified number in the app". It was
fitted from **one sample of 40 bones** on one base (`Helmets_dex_int`), maximum likelihood 2,512,
plausible range 1,995–3,981. It prices every craft on armour and weapons — not only carved ones — since
a bone became the cheapest way to add an ORDINARY mod. A 2x error in it moves a Wands craft ~4x.

**Why crowdsourcing.** It is cheap to observe (a bone shows three modifiers; count how many are carved)
and there is no data source — poe2db reports 1 for every row. `scripts/desecrate-weight.mts` already
turns a count into a fitted weight. What is missing is the sample, and a Discord full of players who
spend bones daily is the sample.

**How to do it.**
- A pinned Discord post (or a GitHub Discussion, linked from the app's Report-a-problem panel) asking:
  "Next time you use bones on a Rare, note the base, how many bones, and how many of the 3N modifiers
  shown were 'carved by the Abyss'." Three numbers. The script's own header says why MODIFIERS not
  offers — the form should say the same, because that exact misreading already inflated one fit by 50%.
- Collect in a simple table in `docs/validation.md` D4. Re-fit with the script per base as samples
  arrive; the weight may well differ by base, which would itself be a finding.
- When the pooled sample passes ~200 bones, replace the assumption with the fit, and change
  `PriceBasisNote`'s "assumed odds" wording to cite the sample size.

**Verify.** The fitted interval narrows. `assumedOdds` copy updates to say "measured from N bones by M
players" — a stronger claim than any competitor can make about this number.

---

## 16. The Item tab shows two models, and one calls itself fiction — DESIGN QUESTION

**What is being asked.** Not a bug. A question about whether the Item tab's shape is right, raised
because the code already half-answers it.

`ItemActions.tsx` (901 lines) and `EngineLab.tsx` (911 lines) each present TWO answers to "how do I
get from here to there": the step planner's Pareto frontier and the MDP's true expected cost + policy
graph. CLAUDE.md is explicit that on the Item tab the step planner's cost model "is fiction for a held
item" (it restarts to your item for free on a miss), that its total "was the single most-complained-
about number in the app" and is no longer shown, and that the routes "collapse once the MDP has
answered" via `trueCostAnswered`. So on the Item tab there is a large component whose main design
feature is hiding itself.

**The case for keeping it** is real: the frontier gives a RECIPE — a fixed sequence, per-attempt odds,
per-run cost — which is how players actually think and talk about crafts ("slam, annul, slam"), and
which the MDP's policy graph, correct as it is, does not express as a list of steps you can follow. The
2026-09-01 orb-strength work also made the frontier genuinely informative (a 5-target craft went from 1
row to 5 real choices).

**The case for demoting it**: two headline panels answering one question with numbers that differ by
orders of magnitude (the step routes sit ~68,000x above the MDP's cost on a five-target craft, and
that is AFTER orb strength) is a lot for a player to reconcile, and the panel already collapses to
manage that. A page that shows one answer and offers the other as "if you insist on a fixed recipe"
would be simpler to read and simpler to maintain.

**Recommendation.** Do not decide this from the code. Decide it from users: the Discord, and Sentry's
session data once it has some (which panels get expanded, whether the collapsed routes ever get
opened). If the routes are opened by fewer than one user in ten, demote them to a disclosure below
the policy graph and let the two 900-line components shrink. If they are opened often, the recipe view
is earning its place and the work is making its cost model honest instead (a from-item expected cost
that restarts to the item at the item's REAL replacement price, not zero — which is what
`freeRestart={false}` currently hides rather than fixes).

Either way, this is the item most likely to be wrong if decided from the engineer's chair.

---

## 17. Considered and rejected — so they are not re-proposed

Recorded with the reason, in the spirit of the negative results in `docs/validation.md`.

- **Recombinators.** The endgame crafting meta in PoE2, and a genuine gap. But a recombinator takes two
  items in and produces one out, with its own mod-inheritance rules — it is a different engine, not a
  new action in this one. Would double the model's state space and needs its own validation campaign.
  Not a 1.0 item; possibly not a 1.x item.
- **More MDP performance work.** It is exact, ends on a proof, and the worst measured craft is ~1
  second at Standard effort. The 2026-09-01 result on the Chaos strength axis — 1.2–1.5x slower for
  ZERO change to any answer — is what diminishing returns look like. Three earlier ideas (prioritised
  sweeping, dead-state pruning, PI for phase A) were also measured dead. Stop here unless a user
  reports a craft that is actually slow.
- **A backend, or runtime trade-API calls.** poe.ninja sends no CORS header and asks clients not to
  call it directly; any other source would need a proxy. A backend turns "static site on Vercel" into
  something that must be run, monitored, and paid for, and breaks the offline guarantee the README
  makes. The committed snapshot is right — §8 automates it.
- **Rust / WASM / a native engine.** The `C` branch is the monument to this. The TypeScript engine is
  fast enough (see above), the Worker keeps it off the main thread, and every hour spent on a port is
  an hour not spent on §7–§12.
- **Lowering the cost-CDF cell cap** and **making `exactQuantum` succeed** — both measured on
  2026-09-01 and both wrong; see §5c. The waste was running full precision on plans that could not win,
  and that is fixed.
- **A Chaos strength axis in the MDP** — built, measured, reverted; see §5d. Revisit only if
  `chaos_greater` falls well below 3x the plain price.
- **Prettier across the codebase.** See §9 — one commit reformatting everything destroys `git blame`
  for every file. Not worth it for a solo project with a consistent hand style.

---

## What 1.0 means

The project is at 0.9.7. The engine is past 1.0 quality — exact, validated, measured, honest about
its bounds. What is not 1.0 is everything around it. A coherent definition:

- §7 — the docs describe the app that exists.
- §8 — prices refresh themselves.
- §9 — a linter runs in CI.
- §10 — five browser tests run in CI.
- §11 — belts ship.

That is roughly a week. Ship it as 1.0, and write the CHANGELOG entry as the story it is: a Java beam
search that became an exact analytic engine, that grew a true-cost model no other PoE2 tool has, and
that now says so on its own front page.

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
