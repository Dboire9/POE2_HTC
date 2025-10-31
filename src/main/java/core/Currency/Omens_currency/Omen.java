package core.Currency.Omens_currency;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Modifier_class.*;


public class Omen implements Crafting_Action {

    protected String name;

    public String getName() { return name; }

    public static final List<Omen> All = new ArrayList<>();

	@Override
	public Crafting_Action copy() {
		try {
			return (Omen) this.getClass().getDeclaredConstructor().newInstance();
		} catch (Exception e) {
			throw new RuntimeException("Failed to copy Omen", e);
		}
	}

	static {
        // All.add(new OmenOfDesecratedAnnulment());
        // All.add(new OmenOfDextralAnnulment());
        // All.add(new OmenOfDextralCrystallisation());
        // All.add(new OmenOfDextralErasure());
        // All.add(new OmenOfDextralExaltation());
        // All.add(new OmenOfDextralNecromancy());
        // All.add(new OmenOfGreaterExaltation());
        All.add(new OmenOfHomogenisingCoronation());
        // All.add(new OmenOfHomogenisingExaltation());
        // All.add(new OmenOfSinistralAnnulment());
        // All.add(new OmenOfSinistralCrystallisation());
        // All.add(new OmenOfSinistralErasure());
        // All.add(new OmenOfSinistralExaltation());
        // All.add(new OmenOfSinistralNecromancy());
        // All.add(new OmenOfTheBlackblooded());
        // All.add(new OmenOfTheLiege());
        // All.add(new OmenOfTheSovereign());
    }

	@Override
	public List<Crafting_Candidate> apply(
		Crafting_Item item,
		List<Crafting_Candidate> CandidateList,
		List<Modifier> desiredMods,
		Map<String, Integer> CountDesiredModifierTags,
		Omen omen  // <-- include this!
	) {
		return CandidateList;
	}


	public List<Modifier> getHomogAffixes(Crafting_Item item, Crafting_Candidate candidate) {
		List<Modifier> AffixList = new ArrayList<>();
	
		List<Modifier> allAffixes = new ArrayList<>();
		allAffixes.addAll(item.base.getNormalAllowedPrefixes());
		allAffixes.addAll(item.base.getNormalAllowedSuffixes());
		List<Modifier> candidateAffixes = candidate.getAllCurrentModifiers();
	
		for (Modifier item_mod : allAffixes) {
			boolean added = false;
			for (Modifier candidate_mod : candidateAffixes) {
				for (String tag : item_mod.tags) {
					if (candidate_mod.tags.contains(tag) && candidate_mod.family != item_mod.family) {
						if (!AffixList.contains(item_mod)) {
							AffixList.add(item_mod);
						}
						added = true;
						break;
					}
				}
				if (added) break;
			}
		}
		return AffixList;
	}

}
