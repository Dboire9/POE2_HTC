package core.Item_modifiers.Body_Armours_Item_modifiers.Body_Armours_Normal_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

    // NO PREFIXES FOR THE GLOVES


    //SHARED SUFFIXES
    public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
    public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF;
    public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
    public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
    public static final Modifier DESECRATED_DAMAGE_RECOUPED_AS_MANA;
    public static final Modifier DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION;

    //DEX SUFFIXES
    public static final Modifier DESECRATED_COMPANION_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_PREVENT_DEFLECT_DAMAGE_TAKEN;

    //INT SUFFIXES
    public static final Modifier DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE;

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

        DESECRATED_SPIRIT_RESERVATION_EFFICIENCY = new Modifier(
            "spirit_reservation_efficiency",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(6, 12))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "SpiritReservationEfficiency",
            "(#)% increased Spirit Reservation Efficiency of Skills"
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

//DEX SUFFIXES

        DESECRATED_COMPANION_RESERVATION_EFFICIENCY = new Modifier(
            "companion_reservation_efficiency",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(12, 18))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "CompanionReservationEfficiency",
            "(#)% increased Reservation Efficiency of Companion Skills"
        );

        DESECRATED_PREVENT_DEFLECT_DAMAGE_TAKEN = new Modifier(
            "deflect_damage_taken",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(3, 5))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DeflectDamageTaken",
            "Prevent +(#)% of Damage from Deflected Hits"
        );

//INT SUFFIXES

        DESECRATED_DAMAGE_REMOVED_FROM_MANA_BEFORE_LIFE = new Modifier(
            "damage_removed_from_mana_before_life",
            List.of("kurgal_mod", "life", "mana"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(10, 20))
            ),
            Modifier.ModifierType.SUFFIX,
            Modifier.ModifierSource.DESECRATED,
            "DamageRemovedFromManaBeforeLife",
            "(#)% of Damage is taken from Mana before Life"
        );



    }
}
