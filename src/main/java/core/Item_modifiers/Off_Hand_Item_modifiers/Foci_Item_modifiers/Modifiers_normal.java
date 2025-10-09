package core.Item_modifiers.Off_Hand_Item_modifiers.Foci_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

    //PREFIXES
    public static final Modifier MAXIMUM_MANA;
    public static final Modifier BASE_ENERGY_SHIELD;
    public static final Modifier INCREASED_PERCENT_ENERGY_SHIELD;
    public static final Modifier HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA;
    public static final Modifier INCREASED_SPELL_DAMAGE;
    public static final Modifier INCREASED_FIRE_DAMAGE;
    public static final Modifier INCREASED_COLD_DAMAGE;
    public static final Modifier INCREASED_LIGHTNING_DAMAGE;
    public static final Modifier INCREASED_CHAOS_DAMAGE;
    public static final Modifier INCREASED_SPELL_PHYSICAL_DAMAGE;

    
    
    //SUFFIXES
    public static final Modifier INTELLIGENCE;
    public static final Modifier FIRE_RESISTANCE;
    public static final Modifier COLD_RESISTANCE;
    public static final Modifier LIGHTNING_RESISTANCE;
    public static final Modifier CHAOS_RESISTANCE;
    public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
    public static final Modifier ALL_SPELL_SKILL_LEVEL;
    public static final Modifier MANA_REGENERATION_RATE;
    public static final Modifier INCREASED_CAST_SPEED;
    public static final Modifier INCREASED_CRITICAL_HIT_CHANCE_SPELLS;
    public static final Modifier CRITICAL_SPELL_DAMAGE_BONUS;
    public static final Modifier ENERGY_SHIELD_RECHARGE_RATE;
    public static final Modifier ENERGY_SHIELD_FASTER_START_RECHARGE;



    


    static {

// PREFIXES


        MAXIMUM_MANA = new Modifier(
            "maximum_mana",
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
                new ModifierTier("Mazarine", 65, 1000, new Pair<>(125, 149)),
                new ModifierTier("Blue", 70, 1000, new Pair<>(150, 164))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "IncreasedMana",
            "+# to maximum Mana"
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
                new ModifierTier("Blazing", 54, 1000, new Pair<>(48, 60)),
                new ModifierTier("Dazzling", 60, 1000, new Pair<>(61, 73)),
                new ModifierTier("Scintillating", 65, 1000, new Pair<>(74, 80)),
                new ModifierTier("Incandescent", 70, 1000, new Pair<>(81, 90))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefences",
            "+# to maximum Energy Shield"
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

        HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA = new Modifier(
            "increased_percent_energy_shield", "base_maximum_mana",
            List.of("defences", "mana"),
            List.of(
                new ModifierTier("Imbued", 8, 1000, new Pair<>(6, 13), new Pair<>(6, 8), "increased_percent_energy_shield", "base_maximum_mana"),
                new ModifierTier("Serene", 16, 1000, new Pair<>(14, 20), new Pair<>(9, 16), "increased_percent_energy_shield", "base_maximum_mana"),
                new ModifierTier("Sacred", 33, 1000, new Pair<>(21, 26), new Pair<>(17, 20), "increased_percent_energy_shield", "base_maximum_mana"),
                new ModifierTier("Celestial", 46, 1000, new Pair<>(27, 32), new Pair<>(21, 26), "increased_percent_energy_shield", "base_maximum_mana"),
                new ModifierTier("Heavenly", 60, 1000, new Pair<>(33, 38), new Pair<>(27, 32), "increased_percent_energy_shield", "base_maximum_mana"),
                new ModifierTier("Angel's", 78, 1000, new Pair<>(39, 42), new Pair<>(33, 39), "increased_percent_energy_shield", "base_maximum_mana")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.NORMAL,
            "BaseLocalDefencesAndMana",
            "(#)% increased Energy Shield\n+# to maximum Mana"
        );

        INCREASED_SPELL_DAMAGE = new Modifier(
            "increased_spell_damage",
            List.of("damage", "caster"),
            List.of(
                new ModifierTier("Apprentice's", 1, 1000, new Pair<>(25, 34)),
                new ModifierTier("Adept's", 8, 1000, new Pair<>(35, 44)),
                new ModifierTier("Scholar's", 16, 1000, new Pair<>(45, 54)),
                new ModifierTier("Professor's", 33, 600, new Pair<>(55, 64)),
                new ModifierTier("Occultist's", 46, 400, new Pair<>(65, 74)),
                new ModifierTier("Incanter's", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Glyphic", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Runic", 80, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponCasterDamagePrefix",
            "+#% Increased Spell Damage"
        );

        INCREASED_FIRE_DAMAGE = new Modifier(
            "increased_fire_damage",
            List.of("damage", "elemental", "fire"),
            List.of(
                new ModifierTier("Searing", 2, 500, new Pair<>(25, 34)),
                new ModifierTier("Sizzling", 8, 500, new Pair<>(35, 44)),
                new ModifierTier("Blistering", 16, 500, new Pair<>(45, 54)),
                new ModifierTier("Cauterising", 33, 400, new Pair<>(55, 64)),
                new ModifierTier("Smoldering", 46, 300, new Pair<>(65, 74)),
                new ModifierTier("Magmatic", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Volcanic", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Pyromancer's", 81, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponDamageTypePrefix",
            "+#% Increased Fire Damage"
        );

        INCREASED_COLD_DAMAGE = new Modifier(
            "increased_cold_damage",
            List.of("damage", "elemental", "cold"),
            List.of(
                new ModifierTier("Bitter", 2, 500, new Pair<>(25, 34)),
                new ModifierTier("Biting", 8, 500, new Pair<>(35, 44)),
                new ModifierTier("Alpine", 16, 500, new Pair<>(45, 54)),
                new ModifierTier("Snowy", 33, 400, new Pair<>(55, 64)),
                new ModifierTier("Hailing", 46, 300, new Pair<>(65, 74)),
                new ModifierTier("Arctic", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Crystalline", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Cryomancer's", 81, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponDamageTypePrefix",
            "+#% Increased Cold Damage"
        );

        INCREASED_LIGHTNING_DAMAGE = new Modifier(
            "increased_lightning_damage",
            List.of("damage", "elemental", "lightning"),
            List.of(
                new ModifierTier("Charged", 2, 500, new Pair<>(25, 34)),
                new ModifierTier("Hissing", 8, 500, new Pair<>(35, 44)),
                new ModifierTier("Bolting", 16, 500, new Pair<>(45, 54)),
                new ModifierTier("Coursing", 33, 400, new Pair<>(55, 64)),
                new ModifierTier("Striking", 46, 300, new Pair<>(65, 74)),
                new ModifierTier("Smiting", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Ionising", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Electromancer's", 81, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponDamageTypePrefix",
            "+#% Increased Lightning Damage"
        );

        INCREASED_CHAOS_DAMAGE = new Modifier(
            "increased_chaos_damage",
            List.of("damage", "chaos"),
            List.of(
                new ModifierTier("Impure", 2, 500, new Pair<>(25, 34)),
                new ModifierTier("Tainted", 8, 500, new Pair<>(35, 44)),
                new ModifierTier("Clouded", 16, 500, new Pair<>(45, 54)),
                new ModifierTier("Darkened", 33, 400, new Pair<>(55, 64)),
                new ModifierTier("Malignant", 46, 300, new Pair<>(65, 74)),
                new ModifierTier("Vile", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Twisted", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Malevolent", 81, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponDamageTypePrefix",
            "+#% Increased Chaos Damage"
        );

        INCREASED_SPELL_PHYSICAL_DAMAGE = new Modifier(
            "increased_spell_physical_damage",
            List.of("damage", "physical"),
            List.of(
                new ModifierTier("Punishing", 2, 500, new Pair<>(25, 34)),
                new ModifierTier("Unforgiving", 8, 500, new Pair<>(35, 44)),
                new ModifierTier("Vengeful", 16, 500, new Pair<>(45, 54)),
                new ModifierTier("Sadistic", 33, 400, new Pair<>(55, 64)),
                new ModifierTier("Pitiless", 46, 300, new Pair<>(65, 74)),
                new ModifierTier("Agonising", 60, 200, new Pair<>(75, 89)),
                new ModifierTier("Oppressor's", 70, 100, new Pair<>(90, 104)),
                new ModifierTier("Torturer's", 81, 50, new Pair<>(105, 119))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponDamageTypePrefix",
            "+#% Increased Spell Physical Damage"
        );

//SUFFIXES

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
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
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
            "reduced_attributes_requirements",
            List.of(""),
            List.of(
                new ModifierTier("of the Worthy", 24, 1000, new Pair<>(15, 15)),
                new ModifierTier("of the Apt", 32, 1000, new Pair<>(20, 20)),
                new ModifierTier("of the Talented", 40, 1000, new Pair<>(25, 25)),
                new ModifierTier("of the Skilled", 52, 1000, new Pair<>(30, 30)),
                new ModifierTier("of the Proficient", 60, 1000, new Pair<>(35, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "LocalAttributeRequirements",
            "#% reduced Attribute Requirements"
        );

        ALL_SPELL_SKILL_LEVEL = new Modifier(
            "all_spell_skill_level",
            List.of("caster", "gem"),
            List.of(
                new ModifierTier("of the Mage", 5, 500, new Pair<>(1, 1)),
                new ModifierTier("of the Enchanter", 41, 250, new Pair<>(2, 2))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Spell Skills"
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
                new ModifierTier("of Talent", 1, 1000, new Pair<>(9, 12)),
                new ModifierTier("of Nimbleness", 15, 1000, new Pair<>(13, 16)),
                new ModifierTier("of Expertise", 30, 1000, new Pair<>(17, 20)),
                new ModifierTier("of Sortilege", 45, 1000, new Pair<>(21, 24)),
                new ModifierTier("of Legerdemain", 60, 1000, new Pair<>(25, 28)),
                new ModifierTier("of Prestidigitation", 70, 500, new Pair<>(29, 32))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreasedCastSpeed",
            "#% increased Cast Speed"
        );

        INCREASED_CRITICAL_HIT_CHANCE_SPELLS = new Modifier(
            "increased_critical_hit_chance_spells",
            List.of("caster", "critical"),
            List.of(
                new ModifierTier("of Menace", 11, 1000, new Pair<>(27, 33)),
                new ModifierTier("of Havoc", 21, 1000, new Pair<>(34, 39)),
                new ModifierTier("of Disaster", 28, 1000, new Pair<>(40, 46)),
                new ModifierTier("of Calamity", 41, 500, new Pair<>(47, 53)),
                new ModifierTier("of Ruin", 59, 250, new Pair<>(54, 59))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "SpellCriticalStrikeChanceIncrease",
            "#% increased Critical Hit Chance for Spells"
        );

        CRITICAL_SPELL_DAMAGE_BONUS = new Modifier(
            "critical_spell_damage_bonus",
            List.of("caster", "critical"),
            List.of(
                new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 14)),
                new ModifierTier("of Anger", 21, 1000, new Pair<>(15, 19)),
                new ModifierTier("of Rage", 30, 1000, new Pair<>(20, 24)),
                new ModifierTier("of Fury", 44, 500, new Pair<>(25, 29)),
                new ModifierTier("of Ferocity", 59, 250, new Pair<>(30, 34))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "CriticalStrikeMultiplier",
            "#% increased Critical Spell Damage Bonus"
        );

        ENERGY_SHIELD_RECHARGE_RATE = new Modifier(
            "energy_shield_recharge_rate",
            List.of("defences"),
            List.of(
                new ModifierTier("of Enlivening", 1, 1000, new Pair<>(26, 30)),
                new ModifierTier("of Diffusion", 16, 1000, new Pair<>(31, 35)),
                new ModifierTier("of Dispersal", 36, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Buffering", 48, 1000, new Pair<>(41, 45)),
                new ModifierTier("of Ardour", 66, 1000, new Pair<>(46, 50)),
                new ModifierTier("of Suffusion", 81, 1000, new Pair<>(51, 55))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "EnergyShieldRegeneration",
            "(#)% increased Energy Shield Recharge Rate"
        );

        ENERGY_SHIELD_FASTER_START_RECHARGE = new Modifier(
            "energy_shield_faster_start_recharge",
            List.of("defences"),
            List.of(
                new ModifierTier("of Impatience", 1, 1000, new Pair<>(26, 30)),
                new ModifierTier("of Restlessness", 16, 1000, new Pair<>(31, 35)),
                new ModifierTier("of Fretfulness", 36, 1000, new Pair<>(36, 40)),
                new ModifierTier("of Motivation", 48, 1000, new Pair<>(41, 45)),
                new ModifierTier("of Excitement", 66, 1000, new Pair<>(46, 50)),
                new ModifierTier("of Anticipation", 81, 1000, new Pair<>(51, 55))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.NORMAL,
            "EnergyShieldDelay",
            "(#)% faster start of Energy Shield Recharge"
        );
    }
}