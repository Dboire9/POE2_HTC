#include "json_parser.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ctype.h>

// Simple JSON value extraction helpers
static const char* find_json_value(const char* json, const char* key) {
    char search[256];
    snprintf(search, sizeof(search), "\"%s\":", key);
    const char* pos = strstr(json, search);
    if (!pos) return NULL;
    
    // Skip key and colon
    pos += strlen(search);
    // Skip whitespace
    while (*pos && isspace(*pos)) pos++;
    
    return pos;
}

static int extract_json_int(const char* json, const char* key, int default_value) {
    const char* value = find_json_value(json, key);
    if (!value) return default_value;
    return atoi(value);
}

static void extract_json_string(const char* json, const char* key, char* buffer, int max_len) {
    const char* value = find_json_value(json, key);
    if (!value || *value != '"') {
        buffer[0] = '\0';
        return;
    }
    
    value++; // Skip opening quote
    int i = 0;
    while (*value && *value != '"' && i < max_len - 1) {
        buffer[i++] = *value++;
    }
    buffer[i] = '\0';
}

static bool extract_json_bool(const char* json, const char* key, bool default_value) {
    const char* value = find_json_value(json, key);
    if (!value) return default_value;
    
    if (strncmp(value, "true", 4) == 0) return true;
    if (strncmp(value, "false", 5) == 0) return false;
    return default_value;
}

// Extract array of modifiers
static int parse_modifier_object(const char* json_obj, AppliedModifier* mod) {
    mod->modifier_id = -1;
    mod->tier = 0;
    
    // Extract source
    int source = extract_json_int(json_obj, "source", -1);
    // Extract index
    int index = extract_json_int(json_obj, "index", -1);
    // Extract tier
    mod->tier = extract_json_int(json_obj, "tier", 0);
    
    if (source < 0 || index < 0) return -1;
    
    // Create a combined modifier_id (this is simplified - adapt to your system)
    // You may need a function to convert (source, index) to your internal modifier_id
    mod->modifier_id = source * 10000 + index;
    
    return 0;
}

int parse_modifiers_array(const char* json_array, AppliedModifier* prefixes, int* prefix_count,
                                  AppliedModifier* suffixes, int* suffix_count) {
    *prefix_count = 0;
    *suffix_count = 0;
    
    if (!json_array) return 0;
    
    // Find array start
    const char* array_start = strchr(json_array, '[');
    if (!array_start) return 0;
    array_start++;
    
    const char* pos = array_start;
    int depth = 0;
    const char* obj_start = NULL;
    
    while (*pos) {
        if (*pos == '{') {
            if (depth == 0) obj_start = pos;
            depth++;
        } else if (*pos == '}') {
            depth--;
            if (depth == 0 && obj_start) {
                // Extract object
                int obj_len = pos - obj_start + 1;
                char* obj_str = malloc(obj_len + 1);
                strncpy(obj_str, obj_start, obj_len);
                obj_str[obj_len] = '\0';
                
                AppliedModifier mod;
                if (parse_modifier_object(obj_str, &mod) == 0) {
                    // Check type
                    char type[32];
                    extract_json_string(obj_str, "type", type, sizeof(type));
                    
                    if (strcmp(type, "prefix") == 0 && *prefix_count < 3) {
                        prefixes[(*prefix_count)++] = mod;
                    } else if (strcmp(type, "suffix") == 0 && *suffix_count < 3) {
                        suffixes[(*suffix_count)++] = mod;
                    }
                }
                
                free(obj_str);
            }
        } else if (*pos == ']') {
            break;
        }
        pos++;
    }
    
    return 0;
}

static void parse_string_array(const char* json, const char* key, char** items, int* count, int max_items) {
    *count = 0;
    const char* array_start = find_json_value(json, key);
    if (!array_start || *array_start != '[') return;
    
    array_start++;
    const char* pos = array_start;
    
    while (*pos && *count < max_items) {
        // Skip whitespace
        while (*pos && isspace(*pos)) pos++;
        
        if (*pos == '"') {
            pos++; // Skip opening quote
            const char* start = pos;
            while (*pos && *pos != '"') pos++;
            
            int len = pos - start;
            items[*count] = malloc(len + 1);
            strncpy(items[*count], start, len);
            items[*count][len] = '\0';
            (*count)++;
            
            if (*pos) pos++; // Skip closing quote
        } else if (*pos == ']') {
            break;
        }
        
        // Skip comma
        while (*pos && (*pos == ',' || isspace(*pos))) pos++;
    }
}

