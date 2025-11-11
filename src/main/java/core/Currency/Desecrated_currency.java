package core.Currency;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Modifier_class.Modifier;

public class Desecrated_currency implements Crafting_Action{


	@Override
    public Crafting_Action copy() {
        return new Desecrated_currency();
    }

	public Set<Omen> omens;
	public enum Omen
	{
		// Not doing None Omen (is there a point ?, in here we just handle the true desecrated modifiers)
		OmenofDextralNecromancy,
		OmenofSinistralNecromancy,
		OmenoftheBlackblooded,
		OmenoftheLiege,
		OmenoftheSovereign
		// Not putting greater exaltation for now
	};

	public Desecrated_currency(Omen omen) {
		if(this.omens == null)
			this.omens = new HashSet<>();
        this.omens.add(omen);
	}

	public void addOmen(Omen omen) {
		// If we are adding Sinistral, remove Dextral if present
		if (omen == Omen.OmenofSinistralNecromancy && omens.contains(Omen.OmenofDextralNecromancy))
			omens.remove(Omen.OmenofDextralNecromancy);
	
		// If we are adding Dextral, remove Sinistral if present
		if (omen == Omen.OmenofDextralNecromancy && omens.contains(Omen.OmenofSinistralNecromancy))
			omens.remove(Omen.OmenofSinistralNecromancy);
	
		// Finally, add the new omen
		omens.add(omen);
	}

	@Override
	public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods)
	{
		List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();

		List<Modifier> all_Affix_modifiers = new ArrayList<>();
		
		all_Affix_modifiers.addAll(item.base.getDesecratedAllowedPrefixes());
		all_Affix_modifiers.addAll(item.base.getDesecratedAllowedSuffixes());

		for (Crafting_Candidate candidate : CandidateList)
		{
			// As we cannot have two desecrated mods
			if(candidate.desecrated == false)
				CandidateListCopy.addAll(evaluateAffixes(all_Affix_modifiers, item, candidate, desiredMods, CountDesiredModifierTags, undesiredMods));
		}
        return CandidateListCopy;
	}


	// Constructor to specify tier
	public Desecrated_currency()
	{
		this.omens = new HashSet<>();
	};

	@Override
	public String getName() {
		return "Desecrated Currency";
	}

	@Override
    public Enum<?>[] getAvailableOmens() {
        return Omen.values();
    }
}
