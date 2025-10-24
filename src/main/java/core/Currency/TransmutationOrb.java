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

    private int cost = 1;

	public Crafting_Action.CurrencyTier tier;

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

        Item_base base = item.base;
		//Crating a list of the item we will applyt the modifiers on 
		List<Crafting_Item> Item_Evaluation;


		


		// We retrieve all the modifiers for all the currency tier


		List<Modifier> all_Prefix_modifiers = base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = base.getNormalAllowedSuffixes();
		
		evaluateAffixes(all_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		evaluateAffixes(all_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);


		List<Modifier> all_Greater_Prefix_modifiers = base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Prefix_modifiers);
		List<Modifier> all_Greater_Suffix_Modifiers = base.getNormalTierAllowedAffixes(CurrencyTier.GREATER, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.GREATER;
		evaluateAffixes(all_Greater_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		evaluateAffixes(all_Greater_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);


		List<Modifier> all_Perfect_Prefix_modifiers = base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Prefix_modifiers);
		List<Modifier> all_Perfect_Suffix_Modifiers = base.getNormalTierAllowedAffixes(CurrencyTier.PERFECT, all_Suffix_Modifiers);
		
		this.tier = CurrencyTier.PERFECT;
		evaluateAffixes(all_Perfect_Prefix_modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);
		evaluateAffixes(all_Perfect_Suffix_Modifiers, item, CandidateList, desiredMods, desiredModTiers, CountDesiredModifierTags);

		// Convert item to MAGIC
		item.rarity = Crafting_Item.ItemRarity.MAGIC;
		
        return CandidateList;
    }




    @Override
    public int getCost() {
        return cost;
    }

    @Override
    public String getName() {
        return "Orb of Transmutation (" + tier + ")";
    }
}
