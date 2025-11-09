package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Currency.ExaltedOrb.Omen;
import core.Modifier_class.Modifier;

public class AugmentationOrb implements Crafting_Action {

	public Crafting_Action.CurrencyTier tier;


    @Override
    public Crafting_Action copy() {
        return new AugmentationOrb(this.tier);
    }

	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();
		
		for (Crafting_Candidate candidate : CandidateList)
		{
			CandidateListCopy.addAll(evaluateAffixeswithAug(all_Prefix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
			CandidateListCopy.addAll(evaluateAffixeswithAug(all_Suffix_Modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
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

	@Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }
}
