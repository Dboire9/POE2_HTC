# What's new in 1.0

[poe2htc.com](https://poe2htc.com) works out how to craft a Path of Exile 2 item: which orbs, in
which order, what each attempt costs, and what your actual odds are.

If you used it before, the short version is that **it used to be a server that guessed and it is now
a calculator that knows.** Everything below runs in your browser — nothing to download, no account, and
nothing you type is sent anywhere unless you choose to share it. The page keeps working if your
connection drops.

New here? The **[User Guide](USER_GUIDE.md)** walks through a first craft end to end. This page is
the tour.

---

## What you can do on the site

### Plan a craft from a white base

Pick a base, an item level, and the mods you want — with a tier on each, or "any tier" if you'll take
what you get. You get a list of routes, cheapest first:

- every step named, in order, with the orb to buy and the odds that step lands
- what one attempt costs, and what the whole thing is expected to cost
- how many attempts it's likely to take

The routes are a genuine trade, not a ranking of one answer. The cheapest is usually a grind; the
surest costs more per attempt but fewer of them. Pick the row that matches how much of your evening
you want to spend.

### Work out the best move on an item you already hold

Describe what's on the item — including fractured mods and anything a Desecration put there — and ask
two different questions:

- **Quick currency check:** "if I slam this right now, what happens?" Name a mod to add and/or one
  you'd sacrifice, and get the exact odds a *single* orb does what you asked, with what it costs.
  Covers Exalted, Chaos, Augmentation, Regal and Annulment — plus Annulment with an Omen of Light
  when the mod you'd sacrifice is a desecrated one. Bones and essences aren't in this list yet; ask
  for them through the full planner below.
- **Full plan to a target:** the same route list as above, but costed from *your* item rather than
  from a blank base, so it never proposes throwing away the good mods you already have.

### Get the true cost, and the strategy that achieves it

This is the part no other PoE2 tool does, and it's worth understanding because it's the honest number.

A route is a fixed recipe: it commits to an order in advance and, when a step misses, it has nothing
to say. Real crafting isn't like that — you look at what landed and decide what to do next. So the
site also solves the craft as a **decision problem**: for every state your item could be in, what is
the best move, and what does playing well actually cost?

That answer is usually **far** cheaper than the cheapest recipe, and it comes with a map of the
strategy — the states you'll pass through, the move to make in each, and how often each step throws
you backwards. Click a state to highlight the route through it.

When it has proved the answer optimal it says so. When it ran out of time it prints a bound with the
inequality pointing the right way — `≥` when the truth is higher, `≤` when it's lower — instead of a
precise-looking number it can't stand behind.

### Ask what a budget actually buys

Put in how much you have. Instead of an expected cost that busts about half the time, you get the
closest items to your target that you can realistically **finish** for the money, each with the
probability of finishing inside it. Pin the mods you refuse to compromise on and it will relax the
others instead.

### Plan around the currency you don't own

Tick what you don't have — by family, by strength ("no Perfect orbs, of anything"), or omen by omen —
and those routes disappear from the search entirely rather than being shown and then withdrawn.

### Choose how hard it should look

Quick, Standard or Exhaustive. Quick answers most crafts exactly; Exhaustive is for the hard ones.
The setting is on every tab that obeys it.

### Share a craft

The whole workspace lives in the URL. Send the link and the other person sees exactly your setup.

---

## What changed

### Two new omens

- **Omen of Whittling** — makes a Chaos Orb remove your *lowest-level* modifier instead of a random
  one. It shows up as its own row beside the plain Chaos route, so you can see what the omen buys you
  before you spend it.
- **Omen of Greater Exaltation** — one Exalted Orb landing *two* modifiers. It earns its place more
  than it looks like it should: a route has to commit to an order, but one omened orb gets both mods
  in either order. On a hard six-mod craft it took the cheapest route down by **42%**. It pays best on
  expensive orbs, because the omen is a flat surcharge — one omened Greater Exalt costs less than two
  Greater Exalts.

The true-cost panel deliberately doesn't use Greater Exaltation. That's not a gap: that model
re-decides after every single orb, and this omen is a promise not to. Both behaviours were measured.

### Belts — so every equipment slot is now supported

One belt entry rather than twenty, because all twenty of the game's belt bases share an identical
craftable pool. They differ only in their implicit, which is fixed on the base and can't be crafted.

### Prices update themselves, every day

The sheet comes from poe.ninja and refreshes daily on its own. It won't accept a price from a market
too thin to mean anything — a currency nobody traded yesterday isn't a currency you can buy today —
and the app tells you when it was last updated and which numbers are still estimates.

This matters more than it sounds. The site ranks routes **by cost**, so a wrong relative price doesn't
just misreport a total, it recommends the wrong craft. Buying the cheapest essence that satisfies a
target rather than the exact one named cut the quoted price of essence crafts by about **13x**.

### Every orb strength, on every step

Basic, Greater and Perfect are searched for every add currency. A stronger orb isn't automatically
better — it raises the minimum tier, which also deletes low tiers from the pool — so the site tries
all three at every step and picks per step. Sometimes the answer is the cheap orb.

### It loads about twice as fast

The modifier data the page downloads is half the size it was, and parses in half the time. Most
visible on a phone.

### No more desktop download

The app is a web page. The old Windows/Linux builds are gone — the desktop wrapper couldn't run the
solver the browser version uses, and the browser version is the better one.

---

## What it still won't do

Stated plainly, because a tool that hides its limits wastes your money:

- **Charms and jewels aren't supported.** Both are built differently from ordinary gear in the game's
  own data, so neither fits the three-prefix/three-suffix rare this plans for.
- **Recombinators aren't modelled.** They're a different mechanic, not a missing orb.
- **One number rests on an assumption:** how often a Desecration produces a carved modifier. It isn't
  published anywhere, so it was measured from 40 bone offerings on a single base. Any plan that uses a
  Desecration *without* a boss omen says so on screen and marks those odds as an estimate — everything
  else is exact. If you use bones, [we'd like your counts](https://github.com/Dboire9/POE2_HTC/issues).
- **"Plan from scratch" can't target a Perfect-Essence-only mod.** Use the *I have an item* tab, which
  handles them fully.

The full inventory of what the app claims and what enforces each claim is in
[copy-audit.md](copy-audit.md).

---

## Where to go next

- **[User Guide](USER_GUIDE.md)** — every panel, every number, and what to do when a result looks odd.
- **[How it works](ALGORITHM.md)** — the maths, if you want it.
- **[Changelog](CHANGELOG.md)** — the developer-facing list.
- **[Discord](https://discord.gg/RvxCWyFF3D)** — bugs, questions, and disagreements about crafting.
