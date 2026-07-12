package core.data;

import core.Items.Item_base;

import java.nio.file.Path;

/**
 * Seam that lets the engine resolve an {@link Item_base} from the extracted JSON instead of the
 * hardcoded classes, so both share one data source during the migration (SPEC Phase 0).
 *
 * <p><b>Off by default</b> — the golden hardcoded path is unchanged unless {@code USE_JSON_DATA} is
 * set. This is only safe because {@link DataRoundTripCheck} proves the JSON round-trips to identical
 * objects. Env vars:
 * <ul>
 *   <li>{@code USE_JSON_DATA=1|true} — resolve bases from JSON (falls back to hardcoded per-base if
 *       the patch lacks one).</li>
 *   <li>{@code PATCH_DIR} — patch data dir (default {@code data/patches/0.5}).</li>
 * </ul>
 */
public final class ItemBaseProvider {

    private static final boolean JSON_ENABLED = flag(System.getenv("USE_JSON_DATA"));
    private static final Path PATCH_DIR =
            Path.of(System.getenv().getOrDefault("PATCH_DIR", "data/patches/0.5"));

    private static volatile JsonItemRepository repo;

    public static boolean jsonEnabled() {
        return JSON_ENABLED;
    }

    /**
     * Returns a base for {@code itemClass}: from JSON when enabled (keyed by the class's simple
     * name, which is the base id in base_items.json), otherwise a fresh hardcoded instance.
     */
    public static Item_base resolve(Class<?> itemClass) throws Exception {
        if (JSON_ENABLED) {
            Item_base fromJson = repository().getBase(itemClass.getSimpleName());
            if (fromJson != null) return fromJson;
            System.err.println("[data] JSON patch has no base '" + itemClass.getSimpleName()
                    + "'; falling back to hardcoded class");
        }
        return (Item_base) itemClass.getDeclaredConstructor().newInstance();
    }

    private static JsonItemRepository repository() throws Exception {
        JsonItemRepository r = repo;
        if (r == null) {
            synchronized (ItemBaseProvider.class) {
                r = repo;
                if (r == null) {
                    r = JsonItemRepository.load(PATCH_DIR);
                    System.out.println("[data] loaded JSON patch " + r.patch + " from " + PATCH_DIR
                            + " (" + r.baseIds().size() + " bases, " + r.mods().size() + " mods)");
                    repo = r;
                }
            }
        }
        return r;
    }

    private static boolean flag(String v) {
        return "1".equals(v) || "true".equalsIgnoreCase(v);
    }

    private ItemBaseProvider() {}
}
