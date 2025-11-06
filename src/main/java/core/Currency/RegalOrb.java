package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Modifier_class.Modifier;

public class RegalOrb implements Crafting_Action {
	
	public CurrencyTier tier;

	@Override
    public Crafting_Action copy() {
        return new RegalOrb(this.tier);
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
	public RegalOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public RegalOrb() {
		this.tier = CurrencyTier.BASE;
	}

	@Override
	public String getName() {
		return "Regal Orb (" + tier + ")";
	}
}
