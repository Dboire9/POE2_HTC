package core.Crafting.Utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import core.Modifier_class.Modifier;

public class Heuristic_Util {
		public static int calculateAffixScore(List<Modifier> AffixCurrentMods, List<Modifier> desiredModTier, Map<String, Integer> CountDesiredModifierTags)
		{
			int score = 0;
			int matched_modifiers = 0;
			int affix_slots = 0;

			// Build a set of desired names for faster lookup
			Set<String> desiredModifierTexts = desiredModTier.stream()
					.map(t -> t.text) // Use the text field instead of name
					.collect(Collectors.toSet());

			List<Modifier> unmatchedMods = new ArrayList<>();

			// Comparing with text, so that the essences can match
			for (Modifier mod : AffixCurrentMods)
			{
				if (mod.is_desired_mod || desiredModifierTexts.contains(mod.text))
				{
					mod.is_desired_mod = true;
					matched_modifiers++;
				}
				else
					unmatchedMods.add(mod);
				affix_slots++;
			}

		
			// If matched modifiers are equal to the slots in the item, add score, so 6000 is the goal to reach(?)
			// We should need to check the tags also because of annuls (?)
			score += 1000 * matched_modifiers;
			if(matched_modifiers != affix_slots)
			{
				// We do not want to calculate tags of modifiers we know matched
				Map<String, Integer> CountModifierTags = CreateCountModifierTags(unmatchedMods);
				score += ScoringTags(CountDesiredModifierTags, CountModifierTags, affix_slots);
			}
		return score;
	}

	public static int ScoringTags(Map<String, Integer> CountDesiredModifierTags, Map<String, Integer> CountModifierTags, int affix_slots)
	{
		int score = 0;

		for (Map.Entry<String, Integer> entry : CountModifierTags.entrySet())
		{
			String tag = entry.getKey();
			int currentCount = entry.getValue();
		
			if (CountDesiredModifierTags.containsKey(tag)) {
				int desiredCount = CountDesiredModifierTags.get(tag);
		
				if (currentCount < desiredCount && currentCount > 0)
					// If current count is less than desired, but not 0, increase score significantly
					score += 250;
				else if (currentCount == desiredCount)
					score += 50;
				else if ((desiredCount - currentCount) > 1)
					//We allow for one tag more than what we want because of annuls
					score -= 500;
				else
					score -= 900;
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
