package main.java.core.Item_modifiers.Body_Armours_Item_modifiers.Body_Armours_Normal_Item_modifiers;

import main.java.core.Modifier_class.*;
import main.java.core.Modifier_class.Modifier.ModifierSource;
import main.java.core.Modifier_class.Modifier.ModifierType;

import java.util.List;
public class Modifiers_essences {

        //PREFIXES
        public static final Modifier ESSENCE_BASE_MAXIMUM_LIFE;
        public static final Modifier ESSENCE_INCREASED_PERCENT_ARMOUR;
        public static final Modifier ESSENCE_INCREASED_PERCENT_EVASION;
        public static final Modifier ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD;
        public static final Modifier ESSENCE_MAXIMUM_LIFE_INCREASE_PERCENT;
        public static final Modifier ESSENCE_PHYSICAL_DAMAGE_TAKEN_AS_CHAOS;
        public static final Modifier ESSENCE_PHYSICAL_THORNS_DAMAGE;
        public static final Modifier ESSENCE_RANDOM_NOTABLE_PASSIVE;
        public static final Modifier ESSENCE_ABYSS_PREFIX;

        
    
        //SUFFIXES
        public static final Modifier ESSENCE_CHAOS_RESISTANCE;
        public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
        public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
        public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
        public static final Modifier ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF;
        public static final Modifier ESSENCE_ABYSS_SUFFIX;
        public static final Modifier ESSENCE_FIRE_RESISTANCE;
        public static final Modifier ESSENCE_COLD_RESISTANCE;
        public static final Modifier ESSENCE_LIGHTNING_RESISTANCE;
        


