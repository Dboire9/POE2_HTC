package core.Crafting.Probabilities;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;

/**
 * The `DesProbability` class is responsible for computing probabilities
 * associated with the use of Desecrated currency during the crafting process.
 */
public class DesProbability {

    /**
     * Computes the desecration probabilities for a given crafting candidate and updates
     * the candidate's modifier history with the calculated probabilities.
     *
     * @param candidate The crafting candidate whose probabilities are being computed.
     * @param desiredMod A list of desired modifiers to aim for during crafting.
     * @param baseItem The base crafting item being modified.
     * @param i The index of the current modifier event in the candidate's modifier history.
     */
    public static void ComputeDes(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i) {
        ModifierEvent event = candidate.modifierHistory.get(i);

        core.DebugLogger.info("[DesProbability] Computing for modifier: " + event.modifier.text + " (tags: " + event.modifier.tags + ")");

        // Check if this modifier will be immediately replaced by a Perfect Essence (CHANGED event)
        boolean willBeReplacedByEssence = false;
        if (i + 1 < candidate.modifierHistory.size()) {
            ModifierEvent nextEvent = candidate.modifierHistory.get(i + 1);
            if (nextEvent.type == ModifierEvent.ActionType.CHANGED && 
                nextEvent.changed_modifier != null &&
                nextEvent.changed_modifier.text.equals(event.modifier.text)) {
                willBeReplacedByEssence = true;
            }
        }

        // If this modifier will be replaced by a Perfect Essence, probability is 100%
        // because we don't care which specific throwaway modifier we get
        if (willBeReplacedByEssence) {
            Map<Crafting_Action, Double> source = event.source;
            Crafting_Action action = source.keySet().iterator().next();
            source.clear();
            source.put(action, 1.0);
            core.DebugLogger.info("[DesProbability] Will be replaced by essence, setting probability to 100%");
            return;
        }

        double percentage = 0;
        Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
        Crafting_Action action = source.keySet().iterator().next();

        if (action instanceof Desecrated_currency) {
            int nonZeroCount = 0;
            for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values()) {
                percentage = ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen, i);
                if (percentage != 0) {
                    candidate.modifierHistory.get(i).source.put(new Desecrated_currency(currentOmen), percentage);
                    core.DebugLogger.info("[DesProbability] Omen " + currentOmen + " has probability: " + (percentage * 100) + "%");
                    nonZeroCount++;
                }
            }
            if (nonZeroCount == 0) {
                core.DebugLogger.warn("[DesProbability] No omen had non-zero probability! Modifier tags: " + event.modifier.tags);
            }
        }
    }

    /**
     * Computes the probability of a desecration event based on the current state of the crafting item,
     * the candidate's modifier history, and the type of omen being used.
     *
     * @param baseItem The base crafting item being modified.
     * @param candidate The crafting candidate whose probabilities are being computed.
     * @param event The current modifier event being analyzed.
     * @param omen The type of omen being used for the desecration.
     * @param i The index of the current modifier event in the candidate's modifier history.
     * @return The computed probability of the desecration event.
     */
    public static double ComputePercentageDesecrated_currency(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i) {

        double kurgal_modTotal = 0;
        double amanamu_modTotal = 0;
        double ulaman_modTotal = 0;

        double percentage = 0;

        List<Modifier> PossiblePrefixes = baseItem.base.getDesecratedAllowedPrefixes();
        List<Modifier> PossibleSuffixes = baseItem.base.getDesecratedAllowedSuffixes();

        /*
         * Computes the total number of modifiers for each desecration family (kurgal, amanamu, ulaman)
         * based on the type of modifier (prefix or suffix).
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

        /*
         * Computes the probability of the desecration event based on the omen type
         * and updates the crafting candidate's modifier history accordingly.
         */
        if (omen instanceof Desecrated_currency.Omen desOmen) {
            Desecrated_currency orb = (Desecrated_currency) event.source.keySet().iterator().next();
            switch (desOmen) {
                case OmenofSinistralNecromancy:
                    break;
                case OmenofDextralNecromancy:
                    break;
                case OmenoftheBlackblooded: {
                    if (event.modifier.tags.contains("kurgal_mod"))
                        percentage = 1 / kurgal_modTotal; // Probability of selecting a random kurgal modifier
                    else
                        break; // No kurgal_mod, do nothing
                    if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
                    else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
                    break;
                }
                case OmenoftheLiege: {
                    if (event.modifier.tags.contains("amanamu_mod"))
                        percentage = 1 / amanamu_modTotal; // Probability of selecting a random amanamu modifier
                    else
                        break;
                    if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
                    else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
                    break;
                }
                case OmenoftheSovereign: {
                    if (event.modifier.tags.contains("ulaman_mod"))
                        percentage = 1 / ulaman_modTotal; // Probability of selecting a random ulaman modifier
                    else
                        break;
                    if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
                    else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX)
                        orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
                    break;
                }
            }
        }

        return percentage;
    }
}
