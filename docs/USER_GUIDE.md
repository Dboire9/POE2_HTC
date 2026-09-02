# User Guide — POE2 How To Craft

This guide covers the app as it runs at **[poe2htc.com](https://poe2htc.com)**. It explains every panel,
what each number means, and — just as importantly — what each number *doesn't* mean.

If you want the maths rather than the buttons, read [ALGORITHM.md](ALGORITHM.md) instead. This guide and
that one are meant to agree; if they ever don't, ALGORITHM.md is the one that's right.

## Table of Contents

- [Getting started](#getting-started)
- [The two tabs](#the-two-tabs)
- [Plan from scratch](#plan-from-scratch)
  - [1. Pick a base and item level](#1-pick-a-base-and-item-level)
  - [2. Choose the mods you want](#2-choose-the-mods-you-want)
  - [3. Tiers, alternatives and pins](#3-tiers-alternatives-and-pins)
  - [4. Find plans](#4-find-plans)
- [Reading the results](#reading-the-results)
  - [Your options — the plan cards](#your-options--the-plan-cards)
  - [True expected cost — and why it's lower](#true-expected-cost--and-why-its-lower)
  - [The bound markers: "≥ x" and "≤ x"](#the-bound-markers--x-and--x)
  - [The policy graph](#the-policy-graph)
- [I have an item](#i-have-an-item)
  - [Quick currency check](#quick-currency-check)
  - [Full plan to a target](#full-plan-to-a-target)
  - [Why this tab reads differently](#why-this-tab-reads-differently)
- [Budget mode](#budget-mode)
- [Search effort](#search-effort)
- [Currency I don't have](#currency-i-dont-have)
- [Sharing a workspace](#sharing-a-workspace)
- [Where the numbers come from](#where-the-numbers-come-from)
- [Troubleshooting](#troubleshooting)
- [PoE2 crafting, briefly](#poe2-crafting-briefly)
- [FAQ](#faq)
- [Glossary](#glossary)
- [Getting help](#getting-help)

---

## Getting started

Open **[poe2htc.com](https://poe2htc.com)**. That's it — there is nothing to download, no account, and
no server. The whole engine is JavaScript running in your browser; nothing you type leaves your machine.

The first load pulls the modifier data for patch 0.5.0 — about 1 MB, and 85 kB over the wire once
compressed. After that the page works offline.

Running it yourself instead? `npm run dev` serves it at `http://localhost:5173` — see
[DEVELOPMENT.md](DEVELOPMENT.md).

---

## The two tabs

At the top of the page:

| Tab | Use it when |
|---|---|
| **Plan from scratch** | You have (or can buy) a white base and want to know how to craft it up |
| **I have an item** | You're mid-craft, holding something with mods already on it, and want the best move from *here* |

They are genuinely different questions and the app answers them differently. Most of the confusion
people report comes from reading a "Plan from scratch" number as though it applied to the Rare in their
stash — see [Why this tab reads differently](#why-this-tab-reads-differently).

---

## Plan from scratch

### 1. Pick a base and item level

- **Base** — the item type, e.g. *Attuned Wand*. Available mods change completely with the base.
- **Item level** — the ilvl of the white base you'll start from. This is a hard gate: a tier that
  requires ilvl 82 simply cannot roll on an ilvl 75 base, and the planner will tell you so rather than
  pretending otherwise.
- **Base cost** *(optional)* — what another white base costs you. Leave it blank for the default. Type
  `0` and you're telling the planner bases are free, so it will happily bin a nearly-finished item and
  start over; that's the right answer if you're farming your own bases and the wrong one if you're
  buying them. A typed `0` is a real answer and a blank field is "no opinion" — they aren't the same.

### 2. Choose the mods you want

Mods are listed in two columns, **Prefixes** and **Suffixes**. A Rare can hold at most 3 of each. Click
a mod to add it to your target.

The list shows what can actually roll on the chosen base at the chosen item level. If a mod you expect
isn't there, the base or the level is why.

**Sources.** Most mods roll from the normal pool. Some are **essence-only** — they can only be placed by
an Essence. Others are **desecrated** — only a Bone offering places them. The app marks these and routes
accordingly.

### 3. Tiers, alternatives and pins

- **Target tier** — every target mod carries a tier selector. It means *"this tier **or better**"*, not
  "exactly this tier". Tier 1 is the best roll. Asking for T1 on six mods at once is what makes a craft
  cost billions; asking for "T3 or better" is usually the same item for a tiny fraction of the money.
- **Or / alternatives** — the `or` button on a target row adds an alternative to that slot. The slot
  counts as filled by *whichever one lands*. Use this when you'd be happy with any of several mods —
  it can cut the cost by orders of magnitude and costs you nothing.
- **Fractured** — mark a mod as fractured if it's already locked on your base. A fractured mod can't be
  removed or rerolled, so this changes the whole route; the planner starts from a Rare rather than white.
- **Pin** — pin a target as non-negotiable so budget mode may not relax it. Only relevant with a budget.

### 4. Find plans

Press **Find plans**. The solve runs in a Web Worker, so the page stays responsive; you get a progress
bar and a **Cancel** button. Long solves are normal — see [Search effort](#search-effort).

---

## Reading the results

### Your options — the plan cards

The heading reads **"Your options — cheapest to surest"**. Each card is one plan: a fixed sequence of
currencies, with per-step odds. The set of cards is a **Pareto frontier** — every plan on it is either
cheaper or likelier than every other, so none of them is strictly worse than another. There is no single
"best"; there's a trade.

On each card:

| Figure | What it means |
|---|---|
| **expected cost** | Total exalt-equivalents to *finish*, averaged over retries — i.e. cost per attempt divided by the chance an attempt lands |
| **chance per attempt** | Probability that one run of this exact sequence produces the item |
| **≈ n attempts** | How many runs it takes on average |
| **per attempt** | What a single run costs, whether or not it works |

Badges:

- **best value** — the plan with the best cost-to-success trade; highlighted with a ring
- **cheapest** — lowest expected cost
- **surest** — highest chance per attempt

A **very** low chance per attempt (say 0.000001%) with a huge expected cost is the app telling you this
craft is not realistic as a fixed recipe. That's information, not a bug — and it's exactly the case where
the **True expected cost** panel below will show a far smaller number, because a real crafter doesn't
restart from white every time.

### True expected cost — and why it's lower

Below the plan cards sits a single figure: **True expected cost**.

The plan cards price a *script*: do these steps, and if any step misses, throw the item away and start
again. That's a fair model of crafting from a white base you can rebuy, and it's how nearly every
crafting calculator works.

It's also not how anyone actually crafts. If you Exalt onto a Rare and get the wrong mod, you don't bin
it — you look at what you're holding and pick the best move *from there*: annul it off, chaos it, or
accept it and carry on.

The **True expected cost** is the cost of doing that optimally. The engine builds the full set of item
states you can reach, works out every legal move from each one, and solves for the policy that minimises
expected cost — a Markov decision process, solved by policy iteration. The number it produces is the
real one, and it is often *dramatically* lower than the cheapest plan card, because recovering in place
beats restarting.

**Which should you follow?** The policy, when it's available — it's a better strategy. The plan cards
are the readable version: a sequence you can follow without consulting the app after every orb. Use the
cards to understand the route, the true cost to understand the price.

### The bound markers: "≥ x" and "≤ x"

Sometimes the cost is printed as **"≥ 480 ex"** or **"≤ 480 ex"** rather than a bare number. This is
deliberate and it matters.

The policy solver iterates until the answer stops moving. If it hits its time or sweep limit first, it
stops with a value that hasn't settled — and the app knows *which side of the truth* that value is on:

- **≥ x** — the true cost is at least this. The solve was still finding improvements.
- **≤ x** — the true cost is at most this. The solver had a working policy but hadn't proved it optimal.
- **no marker** — the solve converged. This is the exact answer.

Raise **Search effort** and run it again to turn a bound into an exact figure. The app will never print
a confident number it hasn't earned.

### The policy graph

**Step-by-step routes** expands the policy into something you can read. Each node is an item state; each
edge is a move. Click any state to highlight the route through it and dim the rest.

A state shows:

| Field | Meaning |
|---|---|
| **Target mods held** | Which of your targets this item already has |
| **Stuck below tier** | Target mods present but rolled too low — they need rerolling, not adding |
| **Junk to clear** | Non-target mods occupying slots you need |
| **Placed by a Desecration** | Desecrated mods, which behave differently under Annulment |
| **Cost to finish** | Expected cost from *this* state onward |
| **Best move** | What the optimal policy does here |

If it says *"No route to show yet"*, the solve stopped before the policy settled — same fix as above,
raise Search effort.

---

## I have an item

Enter the base, the item level, the rarity, and the mods currently on it. Then pick one of two
sub-modes.

### Quick currency check

*"I'm holding this. What does one orb do?"*

Choose a **Mod to add** and/or a **Mod to sacrifice (Chaos / Annul)**, and the **Currency options** list
shows the chance a **single orb** does exactly what you asked, and what that orb costs.

**Which currencies it checks**, exactly — this list is the whole list, and it is shorter than the set
the planner searches:

| | when |
|---|---|
| **Exalted Orb** | Rare, you named a mod to add |
| **Chaos Orb** | Rare, you named both an add and a sacrifice |
| **Orb of Augmentation** | Magic, you named a mod to add |
| **Regal Orb** | Magic, you named a mod to add |
| **Orb of Annulment** | you named a mod to sacrifice |
| **Annulment + Omen of Light** | …and that mod is a desecrated one on a desecrated item |

**Bones, essences and orb strengths are not here.** That is a limit of this panel, not of the engine
or of the game — the *Full plan to a target* sub-mode and the true-cost model both use all of them.
If you want to know what a Desecration or a Greater Exalt does to your item, ask there.

This is a per-orb number, not a plan. How many orbs it takes overall depends on what you do after a
miss — that's the other sub-mode.

Where a currency can't apply, the row says why rather than hiding.

### Full plan to a target

*"I'm holding this. Get me to that."*

Set **What should the item end up as?** — the **final** mods you want. **Copy my current mods** seeds it
from what you have. Anything on your item that isn't in the target list is treated as junk and will be
removed; anything that *is* in the list is kept, not re-rolled.

Then **Compute plan**. You get the same two views as the Lab: plan cards, and the true expected cost with
its policy.

### Why this tab reads differently

Look closely and the plan cards here show different figures: **chance per attempt** and **what one run
costs**, ordered *likeliest first*, with a **likeliest** badge instead of *best value*.

The reason is honest bookkeeping. The expected-cost model assumes a failure costs you nothing but a
restart — you buy another white base. That's true from white. It is **fiction** for the Rare in your
stash: you only have one of it.

Under that fiction the ranking actually inverts and produces nonsense. An Orb of Annulment costs about
159 ex against an Exalt's 1 ex, so a plan that hides its Annulments behind a 0.1% gate you rarely reach
"saves" roughly 65× on paper — and the "cheapest" plan becomes one no player would ever run. So on this
tab the total and the attempt count are dropped, the likeliest route leads, and the two figures that
survive are the ones you can act on: **how often one run lands**, and **what one run costs**.

The **True expected cost** panel below is unaffected and remains the number to trust — the policy solver
never assumed a free restart.

---

## Budget mode

Type a number into **Budget (exalts, optional)** and a new panel appears: **Closest crafts for N ex**.

This answers *"what is the best item this money can actually finish?"* — not *"what's the average cost
of my dream item"*, which busts about half the time by definition.

Each row is a real, craftable item, ranked **closest to what you asked for first**, with the probability
you **finish it for ≤ your budget**. Because the rows get easier as you read down, the odds rise down the
list, and the last row is the surest thing you can afford.

Row 0 is always your exact target, however hopeless — that's the point of the panel. Use **pin** on a
target mod to forbid the search from relaxing it.

If the panel says *"No craftable alternative found"*, that is **not** about your budget: the closest item
is always listed, whatever the odds. It means nothing in the target's neighbourhood could be planned at
all — usually a tier gated above your item level, or a mod that can't roll on that base.

---

## Search effort

A dropdown next to the compute button, with three settings:

| Setting | Time | Use |
|---|---|---|
| **Quick** | a couple of seconds | Likeliest to come back asking for longer instead of an answer |
| **Standard** | ~25 s on a big budgeted craft | The default |
| **Exhaustive** | minutes | For crafts nothing shorter can finish — every one measured settled inside five |

Effort is not about accuracy of the maths — every probability shown is exact at every setting. It's about
whether the search finishes. A higher setting turns "≥ x" bounds into exact answers and finds routes a
shorter search missed. If a result says it stopped early, this is the control to reach for. When you're
already on Exhaustive the app says so instead of pointing you at a setting with nothing above it.

---

## Currency I don't have

Don't own Perfect Exalts? Refuse to buy Omens? Expand **Currency I don't have** and mark them. The
planner then routes around them entirely, rather than quoting you a plan you can't run.

The rule has two levels, and it's worth reading once:

- **Mark a row** — e.g. *Exalted Orbs* — and the **whole group** is excluded: Basic, Greater and Perfect.
- **Then tick members inside it** — e.g. just *Perfect* — and the exclusion **narrows** to only those.
  So "I have Basic and Greater Exalts but not Perfect" is: mark *Exalted Orbs*, tick *Perfect*.

Because ticking members narrows rather than widens, unticking your last member widens the exclusion back
out to the whole group. Every marked row states its effect in words underneath, so you can always read
what you've actually said.

Groups available: *Chaos Orbs*, *Exalted Orbs*, *Orbs of Annulment*, *Orbs of Alchemy*, *Regal Orbs*,
*Orbs of Transmutation*, *Orbs of Augmentation*, *Essences* (Lesser / Normal / Greater / Perfect),
*Desecration (bones)*, *Greater and Perfect orbs and essences* (every strength in one row), and *Omens*
— all of which are listed individually by name.

Excluding something removes it from both solvers, so the true expected cost respects your exclusions too.

---

## Sharing a workspace

**Copy link** puts a URL on your clipboard that reproduces your current setup — which tab you're on,
the base, item level, targets and their tiers, alternatives, fractured marks, pins, budget, base cost,
and on the item tab the rarity and the mods you entered. Paste it in Discord to ask someone about a
craft, or keep it as a bookmark. Nothing is uploaded; the whole workspace is encoded in the link itself.

Two settings are deliberately **not** in the link: **Search effort** and **Currency I don't have**. Those
describe *your* machine and *your* stash, not the craft — a link that silently imposed the sender's
patience or the sender's missing currency on the recipient would answer a different question than the one
they thought they were opening.

---

## Where the numbers come from

**The odds are exact.** They're analytic weight-pool calculations over the real 0.5.0 modifier data —
the same arithmetic the game does, not a simulation. They're differential-tested, cross-checked against
Craft of Exile, and independently validated by a Monte-Carlo simulator. There is no sampling noise
because there is no sampling.

**The costs are those odds multiplied by a price sheet.** Currency and omen prices come from
[poe.ninja](https://poe.ninja) for the live league; the date is printed under every cost figure. Some
prices — desecration and essences — are still hand-authored estimates, and where that's true the app
says so in amber rather than quietly.

This matters more than it looks: because the optimizer *ranks plans by cost*, a stale **relative** price
changes which route it recommends, not just the total on it. Use costs to compare plans; don't budget to
the last exalt off them.

**One probability is not exact, and the app flags it.** A Desecration used **without** a boss omen draws
by weight from the combined normal and desecrated pool, and no data source publishes weights for
desecrated mods. The shipped value is measured in game (40 bone offerings on one base) rather than
guessed, but one base can't rule out per-category variation. Plans that use an unomened Desecration carry
a warning; a boss-omened one is count-uniform, ignores weights entirely, and stays exact.

---

## Troubleshooting

### "No plans found" / empty results

In rough order of likelihood:

1. **A tier is gated above your item level.** T1 mods commonly need ilvl 80+. Lower the tier or raise
   the level.
2. **A mod can't roll on that base.** Check the mod list — if it isn't offered, it can't roll.
3. **Two targets are in the same family.** PoE2 allows only one mod per family; two targets from the
   same family are mutually exclusive.
4. **You asked for more than 3 prefixes or 3 suffixes.**
5. **An exclusion closed the only route.** Clear **Currency I don't have** and retry to check.
6. **The planner genuinely doesn't model that route.** It has no concept of "roll filler and annul it
   off", so a few real routes are outside its search. The policy solver may still find one.

### A cost is shown as "≥ x" or "≤ x"

The solve didn't converge. Raise **Search effort**. See
[The bound markers](#the-bound-markers--x-and--x) — the marker tells you which side of the truth you're
on, so a "≤" figure is still a usable ceiling.

### It says "stopped early"

The search hit its node cap. The ends of the list are solid; the middle is sampled. Raise Search effort
for a complete list.

### It's taking a long time

Big targets are genuinely expensive to solve — six T1 mods is an enormous state space. The solve runs off
the main thread, so you can keep using the page, and **Cancel** always works. Lower Search effort, or
relax a tier, or add alternatives with `or`.

### The numbers changed since last time

Prices are refreshed from poe.ninja periodically and the engine itself improves. The date under every
cost figure tells you which sheet you're looking at.

### "True expected cost" is much lower than the cheapest plan

That's expected and correct — see
[True expected cost](#true-expected-cost--and-why-its-lower). The plan restarts from scratch on a miss;
the policy recovers in place.

---

## PoE2 crafting, briefly

Enough to read the app; not a crafting guide.

### Rarity

| Rarity | Mods |
|---|---|
| **Normal** (white) | none |
| **Magic** (blue) | up to 1 prefix + 1 suffix |
| **Rare** (yellow) | up to 3 prefixes + 3 suffixes |

Rarity goes up, not down — a Transmutation makes white into Magic, a Regal makes Magic into Rare. An
Orb of Annulment removes a mod but does **not** downgrade rarity, which is what makes several recovery
routes possible.

### Currencies the engine models

| Currency | What it does |
|---|---|
| **Orb of Transmutation** | White → Magic, with one random mod |
| **Orb of Augmentation** | Adds the second mod to a Magic item |
| **Regal Orb** | Magic → Rare, adding one mod |
| **Exalted Orb** | Adds a mod to a Rare with a free slot |
| **Chaos Orb** | Removes a random mod and adds a new one |
| **Orb of Annulment** | Removes a random mod |
| **Orb of Alchemy** | White → Rare with a full set of mods |
| **Essences** | Guarantee a specific mod. Lesser / Normal / Greater / Perfect |
| **Bone offerings (Desecration)** | Place a desecrated mod |

**Strengths.** Transmutation, Augmentation, Regal, Exalted and Chaos all come in **Basic**, **Greater**
and **Perfect**. A stronger orb raises the *minimum tier* the roll can produce — which is not always an
improvement: raising the floor also deletes low tiers from the pool, so a Perfect orb can be *worse* for
a mod whose good tiers sit low. The engine searches all three and picks per step.

**Omens** modify the currency used with them — the ones the engine models are Sinistral (prefix side),
Dextral (suffix side), Light, Crystallisation, Necromancy, the Blackblooded, the Liege, the Sovereign,
**Whittling** (a Chaos Orb removes your lowest-level mod instead of a random one) and **Greater
Exaltation** (one Exalted Orb adds two mods).
A *Dextral Exaltation* constrains an Exalt to add a **suffix**; a *Dextral Annulment* constrains an
Annulment to remove one; a *Dextral Crystallisation* constrains a Perfect Essence's removal. They are
different omens for different currencies — check what the plan step actually names before buying.

### Families

Mods belong to families and an item can hold only one mod per family. This is why "increased Physical
Damage" and "increased Physical Damage and Accuracy" can't coexist. The engine enforces it everywhere,
including in the policy solver's state space.

---

## FAQ

**Do I need to install anything?** No. It's a web page.

**Does it send my data anywhere?** No. The engine runs in your browser; the only network request is
loading the page and its data files.

**Which patch does it model?** 0.5.0.

**Are the probabilities accurate?** They are exact, with one flagged exception (unomened Desecration —
see [Where the numbers come from](#where-the-numbers-come-from)). They're cross-checked against Craft of
Exile and a Monte-Carlo simulator.

**Are the costs accurate?** They're as accurate as the price sheet, whose date is printed under every
figure. Currency and omens are live poe.ninja data; desecration and essence prices are estimates. Compare
plans with them; don't budget to the exalt.

**Why do the two cost figures disagree?** They answer different questions — a fixed recipe versus optimal
play. See [True expected cost](#true-expected-cost--and-why-its-lower).

**Can it plan for belts?** Yes, since 2026-09-02 — every equipment slot is supported. Belts appear as
a single base because all 20 of the game's belt bases share one identical craftable mod pool; they
differ only in their implicit, which is fixed on the base and cannot be crafted.

**What about charms and jewels?** No. Charms are flasks in the game's own data and jewels have their
own affix model, so neither is the 3-prefix/3-suffix rare this tool plans for.

**Does it support Omen of Whittling / Greater Exaltation?** Yes, both.

*Whittling* makes a Chaos Orb remove your **lowest-level** modifier rather than a random one, so it
appears as its own row on the frontier beside the plain Chaos route — compare the two and pick.

*Greater Exaltation* makes one Exalted Orb add **two** modifiers. The step routes reach for it when a
craft needs two more mods: a single orb gets both in either order, where two separate Exalts have to
land them in the order the plan wrote down. It shows up most on expensive orbs, because the omen is a
flat surcharge — one omened Greater Exalt costs less than two of them.

The **true cost** panel does not use Greater Exaltation, and that is deliberate rather than missing:
that model re-chooses after every single orb, so committing to two draws in advance costs it more
flexibility than the omen saves. Both behaviours were measured; see `docs/validation.md`.

**Why can't I target a Perfect-Essence-only mod from scratch?** The from-white planner doesn't model the
remove-and-add-on-Rare flow those need. Use the **I have an item** tab, which does.

---

## Glossary

| Term | Meaning |
|---|---|
| **Affix** | A prefix or suffix |
| **Tier** | Quality band of a roll. T1 is best; higher tiers need higher item level |
| **Family** | Group of mutually exclusive mods; one per item |
| **Pareto frontier** | The set of plans where none is both cheaper and likelier than another |
| **Expected cost** | Cost per attempt ÷ chance per attempt — the average total to finish |
| **True expected cost** | Expected cost under *optimal play*, recovering after bad rolls instead of restarting |
| **Policy** | The rule "in this state, do this" — what the MDP solves for |
| **ex** | Exalted Orb, the unit costs are quoted in |
| **ilvl** | Item level; gates which tiers can roll |
| **Fractured** | A mod locked onto the item; can't be removed or rerolled |
| **Desecrated** | A mod that only a Bone offering can place |

---

## Getting help

- **[Discord](https://discord.gg/RvxCWyFF3D)** — fastest, and the best place for "is this craft sane?"
- **[GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)** — bugs, with the **Copy link** URL for
  the workspace that shows the problem
- **[GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)** — feature ideas

The app also has a **Report a problem** control. It builds a complete report — app version, patch,
price basis, and the craft you were running — as a block you copy and paste wherever you like: Discord,
a GitHub issue, a message to a friend. It doesn't file anything for you.

---

*This is a third-party tool and is not affiliated with or endorsed by Grinding Gear Games.*
