#ifndef HEURISTIC_H
#define HEURISTIC_H

#include "crafting_types.h"

// Calculate heuristic score for an item state
// Higher score = better (closer to target)
double calculate_heuristic(const ItemState* state, const CraftingContext* context);

// Check if state exactly matches target
bool matches_target(const ItemState* state, const CraftingContext* context);

// Check if a modifier family is already on the item
bool has_modifier_family(const ItemState* state, const char* family);

#endif // HEURISTIC_H
