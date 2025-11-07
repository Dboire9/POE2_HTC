package core.Crafting;


import java.util.ArrayList;
import java.util.List;

import core.Crafting.Crafting_Action.*;
import core.Crafting.Crafting_Action.CurrencyTier;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.AugmentationOrb;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Currency.TransmutationOrb;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

public class Probability {
	


	public static void CalculatingProbability(List<Crafting_Candidate> completedPaths, List<Modifier> desiredMod, Crafting_Item baseItem)
	{
		List<Crafting_Candidate> FinalPath = new ArrayList<>();

		for (Crafting_Candidate candidate : completedPaths) 
		{
			// We implement i to get the event in all our candidates, so that we can replace it easier
			int i = 0;
			for (ModifierEvent event : candidate.modifierHistory)
			{
				Crafting_Action action = event.source;

				//Not doing the transmutation

				// Not doing aug for now, want to see a 100% prob if it is possible
				if(action instanceof RegalOrb)
					ComputeRegal(candidate, desiredMod, FinalPath, baseItem, i);
				if(action instanceof ExaltedOrb)
				{}
					// ComputeExalt(candidate, event, desiredMod, FinalPath);
				if(action instanceof AnnulmentOrb)
				{}	// ComputeAnnul(candidate, event, desiredMod, FinalPath);
				if(action instanceof Essence_currency)
				{}	// ComputeEssence(candidate, event, desiredMod, FinalPath);
				i++;
			}
		}
		return ;
	}

	public static void ComputeRegal(Crafting_Candidate candidate, List<Modifier> desiredMod, List<Crafting_Candidate> FinalPath, Crafting_Item baseItem, int i)
	{
		ModifierEvent event = candidate.modifierHistory.get(i);

		// Check if it is a desired mod
		Modifier foundModifier = null;
		for (Modifier m : desiredMod) {
			if (m.equals(candidate.modifierHistory.get(i).modifier)) { // or compare by ID, name, family, etc.
				foundModifier = m;
				break;
			}
		}
		// It is a desired mods (with the isinstance we retrieve the Crafting_action currency to potentially change it to Greater or Perfect)
		if(foundModifier != null)
		{
			// Top tiers are last in list and vice versa so we correct this
			int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
			// We have found the modifier now we need to retrieve the ilvl and compute the percentage of having it with different currency and see if we could have applied an omen
			if(foundModifier.tiers.get(realtier).level < 35)
				ComputePercentage(baseItem, candidate, event, 0); // Just apply the normal, we do not change the currency tier
			else if(foundModifier.tiers.get(realtier).level >= 35 && foundModifier.tiers.get(realtier).level < 50)
			{// Apply normal and greater
				ComputePercentage(baseItem, candidate, event, 0);
				if(event.source instanceof RegalOrb regal)
					regal.tier = CurrencyTier.BASE;
				FinalPath.add(candidate);

				// Greater
				Crafting_Candidate candidate_copy = new Crafting_Candidate();
				candidate_copy = candidate.copy();
				candidate_copy.percentage = 0;
				ComputePercentage(baseItem, candidate_copy, event, 35);
				if(candidate_copy.modifierHistory.get(i).source instanceof RegalOrb regal)
					regal.tier = CurrencyTier.GREATER;
				FinalPath.add(candidate_copy);
			}
			else if(foundModifier.tiers.get(realtier).level >= 50)
			{// Apply all (We might change how we do this)
				ComputePercentage(baseItem, candidate, event, 0);
				if(event.source instanceof RegalOrb regal)
					regal.tier = CurrencyTier.BASE;
				FinalPath.add(candidate);

				// Greater
				Crafting_Candidate candidate_copy = new Crafting_Candidate();
				candidate_copy = candidate.copy();
				candidate_copy.percentage = 0;
				ComputePercentage(baseItem, candidate_copy, event, 35);
				if(candidate_copy.modifierHistory.get(i).source instanceof RegalOrb regal)
					regal.tier = CurrencyTier.GREATER;
				FinalPath.add(candidate_copy);

				Crafting_Candidate new_candidate_copy = new Crafting_Candidate();
				new_candidate_copy = candidate.copy();
				new_candidate_copy.percentage = 0;
				ComputePercentage(baseItem, new_candidate_copy, event, 35);
				if(new_candidate_copy.modifierHistory.get(i).source instanceof RegalOrb regal)
					regal.tier = CurrencyTier.GREATER;
				FinalPath.add(new_candidate_copy);
			}
		}
	}

	// public static void ComputeExalt(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, )
	// {
		
	// }

	// public static void ComputeAnnul(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, )
	// {
		
	// }

	// public static void ComputeEssence(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, )
	// {
		
	// }

	public static void ComputePercentage(Crafting_Item baseItem, Crafting_Candidate candidate, ModifierEvent event, int ilvl)
	{
		// For prefixes
		if(event.modifier.type == ModifierType.PREFIX)
		{
			List<Modifier> PossiblePrefixes = baseItem.base.getNormalAllowedPrefixes();
			double TotalPrefixWeight = 0;
			TotalPrefixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossiblePrefixes, ilvl);
			candidate.percentage += event.tier.weight / TotalPrefixWeight;
		}

		// For suffixes
		if(event.modifier.type == ModifierType.SUFFIX)
		{
			List<Modifier> PossibleSuffixes = baseItem.base.getNormalAllowedSuffixes();
		
			int TotalSuffixWeight = 0;
			TotalSuffixWeight = baseItem.get_Base_Affixes_Total_Weight_By_Tier(PossibleSuffixes, ilvl);
			candidate.percentage += event.tier.weight / TotalSuffixWeight;
		}
	}




}
