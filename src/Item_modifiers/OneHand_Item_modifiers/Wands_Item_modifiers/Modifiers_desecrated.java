package Item_modifiers.OneHand_Item_modifiers.Wands_Item_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_COMPANION_SPELL_DAMAGE;
    public static final Modifier DESECRATED_INCREASED_ELEMENTAL_DAMAGE;
    public static final Modifier DESECRATED_INCREASED_SPELL_DAMAGE_LIFE_COST;
    public static final Modifier DESECRATED_INCREASED_MAGNITUDE_BLEEDING;
    public static final Modifier DESECRATED_DAMAGE_AS_EXTRA_PHYSICAL_DAMAGE;

    
    //SUFFIXES
    public static final Modifier DESECRATED_HINDERED_ENEMY_INCREASED_ELEMENTAL_DAMAGE;
    public static final Modifier DESECRATED_HINDERED_ENEMY_INCREASED_CHAOS_DAMAGE;
    public static final Modifier DESECRATED_HINDERED_ENEMY_INCREASED_PHYSICAL_DAMAGE;
    public static final Modifier DESECRATED_SPELL_AREA_OF_EFFECT;
    public static final Modifier DESECRATED_SPELL_LIFE_COST_AND_EFFICIENCY;
    public static final Modifier DESECRATED_HYBRID_INCREASED_CAST_SPEED_FULL_MANA_AND_DIFFERENT_SPELLS;
    public static final Modifier DESECRATED_BREAK_INCREASED_ARMOUR;
    public static final Modifier DESECRATED_BREAK_ARMOUR_ON_CRIT;

    



    static{

        DESECRATED_COMPANION_SPELL_DAMAGE = new Modifier(
            "spell_damage",
            List.of("amanamu_mod", "caster", "minion"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(55, 64), new Pair<>(55, 64), "increased_spell_damage", "minion_increased_damage")
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "MinionDamage",
            "#% increased Spell Damage\nMinions deal #% increased Damage"
        );

        DESECRATED_INCREASED_ELEMENTAL_DAMAGE = new Modifier(
            "increased_elemental_damage",
            List.of("amanamu_mod", "damage", "elemental"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(74, 89))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "WeaponDamageTypePrefix",
            "#% increased Elemental Damage"
        );

        DESECRATED_INCREASED_SPELL_DAMAGE_LIFE_COST = new Modifier(
            "increased_spell_damage_life_cost",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(74, 89))
            ),
            Modifier.ModifierType.PREFIX,
            Modifier.ModifierSource.DESECRATED,
            "WeaponCasterDamagePrefix",
            "#% increased Spell Damage with Spells that cost Life"
        );

        DESECRATED_INCREASED_MAGNITUDE_BLEEDING = new Modifier(
            "increased_magnitude_bleeding",
            List.of("ulaman_mod", "damage", "physical", "attack", "ailment"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(27, 38))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "BleedingDamage",
            "#% increased Magnitude of Bleeding you inflict"
        );

        DESECRATED_DAMAGE_AS_EXTRA_PHYSICAL_DAMAGE = new Modifier(
            "damage_as_extra_physical_damage",
            List.of("ulaman_mod", "damage", "physical"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(21, 25))
            ),
            ModifierType.PREFIX,
            ModifierSource.DESECRATED,
            "MartialWeaponGainedDamage",
            "Gain #% of Damage as Extra Physical Damage"
        );


// SUFFIXES

        DESECRATED_HINDERED_ENEMY_INCREASED_ELEMENTAL_DAMAGE = new Modifier(
            "hindered_enemy_increased_elemental_damage",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(4, 7))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "HinderedEnemyTakeIncreasedDamage",
            "Enemies Hindered by you take #% increased Elemental Damage"
        );

        DESECRATED_HINDERED_ENEMY_INCREASED_CHAOS_DAMAGE = new Modifier(
            "hindered_enemy_increased_chaos_damage",
            List.of("kurgal_mod"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(4, 7))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "HinderedEnemyTakeIncreasedDamage",
            "Enemies Hindered by you take #% increased Chaos Damage"
        );

        DESECRATED_HINDERED_ENEMY_INCREASED_PHYSICAL_DAMAGE = new Modifier(
            "hindered_enemy_increased_physical_damage",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(4, 7))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "HinderedEnemyTakeIncreasedDamage",
            "Enemies Hindered by you take #% increased Physical Damage"
        );

        DESECRATED_SPELL_AREA_OF_EFFECT = new Modifier(
            "spell_area_of_effect",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(8, 16))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "SpellAreaOfEffect",
            "Spell Skills have #% increased Area of Effect"
        );

        DESECRATED_SPELL_LIFE_COST_AND_EFFICIENCY = new Modifier(
            "mana_to_life_cost", "mana_cost_efficiency",
            List.of("amanamu_mod", "life", "caster"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(5, 10), new Pair<>(15, 25), "mana_to_life_cost", "mana_cost_efficiency")
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "SkillLifeCost",
            "#% increased Cost Efficiency\n#% of Spell Mana Cost Converted to Life Cost"
        );

        DESECRATED_HYBRID_INCREASED_CAST_SPEED_FULL_MANA_AND_DIFFERENT_SPELLS = new Modifier(
            "increased_cast_speed_full_mana", "increased_cast_speed_different_spells",
            List.of("kurgal_mod", "mana", "caster", "speed"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(26, 36), new Pair<>(3, 5), "increased_cast_speed_full_mana", "increased_cast_speed_different_spells")
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "IncreasedCastSpeed",
            "#% increased Cast Speed while on Full Mana\n#% increased Cast Speed for each different Non-Instant Spell you've Cast Recently"
        );

        DESECRATED_BREAK_INCREASED_ARMOUR = new Modifier(
            "break_increased_armour",
            List.of("ulaman_mod"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(31, 39))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "ArmourBreak",
            "#% increased Armour"
        );
        
        DESECRATED_BREAK_ARMOUR_ON_CRIT = new Modifier(
            "break_armour_on_crit",
            List.of("ulaman_mod", "caster", "critical"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(11, 18))
            ),
            ModifierType.SUFFIX,
            ModifierSource.DESECRATED,
            "CriticalArmourBreak",
            "Break Armour on Critical Hit with Spells equal to #% of Physical Damage dealt"
        );
    }
}
