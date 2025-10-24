package core.Currency;

import java.util.*;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Algorithm;
import core.Crafting.Crafting_Candidate;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;
import core.Crafting.Crafting_Action.CurrencyTier;

public class TransmutationOrb implements Crafting_Action {

	public Crafting_Action.CurrencyTier tier;


	@Override
    public Crafting_Action copy() {
        return new TransmutationOrb(this.tier);
    }


    // Constructor to specify tier
    public TransmutationOrb(CurrencyTier tier) {
        this.tier = tier;
    }

	public TransmutationOrb() {
        this.tier = CurrencyTier.BASE;
    }

    @Override
    public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags) {
        // Only works on NORMAL items
        if (item.rarity != Crafting_Item.ItemRarity.NORMAL || item.isFull()) return CandidateList;

		// We retrieve all the modifiers for all the currency tier


		List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();
		
		CreateListAndEvaluateAffixes(all_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		CreateListAndEvaluateAffixes(all_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);


		List<Modifier> all_Greater_Prefix_modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Prefix_modifiers);
		List<Modifier> all_Greater_Suffix_Modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.GREATER;
		CreateListAndEvaluateAffixes(all_Greater_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		CreateListAndEvaluateAffixes(all_Greater_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);


		List<Modifier> all_Perfect_Prefix_modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Prefix_modifiers);
		List<Modifier> all_Perfect_Suffix_Modifiers = item.base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.PERFECT;
		CreateListAndEvaluateAffixes(all_Perfect_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		CreateListAndEvaluateAffixes(all_Perfect_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);

		// Convert item to MAGIC
		item.rarity = Crafting_Item.ItemRarity.MAGIC;
		
        return CandidateList;
    }


    @Override
    public String getName() {
        return "Orb of Transmutation (" + tier + ")";
    }
}
