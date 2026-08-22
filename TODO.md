# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-22.

---

## 1. Armour desecration takes ~6-8 seconds to solve

Measured on `Body_Armours_dex_int`, one rollable + one desecrated target at ilvl 82:

| base | total | actions | value iteration | answer |
|---|---|---|---|---|
| Wands | 46 ms | 18 ms | 46 ms | 633 ex |
| Body_Armours_dex_int | **6014 ms** | 12 ms | **6014 ms** | **8,219,067 ex** |

All of it is value iteration; building the action space is fast on both. The cause is inherent rather
than a coding bug: untargeted desecration has a minuscule chance of landing one specific mod, and VI's
convergence rate is governed by that probability. Loosening `tolerance` does not help — 1e-9, 1e-4 and
1e-2 all return the same value in the same time.

Introduced 2026-08-22 by giving armour the untargeted draw (before that it returned `feasible: false`
instantly, which was wrong). Correct but slow, and it forces a 60s timeout on two tests in
`desecrationGate.test.ts`.

Worth considering: the answer is 8.2 million exalts. A plan nobody would ever run may deserve an early
exit — "this is hopeless, here is roughly how hopeless" — rather than six seconds of iteration to put
a precise number on it.

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
