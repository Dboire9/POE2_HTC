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

public class Probability {
	


	public static void CalculatingProbability(List<Crafting_Candidate> CompletedPaths, List<Modifier> desiredMod)
	{
		List<Crafting_Action> FinalPath = new ArrayList<>();

		for (Crafting_Candidate candidate : CompletedPaths) 
		{
			for (ModifierEvent event : candidate.modifierHistory) 
			{
				Crafting_Action action = event.source;

				//Not doing the transmutation

				// Not doing aug for now, want to see a 100% prob if it is possible
				if (action instanceof AugmentationOrb)
					continue;
				if(action instanceof RegalOrb)
					ComputeRegal(candidate, event, desiredMod, FinalPath);
				if(action instanceof ExaltedOrb)
					ComputeExalt(candidate, event, desiredMod, FinalPath);
				if(action instanceof AnnulmentOrb)
					ComputeAnnul(candidate, event, desiredMod, FinalPath);
				if(action instanceof Essence_currency)
					ComputeEssence(candidate, event, desiredMod, FinalPath);
			}
		}
	}

	public static void ComputeRegal(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, List<Crafting_Action> FinalPath)
	{

		// Check if it is a desired mod
		Modifier foundModifier = null;
		for (Modifier m : desiredMod) {
			if (m.equals(event.modifier)) { // or compare by ID, name, family, etc.
				foundModifier = m;
				break;
			}
		}
		// It is a desired mods (with the isinstance we retrieve the Crafting_action currency to potentially change it to Greater or Perfect)
		if(foundModifier != null && event.source instanceof RegalOrb regal)
		{
			// Top tiers are last in list and vice versa so we correct this
			int realtier = foundModifier.tiers.size() - foundModifier.chosenTier - 1;
			// We have found the modifier now we need to retrieve the ilvl and compute the percentage of having it with different currency and see if we could have applied an omen
			if(foundModifier.tiers.get(realtier).level < 35)
			{// Just apply the normal 
				regal.tier = Crafting_Action.CurrencyTier.BASE;
			}
			else if(foundModifier.tiers.get(realtier).level >= 35 && foundModifier.tiers.get(realtier).level < 50)
			{// Apply normal and greater
				regal.tier = Crafting_Action.CurrencyTier.GREATER;
			}
			else if(foundModifier.tiers.get(realtier).level <= 50)
			{// Apply all

			}
		}
	}

	public static void ComputeExalt(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, List<Crafting_Action> FinalPath)
	{
		
	}

	public static void ComputeAnnul(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, List<Crafting_Action> FinalPath)
	{
		
	}

	public static void ComputeEssence(Crafting_Candidate candidate, ModifierEvent event, List<Modifier> desiredMod, List<Crafting_Action> FinalPath)
	{
		
	}




}
