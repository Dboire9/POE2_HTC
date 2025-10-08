package Item_modifiers.OneHand_Item_modifiers.Wands_Item_modifiers;

import Modifier_class.*;
import Modifier_class.Modifier.ModifierSource;
import Modifier_class.Modifier.ModifierType;

import java.util.List;
public class Modifiers_essences {

        //PREFIXES
        public static final Modifier ESSENCE_INCREASED_SPELL_DAMAGE;
        public static final Modifier ESSENCE_ABYSS_PREFIX;

        
    
        //SUFFIXES
        public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
        public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
        public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
        public static final Modifier ESSENCE_ALL_SPELL_SKILL_LEVEL;
        public static final Modifier ESSENCE_SPELL_CRIT_CHANCE;
        public static final Modifier ESSENCE_ABYSS_SUFFIX;
        public static final Modifier ESSENCE_INCREASED_CAST_SPEED;
        public static final Modifier ESSENCE_MANA_COST_EFFICIENCY;

        


    static {

//PREFIXES

        ESSENCE_INCREASED_SPELL_DAMAGE = new Modifier(
            "increased_spell_damage",
            List.of("caster_damage", "damage", "caster"),
            List.of(
                new ModifierTier("Lesser Essence of Sorcery", 8, 1, new Pair<>(35, 44)),
                new ModifierTier("Essence of Sorcery", 33, 1, new Pair<>(55, 64)),
                new ModifierTier("Greater Essence of Sorcery", 60, 1, new Pair<>(75, 89))
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "WeaponCasterDamagePrefix",
            "#% increased Spell Damage"
        );

        ESSENCE_ABYSS_PREFIX = new Modifier(
            "essence_abyss",
            List.of(),
            List.of(
                new ModifierTier("Essence of the Abyss", 1, 0, null)
            ),
            ModifierType.PREFIX,
            ModifierSource.ESSENCE,
            "EssenceAbyss",
            "Mark of the Abyssal Lord"
        );

// SUFFIXES

        ESSENCE_ATTRIBUTES_STRENGTH = new Modifier(
            "essence_attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Strength",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_ATTRIBUTES_DEXTERITY = new Modifier(
            "essence_attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Dexterity",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_ATTRIBUTES_INTELLIGENCE = new Modifier(
            "essence_attributes",
            List.of("attribute"),
            List.of(
                new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
                new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "Intelligence",
            "# to Strength, Dexterity or Intelligence"
        );

        ESSENCE_ALL_SPELL_SKILL_LEVEL = new Modifier(
            "essence_spell_skill_level",
            List.of("caster", "gem"),
            List.of(
                new ModifierTier("Perfect Essence of Sorcery", 72, 1, new Pair<>(3, 3))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreaseSocketedGemLevel",
            "+# to Level of all Spell Skills"
        );

        ESSENCE_SPELL_CRIT_CHANCE = new Modifier(
            "essence_spell_crit_chance",
            List.of("caster", "critical"),
            List.of(
                new ModifierTier("Lesser Essence of Seeking", 21, 1, new Pair<>(34, 39)),
                new ModifierTier("Essence of Seeking", 28, 1, new Pair<>(40, 46)),
                new ModifierTier("Greater Essence of Seeking", 41, 1, new Pair<>(47, 53))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "SpellCriticalStrikeChanceIncrease",
            "#% increased Critical Hit Chance for Spells"
        );

        ESSENCE_ABYSS_SUFFIX = new Modifier(
            "essence_abyss",
            List.of("mark_of_abyssal_lord"),
            List.of(
                new ModifierTier("Essence of the Abyss", 1, 1, new Pair<>(0, 0))
            ),
            ModifierType.SUFFIX,
            ModifierSource.ESSENCE,
            "EssenceAbyss",
            "Mark of the Abyssal Lord"
        );

        ESSENCE_INCREASED_CAST_SPEED = new Modifier(
            "essence_increased_cast_speed",
            List.of("caster", "speed"),
            List.of(
                new ModifierTier("Lesser Essence of Alacrity", 15, 1, new Pair<>(13, 16)),
                new ModifierTier("Essence of Alacrity", 30, 1, new Pair<>(17, 20)),
                new ModifierTier("Greater Essence of Alacrity", 60, 1, new Pair<>(25, 28))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "IncreasedCastSpeed",
            "#% increased Cast Speed"
        );

        ESSENCE_MANA_COST_EFFICIENCY = new Modifier(
            "essence_mana_cost_efficiency",
            List.of("mana"),
            List.of(
                new ModifierTier("Perfect Essence of Alacrity", 72, 1, new Pair<>(18, 20))
            ),
            ModifierType.SUFFIX,
            ModifierSource.NORMAL,
            "ManaCostEfficiency",
            "#% increased Mana Cost Efficiency"
        );

    }

}
