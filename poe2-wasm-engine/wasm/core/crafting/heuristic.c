#include "heuristic.h"
#include "../modifiers.h"
#include <string.h>

double calculate_heuristic(const ItemState* state, const CraftingContext* context) {
    double score = 0.0;
    
    // Base score per rarity
    switch (state->rarity) {
        case 1: score += 50;  break;  // Magic
        case 2: score += 100; break;  // Rare
    }
    
    // Check target prefixes
    for (int i = 0; i < context->target_prefix_count; i++) {
        int target_id = context->target_prefix_ids[i];
        int target_tier = context->target_prefix_tiers[i];
        
        // Check if we have this modifier
        for (int j = 0; j < state->prefix_count; j++) {
            if (state->prefixes[j].modifier_id == target_id) {
                // Exact tier match
                if (state->prefixes[j].tier == target_tier) {
                    score += 1000;  // Perfect match
                } else if (state->prefixes[j].tier < target_tier + 2) {
                    score += 700;   // Close tier
                } else {
                    score += 400;   // Wrong tier but right mod
                }
                break;
            }
        }
    }
    
    // Check target suffixes
    for (int i = 0; i < context->target_suffix_count; i++) {
        int target_id = context->target_suffix_ids[i];
        int target_tier = context->target_suffix_tiers[i];
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (state->suffixes[j].modifier_id == target_id) {
                if (state->suffixes[j].tier == target_tier) {
                    score += 1000;
                } else if (state->suffixes[j].tier < target_tier + 2) {
                    score += 700;
                } else {
                    score += 400;
                }
                break;
            }
        }
    }
    
    // Penalty for undesired modifiers
    for (int i = 0; i < context->undesired_mod_count; i++) {
        int undesired_id = context->undesired_mod_ids[i];
        
        for (int j = 0; j < state->prefix_count; j++) {
            if (state->prefixes[j].modifier_id == undesired_id) {
                score -= 500;
            }
        }
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (state->suffixes[j].modifier_id == undesired_id) {
                score -= 500;
            }
        }
    }
    
    return score;
}

bool matches_target(const ItemState* state, const CraftingContext* context) {
    // Check prefix count
    if (state->prefix_count != context->target_prefix_count) {
        return false;
    }
    
    // Check suffix count
    if (state->suffix_count != context->target_suffix_count) {
        return false;
    }
    
    // Check each target prefix
    for (int i = 0; i < context->target_prefix_count; i++) {
        bool found = false;
        int target_id = context->target_prefix_ids[i];
        int target_tier = context->target_prefix_tiers[i];
        
        for (int j = 0; j < state->prefix_count; j++) {
            if (state->prefixes[j].modifier_id == target_id &&
                state->prefixes[j].tier == target_tier) {
                found = true;
                break;
            }
        }
        
        if (!found) return false;
    }
    
    // Check each target suffix
    for (int i = 0; i < context->target_suffix_count; i++) {
        bool found = false;
        int target_id = context->target_suffix_ids[i];
        int target_tier = context->target_suffix_tiers[i];
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (state->suffixes[j].modifier_id == target_id &&
                state->suffixes[j].tier == target_tier) {
                found = true;
                break;
            }
        }
        
        if (!found) return false;
    }
    
    return true;
}

bool has_modifier_family(const ItemState* state, const char* family) {
    // Check prefixes
    for (int i = 0; i < state->prefix_count; i++) {
        const Modifier* mod = getModifier(state->prefixes[i].modifier_id);
        if (mod && strcmp(mod->family, family) == 0) {
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        const Modifier* mod = getModifier(state->suffixes[i].modifier_id);
        if (mod && strcmp(mod->family, family) == 0) {
            return true;
        }
    }
    
    return false;
}
