#ifndef NODE_OPERATIONS_H
#define NODE_OPERATIONS_H

#include "crafting_types.h"

// Add a child to a parent node
void add_child_to_node(CraftingNode* parent, CraftingNode* child);

// Free all children of a node (not the node itself)
void free_node_children(CraftingNode* node);

// Recursively free an entire subtree
void free_subtree(CraftingNode* root);

// Count total nodes in a tree
int count_tree_nodes(const CraftingNode* root);

// Find all leaf nodes (nodes with no children)
CraftingNode** find_leaf_nodes(CraftingNode* root, int* count_out);

// Sort children by score (descending)
void sort_children_by_score(CraftingNode* node);

// Keep only top N children, free the rest
void keep_top_n_children(CraftingNode* node, int n);

#endif // NODE_OPERATIONS_H
