#include "annulment_orb.h"
#include "../modifiers.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include <string.h>

bool annulment_orb_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    int total_mods = state->prefix_count + state->suffix_count;
    
    if (total_mods == 0) {
        if (error_out) strcpy(error_out, "Item has no modifiers to remove");
        return false;
    }
    
    if (state->rarity == 0) {
        if (error_out) strcpy(error_out, "Annulment Orb requires Magic or Rare item");
        return false;
    }
    
    return true;
}

void annulment_orb_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods == 0 || state->rarity == 0) return;
    
    // Check omens
    bool remove_prefix_only = (context->selected_omens & OMEN_ANNULMENT_SINISTRAL) != 0;
    bool remove_suffix_only = (context->selected_omens & OMEN_ANNULMENT_DEXTRAL) != 0;
    
    if (remove_prefix_only && remove_suffix_only) {
        remove_prefix_only = false;
        remove_suffix_only = false;
    }
    
    // Generate children: one for each possible mod removal
    
    // Remove each prefix
    if (!remove_suffix_only) {
        for (int i = 0; i < state->prefix_count; i++) {
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            // Remove prefix at index i
            int removed_mod_id = state->prefixes[i].modifier_id;
            int removed_tier = state->prefixes[i].tier;
            
            // Shift remaining prefixes
            for (int j = i; j < state->prefix_count - 1; j++) {
                child->state.prefixes[j] = child->state.prefixes[j + 1];
            }
            child->state.prefix_count--;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = removed_mod_id;
            child->event.tier = removed_tier;
            child->event.action_type = ACTION_REMOVED;
            child->event.currency_name = "Orb of Annulment";
            
            // Probability: 1 / total_mods (or 1 / prefix_count if omen)
            if (remove_prefix_only) {
                child->event.probability = 1.0 / (double)state->prefix_count;
            } else {
                child->event.probability = 1.0 / (double)total_mods;
            }
            
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
    
    // Remove each suffix
    if (!remove_prefix_only) {
        for (int i = 0; i < state->suffix_count; i++) {
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            
            int removed_mod_id = state->suffixes[i].modifier_id;
            int removed_tier = state->suffixes[i].tier;
            
            // Shift remaining suffixes
            for (int j = i; j < state->suffix_count - 1; j++) {
                child->state.suffixes[j] = child->state.suffixes[j + 1];
            }
            child->state.suffix_count--;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = removed_mod_id;
            child->event.tier = removed_tier;
            child->event.action_type = ACTION_REMOVED;
            child->event.currency_name = "Orb of Annulment";
            
            if (remove_suffix_only) {
                child->event.probability = 1.0 / (double)state->suffix_count;
            } else {
                child->event.probability = 1.0 / (double)total_mods;
            }
            
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    }
}

const Currency ANNULMENT_ORB = {
    .id = "annulment",
    .name = "Orb of Annulment",
    .available_omens = OMEN_ANNULMENT_SINISTRAL | OMEN_ANNULMENT_DEXTRAL | OMEN_ANNULMENT_LIGHT,
    .apply = annulment_orb_apply,
    .validate = annulment_orb_validate
};
