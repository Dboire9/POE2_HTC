package core.Crafting;

public class CraftEvent {

	public enum CraftEventType {
		ACTION_APPLIED,
		ITEM_MODIFIED,
		OMEN_TRIGGERED
	}

    private final CraftEventType type;
    private final Crafting_Action actionUsed;
    private final boolean success;

    public CraftEvent(CraftEventType type, Crafting_Action actionUsed, boolean success) {
        this.type = type;
        this.actionUsed = actionUsed;
        this.success = success;
    }

    public CraftEventType getType() {
        return type;
    }

    public Crafting_Action getActionUsed() {
        return actionUsed;
    }

    public boolean isSuccess() {
        return success;
    }
}
