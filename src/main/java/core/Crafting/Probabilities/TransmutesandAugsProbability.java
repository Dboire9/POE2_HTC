package core.Crafting.Probabilities;

import java.util.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Crafting.Crafting_Action.CurrencyTier;
import core.Currency.*;
import core.Crafting.Utils.ModifierEvent;

/**
 * Handles probability computations for Transmute and Augmentation orb usage in crafting.
 * This includes determining the likelihood of a modifier appearing under
 * specific currency tiers, item desecration, and omen effects.
 */
public class TransmutesandAugsProbability {

	/**
	 * Computes the effect of a Transmutation or Augmentation orb application on a crafting candidate.
	 * Determines the appropriate currency tiers based on the modifier level and applies probability
	 * calculations for each relevant tier.
	 *
	 * @param candidate           The crafting candidate whose modifier history is being evaluated
	 * @param desiredMod          The list of desired modifiers to check against
	 * @param baseItem            The item being crafted
	 * @param i                   Index in the modifier history to evaluate
	 * @param excludedCurrencies  List of excluded currency configurations
	 */
	public static void ComputeTransmutesandAugs(Crafting_Candidate candidate, List<Modifier> desiredMod,
		Crafting_Item baseItem, int i, List<Map<String, String>> excludedCurrencies) {

			ModifierEvent event = candidate.modifierHistory.get(i);
			Map<Crafting_Action, Double> source = event.source;
			Crafting_Action action = source.keySet().iterator().next();

			Modifier foundModifier = event.modifier;
			boolean isDesired = desiredMod.contains(foundModifier);

			if (foundModifier != null) {
				// Check for excluded tiers
				String transmuteTier = null;
				String augmentTier = null;
				
				if (action instanceof TransmutationOrb) {
					transmuteTier = excludedCurrencies.stream()
							.filter(e -> "transmutation".equals(e.get("currency")))
							.map(e -> e.get("tier"))
							.findFirst()
							.orElse(null);
				} else if (action instanceof AugmentationOrb) {
					augmentTier = excludedCurrencies.stream()
							.filter(e -> "augmentation".equals(e.get("currency")))
							.map(e -> e.get("tier"))
							.findFirst()
							.orElse(null);
				}

				boolean isExcludedBase = "base".equals(transmuteTier) || "base".equals(augmentTier);
				boolean isExcludedGreater = "greater".equals(transmuteTier) || "greater".equals(augmentTier);
				boolean isExcludedPerfect = "perfect".equals(transmuteTier) || "perfect".equals(augmentTier);

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

				// Find the chosen tier based on UI selection
				int originalTierNumber = foundModifier.chosenTier;
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
				// Fallback: if not found (tier not available for item level), use the best available
				if (chosenTierObj == null && !availableTiers.isEmpty()) {
					chosenTierObj = availableTiers.get(availableTiers.size() - 1);
					filteredChosenTier = availableTiers.size() - 1;
				}
				
				// Additional safety check
				if (chosenTierObj == null) {
					return; // Skip this modifier
				}

				int level = chosenTierObj.level;

				// Build lists of applicable tiers based on level and exclusions
				List<Integer> levelsList = new ArrayList<>();
				List<Crafting_Action.CurrencyTier> tiersList = new ArrayList<>();

				// Add BASE tier if not excluded and level supports it
				if (!isExcludedBase && level >= 0) {
					levelsList.add(0);
					tiersList.add(CurrencyTier.BASE);
				}

				// Add GREATER tier if not excluded and level supports it
				if (!isExcludedGreater && level >= 35) {
					levelsList.add(35);
					tiersList.add(CurrencyTier.GREATER);
				}

				// Add PERFECT tier if not excluded and level supports it
				if (!isExcludedPerfect && level >= 50) {
					levelsList.add(50);
					tiersList.add(CurrencyTier.PERFECT);
				}

				// Convert lists to arrays
				int[] levels = levelsList.stream().mapToInt(Integer::intValue).toArray();
				Crafting_Action.CurrencyTier[] tiers = tiersList.toArray(new Crafting_Action.CurrencyTier[0]);

				// Apply tiers and compute probabilities
				applyTiersAndComputeTransmutesAndAugs(baseItem, candidate, event, levels, tiers, i, isDesired, action);
			}
	}

	/**
	 * Applies each relevant currency tier for a modifier and computes the probability of occurrence.
	 *
	 * @param baseItem  The item being crafted
	 * @param candidate The crafting candidate
	 * @param event     The modifier event to evaluate
	 * @param levels    The applicable item levels for currency computation
	 * @param tiers     The corresponding currency tiers
	 * @param i         Index of the modifier event in history
	 * @param isDesired Whether the modifier is desired by the player
	 * @param action    The original action (TransmutationOrb or AugmentationOrb)
	 */
	private static void applyTiersAndComputeTransmutesAndAugs(
			Crafting_Item baseItem,
			Crafting_Candidate candidate,
			ModifierEvent event,
			int[] levels,
			Crafting_Action.CurrencyTier[] tiers,
			int i,
			boolean isDesired,
			Crafting_Action action) {
		Map<Crafting_Action, Double> source = event.source;

		List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
		List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();

		for (int j = 0; j < levels.length; j++) {
			int level = levels[j];
			Crafting_Action.CurrencyTier tier = tiers[j];

			double percentage = ExaltAndRegalProbability.NormalCompute(baseItem, candidate, event, level, i, 
					PossiblePrefixes, PossibleSuffixes, isDesired);
			
			if (percentage != 0) {
				if (action instanceof TransmutationOrb) {
					source.put(new TransmutationOrb(tier), percentage);
				} else if (action instanceof AugmentationOrb) {
					source.put(new AugmentationOrb(tier), percentage);
				}
			}
		}
	}
}
