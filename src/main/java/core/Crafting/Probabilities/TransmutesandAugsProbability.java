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

	public static void ComputeTransmutesandAugs(Crafting_Candidate candidate, List<Modifier> desiredMod,
		Crafting_Item baseItem, int i, List<Map<String, String>> excludedCurrencies) {


			ModifierEvent event = candidate.modifierHistory.get(i);
			Map<Crafting_Action, Double> source = event.source;
			Crafting_Action action = source.keySet().iterator().next();

			Modifier foundModifier = event.modifier;
			boolean isDesired = desiredMod.contains(foundModifier);

			int ilvl = 0;
			List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
			List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();

			double percentage = ExaltAndRegalProbability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes,
						isDesired);
			if (percentage != 0 && action instanceof TransmutationOrb)
					source.put(new TransmutationOrb(), percentage);
			if (percentage != 0 && action instanceof AugmentationOrb)
					source.put(new AugmentationOrb(), percentage);
	}
}
