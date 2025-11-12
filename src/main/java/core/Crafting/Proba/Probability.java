package core.Crafting.Proba;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;


public class Probability {

	public static void ComputingProbability(List<Crafting_Candidate> completedPaths, List<Modifier> desiredMod,
			Crafting_Item baseItem) {
		for (Crafting_Candidate candidate : completedPaths) {
			// We implement i to get the event in all our candidates, so that we can replace
			// it easier
			int i = 0;
			// We do all at once, we do not care about the order
			for (ModifierEvent event : candidate.modifierHistory) {
				// Retrieving the first action to know what it is
				Crafting_Action action = event.source.keySet().iterator().next();

				// Not doing the transmutation

				// Not doing aug for now, want to see a 100% prob if it is possible
				if (action instanceof RegalOrb || action instanceof ExaltedOrb)
					ExaltAndRegalProbability.ComputeRegalAndExalted(candidate, desiredMod, baseItem, i);
				else if (action instanceof AnnulmentOrb)
					ComputeAnnul(candidate, desiredMod, baseItem, i);
				else if (action instanceof Essence_currency)
					ComputeEssence(candidate, desiredMod, baseItem, i);
				else if (action instanceof Desecrated_currency)
					DesProbability.ComputeDes(candidate, desiredMod, baseItem, i);
				i++;
			}
		}
		return;
	}



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
