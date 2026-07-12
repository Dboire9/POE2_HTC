package tools.extractor;

import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Modifier_class.Pair;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Stream;

/**
 * Phase-0 one-off extractor.
 *
 * Converts the hardcoded PoE2 mod/item data in {@code core.Item_modifiers.**} and
 * {@code core.Items.**} into per-patch JSON (SPEC.md schema), writing:
 *
 *   {outDir}/mods.json        — flat catalog of every distinct Modifier static, with a
 *                               stable id "{group}/{FIELD_NAME}", source, type, family,
 *                               tags, categories, text and tiers[{name,ilvl,weight,ranges,stats}].
 *   {outDir}/base_items.json  — every Item_base subclass, with its normal/desecrated/essence
 *                               prefix+suffix pools expressed as lists of mod ids.
 *
 * WHY REFLECTION (not source parsing): the Java data classes construct the exact objects the
 * golden engine uses, and every base references the same {@code public static final Modifier}
 * instances by object identity. Running the real code and reading it back via an
 * IdentityHashMap is exact — it can't drift from formatting, comments, decimal-vs-int literals,
 * multi-package imports, or hybrid constructor arities the way a regex parser would.
 *
 * This is deliberately a faithful 1:1 dump of what the Java holds today (pre-0.5 refresh), so a
 * later refresh to patch 0.5.0 values can be diffed against it. It does NOT touch weights, add
 * community overrides, or invent data.
 *
 * Usage: DataExtractor [srcRoot=src/main/java] [outDir=data/patches/0.5] [patch=0.5] [generated=2026-07-04]
 */
public final class DataExtractor {

    // Provenance stamped into every output file (see SPEC.md: loader rejects mixed patches).
    private static final String SOURCE_NOTE =
            "extracted-1to1-from-java-golden-reference; pre-0.5-refresh, values NOT yet verified";

    public static void main(String[] args) throws Exception {
        Path srcRoot = Path.of(args.length > 0 ? args[0] : "src/main/java");
        Path outDir = Path.of(args.length > 1 ? args[1] : "data/patches/0.5");
        String patch = args.length > 2 ? args[2] : "0.5";
        String generated = args.length > 3 ? args[3] : "2026-07-04";

        if (!Files.isDirectory(srcRoot)) {
            throw new IllegalArgumentException("srcRoot not found: " + srcRoot.toAbsolutePath());
        }
        Files.createDirectories(outDir);

        // 1) Catalog every distinct Modifier static, remembering (group, field) provenance and a
        //    reverse object->id map so base pools can be expressed as id lists.
        IdentityHashMap<Modifier, String> idOf = new IdentityHashMap<>();
        // TreeMap => output sorted by id for stable diffs.
        TreeMap<String, ModRecord> catalog = new TreeMap<>();
        int modClasses = catalogModifiers(srcRoot, idOf, catalog);

        // 2) Every Item_base subclass -> its pools as id lists.
        TreeMap<String, BaseRecord> bases = extractBases(srcRoot, idOf);

        // 3) essences.json is DERIVED from the essence-sourced mods (the Java has no essence data
        //    table — Essence_currency.java discovers essences at runtime by scanning essence-mod
        //    tier names). We re-index those same mods essence-name -> tier -> mod ids.
        TreeMap<String, EssenceRecord> essences = deriveEssences(catalog);

        // 4) Emit JSON.
        Files.writeString(outDir.resolve("mods.json"), renderMods(patch, generated, catalog), StandardCharsets.UTF_8);
        Files.writeString(outDir.resolve("base_items.json"), renderBases(patch, generated, bases), StandardCharsets.UTF_8);
        Files.writeString(outDir.resolve("essences.json"), renderEssences(patch, generated, essences), StandardCharsets.UTF_8);

        // 5) Summary.
        int tierCount = catalog.values().stream().mapToInt(m -> m.tiers.size()).sum();
        Map<String, Integer> bySource = new TreeMap<>();
        for (ModRecord m : catalog.values()) bySource.merge(m.source, 1, Integer::sum);
        System.out.println("Extracted from " + srcRoot);
        System.out.println("  modifier classes scanned : " + modClasses);
        System.out.println("  distinct mods            : " + catalog.size() + "  (tiers: " + tierCount + ")");
        System.out.println("    by source              : " + bySource);
        System.out.println("  base items               : " + bases.size());
        System.out.println("  essences (derived)       : " + essences.size());
        System.out.println("  wrote " + outDir.resolve("mods.json"));
        System.out.println("  wrote " + outDir.resolve("base_items.json"));
        System.out.println("  wrote " + outDir.resolve("essences.json"));
    }

