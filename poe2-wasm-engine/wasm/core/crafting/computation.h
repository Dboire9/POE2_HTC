#ifndef COMPUTATION_H
#define COMPUTATION_H

#include <limits.h>
#include <pthread.h>
#include "../items/items.h"
#include "../modifiers/modifiers.h"

// ─────────────────────────────────────────
// Currency actions
// ─────────────────────────────────────────

typedef enum {
    ACTION_TRANSMUTE,
    ACTION_AUGMENTATION,
    ACTION_REGAL,
    ACTION_ANNULMENT,
    ACTION_EXALT,
    ACTION_CHAOS,
    ACTION_ESSENCE,
	ACTION_PERFECT_ESSENCE,
    ACTION_COUNT
} CraftActionType;

// ─────────────────────────────────────────
// Search tree node
// ─────────────────────────────────────────

typedef struct CraftNode {
    ItemInstance*       item_state;
    CraftActionType     action;
    int                 score;
    int                 depth;
    struct CraftNode*   parent;
    struct CraftNode**  children;
    int                 child_count;
    int                 pruned;
} CraftNode;

// ─────────────────────────────────────────
// Search tree
// ─────────────────────────────────────────

typedef struct {
    CraftNode*      root;
    CraftNode*      best_node;
    int             best_score;
    pthread_mutex_t best_mutex;
} SearchTree;

// ─────────────────────────────────────────
// History
// ─────────────────────────────────────────

typedef struct {
    int             step;
    CraftActionType action;
    int             score;
    ItemInstance*   item_snapshot;
} HistoryStep;

// ─────────────────────────────────────────
// Result
// ─────────────────────────────────────────

typedef struct {
    HistoryStep*    steps;
    int             step_count;
    int             final_score;
    int             nodes_explored;
    int             nodes_pruned;
} CraftResult;

// ─────────────────────────────────────────
// Node API
// ─────────────────────────────────────────

CraftNode*    create_node(const ItemInstance* item, CraftActionType action, CraftNode* parent, int depth);
void          free_node(CraftNode* node);
void          free_tree(CraftNode* root);

// ─────────────────────────────────────────
// Tree API
// ─────────────────────────────────────────

SearchTree*   create_tree(ItemInstance* initial_item);
void          free_tree_struct(SearchTree* tree);

// ─────────────────────────────────────────
// Internals used by threads.c
// ─────────────────────────────────────────

int           score_item(const ItemInstance* current, const ItemInstance* target);
int           should_prune(CraftNode* node, SearchTree* tree, const ItemInstance* target, int max_depth);
int           action_is_valid(const ItemInstance* item, CraftActionType action);
ItemInstance* apply_action(const ItemInstance* item, CraftActionType action);

// ─────────────────────────────────────────
// Main API
// ─────────────────────────────────────────

CraftResult*  compute(ItemInstance* initial_item, ItemInstance* target, int num_threads, int max_depth);
void          free_result(CraftResult* result);
HistoryStep*  build_history(CraftNode* best_node, int* out_step_count);

#endif // COMPUTATION_H