package core.Crafting;


import java.util.ArrayList;
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
import core.Modifier_class.ModifierTier;
import core.Modifier_class.Modifier.ModifierType;

public class Probability {
	


	public static void CalculatingProbability(List<Crafting_Candidate> completedPaths, List<Modifier> desiredMod, Crafting_Item baseItem)
	{
		for (Crafting_Candidate candidate : completedPaths) 
		{
			// We implement i to get the event in all our candidates, so that we can replace it easier
			int i = 0;
			// We do all at once, we do not care about the order
			for (ModifierEvent event : candidate.modifierHistory)
			{
				// Retrieving the first action to know what it is
				Crafting_Action action = event.source.keySet().iterator().next();

				//Not doing the transmutation

				// Not doing aug for now, want to see a 100% prob if it is possible
				if(action instanceof RegalOrb)
					ComputeRegalAndExalted(candidate, desiredMod, baseItem, i);
				else if(action instanceof ExaltedOrb)
					ComputeRegalAndExalted(candidate, desiredMod, baseItem, i);
				else if(action instanceof AnnulmentOrb)
					ComputeAnnul(candidate, desiredMod, baseItem, i);
				else if(action instanceof Essence_currency)
					ComputeEssence(candidate, desiredMod, baseItem, i);
				else if(action instanceof Desecrated_currency)
					ComputeDes(candidate, desiredMod, baseItem, i);
				i++;
			}
		}
		return ;
	}

	public static void ComputeRegalAndExalted(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		Modifier foundModifier = candidate.modifierHistory.get(i).modifier;

		// Checking the level so that we apply the good currency tiers
		if (foundModifier != null)
		{
			int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
			int level = foundModifier.tiers.get(realtier).level;

			int[] levels;
			Crafting_Action.CurrencyTier[] tiers;
		
			if (level < 35)
			{
				levels = new int[]{0};
				tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE};
			}
			else if (level < 50)
			{
				levels = new int[]{0, 35};
				tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE, CurrencyTier.GREATER};
			}
			else
			{
				levels = new int[]{0, 35, 50};
				tiers = new Crafting_Action.CurrencyTier[]{CurrencyTier.BASE, CurrencyTier.GREATER, CurrencyTier.PERFECT};
			}
		
