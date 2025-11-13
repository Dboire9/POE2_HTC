package core.Crafting.Utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import core.Modifier_class.Modifier;

/**
 * Utility class for heuristic calculations related to crafting modifiers.
 * This class provides methods to calculate scores for affixes and tags
 * based on desired modifiers and their properties.
 */
public class Heuristic_Util {

    /**
     * Calculates the score of affixes based on the current modifiers, desired modifiers, 
     * and the desired modifier tags.
     *
     * @param AffixCurrentMods The list of current modifiers on the item.
     * @param desiredModTier The list of desired modifiers with their tiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @return The calculated score for the affixes.
     */
    public static int calculateAffixScore(List<Modifier> AffixCurrentMods, List<Modifier> desiredModTier, Map<String, Integer> CountDesiredModifierTags) {
        int score = 0;
        int matched_modifiers = 0;
        int affix_slots = 0;

        // Build a set of desired names for faster lookup
        Set<String> desiredModifierTexts = desiredModTier.stream()
                .map(t -> t.text) // Use the text field instead of name
                .collect(Collectors.toSet());

        List<Modifier> unmatchedMods = new ArrayList<>();

        // Comparing with text, so that the essences can match
        for (Modifier mod : AffixCurrentMods) {
            if (mod.is_desired_mod || desiredModifierTexts.contains(mod.text)) {
                mod.is_desired_mod = true;
                matched_modifiers++;
            } else {
                unmatchedMods.add(mod);
            }
            affix_slots++;
        }

        // If matched modifiers are equal to the slots in the item, add score
        score += 1000 * matched_modifiers;
        if (matched_modifiers != affix_slots) {
            // We do not want to calculate tags of modifiers we know matched
            Map<String, Integer> CountModifierTags = CreateCountModifierTags(unmatchedMods);
            score += ScoringTags(CountDesiredModifierTags, CountModifierTags, affix_slots);
        }
        return score;
    }

    /**
     * Scores the tags of unmatched modifiers based on the desired tags.
     *
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param CountModifierTags A map of current modifier tags and their counts.
     * @param affix_slots The number of affix slots on the item.
     * @return The calculated score for the tags.
     */
    public static int ScoringTags(Map<String, Integer> CountDesiredModifierTags, Map<String, Integer> CountModifierTags, int affix_slots) {
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
                    score += 50;
                } else if ((desiredCount - currentCount) > 1) {
                    // We allow for one tag more than what we want because of annuls
                    score -= 500;
                } else {
                    score -= 900;
                }
            }
        }
        return score;
    }

    /**
     * Creates a map of tags and their counts from a list of modifiers.
     *
     * @param desiredMods The list of modifiers to extract tags from.
     * @return A map where the keys are tags and the values are their counts.
     */
    public static Map<String, Integer> CreateCountModifierTags(List<Modifier> desiredMods) {
        Map<String, Integer> CountDesiredModifierTags = new HashMap<>();

        for (Modifier mods : desiredMods) {
            for (String Modtags : mods.tags) {
                if (!Modtags.isEmpty()) {
                    CountDesiredModifierTags.put(Modtags, CountDesiredModifierTags.getOrDefault(Modtags, 0) + 1);
                }
            }
        }

        return CountDesiredModifierTags;
    }
}
