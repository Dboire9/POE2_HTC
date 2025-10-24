package core.Currency;

import core.Crafting.Crafting_Item;
import core.Currency.Omens_currency.Omen;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Modifier_class.Modifier.ModifierType;
import core.Utils.AddRandomMod;

public class AugmentationOrb implements Crafting_Action {

	public Crafting_Action.CurrencyTier tier;


    @Override
    public Crafting_Action copy() {
        return new AugmentationOrb(this.tier);
    }

	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();
		
		for (Crafting_Candidate candidate : CandidateList)
		{
			CandidateListCopy.add(evaluateAffixeswithAug(all_Prefix_modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags));
			CandidateListCopy.add(evaluateAffixeswithAug(all_Suffix_Modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags));
		}

		// Convert item to MAGIC
		item.rarity = Crafting_Item.ItemRarity.MAGIC;
		
        return CandidateListCopy;
    }


    // Constructor to specify tier
    public AugmentationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

	// Default constructor
	public AugmentationOrb() {
		this.tier = CurrencyTier.BASE;
	}

    @Override
    public String getName() {
        return "Orb of Augmentation (" + tier + ")";
    }
}
