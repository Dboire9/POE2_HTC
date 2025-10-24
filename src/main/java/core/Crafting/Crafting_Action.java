package core.Crafting;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
public interface Crafting_Action {

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}

	Crafting_Action copy();


    List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags); // transforms the item

    String getName();                        // name for display

    // Default method for evaluateAffixes
    default void CreateListAndEvaluateAffixes(List<Modifier> modifiers, Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags) {
        int score;
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item);
        for (Crafting_Item items : Item_Evaluation) {
            score = Crafting_Algorithm.heuristic(items, desiredMods, desiredModTiers, CountDesiredModifierTags);
            if (score > 0) {
                Crafting_Candidate new_Candidate = Crafting_Candidate.AddCraftingCandidate(items, score, this);
                CandidateList.add(new_Candidate);
            }
        }
        Item_Evaluation.clear();
    }
	

	    default List<Crafting_Candidate> evaluateAffixeswithAug(List<Modifier> modifiers, Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags) {
        int score;
		boolean isPrefix = false;
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		for (Crafting_Candidate candidate : CandidateList)
		{
			if(modifiers != null && modifiers.get(0).type == ModifierType.PREFIX)
				isPrefix = true;
			//For the augmentation orb, we check that we are not applying a modifier on an affix already occupied, so we have only candidates with a prefix and a suffix
			if((isPrefix && candidate.currentPrefixes[0] != null) || !isPrefix && candidate.currentSuffixes[0] != null)
				return CandidateListCopy;
			item = candidate.copy();
			List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item);
			for (Crafting_Item items : Item_Evaluation) {
				score = Crafting_Algorithm.heuristic(items, desiredMods, desiredModTiers, CountDesiredModifierTags);
				if (score > candidate.score) {
					Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score, this);
					newCandidate.actions.add(this);
					CandidateListCopy.add(newCandidate);
				}
			}
			Item_Evaluation.clear();
        }
		return CandidateListCopy;
    }
}