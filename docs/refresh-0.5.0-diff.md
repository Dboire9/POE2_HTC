# 0.5.0 refresh — structural diff vs the 0.5 Java baseline

Staged data: `data/patches/0.5.0/` (RePoE-fork, client 4.5.4.3). Baseline: `data/patches/0.5/`
(1:1 extraction of the ~0.2/0.3-era Java). **NORMAL pools only** in the refresh so far.

> **Weights are excluded from this diff.** Baseline weights are hand-curated (0.2/0.3 era);
> refresh weights are poe2db community spawn weights (DropChance), applied by
> `apply_weights.mjs`. A value-level weight comparison is out of scope here.

## Totals

- Baseline: 1351 mods (all sources), 41 bases.
- Refresh (normal-only): 2193 mods, 42 bases, 8164 tiers.
- Matched mod families (normal pool, by base): 838.
  - with a tier-**count** change: 86
  - with an **ilvl** change on a matched tier: 113
  - with a stat-**range** change on a matched tier: 1114

## Per base (normal pool)

| Base | old p/s | new p/s | matched | added | removed | ilvl Δ | range Δ | tierN Δ |
|------|--------:|--------:|--------:|------:|--------:|-------:|--------:|--------:|
| Amulets | 10/21 | 12/21 | 27 | 3 | 1 | 3 | 29 | 5 |
| Body_Armours_dex | 7/12 | 7/12 | 15 | 2 | 4 | 0 | 36 | 0 |
| Body_Armours_dex_int | 7/14 | 7/14 | 16 | 3 | 5 | 0 | 48 | 1 |
| Body_Armours_int | 7/12 | 7/12 | 14 | 3 | 5 | 0 | 26 | 0 |
| Body_Armours_str | 7/12 | 7/12 | 15 | 2 | 4 | 0 | 36 | 0 |
| Body_Armours_str_dex | 7/14 | 7/14 | 17 | 2 | 4 | 0 | 48 | 1 |
| Body_Armours_str_int | 7/14 | 7/14 | 16 | 3 | 5 | 0 | 48 | 0 |
| Boots_dex | 6/13 | 6/13 | 16 | 1 | 3 | 0 | 19 | 2 |
| Boots_dex_int | 6/15 | 6/15 | 18 | 1 | 3 | 1 | 31 | 3 |
| Boots_int | 6/13 | 6/13 | 16 | 1 | 3 | 1 | 14 | 2 |
| Boots_str | 6/13 | 6/13 | 16 | 1 | 3 | 0 | 19 | 1 |
| Boots_str_dex | 6/15 | 6/15 | 18 | 1 | 3 | 0 | 30 | 2 |
| Boots_str_int | 6/15 | 6/15 | 18 | 1 | 3 | 1 | 31 | 2 |
| Bows | 8/13 | 8/13 | 21 | 0 | 0 | 12 | 24 | 2 |
| Bucklers | 6/13 | 6/13 | 17 | 2 | 2 | 0 | 18 | 0 |
| Crossbows | 8/14 | 8/14 | 22 | 0 | 0 | 10 | 23 | 1 |
| Foci | 10/13 | 10/12 | 18 | 0 | 1 | 4 | 8 | 3 |
| Gloves_dex | 10/16 | 10/16 | 26 | 0 | 0 | 2 | 19 | 3 |
| Gloves_dex_int | 10/18 | 10/18 | 27 | 1 | 1 | 3 | 31 | 4 |
| Gloves_int | 10/17 | 10/17 | 27 | 0 | 0 | 3 | 14 | 4 |
| Gloves_str | 10/17 | 10/17 | 27 | 0 | 0 | 2 | 19 | 3 |
| Gloves_str_dex | 10/19 | 10/18 | 28 | 0 | 1 | 2 | 30 | 3 |
| Gloves_str_int | 10/18 | 10/19 | 28 | 1 | 0 | 3 | 31 | 4 |
| Helmets_dex | 8/13 | 8/13 | 21 | 0 | 0 | 0 | 23 | 2 |
| Helmets_dex_int | 8/14 | 8/14 | 22 | 0 | 0 | 1 | 41 | 3 |
| Helmets_int | 8/12 | 8/12 | 20 | 0 | 0 | 1 | 17 | 3 |
| Helmets_str | 8/13 | 8/13 | 20 | 1 | 1 | 0 | 23 | 2 |
| Helmets_str_dex | 8/14 | 8/15 | 22 | 1 | 0 | 0 | 40 | 2 |
| Helmets_str_int | 8/14 | 8/14 | 22 | 0 | 0 | 1 | 41 | 3 |
| OneHand_Maces | 8/14 | 8/14 | 22 | 0 | 0 | 10 | 22 | 3 |
| Quarterstaves | 8/15 | 8/15 | 23 | 0 | 0 | 10 | 23 | 3 |
| Quivers | 7/8 | 7/9 | 14 | 2 | 1 | 3 | 0 | 1 |
| Rings | 13/18 | 13/18 | 30 | 1 | 0 | 6 | 36 | 7 |
| Sceptres | 8/13 | 8/14 | 21 | 1 | 0 | 3 | 19 | 1 |
| Shields_str | 6/14 | 6/14 | 18 | 2 | 2 | 0 | 18 | 0 |
| Shields_str_dex | 6/15 | 6/16 | 18 | 4 | 3 | 0 | 30 | 0 |
| Shields_str_int | 6/16 | 6/16 | 19 | 3 | 3 | 3 | 33 | 2 |
| Spears | 8/16 | 8/16 | 23 | 0 | 0 | 10 | 22 | 3 |
| Staves | 11/18 | 11/18 | 19 | 1 | 0 | 3 | 63 | 1 |
| TwoHand_Maces | 8/14 | 8/14 | 22 | 0 | 0 | 10 | 23 | 3 |
| Wands | 11/18 | 11/18 | 19 | 1 | 0 | 5 | 8 | 1 |

