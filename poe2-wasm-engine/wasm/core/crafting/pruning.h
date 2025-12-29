#ifndef PRUNING_H
#define PRUNING_H

#include "crafting_types.h"

// Evaluate children and prune node if none are valid
void evaluate_and_prune_node(CraftingNode* node, const CraftingContext* context);

// Propagate pruning to parent if all children are pruned
void propagate_pruning_to_parent(CraftingNode* parent, const CraftingContext* context);

// Get appropriate max children count based on depth
int get_max_children_for_depth(int depth);

// Check if node should stop exploration
bool should_stop_exploring(const CraftingNode* node, const CraftingContext* context);

#endif // PRUNING_H
