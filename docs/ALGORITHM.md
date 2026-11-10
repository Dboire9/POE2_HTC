# How POE2 HTC works out a craft

This is the maths behind the numbers. The [user guide](USER_GUIDE.md) explains the screens; this explains
what they compute. Where a figure rests on an assumption rather than published data, it says so, and so
does the app. Rewritten 2026-11-10 to match the code; the reasons behind each design are in
[engineering-notes.md](engineering-notes.md), the measurements in [validation.md](validation.md).

## Contents

1. [The question](#the-question)
2. [One orb: an exact weighted draw](#one-orb-an-exact-weighted-draw)
3. [Step routes: a fixed sequence, priced](#step-routes-a-fixed-sequence-priced)
4. [The true expected cost: playing the craft optimally](#the-true-expected-cost-playing-the-craft-optimally)
5. [What is assumed, and what is not modelled](#what-is-assumed-and-what-is-not-modelled)
6. [How it is checked](#how-it-is-checked)

---

## The question

A player names a base, an item level and the modifiers they want, each at a tier or better. The app
answers two things:

- **Step routes.** Fixed sequences of orbs ("Transmute, then Augment, then Regal"), each with the chance
  one attempt succeeds and what one attempt costs. These are recipes a player can follow and talk about.
- **The true expected cost.** The average spend to reach the target when every decision is made well
  after seeing what each orb did: keep a good roll, repair a bad one in place, change orb strength, or
  start over when that is cheaper. This is the number the app leads with.

Everything runs in the browser, in a Web Worker, on a pure-TypeScript engine (`packages/engine`) and
optimizer (`packages/optimizer`). Nothing is sampled to produce an answer; simulation only checks them.

## One orb: an exact weighted draw

Every random outcome in PoE2 crafting is a weighted draw from a known pool, so its chance is a ratio of
weights (`packages/engine/src/probability.ts`, `pool.ts`):

```
P(the orb lands mod X at tier T or better) = weight(X's eligible tiers) / weight(everything that can roll)
```

What counts as "can roll" is where the rules live:

- **Side and slots.** An item holds 3 prefixes and 3 suffixes when Rare, 1 and 1 when Magic, with the
  base's own limits read from the data (`limitsOf`; a socketed Serle's Triumph allows a fourth suffix).
  With both sides open the draw is over both pools; with one full, over the other alone.
- **Families.** An item holds at most one modifier of a family, so every family already on it is taken
  out of the pool (`familiesOf`, `excluded`). This is why order matters: what lands first shrinks every
  later denominator.
- **Item level.** A tier rolls only if its level is at most the item's.
- **Orb strength.** A Greater or Perfect orb rolls only tiers of at least a minimum modifier level:
  Transmutation and Augmentation 55 / 70, Regal and Exalted 35 / 50 (`CURRENCY_FLOOR`). A stronger orb
  can make a top tier far likelier — or impossible, when the tier you want is below its floor.
- **Omens.** Sinistral / Dextral Exaltation confine an Exalt to one side; Sinistral / Dextral Annulment
  an Annulment's removal; the Omen of Light removes the desecrated mod; Crystallisation omens fix which
  side a Perfect Essence replaces; the Omen of Whittling makes a Chaos Orb remove the lowest-level mod.
- **Fractured mods** are never removed. One you did not ask for is part of the base for the true expected
  cost: its side holds one mod fewer, the finished item keeps it (so it needs a free slot on that side),
  and its family can never roll.

The currencies, as modelled:

| Currency | What it does |
|---|---|
| Transmutation | Normal → Magic, adds one mod |
| Augmentation | adds one mod to a Magic item |
| Regal | Magic → Rare, adds one mod |
| Exalted | adds one mod to a Rare |
| Chaos | removes one random mod, then adds one |
| Annulment | removes one random mod |
| Alchemy | Normal → Rare with four mods (step routes only) |
| Essence | Magic → Rare, forcing its mod |
| Perfect Essence | on a Rare, replaces a mod with its own |
| Desecration (a bone) | adds a desecrated or ordinary mod — see below |

**Desecration** is two different draws. With a boss omen it picks uniformly among that boss's carved
mods. Without one it draws, by weight, over the base's ordinary and desecrated pools together. Either
way it shows three and the player keeps one, so its value is the best of three draws, not one draw. An
item carries at most one bone-placed mod at a time.

## Step routes: a fixed sequence, priced

`optimize.ts` (from a white base), `fromItem.ts` (from an item you hold), `alternatives.ts`.

**A route's chance** is the product of its steps' chances, each computed on the item as it stands after
the steps before it succeeded (`evaluatePlan`):

```
P(route) = p₁ · p₂ · … · pₙ
```

**Its cost** assumes you start over on the first miss, so each step is paid as often as you reach it:

```
E = (c₁ + c₂·S₁ + c₃·S₂ + … + cₙ·Sₙ₋₁) / Sₙ          where Sₖ = p₁·…·pₖ
```

The app shows a route's chance per attempt and what one attempt costs, and no longer shows this total.
"Start over on the first miss" is a policy forbidden to repair, which nobody follows and which the true
expected cost always beats or equals (TODO 16).

**Searching.** The planner lists sensible orders of the targets and which currency places each — an
Essence for an essence-only mod, Alchemy as a four-mod opener, a Perfect Essence swap, a Desecration —
and drops illegal shapes up front (`validate.ts`). For each order it then chooses every step's orb
strength and omen. That choice cannot be enumerated (three strengths and an omen per step, across
millions of orders), and it does not need to be: strength and omens change a step's chance and price but
never what the item looks like afterwards, so the cost separates. Rewritten over the suffix products
`Tₖ = pₖ·…·pₙ`, it is `E = Σ cₖ / Tₖ`, which a backward pass over the steps optimises exactly, dropping
any partial plan another beats on both chance and cost (`leverDp.ts`). The result is a **frontier**:
every plan that no other plan beats on both success chance and cost.

## The true expected cost: playing the craft optimally

`markovFromItem.ts` and the `markov*.ts` files beside it. This is a Markov decision process: states of the
item, actions with their real outcome distributions, and the cheapest average way from the start to a
finished item.

**The state.** Not the item's every mod, which would be far too many, but what matters for the rest of
the craft (`markovState.ts`):

- for each target: missing, **present** at the tier asked or better, or **blocked** — its family is taken
  by a roll below the tier, or by a different mod of the same family, so it must come off first;
- how many unwanted ("junk") mods sit on each side;
- which mod, if any, a bone placed — it decides whether another bone can be used;
- the rarity: Normal, Magic or Rare.

Targets the player said were interchangeable ("Fire or Cold or Lightning") are merged when they share a
family, which is exact, and stored once when the data proves them indistinguishable
(`markovSymmetry.ts`). Free slots ("any prefix") are an allowance of junk at the end, not a target. A
six-target craft is a few thousand states.

**The actions** are every orb that can act on the state, at every strength the sheet prices, with every
omen it can take, plus "start over" when a base has a price. Each gives a distribution over next states
computed from the pools as in the previous section (`markovActions.ts`). A currency the sheet does not
price is not offered at all — an unpriced orb is unavailable, never free (`stepIsPriced`).

**Solving.** The value V of a state is the least expected spend from there to a finished item:

```
V(finished) = 0
V(s) = min over actions a of [ cost(a) + Σ P(s → s′ | a) · V(s′) ]
```

- An action that can leave the item unchanged is solved for its own loop exactly, by dividing by the
  chance it does something.
- States from which the goal cannot be reached **for sure** are found first and set to infinity, so they
  cannot drag the rest along (`prob1`).
- **Phase A** solves without "start over", climbing from zero by value iteration. **Phase B** adds it and
  starts from phase A's values, which are too high, so they fall to the answer and the policy is
  sensible even if stopped early. Phase B is **policy iteration** in every Search effort: it alternates
  "pick the best action in every state" with "cost that whole plan exactly" — in closed form, since each
  attempt either finishes or starts over — and stops when no state changes its action, which proves the
  plan optimal.
- When a solve runs out of time it says what its number is: **exact**, or a **ceiling** (≤) or a
  **floor** (≥). The app shows the marker, and draws tables only for exact answers.

The optimal action in every state is the **policy**. The app draws it as a route (the way most crafts
that finish go) and a graph (every state and what each orb can do to it), and Craft along reads it one
move at a time.

## What is assumed, and what is not modelled

**Assumed, and shown on screen when it matters:**

- **The desecrated spawn weight.** The data source publishes none, so every desecrated mod is given
  2,500, measured from 40 bones' offers in game (`tools/refresh/apply_pools.mjs`). It affects a
  Desecration without a boss omen only.
- **Rune modifier pools.** A rune that adds its own pool has no published weight either.
- **Prices** are poe.ninja's, refreshed daily. A few are inferred or hand-copied when nothing trades; the
  price note names them.
- **Ties under Whittling.** When several mods share the lowest level, one is taken uniformly (untraced).

**Approximated in the true expected cost:**

- The state counts junk, not which junk, so a junk mod's family comes out of the next roll's pool **on
  average** (mean-field). Measured within 2% of playing the plan on real items, on all 18 crafts checked
  (TODO 23).

**Not modelled in the true expected cost** (the step routes have some of them): the Omen of Whittling and
the Erasure omens, which need each mod's level (TODO 12b, 12c, 27); Greater Exaltation and stronger
Chaos Orbs, built and measured to change no answer (TODO 14a, 5d); Alchemy. Recombinators are not
modelled anywhere.

## How it is checked

- **Monte Carlo.** A seeded simulator plays routes thousands of times, and `markovReplay.ts` plays the
  optimal policy on real items — concrete mods, not the abstract state — and compares the average spend
  with V. That is how the junk-family error above was found and measured.
- **Craft of Exile.** The single-orb odds were cross-checked against craftofexile.com; divergences are
  logged in [validation.md](validation.md).
- **The Java original.** The mechanics ported from the old engine are pinned to frozen golden outputs.
- **Frozen prices.** Tests that assert an exact cost read a price sheet frozen on 2026-08-22, so the
  daily refresh cannot move them; everything else reads the live sheet, and the price bot runs the
  whole suite before it merges.
