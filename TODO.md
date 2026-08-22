# Backlog

Ordered by value. Update this file in the same commit that closes an item — see `.claude/skills/ship`.

Last reviewed: 2026-08-22.

---

## 1. Armour desecration is unplannable in Item mode

`packages/optimizer/src/markovActions.ts:350` guards every desecrate action with
`if (desecratable && bossTargetable)`. On armour `bossTargetable` is false, so the MDP emits **no
desecrate action at all** and the reachability pass correctly reports `feasible: false`. That covers
**342 of 527 desecrated mods (65%)** — armour is the common case, not the edge case.

The gate itself is right: boss omens really are "Weapon or Jewellery" only. The fix is to add the
action the game *does* allow — the untargeted draw across the base's whole desecrated pool, already
implemented as `desecrationBossAnySideProbability` and used by the linear planner.

**Done when:** a desecrated target on a Body Armour returns a feasible policy in Item mode, priced
with a Preserved Rib, with no boss omen anywhere in it; a wand still gets the boss-targeted action.
Mutation-check by re-adding the gate and confirming the new test fails.

## 2. Perfect essence is blocked though the game allows it

`optimize.ts:425` throws "at most one essence-only mod per craft" and `EngineLab.tsx:251` blocks the
picker — but `perfectEssenceProbability` (`probability.ts:299`) has no rarity gate, so a Perfect
essence works on a Rare item and a second essence-only mod is reachable. `buildParetoSteps` never
emits a `perfect-essence` step; the from-item planner already does.

Row 1 of `docs/copy-audit.md`. Real feature, not a copy fix.

## 3. `AlternativesView` disappears silently on an empty result

`src/features/engine/AlternativesView.tsx:117` is `if (alts.rows.length === 0) return null`. Set a
budget too low and the panel is simply absent — no "nothing fits 5ex". Small fix.

## 4. Copy audit follow-ups

`docs/copy-audit.md` rows 3, 4, 5, 6 and 12 — copy fixes that distinguish "the game forbids it" from
"the planner doesn't search it". Row 4 (`FrontierView.tsx:51`) is the string that misled a user.

## 5. Mobile layout

`EngineLab.tsx:491` is a bare `flex gap-4` for the prefix/suffix mod columns — it never stacks, so
both are crushed on a phone. (The `hidden md:flex` header block is only the credit and Discord links;
cosmetic, low priority.)

## 6. Jargon pass

"Pareto frontier", "plans evaluated", "search capped", and a budget in "ex" whose unit appears only in
a `title` attribute. Decide what a player who has never read the source would call these.

## 7. Startup cost

`mods.json` preload, code-splitting, unused UI kit components, memoising the mod lists.

---

## Recently closed

- Desecration empty state told players a legal filler → annul → Desecrate route was impossible (2026-08-22).
- Price line rendered as broken English when the sheet's caveat became a full sentence (2026-08-22).
- Boss omens gated to Weapon/Jewellery bases — they were being planned on armour, where the game
  refuses them (2026-08-22). Opened item 1 above as the follow-on.
