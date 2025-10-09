package core.Items.Sceptres;

import core.Item_modifiers.OneHand_Item_modifiers.Sceptres_Item_modifiers.*;

import java.util.ArrayList;

public class Sceptre extends Sceptre_Item {

    public Sceptre() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_DAMAGE_ALLIES);
        Normal_allowedPrefixes.add(Modifiers_normal.FIRE_DAMAGE_ALLIES);
        Normal_allowedPrefixes.add(Modifiers_normal.COLD_DAMAGE_ALLIES);
        Normal_allowedPrefixes.add(Modifiers_normal.LIGHTNING_DAMAGE_ALLIES);
        Normal_allowedPrefixes.add(Modifiers_normal.ALL_DAMAGE_ALLIES);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPIRIT);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_SPIRIT_MANA);
        
        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.STRENGTH);
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_ALL_RESISTANCES);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.MINION_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_LIFE_REGENERATION);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_INCREASED_ATTACK_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_INCREASED_CAST_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_INCREASED_CRIT_CHANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.ALLIES_INCREASED_CRIT_MULTIPLIER);
        Normal_allowedSuffixes.add(Modifiers_normal.HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_PRESENCE_RADIUS);
        Normal_allowedSuffixes.add(Modifiers_normal.MINIONS_INCREASED_LIFE);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ALLIES_INCREASED_DAMAGE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);
        
        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_AURA_SKILLS_MAGNITUDE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);

    }
}
