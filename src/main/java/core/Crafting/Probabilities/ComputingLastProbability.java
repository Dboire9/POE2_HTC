package core.Crafting.Probabilities;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action.CurrencyTier;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;
import core.Modifier_class.ModifierTier;

/**
 * This file is used to filter out candidates that do not have a high enough 
 * percentage chance of success, as determined by the global threshold, 
 * that can be modified manually.
 */
public class ComputingLastProbability {

    /**
     * Computes the probability of the last crafting event for a list of crafting candidates
     * and removes candidates that do not meet the criteria.
     *
     * @param completedPaths  The list of crafting candidates to process.
     * @param desiredMod      The list of desired modifiers.
     * @param baseItem        The base crafting item.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     */
    public static void ComputingLastEventProbability(List<Crafting_Candidate> completedPaths, List<Modifier> desiredMod, Crafting_Item baseItem, double GLOBAL_THRESHOLD) {
        // Thread-safe list to collect candidates that should be removed
        List<Crafting_Candidate> toRemove = Collections.synchronizedList(new ArrayList<>());

        // Use parallel stream for faster processing
        completedPaths.parallelStream().forEach(candidate -> {
            if (candidate.modifierHistory.isEmpty() || candidate.score >= 6000)
                return; // Skip empty candidates or if they are finished

            ModifierEvent event = candidate.modifierHistory.get(candidate.modifierHistory.size() - 1);
            int i = candidate.modifierHistory.size() - 1;

            Crafting_Action action = event.source.keySet().iterator().next();
            boolean keep = true;

            if (action instanceof RegalOrb || action instanceof ExaltedOrb)
                keep = ComputeLastRegalAndExalted(candidate, desiredMod, baseItem, i, GLOBAL_THRESHOLD);
            else if (action instanceof AnnulmentOrb)
                keep = ComputeLastAnnul(candidate, desiredMod, baseItem, i, GLOBAL_THRESHOLD);
            else if (action instanceof Essence_currency)
                keep = ComputeLastEssence(candidate, desiredMod, baseItem, i, GLOBAL_THRESHOLD);
            else if (action instanceof Desecrated_currency)
                keep = ComputeLastDes(candidate, desiredMod, baseItem, i, GLOBAL_THRESHOLD);

            if (!keep) 
                toRemove.add(candidate);
        });

        // Remove all candidates that failed the check
        completedPaths.removeAll(toRemove);
    }

