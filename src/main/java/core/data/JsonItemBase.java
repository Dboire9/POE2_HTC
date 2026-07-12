package core.data;

import core.Items.Item_base;
import core.Modifier_class.Modifier;

import java.util.List;

/**
 * An {@link Item_base} whose allowed-mod pools come from {@code base_items.json} instead of a
 * hardcoded constructor. It only populates the inherited protected pool fields; all behaviour
 * (the getters the engine uses) is unchanged, so it is a drop-in for the hardcoded base classes.
 */
public final class JsonItemBase extends Item_base {

    private final String id;

    public JsonItemBase(String id,
                        List<Modifier> normalPrefixes, List<Modifier> normalSuffixes,
                        List<Modifier> desecratedPrefixes, List<Modifier> desecratedSuffixes,
                        List<Modifier> essencePrefixes, List<Modifier> essenceSuffixes) {
        this.id = id;
        this.Normal_allowedPrefixes = normalPrefixes;
        this.Normal_allowedSuffixes = normalSuffixes;
        this.Desecrated_allowedPrefixes = desecratedPrefixes;
        this.Desecrated_allowedSuffixes = desecratedSuffixes;
        this.Essences_allowedPrefixes = essencePrefixes;
        this.Essences_allowedSuffixes = essenceSuffixes;
    }

    public String getId() {
        return id;
    }
}
