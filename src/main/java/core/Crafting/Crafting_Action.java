package core.Crafting;

import java.util.List;
import java.util.Map;

import core.Modifier_class.*;

public interface Crafting_Action {

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}


    List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags); // transforms the item
    int getCost();                        // relative cost of using this action
    String getName();                        // name for display
}