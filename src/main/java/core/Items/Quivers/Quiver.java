package main.java.core.Items.Quivers;


import main.java.core.Item_modifiers.Off_Hand_Item_modifiers.Quivers_Item_modifiers.*;

import java.util.ArrayList;


public class Quiver extends Quiver_Item {

    public Quiver() {
        Normal_allowedPrefixes = new ArrayList<>();
        Normal_allowedPrefixes.add(Modifiers_normal.PHYSICAL_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.FIRE_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.COLD_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.LIGHTNING_DAMAGE_FLAT);
        Normal_allowedPrefixes.add(Modifiers_normal.ACCURACY_RATING);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_PROJECTILE_SPEED);
        Normal_allowedPrefixes.add(Modifiers_normal.INCREASED_DAMAGE_WITH_BOW_SKILLS);

        Normal_allowedSuffixes = new ArrayList<>();
        Normal_allowedSuffixes.add(Modifiers_normal.DEXTERITY);
        Normal_allowedSuffixes.add(Modifiers_normal.LEVEL_PROJECTILE_SKILL);
        Normal_allowedSuffixes.add(Modifiers_normal.LIFE_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.MANA_PER_ENEMY_KILLED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_ATTACK_SPEED);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_HIT_CHANCE_FOR_ATTACKS);
        Normal_allowedSuffixes.add(Modifiers_normal.INCREASED_CRITICAL_DAMAGE_BONUS_FOR_ATTACKS);
        Normal_allowedSuffixes.add(Modifiers_normal.CHANCE_TO_PIERCE);


        Desecrated_allowedPrefixes = new ArrayList<>();
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_INCREASED_DAMAGE_WITH_HITS_WITHIN_2M);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_PROJECTILE_DAMAGE_FURTHER_6M);
        Desecrated_allowedPrefixes.add(Modifiers_desecrated.DESECRATED_PROJECTILE_SPEED_TO_DAMAGE);

        Desecrated_allowedSuffixes = new ArrayList<>();
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CRITICAL_DAMAGE_BONUS_WITHIN_2M);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_COST_EFFICIENCY);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_CRITICAL_STRIKE_CHANCE_INCREASE_FURTHER_6M);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_MANA_TO_LIFE_COST);
        Desecrated_allowedSuffixes.add(Modifiers_desecrated.DESECRATED_ADDITIONAL_PROJECTILES_WHILE_MOVING);

        Essences_allowedPrefixes = new ArrayList<>();
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_ACCURACY);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_INCREASED_DAMAGE_WITH_BOW_SKILLS);
        Essences_allowedPrefixes.add(Modifiers_essences.ESSENCE_ABYSS_PREFIX);

        Essences_allowedSuffixes = new ArrayList<>();
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_STRENGTH);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_DEXTERITY);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ATTRIBUTES_INTELLIGENCE);
        Essences_allowedSuffixes.add(Modifiers_essences.ESSENCE_ABYSS_SUFFIX);
    }
}