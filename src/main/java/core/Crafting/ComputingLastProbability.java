package core.Crafting;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action.CurrencyTier;
import core.Crafting.Utils.ModifierEvent;
import core.Crafting.Utils.ModifierEvent.ActionType;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;
import core.Modifier_class.ModifierTier;

public class ComputingLastProbability {

	public static double GLOBAL_THRESHOLD = 0.50;

	public static void setGlobalThreshold(double newValue) {
        GLOBAL_THRESHOLD = newValue;
    }

	public static double getGlobalThreshold() {
        return GLOBAL_THRESHOLD;
    }

	public static void ComputingLastEventProbability(List<Crafting_Candidate> completedPaths,
			List<Modifier> desiredMod, Crafting_Item baseItem) {

		// Thread-safe list to collect candidates that should be removed
		List<Crafting_Candidate> toRemove = Collections.synchronizedList(new ArrayList<>());

		completedPaths.parallelStream().forEach(candidate -> {
			if (candidate.modifierHistory.isEmpty())
				return; // skip empty candidates

			ModifierEvent event = candidate.modifierHistory.get(candidate.modifierHistory.size() - 1);
			int i = candidate.modifierHistory.size() - 1;

			Crafting_Action action = event.source.keySet().iterator().next();
			boolean keep = true;

			if (action instanceof RegalOrb || action instanceof ExaltedOrb)
				keep = ComputeLastRegalAndExalted(candidate, desiredMod, baseItem, i);
			else if (action instanceof AnnulmentOrb)
				keep = ComputeLastAnnul(candidate, desiredMod, baseItem, i);
			else if (action instanceof Essence_currency)
				keep = ComputeLastEssence(candidate, desiredMod, baseItem, i);
			else if (action instanceof Desecrated_currency)
				keep = ComputeLastDes(candidate, desiredMod, baseItem, i);

			if (!keep) 
				toRemove.add(candidate);
		});

		// Remove all candidates that failed the check
		completedPaths.removeAll(toRemove);
	}

	public static boolean ComputeLastDes(Crafting_Candidate candidate, List<Modifier> desiredMod,
			Crafting_Item baseItem,
			int i) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Desecrated_currency) {
			for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values()) {
				percentage = Probability.ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen,
						i);
				if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
					return true;
			}
		}
		return false;
	}

	public static boolean ComputeLastRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);
		Modifier foundModifier = event.modifier;

		boolean isDesired = desiredMod.contains(foundModifier);

		// Checking the level so that we apply the good currency tiers
		if (foundModifier != null)
		{
			int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
			int level = foundModifier.tiers.get(realtier).level;

			int[] levels;
			Crafting_Action.CurrencyTier[] tiers;

			if (level < 35) {
				levels = new int[] { 0 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE };
			} else if (level < 50) {
				levels = new int[] { 0, 35 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER };
			} else {
				levels = new int[] { 0, 35, 50 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER,
						CurrencyTier.PERFECT };
			}

			Crafting_Action action = event.source.keySet().iterator().next();

			if (applyLastTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i, isDesired))
				return true;
			if (action instanceof RegalOrb)
				return canBeEssence(baseItem, candidate, event, level, realtier, i);
		}
		return false;
	}

	public static boolean ComputeLastAnnul(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof AnnulmentOrb)
		{
			for (AnnulmentOrb.Omen currentOmen : AnnulmentOrb.Omen.values())
			{
				percentage = Probability.ComputePercentageAnnul(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
					return true;
			}
		}
		return false;
	}

	private static boolean canBeEssence(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int level, int realtier, int i)
	{
		if (event.modifier.type == ModifierType.PREFIX)
		{
			List<Modifier> PossiblePrefixes = baseItem.base.getEssencesAllowedPrefixes();

			// Loop until we find the same family, then check the ilvl to see if we can
			// apply the essence
			for (Modifier m : PossiblePrefixes)
			{
				if (m.family.equals(event.modifier.family))
				{
					for (ModifierTier mtiers : m.tiers)
						if (mtiers.level == level)
							return true;
					break;
				}
			}
		}

		if (event.modifier.type == ModifierType.SUFFIX) {
			List<Modifier> PossibleSuffixes = baseItem.base.getEssencesAllowedSuffixes();

			// Loop until we find the same family, then check the ilvl to see if we can
			// apply the essence
			for (Modifier m : PossibleSuffixes)
			{
				if (m.family.equals(event.modifier.family))
				{
					for (ModifierTier mtiers : m.tiers)
						if (mtiers.level == level)
							return true;
					break;
				}
			}
		}
		return false;
	}

	private static boolean applyLastTiersAndComputeRegals(
			Crafting_Item baseItem,
			Crafting_Candidate candidate,
			ModifierEvent event,
			int[] levels,
			Crafting_Action.CurrencyTier[] tiers,
			int i,
			boolean isDesired) {
		Map<Crafting_Action, Double> source = event.source;
		Crafting_Action action = source.keySet().iterator().next();
		// Computing the percentage for the modifier and then applying the currency tier
		// without omens

		for (int j = 0; j < levels.length; j++) {
			int level = levels[j];

			if (action instanceof RegalOrb)
			{
				for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values())
				{
					double percentage = Probability.ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
						return true;
				}
			}
			else if (action instanceof ExaltedOrb)
			{
				for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values())
				{
					double percentage = Probability.ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
						return true;
				}
			}
		}
		return false;
	}

	public static boolean ComputeLastEssence(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Essence_currency) {
			for (Essence_currency.Omen currentOmen : Essence_currency.Omen.values()) {
				percentage = Probability.ComputePercentageEssence(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0 && percentage >= GLOBAL_THRESHOLD)
					return true;
				if (Double.isInfinite(percentage)) {
					System.out.println("Wtf");
				}
			}
		}
		return false;
	}

}
