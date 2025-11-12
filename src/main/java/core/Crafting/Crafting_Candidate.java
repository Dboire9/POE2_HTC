package core.Crafting;

import java.util.ArrayList;
import java.util.List;

import core.Crafting.Utils.ModifierEvent;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;

/**
 * The `Crafting_Candidate` class represents a crafting candidate, which is used to
 * score the actions performed on an item and retain the history of those actions.
 * It extends the `Crafting_Item` class and adds additional functionality specific
 * to crafting candidates.
 */
public class Crafting_Candidate extends Crafting_Item {
    /**
     * List of crafting actions performed on this candidate.
     */
    public List<Crafting_Action> actions = new ArrayList<>();

    /**
     * The percentage score associated with this crafting candidate.
     */
    public double percentage;

    /**
     * A flag indicating whether annulment should be stopped for this candidate.
     */
    public boolean stopAnnul = false;

    /**
     * Default constructor for `Crafting_Candidate`.
     */
    public Crafting_Candidate() {}

    /**
     * Creates a deep copy of the current `Crafting_Candidate` instance.
     * This includes copying inherited fields from `Crafting_Item` and
     * deep copying lists such as `actions` and `modifierHistory`.
     *
     * @return A new `Crafting_Candidate` instance that is a deep copy of the current instance.
     */
    @Override
    public Crafting_Candidate copy() {
        // Call the copy method from the parent class to handle deep copying of inherited fields
        Crafting_Item baseClone = super.copy();

        // Create a new Crafting_Candidate instance and cast the baseClone
        Crafting_Candidate copy = new Crafting_Candidate();
        copy.base = baseClone.base;
        copy.rarity = baseClone.rarity;
        copy.desecrated = baseClone.desecrated;

        // Deep copy current prefixes and suffixes
        for (int i = 0; i < currentPrefixes.length; i++) {
            if (this.currentPrefixes[i] != null) {
                copy.currentPrefixes[i] = new Modifier(this.currentPrefixes[i]);
            }
            if (this.currentPrefixTiers[i] != null) {
                copy.currentPrefixTiers[i] = new ModifierTier(this.currentPrefixTiers[i]);
            }
            if (this.currentSuffixes[i] != null) {
                copy.currentSuffixes[i] = new Modifier(this.currentSuffixes[i]);
            }
            if (this.currentSuffixTiers[i] != null) {
                copy.currentSuffixTiers[i] = new ModifierTier(this.currentSuffixTiers[i]);
            }
        }

        // Copy Crafting_Candidate-specific fields
        copy.score = this.score;
        copy.prev_score = this.prev_score;
        copy.percentage = this.percentage;

        // Deep copy actions
        copy.actions = new ArrayList<>();
        for (Crafting_Action action : this.actions) {
            copy.actions.add(action.copy());
        }

        // Deep copy modifier history
        copy.modifierHistory = new ArrayList<>();
        for (ModifierEvent history : this.modifierHistory) {
            copy.modifierHistory.add(history.copy());
        }

        return copy;
    }

    /**
     * Constructs a new `Crafting_Candidate` with the given item, score, and action.
     *
     * @param new_item The crafting item to base this candidate on.
     * @param score The score associated with this candidate.
     * @param actions The crafting action to associate with this candidate.
     */
    public Crafting_Candidate(Crafting_Item new_item, double score, Crafting_Action actions) {
        super(new_item.base);
        this.score = score;
        this.actions.add(actions);
        this.currentPrefixes = new_item.currentPrefixes;
        this.currentPrefixTiers = new_item.currentPrefixTiers;
        this.currentSuffixes = new_item.currentSuffixes;
        this.currentSuffixTiers = new_item.currentSuffixTiers;
        this.rarity = new_item.rarity;
        this.modifierHistory = new_item.modifierHistory;
    }

    /**
     * Creates and returns a new `Crafting_Candidate` based on the given item, score, and action.
     *
     * @param item The crafting item to base the new candidate on.
     * @param score The score associated with the new candidate.
     * @param action The crafting action to associate with the new candidate.
     * @return A new `Crafting_Candidate` instance.
     */
    public static Crafting_Candidate AddCraftingCandidate(Crafting_Item item, double score, Crafting_Action action) {
        Crafting_Candidate new_Crafting_Candidate = new Crafting_Candidate(item, score, action);
        return new_Crafting_Candidate;
    }

    /**
     * Creates a new crafting step by copying the given `Crafting_Item` and updating its score.
     *
     * @param oldCraftingCandidate The previous crafting candidate.
     * @param new_item The new crafting item to base the step on.
     * @param score The score associated with the new step.
     * @return A new `Crafting_Candidate` instance representing the new step.
     */
    public Crafting_Candidate NewStep(Crafting_Candidate oldCraftingCandidate, Crafting_Item new_item, double score) {
        Crafting_Candidate new_Crafting_Candidate = (Crafting_Candidate) new_item.copy();
        new_Crafting_Candidate.score = score;
        new_Crafting_Candidate.currentPrefixes = new_item.currentPrefixes.clone();
        new_Crafting_Candidate.currentPrefixTiers = new_item.currentPrefixTiers.clone();
        new_Crafting_Candidate.currentSuffixes = new_item.currentSuffixes.clone();
        new_Crafting_Candidate.currentSuffixTiers = new_item.currentSuffixTiers.clone();
        return new_Crafting_Candidate;
    }
}