package core.Item_modifiers.Gloves_Item_modifiers.Gloves_Hybrid_Item_modifiers;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

import java.util.List;

public class Modifiers_desecrated {

	// NO PREFIXES FOR THE GLOVES

	// SHARED SUFFIXES
	public static final Modifier DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_STRENGTH_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_STRENGTH_AND_DEXTERITY;
	public static final Modifier DESECRATED_DAZE_ON_HIT;
	public static final Modifier DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_DEXTERITY_AND_INTELLIGENCE;
	public static final Modifier DESECRATED_MANA_COST_EFFICIENCY;
	public static final Modifier DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE;
	public static final Modifier DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT;
	public static final Modifier DESECRATED_BLEED_CHANCE_INCREASE;
	public static final Modifier DESECRATED_POISON_CHANCE_INCREASE;

	// STR SUFFIXES
	public static final Modifier DESECRATED_INSTANT_LEECH_PERCENT;

	// DEX SUFFIXES
	public static final Modifier DESECRATED_CURSE_AREA_OF_EFFECT;
	public static final Modifier DESECRATED_IMMOBILISE;

	// INT SUFFIXES
	public static final Modifier DESECRATED_ARCANE_SURGE_ON_CRIT;
	public static final Modifier DESECRATED_INCREASED_CAST_SPEED_ON_FULL_LIFE;
	public static final Modifier DESECRATED_INCREASED_SKILL_SPEED_ON_FRENZY_CONSUMPTION;
	public static final Modifier DESECRATED_INCISION_CHANCE;

	static {

		DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
				"fire_resistance", "chaos_resistance",
				List.of("amanamu_mod", "elemental", "fire", "chaos", "resistance"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(13, 17), new Pair<>(13, 17),
								"fire_resistance", "chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"FireAndChaosDamageResistance",
				"+#% to Fire and Chaos Resistances");

		DESECRATED_STRENGTH_AND_INTELLIGENCE = new Modifier(
				"strength", "intelligence",
				List.of("amanamu_mod", "attribute"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(9, 15), new Pair<>(9, 15), "strength",
								"intelligence")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"StrengthAndIntelligence",
				"+# to Strength and Intelligence");

		DESECRATED_STRENGTH_AND_DEXTERITY = new Modifier(
				"strength", "dexterity",
				List.of("ulaman_mod", "attribute"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(9, 15), new Pair<>(9, 15), "strength",
								"dexterity")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"StrengthAndDexterity",
				"+# to Strength and Dexterity");

		DESECRATED_DAZE_ON_HIT = new Modifier(
				"daze_on_hit",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"DazeBuildup",
				"#% chance to Daze on Hit");

		DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE = new Modifier(
				"cold_resistance", "chaos_resistance",
				List.of("kurgal_mod", "elemental", "cold", "chaos", "resistance"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(13, 17), new Pair<>(13, 17),
								"cold_resistance", "chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ColdAndChaosDamageResistance",
				"+#% to Cold and Chaos Resistances");

		DESECRATED_DEXTERITY_AND_INTELLIGENCE = new Modifier(
				"dexterity", "intelligence",
				List.of("kurgal_mod", "attribute"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(9, 15), new Pair<>(9, 15), "dexterity",
								"intelligence")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"DexterityAndIntelligence",
				"+# to Dexterity and Intelligence");

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
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(13, 17), new Pair<>(13, 17),
								"lightning_resistance", "chaos_resistance")),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"LightningAndChaosDamageResistance",
				"+#% to Lightning and Chaos Resistances");

		DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT = new Modifier(
				"increased_magnitude_ailment_effect",
				List.of("ulaman_mod", "damage", "ailment"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1, new Pair<>(10, 20))),
				ModifierType.PREFIX,
				ModifierSource.DESECRATED,
				"AilmentEffect",
				"#% increased Magnitude of Ailments you inflict");

		DESECRATED_BLEED_CHANCE_INCREASE = new Modifier(
				"bleed_chance_increase",
				List.of("ulaman_mod"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(20, 30))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"BleedChanceIncrease",
				"#% increased chance to inflict Bleeding");

		DESECRATED_POISON_CHANCE_INCREASE = new Modifier(
				"poison_chance_increase",
				List.of("ulaman_mod"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(20, 30))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"PoisonChanceIncrease",
				"#% increased chance to Poison");

		// GLOVES STR SUFFIXES

		DESECRATED_INSTANT_LEECH_PERCENT = new Modifier(
				"instant_leech_percent",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(8, 15))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"InstantLeechPercent",
				"#% of Leech is Instant");

		// GLOVES DEX SUFFIXES

		DESECRATED_CURSE_AREA_OF_EFFECT = new Modifier(
				"curse_area_of_effect",
				List.of("amanamu_mod", "caster", "curse"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(12, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"CurseAreaOfEffect",
				"#% increased Area of Effect of Curses");

		DESECRATED_IMMOBILISE = new Modifier(
				"immobilisation_buildup",
				List.of("amanamu_mod"),
				List.of(
						new ModifierTier("of Amanamu", 65, 1000, new Pair<>(10, 20))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"Immobilise",
				"#% increased Immobilisation buildup");

		// GLOVES INT SUFFIXES

		DESECRATED_ARCANE_SURGE_ON_CRIT = new Modifier(
				"arcane_surge_on_crit",
				List.of("kurgal_mod", "critical"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(10, 15))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"ArcaneSurgeOnCrit",
				"#% chance to Gain Arcane Surge when you deal a Critical Hit");

		DESECRATED_INCREASED_CAST_SPEED_ON_FULL_LIFE = new Modifier(
				"increased_cast_speed_on_full_life",
				List.of("kurgal_mod", "caster", "speed"),
				List.of(
						new ModifierTier("of Kurgal", 65, 1000, new Pair<>(8, 15))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"CastSpeedOnFullLife",
				"#% increased Cast Speed when on Full Life");

		DESECRATED_INCREASED_SKILL_SPEED_ON_FRENZY_CONSUMPTION = new Modifier(
				"increased_skill_speed_on_frenzy_consumption",
				List.of("ulaman_mod", "speed"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(8, 12))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"IncreasedSpeed",
				"#% increased Skill Speed if you've consumed a Frenzy Charge Recently");

		DESECRATED_INCISION_CHANCE = new Modifier(
				"incision_chance",
				List.of("ulaman_mod", "damage", "physical", "ailment"),
				List.of(
						new ModifierTier("of Ulaman", 65, 1000, new Pair<>(15, 25))),
				Modifier.ModifierType.SUFFIX,
				Modifier.ModifierSource.DESECRATED,
				"IncisionChance",
				"#% chance for Attack Hits to apply Incision");

	}
}
