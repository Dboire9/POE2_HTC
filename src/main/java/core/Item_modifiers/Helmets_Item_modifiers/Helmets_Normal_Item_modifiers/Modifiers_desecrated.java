package core.Item_modifiers.Helmets_Item_modifiers.Helmets_Normal_Item_modifiers;

import core.Modifier_class.*;

import java.util.List;

public class Modifiers_desecrated {

	// NO PREFIXES FOR THE GLOVES

	// SHARED SUFFIXES
	public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
	public static final Modifier DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE;
	public static final Modifier DESECRATED_GLORY_GENERATION;
	public static final Modifier DESECRATED_PRESENCE_RADIUS;
	public static final Modifier DESECRATED_SPIRIT_RESERVATION_EFFICIENCY;
	public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE;
	public static final Modifier DESECRATED_ELEMENTAL_DAMAGE_TAKEN_RECOUPED_AS_ENERGY_SHIELD;
	public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
	public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_LIFE_COST_EFFICIENCY;

	// DEX SUFFIXES
	public static final Modifier DESECRATED_INCREASED_CRITICAL_DAMAGE_BONUS;
	public static final Modifier DESECRATED_MARK_DAMAGE;

	// INT SUFFIXES
	public static final Modifier DESECRATED_ARCANE_SURGE_EFFECT;

	static {

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

		DESECRATED_SPIRIT_RESERVATION_EFFICIENCY = new Modifier(
				"spirit_reservation_efficiency",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(6, 12))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"SpiritReservationEfficiency",
				"#% increased Spirit Reservation Efficiency of Skills");

		DESECRATED_DAMAGE_TAKEN_RECOUPED_AS_LIFE = new Modifier(
				"damage_taken_recouped_as_life",
				List.of("amanamu_mod", "life"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"DamageTakenGainedAsLife",
				"#% of Damage taken Recouped as Life");

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

		DESECRATED_GLORY_GENERATION = new Modifier(
				"glory_generation",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"GloryGeneration",
				"#% increased Glory generation");

		DESECRATED_PRESENCE_RADIUS = new Modifier(
				"presence_radius",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1, new Pair<>(25, 35))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"PresenceRadius",
				"#% increased Presence Area of Effect");

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

		DESECRATED_ARMOUR_APPLIES_TO_CHAOS_DAMAGE = new Modifier(
				"armour_applies_to_chaos_damage",
				List.of("kurgal_mod"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(23, 31))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ArmourAppliesToChaosDamage",
				"+#% of Armour also applies to Chaos Damage");

		DESECRATED_ELEMENTAL_DAMAGE_TAKEN_RECOUPED_AS_ENERGY_SHIELD = new Modifier(
				"elemental_damage_recouped_as_energy_shield",
				List.of("kurgal_mod", "elemental", "energy_shield"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ElementalDamageTakenRecoupedAsEnergyShield",
				"#% of Elemental Damage taken Recouped as Energy Shield");

		DESECRATED_MANA_COST_EFFICIENCY = new Modifier(
				"mana_cost_efficiency",
				List.of("kurgal_mod", "mana"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(6, 10))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ManaCostEfficiency",
				"#% increased Mana Cost Efficiency");

		DESECRATED_LIFE_COST_EFFICIENCY = new Modifier(
				"life_cost_efficiency",
				List.of("ulaman_mod", "life"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(8, 12))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"LifeCostEfficiency",
				"#% increased Life Cost Efficiency");

		// DEX SUFFIXES

		DESECRATED_INCREASED_CRITICAL_DAMAGE_BONUS = new Modifier(
				"increased_critical_damage_bonus",
				List.of("ulaman_mod", "damage", "critical"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(13, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"CriticalStrikeMultiplier",
				"#% increased Critical Damage Bonus");

		DESECRATED_MARK_DAMAGE = new Modifier(
				"mark_damage",
				List.of("ulaman_mod"),
				List.of(
						new ModifierTier("of Ulaman", 65, 3, new Pair<>(4, 8))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"MarkDamage",
				"Enemies you Mark take #% increased Damage");

		// INT SUFFIXES

		DESECRATED_ARCANE_SURGE_EFFECT = new Modifier(
				"arcane_surge_effect",
				List.of("kurgal_mod"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1, new Pair<>(20, 30))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ArcaneSurgeEffect",
				"#% increased effect of Arcane Surge on you");

	}
}
