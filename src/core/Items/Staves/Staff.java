package core.Items.Staves;

import core.Item_modifiers.TwoHand_Item_modifiers.Staves_Item_modifiers.*;

import java.util.ArrayList;

public class Staff extends Staff_Item{
    public Staff() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_FIRE_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_COLD_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_LIGHTNING_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_CHAOS_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_PHYSICAL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.DAMAGE_AS_EXTRA_FIRE_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.DAMAGE_AS_EXTRA_COLD_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.DAMAGE_AS_EXTRA_LIGHTNING_DAMAGE);

        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_SPELL_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.PHYSICAL_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_REGENERATION_RATE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CAST_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_HIT_CHANCE_SPELLS);
        Normal_allowedSuffixes.add(Modifiers_normal.CRITICAL_SPELL_DAMAGE_BONUS);
        Normal_allowedSuffixes.add(Modifiers_normal.HYBRID_MANA_REGENERATION_RATE_LIGHT_RADIUS);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_FLAMMABILITY_MAGNITUDE);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_FREEZE_BUILDUP);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_SHOCK_CHANCE);


        Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_BASE_SPIRIT);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SPELL_DAMAGE_COST_LIFE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SPELL_DAMAGE_PER_100_MANA);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SPELL_DAMAGE_PER_100_LIFE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_ELEMENTAL_INFUSION);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_MAGNITUDE_AILMENT_EFFECT);

        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ARCHON_DURATION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_BLOCK_CHANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SKILL_LIFE_COST);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ARCHON_DELAY_RECOVERY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CAST_SPEED_ON_LOW_LIFE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE);
    
        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_SPELL_DAMAGE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);


        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ALL_SPELL_SKILL_LEVEL);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_SPELL_CRIT_CHANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_INCREASED_CAST_SPEED);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_MANA_COST_EFFICIENCY);
    
    }
}
