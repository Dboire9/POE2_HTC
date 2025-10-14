package core.Modifier_class;

public class ModifierTierWrapper {
    private Modifier modifier;
    private ModifierTier tier;

    public ModifierTierWrapper(Modifier modifier, ModifierTier tier) {
        this.modifier = modifier;
        this.tier = tier;
    }

    public Modifier getModifier() {
        return modifier;
    }

    public ModifierTier getTier() {
        return tier;
    }
}
