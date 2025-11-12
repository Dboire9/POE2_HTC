package core.Crafting.Proba;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;

/**
 * The `AnnulProbability` class is responsible for computing the probabilities
 * associated with the use of Annulment Orbs during the crafting process.
 */
public class AnnulProbability {

    /**
     * Computes the annulment probabilities for a given crafting candidate and updates
     * the candidate's modifier history with the calculated probabilities.
     *
     * @param candidate The crafting candidate whose probabilities are being computed.
     * @param desiredMod A list of desired modifiers to aim for during crafting.
     * @param baseItem The base crafting item being modified.
     * @param i The index of the current modifier event in the candidate's modifier history.
     */
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

    /**
     * Computes the probability of an annulment event based on the current state of the crafting item,
     * the candidate's modifier history, and the type of omen being used.
     *
     * @param baseItem The base crafting item being modified.
     * @param candidate The crafting candidate whose probabilities are being computed.
     * @param event The current modifier event being analyzed.
     * @param omen The type of omen being used for the annulment.
     * @param i The index of the current modifier event in the candidate's modifier history.
     * @return The computed probability of the annulment event.
     */
    public static double ComputePercentageAnnul(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i) {

		double[] affixCount = Probability.countAffixesFilled(candidate, i);
		double prefixesFilled = affixCount[0];
		double suffixesFilled = affixCount[1];

        // Compute the probability based on the type of omen
        if (omen instanceof AnnulmentOrb.Omen annulOmen) {
            switch (annulOmen) {
                case None: {
                    if (event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0 && prefixesFilled != 0)
                        return 1 / prefixesFilled;
                    if (event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0 && suffixesFilled != 0)
                        return 1 / suffixesFilled;
                    else
                        return 1 / (prefixesFilled + suffixesFilled); // Chance out of all modifiers on the item
                }
                case OmenofSinistralAnnulment: {
                    if (event.modifier.type == ModifierType.PREFIX && prefixesFilled != 0)
                        return 1 / prefixesFilled; // Chance of removing a prefix modifier
                    break;
                }
                case OmenofDextralAnnulment: {
                    if (event.modifier.type == ModifierType.SUFFIX && suffixesFilled != 0)
                        return 1 / suffixesFilled; // Chance of removing a suffix modifier
                    break;
                }
                case OmenofLight: {
                    if (candidate.desecrated && event.modifier.source == ModifierSource.DESECRATED) {
                        // If the modifier was added due to desecration, there is a 100% chance to remove it
                        candidate.desecrated = false;
                        return 1;
                    }
                }
            }
        }
        return 0;
    }
}