package core.data;

import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.Probabilities.ExaltAndRegalProbability;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.TransmutationOrb;
import core.Items.Item_base;
import core.Modifier_class.Modifier;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;

/**
 * Differential-test fixture generator. For each normal-pool mod of a base, computes the Java
 * engine's transmute probability (white item, any tier) via the real
 * {@code ExaltAndRegalProbability.NormalCompute} and writes {modId -> probability} as JSON.
 *
 * The TS engine loads the SAME patch data, so packages/engine's differential test can assert its
 * transmuteProbability matches these numbers exactly (CLAUDE.md: TS must match Java before Java is
 * retired).
 *
 * Usage: TransmuteProbe <patchDir> <outFile> <baseId...>
 */
public final class TransmuteProbe {

    public static void main(String[] args) throws Exception {
        Path patchDir = Path.of(args[0]);
        Path outFile = Path.of(args[1]);
        String[] baseIds = new String[args.length - 2];
        System.arraycopy(args, 2, baseIds, 0, baseIds.length);

        JsonItemRepository repo = JsonItemRepository.load(patchDir);
        IdentityHashMap<Modifier, String> idOf = new IdentityHashMap<>();
        for (Map.Entry<String, Modifier> e : repo.mods().entrySet()) idOf.put(e.getValue(), e.getKey());

        StringBuilder sb = new StringBuilder();
        sb.append("{\n  \"patch\": \"").append(repo.patch).append("\",\n  \"bases\": {\n");
        for (int b = 0; b < baseIds.length; b++) {
            String baseId = baseIds[b];
            Item_base base = repo.getBase(baseId);
            if (base == null) throw new IllegalArgumentException("no base " + baseId + " in " + patchDir);
            Crafting_Item baseItem = new Crafting_Item(base); // level 100, NORMAL

            List<Modifier> prefixes = base.getNormalAllowedPrefixes();
            List<Modifier> suffixes = base.getNormalAllowedSuffixes();
            List<Modifier> all = new ArrayList<>();
            all.addAll(prefixes);
            all.addAll(suffixes);

            sb.append("    \"").append(baseId).append("\": {\n");
            for (int k = 0; k < all.size(); k++) {
                Modifier m = all.get(k);
                Crafting_Candidate candidate = new Crafting_Candidate();
                candidate.base = base;
                candidate.rarity = Crafting_Item.ItemRarity.NORMAL;
                candidate.level = 100;
                Map<core.Crafting.Crafting_Action, Double> src = new HashMap<>();
                src.put(new TransmutationOrb(), 0.0);
                ModifierEvent ev = new ModifierEvent(m, m.tiers.get(0), src, ModifierEvent.ActionType.ADDED);
                candidate.modifierHistory.add(ev);

                double p = ExaltAndRegalProbability.NormalCompute(
                        baseItem, candidate, ev, 0, 0, prefixes, suffixes, false);

                String id = idOf.get(m);
                sb.append("      \"").append(id).append("\": ").append(p);
                sb.append(k + 1 < all.size() ? ",\n" : "\n");
            }
            sb.append("    }").append(b + 1 < baseIds.length ? ",\n" : "\n");
        }
        sb.append("  }\n}\n");

        write(outFile, sb.toString());
        System.out.println("wrote " + outFile + " for bases: " + String.join(", ", baseIds));
    }

    private static void write(Path p, String s) throws IOException {
        if (p.getParent() != null) Files.createDirectories(p.getParent());
        Files.writeString(p, s, StandardCharsets.UTF_8);
    }

    private TransmuteProbe() {}
}
