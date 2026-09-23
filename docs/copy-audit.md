# Copy audit — absolute claims in user-facing text

**Date:** 2026-08-22, reconciled 2026-08-23, extended 2026-09-04 · **Scope:** `src/**/*.tsx`
(excluding `*.test.tsx`), plus `docs/USER_GUIDE.md` since it began rendering in the app

**Status: every row is closed.** Rows 3, 4, 5 and 6 were copy fixes (2026-08-22); row 1 was a wrong verdict, corrected; rows 1b and 2 were resolved by shipping the feature they described. Nothing here is outstanding — new findings go in a new sweep, not by reopening these.

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

### 1b. The Lab cannot target a perfect-essence mod at all — `src/lib/engineMap.ts:50` ✅ FIXED 2026-08-22
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

**Verdict: PLANNER LIMIT.** ✅ **FIXED 2026-08-23.** The reasoning held — a Perfect Essence wants a
Rare, so a fractured mod is no obstacle to it — but the code conflated the two kinds. `EngineLab.tsx`
now separates `regularEssenceUsed` (which the fracture rules key off) from `essenceUsed` (the
one-per-item cap), so a fracture blocks only a REGULAR essence. Note this row's original argument
leaned on the same disjoint-pools mistake as row 1; the conclusion survived it, the reasoning did not.

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
| 18 | The frontier empty state, "the craft may still be possible by a route the planner doesn't explore" | `FrontierView.tsx:97-101` | **Traced 2026-08-28 and ACCURATE.** TODO 2 asked whether this "calls unsearched" a route the MDP now searches. It does not: it claims no impossibility, names the tier/ilvl causes as the *usual* one, and admits the guess. It could be more helpful — the policy graph beside it does explore the desecration filler route — but that is an improvement, not a correction. Left alone deliberately. |
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

## And on 2026-08-23

- **Row 1** was re-verdicted from PLANNER LIMIT to GAME RULE — the correction note above.
- **Row 1b** closed by shipping it: the Lab lists perfect essences and plans them from white.
- **Row 2** closed by separating `regularEssenceUsed` from `essenceUsed`, so a fractured mod blocks
  only a regular essence.
- A NEW disclosure, not from this sweep: the desecrated spawn weight is an assumption, so
  `PriceBasisNote` drops its "the odds are exact" claim on plans containing an unomened Desecration
  (`assumedOdds`). See `docs/validation.md` D4.

## Sweep 2 — the from-item panel (2026-08-23)

Prompted by a user report, not a sweep. Both claims below were **shipped and wrong**, and both were
the same failure: an explanation asserted from how the code was *meant* to behave rather than from
what it does.

| # | Claim | Where | Verdict |
|---|---|---|---|
| 5 | "Expect it to be the higher, and the realer, of the two" (true cost vs the step plan) | `ItemActions.tsx` | **FALSE as stated** |
| 6 | "tried every orb strength" on a from-item craft | `FrontierView.tsx` `DEPTH_NOTE.full` | **FALSE** |

**Row 5.** The note told the reader the step plan is the optimistic one and the true cost will exceed
it. On the reported craft the step plan read `267.5B div` against a true cost of `28.9K div` — higher
by ~9,000,000x, the opposite of the promise. The step plan is one *fixed* sequence in which every slam
must hit a named mod, so on a long-shot target its restart-model cost runs far above what an adaptive
policy pays. Fixed by saying the two can differ in either direction, and why. The free-restart
assumption is now also stated where it bites rather than only in the preamble.

**Row 6.** `optimizeFromItem` returned `currencyDepth: 'full'`, which `DEPTH_NOTE` renders as "tried
every orb strength". `baseTransforms` sets no `tier` on any add, so that planner only ever uses
base-strength orbs — it had never tried a single Greater or Perfect Exalt. New `base-only` member says
so. This one is worse than a cosmetic overclaim: it concealed a real reason the two models diverge,
since the MDP *does* weigh Greater/Perfect Exalts.

A third disclosure, not a false claim but a missing one: `PolicyGraph` drew an unconverged policy's
state closure under the heading "optimal policy" even when that closure **does not contain the
target** (measured: 14 states, depths 7→4, goal absent). It now says there is no route yet and to
raise Search effort. See `docs/validation.md`.

## Sweep 3 — the Quick currency check's coverage (2026-09-02)

### 7. "for every currency that can legally apply" — `docs/USER_GUIDE.md` ✅ FIXED

**Found by a question, not by a sweep.** Asked whether the panel described in the new
`WHATS-NEW.md` really existed, checking it against `currencyActions` (`src/lib/engine.ts`) showed the
panel offers exactly **six** rows: Exalted, Chaos, Augmentation, Regal, Annulment, and Annulment with
an Omen of Light. Bones, essences, Alchemy, Transmutation and every orb STRENGTH are absent.

Both docs claimed comprehensiveness — the User Guide's "for every currency that can legally apply"
and a freshly written "every currency that can act on the item". Neither is true, and the failure
mode is the familiar one: a player holding a Rare with a desecrated mod looks for a bone row, does
not find it, and concludes the game forbids what is merely unimplemented in one panel.

**The app itself never overclaimed.** The on-screen heading is `Currency options`, which promises
nothing. This was purely a documentation defect — which is its own lesson, since the copy audit had
only ever swept the UI strings.

