package core.Currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Currency.Omens_currency.Omen;
import core.Currency.Omens_currency.OmenOfHomogenisingExaltation;
import core.Modifier_class.Modifier;

public class ExaltedOrb implements Crafting_Action {

	public CurrencyTier tier;
	public List<Omen> Omens = new ArrayList<>();

	@Override
    public Crafting_Action copy() {
        return new ExaltedOrb(this.tier);
    }

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, Omen new_omen)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Affix_modifiers = new ArrayList<>();
		
		all_Affix_modifiers.addAll(item.base.getNormalAllowedPrefixes());
		all_Affix_modifiers.addAll(item.base.getNormalAllowedSuffixes());

		for (Crafting_Candidate candidate : CandidateList)
			CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, new_omen));
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public ExaltedOrb(CurrencyTier tier) {
		this.tier = tier;
	}

	// Default constructor
	public ExaltedOrb() {
		this.tier = CurrencyTier.BASE;
	}

	public ExaltedOrb(Omen new_omen) {
		this.Omens.add(new_omen);
	}

	@Override
	public String getName() {
		return "Exalted Orb (" + tier + ")";
	}
}
