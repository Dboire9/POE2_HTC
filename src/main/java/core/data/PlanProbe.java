package core.data;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.AnnulProbability;
import core.Crafting.Probabilities.EssenceProbability;
import core.Crafting.Probabilities.ExaltAndRegalProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.AugmentationOrb;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Currency.TransmutationOrb;
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
 * Differential fixture for the PLAN EVALUATOR (Phase 2). It validates that the TS engine threads
 * item state through a crafting sequence and composes per-step probabilities into the same
 * cumulative product as Java.
 *
 * Per-step probabilities are computed via the base-floor / all-tiers model both engines agree on
 * (adds → NormalCompute(ilvl=0, isDesired=false); annul → ComputePercentageAnnul(None)) at item
 * level 100, exactly like the green transmute/annul differentials. This isolates the NEW Phase-2
 * logic — state threading (affix counts, slot-branch selection, removals) and composition — from
 * Java's currency-tier "best floor" selection, which uses the unfloored-numerator quirk (D1 in
 * docs/validation.md) and is deferred.
 *
 * Usage: PlanProbe <patchDir> <plansFile> <outFile>
 */
public final class PlanProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path plansFile = Path.of(args[1]);
        Path outFile = Path.of(args[2]);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        Map<String, Modifier> byId = repo.mods();

        JsonObject root;
        try (Reader r = Files.newBufferedReader(plansFile)) {
            root = JsonParser.parseReader(r).getAsJsonObject();
        }
        JsonArray plans = root.getAsJsonArray("plans");

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"plans\": {\n");
        List<String> planBlocks = new ArrayList<>();
        for (int p = 0; p < plans.size(); p++) {
            JsonObject plan = plans.get(p).getAsJsonObject();
            String name = plan.get("name").getAsString();
            Item_base base = repo.getBase(plan.get("base").getAsString());
            Crafting_Item baseItem = new Crafting_Item(base); // level 100
            List<Modifier> prefixes = base.getNormalAllowedPrefixes();
            List<Modifier> suffixes = base.getNormalAllowedSuffixes();

            Crafting_Candidate candidate = new Crafting_Candidate();
            candidate.base = base;
            candidate.level = 100;
            candidate.modifierHistory = new ArrayList<>();

            JsonArray steps = plan.getAsJsonArray("steps");
            List<Double> perStep = new ArrayList<>();
            double total = 1.0;

            for (int s = 0; s < steps.size(); s++) {
                JsonObject step = steps.get(s).getAsJsonObject();
                String currency = step.get("currency").getAsString();
                int i = candidate.modifierHistory.size();

                double prob;
                if (currency.equals("annul")) {
                    Modifier target = byId.get(step.get("remove").getAsString());
                    Map<Crafting_Action, Double> src = new HashMap<>();
                    src.put(new AnnulmentOrb(), 0.0);
                    ModifierEvent ev = new ModifierEvent(target, null, src, ModifierEvent.ActionType.REMOVED);
                    candidate.modifierHistory.add(ev);
                    prob = AnnulProbability.ComputePercentageAnnul(baseItem, candidate, ev, AnnulmentOrb.Omen.None, i);
                } else if (currency.equals("perfect-essence")) {
                    Modifier added = byId.get(step.get("add").getAsString());
                    Modifier removed = byId.get(step.get("remove").getAsString());
                    Map<Crafting_Action, Double> src = new HashMap<>();
                    src.put(new Essence_currency(), 0.0);
                    ModifierEvent ev = new ModifierEvent(added, added.tiers.get(0), src, ModifierEvent.ActionType.CHANGED, removed);
                    candidate.modifierHistory.add(ev);
                    prob = EssenceProbability.ComputePercentageEssence(baseItem, candidate, ev, Essence_currency.Omen.None, i);
                } else {
                    Modifier m = byId.get(step.get("add").getAsString());
                    Map<Crafting_Action, Double> src = new HashMap<>();
                    src.put(actionFor(currency), 0.0);
                    ModifierEvent ev = new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);
                    candidate.modifierHistory.add(ev);
                    prob = ExaltAndRegalProbability.NormalCompute(baseItem, candidate, ev, 0, i, prefixes, suffixes, false);
                }
                perStep.add(prob);
                total *= prob;
            }

            StringBuilder pb = new StringBuilder();
            pb.append("    \"").append(name).append("\": { \"steps\": [");
            for (int s = 0; s < perStep.size(); s++) pb.append(s == 0 ? "" : ", ").append(perStep.get(s));
            pb.append("], \"total\": ").append(total).append(" }");
            planBlocks.add(pb.toString());
        }
        sb.append(String.join(",\n", planBlocks)).append("\n  }\n}\n");

        if (outFile.getParent() != null) Files.createDirectories(outFile.getParent());
        Files.writeString(outFile, sb.toString(), StandardCharsets.UTF_8);
        System.out.println("wrote " + outFile + " (" + planBlocks.size() + " plans)");
    }

    private static Crafting_Action actionFor(String currency) {
        switch (currency) {
            case "transmute": return new TransmutationOrb();
            case "augment": return new AugmentationOrb();
            case "regal": return new RegalOrb();
            case "exalt": return new ExaltedOrb();
            default: throw new IllegalArgumentException("unknown add currency: " + currency);
        }
    }

    private PlanProbe() {}
}
