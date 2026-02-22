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
    if (total_mods != 1) {
        if (error_out) strcpy(error_out, "Augmentation Orb requires item with exactly 1 mod");
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
    
    // Must be Magic with exactly 1 mod
    if (state->rarity != 1) return;
    int total_mods = state->prefix_count + state->suffix_count;
    if (total_mods != 1) return;
    
    // Determine what type to add
    bool need_prefix = (state->prefix_count == 0);
    bool need_suffix = (state->suffix_count == 0);
    
    if (need_prefix) {
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
            child->state.prefixes[0].source = lookup->source;
            child->state.prefixes[0].index = lookup->index;
            child->state.prefixes[0].tier = tier;
            child->state.prefix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            child->event.probability = (total_weight > 0) ?
                mod->tiers[tier].weight / total_weight : 0.0;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    } else if (need_suffix) {
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
            child->state.suffixes[0].source = lookup->source;
            child->state.suffixes[0].index = lookup->index;
            child->state.suffixes[0].tier = tier;
            child->state.suffix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_source = lookup->source;
            child->event.modifier_index = lookup->index;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            child->event.probability = (total_weight > 0) ?
                mod->tiers[tier].weight / total_weight : 0.0;
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