			if (candidate.modifierHistory.get(i).source.keySet().iterator().next() instanceof RegalOrb)
			{
				applyTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i);
				canBeEssence(baseItem, candidate, event, level, realtier, i);
			}
			if (candidate.modifierHistory.get(i).source.keySet().iterator().next() instanceof ExaltedOrb)
				applyTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i);
		}
	}

	public static void ComputeAnnul(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof AnnulmentOrb)
		{
			for (AnnulmentOrb.Omen currentOmen : AnnulmentOrb.Omen.values())
			{
				percentage = ComputePercentageAnnul(baseItem, candidate, event, currentOmen, i);
				if(percentage != 0)
					candidate.modifierHistory.get(i).source.put(new AnnulmentOrb(currentOmen), percentage);
			}
		}


	}

	public static void ComputeDes(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Desecrated_currency)
		{
			for (Desecrated_currency.Omen currentOmen : Desecrated_currency.Omen.values())
			{
				percentage = ComputePercentageDesecrated_currency(baseItem, candidate, event, currentOmen, i);
				if(percentage != 0)
					candidate.modifierHistory.get(i).source.put(new Desecrated_currency(currentOmen), percentage);
			}
		}
	}

	public static double ComputePercentageDesecrated_currency(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i)
	{
		double prefixesFilled = 0;
		double suffixesFilled = 0;

		double kurgal_modTotal = 0;
		double amanamu_modTotal = 0;
		double ulaman_modTotal = 0;

		double percentage = 0;

		List<Modifier> PossiblePrefixes = baseItem.base.getDesecratedAllowedPrefixes();
		List<Modifier> PossibleSuffixes = baseItem.base.getDesecratedAllowedSuffixes();

		/* Here we check which type it is, because for the omens we need to do 1 out of all the desecrated family modifiers, but if we have prefix and suffix, the omens help us keep the percentage the same, 
			we just add the omen if there is both affixes */
		if(event.modifier.type == ModifierType.PREFIX) 
		{
			for(Modifier m : PossiblePrefixes)
			{
				if(m.tags.contains("kurgal_mod"))
					kurgal_modTotal++;
				if(m.tags.contains("amanamu_mod"))
					amanamu_modTotal++;
				if(m.tags.contains("ulaman_mod"))
					ulaman_modTotal++;
			}
		}
		else
		{
			for(Modifier m : PossibleSuffixes)
			{
				if(m.tags.contains("kurgal_mod"))
					kurgal_modTotal++;
				if(m.tags.contains("amanamu_mod"))
					amanamu_modTotal++;
				if(m.tags.contains("ulaman_mod"))
					ulaman_modTotal++;
			}
		}
		

		for(int j = 0; j < i; j++)
		{
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				prefixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				suffixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled++;
		}

		if (omen instanceof Desecrated_currency.Omen desOmen)
		{
			Desecrated_currency orb = (Desecrated_currency) event.source.keySet().iterator().next();
			switch(desOmen)
			{
				case OmenofSinistralNecromancy:
					break; 
				case OmenofDextralNecromancy:
					break;
				case OmenoftheBlackblooded:
				{
					if(event.modifier.tags.contains("kurgal_mod"))
						percentage = 1 / kurgal_modTotal; // We have a guarantee to have a random kurgal modifier so 1 out of the total of them
					else
						break; // If no kurgal_mod break it will do nothing
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheLiege:
				{
					if(event.modifier.tags.contains("amanamu_mod"))
						percentage = 1 / amanamu_modTotal;
					else
						break;
					if (PossiblePrefixes != null && !PossiblePrefixes.isEmpty() && event.modifier.type == ModifierType.SUFFIX) // If we have desecrated prefix modifiers and the mod we add is a suffix, we apply the omen for only suffix
						orb.addOmen(Desecrated_currency.Omen.OmenofDextralNecromancy);
					else if (PossibleSuffixes != null && !PossibleSuffixes.isEmpty() && event.modifier.type == ModifierType.PREFIX) // Opposite here
						orb.addOmen(Desecrated_currency.Omen.OmenofSinistralNecromancy);
					break;
				}
				case OmenoftheSovereign:
				{
					if(event.modifier.tags.contains("ulaman_mod"))
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

	public static void ComputeEssence(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		double percentage = 0;
		Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
		Crafting_Action action = source.keySet().iterator().next();

		if (action instanceof Essence_currency)
		{
			for (Essence_currency.Omen currentOmen : Essence_currency.Omen.values())
			{
				percentage = ComputePercentageEssence(baseItem, candidate, event, currentOmen, i);
				if(percentage != 0)
					candidate.modifierHistory.get(i).source.put(new Essence_currency(currentOmen), percentage);
			}
		}
	}

	public static double ComputePercentageEssence(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i)
	{
		double prefixesFilled = 0;
		double suffixesFilled = 0;

		for(int j = 0; j < i; j++)
		{
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				prefixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				suffixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled++;
		}

		if (omen instanceof Essence_currency.Omen essenceOmen)
		{
			switch(essenceOmen)
			{
				case None:
				{
					if(event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0)
						return 1 / prefixesFilled;
					if(event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0)
						return 1 / suffixesFilled;
					else
						return 1 / (prefixesFilled + suffixesFilled); // We have a chance out of all the modifiers on the item
				}
				case OmenofSinistralCrystallisation:
				{
					if(event.modifier.type == ModifierType.PREFIX)
						return 1 / prefixesFilled; // We only calculate the chance of removing the modifier out of all the prefix modifiers
					break; // Break if it is a suffix 
				}
				case OmenofDextralCrystallisation:
				{
					if(event.modifier.type == ModifierType.SUFFIX)
						return 1 / suffixesFilled; //same
					break;
				}
			}
		}


		return 0;
	}

	public static double ComputePercentageAnnul(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, Enum<?> omen, int i)
	{
		double prefixesFilled = 0;
		double suffixesFilled = 0;

		for(int j = 0; j < i; j++)
		{
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				prefixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				suffixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled++;
		}

		if (omen instanceof AnnulmentOrb.Omen annulOmen)
		{
			switch(annulOmen)
			{
				case None:
				{
					if(event.modifier.type == ModifierType.PREFIX && suffixesFilled == 0)
						return 1 / prefixesFilled;
					if(event.modifier.type == ModifierType.SUFFIX && prefixesFilled == 0)
						return 1 / suffixesFilled;
					else
						return 1 / (prefixesFilled + suffixesFilled); // We have a chance out of all the modifiers on the item
				}
				case OmenofSinistralAnnulment:
				{
					if(event.modifier.type == ModifierType.PREFIX)
						return 1 / prefixesFilled; // We only calculate the chance of removing the modifier out of all the prefix modifiers
					break; // Break if it is a suffix 
				}
				case OmenofDextralAnnulment:
				{
					if(event.modifier.type == ModifierType.SUFFIX)
						return 1 / suffixesFilled; //same
					break;
				}
			}
		}
		return 0;
	}

	public static double ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, Enum<?> omen, int i)
	{

		if (omen instanceof RegalOrb.Omen regalOmen)
		{
			switch(regalOmen)
			{
				case None:
				{
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes);
				}
				case OmenofHomogenisingCoronation :
				{
					// If the modifier of the event has no tags we break
					if (event.modifier.tags.isEmpty() || event.modifier.tags.get(0) == null || event.modifier.tags.get(0).isEmpty())
						break ;
					List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
					List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes);
				}
			}
		}
		if (omen instanceof ExaltedOrb.Omen exaltOmen)
		{
			ExaltedOrb orb = (ExaltedOrb) event.source.keySet().iterator().next();
			switch(exaltOmen)
			{
				case None : 
				{
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes);
				}
				case OmenofHomogenisingExaltation :
				{
					// If the modifier of the event has no tags we break
					if (event.modifier.tags.isEmpty() || event.modifier.tags.get(0) == null || event.modifier.tags.get(0).isEmpty())
						break ;
					if(event.modifier.type == ModifierType.PREFIX)
					{
						List<Modifier> PossiblePrefixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedPrefixes(), i);
						orb.addOmen(ExaltedOrb.Omen.OmenofSinistralExaltation);
						return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null);
					}
					if(event.modifier.type == ModifierType.SUFFIX)
					{
						List<Modifier> PossibleSuffixes = GetHomogAffixes(baseItem, candidate, event, baseItem.base.getNormalAllowedSuffixes(), i);
						orb.addOmen(ExaltedOrb.Omen.OmenofDextralExaltation);
						return NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes);
					}
					break;
				}
				case OmenofSinistralExaltation :
				{
					if(event.modifier.type == ModifierType.PREFIX)
					{
						List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
						return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, null);
					}
					break ;
				}
				case OmenofDextralExaltation :
				{
					if(event.modifier.type == ModifierType.SUFFIX)
					{
						List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
						return NormalCompute(baseItem, candidate, event, ilvl, i, null, PossibleSuffixes);
					}
					break;
				}
			}
		}
		return 0;
	}

	public static List<Modifier> GetHomogAffixes(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, List<Modifier> PossibleAffixes, int i)
	{
		List<Modifier> FinalPossibleAffixes = new ArrayList<>();
		List<String> ItemAffixTags = new ArrayList<>();

		for(int j = 0; j <= i; j++)
		{
			// Retrieving the tags 
			for(String tags : candidate.modifierHistory.get(j).modifier.tags)
				if(!tags.isEmpty() && !ItemAffixTags.contains(tags))	
					ItemAffixTags.add(tags);
		}

		for(Modifier PossibleModifier : PossibleAffixes) // Looping through all modifiers passed in arguments
			for (String tag : PossibleModifier.tags) // Looping through every tags the modifiers we got has
				if (ItemAffixTags.contains(tag) && !tag.isEmpty()) // If the modifier has a tag that we already have from the current Item Affixes, we add it to the list of Affixes we could have rolled (for the weight)
				{
					if (!FinalPossibleAffixes.contains(PossibleModifier)) // Checking for not adding duplicates
						FinalPossibleAffixes.add(PossibleModifier);
					break;
				}
		return FinalPossibleAffixes;
	}

	public static double NormalCompute(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, int i, List<Modifier> PossiblePrefixes, List<Modifier> PossibleSuffixes)
	{
		int prefixesFilled = 0;
		int suffixesFilled = 0;

		double percentage = 0;

		double TotalPrefixWeight = 0;
		double TotalSuffixWeight = 0;

		// We need to omens here

		// If there is room for both a prefix or a suffix, the total weight might be both combined
		if(PossiblePrefixes != null)
			TotalPrefixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossiblePrefixes, ilvl);

		if(PossibleSuffixes != null)
			TotalSuffixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossibleSuffixes, ilvl);

		for(int j = 0; j < i; j++)
		{
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				prefixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.ADDED)
				suffixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				prefixesFilled--;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX && candidate.modifierHistory.get(j).type == ActionType.REMOVED)
				suffixesFilled++;
		}

		// here we compute the percentage with the total weight of all normal modifiers, because it could have landed on either a prefix or a suffix 
		if(prefixesFilled < 3 && suffixesFilled < 3 && PossiblePrefixes != null && PossibleSuffixes != null) // We check for null because of the omens
		{
			double TotalWeight = TotalPrefixWeight + TotalSuffixWeight;
			percentage = event.tier.weight / TotalWeight;
			return percentage;
		}

		// If the modifier was a prefix and we know all the suffixes were filleds, we calculate only for TotalPrefixWeight because it could have ony roll a prefix
		if(event.modifier.type == ModifierType.PREFIX && (suffixesFilled >= 3 || PossibleSuffixes == null))
		{
			percentage = event.tier.weight / TotalPrefixWeight;
			return percentage;
		}

		// Same for suffixes
		if(event.modifier.type == ModifierType.SUFFIX && (prefixesFilled >= 3 || PossiblePrefixes == null))
		{
			percentage = event.tier.weight / TotalSuffixWeight;
			return percentage;
		}
		return 0;
	}

	private static void applyTiersAndComputeRegals(
		Crafting_Item baseItem,
		Crafting_Candidate candidate,
		ModifierEvent event,
		int[] levels,
		Crafting_Action.CurrencyTier[] tiers,
		int i
	) 
	{
		// Computing the percentage for the modifier and then applying the currency tier without omens
		for (int j = 0; j < levels.length; j++)
		{
			double percentage = 0;
			Map<Crafting_Action, Double> source = candidate.modifierHistory.get(i).source;
			Crafting_Action action = source.keySet().iterator().next();

			if (action instanceof RegalOrb)
			{
				// Doing all the omens (and None) for the current currency tier, and repeating it
				for (RegalOrb.Omen currentOmen : RegalOrb.Omen.values())
				{
					percentage = ComputePercentage(baseItem, candidate, event, levels[j], currentOmen, i);
					if(percentage != 0)
						candidate.modifierHistory.get(i).source.put(new RegalOrb(tiers[j], currentOmen), percentage);
				}
			}
			if(action instanceof ExaltedOrb) // For exalt, we need to take in count the desecrations also
			{
				for (ExaltedOrb.Omen currentOmen : ExaltedOrb.Omen.values())
				{
					percentage = ComputePercentage(baseItem, candidate, event, levels[j], currentOmen, i);
					if(percentage != 0)
						candidate.modifierHistory.get(i).source.put(new ExaltedOrb(tiers[j], currentOmen), percentage);
				}
			}
		}
	}

	private static void canBeEssence(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int level, int realtier, int i)
	{
		if(event.modifier.type == ModifierType.PREFIX)
		{
			List<Modifier> PossiblePrefixes = baseItem.base.getEssencesAllowedPrefixes();

			// Loop until we find the same family, then check the ilvl to see if we can apply the essence
			for (Modifier m : PossiblePrefixes)
			{
				if (m.family.equals(event.modifier.family))
				{
					for(ModifierTier mtiers : m.tiers)
						if(mtiers.level == level)
							candidate.modifierHistory.get(i).source.put(new Essence_currency(m.family, mtiers), 100.0);
					break;
				}
			}
		}

		if(event.modifier.type == ModifierType.SUFFIX)
		{
			List<Modifier> PossibleSuffixes = baseItem.base.getEssencesAllowedSuffixes();

			// Loop until we find the same family, then check the ilvl to see if we can apply the essence
			for (Modifier m : PossibleSuffixes)
			{
				if (m.family.equals(event.modifier.family))
				{
					for(ModifierTier mtiers : m.tiers)
						if(mtiers.level == level)
							candidate.modifierHistory.get(i).source.put(new Essence_currency(m.family, mtiers), 100.0);
					break;
				}
			}
		}
	}
}
