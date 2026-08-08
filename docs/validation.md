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

## Still deferred
- **Resolve the baselined data findings** (16 mis-slots, 4 mixed families on 0.5; CompanionDamage +
  8 desecrated/perfect cross-source families on 0.5.0) — domain/CoE ruling on `type` vs pool.
- ~~UI for budget alternatives~~ DONE 2026-07-17 — optional Budget field in the Engine Lab, 📌 pins on
  target rows, and an `AlternativesView` panel below the frontier. Rendering is covered by a component
  test driven by **real engine output** (`AlternativesView.test.tsx`) rather than a hand-made fixture,
  so the panel can't render a shape the engine never produces. Both flows wired (a fractured craft routes
  its alternatives through the from-item planner). The panel shows the odds bracket verbatim when
  `exact: false`, and badges "search capped" when `truncated` — the honesty the engine reports is
  surfaced, not swallowed.
- ~~Human CoE numeric spot-check of the new pools~~ DONE 2026-07-13 — essence value ranges confirmed
  against CoE (see above). Desecrated/perfect value spot-checks beyond the sampled set remain optional.
- **Broaden CoE cross-validation beyond wands** — other bases' families/weights, tier-target and omen
  numbers. Wands is clean; the rest of the pool is the remaining Phase-3 work.
