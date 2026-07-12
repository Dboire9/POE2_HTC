package core.data;

import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Modifier_class.Pair;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Stream;

/**
 * Differential self-check (SPEC Phase 0 / CLAUDE.md "golden reference"): proves the extracted JSON
 * round-trips to objects IDENTICAL to the hardcoded Java engine data. If this passes, pointing the
 * engine at the JSON cannot change its behaviour.
 *
 * <p>It compares, field-by-field:
 * <ul>
 *   <li>every hardcoded {@code Modifiers_*} static vs the JSON-built {@link Modifier} of the same id
 *       (catches extraction errors even for mods no base references), and</li>
 *   <li>every hardcoded {@link Item_base}'s six pools vs the JSON base's pools, in order.</li>
 * </ul>
 *
 * Run in dev mode (needs the source tree to enumerate the hardcoded classes):
 * {@code java core.data.DataRoundTripCheck [srcRoot=src/main/java] [patchDir=data/patches/0.5]}
 * Exit code 0 = identical, 1 = divergence (details printed).
 */
public final class DataRoundTripCheck {

    private static final int MAX_DIFFS_SHOWN = 40;

    public static void main(String[] args) throws Exception {
        Path srcRoot = Path.of(args.length > 0 ? args[0] : "src/main/java");
        Path patchDir = Path.of(args.length > 1 ? args[1] : "data/patches/0.5");

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        List<String> diffs = new ArrayList<>();

        // 1) Full mod catalog: hardcoded statics (by id) vs JSON-built mods.
        Map<String, Modifier> hardMods = reflectHardcodedMods(srcRoot);
        Map<String, Modifier> jsonMods = repo.mods();
        compareKeys("mod", hardMods.keySet(), jsonMods.keySet(), diffs);
        for (String id : hardMods.keySet()) {
            if (jsonMods.containsKey(id)) {
                compareModifier("mod " + id, hardMods.get(id), jsonMods.get(id), diffs);
            }
        }

        // 2) Bases: hardcoded pools vs JSON pools.
        Map<String, Item_base> hardBases = reflectHardcodedBases(srcRoot);
        Map<String, String> jsonBaseIds = new TreeMap<>();
        for (String id : repo.baseIds()) jsonBaseIds.put(id, id);
        compareKeys("base", hardBases.keySet(), jsonBaseIds.keySet(), diffs);
        for (Map.Entry<String, Item_base> e : hardBases.entrySet()) {
            Item_base json = repo.getBase(e.getKey());
            if (json == null) continue;
            comparePools(e.getKey(), e.getValue(), json, diffs);
        }

        // Report.
        System.out.println("Differential round-trip check  (patch " + repo.patch + ")");
        System.out.println("  hardcoded mods : " + hardMods.size() + "   json mods : " + jsonMods.size());
        System.out.println("  hardcoded bases: " + hardBases.size() + "   json bases: " + repo.baseIds().size());
        if (diffs.isEmpty()) {
            System.out.println("RESULT: IDENTICAL — JSON round-trips exactly to the hardcoded data.");
            return;
        }
        System.out.println("RESULT: " + diffs.size() + " DIVERGENCE(S):");
        for (int i = 0; i < Math.min(diffs.size(), MAX_DIFFS_SHOWN); i++) {
            System.out.println("  - " + diffs.get(i));
        }
        if (diffs.size() > MAX_DIFFS_SHOWN) {
            System.out.println("  ... and " + (diffs.size() - MAX_DIFFS_SHOWN) + " more");
        }
        System.exit(1);
    }

    // ---- comparisons ----------------------------------------------------------------------

    private static void comparePools(String baseId, Item_base hard, Item_base json, List<String> diffs) {
        comparePool(baseId, "normal.prefix", hard.getNormalAllowedPrefixes(), json.getNormalAllowedPrefixes(), diffs);
        comparePool(baseId, "normal.suffix", hard.getNormalAllowedSuffixes(), json.getNormalAllowedSuffixes(), diffs);
        comparePool(baseId, "desecrated.prefix", hard.getDesecratedAllowedPrefixes(), json.getDesecratedAllowedPrefixes(), diffs);
        comparePool(baseId, "desecrated.suffix", hard.getDesecratedAllowedSuffixes(), json.getDesecratedAllowedSuffixes(), diffs);
        comparePool(baseId, "essence.prefix", hard.getEssencesAllowedPrefixes(), json.getEssencesAllowedPrefixes(), diffs);
        comparePool(baseId, "essence.suffix", hard.getEssencesAllowedSuffixes(), json.getEssencesAllowedSuffixes(), diffs);
    }

    private static void comparePool(String baseId, String pool, List<Modifier> hard, List<Modifier> json,
                                    List<String> diffs) {
        int hs = hard == null ? 0 : hard.size();
        int js = json == null ? 0 : json.size();
        if (hs != js) {
            diffs.add(baseId + " " + pool + ": size " + hs + " (hardcoded) vs " + js + " (json)");
            return;
        }
        for (int i = 0; i < hs; i++) {
            compareModifier(baseId + " " + pool + "[" + i + "]", hard.get(i), json.get(i), diffs);
        }
    }

