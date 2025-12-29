#include "path_reconstruction.h"
#include "node_operations.h"
#include <stdlib.h>
#include <string.h>

CraftingPath* reconstruct_path(const CraftingNode* leaf_node) {
    if (!leaf_node) return NULL;
    
    // Count path length
    int length = 0;
    const CraftingNode* node = leaf_node;
    while (node->parent != NULL) {
        length++;
        node = node->parent;
    }
    
    // Allocate path
    CraftingPath* path = (CraftingPath*)malloc(sizeof(CraftingPath));
    if (!path) return NULL;
    
    path->step_count = length;
    path->steps = (ModifierEvent*)malloc(length * sizeof(ModifierEvent));
    if (!path->steps) {
        free(path);
        return NULL;
    }
    
    // Fill path by backtracking (reverse order)
    node = leaf_node;
    int index = length - 1;
    while (node->parent != NULL) {
        path->steps[index--] = node->event;
        node = node->parent;
    }
    
    // Store final state and stats
    path->final_state = leaf_node->state;
    path->final_probability = leaf_node->cumulative_probability;
    path->final_score = leaf_node->score;
    
    return path;
}

void free_crafting_path(CraftingPath* path) {
    if (!path) return;
    if (path->steps) free(path->steps);
    free(path);
}

static int compare_leaves_by_score(const void* a, const void* b) {
    const CraftingNode* node_a = *(const CraftingNode**)a;
    const CraftingNode* node_b = *(const CraftingNode**)b;
    
    // Primary: score
    if (node_b->score > node_a->score) return 1;
    if (node_b->score < node_a->score) return -1;
    
    // Secondary: probability
    if (node_b->cumulative_probability > node_a->cumulative_probability) return 1;
    if (node_b->cumulative_probability < node_a->cumulative_probability) return -1;
    
    return 0;
}

CraftingResult* extract_best_paths(CraftingNode* root, int max_paths) {
    if (!root) return NULL;
    
    // Find all leaf nodes
    int leaf_count;
    CraftingNode** leaves = find_leaf_nodes(root, &leaf_count);
    
    if (!leaves || leaf_count == 0) {
        if (leaves) free(leaves);
        return NULL;
    }
    
    // Sort leaves by score
    qsort(leaves, leaf_count, sizeof(CraftingNode*), compare_leaves_by_score);
    
    // Create result
    CraftingResult* result = (CraftingResult*)malloc(sizeof(CraftingResult));
    if (!result) {
        free(leaves);
        return NULL;
    }
    
    int paths_to_extract = (leaf_count < max_paths) ? leaf_count : max_paths;
    result->capacity = paths_to_extract;
    result->count = 0;
    result->paths = (CraftingPath*)malloc(paths_to_extract * sizeof(CraftingPath));
    
    if (!result->paths) {
        free(result);
        free(leaves);
        return NULL;
    }
    
    // Reconstruct top N paths
    for (int i = 0; i < paths_to_extract; i++) {
        CraftingPath* path = reconstruct_path(leaves[i]);
        if (path) {
            result->paths[result->count++] = *path;
            free(path);  // Free wrapper, data is copied
        }
    }
    
    free(leaves);
    return result;
}

void free_crafting_result(CraftingResult* result) {
    if (!result) return;
    
    for (int i = 0; i < result->count; i++) {
        if (result->paths[i].steps) {
            free(result->paths[i].steps);
        }
    }
    
    if (result->paths) free(result->paths);
    free(result);
}
