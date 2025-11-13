package core.Item_modifiers.Off_Hand_Item_modifiers.Shields_Item_modifiers.Shields_Hybrid_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier BASE_MAXIMUM_LIFE;
	public static final Modifier HYBRID_BASE_ARMOUR_EVASION;
	public static final Modifier HYBRID_BASE_ARMOUR_ENERGY_SHIELD;
	public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_EVASION;
	public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD;
	public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_STUN;
	public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_STUN;
	public static final Modifier PHYSICAL_THORNS_DAMAGE;
	public static final Modifier INCREASED_SHIELD_BLOCK_CHANCE;

	// SUFFIXES
	public static final Modifier STRENGTH;
	public static final Modifier DEXTERITY;
	public static final Modifier INTELLIGENCE;
	public static final Modifier FIRE_RESISTANCE;
	public static final Modifier COLD_RESISTANCE;
	public static final Modifier LIGHTNING_RESISTANCE;
	public static final Modifier CHAOS_RESISTANCE;
	public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
	public static final Modifier BASE_STUN_THRESHOLD;
	public static final Modifier PHYSICAL_DAMAGE_REDUCTION;
	public static final Modifier MAXIMUM_FIRE_RESIST;
	public static final Modifier MAXIMUM_COLD_RESIST;
	public static final Modifier MAXIMUM_LIGHTNING_RESIST;
	public static final Modifier MAXIMUM_CHAOS_RESIST;
	public static final Modifier ALL_MAXIMUM_RESISTANCES;
	public static final Modifier ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE;
	public static final Modifier EVASION_APPLIES_TO_DEFLECTION;
	public static final Modifier ENERGY_SHIELD_RECHARGE_RATE;

	static {

		// PREFIXES

		BASE_MAXIMUM_LIFE = new Modifier(
				"base_maximum_life",
				List.of("life"),
				List.of(
						new ModifierTier("Hale", 1, 1000, new Pair<>(10, 19)),
						new ModifierTier("Healthy", 6, 1000, new Pair<>(20, 29)),
						new ModifierTier("Sanguine", 16, 1000, new Pair<>(30, 39)),
						new ModifierTier("Stalwart", 24, 1000, new Pair<>(40, 59)),
						new ModifierTier("Stout", 33, 1000, new Pair<>(60, 69)),
						new ModifierTier("Robust", 38, 1000, new Pair<>(70, 84)),
						new ModifierTier("Rotund", 46, 1000, new Pair<>(85, 99)),
						new ModifierTier("Virile", 54, 1000, new Pair<>(100, 119)),
						new ModifierTier("Athlete's", 60, 1000, new Pair<>(120, 149)),
						new ModifierTier("Fecund", 65, 1000, new Pair<>(150, 174)),
						new ModifierTier("Vigorous", 70, 1000, new Pair<>(175, 189))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedLife",
				"+# to maximum Life");

		HYBRID_BASE_ARMOUR_EVASION = new Modifier(
				"base_armour", "base_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Supple", 1, 1000, new Pair<>(8, 14), new Pair<>(6, 9), "base_armour",
								"base_evasion"),
						new ModifierTier("Pliant", 16, 1000, new Pair<>(15, 35), new Pair<>(10, 30), "base_armour",
								"base_evasion"),
						new ModifierTier("Flexible", 33, 1000, new Pair<>(36, 53), new Pair<>(31, 46), "base_armour",
								"base_evasion"),
						new ModifierTier("Durable", 46, 1000, new Pair<>(54, 65), new Pair<>(47, 57), "base_armour",
								"base_evasion"),
						new ModifierTier("Sturdy", 54, 1000, new Pair<>(66, 78), new Pair<>(58, 69), "base_armour",
								"base_evasion"),
						new ModifierTier("Resilient", 60, 1000, new Pair<>(79, 98), new Pair<>(70, 88), "base_armour",
								"base_evasion"),
						new ModifierTier("Adaptable", 65, 1000, new Pair<>(99, 117), new Pair<>(89, 107), "base_armour",
								"base_evasion")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefences",
				"+# to Armour\n+# to Evasion Rating");

		HYBRID_BASE_ARMOUR_ENERGY_SHIELD = new Modifier(
				"base_armour", "base_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Blessed", 1, 1000, new Pair<>(8, 14), new Pair<>(5, 8), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Anointed", 16, 1000, new Pair<>(15, 35), new Pair<>(9, 15), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Sanctified", 33, 1000, new Pair<>(36, 53), new Pair<>(16, 21), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Hallowed", 46, 1000, new Pair<>(54, 65), new Pair<>(22, 25), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Beatified", 54, 1000, new Pair<>(66, 78), new Pair<>(26, 29), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Consecrated", 60, 1000, new Pair<>(79, 98), new Pair<>(30, 36), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Saintly", 65, 1000, new Pair<>(99, 117), new Pair<>(37, 42), "base_armour",
								"base_energy_shield"),
						new ModifierTier("Godly", 75, 1000, new Pair<>(118, 138), new Pair<>(43, 48), "base_armour",
								"base_energy_shield")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefences",
				"+# to Armour\n+# to maximum Energy Shield");

		HYBRID_INCREASED_PERCENT_ARMOUR_EVASION = new Modifier(
				"increased_percent_armour", "increased_percent_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Scrapper's", 2, 1000, new Pair<>(15, 26), new Pair<>(15, 26),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Brawler's", 16, 1000, new Pair<>(27, 42), new Pair<>(27, 42),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Fencer's", 33, 1000, new Pair<>(43, 55), new Pair<>(43, 55),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Gladiator's", 46, 1000, new Pair<>(56, 67), new Pair<>(56, 67),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Duelist's", 54, 1000, new Pair<>(68, 79), new Pair<>(68, 79),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Hero's", 60, 1000, new Pair<>(80, 91), new Pair<>(80, 91),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Legend's", 65, 1000, new Pair<>(92, 100), new Pair<>(92, 100),
								"increased_percent_armour", "increased_percent_evasion"),
						new ModifierTier("Victor's", 75, 1000, new Pair<>(101, 110), new Pair<>(101, 110),
								"increased_percent_armour", "increased_percent_evasion")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercent",
				"#% increased Armour and Evasion");

		HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD = new Modifier(
				"increased_percent_armour", "increased_percent_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Infixed", 2, 1000, new Pair<>(15, 26), new Pair<>(15, 26),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Ingrained", 16, 1000, new Pair<>(27, 42), new Pair<>(27, 42),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Instilled", 33, 1000, new Pair<>(43, 55), new Pair<>(43, 55),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Infused", 46, 1000, new Pair<>(56, 67), new Pair<>(56, 67),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Inculcated", 54, 1000, new Pair<>(68, 79), new Pair<>(68, 79),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Interpolated", 60, 1000, new Pair<>(80, 91), new Pair<>(80, 91),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Inspired", 65, 1000, new Pair<>(92, 100), new Pair<>(92, 100),
								"increased_percent_armour", "increased_percent_energy_shield"),
						new ModifierTier("Interpermeated", 75, 1000, new Pair<>(101, 110), new Pair<>(101, 110),
								"increased_percent_armour", "increased_percent_energy_shield")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercent",
				"#% increased Armour and Energy Shield");

		HYBRID_INCREASED_PERCENT_ARMOUR_EVASION_AND_STUN = new Modifier(
				"increased_percent_armour", "increased_percent_evasion", "base_stun_threshold",
				List.of("defences"),
				List.of(
						new ModifierTier("Captain's", 10, 1000, new Pair<>(6, 13), new Pair<>(6, 13), new Pair<>(8, 13),
								"increased_percent_armour", "increased_percent_evasion", "base_stun_threshold"),
						new ModifierTier("Commander's", 19, 1000, new Pair<>(14, 20), new Pair<>(14, 20),
								new Pair<>(14, 24), "increased_percent_armour", "increased_percent_evasion",
								"base_stun_threshold"),
						new ModifierTier("Magnate's", 38, 1000, new Pair<>(21, 26), new Pair<>(21, 26),
								new Pair<>(25, 40), "increased_percent_armour", "increased_percent_evasion",
								"base_stun_threshold"),
						new ModifierTier("Marshal's", 48, 1000, new Pair<>(27, 32), new Pair<>(27, 32),
								new Pair<>(41, 63), "increased_percent_armour", "increased_percent_evasion",
								"base_stun_threshold"),
						new ModifierTier("General's", 63, 1000, new Pair<>(33, 38), new Pair<>(33, 38),
								new Pair<>(64, 94), "increased_percent_armour", "increased_percent_evasion",
								"base_stun_threshold"),
						new ModifierTier("Warlord's", 74, 1000, new Pair<>(39, 42), new Pair<>(39, 42),
								new Pair<>(95, 136), "increased_percent_armour", "increased_percent_evasion",
								"base_stun_threshold")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercentAndStunThreshold",
				"#% increased Armour and Evasion\n+# to Stun Threshold");

		HYBRID_INCREASED_PERCENT_ARMOUR_ENERGY_SHIELD_AND_STUN = new Modifier(
				"increased_percent_armour", "increased_percent_energy_shield", "base_stun_threshold",
				List.of("defences"),
				List.of(
						new ModifierTier("Defender's", 10, 1000, new Pair<>(6, 13), new Pair<>(6, 13),
								new Pair<>(8, 13), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold"),
						new ModifierTier("Protector's", 19, 1000, new Pair<>(14, 20), new Pair<>(14, 20),
								new Pair<>(14, 24), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold"),
						new ModifierTier("Keeper's", 38, 1000, new Pair<>(21, 26), new Pair<>(21, 26),
								new Pair<>(25, 40), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold"),
						new ModifierTier("Guardian's", 48, 1000, new Pair<>(27, 32), new Pair<>(27, 32),
								new Pair<>(41, 63), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold"),
						new ModifierTier("Warden's", 63, 1000, new Pair<>(33, 38), new Pair<>(33, 38),
								new Pair<>(64, 94), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold"),
						new ModifierTier("Sentinel's", 74, 1000, new Pair<>(39, 42), new Pair<>(39, 42),
								new Pair<>(95, 136), "increased_percent_armour", "increased_percent_energy_shield",
								"base_stun_threshold")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercentAndStunThreshold",
				"#% increased Armour and Energy Shield\n+# to Stun Threshold");

		PHYSICAL_THORNS_DAMAGE = new Modifier(
				"physical_thorns_damage",
				List.of("damage", "physical"),
				List.of(
						new ModifierTier("Thorny", 1, 1000, new Pair<>(1, 2), new Pair<>(3, 4), "", ""),
						new ModifierTier("Spiny", 10, 1000, new Pair<>(5, 7), new Pair<>(7, 10), "", ""),
						new ModifierTier("Barbed", 19, 1000, new Pair<>(11, 16), new Pair<>(15, 23), "", ""),
						new ModifierTier("Pointed", 38, 1000, new Pair<>(24, 35), new Pair<>(35, 53), "", ""),
						new ModifierTier("Spiked", 48, 1000, new Pair<>(40, 60), new Pair<>(61, 92), "", ""),
						new ModifierTier("Edged", 63, 1000, new Pair<>(64, 97), new Pair<>(97, 145), "", ""),
						new ModifierTier("Jagged", 74, 1000, new Pair<>(101, 151), new Pair<>(146, 220), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"Thorns",
				"# to # Physical Thorns damage");

		INCREASED_SHIELD_BLOCK_CHANCE = new Modifier(
				"increased_shield_block_chance",
				List.of("block", "shield"),
				List.of(
						new ModifierTier("Steadfast", 1, 1000, new Pair<>(15, 19)),
						new ModifierTier("Unrelenting", 33, 1000, new Pair<>(20, 24)),
						new ModifierTier("Adamant", 65, 1000, new Pair<>(25, 30))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedShieldBlockPercentage",
				"(#–#)% increased Block chance");

		// SUFFIXES

		STRENGTH = new Modifier(
				"strength",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Brute", 1, 1000, new Pair<>(5, 8)),
						new ModifierTier("of the Wrestler", 11, 1000, new Pair<>(9, 12)),
						new ModifierTier("of the Bear", 22, 1000, new Pair<>(13, 16)),
						new ModifierTier("of the Lion", 33, 1000, new Pair<>(17, 20)),
						new ModifierTier("of the Gorilla", 44, 1000, new Pair<>(21, 24)),
						new ModifierTier("of the Goliath", 55, 1000, new Pair<>(25, 27)),
						new ModifierTier("of the Leviathan", 66, 1000, new Pair<>(28, 30)),
						new ModifierTier("of the Titan", 74, 1000, new Pair<>(31, 33))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"Strength",
				"+# to Strength");

		INTELLIGENCE = new Modifier(
				"intelligence",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Pupil", 1, 500, new Pair<>(5, 8)),
						new ModifierTier("of the Student", 11, 500, new Pair<>(9, 12)),
						new ModifierTier("of the Prodigy", 22, 500, new Pair<>(13, 16)),
						new ModifierTier("of the Augur", 33, 500, new Pair<>(17, 20)),
						new ModifierTier("of the Philosopher", 44, 500, new Pair<>(21, 24)),
						new ModifierTier("of the Sage", 55, 500, new Pair<>(25, 27)),
						new ModifierTier("of the Savant", 66, 500, new Pair<>(28, 30)),
						new ModifierTier("of the Virtuoso", 74, 500, new Pair<>(31, 33))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"Intelligence",
				"+# to Intelligence");

		DEXTERITY = new Modifier(
				"dexterity",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Mongoose", 1, 500, new Pair<>(5, 8)),
						new ModifierTier("of the Lynx", 11, 500, new Pair<>(9, 12)),
						new ModifierTier("of the Fox", 22, 500, new Pair<>(13, 16)),
						new ModifierTier("of the Falcon", 33, 500, new Pair<>(17, 20)),
						new ModifierTier("of the Panther", 44, 500, new Pair<>(21, 24)),
						new ModifierTier("of the Leopard", 55, 500, new Pair<>(25, 27)),
						new ModifierTier("of the Jaguar", 66, 500, new Pair<>(28, 30)),
						new ModifierTier("of the Phantom", 74, 500, new Pair<>(31, 33))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"Dexterity",
				"+# to Dexterity");

		FIRE_RESISTANCE = new Modifier(
				"fire_resistance",
				List.of("elemental", "fire", "resistance"),
				List.of(
						new ModifierTier("of the Whelpling", 1, 1000, new Pair<>(6, 10)),
						new ModifierTier("of the Salamander", 12, 1000, new Pair<>(11, 15)),
						new ModifierTier("of the Drake", 24, 1000, new Pair<>(16, 20)),
						new ModifierTier("of the Kiln", 36, 1000, new Pair<>(21, 25)),
						new ModifierTier("of the Furnace", 48, 1000, new Pair<>(26, 30)),
						new ModifierTier("of the Volcano", 60, 1000, new Pair<>(31, 35)),
						new ModifierTier("of Magma", 71, 1000, new Pair<>(36, 40)),
						new ModifierTier("of Tzteosh", 82, 1000, new Pair<>(41, 45))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"FireResistance",
				"+#% to Fire Resistance");

		COLD_RESISTANCE = new Modifier(
				"cold_resistance",
				List.of("elemental", "cold", "resistance"),
				List.of(
						new ModifierTier("of the Seal", 1, 1000, new Pair<>(6, 10)),
						new ModifierTier("of the Penguin", 14, 1000, new Pair<>(11, 15)),
						new ModifierTier("of the Narwhal", 26, 1000, new Pair<>(16, 20)),
						new ModifierTier("of the Yeti", 38, 1000, new Pair<>(21, 25)),
						new ModifierTier("of the Walrus", 50, 1000, new Pair<>(26, 30)),
						new ModifierTier("of the Polar Bear", 60, 1000, new Pair<>(31, 35)),
						new ModifierTier("of the Ice", 71, 1000, new Pair<>(36, 40)),
						new ModifierTier("of Haast", 82, 1000, new Pair<>(41, 45))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ColdResistance",
				"+#% to Cold Resistance");

		LIGHTNING_RESISTANCE = new Modifier(
				"lightning_resistance",
				List.of("elemental", "lightning", "resistance"),
				List.of(
						new ModifierTier("of the Cloud", 1, 1000, new Pair<>(6, 10)),
						new ModifierTier("of the Squall", 13, 1000, new Pair<>(11, 15)),
						new ModifierTier("of the Storm", 25, 1000, new Pair<>(16, 20)),
						new ModifierTier("of the Thunderhead", 37, 1000, new Pair<>(21, 25)),
						new ModifierTier("of the Tempest", 49, 1000, new Pair<>(26, 30)),
						new ModifierTier("of the Maelstrom", 60, 1000, new Pair<>(31, 35)),
						new ModifierTier("of the Lightning", 71, 1000, new Pair<>(36, 40)),
						new ModifierTier("of Ephij", 82, 1000, new Pair<>(41, 45))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LightningResistance",
				"+#% to Lightning Resistance");

		CHAOS_RESISTANCE = new Modifier(
				"chaos_resistance",
				List.of("chaos", "resistance"),
				List.of(
						new ModifierTier("of the Lost", 16, 250, new Pair<>(4, 7)),
						new ModifierTier("of Banishment", 30, 250, new Pair<>(8, 11)),
						new ModifierTier("of Eviction", 44, 250, new Pair<>(12, 15)),
						new ModifierTier("of Expulsion", 56, 250, new Pair<>(16, 19)),
						new ModifierTier("of Exile", 68, 250, new Pair<>(20, 23)),
						new ModifierTier("of Bameth", 81, 250, new Pair<>(24, 27))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ChaosResistance",
				"+#% to Chaos Resistance");

		REDUCED_ATTRIBUTE_REQUIREMENTS = new Modifier(
				"reduced_attribute_requirements",
				List.of(""),
				List.of(
						new ModifierTier("of the Worthy", 24, 800, new Pair<>(15, 15)),
						new ModifierTier("of the Apt", 32, 800, new Pair<>(20, 20)),
						new ModifierTier("of the Talented", 40, 800, new Pair<>(25, 25)),
						new ModifierTier("of the Skilled", 52, 800, new Pair<>(30, 30)),
						new ModifierTier("of the Proficient", 60, 800, new Pair<>(35, 35))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LocalAttributeRequirements",
				"% reduced Attribute Requirements");

		BASE_STUN_THRESHOLD = new Modifier(
				"base_stun_threshold",
				List.of(),
				List.of(
						new ModifierTier("of Thick Skin", 1, 800, new Pair<>(6, 11)),
						new ModifierTier("of Reinforced Skin", 8, 800, new Pair<>(12, 29)),
						new ModifierTier("of Stone Skin", 15, 800, new Pair<>(30, 49)),
						new ModifierTier("of Iron Skin", 22, 800, new Pair<>(50, 72)),
						new ModifierTier("of Steel Skin", 29, 800, new Pair<>(73, 97)),
						new ModifierTier("of Granite Skin", 36, 800, new Pair<>(98, 124)),
						new ModifierTier("of Platinum Skin", 45, 800, new Pair<>(125, 163)),
						new ModifierTier("of Adamantite Skin", 54, 800, new Pair<>(164, 206)),
						new ModifierTier("of Corundum Skin", 63, 800, new Pair<>(207, 253)),
						new ModifierTier("of Obsidian Skin", 72, 800, new Pair<>(254, 304))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"StunThreshold",
				"+# to Stun Threshold");

		PHYSICAL_DAMAGE_REDUCTION = new Modifier(
				"physical_damage_reduction",
				List.of("physical"),
				List.of(
						new ModifierTier("of the Watchman", 32, 1000, new Pair<>(4, 4)),
						new ModifierTier("of the Custodian", 41, 1000, new Pair<>(5, 5)),
						new ModifierTier("of the Sentry", 53, 1000, new Pair<>(6, 6)),
						new ModifierTier("of the Protector", 66, 1000, new Pair<>(7, 7)),
						new ModifierTier("of the Conservator", 77, 1000, new Pair<>(8, 8))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ReducedPhysicalDamageTaken",
				"#% additional Physical Damage Reduction");

		MAXIMUM_FIRE_RESIST = new Modifier(
				"maximum_fire_resist",
				List.of("elemental", "fire", "resistance"),
				List.of(
						new ModifierTier("of the Bushfire", 68, 250, new Pair<>(1, 1)),
						new ModifierTier("of the Molten Core", 75, 250, new Pair<>(2, 2)),
						new ModifierTier("of the Solar Storm", 81, 250, new Pair<>(3, 3))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"MaximumFireResist",
				"+#% to Maximum Fire Resistance");

		MAXIMUM_COLD_RESIST = new Modifier(
				"maximum_cold_resist",
				List.of("elemental", "cold", "resistance"),
				List.of(
						new ModifierTier("of Furs", 68, 250, new Pair<>(1, 1)),
						new ModifierTier("of the Tundra", 75, 250, new Pair<>(2, 2)),
						new ModifierTier("of the Mammoth", 81, 250, new Pair<>(3, 3))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"MaximumColdResist",
				"+#% to Maximum Cold Resistance");

		MAXIMUM_LIGHTNING_RESIST = new Modifier(
				"maximum_lightning_resist",
				List.of("elemental", "lightning", "resistance"),
				List.of(
						new ModifierTier("of Impedance", 68, 250, new Pair<>(1, 1)),
						new ModifierTier("of Shockproofing", 75, 250, new Pair<>(2, 2)),
						new ModifierTier("of the Lightning Rod", 81, 250, new Pair<>(3, 3))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"MaximumLightningResist",
				"+#% to Maximum Lightning Resistance");

		MAXIMUM_CHAOS_RESIST = new Modifier(
				"maximum_chaos_resist",
				List.of("chaos", "resistance"),
				List.of(
						new ModifierTier("of Regularity", 68, 125, new Pair<>(1, 1)),
						new ModifierTier("of Concord", 75, 125, new Pair<>(2, 2)),
						new ModifierTier("of Harmony", 81, 125, new Pair<>(3, 3))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"MaximumChaosResist",
				"+#% to Maximum Chaos Resistance");

		ALL_MAXIMUM_RESISTANCES = new Modifier(
				"all_maximum_resistances",
				List.of("elemental", "resistance"),
				List.of(
						new ModifierTier("of the Deathless", 75, 125, new Pair<>(1, 1)),
						new ModifierTier("of the Everlasting", 81, 125, new Pair<>(2, 2))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"MaximumResistances",
				"+#% to all Maximum Elemental Resistances");

		ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE = new Modifier(
				"armour_applies_to_elemental_damage",
				List.of("defences", "elemental"),
				List.of(
						new ModifierTier("of Covering", 1, 500, new Pair<>(14, 19)),
						new ModifierTier("of Sheathing", 16, 500, new Pair<>(20, 25)),
						new ModifierTier("of Lining", 36, 500, new Pair<>(26, 31)),
						new ModifierTier("of Padding", 48, 500, new Pair<>(32, 37)),
						new ModifierTier("of Furring", 66, 500, new Pair<>(38, 43)),
						new ModifierTier("of Thermokryptance", 81, 500, new Pair<>(44, 50))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ArmourAppliesToElementalDamage",
				"+#% of Armour also applies to Elemental Damage");

		EVASION_APPLIES_TO_DEFLECTION = new Modifier(
				"evasion_applies_to_deflection",
				List.of("defences"),
				List.of(
						new ModifierTier("of Deflecting", 1, 500, new Pair<>(8, 11)),
						new ModifierTier("of Bending", 16, 500, new Pair<>(12, 14)),
						new ModifierTier("of Curvation", 36, 500, new Pair<>(15, 17)),
						new ModifierTier("of Diversion", 48, 500, new Pair<>(18, 20)),
						new ModifierTier("of Flexure", 66, 500, new Pair<>(21, 23)),
						new ModifierTier("of Warping", 81, 500, new Pair<>(24, 26))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"EvasionAppliesToDeflection",
				"Gain Deflection Rating equal to #% of Evasion Rating");

		ENERGY_SHIELD_RECHARGE_RATE = new Modifier(
				"energy_shield_recharge_rate",
				List.of("defences"),
				List.of(
						new ModifierTier("of Enlivening", 1, 500, new Pair<>(26, 30)),
						new ModifierTier("of Diffusion", 16, 500, new Pair<>(31, 35)),
						new ModifierTier("of Dispersal", 36, 500, new Pair<>(36, 40)),
						new ModifierTier("of Buffering", 48, 500, new Pair<>(41, 45)),
						new ModifierTier("of Ardour", 66, 500, new Pair<>(46, 50)),
						new ModifierTier("of Suffusion", 81, 500, new Pair<>(51, 55))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"EnergyShieldRegeneration",
				"#% increased Energy Shield Recharge Rate");

	}
}
