#ifndef CRAFTING_HELPERS_H
#define CRAFTING_HELPERS_H

#include "../modifiers.h"
#include "../item_mod_lookup.h"
#include "crafting_types.h"
#include <stdbool.h>
#include <stddef.h>

// ============================================================================
// MODIFIER LOOKUP HELPERS
// ============================================================================

// Get the lookup table for prefixes/suffixes for a given item and source
// Returns NULL if no modifiers available, sets out_count to number of entries
ModifierLookup* get_item_mod_lookup(int item_id, ModifierSource source, bool is_suffix, int* out_count);

// Get the count of available prefixes for an item from a specific source
int get_prefix_count(int item_id, ModifierSource source);

// Get the count of available suffixes for an item from a specific source
int get_suffix_count(int item_id, ModifierSource source);

// Get the modifier lookup entry at a specific index
// Returns the source and index of the modifier
ModifierLookup* get_prefix_lookup(int item_id, ModifierSource source, int idx);
ModifierLookup* get_suffix_lookup(int item_id, ModifierSource source, int idx);

// ============================================================================
// MODIFIER ACCESS HELPERS  
// ============================================================================

// Get modifier by source and index (wrapper for get_modifier_by_source_index)
static inline Modifier* get_mod(ModifierSource source, int index) {
    return get_modifier_by_source_index(source, index);
}

// Get modifier from lookup entry
static inline Modifier* get_mod_from_lookup(const ModifierLookup* lookup) {
    if (!lookup) return NULL;
    return get_modifier_by_source_index(lookup->source, lookup->index);
}

// ============================================================================
// TIER CALCULATION HELPERS
// ============================================================================

// Get the highest applicable tier for a modifier given item level
// Returns -1 if no tier is applicable
int get_applicable_tier(const Modifier* mod, int item_level);

// Get the highest applicable tier respecting max_tier_index limit from lookup
int get_applicable_tier_with_limit(const Modifier* mod, int item_level, int max_tier_index);

// ============================================================================
// MODIFIER FAMILY CHECKING
// ============================================================================

// Check if a modifier family is already present on the item
// Uses the modifier's group name for family comparison
bool has_mod_family(const ItemState* state, const char* family_name);

// Check if a specific modifier (source+index) is already present on the item
bool has_modifier(const ItemState* state, ModifierSource source, int index);

// ============================================================================
// WEIGHT CALCULATION HELPERS
// ============================================================================

// Calculate total weight of available prefixes for an item
// Excludes modifiers whose families are already present
double calc_available_prefix_weight(int item_id, ModifierSource source, const ItemState* state, int item_level);

// Calculate total weight of available suffixes for an item
double calc_available_suffix_weight(int item_id, ModifierSource source, const ItemState* state, int item_level);

// Get the weight of a specific tier
static inline int get_tier_weight(const Modifier* mod, int tier) {
    if (!mod || tier < 0 || tier >= mod->tier_count) return 0;
    return mod->tiers[tier].weight;
}

#endif // CRAFTING_HELPERS_H