Both fixed by naming the six rows exactly and saying, in the guide, that the omission is a limit of
this panel rather than of the engine or of the game. Broadening the panel is TODO 18.

**Update, same day.** A player asked the panel's own question back at it — *"it says Exalted Orb but
we could desecrate also?"* — which is precisely the failure mode this row predicted, arriving within
hours of the row being written. The Desecration rows shipped; the guide's table and its "not here"
sentence now name **essences and orb strengths**, which are what remains. The lesson holds and is
worth restating: the copy was accurate the whole time and the panel was still wrong. Naming a gap
honestly documents it; it does not close it.

---

# Sweep 2026-09-04 — the in-app user guide

**Scope:** the new `UserGuide` panel (`src/features/engine/UserGuide.tsx`) and the guide it points at,
`docs/USER_GUIDE.md`, which is now RENDERED IN THE APP at `#guide` rather than only living in the repo.
That second fact is what brings the `.md` into this audit's scope for the first time as *shipped copy*:
until now it was documentation a player had to go looking for on GitHub.

### 8. "One guaranteed-mod modifier per item — Essences, Perfect Essences and Alloys together"
`docs/USER_GUIDE.md`, the Alloys section. Enforced at `whyNotAdd` (`src/lib/targetSlots.ts`), whose
`isEssence` predicate covers `'essence'`, `'perfect'` **and** `'alloy'`.

**Verdict: OK — but only because of how it is worded, and the wording is the finding.**

For Essences the one-per-item limit is a GAME RULE (`isEssenceMod`, `probability.ts`; regular and
perfect counted together). **Whether it extends to Alloys is untraced.** poe2db marks Alloy rows
`Removes: true` exactly as it marks Perfect Essence rows, which is the evidence for their sharing a
*mechanic*; nothing in the data speaks to the *cap*. The app keeps the stricter behaviour because
loosening it would be asserting a mechanic, which is the same trap as row 1 in the first sweep.

So the copy states it as **what the app does**, names it as unverified, and invites correction. It does
not say the game forbids a second Alloy, because nobody here knows that. This is row 1's lesson applied
before the fact rather than after it: *verifying "this is impossible" and verifying "this is merely
unimplemented" take the same care.*

### 9. The Quick check's "Essences and orb strengths are not here" — REMOVED
`docs/USER_GUIDE.md`, Quick currency check.

**Verdict: was OK, went stale, now deleted.**

Row 7 of the previous sweep closed by narrowing this sentence to name essences and orb strengths as
what remained missing. Commit `fce0788` then shipped both — and the sentence stayed, four paragraphs
below a table that by then listed `Perfect Essence`, `Essence` and a Greater/Perfect strength row. The
guide contradicted itself on the same screen for two days.

**The lesson is specific and new: a paragraph that honestly documents a gap becomes a lie the moment
the gap closes, and nothing points at it.** An accurate claim needs re-checking when the code catches
up with it, and "this is missing" is exactly the kind of claim that expires. The previous sweep's own
closing note — *"naming a gap honestly documents it; it does not close it"* — is right, and this is its
other half: naming a gap creates a debt in the copy that closing the gap must also pay off.

Mitigated for the panel, not for the guide: `UserGuide.test.tsx` pins every UI string the in-app panel
quotes (`QUOTED_UI`) against the components that render them, so a rename fails the suite. No such
guard exists for prose that describes what a panel *lacks*, and none is obvious — which is the reason
this row is written down rather than merely fixed.

## Still open

Nothing in the UI copy. `docs/` is now swept once (2026-09-02) and row 7 is what that found.

The two lessons worth carrying forward, both already in CLAUDE.md's critical rules:

1. **A plausible-but-wrong explanation is worse than none** — row 4's "The target is impossible on this
   base/level" sent a user to adjust a tier that was never the problem. Row 5 is the same lesson in a
   new place: a confident sentence about which of two numbers would be larger, contradicted on screen
   by seven orders of magnitude, and never checked against a real craft.
2. **The rule cuts both ways.** Row 1 called a real game rule a planner limit, on reasoning that was
   confidently argued and simply false. Verifying "this is impossible" and verifying "this is merely
   unimplemented" take the same care.

## The Lab's starting-item panel (2026-09-11)

