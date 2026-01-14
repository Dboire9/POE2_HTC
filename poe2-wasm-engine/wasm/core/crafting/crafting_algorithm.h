#ifndef CRAFTING_ALGORITHM_H
#define CRAFTING_ALGORITHM_H

#include "crafting_types.h"

/**
 * Main entry point for the crafting algorithm
 * 
 * @param context The crafting context with target modifiers and settings
 * @param initial_state The starting state of the item
 * @return CraftingResult with all found paths, or NULL on error
 */
CraftingResult* run_crafting_algorithm(const CraftingContext* context, const ItemState* initial_state);

/**
 * Free the result returned by run_crafting_algorithm
 */
void free_crafting_result_full(CraftingResult* result);

#endif // CRAFTING_ALGORITHM_H
