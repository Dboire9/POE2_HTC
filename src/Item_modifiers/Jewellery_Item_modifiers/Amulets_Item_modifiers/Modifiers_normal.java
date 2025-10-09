package Item_modifiers.Jewellery_Item_modifiers.Amulets_Item_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

    //PREFIXES
    public static final Modifier BASE_MAXIMUM_LIFE;
    public static final Modifier BASE_MAXIMUM_MANA;
    public static final Modifier BASE_ENERGY_SHIELD;
    public static final Modifier INCREASED_PERCENT_ARMOUR;
    public static final Modifier INCREASED_PERCENT_EVASION;
    public static final Modifier INCREASED_PERCENT_ENERGY_SHIELD;
    public static final Modifier ACCURACY_RATING;
    public static final Modifier ITEM_FOUND_RARITY_INCREASE_PREFIX;
    public static final Modifier BASE_SPIRIT;
    public static final Modifier INCREASED_SPELL_DAMAGE;



    //SUFFIXES
    public static final Modifier STRENGTH;
    public static final Modifier DEXTERITY;
    public static final Modifier INTELLIGENCE;
    public static final Modifier ALL_ATTRIBUTES;
    public static final Modifier FIRE_RESISTANCE;
    public static final Modifier COLD_RESISTANCE;
    public static final Modifier LIGHTNING_RESISTANCE;
    public static final Modifier ALL_RESISTANCES;
    public static final Modifier CHAOS_RESISTANCE;
    public static final Modifier ALL_SPELL_SKILL_LEVEL;
    public static final Modifier LEVEL_MINION_SKILL;
    public static final Modifier LEVEL_MELEE_SKILL;
    public static final Modifier LEVEL_PROJECTILE_SKILL;
    public static final Modifier LIFE_REGENERATION_PER_SECOND;
    public static final Modifier MANA_REGENERATION_RATE;
    public static final Modifier INCREASED_CAST_SPEED;
    public static final Modifier INCREASED_CRITICAL_HIT_CHANCE;
    public static final Modifier INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS;
    public static final Modifier ITEM_FOUND_RARITY_INCREASE;
    public static final Modifier DAMAGE_TAKEN_RECOUPED_AS_LIFE;
    public static final Modifier DAMAGE_TAKEN_RECOUPED_AS_MANA;


    


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
                        new ModifierTier("Athlete's", 60, 1000, new Pair<>(120, 149)),
                        new ModifierTier("Fecund", 65, 1000, new Pair<>(150, 174))
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
                new ModifierTier("Chalybeous", 60, 1000, new Pair<>(105, 124)),
                new ModifierTier("Mazarine", 65, 1000, new Pair<>(125, 149))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedMana",
            "+# to maximum Mana"
        );

        BASE_ENERGY_SHIELD = new Modifier(
            "base_energy_shield",
            List.of("defences"),
            List.of(
                new ModifierTier("Shining", 1, 1000, new Pair<>(8, 14)),
                new ModifierTier("Glimmering", 11, 1000, new Pair<>(15, 20)),
                new ModifierTier("Glittering", 16, 1000, new Pair<>(21, 24)),
                new ModifierTier("Glowing", 25, 1000, new Pair<>(25, 33)),
                new ModifierTier("Radiating", 33, 1000, new Pair<>(34, 41)),
                new ModifierTier("Pulsing", 46, 1000, new Pair<>(42, 51)),
                new ModifierTier("Blazing", 54, 1000, new Pair<>(52, 61)),
                new ModifierTier("Dazzling", 65, 1000, new Pair<>(62, 70)),
                new ModifierTier("Scintillating", 70, 1000, new Pair<>(71, 79)),
                new ModifierTier("Incandescent", 80, 1000, new Pair<>(80, 89))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedEnergyShield",
            "+# to maximum Energy Shield"
        );

        INCREASED_PERCENT_ARMOUR = new Modifier(
            "increased_percent_armour",
            List.of("defences"),
            List.of(
                new ModifierTier("Reinforced", 2, 1000, new Pair<>(10, 14)),
                new ModifierTier("Layered", 16, 1000, new Pair<>(15, 20)),
                new ModifierTier("Lobstered", 33, 1000, new Pair<>(21, 26)),
                new ModifierTier("Buttressed", 46, 1000, new Pair<>(27, 32)),
                new ModifierTier("Thickened", 54, 1000, new Pair<>(33, 38)),
                new ModifierTier("Girded", 65, 1000, new Pair<>(39, 44)),
                new ModifierTier("Impregnable", 75, 1000, new Pair<>(45, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedPhysicalDamageReductionRatingPercent",
            "(#)% increased Armour"
        );

        INCREASED_PERCENT_EVASION = new Modifier(
            "increased_percent_evasion",
            List.of("defences"),
            List.of(
                new ModifierTier("Shade's", 2, 1000, new Pair<>(10, 14)),
                new ModifierTier("Ghost's", 16, 1000, new Pair<>(15, 20)),
                new ModifierTier("Spectre's", 33, 1000, new Pair<>(21, 26)),
                new ModifierTier("Wraith's", 46, 1000, new Pair<>(27, 32)),
                new ModifierTier("Phantasm's", 54, 1000, new Pair<>(33, 38)),
                new ModifierTier("Nightmare's", 70, 1000, new Pair<>(39, 44)),
                new ModifierTier("Mirage's", 77, 1000, new Pair<>(45, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "EvasionRatingPercent",
            "(#)% increased Evasion Rating"
        );

        INCREASED_PERCENT_ENERGY_SHIELD = new Modifier(
            "increased_percent_energy_shield",
            List.of("defences"),
            List.of(
                new ModifierTier("Protective", 2, 1000, new Pair<>(10, 14)),
                new ModifierTier("Strong-Willed", 16, 1000, new Pair<>(15, 20)),
                new ModifierTier("Resolute", 33, 1000, new Pair<>(21, 26)),
                new ModifierTier("Fearless", 46, 1000, new Pair<>(27, 32)),
                new ModifierTier("Dauntless", 54, 1000, new Pair<>(33, 38)),
                new ModifierTier("Indomitable", 65, 1000, new Pair<>(39, 44)),
                new ModifierTier("Unassailable", 75, 1000, new Pair<>(45, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "EnergyShieldPercent",
            "(#)% increased Energy Shield"
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
                new ModifierTier("Ranger's", 67, 400, new Pair<>(347, 450))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "IncreasedAccuracy",
            "+# to Accuracy Rating"
        );

        ITEM_FOUND_RARITY_INCREASE_PREFIX = new Modifier(
            "increased_rarity_of_items_found",
            List.of("rarity"),
            List.of(
                new ModifierTier("Magpie's", 10, 1000, new Pair<>(8, 11)),
                new ModifierTier("Collector's", 29, 1000, new Pair<>(12, 15)),
                new ModifierTier("Hoarder's", 47, 1000, new Pair<>(16, 19)),
                new ModifierTier("Pirate's", 65, 1000, new Pair<>(20, 22)),
                new ModifierTier("Dragon's", 81, 1000, new Pair<>(23, 25))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "ItemFoundRarityIncreasePrefix",
            "(#)% increased Rarity of Items found"
        );

        BASE_SPIRIT = new Modifier(
            "base_spirit",
            List.of("spirit"),
            List.of(
                new ModifierTier("Lady's", 16, 500, new Pair<>(30, 33)),
                new ModifierTier("Baronness'", 25, 500, new Pair<>(34, 37)),
                new ModifierTier("Viscountess'", 33, 500, new Pair<>(38, 42)),
                new ModifierTier("Marchioness'", 46, 500, new Pair<>(43, 46)),
                new ModifierTier("Countess'", 54, 400, new Pair<>(47, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseSpirit",
            "+# to Spirit"
        );

        INCREASED_SPELL_DAMAGE = new Modifier(
            "increased_spell_damage",
            List.of("damage", "caster"),
            List.of(
                new ModifierTier("Apprentice's", 1, 1000, new Pair<>(3, 7)),
                new ModifierTier("Adept's", 16, 1000, new Pair<>(8, 12)),
                new ModifierTier("Scholar's", 33, 1000, new Pair<>(13, 17)),
                new ModifierTier("Professor's", 46, 1000, new Pair<>(18, 22)),
                new ModifierTier("Occultist's", 60, 1000, new Pair<>(23, 26)),
                new ModifierTier("Incanter's", 75, 1000, new Pair<>(27, 30))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "SpellDamage",
            "+#% Increased Spell Damage"
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
                new ModifierTier("of the Phantom", 74, 1000, new Pair<>(31, 33))
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

        ALL_ATTRIBUTES = new Modifier(
            "all_attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("of the Clouds", 1, 800, new Pair<>(2, 4), new Pair<>(2, 4), new Pair<>(2, 4), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Sky", 11, 800, new Pair<>(5, 7), new Pair<>(5, 7), new Pair<>(5, 7), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Meteor", 22, 800, new Pair<>(8, 10), new Pair<>(8, 10), new Pair<>(8, 10), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Comet", 33, 800, new Pair<>(11, 13), new Pair<>(11, 13), new Pair<>(11, 13), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Heavens", 44, 800, new Pair<>(14, 16), new Pair<>(14, 16), new Pair<>(14, 16), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Galaxy", 55, 800, new Pair<>(17, 18), new Pair<>(17, 18), new Pair<>(17, 18), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Universe", 66, 800, new Pair<>(19, 20), new Pair<>(19, 20), new Pair<>(19, 20), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Multiverse", 75, 800, new Pair<>(21, 22), new Pair<>(21, 22), new Pair<>(21, 22), "strength", "dexterity", "intelligence"),
                new ModifierTier("of the Infinite", 82, 800, new Pair<>(23, 24), new Pair<>(23, 24), new Pair<>(23, 24), "strength", "dexterity", "intelligence")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "AllAttributes",
            "+# to all Attributes"
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

        ALL_RESISTANCES = new Modifier(
            "all_resistances",
            List.of("elemental", "fire", "cold", "lightning", "resistance"),
            List.of(
                new ModifierTier("of the Crystal", 12, 800, new Pair<>(3, 5), new Pair<>(3, 5), new Pair<>(3, 5), "fire_resistance", "cold_resistance", "lightning_resistance"),
                new ModifierTier("of the Prism", 26, 800, new Pair<>(6, 8), new Pair<>(6, 8), new Pair<>(6, 8), "fire_resistance", "cold_resistance", "lightning_resistance"),
                new ModifierTier("of the Kaleidoscope", 40, 800, new Pair<>(9, 11), new Pair<>(9, 11), new Pair<>(9, 11), "fire_resistance", "cold_resistance", "lightning_resistance"),
                new ModifierTier("of Variegation", 54, 800, new Pair<>(12, 14), new Pair<>(12, 14), new Pair<>(12, 14), "fire_resistance", "cold_resistance", "lightning_resistance"),
                new ModifierTier("of the Rainbow", 68, 800, new Pair<>(15, 16), new Pair<>(15, 16), new Pair<>(15, 16), "fire_resistance", "cold_resistance", "lightning_resistance"),
                new ModifierTier("of the Span", 80, 800, new Pair<>(17, 18), new Pair<>(17, 18), new Pair<>(17, 18), "fire_resistance", "cold_resistance", "lightning_resistance")
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "AllResistances",
            "+#% to all Elemental Resistances"
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

        ALL_SPELL_SKILL_LEVEL = new Modifier(
            "spell_skill_level",
            List.of("caster", "gem"),
            List.of(
                new ModifierTier("of the Mage", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of the Enchanter", 41, 250, new Pair<>(2, 2)),
                new ModifierTier("of the Sorcerer", 75, 100, new Pair<>(3, 3))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Spell Skills"
        );

        LEVEL_MINION_SKILL = new Modifier(
            "level_minion_skill",
            List.of("minion", "gem"),
            List.of(
                new ModifierTier("of the Taskmaster", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of the Despot", 41, 250, new Pair<>(2, 2)),
                new ModifierTier("of the Overseer", 75, 100, new Pair<>(3, 3))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Minion Skills"
        );

        LEVEL_MELEE_SKILL = new Modifier(
            "level_melee_skill",
            List.of("attack"),
            List.of(
                new ModifierTier("of Combat", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of Dueling", 41, 250, new Pair<>(2, 2)),
                new ModifierTier("of Battle", 75, 100, new Pair<>(3, 3))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Melee Skills"
        );

        LEVEL_PROJECTILE_SKILL = new Modifier(
            "level_projectile_skill",
            List.of(),
            List.of(
                new ModifierTier("of the Archer", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of the Fletcher", 41, 250, new Pair<>(2, 2)),
                new ModifierTier("of the Sharpshooter", 75, 100, new Pair<>(3, 3))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Projectile Skills"
        );

        LIFE_REGENERATION_PER_SECOND = new Modifier(
            "life_regeneration_per_second",
            List.of("life"),
            List.of(
                new ModifierTier("of the Newt", 1, 1000, new Pair<>(1.0, 2.0)),
                new ModifierTier("of the Lizard", 5, 1000, new Pair<>(2.1, 3.0)),
                new ModifierTier("of the Flatworm", 11, 1000, new Pair<>(3.1, 4.0)),
                new ModifierTier("of the Starfish", 17, 1000, new Pair<>(4.1, 6.0)),
                new ModifierTier("of the Hydra", 26, 1000, new Pair<>(6.1, 9.0)),
                new ModifierTier("of the Troll", 35, 1000, new Pair<>(9.1, 13.0)),
                new ModifierTier("of Convalescence", 47, 1000, new Pair<>(13.1, 18.0)),
                new ModifierTier("of Recuperation", 58, 1000, new Pair<>(18.1, 23.0)),
                new ModifierTier("of Resurgence", 68, 1000, new Pair<>(23.1, 29.0)),
                new ModifierTier("of Immortality", 75, 1000, new Pair<>(29.1, 33.0))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "LifeRegeneration",
            "(#) Life Regeneration per second"
        );

        INCREASED_CRITICAL_HIT_CHANCE = new Modifier(
            "increased_critical_hit_chance",
            List.of("critical"),
            List.of(
                new ModifierTier("of Menace", 5, 1000, new Pair<>(10, 14)),
                new ModifierTier("of Havoc", 20, 1000, new Pair<>(15, 19)),
                new ModifierTier("of Disaster", 30, 1000, new Pair<>(20, 24)),
                new ModifierTier("of Calamity", 44, 500, new Pair<>(25, 29)),
                new ModifierTier("of Ruin", 58, 250, new Pair<>(30, 34)),
                new ModifierTier("of Unmaking", 72, 125, new Pair<>(35, 38))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "CriticalStrikeChanceIncrease",
            "(#)% increased Critical Hit Chance"
        );

        INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS = new Modifier(
            "critical_damage_bonus_for_attacks",
            List.of("damage", "attack", "critical"),
            List.of(
                new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 14)),
                new ModifierTier("of Anger", 21, 1000, new Pair<>(15, 19)),
                new ModifierTier("of Rage", 31, 1000, new Pair<>(20, 24)),
                new ModifierTier("of Fury", 45, 500, new Pair<>(25, 29)),
                new ModifierTier("of Ferocity", 59, 250, new Pair<>(30, 34)),
                new ModifierTier("of Destruction", 74, 125, new Pair<>(35, 39))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "CriticalStrikeMultiplier",
            "#% increased Critical Damage Bonus for Attack Damage"
        );

        MANA_REGENERATION_RATE = new Modifier(
            "mana_regeneration_rate",
            List.of("mana"),
            List.of(
                new ModifierTier("of Excitement", 1, 1000, new Pair<>(10, 19)),
                new ModifierTier("of Joy", 18, 1000, new Pair<>(20, 29)),
                new ModifierTier("of Elation", 29, 1000, new Pair<>(30, 39)),
                new ModifierTier("of Bliss", 42, 1000, new Pair<>(40, 49)),
                new ModifierTier("of Euphoria", 55, 1000, new Pair<>(50, 59)),
                new ModifierTier("of Nirvana", 79, 1000, new Pair<>(60, 69))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "ManaRegeneration",
            "#% increased Mana Regeneration Rate"
        );

        INCREASED_CAST_SPEED = new Modifier(
            "increased_cast_speed",
            List.of("caster", "speed"),
            List.of(
                new ModifierTier("of Talent", 1, 800, new Pair<>(9, 12)),
                new ModifierTier("of Nimbleness", 15, 800, new Pair<>(13, 16)),
                new ModifierTier("of Expertise", 30, 800, new Pair<>(17, 20)),
                new ModifierTier("of Sortilege", 45, 800, new Pair<>(21, 24)),
                new ModifierTier("of Legerdemain", 60, 800, new Pair<>(25, 28))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreasedCastSpeed",
            "#% increased Cast Speed"
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

        DAMAGE_TAKEN_RECOUPED_AS_LIFE = new Modifier(
            "damage_taken_recouped_as_life",
            List.of("life"),
            List.of(
                new ModifierTier("of Mending", 30, 500, new Pair<>(10, 12)),
                new ModifierTier("of Bandaging", 44, 500, new Pair<>(13, 15)),
                new ModifierTier("of Stitching", 56, 500, new Pair<>(16, 18)),
                new ModifierTier("of Suturing", 68, 500, new Pair<>(19, 21)),
                new ModifierTier("of Fleshbinding", 79, 500, new Pair<>(22, 24))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "DamageTakenGainedAsLife",
            "#% of Damage taken Recouped as Life"
        );

        DAMAGE_TAKEN_RECOUPED_AS_MANA = new Modifier(
            "damage_taken_recouped_as_mana",
            List.of("life", "mana"),
            List.of(
                new ModifierTier("of Reprieve", 31, 500, new Pair<>(10, 12)),
                new ModifierTier("of Solace", 45, 500, new Pair<>(13, 15)),
                new ModifierTier("of Tranquility", 57, 500, new Pair<>(16, 18)),
                new ModifierTier("of Serenity", 69, 500, new Pair<>(19, 21)),
                new ModifierTier("of Zen", 80, 500, new Pair<>(22, 24))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "PercentDamageGoesToMana",
            "#% of Damage taken Recouped as Mana"
        );

    }
}