New copy for **Start from an item you buy instead** (`StartFromItem.tsx`, `docs/USER_GUIDE.md`), checked
before shipping rather than after. Every claim is about what the app computes, except row 26, whose
game half is traced.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 21 | "Pay at most: crafting from scratch minus the cost to finish: pay less than this and you come out ahead" | `StartFromItem.tsx`, guide | **OK** | `startOptions`: `restartCost + V(white) − V(item)`, clamped at 0 — `expectedCost` excludes the first base (only restart charges `restartCost`, `markovFromItem.ts` restart action), so the base is added back. "Ahead" is against that same from-scratch figure, for a clean item (row 23) |
| 22 | "The price sheet has no prices for items with specific modifiers" | `StartFromItem.tsx`, guide | **OK** | A claim about the app's own sheet: `tools/refresh/prices.mjs` reads poe.ninja's currency, bone, essence and omen feeds, and nothing that prices a Magic or Rare item by its modifiers |
| 23 | "Each row assumes the rest of the item is empty" | `StartFromItem.tsx`, guide | **OK** | `startCandidates` reads `jp = js = 0`, nothing blocked — same as `WhatToBuy`'s footer |
| 24 | "If a bought item goes badly, the plan may drop it and start over from a white base when that is cheaper than fixing it" | `StartFromItem.tsx`, guide | **OK** | The from-white solve offers restart in every state (`markovActions.ts`, both rarity branches) and the policy takes the cheaper move by V; the rows are read from that solve |
| 25 | "From this item the cheapest move is to start over from a white base — it saves nothing" | `StartFromItem.tsx` | **OK** | Shown exactly when `worthUpTo` is 0, i.e. V(item) = `restartCost` + V(white) — the restart action's own value, which the policy then plays (the hand-derived route test pins the route being that one move) |
| 26 | "A Magic item holds at most one prefix and one suffix, and its rows only ever carry modifiers an orb rolls — the planner has no other way to put a modifier on a Magic item" | guide | **GAME RULE + PLANNER SCOPE, each named** | One affix per side: `perSideCap('magic')`, `markovState.ts:32`. The rest is said as the planner's: below Rare its only adding moves are Transmute, Augment and Regal, which skip non-`rollable` targets (`markovActions.ts:246`), and an Essence converts to Rare as it adds (`:608`) |
| 27 | "Best of the items you priced: … less than crafting from scratch" / "None of the items you priced beats crafting from scratch" | `StartFromItem.tsx`, guide | **OK** | `bestStart`: the priced row with the least `price + finish`, among the rows of the size shown, held against the same from-scratch figure as row 21 |
| 28 | "A dot or a comma both work (0.5 or 0,5)" | `StartFromItem.tsx`, guide | **OK** | `parsePrice`: a lone comma is the decimal point; with a dot present, commas are thousands; spaces are dropped; anything else is marked and left out, never guessed |
| 29 | "Every row here is a cost from the solve above, and that solve stopped before its costs settled" | `StartFromItem.tsx` | **OK** | Shown exactly when the result is a bound (`bound` ≠ `exact`) or has no number because it ran out (`stoppedEarly`, set only on the clock/sweep failure in `markovFromItem.ts`) |
| 30 | "Compute again at {next effort}" / "the craft is beyond what the solver can settle" | `StartFromItem.tsx`, guide | **OK** | `nextEffort(ranAt)`: the preset above the one the solve ran at; every limit rises strictly up the ladder (`searchEffort.test.ts`), so the next rung always gives the solver more. None above the top |
| 31 | "Not available for a craft that starts from fractured modifiers … no white base for a bought one to replace" | `StartFromItem.tsx`, guide | **OK** | `solve.ts`: a carved Lab craft solves from the item, with no `restartCost` — there is no "instead of a white base" to price |

## Rate the app (2026-09-14)

The rating box (`RateApp.tsx`, `docs/USER_GUIDE.md`) makes promises about privacy and about bots, so
each is traced to the code that keeps it.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 32 | "No email, no name, no account — only the stars, your words and the app version are sent" | `RateApp.tsx`, guide | **OK** | The panel posts `{ rating, message, version, website: '' }` and nothing else (`RateApp.test.tsx` pins the body); `api/feedback.ts` forwards the stars, the words and the version as `release`, and the envelope test asserts no address, user, browser or contact field. Sentry sees the function as the sender. Vercel logs request metadata for this request as for every page view — that is the host, not a thing this box collects |
| 33 | "An invisible check keeps bots out; you never see a puzzle" | guide | **OK, scoped** | BotID Basic runs a challenge in the background and verifies it server-side before the body is read; there is no visible step. "Keeps bots out" is the check's job, not a guarantee — the honeypot, the limits and Sentry's spam filter back it up |
| 34 | "Your browser didn't pass the automatic bot check" | `RateApp.tsx` | **OK** | Shown only on 403, which the function returns only when `checkBotId()` says `isBot` |
| 35 | "Ratings aren't switched on right now" | `RateApp.tsx` | **OK** | 503: no `FEEDBACK_SENTRY_DSN`, one that is not a DSN, or BotID unable to run (the OIDC option off) — each is the site switched off, from the player's side |

## Runes, and the one-crafted-modifier rule (2026-09-16)

This sweep exists because a previous verdict went stale in the player's favour. The guide used to say
the app allowed one guaranteed-mod modifier per item and that **whether that extended to Alloys was
"not something this project has verified"** — honest caution at the time, and wrong now: the 0.5.0
patch notes state the rule and the game's own item data files Essences, Perfect Essences and Alloys
alike as *crafted*. A caveat that has since been traced is its own kind of false claim, so it is
replaced rather than left standing.

