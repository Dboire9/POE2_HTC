package core.Item_modifiers.Off_Hand_Item_modifiers.Quivers_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier PHYSICAL_DAMAGE_FLAT;
	public static final Modifier FIRE_DAMAGE_FLAT;
	public static final Modifier COLD_DAMAGE_FLAT;
	public static final Modifier LIGHTNING_DAMAGE_FLAT;
	public static final Modifier ACCURACY_RATING;
	public static final Modifier INCREASED_PROJECTILE_SPEED;
	public static final Modifier INCREASED_DAMAGE_WITH_BOW_SKILLS;

	// SUFFIXES
	public static final Modifier DEXTERITY;
	public static final Modifier LEVEL_PROJECTILE_SKILL;
	public static final Modifier LIFE_PER_ENEMY_KILLED;
	public static final Modifier MANA_PER_ENEMY_KILLED;
	public static final Modifier INCREASED_ATTACK_SPEED;
	public static final Modifier INCREASED_CRITICAL_HIT_CHANCE_FOR_ATTACKS;
	public static final Modifier INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS;
	public static final Modifier CHANCE_TO_PIERCE;

	static {

		// PREFIXES

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
						new ModifierTier("Ranger's", 67, 400, new Pair<>(347, 450)),
						new ModifierTier("Amazon's", 76, 200, new Pair<>(451, 550))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedAccuracy",
				"+# to Accuracy Rating");

		INCREASED_PROJECTILE_SPEED = new Modifier(
				"increased_projectile_speed",
				List.of("speed"),
				List.of(
						new ModifierTier("Darting", 14, 1000, new Pair<>(10, 17)),
						new ModifierTier("Brisk", 27, 1000, new Pair<>(18, 25)),
						new ModifierTier("Quick", 41, 1000, new Pair<>(26, 33)),
						new ModifierTier("Rapid", 55, 1000, new Pair<>(34, 41)),
						new ModifierTier("Nimble", 82, 1000, new Pair<>(42, 46))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"ProjectileSpeed",
				"#% increased Projectile Speed");

		INCREASED_DAMAGE_WITH_BOW_SKILLS = new Modifier(
				"increased_damage_with_bow_skills",
				List.of("damage"),
				List.of(
						new ModifierTier("Acute", 1, 500, new Pair<>(11, 20)),
						new ModifierTier("Trenchant", 16, 500, new Pair<>(21, 30)),
						new ModifierTier("Perforating", 33, 500, new Pair<>(31, 36)),
						new ModifierTier("Incisive", 46, 500, new Pair<>(37, 42)),
						new ModifierTier("Lacerating", 60, 500, new Pair<>(43, 50)),
						new ModifierTier("Impaling", 81, 500, new Pair<>(51, 59))),
				Modifier.ModifierType.PREFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedDamageWithBowSkillsPercent",
				"#% increased Damage with Bow Skills");

		// SUFFIXES

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

		LEVEL_PROJECTILE_SKILL = new Modifier(
				"level_projectile_skill",
				List.of(""),
				List.of(
						new ModifierTier("of the Archer", 5, 500, new Pair<>(1, 1)),
						new ModifierTier("of the Fletcher", 41, 250, new Pair<>(2, 2))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Projectile Skills");

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

		INCREASED_ATTACK_SPEED = new Modifier(
				"increased_attack_speed",
				List.of("attack", "speed"),
				List.of(
						new ModifierTier("of Skill", 1, 500, new Pair<>(5, 7)),
						new ModifierTier("of Ease", 11, 500, new Pair<>(8, 10)),
						new ModifierTier("of Mastery", 22, 500, new Pair<>(11, 13)),
						new ModifierTier("of Renown", 30, 500, new Pair<>(14, 16))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"IncreasedAttackSpeed",
				"#% increased Attack Speed");

		INCREASED_CRITICAL_HIT_CHANCE_FOR_ATTACKS = new Modifier(
				"increased_critical_hit_chance_for_attacks",
				List.of("attack", "critical"),
				List.of(
						new ModifierTier("of Menace", 5, 1000, new Pair<>(10, 14)),
						new ModifierTier("of Havoc", 20, 1000, new Pair<>(15, 19)),
						new ModifierTier("of Disaster", 30, 1000, new Pair<>(20, 24)),
						new ModifierTier("of Calamity", 44, 500, new Pair<>(25, 29)),
						new ModifierTier("of Ruin", 58, 250, new Pair<>(30, 34)),
						new ModifierTier("of Unmaking", 72, 125, new Pair<>(35, 38))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"CriticalStrikeChanceIncrease",
				"#% increased Critical Hit Chance for Attacks");

		INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS = new Modifier(
				"critical_damage_bonus_for_attacks",
				List.of("damage", "attack", "critical"),
				List.of(
						new ModifierTier("of Ire", 8, 1000, new Pair<>(10, 14)),
						new ModifierTier("of Anger", 21, 1000, new Pair<>(15, 19)),
						new ModifierTier("of Rage", 31, 1000, new Pair<>(20, 24)),
						new ModifierTier("of Fury", 45, 500, new Pair<>(25, 29)),
						new ModifierTier("of Ferocity", 59, 250, new Pair<>(30, 34)),
						new ModifierTier("of Destruction", 74, 125, new Pair<>(35, 39))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"CriticalStrikeMultiplier",
				"#% increased Critical Damage Bonus for Attack Damage");

		CHANCE_TO_PIERCE = new Modifier(
				"chance_to_pierce",
				List.of(),
				List.of(
						new ModifierTier("of Piercing", 11, 500, new Pair<>(12, 14)),
						new ModifierTier("of Drilling", 26, 500, new Pair<>(15, 17)),
						new ModifierTier("of Puncturing", 44, 500, new Pair<>(18, 20)),
						new ModifierTier("of Skewering", 61, 500, new Pair<>(21, 23)),
						new ModifierTier("of Penetrating", 77, 500, new Pair<>(24, 26))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.NORMAL,
				"ChanceToPierce",
				"#% chance to Pierce an Enemy");

	}
}
