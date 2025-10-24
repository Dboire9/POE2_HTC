package core.Crafting.Utils;

import core.Modifier_class.*;
import core.Crafting.*;

public class ModifierEvent {

    public enum ActionType {
        ADDED,
        REMOVED,
        CHANGED
    }

    public final Modifier modifier;
    public final ModifierTier tier;
    public final Crafting_Action source;
    public final ActionType type;
    public final long timestamp;

    public ModifierEvent(Modifier modifier, ModifierTier tier, Crafting_Action source, ActionType type) {
        this.modifier = modifier;
        this.tier = tier;
        this.source = source;
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }

    @Override
    public String toString() {
        return "[" + type + "] " + modifier.text + 
               " (" + (tier != null ? tier.name : "-") + 
               ") via " + source.getName();
    }
}