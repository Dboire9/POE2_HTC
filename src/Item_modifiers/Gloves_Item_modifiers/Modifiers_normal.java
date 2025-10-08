package Item_modifiers.Gloves_Item_modifiers;

import Modifier_class.*;

import java.util.List;

public class Modifiers_normal {

    //PREFIXES
    public static final Modifier BASE_MAXIMUM_LIFE;
    public static final Modifier BASE_MAXIMUM_MANA;
    public static final Modifier BASE_ARMOUR;
    public static final Modifier BASE_EVASION;
    public static final Modifier BASE_ENERGY_SHIELD;
    public static final Modifier INCREASED_PERCENT_ARMOUR;
    public static final Modifier INCREASED_PERCENT_EVASION;
    public static final Modifier INCREASED_PERCENT_ENERGY_SHIELD;
    public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE;
    public static final Modifier HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE;
    public static final Modifier HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE;
    public static final Modifier PHYSICAL_DAMAGE_FLAT;
    public static final Modifier FIRE_DAMAGE_FLAT;
    public static final Modifier COLD_DAMAGE_FLAT;
    public static final Modifier LIGHTNING_DAMAGE_FLAT;
    public static final Modifier ACCURACY_RATING;


    //SUFFIXES
    public static final Modifier STRENGTH;
    public static final Modifier DEXTERITY;
    public static final Modifier INTELLIGENCE;
    public static final Modifier FIRE_RESISTANCE;
    public static final Modifier COLD_RESISTANCE;
    public static final Modifier LIGHTNING_RESISTANCE;
    public static final Modifier CHAOS_RESISTANCE;
    public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
    public static final Modifier LEVEL_MELEE_SKILL;
    public static final Modifier LIFE_LEECH;
    public static final Modifier MANA_LEECH;
    public static final Modifier LIFE_PER_ENEMY_KILLED;
    public static final Modifier MANA_PER_ENEMY_KILLED;
    public static final Modifier LIFE_PER_ENEMY_HIT;
    public static final Modifier INCREASED_ATTACK_SPEED;
    public static final Modifier CRITICAL_DAMAGE_BONUS;
    public static final Modifier ITEM_FOUND_RARITY_INCREASE;
    public static final Modifier ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE;
    public static final Modifier EVASION_APPLIES_TO_DEFLECTION;
    public static final Modifier ENERGY_SHIELD_RECHARGE_RATE;
    


