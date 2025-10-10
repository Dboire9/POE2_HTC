package core.Item_modifiers.Off_Hand_Item_modifiers.Foci_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

	// PREFIXES
	public static final Modifier DESECRATED_OFFERING_EFFECT;
	public static final Modifier DESECRATED_CURSE_EFFECTIVENESS;
	public static final Modifier DESECRATED_SPELL_AREA_OF_EFFECT;
	public static final Modifier DESECRATED_INVOCATED_SPELLS_INCREASED_DAMAGE;
	public static final Modifier DESECRATED_ADDITIONAL_SPELL_TOTEM;
	public static final Modifier DESECRATED_INCREASED_SPELL_DAMAGE_WHILE_MELEE_WEAPON;

	// SUFFIXES
	public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
	public static final Modifier DESECRATED_LEVEL_MINION_SKILL;
	public static final Modifier DESECRATED_FASTER_CURSE;
	public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_CHANCE_TO_GAIN_ADDITIONAL_INFUSION;
	public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
	public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE;
	public static final Modifier DESECRATED_SKILL_LIFE_COST;

	static {
		// PREFIXES

		DESECRATED_OFFERING_EFFECT = new Modifier(
				"offering_effect",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("Amanamu's", 65, 1, new Pair<>(12, 20))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"OfferingEffect",
				"Offering Skills have #% increased Buff effect");

		DESECRATED_CURSE_EFFECTIVENESS = new Modifier(
				"curse_effectiveness",
				List.of("amanamu_mod", "caster", "curse"),
				List.of(
						new ModifierTier("Amanamu's", 65, 1, new Pair<>(8, 16))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"CurseEffectiveness",
				"#% increased Curse Magnitudes");

		DESECRATED_SPELL_AREA_OF_EFFECT = new Modifier(
				"spell_area_of_effect",
				List.of("kurgal_mod"),
				List.of(
						new ModifierTier("Kurgal's", 65, 1, new Pair<>(10, 20))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"SpellAreaOfEffect",
				"Spell Skills have #% increased Area of Effect");

		DESECRATED_INVOCATED_SPELLS_INCREASED_DAMAGE = new Modifier(
				"invocated_spells_increased_damage",
				List.of("kurgal_mod", "caster"),
				List.of(
						new ModifierTier("Kurgal's", 65, 1, new Pair<>(61, 79))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"WeaponCasterDamagePrefix",
				"Invocated Spells deal #% increased Damage");

		DESECRATED_ADDITIONAL_SPELL_TOTEM = new Modifier(
				"additional_spell_totem",
				List.of("ulaman_mod", "caster"),
				List.of(
						new ModifierTier("Ulaman's", 65, 1, new Pair<>(1, 1))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"AdditionalSpellTotem",
				"Spell Skills have +# to maximum number of Summoned Totems");

		DESECRATED_INCREASED_SPELL_DAMAGE_WHILE_MELEE_WEAPON = new Modifier(
				"increased_spell_damage_while_melee_weapon",
				List.of("ulaman_mod", "caster"),
				List.of(
						new ModifierTier("Ulaman's", 65, 1, new Pair<>(61, 79))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"SpellDamage",
				"#% increased Spell Damage while wielding a Melee Weapon");

		// SUFFIXES

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

		DESECRATED_LEVEL_MINION_SKILL = new Modifier(
				"level_minion_skill",
				List.of("amanamu_mod", "minion", "gem"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(1, 2))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"IncreaseSocketedGemLevel",
				"+# to Level of all Minion Skills");

		DESECRATED_FASTER_CURSE = new Modifier(
				"faster_curse",
				List.of("amanamu_mod", "curse"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"CurseDelay",
				"#% faster Curse Activation");

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

		DESECRATED_CHANCE_TO_GAIN_ADDITIONAL_INFUSION = new Modifier(
				"chance_to_gain_additional_infusion",
				List.of("kurgal_mod"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(15, 25))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ChanceToGainAnAdditionalInfusion",
				"#% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type");

		DESECRATED_MANA_COST_EFFICIENCY = new Modifier(
				"mana_cost_efficiency",
				List.of("kurgal_mod", "mana"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(6, 10))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ManaCostEfficiency",
				"#% increased Mana Cost Efficiency");

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

		DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE = new Modifier(
				"spells_fire_2_additional_projectile_chance",
				List.of("ulaman_mod", "caster"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(25, 35))),
				ModifierType.SUFFIX,
				ModifierSource.DESECRATED,
				"SpellsFire2AdditionalProjectileChance",
				"#% chance for Spell Skills to fire 2 additional Projectiles");

		DESECRATED_SKILL_LIFE_COST = new Modifier(
				"skill_life_cost",
				List.of("amanamu_mod", "life", "caster"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20))),
				ModifierType.SUFFIX,
				ModifierSource.DESECRATED,
				"SkillLifeCost",
				"#% of Spell Mana Cost Converted to Life Cost");

	}
}