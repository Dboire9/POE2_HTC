package Item_modifiers.TwoHand_Item_modifiers.Quarterstaves_Items_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_FIRE_PENETRATION;
    public static final Modifier DESECRATED_FIRE_DAMAGE_IGNITE_MAGNITUDE;
    public static final Modifier DESECRATED_COLD_PENETRATION;
    public static final Modifier DESECRATED_COLD_DAMAGE_FREEZE_BUILDUP;
    public static final Modifier DESECRATED_LIGHTNING_PENETRATION;
    public static final Modifier DESECRATED_LIGHTNING_DAMAGE_SHOCK_MAGNITUDE;
    
    //SUFFIXES

    public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_ADDITIONAL_COMBO_CHANCE;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
    public static final Modifier DESECRATED_RECOVER_MANA_ON_EXPENDING_COMBO;
    public static final Modifier DESECRATED_RECOVER_LIFE_ON_EXPENDING_COMBO;
    public static final Modifier DESECRATED_MANA_TO_LIFE_COST;

    static {

//PREFIXES

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

        DESECRATED_FIRE_DAMAGE_IGNITE_MAGNITUDE = new Modifier(
            "fire_damage", "ignite_magnitude",
            List.of("amanamu_mod", "elemental", "fire", "ailment"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(86, 99), new Pair<>(14, 23), "fire_damage", "ignite_magnitude")
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "FireDamagePercentagePrefix",
            "% increased Fire Damage\n(14–23)% increased Ignite Magnitude"
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

        DESECRATED_COLD_DAMAGE_FREEZE_BUILDUP = new Modifier(
            "cold_damage", "freeze_buildup",
            List.of("kurgal_mod", "elemental", "cold", "ailment"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(86, 99), new Pair<>(14, 23), "cold_damage", "freeze_buildup")
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ColdDamagePercentagePrefix",
            "% increased Cold Damage\n(14–23)% increased Freeze Buildup"
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

        DESECRATED_LIGHTNING_DAMAGE_SHOCK_MAGNITUDE = new Modifier(
            "lightning_damage", "shock_magnitude",
            List.of("ulaman_mod", "elemental", "lightning", "ailment"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(86, 99), new Pair<>(14, 23), "lightning_damage", "shock_magnitude")
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "LightningDamagePercentagePrefix",
            "% increased Lightning Damage\n(14–23)% increased Magnitude of Shock you inflict"
        );


        //SUFFIXES


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

        DESECRATED_ADDITIONAL_COMBO_CHANCE = new Modifier(
            "additional_combo_chance",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 40))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "AdditionalComboChance",
            "#% chance to build an additional Combo on Hit"
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

        DESECRATED_RECOVER_MANA_ON_EXPENDING_COMBO = new Modifier(
            "recover_mana_on_expending_combo",
            List.of("kurgal_mod", "mana", "recover"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(4, 6))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "RecoverManaOnExpendingCombo",
            "Recover #% of Maximum Mana when you expend at least 10 Combo"
        );
        
        DESECRATED_RECOVER_LIFE_ON_EXPENDING_COMBO = new Modifier(
            "recover_life_on_expending_combo",
            List.of("ulaman_mod", "life", "recover"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(6, 12))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "RecoverLifeOnExpendingCombo",
            "Recover #% of Maximum Life when you expend at least 10 Combo"
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