    // ---- 1) Modifier catalog --------------------------------------------------------------

    private static int catalogModifiers(Path srcRoot, IdentityHashMap<Modifier, String> idOf,
                                        TreeMap<String, ModRecord> catalog) throws Exception {
        Path modRoot = srcRoot.resolve("core/Item_modifiers");
        List<Class<?>> classes = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(modRoot)) {
            for (Path p : (Iterable<Path>) walk::iterator) {
                String fn = p.getFileName().toString();
                if (fn.startsWith("Modifiers_") && fn.endsWith(".java")) {
                    classes.add(Class.forName(fqcn(srcRoot, p)));
                }
            }
        }
        for (Class<?> cls : classes) {
            String group = groupKeyOf(cls); // e.g. "Wands", "Body_Armours_Normal"
            for (Field f : cls.getDeclaredFields()) {
                if (!java.lang.reflect.Modifier.isStatic(f.getModifiers())) continue;
                if (!Modifier.class.isAssignableFrom(f.getType())) continue;
                f.setAccessible(true);
                Modifier mod = (Modifier) f.get(null);
                if (mod == null) {
                    // Declared-but-unassigned static; nothing to catalog.
                    System.err.println("WARN: null modifier static " + cls.getName() + "." + f.getName());
                    continue;
                }
                String id = group + "/" + f.getName();
                if (catalog.containsKey(id)) {
                    throw new IllegalStateException("Duplicate mod id: " + id);
                }
                if (idOf.containsKey(mod)) {
                    // Same object aliased by two fields — keep the first, warn.
                    System.err.println("WARN: modifier object aliased: " + id + " == " + idOf.get(mod));
                    continue;
                }
                idOf.put(mod, id);
                catalog.put(id, toRecord(id, group, f.getName(), mod));
            }
        }
        return classes.size();
    }

    private static ModRecord toRecord(String id, String group, String field, Modifier mod) {
        ModRecord r = new ModRecord();
        r.id = id;
        r.group = group;
        r.field = field;
        r.source = sourceName(mod.source);
        r.type = mod.type == Modifier.ModifierType.PREFIX ? "prefix" : "suffix";
        r.categories = nonEmpty(mod.primaryCategory, mod.secondaryCategory, mod.thirdCategory, mod.fourthCategory);
        r.family = mod.family;
        r.tags = mod.tags == null ? List.of() : mod.tags;
        r.text = mod.text;
        r.tiers = new ArrayList<>();
        for (ModifierTier t : mod.tiers) {
            TierRecord tr = new TierRecord();
            tr.name = t.name;
            tr.ilvl = t.level;
            tr.weight = t.weight;
            tr.ranges = new ArrayList<>();
            addRange(tr.ranges, t.minMax1);
            addRange(tr.ranges, t.minMax2);
            addRange(tr.ranges, t.minMax3);
            addRange(tr.ranges, t.minMax4);
            tr.stats = nonEmpty(t.stat1, t.stat2, t.stat3, t.stat4);
            r.tiers.add(tr);
        }
        return r;
    }

    private static void addRange(List<Number[]> out, Pair<Number, Number> p) {
        if (p != null) out.add(new Number[]{p.first(), p.second()});
    }

    // ---- 2) Base items --------------------------------------------------------------------

    private static TreeMap<String, BaseRecord> extractBases(Path srcRoot, IdentityHashMap<Modifier, String> idOf)
            throws Exception {
        Path itemsRoot = srcRoot.resolve("core/Items");
        TreeMap<String, BaseRecord> bases = new TreeMap<>();
        try (Stream<Path> walk = Files.walk(itemsRoot)) {
            for (Path p : (Iterable<Path>) walk::iterator) {
                String fn = p.getFileName().toString();
                if (!fn.endsWith(".java") || fn.equals("Item_base.java")) continue;
                Class<?> cls = Class.forName(fqcn(srcRoot, p));
                if (!Item_base.class.isAssignableFrom(cls) || cls.equals(Item_base.class)) continue;
                if (java.lang.reflect.Modifier.isAbstract(cls.getModifiers())) continue;

                Item_base base = (Item_base) cls.getDeclaredConstructor().newInstance();
                BaseRecord b = new BaseRecord();
                b.id = cls.getSimpleName();
                b.name = cls.getSimpleName();
                b.category = categoryOf(cls); // top-level group, e.g. "Body_Armours", "Wands"
                b.normalPrefixes = ids(base.getNormalAllowedPrefixes(), idOf, b.id, "normal.prefix");
                b.normalSuffixes = ids(base.getNormalAllowedSuffixes(), idOf, b.id, "normal.suffix");
                b.desecratedPrefixes = ids(base.getDesecratedAllowedPrefixes(), idOf, b.id, "desecrated.prefix");
                b.desecratedSuffixes = ids(base.getDesecratedAllowedSuffixes(), idOf, b.id, "desecrated.suffix");
                b.essencePrefixes = ids(base.getEssencesAllowedPrefixes(), idOf, b.id, "essence.prefix");
                b.essenceSuffixes = ids(base.getEssencesAllowedSuffixes(), idOf, b.id, "essence.suffix");
                bases.put(b.id, b);
            }
        }
        return bases;
    }

    private static List<String> ids(List<Modifier> mods, IdentityHashMap<Modifier, String> idOf,
                                    String baseId, String pool) {
        List<String> out = new ArrayList<>();
        if (mods == null) return out; // pool left null in the base constructor
        for (Modifier m : mods) {
            String id = idOf.get(m);
            if (id == null) {
                throw new IllegalStateException(
                        "Base " + baseId + " pool " + pool + " references an uncataloged Modifier "
                                + "(family=" + (m == null ? "null" : m.family) + "). "
                                + "It is not a public static field of any Modifiers_* class.");
            }
            out.add(id);
        }
        return out;
    }

    // ---- 3) Essence index (derived from essence-sourced mods) -----------------------------

    // Fixed display/order of the four essence strengths (mirrors Essence_currency.EssenceTier).
    private static final String[] ESSENCE_TIERS = {"LESSER", "NORMAL", "GREATER", "PERFECT"};

    private static TreeMap<String, EssenceRecord> deriveEssences(TreeMap<String, ModRecord> catalog) {
        TreeMap<String, EssenceRecord> essences = new TreeMap<>();
        for (ModRecord m : catalog.values()) {
            if (!m.source.equals("essence") && !m.source.equals("perfect_essence")) continue;
            for (TierRecord t : m.tiers) {
                String tier = parseEssenceTier(t.name); // LESSER|NORMAL|GREATER|PERFECT
                String name = parseEssenceName(t.name);  // "Sorcery", "the Infinite", ...
                essences.computeIfAbsent(name, EssenceRecord::new)
                        .tiers.computeIfAbsent(tier, k -> new java.util.TreeSet<>())
                        .add(m.id);
            }
        }
        return essences;
    }

    private static String parseEssenceTier(String tierName) {
        if (tierName.startsWith("Lesser ")) return "LESSER";
        if (tierName.startsWith("Greater ")) return "GREATER";
        if (tierName.startsWith("Perfect ")) return "PERFECT";
        return "NORMAL"; // bare "Essence of X"
    }

    private static String parseEssenceName(String tierName) {
        String s = tierName;
        for (String p : new String[]{"Lesser ", "Greater ", "Perfect "}) {
            if (s.startsWith(p)) { s = s.substring(p.length()); break; }
        }
        String marker = "Essence of ";
        int i = s.indexOf(marker);
        return i >= 0 ? s.substring(i + marker.length()).trim() : s.trim();
    }

    // ---- helpers --------------------------------------------------------------------------

    /** src/main/java/core/Foo/Bar.java -> core.Foo.Bar */
    private static String fqcn(Path srcRoot, Path javaFile) {
        Path rel = srcRoot.relativize(javaFile);
        String s = rel.toString().replace(java.io.File.separatorChar, '/');
        s = s.substring(0, s.length() - ".java".length());
        return s.replace('/', '.');
    }

    /** Leaf package of a Modifiers_* class -> group key, stripping the _Item(s)_modifiers suffix. */
    private static String groupKeyOf(Class<?> cls) {
        String pkg = cls.getPackageName();               // ...Wands_Item_modifiers
        String leaf = pkg.substring(pkg.lastIndexOf('.') + 1);
        leaf = leaf.replaceFirst("_Items?_modifiers$", "");
        return leaf;
    }

    /** First path segment under core.Items for a base class -> its top-level category. */
    private static String categoryOf(Class<?> cls) {
        String pkg = cls.getPackageName();               // core.Items.Body_Armours.Body_Armours_dex_int
        String prefix = "core.Items.";
        String rest = pkg.startsWith(prefix) ? pkg.substring(prefix.length()) : pkg;
        int dot = rest.indexOf('.');
        return dot < 0 ? rest : rest.substring(0, dot);  // "Body_Armours" | "Wands" | ...
    }

    private static String sourceName(Modifier.ModifierSource s) {
        switch (s) {
            case NORMAL: return "normal";
            case DESECRATED: return "desecrated";
            case ESSENCE: return "essence";
            case PERFECT_ESSENCE: return "perfect_essence";
            default: return s.name().toLowerCase();
        }
    }

    private static List<String> nonEmpty(String... vals) {
        List<String> out = new ArrayList<>();
        for (String v : vals) if (v != null && !v.isEmpty()) out.add(v);
        return out;
    }

    // ---- record structs -------------------------------------------------------------------

    private static final class ModRecord {
        String id, group, field, source, type, family, text;
        List<String> categories, tags;
        List<TierRecord> tiers;
    }

    private static final class TierRecord {
        String name;
        int ilvl, weight;
        List<Number[]> ranges;
        List<String> stats;
    }

    private static final class BaseRecord {
        String id, name, category;
        List<String> normalPrefixes, normalSuffixes,
                desecratedPrefixes, desecratedSuffixes,
                essencePrefixes, essenceSuffixes;
    }

    private static final class EssenceRecord {
        final String name;
        // essence strength -> the mod ids that essence forces (one per item group that has it).
        final Map<String, java.util.TreeSet<String>> tiers = new TreeMap<>();
        EssenceRecord(String name) { this.name = name; }
    }

    // ---- minimal, dependency-free JSON writer ---------------------------------------------
    // Deterministic, pretty-printed. Numbers preserve int-vs-double exactly as the Java literals
    // (Integer -> "14", Double -> "5.0"), since decimal ranges are meaningful in the data.

    private static String renderMods(String patch, String generated, TreeMap<String, ModRecord> catalog) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"patch\": ").append(str(patch)).append(",\n");
        sb.append("  \"generated\": ").append(str(generated)).append(",\n");
        sb.append("  \"source\": ").append(str(SOURCE_NOTE)).append(",\n");
        sb.append("  \"count\": ").append(catalog.size()).append(",\n");
        sb.append("  \"mods\": [\n");
        int i = 0;
        for (ModRecord m : catalog.values()) {
            sb.append("    {\n");
            sb.append("      \"id\": ").append(str(m.id)).append(",\n");
            sb.append("      \"group\": ").append(str(m.group)).append(",\n");
            sb.append("      \"field\": ").append(str(m.field)).append(",\n");
            sb.append("      \"source\": ").append(str(m.source)).append(",\n");
            sb.append("      \"type\": ").append(str(m.type)).append(",\n");
            sb.append("      \"categories\": ").append(strArr(m.categories)).append(",\n");
            sb.append("      \"family\": ").append(str(m.family)).append(",\n");
            sb.append("      \"tags\": ").append(strArr(m.tags)).append(",\n");
            sb.append("      \"text\": ").append(str(m.text)).append(",\n");
            sb.append("      \"tiers\": [");
            if (m.tiers.isEmpty()) {
                sb.append("]");
            } else {
                sb.append("\n");
                for (int j = 0; j < m.tiers.size(); j++) {
                    TierRecord t = m.tiers.get(j);
                    sb.append("        { ");
                    sb.append("\"name\": ").append(str(t.name)).append(", ");
                    sb.append("\"ilvl\": ").append(t.ilvl).append(", ");
                    sb.append("\"weight\": ").append(t.weight).append(", ");
                    sb.append("\"ranges\": ").append(rangeArr(t.ranges)).append(", ");
                    sb.append("\"stats\": ").append(strArr(t.stats));
                    sb.append(" }").append(j + 1 < m.tiers.size() ? "," : "").append("\n");
                }
                sb.append("      ]");
            }
            sb.append("\n    }").append(++i < catalog.size() ? "," : "").append("\n");
        }
        sb.append("  ]\n}\n");
        return sb.toString();
    }

    private static String renderBases(String patch, String generated, TreeMap<String, BaseRecord> bases) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"patch\": ").append(str(patch)).append(",\n");
        sb.append("  \"generated\": ").append(str(generated)).append(",\n");
        sb.append("  \"source\": ").append(str(SOURCE_NOTE)).append(",\n");
        sb.append("  \"count\": ").append(bases.size()).append(",\n");
        sb.append("  \"items\": [\n");
        int i = 0;
        for (BaseRecord b : bases.values()) {
            sb.append("    {\n");
            sb.append("      \"id\": ").append(str(b.id)).append(",\n");
            sb.append("      \"name\": ").append(str(b.name)).append(",\n");
            sb.append("      \"category\": ").append(str(b.category)).append(",\n");
            sb.append("      \"pools\": {\n");
            sb.append("        \"normal\": ").append(pool(b.normalPrefixes, b.normalSuffixes)).append(",\n");
            sb.append("        \"desecrated\": ").append(pool(b.desecratedPrefixes, b.desecratedSuffixes)).append(",\n");
            sb.append("        \"essence\": ").append(pool(b.essencePrefixes, b.essenceSuffixes)).append("\n");
            sb.append("      }\n");
            sb.append("    }").append(++i < bases.size() ? "," : "").append("\n");
        }
        sb.append("  ]\n}\n");
        return sb.toString();
    }

    private static String renderEssences(String patch, String generated, TreeMap<String, EssenceRecord> essences) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"patch\": ").append(str(patch)).append(",\n");
        sb.append("  \"generated\": ").append(str(generated)).append(",\n");
        sb.append("  \"source\": ").append(str(
                "DERIVED from mods.json essence/perfect_essence mods (Java has no essence data table; "
                        + "Essence_currency.java discovers essences from mod tier names at runtime)")).append(",\n");
        sb.append("  \"count\": ").append(essences.size()).append(",\n");
        sb.append("  \"essences\": [\n");
        int i = 0;
        for (EssenceRecord e : essences.values()) {
            sb.append("    {\n");
            sb.append("      \"name\": ").append(str(e.name)).append(",\n");
            sb.append("      \"tiers\": {");
            // Emit present strengths in canonical order.
            List<String> present = new ArrayList<>();
            for (String t : ESSENCE_TIERS) if (e.tiers.containsKey(t)) present.add(t);
            if (present.isEmpty()) {
                sb.append("}");
            } else {
                sb.append("\n");
                for (int j = 0; j < present.size(); j++) {
                    String t = present.get(j);
                    sb.append("        ").append(str(t)).append(": ")
                            .append(strArr(new ArrayList<>(e.tiers.get(t))))
                            .append(j + 1 < present.size() ? "," : "").append("\n");
                }
                sb.append("      }");
            }
            sb.append("\n    }").append(++i < essences.size() ? "," : "").append("\n");
        }
        sb.append("  ]\n}\n");
        return sb.toString();
    }

    private static String pool(List<String> prefixes, List<String> suffixes) {
        return "{ \"prefixes\": " + strArrInline(prefixes) + ", \"suffixes\": " + strArrInline(suffixes) + " }";
    }

    private static String strArr(List<String> xs) {
        if (xs == null || xs.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < xs.size(); i++) {
            sb.append(str(xs.get(i)));
            if (i + 1 < xs.size()) sb.append(", ");
        }
        return sb.append("]").toString();
    }

    // Same as strArr but each element on its own indented line (used for base pools which can be long).
    private static String strArrInline(List<String> xs) {
        if (xs == null || xs.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < xs.size(); i++) {
            sb.append("          ").append(str(xs.get(i)));
            sb.append(i + 1 < xs.size() ? ",\n" : "\n");
        }
        sb.append("        ]");
        return sb.toString();
    }

    private static String rangeArr(List<Number[]> ranges) {
        if (ranges == null || ranges.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < ranges.size(); i++) {
            Number[] r = ranges.get(i);
            sb.append("[").append(num(r[0])).append(", ").append(num(r[1])).append("]");
            if (i + 1 < ranges.size()) sb.append(", ");
        }
        return sb.append("]").toString();
    }

    /** Preserve the original numeric type: Integer/Long -> "14", Double/Float -> "5.0". */
    private static String num(Number n) {
        if (n instanceof Double || n instanceof Float) {
            return n.toString();
        }
        return Long.toString(n.longValue());
    }

    private static String str(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append("\"").toString();
    }

    private DataExtractor() {}
}
