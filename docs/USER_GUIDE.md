# User Guide — POE2 How To Craft

This guide covers the app as it runs at **[poe2htc.com](https://poe2htc.com)**. It explains every panel,
what each number means, and — just as importantly — what each number *doesn't* mean.

If you want the maths rather than the buttons, read [ALGORITHM.md](ALGORITHM.md) instead. This guide and
that one are meant to agree; if they ever don't, ALGORITHM.md is the one that's right.

## Table of Contents

- [Getting started](#getting-started)
- [The tabs](#the-tabs)
- [Plan from scratch](#plan-from-scratch)
  - [1. Pick a base and item level](#1-pick-a-base-and-item-level)
  - [2. Choose the mods you want](#2-choose-the-mods-you-want)
  - [3. Tiers, alternatives, free slots and pins](#3-tiers-alternatives-free-slots-and-pins)
  - [4. Find plans](#4-find-plans)
- [Reading the results](#reading-the-results)
  - [Your options — the plan cards](#your-options--the-plan-cards)
  - [True expected cost — and why it's lower](#true-expected-cost--and-why-its-lower)
  - [The bound markers: "≥ x" and "≤ x"](#the-bound-markers--x-and--x)
  - [The policy graph](#the-policy-graph)
  - [Start from an item you buy instead](#start-from-an-item-you-buy-instead)
- [I have an item](#i-have-an-item)
  - [Quick currency check](#quick-currency-check)
  - [Full plan to a target](#full-plan-to-a-target)
  - [Why the cards carry no total](#why-the-cards-carry-no-total)
- [Budget mode](#budget-mode)
- [Search effort](#search-effort)
- [Currency I don't have](#currency-i-dont-have)
- [Sharing a workspace](#sharing-a-workspace)
- [Tablets](#tablets)
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

## The tabs

At the top of the page:

| Tab | Use it when |
|---|---|
| **Plan from scratch** | You have (or can buy) a white base and want to know how to craft it up |
| **I have an item** | You're mid-craft, holding something with mods already on it, and want the best move from *here* |
| **Tablets** | You're rolling a Ritual, Overseer or Temple Precursor Tablet — see [Tablets](#tablets) |

The first two are genuinely different questions and the app answers them differently. Most of the confusion
people report comes from reading a "Plan from scratch" number as though it applied to the Rare in their
stash — see [Why the cards carry no total](#why-the-cards-carry-no-total).

---

## Plan from scratch

### 1. Pick a base and item level

- **Base** — the item type, e.g. *Attuned Wand*. Available mods change completely with the base.
- **Variant** — appears next to **Base** only when a category splits, and it splits on one of two
  axes. Armour splits by attribute (*Str/Int · Armour + ES*), because the Str/Dex/Int bases genuinely
  roll different pools. Wands and staves split by **spell element** (*Cold only · Frigid Wand*): a
  Frigid Wand cannot roll fire spell modifiers at all, so picking the wrong variant hides mods you
  were looking for — and picking the right one stops the planner offering a craft your base can't do.
  Categories with one shared pool show no Variant menu, which is why every belt is a single entry.
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

**Sources.** Most mods roll from the normal pool and need no special currency. The rest are labelled in
the picker, because what places them changes the whole route:

| Label | What places it |
|---|---|
| *(none)* | The normal pool — any orb that adds a mod |
| **· Essence only** | A regular Essence. Needs a **Magic** item; forces its mod and turns the item Rare |
| **· Perfect Essence** | A Perfect Essence, on a **Rare**. Forces its mod on and removes one existing mod at random |
| **· Alloy** | An Alloy — same mechanic as a Perfect Essence, different currency ([see below](#alloys)) |
| **· Desecrated** | A Bone offering (a Desecration) |

The app routes accordingly, and tells you when a mod is out of reach rather than quietly dropping it.

### 3. Tiers, alternatives, free slots and pins

- **Target tier** — every target mod carries a tier selector. It means *"this tier **or better**"*, not
  "exactly this tier". Tier 1 is the best roll. Asking for T1 on six mods at once is what makes a craft
  cost billions; asking for "T3 or better" is usually the same item for a tiny fraction of the money.
- **Or / alternatives** — the `or` button on a target row adds an alternative to that slot. The slot
  counts as filled by *whichever one lands*. Use this when you'd be happy with any of several mods —
  it can cut the cost by orders of magnitude and costs you nothing.
- **Any prefix / Any suffix** — at the top of each mod list. This is a position on the finished item
  whose contents you don't care about: the craft is finished with *anything* in it, and equally with
  *nothing* in it — you can Exalt or Desecrate the last slot afterwards and whatever lands counts.
  It is the opposite of an alternative. An alternative lists what would satisfy you; a free slot says
  nothing has to. Reach for it whenever a mod or two short of a full item is already the item you want.
  Two things to know:
  - It **uses up a position**, so three named suffixes plus a free one is four suffixes and the picker
    will refuse it.
  - The **plan cards don't use it**, and say so where you'd otherwise wonder. Every step in a route
    names the mod it aims at, so a route cannot decide after a roll which one was the spare. The
    **true expected cost** underneath can, and is where the saving shows. On the **I have an item** tab
    the step plan *does* use it — there the choice (leave that junk mod alone, or annul it) is made
    before any orb is spent, so a fixed sequence can express it.
- **Fractured** — mark a mod as fractured if it's already locked on your base. A fractured mod can't be
  removed or rerolled, so this changes the whole route; the planner starts from a Rare rather than white.
  **One per item**: a Fracturing Orb locks a single random modifier and can't be used on an item that
  already has one, so marking a second releases the first.
- **Pin** — pin a target as non-negotiable so budget mode may not relax it. Only relevant with a budget.

### 4. Find plans

Press **Find plans**. The solve runs in a Web Worker, so the page stays responsive; you get a progress
bar and a **Cancel** button. Long solves are normal — see [Search effort](#search-effort).

---

## Reading the results

### Your options — the plan cards

The heading reads **"Your options — likeliest first"**. Each card is one plan: a fixed sequence of
currencies, with per-step odds. The set of cards is a **Pareto frontier** — every plan on it is either
cheaper per run or likelier than every other, so none of them is strictly worse than another. There is
no single "best"; there's a trade: cheap runs that rarely land, or dear runs that often do.

On each card:

| Figure | What it means |
|---|---|
| **chance per attempt** | Probability that one run of this exact sequence produces the item. Long shots are written as odds — "1 in 5.3 million" — because a percentage that small is read by counting zeros |
| **what one run costs** | What a single run costs you, whether or not it works |

**There is no expected-cost total here, by design.** It divided one run's price by the chance it lands,
which prices binning your item and buying a fresh base after every miss — something nobody does six
steps into a craft. [True expected cost](#true-expected-cost--and-why-its-lower) answers the same
question properly, and it is allowed to start over when starting over really is cheapest.

There is no attempt count either: it was `1 ÷ chance per attempt`, the same number twice.

Cards are listed **likeliest first**, and every card is one you could reasonably pick — a route beaten
on *both* numbers by another route in the same list is not shown at all.

One badge: **likeliest** — the top card, the route with the best chance of landing in one clean run.

A **very** low chance per attempt (say 1 in 100 million) is the app telling you this craft is not
realistic as a fixed recipe. That's information, not a bug — and it's exactly the case where the
**True expected cost** panel will show something far more manageable, because a real crafter repairs
the item instead of restarting from white every time.

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
real one, and it is the only cost total the app shows, because recovering in place beats restarting —
and where it does not, the policy simply restarts, so it is never the worse answer.

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
| **Blocked** | Target mods whose family another roll already holds — the mod itself rolled too low, or a different mod of the same family (Cold spell damage where you want Fire). Annul it before rolling again |
| **In the way** | A modifier you didn't ask for that still blocks a target — from the other side of the item, or blocking two targets at once. Rare on gear; common on tablets |
| **Junk to clear** | Non-target mods occupying slots you need |
| **Placed by a Desecration** | Desecrated mods, which behave differently under Annulment |
| **Cost to finish** | Expected cost from *this* state onward |
| **Best move** | What the optimal policy does here |

If it says *"No route to show yet"*, the solve stopped before the policy settled — same fix as above,
raise Search effort.

### Start from an item you buy instead

Every craft planned from scratch has its own section, under the true expected cost, listing every item
you could **buy** that already carries some of your targets, and what finishing from it costs. It is
the answer to *"which item should I start from?"* — on a streamer's gear, **Craft this from scratch**
takes you straight to it. It is open by default; **Hide** folds it away, and it stays folded on later
crafts until you click **Show**.

- **Modifiers already on the item** — how many of your targets the item carries (2 to start with).
  Magic and Rare items are both listed, each tagged. A Magic item holds at most one prefix and one
  suffix, and its rows only ever carry modifiers an orb rolls — the planner has no other way to put a
  modifier on a Magic item.
- **Cost to finish** — the true expected cost from that item, playing the same optimal plan. That plan
  still drops the item and starts over from a white base when that is cheaper than repairing it: what
  you paid for it is spent either way.
- **Pay at most** — crafting from scratch (a white base plus the craft) minus the cost to finish. Pay
  less than this for the item and you come out ahead. *not worth buying* means finishing from it costs
  as much as starting over.
- **Trade price** — the price sheet has no prices for items with specific modifiers, so type what you
  find on trade, in ex, chaos or div (pick the unit above the table). A dot or a comma both work: 0.5
  or 0,5. A box turns red when it cannot read what you typed.
- **Total** — the price plus the cost to finish, and under it what that saves against crafting from
  scratch, or how much more it costs. The rows stay where they are while you type; the cheapest item
  you priced is tagged **best buy**, and a line under the table says whether it beats crafting from
  scratch.

Click **Route** on an item to see the route from it: the same graph, starting at *the item you buy* and ending,
where a roll goes wrong badly enough, at **↺ start over**. Nothing is solved again — switching the
number of modifiers, typing prices and drawing routes all read the one solve you already ran.

Each row assumes the **rest of the item is empty**; a listing that also carries modifiers you do not
want costs more to finish, because they have to come off first.

The list needs the solve's costs to have settled. When the solve stopped before they did — common on
five- and six-mod crafts at Standard — the section says so and offers **Compute again at …**: the next
Search effort up, in one click. At Exhaustive, the top, it says the craft is beyond what the solver can
settle. It is not available on a craft that starts from fractured modifiers, which has no white base
for a bought item to replace. The *I have an item* tab's **What to look for when you buy one** answers
a different question: there you keep the item, so it never starts over.

---

## I have an item

Enter the base, the item level, the rarity, and the mods currently on it. Then pick one of two
sub-modes.

**Give each mod the tier it is actually rolled at.** Every mod you add to your item carries a tier
selector, and it defaults to T1 — so an item entered without touching them is described as better than
it is. The tiers matter twice over: a mod already at or above the tier you are targeting is **kept**,
where one below it has to come off and be re-rolled, and that is often the difference between a cheap
finish and starting the slot again.

**Rarity describes the item you hold**, not the one you want. A **Magic (1 + 1)** item is a perfectly
good starting point — it is opened with a Regal (which converts to Rare while adding a mod) or an
Augmentation (which fills the second slot and leaves it Magic), and the planner covers both.

**Flag the mods that aren't ordinary.** Two toggles sit on each mod you add, and both change what your
orbs are allowed to touch — so leaving them off doesn't just lose detail, it gets the plan wrong.

| | What it means |
|---|---|
| **🔒 Fractured** | Locked on the item. Never removed, never re-rolled, and excluded from what an Annulment, Chaos or Essence can take at random — which *raises* the odds those orbs hit something you did want gone. An item holds **one**: a Fracturing Orb needs an unfractured item, so marking a second here clears the first |
| **💀 Desecrated** | A Desecration placed this mod. The flag follows the **mod, not the pool** — a bone that happened to place an ordinary mod flags it just the same. While an item carries a flagged mod the Well of Souls won't touch it again, so removing that mod is what buys you a second Desecration |

Neither is guesswork you should skip. A fractured mod you didn't mark will be planned as though it
could be annulled away, and a desecrated flag you didn't set will have the planner offering a bone the
game would refuse.

### Quick currency check

*"I'm holding this. What does one orb do?"*

Choose a **Mod to add** and/or a **Mod to sacrifice (Chaos / Annul)**, and the **Currency options** list
shows the chance a **single orb** does exactly what you asked, and what that orb costs.

**Which currencies it checks**, exactly — this list is the whole list:

| | when |
|---|---|
| **Exalted Orb** | Rare, you named a mod to add |
| **Chaos Orb** | Rare, you named both an add and a sacrifice |
| **Desecration** | Rare, you named a mod to add |
| **Desecration (Ancient bone)** | …where the price sheet prices one |
| **Desecration + a boss omen** | …and that mod is a desecrated one |
| **…+ Omen of Abyssal Echoes** | each Desecration row again, where the sheet prices the omen |
| **Perfect Essence** | Rare, and the mod you want is a Perfect-Essence one |
| **Perfect Essence + a Crystallisation omen** | …and you named a sacrifice, on the side that omen can reach |
| **Orb of Augmentation** | Magic, you named a mod to add |
| **Regal Orb** | Magic, you named a mod to add |
| **Essence** | Magic, and the mod you want is an Essence-only one |
| **Orb of Annulment** | you named a mod to sacrifice |
| **Annulment + Omen of Light** | …and that mod is a desecrated one on a desecrated item |

Every orb that adds a mod also appears at **Greater** and **Perfect** strength, when the price sheet
lists one and it can actually land the mod you asked for.

**A stronger orb is not automatically a better one**, and this is the main thing the strength rows are
for. A Greater or Perfect orb rolls only the *better* tiers — which raises your odds when you want a
top-tier mod, and *lowers* them when any tier would have done, because the low tiers that also counted
have been cut out of the pool. On a Wand wanting `#% increased chance to Shock` at any tier:

| | chance | cost |
|---|---|---|
| Exalted Orb | 4.17% | 1 ex |
| **Greater** Exalted Orb | **4.91%** | 8.79 ex |
| **Perfect** Exalted Orb | 4.03% | 1023 ex |

The Perfect orb is worse *and* a thousand times the price. A strength that cannot land the mod at all
is not listed rather than shown crossed out — the plain row above it already explains anything that
rules the mod out entirely.

**About the Essence rows.** A Perfect Essence adds its mod **for certain** and takes one of your
existing mods at random in exchange, so the only thing worth quoting is *which* mod it eats — name a
sacrifice and the row gives you the odds it takes that one. The Sinistral and Dextral Crystallisation
omens restrict it to prefixes or to suffixes, and only the omen that can actually reach your sacrifice
is offered. A regular Essence is a Magic-item move: it forces its mod and turns the item Rare, at 100%.

**About the Desecration rows.** A bone **offers three modifiers and you keep one**, so the number
shown is the chance one of the three is what you asked for — roughly three times the chance of a
single draw, and the same number the planner uses. A plain bone draws from the normal **and**
desecrated pools together, so it can land an ordinary mod too. The row is priced by the bone your item
actually consumes (jawbone for a weapon or quiver, rib for armour, collarbone for jewellery and belts).

An **Ancient bone** reads *"Minimum Modifier Level: 40"*: its three offers skip every ordinary tier
below modifier level 40, which is better odds for a high tier at a much dearer bone. The **Omen of
Abyssal Echoes** lets you throw all three offers back once for a fresh three, which can repeat the first.
Wanting one mod, you do that exactly when none of the three is it, so its row shows the chance the mod
turns up in either set — six draws. The omen is spent only when you reroll, so the row's price is the
bone plus the omen times the chance you'll need it.

Two rules it will tell you about rather than hide: an item holds **at most one desecrated mod**, so
the row is refused while a carved mod is still on the item; and the boss omens read *"your next
**Weapon or Jewellery** Desecration attempt"*, so on armour there is no way to target a boss's pool at
all — the row says that instead of disappearing.

This is a per-orb number, not a plan. How many orbs it takes overall depends on what you do after a
miss — that's the other sub-mode.

Where a currency can't apply, the row says why rather than hiding.

### Full plan to a target

*"I'm holding this. Get me to that."*

Set **What should the item end up as?** — the **final** mods you want. **Copy my current mods** seeds it
from what you have, at the tiers those mods are rolled at. Anything on your item that isn't in the
target list is treated as junk and will be removed.

**Every target row says where it stands against the item you hold**, which is the fastest way to see
what a craft actually costs you from here:

| Row reads | Meaning |
|---|---|
| **✓ on your item** *(with its tier)* | Already there, at the tier you asked for or better. Kept, not re-rolled |
| **↻ yours is T…  — must re-roll** | The mod is there but rolled too low. The slot has to be cleared and rolled again |
| **+ to add** | Not on the item yet |

A tally above the rows counts the three — *"5 slots: 2 already on your item · 1 to re-roll · 2 to add"* —
so a target you thought was nearly done shows itself before you spend anything on it.

**Your item has done N% of this craft.** Above the plan sits a progress figure, and it is measured in
**currency, not in mod count**. Those are wildly different numbers and the mod count is the flattering
one: holding four of six target mods is not 67% of the work, because the last mod is by far the hardest.
On one measured Wand craft, four of six came to **4.4%** — the final mod alone was 53% of the cost. The
panel will also tell you when your item is *behind* a clean start, which happens when junk mods are
occupying slots and families you need: a Wand with three junk mods measured 489 ex worse than a bare base.

Then **Compute plan**. You get the same two views as the Lab: plan cards, and the true expected cost with
its policy.

### Why the cards carry no total

The plan cards on both tabs show **chance per attempt** and **what one run costs**, and no
expected-cost total. That is honest bookkeeping rather than a missing feature.

An expected-cost total assumes a failure costs you nothing but a restart — you buy another white base.
It is plainly **fiction** for the Rare in your stash: you only have one of it. Under that fiction the
ranking inverts and produces nonsense. An Orb of Annulment costs about 159 ex against an Exalt's 1 ex,
so a plan that hides its Annulments behind a 0.1% gate you rarely reach "saves" roughly 65× on paper —
and the "cheapest" plan becomes one no player would ever run.

It was barely better from a white base. Nobody bins an item six steps in holding five of their six
target mods; they annul the bad one and carry on. That is the model **True expected cost** uses — and
it is *allowed* to bin the item and start again when starting again really is the cheapest move, so
wherever the restart assumption was right, it already agrees. It can only ever come out the same or
lower, which is why the total added nothing worth the confusion.

The **True expected cost** panel is the number to trust.

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
*Desecration (bones)* (Preserved / Ancient), *Greater and Perfect orbs and essences* (every strength in one row), and *Omens*
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

## Tablets

Precursor Tablets are crafted with the same orbs as gear, so the same solver prices them — but almost
nothing else on the gear tabs applies, and the market works the other way round. They get their own tab.

**Pick a tablet and add up to four modifiers**: click a modifier to add it — it stays where it is,
highlighted with a tick — and click it again to take it off (or use its **✕** in *Your tablet* at the
top). The search box narrows both lists. Two
prefixes and two suffixes is what a Rare tablet holds. Each modifier shows how often it lands: *1 in 7 rolls on this side*. Modifiers that can't share a
tablet grey out with the reason; on a tablet that can cross sides, because "Map contains an additional
Essence" (a prefix) and "increased chance to contain Essences" (a suffix) are one family.

**Say what a plain tablet costs you** and the tab gives the true expected cost of crafting yours, with
the same policy graph the other tabs use. A tablet is always run with all four modifiers, so the cost is
for a full one: whatever lands beside the modifiers you picked is fine and never annulled, and any slot
still empty at the end is filled with an Exalt, which the cost includes. Plans never use an Annulment
Orb on a tablet — at roughly seven Chaos Orbs apiece it only pays on the rarest pairs, which lose far
more than it saves — as it does the plain tablet you
start from. (Two picked modifiers on a Ritual tablet: ~95 ex this way, against ~257 ex when the other
two slots had to stay empty.) Nobody lists plain tablets on poe.ninja, so that price is yours to type.

**Then the market half, which you drive.** No price feed lists tablets — poe.ninja doesn't carry them and
the trade site can't be read from a web page — so every price on this tab is one you typed. Each row has
a **Search on trade** button that opens the official site with the search already filled in — instant
buyout listings of unused tablets (all 10 uses left), cheapest first, so the price you see is one you can actually buy at; you read the
listings and type the price back in. It's kept in your browser, with the day you typed it.

**Why this plan.** Under the cost, the tab says in a sentence or two how the plan gets there and why that
way: starting a fresh tablet whenever a roll misses, rerolling one tablet with Chaos Orbs, or a mix —
whichever is cheaper at these prices — and what an average craft uses (*72 plain tablets · 72
Transmutations · …*). It is read off the plan played out, not a rule of thumb.

**Price what can land, and sell it.** Type what one of the watch-list sets sells for and the craft is
recounted straight away with you selling it whenever that beats carrying on — the price against what
starting a fresh tablet puts back on the bill. A tablet is always filled to four modifiers before it is
sold (a Regal if it is Magic, then Exalts), since a third or fourth good modifier can only raise its
price; it sells at the best set it then holds. A box then says what that brings back per craft and what
the craft costs net, and each priced row says how often you'd sell one. Hunting an extra reroll plus two
extra modifiers on Ritual with plain tablets at 100 ex, selling at typical prices brings back ~62 div a
craft — still far short of the ~1,000 div it costs, but it counts.

**Is it worth crafting?** Type what the tablet sells for and the tab answers as an investment — two
bars set what you spend against what you get, in amber and green, with the profit or loss above them,
and a chart shows how often a craft finishes within any budget, shaded green up to the sale price:

- **Profit (or loss) per tablet, on average** — the sale price minus what crafting costs, net of what
  you sell on the way (below).
- **How risky it is** — the average hides a wide spread, so the tab also says what half the crafts cost
  less than, what 1 craft in 10 costs more than, and how often you finish if you spend no more than the
  tablet sells for. These come from playing the plan out thousands of times; a very long craft fits fewer
  in, and the tab says so.

Worked through on Ritual tablets with a plain one at 100 ex: fishing for an extra Favour reroll costs ~16
div on average for a tablet that sells for ~20, and finishes within 20 div about 3 times in 4; asking for
the reroll *and* an extra Rare modifier on Unique monsters costs ~825 div for a ~22 div tablet. The price
of a plain tablet moves every one of these numbers the most — check it before you start.

**While you roll for what you asked for, other things land.** Some are worth more than the tablet you
were aiming at. The watch list shows those in four tiers — **super jackpot**, **jackpot**, **very good**
and **good** — sorted by what each set sells for on the trade site. The same set can be worth very
different amounts on each tablet, so each is listed for the tablets where it earns its tier: an extra
Rare modifier on Unique monsters alone is a jackpot on a Temple tablet and only good on the other two. Where the roll matters, the row names it — an extra
Favour reroll **3** times is its own row, apart from **1–2** — and the odds count only that roll, taking
every value in a range as equally likely.

Each row says how often it turns up on the way to your craft, worked out by playing the plan out
thousands of times, and has its own search and price box — prices move, so the tier says how good a
set is and today's price is yours to read. When one you priced beats
your own craft, the tab says so: that's the tablet to stop on and sell. Pairs turn up rarely — a cheap
plan still bins plenty of tablets early — so the singles are the ones to watch for before you bin.

A cost shown as a bound (**≤**) has no settled plan behind it, so there is nothing to play out and the
rows say so. The tab uses the same **Search effort** as the rest of the app; at the default, even two of
the rarest modifiers at once solve exactly.

**Where the odds come from.** Nobody publishes tablet weights — the game files and poe2db both say 1 for
every modifier. **Morce Faster** rolled three tablets and counted 19,147 modifiers, and that data is what
every number here rests on. A modifier seen only a few dozen times says so beside its odds.

A trade search marked **≈** covers more than one wording of the same stat, so it can list a
near-identical modifier as well as the one you asked for.

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

### The plan cards don't show a total cost

Deliberate — see [Why the cards carry no total](#why-the-cards-carry-no-total). The only total is
**True expected cost**, which is the one worth budgeting against.

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
| **Alloys** | Guarantee a specific mod on a Rare, like a Perfect Essence ([below](#alloys)) |
| **Bone offerings (Desecration)** | Place a desecrated mod |

**Strengths.** Transmutation, Augmentation, Regal, Exalted and Chaos all come in **Basic**, **Greater**
and **Perfect**. A stronger orb raises the *minimum modifier level* the roll draws from: 35 for a Greater
orb and 50 for a Perfect one — except Transmutation and Augmentation, whose Greater and Perfect orbs roll
at **55** and **70**. That is not always an improvement: raising the floor also deletes low tiers from the pool, so a Perfect orb can be
*worse* for a mod whose good tiers sit low. The engine searches all three and picks per step.

**Omens** modify the currency used with them — the ones the engine models are Sinistral (prefix side),
Dextral (suffix side), Light, Crystallisation, Necromancy, the Blackblooded, the Liege, the Sovereign,
**Abyssal Echoes** (reroll a Desecration's three offered mods once — spent only if you do), **Whittling** (a Chaos Orb removes your lowest-level mod instead of a random one) and **Greater
Exaltation** (one Exalted Orb adds two mods).
A *Dextral Exaltation* constrains an Exalt to add a **suffix**; a *Dextral Annulment* constrains an
Annulment to remove one; a *Dextral Crystallisation* constrains a Perfect Essence's removal. They are
different omens for different currencies — check what the plan step actually names before buying.

### Alloys

Alloys are Runes of Aldur currency, and there are thirteen of them — *Runic Alloy*, *Sovereign Alloy*,
*Celestial Alloy* and so on. They carry their own names, and the picker labels their mods **· Alloy**
rather than folding them in with essences.

**Mechanically they behave as a Perfect Essence does**: used on a **Rare**, an Alloy forces its modifier
on and removes one of your existing modifiers at random in exchange. That is why they sit beside the
Perfect Essence rows rather than in a category of their own — the route the planner builds around one is
the same shape.

**Their prices are not remotely alike, though**, and that is the reason to pay attention to the label.
Alloys trade from a few exalts to a few thousand — a Swift Alloy is small change and a Celestial Alloy
is one of the most expensive things a craft can call for. They are priced from their own poe.ninja feed,
like every other currency here. Since the app **ranks plans by cost**, an Alloy step is worth reading
twice before you buy: two plans that look alike can differ by three orders of magnitude on that one line.

On some bases they are the majority of what is on offer — on a Wand, most of the guaranteed-mod targets
are Alloys rather than Perfect Essences.

> **One crafted modifier per item, Alloys included — and this is now the game's rule, not the app's
> caution.** The 0.5.0 patch notes say items "can only have 1 crafted modifier at a time", and the
> game's own item data files every Essence, Perfect Essence and Alloy modifier as *crafted*, so all
> three count toward the same one. This paragraph used to say the Alloy half was unverified; it has
> been verified, and the app's behaviour was right all along.
>
> **A socketed *Astrid's Creativity* allows a second** ([Runes](#runes)), which is how a real item
> carries two Alloys at once. Tick it and the planner will aim at both.

### Runes

Most runes simply add a modifier and change nothing about how an item is crafted. Two change the
**rules**, and the app plans with them:

| Rune | What it allows |
|---|---|
| **Astrid's Creativity** | a **second crafted modifier** — a second Essence, Perfect Essence or Alloy |
| **Serle's Triumph** | a **fourth suffix** |

Tick the ones you have socketed in the **Runes** row, on either tab. Every planner sees them, so a
craft that is otherwise refused outright becomes plannable — an item wanting four rolled modifiers and
two Alloys is impossible without Astrid's Creativity and ordinary with it. Runes are saved in a shared
workspace link too.

**The item keeps what the rune allowed after the rune comes out.** So a rune is a step in the craft
rather than a permanent passenger, and a plan may end by swapping it for whatever you actually want in
that socket.

**A rune costs a socket, and sockets are not modelled here.** The plan assumes you have a free one;
Artificer's Orbs are not priced, so budget for them yourself.

Six more runes each **add a pool of modifiers** the base cannot otherwise roll. Tick one and its
modifiers appear in the pickers and in every plan; untick it and they leave again.

| Rune | Where it fits | What it adds |
|---|---|---|
| **Thrud's Might** | weapons | Destruction modifiers |
| **Uhtred's Sidereus** | boots | Chronomancy modifiers |
| **Kolr's Hunt** | gloves | Marksman modifiers |
| **Katla's Gloom** | gloves | Decay modifiers |
| **Vorana's Carnage** | helmets | Berserking modifiers |
| **Medved's Tending** | body armour | Soul modifiers |

> **The odds on a pool modifier are an estimate, not a measurement.** The game's data publishes no
> spawn weight for any of these — it reports a placeholder for all 128 — so the app assumes one that
> puts them on roughly the footing of an ordinary modifier. Their *probabilities* are therefore
> ballpark in a way the rest of the app's are not, and any plan that rolls one says so.

The **Aldur** runes are a different thing again: they convert every modifier of one element on the
item into another. The app suggests one by itself when your targets make it worthwhile — you do not
tick those.

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

**What's an Alloy, and why does the picker call some mods that?** It's Runes of Aldur currency that
forces a mod onto a Rare exactly as a Perfect Essence does, but with its own name and its own price —
anywhere from a few exalts to a few thousand. See [Alloys](#alloys).

**Why does my wand not offer fire mods?** Because it's a cold wand. Wand and staff bases lock to a spell
element, and the **Variant** menu next to **Base** is where you say which one you're holding.

**Why does a step route say "any suffix — a throwaway for the next step to remove"?** A Perfect Essence
or Alloy removes one of the item's modifiers, at random, as it adds its own. When nothing on the item is
a modifier you don't want, the route rolls one on purpose — a *throwaway*, anything on that side — and
the essence on the very next step removes it. Which modifier lands never matters, so the odds stay
exact. Before, a route from scratch let the essence eat one of your *targets* and rolled it again, and a
route from an item holding only mods you want had no route at all.

---

## Glossary

| Term | Meaning |
|---|---|
| **Affix** | A prefix or suffix |
| **Tier** | Quality band of a roll. T1 is best; higher tiers need higher item level |
| **Family** | Group of mutually exclusive mods; one per item |
| **Pareto frontier** | The set of plans where none is both cheaper per run and likelier than another |
| **True expected cost** | Expected cost under *optimal play*, recovering after bad rolls instead of restarting |
| **Policy** | The rule "in this state, do this" — what the MDP solves for |
| **ex** | Exalted Orb, the unit costs are quoted in |
| **ilvl** | Item level; gates which tiers can roll |
| **Fractured** | A mod locked onto the item; can't be removed or rerolled |
| **Desecrated** | A mod that only a Bone offering can place |
| **Alloy** | A Runes of Aldur currency that forces a mod onto a Rare, as a Perfect Essence does |
| **Variant** | The sub-choice within a base category — attribute for armour, spell element for wands and staves |

---

## Getting help

- **[Discord](https://discord.gg/RvxCWyFF3D)** — fastest, and the best place for "is this craft sane?"
- **[GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues)** — bugs, with the **Copy link** URL for
  the workspace that shows the problem
- **[GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions)** — feature ideas

The app also has a **Report a problem** control. It builds a complete report — app version, patch,
price basis, and the craft you were running — as a block you copy and paste wherever you like: Discord,
a GitHub issue, a message to a friend. It doesn't file anything for you.

**Rate the app** (the 💛 button in the header) is the quickest way to say how it's going: pick 1–5
stars, say what's good and what isn't if you like, and send. No email, no name, no account — only the
stars, your words and the app version are sent. An invisible check keeps bots out; you never see a
puzzle.

---

*This is a third-party tool and is not affiliated with or endorsed by Grinding Gear Games.*