Row 41 is the one to watch: a claim about the GAME that rests on a user ruling with no data source
behind it, stated as such.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 36 | "An item holds one crafted modifier — Essence, Perfect Essence or Alloy. Socket Astrid's Creativity to allow a second." | `targetSlots.ts:184`, both pickers | **GAME RULE** | 0.5.0 patch notes: items "can only have 1 crafted modifier at a time"; poe.ninja files all three sources as `crafted` (68 crafted mods over 64 items, 18 characters). Enforced by `whyNotAdd` counting crafted targets against `limitsWithRunes(...).crafted`, which is `DEFAULT_LIMITS.crafted = 1` plus any Astrid's Creativity |
| 37 | "An item holds {n} crafted modifiers, and this target already names that many" | `targetSlots.ts:185` | **OK** | The same count with the rune's raised limit substituted — the message a player meets once Astrid's Creativity is ticked, so the number shown is the item's, not a constant |
| 38 | "Allows a second crafted modifier — Essence, Perfect Essence or Alloy" / "Allows a fourth suffix" | `RunePicker.tsx:17-19,41` | **GAME RULE** | The runes' own stat text in the game data ("Can have 1 additional Crafted Modifier", "+1 Suffix Modifier allowed"), carried into `runes.ts` as `crafted +1` / `suffix +1` and applied by `withRunes` |
| 39 | "One crafted modifier per item, Alloys included — and this is now the game's rule, not the app's caution" | guide, Alloys | **GAME RULE** | As row 36. Replaces the superseded caveat quoted above |
| 40 | "Tick one and its modifiers appear in the pickers and in every plan; untick it and they leave again" | guide, Runes | **OK** | `RunePicker` offers every rune whose effect is not `convert` and which fits the base; the ticked ids reach `listMods(data, baseId, runes)` and the solve alike, and `withRunes` folds that rune's pool into `pools.normal` — the one base both the pickers and the planners read. The Aldur runes stay out because `runeOpportunity` proposes them itself |
| 44 | "The odds on a pool modifier are an estimate, not a measurement … the game's data publishes no spawn weight for any of these" | guide, Runes | **OK** | RePoE reports weight 1 for all 128 rune-pool modifiers, the same placeholder poe2db gives the desecrated pool; `RUNE_POOL_ASSUMED_WEIGHT` (apply_runes.mjs) substitutes 1000 and `mods.json`'s own `source` field records that it is an assumption |
| 41 | "The item keeps what the rune allowed after the rune comes out" | guide, Runes | **GAME RULE, on a user ruling only** | Confirmed by the user 2026-09-15. No data source backs it and no code enforces it — the app never takes a rune out — so it is a claim about the game resting on one report. If it is wrong, a plan that ends by swapping the rune is wrong with it |
| 42 | "A rune costs a socket, and sockets are not modelled here … Artificer's Orbs are not priced" | guide, Runes | **OK** | A claim about the app's own scope: nothing in `cost.ts` or `prices.mjs` tracks sockets or prices an Artificer's Orb, and `runePriceKey` charges only the rune itself |
| 43 | "One line stays unread — a Genesis Tree ring craft, a mechanic this app does not model" | gear tab omissions | **OK** | `codeIndex` has no entry for `GenesisTreeRingMinionCooldownRecoveryCrafted`; it is reported through the existing unresolved path rather than matched to an essence that did not make it |


## Free slots — "any prefix / any suffix" (2026-09-17)

A free slot changes what the app calls FINISHED, so it falsifies claims made elsewhere about what has
to come off an item. This sweep covers the new copy and the two standing claims it invalidated.

Row 47 is the one worth watching: it is the app admitting a limit of one of its own planners while the
panel beside it does better, which is the shape of claim this audit exists to keep honest.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 45 | "Any prefix / Any suffix — I don't care what lands here" | `FreeSlots.tsx`, `ItemActions.tsx` picker | **OK** | A free slot is a count per side (`Spare`), and `isAccepting` accepts up to it in `jp`/`js` — junk is by definition weight in a family the target never named, so "anything" is exactly what it tolerates |
| 46 | "whatever lands here is fine, and so is leaving it empty — you can always Exalt (or Desecrate) afterwards" | `FreeSlots.tsx`, guide | **OK** | `isAccepting` tests `jp <= spare.prefixes`, an inequality, so a state with the slot EMPTY is accepting too. The Exalt half is a claim about the game, and the weaker one: any modifier counts, so the only way it fails is the side being full — which the picker prevents by counting free slots against the cap (`roomOnSide`) |
| 47 | "The step-by-step plans below don't use it — every step in a route has to name the mod it's aiming at" | `FreeSlots.tsx` (Lab only), guide | **OK, and it is a PLANNER LIMIT said as one** | `optimizePareto` builds a fixed sequence in which every `PlanStep` names an `add`; there is no filler step to spend on "anything", and a miss on a named step is a miss whatever is tolerated elsewhere. Deliberate rather than pending: the slack only pays when the spare can be chosen AFTER the roll, which is the MDP's job. Not shown on the Item tab, where `optimizeFromItem` DOES use it — there the choice is made before any orb is spent |
| 48 | "Any mod on your item that isn't in this list is treated as junk and removed" | `ItemActions.tsx` | **OK — amended** | Was unconditionally true and is not any more. Now reads "… removed — except for the free slots below, which may keep one" whenever a free slot exists, which is exactly when `keepSets` offers the planner a run that leaves junk alone |
| 49 | "Junk to clear: N" | `PolicyGraph.tsx` | **OK — amended** | Counted every junk modifier, which under a free slot is more than has to go. Now counts junk ABOVE the allowance per side and names the rest as "may stay, in the slots you left free". Reads the free slots the SOLVE ran with (`markovSpare`), not the live setting, so the claim cannot drift under an answer already on screen |
| 52 | "T2+" beside a held or off-tier position | `PolicyGraph.tsx` state detail | **OK, and the "+" is load-bearing** | The state records that a position is filled AT OR ABOVE the tier asked (`classifyStart`: `tierIdx >= minIndex` ⇒ present), never which tier landed. "T2" would be a claim about a roll the model does not hold; "T2+" is the ask, which is what it does hold. Absent where the caller gave no targets, and absent for a merged position whose members were asked at different tiers — one number would there speak for two asks |
| 51 | "These routes can't use the slot you left free … the true expected cost above is not restricted that way" | `EngineLab.tsx` empty frontier | **OK — a PLANNER LIMIT said as one, and deliberately not a diagnosis** | Shown when the frontier is empty and a free slot exists. It does NOT claim the free slot caused the empty frontier — a short target comes back empty without one, for the same underlying reason (`optimizePareto` builds no filler step). What it replaces is the generic "try a lower target tier or a higher item level", which was a confident wrong diagnosis: seen for real on a two-prefix Sceptre from white, empty frontier beside a model answering 3,603 ex |
| 50 | "This side is full (max N)" for a free slot | both pickers | **GAME RULE** | A free slot is a position on the finished item, so `roomOnSide` counts it with the named slots against the base's own limit (`limitsWithRunes`). The engine would make an over-cap free slot silently inert instead — `enumerateStates` never emits a state past the cap — which is right for a solver and wrong for a picker |

