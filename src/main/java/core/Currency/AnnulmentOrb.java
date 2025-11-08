package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;

import core.Modifier_class.Modifier;

public class AnnulmentOrb implements Crafting_Action {


	public enum Omen { // Need to implement the real ones
        None,
        OmenofHomogenisingCoronation
    }


	@Override
    public Crafting_Action copy() {
        return new AnnulmentOrb();
    }

	@Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }


	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		
		for (Crafting_Candidate candidate : CandidateList)
		{
			CandidateListCopy.addAll(evaluateAffixeswithAnnul(item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
			if(candidate.getAllCurrentModifiers().size() >= 6 && CandidateListCopy.isEmpty())
				CandidateList.get(0).stopAnnul = true;
		}
        return CandidateListCopy;
    }


	@Override
	public String getName() {
		return "Orb of Annulment";
	}
}
