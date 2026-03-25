#ifndef THREADS_H
#define THREADS_H

#include <pthread.h>
#include "../crafting/computation.h"

// ─────────────────────────────────────────
// Work queue node (linked list)
// ─────────────────────────────────────────

typedef struct WorkQueueNode {
    CraftNode*            craft_node;
    struct WorkQueueNode* next;
} WorkQueueNode;

// ─────────────────────────────────────────
// Work queue
// ─────────────────────────────────────────

typedef struct {
    WorkQueueNode*  head;
    WorkQueueNode*  tail;
    int             size;
    int             active_workers;
    int             done;
    pthread_mutex_t mutex;
    pthread_cond_t  cond;
} WorkQueue;

// ─────────────────────────────────────────
// Thread worker arguments
// ─────────────────────────────────────────

typedef struct {
    WorkQueue*      queue;
    SearchTree*     tree;
    ItemInstance*   target;
    int             max_depth;
} WorkerArgs;

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────

WorkQueue*  create_queue(void);
void        queue_push(WorkQueue* q, CraftNode* node);
CraftNode*  queue_pop(WorkQueue* q);
void        queue_finish_item(WorkQueue* q);
void        free_queue(WorkQueue* q);

void        run_thread_pool(WorkQueue* q, WorkerArgs* args, int num_threads);

#endif // THREADS_H