    /**
     * Computes the probability for the last Desecrated currency event.
     *
     * @param candidate       The crafting candidate.
     * @param desiredMod      The list of desired modifiers.
     * @param baseItem        The base crafting item.
     * @param i               The index of the current event in the modifier history.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     * @return True if the candidate passes the probability check, false otherwise.
     */
    public static boolean ComputeLastDes(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i, double GLOBAL_THRESHOLD) {
        ModifierEvent event = candidate.modifierHistory.get(i);

        double percentage = 0;
        Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
        Crafting_Action action = source.keySet().iterator().next();

        if (action instanceof Desecrated_currency) {
            for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values()) {
                percentage = DesProbability.ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen, i);
                if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
                    return true;
            }
        }
        return false;
    }

    /**
     * Computes the probability for the last Regal or Exalted Orb event.
     *
     * @param candidate       The crafting candidate.
     * @param desiredMod      The list of desired modifiers.
     * @param baseItem        The base crafting item.
     * @param i               The index of the current event in the modifier history.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     * @return True if the candidate passes the probability check, false otherwise.
     */
    public static boolean ComputeLastRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i, double GLOBAL_THRESHOLD) {
        ModifierEvent event = candidate.modifierHistory.get(i);
        Modifier foundModifier = event.modifier;

        boolean isDesired = desiredMod.contains(foundModifier);

        if (foundModifier != null) {
            int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
            int level = foundModifier.tiers.get(realtier).level;

            int[] levels;
            Crafting_Action.CurrencyTier[] tiers;

            if (level < 35) {
                levels = new int[] { 0 };
                tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE };
            } else if (level < 50) {
                levels = new int[] { 0, 35, 40 };
                tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY };
            } else {
                levels = new int[] { 0, 35, 40, 50 };
                tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY, CurrencyTier.PERFECT };
            }

            Crafting_Action action = event.source.keySet().iterator().next();

            if (applyLastTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i, isDesired, GLOBAL_THRESHOLD, null))
                return true;
            if (action instanceof RegalOrb)
                return canBeEssence(baseItem, candidate, event, level, realtier, i);
        }
        return false;
    }

    /**
     * Computes the probability for the last Annulment Orb event.
     *
     * @param candidate       The crafting candidate.
     * @param desiredMod      The list of desired modifiers.
     * @param baseItem        The base crafting item.
     * @param i               The index of the current event in the modifier history.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     * @return True if the candidate passes the probability check, false otherwise.
     */
    public static boolean ComputeLastAnnul(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i, double GLOBAL_THRESHOLD) {
        ModifierEvent event = candidate.modifierHistory.get(i);

        double percentage = 0;
        Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
        Crafting_Action action = source.keySet().iterator().next();

        if (action instanceof AnnulmentOrb) {
            for (AnnulmentOrb.Omen currentOmen : AnnulmentOrb.Omen.values()) {
                percentage = AnnulProbability.ComputePercentageAnnul(baseItem, candidate, event, currentOmen, i);
                if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
                    return true;
            }
        }
        return false;
    }

    /**
     * Checks if the essence can be applied to the candidate based on its modifiers.
     *
     * @param baseItem The base crafting item.
     * @param candidate The crafting candidate.
     * @param event The current modifier event.
     * @param level The level of the modifier.
     * @param realtier The real tier of the modifier.
     * @param i The index of the current event in the modifier history.
     * @return True if the essence can be applied, false otherwise.
     */
    private static boolean canBeEssence(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int level, int realtier, int i) {
        if (event.modifier.type == ModifierType.PREFIX) {
            List<Modifier> PossiblePrefixes = baseItem.base.getEssencesAllowedPrefixes();

            for (Modifier m : PossiblePrefixes) {
                if (m.text.equals(event.modifier.text)) {
                    for (ModifierTier mtiers : m.tiers)
                        if (mtiers.level == level)
                            return true;
                    break;
                }
            }
        }

        if (event.modifier.type == ModifierType.SUFFIX) {
            List<Modifier> PossibleSuffixes = baseItem.base.getEssencesAllowedSuffixes();

            for (Modifier m : PossibleSuffixes) {
                if (m.text.equals(event.modifier.text)) {
                    for (ModifierTier mtiers : m.tiers)
                        if (mtiers.level == level)
                            return true;
                    break;
                }
            }
        }
        return false;
    }

    /**
     * Applies the last tiers and computes the probability for Regal or Exalted Orbs.
     *
     * @param baseItem The base crafting item.
     * @param candidate The crafting candidate.
     * @param event The current modifier event.
     * @param levels The levels to check.
     * @param tiers The currency tiers to apply.
     * @param i The index of the current event in the modifier history.
     * @param isDesired Whether the modifier is desired.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     * @param tier The specific currency tier to apply.
     * @return True if the candidate passes the probability check, false otherwise.
     */
    private static boolean applyLastTiersAndComputeRegals(
            Crafting_Item baseItem,
            Crafting_Candidate candidate,
            ModifierEvent event,
            int[] levels,
            Crafting_Action.CurrencyTier[] tiers,
            int i,
            boolean isDesired,
            double GLOBAL_THRESHOLD, 
            Crafting_Action.CurrencyTier tier) {
        Map<Crafting_Action, Double> source = event.source;
        Crafting_Action action = source.keySet().iterator().next();

        for (int j = 0; j < levels.length; j++) {
            int level = levels[j];
            if (level == 40 && candidate.desecrated) // Skip if already desecrated
                continue;

            if (action instanceof RegalOrb) {
                for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values()) {
                    double percentage = ExaltAndRegalProbability.ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
                    if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
                        return true;
                }
            } else if (action instanceof ExaltedOrb) {
                for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values()) {
                    double percentage = ExaltAndRegalProbability.ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
                    if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
                        return true;
                }
            }
        }
        return false;
    }

	/**
     * Computes the probability for the last Essence currency event.
     *
     * @param candidate       The crafting candidate.
     * @param desiredMod      The list of desired modifiers.
     * @param baseItem        The base crafting item.
     * @param i               The index of the current event in the modifier history.
     * @param GLOBAL_THRESHOLD The global threshold for probability checks.
     * @return True if the candidate passes the probability check, false otherwise.
     */
	public static boolean ComputeLastEssence(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i, double GLOBAL_THRESHOLD)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Essence_currency) {
			for (Essence_currency.Omen currentOmen : Essence_currency.Omen.values()){
				percentage = EssenceProbability.ComputePercentageEssence(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
					return true;
			}
		}
		return false;
	}

}
