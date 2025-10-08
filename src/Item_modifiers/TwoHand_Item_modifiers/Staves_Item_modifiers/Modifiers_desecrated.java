package Item_modifiers.TwoHand_Item_modifiers.Staves_Item_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

    // PREFIXES
    public static final Modifier DESECRATED_BASE_SPIRIT;
    public static final Modifier DESECRATED_SPELL_DAMAGE_COST_LIFE;
    public static final Modifier DESECRATED_SPELL_DAMAGE_PER_100_MANA;
    public static final Modifier DESECRATED_SPELL_DAMAGE_PER_100_LIFE;
    public static final Modifier DESECRATED_ELEMENTAL_INFUSION;
    public static final Modifier DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT;
    
    // SUFFIXES
    public static final Modifier DESECRATED_ARCHON_DURATION;
    public static final Modifier DESECRATED_BLOCK_CHANCE;
    public static final Modifier DESECRATED_SKILL_LIFE_COST;
    public static final Modifier DESECRATED_ARCHON_DELAY_RECOVERY;
    public static final Modifier DESECRATED_CAST_SPEED_ON_LOW_LIFE;
    public static final Modifier DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE;

    static {
        // PREFIXES

        DESECRATED_BASE_SPIRIT = new Modifier(
            "base_spirit",
            List.of("amanamu_mod"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(35, 50))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "BaseSpirit",
            "+# to Spirit"
        );

        DESECRATED_SPELL_DAMAGE_COST_LIFE = new Modifier(
            "spell_damage_cost_life",
            List.of("amanamu"),
            List.of(
                new ModifierTier("Amanamu's", 65, 1, new Pair<>(91, 116))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponCasterDamagePrefix",
            "#% increased Spell Damage with Spells that cost Life"
        );

        DESECRATED_SPELL_DAMAGE_PER_100_MANA = new Modifier(
            "spell_damage_per_100_mana",
            List.of("kurgal", "mana", "damage", "caster"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(4, 5))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponCasterDamagePrefix",
            "#% increased Spell Damage per 100 maximum Mana"
        );

        DESECRATED_SPELL_DAMAGE_PER_100_LIFE = new Modifier(
            "spell_damage_per_100_life",
            List.of("ulaman", "life", "damage", "caster"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(4, 5))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "WeaponCasterDamagePrefix",
            "#% increased Spell Damage per 100 Maximum Life"
        );

        DESECRATED_ELEMENTAL_INFUSION = new Modifier(
            "elemental_infusion",
            List.of("kurgal", "elemental"),
            List.of(
                new ModifierTier("Kurgal's", 65, 1, new Pair<>(1, 2))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "ElementalInfusion",
            "+# to maximum number of Elemental Infusions"
        );

        DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT = new Modifier(
            "increased_magnitude_ailment_effect",
            List.of("ulaman", "ailment"),
            List.of(
                new ModifierTier("Ulaman's", 65, 1, new Pair<>(31, 49))
            ),
            ModifierType.PREFIX,
            ModifierSource.NORMAL,
            "AilmentEffect",
            "#% increased Magnitude of Damaging Ailments you inflict"
        );

//SUFFIXES

        DESECRATED_ARCHON_DURATION = new Modifier(
                    "archon_duration",
                    List.of("amanamu"),
                    List.of(
                        new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 35))
                    ),
                    ModifierType.SUFFIX,
                    ModifierSource.NORMAL,
                    "ArchonDuration",
                    "#% increased Archon Buff duration"
                );

        DESECRATED_BLOCK_CHANCE = new Modifier(
            "block_chance",
            List.of("amanamu"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(12, 16))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "AdditionalBlock",
            "+#% to Block chance"
        );

        DESECRATED_SKILL_LIFE_COST = new Modifier(
            "skill_life_cost",
            List.of("amanamu", "life", "caster"),
            List.of(
                new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "SkillLifeCost",
            "#% of Spell Mana Cost Converted to Life Cost"
        );

        DESECRATED_ARCHON_DELAY_RECOVERY = new Modifier(
            "archon_delay_recovery",
            List.of("kurgal"),
            List.of(
                new ModifierTier("of Kurgal", 65, 1, new Pair<>(25, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "ArchonDelayRecovery",
            "Archon recovery period expires #% faster"
        );

        DESECRATED_CAST_SPEED_ON_LOW_LIFE = new Modifier(
            "cast_speed_on_low_life",
            List.of("ulaman", "caster", "speed"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(30, 40))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "CastSpeedOnLowLife",
            "#% increased Cast Speed when on Low Life"
        );

        DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE = new Modifier(
            "spells_fire_2_additional_projectile_chance",
            List.of("ulaman", "caster"),
            List.of(
                new ModifierTier("of Ulaman", 65, 1, new Pair<>(25, 35))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "SpellsFire2AdditionalProjectileChance",
            "#% chance for Spell Skills to fire 2 additional Projectiles"
        );

    }
}