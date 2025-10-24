package core.Items;

import core.Modifier_class.*;
import core.Crafting.Crafting_Action.*; // Importing CurrencyTier class

import java.util.ArrayList;
import java.util.List;

public class Item_base {
    protected List<Modifier> Normal_allowedPrefixes;
    protected List<Modifier> Normal_allowedSuffixes;
    protected List<Modifier> Desecrated_allowedPrefixes;
    protected List<Modifier> Desecrated_allowedSuffixes;
    protected List<Modifier> Essences_allowedPrefixes;
    protected List<Modifier> Essences_allowedSuffixes;


	public List<Modifier> getNormalAllowedPrefixes() {
		return Normal_allowedPrefixes;
	}

	// Getting the modifiers based on the currency Tier
	public List<Modifier> getNormalTierAllowedAffixes(CurrencyTier tier, List<Modifier> AllowedAffixesMods) {
		List<Modifier> newList = new ArrayList<>();
		for(Modifier mods : AllowedAffixesMods)
		{
			List<ModifierTier> newTierList = new ArrayList<>();
			for(ModifierTier modstiers : mods.tiers)
			{
				switch(tier) {
					case BASE:
						return AllowedAffixesMods;
					case GREATER:
					{
						if(modstiers.level >= 35)
							newTierList.add(modstiers);
						break;
					}
					case PERFECT:
					{
						if(modstiers.level >= 50)
							newTierList.add(modstiers);
						break;
					}
				}
			}
			if(!newTierList.isEmpty())
			{
				Modifier newmod = new Modifier(mods, true); // Copy without tiers
				newmod.tiers = newTierList;
				newList.add(newmod); // Add new modifier to the list
			}
		}

		return newList;
	}
	
	public List<Modifier> getNormalAllowedSuffixes() {
		return Normal_allowedSuffixes;
	}

	// Getting the modifiers based on the currency Tier
	public List<Modifier> getNormalTierAllowedSuffixes(CurrencyTier tier) {
		List<Modifier> newList = new ArrayList<>();
		for(Modifier mods : getNormalAllowedSuffixes())
		{
			List<ModifierTier> newTierList = new ArrayList<>();
			for(ModifierTier modstiers : mods.tiers)
			{
				switch(tier) {
					case BASE:
						return getNormalAllowedSuffixes();
					case GREATER:
					{
						if(mods.tiers.size() >= 35)
							newTierList.add(modstiers);
						break;
					}
					case PERFECT:
					{
						if(mods.tiers.size() >= 50)
							newTierList.add(modstiers);
						break;
					}
				}
			}
			if(!newTierList.isEmpty())
			{
				Modifier newmod = new Modifier(mods, true); // Copy without tiers
				newmod.tiers = newTierList;
				newList.add(newmod); // Add new modifier to the list
			}
		}

		return newList;
	}

	
	public List<Modifier> getDesecratedAllowedPrefixes() {
		return Desecrated_allowedPrefixes;
	}
	
	public List<Modifier> getDesecratedAllowedSuffixes() {
		return Desecrated_allowedSuffixes;
	}
	
	public List<Modifier> getEssencesAllowedPrefixes() {
		return Essences_allowedPrefixes;
	}
	
	public List<Modifier> getEssencesAllowedSuffixes() {
		return Essences_allowedSuffixes;
	}
}