    static {

// PREFIXES

        BASE_MAXIMUM_LIFE = new Modifier(
        "base_maximum_life",
        List.of("life"),
        List.of(
                new ModifierTier("Hale", 1, 1000, new Pair<>(10, 19)),
                new ModifierTier("Healthy", 6, 1000, new Pair<>(20, 29)),
                new ModifierTier("Sanguine", 16, 1000, new Pair<>(30, 39)),
                new ModifierTier("Stalwart", 24, 1000, new Pair<>(40, 59)),
                new ModifierTier("Stout", 33, 1000, new Pair<>(60, 69)),
                new ModifierTier("Robust", 38, 1000, new Pair<>(70, 84)),
                new ModifierTier("Rotund", 46, 1000, new Pair<>(85, 99)),
                new ModifierTier("Virile", 54, 1000, new Pair<>(100, 119)),
                new ModifierTier("Athlete's", 60, 1000, new Pair<>(120, 149))
        ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedLife",
            "+# to maximum Life"
        );

        BASE_MAXIMUM_MANA = new Modifier(
            "base_maximum_mana",
            List.of("mana"),
            List.of(
                    new ModifierTier("Beryl", 1, 1000, new Pair<>(10, 14)),
                    new ModifierTier("Cobalt", 6, 1000, new Pair<>(15, 24)),
                    new ModifierTier("Azure", 16, 1000, new Pair<>(25, 34)),
                    new ModifierTier("Teal", 25, 1000, new Pair<>(35, 54)),
                    new ModifierTier("Cerulean", 33, 1000, new Pair<>(55, 64)),
                    new ModifierTier("Aqua", 38, 1000, new Pair<>(65, 79)),
                    new ModifierTier("Opalescent", 46, 1000, new Pair<>(80, 89)),
                    new ModifierTier("Gentian", 54, 1000, new Pair<>(90, 104)),
                    new ModifierTier("Chalybeous", 60, 1000, new Pair<>(105, 124))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedMana",
            "+# to maximum Mana"
        );

        BASE_ARMOUR = new Modifier(
            "base_armour",
            List.of("defences"),
            List.of(
                new ModifierTier("Lacquered", 1, 1000, new Pair<>(16, 27)),
                new ModifierTier("Studded", 8, 1000, new Pair<>(28, 50)),
                new ModifierTier("Ribbed", 16, 1000, new Pair<>(51, 68)),
                new ModifierTier("Fortified", 25, 1000, new Pair<>(69, 82)),
                new ModifierTier("Plated", 33, 1000, new Pair<>(83, 102)),
                new ModifierTier("Carapaced", 46, 1000, new Pair<>(103, 122)),
                new ModifierTier("Encased", 54, 1000, new Pair<>(123, 160))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefences",
            "+# to Armour"
        );

        BASE_EVASION = new Modifier(
            "base_evasion",
            List.of("defences"),
            List.of(
                new ModifierTier("Agile", 1, 1000, new Pair<>(11, 18)),
                new ModifierTier("Dancer's", 8, 1000, new Pair<>(19, 39)),
                new ModifierTier("Acrobat's", 16, 1000, new Pair<>(40, 56)),
                new ModifierTier("Fleet", 25, 1000, new Pair<>(57, 70)),
                new ModifierTier("Blurred", 33, 1000, new Pair<>(71, 88)),
                new ModifierTier("Phased", 46, 1000, new Pair<>(89, 107)),
                new ModifierTier("Vaporous", 54, 1000, new Pair<>(108, 142))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefences",
            "+# to Evasion Rating"
        );

        BASE_ENERGY_SHIELD = new Modifier(
            "base_energy_shield",
            List.of("defences"),
            List.of(
                new ModifierTier("Shining", 1, 1000, new Pair<>(10, 17)),
                new ModifierTier("Glimmering", 8, 1000, new Pair<>(18, 24)),
                new ModifierTier("Glittering", 16, 1000, new Pair<>(25, 30)),
                new ModifierTier("Glowing", 25, 1000, new Pair<>(31, 35)),
                new ModifierTier("Radiating", 33, 1000, new Pair<>(36, 41)),
                new ModifierTier("Pulsing", 46, 1000, new Pair<>(42, 47)),
                new ModifierTier("Blazing", 54, 1000, new Pair<>(48, 60))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefences",
            "+# to maximum Energy Shield"
        );

        INCREASED_PERCENT_ARMOUR = new Modifier(
            "increased_percent_armour",
            List.of("defences"),
            List.of(
                new ModifierTier("Reinforced", 2, 1000, new Pair<>(15, 26)),
                new ModifierTier("Layered", 16, 1000, new Pair<>(27, 42)),
                new ModifierTier("Lobstered", 35, 1000, new Pair<>(43, 55)),
                new ModifierTier("Buttressed", 46, 1000, new Pair<>(56, 67)),
                new ModifierTier("Thickened", 54, 1000, new Pair<>(68, 79)),
                new ModifierTier("Girded", 60, 1000, new Pair<>(80, 91)),
                new ModifierTier("Impregnable", 65, 1000, new Pair<>(92, 100))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "DefencesPercent",
            "(#)% increased Armour"
        );

        INCREASED_PERCENT_EVASION = new Modifier(
            "increased_percent_evasion",
            List.of("defences"),
            List.of(
                new ModifierTier("Shade's", 2, 1000, new Pair<>(15, 26)),
                new ModifierTier("Ghost's", 16, 1000, new Pair<>(27, 42)),
                new ModifierTier("Spectre's", 33, 1000, new Pair<>(43, 55)),
                new ModifierTier("Wraith's", 46, 1000, new Pair<>(56, 67)),
                new ModifierTier("Phantasm's", 54, 1000, new Pair<>(68, 79)),
                new ModifierTier("Nightmare's", 60, 1000, new Pair<>(80, 91)),
                new ModifierTier("Mirage's", 65, 1000, new Pair<>(92, 100))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "DefencesPercent",
            "(#)% increased Evasion Rating"
        );

        INCREASED_PERCENT_ENERGY_SHIELD = new Modifier(
            "increased_percent_energy_shield",
            List.of("defences"),
            List.of(
                new ModifierTier("Protective", 2, 1000, new Pair<>(15, 26)),
                new ModifierTier("Strong-Willed", 16, 1000, new Pair<>(27, 42)),
                new ModifierTier("Resolute", 33, 1000, new Pair<>(43, 55)),
                new ModifierTier("Fearless", 46, 1000, new Pair<>(56, 67)),
                new ModifierTier("Dauntless", 54, 1000, new Pair<>(68, 79)),
                new ModifierTier("Indomitable", 60, 1000, new Pair<>(80, 91)),
                new ModifierTier("Unassailable", 65, 1000, new Pair<>(92, 100))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "DefencesPercent",
            "(#)% increased Energy Shield"
        );

        HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE = new Modifier(
            "increased_percent_armour", "base_maximum_life",
            List.of("life", "defences"),
            List.of(
                new ModifierTier("Oyster's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10), "increased_percent_armour", "base_maximum_life"),
                new ModifierTier("Lobster's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19), "increased_percent_armour", "base_maximum_life"),
                new ModifierTier("Urchin's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25), "increased_percent_armour", "base_maximum_life"),
                new ModifierTier("Nautilus'", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32), "increased_percent_armour", "base_maximum_life"),
                new ModifierTier("Octopus'", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41), "increased_percent_armour", "base_maximum_life"),
                new ModifierTier("Crocodile's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49), "increased_percent_armour", "base_maximum_life")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefencesAndLife",
            "(#)% increased Armour +# to maximum Life"
        );

        HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE = new Modifier(
            "increased_percent_evasion", "base_maximum_life",
            List.of("life", "defences"),
            List.of(
                new ModifierTier("Flea's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10), "increased_percent_evasion", "base_maximum_life"),
                new ModifierTier("Fawn's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19), "increased_percent_evasion", "base_maximum_life"),
                new ModifierTier("Mouflon's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25), "increased_percent_evasion", "base_maximum_life"),
                new ModifierTier("Ram's", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32), "increased_percent_evasion", "base_maximum_life"),
                new ModifierTier("Ibex's", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41), "increased_percent_evasion", "base_maximum_life"),
                new ModifierTier("Stag's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49), "increased_percent_evasion", "base_maximum_life")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefencesAndLife",
            "(#)% increased Evasion Rating +# to maximum Life"
        );

        HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE = new Modifier(
            "increased_percent_energy_shield", "base_maximum_life",
            List.of("life", "defences"),
            List.of(
                new ModifierTier("Monk's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10), "increased_percent_energy_shield", "base_maximum_life"),
                new ModifierTier("Prior's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19), "increased_percent_energy_shield", "base_maximum_life"),
                new ModifierTier("Abbot's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25), "increased_percent_energy_shield", "base_maximum_life"),
                new ModifierTier("Bishop's", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32), "increased_percent_energy_shield", "base_maximum_life"),
                new ModifierTier("Exarch's", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41), "increased_percent_energy_shield", "base_maximum_life"),
                new ModifierTier("Pope's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49), "increased_percent_energy_shield", "base_maximum_life")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefencesAndLife",
            "(#)% increased Energy Shield +# to maximum Life"
        );

        PHYSICAL_DAMAGE_FLAT = new Modifier(
            "physical_damage_flat",
            List.of("damage", "physical", "attack"),
            List.of(
                new ModifierTier("Glinting", 1, 1000, new Pair<>(1, 2), new Pair<>(3, 3), "", ""),
                new ModifierTier("Burnished", 8, 1000, new Pair<>(2, 3), new Pair<>(4, 6), "", ""),
                new ModifierTier("Polished", 16, 1000, new Pair<>(2, 4), new Pair<>(5, 8), "", ""),
                new ModifierTier("Honed", 33, 1000, new Pair<>(4, 6), new Pair<>(8, 11), "", ""),
                new ModifierTier("Gleaming", 46, 1000, new Pair<>(5, 7), new Pair<>(9, 13), "", ""),
                new ModifierTier("Annealed", 54, 1000, new Pair<>(6, 10), new Pair<>(12, 17), "", ""),
                new ModifierTier("Razor-sharp", 60, 800, new Pair<>(7, 11), new Pair<>(14, 20), "", ""),
                new ModifierTier("Tempered", 65, 600, new Pair<>(10, 15), new Pair<>(18, 26), "", ""),
                new ModifierTier("Flaring", 75, 400, new Pair<>(12, 19), new Pair<>(22, 32), "", "")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "PhysicalDamage",
            "Adds # to # Physical Damage to Attacks"
        );

        FIRE_DAMAGE_FLAT = new Modifier(
            "fire_damage_flat",
            List.of("damage", "elemental", "fire", "attack"),
            List.of(
                new ModifierTier("Heated", 1, 500, new Pair<>(1, 2), new Pair<>(3, 3), "", ""),
                new ModifierTier("Smouldering", 8, 500, new Pair<>(3, 5), new Pair<>(6, 9), "", ""),
                new ModifierTier("Smoking", 16, 500, new Pair<>(6, 8), new Pair<>(10, 13), "", ""),
                new ModifierTier("Burning", 33, 500, new Pair<>(9, 11), new Pair<>(14, 17), "", ""),
                new ModifierTier("Flaming", 46, 500, new Pair<>(12, 13), new Pair<>(18, 20), "", ""),
                new ModifierTier("Scorching", 54, 500, new Pair<>(11, 16), new Pair<>(21, 26), "", ""),
                new ModifierTier("Incinerating", 60, 400, new Pair<>(13, 19), new Pair<>(27, 32), "", ""),
                new ModifierTier("Blasting", 65, 300, new Pair<>(20, 24), new Pair<>(33, 36), "", ""),
                new ModifierTier("Cremating", 75, 200, new Pair<>(25, 29), new Pair<>(37, 45), "", "")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "FireDamage",
            "Adds # to # Fire Damage to Attacks"
        );

        COLD_DAMAGE_FLAT = new Modifier(
            "cold_damage_flat",
            List.of("damage", "elemental", "cold", "attack"),
            List.of(
                new ModifierTier("Frosted", 1, 500, new Pair<>(1, 1), new Pair<>(2, 3), "", ""),
                new ModifierTier("Chilled", 8, 500, new Pair<>(3, 4), new Pair<>(5, 8), "", ""),
                new ModifierTier("Icy", 16, 500, new Pair<>(5, 6), new Pair<>(9, 11), "", ""),
                new ModifierTier("Frigid", 33, 500, new Pair<>(7, 8), new Pair<>(12, 14), "", ""),
                new ModifierTier("Freezing", 46, 500, new Pair<>(9, 10), new Pair<>(15, 17), "", ""),
                new ModifierTier("Frozen", 54, 500, new Pair<>(11, 13), new Pair<>(18, 21), "", ""),
                new ModifierTier("Glaciated", 60, 400, new Pair<>(14, 15), new Pair<>(22, 24), "", ""),
                new ModifierTier("Polar", 65, 300, new Pair<>(16, 20), new Pair<>(25, 31), "", ""),
                new ModifierTier("Entombing", 75, 200, new Pair<>(21, 24), new Pair<>(32, 37), "", "")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "ColdDamage",
            "Adds # to # Cold Damage to Attacks"
        );

        LIGHTNING_DAMAGE_FLAT = new Modifier(
            "lightning_damage_flat",
            List.of("damage", "elemental", "lightning", "attack"),
            List.of(
                new ModifierTier("Humming", 1, 500, new Pair<>(1, 1), new Pair<>(4, 6), "", ""),
                new ModifierTier("Buzzing", 8, 500, new Pair<>(1, 1), new Pair<>(10, 15), "", ""),
                new ModifierTier("Snapping", 16, 500, new Pair<>(1, 1), new Pair<>(16, 22), "", ""),
                new ModifierTier("Crackling", 33, 500, new Pair<>(1, 1), new Pair<>(23, 27), "", ""),
                new ModifierTier("Sparking", 46, 500, new Pair<>(1, 1), new Pair<>(28, 32), "", ""),
                new ModifierTier("Arcing", 54, 500, new Pair<>(1, 2), new Pair<>(33, 40), "", ""),
                new ModifierTier("Shocking", 60, 400, new Pair<>(1, 2), new Pair<>(41, 47), "", ""),
                new ModifierTier("Discharging", 65, 300, new Pair<>(1, 3), new Pair<>(48, 59), "", ""),
                new ModifierTier("Electrocuting", 75, 200, new Pair<>(1, 4), new Pair<>(60, 71), "", "")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "LightningDamage",
            "Adds # to # Lightning Damage to Attacks"
        );

        ACCURACY_RATING = new Modifier(
            "accuracy_rating",
            List.of("attack"),
            List.of(
                new ModifierTier("Precise", 1, 800, new Pair<>(11, 32)),
                new ModifierTier("Reliable", 11, 800, new Pair<>(33, 60)),
                new ModifierTier("Focused", 18, 800, new Pair<>(61, 84)),
                new ModifierTier("Deliberate", 26, 800, new Pair<>(85, 123)),
                new ModifierTier("Consistent", 36, 800, new Pair<>(124, 167)),
                new ModifierTier("Steady", 48, 800, new Pair<>(168, 236)),
                new ModifierTier("Hunter's", 58, 800, new Pair<>(237, 346)),
                new ModifierTier("Ranger's", 67, 400, new Pair<>(347, 450)),
                new ModifierTier("Amazon's", 76, 200, new Pair<>(451, 550))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedAccuracy",
            "+# to Accuracy Rating"
        );

// SUFFIXES

        STRENGTH = new Modifier(
            "strength",
            List.of("attribute"),
            List.of(
                new ModifierTier("of the Brute", 1, 1000, new Pair<>(5, 8)),
                new ModifierTier("of the Wrestler", 11, 1000, new Pair<>(9, 12)),
                new ModifierTier("of the Bear", 22, 1000, new Pair<>(13, 16)),
                new ModifierTier("of the Lion", 33, 1000, new Pair<>(17, 20)),
                new ModifierTier("of the Gorilla", 44, 1000, new Pair<>(21, 24)),
                new ModifierTier("of the Goliath", 55, 1000, new Pair<>(25, 27)),
                new ModifierTier("of the Leviathan", 66, 1000, new Pair<>(28, 30)),
                new ModifierTier("of the Titan", 74, 1000, new Pair<>(31, 33))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "Strength",
            "+# to Strength"
        );

        DEXTERITY = new Modifier(
            "dexterity",
            List.of("attribute"),
            List.of(
                new ModifierTier("of the Mongoose", 1, 1000, new Pair<>(5, 8)),
                new ModifierTier("of the Lynx", 11, 1000, new Pair<>(9, 12)),
                new ModifierTier("of the Fox", 22, 1000, new Pair<>(13, 16)),
                new ModifierTier("of the Falcon", 33, 1000, new Pair<>(17, 20)),
                new ModifierTier("of the Panther", 44, 1000, new Pair<>(21, 24)),
                new ModifierTier("of the Leopard", 55, 1000, new Pair<>(25, 27)),
                new ModifierTier("of the Jaguar", 66, 1000, new Pair<>(28, 30)),
                new ModifierTier("of the Phantom", 74, 1000, new Pair<>(31, 33)),
                new ModifierTier("of the Wind", 81, 1000, new Pair<>(34, 36))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "Dexterity",
            "+# to Dexterity"
        );

        INTELLIGENCE = new Modifier(
            "intelligence",
            List.of("attribute"),
            List.of(
                new ModifierTier("of the Pupil", 1, 1000, new Pair<>(5, 8)),
                new ModifierTier("of the Student", 11, 1000, new Pair<>(9, 12)),
                new ModifierTier("of the Prodigy", 22, 1000, new Pair<>(13, 16)),
                new ModifierTier("of the Augur", 33, 1000, new Pair<>(17, 20)),
                new ModifierTier("of the Philosopher", 44, 1000, new Pair<>(21, 24)),
                new ModifierTier("of the Sage", 55, 1000, new Pair<>(25, 27)),
                new ModifierTier("of the Savant", 66, 1000, new Pair<>(28, 30)),
                new ModifierTier("of the Virtuoso", 74, 1000, new Pair<>(31, 33))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "Intelligence",
            "+# to Intelligence"
        );

        FIRE_RESISTANCE = new Modifier(
            "fire_resistance",
            List.of("elemental", "fire", "resistance"),
            List.of(
                new ModifierTier("of the Whelpling", 1, 1000, new Pair<>(6, 10)),
                new ModifierTier("of the Salamander", 12, 1000, new Pair<>(11, 15)),
                new ModifierTier("of the Drake", 24, 1000, new Pair<>(16, 20)),
                new ModifierTier("of the Kiln", 36, 1000, new Pair<>(21, 25)),
                new ModifierTier("of the Furnace", 48, 1000, new Pair<>(26, 30)),
                new ModifierTier("of the Volcano", 60, 1000, new Pair<>(31, 35)),
                new ModifierTier("of Magma", 71, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Tzteosh", 82, 1000, new Pair<>(41, 45))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "FireResistance",
            "+#% to Fire Resistance"
        );

        COLD_RESISTANCE = new Modifier(
            "cold_resistance",
            List.of("elemental", "cold", "resistance"),
            List.of(
                new ModifierTier("of the Seal", 1, 1000, new Pair<>(6, 10)),
                new ModifierTier("of the Penguin", 14, 1000, new Pair<>(11, 15)),
                new ModifierTier("of the Narwhal", 26, 1000, new Pair<>(16, 20)),
                new ModifierTier("of the Yeti", 38, 1000, new Pair<>(21, 25)),
                new ModifierTier("of the Walrus", 50, 1000, new Pair<>(26, 30)),
                new ModifierTier("of the Polar Bear", 60, 1000, new Pair<>(31, 35)),
                new ModifierTier("of the Ice", 71, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Haast", 82, 1000, new Pair<>(41, 45))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ColdResistance",
            "+#% to Cold Resistance"
        );

        LIGHTNING_RESISTANCE = new Modifier(
            "lightning_resistance",
            List.of("elemental", "lightning", "resistance"),
            List.of(
                new ModifierTier("of the Cloud", 1, 1000, new Pair<>(6, 10)),
                new ModifierTier("of the Squall", 13, 1000, new Pair<>(11, 15)),
                new ModifierTier("of the Storm", 25, 1000, new Pair<>(16, 20)),
                new ModifierTier("of the Thunderhead", 37, 1000, new Pair<>(21, 25)),
                new ModifierTier("of the Tempest", 49, 1000, new Pair<>(26, 30)),
                new ModifierTier("of the Maelstrom", 60, 1000, new Pair<>(31, 35)),
                new ModifierTier("of the Lightning", 71, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Ephij", 82, 1000, new Pair<>(41, 45))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LightningResistance",
            "+#% to Lightning Resistance"
        );

        CHAOS_RESISTANCE = new Modifier(
            "chaos_resistance",
            List.of("chaos", "resistance"),
            List.of(
                new ModifierTier("of the Lost", 16, 250, new Pair<>(4, 7)),
                new ModifierTier("of Banishment", 30, 250, new Pair<>(8, 11)),
                new ModifierTier("of Eviction", 44, 250, new Pair<>(12, 15)),
                new ModifierTier("of Expulsion", 56, 250, new Pair<>(16, 19)),
                new ModifierTier("of Exile", 68, 250, new Pair<>(20, 23)),
                new ModifierTier("of Bameth", 81, 250, new Pair<>(24, 27))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ChaosResistance",
            "+#% to Chaos Resistance"
        );

        REDUCED_ATTRIBUTE_REQUIREMENTS = new Modifier(
            "reduced_attribute_requirements",
            List.of(""),
            List.of(
                new ModifierTier("of the Worthy", 24, 700, new Pair<>(15, 15)),
                new ModifierTier("of the Apt", 32, 700, new Pair<>(20, 20)),
                new ModifierTier("of the Talented", 40, 700, new Pair<>(25, 25)),
                new ModifierTier("of the Skilled", 52, 700, new Pair<>(30, 30)),
                new ModifierTier("of the Proficient", 60, 700, new Pair<>(35, 35))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LocalAttributeRequirements",
            "% reduced Attribute Requirements"
        );

        LEVEL_MELEE_SKILL = new Modifier(
            "level_melee_skill",
            List.of("attack"),
            List.of(
                new ModifierTier("of Combat", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of Dueling", 41, 250, new Pair<>(2, 2))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Melee Skills"
        );

        LIFE_LEECH = new Modifier(
            "life_leech",
            List.of("life", "physical", "attack"),
            List.of(
                new ModifierTier("of the Parasite", 21, 1000, new Pair<>(5.0, 5.9)),
                new ModifierTier("of the Locust", 38, 1000, new Pair<>(6.0, 6.9)),
                new ModifierTier("of the Remora", 54, 1000, new Pair<>(7.0, 7.9)),
                new ModifierTier("of the Lamprey", 68, 1000, new Pair<>(8.0, 8.9)),
                new ModifierTier("of the Vampire", 81, 1000, new Pair<>(9.0, 9.9))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LifeLeech",
            "Leeches #% of Physical Damage as Life"
        );

        MANA_LEECH = new Modifier(
            "mana_leech",
            List.of("mana", "physical", "attack"),
            List.of(
                new ModifierTier("of the Thirsty", 21, 1000, new Pair<>(4.0, 4.9)),
                new ModifierTier("of the Parched", 38, 1000, new Pair<>(5.0, 5.9)),
                new ModifierTier("of the Arid", 54, 1000, new Pair<>(6.0, 6.9)),
                new ModifierTier("of the Drought", 68, 1000, new Pair<>(7.0, 7.9)),
                new ModifierTier("of the Desperate", 81, 1000, new Pair<>(8.0, 8.9))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ManaLeech",
            "Leeches #% of Physical Damage as Mana"
        );

        LIFE_PER_ENEMY_KILLED = new Modifier(
            "life_per_enemy_killed",
            List.of("life"),
            List.of(
                new ModifierTier("of Success", 1, 750, new Pair<>(4, 6)),
                new ModifierTier("of Victory", 11, 750, new Pair<>(7, 9)),
                new ModifierTier("of Triumph", 22, 750, new Pair<>(10, 18)),
                new ModifierTier("of Conquest", 33, 750, new Pair<>(19, 28)),
                new ModifierTier("of Vanquishing", 44, 750, new Pair<>(29, 40)),
                new ModifierTier("of Valour", 55, 750, new Pair<>(41, 53)),
                new ModifierTier("of Glory", 66, 750, new Pair<>(54, 68)),
                new ModifierTier("of Legend", 77, 750, new Pair<>(69, 84))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LifeGainedFromEnemyDeath",
            "Gain # Life per Enemy Killed"
        );

        MANA_PER_ENEMY_KILLED = new Modifier(
            "mana_per_enemy_killed",
            List.of("mana"),
            List.of(
                new ModifierTier("of Absorption", 1, 750, new Pair<>(2, 3)),
                new ModifierTier("of Osmosis", 12, 750, new Pair<>(4, 5)),
                new ModifierTier("of Infusion", 23, 750, new Pair<>(6, 9)),
                new ModifierTier("of Enveloping", 34, 750, new Pair<>(10, 14)),
                new ModifierTier("of Consumption", 45, 750, new Pair<>(15, 20)),
                new ModifierTier("of Siphoning", 56, 750, new Pair<>(21, 27)),
                new ModifierTier("of Devouring", 67, 750, new Pair<>(28, 35)),
                new ModifierTier("of Assimilation", 78, 750, new Pair<>(36, 45))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ManaGainedFromEnemyDeath",
            "Gain # Mana per Enemy Killed"
        );

        LIFE_PER_ENEMY_HIT = new Modifier(
            "life_per_enemy_hit",
            List.of("life", "attack"),
            List.of(
                new ModifierTier("of Rejuvenation", 8, 1000, new Pair<>(2, 2)),
                new ModifierTier("of Restoration", 20, 1000, new Pair<>(3, 3)),
                new ModifierTier("of Regrowth", 30, 1000, new Pair<>(4, 4)),
                new ModifierTier("of Nourishment", 40, 1000, new Pair<>(5, 5))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LifeGainPerTarget",
            "Grants # Life per Enemy Hit"
        );

        INCREASED_ATTACK_SPEED = new Modifier(
            "increased_attack_speed",
            List.of("attack", "speed"),
            List.of(
                new ModifierTier("of Skill", 1, 500, new Pair<>(5, 7)),
                new ModifierTier("of Ease", 22, 500, new Pair<>(8, 10)),
                new ModifierTier("of Mastery", 37, 500, new Pair<>(11, 13)),
                new ModifierTier("of Renown", 60, 500, new Pair<>(14, 16))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedAttackSpeed",
            "#% increased Attack Speed"
        );

        CRITICAL_DAMAGE_BONUS = new Modifier(
            "critical_damage_bonus",
            List.of("damage", "critical"),
            List.of(
                new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 14)),
                new ModifierTier("of Anger", 21, 1000, new Pair<>(15, 19)),
                new ModifierTier("of Rage", 31, 1000, new Pair<>(20, 24)),
                new ModifierTier("of Fury", 45, 500, new Pair<>(25, 29)),
                new ModifierTier("of Ferocity", 59, 250, new Pair<>(30, 34))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "CriticalStrikeMultiplier",
            "#% increased Critical Damage Bonus"
        );

        ITEM_FOUND_RARITY_INCREASE = new Modifier(
            "item_found_rarity_increase",
            List.of(),
            List.of(
                new ModifierTier("of Plunder", 3, 1000, new Pair<>(6, 10)),
                new ModifierTier("of Raiding", 24, 1000, new Pair<>(11, 14)),
                new ModifierTier("of Archaeology", 40, 1000, new Pair<>(15, 18)),
                new ModifierTier("of Excavation", 63, 1000, new Pair<>(19, 21)),
                new ModifierTier("of Windfall", 75, 1000, new Pair<>(22, 25))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ItemFoundRarityIncrease",
            "#% increased Rarity of Items found"
        );

        ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE = new Modifier(
            "armour_applies_to_elemental_damage",
            List.of("defences", "elemental"),
            List.of(
                new ModifierTier("of Covering", 1, 1000, new Pair<>(14, 19)),
                new ModifierTier("of Sheathing", 16, 1000, new Pair<>(20, 25)),
                new ModifierTier("of Lining", 36, 1000, new Pair<>(26, 31)),
                new ModifierTier("of Padding", 48, 1000, new Pair<>(32, 37)),
                new ModifierTier("of Furring", 66, 1000, new Pair<>(38, 43))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "ArmourAppliesToElementalDamage",
            "+#% of Armour also applies to Elemental Damage"
        );

        EVASION_APPLIES_TO_DEFLECTION = new Modifier(
            "evasion_applies_to_deflection",
            List.of("defences"),
            List.of(
                new ModifierTier("of Deflecting", 1, 1000, new Pair<>(8, 11)),
                new ModifierTier("of Bending", 16, 1000, new Pair<>(12, 14)),
                new ModifierTier("of Curvation", 36, 1000, new Pair<>(15, 17)),
                new ModifierTier("of Diversion", 48, 1000, new Pair<>(18, 20)),
                new ModifierTier("of Flexure", 66, 1000, new Pair<>(21, 23))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "EvasionAppliesToDeflection",
            "Gain Deflection Rating equal to (#)% of Evasion Rating"
        );

        ENERGY_SHIELD_RECHARGE_RATE = new Modifier(
            "energy_shield_recharge_rate",
            List.of("defences"),
            List.of(
                new ModifierTier("of Enlivening", 1, 1000, new Pair<>(26, 30)),
                new ModifierTier("of Diffusion", 16, 1000, new Pair<>(31, 35)),
                new ModifierTier("of Dispersal", 36, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Buffering", 48, 1000, new Pair<>(41, 45))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "EnergyShieldRegeneration",
            "(#)% increased Energy Shield Recharge Rate"
        );

    }
}