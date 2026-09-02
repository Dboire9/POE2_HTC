# Engine validation & divergences

Log of where the TS engine (`packages/engine`) deliberately diverges from the golden-reference Java
engine, and where both are cross-checked against external sources (craftofexile.com/?game=poe2).
Per CLAUDE.md: **divergence = investigate, don't average.** Every entry below is an investigated,
intentional decision — not an averaged fudge.

## Differential status (TS vs Java, patch 0.5 baseline)

Each mechanic is checked to 12 decimal places against a Java probe that reads the same JSON data.
Regenerate every fixture with `npm run fixtures:java`.

| Mechanic | Java routine | Probe | Status |
|---|---|---|---|
| transmute | `ExaltAndRegalProbability.NormalCompute` | `TransmuteProbe` | ✅ green |
| augment / regal / exalt | same (shared add-affix math) | `AddAffixProbe` | ✅ green |
| add-affix currency floors (base/greater/perfect) | `NormalCompute` + floor | `AddAffixProbe` | ✅ green |
| add-affix omen constraint (Sinistral/Dextral) | `NormalCompute` + constrainTo | `AddAffixProbe` | ✅ green |
| annul (none/sinistral/dextral) | `AnnulProbability.ComputePercentageAnnul` | `AnnulProbe` | ✅ green |
| perfect essence remove-and-add | `EssenceProbability.ComputePercentageEssence` | `EssenceProbe` | ✅ green |
| desecration boss omens (Blackblooded/Liege/Sovereign) | `DesProbability.ComputePercentageDesecrated_currency` | `DesecrationProbe` | ✅ green |
| plan evaluator (state threading + Π composition) | `NormalCompute` / `ComputePercentageAnnul` + `calculateTotalProbability` | `PlanProbe` | ⚠️ retired (see D6) |
| plan w/ perfect essence (remove-and-add) | `ComputePercentageEssence` in-sequence | `PlanProbe` | ⚠️ retired (see D6) |

**Java-parity anchors that remain green:** the transmute + add-affix differentials call
`addAffixProbability` **without** the correctness options (`occupiedFamilies`, `slotLimit`), so they
still validate that the core `NormalCompute` weight-pool math is a faithful port. The currency
wrappers (`addNormalAffixProbability`) and everything above them now default to the **game-correct**
model (D6 + D2), which deliberately diverges from Java — so the plan Java-differential was retired and
replaced by a real-mechanic Monte-Carlo (see the optimizer section) plus hand-computed tests.

## Accuracy pass — resolved divergences (TS is now game-correct, not Java-parity)

### D6 — family exclusion in the denominator ✅ RESOLVED (2026-07-05)
The real game can't roll a mod whose family is already on the item, so the denominator shrinks as the
item fills. `addAffixProbability` now accepts `occupiedFamilies` (set by the currency wrappers from the
item); `poolTotalWeight` drops those families. **Consequence:** ordering matters even for both-open
targets (like drawing without replacement — roll high-weight families first to shrink the pool for the
rest). Validated by the optimizer's real-mechanic Monte-Carlo. Java (and the raw `addAffixProbability`
primitive with no `occupiedFamilies`) does NOT exclude — that's the retained parity anchor.

### D2 — magic = 1 prefix + 1 suffix ✅ RESOLVED (2026-07-05)
Java treats every rarity as 3+3; the game caps Magic at 1 prefix + 1 suffix. `addAffixProbability` now
takes `slotLimit` (magic 1, rare 3); the wrappers set it from the currency's **result** rarity
(`RESULT_SLOT_LIMIT`: transmute/augment→1, regal/exalt→3), since regal/exalt/essence convert to Rare
as they add. **Consequence:** augment on a 1-prefix Magic item can only add a suffix; a regular essence
(Magic-only) *spends* the Magic→Rare transition, forcing later mods to Exalts — so the optimizer places
a guaranteed mod **last** when it can, and an essence isn't always worth it even when cheap. Default
`slotLimit` is 3 (Java-parity) for the raw primitive / differential anchor.

## Deliberate divergences (TS is intentionally NOT identical to Java)

### D1 — numerator / denominator floor consistency → ✅ RESOLVED (verified 2026-07-05)
Java's `NormalCompute` sums **all** tiers of a *non-desired* mod (ignoring the currency floor) while
its denominator floors by ilvl — an inconsistency that can produce a probability > 1. The TS engine
never had it: `addAffixProbability` uses a single `[floor, cap]` window for both the numerator
(`modTierWeight(mod, floor, cap, minIndex)`) and the denominator (`poolTotalWeight(…, floor, cap)`).
Was previously only tested at level 100 (where the floor difference is masked); now proven by
`itemlevel.test.ts` — e.g. a greater orb (floor 35) on a level-55 item gives 1.0, where the Java
inconsistency (unfloored numerator 60 / floored denom 20) would give an impossible 3.0.

### D2 — magic items treated as 3+3 slots → ✅ RESOLVED (see "Accuracy pass" above)

### D3 — desecration boss omens are count-uniform (weights ignored)
`ComputePercentageDesecrated_currency` returns `1 / (count of that boss's desecrated mods of the
added mod's slot)` — it counts mods and **ignores their weights**. The 0.5 baseline boss pools mix
weights (1, 3, 1000), all counted as one. `desecrationBossProbability` mirrors this exactly (count-
based) so the differential is green. **Action:** when poe2db real weights are adopted (0.5.0 / Phase
3), switch to weight/Σweight within the boss pool.

### D4 — default (no-boss-omen) desecration: combined normal ∪ desecrated pool
Java models **no** default desecration — `Desecrated_currency.Omen` has no `None`, so a plain
desecration bone has no probability path in Java (a genuine gap). Per the user's domain ruling
("desecrated modifiers are meddled with the classic ones; denominator = normal + desecrated"),
`desecrationProbability` draws from the **combined normal ∪ desecrated pool** for the mod's slot,
by weight:

    P(mod) = weight(mod eligible tiers) / Σ weights of (normal ∪ desecrated) of the slot

On a uniform pool this reduces to the user's `1 / (normal + desecrated count)` shorthand, but it
honours real weights where they differ. **Not differential-tested** (no Java counterpart);
hand-computed unit tests only. Sinistral/Dextral Necromancy map to the `constrainTo` side
restriction.

**Denominator confirmed by the user, 2026-08-23**: normal mods DO enter the bone pool, so the combined
normal ∪ desecrated shape stands.

**The WEIGHT is not in the data (2026-08-23).** poe2db publishes no spawn weight for desecrated rows —
it reports `1` for every one of them — and `apply_pools.mjs` copied that through. Against normal
weights of several thousand it made a bone produce a desecrated mod about **1 time in 121,510** on a
Body Armour, which cannot be right for an item whose purpose is to add one. It was replaced with an
assumed 1000, chosen for plausibility, and flagged as the single largest unverified number in the app.

**MEASURED IN GAME 2026-08-24 — the assumption is retired.** The observation, from the user: **40 bones
on empty Rare `Helmets_dex_int`. A bone offers three modifiers, so 120 were shown, of which 22 were
"carved by the Abyss"** — 18.3% per draw. `scripts/desecrate-weight.mts` inverts that through the
engine's own pool maths:

| | |
|---|---|
| maximum likelihood | **2,512** (predicts 17.65% per draw) |
| plausible range | **1,995 – 3,981** |
| previous assumption | 1,000 — predicts **7.6%**, outside the interval |
| **shipped** | **2,500** (predicts 17.58% per draw) |

Rounded to 2,500: a 120-draw sample does not support four significant figures, and every value in the
interval reads the same evidence.

**Count MODIFIERS, not offers — this sample was misread once.** It was first recorded as "22 of 40
offers held a carved mod", fitted at 3,981, and shipped at 4,000 before the reporter corrected it: the
22 was the total carved *modifiers* across all 120 shown. The offer reading overstates the weight by
~50%, because "at least one of three" is a much higher bar than "one draw". Modifiers are also the
better statistic — 3N Bernoulli trials instead of N for the same bones spent — which is why this
interval is *narrower* than the offer-based one despite fitting a lower number. The script now takes
modifier counts and says so in its usage.

**The three-draw model was checked independently.** The observer reported several offers holding *two*
carved mods and none holding three. At the fitted weight the model predicts 3.3 two-carved offers in 40
and a **78% chance of seeing no three-carved offer at all** — so the count distribution corroborates
the shape, not just the headline rate. That matters, because the inversion assumes three independent
draws, and it held under both readings of the sample.

**What it changed.** A heavier carved pool makes a bone *worse* at fishing for ordinary mods, so crafts
that want normal mods got dearer. Held Rare, 3 normal targets, no restart:

| base | at 1,000 | at 2,500 | bone excluded |
|---|---|---|---|
| Wands | 2,181.3 ex | **2,493.7 ex** | 4,073.8 ex |
| Body_Armours_str | 1,358.5 ex | **1,396.4 ex** | 2,967.6 ex |
| Amulets | 52,738.7 ex | 52,738.7 ex | 52,738.7 ex (price gate closed) |

A bone is still clearly worth playing where the gate opens — 39% off on Wands, 53% on Body Armour —
just less of a bargain than the app used to claim.

The older comparison, for reference:

| base | weight 1 | weight 1000 |
|---|---|---|
| Body_Armours_dex_int | 1 in 121,510 | 1 in 132 |
| Wands | 1 in 114,415 | 1 in 129 |
| Amulets | 1 in 173,681 | 1 in 205 |

The weights are still not published anywhere, so the app keeps saying so: `EngineResult.assumedOdds` /
`EngineMarkovResult.assumedOdds` are set when a plan contains an unomened Desecration, and
`PriceBasisNote` then drops its "the odds are exact" claim and names the assumption. The boss-omen path
is count-uniform (D3) and ignores weights, so it is untouched and keeps the exact claim.
`shipped-pools.test.ts` asserts the constant so a refresh cannot silently restore the 1.

**Action: CLOSED 2026-08-24** by the in-game sample above. Worth re-running `desecrate-weight.mts` on a
second base if anyone gathers another forty offers — one base cannot rule out a per-category weight,
which is the assumption this measurement replaces one level up.

### D5.1 — pool not capped by item level → ✅ RESOLVED (verified 2026-07-05)
Java's `get_Base_Affixes_Total_Weight_By_Tier(pool, ilvl)` sums tiers with `tier.level >= ilvl` (the
currency floor) with **no upper cap by item level**, so a low-level item's denominator wrongly
includes tiers it can't roll. TS caps the pool at `item.level` (the `cap` in `addAffixProbability`).
Was only exercised at level 100 before (where max mod ilvl < 100 masks it); now proven at sub-100
levels by `itemlevel.test.ts` (hand-computed) and end-to-end by a real-mechanic Monte-Carlo at level
55 in the optimizer self-check.

### D5.2 — per-step "best currency tier" (orb strength) selection → ✅ RESOLVED (2026-07-05)
Built as `optimizePareto` (packages/optimizer). Targets are now **tier-specific** (`TierTarget =
{modId, minTierIndex}`; 0 = any tier, higher = that tier or better). Plan add-steps carry `tier`
(base/greater/perfect orb) and `minTierIndex`; the wrappers already do the correct floored math. The
optimizer explores mod ordering × essence config × **per-step orb strength**, scores each with
evaluatePlan + the restart cost model, and returns the **(expected cost ↔ success probability) Pareto
frontier** — cheapest path, surest path, and the non-dominated trade-offs between (a greater orb
shrinks the pool → higher P at higher cost). Orb strengths are constrained to those whose floor ≤ the
target tier's ilvl (an "any-tier" mod → base only). The orb-tier search is **throttled and reported**
(`currencyDepth: full | base+strongest | strongest-only`) for very large targets — never silently
capped. Prices gained greater/perfect orb variants in `prices.json`.

**Known simplification:** an essence-guaranteed mod is scored as P=1 at its target tier. Real essence
tier availability (which essence grants which tier of which mod) is a data question — a reverse index
from `essences.json` would let the optimizer respect it. Tracked, not yet built.

### D6 — add-affix denominator doesn't exclude on-item families → ✅ RESOLVED (see "Accuracy pass" above)

## Analytic optimizer (packages/optimizer)
`optimizeAddChain` enumerates all K! orderings of the desired mods (K ≤ 6 → ≤ 720), fixes the currency
by position (transmute→augment→regal→exalt), scores each with `evaluatePlan`, and returns them
best-first — an **exact** optimum, not a beam-search approximation. Validation: (1) optimality is by
construction (full enumeration); (2) `simulatePerStepRates` Monte-Carlo (200k runs) confirms each
analytic per-step probability matches sampling. Result probabilities intentionally use the base-floor
model (D5), so they are NOT expected to equal Java's beam-search reported numbers.

`optimizePlan` extends this with **essence-guaranteed mods**: mods passed in `opts.essences` become
P=1 forced-essence steps, the rest are rolled with a state-driven currency picker (transmute→augment→
regal→exalt, correct even when essences jump the item to rare mid-sequence). Without a cost model,
essences are strictly better on probability, so *which* mods to guarantee is the caller's cost-driven
choice; the optimizer finds the best ordering around them. `optimizeAddChain` is the no-essence case.

### Essence rules (user-confirmed, 2026-07-05)
The PoE2 essence mechanic, confirmed by the user and enforced in the engine:
- **Regular essences (Lesser/Normal/Greater)** apply ONLY to a **Magic** item — never white, never Rare.
  They add their guaranteed mod (deterministic, P=1) and convert the item to **Rare**. Enforced in
  `essenceForcedProbability` (returns 0 unless `rarity === 'magic'`). Consequence: at most ONE regular
  essence per craft (only one Magic→Rare transition), and it must follow a Transmute — the optimizer
  validates `≤1` essence and `≥1` rolled mod, and illegal orderings self-score 0.
- **Perfect essences** apply to any **Rare** item (0–6 mods). They add their guaranteed (perfect-only)
  mod and **remove one uniformly-random existing mod** (`1/total`, side-constrained by Sinistral/
  Dextral Crystallisation). At **0 mods** they just add (P=1, no removal). They're blocked if the
  guaranteed mod's **family is already present**. The removal math is `perfectEssenceProbability`
  (differential-matched to Java); the rare-gate / family-block / 0-mod-add live in the plan-step
  wrapper so the differential stays exact.

## Cost model (packages/optimizer/cost.ts)
`optimizeCost` ranks plans by **expected cost** in Exalted-Orb equivalents
(`data/patches/<patch>/prices.json`), turning "guarantee with an essence (dear, P=1) vs roll it (cheap,
retry)" into a real decision instead of a trivial win for essences.

Retry model: **restart-on-first-failure** — run the sequence, and the instant a step gives the wrong
outcome, scrap the item and start over from white. Closed form for per-step probs `p_k` / costs `c_k`:

    E = ( Σ_k c_k · S_{k-1} ) / S_n ,   S_k = Π_{j≤k} p_j ,  S_0 = 1

Cheap early steps are paid on every attempt; dear late steps only once the earlier ones land — so the
optimizer naturally schedules an expensive guaranteed step **late**. `optimizeCost` explores every mod
ordering × every essence config (none, or any single `essenceCandidate` guaranteed) and returns them
cheapest-first. Verified: the essence-vs-roll winner **flips** with the essence price (cheap → guarantee,
dear → roll), and the analytic per-step probs are Monte-Carlo–checked upstream.

**Assumptions / deferred:** (1) restart-from-scratch is the baseline; a smarter **annul-and-reroll**
strategy (clear the junk mod, keep the good ones) costs less and is a future refinement — but annul is
random (can hit good mods), so it's a real model, not a tweak. (2) Prices are **mostly live** — see
"Price sheet" below; desecration and essence levels remain hand-authored. (3) `essenceCandidates` are
caller-supplied; a reverse index from
`essences.json` (which mods a real essence can grant, at which tier/price) would let the optimizer infer
them — not yet built.

### Price sheet — poe.ninja refresh (2026-08-22)

`npm run update-prices` (`tools/refresh/prices.mjs`) now pulls currency from poe.ninja's PoE2 economy
API for the current league. **This was not cosmetic: the previous hand-authored sheet was inverted.**
It priced a Chaos Orb at 0.2ex and an Exalt at 1.0 — an Exalt worth 5 Chaos — where the market says a
Chaos is worth ~33 **Exalts**. Annulment 1.5 → 157.9; Perfect Exalted 20 → 770. Because the optimizer
ranks plans BY cost, chaos- and annul-heavy routes had been recommended as *cheap* while being the
dearest available.

Measured effect on a 2-mod Wand from-item craft: MDP expected cost 25.91ex → 1489.33ex, and the policy
**dropped the Dextral Annulment omen** (3313ex against a 157.9ex orb) while **keeping** Sinistral
Exaltation (8.41ex on a 1ex Exalt). Flat seed prices could not make that distinction at all.

**Omens are quoted, not fetched.** poe.ninja's API has no `type` serving them — `type=Omens` returns
byte-identical output to `type=NonsenseXYZ` (empty core, no rates), i.e. an *invalid* type rather than
an empty valid one, while Currency/Essences/Fragments/Runes/Abyss all work; the Omens web page is
client-rendered, so it can't be scraped with a plain fetch. So `prices.json` carries hand-transcribed
`omenQuotes` **in the unit the market quotes them in** (divine or chaos), re-converted to exalts on
every refresh. Storing them pre-converted would silently desync from currency on the next run, and
since an omen is an *additive* surcharge on the orb it modifies, a drifted omen:orb ratio changes which
plans get recommended. Four independent cross-checks validate the transcription against the page's own
exalt quotes: Blackblooded 42.6 vs 41, Sinistral Exaltation 8.4 vs 8.5, Liege 0.497 vs 0.5, Dextral
Necromancy 1.21 vs 1.2.

**Still hand-authored, deliberately** (the script's `KEEP` list, checked against the live spread of the
items each key stands for on every run):

- `desecrate` — the Abyss feed prices *bones* (jawbone/rib/collarbone/cranium × gnawed/preserved/
  ancient/altered) from 0.36ex to 3368ex. The engine has one generic desecration step; which bone it
  means is a game-knowledge call. The held 0.5 sits in the cheap-bone range, so it is not mis-scaled.
- `essence*` — the engine has one price per essence **level**, but the market has no coherent level
  ladder. Restricted to the six essence types quoted at all four levels, the medians run lesser 17.97,
  normal 107.2, greater 0.807, perfect 1.705 — Essence of Abrasion alone goes 116 → 107 → 0.807 → 9.18.
  Collapsing that to one number per level would invent precision. **The range check does flag
  `essence_lesser` at 0.3 as below the live minimum of 0.998** — a real (if small) known-wrong value.

Consequence for the budget CDF: real 4-significant-figure prices spanning 0.06–770ex admit no quantum
coarser than 1e-5, so `planCostCdf` usually takes its bracket fallback rather than the exact path
(6 of 16 rows still resolve exactly at a 30ex budget, where a plan's own costs happen to share one).
The bracket is tight — worst measured 0.73pp, ~1% relative — far below the day-to-day drift in the
prices themselves. Prices were **not** rounded to restore exactness: distorting data to flatter an
optimisation would trade a real error for a hidden one.

## Monte-Carlo validation of the corrected mechanics (2026-07-05)

The analytic engine deliberately **diverges from Java** on family exclusion (D6), magic 1+1 slots (D2),
orb floors + item-level cap (D5.1), tier targeting, and omen side-constraints — so Java can't be the
oracle for those. Instead `packages/optimizer/src/validate.ts` samples the **real game mechanic at
(mod, tier) granularity** (open sides only, on-item families removed, tier ilvl in `[floor, cap]`,
optional side constraint) and confirms MC → analytic by the law of large numbers. `validate.test.ts`
asserts agreement within ~4 standard errors (seeded, reproducible). Representative results
(200k samples/step, patch 0.5 data):

| base | scenario | analytic | MC | \|Δ\| |
|---|---|--:|--:|--:|
| Wands | transmute MANA, base orb, any tier | 9.615% | 9.655% | 0.040 pp |
| Wands | transmute MANA, **greater** orb (floor 35) | 12.848% | 12.927% | 0.079 pp |
| Wands | transmute MANA, **perfect** orb (floor 50) | 14.134% | 14.186% | 0.052 pp |
| Wands | transmute MANA **T1** (tier target) | 3.534% | 3.547% | 0.013 pp |
| Wands | transmute MANA at **item level 45** (cap) | 7.380% | 7.391% | 0.011 pp |
| Wands | exalt CAST after a 3-mod chain (D2/D6 threading) | 7.344% | 7.336% | 0.008 pp |
| Wands | exalt CAST **+ Dextral omen** (suffix-only) | 8.846% | 8.867% | 0.021 pp |
| Rings | regal STRENGTH after transmute+augment | 5.312% | 5.272% | 0.040 pp |
| Amulets | transmute (greater orb) | 5.456% | 5.483% | 0.028 pp |

Orb floors correctly **raise** probability (smaller pool), tier targeting **lowers** it, the item-level
cap shifts it, and the omen constrains to one side — all matching MC to <0.08 pp.

**Restart-cost formula, end-to-end** (`mcPlanCost` simulates restart-on-first-failure and averages total
spend): analytic `E = (Σ c_k·S_{k-1})/S_n` matches empirical mean cost within **<1%**:

| plan | analytic P | MC P | analytic E[cost] | MC mean | Δ |
|---|--:|--:|--:|--:|--:|
| transmute MANA (1 step) | 9.615% | 9.657% | 0.02 ex | 0.02 ex | 0.4% |
| transmute → augment (2 step) | 1.054% | 1.061% | 0.28 ex | 0.28 ex | 0.7% |

**What this proves vs. doesn't:** it proves the analytic **math** (pool weights, floor/cap windows,
family/slot handling, composition Π, and the cost formula) correctly implements the **modeled** mechanic
— no arithmetic/composition bugs. It does **not** prove the modeled mechanic matches the **real game**
(both MC and analytic derive from the same data + rules understanding). Confirming the model itself is
what external cross-validation vs the game / Craft of Exile adds — still the open Phase-3 gate.

## External cross-validation vs Craft of Exile — Wands (2026-07-05, first pass)

First real cross-check against an independent implementation (CoE poe2, hand-verified against poe2db).

**Weights: exact match.** CoE and the engine agree to the last unit across the whole wand pool —
prefix total **41,400**, suffix total **73,000**, pool **114,400**, and every individual mod (Mana 11k,
Int 8k, Spell Damage 4,350, Cast Speed 5,750, …). Since P = mod_weight / pool_total, matching two mod
probabilities to 3 dp (9.615% Mana, 6.993% Int) already pins the entire denominator. (Note: our weights
were hand-ported from poe2db and CoE also derives from poe2db, so this mainly confirms the transcription;
the independent part is the model — CoE computing the *same probability* from those weights confirms the
add-affix mechanic itself.)

**D7 — Wands damage-type family bug FOUND & FIXED.** CoE (and the mods' own tags, and the Foci/Staves
entries) show the five Wands damage-type prefixes (Fire/Cold/Lightning/Chaos/Physical "increased Damage")
belong to family **`WeaponDamageTypePrefix`**, mutually exclusive with each other but SEPARATE from the
generic "increased Spell Damage" (`WeaponCasterDamagePrefix`). The Java-derived `data/patches/0.5` had all
five mis-filed under `WeaponCasterDamagePrefix` (a Wands-only data-entry slip — Foci/Staves were already
correct). Effect: the engine wrongly excluded generic Spell Damage from any elemental damage mod.
**Fixed** (surgical family edit in mods.json); the damage-type mods still exclude each other, so earlier
"Physical + Chaos impossible" verdicts remain correct. Verified by test.

## Data-integrity guardrail (2026-07-05)

Since D7 was a *silent data error* (only luck + CoE caught it), added a standing audit
`packages/engine/src/dataIntegrity.test.ts` that runs on every snapshot — the invariants Monte-Carlo
can't see. It immediately paid off, surfacing five issues in the Java-derived `0.5` data:

- **FIXED — 5 corrupted tier ilvls.** `STRENGTH` on Crossbows/OneHand_Maces/Sceptres/Spears/TwoHandMaces
  had tier-1 `ilvl` overwritten with a weight value (500/1000/250 — impossible ilvls that stopped that
  tier rolling). Corrected to 11 (matches every clean STRENGTH mod).
- **FIXED — 3 duplicate pool entries** (Foci prefix, Bows/Spears desecrated suffix) — a repeated id
  double-counts its weight in the denominator. Deduped.
- **FIXED — empty-family fragility.** 4 `BASE_SPIRIT` mods have an empty `family`; the engine now treats
  an empty family as "no exclusion group" (`itemFamilies`/`familyAvailable` skip it) so blank-family mods
  can never wrongly collide. (Only 1 per base today, so no live bug — this hardens against future data.)
- **BASELINED (pending domain call) — 16 type/pool mis-slots.** Mods whose `type` disagrees with the pool
  side they're listed in (3 normal: `INCREASED_SHIELD_BLOCK_CHANCE` on shields/bucklers — is block a
  prefix or a suffix?; 13 in desecrated/essence pools). The engine uses `type` for the numerator side but
  the pool for the denominator, so a mismatch skews the math. Needs a ruling on which field is right;
  the test ratchets against any NEW ones.
- **BASELINED — 4 same-base mixed-affix families** (`CompanionDamage` on Bows/Spears,
  `IncreaseSocketedGemLevel` on Helmets) — a family holding both a prefix and a suffix is unusual; review.

