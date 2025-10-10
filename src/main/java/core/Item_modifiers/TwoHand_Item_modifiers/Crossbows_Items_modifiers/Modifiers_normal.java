package core.Item_modifiers.TwoHand_Item_modifiers.Crossbows_Items_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier PHYSICAL_DAMAGE_FLAT;
	public static final Modifier FIRE_DAMAGE_FLAT;
	public static final Modifier COLD_DAMAGE_FLAT;
	public static final Modifier LIGHTNING_DAMAGE_FLAT;
	public static final Modifier INCREASED_PHYSICAL_DAMAGE_PERCENT;
	public static final Modifier HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING;
	public static final Modifier ACCURACY_RATING;
	public static final Modifier INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS;

	// SUFFIXES
	public static final Modifier STRENGTH;
	public static final Modifier DEXTERITY;
	public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
	public static final Modifier LEVEL_PROJECTILE_SKILL;
	public static final Modifier LIFE_LEECH;
	public static final Modifier MANA_LEECH;
	public static final Modifier LIFE_PER_ENEMY_KILLED;
	public static final Modifier MANA_PER_ENEMY_KILLED;
	public static final Modifier LIFE_PER_ENEMY_HIT;
	public static final Modifier INCREASED_ATTACK_SPEED;
	public static final Modifier CRITICAL_HIT_CHANCE;
	public static final Modifier CRITICAL_DAMAGE_BONUS;
	public static final Modifier HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS;
	public static final Modifier ADDITIONAL_BOLT;

	static {

		// PREFIXES

		PHYSICAL_DAMAGE_FLAT = new Modifier(
				"physical_damage_flat",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Glinting", 1, 1000, new Pair<>(2, 3), new Pair<>(5, 7), "", ""),
						new ModifierTier("Burnished", 8, 1000, new Pair<>(5, 8), new Pair<>(10, 15), "", ""),
						new ModifierTier("Polished", 16, 1000, new Pair<>(8, 12), new Pair<>(15, 22), "", ""),
						new ModifierTier("Honed", 33, 1000, new Pair<>(11, 17), new Pair<>(20, 30), "", ""),
						new ModifierTier("Gleaming", 46, 1000, new Pair<>(14, 21), new Pair<>(25, 37), "", ""),
						new ModifierTier("Annealed", 54, 600, new Pair<>(19, 29), new Pair<>(33, 49), "", ""),
						new ModifierTier("Razor-sharp", 60, 400, new Pair<>(23, 35), new Pair<>(39, 59), "", ""),
						new ModifierTier("Tempered", 65, 200, new Pair<>(29, 44), new Pair<>(50, 75), "", ""),
						new ModifierTier("Flaring", 75, 100, new Pair<>(37, 55), new Pair<>(63, 94), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"PhysicalDamage",
				"Adds # to # Physical Damage");

		FIRE_DAMAGE_FLAT = new Modifier(
				"fire_damage_flat",
				List.of("damage", "elemental", "fire", "attack"),
				List.of(
						new ModifierTier("Heated", 1, 1000, new Pair<>(2, 4), new Pair<>(5, 7), "", ""),
						new ModifierTier("Smouldering", 8, 1000, new Pair<>(6, 9), new Pair<>(10, 16), "", ""),
						new ModifierTier("Smoking", 16, 1000, new Pair<>(11, 17), new Pair<>(19, 28), "", ""),
						new ModifierTier("Burning", 33, 1000, new Pair<>(19, 27), new Pair<>(30, 42), "", ""),
						new ModifierTier("Flaming", 46, 1000, new Pair<>(30, 37), new Pair<>(45, 56), "", ""),
						new ModifierTier("Scorching", 54, 1000, new Pair<>(39, 53), new Pair<>(59, 80), "", ""),
						new ModifierTier("Incinerating", 60, 600, new Pair<>(56, 70), new Pair<>(84, 107), "", ""),
						new ModifierTier("Blasting", 65, 400, new Pair<>(73, 97), new Pair<>(112, 149), "", ""),
						new ModifierTier("Cremating", 75, 250, new Pair<>(102, 130), new Pair<>(155, 198), "", ""),
						new ModifierTier("Carbonising", 81, 100, new Pair<>(135, 156), new Pair<>(205, 236), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"FireDamage",
				"Adds # to # Fire Damage");

		COLD_DAMAGE_FLAT = new Modifier(
				"cold_damage_flat",
				List.of("damage", "elemental", "cold", "attack"),
				List.of(
						new ModifierTier("Frosted", 1, 800, new Pair<>(2, 3), new Pair<>(4, 6), "", ""),
						new ModifierTier("Chilled", 8, 800, new Pair<>(5, 8), new Pair<>(9, 14), "", ""),
						new ModifierTier("Icy", 16, 800, new Pair<>(10, 14), new Pair<>(15, 23), "", ""),
						new ModifierTier("Frigid", 33, 800, new Pair<>(16, 23), new Pair<>(25, 35), "", ""),
						new ModifierTier("Freezing", 46, 800, new Pair<>(25, 30), new Pair<>(38, 46), "", ""),
						new ModifierTier("Frozen", 54, 800, new Pair<>(32, 43), new Pair<>(49, 66), "", ""),
						new ModifierTier("Glaciated", 60, 480, new Pair<>(46, 57), new Pair<>(70, 88), "", ""),
						new ModifierTier("Polar", 65, 320, new Pair<>(60, 80), new Pair<>(92, 121), "", ""),
						new ModifierTier("Entombing", 75, 200, new Pair<>(84, 107), new Pair<>(126, 161), "", ""),
						new ModifierTier("Crystalising", 81, 80, new Pair<>(112, 124), new Pair<>(168, 189), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"ColdDamage",
				"Adds # to # Cold Damage");

		LIGHTNING_DAMAGE_FLAT = new Modifier(
				"lightning_damage_flat",
				List.of("damage", "elemental", "lightning", "attack"),
				List.of(
						new ModifierTier("Humming", 1, 1000, new Pair<>(1, 1), new Pair<>(7, 10), "", ""),
						new ModifierTier("Buzzing", 8, 1000, new Pair<>(1, 2), new Pair<>(19, 27), "", ""),
						new ModifierTier("Snapping", 16, 1000, new Pair<>(1, 3), new Pair<>(31, 43), "", ""),
						new ModifierTier("Crackling", 33, 1000, new Pair<>(1, 4), new Pair<>(53, 76), "", ""),
						new ModifierTier("Sparking", 46, 1000, new Pair<>(1, 4), new Pair<>(80, 88), "", ""),
						new ModifierTier("Arcing", 54, 1000, new Pair<>(1, 6), new Pair<>(93, 122), "", ""),
						new ModifierTier("Shocking", 60, 600, new Pair<>(1, 8), new Pair<>(128, 162), "", ""),
						new ModifierTier("Discharging", 65, 400, new Pair<>(1, 13), new Pair<>(168, 231), "", ""),
						new ModifierTier("Electrocuting", 75, 250, new Pair<>(1, 16), new Pair<>(239, 300), "", ""),
						new ModifierTier("Vapourising", 81, 100, new Pair<>(1, 19), new Pair<>(310, 358), "", "")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"LightningDamage",
				"Adds # to # Lightning Damage");

		INCREASED_PHYSICAL_DAMAGE_PERCENT = new Modifier(
				"increased_physical_damage_percent",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Heavy", 1, 1000, new Pair<>(40, 49)),
						new ModifierTier("Serrated", 8, 1000, new Pair<>(50, 64)),
						new ModifierTier("Wicked", 16, 1000, new Pair<>(65, 84)),
						new ModifierTier("Vicious", 33, 400, new Pair<>(85, 109)),
						new ModifierTier("Bloodthirsty", 46, 200, new Pair<>(110, 134)),
						new ModifierTier("Cruel", 60, 100, new Pair<>(135, 154)),
						new ModifierTier("Tyrannical", 75, 50, new Pair<>(155, 169)),
						new ModifierTier("Merciless", 82, 25, new Pair<>(170, 179))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"LocalPhysicalDamagePercent",
				"#% increased Physical Damage");

		HYBRID_INCREASED_PHYSICAL_DAMAGE_PERCENT_AND_ACCURACY_RATING = new Modifier(
				"increased_physical_damage_percent", "accuracy_rating",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Squire's", 1, 1000, new Pair<>(15, 19), new Pair<>(16, 20),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Journeyman's", 11, 1000, new Pair<>(20, 24), new Pair<>(21, 46),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Reaver's", 23, 1000, new Pair<>(25, 34), new Pair<>(47, 72),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Mercenary's", 38, 1000, new Pair<>(35, 44), new Pair<>(73, 97),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Champion's", 54, 600, new Pair<>(45, 54), new Pair<>(98, 123),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Conqueror's", 65, 400, new Pair<>(55, 64), new Pair<>(124, 149),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Emperor's", 70, 200, new Pair<>(65, 74), new Pair<>(150, 174),
								"increased_physical_damage_percent", "accuracy_rating"),
						new ModifierTier("Dictator's", 81, 100, new Pair<>(75, 79), new Pair<>(175, 200),
								"increased_physical_damage_percent", "accuracy_rating")),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"LocalIncreasedPhysicalDamagePercentAndAccuracyRating",
				"#% increased Physical Damage\n+# to Accuracy Rating");

		ACCURACY_RATING = new Modifier(
				"accuracy_rating",
				List.of("attack"),
				List.of(
						new ModifierTier("Precise", 1, 800, new Pair<>(11, 32)),
						new ModifierTier("Reliable", 11, 800, new Pair<>(33, 60)),
						new ModifierTier("Focused", 18, 800, new Pair<>(61, 84)),
						new ModifierTier("Deliberate", 26, 800, new Pair<>(85, 123)),
						new ModifierTier("Consistent", 36, 800, new Pair<>(124, 167)),
						new ModifierTier("Steady", 48, 600, new Pair<>(168, 236)),
						new ModifierTier("Hunter's", 58, 600, new Pair<>(237, 346)),
						new ModifierTier("Ranger's", 67, 300, new Pair<>(347, 450)),
						new ModifierTier("Amazon's", 76, 200, new Pair<>(451, 550)),
						new ModifierTier("Valkyrie's", 82, 100, new Pair<>(551, 650))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedAccuracy",
				"+# to Accuracy Rating");

		INCREASED_ELEMENTAL_DAMAGE_WITH_ATTACKS = new Modifier(
				"increased_elemental_damage_with_attacks",
				List.of("damage", "elemental", "attack"),
				List.of(
						new ModifierTier("Catalysing", 4, 500, new Pair<>(34, 47)),
						new ModifierTier("Infusing", 16, 500, new Pair<>(48, 71)),
						new ModifierTier("Empowering", 33, 500, new Pair<>(72, 85)),
						new ModifierTier("Unleashed", 46, 500, new Pair<>(86, 99)),
						new ModifierTier("Overpowering", 60, 500, new Pair<>(100, 119)),
						new ModifierTier("Devastating", 81, 500, new Pair<>(120, 139))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedWeaponElementalDamagePercent",
				"#% increased Elemental Damage with Attacks");

		// SUFFIXES

		STRENGTH = new Modifier(
				"strength",
				List.of("attribute"),
				List.of(
						new ModifierTier("of the Brute", 1, 500, new Pair<>(5, 8)),
						new ModifierTier("of the Wrestler", 500, 500, new Pair<>(9, 12)),
						new ModifierTier("of the Bear", 22, 500, new Pair<>(13, 16)),
						new ModifierTier("of the Lion", 33, 500, new Pair<>(17, 20)),
						new ModifierTier("of the Gorilla", 44, 500, new Pair<>(21, 24)),
						new ModifierTier("of the Goliath", 55, 500, new Pair<>(25, 27)),
						new ModifierTier("of the Leviathan", 66, 500, new Pair<>(28, 30)),
						new ModifierTier("of the Titan", 74, 500, new Pair<>(31, 33))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"Strength",
				"# to Strength");

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
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"Dexterity",
				"+# to Dexterity");

		REDUCED_ATTRIBUTE_REQUIREMENTS = new Modifier(
				"reduced_attribute_requirements",
				List.of(""),
				List.of(
						new ModifierTier("of the Worthy", 24, 1000, new Pair<>(15, 15)),
						new ModifierTier("of the Apt", 32, 1000, new Pair<>(20, 20)),
						new ModifierTier("of the Talented", 40, 1000, new Pair<>(25, 25)),
						new ModifierTier("of the Skilled", 52, 1000, new Pair<>(30, 30)),
						new ModifierTier("of the Proficient", 60, 1000, new Pair<>(35, 35))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LocalAttributeRequirements",
				"% reduced Attribute Requirements");

		LEVEL_PROJECTILE_SKILL = new Modifier(
				"level_projectile_skill",
				List.of("attack"),
				List.of(
						new ModifierTier("of the Archer", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of the Fletcher", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of the Sharpshooter", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of the Marksman", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of the Sniper", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Projectile Skills");

		LIFE_LEECH = new Modifier(
				"life_leech",
				List.of("life", "physical", "attack"),
				List.of(
						new ModifierTier("of the Parasite", 21, 1000, new Pair<>(5.0, 5.9)),
						new ModifierTier("of the Locust", 38, 1000, new Pair<>(6.0, 6.9)),
						new ModifierTier("of the Remora", 54, 1000, new Pair<>(7.0, 7.9)),
						new ModifierTier("of the Lamprey", 68, 1000, new Pair<>(8.0, 8.9))),
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
						new ModifierTier("of the Arid", 54, 1000, new Pair<>(6.0, 6.9)),
						new ModifierTier("of the Drought", 68, 1000, new Pair<>(7.0, 7.9))),
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
						new ModifierTier("of Valour", 55, 750, new Pair<>(41, 53)),
						new ModifierTier("of Glory", 66, 750, new Pair<>(54, 68)),
						new ModifierTier("of Legend", 77, 750, new Pair<>(69, 84))),
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
						new ModifierTier("of Siphoning", 56, 750, new Pair<>(21, 27)),
						new ModifierTier("of Devouring", 67, 750, new Pair<>(28, 35)),
						new ModifierTier("of Assimilation", 78, 750, new Pair<>(36, 45))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ManaGainedFromEnemyDeath",
				"Gain # Mana per Enemy Killed");

		LIFE_PER_ENEMY_HIT = new Modifier(
				"life_per_enemy_hit",
				List.of("life", "attack"),
				List.of(
						new ModifierTier("of Rejuvenation", 8, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Restoration", 20, 1000, new Pair<>(3, 3)),
						new ModifierTier("of Regrowth", 30, 1000, new Pair<>(4, 4)),
						new ModifierTier("of Nourishment", 40, 1000, new Pair<>(5, 5))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LifeGainPerTarget",
				"Grants # Life per Enemy Hit");

		INCREASED_ATTACK_SPEED = new Modifier(
				"increased_attack_speed",
				List.of("attack", "speed"),
				List.of(
						new ModifierTier("of Skill", 1, 1000, new Pair<>(5, 7)),
						new ModifierTier("of Ease", 11, 1000, new Pair<>(8, 10)),
						new ModifierTier("of Mastery", 22, 1000, new Pair<>(11, 13)),
						new ModifierTier("of Renown", 30, 500, new Pair<>(14, 16)),
						new ModifierTier("of Acclaim", 37, 400, new Pair<>(17, 19))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedAttackSpeed",
				"#% increased Attack Speed");

		CRITICAL_HIT_CHANCE = new Modifier(
				"critical_hit_chance",
				List.of("attack", "critical"),
				List.of(
						new ModifierTier("of Menace", 1, 1000, new Pair<>(1.01, 1.5)),
						new ModifierTier("of Havoc", 20, 1000, new Pair<>(1.51, 2.1)),
						new ModifierTier("of Disaster", 30, 1000, new Pair<>(2.11, 2.7)),
						new ModifierTier("of Calamity", 44, 500, new Pair<>(3.11, 3.8)),
						new ModifierTier("of Ruin", 59, 250, new Pair<>(3.81, 4.4)),
						new ModifierTier("of Unmaking", 73, 125, new Pair<>(4.41, 5.0))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"CriticalStrikeChanceIncrease",
				"+#% to Critical Hit Chance");

		CRITICAL_DAMAGE_BONUS = new Modifier(
				"critical_damage_bonus",
				List.of("damage", "attack", "critical"),
				List.of(
						new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 11)),
						new ModifierTier("of Anger", 21, 1000, new Pair<>(12, 13)),
						new ModifierTier("of Rage", 30, 1000, new Pair<>(14, 16)),
						new ModifierTier("of Fury", 44, 500, new Pair<>(17, 19)),
						new ModifierTier("of Ferocity", 59, 250, new Pair<>(20, 22)),
						new ModifierTier("of Destruction", 73, 125, new Pair<>(23, 25))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"CriticalStrikeMultiplier",
				"+#% to Critical Damage Bonus");

		HYBRID_ACCURACY_RATING_AND_LIGHT_RADIUS = new Modifier(
				"accuracy_rating", "light_radius",
				List.of("attack"),
				List.of(
						new ModifierTier("of Shining", 8, 1000, new Pair<>(10, 20), new Pair<>(5, 5), "accuracy_rating",
								"light_radius"),
						new ModifierTier("of Light", 15, 1000, new Pair<>(21, 40), new Pair<>(10, 10),
								"accuracy_rating", "light_radius"),
						new ModifierTier("of Radiance", 30, 1000, new Pair<>(41, 60), new Pair<>(15, 15),
								"accuracy_rating", "light_radius")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"LightRadiusAndAccuracy",
				"+# to Accuracy Rating / #% increased Light Radius");

		ADDITIONAL_BOLT = new Modifier(
				"additional_bolt",
				List.of("attack"),
				List.of(
						new ModifierTier("of Shelling", 55, 250, new Pair<>(1, 1)),
						new ModifierTier("of Bursting", 82, 125, new Pair<>(2, 2))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"AdditionalAmmo",
				"Loads # additional bolt(s)");
	}
}