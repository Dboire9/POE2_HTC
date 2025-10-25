package core.Crafting.Utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import core.Modifier_class.*;

public class Heuristic_Util {
		public static int calculateAffixScore(List<Modifier> AffixCurrentMods, List<ModifierTier> desiredModTier, Map<String, Integer> CountDesiredModifierTags) {
		int score = 0;
		int matched_modifiers = 0;
		int affix_slots = 0;

		// Build a set of desired tier names for faster lookup
		Set<String> desiredTierNames = desiredModTier.stream()
				.map(t -> t.name)
				.collect(Collectors.toSet());

		for (Modifier mod : AffixCurrentMods) {
			for (ModifierTier tier : mod.tiers) {
				if (desiredTierNames.contains(tier.name)) {
					matched_modifiers++;
					break; // stop after the first match
				}
			}
			affix_slots++;
		}

		// you can compute score here however you want
		score = matched_modifiers * 100 / (affix_slots == 0 ? 1 : affix_slots);
		
		Map<String, Integer> CountModifierTags = CreateCountModifierTags(AffixCurrentMods);

		score += ScoringTags(CountDesiredModifierTags, CountModifierTags);
	
		// If matched modifiers are equal to the slots in the item, add score, so 6000 is the goal to reach
		if (matched_modifiers == affix_slots) {
			score += 1000 * matched_modifiers;
		}
	
		return score;
	}

	public static int ScoringTags(Map<String, Integer> CountDesiredModifierTags, Map<String, Integer> CountModifierTags)
	{
		int score = 0;

		for (Map.Entry<String, Integer> entry : CountModifierTags.entrySet()) {
			String tag = entry.getKey();
			int currentCount = entry.getValue();
		
			if (CountDesiredModifierTags.containsKey(tag)) {
				int desiredCount = CountDesiredModifierTags.get(tag);
		
				if (currentCount < desiredCount && currentCount > 0) {
					// If current count is less than desired, but not 0, increase score significantly
					score += 250;
				} else if (currentCount == desiredCount) {
					// If current count matches desired count, increase score slightly
					score += 100;
				} else {
					// If current count is more than desired, decrease score significantly
					score -= 500;
				}
			}
		}
		return score;
	}

	// Getting all the tags of all the modifiers, and counting how many of them there are
	public static Map<String, Integer> CreateCountModifierTags (List<Modifier> desiredMods)
	{
		Map<String, Integer> CountDesiredModifierTags = new HashMap<>();

		for(Modifier mods : desiredMods)
			for(String Modtags : mods.tags)
				if (!Modtags.isEmpty())
					CountDesiredModifierTags.put(Modtags, CountDesiredModifierTags.getOrDefault(Modtags, 0) + 1);

		return CountDesiredModifierTags;
	}
}
