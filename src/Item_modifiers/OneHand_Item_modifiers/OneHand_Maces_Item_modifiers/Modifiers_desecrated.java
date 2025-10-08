package Item_modifiers.OneHand_Item_modifiers.OneHand_Maces_Item_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_DAMAGE_VS_FULLY_BROKEN_ARMOUR;
    public static final Modifier DESECRATED_FIRE_PENETRATION;
    public static final Modifier DESECRATED_COLD_PENETRATION;
    public static final Modifier DESECRATED_EMPOWERED_INCREASED_DAMAGE;
    public static final Modifier DESECRATED_INCREASED_PHYSICAL_DAMAGE_REDUCED_ATTACK_SPEED;
    public static final Modifier DESECRATED_INCREASED_DAMAGE_WHILE_TOTEM;
    public static final Modifier DESECRATED_ADDITIONAL_TOTEMS;
    public static final Modifier DESECRATED_LIGHTNING_PENETRATION;
    
    //SUFFIXES
    public static final Modifier DESECRATED_FISSURE_CHANCE;
    public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
    public static final Modifier DESECRATED_AFTERSHOCK_CHANCE;
    public static final Modifier DESECRATED_ARMOUR_BREAK_PHYSICAL_DAMAGE_DEALT;
    public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
    public static final Modifier DESECRATED_WARCRY_COOLDOWN_SPEED;
    public static final Modifier DESECRATED_TOTEM_PLACEMENT_SPEED;
    public static final Modifier DESECRATED_MANA_TO_LIFE_COST;
    
    


    



    static{

//PREFIXES

        DESECRATED_DAMAGE_VS_FULLY_BROKEN_ARMOUR = new Modifier(
            "damage_vs_fully_broken_armour",
            List.of("damage", "amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(41, 59))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "DamagevsArmourBrokenEnemies",
            "% increased Damage against Enemies with Fully Broken Armour"
        );

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

        DESECRATED_EMPOWERED_INCREASED_DAMAGE = new Modifier(
            "empowered_increased_damage",
            List.of("kurgal_mod", "damage", "attack"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(41, 59))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "ExertedAttackDamage",
            "Empowered Attacks deal #% increased Damage"
        );

        DESECRATED_INCREASED_PHYSICAL_DAMAGE_REDUCED_ATTACK_SPEED = new Modifier(
            "local_physical_damage_percent",
            List.of("kurgal_mod", "physical", "attack", "speed"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(110, 154), new Pair<>(-15, -15), "physical_damage", "reduced_attack_speed")
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "LocalPhysicalDamagePercent",
            "#% increased Physical Damage, #% reduced Attack Speed"
        );

        DESECRATED_INCREASED_DAMAGE_WHILE_TOTEM = new Modifier(
            "increased_damage_while_totem",
            List.of("ulaman_mod", "damage"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(41, 59))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "TotemDamage",
            "% increased Damage while you have a Totem"
        );

        DESECRATED_ADDITIONAL_TOTEMS = new Modifier(
            "additional_totems",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(1, 1))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "AdditionalTotems",
            "Melee Attack Skills have +1 to maximum number of Summoned Totems"
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


//SUFFIXES


        DESECRATED_FISSURE_CHANCE = new Modifier(
            "fissure_chance",
            List.of("amanamu_mod", "attack"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(15, 25))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "FissureChance",
            "Fissure Skills have (#–#)% chance to create an additional Fissure"
        );

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

        DESECRATED_AFTERSHOCK_CHANCE = new Modifier(
            "aftershock_chance",
            List.of("amanamu_mod", "attack"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 16))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "AftershockChance",
            "Mace Slam Skills you use yourself have +#% chance to cause Aftershocks"
        );

        DESECRATED_ARMOUR_BREAK_PHYSICAL_DAMAGE_DEALT = new Modifier(
            "armour_break_physical_damage_dealt",
            List.of("amanamu_mod", "damage", "physical"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(2, 4))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "ArmourPenetration",
            "Break Armour equal to #% of Physical Damage dealt"
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

        DESECRATED_WARCRY_COOLDOWN_SPEED = new Modifier(
            "warcry_cooldown_speed",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(17, 25))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "WarcryCooldownSpeed",
            "#% increased Warcry Cooldown Recovery Rate"
        );

        DESECRATED_TOTEM_PLACEMENT_SPEED = new Modifier(
            "totem_placement_speed",
            List.of("ulaman_mod", "speed"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(17, 25))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "SummonTotemCastSpeed",
            "#% increased Totem Placement Speed"
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
