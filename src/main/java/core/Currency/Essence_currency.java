package core.Currency;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map; // Ensure this import is correct
import java.util.function.Function;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Currency.Essences.Essences;

import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;

public class Essence_currency implements Crafting_Action {
	
	public enum EssenceTier {
		LESSER, NORMAL, GREATER, PERFECT
	}

	protected String essenceFamily;
	protected EssenceTier tier;

	public Essence_currency(String essenceFamily, EssenceTier tier) {
		this.essenceFamily = essenceFamily;
		this.tier = tier;
	}

	// Default constructor
	public Essence_currency() {
		super();
	}

	@Override
	public Essence_currency copy() {
		return new Essence_currency(this.essenceFamily, this.tier);
	}

	public static List<Essence_currency> createEssences() {
		List<Essence_currency> allEssences = new ArrayList<>();
	
		for (Map.Entry<String, Function<EssenceTier, Essence_currency>> entry : registry.entrySet()) {
			Function<EssenceTier, Essence_currency> constructor = entry.getValue();
	
			for (EssenceTier tier : EssenceTier.values()) {
				allEssences.add(constructor.apply(tier));
			}
		}
	
		return allEssences;
	}

	public String getName() {
		return "Essence of " + essenceFamily + " (" + tier + ")";
	}

	// For constructing the essences more easily
	private static final Map<String, Function<Essence_currency.EssenceTier, Essence_currency>> registry = new HashMap<>();

	static {
		// Register all your essences here
		registry.put("Body", Essences.EssenceOfTheBody::new);
		registry.put("Mind", Essences.EssenceOfTheMind::new);
		registry.put("Enhancement", Essences.EssenceOfEnhancement::new);
		registry.put("Abrasion", Essences.EssenceOfAbrasion::new);
		registry.put("Flames", Essences.EssenceOfFlames::new);
		registry.put("Ice", Essences.EssenceOfIce::new);
		registry.put("Electricity", Essences.EssenceOfElectricity::new);
		registry.put("Ruin", Essences.EssenceOfRuin::new);
		registry.put("Battle", Essences.EssenceOfBattle::new);
		registry.put("Sorcery", Essences.EssenceOfSorcery::new);
		registry.put("Haste", Essences.EssenceOfHaste::new);
		registry.put("Infinite", Essences.EssenceOfInfinite::new);
		registry.put("Command", Essences.EssenceOfCommand::new);
		registry.put("Seeking", Essences.EssenceOfSeeking::new);
		registry.put("Alacrity", Essences.EssenceOfAlacrity::new);
		registry.put("Opulence", Essences.EssenceOfOpulence::new);
		registry.put("Grounding", Essences.EssenceOfGrounding::new);
		registry.put("Insulation", Essences.EssenceOfInsulation::new);
		registry.put("Thawing", Essences.EssenceOfThawing::new);
		registry.put("Abyss", Essences.EssenceOfSorcery::new);
		registry.put("Horror", Essences.EssenceOfHorror::new);
		registry.put("Hysteria", Essences.EssenceOfHysteria::new);
		// registry.put("Sorcery", Essences.EssenceOfAbyss::new);
		// registry.put("Delirium", Essences.EssenceOfDelirium::new);
	}

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> allEssences = new ArrayList<>();

		List<Modifier> perfectEssences = new ArrayList<>();

		allEssences.addAll(item.base.getEssencesAllowedPrefixes());
		allEssences.addAll(item.base.getEssencesAllowedSuffixes());

		for (Modifier m : allEssences) {
			for (ModifierTier tier : m.tiers) {
				if (tier.name.contains("Perfect")) {
					Modifier modCopy = new Modifier(m);
					modCopy.tiers = List.of(tier);
					perfectEssences.add(modCopy);
				}
			}
		}
		for (Crafting_Candidate candidate : CandidateList)
			CandidateListCopy.addAll(evaluateAffixes(perfectEssences, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));

		// Convert item to MAGIC

		return CandidateListCopy;
	}
}