## Families added / removed per base (0.5 vs baseline)

- **Amulets**
  - added: `prefix:MaximumLifeIncreasePercent`, `prefix:MaximumManaIncreasePercent`, `prefix:BaseSpirit`
  - removed: `prefix:`
- **Body_Armours_dex**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`
- **Body_Armours_dex_int**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`, `suffix:EnergyShieldRegeneration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`, `suffix:EnergyShieldDelay`
- **Body_Armours_int**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`, `suffix:EnergyShieldRegeneration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`, `suffix:EnergyShieldDelay`
- **Body_Armours_str**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`
- **Body_Armours_str_dex**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`
- **Body_Armours_str_int**
  - added: `prefix:BaseSpirit`, `suffix:ReducedAilmentDuration`, `suffix:EnergyShieldRegeneration`
  - removed: `prefix:`, `suffix:ReducedBleedingDuration`, `suffix:ReducedPoisonDuration`, `suffix:ReducedIgniteDuration`, `suffix:EnergyShieldDelay`
- **Boots_dex**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Boots_dex_int**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Boots_int**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Boots_str**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Boots_str_dex**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Boots_str_int**
  - added: `suffix:ReducedAilmentDuration`
  - removed: `suffix:ReducedShockDuration`, `suffix:ReducedChillDuration`, `suffix:ReducedFreezeDuration`
- **Bucklers**
  - added: `suffix:MaximumLightningResistance`, `suffix:MaximumChaosResistance`
  - removed: `suffix:MaximumLightningResist`, `suffix:MaximumChaosResist`
- **Foci**
  - removed: `suffix:EnergyShieldDelay`
- **Gloves_dex_int**
  - added: `suffix:Intelligence`
  - removed: `suffix:Strength`
- **Gloves_str_dex**
  - removed: `suffix:Intelligence`
- **Gloves_str_int**
  - added: `suffix:Intelligence`
- **Helmets_str**
  - added: `suffix:Intelligence`
  - removed: `suffix:Dexterity`
- **Helmets_str_dex**
  - added: `suffix:Intelligence`
- **Quivers**
  - added: `prefix:DamageWithWeaponTypeSkill`, `suffix:AdditionalArrows`
  - removed: `prefix:IncreasedDamageWithBowSkillsPercent`
- **Rings**
  - added: `suffix:LightRadiusAndManaRegeneration`
- **Sceptres**
  - added: `suffix:LightRadiusAndManaRegeneration`
- **Shields_str**
  - added: `suffix:MaximumLightningResistance`, `suffix:MaximumChaosResistance`
  - removed: `suffix:MaximumLightningResist`, `suffix:MaximumChaosResist`
- **Shields_str_dex**
  - added: `suffix:ReducedExtraDamageFromCrits`, `suffix:MaximumLightningResistance`, `suffix:MaximumChaosResistance`, `suffix:EvasionAppliesToDeflection`
  - removed: `suffix:ReducedPhysicalDamageTaken`, `suffix:MaximumLightningResist`, `suffix:MaximumChaosResist`
- **Shields_str_int**
  - added: `suffix:AllResistances`, `suffix:MaximumLightningResistance`, `suffix:MaximumChaosResistance`
  - removed: `suffix:ReducedPhysicalDamageTaken`, `suffix:MaximumLightningResist`, `suffix:MaximumChaosResist`
- **Staves**
  - added: `suffix:LightRadiusAndManaRegeneration`
- **Wands**
  - added: `suffix:LightRadiusAndManaRegeneration`

## Worked example — Wands `+# to maximum Mana` (IncreasedMana prefix)

| tier | baseline ilvl/range | refresh ilvl/range |
|-----:|---------------------|--------------------|
| 0 | 1 / [[10,14]] | 1 / [[10,14]] |
| 1 | 6 / [[15,24]] | 6 / [[15,24]] |
| 2 | 16 / [[25,34]] | 16 / [[25,34]] |
| 3 | 25 / [[35,54]] | 25 / [[35,54]] |
| 4 | 33 / [[55,64]] | 33 / [[55,64]] |
| 5 | 38 / [[65,79]] | 38 / [[65,79]] |
| 6 | 46 / [[80,89]] | 46 / [[80,89]] |
| 7 | 54 / [[90,104]] | 54 / [[90,104]] |
| 8 | 60 / [[105,124]] | 60 / [[105,124]] |
| 9 | 65 / [[125,149]] | 65 / [[125,149]] |
| 10 | 70 / [[150,164]] | 70 / [[150,164]] |
