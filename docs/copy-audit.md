# Copy audit — absolute claims in user-facing text

**Date:** 2026-08-22 · **Scope:** `src/**/*.tsx`, excluding `*.test.tsx` · **Status:** rows 3, 4, 5 and 6 FIXED 2026-08-22 (see each row); rows 1b and 12's parenthetical remain open.

## Why this exists

The app tells players what they can and cannot do. Twice now it has stated a *game* impossibility
that was really a *planner* limitation — most recently the desecration explainer, which told players
that a lone desecrated target "has no route" when rolling filler mods, annulling them off (rarity
survives an annul) and then Desecrating works fine in game. A plausible-but-wrong explanation is
worse than none: it sends the player off changing something that was never the problem.

This sweep classifies every absolute claim (`cannot`, `can't`, `impossible`, `never`, `only`) against
the code that actually enforces it.

| verdict | meaning |
|---|---|
| **GAME RULE** | the mechanic really forbids it; enforcing function cited |
| **PLANNER LIMIT** | legal in game, outside the search space — the copy misattributes it |
| **SCOPE** | true of one planner but shown where both are in play |
| **OK** | accurate claim about the app's own behaviour |

Verdict counts: 9 GAME RULE · 5 PLANNER LIMIT · 1 SCOPE · 5 OK.

> **Correction, 2026-08-22.** Row 1 originally read PLANNER LIMIT on the strength of a Perfect
> essence having no rarity gate. That was wrong — perfect-essence and regular-essence mods are
> disjoint pools, so a Perfect Essence cannot supply a second regular-essence mod. Row 1 is now GAME
> RULE and the real limitation is split out as row 1b.

---

## PLANNER LIMIT — the copy blames the game for a search-space gap

### 1. "Only one essence-only mod per craft" — `src/features/engine/EngineLab.tsx:86`
Also thrown as an error at `packages/optimizer/src/optimize.ts:425`, and enforced as a picker block at
`EngineLab.tsx:251`.

**Verdict: GAME RULE. Corrected 2026-08-22 — this row previously said PLANNER LIMIT and was wrong.**

The original claim was that `perfectEssenceProbability` (`packages/engine/src/probability.ts:299`) has
no rarity gate, so a Perfect essence could supply a *second* essence-only mod on a Rare. The rarity
observation is true and the conclusion does not follow: **regular-essence and perfect-essence mods are
disjoint sets.** In `0.5.0` there are 317 `source: 'essence'` mods and 363 `source: 'perfect_essence'`
mods, with **zero id overlap** (`Essence_IncreasedLife` vs `PerfectEssence_AllDefences`). A Perfect
Essence grants from its own pool, so it cannot produce a second `source: 'essence'` mod at all.

One regular essence per craft is therefore a real mechanic: a regular essence needs a Magic item and
turns it Rare, and there is no second Magic item to spend one on.

**The genuine gap is a different one** — see row 1b.

### 1b. The Lab cannot target a perfect-essence mod at all — `src/lib/engineMap.ts:50`
`toEngineMod` returns `null` for any mod that is not `normal` or `essence`, so perfect-essence mods
never reach the from-white picker; `validateTargetShape` (`optimize.ts`) would reject them anyway, and
`buildParetoSteps` has no `perfect-essence` step to emit.

**Verdict: PLANNER LIMIT**, and an honestly-documented one — the comment at `engineMap.ts:47-49` says
these "need the remove-and-add-on-rare flow this optimizer doesn't model yet". Nothing lies to the
player here; the mods are simply absent from the Lab. The from-*item* planner and the MDP both model
`perfect-essence` fully, and the price sheet already carries 363 `essence:perfect:<modId>` keys, so
the missing piece is only the from-white search.

Low severity as a *copy* issue (no false claim is made). Listed here because it is the real version of
what row 1 got wrong.

### 2. "Can't use an essence with a fractured mod" — `EngineLab.tsx:87`, `:549`, and the warning at `:610`
Same root cause. A fractured mod forces a Rare start; a *regular* essence needs Magic. A Perfect
essence does not. `essenceFractureConflict` (`EngineLab.tsx:~215`) blocks the combination outright.

**Verdict: PLANNER LIMIT.** The `:610` banner opens "⚠ This craft can't be planned", which is a claim
about the craft, not about this planner.

### 3. "otherwise there's no way to reach Rare and the plan will be empty" — `EngineLab.tsx:644` ✅ FIXED
**Verdict: PLANNER LIMIT.** There is a way: roll three throwaway mods, annul them off, Desecrate.
Annulment does not downgrade rarity. Every `PlanStep` `buildParetoSteps` emits names a target mod
(`plan.ts:29-51` — `add`/`remove` are required `string`s), so the planner has no filler concept. The
sibling text in the empty state (`EngineLab.tsx:666`) was fixed on 2026-08-22 and now says this
correctly; **this line was missed** and still asserts the impossibility.

### 4. "The target is impossible on this base/level" — `src/features/engine/FrontierView.tsx:51` ✅ FIXED
The default `emptyHint`, shown whenever the frontier is empty and no caller supplied a better reason.

**Verdict: PLANNER LIMIT.** An empty frontier means *this search found nothing*, which includes every
planner-limit case above. The copy converts that into a claim about the base and item level and then
recommends a fix ("Try a lower target tier or a higher item level") that is wrong for those cases.
This is the exact string that misled on 2026-08-22.

