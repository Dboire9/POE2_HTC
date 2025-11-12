package core.Crafting.Probabilities;

import java.util.List;

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
import core.Modifier_class.Modifier.ModifierType;

/**
 * The {@code Probability} class provides methods to compute probabilities
 * for crafting actions and track the state of prefixes and suffixes
 * during crafting processes.
 */
public class Probability {

    /**
     * Computes the probabilities for crafting actions based on the given
     * crafting candidates, desired modifiers, and the base item.
     *
     * @param completedPaths a list of crafting candidates representing completed crafting paths
     * @param desiredMod a list of desired modifiers to be achieved
     * @param baseItem the base crafting item being modified
     */
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

	/**
	 * Calculates the current number of prefixes and suffixes filled
	 * based on the modifier history up to index 'limitIndex'.
	 *
	 * @param candidate the crafting candidate containing the modifier history
	 * @param limitIndex exclusive upper bound in the history (usually the current i)
	 * @return an int array where [0] = prefixesFilled, [1] = suffixesFilled
	 */
	public static double[] countAffixesFilled(Crafting_Candidate candidate, int limitIndex) {
		double prefixesFilled = 0;
		double suffixesFilled = 0;

        for (int j = 0; j < limitIndex; j++) {
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
            // Handle cases where a modifier changes from prefix to suffix or vice versa because of Perfect Essences.
            else if (candidate.modifierHistory.get(j).type == ActionType.CHANGED
                    && candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX
                    && candidate.modifierHistory.get(j).changed_modifier.type == ModifierType.PREFIX) {
                suffixesFilled++;
                prefixesFilled--;
            } else if (candidate.modifierHistory.get(j).type == ActionType.CHANGED
                    && candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX
                    && candidate.modifierHistory.get(j).changed_modifier.type == ModifierType.SUFFIX) {
                suffixesFilled--;
                prefixesFilled++;
            }
        }

		return new double[]{prefixesFilled, suffixesFilled};
	}
}
