# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-23.

---

## 1. Pin down the desecrated spawn weight — it now prices EVERY craft on armour and weapons

`DESECRATED_ASSUMED_WEIGHT = 1000` (`tools/refresh/apply_pools.mjs`) was already flagged as the single
largest unverified number in the app. On 2026-08-24 its blast radius grew by an order of magnitude:
letting a bone compete for ordinary mods made Desecration the primary add on most bases, so the
assumption no longer moves only carved crafts — it sets the price of ordinary ones. Measured on crafts
with **no carved target at all**:

| assumed weight | Wands x3, held Rare | Body_Armours_str x3 |
|---|---|---|
| 1 | 1,953 ex | 1,315 ex |
| 100 | 1,978 ex | 1,320 ex |
| **1000 (shipped)** | **2,181 ex** | **1,359 ex** |
| 5,000 | 2,934 ex | 1,426 ex |
| 20,000 | 4,074 ex | 1,478 ex |

A 2.1x swing on Wands, 1.1x on Body Armour, off a number nobody has measured. (Re-measured 2026-08-24
under the desecration FLAG model — an earlier table here read 4x, from a version that let a bone be
spent over and over.)

**The same change made it cheap to check.** Bones are now played on ordinary crafts, and a bone offers
three modifiers — so the only observation needed is how many OFFERS contained a carved ("carved by the
Abyss") mod. The candidates are not close:

| assumed weight | P(offer holds a carved mod), Body Armour | Wands |
|---|---|---|
| 1 | 0.02% | 0.04% |
| 100 | 2.37% | 3.83% |
| **1000** | **20.69%** | **30.90%** |
| 5,000 | 63.68% | 77.96% |
| 20,000 | 94.35% | 97.90% |

Twenty bones separates them. `scripts/desecrate-weight.mts` prints that table and inverts an
observation to a maximum-likelihood weight with a rough interval:

    npx tsx scripts/desecrate-weight.mts                        # what to expect
    npx tsx scripts/desecrate-weight.mts Body_Armours_str 20 4  # 20 bones, 4 offers held one

If the shipped 1000 falls outside the interval, change the constant, re-run `npm run update-data`, and
update docs/validation.md D4. **Needs a human in the game** — there is no data source for it.

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
See docs/validation.md for that and for two things tried and rejected on measurement (goal-first sweep
ordering; a seed repair that repaired nothing).

**What remains.** Solve is still ~99% of a from-white run, and the desecration flag axis widened the
lattice ~5x where a bone is in play, so the picture is:

| targets, from white | solve |
|---|---|
| 4 | ~9 s |
| 5 | ~67 s |
| 6 | caps out at 120 s, returns an upper bound |

A 5-target craft is now borderline at the Thorough preset (60 s) rather than plainly beyond it, and a
6-target one still needs Patient. The next lever is **prioritised sweeping** — a worklist that skips
states whose successors have not moved, instead of sweeping all N every pass. That is a real speedup
and real complexity, and it should be measured the same way: interleaved medians, because single runs
of these solves have a ~40% spread and have already produced two opposite conclusions from noise.

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

Sentry was the hypothesis going in and the measurement killed it: ~6.9% across all three packages,
Session Replay not in the bundle at all. Lazy-loading it would buy almost nothing.

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
