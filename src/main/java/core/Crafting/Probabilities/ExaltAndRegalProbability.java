package core.Crafting.Probabilities;

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
	 * Computes the effect of a single Regal or Exalted orb application on a
	 * crafting candidate.
	 * Determines the appropriate currency tiers based on the modifier level,
	 * applies the tiers,
	 * and computes the probability for each relevant outcome.
	 *
	 * @param candidate  The crafting candidate whose modifier history is being
	 *                   evaluated
	 * @param desiredMod The list of desired modifiers to check against
	 * @param baseItem   The item being crafted
	 * @param i          Index in the modifier history to evaluate
	 */
	public static void ComputeRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod,
			Crafting_Item baseItem, int i, List<Map<String, String>> excludedCurrencies) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		boolean willBeReplacedByEssence = false;
		if (i + 1 < candidate.modifierHistory.size()) {
			ModifierEvent nextEvent = candidate.modifierHistory.get(i + 1);
			// Check if this modifier will be immediately replaced by a Perfect Essence
			// (CHANGED event)
			if (nextEvent.type == ModifierEvent.ActionType.CHANGED &&
					nextEvent.changed_modifier != null &&
					event.modifier != null &&
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
			return;
		}

		Modifier foundModifier = event.modifier;
		boolean isDesired = desiredMod.contains(foundModifier);

        if (foundModifier != null) {
			String exaltedTier = excludedCurrencies.stream()
					.filter(e -> "exalted".equals(e.get("currency")))
					.map(e -> e.get("tier"))
					.findFirst()
					.orElse(null);

			boolean isExaltedBase = "base".equals(exaltedTier);
			boolean isExaltedGreater = "greater".equals(exaltedTier);
			boolean isExaltedPerfect = "perfect".equals(exaltedTier);


			// Filter tiers by item level
			List<ModifierTier> availableTiers = new ArrayList<>();
			for (ModifierTier tier : foundModifier.tiers) {
				if (tier.level <= baseItem.level) {
					availableTiers.add(tier);
				}
			}
			// Defensive: if no tiers are available, fallback to all tiers
			if (availableTiers.isEmpty()) {
				availableTiers.addAll(foundModifier.tiers);
			}

            // ChosenTier from UI is the original tier number (e.g., 10 for T10, 9 for T9, etc.)
            // Tiers are stored in ascending order by level: tiers[0] = lowest tier (T10, T9, etc.), tiers[last] = highest tier (T1)
            // Original tier number = totalTiers - index, so T10 (tier 10) is at index 0 if there are 10 tiers
            int originalTierNumber = foundModifier.chosenTier;
            
            // Find the tier in availableTiers that matches the original tier number
            ModifierTier chosenTierObj = null;
            int filteredChosenTier = -1;
            for (int idx = 0; idx < availableTiers.size(); idx++) {
                int thisTierNumber = foundModifier.tiers.size() - foundModifier.tiers.indexOf(availableTiers.get(idx));
                if (thisTierNumber == originalTierNumber) {
                    chosenTierObj = availableTiers.get(idx);
                    filteredChosenTier = idx;
                    break;
                }
            }
            // Fallback: if not found (tier not available for item level), use the best available (last in filtered list = highest tier)
            if (chosenTierObj == null && !availableTiers.isEmpty()) {
                chosenTierObj = availableTiers.get(availableTiers.size() - 1);
                filteredChosenTier = availableTiers.size() - 1;
            }
            
            // Additional safety check
            if (chosenTierObj == null) {
                return; // Skip this modifier
            }
            int realtier = foundModifier.tiers.indexOf(chosenTierObj);
            int level = chosenTierObj.level;

			int[] levels;
			Crafting_Action.CurrencyTier[] tiers;

			List<Integer> levelsList = new ArrayList<>();
			List<Crafting_Action.CurrencyTier> tiersList = new ArrayList<>();

			// Add BASE tier if not excluded and level supports it
			if (!isExaltedBase && level >= 0) {
				levelsList.add(0);
				tiersList.add(CurrencyTier.BASE);
			}

			// Add GREATER tier if not excluded and level supports it
			if (!isExaltedGreater && level >= 35) {
				levelsList.add(35);
				tiersList.add(CurrencyTier.GREATER);
			}

			// Add PERFECT tier if not excluded and level supports it
			if (!isExaltedPerfect && level >= 50) {
				levelsList.add(50);
				tiersList.add(CurrencyTier.PERFECT);
			}

			// Convert lists to arrays
			levels = levelsList.stream().mapToInt(Integer::intValue).toArray();
			tiers = tiersList.toArray(new Crafting_Action.CurrencyTier[0]);

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

			if (tier == Crafting_Action.CurrencyTier.DES_CURRENCY && candidate.desecrated)
				return;

			if (action instanceof RegalOrb) {
				for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values()) {
					double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if (percentage != 0)
						source.put(new RegalOrb(tier, currentOmen), percentage);
				}
			} else if (action instanceof ExaltedOrb) {
				for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values()) {
					double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if (percentage == 2)
						source.put(new ExaltedOrb(Crafting_Action.CurrencyTier.DES_CURRENCY, currentOmen), percentage);
					else if (percentage != 0) {
						if (currentOmen == ExaltedOrb.Omen.OmenofHomogenisingExaltation) {
							Set<ExaltedOrb.Omen> newOmens = new HashSet<>();
							newOmens.add(ExaltedOrb.Omen.OmenofHomogenisingExaltation);
							if (event.modifier.type == ModifierType.PREFIX)
								newOmens.add(ExaltedOrb.Omen.OmenofSinistralExaltation);
							else if (event.modifier.type == ModifierType.SUFFIX)
								newOmens.add(ExaltedOrb.Omen.OmenofDextralExaltation);

							source.put(new ExaltedOrb(tier, newOmens), percentage);
						} else {
							source.put(new ExaltedOrb(tier, currentOmen), percentage);
						}
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
	public static double ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event,
			int ilvl, Enum<?> omen, int i, boolean isDesired) {
		double percentage = 0.0;

		if (omen instanceof RegalOrb.Omen regalOmen && ilvl != 40) {
			switch (regalOmen) {
				case None -> {
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes,
							isDesired);
				}
				case OmenofHomogenisingCoronation -> {
					if ((event.modifier.tags.isEmpty() || event.modifier.tags.get(0) == null
							|| event.modifier.tags.get(0).isEmpty()) && baseItem.getAllCurrentModifiers().size() == 0) {
						return 0;
					}
					List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event,
							baseItem.base.getNormalAllowedPrefixes(), i);
					List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event,
							baseItem.base.getNormalAllowedSuffixes(), i);

					if (PossiblePrefixes.isEmpty() && PossibleSuffixes.isEmpty())
						return 0;

					// Check if the current modifier is actually in the filtered list
					// If not, the omen shouldn't apply (modifier doesn't share tags with existing
					// mods)
					boolean modifierInList = false;
					if (event.modifier.type == ModifierType.PREFIX) {
						modifierInList = PossiblePrefixes.contains(event.modifier);
					} else if (event.modifier.type == ModifierType.SUFFIX) {
						modifierInList = PossibleSuffixes.contains(event.modifier);
					}
					if (!modifierInList) {
						return 0;
					}

					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes,
							isDesired);
				}
			}
		}

		if (omen instanceof ExaltedOrb.Omen exaltOmen) {
			switch (exaltOmen) {
				case None -> {
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					percentage = NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes,
							isDesired);
					// We mutliply by 3 the probability of having this modifier because we can have
					// it by desecration
					// Removing it for now
					// if (!candidate.desecrated && (ilvl == 0 || ilvl == 40)) percentage = 1 -
					// Math.pow(1 - percentage, 3);
					return percentage;
				}
				case OmenofHomogenisingExaltation -> {
					if (ilvl == 40)
						return 0;

					// Get the unfiltered lists for comparison
					List<Modifier> AllPrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> AllSuffixes = baseItem.base.getNormalAllowedSuffixes();

					// Filter BOTH prefixes and suffixes by matching tags (like RegalOrb
					// OmenofHomogenisingCoronation)
					List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event,
							AllPrefixes, i);
					List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event,
							AllSuffixes, i);

					// Check if the current modifier is actually in the filtered list
					boolean modifierInList = false;
					if (event.modifier.type == ModifierType.PREFIX) {
						modifierInList = PossiblePrefixes.contains(event.modifier);
					} else if (event.modifier.type == ModifierType.SUFFIX) {
						modifierInList = PossibleSuffixes.contains(event.modifier);
					}
					if (!modifierInList) {
						return 0;
					}

					// Homogenising is always combined with Sinistral (for PREFIX) or Dextral (for
					// SUFFIX)
					// So we should pass null for the opposite pool to get the combined effect
					double prob;
					if (event.modifier.type == ModifierType.PREFIX) {
						// Homogenising + Sinistral: filter by tags AND only allow prefixes
						prob = NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null, isDesired);
					} else {
						// Homogenising + Dextral: filter by tags AND only allow suffixes
						prob = NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes, isDesired);
					}
					return prob;
				}
				case OmenofSinistralExaltation -> {
					if (event.modifier.type == ModifierType.PREFIX) {
						List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
						percentage = NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null,
								isDesired);
						// We mutliply by 3 the probability of having this modifier because we can have
						// it by desecration
						// Removing it for now
						// if (!candidate.desecrated) percentage = 1 - Math.pow(1 - percentage, 3);
						return percentage;
					}
				}
				case OmenofDextralExaltation -> {
					if (event.modifier.type == ModifierType.SUFFIX) {
						List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
						percentage = NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes,
								isDesired);
						// We mutliply by 3 the probability of having this modifier because we can have
						// it by desecration
						// Removing it for now
						// if (!candidate.desecrated) percentage = 1 - Math.pow(1 - percentage, 3);
						return percentage;
					}
				}
				case OmenofGreaterExaltation -> {
					// Not implemented - returns 0
					return 0;
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
	 * @param baseItem        The item being crafted
	 * @param candidate       The crafting candidate
	 * @param event           The current modifier event
	 * @param PossibleAffixes The list of potential affixes
	 * @param i               Index in the modifier history
	 * @return A list of modifiers that could be rolled for the omen effect
	 */
	public static List<Modifier> GetHomogAffixes(Crafting_Item baseItem, Crafting_Candidate candidate,
			ModifierEvent event, List<Modifier> PossibleAffixes, int i) {
		List<Modifier> FinalPossibleAffixes = new ArrayList<>();
		List<String> ItemAffixTags = new ArrayList<>();
		List<String> ItemFamilies = new ArrayList<>();

		// First, collect tags from base item's existing modifiers (not in history yet)
		for (int j = 0; j < baseItem.currentPrefixes.length; j++) {
			if (baseItem.currentPrefixes[j] != null) {
				Modifier baseMod = baseItem.currentPrefixes[j];

				for (String tag : baseMod.tags)
					if (!tag.isEmpty() && !ItemAffixTags.contains(tag)) {
						ItemAffixTags.add(tag);
					}

				String family = baseMod.family;
				if (!ItemFamilies.contains(family))
					ItemFamilies.add(family);
			}
		}

		for (int j = 0; j < baseItem.currentSuffixes.length; j++) {
			if (baseItem.currentSuffixes[j] != null) {
				Modifier baseMod = baseItem.currentSuffixes[j];

				for (String tag : baseMod.tags)
					if (!tag.isEmpty() && !ItemAffixTags.contains(tag)) {
						ItemAffixTags.add(tag);
					}

				String family = baseMod.family;
				if (!ItemFamilies.contains(family))
					ItemFamilies.add(family);
			}
		}

		// Then collect tags from modifiers BEFORE the current one (j < i, not j <= i)
		// The current modifier at index i is being added, so we shouldn't include its
		// tags
		for (int j = 0; j < i; j++) {
			Modifier existingMod = candidate.modifierHistory.get(j).modifier;

			for (String tags : existingMod.tags)
				if (!tags.isEmpty() && !ItemAffixTags.contains(tags)) {
					ItemAffixTags.add(tags);
				}

			// Add family to exclusion list (matches logic in Crafting_Item.addAffixes line
			// 163)
			String family = existingMod.family;
			if (!ItemFamilies.contains(family))
				ItemFamilies.add(family);
		}

		for (Modifier PossibleModifier : PossibleAffixes) {
			// Skip if this modifier family is already on the item
			if (ItemFamilies.contains(PossibleModifier.family))
				continue;

			for (String tag : PossibleModifier.tags)
				if (ItemAffixTags.contains(tag) && !tag.isEmpty()) {
					if (!FinalPossibleAffixes.contains(PossibleModifier)) {
						FinalPossibleAffixes.add(PossibleModifier);
					}
					break;
				}
		}

		return FinalPossibleAffixes;
	}

	/**
	 * Computes the probability of a modifier appearing based on the
	 * current crafting state, available affixes, and weights.
	 *
	 * @param baseItem         The item being crafted
	 * @param candidate        The crafting candidate
	 * @param event            The modifier event
	 * @param ilvl             The item level
	 * @param i                Index in the modifier history
	 * @param PossiblePrefixes Potential prefix modifiers
	 * @param PossibleSuffixes Potential suffix modifiers
	 * @param isDesired        Whether the modifier is desired
	 * @return The computed probability (0.0 to 1.0)
	 */
	public static double NormalCompute(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event,
			int ilvl, int i, List<Modifier> PossiblePrefixes, List<Modifier> PossibleSuffixes, boolean isDesired) {

		double percentage = 0;
		double TotalPrefixWeight = 0;
		double TotalSuffixWeight = 0;
		double weight = 0;

		// Always use the base item level for filtering
		ilvl = baseItem.level;

		if (!isDesired) {
			for (ModifierTier tiers : event.modifier.tiers)
				weight += tiers.weight;
		} else {
			// Count the weight of the desired tier AND all better tiers available at this item level
			// event.tier is the chosen tier, we need to find its position and sum from there to the end
			Modifier modifier = event.modifier;
			int chosenTierIndex = -1;
			
			// Find the index of the chosen tier in the full tier list
			for (int idx = 0; idx < modifier.tiers.size(); idx++) {
				if (modifier.tiers.get(idx).equals(event.tier)) {
					chosenTierIndex = idx;
					break;
				}
			}
			
			// Sum weights from chosen tier to the end (better tiers), filtering by item level
			if (chosenTierIndex >= 0) {
				for (int idx = chosenTierIndex; idx < modifier.tiers.size(); idx++) {
					ModifierTier tier = modifier.tiers.get(idx);
					if (tier.level <= ilvl) {
						weight += tier.weight;
					}
				}
			} else {
				// Fallback: just use the event tier weight
				weight = event.tier.weight;
			}
		}

		if (PossiblePrefixes != null)
			TotalPrefixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossiblePrefixes, ilvl);

		if (PossibleSuffixes != null)
			TotalSuffixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossibleSuffixes, ilvl);

		double[] affixCount = Probability.countAffixesFilled(candidate, i);
		double prefixesFilled = affixCount[0];
		double suffixesFilled = affixCount[1];

		// Check if we actually have available affixes (not just non-null but also
		// non-empty)
		boolean hasPrefixes = PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && TotalPrefixWeight > 0;
		boolean hasSuffixes = PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && TotalSuffixWeight > 0;

		if (prefixesFilled < 3 && suffixesFilled < 3 && hasPrefixes && hasSuffixes) {
			double TotalWeight = TotalPrefixWeight + TotalSuffixWeight;
			percentage = weight / TotalWeight;
			return percentage;
		}

		if (event.modifier.type == ModifierType.PREFIX && (suffixesFilled >= 3 || !hasSuffixes)) {
			percentage = weight / TotalPrefixWeight;
			return percentage;
		}

		if (event.modifier.type == ModifierType.SUFFIX && (prefixesFilled >= 3 || !hasPrefixes)) {
			percentage = weight / TotalSuffixWeight;
			return percentage;
		}

		return 0;
	}
}
