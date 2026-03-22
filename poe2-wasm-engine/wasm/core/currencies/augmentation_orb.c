#include "augmentation_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include "../crafting/crafting_helpers.h"
#include <string.h>

bool augmentation_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    if (state->rarity != 1) {
        if (error_out) strcpy(error_out, "Augmentation Orb requires Magic item");
        return false;
    }
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 2) {
        if (error_out) strcpy(error_out, "Augmentation Orb requires item with fewer than 2 mods");
        return false;
    }
    
    return true;
}

void augmentation_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    // Must be Magic with 0 or 1 mods
    if (state->rarity != 1) return;
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods >= 2) return;
    
    // Determine what type(s) to add
    bool can_add_prefix = (state->prefix_count < 1);  // Magic max 1 prefix
    bool can_add_suffix = (state->suffix_count < 1);   // Magic max 1 suffix
    
    // Calculate probability split: if both types available, 50/50
    double prefix_type_prob = 1.0;
    double suffix_type_prob = 1.0;
    if (can_add_prefix && can_add_suffix) {
        prefix_type_prob = 0.5;
        suffix_type_prob = 0.5;
    }
    
    if (can_add_prefix) {
        // Add a prefix
        int prefix_count = get_prefix_count(state->item_id, SOURCE_NORMAL);
        double total_weight = calc_available_prefix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
        
        for (int i = 0; i < prefix_count; i++) {
            ModifierLookup* lookup = get_prefix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            // Check family not already present
            if (has_mod_family(state, mod->name)) continue;
            
            // Create child
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.prefixes[state->prefix_count].source = lookup->source;
            child->state.prefixes[state->prefix_count].index = lookup->index;
            child->state.prefixes[state->prefix_count].tier = tier;
            child->state.prefix_count = state->prefix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            child->event.probability = (total_weight > 0) ?
                prefix_type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    if (can_add_suffix) {
        // Add a suffix
        int suffix_count = get_suffix_count(state->item_id, SOURCE_NORMAL);
        double total_weight = calc_available_suffix_weight(state->item_id, SOURCE_NORMAL, state, state->item_level);
        
        for (int i = 0; i < suffix_count; i++) {
            ModifierLookup* lookup = get_suffix_lookup(state->item_id, SOURCE_NORMAL, i);
            if (!lookup) continue;
            
            const Modifier* mod = get_mod_from_lookup(lookup);
            if (!mod) continue;
            
            int tier = get_applicable_tier_with_limit(mod, state->item_level, lookup->max_tier_index);
            if (tier < 0) continue;
            
            if (has_mod_family(state, mod->name)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.suffixes[state->suffix_count].source = lookup->source;
            child->state.suffixes[state->suffix_count].index = lookup->index;
            child->state.suffixes[state->suffix_count].tier = tier;
            child->state.suffix_count = state->suffix_count + 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            child->event.probability = (total_weight > 0) ?
                suffix_type_prob * (mod->tiers[tier].weight / total_weight) : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
}

const Currency AUGMENTATION_ORB = {
    .id = "augmentation",
    .name = "Orb of Augmentation",
    .available_omens = OMEN_NONE,
    .apply = augmentation_orb_apply,
    .validate = augmentation_orb_validate
};
