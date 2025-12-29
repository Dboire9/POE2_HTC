#ifndef PATH_RECONSTRUCTION_H
#define PATH_RECONSTRUCTION_H

#include "crafting_types.h"

// Reconstruct complete path by backtracking from leaf to root
CraftingPath* reconstruct_path(const CraftingNode* leaf_node);

// Free a crafting path
void free_crafting_path(CraftingPath* path);

// Extract best N paths from tree
CraftingResult* extract_best_paths(CraftingNode* root, int max_paths);

// Free crafting result
void free_crafting_result(CraftingResult* result);

#endif // PATH_RECONSTRUCTION_H
