#include "augmentation_orb.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
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
        int prefix_count = itemPrefixCount(state->item_id, 0);
        
        for (int i = 0; i < prefix_count; i++) {
            int mod_idx = itemPrefixIndex(state->item_id, 0, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            // Check family not already present
            if (has_modifier_family(state, mod->family)) continue;
            
            // Create child
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.prefixes[0].modifier_id = mod_idx;
            child->state.prefixes[0].tier = tier;
            child->state.prefix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            // Calculate probability
            double total_weight = 0;
            for (int j = 0; j < prefix_count; j++) {
                int idx = itemPrefixIndex(state->item_id, 0, j);
                const Modifier* m = getModifier(idx);
                if (m && !has_modifier_family(state, m->family)) {
                    int t = getApplicableTier(m, state->item_level);
                    if (t >= 0) {
                        total_weight += m->tiers[t].weight;
                    }
                }
            }
            
            child->event.probability = mod->tiers[tier].weight / total_weight;
            child->cumulative_probability = parent->cumulative_probability * child->event.probability;
            
            add_child_to_node(parent, child);
        }
    } else if (need_suffix) {
        // Add a suffix
        int suffix_count = itemSuffixCount(state->item_id, 0);
        
        for (int i = 0; i < suffix_count; i++) {
            int mod_idx = itemSuffixIndex(state->item_id, 0, i);
            const Modifier* mod = getModifier(mod_idx);
            if (!mod) continue;
            
            int tier = getApplicableTier(mod, state->item_level);
            if (tier < 0) continue;
            
            if (has_modifier_family(state, mod->family)) continue;
            
            CraftingNode* child = allocate_node(pool);
            child->state = *state;
            child->state.suffixes[0].modifier_id = mod_idx;
            child->state.suffixes[0].tier = tier;
            child->state.suffix_count = 1;
            
            child->parent = parent;
            child->depth = parent->depth + 1;
            
            child->event.modifier_id = mod_idx;
            child->event.tier = tier;
            child->event.action_type = ACTION_ADDED;
            child->event.currency_name = "Orb of Augmentation";
            
            double total_weight = 0;
            for (int j = 0; j < suffix_count; j++) {
                int idx = itemSuffixIndex(state->item_id, 0, j);
                const Modifier* m = getModifier(idx);
                if (m && !has_modifier_family(state, m->family)) {
                    int t = getApplicableTier(m, state->item_level);
                    if (t >= 0) {
                        total_weight += m->tiers[t].weight;
                    }
                }
            }
            
            child->event.probability = mod->tiers[tier].weight / total_weight;
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
