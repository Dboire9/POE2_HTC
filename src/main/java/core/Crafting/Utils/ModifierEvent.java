package core.Crafting.Utils;

import core.Modifier_class.*;
import core.Crafting.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents an event related to a modifier during crafting.
 * This class tracks changes to modifiers, their sources, and associated metadata.
 */
public class ModifierEvent {

    /**
     * Enum representing the type of action performed on the modifier.
     */
    public enum ActionType {
        ADDED,
        REMOVED,
        CHANGED
    }

    /** The modifier associated with this event. */
    public Modifier modifier;

    /** The changed modifier, if applicable (used for Perfect Essence that does CHANGED events). */
    public Modifier changed_modifier;

    /** The tier of the modifier. */
    public ModifierTier tier;

    /** The source of the crafting action and its associated probabilities. */
    public Map<Crafting_Action, Double> source;

    /** The type of action performed on the modifier. */
    public ActionType type;

    /** The score associated with this event. */
    public double score;

    /** The timestamp when the event occurred. */
    public long timestamp;

    /**
     * Constructs a ModifierEvent with the given parameters.
     *
     * @param modifier The modifier associated with the event.
     * @param tier The tier of the modifier.
     * @param source The source of the crafting action and its probabilities.
     * @param type The type of action performed on the modifier.
     */
    public ModifierEvent(Modifier modifier, ModifierTier tier, Map<Crafting_Action, Double> source, ActionType type) {
        this.modifier = modifier;
        this.score = 0;
        this.tier = tier;
        this.source = new HashMap<>(source);
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Constructs a ModifierEvent with the given parameters, including a changed modifier. It is used for Perfect Essences.
     *
     * @param modifier The modifier associated with the event.
     * @param tier The tier of the modifier.
     * @param source The source of the crafting action and its probabilities.
     * @param type The type of action performed on the modifier.
     * @param changed_modifier The changed modifier, if applicable.
     */
    public ModifierEvent(Modifier modifier, ModifierTier tier, Map<Crafting_Action, Double> source, ActionType type, Modifier changed_modifier) {
        this.modifier = modifier;
        this.changed_modifier = changed_modifier;
        this.score = 0;
        this.tier = tier;
        this.source = new HashMap<>(source);
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Creates a copy of this ModifierEvent.
     *
     * @return A new ModifierEvent instance with the same fields as this one.
     */
    public ModifierEvent copy() {
        // Create a new instance and copy the fields
        ModifierEvent copy = new ModifierEvent(this.modifier, this.tier, this.source, this.type, this.changed_modifier);
        copy.timestamp = this.timestamp;
        copy.score = this.score;
        return copy;
    }

    /**
     * Returns a string representation of this ModifierEvent.
     *
     * @return A string describing the event.
     */
    @Override
    public String toString() {
        return "[" + type + "] " + modifier.text + 
               " (" + (tier != null ? tier.name : "-");
    }
}