### 5. "Cannot craft this target" / "Cannot plan this craft" — `EngineLab.tsx:654`, `ItemActions.tsx:594` ✅ FIXED
Error headers rendered above a thrown message.

**Verdict: PLANNER LIMIT (header only).** Some throws underneath are genuine game rules ("target has
4 prefixes"); at least one — "at most one essence-only mod per craft" — is not. The header asserts
impossibility over a message that may only describe a planner restriction. `ItemActions.tsx:594`'s
"Cannot plan this craft" is the more defensible of the two, since it names the planner.

---

## SCOPE — true of one planner, shown where two are

### 6. "on a miss the plan resets to your item and retries — it never throws away the good mods you started with" — `ItemActions.tsx:588` ✅ FIXED
**Verdict: SCOPE.** Accurate for the linear from-item planner, whose own source calls this **"a
fiction"**: *"fromItem.ts assumes 'restart to your item, free' on any miss — a fiction: a real annul
removes a UNIFORMLY-RANDOM mod, so a miss leaves you in a WORSE state"*
(`packages/optimizer/src/markovFromItem.ts:1-6`). The MDP, rendered in the same panel, deliberately
models the opposite ("push forward — never restart"). The note is labelled "Cost model:" without
saying *which*. Its trailing "(It assumes you can reproduce that starting item.)" is honest as far as
it goes.

---

## GAME RULE — verified, leave alone

| # | Claim | Location | Enforcing code |
|---|---|---|---|
| 7 | "locked on the item, can't be removed" | `ItemActions.tsx:392` | `annulProbability` returns 0 for a fractured target — `probability.ts:189` |
| 8 | "the planner keeps them, never removes them, and they're excluded from what an Annulment / Chaos / Essence can randomly remove" | `ItemActions.tsx:410` | `probability.ts:189` (annul) and `:311` (perfect essence) return 0 outright; chaos inherits it by delegating to `annulProbability` at `:227`. Fractured mods are also dropped from the `pf`/`sf` counts, so removing any *other* mod gets likelier |
| 9 | "never rerolled and are excluded from what an Annulment / Chaos can hit" | `EngineLab.tsx:627` | same as above |
| 10 | "a plain Annulment only hits it 1-in-N at random" (vs Omen of Light removing it for certain) | `ItemActions.tsx:419` | `annulProbability`: `none → 1/(pf+sf)`, `light → 1` — `probability.ts:194-201` |
| 11 | "The boss omens are **Weapon or Jewellery only**, so on this base the draw can't be narrowed" | `EngineLab.tsx:638` | `bossOmenAllowed` — `probability.ts:406`, delegating to `desecrationBoneFor`; matches the in-game omen text |
| 12 | "Essence-only mods can only be applied by an essence" | `EngineLab.tsx:618` | essence-only mods are absent from `base.pools.normal`, so no exalt/regal/chaos can roll them. **Caveat:** the parenthetical "(on a Magic item, turning it Rare)" is regular-essence-only — see row 1 |
| 13 | "A fractured mod is already locked, so it's never relaxed" | `EngineLab.tsx:576`, `:587` | `alternatives.ts:418-421` — fractured mods are forced `pinned: true` |
| 14 | "the budget search will never relax, swap or drop this" | `EngineLab.tsx:589`, `:590` | `alternatives.ts:245`, `:258`, `:270` — every relax/swap/drop loop `continue`s on `pinned` |

---

## OK — accurate claims about the app's own behaviour

| # | Claim | Location | Note |
|---|---|---|---|
| 15 | "Plans will never use anything you tick here… you'll be told rather than shown a plan you can't run" | `CurrencyExclusions.tsx:56` | Guaranteed by `if (policy && steps.some((s) => !allowsStep(policy, s))) continue` in `optimizePareto`; the MDP takes the same `policy`. The pruning above it is an optimisation, not the guarantee |
| 16 | The exclusions empty-hint's "…or the target may be out of reach anyway, which this can't tell you without re-running it unrestricted" | `EngineLab.tsx:677` | Correctly refuses to over-claim |
| 17 | The desecration empty state, "In game you can still do this…" | `EngineLab.tsx:666-673` | Fixed 2026-08-22; the model the rest of this audit should follow |
| 18 | "orb search reduced to strongest only (target too large for full)" | `FrontierView.tsx:25` | Accurate description of `currencyDepth` |
| 19 | "(weights are unknown, so this is an approximation)" | `EngineLab.tsx:636` | States its own uncertainty |

---

## What was fixed, 2026-08-22

- **Row 3** now says "this search comes back empty" and names the filler→annul route as something you
  can still do by hand.
- **Row 4** no longer asserts impossibility. It still names the likely cause (so it is not merely
  vague) and adds that the craft may be possible by a route the planner doesn't explore. Pinned by
  `src/features/engine/FrontierView.test.tsx`, mutation-checked against the old wording.
- **Row 5** both headers now name the planner: "The planner can't build this target" / "…can't plan
  this craft".
- **Row 6** names BOTH cost models and says which is the optimistic one, so the two numbers in that
  panel stop looking like a contradiction.

## Still open

1. **Rows 3 and 4** — one-line copy fixes; row 3 is a straggler from a fix already applied to its sibling.
2. **Row 5** — reword the two error headers to name the planner.
3. **Row 6** — say which cost model, or move the note under the linear plan.
4. **Row 1b** — Lab support for perfect essences. A feature, not a copy fix, and no copy is wrong today.
