package core.Crafting.Utils;

import core.Modifier_class.*;
import core.Crafting.*;

public class ModifierEvent {

    public enum ActionType {
        ADDED,
        REMOVED,
        CHANGED
    }

	
    public Modifier modifier;
    public ModifierTier tier;
    public Crafting_Action source;
    public ActionType type;
	public double score;
    public long timestamp;
	
	
    public ModifierEvent(Modifier modifier, ModifierTier tier, Crafting_Action source, ActionType type) {
        this.modifier = modifier;
		this.score = 0;
        this.tier = tier;
        this.source = source;
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }

	public ModifierEvent copy() {
		// Create a new instance and copy the fields
		ModifierEvent copy = new ModifierEvent(this.modifier, this.tier, this.source.copy(), this.type);
		copy.timestamp = this.timestamp;
		copy.score = this.score;
		return copy;
	}

    @Override
    public String toString() {
        return "[" + type + "] " + modifier.text + 
               " (" + (tier != null ? tier.name : "-") + 
               ") via " + source.getName();
    }
}