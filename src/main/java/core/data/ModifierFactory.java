package core.data;

import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
import core.Modifier_class.Pair;
import core.data.PatchData.ModJson;
import core.data.PatchData.TierJson;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds engine {@link Modifier} objects from {@link ModJson} records. The output is intended to be
 * identical to the hardcoded {@code Modifiers_*} statics (see {@link DataRoundTripCheck}).
 */
public final class ModifierFactory {

    public Modifier build(ModJson j) {
        List<ModifierTier> tiers = new ArrayList<>(j.tiers.size());
        for (TierJson t : j.tiers) {
            // Every tier has at least one range; extra ranges/stats are set directly (fields are public).
            ModifierTier mt = new ModifierTier(
                    t.name, t.ilvl, t.weight, pair(t.ranges, 0));
            mt.minMax2 = pair(t.ranges, 1);
            mt.minMax3 = pair(t.ranges, 2);
            mt.minMax4 = pair(t.ranges, 3);
            mt.stat1 = stat(t.stats, 0);
            mt.stat2 = stat(t.stats, 1);
            mt.stat3 = stat(t.stats, 2);
            mt.stat4 = stat(t.stats, 3);
            tiers.add(mt);
        }

        String primary = j.categories.isEmpty() ? "" : j.categories.get(0);
        Modifier m = new Modifier(
                primary,
                new ArrayList<>(j.tags),
                tiers,
                type(j.type),
                source(j.source),
                j.family,
                j.text);
        // Hybrid categories 2..4 (the 7-arg constructor leaves these as "").
        if (j.categories.size() > 1) m.secondaryCategory = j.categories.get(1);
        if (j.categories.size() > 2) m.thirdCategory = j.categories.get(2);
        if (j.categories.size() > 3) m.fourthCategory = j.categories.get(3);
        return m;
    }

    private static Pair<Number, Number> pair(List<Number[]> ranges, int i) {
        if (ranges == null || i >= ranges.size()) return null;
        Number[] r = ranges.get(i);
        return new Pair<>(r[0], r[1]);
    }

    private static String stat(List<String> stats, int i) {
        // The ModifierTier constructors default unused stats to "" — mirror that for absent entries.
        return (stats != null && i < stats.size()) ? stats.get(i) : "";
    }

    private static Modifier.ModifierType type(String s) {
        switch (s) {
            case "prefix": return Modifier.ModifierType.PREFIX;
            case "suffix": return Modifier.ModifierType.SUFFIX;
            default: throw new IllegalArgumentException("Unknown modifier type: " + s);
        }
    }

    private static Modifier.ModifierSource source(String s) {
        switch (s) {
            case "normal": return Modifier.ModifierSource.NORMAL;
            case "desecrated": return Modifier.ModifierSource.DESECRATED;
            case "essence": return Modifier.ModifierSource.ESSENCE;
            case "perfect_essence": return Modifier.ModifierSource.PERFECT_ESSENCE;
            default: throw new IllegalArgumentException("Unknown modifier source: " + s);
        }
    }
}
