#ifndef JSON_PARSER_H
#define JSON_PARSER_H

#include "crafting_types.h"

// Parse JSON configuration string and populate CraftingContext
// Returns 0 on success, -1 on error
int parse_crafting_json(const char* json_str, CraftingContext* context, ItemState* initial_state);

// Parse existing modifiers array from JSON
int parse_modifiers_array(const char* json_array, AppliedModifier* prefixes, int* prefix_count,
                          AppliedModifier* suffixes, int* suffix_count);

// Parse disabled currencies array
void parse_disabled_currencies(const char* json_array, CraftingContext* context);

// Parse disabled omens array
void parse_disabled_omens(const char* json_array, CraftingContext* context);

#endif // JSON_PARSER_H