## Orb of Alchemy — engine + optimizer (2026-07-11)

Alchemy (white → Rare with 4 random mods) and Chaos (remove-one/add-one on a Rare) are absent from the
Java engine, so both are validated by **Monte-Carlo against the modelled mechanic**, not differentially.
`alchemyProbability` (exact recursion over the 4 weighted draws) matches an independent simulation to
<0.1 pp on varied-weight synthetic pools (`alchemy.test.ts`); `chaosProbability` = uniform removal ×
weighted add composes two already-validated functions, checked by hand (`chaos.test.ts`).

Alchemy is now wired into the optimizer as an **opener**: a `{currency:'alchemy', adds}` plan step that
slams 4 target mods at once, then exalts any 5th/6th. It fires only when the plan uses no essence and
**≥4 targets are "any tier"** — alchemy has no tier control, so a tier-pinned target can't be sourced
from it. Three tests tie the optimizer's alchemy plan back to the MC-validated `alchemyProbability`.

- **GOTCHA (fixed).** The cost model treats an **unpriced currency as free** (`prices.currency[key] ?? 0`).
  A test fixture whose price sheet omitted `alchemy` therefore made the alchemy plan cost 0 and dominate
  the entire Pareto frontier (it wiped the side-omen exalt the omen test expected). Real `prices.json` has
  `alchemy: 0.1`; the fix was to add it to the fixture too. Watch for this whenever a new currency lands:
  a missing price silently reads as "free and optimal".
- **Deferred:** tier-targeting *inside* the 4-slam (any-tier only today); alchemy/chaos omens; Chaos in
  the optimizer (its natural home is the not-yet-built craft-from-existing-item flow).

## From-existing-item planner + cost model (2026-07-11)

`optimizeFromItem` plans the sequence to turn an item you already hold into a target. Two things to be
honest about:

- **Cost model — reset to YOUR item, not to white.** `planExpectedCost` uses the same restart-on-first-
  failure closed form, but S₀ is the starting item, so the plan never "throws away" the good mods you
  began with. This is the standard theorycrafting model (Craft of Exile does the same) and it assumes
  you can *reproduce* the starting item on a reset. It is **not** a full Markov model of chaos-spamming
  one irreplaceable item — that's a deliberate, documented approximation (surfaced in the UI too).
- **Exactly-the-target semantics.** Every current mod not in the target is junk to remove; every target
  mod not present is added. `transformSequences` only ever emits *complete* transforms, so "all steps
  succeed" ⟺ the item equals the target — the per-step product is a true success probability (note that
  `evaluatePlanFrom` itself does not check the final item, so this invariant lives in the generator).

Validated by hand-computed synthetic cases (the surest route to swap a suffix uses annul-first + a free
Sinistral exalt = ½, beating exalt-first-then-annul = ⅓) and real-data smoke tests. Eyeball on a full
rare wand: the planner recommends **Chaos** (one-orb swap, ~1.2%/orb) over annul-then-exalt — correct,
since Chaos is what you use when a slot must be freed. v1 is Rare-only at base orb strength; Magic
starts, the greater/perfect orb lever, chaos/annul omens, and "keep extra good mods" are deferred.

## External cross-check, round 2 — Amulets / Bows / Body Armour (2026-07-11)

Broadened the CoE cross-check past wands (user read the numbers by hand). The headline: **the data the
app ships (`data/patches/0.5`, Java-extracted) is STALE for several bases, while `data/patches/0.5.0`
(the poe2db refresh) matches CoE.** Wands matched on `0.5` only by luck (that base was already current).

- **Amulets.** `0.5` diverges hard from CoE — wrong ES prefix (`increased Energy Shield` vs
  `increased maximum Energy Shield`), wrong crit suffix (attack-specific vs generic), `+max Life`/`+max
  Mana`/`Rarity` weights off, and two prefixes missing. `0.5.0` **prefixes match CoE exactly** (12 mods,
  Σ 72200) and suffixes match except one glitch (below).
- **Body Armour (STR).** `0.5` splits the three ailment-duration mods into three families
  (`ReducedBleedingDuration`/`…Poison…`/`…Ignite…`); CoE groups them as one `ReducedAilmentDuration`
  (mutually exclusive). `0.5.0` **has the shared family correct.**
- **Bows.** `0.5` prefixes match CoE (Σ 44755) but suffixes are off by 50 (stale Attack Speed / Projectile
  weights + an old "additional Arrows" mod). Consistent with `0.5` being stale, `0.5.0` current.
- **Confirmations on `0.5.0`:** Wands totals are an **exact** CoE match (41400 / 73000 / 114400), and the
  ailment family is correct — so `0.5.0` is the right current data.

**`0.5.0` parse quirk — 6 mods, characterised.** Exactly 6 of 933 normal-pool mods have summed weight ==
tier count (each tier weight 1): Cast Speed on Amulets & Rings, ES Recharge Rate on three body-armour
bases, and Surpassing-Arrow on Quivers. **Root cause: poe2db itself lists `DropChance:1` for these** (a
source placeholder), so the join couldn't recover a real weight. CoE has the true values (amulet Cast
Speed = 800/tier = 4800). Fix = patch these 6 from CoE, not from poe2db.

**Conclusion — DONE (2026-07-11).** Migrated the app's data source `0.5` → `0.5.0`. The 6 placeholder
weights were patched from CoE (Amulets Cast Speed 800/tier, Rings Cast Speed 1000/tier, ES Recharge
1000/tier on the three ES body armours, Quiver Arrow 375/tier) — after which `0.5.0` matches CoE
**exactly** on Wands, Amulets, Rings, Body Armour (int), and Quivers, prefix and suffix. `prices.json`
copied into `0.5.0`; `src/lib/engine.ts` repointed. The Java differential fixtures + facade tests stay on
`0.5` (the engine-vs-Java anchor). Verified: type-check + 501 tests + build green, dev server serving the
patched data. Follow-ups: run the data-integrity guardrail on `0.5.0` and re-baseline; migrate the facade
tests/fixtures off `0.5` when Java is finally retired.

## Essence + desecrated pools added to 0.5.0 (2026-07-13)

Built the essence and desecrated pools for the shipped `0.5.0` snapshot straight from the cached poe2db
per-class pages (the parser already extracted them; only the pipeline dropped them). New step
`tools/refresh/apply_pools.mjs` (wired into `run.sh` after `apply_weights.mjs`) merges them into
`mods.json` + `base_items.json` and emits `essences.json`.

- **Desecrated:** one mod per poe2db row (ilvl 65, weight 1), boss tags preserved
  (amanamu 175 / ulaman 188 / kurgal 164). Same family may span distinct prefix+suffix mods, so rows are
  NOT grouped. Lights up `desecrationProbability` (weight-based combined pool) and
  `desecrationBossProbability` (count-uniform, 1/count).
- **Essence:** rows grouped by (type, family, essence, stat-text) into a mod whose tiers are the
  Lesser/Normal/Greater levels (weight 0, deterministic). Armour pages embed the table once per
  attribute variant — filtered to the base's own attribute tag (mirrors `pickVariant`) to avoid the
  6×-duplication that first showed up. **19 essences**, 317 essence mods; `essences.json` maps
  essence → level → forced mod ids. **Perfect essences deferred** (poe2db carries none; engine still
  anchored on 0.5).
- **Counts:** `0.5.0` now normal 933 / desecrated 527 / essence 317 (vs Java 0.5: 635 / 373 / 264 +
  79 perfect). The one mixed-family finding (`CompanionDamage on Bows`/`Spears` — a real desecrated
  prefix+suffix sharing a family, identical to 0.5) is baselined in the guardrail.
- **Validation:** data-integrity guardrail green on 0.5.0; new `shipped-pools.test.ts` exercises
  essence-forced + plain/boss desecration on the real data; facade test reaches a 0.5.0 essence via a
  P=1 essence step. Full suite 513 + 1 todo, type-check clean.

## Perfect essences added to 0.5.0 + wired into the from-item planner (2026-07-13)

Extended the essence work with the **perfect-essence** pool and the remove-and-add-on-rare flow.

- **Data:** poe2db embeds a separate `"perfect_essence":[` array (missed the first pass — the parser
  read only normal/desecrated/essence). Taught `poe2db.mjs` to read it and `apply_pools.mjs` to build
  **363 single-tier `perfect_essence` mods** into the essence pool (deterministic, weight 0), incl. the
  perfect-only essences (the Alloys, Delirium, Horror, Hysteria, "the Abyss", "the Breach"). `essences.json`
  gained a PERFECT level (37 essences total). "Mark of the Abyssal Lord" (family EssenceAbyss), which
  poe2db lists as both a prefix and a suffix, is deduped to one mod. Guardrail baseline gained 8 more
  legit cross-source mixed families (a desecrated mod + a perfect-essence mod sharing a stat family on
  different sides: AdditionalBallistaTotem, ElementalInfusion, ManaCostEfficiency×6).
