#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <pthread.h>

#include "computation.h"


// ─────────────────────────────────────────
// Node management
// ─────────────────────────────────────────

// Initializing the node

CraftNode* create_node(const ItemInstance* item, CraftActionType action, CraftNode* parent, int depth)
{
    CraftNode* node = malloc(sizeof(CraftNode));
    if (!node) return NULL;

    node->item_state  = copy_item_instance(item);
    if (!node->item_state) {
        free(node);
        return NULL;
    }

    node->action      = action;
    node->score       = 0;
    node->depth       = depth;
    node->parent      = parent;
    node->children    = NULL;
    node->child_count = 0;
    node->pruned      = 0;

    return node;
}

// Frees only this node and its item snapshot, NOT its children
void free_node(CraftNode* node)
{
    if (!node) return;
    free_item_instance(node->item_state);
    free(node->children); // just the array of pointers, not the children themselves
    free(node);
}

// Recursive — frees entire subtree rooted at node
void free_tree(CraftNode* root)
{
    if (!root) return;
    for (int i = 0; i < root->child_count; i++)
        free_tree(root->children[i]);
    free_node(root);
}

// ─────────────────────────────────────────
// Search tree management
// ─────────────────────────────────────────

// This is the root of the tree we will create as we explore the possibilities

SearchTree* create_tree(ItemInstance* initial_item)
{
    SearchTree* tree = malloc(sizeof(SearchTree));
    if (!tree) return NULL;

    tree->root = create_node(initial_item, ACTION_COUNT, NULL, 0);
    if (!tree->root) {
        free(tree);
        return NULL;
    }

    tree->best_node  = NULL;
    tree->best_score = INT_MIN;

    if (pthread_mutex_init(&tree->best_mutex, NULL) != 0) {
        free_tree(tree->root);
        free(tree);
        return NULL;
    }

    return tree;
}

void free_tree_struct(SearchTree* tree)
{
    if (!tree) return;
    free_tree(tree->root);
    pthread_mutex_destroy(&tree->best_mutex);
    free(tree);
}