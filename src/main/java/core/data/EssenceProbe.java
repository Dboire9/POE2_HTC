package core.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.EssenceProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Essence_currency;
import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierType;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Differential fixture for the PERFECT essence remove-and-add. A perfect essence adds its guaranteed
 * mod (deterministic) while removing one random existing mod; this probes the random-remove
 * probability {@code EssenceProbability.ComputePercentageEssence} for the None / Sinistral / Dextral
 * omens. For each scenario with placed mods we vary the guaranteed mod's slot (essenceType ∈
 * {prefix, suffix}) and treat each placed mod as the removed (changed) mod. The TS engine's
 * {@code perfectEssenceProbability} must match.
 *
 * Usage: EssenceProbe <patchDir> <scenariosFile> <outFile>
 */
public final class EssenceProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path scenariosFile = Path.of(args[1]);
        Path outFile = Path.of(args[2]);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        Map<String, Modifier> byId = repo.mods();

        // Representative essence mods of each slot — only .type is read by ComputePercentageEssence.
        Modifier essencePrefix = firstOfType(byId, ModifierType.PREFIX);
        Modifier essenceSuffix = firstOfType(byId, ModifierType.SUFFIX);

        JsonObject root;
        try (Reader r = Files.newBufferedReader(scenariosFile)) {
            root = JsonParser.parseReader(r).getAsJsonObject();
        }
        JsonArray scenarios = root.getAsJsonArray("scenarios");

        Essence_currency.Omen[] omens = {
            Essence_currency.Omen.None,
            Essence_currency.Omen.OmenofSinistralCrystallisation,
            Essence_currency.Omen.OmenofDextralCrystallisation,
        };
        String[] omenKeys = { "none", "sinistral", "dextral" };
        ModifierType[] essenceTypes = { ModifierType.PREFIX, ModifierType.SUFFIX };
        String[] essenceTypeKeys = { "prefix", "suffix" };

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"scenarios\": {\n");
        List<String> scenarioBlocks = new ArrayList<>();
        for (int s = 0; s < scenarios.size(); s++) {
            JsonObject sc = scenarios.get(s).getAsJsonObject();
            String name = sc.get("name").getAsString();
            Item_base base = repo.getBase(sc.get("base").getAsString());

            List<Modifier> placed = new ArrayList<>();
            for (var el : sc.getAsJsonArray("placed")) placed.add(byId.get(el.getAsString()));
            if (placed.isEmpty()) continue; // nothing to remove

            List<ModifierEvent> placedEvents = new ArrayList<>();
            for (Modifier m : placed) placedEvents.add(addedEvent(m));
            int i = placedEvents.size();

            List<String> typeBlocks = new ArrayList<>();
            for (int t = 0; t < essenceTypes.length; t++) {
                Modifier essenceMod = essenceTypes[t] == ModifierType.PREFIX ? essencePrefix : essenceSuffix;
                List<String> modLines = new ArrayList<>();
                for (Modifier target : placed) {
                    Crafting_Item baseItem = new Crafting_Item(base);
                    Crafting_Candidate candidate = new Crafting_Candidate();
                    candidate.base = base;
                    candidate.rarity = Crafting_Item.ItemRarity.RARE;
                    candidate.level = 100;
                    candidate.modifierHistory = new ArrayList<>();
                    for (ModifierEvent e : placedEvents) candidate.modifierHistory.add(e.copy());

                    Map<Crafting_Action, Double> src = new HashMap<>();
                    src.put(new Essence_currency(), 0.0);
                    ModifierEvent event = new ModifierEvent(
                        essenceMod, essenceMod.tiers.get(0), src, ModifierEvent.ActionType.CHANGED, target);
                    candidate.modifierHistory.add(event);

                    StringBuilder v = new StringBuilder("        \"" + id(byId, target) + "\": {");
                    for (int o = 0; o < omens.length; o++) {
                        double p = EssenceProbability.ComputePercentageEssence(baseItem, candidate, event, omens[o], i);
                        v.append(o == 0 ? " " : ", ").append('"').append(omenKeys[o]).append("\": ").append(p);
                    }
                    v.append(" }");
                    modLines.add(v.toString());
                }
                typeBlocks.add("      \"" + essenceTypeKeys[t] + "\": {\n" + String.join(",\n", modLines) + "\n      }");
            }
            scenarioBlocks.add("    \"" + name + "\": {\n" + String.join(",\n", typeBlocks) + "\n    }");
        }
        sb.append(String.join(",\n", scenarioBlocks)).append("\n  }\n}\n");

        if (outFile.getParent() != null) Files.createDirectories(outFile.getParent());
        Files.writeString(outFile, sb.toString(), StandardCharsets.UTF_8);
        System.out.println("wrote " + outFile + " (" + scenarioBlocks.size() + " scenarios with mods)");
    }

    private static Modifier firstOfType(Map<String, Modifier> byId, ModifierType type) {
        for (Modifier m : byId.values()) if (m.type == type) return m;
        throw new IllegalStateException("no modifier of type " + type);
    }

    private static ModifierEvent addedEvent(Modifier m) {
        Map<Crafting_Action, Double> src = new HashMap<>();
        src.put(new Essence_currency(), 0.0);
        return new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);
    }

    private static String id(Map<String, Modifier> byId, Modifier m) {
        for (Map.Entry<String, Modifier> e : byId.entrySet()) if (e.getValue() == m) return e.getKey();
        throw new IllegalStateException("mod id not found");
    }

    private EssenceProbe() {}
}
