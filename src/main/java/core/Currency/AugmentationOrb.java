package core.Currency;

import core.Crafting.Crafting_Item;

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

    public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();
		

		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));
		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));


		List<Modifier> all_Greater_Prefix_modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Prefix_modifiers);
		List<Modifier> all_Greater_Suffix_Modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.GREATER;
		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Greater_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));
		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Greater_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));


		List<Modifier> all_Perfect_Prefix_modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Prefix_modifiers);
		List<Modifier> all_Perfect_Suffix_Modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.PERFECT;
		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Perfect_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));
		CandidateListCopy.addAll(evaluateAffixesFromPreviousOnes(all_Perfect_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags));

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
