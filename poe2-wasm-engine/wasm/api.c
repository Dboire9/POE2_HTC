#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <emscripten.h>
#include "core/items.h"
#include "core/items_data.h"
#include "core/modifiers.h"
#include "core/modifiers_data.h"
#include "core/item_mod_lookup.h"
#include "core/crafting/crafting_types.h"
#include "core/crafting/json_parser.h"
#include "core/crafting/crafting_algorithm.h"

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
    // Return description if available, otherwise return name
    if (mod->description[0] != '\0') {
        return mod->description;
    }
    return mod->name;
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

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_value_count(int source, int index, int tier_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return 0;
    return mod->tiers[tier_idx].value_count;
}

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_value_min(int source, int index, int tier_idx, int value_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return 0;
    if (value_idx < 0 || value_idx >= mod->tiers[tier_idx].value_count) return 0;
    return mod->tiers[tier_idx].values[value_idx].min;
}

EMSCRIPTEN_KEEPALIVE
int get_modifier_tier_value_max(int source, int index, int tier_idx, int value_idx) {
    Modifier* mod = get_modifier_by_source_index(source, index);
    if (!mod || tier_idx < 0 || tier_idx >= mod->tier_count) return 0;
    if (value_idx < 0 || value_idx >= mod->tiers[tier_idx].value_count) return 0;
    return mod->tiers[tier_idx].values[value_idx].max;
}

// =============================================================================
// ITEM LOOKUP API
// =============================================================================

#include "core/item_lookup_impl.c"

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_count(int item_idx, int source) {
    int count = 0;
    get_lookup_table(item_idx, source, false, &count);
    return count;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_count(int item_idx, int source) {
    int count = 0;
    get_lookup_table(item_idx, source, true, &count);
    return count;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_source(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, false, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].source;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_index(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, false, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_prefix_max_tier(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, false, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].max_tier_index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_source(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, true, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].source;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_index(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, true, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].index;
}

EMSCRIPTEN_KEEPALIVE
int get_item_suffix_max_tier(int item_idx, int source, int idx) {
    int count = 0;
    ModifierLookup* table = get_lookup_table(item_idx, source, true, &count);
    if (!table || idx < 0 || idx >= count) return -1;
    return table[idx].max_tier_index;
}

// =============================================================================
// CRAFTING ALGORITHM API
// =============================================================================

// Calculate crafting path from JSON configuration
EMSCRIPTEN_KEEPALIVE
const char* calculate_crafting_path(const char* json_config) {
    if (!json_config) {
        return "{\"error\":\"No configuration provided\"}";
    }
    
    printf("\n========================================\n");
    printf("RECEIVED JSON CONFIG:\n");
    printf("========================================\n");
    printf("%s\n", json_config);
    printf("========================================\n\n");
    
    // Parse JSON into crafting structures
    CraftingContext context;
    ItemState initial_state;
    
    if (parse_crafting_json(json_config, &context, &initial_state) != 0) {
        printf("ERROR: Failed to parse JSON\n");
        return "{\"error\":\"Failed to parse JSON configuration\"}";
    }
    
    printf("PARSED DATA:\n");
    printf("  Item ID: %d\n", context.item_id);
    printf("  Item Level: %d\n", context.item_level);
    printf("  Starting Rarity: %d (0=normal, 1=magic, 2=rare)\n", context.starting_rarity);
    printf("  Existing Modifiers: %d prefixes, %d suffixes\n", 
           initial_state.prefix_count, initial_state.suffix_count);
    printf("  Target Modifiers: %d prefixes, %d suffixes\n", 
           context.target_prefix_count, context.target_suffix_count);
    printf("  Currencies:\n");
    printf("    - Transmutation: %s\n", context.transmutation_allowed ? "ENABLED" : "DISABLED");
    printf("    - Augmentation: %s\n", context.augmentation_allowed ? "ENABLED" : "DISABLED");
    printf("    - Regal: %s\n", context.regal_allowed ? "ENABLED" : "DISABLED");
    printf("    - Exalted: %s\n", context.exalted_allowed ? "ENABLED" : "DISABLED");
    printf("    - Annulment: %s\n", context.annulment_allowed ? "ENABLED" : "DISABLED");
    printf("    - Essence: %s\n", context.essence_allowed ? "ENABLED" : "DISABLED");
    printf("    - Desecrated: %s\n", context.desecrated_allowed ? "ENABLED" : "DISABLED");
    printf("========================================\n\n");
    
    // Call the crafting algorithm
    CraftingResult* algo_result = run_crafting_algorithm(&context, &initial_state);
    
    // Build response
    static char response[2048];
    
    if (!algo_result) {
        snprintf(response, sizeof(response),
                "{\"status\":\"error\",\"message\":\"Algorithm failed to run\"}");
        return response;
    }
    
    // Build success response with parsed data and algorithm result
    snprintf(response, sizeof(response), 
             "{"
             "\"status\":\"parsed\","
             "\"itemId\":%d,"
             "\"itemLevel\":%d,"
             "\"rarity\":%d,"
             "\"existingPrefixes\":%d,"
             "\"existingSuffixes\":%d,"
             "\"solutionsFound\":%d,"
             "\"message\":\"Configuration parsed successfully. Algorithm executed.\""
             "}",
             context.item_id,
             context.item_level,
             context.starting_rarity,
             initial_state.prefix_count,
             initial_state.suffix_count,
             algo_result ? algo_result->count : 0
    );
    
    // Clean up
    if (algo_result) {
        free_crafting_result_full(algo_result);
    }
    
    return response;
}
