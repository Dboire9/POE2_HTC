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
        actionMap.put(this, 0.0);
        List<Crafting_Item> Item_Evaluation = item.addAffixes(modifiers, item, actionMap, undesiredMods);
        for (Crafting_Item items : Item_Evaluation) {
            double score = 0;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > 0) {
                Crafting_Candidate new_Candidate = Crafting_Candidate.AddCraftingCandidate(items, score, this);
                new_Candidate.rarity = ItemRarity.MAGIC;
                new_Candidate.modifierHistory.get(0).score = score;
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
        actionMap.put(this, 0.0);
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
        actionMap.put(this, 0.0);
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
                boolean passedThreshold = true;
                String thresholdReason = "";
                
                switch (affixes) {
                    case 3:
                        if (score < 2100) {
                            passedThreshold = false;
                            thresholdReason = "score " + score + " < 2100 for 3 affixes";
                            continue;
                        }
                        break;
                    case 4:
                        if (score < 3100) {
                            passedThreshold = false;
                            thresholdReason = "score " + score + " < 3100 for 4 affixes";
                            continue;
                        }
                        break;
                    case 5:
                        if (score < 4100) {
                            passedThreshold = false;
                            thresholdReason = "score " + score + " < 4100 for 5 affixes";
                            continue;
                        }
                        break;
                    case 6:
                        if (score < 5100) {
                            passedThreshold = false;
                            thresholdReason = "score " + score + " < 5100 for 6 affixes";
                            continue;
                        }
                }
                
                if (passedThreshold) {
                    core.DebugLogger.trace("[Action] ✓ Passed threshold - affixes: " + affixes + ", score: " + score);
                } else {
                    core.DebugLogger.trace("[Action] ✗ Failed threshold - " + thresholdReason);
                }
                
                Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score);
                newCandidate.prev_score = candidate.score;
                newCandidate.actions.add(this);
                newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
                newCandidate.rarity = ItemRarity.RARE;
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
        actionMap.put(this, 0.0);
        List<Crafting_Item> Item_Evaluation = item.removeAffixes(item, actionMap);
        for (Crafting_Item items : Item_Evaluation) {
            double score = 60;
            score += Crafting_Algorithm.heuristic(items, desiredMods, CountDesiredModifierTags, undesiredMods);
            if (score > candidate.score) {
                switch (affixes) {
                    case 3:
                        if (score < 2100)
                            continue;
                        break;
                    case 4:
                        if (score < 3100)
                            continue;
                        break;
                    case 5:
                        if (score < 4100)
                            continue;
                        break;
                    case 6:
                        if (score < 5100)
                            continue;
                }
                Crafting_Candidate newCandidate = candidate.NewStep(candidate, items, score);
                newCandidate.prev_score = candidate.score;
                newCandidate.actions.add(this);
                newCandidate.modifierHistory.get(item.modifierHistory.size()).score = score;
                newCandidate.rarity = ItemRarity.RARE;
                if (newCandidate.modifierHistory.get(item.modifierHistory.size()).modifier.source == ModifierSource.DESECRATED)
                    newCandidate.desecrated = false;
                CandidateListCopy.add(newCandidate);
            }
        }
        Item_Evaluation.clear();
        return CandidateListCopy;
    }
}
