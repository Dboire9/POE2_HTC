package core.Item_modifiers.OneHand_Item_modifiers.Sceptres_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier MAXIMUM_MANA;
	public static final Modifier PHYSICAL_DAMAGE_ALLIES;
	public static final Modifier FIRE_DAMAGE_ALLIES;
	public static final Modifier COLD_DAMAGE_ALLIES;
	public static final Modifier LIGHTNING_DAMAGE_ALLIES;
	public static final Modifier ALL_DAMAGE_ALLIES;
	public static final Modifier INCREASED_SPIRIT;
	public static final Modifier HYBRID_INCREASED_SPIRIT_MANA;

	// SUFFIXES
	public static final Modifier STRENGTH;
	public static final Modifier INTELLIGENCE;
	public static final Modifier ALLIES_ALL_RESISTANCES;
	public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
	public static final Modifier MINION_SKILL_LEVEL;
	public static final Modifier ALLIES_LIFE_REGENERATION;
	public static final Modifier ALLIES_INCREASED_ATTACK_SPEED;
	public static final Modifier ALLIES_INCREASED_CAST_SPEED;
	public static final Modifier ALLIES_INCREASED_CRIT_CHANCE;
	public static final Modifier ALLIES_INCREASED_CRIT_MULTIPLIER;
	public static final Modifier HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS;
	public static final Modifier INCREASED_PRESENCE_RADIUS;
	public static final Modifier MINIONS_INCREASED_LIFE;

	static {

		// PREFIXES

		MAXIMUM_MANA = new Modifier(
				"maximum_mana",
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
						new ModifierTier("Blue", 70, 1000, new Pair<>(150, 164))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"IncreasedMana",
				"+# to maximum Mana");

		PHYSICAL_DAMAGE_ALLIES = new Modifier(
				"physical_damage_allies",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Glinting", 1, 500, new Pair<>(1, 2), new Pair<>(3, 4), "", ""),
						new ModifierTier("Burnished", 8, 500, new Pair<>(2, 3), new Pair<>(4, 6), "", ""),
						new ModifierTier("Polished", 16, 500, new Pair<>(2, 4), new Pair<>(5, 8), "", ""),
						new ModifierTier("Honed", 33, 500, new Pair<>(4, 6), new Pair<>(8, 11), "", ""),
						new ModifierTier("Gleaming", 46, 500, new Pair<>(5, 7), new Pair<>(9, 13), "", ""),
						new ModifierTier("Annealed", 54, 500, new Pair<>(6, 10), new Pair<>(12, 17), "", ""),
						new ModifierTier("Razor-sharp", 60, 400, new Pair<>(7, 11), new Pair<>(14, 20), "", ""),
						new ModifierTier("Tempered", 65, 300, new Pair<>(10, 15), new Pair<>(18, 26), "", ""),
						new ModifierTier("Flaring", 75, 200, new Pair<>(12, 19), new Pair<>(22, 32), "", "")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"PhysicalDamage",
				"Allies in your Presence deal # to # added Attack Physical Damage");

		FIRE_DAMAGE_ALLIES = new Modifier(
				"fire_damage_allies",
				List.of("damage", "elemental", "fire", "attack"),
				List.of(
						new ModifierTier("Heated", 1, 500, new Pair<>(1, 2), new Pair<>(3, 4), "", ""),
						new ModifierTier("Smouldering", 8, 500, new Pair<>(3, 5), new Pair<>(6, 9), "", ""),
						new ModifierTier("Smoking", 16, 500, new Pair<>(6, 8), new Pair<>(10, 13), "", ""),
						new ModifierTier("Burning", 33, 500, new Pair<>(9, 11), new Pair<>(14, 17), "", ""),
						new ModifierTier("Flaming", 46, 500, new Pair<>(12, 13), new Pair<>(18, 20), "", ""),
						new ModifierTier("Scorching", 54, 500, new Pair<>(14, 16), new Pair<>(21, 26), "", ""),
						new ModifierTier("Incinerating", 60, 400, new Pair<>(17, 19), new Pair<>(27, 30), "", ""),
						new ModifierTier("Blasting", 65, 300, new Pair<>(20, 24), new Pair<>(31, 38), "", ""),
						new ModifierTier("Cremating", 75, 200, new Pair<>(25, 29), new Pair<>(39, 45), "", "")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"FireDamage",
				"Allies in your Presence deal # to # added Attack Fire Damage");

		COLD_DAMAGE_ALLIES = new Modifier(
				"cold_damage_allies",
				List.of("damage", "elemental", "cold", "attack"),
				List.of(
						new ModifierTier("Frosted", 1, 500, new Pair<>(1, 2), new Pair<>(3, 4), "", ""),
						new ModifierTier("Chilled", 8, 500, new Pair<>(3, 4), new Pair<>(5, 8), "", ""),
						new ModifierTier("Icy", 16, 500, new Pair<>(5, 6), new Pair<>(9, 11), "", ""),
						new ModifierTier("Frigid", 33, 500, new Pair<>(7, 8), new Pair<>(12, 14), "", ""),
						new ModifierTier("Freezing", 46, 500, new Pair<>(9, 10), new Pair<>(15, 17), "", ""),
						new ModifierTier("Frozen", 54, 500, new Pair<>(11, 13), new Pair<>(18, 21), "", ""),
						new ModifierTier("Glaciated", 60, 400, new Pair<>(14, 15), new Pair<>(22, 24), "", ""),
						new ModifierTier("Polar", 65, 300, new Pair<>(16, 20), new Pair<>(25, 31), "", ""),
						new ModifierTier("Entombing", 75, 200, new Pair<>(21, 24), new Pair<>(32, 37), "", "")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"ColdDamage",
				"Allies in your Presence deal # to # added Attack Cold Damage");

		LIGHTNING_DAMAGE_ALLIES = new Modifier(
				"lightning_damage_allies",
				List.of("damage", "elemental", "lightning", "attack"),
				List.of(
						new ModifierTier("Humming", 1, 500, new Pair<>(1, 1), new Pair<>(5, 7), "", ""),
						new ModifierTier("Buzzing", 8, 500, new Pair<>(1, 1), new Pair<>(10, 15), "", ""),
						new ModifierTier("Snapping", 16, 500, new Pair<>(1, 1), new Pair<>(16, 22), "", ""),
						new ModifierTier("Crackling", 33, 500, new Pair<>(1, 1), new Pair<>(23, 27), "", ""),
						new ModifierTier("Sparking", 46, 500, new Pair<>(1, 1), new Pair<>(28, 32), "", ""),
						new ModifierTier("Arcing", 54, 400, new Pair<>(1, 2), new Pair<>(33, 40), "", ""),
						new ModifierTier("Shocking", 60, 400, new Pair<>(1, 2), new Pair<>(41, 47), "", ""),
						new ModifierTier("Discharging", 65, 300, new Pair<>(1, 3), new Pair<>(48, 59), "", ""),
						new ModifierTier("Electrocuting", 75, 200, new Pair<>(1, 4), new Pair<>(60, 71), "", "")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"LightningDamage",
				"Allies in your Presence deal # to # added Attack Lightning Damage");

		ALL_DAMAGE_ALLIES = new Modifier(
				"all_damage_allies",
				List.of("damage"),
				List.of(
						new ModifierTier("Coercive", 1, 1000, new Pair<>(25, 34)),
						new ModifierTier("Agitative", 8, 1000, new Pair<>(35, 44)),
						new ModifierTier("Instigative", 16, 1000, new Pair<>(45, 54)),
						new ModifierTier("Provocative", 33, 600, new Pair<>(55, 64)),
						new ModifierTier("Persuasive", 46, 400, new Pair<>(65, 74)),
						new ModifierTier("Motivating", 60, 200, new Pair<>(75, 89)),
						new ModifierTier("Inspirational", 70, 100, new Pair<>(90, 104)),
						new ModifierTier("Empowering", 82, 50, new Pair<>(105, 119))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"AllDamage",
				"Allies in your Presence deal #% increased Damage");

		INCREASED_SPIRIT = new Modifier(
				"increased_spirit",
				List.of(),
				List.of(
						new ModifierTier("Lord's", 1, 1000, new Pair<>(30, 36)),
						new ModifierTier("Baron's", 8, 1000, new Pair<>(27, 32)),
						new ModifierTier("Viscount's", 16, 1000, new Pair<>(33, 38)),
						new ModifierTier("Marquess'", 33, 600, new Pair<>(39, 44)),
						new ModifierTier("Count's", 46, 400, new Pair<>(45, 50)),
						new ModifierTier("Duke's", 60, 200, new Pair<>(51, 55)),
						new ModifierTier("Prince's", 75, 100, new Pair<>(56, 60)),
						new ModifierTier("King's", 82, 50, new Pair<>(61, 65))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"LocalIncreasedSpiritPercent",
				"#% increased Spirit");

		HYBRID_INCREASED_SPIRIT_MANA = new Modifier(
				"increased_spirit", "maximum_mana",
				List.of(),
				List.of(
						new ModifierTier("Advisor's", 2, 1000, new Pair<>(10, 14), new Pair<>(17, 20),
								"increased_spirit", "maximum_mana"),
						new ModifierTier("Counselor's", 11, 1000, new Pair<>(15, 18), new Pair<>(21, 24),
								"increased_spirit", "maximum_mana"),
						new ModifierTier("Emissary's", 26, 1000, new Pair<>(19, 22), new Pair<>(25, 28),
								"increased_spirit", "maximum_mana"),
						new ModifierTier("Minister's", 36, 600, new Pair<>(23, 26), new Pair<>(29, 33),
								"increased_spirit", "maximum_mana"),
						new ModifierTier("Envoy's", 48, 400, new Pair<>(27, 30), new Pair<>(34, 37), "increased_spirit",
								"maximum_mana"),
						new ModifierTier("Diplomat's", 58, 200, new Pair<>(31, 34), new Pair<>(38, 41),
								"increased_spirit", "maximum_mana"),
						new ModifierTier("Chancellor's", 70, 100, new Pair<>(35, 38), new Pair<>(42, 45),
								"increased_spirit", "maximum_mana")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"LocalIncreasedSpiritAndMana",
				"#% increased Spirit\n+# to maximum Mana");

		// SUFFIXES

		STRENGTH = new Modifier(
				"strength",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Brute", 1, 1000, new Pair<>(5, 8)),
						new ModifierTier("of the Wrestler", 1000, 1, new Pair<>(9, 12)),
						new ModifierTier("of the Bear", 22, 1000, new Pair<>(13, 16)),
						new ModifierTier("of the Lion", 33, 1000, new Pair<>(17, 20)),
						new ModifierTier("of the Gorilla", 44, 1000, new Pair<>(21, 24)),
						new ModifierTier("of the Goliath", 55, 1000, new Pair<>(25, 27)),
						new ModifierTier("of the Leviathan", 66, 1000, new Pair<>(28, 30)),
						new ModifierTier("of the Titan", 74, 1000, new Pair<>(31, 33))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"Strength",
				"+# to Strength");

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
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"Intelligence",
				"+# to Intelligence");

		ALLIES_ALL_RESISTANCES = new Modifier(
				"allies_all_resistances",
				List.of("elemental", "resistance"),
				List.of(
						new ModifierTier("of Adjustment", 12, 800, new Pair<>(3, 5)),
						new ModifierTier("of Acclimatisation", 26, 800, new Pair<>(6, 8)),
						new ModifierTier("of Adaptation", 40, 800, new Pair<>(9, 11)),
						new ModifierTier("of Evolution", 54, 800, new Pair<>(12, 14)),
						new ModifierTier("of Progression", 68, 800, new Pair<>(15, 16)),
						new ModifierTier("of Metamorphosis", 80, 800, new Pair<>(17, 18))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"AllResistances",
				"Allies in your Presence have +(#–#)% to all Elemental Resistances");

		REDUCED_ATTRIBUTE_REQUIREMENTS = new Modifier(
				"reduced_attributes_requirements",
				List.of(""),
				List.of(
						new ModifierTier("of the Worthy", 24, 1000, new Pair<>(15, 15)),
						new ModifierTier("of the Apt", 32, 1000, new Pair<>(20, 20)),
						new ModifierTier("of the Talented", 40, 1000, new Pair<>(25, 25)),
						new ModifierTier("of the Skilled", 52, 1000, new Pair<>(30, 30)),
						new ModifierTier("of the Proficient", 60, 1000, new Pair<>(35, 35))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"LocalAttributeRequirements",
				"#% reduced Attribute Requirements");

		MINION_SKILL_LEVEL = new Modifier(
				"minion_skill_level",
				List.of("minion", "gem"),
				List.of(
						new ModifierTier("of the Taskmaster", 2, 750, new Pair<>(1, 1)),
						new ModifierTier("of the Despot", 25, 500, new Pair<>(2, 2)),
						new ModifierTier("of the Overseer", 55, 250, new Pair<>(3, 3)),
						new ModifierTier("of the Slavedriver", 78, 100, new Pair<>(4, 4))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Minion Skills");

		ALLIES_LIFE_REGENERATION = new Modifier(
				"allies_life_regeneration",
				List.of("life"),
				List.of(
						new ModifierTier("of the Newt", 1, 1000, new Pair<>(1, 2)),
						new ModifierTier("of the Lizard", 5, 1000, new Pair<>(2, 3)),
						new ModifierTier("of the Flatworm", 11, 1000, new Pair<>(3, 4)),
						new ModifierTier("of the Starfish", 17, 1000, new Pair<>(4, 6)),
						new ModifierTier("of the Hydra", 26, 1000, new Pair<>(6, 9)),
						new ModifierTier("of the Troll", 35, 1000, new Pair<>(9, 13)),
						new ModifierTier("of Convalescence", 47, 1000, new Pair<>(13, 18)),
						new ModifierTier("of Recuperation", 58, 1000, new Pair<>(18, 23)),
						new ModifierTier("of Resurgence", 68, 1000, new Pair<>(23, 29)),
						new ModifierTier("of Immortality", 75, 1000, new Pair<>(29, 33))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"LifeRegeneration",
				"Regenerate #(–#) Life per second for Allies in your Presence");

		ALLIES_INCREASED_ATTACK_SPEED = new Modifier(
				"allies_increased_attack_speed",
				List.of("attack", "speed"),
				List.of(
						new ModifierTier("of Skill", 5, 1000, new Pair<>(5, 7)),
						new ModifierTier("of Ease", 20, 1000, new Pair<>(8, 10)),
						new ModifierTier("of Mastery", 35, 1000, new Pair<>(11, 13)),
						new ModifierTier("of Renown", 55, 1000, new Pair<>(14, 16))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreasedAttackSpeed",
				"#% increased Attack Speed for Allies in your Presence");

		ALLIES_INCREASED_CAST_SPEED = new Modifier(
				"allies_increased_cast_speed",
				List.of("caster", "speed"),
				List.of(
						new ModifierTier("of Talent", 6, 1000, new Pair<>(5, 8)),
						new ModifierTier("of Nimbleness", 21, 1000, new Pair<>(9, 12)),
						new ModifierTier("of Expertise", 36, 1000, new Pair<>(13, 16)),
						new ModifierTier("of Sortilege", 56, 1000, new Pair<>(17, 20))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreasedCastSpeed",
				"#% increased Cast Speed for Allies in your Presence");

		ALLIES_INCREASED_CRIT_CHANCE = new Modifier(
				"allies_increased_crit_chance",
				List.of("critical"),
				List.of(
						new ModifierTier("of Menace", 11, 1000, new Pair<>(10, 14)),
						new ModifierTier("of Havoc", 21, 1000, new Pair<>(15, 19)),
						new ModifierTier("of Disaster", 28, 1000, new Pair<>(20, 24)),
						new ModifierTier("of Calamity", 41, 500, new Pair<>(25, 29)),
						new ModifierTier("of Ruin", 59, 250, new Pair<>(30, 34)),
						new ModifierTier("of Unmaking", 76, 125, new Pair<>(35, 38))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"CriticalStrikeChanceIncrease",
				"#% increased Critical Hit Chance for Allies in your Presence");

		ALLIES_INCREASED_CRIT_MULTIPLIER = new Modifier(
				"allies_increased_crit_multiplier",
				List.of("damage", "critical"),
				List.of(
						new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 14)),
						new ModifierTier("of Anger", 21, 1000, new Pair<>(15, 19)),
						new ModifierTier("of Rage", 30, 1000, new Pair<>(20, 24)),
						new ModifierTier("of Fury", 44, 500, new Pair<>(25, 29)),
						new ModifierTier("of Ferocity", 59, 250, new Pair<>(30, 34)),
						new ModifierTier("of Destruction", 73, 125, new Pair<>(35, 39))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"CriticalStrikeMultiplier",
				"#% increased Critical Damage Bonus for Allies in your Presence");

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

		INCREASED_PRESENCE_RADIUS = new Modifier(
				"increased_presence_radius",
				List.of(),
				List.of(
						new ModifierTier("of Direction", 23, 500, new Pair<>(36, 45)),
						new ModifierTier("of Outreach", 40, 500, new Pair<>(46, 55)),
						new ModifierTier("of Guidance", 56, 500, new Pair<>(56, 65)),
						new ModifierTier("of Influence", 72, 500, new Pair<>(66, 80))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"PresenceRadius",
				"#% increased Presence Area of Effect for Allies");

		MINIONS_INCREASED_LIFE = new Modifier(
				"minions_increased_life",
				List.of("life", "minion"),
				List.of(
						new ModifierTier("of the Mentor", 2, 1000, new Pair<>(21, 25)),
						new ModifierTier("of the Tutor", 16, 1000, new Pair<>(26, 30)),
						new ModifierTier("of the Director", 32, 1000, new Pair<>(31, 35)),
						new ModifierTier("of the Headmaster", 48, 1000, new Pair<>(36, 40)),
						new ModifierTier("of the Administrator", 64, 1000, new Pair<>(41, 45)),
						new ModifierTier("of the Rector", 80, 1000, new Pair<>(46, 50))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"MinionLife",
				"#% increased maximum Life for Minions");
	}
}
