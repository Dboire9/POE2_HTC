package core.Currency;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ItemRarity;
import core.Crafting.Crafting_Item.ModType;
import core.Currency.Omens_currency.Omen;
import core.Items.Item_base;
import core.Modifier_class.*;
import core.Utils.AddRandomMod;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class Desecrated_currency implements Crafting_Action{

	public enum SlotType {
		PREFIX, SUFFIX
	}

	public enum guaranteedDesecratedModifier {
		KURGAL, AMANAMU, ULAMAN, ANY
	}

	public guaranteedDesecratedModifier guaranteed_des_mod = guaranteedDesecratedModifier.ANY;

	public CurrencyTier tier;
	public List<Omen> Omens = new ArrayList<>();

	@Override
    public Crafting_Action copy() {
        return new Desecrated_currency(this.tier);
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		
		
		
		// List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		// List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();

		// for (Crafting_Candidate candidate : CandidateList)
		// {
		// 	CandidateListCopy.add(evaluateAffixes(all_Prefix_modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, new_omen));
		// 	CandidateListCopy.add(evaluateAffixes(all_Suffix_Modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, new_omen));
		// }
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public Desecrated_currency(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public Desecrated_currency() {
		this.tier = CurrencyTier.BASE;
	}

	public Desecrated_currency(Omen new_omen) {
		this.Omens.add(new_omen);
	}

	@Override
	public String getName() {
		return "Regal Orb (" + tier + ")";
	}
}
