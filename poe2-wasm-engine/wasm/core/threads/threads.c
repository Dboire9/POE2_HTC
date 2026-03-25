#include <stdlib.h>
#include <pthread.h>

#include "threads.h"
#include "computation.h"
#include "items.h"

// ─────────────────────────────────────────
// Work queue
// ─────────────────────────────────────────

WorkQueue* create_queue(void)
{
    WorkQueue* q = malloc(sizeof(WorkQueue));
    if (!q) return NULL;

    q->head           = NULL;
    q->tail           = NULL;
    q->size           = 0;
    q->active_workers = 0;
    q->done           = 0;

    if (pthread_mutex_init(&q->mutex, NULL) != 0) {
        free(q);
        return NULL;
    }
    if (pthread_cond_init(&q->cond, NULL) != 0) {
        pthread_mutex_destroy(&q->mutex);
        free(q);
        return NULL;
    }

    return q;
}

void queue_push(WorkQueue* q, CraftNode* node)
{
    WorkQueueNode* qnode = malloc(sizeof(WorkQueueNode));
    if (!qnode) return;

    qnode->craft_node = node;
    qnode->next       = NULL;

    pthread_mutex_lock(&q->mutex);

    if (q->tail)
        q->tail->next = qnode;
    else
        q->head = qnode;

    q->tail = qnode;
    q->size++;

    pthread_cond_signal(&q->cond);
    pthread_mutex_unlock(&q->mutex);
}

CraftNode* queue_pop(WorkQueue* q)
{
    pthread_mutex_lock(&q->mutex);

    while (q->size == 0 && !q->done)
        pthread_cond_wait(&q->cond, &q->mutex);

    if (q->size == 0 && q->done) {
        pthread_mutex_unlock(&q->mutex);
        return NULL;
    }

    WorkQueueNode* qnode = q->head;
    q->head = qnode->next;
    if (!q->head) q->tail = NULL;
    q->size--;
    q->active_workers++;

    pthread_mutex_unlock(&q->mutex);

    CraftNode* node = qnode->craft_node;
    free(qnode);
    return node;
}

void queue_finish_item(WorkQueue* q)
{
    pthread_mutex_lock(&q->mutex);
    q->active_workers--;

    if (q->size == 0 && q->active_workers == 0) {
        q->done = 1;
        pthread_cond_broadcast(&q->cond);
    }

    pthread_mutex_unlock(&q->mutex);
}

void free_queue(WorkQueue* q)
{
    if (!q) return;

    WorkQueueNode* cur = q->head;
    while (cur) {
        WorkQueueNode* next = cur->next;
        free(cur);
        cur = next;
    }

    pthread_mutex_destroy(&q->mutex);
    pthread_cond_destroy(&q->cond);
    free(q);
}

// ─────────────────────────────────────────
// Worker thread
// ─────────────────────────────────────────

static void try_update_best(SearchTree* tree, CraftNode* node)
{
    pthread_mutex_lock(&tree->best_mutex);
    if (node->score > tree->best_score) {
        tree->best_score = node->score;
        tree->best_node  = node;
    }
    pthread_mutex_unlock(&tree->best_mutex);
}

static void* worker_thread(void* arg)
{
    WorkerArgs* args = (WorkerArgs*)arg;

    while (1)
    {
        CraftNode* node = queue_pop(args->queue);
        if (!node) break;

        // Score this node
        node->score = score_item(node->item_state, args->target);
        try_update_best(args->tree, node);

        // Prune check
        if (node->depth >= args->max_depth
        ||  should_prune(node, args->tree, args->target, args->max_depth))
        {
            node->pruned = 1;
            queue_finish_item(args->queue);
            continue;
        }

        // Expand
        node->children = malloc(sizeof(CraftNode*) * ACTION_COUNT);
        if (!node->children) {
            queue_finish_item(args->queue);
            continue;
        }
        node->child_count = 0;

        for (int a = 0; a < ACTION_COUNT; a++)
        {
            if (!action_is_valid(node->item_state, (CraftActionType)a)) continue;

            ItemInstance* next_item = apply_action(node->item_state, (CraftActionType)a);
            if (!next_item) continue;

            CraftNode* child = create_node(next_item, (CraftActionType)a, node, node->depth + 1);
            free_item_instance(next_item);
            if (!child) continue;

            node->children[node->child_count++] = child;
            queue_push(args->queue, child);
        }

        queue_finish_item(args->queue);
    }

    return NULL;
}

// ─────────────────────────────────────────
// Thread pool
// ─────────────────────────────────────────

void run_thread_pool(WorkQueue* q, WorkerArgs* args, int num_threads)
{
    pthread_t* threads = malloc(sizeof(pthread_t) * num_threads);
    if (!threads) return;

    for (int t = 0; t < num_threads; t++)
        pthread_create(&threads[t], NULL, worker_thread, &args[t]);

    for (int t = 0; t < num_threads; t++)
        pthread_join(threads[t], NULL);

    free(threads);
}