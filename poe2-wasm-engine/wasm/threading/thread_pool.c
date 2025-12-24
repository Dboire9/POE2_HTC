#include "thread_pool.h"
#include <stdlib.h>
#include <string.h>

static void* worker_thread(void* arg) {
    ThreadPool* pool = (ThreadPool*)arg;
    WorkQueue* queue = pool->queue;
    
    while (true) {
        pthread_mutex_lock(&queue->mutex);
        
        // Wait for work or shutdown
        while (queue->count == 0 && !queue->shutdown) {
            pthread_cond_wait(&queue->cond, &queue->mutex);
        }
        
        if (queue->shutdown && queue->count == 0) {
            pthread_mutex_unlock(&queue->mutex);
            break;
        }
        
        // Get work item
        WorkItem* item = queue->head;
        if (item) {
            queue->head = item->next;
            if (queue->head == NULL) {
                queue->tail = NULL;
            }
            queue->count--;
        }
        
        pthread_mutex_unlock(&queue->mutex);
        
        // Execute work
        if (item) {
            item->function(item->arg);
            free(item);
        }
    }
    
    return NULL;
}

ThreadPool* create_thread_pool(int num_threads) {
    ThreadPool* pool = malloc(sizeof(ThreadPool));
    pool->num_threads = num_threads;
    pool->threads = malloc(sizeof(pthread_t) * num_threads);
    pool->shutdown = false;
    
    // Initialize work queue
    pool->queue = malloc(sizeof(WorkQueue));
    pool->queue->head = NULL;
    pool->queue->tail = NULL;
    pool->queue->count = 0;
    pool->queue->shutdown = false;
    pthread_mutex_init(&pool->queue->mutex, NULL);
    pthread_cond_init(&pool->queue->cond, NULL);
    
    // Create worker threads
    for (int i = 0; i < num_threads; i++) {
        pthread_create(&pool->threads[i], NULL, worker_thread, pool);
    }
    
    return pool;
}

void submit_work(ThreadPool* pool, WorkFunction func, void* arg) {
    WorkItem* item = malloc(sizeof(WorkItem));
    item->function = func;
    item->arg = arg;
    item->next = NULL;
    
    WorkQueue* queue = pool->queue;
    
    pthread_mutex_lock(&queue->mutex);
    
    if (queue->tail) {
        queue->tail->next = item;
    } else {
        queue->head = item;
    }
    queue->tail = item;
    queue->count++;
    
    pthread_cond_signal(&queue->cond);
    pthread_mutex_unlock(&queue->mutex);
}

void wait_for_completion(ThreadPool* pool) {
    WorkQueue* queue = pool->queue;
    
    while (true) {
        pthread_mutex_lock(&queue->mutex);
        int count = queue->count;
        pthread_mutex_unlock(&queue->mutex);
        
        if (count == 0) {
            break;
        }
        
        // Small sleep to avoid busy waiting
        struct timespec ts = {0, 1000000}; // 1ms
        nanosleep(&ts, NULL);
    }
}

void destroy_thread_pool(ThreadPool* pool) {
    WorkQueue* queue = pool->queue;
    
    // Signal shutdown
    pthread_mutex_lock(&queue->mutex);
    queue->shutdown = true;
    pthread_cond_broadcast(&queue->cond);
    pthread_mutex_unlock(&queue->mutex);
    
    // Wait for threads
    for (int i = 0; i < pool->num_threads; i++) {
        pthread_join(pool->threads[i], NULL);
    }
    
    // Cleanup
    pthread_mutex_destroy(&queue->mutex);
    pthread_cond_destroy(&queue->cond);
    free(queue);
    free(pool->threads);
    free(pool);
}
