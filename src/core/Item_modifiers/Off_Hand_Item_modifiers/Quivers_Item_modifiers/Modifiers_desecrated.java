package core.Item_modifiers.Off_Hand_Item_modifiers.Quivers_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_INCREASED_DAMAGE_WITH_HITS_WITHIN_2M;
    public static final Modifier DESECRATED_PROJECTILE_DAMAGE_FURTHER_6M;
    public static final Modifier DESECRATED_PROJECTILE_SPEED_TO_DAMAGE;
    
    //SUFFIXES
    public static final Modifier DESECRATED_CRITICAL_DAMAGE_BONUS_WITHIN_2M;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
    public static final Modifier DESECRATED_CRITICAL_STRIKE_CHANCE_INCREASE_FURTHER_6M;
    public static final Modifier DESECRATED_MANA_TO_LIFE_COST;
    public static final Modifier DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING;
    



    static{

        DESECRATED_INCREASED_DAMAGE_WITH_HITS_WITHIN_2M = new Modifier(
            "increased_damage_with_hits_within_2m",
            List.of("kurgal_mod", "damage"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(20, 30))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ProjectileDamage",
            "Projectiles deal #% increased Damage with Hits against Enemies within 2m"
        );

        DESECRATED_PROJECTILE_DAMAGE_FURTHER_6M = new Modifier(
            "projectile_damage_further_6m",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(20, 30))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ProjectileDamage",
            "Projectiles deal #% increased Damage with Hits against Enemies further than 6m"
        );

        DESECRATED_PROJECTILE_SPEED_TO_DAMAGE = new Modifier(
            "projectile_speed_to_damage",
            List.of("ulaman_mod", "damage", "projectile"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(20, 30))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ProjectileSpeedToDamage",
            "Increases and Reductions to Projectile Speed also apply to Damage with Bows"
        );


// SUFFIXES

        DESECRATED_CRITICAL_DAMAGE_BONUS_WITHIN_2M = new Modifier(
            "critical_damage_bonus_within_2m",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(18, 26))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CriticalStrikeMultiplier",
            "Projectiles have #% increased Critical Damage Bonus against Enemies within 2m"
        );

        DESECRATED_MANA_COST_EFFICIENCY = new Modifier(
            "mana_cost_efficiency",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1000, new Pair<>(6, 10))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ManaCostEfficiency",
            "#% increased Mana Cost Efficiency"
        );

        DESECRATED_CRITICAL_STRIKE_CHANCE_INCREASE_FURTHER_6M = new Modifier(
            "critical_strike_chance_increase_further_6m",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(18, 26))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CriticalStrikeChanceIncrease",
            "Projectiles have #% increased Critical Hit Chance against Enemies further than 6m"
        );

        DESECRATED_MANA_TO_LIFE_COST = new Modifier(
            "mana_to_life_cost",
            List.of("ulaman_mod", "life"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(10, 14))
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
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(8, 12))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "AdditionalProjectiles",
            "Projectile Attacks have a #% chance to fire two additional Projectiles while moving"
        );


    }
}
