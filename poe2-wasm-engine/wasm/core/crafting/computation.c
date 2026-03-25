#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <pthread.h>

#include "computation.h"
#include "../threads/threads.h"


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

// ─────────────────────────────────────────
// Action validity
// ─────────────────────────────────────────

int action_is_valid(const ItemInstance* item, CraftActionType action)
{
    switch (action)
    {
        case ACTION_TRANSMUTE:
            return item->rarity == RARITY_NORMAL;

        case ACTION_AUGMENTATION:
            return item->rarity == RARITY_MAGIC
                && (item->prefix_count + item->suffix_count) < 2;

        case ACTION_REGAL:
            return item->rarity == RARITY_MAGIC;

        case ACTION_ANNULMENT:
            return (item->rarity == RARITY_MAGIC || item->rarity == RARITY_RARE)
                && (item->prefix_count + item->suffix_count) > 0;

        case ACTION_EXALT:
            return item->rarity == RARITY_RARE
                && (item->prefix_count + item->suffix_count) < 6;

        case ACTION_CHAOS:
            return item->rarity == RARITY_RARE
				&& (item->prefix_count + item->suffix_count) > 0;

        case ACTION_ESSENCE:
            return item->rarity == RARITY_NORMAL;
		
		case ACTION_PERFECT_ESSENCE:
			return item->rarity == RARITY_RARE
				&& (item->prefix_count + item->suffix_count) < 1;

        default:
            return 0;
    }
}

// ─────────────────────────────────────────
// Scoring — TODO
// ─────────────────────────────────────────

int score_item(const ItemInstance* current, const ItemInstance* target)
{
    int score = 0;

    // TODO

    (void)current; (void)target;
    return score;
}

// ─────────────────────────────────────────
// Pruning — TODO
// ─────────────────────────────────────────

int should_prune(CraftNode* node, SearchTree* tree, const ItemInstance* target, int max_depth)
{
    // TODO

    (void)node; (void)tree; (void)target; (void)max_depth;
    return 0;
}

// ─────────────────────────────────────────
// Apply action — TODO
// ─────────────────────────────────────────

ItemInstance* apply_action(const ItemInstance* item, CraftActionType action)
{
    ItemInstance* next = copy_item_instance(item);
    if (!next) return NULL;

    switch (action)
    {
        case ACTION_TRANSMUTE:    /* TODO */ break;
        case ACTION_AUGMENTATION: /* TODO */ break;
        case ACTION_REGAL:        /* TODO */ break;
        case ACTION_ANNULMENT:    /* TODO */ break;
        case ACTION_EXALT:        /* TODO */ break;
        case ACTION_CHAOS:        /* TODO */ break;
        case ACTION_ESSENCE:      /* TODO */ break;
		case ACTION_PERFECT_ESSENCE: /* TODO */ break;
        default:
            free_item_instance(next);
            return NULL;
    }

    return next;
}

// ─────────────────────────────────────────
// Build history
// ─────────────────────────────────────────

HistoryStep* build_history(CraftNode* best_node, int* out_step_count)
{
    if (!best_node) {
        *out_step_count = 0;
        return NULL;
    }

    int depth = best_node->depth;
    *out_step_count = depth + 1;

    HistoryStep* steps = malloc(sizeof(HistoryStep) * (*out_step_count));
    if (!steps) return NULL;

    CraftNode* cur = best_node;
    for (int i = depth; i >= 0; i--)
    {
        steps[i].step          = i;
        steps[i].action        = cur->action;
        steps[i].score         = cur->score;
        steps[i].item_snapshot = copy_item_instance(cur->item_state);
        cur = cur->parent;
    }

    return steps;
}

// ─────────────────────────────────────────
// Compute
// ─────────────────────────────────────────

CraftResult* compute(ItemInstance* initial_item, ItemInstance* target, int num_threads, int max_depth)
{
    SearchTree* tree = create_tree(initial_item);
    if (!tree) return NULL;

    WorkQueue* queue = create_queue();
    if (!queue) {
        free_tree_struct(tree);
        return NULL;
    }
    queue_push(queue, tree->root);

    WorkerArgs* args = malloc(sizeof(WorkerArgs) * num_threads);
    if (!args) {
        free_queue(queue);
        free_tree_struct(tree);
        return NULL;
    }

    for (int t = 0; t < num_threads; t++)
    {
        args[t].queue     = queue;
        args[t].tree      = tree;
        args[t].target    = target;
        args[t].max_depth = max_depth;
    }

    run_thread_pool(queue, args, num_threads);

    free(args);
    free_queue(queue);

    CraftResult* result = malloc(sizeof(CraftResult));
    if (!result) {
        free_tree_struct(tree);
        return NULL;
    }

    result->steps          = build_history(tree->best_node, &result->step_count);
    result->final_score    = tree->best_score;
    result->nodes_explored = 0;
    result->nodes_pruned   = 0;

    free_tree_struct(tree);

    return result;
}

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────

void free_result(CraftResult* result)
{
    if (!result) return;
    for (int i = 0; i < result->step_count; i++)
        free_item_instance(result->steps[i].item_snapshot);
    free(result->steps);
    free(result);
}