    private static void compareModifier(String where, Modifier a, Modifier b, List<String> diffs) {
        eq(where, "primaryCategory", a.primaryCategory, b.primaryCategory, diffs);
        eq(where, "secondaryCategory", a.secondaryCategory, b.secondaryCategory, diffs);
        eq(where, "thirdCategory", a.thirdCategory, b.thirdCategory, diffs);
        eq(where, "fourthCategory", a.fourthCategory, b.fourthCategory, diffs);
        eq(where, "type", a.type, b.type, diffs);
        eq(where, "source", a.source, b.source, diffs);
        eq(where, "family", a.family, b.family, diffs);
        eq(where, "text", a.text, b.text, diffs);
        eq(where, "tags", a.tags, b.tags, diffs);
        int at = a.tiers == null ? 0 : a.tiers.size();
        int bt = b.tiers == null ? 0 : b.tiers.size();
        if (at != bt) {
            diffs.add(where + ": tier count " + at + " vs " + bt);
            return;
        }
        for (int i = 0; i < at; i++) {
            compareTier(where + " tier[" + i + "]", a.tiers.get(i), b.tiers.get(i), diffs);
        }
    }

    private static void compareTier(String where, ModifierTier a, ModifierTier b, List<String> diffs) {
        eq(where, "name", a.name, b.name, diffs);
        if (a.level != b.level) diffs.add(where + " level: " + a.level + " vs " + b.level);
        if (a.weight != b.weight) diffs.add(where + " weight: " + a.weight + " vs " + b.weight);
        comparePair(where, "minMax1", a.minMax1, b.minMax1, diffs);
        comparePair(where, "minMax2", a.minMax2, b.minMax2, diffs);
        comparePair(where, "minMax3", a.minMax3, b.minMax3, diffs);
        comparePair(where, "minMax4", a.minMax4, b.minMax4, diffs);
        eq(where, "stat1", a.stat1, b.stat1, diffs);
        eq(where, "stat2", a.stat2, b.stat2, diffs);
        eq(where, "stat3", a.stat3, b.stat3, diffs);
        eq(where, "stat4", a.stat4, b.stat4, diffs);
    }

    private static void comparePair(String where, String field, Pair<Number, Number> a, Pair<Number, Number> b,
                                    List<String> diffs) {
        if (a == null && b == null) return;
        if (a == null || b == null) {
            diffs.add(where + " " + field + ": " + a + " vs " + b);
            return;
        }
        // Compare by numeric value so Integer(14) and Double(14.0) are treated as equal.
        if (a.first().doubleValue() != b.first().doubleValue()
                || a.second().doubleValue() != b.second().doubleValue()) {
            diffs.add(where + " " + field + ": [" + a.first() + "," + a.second() + "] vs ["
                    + b.first() + "," + b.second() + "]");
        }
    }

    private static void eq(String where, String field, Object a, Object b, List<String> diffs) {
        if (!Objects.equals(a, b)) {
            diffs.add(where + " " + field + ": " + a + " vs " + b);
        }
    }

    private static void compareKeys(String kind, java.util.Set<String> hard, java.util.Set<String> json,
                                    List<String> diffs) {
        for (String k : hard) if (!json.contains(k)) diffs.add("hardcoded " + kind + " missing from json: " + k);
        for (String k : json) if (!hard.contains(k)) diffs.add("json " + kind + " missing from hardcoded: " + k);
    }

    // ---- reflect the hardcoded engine data (mirrors the extractor's discovery) -------------

    private static Map<String, Modifier> reflectHardcodedMods(Path srcRoot) throws Exception {
        Map<String, Modifier> out = new TreeMap<>();
        Path modRoot = srcRoot.resolve("core/Item_modifiers");
        try (Stream<Path> walk = Files.walk(modRoot)) {
            for (Path p : (Iterable<Path>) walk::iterator) {
                String fn = p.getFileName().toString();
                if (!fn.startsWith("Modifiers_") || !fn.endsWith(".java")) continue;
                Class<?> cls = Class.forName(fqcn(srcRoot, p));
                String group = groupKeyOf(cls);
                for (Field f : cls.getDeclaredFields()) {
                    if (!java.lang.reflect.Modifier.isStatic(f.getModifiers())) continue;
                    if (!Modifier.class.isAssignableFrom(f.getType())) continue;
                    f.setAccessible(true);
                    Modifier m = (Modifier) f.get(null);
                    if (m == null) continue;
                    out.put(group + "/" + f.getName(), m);
                }
            }
        }
        return out;
    }

    private static Map<String, Item_base> reflectHardcodedBases(Path srcRoot) throws Exception {
        Map<String, Item_base> out = new TreeMap<>();
        Path itemsRoot = srcRoot.resolve("core/Items");
        try (Stream<Path> walk = Files.walk(itemsRoot)) {
            for (Path p : (Iterable<Path>) walk::iterator) {
                String fn = p.getFileName().toString();
                if (!fn.endsWith(".java") || fn.equals("Item_base.java")) continue;
                Class<?> cls = Class.forName(fqcn(srcRoot, p));
                if (!Item_base.class.isAssignableFrom(cls) || cls.equals(Item_base.class)) continue;
                if (java.lang.reflect.Modifier.isAbstract(cls.getModifiers())) continue;
                out.put(cls.getSimpleName(), (Item_base) cls.getDeclaredConstructor().newInstance());
            }
        }
        return out;
    }

    private static String fqcn(Path srcRoot, Path javaFile) {
        String s = srcRoot.relativize(javaFile).toString().replace(java.io.File.separatorChar, '/');
        return s.substring(0, s.length() - ".java".length()).replace('/', '.');
    }

    private static String groupKeyOf(Class<?> cls) {
        String pkg = cls.getPackageName();
        String leaf = pkg.substring(pkg.lastIndexOf('.') + 1);
        return leaf.replaceFirst("_Items?_modifiers$", "");
    }

    private DataRoundTripCheck() {}
}
