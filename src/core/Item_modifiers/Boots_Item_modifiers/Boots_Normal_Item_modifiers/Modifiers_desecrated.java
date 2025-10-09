package core.Item_modifiers.Boots_Item_modifiers.Boots_Normal_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

    // NO PREFIXES FOR THE GLOVES


    //SHARED SUFFIXES
    public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
    public static final Modifier DESECRATED_DODGE_ROLL_DISTANCE;
    public static final Modifier DESECRATED_SLOW_POTENCY_REDUCTION;
    public static final Modifier DESECRATED_REDUCED_SELF_IGNITE_DURATION;
    public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_REDUCED_BLEEDING_DURATION;
    public static final Modifier DESECRATED_REDUCED_POISON_DURATION;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY_IF_DODGE_ROLL;
    public static final Modifier DESECRATED_MANA_REGENERATION_WHILE_STATIONARY;
    public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_CORRUPTED_BLOOD_IMMUNITY;
    public static final Modifier DESECRATED_REDUCES_MOVEMENT_VELOCITY_PENALTY_SKILLS_WHEN_MOVING;



    static{

        DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
            "fire_resistance", "chaos_resistance",
            List.of("amanamu_mod", "elemental", "fire", "chaos", "resistance"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17), "fire_resistance", "chaos_resistance")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "FireAndChaosDamageResistance",
            "+#% to Fire and Chaos Resistances"
        );

        
        DESECRATED_STRENGTH_AND_INTELLIGENCE = new Modifier(
            "strength", "intelligence",
            List.of("amanamu_mod", "attribute"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "strength", "intelligence")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "StrengthAndIntelligence",
            "+# to Strength and Intelligence"
        );
    
        DESECRATED_STRENGTH_AND_DEXTERITY = new Modifier(
            "strength", "dexterity",
            List.of("ulaman_mod", "attribute"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "strength", "dexterity")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "StrengthAndDexterity",
            "+# to Strength and Dexterity"
        );

        DESECRATED_DODGE_ROLL_DISTANCE = new Modifier(
            "dodge_roll_distance",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20)) // Representing 0.1–0.2 metres as integers
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DodgeRollDistance",
            "+#.# metres to Dodge Roll distance"
        );

        DESECRATED_SLOW_POTENCY_REDUCTION = new Modifier(
            "slow_potency_reduction",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(12, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "SlowPotencyReduction",
            "#% reduced Slowing Potency of Debuffs on You"
        );

        DESECRATED_REDUCED_SELF_IGNITE_DURATION = new Modifier(
            "reduced_self_ignite_duration",
            List.of("amanamu_mod", "elemental", "fire", "ailment"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ReducedSelfIgniteDuration",
            "#% reduced Ignite Duration on you"
        );

        DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
            "cold_resistance", "chaos_resistance",
            List.of("kurgal_mod", "elemental", "cold", "chaos", "resistance"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17), "cold_resistance", "chaos_resistance")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ColdAndChaosDamageResistance",
            "+#% to Cold and Chaos Resistances"
        );
        
        DESECRATED_DEXTERITY_AND_INTELLIGENCE = new Modifier(
            "dexterity", "intelligence",
            List.of("kurgal_mod", "attribute"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "dexterity", "intelligence")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DexterityAndIntelligence",
            "+# to Dexterity and Intelligence"
        );

        DESECRATED_REDUCED_BLEEDING_DURATION = new Modifier(
            "reduced_bleeding_duration",
            List.of("kurgal_mod", "physical", "ailment"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ReducedBleedingDuration",
            "#% reduced Duration of Bleeding on You"
        );
    
        DESECRATED_REDUCED_POISON_DURATION = new Modifier(
            "reduced_poison_duration",
            List.of("ulaman_mod", "chaos", "ailment"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ReducedPoisonDuration",
            "#% reduced Poison Duration on you"
        );

        DESECRATED_MANA_COST_EFFICIENCY_IF_DODGE_ROLL = new Modifier(
            "mana_cost_efficiency_if_dodge_roll",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(8, 12))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ManaCostEfficiency",
            "#% increased Mana Cost Efficiency if you have Dodge Rolled Recently"
        );

        DESECRATED_MANA_REGENERATION_WHILE_STATIONARY = new Modifier(
            "mana_regeneration_while_stationary",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(40, 50))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ManaRegeneration",
            "#% increased Mana Regeneration Rate while stationary"
        );

        DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
            "lightning_resistance", "chaos_resistance",
            List.of("ulaman_mod", "elemental", "lightning", "chaos", "resistance"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17), "lightning_resistance", "chaos_resistance")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "LightningAndChaosDamageResistance",
            "+#% to Lightning and Chaos Resistances"
        );

        DESECRATED_CORRUPTED_BLOOD_IMMUNITY = new Modifier(
            "corrupted_blood_immunity",
            List.of("ulaman_mod", "physical", "ailment"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(1, 1))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "CorruptedBloodImmunity",
            "Corrupted Blood cannot be inflicted on you"
        );

        DESECRATED_REDUCES_MOVEMENT_VELOCITY_PENALTY_SKILLS_WHEN_MOVING = new Modifier(
            "reduces_movement_velocity_penalty_skills_when_moving",
            List.of("ulaman_mod", "speed"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1000, new Pair<>(6, 10))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "MovementVelocityPenalty",
            "#% reduced Movement Speed Penalty from using Skills while moving"
        );

    }
}
