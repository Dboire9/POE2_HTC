#include "crafting_helpers.h"
#include <string.h>

// External declaration of the lookup table function
// This is defined in item_lookup_impl.c
extern ModifierLookup* get_lookup_table(int item_id, ModifierSource source, bool is_suffix, int* out_count);

// ============================================================================
// MODIFIER LOOKUP HELPERS
// ============================================================================

ModifierLookup* get_item_mod_lookup(int item_id, ModifierSource source, bool is_suffix, int* out_count) {
    return get_lookup_table(item_id, source, is_suffix, out_count);
}

int get_prefix_count(int item_id, ModifierSource source) {
    int count = 0;
    get_lookup_table(item_id, source, false, &count);
    return count;
}

int get_suffix_count(int item_id, ModifierSource source) {
    int count = 0;
    get_lookup_table(item_id, source, true, &count);
    return count;
}

ModifierLookup* get_prefix_lookup(int item_id, ModifierSource source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_id, source, false, &count);
    if (!table || idx < 0 || idx >= count) return NULL;
    return &table[idx];
}

ModifierLookup* get_suffix_lookup(int item_id, ModifierSource source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_id, source, true, &count);
    if (!table || idx < 0 || idx >= count) return NULL;
    return &table[idx];
}

// ============================================================================
// TIER CALCULATION HELPERS
// ============================================================================

int get_applicable_tier(const Modifier* mod, int item_level) {
    if (!mod) return -1;
    
    // Find highest tier accessible for this item level
    // Tiers are ordered from best (T1, tier_index=0) to worst
    // We want the best tier the item level can access
    for (int i = 0; i < mod->tier_count; i++) {
        if (item_level >= mod->tiers[i].level_req) {
            return i;
        }
    }
    
    return -1;  // No tier applicable
}

int get_applicable_tier_with_limit(const Modifier* mod, int item_level, int max_tier_index) {
    if (!mod) return -1;
    
    // If max_tier_index is 255, no limit
    int limit = (max_tier_index == 255) ? mod->tier_count : (max_tier_index + 1);
    if (limit > mod->tier_count) limit = mod->tier_count;
    
    for (int i = 0; i < limit; i++) {
        if (item_level >= mod->tiers[i].level_req) {
            return i;
        }
    }
    
    return -1;
}

// ============================================================================
// MODIFIER FAMILY CHECKING
// ============================================================================

bool has_mod_family(const ItemState* state, const char* family_name) {
    if (!state || !family_name) return false;
    
    // Check prefixes
    for (int i = 0; i < state->prefix_count; i++) {
        const Modifier* mod = get_modifier_by_source_index(
            state->prefixes[i].source, 
            state->prefixes[i].index
        );
        if (mod && strcmp(mod->name, family_name) == 0) {
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        const Modifier* mod = get_modifier_by_source_index(
            state->suffixes[i].source, 
            state->suffixes[i].index
        );
        if (mod && strcmp(mod->name, family_name) == 0) {
            return true;
        }
    }
    
    return false;
}

bool has_modifier(const ItemState* state, ModifierSource source, int index) {
    if (!state) return false;
    
    // Check prefixes
    for (int i = 0; i < state->prefix_count; i++) {
        if (state->prefixes[i].source == source && 
            state->prefixes[i].index == index) {
            return true;
        }
    }
    
    // Check suffixes
    for (int i = 0; i < state->suffix_count; i++) {
        if (state->suffixes[i].source == source && 
            state->suffixes[i].index == index) {
            return true;
        }
    }
    
    return false;
}

// ============================================================================
// WEIGHT CALCULATION HELPERS
// ============================================================================

double calc_available_prefix_weight(int item_id, ModifierSource source, const ItemState* state, int item_level) {
    double total = 0.0;
    
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_id, source, false, &count);
    if (!table) return 0.0;
    
    for (int i = 0; i < count; i++) {
        const Modifier* mod = get_modifier_by_source_index(table[i].source, table[i].index);
        if (!mod) continue;
        
        // Skip if family already present
        if (has_mod_family(state, mod->name)) continue;
        
        // Get applicable tier
        int tier = get_applicable_tier_with_limit(mod, item_level, table[i].max_tier_index);
        if (tier < 0) continue;
        
        total += mod->tiers[tier].weight;
    }
    
    return total;
}

double calc_available_suffix_weight(int item_id, ModifierSource source, const ItemState* state, int item_level) {
    double total = 0.0;
    
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_id, source, true, &count);
    if (!table) return 0.0;
    
    for (int i = 0; i < count; i++) {
        const Modifier* mod = get_modifier_by_source_index(table[i].source, table[i].index);
        if (!mod) continue;
        
        // Skip if family already present
        if (has_mod_family(state, mod->name)) continue;
        
        // Get applicable tier
        int tier = get_applicable_tier_with_limit(mod, item_level, table[i].max_tier_index);
        if (tier < 0) continue;
        
        total += mod->tiers[tier].weight;
    }
    
    return total;
}
