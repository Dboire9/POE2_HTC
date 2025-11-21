package core.Item_modifiers.Off_Hand_Item_modifiers.Quivers_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_essences {

	// PREFIXES

	public static final Modifier ESSENCE_INCREASED_ACCURACY;
	public static final Modifier ESSENCE_INCREASED_DAMAGE_WITH_BOW_SKILLS;
	

	// SUFFIXES
	public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
	public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
	public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
	

	static {

		ESSENCE_INCREASED_ACCURACY = new Modifier(
				"essence_increased_accuracy",
				List.of("attack"),
				List.of(
						new ModifierTier("Lesser Essence of Battle", 18, 1, new Pair<>(61, 84)),
						new ModifierTier("Essence of Battle", 36, 1, new Pair<>(124, 167)),
						new ModifierTier("Greater Essence of Battle", 58, 1, new Pair<>(237, 346))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"IncreasedAccuracy",
				"+# to Accuracy Rating");

		ESSENCE_INCREASED_DAMAGE_WITH_BOW_SKILLS = new Modifier(
				"essence_increased_damage_with_bow_skills",
				List.of("damage"),
				List.of(
						new ModifierTier("Essence of Hysteria", 60, 0, new Pair<>(43, 50))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"IncreasedDamageWithBowSkillsPercent",
				"#% increased Damage with Bow Skills");



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



	}

}
