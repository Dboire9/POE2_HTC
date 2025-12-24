package core.Item_modifiers.TwoHand_Item_modifiers.Crossbows_Items_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_essences {

	// PREFIXES
	public static final Modifier ESSENCE_PHYSICAL_DAMAGE_FLAT;
	public static final Modifier ESSENCE_FIRE_DAMAGE_FLAT;
	public static final Modifier ESSENCE_COLD_DAMAGE_FLAT;
	public static final Modifier ESSENCE_LIGHTNING_DAMAGE_FLAT;
	public static final Modifier ESSENCE_INCREASED_ACCURACY;
	public static final Modifier ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL;
	public static final Modifier ESSENCE_WEAPON_GAINED_DAMAGE_FIRE;
	public static final Modifier ESSENCE_WEAPON_GAINED_DAMAGE_COLD;
	public static final Modifier ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING;
	

	// SUFFIXES
	public static final Modifier ESSENCE_INCREASED_ATTACK_SPEED;
	public static final Modifier ESSENCE_ATTRIBUTES_STRENGTH;
	public static final Modifier ESSENCE_ATTRIBUTES_DEXTERITY;
	public static final Modifier ESSENCE_ATTRIBUTES_INTELLIGENCE;
	public static final Modifier ESSENCE_ALL_ATTACK_SKILL_LEVEL;
	public static final Modifier ESSENCE_ONSLAUGHT;
	public static final Modifier ESSENCE_CRITICAL_STRIKE_CHANCE;
	

	static {

		ESSENCE_PHYSICAL_DAMAGE_FLAT = new Modifier(
				"essence_physical_damage_flat",
				List.of("damage", "physical", "attack"),
				List.of(
						new ModifierTier("Lesser Essence of Abrasion", 8, 0, new Pair<>(5, 8), new Pair<>(10, 15), "",
								""),
						new ModifierTier("Essence of Abrasion", 46, 0, new Pair<>(14, 21), new Pair<>(25, 37), "", ""),
						new ModifierTier("Greater Essence of Abrasion", 60, 0, new Pair<>(23, 35), new Pair<>(39, 59),
								"", "")),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"PhysicalDamage",
				"Adds # to # Physical Damage");

		ESSENCE_FIRE_DAMAGE_FLAT = new Modifier(
				"essence_fire_damage_flat",
				List.of("damage", "elemental", "fire", "attack"),
				List.of(
						new ModifierTier("Lesser Essence of Flames", 8, 0, new Pair<>(6, 9), new Pair<>(10, 16), "",
								""),
						new ModifierTier("Essence of Flames", 46, 0, new Pair<>(30, 37), new Pair<>(45, 56), "", ""),
						new ModifierTier("Greater Essence of Flames", 60, 0, new Pair<>(56, 70), new Pair<>(84, 107),
								"", "")),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"FireDamage",
				"Adds # to # Fire Damage");

		ESSENCE_COLD_DAMAGE_FLAT = new Modifier(
				"essence_cold_damage_flat",
				List.of("damage", "elemental", "cold", "attack"),
				List.of(
						new ModifierTier("Lesser Essence of Ice", 8, 0, new Pair<>(5, 8), new Pair<>(9, 14), "", ""),
						new ModifierTier("Essence of Ice", 46, 0, new Pair<>(25, 30), new Pair<>(38, 46), "", ""),
						new ModifierTier("Greater Essence of Ice", 60, 0, new Pair<>(46, 57), new Pair<>(70, 88), "",
								"")),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"ColdDamage",
				"Adds # to # Cold Damage");

		ESSENCE_LIGHTNING_DAMAGE_FLAT = new Modifier(
				"essence_lightning_damage_flat",
				List.of("damage", "elemental", "lightning", "attack"),
				List.of(
						new ModifierTier("Lesser Essence of Electricity", 8, 0, new Pair<>(1, 2), new Pair<>(19, 27),
								"", ""),
						new ModifierTier("Essence of Electricity", 46, 0, new Pair<>(1, 4), new Pair<>(80, 88), "", ""),
						new ModifierTier("Greater Essence of Electricity", 60, 0, new Pair<>(1, 8),
								new Pair<>(128, 162), "", "")),
				ModifierType.PREFIX,
				ModifierSource.ESSENCE,
				"LightningDamage",
				"Adds # to # Lightning Damage");

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

		ESSENCE_WEAPON_GAINED_DAMAGE_PHYSICAL = new Modifier(
				"essence_weapon_gained_damage_physical",
				List.of("damage", "physical"),
				List.of(
						new ModifierTier("Perfect Essence of Abrasion", 72, 1, new Pair<>(25, 33))),
				ModifierType.PREFIX,
				ModifierSource.PERFECT_ESSENCE,
				"MartialWeaponGainedDamage",
				"Gain # % of Damage as Extra Physical Damage");

		ESSENCE_WEAPON_GAINED_DAMAGE_FIRE = new Modifier(
				"essence_weapon_gained_damage_fire",
				List.of("elemental", "fire", "damage"),
				List.of(
						new ModifierTier("Perfect Essence of Flames", 72, 1, new Pair<>(25, 33))),
				ModifierType.PREFIX,
				ModifierSource.PERFECT_ESSENCE,
				"MartialWeaponGainedDamage",
				"Gain # % of Damage as Extra Fire Damage");

		ESSENCE_WEAPON_GAINED_DAMAGE_COLD = new Modifier(
				"essence_weapon_gained_damage_cold",
				List.of("elemental", "cold", "damage"),
				List.of(
						new ModifierTier("Perfect Essence of Ice", 72, 1, new Pair<>(25, 33))),
				ModifierType.PREFIX,
				ModifierSource.PERFECT_ESSENCE,
				"MartialWeaponGainedDamage",
				"Gain # % of Damage as Extra Cold Damage");

		ESSENCE_WEAPON_GAINED_DAMAGE_LIGHTNING = new Modifier(
				"essence_weapon_gained_damage_lightning",
				List.of("elemental", "lightning", "damage"),
				List.of(
						new ModifierTier("Perfect Essence of Electricity", 72, 1, new Pair<>(25, 33))),
				ModifierType.PREFIX,
				ModifierSource.PERFECT_ESSENCE,
				"MartialWeaponGainedDamage",
				"Gain # % of Damage as Extra Lightning Damage");



		// SUFFIXES

		ESSENCE_INCREASED_ATTACK_SPEED = new Modifier(
				"essence_increased_attack_speed",
				List.of("attack", "speed"),
				List.of(
						new ModifierTier("Lesser Essence of Haste", 22, 1, new Pair<>(11, 13)),
						new ModifierTier("Essence of Haste", 37, 1, new Pair<>(17, 19)),
						new ModifierTier("Greater Essence of Haste", 60, 1, new Pair<>(23, 25))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"IncreasedAttackSpeed",
				"#% increased Attack Speed");

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

		ESSENCE_ALL_ATTACK_SKILL_LEVEL = new Modifier(
				"essence_all_attack_skill_level",
				List.of("attack"),
				List.of(
						new ModifierTier("Perfect Essence of Battle", 72, 1, new Pair<>(6, 6))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Attack Skills");

		ESSENCE_ONSLAUGHT = new Modifier(
				"essence_onslaught",
				List.of("speed"),
				List.of(
						new ModifierTier("Perfect Essence of Haste", 72, 1, new Pair<>(20, 25))),
				ModifierType.SUFFIX,
				ModifierSource.PERFECT_ESSENCE,
				"Onslaught",
				"#% chance to gain Onslaught on Killing Hits with this Weapon");

		ESSENCE_CRITICAL_STRIKE_CHANCE = new Modifier(
				"essence_critical_strike_chance",
				List.of("critical", "attack"),
				List.of(
						new ModifierTier("Lesser Essence of Seeking", 20, 1, new Pair<>(1.51, 2.10)),
						new ModifierTier("Essence of Seeking", 30, 1, new Pair<>(2.11, 2.70)),
						new ModifierTier("Greater Essence of Seeking", 44, 1, new Pair<>(3.11, 3.80))),
				ModifierType.SUFFIX,
				ModifierSource.ESSENCE,
				"CriticalStrikeChanceIncrease",
				"+#% to Critical Hit Chance");


	}
}
