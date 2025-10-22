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
		List<Crafting_Item> Item_Evaluation;

		// We retrieve all the modifiers 
		List<Modifier> all_Prefix_modifiers = base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = base.getNormalAllowedSuffixes();
		
		int score = 0;

		Item_Evaluation = item.addAffixes(all_Prefix_modifiers, item, CurrencyTier.BASE);
		for(Crafting_Item items: Item_Evaluation)
		{
			score = Crafting_Algorithm.heuristic(items, desiredMods, desiredModTiers, CountDesiredModifierTags);
			if(score > 0)
			{
				// Do a function to add to candidate
			}

		}
		
		Item_Evaluation.clear();
		Item_Evaluation = item.addAffixes(all_Suffix_Modifiers, item, CurrencyTier.BASE);
		
		Item_Evaluation.clear();
		Item_Evaluation = item.addAffixes(all_Prefix_modifiers, item, CurrencyTier.GREATER);
		
		Item_Evaluation.clear();
		Item_Evaluation = item.addAffixes(all_Suffix_Modifiers, item, CurrencyTier.GREATER);

		Item_Evaluation = item.addAffixes(all_Prefix_modifiers, item, CurrencyTier.PERFECT);
		
		Item_Evaluation.clear();
		Item_Evaluation = item.addAffixes(all_Suffix_Modifiers, item, CurrencyTier.PERFECT);

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