## A tab older than the site (2026-09-18)

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 53 | "poe2htc was updated since you opened this tab" | `AppUpdatedNotice.tsx` | **OK** | Shown only for `AppUpdated`, which `failureOf` (engineClient.ts) returns only when `servesNewerBuild` finds that the live `index.html` no longer loads this tab's hashed entry script. Every doubt — no hashed entry, a failed or non-OK probe — answers "not updated", so a real crash is never relabelled as this |
| 54 | "the prices every morning" | `AppUpdatedNotice.tsx` | **OK** | `refresh-prices.yml` runs on cron `0 6 * * *` and merges to `main` (#26 landed 06:21 UTC on 2026-09-17, #27 06:22 on 09-18), and it renames `prices.json` and every chunk that names it. Phrased as an example ("updated often — the prices every morning"), because a code deploy has the same effect |
| 55 | "Your targets are saved in this browser and come back with it" | `AppUpdatedNotice.tsx` | **OK, with the app's one standing exception** | Every workspace change is written to `localStorage` in `setWorkspace` → `persist`, and read back on load. The exception is storage the browser blocks (some private modes), where `persist` fails silently app-wide — not a claim this notice introduces. Verified end to end: a redeploy under an open tab, Reload, all three targets back |

## A step planner that declines (2026-09-18)

Reported from the Item tab: a Magic Sceptre holding two of its five targets, the other three including
two Alloys, with the last suffix left free. The model answered — 1,733 div — and the routes panel under
it said "No achievable plan — every path scored 0%" and "usually the target needs more mods than fit,
or a tier gated above the item level". No path had been scored, and neither cause applied: the step
planner had declined the craft, and its own sentence was never shown, because the tab's hint outranked it.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 56 | "No step-by-step route for this craft." | `FrontierView.tsx`, and the Lab's live region | **OK** | Shown only when `result.reason` is set, which only `frontierOrReason` (solve.ts) sets — when the step planner threw before searching (`plansEvaluated: 0`). It replaces "every path scored 0%" in exactly that case, which claimed a search that never ran |
| 57 | "The true expected cost above is worked out a different way and isn't limited to fixed routes: if it shows a number, the craft is reachable." | `FrontierView.tsx` | **OK, conditional by design** | The true-cost card renders only when the model is `applicable && feasible`, and `feasible` means a goal state is reachable from the start in its lattice. "If it shows a number" keeps the sentence true on a craft the model refused as well. On the reported craft it had answered 725,254 ex |
| 58 | "an Alloy or Perfect Essence removes a random modifier as it adds its own, so a route needs a modifier you don't want on the item for each one to take instead" | `fromItem.ts`, rendered by `FrontierView.tsx` | **OK — a PLANNER LIMIT said as one** | "A route" is the step planner's fixed sequence: `transformSequences` pairs each perfect target with a junk mod ALREADY on the item (`orderedSelections(junk, …)`), and cannot roll one on first. The game half — removes a random modifier as it adds — is the Perfect Essence rule both planners implement; a Crystallisation omen narrows it to one side and it stays random there. The model has no such limit and rolls the throwaway itself, which row 57 points to |

## Throwaway steps (2026-09-18)

The step planner learned to roll a modifier on purpose — "anything on this side" — for the Perfect
Essence or Alloy right after it to remove. Row 58's refusal ("an Alloy or Perfect Essence removes a
random modifier as it adds its own, so a route needs a modifier you don't want…") is **retired**: the
shortage it described is now planned around rather than refused, and the sentence no longer exists.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 59 | "any suffix — a throwaway for the next step to remove" | `engineMap.ts` `mapFrontier`, step routes | **OK, and "the next step" is enforced, not described** | A throwaway step's success is landing on that side (`throwawayProbability`, the side's share of the ordinary per-mod add odds). `stepProbability` scores 0 for every step on an item holding one EXCEPT the Perfect Essence naming it for removal, so no route containing a throwaway can do anything else next. Labelled by the orb it spends (`ThrowawayStep.orb`), never by its internal currency name |
| 60 | "+<mod>  −the throwaway suffix (random)" | `engineMap.ts` `mapFrontier` | **OK** | The same "(random)" every Perfect Essence step carries: removal is uniform over the item's mods, or over one side under a Crystallisation omen (`perfectEssenceProbability`). The side is read from the throwaway step that placed it, since its id names no mod |
| 61 | "Which modifier lands never matters, so the odds stay exact" | `USER_GUIDE.md` FAQ | **OK — proved by test, not argued** | The only step that ever sees a throwaway counts mods and adds a crafted mod no rolled family can block (`familiesOf`), and the throwaway is gone after it. `throwaway.test.ts` recomputes real routes by branching over every modifier a throwaway could really be — with its own family on the item — and matches the model to 12 digits |

