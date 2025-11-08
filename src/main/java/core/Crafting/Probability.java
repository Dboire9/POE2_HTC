package core.Crafting;


import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action.CurrencyTier;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
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
				{}// ComputeAnnul(candidate, desiredMod, baseItem, i);
				else if(action instanceof Essence_currency)
				{}	// ComputeEssence(candidate, event, desiredMod);
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
				for (RegalOrb.Omen omen : RegalOrb.Omen.values())
					applyTiersAndComputeRegals(baseItem, candidate, event, levels, tiers, i, omen);
				canBeEssence(baseItem, candidate, event, level, realtier, i);
			}
		}
	}

	// public static void ComputeAnnul(Crafting_Candidate candidate, List<Modifier> desiredMod, Crafting_Item baseItem, int i)
	// {
	// 	ModifierEvent event = candidate.modifierHistory.get(i);


	// }

	// public static void ComputeExalt(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, )
	// {
		
	// }

	// public static void ComputeEssence(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, )
	// {
		
	// }

	public static double ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, Enum<?> omen, int i)
	{

		if (omen instanceof RegalOrb.Omen regalOmen)
		{
			switch(regalOmen)
			{
				case None -> 
				{
					List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
					List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
					return NormalCompute(baseItem, candidate, event, ilvl, i, PossiblePrefixes, PossibleSuffixes);
				}
				case OmenofHomogenisingCoronation ->
				{

				}
			}
		}
		if (omen instanceof ExaltedOrb.Omen exaltOmen)
		{
			switch(exaltOmen)
			{
				case None -> 
				{
					return NormalCompute(baseItem, candidate, event, ilvl, i);
				}
				case OmenofHomogenisingExaltation ->
				{

				}
			}
		}
	return 0;
	}

	public static double NormalCompute(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl, int i, List<Modifier> PossiblePrefixes, List<Modifier> PossibleSuffixes)
	{
		int prefixesFilled = 0;
		int suffixesFilled = 0;

		double percentage = 0;

		// We need to omens here

		// If there is room for both a prefix or a suffix, the total weight might be both combined
		int TotalPrefixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossiblePrefixes, ilvl);

		double TotalSuffixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossibleSuffixes, ilvl);

		for(int j = 0; j < i; j++)
		{
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.PREFIX)
				prefixesFilled++;
			if(candidate.modifierHistory.get(j).modifier.type == ModifierType.SUFFIX)
				suffixesFilled++;
		}

		// here we compute the percentage with the total weight of all normal modifiers, because it could have landed on either a prefix or a suffix 
		if(prefixesFilled < 3 && suffixesFilled < 3)
		{
			double TotalWeight = TotalPrefixWeight + TotalSuffixWeight;
			percentage = event.tier.weight / TotalWeight;
			return percentage;
		}

		// If the modifier was a prefix and we know all the suffixes were filleds, we calculate only for TotalPrefixWeight because it could have ony roll a prefix
		if(event.modifier.type == ModifierType.PREFIX && suffixesFilled >= 3)
		{
			percentage = event.tier.weight / TotalPrefixWeight;
			return percentage;
		}

		// Same for suffixes
		if(event.modifier.type == ModifierType.SUFFIX && prefixesFilled >= 3)
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
		int i,
		Enum<?> omen
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
					candidate.modifierHistory.get(i).source.put(new RegalOrb(tiers[j], currentOmen), percentage);
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
