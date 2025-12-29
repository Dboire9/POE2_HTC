#ifndef NODE_POOL_H
#define NODE_POOL_H

#include "crafting_types.h"

// Create a new node pool with initial capacity
NodePool* create_node_pool(int initial_capacity);

// Allocate a node from the pool (O(1), no malloc)
CraftingNode* allocate_node(NodePool* pool);

// Get current pool statistics
void get_pool_stats(const NodePool* pool, int* used_out, int* capacity_out);

// Free the entire pool
void free_node_pool(NodePool* pool);

#endif // NODE_POOL_H
