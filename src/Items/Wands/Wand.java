package Items.Wands;

import Item_modifiers.OneHand_Item_modifiers.Wands_Item_modifiers.*;

import java.util.ArrayList;

public class Wand extends Wand_Item {

    public Wand() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_SPELL_DAMAGE_AND_MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_FIRE_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_COLD_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_LIGHTNING_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_CHAOS_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PHYSICAL_SPELL_DAMAGE);
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
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_COMPANION_SPELL_DAMAGE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_ELEMENTAL_DAMAGE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SPELL_DAMAGE_LIFE_COST);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_MAGNITUDE_BLEEDING);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_DAMAGE_AS_EXTRA_PHYSICAL_DAMAGE);
        
        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HINDERED_ENEMY_INCREASED_ELEMENTAL_DAMAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HINDERED_ENEMY_INCREASED_CHAOS_DAMAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HINDERED_ENEMY_INCREASED_PHYSICAL_DAMAGE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPELL_AREA_OF_EFFECT);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPELL_LIFE_COST_AND_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_HYBRID_INCREASED_CAST_SPEED_FULL_MANA_AND_DIFFERENT_SPELLS);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_BREAK_INCREASED_ARMOUR);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_BREAK_ARMOUR_ON_CRIT);
        
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
