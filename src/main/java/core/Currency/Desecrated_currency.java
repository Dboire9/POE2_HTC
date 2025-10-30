package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.Modifier;

public class Desecrated_currency implements Crafting_Action{


	@Override
    public Crafting_Action copy() {
        return new Desecrated_currency();
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Affix_modifiers = new ArrayList<>();
		
		all_Affix_modifiers.addAll(item.base.getDesecratedAllowedPrefixes());
		all_Affix_modifiers.addAll(item.base.getDesecratedAllowedSuffixes());

		for (Crafting_Candidate candidate : CandidateList)
		{
			// As we cannot have two desecrated mods
			CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, new_omen));
		}
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public Desecrated_currency() {};

	@Override
	public String getName() {
		return "Desecrated Currency";
	}
}
