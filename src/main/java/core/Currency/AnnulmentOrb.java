package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Currency.Omens_currency.Omen;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;

public class AnnulmentOrb implements Crafting_Action {

	@Override
    public Crafting_Action copy() {
        return new AnnulmentOrb();
    }


	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		
		for (Crafting_Candidate candidate : CandidateList)
			CandidateListCopy.addAll(evaluateAffixeswithAnnul(item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags));
        return CandidateListCopy;
    }


	@Override
	public String getName() {
		return "Orb of Annulment";
	}
}
