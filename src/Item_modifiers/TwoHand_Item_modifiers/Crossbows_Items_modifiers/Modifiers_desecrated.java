package Item_modifiers.TwoHand_Item_modifiers.Crossbows_Items_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_GRENADE_COOLDOWN_USE;
    public static final Modifier DESECRATED_INCREASED_GRENADE_DAMAGE_AND_DURATION;
    public static final Modifier DESECRATED_FIRE_PENETRATION;
    public static final Modifier DESECRATED_INCREASED_DAMAGE_WITH_HITS_WITHIN_2M;
    public static final Modifier DESECRATED_COLD_PENETRATION;
    public static final Modifier DESECRATED_ADDITIONAL_BALLISTA_TOTEM;
    public static final Modifier DESECRATED_LIGHTNING_PENETRATION;
    
    //SUFFIXES

    public static final Modifier DESECRATED_GRENADE_ADDITIONAL_DETONATION_CHANCE;
    public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_CROSSBOW_IMMEDIATE_RELOAD_CHANCE;
    public static final Modifier DESECRATED_CROSSBOW_RELOAD_SPEED;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
    public static final Modifier DESECRATED_CHAIN;
    public static final Modifier DESECRATED_CRITICAL_DAMAGE_BONUS_WITHIN_2M;
    public static final Modifier DESECRATED_MANA_TO_LIFE_COST;

    static {

//PREFIXES

        DESECRATED_GRENADE_COOLDOWN_USE = new Modifier(
            "grenade_cooldown_use",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(1, 1))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "GrenadeCooldownUse",
            "Grenade Skills have +# Cooldown Use"
        );

        DESECRATED_INCREASED_GRENADE_DAMAGE_AND_DURATION = new Modifier(
            "increased_grenade_damage", "increased_grenade_duration",
            List.of("amanamu_mod", "damage"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(101, 121), new Pair<>(20, 30), "increased_grenade_damage", "increased_grenade_duration")
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "GrenadeDamage",
            "#% increased Grenade Damage\n#% increased Grenade Duration"
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

        DESECRATED_INCREASED_DAMAGE_WITH_HITS_WITHIN_2M = new Modifier(
            "increased_damage_with_hits_within_2m",
            List.of("kurgal_mod", "damage"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(85, 109))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ProjectileDamage",
            "Projectiles deal #% increased Damage with Hits against Enemies within 2m"
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

        DESECRATED_ADDITIONAL_BALLISTA_TOTEM = new Modifier(
            "additional_ballista_totem",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(1, 1))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "AdditionalBallistaTotem",
            "+# to maximum number of Summoned Ballista Totems"
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


        //SUFFIXES

        DESECRATED_GRENADE_ADDITIONAL_DETONATION_CHANCE = new Modifier(
            "grenade_additional_detonation_chance",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(15, 25))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "GrenadeAdditionalDetonationChance",
            "Grenades have #% chance to activate a second time"
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

        DESECRATED_CROSSBOW_IMMEDIATE_RELOAD_CHANCE = new Modifier(
            "crossbow_immediate_reload_chance",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(15, 20))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CrossbowImmediateReloadChance",
            "#% chance when you Reload a Crossbow to be immediate"
        );

        DESECRATED_CROSSBOW_RELOAD_SPEED = new Modifier(
            "crossbow_reload_speed",
            List.of("kurgal_mod", "attack", "speed"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(17, 25))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CrossbowReloadSpeed",
            "#% increased Reload Speed"
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

        DESECRATED_CHAIN = new Modifier(
            "chain",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(1, 1))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "Chain",
            "Attacks Chain an additional time"
        );
        
        DESECRATED_CRITICAL_DAMAGE_BONUS_WITHIN_2M = new Modifier(
            "critical_damage_bonus_within_2m",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(27, 38))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CriticalStrikeMultiplier",
            "Projectiles have #% increased Critical Damage Bonus against Enemies within 2m"
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
    }
}
