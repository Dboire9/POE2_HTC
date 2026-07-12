package core.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads a single patch's extracted data ({@code mods.json} + {@code base_items.json}) into plain
 * records, ready to be turned into engine {@link core.Modifier_class.Modifier} / {@link
 * core.Items.Item_base} objects by {@link ModifierFactory} / {@link JsonItemRepository}.
 *
 * <p>Parsed with Gson's tree API (not POJO binding) so numeric ranges keep their original
 * integer-vs-decimal type — {@code 14} stays an {@code Integer}, {@code 5.9} a {@code Double} —
 * matching the hardcoded {@code Pair<Number,Number>} literals exactly.
 *
 * <p>Per CLAUDE.md the loader rejects mixed patches: every file must carry the same {@code patch}.
 */
public final class PatchData {

    public final String patch;
    public final Map<String, ModJson> mods;   // id -> mod, in file order
    public final List<BaseJson> items;         // bases, in file order

    private PatchData(String patch, Map<String, ModJson> mods, List<BaseJson> items) {
        this.patch = patch;
        this.mods = mods;
        this.items = items;
    }

    public static PatchData load(Path patchDir) throws IOException {
        JsonObject modsRoot = readObject(patchDir.resolve("mods.json"));
        JsonObject basesRoot = readObject(patchDir.resolve("base_items.json"));

        String patch = modsRoot.get("patch").getAsString();
        String basesPatch = basesRoot.get("patch").getAsString();
        if (!patch.equals(basesPatch)) {
            throw new IllegalStateException(
                    "Mixed-patch data: mods.json=" + patch + " base_items.json=" + basesPatch);
        }

        Map<String, ModJson> mods = new LinkedHashMap<>();
        for (JsonElement el : modsRoot.getAsJsonArray("mods")) {
            ModJson m = parseMod(el.getAsJsonObject());
            if (mods.put(m.id, m) != null) {
                throw new IllegalStateException("Duplicate mod id in mods.json: " + m.id);
            }
        }

        List<BaseJson> items = new ArrayList<>();
        for (JsonElement el : basesRoot.getAsJsonArray("items")) {
            items.add(parseBase(el.getAsJsonObject()));
        }

        return new PatchData(patch, mods, items);
    }

    private static ModJson parseMod(JsonObject o) {
        ModJson m = new ModJson();
        m.id = str(o, "id");
        m.group = str(o, "group");
        m.field = str(o, "field");
        m.source = str(o, "source");
        m.type = str(o, "type");
        m.categories = strList(o, "categories");
        m.family = str(o, "family");
        m.tags = strList(o, "tags");
        m.text = str(o, "text");
        m.tiers = new ArrayList<>();
        for (JsonElement te : o.getAsJsonArray("tiers")) {
            JsonObject t = te.getAsJsonObject();
            TierJson tj = new TierJson();
            tj.name = str(t, "name");
            tj.ilvl = t.get("ilvl").getAsInt();
            tj.weight = t.get("weight").getAsInt();
            tj.ranges = new ArrayList<>();
            for (JsonElement re : t.getAsJsonArray("ranges")) {
                JsonArray pair = re.getAsJsonArray();
                tj.ranges.add(new Number[]{number(pair.get(0)), number(pair.get(1))});
            }
            tj.stats = jsonStrList(t.getAsJsonArray("stats"));
            m.tiers.add(tj);
        }
        return m;
    }

    private static BaseJson parseBase(JsonObject o) {
        BaseJson b = new BaseJson();
        b.id = str(o, "id");
        b.name = str(o, "name");
        b.category = str(o, "category");
        JsonObject pools = o.getAsJsonObject("pools");
        b.normalPrefixes = poolList(pools, "normal", "prefixes");
        b.normalSuffixes = poolList(pools, "normal", "suffixes");
        b.desecratedPrefixes = poolList(pools, "desecrated", "prefixes");
        b.desecratedSuffixes = poolList(pools, "desecrated", "suffixes");
        b.essencePrefixes = poolList(pools, "essence", "prefixes");
        b.essenceSuffixes = poolList(pools, "essence", "suffixes");
        return b;
    }

    /** Preserve integer-vs-decimal: "14" -> Integer, "5.9"/"2e3" -> Double. */
    private static Number number(JsonElement el) {
        String s = el.getAsString();
        return (s.indexOf('.') >= 0 || s.indexOf('e') >= 0 || s.indexOf('E') >= 0)
                ? (Number) Double.valueOf(s)
                : (Number) Integer.valueOf(s);
    }

    private static List<String> poolList(JsonObject pools, String source, String affix) {
        return jsonStrList(pools.getAsJsonObject(source).getAsJsonArray(affix));
    }

    private static List<String> strList(JsonObject o, String key) {
        return jsonStrList(o.getAsJsonArray(key));
    }

    private static List<String> jsonStrList(JsonArray arr) {
        List<String> out = new ArrayList<>();
        if (arr != null) for (JsonElement e : arr) out.add(e.getAsString());
        return out;
    }

    private static String str(JsonObject o, String key) {
        JsonElement e = o.get(key);
        return (e == null || e.isJsonNull()) ? null : e.getAsString();
    }

    private static JsonObject readObject(Path p) throws IOException {
        try (Reader r = Files.newBufferedReader(p)) {
            return JsonParser.parseReader(r).getAsJsonObject();
        }
    }

    // ---- record structs (mirror the JSON schema) -----------------------------------------

    public static final class ModJson {
        public String id, group, field, source, type, family, text;
        public List<String> categories, tags;
        public List<TierJson> tiers;
    }

    public static final class TierJson {
        public String name;
        public int ilvl, weight;
        public List<Number[]> ranges;
        public List<String> stats;
    }

    public static final class BaseJson {
        public String id, name, category;
        public List<String> normalPrefixes, normalSuffixes,
                desecratedPrefixes, desecratedSuffixes,
                essencePrefixes, essenceSuffixes;
    }
}
