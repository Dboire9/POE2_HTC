#include "crafting_algorithm.h"
#include "node_pool.h"
#include "node_operations.h"
#include "heuristic.h"
#include "path_reconstruction.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/**
 * Main crafting algorithm implementation
 * This is a simplified A* search for crafting paths
 */
CraftingResult* run_crafting_algorithm(const CraftingContext* context, const ItemState* initial_state) {
    if (!context || !initial_state) {
        printf("ERROR: Invalid parameters to run_crafting_algorithm\n");
        return NULL;
    }
    
    printf("\n========================================\n");
    printf("STARTING CRAFTING ALGORITHM\n");
    printf("========================================\n");
    printf("Initial State:\n");
    printf("  - Rarity: %d\n", initial_state->rarity);
    printf("  - Prefixes: %d\n", initial_state->prefix_count);
    for (int i = 0; i < initial_state->prefix_count; i++) {
        printf("    [%d] ID=%d, Tier=%d\n", i, 
               initial_state->prefixes[i].modifier_id, 
               initial_state->prefixes[i].tier);
    }
    printf("  - Suffixes: %d\n", initial_state->suffix_count);
    for (int i = 0; i < initial_state->suffix_count; i++) {
        printf("    [%d] ID=%d, Tier=%d\n", i, 
               initial_state->suffixes[i].modifier_id, 
               initial_state->suffixes[i].tier);
    }
    printf("\nTarget:\n");
    printf("  - Prefixes: %d\n", context->target_prefix_count);
    for (int i = 0; i < context->target_prefix_count; i++) {
        printf("    [%d] ID=%d, Tier=%d\n", i, 
               context->target_prefix_ids[i], 
               context->target_prefix_tiers[i]);
    }
    printf("  - Suffixes: %d\n", context->target_suffix_count);
    for (int i = 0; i < context->target_suffix_count; i++) {
        printf("    [%d] ID=%d, Tier=%d\n", i, 
               context->target_suffix_ids[i], 
               context->target_suffix_tiers[i]);
    }
    printf("========================================\n\n");
    
    // Create node pool for memory management
    NodePool* pool = create_node_pool(NODE_POOL_INITIAL_SIZE);
    if (!pool) {
        printf("ERROR: Failed to create node pool\n");
        return NULL;
    }
    
    // Create root node with initial state
    CraftingNode* root = allocate_node(pool);
    if (!root) {
        printf("ERROR: Failed to allocate root node\n");
        free_node_pool(pool);
        return NULL;
    }
    
    // Initialize root node
    memcpy(&root->state, initial_state, sizeof(ItemState));
    root->cumulative_probability = 1.0;
    root->score = calculate_heuristic(initial_state, context);
    root->prev_score = 0.0;
    root->depth = 0;
    root->parent = NULL;
    root->children = NULL;
    root->children_count = 0;
    root->children_capacity = 0;
    root->is_pruned = false;
    root->has_valid_children = false;
    root->is_solution = matches_target(initial_state, context);
    
    // Initialize event for root (no action yet)
    root->event.modifier_id = -1;
    root->event.tier = -1;
    root->event.action_type = ACTION_ADDED;
    root->event.currency_name = "Initial";
    root->event.probability = 1.0;
    
    printf("Root node created with score: %.2f\n", root->score);
    printf("Is initial state already a solution? %s\n\n", root->is_solution ? "YES" : "NO");
    
    // Create result structure
    CraftingResult* result = (CraftingResult*)malloc(sizeof(CraftingResult));
    if (!result) {
        printf("ERROR: Failed to create result structure\n");
        free_node_pool(pool);
        return NULL;
    }
    
    result->count = 0;
    result->capacity = 0;
    result->paths = NULL;
    
    // If initial state is already a solution, return it
    if (root->is_solution) {
        printf("Initial state matches target! No crafting needed.\n");
        CraftingPath* path = reconstruct_path(root);
        if (path) {
            // Allocate space for one path
            result->paths = (CraftingPath*)malloc(sizeof(CraftingPath));
            if (result->paths) {
                result->paths[0] = *path;
                result->count = 1;
                result->capacity = 1;
                free(path);
            }
        }
        free_node_pool(pool);
        return result;
    }
    
    // TODO: Implement the main search loop here
    // This would explore possible crafting actions and build the tree
    // For now, return empty result indicating no path found
    
    printf("Algorithm completed. Solutions found: %d\n", result->count);
    printf("========================================\n\n");
    
    free_node_pool(pool);
    return result;
}

void free_crafting_result_full(CraftingResult* result) {
    if (!result) return;
    
    for (int i = 0; i < result->count; i++) {
        free_crafting_path(&result->paths[i]);
    }
    
    free_crafting_result(result);
}
