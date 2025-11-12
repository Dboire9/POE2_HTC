package core.Crafting.Proba;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;

public class DesProbability {

	/**
     * Handles Desecrated currency computations.
     * This function computes probability tiers for desecrated outcomes.
     */
	public static void ComputeDes(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Desecrated_currency) {
			for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values()) {
				percentage = ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0)
					candidate.modifierHistory.get(i).source.put(new Desecrated_currency(currentOmen), percentage);
			}
		}
	}

	    /**
     * Performs the detailed desecrated probability computation.
     */
	public static double ComputePercentageDesecrated_currency(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i) {

		double kurgal_modTotal = 0;
		double amanamu_modTotal = 0;
		double ulaman_modTotal = 0;

		double percentage = 0;

		List<Modifier> PossiblePrefixes = baseItem.base.getDesecratedAllowedPrefixes();
		List<Modifier> PossibleSuffixes = baseItem.base.getDesecratedAllowedSuffixes();

		/*
		 * Here we check which type it is, because for the omens we need to do 1 out of
		 * all the desecrated family modifiers, but if we have prefix and suffix, the
		 * omens help us keep the percentage the same,
		 * we just add the omen if there is both affixes
		 */
		if (event.modifier.type == ModifierType.PREFIX) {
			for (Modifier m : PossiblePrefixes) {
				if (m.tags.contains("kurgal_mod"))
					kurgal_modTotal++;
				if (m.tags.contains("amanamu_mod"))
					amanamu_modTotal++;
				if (m.tags.contains("ulaman_mod"))
					ulaman_modTotal++;
			}
		} else {
			for (Modifier m : PossibleSuffixes) {
				if (m.tags.contains("kurgal_mod"))
					kurgal_modTotal++;
				if (m.tags.contains("amanamu_mod"))
					amanamu_modTotal++;
				if (m.tags.contains("ulaman_mod"))
					ulaman_modTotal++;
			}
		}

		if (omen instanceof Desecrated_currency.Omen desOmen) {
			Desecrated_currency orb = (Desecrated_currency) event.source.keySet().iterator().next();
			switch (desOmen) {
				case OmenofSinistralNecromancy:
					break;
				case OmenofDextralNecromancy:
					break;
				case OmenoftheBlackblooded: {
					if (event.modifier.tags.contains("kurgal_mod"))
						percentage = 1 / kurgal_modTotal; // We have a guarantee to have a random kurgal modifier so 1 out of the total of them
					else
						break; // If no kurgal_mod break it will do nothing
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheLiege: {
					if (event.modifier.tags.contains("amanamu_mod"))
						percentage = 1 / amanamu_modTotal;
					else
						break;
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheSovereign: {
					if (event.modifier.tags.contains("ulaman_mod"))
						percentage = 1 / ulaman_modTotal;
					else
						break;
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
			}
		}

		return percentage;
	}
	
}
