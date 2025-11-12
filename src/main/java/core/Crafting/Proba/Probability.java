package core.Crafting.Proba;

import java.util.List;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Modifier_class.Modifier;


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
					AnnulProbability.ComputeAnnul(candidate, desiredMod, baseItem, i);
				else if (action instanceof Essence_currency)
					EssenceProbability.ComputeEssence(candidate, desiredMod, baseItem, i);
				else if (action instanceof Desecrated_currency)
					DesProbability.ComputeDes(candidate, desiredMod, baseItem, i);
				i++;
			}
		}
		return;
	}
}
