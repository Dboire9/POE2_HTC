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
restriction. **Action:** confirm the exact denominator shape against Craft of Exile at Phase 3
(single-slot vs both-slots; whether normal mods truly enter the bone pool at the observed rate).

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
`optimizeCost` ranks plans by **expected cost** in Exalted-Orb equivalents (`data/patches/0.5/prices.json`,
seed estimates), turning "guarantee with an essence (dear, P=1) vs roll it (cheap, retry)" into a real
decision instead of a trivial win for essences.

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
random (can hit good mods), so it's a real model, not a tweak. (2) Prices are **seed estimates**;
refresh from poe2scout at Phase 4. (3) `essenceCandidates` are caller-supplied; a reverse index from
`essences.json` (which mods a real essence can grant, at which tier/price) would let the optimizer infer
them — not yet built.

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

## Still deferred
- **Resolve the baselined data findings** (16 mis-slots, 4 mixed families on 0.5; CompanionDamage on
  0.5.0) — domain/CoE ruling on `type` vs pool for shield block etc.
- **Perfect essences** in 0.5.0 — poe2db lists none per-base; the remove-and-add-on-rare mechanic stays
  anchored on the 0.5 snapshot.
- **CoE numeric cross-check of the new pools** — essence value ranges and desecrated weights vs
  craftofexile.com (the normal pools are CoE-exact; essence/desecrated are poe2db-sourced but not yet
  CoE-diffed).
- **Broaden CoE cross-validation beyond wands** — other bases' families/weights, tier-target and omen
  numbers. Wands is clean; the rest of the pool is the remaining Phase-3 work.
