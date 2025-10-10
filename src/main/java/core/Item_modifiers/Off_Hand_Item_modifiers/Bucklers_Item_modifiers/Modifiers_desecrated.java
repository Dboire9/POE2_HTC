package core.Item_modifiers.Off_Hand_Item_modifiers.Bucklers_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

	// NO PREFIXES FOR THE GLOVES

	// SHARED SUFFIXES
	public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
	public static final Modifier DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF;
	public static final Modifier DESECRATED_ALL_MAXIMUM_RESISTANCES;
	public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_DAMAGE_RECOUPED_AS_MANA;
	public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION;
	public static final Modifier DESECRATED_MAXIMUM_BLOCK_CHANCE;
	public static final Modifier DESECRATED_PARRIED_DEBUFF_MAGNITUDE;

	static {

		DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
				"fire_resistance", "chaos_resistance",
				List.of("amanamu_mod", "elemental", "fire", "chaos", "resistance"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17), "fire_resistance",
								"chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"FireAndChaosDamageResistance",
				"+#% to Fire and Chaos Resistances");

		DESECRATED_STRENGTH_AND_INTELLIGENCE = new Modifier(
				"strength", "intelligence",
				List.of("amanamu_mod", "attribute"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "strength",
								"intelligence")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"StrengthAndIntelligence",
				"+# to Strength and Intelligence");

		DESECRATED_STRENGTH_AND_DEXTERITY = new Modifier(
				"strength", "dexterity",
				List.of("ulaman_mod", "attribute"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "strength",
								"dexterity")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"StrengthAndDexterity",
				"+# to Strength and Dexterity");

		DESECRATED_ALL_MAXIMUM_RESISTANCES = new Modifier(
				"all_maximum_resistances",
				List.of("amanamu_mod", "resistance"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(1, 1))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"MaximumResistances",
				"+#% to all Maximum Resistances");

		DESECRATED_REDUCED_CURSE_EFFECT_ON_SELF = new Modifier(
				"reduced_curse_effect_on_self",
				List.of("amanamu_mod", "caster", "curse"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 35))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ReducedCurseEffect",
				"(#)% reduced effect of Curses on you");

		DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
				"cold_resistance", "chaos_resistance",
				List.of("kurgal_mod", "elemental", "cold", "chaos", "resistance"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17), "cold_resistance",
								"chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ColdAndChaosDamageResistance",
				"+#% to Cold and Chaos Resistances");

		DESECRATED_DEXTERITY_AND_INTELLIGENCE = new Modifier(
				"dexterity", "intelligence",
				List.of("kurgal_mod", "attribute"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(9, 15), new Pair<>(9, 15), "dexterity",
								"intelligence")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"DexterityAndIntelligence",
				"+# to Dexterity and Intelligence");

		DESECRATED_DAMAGE_RECOUPED_AS_MANA = new Modifier(
				"damage_recouped_as_mana",
				List.of("kurgal_mod", "life", "mana"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"PercentDamageGoesToMana",
				"(#)% of Damage taken Recouped as Mana");

		DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
				"lightning_resistance", "chaos_resistance",
				List.of("ulaman_mod", "elemental", "lightning", "chaos", "resistance"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(13, 17), new Pair<>(13, 17),
								"lightning_resistance", "chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"LightningAndChaosDamageResistance",
				"+#% to Lightning and Chaos Resistances");

		DESECRATED_CRITICAL_HIT_CHANCE_REDUCTION = new Modifier(
				"critical_hit_chance_reduction",
				List.of("ulaman_mod", "critical"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(17, 25))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ChanceToTakeCriticalStrike",
				"Hits have (#)% reduced Critical Hit Chance against you");

		DESECRATED_MAXIMUM_BLOCK_CHANCE = new Modifier(
				"maximum_block_chance",
				List.of("ulaman_mod"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(1, 2))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"MaximumBlockChance",
				"+(#–#)% to maximum Block chance");

		DESECRATED_PARRIED_DEBUFF_MAGNITUDE = new Modifier(
				"parried_debuff_magnitude",
				List.of("ulaman_mod"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(20, 30))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ParriedDebuffMagnitude",
				"(#–#)% increased Parried Debuff Magnitude");
	}
}
