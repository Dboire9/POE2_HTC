#include "modifiers_data.h"
#include <string.h>

Modifier MODIFIERS_DB[1337];

void init_modifiers_data(void) {
    // DESECRATED_DAMAGE_VS_FULLY_BROKEN_ARMOUR - 1 tiers
    MODIFIERS_DB[0] = (Modifier){
        .id = 0,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Damage against Enemies with Fully Broken Armour",
        .description = "% increased Damage against Enemies with Fully Broken Armour"
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[1] = (Modifier){
        .id = 1,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[2] = (Modifier){
        .id = 2,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_EMPOWERED_INCREASED_DAMAGE - 1 tiers
    MODIFIERS_DB[3] = (Modifier){
        .id = 3,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Empowered Attacks deal #% increased Damage",
        .description = "Empowered Attacks deal #% increased Damage"
    };

    // DESECRATED_INCREASED_PHYSICAL_DAMAGE_REDUCED_ATTACK_SPEED - 1 tiers
    MODIFIERS_DB[4] = (Modifier){
        .id = 4,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Physical Damage, #% reduced Attack Speed",
        .description = "#% increased Physical Damage, #% reduced Attack Speed"
    };

    // DESECRATED_INCREASED_DAMAGE_WHILE_TOTEM - 1 tiers
    MODIFIERS_DB[5] = (Modifier){
        .id = 5,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Damage while you have a Totem",
        .description = "% increased Damage while you have a Totem"
    };

    // DESECRATED_ADDITIONAL_TOTEMS - 1 tiers
    MODIFIERS_DB[6] = (Modifier){
        .id = 6,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Melee Attack Skills have +1 to maximum number of Summoned Totem",
        .description = "Melee Attack Skills have +1 to maximum number of Summoned Totems"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[7] = (Modifier){
        .id = 7,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_FISSURE_CHANCE - 1 tiers
    MODIFIERS_DB[8] = (Modifier){
        .id = 8,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Fissure Skills have (#–#)% chance to create an additional Fissu",
        .description = "Fissure Skills have (#–#)% chance to create an additional Fissure"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[9] = (Modifier){
        .id = 9,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_AFTERSHOCK_CHANCE - 1 tiers
    MODIFIERS_DB[10] = (Modifier){
        .id = 10,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Mace Slam Skills you use yourself have +#% chance to cause Afte",
        .description = "Mace Slam Skills you use yourself have +#% chance to cause Aftershocks"
    };

    // DESECRATED_ARMOUR_BREAK_PHYSICAL_DAMAGE_DEALT - 1 tiers
    MODIFIERS_DB[11] = (Modifier){
        .id = 11,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Break Armour equal to #% of Physical Damage dealt",
        .description = "Break Armour equal to #% of Physical Damage dealt"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[12] = (Modifier){
        .id = 12,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_WARCRY_COOLDOWN_SPEED - 1 tiers
    MODIFIERS_DB[13] = (Modifier){
        .id = 13,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Warcry Cooldown Recovery Rate",
        .description = "#% increased Warcry Cooldown Recovery Rate"
    };

    // DESECRATED_TOTEM_PLACEMENT_SPEED - 1 tiers
    MODIFIERS_DB[14] = (Modifier){
        .id = 14,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Totem Placement Speed",
        .description = "#% increased Totem Placement Speed"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[15] = (Modifier){
        .id = 15,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[16] = (Modifier){
        .id = 16,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[17] = (Modifier){
        .id = 17,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1200,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[18] = (Modifier){
        .id = 18,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[19] = (Modifier){
        .id = 19,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[20] = (Modifier){
        .id = 20,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[21] = (Modifier){
        .id = 21,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[22] = (Modifier){
        .id = 22,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[23] = (Modifier){
        .id = 23,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[24] = (Modifier){
        .id = 24,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[25] = (Modifier){
        .id = 25,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 5 tiers
    MODIFIERS_DB[26] = (Modifier){
        .id = 26,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[27] = (Modifier){
        .id = 27,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[28] = (Modifier){
        .id = 28,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[29] = (Modifier){
        .id = 29,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[30] = (Modifier){
        .id = 30,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[31] = (Modifier){
        .id = 31,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 8 tiers
    MODIFIERS_DB[32] = (Modifier){
        .id = 32,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[33] = (Modifier){
        .id = 33,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[34] = (Modifier){
        .id = 34,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[35] = (Modifier){
        .id = 35,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // INCREASED_STUN_DURATION - 6 tiers
    MODIFIERS_DB[36] = (Modifier){
        .id = 36,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Stun Duration",
        .description = "#% increased Stun Duration"
    };

    // INCREASED_STUN_BUILDUP - 6 tiers
    MODIFIERS_DB[37] = (Modifier){
        .id = 37,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "Causes #% increased Stun Buildup",
        .description = "Causes #% increased Stun Buildup"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[38] = (Modifier){
        .id = 38,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[39] = (Modifier){
        .id = 39,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[40] = (Modifier){
        .id = 40,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[41] = (Modifier){
        .id = 41,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[42] = (Modifier){
        .id = 42,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[43] = (Modifier){
        .id = 43,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[44] = (Modifier){
        .id = 44,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[45] = (Modifier){
        .id = 45,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[46] = (Modifier){
        .id = 46,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[47] = (Modifier){
        .id = 47,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[48] = (Modifier){
        .id = 48,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[49] = (Modifier){
        .id = 49,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[50] = (Modifier){
        .id = 50,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[51] = (Modifier){
        .id = 51,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[52] = (Modifier){
        .id = 52,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[53] = (Modifier){
        .id = 53,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[54] = (Modifier){
        .id = 54,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_FIRE_DAMAGE_IGNITE_MAGNITUDE - 1 tiers
    MODIFIERS_DB[55] = (Modifier){
        .id = 55,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Fire Damage\n(14–23)% increased Ignite Magnitude",
        .description = "% increased Fire Damage\n(14–23)% increased Ignite Magnitude"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[56] = (Modifier){
        .id = 56,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_COLD_DAMAGE_FREEZE_BUILDUP - 1 tiers
    MODIFIERS_DB[57] = (Modifier){
        .id = 57,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Cold Damage\n(14–23)% increased Freeze Buildup",
        .description = "% increased Cold Damage\n(14–23)% increased Freeze Buildup"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[58] = (Modifier){
        .id = 58,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_LIGHTNING_DAMAGE_SHOCK_MAGNITUDE - 1 tiers
    MODIFIERS_DB[59] = (Modifier){
        .id = 59,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Lightning Damage\n(14–23)% increased Magnitude of S",
        .description = "% increased Lightning Damage\n(14–23)% increased Magnitude of Shock you inflict"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[60] = (Modifier){
        .id = 60,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_ADDITIONAL_COMBO_CHANCE - 1 tiers
    MODIFIERS_DB[61] = (Modifier){
        .id = 61,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to build an additional Combo on Hit",
        .description = "#% chance to build an additional Combo on Hit"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[62] = (Modifier){
        .id = 62,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_RECOVER_MANA_ON_EXPENDING_COMBO - 1 tiers
    MODIFIERS_DB[63] = (Modifier){
        .id = 63,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of Maximum Mana when you expend at least 10 Combo",
        .description = "Recover #% of Maximum Mana when you expend at least 10 Combo"
    };

    // DESECRATED_RECOVER_LIFE_ON_EXPENDING_COMBO - 1 tiers
    MODIFIERS_DB[64] = (Modifier){
        .id = 64,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of Maximum Life when you expend at least 10 Combo",
        .description = "Recover #% of Maximum Life when you expend at least 10 Combo"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[65] = (Modifier){
        .id = 65,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[66] = (Modifier){
        .id = 66,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[67] = (Modifier){
        .id = 67,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[68] = (Modifier){
        .id = 68,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 900,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[69] = (Modifier){
        .id = 69,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1100,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[70] = (Modifier){
        .id = 70,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[71] = (Modifier){
        .id = 71,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[72] = (Modifier){
        .id = 72,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[73] = (Modifier){
        .id = 73,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[74] = (Modifier){
        .id = 74,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[75] = (Modifier){
        .id = 75,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[76] = (Modifier){
        .id = 76,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 5 tiers
    MODIFIERS_DB[77] = (Modifier){
        .id = 77,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[78] = (Modifier){
        .id = 78,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[79] = (Modifier){
        .id = 79,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[80] = (Modifier){
        .id = 80,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[81] = (Modifier){
        .id = 81,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[82] = (Modifier){
        .id = 82,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 8 tiers
    MODIFIERS_DB[83] = (Modifier){
        .id = 83,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[84] = (Modifier){
        .id = 84,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[85] = (Modifier){
        .id = 85,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[86] = (Modifier){
        .id = 86,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // INCREASED_STUN_DURATION - 6 tiers
    MODIFIERS_DB[87] = (Modifier){
        .id = 87,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Stun Duration",
        .description = "#% increased Stun Duration"
    };

    // INCREASED_STUN_BUILDUP - 6 tiers
    MODIFIERS_DB[88] = (Modifier){
        .id = 88,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "Causes #% increased Stun Buildup",
        .description = "Causes #% increased Stun Buildup"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[89] = (Modifier){
        .id = 89,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[90] = (Modifier){
        .id = 90,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[91] = (Modifier){
        .id = 91,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[92] = (Modifier){
        .id = 92,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[93] = (Modifier){
        .id = 93,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[94] = (Modifier){
        .id = 94,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[95] = (Modifier){
        .id = 95,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[96] = (Modifier){
        .id = 96,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[97] = (Modifier){
        .id = 97,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[98] = (Modifier){
        .id = 98,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[99] = (Modifier){
        .id = 99,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[100] = (Modifier){
        .id = 100,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[101] = (Modifier){
        .id = 101,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[102] = (Modifier){
        .id = 102,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[103] = (Modifier){
        .id = 103,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[104] = (Modifier){
        .id = 104,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // DESECRATED_BASE_SPIRIT - 1 tiers
    MODIFIERS_DB[105] = (Modifier){
        .id = 105,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = ",
            ",
        .description = ",
            "
    };

    // DESECRATED_SPELL_DAMAGE_COST_LIFE - 1 tiers
    MODIFIERS_DB[106] = (Modifier){
        .id = 106,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage with Spells that cost Life",
        .description = "#% increased Spell Damage with Spells that cost Life"
    };

    // DESECRATED_ELEMENTAL_INFUSION - 1 tiers
    MODIFIERS_DB[107] = (Modifier){
        .id = 107,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to maximum number of Elemental Infusions",
        .description = "+# to maximum number of Elemental Infusions"
    };

    // DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT - 1 tiers
    MODIFIERS_DB[108] = (Modifier){
        .id = 108,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Damaging Ailments you inflict",
        .description = "#% increased Magnitude of Damaging Ailments you inflict"
    };

    // DESECRATED_ARCHON_DURATION - 1 tiers
    MODIFIERS_DB[109] = (Modifier){
        .id = 109,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Archon Buff duration",
        .description = "#% increased Archon Buff duration"
    };

    // DESECRATED_BLOCK_CHANCE - 1 tiers
    MODIFIERS_DB[110] = (Modifier){
        .id = 110,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Block chance",
        .description = "+#% to Block chance"
    };

    // DESECRATED_SKILL_LIFE_COST - 1 tiers
    MODIFIERS_DB[111] = (Modifier){
        .id = 111,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Spell Mana Cost Converted to Life Cost",
        .description = "#% of Spell Mana Cost Converted to Life Cost"
    };

    // DESECRATED_ARCHON_DELAY_RECOVERY - 1 tiers
    MODIFIERS_DB[112] = (Modifier){
        .id = 112,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Archon recovery period expires #% faster",
        .description = "Archon recovery period expires #% faster"
    };

    // DESECRATED_CAST_SPEED_ON_LOW_LIFE - 1 tiers
    MODIFIERS_DB[113] = (Modifier){
        .id = 113,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cast Speed when on Low Life",
        .description = "#% increased Cast Speed when on Low Life"
    };

    // MAXIMUM_MANA - 11 tiers
    MODIFIERS_DB[114] = (Modifier){
        .id = 114,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // INCREASED_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[115] = (Modifier){
        .id = 115,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Spell Damage",
        .description = "+#% Increased Spell Damage"
    };

    // HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA - 7 tiers
    MODIFIERS_DB[116] = (Modifier){
        .id = 116,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+#% increased Spell Damage\n+# to maximum Mana",
        .description = "+#% increased Spell Damage\n+# to maximum Mana"
    };

    // INCREASED_FIRE_DAMAGE - 8 tiers
    MODIFIERS_DB[117] = (Modifier){
        .id = 117,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Fire Damage",
        .description = "+#% Increased Fire Damage"
    };

    // INCREASED_COLD_DAMAGE - 8 tiers
    MODIFIERS_DB[118] = (Modifier){
        .id = 118,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Cold Damage",
        .description = "+#% Increased Cold Damage"
    };

    // INCREASED_LIGHTNING_DAMAGE - 8 tiers
    MODIFIERS_DB[119] = (Modifier){
        .id = 119,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Lightning Damage",
        .description = "+#% Increased Lightning Damage"
    };

    // INCREASED_CHAOS_DAMAGE - 8 tiers
    MODIFIERS_DB[120] = (Modifier){
        .id = 120,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Chaos Damage",
        .description = "+#% Increased Chaos Damage"
    };

    // INCREASED_SPELL_PHYSICAL_DAMAGE - 8 tiers
    MODIFIERS_DB[121] = (Modifier){
        .id = 121,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Spell Physical Damage",
        .description = "+#% Increased Spell Physical Damage"
    };

    // DAMAGE_AS_EXTRA_FIRE_DAMAGE - 6 tiers
    MODIFIERS_DB[122] = (Modifier){
        .id = 122,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Fire Damage",
        .description = "% of Damage as Extra Fire Damage"
    };

    // DAMAGE_AS_EXTRA_COLD_DAMAGE - 6 tiers
    MODIFIERS_DB[123] = (Modifier){
        .id = 123,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Cold Damage",
        .description = "% of Damage as Extra Cold Damage"
    };

    // DAMAGE_AS_EXTRA_LIGHTNING_DAMAGE - 6 tiers
    MODIFIERS_DB[124] = (Modifier){
        .id = 124,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Lightning Damage",
        .description = "% of Damage as Extra Lightning Damage"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[125] = (Modifier){
        .id = 125,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[126] = (Modifier){
        .id = 126,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ALL_SPELL_SKILL_LEVEL - 4 tiers
    MODIFIERS_DB[127] = (Modifier){
        .id = 127,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 200,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // FIRE_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[128] = (Modifier){
        .id = 128,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Fire Spell Skills",
        .description = "+# to Level of all Fire Spell Skills"
    };

    // COLD_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[129] = (Modifier){
        .id = 129,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Cold Spell Skills",
        .description = "+# to Level of all Cold Spell Skills"
    };

    // LIGHTNING_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[130] = (Modifier){
        .id = 130,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Lightning Spell Skills",
        .description = "+# to Level of all Lightning Spell Skills"
    };

    // CHAOS_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[131] = (Modifier){
        .id = 131,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Chaos Spell Skills",
        .description = "+# to Level of all Chaos Spell Skills"
    };

    // PHYSICAL_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[132] = (Modifier){
        .id = 132,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Physical Spell Skills",
        .description = "+# to Level of all Physical Spell Skills"
    };

    // MANA_REGENERATION_RATE - 6 tiers
    MODIFIERS_DB[133] = (Modifier){
        .id = 133,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[134] = (Modifier){
        .id = 134,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[135] = (Modifier){
        .id = 135,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // INCREASED_CAST_SPEED - 7 tiers
    MODIFIERS_DB[136] = (Modifier){
        .id = 136,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // INCREASED_CRITICAL_HIT_CHANCE_SPELLS - 6 tiers
    MODIFIERS_DB[137] = (Modifier){
        .id = 137,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 11,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // CRITICAL_SPELL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[138] = (Modifier){
        .id = 138,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Spell Damage Bonus",
        .description = "#% increased Critical Spell Damage Bonus"
    };

    // HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[139] = (Modifier){
        .id = 139,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate / #%Light Radius",
        .description = "#% increased Mana Regeneration Rate / #%Light Radius"
    };

    // INCREASED_FLAMMABILITY_MAGNITUDE - 5 tiers
    MODIFIERS_DB[140] = (Modifier){
        .id = 140,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Flammability Magnitude",
        .description = "#% increased Flammability Magnitude"
    };

    // INCREASED_FREEZE_BUILDUP - 5 tiers
    MODIFIERS_DB[141] = (Modifier){
        .id = 141,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Freeze Buildup",
        .description = "#% increased Freeze Buildup"
    };

    // INCREASED_SHOCK_CHANCE - 5 tiers
    MODIFIERS_DB[142] = (Modifier){
        .id = 142,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased chance to Shock",
        .description = "#% increased chance to Shock"
    };

    // ESSENCE_INCREASED_SPELL_DAMAGE - 3 tiers
    MODIFIERS_DB[143] = (Modifier){
        .id = 143,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Spell Damage",
        .description = "#% increased Spell Damage"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[144] = (Modifier){
        .id = 144,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[145] = (Modifier){
        .id = 145,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[146] = (Modifier){
        .id = 146,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_SPELL_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[147] = (Modifier){
        .id = 147,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // ESSENCE_SPELL_CRIT_CHANCE - 3 tiers
    MODIFIERS_DB[148] = (Modifier){
        .id = 148,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 21,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // ESSENCE_INCREASED_CAST_SPEED - 3 tiers
    MODIFIERS_DB[149] = (Modifier){
        .id = 149,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // ESSENCE_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[150] = (Modifier){
        .id = 150,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_GRENADE_COOLDOWN_USE - 1 tiers
    MODIFIERS_DB[151] = (Modifier){
        .id = 151,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Grenade Skills have +# Cooldown Use",
        .description = "Grenade Skills have +# Cooldown Use"
    };

    // DESECRATED_INCREASED_GRENADE_DAMAGE_AND_DURATION - 1 tiers
    MODIFIERS_DB[152] = (Modifier){
        .id = 152,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Grenade Damage\n#% increased Grenade Duration",
        .description = "#% increased Grenade Damage\n#% increased Grenade Duration"
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[153] = (Modifier){
        .id = 153,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[154] = (Modifier){
        .id = 154,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_ADDITIONAL_BALLISTA_TOTEM - 1 tiers
    MODIFIERS_DB[155] = (Modifier){
        .id = 155,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to maximum number of Summoned Ballista Totems",
        .description = "+# to maximum number of Summoned Ballista Totems"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[156] = (Modifier){
        .id = 156,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_GRENADE_ADDITIONAL_DETONATION_CHANCE - 1 tiers
    MODIFIERS_DB[157] = (Modifier){
        .id = 157,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Grenades have #% chance to activate a second time",
        .description = "Grenades have #% chance to activate a second time"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[158] = (Modifier){
        .id = 158,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_CROSSBOW_IMMEDIATE_RELOAD_CHANCE - 1 tiers
    MODIFIERS_DB[159] = (Modifier){
        .id = 159,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance when you Reload a Crossbow to be immediate",
        .description = "#% chance when you Reload a Crossbow to be immediate"
    };

    // DESECRATED_CROSSBOW_RELOAD_SPEED - 1 tiers
    MODIFIERS_DB[160] = (Modifier){
        .id = 160,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Reload Speed",
        .description = "#% increased Reload Speed"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[161] = (Modifier){
        .id = 161,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_CHAIN - 1 tiers
    MODIFIERS_DB[162] = (Modifier){
        .id = 162,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks Chain an additional time",
        .description = "Attacks Chain an additional time"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[163] = (Modifier){
        .id = 163,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[164] = (Modifier){
        .id = 164,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[165] = (Modifier){
        .id = 165,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[166] = (Modifier){
        .id = 166,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[167] = (Modifier){
        .id = 167,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[168] = (Modifier){
        .id = 168,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[169] = (Modifier){
        .id = 169,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[170] = (Modifier){
        .id = 170,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[171] = (Modifier){
        .id = 171,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[172] = (Modifier){
        .id = 172,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[173] = (Modifier){
        .id = 173,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[174] = (Modifier){
        .id = 174,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_PROJECTILE_SKILL - 5 tiers
    MODIFIERS_DB[175] = (Modifier){
        .id = 175,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Projectile Skills",
        .description = "+# to Level of all Projectile Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[176] = (Modifier){
        .id = 176,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[177] = (Modifier){
        .id = 177,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[178] = (Modifier){
        .id = 178,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[179] = (Modifier){
        .id = 179,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[180] = (Modifier){
        .id = 180,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 5 tiers
    MODIFIERS_DB[181] = (Modifier){
        .id = 181,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[182] = (Modifier){
        .id = 182,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[183] = (Modifier){
        .id = 183,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[184] = (Modifier){
        .id = 184,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // ADDITIONAL_BOLT - 2 tiers
    MODIFIERS_DB[185] = (Modifier){
        .id = 185,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 55,
        .tags = 0,
        .name = "Loads # additional bolt(s)",
        .description = "Loads # additional bolt(s)"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[186] = (Modifier){
        .id = 186,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[187] = (Modifier){
        .id = 187,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[188] = (Modifier){
        .id = 188,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[189] = (Modifier){
        .id = 189,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[190] = (Modifier){
        .id = 190,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[191] = (Modifier){
        .id = 191,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[192] = (Modifier){
        .id = 192,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[193] = (Modifier){
        .id = 193,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[194] = (Modifier){
        .id = 194,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[195] = (Modifier){
        .id = 195,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[196] = (Modifier){
        .id = 196,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[197] = (Modifier){
        .id = 197,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[198] = (Modifier){
        .id = 198,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[199] = (Modifier){
        .id = 199,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[200] = (Modifier){
        .id = 200,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[201] = (Modifier){
        .id = 201,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // DESECRATED_INCREASED_ATTACK_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[202] = (Modifier){
        .id = 202,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Area of Effect for Attacks",
        .description = "#% increased Area of Effect for Attacks"
    };

    // DESECRATED_COMPANION_DAMAGE - 1 tiers
    MODIFIERS_DB[203] = (Modifier){
        .id = 203,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = ",
            ",
        .description = ",
            "
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[204] = (Modifier){
        .id = 204,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_CHAIN_FROM_TERRAIN - 1 tiers
    MODIFIERS_DB[205] = (Modifier){
        .id = 205,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Projectiles have #% chance to Chain an additional time from ter",
        .description = "Projectiles have #% chance to Chain an additional time from terrain"
    };

    // DESECRATED_QUIVER_BONUS - 1 tiers
    MODIFIERS_DB[206] = (Modifier){
        .id = 206,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased bonuses gained from Equipped Quiver",
        .description = "#% increased bonuses gained from Equipped Quiver"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[207] = (Modifier){
        .id = 207,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[208] = (Modifier){
        .id = 208,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_CHANCE_TO_PIERCE - 1 tiers
    MODIFIERS_DB[209] = (Modifier){
        .id = 209,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Pierce an Enemy",
        .description = "#% chance to Pierce an Enemy"
    };

    // DESECRATED_COMPANION_ATTACK_SPEED - 1 tiers
    MODIFIERS_DB[210] = (Modifier){
        .id = 210,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Speed\nCompanions have #% increased Attack ",
        .description = "#% increased Attack Speed\nCompanions have #% increased Attack Speed"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[211] = (Modifier){
        .id = 211,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_IMMOBILISATION_BUILDUP - 1 tiers
    MODIFIERS_DB[212] = (Modifier){
        .id = 212,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Immobilisation buildup",
        .description = "#% increased Immobilisation buildup"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[213] = (Modifier){
        .id = 213,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[214] = (Modifier){
        .id = 214,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING - 1 tiers
    MODIFIERS_DB[215] = (Modifier){
        .id = 215,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Projectile Attacks have a #% chance to fire two additional Proj",
        .description = "Projectile Attacks have a #% chance to fire two additional Projectiles while moving"
    };

    // DESECRATED_COMPANION_ATTACK_SPEED_PRESENCE - 1 tiers
    MODIFIERS_DB[216] = (Modifier){
        .id = 216,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Speed\n#% increased Attack Speed while your",
        .description = "#% increased Attack Speed\n#% increased Attack Speed while your Companion is in your Presence"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[217] = (Modifier){
        .id = 217,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[218] = (Modifier){
        .id = 218,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[219] = (Modifier){
        .id = 219,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[220] = (Modifier){
        .id = 220,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1200,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[221] = (Modifier){
        .id = 221,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[222] = (Modifier){
        .id = 222,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[223] = (Modifier){
        .id = 223,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[224] = (Modifier){
        .id = 224,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[225] = (Modifier){
        .id = 225,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[226] = (Modifier){
        .id = 226,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_PROJECTILE_SKILL - 5 tiers
    MODIFIERS_DB[227] = (Modifier){
        .id = 227,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[228] = (Modifier){
        .id = 228,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[229] = (Modifier){
        .id = 229,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[230] = (Modifier){
        .id = 230,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[231] = (Modifier){
        .id = 231,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[232] = (Modifier){
        .id = 232,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 5 tiers
    MODIFIERS_DB[233] = (Modifier){
        .id = 233,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[234] = (Modifier){
        .id = 234,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[235] = (Modifier){
        .id = 235,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[236] = (Modifier){
        .id = 236,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // ADDITIONAL_ARROWS - 2 tiers
    MODIFIERS_DB[237] = (Modifier){
        .id = 237,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 55,
        .tags = 0,
        .name = "Bow Attacks fire # additional Arrows",
        .description = "Bow Attacks fire # additional Arrows"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[238] = (Modifier){
        .id = 238,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[239] = (Modifier){
        .id = 239,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[240] = (Modifier){
        .id = 240,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[241] = (Modifier){
        .id = 241,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[242] = (Modifier){
        .id = 242,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[243] = (Modifier){
        .id = 243,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[244] = (Modifier){
        .id = 244,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[245] = (Modifier){
        .id = 245,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[246] = (Modifier){
        .id = 246,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[247] = (Modifier){
        .id = 247,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[248] = (Modifier){
        .id = 248,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[249] = (Modifier){
        .id = 249,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[250] = (Modifier){
        .id = 250,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[251] = (Modifier){
        .id = 251,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[252] = (Modifier){
        .id = 252,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[253] = (Modifier){
        .id = 253,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // DESECRATED_DAMAGE_VS_FULLY_BROKEN_ARMOUR - 1 tiers
    MODIFIERS_DB[254] = (Modifier){
        .id = 254,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Damage against Enemies with Fully Broken Armour",
        .description = "% increased Damage against Enemies with Fully Broken Armour"
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[255] = (Modifier){
        .id = 255,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[256] = (Modifier){
        .id = 256,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_EMPOWERED_INCREASED_DAMAGE - 1 tiers
    MODIFIERS_DB[257] = (Modifier){
        .id = 257,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Empowered Attacks deal #% increased Damage",
        .description = "Empowered Attacks deal #% increased Damage"
    };

    // DESECRATED_INCREASED_PHYSICAL_DAMAGE_REDUCED_ATTACK_SPEED - 1 tiers
    MODIFIERS_DB[258] = (Modifier){
        .id = 258,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Physical Damage, #% reduced Attack Speed",
        .description = "#% increased Physical Damage, #% reduced Attack Speed"
    };

    // DESECRATED_INCREASED_DAMAGE_WHILE_TOTEM - 1 tiers
    MODIFIERS_DB[259] = (Modifier){
        .id = 259,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "% increased Damage while you have a Totem",
        .description = "% increased Damage while you have a Totem"
    };

    // DESECRATED_ADDITIONAL_TOTEMS - 1 tiers
    MODIFIERS_DB[260] = (Modifier){
        .id = 260,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Melee Attack Skills have +1 to maximum number of Summoned Totem",
        .description = "Melee Attack Skills have +1 to maximum number of Summoned Totems"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[261] = (Modifier){
        .id = 261,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_FISSURE_CHANCE - 1 tiers
    MODIFIERS_DB[262] = (Modifier){
        .id = 262,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Fissure Skills have (#–#)% chance to create an additional Fissu",
        .description = "Fissure Skills have (#–#)% chance to create an additional Fissure"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[263] = (Modifier){
        .id = 263,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_AFTERSHOCK_CHANCE - 1 tiers
    MODIFIERS_DB[264] = (Modifier){
        .id = 264,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Mace Slam Skills you use yourself have +#% chance to cause Afte",
        .description = "Mace Slam Skills you use yourself have +#% chance to cause Aftershocks"
    };

    // DESECRATED_ARMOUR_BREAK_PHYSICAL_DAMAGE_DEALT - 1 tiers
    MODIFIERS_DB[265] = (Modifier){
        .id = 265,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Break Armour equal to #% of Physical Damage dealt",
        .description = "Break Armour equal to #% of Physical Damage dealt"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[266] = (Modifier){
        .id = 266,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_WARCRY_COOLDOWN_SPEED - 1 tiers
    MODIFIERS_DB[267] = (Modifier){
        .id = 267,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Warcry Cooldown Recovery Rate",
        .description = "#% increased Warcry Cooldown Recovery Rate"
    };

    // DESECRATED_TOTEM_PLACEMENT_SPEED - 1 tiers
    MODIFIERS_DB[268] = (Modifier){
        .id = 268,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Totem Placement Speed",
        .description = "#% increased Totem Placement Speed"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[269] = (Modifier){
        .id = 269,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[270] = (Modifier){
        .id = 270,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[271] = (Modifier){
        .id = 271,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1200,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[272] = (Modifier){
        .id = 272,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[273] = (Modifier){
        .id = 273,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[274] = (Modifier){
        .id = 274,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[275] = (Modifier){
        .id = 275,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[276] = (Modifier){
        .id = 276,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[277] = (Modifier){
        .id = 277,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[278] = (Modifier){
        .id = 278,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[279] = (Modifier){
        .id = 279,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 5 tiers
    MODIFIERS_DB[280] = (Modifier){
        .id = 280,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[281] = (Modifier){
        .id = 281,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[282] = (Modifier){
        .id = 282,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[283] = (Modifier){
        .id = 283,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[284] = (Modifier){
        .id = 284,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[285] = (Modifier){
        .id = 285,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 8 tiers
    MODIFIERS_DB[286] = (Modifier){
        .id = 286,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[287] = (Modifier){
        .id = 287,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[288] = (Modifier){
        .id = 288,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[289] = (Modifier){
        .id = 289,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // INCREASED_STUN_DURATION - 6 tiers
    MODIFIERS_DB[290] = (Modifier){
        .id = 290,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Stun Duration",
        .description = "#% increased Stun Duration"
    };

    // INCREASED_STUN_BUILDUP - 6 tiers
    MODIFIERS_DB[291] = (Modifier){
        .id = 291,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "Causes #% increased Stun Buildup",
        .description = "Causes #% increased Stun Buildup"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[292] = (Modifier){
        .id = 292,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[293] = (Modifier){
        .id = 293,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[294] = (Modifier){
        .id = 294,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[295] = (Modifier){
        .id = 295,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[296] = (Modifier){
        .id = 296,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[297] = (Modifier){
        .id = 297,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[298] = (Modifier){
        .id = 298,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[299] = (Modifier){
        .id = 299,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[300] = (Modifier){
        .id = 300,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[301] = (Modifier){
        .id = 301,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[302] = (Modifier){
        .id = 302,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[303] = (Modifier){
        .id = 303,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[304] = (Modifier){
        .id = 304,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[305] = (Modifier){
        .id = 305,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[306] = (Modifier){
        .id = 306,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[307] = (Modifier){
        .id = 307,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // MAXIMUM_MANA - 11 tiers
    MODIFIERS_DB[308] = (Modifier){
        .id = 308,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // PHYSICAL_DAMAGE_ALLIES - 9 tiers
    MODIFIERS_DB[309] = (Modifier){
        .id = 309,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_ALLIES - 9 tiers
    MODIFIERS_DB[310] = (Modifier){
        .id = 310,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_ALLIES - 9 tiers
    MODIFIERS_DB[311] = (Modifier){
        .id = 311,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_ALLIES - 9 tiers
    MODIFIERS_DB[312] = (Modifier){
        .id = 312,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ALL_DAMAGE_ALLIES - 8 tiers
    MODIFIERS_DB[313] = (Modifier){
        .id = 313,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Allies in your Presence deal #% increased Damage",
        .description = "Allies in your Presence deal #% increased Damage"
    };

    // INCREASED_SPIRIT - 8 tiers
    MODIFIERS_DB[314] = (Modifier){
        .id = 314,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Spirit",
        .description = "#% increased Spirit"
    };

    // HYBRID_INCREASED_SPIRIT_MANA - 7 tiers
    MODIFIERS_DB[315] = (Modifier){
        .id = 315,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Spirit\n+# to maximum Mana",
        .description = "#% increased Spirit\n+# to maximum Mana"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[316] = (Modifier){
        .id = 316,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[317] = (Modifier){
        .id = 317,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ALLIES_ALL_RESISTANCES - 6 tiers
    MODIFIERS_DB[318] = (Modifier){
        .id = 318,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 12,
        .tags = 0,
        .name = "Allies in your Presence have +(#–#)% to all Elemental Resistanc",
        .description = "Allies in your Presence have +(#–#)% to all Elemental Resistances"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[319] = (Modifier){
        .id = 319,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // MINION_SKILL_LEVEL - 4 tiers
    MODIFIERS_DB[320] = (Modifier){
        .id = 320,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // ALLIES_LIFE_REGENERATION - 10 tiers
    MODIFIERS_DB[321] = (Modifier){
        .id = 321,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Regenerate #(–#) Life per second for Allies in your Presence",
        .description = "Regenerate #(–#) Life per second for Allies in your Presence"
    };

    // ALLIES_INCREASED_ATTACK_SPEED - 4 tiers
    MODIFIERS_DB[322] = (Modifier){
        .id = 322,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Attack Speed for Allies in your Presence",
        .description = "#% increased Attack Speed for Allies in your Presence"
    };

    // ALLIES_INCREASED_CAST_SPEED - 4 tiers
    MODIFIERS_DB[323] = (Modifier){
        .id = 323,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 6,
        .tags = 0,
        .name = "#% increased Cast Speed for Allies in your Presence",
        .description = "#% increased Cast Speed for Allies in your Presence"
    };

    // ALLIES_INCREASED_CRIT_CHANCE - 6 tiers
    MODIFIERS_DB[324] = (Modifier){
        .id = 324,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 11,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Allies in your Presence",
        .description = "#% increased Critical Hit Chance for Allies in your Presence"
    };

    // ALLIES_INCREASED_CRIT_MULTIPLIER - 6 tiers
    MODIFIERS_DB[325] = (Modifier){
        .id = 325,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus for Allies in your Presence",
        .description = "#% increased Critical Damage Bonus for Allies in your Presence"
    };

    // HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[326] = (Modifier){
        .id = 326,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate / #%Light Radius",
        .description = "#% increased Mana Regeneration Rate / #%Light Radius"
    };

    // INCREASED_PRESENCE_RADIUS - 4 tiers
    MODIFIERS_DB[327] = (Modifier){
        .id = 327,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 23,
        .tags = 0,
        .name = "#% increased Presence Area of Effect for Allies",
        .description = "#% increased Presence Area of Effect for Allies"
    };

    // MINIONS_INCREASED_LIFE - 6 tiers
    MODIFIERS_DB[328] = (Modifier){
        .id = 328,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased maximum Life for Minions",
        .description = "#% increased maximum Life for Minions"
    };

    // ESSENCE_ALLIES_INCREASED_DAMAGE - 3 tiers
    MODIFIERS_DB[329] = (Modifier){
        .id = 329,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = "Allies in your Presence deal #% increased damage",
        .description = "Allies in your Presence deal #% increased damage"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[330] = (Modifier){
        .id = 330,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[331] = (Modifier){
        .id = 331,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[332] = (Modifier){
        .id = 332,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_AURA_SKILLS_MAGNITUDE - 1 tiers
    MODIFIERS_DB[333] = (Modifier){
        .id = 333,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Aura Skills have (#–#)% increased Magnitudes",
        .description = "Aura Skills have (#–#)% increased Magnitudes"
    };

    // DESECRATED_INCREASED_ATTACK_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[334] = (Modifier){
        .id = 334,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Area of Effect for Attacks",
        .description = "#% increased Area of Effect for Attacks"
    };

    // DESECRATED_COMPANION_DAMAGE - 1 tiers
    MODIFIERS_DB[335] = (Modifier){
        .id = 335,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = ",
            ",
        .description = ",
            "
    };

    // DESECRATED_FIRE_PENETRATION - 1 tiers
    MODIFIERS_DB[336] = (Modifier){
        .id = 336,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Fire Resistance",
        .description = "Attacks with this Weapon Penetrate #% Fire Resistance"
    };

    // DESECRATED_CHAIN_FROM_TERRAIN - 1 tiers
    MODIFIERS_DB[337] = (Modifier){
        .id = 337,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Projectiles have #% chance to Chain an additional time from ter",
        .description = "Projectiles have #% chance to Chain an additional time from terrain"
    };

    // DESECRATED_INCREASED_MELEE_DAMAGE_IF_PROJECTILE_ATTACK_RECENT - 1 tiers
    MODIFIERS_DB[338] = (Modifier){
        .id = 338,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Melee Damage if you've dealt a Projectile Attack H",
        .description = "#% increased Melee Damage if you've dealt a Projectile Attack Hit in the past eight seconds"
    };

    // DESECRATED_COLD_PENETRATION - 1 tiers
    MODIFIERS_DB[339] = (Modifier){
        .id = 339,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Cold Resistance",
        .description = "Attacks with this Weapon Penetrate #% Cold Resistance"
    };

    // DESECRATED_LIGHTNING_PENETRATION - 1 tiers
    MODIFIERS_DB[340] = (Modifier){
        .id = 340,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Attacks with this Weapon Penetrate #% Lightning Resistance",
        .description = "Attacks with this Weapon Penetrate #% Lightning Resistance"
    };

    // DESECRATED_CHANCE_TO_PIERCE - 1 tiers
    MODIFIERS_DB[341] = (Modifier){
        .id = 341,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Pierce an Enemy",
        .description = "#% chance to Pierce an Enemy"
    };

    // DESECRATED_COMPANION_ATTACK_SPEED - 1 tiers
    MODIFIERS_DB[342] = (Modifier){
        .id = 342,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Speed\nCompanions have #% increased Attack ",
        .description = "#% increased Attack Speed\nCompanions have #% increased Attack Speed"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[343] = (Modifier){
        .id = 343,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_IMMOBILISATION_BUILDUP - 1 tiers
    MODIFIERS_DB[344] = (Modifier){
        .id = 344,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Immobilisation buildup",
        .description = "#% increased Immobilisation buildup"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[345] = (Modifier){
        .id = 345,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency of Attacks",
        .description = "#% increased Cost Efficiency of Attacks"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[346] = (Modifier){
        .id = 346,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING - 1 tiers
    MODIFIERS_DB[347] = (Modifier){
        .id = 347,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Projectile Attacks have a #% chance to fire two additional Proj",
        .description = "Projectile Attacks have a #% chance to fire two additional Projectiles while moving"
    };

    // DESECRATED_COMPANION_ATTACK_SPEED_PRESENCE - 1 tiers
    MODIFIERS_DB[348] = (Modifier){
        .id = 348,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Speed\n#% increased Attack Speed while your",
        .description = "#% increased Attack Speed\n#% increased Attack Speed while your Companion is in your Presence"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[349] = (Modifier){
        .id = 349,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[350] = (Modifier){
        .id = 350,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 900,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[351] = (Modifier){
        .id = 351,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 10 tiers
    MODIFIERS_DB[352] = (Modifier){
        .id = 352,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1100,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_PHYSICAL_DAMAGE_PERCENT - 8 tiers
    MODIFIERS_DB[353] = (Modifier){
        .id = 353,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage",
        .description = "#% increased Physical Damage"
    };

    // HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[354] = (Modifier){
        .id = 354,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[355] = (Modifier){
        .id = 355,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Physical Damage\n+# to Accuracy Rating",
        .description = "#% increased Physical Damage\n+# to Accuracy Rating"
    };

    // INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS - 6 tiers
    MODIFIERS_DB[356] = (Modifier){
        .id = 356,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 4,
        .tags = 0,
        .name = "#% increased Elemental Damage with Attacks",
        .description = "#% increased Elemental Damage with Attacks"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[357] = (Modifier){
        .id = 357,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[358] = (Modifier){
        .id = 358,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[359] = (Modifier){
        .id = 359,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 5 tiers
    MODIFIERS_DB[360] = (Modifier){
        .id = 360,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LEVEL_PROJECTILE_SKILL - 5 tiers
    MODIFIERS_DB[361] = (Modifier){
        .id = 361,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[362] = (Modifier){
        .id = 362,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[363] = (Modifier){
        .id = 363,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[364] = (Modifier){
        .id = 364,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[365] = (Modifier){
        .id = 365,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[366] = (Modifier){
        .id = 366,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 8 tiers
    MODIFIERS_DB[367] = (Modifier){
        .id = 367,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_HIT_CHANCE - 0 tiers
    MODIFIERS_DB[368] = (Modifier){
        .id = 368,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // CRITICAL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[369] = (Modifier){
        .id = 369,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+#% to Critical Damage Bonus",
        .description = "+#% to Critical Damage Bonus"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[370] = (Modifier){
        .id = 370,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // INCREASED_STUN_DURATION - 6 tiers
    MODIFIERS_DB[371] = (Modifier){
        .id = 371,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Stun Duration",
        .description = "#% increased Stun Duration"
    };

    // INCREASED_STUN_BUILDUP - 6 tiers
    MODIFIERS_DB[372] = (Modifier){
        .id = 372,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "Causes #% increased Stun Buildup",
        .description = "Causes #% increased Stun Buildup"
    };

    // ESSENCE_PHYSICAL_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[373] = (Modifier){
        .id = 373,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_FIRE_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[374] = (Modifier){
        .id = 374,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_COLD_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[375] = (Modifier){
        .id = 375,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_LIGHTNING_DAMAGE_FLAT - 3 tiers
    MODIFIERS_DB[376] = (Modifier){
        .id = 376,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[377] = (Modifier){
        .id = 377,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL - 1 tiers
    MODIFIERS_DB[378] = (Modifier){
        .id = 378,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Physical Damage",
        .description = "Gain # % of Damage as Extra Physical Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_FIRE - 1 tiers
    MODIFIERS_DB[379] = (Modifier){
        .id = 379,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Fire Damage",
        .description = "Gain # % of Damage as Extra Fire Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_COLD - 1 tiers
    MODIFIERS_DB[380] = (Modifier){
        .id = 380,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Cold Damage",
        .description = "Gain # % of Damage as Extra Cold Damage"
    };

    // ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING - 1 tiers
    MODIFIERS_DB[381] = (Modifier){
        .id = 381,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Gain # % of Damage as Extra Lightning Damage",
        .description = "Gain # % of Damage as Extra Lightning Damage"
    };

    // ESSENCE_INCREASED_ATTACK_SPEED - 3 tiers
    MODIFIERS_DB[382] = (Modifier){
        .id = 382,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 22,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[383] = (Modifier){
        .id = 383,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[384] = (Modifier){
        .id = 384,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[385] = (Modifier){
        .id = 385,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_ATTACK_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[386] = (Modifier){
        .id = 386,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Attack Skills",
        .description = "+# to Level of all Attack Skills"
    };

    // ESSENCE_ONSLAUGHT - 1 tiers
    MODIFIERS_DB[387] = (Modifier){
        .id = 387,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% chance to gain Onslaught on Killing Hits with this Weapon",
        .description = "#% chance to gain Onslaught on Killing Hits with this Weapon"
    };

    // ESSENCE_CRITICAL_STRIKE_CHANCE - 0 tiers
    MODIFIERS_DB[388] = (Modifier){
        .id = 388,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Critical Hit Chance",
        .description = "+#% to Critical Hit Chance"
    };

    // DESECRATED_COMPANION_SPELL_DAMAGE - 1 tiers
    MODIFIERS_DB[389] = (Modifier){
        .id = 389,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage\nMinions deal #% increased Damage",
        .description = "#% increased Spell Damage\nMinions deal #% increased Damage"
    };

    // DESECRATED_INCREASED_ELEMENTAL_DAMAGE - 1 tiers
    MODIFIERS_DB[390] = (Modifier){
        .id = 390,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Elemental Damage",
        .description = "#% increased Elemental Damage"
    };

    // DESECRATED_INCREASED_SPELL_DAMAGE_LIFE_COST - 1 tiers
    MODIFIERS_DB[391] = (Modifier){
        .id = 391,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage with Spells that cost Life",
        .description = "#% increased Spell Damage with Spells that cost Life"
    };

    // DESECRATED_INCREASED_MAGNITUDE_BLEEDING - 1 tiers
    MODIFIERS_DB[392] = (Modifier){
        .id = 392,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Bleeding you inflict",
        .description = "#% increased Magnitude of Bleeding you inflict"
    };

    // DESECRATED_DAMAGE_AS_EXTRA_PHYSICAL_DAMAGE - 1 tiers
    MODIFIERS_DB[393] = (Modifier){
        .id = 393,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Gain #% of Damage as Extra Physical Damage",
        .description = "Gain #% of Damage as Extra Physical Damage"
    };

    // DESECRATED_HINDERED_ENEMY_INCREASED_ELEMENTAL_DAMAGE - 1 tiers
    MODIFIERS_DB[394] = (Modifier){
        .id = 394,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Enemies Hindered by you take #% increased Elemental Damage",
        .description = "Enemies Hindered by you take #% increased Elemental Damage"
    };

    // DESECRATED_HINDERED_ENEMY_INCREASED_CHAOS_DAMAGE - 1 tiers
    MODIFIERS_DB[395] = (Modifier){
        .id = 395,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Enemies Hindered by you take #% increased Chaos Damage",
        .description = "Enemies Hindered by you take #% increased Chaos Damage"
    };

    // DESECRATED_HINDERED_ENEMY_INCREASED_PHYSICAL_DAMAGE - 1 tiers
    MODIFIERS_DB[396] = (Modifier){
        .id = 396,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Enemies Hindered by you take #% increased Physical Damage",
        .description = "Enemies Hindered by you take #% increased Physical Damage"
    };

    // DESECRATED_SPELL_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[397] = (Modifier){
        .id = 397,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Spell Skills have #% increased Area of Effect",
        .description = "Spell Skills have #% increased Area of Effect"
    };

    // DESECRATED_SPELL_LIFE_COST_AND_EFFICIENCY - 1 tiers
    MODIFIERS_DB[398] = (Modifier){
        .id = 398,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cost Efficiency\n#% of Spell Mana Cost Converted t",
        .description = "#% increased Cost Efficiency\n#% of Spell Mana Cost Converted to Life Cost"
    };

    // DESECRATED_HYBRID_INCREASED_CAST_SPEED_FULL_MANA_AND_DIFFERENT_SPELLS - 1 tiers
    MODIFIERS_DB[399] = (Modifier){
        .id = 399,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cast Speed while on Full Mana\n#% increased Cast S",
        .description = "#% increased Cast Speed while on Full Mana\n#% increased Cast Speed for each different Non-Instant Spell you've Cast Recently"
    };

    // DESECRATED_BREAK_INCREASED_ARMOUR - 1 tiers
    MODIFIERS_DB[400] = (Modifier){
        .id = 400,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // DESECRATED_BREAK_ARMOUR_ON_CRIT - 1 tiers
    MODIFIERS_DB[401] = (Modifier){
        .id = 401,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Break Armour on Critical Hit with Spells equal to #% of Physica",
        .description = "Break Armour on Critical Hit with Spells equal to #% of Physical Damage dealt"
    };

    // MAXIMUM_MANA - 11 tiers
    MODIFIERS_DB[402] = (Modifier){
        .id = 402,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // INCREASED_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[403] = (Modifier){
        .id = 403,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Spell Damage",
        .description = "+#% Increased Spell Damage"
    };

    // HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA - 7 tiers
    MODIFIERS_DB[404] = (Modifier){
        .id = 404,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "+#% increased Spell Damage\n+# to maximum Mana",
        .description = "+#% increased Spell Damage\n+# to maximum Mana"
    };

    // INCREASED_FIRE_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[405] = (Modifier){
        .id = 405,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Fire Spell Damage",
        .description = "+#% Increased Fire Spell Damage"
    };

    // INCREASED_COLD_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[406] = (Modifier){
        .id = 406,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Cold Spell Damage",
        .description = "+#% Increased Cold Spell Damage"
    };

    // INCREASED_LIGHTNING_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[407] = (Modifier){
        .id = 407,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Lightning Spell Damage",
        .description = "+#% Increased Lightning Spell Damage"
    };

    // INCREASED_CHAOS_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[408] = (Modifier){
        .id = 408,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Chaos Spell Damage",
        .description = "+#% Increased Chaos Spell Damage"
    };

    // INCREASED_PHYSICAL_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[409] = (Modifier){
        .id = 409,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Physical Spell Damage",
        .description = "+#% Increased Physical Spell Damage"
    };

    // DAMAGE_AS_EXTRA_FIRE_DAMAGE - 6 tiers
    MODIFIERS_DB[410] = (Modifier){
        .id = 410,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Fire Damage",
        .description = "% of Damage as Extra Fire Damage"
    };

    // DAMAGE_AS_EXTRA_COLD_DAMAGE - 6 tiers
    MODIFIERS_DB[411] = (Modifier){
        .id = 411,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Cold Damage",
        .description = "% of Damage as Extra Cold Damage"
    };

    // DAMAGE_AS_EXTRA_LIGHTNING_DAMAGE - 6 tiers
    MODIFIERS_DB[412] = (Modifier){
        .id = 412,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "% of Damage as Extra Lightning Damage",
        .description = "% of Damage as Extra Lightning Damage"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[413] = (Modifier){
        .id = 413,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[414] = (Modifier){
        .id = 414,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ALL_SPELL_SKILL_LEVEL - 4 tiers
    MODIFIERS_DB[415] = (Modifier){
        .id = 415,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 200,
        .level_req = 5,
        .tags = 0,
        .name = "# to Level of all Spell Skills",
        .description = "# to Level of all Spell Skills"
    };

    // FIRE_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[416] = (Modifier){
        .id = 416,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "# to Level of all Fire Spell Skills",
        .description = "# to Level of all Fire Spell Skills"
    };

    // COLD_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[417] = (Modifier){
        .id = 417,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "# to Level of all Cold Spell Skills",
        .description = "# to Level of all Cold Spell Skills"
    };

    // LIGHTNING_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[418] = (Modifier){
        .id = 418,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "# to Level of all Lightning Spell Skills",
        .description = "# to Level of all Lightning Spell Skills"
    };

    // CHAOS_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[419] = (Modifier){
        .id = 419,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "# to Level of all Chaos Spell Skills",
        .description = "# to Level of all Chaos Spell Skills"
    };

    // PHYSICAL_SKILL_LEVEL - 5 tiers
    MODIFIERS_DB[420] = (Modifier){
        .id = 420,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "# to Level of all Physical Spell Skills",
        .description = "# to Level of all Physical Spell Skills"
    };

    // MANA_REGENERATION_RATE - 6 tiers
    MODIFIERS_DB[421] = (Modifier){
        .id = 421,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[422] = (Modifier){
        .id = 422,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[423] = (Modifier){
        .id = 423,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // INCREASED_CAST_SPEED - 7 tiers
    MODIFIERS_DB[424] = (Modifier){
        .id = 424,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // INCREASED_CRITICAL_HIT_CHANCE_SPELLS - 6 tiers
    MODIFIERS_DB[425] = (Modifier){
        .id = 425,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 11,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // CRITICAL_SPELL_DAMAGE_BONUS - 6 tiers
    MODIFIERS_DB[426] = (Modifier){
        .id = 426,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Spell Damage Bonus",
        .description = "#% increased Critical Spell Damage Bonus"
    };

    // HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[427] = (Modifier){
        .id = 427,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate / #%Light Radius",
        .description = "#% increased Mana Regeneration Rate / #%Light Radius"
    };

    // INCREASED_FLAMMABILITY_MAGNITUDE - 5 tiers
    MODIFIERS_DB[428] = (Modifier){
        .id = 428,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Flammability Magnitude",
        .description = "#% increased Flammability Magnitude"
    };

    // INCREASED_FREEZE_BUILDUP - 5 tiers
    MODIFIERS_DB[429] = (Modifier){
        .id = 429,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Freeze Buildup",
        .description = "#% increased Freeze Buildup"
    };

    // INCREASED_SHOCK_CHANCE - 5 tiers
    MODIFIERS_DB[430] = (Modifier){
        .id = 430,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased chance to Shock",
        .description = "#% increased chance to Shock"
    };

    // ESSENCE_INCREASED_SPELL_DAMAGE - 3 tiers
    MODIFIERS_DB[431] = (Modifier){
        .id = 431,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Spell Damage",
        .description = "#% increased Spell Damage"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[432] = (Modifier){
        .id = 432,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[433] = (Modifier){
        .id = 433,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[434] = (Modifier){
        .id = 434,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_SPELL_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[435] = (Modifier){
        .id = 435,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // ESSENCE_SPELL_CRIT_CHANCE - 3 tiers
    MODIFIERS_DB[436] = (Modifier){
        .id = 436,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 21,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // ESSENCE_INCREASED_CAST_SPEED - 3 tiers
    MODIFIERS_DB[437] = (Modifier){
        .id = 437,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // ESSENCE_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[438] = (Modifier){
        .id = 438,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[439] = (Modifier){
        .id = 439,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[440] = (Modifier){
        .id = 440,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SHIELD_SKILLS_STUNNING_BREAKS_ARMOUR - 1 tiers
    MODIFIERS_DB[441] = (Modifier){
        .id = 441,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits with Shield Skills which Heavy Stun enemies fully Break Ar",
        .description = "Hits with Shield Skills which Heavy Stun enemies fully Break Armour"
    };

    // DESECRATED_HEAVY_STUN_DECAY_RATE - 1 tiers
    MODIFIERS_DB[442] = (Modifier){
        .id = 442,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Your Heavy Stun buildup empties (#–#)% faster",
        .description = "Your Heavy Stun buildup empties (#–#)% faster"
    };

    // DESECRATED_ALL_MAXIMUM_RESISTANCES - 1 tiers
    MODIFIERS_DB[443] = (Modifier){
        .id = 443,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to all Maximum Resistances",
        .description = "+#% to all Maximum Resistances"
    };

    // DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[444] = (Modifier){
        .id = 444,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF - 1 tiers
    MODIFIERS_DB[445] = (Modifier){
        .id = 445,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced effect of Curses on you",
        .description = "#% reduced effect of Curses on you"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[446] = (Modifier){
        .id = 446,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_DAMAGE_RECOUPED_AS_MANA - 1 tiers
    MODIFIERS_DB[447] = (Modifier){
        .id = 447,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // DESECRATED_GAIN_MANA_ON_BLOCK - 1 tiers
    MODIFIERS_DB[448] = (Modifier){
        .id = 448,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#) Mana gained when you Block",
        .description = "(#–#) Mana gained when you Block"
    };

    // DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE - 1 tiers
    MODIFIERS_DB[449] = (Modifier){
        .id = 449,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% of Armour also applies to Chaos Damage",
        .description = "+#% of Armour also applies to Chaos Damage"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[450] = (Modifier){
        .id = 450,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[451] = (Modifier){
        .id = 451,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION - 1 tiers
    MODIFIERS_DB[452] = (Modifier){
        .id = 452,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits have #% reduced Critical Hit Chance against you",
        .description = "Hits have #% reduced Critical Hit Chance against you"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[453] = (Modifier){
        .id = 453,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_PHYSICAL_DAMAGE_TAKEN_AS_LIGHTNING_WHILE_ACTIVE_BLOCKING - 1 tiers
    MODIFIERS_DB[454] = (Modifier){
        .id = 454,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% of Physical Damage taken as Lightning while Active Block",
        .description = "(#–#)% of Physical Damage taken as Lightning while Active Blocking"
    };

    // DESECRATED_MAXIMUM_BLOCK_CHANCE - 1 tiers
    MODIFIERS_DB[455] = (Modifier){
        .id = 455,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+(#–#)% to maximum Block chance",
        .description = "+(#–#)% to maximum Block chance"
    };

    // DESECRATED_PARRIED_DEBUFF_DURATION - 1 tiers
    MODIFIERS_DB[456] = (Modifier){
        .id = 456,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% increased Parried Debuff Duration",
        .description = "(#–#)% increased Parried Debuff Duration"
    };

    // DESECRATED_PARRIED_DEBUFF_MAGNITUDE - 1 tiers
    MODIFIERS_DB[457] = (Modifier){
        .id = 457,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% increased Parried Debuff Magnitude",
        .description = "(#–#)% increased Parried Debuff Magnitude"
    };

    // BASE_MAXIMUM_LIFE - 11 tiers
    MODIFIERS_DB[458] = (Modifier){
        .id = 458,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_ARMOUR - 10 tiers
    MODIFIERS_DB[459] = (Modifier){
        .id = 459,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour",
        .description = "+# to Armour"
    };

    // INCREASED_PERCENT_ARMOUR - 8 tiers
    MODIFIERS_DB[460] = (Modifier){
        .id = 460,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_STUN - 6 tiers
    MODIFIERS_DB[461] = (Modifier){
        .id = 461,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour\n+# to Stun Threshold",
        .description = "#% increased Armour\n+# to Stun Threshold"
    };

    // PHYSICAL_THORNS_DAMAGE - 7 tiers
    MODIFIERS_DB[462] = (Modifier){
        .id = 462,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_SHIELD_BLOCK_CHANCE - 3 tiers
    MODIFIERS_DB[463] = (Modifier){
        .id = 463,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "(#–#)% increased Block chance",
        .description = "(#–#)% increased Block chance"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[464] = (Modifier){
        .id = 464,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[465] = (Modifier){
        .id = 465,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[466] = (Modifier){
        .id = 466,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[467] = (Modifier){
        .id = 467,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[468] = (Modifier){
        .id = 468,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[469] = (Modifier){
        .id = 469,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 10 tiers
    MODIFIERS_DB[470] = (Modifier){
        .id = 470,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // PHYSICAL_DAMAGE_REDUCTION - 5 tiers
    MODIFIERS_DB[471] = (Modifier){
        .id = 471,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 32,
        .tags = 0,
        .name = "#% additional Physical Damage Reduction",
        .description = "#% additional Physical Damage Reduction"
    };

    // MAXIMUM_FIRE_RESIST - 3 tiers
    MODIFIERS_DB[472] = (Modifier){
        .id = 472,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Fire Resistance",
        .description = "+#% to Maximum Fire Resistance"
    };

    // MAXIMUM_COLD_RESIST - 3 tiers
    MODIFIERS_DB[473] = (Modifier){
        .id = 473,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Cold Resistance",
        .description = "+#% to Maximum Cold Resistance"
    };

    // MAXIMUM_LIGHTNING_RESIST - 3 tiers
    MODIFIERS_DB[474] = (Modifier){
        .id = 474,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Lightning Resistance",
        .description = "+#% to Maximum Lightning Resistance"
    };

    // MAXIMUM_CHAOS_RESIST - 3 tiers
    MODIFIERS_DB[475] = (Modifier){
        .id = 475,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Chaos Resistance",
        .description = "+#% to Maximum Chaos Resistance"
    };

    // ALL_MAXIMUM_RESISTANCES - 2 tiers
    MODIFIERS_DB[476] = (Modifier){
        .id = 476,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 75,
        .tags = 0,
        .name = "+#% to all Maximum Elemental Resistances",
        .description = "+#% to all Maximum Elemental Resistances"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 6 tiers
    MODIFIERS_DB[477] = (Modifier){
        .id = 477,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[478] = (Modifier){
        .id = 478,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[479] = (Modifier){
        .id = 479,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[480] = (Modifier){
        .id = 480,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[481] = (Modifier){
        .id = 481,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_INCREASED_SHIELD_BLOCK_PERCENTAGE - 1 tiers
    MODIFIERS_DB[482] = (Modifier){
        .id = 482,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 33,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[483] = (Modifier){
        .id = 483,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[484] = (Modifier){
        .id = 484,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[485] = (Modifier){
        .id = 485,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[486] = (Modifier){
        .id = 486,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[487] = (Modifier){
        .id = 487,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[488] = (Modifier){
        .id = 488,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[489] = (Modifier){
        .id = 489,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[490] = (Modifier){
        .id = 490,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[491] = (Modifier){
        .id = 491,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SHIELD_SKILLS_STUNNING_BREAKS_ARMOUR - 1 tiers
    MODIFIERS_DB[492] = (Modifier){
        .id = 492,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits with Shield Skills which Heavy Stun enemies fully Break Ar",
        .description = "Hits with Shield Skills which Heavy Stun enemies fully Break Armour"
    };

    // DESECRATED_HEAVY_STUN_DECAY_RATE - 1 tiers
    MODIFIERS_DB[493] = (Modifier){
        .id = 493,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Your Heavy Stun buildup empties (#–#)% faster",
        .description = "Your Heavy Stun buildup empties (#–#)% faster"
    };

    // DESECRATED_ALL_MAXIMUM_RESISTANCES - 1 tiers
    MODIFIERS_DB[494] = (Modifier){
        .id = 494,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to all Maximum Resistances",
        .description = "+#% to all Maximum Resistances"
    };

    // DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[495] = (Modifier){
        .id = 495,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF - 1 tiers
    MODIFIERS_DB[496] = (Modifier){
        .id = 496,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced effect of Curses on you",
        .description = "#% reduced effect of Curses on you"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[497] = (Modifier){
        .id = 497,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_DAMAGE_RECOUPED_AS_MANA - 1 tiers
    MODIFIERS_DB[498] = (Modifier){
        .id = 498,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // DESECRATED_GAIN_MANA_ON_BLOCK - 1 tiers
    MODIFIERS_DB[499] = (Modifier){
        .id = 499,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#) Mana gained when you Block",
        .description = "(#–#) Mana gained when you Block"
    };

    // DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE - 1 tiers
    MODIFIERS_DB[500] = (Modifier){
        .id = 500,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% of Armour also applies to Chaos Damage",
        .description = "+#% of Armour also applies to Chaos Damage"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[501] = (Modifier){
        .id = 501,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[502] = (Modifier){
        .id = 502,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION - 1 tiers
    MODIFIERS_DB[503] = (Modifier){
        .id = 503,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits have #% reduced Critical Hit Chance against you",
        .description = "Hits have #% reduced Critical Hit Chance against you"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[504] = (Modifier){
        .id = 504,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_PHYSICAL_DAMAGE_TAKEN_AS_LIGHTNING_WHILE_ACTIVE_BLOCKING - 1 tiers
    MODIFIERS_DB[505] = (Modifier){
        .id = 505,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% of Physical Damage taken as Lightning while Active Block",
        .description = "(#–#)% of Physical Damage taken as Lightning while Active Blocking"
    };

    // DESECRATED_MAXIMUM_BLOCK_CHANCE - 1 tiers
    MODIFIERS_DB[506] = (Modifier){
        .id = 506,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+(#–#)% to maximum Block chance",
        .description = "+(#–#)% to maximum Block chance"
    };

    // DESECRATED_PARRIED_DEBUFF_DURATION - 1 tiers
    MODIFIERS_DB[507] = (Modifier){
        .id = 507,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% increased Parried Debuff Duration",
        .description = "(#–#)% increased Parried Debuff Duration"
    };

    // DESECRATED_PARRIED_DEBUFF_MAGNITUDE - 1 tiers
    MODIFIERS_DB[508] = (Modifier){
        .id = 508,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% increased Parried Debuff Magnitude",
        .description = "(#–#)% increased Parried Debuff Magnitude"
    };

    // BASE_MAXIMUM_LIFE - 11 tiers
    MODIFIERS_DB[509] = (Modifier){
        .id = 509,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // HYBRID_BASE_ARMOUR_EVASION - 7 tiers
    MODIFIERS_DB[510] = (Modifier){
        .id = 510,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to Evasion Rating",
        .description = "+# to Armour\n+# to Evasion Rating"
    };

    // HYBRID_BASE_ARMOUR_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[511] = (Modifier){
        .id = 511,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to maximum Energy Shield",
        .description = "+# to Armour\n+# to maximum Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 8 tiers
    MODIFIERS_DB[512] = (Modifier){
        .id = 512,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[513] = (Modifier){
        .id = 513,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_STUN - 6 tiers
    MODIFIERS_DB[514] = (Modifier){
        .id = 514,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to Stun Threshold",
        .description = "#% increased Armour and Evasion\n+# to Stun Threshold"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_STUN - 6 tiers
    MODIFIERS_DB[515] = (Modifier){
        .id = 515,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to Stun Threshold",
        .description = "#% increased Armour and Energy Shield\n+# to Stun Threshold"
    };

    // PHYSICAL_THORNS_DAMAGE - 7 tiers
    MODIFIERS_DB[516] = (Modifier){
        .id = 516,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_SHIELD_BLOCK_CHANCE - 3 tiers
    MODIFIERS_DB[517] = (Modifier){
        .id = 517,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "(#–#)% increased Block chance",
        .description = "(#–#)% increased Block chance"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[518] = (Modifier){
        .id = 518,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[519] = (Modifier){
        .id = 519,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[520] = (Modifier){
        .id = 520,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[521] = (Modifier){
        .id = 521,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[522] = (Modifier){
        .id = 522,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[523] = (Modifier){
        .id = 523,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[524] = (Modifier){
        .id = 524,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[525] = (Modifier){
        .id = 525,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 10 tiers
    MODIFIERS_DB[526] = (Modifier){
        .id = 526,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // PHYSICAL_DAMAGE_REDUCTION - 5 tiers
    MODIFIERS_DB[527] = (Modifier){
        .id = 527,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 32,
        .tags = 0,
        .name = "#% additional Physical Damage Reduction",
        .description = "#% additional Physical Damage Reduction"
    };

    // MAXIMUM_FIRE_RESIST - 3 tiers
    MODIFIERS_DB[528] = (Modifier){
        .id = 528,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Fire Resistance",
        .description = "+#% to Maximum Fire Resistance"
    };

    // MAXIMUM_COLD_RESIST - 3 tiers
    MODIFIERS_DB[529] = (Modifier){
        .id = 529,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Cold Resistance",
        .description = "+#% to Maximum Cold Resistance"
    };

    // MAXIMUM_LIGHTNING_RESIST - 3 tiers
    MODIFIERS_DB[530] = (Modifier){
        .id = 530,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Lightning Resistance",
        .description = "+#% to Maximum Lightning Resistance"
    };

    // MAXIMUM_CHAOS_RESIST - 3 tiers
    MODIFIERS_DB[531] = (Modifier){
        .id = 531,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Chaos Resistance",
        .description = "+#% to Maximum Chaos Resistance"
    };

    // ALL_MAXIMUM_RESISTANCES - 2 tiers
    MODIFIERS_DB[532] = (Modifier){
        .id = 532,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 75,
        .tags = 0,
        .name = "+#% to all Maximum Elemental Resistances",
        .description = "+#% to all Maximum Elemental Resistances"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 6 tiers
    MODIFIERS_DB[533] = (Modifier){
        .id = 533,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 6 tiers
    MODIFIERS_DB[534] = (Modifier){
        .id = 534,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 6 tiers
    MODIFIERS_DB[535] = (Modifier){
        .id = 535,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[536] = (Modifier){
        .id = 536,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[537] = (Modifier){
        .id = 537,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[538] = (Modifier){
        .id = 538,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[539] = (Modifier){
        .id = 539,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 3 tiers
    MODIFIERS_DB[540] = (Modifier){
        .id = 540,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[541] = (Modifier){
        .id = 541,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[542] = (Modifier){
        .id = 542,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // ESSENCE_INCREASED_SHIELD_BLOCK_PERCENTAGE - 1 tiers
    MODIFIERS_DB[543] = (Modifier){
        .id = 543,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 33,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[544] = (Modifier){
        .id = 544,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[545] = (Modifier){
        .id = 545,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[546] = (Modifier){
        .id = 546,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[547] = (Modifier){
        .id = 547,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[548] = (Modifier){
        .id = 548,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[549] = (Modifier){
        .id = 549,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[550] = (Modifier){
        .id = 550,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // DESECRATED_OFFERING_EFFECT - 1 tiers
    MODIFIERS_DB[551] = (Modifier){
        .id = 551,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Offering Skills have #% increased Buff effect",
        .description = "Offering Skills have #% increased Buff effect"
    };

    // DESECRATED_CURSE_EFFECTIVENESS - 1 tiers
    MODIFIERS_DB[552] = (Modifier){
        .id = 552,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Curse Magnitudes",
        .description = "#% increased Curse Magnitudes"
    };

    // DESECRATED_SPELL_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[553] = (Modifier){
        .id = 553,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Spell Skills have #% increased Area of Effect",
        .description = "Spell Skills have #% increased Area of Effect"
    };

    // DESECRATED_INVOCATED_SPELLS_INCREASED_DAMAGE - 1 tiers
    MODIFIERS_DB[554] = (Modifier){
        .id = 554,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Invocated Spells deal #% increased Damage",
        .description = "Invocated Spells deal #% increased Damage"
    };

    // DESECRATED_ADDITIONAL_SPELL_TOTEM - 1 tiers
    MODIFIERS_DB[555] = (Modifier){
        .id = 555,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Spell Skills have +# to maximum number of Summoned Totems",
        .description = "Spell Skills have +# to maximum number of Summoned Totems"
    };

    // DESECRATED_INCREASED_SPELL_DAMAGE_WHILE_MELEE_WEAPON - 1 tiers
    MODIFIERS_DB[556] = (Modifier){
        .id = 556,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage while wielding a Melee Weapon",
        .description = "#% increased Spell Damage while wielding a Melee Weapon"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[557] = (Modifier){
        .id = 557,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[558] = (Modifier){
        .id = 558,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_LEVEL_MINION_SKILL - 1 tiers
    MODIFIERS_DB[559] = (Modifier){
        .id = 559,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // DESECRATED_FASTER_CURSE - 1 tiers
    MODIFIERS_DB[560] = (Modifier){
        .id = 560,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% faster Curse Activation",
        .description = "#% faster Curse Activation"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[561] = (Modifier){
        .id = 561,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[562] = (Modifier){
        .id = 562,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[563] = (Modifier){
        .id = 563,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_CHANCE_TO_GAIN_ADDITIONAL_INFUSION - 1 tiers
    MODIFIERS_DB[564] = (Modifier){
        .id = 564,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance when collecting an Elemental Infusion to gain an addi",
        .description = "#% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[565] = (Modifier){
        .id = 565,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[566] = (Modifier){
        .id = 566,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_SKILL_LIFE_COST - 1 tiers
    MODIFIERS_DB[567] = (Modifier){
        .id = 567,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Spell Mana Cost Converted to Life Cost",
        .description = "#% of Spell Mana Cost Converted to Life Cost"
    };

    // MAXIMUM_MANA - 11 tiers
    MODIFIERS_DB[568] = (Modifier){
        .id = 568,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ENERGY_SHIELD - 10 tiers
    MODIFIERS_DB[569] = (Modifier){
        .id = 569,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[570] = (Modifier){
        .id = 570,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA - 6 tiers
    MODIFIERS_DB[571] = (Modifier){
        .id = 571,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Energy Shield\n+# to maximum Mana",
        .description = "#% increased Energy Shield\n+# to maximum Mana"
    };

    // INCREASED_SPELL_DAMAGE - 8 tiers
    MODIFIERS_DB[572] = (Modifier){
        .id = 572,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Spell Damage",
        .description = "+#% Increased Spell Damage"
    };

    // INCREASED_FIRE_DAMAGE - 8 tiers
    MODIFIERS_DB[573] = (Modifier){
        .id = 573,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Fire Damage",
        .description = "+#% Increased Fire Damage"
    };

    // INCREASED_COLD_DAMAGE - 8 tiers
    MODIFIERS_DB[574] = (Modifier){
        .id = 574,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Cold Damage",
        .description = "+#% Increased Cold Damage"
    };

    // INCREASED_LIGHTNING_DAMAGE - 8 tiers
    MODIFIERS_DB[575] = (Modifier){
        .id = 575,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Lightning Damage",
        .description = "+#% Increased Lightning Damage"
    };

    // INCREASED_CHAOS_DAMAGE - 8 tiers
    MODIFIERS_DB[576] = (Modifier){
        .id = 576,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Chaos Damage",
        .description = "+#% Increased Chaos Damage"
    };

    // INCREASED_SPELL_PHYSICAL_DAMAGE - 8 tiers
    MODIFIERS_DB[577] = (Modifier){
        .id = 577,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 2,
        .tags = 0,
        .name = "+#% Increased Spell Physical Damage",
        .description = "+#% Increased Spell Physical Damage"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[578] = (Modifier){
        .id = 578,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[579] = (Modifier){
        .id = 579,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[580] = (Modifier){
        .id = 580,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[581] = (Modifier){
        .id = 581,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[582] = (Modifier){
        .id = 582,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[583] = (Modifier){
        .id = 583,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ALL_SPELL_SKILL_LEVEL - 2 tiers
    MODIFIERS_DB[584] = (Modifier){
        .id = 584,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // MANA_REGENERATION_RATE - 6 tiers
    MODIFIERS_DB[585] = (Modifier){
        .id = 585,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // INCREASED_CAST_SPEED - 6 tiers
    MODIFIERS_DB[586] = (Modifier){
        .id = 586,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // INCREASED_CRITICAL_HIT_CHANCE_SPELLS - 5 tiers
    MODIFIERS_DB[587] = (Modifier){
        .id = 587,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 11,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // CRITICAL_SPELL_DAMAGE_BONUS - 5 tiers
    MODIFIERS_DB[588] = (Modifier){
        .id = 588,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Spell Damage Bonus",
        .description = "#% increased Critical Spell Damage Bonus"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 6 tiers
    MODIFIERS_DB[589] = (Modifier){
        .id = 589,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ENERGY_SHIELD_FASTER_START_RECHARGE - 6 tiers
    MODIFIERS_DB[590] = (Modifier){
        .id = 590,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% faster start of Energy Shield Recharge",
        .description = "#% faster start of Energy Shield Recharge"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[591] = (Modifier){
        .id = 591,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[592] = (Modifier){
        .id = 592,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[593] = (Modifier){
        .id = 593,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[594] = (Modifier){
        .id = 594,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_INCREASED_SPELL_DAMAGE - 3 tiers
    MODIFIERS_DB[595] = (Modifier){
        .id = 595,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Spell Damage",
        .description = "#% increased Spell Damage"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[596] = (Modifier){
        .id = 596,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[597] = (Modifier){
        .id = 597,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[598] = (Modifier){
        .id = 598,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[599] = (Modifier){
        .id = 599,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_ALL_SPELL_SKILL_LEVEL - 1 tiers
    MODIFIERS_DB[600] = (Modifier){
        .id = 600,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // ESSENCE_ENERGY_SHIELD_REGENERATION - 1 tiers
    MODIFIERS_DB[601] = (Modifier){
        .id = 601,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 48,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_SPELL_CRITICAL_STRIKE_CHANCE_INCREASE - 3 tiers
    MODIFIERS_DB[602] = (Modifier){
        .id = 602,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 21,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Spells",
        .description = "#% increased Critical Hit Chance for Spells"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[603] = (Modifier){
        .id = 603,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[604] = (Modifier){
        .id = 604,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[605] = (Modifier){
        .id = 605,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_INCREASED_CAST_SPEED - 3 tiers
    MODIFIERS_DB[606] = (Modifier){
        .id = 606,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 15,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // ESSENCE_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[607] = (Modifier){
        .id = 607,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[608] = (Modifier){
        .id = 608,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[609] = (Modifier){
        .id = 609,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[610] = (Modifier){
        .id = 610,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF - 1 tiers
    MODIFIERS_DB[611] = (Modifier){
        .id = 611,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced effect of Curses on you",
        .description = "#% reduced effect of Curses on you"
    };

    // DESECRATED_ALL_MAXIMUM_RESISTANCES - 1 tiers
    MODIFIERS_DB[612] = (Modifier){
        .id = 612,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to all Maximum Resistances",
        .description = "+#% to all Maximum Resistances"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[613] = (Modifier){
        .id = 613,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[614] = (Modifier){
        .id = 614,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_DAMAGE_RECOUPED_AS_MANA - 1 tiers
    MODIFIERS_DB[615] = (Modifier){
        .id = 615,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[616] = (Modifier){
        .id = 616,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION - 1 tiers
    MODIFIERS_DB[617] = (Modifier){
        .id = 617,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits have #% reduced Critical Hit Chance against you",
        .description = "Hits have #% reduced Critical Hit Chance against you"
    };

    // DESECRATED_MAXIMUM_BLOCK_CHANCE - 1 tiers
    MODIFIERS_DB[618] = (Modifier){
        .id = 618,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+(#–#)% to maximum Block chance",
        .description = "+(#–#)% to maximum Block chance"
    };

    // DESECRATED_PARRIED_DEBUFF_MAGNITUDE - 1 tiers
    MODIFIERS_DB[619] = (Modifier){
        .id = 619,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "(#–#)% increased Parried Debuff Magnitude",
        .description = "(#–#)% increased Parried Debuff Magnitude"
    };

    // BASE_MAXIMUM_LIFE - 11 tiers
    MODIFIERS_DB[620] = (Modifier){
        .id = 620,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_EVASION - 10 tiers
    MODIFIERS_DB[621] = (Modifier){
        .id = 621,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // INCREASED_PERCENT_EVASION - 8 tiers
    MODIFIERS_DB[622] = (Modifier){
        .id = 622,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_STUN - 6 tiers
    MODIFIERS_DB[623] = (Modifier){
        .id = 623,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Evasion Rating\n+# to Stun Threshold",
        .description = "#% increased Evasion Rating\n+# to Stun Threshold"
    };

    // PHYSICAL_THORNS_DAMAGE - 7 tiers
    MODIFIERS_DB[624] = (Modifier){
        .id = 624,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_SHIELD_BLOCK_CHANCE - 3 tiers
    MODIFIERS_DB[625] = (Modifier){
        .id = 625,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "(#–#)% increased Block chance",
        .description = "(#–#)% increased Block chance"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[626] = (Modifier){
        .id = 626,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[627] = (Modifier){
        .id = 627,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[628] = (Modifier){
        .id = 628,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[629] = (Modifier){
        .id = 629,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[630] = (Modifier){
        .id = 630,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[631] = (Modifier){
        .id = 631,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 10 tiers
    MODIFIERS_DB[632] = (Modifier){
        .id = 632,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // MAXIMUM_FIRE_RESIST - 3 tiers
    MODIFIERS_DB[633] = (Modifier){
        .id = 633,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Fire Resistance",
        .description = "+#% to Maximum Fire Resistance"
    };

    // MAXIMUM_COLD_RESIST - 3 tiers
    MODIFIERS_DB[634] = (Modifier){
        .id = 634,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Cold Resistance",
        .description = "+#% to Maximum Cold Resistance"
    };

    // MAXIMUM_LIGHTNING_RESIST - 3 tiers
    MODIFIERS_DB[635] = (Modifier){
        .id = 635,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Lightning Resistance",
        .description = "+#% to Maximum Lightning Resistance"
    };

    // MAXIMUM_CHAOS_RESIST - 3 tiers
    MODIFIERS_DB[636] = (Modifier){
        .id = 636,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 68,
        .tags = 0,
        .name = "+#% to Maximum Chaos Resistance",
        .description = "+#% to Maximum Chaos Resistance"
    };

    // ALL_MAXIMUM_RESISTANCES - 2 tiers
    MODIFIERS_DB[637] = (Modifier){
        .id = 637,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 125,
        .level_req = 75,
        .tags = 0,
        .name = "+#% to all Maximum Elemental Resistances",
        .description = "+#% to all Maximum Elemental Resistances"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 6 tiers
    MODIFIERS_DB[638] = (Modifier){
        .id = 638,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[639] = (Modifier){
        .id = 639,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[640] = (Modifier){
        .id = 640,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[641] = (Modifier){
        .id = 641,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[642] = (Modifier){
        .id = 642,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_INCREASED_SHIELD_BLOCK_PERCENTAGE - 1 tiers
    MODIFIERS_DB[643] = (Modifier){
        .id = 643,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 33,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[644] = (Modifier){
        .id = 644,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[645] = (Modifier){
        .id = 645,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[646] = (Modifier){
        .id = 646,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[647] = (Modifier){
        .id = 647,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[648] = (Modifier){
        .id = 648,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[649] = (Modifier){
        .id = 649,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[650] = (Modifier){
        .id = 650,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // DESECRATED_PROJECTILE_SPEED_TO_DAMAGE - 1 tiers
    MODIFIERS_DB[651] = (Modifier){
        .id = 651,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Increases and Reductions to Projectile Speed also apply to Dama",
        .description = "Increases and Reductions to Projectile Speed also apply to Damage with Bows"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[652] = (Modifier){
        .id = 652,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_MANA_TO_LIFE_COST - 1 tiers
    MODIFIERS_DB[653] = (Modifier){
        .id = 653,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Skill Mana Costs Converted to Life Costs",
        .description = "#% of Skill Mana Costs Converted to Life Costs"
    };

    // DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING - 1 tiers
    MODIFIERS_DB[654] = (Modifier){
        .id = 654,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Projectile Attacks have a #% chance to fire two additional Proj",
        .description = "Projectile Attacks have a #% chance to fire two additional Projectiles while moving"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[655] = (Modifier){
        .id = 655,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[656] = (Modifier){
        .id = 656,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[657] = (Modifier){
        .id = 657,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[658] = (Modifier){
        .id = 658,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ACCURACY_RATING - 9 tiers
    MODIFIERS_DB[659] = (Modifier){
        .id = 659,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // INCREASED_PROJECTILE_SPEED - 5 tiers
    MODIFIERS_DB[660] = (Modifier){
        .id = 660,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 14,
        .tags = 0,
        .name = "#% increased Projectile Speed",
        .description = "#% increased Projectile Speed"
    };

    // INCREASED_DAMAGE_WITH_BOW_SKILLS - 6 tiers
    MODIFIERS_DB[661] = (Modifier){
        .id = 661,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Damage with Bow Skills",
        .description = "#% increased Damage with Bow Skills"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[662] = (Modifier){
        .id = 662,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // LEVEL_PROJECTILE_SKILL - 2 tiers
    MODIFIERS_DB[663] = (Modifier){
        .id = 663,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIFE_PER_ENEMY_KILLED - 6 tiers
    MODIFIERS_DB[664] = (Modifier){
        .id = 664,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 6 tiers
    MODIFIERS_DB[665] = (Modifier){
        .id = 665,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // INCREASED_ATTACK_SPEED - 4 tiers
    MODIFIERS_DB[666] = (Modifier){
        .id = 666,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // INCREASED_CRITICAL_HIT_CHANCE_FOR_ATTACKS - 6 tiers
    MODIFIERS_DB[667] = (Modifier){
        .id = 667,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Critical Hit Chance for Attacks",
        .description = "#% increased Critical Hit Chance for Attacks"
    };

    // INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS - 6 tiers
    MODIFIERS_DB[668] = (Modifier){
        .id = 668,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus for Attack Damage",
        .description = "#% increased Critical Damage Bonus for Attack Damage"
    };

    // CHANCE_TO_PIERCE - 5 tiers
    MODIFIERS_DB[669] = (Modifier){
        .id = 669,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 11,
        .tags = 0,
        .name = "#% chance to Pierce an Enemy",
        .description = "#% chance to Pierce an Enemy"
    };

    // ESSENCE_INCREASED_ACCURACY - 3 tiers
    MODIFIERS_DB[670] = (Modifier){
        .id = 670,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 18,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_INCREASED_DAMAGE_WITH_BOW_SKILLS - 1 tiers
    MODIFIERS_DB[671] = (Modifier){
        .id = 671,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 0,
        .level_req = 60,
        .tags = 0,
        .name = "#% increased Damage with Bow Skills",
        .description = "#% increased Damage with Bow Skills"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[672] = (Modifier){
        .id = 672,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[673] = (Modifier){
        .id = 673,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[674] = (Modifier){
        .id = 674,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[675] = (Modifier){
        .id = 675,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[676] = (Modifier){
        .id = 676,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[677] = (Modifier){
        .id = 677,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DODGE_ROLL_DISTANCE - 1 tiers
    MODIFIERS_DB[678] = (Modifier){
        .id = 678,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#.# metres to Dodge Roll distance",
        .description = "+#.# metres to Dodge Roll distance"
    };

    // DESECRATED_SLOW_POTENCY_REDUCTION - 1 tiers
    MODIFIERS_DB[679] = (Modifier){
        .id = 679,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Slowing Potency of Debuffs on You",
        .description = "#% reduced Slowing Potency of Debuffs on You"
    };

    // DESECRATED_REDUCED_SELF_IGNITE_DURATION - 1 tiers
    MODIFIERS_DB[680] = (Modifier){
        .id = 680,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Ignite Duration on you",
        .description = "#% reduced Ignite Duration on you"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[681] = (Modifier){
        .id = 681,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[682] = (Modifier){
        .id = 682,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_REDUCED_BLEEDING_DURATION - 1 tiers
    MODIFIERS_DB[683] = (Modifier){
        .id = 683,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Duration of Bleeding on You",
        .description = "#% reduced Duration of Bleeding on You"
    };

    // DESECRATED_REDUCED_POISON_DURATION - 1 tiers
    MODIFIERS_DB[684] = (Modifier){
        .id = 684,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Poison Duration on you",
        .description = "#% reduced Poison Duration on you"
    };

    // DESECRATED_MANA_COST_EFFICIENCY_IF_DODGE_ROLL - 1 tiers
    MODIFIERS_DB[685] = (Modifier){
        .id = 685,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency if you have Dodge Rolled Rece",
        .description = "#% increased Mana Cost Efficiency if you have Dodge Rolled Recently"
    };

    // DESECRATED_MANA_REGENERATION_WHILE_STATIONARY - 1 tiers
    MODIFIERS_DB[686] = (Modifier){
        .id = 686,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate while stationary",
        .description = "#% increased Mana Regeneration Rate while stationary"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[687] = (Modifier){
        .id = 687,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_CORRUPTED_BLOOD_IMMUNITY - 1 tiers
    MODIFIERS_DB[688] = (Modifier){
        .id = 688,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Corrupted Blood cannot be inflicted on you",
        .description = "Corrupted Blood cannot be inflicted on you"
    };

    // DESECRATED_REDUCES_MOVEMENT_VELOCITY_PENALTY_SKILLS_WHEN_MOVING - 1 tiers
    MODIFIERS_DB[689] = (Modifier){
        .id = 689,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Movement Speed Penalty from using Skills while movin",
        .description = "#% reduced Movement Speed Penalty from using Skills while moving"
    };

    // BASE_MAXIMUM_LIFE - 9 tiers
    MODIFIERS_DB[690] = (Modifier){
        .id = 690,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 9 tiers
    MODIFIERS_DB[691] = (Modifier){
        .id = 691,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ARMOUR - 7 tiers
    MODIFIERS_DB[692] = (Modifier){
        .id = 692,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour",
        .description = "+# to Armour"
    };

    // BASE_EVASION - 7 tiers
    MODIFIERS_DB[693] = (Modifier){
        .id = 693,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // BASE_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[694] = (Modifier){
        .id = 694,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR - 7 tiers
    MODIFIERS_DB[695] = (Modifier){
        .id = 695,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // INCREASED_PERCENT_EVASION - 7 tiers
    MODIFIERS_DB[696] = (Modifier){
        .id = 696,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[697] = (Modifier){
        .id = 697,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_STUN - 6 tiers
    MODIFIERS_DB[698] = (Modifier){
        .id = 698,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour\n+# to Stun Threshold",
        .description = "#% increased Armour\n+# to Stun Threshold"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_STUN - 6 tiers
    MODIFIERS_DB[699] = (Modifier){
        .id = 699,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Evasion Rating\n+# to Stun Threshold",
        .description = "#% increased Evasion Rating\n+# to Stun Threshold"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_STUN - 6 tiers
    MODIFIERS_DB[700] = (Modifier){
        .id = 700,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Energy Shield\n+# to Stun Threshold",
        .description = "#% increased Energy Shield\n+# to Stun Threshold"
    };

    // MOVEMENT_SPEED - 6 tiers
    MODIFIERS_DB[701] = (Modifier){
        .id = 701,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Movement Speed",
        .description = "#% increased Movement Speed"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[702] = (Modifier){
        .id = 702,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[703] = (Modifier){
        .id = 703,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[704] = (Modifier){
        .id = 704,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[705] = (Modifier){
        .id = 705,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[706] = (Modifier){
        .id = 706,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[707] = (Modifier){
        .id = 707,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[708] = (Modifier){
        .id = 708,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[709] = (Modifier){
        .id = 709,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 11 tiers
    MODIFIERS_DB[710] = (Modifier){
        .id = 710,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[711] = (Modifier){
        .id = 711,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[712] = (Modifier){
        .id = 712,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // REDUCED_SHOCK_DURATION - 5 tiers
    MODIFIERS_DB[713] = (Modifier){
        .id = 713,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Shock duration on you",
        .description = "#% reduced Shock duration on you"
    };

    // REDUCED_CHILL_DURATION - 5 tiers
    MODIFIERS_DB[714] = (Modifier){
        .id = 714,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Chill Duration on you",
        .description = "#% reduced Chill Duration on you"
    };

    // REDUCED_FREEZE_DURATION - 5 tiers
    MODIFIERS_DB[715] = (Modifier){
        .id = 715,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Freeze Duration on you",
        .description = "#% reduced Freeze Duration on you"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[716] = (Modifier){
        .id = 716,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[717] = (Modifier){
        .id = 717,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[718] = (Modifier){
        .id = 718,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[719] = (Modifier){
        .id = 719,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[720] = (Modifier){
        .id = 720,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[721] = (Modifier){
        .id = 721,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[722] = (Modifier){
        .id = 722,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[723] = (Modifier){
        .id = 723,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_INCREASED_MOVEMENT_SPEED - 1 tiers
    MODIFIERS_DB[724] = (Modifier){
        .id = 724,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Movement Speed (Essence of Hysteria)",
        .description = "#% increased Movement Speed (Essence of Hysteria)"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[725] = (Modifier){
        .id = 725,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[726] = (Modifier){
        .id = 726,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[727] = (Modifier){
        .id = 727,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[728] = (Modifier){
        .id = 728,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_SOUL_CORE - 1 tiers
    MODIFIERS_DB[729] = (Modifier){
        .id = 729,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased effect of Socketed Items",
        .description = "#% increased effect of Socketed Items"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[730] = (Modifier){
        .id = 730,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[731] = (Modifier){
        .id = 731,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[732] = (Modifier){
        .id = 732,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[733] = (Modifier){
        .id = 733,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[734] = (Modifier){
        .id = 734,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[735] = (Modifier){
        .id = 735,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[736] = (Modifier){
        .id = 736,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DODGE_ROLL_DISTANCE - 1 tiers
    MODIFIERS_DB[737] = (Modifier){
        .id = 737,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#.# metres to Dodge Roll distance",
        .description = "+#.# metres to Dodge Roll distance"
    };

    // DESECRATED_SLOW_POTENCY_REDUCTION - 1 tiers
    MODIFIERS_DB[738] = (Modifier){
        .id = 738,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Slowing Potency of Debuffs on You",
        .description = "#% reduced Slowing Potency of Debuffs on You"
    };

    // DESECRATED_REDUCED_SELF_IGNITE_DURATION - 1 tiers
    MODIFIERS_DB[739] = (Modifier){
        .id = 739,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Ignite Duration on you",
        .description = "#% reduced Ignite Duration on you"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[740] = (Modifier){
        .id = 740,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[741] = (Modifier){
        .id = 741,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_REDUCED_BLEEDING_DURATION - 1 tiers
    MODIFIERS_DB[742] = (Modifier){
        .id = 742,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Duration of Bleeding on You",
        .description = "#% reduced Duration of Bleeding on You"
    };

    // DESECRATED_REDUCED_POISON_DURATION - 1 tiers
    MODIFIERS_DB[743] = (Modifier){
        .id = 743,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Poison Duration on you",
        .description = "#% reduced Poison Duration on you"
    };

    // DESECRATED_MANA_COST_EFFICIENCY_IF_DODGE_ROLL - 1 tiers
    MODIFIERS_DB[744] = (Modifier){
        .id = 744,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency if you have Dodge Rolled Rece",
        .description = "#% increased Mana Cost Efficiency if you have Dodge Rolled Recently"
    };

    // DESECRATED_MANA_REGENERATION_WHILE_STATIONARY - 1 tiers
    MODIFIERS_DB[745] = (Modifier){
        .id = 745,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate while stationary",
        .description = "#% increased Mana Regeneration Rate while stationary"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[746] = (Modifier){
        .id = 746,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_CORRUPTED_BLOOD_IMMUNITY - 1 tiers
    MODIFIERS_DB[747] = (Modifier){
        .id = 747,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Corrupted Blood cannot be inflicted on you",
        .description = "Corrupted Blood cannot be inflicted on you"
    };

    // DESECRATED_REDUCES_MOVEMENT_VELOCITY_PENALTY_SKILLS_WHEN_MOVING - 1 tiers
    MODIFIERS_DB[748] = (Modifier){
        .id = 748,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced Movement Speed Penalty from using Skills while movin",
        .description = "#% reduced Movement Speed Penalty from using Skills while moving"
    };

    // BASE_MAXIMUM_LIFE - 9 tiers
    MODIFIERS_DB[749] = (Modifier){
        .id = 749,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 9 tiers
    MODIFIERS_DB[750] = (Modifier){
        .id = 750,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // HYBRID_BASE_ARMOUR_EVASION - 4 tiers
    MODIFIERS_DB[751] = (Modifier){
        .id = 751,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to Evasion Rating",
        .description = "+# to Armour\n+# to Evasion Rating"
    };

    // HYBRID_BASE_ARMOUR_ENERGY_SHIELD - 4 tiers
    MODIFIERS_DB[752] = (Modifier){
        .id = 752,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to maximum Energy Shield",
        .description = "+# to Armour\n+# to maximum Energy Shield"
    };

    // HYBRID_BASE_EVASION_ENERGY_SHIELD - 4 tiers
    MODIFIERS_DB[753] = (Modifier){
        .id = 753,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating\n+# to maximum Energy Shield",
        .description = "+# to Evasion Rating\n+# to maximum Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 7 tiers
    MODIFIERS_DB[754] = (Modifier){
        .id = 754,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[755] = (Modifier){
        .id = 755,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[756] = (Modifier){
        .id = 756,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_STUN - 6 tiers
    MODIFIERS_DB[757] = (Modifier){
        .id = 757,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to Stun Threshold",
        .description = "#% increased Armour and Evasion\n+# to Stun Threshold"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_STUN - 6 tiers
    MODIFIERS_DB[758] = (Modifier){
        .id = 758,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to Stun Threshold",
        .description = "#% increased Armour and Energy Shield\n+# to Stun Threshold"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD_AND_STUN - 6 tiers
    MODIFIERS_DB[759] = (Modifier){
        .id = 759,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield\n+# to Stun Threshold",
        .description = "#% increased Evasion and Energy Shield\n+# to Stun Threshold"
    };

    // MOVEMENT_SPEED - 6 tiers
    MODIFIERS_DB[760] = (Modifier){
        .id = 760,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Movement Speed",
        .description = "#% increased Movement Speed"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[761] = (Modifier){
        .id = 761,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[762] = (Modifier){
        .id = 762,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[763] = (Modifier){
        .id = 763,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[764] = (Modifier){
        .id = 764,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[765] = (Modifier){
        .id = 765,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[766] = (Modifier){
        .id = 766,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[767] = (Modifier){
        .id = 767,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[768] = (Modifier){
        .id = 768,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 11 tiers
    MODIFIERS_DB[769] = (Modifier){
        .id = 769,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[770] = (Modifier){
        .id = 770,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[771] = (Modifier){
        .id = 771,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // REDUCED_SHOCK_DURATION - 5 tiers
    MODIFIERS_DB[772] = (Modifier){
        .id = 772,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Shock duration on you",
        .description = "#% reduced Shock duration on you"
    };

    // REDUCED_CHILL_DURATION - 5 tiers
    MODIFIERS_DB[773] = (Modifier){
        .id = 773,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Chill Duration on you",
        .description = "#% reduced Chill Duration on you"
    };

    // REDUCED_FREEZE_DURATION - 5 tiers
    MODIFIERS_DB[774] = (Modifier){
        .id = 774,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 20,
        .tags = 0,
        .name = "#% reduced Freeze Duration on you",
        .description = "#% reduced Freeze Duration on you"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[775] = (Modifier){
        .id = 775,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[776] = (Modifier){
        .id = 776,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[777] = (Modifier){
        .id = 777,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[778] = (Modifier){
        .id = 778,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[779] = (Modifier){
        .id = 779,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[780] = (Modifier){
        .id = 780,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[781] = (Modifier){
        .id = 781,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[782] = (Modifier){
        .id = 782,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 3 tiers
    MODIFIERS_DB[783] = (Modifier){
        .id = 783,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[784] = (Modifier){
        .id = 784,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[785] = (Modifier){
        .id = 785,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // ESSENCE_INCREASED_MOVEMENT_SPEED - 1 tiers
    MODIFIERS_DB[786] = (Modifier){
        .id = 786,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Movement Speed",
        .description = "#% increased Movement Speed"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[787] = (Modifier){
        .id = 787,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[788] = (Modifier){
        .id = 788,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[789] = (Modifier){
        .id = 789,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[790] = (Modifier){
        .id = 790,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_SOUL_CORE - 1 tiers
    MODIFIERS_DB[791] = (Modifier){
        .id = 791,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased effect of Socketed Items",
        .description = "#% increased effect of Socketed Items"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[792] = (Modifier){
        .id = 792,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[793] = (Modifier){
        .id = 793,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[794] = (Modifier){
        .id = 794,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[795] = (Modifier){
        .id = 795,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[796] = (Modifier){
        .id = 796,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[797] = (Modifier){
        .id = 797,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[798] = (Modifier){
        .id = 798,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[799] = (Modifier){
        .id = 799,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF - 1 tiers
    MODIFIERS_DB[800] = (Modifier){
        .id = 800,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced effect of Curses on you",
        .description = "#% reduced effect of Curses on you"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[801] = (Modifier){
        .id = 801,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[802] = (Modifier){
        .id = 802,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[803] = (Modifier){
        .id = 803,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_DAMAGE_RECOUPED_AS_MANA - 1 tiers
    MODIFIERS_DB[804] = (Modifier){
        .id = 804,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION - 1 tiers
    MODIFIERS_DB[805] = (Modifier){
        .id = 805,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits have #% reduced Critical Hit Chance against you",
        .description = "Hits have #% reduced Critical Hit Chance against you"
    };

    // DESECRATED_COMPANION_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[806] = (Modifier){
        .id = 806,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Reservation Efficiency of Companion Skills",
        .description = "#% increased Reservation Efficiency of Companion Skills"
    };

    // DESECRATED_PREVENT_DEFLECT_DAMAGE_TAKEN - 1 tiers
    MODIFIERS_DB[807] = (Modifier){
        .id = 807,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Prevent +#% of Damage from Deflected Hits",
        .description = "Prevent +#% of Damage from Deflected Hits"
    };

    // DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE - 1 tiers
    MODIFIERS_DB[808] = (Modifier){
        .id = 808,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage is taken from Mana before Life",
        .description = "#% of Damage is taken from Mana before Life"
    };

    // BASE_MAXIMUM_LIFE - 13 tiers
    MODIFIERS_DB[809] = (Modifier){
        .id = 809,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // HYBRID_BASE_ARMOUR_EVASION - 8 tiers
    MODIFIERS_DB[810] = (Modifier){
        .id = 810,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to Evasion Rating",
        .description = "+# to Armour\n+# to Evasion Rating"
    };

    // HYBRID_BASE_ARMOUR_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[811] = (Modifier){
        .id = 811,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to maximum Energy Shield",
        .description = "+# to Armour\n+# to maximum Energy Shield"
    };

    // HYBRID_BASE_EVASION_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[812] = (Modifier){
        .id = 812,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating\n+# to maximum Energy Shield",
        .description = "+# to Evasion Rating\n+# to maximum Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 8 tiers
    MODIFIERS_DB[813] = (Modifier){
        .id = 813,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[814] = (Modifier){
        .id = 814,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[815] = (Modifier){
        .id = 815,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_LIFE - 6 tiers
    MODIFIERS_DB[816] = (Modifier){
        .id = 816,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to maximum Life",
        .description = "#% increased Armour and Evasion\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_LIFE - 6 tiers
    MODIFIERS_DB[817] = (Modifier){
        .id = 817,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to maximum Life",
        .description = "#% increased Armour and Energy Shield\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD_LIFE - 6 tiers
    MODIFIERS_DB[818] = (Modifier){
        .id = 818,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield\n+# to maximum Life",
        .description = "#% increased Evasion and Energy Shield\n+# to maximum Life"
    };

    // HYBRID_BASE_AND_PERCENT_ARMOUR_EVASION - 6 tiers
    MODIFIERS_DB[819] = (Modifier){
        .id = 819,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Armour\n+# to Evasion Rating\n#% increased Armour and Eva",
        .description = "+# to Armour\n+# to Evasion Rating\n#% increased Armour and Evasion"
    };

    // HYBRID_BASE_AND_PERCENT_ARMOUR_ENERGY_SHIELD - 6 tiers
    MODIFIERS_DB[820] = (Modifier){
        .id = 820,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Armour\n+# to maximum Energy Shield\n#% increased Armour ",
        .description = "+# to Armour\n+# to maximum Energy Shield\n#% increased Armour and Energy Shield"
    };

    // HYBRID_BASE_AND_PERCENT_EVASION_ENERGY_SHIELD - 6 tiers
    MODIFIERS_DB[821] = (Modifier){
        .id = 821,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Evasion Rating\n+# to maximum Energy Shield\n#% increased",
        .description = "+# to Evasion Rating\n+# to maximum Energy Shield\n#% increased Evasion and Energy Shield"
    };

    // PHYSICAL_THORNS_DAMAGE - 7 tiers
    MODIFIERS_DB[822] = (Modifier){
        .id = 822,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_SPIRIT - 8 tiers
    MODIFIERS_DB[823] = (Modifier){
        .id = 823,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 16,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[824] = (Modifier){
        .id = 824,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[825] = (Modifier){
        .id = 825,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[826] = (Modifier){
        .id = 826,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[827] = (Modifier){
        .id = 827,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[828] = (Modifier){
        .id = 828,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[829] = (Modifier){
        .id = 829,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[830] = (Modifier){
        .id = 830,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[831] = (Modifier){
        .id = 831,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 700,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 10 tiers
    MODIFIERS_DB[832] = (Modifier){
        .id = 832,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[833] = (Modifier){
        .id = 833,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // REDUCED_BLEEDING_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[834] = (Modifier){
        .id = 834,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Duration of Bleeding on You",
        .description = "#% reduced Duration of Bleeding on You"
    };

    // REDUCED_POISON_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[835] = (Modifier){
        .id = 835,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Poison Duration on You",
        .description = "#% reduced Poison Duration on You"
    };

    // REDUCED_IGNITE_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[836] = (Modifier){
        .id = 836,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Ignite Duration on You",
        .description = "#% reduced Ignite Duration on You"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 6 tiers
    MODIFIERS_DB[837] = (Modifier){
        .id = 837,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 6 tiers
    MODIFIERS_DB[838] = (Modifier){
        .id = 838,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_FASTER_START_RECHARGE - 6 tiers
    MODIFIERS_DB[839] = (Modifier){
        .id = 839,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% faster start of Energy Shield Recharge",
        .description = "#% faster start of Energy Shield Recharge"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[840] = (Modifier){
        .id = 840,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[841] = (Modifier){
        .id = 841,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[842] = (Modifier){
        .id = 842,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[843] = (Modifier){
        .id = 843,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 3 tiers
    MODIFIERS_DB[844] = (Modifier){
        .id = 844,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[845] = (Modifier){
        .id = 845,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[846] = (Modifier){
        .id = 846,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // ESSENCE_MAXIMUM_LIFE_INCREASE_PERCENT - 1 tiers
    MODIFIERS_DB[847] = (Modifier){
        .id = 847,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased maximum Life",
        .description = "#% increased maximum Life"
    };

    // ESSENCE_PHYSICAL_DAMAGE_TAKEN_AS_CHAOS - 1 tiers
    MODIFIERS_DB[848] = (Modifier){
        .id = 848,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Physical Damage from Hits taken as Chaos Damage",
        .description = "#% of Physical Damage from Hits taken as Chaos Damage"
    };

    // ESSENCE_PHYSICAL_THORNS_DAMAGE - 1 tiers
    MODIFIERS_DB[849] = (Modifier){
        .id = 849,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 63,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[850] = (Modifier){
        .id = 850,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[851] = (Modifier){
        .id = 851,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[852] = (Modifier){
        .id = 852,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[853] = (Modifier){
        .id = 853,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF - 1 tiers
    MODIFIERS_DB[854] = (Modifier){
        .id = 854,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Hits against you have #% reduced Critical Damage Bonus",
        .description = "Hits against you have #% reduced Critical Damage Bonus"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[855] = (Modifier){
        .id = 855,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[856] = (Modifier){
        .id = 856,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[857] = (Modifier){
        .id = 857,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[858] = (Modifier){
        .id = 858,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[859] = (Modifier){
        .id = 859,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[860] = (Modifier){
        .id = 860,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[861] = (Modifier){
        .id = 861,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF - 1 tiers
    MODIFIERS_DB[862] = (Modifier){
        .id = 862,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% reduced effect of Curses on you",
        .description = "#% reduced effect of Curses on you"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[863] = (Modifier){
        .id = 863,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[864] = (Modifier){
        .id = 864,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[865] = (Modifier){
        .id = 865,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_DAMAGE_RECOUPED_AS_MANA - 1 tiers
    MODIFIERS_DB[866] = (Modifier){
        .id = 866,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION - 1 tiers
    MODIFIERS_DB[867] = (Modifier){
        .id = 867,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Hits have #% reduced Critical Hit Chance against you",
        .description = "Hits have #% reduced Critical Hit Chance against you"
    };

    // DESECRATED_COMPANION_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[868] = (Modifier){
        .id = 868,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Reservation Efficiency of Companion Skills",
        .description = "#% increased Reservation Efficiency of Companion Skills"
    };

    // DESECRATED_PREVENT_DEFLECT_DAMAGE_TAKEN - 1 tiers
    MODIFIERS_DB[869] = (Modifier){
        .id = 869,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Prevent +#% of Damage from Deflected Hits",
        .description = "Prevent +#% of Damage from Deflected Hits"
    };

    // DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE - 1 tiers
    MODIFIERS_DB[870] = (Modifier){
        .id = 870,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage is taken from Mana before Life",
        .description = "#% of Damage is taken from Mana before Life"
    };

    // BASE_MAXIMUM_LIFE - 13 tiers
    MODIFIERS_DB[871] = (Modifier){
        .id = 871,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_ARMOUR - 11 tiers
    MODIFIERS_DB[872] = (Modifier){
        .id = 872,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour",
        .description = "+# to Armour"
    };

    // BASE_EVASION - 11 tiers
    MODIFIERS_DB[873] = (Modifier){
        .id = 873,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // BASE_ENERGY_SHIELD - 11 tiers
    MODIFIERS_DB[874] = (Modifier){
        .id = 874,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR - 8 tiers
    MODIFIERS_DB[875] = (Modifier){
        .id = 875,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // INCREASED_PERCENT_EVASION - 8 tiers
    MODIFIERS_DB[876] = (Modifier){
        .id = 876,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[877] = (Modifier){
        .id = 877,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE - 6 tiers
    MODIFIERS_DB[878] = (Modifier){
        .id = 878,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour\n+# to maximum Life",
        .description = "#% increased Armour\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE - 6 tiers
    MODIFIERS_DB[879] = (Modifier){
        .id = 879,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion Rating\n+# to maximum Life",
        .description = "#% increased Evasion Rating\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE - 6 tiers
    MODIFIERS_DB[880] = (Modifier){
        .id = 880,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Energy Shield\n+# to maximum Life",
        .description = "#% increased Energy Shield\n+# to maximum Life"
    };

    // HYBRID_BASE_AND_PERCENT_ARMOUR - 6 tiers
    MODIFIERS_DB[881] = (Modifier){
        .id = 881,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Armour\n#% increased Armour",
        .description = "+# to Armour\n#% increased Armour"
    };

    // HYBRID_BASE_AND_PERCENT_EVASION - 6 tiers
    MODIFIERS_DB[882] = (Modifier){
        .id = 882,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Evasion Rating\n#% increased Evasion Rating",
        .description = "+# to Evasion Rating\n#% increased Evasion Rating"
    };

    // HYBRID_BASE_AND_PERCENT_ENERGY_SHIELD - 6 tiers
    MODIFIERS_DB[883] = (Modifier){
        .id = 883,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to maximum Energy Shield\n#% increased Energy Shield",
        .description = "+# to maximum Energy Shield\n#% increased Energy Shield"
    };

    // PHYSICAL_THORNS_DAMAGE - 7 tiers
    MODIFIERS_DB[884] = (Modifier){
        .id = 884,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_SPIRIT - 8 tiers
    MODIFIERS_DB[885] = (Modifier){
        .id = 885,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 16,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[886] = (Modifier){
        .id = 886,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[887] = (Modifier){
        .id = 887,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[888] = (Modifier){
        .id = 888,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[889] = (Modifier){
        .id = 889,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[890] = (Modifier){
        .id = 890,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[891] = (Modifier){
        .id = 891,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[892] = (Modifier){
        .id = 892,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[893] = (Modifier){
        .id = 893,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 900,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // BASE_STUN_THRESHOLD - 10 tiers
    MODIFIERS_DB[894] = (Modifier){
        .id = 894,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Stun Threshold",
        .description = "+# to Stun Threshold"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[895] = (Modifier){
        .id = 895,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // REDUCED_BLEEDING_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[896] = (Modifier){
        .id = 896,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Duration of Bleeding on You",
        .description = "#% reduced Duration of Bleeding on You"
    };

    // REDUCED_POISON_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[897] = (Modifier){
        .id = 897,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Poison Duration on You",
        .description = "#% reduced Poison Duration on You"
    };

    // REDUCED_IGNITE_DURATION_ON_SELF - 5 tiers
    MODIFIERS_DB[898] = (Modifier){
        .id = 898,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 21,
        .tags = 0,
        .name = "#% reduced Ignite Duration on You",
        .description = "#% reduced Ignite Duration on You"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 6 tiers
    MODIFIERS_DB[899] = (Modifier){
        .id = 899,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 6 tiers
    MODIFIERS_DB[900] = (Modifier){
        .id = 900,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_FASTER_START_RECHARGE - 6 tiers
    MODIFIERS_DB[901] = (Modifier){
        .id = 901,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% faster start of Energy Shield Recharge",
        .description = "#% faster start of Energy Shield Recharge"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[902] = (Modifier){
        .id = 902,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[903] = (Modifier){
        .id = 903,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[904] = (Modifier){
        .id = 904,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[905] = (Modifier){
        .id = 905,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_MAXIMUM_LIFE_INCREASE_PERCENT - 1 tiers
    MODIFIERS_DB[906] = (Modifier){
        .id = 906,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased maximum Life",
        .description = "#% increased maximum Life"
    };

    // ESSENCE_PHYSICAL_DAMAGE_TAKEN_AS_CHAOS - 1 tiers
    MODIFIERS_DB[907] = (Modifier){
        .id = 907,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Physical Damage from Hits taken as Chaos Damage",
        .description = "#% of Physical Damage from Hits taken as Chaos Damage"
    };

    // ESSENCE_PHYSICAL_THORNS_DAMAGE - 1 tiers
    MODIFIERS_DB[908] = (Modifier){
        .id = 908,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 63,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[909] = (Modifier){
        .id = 909,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[910] = (Modifier){
        .id = 910,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[911] = (Modifier){
        .id = 911,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[912] = (Modifier){
        .id = 912,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF - 1 tiers
    MODIFIERS_DB[913] = (Modifier){
        .id = 913,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "Hits against you have #% reduced Critical Damage Bonus",
        .description = "Hits against you have #% reduced Critical Damage Bonus"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[914] = (Modifier){
        .id = 914,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[915] = (Modifier){
        .id = 915,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[916] = (Modifier){
        .id = 916,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[917] = (Modifier){
        .id = 917,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[918] = (Modifier){
        .id = 918,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[919] = (Modifier){
        .id = 919,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DAZE_ON_HIT - 1 tiers
    MODIFIERS_DB[920] = (Modifier){
        .id = 920,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Daze on Hit",
        .description = "#% chance to Daze on Hit"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[921] = (Modifier){
        .id = 921,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[922] = (Modifier){
        .id = 922,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[923] = (Modifier){
        .id = 923,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[924] = (Modifier){
        .id = 924,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT - 1 tiers
    MODIFIERS_DB[925] = (Modifier){
        .id = 925,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Ailments you inflict",
        .description = "#% increased Magnitude of Ailments you inflict"
    };

    // DESECRATED_BLEED_CHANCE_INCREASE - 1 tiers
    MODIFIERS_DB[926] = (Modifier){
        .id = 926,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased chance to inflict Bleeding",
        .description = "#% increased chance to inflict Bleeding"
    };

    // DESECRATED_POISON_CHANCE_INCREASE - 1 tiers
    MODIFIERS_DB[927] = (Modifier){
        .id = 927,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased chance to Poison",
        .description = "#% increased chance to Poison"
    };

    // DESECRATED_INSTANT_LEECH_PERCENT - 1 tiers
    MODIFIERS_DB[928] = (Modifier){
        .id = 928,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Leech is Instant",
        .description = "#% of Leech is Instant"
    };

    // DESECRATED_CURSE_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[929] = (Modifier){
        .id = 929,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Area of Effect of Curses",
        .description = "#% increased Area of Effect of Curses"
    };

    // DESECRATED_IMMOBILISE - 1 tiers
    MODIFIERS_DB[930] = (Modifier){
        .id = 930,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Immobilisation buildup",
        .description = "#% increased Immobilisation buildup"
    };

    // DESECRATED_ARCANE_SURGE_ON_CRIT - 1 tiers
    MODIFIERS_DB[931] = (Modifier){
        .id = 931,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Gain Arcane Surge when you deal a Critical Hit",
        .description = "#% chance to Gain Arcane Surge when you deal a Critical Hit"
    };

    // DESECRATED_INCREASED_CAST_SPEED_ON_FULL_LIFE - 1 tiers
    MODIFIERS_DB[932] = (Modifier){
        .id = 932,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cast Speed when on Full Life",
        .description = "#% increased Cast Speed when on Full Life"
    };

    // DESECRATED_INCREASED_SKILL_SPEED_ON_FRENZY_CONSUMPTION - 1 tiers
    MODIFIERS_DB[933] = (Modifier){
        .id = 933,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Speed if you've consumed a Frenzy Charge Rec",
        .description = "#% increased Skill Speed if you've consumed a Frenzy Charge Recently"
    };

    // DESECRATED_INCISION_CHANCE - 1 tiers
    MODIFIERS_DB[934] = (Modifier){
        .id = 934,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance for Attack Hits to apply Incision",
        .description = "#% chance for Attack Hits to apply Incision"
    };

    // BASE_MAXIMUM_LIFE - 9 tiers
    MODIFIERS_DB[935] = (Modifier){
        .id = 935,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 9 tiers
    MODIFIERS_DB[936] = (Modifier){
        .id = 936,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ARMOUR - 7 tiers
    MODIFIERS_DB[937] = (Modifier){
        .id = 937,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour",
        .description = "+# to Armour"
    };

    // BASE_EVASION - 7 tiers
    MODIFIERS_DB[938] = (Modifier){
        .id = 938,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // BASE_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[939] = (Modifier){
        .id = 939,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR - 7 tiers
    MODIFIERS_DB[940] = (Modifier){
        .id = 940,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // INCREASED_PERCENT_EVASION - 7 tiers
    MODIFIERS_DB[941] = (Modifier){
        .id = 941,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[942] = (Modifier){
        .id = 942,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE - 6 tiers
    MODIFIERS_DB[943] = (Modifier){
        .id = 943,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour +# to maximum Life",
        .description = "#% increased Armour +# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE - 6 tiers
    MODIFIERS_DB[944] = (Modifier){
        .id = 944,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion Rating +# to maximum Life",
        .description = "#% increased Evasion Rating +# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE - 6 tiers
    MODIFIERS_DB[945] = (Modifier){
        .id = 945,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Energy Shield +# to maximum Life",
        .description = "#% increased Energy Shield +# to maximum Life"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[946] = (Modifier){
        .id = 946,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[947] = (Modifier){
        .id = 947,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[948] = (Modifier){
        .id = 948,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[949] = (Modifier){
        .id = 949,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ACCURACY_RATING - 9 tiers
    MODIFIERS_DB[950] = (Modifier){
        .id = 950,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[951] = (Modifier){
        .id = 951,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[952] = (Modifier){
        .id = 952,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[953] = (Modifier){
        .id = 953,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[954] = (Modifier){
        .id = 954,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[955] = (Modifier){
        .id = 955,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[956] = (Modifier){
        .id = 956,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[957] = (Modifier){
        .id = 957,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[958] = (Modifier){
        .id = 958,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 700,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 2 tiers
    MODIFIERS_DB[959] = (Modifier){
        .id = 959,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[960] = (Modifier){
        .id = 960,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[961] = (Modifier){
        .id = 961,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[962] = (Modifier){
        .id = 962,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[963] = (Modifier){
        .id = 963,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[964] = (Modifier){
        .id = 964,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 4 tiers
    MODIFIERS_DB[965] = (Modifier){
        .id = 965,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_DAMAGE_BONUS - 5 tiers
    MODIFIERS_DB[966] = (Modifier){
        .id = 966,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[967] = (Modifier){
        .id = 967,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[968] = (Modifier){
        .id = 968,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[969] = (Modifier){
        .id = 969,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[970] = (Modifier){
        .id = 970,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[971] = (Modifier){
        .id = 971,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[972] = (Modifier){
        .id = 972,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[973] = (Modifier){
        .id = 973,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[974] = (Modifier){
        .id = 974,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[975] = (Modifier){
        .id = 975,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_INCREASED_ACCURACY - 1 tiers
    MODIFIERS_DB[976] = (Modifier){
        .id = 976,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 58,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[977] = (Modifier){
        .id = 977,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[978] = (Modifier){
        .id = 978,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[979] = (Modifier){
        .id = 979,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[980] = (Modifier){
        .id = 980,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_CRITICAL_DAMAGE_BONUS - 1 tiers
    MODIFIERS_DB[981] = (Modifier){
        .id = 981,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 45,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // ESSENCE_SOUL_CORE - 1 tiers
    MODIFIERS_DB[982] = (Modifier){
        .id = 982,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased effect of Socketed Items",
        .description = "#% increased effect of Socketed Items"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[983] = (Modifier){
        .id = 983,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[984] = (Modifier){
        .id = 984,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[985] = (Modifier){
        .id = 985,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_LIGHTNING_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[986] = (Modifier){
        .id = 986,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Lightning Damage taken Recouped as Life",
        .description = "#% of Lightning Damage taken Recouped as Life"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[987] = (Modifier){
        .id = 987,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_GOLD_DROPPED - 1 tiers
    MODIFIERS_DB[988] = (Modifier){
        .id = 988,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[989] = (Modifier){
        .id = 989,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[990] = (Modifier){
        .id = 990,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[991] = (Modifier){
        .id = 991,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DAZE_ON_HIT - 1 tiers
    MODIFIERS_DB[992] = (Modifier){
        .id = 992,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Daze on Hit",
        .description = "#% chance to Daze on Hit"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[993] = (Modifier){
        .id = 993,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[994] = (Modifier){
        .id = 994,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[995] = (Modifier){
        .id = 995,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[996] = (Modifier){
        .id = 996,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT - 1 tiers
    MODIFIERS_DB[997] = (Modifier){
        .id = 997,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Ailments you inflict",
        .description = "#% increased Magnitude of Ailments you inflict"
    };

    // DESECRATED_BLEED_CHANCE_INCREASE - 1 tiers
    MODIFIERS_DB[998] = (Modifier){
        .id = 998,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased chance to inflict Bleeding",
        .description = "#% increased chance to inflict Bleeding"
    };

    // DESECRATED_POISON_CHANCE_INCREASE - 1 tiers
    MODIFIERS_DB[999] = (Modifier){
        .id = 999,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased chance to Poison",
        .description = "#% increased chance to Poison"
    };

    // DESECRATED_INSTANT_LEECH_PERCENT - 1 tiers
    MODIFIERS_DB[1000] = (Modifier){
        .id = 1000,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Leech is Instant",
        .description = "#% of Leech is Instant"
    };

    // DESECRATED_CURSE_AREA_OF_EFFECT - 1 tiers
    MODIFIERS_DB[1001] = (Modifier){
        .id = 1001,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Area of Effect of Curses",
        .description = "#% increased Area of Effect of Curses"
    };

    // DESECRATED_IMMOBILISE - 1 tiers
    MODIFIERS_DB[1002] = (Modifier){
        .id = 1002,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Immobilisation buildup",
        .description = "#% increased Immobilisation buildup"
    };

    // DESECRATED_ARCANE_SURGE_ON_CRIT - 1 tiers
    MODIFIERS_DB[1003] = (Modifier){
        .id = 1003,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance to Gain Arcane Surge when you deal a Critical Hit",
        .description = "#% chance to Gain Arcane Surge when you deal a Critical Hit"
    };

    // DESECRATED_INCREASED_CAST_SPEED_ON_FULL_LIFE - 1 tiers
    MODIFIERS_DB[1004] = (Modifier){
        .id = 1004,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cast Speed when on Full Life",
        .description = "#% increased Cast Speed when on Full Life"
    };

    // DESECRATED_INCREASED_SKILL_SPEED_ON_FRENZY_CONSUMPTION - 1 tiers
    MODIFIERS_DB[1005] = (Modifier){
        .id = 1005,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Speed if you've consumed a Frenzy Charge Rec",
        .description = "#% increased Skill Speed if you've consumed a Frenzy Charge Recently"
    };

    // DESECRATED_INCISION_CHANCE - 1 tiers
    MODIFIERS_DB[1006] = (Modifier){
        .id = 1006,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% chance for Attack Hits to apply Incision",
        .description = "#% chance for Attack Hits to apply Incision"
    };

    // BASE_MAXIMUM_LIFE - 9 tiers
    MODIFIERS_DB[1007] = (Modifier){
        .id = 1007,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 9 tiers
    MODIFIERS_DB[1008] = (Modifier){
        .id = 1008,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // HYBRID_BASE_ARMOUR_EVASION - 4 tiers
    MODIFIERS_DB[1009] = (Modifier){
        .id = 1009,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to Evasion Rating",
        .description = "+# to Armour\n+# to Evasion Rating"
    };

    // HYBRID_BASE_ARMOUR_ENERGY_SHIELD - 4 tiers
    MODIFIERS_DB[1010] = (Modifier){
        .id = 1010,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour\n+# to maximum Energy Shield",
        .description = "+# to Armour\n+# to maximum Energy Shield"
    };

    // HYBRID_BASE_EVASION_ENERGY_SHIELD - 4 tiers
    MODIFIERS_DB[1011] = (Modifier){
        .id = 1011,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating\n+# to maximum Energy Shield",
        .description = "+# to Evasion Rating\n+# to maximum Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 7 tiers
    MODIFIERS_DB[1012] = (Modifier){
        .id = 1012,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1013] = (Modifier){
        .id = 1013,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1014] = (Modifier){
        .id = 1014,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_LIFE - 6 tiers
    MODIFIERS_DB[1015] = (Modifier){
        .id = 1015,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to maximum Life",
        .description = "#% increased Armour and Evasion\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_LIFE - 6 tiers
    MODIFIERS_DB[1016] = (Modifier){
        .id = 1016,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to maximum Life",
        .description = "#% increased Armour and Energy Shield\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD_LIFE - 6 tiers
    MODIFIERS_DB[1017] = (Modifier){
        .id = 1017,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield\n+# to maximum Life",
        .description = "#% increased Evasion and Energy Shield\n+# to maximum Life"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1018] = (Modifier){
        .id = 1018,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1019] = (Modifier){
        .id = 1019,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1020] = (Modifier){
        .id = 1020,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1021] = (Modifier){
        .id = 1021,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ACCURACY_RATING - 9 tiers
    MODIFIERS_DB[1022] = (Modifier){
        .id = 1022,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[1023] = (Modifier){
        .id = 1023,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[1024] = (Modifier){
        .id = 1024,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[1025] = (Modifier){
        .id = 1025,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[1026] = (Modifier){
        .id = 1026,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[1027] = (Modifier){
        .id = 1027,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[1028] = (Modifier){
        .id = 1028,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[1029] = (Modifier){
        .id = 1029,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[1030] = (Modifier){
        .id = 1030,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 700,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MELEE_SKILL - 2 tiers
    MODIFIERS_DB[1031] = (Modifier){
        .id = 1031,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[1032] = (Modifier){
        .id = 1032,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[1033] = (Modifier){
        .id = 1033,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[1034] = (Modifier){
        .id = 1034,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 8 tiers
    MODIFIERS_DB[1035] = (Modifier){
        .id = 1035,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // LIFE_PER_ENEMY_HIT - 4 tiers
    MODIFIERS_DB[1036] = (Modifier){
        .id = 1036,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "Grants # Life per Enemy Hit",
        .description = "Grants # Life per Enemy Hit"
    };

    // INCREASED_ATTACK_SPEED - 4 tiers
    MODIFIERS_DB[1037] = (Modifier){
        .id = 1037,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Attack Speed",
        .description = "#% increased Attack Speed"
    };

    // CRITICAL_DAMAGE_BONUS - 5 tiers
    MODIFIERS_DB[1038] = (Modifier){
        .id = 1038,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[1039] = (Modifier){
        .id = 1039,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[1040] = (Modifier){
        .id = 1040,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[1041] = (Modifier){
        .id = 1041,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[1042] = (Modifier){
        .id = 1042,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[1043] = (Modifier){
        .id = 1043,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[1044] = (Modifier){
        .id = 1044,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[1045] = (Modifier){
        .id = 1045,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[1046] = (Modifier){
        .id = 1046,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1047] = (Modifier){
        .id = 1047,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 3 tiers
    MODIFIERS_DB[1048] = (Modifier){
        .id = 1048,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1049] = (Modifier){
        .id = 1049,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1050] = (Modifier){
        .id = 1050,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // ESSENCE_INCREASED_ACCURACY - 1 tiers
    MODIFIERS_DB[1051] = (Modifier){
        .id = 1051,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 58,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[1052] = (Modifier){
        .id = 1052,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[1053] = (Modifier){
        .id = 1053,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[1054] = (Modifier){
        .id = 1054,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[1055] = (Modifier){
        .id = 1055,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_CRITICAL_DAMAGE_BONUS - 1 tiers
    MODIFIERS_DB[1056] = (Modifier){
        .id = 1056,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 45,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // ESSENCE_SOUL_CORE - 1 tiers
    MODIFIERS_DB[1057] = (Modifier){
        .id = 1057,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased effect of Socketed Items",
        .description = "#% increased effect of Socketed Items"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[1058] = (Modifier){
        .id = 1058,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[1059] = (Modifier){
        .id = 1059,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[1060] = (Modifier){
        .id = 1060,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_LIGHTNING_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1061] = (Modifier){
        .id = 1061,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Lightning Damage taken Recouped as Life",
        .description = "#% of Lightning Damage taken Recouped as Life"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[1062] = (Modifier){
        .id = 1062,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ESSENCE_GOLD_DROPPED - 1 tiers
    MODIFIERS_DB[1063] = (Modifier){
        .id = 1063,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1064] = (Modifier){
        .id = 1064,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1065] = (Modifier){
        .id = 1065,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[1066] = (Modifier){
        .id = 1066,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1067] = (Modifier){
        .id = 1067,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // DESECRATED_GLORY_GENERATION - 1 tiers
    MODIFIERS_DB[1068] = (Modifier){
        .id = 1068,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Glory generation",
        .description = "#% increased Glory generation"
    };

    // DESECRATED_PRESENCE_RADIUS - 1 tiers
    MODIFIERS_DB[1069] = (Modifier){
        .id = 1069,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Presence Area of Effect",
        .description = "#% increased Presence Area of Effect"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1070] = (Modifier){
        .id = 1070,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1071] = (Modifier){
        .id = 1071,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1072] = (Modifier){
        .id = 1072,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE - 1 tiers
    MODIFIERS_DB[1073] = (Modifier){
        .id = 1073,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% of Armour also applies to Chaos Damage",
        .description = "+#% of Armour also applies to Chaos Damage"
    };

    // DESECRATED_ELEMENTAL_DAMAGE_TAKEN_RECOUPED_AS_ENERGY_SHIELD - 1 tiers
    MODIFIERS_DB[1074] = (Modifier){
        .id = 1074,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Elemental Damage taken Recouped as Energy Shield",
        .description = "#% of Elemental Damage taken Recouped as Energy Shield"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1075] = (Modifier){
        .id = 1075,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1076] = (Modifier){
        .id = 1076,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_LIFE_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1077] = (Modifier){
        .id = 1077,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Life Cost Efficiency",
        .description = "#% increased Life Cost Efficiency"
    };

    // DESECRATED_INCREASED_CRITICAL_DAMAGE_BONUS - 1 tiers
    MODIFIERS_DB[1078] = (Modifier){
        .id = 1078,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // DESECRATED_MARK_DAMAGE - 1 tiers
    MODIFIERS_DB[1079] = (Modifier){
        .id = 1079,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 3,
        .level_req = 65,
        .tags = 0,
        .name = "Enemies you Mark take #% increased Damage",
        .description = "Enemies you Mark take #% increased Damage"
    };

    // DESECRATED_ARCANE_SURGE_EFFECT - 1 tiers
    MODIFIERS_DB[1080] = (Modifier){
        .id = 1080,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased effect of Arcane Surge on you",
        .description = "#% increased effect of Arcane Surge on you"
    };

    // BASE_MAXIMUM_LIFE - 10 tiers
    MODIFIERS_DB[1081] = (Modifier){
        .id = 1081,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 10 tiers
    MODIFIERS_DB[1082] = (Modifier){
        .id = 1082,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ARMOUR - 8 tiers
    MODIFIERS_DB[1083] = (Modifier){
        .id = 1083,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour",
        .description = "+# to Armour"
    };

    // BASE_EVASION - 8 tiers
    MODIFIERS_DB[1084] = (Modifier){
        .id = 1084,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // BASE_ENERGY_SHIELD - 8 tiers
    MODIFIERS_DB[1085] = (Modifier){
        .id = 1085,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR - 7 tiers
    MODIFIERS_DB[1086] = (Modifier){
        .id = 1086,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // INCREASED_PERCENT_EVASION - 7 tiers
    MODIFIERS_DB[1087] = (Modifier){
        .id = 1087,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1088] = (Modifier){
        .id = 1088,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE - 6 tiers
    MODIFIERS_DB[1089] = (Modifier){
        .id = 1089,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour\n+# to maximum Life",
        .description = "#% increased Armour\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE - 6 tiers
    MODIFIERS_DB[1090] = (Modifier){
        .id = 1090,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion Rating\n+# to maximum Life",
        .description = "#% increased Evasion Rating\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE - 6 tiers
    MODIFIERS_DB[1091] = (Modifier){
        .id = 1091,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Energy Shield\n+# to maximum Life",
        .description = "#% increased Energy Shield\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_AND_MANA - 6 tiers
    MODIFIERS_DB[1092] = (Modifier){
        .id = 1092,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour\n+# to maximum Mana",
        .description = "#% increased Armour\n+# to maximum Mana"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_AND_MANA - 6 tiers
    MODIFIERS_DB[1093] = (Modifier){
        .id = 1093,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion Rating\n+# to maximum Mana",
        .description = "#% increased Evasion Rating\n+# to maximum Mana"
    };

    // HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA - 6 tiers
    MODIFIERS_DB[1094] = (Modifier){
        .id = 1094,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Energy Shield\n+# to maximum Mana",
        .description = "#% increased Energy Shield\n+# to maximum Mana"
    };

    // ACCURACY_RATING - 9 tiers
    MODIFIERS_DB[1095] = (Modifier){
        .id = 1095,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ITEM_FOUND_RARITY_INCREASE_PREFIX - 5 tiers
    MODIFIERS_DB[1096] = (Modifier){
        .id = 1096,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[1097] = (Modifier){
        .id = 1097,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[1098] = (Modifier){
        .id = 1098,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 9 tiers
    MODIFIERS_DB[1099] = (Modifier){
        .id = 1099,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[1100] = (Modifier){
        .id = 1100,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[1101] = (Modifier){
        .id = 1101,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[1102] = (Modifier){
        .id = 1102,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[1103] = (Modifier){
        .id = 1103,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[1104] = (Modifier){
        .id = 1104,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MINION_SKILL - 2 tiers
    MODIFIERS_DB[1105] = (Modifier){
        .id = 1105,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[1106] = (Modifier){
        .id = 1106,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // INCREASED_CRITICAL_HIT_CHANCE - 5 tiers
    MODIFIERS_DB[1107] = (Modifier){
        .id = 1107,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Critical Hit Chance",
        .description = "#% increased Critical Hit Chance"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[1108] = (Modifier){
        .id = 1108,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[1109] = (Modifier){
        .id = 1109,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[1110] = (Modifier){
        .id = 1110,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[1111] = (Modifier){
        .id = 1111,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[1112] = (Modifier){
        .id = 1112,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[1113] = (Modifier){
        .id = 1113,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[1114] = (Modifier){
        .id = 1114,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[1115] = (Modifier){
        .id = 1115,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[1116] = (Modifier){
        .id = 1116,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1117] = (Modifier){
        .id = 1117,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[1118] = (Modifier){
        .id = 1118,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[1119] = (Modifier){
        .id = 1119,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[1120] = (Modifier){
        .id = 1120,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[1121] = (Modifier){
        .id = 1121,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_LEVEL_MINION_SKILL - 1 tiers
    MODIFIERS_DB[1122] = (Modifier){
        .id = 1122,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[1123] = (Modifier){
        .id = 1123,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[1124] = (Modifier){
        .id = 1124,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_COLD_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1125] = (Modifier){
        .id = 1125,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Cold Damage taken Recouped as Life",
        .description = "#% of Cold Damage taken Recouped as Life"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[1126] = (Modifier){
        .id = 1126,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[1127] = (Modifier){
        .id = 1127,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1128] = (Modifier){
        .id = 1128,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1129] = (Modifier){
        .id = 1129,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[1130] = (Modifier){
        .id = 1130,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1131] = (Modifier){
        .id = 1131,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // DESECRATED_GLORY_GENERATION - 1 tiers
    MODIFIERS_DB[1132] = (Modifier){
        .id = 1132,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Glory generation",
        .description = "#% increased Glory generation"
    };

    // DESECRATED_PRESENCE_RADIUS - 1 tiers
    MODIFIERS_DB[1133] = (Modifier){
        .id = 1133,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Presence Area of Effect",
        .description = "#% increased Presence Area of Effect"
    };

    // DESECRATED_SPIRIT_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1134] = (Modifier){
        .id = 1134,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spirit Reservation Efficiency of Skills",
        .description = "#% increased Spirit Reservation Efficiency of Skills"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1135] = (Modifier){
        .id = 1135,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1136] = (Modifier){
        .id = 1136,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE - 1 tiers
    MODIFIERS_DB[1137] = (Modifier){
        .id = 1137,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% of Armour also applies to Chaos Damage",
        .description = "+#% of Armour also applies to Chaos Damage"
    };

    // DESECRATED_ELEMENTAL_DAMAGE_TAKEN_RECOUPED_AS_ENERGY_SHIELD - 1 tiers
    MODIFIERS_DB[1138] = (Modifier){
        .id = 1138,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Elemental Damage taken Recouped as Energy Shield",
        .description = "#% of Elemental Damage taken Recouped as Energy Shield"
    };

    // DESECRATED_MANA_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1139] = (Modifier){
        .id = 1139,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Mana Cost Efficiency",
        .description = "#% increased Mana Cost Efficiency"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1140] = (Modifier){
        .id = 1140,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_LIFE_COST_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1141] = (Modifier){
        .id = 1141,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Life Cost Efficiency",
        .description = "#% increased Life Cost Efficiency"
    };

    // DESECRATED_INCREASED_CRITICAL_DAMAGE_BONUS - 1 tiers
    MODIFIERS_DB[1142] = (Modifier){
        .id = 1142,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus",
        .description = "#% increased Critical Damage Bonus"
    };

    // DESECRATED_MARK_DAMAGE - 1 tiers
    MODIFIERS_DB[1143] = (Modifier){
        .id = 1143,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 3,
        .level_req = 65,
        .tags = 0,
        .name = "Enemies you Mark take #% increased Damage",
        .description = "Enemies you Mark take #% increased Damage"
    };

    // DESECRATED_ARCANE_SURGE_EFFECT - 1 tiers
    MODIFIERS_DB[1144] = (Modifier){
        .id = 1144,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased effect of Arcane Surge on you",
        .description = "#% increased effect of Arcane Surge on you"
    };

    // BASE_MAXIMUM_LIFE - 10 tiers
    MODIFIERS_DB[1145] = (Modifier){
        .id = 1145,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 10 tiers
    MODIFIERS_DB[1146] = (Modifier){
        .id = 1146,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ARMOUR_EVASION - 5 tiers
    MODIFIERS_DB[1147] = (Modifier){
        .id = 1147,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour and +# to Evasion Rating",
        .description = "+# to Armour and +# to Evasion Rating"
    };

    // BASE_ARMOUR_ENERGY_SHIELD - 5 tiers
    MODIFIERS_DB[1148] = (Modifier){
        .id = 1148,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Armour and +# to maximum Energy Shield",
        .description = "+# to Armour and +# to maximum Energy Shield"
    };

    // BASE_EVASION_ENERGY_SHIELD - 5 tiers
    MODIFIERS_DB[1149] = (Modifier){
        .id = 1149,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating and +# to maximum Energy Shield",
        .description = "+# to Evasion Rating and +# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR_EVASION - 7 tiers
    MODIFIERS_DB[1150] = (Modifier){
        .id = 1150,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1151] = (Modifier){
        .id = 1151,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1152] = (Modifier){
        .id = 1152,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_LIFE - 6 tiers
    MODIFIERS_DB[1153] = (Modifier){
        .id = 1153,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to maximum Life",
        .description = "#% increased Armour and Evasion\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_LIFE - 6 tiers
    MODIFIERS_DB[1154] = (Modifier){
        .id = 1154,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to maximum Life",
        .description = "#% increased Armour and Energy Shield\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD_AND_LIFE - 6 tiers
    MODIFIERS_DB[1155] = (Modifier){
        .id = 1155,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield\n+# to maximum Life",
        .description = "#% increased Evasion and Energy Shield\n+# to maximum Life"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_MANA - 6 tiers
    MODIFIERS_DB[1156] = (Modifier){
        .id = 1156,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Evasion\n+# to maximum Mana",
        .description = "#% increased Armour and Evasion\n+# to maximum Mana"
    };

    // HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_MANA - 6 tiers
    MODIFIERS_DB[1157] = (Modifier){
        .id = 1157,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield\n+# to maximum Mana",
        .description = "#% increased Armour and Energy Shield\n+# to maximum Mana"
    };

    // HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD_AND_MANA - 6 tiers
    MODIFIERS_DB[1158] = (Modifier){
        .id = 1158,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield\n+# to maximum Mana",
        .description = "#% increased Evasion and Energy Shield\n+# to maximum Mana"
    };

    // ACCURACY_RATING - 9 tiers
    MODIFIERS_DB[1159] = (Modifier){
        .id = 1159,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ITEM_FOUND_RARITY_INCREASE_PREFIX - 5 tiers
    MODIFIERS_DB[1160] = (Modifier){
        .id = 1160,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[1161] = (Modifier){
        .id = 1161,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[1162] = (Modifier){
        .id = 1162,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 9 tiers
    MODIFIERS_DB[1163] = (Modifier){
        .id = 1163,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[1164] = (Modifier){
        .id = 1164,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[1165] = (Modifier){
        .id = 1165,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[1166] = (Modifier){
        .id = 1166,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[1167] = (Modifier){
        .id = 1167,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // REDUCED_ATTRIBUTE_REQUIREMENTS - 5 tiers
    MODIFIERS_DB[1168] = (Modifier){
        .id = 1168,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LEVEL_MINION_SKILL - 2 tiers
    MODIFIERS_DB[1169] = (Modifier){
        .id = 1169,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[1170] = (Modifier){
        .id = 1170,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // INCREASED_CRITICAL_HIT_CHANCE - 5 tiers
    MODIFIERS_DB[1171] = (Modifier){
        .id = 1171,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Critical Hit Chance",
        .description = "#% increased Critical Hit Chance"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[1172] = (Modifier){
        .id = 1172,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[1173] = (Modifier){
        .id = 1173,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "+# to Accuracy Rating / #% increased Light Radius",
        .description = "+# to Accuracy Rating / #% increased Light Radius"
    };

    // ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE - 5 tiers
    MODIFIERS_DB[1174] = (Modifier){
        .id = 1174,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "+#% of Armour also applies to Elemental Damage",
        .description = "+#% of Armour also applies to Elemental Damage"
    };

    // EVASION_APPLIES_TO_DEFLECTION - 5 tiers
    MODIFIERS_DB[1175] = (Modifier){
        .id = 1175,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "Gain Deflection Rating equal to #% of Evasion Rating",
        .description = "Gain Deflection Rating equal to #% of Evasion Rating"
    };

    // ENERGY_SHIELD_RECHARGE_RATE - 4 tiers
    MODIFIERS_DB[1176] = (Modifier){
        .id = 1176,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Energy Shield Recharge Rate",
        .description = "#% increased Energy Shield Recharge Rate"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[1177] = (Modifier){
        .id = 1177,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[1178] = (Modifier){
        .id = 1178,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_PERCENT_ARMOUR - 3 tiers
    MODIFIERS_DB[1179] = (Modifier){
        .id = 1179,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // ESSENCE_INCREASED_PERCENT_EVASION - 3 tiers
    MODIFIERS_DB[1180] = (Modifier){
        .id = 1180,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion",
        .description = "#% increased Evasion"
    };

    // ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1181] = (Modifier){
        .id = 1181,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION - 3 tiers
    MODIFIERS_DB[1182] = (Modifier){
        .id = 1182,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Evasion",
        .description = "#% increased Armour and Evasion"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1183] = (Modifier){
        .id = 1183,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Armour and Energy Shield",
        .description = "#% increased Armour and Energy Shield"
    };

    // ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD - 3 tiers
    MODIFIERS_DB[1184] = (Modifier){
        .id = 1184,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "#% increased Evasion and Energy Shield",
        .description = "#% increased Evasion and Energy Shield"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[1185] = (Modifier){
        .id = 1185,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[1186] = (Modifier){
        .id = 1186,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[1187] = (Modifier){
        .id = 1187,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[1188] = (Modifier){
        .id = 1188,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_LEVEL_MINION_SKILL - 1 tiers
    MODIFIERS_DB[1189] = (Modifier){
        .id = 1189,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[1190] = (Modifier){
        .id = 1190,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[1191] = (Modifier){
        .id = 1191,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_COLD_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1192] = (Modifier){
        .id = 1192,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% of Cold Damage taken Recouped as Life",
        .description = "#% of Cold Damage taken Recouped as Life"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[1193] = (Modifier){
        .id = 1193,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[1194] = (Modifier){
        .id = 1194,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_REMNANT_EFFECT - 1 tiers
    MODIFIERS_DB[1195] = (Modifier){
        .id = 1195,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Remnants have #% increased effect",
        .description = "Remnants have #% increased effect"
    };

    // DESECRATED_INCREASED_IGNITE_MAGNITUDE_IF_ENDURANCE - 1 tiers
    MODIFIERS_DB[1196] = (Modifier){
        .id = 1196,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Ignite if you've consumed an Enduranc",
        .description = "#% increased Magnitude of Ignite if you've consumed an Endurance Charge Recently"
    };

    // DESECRATED_INCREASED_FREEZE_BUILDUP_IF_POWER - 1 tiers
    MODIFIERS_DB[1197] = (Modifier){
        .id = 1197,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Freeze Buildup if you've consumed a Power Charge R",
        .description = "#% increased Freeze Buildup if you've consumed a Power Charge Recently"
    };

    // DESECRATED_INCREASED_SHOCK_MAGNITUDE_IF_FRENZY - 1 tiers
    MODIFIERS_DB[1198] = (Modifier){
        .id = 1198,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Magnitude of Shock if you've consumed a Frenzy Cha",
        .description = "#% increased Magnitude of Shock if you've consumed a Frenzy Charge Recently"
    };

    // DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY - 1 tiers
    MODIFIERS_DB[1199] = (Modifier){
        .id = 1199,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Minions deal #% increased Damage if you've Hit Recently",
        .description = "Minions deal #% increased Damage if you've Hit Recently"
    };

    // DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD - 1 tiers
    MODIFIERS_DB[1200] = (Modifier){
        .id = 1200,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage while on Full Energy Shield",
        .description = "#% increased Spell Damage while on Full Energy Shield"
    };

    // DESECRATED_ATTACK_DAMAGE_LOW_LIFE - 1 tiers
    MODIFIERS_DB[1201] = (Modifier){
        .id = 1201,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Damage while on Low Life",
        .description = "#% increased Attack Damage while on Low Life"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1202] = (Modifier){
        .id = 1202,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[1203] = (Modifier){
        .id = 1203,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SKILL_EFFECT_DURATION - 1 tiers
    MODIFIERS_DB[1204] = (Modifier){
        .id = 1204,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Effect Duration",
        .description = "#% increased Skill Effect Duration"
    };

    // DESECRATED_REMNANT_PICKUP_RADIUS - 1 tiers
    MODIFIERS_DB[1205] = (Modifier){
        .id = 1205,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Remnants can be collected from #% further away",
        .description = "Remnants can be collected from #% further away"
    };

    // DESECRATED_LIFE_LEECH_AMOUNT - 1 tiers
    MODIFIERS_DB[1206] = (Modifier){
        .id = 1206,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased amount of Life Leeched",
        .description = "#% increased amount of Life Leeched"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1207] = (Modifier){
        .id = 1207,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1208] = (Modifier){
        .id = 1208,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1209] = (Modifier){
        .id = 1209,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_COOLDOWN_RECOVERY - 1 tiers
    MODIFIERS_DB[1210] = (Modifier){
        .id = 1210,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cooldown Recovery Rate",
        .description = "#% increased Cooldown Recovery Rate"
    };

    // DESECRATED_EXPOSURE_EFFECT - 1 tiers
    MODIFIERS_DB[1211] = (Modifier){
        .id = 1211,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Exposure Effect",
        .description = "#% increased Exposure Effect"
    };

    // DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE - 1 tiers
    MODIFIERS_DB[1212] = (Modifier){
        .id = 1212,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of maximum Mana on Kill",
        .description = "Recover #% of maximum Mana on Kill"
    };

    // DESECRATED_MANA_LEECH_AMOUNT - 1 tiers
    MODIFIERS_DB[1213] = (Modifier){
        .id = 1213,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased amount of Mana Leeched",
        .description = "#% increased amount of Mana Leeched"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1214] = (Modifier){
        .id = 1214,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL - 1 tiers
    MODIFIERS_DB[1215] = (Modifier){
        .id = 1215,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of maximum Life on Kill",
        .description = "Recover #% of maximum Life on Kill"
    };

    // DESECRATED_INCREASED_SKILL_SPEED - 1 tiers
    MODIFIERS_DB[1216] = (Modifier){
        .id = 1216,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Speed",
        .description = "#% increased Skill Speed"
    };

    // BASE_MAXIMUM_LIFE - 8 tiers
    MODIFIERS_DB[1217] = (Modifier){
        .id = 1217,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 12 tiers
    MODIFIERS_DB[1218] = (Modifier){
        .id = 1218,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_EVASION - 9 tiers
    MODIFIERS_DB[1219] = (Modifier){
        .id = 1219,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Evasion Rating",
        .description = "+# to Evasion Rating"
    };

    // PHYSICAL_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1220] = (Modifier){
        .id = 1220,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // FIRE_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1221] = (Modifier){
        .id = 1221,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // COLD_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1222] = (Modifier){
        .id = 1222,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // LIGHTNING_DAMAGE_FLAT - 9 tiers
    MODIFIERS_DB[1223] = (Modifier){
        .id = 1223,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 1,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[1224] = (Modifier){
        .id = 1224,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ITEM_FOUND_RARITY_INCREASE_PREFIX - 5 tiers
    MODIFIERS_DB[1225] = (Modifier){
        .id = 1225,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // INCREASED_FIRE_DAMAGE - 6 tiers
    MODIFIERS_DB[1226] = (Modifier){
        .id = 1226,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 8,
        .tags = 0,
        .name = "+#% increased Fire Damage",
        .description = "+#% increased Fire Damage"
    };

    // INCREASED_COLD_DAMAGE - 6 tiers
    MODIFIERS_DB[1227] = (Modifier){
        .id = 1227,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 8,
        .tags = 0,
        .name = "+#% increased Cold Damage",
        .description = "+#% increased Cold Damage"
    };

    // INCREASED_LIGHTNING_DAMAGE - 6 tiers
    MODIFIERS_DB[1228] = (Modifier){
        .id = 1228,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 8,
        .tags = 0,
        .name = "+#% increased Lightning Damage",
        .description = "+#% increased Lightning Damage"
    };

    // INCREASED_CHAOS_DAMAGE - 6 tiers
    MODIFIERS_DB[1229] = (Modifier){
        .id = 1229,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 8,
        .tags = 0,
        .name = "+#% increased Chaos Damage",
        .description = "+#% increased Chaos Damage"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[1230] = (Modifier){
        .id = 1230,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 9 tiers
    MODIFIERS_DB[1231] = (Modifier){
        .id = 1231,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[1232] = (Modifier){
        .id = 1232,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ALL_ATTRIBUTES - 4 tiers
    MODIFIERS_DB[1233] = (Modifier){
        .id = 1233,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 400,
        .level_req = 1,
        .tags = 0,
        .name = "+# to all Attributes",
        .description = "+# to all Attributes"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[1234] = (Modifier){
        .id = 1234,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[1235] = (Modifier){
        .id = 1235,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[1236] = (Modifier){
        .id = 1236,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ALL_RESISTANCES - 5 tiers
    MODIFIERS_DB[1237] = (Modifier){
        .id = 1237,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to all Elemental Resistances",
        .description = "+#% to all Elemental Resistances"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[1238] = (Modifier){
        .id = 1238,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[1239] = (Modifier){
        .id = 1239,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // MANA_REGENERATION_RATE - 6 tiers
    MODIFIERS_DB[1240] = (Modifier){
        .id = 1240,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // LIFE_LEECH - 0 tiers
    MODIFIERS_DB[1241] = (Modifier){
        .id = 1241,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Life",
        .description = "Leeches #% of Physical Damage as Life"
    };

    // MANA_LEECH - 0 tiers
    MODIFIERS_DB[1242] = (Modifier){
        .id = 1242,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "Leeches #% of Physical Damage as Mana",
        .description = "Leeches #% of Physical Damage as Mana"
    };

    // LIFE_PER_ENEMY_KILLED - 6 tiers
    MODIFIERS_DB[1243] = (Modifier){
        .id = 1243,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Life per Enemy Killed",
        .description = "Gain # Life per Enemy Killed"
    };

    // MANA_PER_ENEMY_KILLED - 6 tiers
    MODIFIERS_DB[1244] = (Modifier){
        .id = 1244,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 750,
        .level_req = 1,
        .tags = 0,
        .name = "Gain # Mana per Enemy Killed",
        .description = "Gain # Mana per Enemy Killed"
    };

    // INCREASED_CAST_SPEED - 4 tiers
    MODIFIERS_DB[1245] = (Modifier){
        .id = 1245,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[1246] = (Modifier){
        .id = 1246,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS - 3 tiers
    MODIFIERS_DB[1247] = (Modifier){
        .id = 1247,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate / #%Light Radius",
        .description = "#% increased Mana Regeneration Rate / #%Light Radius"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 2 tiers
    MODIFIERS_DB[1248] = (Modifier){
        .id = 1248,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 6,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[1249] = (Modifier){
        .id = 1249,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_MAXIMUM_MANA_INCREASE_PERCENT - 1 tiers
    MODIFIERS_DB[1250] = (Modifier){
        .id = 1250,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased maximum Mana",
        .description = "#% increased maximum Mana"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[1251] = (Modifier){
        .id = 1251,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[1252] = (Modifier){
        .id = 1252,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[1253] = (Modifier){
        .id = 1253,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[1254] = (Modifier){
        .id = 1254,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_MANA_REGENERATION - 1 tiers
    MODIFIERS_DB[1255] = (Modifier){
        .id = 1255,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 55,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[1256] = (Modifier){
        .id = 1256,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[1257] = (Modifier){
        .id = 1257,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[1258] = (Modifier){
        .id = 1258,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[1259] = (Modifier){
        .id = 1259,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // DESECRATED_GLOBAL_DEFENCES - 1 tiers
    MODIFIERS_DB[1260] = (Modifier){
        .id = 1260,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Global Defences",
        .description = "#% increased Global Defences"
    };

    // DESECRATED_REMNANT_EFFECT - 1 tiers
    MODIFIERS_DB[1261] = (Modifier){
        .id = 1261,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Remnants have #% increased effect",
        .description = "Remnants have #% increased effect"
    };

    // DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY - 1 tiers
    MODIFIERS_DB[1262] = (Modifier){
        .id = 1262,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Minions deal #% increased Damage if you've Hit Recently",
        .description = "Minions deal #% increased Damage if you've Hit Recently"
    };

    // DESECRATED_BODY_ARMOUR_FROM_BODY_ARMOUR - 1 tiers
    MODIFIERS_DB[1263] = (Modifier){
        .id = 1263,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Armour from Equipped Body Armour",
        .description = "#% increased Armour from Equipped Body Armour"
    };

    // DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD - 1 tiers
    MODIFIERS_DB[1264] = (Modifier){
        .id = 1264,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Spell Damage while on Full Energy Shield",
        .description = "#% increased Spell Damage while on Full Energy Shield"
    };

    // DESECRATED_INVOCATED_SPELL_HALF_ENERGY_CHANCE - 1 tiers
    MODIFIERS_DB[1265] = (Modifier){
        .id = 1265,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Invocated Spells have #% chance to consume half as much Energy",
        .description = "Invocated Spells have #% chance to consume half as much Energy"
    };

    // DESECRATED_MAXIMUM_ENERGY_SHIELD_FROM_BODY_ARMOUR - 1 tiers
    MODIFIERS_DB[1266] = (Modifier){
        .id = 1266,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Energy Shield from Equipped Body Armour",
        .description = "#% increased Energy Shield from Equipped Body Armour"
    };

    // DESECRATED_GLORY_CHANCE_TO_NOT_CONSUME - 1 tiers
    MODIFIERS_DB[1267] = (Modifier){
        .id = 1267,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Skills have a #% chance to not consume Glory",
        .description = "Skills have a #% chance to not consume Glory"
    };

    // DESECRATED_EVASION_RATING_FROM_BODY_ARMOUR - 1 tiers
    MODIFIERS_DB[1268] = (Modifier){
        .id = 1268,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Evasion Rating from Equipped Body Armour",
        .description = "#% increased Evasion Rating from Equipped Body Armour"
    };

    // DESECRATED_ATTACK_DAMAGE_LOW_LIFE - 1 tiers
    MODIFIERS_DB[1269] = (Modifier){
        .id = 1269,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Attack Damage while on Low Life",
        .description = "#% increased Attack Damage while on Low Life"
    };

    // DESECRATED_INCREASED_DEFLECTION_RATING - 1 tiers
    MODIFIERS_DB[1270] = (Modifier){
        .id = 1270,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Deflection Rating",
        .description = "#% increased Deflection Rating"
    };

    // DESECRATED_STRENGTH_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1271] = (Modifier){
        .id = 1271,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Intelligence",
        .description = "+# to Strength and Intelligence"
    };

    // DESECRATED_STRENGTH_AND_DEXTERITY - 1 tiers
    MODIFIERS_DB[1272] = (Modifier){
        .id = 1272,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Strength and Dexterity",
        .description = "+# to Strength and Dexterity"
    };

    // DESECRATED_SKILL_EFFECT_DURATION - 1 tiers
    MODIFIERS_DB[1273] = (Modifier){
        .id = 1273,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Effect Duration",
        .description = "#% increased Skill Effect Duration"
    };

    // DESECRATED_REMNANT_PICKUP_RADIUS - 1 tiers
    MODIFIERS_DB[1274] = (Modifier){
        .id = 1274,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Remnants can be collected from #% further away",
        .description = "Remnants can be collected from #% further away"
    };

    // DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1275] = (Modifier){
        .id = 1275,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Fire and Chaos Resistances",
        .description = "+#% to Fire and Chaos Resistances"
    };

    // DESECRATED_AURA_MAGNITUDES - 1 tiers
    MODIFIERS_DB[1276] = (Modifier){
        .id = 1276,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Aura Skills have #% increased Magnitudes",
        .description = "Aura Skills have #% increased Magnitudes"
    };

    // DESECRATED_GLOBAL_ITEM_ATTRIBUTE_REQUIREMENTS - 1 tiers
    MODIFIERS_DB[1277] = (Modifier){
        .id = 1277,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Equipment and Skill Gems have #% reduced Attribute Requirements",
        .description = "Equipment and Skill Gems have #% reduced Attribute Requirements"
    };

    // DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE - 1 tiers
    MODIFIERS_DB[1278] = (Modifier){
        .id = 1278,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of maximum Mana on Kill",
        .description = "Recover #% of maximum Mana on Kill"
    };

    // DESECRATED_EXPOSURE_EFFECT - 1 tiers
    MODIFIERS_DB[1279] = (Modifier){
        .id = 1279,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Exposure Effect",
        .description = "#% increased Exposure Effect"
    };

    // DESECRATED_COOLDOWN_RECOVERY - 1 tiers
    MODIFIERS_DB[1280] = (Modifier){
        .id = 1280,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Cooldown Recovery Rate",
        .description = "#% increased Cooldown Recovery Rate"
    };

    // DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1281] = (Modifier){
        .id = 1281,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Cold and Chaos Resistances",
        .description = "+#% to Cold and Chaos Resistances"
    };

    // DESECRATED_DEXTERITY_AND_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1282] = (Modifier){
        .id = 1282,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Dexterity and Intelligence",
        .description = "+# to Dexterity and Intelligence"
    };

    // DESECRATED_GLOBAL_SKILL_GEM_QUALITY - 1 tiers
    MODIFIERS_DB[1283] = (Modifier){
        .id = 1283,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Quality of all Skills",
        .description = "+#% to Quality of all Skills"
    };

    // DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE - 1 tiers
    MODIFIERS_DB[1284] = (Modifier){
        .id = 1284,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% of Damage is taken from Mana before Life",
        .description = "#% of Damage is taken from Mana before Life"
    };

    // DESECRATED_MINION_COOLDOWN - 1 tiers
    MODIFIERS_DB[1285] = (Modifier){
        .id = 1285,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Minions have #% increased Cooldown Recovery Rate",
        .description = "Minions have #% increased Cooldown Recovery Rate"
    };

    // DESECRATED_INCREASED_SKILL_SPEED - 1 tiers
    MODIFIERS_DB[1286] = (Modifier){
        .id = 1286,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Skill Speed",
        .description = "#% increased Skill Speed"
    };

    // DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL - 1 tiers
    MODIFIERS_DB[1287] = (Modifier){
        .id = 1287,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "Recover #% of maximum Life on Kill",
        .description = "Recover #% of maximum Life on Kill"
    };

    // DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE - 1 tiers
    MODIFIERS_DB[1288] = (Modifier){
        .id = 1288,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+#% to Lightning and Chaos Resistances",
        .description = "+#% to Lightning and Chaos Resistances"
    };

    // DESECRATED_HERALD_RESERVATION_EFFICIENCY - 1 tiers
    MODIFIERS_DB[1289] = (Modifier){
        .id = 1289,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "#% increased Reservation Efficiency of Herald Skills",
        .description = "#% increased Reservation Efficiency of Herald Skills"
    };

    // DESECRATED_LEVEL_ALL_SKILLS - 1 tiers
    MODIFIERS_DB[1290] = (Modifier){
        .id = 1290,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 65,
        .tags = 0,
        .name = "+# to Level of all Skills",
        .description = "+# to Level of all Skills"
    };

    // BASE_MAXIMUM_LIFE - 10 tiers
    MODIFIERS_DB[1291] = (Modifier){
        .id = 1291,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // BASE_MAXIMUM_MANA - 10 tiers
    MODIFIERS_DB[1292] = (Modifier){
        .id = 1292,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // BASE_ENERGY_SHIELD - 10 tiers
    MODIFIERS_DB[1293] = (Modifier){
        .id = 1293,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to maximum Energy Shield",
        .description = "+# to maximum Energy Shield"
    };

    // INCREASED_PERCENT_ARMOUR - 7 tiers
    MODIFIERS_DB[1294] = (Modifier){
        .id = 1294,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Armour",
        .description = "#% increased Armour"
    };

    // INCREASED_PERCENT_EVASION - 7 tiers
    MODIFIERS_DB[1295] = (Modifier){
        .id = 1295,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Evasion Rating",
        .description = "#% increased Evasion Rating"
    };

    // INCREASED_PERCENT_ENERGY_SHIELD - 7 tiers
    MODIFIERS_DB[1296] = (Modifier){
        .id = 1296,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 2,
        .tags = 0,
        .name = "#% increased Energy Shield",
        .description = "#% increased Energy Shield"
    };

    // ACCURACY_RATING - 8 tiers
    MODIFIERS_DB[1297] = (Modifier){
        .id = 1297,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Accuracy Rating",
        .description = "+# to Accuracy Rating"
    };

    // ITEM_FOUND_RARITY_INCREASE_PREFIX - 5 tiers
    MODIFIERS_DB[1298] = (Modifier){
        .id = 1298,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 10,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // BASE_SPIRIT - 5 tiers
    MODIFIERS_DB[1299] = (Modifier){
        .id = 1299,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 16,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };

    // INCREASED_SPELL_DAMAGE - 6 tiers
    MODIFIERS_DB[1300] = (Modifier){
        .id = 1300,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% Increased Spell Damage",
        .description = "+#% Increased Spell Damage"
    };

    // STRENGTH - 8 tiers
    MODIFIERS_DB[1301] = (Modifier){
        .id = 1301,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // DEXTERITY - 8 tiers
    MODIFIERS_DB[1302] = (Modifier){
        .id = 1302,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // INTELLIGENCE - 8 tiers
    MODIFIERS_DB[1303] = (Modifier){
        .id = 1303,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ALL_ATTRIBUTES - 9 tiers
    MODIFIERS_DB[1304] = (Modifier){
        .id = 1304,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "+# to all Attributes",
        .description = "+# to all Attributes"
    };

    // FIRE_RESISTANCE - 8 tiers
    MODIFIERS_DB[1305] = (Modifier){
        .id = 1305,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // COLD_RESISTANCE - 8 tiers
    MODIFIERS_DB[1306] = (Modifier){
        .id = 1306,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // LIGHTNING_RESISTANCE - 8 tiers
    MODIFIERS_DB[1307] = (Modifier){
        .id = 1307,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ALL_RESISTANCES - 6 tiers
    MODIFIERS_DB[1308] = (Modifier){
        .id = 1308,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to all Elemental Resistances",
        .description = "+#% to all Elemental Resistances"
    };

    // CHAOS_RESISTANCE - 6 tiers
    MODIFIERS_DB[1309] = (Modifier){
        .id = 1309,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 250,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ALL_SPELL_SKILL_LEVEL - 3 tiers
    MODIFIERS_DB[1310] = (Modifier){
        .id = 1310,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Spell Skills",
        .description = "+# to Level of all Spell Skills"
    };

    // LEVEL_MINION_SKILL - 3 tiers
    MODIFIERS_DB[1311] = (Modifier){
        .id = 1311,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Minion Skills",
        .description = "+# to Level of all Minion Skills"
    };

    // LEVEL_MELEE_SKILL - 3 tiers
    MODIFIERS_DB[1312] = (Modifier){
        .id = 1312,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Melee Skills",
        .description = "+# to Level of all Melee Skills"
    };

    // LEVEL_PROJECTILE_SKILL - 3 tiers
    MODIFIERS_DB[1313] = (Modifier){
        .id = 1313,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 5,
        .tags = 0,
        .name = "+# to Level of all Projectile Skills",
        .description = "+# to Level of all Projectile Skills"
    };

    // LIFE_REGENERATION_PER_SECOND - 0 tiers
    MODIFIERS_DB[1314] = (Modifier){
        .id = 1314,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "# Life Regeneration per second",
        .description = "# Life Regeneration per second"
    };

    // MANA_REGENERATION_RATE - 6 tiers
    MODIFIERS_DB[1315] = (Modifier){
        .id = 1315,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Mana Regeneration Rate",
        .description = "#% increased Mana Regeneration Rate"
    };

    // INCREASED_CAST_SPEED - 5 tiers
    MODIFIERS_DB[1316] = (Modifier){
        .id = 1316,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 800,
        .level_req = 1,
        .tags = 0,
        .name = "#% increased Cast Speed",
        .description = "#% increased Cast Speed"
    };

    // INCREASED_CRITICAL_HIT_CHANCE - 6 tiers
    MODIFIERS_DB[1317] = (Modifier){
        .id = 1317,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 5,
        .tags = 0,
        .name = "#% increased Critical Hit Chance",
        .description = "#% increased Critical Hit Chance"
    };

    // INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS - 6 tiers
    MODIFIERS_DB[1318] = (Modifier){
        .id = 1318,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 8,
        .tags = 0,
        .name = "#% increased Critical Damage Bonus for Attack Damage",
        .description = "#% increased Critical Damage Bonus for Attack Damage"
    };

    // ITEM_FOUND_RARITY_INCREASE - 5 tiers
    MODIFIERS_DB[1319] = (Modifier){
        .id = 1319,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1000,
        .level_req = 3,
        .tags = 0,
        .name = "#% increased Rarity of Items found",
        .description = "#% increased Rarity of Items found"
    };

    // DAMAGE_TAKEN_RECOUPED_AS_LIFE - 5 tiers
    MODIFIERS_DB[1320] = (Modifier){
        .id = 1320,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 30,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // DAMAGE_TAKEN_RECOUPED_AS_MANA - 5 tiers
    MODIFIERS_DB[1321] = (Modifier){
        .id = 1321,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 500,
        .level_req = 31,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Mana",
        .description = "#% of Damage taken Recouped as Mana"
    };

    // ESSENCE_BASE_MAXIMUM_LIFE - 3 tiers
    MODIFIERS_DB[1322] = (Modifier){
        .id = 1322,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 6,
        .tags = 0,
        .name = "+# to maximum Life",
        .description = "+# to maximum Life"
    };

    // ESSENCE_BASE_MAXIMUM_MANA - 3 tiers
    MODIFIERS_DB[1323] = (Modifier){
        .id = 1323,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+# to maximum Mana",
        .description = "+# to maximum Mana"
    };

    // ESSENCE_INCREASED_GLOBAL_DEFENCES - 1 tiers
    MODIFIERS_DB[1324] = (Modifier){
        .id = 1324,
        .type = MOD_PREFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Global Defences",
        .description = "#% increased Global Defences"
    };

    // ESSENCE_CHAOS_RESISTANCE - 3 tiers
    MODIFIERS_DB[1325] = (Modifier){
        .id = 1325,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 16,
        .tags = 0,
        .name = "+#% to Chaos Resistance",
        .description = "+#% to Chaos Resistance"
    };

    // ESSENCE_ATTRIBUTES_STRENGTH - 3 tiers
    MODIFIERS_DB[1326] = (Modifier){
        .id = 1326,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Strength",
        .description = "+# to Strength"
    };

    // ESSENCE_ATTRIBUTES_DEXTERITY - 3 tiers
    MODIFIERS_DB[1327] = (Modifier){
        .id = 1327,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Dexterity",
        .description = "+# to Dexterity"
    };

    // ESSENCE_ATTRIBUTES_INTELLIGENCE - 3 tiers
    MODIFIERS_DB[1328] = (Modifier){
        .id = 1328,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 11,
        .tags = 0,
        .name = "+# to Intelligence",
        .description = "+# to Intelligence"
    };

    // ESSENCE_PERCENTAGE_ATTRIBUTES_STRENGTH - 1 tiers
    MODIFIERS_DB[1329] = (Modifier){
        .id = 1329,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Strength",
        .description = "#% increased Strength"
    };

    // ESSENCE_PERCENTAGE_ATTRIBUTES_DEXTERITY - 1 tiers
    MODIFIERS_DB[1330] = (Modifier){
        .id = 1330,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Dexterity",
        .description = "#% increased Dexterity"
    };

    // ESSENCE_PERCENTAGE_ATTRIBUTES_INTELLIGENCE - 1 tiers
    MODIFIERS_DB[1331] = (Modifier){
        .id = 1331,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 72,
        .tags = 0,
        .name = "#% increased Intelligence",
        .description = "#% increased Intelligence"
    };

    // ESSENCE_DAMAGE_TAKEN_RECOUPED_AS_LIFE - 1 tiers
    MODIFIERS_DB[1332] = (Modifier){
        .id = 1332,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 68,
        .tags = 0,
        .name = "#% of Damage taken Recouped as Life",
        .description = "#% of Damage taken Recouped as Life"
    };

    // ESSENCE_FIRE_RESISTANCE - 3 tiers
    MODIFIERS_DB[1333] = (Modifier){
        .id = 1333,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Fire Resistance",
        .description = "+#% to Fire Resistance"
    };

    // ESSENCE_COLD_RESISTANCE - 3 tiers
    MODIFIERS_DB[1334] = (Modifier){
        .id = 1334,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Cold Resistance",
        .description = "+#% to Cold Resistance"
    };

    // ESSENCE_LIGHTNING_RESISTANCE - 3 tiers
    MODIFIERS_DB[1335] = (Modifier){
        .id = 1335,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 12,
        .tags = 0,
        .name = "+#% to Lightning Resistance",
        .description = "+#% to Lightning Resistance"
    };

    // ESSENCE_ITEM_FOUND_RARITY_INCREASE - 3 tiers
    MODIFIERS_DB[1336] = (Modifier){
        .id = 1336,
        .type = MOD_SUFFIX,
        .tier = TIER_1,
        .weight = 1,
        .level_req = 24,
        .tags = 0,
        .name = ",
				",
        .description = ",
				"
    };
}
