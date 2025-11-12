package core.Crafting.Proba;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Crafting.Crafting_Action.CurrencyTier;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;

/**
 * Handles probability computations for Regal and Exalted orb usage in crafting.
 * This includes determining the likelihood of a modifier appearing under
 * specific currency tiers, item desecration, and omen effects.
 */
public class ExaltAndRegalProbability {

    /**
     * Computes the effect of a single Regal or Exalted orb application on a crafting candidate.
     * Determines the appropriate currency tiers based on the modifier level, applies the tiers,
     * and computes the probability for each relevant outcome.
     *
     * @param candidate  The crafting candidate whose modifier history is being evaluated
     * @param desiredMod The list of desired modifiers to check against
     * @param baseItem   The item being crafted
     * @param i          Index in the modifier history to evaluate
     */
    public static void ComputeRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i) {
        ModifierEvent event = candidate.modifierHistory.get(i);
        Modifier foundModifier = event.modifier;
        boolean isDesired = desiredMod.contains(foundModifier);

        if (foundModifier != null) {
            int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
            int level = foundModifier.tiers.get(realtier).level;

            int[] levels;
            Crafting_Action.CurrencyTier[] tiers;

            if (level < 35) {
                levels = new int[]{0};
                tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE};
            } else if (level < 50) {
                levels = new int[]{0, 35, 40};
                tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY};
            } else {
                levels = new int[]{0, 35, 40, 50};
                tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY, CurrencyTier.PERFECT};
            }

            Crafting_Action action = event.source.keySet().iterator().next();

            applyTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i, isDesired);

            if (action instanceof RegalOrb) {
                canBeEssence(baseItem, candidate, event, level, realtier, i);
            }
        }
    }

    /**
     * Applies each relevant currency tier for a modifier and computes the
     * probability of occurrence, considering omen effects and desecration.
     *
     * @param baseItem  The item being crafted
     * @param candidate The crafting candidate
     * @param event     The modifier event to evaluate
     * @param levels    The applicable item levels for currency computation
     * @param tiers     The corresponding currency tiers
     * @param i         Index of the modifier event in history
     * @param isDesired Whether the modifier is desired by the player
     */
    private static void applyTiersAndComputeRegals(
            Crafting_Item baseItem,
            Crafting_Candidate candidate,
            ModifierEvent event,
            int[] levels,
            Crafting_Action.CurrencyTier[] tiers,
            int i,
            boolean isDesired) {
        Map<Crafting_Action, Double> source = event.source;
        Crafting_Action action = source.keySet().iterator().next();

        for (int j = 0; j < levels.length; j++) {
            int level = levels[j];
            Crafting_Action.CurrencyTier tier = tiers[j];

            if (tier == Crafting_Action.CurrencyTier.DES_CURRENCY && candidate.desecrated) return;

            if (action instanceof RegalOrb) {
                for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values()) {
                    double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
                    if (percentage != 0) source.put(new RegalOrb(tier, currentOmen), percentage);
                }
            } else if (action instanceof ExaltedOrb) {
                for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values()) {
                    double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
                    if (percentage == 2)
                        source.put(new ExaltedOrb(Crafting_Action.CurrencyTier.DES_CURRENCY, currentOmen), percentage);
                    else if (percentage != 0)
					{
						if(currentOmen == ExaltedOrb.Omen.OmenofHomogenisingExaltation)
						{
							Set<ExaltedOrb.Omen> newOmens = new HashSet<>();
							newOmens.add(ExaltedOrb.Omen.OmenofHomogenisingExaltation);
							if(event.modifier.type == ModifierType.PREFIX)
								newOmens.add(ExaltedOrb.Omen.OmenofSinistralExaltation);
							else if (event.modifier.type == ModifierType.SUFFIX)
								newOmens.add(ExaltedOrb.Omen.OmenofDextralExaltation);
							source.put(new ExaltedOrb(tier, newOmens), percentage);
						}
						else
							source.put(new ExaltedOrb(tier, currentOmen), percentage);
					}
                }
            }
        }
    }

    /**
     * Computes the probability of a modifier occurring at a given item level,
     * considering the current crafting state, desecration, and omen effects.
     *
     * @param baseItem  The item being crafted
     * @param candidate The crafting candidate
     * @param event     The modifier event
     * @param ilvl      The item level to consider
     * @param omen      The applicable omen effect
     * @param i         Index in the modifier history
     * @param isDesired Whether this modifier is desired
     * @return The probability (0.0 to 1.0, or 2 for special simulation cases)
     */
    public static double ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, Enum<?> omen, int i, boolean isDesired) {
        Crafting_Action action = event.source.keySet().iterator().next();
        double percentage = 0.0;

        if (omen instanceof RegalOrb.Omen regalOmen && ilvl != 40) {
            switch (regalOmen) {
                case None -> {
                    List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
                    List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
                    	return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
                }
                case OmenofHomogenisingCoronation -> {
                    if (event.modifier.tags.isEmpty() || event.modifier.tags.get(0) == null || event.modifier.tags.get(0).isEmpty())
                        return 0;
                    List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
                    List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
                    	return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
                }
            }
        }

        if (omen instanceof ExaltedOrb.Omen exaltOmen) {
            ExaltedOrb orb = (ExaltedOrb) action;
            switch (exaltOmen) {
                case None -> {
                    List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
                    List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
                    percentage = NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
					// We mutliply by 3 the probability of having this modifier because we can have it by desecration
					// Removing it for now
                    // if (!candidate.desecrated && (ilvl == 0 || ilvl == 40)) percentage = 1 - Math.pow(1 - percentage, 3);
					return percentage;
                }
                case OmenofHomogenisingExaltation -> {
                    if (ilvl == 40) return 0;
                    if (event.modifier.type == ModifierType.PREFIX) {
                        List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
                        	return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null, isDesired);
                    }
                    if (event.modifier.type == ModifierType.SUFFIX) {
                        List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
                        	return NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes, isDesired);
                    }
                }
                case OmenofSinistralExaltation -> {
                    if (event.modifier.type == ModifierType.PREFIX) {
                        List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
                        percentage = NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null, isDesired);
						// We mutliply by 3 the probability of having this modifier because we can have it by desecration
						// Removing it for now
                        // if (!candidate.desecrated) percentage = 1 - Math.pow(1 - percentage, 3);
						return percentage;
                    }
                }
                case OmenofDextralExaltation -> {
                    if (event.modifier.type == ModifierType.SUFFIX) {
                        List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
                        percentage = NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes, isDesired);
						// We mutliply by 3 the probability of having this modifier because we can have it by desecration
						// Removing it for now
                        // if (!candidate.desecrated) percentage = 1 - Math.pow(1 - percentage, 3);
						return percentage;
                    }
                }
            }
        }
        return 0;
    }

    /**
     * Adds essence currency sources for an affix modifier if applicable.
     *
     * @param baseItem  The item being crafted
     * @param candidate The crafting candidate
     * @param event     The modifier event
     * @param level     The level of the modifier
     * @param realtier  The real tier index
     * @param i         Index in the modifier history
     */
	private static void canBeEssence(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event,
			int level, int realtier, int i) {
		if (event.modifier.type == ModifierType.PREFIX) {
			List<Modifier> PossiblePrefixes = baseItem.base.getEssencesAllowedPrefixes();

			// Loop until we find the same text, then check the ilvl to see if we can
			// apply the essence
			for (Modifier m : PossiblePrefixes) {
				if (m.text.equals(event.modifier.text)) {
					for (ModifierTier mtiers : m.tiers)
						if (mtiers.level == level)
							candidate.modifierHistory.get(i).source.put(new Essence_currency(m.family, mtiers), 1.0);
					break;
				}
			}
		}

		if (event.modifier.type == ModifierType.SUFFIX) {
			List<Modifier> PossibleSuffixes = baseItem.base.getEssencesAllowedSuffixes();

			// Loop until we find the same text, then check the ilvl to see if we can
			// apply the essence
			for (Modifier m : PossibleSuffixes) {
				if (m.text.equals(event.modifier.text)) {
					for (ModifierTier mtiers : m.tiers)
						if (mtiers.level == level)
							candidate.modifierHistory.get(i).source.put(new Essence_currency(m.family, mtiers), 1.0);
					break;
				}
			}
		}
	}

    /**
     * Retrieves the modifiers that can match homogenising omen effects.
     *
     * @param baseItem       The item being crafted
     * @param candidate      The crafting candidate
     * @param event          The current modifier event
     * @param PossibleAffixes The list of potential affixes
     * @param i              Index in the modifier history
     * @return A list of modifiers that could be rolled for the omen effect
     */
    public static List<Modifier> GetHomogAffixes(Crafting_Item baseItem, Crafting_Candidate candidate,
                                                 ModifierEvent event, List<Modifier> PossibleAffixes, int i) {
        List<Modifier> FinalPossibleAffixes = new ArrayList<>();
        List<String> ItemAffixTags = new ArrayList<>();

        for (int j = 0; j <= i; j++) {
            for (String tags : candidate.modifierHistory.get(j).modifier.tags)
                if (!tags.isEmpty() && !ItemAffixTags.contains(tags))
                    ItemAffixTags.add(tags);
        }

        for (Modifier PossibleModifier : PossibleAffixes)
            for (String tag : PossibleModifier.tags)
                if (ItemAffixTags.contains(tag) && !tag.isEmpty()) {
                    if (!FinalPossibleAffixes.contains(PossibleModifier)) FinalPossibleAffixes.add(PossibleModifier);
                    break;
                }
        return FinalPossibleAffixes;
    }

    /**
     * Computes the probability of a modifier appearing based on the
     * current crafting state, available affixes, and weights.
     *
     * @param baseItem       The item being crafted
     * @param candidate      The crafting candidate
     * @param event          The modifier event
     * @param ilvl           The item level
     * @param i              Index in the modifier history
     * @param PossiblePrefixes Potential prefix modifiers
     * @param PossibleSuffixes Potential suffix modifiers
     * @param isDesired      Whether the modifier is desired
     * @return The computed probability (0.0 to 1.0)
     */
    public static double NormalCompute(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event,
                                       int ilvl, int i, List<Modifier> PossiblePrefixes, List<Modifier> PossibleSuffixes, boolean isDesired) {

        double percentage = 0;
        double TotalPrefixWeight = 0;
        double TotalSuffixWeight = 0;
        double weight = 0;

        if (!isDesired) {
            for (ModifierTier tiers : event.modifier.tiers)
                weight += tiers.weight;
            ilvl = 0;
        } else weight = event.tier.weight;

        if (PossiblePrefixes != null)
            TotalPrefixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossiblePrefixes, ilvl);

        if (PossibleSuffixes != null)
            TotalSuffixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossibleSuffixes, ilvl);

        double[] affixCount = Probability.countAffixesFilled(candidate, i);
        double prefixesFilled = affixCount[0];
        double suffixesFilled = affixCount[1];

        if (prefixesFilled < 3 && suffixesFilled < 3 && PossiblePrefixes != null && PossibleSuffixes != null) {
            double TotalWeight = TotalPrefixWeight + TotalSuffixWeight;
            percentage = weight / TotalWeight;
            return percentage;
        }

        if (event.modifier.type == ModifierType.PREFIX && (suffixesFilled >= 3 || PossibleSuffixes == null)) {
            percentage = weight / TotalPrefixWeight;
            return percentage;
        }

        if (event.modifier.type == ModifierType.SUFFIX && (prefixesFilled >= 3 || PossiblePrefixes == null)) {
            percentage = weight / TotalSuffixWeight;
            return percentage;
        }

        return 0;
    }
}
