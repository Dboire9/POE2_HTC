package core.Crafting.Proba;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;

public class AnnulProbability {

	public static void ComputeAnnul(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof AnnulmentOrb) {
			for (AnnulmentOrb.Omen currentOmen : AnnulmentOrb.Omen.values()) {
				percentage = ComputePercentageAnnul(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0)
					candidate.modifierHistory.get(i).source.put(new AnnulmentOrb(currentOmen), percentage);
			}
		}
	}

		public static double ComputePercentageAnnul(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i)
	{
		double prefixesFilled = 0;
		double suffixesFilled = 0;

		for (int j = 0; j < i; j++) {
			if (candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX
					&& candidate.modifierHistory.get(j).type == ActionType.ADDED)
				prefixesFilled++;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX
					&& candidate.modifierHistory.get(j).type == ActionType.ADDED)
				suffixesFilled++;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX
					&& candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			else if (candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX
					&& candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled++;
		}

		if (omen instanceof AnnulmentOrb.Omen annulOmen) {
			switch (annulOmen) {
				case None: {
					if (event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0 && prefixesFilled != 0)
						return 1 / prefixesFilled;
					if (event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0 && suffixesFilled != 0)
						return 1 / suffixesFilled;
					else
						return 1 / (prefixesFilled + suffixesFilled); // We have a chance out of all the modifiers on
																		// the item
				}
				case OmenofSinistralAnnulment:
				{
					if (event.modifier.type == ModifierType.PREFIX && prefixesFilled != 0)
						return 1 / prefixesFilled; // We only calculate the chance of removing the modifier out of all the prefix modifiers
					break; // Break if it is a suffix
				}
				case OmenofDextralAnnulment:
				{
					if (event.modifier.type == ModifierType.SUFFIX && suffixesFilled != 0)
						return 1 / suffixesFilled; // same
					break;
				}
				case OmenofLight:
				{
					if(candidate.desecrated && event.modifier.source == ModifierSource.DESECRATED) // If the mod was because of a desecration, there is a 100% chance we remove it, then we reset the item
					{
						candidate.desecrated = false;
						return 1;
					}
				}

			}
		}
		return 0;
	}
	
}
