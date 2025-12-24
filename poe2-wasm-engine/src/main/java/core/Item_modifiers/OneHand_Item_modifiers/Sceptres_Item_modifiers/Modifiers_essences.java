package core.Item_modifiers.OneHand_Item_modifiers.Sceptres_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_essences {

	// PREFIXES
	public static final Modifier ESSENCE_ALLIES_INCREASED_DAMAGE;
	

	// SUFFIXES
	public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
	public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
	public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
	
	public static final Modifier ESSENCE_AURA_SKILLS_MAGNITUDE;

	static {

		// PREFIXES

		ESSENCE_ALLIES_INCREASED_DAMAGE = new Modifier(
				"allies_increased_damage",
				List.of("damage"),
				List.of(
						new ModifierTier("Lesser Essence of Command", 8, 1, new Pair<>(35, 44)),
						new ModifierTier("Essence of Command", 33, 1, new Pair<>(55, 64)),
						new ModifierTier("Greater Essence of Command", 60, 1, new Pair<>(75, 89))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"AllDamage",
				"Allies in your Presence deal #% increased damage");



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



		ESSENCE_AURA_SKILLS_MAGNITUDE = new Modifier(
				"aura_skills_magnitudes",
				List.of(),
				List.of(
						new ModifierTier("Perfect Essence of Command", 72, 1, new Pair<>(15, 20))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"AuraEffect",
				"Aura Skills have (#–#)% increased Magnitudes");
	}
}
