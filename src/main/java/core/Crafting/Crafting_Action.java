package core.Crafting;

import java.util.List;
import java.util.Map;

import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
public interface Crafting_Action {

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}


    List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags); // transforms the item
    int getCost();                        // relative cost of using this action
    String getName();                        // name for display

    // Default method for evaluateAffixes
    default void evaluateAffixes(List<Modifier> modifiers, Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags) {
        int score;
		boolean isPrefix = false;
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item);
		if(modifiers != null && modifiers.get(0).type == ModifierType.PREFIX)
			isPrefix = true;
        for (Crafting_Item items : Item_Evaluation) {
            score = Crafting_Algorithm.heuristic(items, desiredMods, desiredModTiers, CountDesiredModifierTags);
            if (score > 0) {
                Crafting_Candidate new_Candidate = Crafting_Candidate.AddCraftingCandidate(items, score, this);
				if(isPrefix)
               		new_Candidate.percentage = (new_Candidate.currentPrefixTiers[0].weight / item.get_Base_Affix_Total_Weight(modifiers)) * 100;
				else
					new_Candidate.percentage = (new_Candidate.currentSuffixTiers[0].weight / item.get_Base_Affix_Total_Weight(modifiers)) * 100;
                CandidateList.add(new_Candidate);
            }
        }
        Item_Evaluation.clear();
    }
	
}