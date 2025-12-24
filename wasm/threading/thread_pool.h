#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include <pthread.h>
#include <stdbool.h>

// Forward declarations
typedef struct WorkQueue WorkQueue;
typedef struct ThreadPool ThreadPool;

// Work item function pointer
typedef void* (*WorkFunction)(void* arg);

// Work item
typedef struct WorkItem {
    WorkFunction function;
    void* arg;
    struct WorkItem* next;
} WorkItem;

// Work queue (thread-safe)
struct WorkQueue {
    WorkItem* head;
    WorkItem* tail;
    int count;
    pthread_mutex_t mutex;
    pthread_cond_t cond;
    bool shutdown;
};

// Thread pool
struct ThreadPool {
    pthread_t* threads;
    int num_threads;
    WorkQueue* queue;
    bool shutdown;
};

// Create thread pool
ThreadPool* create_thread_pool(int num_threads);

// Submit work to pool
void submit_work(ThreadPool* pool, WorkFunction func, void* arg);

// Wait for all work to complete
void wait_for_completion(ThreadPool* pool);

// Destroy thread pool
void destroy_thread_pool(ThreadPool* pool);

#endif // THREAD_POOL_H
