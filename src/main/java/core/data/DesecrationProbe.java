package core.data;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.DesProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Desecrated_currency;
import core.Items.Item_base;
import core.Modifier_class.Modifier;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Differential fixture for the BOSS-OMEN desecration path — the only desecration behaviour the Java
 * engine models. {@code DesProbability.ComputePercentageDesecrated_currency} yields, per boss omen,
 * {@code 1 / (count of that boss's desecrated mods of the added mod's slot)} when the added mod
 * carries the boss tag ({@code kurgal_mod}/{@code amanamu_mod}/{@code ulaman_mod}), else 0. For each
 * base we treat every desecrated-allowed mod as {@code event.modifier} and record the probability
 * for Blackblooded (kurgal) / Liege (amanamu) / Sovereign (ulaman). The TS engine's
 * {@code desecrationBossProbability} must match.
 *
 * NOTE: the plain (no-boss-omen) desecration that draws from the combined normal+desecrated pool is
 * NOT modelled by Java (its Omen enum has no None) — that is a deliberate, separately-tested engine
 * addition per the user's rule and is not part of this differential.
 *
 * Usage: DesecrationProbe <patchDir> <outFile> <base...>
 */
public final class DesecrationProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path outFile = Path.of(args[1]);
        String[] bases = new String[args.length - 2];
        System.arraycopy(args, 2, bases, 0, bases.length);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        Map<String, Modifier> byId = repo.mods();

        Desecrated_currency.Omen[] omens = {
            Desecrated_currency.Omen.OmenoftheBlackblooded,
            Desecrated_currency.Omen.OmenoftheLiege,
            Desecrated_currency.Omen.OmenoftheSovereign,
        };
        String[] omenKeys = { "blackblooded", "liege", "sovereign" };

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"bases\": {\n");
        List<String> baseBlocks = new ArrayList<>();
        for (String baseId : bases) {
            Item_base base = repo.getBase(baseId);
            Crafting_Item baseItem = new Crafting_Item(base);

            List<Modifier> desecrated = new ArrayList<>();
            desecrated.addAll(base.getDesecratedAllowedPrefixes());
            desecrated.addAll(base.getDesecratedAllowedSuffixes());

            List<String> modLines = new ArrayList<>();
            for (Modifier m : desecrated) {
                Map<Crafting_Action, Double> src = new HashMap<>();
                src.put(new Desecrated_currency(), 0.0);
                ModifierEvent event = new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);

                Crafting_Candidate candidate = new Crafting_Candidate();
                candidate.base = base;
                candidate.rarity = Crafting_Item.ItemRarity.RARE;
                candidate.level = 100;
                candidate.modifierHistory = new ArrayList<>();
                candidate.modifierHistory.add(event);

                StringBuilder v = new StringBuilder("      \"" + id(byId, m) + "\": {");
                for (int o = 0; o < omens.length; o++) {
                    double p = DesProbability.ComputePercentageDesecrated_currency(baseItem, candidate, event, omens[o], 0);
                    v.append(o == 0 ? " " : ", ").append('"').append(omenKeys[o]).append("\": ").append(p);
                }
                v.append(" }");
                modLines.add(v.toString());
            }
            baseBlocks.add("    \"" + baseId + "\": {\n" + String.join(",\n", modLines) + "\n    }");
        }
        sb.append(String.join(",\n", baseBlocks)).append("\n  }\n}\n");

        if (outFile.getParent() != null) Files.createDirectories(outFile.getParent());
        Files.writeString(outFile, sb.toString(), StandardCharsets.UTF_8);
        System.out.println("wrote " + outFile + " (" + baseBlocks.size() + " bases)");
    }

    private static String id(Map<String, Modifier> byId, Modifier m) {
        for (Map.Entry<String, Modifier> e : byId.entrySet()) if (e.getValue() == m) return e.getKey();
        throw new IllegalStateException("mod id not found");
    }

    private DesecrationProbe() {}
}
