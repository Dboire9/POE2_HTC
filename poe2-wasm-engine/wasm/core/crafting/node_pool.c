#include "node_pool.h"
#include <stdlib.h>
#include <string.h>

NodePool* create_node_pool(int initial_capacity) {
    NodePool* pool = (NodePool*)malloc(sizeof(NodePool));
    if (!pool) return NULL;
    
    pool->capacity = initial_capacity;
    pool->used = 0;
    pool->nodes = (CraftingNode*)malloc(initial_capacity * sizeof(CraftingNode));
    
    if (!pool->nodes) {
        free(pool);
        return NULL;
    }
    
    // Zero-initialize all nodes
    memset(pool->nodes, 0, initial_capacity * sizeof(CraftingNode));
    
    return pool;
}

CraftingNode* allocate_node(NodePool* pool) {
    if (!pool) return NULL;
    
    // Expand pool if necessary
    if (pool->used >= pool->capacity) {
        int new_capacity = pool->capacity * 2;
        CraftingNode* new_nodes = (CraftingNode*)realloc(
            pool->nodes,
            new_capacity * sizeof(CraftingNode)
        );
        
        if (!new_nodes) return NULL;
        
        // Zero-initialize new section
        memset(new_nodes + pool->capacity, 0, 
               (new_capacity - pool->capacity) * sizeof(CraftingNode));
        
        pool->nodes = new_nodes;
        pool->capacity = new_capacity;
    }
    
    // Return next available node
    CraftingNode* node = &pool->nodes[pool->used++];
    
    // Reset node to clean state
    node->parent = NULL;
    node->children = NULL;
    node->children_count = 0;
    node->children_capacity = 0;
    node->is_pruned = false;
    node->has_valid_children = false;
    node->is_solution = false;
    
    return node;
}

void get_pool_stats(const NodePool* pool, int* used_out, int* capacity_out) {
    if (!pool) return;
    if (used_out) *used_out = pool->used;
    if (capacity_out) *capacity_out = pool->capacity;
}

void free_node_pool(NodePool* pool) {
    if (!pool) return;
    
    // Free all children arrays
    for (int i = 0; i < pool->used; i++) {
        if (pool->nodes[i].children) {
            free(pool->nodes[i].children);
        }
    }
    
    // Free nodes array
    if (pool->nodes) {
        free(pool->nodes);
    }
    
    // Free pool itself
    free(pool);
}
