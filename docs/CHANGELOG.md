# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Every item the planner shows has a Search on trade button.** The target item — beside the target
  list, before anything is computed — the finished item (*Or buy it already made*, beside the true
  expected cost), every row of *Start from an item you buy instead*, and every row
  of the Item tab's *What to look for when you buy one* open the official trade site on that item: its
  class, its rarity, each modifier at the tier your craft asks or better, instant buyout, cheapest first.
  The trade ids come from Exiled Exchange 2's data, matched to every gear modifier — Essence, Perfect
  Essence and Desecrated ones by their wording — 3,026 of 3,086 modifier lines; a **≈** marks a search
  looser than the item.

- **Precursor Tablets have their own tab.** Pick a **Ritual**, **Overseer** or **Temple** tablet, add up
  to four modifiers with the same search-and-add picker as gear, and the same solver that prices gear tells you what rolling it costs —
  for a FULL tablet, since one is always run with all four: whatever lands beside your picks is kept, the
  empty slots are filled with Exalts at the end, and the plain tablet you start from is counted — with the odds
  of each modifier beside it (*1 in 7 rolls on this side*), and the pairs that can never share a tablet
  greyed out with the reason. Nobody publishes tablet weights, so the odds rest on **Morce Faster's**
  rolling data: 19,147 modifiers counted across the three tablets, credited on the tab.
  The market half is yours to drive, because no feed lists tablets: every row has a **Search on trade**
  button that opens the official site with an instant-buyout search for an unused tablet (10 uses left) filled in, and a box for the price you read there.
  The plain-tablet price box has one too: **Find a plain one on trade** lists Normal tablets of the kind picked.
  Every price box takes **ex, chaos or div** — whichever the listing is in — converted at the price sheet's rates.
  The tab shows its numbers in **chaos** by default, the currency tablets trade in; switch to ex or div at the
  top of the result, and the pick is remembered. New price boxes start in the same unit.
  Prices stay in your browser with the day you typed them, and sit next to what crafting costs.
  And while you roll for what you asked for, other things land — the **watch list** shows the valuable
  ones, in four tiers from super jackpot to good, set per tablet from what each sells for (an extra
  Favour reroll plus an extra Rare modifier on Unique monsters is a super jackpot on Ritual). Where the roll matters
  the row names it — rerolling Favours **3** times is its own row. Each says how often it turns up on the
  way (measured by playing your plan out thousands of times, with the progress bar following along), with
  its own search and price box; price one above your own craft and
  the tab says so: that is the tablet to stop on.
  Type what your tablet sells for and the tab answers **is it worth crafting**: the profit or loss per
  tablet on average — net of what you sell on the way: price a set in the watch list and the craft is
  recounted with you selling it whenever that beats carrying on —
  what half the crafts cost less than, what 1 in 10 costs more than, and how often you finish within the
  sale price — drawn, too: spend-against-get bars and a chart of how often a craft finishes within a
  budget, shaded up to the sale price, with each watch-list tier in its own colour. The rarest pairs solve exactly now (the tab uses the app's Search effort). A short **Why
  this plan** says how the plan gets there — fresh tablets, Chaos rerolls, or a mix — why that is cheaper
  at these prices, and what an average craft uses.
- **"Any prefix / any suffix" — a slot you don't care about.** A target list has always meant *these
  modifiers and nothing else*, so anything you had not named had to come off before the app called the
  item finished. The only way to say "three prefixes I want, and whatever lands in the last suffix is
  fine" was to name every remaining suffix as an alternative in one slot — and on a Sceptre that is
  twelve alternatives, seventeen candidates, past the nine the model will enumerate. Pick **Any prefix**
  or **Any suffix** from the mod picker instead. The craft finishes with anything in that position, or
  with nothing in it — you can always Exalt or Desecrate afterwards, and whatever lands counts.
  It is *cheaper* to solve than the workaround rather than dearer, because a free slot adds no states
  and lets a bad roll on that side count as a finish. Measured from white on Sceptres, five named
  modifiers: **366.84 ex strict → 191.27 ex** with one free suffix, and the solve got faster (4.5s →
  3.7s). The workaround — four alternatives in the sixth slot — costs **402.08 ex** and takes 94s.
  On the **Item tab** the step-by-step plan understands it too, and leaves a modifier you tolerate where
  it is instead of annulling it: on a held Sceptre wanting five modifiers, the chance per attempt goes
  from **0.144% to 0.865%**. The Lab's step routes deliberately do not use it, and say so — a route has
  to name the modifier every step aims at, so it cannot decide after a roll which one was the spare.
  That is the true expected cost's job, and it does it.
  Free slots travel in share links under their own link version, so an older build refuses a link
  rather than quoting the strict craft's price for it.
- **Step routes can roll a throwaway for a Perfect Essence or Alloy to eat.** An Alloy or Perfect
  Essence removes one of the item's modifiers at random as it adds its own, and a route could only offer
  it something already on the item. From an item holding only mods you want that meant no route at all
  — a Magic Sceptre with two Alloys to add got *No step-by-step route*. From scratch it was worse than a
  refusal: the essence ate one of your targets and the route rolled it again. A route can now roll a
  **throwaway** — anything, on either side — right before the essence, which removes it. The reported
  Sceptre gets nine routes. From scratch, measured on a fixed price sheet, a Sceptre with one Alloy got
  **6× likelier** (best route 1 in 47,000 → 1 in 7,800) and its cheapest **4.5× cheaper** (11,731 →
  2,595 ex); the six-modifier Spirit Star with two Alloys got **55× likelier**. The odds stay exact: a
  throwaway is always removed on the very next step, so which modifier it was never changes a number.
  Crafts without a Perfect Essence or Alloy get byte-identical routes. Crafts with one take longer to
  plan — the Spirit Star went from 0.4 s to 2 s, well inside the default search effort.

### Fixed

- **Life Regeneration and Leech read in the game's own units.** The game stores a few stats finer than
  it prints — Life Regeneration per MINUTE, Leech in hundredths of a percent — and the data kept the
  stored numbers, so a Body Armour's best Life Regeneration tier read "1986–2160 Life Regeneration per
  second" where the game says 33.1–36, Leech read 600–690% for 6–6.9%, and a Ritual tablet's free-reroll
  chance 300–600% for 3–6%. 311 ranges over seven stats now ship as printed, the refresh converts them
  on every rebuild (tools/refresh/displayUnits.mjs), and the trade searches ask for the printed numbers.

- **The route shows the way crafts that finish actually go.** It followed only rolls that moved strictly
  closer, and on a craft that starts over the one such roll from the start is the lucky one: a Ritual
  reroll read "Transmute (0.3%) → Regal → ✓" beside a plan that plays Chaos 28 times a craft. It now
  follows the rolls the finishing crafts come through — *Transmute → Regal → Chaos* — and each step also
  says how often it finishes the item outright and how often nothing changes and you play it again. On
  an item you hold nothing can fail, so the route there still follows the likeliest roll that moves
  closer, and it now backs out of a roll that only loops back instead of showing no route at all.

- **"What Chaos does from here" says what one Chaos really does.** A step into the target read "clears 2
  junk mods" when a Chaos had swapped ONE junk suffix for the target — every finished state is drawn as
  one clean goal, so comparing junk against it counted the junk left on a spare slot as cleared. A step
  into the goal now names only what it lands. And junk is compared per side: a Chaos whose new junk
  landed as a prefix read "no change", beside the roll that really changed nothing; it now reads
  *clears a junk suffix · adds a junk prefix*. On every graph, gear included.
- **A step that finishes the item says what it leaves, and counts all of it as onward.** Finishing
  outcomes are drawn as one goal, so a Regal that finishes a Ritual tablet read "magic · 1 mod → 1 mod,
  51% onward" — it now reads *adds a junk suffix (51%) or a junk prefix (49%)*, 100% onward, and a
  Chaos that lands the target *clears a junk suffix · most likely lands …*. Each step into the goal is
  one edge now, carrying the finished items it stands for; costs and plans are unchanged (the identity
  recording still matches byte for byte).

- **A tablet with four rare modifiers no longer ends in "a craft ran past 1000000 moves".** Playing such a
  craft out takes hundreds of thousands of orbs and fresh tablets EACH; the tab now stops after a few
  seconds and says so in words (*too long a craft to play out — about 270,183 orbs and fresh tablets a
  craft*), once, under the cost, which still stands. And when the solver stops before a number, it no
  longer says it "ran out of time … a six-mod target": it had used its sweeps, not its time.
- **Temple's watch list has a new pair**: a Vaal Beacon Unique Monster chance with the extra-Crystal
  chance, *very good*, as Dorian priced it (~3 div).
- **Every tablet you pick now gets a number, at any Search effort.** A tablet's four rarest modifiers
  never settled before — Standard gave up in 1.5 s, and even Exhaustive's twenty million sweeps
  "settled" short of the answer, so the planner flipped between two plans forever. A tablet's lattice is
  a few hundred states, so the tab now solves it the sure way: each plan costed by solving its equations
  outright instead of iterating them. Ritual's four rarest: ~9.2×10⁸ ex, in 0.08 s. Where the old solve
  worked, the numbers are the same to the decimal; the two that needed Exhaustive move by 0.2–0.3%.

- **A craft that can only finish by starting over no longer quotes "at most 0".** With Chaos and Annul
  both turned off, a tablet full of the wrong modifiers can only be binned, and the true expected cost
  came back as "≤ 0" — or, with the other solver, no number at all. It now solves exactly (a Temple
  tablet wanting Unique Monsters' extra Rare modifier: 387 ex). The same bug gave a Wand from the
  streamer gear, with a desecrated target, "≤ 0"; it is 55,651 ex.

- **The true expected cost now knows that another modifier of your target's family blocks it.** A
  family can hold different modifiers — a Wand's Fire, Cold, Lightning, Chaos and Physical spell damage
  are one; so are its "+level to … spell skills" — and while any of them is on the item, yours cannot
  roll. The true cost counted them as harmless junk, so on a craft that keeps rolling with one on board
  it came out low: played out on real items, a Wand wanting +Fire spell levels from a 30 ex base cost
  **4.3% more** than quoted, and **6.2% more** with Fire damage added. The model now treats them as
  blocking, and its plans get cheaper for it — those crafts cost **1.6% and 2.9% less** to follow. The
  quoted number now runs a little *high* on such crafts (up to 7% on those Wands), from an approximation
  the model still makes: it does not take a junk modifier's own family out of the next roll. With a free
  base almost nothing moves — at most **0.1%** across the ten streamer items that settle — and crafts
  naming no such modifier are unchanged to the last digit. The graph says **blocked** rather than
  *off-tier* now, because a lower tier is only one of the two reasons.
- **A tab left open overnight failed on its first plan.** The site is updated every morning when the
  prices refresh, and a tab opened before that asked the new site for the old price file — which no
  longer exists — then failed with a meaningless error. The first plan in an old tab now works,
  because the data is loaded as soon as the page opens rather than on the first click.
- **In a tab older than the site, a cancelled plan then hung forever.** The next plan now says the
  site was updated and offers a **Reload**, which keeps your targets.
- **A failed data download no longer breaks the page until you reload** — the next plan tries again —
  and when one fails, the message now names the file and the error instead of a JSON parse error.
- **The Item tab's step-by-step routes never said why they had none.** When the step planner can't lay
  out a craft, the panel showed a generic guess — "usually the target needs more mods than fit, or a
  tier gated above the item level" — under a heading claiming every path had scored 0%. It now says
  *No step-by-step route for this craft*, gives the planner's own reason, and points to the true
  expected cost above, which isn't limited to fixed routes. The craft that exposed it — two Alloys to
  add on a Magic Sceptre — now gets routes instead; see *throwaway* above.
- **"Your item has done X% of this craft" now uses the same unit as the cost above it.** It could read
  "saves 3,321 chaos" one line under "1,733 div".

## [1.1.0] - 2026-09-16

### Added

- **Runes that change what an item can hold.** Two socketables alter the rules a craft obeys, and the
  app now plans with them: **Astrid's Creativity** allows a *second* crafted modifier, and **Serle's
  Triumph** a *fourth suffix*. Tick the ones you have socketed in either tab and every planner sees
  them; they travel in share links too, under their own link version, so an older build refuses a link
  rather than quietly planning the wrong item. The item keeps what the rune allowed after the rune is
  swapped out, so a plan may end by replacing it.
- **The six "Can roll …" runes now add their modifiers.** *Thrud's Might* (Destruction, weapons),
  *Uhtred's Sidereus* (Chronomancy, boots), *Kolr's Hunt* (Marksman) and *Katla's Gloom* (Decay, both
  gloves), *Vorana's Carnage* (Berserking, helmets) and *Medved's Tending* (Soul, body armour). Tick one
  in the **Runes** row and its modifiers appear in the pickers and in every plan; untick it and they
  leave again — 439 modifiers in all. Each rune's restrictions are the game's own: the caster-only
  Destruction modifier stays off a quarterstaff, and a Soul defence modifier only appears on the armour
  whose attributes grant that defence.
  **Their odds are an estimate and the app now says which estimate.** The game's data publishes no
  spawn weight for any of these, so one is assumed — and because weight decides the odds of *every*
  random step, a craft with a pool rune socketed says the whole thing is ballpark rather than blaming a
  Desecration the player never used.
- **The item a player asked for can now be planned.** A rare Sceptre carrying four rolled modifiers
  *and* both Puppet Master Alloys was refused outright — "an item can hold one essence modifier" —
  because one crafted modifier is the game's rule (0.5.0: "items can only have 1 crafted modifier at a
  time") and poe.ninja files every Essence, Perfect Essence and Alloy modifier as crafted. What lifts
  it is an Astrid's Creativity, which the refusal message now names.
- **A crafted modifier may share a family with a rolled one.** Real uncorrupted items carry a rolled
  and a crafted resistance of the same family side by side — three of them across the streamers read
  here — so crafted modifiers now exclude only other crafted modifiers. Crafts that ask for both a
  rolled and a guaranteed version of one stat are plannable for the first time.
- **Streamer gear reads crafted modifiers, and the runes socketed in it.** A crafted line carries no
  stats this app could match, so nine of them across five characters were listed as unread and the
  items looked emptier, and cheaper to finish, than they are. They resolve from the game's own modifier
  id now: 204 modifiers placed with 17 unread becomes **213 with 8**. Socketed runes are read as well,
  and **Craft this from scratch** plans the craft that actually produced the item rather than one the
  planner would refuse. One line stays unread on purpose — a Genesis Tree ring craft, a mechanic this
  app does not model, named rather than guessed at.
- **Rate the app.** A **💛 Rate the app** button in the header opens a small box: 1–5 stars and an
  optional "what's good, and what isn't?", and nothing else — no email, no name, no account. It reaches
  the maintainer through the site's first server function, `/api/feedback`, which accepts a rating
  only after Vercel's invisible BotID check (no puzzle for the player), then forwards the stars and the
  words — nothing that identifies the player — to a private Sentry project. Until that project is set
  up, the box says ratings aren't switched on and points at Discord.
- **Start from an item you buy instead.** Asked for fubgun's staff: "I enter how many mods the starting
  item should have, and you find the best way to the full item from the best first ones." A craft
  planned from scratch now lists every Magic and Rare item already carrying 1 to n−1 of the targets —
  pick how many — with what finishing from it costs and what it is worth paying for (crafting from
  scratch minus finishing). Type the trade price you find and each item shows its total against
  crafting from scratch, the cheapest tagged as the best buy; click **Route** for the route from it, ending where the plan would start over from a white
  base. All of it comes from the one solve the Lab already runs — no second solve, however many sizes,
  prices or routes you look at. On a streamer's item, **Craft this from scratch** leads there. It is its own section on every craft
  planned from scratch, open by default; **Hide** keeps it folded on later crafts until **Show**. When
  the solve stops before its costs settle, the section says so and offers **Compute again at** the next
  Search effort, in one click, rather than disappearing.
- **Ancient bones and the Omen of Abyssal Echoes.** Both answer "wouldn't we have better odds?". An
  Ancient bone ("Minimum Modifier Level: 40") offers three mods with every ordinary tier below level 40
  taken out — nearly twice the chance of a top tier on a Wand, for a bone that costs about 1,000ex. The
  omen lets you throw a bad offer back once for a fresh three, and is spent only if you do. The planner
  weighs both on every Desecration and the Quick check shows their rows. With the floor fix below,
  ordinary 3–5 mod crafts measured 32–62% cheaper and mostly faster to solve, and fubgun's Aldur staff
  falls from 705 to **596 divine**. Both can be marked "I don't have this"; Desecration now lists
  Preserved and Ancient.
- **The Quick currency check offers Desecration.** Asked "it says Exalted Orb but we could desecrate
  also?", the honest answer was that the panel only ever knew six orbs. It now shows a **Desecration**
  row on every add, plus a **Desecration + Omen of the …** row when the mod is a carved one, and
  carved mods are selectable in *Mod to add*. The odds are the three-mod offer a bone actually gives
  you, not a single draw — on a nearly-finished Wand wanting `+# to Intelligence`, a bone reads 26.8%
  at 0.62ex against the Exalt's 12.6% at 1ex, which is 3.5x cheaper per success and was invisible
  before. Essences and orb strengths are still absent, and the guide says so.
- Two rules the panel now states rather than hiding: an item holds **at most one desecrated mod**, so
  the row is refused while a carved mod is on it; and the boss omens work on a **Weapon or Jewellery**
  only, so on armour the row says why instead of vanishing.

### Fixed

- **GitHub's code scanning (CodeQL) findings are fixed.** Two patterns that read poe.ninja's streamer
  data could slow down quadratically on a hostile line — `[` after `[` with no closing bracket, or a
  long run of digits. They run only in the periodic streamer job, never in a player's browser, and now
  read each line in one pass. The rest were in tests and a measuring script: a hand-escaped pattern and
  a pattern built from a command-line argument now compare plain text, and a test that stripped HTML
  with patterns now parses the page.
- **Typing a trade price in "Start from an item you buy instead" works as expected.** Reported "when I
  try to change the prices it does not work". Two faults, both reproduced in Chrome on the live site: the
  price box silently dropped a comma, so "0,5" was read as 5, ten times the price; and the list
  re-ranked on every key, so the first digit sent the row to the top and the box you were looking at
  now belonged to another item. A comma is now a decimal point, a box turns red when it cannot read what
  you typed, and the rows stay put — the cheapest item you priced is tagged **best buy** instead, with a
  line saying whether it beats crafting from scratch. The panel also reads more plainly: the from-scratch
  cost stands on its own line, each row is tagged Magic or Rare with one modifier per line (a two-line
  modifier such as Spell Damage / maximum Mana no longer reads as two), the unit sits beside every price, each
  total says what it saves, and every row has a **Route** button. A route on screen is no longer redrawn
  on each key typed.
- **"What to look for when you buy one" counted a slot of alternatives wrongly, and priced a carved
  modifier on the wrong item.** A Cold-or-Lightning slot plus Cast Speed listed 8 items where there
  are 4 — "Cold + Lightning" as two modifiers, and Cold and Lightning as two items at one price. An
  item already holding a desecrated modifier was priced as if it could still be desecrated; it is now
  priced as the real item, which cannot. Crafts without alternatives or carved targets are unchanged.
- **Reset and a base change now clear the "True expected cost" card** — it stayed on screen for a
  craft that was no longer there.
- **Transmutation and Augmentation roll at modifier level 55 (Greater) and 70 (Perfect), not 35 and
  50.** Every orb had the Exalted Orb's ladder, so a Greater or Perfect Transmute could land a mod whose
  best tier is 54.
- **The planner considers Desecration for ordinary mods again, whatever a bone costs.** Asked "why do
  we not desecrate also, wouldn't we have better odds?" on fubgun's Aldur staff, the answer was that a
  price rule had switched bones off: it allowed them only while a bone cost less than three Exalted
  Orbs, and since early September none has (jawbone 4.2ex, rib 21ex, collarbone 110ex). The rule assumed
  three Exalts could stand in for one bone, but they put three mods on the item where a bone puts one,
  kept from three offers — and on a high-tier craft a miss costs far more than the bone. With bones back
  that staff costs **705 divine instead of 7,445**, and ordinary 3–5 mod crafts measured 11–73% cheaper.
  Solves that use them take 2–8x longer: two five-mod crafts that fit the Standard effort now need
  Exhaustive.
- **The Aldur staff's sixth modifier is "Extra Cold or Extra Lightning", not Cold alone.** Passion of
  Aldur converts either one to fire, so both finish the craft — asking for Cold alone threw away every
  roll that landed Lightning, and quoted a dearer craft than the real one. "Craft this from scratch" and
  "I have some of these" now send one slot holding both, and the rune note beside the targets counts
  that slot once ("2× fire", not "3×").
- **Crafting a streamer's Aldur-rune item from scratch sends all of its modifiers.** fubgun's staff holds
  two "Gain #% of Damage as Extra Fire Damage", made by rolling Fire and Cold and then socketing a Passion
  of Aldur. The Streamer gear tab was built to send that six-modifier craft, but in the app it sent five
  and never mentioned the rune — and the Lab's rune suggestion for two "gain as extra" targets never
  appeared either. Both work now.
- **The Streamer gear tab reads "reduced" modifiers.**
 "#% reduced Attribute Requirements", "reduced
  Duration of Bleeding" and "reduced Poison Duration" on you, and a belt's "reduced Flask/Charm Charges
  used" always showed as "could not match" on a streamer's item, though pasting the same item read
  them. The game data sends these as negative numbers, and the reader flipped the sign a second time.
- **Items on 1,019 more bases are recognised.**
 Pasting an item — or reading a streamer's gear — said
  "not a base in the 0.5.0 data" for every Ezomyte, Maraketh, Vaal or Karui base and every Runeforged or
  Runemastered one: low-level bases like Leather Vest, and endgame ones like Sekhema Sandals and the
  Akoyan Spear. The data had them all along; the data pipeline built each base row from one variant and
  named only that variant's bases. It now also names every variant that rolls the identical pool,
  checked modifier by modifier on each refresh. No modifier, weight or price changed. The Streamer gear
  tab shows the 11 items it could not read before.
- **An item can only hold one fractured modifier
, and both tabs now say so.** You could mark every mod
  on your item as fractured, which describes an item that cannot exist — the Fracturing Orb's own text
  is *"Fracture a random modifier on a rare item with at least 4 modifiers"* and *"Cannot be used on
  Fractured items"*. Marking a second now releases the first, the way the one-carved-mod rule already
  worked, and the note under the item says why. A share link carrying two is clamped on decode, across
  both sides, since the cap is per item. Deliberately **not** gated on "at least 4 modifiers" — that is
  a rule about applying the orb, not about the item afterwards, and annulling a fractured item down to
  two mods leaves the fracture in place.
- **"Copy my current mods" copies the tier too.** It set every target to the *worst* tier, which was
  the only honest option while a held mod had no tier of its own — now that the item builder carries
  the real one, it copies that, and the row reads `✓ on your item (T2)` rather than asking you to
  re-roll something you already have.

- **Alloys are named and priced properly.** The 13 Runes of Aldur Alloys were already modelled — poe2db
  files them beside the Perfect Essences because they share a mechanic — but under a name the pipeline
  invented (*"Perfect Essence of Sovereign Alloy"*; the game says **Sovereign Alloy**) and a price
  nobody set. All 272 of their mods carried one fabricated value, `4.331 ex`, the generic
  perfect-essence median, because the price lookup asked poe.ninja for `perfect-essence-of-…` and the
  Alloys are served under bare names from a feed the refresh never fetched. Now fetched from
  **`type=Verisium`**: 272 of 272 priced, **13 distinct prices from 3.63 to 2,261 ex**. Celestial Alloy
  was being charged **1/522nd** of what it costs — and the optimizer ranks plans by cost, so that did
  not just understate a total, it made Alloy routes look like the bargain of the frontier.
- Alloys are labelled `· Alloy` rather than `· Perfect Essence` in both pickers, and the entries the
  price sheet has to infer rather than observe **fell from 58 to 41**. The `source` line shown under
  every cost also stopped claiming omens are hand-transcribed "(no API serves them)" — they have come
  from the Ritual feed since 2026-09-02.

### Added

- **Wand and staff bases are split by spell element** (42 bases → 52). Reported as *"a cold wand base
  can only roll +x to cold spell skills, and not fire"* — true, and the dump says so outright: a base
  carries `no_fire_spell_mods` and friends, and every mod they gate lists that tag at weight 0. The
  refresh had deliberately skipped those variants, so the app shipped the unrestricted **Attuned Wand**
  as "Wands" — right for 9 of 18 wand bases, wrong for the other 7. Pick your base in the **Variant**
  menu: `Cold only · Frigid Wand`, `Chaos only · Primordial Wand, Withered Wand`, and so on, named by
  the base you actually own. Only Wands and Staves are affected; Quarterstaves' `ezomyte`/`maraketh`
  cultural variants gate no mod at all and stay collapsed.
- The correction is not just the missing rows. Gated mods stayed in the **denominator**, so the app
  understated the odds of every mod that *is* legal: one Exalt landing `+X to Level of all Cold Spell
  Skills` goes **2.273% → 3.030%**, and a 3-target cold craft **0.0072% → 0.0146% per run (2.03×)**,
  with two plans on the frontier where there had been one. The old error ran conservative, which made
  exactly the bases a cold or fire caster would buy look worse than they are.
- **The base picker names real game bases.** `listBases` had always thrown the data's name away and
  synthesised one from the id; it now prefers the data's when it carries more, which is what lets a row
  say `Frigid Wand` rather than `Wands cold`. Developer placeholder bases (`[DNT…]`) are filtered out.

### Fixed

- **115 mods labelled themselves with their WORST roll.** Reported by a player wanting `+5 to Level of
  all Fire Spell Skills` who was shown *"+1 to Level of all Fire Spell Skills"* beside a dropdown
  reading `T1 · of Inferno · ilvl 81 · 5–5`, and left to join the two up. `cleanText` in the refresh
  only collapses a *parenthesised* range to `#`, and RePoE renders a fixed roll without parentheses —
  so the literal from `tierIds[0]`, the worst tier, survived into the label of every tier.
  `15% reduced Attribute Requirements` really goes to **35%**. Fixed in the generator
  (`tools/refresh/modText.mjs`, so a refresh cannot put it back) and in the shipped data, by one rule a
  test holds both to. It rewrites only what it can prove — the rolls must vary, the worst must be a
  single value, and the text must hold exactly one number matching it in *magnitude*, since the sign
  lives in the words. One mod of the 115 has no number at all (`Loads an additional bolt`) and is
  correctly left alone.

### Added

- **A mod now reads with the numbers the tier you picked actually rolls** — `+5 to Level of all Fire
  Spell Skills`, not `+#`. On target rows in both tabs and on the item's own mod chips, resolved
  against that row's tier. The browse list keeps its `#`, because no tier has been chosen there yet.
  Mods with two or three values (153 of them) fill in order: `101–151 to 152–220 Physical Thorns
  damage`.
- **A fixed roll stops printing as a range.** The tier label said `· 5–5`; it says `· 5`. Negative
  rolls show their magnitude, low to high — `#% reduced Charm Charges used` is stored `[-10, -8]` and
  now reads `8–10` rather than `10–8`.

- **You can say what tier your mods are actually rolled at.** Reported as *"we cannot differentiate
  what mod we want / are going to add from the mods that are already there"*. Every held mod was
  recorded at its BEST tier with no control to change it, so the app assumed your item carried a
  perfect roll of everything on it. Each mod on the item now carries the same tier selector the target
  rows have. This is not cosmetic: `classifyStart` grades a held mod against the tier you asked for —
  at or above it the planner keeps the mod, below it the mod is **blocked** and has to come off before
  the slot can be re-rolled — so that whole branch of the engine was unreachable from the UI. On a Wand
  wanting T1 `#% increased Chaos Damage`, holding it at T1 costs 439,140 ex and holding it at T8 costs
  **501,850 ex**, a 14% difference the app had no way to be told about.
- **A target row now says which of three things it is, and says it where you look first.** Each row
  carries a coloured left stripe and a labelled badge: `✓ on your item (T3)` (green — your roll is at
  the tier you asked for or better), `↻ yours is T8 — must re-roll` (amber — you have the mod but too
  low, which is *worse* than not having it, since the slot and family are occupied and the bad roll
  must be stripped), `+ to add` (blue — not on the item yet). It showed only "already have", keyed on
  the mod id alone, so the middle case rendered green; the first fix put all three in a 10px badge on
  the right edge, which read as decoration.
- **A tally above the list** — `3 slots: 1 already on your item · 1 to re-roll · 1 to add`. Counted by
  SLOT rather than by target, because a slot's alternatives are one position filled by whichever mod
  lands, so three candidates must not read as three mods you need. The rows themselves cannot be
  grouped into those three sections for the same reason: a slot's members can be in different states
  and have to stay together.
- **The target picker offers mods you already hold**, labelled `· on your item`. It reused the Quick
  check's add list, which excludes them — so *"I have this wand, I want the mana roll better"*, the
  commonest from-item craft there is, could not be expressed at all except by `Copy my current mods`,
  which copies everything at its worst tier.

- **The Quick currency check offers orb strengths and essences** (TODO §18, now closed). Every add row
  also appears at **Greater** and **Perfect** where the sheet prices one and it can land — the route
  cards beside it have named those orbs since the orb-strength axis shipped, so the panel had been
  disagreeing with them on one screen. It surfaces genuinely non-obvious trades: on a Wand wanting
  `#% increased chance to Shock`, a **Greater** Exalt is 4.91% at 8.79ex against a plain one's 4.17% at
  1ex — while the **Perfect** Exalt is *worse* at 4.03% for 1023ex, because its ilvl floor cuts out the
  lower tiers that also satisfied the target.
- **Essence rows**: Perfect Essence on a Rare, quoting the odds it eats the mod you named, with the
  Sinistral/Dextral Crystallisation omens — and only the one for the side that mod is on. Regular
  Essence on the Magic branch at P=1, its level chosen by `cheapestEssenceLevel`, the same function
  both planners use. The check's dropdown now offers every mod some currency can place.

### Fixed

- **A Quick-check selection could outlive the mod it pointed at.** The parent cleared the add/sacrifice
  picks when a mod was dropped and when the base changed, but not on the rarity trim that silently
  removes mods when a Rare becomes Magic — leaving a pick on a trimmed mod, which renders a blocked
  "can't apply" row underneath a dropdown reading "— none —". The panel is now its own component and
  clamps both picks against the lists it is handed, which cannot have that bug.

### Changed

- **The step-plan cards no longer show a free-restart total, on either tab.** Reported as *"the prices
  are so high, I'd rather just keep the true expected cost"*. That total divided one run's price by the
  chance it lands, which prices binning the item and buying a fresh base after every miss — a policy
  forbidden to repair, and one no player follows from white any more than from a held Rare. **True
  expected cost** already answers the same question under optimal play *and* has "bin it and start
  again" among its actions, so wherever restarting really is cheapest it agrees, and where it is not it
  comes back orders of magnitude lower. A card now shows the two figures that survive intact: the
  chance one clean run lands, and what that run costs.
- **The frontier is filtered on the numbers a card actually shows.** The optimizer prunes on
  `(expected cost, probability)` — correct for the question it answers, wrong for a card that no longer
  shows expected cost. Because `expected` charges a step only by how often you *reach* it, a plan
  saving its 1023ex Perfect Exalt for last scored as though the orb were free. Measured over 61
  frontiers: 51 had a per-run cost that fell as the odds rose, and **229 of 470 cards were beaten on
  both visible numbers** by another card in the same list — one Helmet craft led with 25.2ex a run at 1
  in 60,000 while its last card asked 4.0ex at 1 in 10,500. Cards drop from an average of 7.9 to 4.3
  and every one left earns its place. The budget search is untouched; this is a display filter.
- **The budget panel's expanded plans match the cards.** A row's plan footer read
  "≈ n attempts · X expected"; it now says what one clean run lands and what it costs. Which plan a row
  picks was already sound — `bestByBudget` ranks on the within-budget CDF, not on expected cost — so
  this is display only.

- **Gone with it**, all claims that ranked on the hidden total: the `best value`, `cheapest` and
  `surest` badges, the "no route lands inside 40 attempts" note, `recommendPlan`,
  `MAX_PRACTICAL_ATTEMPTS`, and the `freeRestart` prop with its five branches. The Lab's screen-reader
  announcement now names the plan the cards lead with instead of announcing "Best value".

- **Numbers are written for a player, not a spreadsheet.** Reported as "some of the numbers can be
  pretty big and not user friendly, like 5.10e9 or having costs in the Billions". Scientific notation
  is gone from every panel: a chance below a hundredth of a percent is now stated as odds (`3.9e-10%`
  → **1 in 256.4 billion**), and a magnitude past a million is said in words (`6.1B div` → **6.1
  billion div**, `5.1e+9` → **5.1 billion**). Words start at a million and not below, which was
  measured rather than picked — "8.2 thousand ex" loses to "8,219 ex", so separators keep the middle
  of the range.
- **The plan cards stop printing one number twice.** `expectedAttempts` is `1 / total` and
  `probability` *is* that same `total`, so "chance per attempt" and "≈ n attempts" were exact
  reciprocals. On a real six-target Wand the card read `1 in 868,920` directly above `≈ 868,920
  attempts`. The duplication survived this long because the two used to render as `3.9e-10%` and
  `2.6e+11` — two unreadable strings do not look alike. The attempt count is gone; the per-run price
  beside it, which is genuinely a second fact, stays.

### Fixed

- **A long-shot row re-denominated the whole budget panel.** `pickUnit` took its max over every row's
  `expected`, which divides by a ~1e-9 chance and is astronomical by construction — so one hopeless row
  chose divine for the panel and a budget typed as "500" read back as "1.4 div". The same "one unit per
  QUANTITY, not per view" defect already fixed in `FrontierView`. The max is now over the costs that
  actually render.

- **Four percentage formatters had drifted apart.** `FrontierView`, `ItemActions`, `AlternativesView`
  and `PolicyGraph` each carried their own, and all four fell through to `toPrecision`, which emits an
  exponent below 1e-7. They now share `formatChance`/`formatOdds`/`formatCount` in `src/lib/currency.ts`
  — the same consolidation, one concern over, that the cost formatters in that file already record.
  Two keep a local rounding policy for a reason now written down: `AlternativesView` renders *brackets*
  ("45%–52%") where a second decimal doubles the width, and `PolicyGraph` writes into a 48px column
  where "1 in 5.3 million" would re-break the layout — it floors at `<0.001%` instead.
- **The Quick currency check priced its own orbs.** Every row now goes through the planners'
  `stepCost` on a `pricesForBase` sheet, which fixed two live defects on rows that already shipped: a
  Desecration would have been charged the flat `desecrate` key — the *rib* price, 0.30ex — on every
  base including weapons (0.62ex) and jewellery (4.00ex); and the Omen of Light surcharge was summed
  by hand, a second copy of the pricing rule. One step, one price: the same discipline the D8
  desecration mispricing was fixed by.
- **Long labels overlapped in the policy graph.** SVG text neither wraps nor truncates, so a state
  label ran under the ×N beside it and an action name ran under its cost — `5 mods · 1 off-tier ·
  desecrated` drawn on top of `Desecrate (Omen of the Sovereign)` on top of `2,934 chaos`. The box
  now lays its two rows out in HTML: the numbers keep their width and the label ends in an ellipsis,
  measured by the browser rather than guessed from a character count. Nothing is lost — the full state
  is in the box's tooltip and in the detail panel a click away.
- `addBlockedReason` told a player that a carved or essence-only mod "can’t roll on this base". It
  rolls there fine; it just needs a different currency. It now names the one that can place it.
- **The Item tab says how far along your item really is, in currency.** "I have four of the six, I
  just need two more" reads as two-thirds done. On a six-mod craft it measured **4.4%** — the last mod
  alone is 53% of the cost and the first three together are 0.27% of it. Cost is back-loaded: every mod
  already on the item leaves fewer open slots for the next one to land in, while a miss then needs an
  Annulment that takes a mod at random. The true-cost card now names what your item saves against the
  same base with none of those mods, and says outright that counting mods overstates your progress. It
  is free — the figure is a value the solve already computed. It also handles the other direction: an
  item carrying junk and none of your targets measured **489 ex worse than an empty base**, and reads
  as "behind a clean start" rather than as a negative percentage. Shown only when the solve converged,
  since two unconverged figures are floors whose difference bounds nothing.
- **An item that already matched its target took 71 seconds to be told so.** *Copy my current mods*
  sets every target to the worst tier, so whatever you hold satisfies it by construction — and the
  true-cost model then solved all 15,545 states to reach zero. Worse on the default setting, where it
  ran out of clock on the way and reported the result as a bound: **16 seconds to print "≥ 0 ex"**
  under the heading *True expected cost*. Both are 1–2 ms now. The step routes beside it had always
  short-circuited this; only the true-cost model did the work.
- **"best value" sat on the most expensive plan on the frontier.** The frontier ascends in both price
  and probability, so its last row is the surest AND the dearest. When no plan finishes inside a
  practical number of attempts the app falls back to that row — correct, a list has to open somewhere
  — but the badge restated the fallback as a claim. On a six-mod T1 Wand it therefore read "best
  value" on a 6.1-billion-divine plan while a 190-million-divine one sat on the same screen, 32x
  cheaper and differing only in the first step's orb. The fallback stays and keeps its highlight; the
  claim goes, and the screen-reader announcement that repeated it goes with it.
- **The expected-cost total now says what it assumes, on the crafts where the assumption stops
  holding.** That figure divides one run's cost by the chance it lands, which prices scrapping the
  item and starting from a fresh base after every miss — fair from white on an ordinary craft, and
  runaway on a long shot. On that same Wand, 99.3% of the 6.1 billion divine is a single Perfect
  Transmutation Orb bought 260 billion times, and the true expected cost of the same craft is four
  orders of magnitude lower because it repairs the item instead of replacing it. The number stays;
  a note beside it now explains what it is, and only where no route lands inside 40 attempts.
- **Attempt counts were unreadable at the top of the range** — `≈ 1050000000000.0 attempts`, twelve
  unseparated digits and a decimal place that is noise at that size. They now group in the thousands
  and go exponential past a million, matching how the chance beside them already renders.
- **The link preview was a grey rectangle.** Every meta tag was already correct — 1200x630,
  `summary_large_image`, absolute URL — but the image behind them was a flat fill and a monochrome
  outline, and Discord renders it about 500px wide, where that said nothing about what the site is.
  The new card carries the logo, what the tool does, and the domain, on a background with actual
  depth. It is rendered from `scripts/og-card.html` by `npm run og`, so the tagline and palette can
  be edited as text rather than re-exported from a design tool. The image URL gained a `?v=2`,
  which is the only cache key Discord, Slack, X and Facebook expose — replacing the file at the same
  path would have left everyone who had already seen the old card still seeing it.
- **A 70% chance read as a certainty.** The Quick check's plain-language line rounds "1 in N" to a
  whole number, which was harmless while nothing on the panel cleared 50% — the boss-omened
  Desecration lands at 70.4% and rendered as *"≈ 1 in 1 each orb"*, directly beneath the percentage
  saying otherwise. N now carries a decimal below 10, and above 95% the idiom is dropped for "almost
  every orb", since even a decimal shows 1.0 there. Only P=1 may still say "guaranteed".

## [1.0.0] - 2026-09-02

The release that retires the backend. **0.9.7 was a Java service** — a beam search behind an HTTP API,
with a thread pool sized down to stop it saturating a 2-core box and a connection leak fixed the week
before. **1.0.0 is a pure client-side TypeScript engine** that computes exact analytic probabilities,
prices every plan against live market data, and solves the craft as a Markov decision process that
ends on a proof of optimality rather than a tolerance. No server, no account, nothing to install.

It also says what it does not know. Where a number rests on an assumption the app labels it; where a
solve ran out of time it prints a bound with the inequality the right way round; where a route exists
that the planner does not search, the copy says so rather than calling it impossible.

### Added

- **A true expected cost, and the policy that achieves it.** The craft is modelled as an MDP over
  `(present, blocked, junk prefixes, junk suffixes, desecration flag, rarity)` and solved by policy
  iteration, so a converged answer is exact rather than within a tolerance. Measured over 18 realistic
  crafts and 108 solves, policy iteration resolved every craft it could start, and produced a ceiling
  **zero** times where value iteration produced one on up to 6. The optimal policy is drawn as a graph
  you can click through.
- **A cost ↔ probability frontier**, priced in Exalted-Orb equivalents: the cheapest route, the surest
  route, and the real trades between them, with per-step odds.
- **"I already have this item"** — per-currency odds for the item in your stash, and a planner that
  keeps the mods you started with instead of costing a craft from a blank base.
- **Budget mode.** "I have 200ex — what is the closest thing I can actually finish?", answered with the
  probability of finishing inside the budget rather than an expected cost that busts half the time.
- **Orb strengths on both planners.** Basic, Greater and Perfect are searched for every add currency,
  decided per step by a backward dynamic program rather than enumerated — which is what made the axis
  affordable at all (see *Changed*).
- **Currency exclusions.** Tick what you do not own and the search prunes it, so an excluded currency
  can never reach the frontier.
- **Interchangeable target slots** — "increased Cold **or** Lightning damage, either one" — with the
  state-space reduction that makes them cost about what one mod costs.
- **Desecration**, in full: the bone that matches your gear, the three boss omens (Weapon or Jewellery
  only, as the game has it), the untargeted draw that armour is limited to, and the rule that a bone
  **offers three modifiers and you keep one**, which is worth about 3x and is evaluated inside value
  iteration rather than folded into a distribution in advance.
- **Essences**, both grades. A regular Essence needs a Magic item and converts it; a Perfect Essence
  works on a Rare and swaps. Which level to buy is chosen by price, not by tier index — the sheet is
  not monotone in level for 83% of essences, and choosing by price moved the quoted cost of the 317
  essence targets from 8,595.8 ex to 646.6 ex.
- **Omen of Whittling** — the Chaos Orb that removes your lowest-**level** modifier. It appears as its
  own row beside the plain Chaos route.
- **Omen of Greater Exaltation** — one Exalted Orb landing two modifiers. Worth 42% off the cheapest
  route on a 6-target T1 Wand craft. The true-cost model deliberately does not use it: that model
  re-decides after every orb, and this omen is a promise not to.
- **Belts**, so every equipment slot is now supported. One base, because all 20 of the game's belt
  bases carry a byte-identical craftable pool.
- **Every solve runs in a Web Worker**, with a real progress bar and a working Cancel.
- **Share links and workspace persistence** — a craft survives a reload and travels as a URL.
- **Search effort presets** (Quick / Standard / Exhaustive), rendered on every tab that obeys them.
- **A self-refreshing price sheet.** `refresh-prices.yml` pulls poe.ninja daily and **merges its own
  pull request** when the data passes a market-depth check; a failed check leaves the PR open, titled
  `REVIEW NEEDED`. Depth is units traded per day, not the raw volume field, which is divine-denominated
  and ranks liquidity backwards.
- **Five browser tests**, the first this project has had: a cold load with zero console errors, a Lab
  compute, an Item compute, a share-link round trip and a mobile pass, run against the built site with
  its real security headers.
- **A linter in CI** (ESLint, type-checked rules), and three separate type-checks rather than one.
- **Error reporting worth reading** — source maps, and worker errors carried to the main thread so a
  crash in the hardest code in the app is no longer just a progress bar that stopped.

### Changed

- **The engine is analytic, not a search.** Probabilities come from exact weight-pool math anchored to
  frozen golden fixtures from the retired Java engine; Monte-Carlo is used to validate, not to answer.
- **Orb strength is decomposed, not enumerated.** A step's strength and omens change its price and its
  odds and nothing else, so the item trajectory is fixed by the sequence alone. That rewrites the cost
  as a suffix product and turns a `3^m` product into a backward DP whose pruning is exact. The result
  searched **192x more assignments while running 3.3–3.5x faster**, and from a white base 19–66x
  faster. It also changed answers: the old throttle deleted the cheap end of the frontier, and a
  6-target T1 craft's cheapest plan went from 42.7 billion ex to the real 2.47 billion.
- **A fixed policy is costed in closed form** rather than iterated to. A 3-target T1 craft fell from
  60.1s to 2.3s, and a 6-target T2 craft that used to run ~1,000s to a ceiling now returns an exact
  answer in 292s.
- **The solver never sees two spellings of one move**, which recovered 23–31% of its work.
- **The budget search screens before it settles** — 3.4–3.7x, with byte-identical rows.
- **Prices are live poe.ninja data**, including omens (which are served under Ritual, not Omens) and
  1,288 per-essence entries. Costs display on a unit ladder chosen per view, with the exact figure
  always in a tooltip.
- **The patch data the browser downloads is derived from the repo's copy, not identical to it** —
  minified and projected onto exactly the fields the app reads. 137,701 → 65,013 bytes over the wire
  (−52.8%), and first load −26.6%.
- **Sentry loads lazily**, keeping 90 kB gzip off the critical path.
- The header no longer says BETA, and its version number is read from the manifest instead of being
  restated in the source.

### Removed

- **The Java backend** (`src/main/java/`, `pom.xml`) and with it the HTTP API, the thread pool and the
  connection lifecycle. Its validation legacy survives as frozen golden fixtures the engine is still
  differentially tested against.
- **The Electron desktop build.** Chromium blocks module Workers from the `file://` origin a packaged
  app loads from, so the desktop wrapper and the solver could not coexist; the wrapper was the part
  not worth keeping.
- The orb-strength throttle and its `CurrencyDepth` badge, which described a ladder rung rather than
  what was searched, and a `maxPlans` dial that no longer moved anything.

### Fixed

- **A Chaos Orb's strengths were free.** `chaos_greater` and `chaos_perfect` are real listings and the
  engine had always honoured their ilvl floor, but the pricing key did not — a tiered Chaos billed at
  33.39 ex instead of 2,058, a 62x underquote, and "I don't own Perfect Chaos" did nothing.
- **A mid-plan add was placed at the worst tier a mod has**, regardless of what the step asked for.
  Invisible until a placed tier became an input to a probability.
- **Boss-omened Desecration was reported as impossible for 342 of 527 desecrated mods**, because the
  unomened draw was missing from one planner.
- **A malformed share link white-screened the app**, and a well-formed one with a wrong type escaped
  into app state and threw on Compute.
- **A league rollover would have priced essences at zero**, which the optimizer reads as free.
- The desecrated spawn weight was refitted on modifiers rather than offers — the earlier reading
  overstated it by 50%.

### Security

- A Content-Security-Policy served as a real response header, pinned by a test that fails if a `<meta>`
  tag reappears to shadow it.
- `npm audit` clean; the release workflow's third-party action is pinned to a commit rather than a
  mutable tag.

## [0.9.4] - 2025-11-28

### Added
- Web application deployment at poe2htc.com
- Buy Me a Coffee support button
- Desktop app download button
- BETA badge on title
- SEO optimization (meta tags, Open Graph, Twitter Cards)
- robots.txt and sitemap.xml for search engines

### Changed
- Increased header button sizes for better visibility
- Improved social media sharing previews

### Removed
- Check Updates button (replaced with Desktop App download)

### Security
- Added security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Implemented path traversal protection
- Added Nginx rate limiting (10 req/s)
- SSL/TLS configuration with ZeroSSL

## [0.9.0] - 2025-01-15

### Added
- Comprehensive documentation suite:
  - USER_GUIDE.md - Complete step-by-step usage instructions
  - DEVELOPMENT.md - Full development setup and contribution guide
  - ALGORITHM.md - In-depth explanation of Beam Search implementation
  - ABOUT.md - Project story, motivation, and developer background
  - CODE_OF_CONDUCT.md - Community guidelines
  - SECURITY.md - Security policy and reporting
- Report Bug button in header with GitHub Issues link
- Discord community link for support
- External link support in Electron with WSL fallback
- Tier value display in modifier selection dropdown
- Direct value display for single-tier modifiers
- Support for perfect essence modifiers (Hysteria, Horror)

### Changed
- Restructured README with summary+detailed-docs pattern
- Condensed README sections with links to comprehensive docs
- Improved "About Me & the Project" section
- Enhanced installation instructions with code signing notice

### Fixed
- Tier ordering to match PoE convention (T1 = best)
- Modifier selection logic for essence vs normal variants with same display text
- React key uniqueness warnings in modifier lists
- External URL opening in Electron on WSL environments
- Java code quality warnings (unused imports, variables)
- TypeScript compilation errors in SimulationContext and Sentry

### Documentation
- Complete algorithm deep-dive with examples and complexity analysis
- Step-by-step user guide with screenshots and troubleshooting
- Comprehensive development guide for contributors
- Personal story and project philosophy

## [0.5.9] - 2024-11-24

### Added
- Bundled JRE 21 with application for Java-free operation
- Auto-detection of bundled vs system Java
- Windows installer with all dependencies included

### Fixed
- Java not found errors on systems without Java installed
- Backend startup issues on fresh Windows installations

## [0.5.8] - 2024-11-24

### Added
- Comprehensive error logging to poe2htc.log file
- User-facing error dialogs with log file paths
- Detailed logging for backend startup process
- Timestamp-based logging for debugging

### Changed
- Improved error handling during application startup
- Better error messages for users

## [0.5.7] - 2024-11-20

### Added
- Auto-update functionality for Windows and Linux
- GitHub Actions workflow for automated releases
- Version checking and update notifications

### Changed
- Improved release build process
- Better artifact handling for distributions

## [0.5.0] - 2024-11-15

### Added
- Electron desktop application wrapper
- Modern React 19 UI with shadcn/ui components
- Real-time modifier selection with live updates
- Support for all crafting currencies and essences
- Omen support in crafting paths
- Probability calculations for each crafting step

### Changed
- Migrated from JavaFX GUI to Electron + React
- Redesigned user interface for better usability
- Improved performance with multithreaded backend

## [0.4.0] - 2024-11-01

### Added
- Desecrated currency support
- Essence modifier system
- Family conflict detection
- Global probability threshold system

### Fixed
- Probability calculation accuracy
- Memory leaks in beam search algorithm

## [0.3.0] - 2024-10-15

### Added
- Beam search algorithm for crafting path optimization
- Support for all Path of Exile 2 item types
- Modifier tier system
- Regal and Exalted orb probability calculations

### Changed
- Improved algorithm performance by 300%
- Refactored modifier class structure

## [0.2.0] - 2024-09-20

### Added
- Basic crafting path calculation
- Simple probability model
- JavaFX-based GUI

### Fixed
- Modifier weight calculation errors

## [0.1.0] - 2024-09-01

### Added
- Initial project setup
- Core modifier system
- Basic item class definitions
- Maven project structure
- Command-line interface for testing

---

## Release Notes Template

```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes
```
