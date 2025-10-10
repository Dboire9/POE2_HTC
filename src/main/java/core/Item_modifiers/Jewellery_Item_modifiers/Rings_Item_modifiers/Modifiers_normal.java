package core.Item_modifiers.Jewellery_Item_modifiers.Rings_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier BASE_MAXIMUM_LIFE;
	public static final Modifier BASE_MAXIMUM_MANA;
	public static final Modifier BASE_EVASION;
	public static final Modifier PHYSICAL_DAMAGE_FLAT;
	public static final Modifier FIRE_DAMAGE_FLAT;
	public static final Modifier COLD_DAMAGE_FLAT;
	public static final Modifier LIGHTNING_DAMAGE_FLAT;
	public static final Modifier ACCURACY_RATING;
	public static final Modifier ITEM_FOUND_RARITY_INCREASE_PREFIX;
	public static final Modifier INCREASED_FIRE_DAMAGE;
	public static final Modifier INCREASED_COLD_DAMAGE;
	public static final Modifier INCREASED_LIGHTNING_DAMAGE;
	public static final Modifier INCREASED_CHAOS_DAMAGE;

	// SUFFIXES
	public static final Modifier STRENGTH;
	public static final Modifier DEXTERITY;
	public static final Modifier INTELLIGENCE;
	public static final Modifier ALL_ATTRIBUTES;
	public static final Modifier FIRE_RESISTANCE;
	public static final Modifier COLD_RESISTANCE;
	public static final Modifier LIGHTNING_RESISTANCE;
	public static final Modifier ALL_RESISTANCES;
	public static final Modifier CHAOS_RESISTANCE;
	public static final Modifier LIFE_REGENERATION_PER_SECOND;
	public static final Modifier MANA_REGENERATION_RATE;
	public static final Modifier LIFE_LEECH;
	public static final Modifier MANA_LEECH;
	public static final Modifier LIFE_PER_ENEMY_KILLED;
	public static final Modifier MANA_PER_ENEMY_KILLED;
	public static final Modifier INCREASED_CAST_SPEED;
	public static final Modifier ITEM_FOUND_RARITY_INCREASE;
	public static final Modifier HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS;

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
						new ModifierTier("Virile", 54, 1000, new Pair<>(100, 119))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedLife",
				"+# to maximum Life");

		BASE_MAXIMUM_MANA = new Modifier(
				"base_maximum_mana",
				List.of("mana"),
				List.of(
						new ModifierTier("Beryl", 1, 1000, new Pair<>(10, 14)),
						new ModifierTier("Cobalt", 6, 1000, new Pair<>(15, 24)),
						new ModifierTier("Azure", 16, 1000, new Pair<>(25, 34)),
						new ModifierTier("Teal", 25, 1000, new Pair<>(35, 54)),
						new ModifierTier("Cerulean", 33, 1000, new Pair<>(55, 64)),
						new ModifierTier("Aqua", 38, 1000, new Pair<>(65, 79)),
						new ModifierTier("Opalescent", 46, 1000, new Pair<>(80, 89)),
						new ModifierTier("Gentian", 54, 1000, new Pair<>(90, 104)),
						new ModifierTier("Chalybeous", 60, 1000, new Pair<>(105, 124)),
						new ModifierTier("Mazarine", 65, 1000, new Pair<>(125, 149)),
						new ModifierTier("Blue", 70, 1000, new Pair<>(150, 164)),
						new ModifierTier("Zaffre", 75, 1000, new Pair<>(165, 180))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedMana",
				"+# to maximum Mana");

		BASE_EVASION = new Modifier(
				"base_evasion",
				List.of("defences"),
				List.of(
						new ModifierTier("Agile", 1, 1000, new Pair<>(8, 15)),
						new ModifierTier("Dancer's", 11, 1000, new Pair<>(16, 33)),
						new ModifierTier("Acrobat's", 16, 1000, new Pair<>(34, 44)),
						new ModifierTier("Fleet", 25, 1000, new Pair<>(45, 69)),
						new ModifierTier("Blurred", 33, 1000, new Pair<>(70, 93)),
						new ModifierTier("Phased", 46, 1000, new Pair<>(94, 123)),
						new ModifierTier("Vaporous", 54, 1000, new Pair<>(124, 151)),
						new ModifierTier("Elusory", 65, 1000, new Pair<>(152, 176)),
						new ModifierTier("Adroit", 70, 1000, new Pair<>(177, 203))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedEvasionRating",
				"+# to Evasion Rating");

		PHYSICAL_DAMAGE_FLAT = new Modifier(
				"physical_damage_flat",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Glinting", 1, 1000, new Pair<>(1, 2), new Pair<>(3, 3), "", ""),
						new ModifierTier("Burnished", 8, 1000, new Pair<>(2, 3), new Pair<>(4, 6), "", ""),
						new ModifierTier("Polished", 16, 1000, new Pair<>(2, 4), new Pair<>(5, 8), "", ""),
						new ModifierTier("Honed", 33, 1000, new Pair<>(4, 6), new Pair<>(8, 11), "", ""),
						new ModifierTier("Gleaming", 46, 1000, new Pair<>(5, 7), new Pair<>(9, 13), "", ""),
						new ModifierTier("Annealed", 54, 1000, new Pair<>(6, 10), new Pair<>(12, 17), "", ""),
						new ModifierTier("Razor-sharp", 60, 800, new Pair<>(7, 11), new Pair<>(14, 20), "", ""),
						new ModifierTier("Tempered", 65, 600, new Pair<>(10, 15), new Pair<>(18, 26), "", ""),
						new ModifierTier("Flaring", 75, 400, new Pair<>(12, 19), new Pair<>(22, 32), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"PhysicalDamage",
				"Adds # to # Physical Damage to Attacks");

		FIRE_DAMAGE_FLAT = new Modifier(
				"fire_damage_flat",
				List.of("damage", "elemental", "fire", "attack"),
				List.of(
						new ModifierTier("Heated", 1, 500, new Pair<>(1, 2), new Pair<>(3, 3), "", ""),
						new ModifierTier("Smouldering", 8, 500, new Pair<>(3, 5), new Pair<>(6, 9), "", ""),
						new ModifierTier("Smoking", 16, 500, new Pair<>(6, 8), new Pair<>(10, 13), "", ""),
						new ModifierTier("Burning", 33, 500, new Pair<>(9, 11), new Pair<>(14, 17), "", ""),
						new ModifierTier("Flaming", 46, 500, new Pair<>(12, 13), new Pair<>(18, 20), "", ""),
						new ModifierTier("Scorching", 54, 500, new Pair<>(11, 16), new Pair<>(21, 26), "", ""),
						new ModifierTier("Incinerating", 60, 400, new Pair<>(13, 19), new Pair<>(27, 32), "", ""),
						new ModifierTier("Blasting", 65, 300, new Pair<>(20, 24), new Pair<>(33, 36), "", ""),
						new ModifierTier("Cremating", 75, 200, new Pair<>(25, 29), new Pair<>(37, 45), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"FireDamage",
				"Adds # to # Fire Damage to Attacks");

		COLD_DAMAGE_FLAT = new Modifier(
				"cold_damage_flat",
				List.of("damage", "elemental", "cold", "attack"),
				List.of(
						new ModifierTier("Frosted", 1, 500, new Pair<>(1, 1), new Pair<>(2, 3), "", ""),
						new ModifierTier("Chilled", 8, 500, new Pair<>(3, 4), new Pair<>(5, 8), "", ""),
						new ModifierTier("Icy", 16, 500, new Pair<>(5, 6), new Pair<>(9, 11), "", ""),
						new ModifierTier("Frigid", 33, 500, new Pair<>(7, 8), new Pair<>(12, 14), "", ""),
						new ModifierTier("Freezing", 46, 500, new Pair<>(9, 10), new Pair<>(15, 17), "", ""),
						new ModifierTier("Frozen", 54, 500, new Pair<>(11, 13), new Pair<>(18, 21), "", ""),
						new ModifierTier("Glaciated", 60, 400, new Pair<>(14, 15), new Pair<>(22, 24), "", ""),
						new ModifierTier("Polar", 65, 300, new Pair<>(16, 20), new Pair<>(25, 31), "", ""),
						new ModifierTier("Entombing", 75, 200, new Pair<>(21, 24), new Pair<>(32, 37), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"ColdDamage",
				"Adds # to # Cold Damage to Attacks");

		LIGHTNING_DAMAGE_FLAT = new Modifier(
				"lightning_damage_flat",
				List.of("damage", "elemental", "lightning", "attack"),
				List.of(
						new ModifierTier("Humming", 1, 500, new Pair<>(1, 1), new Pair<>(4, 6), "", ""),
						new ModifierTier("Buzzing", 8, 500, new Pair<>(1, 1), new Pair<>(10, 15), "", ""),
						new ModifierTier("Snapping", 16, 500, new Pair<>(1, 1), new Pair<>(16, 22), "", ""),
						new ModifierTier("Crackling", 33, 500, new Pair<>(1, 1), new Pair<>(23, 27), "", ""),
						new ModifierTier("Sparking", 46, 500, new Pair<>(1, 1), new Pair<>(28, 32), "", ""),
						new ModifierTier("Arcing", 54, 500, new Pair<>(1, 2), new Pair<>(33, 40), "", ""),
						new ModifierTier("Shocking", 60, 400, new Pair<>(1, 2), new Pair<>(41, 47), "", ""),
						new ModifierTier("Discharging", 65, 300, new Pair<>(1, 3), new Pair<>(48, 59), "", ""),
						new ModifierTier("Electrocuting", 75, 200, new Pair<>(1, 4), new Pair<>(60, 71), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"LightningDamage",
				"Adds # to # Lightning Damage to Attacks");

		ACCURACY_RATING = new Modifier(
				"accuracy_rating",
				List.of("attack"),
				List.of(
						new ModifierTier("Precise", 1, 800, new Pair<>(11, 32)),
						new ModifierTier("Reliable", 11, 800, new Pair<>(33, 60)),
						new ModifierTier("Focused", 18, 800, new Pair<>(61, 84)),
						new ModifierTier("Deliberate", 26, 800, new Pair<>(85, 123)),
						new ModifierTier("Consistent", 36, 800, new Pair<>(124, 167)),
						new ModifierTier("Steady", 48, 800, new Pair<>(168, 236)),
						new ModifierTier("Hunter's", 58, 800, new Pair<>(237, 346)),
						new ModifierTier("Ranger's", 67, 400, new Pair<>(347, 450))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedAccuracy",
				"+# to Accuracy Rating");

		ITEM_FOUND_RARITY_INCREASE_PREFIX = new Modifier(
				"increased_rarity_of_items_found",
				List.of("rarity"),
				List.of(
						new ModifierTier("Magpie's", 10, 1000, new Pair<>(8, 11)),
						new ModifierTier("Collector's", 29, 1000, new Pair<>(12, 15)),
						new ModifierTier("Hoarder's", 47, 1000, new Pair<>(16, 19)),
						new ModifierTier("Pirate's", 65, 1000, new Pair<>(20, 22)),
						new ModifierTier("Dragon's", 81, 1000, new Pair<>(23, 25))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"ItemFoundRarityIncreasePrefix",
				"(#)% increased Rarity of Items found");

		INCREASED_FIRE_DAMAGE = new Modifier(
				"increased_fire_damage",
				List.of("damage", "elemental", "fire"),
				List.of(
						new ModifierTier("Searing", 8, 500, new Pair<>(3, 7)),
						new ModifierTier("Sizzling", 16, 500, new Pair<>(8, 12)),
						new ModifierTier("Blistering", 33, 500, new Pair<>(13, 17)),
						new ModifierTier("Cauterising", 46, 500, new Pair<>(18, 22)),
						new ModifierTier("Volcanic", 65, 500, new Pair<>(23, 26)),
						new ModifierTier("Magmatic", 75, 500, new Pair<>(27, 30))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"FireDamagePercentage",
				"+#% increased Fire Damage");

		INCREASED_COLD_DAMAGE = new Modifier(
				"increased_cold_damage",
				List.of("damage", "elemental", "cold"),
				List.of(
						new ModifierTier("Bitter", 8, 500, new Pair<>(3, 7)),
						new ModifierTier("Biting", 16, 500, new Pair<>(8, 12)),
						new ModifierTier("Alpine", 33, 500, new Pair<>(13, 17)),
						new ModifierTier("Snowy", 46, 500, new Pair<>(18, 22)),
						new ModifierTier("Hailing", 65, 500, new Pair<>(23, 26)),
						new ModifierTier("Crystalline", 75, 500, new Pair<>(27, 30))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"ColdDamagePercentage",
				"+#% increased Cold Damage");

		INCREASED_LIGHTNING_DAMAGE = new Modifier(
				"increased_lightning_damage",
				List.of("damage", "elemental", "lightning"),
				List.of(
						new ModifierTier("Charged", 8, 500, new Pair<>(3, 7)),
						new ModifierTier("Hissing", 16, 500, new Pair<>(8, 12)),
						new ModifierTier("Bolting", 33, 500, new Pair<>(13, 17)),
						new ModifierTier("Coursing", 46, 500, new Pair<>(18, 22)),
						new ModifierTier("Striking", 65, 500, new Pair<>(23, 26)),
						new ModifierTier("Smiting", 75, 500, new Pair<>(27, 30))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"LightningDamagePercentage",
				"+#% increased Lightning Damage");

		INCREASED_CHAOS_DAMAGE = new Modifier(
				"increased_chaos_damage",
				List.of("damage", "chaos"),
				List.of(
						new ModifierTier("Impure", 8, 500, new Pair<>(3, 7)),
						new ModifierTier("Tainted", 16, 500, new Pair<>(8, 12)),
						new ModifierTier("Clouded", 33, 500, new Pair<>(13, 17)),
						new ModifierTier("Darkened", 46, 500, new Pair<>(18, 22)),
						new ModifierTier("Malignant", 65, 500, new Pair<>(23, 26)),
						new ModifierTier("Vile", 75, 500, new Pair<>(27, 30))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"IncreasedChaosDamage",
				"+#% increased Chaos Damage");

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
						new ModifierTier("of the Phantom", 74, 1000, new Pair<>(31, 33)),
						new ModifierTier("of the Wind", 81, 1000, new Pair<>(34, 36))),
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

		ALL_ATTRIBUTES = new Modifier(
				"all_attributes",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Clouds", 1, 400, new Pair<>(2, 4), new Pair<>(2, 4), new Pair<>(2, 4),
								"strength", "dexterity", "intelligence"),
						new ModifierTier("of the Sky", 11, 400, new Pair<>(5, 7), new Pair<>(5, 7), new Pair<>(5, 7),
								"strength", "dexterity", "intelligence"),
						new ModifierTier("of the Meteor", 22, 400, new Pair<>(8, 10), new Pair<>(8, 10),
								new Pair<>(8, 10), "strength", "dexterity", "intelligence"),
						new ModifierTier("of the Comet", 33, 400, new Pair<>(11, 13), new Pair<>(11, 13),
								new Pair<>(11, 13), "strength", "dexterity", "intelligence")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"AllAttributes",
				"+# to all Attributes");

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

		ALL_RESISTANCES = new Modifier(
				"all_resistances",
				List.of("elemental", "fire", "cold", "lightning", "resistance"),
				List.of(
						new ModifierTier("of the Crystal", 12, 800, new Pair<>(3, 5), new Pair<>(3, 5),
								new Pair<>(3, 5), "fire_resistance", "cold_resistance", "lightning_resistance"),
						new ModifierTier("of the Prism", 26, 800, new Pair<>(6, 8), new Pair<>(6, 8), new Pair<>(6, 8),
								"fire_resistance", "cold_resistance", "lightning_resistance"),
						new ModifierTier("of the Kaleidoscope", 40, 800, new Pair<>(9, 11), new Pair<>(9, 11),
								new Pair<>(9, 11), "fire_resistance", "cold_resistance", "lightning_resistance"),
						new ModifierTier("of Variegation", 54, 800, new Pair<>(12, 14), new Pair<>(12, 14),
								new Pair<>(12, 14), "fire_resistance", "cold_resistance", "lightning_resistance"),
						new ModifierTier("of the Rainbow", 68, 800, new Pair<>(15, 16), new Pair<>(15, 16),
								new Pair<>(15, 16), "fire_resistance", "cold_resistance", "lightning_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"AllResistances",
				"+#% to all Elemental Resistances");

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
						new ModifierTier("of Convalescence", 47, 1000, new Pair<>(13.1, 18.0))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LifeRegeneration",
				"(#) Life Regeneration per second");

		MANA_REGENERATION_RATE = new Modifier(
				"mana_regeneration_rate",
				List.of("mana"),
				List.of(
						new ModifierTier("of Excitement", 1, 1000, new Pair<>(10, 19)),
						new ModifierTier("of Joy", 18, 1000, new Pair<>(20, 29)),
						new ModifierTier("of Elation", 29, 1000, new Pair<>(30, 39)),
						new ModifierTier("of Bliss", 42, 1000, new Pair<>(40, 49)),
						new ModifierTier("of Euphoria", 55, 1000, new Pair<>(50, 59)),
						new ModifierTier("of Nirvana", 79, 1000, new Pair<>(60, 69))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"ManaRegeneration",
				"#% increased Mana Regeneration Rate");

		LIFE_LEECH = new Modifier(
				"life_leech",
				List.of("life", "physical", "attack"),
				List.of(
						new ModifierTier("of the Parasite", 21, 1000, new Pair<>(5.0, 5.9)),
						new ModifierTier("of the Locust", 38, 1000, new Pair<>(6.0, 6.9)),
						new ModifierTier("of the Remora", 54, 1000, new Pair<>(7.0, 7.9))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LifeLeech",
				"Leeches #% of Physical Damage as Life");

		MANA_LEECH = new Modifier(
				"mana_leech",
				List.of("mana", "physical", "attack"),
				List.of(
						new ModifierTier("of the Thirsty", 21, 1000, new Pair<>(4.0, 4.9)),
						new ModifierTier("of the Parched", 38, 1000, new Pair<>(5.0, 5.9)),
						new ModifierTier("of the Arid", 54, 1000, new Pair<>(6.0, 6.9))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ManaLeech",
				"Leeches #% of Physical Damage as Mana");

		LIFE_PER_ENEMY_KILLED = new Modifier(
				"life_per_enemy_killed",
				List.of("life"),
				List.of(
						new ModifierTier("of Success", 1, 750, new Pair<>(4, 6)),
						new ModifierTier("of Victory", 11, 750, new Pair<>(7, 9)),
						new ModifierTier("of Triumph", 22, 750, new Pair<>(10, 18)),
						new ModifierTier("of Conquest", 33, 750, new Pair<>(19, 28)),
						new ModifierTier("of Vanquishing", 44, 750, new Pair<>(29, 40)),
						new ModifierTier("of Valour", 55, 750, new Pair<>(41, 53))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LifeGainedFromEnemyDeath",
				"Gain # Life per Enemy Killed");

		MANA_PER_ENEMY_KILLED = new Modifier(
				"mana_per_enemy_killed",
				List.of("mana"),
				List.of(
						new ModifierTier("of Absorption", 1, 750, new Pair<>(2, 3)),
						new ModifierTier("of Osmosis", 12, 750, new Pair<>(4, 5)),
						new ModifierTier("of Infusion", 23, 750, new Pair<>(6, 9)),
						new ModifierTier("of Enveloping", 34, 750, new Pair<>(10, 14)),
						new ModifierTier("of Consumption", 45, 750, new Pair<>(15, 20)),
						new ModifierTier("of Siphoning", 56, 750, new Pair<>(21, 27))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ManaGainedFromEnemyDeath",
				"Gain # Mana per Enemy Killed");

		INCREASED_CAST_SPEED = new Modifier(
				"increased_cast_speed",
				List.of("caster", "speed"),
				List.of(
						new ModifierTier("of Talent", 1, 1000, new Pair<>(9, 12)),
						new ModifierTier("of Nimbleness", 15, 1000, new Pair<>(13, 16)),
						new ModifierTier("of Expertise", 30, 1000, new Pair<>(17, 20)),
						new ModifierTier("of Sortilege", 45, 1000, new Pair<>(21, 24))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreasedCastSpeed",
				"#% increased Cast Speed");

		ITEM_FOUND_RARITY_INCREASE = new Modifier(
				"item_found_rarity_increase",
				List.of(),
				List.of(
						new ModifierTier("of Plunder", 3, 1000, new Pair<>(6, 10)),
						new ModifierTier("of Raiding", 24, 1000, new Pair<>(11, 14)),
						new ModifierTier("of Archaeology", 40, 1000, new Pair<>(15, 18)),
						new ModifierTier("of Excavation", 63, 1000, new Pair<>(19, 21)),
						new ModifierTier("of Windfall", 75, 1000, new Pair<>(22, 25))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ItemFoundRarityIncrease",
				"#% increased Rarity of Items found");

		HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS = new Modifier(
				"mana_regeneration_rate", "light_radius",
				List.of("mana"),
				List.of(
						new ModifierTier("of Warmth", 8, 1000, new Pair<>(8, 12), new Pair<>(5, 5),
								"mana_regeneration_rate", "light_radius"),
						new ModifierTier("of Kindling", 15, 1000, new Pair<>(13, 17), new Pair<>(10, 10),
								"mana_regeneration_rate", "light_radius"),
						new ModifierTier("of the Hearth", 30, 1000, new Pair<>(18, 22), new Pair<>(15, 15),
								"mana_regeneration_rate", "light_radius")),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"ManaRegeneration",
				"#% increased Mana Regeneration Rate / #%Light Radius");
	}
}