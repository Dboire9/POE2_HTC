#include <stdlib.h>
#include <string.h>
#include <emscripten.h>
#include "core/items.h"
#include "core/items_data.h"
#include "core/modifiers.h"
#include "core/modifiers_data.h"
#include "core/item_mod_lookup.h"

// Initialize database on module load
__attribute__((constructor))
void init_database() {
    init_items_data();
    init_modifiers_data();
}

// =============================================================================
// DATABASE STATS
// =============================================================================

EMSCRIPTEN_KEEPALIVE
int get_modifiers_normal_count() {
    return MODIFIERS_NORMAL_COUNT;
}

EMSCRIPTEN_KEEPALIVE
int get_modifiers_desecrated_count() {
    return MODIFIERS_DESECRATED_COUNT;
}

EMSCRIPTEN_KEEPALIVE
int get_modifiers_essence_count() {
    return MODIFIERS_ESSENCE_COUNT;
}

EMSCRIPTEN_KEEPALIVE
int get_modifiers_perfect_essence_count() {
    return MODIFIERS_PERFECT_ESSENCE_COUNT;
}

EMSCRIPTEN_KEEPALIVE
int get_items_count() {
    return ITEMS_COUNT;
}

// =============================================================================
// ITEM API
// =============================================================================

EMSCRIPTEN_KEEPALIVE
const char* get_item_name(int item_idx) {
    if (item_idx < 0 || item_idx >= ITEMS_COUNT) return NULL;
    return ITEMS_DB[item_idx].name;
}

EMSCRIPTEN_KEEPALIVE
int get_item_class(int item_idx) {
    if (item_idx < 0 || item_idx >= ITEMS_COUNT) return -1;
    return ITEMS_DB[item_idx].item_class;
}

// =============================================================================
// MODIFIER API
// =============================================================================

EMSCRIPTEN_KEEPALIVE
const char* get_modifier_name(int source, int index) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod) return NULL;
    return mod->name;
}

EMSCRIPTEN_KEEPALIVE
const char* get_modifier_group(int source, int index) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod) return NULL;
    // Group is derived from name (e.g., "IncreasedLife" -> "Life")
    // For now, return description or name
    return mod->description;
}

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_count(int source, int index) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod) return 0;
    return mod->tier_count;
}

EMSCRIPTEN_KEEPALIVE
const char* get_modifier_tier_name(int source, int index, int tier_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return NULL;
    return mod->tiers[tier_idx].tier_name;
}

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_level_req(int source, int index, int tier_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return -1;
    return mod->tiers[tier_idx].level_req;
}

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_weight(int source, int index, int tier_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return -1;
    return mod->tiers[tier_idx].weight;
}

// =============================================================================
// ITEM LOOKUP API
// =============================================================================

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_count(int item_idx, int source) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    return result.prefix_count;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_count(int item_idx, int source) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    return result.suffix_count;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_source(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.prefixes || idx < 0 || idx >= result.prefix_count) return -1;
    return result.prefixes[idx].source;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_index(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.prefixes || idx < 0 || idx >= result.prefix_count) return -1;
    return result.prefixes[idx].index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_max_tier(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.prefixes || idx < 0 || idx >= result.prefix_count) return -1;
    return result.prefixes[idx].max_tier_index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_source(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.suffixes || idx < 0 || idx >= result.suffix_count) return -1;
    return result.suffixes[idx].source;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_index(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.suffixes || idx < 0 || idx >= result.suffix_count) return -1;
    return result.suffixes[idx].index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_max_tier(int item_idx, int source, int idx) {
    ItemModLookupResult result = get_item_mod_lookup(item_idx, source);
    if (!result.suffixes || idx < 0 || idx >= result.suffix_count) return -1;
    return result.suffixes[idx].max_tier_index;
}

