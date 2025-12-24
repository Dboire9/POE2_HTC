package core.Item_modifiers.TwoHand_Item_modifiers.Staves_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_normal {

	// PREFIXES
	public static final Modifier MAXIMUM_MANA;
	public static final Modifier INCREASED_SPELL_DAMAGE;
	public static final Modifier HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA;
	public static final Modifier INCREASED_FIRE_DAMAGE;
	public static final Modifier INCREASED_COLD_DAMAGE;
	public static final Modifier INCREASED_LIGHTNING_DAMAGE;
	public static final Modifier INCREASED_CHAOS_DAMAGE;
	public static final Modifier INCREASED_SPELL_PHYSICAL_DAMAGE;
	public static final Modifier DAMAGE_AS_EXTRA_FIRE_DAMAGE;
	public static final Modifier DAMAGE_AS_EXTRA_COLD_DAMAGE;
	public static final Modifier DAMAGE_AS_EXTRA_LIGHTNING_DAMAGE;

	// SUFFIXES
	public static final Modifier INTELLIGENCE;
	public static final Modifier REDUCED_ATTRIBUTE_REQUIREMENTS;
	public static final Modifier ALL_SPELL_SKILL_LEVEL;
	public static final Modifier FIRE_SKILL_LEVEL;
	public static final Modifier COLD_SKILL_LEVEL;
	public static final Modifier LIGHTNING_SKILL_LEVEL;
	public static final Modifier CHAOS_SKILL_LEVEL;
	public static final Modifier PHYSICAL_SKILL_LEVEL;
	public static final Modifier MANA_REGENERATION_RATE;
	public static final Modifier LIFE_PER_ENEMY_KILLED;
	public static final Modifier MANA_PER_ENEMY_KILLED;
	public static final Modifier INCREASED_CAST_SPEED;
	public static final Modifier INCREASED_CRITICAL_HIT_CHANCE_SPELLS;
	public static final Modifier CRITICAL_SPELL_DAMAGE_BONUS;
	public static final Modifier HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS;
	public static final Modifier INCREASED_FLAMMABILITY_MAGNITUDE;
	public static final Modifier INCREASED_FREEZE_BUILDUP;
	public static final Modifier INCREASED_SHOCK_CHANCE;

	static {

		// PREFIXES

		MAXIMUM_MANA = new Modifier(
				"maximum_mana",
				List.of("mana"),
				List.of(
						new ModifierTier("Beryl", 1, 1000, new Pair<>(14, 20)),
						new ModifierTier("Cobalt", 6, 1000, new Pair<>(21, 34)),
						new ModifierTier("Azure", 16, 1000, new Pair<>(35, 48)),
						new ModifierTier("Sapphire", 25, 1000, new Pair<>(49, 76)),
						new ModifierTier("Cerulean", 33, 1000, new Pair<>(77, 90)),
						new ModifierTier("Aqua", 38, 1000, new Pair<>(91, 111)),
						new ModifierTier("Opalescent", 46, 1000, new Pair<>(112, 125)),
						new ModifierTier("Gentian", 54, 1000, new Pair<>(126, 146)),
						new ModifierTier("Chalybeous", 60, 1000, new Pair<>(147, 174)),
						new ModifierTier("Mazarine", 65, 1000, new Pair<>(175, 209)),
						new ModifierTier("Blue", 70, 1000, new Pair<>(210, 230))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"IncreasedMana",
				"+# to maximum Mana");

		INCREASED_SPELL_DAMAGE = new Modifier(
				"increased_spell_damage",
				List.of("damage", "caster"),
				List.of(
						new ModifierTier("Apprentice's", 1, 1000, new Pair<>(35, 49)),
						new ModifierTier("Adept's", 8, 1000, new Pair<>(50, 64)),
						new ModifierTier("Scholar's", 16, 1000, new Pair<>(65, 79)),
						new ModifierTier("Professor's", 33, 600, new Pair<>(80, 94)),
						new ModifierTier("Occultist's", 46, 400, new Pair<>(95, 109)),
						new ModifierTier("Incanter's", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Glyphic", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Runic", 80, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponCasterDamagePrefix",
				"+#% Increased Spell Damage");

		HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA = new Modifier(
				"increased_spell_damage_and_maximum_mana",
				List.of("mana", "damage", "caster"),
				List.of(
						new ModifierTier("Caster's", 2, 1000, new Pair<>(21, 27), new Pair<>(26, 30),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Conjuror's", 11, 1000, new Pair<>(28, 34), new Pair<>(31, 35),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Wizard's", 23, 1000, new Pair<>(35, 41), new Pair<>(36, 41),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Warlock's", 38, 600, new Pair<>(42, 48), new Pair<>(42, 47),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Mage's", 48, 400, new Pair<>(49, 55), new Pair<>(48, 53),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Archmage's", 63, 200, new Pair<>(56, 63), new Pair<>(54, 59),
								"increased_spell_damage", "maximum_mana"),
						new ModifierTier("Lich's", 79, 100, new Pair<>(64, 69), new Pair<>(60, 64),
								"increased_spell_damage", "maximum_mana")),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"SpellDamageAndMana",
				"+#% increased Spell Damage\n+# to maximum Mana");

		INCREASED_FIRE_DAMAGE = new Modifier(
				"increased_fire_damage",
				List.of("damage", "elemental", "fire"),
				List.of(
						new ModifierTier("Searing", 2, 500, new Pair<>(35, 49)),
						new ModifierTier("Sizzling", 8, 500, new Pair<>(50, 64)),
						new ModifierTier("Blistering", 16, 500, new Pair<>(65, 79)),
						new ModifierTier("Cauterising", 33, 400, new Pair<>(80, 94)),
						new ModifierTier("Smoldering", 46, 300, new Pair<>(95, 109)),
						new ModifierTier("Magmatic", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Volcanic", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Pyromancer's", 81, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponDamageTypePrefix",
				"+#% Increased Fire Damage");

		INCREASED_COLD_DAMAGE = new Modifier(
				"increased_cold_damage",
				List.of("damage", "elemental", "cold"),
				List.of(
						new ModifierTier("Bitter", 2, 500, new Pair<>(35, 49)),
						new ModifierTier("Biting", 8, 500, new Pair<>(50, 64)),
						new ModifierTier("Alpine", 16, 500, new Pair<>(65, 79)),
						new ModifierTier("Snowy", 33, 400, new Pair<>(80, 94)),
						new ModifierTier("Hailing", 46, 300, new Pair<>(95, 109)),
						new ModifierTier("Arctic", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Crystalline", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Cryomancer's", 81, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponDamageTypePrefix",
				"+#% Increased Cold Damage");

		INCREASED_LIGHTNING_DAMAGE = new Modifier(
				"increased_lightning_damage",
				List.of("damage", "elemental", "lightning"),
				List.of(
						new ModifierTier("Charged", 2, 500, new Pair<>(35, 49)),
						new ModifierTier("Hissing", 8, 500, new Pair<>(50, 64)),
						new ModifierTier("Bolting", 16, 500, new Pair<>(65, 79)),
						new ModifierTier("Coursing", 33, 400, new Pair<>(80, 94)),
						new ModifierTier("Striking", 46, 300, new Pair<>(95, 109)),
						new ModifierTier("Smiting", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Ionising", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Electromancer's", 81, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponDamageTypePrefix",
				"+#% Increased Lightning Damage");

		INCREASED_CHAOS_DAMAGE = new Modifier(
				"increased_chaos_damage",
				List.of("damage", "chaos"),
				List.of(
						new ModifierTier("Impure", 2, 500, new Pair<>(35, 49)),
						new ModifierTier("Tainted", 8, 500, new Pair<>(50, 64)),
						new ModifierTier("Clouded", 16, 500, new Pair<>(65, 79)),
						new ModifierTier("Darkened", 33, 400, new Pair<>(80, 94)),
						new ModifierTier("Malignant", 46, 300, new Pair<>(95, 109)),
						new ModifierTier("Vile", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Twisted", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Malevolent", 81, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponDamageTypePrefix",
				"+#% Increased Chaos Damage");

		INCREASED_SPELL_PHYSICAL_DAMAGE = new Modifier(
				"increased_spell_physical_damage",
				List.of("damage", "physical"),
				List.of(
						new ModifierTier("Punishing", 2, 500, new Pair<>(35, 49)),
						new ModifierTier("Unforgiving", 8, 500, new Pair<>(50, 64)),
						new ModifierTier("Vengeful", 16, 500, new Pair<>(65, 79)),
						new ModifierTier("Sadistic", 33, 400, new Pair<>(80, 94)),
						new ModifierTier("Pitiless", 46, 300, new Pair<>(95, 109)),
						new ModifierTier("Agonising", 60, 200, new Pair<>(110, 129)),
						new ModifierTier("Oppressor's", 70, 100, new Pair<>(130, 149)),
						new ModifierTier("Torturer's", 81, 50, new Pair<>(150, 169))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"WeaponDamageTypePrefix",
				"+#% Increased Spell Physical Damage");

		DAMAGE_AS_EXTRA_FIRE_DAMAGE = new Modifier(
				"damage_as_extra_fire_damage",
				List.of("damage", "elemental", "fire"),
				List.of(
						new ModifierTier("Fervent", 5, 1000, new Pair<>(20, 23)),
						new ModifierTier("Ardent", 16, 1000, new Pair<>(24, 28)),
						new ModifierTier("Fanatic's", 33, 1000, new Pair<>(29, 32)),
						new ModifierTier("Zealot's", 46, 1000, new Pair<>(33, 37)),
						new ModifierTier("Infernal", 60, 1000, new Pair<>(38, 41)),
						new ModifierTier("Flamebound", 80, 1000, new Pair<>(42, 45))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"FireDamage",
				"% of Damage as Extra Fire Damage");

		DAMAGE_AS_EXTRA_COLD_DAMAGE = new Modifier(
				"damage_as_extra_cold_damage",
				List.of("damage", "elemental", "cold"),
				List.of(
						new ModifierTier("Malignant", 5, 1000, new Pair<>(20, 23)),
						new ModifierTier("Pernicious", 16, 1000, new Pair<>(24, 28)),
						new ModifierTier("Destructive", 33, 1000, new Pair<>(29, 32)),
						new ModifierTier("Malicious", 46, 1000, new Pair<>(33, 37)),
						new ModifierTier("Ruthless", 60, 1000, new Pair<>(38, 41)),
						new ModifierTier("Frostbound", 80, 1000, new Pair<>(42, 45))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"ColdDamage",
				"% of Damage as Extra Cold Damage");

		DAMAGE_AS_EXTRA_LIGHTNING_DAMAGE = new Modifier(
				"damage_as_extra_lightning_damage",
				List.of("damage", "elemental", "lightning"),
				List.of(
						new ModifierTier("Deadly", 5, 1000, new Pair<>(20, 23)),
						new ModifierTier("Lethal", 16, 1000, new Pair<>(24, 28)),
						new ModifierTier("Fatal", 33, 1000, new Pair<>(29, 32)),
						new ModifierTier("Vorpal", 46, 1000, new Pair<>(33, 37)),
						new ModifierTier("Electrifying", 60, 1000, new Pair<>(38, 41)),
						new ModifierTier("Stormbound", 80, 1000, new Pair<>(42, 45))),
				ModifierType.PREFIX,
				ModifierSource.NORMAL,
				"LightningDamage",
				"% of Damage as Extra Lightning Damage");

		// SUFFIXES

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

		ALL_SPELL_SKILL_LEVEL = new Modifier(
				"all_spell_skill_level",
				List.of("caster", "gem"),
				List.of(
						new ModifierTier("of the Mage", 5, 200, new Pair<>(2, 2)),
						new ModifierTier("of the Enchanter", 25, 150, new Pair<>(3, 3)),
						new ModifierTier("of the Evoker", 55, 100, new Pair<>(4, 4)),
						new ModifierTier("of the Sorcerer", 78, 50, new Pair<>(5, 6))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Spell Skills");

		FIRE_SKILL_LEVEL = new Modifier(
				"fire_skill_level",
				List.of("elemental", "fire", "caster", "gem"),
				List.of(
						new ModifierTier("of Coals", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Cinders", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of Flames", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of Immolation", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of Inferno", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Fire Spell Skills");

		COLD_SKILL_LEVEL = new Modifier(
				"cold_skill_level",
				List.of("elemental", "cold", "caster", "gem"),
				List.of(
						new ModifierTier("of Snow", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Sleet", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of Ice", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of Rime", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of Frostbite", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Cold Spell Skills");

		LIGHTNING_SKILL_LEVEL = new Modifier(
				"lightning_skill_level",
				List.of("elemental", "lightning", "caster", "gem"),
				List.of(
						new ModifierTier("of Sparks", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Static", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of Electricity", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of Voltage", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of Thunder", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Lightning Spell Skills");

		CHAOS_SKILL_LEVEL = new Modifier(
				"chaos_skill_level",
				List.of("chaos", "caster", "gem"),
				List.of(
						new ModifierTier("of Anarchy", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Turmoil", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of Ruin", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of Havoc", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of Armageddon", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Chaos Spell Skills");

		PHYSICAL_SKILL_LEVEL = new Modifier(
				"physical_skill_level",
				List.of("physical", "caster", "gem"),
				List.of(
						new ModifierTier("of Agony", 2, 1000, new Pair<>(2, 2)),
						new ModifierTier("of Suffering", 18, 750, new Pair<>(3, 3)),
						new ModifierTier("of Torment", 36, 500, new Pair<>(4, 4)),
						new ModifierTier("of Desolation", 55, 250, new Pair<>(5, 6)),
						new ModifierTier("of Grief", 81, 100, new Pair<>(7, 7))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Physical Spell Skills");

		MANA_REGENERATION_RATE = new Modifier(
				"mana_regeneration_rate",
				List.of("mana"),
				List.of(
						new ModifierTier("of Excitement", 1, 1000, new Pair<>(15, 29)),
						new ModifierTier("of Joy", 18, 1000, new Pair<>(30, 44)),
						new ModifierTier("of Elation", 29, 1000, new Pair<>(45, 59)),
						new ModifierTier("of Bliss", 42, 1000, new Pair<>(60, 74)),
						new ModifierTier("of Euphoria", 55, 1000, new Pair<>(75, 89)),
						new ModifierTier("of Nirvana", 79, 1000, new Pair<>(90, 104))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"ManaRegeneration",
				"#% increased Mana Regeneration Rate");

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

		INCREASED_CAST_SPEED = new Modifier(
				"increased_cast_speed",
				List.of("caster", "speed"),
				List.of(
						new ModifierTier("of Talent", 1, 1000, new Pair<>(14, 19)),
						new ModifierTier("of Nimbleness", 15, 1000, new Pair<>(20, 25)),
						new ModifierTier("of Expertise", 30, 1000, new Pair<>(26, 31)),
						new ModifierTier("of Sortilege", 45, 1000, new Pair<>(32, 37)),
						new ModifierTier("of Legerdemain", 60, 1000, new Pair<>(38, 43)),
						new ModifierTier("of Prestidigitation", 70, 500, new Pair<>(44, 49)),
						new ModifierTier("of Finesse", 80, 250, new Pair<>(50, 52))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IncreasedCastSpeed",
				"#% increased Cast Speed");

		INCREASED_CRITICAL_HIT_CHANCE_SPELLS = new Modifier(
				"increased_critical_hit_chance_spells",
				List.of("caster", "critical"),
				List.of(
						new ModifierTier("of Menace", 11, 1000, new Pair<>(40, 49)),
						new ModifierTier("of Havoc", 21, 1000, new Pair<>(50, 59)),
						new ModifierTier("of Disaster", 28, 1000, new Pair<>(60, 69)),
						new ModifierTier("of Calamity", 41, 1000, new Pair<>(70, 79)),
						new ModifierTier("of Ruin", 59, 1000, new Pair<>(80, 89)),
						new ModifierTier("of Unmaking", 76, 1000, new Pair<>(90, 109))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"SpellCriticalStrikeChanceIncrease",
				"#% increased Critical Hit Chance for Spells");

		CRITICAL_SPELL_DAMAGE_BONUS = new Modifier(
				"critical_spell_damage_bonus",
				List.of("caster", "critical"),
				List.of(
						new ModifierTier("of Ire", 8, 1000, new Pair<>(15, 21)),
						new ModifierTier("of Anger", 21, 1000, new Pair<>(23, 29)),
						new ModifierTier("of Rage", 30, 1000, new Pair<>(30, 36)),
						new ModifierTier("of Fury", 44, 500, new Pair<>(38, 44)),
						new ModifierTier("of Ferocity", 59, 250, new Pair<>(45, 51)),
						new ModifierTier("of Destruction", 73, 125, new Pair<>(53, 59))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"CriticalStrikeMultiplier",
				"#% increased Critical Spell Damage Bonus");

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

		INCREASED_FLAMMABILITY_MAGNITUDE = new Modifier(
				"increased_flammability_magnitude",
				List.of(),
				List.of(
						new ModifierTier("of Ignition", 15, 1000, new Pair<>(51, 60)),
						new ModifierTier("of Scorching", 30, 1000, new Pair<>(61, 70)),
						new ModifierTier("of Incineration", 45, 1000, new Pair<>(71, 80)),
						new ModifierTier("of Combustion", 60, 500, new Pair<>(81, 90)),
						new ModifierTier("of Conflagration", 75, 500, new Pair<>(91, 100))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"IgniteChanceIncrease",
				"#% increased Flammability Magnitude");

		INCREASED_FREEZE_BUILDUP = new Modifier(
				"increased_freeze_buildup",
				List.of(),
				List.of(
						new ModifierTier("of Freezing", 15, 1000, new Pair<>(31, 40)),
						new ModifierTier("of Bleakness", 30, 1000, new Pair<>(41, 50)),
						new ModifierTier("of the Glacier", 45, 1000, new Pair<>(51, 60)),
						new ModifierTier("of the Hyperboreal", 60, 500, new Pair<>(61, 70)),
						new ModifierTier("of the Arctic", 75, 500, new Pair<>(71, 80))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"FreezeDamageIncrease",
				"#% increased Freeze Buildup");

		INCREASED_SHOCK_CHANCE = new Modifier(
				"increased_shock_chance",
				List.of(),
				List.of(
						new ModifierTier("of Shocking", 15, 1000, new Pair<>(51, 60)),
						new ModifierTier("of Zapping", 30, 1000, new Pair<>(61, 70)),
						new ModifierTier("of Electrocution", 45, 1000, new Pair<>(71, 80)),
						new ModifierTier("of Voltages", 60, 500, new Pair<>(81, 90)),
						new ModifierTier("of the Thunderbolt", 75, 500, new Pair<>(91, 100))),
				ModifierType.SUFFIX,
				ModifierSource.NORMAL,
				"ShockChanceIncrease",
				"#% increased chance to Shock");
	}
}
