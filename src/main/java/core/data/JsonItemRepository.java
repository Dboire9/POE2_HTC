package core.data;

import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.data.PatchData.BaseJson;
import core.data.PatchData.ModJson;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * JSON-backed source of {@link Item_base} instances for a single patch: reads the extracted
 * {@code data/patches/<patch>/} JSON and hands back bases keyed by id (their simple class name in
 * the hardcoded engine, e.g. {@code "Wands"}, {@code "Body_Armours_str"}).
 *
 * <p>One {@link Modifier} instance is built per mod id and shared across the bases that list it,
 * mirroring how the hardcoded bases share the {@code public static final Modifier} statics.
 */
public final class JsonItemRepository {

    public final String patch;
    private final Map<String, Modifier> modsById;
    private final Map<String, Item_base> basesById;

    public JsonItemRepository(PatchData data) {
        this.patch = data.patch;
        ModifierFactory factory = new ModifierFactory();

        this.modsById = new LinkedHashMap<>();
        for (ModJson m : data.mods.values()) {
            modsById.put(m.id, factory.build(m));
        }

        this.basesById = new LinkedHashMap<>();
        for (BaseJson b : data.items) {
            Item_base base = new JsonItemBase(
                    b.id,
                    resolve(b.normalPrefixes, b.id, "normal.prefix"),
                    resolve(b.normalSuffixes, b.id, "normal.suffix"),
                    resolve(b.desecratedPrefixes, b.id, "desecrated.prefix"),
                    resolve(b.desecratedSuffixes, b.id, "desecrated.suffix"),
                    resolve(b.essencePrefixes, b.id, "essence.prefix"),
                    resolve(b.essenceSuffixes, b.id, "essence.suffix"));
            basesById.put(b.id, base);
        }
    }

    public static JsonItemRepository load(Path patchDir) throws IOException {
        return new JsonItemRepository(PatchData.load(patchDir));
    }

    /** @return the base for this id, or {@code null} if the patch has no such base. */
    public Item_base getBase(String id) {
        return basesById.get(id);
    }

    public boolean hasBase(String id) {
        return basesById.containsKey(id);
    }

    public List<String> baseIds() {
        return new ArrayList<>(basesById.keySet());
    }

    /** All built mods, keyed by id (same scheme as mods.json). Unmodifiable. */
    public Map<String, Modifier> mods() {
        return java.util.Collections.unmodifiableMap(modsById);
    }

    private List<Modifier> resolve(List<String> ids, String baseId, String pool) {
        List<Modifier> out = new ArrayList<>(ids.size());
        for (String id : ids) {
            Modifier m = modsById.get(id);
            if (m == null) {
                throw new IllegalStateException(
                        "Base " + baseId + " pool " + pool + " references unknown mod id: " + id);
            }
            out.add(m);
        }
        return out;
    }
}
