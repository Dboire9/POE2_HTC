package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;

import core.Modifier_class.Modifier;

public class ChaosOrb implements Crafting_Action
{
	public CurrencyTier tier;

	@Override
    public Crafting_Action copy() {
        return new ChaosOrb(this.tier);
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		
		
		
		// List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		// List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();

		// for (Crafting_Candidate candidate : CandidateList)
		// {
		// 	CandidateListCopy.add(evaluateAffixes(all_Prefix_modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, undesiredMods));
		// 	CandidateListCopy.add(evaluateAffixes(all_Suffix_Modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, undesiredMods));
		// }
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public ChaosOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public ChaosOrb() {
		this.tier = CurrencyTier.BASE;
	}

	@Override
	public String getName() {
		return "Chaos Orb (" + tier + ")";
	}
}
