#include "node_operations.h"
#include <stdlib.h>
#include <string.h>

void add_child_to_node(CraftingNode* parent, CraftingNode* child) {
    if (!parent || !child) return;
    
    // Expand children array if needed
    if (parent->children_count >= parent->children_capacity) {
        int new_capacity = (parent->children_capacity == 0) ? 8 : parent->children_capacity * 2;
        CraftingNode** new_children = (CraftingNode**)realloc(
            parent->children,
            new_capacity * sizeof(CraftingNode*)
        );
        
        if (!new_children) return;
        
        parent->children = new_children;
        parent->children_capacity = new_capacity;
    }
    
    // Add child
    parent->children[parent->children_count++] = child;
    child->parent = parent;
}

void free_node_children(CraftingNode* node) {
    if (!node || !node->children) return;
    
    // Free the children array (not the nodes themselves, they're in the pool)
    free(node->children);
    node->children = NULL;
    node->children_count = 0;
    node->children_capacity = 0;
}

void free_subtree(CraftingNode* root) {
    if (!root) return;
    
    // Recursively free all children first
    for (int i = 0; i < root->children_count; i++) {
        free_subtree(root->children[i]);
    }
    
    // Free this node's children array
    free_node_children(root);
    
    // Note: Don't free the node itself - it's in the pool
    root->is_pruned = true;
}

int count_tree_nodes(const CraftingNode* root) {
    if (!root) return 0;
    
    int count = 1;  // This node
    for (int i = 0; i < root->children_count; i++) {
        count += count_tree_nodes(root->children[i]);
    }
    
    return count;
}

static void collect_leaf_nodes_recursive(CraftingNode* node, CraftingNode*** leaves, int* count, int* capacity) {
    if (!node) return;
    
    // If no children, it's a leaf
    if (node->children_count == 0 && !node->is_pruned) {
        // Expand array if needed
        if (*count >= *capacity) {
            *capacity = (*capacity == 0) ? 128 : *capacity * 2;
            *leaves = (CraftingNode**)realloc(*leaves, *capacity * sizeof(CraftingNode*));
        }
        (*leaves)[(*count)++] = node;
        return;
    }
    
    // Recurse on children
    for (int i = 0; i < node->children_count; i++) {
        collect_leaf_nodes_recursive(node->children[i], leaves, count, capacity);
    }
}

CraftingNode** find_leaf_nodes(CraftingNode* root, int* count_out) {
    if (!root || !count_out) return NULL;
    
    CraftingNode** leaves = NULL;
    int count = 0;
    int capacity = 0;
    
    collect_leaf_nodes_recursive(root, &leaves, &count, &capacity);
    
    *count_out = count;
    return leaves;
}

static int compare_nodes_by_score(const void* a, const void* b) {
    const CraftingNode* node_a = *(const CraftingNode**)a;
    const CraftingNode* node_b = *(const CraftingNode**)b;
    
    // Sort descending (higher score first)
    if (node_b->score > node_a->score) return 1;
    if (node_b->score < node_a->score) return -1;
    
    // Tie-breaker: higher probability
    if (node_b->cumulative_probability > node_a->cumulative_probability) return 1;
    if (node_b->cumulative_probability < node_a->cumulative_probability) return -1;
    
    return 0;
}

void sort_children_by_score(CraftingNode* node) {
    if (!node || node->children_count <= 1) return;
    
    qsort(node->children, node->children_count, sizeof(CraftingNode*), compare_nodes_by_score);
}

void keep_top_n_children(CraftingNode* node, int n) {
    if (!node || node->children_count <= n) return;
    
    // Prune children beyond top N
    for (int i = n; i < node->children_count; i++) {
        node->children[i]->is_pruned = true;
    }
    
    // Update count
    node->children_count = n;
}
