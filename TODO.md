# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-23.

---

## 1. The from-item step planner never varies orb strength

`baseTransforms` (`packages/optimizer/src/fromItem.ts`) builds every add at base strength — no `tier`
field — so the planner cannot buy the probability a Greater or Perfect Exalt offers. The MDP *does*
weigh them, which is part of why the two models' costs diverge so hard on a long-shot craft. As of
2026-08-23 the badge tells the truth about this (`currencyDepth: 'base-only'`) instead of claiming
"tried every orb strength".

Fixing it means an orb-strength axis over the adds, multiplying the search by roughly `3^k` on a
search that already evaluates 295,680 plans (~3.2s) for a 5-target craft. It needs the same
estimate-then-reduce throttle `optimizePareto` uses, not a naive product. Worth doing; not small.

Related, smaller: above the Thorough preset the MDP's `maxIters` (100k sweeps, ~50s) binds before
`maxMillis`, so Patient buys nothing on crafts like the one in docs/validation.md. Either expose the
sweep cap on the effort ladder or stop implying more time helps.

## 2. Startup: what measurement left on the table

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
