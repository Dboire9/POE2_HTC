package main.java.core.Item_modifiers.Jewellery_Item_modifiers.Rings_Item_modifiers;

import main.java.core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

    //PREFIXES
    public static final Modifier DESECRATED_REMNANT_EFFECT;
    public static final Modifier DESECRATED_INCREASED_IGNITE_MAGNITUDE_IF_ENDURANCE;
    public static final Modifier DESECRATED_INCREASED_FREEZE_BUILDUP_IF_POWER;
    public static final Modifier DESECRATED_INCREASED_SHOCK_MAGNITUDE_IF_FRENZY;
    public static final Modifier DESECRATED_INCREASED_MINION_DAMAGE_IF_YOU_HIT_ENEMY;
    public static final Modifier DESECRATED_INCREASED_SPELL_DAMAGE_ON_FULL_ENERGY_SHIELD;
    public static final Modifier DESECRATED_ATTACK_DAMAGE_LOW_LIFE;

    // SUFFIXES
    public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
    public static final Modifier DESECRATED_SKILL_EFFECT_DURATION;
    public static final Modifier DESECRATED_REMNANT_PICKUP_RADIUS;
    public static final Modifier DESECRATED_LIFE_LEECH_AMOUNT;
    public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_COOLDOWN_RECOVERY;
    public static final Modifier DESECRATED_EXPOSURE_EFFECT;
    public static final Modifier DESECRATED_MANA_GAINED_ON_KILL_PERCENTAGE;
    public static final Modifier DESECRATED_MANA_LEECH_AMOUNT;
    public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_RECOVER_PERCENT_MAX_LIFE_ON_KILL;
    public static final Modifier DESECRATED_INCREASED_SKILL_SPEED;

;


    static{

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

        DESECRATED_INCREASED_IGNITE_MAGNITUDE_IF_ENDURANCE = new Modifier(
            "increased_ignite_magnitude_if_endurance",
            List.of("amanamu", "ailment"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ElementalAilmentEffect",
            "(#)% increased Magnitude of Ignite if you've consumed an Endurance Charge Recently"
        );

        DESECRATED_INCREASED_FREEZE_BUILDUP_IF_POWER = new Modifier(
            "increased_freeze_buildup_if_power",
            List.of("kurgal", "ailment"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ElementalAilmentEffect",
            "(#)% increased Freeze Buildup if you've consumed a Power Charge Recently"
        );

        DESECRATED_INCREASED_SHOCK_MAGNITUDE_IF_FRENZY = new Modifier(
            "increased_shock_magnitude_if_frenzy",
            List.of("ulaman", "ailment"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(20, 30))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ElementalAilmentEffect",
            "(#)% increased Magnitude of Shock if you've consumed a Frenzy Charge Recently"
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

        DESECRATED_LIFE_LEECH_AMOUNT = new Modifier(
            "life_leech_amount",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(12, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "LifeLeech",
            "(#)% increased amount of Life Leeched"
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

        DESECRATED_MANA_LEECH_AMOUNT = new Modifier(
            "mana_leech_amount",
            List.of("kurgal_mod", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(12, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "ManaLeechAmount",
            "(#)% increased amount of Mana Leeched"
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

    }
}
