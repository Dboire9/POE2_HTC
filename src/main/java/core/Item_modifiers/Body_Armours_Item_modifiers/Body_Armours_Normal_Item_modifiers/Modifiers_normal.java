package core.Item_modifiers.Body_Armours_Item_modifiers.Body_Armours_Normal_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier BASE_MAXIMUM_LIFE;
	public static final Modifier BASE_ARMOUR;
	public static final Modifier BASE_EVASION;
	public static final Modifier BASE_ENERGY_SHIELD;
	public static final Modifier INCREASED_PERCENT_ARMOUR;
	public static final Modifier INCREASED_PERCENT_EVASION;
	public static final Modifier INCREASED_PERCENT_ENERGY_SHIELD;
	public static final Modifier HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE;
	public static final Modifier HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE;
	public static final Modifier HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE;
	public static final Modifier HYBRID_BASE_AND_PERCENT_ARMOUR;
	public static final Modifier HYBRID_BASE_AND_PERCENT_EVASION;
	public static final Modifier HYBRID_BASE_AND_PERCENT_ENERGY_SHIELD;
	public static final Modifier PHYSICAL_THORNS_DAMAGE;
	public static final Modifier BASE_SPIRIT;

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
	public static final Modifier LIFE_REGENERATION_PER_SECOND;
	public static final Modifier REDUCED_BLEEDING_DURATION_ON_SELF;
	public static final Modifier REDUCED_POISON_DURATION_ON_SELF;
	public static final Modifier REDUCED_IGNITE_DURATION_ON_SELF;
	public static final Modifier ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE;
	public static final Modifier EVASION_APPLIES_TO_DEFLECTION;
	public static final Modifier ENERGY_SHIELD_FASTER_START_RECHARGE;

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
						new ModifierTier("Vigorous", 70, 1000, new Pair<>(175, 189)),
						new ModifierTier("Rapturous", 75, 1000, new Pair<>(190, 199)),
						new ModifierTier("Prime", 80, 1000, new Pair<>(200, 214))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedLife",
				"+# to maximum Life");

		BASE_ARMOUR = new Modifier(
				"base_armour",
				List.of("defences"),
				List.of(
						new ModifierTier("Lacquered", 1, 1000, new Pair<>(16, 27)),
						new ModifierTier("Studded", 8, 1000, new Pair<>(28, 50)),
						new ModifierTier("Ribbed", 16, 1000, new Pair<>(51, 68)),
						new ModifierTier("Fortified", 25, 1000, new Pair<>(69, 82)),
						new ModifierTier("Plated", 33, 1000, new Pair<>(83, 102)),
						new ModifierTier("Carapaced", 46, 1000, new Pair<>(103, 122)),
						new ModifierTier("Encased", 54, 1000, new Pair<>(123, 160)),
						new ModifierTier("Enveloped", 60, 1000, new Pair<>(161, 202)),
						new ModifierTier("Abating", 65, 1000, new Pair<>(203, 225)),
						new ModifierTier("Unmoving", 75, 1000, new Pair<>(226, 256)),
						new ModifierTier("Impervious", 79, 1000, new Pair<>(257, 276))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefences",
				"+# to Armour");

		BASE_EVASION = new Modifier(
				"base_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Agile", 1, 1000, new Pair<>(11, 18)),
						new ModifierTier("Dancer's", 8, 1000, new Pair<>(19, 39)),
						new ModifierTier("Acrobat's", 16, 1000, new Pair<>(40, 56)),
						new ModifierTier("Fleet", 25, 1000, new Pair<>(57, 70)),
						new ModifierTier("Blurred", 33, 1000, new Pair<>(71, 88)),
						new ModifierTier("Phased", 46, 1000, new Pair<>(89, 107)),
						new ModifierTier("Vaporous", 54, 1000, new Pair<>(108, 142)),
						new ModifierTier("Elusory", 60, 1000, new Pair<>(143, 181)),
						new ModifierTier("Adroit", 65, 1000, new Pair<>(182, 204)),
						new ModifierTier("Lissome", 75, 1000, new Pair<>(205, 232)),
						new ModifierTier("Fugitive", 79, 1000, new Pair<>(233, 251))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefences",
				"+# to Evasion Rating");

		BASE_ENERGY_SHIELD = new Modifier(
				"base_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Shining", 1, 1000, new Pair<>(10, 17)),
						new ModifierTier("Glimmering", 8, 1000, new Pair<>(18, 24)),
						new ModifierTier("Glittering", 16, 1000, new Pair<>(25, 30)),
						new ModifierTier("Glowing", 25, 1000, new Pair<>(31, 35)),
						new ModifierTier("Radiating", 33, 1000, new Pair<>(36, 41)),
						new ModifierTier("Pulsing", 46, 1000, new Pair<>(42, 47)),
						new ModifierTier("Blazing", 54, 1000, new Pair<>(48, 60)),
						new ModifierTier("Dazzling", 60, 1000, new Pair<>(61, 73)),
						new ModifierTier("Scintillating", 65, 1000, new Pair<>(74, 80)),
						new ModifierTier("Incandescent", 70, 1000, new Pair<>(81, 90)),
						new ModifierTier("Resplendent", 79, 1000, new Pair<>(91, 96))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefences",
				"+# to maximum Energy Shield");

		INCREASED_PERCENT_ARMOUR = new Modifier(
				"increased_percent_armour",
				List.of("defences"),
				List.of(
						new ModifierTier("Reinforced", 2, 1000, new Pair<>(15, 26)),
						new ModifierTier("Layered", 16, 1000, new Pair<>(27, 42)),
						new ModifierTier("Lobstered", 35, 1000, new Pair<>(43, 55)),
						new ModifierTier("Buttressed", 46, 1000, new Pair<>(56, 67)),
						new ModifierTier("Thickened", 54, 1000, new Pair<>(68, 79)),
						new ModifierTier("Girded", 60, 1000, new Pair<>(80, 91)),
						new ModifierTier("Impregnable", 65, 1000, new Pair<>(92, 100)),
						new ModifierTier("Impenetrable", 75, 1000, new Pair<>(101, 110))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercent",
				"#% increased Armour");

		INCREASED_PERCENT_EVASION = new Modifier(
				"increased_percent_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Shade's", 2, 1000, new Pair<>(15, 26)),
						new ModifierTier("Ghost's", 16, 1000, new Pair<>(27, 42)),
						new ModifierTier("Spectre's", 33, 1000, new Pair<>(43, 55)),
						new ModifierTier("Wraith's", 46, 1000, new Pair<>(56, 67)),
						new ModifierTier("Phantasm's", 54, 1000, new Pair<>(68, 79)),
						new ModifierTier("Nightmare's", 60, 1000, new Pair<>(80, 91)),
						new ModifierTier("Mirage's", 65, 1000, new Pair<>(92, 100)),
						new ModifierTier("Illusion's", 75, 1000, new Pair<>(101, 110))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercent",
				"#% increased Evasion Rating");

		INCREASED_PERCENT_ENERGY_SHIELD = new Modifier(
				"increased_percent_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Protective", 2, 1000, new Pair<>(15, 26)),
						new ModifierTier("Strong-Willed", 16, 1000, new Pair<>(27, 42)),
						new ModifierTier("Resolute", 33, 1000, new Pair<>(43, 55)),
						new ModifierTier("Fearless", 46, 1000, new Pair<>(56, 67)),
						new ModifierTier("Dauntless", 54, 1000, new Pair<>(68, 79)),
						new ModifierTier("Indomitable", 60, 1000, new Pair<>(80, 91)),
						new ModifierTier("Unassailable", 65, 1000, new Pair<>(92, 100)),
						new ModifierTier("Unfaltering", 75, 1000, new Pair<>(101, 110))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"DefencesPercent",
				"#% increased Energy Shield");

		HYBRID_INCREASED_PERCENT_ARMOUR_AND_LIFE = new Modifier(
				"increased_percent_armour", "base_maximum_life",
				List.of("defences", "life"),
				List.of(
						new ModifierTier("Oyster's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10),
								"increased_percent_armour", "base_maximum_life"),
						new ModifierTier("Lobster's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19),
								"increased_percent_armour", "base_maximum_life"),
						new ModifierTier("Urchin's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25),
								"increased_percent_armour", "base_maximum_life"),
						new ModifierTier("Nautilus'", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32),
								"increased_percent_armour", "base_maximum_life"),
						new ModifierTier("Octopus'", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41),
								"increased_percent_armour", "base_maximum_life"),
						new ModifierTier("Crocodile's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49),
								"increased_percent_armour", "base_maximum_life")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndLife",
				"#% increased Armour\n+# to maximum Life");

		HYBRID_INCREASED_PERCENT_EVASION_AND_LIFE = new Modifier(
				"increased_percent_evasion", "base_maximum_life",
				List.of("defences", "life"),
				List.of(
						new ModifierTier("Flea's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10),
								"increased_percent_evasion", "base_maximum_life"),
						new ModifierTier("Fawn's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19),
								"increased_percent_evasion", "base_maximum_life"),
						new ModifierTier("Mouflon's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25),
								"increased_percent_evasion", "base_maximum_life"),
						new ModifierTier("Ram's", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32),
								"increased_percent_evasion", "base_maximum_life"),
						new ModifierTier("Ibex's", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41),
								"increased_percent_evasion", "base_maximum_life"),
						new ModifierTier("Stag's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49),
								"increased_percent_evasion", "base_maximum_life")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndLife",
				"#% increased Evasion Rating\n+# to maximum Life");

		HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_LIFE = new Modifier(
				"increased_percent_energy_shield", "base_life",
				List.of("life", "defences"),
				List.of(
						new ModifierTier("Monk's", 8, 1000, new Pair<>(6, 13), new Pair<>(7, 10),
								"increased_percent_energy_shield", "base_life"),
						new ModifierTier("Prior's", 16, 1000, new Pair<>(14, 20), new Pair<>(11, 19),
								"increased_percent_energy_shield", "base_life"),
						new ModifierTier("Abbot's", 33, 1000, new Pair<>(21, 26), new Pair<>(20, 25),
								"increased_percent_energy_shield", "base_life"),
						new ModifierTier("Bishop's", 46, 1000, new Pair<>(27, 32), new Pair<>(26, 32),
								"increased_percent_energy_shield", "base_life"),
						new ModifierTier("Exarch's", 60, 1000, new Pair<>(33, 38), new Pair<>(33, 41),
								"increased_percent_energy_shield", "base_life"),
						new ModifierTier("Pope's", 78, 1000, new Pair<>(39, 42), new Pair<>(42, 49),
								"increased_percent_energy_shield", "base_life")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndLife",
				"#% increased Energy Shield\n+# to maximum Life");

		HYBRID_BASE_AND_PERCENT_ARMOUR = new Modifier(
				"base_armour", "increased_percent_armour",
				List.of("defences"),
				List.of(
						new ModifierTier("Abalone's", 8, 1000, new Pair<>(7, 11), new Pair<>(6, 13), "base_armour",
								"increased_percent_armour"),
						new ModifierTier("Snail's", 16, 1000, new Pair<>(12, 29), new Pair<>(14, 20), "base_armour",
								"increased_percent_armour"),
						new ModifierTier("Tortoise's", 33, 1000, new Pair<>(30, 39), new Pair<>(21, 26), "base_armour",
								"increased_percent_armour"),
						new ModifierTier("Pangolin's", 46, 1000, new Pair<>(40, 53), new Pair<>(27, 32), "base_armour",
								"increased_percent_armour"),
						new ModifierTier("Shelled", 60, 1000, new Pair<>(54, 69), new Pair<>(33, 38), "base_armour",
								"increased_percent_armour"),
						new ModifierTier("Hardened", 78, 1000, new Pair<>(70, 86), new Pair<>(39, 42), "base_armour",
								"increased_percent_armour")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndDefencePercent",
				"+# to Armour\n#% increased Armour");

		HYBRID_BASE_AND_PERCENT_EVASION = new Modifier(
				"base_evasion", "increased_percent_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Impala's", 8, 1000, new Pair<>(5, 8), new Pair<>(6, 13), "base_evasion",
								"increased_percent_evasion"),
						new ModifierTier("Buck's", 16, 1000, new Pair<>(9, 24), new Pair<>(14, 20), "base_evasion",
								"increased_percent_evasion"),
						new ModifierTier("Moose's", 33, 1000, new Pair<>(25, 34), new Pair<>(21, 26), "base_evasion",
								"increased_percent_evasion"),
						new ModifierTier("Deer's", 46, 1000, new Pair<>(35, 47), new Pair<>(27, 32), "base_evasion",
								"increased_percent_evasion"),
						new ModifierTier("Caribou's", 60, 1000, new Pair<>(48, 62), new Pair<>(33, 38), "base_evasion",
								"increased_percent_evasion"),
						new ModifierTier("Antelope's", 78, 1000, new Pair<>(63, 79), new Pair<>(39, 42), "base_evasion",
								"increased_percent_evasion")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndDefencePercent",
				"+# to Evasion Rating\n#% increased Evasion Rating");

		HYBRID_BASE_AND_PERCENT_ENERGY_SHIELD = new Modifier(
				"base_energy_shield", "increased_percent_energy_shield",
				List.of("defences"),
				List.of(
						new ModifierTier("Deacon's", 8, 1000, new Pair<>(4, 7), new Pair<>(6, 13), "base_energy_shield",
								"increased_percent_energy_shield"),
						new ModifierTier("Cardinal's", 16, 1000, new Pair<>(8, 13), new Pair<>(14, 20),
								"base_energy_shield", "increased_percent_energy_shield"),
						new ModifierTier("Priest's", 33, 1000, new Pair<>(14, 16), new Pair<>(21, 26),
								"base_energy_shield", "increased_percent_energy_shield"),
						new ModifierTier("High Priest's", 46, 1000, new Pair<>(17, 20), new Pair<>(27, 32),
								"base_energy_shield", "increased_percent_energy_shield"),
						new ModifierTier("Archon's", 60, 1000, new Pair<>(21, 25), new Pair<>(33, 38),
								"base_energy_shield", "increased_percent_energy_shield"),
						new ModifierTier("Divine", 78, 1000, new Pair<>(26, 30), new Pair<>(39, 42),
								"base_energy_shield", "increased_percent_energy_shield")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"BaseLocalDefencesAndDefencePercent",
				"+# to maximum Energy Shield\n#% increased Energy Shield");

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

		BASE_SPIRIT = new Modifier(
				"base_spirit",
				List.of(""),
				List.of(
						new ModifierTier("Lady's", 16, 500, new Pair<>(30, 33)),
						new ModifierTier("Baronness'", 25, 500, new Pair<>(34, 37)),
						new ModifierTier("Viscountess'", 33, 500, new Pair<>(38, 42)),
						new ModifierTier("Marchioness'", 46, 500, new Pair<>(43, 46)),
						new ModifierTier("Countess'", 54, 400, new Pair<>(47, 50)),
						new ModifierTier("Duchess'", 60, 300, new Pair<>(51, 53)),
						new ModifierTier("Princess'", 65, 200, new Pair<>(54, 56)),
						new ModifierTier("Queen's", 78, 100, new Pair<>(57, 61))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"",
				"+# to Spirit");

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

		DEXTERITY = new Modifier(
				"dexterity",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Mongoose", 1, 1000, new Pair<>(5, 8)),
						new ModifierTier("of the Lynx", 11, 1000, new Pair<>(9, 12)),
						new ModifierTier("of the Fox", 22, 1000, new Pair<>(13, 16)),
						new ModifierTier("of the Falcon", 33, 1000, new Pair<>(17, 20)),
						new ModifierTier("of the Panther", 44, 1000, new Pair<>(21, 24)),
						new ModifierTier("of the Leopard", 55, 1000, new Pair<>(25, 27)),
						new ModifierTier("of the Jaguar", 66, 1000, new Pair<>(28, 30)),
						new ModifierTier("of the Phantom", 74, 1000, new Pair<>(31, 33))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"Dexterity",
				"+# to Dexterity");

		INTELLIGENCE = new Modifier(
				"intelligence",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Pupil", 1, 1000, new Pair<>(5, 8)),
						new ModifierTier("of the Student", 11, 1000, new Pair<>(9, 12)),
						new ModifierTier("of the Prodigy", 22, 1000, new Pair<>(13, 16)),
						new ModifierTier("of the Augur", 33, 1000, new Pair<>(17, 20)),
						new ModifierTier("of the Philosopher", 44, 1000, new Pair<>(21, 24)),
						new ModifierTier("of the Sage", 55, 1000, new Pair<>(25, 27)),
						new ModifierTier("of the Savant", 66, 1000, new Pair<>(28, 30)),
						new ModifierTier("of the Virtuoso", 74, 1000, new Pair<>(31, 33))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"Intelligence",
				"+# to Intelligence");

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
						new ModifierTier("of the Worthy", 24, 900, new Pair<>(15, 15)),
						new ModifierTier("of the Apt", 32, 900, new Pair<>(20, 20)),
						new ModifierTier("of the Talented", 40, 900, new Pair<>(25, 25)),
						new ModifierTier("of the Skilled", 52, 900, new Pair<>(30, 30)),
						new ModifierTier("of the Proficient", 60, 900, new Pair<>(35, 35))),
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

		LIFE_REGENERATION_PER_SECOND = new Modifier(
				"life_regeneration_per_second",
				List.of("life"),
				List.of(
						new ModifierTier("of the Newt", 1, 1000, new Pair<>(1.0, 2.0)),
						new ModifierTier("of the Lizard", 5, 1000, new Pair<>(2.1, 3.0)),
						new ModifierTier("of the Flatworm", 11, 1000, new Pair<>(3.1, 4.0)),
						new ModifierTier("of the Starfish", 17, 1000, new Pair<>(4.1, 6.0)),
						new ModifierTier("of the Hydra", 26, 1000, new Pair<>(6.1, 9.0)),
						new ModifierTier("of the Troll", 35, 1000, new Pair<>(9.1, 13.0)),
						new ModifierTier("of Convalescence", 47, 1000, new Pair<>(13.1, 18.0)),
						new ModifierTier("of Recuperation", 58, 1000, new Pair<>(18.1, 23.0)),
						new ModifierTier("of Resurgence", 68, 1000, new Pair<>(23.1, 29.0)),
						new ModifierTier("of Immortality", 75, 1000, new Pair<>(29.1, 33.0)),
						new ModifierTier("of the Phoenix", 81, 1000, new Pair<>(33.1, 36.0))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LifeRegeneration",
				"# Life Regeneration per second");

		REDUCED_BLEEDING_DURATION_ON_SELF = new Modifier(
				"reduced_bleeding_duration_on_self",
				List.of("physical", "ailment"),
				List.of(
						new ModifierTier("of Sealing", 21, 500, new Pair<>(36, 40)),
						new ModifierTier("of Alleviation", 37, 500, new Pair<>(41, 45)),
						new ModifierTier("of Allaying", 50, 500, new Pair<>(46, 50)),
						new ModifierTier("of Assuaging", 64, 500, new Pair<>(51, 55)),
						new ModifierTier("of Staunching", 76, 500, new Pair<>(56, 60))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ReducedBleedingDuration",
				"#% reduced Duration of Bleeding on You");

		REDUCED_POISON_DURATION_ON_SELF = new Modifier(
				"reduced_poison_duration_on_self",
				List.of("chaos", "ailment"),
				List.of(
						new ModifierTier("of the Antitoxin", 21, 500, new Pair<>(36, 40)),
						new ModifierTier("of the Remedy", 37, 500, new Pair<>(41, 45)),
						new ModifierTier("of the Cure", 50, 500, new Pair<>(46, 50)),
						new ModifierTier("of the Panacea", 64, 500, new Pair<>(51, 55)),
						new ModifierTier("of the Antidote", 76, 500, new Pair<>(56, 60))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ReducedPoisonDuration",
				"#% reduced Poison Duration on You");

		REDUCED_IGNITE_DURATION_ON_SELF = new Modifier(
				"reduced_ignite_duration_on_self",
				List.of("elemental", "fire", "ailment"),
				List.of(
						new ModifierTier("of Damping", 21, 500, new Pair<>(36, 40)),
						new ModifierTier("of Quashing", 37, 500, new Pair<>(41, 45)),
						new ModifierTier("of Quelling", 50, 500, new Pair<>(46, 50)),
						new ModifierTier("of Quenching", 64, 500, new Pair<>(51, 55)),
						new ModifierTier("of Dousing", 76, 500, new Pair<>(56, 60))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ReducedIgniteDuration",
				"#% reduced Ignite Duration on You");

		ARMOUR_APPLIES_TO_ELEMENTAL_DAMAGE = new Modifier(
				"armour_applies_to_elemental_damage",
				List.of("defences", "elemental"),
				List.of(
						new ModifierTier("of Covering", 1, 1000, new Pair<>(14, 19)),
						new ModifierTier("of Sheathing", 16, 1000, new Pair<>(20, 25)),
						new ModifierTier("of Lining", 36, 1000, new Pair<>(26, 31)),
						new ModifierTier("of Padding", 48, 1000, new Pair<>(32, 37)),
						new ModifierTier("of Furring", 66, 1000, new Pair<>(38, 43)),
						new ModifierTier("of Thermokryptance", 81, 1000, new Pair<>(44, 50))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ArmourAppliesToElementalDamage",
				"+#% of Armour also applies to Elemental Damage");

		EVASION_APPLIES_TO_DEFLECTION = new Modifier(
				"evasion_applies_to_deflection",
				List.of("defences"),
				List.of(
						new ModifierTier("of Deflecting", 1, 1000, new Pair<>(8, 11)),
						new ModifierTier("of Bending", 16, 1000, new Pair<>(12, 14)),
						new ModifierTier("of Curvation", 36, 1000, new Pair<>(15, 17)),
						new ModifierTier("of Diversion", 48, 1000, new Pair<>(18, 20)),
						new ModifierTier("of Flexure", 66, 1000, new Pair<>(21, 23)),
						new ModifierTier("of Warping", 81, 1000, new Pair<>(24, 26))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"EvasionAppliesToDeflection",
				"Gain Deflection Rating equal to #% of Evasion Rating");

		ENERGY_SHIELD_FASTER_START_RECHARGE = new Modifier(
				"energy_shield_faster_start_recharge",
				List.of("defences"),
				List.of(
						new ModifierTier("of Impatience", 1, 1000, new Pair<>(26, 30)),
						new ModifierTier("of Restlessness", 16, 1000, new Pair<>(31, 35)),
						new ModifierTier("of Fretfulness", 36, 1000, new Pair<>(36, 40)),
						new ModifierTier("of Motivation", 48, 1000, new Pair<>(41, 45)),
						new ModifierTier("of Excitement", 66, 1000, new Pair<>(46, 50)),
						new ModifierTier("of Anticipation", 81, 1000, new Pair<>(51, 55))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"EnergyShieldDelay",
				"#% faster start of Energy Shield Recharge");
	}
}