    static {

        ESSENCE_BASE_MAXIMUM_LIFE = new Modifier(
            "base_maximum_life",
            List.of("life"),
            List.of(
                new ModifierTier("Lesser Essence of the Body", 16, 1, new Pair<>(30, 39)),
                new ModifierTier("Essence of the Body", 38, 1, new Pair<>(85, 99)),
                new ModifierTier("Greater Essence of the Body", 46, 1, new Pair<>(100, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "IncreasedLife",
            "+# to maximum Life"
        );

        ESSENCE_INCREASED_PERCENT_ARMOUR = new Modifier(
            "increased_percent_armour",
            List.of("defences"),
            List.of(
                new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
                new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
                new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "DefencesPercentArmour",
            "#% increased Armour"
        );
        
        ESSENCE_INCREASED_PERCENT_EVASION = new Modifier(
            "increased_percent_evasion",
            List.of("defences"),
            List.of(
                new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
                new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
                new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "DefencesPercentEvasion",
            "#% increased Evasion"
        );
        
        ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD = new Modifier(
            "increased_percent_energy_shield",
            List.of("defences"),
            List.of(
                new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
                new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
                new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "DefencesPercentEnergyShield",
            "#% increased Energy Shield"
        );

        ESSENCE_MAXIMUM_LIFE_INCREASE_PERCENT = new Modifier(
            "maximum_life_increase_percent",
            List.of("life"),
            List.of(
                new ModifierTier("Perfect Essence of the Body", 72, 1, new Pair<>(8, 10))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "MaximumLifeIncreasePercent",
            "(#)% increased maximum Life"
        );

        ESSENCE_PHYSICAL_DAMAGE_TAKEN_AS_CHAOS = new Modifier(
            "physical_damage_taken_as_chaos",
            List.of("physical", "chaos"),
            List.of(
                new ModifierTier("Perfect Essence of Ruin", 72, 1, new Pair<>(10, 15))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "PhysicalDamageTakenAsChaos",
            "(#)% of Physical Damage from Hits taken as Chaos Damage"
        );

        ESSENCE_PHYSICAL_THORNS_DAMAGE = new Modifier(
            "physical_thorns_damage",
            List.of("damage", "physical"),
            List.of(
                new ModifierTier("Essence of Hysteria", 63, 1, new Pair<>(64, 97), new Pair<>(97, 145), "", "")
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "Thorns",
            "Adds (#) to (#) Physical Thorns damage"
        );

        ESSENCE_RANDOM_NOTABLE_PASSIVE = new Modifier(
            "essence_random_notable_passive",
            List.of(),
            List.of(
                new ModifierTier("Essence of Delirium", 1, 1, new Pair<>(0, 0))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "EssenceGrantedPassive",
            "Allocates a random Notable Passive Skill"
        );


        ESSENCE_ABYSS_PREFIX = new Modifier(
            "essence_abyss",
            List.of(),
            List.of(
                new ModifierTier("Essence of the Abyss", 1, 1, new Pair<>(0, 0))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "EssenceAbyss",
            "Mark of the Abyssal Lord"
        );

// SUFFIXES

        ESSENCE_CHAOS_RESISTANCE = new Modifier(
            "chaos_resistance",
            List.of("chaos", "resistance"),
            List.of(
                new ModifierTier("Lesser Essence of Ruin", 16, 1, new Pair<>(4, 7)),
                new ModifierTier("Essence of Ruin", 30, 1, new Pair<>(8, 11)),
                new ModifierTier("Greater Essence of Ruin", 56, 1, new Pair<>(16, 19))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "ChaosResistance",
            "+#% to Chaos Resistance"
        );

        ESSENCE_ATTRIBUTES_STRENGTH = new Modifier(
            "attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Strength",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_ATTRIBUTES_DEXTERITY = new Modifier(
            "attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Dexterity",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_ATTRIBUTES_INTELLIGENCE = new Modifier(
            "attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Intelligence",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_REDUCED_CRITICAL_STRIKE_DAMAGE_TAKEN_ON_SELF = new Modifier(
            "reduced_critical_strike_damage_taken_on_self",
            List.of(),
            List.of(
                new ModifierTier("Perfect Essence of Seeking", 72, 1, new Pair<>(40, 50))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "ReducedCriticalStrikeDamageTaken",
            "Hits against you have (#)% reduced Critical Damage Bonus"
        );

        ESSENCE_ABYSS_SUFFIX = new Modifier(
            "essence_abyss",
            List.of("mark_of_abyssal_lord"),
            List.of(
                new ModifierTier("Essence of the Abyss", 1, 1, new Pair<>(0, 0))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "EssenceAbyss",
            "Mark of the Abyssal Lord"
        );

        ESSENCE_FIRE_RESISTANCE = new Modifier(
            "fire_resistance",
            List.of("elemental", "fire", "resistance"),
            List.of(
                new ModifierTier("Lesser Essence of Insulation", 12, 1, new Pair<>(11, 15)),
                new ModifierTier("Essence of Insulation", 36, 1, new Pair<>(21, 25)),
                new ModifierTier("Greater Essence of Insulation", 60, 1, new Pair<>(31, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "FireResistance",
            "+#% to Fire Resistance"
        );
        
        ESSENCE_COLD_RESISTANCE = new Modifier(
            "cold_resistance",
            List.of("elemental", "cold", "resistance"),
            List.of(
                new ModifierTier("Lesser Essence of Thawing", 12, 1, new Pair<>(11, 15)),
                new ModifierTier("Essence of Thawing", 36, 1, new Pair<>(21, 25)),
                new ModifierTier("Greater Essence of Thawing", 60, 1, new Pair<>(31, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "ColdResistance",
            "+#% to Cold Resistance"
        );
        
        ESSENCE_LIGHTNING_RESISTANCE = new Modifier(
            "lightning_resistance",
            List.of("elemental", "lightning", "resistance"),
            List.of(
                new ModifierTier("Lesser Essence of Grounding", 12, 1, new Pair<>(11, 15)),
                new ModifierTier("Essence of Grounding", 36, 1, new Pair<>(21, 25)),
                new ModifierTier("Greater Essence of Grounding", 60, 1, new Pair<>(31, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "LightningResistance",
            "+#% to Lightning Resistance"
        );


    }

}
