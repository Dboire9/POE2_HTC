package main.java.core.Item_modifiers.OneHand_Item_modifiers.Spears_Item_modifiers;

import main.java.core.Modifier_class.*;
import main.java.core.Modifier_class.Modifier.ModifierSource;
import main.java.core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_INCREASED_ATTACK_AREA_OF_EFFECT;
    public static final Modifier DESECRATED_COMPANION_DAMAGE;
    public static final Modifier DESECRATED_FIRE_PENETRATION;
    public static final Modifier DESECRATED_CHAIN_FROM_TERRAIN;
    public static final Modifier DESECRATED_INCREASED_MELEE_DAMAGE_IF_PROJECTILE_ATTACK_RECENT;
    public static final Modifier DESECRATED_COLD_PENETRATION;
    public static final Modifier DESECRATED_LIGHTNING_PENETRATION;
    public static final Modifier DESECRATED_PROJECTILE_DAMAGE_FURTHER_6M;
    
    //SUFFIXES
    public static final Modifier DESECRATED_CHANCE_TO_PIERCE;
    public static final Modifier DESECRATED_COMPANION_ATTACK_SPEED;
    public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_IMMOBILISATION_BUILDUP;
    public static final Modifier DESECRATED_CRITICAL_STRIKE_CHANCE_INCREASE_FURTHER_6M;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
    public static final Modifier DESECRATED_MANA_TO_LIFE_COST;
    public static final Modifier DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING;
    public static final Modifier DESECRATED_COMPANION_ATTACK_SPEED_PRESENCE;
    



    static{

        DESECRATED_INCREASED_ATTACK_AREA_OF_EFFECT = new Modifier(
            "increased_attack_area_of_effect",
            List.of("attack", "amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(12, 23))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "IncreasedAttackAreaOfEffect",
            "#% increased Area of Effect for Attacks"
        );

        DESECRATED_COMPANION_DAMAGE = new Modifier(
            "companion_damage",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(40, 59), new Pair<>(40, 59), "", "")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "CompanionDamage",
            "Companions deal #% increased Damage\n#% increased Damage while your Companion is in your Presence"
        );

        DESECRATED_FIRE_PENETRATION = new Modifier(
        "attack_fire_penetration",
            List.of("amanamu_mod", "damage", "elemental", "fire", "attack"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(15, 25))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "FireResistancePenetration",
            "Attacks with this Weapon Penetrate #% Fire Resistance"
        );

        DESECRATED_CHAIN_FROM_TERRAIN = new Modifier(
            "chain_from_terrain",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(25, 35))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ChainFromTerrain",
            "Projectiles have #% chance to Chain an additional time from terrain"
        );

        DESECRATED_INCREASED_MELEE_DAMAGE_IF_PROJECTILE_ATTACK_RECENT = new Modifier(
            "increased_melee_damage_if_projectile_attack_recent",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(60, 79))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "MeleeDamage",
            "#% increased Melee Damage if you've dealt a Projectile Attack Hit in the past eight seconds"
        );

        DESECRATED_COLD_PENETRATION = new Modifier(
            "cold_resistance_penetration",
            List.of("kurgal_mod", "damage", "elemental", "cold", "attack"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(15, 25))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ColdResistancePenetration",
            "Attacks with this Weapon Penetrate #% Cold Resistance"
        );

        DESECRATED_LIGHTNING_PENETRATION = new Modifier(
            "lightning_resistance_penetration",
            List.of("ulaman_mod", "damage", "elemental", "lightning", "attack"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(15, 25))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "LightningResistancePenetration",
            "Attacks with this Weapon Penetrate #% Lightning Resistance"
        );

        DESECRATED_PROJECTILE_DAMAGE_FURTHER_6M = new Modifier(
            "projectile_damage_further_6m",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(60, 79))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ProjectileDamage",
            "Projectiles deal #% increased Damage with Hits against Enemies further than 6m"
        );

// SUFFIXES

        DESECRATED_CHANCE_TO_PIERCE = new Modifier(
            "chance_to_pierce",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(40, 60))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "ChanceToPierce",
            "#% chance to Pierce an Enemy"
        );

        DESECRATED_COMPANION_ATTACK_SPEED = new Modifier(
            "attack_speed",
            "companion_attack_speed",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(12, 18), new Pair<>(12, 18), "attack_speed", "companion_attack_speed")
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CompanionAttackSpeed",
            "#% increased Attack Speed\nCompanions have #% increased Attack Speed"
        );

        DESECRATED_SPIRIT_RESERVATION_EFFICIENCY = new Modifier(
            "spirit_reservation_efficiency",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(5, 10))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "SpiritReservationEfficiency",
            "#% increased Spirit Reservation Efficiency of Skills"
        );

        DESECRATED_IMMOBILISATION_BUILDUP = new Modifier(
            "immobilisation_buildup",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(25, 34))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "Immobilise",
            "#% increased Immobilisation buildup"
        );

        DESECRATED_CRITICAL_STRIKE_CHANCE_INCREASE_FURTHER_6M = new Modifier(
            "critical_strike_chance_increase_further_6m",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(25, 34))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CriticalStrikeChanceIncrease",
            "Projectiles have #% increased Critical Hit Chance against Enemies further than 6m"
        );

        DESECRATED_MANA_COST_EFFICIENCY = new Modifier(
            "mana_cost_efficiency",
            List.of("kurgal_mod", "attack"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(8, 15))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "ManaCostEfficiency",
            "#% increased Cost Efficiency of Attacks"
        );

        DESECRATED_MANA_TO_LIFE_COST = new Modifier(
            "mana_to_life_cost",
            List.of("ulaman_mod", "life"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(15, 20))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "LifeCost",
            "#% of Skill Mana Costs Converted to Life Costs"
        );

        DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING = new Modifier(
            "additional_projectiles_while_moving",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(10, 18))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "AdditionalProjectiles",
            "Projectile Attacks have a #% chance to fire two additional Projectiles while moving"
        );

        DESECRATED_COMPANION_ATTACK_SPEED_PRESENCE = new Modifier(
            "attack_speed",
            "companion_attack_speed",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(8, 13), new Pair<>(8, 13), "attack_speed", "attack_speed")
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CompanionDamage",
            "#% increased Attack Speed\n#% increased Attack Speed while your Companion is in your Presence"
        );
    }
}
