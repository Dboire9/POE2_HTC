package core.Crafting;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import core.Crafting.Crafting_Item.ItemRarity;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierSource;
import core.Modifier_class.Modifier.ModifierType;

/**
 * Interface representing crafting actions that can be applied to crafting items.
 */
public interface Crafting_Action {

    /**
     * Enum representing the tiers of currency used in crafting.
     */
    public enum CurrencyTier {
        BASE, GREATER, DES_CURRENCY, PERFECT
    }

    /**
     * Retrieves the available omens for this crafting action.
     *
     * @return An array of available omens.
     */
    Enum<?>[] getAvailableOmens();

    /**
     * Creates a copy of the current crafting action.
     *
     * @return A new instance of the crafting action.
     */
    Crafting_Action copy();

    /**
     * Applies the crafting action to a given item and generates a list of crafting candidates.
     *
     * @param item The crafting item to transform.
     * @param CandidateList The list of crafting candidates to update.
     * @param desiredMods The list of desired modifiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods The list of undesired modifiers.
     * @return A list of updated crafting candidates.
     */
    public List<Crafting_Candidate> apply(Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods);

    /**
     * Retrieves the name of the crafting action for display purposes.
     *
     * @return The name of the crafting action.
     */
    String getName();

    /**
     * Creates a list of modifiers, evaluates affixes, and updates the candidate list.
     *
     * @param modifiers The list of modifiers to apply.
     * @param item The crafting item to evaluate.
     * @param CandidateList The list of crafting candidates to update.
     * @param desiredMods The list of desired modifiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods The list of undesired modifiers.
     */
    default void CreateListAndEvaluateAffixes(List<Modifier> modifiers, Crafting_Item item, List<Crafting_Candidate> CandidateList, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
        Map<Crafting_Action, Double> actionMap = new HashMap<>();
        // Calculate probability: 1.0 / number of available modifiers (transmutation pattern)
        double probability = modifiers.isEmpty() ? 0.0 : 1.0 / modifiers.size();
        actionMap.put(this, probability);
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item, actionMap, undesiredMods);
        for (Crafting_Item items : Item_Evaluation) {
            double score = 0;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > 0) {
                Crafting_Candidate new_Candidate = Crafting_Candidate.AddCraftingCandidate(items, score, this);
                new_Candidate.rarity = ItemRarity.MAGIC;
                new_Candidate.modifierHistory.get(0).score = score;
                
                // Extract probability from last event and update candidate
                if (!items.modifierHistory.isEmpty() && probability > 0.0) {
                    new_Candidate.updateProbability(probability);
                }
                
                CandidateList.add(new_Candidate);
            }
        }
        Item_Evaluation.clear();
    }

    /**
     * Evaluates affixes with augmentation and generates a list of crafting candidates.
     *
     * @param modifiers The list of modifiers to apply.
     * @param item The crafting item to evaluate.
     * @param candidate The current crafting candidate.
     * @param desiredMods The list of desired modifiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods The list of undesired modifiers.
     * @return A list of updated crafting candidates.
     */
    default List<Crafting_Candidate> evaluateAffixeswithAug(List<Modifier> modifiers, Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
        boolean isPrefix = false;
        Map<Crafting_Action, Double> actionMap = new HashMap<>();
        // Calculate probability: 1.0 / number of compatible modifiers (augmentation pattern)
        double probability = (modifiers == null || modifiers.isEmpty()) ? 0.0 : 1.0 / modifiers.size();
        actionMap.put(this, probability);
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
        if (modifiers != null && modifiers.get(0).type == ModifierType.PREFIX)
            isPrefix = true;
        if ((isPrefix && candidate.currentPrefixes[0] != null) || (!isPrefix && candidate.currentSuffixes[0] != null))
            return CandidateListCopy;
        item = candidate.copy();
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item, actionMap, null);
        for (Crafting_Item items : Item_Evaluation) {
            double score = 0;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > candidate.score) {
                Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score);
                newCandidate.prev_score = candidate.score;
                newCandidate.actions.add(this);
                newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
                
                // Extract probability and update candidate
                if (probability > 0.0) {
                    newCandidate.updateProbability(probability);
                }
                
                CandidateListCopy.add(newCandidate);
            }
        }
        Item_Evaluation.clear();
        return CandidateListCopy;
    }

    /**
     * Evaluates affixes and generates a list of crafting candidates.
     *
     * @param modifiers The list of modifiers to apply.
     * @param item The crafting item to evaluate.
     * @param candidate The current crafting candidate.
     * @param desiredMods The list of desired modifiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods The list of undesired modifiers.
     * @return A list of updated crafting candidates.
     */
    default List<Crafting_Candidate> evaluateAffixes(List<Modifier> modifiers, Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
        int affixes = 0;
        List<Crafting_Item> Item_Evaluation = null;
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
        Map<Crafting_Action, Double> actionMap = new HashMap<>();
        
        // Calculate probability based on currency type and item state
        // NOTE: Use candidate to get current state, not item parameter (which is often empty/base state)
        double probability;
        if (this instanceof Essence_currency) {
            // Special handling for Essence_currency
            if (modifiers != null && !modifiers.isEmpty()) {
                Essence_currency essence = (Essence_currency) this;
                boolean hasOmen = essence.omen != null && essence.omen != Essence_currency.Omen.None;
                
                Modifier mod = modifiers.get(0);
                boolean isPrefix = mod.type == ModifierType.PREFIX;
                int prefixCount = candidate.getAllCurrentPrefixModifiers().size();
                int suffixCount = candidate.getAllCurrentSuffixModifiers().size();
                int essenceTypeCount = isPrefix ? prefixCount : suffixCount;
                int otherTypeCount = isPrefix ? suffixCount : prefixCount;
                int totalMods = prefixCount + suffixCount;
                
                if (essenceTypeCount < 3) {
                    // Case 1: Essence's type has empty slots
                    if (hasOmen) {
                        // With omen: Only replaces same type, probability = 1 / filled_slots_of_same_type
                        probability = essenceTypeCount > 0 ? 1.0 / essenceTypeCount : 1.0;
                    } else {
                        // Without omen: Can replace ANY modifier (prefix or suffix)
                        probability = totalMods > 0 ? 1.0 / totalMods : 1.0;
                    }
                } else if (otherTypeCount < 3) {
                    // Case 2: Essence's type is FULL but other type has empty slots
                    // Must remove from its own type only (omen doesn't matter here)
                    probability = 1.0 / essenceTypeCount; // 1/3 typically
                } else {
                    // Case 3: ALL slots full (3 prefixes + 3 suffixes)
                    // Randomly removes one modifier of the same type (omen doesn't matter here)
                    probability = 1.0 / essenceTypeCount; // 1/3
                }
            } else {
                probability = 0.0;
            }
        } else {
            // For Exalted, Regal, Desecrated: probability = empty_slots / available_mods
            int emptyPrefixes = 3 - item.getAllCurrentPrefixModifiers().size();
            int emptySuffixes = 3 - item.getAllCurrentSuffixModifiers().size();
            int totalEmptySlots = emptyPrefixes + emptySuffixes;
            probability = (modifiers == null || modifiers.isEmpty() || totalEmptySlots == 0) ? 0.0 : (double) totalEmptySlots / modifiers.size();
        }
        actionMap.put(this, probability);
        item = candidate.copy();

        if (this instanceof Essence_currency)
            Item_Evaluation = item.addPerfectEssenceAffixes(modifiers, item, actionMap, desiredMods);
        else
            Item_Evaluation = item.addAffixes(modifiers, item, actionMap, undesiredMods);
        for (Crafting_Item items : Item_Evaluation) {
            affixes = items.getAllCurrentPrefixModifiers().size() + items.getAllCurrentSuffixModifiers().size();
            double score = 0;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > candidate.score) {
                // Dynamic score threshold: require ~70% of expected score (affixes × 700)
                // This approximates the original hardcoded thresholds (1900/2900/3900/4900)
                int minRequiredScore = affixes * 700;
                if (score < minRequiredScore) {
                    continue;
                }
                Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score);
                newCandidate.prev_score = candidate.score;
                newCandidate.actions.add(this);
                newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
                newCandidate.rarity = ItemRarity.RARE;
                
                // Extract probability and update candidate
                if (probability > 0.0) {
                    newCandidate.updateProbability(probability);
                }
                
                if (this instanceof Desecrated_currency)
                    newCandidate.desecrated = true;
                CandidateListCopy.add(newCandidate);
            }
        }
        Item_Evaluation.clear();
        return CandidateListCopy;
    }

    /**
     * Evaluates affixes with annulment and generates a list of crafting candidates.
     *
     * @param item The crafting item to evaluate.
     * @param candidate The current crafting candidate.
     * @param desiredMods The list of desired modifiers.
     * @param CountDesiredModifierTags A map of desired modifier tags and their counts.
     * @param undesiredMods The list of undesired modifiers.
     * @return A list of updated crafting candidates.
     */
    default List<Crafting_Candidate> evaluateAffixeswithAnnul(Crafting_Item item, Crafting_Candidate candidate, List<Modifier> desiredMods, Map<String, Integer> CountDesiredModifierTags, List<Modifier> undesiredMods) {
        List<Crafting_Candidate> CandidateListCopy = new ArrayList<>();
        item = candidate.copy();
        int affixes = item.getAllCurrentPrefixModifiers().size() + item.getAllCurrentSuffixModifiers().size() - 1;
        Map<Crafting_Action, Double> actionMap = new HashMap<>();
        // Calculate probability: 1.0 / total current modifiers (annulment removes one random mod)
        int totalMods = item.getAllCurrentPrefixModifiers().size() + item.getAllCurrentSuffixModifiers().size();
        double probability = totalMods > 0 ? 1.0 / totalMods : 0.0;
        actionMap.put(this, probability);
        List<Crafting_Item> Item_Evaluation = item.removeAffixes(item, actionMap);
        for (Crafting_Item items : Item_Evaluation) {
            double score = 60;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > candidate.score) {
                // Dynamic score threshold: require ~70% of expected score (affixes × 700)
                // This approximates the original hardcoded thresholds (1900/2900/3900/4900)
                int minRequiredScore = affixes * 700;
                if (score < minRequiredScore) {
                    continue;
                }
                Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score);
                newCandidate.prev_score = candidate.score;
                newCandidate.actions.add(this);
                newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
                newCandidate.rarity = ItemRarity.RARE;
                
                // Extract probability and update candidate
                if (probability > 0.0) {
                    newCandidate.updateProbability(probability);
                }
                
                if (newCandidate.modifierHistory.get(item.modifierHistory.size()).modifier.source == ModifierSource.DESECRATED)
                    newCandidate.desecrated = false;
                CandidateListCopy.add(newCandidate);
            }
        }
        Item_Evaluation.clear();
        return CandidateListCopy;
    }

    /**
     * Calculates the step probability for evaluate methods based on currency type and item state.
     * Used by ExaltedOrb, RegalOrb, Desecrated_currency, and Essence_currency.
     *
     * @param modifiers The list of modifiers being applied
     * @param item The crafting item
     * @param candidate The current crafting candidate
     * @return The probability of this step (0.0 to 1.0)
     */
    default double calculateEvaluateProbability(List<Modifier> modifiers, Crafting_Item item, Crafting_Candidate candidate) {
        if (modifiers == null || modifiers.isEmpty()) {
            return 0.0;
        }

        // For Essence_currency: Perfect Essence with omen has complex probability
        if (this instanceof Essence_currency) {
            // Perfect Essence ADD (empty slot): 100%
            // Perfect Essence REPLACE + Omen: depends on filled slots
            // Check if we're adding to empty slot or replacing
            Modifier mod = modifiers.get(0);
            boolean isPrefix = mod.type == ModifierType.PREFIX;
            int currentCount = isPrefix ? 
                item.getAllCurrentPrefixModifiers().size() : 
                item.getAllCurrentSuffixModifiers().size();
            
            if (currentCount < 3) {
                // Adding to empty slot: 100% success
                return 1.0;
            } else {
                // Replacing with omen: probability = 1 / filled_slots
                // 3 filled → 0.3333 (1/3), 2 filled → 0.5 (1/2), 1 filled → 1.0 (1/1)
                return 1.0 / currentCount;
            }
        }
        
        // For ExaltedOrb, RegalOrb, Desecrated_currency: probability = empty_slots / available_mods
        int emptyPrefixes = 3 - item.getAllCurrentPrefixModifiers().size();
        int emptySuffixes = 3 - item.getAllCurrentSuffixModifiers().size();
        int totalEmptySlots = emptyPrefixes + emptySuffixes;
        
        if (totalEmptySlots == 0) {
            return 0.0;
        }
        
        // Probability = empty_slots / total_available_mods
        return (double) totalEmptySlots / modifiers.size();
    }
}
