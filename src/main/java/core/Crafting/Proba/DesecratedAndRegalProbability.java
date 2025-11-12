package core.Crafting.Proba;

import java.util.*;
import core.Items.*;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Crafting.*;
import core.Crafting.Crafting_Action.CurrencyTier;
import core.Currency.*;
import core.Crafting.Proba.Probability;
import core.Crafting.Utils.ModifierEvent;

public class DesecratedAndRegalProbability {

    /**
     * Handles Regal and Exalted orb computations.
     * Shared tier logic is handled through applyTiersAndComputeRegals().
     */
	public static void ComputeRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);
		Modifier foundModifier = event.modifier;
		boolean isDesired = desiredMod.contains(foundModifier);


		// Checking the level so that we apply the good currency tiers
		if (foundModifier != null) {
			int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
			int level = foundModifier.tiers.get(realtier).level;

			int[] levels;
			Crafting_Action.CurrencyTier[] tiers;

			if (level < 35) {
				levels = new int[] { 0 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE};
			} else if (level < 50) {
				levels = new int[] { 0, 35, 40 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY};
			} else {
				levels = new int[] { 0, 35, 40, 50 };
				tiers = new Crafting_Action.CurrencyTier[] { CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.DES_CURRENCY, CurrencyTier.PERFECT};
			}

			Crafting_Action action = event.source.keySet().iterator().next();

			applyTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i, isDesired);
			if (action instanceof RegalOrb)
				canBeEssence(baseItem, candidate, event, level, realtier, i);
		}
	}

    /**
     * Handles Desecrated currency computations.
     * This function computes probability tiers for desecrated outcomes.
     */
	public static void ComputeDes(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i) {
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Desecrated_currency) {
			for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values()) {
				percentage = ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen, i);
				if (percentage != 0)
					candidate.modifierHistory.get(i).source.put(new Desecrated_currency(currentOmen), percentage);
			}
		}
	}

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
	// Computing the percentage for the modifier and then applying the currency tier without omens

		for (int j = 0; j < levels.length; j++)
		{
			int level = levels[j];
			Crafting_Action.CurrencyTier tier = tiers[j];

			if(tier == Crafting_Action.CurrencyTier.DES_CURRENCY && candidate.desecrated)
				return;

			if (action instanceof RegalOrb)
			{
				for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values())
				{
					double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if (percentage != 0)
						source.put(new RegalOrb(tier, currentOmen), percentage);
				}
			}
			else if (action instanceof ExaltedOrb)
			{
				for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values())
				{
					double percentage = ComputePercentage(baseItem, candidate, event, level, currentOmen, i, isDesired);
					if(percentage == 2)
						source.put(new ExaltedOrb(Crafting_Action.CurrencyTier.DES_CURRENCY, currentOmen), percentage); // Doing this the ugly way for now
					else if (percentage != 0)
						source.put(new ExaltedOrb(tier, currentOmen), percentage);
				}
			}
		}
	}

    /**
     * Performs the detailed desecrated probability computation.
     */
	public static double ComputePercentageDesecrated_currency(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i) {

		double kurgal_modTotal = 0;
		double amanamu_modTotal = 0;
		double ulaman_modTotal = 0;

		double percentage = 0;

		List<Modifier> PossiblePrefixes = baseItem.base.getDesecratedAllowedPrefixes();
		List<Modifier> PossibleSuffixes = baseItem.base.getDesecratedAllowedSuffixes();

		/*
		 * Here we check which type it is, because for the omens we need to do 1 out of
		 * all the desecrated family modifiers, but if we have prefix and suffix, the
		 * omens help us keep the percentage the same,
		 * we just add the omen if there is both affixes
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

		if (omen instanceof Desecrated_currency.Omen desOmen) {
			Desecrated_currency orb = (Desecrated_currency) event.source.keySet().iterator().next();
			switch (desOmen) {
				case OmenofSinistralNecromancy:
					break;
				case OmenofDextralNecromancy:
					break;
				case OmenoftheBlackblooded: {
					if (event.modifier.tags.contains("kurgal_mod"))
						percentage = 1 / kurgal_modTotal; // We have a guarantee to have a random kurgal modifier so 1 out of the total of them
					else
						break; // If no kurgal_mod break it will do nothing
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheLiege: {
					if (event.modifier.tags.contains("amanamu_mod"))
						percentage = 1 / amanamu_modTotal;
					else
						break;
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheSovereign: {
					if (event.modifier.tags.contains("ulaman_mod"))
						percentage = 1 / ulaman_modTotal;
					else
						break;
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
			}
		}

		return percentage;
	}

    /**
     * Computes chance for a single tier in desecrated computations.
     */
	public static double ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, Enum<?> omen, int i, boolean isDesired)
	{
		Crafting_Action action = event.source.keySet().iterator().next();

		double percentage = 0.0;

		if (omen instanceof RegalOrb.Omen regalOmen && ilvl != 40) // Not doing the greater desecrated currency here
		{
			switch (regalOmen) {
				case None:
				{
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					percentage =  Probability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
					return percentage;
				}
				case OmenofHomogenisingCoronation:
				{
					// If the modifier of the event has no tags we break
					if (event.modifier.tags.isEmpty() || event.modifier.tags.get(0) == null || event.modifier.tags.get(0).isEmpty())
						return 0;
					List<Modifier> PossiblePrefixes = Probability.GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
					List<Modifier> PossibleSuffixes = Probability.GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
					percentage =  Probability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
					return percentage;
				}
			}
		}
		if (omen instanceof ExaltedOrb.Omen exaltOmen)
		{
			ExaltedOrb orb = (ExaltedOrb) action;
			switch (exaltOmen)
			{
				case None:
				{
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					percentage =  Probability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes, isDesired);
					/* If we do not have a desecration on the item, here we simulate the fact of having the modifier with a desecration
					 * We also just do it on base tiers, as there is no tier
					 */
					if(candidate.desecrated == false && (ilvl == 0 || ilvl == 40))
					{
						percentage = 1 - Math.pow(1 - percentage, 3);
						// percentage = 2; // 100% chance because we can go again each time ? 
						// event.modifier.source = ModifierSource.DESECRATED;
						// candidate.desecrated = true;
					}
					return percentage;
				}
				case OmenofHomogenisingExaltation:
				{
					// If the modifier of the event has no tags we break
					if (event.modifier.tags.isEmpty() || event.modifier.tags.isEmpty() || ilvl == 40)
						return 0;
					if (event.modifier.type == ModifierType.PREFIX)
					{
						List<Modifier> PossiblePrefixes = Probability.GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
						orb.addOmen(ExaltedOrb.Omen.OmenofSinistralExaltation);
						return Probability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null, isDesired);
					}
					if (event.modifier.type == ModifierType.SUFFIX)
					{
						List<Modifier> PossibleSuffixes = Probability.GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
						orb.addOmen(ExaltedOrb.Omen.OmenofDextralExaltation);
						return Probability.NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes, isDesired);
					}
					break;
				}
				case OmenofSinistralExaltation:
				{
					if (event.modifier.type == ModifierType.PREFIX)
					{
						List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
						percentage =  Probability.NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null, isDesired);
						if(candidate.desecrated == false) // If we do not have a desecration on the item, here we simulate the fact of having the modifier with a desecration
						{
							percentage = 1 - Math.pow(1 - percentage, 3);
							// percentage = 2;
							// event.modifier.source = ModifierSource.DESECRATED;
							// candidate.desecrated = true;
						}
						return percentage;
					}
					break;
				}
				case OmenofDextralExaltation:
				{
					if (event.modifier.type == ModifierType.SUFFIX)
					{
						List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
						percentage =  Probability.NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes, isDesired);
						if(candidate.desecrated == false) // If we do not have a desecration on the item, here we simulate the fact of having the modifier with a desecration
						{
							percentage = 1 - Math.pow(1 - percentage, 3);
							// percentage = 2;
							// event.modifier.source = ModifierSource.DESECRATED;
							// candidate.desecrated = true;
						}
						return percentage;
					}
					break;
				}
			}
		}
		return 0;
	}

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
	}
}