## Family siblings (2026-09-21)

The true-cost model learned that a DIFFERENT modifier of a target's family blocks it — Cold spell damage
where you want Fire, another "+level to … spell skills" where you want Fire's. The graph called every
blocked target "off-tier" and "stuck below tier", which was only ever one of the two causes; the copy now
names both. The "In the way" row is new: a modifier nobody asked for that blocks a target from the other
side of the item, or blocks two at once.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 62 | "N blocked" on a box; "Blocked … another roll holds its family — the mod below this tier, or another mod of the family — annul before re-adding" | `PolicyGraph.tsx` state label and detail | **OK — both causes, and nothing else** | `blocked` is set by an add landing the target below its tier OR one of its same-side siblings (`addOutcomes`, `desecrateAnyOutcomes`, boss draws via `blocks`), and by `classifyStart` for either on a held item. Every removal of a blocked occupier frees the family (`removeOutcomes`), so "annul before re-adding" is the only way out the model has |
| 63 | "In the way … not a target, and it holds a target’s family — annul it" | `PolicyGraph.tsx` state detail | **OK** | Only an OBSTACLE position renders here (`resolveSiblings`: a sibling on the other side, or one blocking two targets). It is in no slot, so the goal never needs it, and `isAccepting` counts it against the free slots exactly as junk — so it must come off unless a free slot holds it |
| 64 | "blocks X" in a step's description | `PolicyGraph.tsx` `describeStep` | **OK** | `policyPath.ts` lists the targets blocked in the next state and not in this one — the same bit as row 62, whatever blocked it. The old "blocks X below tier" named one cause of two |

## The Tablets tab (2026-09-22)

A tab whose numbers come from one player's rolling data and whose prices come from the reader, so every
claim on it has to say which is which.

