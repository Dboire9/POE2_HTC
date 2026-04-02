// craft_utils.h
#ifndef CRAFT_UTILS_H
#define CRAFT_UTILS_H

#include "../items/items.h"
#include "../modifiers/modifiers.h"
#include "../items/item_mod_lookup.h"

// A flat list of all valid modifiers for a given item + source + affix type
typedef struct {
    const Modifier*       modifier;
    const ModifierLookup* lookup;   // keeps max_tier_index accessible
} ModifierEntry;

// Returns all valid modifiers for a given item, source and affix type
// Caller must free() the returned array
ModifierEntry* get_valid_modifiers(const ItemInstance* item, ModifierSource source, bool is_suffix, int* out_count);

// Returns all possible ItemInstances after adding one modifier from the pool
// Each result is malloc'd — caller must free each one + the array
ItemInstance** get_all_possible_additions(const ItemInstance* item, ModifierSource source, bool is_suffix, int* out_count);

// Desecrated variant: merges SOURCE_NORMAL + SOURCE_DESECRATED pools.
// Only includes mods where at least one accessible tier has level_req >= min_tier_level.
// (Use min_tier_level=0 for Preserved, 40 for Ancient, 64 for Gnawed.)
ModifierEntry* get_valid_modifiers_desecrated(const ItemInstance* item, bool is_suffix, int min_tier_level, int* out_count);
ItemInstance** get_all_possible_additions_desecrated(const ItemInstance* item, bool is_suffix, int min_tier_level, int* out_count);

#endif // CRAFT_UTILS_H