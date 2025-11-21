package core.Crafting.Probabilities;

import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Essence_currency;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

/**
 * This class is responsible for computing probabilities related to crafting actions
 * involving essences and modifiers in the crafting system.
 */
public class EssenceProbability {

    /**
     * Computes the essence probabilities for a given crafting candidate and updates
     * the modifier history with the calculated probabilities.
     *
     * @param candidate   The crafting candidate containing the modifier history.
     * @param desiredMod  The list of desired modifiers.
     * @param baseItem    The base crafting item.
     * @param i           The index of the current modifier event in the history.
     */
    public static void ComputeEssence(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem,
                                      int i) {
        ModifierEvent event = candidate.modifierHistory.get(i);

        double percentage = 0;
        Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
        Crafting_Action action = source.keySet().iterator().next();

        if (action instanceof Essence_currency) {
            // Clear the original entry with 0.0 probability
            source.clear();
            
            for (Essence_currency.Omen currentOmen : Essence_currency.Omen.values()) {
                percentage = ComputePercentageEssence(baseItem, candidate, event, currentOmen, i);
                if (percentage != 0)
                    candidate.modifierHistory.get(i).source.put(new Essence_currency(currentOmen), percentage);
            }
        }
    }

    /**
     * Computes the probability of applying a specific essence effect based on the
     * current state of the crafting candidate and the given omen.
     *
     * @param baseItem  The base crafting item.
     * @param candidate The crafting candidate containing the modifier history.
     * @param event     The current modifier event.
     * @param omen      The essence omen being evaluated.
     * @param i         The index of the current modifier event in the history.
     * @return The computed probability for the given essence omen.
     */
    public static double ComputePercentageEssence(Crafting_Item baseItem, Crafting_Candidate candidate,
                                                  ModifierEvent event, Enum<?> omen, int i) {
        // Calculate the number of prefixes and suffixes filled based on the modifier history.
		double[] affixCount = Probability.countAffixesFilled(candidate, i);
		double prefixesFilled = affixCount[0];
		double suffixesFilled = affixCount[1];

        // Compute the probability based on the omen type.
        if (omen instanceof Essence_currency.Omen essenceOmen) {
            switch (essenceOmen) {
                case None: {
                    if (event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0 && prefixesFilled != 0)
                        return 1 / prefixesFilled;
                    if (event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0 && suffixesFilled != 0)
                        return 1 / suffixesFilled;
                    else
                        return 1 / (prefixesFilled + suffixesFilled); // Chance out of all modifiers on the item.
                }
                case OmenofSinistralCrystallisation: {
                    // Omen restricts removal to ONLY prefixes
                    // Probability = 1 / (number of prefixes that can be removed)
                    // The added modifier can be either prefix or suffix
                    
                    // For CHANGED events, check if the modifier being replaced is actually a prefix
                    if (event.type == ModifierEvent.ActionType.CHANGED && event.changed_modifier != null) {
                        // If the omen targets prefixes but the replaced modifier is a suffix, probability is 0
                        if (event.changed_modifier.type != ModifierType.PREFIX) {
                            return 0;
                        }
                    }
                    
                    if (prefixesFilled > 0)
                        return 1.0 / prefixesFilled;
                    break;
                }
                case OmenofDextralCrystallisation: {
                    // Omen restricts removal to ONLY suffixes
                    // Probability = 1 / (number of suffixes that can be removed)
                    // The added modifier can be either prefix or suffix
                    
                    // For CHANGED events, check if the modifier being replaced is actually a suffix
                    if (event.type == ModifierEvent.ActionType.CHANGED && event.changed_modifier != null) {
                        // If the omen targets suffixes but the replaced modifier is a prefix, probability is 0
                        if (event.changed_modifier.type != ModifierType.SUFFIX) {
                            return 0;
                        }
                    }
                    
                    if (suffixesFilled > 0) {
                        return 1.0 / suffixesFilled;
                    }
                    break;
                }
            }
        }
        return 0;
    }
}