int parse_crafting_json(const char* json_str, CraftingContext* context, ItemState* initial_state) {
    if (!json_str || !context || !initial_state) return -1;
    
    // Initialize structures
    memset(context, 0, sizeof(CraftingContext));
    memset(initial_state, 0, sizeof(ItemState));
    
    // Extract basic item info
    context->item_id = extract_json_int(json_str, "itemId", -1);
    initial_state->item_id = context->item_id;
    initial_state->item_level = extract_json_int(json_str, "itemLevel", 82); // Default 82
    context->item_level = initial_state->item_level;
    
    // Extract rarity
    char rarity_str[32];
    extract_json_string(json_str, "rarity", rarity_str, sizeof(rarity_str));
    if (strcmp(rarity_str, "normal") == 0) {
        initial_state->rarity = 0;
        context->starting_rarity = 0;
    } else if (strcmp(rarity_str, "magic") == 0) {
        initial_state->rarity = 1;
        context->starting_rarity = 1;
    } else if (strcmp(rarity_str, "rare") == 0) {
        initial_state->rarity = 2;
        context->starting_rarity = 2;
    }
    
    // Parse existingModifiers array
    const char* existing_mods = find_json_value(json_str, "existingModifiers");
    if (existing_mods) {
        parse_modifiers_array(existing_mods, 
                            initial_state->prefixes, &initial_state->prefix_count,
                            initial_state->suffixes, &initial_state->suffix_count);
    }
    
    // Parse desiredModifiers array (target)
    const char* desired_mods = find_json_value(json_str, "desiredModifiers");
    if (desired_mods) {
        AppliedModifier temp_prefixes[3], temp_suffixes[3];
        int temp_prefix_count = 0, temp_suffix_count = 0;
        
        parse_modifiers_array(desired_mods, temp_prefixes, &temp_prefix_count,
                            temp_suffixes, &temp_suffix_count);
        
        // Copy to target arrays
        for (int i = 0; i < temp_prefix_count && i < 3; i++) {
            context->target_prefix_ids[i] = temp_prefixes[i].modifier_id;
            context->target_prefix_tiers[i] = temp_prefixes[i].tier;
        }
        context->target_prefix_count = temp_prefix_count;
        
        for (int i = 0; i < temp_suffix_count && i < 3; i++) {
            context->target_suffix_ids[i] = temp_suffixes[i].modifier_id;
            context->target_suffix_tiers[i] = temp_suffixes[i].tier;
        }
        context->target_suffix_count = temp_suffix_count;
    }
    
    // Parse disabledCurrencies
    char* disabled_currencies[10];
    int disabled_count = 0;
    parse_string_array(json_str, "disabledCurrencies", disabled_currencies, &disabled_count, 10);
    
    // By default, all currencies are allowed
    context->transmutation_allowed = true;
    context->augmentation_allowed = true;
    context->regal_allowed = true;
    context->exalted_allowed = true;
    context->annulment_allowed = true;
    context->essence_allowed = true;
    context->desecrated_allowed = true;
    
    // Disable currencies based on JSON
    for (int i = 0; i < disabled_count; i++) {
        if (strcmp(disabled_currencies[i], "transmutation") == 0) context->transmutation_allowed = false;
        else if (strcmp(disabled_currencies[i], "augmentation") == 0) context->augmentation_allowed = false;
        else if (strcmp(disabled_currencies[i], "regal") == 0) context->regal_allowed = false;
        else if (strcmp(disabled_currencies[i], "exalted") == 0) context->exalted_allowed = false;
        else if (strcmp(disabled_currencies[i], "annulment") == 0) context->annulment_allowed = false;
        else if (strcmp(disabled_currencies[i], "essence") == 0) context->essence_allowed = false;
        else if (strcmp(disabled_currencies[i], "desecrated") == 0) context->desecrated_allowed = false;
        
        free(disabled_currencies[i]);
    }
    
    // Set defaults
    context->global_threshold = MIN_PROBABILITY_THRESHOLD;
    context->max_depth = MAX_DEPTH;
    context->essence_type = NULL;
    context->selected_omens = 0;
    
    return 0;
}
