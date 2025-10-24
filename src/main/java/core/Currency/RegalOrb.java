package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.ModType;
import core.Currency.Omens_currency.Omen;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Modifier_class.*;

public class RegalOrb implements Crafting_Action {
	
	public CurrencyTier tier;
	public List<Omen> Omens = new ArrayList<>();

	@Override
    public Crafting_Action copy() {
        return new RegalOrb(this.tier);
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, List<ModifierTier> desiredModTiers, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		
		
		
		List<Modifier> all_Prefix_modifiers = item.base.getNormalAllowedPrefixes();
		List<Modifier> all_Suffix_Modifiers = item.base.getNormalAllowedSuffixes();

		for (Crafting_Candidate candidate : CandidateList)
		{
			CandidateListCopy.add(evaluateAffixes(all_Prefix_modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, new_omen));
			CandidateListCopy.add(evaluateAffixes(all_Suffix_Modifiers, item, candidate, desiredMods, desiredModTiers, CountDesiredModifierTags, new_omen));
		}
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public RegalOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public RegalOrb() {
		this.tier = CurrencyTier.BASE;
	}

	public RegalOrb(Omen new_omen) {
		this.Omens.add(new_omen);
	}

	@Override
	public String getName() {
		return "Regal Orb (" + tier + ")";
	}
}