- **Planner:** `optimizeFromItem` now handles perfect-essence targets — a perfect mod can only be placed
  by a Perfect Essence, which removes one uniformly-random mod as it adds, so each perfect target is
  paired with a distinct **junk** to sacrifice (throws if there aren't enough junk mods). The
  **Sinistral/Dextral Crystallisation** omen (constrains the removal to a side) is explored as a
  cost↔probability lever alongside the exalt omens. Facade `listPerfectEssences` surfaces them (source
  'perfect') for the from-item target picker only; `mapFrontier` renders "+add −removed (random)".
- **Eyeballed (real 0.5.0):** rare wand [Mana | Intelligence] → keep Mana, add "Perfect Essence of the
  Abyss": raw essence P=50%/30ex (removes 1 of 2 uniformly); with Dextral Crystallisation the removal is
  confined to the lone suffix (Intelligence) → **P=100%/25ex**, which dominates. Cost checks out
  (perfect_essence 15 + omen 10). Validated by hand-computed optimizer tests (uniform ½, omen→1,
  no-junk rejection), facade tests, and `shipped-pools.test.ts`. **519 tests + 1 todo, type-check + build green.**

## Cross-check of the new pools vs the independent Java extraction (2026-07-13)

The CoE JS calculator can't be scraped, so the fully-automatable cross-check for the new
essence/desecrated/perfect pools is **0.5.0 (poe2db, current) vs 0.5 (Java, hardcoded ~0.2-era)** — two
independent extractions of the same mechanic that (verified) share the family namespace and stat text.
`scripts/coe-newpools-check.mts` runs it. **Result: all invariants pass.**

- **Essence coverage:** all **21** Java essences survive into 0.5.0; the 16 extras are exactly the new
  perfect-only essences (the Alloys, Delirium, the Abyss, the Breach) — a plausible newer-patch addition,
  not a loss.
- **Forced-mod (family, text) agreement:** 18/21 shared essences match exactly. The 3 that differ are
  confirmed **current-patch reworks**, not build bugs (families still line up, so exclusion is correct):
  *Enhancement* is now one combined "Armour, Evasion and Energy Shield" (was 6 separate defence mods);
  *the Infinite* uses the combined "+# to Str, Dex or Int" text across its 3 attribute families (Java
  split the text); *Electricity* gained an "Adds 1 to # Lightning" variant (same LightningDamage family).
- **Internal consistency (0.5.0):** every essence mod's tier ilvls ascend and per-level min values are
  non-decreasing (Lesser ≤ Normal ≤ Greater); all desecrated mods carry weight > 0 with balanced boss
  tags (amanamu 175 / ulaman 188 / kurgal 164); all perfect essences are single-tier, deterministic (w0).
- **Human spot-check (DONE 2026-07-13):** the script writes `/tmp/coe-newpools-worksheet.md` — per-base
  essence / perfect / desecrated **values** for a hand-check against CoE. User confirmed the essence value
  ranges match CoE across the sampled set (Amulets max Life 20–29/70–84/85–99, Fire Res 11–15/21–25/31–35,
  max Mana 25–34/80–89/90–104; Wands Spell Damage 35–44/55–64/75–89, Cast Speed 13–16/17–20/25–28) — level
  scaling and range parsing verified correct. (CoE and our data both derive from poe2db, so this confirms
  the extraction, not an independent value source; the 0.5-vs-0.5.0 diff above is the independent check.)

*Compound-mod text (FIXED 2026-08-08):* poe2db compound mods concatenated their two stat lines without
a separator ("…Spell DamageMinions deal…"). Root cause: `stripHtml` in `tools/refresh/poe2db.mjs`
stripped the `<br>` between stat lines to nothing (the RePoE path kept `\n`; this one didn't), and
`apply_pools.mjs`'s `cleanText` then collapsed all whitespace. Fixed both to map `<br>`→`\n` and preserve
newlines, then re-ran `apply_pools.mjs` against the cached poe2db pages: 32 desecrated/perfect_essence
text fields regained the separator, IDs identical, 0 weight changes (the 6 CoE weight patches on normal
mods survive — apply_pools keeps the normal pool verbatim). Re-parsing from source caught all 32 `<br>`
boundaries, more than a display-side regex heuristic (~21) would have. Display-only; no probability impact.

## Budget-constrained alternatives + cost distribution (2026-07-17)

**`planCostCdf` (cost.ts) — P(finish within budget), not just the mean.** Same restart-on-first-failure
model as `planExpectedCost`, solved for its distribution instead of its expectation:

    g(x) = S_n·1[C ≤ x] + Σ_k S_{k-1}(1−p_k)·g(x − A_k)

Conditioning on the first attempt folds in *every* restart count implicitly — no geometric tail to
iterate (at S_n ≈ 1e-4 an explicit convolution would need ~276k terms for the same answer).

- **The quantum is chosen to divide the prices, not the budget** — the one decision that makes this
  exact. A fixed grid (h = B/G) rounds each atom by up to h and the error COMPOUNDS once per restart:
  a plan restarting B/c_min times drifts by (B/c_min)·h, which for a 200ex budget with 0.2ex chaos orbs
  at G=4096 is a **~49ex drift on a 200ex budget** (bracket ≈ [0,1] — useless). Dividing the prices
  instead puts every atom on a cell boundary: nothing to round, nothing to compound. Real sheets
  (0.2/1/1.5/15) ⇒ a 0.1 quantum ⇒ ~2000 cells for 200ex.
- **Bounds are honest, never hidden.** `exact: true` ⇒ `lower === upper`. Incommensurable prices fall
  back to a uniform grid and return a real bracket. `exactQuantum` uses an ABSOLUTE 1e-6 tolerance
  deliberately — a relative one grows with scale and by d=6 "accepts" π as 3141593/10⁶, claiming an
  exactness it hasn't earned.
- **Validated:** hand-computed closed forms (1-step ⇒ 1−2⁻ᵏ exactly; 2-step ⇒ g(3)=¼, g(4)=⅜, g(5)=7/16)
  **plus 100k-run Monte Carlo** of the same wallet at 5 budgets (`costCdf.test.ts`). simulate.ts's own
  harness checks per-step probabilities, not cost accumulation across restarts, so the MC is new — it
  reuses that module's deterministic `mulberry32` so the check can't go flaky.

**`alternatives.ts` — the (closeness ↔ P(in budget)) Pareto frontier.** Relax per slot (tier slide,
same-family swap, or drop; ≤1 slot swapped-or-dropped; pinned and fractured slots frozen), rank
lexicographically (dropped ↑, swapped ↑, value-retained ↓ — constant-free, so no arbitrary "one tier
step = X% of a mod" exchange rate).

- **Tag-similarity swaps rejected on evidence, not taste.** Tag-Jaccard over 0.5.0 scores
  "#% increased Light Radius" at **1.00** against "+# to maximum Mana" — both carry exactly
  `['resource','mana']`. The bad row would rank *first* (it's cheap). Same-family siblings are a
  declared exclusion group, not an inferred similarity. Revisit only via `tiers[].stats`
  (`base_maximum_mana` vs `mana_regeneration_rate_+%`), which covers 77% of tiers.
- **Useless swaps need no special case.** All 5 `WeaponDamageTypePrefix` siblings share weight 2550, so
  Fire→Cold lands the same P at worse closeness ⇒ dominated ⇒ off the frontier automatically. Whereas
  `IncreaseSocketedGemLevel` runs 500 ("all Spell Skills") vs 2600 ("Fire Spell Skills") — a 5.2× swing
  that surfaces on its own merits.
- **Exploration is decoupled from output order** (regression-tested). The dominance rule only needs the
  evaluated set sorted by closeness at the *end*. Letting visit order = closeness order starves the edit
  classes: every tier relaxation is closer than any swap, and a 3-mod Wand target already has 4×11×8 =
  352 tier combos, so a global best-first walk never reaches a swap. Observed: a 30ex budget reported
  "20.8% is your best" while dropping one mod sat at ~99%. Now each edit class explores its own tier
  lattice on its own node budget (half to your exact item's neighbourhood, half shared), anchored at its
  loosest node. Same target now reads 0.1% (exact) → 98.4% (drop Spell Damage, T2/T3 rest).
- **Caps are reported, never silent:** `nodesEvaluated`, `truncated` (node cap only — stopping on a
  P≈1 find is a proof, not a truncation), `currencyDepth` (coarsest any node fell back to).
- *Known limits:* the shipped sheet's 0.002 transmute forces a 0.002 quantum, so budgets past ~400ex
  exceed `DEFAULT_COST_CELLS` and return a bracket (`exact: false`) rather than a point. `truncated` is
  the norm for 3+ mod targets at 200 nodes — the frontier's ends are solid, its middle is sampled.
  A missing price key costs 0 (`stepCost`), which under the CDF reads as *certainty* — a caller hazard
  kept as-is because existing tests deliberately use sparse sheets to make omens free.

## Desecrated mods surfaced on the item + Omen of Light (2026-07-17)

Desecrated mods were invisible to the UI though the engine fully models them. The facade never set
`ItemState.desecrated` nor surfaced the desecrated pool, so two mechanics were unreachable:

- **Slot occupancy** — a desecrated mod eats a prefix/suffix slot and claims a family exactly like any
  other mod, which shifts every other currency's odds. This needed **no new code**: the engine's
  family-exclusion + slot-count math already handles it the moment the mod is on the item.
- **Omen of Light** — a targeted annul. `annulProbability(..., {omen:'light'})` already returns **1**
  when `item.desecrated === true` and the target's `source === 'desecrated'`; it was just never wired.

(This first pass modelled desecrated mods only as slot occupants + the Light lever. Targeting/crafting
a specific desecrated mod was added next — see "Crafting desecrated mods" below.)

Changes (facade + UI + one validator tweak; engine untouched):
- `buildItemState` sets `desecrated: true` whenever a placed mod is desecrated (gates Omen of Light).
- `listDesecrated(baseId)` surfaces the pool (source 'desecrated', single-tier), kept OUT of `listMods`
  (from-white) and `listPerfectEssences` — you can only MODEL one on an item you already hold.
- `currencyActions` offers **Annulment + Omen of Light** (P=1) beside the plain random annul (1/N) when
  the sacrifice is a desecrated mod on a desecrated item — verified 100% @ 11.5ex vs 50% @ 1.5ex on a
  2-mod Wand.
- `validateFromItemTarget` accepts a desecrated mod as a target **only if it's already on the start
  item** (the planner keeps it; it can't craft one). An absent desecrated target is rejected with a
  clear message rather than silently scoring 0.
- UI (`ItemActions`): desecrated mods are selectable in the item builder (rose "desecrated" badge),
  excluded from the quick-check "mod to add" (no currency adds them), and a hint explains the Light
  lever. Currency cards key by label (Annulment now appears twice).

Tests: 5 facade (0.5.0) + 2 optimizer synthetic (keep-present, reject-absent). **591 tests + 1 todo,
type-check + build green; differential fixtures untouched.**

DEFERRED (Stage 2): teach `optimizeFromItem` to use Omen of Light to remove a desecrated JUNK mod for
certain (a real cost↔certainty lever on the frontier) — engine-ready, just needs the optimizer to emit
the annul-with-light variant. Today a desecrated junk mod is removed by a random annul in a plan.

## Crafting desecrated mods (choose + target them) (2026-07-17)

Desecrated mods are unique modifiers obtainable only by the Desecration mechanic, so they're now
first-class *targets*: you can choose one and the planner crafts it, from an item OR from white.

**Weight approximation — count-uniform via boss omen (decided; the honest option).** Every desecrated
mod in 0.5.0 is a placeholder (weight 1, ilvl 65) carrying exactly ONE boss tag (kurgal/amanamu/ulaman,
split 164/175/188). To target a specific desecrated mod you Desecrate with its boss omen
(Blackblooded/Liege/Sovereign), and the engine's existing `desecrationBossProbability` scores it
**count-uniform: P = 1/N** over that boss's slot pool (N = 1–8 per base, so genuinely craftable). No
weight is read or invented — a guessed weight scale would poison every number downstream, and mixing
real normal weights (100s) with placeholder desecrated 1s in the combined pool makes desecrated mods
un-hittable anyway. `desecrationOmenForMod(mod)` is the tag→omen inverse the optimizer uses.

**The "Ancient" omen (min mod level 40) is NOT wired — and that's honest, not lazy.** Per the user, an
Ancient omen sets a minimum modifier level of 40 on the desecration, pruning *normal* tiers below ilvl
40 from the roll. It does nothing to desecrated mods (all ilvl 65 ≥ 40), and our targeting route uses
the boss omen — which already excludes normal mods entirely — so the Ancient floor changes *none* of
the odds we compute for a desecrated target on this data. A live toggle that alters no number would be
misleading; revisit when desecrated mods carry real per-mod ilvls / weights and the combined-pool roll
is modelled.

**Engine:** the `desecrate` plan step now enforces legality at the plan layer (RARE item, open slot,
free family) — the boss-omen primitive is count-uniform and gates none of these (it mirrors Java's
narrow model), so `stepProbability` guards them like the perfect-essence case. `desecrationOmenForMod`
added + exported. No differential fixture touched (the primitives are unchanged; guards live in the
plan layer, which the desecration differential doesn't exercise).

**Optimizer — both flows:**
- `optimizeFromItem`: a desecrated *missing* target becomes a `desecrate` step (its boss omen) into an
  open slot — like an exalt but from the desecrated pool, removing nothing. Verified on a real Wand:
  keep a prefix, add a desecrated suffix → `annul(junk) → desecrate+liege` at 16.7% = ½ · ⅓.
- `optimizePareto` (from white): a desecrated target is added by a `desecrate` step AFTER the add-chain
  reaches Rare (the regal). `buildParetoSteps` emits it; orderings that desecrate before Rare score 0
  and drop. Alchemy opener disabled when a desecrated target is present. Honest limitation: with fewer
  than 3 rollable mods the add-chain never reaches Rare, so the frontier is empty (the UI hints this).
  `validateTargetShape` gained an `allowDesecrated` flag so the older add-chain-only planners
  (`optimizePlan`/`optimizeCost`, whose `buildSteps` can't desecrate) still reject desecrated targets.

**Facade + UI:** `listDesecrated` mods are now selectable targets in both EngineLab (Plan from scratch,
rose "desec" badge + a hint that from-white needs ≥3 rollables) and ItemActions (Full plan target,
"· Desecrated" option). `mapFrontier` renders the step as "Desecration + Omen of the Sovereign".

**Validated:** engine 97 (plan/desecration) + optimizer synthetic (from-item ½·1 hand-computed, from-
white regal-then-desecrate ordering, no-boss-omen reject, unreachable-Rare empty) + 3 facade (0.5.0:
from-item craft, from-white craft, step label). **595 tests + 1 todo, type-check + build green;
differential fixtures untouched.** No `weights_overrides.json` entry: the model reads no weights, so an
override would falsely imply the placeholder 1s matter — this note is the record instead.

## From-item MDP: the true expected cost + optimal-policy graph (2026-08-08)

The linear from-item planner's cost model assumes **restart-to-your-item, free** on any miss — two
fictions: (1) reproducing an expensive item isn't free, and (2) a real annul removes a UNIFORMLY-RANDOM
mod, so a miss leaves you in a WORSE state you recover from in place, not a teleport back to the start.
`markovFromItem` (packages/optimizer) models the actual process as a **Markov Decision Process** and
solves it for the minimum expected cost + optimal policy.

- **State abstraction** (tractability): track only `(target mods present, #junk prefixes, #junk suffixes)`
  — ~2^|target|×slots ≈ a few hundred states — with every transition probability read from the pool
  weights the engine already computes. `optimizeItemMarkov` reads NO weights the engine doesn't already.
- **Push-forward, no restart** (user's call): the policy digs out of a bricked state. It discovers real
  tactics — e.g. a Sinistral/Dextral annul to strip junk from ONE side without risking the target mods on
  the other — that the fixed-sequence linear model can't express.
- **Solver:** standard stochastic-shortest-path value iteration, **0-initialised** and climbing to the
  fixed point. (An ∞-init + "skip any action with an ∞ outcome" scheme DEADLOCKS on the recovery cycles
  — `{both targets + junk}` ↔ `{one target + junk}` each need the other finite first — so neither ever
  bootstraps. Every target is gettable by the time VI runs, so the goal is reachable from every state and
  VI converges.) Each action solves its own self-loop via `÷(1 − pStay)`.
- **v1 scope:** rollable normal targets; exalt / annul / (sinistral|dextral) annul / chaos at base orb.
  Documented approximations: junk families assumed distinct from target families (junk never blocks a
  target's family in the denominator); a below-tier target roll is treated as generic junk. Perfect-
  essence / desecrate / essence targets and orb-strength / add-side omens stay on the linear planner
  (`optimizeItemMarkov` returns `applicable:false`; the UI falls back to the frontier).
- **Validated:** hand-computed cases (already-target 0; empty→one exalt; a recovery E=2 pinning VI +
  self-loop; infeasible/ungettable; non-rollable rejected) + a **100k-run Monte-Carlo** that plays the
  policy and matches V (synthetic tight; real Wands within 3%). This is the honest fidelity check the old
  cost MC couldn't be — that one validated the restart approximation against itself.
- **Result:** on a real keep-Mana / swap-Int→Spell-Damage craft the MDP reads **~26ex** vs the linear
  model's optimistic **~9.5ex** cheapest — the free-restart correction, quantified.
- **UI:** the "I have an item → Full plan" flow now leads with the MDP's true expected cost + a
  `PolicyGraph` (inline SVG): each square is an item state laid out left→right by distance to the target,
  solid arrows are progress, dashed amber arrows are the **bricks** (a bad roll sending you back a step).
  The linear frontier stays below as the per-plan view. Component tests render the graph from real MDP
  output. **621 tests + 1 todo, type-check + build green; differential fixtures untouched.**

## From-item MDP v2: family-aware tiered states + orb-strength / side-exalt levers (2026-08-09)

Two refinements over the v1 MDP, chosen together because they compose into the real endgame decision —
"cheap base exalt that might roll below-tier and block the family, vs. an expensive Perfect Exalt that
lands high-tier." The state key grew `present:jp:js` → **`present:blocked:jp:js`**.

- **v2a — family-aware tiered states.** Each target is now `absent | present (at ≥ its tier) | BLOCKED`.
  A **blocked** target is one whose family is occupied by an off-tier roll (the mod landed below its
  wanted tier): the family is taken but the goal is unmet, so you must annul the off-tier mod before
  re-adding. The add-distribution splits a family's weight into success (→ present), below-tier
  (→ blocked), and foreign junk (→ jp/js); junk is now *provably* only ever non-target-family weight, so
  it can never silently block a target — the blocked bits carry every family collision that matters. The
  START item is classified the same way (a target already on the item but at too low a tier starts
  BLOCKED, not satisfied). **Reduces exactly to v1 when every target is untiered** (no below-tier band).
- **v2b — richer action set.** Exalted Orb at **base / Greater / Perfect** strength (ilvl floor 0 / 35 /
  50 — a Perfect Exalt can't roll the low tiers, so it *skips the off-tier trap* v2a introduced), and
  **side-constrained exalts** (Omen of Sinistral/Dextral Exaltation = add a prefix / suffix only, so the
  policy can avoid rolling junk on a side it doesn't need). Strengths/side-omens are offered **only when
  the price sheet lists them** — a missing price can't mint a free super-orb. `mcActionCosts(prices)` is
  the single source of per-action pricing, shared by the solver and the MC validator.
- **Validated:** the v1 cases still pass, plus new hand-computed ones — an off-tier recovery **E = 3**
  (below-tier hit blocks the family → annul → retry, pinning the blocked-state + self-loop math); a
  **Perfect Exalt chosen to skip the trap** when priced at 2.5 (and correctly *not* chosen at the real
  20ex, falling back to base-exalt-and-recover, E = 3); a **Sinistral Exaltation** chosen to add a prefix
  when the suffix pool is all junk (E = 4). A new **100k-run MC** on a *tiered* real-Wands target
  (Spell Damage ≥ ilvl-60 tier) plays the full v2 action set and matches V within 3%.
- **Real-data readout (Wands, ilvl 82):** untiered keep-Mana/swap-Int→Spell reads **25.9ex** (≈ the v1
  ~26ex — reduces-to-v1, a hair cheaper now that the levers exist); demanding Spell at a **top-3 tier**
  jumps to **137ex** with off-tier states on the graph, and the **single best tier** to **800ex** —
  the honest cost of a specific-tier target that v1 structurally under-counted.
- **UI:** `EnginePolicyNode` gained `blocked[]`; the `PolicyGraph` shows off-tier squares ("N off-tier")
  and names them in the hover tooltip; brick edges now cover both a miss AND a below-tier roll. New
  action labels (Exalt (Perfect), Exalt (Sinistral), …) surface in the graph so the user SEES the policy
  buy a Perfect Exalt. A component test renders the off-tier states from real MDP output.
- **626 tests + 1 todo, type-check + build green; differential fixtures untouched.**

DEFERRED (MDP v3): Omen of Whittling (a Chaos omen that changes the lowest-TIER mod) — needs the
mod-tier ordering the state abstraction discards; extend beyond rollable targets (essence/desecrate as MDP actions); a from-white
MDP (its restart-to-white is already a defensible near-optimal strategy, so lower priority). (Omen of
Homogenising Exaltation was a candidate but has been REMOVED from the game — see docs/CHANGELOG.md — so it is
not a v3 item.)

## MDP v3a — Desecration, Omen of Light and Perfect Essence as MDP actions (2026-08-21)

Took the second of the three v3 items above: the MDP now covers **desecrated** and **perfect-essence**
targets instead of handing them to the linear planner, so the honest push-forward cost model applies to
them too. Whittling stays deferred (see below).

**Preparatory split** (behaviour-neutral, its own commit): `markovFromItem.ts` (456 lines) became
`markovState.ts` (what a state IS: the present/blocked/junk abstraction, `StateKey` encode/decode, slot
accounting, lattice enumeration, `classifyStart`), `markovActions.ts` (what you can DO: `McAction`,
`actionCostOf`, the distribution builders, price-gated assembly) and `markovFromItem.ts` (orchestration:
resolve targets, value-iterate, walk the policy into a graph). `markovFromItem.ts` keeps the public
surface and re-exports the action types, so every caller and test imports exactly as before — the same
pattern used when `engine.ts` was split. All 13 MDP tests passed **unedited**, which was the oracle.

**State:** one new axis, `desJunk` ∈ {none, prefix, suffix} — where the item's single unwanted
desecrated mod sits. A desecrated *target* is already in the present/blocked masks, so the axis only
records the miss. It's gated by `desecratable`, true only when a desecrated mod is genuinely in play, so
a craft that never touches desecration enumerates exactly the state space it did before (verified on
real Wands: **95 policy states either way**; 239 with desecration in play, solving in 82 ms).

**D8 — how a Desecration splits across sides (new ruling; previously unmodelled).** The engine's
`desecrationBossProbability` returns `1/N` counting only that boss's mods **on the added mod's own
slot** (see D3). That's well-defined for the linear planner, which only ever asks "P that *this* mod
lands", but an MDP needs a distribution summing to 1, which forces the question the port never answered.
On Wands + Blackblooded the pool is 1 prefix / 2 suffixes, so a prefix target reads 1/1 = **100%**
per-slot but 1/3 = **33%** if the draw spans both sides — the same craft, 3× apart. **Ruling (user):
model both.** An unconstrained boss desecration draws across BOTH sides of that boss's pool; a
Sinistral/Dextral **Necromancy** omen narrows it to one side and thereby recovers exactly the engine's
`1/N`. So the existing per-slot number is the *side-omen* case, not the unconstrained one. Candidates
whose family is already on the item, or whose side is full, are dropped from the draw rather than
wasting it — the same way `poolTotalWeight` excludes occupied families from a normal add.
→ **RESOLVED 2026-08-21** (see "Both planners honour D8" below): the linear planner was taking the
constrained `1/N` without paying for a Necromancy omen. It now dispatches on the omen like the MDP.

**Omen of Light** is now an MDP action too: it removes the item's desecrated mod outright (P=1) instead
of rolling the uniform 1/N. Without it the model would overstate the cost of every desecrate-based plan,
since the real recovery from a bricked desecration wouldn't exist. Offered only when priced.

**Perfect Essence** reuses machinery rather than adding math: its removal half is *exactly* the uniform
draw `removeOutcomes` already computes (`perfectEssenceProbability`'s `1/(pf+sf)`, `1/pf`, `1/sf`
branches are the same formulas), and its add half is deterministic. Empty item ⇒ no removal, P=1 add,
matching `plan.ts`. Sinistral/Dextral **Crystallisation** omens constrain which mod gets eaten.
*Side-slot legality:* the add only fits if the target's side has room; when that side is full the add
depends on the removal landing there, guaranteed only under a matching omen — so in the ambiguous case
the action simply isn't offered rather than inventing a rule.
→ **RESOLVED 2026-08-21** (see below): `plan.ts`'s `'perfect-essence'` branch checked rarity and family
but NOT the target-side slot count, unlike its `'desecrate'` branch. Now fixed.

**Regular essences stay out, structurally.** `essenceForcedProbability` requires a **Magic** item and
this planner starts from the Rare you already hold; there is no legal Rare→Magic transition, so there is
no sequence in which a from-item MDP could use one. They keep falling back to the from-white linear
planner, now with a reason that says *why* rather than the old generic "not rollable".

**Bug found while building it:** `addOutcomes` counted a desecrated target's own tier weight in the
numerator although it is absent from `poolTotalWeight`'s denominator — an Exalt could conjure a
desecrated mod and the distribution wouldn't sum to 1. Adds are now restricted to normal-pool mods.
A second one was caught by its own test: `distanceToGoal` ignored the new axis, so a desecrate miss
didn't register as a regression (no brick arrow). Desecrated junk now counts toward distance, rides on
`PolicyNode`, and the graph labels it separately from ordinary junk since it also blocks re-desecrating.

**Validation** — 11 hand-computed cases in `markovEssenceDesecrate.test.ts` (analytic first; these are
small enough to pin exactly, so no MC was needed): unconstrained draw **E = 3**, Necromancy omen
**E = 1.5** and taken, the same omen priced dear **declined** at E = 3, Light **E = 1.3** and preferred
over both random and side annuls, Light absent when unpriced, Crystallisation-certain essence
**E = 15**, the raw essence's uniform ½ split pinned edge-by-edge with only the junk-eating branch
reaching goal, the full-side essence declined without an omen and offered with one, plus four reject
cases. Real data: Wands + desecrated Spell-AoE suffix ⇒ **33.58ex**, policy buys Liege + Dextral;
Wands + Perfect Essence of the Abyss ⇒ **25.00ex**, policy buys Dextral Crystallisation to eat the
unwanted Intelligence.

**UI:** `optimizeItemMarkov` no longer refuses desecrated/perfect-essence targets (only regular
essences); `EnginePolicyNode` gained `desecratedJunk`; the graph labels "+1 desecrated" and the new
actions ("Desecrate (Omen of the Liege, Dextral)", "Perfect Essence (Sinistral)", "Annul (Omen of
Light)"). **640 tests + 1 todo, type-check + build green; differential fixtures untouched.**

## Both planners honour D8, and a perfect-essence slot bug (2026-08-21)

The two follow-ups left open by v3a, both wrong numbers users could see.

**The linear planner now honours D8.** `plan.ts`'s `'desecrate'` branch called
`desecrationBossProbability` whenever a boss omen was set — the per-slot `1/N`, i.e. the
*side-constrained* odds — and ignored `constrainTo` entirely, while `cost.ts` charged only the boss
omen. So a desecrate craft got side-locked odds for free. Now: with `constrainTo` it uses the per-slot
figure (and 0 if the omen points at the wrong side); without it, the new
`desecrationBossAnySideProbability` — count-uniform across BOTH sides of that boss's pool, filtered to
candidates that are actually legal (family free, side not full). The filtering is required rather than
a nicety: `markovActions.ts`'s `desecrateOutcomes` already filters this way, so an unfiltered
denominator would put the two planners back into disagreement, which is what D8 existed to settle.

`desecrationBossProbability` and its **frozen Java fixture are untouched** — under D8 that function
*is* the side-constrained case, so the anchor keeps its meaning and every existing assertion passes
unedited. The new path is a sibling, and is not differential-tested because Java models no
unconstrained desecration to compare against.

Two supporting changes: `cost.ts`'s `stepOmenId` became `stepOmenIds` (a list) because a Desecration
can now invoke two omens at once — a boss omen *and* a Necromancy side omen — which single-omen
pricing could not express; and `withOmenVariants` fans out boss-desecrate steps so the planner
explores "pay for the side-lock vs take the wider draw" and `paretoFrontier` picks, exactly as every
other omen lever works here.

*Real-data impact* (Wands ilvl 82, keep Mana + craft the desecrated Spell-AoE suffix): the cheapest
plan goes **16.50ex → 28.50ex**, against the MDP's 33.58ex for the same craft — the linear model stays
optimistic by design (free restart) but no longer by an extra 73% from unpaid omens. Tests pin both
regimes on a synthetic base whose boss pool spans both sides: with a dear omen the wide draw (P=½,
E=6) and the lock (P=1, E=8) are both non-dominated; with a cheap one the lock strictly dominates and
the frontier collapses to it. Engine-level cases pin 1/10 unconstrained vs 1/4 and 1/6 constrained on
real Amulets data, plus an occupied family shrinking the denominator to 1/9.

**Perfect essence could add to a full side.** `stepProbability`'s `'perfect-essence'` branch checked
rarity and family but never whether the *added* mod's side had room. The essence removes before it
adds, so the removal only makes room if it came off the add's own side — eating a suffix does nothing
for a third prefix. It scored adding a 4th prefix to a 3-prefix item as a normal `1/(pf+sf)`. Now
rejects when the add's side is still full once `step.remove` is gone; two tests pin that the guard
rejects only the illegal case (sacrifice the suffix ⇒ 0) and not the legal twin (sacrifice a prefix ⇒
1/4). While there, the `'desecrate'` branch's hardcoded `>= 3` literals became the canonical
`prefixesFull`/`suffixesFull`.

**647 tests + 1 todo, type-check + build green; differential fixtures untouched.**

## MDP solver performance: the lattice is now compiled to typed arrays (2026-08-21)

Went looking for whether Whittling was tractable and found something worse: **the solver was already
unusable on large targets in shipped code.** Real 0.5.0 Wands, value iteration to default tolerance:
n=3 342ms, n=4 860ms, n=5 2.9s, **n=6 over 100 seconds**. A six-mod target was a minute-plus wait.

**Cause: the representation, not the algorithm.** Every hot operation in the VI loop was a
string-keyed `Map` lookup (`actionCache.get`, `dist.get`, `V.get`/`V.set`) against keys like
`"63:0:0:0:0"`. At n=6 that is ~2,915 states × ~15 actions × ~8 outcomes × ~10,000 sweeps ≈ **3.5
billion string hashes**, and ~15ns each accounts for the entire runtime. The loop was doing
arithmetic through a hash table.

**Fix:** compile the lattice once into integer indices and typed arrays — `V` as a `Float64Array`,
each action as `{cost, selfProb, to: Int32Array, prob: Float64Array}` with the self-loop hoisted out
and divided through as before. Entry order is preserved exactly as the `Map`s iterated, so the
floating-point sums — and therefore every expected cost — are **bit-identical**. `markovState.ts` and
`markovActions.ts` are untouched; the numeric form is an implementation detail of the solver.

| n | states | before | after |
|---|---|---|---|
| 3 | 239 | 342 ms | **114 ms** |
| 4 | 575 | 860 ms | **181 ms** |
| 5 | 1,295 | 2.86 s | **430 ms** |
| 6 | 2,915 | >100 s | **~13 s** |

(The "51s" figure that circulated for n=6 was capped at 10k sweeps and had *not* converged — it read
E=827.2976 against the true E=827.302627.)

**Two hypotheses tested and rejected — recorded because both were plausible:**

1. **Loosening the tolerance.** The 1e-9 tolerance is absolute, and E≈827 needs ~1e-12 relative, so
   this looked like the obvious lever. Measured at n=6: `1e-5` → 50 s (0.0004% error), `1e-3` → 29 s
   (0.1%), `1e-2` → 20 s (1%), `1e-1` → 11 s (**10%** error). It buys nothing until the answer is
   visibly wrong. The contraction factor is genuinely near 1 — a property of the long recovery cycles
   this model exists to capture.
2. **Sweeping in distance-to-goal order.** This is Gauss-Seidel (V is written in place), so a
   goal-outward order should propagate values faster than the bitmask order `enumerateStates` emits.
   Implemented and measured: **no effect** — within the ~15% run-to-run noise. Reverted. The reason is
   structural: the transition graph has strong cycles (brick → recover), so there is no topological
   order to exploit and values must circulate regardless of where a sweep starts.

   **Re-tested 2026-08-24 against a deterministic metric**, because "within the noise" is an invitation
   to try it a third time. Wall time cannot resolve a 10% effect under ~40% spread, but SWEEPS TO
   CONVERGENCE is exact — it depends only on the order, not the machine. From-white Wand, `restartCost: 0`:

   | targets | phase | enumeration | goal-first | goal-LAST |
   |---|---|---|---|---|
   | 2 | A / B | 170 / 3,156 | 169 / **2,923** | 162 / 3,142 |
   | 3 | A / B | 783 / 4,417 | 782 / **3,925** | 716 / 4,349 |
   | 4 | A / B | 1,225 / 24,838 | 1,225 / **21,605** | 1,147 / 24,298 |

   So goal-first is real but small: **7–13% fewer phase-B sweeps**, growing with target count. It does
   not survive the trip to wall time. Phase A is the clean control — the two orders need the SAME sweep
   count there (1,225 both, at n=4), so any time difference is pure memory-access cost, and at n=3 the
   permuted order measured **15% slower per sweep** (0.345 vs 0.299 ms) for visiting `compiled[]` and
   `V[]` out of allocation order. Net at n=3: ~10% slower. Net at n=4, where the cache penalty happens
   to vanish: ~11% faster. An effect whose SIGN depends on the craft is not a speedup.

   The reverse-order control is what actually kills the theory. If values really propagated backward
   from the goal, goal-LAST would be catastrophic — instead it is within 2% of enumeration order, and
   *better* than either in phase A. Values here circulate around cycles; they do not flow down a DAG.

   Also measured and rejected the same day: **the free restart is a zero-cost self-loop at the start
   state** (`restart.dist` is `{startKey: 1}`, cost 0), which is exactly the condition that breaks SSP
   contraction — a tempting explanation for phase B needing 20x phase A's sweeps. Excluding that one
   action changes the sweep count by **zero** (4,417 and 24,838, identical). It never fires: it ties
   `V(start)` rather than beating it, and `bestAction` breaks ties with a strict `<`.

   What remains true is the n=6 conclusion below: closing this gap needs a different algorithm
   (policy iteration), not a better sweep order.

3. **A free lower bound extrapolated from the residual's own decay** (2026-08-24). VI's residual
   shrinks geometrically, so two samples should give a rate and the remaining descent a closed form —
   a range instead of a bare ceiling, for no extra sweeps. Rejected: the decay rate is not constant,
   it creeps toward 1 as the solve grinds (per-sweep 9.60e-6 → 8.14e-6 between 40k and 98k sweeps on a
   6xT1 body armour), so a geometric fit systematically UNDERSTATES what is left to fall. Measured on
   a 4-target Wand truncated at 5,000 sweeps: the projected range was [695.87, 1193.70] against a true
   425.43 — it missed low, which in a lower bound is the direction that misinforms. Extrapolating the
   max residual `delta` instead of V(start) is worse still: it is a max over the whole lattice, so it
   claims a descent the displayed figure never makes (3-target Wand at 3,000 sweeps, ceiling 2% high,
   projection 17% low). A real lower bound needs a real climbing solve; there is no free version.

**What this unblocks.** Whittling was previously projected as viable only at n≤2. With the solver
7× faster and the cheaper *junk-only* banding (targets largely reuse the `present`/`blocked` bit they
already carry; only junk needs a new tier band), the projection is now ~0.7 s at n=3, ~1 s at n=4 and
~2 s at n=5 — so the endgame case that motivates the omen (five mods already good, spend it fixing the
last one) becomes reachable. **n=6 remains impractical** at ~57 s projected; getting there would need
a different algorithm (policy iteration), which is not attempted here.

NOT DOING (MDP v3b): **Omen of Whittling** — evaluated 2026-08-21 and **dropped by the user**, not
merely deferred. Recorded here so it isn't re-proposed.

It is a **Chaos** omen: the orb changes the item's **lowest-tier** modifier instead of a
uniformly-random one, where "tier" is the per-mod T-number (T5 is lower than T1), **not** the mod's
ilvl, and ties resolve uniformly with fractured mods excluded (all confirmed by the user). Junk
carries no tier information at all (just a count) and present targets only know "≥ wanted tier", so
which mod is lowest isn't answerable from the current state — this is the only v3 item that needs a
state-abstraction change rather than new actions.

Why it was dropped rather than built: the tractable version bands the tier rank into coarse windows,
which costs a real approximation (within a band the omen can't tell two mods apart, so ties resolve
uniformly when the truth is deterministic) on top of a state-space multiplier. Even after the 7×
solver speedup above it projects to ~2 s at n=5 and ~57 s at n=6, so the full six-target craft stays
out of reach. And `OmenofWhittling` is **not** in `data/patches/*/prices.json`, so under the "only
offer what's priced" rule the whole feature would ship dormant regardless. The cost/benefit didn't
land. If it is ever revisited, the junk-only banding sketch (targets reuse the `present`/`blocked`
bit they already carry; only junk needs a new tier band) is the cheapest known design, and the
mechanic assumptions above should be re-confirmed against the game first.

Still genuinely deferred (not dropped): a from-white MDP; policy iteration, if n=6 ever needs to be
practical.

## D9 — multi-family mods: exclusion groups beyond the first were being dropped (2026-08-21)

Auditing the long-parked "baselined data findings" dissolved most of them and uncovered a real bug
underneath.

**What the old findings actually were.** The shipped `0.5.0` has **zero** type/pool mis-slots — every
remaining one is in `0.5`, which no user ever loads (`src/lib/engine.ts` imports `0.5.0` only) and
which exists solely as the differential anchor. "Fixing" those would *break* the anchor, since the
frozen `__fixtures__/*-java.json` were generated from that very data. **Closed as won't-fix, by
design.** Of the 10 baselined `0.5.0` mixed families, 8 are legitimate (a desecrated mod and a
perfect-essence mod sharing a stat family on opposite sides).

**The bug.** poe2db gives some mods several exclusion groups:

```
Amanamu's (prefix) → ModFamilyList: ["CompanionDamage"]
of Ulaman (suffix) → ModFamilyList: ["CompanionDamage", "IncreasedAttackSpeed"]
```

`tools/refresh/poe2db.mjs:47` kept `ModFamilyList[0]` and dropped the rest (line 48 already parsed the
full list; nothing consumed it). Since `family` **is** the exclusion group, every dropped entry was a
lost exclusion — **109 shipped desecrated mods**, 93 of them two-attribute rolls (`+Str +Int` and
friends). The engine would happily place a pure Intelligence mod beside a Str/Int desecrated mod —
illegal in game — and, worse for the numbers, kept counting Intelligence mods as still-available in
every add denominator.

**Measured impact** (real 0.5.0, ilvl 82): on **62 of 109** the denominator genuinely moved —
**median 3.47%, max 8.76%** too large. So P(any specific target) was understated by that much whenever
one of these mods sat on the item. Well outside a project that cross-checks *exact* against Craft of
Exile, and the legality error is a wrong answer rather than a skewed one.

**The fix, in three parts.**
1. *Centralise first* (its own commit, behaviour-neutral). Exclusion was hand-rolled at a dozen sites,
   each doing `occupied.has(mod.family)`. All of them now go through `familiesOf(mod)` / `excluded(mod,
   occupied)` in `pool.ts`, plus `modFamilies()` for the UI. Every mod still had one family at that
   point, so all 647 tests passed **unedited** — the oracle that the change moved code, not semantics.
2. *Widen the model.* `Mod.families?` carries the full set; `family` stays the primary because it keys
   the poe2db weight join (`apply_weights.mjs` joins on `"type:family:ilvl"`) and labels the mod in the
   UI. Emitted only when there IS more than one, so the data diff is 109 mods rather than all 2140, and
   the legacy single-`family` shape still loads untouched — `0.5` is byte-for-byte unchanged.
3. *Emit it.* `apply_pools.mjs` writes `families` on both the desecrated and essence paths;
   `refresh.mjs:139` had the identical `groups[0]` truncation and is hardened too, though **no shipped
   normal mod is affected** — RePoE's 58 multi-group mods are all Unique/Map/Crafted. Regenerated from
   the local poe2db cache, so offline and reproducible.

**Deliberately NOT widened:** `alternatives.ts`'s `siblingsOf` still matches on the primary family
only. That is a *similarity* test, not an exclusion test — matching any shared family would make a
multi-family mod a "near-miss" swap for every mod in each of its groups, which isn't what the user
asked to approximate.

**Validation.** New `multiFamily.test.ts` (11 cases): a spanning mod occupies all its groups, is
blocked by *either*, blocks both single-family mods, and shrinks the denominator to 0 in the synthetic
case where the old behaviour left 20 — plus real-data assertions and a check that `0.5`'s legacy shape
still resolves to exactly one group. **Verified by reverting the fix: 6 of the 11 fail without it.** A
new data-integrity invariant pins `families[0] === family` and rejects redundant 1-entry arrays.
**660 tests + 1 todo, type-check + build green; differential fixtures untouched.**

→ **CONFIRMED (same day):** the CoE cross-check was re-run after the change — `coe-verify.mts` reports
**MATCH on prefixes and suffixes for Rings, Body_Armours_int and Quivers**, and
`coe-newpools-check.mts` passes all structural checks (boss-tag counts 175/188/164, every desecrated
mod positively weighted, every perfect-essence mod single-tier and deterministic). So the normal-pool
numbers are unmoved, as predicted — the affected mods are desecrated and don't enter those pools. The
prediction is now measured rather than reasoned.

## Desecration, essences and convergence — five mechanic changes (2026-08-22 → 08-23)

Recorded after the fact: these shipped over two days and existed only in commit messages, which is not
where a claim about a game mechanic belongs. **Evidence quality is stated per item, because it varies
sharply** — two rest on user domain rulings and one on an outright assumption.

### 1. Boss omens are "Weapon or Jewellery" only ✅ VERIFIED (item text)

The Omens of the Sovereign / Liege / Blackblooded read *"your next **Weapon or Jewellery** Desecration
attempt will guarantee a random Ulaman/Amanamu/Kurgal modifier"*. Nothing gated on that, so both
planners offered boss-targeted desecration on ARMOUR — and **342 of the 527 shipped desecrated mods sit
on armour bases**, so roughly two thirds of desecrated crafts were planned around a step the game
refuses. On a targeted draw the planner claimed **0.25** where the real untargeted draw was **9.2e-6**.

`bossOmenAllowed` / `desecrationBoneFor` (`probability.ts`) gate it; "Weapon or Jewellery" is exactly
"not armour", i.e. the jawbone and collarbone groups. An unmapped category falls back to `rib`
(armour), deliberately: claiming a plan works when the game would refuse it is the worse failure.

**Evidence:** the in-game item text, supplied verbatim by the user. Direct and unambiguous.

### 2. Armour can desecrate — the MDP had only boss-omened actions ✅ FIXED, model per D4

Gating the omen was right; stopping there was not. Every desecrate action the MDP modelled carried a
boss omen, so on armour it had **no desecrate action at all** and reported `feasible: false` for a
craft the game performs happily — for a day, for the majority of desecrated mods.

`markovActions.ts` now offers the untargeted draw on **every** base (`desecrateAnyOutcomes`), weighted
over the combined normal ∪ desecrated pool, mirroring `desecrationProbability` so the two planners
agree — the D8 lesson. Boss variants layer on top only where legal. Two consequences beyond armour:
a player who had excluded every omen previously lost desecration on weapons too, and a desecrated mod
carrying no boss tag is now reachable rather than rejected (no such mod exists in 0.5.0; the rejection
was wrong in principle).

**Evidence:** hand-computed unit tests, plus mutation checks — restoring the old condition fails seven
tests. The *model* it uses is D4, whose denominator the user confirmed and whose **weight is an
assumption** (see D4).

### 3. One essence modifier per item — regular and perfect counted TOGETHER ✅ VERIFIED (user ruling)

> "You cannot apply a Perfect Essence after using a regular Essence on the same item. Each piece of
> equipment can only carry one essence modifier at a time." — user, 2026-08-23

Nothing enforced this. `fromItem.ts` built one `perfect-essence` op per perfect target, the MDP gave
each its own action, and `optimize.ts` capped only `source: 'essence'` — half the mods the rule covers.
All three would have planned an item the game cannot hold. `isEssenceMod` (`probability.ts`) is now the
single predicate all of them count with.

The two kinds draw from **disjoint pools** — 317 `essence` mods vs 363 `perfect_essence`, zero id
overlap — so a Perfect Essence can never supply a second regular-essence mod. (An earlier audit claimed
the opposite and was wrong; see the correction note in `docs/copy-audit.md`.)

**Evidence:** user ruling for the cap; the disjointness is measured directly from the shipped data.

### 4. Perfect essences from white, and the item-level gate that was missing ✅ FIXED

The Lab could not target a perfect-essence mod at all (`toEngineMod` filtered them out). It now can:
since every mod on a from-white item is one you asked for, the essence necessarily eats a target, so
the plan re-adds it with an Exalt and the search chooses which to sacrifice. Needs ≥3 rollable targets
to reach Rare; below that it reports a planner limit rather than an impossibility.

Found while implementing: the `perfect-essence` branch in `plan.ts` checked rarity, family and slots
but **never the item level**, though `essenceForcedProbability` gates regular essences on
`tier.ilvl > item.level`. Every perfect-essence mod is ilvl 72, so below that the planner costed a step
the game refuses. Gate added.

**Evidence:** hand-computed tests on a synthetic pool (removal probability 1/(pf+sf) unconstrained,
1/sf under a Crystallisation omen), plus a real-data smoke test. The 1/pf, 1/sf and 1/(pf+sf) formulas
themselves are the differential-tested `perfectEssenceProbability` port, unchanged.

### 5. Value iteration can fail to converge, and now says so ✅ FIXED

VI bails at `maxIters`, and because it 0-initialises and climbs, the value it returns then is a strict
**lower bound** — not an estimate. Nothing recorded that: `expectedCost` came back looking like an
answer and the UI printed **8,219,067 ex**, precise to the exalt and not converged. Found by
instrumenting the progress stream — 100,001 solve reports on an armour desecration, i.e. every sweep of
the cap. It also explains why loosening `tolerance` changed nothing: it never reached any tolerance.

`MarkovResult.converged` now carries through to the UI, which renders "≥ x". A rejected target reports
`converged: true` — it never ran VI, and calling that a floor would imply a number that isn't there.

The **desecrated weight change (D4) largely dissolved the trigger**: the same armour solve went from
6014ms unconverged to **159ms converged**. The reporting stays, because the condition is general — any
sufficiently long-odds craft reaches it — and `maxMillis` (the user's Search effort setting) can now
induce it deliberately.

### Not a mechanic, but it changes what users get: Search effort (2026-08-23)

Three solver caps were hard-coded: VI's sweeps, the budget search's nodes, the orb search's plans. One
user setting drives all three. Measured on 6 targets at tier display 3, Wands, ilvl 82:

| preset | orb depth | plans evaluated |
|---|---|---|
| Quick | strongest-only | 5,760 |
| **Standard** (= the old hard-coded default) | strongest-only | 5,760 |
| Thorough | base+strongest | 184,320 |
| Patient | full | 622,080 |

Worth recording because of what it exposes: **on a craft that size the default only ever searched the
strongest orbs**, and every result before this was that shallow. The budget search is ~70ms/node,
linear (100 nodes 7.0s, 200 nodes 14.1s).

---

## The from-item panel, measured against a real user report (2026-08-23)

A five-target craft was run in the live app and reported back: an unreadable policy graph, a
`267.5B div` step cost, an Exalt placed before two Annuls, and a wait "like +15 minutes". Every claim
below is reproduced in node against `data/patches/0.5.0`, not inferred.

**Both screens reproduce exactly.** Rare Wand ilvl 82 holding Chaos Damage + Cast Speed as junk;
targets Crit Spell Damage Bonus, Crit Hit Chance for Spells, Mana Regen, Spell Damage, Cold Damage.

| target tier | MDP nodes | MDP E | shown as | step frontier |
|---|---|---|---|---|
| T1 | 14 | 1.052e7 ex | 28.9K div | 1 plan |
| T2 | 262 | 5.420e6 ex | 14.9K div | 10 plans |

Both match the user's screens (they quoted "14 item states" / "262 item states" and both div figures).

### 1. The wait was a progress flood, not slow maths ✅ FIXED

Totals in node were **26s (T1) and 28s (T2)**, and `maxMillis` can only shorten that. The difference
in the browser: value iteration called `report(...)` **once per sweep**, and a non-converging craft
runs `maxIters = 100_000`, so the worker fired ~100,001 `postMessage` calls, each waking a React
re-render of the progress bar. `engine.worker.ts` licensed this in a comment — "that is fine precisely
because this is a worker: the message queue drains on the main thread, which is free". True at 100
messages; catastrophic at 100,000. The `actions` and `compile` phases were already strided; `solve`
was missed.

Fixed by emitting only when the number the UI would *display* changes (permille), which caps it at
1001 by construction. **Measured: 100,001 → 992 reports.** Pinned by asserting no two consecutive
reports carry the same value — reverting the throttle produces 2,001 duplicates out of 3,000 sweeps.

### 2. An unconverged policy graph does not reach the target ✅ FIXED (disclosure)

The graph is the closure of states reachable under whatever policy VI had arrived at when it stopped.
Stop it early and that policy is provisional. Measured at the Standard effort (15s): **14 states
spanning depths 7 down to 4, with the goal (depth 0) absent entirely.** The panel drew that as
"Optimal policy" — a dead end presented as advice, and the direct cause of "I do not understand".

The effort ladder resolves it, which is the loop the setting exists for:

| effort | MDP nodes | goal reachable | route |
|---|---|---|---|
| Standard (15s) | 14 | **no** | — |
| Thorough (60s) | 262 | yes | 6 steps |
| Patient (300s) | 262 | yes | 6 steps |

Patient is indistinguishable from Thorough here: VI hits `maxIters` (100k sweeps, ~50s) before the
time budget, so above Thorough the sweep cap binds, not the clock. The panel now says "No route to
show yet … raise Search effort" rather than drawing the dead end, and leads with the route when there
is one — `Annul → Chaos → Exalt (Dextral, Greater) → Exalt (Dextral, Perfect) → Exalt (Perfect) →
Exalt (Perfect)`, six steps in place of 262 squares.

### 3. Exalt-before-Annul is the cost model, not an ordering bug ✅ FIXED (presentation)

`transformSequences` enumerates every order and `annulProbability` returns `1/(pf+sf)`, so annulling
to zero mods is legal and **was scored** — the user's route was searched and rejected. It lost on
price: **an Annul is 158.7 ex and an Exalt is 1 ex**. Under `E = Σ c_k·S_{k-1} / S_n`, burying the
Annuls behind a 0.1% gate you rarely pass costs ~65x less. The model is right; its premise is not,
because it hands you a **free replacement of your item on every miss**.

Confirmed on the T2 frontier: plan 0 (shown first) P=1.77e-5%, plan 9 P=1.36e-4% — the annuls-first
route is **7.7x likelier** and 16.7x dearer under free-restart. It was on the frontier the whole time,
last in a list the user had no reason to scroll. `FrontierView` now takes `freeRestart`, and a held
item leads with the likeliest route, captions the cost "if restarts were free", and labels the other
end "cheapest on paper".

`267.5B div` itself is arithmetically correct: numerator ≈ 1.21 ex over `S_n ≈ 9.3e-15`. The
per-attempt figure checks out too — 5 Exalts + 2 Annuls + 4 side omens = 357 ex.

### 4. Three smaller things the same screen exposed ✅ FIXED

- **"tried every orb strength" was false.** `optimizeFromItem` hardcoded `currencyDepth: 'full'`, but
  `baseTransforms` never sets `tier` on an add — that planner only ever uses base-strength orbs. New
  `base-only` depth says so. It is part of why its costs sit so far above the MDP's, which does weigh
  Greater and Perfect Exalts.
- **The effort control was unreachable in Item mode.** It sat in EngineLab's *else* branch while
  `ItemActions` obeyed `limitsFor(effort)` — a setting binding on a tab that could not show it.
- **`357 ex` rendered as `0.98 div`.** One unit per view took its max across *different quantities*;
  units are now per column.
- **The two-cost-models note promised the wrong ordering** ("expect [the true cost] to be the higher").
  Here the step plan was ~9,000,000x higher. A step plan is one fixed sequence where every slam must
  hit a named mod, so on a long shot it reads far *above* the adaptive policy. Copy now says the two
  can differ in either direction, and why.

### Still open from this sweep

- The from-item planner does not search orb strengths at all (`base-only`). Fixing it multiplies the
  search by `3^k`; the badge tells the truth in the meantime. See TODO.
- Above Thorough the MDP's `maxIters` binds before `maxMillis`, so Patient buys nothing on crafts like
  this one. The preset hint is not wrong, but the cap is not currently a user-facing lever.

## Decomposing the two-model gap, and what the route was hiding (2026-08-23)

Follow-up to the sweep above, from the same craft (Rare Wand ilvl 82, Chaos Damage + Cast Speed junk,
five T2 targets). Three things were reported about the new route view; all three are measured.

### The step routes read in billions of divine — how much is fixable?

Scoring the annuls-first route at each orb strength, everything else held constant:

| orb strength | success / attempt | cost if restarts were free |
|---|---|---|
| base (all this planner uses) | 1.53e-10% | 428B div |
| greater | 1.38e-8% | 4.77B div |
| perfect | 1.71e-7% | 1.01B div |

So the missing orb-strength search is worth **1,116x** — real, and TODO item 2. But the MDP puts this
craft at **14.9K div**, so even a Perfect-orb step plan is still **~68,000x** out. That remainder is
not a gap to close: a step plan is one fixed sequence in which every slam must hit a **named** mod,
where the policy takes whatever lands and recovers in place. Implementing orb strength would make the
step routes less wrong without making them useful here.

Acted on accordingly: once the MDP has answered, the step routes collapse behind a disclosure that
says why they read higher. They stay open when it has not (a Magic item, an essence target), where
they are the only view there is. One predicate — `trueCostAnswered` in `ItemActions` — drives both
that and the "No true expected cost" card, so the two cannot disagree.

### The route named currencies but not mods

`Exalt (Dextral, Greater): 1 mod → 2 mods` says how many you gain and not which. Both states were
already in hand (`MainLineStep` carries `node` and `next`), so it was a diff nobody was taking. The
same craft now reads:

    1. Annul                      clears a junk mod
    2. Chaos                      clears a junk mod · most likely lands Mana Regeneration Rate
    3. Exalt (Dextral, Greater)   most likely lands Critical Spell Damage Bonus
    4. Exalt (Dextral, Perfect)   most likely lands Critical Hit Chance for Spells
    5. Exalt (Perfect)            most likely lands Spell Damage
    6. Exalt (Perfect)            most likely lands Cold Damage

**"Most likely lands", never "add".** The policy chooses the orb, never the outcome — an Exalt is a
slam. The mod named is whatever sits on the step's highest-probability edge, which is the edge the
route follows by construction. An imperative would tell the player to do something the game gives them
no way to do; the odds render beside it, which is what keeps the phrasing honest.

### The full graph repeated itself

`2 mods · 1 off-tier / Annul / 14.9K div` appeared many times in one column. Those are distinct states
— they differ in *which* mods are present — but the label discards that, so the picture showed the
same box repeatedly. Grouping by exactly what a box displays collapses **262 nodes to 79 groups**,
largest ×20, and the screen-reader list uses the same grouping so it stops being a 262-item dump.

Two rules the grouping obeys: the start and goal are never merged (folding "your item" into a ×17 box
would misreport where the player is standing), and **edges aggregate to existence, not to a
probability** — member probabilities differ, so no summed or averaged number is shown; probability
drives stroke opacity only.

### Clicking a state highlights the route through it

Requested after the grouping landed. Clicking a box lights everything that can reach it plus
everything it can reach, and dims the rest.

**Bricks are excluded from that closure, and the reason is measurable.** Regress edges make the graph
strongly connected — with them in, almost every state reaches almost every other and the "highlight"
lights the whole picture, which is the wall it exists to cut through. Restricted to progress edges
(strictly decreasing distance-to-goal), route sizes over the 80 groups of the reported craft come out:

| min | p25 | median | p75 | max |
|---|---|---|---|---|
| 6 | 11 | **16** | 26 | 80 |

So a median click highlights ~20% and dims ~80%. The max of 80 is the start state, whose descendants
are by definition the whole reachable graph.

That distribution is a fact about this craft's data, not an invariant of the code, so it is recorded
here rather than asserted in a test; the suite pins the property instead — a forked graph where
clicking into one branch must not light the other. Progress-only also makes the walk terminate without
a cycle guard, since depth strictly decreases; a test builds a brick cycle to pin that.

Clicking also opens a full description of the state, which is the part a 148x54 box cannot carry:
which target mods are held, which are stuck below tier (and that they need annulling before the mod
can be re-rolled), the junk broken down by side, and — outcome by outcome — what the recommended orb
actually does from there, with each outcome's probability and whether it is a step backwards. The
outcomes are the representative state's own edges, so they are exact for it; when the box stands for
several states the panel says so rather than implying they all behave alike.

### The free-restart total is gone from held-item cards

Reported as "i do not like the Step-by-step routes, the costs are astronomical". They were: `78.9B div`
on the collapsed button, and the same figure inside. Dividing a real per-run cost by a ~7e-13 chance
is arithmetically correct and is not a budget — nobody runs a sequence 1e14 times, they abandon it.

So on a held item the card now drops `expected` and `expectedAttempts` entirely and shows the two
figures that survive contact with reality: **chance per attempt**, and **what one run costs** (356 ex
on this craft). That pair also preserves the frontier's reason for having several rows — a plan
reaching for Perfect orbs costs more per run and lands more often, which is the whole cost↔probability
trade, expressed in numbers a player can act on. The badges shrink to `likeliest` for the same reason:
with no total on the card, "cheapest" and "best value" would be claims about a number the reader
cannot see. The collapsed button carries the route count instead of the cheapest total, so the figure
is not met without deliberately opening the section.

The from-white planner is untouched — a white base really can be replaced for free, so `expected` is
a real number there and still leads.

## The true-cost model reaches the Lab tab (2026-08-23)

`markovFromItem` required a Rare start, so the app's PRIMARY mode — craft this from a white base — had
no honest cost figure and no policy graph at all. The state was `(present, blocked, jp, js, desJunk)`
with no rarity in it, which is why a Magic item was rejected outright and a white one never considered.

### What changed

The state gained a **rarity** axis (`normal | magic | rare`) with the per-side cap that goes with it —
none, one, three — and `enumerateStates` takes the rungs a craft can occupy, defaulting to Rare alone
so every from-item craft keeps exactly the state space and solve time it had. Three add-chain actions
join the space, each with the Greater/Perfect strengths the sheet already prices: **Transmute**
(Normal→Magic), **Augment** (within Magic), **Regal** (Magic→Rare). Everything that needs a Rare item —
Exalt, Chaos, Desecration, Perfect Essence — is simply absent below Rare, which is the game's rule.

### The restart action is a correctness requirement, not a refinement

A white base costs nothing, so the real optimal strategy includes binning a bad roll. Without an action
for it the policy is trapped: once Transmuted the item is Magic and there is no way back to Normal, so
a junk roll has to be dug out with a **158.7ex Annulment** instead of discarding **0.18ex** and
rerolling. Measured on a 2-target Wand craft:

| | expected cost |
|---|---|
| no restart action | **3607 ex** |
| restart at 0 ex | **43.2 ex** |

An **83x overestimate** — the same class of error the app has already been caught making once, so the
action ships with the feature rather than after it. It is offered only when the caller says starting
over is possible: a white base yes, a specific Rare in your stash no, a carved (fractured) item no.
`WHITE_BASE_COST` in `solve.ts` names the price as an explicit 0 rather than letting an absent sheet
key silently become one.

Cross-checked the way the rest of the MDP is: 100k Monte-Carlo runs of the policy through the real
random process, matching value iteration within 3%.

### Two things the rarity axis broke, both found by running it

**`distanceToGoal` ignored rarity**, so a Magic item holding every target scored 0 — the goal's own
distance — while not being the goal. The route walk may only step to a strictly smaller distance, so it
had nowhere to go and stalled. A non-Rare state is now at least two moves out (the Regal, plus the
Annulment clearing the mod the Regal is forced to add). `engineMap` had a **second copy** of that
expression and silently disagreed the moment rarity entered it; the distance is now carried on the node
and the copy is gone.

**The route walked into dead ends.** A from-white policy scraps and restarts for most outcomes, so a
state like "rare, one target, one junk" legitimately has no forward move at all — its best action goes
backwards to the bare base. Following the likeliest forward edge walked straight in and stalled, and
the route vanished on every from-scratch craft. The walk now only steps to states the craft can
actually be finished from. On a 4-target Wand craft it produces exactly the chain a player runs:

    1. Transmute            5%  lands Mana Regeneration Rate
    2. Augment             11%  lands Spell Damage
    3. Regal                4%  lands Critical Hit Chance for Spells
    4. Exalt (Sinistral)    7%  lands Cold Damage

## Seeding value iteration, and why a free restart broke it (2026-08-23)

Reported: a 6-mod from-scratch craft whose policy graph was four boxes, **every one of them** reading
"Start over with a new base" — including a state already holding `#% increased Armour`, where the
detail panel explained the move *"loses #% increased Armour — a step backwards"*. No route, and the
goal was not in the graph at all.

**Not slowness — degeneracy.** Value iteration 0-initialises and climbs. `restart` costs about nothing
and lands on the start, so every state is worth `restartCost + V(start)`; while V is still near zero
that ties with every other action, and early sweeps pick restart everywhere. VI unpicks the tie only as
the true values separate, which on a long-shot target outlasts any budget. Measured from a white base
(Wands, real 0.5.0 data), the two models it sits between:

| targets | restart | converged | E | time |
|---|---|---|---|---|
| 3 | off | yes | 3,540 ex | 50 ms |
| 3 | 0 ex | yes | 103 ex | 263 ms |
| 5 | off | yes | 37,160 ex | 2.3 s |
| 5 | 0 ex | **no** | 435 ex | 5.7 s |
| 6 | off | yes | 176,400 ex | 12.2 s |
| 6 | 0 ex | **no** | 6,940 ex | 78.7 s |

Both columns are needed and neither is enough: without restart the answer converges but reads ~40x too
high (a white base is free, so binning a bad roll really is optimal); with restart it is right and will
not settle.

**Fix: solve it in two phases.** Phase A runs push-forward only and converges to `V0`. Phase B puts
restart back and starts from `V0` instead of from 0. `V0` is the value of a *proper* policy — one that
always reaches the goal — so `V0 >= V*`, and

    T(V0) = min( T_pushForward(V0), restartCost + V0[start] ) <= T_pushForward(V0) = V0

i.e. `V0` is excessive. Phase B therefore DESCENDS toward `V*` instead of climbing, and two things
follow. Every iterate stays above `V*`, so a truncated phase B is an **upper** bound where a from-item
solve's is a **lower** one. And — the reason this is the fix rather than an optimisation — the greedy
policy is sensible from the very first sweep: restart wins at a state only where `restartCost +
V[start]` genuinely beats digging out, so a state holding a target keeps it.

Verified on the same 6-target from-white craft, `mainLine` reaching the goal at every budget:

| budget | converged | bound | E | route |
|---|---|---|---|---|
| 15 s | no | upper | 118,031 ex | 7 steps, reaches target |
| 45 s | no | upper | 42,868 ex | 6 steps, reaches target |
| none | yes | exact | 16,326 ex | — |

The bound tightens monotonically downward and never crosses under the converged value — pinned by a
test at 1000 vs 2000 sweeps (92.5 -> 45.1 -> 43.2 ex on the 2-target fixture).

**`bound: 'exact' | 'lower' | 'upper'` is a field, not an inference.** The two solve modes truncate in
opposite directions, so reading the sign off `converged` prints the wrong inequality on one of the two
screens. `formatBoundedCost` (src/lib/currency.ts) is the single renderer; three tests pin the
direction on both screens and all three fail when the ternary is swapped.

**The guard.** Without a converged phase A there is no proper-policy value to seed from, and an
unconverged 0-init V bounds the restart problem in neither direction. The solve returns `feasible:
false` with a reason naming the limit that actually bit — the clock ("raise Search effort") or the
sweep cap ("the step routes still cover it") — rather than quoting a figure with no meaning.

**What this costs on the reported craft.** Six T1 mods on a `Body_Armours_str` from white: phase A
alone needs ~92s, of which 99.8% is value iteration (actions 172ms, compile 42ms). Standard and
Thorough therefore decline it; **Patient** produces an 8-step route reaching the target, `bound:
upper`, E ~ 1.78M ex. That is the honest answer for a target this far out, but the 92s is a solver
problem, not a physics one — see TODO 2 for the measured cause (an absolute `tolerance` of 1e-9 against
values of ~2e6) and the two cautions on fixing it.

**Two defects found alongside, both fixed.** The lab branch gave the MDP a fixed 60% of the effort
budget while its step planner is bounded by `maxPlans` and takes no clock at all — so at Thorough, 24
of 60 seconds went to nobody. It now takes the remainder, as the item branch already did. And
`PolicyGraph`'s hint line was a `role="status"` wrapping a standing instruction and the `Clear` button:
boilerplate queued for announcement next to the Item tab's "Last solve took Xs" region, with a control
read out as part of it. The live region is now only the sentence that changes, mounted from the start
and empty until a state is picked.

**Suite.** `searchEffort.test.ts` was driving `runSolve` on a 6-target lab craft to assert the STEP
planner's orb depth, and so bought a from-white MDP at Thorough/Patient budgets: 209s and 134s for
numbers the assertions never read. It now calls `optimize` directly, keeping one `runSolve` case for
the wiring. Full suite: **48 files, 952 passed, 23.0s** (was 3 failed, 940 passed, 346s).

## The Lab's desecration hint contradicted the model (2026-08-24)

Found while checking a real 6-mod Body Armour craft whose route read *"Desecrate — most likely lands
+# to Armour"*, twice, on a base whose desecrated pool holds **zero prefixes**. That looks like a bug
and is not one: the ruling above (D4, user-confirmed 2026-08-23) is that normal mods DO enter the bone
pool, so an unomened Desecration draws over `normal ∪ desecrated`.

The hint next to the target picker said otherwise — *"it spans the base's whole desecrated pool"* —
which reads as though a bone always produces a carved mod. Measured at ilvl 82:

| base | carved weight | normal weight | P(any carved) | P(the one you asked for) |
|---|---|---|---|---|
| Body_Armours_str | 10,000 | 124,500 | 7.4% (1 in 13.4) | 1 in 135 |
| Wands | 15,000 | 114,400 | 11.6% (1 in 8.6) | 1 in 129 |
| Amulets | 31,000 | 173,650 | 15.1% (1 in 6.6) | 1 in 205 |

So on a Body Armour, **93% of bones add an ordinary mod**. The copy now says that, with the figures.

The deeper problem was that nothing pinned the ruling anywhere in the suite, which is how the copy
drifted away from it. `desecrationGate.test.ts` now asserts on the MDP's own action space that an
unomened bone (a) can add a NORMAL target — measured at 19% of its mass on `Body_Armours_dex_int` —
and (b) leaves carved outcomes a minority; plus that a side-constrained bone on a side with no carved
mods offers carved outcomes with probability zero, which is the ruling's most surprising consequence.

## A Desecration offers three mods, not one (2026-08-24)

User ruling, 2026-08-24: a bone puts **three** modifiers in front of you and you keep one; you cannot
decline, so three bad offers still cost you a mod. The app modelled a single random draw — nothing in
the engine knew about a choice at all. Measured at ilvl 82:

| | 1 draw (modelled before) | 3 offered, keep one |
|---|---|---|
| a specific carved mod, Body Armour | 0.74% | 2.21% (**x2.98**) |
| a specific normal mod, Body Armour | 9.67% | 26.3% (x2.72) |
| **forced to burn the carved slot** | **6.69%** | **0.03%** |

The second row is the bigger consequence: you only take a carved mod you didn't want when *all three*
offers are carved, a 220x drop. So the `desJunk` / Omen-of-Light recovery branch is near-dead on a
from-white craft — and the planner's habit of spending bones on ordinary mods before securing the
carved one, which looked like a bug, was it pricing a 6.7% burn risk that is really 0.03%.

**Where it is applied.** At the point a bone is SPENT — `plan.ts`'s desecrate step for the linear
planner, an `offer` field on the MDP's desecrate actions — and never inside the three probability
primitives. `desecrationBossProbability` and `desecrationBossAnySideProbability` are faithful ports of
Java's `DesProbability` pinned by a differential fixture; that fixture is the oracle for the per-draw
number and stayed green through the whole change, which is how we know the seam is in the right place.

**The solver could not just take a new distribution.** Which of the three a player keeps is whichever
leads to the cheapest state, so a bone's value is `E[min over the offer]` — a function of V, not a
fixed distribution. Sorting outcomes by V ascending and writing `T_k` for the tail sum from k:

    P(keep outcome k) = T_k^m - T_(k+1)^m        (m = offers shown)

which at m = 1 collapses to `T_k - T_(k+1) = p_k`, so the ordinary case is the same formula rather than
a branch around it. K is about 10 outcomes and only a Desecration pays the sort.

**The graph had to move with it.** Edges are built from the action's distribution, which is per-DRAW.
Left alone they would have drawn a 50% brick that the player really faces at 12.5% — and
`simulatePolicyMean` samples those very edges, so the validator would have confirmed a cost the solver
never computed. `realizedDist` applies the same tail weights to the published edges. Mutation-checked:
reverting it makes the 100k-run walk cost 3.006 against the solver's 9/7.

**Hand-computed anchor**, on the synthetic both-sides fixture where each draw is 1-of-2:

    E = 1 + (7/8)*0 + (1/8)*(1 + E)  =>  E = 9/7      (was E = 3 under a single draw)

with 100k Monte-Carlo runs of the published graph inside 3% of it.

**Two tests changed price rather than expectation.** A Sinistral Necromancy omen at 0.5 used to beat
the unconstrained route (1.5 vs 3); the offer closes that gap on its own (9/7 = 1.286), so at 0.5 the
omen is now correctly declined. Both tests were written to pin *that an omen is weighed*, not that a
particular price wins, so the omen was re-priced (0.5 -> 0.2, and 2 -> 0.4 in the linear planner's
domination case) to keep them testing what they were written for.

## A bone is the cheapest way to add an ordinary mod (2026-08-24)

Follows directly from the offer of three. Desecration was modelled only when a carved mod was in play
(`desecratable`), on the reasoning that otherwise "a Desecration could only ever add junk". With three
offers and a keep-one choice that is wrong, and the prices make it badly wrong: a Preserved rib is
0.31ex against an Exalt's 1.00ex, so a bone lands a named normal mod on a Body Armour for ~1.2ex where
an Exalt needs ~9.6ex.

Measured on a **held Rare** (no `restartCost`, so nothing masks the comparison), 3 normal targets:

| base | bones excluded | bones available | |
|---|---|---|---|
| Wands | 4,073.8 ex | **1,215.5 ex** | −70% |
| Body_Armours_str | 2,967.6 ex | **693.9 ex** | −77% |
| Amulets | 54,834 ex | 54,834 ex | 0% — gate closed |

And from a white base they make the solve **faster**, because the craft is genuinely easier:

| targets | bones excluded | bones available |
|---|---|---|
| 4 | 5,824 ms, E = 173.8 ex | 2,327 ms, E = **26.3 ex** |
| 5 | 76,119 ms, E = 435.0 ex | 13,975 ms, E = **44.6 ex** |
| 6 | 120 s capped, E ≤ 82,210 ex | 120 s capped, E ≤ **645.5 ex** |

The 6×T1 Body Armour craft that prompted the seeded solve also improves — phase A 314 s → 145 s,
E 2.07M → 1.25M ex — though at 145 s it still needs the Patient preset.

**The gate is a necessary condition, not a heuristic.** `bonePrice < DESECRATION_OFFER_COUNT ×
exaltPrice`. The offer raises the chance of a hit by at most `m`, since `1−(1−p)^m ≤ m·p`; and a bone's
per-draw `p` is strictly below an Exalt's, because its denominator also carries the carved pool. So a
bone at `m` Exalts or more cannot win, and skipping it costs nothing — which is what keeps the desJunk
axis, and the 3× lattice it brings, off amulets and rings. An absent bone price reads as "no bone",
never as a free one (`stepCost` turns a missing key into 0, and a 0 here would switch desecration on
for every base in a sheet that simply doesn't price bones).

**A measurement mistake worth recording.** The first control deleted `prices.currency.desecrate` and
showed a 0% difference everywhere — `pricesForBase` re-derives the bone price from the sheet's `bones`
section, so both columns had bones on and the comparison was against itself. The real control is
`policy: { excluded: new Set(['desecrate']) }`, the same mechanism the app's own currency toggles use.

## Where the Omen of Light actually earns its price (2026-08-24)

Raised as a suggestion — the Omen of Light removes a carved mod specifically, so it should help when a
bone adds carved junk. It was already modelled (`lightOutcomes`, P=1) and is pushed OUTSIDE the
`desecratable` block, so it does not depend on a carved mod being targeted — which matters now that
letting bones compete for ordinary mods made "carved junk on a craft that wanted none" reachable.

What the measurement adds is **when it is worth buying**, and the answer is: rarely.

    3,095 ex  Omen of Light            (8.5 divine)  - certain
    3,350 ex  Omen of Dextral Annulment (9.2 divine) - certain if the side holds only it
    4,370 ex  Omen of Sinistral Annulment (12 divine)
      158.7 ex  plain Annulment                       - random target

So it is the cheapest CERTAIN removal of a carved mod, and 19.5x a random Annulment. Measured on a
`Body_Armours_str` held Rare, target 5 ordinary + 1 carved, with the WRONG carved suffix stuck on it:

| targets already landed | best move | E with omen | E without | omen worth |
|---|---|---|---|---|
| 0 | Chaos | 31,327 ex | 31,327 ex | 0 ex |
| 2 | Annul | 31,610 ex | 31,610 ex | 0 ex |
| 4 | Annul | 31,636 ex | 31,636 ex | 0 ex |
| 5 | Annul | 31,410 ex | 31,410 ex | 0 ex |

Zero throughout: a random Annulment at 158.7 ex, even eating a landed mod now and then, beats a 3,095 ex
certainty on a craft costing ~31,000 ex. Same result on the newly-reachable no-carved-target case — the
policy clears carved junk with a **Chaos Orb** (33.39 ex) and the omen is worth 0 ex there too.

It is chosen on the reported 6-mod craft, at `5 mods · +1 desecrated` where E ≈ 9,185 chaos
(~307,000 ex): there the omen is ~1% of the craft and a random annul risks five landed mods. That is
the shape of the rule — the Omen of Light is a **protect a nearly-finished expensive item** tool, not a
clean-up-junk one, and the model already draws that line without being told where it is.

**Load-bearing caveat.** The 8.5-divine quote is hand-transcribed (2026-08-22, `omenQuotes`; poe.ninja
has no omen endpoint). Every "worth 0 ex" above is a comparison against that number, so a materially
different real price would move the line.

## A Chaos restriction that never existed — built twice, retracted once (2026-08-24)

Worth keeping as a process note more than a mechanics one.

Reported: *"we cannot use a Chaos Orb on desecrated modifiers, even if they are normal modifiers gotten
through desecration."* Built as an outright immunity. Then refined to a preference (take an ordinary
affix if the item has one, the carved mod only if it does not) after reasoning that an immunity would
declare a legal move impossible. Both shipped — `af9843fc`, `73fbcaf9`.

**Neither was real.** The ruling had been retracted in the same conversation and the retraction was not
picked up. A Chaos Orb takes the desecrated mod at the same uniform odds as anything else, and the item
is clean afterwards. So does an Annulment. Reverted; `removeOutcomes` spares nothing.

Three things this cost, all of them recorded here as fact at the time:

- Two rounds of hand-recomputed tests and prices, for a rule that does not exist.
- A claim that barring the removal made a 5-ordinary+1-carved Body Armour craft ~35% CHEAPER (by
  protecting a landed carved target from a Chaos). That effect is gone with the rule.
- A bracketed "known approximation" about mod provenance, sized at +0.0%/+5.3%, that only mattered
  because of the restriction.

The lesson is not "ask more questions" — the rule was stated plainly and then withdrawn plainly. It is
that a ruling which arrives in conversation needs the same treatment as one that arrives in data: the
LAST word wins, and a correction is easy to miss when it comes as an aside in a message about something
else. Rulings now get written into docs/validation.md with the date they were confirmed AND re-read
against later messages before being built on.

## A bone is the cheapest way to add an ordinary mod (2026-08-24)

Follows directly from the offer of three. Desecration was modelled only when a carved mod was in play
(`desecratable`), on the reasoning that otherwise "a Desecration could only ever add junk". With three
offers and a keep-one choice that is wrong, and the prices make it badly wrong: a Preserved rib is
0.31ex against an Exalt's 1.00ex, so a bone lands a named normal mod on a Body Armour for ~1.2ex where
an Exalt needs ~9.6ex.

Measured on a **held Rare** (no `restartCost`, so nothing masks the comparison), 3 normal targets:

| base | bones excluded | bones available | |
|---|---|---|---|
| Wands | 4,073.8 ex | **1,215.5 ex** | −70% |
| Body_Armours_str | 2,967.6 ex | **693.9 ex** | −77% |
| Amulets | 54,834 ex | 54,834 ex | 0% — gate closed |

And from a white base they make the solve **faster**, because the craft is genuinely easier:

| targets | bones excluded | bones available |
|---|---|---|
| 4 | 5,824 ms, E = 173.8 ex | 2,327 ms, E = **26.3 ex** |
| 5 | 76,119 ms, E = 435.0 ex | 13,975 ms, E = **44.6 ex** |
| 6 | 120 s capped, E ≤ 82,210 ex | 120 s capped, E ≤ **645.5 ex** |

The 6×T1 Body Armour craft that prompted the seeded solve also improves — phase A 314 s → 145 s,
E 2.07M → 1.25M ex — though at 145 s it still needs the Patient preset.

**The gate is a necessary condition, not a heuristic.** `bonePrice < DESECRATION_OFFER_COUNT ×
exaltPrice`. The offer raises the chance of a hit by at most `m`, since `1−(1−p)^m ≤ m·p`; and a bone's
per-draw `p` is strictly below an Exalt's, because its denominator also carries the carved pool. So a
bone at `m` Exalts or more cannot win, and skipping it costs nothing — which is what keeps the desJunk
axis, and the 3× lattice it brings, off amulets and rings. An absent bone price reads as "no bone",
never as a free one (`stepCost` turns a missing key into 0, and a 0 here would switch desecration on
for every base in a sheet that simply doesn't price bones).

**A measurement mistake worth recording.** The first control deleted `prices.currency.desecrate` and
showed a 0% difference everywhere — `pricesForBase` re-derives the bone price from the sheet's `bones`
section, so both columns had bones on and the comparison was against itself. The real control is
`policy: { excluded: new Set(['desecrate']) }`, the same mechanism the app's own currency toggles use.

## Where the Omen of Light actually earns its price (2026-08-24)

Raised as a suggestion — the Omen of Light removes a carved mod specifically, so it should help when a
bone adds carved junk. It was already modelled (`lightOutcomes`, P=1) and is pushed OUTSIDE the
`desecratable` block, so it does not depend on a carved mod being targeted — which matters now that
letting bones compete for ordinary mods made "carved junk on a craft that wanted none" reachable.

What the measurement adds is **when it is worth buying**, and the answer is: rarely.

    3,095 ex  Omen of Light            (8.5 divine)  - certain
    3,350 ex  Omen of Dextral Annulment (9.2 divine) - certain if the side holds only it
    4,370 ex  Omen of Sinistral Annulment (12 divine)
      158.7 ex  plain Annulment                       - random target

So it is the cheapest CERTAIN removal of a carved mod, and 19.5x a random Annulment. Measured on a
`Body_Armours_str` held Rare, target 5 ordinary + 1 carved, with the WRONG carved suffix stuck on it:

| targets already landed | best move | E with omen | E without | omen worth |
|---|---|---|---|---|
| 0 | Chaos | 31,327 ex | 31,327 ex | 0 ex |
| 2 | Annul | 31,610 ex | 31,610 ex | 0 ex |
| 4 | Annul | 31,636 ex | 31,636 ex | 0 ex |
| 5 | Annul | 31,410 ex | 31,410 ex | 0 ex |

Zero throughout: a random Annulment at 158.7 ex, even eating a landed mod now and then, beats a 3,095 ex
certainty on a craft costing ~31,000 ex. Same result on the newly-reachable no-carved-target case — the
policy clears carved junk with a **Chaos Orb** (33.39 ex) and the omen is worth 0 ex there too.

It is chosen on the reported 6-mod craft, at `5 mods · +1 desecrated` where E ≈ 9,185 chaos
(~307,000 ex): there the omen is ~1% of the craft and a random annul risks five landed mods. That is
the shape of the rule — the Omen of Light is a **protect a nearly-finished expensive item** tool, not a
clean-up-junk one, and the model already draws that line without being told where it is.

**Load-bearing caveat.** The 8.5-divine quote is hand-transcribed (2026-08-22, `omenQuotes`; poe.ninja
has no omen endpoint). Every "worth 0 ex" above is a comparison against that number, so a materially
different real price would move the line.

## What a Chaos Orb does to a carved modifier (2026-08-24)

Landed on the third attempt, and both wrong answers are worth keeping because they are mirror images.

1. **Originally**: a Chaos could take the carved mod freely. That made it the model's cheapest way to
   clear carved junk at 33.39 ex — a move the game refuses, recommended as the best one, and reported
   as fact in this document.
2. **First fix**: barred entirely. That declared the opposite error — on an item whose ONLY modifier is
   carved there is no ordinary affix to reroll, so the Chaos does take the carved one, and calling that
   impossible is the same class of mistake in the other direction.
3. **The rule** (user, after checking): a Chaos rerolls an ORDINARY affix whenever the item has one. So
   the carved mod is out of the pool while anything else is there, and in the pool when nothing is. A
   **preference, not an immunity** — `removeOutcomes`' `sparesCarvedWhenAble`, set only by
   `chaosOutcomes`.

**The consequence that is easy to miss** is not about clearing junk at all: a Chaos can no longer
DESTROY a carved target already landed, as long as any ordinary affix remains. On a Body Armour
targeting 5 ordinary + 1 carved with the wrong carved suffix stuck on, that is a **~35% cheaper craft**
(≈31,400 ex → ≈20,300 ex), which dwarfs the cost of losing Chaos as a junk-clearer.

**An Annulment is not restricted** — user-confirmed the same day. It takes a carved mod randomly like
any other, so the Omen of Light makes that removal *certain* rather than *possible*. Had it gone the
other way, carved junk would be a near-brick and the omen the price of ever desecrating again. Every
"worth 0 ex" in the section above therefore stands: a 158.7 ex random Annulment beats a 3,095 ex
certainty on any craft not already worth ~100x the omen, at every level of progress from 0 to 5 of 6
targets landed.

**Known approximation, size measured rather than asserted.** The ruling extends to ORDINARY mods a bone
placed — provenance, not pool — and the state abstraction carries none for those (`jp`/`js` are counts,
`present` is a bitmask). Modelling it means splitting every junk counter and tagging every present
target, ~100x the lattice on a solve already at 145 s. Instead the error is bracketed: the truth lies
between "Chaos fully usable" (today) and "Chaos unusable", so that gap is the worst it can cost.

| craft | Chaos usable | Chaos barred | bracket |
|---|---|---|---|
| Wands x3, held Rare | 732 ex | 732 ex | +0.0% — Chaos best in 0/485 states |
| Body_Armours_str x3, held Rare | 193 ex | 203 ex | +5.3% — Chaos best in 7/485 states |
| Wands x4, from white | 26 ex | 26 ex | +0.0% — 0/1232 |
| Body_Armours_str x5, from white | 14 ex | 14 ex | +0.0% — 0/2816 |

A 0.31 ex bone offering three mods has left the 33.39 ex Chaos nearly unused, so the approximation is
worth at most a few percent, in a known direction: it can only make a craft look cheaper than it is.

**Testing note.** The first attempt at pinning this probed the POLICY GRAPH, which carries only the
action chosen at each state — and since a Chaos is rarely optimal any more, the "carved mod spared"
branch never appeared and the assertion passed vacuously. The tests probe `createActionSpace` directly
instead, and assert both branches, each mutation-checked.

## The desecration flag follows the MOD, not the pool (2026-08-24)

The resolution of four attempts in one day, each built one step too literally on a ruling. The fact
that settles all of them:

> a desecration adds a mod to the item, and **that mod is flagged as desecrated because a desecration
> applied it** — whatever pool it came from. Removing or changing that mod clears the flag, and the item
> can be desecrated again.

Three rules I had been modelling separately are one rule: *at most one desecrated mod* = at most one
FLAGGED mod; *once per item, cleared by removing the desecrated modifier* = remove the flagged mod;
*a Chaos cannot touch a desecrated mod* = retracted, and the Chaos has no special treatment at all.

**What the abstraction gained, and what it lost.** `desJunk: 'none' | 'prefix' | 'suffix'` described an
unwanted DESECRATED-POOL mod held on its own axis with its own slot. It became
`flagged: none | junk-on-a-side | target-i`. Two things fall out:

- The pool a mod came from stops being recorded at all, correctly — once a mod is on the item it fills
  the same slot, blocks the same family, and every currency removes it the same way. Only the flag
  survives, and only until the mod does.
- The old axis DOUBLE-COUNTED: it held a desecrated mod outside `jp`/`js` while also charging it a slot,
  so an item could hold a phantom extra affix. `prefUsed`/`sufUsed` lost their extra term.

An earlier attempt at the same ruling added a standalone `boned` bit instead (branch
`desecration-one-per-item`). That made a desecrated target on an unreplaceable item a permanent
one-shot — E = Infinity — which the user rejected, and it broke the two-phase seed besides, since a
permanent dead end means no restart-free proper policy exists. The flag model has no permanent dead
ends (an Annulment always clears it), so the seed works and that branch is abandoned.

**The model now reaches the real strategy unaided.** A bone marks whatever it applies, so the one
Desecration is a resource to place well rather than an opener to spam. Asked for three ordinary mods on
a held Wand, the policy now **opens with an Exalt and holds the bone back** — which is how the mechanic
is played ("desecration is at the end, for the mods with the low weights"). The previous version, which
let a bone be spent freely, opened with one and used it on every target. That behaviour is pinned by a
test, because it is the strongest evidence the flag sits in the right place.

### Every desecration figure re-measured

Held Rare, three ordinary targets, no restart (so nothing masks the comparison):

| base | bones excluded | bones available | |
|---|---|---|---|
| Wands | 4,073.8 ex | **2,181.3 ex** | −46% |
| Body_Armours_str | 2,967.6 ex | **1,358.5 ex** | −54% |
| Amulets | 54,834 ex | 54,834 ex | 0% — price gate closed |

This **corrects the −70% / −54% pair** published under `974700c4`, which assumed a bone could be spent
over and over.

D4 sensitivity, on crafts with **no desecrated target at all** — also corrected, and smaller than the
4x reported in TODO 1:

| assumed weight | Wands x3 | Body_Armours_str x3 |
|---|---|---|
| 1 | 1,953 ex | 1,315 ex |
| **1000 (shipped)** | **2,181 ex** | **1,359 ex** |
| 20,000 | 4,074 ex | 1,478 ex |

2.1x across the plausible range on Wands, 1.1x on Body Armour. Still worth pinning down, still TODO 1,
but it is no longer setting the price of every craft to the degree claimed.

The **Omen of Light** conclusion survives its third re-measurement: worth 0 ex at every level of
progress on a Body Armour craft targeting 5 ordinary + 1 desecrated. A 158.7 ex random Annulment still
beats a 3,095 ex certainty.

### What it costs

The flag axis is about **5x the solve time** when desecration is in play — a 4-target from-white Wand
craft goes 1.9 s to 10.2 s, a 5-target one 15.9 s to 77.7 s. Both still converge; the 6-target craft
caps out and returns a looser upper bound than it did. Accepted rather than approximated away: a looser
honest bound beats a tighter wrong one, and TODO 3 (value iteration is 99.8% of a from-white solve, on
an ABSOLUTE tolerance against values of ~2e6) is the standing fix and is now worth more.

A free win found alongside: `desecratable` did not consult the currency policy, so excluding
Desecration still enumerated the whole flag axis for nothing. Checking it there took the bones-excluded
4-target craft from 12.2 s to 1.9 s.

### And a real bug it exposed

Reachability meant *"can reach the goal with SOME chance"*, which is only adequate while every action
can be retried. States with no route at all were being backed up regardless: each sweep added another
orb's cost, so their V climbed forever, `delta` never fell under `tolerance`, and `converged` came back
false however long the solve ran — measured on a 2-target armour craft as E growing **11.4M → 113.6M ex
when the sweep cap rose 10x**, while the start's own value had been stable throughout. Replaced with
the standard almost-sure (Prob1) fixpoint, computed before value iteration with dead states pinned at
Infinity, and computed PER PHASE since phase A runs without restart and has different dead ends. That
craft now converges in 171 ms.

## Value iteration: a stopping rule on the scale of the numbers (2026-08-24)

`tolerance` was **absolute at 1e-9** while these values run to ~2e6 exalts, so a solve ground fifteen
decades of residual to settle digits neither the price sheet nor the player has. It now defaults to a
**thousandth of the cheapest action the craft can play**. Measured interleaved, three reps, on a
4-target from-white Wand — the two sets of runs do not overlap:

    flat 1e-9      median 17,477 ms   [15311, 17527, 17477]
    scale-aware    median  9,898 ms   [ 9898, 10144,  9253]     1.77x

The cost is a relative error of **1.0e-3 to 1.4e-3**, and two things make that acceptable rather than
merely small. It is far below what the inputs support — the price sheet moves daily, the desecrated
spawn weight is unverified by ~900x — and it is **one-directional**: the sequence stops ABOVE its limit,
so the number overstates a craft's cost and never flatters it. The test asserts the direction, not just
the magnitude; a symmetric closeness check would pass just as happily on an answer that was too cheap.

The hand-computed tests keep their precision by asking for it (`EXACT = { tolerance: 1e-12 }`). They
pin the model's arithmetic, not the stopping rule.

**The residual is not the error.** A descending sequence stopping at Δ < tol still sits `tol/(1−r)`
above its limit, and `r` is near 1 here — which is why the error is ~1e-3 and not ~1e-6. Dividing by
10,000 instead buys 10x the accuracy for almost none of the speed (92.2 s against 50.1 s at n=5), so
1,000 is the knee.

### Two things tried and NOT kept

**Sweeping toward the goal — a negative result.** `enumerateStates` counts `present` from 0 to 2^n − 1,
so `present === GOAL` sorts last and every sweep appeared to run away from the answer. Reordering the
lattice nearest-goal-first looked like free money. It is not: measured interleaved, five reps, on a
5-target push-forward solve —

    none  median 9,533 ms      near  median 8,471 ms      far  median 8,484 ms

*near* and *far* are indistinguishable from each other, and both sit inside the run-to-run spread. The
premise was wrong: in this model most transitions are BRICKS (85–99% on a from-white craft), so `V[near]`
depends mostly on `V[far]` and information does not flow purely backward from the goal. Reverted. Worth
recording so the next person does not spend the afternoon on it.

**A seed repair that repaired nothing.** Phase B is an upper bound because phase A reached a fixed
point, and stopping phase A at residual `tol` weakens that — so the seed was scaled by
`cheapest / (cheapest − tol)` to put it back on the excessive side. The derivation is sound
(`T(cV) <= c·T(V)` for `c >= 1` with positive costs) and the code was one line. It did nothing
measurable: removing it moved the answer in the FIFTH decimal at every tolerance from 1e-4 to 1.5e-1,
in both directions, and never turned a violated bound into a satisfied one. Phase B's own truncation
margin — `tol/(1−r)`, orders larger — is what actually holds the bound up, and that is measured rather
than assumed. Removed. A mutation test that cannot kill a line is telling you something about the line.

### Measurement discipline

Three conclusions were drawn and discarded in this work before the method was fixed. Single runs of
these solves have a **~40% spread**: the unchanged code measured 103.8 s and then 145.6 s for identical
work. The sweep-order change was called a large win, then a large regression, on that basis — both from
noise. Every number above is a median of interleaved repetitions, and anything that cannot be separated
that way is reported as indistinguishable rather than as a result.

## Making a slot's alternatives cost what one mod costs (2026-08-27)

Slot alternatives shipped working but expensive: measured on a 4-slot Wands craft from white, a
three-way group ran 2.8x (cross-family) to 5x (same-family) the single-mod solve. Dorian's read —
*"if x is on the item, we do not need to search for y"* — is right about the goal and wrong about the
pool. Once X lands you never need to FIND Y (`isAccepting` already stops asking), but Y is still in the
pool: deleting it does not stop the game rolling it, it only makes the model lie about the next Exalt.
Y stops being a target and becomes an obstacle.

The redundancy is real, one step over. The solver tracks WHICH alternative landed when it only needs to
know HOW MANY, and in what condition. Two exact reductions, and they are not interchangeable — they
differ in whether the members can be on the item at the same time.

**Same family (`increased Fire / Cold / Lightning` are one family): MERGE.** Only one can ever land, and
once any of them does the whole family is excluded — so every later draw sees the identical pool and a
removal returns the slot to empty either way. `McTarget` became one POSITION holding several `mods`;
weights sum on arrival. Exact regardless of the members' weights or tier floors, because individual
weights stop mattering the moment the family is occupied and on the way in they simply add up.

**Different families (`Gain % as Extra Cold` / `… Lightning`): QUOTIENT.** These cannot merge — both can
land, each takes a different mod out of the pool, and the "you got both" state is a finished item. Only
the labelling can go: a canonicalising `StateEncoder` picks one spelling of `(Cold present, Lightning
blocked)` and the lattice carries only that. One choke point rather than 24 — every successor in
`markovActions.ts` is named through `encodeState`, so wrapping that reaches all of them, and `addTo`
already sums duplicates so the collapse is free.

**Measured, interleaved, 4 reps each, with the mechanism toggled in place so nothing else confounds it.**
4-slot Wands craft from white, `solver: 'policy'`:

| group | before | after | graph nodes | cost |
|---|---|---|---|---|
| same-family 3-way | 5.18 / 4.96 / 5.27 / 5.19 s | **2.17 / 2.03 / 2.05 / 1.96 s** | 60 → 32 | `256.959615 exact` in all 8 |
| cross-family 3-way | 14.08 / 14.41 / 13.75 / 13.74 s | **3.86 / 4.25 / 4.48 / 4.41 s** | 122 → 53 | `217.990477 exact` in all 8 |

**2.5x and 3.2x, with the answer identical to six decimals in every run** — which is what makes these
optimisations rather than trades. Both beat their state-count predictions (2.1x and 2.7x) because the
collapsed outcome distributions are smaller too.

Costs move in the last bits and no further, and the reason is the mechanism: merging sums weights and
divides once where separate targets each divided first, and canonicalising re-orders a floating-point
sum. A same-family anchor moved 3 ulp (23.539201819271987 → …984), a cross-family one 1 ulp. Those two
anchors are `toBeCloseTo(…, 12)`; every other anchor is `toBe`.

**A prediction that was wrong, recorded because it was load-bearing.** `Wands/DamageGainedAsFire` was
expected to be disqualified from the cross-family class: `FireDamage` also holds
`PerfectEssence_FireDamage`, so occupying Fire excludes a mod that occupying Cold does not. It is not
disqualified, because a Perfect Essence FORCES its mod rather than drawing one — `pools.essence` is read
exactly once in the whole optimizer, to check a target is in it, and is never a denominator. The essence
pool stays in the interchangeability signature anyway: the regular-Essence action (TODO 1) makes it a
real weighted draw, and a condition added then is a condition added after the numbers were already wrong.

**Mutation testing: 23 mutants, 14 caught, 9 survivors — every one a real gap.** The survivors clustered
on one theme worth stating: merging runs BEFORE three validity checks, and all three count POSITIONS.
"All prefixes or all suffixes", "two slots both want family X" and "at most one essence modifier" each
compare a list that merging has already collapsed, so anything wrongly swallowed reports as one item and
sails through. `mergeKey`'s guards are therefore load-bearing for checks downstream of them, and each is
reachable in the shipped data rather than theoretical:

- **ten families span both sides on one base** — `Bows/Desecrated_CompanionDamage` is a prefix and `…_2`
  a suffix of `CompanionDamage`, same source, same weight, everything the merge looks at except the side;
- **six bases carry two or more perfect-essence mods of one family** (`Bows` among them);
- a held mod graded against a neighbour's tier floor reports a satisfied slot as `blocked`, so the plan
  opens by annulling a mod the player wanted — only a from-ITEM craft catches it, and every test here
  had started from white.

Two conditions turned out to be inert in 0.5.0 and are pinned with built pools rather than found ones:
**pool exclusion** (every interchangeable pair in the shipped data also has families of equal pool
weight) and **boss-pool counts** (every differing-boss pair on Wands shares a family). Both are
necessary — occupying a family removes its whole weight from every later denominator, and the boss draw
is uniform over candidates rather than weighted, so weight is the wrong question there. Leaving them
untested until a refresh moved a weight is how they would have become wrong silently.

**What a player can act on.** The merge is unconditional; the quotient is measured against the data every
solve and quietly does not apply when the data says no. Asking DIFFERENT TIERS of two cross-family
alternatives switches it off, and that is the one cause the player controls — `MIXED_TIER_NOTE` says so
on the group row, worded as a planner fact ("slower to compute, same answer") rather than a game rule,
and promising no number, since matching the tiers is necessary for the fold and not sufficient.

## The solver was evaluating the same move at two prices (2026-08-28)

Both of the reductions above attack the STATE COUNT. Nothing had ever attacked the other axis — the work
done per state — and that is where the next win was, sitting in plain sight.

A Rare state on a Wand compiles about 27 actions, and 23-31% of them turn out to be **exact duplicates
of a cheaper sibling**: same outcome distribution, bit for bit, at a higher price. Measured on real 0.5.0
crafts before anything was built (24.3% on a 4-target Wand from white, 22.7% on a 3-target Body Armour,
31.1% on a held Rare Wand), from four independent causes:

- **A side omen that constrains nothing.** `addOutcomes` uses `constrainTo` only to close the other side,
  so a Sinistral Exaltation is the same computation as a plain one wherever the suffix side is already
  full — at 20-27x the price. The *opposite* variant was already dropped by the empty-`dist` guard, which
  is why the survivor is the duplicate. Biggest single cause: 2,556 of 8,767 duplicates on the Wand craft.
- **A strength that buys nothing.** Greater/Perfect raise the minimum tier a roll can produce; where the
  remaining addable mods all sit above the floor anyway, only the price moves. 768 more.
- **A boss whose pool is the whole legal pool** — the case the desecrate block had noted for months and
  only tie-broken.
- **An Omen of Light where the flagged mod is the only thing an Annulment could take.**

The fix is one fold at `push`, the choke point through which every action already enters the space: keep
the cheapest spelling of each outcome distribution. Exact, because with the distribution held fixed an
action's value `(cost + Σ p·V)/(1 − pStay)` is monotone in cost — a strictly cheaper duplicate already
had strictly lower value and already won the argmin, and on equal cost the first survives, which is the
order `bestAction`'s strict `<` already resolved in. So this does not merely cost the same; it reproduces
the same POLICY, including which action the graph names.

**Interleaved, six crafts, 60 runs, medians:**

| craft | before | after | |
|---|---|---|---|
| 3 targets, Body Armour, from white | 0.13s | **0.11s** | 1.18x |
| 3 targets, held Rare Wand | 0.39s | **0.33s** | 1.20x |
| 5 targets, Wand, from white | 9.41s | **7.08s** | 1.33x |
| 4 targets T2, Wand, from white | 2.65s | **1.92s** | 1.38x |
| 4 targets incl. a carved one, held Rare | 2.22s | **1.57s** | 1.41x |
| 4 targets, Wand, from white | 2.00s | **1.33s** | 1.51x |

Every craft returned **exactly one** `(expectedCost, bound)` across all 60 runs with the fold on and off
— e.g. `1899.257096509057 exact` on all twelve runs of the 5-target craft. That, not the timings, is the
result: the answer cannot move, and the 1,182-test suite passed unchanged.

`isRestart` is in the signature and has to be. An Annulment that empties a one-mod item lands on the
start state with P=1 exactly as a restart does, and phase A runs push-forward only — folding those two
would leave phase A with no action at all there, an Infinity where a real value belongs, and a different
seed for phase B. That one is mutation-tested; so are the fold itself, keeping the cheaper spelling, and
replacing in place rather than appending.

`offer` is in the signature too and **no craft can exercise it** — mutating it out changes nothing. The
reason is structural rather than lucky: the only action with `offer > 1` is a Desecration, and a
Desecration is the only thing that flags what it placed, so its outcomes differ from every unflagged
action's in the state key itself. There is a test on that invariant rather than on the unreachable guard,
so a second offer mechanic that does not flag goes red next to the term protecting it.

Two pre-existing tests turned out to pin both directions already, on real semantics: `markovEssenceDesecrate`
asserts that where the untargeted draw and the Blackblooded one coincide the planner reports the
omen-free step (now folded rather than tie-broken), and that a Sinistral Necromancy omen which genuinely
narrows the draw is still offered and still bought.

### Two levers this closes on measurement

**Policy iteration for phase A: dead.** `evaluateClosedForm` is fast only because restart states are
absorbing and are 98% of the lattice. Phase A has no restart, so every phase-A policy plays forward
everywhere — which is the chain `heuristicPolicy` already records burning 5,000,000 sweeps and an entire
deadline. Evaluation there degenerates into the problem being solved.

**Prioritised sweeping: dead, and now measured rather than argued.** A worklist pays off when the residual
is LOCALISED. Instrumenting phase A to count states moving by more than `tol` per sweep says it is not:

| craft | sweeps | moving at sweep 1 | at 50% | at the end |
|---|---|---|---|---|
| 4-target Wand, from white | 1,238 | 99.8% of N | 99.2% | 31.9%, then 2.1%, then 0 |
| 3-target Body Armour | 174 | 99.6% | 99.6% | 3.5%, then 0.1%, then 0 |
| 3-target held Wand | 814 | 99.6% | 99.4% | 71.2%, then 24.2%, then 0 |

Essentially every state moves on essentially every sweep until the last two or three. That is a global
slow mode, not a thin spine: a worklist would re-enqueue nearly everything each round and pay predecessor
bookkeeping for it. The same instrumentation also found **zero** actions touching an Infinity-pinned
state on any of the three crafts, closing a third candidate before it was written.


## Is there any point to the effort ladder? (2026-08-28)

Dorian's question, and a fair one: *"people will rather wait and have a finished way instead of a
semi done way."* A campaign over **18 realistic crafts and 108 solves** says the instinct is right but
the culprit is the SOLVER, not the ladder.

Until now only `exhaustive` set `solver: 'policy'`. The other four — including `standard`, the default
— ran Gauss-Seidel value iteration, which stops on a residual TOLERANCE and therefore prints a ceiling
(`≤ x`) when it runs out. Policy iteration stops on a CERTIFICATE: the policy stopped changing, so no
action anywhere improves on it.

### Policy iteration did not lose a single cell

| | exact | ceiling | no number |
|---|---|---|---|
| Quick / VI | 6 | 4 | 8 |
| Quick / **PI** | **10** | **0** | 8 |
| Standard / VI | 9 | 5 | 4 |
| Standard / **PI** | **14** | **0** | 4 |
| Thorough / VI | 10 | 6 | 2 |
| Thorough / **PI** | **16** | **0** | 2 |

**PI produced a ceiling zero times.** It either solves exactly or reports it could not start — which is
precisely the "semi done" outcome the question was about.

### Waiting does not rescue value iteration

The direct test. At Patient's full 300 s:

| craft | VI @ 300s | PI | VI high by |
|---|---|---|---|
| wand-5 | 546 exact (96.5s) | 546 exact (**4.3s**) | — |
| wand-6 | ≤2,115 (301s) | 1,319 exact (**19.7s**) | 1.60x |
| wand-3-T1 | ≤326,624 (300s) | 240,666 exact (**4.9s**) | 1.36x |
| wand-4-T2 | ≤54,660 (300s) | 50,934 exact (**7.7s**) | 1.07x |
| wand-6-T2 | ≤266,824 (306s) | 108,966 exact (155s) | **2.45x** |
| armour-4-T1 | ≤18,553 (300s) | 17,030 exact (**14.1s**) | 1.09x |
| armour-6 | ≤909 (302s) | 855 exact (**21.6s**) | 1.06x |
| amulet-4 | ≤174,414 (300s) | 167,889 exact (99.9s) | 1.04x |

Five minutes of VI still leaves a ceiling on 7 of 8. **Switching solver beats raising effort**:
wand-4-T2 is `≤110,585` under VI at Thorough (60 s) and the exact `50,934` under PI at STANDARD (6.7 s).
Patient-PI and Exhaustive-PI return byte-identical costs (`108965.74824797024` for wand-6-T2 at both),
so `exact` really is converged rather than truncated.

### Why it cannot regress a number into a refusal

The property that makes the swap safe rather than merely better on average. "No number" comes from
**phase A** failing, and phase A is plain VI on both paths — `markovFromItem` returns `fail(...)` before
it reads the solver choice. A phase B that runs out under PI yields `bound: 'upper'`, the same kind of
ceiling VI gives. The measured no-number counts are identical at every rung (8/8, 4/4, 2/2), exactly as
that predicts, and `solve.test.ts` now pins both halves on a Rings craft bounded by SWEEPS rather than
by the clock (a wall-clock bound would be flaky by construction): at 5,000 sweeps VI gives `≤8,906` and
PI the exact `781.82`; at 2,000 neither can finish phase A and both refuse.

### Two negatives worth keeping

**The Item tab is wholly inert across the ladder.** All three held-item crafts returned the same answer
in the same time (0.13–1.5 s) at every preset. There is no phase B without a restart, so effort has
nothing to buy there.

**Only 1 craft of 18 changed frontier output between rungs** — wand-6-T2, from 2 alternatives / 5,760
plans at Standard to 7 / 368,640 at Thorough. Every other craft produced identical frontier output at
every rung. Real, but thin, and the spread holds only one craft big enough to exercise `maxPlans`.

### And the hints were already wrong

Re-measuring the shape the hints describe (6 T2 targets on Wands, budget 600, interleaved, 3 reps):
**Standard 24.9 s, Thorough 84.8 s** end to end, against hints saying 15 s and "roughly a minute". The
old figures quoted the budget search ALONE and left the MDP out of a wait the user experiences as one.
Solver-independent — VI 24.86 s vs PI 24.45 s at Standard, 84.78 vs 85.38 at Thorough — which confirms
the reading that a budgeted craft is bound by `maxNodes`, not by the clock. `maxMillis` governs only
the model, via `clockLeft()`. Hints corrected; the ladder's own numbers left alone.

### Not done here

Collapsing the ladder. The two negatives above argue for it and the PI results weaken the case for five
rungs, but it is a separate decision. What this entry settles is that the rungs no longer differ in
RIGOUR — every one ends on a proof — only in how long they may take to reach one.


## The MDP learns to buy an Essence (2026-08-28)

The last place in the app where a player asked a reasonable question and got no answer. A craft naming
an essence-only mod was refused outright — *"this model has no Essence action yet"* — and fell through
to the step routes. Perfect essences had been modelled for weeks; only the REGULAR grade was missing.

The gap was genuinely just the action. `essenceForcedProbability` already existed, `PlanStep` already
had `{ currency: 'essence'; add; essenceTier; essenceLevel }`, `stepCost` already priced it as
`essence:<level>:<modId>`, and the state had carried rarity since the Magic rung was added. So the work
was one outcome builder mirroring the probability primitive condition for condition, plus letting the
target through two validators.

### Three things the data decided

**An essence mod's tiers ARE its levels**, ascending exactly like a normal mod's: `Lesser Essence of
Alacrity` (ilvl 15) → `Essence of Alacrity` (30) → `Greater Essence of Alacrity` (60), against
`of Talent` [9,12] → `of Nimbleness` [13,16] → … So `minTierIndex` needed no special case, and
`mod.tiers[minTierIndex]` is at once the tier the player receives, the essence they buy, and the price
key. It also gives the policy graph a label worth reading: the step says **"Greater Essence of
Alacrity"**, which is what goes in a trade search, rather than "Essence (greater)".

**The side-room check is against the RARE cap, not the Magic one.** An Essence converts as it adds, so
the slot it needs is a slot on the item it produces — the same treatment a Regal gets. Checking the
Magic cap (1 per side) would refuse a legal essence on the commonest shape there is: a transmuted item
that happened to roll the other side. Mutation testing caught this; the cost tests did not, because the
wrong answer is still a legal route at a higher price and the argmin simply hides it.

**Both planners buy the same level, and that is a shared LIMITATION as much as an agreement.** The MDP
mirrors the linear planner's `clamp(minTierIndex)` rather than shopping for a cheaper level that would
also satisfy the target, because two models pricing one step differently is how the D8 desecration
mispricing survived. But the sheet is **not monotone in level** — Essence of Abrasion runs Lesser 116ex,
Normal 107ex, Greater 0.81ex — so any level at or above `minIndex` satisfies the target and both
planners can be buying one 100x dearer than one that would do. Fixing that belongs wherever the two
share the choice; doing it in one of them would recreate D8.

### Two refusals, replacing one that was too broad

`optimizeItemMarkov` carried a blanket `applicable: false` for any regular-essence target, reasoning
that those need a Magic item while the model starts from the Rare you hold. Half right — and the wrong
half was refusing the case that works, since the Lab's from-white craft climbs through Magic on its way
up. It is gone. What replaces it is narrower and can name the mod: from a held **Rare** the action is
genuinely unreachable, so `markovFromItem` says *"can only be added by a regular Essence, which needs a
Magic item — this one is already Rare"*. The generic *"no policy reaches the target"* told the reader
nothing to act on.

An older test asserting the reason "blames the missing action rather than the rarity" is now inverted,
and the inversion is the point: when there was no action, naming the rarity described a limit that was
not binding. Now the action exists and the rarity IS the binding constraint.

### Verified

Hand-computed on a synthetic pool where a Transmute can only land one mod and the Essence is the only
route to a suffix: E = 0.2 + 5 exactly, with the three levels priced 5 / 50 / 500 apart so a wrong
level cannot hide in a tolerance. On real 0.5.0 data: the MDP's chosen `tierIndex` and `level` equal the
linear planner's, and `actionCostOf` equals `stepCost` through the two different entry points. Plus a
40k-run policy simulation, because a P=1 edge is exactly where a mis-encoded successor hides — nothing
else in the distribution can dilute it.

Five of six guards were caught by mutation testing after two rounds; the sixth (`excluded(mod, occ)`)
is unreachable by construction, since two slots wanting one family are refused upstream — the same
reason the identical line in `addOutcomes` is labelled defensive.

### Found on the way, not fixed

**A lone essence target still throws in the LINEAR planner** — *"an essence-only mod needs a Magic item
first"* — and `runSolve` calls that planner before the model, so the throw takes down a compute the MDP
could now answer. That is the inverse of the standing rule that an MDP failure must never delete the
frontier. Recorded in TODO 2.


## A better essence is usually the cheaper one (2026-08-29)

Three fixes, two of them consequences of teaching the model to buy an Essence the day before.

### The step planner was taking the model's answer down with it

Ask for ONLY an essence mod — the most natural essence query there is — and `runSolve` died before the
model ran. `optimize()` throws *"an essence-only mod needs a Magic item first — include at least one
rollable mod in the target"*, and it was called unguarded. The MDP answers that craft perfectly well
(transmute, roll whatever lands, then essence), so from the moment it learned the Essence action the app
was throwing away an answer it had.

`frontierOrReason` is the mirror of `markovOrReason`, which has protected the frontier from a model
failure for months. The rule was always symmetric; only one half had ever been reachable.
`EngineResult.reason` carries the planner's own sentence, and `FrontierView` prefers it over the generic
"nothing this search tried worked" — a search that RAN and found nothing and a planner that DECLINED are
different answers, and telling the second reader to try a lower tier sends them to fix something that
was never the problem.

### Both planners were quoting essences ~13x too dear, on average

An essence mod's tiers ascend, so every level at or above the wanted one satisfies the target **and**
rolls better stats. Both planners took the wanted level itself — `clamp(minTierIndex)` — on the
reasonable-sounding assumption that a weaker essence is a cheaper one.

**It is not, for 250 of the 302 fully-priced essences in 0.5.0 — 83%.** Measured across all 317 essence
targets, choosing the cheapest satisfying level instead:

| | before | after |
|---|---|---|
| total quoted price, all targets | 8,595.8 ex | **646.6 ex** (13.3x cheaper) |
| targets whose level changed | — | 251 of 317 (79%) |
| worst single case | `Bows/Essence_FireDamage` 364.2 ex | **0.3 ex** (1,214x) |

Examples of the shape: `Amulets/Essence_FireResistance` lesser 15 / normal 100 / **greater 1.886**;
`Amulets/Essence_ColdResistance` 20 / 54.99 / **0.9385**. Since the optimizer ranks plans BY cost, this
was a wrong recommendation and not merely a wrong total.

`cheapestEssenceLevel` lives in `cost.ts` and **both planners call it** — one function on purpose, since
two models pricing one step differently is exactly how the D8 desecration mispricing survived. It prices
candidates through `stepCost` rather than the raw key, so a level whose per-mod entry is missing is
compared at the `essence_<lvl>` fallback it will actually be charged; ties keep the lower level, so a
flat sheet reproduces the old behaviour exactly. The linear planner resolves it **once per craft**, not
per ordering — `buildParetoSteps` runs for every permutation the search tries.

### The ladder is three rungs

Retired `thorough` and `patient`. Not because effort stopped mattering — the MDP gradient under policy
iteration is real (Quick 10 of 18 crafts exact, Standard 14, Thorough 16, Patient 18) — but because two
rungs overlapped: Patient and Exhaustive returned **byte-identical costs** on every hard craft, and
Thorough sat between neighbours that already bracketed it.

The surviving top rung keeps Exhaustive's 900 s clock rather than Patient's 300 s, deliberately: every
craft in the 18-craft spread settled inside ~300 s, but 18 crafts is a spread and not a census, the
clock is a ceiling rather than a promise, `maxSweeps` is usually what binds, and cancel is a worker
`terminate()`.

**A retired rung maps UPWARD.** `read()`'s unknown-id fallback is right for a corrupt value and wrong
here: it would have moved someone who deliberately chose Patient to a *shorter* search and a worse
answer without telling them. `RETIRED_EFFORT` is honoured by `limitsFor` too, so a stored id reaching
the solver by any path — a worker message, a test, a link — lands on the successor.

### Sentry: the gating verified, not assumed

No DSN was added; Dorian sets it in Vercel, and the production build runs there, so a local `.env` would
not reach the site. What was checked is that the build-time gating behaves as documented — the check
that would have caught the 2026-08-26 error, where a bundle was profiled with Sentry compiled out:

| build | entry chunk | Sentry chunk |
|---|---|---|
| no DSN | 374.07 kB (gzip 113.75) | — |
| DSN set | 375.83 kB (gzip 114.60) | 479.24 kB (gzip 158.85), separate |

The entry chunk moves 0.85 kB gzip because the SDK is a **dynamic** import; a static one took it to
202 kB. `warnIfUnmonitored` prints on the unset build as intended. Steps now live in
`docs/DEVELOPMENT.md` where a deployer will find them, pointing at `.env.example` as canonical rather
than duplicating it.


## Making Sentry worth having (2026-08-29)

Turning the DSN on closed the "we hear nothing" gap. Two more gaps decided whether what we now hear is
worth reading, and both were found by looking rather than assumed.

**No source maps.** An issue would have read `index-R5rPqtGC.js:1:284729` inside a function called
`Xe`. `build.sourcemap: true` now, served publicly — which costs ~2.2 MB of deploy and **nothing** in
page weight, since a browser fetches a `.map` only with devtools open. Public is the right trade here
specifically: the repo is public and AGPL-3.0, so a map reveals nothing GitHub does not already. The
alternative (`'hidden'` plus `@sentry/vite-plugin` uploading them) needs a `SENTRY_AUTH_TOKEN` — which,
unlike a DSN, is a genuine secret to store and rotate. Worth switching to only if the repo goes private.

**The solver reported nothing.** Everything hard in this codebase — the MDP, policy iteration, the
action space — runs in a Web Worker, and the main-thread SDK does not see it. A throw there was a
progress bar that stopped.

The obvious fix is a `Sentry.init` inside the worker, and it is the wrong one: that is the entire
158 kB gzip SDK on the thread whose whole job is to keep weight off the one the user is looking at, and
this app respawns the worker on **every cancel**. The worker already had an error channel to the main
thread, which already has the SDK loaded. So it now sends `stack` alongside `message`, and
`engineClient` rebuilds the Error and reports it with `origin: worker-solve` or `worker-fatal`. Nothing
extra is downloaded and the worker's startup cost is unchanged.

One thing this exposed on the way: **the worker's outer catch is no longer what its comment said.** It
used to be where the planner's "that target is illegal" refusals surfaced. Since `frontierOrReason` and
`markovOrReason` wrap both planners, those now come back as a `reason` on a result that returns
normally — so what reaches the catch should be genuinely unexpected, which is what makes reporting it
sane rather than noise. If the issue tracker fills with validation sentences, that is the signal some
path is unwrapped, not a reason to stop reporting.

### The bug the test exists for

The first version tagged the report by hanging a `tags` property off the Error:

```ts
reportError(Object.assign(err, { tags: { origin } }));   // type-checks, runs, reports — no tags
```

Sentry reads tags from `captureException`'s **second argument** and nowhere else, so that silently
dropped them. It type-checked, it ran, the error arrived — only the tag was missing, which is the kind
of thing nobody notices until they need to filter by it. `reportError(error, context)` carries them
now, the queue carries them too (an error thrown before the chunk lands is the startup case most worth
seeing, and replaying it untagged files it in the wrong place), and `sentry.test.ts` mutation-pins all
three: the live path, the queue replay, and the queue's 20-item cap.


## The from-item planner learns orb strength, by decomposing it (2026-09-01)

`baseTransforms` set no `tier` on any add, so every plan the from-item planner built used a
base-strength orb; it reported `currencyDepth: 'base-only'` and the badge said so. TODO 5 proposed
copying the from-white **estimate-then-reduce throttle**. Three measurements said that was the wrong
fix, and a fourth said a better one was available.

### 1. The naive product is unusable, and the throttle would have been worse than slow

Skeleton count for `j` junk and `m` missing rollable mods is `Σ_c C(j,c)·C(m,c)·c!·(j+m−c)!`. Measured
against the real planner, the model is exact — `j=2, m=5` gives 14,640 skeletons and **295,680 plans in
3.6–3.9 s**, reproducing the figure recorded in `fromItem.ts`.

Running the code's own `estimate()` ladder at its default `maxPlans` of 100,000:

| craft (j, m) | plans today | at `full` | at `base+strongest` | rung it would pick |
|---|---|---|---|---|
| j=1, m=4 | 2,688 | 217,728 | 43,008 | `base+strongest` |
| j=3, m=3 | 10,980 | 296,460 | 87,840 | `base+strongest` |
| j=2, m=4 | 20,352 | 1,648,512 | 325,632 | **`strongest-only`** |
| j=3, m=4 | 168,192 | 13,623,552 | 2,691,072 | **`strongest-only`** |
| j=2, m=5 | 295,680 | 71,850,240 | 9,461,760 | **`strongest-only`** |

`reduceOrbTiers` at `strongest-only` returns `[strongest]` — it **drops base entirely**. So on every
craft big enough to need the throttle it would have deleted the cheap end of the frontier this planner
returns today: not a wider search, a changed answer. There is no rung equal to today's behaviour and
the ladder has no fourth branch to add one to.

### 2. The axis does not need enumerating

`applyStep` reads only `currency` / `remove` / `add` / `adds` / `essenceTier` — never `tier`,
`constrainTo` or `omen` — and `stepProbability` is pure in `(data, state, step)` on all ten branches.
So the state trajectory is fixed by the skeleton and the levers move only price and probability. That
makes the cost separable: `E = (Σ c_k·S_{k−1})/S_n = Σ_k c_k / T_k` with `T_k = Π_{i≥k} p_i` the SUFFIX
product, so `T_k = p_k·T_{k+1}` and `E_k = E_{k+1} + c_k/T_k` — a backward DP over the steps.

Pruning it is exact rather than heuristic. For `T_a ≥ T_b`, `E_a ≤ E_b`, extending both by `(p, c)`
gives `p·T_a ≥ p·T_b` and `E_a + c/(p·T_a) ≤ E_b + c/(p·T_b)`, so domination survives every extension.
Needs `c ≥ 0` and `p > 0`; `leverOptions` guarantees both. `leverDp.test.ts` checks it against an actual
brute force on eight skeleton shapes plus the live sheet, rather than taking the algebra's word.

### 3. It is FASTER, and it searches ~192x more

Interleaved within each rep — A then B, per craft, per rep — because this machine has a documented ~40%
wall-clock spread and two opposite conclusions have already been drawn here from batched runs. Medians
of 3, all reps shown.

| craft | old | new | | plans old → new |
|---|---|---|---|---|
| wand j2 m5 T1 | **3,667 ms** [3667, 4599, 3459] | **1,050 ms** [1037, 1050, 1110] | **3.49x** | 295,680 → 56,687,040 |
| wand j2 m5 T3 | 3,950 ms [3950, 3882, 4425] | 1,209 ms [1209, 1199, 1338] | **3.27x** | 295,680 → 56,687,040 |
| wand j2 m5 any | 3,638 ms [3638, 3602, 3869] | 1,039 ms [1039, 1026, 1161] | **3.50x** | 295,680 → 56,687,040 |
| wand j2 m4 T1 | 239 ms [239, 237, 278] | 140 ms [137, 140, 178] | 1.71x | 20,352 → 1,648,512 |
| wand j2 m4 T3 | 211 ms [211, 206, 238] | 127 ms [127, 123, 140] | 1.66x | 20,352 → 1,648,512 |
| wand j3 m3 T3 | 100 ms [100, 100, 108] | 114 ms [114, 107, 123] | **0.88x** | 10,980 → 296,460 |
| wand j2 m3 T3 | 14 ms [15, 12, 14] | 15 ms [18, 15, 14] | **0.93x** | 1,608 → 43,416 |
| armour j2 m3 T3 | 12 ms [13, 11, 12] | 14 ms [15, 13, 14] | **0.86x** | 1,608 → 43,416 |

**It loses 7–14% on the small crafts and wins 3.5x on the big ones**, and the reason is visible in the
counts: the DP replaces the omen power set, so it pays off in proportion to how many `2^k` variants it
deletes. A skeleton heavy in annuls and chaos swaps has few omen levers to save and the DP's per-step
enumeration is not yet repaid. Those crafts run in 12–115 ms, where 14 ms is not a wait; the ones that
were seconds are the ones that got faster.

### 4. The answers moved, a long way

Best success-per-attempt on the frontier, old against new:

| craft | old | new | |
|---|---|---|---|
| wand j2 m5 T1 | 1.407e-14 | 4.533e-11 | **322x** |
| wand j2 m5 T3 | 3.082e-10 | 5.771e-08 | **187x** |
| wand j2 m4 T3 | 1.655e-08 | 8.133e-07 | 49x |
| wand j1 m2 T3 | 3.474e-04 | 5.910e-03 | 17x |
| wand j2 m5 any | 4.763e-07 | 7.772e-07 | 1.63x |

The frontier also got longer — `j2 m5 T1` went from **1 row to 5**, `j2 m4 T3` from 6 to 15 — which is
the point: an orb strength is a cost↔probability trade, so each one that survives is a real choice the
panel can offer. The dearest row's per-attempt cost rose in step (356 ex → 2,673 ex on `j2 m4 T3`).

Note the **any-tier** row. It moved 1.63x, and it is the reason this must NOT reuse `legalOrbTiers`:
that function reads `tiers[minTierIndex].ilvl` (≈1 for an any-tier target), finds every strength floor
above it, and concludes `['base']`. But a Greater orb is legal on an any-tier target — a better tier
still satisfies "any tier or better". Reusing it would have shipped the whole axis as a no-op for the
commonest from-item target there is. `leverOptions` filters on `p > 0` instead, which is exact and
needs no guess. **The same hole is live in `optimizePareto`, which reports `full` — "tried every orb
strength" — on any-tier crafts where it tried one.** See TODO.

### 5. The carried frontier does not blow up

Measured over three real 5-target crafts, 72,900 backward DP steps each:

| targets | peak carried frontier | cap |
|---|---|---|
| T1 | 6 | 256 |
| T3 | 11 | 256 |
| any tier | 9 | 256 |

A contraction argument says why, rather than luck: subtracting two extensions gives
`E'_a − E'_b = (E_a − E_b) − (c/p)·(1/T_b − 1/T_a)`, so every step that costs anything erodes the gap
between two incomparable points until one dies. `MAX_FRONTIER` has never been observed to bind; when it
does it sets `truncated`, because a capped frontier is a SUBSET and the app must say so.

### 6. The regression, and where it actually lives

`alternativesFromItem` runs one from-item search per relaxed node, then `planCostCdf` per frontier plan
per node. Interleaved, `maxNodes: 200`:

| craft | old | new | |
|---|---|---|---|
| T3 3-target | 8,714 ms | 11,132 ms | **0.78x** |
| T1 3-target | 9,229 ms | 12,247 ms | **0.75x** |
| T3 4-target | 39,430 ms | 34,140 ms | 1.15x |

A 25–33% regression on the 3-target shapes. Diagnosed rather than assumed:

| costCells | old | new | plans handed to `planCostCdf` |
|---|---|---|---|
| 200,000 (shipped default) | 8,802 ms | 10,699 ms | 1,120 → 1,447 |
| 2,000 | 1,213 ms | 1,283 ms | 1,120 → 1,447 |

**`planCostCdf` is 86% of a from-item alternatives run** — 8,802 ms falls to 1,213 ms when the cell cap
drops 100x. The planner itself accounts for 70 ms of the 1,897 ms difference; the rest is 327 extra
frontier rows (+29%, the widened search doing its job) multiplied by a CDF that is running a
200,000-cell fallback sweep. Fixed the same day — see the next entry, which also corrects the cause
stated here.

> **Correction (2026-09-01, same day).** This paragraph originally continued: "`exactQuantum` fails on
> the live sheet — 4.796, 8.561, 98.47, 0.9274 are not commensurable at ≤6 dp". That was inferred from
> `exact: false`, not measured, and it is wrong. `exactQuantum` SUCCEEDS on these plans, returning
> 0.001 at d=3. `exact` is false because `budget / quantum` is then 5,000,000 cells, 25x over the
> 200,000 cap. Same symptom, different cause, and the fix that follows from each is different.

### 7. A latent mispricing this armed, fixed first

`currencyKey` gated its `_greater`/`_perfect` suffix on transmute/augment/regal/exalt — **chaos was not
on the list** — while `chaosProbability` had forwarded the ilvl floor to `exaltProbability` all along.
So a tiered chaos landed at better odds and billed at the base price: 33.39 ex instead of 2,058 ex for a
Perfect Chaos, a **62x underquote**. And `allowsStep` reads the same key, so a player excluding Perfect
Chaos Orbs — a row the UI offers, and the example `cost.ts` cites — would have been handed a plan built
on them. Inert while no planner emitted one; chaos is this planner's main transform, so it shipped
separately and first.

## The cost CDF was 86% of a near-miss search, spent proving plans lose (2026-09-01)

`searchAlternatives` picks each node's best plan by `P(finish in budget)` over its whole frontier — the
cheapest plan is not automatically the likeliest to land inside a budget, so the scan is necessary. But
`planCostCdf` costs ~7 ms per plan at the shipped cell cap, and this ran on **1,447 plans across 200
nodes** to report one winner each.

### What it is NOT

Two plausible causes were checked and killed before anything was built.

**It is not incommensurable prices.** `exactQuantum` succeeds on live plans, returning **0.001 at
d=3**. `exact` comes back false because `budget / quantum` is then **5,000,000 cells** at a 5,000 ex
budget, 25x over `DEFAULT_COST_CELLS`. The first draft of TODO 5c blamed the prices; that was inferred
from the `exact` flag rather than measured.

**It is not an over-large cell cap.** Lowering it is the obvious fix and it does not work, because the
bracket has to be narrow enough for `fmtPct(lower)` and `fmtPct(upper)` to render the same string —
otherwise the panel prints "1.2%–1.3%" where it used to print a number. Measured on live plans at a
5,000 ex budget:

| cells | bracket width | ms/plan | renders as |
|---|---|---|---|
| 200,000 | 3e-6 – 4e-5 | 6.4–8.8 | one number |
| 50,000 | 2e-5 – 1.6e-4 | 1.6–2.2 | a range on some rows |
| 20,000 | 5e-5 – 3.9e-4 | 0.6–0.8 | a range on some rows |
| 5,000 | 2e-4 – 1.7e-3 | 0.0–0.2 | a range |
| 2,000 | 5e-4 – 2.3e-2 | 0.0–1.0 | a wide range |

One row needed the full 200,000 to collapse to a single percentage. So the default is well chosen for
the number the app prints, and the waste was never the resolution — it was spending full resolution on
plans that could not win.

### Screen, then settle

`bestByBudget` brackets each plan on a grid a tenth as fine, then settles only the plans that could
still win. The skip is exact and needs no assumption about the two grids lining up: `planCostCdf`
returns a bracket AROUND the true value at any cell count, so `settle(x).lower ≤ truth(x) ≤
screen(x).upper`, and a plan whose screening ceiling is below a rival's settled floor is beaten
outright.

Interleaved, medians of 3, `maxNodes: 200`, rows compared byte-for-byte:

| craft | unscreened | screened | |
|---|---|---|---|
| T3 3-target | 11,047 ms [11132, 11047, 10991] | **3,027 ms** [3027, 3027, 3097] | **3.65x** |
| T1 3-target | 12,009 ms [11981, 12009, 12250] | **3,539 ms** [3530, 3625, 3539] | **3.39x** |
| T3 4-target | 33,394 ms [33348, 33394, 33407] | **18,595 ms** [18831, 18523, 18595] | 1.80x |

Every `inBudget` / `inBudgetMax` / plan identical to 12 decimal places. Taken with the orb-strength
work the same day, the 3-target from-item alternatives search is **2.9x faster than before either
change** (8,714 ms → 3,027 ms) while now also searching every orb strength.

### The asymmetry is the whole argument, and it needed extracting to test

The ceiling must come from the screen and the floor from a settled sweep. Pruning on the screen's own
`lower` compares two bounds that do not bracket each other and can cut the true winner.

That mutation **survived every end-to-end test**, because on real data the screening bracket is a few
parts in ten thousand — tight enough that the wrong comparison picks the same plans anyway. So the rule
was extracted into `bestByBudget`, which takes its two scorers as arguments, and the test injects a
deliberately useless screen (`[0, 1]` for everything) and a valid-but-backwards one. Both now fail the
mutation. **A guarantee that cannot be made to fail on real data has to be tested somewhere it can.**

## The from-white planner adopts the lever DP, and loses a dial that did nothing (2026-09-01)

`paretoForOneCraft` built `permutations x orbAssignments`, expanded each into its omen power set, and
scored the lot — a `K! x Π|strengths| x 2^omens` product, rationed by `maxPlans` picking a coarser
orb-strength DEPTH when the estimate grew. Replacing that with `searchSkeletons` leaves only the
orderings to enumerate.

### It is faster nearly everywhere, and dramatically so where it was slow

Interleaved within each rep against the previous planner, medians of 3, Wands at ilvl 82:

| craft | old | new | | old depth |
|---|---|---|---|---|
| 5 tgt T3 | 464 ms [473, 456, 464] | **7 ms** [6, 7, 7] | **66.3x** | full |
| 4 tgt T1 | 28 ms [28, 40, 28] | **1 ms** [1, 1, 1] | **28.0x** | full |
| 5 tgt T1 | 131 ms [130, 131, 153] | **6 ms** [6, 5, 6] | **21.8x** | base+strongest |
| 4 tgt T3 | 19 ms [21, 19, 18] | **1 ms** [1, 1, 1] | **19.0x** | full |
| 6 tgt T3 | 73 ms [77, 73, 63] | 45 ms [44, 45, 45] | 1.62x | strongest-only |
| 6 tgt T1 | 63 ms [60, 65, 63] | 44 ms [43, 45, 44] | 1.43x | strongest-only |
| 6 tgt any | 78 ms [88, 70, 78] | 49 ms [61, 49, 48] | 1.59x | full |
| 4 tgt any | 1 ms [3, 1, 1] | 3 ms [5, 1, 3] | 0.33x | full |

The 6-target crafts gain least because they are skeleton-bound (720 orderings), not lever-bound; the
sub-5 ms rows are noise. Every craft now reports `full`.

### The answers improved, and by more than the timings

The throttle was not merely slow — where it bit, it deleted rows. `strongest-only` drops BASE strength,
and `legalOrbTiers` was suppressing the axis entirely for any-tier targets while the badge said "tried
every orb strength".

| craft | cheapest plan, old → new | surest, old → new |
|---|---|---|
| 6 tgt T1 | 42,683,000,412 → **2,470,362,374** (−94%) | unchanged |
| 5 tgt T1 | 54,217,303 → **18,259,582** (−66%) | unchanged |
| 6 tgt T3 | 3,522,806 → **2,486,398** (−29%) | 7.49e-8 → **1.72e-7** (2.3x) |
| 5 tgt any | 9,054 → **3,513** (−61%) | 6.64e-5 → 1.00e-4 (1.5x) |
| 4 tgt any | 1,485 → **570** (−62%) | 4.02e-4 → 6.06e-4 (1.5x) |
| 2 tgt any | 10.57 → **4.29** (−59%) | 1.86e-2 → 4.51e-2 (2.4x) |

The any-tier rows are the `legalOrbTiers` bug, and the reason they get **cheaper** is worth stating
plainly: on the live sheet a **Greater Transmute costs LESS than a plain one** (0.1333 against 0.1775),
as does a Greater Augmentation (0.07389 against 0.2699). So on many crafts the stronger orb is both
likelier and cheaper — strictly better — and the search was refusing to consider it at all.

That also explains a frontier with no base-strength step on it, which looks like a throttle and is not:
on a craft whose targets all sit at ilvl 25-60, base is genuinely dominated. `pareto.test.ts` pins that
base SURVIVES on a craft where it earns its place, which is the assertion that distinguishes the two.

### A test had pinned the bug, with a false reason attached

`pareto.test.ts` carried:

> `it('an any-tier target uses only a base orb (stronger orbs would reject tiers you accept)')`

The parenthetical is the whole error. A stronger orb raises the ilvl FLOOR of what it can roll, and a
higher tier still satisfies "any tier or better" — so a Greater orb is legal on an any-tier target. The
test asserted a one-row frontier and passed for as long as the bug existed, which is what a test
written from the implementation's reasoning rather than the game's will do.

### `maxPlans` is gone from the effort ladder

It selected an orb-strength depth. There is no depth left to select, so it moved nothing — and a dial
that does nothing does not belong on a control that promises the user it will. Removed from
`EffortLimits`, the three presets, `OptimizeParetoOptions` and `AlternativesOptions.maxPlansPerNode`.

Two things fell out of that:

- **`OptimizeParetoOptions.maxMillis` had never been read on the from-white path.** It was declared,
  documented ("Hitting it sets `truncated`"), and used by no code. `searchSkeletons` honours it, so the
  lab step planner has a clock for the first time — and `solve.ts` hands it the preset's, as a ceiling
  rather than a reservation, since the model still takes the remainder via `clockLeft()`.
- **`alternativesFromItem` never had a plan cap either**, and now cannot want one.

`optimize.ts` lost 113 lines: `orbAssignments`, `reduceOrbTiers`, `legalOrbTiers`, `strengthUsable`,
`ORB_TIERS`, `ADD_CURRENCIES`, `withOmenVariants` and the `estimate`/depth ternary. `CurrencyDepth`
survives because `DEPTH_RANK` still merges runs, but every planner now reports `full`.

## An Augmentation the planner could not spend, and a Chaos axis not worth having (2026-09-01)

Two small items from TODO 4 and 5d. One shipped, one was built and reverted on its measurement.

### The Augmentation step (TODO 4) — shipped

`baseTransforms` emits chaos/annul/exalt and no `augment`, so the only way the from-item planner could
add a mod to a MAGIC item was the Regal that converts it to Rare. Openers now cover the whole add
chain: Regal, Augmentation, and Augmentation-then-Regal.

It is a genuine cost-probability trade rather than a missing cheap option. On a Magic item holding one
prefix, an Augmentation must land a SUFFIX — the prefix side is full at one — so it draws from the
suffix pool alone, where a Regal draws from both sides. Likelier, and dearer for it: 0.2699 against the
Regal's 0.1977.

**TODO 4's stated reason was wrong on both halves**, which is worth recording. It read "for a 2-mod
target an Augment would be cheaper, and the planner cannot express it". An Augmentation is DEARER than
a Regal on this sheet, so "cheaper" was the wrong reason to want it; and the test pinning the gap used
a two-PREFIX target, which a Magic item cannot hold at all — so on that craft the Regal is required by
a game rule and no Augmentation could ever have helped. The gap was real; the example was not.

That test now asserts the rule it was actually demonstrating, and a second one covers the prefix+suffix
case where the Augmentation does apply and finishes the craft in one step.

### The MDP's Chaos strength axis (TODO 5d) — built, measured, reverted

`chaos_greater` and `chaos_perfect` are real listings, the engine has always honoured the floor, and
`currencyKey` prices them correctly since earlier the same day — so the linear planner searches them
and the MDP did not. The matching `strength` axis was built and then reverted.

Interleaved, medians of 3, six crafts (2 and 3 targets, any/T3/T1, two held junk mods):

| craft | axis off | axis on | | answer |
|---|---|---|---|---|
| 3 tgt T1 | 1,778 ms [1664, 1851, 1778] | 2,690 ms [2370, 2690, 2982] | **0.66x** | identical, 164,682.69 exact |
| 3 tgt T3 | 689 ms [742, 672, 689] | 961 ms [961, 983, 955] | 0.72x | identical, 28,377.16 exact |
| 3 tgt any | 131 ms [144, 131, 129] | 182 ms [182, 210, 181] | 0.72x | identical, 2,684.76 exact |
| 2 tgt T1 | 213 ms [223, 213, 205] | 289 ms [296, 289, 284] | 0.74x | identical, 19,362.79 exact |
| 2 tgt T3 | 78 ms [81, 78, 61] | 85 ms [103, 84, 85] | 0.92x | identical, 3,782.28 exact |
| 2 tgt any | 39 ms [59, 39, 33] | 47 ms [64, 47, 47] | 0.83x | identical, 904.15 exact |

**1.2-1.5x the solve time, and not one answer moved.** The MDP is the app's slowest component and its
headline number, so slower means more crafts return a ceiling rather than an exact cost at a given
effort. That is a real loss against a benefit that measured exactly zero.

The prices explain it: a Greater Chaos is 2.95x the price of a plain one for at most ~2.6x the odds, a
Perfect 61.6x for at most ~4.5x. The model was paying to prove what the sheet already implies.

**It is the PRICES that decide this, not the mechanics**, so the trade should be re-measured if they
move. The pricing half stays shipped, and `costConsistency.test.ts` carries the reasoning next to the
pair that would need adding back.

Two findings survive the revert. The exclusion regression test had to grow `chaos_greater` and
`chaos_perfect` to keep passing — a strength axis is also an exclusion surface, and "exclude chaos"
stops meaning "exclude every chaos" the moment one exists. And `pusher` folds only IDENTICAL outcome
distributions, so it cannot absorb a strength that differs in distribution but loses on price; the
principled fix would be a dominance rule over distributions, and there is no cheap one.

## Clearing the last of the backlog: three checks, two of them negative (2026-09-01)

### `CurrencyDepth` deleted — one reachable value is not a report

The field named which orb strengths a search had settled for, and its badge said so. With both planners
searching every strength there was one value left, so a four-way type and a badge that could only ever
say one thing were noise where they had been information. Removed from `optimize.ts`, `alternatives.ts`,
`engineTypes.ts`, `engineMap.ts`, `solve.ts` and `FrontierView.tsx`, along with `DEPTH_RANK` and the
depth-merging in both `mergeParetoRuns` and `mergeAlternativeRuns`. `evaluate` in `alternatives.ts`
dropped its wrapper object and returns `Alternative | undefined`.

The claim itself survives as static text on the "checked N plans" line, which is where a reader asking
"how hard did it try" is already looking — and it stays gated on a search having run, so a planner that
DECLINED reports 0 plans and makes no claim about orbs it never looked at.

### The MDP's Magic start was already done, and the TODO saying otherwise was stale

TODO 4 carried: "the MDP does not model a Magic START as a distinct node", blocked on "the state key has
no rarity, so a Magic start encodes identically to the Rare state with the same mods" and "`stateLabel`
would render both identically".

Both describe a design superseded when rarity entered the state. Measured:

| start | feasible | cost | bound | policy states | rungs | first key |
|---|---|---|---|---|---|---|
| Magic | yes | 1,552.19 | exact | 397 | magic, rare | `0:0:0:0:0:1` |
| Rare | yes | 1,426.68 | exact | 357 | rare | `0:0:0:0:0:2` |

The key ends in a rarity code, so the two never collapse; the Magic craft spans both rungs and costs
more, which is the direction that makes sense since the item has to be opened first. And `stateLabel`
does not exist anywhere in the repo — the note named a function that was never written.

**It survived a rewrite of the section around it because it was copied rather than checked**, which is
the failure a behavioural test closes and a comment does not. Pinned now in `markovFromItem.test.ts`.

### tailwind-merge stays — the hypothesis was false

TODO 6 proposed dropping tailwind-merge (8.8% of the bundle, ~10 kB gzip) for bare `clsx`, "if nothing
actually relies on conflict resolution". `cn()` has exactly three call sites, and **two of them do**:

| call site | conflicting pair | why |
|---|---|---|
| `<Badge variant="outline" className="border-amber-500/60 …">` | `border-input` vs `border-amber-500/60` | both border COLOUR |
| `<Badge className="text-[10px]">` | `text-xs` vs `text-[10px]` | both font SIZE |
| `PolicyGraph`'s coverage buttons | none | `border` is a width, `border-primary/60` a colour |

"Just order the classes correctly" is not an escape: both members of each pair are emitted at the same
specificity, so the winner is decided by TAILWIND'S output order rather than by the `class` attribute.
Dropping the loser is the only reliable way to make the caller's intent win — which is precisely what
tailwind-merge does and `clsx` does not.

Pinned in `src/lib/utils.test.ts` with the real class strings, so the audit does not need re-running and
a swap fails the suite rather than quietly breaking the amber "stopped early" badge.

## Belts, and the weight table that still needs a human (2026-09-02)

41 bases → 42. Belts plan on both models: the step planner returns a 3-row frontier
(`transmute → augment`) and the MDP returns `bound: 'exact'` at **7.99ex** on a 2-mod craft at ilvl 82.

**Why ONE base rather than 20.** All 20 of RePoE's belt bases carry a byte-identical craftable pool —
166 mods, the same `mod → tier → ilvl` map across all three tag groups (`belt,default`,
`runeforged,belt,default`, `not_for_sale,demigods,belt,default`). They differ only in `drop_level` and
in their implicit, and an implicit is fixed on the base rather than rolled. This matches Amulets and
Rings, which have always shipped as one base each.

**Weight coverage.** poe2db filled 100.0% of normal tiers after `apply_weights.mjs` learned the
category (97.9% before — the missing third of three category maps). Zero-weight mods are exactly the
essence and perfect-essence ones, which is correct and matches Amulets and Rings:

| category | total mods | normal | desecrated | essence | perfect | zero-weight |
|---|---|---|---|---|---|---|
| Amulets | 80 | 33 | 31 | 7 | 9 | essence 7, perfect 9 |
| Rings | 67 | 31 | 22 | 7 | 7 | essence 7, perfect 7 |
| **Belts** | **53** | **18** | **21** | **6** | **8** | essence 6, perfect 8 |

### The belt normal pool, for cross-checking

**NOT YET CROSS-CHECKED against Craft of Exile.** CoE is client-rendered and `scripts/coe-verify.mts`
takes hand-entered numbers, so this needs a browser — outstanding, and listed under "Still deferred".
The table is here so the comparison is quick when someone does it.

| side | mod | top-tier weight | tiers | ilvl range |
|---|---|---|---|---|
| prefix | BeltFlaskLifeRecoveryRate | 800 | 6 | 1–75 |
| prefix | BeltFlaskManaRecoveryRate | 800 | 6 | 5–63 |
| prefix | BeltIncreasedCharmDuration | 800 | 5 | 8–75 |
| prefix | IncreasedLife | 1000 | 10 | 1–65 |
| prefix | IncreasedMana | 1000 | 9 | 1–60 |
| prefix | PhysicalDamageReductionRating | 1000 | 10 | 1–80 |
| prefix | ThornsPhysicalDamage | 1000 | 7 | 1–74 |
| suffix | BeltIncreasedCharmChargesGained | 800 | 6 | 2–81 |
| suffix | BeltIncreasedFlaskChargesGained | 800 | 6 | 2–81 |
| suffix | BeltReducedCharmChargesUsed | 800 | 6 | 3–81 |
| suffix | BeltReducedFlaskChargesUsed | 800 | 6 | 3–81 |
| suffix | ChaosResistance | 250 | 6 | 16–81 |
| suffix | ColdResistance | 1000 | 8 | 1–82 |
| suffix | FireResistance | 1000 | 8 | 1–82 |
| suffix | LifeRegeneration | 1000 | 9 | 1–68 |
| suffix | LightningResistance | 1000 | 8 | 1–82 |
| suffix | Strength | 1000 | 9 | 1–81 |
| suffix | StunThreshold | 800 | 10 | 1–72 |

Internal consistency is encouraging while that check is outstanding: Chaos Resistance sits at 250
against 1000 for each elemental resist, the same ~1:4 ratio Rings shows (1500 against 8000).

### A latent mispricing found on the way

`BONE_BY_CATEGORY` (`probability.ts`) listed "Amulet, Ring or Belt" in its comment while having no
`Belts` entry, and `desecrationBoneFor` falls through to `?? 'rib'`. So the day belts landed, a belt
Desecration would have been charged the ARMOUR bone — 0.41ex against the collarbone's 4.69ex on the
2026-09-02 sheet, an 11x underquote — and `bossOmenAllowed`, which is defined as "not rib", would have
silently refused the boss omens the game does allow on a belt. Found by checking the map rather than
reading the comment; fixed in the same commit that added the category.

## Omen of Whittling: the spec had the mechanic wrong (2026-09-02)

TODO 12 described the Omen of Whittling as making an **Orb of Annulment** remove the lowest **tier**
modifier. Both halves are wrong. Traced to poe2db:

> *"While this item is active in your inventory your next **Chaos Orb** will remove the **lowest level**
> modifier"* — `Metadata/Items/Currency/OmenOnChaosLowestLevelMod`

It is a CHAOS omen, and it works on item LEVEL. That second point resolves an ambiguity the section
worried about: tier numbers are per-mod and not comparable across mods (a T5 of a five-tier mod is its
worst roll; a T5 of a ten-tier mod is mid-range), so "lowest tier" would have had no well-defined
meaning on an item carrying both. Item level is one scale for the whole item.

The same trace produced the full 45-omen list, which also settles a question left open on 2026-09-01:
the chaos side-omens DO exist (**Sinistral / Dextral Erasure**, "remove only prefix/suffix modifiers"),
but they constrain what the orb REMOVES, where `PlanStep.chaos.constrainTo` tunes what it ADDS. So the
inert field is still not priceable as an Erasure omen — see TODO 12c.

**Prerequisite, fixed first and pinned by a test written to fail.** `addMod` placed every mid-plan add
at `tierIndex 0`, the lowest ilvl a mod has, regardless of the step's `minTierIndex`. Harmless while
no probability read a walked tier; fatal for Whittling, since everything a plan added would have tied
for lowest level. Placing at `minTierIndex` is the worst tier that still satisfies the target, so the
model never flatters a plan.

**Measured behaviour**, on a Wand holding three mods with one at its lowest tier: an unomened Chaos
removes that mod 1 time in 3, Whittling takes it every time — the option costs the orb plus the omen
and buys exactly **3x** the chance, because only the removal factor moves. Where the named removal is
NOT the lowest-level mod the option scores 0 and never reaches the DP.

**Shipped dormant.** `OmenofWhittling` has no `omenQuotes` entry and `stepCost` charges 0 for a
missing key, so the lever is gated on the omen having a price — ungated it would have come back free
and dominated every chaos step it touched.

### The one assumption

Where several mods share the lowest level, the game's tiebreak is **untraced**. Uniform among the tied
is modelled, matching every other pick-among-equals in this engine (an unomened Annulment, a
boss-omened Desecration). It is also the conservative direction for the common case: a plan whittling
junk off gets a LOWER probability than a deterministic tiebreak in its favour would give it. Listed
under "Still deferred" until someone can confirm it in game.

## poe.ninja serves omens after all — under `type=Ritual` (2026-09-02)

The sheet hand-transcribed 13 omen quotes for months on the belief that poe.ninja has no omen
endpoint. That belief was HALF right, and the wrong half was never tested: `type=Omens` really does
return byte-identical output to `type=NonsenseXYZ`, and the Omens page really is client-rendered with
no `__NEXT_DATA__` or equivalent to scrape. But **omens are Ritual content in PoE2**, and
`type=Ritual` returns 38 lines of which **36 are omens** — every key this sheet uses, plus Whittling —
with `volumePrimaryValue` and a sparkline like any other line.

Found by enumerating the type values rather than by guessing better: of 17 tried, ten are valid
(Currency 51, Runes 132, Essences 76, Ritual 38, SoulCores 35, Breach 28, Delirium 26, Fragments 25,
Expedition 23, Abyss 15). Cross-checked against poe2db, which quotes Whittling at 11.4 divine against
poe.ninja's 11.7 — two independent sources agreeing.

**Why it mattered more than a chore removed.** Omens are an ADDITIVE surcharge 20-27x the orb they
modify, so a drifted omen:orb ratio changes which plans the optimizer recommends rather than only what
it says they cost. Against the 11-day-old transcription:

| omen | transcribed 22 Aug (ex) | live (ex) | factor |
|---|---|---|---|
| Sinistral Annulment | 4,837 | 7,068 | 1.5x |
| Dextral Crystallisation | 199.9 | 107.7 | 0.5x |
| **Greater Exaltation** | **11.9** | **2.33** | **0.20x** |
| Sinistral Necromancy | 1.157 | 2.051 | 1.8x |
| **Whittling** | *(absent)* | **4,731** | — |

`omenQuotes` stays as a fallback for anything the feed cannot price, under the same units/day depth
gate as the currencies: 2 of 14 fall back today — the Blackblooded at 23/day and the Sovereign at 7 —
and the staleness warning is now scoped to those rather than fired on every run.

**A test moved because of it, and the move is the interesting part.** `solve.test.ts`'s "policy
iteration answers where value iteration can only bound" asserts a fact about the SOLVERS, but whether
a given craft is hard enough to separate them depends on what the orbs cost. With omens live the
craft became easy enough that VI settled it too, so the test failed while its claim stayed true. It
reads `loadFrozenPrices()` now, like the other price-pinned tests.

## The league-rollover zero, found by asking what happens on day one (2026-09-02)

A fair worry: on the first days of a new league, prices are thin or absent — so does the optimizer
start recommending things that are only cheap because nobody has traded them yet? Checked rather than
reassured, and the answer split three ways.

**Currency and bones are SAFE.** The refresh starts from `{...prev.prices}` and `continue`s past a
line the feed does not carry, so a missing orb keeps its previous price. Stale, never free.

**Omens are safe.** They fall back to `omenQuotes` under the units/day depth gate.

**Essences were NOT.** The refresh DELETES every `essence*` key and rebuilds them from the feed, and
the per-level fallbacks (`essence_lesser`, `essence`, `essence_greater`) are written only when a
median exists. With no essence trades those keys simply vanish — and `stepCost` reads
`prices.currency[key] ?? 0`, so an absent key is not "unavailable", it is a **free essence**, which
dominates every frontier it can reach. Confirmed by building a sheet with the keys stripped: a Greater
Essence and a Perfect Essence both priced **0**.

Three changes:

1. **Never delete a price you cannot replace.** Essence keys the new run could not price now keep
   their previous value, matching what the currency loop always did, and the run says how many.
2. **A league change blocks the auto-merge by name**, rather than being inferred from price movement.
   `prev.league !== league` is exact and free, and early-league prices are the single most predictable
   way this sheet goes wrong — "probably caught by the depth checks" is the wrong standard for it.
3. **A no-free-price guard in `priceResolution.test.ts`**, which is one of the two tests the refresh
   runs before merging, so a sheet that lost a key cannot reach the site unseen. Mutation-checked:
   deleting `essence_greater` turns it red.

Worth being clear about what is NOT fixed, because it cannot be: if an orb genuinely trades at 5ex on
day two because nobody has found any yet, the optimizer will use it, and it is right to — that is what
the orb costs that day. The guards above are against prices that are ABSENT or unbacked, not against a
market that is simply young.

## Shipping the patch data: the split loses to the strip (2026-09-02)

TODO 13 asked to split `mods.json` into a solver half and a display half, so the Worker could start
before the labels finished downloading. Its premise was that "37% of it is display-only, fields the
Worker never reads". Both halves of that turned out to be wrong, and measuring the alternative made
the split unnecessary rather than merely unattractive.

**The Worker reads the "display" fields.** `tiers[].ranges` is read by `valueRatio`
(`alternatives.ts`) to score how much of the asked-for stat a relaxed tier still guarantees — solver
data by any definition. And `text` is read by `engineMap`, which runs **inside** the worker: every
result the worker returns is mapped to UI shapes before it is posted. So the clean split the TODO
described was not available; the worker needs both.

**What is actually unread is not display data — it is dead data.** `group`, `field`, `categories`
and `tiers[].stats` are read by nothing in `src/` or `packages/`, production or otherwise. They
appear only in the type and in test fixtures. `stats` alone is 575,841 raw bytes.

**And the transfer numbers were being read off the wrong compressor.** The TODO quoted 238 kB gzip.
Vercel serves the asset brotli-compressed; `poe2htc.com` returns 137,701 bytes for it, which
`brotliCompressSync` reproduces exactly at **quality 3, lgwin 19** — so that is the setting every
number below is measured at, rather than a default quality 11 that would flatter every option by ~3x.

### The comparison

| shipped as | raw | wire (br q3/w19) | `JSON.parse` |
|---|---|---|---|
| today — pretty, all fields | 3,211,239 | **137,701** | 6.15 ms |
| minified only | 1,531,678 | 104,414 | 5.4 ms |
| pretty, dead fields dropped | 2,335,632 | 89,420 | 6.5 ms |
| **minified + dead fields dropped** | **988,070** | **65,013** | **3.32 ms** |
| the TODO's solver half (no `text`, no `ranges`) | 728,900 | 44,240 | 2.3 ms |
| …plus its display companion | 201,650 | 19,729 | 0.3 ms |

The last two rows are the finding. Even granting the split were possible, it costs **74,015** wire
bytes against one file's **65,013** — worse, because splitting duplicates the id column across both
files and hands brotli two smaller corpora instead of one. The simpler change is strictly the bigger
win, so there is no second fetch, no half-loaded state, and no interval where the picker renders mod
ids. TODO 13 is closed as **done differently**, not deferred.

### Shipped

- `Mod` and `Tier` (`types.ts`) no longer declare the four dead fields. That is the load-bearing part:
  the data file keeps them, and the type is now the app's contract, so a stripped field cannot be read
  by accident — it is a compile error everywhere, in dev as well as in a build.
- `shipMods.ts` projects a parsed `mods.json` onto exactly that contract and minifies it. Typed
  `ModsFile -> ModsFile`, with `: Mod` / `: Tier` annotations on the two `.map` callbacks — verified
  by mutation that omitting `tags` and that adding `group` or `stats` are each a `type-check:engine`
  failure. (Contextual typing through `.map` alone does **not** run excess-property checking; without
  those annotations only the first direction was caught.)
- `shipPatchData` (vite.config.ts) applies it to the emitted asset, and minifies the other two.
- `dataIntegrity.test.ts`'s group/field invariant now reads the raw file, which is what it was always
  really asserting — the RePoE join is a property of the import, not of the engine's model.

### The hash had to move with it

Rollup fixes an asset's content hash **before** `generateBundle`, so the first working version shipped
988 kB under the byte-identical filename `mods-BfEpI_vg.json` that the live site already serves for
the 3.1 MB version. Harmless on the day — but `immutable, max-age=31536000` means the day someone adds
a field to `Mod` and to the projection **without** the data changing, the URL does not turn over and
every returning browser keeps an asset missing that field. Silent, and exactly the class of bug this
project spends its time on.

So `assetFileNames` is a function that hashes the bytes the build will actually write, sharing one
`shippedJson` helper with the rewrite so a name can never describe bytes nobody emitted. Mutation-
checked: dropping `tags` from the projection moves the asset `mods-z68ZDNnb` → `mods-FDp1al5J`.

### Result

| | live today | after |
|---|---|---|
| `mods.json` | 137,701 | 65,013 (−52.8%) |
| `base_items.json` | 14,132 | 13,142 (−7.0%) |
| `prices.json` | 7,567 | 7,444 (−1.6%) |
| patch data total | 159,400 | **85,599 (−46.3%)** |
| first load, incl. the 118,123-byte JS entry | 277,523 | **203,722 (−26.6%)** |

`JSON.parse` of the mods file: **6.15 ms → 3.32 ms** (median of 9). The five browser smoke tests pass
against the stripped `dist/` — a real Chromium cold load, a Lab compute and an Item compute — which is
the end-to-end licence that nothing the app reads was thrown away.

**Not done, deliberately:** `tiers[].stats` is the named route to cross-family similarity in
`alternatives.ts`'s header. It stays in the file; the day that feature is built it goes back into
`Tier` and into the projection, and the asset gains ~11 kB. Dropping it from the wire costs that
feature nothing today.

## Omen of Greater Exaltation, in the step planners (2026-09-02)

**"While this item is active in your inventory your next Exalted Orb will add two random modifiers"**
— poe2db, internal id `OmenOnExaltAddTwoMods`. 2.331 ex on the sheet, cross-checked against poe2db's
own 2.7 ex. TODO 14.

### Two rulings, both flagged as rulings

- **A Greater or Perfect Exalted Orb can carry the omen.** The item text says "your next Exalted
  Orb", and a Greater Exalted Orb is its own BaseType (`CurrencyAddModToRare2`, "Minimum Modifier
  Level: 35" — which matches the engine's `CURRENCY_FLOOR.greater` exactly), so the text does not
  settle it. **User ruling, 2026-09-02.** It is what gives the step a strength axis; without it the
  step would be plain-orb only. Modelled, not observed.
- **The one-open-slot case is not modelled at all.** What the game does with a half-spendable omen is
  untraced. `greaterExaltProbability` returns 0 there, and the recursion is what says so — an explicit
  `free < 2` guard was written and DELETED, because no mutation could distinguish it. The move is
  dominated wherever it would be legal (it can only land what a plain Exalt lands, with 2.331 ex on
  top), so nothing is lost and nothing is claimed.

### One recursion, two currencies

`alchemyProbability`'s four-draw recursion became `multiDrawProbability`, parameterised by draw count,
starting item and ilvl floor; alchemy is four draws onto a white base and this is two onto the Rare
you hold. The alchemy differential fixtures did not move a digit, which is the licence for the
refactor.

The one genuinely new rule is the tier gate. **A target landing at too LOW a tier is a failure, not a
retry** — its family is spent, so the craft can no longer reach the tier it asked for. A needed mod
therefore advances only on its at-or-above-tier weight while occupying its family on its FULL weight.
Mutation-checked: collapsing the two makes the tier test go red.

Validated against Monte-Carlo on the shipped 0.5.0 Wands pool (400k runs, three mod pairs plus a
Greater-orb floor), with the simulation written from the item text and sharing no code with the
function it checks.

### Why it can win, being dearer

A plan is a fixed sequence, so two Exalts commit to an order: A then B. One omened orb gets BOTH
orders, because its two draws are unordered. Up to 2x the probability for 1.67x the price
(1 + 2.331 ex against 1 + 1 ex). Measured on Wands at ilvl 82, omen priced out vs in:

| craft | cheapest expected | best P/attempt | frontier rows using it |
|---|---|---|---|
| from white, 5 targets | 2,019.08 → 2,019.08 | 0.008756% → 0.008756% | 0 of 8 |
| from white, 6 targets | 117,053 → **77,774** (−33.6%) | 0.0002081% → 0.0002638% | 4 of 4 |
| from white, 6 targets **T1** | 4.040e9 → **2.349e9** (−41.9%) | — | 5 of 5 |
| held 1 mod, want 3 | 265.61 → 265.61 | 1.997% → **2.266%** | 2 of 6 |
| held 1 mod, want 4 | 1,720.71 → 1,720.71 | 0.2857% → **0.3344%** | 3 of 6 |
| held 2 mods, want 4 | 214.06 → 214.06 | 1.800% → 1.800% | 0 of 4 |

Two shapes of win, and they are different: from white it makes the craft **cheaper**; from a held item
it makes a **surer** route exist that did not before. The rows that show no change are honest —
offered, ranked, and beaten on price.

**From white the route needs FIVE targets before it can exist at all**, because the add chain is
transmute → augment → regal → exalt…, so there is no adjacent Exalt pair below five. That is why the
2-target craft above searched byte-identically.

### Cost of the widened search

Interleaved, 5 reps, medians (per CLAUDE.md's ~40% spread rule):

| craft | off | on | |
|---|---|---|---|
| white 5 targets | 8.5 ms | 14.0 ms | 1.64x |
| white 6 targets | 48.7 ms | 104.6 ms | 2.15x |
| white 6 targets T1 | 44 ms | 96 ms | 2.16x |
| item held 1 want 4 | 0.6 ms | 0.9 ms | 1.45x |
| item held 1 want 5 | 1.4 ms | 4.0 ms | 2.85x |

Accepted: ~2x on a planner whose worst measured craft is 105 ms, against a 42% cheaper answer on the
hardest one. Note **`plansEvaluated` grew only 8% while time doubled** — a fused skeleton has one step
where there were two, so it stands for fewer lever assignments while still costing a DP pass. The
"checked N plans" figure is a weaker proxy for time than it was.

### What is NOT done

The MDP does not have this action; only the two step planners do. Recorded in TODO 14 with the
measurement protocol, which follows the Chaos-strength precedent (built, measured, reverted).

## Still deferred
- **Confirm the Omen of Whittling TIE rule in game** (2026-09-02): when two or more modifiers share
  the lowest item level, which does the Chaos Orb remove? Modelled as uniform — 50/50 on two — by the
  user's ruling rather than by observation, so it stays here until someone sees a tie resolve in play.
  (The price is no longer outstanding: poe.ninja serves omens under `type=Ritual`, so the mechanic is
  live at ~4,700ex.)
- **Cross-check the BELT weights against Craft of Exile** (added 2026-09-02, table above). CoE is
  client-rendered and `scripts/coe-verify.mts` takes hand-entered numbers, so this needs a browser.
  Every other shipped category has had this check; belts have not.
- **Resolve the baselined data findings** (16 mis-slots, 4 mixed families on 0.5; CompanionDamage +
  8 desecrated/perfect cross-source families on 0.5.0, plus `Thorns on Belts` and
  `FlaskChargeGeneration on Belts` added 2026-09-02) — domain/CoE ruling on `type` vs pool.
- ~~UI for budget alternatives~~ DONE 2026-07-17 — optional Budget field in the Engine Lab, 📌 pins on
  target rows, and an `AlternativesView` panel below the frontier. Rendering is covered by a component
  test driven by **real engine output** (`AlternativesView.test.tsx`) rather than a hand-made fixture,
  so the panel can't render a shape the engine never produces. Both flows wired (a fractured craft routes
  its alternatives through the from-item planner). The panel shows the odds bracket verbatim when
  `exact: false`, and badges "stopped early" when `truncated` (worded "search capped" until the 2026-08-22 jargon pass) — the honesty the engine reports is
  surfaced, not swallowed.
- ~~Human CoE numeric spot-check of the new pools~~ DONE 2026-07-13 — essence value ranges confirmed
  against CoE (see above). Desecrated/perfect value spot-checks beyond the sampled set remain optional.
- **Broaden CoE cross-validation beyond wands** — other bases' families/weights, tier-target and omen
  numbers. Wands is clean; the rest of the pool is the remaining Phase-3 work.
- **Confirm the assumed desecrated spawn weight (D4) — now TODO 1, not a background item.** Since a
  bone became the cheapest way to add an ORDINARY mod (2026-08-24), the assumption prices every craft
  on armour and weapons, not only carved ones: on crafts with no carved target at all it swings a
  Wands craft 995 ex → 4,074 ex across the plausible range. The same change made it observable —
  `scripts/desecrate-weight.mts` turns "how many of N bone offers held a carved mod" into a
  maximum-likelihood weight, and the candidates predict 0.02% / 20.69% / 94.35% on a Body Armour, so
  twenty bones separates them. Needs a human in the game; there is no data source. Original note:
- **Confirm the assumed desecrated spawn weight (D4).** 1000 was chosen for plausibility, not measured:
  poe2db publishes none and reports 1 for every row. It moves every unomened desecration by ~900x
  (Body Armour 1-in-121,510 → 1-in-132). The app discloses it (`assumedOdds` → `PriceBasisNote`), which
  makes it honest, not correct. **The single largest unverified number in the app.**
- **Cross-check the CHANGED mechanics against Craft of Exile.** `coe-verify` covers normal-pool weights
  (Rings / Body_Armours_int / Quivers: all MATCH as of 2026-08-23) and `coe-newpools-check` covers pool
  structure — neither touches what changed above. The unomened desecration denominator, the
  one-essence-per-item cap and the from-white perfect-essence route are backed by user rulings plus
  hand-computed tests, with no independent signal. `coe-newpools-check` writes
  `/tmp/coe-newpools-worksheet.md` for exactly this hand-check.
- **Nothing shipped since 2026-08-21 has been seen in a browser.** The Search effort selector, the
  assumption note, the "≥ x" unconverged display, the stacked mobile columns, the warm-start fetch and
  the cache headers are verified by jsdom and reading only. jsdom has no layout engine and no network,
  so responsive behaviour and caching in particular are untested by anything here.
