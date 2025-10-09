package main.java.core.Item_modifiers.Off_Hand_Item_modifiers.Shields_Item_modifiers.Shields_Hybrid_Item_modifiers;

import main.java.core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

    // NO PREFIXES FOR THE GLOVES


    //SHARED SUFFIXES
    public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
    public static final Modifier DESECRATED_SHIELD_SKILLS_STUNNING_BREAKS_ARMOUR;
    public static final Modifier DESECRATED_HEAVY_STUN_DECAY_RATE;
    public static final Modifier DESECRATED_ALL_MAXIMUM_RESISTANCES;
    public static final Modifier DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE;
    public static final Modifier DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF;
    public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DAMAGE_RECOUPED_AS_MANA;
    public static final Modifier DESECRATED_GAIN_MANA_ON_BLOCK;
    public static final Modifier DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE;
    public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION;
    public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_PHYSICAL_DAMAGE_TAKEN_AS_LIGHTNING_WHILE_ACTIVE_BLOCKING;
    public static final Modifier DESECRATED_MAXIMUM_BLOCK_CHANCE;
    public static final Modifier DESECRATED_PARRIED_DEBUFF_DURATION;
    public static final Modifier DESECRATED_PARRIED_DEBUFF_MAGNITUDE;


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

        DESECRATED_SHIELD_SKILLS_STUNNING_BREAKS_ARMOUR = new Modifier(
            "shield_skills_stunning_breaks_armour",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(0, 0))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ShieldSkillsStunningAlsoFullyBreaksArmour",
            "Hits with Shield Skills which Heavy Stun enemies fully Break Armour"
        );

        DESECRATED_HEAVY_STUN_DECAY_RATE = new Modifier(
            "heavy_stun_decay_rate",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(30, 40))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "HeavyStunDecayRate",
            "Your Heavy Stun buildup empties (#–#)% faster"
        );

        DESECRATED_ALL_MAXIMUM_RESISTANCES = new Modifier(
            "all_maximum_resistances",
            List.of("amanamu_mod", "resistance"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(1, 1))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "MaximumResistances",
            "+#% to all Maximum Resistances"
        );

        DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE = new Modifier(
            "damage_taken_recouped_as_life",
            List.of("amanamu_mod", "life"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DamageTakenGainedAsLife",
            "(#)% of Damage taken Recouped as Life"
        );

        DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF = new Modifier(
            "reduced_curse_effect_on_self",
            List.of("amanamu_mod", "caster", "curse"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 35))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ReducedCurseEffect",
            "(#)% reduced effect of Curses on you"
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

        DESECRATED_DAMAGE_RECOUPED_AS_MANA = new Modifier(
            "damage_recouped_as_mana",
            List.of("kurgal_mod", "life", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "PercentDamageGoesToMana",
            "(#)% of Damage taken Recouped as Mana"
        );

        DESECRATED_GAIN_MANA_ON_BLOCK = new Modifier(
            "gain_mana_on_block",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(6, 12))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "GainManaOnBlock",
            "(#–#) Mana gained when you Block"
        );

        DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE = new Modifier(
            "armour_applies_to_chaos_damage",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(23, 31))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ArmourAppliesToChaosDamage",
            "+(#)% of Armour also applies to Chaos Damage"
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

        DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION = new Modifier(
            "critical_hit_chance_reduction",
            List.of("ulaman_mod", "critical"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(17, 25))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ChanceToTakeCriticalStrike",
            "Hits have (#)% reduced Critical Hit Chance against you"
        );

        DESECRATED_PHYSICAL_DAMAGE_TAKEN_AS_LIGHTNING_WHILE_ACTIVE_BLOCKING = new Modifier(
            "active_blocking_damage", "active_blocking_lightning_damage_taken",
            List.of("ulaman_mod", "physical", "elemental", "lightning"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(8, 15), new Pair<>(30, 40),"active_blocking_damage", "active_blocking_lightning_damage_taken"
                )
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "PhysicalDamageTakenAsLightningWhileActiveBlocking",
            "You take (#–#)% of damage from Blocked Hits while Active Blocking\n" +
            "(#–#)% of Physical Damage taken as Lightning while Active Blocking"
        );

        DESECRATED_MAXIMUM_BLOCK_CHANCE = new Modifier(
            "maximum_block_chance",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(1, 2))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "MaximumBlockChance",
            "+(#–#)% to maximum Block chance"
        );

        DESECRATED_PARRIED_DEBUFF_DURATION = new Modifier(
            "parried_debuff_duration",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(25, 35))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ParriedDebuffDuration",
            "(#–#)% increased Parried Debuff Duration"
        );

        DESECRATED_PARRIED_DEBUFF_MAGNITUDE = new Modifier(
            "parried_debuff_magnitude",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ParriedDebuffMagnitude",
            "(#–#)% increased Parried Debuff Magnitude"
        );
    }
}
