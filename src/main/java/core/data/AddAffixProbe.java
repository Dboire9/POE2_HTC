package core.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.ExaltAndRegalProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.TransmutationOrb;
import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * General differential-fixture generator for the add-affix probability (transmute/aug/regal/exalt
 * all share {@code ExaltAndRegalProbability.NormalCompute}). Reads a scenarios file describing item
 * states (a base + a list of already-placed mod ids), and for every LEGAL candidate mod (family not
 * present, side has an open slot) writes the Java probability. The TS engine reconstructs the same
 * states and must match.
 *
 * Usage: AddAffixProbe <patchDir> <scenariosFile> <outFile>
 */
public final class AddAffixProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path scenariosFile = Path.of(args[1]);
        Path outFile = Path.of(args[2]);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        Map<String, Modifier> byId = repo.mods();
        IdentityHashMap<Modifier, String> idOf = new IdentityHashMap<>();
        for (Map.Entry<String, Modifier> e : byId.entrySet()) idOf.put(e.getValue(), e.getKey());

        JsonObject root;
        try (Reader r = Files.newBufferedReader(scenariosFile)) {
            root = JsonParser.parseReader(r).getAsJsonObject();
        }
        JsonArray scenarios = root.getAsJsonArray("scenarios");

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"scenarios\": {\n");
        for (int s = 0; s < scenarios.size(); s++) {
            JsonObject sc = scenarios.get(s).getAsJsonObject();
            String name = sc.get("name").getAsString();
            String baseId = sc.get("base").getAsString();
            Item_base base = repo.getBase(baseId);
            if (base == null) throw new IllegalArgumentException("no base " + baseId);
            Crafting_Item baseItem = new Crafting_Item(base); // level 100

            // Resolve placed mods, count sides, collect families, build the ADDED history prefix.
            List<Modifier> placed = new ArrayList<>();
            for (var el : sc.getAsJsonArray("placed")) {
                Modifier m = byId.get(el.getAsString());
                if (m == null) throw new IllegalArgumentException("placed mod not found: " + el.getAsString());
                placed.add(m);
            }
            int placedPrefixes = 0, placedSuffixes = 0;
            Set<String> placedFamilies = new HashSet<>();
            List<ModifierEvent> history = new ArrayList<>();
            for (Modifier m : placed) {
                if (m.type == ModifierType.PREFIX) placedPrefixes++; else placedSuffixes++;
                placedFamilies.add(m.family);
                history.add(event(m));
            }
            int idx = placed.size();

            List<Modifier> prefixes = base.getNormalAllowedPrefixes();
            List<Modifier> suffixes = base.getNormalAllowedSuffixes();
            List<Modifier> pool = new ArrayList<>();
            pool.addAll(prefixes);
            pool.addAll(suffixes);

            sb.append("    \"").append(name).append("\": {\n");
            List<String> lines = new ArrayList<>();
            for (Modifier m : pool) {
                // Legality gate mirrors Crafting_Item.addAffixes (family not present, slot open).
                if (placedFamilies.contains(m.family)) continue;
                if (m.type == ModifierType.PREFIX && placedPrefixes >= 3) continue;
                if (m.type == ModifierType.SUFFIX && placedSuffixes >= 3) continue;

                // Currency-strength floors (base/greater/perfect) and the omen side-constraint
                // (Sinistral = prefix-only pool, Dextral = suffix-only). All use the isDesired=true
                // numerator (chosenTier = lowest) so the weight is floored by ilvl, matching the TS
                // engine — the isDesired=FALSE path does NOT floor and is a Java inconsistency.
                double base0 = nc(base, baseItem, m, history, idx, 0, prefixes, suffixes);
                double greater = nc(base, baseItem, m, history, idx, 35, prefixes, suffixes);
                double perfect = nc(base, baseItem, m, history, idx, 50, prefixes, suffixes);
                StringBuilder v = new StringBuilder();
                v.append("      \"").append(idOf.get(m)).append("\": { \"base\": ").append(base0)
                        .append(", \"greater\": ").append(greater).append(", \"perfect\": ").append(perfect);
                if (m.type == ModifierType.PREFIX) {
                    v.append(", \"sinistral\": ").append(nc(base, baseItem, m, history, idx, 0, prefixes, null));
                } else {
                    v.append(", \"dextral\": ").append(nc(base, baseItem, m, history, idx, 0, null, suffixes));
                }
                v.append(" }");
                lines.add(v.toString());
            }
            for (int k = 0; k < lines.size(); k++) sb.append(lines.get(k)).append(k + 1 < lines.size() ? ",\n" : "\n");
            sb.append("    }").append(s + 1 < scenarios.size() ? ",\n" : "\n");
        }
        sb.append("  }\n}\n");

        if (outFile.getParent() != null) Files.createDirectories(outFile.getParent());
        Files.writeString(outFile, sb.toString(), StandardCharsets.UTF_8);
        System.out.println("wrote " + outFile + " (" + scenarios.size() + " scenarios)");
    }

    /**
     * NormalCompute for one candidate: isDesired=true with chosenTier=lowest, so the numerator sums
     * all of the mod's tiers with ilvl >= floor (floored, matching the TS engine). Pass null for a
     * pool to model an omen side-constraint (Sinistral = prefix-only, Dextral = suffix-only).
     */
    private static double nc(Item_base base, Crafting_Item baseItem, Modifier m, List<ModifierEvent> history,
                             int idx, int floor, List<Modifier> pre, List<Modifier> suf) {
        Crafting_Candidate candidate = new Crafting_Candidate();
        candidate.base = base;
        candidate.rarity = Crafting_Item.ItemRarity.MAGIC;
        candidate.level = 100;
        candidate.modifierHistory = new ArrayList<>(history);
        ModifierEvent ev = event(m);
        candidate.modifierHistory.add(ev);
        m.chosenTier = m.tiers.size() - 1; // -> chosenTierIndex 0 -> sum all tiers >= floor
        return ExaltAndRegalProbability.NormalCompute(baseItem, candidate, ev, floor, idx, pre, suf, true);
    }

    private static ModifierEvent event(Modifier m) {
        Map<Crafting_Action, Double> src = new HashMap<>();
        src.put(new TransmutationOrb(), 0.0);
        return new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);
    }

    private AddAffixProbe() {}
}
