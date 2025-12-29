#include "essence.h"
#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "../crafting/node_pool.h"
#include "../crafting/node_operations.h"
#include "../crafting/heuristic.h"
#include <string.h>

bool essence_validate(
    const ItemState* state,
    const CraftingContext* context,
    char* error_out
) {
    // Essence can be used on any rarity
    if (!context->essence_type) {
        if (error_out) strcpy(error_out, "Must specify essence type");
        return false;
    }
    return true;
}

void essence_apply(
    CraftingNode* parent,
    const CraftingContext* context,
    NodePool* pool
) {
    ItemState* state = &parent->state;
    
    if (!context->essence_type) return;
    
    // Check omens
    bool force_prefix = (context->selected_omens & OMEN_ESSENCE_SINISTRAL_CRYSTALLISATION) != 0;
    bool force_suffix = (context->selected_omens & OMEN_ESSENCE_DEXTRAL_CRYSTALLISATION) != 0;
    
    if (force_prefix && force_suffix) {
        force_prefix = false;
        force_suffix = false;
    }
    
    // Essence forces ONE specific modifier from essence pool
    // Then rerolls all other mods randomly
    
    // Get essence modifiers (source = 2 for essence)
    int essence_prefix_count = itemPrefixCount(state->item_id, 2);
    int essence_suffix_count = itemSuffixCount(state->item_id, 2);
    
    // Try forcing each essence prefix
    if (!force_suffix) {
        for (int forced_idx = 0; forced_idx < essence_prefix_count; forced_idx++) {
            int forced_mod_idx = itemPrefixIndex(state->item_id, 2, forced_idx);
            const Modifier* forced_mod = getModifier(forced_mod_idx);
            if (!forced_mod) continue;
            
            // Check if this essence matches the requested type
            // (In a real implementation, you'd match essence_type with mod family)
            
            int forced_tier = getApplicableTier(forced_mod, state->item_level);
            if (forced_tier < 0) continue;
            
            // Now generate all possible rerolls for the other mods
            // For simplicity, we'll generate a subset of possible outcomes
            // (Full implementation would be combinatorially expensive)
            
            // Get normal mods for reroll
            int normal_prefix_count = itemPrefixCount(state->item_id, 0);
            int normal_suffix_count = itemSuffixCount(state->item_id, 0);
            
            // Generate sample outcomes (not exhaustive)
            // Essence sets rarity to Rare
            for (int i = 0; i < normal_prefix_count && i < 5; i++) {  // Limit to 5 samples
                int reroll_prefix_idx = itemPrefixIndex(state->item_id, 0, i);
                const Modifier* reroll_prefix = getModifier(reroll_prefix_idx);
                if (!reroll_prefix) continue;
                
                int reroll_tier = getApplicableTier(reroll_prefix, state->item_level);
                if (reroll_tier < 0) continue;
                
                // Check family conflicts
                if (strcmp(forced_mod->family, reroll_prefix->family) == 0) continue;
                
                for (int j = 0; j < normal_suffix_count && j < 5; j++) {
                    int reroll_suffix_idx = itemSuffixIndex(state->item_id, 0, j);
                    const Modifier* reroll_suffix = getModifier(reroll_suffix_idx);
                    if (!reroll_suffix) continue;
                    
                    int suffix_tier = getApplicableTier(reroll_suffix, state->item_level);
                    if (suffix_tier < 0) continue;
                    
                    // Check family conflicts
                    if (strcmp(forced_mod->family, reroll_suffix->family) == 0) continue;
                    if (strcmp(reroll_prefix->family, reroll_suffix->family) == 0) continue;
                    
                    // Create child with forced essence + 2 rerolled mods
                    CraftingNode* child = allocate_node(pool);
                    child->state.item_id = state->item_id;
                    child->state.item_level = state->item_level;
                    child->state.rarity = 2;  // Rare
                    
                    // Forced essence prefix
                    child->state.prefixes[0].modifier_id = forced_mod_idx;
                    child->state.prefixes[0].tier = forced_tier;
                    
                    // Rerolled prefix
                    child->state.prefixes[1].modifier_id = reroll_prefix_idx;
                    child->state.prefixes[1].tier = reroll_tier;
                    child->state.prefix_count = 2;
                    
                    // Rerolled suffix
                    child->state.suffixes[0].modifier_id = reroll_suffix_idx;
                    child->state.suffixes[0].tier = suffix_tier;
                    child->state.suffix_count = 1;
                    
                    child->parent = parent;
                    child->depth = parent->depth + 1;
                    
                    child->event.modifier_id = forced_mod_idx;
                    child->event.tier = forced_tier;
                    child->event.action_type = ACTION_REROLLED;
                    child->event.currency_name = "Essence";
                    
                    // Probability calculation (simplified)
                    // P = P(forced) × P(reroll_prefix) × P(reroll_suffix)
                    double forced_weight = forced_mod->tiers[forced_tier].weight;
                    double total_essence_weight = 100.0;  // Simplified
                    
                    double reroll_prefix_weight = reroll_prefix->tiers[reroll_tier].weight;
                    double reroll_suffix_weight = reroll_suffix->tiers[suffix_tier].weight;
                    double total_normal_weight = 1000.0;  // Simplified
                    
                    child->event.probability = 
                        (forced_weight / total_essence_weight) *
                        (reroll_prefix_weight / total_normal_weight) *
                        (reroll_suffix_weight / total_normal_weight);
                    
                    child->cumulative_probability = parent->cumulative_probability * child->event.probability;
                    
                    add_child_to_node(parent, child);
                }
            }
        }
    }
    
    // Try forcing each essence suffix
    if (!force_prefix) {
        for (int forced_idx = 0; forced_idx < essence_suffix_count; forced_idx++) {
            int forced_mod_idx = itemSuffixIndex(state->item_id, 2, forced_idx);
            const Modifier* forced_mod = getModifier(forced_mod_idx);
            if (!forced_mod) continue;
            
            int forced_tier = getApplicableTier(forced_mod, state->item_level);
            if (forced_tier < 0) continue;
            
            int normal_prefix_count = itemPrefixCount(state->item_id, 0);
            
            // Generate sample outcomes
            for (int i = 0; i < normal_prefix_count && i < 5; i++) {
                int reroll_prefix_idx = itemPrefixIndex(state->item_id, 0, i);
                const Modifier* reroll_prefix = getModifier(reroll_prefix_idx);
                if (!reroll_prefix) continue;
                
                int reroll_tier = getApplicableTier(reroll_prefix, state->item_level);
                if (reroll_tier < 0) continue;
                
                if (strcmp(forced_mod->family, reroll_prefix->family) == 0) continue;
                
                CraftingNode* child = allocate_node(pool);
                child->state.item_id = state->item_id;
                child->state.item_level = state->item_level;
                child->state.rarity = 2;
                
                // Rerolled prefix
                child->state.prefixes[0].modifier_id = reroll_prefix_idx;
                child->state.prefixes[0].tier = reroll_tier;
                child->state.prefix_count = 1;
                
                // Forced essence suffix
                child->state.suffixes[0].modifier_id = forced_mod_idx;
                child->state.suffixes[0].tier = forced_tier;
                child->state.suffix_count = 1;
                
                child->parent = parent;
                child->depth = parent->depth + 1;
                
                child->event.modifier_id = forced_mod_idx;
                child->event.tier = forced_tier;
                child->event.action_type = ACTION_REROLLED;
                child->event.currency_name = "Essence";
                
                double forced_weight = forced_mod->tiers[forced_tier].weight;
                double reroll_weight = reroll_prefix->tiers[reroll_tier].weight;
                
                child->event.probability = (forced_weight / 100.0) * (reroll_weight / 1000.0);
                child->cumulative_probability = parent->cumulative_probability * child->event.probability;
                
                add_child_to_node(parent, child);
            }
        }
    }
}

const Currency ESSENCE = {
    .id = "essence",
    .name = "Essence",
    .available_omens = OMEN_ESSENCE_SINISTRAL_CRYSTALLISATION | OMEN_ESSENCE_DEXTRAL_CRYSTALLISATION,
    .apply = essence_apply,
    .validate = essence_validate
};
