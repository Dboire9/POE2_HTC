package core.Item_modifiers.Jewellery_Item_modifiers.Amulets_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_GLOBAL_DEFENCES;
    public static final Modifier DESECRATED_REMNANT_EFFECT;
    public static final Modifier DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY;
    public static final Modifier DESECRATED_BODY_ARMOUR_FROM_BODY_ARMOUR;
    public static final Modifier DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD;
    public static final Modifier DESECRATED_INVOCATED_SPELL_HALF_ENERGY_CHANCE;
    public static final Modifier DESECRATED_MAXIMUM_ENERGY_SHIELD_FROM_BODY_ARMOUR;
    public static final Modifier DESECRATED_GLORY_CHANCE_TO_NOT_CONSUME;
    public static final Modifier DESECRATED_EVASION_RATING_FROM_BODY_ARMOUR;
    public static final Modifier DESECRATED_ATTACK_DAMAGE_LOW_LIFE;
    public static final Modifier DESECRATED_INCREASED_DEFLECTION_RATING;
    
    // SUFFIXES
    public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
    public static final Modifier DESECRATED_SKILL_EFFECT_DURATION;
    public static final Modifier DESECRATED_REMNANT_PICKUP_RADIUS;
    public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_AURA_MAGNITUDES;
    public static final Modifier DESECRATED_GLOBAL_ITEM_ATTRIBUTE_REQUIREMENTS;
    public static final Modifier DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE;
    public static final Modifier DESECRATED_EXPOSURE_EFFECT;
    public static final Modifier DESECRATED_COOLDOWN_RECOVERY;
    public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_GLOBAL_SKILL_GEM_QUALITY;
    public static final Modifier DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE;
    public static final Modifier DESECRATED_MINION_COOLDOWN;
    public static final Modifier DESECRATED_INCREASED_SKILL_SPEED;
    public static final Modifier DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL;
    public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_HERALD_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_LEVEL_ALL_SKILLS;


    static{

        DESECRATED_GLOBAL_DEFENCES = new Modifier(
            "global_defences",
            List.of("amanamu_mod", "defences"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(15, 25))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "AllDefences",
            "(#)% increased Global Defences"
        );

        
        DESECRATED_REMNANT_EFFECT = new Modifier(
            "remnant_effect",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(8, 15))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "RemnantEffect",
            "Remnants have (#)% increased effect"
        );

        DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY = new Modifier(
            "increased_minion_damage_if_you_hit_enemy",
            List.of("amanamu_mod", "damage", "minion"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(15, 25))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "IncreasedMinionDamageIfYouHitEnemy",
            "Minions deal (#)% increased Damage if you've Hit Recently"
        );

        DESECRATED_BODY_ARMOUR_FROM_BODY_ARMOUR = new Modifier(
            "body_armour_from_body_armour",
            List.of("amanamu_mod", "defences"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(35, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "BodyArmourFromBodyArmour",
            "(#)% increased Armour from Equipped Body Armour"
        );

        DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD = new Modifier(
            "increased_spell_damage_on_full_energy_shield",
            List.of("kurgal_mod", "damage", "caster"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(15, 25))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "IncreasedSpellDamageOnFullEnergyShield",
            "(#)% increased Spell Damage while on Full Energy Shield"
        );

        DESECRATED_INVOCATED_SPELL_HALF_ENERGY_CHANCE = new Modifier(
            "invocated_spell_half_energy_chance",
            List.of("kurgal_mod", "caster"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "InvocatedSpellHalfEnergyChance",
            "Invocated Spells have (#)% chance to consume half as much Energy"
        );

        DESECRATED_MAXIMUM_ENERGY_SHIELD_FROM_BODY_ARMOUR = new Modifier(
            "maximum_energy_shield_from_body_armour",
            List.of("kurgal_mod", "defences"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(35, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "MaximumEnergyShieldFromBodyArmour",
            "(#)% increased Energy Shield from Equipped Body Armour"
        );

        DESECRATED_GLORY_CHANCE_TO_NOT_CONSUME = new Modifier(
            "glory_chance_to_not_consume",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(10, 15))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "GloryChanceToNotConsume",
            "Skills have a (#)% chance to not consume Glory"
        );

        DESECRATED_EVASION_RATING_FROM_BODY_ARMOUR = new Modifier(
            "evasion_rating_from_body_armour",
            List.of("ulaman_mod", "defences"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(35, 50))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "EvasionRatingFromBodyArmour",
            "(#)% increased Evasion Rating from Equipped Body Armour"
        );

        DESECRATED_ATTACK_DAMAGE_LOW_LIFE = new Modifier(
            "attack_damage_low_life",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(15, 25))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "AttackDamage",
            "(#)% increased Attack Damage while on Low Life"
        );

        DESECRATED_INCREASED_DEFLECTION_RATING = new Modifier(
            "increased_deflection_rating",
            List.of("ulaman_mod", "defences"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "GlobalDeflectionRating",
            "(#)% increased Deflection Rating"
        );


//SUFFIXES

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

        DESECRATED_SKILL_EFFECT_DURATION = new Modifier(
            "skill_effect_duration",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(8, 12))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "SkillEffectDuration",
            "(#)% increased Skill Effect Duration"
        );

        DESECRATED_REMNANT_PICKUP_RADIUS = new Modifier(
            "remnant_pickup_radius",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(15, 25))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "RemnantPickupRadius",
            "Remnants can be collected from (#)% further away"
        );

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

        DESECRATED_AURA_MAGNITUDES = new Modifier(
            "aura_magnitudes",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(8, 16))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "AuraEffect",
            "Aura Skills have (#)% increased Magnitudes"
        );

        DESECRATED_GLOBAL_ITEM_ATTRIBUTE_REQUIREMENTS = new Modifier(
            "global_item_attribute_requirements",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 15))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "GlobalItemAttributeRequirements",
            "Equipment and Skill Gems have (#)% reduced Attribute Requirements"
        );

        DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE = new Modifier(
            "mana_gained_on_kill_percentage",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(2, 3))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ManaGainedOnKillPercentage",
            "Recover (#)% of maximum Mana on Kill"
        );

        DESECRATED_EXPOSURE_EFFECT = new Modifier(
            "exposure_effect",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(10, 15))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ExposureEffect",
            "(#)% increased Exposure Effect"
        );

        DESECRATED_COOLDOWN_RECOVERY = new Modifier(
            "cooldown_recovery",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(8, 12))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "CooldownRecovery",
            "(#)% increased Cooldown Recovery Rate"
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

        DESECRATED_GLOBAL_SKILL_GEM_QUALITY = new Modifier(
            "global_skill_gem_quality",
            List.of("kurgal_mod", "gem"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(3, 5))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "GlobalSkillGemQuality",
            "+(#)% to Quality of all Skills"
        );

        DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE = new Modifier(
            "damage_removed_from_mana_before_life",
            List.of("kurgal_mod", "life", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(8, 16))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DamageRemovedFromManaBeforeLife",
            "(#)% of Damage is taken from Mana before Life"
        );

        DESECRATED_MINION_COOLDOWN = new Modifier(
            "minion_cooldown",
            List.of("kurgal_mod", "minion"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(12, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "MinionCooldown",
            "Minions have (#)% increased Cooldown Recovery Rate"
        );

        DESECRATED_INCREASED_SKILL_SPEED = new Modifier(
            "increased_skill_speed",
            List.of("ulaman_mod", "speed"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(3, 6))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "IncreasedSpeed",
            "(#)% increased Skill Speed"
        );

        DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL = new Modifier(
            "recover_percent_max_life_on_kill",
            List.of("ulaman_mod", "life"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(2, 3))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "RecoverPercentMaxLifeOnKill",
            "Recover (#)% of maximum Life on Kill"
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

        DESECRATED_HERALD_RESERVATION_EFFICIENCY = new Modifier(
            "herald_reservation_efficiency",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "HeraldReservationEfficiency",
            "(#)% increased Reservation Efficiency of Herald Skills"
        );

        DESECRATED_LEVEL_ALL_SKILLS = new Modifier(
            "level_all_skills",
            List.of("ulaman_mod", "gem"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(1, 1))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Skills"
        );

    }
}
