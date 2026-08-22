# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-22.

---

## 1. The Lab cannot target a perfect-essence mod

`toEngineMod` (`src/lib/engineMap.ts:50`) returns `null` for anything that is not `normal` or
`essence`, so the 363 `perfect_essence` mods never reach the from-white picker. `validateTargetShape`
would reject them too, and `buildParetoSteps` has no `perfect-essence` step to emit. In game you can
craft a Rare from white and then apply a Perfect Essence, so this is a real gap.

Everything downstream is already built: the from-item planner and the MDP both model `perfect-essence`
(remove one random mod, add the guaranteed one), and the price sheet carries 363
`essence:perfect:<modId>` keys. What is missing is only the from-white search.

Row 1b of `docs/copy-audit.md`. No copy is wrong today — `engineMap.ts:47-49` documents the
limitation honestly — so this is a feature, not a correction.

**NOT to be confused with** "at most one essence-only mod per craft", which is a genuine game rule:
regular-essence and perfect-essence mods are disjoint pools (317 vs 363 ids, zero overlap), so a
Perfect Essence cannot supply a second regular-essence mod. An earlier version of this list claimed
otherwise; see the correction note in `docs/copy-audit.md`.

## 2. `AlternativesView` disappears silently on an empty result

`src/features/engine/AlternativesView.tsx:117` is `if (alts.rows.length === 0) return null`. Set a
budget too low and the panel is simply absent — no "nothing fits 5ex". Small fix.

## 3. Copy audit follow-ups

`docs/copy-audit.md` rows 3, 4, 5, 6 and 12 — copy fixes that distinguish "the game forbids it" from
"the planner doesn't search it". Row 4 (`FrontierView.tsx:51`) is the string that misled a user.

## 4. Mobile layout

`EngineLab.tsx:491` is a bare `flex gap-4` for the prefix/suffix mod columns — it never stacks, so
both are crushed on a phone. (The `hidden md:flex` header block is only the credit and Discord links;
cosmetic, low priority.)

## 5. Jargon pass

"Pareto frontier", "plans evaluated", "search capped", and a budget in "ex" whose unit appears only in
a `title` attribute. Decide what a player who has never read the source would call these.

## 6. Startup cost

`mods.json` preload, code-splitting, unused UI kit components, memoising the mod lists.

---

## Recently closed

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
