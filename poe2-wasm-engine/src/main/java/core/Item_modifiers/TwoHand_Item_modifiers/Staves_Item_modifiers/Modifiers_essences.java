package core.Item_modifiers.TwoHand_Item_modifiers.Staves_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_essences {

	// PREFIXES
	public static final Modifier ESSENCE_INCREASED_SPELL_DAMAGE;
	

	// SUFFIXES
	public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
	public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
	public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
	public static final Modifier ESSENCE_ALL_SPELL_SKILL_LEVEL;
	public static final Modifier ESSENCE_SPELL_CRIT_CHANCE;
	
	public static final Modifier ESSENCE_INCREASED_CAST_SPEED;
	public static final Modifier ESSENCE_MANA_COST_EFFICIENCY;

	static {
		// PREFIXES

		ESSENCE_INCREASED_SPELL_DAMAGE = new Modifier(
				"increased_spell_damage",
				List.of("damage", "caster"),
				List.of(
						new ModifierTier("Lesser Essence of Sorcery", 8, 1, new Pair<>(50, 64)),
						new ModifierTier("Essence of Sorcery", 33, 1, new Pair<>(80, 94)),
						new ModifierTier("Greater Essence of Sorcery", 60, 1, new Pair<>(110, 129))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"WeaponCasterDamagePrefix",
				"#% increased Spell Damage");



		// SUFFIXES

		ESSENCE_ATTRIBUTES_STRENGTH = new Modifier(
				"essence_attributes",
				List.of("attribute"),
				List.of(
						new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
						new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
						new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"Strength",
				"+# to Strength");

		ESSENCE_ATTRIBUTES_DEXTERITY = new Modifier(
				"essence_attributes",
				List.of("attribute"),
				List.of(
						new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
						new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
						new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"Dexterity",
				"+# to Dexterity");

		ESSENCE_ATTRIBUTES_INTELLIGENCE = new Modifier(
				"essence_attributes",
				List.of("attribute"),
				List.of(
						new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
						new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
						new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"Intelligence",
				"+# to Intelligence");

		ESSENCE_ALL_SPELL_SKILL_LEVEL = new Modifier(
				"essence_spell_skill_level",
				List.of("caster", "gem"),
				List.of(
						new ModifierTier("Perfect Essence of Sorcery", 72, 1, new Pair<>(5, 5))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Spell Skills");

		ESSENCE_SPELL_CRIT_CHANCE = new Modifier(
				"spell_critical_strike_chance_increase",
				List.of("caster", "critical"),
				List.of(
						new ModifierTier("Lesser Essence of Seeking", 21, 1, new Pair<>(50, 59)),
						new ModifierTier("Essence of Seeking", 28, 1, new Pair<>(60, 69)),
						new ModifierTier("Greater Essence of Seeking", 41, 1, new Pair<>(70, 79))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"SpellCriticalStrikeChanceIncrease",
				"#% increased Critical Hit Chance for Spells");



		ESSENCE_INCREASED_CAST_SPEED = new Modifier(
				"essence_increased_cast_speed",
				List.of("caster", "speed"),
				List.of(
						new ModifierTier("Lesser Essence of Alacrity", 15, 1, new Pair<>(20, 25)),
						new ModifierTier("Essence of Alacrity", 30, 1, new Pair<>(26, 31)),
						new ModifierTier("Greater Essence of Alacrity", 60, 1, new Pair<>(38, 43))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"IncreasedCastSpeed",
				"#% increased Cast Speed");

		ESSENCE_MANA_COST_EFFICIENCY = new Modifier(
				"essence_mana_cost_efficiency",
				List.of("mana"),
				List.of(
						new ModifierTier("Perfect Essence of Alacrity", 72, 1, new Pair<>(28, 32))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"ManaCostEfficiency",
				"#% increased Mana Cost Efficiency");
	}

}
