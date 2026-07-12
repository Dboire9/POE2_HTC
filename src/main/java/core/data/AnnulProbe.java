package core.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.AnnulProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Items.Item_base;
import core.Modifier_class.Modifier;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Differential fixture for annulment. For each scenario with placed mods, treats each placed mod as
 * the annul target and records the Java probability of removing it, for the None / Sinistral /
 * Dextral omens (Light needs a desecrated item — deferred). The TS engine must match.
 *
 * Usage: AnnulProbe <patchDir> <scenariosFile> <outFile>
 */
public final class AnnulProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path scenariosFile = Path.of(args[1]);
        Path outFile = Path.of(args[2]);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        Map<String, Modifier> byId = repo.mods();

        JsonObject root;
        try (Reader r = Files.newBufferedReader(scenariosFile)) {
            root = JsonParser.parseReader(r).getAsJsonObject();
        }
        JsonArray scenarios = root.getAsJsonArray("scenarios");

        AnnulmentOrb.Omen[] omens = {
            AnnulmentOrb.Omen.None, AnnulmentOrb.Omen.OmenofSinistralAnnulment, AnnulmentOrb.Omen.OmenofDextralAnnulment,
        };
        String[] omenKeys = { "none", "sinistral", "dextral" };

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"scenarios\": {\n");
        List<String> scenarioBlocks = new ArrayList<>();
        for (int s = 0; s < scenarios.size(); s++) {
            JsonObject sc = scenarios.get(s).getAsJsonObject();
            String name = sc.get("name").getAsString();
            Item_base base = repo.getBase(sc.get("base").getAsString());
            Crafting_Item baseItem = new Crafting_Item(base);

            List<Modifier> placed = new ArrayList<>();
            for (var el : sc.getAsJsonArray("placed")) placed.add(byId.get(el.getAsString()));
            if (placed.isEmpty()) continue; // nothing to annul

            List<ModifierEvent> placedEvents = new ArrayList<>();
            for (Modifier m : placed) placedEvents.add(addedEvent(m));
            int i = placedEvents.size();

            List<String> modLines = new ArrayList<>();
            for (Modifier target : placed) {
                Crafting_Candidate candidate = new Crafting_Candidate();
                candidate.base = base;
                candidate.rarity = Crafting_Item.ItemRarity.RARE;
                candidate.level = 100;
                candidate.modifierHistory = new ArrayList<>(placedEvents);
                Map<Crafting_Action, Double> src = new HashMap<>();
                src.put(new AnnulmentOrb(), 0.0);
                ModifierEvent removed = new ModifierEvent(target, null, src, ModifierEvent.ActionType.REMOVED);
                candidate.modifierHistory.add(removed);

                StringBuilder v = new StringBuilder("      \"" + id(byId, target) + "\": {");
                for (int o = 0; o < omens.length; o++) {
                    double p = AnnulProbability.ComputePercentageAnnul(baseItem, candidate, removed, omens[o], i);
                    v.append(o == 0 ? " " : ", ").append('"').append(omenKeys[o]).append("\": ").append(p);
                }
                v.append(" }");
                modLines.add(v.toString());
            }
            scenarioBlocks.add("    \"" + name + "\": {\n" + String.join(",\n", modLines) + "\n    }");
        }
        sb.append(String.join(",\n", scenarioBlocks)).append("\n  }\n}\n");

        if (outFile.getParent() != null) Files.createDirectories(outFile.getParent());
        Files.writeString(outFile, sb.toString(), StandardCharsets.UTF_8);
        System.out.println("wrote " + outFile + " (" + scenarioBlocks.size() + " scenarios with mods)");
    }

    private static ModifierEvent addedEvent(Modifier m) {
        Map<Crafting_Action, Double> src = new HashMap<>();
        src.put(new AnnulmentOrb(), 0.0);
        return new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);
    }

    private static String id(Map<String, Modifier> byId, Modifier m) {
        for (Map.Entry<String, Modifier> e : byId.entrySet()) if (e.getValue() == m) return e.getKey();
        throw new IllegalStateException("mod id not found");
    }

    private AnnulProbe() {}
}
