package core.Crafting.Utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import core.Modifier_class.*;

public class Heuristic_Util {
		public static int calculateAffixScore(List<Modifier> AffixCurrentMods, List<ModifierTier> desiredModTier, Map<String, Integer> CountDesiredModifierTags) {
		int score = 0;
		int matched_modifiers = 0;
		int affix_slots = 0;
	
		// Checking the prefix modifiers
		for (Modifier mods : AffixCurrentMods) {
			boolean matched = false;
			for (ModifierTier currentTier : mods.tiers) {
				for (ModifierTier desiredTier : desiredModTier) {
					// If the family is the same and the tier is the same or above
					if (currentTier.name.equals(desiredTier.name) &&
						currentTier.level >= desiredTier.level) {
						matched = true;
						matched_modifiers++;
						break;
					}
				}
				// If it is a match, break to move on
				if (matched) break;
			}
			affix_slots++;
		}

		Map<String, Integer> CountModifierTags = CreateCountModifierTags(AffixCurrentMods);

		score += ScoringTags(CountDesiredModifierTags, CountModifierTags);
	
		// If matched modifiers are equal to the slots in the item, add score, so 6000 is the goal to reach
		if (matched_modifiers == affix_slots) {
			score += 1000 * matched_modifiers;
		}
		// Multiplicative point loss for the number of prefix slots and non-matched modifiers
		else if (matched_modifiers < affix_slots) {
			score -= 1000 * (3 - affix_slots);
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
					score += 500;
				} else if (currentCount == desiredCount) {
					// If current count matches desired count, increase score slightly
					score += 250;
				} else {
					// If current count is more than desired, decrease score significantly
					score -= 1000;
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
