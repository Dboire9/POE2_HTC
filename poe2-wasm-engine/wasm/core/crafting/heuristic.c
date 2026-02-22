#include "heuristic.h"
#include "../modifiers.h"
#include <string.h>

// Helper to check if two modifiers match (same source and index)
static inline bool modifiers_match(int src1, int idx1, int src2, int idx2) {
    return src1 == src2 && idx1 == idx2;
}

double calculate_heuristic(const ItemState* state, const CraftingContext* context) {
    double score = 0.0;
    
    // Base score per rarity
    switch (state->rarity) {
        case 1: score += 50;  break;  // Magic
        case 2: score += 100; break;  // Rare
    }
    
    // Check target prefixes
    for (int i = 0; i < context->target_prefix_count; i++) {
        int target_source = context->target_prefix_sources[i];
        int target_index = context->target_prefix_indices[i];
        int target_tier = context->target_prefix_tiers[i];
        
        // Check if we have this modifier
        for (int j = 0; j < state->prefix_count; j++) {
            if (modifiers_match(state->prefixes[j].source, state->prefixes[j].index,
                               target_source, target_index)) {
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
        int target_source = context->target_suffix_sources[i];
        int target_index = context->target_suffix_indices[i];
        int target_tier = context->target_suffix_tiers[i];
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (modifiers_match(state->suffixes[j].source, state->suffixes[j].index,
                               target_source, target_index)) {
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
        int undesired_source = context->undesired_mod_sources[i];
        int undesired_index = context->undesired_mod_indices[i];
        
        for (int j = 0; j < state->prefix_count; j++) {
            if (modifiers_match(state->prefixes[j].source, state->prefixes[j].index,
                               undesired_source, undesired_index)) {
                score -= 500;
            }
        }
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (modifiers_match(state->suffixes[j].source, state->suffixes[j].index,
                               undesired_source, undesired_index)) {
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
        int target_source = context->target_prefix_sources[i];
        int target_index = context->target_prefix_indices[i];
        int target_tier = context->target_prefix_tiers[i];
        
        for (int j = 0; j < state->prefix_count; j++) {
            if (modifiers_match(state->prefixes[j].source, state->prefixes[j].index,
                               target_source, target_index) &&
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
        int target_source = context->target_suffix_sources[i];
        int target_index = context->target_suffix_indices[i];
        int target_tier = context->target_suffix_tiers[i];
        
        for (int j = 0; j < state->suffix_count; j++) {
            if (modifiers_match(state->suffixes[j].source, state->suffixes[j].index,
                               target_source, target_index) &&
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
    // Check prefixes - now using proper source/index lookup
    for (int i = 0; i < state->prefix_count; i++) {
        const Modifier* mod = get_modifier_by_source_index(state->prefixes[i].source, 
                                                            state->prefixes[i].index);
        if (mod && strcmp(mod->name, family) == 0) {
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        const Modifier* mod = get_modifier_by_source_index(state->suffixes[i].source,
                                                            state->suffixes[i].index);
        if (mod && strcmp(mod->name, family) == 0) {
            return true;
        }
    }
    
    return false;
}
