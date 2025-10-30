package core.Crafting;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;
public interface Crafting_Action {

	public enum CurrencyTier {
		BASE, GREATER, PERFECT
	}	

	Crafting_Action copy();

    public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, Omen new_omen); // transforms the item

    String getName();                        // name for display

    // Default method for evaluateAffixes
    default void CreateListAndEvaluateAffixes(List<Modifier> modifiers, Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags)
	{
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item, this);
        for (Crafting_Item items : Item_Evaluation) {
			double score = 0;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags);
            if (score > 0) {
				Crafting_Candidate new_Candidate = Crafting_Candidate.AddCraftingCandidate(items, score, this);
				new_Candidate.rarity = ItemRarity.MAGIC;
				new_Candidate.modifierHistory.get(0).score = score;
                CandidateList.add(new_Candidate);
            }
        }
        Item_Evaluation.clear();
    }
	

	    default List<Crafting_Candidate> evaluateAffixeswithAug(List<Modifier> modifiers, Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags) {
		boolean isPrefix = false;
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		if(modifiers != null && modifiers.get(0).type == ModifierType.PREFIX)
		isPrefix = true;
		//For the augmentation orb, we check that we are not applying a modifier on an affix already occupied, so we have only candidates with a prefix and a suffix
		if((isPrefix && candidate.currentPrefixes[0] != null) || (!isPrefix && candidate.currentSuffixes[0] != null))
			return CandidateListCopy;
		item = candidate.copy();
		List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item, this);
		for (Crafting_Item items : Item_Evaluation) {
			double score = 0;
			score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags);
			if (score > candidate.score) {
				Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score, this);
				newCandidate.prev_score = candidate.score;
				newCandidate.actions.add(this);
				newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score; 
				CandidateListCopy.add(newCandidate);
			}
		}
		Item_Evaluation.clear();
		return CandidateListCopy;
    }

	default List<Crafting_Candidate> evaluateAffixes(List<Modifier> modifiers, Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		int affixes = 0;
		List<Crafting_Item> Item_Evaluation = null;
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		item = candidate.copy();
		if(this instanceof Essence_currency)
			Item_Evaluation = item.addPerfectEssenceAffixes(modifiers, item, this);
		else
			Item_Evaluation = item.addAffixes(modifiers, item, this);
		for (Crafting_Item items : Item_Evaluation)
		{
			affixes = items.getAllCurrentPrefixModifiers().size() + item.getAllCurrentSuffixModifiers().size();
			double score = 0;
			score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags);
			if (score > candidate.score) {
			// When the item has at least 3 modifiers, we have a threshold for not keeping candidate with scores too low
			// We might need to tweak this a lot to find the better option
				switch (affixes) {
					case 3:
						if (score < 1900)
							continue;
						break;
					case 4:
						if (score < 2900)
							continue;
						break;
					case 5:
						if (score < 3900)
							continue;
						break;
					case 6:
						// 5 desired mods and a mod we want to have ?
						if (score < 5200)
							continue;
				}
				Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score, this);
				newCandidate.prev_score = candidate.score;
				newCandidate.actions.add(this);
				newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
				newCandidate.rarity = ItemRarity.RARE;
				if(this instanceof Desecrated_currency)
					newCandidate.desecrated = true;
				CandidateListCopy.add(newCandidate);
			}
		}
		Item_Evaluation.clear();
		return CandidateListCopy;
    }

	default List<Crafting_Candidate> evaluateAffixeswithAnnul(Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
		item = candidate.copy();
		int affixes = item.getAllCurrentPrefixModifiers().size() + item.getAllCurrentSuffixModifiers().size();
		List<Crafting_Item> Item_Evaluation = item.removeAffixes(item, this); // here we should have remove affixes
		for (Crafting_Item items : Item_Evaluation)
		{
			// Bonus for the annuls, as removing a modifier is generally good if it does not remove a modifier we want
			// +60 because removing a one of one that is not desired is good, and will not prioritize the removing of modifiers with tags we really want
			double score = 60;
			score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags); // Might be changed for the annuls
			if (score > candidate.score)
			{
				switch (affixes) {
					case 3:
						if (score < 1900)
							continue;
						break;
					case 4:
						if (score < 2900)
							continue;
						break;
					case 5:
						if (score < 3900)
							continue;
						break;
					case 6:
						if (score < 4900)
							continue;
				}
				Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score, this);
				newCandidate.prev_score = candidate.score;
				newCandidate.actions.add(this);
				newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
				newCandidate.rarity = ItemRarity.RARE;
				CandidateListCopy.add(newCandidate);
			}
		}
		Item_Evaluation.clear();
		return CandidateListCopy;
	}
}