package core.Items.Foci;

import core.Item_modifiers.Off_Hand_Item_modifiers.Foci_Item_modifiers.*;
import core.Items.*;

import java.util.ArrayList;

public class Foci extends Item_base{
    public Foci() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.MAXIMUM_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_FIRE_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_COLD_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_LIGHTNING_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_CHAOS_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_SPELL_PHYSICAL_DAMAGE);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PERCENT_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.BASE_ENERGY_SHIELD);
        Normal_allowedPrefixes.add(Modifiers_normal.HYBRID_INCREASED_PERCENT_ENERGY_SHIELD_AND_MANA);

        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.INTELLIGENCE);
        Normal_allowedSuffixes.add(Modifiers_normal.FIRE_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.COLD_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.LIGHTNING_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.CHAOS_RESISTANCE);
        Normal_allowedSuffixes.add(Modifiers_normal.REDUCED_ATTRIBUTE_REQUIREMENTS);
        Normal_allowedSuffixes.add(Modifiers_normal.ALL_SPELL_SKILL_LEVEL);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_REGENERATION_RATE);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CAST_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_HIT_CHANCE_SPELLS);
        Normal_allowedSuffixes.add(Modifiers_normal.CRITICAL_SPELL_DAMAGE_BONUS);
        Normal_allowedSuffixes.add(Modifiers_normal.ENERGY_SHIELD_RECHARGE_RATE);
        Normal_allowedSuffixes.add(Modifiers_normal.ENERGY_SHIELD_FASTER_START_RECHARGE);

        Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_OFFERING_EFFECT);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_CURSE_EFFECTIVENESS);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_SPELL_AREA_OF_EFFECT);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INVOCATED_SPELLS_INCREASED_DAMAGE);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_ADDITIONAL_SPELL_TOTEM);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_SPELL_DAMAGE_WHILE_MELEE_WEAPON);

        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_STRENGTH_AND_DEXTERITY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LEVEL_MINION_SKILL);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FASTER_CURSE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_FIRE_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_DEXTERITY_AND_INTELLIGENCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_COLD_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CHANCE_TO_GAIN_ADDITIONAL_INFUSION);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_LIGHTNING_AND_CHAOS_DAMAGE_RESISTANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SPELLS_FIRE_2_ADDITIONAL_PROJECTILE_CHANCE);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_SKILL_LIFE_COST);
    
        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_BASE_MAXIMUM_LIFE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ARMOUR);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_EVASION);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_PERCENT_ENERGY_SHIELD);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_SPELL_DAMAGE);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);

        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_CHAOS_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ALL_SPELL_SKILL_LEVEL);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ENERGY_SHIELD_REGENERATION);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_SPELL_CRITICAL_STRIKE_CHANCE_INCREASE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_FIRE_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_COLD_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_LIGHTNING_RESISTANCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_INCREASED_CAST_SPEED);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_MANA_COST_EFFICIENCY);
    
    }
}
