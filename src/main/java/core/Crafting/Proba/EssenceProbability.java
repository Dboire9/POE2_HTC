package core.Crafting.Proba;

import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;
import core.Currency.Essence_currency;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

public class EssenceProbability {

		public static void ComputeEssence(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem,
			int i) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Essence_currency) {
			for (Essence_currency.Omen currentOmen : Essence_currency.Omen.values()) {
				percentage = ComputePercentageEssence(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0)
					candidate.modifierHistory.get(i).source.put(new Essence_currency(currentOmen), percentage);
			}
		}
	}

	public static double ComputePercentageEssence(Crafting_Item baseItem, Crafting_Candidate candidate,
			ModifierEvent event, Enum<?> omen, int i) {
		double prefixesFilled = 0;
		double suffixesFilled = 0;

		for (int j = 0; j < i; j++) {
			if (candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX
					&& candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX
					&& candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled--;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX)
				prefixesFilled++;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX)
				suffixesFilled++;
			// Here if we applied a perfect essence that change a prefix into a suffix we need to increment and decrement accordingly
			else if (candidate.modifierHistory.get(j).type == ActionType.CHANGED && candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).changed_modifier.type == ModifierType.PREFIX)
			{
				suffixesFilled++;
				prefixesFilled--;
			}
			else if (candidate.modifierHistory.get(j).type == ActionType.CHANGED && candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).changed_modifier.type == ModifierType.SUFFIX)
			{
				suffixesFilled--;
				prefixesFilled++;
			}
		}

		if (omen instanceof Essence_currency.Omen essenceOmen) {
			switch (essenceOmen) {
				case None: {
					if (event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0 && prefixesFilled != 0)
						return 1 / prefixesFilled;
					if (event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0 && suffixesFilled != 0)
						return 1 / suffixesFilled;
					else
						return 1 / (prefixesFilled + suffixesFilled); // We have a chance out of all the modifiers on the item
				}
				case OmenofSinistralCrystallisation:
				{
					// Removes only PREFIX modifiers → ignore suffixes
					if (candidate.modifierHistory.get(i).changed_modifier.type == ModifierType.PREFIX)
						return 1.0 / prefixesFilled;
					break;
				}
				
				case OmenofDextralCrystallisation:
				{
					// Removes only SUFFIX modifiers → ignore prefixes
					if (candidate.modifierHistory.get(i).changed_modifier.type == ModifierType.SUFFIX)
						return 1.0 / suffixesFilled;
					break;
				}
			}
		}
		return 0;
	}
	
}
