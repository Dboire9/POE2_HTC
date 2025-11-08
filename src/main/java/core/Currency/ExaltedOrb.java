package core.Currency;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;

import core.Modifier_class.Modifier;

public class ExaltedOrb implements Crafting_Action {

	public CurrencyTier tier;
	public Set<Omen> omens;
	public enum Omen
	{
		None,
		OmenofHomogenisingExaltation,
		OmenofSinistralExaltation,
		OmenofDextralExaltation,
		// Not putting greater exaltation for now
	};

	@Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }


	@Override
    public Crafting_Action copy() {
        return new ExaltedOrb(this.tier);
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Affix_modifiers = new ArrayList<>();
		
		all_Affix_modifiers.addAll(item.base.getNormalAllowedPrefixes());
		all_Affix_modifiers.addAll(item.base.getNormalAllowedSuffixes());

		for (Crafting_Candidate candidate : CandidateList)
			CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public ExaltedOrb(CurrencyTier tier) {
		this.tier = tier;
		this.omens = new HashSet<>();
        this.omens.add(Omen.None);
	}

	// Default constructor
	public ExaltedOrb() {
		this.tier = CurrencyTier.BASE;
		this.omens = new HashSet<>();
        this.omens.add(Omen.None);
	}

	@Override
	public String getName() {
		return "Exalted Orb (" + tier + ")";
	}

	public void addOmen(Omen omen) {
		// If we are adding Sinistral, remove Dextral if present
		if (omen == Omen.OmenofSinistralExaltation && omens.contains(Omen.OmenofDextralExaltation))
			omens.remove(Omen.OmenofDextralExaltation);
	
		// If we are adding Dextral, remove Sinistral if present
		if (omen == Omen.OmenofDextralExaltation && omens.contains(Omen.OmenofSinistralExaltation))
			omens.remove(Omen.OmenofSinistralExaltation);
	
		// If adding a real omen (not None), remove None from the set
		if (omen != Omen.None)
			omens.remove(Omen.None);
	
		// Finally, add the new omen
		omens.add(omen);
	}
}