| # | Claim | Where | Verdict | Traced to |
|---|---|---|---|---|
| 65 | "1 in 7 rolls on this side" | `TabletModPicker.tsx` | **OK, and it says WHICH rolls** | `share` is the modifier's weight over its side's total (`listTablets`), so the claim is about a roll that lands on that side — not about an orb, which may land on either. A craft's odds are the solver's and are shown separately |
| 66 | "seen 54 times" beside a modifier | `TabletModPicker.tsx` | **OK — the sample, not a hedge** | Printed only under `THIN_EVIDENCE` (100 sightings), from `morce-faster.json`, where 54 is of Undertaking's count across all three sheets. It is the evidence the weight was read from, which is the honest thing to show where that evidence is thin |
| 67 | "turns up in 23% of crafts" | `TabletResult.tsx` watch list | **OK — measured, and the count is printed** | The share of replayed crafts in which that modifier sat on the tablet (`markovReplay.ts`, playing the solved policy on real items). "Played out N times" is printed under the list, because a long craft fits fewer runs in the clock and the reader has to weigh that |
| 68 | "worth more than the tablet you asked for" | `TabletResult.tsx` watch list | **OK — both sides are the reader's own numbers** | Compares a price the player typed against the craft's true expected cost. It never claims a market: with no price typed, nothing is said |
| 69 | "Search on trade" / "≈" | `TradePrice.tsx` | **OK, and the ≈ is the honest half** | Instant buyout only (`status: securable`), 10 uses remaining (`FULL_USES`), cheapest first, so a typed price is one the player could buy at. The link is built locally (`tradeLink.ts`) and opened by the player's browser; the app never queries the trade site. `≈` marks a search whose stat ids cover more than one wording, so it can list a near-identical modifier — recorded per modifier in `trade-stats.json`, not guessed at render time |
| 70 | "Modifier odds: Morce Faster's rolling data (19,147 modifiers seen)" | `TabletsTab.tsx` footer | **OK** | `ODDS_CREDIT` sums the sightings in `morce-faster.json` (10,947 + 5,000 + 3,200). Every tablet weight in the shipped data is read from those counts — the game files and poe2db publish 1 for every tablet modifier |
| 71 | "Super jackpot" / "Jackpot" / "Very good" / "Good" | `TabletResult.tsx` watch list | **OK — a tier, not a price** | The tiers of `data/tablets/valuable.json`, set per tablet from instant-buyout listings (10 uses left) read on the trade site on its `pricedOn` date — kept in the file as provenance, never shown, because a price goes stale within days. The row's own box is for today's price |
| 72 | "Counting what else can land…" | `SolveProgress.tsx` | **OK** | The phase while `markovReplay.ts` plays the solved plan to count the watch list. Its share of the bar is crafts played over crafts asked, or time spent over its 2 s clock — whichever will end it — so the bar reaches the end when the replay does |
| 73 | "no odds while the cost is only a bound" | `TabletResult.tsx` watch list | **OK** | Shown when the model stopped at a bound (`bound !== 'exact'`): `markovFromItem` replays only an exact solve, because a bound's policy is not a plan to follow. Reached by asking for two of the rarest suffixes at once (of Undertaking and an extra Ritual reroll: "≤ 49,282 ex") |
| 74 | "Crafting it costs X on average … the plain tablet you start from and the Exalts that fill it to four modifiers included" | `TabletResult.tsx` | **OK** | X = the typed plain-tablet price + the model's V, solved with `spare` = every slot not picked and `fillOnFinish` (one Exalt per slot still empty, charged at finish, `markovFromItem.ts`). The model prices restarts; the first tablet is added once here. The replay pays the fill on its real tablets and agrees on what it adds (1.06 vs 1.08 Exalts, `markovReplay.test.ts`) |
| 75 | "Half the crafts cost less than X; 1 in 10 costs more than Y (N crafts played out)" | `TabletResult.tsx` | **OK — measured, and the count is printed** | The 50th and 90th of `ReplayResult.costPercentiles` (nearest rank, every craft played — `markovReplay.ts`), plus the first plain tablet. Under 500 crafts it adds "a rough read" |
| 76 | "Profit per tablet: about X on average — counting what you sell on the way" / "Loss per tablet … buying one is cheaper" | `TabletResult.tsx` | **OK** | Typed price − net, where net = plain tablet + replayed spend − replayed sales when anything is priced, else plain tablet + V |
| 77 | "Spend up to what it sells for, and you finish Y% of the time" | `TabletResult.tsx` | **OK** | `shareWithin(percentiles + plain tablet, typed price)` — the share of played crafts that came in at or under it, in whole percents |
| 78 | "Why this plan": "It starts a fresh tablet whenever a roll misses…" / "keeps one tablet and rerolls it with Chaos Orbs…" / "mixes the two…" and "An average craft uses …" | `TabletResult.tsx` | **OK — read off the played plan** | `summarizePlan(ReplayResult.movesPerCraft)`: restarts ≥ 1 a craft → fresh, Chaos ≥ 1 → chaos, both → mixed, neither → direct. The prices quoted are the sheet's Chaos/Annul and the typed plain tablet; the claim that the chosen way is cheaper is the solver's, whose policy is optimal over all of them |
| 79 | "Selling what lands on the way: about R a craft … the craft costs about N net" / "you'd sell one in X% of crafts" | `TabletResult.tsx` | **OK — measured, with a stated rule** | `ReplayResult.sales`: the replay fills the item (Regal if Magic, then Exalts) and sells it when the TYPED price, less that filling, beats `restartCost + V(start) − V(here)`; it sells at the best priced set the full item holds (a one-step improvement on the solved policy, so never worse). N = plain tablet + replayed spend (incl. the fresh tablets sales force) − R |
| 80 | "Find a plain one on trade" | `TabletsTab.tsx`, beside the plain-tablet price | **OK** | `tradeUrl({ …, stats: [], normalOnly: true })`: the tablet picked, rarity Normal (`type_filters.rarity`), 10 uses remaining, instant buyout, cheapest first — the price the craft's restarts are charged at |
| 81 | Unit menu "ex / chaos / div" on every tablet price box | `PriceInput.tsx` | **OK** | `priceUnits(rates)`: exalts always, Chaos and Divine only when the sheet has their rate. The typed number × `perExalt` is stored in exalts (`TypedPrice.ex`), with the unit it was typed in (`TypedPrice.unit`) so the box reads it back that way; the conversion is at the rate on the day it was typed |
| 82 | "Not played out: too long a craft to play out — about N orbs and fresh tablets a craft…" | `TabletResult.tsx`, from `markovReplay.ts` | **OK — measured** | The replay declines when its 64 minimum crafts would outrun 3× its 2 s clock (`GIVE_UP_AFTER`), or one craft passes 1,000,000 moves; N = moves over crafts played so far, or "over" the moves of the one still running when that is larger. Every move counts, a fresh tablet included. Ritual Effectiveness + Rarity + Unique Monsters' extra Rare modifier + extra Favour reroll: ~270,000, declined at ~6 s |
| 83 | "the solver stopped before it could put a number on this craft — raise Search effort…" | `markovFromItem.ts` | **OK** | Phase A did not settle within the caller's clock OR sweep cap; the app's Search effort raises both. Was "ran out of time … a six-mod target at T1", wrong for a tablet that spends Standard's 100,000 sweeps in 1.5 s |
| 84 | "Search on trade" (gear) / "≈" / "Or buy it already made — every modifier at the tier you asked or better" / "The target item, already made:" | `GearTradeLink.tsx`, `EngineLab.tsx` (target list header and cost card), `ItemActions.tsx`, `StartFromItem.tsx`, `WhatToBuy.tsx` | **OK** | `gearSearch` (gearTrade.ts): trade category from the base's class (`TRADE_CATEGORY`, Exiled Exchange 2's mapping), rarity nonunique / magic / rare, one filter per line of each modifier's text from `data/trade/gear-stats.json` with min = the asked tier's lowest roll (the average of the two for "Adds # to #"; none for any tier or a "reduced" line), explicit + desecrated + fractured ids. `≈` when a modifier line has no trade stat (60 of 3,086, e.g. Mark of the Abyssal Lord) or its ids cover local and global. Instant buyout, cheapest first; the app never queries the trade site |
| 85 | "ex / chaos / div" switch on the tablet result ("Show prices in") | `TabletResult.tsx` | **OK** | `readShownUnit()` (tabletPrices.ts): chaos unless the player picked another, per browser. Every figure on the result — cost, spread, sales, the verdict bars, the risk chart, the Why box and the route graph (`PolicyGraph`'s `unit`) — is `formatIn(unit, ex)`; a new price box and the plain-tablet box start in it |
| 86 | "Craft N tablets and you come out ahead X% of the time — about P over the run. Have about B on hand…" / "Plan a run" table | `RunPlan.tsx` | **OK — resampled** | `planRuns` (tabletRun.ts): 2,000 runs of up to 500 crafts, each craft's cost drawn from the replay's percentiles (interpolated), paid in full then sold at the typed price + average sold on the way. N = the shortest run ahead ≥ 90% of the time; P = N × (income − the replay's exact mean cost); B = the 90th percentile of the deepest a run is down before a sale. Seeded, so it does not change between renders |
| 87 | "How is this worked out?" — You spend / You get tables, "A − B = C profit a tablet", "How sure: N crafts pin the average spend to within ±M, 19 times in 20" | `ProfitBreakdown.tsx` | **OK** | Spend: `spendBreakdown` — plain tablets = 1 + restarts + sales, each orb `movesPerCraft × sheet price`, the remainder (never counted as moves) = the Exalts filling the finished tablet; sums to plain + `replay.meanCost` exactly. Get: the typed price + `sales.perEntry[i] × typed price`. When nothing sells the verdict uses the solver's V and the panel says both. M = 1.96 × `replay.stdErr` |
| 88 | "Pays while a plain tablet costs X or less — you typed Y" / "Or while it sells for Z or more" | `TabletResult.tsx` | **OK — a floor, measured** | X = `plainBreakEven`: (tablet price + sold on the way − every non-plain line of `spendBreakdown`) ÷ plain tablets a craft — the spend with the plan held fixed is linear in the price, and the optimal plan at any other price is never dearer. Ritual reroll: 154.4 ex; re-solved there, −0.21 ± 5.46 chaos. Z = the verdict's spend − sold on the way |
| 89 | "Tip · buy a Magic one instead" / "Magic · one prefix, no suffix — worth up to X — more than a plain one / about a plain one / less than a plain one: only under this price" | `StandInTip.tsx` | **OK — from the solve** | `standIns` (tablets.ts): Magic with one junk prefix, Magic with one junk suffix (Dorian: only those two are on the market), worth = plain + V(white) − V(state), V read off `markov.routes`; both always shown. Search: Magic + `FULL_USES` + `standInFilters` — one filter on the other side, "# Empty Suffix Modifiers" ≤ 1 for prefix-only and "# Empty Prefix Modifiers" ≤ 1 for suffix-only, as the site answers it (checked by Dorian) |
| 90 | "Start from: Plain tablet · Magic · one prefix · Magic · one suffix" / "A Magic tablet with one prefix costs" / "Find one on trade" / "the Magic tablet with one prefix you start from" | `TabletsTab.tsx`, `TabletResult.tsx` | **OK** | A Magic start solves `from.item` = Magic holding `standInJunk` (the highest-share modifier on that side neither chosen nor ruled out by the choice), `rebuyable` so restarts buy another at the typed price. Every line that named "plain tablet" names the start (`START_NAMES`): the cost sentence, Why box, plan chips, breakdown, break-even. Invariant: at the tip's worth, plan cost from Magic = plan cost from plain (solve.test) |
| 91 | "What to do with each tablet" — "Magic · one prefix, none of them wanted → Regal", "Stop — run or sell it, start a new plain tablet" | `TabletMoves.tsx` | **OK — the policy** | Every non-goal, non-restart node of `markov.nodes` (the states the policy reaches) with its `action` and `expectedCost`, labelled by rarity, targets held and junk per side, deduplicated by label. "Stop" = the node's action is the restart ("Start over with a new base"), shown with no cost |
| 92 | "Add your own:" / "Add to the list" / "Yours" / "Hide" · "Remove" / "N hidden — show them again" | `AddWatch.tsx`, `TabletResult.tsx` | **OK** | `watchList(tablet, targets, prefsFor(store, tablet))`: the player's sets first as tier `yours`, curated ones less those hidden (by `setPriceKey`), a curated set also added listed once as theirs. Stored in `poe2htc.tablets.watch` (tabletWatch.ts, guarded); every change recomputes the solved craft |
