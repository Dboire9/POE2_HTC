package core.Item_modifiers.Helmets_Item_modifiers.Helmets_Hybrid_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_essences {

	// PREFIXES
	public static final Modifier ESSENCE_BASE_MAXIMUM_LIFE;
	public static final Modifier ESSENCE_BASE_MAXIMUM_MANA;
	public static final Modifier ESSENCE_INCREASED_PERCENT_ARMOUR;
	public static final Modifier ESSENCE_INCREASED_PERCENT_EVASION;
	public static final Modifier ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD;
	public static final Modifier ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION;
	public static final Modifier ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD;
	public static final Modifier ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD;
	

	// SUFFIXES
	public static final Modifier ESSENCE_CHAOS_RESISTANCE;
	public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
	public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
	public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
	public static final Modifier ESSENCE_LEVEL_MINION_SKILL;
	
	public static final Modifier ESSENCE_FIRE_RESISTANCE;
	public static final Modifier ESSENCE_COLD_RESISTANCE;
	public static final Modifier ESSENCE_COLD_DAMAGE_TAKEN_RECOUPED_AS_LIFE;
	public static final Modifier ESSENCE_LIGHTNING_RESISTANCE;
	public static final Modifier ESSENCE_ITEM_FOUND_RARITY_INCREASE;

	static {

		ESSENCE_BASE_MAXIMUM_LIFE = new Modifier(
				"base_maximum_life",
				List.of("life"),
				List.of(
						new ModifierTier("Lesser Essence of the Body", 16, 1, new Pair<>(30, 39)),
						new ModifierTier("Essence of the Body", 38, 1, new Pair<>(85, 99)),
						new ModifierTier("Greater Essence of the Body", 46, 1, new Pair<>(100, 119))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"IncreasedLife",
				"+# to maximum Life");

		ESSENCE_BASE_MAXIMUM_MANA = new Modifier(
				"base_maximum_mana",
				List.of("mana"),
				List.of(
						new ModifierTier("Lesser Essence of the Mind", 16, 1, new Pair<>(25, 34)),
						new ModifierTier("Essence of the Mind", 38, 1, new Pair<>(65, 79)),
						new ModifierTier("Greater Essence of the Mind", 46, 1, new Pair<>(80, 89))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"IncreasedMana",
				"+# to maximum Mana");

		ESSENCE_INCREASED_PERCENT_ARMOUR = new Modifier(
				"increased_percent_armour",
				List.of("defences"),
				List.of(
						new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
						new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
						new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"DefencesPercent",
				"#% increased Armour");

		ESSENCE_INCREASED_PERCENT_EVASION = new Modifier(
				"increased_percent_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
						new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
						new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"DefencesPercent",
				"#% increased Evasion");

		ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD = new Modifier(
				"increased_percent_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42)),
						new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67)),
						new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79))),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"DefencesPercent",
				"#% increased Energy Shield");

		ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_EVASION = new Modifier(
			"increased_percent_armour", "increased_percent_evasion",
			List.of("defences"),
			List.of(
					new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42), new Pair<>(27, 42),
							"increased_percent_armour", "increased_percent_evasion"),
					new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67), new Pair<>(56, 67),
							"increased_percent_armour", "increased_percent_evasion"),
					new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79), new Pair<>(68, 79),
							"increased_percent_armour", "increased_percent_evasion")),
			Modifier.ModifierType.PREFIX,
			Modifier.ModifierSource.ESSENCE,
			"DefencesPercent",
			"#% increased Armour and Evasion");

		ESSENCE_HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD = new Modifier(
			"increased_percent_armour", "increased_percent_energy_shield",
			List.of("defences"),
			List.of(
					new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42), new Pair<>(27, 42),
							"increased_percent_armour", "increased_percent_energy_shield"),
					new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67), new Pair<>(56, 67),
							"increased_percent_armour", "increased_percent_energy_shield"),
					new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79), new Pair<>(68, 79),
							"increased_percent_armour", "increased_percent_energy_shield")),
			Modifier.ModifierType.PREFIX,
			Modifier.ModifierSource.ESSENCE,
			"DefencesPercent",
			"#% increased Armour and Energy Shield");

		ESSENCE_HYBRID_INCREASED_PERCENT_EVASION_ENERGY_SHIELD = new Modifier(
			"increased_percent_evasion", "increased_percent_energy_shield",
			List.of("defences"),
			List.of(
					new ModifierTier("Lesser Essence of Enhancement", 16, 1, new Pair<>(27, 42), new Pair<>(27, 42),
							"increased_percent_evasion", "increased_percent_energy_shield"),
					new ModifierTier("Essence of Enhancement", 46, 1, new Pair<>(56, 67), new Pair<>(56, 67),
							"increased_percent_evasion", "increased_percent_energy_shield"),
					new ModifierTier("Greater Essence of Enhancement", 54, 1, new Pair<>(68, 79), new Pair<>(68, 79),
							"increased_percent_evasion", "increased_percent_energy_shield")),
			Modifier.ModifierType.PREFIX,
			Modifier.ModifierSource.ESSENCE,
			"DefencesPercent",
			"#% increased Evasion and Energy Shield");



		// SUFFIXES

		ESSENCE_CHAOS_RESISTANCE = new Modifier(
				"chaos_resistance",
				List.of("chaos", "resistance"),
				List.of(
						new ModifierTier("Lesser Essence of Ruin", 16, 1, new Pair<>(4, 7)),
						new ModifierTier("Essence of Ruin", 30, 1, new Pair<>(8, 11)),
						new ModifierTier("Greater Essence of Ruin", 56, 1, new Pair<>(16, 19))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"ChaosResistance",
				"+#% to Chaos Resistance");

		ESSENCE_ATTRIBUTES_STRENGTH = new Modifier(
				"attributes",
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
				"attributes",
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
				"attributes",
				List.of("attribute"),
				List.of(
						new ModifierTier("Lesser Essence of the Infinite", 11, 1, new Pair<>(9, 12)),
						new ModifierTier("Essence of the Infinite", 33, 1, new Pair<>(17, 20)),
						new ModifierTier("Greater Essence of the Infinite", 55, 1, new Pair<>(25, 27))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"Intelligence",
				"+# to Intelligence");

		ESSENCE_LEVEL_MINION_SKILL = new Modifier(
				"level_minion_skill",
				List.of("minion", "gem"),
				List.of(
						new ModifierTier("Perfect Essence of Hysteria", 5, 1, new Pair<>(1, 1))),
				ModifierType.PREFIX,
				ModifierSource.PERFECT_ESSENCE,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Minion Skills");



		ESSENCE_FIRE_RESISTANCE = new Modifier(
				"fire_resistance",
				List.of("elemental", "fire", "resistance"),
				List.of(
						new ModifierTier("Lesser Essence of Insulation", 12, 1, new Pair<>(11, 15)),
						new ModifierTier("Essence of Insulation", 36, 1, new Pair<>(21, 25)),
						new ModifierTier("Greater Essence of Insulation", 60, 1, new Pair<>(31, 35))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"FireResistance",
				"+#% to Fire Resistance");

		ESSENCE_COLD_RESISTANCE = new Modifier(
				"cold_resistance",
				List.of("elemental", "cold", "resistance"),
				List.of(
						new ModifierTier("Lesser Essence of Thawing", 12, 1, new Pair<>(11, 15)),
						new ModifierTier("Essence of Thawing", 36, 1, new Pair<>(21, 25)),
						new ModifierTier("Greater Essence of Thawing", 60, 1, new Pair<>(31, 35))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"ColdResistance",
				"+#% to Cold Resistance");

		ESSENCE_COLD_DAMAGE_TAKEN_RECOUPED_AS_LIFE = new Modifier(
				"cold_damage_taken_recouped_as_life",
				List.of("life", "elemental", "cold"),
				List.of(
						new ModifierTier("Perfect Essence of Thawing", 72, 1, new Pair<>(26, 30))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"ColdDamageTakenRecoupedAsLife",
				"#% of Cold Damage taken Recouped as Life");

		ESSENCE_LIGHTNING_RESISTANCE = new Modifier(
				"lightning_resistance",
				List.of("elemental", "lightning", "resistance"),
				List.of(
						new ModifierTier("Lesser Essence of Grounding", 12, 1, new Pair<>(11, 15)),
						new ModifierTier("Essence of Grounding", 36, 1, new Pair<>(21, 25)),
						new ModifierTier("Greater Essence of Grounding", 60, 1, new Pair<>(31, 35))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"LightningResistance",
				"+#% to Lightning Resistance");

		ESSENCE_ITEM_FOUND_RARITY_INCREASE = new Modifier(
				"item_found_rarity_increase",
				List.of(""),
				List.of(
						new ModifierTier("Lesser Essence of Opulence", 24, 1, new Pair<>(11, 14)),
						new ModifierTier("Essence of Opulence", 40, 1, new Pair<>(15, 18)),
						new ModifierTier("Greater Essence of Opulence", 63, 1, new Pair<>(19, 21))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"ItemFoundRarityIncrease",
				"#% increased Rarity of Items found");

	}

}
